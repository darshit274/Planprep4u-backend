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

    // questions — several columns only exist in 20250928000016 which is a no-op
    // (questions already created by 20240101000008 without these columns)
    const qDesc = await queryInterface.describeTable('questions');

    if (!qDesc['category_id']) {
      await queryInterface.addColumn('questions', 'category_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await queryInterface.addIndex('questions', ['category_id'], { name: 'idx_questions_category' }).catch(() => {});
    }

    if (!qDesc['is_active']) {
      await queryInterface.addColumn('questions', 'is_active', {
        type: Sequelize.TINYINT(1),
        allowNull: true,
        defaultValue: 1
      });
    }

    if (!qDesc['difficulty_tag']) {
      await queryInterface.addColumn('questions', 'difficulty_tag', {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        allowNull: true,
        defaultValue: 'medium'
      });
    }

    if (!qDesc['display_order']) {
      await queryInterface.addColumn('questions', 'display_order', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
    }

    if (!qDesc['option_e']) {
      await queryInterface.addColumn('questions', 'option_e', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!qDesc['option_e_gujarati']) {
      await queryInterface.addColumn('questions', 'option_e_gujarati', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('categories', 'is_free_in_paid_series').catch(() => {});
    for (const col of ['category_id', 'is_active', 'difficulty_tag', 'display_order', 'option_e', 'option_e_gujarati']) {
      await queryInterface.removeColumn('questions', col).catch(() => {});
    }
  }
};
