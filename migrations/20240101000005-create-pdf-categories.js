'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pdf_categories', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      icon: { type: Sequelize.STRING, allowNull: true },
      color: { type: Sequelize.STRING, allowNull: true, defaultValue: '#3B82F6' },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addIndex('pdf_categories', ['slug']).catch(() => {});
    await queryInterface.addIndex('pdf_categories', ['is_active']).catch(() => {});
    await queryInterface.addIndex('pdf_categories', ['sort_order']).catch(() => {});

    // Only seed if empty
    const [[{ cnt }]] = await queryInterface.sequelize.query('SELECT COUNT(*) AS cnt FROM pdf_categories');
    if (cnt == 0) {
      await queryInterface.bulkInsert('pdf_categories', [
        { name: 'Study Materials',    slug: 'study-materials',    description: 'General study materials and notes',               icon: 'BookOpen',      color: '#3B82F6', sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
        { name: 'Previous Year Papers', slug: 'previous-year-papers', description: 'Previous year question papers and solutions', icon: 'FileText',      color: '#10B981', sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
        { name: 'Reference Books',    slug: 'reference-books',    description: 'Reference books and e-books',                     icon: 'Book',          color: '#8B5CF6', sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
        { name: 'Practice Sets',      slug: 'practice-sets',      description: 'Practice question sets and mock tests',           icon: 'Target',        color: '#F59E0B', sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },
        { name: 'Syllabus & Patterns', slug: 'syllabus-patterns', description: 'Exam syllabus and pattern documents',             icon: 'ClipboardList', color: '#EF4444', sort_order: 5, is_active: true, created_at: new Date(), updated_at: new Date() }
      ]).catch(() => {});
    }
  },
  async down(queryInterface) { await queryInterface.dropTable('pdf_categories'); }
};
