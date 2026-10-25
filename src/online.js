// Online extras for the family test: anonymous play stats, feedback, the leaderboard and daily reminders.
// They use the Firestore and sign-in REST APIs of the same Firebase project as family accounts, with their own
// anonymous account, so they never touch Sync's login. Nothing here blocks play: writes wait in a queue while
// offline, and failures are quiet. Rules for every collection are in firestore.rules.
const Online = (() => {
  const CFG = typeof PMLM_FIREBASE !== 'undefined' ? PMLM_FIREBASE : null;
  const FEATURES = Object.assign({ stats: true, feedback: true, leaderboard: true, reminders: true }, typeof PMLM_FEATURES !== 'undefined' ? PMLM_FEATURES : null);
  const VAPID = typeof PMLM_VAPID !== 'undefined' ? PMLM_VAPID : '';
  const KEY = typeof PMLM_ENV !== 'undefined' && PMLM_ENV === 'preview' ? 'pmlm-preview.' : 'pmlm.';
  const params = new URLSearchParams(location.search), HASH = location.hash.replace('#', '');
  // ?emu=1 talks to the local Auth (9099) and Firestore (8080) emulators instead of the real project
  const EMU = params.get('emu') === '1';
  const LOCAL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const DEBUG = HASH === 'debug' || /[?&]debug=1/.test(location.search);
  const IN_ARTIFACT = !!(window.claude && typeof window.claude.use === 'function');
  const enabled = !!(CFG && CFG.projectId) && !IN_ARTIFACT && HASH !== 'selftest' && (EMU || (!LOCAL && !DEBUG));
  const PROJECT = EMU ? params.get('project') || 'demo-pmlm' : CFG && CFG.projectId;
  const API_KEY = (CFG && CFG.apiKey) || 'demo-key';
  const AUTH = EMU ? 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1' : 'https://identitytoolkit.googleapis.com/v1';
  const TOKEN = EMU ? 'http://127.0.0.1:9099/securetoken.googleapis.com/v1' : 'https://securetoken.googleapis.com/v1';
  const DOCS = `${EMU ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com'}/v1/projects/${PROJECT}/databases/(default)/documents`;
  const UA = navigator.userAgent;
  const PLATFORM = /iPhone|iPad|iPod/.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1) ? 'ios' : /Android/.test(UA) ? 'android' : 'other';
  let build = '', onChange = () => {};

  // ---------- Device storage (never the game's own pmlm.v1) ----------
  const get = k => { try { return JSON.parse(localStorage.getItem(KEY + k)); } catch (e) { return null; } };
  const put = (k, v) => { try { v == null ? localStorage.removeItem(KEY + k) : localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
  const rid = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
  const device = () => { let d = get('dev'); if (!d) { d = 'd' + rid(11); put('dev', d); } return d; };
  const userError = msg => Object.assign(new Error(msg), { userMessage: msg });
  const has = f => enabled && !!FEATURES[f];

  // ---------- Firestore REST values ----------
  function enc(v) {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === 'string') return { stringValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
    return { mapValue: { fields: encFields(v) } };
  }
  function encFields(o) { const f = {}; for (const k of Object.keys(o)) if (o[k] !== undefined) f[k] = enc(o[k]); return f; }
  function dec(v) {
    if (!v) return null;
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('timestampValue' in v) return Date.parse(v.timestampValue);
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
    if ('mapValue' in v) return decFields(v.mapValue.fields);
    return null;
  }
  function decFields(f) { const o = {}; for (const k of Object.keys(f || {})) o[k] = dec(f[k]); return o; }

  // ---------- Anonymous sign-in (kept per device; a network failure never makes a new account) ----------
  let tok = null, signing = null;
  function idToken() {
    if (tok && tok.exp > Date.now() + 60000) return Promise.resolve(tok);
    if (!signing) signing = (async () => {
      const saved = get('anon');
      if (saved && saved.refresh) {
        const r = await fetch(`${TOKEN}/token?key=${API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(saved.refresh) });
        if (r.ok) {
          const j = await r.json();
          tok = { id: j.id_token, uid: j.user_id, exp: Date.now() + (+j.expires_in || 3600) * 1000 };
          put('anon', { uid: j.user_id, refresh: j.refresh_token });
          return tok;
        }
        if (r.status !== 400) throw new Error('sign-in ' + r.status);
      }
      const r = await fetch(`${AUTH}/accounts:signUp?key=${API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"returnSecureToken":true}' });
      if (!r.ok) throw new Error('sign-up ' + r.status);
      const j = await r.json();
      tok = { id: j.idToken, uid: j.localId, exp: Date.now() + (+j.expiresIn || 3600) * 1000 };
      put('anon', { uid: j.localId, refresh: j.refreshToken });
      return tok;
    })().then(t => { signing = null; return t; }, e => { signing = null; throw e; });
    return signing;
  }
  async function call(method, path, body, query) {
    const t = await idToken();
    const headers = { Authorization: 'Bearer ' + t.id };
    if (body) headers['Content-Type'] = 'application/json';
    const r = await fetch(`${DOCS}/${path}${query || ''}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 401) tok = null;
    if (!r.ok) throw Object.assign(new Error(`${method} ${path}: ${r.status}`), { status: r.status });
    return r.json();
  }

  // ---------- Queue for stats and feedback ----------
  let flushing = false, flushTimer = 0;
  function enqueue(col, data) {
    const q = get('q') || [];
    q.push({ id: rid(8), col, data });
    put('q', q.slice(-200));
    flushSoon(1500);
  }
  function flushSoon(ms) { if (!enabled) return; clearTimeout(flushTimer); flushTimer = setTimeout(flush, ms); }
  async function flush() {
    if (flushing || navigator.onLine === false) return;
    flushing = true;
    for (let n = 0; n < 50; n++) {
      const it = (get('q') || [])[0];
      if (!it) break;
      try { await call('POST', it.col, { fields: encFields(it.data) }); }
      catch (e) {
        // No network or a server hiccup: try again later. Refused by the rules: drop it so the queue moves on.
        if (!e.status || e.status >= 500 || e.status === 401 || e.status === 429) { flushSoon(30000); break; }
      }
      put('q', (get('q') || []).filter(x => x.id !== it.id));
    }
    flushing = false;
  }
  const stamp = () => {
    const d = { d: device(), v: build, day: Board.dayOf(new Date()), dev: PLATFORM, t: Date.now() };
    const src = get('src');
    if (src) d.src = src;
    return d;
  };
  const clean = o => { const c = {}; for (const k of Object.keys(o || {})) if (o[k] != null && o[k] !== '') c[k] = typeof o[k] === 'string' ? o[k].slice(0, 1000) : o[k]; return c; };

  // ---------- Leaderboard ----------
  let cache = null, loading = null, pendingBoard = {};
  const boardTimers = {};
  async function sendBoard(doc) {
    try {
      const t = await idToken();
      await call('PATCH', `leaderboard/${doc.pid}_${t.uid}`, { fields: encFields(Object.assign({}, doc, { owner: t.uid })) });
      delete pendingBoard[doc.pid];
      if (cache) cache.at = 0;
    } catch (e) { pendingBoard[doc.pid] = doc; }
  }
  function boardList(force) {
    if (!has('leaderboard')) return Promise.resolve({ docs: [], error: 'off' });
    if (cache && !cache.error && Date.now() - cache.at < (force ? 20000 : 300000)) return Promise.resolve(cache);
    if (!loading) loading = (async () => {
      try {
        let docs = [], next = '';
        for (let page = 0; page < 5; page++) {
          const j = await call('GET', 'leaderboard', null, `?pageSize=300${next ? '&pageToken=' + encodeURIComponent(next) : ''}`);
          docs = docs.concat((j.documents || []).map(x => decFields(x.fields)));
          if (!j.nextPageToken) break;
          next = j.nextPageToken;
        }
        cache = { docs, at: Date.now() };
      } catch (e) {
        cache = { docs: (cache && cache.docs) || [], at: Date.now(), error: navigator.onLine === false ? 'offline' : 'error' };
      }
      loading = null;
      return cache;
    })();
    return loading;
  }

  // ---------- Daily reminders (Web Push) ----------
  const STANDALONE = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const PUSH_OK = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const b64u = s => { const p = '='.repeat((4 - (s.length % 4)) % 4), raw = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(raw, c => c.charCodeAt(0)); };
  const pushState = () => Object.assign({ on: false, hour: 17 }, get('push'));
  async function registration() {
    const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('sw.js'));
    await navigator.serviceWorker.ready;
    return reg;
  }
  async function savePush(sub, hour, kids) {
    const j = sub.toJSON ? sub.toJSON() : sub, t = await idToken();
    const data = {
      owner: t.uid, sub: { endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth },
      tz: (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || '', off: -new Date().getTimezoneOffset(), hour, kids, t: Date.now(),
    };
    // Only these fields: the sender's own notes (lastSent, lastMsg) stay as they are
    await call('PATCH', 'push/' + t.uid, { fields: encFields(data) }, '?' + Object.keys(data).map(k => 'updateMask.fieldPaths=' + k).join('&'));
  }
  let pushTimer = 0;
  const push = {
    get configured() { return has('reminders') && !!VAPID; },
    get supported() { return PUSH_OK; },
    get state() { return pushState(); },
    needsHomeScreen: PLATFORM === 'ios' && !STANDALONE,
    async enable(hour, kids) {
      if (!PUSH_OK) throw userError('This browser cannot show reminders.');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') throw userError(perm === 'denied' ? 'Notifications are blocked for this game. Allow them in the browser or phone settings, then try again.' : 'Notifications were not allowed.');
      const reg = await registration();
      const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(VAPID) }));
      await savePush(sub, hour, kids);
      put('push', { on: true, hour });
    },
    // Keep the server's copy current after each round, so a child who already played isn't reminded
    update(kids, hour) {
      const st = pushState();
      if (hour != null) put('push', Object.assign(st, { hour }));
      if (!st.on || !push.configured || !PUSH_OK) return;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration(), sub = reg && (await reg.pushManager.getSubscription());
          if (sub) await savePush(sub, pushState().hour, kids); else put('push', Object.assign(pushState(), { on: false }));
          onChange();
        } catch (e) { /* tried again after the next round */ }
      }, hour != null ? 300 : 3000);
    },
    async disable() {
      put('push', Object.assign(pushState(), { on: false }));
      try {
        const reg = await navigator.serviceWorker.getRegistration(), sub = reg && (await reg.pushManager.getSubscription());
        if (sub) await sub.unsubscribe();
        const t = await idToken();
        await call('DELETE', 'push/' + t.uid);
      } catch (e) { /* the sender also removes subscriptions that stop working */ }
    },
    async sample(title, body) {
      if (!PUSH_OK) throw userError('This browser cannot show notifications.');
      if (Notification.permission !== 'granted' && (await Notification.requestPermission()) !== 'granted') throw userError('Notifications were not allowed.');
      const reg = await registration();
      await reg.showNotification(title, { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'pmlm-sample' });
    },
  };

  // ---------- Add to Home Screen ----------
  let deferred = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; onChange(); });
  addEventListener('appinstalled', () => { deferred = null; onChange(); });
  const install = {
    platform: PLATFORM,
    get standalone() { return STANDALONE; },
    get canPrompt() { return !!deferred; },
    async prompt() {
      if (!deferred) return false;
      deferred.prompt();
      const r = await deferred.userChoice;
      deferred = null; onChange();
      return r && r.outcome === 'accepted';
    },
  };

  return {
    enabled, has, KEY, push, install, device, codec: { enc, dec, encFields, decFields },
    boot(opts) {
      build = opts.build || ''; onChange = opts.onChange || onChange;
      const src = (params.get('src') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
      if (src && !get('src')) put('src', src);
      if (!enabled) return;
      addEventListener('online', () => { flushSoon(500); Object.values(pendingBoard).forEach(sendBoard); });
      flushSoon(3000);
    },
    // True once a day per device (for the daily "open" event)
    firstToday() { const d = Board.dayOf(new Date()); if (get('opened') === d) return false; put('opened', d); return true; },
    event(type, data) { if (has('stats')) enqueue('events', Object.assign(stamp(), clean(data), { type })); },
    feedback(data) { if (!has('feedback')) return false; enqueue('feedback', Object.assign(stamp(), clean(data))); return true; },
    boardPut(doc) {
      if (!has('leaderboard') || !doc || !doc.pid) return;
      clearTimeout(boardTimers[doc.pid]);
      boardTimers[doc.pid] = setTimeout(() => sendBoard(doc), 1500);
    },
    boardList,
    get boardCache() { return cache; },
    get uid() { return (tok && tok.uid) || (get('anon') || {}).uid || null; },
  };
})();
