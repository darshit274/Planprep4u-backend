const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { LeaderboardEntry, TestSeries, User, Test, TestSession, SubCategory, Category, Question, UserAnswer, sequelize } = require('../models');
const { authToken } = require('../utils/AuthToken');

/**
 * Quiz submission endpoint.
 * Auth required. Correctness is computed server-side from Question.correct_answer;
 * any client-supplied `isCorrect` field is ignored.
 */
router.post('/submit', authToken, async (req, res) => {
    try {
        const {
            testSeriesId, // This is the category UUID (web flow) or test-series UUID (mobile flow)
            categoryUuid,
            answers: rawAnswers = [],
            totalTimeSpent = 120,
            markedForReviewCount = 0,
            totalQuestions: frontendTotalQuestions
        } = req.body;

        // userId always comes from the authenticated session — never from the request body
        const userId = req.user.uuid;

        // === Server-side correctness ===
        // Fetch every question referenced by the submission (with its category for
        // negative-marking config) in one query, then recompute isCorrect from the
        // DB. Client-supplied isCorrect is ignored.
        const referencedQuestionIds = [...new Set(
            rawAnswers.map(a => a && a.questionId).filter(Boolean)
        )];

        const questionRows = referencedQuestionIds.length > 0
            ? await Question.findAll({
                where: { id: referencedQuestionIds, is_active: true },
                attributes: ['id', 'correct_answer', 'marks', 'category_id'],
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'negative_marking_enabled', 'negative_marks_per_wrong'],
                }],
            })
            : [];
        const questionMap = new Map(questionRows.map(q => [q.id, q]));

        // Scoring rules (per client spec, change #4):
        //   correct A–D            → +question.marks
        //   wrong A–D              → -category.negative_marks_per_wrong (if enabled)
        //   selectedOption === 'E' → 0 (explicit "skip — don't want to answer", no penalty)
        //   selectedOption == null → -category.negative_marks_per_wrong (unattempted, treated like wrong)
        const answers = rawAnswers.map(a => {
            const q = a && a.questionId ? questionMap.get(a.questionId) : null;
            const selectedOption = a ? a.selectedOption : null;
            const isE = selectedOption === 'E';
            const isAttempted = selectedOption !== null && selectedOption !== undefined && selectedOption !== '';
            const isCorrect = !!(q && isAttempted && !isE && selectedOption === q.correct_answer);
            return {
                questionId: a ? a.questionId : null,
                selectedOption,
                isE,
                isAttempted,
                isCorrect,
                timeSpent: a && typeof a.timeSpent === 'number' ? a.timeSpent : 0,
                markedForReview: !!(a && a.markedForReview),
            };
        });

        const totalQuestions = frontendTotalQuestions || answers.length;
        const correctAnswers = answers.filter(a => a.isCorrect).length;
        const eSkippedAnswers = answers.filter(a => a.isE).length;
        // "Answered" counts only A–D selections; E is a deliberate skip, not an answer.
        const answeredQuestions = answers.filter(a => a.isAttempted && !a.isE).length;
        const wrongAnswers = answeredQuestions - correctAnswers;
        const unansweredQuestions = totalQuestions - answeredQuestions - eSkippedAnswers;

        const user = await User.findOne({ where: { uuid: userId } });
        if (!user) {
            // Should be impossible after authToken — included as a defence-in-depth check.
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Handle both mobile app and web app flows:
        // 1. Mobile app: sends TestSeries UUID as testSeriesId + Category UUID as categoryUuid
        // 2. Web app: sends Category UUID as testSeriesId (no categoryUuid)

        let category = null;
        let testSeries = null;

        // Try to find category using categoryUuid first (mobile app flow)
        if (categoryUuid) {
            console.log('🔍 Mobile app flow: Finding category by categoryUuid:', categoryUuid);
            category = await Category.findOne({
                where: { uuid: categoryUuid },
                include: [{
                    model: TestSeries,
                    as: 'testSeries'
                }]
            });

            if (category) {
                testSeries = category.testSeries;
                console.log('✅ Found category via categoryUuid:', {
                    categoryId: category.id,
                    categoryName: category.name,
                    categoryUuid: category.uuid,
                    testSeriesName: testSeries?.name
                });
            }
        }

        // If not found by categoryUuid, try testSeriesId as Category UUID (web app flow)
        if (!category) {
            console.log('🔍 Web app flow: Finding category by testSeriesId as Category UUID:', testSeriesId);
            category = await Category.findOne({
                where: { uuid: testSeriesId },
                include: [{
                    model: TestSeries,
                    as: 'testSeries'
                }]
            });

            if (category) {
                testSeries = category.testSeries;
                console.log('✅ Found category via testSeriesId:', {
                    categoryId: category.id,
                    categoryName: category.name,
                    categoryUuid: category.uuid,
                    testSeriesName: testSeries?.name
                });
            }
        }

        // If still not found, try testSeriesId as actual TestSeries UUID (mobile app with correct flow)
        if (!testSeries) {
            console.log('🔍 Alternative flow: Finding TestSeries by testSeriesId as TestSeries UUID:', testSeriesId);
            testSeries = await TestSeries.findOne({
                where: { uuid: testSeriesId }
            });

            if (testSeries && categoryUuid) {
                // We have TestSeries but need the Category
                category = await Category.findOne({
                    where: { uuid: categoryUuid },
                    include: [{
                        model: TestSeries,
                        as: 'testSeries'
                    }]
                });

                console.log('✅ Found TestSeries and Category separately:', {
                    testSeriesName: testSeries.name,
                    categoryName: category?.name
                });
            }
        }

        // Final validation
        if (!category) {
            console.error(`❌ Category not found. testSeriesId: ${testSeriesId}, categoryUuid: ${categoryUuid}`);
            return res.status(404).json({
                success: false,
                message: 'Category not found',
                error: `No category found with testSeriesId: ${testSeriesId} or categoryUuid: ${categoryUuid}`
            });
        }

        if (!testSeries) {
            console.error(`❌ TestSeries not found for category: ${category.name}`);
            return res.status(404).json({
                success: false,
                message: 'Test series not found for this category'
            });
        }

        console.log('✅ Final resolved data:', {
            categoryId: category.id,
            categoryName: category.name,
            categoryUuid: category.uuid,
            testSeriesId: testSeries.id,
            testSeriesName: testSeries.name,
            testSeriesUuid: testSeries.uuid
        });

        console.log('🔍 TEST SERIES DATABASE VALUES:', {
            uuid: testSeries.uuid,
            name: testSeries.name,
            has_negative_marking: testSeries.has_negative_marking,
            negative_marks: testSeries.negative_marks,
            negativeMarksType: typeof testSeries.negative_marks
        });

        // === Score calculation (uses the bulk-fetched questionMap, no N+1) ===
        let obtainedMarks = 0;
        let totalMarks = 0;
        let negativeMarks = 0;
        // Track the most recently observed per-wrong rate so the response can echo
        // it back (kept for backwards-compatibility with the old payload).
        let negative_marks_per_wrong = 0;

        for (const answer of answers) {
            if (!answer.questionId) continue;
            const q = questionMap.get(answer.questionId);
            if (!q) continue;

            const questionMarks = q.marks || 1;
            totalMarks += questionMarks;

            if (answer.isCorrect) {
                obtainedMarks += questionMarks;
                continue;
            }

            // E (deliberate skip) is neutral — no positive, no penalty.
            if (answer.isE) continue;

            // Wrong A–D, or completely unattempted: penalty if this question's
            // category has negative marking enabled. Same rate either way.
            const cat = q.category;
            if (cat && cat.negative_marking_enabled) {
                const rate = parseFloat(cat.negative_marks_per_wrong) || 0;
                negativeMarks += rate;
                negative_marks_per_wrong = rate;
            }
        }

        // Fallback if no questions resolved (shouldn't happen): assume 1 mark each
        if (totalMarks === 0) {
            obtainedMarks = correctAnswers;
            totalMarks = totalQuestions;
        }

        const finalScore = obtainedMarks - negativeMarks;
        const score = finalScore;
        // Accuracy = correct / answered (A–D), unchanged from before.
        const percentage = answeredQuestions > 0
            ? Math.round((correctAnswers / answeredQuestions) * 100)
            : 0;
        const accuracy = percentage;

        // Use the existing category (already fetched above with testSeries)
        // No need to create fake categories anymore!

        // Find or create a subcategory for this category (for backward compatibility with Test model)
        let subCategory = await SubCategory.findOne({
            where: { category_id: category.id }
        });

        if (!subCategory) {
            // Create a default subcategory if none exists (one-time per category)
            subCategory = await SubCategory.create({
                category_id: category.id,
                name: `${category.name} - Questions`,
                description: `Questions for ${category.name}`,
                is_active: true
            });
            console.log(`✅ Created default subcategory for category: ${category.name}`);
        }

        // Create a test session record (required for LeaderboardEntry and history)
        // Use the category name for better identification
        const test = await Test.create({
            title: category.name,
            instructions: category.instructions || 'Quiz taken through frontend',
            duration_minutes: category.test_duration_minutes || Math.ceil(totalTimeSpent / 60),
            total_questions: totalQuestions,
            total_marks: totalQuestions,
            passing_marks: Math.ceil(totalQuestions * 0.6),
            negative_marking_enabled: category.negative_marking_enabled || negativeMarks > 0,
            negative_marks_per_wrong: category.negative_marks_per_wrong || 0,
            is_active: true,
            sub_category_id: subCategory.id
        });

        console.log(`✅ Created test session record: ${test.title}`);
        // Create a test session with test history fields
        const testSession = await TestSession.create({
            id: uuidv4(),
            user_id: userId,
            test_id: test.id,
            status: 'completed',
            started_at: new Date(Date.now() - totalTimeSpent * 1000),
            completed_at: new Date(),
            is_completed: true,
            is_submitted: true,
            calculated_score: score,
            total_correct: correctAnswers,
            total_wrong: wrongAnswers,
            total_unanswered: unansweredQuestions,
            total_marked_for_review: markedForReviewCount,
            total_questions: totalQuestions,
            time_spent_seconds: totalTimeSpent,
            final_score: finalScore?? score,
            percentage: percentage,
            // Test history fields
            test_name: test.title,
            category_name: category.name,
            total_marks: totalMarks,
            obtained_marks: obtainedMarks,
            negative_marks: negativeMarks,
            attempted_questions: answeredQuestions,
            accuracy: accuracy,
            negative_marks_per_wrong: negative_marks_per_wrong,
            // IMPORTANT: Store the actual DynamicCategory UUID for test history grouping
            session_data: {
                category_uuid: categoryUuid || testSeriesId, // Use categoryUuid if provided, fallback to testSeriesId
                submission_source: 'dynamic_category_quiz'
            }
        });

        console.log(`✅ Created TestSession: ${testSession.id}`);

        // Save individual answers to UserAnswer table
        // This enables session-based solution retrieval and tracking user progress
        try {
            const answerPromises = answers.map(async (answer) => {
                return await UserAnswer.create({
                    test_session_id: testSession.id,
                    question_id: answer.questionId,
                    selected_option: answer.selectedOption, // Can be null for not attempted
                    is_correct: answer.isCorrect || false,
                    is_flagged: answer.markedForReview || false, // Save marked for review status
                    is_visited: answer.selectedOption !== null, // Track if question was visited
                    time_spent: answer.timeSpent || 0
                });
            });

            await Promise.all(answerPromises);
            console.log(`✅ Saved ${answers.length} UserAnswer records for session ${testSession.id}`);
        } catch (userAnswerError) {
            console.error('Error saving UserAnswer records:', userAnswerError);
            // Don't fail the submission if UserAnswer save fails
            // The TestSession and leaderboard entry are already created
        }

        // Create leaderboard entry directly
        const leaderboardEntry = await LeaderboardEntry.create({
            user_id: userId,
            test_id: test.id, // Use the created test ID
            test_session_id: testSession.id,
            test_series_id: null, // Set to null to avoid foreign key issues for now
            category_id: null,
            score: score,
            final_score: finalScore,
            percentage: percentage,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            wrong_answers: wrongAnswers,
            unanswered: unansweredQuestions,
            time_taken_seconds: totalTimeSpent,
            rank: 1, // Will be recalculated
            percentile: 100, // Will be recalculated
            completion_date: new Date(),
            is_valid: true
        });

        console.log(`Created leaderboard entry: ${leaderboardEntry.id}`);

        res.json({
            success: true,
            message: 'Quiz submitted successfully!',
            data: {
                sessionId: testSession.id,  // ✅ ADD: TestSession UUID for solutions API
                leaderboardEntryId: leaderboardEntry.id,
                score: score,
                totalQuestions: totalQuestions,
                answeredQuestions: answeredQuestions,
                correctAnswers: correctAnswers,
                wrongAnswers: wrongAnswers,
                unansweredQuestions: unansweredQuestions,
                eSkippedAnswers: eSkippedAnswers, // count of "Option E" deliberate skips
                percentage: percentage,
                // Alternative field names in case frontend uses different keys
                finalPercentage: percentage,
                calculatedPercentage: percentage,
                actualPercentage: percentage,
                // Mark calculation info (updated for variable marks per question)
                totalMarks: totalMarks,
                obtainedMarks: obtainedMarks,
                negativeMarkingEnabled: negativeMarks > 0, // True if any category had negative marking
                negativeMarksDeducted: negativeMarks,
                negativeMarkValue: 0, // Set to 0 since it now varies by category
                finalScore: finalScore,
                completionTime: new Date().toISOString(),
                timestamp: Date.now(), // Cache buster
                // Override any frontend calculation
                displayPercentage: percentage,
                resultPercentage: percentage,
                scorePercentage: percentage,
                debug: {
                    totalMarks,
                    obtainedMarks,
                    negativeMarks,
                    finalScore,
                    accuracyCalculation: `Accuracy = (${correctAnswers}/${answeredQuestions}) × 100 = ${percentage}%`,
                    scoreCalculation: `Score = (1 × ${correctAnswers}) - (0.25 × ${wrongAnswers}) = ${correctAnswers} - ${negativeMarks.toFixed(2)} = ${finalScore}`,
                    wrongAnswersCalculation: `Wrong = Attempted - Correct = ${answeredQuestions} - ${correctAnswers} = ${wrongAnswers}`,
                    marksCalculation: `Total Marks: ${totalMarks}, Obtained: ${obtainedMarks}, After Negative: ${finalScore}`,
                    warning: "Frontend should use 'percentage', 'wrongAnswers', and 'finalScore' fields from backend"
                }
            }
        });

    } catch (error) {
        console.error('Quiz submission error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to submit quiz',
            error: error.message,
            details: error.errors ? error.errors.map(e => e.message) : []
        });
    }
});

module.exports = router;
