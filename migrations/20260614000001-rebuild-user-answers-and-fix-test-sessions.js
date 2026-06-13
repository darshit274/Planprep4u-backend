'use strict';

/**
 * Rebuilds user_answers to the new schema (test_session_id-based with E-skip ENUM)
 * and ensures test_sessions has all required columns (status, etc.).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── user_answers ──────────────────────────────────────────────
    // Detect old schema by checking for legacy column `user_id`
    let uaDesc = {};
    try { uaDesc = await queryInterface.describeTable('user_answers'); } catch (e) { /* table missing */ }

    const hasOldSchema = !!uaDesc['user_id'];   // old: user_id + test_id
    const hasNewSchema = !!uaDesc['test_session_id']; // new schema

    if (!hasNewSchema) {
      // Drop (safe: old table is empty on fresh installs, or has incompatible data)
      await queryInterface.dropTable('user_answers').catch(() => {});

      await queryInterface.createTable('user_answers', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        test_session_id: {
          type: 'CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin',
          allowNull: false,
          references: { model: 'test_sessions', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        question_id: {
          type: 'CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin',
          allowNull: false,
          references: { model: 'questions', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        selected_option: {
          // E = deliberate "Skip – don't want to attempt"
          type: Sequelize.ENUM('A', 'B', 'C', 'D', 'E'),
          allowNull: true
        },
        is_correct:  { type: Sequelize.BOOLEAN, defaultValue: false },
        time_spent:  { type: Sequelize.INTEGER, defaultValue: 0 },
        is_flagged:  { type: Sequelize.BOOLEAN, defaultValue: false },
        is_visited:  { type: Sequelize.BOOLEAN, defaultValue: false },
        created_at:  { type: Sequelize.DATE, allowNull: false },
        updated_at:  { type: Sequelize.DATE, allowNull: false }
      });

      await queryInterface.addIndex('user_answers', ['test_session_id']).catch(() => {});
      await queryInterface.addIndex('user_answers', ['question_id']).catch(() => {});
    }

    // ── test_sessions: ensure status + other critical columns exist ─
    const tsDesc = await queryInterface.describeTable('test_sessions');

    if (!tsDesc['status']) {
      await queryInterface.addColumn('test_sessions', 'status', {
        type: Sequelize.ENUM('active', 'paused', 'completed', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'active'
      });
      await queryInterface.addIndex('test_sessions', ['status']).catch(() => {});
    }

    const tsExtra = {
      is_completed:           { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      is_submitted:           { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      remaining_time_seconds: { type: Sequelize.INTEGER, allowNull: true },
      current_question_index: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
      session_data:           { type: Sequelize.JSON,    allowNull: true },
      answers_data:           { type: Sequelize.JSON,    allowNull: true },
      calculated_score:       { type: Sequelize.DECIMAL(10,2), allowNull: true },
      total_correct:          { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
      total_wrong:            { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
      total_unanswered:       { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
      total_marked_for_review:{ type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
      final_score:            { type: Sequelize.DECIMAL(10,2), allowNull: true },
      percentage:             { type: Sequelize.DECIMAL(5,2),  allowNull: true },
      negative_marks_per_wrong:{ type: Sequelize.DECIMAL(3,2), allowNull: true, defaultValue: 0.25 },
      time_spent_seconds:     { type: Sequelize.INTEGER, allowNull: true },
    };

    // Re-read desc after potential status addition
    const tsDescFresh = await queryInterface.describeTable('test_sessions');
    for (const [col, spec] of Object.entries(tsExtra)) {
      if (!tsDescFresh[col]) {
        await queryInterface.addColumn('test_sessions', col, spec);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_answers').catch(() => {});
  }
};
