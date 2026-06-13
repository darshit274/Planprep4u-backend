'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('test_sessions');
    const cols = {
      test_name:          { type: Sequelize.STRING,       allowNull: true, comment: 'Cached test name' },
      category_name:      { type: Sequelize.STRING,       allowNull: true, comment: 'Cached category name' },
      total_marks:        { type: Sequelize.DECIMAL(10,2), allowNull: true, defaultValue: 0 },
      obtained_marks:     { type: Sequelize.DECIMAL(10,2), allowNull: true, defaultValue: 0 },
      negative_marks:     { type: Sequelize.DECIMAL(10,2), allowNull: true, defaultValue: 0 },
      attempted_questions:{ type: Sequelize.INTEGER,      allowNull: true, defaultValue: 0 },
      accuracy:           { type: Sequelize.DECIMAL(5,2), allowNull: true, defaultValue: 0 }
    };
    for (const [col, spec] of Object.entries(cols)) {
      if (!desc[col]) await queryInterface.addColumn('test_sessions', col, spec);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('test_sessions', 'test_name');
    await queryInterface.removeColumn('test_sessions', 'category_name');
    await queryInterface.removeColumn('test_sessions', 'total_marks');
    await queryInterface.removeColumn('test_sessions', 'obtained_marks');
    await queryInterface.removeColumn('test_sessions', 'negative_marks');
    await queryInterface.removeColumn('test_sessions', 'attempted_questions');
    await queryInterface.removeColumn('test_sessions', 'accuracy');
  }
};
