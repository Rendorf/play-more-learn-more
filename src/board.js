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

  // The crowd: made-up players so the board never feels empty. The same on every device on the same day: 2–4 join
  // each day, each plays on some days and drifts away after a while. They carry levels, not numbers: rows() turns a
  // level into a value for each view from the real players in it, so most sit below every real player and none
  // ever leads.
  const CROWD_FROM = '2026-10-20', CROWD_DAYS = 180;
  const CROWD_GRADES = [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 9];
  const unit = s => hash(s) / 4294967296;
  const dateOf = n => { const u = new Date(n * 86400000); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
  let crowdMemo = null;
  // opts: { today, avatars, hats }
  function crowd(opts) {
    const end = dayNum(opts.today), key = opts.today + '|' + (opts.avatars || []).join('') + '|' + (opts.hats || []).join('');
    if (crowdMemo && crowdMemo.key === key) return crowdMemo.list;
    const avatars = opts.avatars && opts.avatars.length ? opts.avatars : ['🙂'], hats = opts.hats || [];
    const weekStart = end - ((dateOf(end).getDay() + 6) % 7), wk = weekId(dateOf(end)), list = [];
    for (let n = Math.max(dayNum(CROWD_FROM), end - CROWD_DAYS); n <= end; n++) {
      const arrivals = 2 + hash('crowd:' + n) % 3;
      for (let i = 0; i < arrivals; i++) {
        const pid = `zc${n}_${i}`, r = k => unit(pid + ':' + k);
        // keen: the chance of playing on a given day; life: the days until they stop coming back
        const keen = 0.3 + 0.7 * r('keen'), life = 5 + Math.floor(36 * r('life')), s = r('strength');
        // strength against the weaker real players: a few beginners, about 1 in 7 strong enough to overtake
        const strength = s < 0.06 ? 0.1 + 0.15 * r('s') : s < 0.2 ? 1.1 + 0.6 * r('s') : 0.25 + 0.6 * r('s');
        let played = 0, week = 0, run = 0, last = -1;
        for (let d = n; d <= Math.min(end, n + life); d++) {
          if (d !== n && r('day' + d) >= keen) continue;
          played++; if (d >= weekStart) week++;
          run = d - last === 1 ? run + 1 : 1; last = d;
        }
        list.push({
          pid, bot: true, nick: nick(pid, 0), av: avatars[hash(pid + ':av') % avatars.length],
          hat: hats.length && r('hat') < 0.33 ? hats[hash(pid + ':hat') % hats.length] : '', g: CROWD_GRADES[hash(pid + ':g') % CROWD_GRADES.length],
          lv: strength * played / (played + 2), wlv: week ? strength * week / (week + 1) : 0, alv: 0.7 + 0.25 * Math.min(strength, 1.4),
          str: run, frz: 0, day: dayOf(dateOf(last)), q: played >= 3 ? 50 : 0, wk: week ? wk : '', t: Number.MAX_SAFE_INTEGER,
        });
      }
    }
    crowdMemo = { key, list };
    return list;
  }

  // docs: leaderboard documents from every device. One row per player (newest document wins), ranked by metric.
  // opts: { period: 'week' | 'all', metric, grade (0 = all), week, today }. crowd: from crowd(), joins only views
  // that have a real player, scaled to them and always below the best.
  function rows(docs, opts, crowdDocs) {
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
    if (crowdDocs && out.length) {
      // ref: about the 25th percentile of the real players here (the lowest when there are four or fewer)
      const real = out.map(r => r.value).sort((a, b) => a - b), ref = real[Math.floor((real.length - 1) / 4)], best = real[real.length - 1];
      const weekly = opts.period === 'week';
      for (const d of crowdDocs) {
        if (weekly && d.wk !== opts.week) continue;
        if (opts.grade && d.g !== opts.grade) continue;
        if (m.min && (d.q || 0) < m.min) continue;
        let value = opts.metric === 'str' ? (streakAlive(d.day, opts.today, 0) ? d.str : 0)
          : Math.round(ref * (opts.metric === 'acc' ? d.alv : weekly && m.week ? d.wlv : d.lv));
        if (value >= best) value = Math.min(best - 1, Math.floor(best * (0.88 + 0.1 * unit(d.pid + ':cap'))));
        if (value > 0) out.push(Object.assign({}, d, { value }));
      }
    }
    out.sort((a, b) => b.value - a.value || (a.t || 0) - (b.t || 0));
    out.forEach((r, i) => { r.rank = i && r.value === out[i - 1].value ? out[i - 1].rank : i + 1; });
    return out;
  }

  return { nick, weekId, dayOf, activeSecs, streakAlive, rows, crowd, METRICS, hash, ADJ, ANIMALS };
})();
