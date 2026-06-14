'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const dbName = queryInterface.sequelize.config.database;
    const desc = await queryInterface.describeTable('pdfs');

    if (desc['category_id'] && !desc['category_id'].allowNull) {
      // Drop all FK constraints on category_id — MySQL 8.0.16+ refuses to
      // add ON DELETE SET NULL while the column is still NOT NULL
      const [fkRows] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = '${dbName}'
          AND TABLE_NAME = 'pdfs'
          AND COLUMN_NAME = 'category_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `);

      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      try {
        for (const row of fkRows) {
          await queryInterface.removeConstraint('pdfs', row.CONSTRAINT_NAME).catch(() => {});
        }

        // Make column nullable (no references here to avoid the SET NULL check)
        await queryInterface.changeColumn('pdfs', 'category_id', {
          type: Sequelize.INTEGER,
          allowNull: true
        });

        // Re-add FK now that the column is nullable
        await queryInterface.sequelize.query(`
          ALTER TABLE pdfs ADD CONSTRAINT pdfs_category_id_fk
          FOREIGN KEY (category_id) REFERENCES pdf_categories(id)
          ON UPDATE CASCADE ON DELETE SET NULL
        `).catch(() => {});
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
