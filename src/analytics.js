// Google Analytics (GA4) for the landing page (pmlm.uk) and the game (play.pmlm.uk), on those live addresses only.
// Nothing personal is sent: no names, no player or device ids, no typed text; only what happened (a screen, a round
// finished) and a few numbers (grade, questions, seconds). Advertising features are off. Until a grown-up allows
// analytics cookies (the landing page's banner, or Parents in the game) Google's Consent Mode keeps it cookieless.
// The choice is the cookie pmlm_analytics on .pmlm.uk, so the landing page and the game share it. Google's script
// loads with the first thing sent, never before. ?gatest=1 runs it on any address (tests block Google's script).
const Analytics = (() => {
  const ID = typeof PMLM_GA !== 'undefined' ? PMLM_GA : '';
  const COOKIE = 'pmlm_analytics';
  const LIVE = /(^|\.)pmlm\.uk$/;

  // Whether analytics runs here: an id, a live address (or ?gatest=1), and not the owner's #debug / #selftest
  // bookmarks or the claude.ai copy
  function allowed(loc, id, inArtifact) {
    if (!id || inArtifact) return false;
    const params = new URLSearchParams(loc.search || '');
    if (/^#(debug|selftest)$/.test(loc.hash || '') || params.get('debug') === '1') return false;
    return LIVE.test(loc.hostname) || params.get('gatest') === '1';
  }
  const cookieDomain = host => (LIVE.test(host) ? '.pmlm.uk' : '');
  // The saved choice in a document.cookie string: 'granted', 'denied' or null (not asked yet)
  function choiceIn(cookies) {
    const m = new RegExp('(?:^|;\\s*)' + COOKIE + '=(granted|denied)').exec(cookies || '');
    return m ? m[1] : null;
  }

  // The game's own stats events (engine.js stat()) as Analytics events. Only the fields listed here are sent, renamed
  // for the reports; ids (p, d), skill error text (msg) and campaign tags never are.
  const EVENTS = {
    open: ['game_open', { n: 'players' }],
    player: ['player_added', { g: 'grade' }],
    lesson: ['lesson_done', { g: 'grade', sk: 'skill' }],
    round: ['round_done', { g: 'grade', sk: 'skill', mode: 'mode', n: 'answered', ok: 'correct', secs: 'seconds', m: 'mastered' }],
    place: ['placement_done', { g: 'grade', n: 'answered', ok: 'correct', secs: 'seconds' }],
    wishset: ['wishes_set', { g: 'grade', n: 'wishes' }],
    wish: ['wish_unlocked', { g: 'grade', n: 'at' }],
    problem: ['question_failed', { g: 'grade', sk: 'skill', n: 'level' }],
    invite: ['invite', { mode: 'step' }],
  };
  function event(type, data) {
    const e = EVENTS[type];
    if (!e) return null;
    const out = {};
    for (const k of Object.keys(e[1])) {
      const v = (data || {})[k];
      if (typeof v === 'number' || (typeof v === 'string' && v && v.length <= 40)) out[e[1][k]] = v;
    }
    return { name: e[0], params: out };
  }

  // ---------- In the browser ----------
  let page = '', build = '', on = false, loaded = false;
  const IN_ARTIFACT = typeof window !== 'undefined' && !!(window.claude && typeof window.claude.use === 'function');
  const gtag = function () { window.dataLayer.push(arguments); };
  const choice = () => { try { return choiceIn(document.cookie); } catch (e) { return null; } };

  // page: 'landing' or 'game'. Nothing loads yet.
  function init(opts) {
    page = opts.page; build = opts.build || '';
    on = typeof window !== 'undefined' && allowed(location, ID, IN_ARTIFACT);
  }
  function load() {
    if (!on || loaded) return on;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', { analytics_storage: choice() === 'granted' ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('set', 'ads_data_redaction', true);
    gtag('js', new Date());
    // The game sends its own screen views; the landing page lets Google count the page itself
    gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false, send_page_view: page === 'landing', site_part: page, game_version: build });
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(s);
    return true;
  }

  return {
    allowed, cookieDomain, choiceIn, event, EVENTS, COOKIE, init,
    get on() { return on; },
    get choice() { return choice(); },
    // Load now (the landing page, which Google counts as a page view)
    start: () => load(),
    // A game stats event (see EVENTS); unknown types are dropped
    track(type, data) { const e = event(type, data); if (e && load()) gtag('event', e.name, e.params); },
    // Something on the landing page (play_click, section_view), with plain values only
    send(name, params) { if (load()) gtag('event', name, params || {}); },
    // A screen of the game as a page view (/screen/top, /screen/round, …), so the Pages report shows the game's screens
    screen(name) {
      if (!load()) return;
      gtag('event', 'page_view', { page_title: name, page_location: location.origin + '/screen/' + name, page_referrer: '' });
    },
    // A grown-up's answer: remembered for the landing page and the game on this device for a year
    consent(granted) {
      const v = granted ? 'granted' : 'denied', dom = cookieDomain(location.hostname);
      try {
        document.cookie = `${COOKIE}=${v}; Max-Age=31536000; Path=/; SameSite=Lax${dom ? '; Domain=' + dom : ''}${location.protocol === 'https:' ? '; Secure' : ''}`;
        // A no after a yes: Google's own cookies go too
        if (!granted) for (const c of document.cookie.split(';')) {
          const name = c.split('=')[0].trim();
          if (/^_ga/.test(name)) ['', dom].forEach(d => { document.cookie = `${name}=; Max-Age=0; Path=/${d ? '; Domain=' + d : ''}`; });
        }
      } catch (e) { /* cookies blocked */ }
      if (load()) gtag('consent', 'update', { analytics_storage: v });
    },
  };
})();
