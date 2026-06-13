'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('users');
    if (!desc['otp']) {
      await queryInterface.addColumn('users', 'otp', { type: Sequelize.INTEGER, allowNull: true });
    }
    if (!desc['phone']) {
      await queryInterface.addColumn('users', 'phone', { type: Sequelize.STRING, allowNull: true });
    }
  },
  async down(queryInterface) {
    const desc = await queryInterface.describeTable('users');
    if (desc['otp']) await queryInterface.removeColumn('users', 'otp');
    if (desc['phone']) await queryInterface.removeColumn('users', 'phone');
  }
};
