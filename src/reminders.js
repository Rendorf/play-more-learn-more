// Daily reminder messages and the rules for when to send one. Shared by the game (a motivating line on the Play
// tab) and tools/admin/send-reminders.mjs (the hourly GitHub Actions job), so both always agree.
const PMLM_REMINDERS = (() => {
  // [title, body]. {streak}, {wish} and {av} are filled in for the child on that device.
  const M = {
    streak: [
      ['🔥 Keep your streak alive!', 'Your {streak}-day streak is waiting. One quick round keeps it going!'],
      ['🔥 {streak} days in a row!', 'Can you make it one more? Five minutes is all it takes.'],
      ['🔥 Streak alert', "Don't let the fire go out! A short round keeps your {streak}-day streak."],
      ['🔥 You are on a roll', '{streak} days of maths in a row. Can you add today?'],
      ['🔥 Streak saver', 'Blip is guarding your {streak}-day streak. Come and keep it going!'],
    ],
    wish: [
      ['🎁 So close!', 'Only {wish}% to go until your next wish. Master a skill today!'],
      ['🎁 Your wish is waiting', 'Just {wish}% more and your wish unlocks. Shall we get closer?'],
      ['🎁 Almost there', 'A few more mastered skills and your wish is yours. Only {wish}% left!'],
      ['🎁 Wish meter', 'Your wish bar is nearly full: {wish}% to go. One round helps!'],
    ],
    comeback: [
      ['🤖 Blip misses you!', 'Five minutes of maths? Your skills are waiting for you.'],
      ['👋 Welcome back any time', 'Your map, your coins and your boss battles are all still here.'],
      ['🌟 Ready for a fresh start?', 'One small round is a great way to warm up your brain again.'],
      ['🗺️ Your adventure is paused', 'Jump back in where you left off. It only takes a few minutes.'],
      ['🤖 Beep boop!', 'Blip has new questions ready. Come and show what you know!'],
      ['🧩 A puzzle is waiting', 'Your next skill is ready when you are. Shall we try?'],
    ],
    growth: [
      ['🧠 Brain gym time', 'Mistakes help your brain grow. Ready to try a few?'],
      ['🌱 Practice makes progress', 'Every question you try makes you a little bit stronger.'],
      ['💪 You can do hard things', 'Tricky questions are how brains get stronger. Give one a go!'],
      ['⭐ Small steps, big results', 'A few minutes every day adds up to a lot of maths.'],
      ['🚀 Ready for lift-off?', 'Every expert was once a beginner. Your next round starts now.'],
      ['🧠 Train your brain', 'Like a muscle, your brain gets stronger every time you practise.'],
      ['🌈 Learning is an adventure', "Don't know it yet? That's what practice is for!"],
      ['🎯 Aim for better, not perfect', 'Try, learn, try again. That is how champions practise.'],
      ['📈 Level up!', 'Each round makes the next one easier. Time for today’s?'],
      ['🌟 Believe in yourself', 'You have learned so much already. Let’s add one more thing today.'],
    ],
    playful: [
      ['⚔️ A boss is waiting', 'Can you knock out a boss today? Your sword is ready!'],
      ['🪙 Coins to collect', 'Daily quests are waiting with coins for you. Go get them!'],
      ['🎩 Fancy a new hat?', 'Earn coins in a quick round and treat your avatar.'],
      ['🔥 Combo challenge', 'How big a combo can you make today? Beat your best!'],
      ['🏅 Climb the leaderboard', 'A round today could move you up this week’s leaderboard.'],
      ['⚡ Extra challenge', 'Quick-fire questions, 60 seconds. Ready, steady, go!'],
      ['🗺️ New quests today', 'Fresh daily quests are here. Can you finish all three?'],
    ],
  };
  const DAILY = M.growth.map(m => m[1]);

  const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? '' : v[k]));
  const dayNum = s => { const [y, m, d] = String(s).split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
  const diffDays = (a, b) => dayNum(b) - dayNum(a);
  const hash = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x >>> 0; };
  const pad = n => String(n).padStart(2, '0');

  // Local date and hour at `now` in a time zone (falls back to a fixed offset in minutes)
  function local(now, tz, off) {
    if (tz) {
      try {
        const parts = {};
        new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
          .formatToParts(new Date(now)).forEach(p => { parts[p.type] = p.value; });
        return { day: `${parts.year}-${parts.month}-${parts.day}`, hour: +parts.hour % 24 };
      } catch (e) { /* unknown time zone: use the offset */ }
    }
    const d = new Date(now + (off || 0) * 60000);
    return { day: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, hour: d.getUTCHours() };
  }
  const dayFromMs = (ms, tz, off) => local(ms, tz, off).day;

  // Should this device get a reminder now, and which one? doc = a push/{uid} document.
  function plan(doc, now) {
    const no = reason => ({ send: false, reason });
    if (!doc || !doc.sub || typeof doc.hour !== 'number') return no('not set up');
    const { day, hour } = local(now, doc.tz, doc.off);
    if (hour !== doc.hour && hour !== doc.hour + 1) return no('not the chosen hour');
    if (doc.lastSent === day) return no('already sent today');
    const kids = Array.isArray(doc.kids) ? doc.kids : [];
    const played = kids.map(k => k.last).filter(Boolean).sort().pop() || (doc.t ? dayFromMs(doc.t - 86400000, doc.tz, doc.off) : null);
    if (!played) return no('nothing to go on');
    const since = diffDays(played, day);
    if (since <= 0) return no('played today');
    if (since > 14) return no('stopped after 14 days');
    if (since > 3 && (since - 3) % 3 !== 0) return no('backing off');
    // A streak is at risk while it is still alive: met yesterday, or the missed days are covered by freezes
    const atRisk = kids.filter(k => k.last === played && (k.str || 0) >= 2 && since <= 1 + (k.frz || 0));
    const streak = Math.max(0, ...atRisk.map(k => k.str));
    const wishes = kids.map(k => k.wish).filter(w => typeof w === 'number' && w > 0 && w <= 15);
    const cat = atRisk.length ? 'streak' : wishes.length ? 'wish' : since >= 3 ? 'comeback' : hash(day) % 2 ? 'growth' : 'playful';
    const list = M[cat];
    let i = hash(day + ':' + (doc.owner || '')) % list.length;
    if (`${cat}.${i}` === doc.lastMsg) i = (i + 1) % list.length;
    const av = kids.map(k => k.av).filter(Boolean).slice(0, 3).join('');
    const vars = { streak, wish: wishes.length ? Math.min(...wishes) : '', av };
    return { send: true, reason: `${since} day(s) since playing`, cat, id: `${cat}.${i}`, day, title: fill(list[i][0], vars), body: fill(list[i][1], vars), av };
  }

  // A motivating line for the Play tab, the same all day
  const daily = day => DAILY[hash(String(day)) % DAILY.length];

  return { M, plan, daily, local, diffDays };
})();
