'use strict';

require('dotenv').config();
const { sequelize, TestSeries, Category, Question } = require('../models');

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const courses = [
  {
    name: 'GPSC Class 1-2 Preparation',
    description: 'Comprehensive preparation course for GPSC Class 1 and Class 2 examinations covering General Studies and Mathematics.',
    pricing_type: 'free',
    price: 0,
    difficulty_level: 'intermediate',
    is_active: true,
    is_featured: true,
    validity_days: 365,
    categories: [
      {
        name: 'General Studies',
        description: 'Indian History, Geography, Polity and Current Affairs',
        subCategories: [
          {
            name: 'Indian History',
            description: 'Ancient, Medieval and Modern Indian History',
            questions: [
              {
                question_text: 'Who is known as the "Father of the Indian Nation"?',
                option_a: 'Jawaharlal Nehru',
                option_b: 'Mahatma Gandhi',
                option_c: 'Sardar Vallabhbhai Patel',
                option_d: 'Subhas Chandra Bose',
                correct_answer: 'B',
                explanation: 'Mahatma Gandhi is widely regarded as the Father of the Indian Nation for leading the independence movement through non-violence.',
                marks: 1
              },
              {
                question_text: 'The Battle of Plassey was fought in which year?',
                option_a: '1757',
                option_b: '1761',
                option_c: '1764',
                option_d: '1799',
                correct_answer: 'A',
                explanation: 'The Battle of Plassey was fought on June 23, 1757, between the British East India Company and the Nawab of Bengal.',
                marks: 1
              },
              {
                question_text: 'Who founded the Indian National Congress in 1885?',
                option_a: 'Bal Gangadhar Tilak',
                option_b: 'Gopal Krishna Gokhale',
                option_c: 'Allan Octavian Hume',
                option_d: 'Dadabhai Naoroji',
                correct_answer: 'C',
                explanation: 'Allan Octavian Hume, a retired British civil servant, founded the Indian National Congress in 1885.',
                marks: 1
              },
              {
                question_text: 'The Quit India Movement was launched in which year?',
                option_a: '1940',
                option_b: '1942',
                option_c: '1944',
                option_d: '1946',
                correct_answer: 'B',
                explanation: 'The Quit India Movement was launched by Mahatma Gandhi on August 8, 1942, demanding an end to British rule in India.',
                marks: 1
              },
              {
                question_text: 'Who was the first President of independent India?',
                option_a: 'Jawaharlal Nehru',
                option_b: 'Sardar Patel',
                option_c: 'C. Rajagopalachari',
                option_d: 'Dr. Rajendra Prasad',
                correct_answer: 'D',
                explanation: 'Dr. Rajendra Prasad was the first President of India, serving from January 26, 1950 to May 13, 1962.',
                marks: 1
              }
            ]
          },
          {
            name: 'Indian Geography',
            description: 'Physical, political and economic geography of India',
            questions: [
              {
                question_text: 'Which is the longest river in India?',
                option_a: 'Yamuna',
                option_b: 'Brahmaputra',
                option_c: 'Ganga',
                option_d: 'Godavari',
                correct_answer: 'C',
                explanation: 'The Ganga (Ganges) is the longest river in India with a length of about 2,525 km.',
                marks: 1
              },
              {
                question_text: 'Which state has the longest coastline in India?',
                option_a: 'Kerala',
                option_b: 'Andhra Pradesh',
                option_c: 'Maharashtra',
                option_d: 'Gujarat',
                correct_answer: 'D',
                explanation: 'Gujarat has the longest coastline in India, stretching approximately 1,600 km.',
                marks: 1
              },
              {
                question_text: 'Where is the Kaziranga National Park located?',
                option_a: 'Assam',
                option_b: 'West Bengal',
                option_c: 'Madhya Pradesh',
                option_d: 'Rajasthan',
                correct_answer: 'A',
                explanation: 'Kaziranga National Park is located in Assam and is famous for the Indian one-horned rhinoceros.',
                marks: 1
              },
              {
                question_text: 'Which mountain pass connects India with Tibet?',
                option_a: 'Banihal Pass',
                option_b: 'Rohtang Pass',
                option_c: 'Nathu La Pass',
                option_d: 'Shipki La Pass',
                correct_answer: 'C',
                explanation: 'Nathu La Pass in Sikkim connects India with Tibet (China) at an altitude of 4,310 metres.',
                marks: 1
              }
            ]
          }
        ]
      },
      {
        name: 'Mathematics',
        description: 'Arithmetic, Algebra, Geometry and Data Interpretation',
        subCategories: [
          {
            name: 'Arithmetic & Number System',
            description: 'Number system, percentages, ratio, profit & loss',
            questions: [
              {
                question_text: 'What is 15% of 240?',
                option_a: '32',
                option_b: '36',
                option_c: '38',
                option_d: '42',
                correct_answer: 'B',
                explanation: '15% of 240 = (15/100) × 240 = 0.15 × 240 = 36.',
                marks: 1
              },
              {
                question_text: 'A shopkeeper bought an article for ₹800 and sold it for ₹1000. What is the profit percentage?',
                option_a: '20%',
                option_b: '25%',
                option_c: '22%',
                option_d: '18%',
                correct_answer: 'B',
                explanation: 'Profit = 1000 - 800 = 200. Profit% = (200/800) × 100 = 25%.',
                marks: 1
              },
              {
                question_text: 'The ratio of A to B is 3:5. If B = 60, what is A?',
                option_a: '30',
                option_b: '36',
                option_c: '40',
                option_d: '45',
                correct_answer: 'B',
                explanation: 'A/B = 3/5. A = (3/5) × 60 = 36.',
                marks: 1
              },
              {
                question_text: 'Find the LCM of 12, 18, and 24.',
                option_a: '48',
                option_b: '60',
                option_c: '72',
                option_d: '96',
                correct_answer: 'C',
                explanation: 'LCM of 12, 18, 24: 12=2²×3, 18=2×3², 24=2³×3. LCM = 2³×3² = 72.',
                marks: 1
              }
            ]
          },
          {
            name: 'Simple & Compound Interest',
            description: 'Interest calculations, time-value of money',
            questions: [
              {
                question_text: 'What is the Simple Interest on ₹5000 at 8% per annum for 3 years?',
                option_a: '₹1000',
                option_b: '₹1100',
                option_c: '₹1200',
                option_d: '₹1500',
                correct_answer: 'C',
                explanation: 'SI = (P × R × T) / 100 = (5000 × 8 × 3) / 100 = ₹1200.',
                marks: 1
              },
              {
                question_text: 'If a sum doubles itself in 10 years at SI, what is the rate of interest?',
                option_a: '5%',
                option_b: '8%',
                option_c: '10%',
                option_d: '12%',
                correct_answer: 'C',
                explanation: 'If P doubles, SI = P. Rate = (SI × 100) / (P × T) = 10%.',
                marks: 1
              },
              {
                question_text: 'Find the compound interest on ₹1000 at 10% per annum for 2 years.',
                option_a: '₹200',
                option_b: '₹210',
                option_c: '₹220',
                option_d: '₹230',
                correct_answer: 'B',
                explanation: 'CI = P[(1+r/100)^t - 1] = 1000[(1.1)^2 - 1] = ₹210.',
                marks: 1
              }
            ]
          }
        ]
      }
    ]
  },

  {
    name: 'Gujarat Police Constable',
    description: 'Complete preparation for Gujarat Police Constable exam — Reasoning, General Knowledge and current affairs.',
    pricing_type: 'paid',
    price: 299.00,
    difficulty_level: 'beginner',
    is_active: true,
    is_featured: false,
    validity_days: 180,
    categories: [
      {
        name: 'Reasoning Ability',
        description: 'Logical, verbal and non-verbal reasoning',
        subCategories: [
          {
            name: 'Logical Reasoning',
            description: 'Analogies, series, coding-decoding and syllogisms',
            questions: [
              {
                question_text: 'If BOOK is coded as CPPL, how is DEAR coded?',
                option_a: 'EFBS',
                option_b: 'EFBT',
                option_c: 'EGBS',
                option_d: 'DFBS',
                correct_answer: 'A',
                explanation: 'Each letter is shifted +1: D→E, E→F, A→B, R→S = EFBS.',
                marks: 1
              },
              {
                question_text: 'Find the odd one out: 7, 14, 21, 28, 33, 42',
                option_a: '14',
                option_b: '28',
                option_c: '33',
                option_d: '42',
                correct_answer: 'C',
                explanation: 'All numbers are multiples of 7 except 33.',
                marks: 1
              },
              {
                question_text: 'Which number should come next in the series: 2, 6, 12, 20, 30, ?',
                option_a: '40',
                option_b: '42',
                option_c: '44',
                option_d: '46',
                correct_answer: 'B',
                explanation: 'Pattern: n×(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.',
                marks: 1
              },
              {
                question_text: 'A is the brother of B. B is the sister of C. C is the son of D. How is D related to A?',
                option_a: 'Uncle',
                option_b: 'Father',
                option_c: 'Grandfather',
                option_d: 'Cannot be determined',
                correct_answer: 'D',
                explanation: 'D is the parent of C and B, and A is the brother of B. D could be father or mother.',
                marks: 1
              },
              {
                question_text: 'If South-East becomes North, then what does North-West become?',
                option_a: 'East',
                option_b: 'West',
                option_c: 'South',
                option_d: 'North-East',
                correct_answer: 'C',
                explanation: 'Each direction is rotated 135° clockwise. South-East→North, North-West→South.',
                marks: 1
              }
            ]
          },
          {
            name: 'Verbal Reasoning',
            description: 'Analogies, classification and verbal ability',
            questions: [
              {
                question_text: 'Doctor : Hospital :: Teacher : ?',
                option_a: 'College',
                option_b: 'School',
                option_c: 'Library',
                option_d: 'Classroom',
                correct_answer: 'B',
                explanation: 'A Doctor works in a Hospital; a Teacher works in a School.',
                marks: 1
              },
              {
                question_text: 'Choose the word most SIMILAR in meaning to "BENEVOLENT".',
                option_a: 'Cruel',
                option_b: 'Kind',
                option_c: 'Strict',
                option_d: 'Indifferent',
                correct_answer: 'B',
                explanation: 'Benevolent means well-meaning and kindly.',
                marks: 1
              },
              {
                question_text: 'Choose the correctly spelt word.',
                option_a: 'Accomodation',
                option_b: 'Acommodation',
                option_c: 'Accommodation',
                option_d: 'Acomodation',
                correct_answer: 'C',
                explanation: 'The correct spelling is "Accommodation" — double c and double m.',
                marks: 1
              }
            ]
          }
        ]
      },
      {
        name: 'General Knowledge',
        description: 'Current affairs, science, and static GK',
        subCategories: [
          {
            name: 'India & Gujarat GK',
            description: 'Important facts about India and Gujarat state',
            questions: [
              {
                question_text: 'What is the capital of Gujarat?',
                option_a: 'Surat',
                option_b: 'Rajkot',
                option_c: 'Vadodara',
                option_d: 'Gandhinagar',
                correct_answer: 'D',
                explanation: 'Gandhinagar is the capital city of Gujarat.',
                marks: 1
              },
              {
                question_text: 'Which is the national animal of India?',
                option_a: 'Lion',
                option_b: 'Elephant',
                option_c: 'Bengal Tiger',
                option_d: 'Leopard',
                correct_answer: 'C',
                explanation: 'The Bengal Tiger is the national animal of India.',
                marks: 1
              },
              {
                question_text: 'How many Articles are there in the original Constitution of India?',
                option_a: '395',
                option_b: '400',
                option_c: '448',
                option_d: '470',
                correct_answer: 'A',
                explanation: 'The original Constitution had 395 Articles, 22 Parts, and 8 Schedules.',
                marks: 1
              },
              {
                question_text: 'Which planet is known as the "Red Planet"?',
                option_a: 'Venus',
                option_b: 'Mars',
                option_c: 'Jupiter',
                option_d: 'Saturn',
                correct_answer: 'B',
                explanation: 'Mars is called the Red Planet due to reddish iron oxide on its surface.',
                marks: 1
              }
            ]
          }
        ]
      }
    ]
  },

  {
    name: 'GSSSB Bin Sachivalay Clerk',
    description: 'Full preparation package for GSSSB Bin Sachivalay Clerk exam — English, Computer Knowledge and Quantitative Aptitude.',
    pricing_type: 'paid',
    price: 199.00,
    difficulty_level: 'beginner',
    is_active: true,
    is_featured: false,
    validity_days: 180,
    categories: [
      {
        name: 'English Grammar',
        description: 'Tenses, vocabulary, comprehension and grammar rules',
        subCategories: [
          {
            name: 'Tenses & Grammar Rules',
            description: 'All tenses, articles, prepositions and conjunctions',
            questions: [
              {
                question_text: 'Choose the correct form: She ___ to school every day.',
                option_a: 'go',
                option_b: 'goes',
                option_c: 'going',
                option_d: 'gone',
                correct_answer: 'B',
                explanation: 'With third person singular (she/he/it), add -s in Simple Present tense.',
                marks: 1
              },
              {
                question_text: 'Fill in the blank: The Sun rises ___ the East.',
                option_a: 'on',
                option_b: 'in',
                option_c: 'at',
                option_d: 'from',
                correct_answer: 'B',
                explanation: 'We use "in" with directions and regions.',
                marks: 1
              },
              {
                question_text: 'Choose the antonym of "ANCIENT".',
                option_a: 'Old',
                option_b: 'Historic',
                option_c: 'Modern',
                option_d: 'Classic',
                correct_answer: 'C',
                explanation: 'Ancient means very old. Its antonym is Modern.',
                marks: 1
              },
              {
                question_text: 'The passive voice of "He wrote a letter" is:',
                option_a: 'A letter was written by him.',
                option_b: 'A letter is written by him.',
                option_c: 'A letter has been written by him.',
                option_d: 'A letter were written by him.',
                correct_answer: 'A',
                explanation: 'Past simple active → past simple passive: "A letter was written by him."',
                marks: 1
              },
              {
                question_text: 'Choose the correctly spelt word.',
                option_a: 'Necesary',
                option_b: 'Necessary',
                option_c: 'Necesarry',
                option_d: 'Neccessary',
                correct_answer: 'B',
                explanation: 'The correct spelling is "Necessary" — one c, double s.',
                marks: 1
              }
            ]
          }
        ]
      },
      {
        name: 'Computer Knowledge',
        description: 'Basic computer fundamentals, MS Office and internet',
        subCategories: [
          {
            name: 'Computer Fundamentals',
            description: 'Hardware, software, operating systems and networking basics',
            questions: [
              {
                question_text: 'What does CPU stand for?',
                option_a: 'Central Processing Unit',
                option_b: 'Central Program Unit',
                option_c: 'Computer Processing Unit',
                option_d: 'Central Peripheral Unit',
                correct_answer: 'A',
                explanation: 'CPU stands for Central Processing Unit.',
                marks: 1
              },
              {
                question_text: 'Which shortcut key is used to save a file in MS Word?',
                option_a: 'Ctrl + P',
                option_b: 'Ctrl + X',
                option_c: 'Ctrl + S',
                option_d: 'Ctrl + Z',
                correct_answer: 'C',
                explanation: 'Ctrl + S is the standard shortcut to save in MS Word.',
                marks: 1
              },
              {
                question_text: 'What is the full form of HTML?',
                option_a: 'Hyper Text Markup Language',
                option_b: 'High Text Machine Language',
                option_c: 'Hyper Text Machine Level',
                option_d: 'High Transfer Markup Language',
                correct_answer: 'A',
                explanation: 'HTML stands for HyperText Markup Language.',
                marks: 1
              },
              {
                question_text: 'Which of the following is an input device?',
                option_a: 'Monitor',
                option_b: 'Printer',
                option_c: 'Speaker',
                option_d: 'Keyboard',
                correct_answer: 'D',
                explanation: 'Keyboard is an input device. Monitor, Printer, Speaker are output devices.',
                marks: 1
              },
              {
                question_text: '1 GB is equal to how many MB?',
                option_a: '100 MB',
                option_b: '512 MB',
                option_c: '1024 MB',
                option_d: '2048 MB',
                correct_answer: 'C',
                explanation: '1 Gigabyte (GB) = 1024 Megabytes (MB).',
                marks: 1
              }
            ]
          }
        ]
      }
    ]
  }
];

// ─── Seeder Logic ──────────────────────────────────────────────────────────────

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.\n');

    for (const courseData of courses) {
      const { categories: categoriesData, ...seriesFields } = courseData;

      // 1. Create course → new_test_series table
      const series = await TestSeries.create({
        name: seriesFields.name,
        description: seriesFields.description,
        pricing_type: seriesFields.pricing_type,
        price: seriesFields.price,
        difficulty_level: seriesFields.difficulty_level,
        is_active: seriesFields.is_active,
        is_featured: seriesFields.is_featured,
        validity_days: seriesFields.validity_days,
        currency: 'INR'
      });
      console.log(`📚 Course: "${series.name}" (id=${series.id})`);

      for (const catData of categoriesData) {
        const { subCategories: subCatsData, ...catFields } = catData;

        // 2. Create root category → categories table (hierarchy_level=0, no parent)
        const rootCat = await Category.create({
          test_series_id: series.id,
          name: catFields.name,
          description: catFields.description,
          is_active: true,
          node_type: 'container',
          parent_category_id: null,
          hierarchy_level: 0,
          display_order: 0
        });
        console.log(`  📂 Category: "${rootCat.name}"`);

        for (const subData of subCatsData) {
          const { questions: questionsData, ...subFields } = subData;

          // 3. Create sub-category → categories table (parent_category_id = root, level=1)
          const subCat = await Category.create({
            test_series_id: series.id,
            parent_category_id: rootCat.id,
            name: subFields.name,
            description: subFields.description,
            is_active: true,
            node_type: 'question_holder',
            hierarchy_level: 1,
            display_order: 0
          });
          console.log(`    📁 Sub-category: "${subCat.name}"`);

          // 4. Create questions → questions table (category_id = subCat, test_id = null)
          for (const qData of questionsData) {
            await Question.create({
              category_id: subCat.id,
              test_id: null,
              question_text: qData.question_text,
              option_a: qData.option_a,
              option_b: qData.option_b,
              option_c: qData.option_c,
              option_d: qData.option_d,
              correct_answer: qData.correct_answer,
              explanation: qData.explanation,
              marks: qData.marks || 1,
              difficulty: 'medium'
            });
          }
          console.log(`       ✅ ${questionsData.length} questions added`);
        }
      }
      console.log('');
    }

    console.log('🎉 All dummy courses seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
