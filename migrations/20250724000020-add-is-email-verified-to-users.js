'use strict';

/**
 * Migration to add `isEmailVerified` boolean column to `users` table.
 * Keeps default false and not null to align with model definition.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('users');
    if (!desc['isEmailVerified']) {
      await queryInterface.addColumn('users', 'isEmailVerified', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether user has verified email'
      });
    }
    await queryInterface.addIndex('users', ['isEmailVerified']).catch(() => {});
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'isEmailVerified');
  }
};
