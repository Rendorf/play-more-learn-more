// Moving the game to its own address (PMLM_MOVE_TO, https://play.pmlm.uk/). The browser keeps saved progress per
// address, so a device that opens an old address (rendorf.github.io/play-more-learn-more, or pmlm.uk, which is now
// the landing page) carries its progress along in the new address's #move= fragment (never sent to any server),
// and the new address merges it in. An old address only moves a device after checking that the new one really
// serves the game (move.json, open to every address through _headers), so a child is never sent to a page that
// isn't ready.
const Move = (() => {
  const TO = typeof PMLM_MOVE_TO !== 'undefined' ? PMLM_MOVE_TO : '';
  const LIVE = typeof PMLM_ENV === 'undefined' || PMLM_ENV === 'live';
  const KEY = typeof PMLM_ENV !== 'undefined' && PMLM_ENV === 'preview' ? 'pmlm-preview.' : 'pmlm.';
  const HOST = TO ? new URL(TO).hostname : '';
  // Old addresses: the GitHub copy under its path, and pmlm.uk at any path. Never the new address itself.
  const FROM = [['rendorf.github.io', '/play-more-learn-more'], ['pmlm.uk', ''], ['www.pmlm.uk', '']];
  const fromOld = loc => FROM.some(([host, path]) => loc.hostname === host && (!path || loc.pathname === path || loc.pathname.indexOf(path + '/') === 0));
  const LOCAL_RE = /^(localhost|127\.0\.0\.1|\[::1\])$/;

  // ---------- Packing progress into the link ----------
  const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), c => c.charCodeAt(0));
  const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
  // 'z.' + gzip when the browser can (most since 2023), otherwise 'j.' + plain JSON
  async function encode(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream !== 'undefined') return 'z.' + b64u(await pipe(bytes, new CompressionStream('gzip')));
    return 'j.' + b64u(bytes);
  }
  async function decode(s) {
    const kind = s.slice(0, 2), bytes = unb64u(s.slice(2));
    const raw = kind === 'z.' ? await pipe(bytes, new DecompressionStream('gzip')) : bytes;
    return JSON.parse(new TextDecoder().decode(raw));
  }

  // Where this page should send the device, or null. loc: { hostname, pathname, search, hash }.
  // On a local test server, ?moveto=<url> plays the old address so the browser tests can try the whole move.
  function target(loc) {
    const params = new URLSearchParams(loc.search), hash = (loc.hash || '').replace('#', '');
    if (hash === 'selftest' || hash === 'debug' || /[?&]debug=1/.test(loc.search)) return null;
    if (LOCAL_RE.test(loc.hostname) && params.get('moveto')) return { url: params.get('moveto'), test: true };
    if (!LIVE || !TO || loc.hostname === HOST || !fromOld(loc)) return null;
    params.delete('moveto');
    params.delete('stay');
    const q = params.toString();
    return { url: TO + (q ? '?' + q : ''), test: false };
  }

  // Is the new address up and serving the game? (3 seconds at most)
  async function ready(t) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => ctl && ctl.abort(), 3000);
    try {
      const u = new URL('move.json', t.url).href;
      if (t.test) { await fetch(u, { mode: 'no-cors', cache: 'no-store', signal: ctl && ctl.signal }); return true; }
      const r = await fetch(u, { cache: 'no-store', signal: ctl && ctl.signal });
      const j = r.ok ? await r.json() : null;
      return !!(j && j.app === 'play-more-learn-more' && j.receives >= 1);
    } catch (e) { return false; } finally { clearTimeout(timer); }
  }

  // What a device takes along, read straight from storage (the game and the landing page share it), or null when
  // it has no players. Sign-ins stay behind: they belong to the old address, so linked devices link again.
  function payload(store) {
    const read = k => { try { return JSON.parse(store.getItem(KEY + k)); } catch (e) { return null; } };
    const state = read('v1');
    if (!state || state.v !== 1 || !Array.isArray(state.profiles) || !state.profiles.length) return null;
    let family = false;
    try { family = !!store.getItem(KEY + 'sync'); } catch (e) { /* storage blocked */ }
    const p = read('push');
    return { v: 1, state, family, push: p && p.on ? { hour: p.hour == null ? 17 : p.hour } : null };
  }

  return {
    TO, HOST, target, encode, decode, ready, payload,
    // Send this device to the new address with its progress (check ready() first). False if it stays here.
    async go(payload, t) {
      let code;
      try { code = await encode(payload); } catch (e) { return false; }
      location.replace(t.url.split('#')[0] + '#move=' + code);
      return true;
    },
    // On the new address: the progress that came in the link (and the link is cleaned up), or null
    async arrive() {
      const m = /^#move=([zj]\.[A-Za-z0-9_-]+)$/.exec(location.hash);
      if (!m) return null;
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* the fragment stays visible */ }
      try { return await decode(m[1]); } catch (e) { console.warn('Moved progress could not be read', e); return null; }
    },
  };
})();
