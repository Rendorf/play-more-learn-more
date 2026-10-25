// Leaderboard helpers: kid-safe nicknames, week ids and ranking. Pure functions (no DOM, no storage), so
// tests/unit can load this file on its own.
const Board = (() => {
  const ADJ = ['Swift', 'Brave', 'Clever', 'Happy', 'Lucky', 'Mighty', 'Bright', 'Jolly', 'Speedy', 'Sunny', 'Cosmic', 'Super',
    'Gentle', 'Bold', 'Quick', 'Shiny', 'Witty', 'Zippy', 'Calm', 'Cheery', 'Daring', 'Eager', 'Friendly', 'Golden', 'Kind',
    'Merry', 'Nimble', 'Rapid', 'Smart', 'Sparkly', 'Starry', 'Stellar', 'Turbo', 'Wise', 'Bouncy', 'Breezy', 'Dazzling', 'Epic',
    'Fearless', 'Lively'];
  const ANIMALS = ['Fox', 'Panda', 'Tiger', 'Frog', 'Penguin', 'Koala', 'Rabbit', 'Owl', 'Dolphin', 'Otter', 'Lion', 'Eagle',
    'Falcon', 'Turtle', 'Whale', 'Zebra', 'Giraffe', 'Llama', 'Parrot', 'Puffin', 'Seal', 'Squirrel', 'Hedgehog', 'Lemur', 'Lynx',
    'Moose', 'Robin', 'Gecko', 'Badger', 'Beaver', 'Bison', 'Cheetah', 'Corgi', 'Kitten', 'Puppy', 'Pony', 'Yak', 'Koi', 'Meerkat',
    'Narwhal'];

  // FNV-1a: a small, stable string hash (the same nickname on every device for the same player)
  const hash = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x >>> 0; };
  const nick = (pid, seed) => {
    const x = hash(String(pid) + ':' + (seed || 0));
    return `${ADJ[x % ADJ.length]} ${ANIMALS[Math.floor(x / ADJ.length) % ANIMALS.length]} ${10 + Math.floor(x / (ADJ.length * ANIMALS.length)) % 90}`;
  };

  const pad = n => String(n).padStart(2, '0');
  const dayOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  // ISO week of a local date ("2026-W43"); weeks start on Monday
  function weekId(d) {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const wd = (t.getDay() + 6) % 7;
    t.setDate(t.getDate() - wd + 3);
    const y = t.getFullYear(), first = new Date(y, 0, 4);
    const w = 1 + Math.round(((t - first) / 86400000 - 3 + ((first.getDay() + 6) % 7)) / 7);
    return `${y}-W${pad(w)}`;
  }

  // Time that counts as playing: the round's length, but never more than 90 seconds per answered question
  const activeSecs = (ms, answered) => Math.max(0, Math.round(Math.min(ms / 1000, answered * 90)));
  const dayNum = s => { const [y, m, d] = String(s).split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
  // A streak still counts if the daily goal was met today or yesterday, or the freezes held cover the days missed
  const streakAlive = (day, today, freezes) => !!day && dayNum(today) - dayNum(day) - 1 <= (freezes || 0);

  const METRICS = {
    pts: { label: 'Points', icon: '🧠', week: 'wpts' },
    min: { label: 'Minutes', icon: '⏱️', week: 'wmin' },
    mst: { label: 'Mastered', icon: '⭐', week: 'wmst' },
    str: { label: 'Streak', icon: '🔥' },
    q: { label: 'Questions', icon: '✏️', week: 'wq' },
    acc: { label: 'First-try', icon: '🎯', min: 50 },
  };

  // docs: leaderboard documents from every device. One row per player (newest document wins), ranked by metric.
  // opts: { period: 'week' | 'all', metric, grade (0 = all), week, today }
  function rows(docs, opts) {
    const newest = {};
    for (const d of docs || []) if (d && d.pid && (!newest[d.pid] || (d.t || 0) > (newest[d.pid].t || 0))) newest[d.pid] = d;
    const m = METRICS[opts.metric] || METRICS.pts, out = [];
    for (const d of Object.values(newest)) {
      if (d.hid) continue;
      if (opts.period === 'week' && d.wk !== opts.week) continue;
      if (opts.grade && d.g !== opts.grade) continue;
      if (m.min && (d.q || 0) < m.min) continue;
      const value = opts.metric === 'str' ? (streakAlive(d.day, opts.today, d.frz) ? d.str || 0 : 0)
        : (opts.period === 'week' && m.week ? d[m.week] : d[opts.metric === 'acc' ? 'acc' : opts.metric]) || 0;
      if (value > 0) out.push(Object.assign({}, d, { value }));
    }
    out.sort((a, b) => b.value - a.value || (a.t || 0) - (b.t || 0));
    out.forEach((r, i) => { r.rank = i && r.value === out[i - 1].value ? out[i - 1].rank : i + 1; });
    return out;
  }

  return { nick, weekId, dayOf, activeSecs, streakAlive, rows, METRICS, hash, ADJ, ANIMALS };
})();
