// طبقة الاتصال بالخادم
window.API = {
  async call(method, url, body) {
    const opt = { method, headers: {}, credentials: 'same-origin' };
    if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    let res;
    try { res = await fetch(url, opt); } catch { throw new Error('تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجددًا.'); }
    let data = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) { const e = new Error(data.error || 'حدث خطأ غير متوقع'); e.status = res.status; throw e; }
    return data;
  },
  get(u) { return this.call('GET', u); },
  post(u, b) { return this.call('POST', u, b || {}); },
  put(u, b) { return this.call('PUT', u, b || {}); },
  patch(u, b) { return this.call('PATCH', u, b || {}); },
  csvUrl(q) { return '/api/admin/bookings.csv?' + q; },
};
