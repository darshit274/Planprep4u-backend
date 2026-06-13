'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // pdf_categories.parent_category_id — missing from 20240101000005
    const pdfCatDesc = await queryInterface.describeTable('pdf_categories');
    if (!pdfCatDesc['parent_category_id']) {
      await queryInterface.addColumn('pdf_categories', 'parent_category_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'pdf_categories', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }

    // push_tokens table — no migration exists at all
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('push_tokens')) {
      await queryInterface.createTable('push_tokens', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: {
          type: 'CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin',
          allowNull: false,
          references: { model: 'users', key: 'uuid' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        push_token: { type: Sequelize.STRING(512), allowNull: false },
        platform: { type: Sequelize.ENUM('ios', 'android', 'web'), allowNull: false },
        device_info: { type: Sequelize.JSON, allowNull: true },
        is_active: { type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 1 },
        last_used_at: { type: Sequelize.DATE, allowNull: true },
        expires_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false }
      });
      await queryInterface.addIndex('push_tokens', ['user_id']).catch(() => {});
      await queryInterface.addIndex('push_tokens', ['push_token'], { unique: true }).catch(() => {});
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pdf_categories', 'parent_category_id').catch(() => {});
    await queryInterface.dropTable('push_tokens').catch(() => {});
  }
};
