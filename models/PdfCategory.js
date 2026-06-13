module.exports = (sequelize, DataTypes) => {
  const PdfCategory = sequelize.define('PdfCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Category name (e.g., Study Materials, Previous Papers, etc.)'
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'URL-friendly version of name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Icon name for category display'
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#3B82F6',
      comment: 'Hex color code for category'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Display order for categories'
    },
    parent_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Parent category for nested hierarchy (null = root level)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'pdf_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations
  PdfCategory.associate = function(models) {
    PdfCategory.hasMany(models.Pdfs, {
      foreignKey: 'category_id',
      as: 'pdfs'
    });

    // Self-referencing hierarchy (mirrors Category in course management)
    PdfCategory.belongsTo(models.PdfCategory, {
      foreignKey: 'parent_category_id',
      as: 'parentCategory'
    });
    PdfCategory.hasMany(models.PdfCategory, {
      foreignKey: 'parent_category_id',
      as: 'childCategories'
    });
  };

  return PdfCategory;
};