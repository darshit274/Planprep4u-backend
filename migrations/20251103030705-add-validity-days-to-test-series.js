'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('new_test_series');
    if (!desc['validity_days']) {
      await queryInterface.addColumn('new_test_series', 'validity_days', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 365,
        comment: 'Number of days the course is valid after purchase'
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('new_test_series', 'validity_days').catch(() => {});
  }
};
