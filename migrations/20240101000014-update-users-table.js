'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('users');
    if (!desc['lastLogin']) {
      await queryInterface.addColumn('users', 'lastLogin', { type: Sequelize.DATE, allowNull: true });
    }
    if (!desc['isActive']) {
      await queryInterface.addColumn('users', 'isActive', { type: Sequelize.BOOLEAN, defaultValue: true });
    }
    await queryInterface.addIndex('users', ['isActive']).catch(() => {});
    await queryInterface.addIndex('users', ['lastLogin']).catch(() => {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'lastLogin');
    await queryInterface.removeColumn('users', 'isActive');
  }
};