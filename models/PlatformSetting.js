'use strict';

/**
 * Generic key/value table for admin-editable platform settings exposed (some of
 * them) to the public API.  Examples currently in use:
 *   key='signup_intro_video_url'    value='<youtube embed url>'
 *   key='telegram_channel_url'      value='https://t.me/planprep4u'
 *
 * If you add a new key that should be readable by non-admins, also add it to
 * PUBLIC_SETTING_KEYS in routes/settingsRoutes.js.
 */
module.exports = (sequelize, DataTypes) => {
  const PlatformSetting = sequelize.define('PlatformSetting', {
    key: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'platform_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return PlatformSetting;
};
