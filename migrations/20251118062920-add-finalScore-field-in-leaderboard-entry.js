'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('leaderboard_entries');
    if (!desc['final_score']) {
      await queryInterface.addColumn('leaderboard_entries', 'final_score', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('leaderboard_entries', 'final_score').catch(() => {});
  }
};
