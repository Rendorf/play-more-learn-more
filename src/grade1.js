// Play More Learn More — Cambridge Primary Stage 1 (Grade 1, age ~6).
// 5 units, 20 skills. Very few words, lots of pictures. See src/CONTRACT.md for the shapes used here.
(() => {
  // ───────────────────────── local helpers ─────────────────────────
  const R = U.rint;
  const pick = U.pick;
  const M = U.MINUS;
  const lv = L => Math.min(Math.max(L | 0, 1), 3);
  const TOP = [0, 10, 15, 20];                         // biggest number used at each level
  const top = L => TOP[lv(L)];
  const byLevel = (level, sets, ctx) => {
    const L = lv(level);
    return pick(sets[L - 1])(L, ctx || { currency: '₼' });
  };

  const num = (q, answer, hints, explain, extra) =>
    Object.assign({ q, kind: 'number', answer, hints, explain }, extra || {});
  const choice = (q, answer, wrongs, hints, explain, extra, n = 3) => {
    const a = String(answer);
    const w = [...new Set(wrongs.map(String))].filter(x => x !== a && x !== '');
    return Object.assign({ q, kind: 'choice', answer: a, choices: U.choices(a, w, n), hints, explain }, extra || {});
  };
  const yesNo = (q, yes, hints, explain, extra) =>
    choice(q, yes ? 'Yes' : 'No', [yes ? 'No' : 'Yes'], hints, explain, extra, 2);

  const sum = arr => arr.reduce((s, x) => s + x, 0);
  const distinct = (k, lo, hi) => U.sample(U.range(lo, hi), k);
  const two = () => { const a = U.name(); let b = U.name(); while (b === a) b = U.name(); return [a, b]; };
  // a row of emoji, with a little gap after every 5 so they are easy to count
  const row = (e, n) => { let s = ''; for (let i = 0; i < n; i++) s += e + (i % 5 === 4 && i < n - 1 ? ' ' : ''); return s; };
  const upList = (from, k) => Array.from({ length: k }, (_, i) => from + i + 1).join(', ');
  const downList = (from, k) => Array.from({ length: k }, (_, i) => from - i - 1).join(', ');
  const hops = (from, k, dir = 1) => Array.from({ length: k }, (_, i) => ({ from: from + dir * i, to: from + dir * (i + 1) }));
  const onStep = (start, k) => (k >= 2 ? `Start at ${start}. Count on ${k}: ${start + 1}, …` : `Start at ${start}. Count on 1 more.`);
  const backStep = (start, k) => (k >= 2 ? `Start at ${start}. Count back ${k}: ${start - 1}, …` : `Start at ${start}. Count back 1.`);
  const line = (min, max, extra) => Object.assign({ type: 'numberLine', min, max, step: 1 }, extra || {});
  // A number line (inside 0–20) that shows lo..hi. 12 steps, every number labelled, when it fits.
  // Level 1 always gets the plain 0–10 line.
  const win = (lo, hi, extra, L) => {
    let v;
    if (L === 1) v = line(0, 10);
    else if (hi - lo > 11) v = line(0, 20, { labelEvery: 2 });
    else {
      let min = Math.max(0, lo - R(1, 2));
      if (min + 12 < hi) min = hi - 12;
      min = Math.min(min, 8);
      v = line(min, min + 12);
    }
    return Object.assign(v, extra || {});
  };
  // A plain number line to use as a tool (no answer marked on it)
  const tool = L => (L === 1 ? line(0, 10) : L === 2 ? line(0, 15, { labelEvery: 1 }) : line(0, 20, { labelEvery: 2 }));

  const THINGS = [
    { e: '🍎', many: 'apples' }, { e: '⭐', many: 'stars' }, { e: '🐟', many: 'fish' }, { e: '🌸', many: 'flowers' },
    { e: '🚗', many: 'cars' }, { e: '🐞', many: 'ladybirds' }, { e: '🍓', many: 'strawberries' }, { e: '⚽', many: 'balls' },
    { e: '🐥', many: 'chicks' }, { e: '🍪', many: 'biscuits' }, { e: '🎈', many: 'balloons' }, { e: '🦋', many: 'butterflies' },
  ];

  // ═══════════════════════ Unit 1: Numbers to 20 ═══════════════════════
  PMLM.registerUnit({ id: 'g1.u1', grade: 1, name: 'Numbers to 20', icon: '🔢' });

  /* 1 ── Counting objects to 20 */
  {
    const RANGE = { 1: [3, 10], 2: [6, 15], 3: [10, 20] };

    const plain = L => {
      const [lo, hi] = RANGE[L], n = R(lo, hi), t = pick(THINGS), cols = Math.ceil(Math.sqrt(n));
      return num(`How many ${t.e}?`, n,
        ['Touch each one. Say one number for each.', `The top row has ${cols}. Keep counting from ${cols}.`],
        `Count them one by one: 1, 2, 3 … ${n}. There are ${n}.`,
        { visual: { type: 'objects', groups: [n], emoji: t.e } });
    };

    const rows = L => {
      const opts = [];
      for (let r = 2; r <= 4; r++) for (let c = 2; c <= 5; c++) if (r * c >= RANGE[L][0] && r * c <= RANGE[L][1]) opts.push([r, c]);
      const [r, c] = pick(opts), n = r * c, t = pick(THINGS);
      return num(`How many ${t.e}?`, n,
        ['Count one row. Then count on, row by row.', `The first row has ${c}. Count on from ${c} for the next row.`],
        `There are ${r} rows of ${c}. Count them all: there are ${n}.`,
        { visual: { type: 'array', rows: r, cols: c, emoji: t.e } });
    };

    const tenAnd = L => {
      const k = L === 2 ? R(1, 5) : R(2, 9), n = 10 + k, t = pick(THINGS);
      return num(`How many ${t.e}?`, n,
        ['The first ring has 10. You do not need to count it again.', 'Say 10. Then count on, one for each in the other ring.'],
        `The first ring has 10. Count on ${k}: ${upList(10, k)}. There are ${n}.`,
        { visual: { type: 'objects', groups: [10, k], emoji: t.e } });
    };

    const which = L => {
      const n = R(3, L === 1 ? 7 : 10), t = pick(THINGS);
      return choice(`Which has **${n}**?`, row(t.e, n), [row(t.e, n - 1), row(t.e, n + 1)],
        ['Count the things in each answer.', 'Touch each one as you count: 1, 2, 3 …'],
        `Count each one. This one has ${n}: ${row(t.e, n)}`);
    };

    PMLM.registerSkill({
      id: 'g1.count', grade: 1, unit: 'g1.u1', title: 'Count to 20', icon: '🍎',
      blurb: 'Count things one by one, up to 20',
      lesson: [
        { title: 'Count one by one', text: 'Touch each one. Say one number for each.\n1, 2, 3, 4, 5.', visual: { type: 'objects', groups: [5], emoji: '🍎' } },
        { title: 'The last number', text: 'The last number you say tells you **how many**.\n1, 2, 3, 4, 5, 6, 7. There are **7**.', visual: { type: 'objects', groups: [7], emoji: '⭐' } },
        { title: 'Rows help', text: 'Count one row. Then count on for the next row.\nTwo rows of 5 make **10**.', visual: { type: 'array', rows: 2, cols: 5, emoji: '🐞' } },
        { title: 'Example: how many fish?', text: '1. The first ring has **10**.\n2. Count on: 11, 12, 13, 14.\n3. There are **14** fish.', visual: { type: 'objects', groups: [10, 4], emoji: '🐟' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[plain, plain, rows, which], [plain, rows, tenAnd, which], [plain, rows, tenAnd, tenAnd]], ctx);
      },
    });
  }

  /* 2 ── Number before / after, counting on and back on a number line */
  {
    const lo = L => (L === 3 ? 9 : 1);

    const after = L => {
      const n = R(lo(L), top(L) - 1), words = pick(['What comes **after**', 'What is **1 more** than']);
      return num(`${words} ${n}?`, n + 1,
        ['**After** means 1 more. Count on one.', `Count: ${n > 1 ? `${n - 1}, ` : ''}${n} … what do you say next?`],
        `${n} and 1 more is ${n + 1}.`,
        { visual: { type: 'sequence', terms: [String(n - 1), String(n), '?'], step: '+1' } });
    };

    const before = L => {
      const n = R(lo(L) + 1, top(L)), words = pick(['What comes **before**', 'What is **1 less** than']);
      const terms = n < 20 ? ['?', String(n), String(n + 1)] : [String(n - 2), '?', String(n)];
      return num(`${words} ${n}?`, n - 1,
        ['**Before** means 1 less. Count back one.', `Count back: ${n < 20 ? `${n + 1}, ` : ''}${n} … what do you say next?`],
        `1 less than ${n} is ${n - 1}.`,
        { visual: { type: 'sequence', terms, step: '+1' } });
    };

    const between = L => {
      const n = R(lo(L) + 1, top(L) - 1);
      return num(`What number is **between** ${n - 1} and ${n + 1}?`, n,
        ['Count up from the smaller number.', `Say ${n - 1} … the next number is the one in the middle.`],
        `${n - 1}, ${n}, ${n + 1}. The number between is ${n}.`,
        { visual: { type: 'sequence', terms: [String(n - 1), '?', String(n + 1)] } });
    };

    const lineRead = L => {
      const [min, max] = pick(L === 1 ? [[0, 10]] : L === 2 ? [[0, 15], [5, 15], [0, 10]] : [[0, 20], [10, 20], [5, 20]]);
      const v = pick(U.range(min + 1, max - 1).filter(x => (x - min) % 5 !== 0));
      const below = min + 5 * Math.floor((v - min) / 5), above = below + 5, up = v - below <= 2;
      const from = up ? below : above;
      const said = up ? upList(below, v - below) : downList(above, above - v);
      return num('What number is at the **?**', v,
        ['Find a number you know. Count the steps to the **?**.', `Start at ${from}. Count ${up ? 'on' : 'back'} one step at a time.`],
        `From ${from}, count ${up ? 'on' : 'back'}: ${said}. The **?** is at ${v}.`,
        { visual: line(min, max, { labelEvery: 5, points: [{ at: v, label: '?' }] }) });
    };

    const countOn = L => {
      const k = R(2, L === 1 ? 3 : L === 2 ? 4 : 5), s = R(L === 3 ? 8 : 1, top(L) - k);
      return num(`Start at **${s}**. Count on **${k}**.\nWhere do you stop?`, s + k,
        ['Count on means go up the line. Do not count the start number.', `The first jump goes to ${s + 1}. Make ${k - 1} more ${k - 1 === 1 ? 'jump' : 'jumps'}.`],
        `From ${s}, count on ${k}: ${upList(s, k)}. You stop on ${s + k}.`,
        { visual: win(s, s + k, { points: [{ at: s }] }, L) });
    };

    const countBack = L => {
      const k = R(2, L === 1 ? 3 : L === 2 ? 4 : 5), s = R(Math.max(k + 1, L === 3 ? 11 : 3), top(L));
      return num(`Start at **${s}**. Count back **${k}**.\nWhere do you stop?`, s - k,
        ['Count back means go down the line. Do not count the start number.', `The first jump goes back to ${s - 1}. Make ${k - 1} more ${k - 1 === 1 ? 'jump' : 'jumps'}.`],
        `From ${s}, count back ${k}: ${downList(s, k)}. You stop on ${s - k}.`,
        { visual: win(s - k, s, { points: [{ at: s }] }, L) });
    };

    PMLM.registerSkill({
      id: 'g1.beforeAfter', grade: 1, unit: 'g1.u1', title: 'Before and after', icon: '➡️',
      blurb: 'Find the number before or after, count on and back',
      lesson: [
        { title: 'The number line', text: 'Numbers go in order on a line.\nEach step is **1 more**.', visual: line(0, 10) },
        { title: 'After', text: 'The number **after** 6 is 7.\nIt is 1 more. Step right.', visual: line(0, 10, { points: [{ at: 6 }], jumps: [{ from: 6, to: 7, label: '+1' }] }) },
        { title: 'Before', text: 'The number **before** 6 is 5.\nIt is 1 less. Step left.', visual: line(0, 10, { points: [{ at: 6 }], jumps: [{ from: 6, to: 5, label: `${M}1` }] }) },
        { title: 'Count on', text: 'Start at 12. Count on 3: 13, 14, 15.\nDo not count the 12!', visual: line(10, 20, { points: [{ at: 12 }], jumps: hops(12, 3) }) },
        { title: 'Example: after 15', text: 'What comes after 15?\n1. Find 15 on the line.\n2. Take 1 step right.\n3. You land on **16**.', visual: line(10, 20, { points: [{ at: 15 }], jumps: [{ from: 15, to: 16, label: '+1' }] }) },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [after, before, countOn, countBack, lineRead],
          [after, before, between, countOn, countBack, lineRead],
          [after, before, between, countOn, countBack, lineRead],
        ], ctx);
      },
    });
  }

  /* 3 ── Comparing: more, fewer, bigger, smaller */
  {
    const tensWord = n => (n >= 20 ? '2 tens' : n >= 10 ? '1 ten' : 'no tens');
    const compareStep = (x, y) => {
      if (Math.floor(x / 10) !== Math.floor(y / 10)) return `${x} has ${tensWord(x)}. ${y} has ${tensWord(y)}.`;
      if (x >= 10) return `Both have 1 ten. Look at the ones: ${x % 10} and ${y % 10}.`;
      return `Count 1, 2, 3 … Which do you say first, ${x} or ${y}?`;
    };
    const pairFor = L => {
      if (L === 1) return distinct(2, 1, 10);
      if (L === 2) return Math.random() < 0.5 ? [R(5, 9), R(10, 15)] : distinct(2, 6, 15);
      const r = Math.random();
      if (r < 0.35) { const s = R(3, 9); return [s, 10 + R(1, s - 1)]; }   // 9 and 12: the ones digit is a trap
      if (r < 0.7) { const t = R(11, 18); return [t, t + R(1, 2)]; }        // close teen numbers
      return distinct(2, 1, 20);
    };

    const emojiRows = L => {
      const [a, b] = distinct(2, 2, L === 1 ? 8 : 10), [t1, t2] = U.sample(THINGS, 2), more = Math.random() < 0.6;
      const ans = (more ? a > b : a < b) ? t1.e : t2.e;
      return choice(`Which has **${more ? 'more' : 'fewer'}**?\n${row(t1.e, a)}\n${row(t2.e, b)}`, ans, [ans === t1.e ? t2.e : t1.e],
        [more ? 'Count each row. More means the bigger number.' : 'Count each row. Fewer means the smaller number.', `There are ${a} ${t1.e}. Now count the ${t2.e}.`],
        `${a} ${t1.e} and ${b} ${t2.e}. ${Math.min(a, b)} is fewer than ${Math.max(a, b)}. So the answer is ${ans}.`, null, 2);
    };

    const bigger = L => {
      const [x, y] = U.shuffle(pairFor(L)), big = Math.random() < 0.6;
      const ans = big ? Math.max(x, y) : Math.min(x, y), other = ans === x ? y : x, word = big ? 'bigger' : 'smaller';
      return choice(`Which number is **${word}**?`, ans, [other],
        [big ? 'Bigger numbers come later when you count.' : 'Smaller numbers come first when you count.', compareStep(x, y)],
        `${Math.min(x, y)} comes before ${Math.max(x, y)} when you count. The ${word} number is ${ans}.`,
        { visual: tool(L) }, 2);
    };

    const ofThree = L => {
      let ns;
      do { ns = L === 2 ? distinct(3, 3, 15) : [R(3, 9), ...distinct(2, 10, 20)]; } while (new Set(ns).size < 3);
      ns = U.shuffle(ns);
      const up = [...ns].sort((a, b) => a - b), big = Math.random() < 0.5, ans = big ? up[2] : up[0];
      return choice(`Which is the **${big ? 'biggest' : 'smallest'}**?`, ans, ns.filter(x => x !== ans),
        ['Compare two numbers at a time.', `Compare ${ns[0]} and ${ns[1]} first. Which is ${big ? 'bigger' : 'smaller'}?`],
        `In order: ${up.join(', ')}. The ${big ? 'biggest' : 'smallest'} is ${ans}.`,
        { visual: tool(L) }, 3);
    };

    const who = L => {
      const [a, b] = distinct(2, 2, L === 2 ? 10 : 15), [n1, n2] = two(), t = pick(THINGS), more = Math.random() < 0.5;
      const ans = (more ? a > b : a < b) ? n1 : n2;
      return choice(`${n1} has ${a} ${t.e}.\n${n2} has ${b} ${t.e}.\nWho has **${more ? 'more' : 'fewer'}**?`, ans, [ans === n1 ? n2 : n1],
        [more ? 'More means the bigger number.' : 'Fewer means the smaller number.', `${n1} has ${a}. ${n2} has ${b}. Which number is ${more ? 'bigger' : 'smaller'}?`],
        `${Math.min(a, b)} is fewer than ${Math.max(a, b)}. So the answer is ${ans}.`,
        { visual: { type: 'objects', groups: [a, b], emoji: t.e } }, 2);
    };

    const fill = L => {
      const [x, y] = U.shuffle(pairFor(L)), ans = x > y ? 'bigger' : 'smaller';
      return choice(`**${x}** is ___ than **${y}**.`, ans, [ans === 'bigger' ? 'smaller' : 'bigger'],
        ['Which comes first when you count?', compareStep(x, y)],
        `${x} comes ${x > y ? 'after' : 'before'} ${y} when you count. So ${x} is ${ans}.`,
        { visual: tool(L) }, 2);
    };

    PMLM.registerSkill({
      id: 'g1.compare', grade: 1, unit: 'g1.u1', title: 'More or fewer', icon: '⚖️',
      blurb: 'Which is more? Which is fewer? Which is bigger?',
      lesson: [
        { title: 'More', text: '6 is **more** than 4.\nThe group of 6 has more.', visual: { type: 'objects', groups: [6, 4], emoji: '🍓' } },
        { title: 'Fewer', text: '3 is **fewer** than 7.\nFewer means not as many.', visual: { type: 'objects', groups: [3, 7], emoji: '🐥' } },
        { title: 'Bigger and smaller', text: 'When you count, bigger numbers come later.\n15 is **bigger** than 9. 9 is **smaller** than 15.', visual: line(0, 20, { labelEvery: 5, points: [{ at: 9, label: '9' }, { at: 15, label: '15' }] }) },
        { title: 'Tens win', text: '12 is bigger than 9.\n12 has a ten. 9 has no tens.', visual: { type: 'base10', n: 12 } },
        { title: 'Example: 13 or 17?', text: 'Which is bigger?\n1. Both have 1 ten.\n2. Look at the ones: 7 is more than 3.\n3. So **17** is bigger.', visual: line(10, 20, { points: [{ at: 13, label: '13' }, { at: 17, label: '17' }] }) },
      ],
      gen(level, ctx) {
        return byLevel(level, [[emojiRows, emojiRows, bigger], [emojiRows, bigger, who, ofThree], [bigger, who, ofThree, fill]], ctx);
      },
    });
  }

  /* 4 ── Ordering numbers to 20 */
  {
    const set3 = L => {
      if (L === 1) return distinct(3, 1, 10);
      if (L === 2) return distinct(3, 1, 15);
      if (Math.random() < 0.5) return distinct(3, 8, 20);
      return [R(2, 9), ...distinct(2, 10, 20)];   // a one-digit number with teens catches "order by the last digit"
    };
    const S = a => a.join(', ');

    const inOrder = L => {
      const ns = U.shuffle(set3(L)), up = [...ns].sort((a, b) => a - b), asc = Math.random() < 0.7;
      const right = asc ? up : [...up].reverse();
      const byOnes = [...ns].sort((a, b) => (a % 10) - (b % 10) || a - b);
      const swapEnd = S([right[0], right[2], right[1]]);
      const second = asc && S(byOnes) !== S(right) && S(byOnes) !== swapEnd ? S(byOnes) : S([...right].reverse());
      return choice(`Which is in order, **${asc ? 'smallest' : 'biggest'} first**?`, S(right), [swapEnd, second, S([right[1], right[0], right[2]])],
        [asc ? 'Find the smallest number. It goes first.' : 'Find the biggest number. It goes first.', `The ${asc ? 'smallest' : 'biggest'} is ${right[0]}. Which number comes next?`],
        `${right[0]}, then ${right[1]}, then ${right[2]}. In order: ${S(right)}.`,
        { visual: tool(L) }, 3);
    };

    const gap = L => {
      const hi = top(L), a = R(2, hi - 4), c = R(a + 2, hi - 1), b = R(a + 1, c - 1);
      const below = R(Math.max(0, a - 3), a - 1), above = R(c + 1, Math.min(hi, c + 3));
      return choice('Smallest to biggest.\nWhich number fits in the gap?', b, [below, above],
        [`It must be bigger than ${a} and smaller than ${c}.`, `${below} is smaller than ${a}, so it does not fit.`],
        `${a}, ${b}, ${c} are in order. ${b} fits in the gap.`,
        { visual: { type: 'sequence', terms: [String(a), '?', String(c)] } }, 3);
    };

    const firstLast = L => {
      const ns = U.shuffle(set3(L)), up = [...ns].sort((a, b) => a - b), first = Math.random() < 0.5;
      const ans = first ? up[0] : up[2], [x, y] = ns.filter(v => v !== ans);   // compare the two others first
      return num(`Put in order, smallest first:\n**${S(ns)}**\nWhich number is **${first ? 'first' : 'last'}**?`, ans,
        [first ? 'Smallest first: find the smallest number.' : 'Smallest first, so the biggest number goes last.',
          `Compare ${x} and ${y}: ${first ? `${Math.min(x, y)} is smaller` : `${Math.max(x, y)} is bigger`}. Now compare it with ${ans}.`],
        `In order: ${S(up)}. The ${first ? 'first' : 'last'} number is ${first ? up[0] : up[2]}.`,
        { visual: tool(L) });
    };

    const middle = L => {
      const ns = U.shuffle(set3(L)), up = [...ns].sort((a, b) => a - b);
      return num(`Put in order:\n**${S(ns)}**\nWhich number goes in the **middle**?`, up[1],
        ['Put them smallest first. The middle one is not the smallest or the biggest.', `Find the smallest first: it is ${up[0]}. Now look at the other two.`],
        `In order: ${S(up)}. The middle number is ${up[1]}.`,
        { visual: tool(L) });
    };

    const missing = L => {
      const n = R(0, top(L) - 3);
      return num('What is the missing number?', n + 2,
        ['The numbers go up by 1.', `Count: ${n}, ${n + 1} … keep going.`],
        `${n}, ${n + 1}, ${n + 2}, ${n + 3}. The missing number is ${n + 2}.`,
        { visual: { type: 'sequence', terms: [String(n), String(n + 1), '?', String(n + 3)], step: '+1' } });
    };

    PMLM.registerSkill({
      id: 'g1.order', grade: 1, unit: 'g1.u1', title: 'Put in order', icon: '📶',
      blurb: 'Put numbers in order, smallest to biggest',
      lesson: [
        { title: 'In order', text: 'Numbers in order go up, one at a time.\n1, 2, 3, 4, 5', visual: { type: 'sequence', terms: ['1', '2', '3', '4', '5'], step: '+1' } },
        { title: 'Smallest first', text: 'Find the **smallest** number. Put it first.\nThen find the next smallest.', visual: line(0, 10, { points: [{ at: 2, label: '2' }, { at: 5, label: '5' }, { at: 8, label: '8' }] }) },
        { title: 'Use the number line', text: 'Numbers get **bigger** as you go right.\nNumbers on the left are **smaller**.', visual: line(0, 20, { labelEvery: 2 }) },
        { title: 'Example: 14, 9, 17', text: 'Put them in order, smallest first.\n1. 9 has no tens. It is the smallest.\n2. 14 is smaller than 17.\n3. In order: **9, 14, 17**.', visual: line(0, 20, { labelEvery: 5, points: [{ at: 9, label: '9' }, { at: 14, label: '14' }, { at: 17, label: '17' }] }) },
      ],
      gen(level, ctx) {
        return byLevel(level, [[inOrder, gap, firstLast, missing], [inOrder, gap, firstLast, middle], [inOrder, gap, firstLast, middle]], ctx);
      },
    });
  }

  /* 5 ── Teen numbers: 10 and some ones */
  {
    const WORDS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
    const cap = s => s[0].toUpperCase() + s.slice(1);
    const onesFor = L => (L === 1 ? R(1, 4) : L === 2 ? R(1, 7) : R(1, 9));
    const onesWord = o => (o === 1 ? '1 one' : `${o} ones`);

    const what = L => {
      if (L === 3 && Math.random() < 0.15) {
        return num('What number is this?', 20, ['Each stick is 10.', 'Count the sticks in tens: 10, …'],
          'There are 2 tens: 10, 20. It is 20.', { visual: { type: 'base10', n: 20 } });
      }
      const o = onesFor(L), n = 10 + o;
      return num('What number is this?', n,
        ['The stick is 10. Each little cube is 1.', 'Say 10 for the stick. Then count on 1 for each little cube.'],
        `1 ten and ${onesWord(o)}. 10 and ${o} make ${n}.`, { visual: { type: 'base10', n } });
    };

    const tenPlus = L => {
      const o = onesFor(L), n = 10 + o;
      return num(`10 + ${o} = □`, n,
        ['10 and some ones make a teen number.', 'Say 10 for the stick. Count on 1 for each little cube.'],
        `10 and ${o} make ${n}. So 10 + ${o} = ${n}.`, { visual: { type: 'base10', n } });
    };

    const split = L => {
      const o = onesFor(L), n = 10 + o;
      return num(`${n} = 10 + □`, o,
        ['A teen number is 10 and some ones.', `Count on from 10 to ${n}. Count the jumps.`],
        `${n} is 1 ten and ${onesWord(o)}. So ${n} = 10 + ${o}.`, { visual: { type: 'bond', whole: n, parts: [10, '?'] } });
    };

    const ones = L => {
      const o = onesFor(L), n = 10 + o;
      return num(`${n} is 1 ten and □ ones.`, o,
        ['The ten is 10. The rest are ones.', `${n} is 10 and some more. Count on from 10 to ${n}.`],
        `${n} = 10 + ${o}. The ones are ${o}.`, L === 1 ? { visual: { type: 'base10', n } } : undefined);
    };

    const digits = L => {
      const o = R(2, L === 1 ? 5 : 9), n = 10 + o;
      return choice(`Which number is **1 ten and ${o} ones**?`, n, [o * 10 + 1, 1 + o],
        ['Write the tens first, then the ones.', `1 ten and ${o} ones is 10 + ${o}.`],
        `1 ten is 10. 10 + ${o} = ${n}. So the number is ${n}.`, { visual: { type: 'base10', n } }, 3);
    };

    const word = L => {
      const n = L === 2 ? R(11, 15) : R(11, 20), o = n - 10, w = WORDS[o];
      if (n === 20) {
        return choice('Which number is **twenty**?', 20, [2, 12],
          ['Twenty is 2 tens.', 'Count in tens: 10, …'], 'Twenty is 2 tens: 10, 20. We write 20.', null, 3);
      }
      return choice(`Which number is **${w}**?`, n, [o * 10 + 1, o, n + 1],
        ['A teen number starts with 1 ten.', `${cap(w)} is 10 and ${o}.`],
        `${cap(w)} is 10 and ${o}. We write ${n}.`, null, 3);
    };

    PMLM.registerSkill({
      id: 'g1.teens', grade: 1, unit: 'g1.u1', title: 'Teen numbers', icon: '🧱',
      blurb: 'A teen number is 10 and some ones',
      lesson: [
        { title: 'A ten', text: 'Ten little cubes make one stick.\nThe stick is **1 ten**.', visual: { type: 'base10', n: 10 } },
        { title: '10 and some more', text: '13 is **1 ten** and **3 ones**.\n10 and 3 make 13.', visual: { type: 'base10', n: 13 } },
        { title: 'Say it, write it', text: 'Thir-**teen** is 10 and 3.\nWrite the ten first: **13**. Not 31!', visual: { type: 'bond', whole: 13, parts: [10, 3] } },
        { title: 'Example: what number?', text: '1. The stick is 10.\n2. Count on the cubes: 11, 12, 13, 14, 15, 16.\n3. It is **16**.', visual: { type: 'base10', n: 16 } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[what, tenPlus, split, ones, digits], [what, tenPlus, split, ones, digits, word], [what, split, ones, digits, word]], ctx);
      },
    });
  }

  /* 6 ── Counting in 2s, 5s and 10s */
  {
    const label = k => (k > 0 ? '+' : M) + Math.abs(k);
    const runs = L => {
      if (L === 1) return pick([{ s: pick([0, 2]), k: 2 }, { s: pick([0, 5]), k: 5 }, { s: pick([0, 10]), k: 10 }]);
      if (L === 2) return pick([{ s: 2 * R(0, 6), k: 2 }, { s: 5 * R(0, 2), k: 5 }, { s: 10 * R(0, 2), k: 10 }, { s: 10 * R(4, 6), k: -10 }]);
      return pick([{ s: 2 * R(0, 5) + 1, k: 2 }, { s: R(1, 9), k: 10 }, { s: 2 * R(4, 10), k: -2 }, { s: R(40, 49), k: -10 }, { s: 5 * R(4, 8), k: -5 }]);
    };
    const terms5 = ({ s, k }) => [0, 1, 2, 3, 4].map(i => s + i * k);
    const say = k => (k > 0 ? 'Count on' : 'Count back');
    const op = k => (k > 0 ? '+' : M);

    const next = L => {
      const r = runs(L), t = terms5(r), ans = t[4];
      return num('What comes next?', ans,
        [`Each jump is ${label(r.k)}.`, `The last number is ${t[3]}. ${say(r.k)} ${Math.abs(r.k)} from ${t[3]}.`],
        `Each jump is ${label(r.k)}. ${t[3]} ${op(r.k)} ${Math.abs(r.k)} = ${ans}.`,
        { visual: { type: 'sequence', terms: [...t.slice(0, 4).map(String), '?'], step: label(r.k) } });
    };

    const gap = L => {
      const r = runs(L), t = terms5(r), j = R(1, 3), ans = t[j];
      return num('What is the missing number?', ans,
        [`Each jump is ${label(r.k)}.`, `The number before the gap is ${t[j - 1]}. ${say(r.k)} ${Math.abs(r.k)}.`],
        `Each jump is ${label(r.k)}. ${t[j - 1]} ${op(r.k)} ${Math.abs(r.k)} = ${ans}.`,
        { visual: { type: 'sequence', terms: t.map((v, i) => (i === j ? '?' : String(v))), step: label(r.k) } });
    };

    const pairs = L => {
      const g = R(3, L === 1 ? 5 : 10), it = pick(['🧦', '👟', '🧤']);
      return num(`How many ${it}?\nCount in 2s.`, 2 * g,
        ['Each ring has 2. Count in 2s.', 'Point at each ring. Say 2, then 4, and keep going.'],
        `Count in 2s: ${Array.from({ length: g }, (_, i) => 2 * (i + 1)).join(', ')}. There are ${2 * g}.`,
        { visual: { type: 'objects', groups: Array(g).fill(2), emoji: it } });
    };

    const hands = L => {
      const h = R(3, L === 1 ? 4 : 6);
      return num('How many fingers?\nCount in 5s.', 5 * h,
        ['Each hand has 5 fingers.', 'Say 5 for the first hand, then 10 for the next. Keep going.'],
        `Count in 5s: ${Array.from({ length: h }, (_, i) => 5 * (i + 1)).join(', ')}. There are ${5 * h} fingers.`,
        { visual: { type: 'array', rows: 1, cols: h, emoji: '🖐️' } });
    };

    const tens = L => {
      const g = R(2, L === 2 ? 4 : 5), it = pick(['🍬', '⭐', '🔵', '🍓']);
      return num(`Each ring has 10.\nHow many ${it}?`, 10 * g,
        ['Count the rings in 10s.', 'Say 10 for the first ring. Keep going in 10s.'],
        `Count in 10s: ${Array.from({ length: g }, (_, i) => 10 * (i + 1)).join(', ')}. There are ${10 * g}.`,
        { visual: { type: 'objects', groups: Array(g).fill(10), emoji: it } });
    };

    const which = L => {
      const k = pick([2, 5, 10]);
      let ans, wrongs;
      if (k === 2) { ans = 2 * R(4, 9); wrongs = [ans + 1, ans - 1]; }
      else if (k === 5) { ans = 5 * R(4, 6); wrongs = [ans - 1, ans + 2]; }
      else { ans = 10 * R(4, 9); wrongs = [ans + 1, ans - 5]; }
      return choice(`Count in ${k}s from 0.\nWhich number do you say?`, ans, wrongs,
        [`Start at 0. Count in ${k}s.`, `Say ${k}, ${2 * k}, ${3 * k} … and keep going.`],
        `Counting in ${k}s: ${k}, ${2 * k}, ${3 * k} … ${ans}. You say ${ans}.`, null, 3);
    };

    PMLM.registerSkill({
      id: 'g1.skipCount', grade: 1, unit: 'g1.u1', title: 'Count in 2s, 5s, 10s', icon: '🦘',
      blurb: 'Count in jumps of 2, 5 or 10',
      lesson: [
        { title: 'Count in 2s', text: 'Jump over a number each time.\n2, 4, 6, 8, 10', visual: { type: 'sequence', terms: ['2', '4', '6', '8', '10'], step: '+2' } },
        { title: 'Count in 5s', text: 'Each hand has 5 fingers.\n5, 10, 15, 20', visual: { type: 'array', rows: 1, cols: 4, emoji: '🖐️' } },
        { title: 'Count in 10s', text: 'Each stick is 10.\n10, 20, 30, 40', visual: { type: 'base10', n: 40 } },
        { title: 'Count back', text: `You can jump back too.\n20, 18, 16, 14. Each jump is ${M}2.`, visual: { type: 'sequence', terms: ['20', '18', '16', '14'], step: `${M}2` } },
        { title: 'Example: 4, 6, 8, ?', text: 'What comes next?\n1. Each jump is +2.\n2. The last number is 8.\n3. 8 + 2 = **10**.', visual: { type: 'sequence', terms: ['4', '6', '8', '?'], step: '+2' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[next, next, gap, pairs, hands], [next, gap, pairs, hands, tens], [next, gap, gap, tens, which]], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 2: Add and take away ═══════════════════════
  PMLM.registerUnit({ id: 'g1.u2', grade: 1, name: 'Add and take away', icon: '➕' });

  /* 7 ── Number bonds to 5 and 10 */
  {
    const wholeFor = L => (L === 1 ? pick([5, 5, 4, 6]) : L === 2 ? pick([10, 10, 10, 7, 8, 9]) : 10);

    const part = L => {
      const W = wholeFor(L), a = R(1, W - 1), left = Math.random() < 0.5;
      return num(left ? `${a} and □ make ${W}.` : `□ and ${a} make ${W}.`, W - a,
        ['Part + part = whole.', `Start at ${a}. Count on to ${W}. Count the jumps.`],
        `${a} + ${W - a} = ${W}. The missing part is ${W - a}.`,
        { visual: { type: 'bond', whole: W, parts: left ? [a, '?'] : ['?', a] } });
    };

    const frame = L => {
      const W = L === 1 ? 5 : 10, a = R(1, W - 1);
      return num(`${a} + □ = ${W}`, W - a,
        ['How many boxes are empty?', `${a} boxes are full. Count on from ${a} for each empty box.`],
        `${W - a} boxes are empty. ${a} + ${W - a} = ${W}, so □ = ${W - a}.`,
        { visual: { type: 'fractionBar', bars: [{ parts: W, shaded: a }] } });
    };

    const whole = L => {
      const W = L === 1 ? R(3, 6) : R(6, 10), a = R(1, W - 1), b = W - a;
      return num(`${a} and ${b} make □.`, W,
        ['Put the parts together.', onStep(Math.max(a, b), Math.min(a, b))],
        `${a} + ${b} = ${W}. The whole is ${W}.`,
        { visual: { type: 'bond', whole: '?', parts: [a, b] } });
    };

    const pairs = L => {
      const W = L === 1 ? 5 : 10, a = R(1, W - 2), b = W - a;
      return choice(`Which two make **${W}**?`, `${a} + ${b}`, [`${a} + ${b - 1}`, `${a + 1} + ${b}`],
        [`Add each pair. Which one makes ${W}?`, `Try ${a} + ${b - 1}: start at ${a} and count on ${b - 1}. Is it ${W}?`],
        `${a} + ${b} = ${W}. The answer is ${a} + ${b}.`,
        { visual: { type: 'bond', whole: W, parts: ['?', '?'] } }, 3);
    };

    const toMake = L => {
      const W = L === 1 ? 5 : 10, a = R(1, W - 2), t = pick(THINGS);
      return num(`I have ${a} ${t.e}.\nHow many more to make ${W}?`, W - a,
        [`Count on from ${a} to ${W}.`, `Start at ${a}. Hold up a finger for each number you say, up to ${W}.`],
        `${a} + ${W - a} = ${W}. You need ${W - a} more.`,
        { visual: { type: 'objects', groups: [a], emoji: t.e } });
    };

    const to20 = L => {
      const a = R(1, 9), n = 10 + a;
      return num(`${n} + □ = 20`, 10 - a,
        ['Use a bond to 10.', `${n} is 10 and ${a}. What goes with ${a} to make 10?`],
        `${a} + ${10 - a} = 10, so ${n} + ${10 - a} = 20. □ = ${10 - a}.`,
        { visual: { type: 'bond', whole: 20, parts: [n, '?'] } });
    };

    PMLM.registerSkill({
      id: 'g1.bonds', grade: 1, unit: 'g1.u2', title: 'Number bonds', icon: '🔗',
      blurb: 'Two numbers that make 5 or 10',
      lesson: [
        { title: 'Parts and whole', text: '2 and 3 make 5.\nThe **parts** are 2 and 3. The **whole** is 5.', visual: { type: 'bond', whole: 5, parts: [2, 3] } },
        { title: 'Bonds to 5', text: 'These all make **5**.', visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 1, label: '1 + 4' }, { parts: 5, shaded: 2, label: '2 + 3' }, { parts: 5, shaded: 3, label: '3 + 2' }, { parts: 5, shaded: 4, label: '4 + 1' }] } },
        { title: 'Bonds to 10', text: 'These all make **10**. And 5 + 5 = 10.\nLearn them by heart!', visual: { type: 'fractionBar', bars: [{ parts: 10, shaded: 1, label: '1 + 9' }, { parts: 10, shaded: 2, label: '2 + 8' }, { parts: 10, shaded: 3, label: '3 + 7' }, { parts: 10, shaded: 4, label: '4 + 6' }] } },
        { title: 'Example: 7 + □ = 10', text: '1. Start at 7.\n2. Count on to 10: 8, 9, 10.\n3. That is 3 jumps. So □ = **3**.', visual: line(0, 10, { points: [{ at: 7 }], jumps: hops(7, 3) }) },
      ],
      gen(level, ctx) {
        return byLevel(level, [[part, frame, whole, pairs, toMake], [part, frame, pairs, toMake], [part, frame, pairs, to20, to20]], ctx);
      },
    });
  }

  /* 8 ── Adding within 20 by counting on */
  {
    const pairFor = L => {
      let a, b;
      do {
        if (L === 1) { a = R(1, 8); b = R(1, 9); }
        else if (L === 2) { a = R(2, 12); b = R(2, 9); }
        else { a = R(2, 17); b = R(2, 9); }
      } while (a + b > top(L) || (L === 2 && a + b < 7) || (L === 3 && a + b < 11));
      return Math.random() < 0.5 ? [a, b] : [b, a];
    };

    const picture = L => {
      const [a, b] = pairFor(L), t = pick(THINGS), big = Math.max(a, b), small = Math.min(a, b), s = a + b;
      return num(`${a} + ${b} = □`, s,
        ['Count them all. Or start at the bigger number and count on.', onStep(big, small)],
        `Start at ${big}. Count on ${small}: ${upList(big, small)}. So ${a} + ${b} = ${s}.`,
        { visual: { type: 'objects', groups: [a, b], emoji: t.e } });
    };

    const onLine = L => {
      const [a, b] = pairFor(L), big = Math.max(a, b), small = Math.min(a, b), s = a + b;
      return num(`${a} + ${b} = □`, s,
        ['Start at the bigger number on the line. Jump on.',
          small >= 2 ? `Start at ${big}. The first jump lands on ${big + 1}. Make ${small - 1} more.` : `Start at ${big}. Make 1 jump.`],
        `Start at ${big} and jump on ${small}: ${upList(big, small)}. So ${a} + ${b} = ${s}.`,
        { visual: win(big, s, { points: [{ at: big }] }, L) });
    };

    const spot = L => {
      let a, b;
      do { a = R(2, top(L) - 3); b = R(2, 6); } while (a + b > top(L));
      const nm = U.name();
      return num(`${nm} says ${a} + ${b} = ${a + b - 1}.\nWhat is the right answer?`, a + b,
        ['Count on again. Do not count the start number.', `Start at ${a}. The first number you say is ${a + 1}.`],
        `${nm} counted ${a} again. From ${a}, count on ${b}: ${upList(a, b)}. So ${a} + ${b} = ${a + b}.`,
        { visual: win(a, a + b, { points: [{ at: a }] }, L) });
    };

    const swap = L => {
      let a, b;
      do { [a, b] = pairFor(L); } while (a === b || b < 2);
      return choice(`Which is the same as **${a} + ${b}**?`, `${b} + ${a}`, [`${b} + ${a + 1}`, `${a} + ${b - 1}`],
        ['You can add in any order. The answer stays the same.', `${a} + ${b} = ${a + b}. Which one also makes ${a + b}?`],
        `Adding in any order gives the same answer. ${a} + ${b} is the same as ${b} + ${a}.`, null, 3);
    };

    PMLM.registerSkill({
      id: 'g1.add', grade: 1, unit: 'g1.u2', title: 'Adding', icon: '➕',
      blurb: 'Add by counting on from the bigger number',
      lesson: [
        { title: 'Add means put together', text: '3 and 2 together make 5.\nWe write **3 + 2 = 5**.', visual: { type: 'objects', groups: [3, 2], emoji: '🐥' } },
        { title: 'Count on', text: '5 + 3: say 5 in your head.\nThen count on 3: 6, 7, 8.', visual: line(0, 10, { points: [{ at: 5 }], jumps: hops(5, 3) }) },
        { title: 'Big number first', text: '2 + 7 is the same as 7 + 2.\nStart at 7 and count on 2. It is quicker!', visual: line(0, 10, { points: [{ at: 7 }], jumps: hops(7, 2) }) },
        { title: 'Example: 9 + 4', text: '1. Start at 9.\n2. Count on 4: 10, 11, 12, 13.\n3. 9 + 4 = **13**.', visual: line(6, 16, { points: [{ at: 9 }], jumps: hops(9, 4) }) },
      ],
      gen(level, ctx) {
        return byLevel(level, [[picture, picture, onLine], [picture, onLine, spot, swap], [picture, onLine, onLine, spot, swap]], ctx);
      },
    });
  }

  /* 9 ── Taking away within 20 by counting back */
  {
    const pairFor = L => {
      if (L === 1) { const a = R(3, 10); return [a, R(1, a - 1)]; }
      if (L === 2) { const a = R(6, 15); return [a, R(2, Math.min(9, a - 1))]; }
      return [R(11, 20), R(2, 9)];
    };

    const picture = L => {
      const [a, b] = pairFor(L), t = pick(THINGS);
      return num(`${a} ${M} ${b} = □`, a - b,
        [`Cover ${b} of them. Count the rest.`, backStep(a, b)],
        `Start at ${a}. Count back ${b}: ${downList(a, b)}. So ${a} ${M} ${b} = ${a - b}.`,
        { visual: { type: 'objects', groups: [a], emoji: t.e } });
    };

    const onLine = L => {
      const [a, b] = pairFor(L), r = a - b, cross = a > 10 && r < 10;
      const step = cross ? `First count back ${a - 10} to get to 10. Then count back ${b - (a - 10)} more.`
        : b >= 2 ? `Start at ${a}. The first jump back lands on ${a - 1}. Make ${b - 1} more.` : `Start at ${a}. Make 1 jump back.`;
      return num(`${a} ${M} ${b} = □`, r,
        ['Start at the first number on the line. Jump back.', step],
        `From ${a}, count back ${b}: ${downList(a, b)}. So ${a} ${M} ${b} = ${r}.`,
        { visual: win(r, a, { points: [{ at: a }] }, L) });
    };

    const spot = L => {
      let a, b;
      do { [a, b] = pairFor(L); } while (b < 2);
      const nm = U.name();
      return num(`${nm} says ${a} ${M} ${b} = ${a - b + 1}.\nWhat is the right answer?`, a - b,
        ['Count back again. Do not count the start number.', `Start at ${a}. The first number you say is ${a - 1}.`],
        `${nm} counted ${a} as a jump. From ${a}, count back ${b}: ${downList(a, b)}. So ${a} ${M} ${b} = ${a - b}.`,
        { visual: win(a - b, a, { points: [{ at: a }] }, L) });
    };

    const teen = L => {
      const o = R(1, L === 2 ? 5 : 9), n = 10 + o;
      if (Math.random() < 0.5) {
        return num(`${n} ${M} ${o} = □`, 10, ['Take away the little cubes.', 'Cover the little cubes with your hand. What is left?'],
          `${n} is 10 and ${o}. Take away the ${o} and 10 is left. ${n} ${M} ${o} = 10.`, { visual: { type: 'base10', n } });
      }
      return num(`${n} ${M} 10 = □`, o, ['Take away the stick of 10.', 'Cover the stick with your hand. Count what is left.'],
        `${n} is 10 and ${o}. Take away the 10 and ${o} is left. ${n} ${M} 10 = ${o}.`, { visual: { type: 'base10', n } });
    };

    PMLM.registerSkill({
      id: 'g1.subtract', grade: 1, unit: 'g1.u2', title: 'Taking away', icon: '➖',
      blurb: 'Take away by counting back',
      lesson: [
        { title: 'Take away', text: `5 birds. 2 fly away.\n3 are left. **5 ${M} 2 = 3**.`, visual: { type: 'objects', groups: [3, 2], emoji: '🐦' } },
        { title: 'Count back', text: `8 ${M} 3: start at 8.\nCount back 3: 7, 6, 5.`, visual: line(0, 10, { points: [{ at: 8 }], jumps: hops(8, 3, -1) }) },
        { title: 'Check by adding', text: `5 + 3 = 8.\nSo 8 ${M} 3 = 5. The parts and the whole match.`, visual: { type: 'bond', whole: 8, parts: [5, 3] } },
        { title: `Example: 14 ${M} 5`, text: `1. Start at 14.\n2. Count back 5: 13, 12, 11, 10, 9.\n3. 14 ${M} 5 = **9**.`, visual: line(6, 16, { points: [{ at: 14 }], jumps: hops(14, 5, -1) }) },
      ],
      gen(level, ctx) {
        return byLevel(level, [[picture, picture, onLine], [picture, onLine, spot, teen], [picture, onLine, onLine, spot, teen]], ctx);
      },
    });
  }

  /* 10 ── Missing numbers: □ + 3 = 7 */
  {
    const tri = L => {
      let a, b;
      do { a = R(2, top(L) - 2); b = R(2, 9); } while (a + b > top(L) || (L === 2 && a + b < 7) || (L === 3 && a + b < 11));
      return [a, b, a + b];
    };

    const first = L => {
      const [a, b, c] = tri(L);
      return num(`□ + ${b} = ${c}`, a,
        [`What do you add to ${b} to make ${c}?`, `Start at ${b}. Count on to ${c}. Count your jumps.`],
        `${b} and ${a} make ${c}. So ${a} + ${b} = ${c}. □ = ${a}.`,
        { visual: { type: 'bond', whole: c, parts: ['?', b] } });
    };

    const second = L => {
      const [a, b, c] = tri(L);
      return num(`${a} + □ = ${c}`, b,
        [`Count on from ${a} to ${c}.`, `The first jump is ${a} to ${a + 1}. Keep going to ${c}. Count the jumps.`],
        `From ${a} to ${c} is ${b} jumps: ${upList(a, b)}. So □ = ${b}.`,
        { visual: win(a, c, { points: [{ at: a }, { at: c }], jumps: [{ from: a, to: c, label: '?' }] }, L) });
    };

    const takeMissing = L => {
      const [a, b, c] = tri(L);
      return num(`${c} ${M} □ = ${a}`, b,
        [`How many jumps back from ${c} to ${a}?`, `Count back from ${c}: ${c - 1} is 1 jump. Keep going to ${a}.`],
        `From ${c} back to ${a} is ${b} jumps. So ${c} ${M} ${b} = ${a}. □ = ${b}.`,
        { visual: win(a, c, { points: [{ at: c }, { at: a }] }, L) });
    };

    const startMissing = L => {
      const [a, b, c] = tri(L);
      return num(`□ ${M} ${b} = ${a}`, c,
        ['The box is the number you start with.', `Put back the ${b}: work out ${a} + ${b}.`],
        `${a} + ${b} = ${c}. So ${c} ${M} ${b} = ${a}. □ = ${c}.`,
        { visual: { type: 'bond', whole: '?', parts: [a, b] } });
    };

    const balance = L => {
      const [a, b, c] = tri(L), boxLeft = Math.random() < 0.5;
      return num('Both sides weigh the same.\nWhat number goes in the box?', b,
        [`${a} + □ must make ${c}.`, `Start at ${a}. Count on to ${c}. Count the jumps.`],
        `${a} + ${b} = ${c}. The box is ${b}.`,
        { visual: { type: 'balance', left: boxLeft ? `${a} + □` : String(c), right: boxLeft ? String(c) : `${a} + □` } });
    };

    const equalsFirst = L => {
      const [a, b, c] = tri(L);
      return num(`${c} = ${a} + □`, b,
        ['= means both sides are the same.', `${a} + □ must make ${c}. Count on from ${a} to ${c}.`],
        `${c} = ${a} + ${b}. □ = ${b}.`,
        { visual: { type: 'bond', whole: c, parts: [a, '?'] } });
    };

    PMLM.registerSkill({
      id: 'g1.missing', grade: 1, unit: 'g1.u2', title: 'Missing numbers', icon: '❓',
      blurb: 'Find the number hiding in the box',
      lesson: [
        { title: 'A hidden number', text: 'The box hides a number.\n3 + □ = 5', visual: { type: 'bond', whole: 5, parts: [3, '?'] } },
        { title: 'Count on to find it', text: 'Start at 3. Count on to 5: 4, 5.\nThat is 2 jumps. So □ = 2.', visual: line(0, 10, { points: [{ at: 3 }, { at: 5 }], jumps: hops(3, 2) }) },
        { title: 'The same on both sides', text: '= means **the same as**.\n4 + 2 is the same as 6.', visual: { type: 'balance', left: '4 + 2', right: '6' } },
        { title: 'Example: □ + 4 = 9', text: '1. Start at 4.\n2. Count on to 9: 5, 6, 7, 8, 9.\n3. That is 5 jumps.\n4. So □ = **5**.', visual: line(0, 10, { points: [{ at: 4 }, { at: 9 }], jumps: hops(4, 5) }) },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [first, second, second, takeMissing],
          [first, second, takeMissing, startMissing, balance],
          [first, second, takeMissing, startMissing, balance, equalsFirst],
        ], ctx);
      },
    });
  }

  /* 11 ── Doubles and halves of small numbers */
  {
    const maxN = L => (L === 1 ? 5 : L === 2 ? 7 : 10);

    const doublePic = L => {
      const n = R(1, maxN(L)), t = pick(THINGS);
      return num(`Double ${n} = □`, 2 * n,
        ['Double means two groups the same.', `Double ${n} is ${n} + ${n}. Start at ${n} and count on ${n}.`],
        `${n} + ${n} = ${2 * n}. Double ${n} is ${2 * n}.`,
        { visual: { type: 'objects', groups: [n, n], emoji: t.e } });
    };

    const doubleArr = L => {
      const n = R(2, maxN(L)), t = pick(THINGS);
      return num(`${n} + ${n} = □`, 2 * n,
        ['Two rows the same. That is a double.', `The top row has ${n}. Count on ${n} more for the bottom row.`],
        `Two rows of ${n}. ${n} + ${n} = ${2 * n}.`,
        { visual: { type: 'array', rows: 2, cols: n, emoji: t.e } });
    };

    const half = L => {
      // a wrong first try whose sum is never the answer itself (so no "1 + 1 = 2" for half of 4)
      const h = R(L === 1 ? 1 : 2, maxN(L)), n = 2 * h, t = pick(THINGS), tr = h > 2 ? h - 1 : h + 1;
      return num(`Half of ${n} = □`, h,
        [`Half means 2 groups the same. What number + the same number makes ${n}?`, `Try ${tr} + ${tr} = ${2 * tr}. Is that ${n}? If not, try another number.`],
        `${h} + ${h} = ${n}. So half of ${n} is ${h}.`,
        { visual: { type: 'objects', groups: [n], emoji: t.e } });
    };

    const story = L => {
      const n = R(2, maxN(L)), [A, B] = two(), t = pick(THINGS);
      return num(`${A} has ${n} ${t.e}.\n${B} has the same.\nHow many in all?`, 2 * n,
        ['Two the same: that is a double.', `Double ${n} is ${n} + ${n}.`],
        `${n} + ${n} = ${2 * n}. They have ${2 * n} in all.`,
        { visual: { type: 'objects', groups: [n, n], emoji: t.e } });
    };

    const spot = L => {
      const n = R(3, maxN(L)), nm = U.name(), wrong = 2 * n + pick([1, -1]);
      return num(`${nm} says double ${n} is ${wrong}.\nWhat is double ${n}?`, 2 * n,
        ['Double means add the number to itself.', `Double ${n} is ${n} + ${n}. Start at ${n} and count on ${n}.`],
        `${n} + ${n} = ${2 * n}, not ${wrong}. Double ${n} is ${2 * n}.`,
        { visual: { type: 'array', rows: 2, cols: n, emoji: '🔵' } });
    };

    const which = L => {
      const n = R(2, maxN(L));
      return choice('Which one is a **double**?', `${n} + ${n}`, [`${n} + ${n + 1}`, `${n - 1} + ${n}`],
        ['A double is two numbers the same.', 'Look at each one. Are both numbers the same?'],
        `${n} + ${n} has two numbers the same. The double is ${n} + ${n}.`, null, 3);
    };

    PMLM.registerSkill({
      id: 'g1.doubles', grade: 1, unit: 'g1.u2', title: 'Doubles and halves', icon: '👯',
      blurb: 'Double means two the same. Half means share in 2.',
      lesson: [
        { title: 'Double', text: 'Double means **two the same**.\nDouble 3 is 3 + 3 = 6.', visual: { type: 'objects', groups: [3, 3], emoji: '🐞' } },
        { title: 'Doubles to know', text: '1 + 1 = 2\n2 + 2 = 4\n3 + 3 = 6\n4 + 4 = 8\n5 + 5 = 10', visual: { type: 'array', rows: 2, cols: 5, emoji: '🟡' } },
        { title: 'Half', text: '**Half** means share into 2 groups the same.\nHalf of 6 is 3.', visual: { type: 'objects', groups: [3, 3], emoji: '🍪' } },
        { title: 'Doubles help halves', text: 'Double 4 is 8.\nSo half of 8 is 4.', visual: { type: 'bond', whole: 8, parts: [4, 4] } },
        { title: 'Example: double 6', text: '1. Double 6 means 6 + 6.\n2. Start at 6. Count on 6: 7, 8, 9, 10, 11, 12.\n3. Double 6 is **12**.', visual: { type: 'objects', groups: [6, 6], emoji: '🍓' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[doublePic, doubleArr, half, which], [doublePic, doubleArr, half, story, which], [doublePic, half, half, story, spot]], ctx);
      },
    });
  }

  /* 12 ── Simple picture word problems */
  {
    const GOERS = [
      { e: '🐦', go: 'fly away', go1: 'flies away' }, { e: '🎈', go: 'fly away', go1: 'flies away' }, { e: '🐸', go: 'hop away', go1: 'hops away' },
      { e: '🦆', go: 'swim away', go1: 'swims away' }, { e: '🐰', go: 'hop away', go1: 'hops away' }, { e: '🐟', go: 'swim away', go1: 'swims away' },
    ];
    const goes = (g, b) => (b === 1 ? g.go1 : g.go);
    const come = b => (b === 1 ? '1 more comes' : `${b} more come`);
    const FOOD = ['🍪', '🍓', '🍇', '🍌', '🍒'];
    const addPair = L => {
      let a, b;
      do { a = R(2, top(L) - 2); b = R(1, L === 1 ? 5 : 9); } while (a + b > top(L) || (L === 3 && a + b < 11));
      return [a, b];
    };
    const takePair = L => {
      const a = L === 1 ? R(3, 10) : L === 2 ? R(6, 15) : R(11, 20);
      return [a, R(1, Math.min(L === 1 ? 5 : 9, a - 1))];
    };
    const addHints = (a, b) => ['There will be more, so add.', onStep(Math.max(a, b), Math.min(a, b))];
    const takeHints = (a, b) => ['Some go away, so there are fewer. Take away.', backStep(a, b)];

    const join = L => {
      const [a, b] = addPair(L), g = pick(GOERS);
      return num(`There are ${a} ${g.e}.\n${come(b)}.\nHow many now?`, a + b, addHints(a, b),
        `${a} + ${b} = ${a + b}. Now there are ${a + b}.`,
        { visual: { type: 'objects', groups: [a, b], emoji: g.e } });
    };

    const gets = L => {
      const [a, b] = addPair(L), A = U.name(), t = pick(THINGS);
      return num(`${A} has ${a} ${t.e}.\n${A} gets ${b} more.\nHow many now?`, a + b, addHints(a, b),
        `${a} + ${b} = ${a + b}. ${A} has ${a + b} now.`,
        { visual: { type: 'objects', groups: [a, b], emoji: t.e } });
    };

    const both = L => {
      const [a, b] = addPair(L), [A, B] = two(), t = pick(THINGS);
      return num(`${A} has ${a} ${t.e}.\n${B} has ${b} ${t.e}.\nHow many in all?`, a + b,
        ['In all means put them together. Add.', onStep(Math.max(a, b), Math.min(a, b))],
        `${a} + ${b} = ${a + b}. They have ${a + b} in all.`,
        { visual: { type: 'objects', groups: [a, b], emoji: t.e } });
    };

    const leave = L => {
      const [a, b] = takePair(L), g = pick(GOERS);
      return num(`There are ${a} ${g.e}.\n${b} ${goes(g, b)}.\nHow many are left?`, a - b, takeHints(a, b),
        `${a} ${M} ${b} = ${a - b}. There are ${a - b} left.`,
        { visual: { type: 'objects', groups: [a], emoji: g.e } });
    };

    const eat = L => {
      const [a, b] = takePair(L), A = U.name(), f = pick(FOOD);
      return num(`${A} has ${a} ${f}.\n${A} eats ${b}.\nHow many are left?`, a - b,
        ['Eating some makes fewer. Take away.', backStep(a, b)],
        `${a} ${M} ${b} = ${a - b}. ${A} has ${a - b} left.`,
        { visual: { type: 'objects', groups: [a], emoji: f } });
    };

    const compare = L => {
      let a, b;
      do { [a, b] = distinct(2, 2, top(L)); } while (a - b < 2 || a - b > 9);
      const [A, B] = two(), t = pick(THINGS);
      return num(`${A} has ${a} ${t.e}.\n${B} has ${b} ${t.e}.\nHow many more does ${A} have?`, a - b,
        ['Match them up. Count the extra ones.', `Count on from ${b} to ${a}. Count the jumps.`],
        `${a} ${M} ${b} = ${a - b}. ${A} has ${a - b} more.`,
        { visual: { type: 'objects', groups: [a, b], emoji: t.e } });
    };

    const hiding = L => {
      const c = R(L === 2 ? 6 : 11, top(L)), a = R(Math.max(2, c - 9), c - 2), t = pick(THINGS);
      return num(`There are ${c} ${t.e} in all.\nYou can see ${a}.\nHow many are hiding?`, c - a,
        ['Some are hiding. Count on from the ones you see.', `Start at ${a}. Count on to ${c}. Count the jumps.`],
        `${a} + ${c - a} = ${c}. So ${c - a} are hiding.`,
        { visual: { type: 'objects', groups: [a], emoji: t.e } });
    };

    const which = L => {
      const add = Math.random() < 0.5, g = pick(GOERS), [a, b] = add ? addPair(L) : takePair(L);
      const story = add ? `${a} ${g.e}. ${come(b)}.` : `${a} ${g.e}. ${b} ${goes(g, b)}.`;
      const ans = add ? '➕ add' : '➖ take away';
      return choice(`${story}\nDo you add or take away?`, ans, [add ? '➖ take away' : '➕ add'],
        ['Do more come, or do some go away?', add ? 'More come. Will there be more or fewer?' : 'Some go away. Will there be more or fewer?'],
        add ? `More come, so there are more. You add: ${ans}.` : `Some go away, so there are fewer. You take away: ${ans}.`,
        { visual: { type: 'objects', groups: add ? [a, b] : [a], emoji: g.e } }, 2);
    };

    PMLM.registerSkill({
      id: 'g1.wordProblems', grade: 1, unit: 'g1.u2', title: 'Story problems', icon: '📖',
      blurb: 'Read the story, look at the picture, find the answer',
      lesson: [
        { title: 'Read and look', text: 'Read the story. Look at the picture.\n3 ducks. 2 more come.', visual: { type: 'objects', groups: [3, 2], emoji: '🦆' } },
        { title: 'More come: add', text: 'More come, so **add**.\n3 + 2 = 5 ducks.', visual: { type: 'objects', groups: [5], emoji: '🦆' } },
        { title: 'Some go: take away', text: `Some go away, so **take away**.\n6 frogs. 2 hop away.\n6 ${M} 2 = 4 frogs.`, visual: { type: 'objects', groups: [4, 2], emoji: '🐸' } },
        { title: 'Example', text: 'Leyla has 4 🍓. She gets 3 more. How many now?\n1. More come, so add.\n2. Start at 4. Count on 3: 5, 6, 7.\n3. Leyla has **7** 🍓.', visual: { type: 'objects', groups: [4, 3], emoji: '🍓' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [join, gets, leave, eat],
          [join, both, leave, eat, compare, hiding, which],
          [both, gets, leave, compare, hiding, which],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 3: Shapes and patterns ═══════════════════════
  PMLM.registerUnit({ id: 'g1.u3', grade: 1, name: 'Shapes and patterns', icon: '🔺' });

  /* 13 ── 2D shapes */
  {
    const S2 = {
      circle: { sides: 0, corners: 0, fact: 'is round. It has no corners.' },
      triangle: { sides: 3, corners: 3, fact: 'has 3 straight sides and 3 corners.' },
      square: { sides: 4, corners: 4, fact: 'has 4 sides, all the same length.' },
      rectangle: { sides: 4, corners: 4, fact: 'has 4 sides: 2 long and 2 short.' },
    };
    const draw = s => ({ type: 'shape2d', shape: s === 'triangle' && Math.random() < 0.4 ? 'rightTriangle' : s });
    const WRONG = { circle: ['triangle', 'square', 'rectangle'], triangle: ['square', 'circle', 'rectangle'], square: ['rectangle', 'triangle', 'circle'], rectangle: ['square', 'triangle', 'circle'] };
    const STEP = {
      circle: 'Does it have any corners?',
      triangle: 'Touch each corner as you count them.',
      square: 'It has 4 sides. Are they all the same length?',
      rectangle: 'It has 4 sides. Are they all the same length?',
    };

    const nameIt = L => {
      const s = pick(Object.keys(S2));
      const wrong = s === 'square' || s === 'rectangle' ? [WRONG[s][0], pick(WRONG[s].slice(1))] : U.sample(WRONG[s], 2);
      return choice('What shape is this?', s, wrong,
        ['Count the sides and corners. Are the sides straight or curved?', STEP[s]],
        `It ${S2[s].fact} It is a ${s}.`, { visual: draw(s) }, 3);
    };

    const sides = L => {
      const s = pick(['triangle', 'square', 'rectangle']);
      return num('How many sides?', S2[s].sides,
        ['A side is a straight edge. Count them.', 'Put your finger on one side and say 1. Go round the shape.'],
        `A ${s} has ${S2[s].sides} sides.`, { visual: draw(s) });
    };

    const corners = L => {
      const s = pick(['circle', 'triangle', 'square', 'rectangle']);
      return num('How many corners?', S2[s].corners,
        ['A corner is where two straight sides meet.', 'Touch each corner as you count. Go all the way round.'],
        s === 'circle' ? 'A circle is round. It has no corners. The answer is 0.' : `A ${s} has ${S2[s].corners} corners.`,
        { visual: draw(s) });
    };

    const FACTS = [
      { q: 'Which shape has **3** sides?', a: 'triangle', w: ['square', 'circle', 'rectangle'] },
      { q: 'Which shape has **3** corners?', a: 'triangle', w: ['square', 'rectangle', 'circle'] },
      { q: 'Which shape is **round**?', a: 'circle', w: ['triangle', 'square', 'rectangle'] },
      { q: 'Which shape has **no corners**?', a: 'circle', w: ['triangle', 'square', 'rectangle'] },
      { q: 'Which shape has 4 sides, **all the same length**?', a: 'square', w: ['triangle', 'circle'] },
      { q: 'Which shape has 2 **long** sides and 2 **short** sides?', a: 'rectangle', w: ['square', 'triangle', 'circle'] },
    ];
    const fact = L => {
      const f = pick(FACTS), w = f.a === 'rectangle' ? ['square', pick(['triangle', 'circle'])] : U.sample(f.w, 2);
      return choice(f.q, f.a, w, ['Picture each shape in your head.', `Think of a ${w[0]}. Does it match?`],
        `A ${f.a} ${S2[f.a].fact} The answer is ${f.a}.`, null, 3);
    };

    const EMO = { triangle: '🔺', square: '🟥', circle: '🔴' };
    const TIP = { triangle: 'A triangle has straight sides and pointy corners.', square: 'A square has straight sides, all the same length.', circle: 'A circle is round.' };
    const countEm = L => {
      const target = pick(Object.keys(EMO)), len = R(L === 1 ? 4 : 6, L === 1 ? 6 : 8);
      let items;
      do { items = Array.from({ length: len }, () => pick(Object.keys(EMO))); } while (!items.includes(target) || items.every(x => x === target));
      const n = items.filter(x => x === target).length;
      return num(`How many **${target}s**?\n${items.map(x => EMO[x]).join(' ')}`, n,
        [TIP[target], `Touch each ${EMO[target]} as you count. Skip the other shapes.`],
        `Count only the ${EMO[target]}. There ${n === 1 ? 'is' : 'are'} ${n}.`);
    };

    PMLM.registerSkill({
      id: 'g1.shapes2d', grade: 1, unit: 'g1.u3', title: 'Flat shapes', icon: '🟦',
      blurb: 'Circle, triangle, square and rectangle',
      lesson: [
        { title: 'Circle', text: 'A **circle** is round.\nIt has no corners.', visual: { type: 'shape2d', shape: 'circle' } },
        { title: 'Triangle', text: 'A **triangle** has 3 straight sides.\nIt has 3 corners.', visual: { type: 'shape2d', shape: 'triangle' } },
        { title: 'Square', text: 'A **square** has 4 sides, all the same length.\nIt has 4 corners.', visual: { type: 'shape2d', shape: 'square' } },
        { title: 'Rectangle', text: 'A **rectangle** has 4 sides: 2 long and 2 short.\nIt has 4 corners.', visual: { type: 'shape2d', shape: 'rectangle' } },
        { title: 'Example: what shape?', text: '1. Count the sides: 3.\n2. Count the corners: 3.\n3. It is a **triangle**. Triangles can look different!', visual: { type: 'shape2d', shape: 'rightTriangle' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[nameIt, nameIt, sides, corners, countEm], [nameIt, sides, corners, fact, countEm], [nameIt, corners, fact, fact, countEm]], ctx);
      },
    });
  }

  /* 14 ── 3D shapes */
  {
    const S3 = {
      cube: { fact: 'It has 6 flat faces. They are all squares.', flat: 'square', step: 'Look at the faces. Are they all squares?' },
      cuboid: { fact: 'It has 6 flat faces. Some faces are long.', flat: 'rectangle', step: 'Look at the faces. Are some of them long?' },
      sphere: { fact: 'It is round all over, like a ball.', flat: 'circle', step: 'Does it have any flat faces?' },
      cylinder: { fact: 'It has 2 flat round faces and a curved side.', flat: 'circle', step: 'Look at the ends. Are they flat circles?' },
      cone: { fact: 'It has 1 flat round face and a point.', flat: 'triangle', step: 'Does it come to a point?' },
    };
    const MIX = { cube: 'cuboid', cuboid: 'cube', sphere: 'cylinder', cylinder: 'cone', cone: 'cylinder' };
    const wrongFor = (s, L) => [MIX[s], L === 1 ? pick(Object.keys(S3).filter(x => x !== s && x !== MIX[s])) : S3[s].flat];

    const nameIt = L => {
      const s = pick(Object.keys(S3));
      return choice('What is this solid shape?', s, wrongFor(s, L),
        ['Is it round? Does it have flat faces? Does it have a point?', S3[s].step],
        `${S3[s].fact} It is a ${s}.`, { visual: { type: 'shape3d', shape: s } }, 3);
    };

    const REAL = [
      { e: '⚽', w: 'ball', s: 'sphere' }, { e: '🍊', w: 'orange', s: 'sphere' }, { e: '🎲', w: 'dice', s: 'cube' },
      { e: '📦', w: 'box', s: 'cuboid' }, { e: '🧱', w: 'brick', s: 'cuboid' }, { e: '🥫', w: 'tin', s: 'cylinder' },
      { e: '🥁', w: 'drum', s: 'cylinder' },
    ];
    const real = L => {
      const t = pick(REAL);
      return choice(`What shape is a ${t.w}?\n${t.e}`, t.s, wrongFor(t.s, L),
        ['Think about how it looks all the way round.', S3[t.s].step],
        `A ${t.w} is like a ${t.s}. ${S3[t.s].fact} It is a ${t.s}.`, null, 3);
    };

    const roll = L => {
      const a = pick(['sphere', 'cylinder', 'cone']);
      return choice('Which shape can **roll**?', a, ['cube', 'cuboid'],
        ['Shapes with a curved face can roll.', 'A cube has only flat faces. Can it roll?'],
        `A ${a} has a curved face, so it can roll. Cubes and cuboids only have flat faces. The answer is ${a}.`, null, 3);
    };

    const faces = L => {
      const s = pick(['cube', 'cuboid', 'cylinder', 'cone']);
      const n = { cube: 6, cuboid: 6, cylinder: 2, cone: 1 }[s];
      const box = s === 'cube' || s === 'cuboid';
      const hints = box ? ['A face is a flat side. Some faces are hidden at the back.', 'You can see 3 faces. The same number are hidden at the back.']
        : s === 'cylinder' ? ['A flat face is flat, not curved.', 'There is a flat face on top. Look at the bottom too.']
          : ['A flat face is flat, not curved.', 'The top is a point, not a face. Look at the bottom.'];
      const explain = box ? `A ${s} has a top, a bottom, a front, a back and 2 sides: ${n} faces.`
        : s === 'cylinder' ? 'The top and the bottom are flat: 2 flat faces.' : 'Only the bottom is flat: 1 flat face.';
      return num(box ? `How many faces does a ${s} have?` : `How many **flat** faces does a ${s} have?`, n, hints, explain,
        { visual: { type: 'shape3d', shape: s } });
    };

    PMLM.registerSkill({
      id: 'g1.shapes3d', grade: 1, unit: 'g1.u3', title: 'Solid shapes', icon: '🧊',
      blurb: 'Cube, cuboid, sphere, cylinder and cone',
      lesson: [
        { title: 'Cube', text: 'Solid shapes are not flat. You can hold them.\nA **cube** is like a dice 🎲. Its faces are all squares.', visual: { type: 'shape3d', shape: 'cube' } },
        { title: 'Cuboid', text: 'A **cuboid** is like a box 📦.\nSome of its faces are long.', visual: { type: 'shape3d', shape: 'cuboid' } },
        { title: 'Sphere', text: 'A **sphere** is round like a ball ⚽.\nIt can roll.', visual: { type: 'shape3d', shape: 'sphere' } },
        { title: 'Cone', text: 'A **cone** has a point and 1 flat round face.\nLike an ice cream cone 🍦.', visual: { type: 'shape3d', shape: 'cone' } },
        { title: 'Example: a tin 🥫', text: 'What shape is a tin?\n1. It has 2 flat round faces.\n2. It has a curved side, so it can roll.\n3. It is a **cylinder**.', visual: { type: 'shape3d', shape: 'cylinder' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[nameIt, nameIt, real], [nameIt, real, roll], [nameIt, real, roll, faces]], ctx);
      },
    });
  }

  /* 15 ── Repeating patterns */
  {
    const SETS = [['🔴', '🔵', '🟡', '🟢'], ['🐶', '🐱', '🐭', '🐰'], ['🍎', '🍌', '🍇', '🍓'], ['⭐', '❤️', '🔺', '🟦'], ['☀️', '🌙', '☁️', '🌈']];
    const CODES = { 1: ['AB'], 2: ['AAB', 'ABB', 'ABC'], 3: ['AABB', 'ABBC', 'ABC', 'AAB'] };
    const make = L => {
      const set = U.shuffle(pick(SETS)), map = { A: set[0], B: set[1], C: set[2] };
      const unit = [...pick(CODES[L])].map(c => map[c]);
      return { unit, spare: set.find(x => !unit.includes(x)) };
    };
    const hintsFor = unit => ['Find the part that repeats.', `The part that repeats is ${unit.join(' ')}.`];

    const next = L => {
      const { unit, spare } = make(L), len = unit.length;
      const shown = L === 1 ? R(4, 7) : R(len === 4 ? 7 : 6, 8);   // at most 8 + ❓, so the row fits on a phone
      const seq = Array.from({ length: shown }, (_, i) => unit[i % len]), ans = unit[shown % len];
      const last = seq[shown - 1];
      return choice(`What comes next?\n${seq.join(' ')} ❓`, ans, [last, ...unit, spare], hintsFor(unit),
        `The pattern goes ${unit.join(' ')} again and again. Next is ${ans}.`, null, 3);
    };

    const gap = L => {
      const { unit, spare } = make(L), len = unit.length, shown = L === 1 ? R(4, 6) : 2 * len;
      const seq = Array.from({ length: shown }, (_, i) => unit[i % len]), j = R(1, shown - 2), ans = seq[j];
      return choice(`What is missing?\n${seq.map((x, i) => (i === j ? '❓' : x)).join(' ')}`, ans, [...unit, spare], hintsFor(unit),
        `The pattern goes ${unit.join(' ')} again and again. The missing one is ${ans}.`, null, 3);
    };

    const part = L => {
      const { unit, spare } = make(L), len = unit.length;
      const seq = Array.from({ length: 2 * len }, (_, i) => unit[i % len]);
      const right = unit.join(' ');
      const wrongs = [[...unit, unit[0]].join(' '), unit.slice(0, len - 1).join(' '), [...unit.slice(0, len - 1), spare].join(' ')];
      return choice(`Which part repeats?\n${seq.join(' ')}`, right, wrongs,
        ['Look at the start. Where does it begin again?', `It starts with ${unit[0]}. Find where ${unit[0]} ${unit[1] === unit[0] ? unit[0] + ' ' : ''}comes back.`],
        `${right} comes again and again. The part that repeats is ${right}.`, null, 3);
    };

    PMLM.registerSkill({
      id: 'g1.patterns', grade: 1, unit: 'g1.u3', title: 'Patterns', icon: '🔁',
      blurb: 'Find what comes next in a pattern',
      lesson: [
        { title: 'A pattern repeats', text: 'A pattern goes **again and again**.\nRed, blue, red, blue …', visual: { type: 'sequence', terms: ['🔴', '🔵', '🔴', '🔵', '🔴', '🔵'] } },
        { title: 'The part that repeats', text: '🍎 🍌 🍌 is the part that repeats.\nThen it starts again.', visual: { type: 'sequence', terms: ['🍎', '🍌', '🍌', '🍎', '🍌', '🍌'] } },
        { title: 'Say it out loud', text: 'Say the pattern: dog, cat, dog, cat …\nYou can hear what comes next!', visual: { type: 'sequence', terms: ['🐶', '🐱', '🐶', '🐱'] } },
        { title: 'Example: what comes next?', text: '1. The part that repeats is 🐶 🐱.\n2. The last one is 🐶.\n3. After 🐶 comes **🐱**.', visual: { type: 'sequence', terms: ['🐶', '🐱', '🐶', '🐱', '🐶', '?'] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[next, next, gap], [next, gap, part], [next, gap, part]], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 4: Measure, time, money ═══════════════════════
  PMLM.registerUnit({ id: 'g1.u4', grade: 1, name: 'Measure, time, money', icon: '⏰' });

  /* 16 ── Comparing length and mass */
  {
    const LONG = [
      { e: '🐍', w: 'snake' }, { e: '🐛', w: 'worm' }, { e: '✏️', w: 'pencil' }, { e: '🖍️', w: 'crayon' },
      { e: '🚂', w: 'train' }, { e: '🎀', w: 'ribbon' }, { e: '🥖', w: 'bread' },
    ];
    const lab = t => `${t.e} ${t.w}`;
    const maxP = L => (L === 1 ? 8 : L === 2 ? 10 : 12);
    const bars = list => ({ type: 'barModel', rows: list.map(([t, n]) => ({ label: lab(t), parts: n })) });

    const twoBars = L => {
      const [t1, t2] = U.sample(LONG, 2), [a, b] = distinct(2, 2, maxP(L)), longer = Math.random() < 0.5;
      const ans = (longer ? a > b : a < b) ? t1 : t2, other = ans === t1 ? t2 : t1, word = longer ? 'longer' : 'shorter';
      return choice(`Which is **${word}**?`, lab(ans), [lab(other)],
        ['They start at the same place. Look at where they end.', `Count the cubes. The ${t1.w} is ${a} cubes long.`],
        `The ${t1.w} is ${a} cubes. The ${t2.w} is ${b} cubes. The ${word} one is ${lab(ans)}.`,
        { visual: bars([[t1, a], [t2, b]]) }, 2);
    };

    const threeBars = L => {
      const ts = U.sample(LONG, 3), ns = distinct(3, 2, maxP(L)), longest = Math.random() < 0.5;
      const k = ns.indexOf(longest ? Math.max(...ns) : Math.min(...ns)), ans = ts[k], word = longest ? 'longest' : 'shortest';
      return choice(`Which is the **${word}**?`, lab(ans), ts.filter(t => t !== ans).map(lab),
        ['They all start at the same place. Look at where they end.', `Count the cubes. The ${ts[0].w} is ${ns[0]} cubes long.`],
        `${ts.map((t, i) => `${lab(t)}: ${ns[i]} cubes`).join('. ')}. The ${word} is ${lab(ans)}.`,
        { visual: bars(ts.map((t, i) => [t, ns[i]])) }, 3);
    };

    const howLong = L => {
      const t = pick(LONG), n = R(4, maxP(L));
      return num(`How many cubes long is the ${t.e}?`, n,
        ['Count the cubes from one end to the other.', 'Touch each cube as you count: 1, 2, 3 …'],
        `Count the cubes: 1, 2, 3 … ${n}. The ${t.w} is ${n} cubes long.`,
        { visual: bars([[t, n]]), unit: 'cubes' });
    };

    const diff = L => {
      const [t1, t2] = U.sample(LONG, 2);
      let a, b;
      do { [a, b] = distinct(2, 2, maxP(L)); } while (a - b < 2);
      return num(`How many cubes longer is the ${t1.e} than the ${t2.e}?`, a - b,
        ['Look at the cubes that stick out at the end.', `The ${t2.w} is ${b} cubes. Count on from ${b} to ${a}.`],
        `${a} ${M} ${b} = ${a - b}. The ${t1.w} is ${a - b} cubes longer.`,
        { visual: bars([[t1, a], [t2, b]]), unit: 'cubes' });
    };

    const HEAVY = [
      ['🐘 elephant', '🐭 mouse'], ['🚗 car', '🚲 bike'], ['🍉 melon', '🍇 grape'], ['🐴 horse', '🐱 cat'],
      ['🚌 bus', '⚽ ball'], ['📚 book', '🍃 leaf'], ['🐻 bear', '🐝 bee'],
    ];
    const heavier = L => {
      const [h, l] = pick(HEAVY), heavy = Math.random() < 0.5, ans = heavy ? h : l, word = heavy ? 'heavier' : 'lighter';
      const nm = s => s.split(' ')[1];
      return choice(`Which is **${word}**?`, ans, [heavy ? l : h],
        [heavy ? 'Heavier means it weighs more.' : 'Lighter means it weighs less.', 'Think: which one would be harder to lift?'],
        `The ${nm(h)} is heavier than the ${nm(l)}. The ${word} one is ${ans}.`, null, 2);
    };

    const PEAR = ['🍐', '🍎', '🧸', '🍌', '🥕'];
    const balanceCount = L => {
      const it = pick(PEAR), k = R(2, 5);
      return num(`The scales balance.\nHow many 🧱 weigh the same as 1 ${it}?`, k,
        ['When the scales balance, both sides weigh the same.', `The ${it} is on one side. Count the 🧱 on the other side.`],
        `The ${it} balances ${k} 🧱. The answer is ${k}.`,
        { visual: { type: 'balance', left: it, right: '🧱'.repeat(k) } });
    };

    const BIGSMALL = [['🍍', '🍎'], ['🍉', '🍊'], ['🎃', '🍐'], ['🧸', '🍪'], ['📚', '✏️']];
    const reason = L => {
      const [big, small] = pick(BIGSMALL), k = R(2, 5), heavy = Math.random() < 0.5;
      const ans = heavy ? `1 ${big}` : `1 ${small}`;
      return choice(`1 ${big} weighs the same as ${k} ${small}.\nWhich is **${heavy ? 'heavier' : 'lighter'}**?`, ans, [heavy ? `1 ${small}` : `1 ${big}`],
        ['Look at the scales. One side has 1 thing. The other side has lots.', `You need ${k} ${small} to balance 1 ${big}. Is 1 ${small} enough?`],
        `It takes ${k} ${small} to balance 1 ${big}. So 1 ${big} is heavier than 1 ${small}. The answer is ${ans}.`,
        { visual: { type: 'balance', left: big, right: small.repeat(k) } }, 2);
    };

    PMLM.registerSkill({
      id: 'g1.measure', grade: 1, unit: 'g1.u4', title: 'Long and heavy', icon: '📏',
      blurb: 'Longer or shorter? Heavier or lighter?',
      lesson: [
        { title: 'Longer and shorter', text: 'Start them at the same place.\nThe **longer** one goes further. The other is **shorter**.', visual: bars([[LONG[2], 7], [LONG[3], 4]]) },
        { title: 'Measure with cubes', text: 'Count the cubes.\nThe pencil is 7 cubes long.', visual: bars([[LONG[2], 7]]) },
        { title: 'Heavier and lighter', text: 'A **heavier** thing is harder to lift.\n🐘 is heavier than 🐭. 🐭 is **lighter**.'},
        { title: 'Balance scales', text: 'When the scales are level, both sides weigh **the same**.\n1 🍍 weighs the same as 3 🍎.', visual: { type: 'balance', left: '🍍', right: '🍎🍎🍎' } },
        { title: 'Example: which is longer?', text: '1. They start at the same place.\n2. The snake is 9 cubes. The worm is 5 cubes.\n3. 9 is more than 5. The **snake** is longer.', visual: bars([[LONG[0], 9], [LONG[1], 5]]) },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [twoBars, twoBars, heavier, howLong],
          [twoBars, threeBars, heavier, howLong, balanceCount],
          [twoBars, threeBars, diff, heavier, reason, balanceCount],
        ], ctx);
      },
    });
  }

  /* 17 ── Time: o'clock and half past */
  {
    const nx = h => (h % 12) + 1;
    const pv = h => ((h + 10) % 12) + 1;
    const oc = h => `${h} o'clock`;
    const hp = h => `half past ${h}`;
    const dg = (h, half) => `${h}:${half ? '30' : '00'}`;
    const NUDGE = "The long hand shows o'clock or half past. The short hand shows the hour.";
    const STEP_OC = "The long hand points to 12, so it is o'clock. Now look at the short hand.";
    const STEP_HP = 'The long hand points to 6, so it is half past. Which number has the short hand just gone past?';

    const read = L => {
      const h = R(1, 12), half = Math.random() < (L === 1 ? 0.35 : 0.5);
      if (!half) {
        return choice('What time is it?', oc(h), [h === 12 ? oc(1) : oc(12), hp(h), oc(nx(h))], [NUDGE, STEP_OC],
          `The long hand is on 12. The short hand is on ${h}. It is ${oc(h)}.`, { visual: { type: 'clock', h, m: 0 } }, 3);
      }
      return choice('What time is it?', hp(h), [hp(nx(h)), oc(6), oc(h)], [NUDGE, STEP_HP],
        `The long hand is on 6. The short hand is just past ${h}. It is ${hp(h)}.`, { visual: { type: 'clock', h, m: 30 } }, 3);
    };

    const digital = L => {
      const h = R(1, 12), half = Math.random() < 0.5;
      const wrongs = half ? [dg(nx(h), true), dg(h, false)] : [dg(h, true), h === 12 ? dg(1, false) : dg(12, false)];
      return choice('What time is it?', dg(h, half), wrongs,
        [`On a digital clock, :00 means o'clock and :30 means half past.`, half ? STEP_HP : STEP_OC],
        half ? `The long hand is on 6, so it is half past ${h}. That is ${dg(h, true)}.` : `The long hand is on 12, so it is ${oc(h)}. That is ${dg(h, false)}.`,
        { visual: { type: 'clock', h, m: half ? 30 : 0 } }, 3);
    };

    const hand = L => {
      const h = pick([1, 2, 3, 4, 5, 7, 8, 9, 10, 11]), r = Math.random();
      if (r < 0.35) {
        return choice(`At ${oc(h)}, where does the **long** hand point?`, 'to 12', ['to 6', `to ${h}`],
          [NUDGE, "Think: is it o'clock or half past? That tells you where the long hand goes."],
          `At ${oc(h)} the long hand points to 12 and the short hand points to ${h}. The answer is to 12.`, null, 3);
      }
      if (r < 0.7) {
        return choice(`At ${oc(h)}, where does the **short** hand point?`, `to ${h}`, ['to 12', `to ${nx(h)}`, `to ${pv(h)}`],
          ['The short hand shows the hour.', `The time is ${oc(h)}. Which number is the hour?`],
          `At ${oc(h)} the short hand points to ${h}. The answer is to ${h}.`, null, 3);
      }
      return choice(`At ${hp(h)}, where does the **long** hand point?`, 'to 6', ['to 12', `to ${h}`],
        [NUDGE, 'Half past means the long hand has gone half way round the clock.'],
        `At ${hp(h)} the long hand points to 6. The answer is to 6.`, null, 3);
    };

    const later = L => {
      const h = R(1, 12);
      if (Math.random() < 0.5) {
        return choice(`It is ${oc(h)}.\nWhat time is it **1 hour later**?`, oc(nx(h)), [oc(pv(h)), hp(h)],
          ['1 hour later, the short hand moves on to the next number.', `The short hand is on ${h}. Move it on 1 number.`],
          `1 hour after ${oc(h)} is ${oc(nx(h))}.`, { visual: { type: 'clock', h, m: 0 } }, 3);
      }
      return choice(`It is ${oc(h)}.\nWhat time is it **half an hour later**?`, hp(h), [hp(nx(h)), oc(nx(h))],
        ['In half an hour, the long hand goes half way round, from 12 to 6.', 'The long hand moves to 6. Where is the short hand now?'],
        `Half an hour after ${oc(h)}, the long hand is on 6 and the short hand is just past ${h}. It is ${hp(h)}.`,
        { visual: { type: 'clock', h, m: 0 } }, 3);
    };

    PMLM.registerSkill({
      id: 'g1.time', grade: 1, unit: 'g1.u4', title: 'Telling the time', icon: '🕒',
      blurb: "Read o'clock and half past on a clock",
      lesson: [
        { title: 'Two hands', text: 'A clock has a **short** hand and a **long** hand.\nThe short hand shows the hour.', visual: { type: 'clock', h: 3, m: 0 } },
        { title: "O'clock", text: "When the long hand points to **12**, it is **o'clock**.\nThis is 5 o'clock.", visual: { type: 'clock', h: 5, m: 0 } },
        { title: 'Half past', text: 'When the long hand points to **6**, it is **half past**.\nThe short hand is half way to the next number. This is half past 2.', visual: { type: 'clock', h: 2, m: 30 } },
        { title: 'Digital clocks', text: "A digital clock shows only numbers.\n:00 means o'clock. :30 means half past.", visual: { type: 'table', headers: ['Digital', 'We say'], rows: [['5:00', "5 o'clock"], ['2:30', 'half past 2']] } },
        { title: 'Example: what time?', text: '1. The long hand points to 6. That means **half past**.\n2. The short hand is just past 7.\n3. It is **half past 7**.', visual: { type: 'clock', h: 7, m: 30 } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[read, read, read], [read, read, digital, hand], [read, digital, hand, later]], ctx);
      },
    });
  }

  /* 18 ── Money: coins and adding small amounts */
  {
    const SET = { 1: [1, 2, 5], 2: [1, 2, 5, 10], 3: [1, 2, 5, 10] };
    const coinsOf = x => { const out = []; for (const c of [10, 5, 2, 1]) while (x >= c) { out.push(c); x -= c; } return out; };

    const count = (L, ctx) => {
      const cur = ctx.currency, k = R(2, L === 1 ? 3 : L === 2 ? 4 : 5);
      let v;
      do { v = Array.from({ length: k }, () => pick(SET[L])); } while (sum(v) > top(L) || (L === 3 && sum(v) < 11));
      v.sort((a, b) => b - a);
      const s = sum(v);
      return num('How much money?', s,
        ['Start with the biggest. Then count on the rest.', `Start at ${v[0]}. Then count on ${v[1]}.`],
        `${v.join(' + ')} = ${s}. There is ${cur}${s}.`,
        { visual: { type: 'coins', values: L === 3 ? U.shuffle(v) : v }, prefix: cur });
    };

    const worth = (L, ctx) => {
      const cur = ctx.currency, vals = U.sample(L === 1 ? [1, 2, 5] : [1, 2, 5, 10, 20], 3), most = Math.random() < 0.6;
      const ans = most ? Math.max(...vals) : Math.min(...vals), others = vals.filter(x => x !== ans);
      return choice(`Which is worth the **${most ? 'most' : 'least'}**?`, cur + ans, others.map(x => cur + x),
        ['Look at the number on each one.', `${cur}${others[0]} or ${cur}${others[1]}: which number is ${most ? 'bigger' : 'smaller'}? Now check the last one.`],
        `${ans} is the ${most ? 'biggest' : 'smallest'} number. The answer is ${cur}${ans}.`,
        { visual: { type: 'coins', values: U.shuffle(vals) } }, 3);
    };

    const who = (L, ctx) => {
      const cur = ctx.currency, [A, B] = two(), big = pick([5, 10]), small = pick([1, 2]);
      let k;
      do { k = R(3, 5); } while (k * small === big);
      const bTot = k * small, ans = big > bTot ? A : B;
      return choice(`${A} has: ${cur}${big}\n${B} has: ${Array(k).fill(cur + small).join(' ')}\nWho has **more** money?`, ans, [ans === A ? B : A],
        ['Add up the money. Do not just count the coins.', `${B} has ${k} coins of ${small}. Count them: ${small}, ${2 * small}, …`],
        `${A} has ${cur}${big}. ${B} has ${cur}${bTot}. ${Math.max(big, bTot)} is more, so the answer is ${ans}.`, null, 2);
    };

    const spend = (L, ctx) => {
      const cur = ctx.currency, a = L === 2 ? R(5, 10) : R(10, 20), b = R(2, Math.min(9, a - 1));
      return num(`You have ${cur}${a}.\nYou spend ${cur}${b}.\nHow much is left?`, a - b,
        ['Spend means take away.', b > a - b ? `${b} is close to ${a}. Count on from ${b} to ${a} and count the jumps.` : `Count back ${b} from ${a}. The first jump back is ${a - 1}.`],
        `${a} ${M} ${b} = ${a - b}. You have ${cur}${a - b} left.`,
        { visual: { type: 'coins', values: coinsOf(a) }, prefix: cur });
    };

    const ITEMS = ['🍎', '🍌', '🧃', '🍭', '🖍️', '🎈', '🍪'];
    const buy = (L, ctx) => {
      const cur = ctx.currency, [i1, i2] = U.sample(ITEMS, 2);
      let p1, p2;
      do { p1 = R(1, 9); p2 = R(1, 9); } while (p1 + p2 > top(L) || (L === 3 && p1 + p2 < 10));
      return num(`How much for ${i1} and ${i2}?`, p1 + p2,
        ['Add the two prices.', onStep(Math.max(p1, p2), Math.min(p1, p2))],
        `${p1} + ${p2} = ${p1 + p2}. Both cost ${cur}${p1 + p2}.`,
        { visual: { type: 'table', headers: [i1, i2], rows: [[cur + p1, cur + p2]] }, prefix: cur });
    };

    const make = (L, ctx) => {
      const cur = ctx.currency, t = R(4, 9);
      const combo = target => {
        for (let i = 0; i < 300; i++) {
          const c = Array.from({ length: R(2, 3) }, () => pick([1, 2, 5]));
          if (sum(c) === target) return c.sort((a, b) => b - a);
        }
        return null;
      };
      const right = combo(t), w1 = combo(t + 1), w2 = combo(t - 1);
      if (!right || !w1 || !w2) return count(L, ctx);
      const S = c => c.map(x => cur + x).join(' + ');
      return choice(`Which coins make **${cur}${t}**?`, S(right), [S(w1), S(w2)],
        ['Add up the coins in each answer.', `Try ${S(w1)}: that makes ${t + 1}. Too much!`],
        `${right.join(' + ')} = ${t}. The answer is ${S(right)}.`,
        { visual: { type: 'coins', values: right.concat(w1, w2).filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a - b) } }, 3);
    };

    const twos = (L, ctx) => {
      const cur = ctx.currency, k = R(4, L === 2 ? 7 : 10);
      return num('How much money?\nCount in 2s.', 2 * k,
        ['Each coin is 2. Count in 2s.', 'Say 2, then 4, then 6 … one number for each coin.'],
        `Count in 2s: ${Array.from({ length: k }, (_, i) => 2 * (i + 1)).join(', ')}. There is ${cur}${2 * k}.`,
        { visual: { type: 'coins', values: Array(k).fill(2) }, prefix: cur });
    };

    PMLM.registerSkill({
      id: 'g1.money', grade: 1, unit: 'g1.u4', title: 'Money', icon: '🪙',
      blurb: 'Know coins and notes, and add small amounts',
      lesson: [
        { title: 'Coins and notes', text: 'We pay with coins and notes.\nThe number shows what each one is worth.', visual: { type: 'coins', values: [1, 2, 5, 10] } },
        { title: 'Look at the number', text: 'One 10 is worth more than three 1s.\nLook at the number, not how many there are.', visual: { type: 'coins', values: [10, 1, 1, 1] } },
        { title: 'Count the money', text: 'Start with the biggest. Then count on.\n5, then 6, 7. That is 7.', visual: { type: 'coins', values: [5, 1, 1] } },
        { title: 'Example: how much?', text: '1. Start with the biggest: 10.\n2. Count on 2: 12.\n3. Count on 2 more: 14.\n4. There is **14**.', visual: { type: 'coins', values: [10, 2, 2] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[count, count, worth, buy], [count, worth, who, spend, buy, twos], [count, who, spend, buy, make, twos]], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 5: Halves and charts ═══════════════════════
  PMLM.registerUnit({ id: 'g1.u5', grade: 1, name: 'Halves and charts', icon: '📊' });

  /* 19 ── Halves of shapes and of small even numbers */
  {
    const pie = (p, s) => ({ type: 'pie', pies: [{ parts: p, shaded: s }] });
    const bar = (p, s) => ({ type: 'fractionBar', bars: [{ parts: p, shaded: s }] });
    const halfPics = L => {
      const yes = [[2, 1], [2, 1]], no = [[3, 1], [4, 1]];
      if (L >= 2) no.push([2, 2], [3, 2]);
      if (L === 3) yes.push([4, 2]);
      return { yes, no };
    };

    const isHalf = L => {
      const { yes, no } = halfPics(L), ok = Math.random() < 0.5, [p, s] = pick(ok ? yes : no), v = Math.random() < 0.5 ? pie(p, s) : bar(p, s);
      let explain;
      if (p === 2 && s === 1) explain = 'There are 2 parts the same size. 1 is coloured. That is half: Yes.';
      else if (p === 4 && s === 2) explain = '2 of the 4 same-size parts are coloured. That is the same as half: Yes.';
      else if (p === 2 && s === 2) explain = 'Both parts are coloured. That is the whole, not half: No.';
      else explain = `There are ${p} parts, not 2. So it is not half: No.`;
      return yesNo('Is **half** coloured?', ok,
        ['Half means 1 of 2 parts the same size.', `Count the parts. There are ${p}.`], explain, { visual: v });
    };

    const howMuch = L => {
      const whole = Math.random() < 0.5, v = Math.random() < 0.5 ? pie(2, whole ? 2 : 1) : bar(2, whole ? 2 : 1);
      return choice('How much is coloured?', whole ? 'the whole' : 'a half', [whole ? 'a half' : 'the whole'],
        ['A half is 1 of 2 parts the same size.', 'Count the parts. Then count the coloured parts.'],
        whole ? 'Both parts are coloured. That is the whole.' : '1 of the 2 same-size parts is coloured. That is a half.',
        { visual: v }, 2);
    };

    const halfSet = L => {
      const h = R(2, L === 1 ? 5 : L === 2 ? 7 : 10), n = 2 * h, t = pick(THINGS);
      return num(`Half of ${n} ${t.e} = □`, h,
        ['Half means 2 groups the same. Share them out one by one.', `Make 2 groups. Give 1 to each group.${n - 2 !== h ? ` Now ${n - 2} are left.` : ''} Keep sharing until none are left.`],
        `Share ${n} into 2 groups the same. Each group has ${h}. Half of ${n} is ${h}.`,
        { visual: { type: 'objects', groups: [n], emoji: t.e } });
    };

    const fair = L => {
      const eq = Math.random() < 0.5, h = R(2, L === 1 ? 5 : 8);
      const [a, b] = eq ? [h, h] : U.shuffle([h, h + pick([1, 2])]);
      return yesNo('Are the 2 groups **halves**?', eq,
        ['Halves must be the same size.', `Count each group. The first group has ${a}.`],
        eq ? `Both groups have ${a}. They are the same, so they are halves: Yes.` : `One group has ${a} and one has ${b}. They are not the same: No.`,
        { visual: { type: 'objects', groups: [a, b], emoji: pick(THINGS).e } });
    };

    const share = L => {
      const h = R(2, L === 2 ? 7 : 10), n = 2 * h, [A, B] = two(), t = pick(THINGS);
      return num(`${A} and ${B} share ${n} ${t.e}.\nThey get the same.\nHow many each?`, h,
        ['Sharing into 2 the same is finding half.', `Give 1 to ${A} and 1 to ${B}.${n - 2 !== h ? ` Now ${n - 2} are left.` : ''} Keep sharing until none are left.`],
        `Half of ${n} is ${h}. They get ${h} each.`,
        { visual: { type: 'objects', groups: [n], emoji: t.e } });
    };

    const twoHalves = L => num('How many halves make 1 whole?', 2,
      ['Look at the picture. Count the parts.', 'Each part is a half. Count the halves.'],
      'A whole cut into halves has 2 parts. 2 halves make 1 whole.',
      { visual: Math.random() < 0.5 ? pie(2, 1) : bar(2, 1) });

    const whole = L => {
      const h = R(2, 10);
      return num(`Half of a number is ${h}.\nWhat is the number?`, 2 * h,
        ['2 halves make the whole.', `The whole is ${h} + ${h}.`],
        `${h} + ${h} = ${2 * h}. The number is ${2 * h}.`,
        { visual: { type: 'bond', whole: '?', parts: [h, h] } });
    };

    PMLM.registerSkill({
      id: 'g1.halves', grade: 1, unit: 'g1.u5', title: 'Halves', icon: '🍕',
      blurb: 'Two parts the same size. Half of a group.',
      lesson: [
        { title: 'A half', text: 'Cut a whole into 2 parts **the same size**.\nEach part is a **half**.', visual: pie(2, 1) },
        { title: '2 halves make a whole', text: 'Half is 1 of the 2 parts.\nBoth parts together make the **whole**.', visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: 'a half' }, { parts: 2, shaded: 2, label: 'a whole' }] } },
        { title: 'Half of a group', text: 'Share into 2 groups the same.\nHalf of 6 is 3.', visual: { type: 'objects', groups: [3, 3], emoji: '🍓' } },
        { title: 'Not halves', text: 'These 2 groups are not the same.\n4 and 2 are **not** halves of 6.', visual: { type: 'objects', groups: [4, 2], emoji: '🍓' } },
        { title: 'Example: half of 10', text: '1. Make 2 groups.\n2. Share the 10 biscuits one by one.\n3. Each group gets 5. Half of 10 is **5**.', visual: { type: 'objects', groups: [5, 5], emoji: '🍪' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[isHalf, howMuch, halfSet, fair, twoHalves], [isHalf, halfSet, fair, share], [isHalf, halfSet, share, whole]], ctx);
      },
    });
  }

  /* 20 ── Pictograms and tally charts */
  {
    const TOPICS = [
      { title: 'Fruit we like', rows: ['🍎 apple', '🍌 banana', '🍇 grapes', '🍐 pear'] },
      { title: 'Pets we like', rows: ['🐶 dog', '🐱 cat', '🐟 fish', '🐰 rabbit'] },
      { title: 'Colours we like', rows: ['🔴 red', '🔵 blue', '🟢 green', '🟡 yellow'] },
      { title: 'Toys we like', rows: ['⚽ ball', '🧸 teddy', '🚗 car', '🎈 balloon'] },
    ];
    const icon = label => label.split(' ')[0];
    const makeData = L => {
      const t = pick(TOPICS), k = L === 3 ? pick([3, 4]) : 3;
      const counts = distinct(k, L === 1 ? 1 : 2, L === 1 ? 6 : L === 2 ? 9 : 12);
      return { title: t.title, rows: U.sample(t.rows, k).map((label, i) => ({ label, count: counts[i] })) };
    };
    const picto = d => ({ type: 'pictogram', rows: d.rows, symbol: '🙂', per: 1, title: d.title });
    const tally = d => ({ type: 'tally', rows: d.rows });
    const tallyHint = c => (c >= 10 ? 'Each bundle is 5. Count the bundles: 5, 10. Then count on the lines.'
      : c >= 5 ? 'The bundle is 5. Count on the lines after it.' : 'Touch each line as you count.');
    const tallyExplain = c => {
      const b = Math.floor(c / 5), r = c % 5;
      if (!b) return `Count the lines: ${upList(0, c)}. The answer is ${c}.`;
      const fives = Array.from({ length: b }, (_, i) => 5 * (i + 1)).join(', ');
      return r ? `Count the bundles in 5s: ${fives}. Then count on ${r}: ${upList(5 * b, r)}. The answer is ${c}.` : `Count the bundles in 5s: ${fives}. The answer is ${c}.`;
    };

    const readPicto = L => {
      const d = makeData(L), r = pick(d.rows), ic = icon(r.label);
      return num(`How many like ${ic}?`, r.count,
        ['Find the row. Count the pictures in it.', `Find the ${ic} row. Touch each 🙂 as you count.`],
        `Count the 🙂 in the ${ic} row: ${upList(0, r.count)}. The answer is ${r.count}.`,
        { visual: picto(d) });
    };

    const readTally = L => {
      // ask about a row that is not exactly 5 or 10, so "a bundle is 5" is not the whole answer
      const d = makeData(L), pool = d.rows.filter(x => x.count % 5), r = pick(pool.length ? pool : d.rows), ic = icon(r.label);
      return num(`How many like ${ic}?`, r.count,
        ['Each line is 1. A bundle of 5 has a line across it.', `Find the ${ic} row. ${tallyHint(r.count)}`],
        tallyExplain(r.count), { visual: tally(d) });
    };

    const most = L => {
      const d = makeData(L), isMost = Math.random() < 0.5, useTally = Math.random() < 0.4;
      const sorted = [...d.rows].sort((a, b) => b.count - a.count), ans = isMost ? sorted[0] : sorted[sorted.length - 1];
      return choice(`Which has the **${isMost ? 'most' : 'fewest'}**?`, ans.label, d.rows.filter(r => r !== ans).map(r => r.label),
        [isMost ? 'Most means the biggest number.' : 'Fewest means the smallest number.', `Count each row. ${icon(d.rows[0].label)} has ${d.rows[0].count}.`],
        `${d.rows.map(r => `${icon(r.label)} ${r.count}`).join(', ')}. The answer is ${ans.label}.`,
        { visual: useTally ? tally(d) : picto(d) }, d.rows.length);
    };

    const whichHas = L => {
      const d = makeData(L), r = pick(d.rows);
      return choice(`Which row has **${r.count}**?`, r.label, d.rows.filter(x => x !== r).map(x => x.label),
        ['Count the pictures in each row.', `Start with the top row: ${icon(d.rows[0].label)}. Count its 🙂.`],
        `The ${icon(r.label)} row has ${r.count}. The answer is ${r.label}.`, { visual: picto(d) }, d.rows.length);
    };

    const diff = L => {
      const d = makeData(L), [r1, r2] = U.sample(d.rows, 2), [a, b] = r1.count > r2.count ? [r1, r2] : [r2, r1];
      return num(`How many more like ${icon(a.label)} than ${icon(b.label)}?`, a.count - b.count,
        ['Find both numbers. How many extra are there?', `${icon(a.label)} has ${a.count}. ${icon(b.label)} has ${b.count}. Count on from ${b.count} to ${a.count}.`],
        `${a.count} ${M} ${b.count} = ${a.count - b.count}.`,
        { visual: Math.random() < 0.5 ? picto(d) : tally(d) });
    };

    const total = L => {
      let d, r1, r2;
      do { d = makeData(L); [r1, r2] = U.sample(d.rows, 2); } while (r1.count + r2.count > 20);
      return num(`${icon(r1.label)} and ${icon(r2.label)}: how many in all?`, r1.count + r2.count,
        ['Find both numbers. Then add them.', `${icon(r1.label)} has ${r1.count}. ${icon(r2.label)} has ${r2.count}. Now add.`],
        `${r1.count} + ${r2.count} = ${r1.count + r2.count}.`,
        { visual: Math.random() < 0.5 ? picto(d) : tally(d) });
    };

    PMLM.registerSkill({
      id: 'g1.data', grade: 1, unit: 'g1.u5', title: 'Pictograms and tallies', icon: '📊',
      blurb: 'Read pictograms and tally charts',
      lesson: [
        { title: 'A pictogram', text: 'A pictogram uses pictures to show how many.\nEach 🙂 is one child.', visual: { type: 'pictogram', rows: [{ label: '🐶 dog', count: 4 }, { label: '🐱 cat', count: 2 }], symbol: '🙂', per: 1, title: 'Pets we like' } },
        { title: 'Read a row', text: 'Count the pictures in a row.\n4 children like dogs. 2 like cats.', visual: { type: 'pictogram', rows: [{ label: '🐶 dog', count: 4 }, { label: '🐱 cat', count: 2 }], symbol: '🙂', per: 1, title: 'Pets we like' } },
        { title: 'Tally marks', text: 'Each line is 1.\nThe 5th line goes across the other 4. A bundle is 5.', visual: { type: 'tally', rows: [{ label: '🔴 red', count: 5 }, { label: '🔵 blue', count: 3 }] } },
        { title: 'Most and fewest', text: 'The longest row has the **most**.\nThe shortest row has the **fewest**.', visual: { type: 'pictogram', rows: [{ label: '🍎 apple', count: 3 }, { label: '🍌 banana', count: 6 }, { label: '🍐 pear', count: 1 }], symbol: '🙂', per: 1, title: 'Fruit we like' } },
        { title: 'Example: how many like 🍌?', text: '1. Find the 🍌 row.\n2. The bundle is 5.\n3. Count on the lines: 6, 7.\n4. **7** children like bananas.', visual: { type: 'tally', rows: [{ label: '🍎 apple', count: 4 }, { label: '🍌 banana', count: 7 }] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [[readPicto, readPicto, readTally, most, whichHas], [readPicto, readTally, most, diff], [readPicto, readTally, most, diff, total]], ctx);
      },
    });
  }
})();
