// The landing page at pmlm.uk (welcome.html). pmlm.uk used to serve the game itself, so before drawing anything the
// page decides what this device needs: a device that played here moves on to the game's own address with its progress
// (src/move.js), an iPhone/iPad Home Screen app gets its progress as a code (those apps keep their own storage), and
// everyone else just sees the page. The copy on pmlm.uk is never deleted, so it stays as a safety net.
const Landing = (() => {
  const KEY = typeof PMLM_ENV !== 'undefined' && PMLM_ENV === 'preview' ? 'pmlm-preview.' : 'pmlm.';
  const PLAY = typeof PMLM_MOVE_TO !== 'undefined' && PMLM_MOVE_TO ? PMLM_MOVE_TO : './';
  const OLD_HOSTS = ['pmlm.uk', 'www.pmlm.uk'];

  // What one device's saved progress looks like, so a move is only sent again when something changed since
  const keyOf = state => `${state.updatedAt || 0}:${state.profiles.length}`;
  const readMarker = store => { try { return JSON.parse(store.getItem(KEY + 'moved')); } catch (e) { return null; } };

  // What to do, from the address, the device's storage and whether this is an installed Home Screen app.
  // Returns { act, url?, payload?, t? } with act one of:
  //   show     just show the page
  //   forward  go to the game without progress (url)
  //   move     carry the progress to the game (payload, t), after checking the game's address is ready
  //   code     iPhone/iPad Home Screen app with progress: the copy-your-code steps (payload), once t answers
  //   oldicon  iPhone/iPad Home Screen app with nothing saved: show the page and say this icon is old
  function decide(loc, store, app) {
    const params = new URLSearchParams(loc.search), hash = loc.hash || '';
    const onOld = OLD_HOSTS.indexOf(loc.hostname) >= 0;
    // An old tab of the GitHub game already packed the progress for pmlm.uk: pass it on untouched
    if (/^#move=/.test(hash) && (onOld || params.get('moveto'))) return { act: 'forward', url: (params.get('moveto') || PLAY).split('?')[0].split('#')[0] + hash };
    // The owner's #debug / #selftest bookmarks keep opening the game
    if (onOld && (/^#(debug|selftest)$/.test(hash) || params.get('debug') === '1')) return { act: 'forward', url: PLAY + loc.search + hash };
    const t = Move.target(loc);
    if (!t) return { act: 'show' };
    const payload = Move.payload(store);
    if (app && app.ios) return payload ? { act: 'code', payload, t } : { act: 'oldicon' };
    if (!payload) return params.get('invite') ? { act: 'forward', url: t.url } : { act: 'show' };
    const m = readMarker(store);
    // Moved before and nothing changed since: a Home Screen app goes straight to the game, a browser shows the page
    if (m && m.key === keyOf(payload.state)) return app && app.standalone ? { act: 'forward', url: t.url } : { act: 'show' };
    return { act: 'move', payload, t };
  }

  // Reminders from this old address would come twice once they are turned on again in the game. Turning this
  // browser's subscription off is enough: the sender drops subscriptions that stop working.
  async function stopOldReminders(store) {
    try {
      const p = JSON.parse(store.getItem(KEY + 'push'));
      if (p && p.on) store.setItem(KEY + 'push', JSON.stringify(Object.assign(p, { on: false })));
      const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
      const sub = reg && (await reg.pushManager.getSubscription());
      if (sub) await sub.unsubscribe();
    } catch (e) { /* nothing to turn off */ }
  }

  async function move(d, store) {
    if (!(await Move.ready(d.t))) return false;
    if (d.payload.push) await stopOldReminders(store);
    try { store.setItem(KEY + 'moved', JSON.stringify({ key: keyOf(d.payload.state), t: Date.now() })); } catch (e) { /* storage blocked */ }
    return Move.go(d.payload, d.t);
  }

  return { PLAY, decide, move, keyOf };
})();
