'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // categories.is_free_in_paid_series
    const catDesc = await queryInterface.describeTable('categories');
    if (!catDesc['is_free_in_paid_series']) {
      await queryInterface.addColumn('categories', 'is_free_in_paid_series', {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0
      });
    }

    // questions.category_id (missing because 20250928000016 is a no-op — questions already created by 20240101000008)
    const qDesc = await queryInterface.describeTable('questions');
    if (!qDesc['category_id']) {
      await queryInterface.addColumn('questions', 'category_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await queryInterface.addIndex('questions', ['category_id'], { name: 'idx_questions_category' }).catch(() => {});
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('categories', 'is_free_in_paid_series').catch(() => {});
    await queryInterface.removeColumn('questions', 'category_id').catch(() => {});
  }
};
