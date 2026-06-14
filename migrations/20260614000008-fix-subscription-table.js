'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const dbName = queryInterface.sequelize.config.database;
    const desc = await queryInterface.describeTable('subscription');

    // 1. Add metadata column (missing from 20240101000010)
    if (!desc['metadata']) {
      await queryInterface.addColumn('subscription', 'metadata', {
        type: Sequelize.JSON,
        allowNull: true
      });
    }

    // 2. Change test_series_id from UUID/CHAR(36) to INT to match new_test_series.id (INTEGER PK)
    if (desc['test_series_id'] && !desc['test_series_id'].type.toUpperCase().includes('INT')) {
      // Drop any FK constraints on test_series_id first (old migration added test_series.id FK)
      const [fkRows] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = '${dbName}'
          AND TABLE_NAME = 'subscription'
          AND COLUMN_NAME = 'test_series_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      for (const row of fkRows) {
        await queryInterface.removeConstraint('subscription', row.CONSTRAINT_NAME).catch(() => {});
      }

      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      try {
        await queryInterface.changeColumn('subscription', 'test_series_id', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
      } finally {
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      }
    }

    await queryInterface.addIndex('subscription', ['user_id'], { name: 'subscription_user_id' }).catch(() => {});
    await queryInterface.addIndex('subscription', ['test_series_id'], { name: 'subscription_test_series_id' }).catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('subscription', 'metadata').catch(() => {});
  }
};
