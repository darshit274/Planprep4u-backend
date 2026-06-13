'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pdfs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      file_name: { type: Sequelize.STRING, allowNull: false },
      file_url: { type: Sequelize.STRING, allowNull: false },
      file_size: { type: Sequelize.BIGINT, allowNull: true },
      category: { type: Sequelize.STRING, allowNull: false },
      subject: { type: Sequelize.STRING, allowNull: true },
      is_free: { type: Sequelize.BOOLEAN, defaultValue: true },
      download_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      uploaded_by: { type: Sequelize.UUID, allowNull: true, references: { model: 'admins', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      test_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'test', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addIndex('pdfs', ['category']).catch(() => {});
    await queryInterface.addIndex('pdfs', ['subject']).catch(() => {});
    await queryInterface.addIndex('pdfs', ['is_free']).catch(() => {});
    await queryInterface.addIndex('pdfs', ['uploaded_by']).catch(() => {});
  },
  down: async (queryInterface) => { await queryInterface.dropTable('pdfs'); }
};
