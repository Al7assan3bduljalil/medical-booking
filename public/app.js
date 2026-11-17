'use strict';
// ========== أدوات ==========
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = () => $('#app');

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  calcheck: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  id: '<rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="8" cy="12" r="2.5"/><path d="M14 10h5M14 14h4"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  steth: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
  note: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkc: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  xc: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  pause: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18M10 14v4M14 14v4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  chart: '<path d="M3 3v18h18M7 16v-5M12 16V8M17 16v-9"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01M13 4.6v16.8a.5.5 0 0 1-.6.5L5 20V5.6a1 1 0 0 1 .7-1L12 3.1a.8.8 0 0 1 1 .8z"/>',
};
const I = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg>`;

const STATUS = {
  pending:   { label: 'قيد الانتظار', icon: 'clock',  msg: 'طلبك مسجّل وبانتظار العرض على اللجنة الطبية. يرجى الحضور في موعدك المحدد.' },
  accepted:  { label: 'مقبول',        icon: 'checkc', msg: 'تم قبول طلبك من قبل اللجنة الطبية.' },
  rejected:  { label: 'مرفوض',        icon: 'xc',     msg: 'نأسف، لم تتم الموافقة على الطلب. اطّلع على ملاحظة الإدارة إن وجدت.' },
  cancelled: { label: 'ملغي',         icon: 'ban',    msg: 'تم إلغاء هذا الطلب. يمكنك حجز موعد جديد في أي وقت.' },
  postponed: { label: 'مؤجل',         icon: 'pause',  msg: 'تم تأجيل موعدك. سيتم التواصل معك، أو اطّلع على ملاحظة الإدارة.' },
};
const badge = s => `<span class="badge s-${s}">${I(STATUS[s].icon)} ${STATUS[s].label}</span>`;

const WD_SHORT = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const WD_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const toUTC = d => { const [y, m, dd] = d.split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd)); };
const fmtDate = (d, opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) => new Intl.DateTimeFormat('ar-u-nu-latn', { ...opts, timeZone: 'UTC' }).format(toUTC(d));
const fmtMonth = m => new Intl.DateTimeFormat('ar-u-nu-latn', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(toUTC(m + '-01'));
const shiftMonth = (m, n) => { const [y, mm] = m.split('-').map(Number); const d = new Date(Date.UTC(y, mm - 1 + n, 1)); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`; };
const toLatin = s => String(s).replace(/[٠-٩]/g, c => c.charCodeAt(0) - 0x660).replace(/[۰-۹]/g, c => c.charCodeAt(0) - 0x6f0);

function toast(msg) {
  $$('.toast').forEach(x => x.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
}
function modal(html, onMount) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal" role="dialog">${html}</div>`;
  const close = () => bg.remove();
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  document.body.appendChild(bg);
  onMount && onMount(bg.firstElementChild, close);
  return close;
}
function confirmBox(title, text, okLabel = 'تأكيد', danger = false) {
  return new Promise(resolve => {
    modal(`<h3>${esc(title)}</h3><p class="muted">${esc(text)}</p>
      <div class="btn-row"><button class="btn ${danger ? 'danger' : ''}" data-ok>${esc(okLabel)}</button><button class="btn light" data-no>تراجع</button></div>`,
      (m, close) => {
        $('[data-ok]', m).onclick = () => { close(); resolve(true); };
        $('[data-no]', m).onclick = () => { close(); resolve(false); };
      });
  });
}
const alertBox = (type, msg) => `<div class="alert ${type}">${I(type === 'error' ? 'alert' : type === 'ok' ? 'checkc' : 'info')}<div>${esc(msg)}</div></div>`;
const loading = () => `<div class="loading"><div class="spinner"></div>جارٍ التحميل…</div>`;

let CONFIG = { site_name: 'حجز موعد اللجنة الطبية', case_types: [] };

function layout(content, { back = false, title, subtitle, wide = false, right = '' } = {}) {
  document.title = title ? `${title} — ${CONFIG.site_name}` : CONFIG.site_name;
  app().innerHTML = `
  <header class="topbar"><div class="inner ${wide ? 'wide' : ''}">
    <div class="logo">${I('steth')}</div>
    <div><h1>${esc(title || CONFIG.site_name)}</h1><small>${esc(subtitle || (title ? CONFIG.site_name : 'احجز موعدك بسهولة واستعلم عن طلبك'))}</small></div>
    ${back ? `<a class="back" href="#/">${I('home')} <span class="hide-sm">الرئيسية</span></a>` : ''}${right}
  </div></header>
  <main class="${wide ? 'wide' : ''}">${content}</main>
  <footer>${esc(CONFIG.site_name)}</footer>`;
  window.scrollTo(0, 0);
}

// ========== التقويم ==========
function calendarHTML(data, { selected, admin = false } = {}) {
  const first = data.days[0].date;
  const offset = (toUTC(first).getUTCDay() + 1) % 7; // الأسبوع يبدأ السبت
  let html = WD_SHORT.map(w => `<div class="wd">${admin ? w : w.replace('ال', '')}</div>`).join('');
  html += '<div></div>'.repeat(offset);
  const today = data.today || CONFIG.today;
  for (const d of data.days) {
    const n = Number(d.date.slice(8));
    const cls = ['day', d.state];
    if (d.date === selected) cls.push('selected');
    if (d.date === today) cls.push('today');
    if (admin) {
      const pct = d.capacity ? Math.min(100, Math.round(d.booked / d.capacity * 100)) : 100;
      let tag = '';
      if (d.state === 'closed') tag = 'مغلق';
      else if (d.state === 'full') tag = 'مكتمل';
      else if (d.custom) tag = 'سعة خاصة';
      html += `<button class="${cls.join(' ')}" data-date="${d.date}" type="button"><span>${n}</span>
        <small>${d.booked}/${d.capacity}</small><span class="bar"><i style="width:${pct}%"></i></span>${tag ? `<span class="tag">${tag}</span>` : ''}</button>`;
    } else {
      let sub = '';
      if (d.state === 'available') { if (d.remaining <= Math.max(2, Math.ceil(d.capacity * 0.2))) cls.push('few'); sub = `متبقي ${d.remaining}`; }
      else if (d.state === 'full') sub = 'مكتمل';
      else if (d.state === 'closed') sub = 'مغلق';
      const can = d.state === 'available';
      html += `<button class="${cls.join(' ')}" ${can ? `data-date="${d.date}"` : 'disabled'} type="button" aria-label="${fmtDate(d.date)} ${sub}">${n}${sub ? `<small>${sub}</small>` : ''}</button>`;
    }
  }
  return `<div class="cal ${admin ? 'admin' : ''}">${html}</div>`;
}
const legendHTML = () => `<div class="legend">
  <span><i style="background:var(--ok-bg);border:1px solid var(--ok)"></i>متاح</span>
  <span><i style="background:var(--warn-bg);border:1px solid var(--warn)"></i>أماكن قليلة</span>
  <span><i style="background:var(--bad-bg);border:1px solid var(--bad)"></i>مكتمل</span>
  <span><i style="background:var(--gray-bg);border:1px solid var(--gray)"></i>مغلق / عطلة</span></div>`;

// ========== الصفحة الرئيسية ==========
function pageHome() {
  layout(`
    <div class="big-actions">
      <a class="big-btn" href="#/book"><div class="ico green">${I('calcheck')}</div><div><b>حجز موعد جديد</b><span>اختر اليوم المناسب واحجز موعدك للعرض على اللجنة</span></div>${I('left', 'i arrow')}</a>
      <a class="big-btn" href="#/status"><div class="ico blue">${I('search')}</div><div><b>الاستعلام عن طلب</b><span>اعرف حالة طلبك: مقبول، مرفوض، مؤجل أو قيد الانتظار</span></div>${I('left', 'i arrow')}</a>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>كيف يتم الحجز؟</h3>
      <div class="steps3">
        <div><div class="n">${I('calendar')}</div><p>اختر يومًا متاحًا من التقويم</p></div>
        <div><div class="n">${I('id')}</div><p>أدخل بياناتك الأساسية</p></div>
        <div><div class="n">${I('checkc')}</div><p>احتفظ برقم الطلب للاستعلام</p></div>
      </div>
    </div>
    ${CONFIG.instructions ? `<div class="card">${alertBox('info', CONFIG.instructions)}</div>` : ''}
  `);
}

// ========== الحجز ==========
const book = { step: 1, date: null, month: null, form: {} };
function stepper(n) {
  return `<div class="stepper">${['اختيار اليوم', 'البيانات', 'التأكيد'].map((t, i) => `<div class="${i < n ? 'on' : ''}">${t}</div>`).join('')}</div>`;
}
async function pageBook() {
  if (book.step === 4) book.step = 1;
  if (!book.month) book.month = (CONFIG.first_date || CONFIG.today).slice(0, 7);
  renderBook();
}
function renderBook() {
  if (book.step === 1) return bookStep1();
  if (book.step === 2) return bookStep2();
  if (book.step === 3) return bookStep3();
}
async function bookStep1(err) {
  layout(`<div class="card">${stepper(1)}<h2>${I('calendar')} اختر يوم الموعد</h2><p class="muted">الأيام الخضراء متاحة للحجز. اضغط على اليوم المناسب لك.</p>
    ${err ? alertBox('error', err) : ''}<div id="cal">${loading()}</div>${legendHTML()}</div>`, { back: true, title: 'حجز موعد جديد' });
  await loadPublicCal();
}
async function loadPublicCal() {
  const box = $('#cal'); if (!box) return;
  const minM = CONFIG.today.slice(0, 7), maxM = CONFIG.last_date.slice(0, 7);
  try {
    const data = await API.get('/api/calendar?month=' + book.month);
    box.innerHTML = `<div class="cal-head">
      <button class="icon-btn" data-nav="-1" ${book.month <= minM ? 'disabled' : ''} aria-label="الشهر السابق">${I('right')}</button>
      <b>${fmtMonth(book.month)}</b>
      <button class="icon-btn" data-nav="1" ${book.month >= maxM ? 'disabled' : ''} aria-label="الشهر التالي">${I('left')}</button></div>
      ${calendarHTML(data, { selected: book.date })}
      ${data.days.some(d => d.state === 'available') ? '' : `<div class="alert info" style="margin-top:12px">${I('info')}<div>لا توجد أيام متاحة في هذا الشهر. جرّب الشهر التالي.</div></div>`}`;
    $$('[data-nav]', box).forEach(b => b.onclick = () => { book.month = shiftMonth(book.month, Number(b.dataset.nav)); loadPublicCal(); });
    $$('.day[data-date]', box).forEach(b => b.onclick = () => { book.date = b.dataset.date; book.step = 2; renderBook(); });
  } catch (e) { box.innerHTML = alertBox('error', e.message); }
}
function chosenBox(withChange = true) {
  return `<div class="chosen">${I('calcheck')}<div><span class="muted">موعدك</span><b>${fmtDate(book.date)}</b></div>
    ${withChange ? `<button class="btn light small" style="margin-inline-start:auto" data-change>تغيير</button>` : ''}</div>`;
}
function bookStep2(err) {
  const f = book.form;
  layout(`<div class="card">${stepper(2)}<h2>${I('user')} بياناتك</h2><p class="muted">أدخل بياناتك كما في البطاقة الشخصية.</p>
    ${chosenBox()}${err ? alertBox('error', err) : ''}
    <form id="bf" novalidate>
      <div class="field"><label>${I('user')} الاسم الكامل</label><input name="full_name" required autocomplete="name" value="${esc(f.full_name)}" placeholder="الاسم الثلاثي أو الرباعي"></div>
      <div class="field"><label>${I('id')} الرقم الوطني</label><input name="national_id" required inputmode="numeric" value="${esc(f.national_id)}" placeholder="أرقام فقط"></div>
      <div class="field"><label>${I('phone')} رقم الهاتف</label><input name="phone" type="tel" required inputmode="tel" autocomplete="tel" value="${esc(f.phone)}" placeholder="09xxxxxxxx"><div class="hint">سنستخدمه مع الرقم الوطني للاستعلام عن طلبك.</div></div>
      <div class="field"><label>${I('steth')} نوع الحالة</label><select name="case_type"><option value="">— اختر —</option>${CONFIG.case_types.map(c => `<option ${f.case_type === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
      <div class="field"><label>${I('note')} ملاحظة (اختياري)</label><textarea name="notes" rows="3" maxlength="500" placeholder="أي معلومة تود إضافتها">${esc(f.notes)}</textarea></div>
      <div class="btn-row"><button class="btn" type="submit">متابعة ${I('left')}</button><button class="btn light" type="button" data-change>رجوع</button></div>
    </form></div>`, { back: true, title: 'حجز موعد جديد' });
  $$('[data-change]').forEach(b => b.onclick = () => { saveForm(); book.step = 1; renderBook(); });
  $('#bf').onsubmit = e => {
    e.preventDefault(); saveForm();
    const v = validate(book.form);
    if (v) return bookStep2(v);
    book.step = 3; renderBook();
  };
}
function saveForm() { const fd = new FormData($('#bf')); book.form = Object.fromEntries([...fd].map(([k, v]) => [k, String(v).trim()])); }
function validate(f) {
  if (f.full_name.split(/\s+/).length < 3) return 'يرجى كتابة الاسم الثلاثي على الأقل';
  const nid = toLatin(f.national_id).replace(/\s|-/g, ''); if (!/^\d{5,20}$/.test(nid)) return 'الرقم الوطني يجب أن يحتوي على أرقام فقط';
  const ph = toLatin(f.phone).replace(/\s|-/g, '').replace(/^\+/, '00'); if (!/^\d{7,15}$/.test(ph)) return 'رقم الهاتف غير صحيح';
  if (!f.case_type) return 'يرجى اختيار نوع الحالة';
  return null;
}
function bookStep3(err) {
  const f = book.form;
  layout(`<div class="card">${stepper(3)}<h2>${I('checkc')} راجع بياناتك</h2><p class="muted">تأكد من صحة البيانات قبل تأكيد الحجز.</p>
    ${chosenBox(false)}${err ? alertBox('error', err) : ''}
    <dl class="kv"><dt>الاسم</dt><dd>${esc(f.full_name)}</dd><dt>الرقم الوطني</dt><dd class="mono">${esc(toLatin(f.national_id))}</dd>
      <dt>الهاتف</dt><dd class="mono">${esc(toLatin(f.phone))}</dd><dt>نوع الحالة</dt><dd>${esc(f.case_type)}</dd>${f.notes ? `<dt>ملاحظة</dt><dd>${esc(f.notes)}</dd>` : ''}</dl>
    <div class="btn-row"><button class="btn" id="confirm">${I('check')} تأكيد الحجز</button><button class="btn light" id="edit">${I('edit')} تعديل</button></div></div>`,
    { back: true, title: 'حجز موعد جديد' });
  $('#edit').onclick = () => { book.step = 2; renderBook(); };
  $('#confirm').onclick = async (e) => {
    e.target.disabled = true; e.target.innerHTML = 'جارٍ الحجز…';
    try {
      const r = await API.post('/api/bookings', { ...f, date: book.date });
      book.step = 4; bookSuccess(r);
    } catch (er) {
      if (er.status === 409 && /اكتمل|غير متاح/.test(er.message)) { book.date = null; book.step = 1; return bookStep1(er.message); }
      bookStep3(er.message);
    }
  };
}
function bookSuccess(r) {
  const form = book.form;
  layout(`<div class="card success">
    <div class="big-ico" style="background:var(--ok-bg);color:var(--ok)">${I('checkc')}</div>
    <h2>تم الحجز بنجاح</h2><p class="muted">احتفظ برقم الطلب التالي، ستحتاجه للاستعلام عن حالة طلبك.</p>
    <div class="ref">${esc(r.ref_code)}</div>
    <dl class="kv"><dt>الاسم</dt><dd>${esc(r.full_name)}</dd><dt>الموعد</dt><dd>${fmtDate(r.date)}</dd><dt>الحالة</dt><dd>${badge('pending')}</dd></dl>
    ${r.instructions ? alertBox('info', r.instructions) : ''}
    <div class="btn-row no-print"><button class="btn light" onclick="window.print()">${I('print')} طباعة / حفظ</button><a class="btn" href="#/status">${I('search')} الاستعلام عن الطلب</a></div>
    <p class="no-print"><a href="#/">العودة للرئيسية</a></p></div>`, { back: true, title: 'تم الحجز' });
  sessionStorage.setItem('last_lookup', JSON.stringify({ national_id: form.national_id, phone: form.phone }));
  book.date = null; book.form = {}; book.month = null;
}

// ========== الاستعلام ==========
function pageStatus(err, prefill) {
  const p = prefill || JSON.parse(sessionStorage.getItem('last_lookup') || '{}');
  layout(`<div class="card"><h2>${I('search')} الاستعلام عن طلب</h2><p class="muted">أدخل الرقم الوطني ورقم الهاتف اللذين استخدمتهما عند الحجز.</p>
    ${err ? alertBox('error', err) : ''}
    <form id="sf" novalidate>
      <div class="field"><label>${I('id')} الرقم الوطني</label><input name="national_id" inputmode="numeric" required value="${esc(p.national_id)}"></div>
      <div class="field"><label>${I('phone')} رقم الهاتف</label><input name="phone" type="tel" inputmode="tel" required value="${esc(p.phone)}"></div>
      <button class="btn block" type="submit">${I('search')} استعلام</button>
    </form></div><div id="results"></div>`, { back: true, title: 'الاستعلام عن طلب' });
  $('#sf').onsubmit = async e => {
    e.preventDefault();
    const q = Object.fromEntries(new FormData(e.target));
    if (!q.national_id.trim() || !q.phone.trim()) return pageStatus('يرجى إدخال الرقم الوطني ورقم الهاتف', q);
    $('#results').innerHTML = loading();
    try {
      const r = await API.post('/api/status', q);
      sessionStorage.setItem('last_lookup', JSON.stringify(q));
      renderResults(r, q);
    } catch (er) { $('#results').innerHTML = `<div class="card">${alertBox('error', er.message)}</div>`; }
  };
  if (p.national_id && p.phone && !err) $('#sf').requestSubmit();
}
function renderResults(r, q) {
  $('#results').innerHTML = r.bookings.map(b => {
    const s = STATUS[b.status];
    return `<div class="card status-card s-${b.status}">
      <div class="status-head"><div class="status-ico">${I(s.icon)}</div><div><span class="muted">حالة الطلب</span><div style="font-size:21px;font-weight:800;color:var(--c)">${s.label}</div></div></div>
      <dl class="kv"><dt>رقم الطلب</dt><dd class="mono">${esc(b.ref_code)}</dd><dt>الاسم</dt><dd>${esc(b.full_name)}</dd><dt>الموعد</dt><dd>${fmtDate(b.date)}</dd>${b.case_type ? `<dt>نوع الحالة</dt><dd>${esc(b.case_type)}</dd>` : ''}</dl>
      <div class="status-msg">${esc(s.msg)}</div>
      ${b.admin_note ? `<div class="alert info" style="margin-top:10px">${I('note')}<div><b>ملاحظة الإدارة:</b> ${esc(b.admin_note)}</div></div>` : ''}
      ${b.status === 'pending' && b.date >= CONFIG.today ? `<div style="margin-top:12px"><button class="btn danger small" data-cancel="${esc(b.ref_code)}">${I('ban')} إلغاء الحجز</button></div>` : ''}
    </div>`;
  }).join('');
  $$('[data-cancel]').forEach(btn => btn.onclick = async () => {
    if (!await confirmBox('إلغاء الحجز', 'هل أنت متأكد من إلغاء هذا الحجز؟ سيصبح المكان متاحًا لغيرك.', 'نعم، ألغِ الحجز', true)) return;
    try { await API.post('/api/bookings/cancel', { ...q, ref_code: btn.dataset.cancel }); toast('تم إلغاء الحجز'); const r2 = await API.post('/api/status', q); renderResults(r2, q); }
    catch (e) { toast(e.message); }
  });
}

// ========== لوحة المدير ==========
const adm = { tab: 'overview', month: null, filters: { from: null, status: '', q: '', date: '' }, settings: null };
async function pageAdmin(sub) {
  const me = await API.get('/api/admin/me').catch(() => ({ admin: false }));
  if (!me.admin) return adminLogin();
  adm.tab = sub || 'overview';
  const tabs = [['overview', 'chart', 'الرئيسية'], ['bookings', 'list', 'الحجوزات'], ['days', 'calendar', 'الأيام والسعة'], ['settings', 'settings', 'الإعدادات']];
  layout(`<nav class="tabs">${tabs.map(([k, ic, t]) => `<button class="${adm.tab === k ? 'on' : ''}" data-tab="${k}">${I(ic)} ${t}</button>`).join('')}</nav><div id="tab">${loading()}</div>`,
    { title: 'لوحة تحكم المدير', subtitle: CONFIG.site_name, wide: true, right: `<a class="back" href="#/" title="واجهة المواطن">${I('home')}</a><button class="back" style="margin-inline-start:6px" id="logout" title="خروج">${I('logout')}</button>` });
  $$('[data-tab]').forEach(b => b.onclick = () => { location.hash = '#/admin/' + b.dataset.tab; });
  $('#logout').onclick = async () => { await API.post('/api/admin/logout'); location.hash = '#/admin'; route(); };
  try { await ({ overview: adminOverview, bookings: adminBookings, days: adminDays, settings: adminSettings }[adm.tab] || adminOverview)(); }
  catch (e) { if (e.status === 401) return adminLogin(); $('#tab').innerHTML = `<div class="card">${alertBox('error', e.message)}</div>`; }
}
function adminLogin(err) {
  layout(`<div class="card" style="max-width:420px;margin:auto"><h2>${I('lock')} دخول المدير</h2>${err ? alertBox('error', err) : ''}
    <form id="lf"><div class="field"><label>${I('lock')} كلمة المرور</label><input type="password" name="password" required autofocus autocomplete="current-password"></div>
    <button class="btn block">دخول</button></form></div>`, { title: 'لوحة تحكم المدير', back: true });
  $('#lf').onsubmit = async e => {
    e.preventDefault();
    try { await API.post('/api/admin/login', Object.fromEntries(new FormData(e.target))); route(); }
    catch (er) { adminLogin(er.message); }
  };
}
async function adminOverview() {
  const s = await API.get('/api/admin/stats');
  const stat = (ic, color, n, t, link) => `<a class="stat" href="${link}" style="text-decoration:none;color:inherit"><div class="ico ${color}">${I(ic)}</div><div><b>${n}</b><span>${t}</span></div></a>`;
  $('#tab').innerHTML = `<div class="stats">
      ${stat('calcheck', 'green', s.today_count, 'مواعيد اليوم', '#/admin/bookings?date=' + s.today)}
      ${stat('clock', '', s.pending, 'طلبات قيد الانتظار', '#/admin/bookings?status=pending')}
      ${stat('users', 'blue', s.upcoming_total, 'مواعيد قادمة', '#/admin/bookings')}
      ${stat('inbox', 'blue', s.new_24h, 'حجوزات جديدة (24 ساعة)', '#/admin/bookings')}
    </div>
    <div class="card"><h3>${I('calendar')} الأيام القادمة</h3>
    ${s.upcoming.length ? `<table class="list"><tr><th>اليوم</th><th>المحجوز</th><th>السعة</th><th></th></tr>${s.upcoming.map(u => `<tr><td>${fmtDate(u.date)}</td><td><b>${u.c}</b></td><td>${u.capacity}</td>
      <td><a class="btn light small" href="#/admin/bookings?date=${u.date}">عرض</a></td></tr>`).join('')}</table>` : `<div class="empty">${I('inbox')}<p>لا توجد مواعيد قادمة بعد</p></div>`}</div>`;
  $$('.stat .ico:not(.green):not(.blue)').forEach(e => { e.style.background = 'var(--warn-bg)'; e.style.color = 'var(--warn)'; });
}

async function adminBookings() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const f = adm.filters;
  if (params.has('date') || params.has('status')) { f.date = params.get('date') || ''; f.status = params.get('status') || ''; f.q = ''; }
  if (f.from === null) f.from = CONFIG.today;
  $('#tab').innerHTML = `<div class="card">
    <div class="filters">
      <input type="search" id="fq" placeholder="بحث بالاسم أو الرقم الوطني أو الهاتف أو رقم الطلب" value="${esc(f.q)}">
      <select id="fs"><option value="">كل الحالات</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${f.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
      <select id="fr"><option value="up" ${!f.date && f.from ? 'selected' : ''}>القادمة</option><option value="all" ${!f.date && !f.from ? 'selected' : ''}>الكل</option><option value="day" ${f.date ? 'selected' : ''}>يوم محدد</option></select>
      <input type="date" id="fd" value="${esc(f.date)}" style="${f.date ? '' : 'display:none'}">
      <button class="btn light small" id="print">${I('print')} طباعة</button>
      <a class="btn light small" id="csv">${I('download')} Excel</a>
    </div>
    <h3 id="ttl"></h3>
    <div id="blist">${loading()}</div></div>`;
  const reload = () => loadBookings();
  let t; $('#fq').oninput = e => { f.q = e.target.value; clearTimeout(t); t = setTimeout(reload, 300); };
  $('#fs').onchange = e => { f.status = e.target.value; reload(); };
  $('#fr').onchange = e => {
    const v = e.target.value; $('#fd').style.display = v === 'day' ? '' : 'none';
    if (v === 'up') { f.from = CONFIG.today; f.date = ''; } else if (v === 'all') { f.from = ''; f.date = ''; } else { f.date = f.date || CONFIG.today; $('#fd').value = f.date; }
    reload();
  };
  $('#fd').onchange = e => { f.date = e.target.value; reload(); };
  $('#print').onclick = () => window.print();
  reload();
}
function bookingQuery() {
  const f = adm.filters, p = new URLSearchParams();
  if (f.date) p.set('date', f.date); else if (f.from) p.set('from', f.from);
  if (f.status) p.set('status', f.status); if (f.q) p.set('q', f.q);
  return p.toString();
}
async function loadBookings() {
  const q = bookingQuery(); const f = adm.filters;
  $('#csv').href = API.csvUrl(q);
  const { bookings } = await API.get('/api/admin/bookings?' + q);
  $('#ttl').textContent = (f.date ? `حجوزات ${fmtDate(f.date)}` : f.from ? 'الحجوزات القادمة' : 'كل الحجوزات') + ` (${bookings.length})`;
  if (!bookings.length) { $('#blist').innerHTML = `<div class="empty">${I('inbox')}<p>لا توجد حجوزات مطابقة</p></div>`; return; }
  $('#blist').innerHTML = `<div class="table-wrap"><table class="list"><tr><th>#</th><th>رقم الطلب</th><th>الاسم</th><th>الرقم الوطني</th><th>الهاتف</th><th>نوع الحالة</th><th>الموعد</th><th>الحالة</th><th class="no-print"></th></tr>
    ${bookings.map((b, i) => `<tr><td>${i + 1}</td><td class="mono">${esc(b.ref_code)}</td><td><b>${esc(b.full_name)}</b>${b.notes ? `<div class="muted" style="font-size:13px">${I('note')} ${esc(b.notes)}</div>` : ''}${b.admin_note ? `<div style="font-size:13px;color:var(--info)">${I('edit')} ${esc(b.admin_note)}</div>` : ''}</td>
      <td class="mono">${esc(b.national_id)}</td><td class="mono">${esc(b.phone)}</td><td>${esc(b.case_type || '—')}</td><td style="white-space:nowrap">${fmtDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
      <td><select class="status-select s-${b.status}" data-id="${b.id}">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${b.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></td>
      <td class="no-print"><button class="btn light small" data-edit="${b.id}" title="تعديل">${I('edit')}</button></td></tr>`).join('')}</table></div>`;
  $$('.status-select').forEach(s => s.onchange = async () => {
    try { await API.patch('/api/admin/bookings/' + s.dataset.id, { status: s.value }); s.className = `status-select s-${s.value}`; toast('تم تحديث الحالة إلى: ' + STATUS[s.value].label); }
    catch (e) { toast(e.message); }
  });
  $$('[data-edit]').forEach(btn => btn.onclick = () => editBooking(bookings.find(b => b.id == btn.dataset.edit)));
}
function editBooking(b) {
  modal(`<h3>${I('edit')} تعديل الطلب <span class="mono">${esc(b.ref_code)}</span></h3>
    <dl class="kv"><dt>الاسم</dt><dd>${esc(b.full_name)}</dd><dt>الرقم الوطني</dt><dd class="mono">${esc(b.national_id)}</dd><dt>الهاتف</dt><dd class="mono"><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a></dd>
    <dt>نوع الحالة</dt><dd>${esc(b.case_type || '—')}</dd>${b.notes ? `<dt>ملاحظة المواطن</dt><dd>${esc(b.notes)}</dd>` : ''}<dt>تاريخ الحجز</dt><dd class="mono" style="font-weight:400">${esc(b.created_at)}</dd></dl>
    <form id="ef">
      <div class="field"><label>الحالة</label><select name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${b.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
      <div class="field"><label>تاريخ الموعد</label><input type="date" name="date" value="${b.date}"><div class="hint">يمكن نقل الموعد إلى يوم آخر (مثلًا عند التأجيل).</div></div>
      <div class="field"><label>ملاحظة الإدارة (تظهر للمواطن)</label><textarea name="admin_note" rows="3">${esc(b.admin_note)}</textarea></div>
      <div class="btn-row"><button class="btn">${I('check')} حفظ</button><button class="btn light" type="button" data-close>إغلاق</button></div>
    </form>`, (m, close) => {
    $('[data-close]', m).onclick = close;
    $('#ef', m).onsubmit = async e => {
      e.preventDefault();
      try { await API.patch('/api/admin/bookings/' + b.id, Object.fromEntries(new FormData(e.target))); close(); toast('تم الحفظ'); loadBookings(); }
      catch (er) { toast(er.message); }
    };
  });
}

async function adminDays() {
  if (!adm.month) adm.month = CONFIG.today.slice(0, 7);
  const data = await API.get('/api/admin/calendar?month=' + adm.month);
  if (!adm.settings) adm.settings = await API.get('/api/admin/settings');
  $('#tab').innerHTML = `<div class="card">
    <div class="cal-head"><button class="icon-btn" data-nav="-1">${I('right')}</button><b>${fmtMonth(adm.month)}</b><button class="icon-btn" data-nav="1">${I('left')}</button></div>
    <p class="muted" style="margin-top:0">اضغط على أي يوم لتغيير سعته أو فتحه أو إغلاقه. السعة الافتراضية: <b>${adm.settings.default_capacity}</b> ملف يوميًا. الرقم داخل اليوم = المحجوز/السعة.</p>
    ${calendarHTML(data, { admin: true })}${legendHTML()}</div>`;
  $$('[data-nav]').forEach(b => b.onclick = () => { adm.month = shiftMonth(adm.month, Number(b.dataset.nav)); adminDays(); });
  $$('.day[data-date]').forEach(b => b.onclick = () => editDay(data.days.find(d => d.date === b.dataset.date)));
}
function editDay(d) {
  const def = adm.settings.default_capacity;
  const stTxt = Object.entries(d.statuses).map(([k, n]) => `${STATUS[k].label}: ${n}`).join(' · ') || 'لا توجد حجوزات';
  const stateTxt = { available: 'متاح للحجز', full: 'مكتمل', closed: 'مغلق', past: 'يوم منتهٍ أو لا يُحجز بعد', later: 'خارج فترة الحجز الحالية' }[d.state];
  const isClosed = d.closed_manual || (d.off_day && !d.opened_manual);
  let cap = d.custom ? d.capacity : null;
  modal(`<h3>${I('calendar')} ${fmtDate(d.date)}</h3>
    <p class="muted">${stateTxt}${d.off_day ? ' · يوم عطلة أسبوعية' : ''}<br>المحجوز: <b>${d.booked}</b> من <b>${d.capacity}</b> — ${stTxt}</p>
    <div class="field"><label>سعة هذا اليوم</label>
      <div class="chips">${[[null, `الافتراضي (${def})`], [5, '5'], [10, '10'], [20, '20'], [50, '50']].map(([v, t]) => `<button type="button" class="chip ${cap === v ? 'on' : ''}" data-cap="${v ?? ''}">${t}</button>`).join('')}</div>
      <input type="number" min="0" max="1000" id="capc" placeholder="أو اكتب رقمًا آخر" value="${cap != null && ![5, 10, 20, 50].includes(cap) ? cap : ''}"></div>
    <div class="field"><label>حالة اليوم</label>
      <div class="chips"><button type="button" class="chip ${!isClosed ? 'on' : ''}" data-open="0">${I('door')} مفتوح للحجز</button><button type="button" class="chip ${isClosed ? 'on' : ''}" data-open="1">${I('lock')} مغلق</button></div></div>
    <div class="field"><label>ملاحظة داخلية (اختياري)</label><input id="dnote" value="${esc(d.note)}" placeholder="مثال: عطلة رسمية"></div>
    <div class="btn-row"><button class="btn" id="dsave">${I('check')} حفظ</button><a class="btn light" href="#/admin/bookings?date=${d.date}">${I('list')} الحجوزات</a></div>`, (m, close) => {
    let closed = isClosed;
    $$('[data-cap]', m).forEach(c => c.onclick = () => { cap = c.dataset.cap === '' ? null : Number(c.dataset.cap); $('#capc', m).value = ''; $$('[data-cap]', m).forEach(x => x.classList.toggle('on', x === c)); });
    $('#capc', m).oninput = e => { cap = e.target.value === '' ? null : Number(e.target.value); $$('[data-cap]', m).forEach(x => x.classList.remove('on')); };
    $$('[data-open]', m).forEach(c => c.onclick = () => { closed = c.dataset.open === '1'; $$('[data-open]', m).forEach(x => x.classList.toggle('on', x === c)); });
    $$('a', m).forEach(a => a.addEventListener('click', close));
    $('#dsave', m).onclick = async () => {
      // إن طابقت الحالة الوضع الافتراضي (العطلة الأسبوعية) نحذف الاستثناء
      const is_closed = closed === d.off_day ? null : closed;
      try { await API.put('/api/admin/days/' + d.date, { capacity: cap, is_closed, note: $('#dnote', m).value }); close(); toast('تم حفظ إعدادات اليوم'); adminDays(); }
      catch (e) { toast(e.message); }
    };
  });
}

async function adminSettings(msg) {
  const s = adm.settings = await API.get('/api/admin/settings');
  const order = [6, 0, 1, 2, 3, 4, 5];
  $('#tab').innerHTML = `<form id="setf">
    ${msg ? alertBox('ok', msg) : ''}
    <div class="card"><h3>${I('users')} السعة اليومية الافتراضية</h3><p class="muted">عدد الملفات التي تُستقبل يوميًا. يمكن تغيير سعة يوم بعينه من تبويب «الأيام والسعة».</p>
      <div class="chips">${[5, 10, 20, 50].map(v => `<button type="button" class="chip ${s.default_capacity === v ? 'on' : ''}" data-dc="${v}">${v} ملفات</button>`).join('')}</div>
      <div class="field"><input type="number" name="default_capacity" min="1" max="1000" value="${s.default_capacity}"></div></div>
    <div class="card"><h3>${I('calendar')} فترة الحجز وأيام العطلة</h3>
      <div class="field"><label>أقرب يوم يمكن حجزه (بعد كم يوم من اليوم)</label><input type="number" name="min_days_ahead" min="0" max="60" value="${s.min_days_ahead}"><div class="hint">1 = من الغد. 0 = يُسمح بالحجز لنفس اليوم.</div></div>
      <div class="field"><label>أبعد يوم يمكن حجزه (عدد الأيام القادمة)</label><input type="number" name="max_days_ahead" min="1" max="365" value="${s.max_days_ahead}"></div>
      <div class="field"><label>أيام العطلة الأسبوعية (مغلقة تلقائيًا)</label><div class="checks">${order.map(d => `<label><input type="checkbox" name="off" value="${d}" ${s.off_days.includes(d) ? 'checked' : ''}> ${WD_NAMES[d]}</label>`).join('')}</div></div></div>
    <div class="card"><h3>${I('note')} النصوص</h3>
      <div class="field"><label>اسم النظام / الجهة</label><input name="site_name" value="${esc(s.site_name)}"></div>
      <div class="field"><label>أنواع الحالات (نوع في كل سطر)</label><textarea name="case_types" rows="5">${esc(s.case_types.join('\n'))}</textarea></div>
      <div class="field"><label>تعليمات تظهر للمواطن بعد الحجز</label><textarea name="instructions" rows="3">${esc(s.instructions)}</textarea></div></div>
    <div class="card"><h3>${I('lock')} تغيير كلمة مرور المدير</h3>
      <div class="field"><label>كلمة المرور الحالية</label><input type="password" name="current_password" autocomplete="current-password"></div>
      <div class="field"><label>كلمة المرور الجديدة</label><input type="password" name="new_password" autocomplete="new-password" minlength="6"></div></div>
    <button class="btn block">${I('check')} حفظ الإعدادات</button></form>`;
  $$('[data-dc]').forEach(c => c.onclick = () => { $('[name=default_capacity]').value = c.dataset.dc; $$('[data-dc]').forEach(x => x.classList.toggle('on', x === c)); });
  $('#setf').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      default_capacity: Number(fd.get('default_capacity')), min_days_ahead: Number(fd.get('min_days_ahead')), max_days_ahead: Number(fd.get('max_days_ahead')),
      off_days: fd.getAll('off').map(Number), site_name: fd.get('site_name'), case_types: String(fd.get('case_types')).split('\n').map(x => x.trim()).filter(Boolean),
      instructions: fd.get('instructions'),
    };
    if (fd.get('new_password')) { body.new_password = fd.get('new_password'); body.current_password = fd.get('current_password'); }
    try { await API.put('/api/admin/settings', body); await loadConfig(); adminSettings('تم حفظ الإعدادات بنجاح'); window.scrollTo(0, 0); }
    catch (er) { toast(er.message); }
  };
}

// ========== التوجيه ==========
async function loadConfig() {
  CONFIG = await API.get('/api/config');
  const addDays = (d, n) => { const t = toUTC(d); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
  CONFIG.first_date = addDays(CONFIG.today, CONFIG.min_days_ahead);
  CONFIG.last_date = addDays(CONFIG.today, CONFIG.max_days_ahead);
}
async function route() {
  $$('.modal-bg').forEach(m => m.remove());
  const h = location.hash.replace(/^#\/?/, '').split('?')[0];
  const [page, sub] = h.split('/');
  if (page === 'book') return pageBook();
  if (page === 'status') return pageStatus();
  if (page === 'admin') return pageAdmin(sub);
  return pageHome();
}
window.addEventListener('hashchange', route);
(async () => {
  if (location.pathname.startsWith('/admin') && !location.hash) location.hash = '#/admin';
  try { await loadConfig(); route(); }
  catch (e) { app().innerHTML = `<main style="margin-top:30px"><div class="card">${alertBox('error', e.message)}</div></main>`; }
})();
