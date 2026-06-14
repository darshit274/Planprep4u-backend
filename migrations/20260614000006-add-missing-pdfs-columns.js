'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('pdfs');

    const cols = {
      category_id:          { type: Sequelize.INTEGER, allowNull: true },
      file_path:            { type: Sequelize.STRING(255), allowNull: true },
      original_filename:    { type: Sequelize.STRING(255), allowNull: true },
      mime_type:            { type: Sequelize.STRING(255), allowNull: true, defaultValue: 'application/pdf' },
      access_level:         { type: Sequelize.ENUM('free', 'premium', 'restricted'), allowNull: true, defaultValue: 'free' },
      test_series_id:       { type: Sequelize.STRING(36), allowNull: true },
      exam_type_id:         { type: Sequelize.INTEGER, allowNull: true },
      tags:                 { type: Sequelize.JSON, allowNull: true },
      view_count:           { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      price:                { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
      currency:             { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'INR' },
      discount_percentage:  { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0.00 },
      subscription_required:{ type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 0 },
      preview_pages:        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_active:            { type: Sequelize.TINYINT(1), allowNull: true, defaultValue: 1 },
      is_featured:          { type: Sequelize.TINYINT(1), allowNull: true, defaultValue: 0 },
    };

    for (const [col, spec] of Object.entries(cols)) {
      if (!desc[col]) {
        await queryInterface.addColumn('pdfs', col, spec);
      }
    }

    // Populate file_path from file_url for existing rows
    if (!desc['file_path'] && desc['file_url']) {
      await queryInterface.sequelize.query(
        'UPDATE pdfs SET file_path = file_url WHERE file_path IS NULL'
      );
    }
    // Populate original_filename from file_name for existing rows
    if (!desc['original_filename'] && desc['file_name']) {
      await queryInterface.sequelize.query(
        'UPDATE pdfs SET original_filename = file_name WHERE original_filename IS NULL'
      );
    }

    await queryInterface.addIndex('pdfs', ['category_id'], { name: 'pdfs_category_id' }).catch(() => {});
    await queryInterface.addIndex('pdfs', ['access_level'], { name: 'pdfs_access_level' }).catch(() => {});
    await queryInterface.addIndex('pdfs', ['is_active'], { name: 'pdfs_is_active' }).catch(() => {});
  },

  async down(queryInterface) {
    for (const col of ['category_id','file_path','original_filename','mime_type','access_level',
      'test_series_id','exam_type_id','tags','view_count','price','currency',
      'discount_percentage','subscription_required','preview_pages','is_active','is_featured']) {
      await queryInterface.removeColumn('pdfs', col).catch(() => {});
    }
  }
};
