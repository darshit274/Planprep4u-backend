'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ── test table ────────────────────────────────────────────────────────────
    // Old migration 20240101000007 has minimal columns.
    // Model expects many more; all of these are included in Test.create() INSERTs.
    const testDesc = await queryInterface.describeTable('test');

    const testCols = {
      title_gujarati:           { type: Sequelize.STRING(255), allowNull: true },
      description_gujarati:     { type: Sequelize.TEXT, allowNull: true },
      is_demo:                  { type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 0 },
      is_free_in_paid_series:   { type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 0 },
      negative_marking_enabled: { type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 0 },
      negative_marks_per_wrong: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 0.25 },
      is_one_time_only:         { type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 0 },
      max_duration_minutes:     { type: Sequelize.INTEGER, allowNull: true },
      attempt_restrictions:     { type: Sequelize.JSON, allowNull: true },
      passing_marks:            { type: Sequelize.INTEGER, allowNull: true },
      instructions_gujarati:    { type: Sequelize.TEXT, allowNull: true },
      difficulty_level:         {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        allowNull: false,
        defaultValue: 'medium'
      },
      randomize_questions:      { type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 0 },
      show_results_immediately: { type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 1 },
      pass_percentage:          { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 60.00 },
      allow_review:             { type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 1 },
      display_order:            { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    };

    for (const [col, spec] of Object.entries(testCols)) {
      if (!testDesc[col]) {
        await queryInterface.addColumn('test', col, spec);
      }
    }

    // ── test_sessions table ───────────────────────────────────────────────────
    // 20250928000018 created the table; 20260614000001 added score/time columns.
    // Still missing the "test history" columns that TestSession.create() sets.
    const tsDesc = await queryInterface.describeTable('test_sessions');

    const tsCols = {
      test_name:           { type: Sequelize.STRING(255), allowNull: true },
      category_name:       { type: Sequelize.STRING(255), allowNull: true },
      total_marks:         { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      obtained_marks:      { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      negative_marks:      { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      attempted_questions: { type: Sequelize.INTEGER, allowNull: true },
      accuracy:            { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    };

    for (const [col, spec] of Object.entries(tsCols)) {
      if (!tsDesc[col]) {
        await queryInterface.addColumn('test_sessions', col, spec);
      }
    }
  },

  async down(queryInterface) {
    for (const col of [
      'title_gujarati', 'description_gujarati', 'is_demo', 'is_free_in_paid_series',
      'negative_marking_enabled', 'negative_marks_per_wrong', 'is_one_time_only',
      'max_duration_minutes', 'attempt_restrictions', 'passing_marks', 'instructions_gujarati',
      'difficulty_level', 'randomize_questions', 'show_results_immediately',
      'pass_percentage', 'allow_review', 'display_order',
    ]) {
      await queryInterface.removeColumn('test', col).catch(() => {});
    }
    for (const col of ['test_name', 'category_name', 'total_marks', 'obtained_marks', 'negative_marks', 'attempted_questions', 'accuracy']) {
      await queryInterface.removeColumn('test_sessions', col).catch(() => {});
    }
  }
};
