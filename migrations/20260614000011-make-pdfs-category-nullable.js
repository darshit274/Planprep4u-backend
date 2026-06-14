'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('pdfs');

    // category_id was created NOT NULL by migration 000016 but should be nullable
    // because PDFs can be linked to a test series/course without a PDF category folder
    if (desc['category_id'] && !desc['category_id'].allowNull) {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      try {
        await queryInterface.changeColumn('pdfs', 'category_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'pdf_categories',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });
      } finally {
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    try {
      await queryInterface.changeColumn('pdfs', 'category_id', {
        type: Sequelize.INTEGER,
        allowNull: false
      });
    } finally {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  }
};
