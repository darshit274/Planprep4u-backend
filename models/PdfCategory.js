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
    access_level: {
      type: DataTypes.ENUM('free', 'premium', 'restricted'),
      allowNull: false,
      defaultValue: 'free',
      comment: 'Root folders only: determines access for all PDFs inside'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Root folders only: price when access_level is premium'
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'INR'
    },
    is_free_override: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Sub-folders only: marks this sub-folder free even inside a premium root'
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