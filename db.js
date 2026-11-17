'use strict';
// طبقة قاعدة البيانات (SQLite المدمج في Node.js 22)
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'booking.db'));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- استثناءات الأيام: سعة خاصة أو فتح/إغلاق يدوي
CREATE TABLE IF NOT EXISTS days (
  date      TEXT PRIMARY KEY,          -- YYYY-MM-DD
  capacity  INTEGER,                   -- NULL = السعة الافتراضية
  is_closed INTEGER,                   -- NULL = حسب أيام العطلة الأسبوعية، 1 مغلق، 0 مفتوح
  note      TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ref_code    TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  national_id TEXT NOT NULL,
  phone       TEXT NOT NULL,
  case_type   TEXT,
  notes       TEXT,
  date        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','accepted','rejected','cancelled','postponed')),
  admin_note  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_nid ON bookings(national_id);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
`);

const DEFAULTS = {
  site_name: 'حجز موعد اللجنة الطبية',
  default_capacity: '10',
  min_days_ahead: '1',
  max_days_ahead: '60',
  off_days: '[5,6]', // 0=الأحد ... 5=الجمعة 6=السبت (العطلة: الجمعة والسبت)
  case_types: JSON.stringify(['كشف أولي', 'إعادة تقييم', 'تقرير عجز', 'إصابة عمل', 'أخرى']),
  instructions: 'يرجى الحضور قبل الموعد بنصف ساعة مع إحضار البطاقة الشخصية وجميع التقارير الطبية.',
};

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(pw, salt, 64);
  const orig = Buffer.from(hash, 'hex');
  return orig.length === test.length && crypto.timingSafeEqual(orig, test);
}

const insSetting = db.prepare('INSERT OR IGNORE INTO settings(key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(DEFAULTS)) insSetting.run(k, v);
insSetting.run('admin_password', hashPassword(process.env.ADMIN_PASSWORD || 'admin123'));

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const s = {};
  for (const r of rows) s[r.key] = r.value;
  return {
    site_name: s.site_name,
    default_capacity: Number(s.default_capacity),
    min_days_ahead: Number(s.min_days_ahead),
    max_days_ahead: Number(s.max_days_ahead),
    off_days: JSON.parse(s.off_days),
    case_types: JSON.parse(s.case_types),
    instructions: s.instructions,
    _password: s.admin_password,
  };
}
const upSetting = db.prepare('INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
function setSetting(key, value) {
  upSetting.run(key, typeof value === 'string' ? value : JSON.stringify(value));
}

module.exports = { db, getSettings, setSetting, hashPassword, verifyPassword };
