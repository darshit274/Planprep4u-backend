'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('questions');
    if (!desc['question_order']) {
      await queryInterface.addColumn('questions', 'question_order', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: 'Order of question from Excel import or manual creation'
      });
    }
    await queryInterface.addIndex('questions', ['question_order'], {
      name: 'idx_questions_category_order'
    }).catch(() => {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('questions', 'idx_questions_category_order');
    await queryInterface.removeColumn('questions', 'question_order');
  }
};
