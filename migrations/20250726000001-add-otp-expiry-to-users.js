'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('users');
    if (!desc['otpExpiry']) {
      await queryInterface.addColumn('users', 'otpExpiry', { type: Sequelize.DATE, allowNull: true });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'otpExpiry');
  }
};
