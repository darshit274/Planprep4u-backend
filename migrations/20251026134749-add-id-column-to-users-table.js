'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('users');
    if (!desc['id']) {
      await queryInterface.addColumn('users', 'id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        after: 'uuid'
      });
      await queryInterface.sequelize.query('SET @count = 0;');
      await queryInterface.sequelize.query('UPDATE users SET id = @count:= @count + 1 ORDER BY created_at;');
      await queryInterface.changeColumn('users', 'id', { type: Sequelize.INTEGER, allowNull: false });
      await queryInterface.addIndex('users', ['id'], { name: 'idx_users_id', unique: true }).catch(() => {});
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS before_user_insert;
        CREATE TRIGGER before_user_insert
        BEFORE INSERT ON users
        FOR EACH ROW
        BEGIN
          IF NEW.id IS NULL THEN
            SET NEW.id = (SELECT IFNULL(MAX(id), 0) + 1 FROM users);
          END IF;
        END;
      `).catch(() => {});
    }
  },

  async down(queryInterface, Sequelize) {
    // Drop trigger
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_user_insert');

    // Remove index
    await queryInterface.removeIndex('users', 'idx_users_id');

    // Remove id column
    await queryInterface.removeColumn('users', 'id');
  }
};
