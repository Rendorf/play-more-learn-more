// In-memory stand-in for the Firebase compat SDK (auth + firestore) used to test the game's family accounts.
// The "server" (documents + accounts) lives in sessionStorage so it survives reloads; the signed-in user is
// per "device" in localStorage. A small copy of firestore.rules is enforced so ordering mistakes show up.
(() => {
  const SKEY = '__mockserver', UKEY = '__mockuser';
  const realNow = Date.now.bind(Date);   // the server's clock: unaffected if a test fakes a device's Date.now
  const load = () => { try { return JSON.parse(sessionStorage.getItem(SKEY)) || { docs: {}, accounts: {}, resets: [] }; } catch (e) { return { docs: {}, accounts: {}, resets: [] }; } };
  const server = load();
  const persist = () => sessionStorage.setItem(SKEY, JSON.stringify(server));
  const rid = () => Math.random().toString(36).slice(2, 12);
  class Timestamp { constructor(ms) { this.__ts = ms; } toMillis() { return this.__ts; } static fromMillis(ms) { return new Timestamp(ms); } }
  const revive = v => (v && typeof v === 'object' ? ('__ts' in v ? new Timestamp(v.__ts) : Array.isArray(v) ? v.map(revive) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, revive(x)]))) : v);
  const clone = v => JSON.parse(JSON.stringify(v));
  const err = code => Object.assign(new Error(code), { code });

  // ---- auth ----
  let current = null, authCbs = [];
  try { current = JSON.parse(localStorage.getItem(UKEY)); } catch (e) { current = null; }
  const setUser = u => { current = u; try { u ? localStorage.setItem(UKEY, JSON.stringify(u)) : localStorage.removeItem(UKEY); } catch (e) {} authCbs.forEach(cb => cb(current)); };
  const auth = () => ({
    get currentUser() { return current; },
    onAuthStateChanged: cb => { authCbs.push(cb); setTimeout(() => cb(current), 0); return () => {}; },
    async signInWithEmailAndPassword(email, pw) {
      const a = server.accounts[email.toLowerCase()];
      if (!a || a.password !== pw) throw err('auth/invalid-credential');
      setUser({ uid: a.uid, email, isAnonymous: false, provider: 'password' }); return { user: current };
    },
    async createUserWithEmailAndPassword(email, pw) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw err('auth/invalid-email');
      if ((pw || '').length < 6) throw err('auth/weak-password');
      if (server.accounts[email.toLowerCase()]) throw err('auth/email-already-in-use');
      server.accounts[email.toLowerCase()] = { uid: 'u_' + rid(), password: pw }; persist();
      return this.signInWithEmailAndPassword(email, pw);
    },
    async sendPasswordResetEmail(email) { if (!email) throw err('auth/missing-email'); server.resets.push(email); persist(); },
    async signInAnonymously() { setUser({ uid: 'anon_' + rid(), email: null, isAnonymous: true, provider: 'anonymous' }); return { user: current }; },
    async signInWithPopup() {
      const email = 'parent.google@example.com';
      server.accounts[email] = server.accounts[email] || { uid: 'g_' + rid(), password: null }; persist();
      setUser({ uid: server.accounts[email].uid, email, isAnonymous: false, provider: 'google.com' }); return { user: current };
    },
    async signInWithRedirect() {},
    async signOut() { setUser(null); },
  });
  auth.GoogleAuthProvider = class { setCustomParameters() {} };

  // ---- mini rules (mirrors firestore.rules) ----
  const D = p => server.docs[p];
  const uid = () => current && current.uid;
  const isParent = f => !!uid() && !!D(`families/${f}/parents/${uid()}`);
  const isDevice = f => !!uid() && !!D(`families/${f}/devices/${uid()}`);
  const member = f => isParent(f) || isDevice(f);
  const validCode = (code, f, role) => { const c = D('codes/' + code); return !!c && c.fid === f && c.role === role && c.expires.__ts > realNow(); };
  function allowed(op, path, data) {
    const s = path.split('/'), u = uid();
    if (!u) return false;
    if (s[0] === 'users') return s[1] === u;
    if (s[0] === 'codes') {
      if (op === 'get') return s.length === 2;
      if (op === 'set') return !D(path) && isParent(data.fid) && ['device', 'parent'].includes(data.role) && data.expires.__ts < realNow() + 2 * 864e5;
      if (op === 'delete') return !!D(path) && isParent(D(path).fid);
      return false;
    }
    if (s[0] !== 'families') return false;
    const f = s[1];
    if (s.length === 2) {
      if (op === 'set' && !D(path)) return !current.isAnonymous && u === f;
      if (op === 'delete') return false;
      return member(f);
    }
    if (s.length === 3) return op === 'list' && (s[2] === 'players' ? member(f) : isParent(f));
    const [, , col, id] = s;
    if (col === 'players') return member(f);
    if (col === 'parents') {
      if (op === 'set') return !D(path) && !current.isAnonymous && id === u && (f === u || validCode(data.code, f, 'parent'));
      if (op === 'get') return isParent(f) || id === u;
      if (op === 'delete') return isParent(f);
      return false;
    }
    if (col === 'devices') {
      if (op === 'set' && !D(path)) return id === u && validCode(data.code, f, 'device');
      if (op === 'set' || op === 'update') return id === u && (!data.code || data.code === D(path).code);
      if (op === 'get') return isParent(f) || id === u;
      if (op === 'delete') return isParent(f) || id === u;
    }
    return false;
  }

  // ---- firestore ----
  const listeners = { doc: {}, col: {} };
  const parentOf = p => p.split('/').slice(0, -1).join('/');
  const snap = (path, data, pending) => ({ id: path.split('/').pop(), exists: data !== undefined, data: () => (data === undefined ? undefined : revive(clone(data))), metadata: { hasPendingWrites: !!pending } });
  const colSnap = (path, changes) => {
    const docs = Object.keys(server.docs).filter(p => parentOf(p) === path).map(p => snap(p, server.docs[p]));
    return { docs, size: docs.length, empty: !docs.length, forEach: fn => docs.forEach(fn), docChanges: () => changes || docs.map(d => ({ type: 'added', doc: d })) };
  };
  function notify(path, type, pending) {
    (listeners.doc[path] || []).forEach(l => l.cb(snap(path, server.docs[path], pending)));
    const col = parentOf(path);
    (listeners.col[col] || []).forEach(l => l.cb(colSnap(col, [{ type, doc: snap(path, server.docs[path], pending) }])));
    // Someone lost access (e.g. a device was unlinked): their live family listeners fail like the real thing
    for (const kind of ['doc', 'col']) for (const [p, ls] of Object.entries(listeners[kind])) ls.forEach(l => {
      if (!l.dead && p.startsWith('families/') && !member(p.split('/')[1])) { l.dead = true; l.err && l.err(err('permission-denied')); }
    });
  }
  function write(path, data, pending = true, mode = 'set') {
    if (data !== undefined) data = JSON.parse(JSON.stringify(data), (k, v) => (v && v.__server ? { __ts: realNow() } : v));
    if (data === undefined) { const had = path in server.docs; delete server.docs[path]; persist(); if (had) notify(path, 'removed', pending); return; }
    const existed = path in server.docs;
    server.docs[path] = clone(mode === 'merge' || mode === 'update' ? Object.assign({}, server.docs[path] || {}, data) : data);
    persist(); notify(path, existed ? 'modified' : 'added', pending);
  }
  const check = (op, path, data) => { if (!allowed(op, path, data ? clone(data) : data)) throw err('permission-denied'); };
  const docRef = path => ({
    id: path.split('/').pop(), path,
    get: async () => { check('get', path); return snap(path, server.docs[path]); },
    set: async (data, opts) => { check('set', path, data); write(path, data, true, opts && opts.merge ? 'merge' : 'set'); },
    update: async data => { if (!(path in server.docs)) throw err('not-found'); check('update', path, data); write(path, data, true, 'update'); },
    delete: async () => { check('delete', path); write(path, undefined); },
    onSnapshot(cb, onErr) {
      if (!allowed('get', path)) { setTimeout(() => onErr && onErr(err('permission-denied')), 0); return () => {}; }
      const l = { cb, err: onErr }; (listeners.doc[path] = listeners.doc[path] || []).push(l);
      setTimeout(() => cb(snap(path, server.docs[path])), 0);
      return () => { listeners.doc[path] = (listeners.doc[path] || []).filter(x => x !== l); };
    },
    collection: name => colRef(path + '/' + name),
  });
  const colRef = path => ({
    path,
    doc: id => docRef(path + '/' + (id || rid())),
    get: async () => { check('list', path); return colSnap(path); },
    onSnapshot(cb, onErr) {
      if (!allowed('list', path)) { setTimeout(() => onErr && onErr(err('permission-denied')), 0); return () => {}; }
      const l = { cb, err: onErr }; (listeners.col[path] = listeners.col[path] || []).push(l);
      setTimeout(() => cb(colSnap(path)), 0);
      return () => { listeners.col[path] = (listeners.col[path] || []).filter(x => x !== l); };
    },
  });
  const db = {
    collection: name => colRef(name),
    doc: path => docRef(path),
    batch() {
      const ops = [];
      return {
        set(ref, data, opts) { ops.push(() => { check('set', ref.path, data); write(ref.path, data, true, opts && opts.merge ? 'merge' : 'set'); }); return this; },
        async commit() { const before = clone(server.docs); try { ops.forEach(f => f()); } catch (e) { server.docs = before; persist(); throw e; } },
      };
    },
  };
  const firestore = () => db;
  firestore.Timestamp = Timestamp;
  firestore.FieldValue = { serverTimestamp: () => ({ __server: true }) };
  window.__mock = { server, write: (p, d) => write(p, d, false), resets: () => server.resets };
  window.firebase = { apps: [], initializeApp() { this.apps.push({}); }, firestore, auth };
})();
