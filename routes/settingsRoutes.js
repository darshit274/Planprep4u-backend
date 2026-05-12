const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { PlatformSetting } = require('../models');
const { adminAuth, requireRole } = require('../utils/AdminAuth');

// Whitelist of keys exposed via the public endpoint. Adding a key here makes it
// readable by anyone — anything sensitive (API keys, internal IDs, etc.) must
// stay off this list and only be served via authenticated routes if at all.
const PUBLIC_SETTING_KEYS = [
  'signup_intro_video_url',
  'telegram_channel_url',
];

const writeRoles = requireRole(['super_admin', 'admin']);

// Best-effort table bootstrap — runs once at first import. Avoids a separate
// migration step for a single-table feature; idempotent.
let bootstrapped = false;
async function ensureTable() {
  if (bootstrapped) return;
  try {
    await PlatformSetting.sync();
    bootstrapped = true;
  } catch (err) {
    console.error('PlatformSetting.sync failed:', err);
  }
}

// GET /api/settings/public — unauthenticated, returns just the whitelisted keys.
router.get('/public', async (req, res) => {
  try {
    await ensureTable();
    const rows = await PlatformSetting.findAll({
      where: { key: PUBLIC_SETTING_KEYS },
      attributes: ['key', 'value'],
    });
    const out = {};
    for (const k of PUBLIC_SETTING_KEYS) out[k] = null;
    rows.forEach(r => { out[r.key] = r.value; });
    res.json({ success: true, data: out });
  } catch (err) {
    console.error('GET /settings/public failed:', err);
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
});

// GET /api/admin/settings — admin only, returns every key/value (for the admin UI).
router.get('/admin', adminAuth, async (req, res) => {
  try {
    await ensureTable();
    const rows = await PlatformSetting.findAll({ attributes: ['key', 'value', 'updated_at'] });
    const out = {};
    rows.forEach(r => { out[r.key] = r.value; });
    // Make sure the admin UI sees every public key even if not yet stored.
    for (const k of PUBLIC_SETTING_KEYS) {
      if (!(k in out)) out[k] = null;
    }
    res.json({ success: true, data: out });
  } catch (err) {
    console.error('GET /settings/admin failed:', err);
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
});

// === Intro-video file upload ===
// Admins can either paste a YouTube/Vimeo URL into signup_intro_video_url OR
// upload an actual video file. On upload we persist the file under
// uploads/intro_videos/ (served by app.use('/uploads', express.static('uploads')))
// and write its public URL into the same setting key.
const introVideoDir = path.resolve(path.join(__dirname, '..', 'uploads', 'intro_videos'));
fs.mkdirSync(introVideoDir, { recursive: true });

const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
]);

const introVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, introVideoDir),
  filename: (req, file, cb) => {
    // Server-generated filename — never trust client-supplied originalname for
    // the on-disk path; only preserve the extension.
    const ext = (path.extname(file.originalname || '') || '').toLowerCase().slice(0, 8);
    const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : '.mp4';
    cb(null, `intro-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`);
  },
});

const introVideoUpload = multer({
  storage: introVideoStorage,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 }, // 50 MB cap
  fileFilter: (req, file, cb) => {
    if (ALLOWED_VIDEO_MIMES.has(file.mimetype)) return cb(null, true);
    cb(new Error('Only MP4 / WebM / OGG / MOV video files are allowed'));
  },
}).single('video');

// POST /api/settings/admin/upload-intro-video — admin only, saves the uploaded
// file to uploads/intro_videos/ and updates the signup_intro_video_url setting
// to the new public URL. Response includes the URL so the admin UI can display it.
router.post('/admin/upload-intro-video', adminAuth, writeRoles, (req, res) => {
  introVideoUpload(req, res, async (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Video too large (max 50 MB).' : err.message;
      return res.status(400).json({ success: false, message: msg });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }
    try {
      await ensureTable();

      // Construct the public URL the static middleware will serve.
      const serverBase = (process.env.SERVER_URL || '').replace(/\/$/, '')
        || `${req.protocol}://${req.get('host')}`;
      const publicUrl = `${serverBase}/uploads/intro_videos/${req.file.filename}`;

      // Update the platform setting in one shot so the front-end picks it up
      // on the very next /settings/public read.
      await PlatformSetting.upsert({ key: 'signup_intro_video_url', value: publicUrl });

      res.json({
        success: true,
        data: {
          url: publicUrl,
          filename: req.file.filename,
          size: req.file.size,
        },
      });
    } catch (e) {
      console.error('upload-intro-video failed:', e);
      res.status(500).json({ success: false, message: 'Failed to save intro video' });
    }
  });
});

// PUT /api/admin/settings/:key — upsert a single setting. super_admin / admin only.
router.put('/admin/:key', adminAuth, writeRoles, async (req, res) => {
  try {
    await ensureTable();
    const { key } = req.params;
    const { value } = req.body || {};

    if (!key || typeof key !== 'string' || key.length > 100) {
      return res.status(400).json({ success: false, message: 'Invalid key' });
    }
    if (value !== null && typeof value !== 'string') {
      return res.status(400).json({ success: false, message: 'Value must be a string or null' });
    }

    const [row] = await PlatformSetting.upsert({ key, value: value ?? null });
    res.json({ success: true, data: { key: row.key, value: row.value } });
  } catch (err) {
    console.error('PUT /settings/admin/:key failed:', err);
    res.status(500).json({ success: false, message: 'Failed to save setting' });
  }
});

module.exports = router;
