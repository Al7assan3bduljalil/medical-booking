'use strict';
// نظام حجز مواعيد اللجنة الطبية — خادم HTTP بلا مكتبات خارجية
process.removeAllListeners('warning');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { db, getSettings, setSetting, hashPassword, verifyPassword } = require('./db');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC = path.join(__dirname, 'public');
const ACTIVE = ['pending', 'accepted']; // الحالات التي تشغل مقعدًا في اليوم
const STATUSES = ['pending', 'accepted', 'rejected', 'cancelled', 'postponed'];
const SESSION_HOURS = 12;

// ---------- أدوات التاريخ ----------
function todayStr() {
  const d = new Date();
  return fmt(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
function fmt(y, m, d) { return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return fmt(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}
function weekday(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
function isDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
function monthDays(month) {
  const [y, m] = month.split('-').map(Number);
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: n }, (_, i) => fmt(y, m, i + 1));
}

// تحويل الأرقام العربية/الفارسية إلى لاتينية وإزالة الفراغات
function digits(s) {
  return String(s ?? '')
    .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 0x6f0))
    .replace(/[\s\-]/g, '');
}
function clean(s, max = 200) { return String(s ?? '').trim().replace(/\s+/g, ' ').slice(0, max); }

// ---------- منطق الأيام ----------
function dayInfo(date, settings, overrides, counts) {
  const today = todayStr();
  const first = addDays(today, settings.min_days_ahead);
  const last = addDays(today, settings.max_days_ahead);
  const o = overrides.get(date) || {};
  const capacity = o.capacity ?? settings.default_capacity;
  const booked = counts.get(date) || 0;
  const info = { date, capacity, booked, remaining: Math.max(0, capacity - booked), note: o.note || null, custom: o.capacity != null };
  const offDay = settings.off_days.includes(weekday(date));
  info.closed_manual = o.is_closed === 1;
  info.opened_manual = o.is_closed === 0;
  const closed = o.is_closed === 1 || (o.is_closed == null && offDay);
  if (date < first) info.state = 'past';
  else if (date > last) info.state = 'later';
  else if (closed) info.state = 'closed';
  else if (booked >= capacity) info.state = 'full';
  else info.state = 'available';
  return info;
}
function loadMonth(month) {
  const days = monthDays(month);
  const from = days[0], to = days[days.length - 1];
  const overrides = new Map(db.prepare('SELECT * FROM days WHERE date BETWEEN ? AND ?').all(from, to).map(r => [r.date, r]));
  const counts = new Map(db.prepare(`SELECT date, COUNT(*) c FROM bookings WHERE date BETWEEN ? AND ? AND status IN ('pending','accepted') GROUP BY date`).all(from, to).map(r => [r.date, r.c]));
  return { days, overrides, counts };
}
function singleDay(date) {
  const o = db.prepare('SELECT * FROM days WHERE date = ?').get(date);
  const c = db.prepare(`SELECT COUNT(*) c FROM bookings WHERE date = ? AND status IN ('pending','accepted')`).get(date).c;
  return dayInfo(date, getSettings(), new Map(o ? [[date, o]] : []), new Map([[date, c]]));
}

function newRef() {
  for (;;) {
    const n = crypto.randomInt(10000000, 99999999).toString();
    const ref = `${n.slice(0, 4)}-${n.slice(4)}`;
    if (!db.prepare('SELECT 1 FROM bookings WHERE ref_code = ?').get(ref)) return ref;
  }
}

// ---------- HTTP أدوات ----------
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
function send(res, status, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}
async function readBody(req) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > 100_000) throw new HttpError(413, 'الطلب كبير جدًا'); chunks.push(c); }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new HttpError(400, 'بيانات غير صالحة'); }
}
function cookies(req) {
  const out = {};
  for (const p of (req.headers.cookie || '').split(';')) {
    const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  }
  return out;
}
function isAdmin(req) {
  const t = cookies(req).admin_session;
  if (!t) return false;
  const row = db.prepare('SELECT expires_at FROM sessions WHERE token = ?').get(t);
  return !!row && row.expires_at > Date.now();
}
function clientIp(req) {
  return (req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || String(req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress || '').trim();
}
// تحديد بسيط لمعدل الطلبات
const hits = new Map();
function rateLimit(req, key, max, windowMs) {
  const k = `${key}:${clientIp(req)}`; const now = Date.now();
  const arr = (hits.get(k) || []).filter(t => now - t < windowMs);
  if (arr.length >= max) throw new HttpError(429, 'محاولات كثيرة، يرجى الانتظار قليلًا ثم المحاولة مجددًا');
  arr.push(now); hits.set(k, arr);
}
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) if (!a.some(t => now - t < 3600_000)) hits.delete(k); db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now); }, 600_000).unref();

const publicBooking = b => ({
  ref_code: b.ref_code, full_name: b.full_name, date: b.date, status: b.status, case_type: b.case_type,
  admin_note: b.admin_note, created_at: b.created_at, updated_at: b.updated_at,
});

// ---------- المسارات ----------
const routes = [];
function route(method, pattern, handler, opts = {}) {
  const keys = []; const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ method, re, keys, handler, admin: opts.admin });
}

// عام
route('GET', '/api/config', () => {
  const s = getSettings();
  return { site_name: s.site_name, case_types: s.case_types, min_days_ahead: s.min_days_ahead, max_days_ahead: s.max_days_ahead, instructions: s.instructions, today: todayStr() };
});

route('GET', '/api/calendar', (req, url) => {
  const month = url.searchParams.get('month') || todayStr().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) throw new HttpError(400, 'شهر غير صالح');
  const s = getSettings(); const { days, overrides, counts } = loadMonth(month);
  return { month, days: days.map(d => { const i = dayInfo(d, s, overrides, counts); return { date: d, state: i.state, remaining: i.state === 'available' ? i.remaining : 0, capacity: i.capacity }; }) };
});

route('POST', '/api/bookings', async (req) => {
  rateLimit(req, 'book', 10, 3600_000);
  const b = await readBody(req);
  const s = getSettings();
  const data = {
    full_name: clean(b.full_name, 120), national_id: digits(b.national_id).slice(0, 30), phone: digits(b.phone).replace(/^\+/, '00').slice(0, 20),
    case_type: clean(b.case_type, 60), notes: clean(b.notes, 500), date: String(b.date || ''),
  };
  if (data.full_name.split(' ').length < 3) throw new HttpError(400, 'يرجى كتابة الاسم الثلاثي على الأقل');
  if (!/^\d{5,20}$/.test(data.national_id)) throw new HttpError(400, 'الرقم الوطني غير صحيح، يجب أن يحتوي على أرقام فقط');
  if (!/^\d{7,15}$/.test(data.phone)) throw new HttpError(400, 'رقم الهاتف غير صحيح');
  if (data.case_type && !s.case_types.includes(data.case_type)) throw new HttpError(400, 'نوع الحالة غير صالح');
  if (!isDate(data.date)) throw new HttpError(400, 'يرجى اختيار يوم الموعد');

  db.exec('BEGIN IMMEDIATE');
  try {
    const existing = db.prepare(`SELECT ref_code, date FROM bookings WHERE national_id = ? AND status IN ('pending','accepted') AND date >= ?`).get(data.national_id, todayStr());
    if (existing) throw new HttpError(409, `لديك حجز قائم بالفعل بتاريخ ${existing.date} برقم ${existing.ref_code}. يمكنك الاستعلام عنه أو إلغاؤه قبل حجز موعد جديد.`);
    const info = singleDay(data.date);
    if (info.state === 'full') throw new HttpError(409, 'عذرًا، اكتمل هذا اليوم للتو. يرجى اختيار يوم آخر.');
    if (info.state !== 'available') throw new HttpError(409, 'هذا اليوم غير متاح للحجز');
    const ref = newRef();
    db.prepare('INSERT INTO bookings(ref_code, full_name, national_id, phone, case_type, notes, date) VALUES (?,?,?,?,?,?,?)')
      .run(ref, data.full_name, data.national_id, data.phone, data.case_type || null, data.notes || null, data.date);
    db.exec('COMMIT');
    return { ref_code: ref, date: data.date, status: 'pending', full_name: data.full_name, instructions: s.instructions };
  } catch (e) { db.exec('ROLLBACK'); throw e; }
});

route('POST', '/api/status', async (req) => {
  rateLimit(req, 'status', 30, 600_000);
  const b = await readBody(req);
  const nid = digits(b.national_id), phone = digits(b.phone).replace(/^\+/, '00'), ref = digits(b.ref_code);
  if (!nid || (!phone && !ref)) throw new HttpError(400, 'يرجى إدخال الرقم الوطني ورقم الهاتف');
  const rows = db.prepare('SELECT * FROM bookings WHERE national_id = ? ORDER BY date DESC, id DESC LIMIT 20').all(nid)
    .filter(r => (phone && r.phone === phone) || (ref && r.ref_code.replace('-', '') === ref));
  if (!rows.length) throw new HttpError(404, 'لا توجد طلبات مطابقة لهذه البيانات. تأكد من الرقم الوطني ورقم الهاتف المستخدمين عند الحجز.');
  return { bookings: rows.map(publicBooking), instructions: getSettings().instructions };
});

route('POST', '/api/bookings/cancel', async (req) => {
  rateLimit(req, 'cancel', 10, 600_000);
  const b = await readBody(req);
  const nid = digits(b.national_id), phone = digits(b.phone).replace(/^\+/, '00');
  const row = db.prepare('SELECT * FROM bookings WHERE ref_code = ? AND national_id = ? AND phone = ?').get(String(b.ref_code || ''), nid, phone);
  if (!row) throw new HttpError(404, 'الطلب غير موجود');
  if (row.status !== 'pending') throw new HttpError(409, 'لا يمكن إلغاء هذا الطلب لأنه لم يعد قيد الانتظار');
  db.prepare(`UPDATE bookings SET status='cancelled', admin_note=COALESCE(admin_note,'') || ?, updated_at=datetime('now') WHERE id=?`).run(row.admin_note ? ' — ألغاه المواطن' : 'ألغاه المواطن', row.id);
  return { ok: true };
});

// المدير
route('POST', '/api/admin/login', async (req, url, res) => {
  rateLimit(req, 'login', 10, 900_000);
  const b = await readBody(req);
  if (!verifyPassword(String(b.password || ''), getSettings()._password)) throw new HttpError(401, 'كلمة المرور غير صحيحة');
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions(token, expires_at) VALUES (?, ?)').run(token, Date.now() + SESSION_HOURS * 3600_000);
  const secure = (req.headers['x-forwarded-proto'] === 'https') ? '; Secure' : '';
  res.setHeader('Set-Cookie', `admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${secure}`);
  return { ok: true };
});
route('POST', '/api/admin/logout', (req, url, res) => {
  const t = cookies(req).admin_session; if (t) db.prepare('DELETE FROM sessions WHERE token = ?').run(t);
  res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  return { ok: true };
});
route('GET', '/api/admin/me', (req) => ({ admin: isAdmin(req) }));

route('GET', '/api/admin/settings', () => { const s = getSettings(); delete s._password; return s; }, { admin: true });
route('PUT', '/api/admin/settings', async (req) => {
  const b = await readBody(req);
  if (b.site_name != null) { const v = clean(b.site_name, 100); if (!v) throw new HttpError(400, 'اسم النظام مطلوب'); setSetting('site_name', v); }
  if (b.default_capacity != null) { const v = Number(b.default_capacity); if (!Number.isInteger(v) || v < 1 || v > 1000) throw new HttpError(400, 'السعة اليومية يجب أن تكون بين 1 و1000'); setSetting('default_capacity', String(v)); }
  if (b.min_days_ahead != null) { const v = Number(b.min_days_ahead); if (!Number.isInteger(v) || v < 0 || v > 60) throw new HttpError(400, 'قيمة غير صالحة'); setSetting('min_days_ahead', String(v)); }
  if (b.max_days_ahead != null) { const v = Number(b.max_days_ahead); if (!Number.isInteger(v) || v < 1 || v > 365) throw new HttpError(400, 'فترة الحجز يجب أن تكون بين 1 و365 يومًا'); setSetting('max_days_ahead', String(v)); }
  if (b.off_days != null) { if (!Array.isArray(b.off_days) || b.off_days.some(d => ![0, 1, 2, 3, 4, 5, 6].includes(d))) throw new HttpError(400, 'أيام العطلة غير صالحة'); setSetting('off_days', JSON.stringify([...new Set(b.off_days)])); }
  if (b.case_types != null) { const v = (Array.isArray(b.case_types) ? b.case_types : []).map(x => clean(x, 60)).filter(Boolean); if (!v.length) throw new HttpError(400, 'أضف نوع حالة واحدًا على الأقل'); setSetting('case_types', JSON.stringify(v)); }
  if (b.instructions != null) setSetting('instructions', clean(b.instructions, 1000));
  if (b.new_password) {
    if (String(b.new_password).length < 6) throw new HttpError(400, 'كلمة المرور الجديدة قصيرة جدًا (6 أحرف على الأقل)');
    if (!verifyPassword(String(b.current_password || ''), getSettings()._password)) throw new HttpError(400, 'كلمة المرور الحالية غير صحيحة');
    setSetting('admin_password', hashPassword(String(b.new_password)));
  }
  const s = getSettings(); delete s._password; return s;
}, { admin: true });

route('GET', '/api/admin/calendar', (req, url) => {
  const month = url.searchParams.get('month') || todayStr().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) throw new HttpError(400, 'شهر غير صالح');
  const s = getSettings(); const { days, overrides, counts } = loadMonth(month);
  const byStatus = new Map();
  for (const r of db.prepare('SELECT date, status, COUNT(*) c FROM bookings WHERE date BETWEEN ? AND ? GROUP BY date, status').all(days[0], days.at(-1))) {
    if (!byStatus.has(r.date)) byStatus.set(r.date, {}); byStatus.get(r.date)[r.status] = r.c;
  }
  return { month, today: todayStr(), days: days.map(d => ({ ...dayInfo(d, s, overrides, counts), off_day: s.off_days.includes(weekday(d)), statuses: byStatus.get(d) || {} })) };
}, { admin: true });

route('PUT', '/api/admin/days/:date', async (req, url, res, p) => {
  if (!isDate(p.date)) throw new HttpError(400, 'تاريخ غير صالح');
  const b = await readBody(req);
  const cur = db.prepare('SELECT * FROM days WHERE date = ?').get(p.date) || { capacity: null, is_closed: null, note: null };
  const next = { ...cur };
  if ('capacity' in b) { if (b.capacity === null || b.capacity === '') next.capacity = null; else { const v = Number(b.capacity); if (!Number.isInteger(v) || v < 0 || v > 1000) throw new HttpError(400, 'السعة غير صالحة'); next.capacity = v; } }
  if ('is_closed' in b) next.is_closed = b.is_closed === null ? null : (b.is_closed ? 1 : 0);
  if ('note' in b) next.note = clean(b.note, 200) || null;
  if (next.capacity == null && next.is_closed == null && !next.note) db.prepare('DELETE FROM days WHERE date = ?').run(p.date);
  else db.prepare('INSERT INTO days(date, capacity, is_closed, note) VALUES (?,?,?,?) ON CONFLICT(date) DO UPDATE SET capacity=excluded.capacity, is_closed=excluded.is_closed, note=excluded.note').run(p.date, next.capacity, next.is_closed, next.note);
  return singleDay(p.date);
}, { admin: true });

function bookingFilter(url) {
  const where = [], args = [];
  const date = url.searchParams.get('date'), from = url.searchParams.get('from'), to = url.searchParams.get('to');
  const status = url.searchParams.get('status'), q = (url.searchParams.get('q') || '').trim();
  if (date) { where.push('date = ?'); args.push(date); }
  if (from) { where.push('date >= ?'); args.push(from); }
  if (to) { where.push('date <= ?'); args.push(to); }
  if (status && STATUSES.includes(status)) { where.push('status = ?'); args.push(status); }
  if (q) { const dq = digits(q); where.push('(full_name LIKE ? OR national_id LIKE ? OR phone LIKE ? OR ref_code LIKE ?)'); args.push(`%${q}%`, `%${dq}%`, `%${dq}%`, `%${dq}%`); }
  return { sql: where.length ? 'WHERE ' + where.join(' AND ') : '', args };
}
route('GET', '/api/admin/bookings', (req, url) => {
  const f = bookingFilter(url);
  const rows = db.prepare(`SELECT * FROM bookings ${f.sql} ORDER BY date ASC, id ASC LIMIT 1000`).all(...f.args);
  return { bookings: rows };
}, { admin: true });

route('GET', '/api/admin/bookings.csv', (req, url, res) => {
  const f = bookingFilter(url);
  const rows = db.prepare(`SELECT * FROM bookings ${f.sql} ORDER BY date ASC, id ASC`).all(...f.args);
  const labels = { pending: 'قيد الانتظار', accepted: 'مقبول', rejected: 'مرفوض', cancelled: 'ملغي', postponed: 'مؤجل' };
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['رقم الطلب', 'الاسم', 'الرقم الوطني', 'الهاتف', 'نوع الحالة', 'ملاحظات المواطن', 'التاريخ', 'الحالة', 'ملاحظة الإدارة', 'تاريخ الإنشاء'].map(esc).join(',')];
  for (const r of rows) lines.push([r.ref_code, r.full_name, r.national_id, r.phone, r.case_type, r.notes, r.date, labels[r.status], r.admin_note, r.created_at].map(esc).join(','));
  res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="bookings.csv"' });
  res.end('﻿' + lines.join('\r\n'));
  return undefined;
}, { admin: true });

route('PATCH', '/api/admin/bookings/:id', async (req, url, res, p) => {
  const b = await readBody(req);
  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(Number(p.id));
  if (!row) throw new HttpError(404, 'الحجز غير موجود');
  const status = b.status ?? row.status;
  if (!STATUSES.includes(status)) throw new HttpError(400, 'حالة غير صالحة');
  const note = 'admin_note' in b ? (clean(b.admin_note, 500) || null) : row.admin_note;
  let date = row.date;
  if (b.date && b.date !== row.date) {
    if (!isDate(b.date)) throw new HttpError(400, 'تاريخ غير صالح');
    date = b.date;
  }
  db.prepare(`UPDATE bookings SET status=?, admin_note=?, date=?, updated_at=datetime('now') WHERE id=?`).run(status, note, date, row.id);
  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(row.id);
}, { admin: true });

route('GET', '/api/admin/stats', () => {
  const t = todayStr();
  const q = (sql, ...a) => db.prepare(sql).get(...a).c;
  const upcoming = db.prepare(`SELECT date, COUNT(*) c FROM bookings WHERE date >= ? AND status IN ('pending','accepted') GROUP BY date ORDER BY date LIMIT 7`).all(t);
  return {
    today: t,
    today_count: q(`SELECT COUNT(*) c FROM bookings WHERE date = ? AND status IN ('pending','accepted')`, t),
    pending: q(`SELECT COUNT(*) c FROM bookings WHERE status = 'pending'`),
    upcoming_total: q(`SELECT COUNT(*) c FROM bookings WHERE date >= ? AND status IN ('pending','accepted')`, t),
    new_24h: q(`SELECT COUNT(*) c FROM bookings WHERE created_at >= datetime('now','-1 day')`),
    total: q('SELECT COUNT(*) c FROM bookings'),
    upcoming: upcoming.map(u => ({ ...u, capacity: singleDay(u.date).capacity })),
  };
}, { admin: true });

// ---------- الملفات الثابتة ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
function serveStatic(req, res, pathname) {
  let p = decodeURIComponent(pathname);
  if (p === '/' || p === '/admin' || p === '/admin/') p = '/index.html';
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { // SPA fallback
      return fs.readFile(path.join(PUBLIC, 'index.html'), (e2, html) => { res.writeHead(e2 ? 404 : 200, { 'Content-Type': MIME['.html'] }); res.end(html); });
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': path.extname(file) === '.html' ? 'no-cache' : 'public, max-age=300' });
    res.end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/healthz') { res.writeHead(200); return res.end('ok'); }
  if (!url.pathname.startsWith('/api/')) return serveStatic(req, res, url.pathname);
  try {
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = url.pathname.match(r.re); if (!m) continue;
      if (r.admin && !isAdmin(req)) throw new HttpError(401, 'يرجى تسجيل الدخول');
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      const out = await r.handler(req, url, res, params);
      if (out !== undefined) send(res, 200, out);
      return;
    }
    throw new HttpError(404, 'غير موجود');
  } catch (e) {
    if (!(e instanceof HttpError)) console.error(e);
    send(res, e.status || 500, { error: e.status ? e.message : 'حدث خطأ غير متوقع، يرجى المحاولة لاحقًا' });
  }
});

server.listen(PORT, () => {
  console.log(`✔ نظام الحجز يعمل على http://localhost:${PORT}  (لوحة المدير: /#/admin)`);
  if (!process.env.ADMIN_PASSWORD) console.log('⚠ كلمة مرور المدير الافتراضية admin123 — غيّرها من الإعدادات أو عبر متغير ADMIN_PASSWORD قبل أول تشغيل.');
});
