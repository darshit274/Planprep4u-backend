'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('questions');

    // Only alter if test_id exists and is currently NOT NULL
    if (desc['test_id'] && !desc['test_id'].allowNull) {
      // Disable FK checks so MySQL lets us modify a column that has a FK constraint
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      try {
        await queryInterface.changeColumn('questions', 'test_id', {
          type: Sequelize.UUID,
          allowNull: true
        });
      } finally {
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Restore NOT NULL — only safe if all rows have a test_id
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    try {
      await queryInterface.changeColumn('questions', 'test_id', {
        type: Sequelize.UUID,
        allowNull: false
      });
    } finally {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  }
};
