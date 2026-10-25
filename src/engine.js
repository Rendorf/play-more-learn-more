// Game engine: saved state, rounds, mastery, wishes, parent area and all screens.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const view = $('#view'), topEl = $('#top'), tabsEl = $('#tabs');
  const rt = s => Rich.html(s);
  const h = s => esc(s == null ? '' : s);
  const fmt = x => U.fmt(Math.round(x));
  const HASH = location.hash.replace('#', '');
  const DEBUG = HASH === 'debug' || /[?&]debug=1/.test(location.search);
  const SELFTEST = HASH === 'selftest' || /[?&]selftest=1/.test(location.search);
  const IN_ARTIFACT = !!(window.claude && typeof window.claude.use === 'function');
  const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const stageName = g => (g <= 6 ? `Primary Stage ${g}` : `Lower Secondary Stage ${g}`);
  const gradePick = (g, act = 'grade', extra = '') => `<div class="stack" style="gap:6px">
    <div class="row between"><span class="eyebrow">Grade</span><span class="muted" style="font-size:.85rem">Cambridge ${stageName(g)}</span></div>
    <div class="gradepick" role="tablist" aria-label="Grade">${GRADES.map(x => `<button class="${x === g ? 'on' : ''}" data-act="${act}" ${extra} data-id="${x}" data-v="${x}" aria-label="Grade ${x}">${x}</button>`).join('')}</div></div>`;
  const STORE_KEY = 'pmlm.v1';

  const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🐧', '🦄', '🐨', '🐰'];
  const SHOP_AVATARS = [['🦁', 40], ['🦉', 40], ['🐙', 40], ['🦋', 40], ['🐳', 50], ['🦩', 50], ['🐲', 60], ['🦖', 60], ['👽', 80], ['🤖', 80], ['🐉', 120], ['🦄', 0]].filter(a => a[1] > 0);
  const HATS = [['🧢', 20], ['🎀', 20], ['🎩', 30], ['⛑️', 30], ['🌸', 30], ['🪖', 40], ['🎓', 50], ['⭐', 60], ['👑', 100]];
  const RANKS = [[0, 'Rookie'], [5000, 'Explorer'], [20000, 'Thinker'], [50000, 'Whiz'], [120000, 'Genius'], [250000, 'Mastermind'], [500000, 'Legend']];
  const BOSS_NAMES = ['Grumble', 'Chomp', 'Zorg', 'Blobby', 'Munch', 'Rumble', 'Gloop'];

  const QUESTS = [
    { id: 'answer20', icon: '✏️', text: 'Answer 20 questions', goal: 20, ev: 'answer', coins: 15 },
    { id: 'combo5', icon: '🔥', text: 'Get a 5-combo', goal: 5, ev: 'combo', max: true, coins: 15 },
    { id: 'lesson', icon: '📖', text: 'Finish a lesson', goal: 1, ev: 'lesson', coins: 10 },
    { id: 'fix3', icon: '🔧', text: 'Fix 3 old mistakes', goal: 3, ev: 'fix', coins: 15 },
    { id: 'perfect', icon: '💯', text: 'Get a perfect round', goal: 1, ev: 'perfect', coins: 20 },
    { id: 'rounds3', icon: '🎯', text: 'Finish 3 rounds', goal: 3, ev: 'round', coins: 15 },
    { id: 'first10', icon: '⚡', text: 'Get 10 right first time', goal: 10, ev: 'first', coins: 15 },
    { id: 'boss', icon: '⚔️', text: 'Battle a boss', goal: 1, ev: 'boss', coins: 20 },
  ];

  const TROPHIES = [
    { id: 'first', icon: '🌱', name: 'First answer', test: (p, c) => p.stats.answered >= 1 },
    { id: 'lesson', icon: '📖', name: 'Bookworm', test: (p, c) => c.lessons >= 1 },
    { id: 'star', icon: '⭐', name: 'First star', test: (p, c) => c.stars >= 1 },
    { id: 'master1', icon: '🧠', name: 'Skill master', test: (p, c) => c.mastered >= 1 },
    { id: 'master5', icon: '🎖️', name: '5 skills mastered', test: (p, c) => c.mastered >= 5 },
    { id: 'combo5', icon: '🔥', name: 'Combo ×5', test: p => p.stats.bestCombo >= 5 },
    { id: 'combo10', icon: '💥', name: 'Combo ×10', test: p => p.stats.bestCombo >= 10 },
    { id: 'combo20', icon: '🌋', name: 'Combo ×20', test: p => p.stats.bestCombo >= 20 },
    { id: 'perfect', icon: '💯', name: 'Perfect round', test: p => p.stats.perfect >= 1 },
    { id: 'q100', icon: '🏃', name: '100 questions', test: p => p.stats.answered >= 100 },
    { id: 'q500', icon: '🚴', name: '500 questions', test: p => p.stats.answered >= 500 },
    { id: 'q1000', icon: '🏆', name: '1000 questions', test: p => p.stats.answered >= 1000 },
    { id: 'boss1', icon: '⚔️', name: 'Boss beaten', test: (p, c) => c.bosses >= 1 },
    { id: 'boss3', icon: '🛡️', name: '3 bosses beaten', test: (p, c) => c.bosses >= 3 },
    { id: 'streak3', icon: '📅', name: '3-day streak', test: p => p.streak.days >= 3 },
    { id: 'streak7', icon: '🗓️', name: '7-day streak', test: p => p.streak.days >= 7 },
    { id: 'fix10', icon: '🔧', name: 'Fixed 10 mistakes', test: p => p.stats.fixed >= 10 },
    { id: 'wish', icon: '🎁', name: 'Wish unlocked', test: (p, c) => c.wishes >= 1 },
    { id: 'shop', icon: '🛍️', name: 'First buy', test: p => p.owned.length >= 1 },
    { id: 'grade', icon: '🎓', name: 'Grade complete', test: (p, c) => c.gradesDone >= 1 },
  ];

  const CHEERS = ['Yes! 🎉', 'Nailed it!', 'Brain power rising!', 'Super smart!', 'You got it!', 'Brilliant!', 'Keep going!', 'Wow!'];
  const HOT = ["You're on fire! 🔥", 'Unstoppable!', 'Combo king!', 'Look at you go!', 'Maths superstar!'];
  const OOPS1 = ['Almost! Here is a clue.', 'Good try. Look at the hint.', 'Mistakes help your brain grow!'];
  const OOPS2 = ["Let's do the first step together.", 'You are close. Try this step.'];
  const OOPS3 = ['That was a tricky one. Here is how it works.', 'Now you know it! It will come back later so you can beat it.'];
  const pickOne = a => a[Math.floor(Math.random() * a.length)];

  // ---------- State & storage ----------
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
  const DEFAULT = () => ({ v: 1, pin: null, settings: { sfx: true, music: true, timer: false, currency: '₼' }, profiles: [], current: null, updatedAt: 0 });
  const newProfile = (name, avatar, grade, theme) => ({
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, avatar, grade, theme, hat: null,
    coins: 0, brain: 0, owned: [], trophies: {}, streak: { days: 0, last: null }, quests: { date: null, list: [] },
    stats: { answered: 0, correct: 0, first: 0, ms: 0, rounds: 0, bestCombo: 0, fixed: 0, perfect: 0 }, grades: {},
  });
  const gradeState = (p, g) => p.grades[g] || (p.grades[g] = {
    skills: {}, review: [], bosses: {}, placed: false,
    wishes: [25, 50, 75, 100].map(at => ({ at, text: '', emoji: at === 100 ? '🎁' : '🎈', status: 'locked' })),
  });
  const skillState = (gs, id) => gs.skills[id] || (gs.skills[id] = { lesson: false, stars: 0, best: 0, hist: [], days: [], level: 1, run: 0, miss: 0, mastered: null, last: 0, tries: 0, right: 0, extra: 0 });

  let state = load() || DEFAULT();
  function load() {
    try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s && s.v === 1) return Object.assign(DEFAULT(), s); } catch (e) { /* storage blocked */ }
    return null;
  }
  let saveTimer = 0;
  function save() {
    Sync.track();
    state.updatedAt = Date.now();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
      Cloud.save(state);
    }, 250);
  }

  // Per-viewer saved state when running as a claude.ai artifact (falls back to localStorage only)
  const Cloud = (() => {
    let doc = null, busy = false, pending = null, timer = 0;
    async function flush() {
      if (!doc || busy || !pending) return;
      busy = true;
      const s = pending; pending = null;
      try { await doc.set({ state: JSON.stringify(s), updatedAt: s.updatedAt }); }
      catch (e) { if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted')) doc = null; }
      busy = false;
      if (pending) flush();
    }
    return {
      async init(onRemote) {
        if (!IN_ARTIFACT) return;
        try {
          const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
          if (!db || !user) return;
          const id = await user.id();
          if (!id) return;
          doc = db.doc('data/users/' + id + '/pmlm');
          const snap = await doc.get();
          const data = snap.exists ? snap.data() : null;
          onRemote(data && data.state ? JSON.parse(data.state) : null);
        } catch (e) { doc = null; }
      },
      save(s) { if (!doc) return; pending = s; clearTimeout(timer); timer = setTimeout(flush, 2000); },
    };
  })();

  // Family accounts for the GitHub Pages / offline copy (Firebase Auth + Firestore, rules in firestore.rules).
  // Parents log in with email/password or Google; a child's device joins with a one-time link code and an
  // anonymous sign-in. Each player is its own document (families/{fid}/players/{id}) so two children playing
  // at once never overwrite each other; the PIN, money symbol, player order and deletions live on
  // families/{fid}. Newer updatedAt wins. Which player is active stays per device.
  const Sync = (() => {
    const CFG = typeof PMLM_FIREBASE !== 'undefined' ? PMLM_FIREBASE : null;
    const enabled = !!CFG && !IN_ARTIFACT;
    const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
    const FLAG = 'pmlm.sync';
    const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let fb = null, db = null, user = null, fid = null, role = null, me = {}, status = 'off', loading = null, flow = false, lastError = null;
    let unsubs = [], devices = [], parents = [], code = null, dupes = [];
    let known = {}, knownShared = '', dirty = new Set(), dirtyShared = false, timer = 0, writing = false, pendingRemote = {};

    const strip = p => { const { updatedAt, ...rest } = p; return JSON.stringify(rest); };
    const sharedOf = () => JSON.stringify({ pin: state.pin, currency: state.settings.currency, timer: state.settings.timer, order: state.profiles.map(p => p.id), deleted: state.deleted || {} });
    const fam = () => db.collection('families').doc(fid);
    const fmtCode = c => c.slice(0, 4) + '-' + c.slice(4);
    const normCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const userError = msg => Object.assign(new Error(msg), { userMessage: msg });
    const LABELS = {
      off: 'Not connected', loading: 'Connecting…', synced: 'All changes saved online ✓', saving: 'Saving…',
      offline: 'Offline. Changes will upload when the internet is back.',
      error: 'Could not reach the family database. Changes are kept on this device and will retry.',
      unlinked: 'This device was unlinked from the family. Its players are still on this device.',
    };
    const ICONS = { synced: '☁️', saving: '⏳', loading: '⏳', offline: '📴', error: '⚠️' };
    const WRONG_LOGIN = 'That email or password is not right.';
    const MESSAGES = {
      'auth/invalid-credential': WRONG_LOGIN, 'auth/invalid-login-credentials': WRONG_LOGIN, 'auth/wrong-password': WRONG_LOGIN, 'auth/user-not-found': WRONG_LOGIN,
      'auth/email-already-in-use': 'There is already an account with this email. Tap Sign in instead.',
      'auth/weak-password': 'Use a password with at least 6 characters.',
      'auth/invalid-email': 'That email address does not look right.',
      'auth/missing-password': 'Type a password.',
      'auth/missing-email': 'Type your email address.',
      'auth/too-many-requests': 'Too many tries. Wait a few minutes and try again.',
      'auth/network-request-failed': 'No internet connection. Connect and try again.',
      'auth/popup-blocked': 'Tap "Continue with Google" once more to open the Google window.',
      'auth/popup-closed-by-user': '', 'auth/cancelled-popup-request': '',
      'auth/operation-not-allowed': 'This sign-in method is not switched on in the Firebase project yet.',
      'auth/configuration-not-found': 'Logins are not switched on in the Firebase project yet (Authentication → Get started).',
      'auth/admin-restricted-operation': 'Linking devices is not switched on yet (Anonymous sign-in in the Firebase project).',
      'auth/unauthorized-domain': 'This website is not on the Firebase project\'s list of authorized domains yet.',
      'permission-denied': 'The family database refused this. Check the code and try again.',
    };
    const friendly = e => (e && e.userMessage) || (e && e.code in MESSAGES ? MESSAGES[e.code] : 'Something went wrong. Check the internet connection and try again.');

    function setStatus(s) {
      status = s;
      const el = document.getElementById('syncstatus'); if (el) el.textContent = LABELS[s];
      const chip = document.getElementById('syncchip'); if (chip) chip.textContent = ICONS[s] || '☁️';
    }
    function flag(on) { try { on ? localStorage.setItem(FLAG, '1') : localStorage.removeItem(FLAG); } catch (e) { /* storage blocked */ } }
    function rerender() {
      const typing = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (S.screen !== 'round' && S.screen !== 'lesson' && S.screen !== 'new' && !typing && !document.querySelector('.overlay, .celebrate')) {
        S.keepScroll = true; render(); S.keepScroll = false;
      }
    }
    function afterRemote() { save(); rerender(); }
    const loadScript = src => new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(userError('Could not load the sign-in service. Check the internet connection.'));
      document.head.appendChild(s);
    });
    function ensureSdk() {
      if (!enabled) return Promise.reject(userError('Online saving is not set up for this copy of the game.'));
      if (!loading) loading = (async () => {
        if (!window.firebase) for (const f of ['app', 'auth', 'firestore']) await loadScript(`${SDK}firebase-${f}-compat.js`);
        fb = window.firebase;
        if (!fb.apps.length) fb.initializeApp(CFG);
        db = fb.firestore();
        fb.auth().onAuthStateChanged(u => { if (!flow && (!u || !user || u.uid !== user.uid)) onUser(u); });
        return fb;
      })().catch(e => { loading = null; throw e; });
      return loading;
    }

    function prime() {
      known = {};
      for (const p of state.profiles) known[p.id] = strip(p);
      knownShared = sharedOf();
    }
    // Called from save(): stamp whatever changed so the newest copy wins on every device
    function track() {
      if (!enabled) return;
      const now = Date.now();
      for (const p of state.profiles) {
        const j = strip(p);
        if (known[p.id] !== j) { known[p.id] = j; p.updatedAt = now; dirty.add(p.id); }
      }
      const sj = sharedOf();
      if (sj !== knownShared) { knownShared = sj; state.sharedAt = now; dirtyShared = true; }
      if (fid && (dirty.size || dirtyShared)) { clearTimeout(timer); timer = setTimeout(flush, 1500); }
    }
    async function flush() {
      if (!fid || writing) return;
      writing = true; setStatus('saving');
      const ids = [...dirty], shared = dirtyShared, held = new Set(dupes.map(d => d.local.id));
      dirty.clear(); dirtyShared = false;
      try {
        for (const id of ids) {
          const p = state.profiles.find(x => x.id === id);
          if (p && !held.has(id)) await fam().collection('players').doc(id).set({ data: JSON.stringify(p), updatedAt: p.updatedAt || Date.now() });
        }
        if (shared) {
          await fam().set({ shared: knownShared, updatedAt: state.sharedAt || Date.now() }, { merge: true });
          for (const id of Object.keys(state.deleted || {})) await fam().collection('players').doc(id).delete();
        }
        setStatus(navigator.onLine === false ? 'offline' : 'synced');
      } catch (e) {
        ids.forEach(id => dirty.add(id)); if (shared) dirtyShared = true;
        if (e && e.code === 'permission-denied') { writing = false; return unlinked(); }
        setStatus(navigator.onLine === false ? 'offline' : 'error');
        clearTimeout(timer); timer = setTimeout(flush, 15000);
      }
      writing = false;
      if (fid && (dirty.size || dirtyShared)) { clearTimeout(timer); timer = setTimeout(flush, 1500); }
    }

    function applyProfile(p) {
      if (!p || !p.id || (state.deleted || {})[p.id]) return false;
      const i = state.profiles.findIndex(x => x.id === p.id);
      if (i >= 0 && (state.profiles[i].updatedAt || 0) >= (p.updatedAt || 0)) return false;
      if (i >= 0 && S.screen === 'round' && state.current === p.id) { pendingRemote[p.id] = p; return false; }
      if (i >= 0) state.profiles[i] = p; else state.profiles.push(p);
      known[p.id] = strip(p);
      return true;
    }
    // joining = this device is connecting to an existing family: the family's PIN and settings win
    function applyShared(d, joining) {
      let sh;
      try { sh = JSON.parse(d.shared); } catch (e) { return false; }
      const deleted = Object.assign({}, state.deleted, sh.deleted);
      const newDeletes = Object.keys(deleted).some(id => state.profiles.some(p => p.id === id));
      const newer = (d.updatedAt || 0) > (state.sharedAt || 0);
      if (!newer && !joining && !newDeletes) return false;
      if (newer || joining) {
        state.pin = sh.pin || (joining ? state.pin : null);
        if (sh.currency) state.settings.currency = sh.currency;
        state.settings.timer = !!sh.timer;
        const order = sh.order || [], ix = id => { const k = order.indexOf(id); return k < 0 ? 1e9 : k; };
        state.profiles.sort((a, b) => ix(a.id) - ix(b.id));
        if (newer) state.sharedAt = d.updatedAt;
      }
      state.deleted = deleted;
      state.profiles = state.profiles.filter(p => !deleted[p.id]);
      if (!state.profiles.some(p => p.id === state.current)) state.current = state.profiles[0] ? state.profiles[0].id : null;
      knownShared = sharedOf();
      return true;
    }

    function stopListening() { unsubs.forEach(f => f()); unsubs = []; devices = []; parents = []; }
    async function unlinked() {
      stopListening();
      if (user && db) db.collection('users').doc(user.uid).delete().catch(() => {});
      fid = null; role = null; me = {}; flag(false);
      setStatus('unlinked'); toast(LABELS.unlinked); rerender();
    }

    // Restore on page load or react to sign-out
    async function onUser(u) {
      stopListening();
      user = u; fid = null; role = null; me = {}; lastError = null;
      if (!u) { flag(false); setStatus('off'); return rerender(); }
      setStatus('loading');
      try {
        const ud = await db.collection('users').doc(u.uid).get();
        if (ud.exists && ud.data().fid) {
          fid = ud.data().fid; role = ud.data().role;
          const mem = await fam().collection(role === 'parent' ? 'parents' : 'devices').doc(u.uid).get();
          if (!mem.exists) return unlinked();
          me = mem.data();
        } else if (!u.isAnonymous) {
          await createFamily(u);
        } else { setStatus('off'); return rerender(); }
        flag(true);
        await startSync();
      } catch (e) {
        // A lost membership is handled above; a refusal here means the database rules don't allow this account
        fid = null; role = null;
        lastError = e && e.code === 'permission-denied'
          ? userError('Signed in, but the family database refused it. In Firebase → Firestore Database → Rules, publish the rules from firestore.rules, then try again.')
          : e;
        setStatus(navigator.onLine === false ? 'offline' : 'error');
      }
    }
    async function createFamily(u) {
      fid = u.uid; role = 'parent'; me = { email: u.email || '', joinedAt: Date.now() };
      const b = db.batch();
      b.set(db.collection('families').doc(fid), { createdBy: u.uid, shared: sharedOf(), updatedAt: Date.now() }, { merge: true });
      b.set(fam().collection('parents').doc(u.uid), me);
      b.set(db.collection('users').doc(u.uid), { fid, role });
      await b.commit();
    }
    async function join(j) {
      const snap = await db.collection('codes').doc(j.code).get();
      const c = snap.exists ? snap.data() : null;
      if (!c) throw userError('That code was not found. Check the letters and try again.');
      if (c.role !== j.role) throw userError(c.role === 'parent' ? 'That is an invite code for a parent. Use it under "Parent login" instead.' : 'That code is for linking a child\'s device, not for a parent account.');
      if (c.expires.toMillis() < Date.now()) throw userError('That code has expired. Ask for a new one.');
      fid = c.fid; role = j.role;
      me = j.role === 'device' ? { name: j.name, code: j.code, linkedAt: Date.now(), lastSeen: Date.now() } : { email: user.email || '', code: j.code, joinedAt: Date.now() };
      const b = db.batch();
      b.set(fam().collection(j.role === 'device' ? 'devices' : 'parents').doc(user.uid), me);
      b.set(db.collection('users').doc(user.uid), { fid, role });
      await b.commit();
    }

    async function startSync() {
      setStatus('loading');
      const [famDoc, players] = await Promise.all([fam().get(), fam().collection('players').get()]);
      const remoteAt = {}, remote = [];
      players.forEach(doc => {
        const d = doc.data(); remoteAt[doc.id] = d.updatedAt || 0;
        try { const p = JSON.parse(d.data); remote.push(p); applyProfile(p); } catch (e) { /* skip a bad document */ }
      });
      if (famDoc.exists && famDoc.data().shared) applyShared(famDoc.data(), true);
      // The same child on this device and in the family? Ask before uploading this copy.
      const key = p => p.name.trim().toLowerCase() + '|' + p.grade;
      const byKey = new Map(remote.map(p => [key(p), p]));
      dupes = state.profiles.filter(p => !(p.id in remoteAt) && byKey.has(key(p))).map(p => ({ local: p, remote: byKey.get(key(p)) }));
      dirty = new Set();
      for (const p of state.profiles) if (!(p.id in remoteAt) || (p.updatedAt || 0) > remoteAt[p.id]) dirty.add(p.id);
      knownShared = sharedOf();
      dirtyShared = !famDoc.exists || famDoc.data().shared !== knownShared;
      if (dirtyShared) state.sharedAt = Date.now();
      afterRemote();
      listen();
      if (role === 'device') fam().collection('devices').doc(user.uid).update({ lastSeen: Date.now() }).catch(() => {});
      setStatus('synced');
      if (dirty.size || dirtyShared) flush();
      if (dupes.length) setTimeout(askDupe, 700);
    }
    function listen() {
      const failed = e => (e && e.code === 'permission-denied' ? unlinked() : setStatus('error'));
      unsubs.push(fam().collection('players').onSnapshot(snap => {
        let changed = false;
        snap.docChanges().forEach(ch => {
          if (ch.type === 'removed' || ch.doc.metadata.hasPendingWrites) return;
          try { changed = applyProfile(JSON.parse(ch.doc.data().data)) || changed; } catch (e) { /* skip a bad document */ }
        });
        if (changed) afterRemote();
      }, failed));
      unsubs.push(fam().onSnapshot(doc => {
        if (!doc.exists || doc.metadata.hasPendingWrites || !doc.data().shared) return;
        if (applyShared(doc.data())) afterRemote();
      }, failed));
      if (role !== 'parent') return;
      unsubs.push(fam().collection('devices').onSnapshot(s => {
        devices = s.docs.map(d => Object.assign({ id: d.id }, d.data()));
        if (code && code.role === 'device' && devices.some(d => d.code === code.code)) code.used = true;
        rerender();
      }, () => {}));
      unsubs.push(fam().collection('parents').onSnapshot(s => {
        parents = s.docs.map(d => Object.assign({ id: d.id }, d.data()));
        if (code && code.role === 'parent' && parents.some(p => p.code === code.code)) code.used = true;
        rerender();
      }, () => {}));
    }
    function askDupe() {
      const d = dupes[0];
      if (!d) return;
      if (document.querySelector('.overlay, .celebrate')) { setTimeout(askDupe, 800); return; }
      openSheet(`<div class="stack center"><h2>Is this the same ${h(d.local.name)}?</h2>
        <p class="muted">Your family already has ${h(d.remote.avatar)} ${h(d.remote.name)} (Grade ${d.remote.grade}). This device also has ${h(d.local.avatar)} ${h(d.local.name)} (Grade ${d.local.grade}).</p>
        <button class="btn primary block" data-act="dupyes">Yes, combine them</button>
        <button class="btn ghost block" data-act="dupno">No, keep both</button></div>`, true);
    }
    async function parentFlow(signIn, invite) {
      if (flow) return;
      flow = true;
      try {
        await ensureSdk();
        const cred = await signIn();
        user = cred.user;
        const inv = normCode(invite);
        if (inv) {
          stopListening();
          // A refused invite code must not leave a signed-in parent without a family (a reload would make a new one)
          try { await join({ code: inv, role: 'parent' }); }
          catch (e) { fid = null; role = null; user = null; await fb.auth().signOut(); throw e; }
          flag(true); await startSync();
        } else await onUser(user);
        if (!fid) throw lastError || userError('Signed in, but the family could not be opened. Check the internet connection and try again.');
      } finally { flow = false; }
    }

    return {
      enabled,
      friendly,
      get isParent() { return !!fid && role === 'parent'; },
      get isDevice() { return !!fid && role === 'device'; },
      prime,
      track,
      boot() {
        if (!enabled) return;
        prime();
        let f = null;
        try { f = localStorage.getItem(FLAG); } catch (e) { /* storage blocked */ }
        if (f) ensureSdk().catch(() => setStatus('offline'));
        addEventListener('online', () => { if (fid) { setStatus('synced'); flush(); } });
        addEventListener('offline', () => { if (fid) setStatus('offline'); });
      },
      // Load the SDK early where a sign-in button is shown, so a tap can open the Google popup directly
      warm() { if (enabled && !fid) ensureSdk().catch(() => {}); },
      loginEmail: (email, pw, invite) => parentFlow(() => fb.auth().signInWithEmailAndPassword(String(email || '').trim(), pw || ''), invite),
      signupEmail: (email, pw, invite) => parentFlow(() => fb.auth().createUserWithEmailAndPassword(String(email || '').trim(), pw || ''), invite),
      loginGoogle: invite => parentFlow(() => {
        const provider = new fb.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        return fb.auth().signInWithPopup(provider);
      }, invite),
      async resetPassword(email) {
        await ensureSdk();
        await fb.auth().sendPasswordResetEmail(String(email || '').trim());
      },
      async link(codeText, name) {
        const c = normCode(codeText);
        if (c.length !== 8) throw userError('The code has 8 letters and numbers, like ABCD-EFGH.');
        if (flow) return;
        flow = true;
        try {
          await ensureSdk();
          const cur = fb.auth().currentUser;
          if (!cur || !cur.isAnonymous) { if (cur) await fb.auth().signOut(); await fb.auth().signInAnonymously(); }
          user = fb.auth().currentUser;
          stopListening();
          await join({ code: c, role: 'device', name: String(name || '').trim().slice(0, 30) || 'Child\'s device' });
          flag(true);
          await startSync();
        } catch (e) { fid = null; role = null; throw e; }
        finally { flow = false; }
      },
      async signOut() { stopListening(); fid = null; role = null; code = null; if (fb) await fb.auth().signOut(); },
      async unlinkSelf() {
        if (!fid || role !== 'device') return;
        await fam().collection('devices').doc(user.uid).delete();
        await db.collection('users').doc(user.uid).delete();
        stopListening(); fid = null; role = null; me = {}; flag(false); setStatus('off');
      },
      async createCode(kind) {
        if (role !== 'parent') return;
        for (let attempt = 0; attempt < 5; attempt++) {
          const c = Array.from(crypto.getRandomValues(new Uint32Array(8)), n => CODE_CHARS[n % CODE_CHARS.length]).join('');
          const ms = Date.now() + (kind === 'device' ? 15 * 60 * 1000 : 24 * 3600 * 1000);
          try {
            await db.collection('codes').doc(c).set({ fid, role: kind, expires: fb.firestore.Timestamp.fromMillis(ms), createdBy: user.uid });
            code = { code: c, role: kind, expires: ms, used: false };
            rerender();
            return code;
          } catch (e) { if (attempt === 4) throw e; }
        }
      },
      clearCode() {
        if (code && db) db.collection('codes').doc(code.code).delete().catch(() => {});
        code = null; rerender();
      },
      unlinkDevice: id => fam().collection('devices').doc(id).delete(),
      removeParent: id => fam().collection('parents').doc(id).delete(),
      deviceName: id => (devices.find(d => d.id === id) || {}).name || 'this device',
      // A same-named child was found when this device joined: combine into the family's copy, or keep both
      resolveDupe(same) {
        const d = dupes.shift();
        closeSheet();
        if (!d) return;
        const target = state.profiles.find(p => p.id === d.remote.id);
        if (same && target) {
          combineProfiles(target, d.local);
          state.aliases = Object.assign({}, state.aliases, { [d.local.id]: target.id });
          state.profiles = state.profiles.filter(p => p.id !== d.local.id);
          if (state.current === d.local.id) state.current = target.id;
          toast(`Combined into ${h(target.name)}`);
        } else dirty.add(d.local.id);
        save(); rerender();
        if (dupes.length) setTimeout(askDupe, 400);
      },
      // Apply updates that arrived for the active player during a round. The round just played is
      // stamped first, so if the same player was used on two devices at once this device's round wins.
      settle() {
        track();
        const ps = Object.values(pendingRemote); pendingRemote = {};
        if (ps.map(applyProfile).some(Boolean)) save();
      },
      chip() { return fid ? `<span class="chip" id="syncchip" title="Family account">${ICONS[status] || '☁️'}</span>` : ''; },
      // Family account card for children's devices and not-yet-connected devices (Parents tab)
      card() {
        if (IN_ARTIFACT) return '';
        if (!enabled) return `<div class="card stack"><h3>☁️ Family account</h3><p class="muted" style="font-size:.9rem">Online saving isn't set up for this copy of the game, so progress stays on this device.</p></div>`;
        if (role === 'device') return `<div class="card stack"><h3>☁️ Family account</h3>
          <p style="font-size:.95rem">Linked to your family as <b>${h(me.name || 'this device')}</b>. Progress saves online by itself, and parents can see it from their own login.</p>
          <p class="muted" id="syncstatus" style="font-size:.9rem">${LABELS[status]}</p>
          <button class="btn small ghost" data-act="unlinkself">Unlink this device</button></div>`;
        return `<div class="card stack"><h3>☁️ Family account</h3>
          <p style="font-size:.95rem">${status === 'unlinked' ? h(LABELS.unlinked) + ' ' : ''}Link this device to your family so progress is saved online, or log in as a parent to see every child's progress.</p>
          <div class="grid2"><button class="btn primary" data-act="linkopen">Link to my family</button><button class="btn" data-act="loginopen">Parent login</button></div></div>`;
      },
      // Devices and parents card for a logged-in parent
      devicesCard() {
        const day = t => (t ? new Date(t).toLocaleDateString() : '–');
        let codeBox = '';
        if (code && code.used) codeBox = `<div class="hintbox"><span class="hi">✅</span><span>${code.role === 'device' ? 'Linked! That device now saves to your family.' : 'The other parent has joined your family.'}</span></div><button class="btn small ghost" data-act="codedone">OK</button>`;
        else if (code) codeBox = `<div class="codebox" aria-label="Link code">${fmtCode(code.code)}</div>
          <p class="muted center" style="font-size:.88rem">${code.role === 'device' ? 'On the child\'s device tap <b>Link to my family</b> and type this code. It works for 15 minutes.' : 'The other parent opens the game, taps <b>Parent login</b>, signs in or creates an account, and types this code under <b>Invite code</b>. It works for 24 hours.'}</p>
          <button class="btn small ghost" data-act="codedone">Cancel this code</button>`;
        return `<div class="card stack"><h3>🔗 Devices and parents</h3>
          <p class="muted" style="font-size:.9rem">Signed in as <b>${h((user && user.email) || 'parent')}</b>. Children's devices linked to your family save their progress here by themselves.</p>
          <p class="muted" id="syncstatus" style="font-size:.9rem">${LABELS[status]}</p>
          ${codeBox}
          ${code ? '' : `<div class="grid2"><button class="btn primary" data-act="mkcode" data-r="device">Link a child's device</button><button class="btn" data-act="mkcode" data-r="parent">Invite another parent</button></div>`}
          <span class="eyebrow">Linked devices · ${devices.length}</span>
          ${devices.length ? devices.map(d => `<div class="row between"><span>📱 <b>${h(d.name)}</b> <span class="muted">· last seen ${day(d.lastSeen)}</span></span><button class="btn small ghost" data-act="unlinkdev" data-id="${h(d.id)}">Unlink</button></div>`).join('') : '<p class="muted" style="font-size:.9rem">No devices linked yet.</p>'}
          <span class="eyebrow">Parents · ${parents.length}</span>
          ${parents.map(p => `<div class="row between"><span>👤 ${h(p.email || 'Parent')}${user && p.id === user.uid ? ' <span class="muted">(you)</span>' : ''}</span>${user && p.id === user.uid ? '' : `<button class="btn small ghost" data-act="rmparent" data-id="${h(p.id)}">Remove</button>`}</div>`).join('')}
          <button class="btn small ghost" data-act="signout">Sign out on this device</button></div>`;
      },
    };
  })();

  const P = () => state.profiles.find(p => p.id === state.current) || null;
  const theme = () => THEMES[(P() && P().theme) || 'space'] || THEMES.space;

  // ---------- Curriculum helpers ----------
  const ctx = () => ({ currency: state.settings.currency || '₼' });
  const unitsOf = g => PMLM.unitsOf(g);
  const skillsOf = g => PMLM.skillsOf(g);
  const bossUnlocked = (p, unitId) => PMLM.skillsInUnit(unitId).every(s => skillState(gradeState(p, s.grade), s.id).stars >= 1);
  function gradeProgress(p, g) {
    const list = skillsOf(g), gs = gradeState(p, g);
    const mastered = list.filter(s => skillState(gs, s.id).mastered).length;
    return { mastered, total: list.length, pct: list.length ? Math.round(mastered / list.length * 100) : 0 };
  }
  const needsRefresh = ss => ss.mastered && Date.now() - ss.last > 7 * 86400000;
  function nextSkill(p, g) {
    const gs = gradeState(p, g), list = skillsOf(g);
    return list.find(s => needsRefresh(skillState(gs, s.id)))
      || list.find(s => !skillState(gs, s.id).mastered && skillState(gs, s.id).stars < 1)
      || list.find(s => !skillState(gs, s.id).mastered)
      || list[0];
  }
  // Most recent time this player answered a question (0 if never)
  const lastActivity = p => Math.max(0, ...Object.values(p.grades || {}).flatMap(g => Object.values(g.skills || {}).map(s => s.last || 0)));

  // Fold player b into player a: the stronger record wins for each skill, and mistakes and bosses are
  // pooled. sum=true (two separate records of one child) adds coins and totals; sum=false (a newer copy
  // of the same record, e.g. a backup code from the child's device) keeps the larger of each instead.
  function combineProfiles(a, b, sum = true) {
    const add = (x, y) => (sum ? (x || 0) + (y || 0) : Math.max(x || 0, y || 0));
    a.coins = add(a.coins, b.coins);
    a.brain = add(a.brain, b.brain);
    for (const k of ['answered', 'correct', 'first', 'ms', 'rounds', 'fixed', 'perfect']) a.stats[k] = add(a.stats[k], (b.stats || {})[k]);
    a.stats.bestCombo = Math.max(a.stats.bestCombo || 0, (b.stats || {}).bestCombo || 0);
    a.owned = [...new Set([...(a.owned || []), ...(b.owned || [])])];
    for (const [k, t] of Object.entries(b.trophies || {})) if (!a.trophies[k] || t < a.trophies[k]) a.trophies[k] = t;
    if (((b.streak || {}).days || 0) > ((a.streak || {}).days || 0)) a.streak = Object.assign({}, b.streak);
    const score = s => (s.mastered ? 1e9 : 0) + (s.stars || 0) * 1e6 + (s.tries || 0);
    const rank = { locked: 0, unlocked: 1, granted: 2 };
    for (const [g, gb] of Object.entries(b.grades || {})) {
      const ga = gradeState(a, +g);
      for (const [id, sb] of Object.entries(gb.skills || {})) {
        const sa = ga.skills[id];
        if (!sa || score(sb) > score(sa)) ga.skills[id] = Object.assign({}, sb, { lesson: sb.lesson || !!(sa && sa.lesson), extra: Math.max(sb.extra || 0, (sa && sa.extra) || 0) });
        else { sa.lesson = sa.lesson || sb.lesson; sa.extra = Math.max(sa.extra || 0, sb.extra || 0); }
      }
      const seen = new Set(ga.review.map(r => r.skill + '|' + r.q.q));
      for (const r of gb.review || []) if (!seen.has(r.skill + '|' + r.q.q)) ga.review.push(r);
      ga.review = ga.review.slice(-30);
      for (const [u, won] of Object.entries(gb.bosses || {})) if (won) ga.bosses[u] = true;
      ga.placed = ga.placed || !!gb.placed;
      (gb.wishes || []).forEach((wb, i) => {
        const wa = ga.wishes[i];
        if (!wa) return;
        if (!wa.text.trim() && (wb.text || '').trim()) { wa.text = wb.text; wa.emoji = wb.emoji; }
        if ((rank[wb.status] || 0) > (rank[wa.status] || 0)) Object.assign(wa, { status: wb.status, unlockedAt: wb.unlockedAt, grantedAt: wb.grantedAt });
      });
    }
    return a;
  }

  function counts(p) {
    const c = { lessons: 0, stars: 0, mastered: 0, bosses: 0, wishes: 0, gradesDone: 0 };
    for (const g of Object.keys(p.grades)) {
      const gs = p.grades[g];
      for (const ss of Object.values(gs.skills)) { if (ss.lesson) c.lessons++; if (ss.stars) c.stars++; if (ss.mastered) c.mastered++; }
      c.bosses += Object.values(gs.bosses).filter(Boolean).length;
      c.wishes += gs.wishes.filter(w => w.status !== 'locked').length;
      if (skillsOf(+g).length && gradeProgress(p, +g).pct >= 100) c.gradesDone++;
    }
    return c;
  }

  // ---------- Rewards: quests, trophies, streaks, wishes ----------
  const toast = msg => {
    const el = document.createElement('div');
    el.className = 'toast'; el.innerHTML = msg;
    $('#toast').appendChild(el);
    setTimeout(() => el.remove(), 3100);
  };
  function dailyQuests(p) {
    const d = today();
    if (p.quests.date !== d) {
      let seed = [...d].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
      const pool = QUESTS.slice(), list = [];
      while (list.length < 3) { seed = (seed * 1103515245 + 12345) >>> 0; list.push(pool.splice(seed % pool.length, 1)[0].id); }
      p.quests = { date: d, list: list.map(id => ({ id, progress: 0, done: false })) };
    }
    return p.quests.list;
  }
  function quest(ev, amount = 1) {
    const p = P(); if (!p) return;
    for (const q of dailyQuests(p)) {
      const def = QUESTS.find(x => x.id === q.id);
      if (!def || def.ev !== ev || q.done) continue;
      q.progress = def.max ? Math.max(q.progress, amount) : q.progress + amount;
      if (q.progress >= def.goal) {
        q.done = true; q.progress = def.goal; p.coins += def.coins;
        toast(`Quest complete! ${def.icon} +${def.coins} 🪙`); Sfx.coin();
      }
    }
  }
  function checkTrophies(p) {
    const c = counts(p), fresh = [];
    for (const t of TROPHIES) if (!p.trophies[t.id] && t.test(p, c)) { p.trophies[t.id] = Date.now(); fresh.push(t); }
    fresh.forEach((t, i) => setTimeout(() => toast(`New trophy! ${t.icon} ${h(t.name)}`), 400 + i * 700));
    return fresh;
  }
  function touchStreak(p) {
    const d = today();
    if (p.streak.last === d) return;
    p.streak.days = p.streak.last && dayDiff(p.streak.last, d) === 1 ? p.streak.days + 1 : 1;
    p.streak.last = d;
  }
  // Returns wishes that just unlocked
  function checkWishes(p, g) {
    const gs = gradeState(p, g), { pct } = gradeProgress(p, g), out = [];
    for (const w of gs.wishes) {
      if (pct >= w.at && w.status === 'locked' && w.text.trim()) { w.status = 'unlocked'; w.unlockedAt = Date.now(); out.push(w); }
    }
    return out;
  }

  // ---------- Read aloud (browser speech) ----------
  const CAN_SPEAK = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
  const FRAC_NAMES = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'], 8: ['eighth', 'eighths'], 10: ['tenth', 'tenths'], 12: ['twelfth', 'twelfths'], 100: ['hundredth', 'hundredths'] };
  function spoken(s) {
    return String(s || '')
      .replace(/\*\*/g, '')
      .replace(/\{(\d+)\/(\d+)\}/g, (m, n, d) => { const f = FRAC_NAMES[d]; return f ? `${n} ${+n === 1 ? f[0] : f[1]}` : `${n} over ${d}`; })
      .replace(/\{([^{}\/]+)\/([^{}]+)\}/g, '$1 over $2')
      .replace(/\^\{2\}|²/g, ' squared').replace(/\^\{3\}|³/g, ' cubed').replace(/\^\{([^}]*)\}/g, ' to the power $1')
      .replace(/_\{([^}]*)\}/g, ' $1').replace(/~\{([^}]*)\}/g, '$1 recurring')
      .replace(/(^|[\s(])−(?=\d)/g, '$1negative ').replace(/−/g, ' minus ')
      .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/□/g, ' what number ').replace(/ = /g, ' equals ')
      .replace(/ < /g, ' is less than ').replace(/ > /g, ' is greater than ').replace(/≤/g, ' is less than or equal to ').replace(/≥/g, ' is greater than or equal to ')
      .replace(/°/g, ' degrees').replace(/%/g, ' percent').replace(/√/g, 'square root of ').replace(/\n/g, '. ');
  }
  function speak(text) {
    if (!CAN_SPEAK) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(spoken(text));
      u.lang = 'en-GB'; u.rate = 0.88; u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch (e) { /* speech unavailable */ }
  }
  const speakBtn = act => (CAN_SPEAK ? `<button class="iconbtn" data-act="${act}" aria-label="Read aloud" style="width:36px;height:36px;font-size:1rem">🔊</button>` : '');

  // ---------- Answer checking ----------
  const parseNum = s => {
    s = String(s || '').replace(/[,\s]/g, '').replace(/−/g, '-');
    return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : NaN;
  };
  // 'right' | 'wrong' | 'simplify' | 'empty'
  function judge(q, inp) {
    if (q.kind === 'choice') return inp.choice === q.answer ? 'right' : 'wrong';
    if (q.kind === 'number') {
      if (inp.a === '' || inp.a === '-') return 'empty';
      const v = parseNum(inp.a);
      if (Number.isNaN(v)) return 'wrong';
      return Math.abs(v - q.answer) <= (q.tolerance || 0) + 1e-9 ? 'right' : 'wrong';
    }
    if (q.kind === 'coord') {
      if (inp.x === '' || inp.y === '') return 'empty';
      return parseNum(inp.x) === q.answer[0] && parseNum(inp.y) === q.answer[1] ? 'right' : 'wrong';
    }
    if (inp.n === '' || inp.d === '') return 'empty';
    const w = inp.w === '' || inp.w == null ? 0 : parseNum(inp.w), n = parseNum(inp.n), d = parseNum(inp.d);
    if (![w, n, d].every(Number.isInteger) || d === 0) return 'wrong';
    const num = w < 0 || Object.is(w, -0) || String(inp.w).startsWith('-') ? w * d - n : w * d + n;
    const [an, ad] = q.answer;
    if (num * ad !== an * d) return 'wrong';
    if (q.simplest && (U.gcd(n, d) !== 1 || (q.mixed && w !== 0 && Math.abs(n) >= d) || (q.mixed && Math.abs(an) > ad && w === 0))) return 'simplify';
    return 'right';
  }
  function answerText(q) {
    if (q.kind === 'choice') return q.answer;
    if (q.kind === 'coord') return `(${U.fmt(q.answer[0])}, ${U.fmt(q.answer[1])})`;
    if (q.kind === 'fraction') return q.mixed ? U.mixed(...q.answer) : U.frac(...q.answer);
    return (q.prefix || '') + U.fmt(q.answer) + (q.unit ? ' ' + q.unit : '');
  }

  // ---------- Screens ----------
  let S = { screen: 'home', tab: 'play' };
  let R = null; // active round

  function applyTheme() {
    const p = P(), id = (p && p.theme) || 'space';
    document.documentElement.dataset.world = id;
    World.setTheme(id); FX.setTheme(id);
    Sfx.setSfx(state.settings.sfx); Sfx.setMusic(state.settings.music);
  }

  function render() {
    applyTheme();
    if (R && R.timerId) { clearInterval(R.timerId); R.timerId = 0; }
    if (S.screen === 'familyonly' && Sync.isParent) return renderFamilyOnly();
    // A parent's own phone may have no player of its own: show the first child so the dashboard opens
    if (!P() && Sync.isParent && state.profiles.length) state.current = state.profiles[0].id;
    const p = P();
    if (!p) return state.profiles.length ? renderPlayers() : renderWelcome();
    if (S.screen === 'lesson') return renderLesson();
    if (S.screen === 'round') return renderQuestion();
    if (S.screen === 'results') return renderResults();
    if (S.screen === 'trydone') return renderTryDone();
    renderChrome();
    ({ play: renderPlay, wishes: renderWishes, me: renderMe, parent: renderParent })[S.tab]();
    view.scrollTop = S.keepScroll ? view.scrollTop : 0;
  }

  function chrome(show) { topEl.hidden = !show; tabsEl.hidden = !show; }

  function renderChrome() {
    const p = P();
    chrome(true);
    const muted = !state.settings.sfx && !state.settings.music;
    topEl.innerHTML = `
      <button class="chip player" data-act="players" aria-label="Switch player"><span class="av">${h(p.avatar)}${p.hat ? `<span class="hat">${h(p.hat)}</span>` : ''}</span>${h(p.name)}</button>
      <div class="grow"></div>
      <span class="chip" title="Day streak">🔥 <span class="num">${p.streak.days}</span></span>
      <span class="chip" title="Coins">🪙 <span class="num">${fmt(p.coins)}</span></span>
      ${Sync.chip()}
      <button class="iconbtn" data-act="mute" aria-label="${muted ? 'Turn sound on' : 'Turn sound off'}">${muted ? '🔇' : '🔊'}</button>`;
    const t = theme(), unlocked = GRADES.reduce((a, g) => a + gradeState(p, g).wishes.filter(w => w.status === 'unlocked').length, 0);
    tabsEl.innerHTML = [['play', t.emoji, 'Play'], ['wishes', '🎁', 'Wishes' + (unlocked ? ` (${unlocked})` : '')], ['me', '🏆', 'Me'], ['parent', '🔒', 'Parents']]
      .map(([id, ic, lb]) => `<button class="tab ${S.tab === id ? 'on' : ''}" data-act="tab" data-id="${id}"><span class="ti">${ic}</span>${lb}</button>`).join('');
  }

  function renderWelcome() {
    chrome(false);
    view.innerHTML = `
      <div class="stack" style="min-height:100%;justify-content:center;padding-block:24px">
        <h1 class="logo"><span class="l1">Play More</span><span class="l2">Learn More</span></h1>
        <div class="mascot" style="justify-content:center"><div class="face">🤖</div><div class="bubble">Hi! I'm Blip. Let's make maths fun, one combo at a time!</div></div>
        <p class="center muted">Cambridge maths practice for Grades 1 to 9: short lessons, hints when you need them, and wishes to unlock.</p>
        ${Sync.isParent ? '<p class="center"><b>You are logged in as a parent.</b> Your family has no players yet. Add one here, or link a child\'s device.</p>' : ''}
        <button class="btn primary block pulse" data-act="newplayer">Add a player</button>
        ${Sync.isParent ? '<button class="btn block" data-act="familyonly">🔗 Link a child\'s device</button>'
          : Sync.enabled ? `<div class="grid2"><button class="btn ghost" data-act="linkopen">🔗 Link to my family</button><button class="btn ghost" data-act="loginopen">👤 Parent login</button></div>
            <p class="center muted" style="font-size:.85rem">Already playing on another device? A parent shows a link code in their dashboard. Type it here with "Link to my family".</p>` : ''}
      </div>`;
    Sync.warm();
  }

  // A logged-in parent whose family has no players yet: just the devices and parents card
  function renderFamilyOnly() {
    chrome(false);
    view.innerHTML = `<div class="stack" style="padding-block:16px">
      <div class="row between"><h2>Your family</h2><button class="iconbtn" data-act="home" aria-label="Back">✕</button></div>
      ${Sync.devicesCard()}</div>`;
  }

  function renderPlayers() {
    chrome(false);
    view.innerHTML = `
      <div class="stack" style="padding-block:24px">
        <h1 class="logo small"><span class="l1">Play More </span><span class="l2">Learn More</span></h1>
        <h2>Who's playing?</h2>
        <div class="grid2">${state.profiles.map(p => `
          <button class="card" data-act="pick" data-id="${p.id}" style="border:0;text-align:center;display:flex;flex-direction:column;gap:6px;align-items:center">
            <span style="font-size:3rem;line-height:1">${h(p.avatar)}</span><b class="num" style="font-size:1.3rem">${h(p.name)}</b>
            <span class="muted">Grade ${p.grade} · ${THEMES[p.theme].emoji} ${THEMES[p.theme].name}</span></button>`).join('')}
        </div>
        <button class="btn ghost block" data-act="newplayer">+ Add a player</button>
      </div>`;
  }

  function renderNewPlayer(edit) {
    chrome(false);
    const d = S.np || (S.np = { name: '', avatar: AVATARS[0], grade: 2, theme: 'space' });
    view.innerHTML = `
      <div class="stack" style="padding-block:20px">
        <div class="row between"><h2>New player</h2>${state.profiles.length ? '<button class="iconbtn" data-act="cancelnew" aria-label="Cancel">✕</button>' : ''}</div>
        <div class="field"><label for="np-name">Name</label><input id="np-name" maxlength="16" autocomplete="off" value="${h(d.name)}" placeholder="Your name"></div>
        <div class="field"><label>Pick an avatar</label><div class="avatars">${AVATARS.map(a => `<button class="avbtn ${d.avatar === a ? 'on' : ''}" data-act="np" data-k="avatar" data-v="${a}">${a}</button>`).join('')}</div></div>
        <div class="field">${gradePick(d.grade, 'np', 'data-k="grade"')}</div>
        <div class="field"><label>Pick a world</label><div class="themes">${Object.entries(THEMES).map(([id, t]) => `<button class="themecard t-${id} ${d.theme === id ? 'on' : ''}" data-act="np" data-k="theme" data-v="${id}"><span class="te">${t.emoji}</span>${t.name}<small>${t.blurb}</small></button>`).join('')}</div></div>
        <button class="btn primary block" data-act="createplayer">Start playing</button>
      </div>`;
    document.documentElement.dataset.world = d.theme; World.setTheme(d.theme);
  }

  // ----- Play tab -----
  function ring(pct) {
    const r = 46, c = 2 * Math.PI * r;
    return `<div class="ring"><svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="${r}" style="fill:none;stroke:var(--panel2);stroke-width:12"/><circle cx="55" cy="55" r="${r}" style="fill:none;stroke:var(--go);stroke-width:12;stroke-linecap:round;stroke-dasharray:${c};stroke-dashoffset:${c * (1 - pct / 100)};transition:stroke-dashoffset 1s"/></svg><div class="lbl"><b>${pct}%</b><small>mastered</small></div></div>`;
  }

  function renderPlay() {
    const p = P(), g = p.grade, gs = gradeState(p, g), t = theme(), units = unitsOf(g);
    const prog = gradeProgress(p, g), next = nextSkill(p, g);
    const nextWish = gs.wishes.find(w => w.status === 'locked');
    const hour = new Date().getHours(), hi = hour < 12 ? 'Good morning' : hour < 18 ? 'Hi' : 'Good evening';
    const msg = !units.length ? 'This grade is coming soon!' : prog.pct >= 100 ? 'You mastered the whole grade! Legend!' : next && skillState(gs, next.id).stars ? `Let's beat ${next.title}!` : `${hi}, ${h(p.name)}! Ready to learn?`;
    const quests = dailyQuests(p);
    let html = `<div class="stack">
      ${gradePick(g)}
      <div class="card stack">
        <div class="hero">${ring(prog.pct)}<div class="stack" style="gap:8px;min-width:0">
          <div class="mascot"><div class="face" style="font-size:2.4rem">${t.mascot}</div><div class="bubble">${msg}</div></div>
          <div class="muted" style="font-size:.9rem">${prog.mastered} of ${prog.total} skills mastered</div></div></div>
        ${next ? `<button class="btn primary block pulse" data-act="skill" data-id="${next.id}">${t.go} ${h(next.icon)} ${h(next.title)}</button>` : ''}
        <div class="grid2">
          <button class="btn small" data-act="fixit" ${gs.review.length ? '' : 'disabled'}>🔧 Fix-it (${gs.review.length})</button>
          <button class="btn small" data-act="place" ${units.length ? '' : 'disabled'}>🧭 Find my level</button>
        </div>
      </div>`;
    if (nextWish) {
      html += `<button class="card" data-act="tab" data-id="wishes" style="border:0;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center">
        <span style="font-size:2.2rem">${h(nextWish.emoji || '🎁')}</span>
        <span class="stack" style="gap:6px;min-width:0"><span class="eyebrow">Next wish at ${nextWish.at}%</span>
        <b style="font-family:var(--font-display);font-size:1.1rem">${nextWish.text ? h(nextWish.text) : 'Ask a grown-up to add a wish!'}</b>
        <span class="bar gold"><i style="width:${Math.min(100, prog.pct / nextWish.at * 100)}%"></i></span></span></button>`;
    }
    html += `<div class="card stack" style="gap:10px"><div class="row between"><h3>Today's quests</h3><span class="muted" style="font-size:.85rem">New quests every day</span></div>
      ${quests.map(q => { const d = QUESTS.find(x => x.id === q.id); return `<div class="quest ${q.done ? 'done' : ''}"><span class="qi">${q.done ? '✅' : d.icon}</span><div class="stack" style="gap:4px"><b>${d.text}</b><span class="bar"><i style="width:${q.progress / d.goal * 100}%"></i></span></div><span class="qr">+${d.coins} 🪙</span></div>`; }).join('')}
    </div>`;
    html += `<div><span class="eyebrow">${t.mapTitle} · Grade ${g}</span>`;
    units.forEach((u, ui) => {
      const skills = PMLM.skillsInUnit(u.id), done = skills.filter(s => skillState(gs, s.id).mastered).length, hue = (ui * 57 + g * 40) % 360;
      html += `<section class="unit"><div class="unit-head"><div class="world-node" style="background:${t.node(hue)};${t.ring && ui % 2 === 0 ? '--ring:block' : ''}">${h(u.icon)}</div>
        <div class="stack" style="gap:6px;min-width:0"><span class="eyebrow">Unit ${ui + 1} · ${done}/${skills.length} mastered</span><h3>${h(u.name)}</h3><span class="bar"><i style="width:${skills.length ? done / skills.length * 100 : 0}%"></i></span></div></div><div class="path">`;
      skills.forEach((s, i) => {
        const ss = skillState(gs, s.id), x = Math.round(Math.sin(i * 1.25 + ui) * 44);
        const cls = ['node', ss.mastered ? 's3' : ss.stars ? 's' + ss.stars : '', next && next.id === s.id ? 'current' : ''].join(' ');
        html += `<button class="${cls}" style="--x:${x}px" data-act="skill" data-id="${s.id}" aria-label="${h(s.title)}">${h(s.icon)}
          ${needsRefresh(ss) ? '<span class="badge">↻</span>' : ''}<span class="stars">${'⭐'.repeat(ss.mastered ? 3 : ss.stars)}</span>
          <span class="nlabel ${x >= 0 ? 'l' : 'r'}">${h(s.title)}</span></button>`;
      });
      const bu = bossUnlocked(p, u.id), won = gs.bosses[u.id], bx = Math.round(Math.sin(skills.length * 1.25 + ui) * 44);
      html += `<button class="node boss ${bu ? '' : 'locked'} ${won ? 'won' : ''}" style="--x:${bx}px" data-act="boss" data-id="${u.id}" aria-label="Boss battle">${bu ? t.bosses[ui % t.bosses.length] : '🔒'}<span class="nlabel ${bx >= 0 ? 'l' : 'r'}">${won ? 'Boss beaten!' : 'Boss battle'}</span></button></div></section>`;
    });
    if (!units.length) html += `<p class="muted" style="margin-top:12px">No skills for this grade yet.</p>`;
    html += `</div></div>`;
    view.innerHTML = html;
  }

  function openSheet(inner, mid) {
    closeSheet();
    const o = document.createElement('div');
    o.className = 'overlay' + (mid ? ' mid' : '');
    o.innerHTML = `<div class="sheet gutter" role="dialog" aria-modal="true">${inner}</div>`;
    o.addEventListener('click', e => { if (e.target === o) closeSheet(); });
    document.body.appendChild(o);
    return o;
  }
  function closeSheet() { document.querySelectorAll('.overlay').forEach(o => o.remove()); }

  function skillSheet(id) {
    const p = P(), sk = PMLM.byId[id], gs = gradeState(p, sk.grade), ss = skillState(gs, id);
    const hist = ss.hist.slice(-10), firsts = hist.filter(Boolean).length, days = ss.days.length;
    openSheet(`<div class="stack">
      <div class="row between"><span style="font-size:3rem;line-height:1">${h(sk.icon)}</span><button class="iconbtn x" data-act="close" aria-label="Close">✕</button></div>
      <div><h2>${h(sk.title)}</h2><p class="muted">${h(sk.blurb)}</p></div>
      <div class="row"><span class="chip">${'⭐'.repeat(ss.mastered ? 3 : ss.stars) || '☆'} ${ss.mastered ? 'Mastered' : ss.stars ? ss.stars + ' star' + (ss.stars > 1 ? 's' : '') : 'New'}</span><span class="chip">Level ${ss.level}</span>${ss.lesson ? '<span class="chip">📖 Lesson done</span>' : ''}${ss.extra ? `<span class="chip">⚡ Best ${fmt(ss.extra)}</span>` : ''}</div>
      <div class="stack" style="gap:6px"><span class="eyebrow">Mastery</span>
        <div class="pdots">${Array.from({ length: 10 }, (_, i) => `<i class="${hist[i] === 1 ? 'ok' : hist[i] === 0 ? 'bad' : ''}"></i>`).join('')}</div>
        <span class="muted" style="font-size:.9rem">${ss.mastered ? 'You mastered this! Keep it fresh with a quick round now and then.' : `Get 8 of your last 10 right first time, on 2 different days. Now: ${firsts}/10 · day ${Math.min(days, 2)} of 2.`}</span></div>
      <div class="grid2"><button class="btn ${ss.lesson ? '' : 'primary'}" data-act="learn" data-id="${id}">📖 Learn</button>
      <button class="btn ${ss.lesson ? 'primary' : ''}" data-act="practise" data-id="${id}">▶ Practise</button></div>
      ${ss.stars >= 2 ? `<button class="btn go block" data-act="extra" data-id="${id}">⚡ Extra challenge (60 seconds)</button>` : ''}
    </div>`);
  }

  // ----- Lesson -----
  function renderLesson() {
    chrome(false);
    const sk = PMLM.byId[S.skill], cards = sk.lesson, i = S.card, c = cards[i];
    view.innerHTML = `<div class="stack" style="padding-block:12px">
      <div class="row between"><button class="iconbtn" data-act="home" aria-label="Close lesson">✕</button><b class="num" style="font-size:1.1rem">${h(sk.icon)} ${h(sk.title)}</b><span class="chip">${i + 1}/${cards.length}</span></div>
      <div class="ldots">${cards.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="card lcard"><div class="row between" style="flex-wrap:nowrap;align-items:flex-start">${c.title ? `<h3>${rt(c.title)}</h3>` : '<span></span>'}${speakBtn('sayl')}</div>${Viz.render(c.visual, ctx())}<div class="ltext">${rt(c.text)}</div></div>
      <div class="mascot"><div class="face" style="font-size:2.2rem">${theme().mascot}</div><div class="bubble">${i === cards.length - 1 ? 'Now you try two easy ones. Hints are free!' : pickOne(['Take your time.', 'Read it twice if you like.', 'Look at the picture.', 'You can go back any time.'])}</div></div>
      <div class="grid2"><button class="btn ghost" data-act="lprev" ${i ? '' : 'disabled'}>◀ Back</button>
      ${i < cards.length - 1 ? '<button class="btn primary" data-act="lnext">Next ▶</button>' : '<button class="btn go" data-act="tryit">Try it! ✏️</button>'}</div>
    </div>`;
    view.scrollTop = 0;
  }

  function renderTryDone() {
    chrome(false);
    const sk = PMLM.byId[S.skill];
    view.innerHTML = `<div class="stack center" style="padding-block:40px;align-items:center">
      <div style="font-size:4rem">${theme().mascot}</div><h2>Lesson complete!</h2>
      <p class="muted">You learned <b>${h(sk.title)}</b>. Now practise to earn stars.</p>
      <button class="btn primary block pulse" data-act="practise" data-id="${sk.id}">▶ Start practice</button>
      <button class="btn ghost block" data-act="home">Back to the map</button></div>`;
  }

  // ----- Rounds -----
  function startRound(mode, opts = {}) {
    const p = P(), g = opts.grade || p.grade, gs = gradeState(p, g);
    let items = [];
    if (mode === 'practice' || mode === 'extra' || mode === 'try') {
      const sk = PMLM.byId[opts.skill];
      if (mode === 'practice') {
        const mine = gs.review.filter(r => r.skill === sk.id).slice(0, 1), other = gs.review.filter(r => r.skill !== sk.id && PMLM.byId[r.skill]).slice(0, 1);
        const older = skillsOf(g).filter(s => s.id !== sk.id && skillState(gs, s.id).stars >= 1);
        const n = 10 - mine.length - other.length - (older.length ? 1 : 0);
        for (let i = 0; i < n; i++) items.push({ skill: sk.id });
        mine.concat(other).forEach((r, i) => items.splice(3 + i * 3, 0, { skill: r.skill, review: r }));
        if (older.length) items.splice(7, 0, { skill: U.pick(older).id, spaced: true });
      } else if (mode === 'try') items = [{ skill: sk.id, level: 1 }, { skill: sk.id, level: 1 }];
      else items = Array.from({ length: 60 }, () => ({ skill: sk.id }));
    } else if (mode === 'boss') {
      const list = PMLM.skillsInUnit(opts.unit);
      items = Array.from({ length: 12 }, (_, i) => ({ skill: list[i % list.length].id }));
      items = U.shuffle(items);
    } else if (mode === 'fix') {
      items = gs.review.filter(r => PMLM.byId[r.skill]).slice(0, 10).map(r => ({ skill: r.skill, review: r }));
    } else if (mode === 'place') {
      items = skillsOf(g).map(s => ({ skill: s.id, level: 2 }));
    }
    if (!items.length) return;
    R = {
      mode, grade: g, skill: opts.skill, unit: opts.unit, items, i: -1, results: [], combo: 0, bestCombo: 0, brain: 0, coins: 0,
      start: Date.now(), hp: 8, hpMax: 8, placed: [], ended: false, deadline: mode === 'extra' ? Date.now() + 60000 : 0, extraN: 0,
    };
    S.screen = 'round';
    Sfx.unlock(); Sfx.setTier(0); World.setEnergy(0);
    if (mode !== 'try' && mode !== 'place') Sfx.startMusic();
    nextQuestion();
  }

  function nextQuestion() {
    clearTimeout(R.autoNext);
    if (CAN_SPEAK) speechSynthesis.cancel();
    R.i++;
    if (R.mode === 'extra' && Date.now() >= R.deadline) return endRound();
    if (R.i >= R.items.length || (R.mode === 'boss' && R.hp <= 0)) return endRound();
    const it = R.items[R.i], sk = PMLM.byId[it.skill], gs = gradeState(P(), R.grade), ss = skillState(gs, sk.id);
    let q;
    if (it.review) q = it.review.q;
    else {
      const lvl = it.level || (R.mode === 'extra' ? Math.max(2, ss.level) : R.mode === 'boss' ? Math.min(3, ss.level + 1) : ss.level);
      for (let k = 0; k < 5; k++) { try { q = sk.gen(lvl, ctx()); } catch (e) { q = null; } if (q && !PMLM_VALIDATE.question(q).length) break; }
    }
    if (!q) { R.items.splice(R.i, 1); R.i--; return nextQuestion(); }
    R.q = q; R.sk = sk; R.item = it; R.tries = 0; R.hinted = 0; R.done = false; R.qStart = Date.now();
    R.inp = { a: '', w: '', n: '', d: '', x: '', y: '', choice: null, focus: q.kind === 'fraction' ? (q.mixed ? 'w' : 'n') : q.kind === 'coord' ? 'x' : 'a' };
    R.choices = q.kind === 'choice' ? U.shuffle(q.choices) : null;
    R.wrongChoices = [];
    R.say = R.i === 0 ? pickOne(['You can do it!', "Let's go!", 'Brain on!', 'Here we go!']) : R.say;
    renderQuestion();
  }

  function renderQuestion() {
    chrome(false);
    const q = R.q, t = theme(), total = R.mode === 'extra' ? 0 : R.items.length;
    const dots = total ? `<div class="pdots">${R.items.map((_, k) => `<i class="${R.results[k] || ''} ${k === R.i ? 'cur' : ''}"></i>`).join('')}</div>` : `<div class="bar gold"><i id="xbar" style="width:${Math.max(0, (R.deadline - Date.now()) / 600)}%"></i></div>`;
    const modeLabel = { practice: R.item.review ? '🔧 Fix-it question' : R.item.spaced ? '🔁 Quick review' : '', boss: '⚔️ Boss battle', fix: '🔧 Fix-it', extra: '⚡ Extra challenge', try: '✏️ Try it', place: '🧭 Find my level' }[R.mode];
    const bossIdx = R.unit ? unitsOf(R.grade).findIndex(u => u.id === R.unit) : 0;
    view.innerHTML = `<div class="stack" style="padding-block:10px;gap:12px">
      <div class="playtop"><button class="iconbtn" data-act="quit" aria-label="Leave round">✕</button>${dots}<span class="combo ${R.combo >= 3 ? 'hot' : ''}" id="combo">🔥 ×${R.combo}</span></div>
      ${R.mode === 'boss' ? `<div class="bossbar"><span class="bf" id="bossface">${t.bosses[bossIdx % t.bosses.length]}</span><div class="stack" style="gap:6px"><b class="num">${BOSS_NAMES[bossIdx % BOSS_NAMES.length]} the Boss</b><div class="hp"><i id="hp" style="width:${Math.max(0, R.hp / R.hpMax * 100)}%"></i></div></div></div>`
        : `<div class="brainline"><span class="muted" style="font-weight:700">${modeLabel || '🧠 Brain power'}</span><span class="bp" id="bp">${fmt(R.brain)}</span></div>`}
      <div class="mascot"><div class="face" id="mface" style="font-size:2.4rem">${t.mascot}</div><div class="bubble" id="say">${h(R.say)}</div></div>
      <div class="qcard" id="qcard">
        <div class="qmeta" style="align-items:center"><span>${h(R.sk.icon)} ${h(R.sk.title)}${R.item.review ? ' · second chance' : ''}</span>${speakBtn('sayq')}</div>
        ${Viz.render(q.visual, ctx())}
        <div class="qtext">${rt(q.q)}</div>
        ${q.kind === 'choice' ? '' : '<div class="answer" id="ans"></div>'}
        ${state.settings.timer && R.mode === 'practice' ? '<div class="bar"><i id="tbar" style="width:100%;transition:width .25s linear"></i></div>' : ''}
      </div>
      <div id="help" class="stack" style="gap:8px"></div>
      <div class="feedback" id="fb" aria-live="polite"></div>
      <div id="pad"></div>
      <div class="row between" id="tools">${R.mode === 'place' || R.mode === 'extra' ? '<span></span>' : '<button class="btn small ghost" data-act="hint">💡 Hint</button>'}<span class="muted" style="font-size:.85rem">${R.mode === 'extra' ? `<b class="num" id="xn">${R.extraN}</b> right` : `Question ${R.i + 1} of ${R.items.length}`}</span></div>
    </div>`;
    drawAnswer(); drawPad();
    if (R.mode === 'extra') R.timerId = setInterval(() => {
      const left = R.deadline - Date.now(), bar = $('#xbar');
      if (bar) bar.style.width = Math.max(0, left / 600) + '%';
      if (left <= 0) { clearInterval(R.timerId); R.timerId = 0; endRound(); }
    }, 200);
    else if (state.settings.timer && R.mode === 'practice') R.timerId = setInterval(() => {
      const bar = $('#tbar'); if (bar) bar.style.width = Math.max(0, 100 - (Date.now() - R.qStart) / 150) + '%';
    }, 250);
    view.scrollTop = 0;
  }

  function box(f, sm) {
    const v = R.inp[f], on = R.inp.focus === f && !R.done;
    return `<button class="ansbox ${sm ? 'sm' : ''} ${on ? 'focus' : ''}" data-act="focus" data-f="${f}" aria-label="Answer box">${v ? h(v.replace('-', '−')) : on ? '' : '<span class="ph">?</span>'}${on ? '<span class="caret"></span>' : ''}</button>`;
  }
  function drawAnswer() {
    const el = $('#ans'); if (!el) return;
    const q = R.q;
    let html = q.prefix ? `<span>${rt(q.prefix)}</span>` : '';
    if (q.kind === 'number') html += box('a');
    else if (q.kind === 'coord') html += `<span>(</span>${box('x', 1)}<span>,</span>${box('y', 1)}<span>)</span>`;
    else html += (q.mixed ? box('w', 1) : '') + `<span class="fracin">${box('n', 1)}<hr>${box('d', 1)}</span>`;
    if (q.unit) html += `<span>${rt(q.unit)}</span>`;
    el.innerHTML = html;
  }
  function drawPad() {
    const pad = $('#pad'), q = R.q;
    if (q.kind === 'choice') {
      const long = R.choices.some(c => Rich.plain(c).length > 16);
      pad.innerHTML = `<div class="choices ${long ? 'one' : ''}">${R.choices.map((c, i) => {
        const cls = R.done && c === q.answer ? 'right' : R.wrongChoices.includes(c) ? 'wrong' : '';
        return `<button class="choice ${cls}" data-act="choose" data-i="${i}" ${R.done || R.wrongChoices.includes(c) ? 'disabled' : ''}>${rt(c)}</button>`;
      }).join('')}</div>`;
      return;
    }
    const multi = q.kind !== 'number';
    const k = (v, lbl, cls = '') => `<button class="k ${cls}" data-act="key" data-k="${v}" ${R.done ? 'disabled' : ''}>${lbl}</button>`;
    pad.innerHTML = `<div class="keypad">${k(7, 7)}${k(8, 8)}${k(9, 9)}${k('back', '⌫', 'fn')}${k(4, 4)}${k(5, 5)}${k(6, 6)}${k('ok', 'Check ✓', 'ok')}${k(1, 1)}${k(2, 2)}${k(3, 3)}${k('neg', '−', 'fn')}${k(0, 0)}${k('.', '.', 'fn')}${multi ? k('next', q.kind === 'coord' ? 'x↔y' : '⇅', 'fn') : `<span></span>`}</div>`;
  }
  const fields = () => (R.q.kind === 'fraction' ? (R.q.mixed ? ['w', 'n', 'd'] : ['n', 'd']) : R.q.kind === 'coord' ? ['x', 'y'] : ['a']);

  function press(k) {
    if (!R || R.done) return;
    const f = R.inp.focus, list = fields();
    Sfx.click();
    if (k === 'ok') return submit();
    if (k === 'next') { R.inp.focus = list[(list.indexOf(f) + 1) % list.length]; return drawAnswer(); }
    let v = R.inp[f];
    if (k === 'back') v = v.slice(0, -1);
    else if (k === 'neg') v = v.startsWith('-') ? v.slice(1) : '-' + v;
    else if (k === '.') { if (!v.includes('.')) v = (v === '' || v === '-' ? v + '0' : v) + '.'; }
    else if (v.replace(/[-.]/g, '').length < 9) v = (v === '0' ? '' : v === '-0' ? '-' : v) + k;
    R.inp[f] = v;
    drawAnswer();
  }

  function submit() {
    const q = R.q;
    const verdict = judge(q, R.inp);
    if (verdict === 'empty') {
      const empty = fields().find(f => R.inp[f] === '' && !(f === 'w'));
      if (empty) { R.inp.focus = empty; drawAnswer(); }
      return;
    }
    if (verdict === 'simplify') {
      $('#fb').className = 'feedback'; $('#fb').textContent = 'Right value! Now write it in its simplest form.';
      return;
    }
    verdict === 'right' ? onRight() : onWrong();
  }

  function choose(i) {
    if (!R || R.done) return;
    const c = R.choices[i];
    R.inp.choice = c;
    if (judge(R.q, R.inp) === 'right') onRight();
    else { R.wrongChoices.push(c); onWrong(); }
  }

  function record(firstTry) {
    if (R.mode === 'try' || R.mode === 'extra') return;
    const p = P(), gs = gradeState(p, R.grade), ss = skillState(gs, R.sk.id);
    ss.tries++; if (firstTry) ss.right++;
    ss.last = Date.now();
    if (R.mode === 'place') return;
    ss.hist.push(firstTry ? 1 : 0); if (ss.hist.length > 10) ss.hist.shift();
    const d = today(); if (!ss.days.includes(d)) { ss.days.push(d); if (ss.days.length > 5) ss.days.shift(); }
    // adapt difficulty
    if (firstTry) { ss.run++; ss.miss = 0; if (ss.run >= 3 && ss.level < 3) { ss.level++; ss.run = 0; R.levelUp = R.sk.title; } }
    else { ss.miss++; ss.run = 0; if (ss.miss >= 2 && ss.level > 1) { ss.level--; ss.miss = 0; } }
    if (!ss.mastered && ss.hist.length >= 8 && ss.hist.slice(-10).filter(Boolean).length >= 8 && ss.days.length >= 2) {
      ss.mastered = Date.now(); ss.stars = 3;
      (R.newMastered = R.newMastered || []).push(R.sk);
    }
  }

  function onRight() {
    const p = P(), q = R.q, firstTry = R.tries === 0 && !R.hinted, clean = R.tries === 0;
    R.done = true;
    const res = firstTry ? 'ok' : 'help';
    if (R.mode !== 'place' && R.mode !== 'try') { p.stats.answered++; p.stats.correct++; if (firstTry) p.stats.first++; }
    if (clean) R.combo++; else R.combo = 0;
    R.bestCombo = Math.max(R.bestCombo, R.combo);
    if (R.mode !== 'try') p.stats.bestCombo = Math.max(p.stats.bestCombo, R.combo);
    const lvl = (skillState(gradeState(p, R.grade), R.sk.id).level) || 1;
    const fast = state.settings.timer && R.mode === 'practice' && Date.now() - R.qStart < 15000 && firstTry;
    let gain = firstTry ? 100 * lvl * (1 + 0.2 * R.combo) : 40 * lvl;
    if (fast) gain *= 1.5;
    if (R.mode === 'extra') { R.extraN++; gain = 100 + 10 * R.extraN + 5 * R.extraN * (R.extraN - 1) / 2; }
    R.brain += gain;
    if (clean && R.mode !== 'try' && R.mode !== 'place') { R.coins += 1; }
    record(firstTry);
    if (R.item.review && firstTry) {
      const gs = gradeState(p, R.grade); gs.review = gs.review.filter(r => r !== R.item.review);
      p.stats.fixed++; R.coins += 3; quest('fix');
    }
    if (R.mode === 'place' && firstTry) {
      const ss = skillState(gradeState(p, R.grade), R.sk.id);
      ss.stars = Math.max(ss.stars, 1); ss.level = Math.max(ss.level, 2); R.placed.push(R.sk);
    }
    if (R.mode === 'boss') {
      R.hp -= firstTry ? 1 : 0.5;
      const bf = $('#bossface'); if (bf) { bf.classList.remove('hit'); void bf.offsetWidth; bf.classList.add('hit'); }
      const hp = $('#hp'); if (hp) hp.style.width = Math.max(0, R.hp / R.hpMax * 100) + '%';
      Sfx.hit();
    }
    if (R.mode !== 'try' && R.mode !== 'place') { quest('answer'); if (firstTry) quest('first'); quest('combo', R.combo); }
    R.results[R.i] = res;
    // feedback
    const tier = comboTier(R.combo);
    Sfx.setTier(tier); World.setEnergy(tier); Sfx.correct(R.combo);
    const card = $('#qcard'), rect = card.getBoundingClientRect();
    card.classList.add('right');
    FX.correct(R.combo, rect.left + rect.width / 2, rect.top + rect.height / 2);
    const face = $('#mface'); face.classList.remove('sad'); face.classList.add('jump');
    R.say = R.combo >= 5 ? pickOne(HOT) : pickOne(CHEERS);
    $('#say').textContent = R.say;
    const combo = $('#combo'); combo.textContent = `🔥 ×${R.combo}`; combo.classList.toggle('hot', R.combo >= 3);
    const bp = $('#bp'); if (bp) bp.textContent = fmt(R.brain);
    if (R.mode === 'extra') { const xn = $('#xn'); if (xn) xn.textContent = R.extraN; }
    $('#fb').className = 'feedback good';
    $('#fb').innerHTML = `${fast ? '⚡ Fast! ' : ''}Correct! +${fmt(gain)} 🧠 ${firstTry && R.mode !== 'extra' ? '<button class="link" data-act="why">Why?</button>' : ''}`;
    if (R.q.kind !== 'choice') { R.inp.focus = null; drawAnswer(); }
    drawPad();
    if (firstTry || R.mode === 'extra') R.autoNext = setTimeout(nextQuestion, R.mode === 'extra' ? 500 : 1300);
    else showExplain(true);
  }

  function onWrong() {
    const q = R.q, p = P();
    R.tries++; R.combo = 0;
    Sfx.wrong(); Sfx.setTier(0); World.setEnergy(0);
    const card = $('#qcard'); card.classList.remove('wrong'); void card.offsetWidth; card.classList.add('wrong');
    const face = $('#mface'); face.classList.remove('jump'); void face.offsetWidth; face.classList.add('sad');
    const combo = $('#combo'); combo.textContent = '🔥 ×0'; combo.classList.remove('hot');
    $('#fb').className = 'feedback bad';
    if (R.mode === 'extra' || R.mode === 'place') {
      R.done = true; R.results[R.i] = 'bad';
      if (R.mode === 'place') record(false);
      $('#fb').innerHTML = `The answer is ${rt(answerText(q))}`;
      if (q.kind !== 'choice') { R.inp.focus = null; drawAnswer(); }
      drawPad();
      R.autoNext = setTimeout(nextQuestion, R.mode === 'extra' ? 1200 : 1800);
      return;
    }
    if (R.tries < 3) {
      $('#fb').textContent = R.tries === 1 ? 'Not quite. Try again!' : 'Nearly there. One more go!';
      R.say = pickOne(R.tries === 1 ? OOPS1 : OOPS2); $('#say').textContent = R.say;
      showHint(R.tries - 1);
      if (q.kind !== 'choice') { R.inp[R.inp.focus || fields()[0]] = ''; if (q.kind !== 'number') fields().forEach(f => { R.inp[f] = ''; }); R.inp.focus = fields()[0]; drawAnswer(); }
      drawPad();
      return;
    }
    // third miss: show the answer and keep the question for later
    R.done = true; R.results[R.i] = 'bad';
    if (R.mode !== 'try') { p.stats.answered++; }
    record(false);
    if (R.mode !== 'try' && R.mode !== 'place') {
      const gs = gradeState(p, R.grade);
      if (!R.item.review) { gs.review.push({ skill: R.sk.id, q: R.q, at: Date.now() }); if (gs.review.length > 30) gs.review.shift(); }
      quest('answer');
    }
    R.say = pickOne(OOPS3); $('#say').textContent = R.say;
    $('#fb').innerHTML = `The answer is ${rt(answerText(q))}`;
    if (q.kind !== 'choice') {
      const a = q.answer;
      if (q.kind === 'number') R.inp.a = U.fmt(a).replace(/,/g, '').replace('−', '-');
      else if (q.kind === 'coord') { R.inp.x = String(a[0]); R.inp.y = String(a[1]); }
      else { const [n, d] = a; if (q.mixed && Math.abs(n) > d) { R.inp.w = String(Math.trunc(n / d)); R.inp.n = String(Math.abs(n) % d); } else { R.inp.w = ''; R.inp.n = String(n); } R.inp.d = String(d); }
      R.inp.focus = null; drawAnswer();
    }
    drawPad();
    showExplain(true);
  }

  function showHint(idx) {
    const q = R.q, help = $('#help');
    idx = Math.min(idx, 1);
    if (R.hinted > idx && help.children.length) return;
    R.hinted = Math.max(R.hinted, idx + 1);
    help.innerHTML = q.hints.slice(0, idx + 1).map((t, k) => `<div class="hintbox"><span class="hi">${k ? '👣' : '💡'}</span><span>${rt(t)}</span></div>`).join('');
  }
  function showExplain(withNext) {
    const help = $('#help');
    help.innerHTML = `<div class="hintbox explain"><span class="hi">🧩</span><span>${rt(R.q.explain)}</span></div>`;
    if (!withNext) return;
    const pad = $('#pad'), btn = '<button class="btn go block" data-act="next" style="margin-top:12px">Next ▶</button>';
    if (R.q.kind === 'choice') pad.insertAdjacentHTML('beforeend', btn); else pad.innerHTML = btn;
    $('#tools').innerHTML = '';
    pad.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function endRound() {
    if (R.ended) return;
    R.ended = true;
    clearTimeout(R.autoNext); if (R.timerId) clearInterval(R.timerId);
    Sfx.stopMusic(); Sfx.setTier(0); World.setEnergy(0);
    const p = P(), gs = gradeState(p, R.grade);
    const answered = R.results.filter(Boolean).length, ok = R.results.filter(r => r === 'ok').length;
    const pct = answered ? Math.round(ok / answered * 100) : 0;
    R.summary = { answered, ok, pct, stars: 0, newStars: false, bossWon: false, wishes: [], trophies: [] };
    if (R.mode === 'try') {
      skillState(gs, R.skill).lesson = true; quest('lesson');
      S.screen = 'trydone'; save(); checkTrophies(p); return render();
    }
    p.stats.ms += Date.now() - R.start;
    if (R.mode === 'practice') {
      const ss = skillState(gs, R.skill), before = ss.stars;
      ss.best = Math.max(ss.best, pct);
      ss.stars = ss.mastered ? 3 : Math.max(ss.stars, pct >= 80 ? 2 : pct >= 60 ? 1 : 0);
      R.summary.stars = ss.stars; R.summary.newStars = ss.stars > before;
      if (ok === answered && answered >= 8) { p.stats.perfect++; R.coins += 5; quest('perfect'); }
    }
    if (R.mode === 'extra') { const ss = skillState(gs, R.skill); ss.extra = Math.max(ss.extra, Math.round(R.brain)); R.coins += Math.floor(R.extraN / 2); }
    if (R.mode === 'boss') {
      quest('boss');
      if (R.hp <= 0) { R.summary.bossWon = true; if (!gs.bosses[R.unit]) R.coins += 25; gs.bosses[R.unit] = true; }
    }
    if (R.mode === 'place') { gs.placed = true; }
    if (R.mode !== 'place') { p.stats.rounds++; quest('round'); }
    p.coins += R.coins; p.brain += Math.round(R.brain);
    touchStreak(p);
    R.summary.wishes = checkWishes(p, R.grade);
    R.summary.trophies = checkTrophies(p);
    save();
    S.screen = 'results';
    render();
    setTimeout(() => celebrateQueue(R.summary), 900);
  }

  function celebrateQueue(sum) {
    const p = P(), prog = gradeProgress(p, R.grade), items = [];
    if (sum.bossWon) items.push({ e: theme().bosses[0], title: 'Boss beaten!', text: `+25 🪙 for defeating the boss` });
    (R.newMastered || []).forEach(sk => items.push({ e: '🧠', title: 'Skill mastered!', text: `${sk.icon} ${sk.title}` }));
    sum.wishes.forEach(w => items.push({ e: w.emoji || '🎁', title: w.at === 100 ? 'BIG WISH UNLOCKED!' : 'Wish unlocked!', text: w.text, wish: true }));
    if (prog.pct >= 100 && sum.wishes.some(w => w.at === 100)) items.push({ e: '🎓', title: `Grade ${R.grade} complete!`, text: 'You mastered every skill. Amazing work!' });
    const showNext = () => {
      const it = items.shift(); if (!it) return;
      Sfx.fanfare(); FX.party(); if (it.wish) setTimeout(() => Sfx.cheer(), 400);
      const o = document.createElement('div');
      o.className = 'celebrate';
      o.innerHTML = `<div class="cbox"><div class="cemoji">${h(it.e)}</div><h2>${h(it.title)}</h2><div class="ctext">${h(it.text)}</div>${it.wish ? '<p style="color:#fff;font-weight:700">Show a grown-up! 🎉</p>' : ''}<button class="btn primary">Yay!</button></div>`;
      o.querySelector('button').addEventListener('click', () => { o.remove(); showNext(); });
      document.body.appendChild(o);
    };
    showNext();
  }

  function renderResults() {
    chrome(false);
    const s = R.summary, t = theme(), sk = R.skill ? PMLM.byId[R.skill] : null;
    const title = { practice: 'Round complete!', boss: s.bossWon ? 'Boss beaten!' : 'The boss escaped!', fix: 'Fix-it done!', extra: 'Time up!', place: 'Level found!' }[R.mode];
    let body = '';
    if (R.mode === 'practice') body += `<div class="bigstars">${[1, 2, 3].map(k => `<span class="${s.stars >= k ? '' : 'off'}" style="animation-delay:${k * 0.25}s">⭐</span>`).join('')}</div>`;
    if (R.mode === 'boss') body += `<div class="center" style="font-size:4rem">${s.bossWon ? '🏆' : t.bosses[0]}</div><p class="center muted">${s.bossWon ? 'You knocked it out!' : 'So close! Its health bar is low. Try again!'}</p>`;
    if (R.mode === 'place') body += `<p class="center">You already know <b>${R.placed.length}</b> of ${R.items.length} skills. They now have a star, so you can jump ahead!</p>`;
    body += `<div class="brainbig"><span class="eyebrow">Brain power</span><b id="bcount">0</b></div>
      <div class="stats">
        <div class="stat"><b>${s.ok}/${s.answered}</b><small>right first time</small></div>
        <div class="stat"><b>×${R.bestCombo}</b><small>best combo</small></div>
        <div class="stat"><b>+${R.coins}</b><small>coins 🪙</small></div>
        ${R.mode === 'extra' ? `<div class="stat"><b>${R.extraN}</b><small>answers</small></div>` : ''}
      </div>`;
    if (R.levelUp) body += `<div class="hintbox"><span class="hi">📈</span><span>Level up! Questions in <b>${h(R.levelUp)}</b> get a bit harder now.</span></div>`;
    if (R.mode === 'practice' && sk) {
      const ss = skillState(gradeState(P(), R.grade), sk.id), firsts = ss.hist.slice(-10).filter(Boolean).length;
      body += `<div class="card stack" style="gap:6px"><span class="eyebrow">${h(sk.icon)} ${h(sk.title)} · mastery</span><div class="pdots">${Array.from({ length: 10 }, (_, i) => `<i class="${ss.hist.slice(-10)[i] === 1 ? 'ok' : ss.hist.slice(-10)[i] === 0 ? 'bad' : ''}"></i>`).join('')}</div>
        <span class="muted" style="font-size:.9rem">${ss.mastered ? 'Mastered! 🧠' : `${firsts}/10 right first time · day ${Math.min(ss.days.length, 2)} of 2`}</span>
        ${!ss.mastered && ss.stars === 2 ? `<span style="font-size:.9rem">The 3rd star means mastered. ${ss.days.length < 2 && firsts >= 8 ? 'Play this skill again on another day to get it!' : 'Keep getting answers right first time to earn it.'}</span>` : ''}</div>`;
    }
    const prog = gradeProgress(P(), R.grade);
    body += `<div class="stack" style="gap:6px"><span class="eyebrow">Grade ${R.grade} progress · ${prog.pct}%</span><span class="bar gold"><i style="width:${prog.pct}%"></i></span></div>`;
    const again = R.mode === 'practice' ? `<button class="btn" data-act="practise" data-id="${R.skill}">↻ Again</button>` : R.mode === 'boss' && !s.bossWon ? `<button class="btn" data-act="boss" data-id="${R.unit}">↻ Fight again</button>` : R.mode === 'extra' ? `<button class="btn" data-act="extra" data-id="${R.skill}">↻ Again</button>` : '';
    const extra = R.mode === 'practice' && s.pct >= 80 ? `<button class="btn go block" data-act="extra" data-id="${R.skill}">⚡ Extra challenge unlocked!</button>` : '';
    view.innerHTML = `<div class="stack" style="padding-block:20px">
      <h2 class="center" style="font-size:2rem">${title}</h2>${body}${extra}
      <div class="grid2">${again}<button class="btn primary ${again ? '' : 'block'}" data-act="home" style="${again ? '' : 'grid-column:1/-1'}">Back to the map</button></div></div>`;
    view.scrollTop = 0;
    const el = $('#bcount'), target = Math.round(R.brain), t0 = performance.now();
    const tick = now => { const k = Math.min(1, (now - t0) / 1400); el.textContent = '+' + fmt(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    if (s.pct === 100 && s.answered >= 8) setTimeout(() => FX.party(), 300);
  }

  // ----- Wishes tab -----
  function renderWishes() {
    const p = P(), g = p.grade, gs = gradeState(p, g), prog = gradeProgress(p, g);
    view.innerHTML = `<div class="stack">
      ${gradePick(g)}
      <div><h2>My wishes</h2><p class="muted">Master skills to fill the bar. Every wish unlocks at its own point.</p></div>
      <div class="stack" style="gap:6px"><div class="row between"><span class="eyebrow">Grade ${g} progress</span><b class="num">${prog.pct}%</b></div><span class="bar gold"><i style="width:${prog.pct}%"></i></span></div>
      <div class="wishes">${[gs.wishes[3], ...gs.wishes.slice(0, 3)].map(w => {
        const empty = !w.text.trim(), cls = w.at === 100 ? 'big' : '';
        const status = w.status === 'granted' ? '✅ Granted' : w.status === 'unlocked' ? '🎉 Unlocked! Show a grown-up' : empty ? 'No wish yet. Ask a grown-up to add one.' : `${Math.max(0, w.at - prog.pct)}% to go`;
        return `<div class="wish ${cls} ${w.status}">${w.status === 'locked' ? '<span class="lock">🔒</span>' : ''}<span class="we">${h(w.emoji || '🎁')}</span>
          <span class="wat">${w.at === 100 ? 'BIG WISH · finish the grade' : `Small wish · ${w.at}%`}</span><span class="wt">${empty ? '…' : h(w.text)}</span>
          ${w.status === 'locked' ? `<span class="bar ${w.at === 100 ? 'gold' : ''}"><i style="width:${Math.min(100, prog.pct / w.at * 100)}%"></i></span>` : ''}<span class="wat">${status}</span></div>`;
      }).join('')}</div>
      <button class="btn ghost block" data-act="tab" data-id="parent">🔒 Grown-ups: set wishes</button>
    </div>`;
  }

  // ----- Me tab -----
  function renderMe() {
    const p = P(), rank = RANKS.filter(r => p.brain >= r[0]).pop(), nextRank = RANKS.find(r => p.brain < r[0]);
    const acc = p.stats.answered ? Math.round(p.stats.first / p.stats.answered * 100) : 0;
    view.innerHTML = `<div class="stack">
      <div class="card hero"><div style="position:relative;font-size:4.2rem;line-height:1;width:96px;text-align:center">${p.hat ? `<span style="position:absolute;top:-26px;left:0;right:0;font-size:2rem">${h(p.hat)}</span>` : ''}${h(p.avatar)}</div>
        <div class="stack" style="gap:4px;min-width:0"><h2>${h(p.name)}</h2><span class="chip" style="align-self:flex-start">🧠 ${rank[1]}</span>
        <span class="muted" style="font-size:.9rem">${fmt(p.brain)} brain power${nextRank ? ` · ${fmt(nextRank[0] - p.brain)} to ${nextRank[1]}` : ''}</span></div></div>
      <div class="stats">
        <div class="stat"><b>${fmt(p.stats.answered)}</b><small>questions</small></div>
        <div class="stat"><b>${acc}%</b><small>first-try</small></div>
        <div class="stat"><b>×${p.stats.bestCombo}</b><small>best combo</small></div>
        <div class="stat"><b>${p.streak.days}</b><small>day streak</small></div>
      </div>
      <div class="stack" style="gap:8px"><h3>World</h3><div class="themes">${Object.entries(THEMES).map(([id, t]) => `<button class="themecard t-${id} ${p.theme === id ? 'on' : ''}" data-act="theme" data-id="${id}"><span class="te">${t.emoji}</span>${t.name}<small>${t.blurb}</small></button>`).join('')}</div></div>
      <div class="stack" style="gap:8px"><div class="row between"><h3>Avatar</h3><span class="chip">🪙 ${fmt(p.coins)}</span></div>
        <div class="avatars">${AVATARS.map(a => `<button class="avbtn ${p.avatar === a ? 'on' : ''}" data-act="avatar" data-v="${a}">${a}</button>`).join('')}
        ${SHOP_AVATARS.map(([a, c]) => { const own = p.owned.includes(a); return `<button class="avbtn ${p.avatar === a ? 'on' : ''} ${own ? '' : 'lockd'}" data-act="buy" data-v="${a}" data-c="${c}">${a}${own ? '' : `<span class="price">${c}🪙</span>`}</button>`; }).join('')}</div></div>
      <div class="stack" style="gap:8px"><h3>Hats</h3><div class="avatars"><button class="avbtn ${!p.hat ? 'on' : ''}" data-act="hat" data-v="">🚫</button>
        ${HATS.map(([a, c]) => { const own = p.owned.includes(a); return `<button class="avbtn ${p.hat === a ? 'on' : ''} ${own ? '' : 'lockd'}" data-act="buy" data-v="${a}" data-c="${c}" data-hat="1">${a}${own ? '' : `<span class="price">${c}🪙</span>`}</button>`; }).join('')}</div></div>
      <div class="stack" style="gap:8px"><h3>Trophies · ${Object.keys(p.trophies).length}/${TROPHIES.length}</h3><div class="trophies">${TROPHIES.map(t => `<div class="trophy ${p.trophies[t.id] ? 'got' : ''}"><span class="tt">${t.icon}</span>${h(t.name)}</div>`).join('')}</div></div>
    </div>`;
  }

  // ----- Parent area -----
  function renderParent() {
    // The PIN guards the Parents tab on children's devices; a logged-in parent's device skips it
    if (!S.parentOk && !Sync.isParent) return renderPin();
    Sync.warm();
    const p = P(), sel = S.pSel || (S.pSel = { player: p.id, grade: p.grade });
    const who = state.profiles.find(x => x.id === sel.player) || p, gs = gradeState(who, sel.grade);
    const prog = gradeProgress(who, sel.grade);
    const rows = skillsOf(sel.grade).map(s => { const ss = skillState(gs, s.id); return { s, ss, acc: ss.tries ? Math.round(ss.right / ss.tries * 100) : null }; });
    const weak = rows.filter(r => r.ss.tries >= 5).sort((a, b) => a.acc - b.acc).slice(0, 3);
    const mins = Math.round(who.stats.ms / 60000);
    const sOpt = (v, cur, lbl) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${h(lbl)}</option>`;
    const family = state.profiles.map(x => {
      const pr = gradeProgress(x, x.grade), xgs = gradeState(x, x.grade), last = lastActivity(x);
      const hard = skillsOf(x.grade).map(s => ({ s, ss: skillState(xgs, s.id) }))
        .filter(r => r.ss.tries >= 5).sort((a, b) => a.ss.right / a.ss.tries - b.ss.right / b.ss.tries)[0];
      return `<button class="famcard ${x.id === sel.player ? 'on' : ''}" data-act="famsel" data-id="${x.id}">
        <span class="fav">${h(x.avatar)}</span>
        <span class="stack" style="gap:4px;min-width:0"><b>${h(x.name)}</b>
          <span class="muted">Grade ${x.grade} · ${pr.pct}% mastered (${pr.mastered}/${pr.total})</span>
          <span class="bar gold"><i style="width:${pr.pct}%"></i></span>
          <span class="muted">${last ? 'Last played ' + new Date(last).toLocaleDateString() : 'Not played yet'}${hard ? ` · needs help: ${h(hard.s.title)}` : ''}</span></span></button>`;
    }).join('');
    // Pre-select a likely duplicate (same name), keeping the one that has played most recently
    const label = x => { const t = lastActivity(x); return `${x.avatar} ${x.name} · Grade ${x.grade} · ${t ? 'played ' + new Date(t).toLocaleDateString() : 'not played yet'}`; };
    const byName = {}; state.profiles.forEach(x => (byName[x.name.trim().toLowerCase()] = byName[x.name.trim().toLowerCase()] || []).push(x));
    const pair = Object.values(byName).find(l => l.length > 1);
    const ranked = pair ? pair.slice().sort((a, b) => lastActivity(b) - lastActivity(a)) : state.profiles;
    const cbKeep = ranked[0], cbFrom = ranked[1];
    view.innerHTML = `<div class="stack">
      <div class="row between"><h2>Grown-ups</h2>${Sync.isParent ? '' : '<button class="btn small ghost" data-act="lock">🔒 Lock</button>'}</div>

      <div class="card stack"><h3>👨‍👩‍👧 Family</h3>
        <div class="famgrid">${family}</div>
        <p class="muted" style="font-size:.88rem">Tap a child to see their wishes and full report below. ${Sync.isParent
          ? 'Children\'s devices linked to your family update here by themselves. To add one, use <b>Link a child\'s device</b> below.'
          : `A child who plays on another device: on that device open <b>Parents → Backup → Copy backup code</b>, send it to yourself, paste it under <b>Backup</b> here and choose <b>Add these players</b>. Do it again any time to refresh their progress.${Sync.enabled ? ' Or use a <b>Family account</b> (below) to keep everyone in sync by itself.' : ''}`}</p></div>

      ${Sync.isParent ? Sync.devicesCard() : ''}

      <div class="grid2"><div class="field"><label for="ps-player">Player</label><select id="ps-player" data-change="psel">${state.profiles.map(x => sOpt(x.id, sel.player, x.name)).join('')}</select></div>
        <div class="field"><label for="ps-grade">Grade</label><select id="ps-grade" data-change="psel">${GRADES.map(g => sOpt(g, sel.grade, 'Grade ' + g)).join('')}</select></div></div>

      <div class="card stack"><h3>🎁 Wishes for ${h(who.name)} · Grade ${sel.grade}</h3>
        <p class="muted" style="font-size:.9rem">Small wishes unlock at 25%, 50% and 75% of the grade's skills mastered. The big wish unlocks at 100%. A skill counts as mastered after 8 of the last 10 answers are right first time, on 2 different days.</p>
        ${gs.wishes.map((w, i) => `<div class="stack" style="gap:6px">
          <div class="wishedit"><div class="field"><label for="we-${i}">${w.at === 100 ? 'Big' : w.at + '%'}</label><input id="we-${i}" maxlength="4" value="${h(w.emoji)}" style="text-align:center;font-size:1.4rem"></div>
          <div class="field"><label for="wt-${i}">${w.at === 100 ? 'Big wish (finish the grade)' : `Small wish at ${w.at}%`}</label><input id="wt-${i}" maxlength="60" value="${h(w.text)}" placeholder="${['Ice cream trip', 'Movie night', 'New book', 'A new bike'][i]}"></div></div>
          <div class="row" style="font-size:.9rem"><span class="muted">${w.status === 'granted' ? '✅ Granted' : w.status === 'unlocked' ? '🎉 Unlocked, ready to give!' : prog.pct >= w.at ? 'Reached. Unlocks when you save a wish here.' : `Locked · ${prog.pct}% of ${w.at}%`}</span>
          ${w.status === 'unlocked' ? `<button class="btn small go" data-act="grant" data-i="${i}">Mark as granted</button>` : ''}${w.status === 'granted' ? `<button class="link" data-act="ungrant" data-i="${i}">Undo</button>` : ''}</div></div>`).join('')}
        <button class="btn primary" data-act="savewishes">Save wishes</button></div>

      <div class="card stack"><h3>📊 Progress · ${prog.pct}% mastered</h3>
        <div class="stats"><div class="stat"><b>${prog.mastered}/${prog.total}</b><small>skills mastered</small></div><div class="stat"><b>${mins}</b><small>minutes played</small></div><div class="stat"><b>${fmt(who.stats.answered)}</b><small>questions</small></div><div class="stat"><b>${gs.review.length}</b><small>mistakes to fix</small></div></div>
        ${weak.length ? `<div class="hintbox"><span class="hi">🎯</span><span>Needs most help: ${weak.map(r => `<b>${h(r.s.title)}</b> (${r.acc}%)`).join(', ')}</span></div>` : ''}
        <div class="tablewrap"><table class="report"><thead><tr><th>Skill</th><th>Stars</th><th>First-try</th><th>Level</th><th>Last played</th></tr></thead><tbody>
          ${rows.map(({ s, ss, acc }) => `<tr><td>${h(s.icon)} ${h(s.title)}</td><td>${ss.mastered ? '🧠' : '⭐'.repeat(ss.stars) || '–'}</td><td class="n">${acc == null ? '–' : acc + '% (' + ss.tries + ')'}</td><td class="n">${ss.level}</td><td>${ss.last ? new Date(ss.last).toLocaleDateString() : '–'}</td></tr>`).join('')}
        </tbody></table></div>
        ${gs.review.length ? `<details><summary style="cursor:pointer;font-weight:700">Recent mistakes (${gs.review.length})</summary><div class="stack" style="gap:8px;margin-top:8px">${gs.review.slice(-8).reverse().map(r => `<div style="font-size:.95rem">${rt(r.q.q)} <span class="muted">→ ${rt(answerText(r.q))}</span></div>`).join('')}</div></details>` : ''}
      </div>

      <div class="card stack"><h3>👧 Players</h3>
        ${state.profiles.map(x => `<div class="row between"><span style="font-weight:700">${h(x.avatar)} ${h(x.name)} · Grade ${x.grade}</span>
          <span class="row" style="gap:6px"><select aria-label="Grade for ${h(x.name)}" data-change="pgrade" data-id="${x.id}" style="min-height:40px;border-radius:12px;border:0;background:var(--panel2);padding:0 8px">${GRADES.map(g => sOpt(g, x.grade, 'Grade ' + g)).join('')}</select>
          <button class="btn small ghost" data-act="delplayer" data-id="${x.id}">Delete</button></span></div>`).join('')}
        <button class="btn small" data-act="newplayer">+ Add a player</button>
        ${cbFrom ? `<div class="stack" style="gap:6px;margin-top:8px"><span class="eyebrow">Same child twice?</span>
          <div class="grid2"><div class="field"><label for="cb-keep">Keep</label><select id="cb-keep">${state.profiles.map(x => sOpt(x.id, cbKeep.id, label(x))).join('')}</select></div>
          <div class="field"><label for="cb-from">Add progress from</label><select id="cb-from">${state.profiles.map(x => sOpt(x.id, cbFrom.id, label(x))).join('')}</select></div></div>
          <button class="btn small ghost" data-act="combine">Combine players</button></div>` : ''}</div>

      <div class="card stack" style="gap:4px"><h3>⚙️ Settings</h3>
        <label class="toggle">Sound effects <input type="checkbox" data-change="set" data-k="sfx" ${state.settings.sfx ? 'checked' : ''}></label>
        <label class="toggle">Music during rounds <input type="checkbox" data-change="set" data-k="music" ${state.settings.music ? 'checked' : ''}></label>
        <label class="toggle"><span>Speed bonus <span class="muted" style="font-weight:400">(a timer bar; fast answers earn extra brain power, nothing is lost)</span></span><input type="checkbox" data-change="set" data-k="timer" ${state.settings.timer ? 'checked' : ''}></label>        <div class="field" style="margin-top:8px"><label for="cur">Money symbol</label><select id="cur" data-change="currency">${['₼', '$', '£', '€', '₽', '₺', '₹'].map(c => sOpt(c, state.settings.currency, c.trim())).join('')}</select></div></div>

      ${Sync.isParent ? '' : Sync.card()}

      <div class="card stack"><h3>💾 Backup</h3>
        <p class="muted" style="font-size:.9rem">Progress is saved on this device${IN_ARTIFACT ? ' and in your claude.ai account' : ''}. Copy the backup code to keep a copy, or paste a code from another device to add its players here.</p>
        <div class="row"><button class="btn small" data-act="export">Copy backup code</button><button class="btn small ghost" data-act="download">Save backup file</button><label class="btn small ghost" for="importfile">Load file</label><input type="file" id="importfile" accept=".json,application/json,text/plain" hidden data-change="importfile"></div>
        <div class="field"><label for="backup">Backup code</label><textarea id="backup" placeholder="Paste a backup code from another device here"></textarea></div>
        <button class="btn small" data-act="import">Use the code above</button></div>

      <div class="card stack"><h3>🔑 PIN</h3><button class="btn small ghost" data-act="changepin">Change PIN</button>
        <button class="btn small ghost" data-act="resetplayer">Reset ${h(who.name)}'s Grade ${sel.grade} progress</button></div>
      ${DEBUG ? `<div class="card stack"><h3>🛠 Debug</h3><div class="row">${[25, 50, 75, 100].map(v => `<button class="btn small" data-act="dbg" data-v="${v}">Set ${v}%</button>`).join('')}<button class="btn small" data-act="dbgcoins">+500 coins</button></div></div>` : ''}
    </div>`;
  }

  function renderPin() {
    const setting = !state.pin || S.pinStage === 'new' || S.pinStage === 'confirm';
    const stage = !state.pin && !S.pinStage ? 'new' : S.pinStage || 'enter';
    S.pinStage = stage;
    const msg = { new: 'Create a 4-digit parent PIN', confirm: 'Type the same PIN again', enter: 'Enter the parent PIN', forgot: '' }[stage];
    const entry = S.pinEntry || '';
    if (stage === 'forgot') {
      const f = S.forgot || (S.forgot = { a: U.rint(24, 79), b: U.rint(13, 49) });
      view.innerHTML = `<div class="stack" style="max-width:420px;margin:0 auto;padding-block:20px"><h2>Reset the PIN</h2><p class="muted">Grown-up check: what is ${f.a} × ${f.b}?</p>
        <div class="field"><label for="forgotans">Answer</label><input id="forgotans" inputmode="numeric" autocomplete="off"></div>
        <button class="btn primary" data-act="forgotok">Reset PIN</button><button class="btn ghost" data-act="pinback">Back</button></div>`;
      return;
    }
    view.innerHTML = `<div class="stack center" style="max-width:420px;margin:0 auto;padding-block:20px;align-items:stretch">
      <div style="font-size:3rem">🔒</div><h2>${msg}</h2><p class="muted">${setting ? 'The PIN keeps wishes and settings for grown-ups only.' : 'Wishes, reports and settings are behind this PIN.'}</p>
      <div class="pin">${[0, 1, 2, 3].map(i => `<i class="${i < entry.length ? 'on' : ''}"></i>`).join('')}</div>
      <div class="feedback bad" id="pinmsg">${S.pinErr || ''}</div>
      <div class="keypad" style="grid-template-columns:repeat(3,minmax(0,1fr))">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button class="k" data-act="pin" data-k="${d}">${d}</button>`).join('')}<button class="k fn" data-act="pin" data-k="back">⌫</button><button class="k" data-act="pin" data-k="0">0</button><span></span></div>
      ${stage === 'enter' ? '<button class="link" data-act="forgot">Forgot the PIN?</button>' : ''}</div>`;
  }

  function pinKey(k) {
    let e = S.pinEntry || '';
    S.pinErr = '';
    if (k === 'back') e = e.slice(0, -1); else if (e.length < 4) e += k;
    S.pinEntry = e;
    if (e.length === 4) {
      if (S.pinStage === 'new') { S.newPin = e; S.pinStage = 'confirm'; S.pinEntry = ''; }
      else if (S.pinStage === 'confirm') {
        if (e === S.newPin) { state.pin = btoa('pm' + e); S.parentOk = true; S.pinStage = null; save(); toast('PIN saved'); }
        else { S.pinStage = 'new'; S.pinErr = "Those didn't match. Start again."; }
        S.pinEntry = '';
      } else {
        if (btoa('pm' + e) === state.pin) { S.parentOk = true; S.pinStage = null; }
        else S.pinErr = 'Wrong PIN. Try again.';
        S.pinEntry = '';
      }
    }
    render();
  }

  // ---------- Actions ----------
  const ACT = {
    tab: d => { S.tab = d.id; S.screen = 'home'; closeSheet(); render(); },
    home: () => { closeSheet(); S.screen = 'home'; S.tab = 'play'; R = null; Sfx.stopMusic(); World.setEnergy(0); Sync.settle(); render(); },
    close: () => closeSheet(),
    mute: () => { const on = !(state.settings.sfx || state.settings.music); state.settings.sfx = on; state.settings.music = on; save(); render(); },
    players: () => openSheet(`<div class="stack"><div class="row between"><h2>Switch player</h2><button class="iconbtn" data-act="close" aria-label="Close">✕</button></div>
      ${state.profiles.map(x => `<button class="btn block ${x.id === state.current ? 'primary' : ''}" data-act="pick" data-id="${x.id}">${h(x.avatar)} ${h(x.name)} · Grade ${x.grade}</button>`).join('')}
      <button class="btn ghost block" data-act="newplayer">+ Add a player</button></div>`),
    pick: d => { state.current = d.id; S = { screen: 'home', tab: 'play' }; closeSheet(); save(); render(); },
    newplayer: () => { closeSheet(); S.np = null; S.screen = 'new'; chrome(false); renderNewPlayer(); },
    cancelnew: () => { S.screen = 'home'; render(); },
    np: d => { S.np.name = ($('#np-name') || {}).value || S.np.name; S.np[d.k] = d.k === 'grade' ? +d.v : d.v; renderNewPlayer(); },
    createplayer: () => {
      const name = ($('#np-name').value || '').trim();
      if (!name) { $('#np-name').focus(); toast('Type a name first'); return; }
      const np = S.np, p = newProfile(name.slice(0, 16), np.avatar, np.grade, np.theme);
      state.profiles.push(p); state.current = p.id; S = { screen: 'home', tab: 'play' };
      save(); Sfx.unlock(); render();
      setTimeout(() => { FX.burst(innerWidth / 2, innerHeight / 3, 20); Sfx.fanfare(); }, 200);
    },
    grade: d => { P().grade = +d.id; save(); render(); },
    skill: d => skillSheet(d.id),
    learn: d => { closeSheet(); S.screen = 'lesson'; S.skill = d.id; S.card = 0; render(); },
    lnext: () => { S.card++; Sfx.click(); render(); },
    lprev: () => { S.card = Math.max(0, S.card - 1); render(); },
    tryit: () => startRound('try', { skill: S.skill }),
    practise: d => { closeSheet(); startRound('practice', { skill: d.id }); },
    extra: d => { closeSheet(); startRound('extra', { skill: d.id }); },
    boss: d => {
      const p = P();
      if (!bossUnlocked(p, d.id)) { toast('Earn a star on every skill in this unit to unlock the boss!'); return; }
      const t = theme(), ui = unitsOf(p.grade).findIndex(u => u.id === d.id);
      openSheet(`<div class="stack center" style="align-items:center"><div style="font-size:5rem;line-height:1">${t.bosses[ui % t.bosses.length]}</div>
        <h2>${BOSS_NAMES[ui % BOSS_NAMES.length]} the Boss</h2><p class="muted">Mixed questions from the whole unit. Each right answer knocks off health. Knock it out in 12 questions!</p>
        <button class="btn primary block" data-act="bossgo" data-id="${d.id}">⚔️ Fight!</button><button class="btn ghost block" data-act="close">Not yet</button></div>`, true);
    },
    bossgo: d => { closeSheet(); startRound('boss', { unit: d.id }); },
    fixit: () => startRound('fix'),
    place: () => openSheet(`<div class="stack"><h2>🧭 Find my level</h2><p>One question from every skill in Grade ${P().grade}. No hints this time. Skills you get right earn a star, so you can skip ahead.</p>
      <button class="btn primary block" data-act="placego">Start</button><button class="btn ghost block" data-act="close">Not now</button></div>`, true),
    placego: () => { closeSheet(); startRound('place'); },
    sayq: () => { if (!R) return; const q = R.q; speak(q.q + (q.kind === 'choice' ? '. Is it: ' + R.choices.join(', or ') + '?' : '')); },
    sayl: () => { const c = PMLM.byId[S.skill].lesson[S.card]; speak((c.title ? c.title + '. ' : '') + c.text); },
    key: d => press(d.k),
    focus: d => { if (R && !R.done) { R.inp.focus = d.f; drawAnswer(); } },
    choose: d => choose(+d.i),
    hint: () => { if (!R || R.done) return; showHint(R.hinted); R.say = 'Hints are free. Use them!'; $('#say').textContent = R.say; },
    why: () => { clearTimeout(R.autoNext); showExplain(true); },
    next: () => nextQuestion(),
    quit: () => openSheet(`<div class="stack center"><h2>Leave this round?</h2><p class="muted">Your answers so far still count towards mastery.</p>
      <button class="btn primary block" data-act="close">Keep playing</button><button class="btn ghost block" data-act="leave">Leave</button></div>`, true),
    leave: () => { if (R) { clearTimeout(R.autoNext); if (R.timerId) clearInterval(R.timerId); } save(); ACT.home(); },
    theme: d => { P().theme = d.id; save(); render(); FX.burst(innerWidth / 2, innerHeight / 3, 16); Sfx.coin(); },
    avatar: d => { P().avatar = d.v; save(); render(); },
    hat: d => { P().hat = d.v || null; save(); render(); },
    buy: d => {
      const p = P(), cost = +d.c;
      if (p.owned.includes(d.v)) { d.hat ? (p.hat = d.v) : (p.avatar = d.v); save(); return render(); }
      if (p.coins < cost) { toast(`You need ${cost - p.coins} more 🪙. Answer questions to earn coins!`); return; }
      openSheet(`<div class="stack center" style="align-items:center"><div style="font-size:4rem">${d.v}</div><h2>Buy for ${cost} 🪙?</h2><p class="muted">You have ${fmt(p.coins)} 🪙.</p>
        <button class="btn primary block" data-act="buyok" data-v="${d.v}" data-c="${cost}" data-hat="${d.hat || ''}">Buy it</button><button class="btn ghost block" data-act="close">Not now</button></div>`, true);
    },
    buyok: d => {
      const p = P(), cost = +d.c;
      if (p.coins < cost) return closeSheet();
      p.coins -= cost; p.owned.push(d.v); d.hat ? (p.hat = d.v) : (p.avatar = d.v);
      checkTrophies(p); save(); closeSheet(); render(); Sfx.coin(); FX.burst(innerWidth / 2, innerHeight / 3, 14, [d.v]);
    },
    pin: d => pinKey(d.k),
    forgot: () => { S.pinStage = 'forgot'; S.forgot = null; render(); },
    pinback: () => { S.pinStage = 'enter'; render(); },
    forgotok: () => { const f = S.forgot; if (+$('#forgotans').value === f.a * f.b) { state.pin = null; S.pinStage = 'new'; S.pinEntry = ''; save(); render(); } else toast('Not quite. Try again.'); },
    lock: () => { S.parentOk = false; S.pinStage = null; render(); },
    changepin: () => { S.parentOk = false; S.pinStage = 'new'; S.pinEntry = ''; render(); },
    savewishes: () => {
      const who = state.profiles.find(x => x.id === S.pSel.player), gs = gradeState(who, S.pSel.grade);
      gs.wishes.forEach((w, i) => { w.emoji = ($('#we-' + i).value || '🎁').trim() || '🎁'; w.text = ($('#wt-' + i).value || '').trim(); });
      const fresh = checkWishes(who, S.pSel.grade);
      save(); S.keepScroll = true; render(); S.keepScroll = false;
      toast(fresh.length ? `Saved. ${fresh.length} wish${fresh.length > 1 ? 'es' : ''} already unlocked!` : 'Wishes saved');
    },
    grant: d => { const gs = gradeState(state.profiles.find(x => x.id === S.pSel.player), S.pSel.grade); gs.wishes[+d.i].status = 'granted'; gs.wishes[+d.i].grantedAt = Date.now(); save(); S.keepScroll = true; render(); S.keepScroll = false; FX.party(); },
    ungrant: d => { const gs = gradeState(state.profiles.find(x => x.id === S.pSel.player), S.pSel.grade); gs.wishes[+d.i].status = 'unlocked'; save(); S.keepScroll = true; render(); S.keepScroll = false; },
    delplayer: d => {
      const x = state.profiles.find(q => q.id === d.id);
      openSheet(`<div class="stack center"><h2>Delete ${h(x.name)}?</h2><p class="muted">This removes the player and all their progress and wishes on this device.</p>
        <button class="btn block" style="background:var(--oops);color:#2a0006" data-act="delok" data-id="${d.id}">Delete</button><button class="btn ghost block" data-act="close">Cancel</button></div>`, true);
    },
    loginopen: () => {
      Sync.warm();
      openSheet(`<div class="stack"><div class="row between"><h2>Parent login</h2><button class="iconbtn" data-act="close" aria-label="Close">✕</button></div>
        <p class="muted">See and manage every child's progress, on any device.</p>
        <div class="field"><label for="pl-email">Email</label><input id="pl-email" type="email" autocomplete="username" inputmode="email"></div>
        <div class="field"><label for="pl-pass">Password</label><input id="pl-pass" type="password" autocomplete="current-password"></div>
        <div class="field"><label for="pl-invite">Invite code <span class="muted" style="font-weight:400">(only if another parent invited you)</span></label><input id="pl-invite" autocomplete="off" autocapitalize="characters" placeholder="ABCD-EFGH"></div>
        <div class="feedback bad" id="pl-msg" aria-live="polite"></div>
        <div class="grid2"><button class="btn primary" data-act="loginemail">Sign in</button><button class="btn" data-act="signupemail">Create account</button></div>
        <button class="link" data-act="resetpw">Forgot password?</button>
        <span class="eyebrow center">or</span>
        <button class="btn ghost block" data-act="logingoogle">Continue with Google</button></div>`, true);
    },
    linkopen: () => {
      Sync.warm();
      const guess = state.profiles.length ? `${state.profiles[0].name}'s device` : '';
      openSheet(`<div class="stack"><div class="row between"><h2>Link to my family</h2><button class="iconbtn" data-act="close" aria-label="Close">✕</button></div>
        <p class="muted">A parent opens <b>Parents → Devices and parents → Link a child's device</b> on their own login and reads you the code.</p>
        <div class="field"><label for="lk-code">Code</label><input id="lk-code" autocomplete="off" autocapitalize="characters" placeholder="ABCD-EFGH" maxlength="12" style="font-family:var(--font-display);font-size:1.6rem;text-align:center;letter-spacing:.12em"></div>
        <div class="field"><label for="lk-name">Whose device is this?</label><input id="lk-name" maxlength="30" value="${h(guess)}" placeholder="Ayan's tablet"></div>
        <div class="feedback bad" id="lk-msg" aria-live="polite"></div>
        <button class="btn primary block" data-act="linkgo">Link this device</button></div>`, true);
    },
    loginemail: () => authAction(() => Sync.loginEmail($('#pl-email').value, $('#pl-pass').value, $('#pl-invite').value), '#pl-msg'),
    signupemail: () => authAction(() => Sync.signupEmail($('#pl-email').value, $('#pl-pass').value, $('#pl-invite').value), '#pl-msg'),
    logingoogle: () => authAction(() => Sync.loginGoogle($('#pl-invite').value), '#pl-msg'),
    resetpw: () => authAction(async () => { await Sync.resetPassword($('#pl-email').value); return 'sent'; }, '#pl-msg'),
    linkgo: () => authAction(() => Sync.link($('#lk-code').value, $('#lk-name').value), '#lk-msg'),
    familyonly: () => { S.screen = 'familyonly'; render(); },
    mkcode: d => Sync.createCode(d.r).catch(e => toast(h(Sync.friendly(e)))),
    codedone: () => Sync.clearCode(),
    unlinkdev: d => openSheet(`<div class="stack center"><h2>Unlink ${h(Sync.deviceName(d.id))}?</h2><p class="muted">It stops saving to your family. Everything it has already saved stays in your family.</p>
      <button class="btn primary block" data-act="unlinkdevok" data-id="${h(d.id)}">Unlink</button><button class="btn ghost block" data-act="close">Cancel</button></div>`, true),
    unlinkdevok: d => { closeSheet(); Sync.unlinkDevice(d.id).then(() => toast('Device unlinked'), e => toast(h(Sync.friendly(e)))); },
    rmparent: d => openSheet(`<div class="stack center"><h2>Remove this parent?</h2><p class="muted">They will no longer see or change your family's progress.</p>
      <button class="btn primary block" data-act="rmparentok" data-id="${h(d.id)}">Remove</button><button class="btn ghost block" data-act="close">Cancel</button></div>`, true),
    rmparentok: d => { closeSheet(); Sync.removeParent(d.id).then(() => toast('Parent removed'), e => toast(h(Sync.friendly(e)))); },
    signout: () => { Sync.signOut().then(() => { S.parentOk = false; toast('Signed out on this device'); render(); }); },
    unlinkself: () => openSheet(`<div class="stack center"><h2>Unlink this device?</h2><p class="muted">Progress stops saving online. The players stay on this device, and everything already saved stays in your family.</p>
      <button class="btn primary block" data-act="unlinkselfok">Unlink</button><button class="btn ghost block" data-act="close">Cancel</button></div>`, true),
    unlinkselfok: () => { closeSheet(); Sync.unlinkSelf().then(() => { toast('This device is no longer linked'); render(); }, e => toast(h(Sync.friendly(e)))); },
    dupyes: () => Sync.resolveDupe(true),
    dupno: () => Sync.resolveDupe(false),
    delok: d => {
      state.deleted = Object.assign({}, state.deleted, { [d.id]: Date.now() });
      state.profiles = state.profiles.filter(q => q.id !== d.id);
      if (state.current === d.id) state.current = state.profiles[0] ? state.profiles[0].id : null;
      S.pSel = null; closeSheet(); save(); render();
    },
    resetplayer: () => openSheet(`<div class="stack center"><h2>Reset progress?</h2><p class="muted">Stars, mastery and mistakes for this grade go back to zero. Wishes stay.</p>
      <button class="btn block" style="background:var(--oops);color:#2a0006" data-act="resetok">Reset</button><button class="btn ghost block" data-act="close">Cancel</button></div>`, true),
    resetok: () => { const who = state.profiles.find(x => x.id === S.pSel.player), gs = gradeState(who, S.pSel.grade); gs.skills = {}; gs.review = []; gs.bosses = {}; gs.wishes.forEach(w => { w.status = 'locked'; }); closeSheet(); save(); render(); toast('Progress reset'); },
    export: () => {
      const code = JSON.stringify(state), ta = $('#backup');
      ta.value = code;
      const done = () => toast('Backup code copied');
      try { navigator.clipboard.writeText(code).then(done, () => { ta.select(); toast('Select the code and copy it'); }); } catch (e) { ta.select(); }
    },
    download: async () => {
      const filename = `play-more-learn-more-backup-${today()}.json`, data = JSON.stringify(state);
      if (IN_ARTIFACT) {
        const dl = await window.claude.use('downloads').catch(() => null);
        if (!dl) { toast('Saving files is not available here. Use "Copy backup code" instead.'); return; }
        try { await dl.save({ filename, data }); toast('Backup saved'); }
        catch (e) { if (!e || e.code !== 'declined') toast('Could not save the file. Use "Copy backup code" instead.'); }
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
    },
    import: () => importCode($('#backup').value),
    famsel: d => { const x = state.profiles.find(q => q.id === d.id); S.pSel = { player: x.id, grade: x.grade }; S.keepScroll = true; render(); S.keepScroll = false; },
    combine: () => {
      const keep = state.profiles.find(x => x.id === $('#cb-keep').value), from = state.profiles.find(x => x.id === $('#cb-from').value);
      if (!keep || !from || keep === from) { toast('Pick two different players to combine.'); return; }
      const when = x => { const t = lastActivity(x); return t ? 'last played ' + new Date(t).toLocaleDateString() : 'not played yet'; };
      openSheet(`<div class="stack center"><h2>Combine the two players?</h2>
        <p><b>Keep:</b> ${h(keep.avatar)} ${h(keep.name)}, Grade ${keep.grade}, ${when(keep)}<br><b>Remove:</b> ${h(from.avatar)} ${h(from.name)}, Grade ${from.grade}, ${when(from)}</p>
        <p class="muted">The kept player gets the best result for every skill from both, plus their coins, trophies and mistakes to fix. Backup codes from the removed player's device will update the kept player from now on.</p>
        <button class="btn primary block" data-act="combineok" data-keep="${keep.id}" data-from="${from.id}">Combine</button><button class="btn ghost block" data-act="close">Cancel</button></div>`, true);
    },
    combineok: d => {
      const keep = state.profiles.find(x => x.id === d.keep), from = state.profiles.find(x => x.id === d.from);
      if (!keep || !from) return closeSheet();
      combineProfiles(keep, from);
      // Remember the removed id so later backup codes from that device update the kept player
      state.aliases = state.aliases || {};
      for (const [k, v] of Object.entries(state.aliases)) if (v === from.id) state.aliases[k] = keep.id;
      state.aliases[from.id] = keep.id;
      state.deleted = Object.assign({}, state.deleted, { [from.id]: Date.now() });
      state.profiles = state.profiles.filter(x => x.id !== from.id);
      if (state.current === from.id) state.current = keep.id;
      S.pSel = { player: keep.id, grade: keep.grade };
      closeSheet(); checkTrophies(keep); save(); render();
      toast(`Combined into ${h(keep.name)}`);
    },
    importadd: () => {
      const s = S.pendingImport; if (!s) return;
      let added = 0, updated = 0;
      const alias = state.aliases || {};
      for (const ip of s.profiles) {
        const target = state.profiles.find(p => p.id === ip.id || p.id === alias[ip.id]);
        if (target) { combineProfiles(target, ip, false); updated++; continue; }
        if (state.deleted) delete state.deleted[ip.id];
        state.profiles.push(ip); added++;
      }
      if (!state.pin && s.pin) state.pin = s.pin;
      if (!state.current && state.profiles[0]) state.current = state.profiles[0].id;
      S.pendingImport = null; closeSheet(); save(); S.keepScroll = true; render(); S.keepScroll = false;
      const names = state.profiles.map(p => p.name.trim().toLowerCase()), twice = state.profiles.find((p, i) => names.indexOf(names[i]) !== i);
      toast(`${added} player(s) added${updated ? `, ${updated} updated` : ''}.` + (twice ? ` There are now two players called ${h(twice.name)}: use "Same child twice?" under Players to combine them.` : ''));
    },
    importok: () => { const s = S.pendingImport; if (!s) return; state = Object.assign(DEFAULT(), s); S = { screen: 'home', tab: 'play' }; closeSheet(); save(); render(); toast('Backup loaded'); },
    dbg: d => {
      const who = state.profiles.find(x => x.id === S.pSel.player), g = S.pSel.grade, gs = gradeState(who, g), list = skillsOf(g), k = Math.ceil(list.length * +d.v / 100);
      list.forEach((s, i) => { const ss = skillState(gs, s.id); if (i < k) { ss.mastered = Date.now(); ss.stars = 3; ss.lesson = true; ss.last = Date.now(); } });
      const fresh = checkWishes(who, g); save(); render();
      R = { grade: g, summary: { wishes: fresh }, newMastered: [] }; celebrateQueue(R.summary);
    },
    dbgcoins: () => { P().coins += 500; save(); render(); },
  };

  // Runs a sign-in or link action from a sheet, showing progress and any error inside the sheet
  async function authAction(fn, msgSel) {
    const msg = $(msgSel);
    document.querySelectorAll('.sheet .btn').forEach(b => { b.disabled = true; });
    if (msg) { msg.className = 'feedback'; msg.textContent = 'Working…'; }
    try {
      const result = await fn();
      if (result === 'sent') { msg.className = 'feedback good'; msg.textContent = 'Check your email for a link to choose a new password.'; return; }
      closeSheet();
      if (Sync.isParent) { S.tab = 'parent'; S.screen = state.profiles.length ? 'home' : 'familyonly'; toast('Signed in as a parent'); }
      else if (Sync.isDevice) { S.screen = 'home'; S.tab = 'play'; toast('This device is now linked to your family'); }
      render();
    } catch (e) {
      if (msg) { msg.className = 'feedback bad'; msg.textContent = Sync.friendly(e); }
    } finally {
      document.querySelectorAll('.sheet .btn').forEach(b => { b.disabled = false; });
    }
  }

  function importCode(text) {
    try {
      const s = JSON.parse(text);
      if (!s || s.v !== 1 || !Array.isArray(s.profiles)) throw new Error('bad');
      S.pendingImport = s;
      openSheet(`<div class="stack center"><h2>Use this code?</h2><p class="muted">It has ${s.profiles.length} player(s): ${s.profiles.map(p => `${h(p.avatar)} ${h(p.name)} (Grade ${p.grade})`).join(', ')}.</p>
        <button class="btn primary block" data-act="importadd">Add these players</button>
        <p class="muted" style="font-size:.85rem">Players already here stay. If a child is already here, they get any progress from the code that they don't have yet.</p>
        <button class="btn ghost block" data-act="importok">Replace everything on this device</button><button class="btn ghost block" data-act="close">Cancel</button></div>`, true);
    } catch (e) { toast("That doesn't look like a backup code. Copy the whole code and try again."); }
  }

  const CHANGE = {
    psel: () => { S.pSel = { player: $('#ps-player').value, grade: +$('#ps-grade').value }; render(); },
    pgrade: (d, el) => { const x = state.profiles.find(q => q.id === d.id); x.grade = +el.value; save(); S.keepScroll = true; render(); S.keepScroll = false; },
    set: (d, el) => { state.settings[d.k] = el.checked; save(); applyTheme(); },
    currency: (d, el) => { state.settings.currency = el.value; save(); },
    importfile: (d, el) => { const f = el.files && el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => importCode(String(r.result)); r.readAsText(f); },
  };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const fn = ACT[b.dataset.act];
    if (fn) { e.preventDefault(); fn(b.dataset, b, e); }
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-change]');
    if (el && CHANGE[el.dataset.change]) CHANGE[el.dataset.change](el.dataset, el);
  });
  document.addEventListener('keydown', e => {
    if (S.screen !== 'round' || !R || document.querySelector('.overlay, .celebrate')) {
      if (S.tab === 'parent' && !S.parentOk && S.screen === 'home' && /^\d$/.test(e.key) && !(e.target.closest && e.target.closest('input,textarea,select'))) pinKey(e.key);
      return;
    }
    if (R.done) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if ($('[data-act="next"]')) nextQuestion(); else if (R.autoNext) { clearTimeout(R.autoNext); nextQuestion(); } } return; }
    if (R.q.kind === 'choice') { const i = +e.key - 1; if (i >= 0 && i < R.choices.length && !R.wrongChoices.includes(R.choices[i])) choose(i); return; }
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === '.' || e.key === ',') press(R.q.kind === 'coord' && e.key === ',' ? 'next' : '.');
    else if (e.key === '-') press('neg');
    else if (e.key === 'Backspace') { e.preventDefault(); press('back'); }
    else if (e.key === 'Enter') { e.preventDefault(); press('ok'); }
    else if (e.key === 'Tab' || e.key === '/' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') { if (R.q.kind !== 'number') { e.preventDefault(); press('next'); } }
  });
  document.addEventListener('pointerdown', () => Sfx.unlock(), { once: true });

  // ---------- Self-test (#selftest) ----------
  function selfTest() {
    chrome(false);
    const errors = [], RUNS = 200;
    let count = 0;
    for (const sk of PMLM.skills) {
      PMLM_VALIDATE.skill(sk).forEach(e => errors.push(`${sk.id}: ${e}`));
      sk.lesson.forEach((c, i) => { if (c.visual && !Viz.render(c.visual, ctx())) errors.push(`${sk.id}: lesson[${i}] visual failed to draw`); });
      const seen = new Set();
      for (const lvl of [1, 2, 3]) for (let i = 0; i < RUNS; i++) {
        let q;
        try { q = sk.gen(lvl, ctx()); } catch (e) { errors.push(`${sk.id} L${lvl}: threw ${e.message}`); break; }
        count++;
        PMLM_VALIDATE.question(q).forEach(e => { const m = `${sk.id} L${lvl}: ${e}`; if (!seen.has(m)) { seen.add(m); errors.push(m); } });
        if (q && q.visual && !Viz.render(q.visual, ctx())) { const m = `${sk.id} L${lvl}: visual ${q.visual.type} failed to draw`; if (!seen.has(m)) { seen.add(m); errors.push(m); } }
      }
    }
    window.__selftest = { skills: PMLM.skills.length, units: PMLM.units.length, questions: count, errors };
    view.innerHTML = `<div class="stack" style="padding-block:20px"><h2>Self-test</h2>
      <p>${PMLM.units.length} units, ${PMLM.skills.length} skills, ${fmt(count)} questions generated. ${errors.length ? `<b style="color:var(--oops)">${errors.length} problem(s)</b>` : '<b style="color:var(--go)">All clean ✓</b>'}</p>
      <div class="card" style="font-size:.85rem;white-space:pre-wrap;overflow-wrap:anywhere">${errors.map(h).join('\n') || 'No problems found.'}</div></div>`;
  }

  // ---------- Boot ----------
  World.init($('#world'));
  FX.init($('#fx'));
  if (SELFTEST) { selfTest(); return; }
  Sync.boot();
  render();
  Cloud.init(remote => {
    if (remote && remote.v === 1 && (remote.updatedAt || 0) > (state.updatedAt || 0)) {
      state = Object.assign(DEFAULT(), remote);
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
      if (S.screen !== 'round') render();
    } else if (state.profiles.length) Cloud.save(state);
  });
})();
