'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('users');

    const cols = {
      fullName:    { type: Sequelize.STRING(255), allowNull: true },
      phoneNumber: { type: Sequelize.STRING(255), allowNull: true },
      dateOfBirth: { type: Sequelize.DATEONLY, allowNull: true },
      schoolName:  { type: Sequelize.STRING(255), allowNull: true },
      city:        { type: Sequelize.STRING(255), allowNull: true },
      state:       { type: Sequelize.STRING(255), allowNull: true },
      avatarUrl:   { type: Sequelize.STRING(255), allowNull: true },
    };

    for (const [col, spec] of Object.entries(cols)) {
      if (!desc[col]) {
        await queryInterface.addColumn('users', col, spec);
      }
    }
  },

  async down(queryInterface) {
    for (const col of ['fullName', 'phoneNumber', 'dateOfBirth', 'schoolName', 'city', 'state', 'avatarUrl']) {
      await queryInterface.removeColumn('users', col).catch(() => {});
    }
  }
};
