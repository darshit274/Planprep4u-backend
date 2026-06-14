'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('pdfs');
    if (!desc['is_free']) {
      await queryInterface.addColumn('pdfs', 'is_free', {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 1
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pdfs', 'is_free').catch(() => {});
  }
};
