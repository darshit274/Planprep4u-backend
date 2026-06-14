'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // questions — columns added to 20260614000003 AFTER it already ran on the server
    const qDesc = await queryInterface.describeTable('questions');

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

    // test — missing sub_category_id (20240101000007 created it with test_series_id only)
    const tDesc = await queryInterface.describeTable('test');
    if (!tDesc['sub_category_id']) {
      await queryInterface.addColumn('test', 'sub_category_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await queryInterface.addIndex('test', ['sub_category_id']).catch(() => {});
    }
  },

  async down(queryInterface) {
    for (const col of ['is_active', 'difficulty_tag', 'display_order', 'option_e', 'option_e_gujarati']) {
      await queryInterface.removeColumn('questions', col).catch(() => {});
    }
    await queryInterface.removeColumn('test', 'sub_category_id').catch(() => {});
  }
};
