'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('pdf_categories');
    if (!desc['access_level']) {
      await queryInterface.addColumn('pdf_categories', 'access_level', {
        type: Sequelize.ENUM('free', 'premium', 'restricted'),
        allowNull: false,
        defaultValue: 'free'
      });
    }
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('pdf_categories', 'access_level').catch(() => {});
  }
};
