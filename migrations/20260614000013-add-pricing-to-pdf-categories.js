'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('pdf_categories');

    if (!desc['price']) {
      await queryInterface.addColumn('pdf_categories', 'price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      });
    }
    if (!desc['currency']) {
      await queryInterface.addColumn('pdf_categories', 'currency', {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'INR'
      });
    }
    // Sub-folders in a premium root can be marked free individually
    if (!desc['is_free_override']) {
      await queryInterface.addColumn('pdf_categories', 'is_free_override', {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pdf_categories', 'price').catch(() => {});
    await queryInterface.removeColumn('pdf_categories', 'currency').catch(() => {});
    await queryInterface.removeColumn('pdf_categories', 'is_free_override').catch(() => {});
  }
};
