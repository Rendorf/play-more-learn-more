// Play More Learn More — Cambridge Primary Stage 5 (Grade 5, age ~10).
// 5 units, 25 skills. See src/CONTRACT.md for the shapes used here.
(() => {
  // ───────────────────────── local helpers ─────────────────────────
  const M = U.MINUS;
  const F = U.fmt;
  const R = U.rint;
  const pick = U.pick;
  const fr = U.frac;
  const coin = () => Math.random() < 0.5;
  const retry = (fn, tries = 5000) => {
    for (let i = 0; i < tries; i++) { const r = fn(); if (r) return r; }
    throw new Error('generator could not find good numbers');
  };
  // pick a format function for this level and run it
  const byLevel = (level, sets, ctx) => pick(sets[Math.min(Math.max(level, 1), sets.length) - 1])(level, ctx);

  const num = (q, answer, hints, explain, extra) =>
    Object.assign({ q, kind: 'number', answer: U.clean(answer), hints, explain }, extra || {});
  const choice = (q, answer, wrongs, hints, explain, extra) => {
    const a = String(answer);
    const w = [...new Set(wrongs.map(String))].filter(x => x !== a && x !== '' && !/NaN|undefined|Infinity|null/.test(x));
    if (!w.length) throw new Error('no wrong options for: ' + q);
    const e = Object.assign({}, extra || {}), n = e.nChoices || 4;
    delete e.nChoices;
    return Object.assign({ q, kind: 'choice', answer: a, choices: U.choices(a, w, n), hints, explain }, e);
  };
  // numeric multiple choice: `wrongs` are numbers from real mistakes (used first), then near misses
  const nchoice = (q, answer, wrongs, hints, explain, extra, sfx = '') => {
    const a = U.clean(answer);
    const ok = x => Number.isFinite(x) && x >= 0 && U.clean(x) !== a;
    const ws = wrongs.filter(ok).map(x => F(U.clean(x)) + sfx);
    const near = [a + 1, a - 1, a + 10, a - 10, a * 10, a + 2].filter(ok).map(x => F(U.clean(x)) + sfx);
    return choice(q, F(a) + sfx, [...ws, ...near], hints, explain, extra);
  };
  const fracQ = (q, n, d, hints, explain, extra) => {
    const [a, b] = U.simplify(n, d);
    if (b === 1) {
      const e = Object.assign({}, extra || {});
      delete e.simplest; delete e.mixed;
      return num(q, a, hints, explain, e);
    }
    return Object.assign({ q, kind: 'fraction', answer: [a, b], hints, explain }, extra || {});
  };
  const money = (cur, x) => cur + (Number.isInteger(U.clean(x)) ? F(x) : F(x, 2));
  const sum = arr => arr.reduce((s, v) => s + v, 0);
  const pad2 = x => String(x).padStart(2, '0');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const digitsOf = n => String(n).split('').map(Number);
  // a random whole number with `len` digits (no leading zero); zeroP = chance of each later digit being 0
  const randDigits = (len, zeroP = 0) => {
    const ds = [R(1, 9)];
    for (let i = 1; i < len; i++) ds.push(Math.random() < zeroP ? 0 : R(zeroP ? 1 : 0, 9));
    return ds;
  };

  // ═══════════════════════ Unit 1: Number and place value ═══════════════════════
  PMLM.registerUnit({ id: 'g5.u1', grade: 5, name: 'Number and place value', icon: '🔢' });

  /* 1 ── Place value to 1 000 000 and 2 decimal places */
  {
    const PL = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
    const PV = [1, 10, 100, 1000, 10000, 100000];
    const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
      'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const w99 = n => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
    const w999 = n => {
      const h = Math.floor(n / 100), r = n % 100;
      return h ? ONES[h] + ' hundred' + (r ? ' and ' + w99(r) : '') : w99(r);
    };
    const words = n => {
      const th = Math.floor(n / 1000), r = n % 1000;
      let s = th ? w999(th) + ' thousand' : '';
      if (r) s += (th ? (r < 100 ? ' and ' : ' ') : '') + w999(r);
      return s || 'zero';
    };
    // a number whose chosen digit is non-zero and appears only once
    const pvPick = (len, minPlace = 0) => retry(() => {
      const ds = randDigits(len);
      const idx = R(0, len - 1 - minPlace), d = ds[idx];
      if (!d || ds.filter(x => x === d).length > 1) return null;
      return { ds, idx, d, n: +ds.join(''), place: len - 1 - idx };
    });

    const valueOf = L => {
      const { idx, d, n, place } = pvPick(L === 1 ? R(4, 5) : 6);
      const val = d * PV[place];
      return num(`What is the value of the digit **${d}** in ${F(n)}?`, val,
        ['Find the column the digit is in. Each column is worth 10 times the column to its right.',
          `The ${d} is in the **${PL[place]}** column. How much are ${d} ${PL[place]}?`],
        `The ${d} is in the ${PL[place]} column, so it is worth ${d} × ${F(PV[place])} = ${F(val)}.`,
        L < 3 ? { visual: { type: 'placeValue', value: n, highlight: idx } } : {});
    };

    const decValue = L => {
      const r = retry(() => {
        const ds = randDigits(R(1, L === 3 ? 4 : 2));
        const dec = [R(0, 9), R(1, 9)], which = R(0, 1), d = dec[which];
        if (!d || [...ds, ...dec].filter(x => x === d).length > 1) return null;
        return { s: ds.join('') + '.' + dec.join(''), d, which, idx: ds.length + which };
      });
      const val = U.clean(r.which ? r.d / 100 : r.d / 10);
      const col = r.which ? 'hundredths' : 'tenths';
      return choice(`What is the value of the digit **${r.d}** in ${F(+r.s)}?`, F(val),
        [F(U.clean(r.which ? r.d / 10 : r.d / 100)), F(r.d), F(r.d * 10)],
        ['After the decimal point the columns are **tenths**, then **hundredths**.',
          `The ${r.d} is in the **${col}** column.`],
        `The ${r.d} is in the ${col} column, so it is worth ${r.d} ${r.d === 1 ? col.slice(0, -1) : col} = ${F(val)}.`,
        L === 2 ? { visual: { type: 'placeValue', value: r.s, highlight: r.idx } } : {});
    };

    const partition = L => {
      const dec = L === 3 && coin();
      const r = retry(() => {
        const len = L === 1 || dec ? 4 : R(5, 6);
        const ds = randDigits(len, 0.2);
        let items = ds.map((d, i) => ({ v: d * PV[len - 1 - i], d, name: PL[len - 1 - i] }));
        let n = +ds.join('');
        if (dec) {
          const t = R(1, 9), h = R(1, 9);
          items = items.concat([{ v: t / 10, d: t, name: 'tenths' }, { v: h / 100, d: h, name: 'hundredths' }]);
          n = U.clean(n + t / 10 + h / 100);
        }
        items = items.filter(it => it.d > 0);
        return items.length >= 4 ? { n, items } : null;
      });
      const k = R(0, r.items.length - 1), miss = r.items[k];
      const expr = r.items.map((it, i) => (i === k ? '□' : F(U.clean(it.v)))).join(' + ');
      return num(`Find the missing number.\n${F(r.n)} = ${expr}`, miss.v,
        ['Each part is one digit times its column value. A zero digit has no part.',
          `The missing part comes from the **${miss.name}** column of ${F(r.n)}. Which digit is there?`],
        `The ${miss.name} digit of ${F(r.n)} is ${miss.d}, so the missing part is ${F(U.clean(miss.v))}.`);
    };

    const wordsQ = L => {
      const len = L === 1 ? 5 : 6;
      const n = retry(() => {
        const ds = randDigits(len, L === 3 ? 0.4 : 0.25);
        const v = +ds.join('');
        return ds.slice(1).includes(0) && v % 1000 ? v : null;
      });
      const th = Math.floor(n / 1000), r = n % 1000, s = String(n);
      const wr = [+(String(th) + String(r))];          // forgot the placeholder zeros
      if (r * 10 < 1000) wr.push(th * 1000 + r * 10);  // a zero in the wrong place
      for (let i = 0; i + 1 < s.length; i++) {
        if (s[i] === s[i + 1] || (i === 0 && s[1] === '0')) continue;
        const t = s.split(''); [t[i], t[i + 1]] = [t[i + 1], t[i]]; wr.push(+t.join(''));
      }
      const W = U.shuffle(wr.slice(2)).concat(wr.slice(0, 2)).reverse().filter(x => x !== n && x >= 1000);
      if (coin()) {
        return choice(`Which number is **${words(n)}**?`, F(n), W.map(x => F(x)),
          ['Write the thousands part first, then the last three digits. Use zeros for empty columns.',
            `${cap(w999(th))} thousand is ${F(th * 1000)}. Now fill the last three columns.`],
          `${cap(w999(th))} thousand is ${F(th * 1000)}, and ${w999(r)} is ${String(r).padStart(3, '0')} in the last three columns. So the number is ${F(n)}.`);
      }
      return choice(`How do you write ${F(n)} in words?`, words(n), W.map(words),
        ['Read the digits before the comma as thousands. Then read the last three digits.',
          `${F(th)} thousand is "${w999(th)} thousand". Now read the last three digits.`],
        `${F(n)} is ${words(n)}.`);
    };

    const compareInt = L => {
      const len = L === 1 ? 5 : 6, big = coin();
      const nums = retry(() => {
        const ds = randDigits(len);
        if (ds[0] === 9) return null;
        const set = new Set([+ds.join('')]);
        for (let t = 0; t < 40 && set.size < 4; t++) {
          const c = ds.slice(), i = R(1, len - 1), j = R(1, len - 1);
          [c[i], c[j]] = [c[j], c[i]]; set.add(+c.join(''));
        }
        return set.size >= 4 ? [...set].slice(0, 4) : null;
      });
      let short = null;
      if (L >= 2 && big) { short = +('9' + randDigits(len - 2).join('')); nums[3] = short; }
      const ans = big ? Math.max(...nums) : Math.min(...nums);
      return choice(`Which number is the **${big ? 'largest' : 'smallest'}**?`, F(ans), nums.filter(x => x !== ans).map(x => F(x)),
        ['First count the digits: more digits means a bigger number. Then compare from the left, column by column.',
          short ? `${F(short)} has only ${len - 1} digits, so it is smaller than the ${len}-digit numbers, even though it starts with 9.`
            : `They all have ${len} digits and start with ${String(nums[0])[0]}. Find the first column where the digits are different.`],
        `Comparing column by column from the left, ${F(ans)} is the ${big ? 'largest' : 'smallest'}.`);
    };

    const compareDec = () => {
      const big = coin();
      const vals = retry(() => {
        const w = R(0, 9), t = R(3, 9);
        const v = [w + t / 10, w + (t - 1) / 10 + R(1, 9) / 100, w + t / 100, w + R(1, t - 2) / 10 + R(1, 9) / 100].map(U.clean);
        return new Set(v).size === 4 ? v : null;
      });
      const ans = big ? Math.max(...vals) : Math.min(...vals);
      return choice(`Which number is the **${big ? 'largest' : 'smallest'}**?`, F(ans), vals.filter(x => x !== ans).map(x => F(x)),
        ['Line up the decimal points. Compare the ones, then the tenths, then the hundredths.',
          `Write every number with 2 decimal places, like ${F(vals[0], 2)}. Then compare them.`],
        `With 2 decimal places: ${vals.map(x => F(x, 2)).join(', ')}. The ${big ? 'largest' : 'smallest'} is ${F(ans)}.`);
    };

    const COL = { 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands', 0.1: 'tenths', 0.01: 'hundredths' };
    const moreLess = L => {
      const step = pick(L === 1 ? [10, 100, 1000] : L === 2 ? [100, 1000, 10000] : [1000, 10000, 100000, 0.1, 0.01]);
      const more = coin(), cross = L > 1 && coin();
      let n, dg;
      if (step < 1) {
        let t = R(0, 9), h = R(1, 9);
        if (cross) { if (step === 0.1) t = more ? 9 : 0; else h = more ? 9 : 0; }
        n = U.clean(R(1, 99) + t / 10 + h / 100);
        dg = step === 0.1 ? t : h;
      } else {
        const z = Math.round(Math.log10(step));
        const len = z === 5 ? 6 : Math.max(L === 1 ? 4 : R(5, 6), z + 2);
        const ds = randDigits(len), ci = len - 1 - z;
        if (ci === 0) ds[0] = more ? R(1, 8) : R(2, 9);
        else if (cross) ds[ci] = more ? 9 : 0;
        n = +ds.join(''); dg = ds[ci];
      }
      const ans = U.clean(more ? n + step : n - step);
      const careful = (more && dg === 9) || (!more && dg === 0);
      return num(`What is ${F(step)} ${more ? 'more' : 'less'} than ${F(n)}?`, ans,
        [`Only the ${COL[step]} digit changes, unless it is ${more ? '9' : '0'}. Then the next column changes too.`,
          `The ${COL[step]} digit of ${F(n)} is ${dg}.${careful ? ` ${more ? 'Adding 1 makes 10, so carry 1 to the next column.' : 'You cannot take 1 from 0, so exchange 1 from the next column.'}` : ` It becomes ${more ? dg + 1 : dg - 1}.`}`],
        `${F(n)} ${more ? '+' : M} ${F(step)} = ${F(ans)}.`,
        L === 1 ? { visual: { type: 'placeValue', value: n } } : {});
    };

    const spot = () => {
      const { d, n, place } = pvPick(6, 2);
      const val = d * PV[place], wrong = d * PV[place - 1], who = U.name();
      return num(`${who} says the ${d} in ${F(n)} is worth ${F(wrong)}.\nWhat is it really worth?`, val,
        ['Name the columns from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands.',
          `The ${d} is in the ${PL[place]} column, not the ${PL[place - 1]} column.`],
        `The ${d} is in the ${PL[place]} column, so it is worth ${F(val)}. ${who} was one column out.`);
    };

    PMLM.registerSkill({
      id: 'g5.placeValue', grade: 5, unit: 'g5.u1', title: 'Place value', icon: '🧱',
      blurb: 'Big numbers to a million and decimals',
      lesson: [
        { title: 'Columns for big numbers',
          text: 'Each digit sits in a column. Each column is worth **10 times** the column to its right.\n**345,278** has 3 hundred thousands, 4 ten thousands, 5 thousands, 2 hundreds, 7 tens and 8 ones.',
          visual: { type: 'placeValue', value: 345278 } },
        { title: 'What is a digit worth?',
          text: 'In 572,814 the **7** is in the ten thousands column.\nSo the 7 is worth **70,000**.\nThe same digit is worth more when it is further to the left.',
          visual: { type: 'placeValue', value: 572814, highlight: 1 } },
        { title: 'Decimals',
          text: 'After the decimal point come **tenths** (t) and **hundredths** (h).\n4.36 = 4 ones, 3 tenths and 6 hundredths.\nThe 3 is worth 0.3 and the 6 is worth 0.06.',
          visual: { type: 'placeValue', value: '4.36' } },
        { title: 'Zeros hold places',
          text: 'A zero shows an empty column. It keeps the other digits in the right place.\n63,405 = 60,000 + 3000 + 400 + 5\nThree hundred and four thousand and sixty = **304,060**' },
        { title: 'Worked example',
          text: 'What is the value of the 6 in 246,031?\n**1.** Name the columns from the right: ones (1), tens (3), hundreds (0), thousands (6).\n**2.** The 6 is in the thousands column.\n**3.** 6 thousands = 6 × 1000.\nAnswer: **6000**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [valueOf, valueOf, partition, moreLess, compareInt, wordsQ],
          [valueOf, decValue, partition, wordsQ, moreLess, compareInt, spot],
          [valueOf, decValue, partition, wordsQ, moreLess, compareDec, spot],
        ], ctx);
      },
    });
  }

  /* 2 ── Rounding */
  {
    const NAME = { 10: 'ten', 100: 'hundred', 1000: 'thousand', 1: 'whole number' };
    const LOOK = { 10: 'ones', 100: 'tens', 1000: 'hundreds', 1: 'tenths' };
    const rnd = (n, s) => U.clean(Math.round(U.clean(n / s)) * s);
    const lookDigit = (n, s) => (s === 1 ? Math.floor(U.clean(n * 10)) % 10 : Math.floor(n / (s / 10)) % 10);
    const makeN = (L, s) => retry(() => {
      let n;
      if (s === 1) n = L === 3 && coin() ? U.clean(R(101, 9999) / 100) : U.clean(R(11, 999) / 10);
      else if (L === 1) n = s === 10 ? R(101, 999) : R(101, 9999);
      else if (L === 2) n = R(1001, 99999);
      else n = R(10001, 999999);
      if (s >= 10 && Math.random() < 0.25) { const u = s / 10; n = n - (Math.floor(n / u) % 10) * u + 5 * u; }
      if (s >= 100 && L === 3 && Math.random() < 0.3) n = Math.floor(n / (s * 10)) * s * 10 + 9 * s + R(s / 2, s - 1);
      if (Number.isInteger(U.clean(n / s)) || n < s) return null;
      return n;
    });
    const sizes = L => (L === 1 ? [10, 10, 100] : L === 2 ? [10, 100, 1000, 1] : [100, 1000, 1000, 1]);
    const parts = (n, s) => {
      const lo = U.clean(Math.floor(U.clean(n / s)) * s), hi = U.clean(lo + s), d = lookDigit(n, s);
      return { lo, hi, d, ans: rnd(n, s) };
    };

    const roundQ = L => {
      const s = pick(sizes(L)), n = makeN(L, s), { lo, hi, d, ans } = parts(n, s);
      const vis = L === 1 || (s === 1 && L === 2)
        ? { visual: { type: 'numberLine', min: lo, max: hi, step: s / 10, labelEvery: 5, points: [{ at: n, label: F(n) }] } } : {};
      return num(`Round ${F(n)} to the nearest ${NAME[s]}.`, ans,
        [`Look at the **${LOOK[s]}** digit. 5 or more: round up. 4 or less: round down.`,
          `${F(n)} is between ${F(lo)} and ${F(hi)}. The ${LOOK[s]} digit is ${d}.`],
        `${F(n)} is between ${F(lo)} and ${F(hi)}. The ${LOOK[s]} digit is ${d}, so round ${d >= 5 ? 'up' : 'down'} to ${F(ans)}.`, vis);
    };

    const spotQ = L => {
      const s = pick(sizes(L).filter(x => x >= 10)), n = makeN(L, s), { lo, hi, d, ans } = parts(n, s), who = U.name();
      const wrong = ans === lo ? hi : lo;
      const extra = [rnd(n, s * 10), s >= 100 ? rnd(n, s / 10) : n - (n % s) - s, lo - s, hi + s].filter(x => x > 0);
      return choice(`${who} rounds ${F(n)} to the nearest ${NAME[s]} and gets ${F(wrong)}.\nWhat is the correct answer?`, F(ans),
        [F(wrong), ...extra.map(x => F(x))],
        [`Look at the **${LOOK[s]}** digit. 5 or more: round up. 4 or less: round down.`,
          `${F(n)} is between ${F(lo)} and ${F(hi)}. Its ${LOOK[s]} digit is ${d}.`],
        `The ${LOOK[s]} digit is ${d}, so ${F(n)} rounds ${d >= 5 ? 'up' : 'down'} to ${F(ans)}, not ${F(wrong)}.`);
    };

    const reverseQ = L => {
      const s = pick(L === 2 ? [10, 100] : [100, 1000]);
      const T = s === 10 ? R(11, 99) * 10 : s === 100 ? R(2, 99) * 100 : R(2, 99) * 1000, h = s / 2;
      let right = T; while (right === T) right = T + R(-h, h - 1);
      const wrongs = [T - h - R(1, h - 1), T + h, T + h + R(1, h - 1), T - s + R(0, h - 1)];
      return choice(`Which number rounds to **${F(T)}** to the nearest ${NAME[s]}?`, F(right), wrongs.map(x => F(x)),
        [`A number rounds to ${F(T)} if it is closer to ${F(T)} than to ${F(T - s)} or ${F(T + s)}.`,
          `Halfway between ${F(T - s)} and ${F(T)} is ${F(T - h)}. Halfway between ${F(T)} and ${F(T + s)} is ${F(T + h)}.`],
        `${F(right)} is closer to ${F(T)} than to the next ${NAME[s]} on either side, so it rounds to ${F(T)}.`);
    };

    const wordQ = L => {
      const s = pick(sizes(L)), n = makeN(L === 1 ? 2 : L, s), { lo, hi, d, ans } = parts(n, s);
      let text, unit;
      if (s === 1) {
        [text, unit] = pick([
          [`A bag of rice weighs ${F(n)} kg.\nRound the weight to the nearest kilogram.`, 'kg'],
          [`A plank of wood is ${F(n)} m long.\nRound its length to the nearest metre.`, 'm'],
          [`A jug holds ${F(n)} litres.\nRound this to the nearest litre.`, 'litres'],
        ]);
      } else {
        text = pick([`A football stadium has ${F(n)} seats.`, `A town has ${F(n)} people living in it.`,
          `A car has travelled ${F(n)} km.`, `A library has ${F(n)} books.`]) + `\nRound this number to the nearest ${NAME[s]}.`;
      }
      return num(text, ans,
        [`Look at the **${LOOK[s]}** digit. 5 or more: round up. 4 or less: round down.`,
          `${F(n)} is between ${F(lo)} and ${F(hi)}.`],
        `The ${LOOK[s]} digit is ${d}, so ${F(n)} rounds ${d >= 5 ? 'up' : 'down'} to ${F(ans)}.`, unit ? { unit } : {});
    };

    PMLM.registerSkill({
      id: 'g5.rounding', grade: 5, unit: 'g5.u1', title: 'Rounding', icon: '🎯',
      blurb: 'Round to the nearest 10, 100, 1000 or whole number',
      lesson: [
        { title: 'What rounding means',
          text: 'Rounding finds the nearest "friendly" number.\n347 is between 340 and 350. It is closer to **350**.\nSo 347 rounded to the nearest ten is 350.',
          visual: { type: 'numberLine', min: 340, max: 350, step: 1, labelEvery: 5, points: [{ at: 347, label: '347' }] } },
        { title: 'The halfway rule',
          text: 'Look at the digit just to the **right** of the place you are rounding to.\n0, 1, 2, 3 or 4 → round **down**.\n5, 6, 7, 8 or 9 → round **up**.\n345 is exactly halfway, and halfway rounds up: 350.' },
        { title: 'Nearest 100 and 1000',
          text: 'Round 4728 to the nearest 100: look at the tens digit (2). Round down → **4700**.\nRound 4728 to the nearest 1000: look at the hundreds digit (7). Round up → **5000**.' },
        { title: 'Nearest whole number',
          text: 'For decimals, look at the **tenths** digit.\n6.7 → the tenths digit is 7, so round up to **7**.\n12.38 → the tenths digit is 3, so round down to **12**.',
          visual: { type: 'numberLine', min: 6, max: 7, step: 0.1, labelEvery: 5, points: [{ at: 6.7, label: '6.7' }] } },
        { title: 'Worked example',
          text: 'Round 23,651 to the nearest 1000.\n**1.** It is between 23,000 and 24,000.\n**2.** Look at the hundreds digit: it is 6.\n**3.** 6 is 5 or more, so round up.\nAnswer: **24,000**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [roundQ, roundQ, roundQ, wordQ, spotQ],
          [roundQ, roundQ, reverseQ, spotQ, wordQ],
          [roundQ, roundQ, reverseQ, spotQ, wordQ],
        ], ctx);
      },
    });
  }

  /* 3 ── Negative numbers */
  {
    const lim = L => (L === 1 ? 6 : L === 2 ? 10 : 20);

    const tempQ = L => {
      const m = lim(L);
      const r = retry(() => {
        const start = R(-m, m), change = R(2, L === 3 ? 15 : 8), rise = start < 0 ? true : start > 0 ? false : coin();
        const end = rise ? start + change : start - change;
        if (start === 0 || end === 0 || Math.sign(end) === Math.sign(start) || Math.abs(end) > m || change === 2 * Math.abs(start)) return null;
        return { start, change, rise, end };
      });
      const { start, change, rise, end } = r, toZero = Math.abs(start);
      return num(`The temperature is ${F(start)} °C. It ${rise ? 'rises' : 'falls'} by ${change} degrees.\nWhat is the new temperature?`, end,
        [rise ? 'Rising means counting **up**. Count up to zero first, then keep going.' : 'Falling means counting **down**. Count down to zero first, then keep going below zero.',
          `From ${F(start)} it is ${U.s(toZero, 'degree')} ${rise ? 'up' : 'down'} to 0. How many more degrees do you still need to count?`],
        `${F(start)} ${rise ? '+' : M} ${change} = ${F(end)}. The new temperature is ${F(end)} °C.`,
        { unit: '°C', visual: { type: 'thermometer', value: start, min: -m, max: m } });
    };

    const diffLine = (a, b, m) => (m <= 12
      ? { type: 'numberLine', min: -m, max: m, step: 1, labelEvery: 2, points: [{ at: a, label: F(a) }, { at: b, label: F(b) }] }
      : { type: 'numberLine', min: -m, max: m, step: 2, labelEvery: 5, points: [{ at: a, label: F(a) }, { at: b, label: F(b) }] });

    const diffQ = L => {
      const m = lim(L);
      const bothNeg = L === 3 && Math.random() < 0.3;
      const [a, b] = retry(() => {
        const x = R(-m, -1), y = bothNeg ? R(-m + 1, -1) : R(1, m);
        return x < y && y - x >= 3 ? [x, y] : null;
      });
      const d = b - a;
      return num(`At night it was ${F(a)} °C. In the day it was ${F(b)} °C.\nHow many degrees warmer was it in the day?`, d,
        ['Count the steps from the lower temperature up to the higher one. Zero is a good stepping stone.',
          bothNeg ? `Count up from ${F(a)}: ${F(a + 1)}, ${F(a + 2)}, … until you reach ${F(b)}.` : `From ${F(a)} up to 0 is ${U.s(-a, 'degree')}.`],
        bothNeg ? `From ${F(a)} up to ${F(b)} is ${d} steps, so it was ${d} degrees warmer.`
          : `From ${F(a)} up to 0 is ${U.s(-a, 'degree')}, then up to ${b} is ${b} more. ${-a} + ${b} = ${d} degrees.`,
        { unit: 'degrees', visual: diffLine(a, b, m) });
    };

    const seqQ = L => {
      const k = R(2, L === 1 ? 3 : L === 2 ? 5 : 7), down = coin();
      const r = retry(() => {
        const t0 = down ? R(k + 1, 4 * k) : -R(k + 1, 4 * k);
        const terms = [0, 1, 2, 3, 4].map(i => (down ? t0 - i * k : t0 + i * k));
        return Math.sign(terms[0]) !== Math.sign(terms[4]) && terms[4] !== 0 ? terms : null;
      });
      const miss = L === 3 ? R(1, 4) : 4;
      return num(`What number goes in the empty box?`, r[miss],
        [`The numbers go ${down ? 'down' : 'up'} by ${k} each time. Use the number line in your head and count through zero.`,
          miss === 4 ? `Start at ${F(r[3])} and count ${down ? 'back' : 'on'} ${k}, one step at a time.`
            : `Start at ${F(r[miss - 1])} and count ${down ? 'back' : 'on'} ${k}, one step at a time.`],
        `${F(r[miss - 1])} ${down ? M : '+'} ${k} = ${F(r[miss])}.`,
        { visual: { type: 'sequence', terms: r.map((t, i) => (i === miss ? '?' : F(t))), step: (down ? M : '+') + k } });
    };

    const lineQ = L => {
      const big = L === 3, step = big ? 2 : 1, m = big ? 20 : 10;
      const v = retry(() => { const x = -R(1, m / step) * step; return x % (5 * step) ? x : null; });
      const lab = Math.round(v / (5 * step)) * 5 * step, k = Math.abs(v - lab) / step;
      return num('What number is marked **?** on the number line?', v,
        ['Use the labelled numbers. Work out what each small step is worth.',
          `Each small step is worth ${step}. Find the label nearest to the **?** and count the steps from there.`],
        `From ${F(lab)}, count ${k} step${k > 1 ? 's' : ''} ${v < lab ? 'left' : 'right'} (${step} each): the number is ${F(v)}.`,
        { visual: { type: 'numberLine', min: -m, max: m, step, labelEvery: 5, points: [{ at: v, label: '?' }] } });
    };

    const coldQ = L => {
      const m = lim(L), warm = L === 3 && coin();
      const ts = retry(() => {
        const s = warm ? [R(-m, -1), R(-m, -1), R(-m, -1), R(-m, -1)]
          : [-R(1, 3), -R(4, m), R(-m, m), R(0, m)];
        return new Set(s).size === 4 ? s : null;
      });
      const ans = warm ? Math.max(...ts) : Math.min(...ts);
      return choice(`Which temperature is the **${warm ? 'warmest' : 'coldest'}**?`, `${F(ans)} °C`, ts.filter(t => t !== ans).map(t => `${F(t)} °C`),
        ['On a number line, colder temperatures are further to the **left**. On a thermometer they are lower.',
          warm ? 'They are all below zero. The one closest to zero is the warmest.' : 'Negative temperatures are colder than 0. The bigger the number after the minus sign, the colder it is.'],
        `${F(ans)} °C is furthest ${warm ? 'right' : 'left'} on the number line, so it is the ${warm ? 'warmest' : 'coldest'}.`);
    };

    const spotQ = L => {
      const m = lim(L), a = -R(2, m - 1), b = R(2, m), who = U.name();
      if (b + a === b - a || b + a < 0) return diffQ(L);
      const wrong = b + a, d = b - a;
      return num(`${who} says the difference between ${F(a)} °C and ${b} °C is ${U.s(wrong, 'degree')}.\nWhat is the correct difference?`, d,
        ['The difference is how many steps it is from one temperature to the other on a number line.',
          `From ${F(a)} up to 0 is ${-a} steps.`],
        `From ${F(a)} to 0 is ${-a} steps, then ${b} more to ${b}. ${-a} + ${b} = ${d} degrees. ${who} worked out ${b} ${M} ${-a} by mistake.`,
        { unit: 'degrees' });
    };

    const cityQ = () => {
      const cold = pick(['Oslo', 'Moscow', 'Ottawa', 'Helsinki', 'Reykjavik']), hot = pick(['Baku', 'Cairo', 'Rome', 'Lisbon', 'Dubai']);
      const a = -R(3, 18), b = R(2, 18), d = b - a;
      return num(`One winter day it was ${F(a)} °C in ${cold} and ${b} °C in ${hot}.\nHow many degrees colder was it in ${cold}?`, d,
        ['Find the difference: count the steps from the lower temperature up to the higher one.',
          `From ${F(a)} up to 0 is ${-a} degrees.`],
        `${-a} degrees up to 0, then ${b} more: ${-a} + ${b} = ${d}. It was ${d} degrees colder in ${cold}.`,
        { unit: 'degrees', visual: diffLine(a, b, 20) });
    };

    PMLM.registerSkill({
      id: 'g5.negatives', grade: 5, unit: 'g5.u1', title: 'Negative numbers', icon: '🌡️',
      blurb: 'Count through zero and find differences',
      lesson: [
        { title: 'Numbers below zero',
          text: 'Numbers less than zero are **negative**. We write them with a minus sign: −1, −2, −3.\nOn a thermometer, temperatures below 0 °C are negative. This one shows −3 °C.',
          visual: { type: 'thermometer', value: -3, min: -10, max: 10 } },
        { title: 'Counting through zero',
          text: 'Start at 3 and count back 5:\n3, 2, 1, 0, −1, −2.\nYou land on **−2**. Zero counts as a step too!',
          visual: { type: 'numberLine', min: -5, max: 5, step: 1, jumps: [{ from: 3, to: -2, label: 'back 5' }] } },
        { title: 'Finding the difference',
          text: 'The difference between −4 and 3 is the number of steps between them.\n−4 to 0 is 4 steps. 0 to 3 is 3 steps.\n4 + 3 = **7**.',
          visual: { type: 'numberLine', min: -5, max: 5, step: 1, jumps: [{ from: -4, to: 0, label: '4' }, { from: 0, to: 3, label: '3' }] } },
        { title: 'Which is colder?',
          text: 'Numbers further left on the number line are smaller.\n−8 is smaller than −2, so −8 °C is **colder** than −2 °C.\n**Tip:** use zero as a stepping stone when you count.' },
        { title: 'Worked example',
          text: 'At night it is −5 °C. By midday it is 7 degrees warmer. What is the temperature at midday?\n**1.** Warmer means count up.\n**2.** From −5 up to 0 is 5 degrees. 7 − 5 = 2 degrees are left.\n**3.** From 0, count up 2 more.\nAnswer: **2 °C**',
          visual: { type: 'thermometer', value: -5, min: -10, max: 10 } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [tempQ, tempQ, diffQ, seqQ, lineQ, coldQ],
          [tempQ, diffQ, seqQ, lineQ, coldQ, spotQ],
          [tempQ, diffQ, seqQ, lineQ, coldQ, spotQ, cityQ],
        ], ctx);
      },
    });
  }

  /* 4 ── Factors, multiples and square numbers */
  {
    const RICH = [12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 50, 54, 56, 60, 63, 64, 70, 72, 75, 80, 84, 90, 96, 100];
    const pool = L => RICH.filter(n => n <= (L === 1 ? 40 : L === 2 ? 60 : 100));
    const pairs = n => U.factors(n).filter(f => f * f <= n).map(f => `${f} × ${n / f}`);

    const factorChoice = L => {
      const N = pick(pool(L)), fs = U.factors(N).filter(f => f > 1 && f < N), f = pick(fs);
      const nonF = U.range(3, Math.min(N - 1, 15)).filter(x => N % x);
      const wr = U.shuffle([2 * N, f + 1, f - 1, ...U.sample(nonF, 3)].filter(x => x > 1 && N % x));
      const w0 = wr.find(x => x < N) || nonF[0];
      return choice(`Which number is a **factor** of ${N}?`, String(f), wr.map(String),
        ['A factor divides into the number exactly, with nothing left over.',
          `Test each one. For example, ${N} ÷ ${w0} = ${Math.floor(N / w0)} r ${N % w0}, so ${w0} is not a factor.`],
        `${N} ÷ ${f} = ${N / f} exactly, so ${f} is a factor of ${N}.`);
    };

    const multipleChoice = L => {
      const k = R(3, L === 1 ? 6 : 9), m = R(3, 12), ans = k * m;
      const wr = U.shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + k + 1, k * 10 + 1]).filter(x => x % k && x > 0);
      return choice(`Which number is a **multiple** of ${k}?`, String(ans), wr.map(String),
        [`Multiples of ${k} are the answers in the ${k} times table.`,
          `Count in ${k}s: ${k}, ${2 * k}, ${3 * k}, ${4 * k}, … Which choice do you reach?`],
        `${m} × ${k} = ${ans}, so ${ans} is a multiple of ${k}.`);
    };

    const pairQ = L => {
      const N = pick(pool(L)), fs = U.factors(N).filter(f => f > 1 && f < N), a = pick(fs);
      return num(`${a} and □ are a **factor pair** of ${N}.\nWhat is the missing number?`, N / a,
        ['A factor pair multiplies together to make the number.',
          `Ask: ${a} × □ = ${N}. Work out ${N} ÷ ${a}.`],
        `${a} × ${N / a} = ${N}, so the missing number is ${N / a}.`);
    };

    const listMissing = L => {
      const N = pick(pool(Math.max(L, 2)).filter(n => U.factors(n).length >= 6)), fs = U.factors(N);
      const m = pick(fs.filter(f => f > 1 && f < N && f * f !== N)), p = N / m, who = U.name();
      return num(`${who} lists the factors of ${N}:\n${fs.filter(f => f !== m).join(', ')}\nOne factor is missing. What is it?`, m,
        ['Every factor has a partner. The two partners multiply to make the number.',
          `What is the partner of ${p}? Work out ${N} ÷ ${p}.`],
        `${p} × ${m} = ${N}, so ${m} is the missing factor. The factor pairs are ${pairs(N).join(', ')}.`);
    };

    const squareQ = L => {
      const n = R(2, L === 1 ? 10 : 12);
      return num(`What is ${n}^{2}?`, n * n,
        ['The little 2 means "squared": multiply the number by **itself**.',
          `Write it as a multiplication: ${n} × ${n}. (Not ${n} × 2!)`],
        `${n}^{2} = ${n} × ${n} = ${n * n}.`);
    };

    const whichSquare = L => {
      const k = R(3, L === 1 ? 9 : 12), sq = k * k;
      const isSq = x => Number.isInteger(Math.sqrt(x));
      const wr = U.shuffle([2 * k, k * (k + 1), sq + 1, sq - 1, sq + 2, 10 * k].filter(x => !isSq(x)));
      return choice('Which of these is a **square number**?', String(sq), wr.map(String),
        ['A square number is a whole number times **itself**, like 5 × 5 = 25.',
          `Try some: ${k - 1} × ${k - 1} = ${(k - 1) * (k - 1)}, ${k + 1} × ${k + 1} = ${(k + 1) * (k + 1)}. Check the choices near these.`],
        `${k} × ${k} = ${sq}, so ${sq} is a square number.`);
    };

    const howMany = L => {
      const N = pick(pool(L).filter(n => n >= 12)), c = U.factors(N).length;
      return num(`How many factors does ${N} have?`, c,
        ['Find the factors in pairs. Start with 1 and the number itself, then try 2, 3, 4, …',
          `Start the list: 1 × ${N}, 2 × ${N / 2}${N % 3 ? '' : `, 3 × ${N / 3}`}, … Keep going until the pairs meet.`],
        `The factor pairs are ${pairs(N).join(', ')}. So the factors are ${U.factors(N).join(', ')}: that is ${c} factors.`);
    };

    const commonMultiple = () => {
      const [a, b] = retry(() => { const x = R(2, 9), y = R(3, 10); return x < y && y % x && U.lcm(x, y) <= 60 ? [x, y] : null; });
      const l = U.lcm(a, b);
      return num(`What is the **smallest** number that is a multiple of both ${a} and ${b}?`, l,
        [`List the multiples of ${b}. Check which one is also in the ${a} times table.`,
          `Multiples of ${b}: ${b}, ${2 * b}, ${3 * b}, ${4 * b}, … Is each one in the ${a} times table?`],
        `${l} is in the ${a} times table (${l / a} × ${a}) and the ${b} times table (${l / b} × ${b}). It is the smallest number in both.`);
    };

    const commonFactor = () => {
      const g = pick([4, 6, 8, 9, 10, 12]), [x, y] = retry(() => { const p = R(2, 7), q = R(2, 7); return p !== q && U.gcd(p, q) === 1 ? [p, q] : null; });
      const a = g * x, b = g * y, cf = pick(U.factors(g).filter(f => f > 1));
      const wr = U.shuffle([...U.factors(a).filter(f => b % f && f > 1), ...U.factors(b).filter(f => a % f && f > 1), cf + 1, a - b > 0 ? a - b : b - a])
        .filter(f => a % f || b % f);
      return choice(`Which number is a factor of **both** ${a} and ${b}?`, String(cf), wr.map(String),
        ['A common factor divides into both numbers exactly.',
          `Check each choice with both numbers. Does it divide ${a} exactly? Does it divide ${b} exactly?`],
        `${a} ÷ ${cf} = ${a / cf} and ${b} ÷ ${cf} = ${b / cf}, so ${cf} is a factor of both.`);
    };

    const RULES = { 2: 'ends in 0, 2, 4, 6 or 8', 5: 'ends in 0 or 5', 10: 'ends in 0', 25: 'ends in 00, 25, 50 or 75', 100: 'ends in 00' };
    const divisQ = () => {
      const d = pick([2, 5, 10, 25, 100]);
      const ans = d === 100 ? R(2, 9) * 100 : d * R(Math.ceil(101 / d), Math.floor(999 / d));
      const near = { 2: [1, -1, 3, 5], 5: [1, 2, -2, 3], 10: [5, -5, 15, 1], 25: [5, 10, 15, -10, 20], 100: [50, 10, 25, 5, -50] }[d];
      const wr = U.shuffle(near.map(x => ans + x)).filter(x => x % d && x > 100);
      return choice(`Which number can be divided **exactly by ${d}**?`, String(ans), wr.map(String),
        [`A number can be divided exactly by ${d} if it ${RULES[d]}.`,
          `Look at the last ${d >= 25 ? 'two digits' : 'digit'} of each number.`],
        `${ans} ${RULES[d]}, so ${ans} ÷ ${d} = ${ans / d} exactly.`);
    };

    PMLM.registerSkill({
      id: 'g5.factors', grade: 5, unit: 'g5.u1', title: 'Factors and multiples', icon: '🔗',
      blurb: 'Factors, multiples and square numbers',
      lesson: [
        { title: 'Multiples',
          text: 'The **multiples** of 6 are the answers in the 6 times table: 6, 12, 18, 24, 30, …\nThey go on for ever!',
          visual: { type: 'sequence', terms: ['6', '12', '18', '24', '30'], step: '+6' } },
        { title: 'Factors',
          text: 'A **factor** divides into a number exactly.\nFactors come in pairs: 12 = 1 × 12 = 2 × 6 = 3 × 4.\nSo the factors of 12 are 1, 2, 3, 4, 6 and 12.',
          visual: { type: 'array', rows: 3, cols: 4 } },
        { title: 'Square numbers',
          text: 'A **square number** is a number times itself.\n4 × 4 = 16, so 16 is a square number. We write 4^{2} = 16.\nSquare numbers: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, …',
          visual: { type: 'array', rows: 4, cols: 4 } },
        { title: 'Quick tests',
          text: 'Divisible by **2**: ends in 0, 2, 4, 6 or 8.\nBy **5**: ends in 0 or 5. By **10**: ends in 0.\nBy **25**: ends in 00, 25, 50 or 75. By **100**: ends in 00.\nA **common multiple** of 4 and 6 is in both tables: 12, 24, 36, …' },
        { title: 'Worked example',
          text: 'Find all the factors of 18.\n**1.** Start with 1: 1 × 18.\n**2.** Try 2: 2 × 9. Try 3: 3 × 6.\n**3.** 4 and 5 do not divide 18 exactly. The next one, 6, is already in the list, so stop.\nAnswer: **1, 2, 3, 6, 9, 18**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [factorChoice, multipleChoice, pairQ, squareQ, whichSquare],
          [factorChoice, multipleChoice, listMissing, squareQ, whichSquare, howMany, pairQ],
          [listMissing, howMany, commonMultiple, commonFactor, divisQ, whichSquare, squareQ],
        ], ctx);
      },
    });
  }

  /* 5 ── Multiply and divide by 10, 100 and 1000 */
  {
    const ZW = { 10: 1, 100: 2, 1000: 3 };
    const nzDigits = x => String(x).replace(/[^1-9]/g, '').length;
    const lead = x => { // leading non-zero digit of x and what it is worth
      const s = F(x).replace(/,/g, ''), [ip, dp = ''] = s.split('.');
      if (+ip > 0) return { d: +ip[0], v: +ip[0] * Math.pow(10, ip.length - 1) };
      const i = dp.search(/[1-9]/);
      return { d: +dp[i], v: U.clean(+dp[i] / Math.pow(10, i + 1)) };
    };
    // small × p = big, both with at most 2 decimal places
    const makePair = L => retry(() => {
      const p = pick(L === 1 ? [10, 100] : [10, 100, 1000]);
      let s;
      if (L === 1) s = R(12, 99);
      else if (L === 2) s = U.clean(R(12, 999) / 10);
      else s = U.clean(R(1, 9999) / 100);
      const b = U.clean(s * p);
      if (b > 100000 || Number.isInteger(s / 10) && L === 1) return null;
      if (p === 10 && nzDigits(s) < 2) return null;
      return { s, p, b };
    });
    const hintMove = (x, p, times) => {
      if (p >= 100) {
        const one = U.clean(times ? x * 10 : x / 10);
        return `First ${times ? '×' : '÷'} 10: ${F(x)} ${times ? '×' : '÷'} 10 = ${F(one)}. Now ${times ? '×' : '÷'} 10 again${p === 1000 ? ', and again' : ''}.`;
      }
      const { d, v } = lead(x);
      return `The ${d} in ${F(x)} is worth ${F(v)}. After ${times ? '×' : '÷'} 10 it is worth ${F(U.clean(times ? v * 10 : v / 10))}. Move the other digits the same way.`;
    };

    const compute = L => {
      const { s, p, b } = makePair(L), times = coin();
      const x = times ? s : b, ans = times ? b : s, z = ZW[p];
      return num(`Work out ${F(x)} ${times ? '×' : '÷'} ${F(p)}`, ans,
        [`${times ? '×' : '÷'} ${F(p)} moves every digit **${z} place${z > 1 ? 's' : ''} to the ${times ? 'left' : 'right'}**.`, hintMove(x, p, times)],
        `${times ? '×' : '÷'} ${F(p)} moves the digits ${z} place${z > 1 ? 's' : ''} ${times ? 'left' : 'right'}: ${F(x)} ${times ? '×' : '÷'} ${F(p)} = ${F(ans)}.`);
    };

    const missingOp = L => {
      const { s, p, b } = makePair(L), times = coin(), z = ZW[p];
      const x = times ? s : b, y = times ? b : s;
      const op = (t, q) => `${t ? '×' : '÷'} ${F(q)}`;
      const others = [op(!times, p), ...[10, 100, 1000].filter(q => q !== p).map(q => op(times, q))];
      return choice(`What turns ${F(x)} into ${F(y)}?`, op(times, p), others,
        ['Is the new number bigger or smaller? Bigger means ×. Smaller means ÷.',
          `The number got ${times ? 'bigger' : 'smaller'}. Now count how many places the digits moved.`],
        `The digits moved ${z} place${z > 1 ? 's' : ''} ${times ? 'left' : 'right'}, so it is ${op(times, p)}.`);
    };

    const missingNum = L => {
      const { s, p, b } = makePair(L), t = R(1, 3);
      if (t === 1) {
        return num(`Find the missing number.\n□ × ${F(p)} = ${F(b)}`, s,
          ['Use the inverse: ÷ undoes ×.', `□ = ${F(b)} ÷ ${F(p)}. Move the digits ${ZW[p]} place${ZW[p] > 1 ? 's' : ''} to the right.`],
          `${F(b)} ÷ ${F(p)} = ${F(s)}, so □ = ${F(s)}.`);
      }
      if (t === 2) {
        return num(`Find the missing number.\n□ ÷ ${F(p)} = ${F(s)}`, b,
          ['Use the inverse: × undoes ÷.', `□ = ${F(s)} × ${F(p)}. Move the digits ${ZW[p]} place${ZW[p] > 1 ? 's' : ''} to the left.`],
          `${F(s)} × ${F(p)} = ${F(b)}, so □ = ${F(b)}.`);
      }
      return num(`Find the missing number: 10, 100 or 1000?\n${F(s)} × □ = ${F(b)}`, p,
        ['Each place the digits move to the left is another × 10.',
          `Compare the digit ${lead(s).d} in both numbers. How many places has it moved?`],
        `The digits moved ${ZW[p]} place${ZW[p] > 1 ? 's' : ''} to the left, so □ = ${F(p)}.`);
    };

    const spotZero = L => {
      const s = L === 2 ? U.clean(R(11, 99) / 10) : U.clean(R(101, 999) / 100);
      if (Number.isInteger(s) || nzDigits(s) < 2) return compute(L);
      const p = L === 2 ? 10 : pick([10, 100]), who = U.name(), wrong = F(s, (F(s).split('.')[1] || '').length + ZW[p]);
      const ans = U.clean(s * p);
      return num(`${who} says ${F(s)} × ${F(p)} = ${wrong}, because you "just add ${p === 10 ? 'a zero' : 'two zeros'}".\nWhat is the correct answer?`, ans,
        [`Adding zeros to the end of a decimal does not change it: ${F(s)} and ${wrong} are the same number! The digits must **move** instead.`,
          hintMove(s, p, true)],
        `× ${F(p)} moves the digits ${ZW[p]} place${ZW[p] > 1 ? 's' : ''} left: ${F(s)} × ${F(p)} = ${F(ans)}.`);
    };

    const wordQ = (L, ctx) => {
      const cur = ctx.currency, t = R(1, 5);
      if (t === 1) {
        const each = U.clean(R(11, 99) / 100), n = pick(L === 1 ? [10] : [10, 100]), tot = U.clean(each * n);
        return num(`A pack of ${n} pencils costs ${money(cur, tot)}.\nHow much does one pencil cost?`, each,
          [`Share the cost between ${n} pencils: ÷ ${n}.`, hintMove(tot, n, false)],
          `${money(cur, tot)} ÷ ${n} = ${money(cur, each)}.`, { prefix: cur });
      }
      if (t === 2) {
        const each = L === 1 ? R(2, 9) : U.clean(R(12, 99) / 10), n = pick([10, 100, 1000]);
        return num(`One ticket costs ${money(cur, each)}.\nHow much do ${F(n)} tickets cost?`, U.clean(each * n),
          [`${F(n)} tickets cost ${F(n)} times as much: × ${F(n)}.`, hintMove(each, n, true)],
          `${money(cur, each)} × ${F(n)} = ${money(cur, U.clean(each * n))}.`, { prefix: cur });
      }
      const conv = pick([['m', 'cm', 100, 'metres', 'centimetres'], ['kg', 'g', 1000, 'kilograms', 'grams'],
        ['km', 'm', 1000, 'kilometres', 'metres'], ['cm', 'mm', 10, 'centimetres', 'millimetres'], ['litres', 'ml', 1000, 'litres', 'millilitres']]);
      const [bigU, smallU, p, bigW, smallW] = conv;
      const x = L === 1 ? R(2, 9) : L === 2 ? U.clean(R(11, 99) / 10) : U.clean(R(101, 999) / 100);
      if (t === 5 && L > 1) {
        const y = U.clean(x * p);
        return num(`1 ${bigU === 'litres' ? 'litre' : bigU} = ${F(p)} ${smallU}.\nHow many ${bigW} are ${F(y)} ${smallU}?`, x,
          [`Going from small units to big units, the number gets smaller: ÷ ${F(p)}.`, hintMove(y, p, false)],
          `${F(y)} ÷ ${F(p)} = ${F(x)}, so ${F(y)} ${smallU} = ${F(x)} ${bigU}.`, { unit: bigU });
      }
      return num(`1 ${bigU === 'litres' ? 'litre' : bigU} = ${F(p)} ${smallU}.\nHow many ${smallW} are ${F(x)} ${bigU}?`, U.clean(x * p),
        [`Going from big units to small units, the number gets bigger: × ${F(p)}.`, hintMove(x, p, true)],
        `${F(x)} × ${F(p)} = ${F(U.clean(x * p))}, so ${F(x)} ${bigU} = ${F(U.clean(x * p))} ${smallU}.`, { unit: smallU });
    };

    PMLM.registerSkill({
      id: 'g5.times10', grade: 5, unit: 'g5.u1', title: '× and ÷ by 10, 100, 1000', icon: '🔟',
      blurb: 'Move the digits to multiply and divide by 10, 100, 1000',
      lesson: [
        { title: '× 10 moves digits left',
          text: 'When you multiply by 10, every digit moves **one place to the left**. The number becomes 10 times bigger.\n4.6 × 10 = 46\n4.6 × 100 = 460 (a zero fills the empty ones column)',
          visual: { type: 'table', headers: ['', 'H', 'T', 'O', 't'], rows: [['4.6', '', '', '4', '6'], ['× 10', '', '4', '6', ''], ['× 100', '4', '6', '0', '']] } },
        { title: '× 100 and × 1000',
          text: 'Multiply by 100: the digits move **2 places** left.\nMultiply by 1000: the digits move **3 places** left.\n3.7 × 100 = 370\n0.25 × 1000 = 250' },
        { title: '÷ moves digits right',
          text: 'Dividing by 10, 100 or 1000 moves the digits **right** by 1, 2 or 3 places. The number gets smaller.\n45 ÷ 10 = 4.5\n45 ÷ 100 = 0.45',
          visual: { type: 'table', headers: ['', 'T', 'O', 't', 'h'], rows: [['45', '4', '5', '', ''], ['÷ 10', '', '4', '5', ''], ['÷ 100', '', '0', '4', '5']] } },
        { title: "Don't just add a zero!",
          text: '2.5 × 10 is **not** 2.50. 2.50 is the same number as 2.5!\nThe digits move instead: 2.5 × 10 = **25**.\n**Tip:** count the zeros in 10, 100 or 1000. That is how many places the digits move.' },
        { title: 'Worked example',
          text: 'Work out 3.07 × 100.\n**1.** 100 has two zeros, so the digits move 2 places left.\n**2.** 3 ones → 3 hundreds. 0 tenths → 0 tens. 7 hundredths → 7 ones.\n**3.** Read the new number.\nAnswer: **307**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [compute, compute, compute, missingOp, missingNum, wordQ],
          [compute, compute, missingOp, missingNum, spotZero, wordQ],
          [compute, compute, missingOp, missingNum, spotZero, wordQ],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 2: Calculation ═══════════════════════
  PMLM.registerUnit({ id: 'g5.u2', grade: 5, name: 'Calculation', icon: '🧮' });

  // column layout table for a ± b (whole numbers), with an empty answer row
  const COLS = ['HTh', 'TTh', 'Th', 'H', 'T', 'O'];
  const colTable = (a, b, op) => {
    const len = Math.max(String(a).length, String(b).length) + (op === '+' ? 1 : 0);
    const row = x => { const s = String(x).padStart(len, ' '); return s.split('').map(c => (c === ' ' ? '' : c)); };
    return { type: 'table', headers: [''].concat(COLS.slice(COLS.length - len)), rows: [[''].concat(row(a)), [op].concat(row(b)), ['='].concat(Array(len).fill(''))] };
  };

  /* 6 ── Adding and subtracting */
  {
    const noCarry = (a, b) => { // add each column but never carry
      const A = String(a), B = String(b).padStart(A.length, '0');
      return +A.split('').map((d, i) => (+d + +B[i]) % 10).join('');
    };
    const smallFromBig = (a, b) => { // take the smaller digit from the bigger in every column
      const A = String(a), B = String(b).padStart(A.length, '0');
      return +A.split('').map((d, i) => Math.abs(+d - +B[i])).join('');
    };
    const est = (x, s) => U.clean(Math.round(x / s) * s);
    const sizes = L => (L === 1 ? [[100, 9999], [100, 999]] : L === 2 ? [[1000, 99999], [1000, 9999]] : [[10000, 999999], [1000, 99999]]);

    const addHint = (a, b) => {
      const ao = a % 10, bo = b % 10, s = ao + bo;
      return `Ones: ${ao} + ${bo} = ${s}.${s >= 10 ? ` Write ${s % 10} and carry 1 to the tens.` : ''} Now add the tens.`;
    };
    const subHint = (a, b) => {
      const ao = a % 10, bo = b % 10;
      return ao >= bo ? `Ones: ${ao} − ${bo} = ${ao - bo}. Now do the tens.`
        : `Ones: ${ao} is smaller than ${bo}, so exchange 1 ten for 10 ones: ${ao + 10} − ${bo} = ${ao + 10 - bo}. Now do the tens.`;
    };

    const addQ = L => {
      const [[a1, a2], [b1, b2]] = sizes(L);
      const [a, b] = retry(() => { const x = R(a1, a2), y = R(b1, b2); return noCarry(Math.max(x, y), Math.min(x, y)) !== x + y ? [x, y] : null; });
      const s = L === 1 ? 100 : 1000;
      return num(`Work out ${F(a)} + ${F(b)}`, a + b,
        ['Line up the columns: ones under ones, tens under tens. Add from the right. If a column makes 10 or more, carry 1.', addHint(a, b)],
        `${F(a)} + ${F(b)} = ${F(a + b)}. Estimate to check: ${F(est(a, s))} + ${F(est(b, s))} = ${F(est(a, s) + est(b, s))}, which is close.`,
        L === 1 ? { visual: colTable(a, b, '+') } : {});
    };

    const subQ = L => {
      const [[a1, a2], [b1, b2]] = sizes(L);
      const [a, b] = retry(() => {
        let x = R(a1, a2);
        if (L === 2 && coin()) x = R(2, 9) * 1000 + R(1, 9) * (coin() ? 1 : 10);  // zeros to exchange across, like 6003
        const y = R(b1, Math.min(b2, x - 1));
        return y >= b1 && x - y >= 100 && smallFromBig(x, y) !== x - y ? [x, y] : null;
      });
      return num(`Work out ${F(a)} − ${F(b)}`, a - b,
        ['Line up the columns. Subtract from the right. If the top digit is smaller, exchange 1 from the column to its left.', subHint(a, b)],
        `${F(a)} − ${F(b)} = ${F(a - b)}. Check with the inverse: ${F(a - b)} + ${F(b)} = ${F(a)}.`,
        L === 1 ? { visual: colTable(a, b, M) } : {});
    };

    const decQ = L => {
      const add = coin();
      const [A, B] = retry(() => {
        let x, y;
        if (L === 2) { x = R(101, 999) * 10; y = R(11, 99) * 10; }
        else { x = pick([R(101, 2999) * 10, R(1001, 2999), R(1, 3) * 1000]); y = pick([R(101, 999), R(11, 99) * 10]); }
        if (!add && y >= x) return null;
        return x % 100 === 0 && y % 100 === 0 ? null : [x, y];
      });
      const a = U.clean(A / 100), b = U.clean(B / 100), ans = U.clean((add ? A + B : A - B) / 100);
      const dp = L === 2 ? 1 : 2;
      return num(`Work out ${F(a)} ${add ? '+' : M} ${F(b)}`, ans,
        [`Line up the decimal points. Fill empty places with zeros${L === 3 ? `, so ${F(a)} = ${F(a, 2)}` : ''}.`,
          `Write them in columns: ${F(a, dp)} ${add ? '+' : M} ${F(b, dp)}. Start with the ${dp === 2 ? 'hundredths' : 'tenths'} column.`],
        `${F(a, dp)} ${add ? '+' : M} ${F(b, dp)} = ${F(ans, dp)}${Number.isInteger(ans * 10) && dp === 2 ? ` = ${F(ans)}` : ''}.`);
    };

    const missingQ = L => {
      const t = L === 1 ? 1000 * R(2, 9) : L === 2 ? pick([10000, 1000 * R(5, 9)]) : pick([100000, 10000 * R(2, 9)]);
      const a = R(Math.ceil(t * 0.2), Math.floor(t * 0.8));
      if (coin()) {
        return num(`Find the missing number.\n${F(a)} + □ = ${F(t)}`, t - a,
          ['Use the inverse: subtraction undoes addition.', `□ = ${F(t)} − ${F(a)}.`],
          `${F(t)} − ${F(a)} = ${F(t - a)}. Check: ${F(a)} + ${F(t - a)} = ${F(t)}.`);
      }
      const b = R(Math.ceil(t * 0.1), Math.floor(t * 0.5)), c = a;
      return num(`Find the missing number.\n□ − ${F(b)} = ${F(c)}`, b + c,
        ['Use the inverse: addition undoes subtraction.', `□ = ${F(c)} + ${F(b)}.`],
        `${F(c)} + ${F(b)} = ${F(b + c)}. Check: ${F(b + c)} − ${F(b)} = ${F(c)}.`);
    };

    const spotQ = L => {
      const [[a1, a2], [b1, b2]] = sizes(L), who = U.name();
      if (coin()) {
        const [a, b] = retry(() => { const x = R(a1, a2), y = R(b1, Math.min(b2, x)); return String(x).length >= String(y).length && noCarry(x, y) !== x + y ? [x, y] : null; });
        return num(`${who} worked out ${F(a)} + ${F(b)} and got ${F(noCarry(a, b))}.\n${who} forgot to carry. What is the correct answer?`, a + b,
          ['When a column adds up to 10 or more, write the ones digit and carry 1 to the next column.', addHint(a, b)],
          `${F(a)} + ${F(b)} = ${F(a + b)}. ${who} did not carry the 1s.`);
      }
      const [a, b] = retry(() => { const x = R(a1, a2), y = R(b1, Math.min(b2, x - 1)); return y >= b1 && x - y >= 100 && smallFromBig(x, y) !== x - y ? [x, y] : null; });
      return num(`${who} worked out ${F(a)} − ${F(b)} and got ${F(smallFromBig(a, b))}.\nIn some columns ${who} took the smaller digit from the bigger one. What is the correct answer?`, a - b,
        ['Always take the **bottom** digit from the **top** digit. If the top digit is smaller, exchange 1 from the next column.', subHint(a, b)],
        `${F(a)} − ${F(b)} = ${F(a - b)}. Check: ${F(a - b)} + ${F(b)} = ${F(a)}.`);
    };

    const wordQ = (L, ctx) => {
      const cur = ctx.currency, t = R(1, 4), who = U.name();
      if (t === 1) {
        const a = L === 1 ? R(1200, 4999) : R(12000, 49999), b = L === 1 ? R(800, 3999) : R(8000, 39999);
        if (coin()) {
          return num(`A museum had ${F(a)} visitors on Saturday and ${F(b)} on Sunday.\nHow many visitors came altogether?`, a + b,
            ['"Altogether" means add the two numbers.', addHint(a, b)], `${F(a)} + ${F(b)} = ${F(a + b)} visitors.`);
        }
        const [x, y] = a > b ? [a, b] : [b, a];
        return num(`A museum had ${F(x)} visitors in June and ${F(y)} in July.\nHow many more visitors came in June?`, x - y,
          ['"How many more" means find the difference: subtract.', subHint(x, y)], `${F(x)} − ${F(y)} = ${F(x - y)} more visitors.`);
      }
      if (t === 2) {
        const have = L === 1 ? R(2, 9) * 10 : pick([20, 50, 100]), spend = L === 1 ? R(5, have - 2) : U.clean(R(150, have * 100 - 50) / 100);
        return num(`${who} has ${money(cur, have)} and spends ${money(cur, spend)}.\nHow much money is left?`, U.clean(have - spend),
          [`Subtract what was spent from what ${who} had.${L > 1 ? ` Write ${money(cur, have)} as ${cur}${F(have, 2)} to line up the points.` : ''}`,
            `Work out ${F(have, L > 1 ? 2 : undefined)} ${M} ${F(spend, L > 1 ? 2 : undefined)}.`],
          `${money(cur, have)} ${M} ${money(cur, spend)} = ${money(cur, U.clean(have - spend))}.`, { prefix: cur });
      }
      if (t === 3) {
        const a = L === 3 ? U.clean(R(1001, 9999) / 100) : R(120, 899), b = L === 3 ? U.clean(R(101, 999) / 10) : R(120, 899);
        return num(`A cyclist rides ${F(a)} km in May and ${F(b)} km in June.\nHow far is that altogether?`, U.clean(a + b),
          [L === 3 ? 'Add the distances. Line up the decimal points first.' : 'Add the two distances.',
            L === 3 ? `Write them as ${F(a, 2)} + ${F(b, 2)}.` : addHint(a, b)],
          `${F(a)} + ${F(b)} = ${F(U.clean(a + b))} km.`, { unit: 'km' });
      }
      const peaks = [['Mount Everest', 8849], ['K2', 8611], ['Mount Kilimanjaro', 5895], ['Mont Blanc', 4806], ['Mount Elbrus', 5642], ['Mount Fuji', 3776], ['Mount Olympus', 2918]];
      const [p1, p2] = U.sample(peaks, 2).sort((x, y) => y[1] - x[1]);
      return num(`${p1[0]} is ${p1[1]} m high. ${p2[0]} is ${p2[1]} m high.\nHow much higher is ${p1[0]}?`, p1[1] - p2[1],
        ['"How much higher" means find the difference: subtract the smaller height from the bigger one.', subHint(p1[1], p2[1])],
        `${p1[1]} − ${p2[1]} = ${p1[1] - p2[1]} m.`, { unit: 'm' });
    };

    const estimateQ = () => {
      const add = coin();
      const [a, b] = retry(() => {
        const x = R(1200, 9800), y = R(1200, add ? 9800 : x - 1000);
        const e = add ? est(x, 1000) + est(y, 1000) : est(x, 1000) - est(y, 1000);
        return Math.abs((add ? x + y : x - y) - e) < 400 && e >= 2000 ? [x, y] : null;
      });
      const e = add ? est(a, 1000) + est(b, 1000) : est(a, 1000) - est(b, 1000);
      return choice(`Which is the best estimate for ${a} ${add ? '+' : M} ${b}?`, F(e), [F(e + 1000), F(e - 1000), F(e * 10), F(e + 2000)].filter(x => x !== '0'),
        ['Round each number to the nearest 1000 first. Then do the easy calculation.',
          `${a} rounds to ${est(a, 1000)}. What does ${b} round to?`],
        `${a} ≈ ${est(a, 1000)} and ${b} ≈ ${est(b, 1000)}. ${est(a, 1000)} ${add ? '+' : M} ${est(b, 1000)} = ${F(e)}.`);
    };

    PMLM.registerSkill({
      id: 'g5.addSub', grade: 5, unit: 'g5.u2', title: 'Adding and subtracting', icon: '➕',
      blurb: 'Add and subtract big numbers and decimals',
      lesson: [
        { title: 'Line up the columns',
          text: 'Write the numbers in columns: ones under ones, tens under tens, and so on.\nStart adding from the **right**.\n4578 + 2365 = 6943',
          visual: { type: 'table', headers: ['', 'Th', 'H', 'T', 'O'], rows: [['', '4', '5', '7', '8'], ['+', '2', '3', '6', '5'], ['=', '6', '9', '4', '3']] } },
        { title: 'Carrying',
          text: 'When a column adds up to 10 or more, write the ones digit and **carry 1** to the next column.\nOnes: 8 + 5 = 13. Write 3, carry 1.\nTens: 7 + 6 + 1 = 14. Write 4, carry 1.' },
        { title: 'Exchanging',
          text: 'When you subtract and the top digit is smaller, **exchange** 1 from the column to the left.\n52 − 17: 2 − 7 is not possible. Exchange 1 ten for 10 ones: 12 − 7 = 5. Then 4 − 1 = 3.\nAnswer: 35' },
        { title: 'Decimals: line up the points',
          text: 'Put the decimal points under each other. Fill gaps with zeros.\n4.5 + 2.37 → 4.50 + 2.37 = 6.87\n**Tip:** estimate first, so you can spot a silly answer.' },
        { title: 'Worked example',
          text: 'Work out 7402 − 2658.\n**1.** Ones: 2 − 8 is not possible. The tens digit is 0, so exchange from the hundreds: 4 hundreds → 3 hundreds and 9 tens and 12 ones. 12 − 8 = 4.\n**2.** Tens: 9 − 5 = 4.\n**3.** Hundreds: 3 − 6 is not possible. Exchange 1 thousand: 13 − 6 = 7.\n**4.** Thousands: 6 − 2 = 4.\nAnswer: **4744**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [addQ, addQ, subQ, subQ, missingQ, wordQ, spotQ],
          [addQ, subQ, decQ, missingQ, spotQ, wordQ],
          [addQ, subQ, decQ, decQ, missingQ, spotQ, wordQ, estimateQ],
        ], ctx);
      },
    });
  }

  /* 7 ── Multiplying */
  {
    const split = n => digitsOf(n).map((d, i, a) => d * Math.pow(10, a.length - 1 - i)).filter(v => v > 0);

    const oneDigit = L => {
      const a = retry(() => { const x = L === 1 ? R(23, 389) : L === 2 ? R(124, 3999) : R(1234, 9876); return split(x).length >= 2 ? x : null; }), b = R(L === 1 ? 2 : 3, 9);
      const parts = split(a), ans = a * b;
      return num(`Work out ${F(a)} × ${b}`, ans,
        ['Split the big number into thousands, hundreds, tens and ones. Multiply each part, then add.',
          `${F(a)} = ${parts.map(p => F(p)).join(' + ')}. Start with ${F(parts[0])} × ${b} = ${F(parts[0] * b)}.`],
        `${parts.map(p => `${F(p)} × ${b} = ${F(p * b)}`).join(', ')}. Add them: ${F(ans)}.`,
        L < 3 ? { visual: { type: 'table', headers: ['×'].concat(parts.map(p => F(p))), rows: [[String(b)].concat(parts.map(() => ''))] } } : {});
    };

    const twoByTwo = L => {
      const [a, b] = retry(() => {
        const x = L === 2 ? R(11, 19) : R(13, 98), y = L === 2 ? R(12, 45) : R(13, 98);
        return x % 10 && y % 10 && x !== y ? [x, y] : null;
      });
      const tA = a - a % 10, oA = a % 10, tB = b - b % 10, oB = b % 10;
      const cells = [tA * tB, oA * tB, tA * oB, oA * oB];
      return num(`Work out ${a} × ${b}`, a * b,
        ['Use the grid method: split both numbers into tens and ones. Multiply each pair, then add all four answers.',
          `${tA} × ${tB} = ${tA * tB}. Now find the other three boxes.`],
        `${tA} × ${tB} = ${cells[0]}, ${oA} × ${tB} = ${cells[1]}, ${tA} × ${oB} = ${cells[2]}, ${oA} × ${oB} = ${cells[3]}. Total: ${cells.join(' + ')} = ${F(a * b)}.`,
        { visual: { type: 'table', headers: ['×', String(tA), String(oA)], rows: [[String(tB), '', ''], [String(oB), '', '']] } });
    };

    const gridMissing = L => {
      let headers, rows, ans, colV, rowV, label;
      if (L === 1) {
        const a = retry(() => { const x = R(23, 389); return split(x).length >= 2 ? x : null; }), b = R(3, 9), parts = split(a), k = R(0, parts.length - 1);
        headers = ['×'].concat(parts.map(p => F(p))); rows = [[String(b)].concat(parts.map((p, i) => (i === k ? '□' : F(p * b))))];
        ans = parts[k] * b; colV = parts[k]; rowV = b; label = `${F(a)} × ${b}`;
      } else {
        const a = R(13, 98), b = R(13, 98);
        if (a % 10 < 2 || b % 10 < 2) return gridMissing(L);
        const cols = [a - a % 10, a % 10], rws = [b - b % 10, b % 10], ki = R(0, 1), kj = R(0, 1);
        headers = ['×', String(cols[0]), String(cols[1])];
        rows = rws.map((r, i) => [String(r)].concat(cols.map((c, j) => (i === ki && j === kj ? '□' : F(c * r)))));
        ans = cols[kj] * rws[ki]; colV = cols[kj]; rowV = rws[ki]; label = `${a} × ${b}`;
      }
      const c0 = +String(colV)[0], r0 = +String(rowV)[0], zeros = (String(colV).length - 1) + (String(rowV).length - 1);
      return num(`This grid works out ${label}.\nWhat number goes in the box □?`, ans,
        ['Each box = the number at the top of its column × the number at the start of its row.',
          zeros ? `The box is ${F(colV)} × ${F(rowV)}. First do ${c0} × ${r0} = ${c0 * r0}, then put back ${zeros === 1 ? 'the zero' : `the ${zeros} zeros`}.`
            : `The box is ${colV} × ${rowV}. Use your times tables.`],
        `${F(colV)} × ${F(rowV)} = ${F(ans)}.`, { visual: { type: 'table', headers, rows } });
    };

    const tensFacts = L => {
      const x0 = R(2, 9), y0 = R(2, 9), zx = R(1, L === 1 ? 1 : 2), zy = R(0, 1);
      const x = x0 * Math.pow(10, zx), y = y0 * Math.pow(10, zy), ans = x * y;
      return num(`Work out ${F(x)} × ${F(y)}`, ans,
        ['Multiply the non-zero digits using your times tables. Then put all the zeros back on the end.',
          `${x0} × ${y0} = ${x0 * y0}. How many zeros are there in the question altogether?`],
        `${x0} × ${y0} = ${x0 * y0}. There ${zx + zy === 1 ? 'is 1 zero' : `are ${zx + zy} zeros`} to put back, so ${F(x)} × ${F(y)} = ${F(ans)}.`);
    };

    const spotQ = () => {
      const [a, b] = retry(() => { const x = R(13, 49), y = R(13, 49); return x % 10 && y % 10 ? [x, y] : null; });
      const tB = b - b % 10, oB = b % 10, t1 = tB / 10, wrong = a * oB + a * t1, who = U.name();
      return num(`${who} worked out ${a} × ${b} and got ${wrong}.\n${who} forgot that the ${t1} in ${b} means ${tB}. What is the correct answer?`, a * b,
        [`Split ${b} into ${tB} and ${oB}. Work out ${a} × ${tB} and ${a} × ${oB}, then add.`,
          `${a} × ${oB} = ${a * oB}. Now work out ${a} × ${tB}.`],
        `${a} × ${tB} = ${a * tB} and ${a} × ${oB} = ${a * oB}. ${a * tB} + ${a * oB} = ${F(a * b)}.`);
    };

    const wordQ = (L, ctx) => {
      const cur = ctx.currency, t = R(1, 4);
      const [a, b] = retry(() => {
        const p = L === 1 ? [R(12, 99), R(3, 9)] : L === 2 ? (coin() ? [R(112, 999), R(3, 9)] : [R(12, 19), R(21, 48)]) : (coin() ? [R(1050, 4999), R(3, 9)] : [R(21, 89), R(21, 89)]);
        return p[0] % 10 && p[1] % 10 ? p : null;
      });
      const ans = a * b;
      const big = Math.max(a, b), small = Math.min(a, b);
      const texts = {
        1: [`A box holds ${big} pencils.\nHow many pencils are in ${small} boxes?`, 'pencils'],
        2: [`A bike costs ${money(cur, big)}.\nHow much do ${small} bikes cost?`, ''],
        3: [`A cinema has ${small} rows. Each row has ${big} seats.\nHow many seats are there altogether?`, 'seats'],
        4: [`A train travels ${big} km every day.\nHow far does it travel in ${small} days?`, 'km'],
      };
      const [q, unit] = texts[t];
      return num(q, ans,
        [`This is ${small} groups of ${big}, so multiply: ${F(big)} × ${small}.`,
          small < 10 ? `Split ${F(big)} into ${split(big).map(p => F(p)).join(' + ')}. Start with ${F(split(big)[0])} × ${small} = ${F(split(big)[0] * small)}.`
            : `Split ${small} into ${small - small % 10} and ${small % 10}. Start with ${F(big)} × ${small - small % 10} = ${F(big * (small - small % 10))}.`],
        `${F(big)} × ${small} = ${F(ans)}${t === 2 ? '' : ' ' + unit}.`, t === 2 ? { prefix: cur } : { unit });
    };

    PMLM.registerSkill({
      id: 'g5.multiply', grade: 5, unit: 'g5.u2', title: 'Multiplying', icon: '✖️',
      blurb: 'Multiply 4-digit by 1-digit and 2-digit by 2-digit',
      lesson: [
        { title: 'Split and multiply',
          text: 'Split the big number into parts. Multiply each part, then add.\n34 × 6 = 30 × 6 + 4 × 6\n= 180 + 24 = **204**',
          visual: { type: 'table', headers: ['×', '30', '4'], rows: [['6', '180', '24']] } },
        { title: 'Bigger numbers',
          text: '2153 × 4: split 2153 into 2000 + 100 + 50 + 3.\n2000 × 4 = 8000, 100 × 4 = 400, 50 × 4 = 200, 3 × 4 = 12.\nAdd: 8000 + 400 + 200 + 12 = **8612**' },
        { title: '2-digit × 2-digit',
          text: 'Split **both** numbers into tens and ones. Fill in the grid, then add all four boxes.\n23 × 14 = 200 + 30 + 80 + 12 = **322**',
          visual: { type: 'table', headers: ['×', '20', '3'], rows: [['10', '200', '30'], ['4', '80', '12']] } },
        { title: 'Zeros and estimates',
          text: 'For 40 × 30, do 4 × 3 = 12, then put back the two zeros: **1200**.\n**Tip:** estimate to check. 23 × 14 is about 20 × 15 = 300, so 322 makes sense.' },
        { title: 'Worked example',
          text: 'Work out 47 × 26.\n**1.** Split: 47 = 40 + 7 and 26 = 20 + 6.\n**2.** 40 × 20 = 800, 7 × 20 = 140, 40 × 6 = 240, 7 × 6 = 42.\n**3.** Add: 800 + 140 + 240 + 42.\nAnswer: **1222**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [oneDigit, oneDigit, gridMissing, tensFacts, wordQ],
          [oneDigit, twoByTwo, twoByTwo, gridMissing, tensFacts, wordQ, spotQ],
          [oneDigit, twoByTwo, twoByTwo, gridMissing, wordQ, spotQ],
        ], ctx);
      },
    });
  }

  /* 8 ── Dividing */
  {
    const firstStep = (a, d) => {
      const s = String(a), h = +s[0];
      if (h >= d) return `Start with the first digit: ${h} ÷ ${d} = ${Math.floor(h / d)}${h % d ? ` remainder ${h % d}. Carry the ${h % d} to the next digit to make ${(h % d) * 10 + +s[1]}` : ''}.`;
      const hh = +(s[0] + s[1]);
      return `${h} is smaller than ${d}, so look at the first two digits: ${hh} ÷ ${d} = ${Math.floor(hh / d)}${hh % d ? ` remainder ${hh % d}. Carry the ${hh % d} to the next digit` : ''}.`;
    };
    const HOW = 'Use short division: divide each digit from the left. Carry any remainder to the next digit.';
    const makeExact = L => retry(() => {
      const d = R(L === 1 ? 2 : 3, 9);
      let q;
      if (L === 1) {
        if (coin()) q = R(11, 49);
        else { q = +[R(1, 3), R(0, 3), R(1, 3)].join(''); if (q * d > 999) return null; }
      } else q = R(Math.ceil(100 / d), Math.floor(999 / d));
      const a = q * d;
      if (a < 20 || a > 999) return null;
      return { a, d, q };
    });
    const makeRem = () => retry(() => {
      const d = R(3, 9), a = R(100, 999), q = Math.floor(a / d), r = a % d;
      return r && q > 10 ? { a, d, q, r } : null;
    });

    const exactQ = L => {
      const { a, d, q } = makeExact(L);
      return num(`Work out ${a} ÷ ${d}`, q, [HOW, firstStep(a, d)],
        `${a} ÷ ${d} = ${q}. Check: ${q} × ${d} = ${a}.`);
    };

    const remChoice = () => {
      const { a, d, q, r } = makeRem();
      const wr = [`${q - 1} r ${r + d}`, r + 1 < d ? `${q} r ${r + 1}` : `${q} r ${r - 1}`, `${q + 1} r ${r}`, d - r !== r ? `${q} r ${d - r}` : `${q - 1} r ${r}`];
      return choice(`Work out ${a} ÷ ${d}`, `${q} r ${r}`, wr,
        ['Divide as far as you can. What is left over is the remainder. It must be smaller than the number you divide by.', firstStep(a, d)],
        `${q} × ${d} = ${q * d} and ${a} − ${q * d} = ${r}. So ${a} ÷ ${d} = ${q} r ${r}.`);
    };

    const remNum = () => {
      const { a, d, q, r } = makeRem();
      return num(`What is the remainder when ${a} is divided by ${d}?`, r,
        ['Divide as far as you can. The amount left over is the remainder.', firstStep(a, d)],
        `${a} ÷ ${d} = ${q} r ${r}, because ${q} × ${d} = ${q * d} and ${a} − ${q * d} = ${r}.`);
    };

    const missingQ = L => {
      if (L === 3 && coin()) {
        const { a, d, q, r } = makeRem();
        return num(`Find the missing number.\n□ ÷ ${d} = ${q} r ${r}`, a,
          ['Use the inverse: multiply, then add the remainder back on.', `${q} × ${d} = ${q * d}. Now add the remainder.`],
          `${q} × ${d} = ${q * d}, and ${q * d} + ${r} = ${a}. So □ = ${a}.`);
      }
      const { a, d, q } = makeExact(L);
      return num(`Find the missing number.\n□ ÷ ${d} = ${q}`, a,
        ['Use the inverse: × undoes ÷.', `□ = ${q} × ${d}.`],
        `${q} × ${d} = ${a}, so □ = ${a}. Check: ${a} ÷ ${d} = ${q}.`);
    };

    const contextQ = (L, ctx) => {
      const t = R(1, 3), who = U.name();
      const d = R(3, 8), n = retry(() => { const x = R(L === 1 ? 20 : 40, L === 1 ? 60 : 300); return x % d ? x : null; });
      const q = Math.floor(n / d), r = n % d;
      if (t === 1) {
        return num(`${n} children are going on a trip. Each minibus carries ${d} children.\nHow many minibuses are needed?`, q + 1,
          ['Divide first. Then think: what does the remainder mean in this story?', `${n} ÷ ${d} = ${q} r ${r}.`],
          `${n} ÷ ${d} = ${q} r ${r}. ${q} minibuses leave ${r} children behind, so ${q + 1} minibuses are needed.`, { unit: 'minibuses' });
      }
      if (t === 2) {
        return num(`A farmer has ${n} eggs. A box holds ${d} eggs.\nHow many boxes can be **filled**?`, q,
          ['Divide first. Then think: what does the remainder mean in this story?', `Count in ${d}s: ${d}, ${2 * d}, ${3 * d}, … Stop before you go past ${n}.`],
          `${n} ÷ ${d} = ${q} r ${r}. The ${r} eggs left over cannot fill another box, so ${q} boxes are filled.`, { unit: 'boxes' });
      }
      const ex = makeExact(L);
      return num(`${ex.a} stickers are shared equally between ${ex.d} friends.\nHow many stickers does each friend get?`, ex.q,
        ['Sharing equally means divide.', firstStep(ex.a, ex.d)],
        `${ex.a} ÷ ${ex.d} = ${ex.q} stickers each.`, { unit: 'stickers' });
    };

    const spotQ = () => {
      const { a, d, q, r } = makeRem(), who = U.name();
      const wrong = `${q - 1} r ${r + d}`;
      return choice(`${who} says ${a} ÷ ${d} = ${wrong}.\nWhat is the correct answer?`, `${q} r ${r}`,
        [wrong, `${q - 1} r ${r}`, `${q + 1} r ${r}`, `${q} r ${r + d}`],
        ['Look at the remainder. Can a remainder be bigger than the number you divide by?',
          `The remainder ${r + d} is bigger than ${d}, so another ${d} still fits in.`],
        `${r + d} − ${d} = ${r}, so one more ${d} fits: ${a} ÷ ${d} = ${q} r ${r}.`);
    };

    PMLM.registerSkill({
      id: 'g5.divide', grade: 5, unit: 'g5.u2', title: 'Dividing', icon: '➗',
      blurb: 'Divide 3-digit numbers by 1-digit, with remainders',
      lesson: [
        { title: 'Split and divide',
          text: 'Split the number into parts that are easy to divide.\n84 ÷ 4: 80 ÷ 4 = 20 and 4 ÷ 4 = 1.\nSo 84 ÷ 4 = **21**.',
          visual: { type: 'barModel', rows: [{ label: '÷ 4', parts: 4, value: '21' }], total: '84' } },
        { title: 'Short division',
          text: 'Divide each digit from the left. Carry any remainder to the next digit.\n456 ÷ 3: 4 ÷ 3 = 1 r 1. Carry 1 to make 15.\n15 ÷ 3 = 5. Then 6 ÷ 3 = 2.\nSo 456 ÷ 3 = **152**.' },
        { title: 'Remainders',
          text: 'Sometimes there are some left over. This is the **remainder**.\n14 ÷ 4 = 3 r 2: three groups of 4, and 2 left over.\nThe remainder is always smaller than the number you divide by.',
          visual: { type: 'objects', groups: [4, 4, 4, 2], emoji: '🍪' } },
        { title: 'Remainders in stories',
          text: '30 children, 4 in each car: 30 ÷ 4 = 7 r 2. The 2 children still need a car, so you need **8** cars (round up).\n30 eggs, 4 in each box: 7 r 2. Only **7** boxes are full (round down).' },
        { title: 'Worked example',
          text: 'Work out 517 ÷ 4.\n**1.** 5 ÷ 4 = 1 r 1. Carry 1 to make 11.\n**2.** 11 ÷ 4 = 2 r 3. Carry 3 to make 37.\n**3.** 37 ÷ 4 = 9 r 1.\n**4.** Check: 129 × 4 = 516, and 516 + 1 = 517.\nAnswer: **129 r 1**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [exactQ, exactQ, exactQ, missingQ, contextQ],
          [exactQ, exactQ, remChoice, remNum, missingQ, contextQ],
          [exactQ, remChoice, remNum, missingQ, contextQ, spotQ],
        ], ctx);
      },
    });
  }

  /* 9 ── Order of operations */
  {
    // each template: e = expression, v = value, w = a wrong answer from a common order mistake, first = first step, steps = full working
    const T = {
      addMul: L => { const a = R(2, L === 1 ? 12 : 30), b = R(2, 9), c = R(2, 9);
        return { e: `${a} + ${b} × ${c}`, v: a + b * c, w: (a + b) * c, first: `Do the × first: ${b} × ${c} = ${b * c}.`, steps: `${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.` }; },
      subMul: L => { const b = R(2, 9), c = R(2, 9), a = b * c + R(1, L === 1 ? 15 : 40);
        return { e: `${a} − ${b} × ${c}`, v: a - b * c, w: (a - b) * c, first: `Do the × first: ${b} × ${c} = ${b * c}.`, steps: `${b} × ${c} = ${b * c}, then ${a} − ${b * c} = ${a - b * c}.` }; },
      brAddMul: L => { const a = R(2, L === 1 ? 9 : 15), b = R(2, 9), c = R(2, 9);
        return { e: `(${a} + ${b}) × ${c}`, v: (a + b) * c, w: a + b * c, first: `Brackets first: ${a} + ${b} = ${a + b}.`, steps: `${a} + ${b} = ${a + b}, then ${a + b} × ${c} = ${(a + b) * c}.` }; },
      subAdd: L => { const b = R(3, 15), c = R(2, 15), a = b + c + R(2, L === 1 ? 20 : 50); if (b === c) return { v: -1 };
        return { e: `${a} − ${b} + ${c}`, v: a - b + c, w: a - (b + c), first: `Only + and −, so work from left to right: ${a} − ${b} = ${a - b}.`, steps: `Left to right: ${a} − ${b} = ${a - b}, then ${a - b} + ${c} = ${a - b + c}.` }; },
      addDiv: () => { const c = R(2, 9), q = R(2, 9), b = c * q, a = R(2, 30);
        return { e: `${a} + ${b} ÷ ${c}`, v: a + q, w: (a + b) / c, first: `Do the ÷ first: ${b} ÷ ${c} = ${q}.`, steps: `${b} ÷ ${c} = ${q}, then ${a} + ${q} = ${a + q}.` }; },
      mulBrSub: () => { const a = R(2, 9), c = R(1, 9), b = c + R(2, 9);
        return { e: `${a} × (${b} − ${c})`, v: a * (b - c), w: a * b - c, first: `Brackets first: ${b} − ${c} = ${b - c}.`, steps: `${b} − ${c} = ${b - c}, then ${a} × ${b - c} = ${a * (b - c)}.` }; },
      brSubDiv: () => { const c = R(2, 9), q = R(2, 9), b = R(1, 9) * c, a = q * c + b;
        return { e: `(${a} − ${b}) ÷ ${c}`, v: q, w: a - b / c, first: `Brackets first: ${a} − ${b} = ${a - b}.`, steps: `${a} − ${b} = ${a - b}, then ${a - b} ÷ ${c} = ${q}.` }; },
      subBr: () => { const b = R(5, 25), c = R(3, 20), a = b + c + R(5, 40);
        return { e: `${a} − (${b} + ${c})`, v: a - b - c, w: a - b + c, first: `Brackets first: ${b} + ${c} = ${b + c}.`, steps: `${b} + ${c} = ${b + c}, then ${a} − ${b + c} = ${a - b - c}.` }; },
      divMul: () => { const b = R(2, 6), c = R(2, 6), q = R(2, 6) * c, a = q * b;
        return { e: `${a} ÷ ${b} × ${c}`, v: q * c, w: a / (b * c), first: `÷ and × are equal partners, so work from left to right: ${a} ÷ ${b} = ${q}.`, steps: `Left to right: ${a} ÷ ${b} = ${q}, then ${q} × ${c} = ${q * c}.` }; },
      twoProd: () => { const a = R(2, 9), b = R(2, 9), c = R(2, 9), d = R(2, 9);
        return { e: `${a} × ${b} + ${c} × ${d}`, v: a * b + c * d, w: (a * b + c) * d, first: `Do both × first: ${a} × ${b} = ${a * b}.`, steps: `${a} × ${b} = ${a * b} and ${c} × ${d} = ${c * d}, then ${a * b} + ${c * d} = ${a * b + c * d}.` }; },
    };
    const pool = L => (L === 1 ? ['addMul', 'subMul', 'brAddMul', 'subAdd']
      : L === 2 ? ['addMul', 'subMul', 'brAddMul', 'addDiv', 'mulBrSub', 'brSubDiv', 'subBr']
        : ['addMul', 'subMul', 'brAddMul', 'addDiv', 'mulBrSub', 'brSubDiv', 'subBr', 'divMul', 'twoProd']);
    const make = L => retry(() => { const t = T[pick(pool(L))](L); return t.v >= 0 && t.w >= 0 && Number.isInteger(t.w) && t.w !== t.v && !t.first.includes(`= ${t.v}.`) ? t : null; });
    const RULE = 'Brackets first. Then × and ÷. Then + and −.';

    const evalQ = L => {
      const t = make(L);
      return num(`Work out ${t.e}`, t.v, [RULE, t.first], t.steps);
    };

    const choiceQ = L => {
      const t = make(L);
      return nchoice(`What is ${t.e}?`, t.v, [t.w, t.v + 10, t.v - 1], [RULE, t.first], `${t.steps} (Working straight from left to right gives ${t.w}, which is wrong.)`);
    };

    const spotQ = L => {
      const t = make(L), who = U.name();
      return num(`${who} says ${t.e} = ${t.w}.\nWhat is the correct answer?`, t.v,
        [`Check the order: ${RULE}`, t.first], `${t.steps} So the answer is ${t.v}, not ${t.w}.`);
    };

    const bracketQ = () => {
      const r = retry(() => {
        const a = R(2, 9), b = R(2, 9), c = R(2, 9);
        const opts = [[`(${a} + ${b}) × ${c}`, (a + b) * c], [`${a} + ${b} × ${c}`, a + b * c], [`${a} × (${b} + ${c})`, a * (b + c)], [`${a} × ${b} + ${c}`, a * b + c]];
        return new Set(opts.map(o => o[1])).size === 4 ? opts : null;
      });
      const k = R(0, 3), [e, v] = r[k], other = r[(k + 1) % 4];
      return choice(`Which calculation has the answer **${v}**?`, e, r.filter((o, i) => i !== k).map(o => o[0]),
        [`Work out each one. ${RULE}`, `For example, ${other[0]} = ${other[1]}. Now try the others.`],
        `${e} = ${v}. Brackets change which part you do first.`);
    };

    const missingQ = () => {
      if (coin()) {
        const x = R(2, 9), b = R(2, 9), c = R(2, 9), Tt = (x + b) * c;
        return num(`Find the missing number.\n(□ + ${b}) × ${c} = ${Tt}`, x,
          ['Work backwards. Undo the × first, then undo the +.', `The bracket must be ${Tt} ÷ ${c} = ${Tt / c}. So □ + ${b} = ${Tt / c}.`],
          `${Tt} ÷ ${c} = ${Tt / c}, and ${Tt / c} − ${b} = ${x}. Check: (${x} + ${b}) × ${c} = ${Tt}.`);
      }
      const a = R(3, 30), x = R(2, 9), c = R(2, 9), Tt = a + x * c;
      return num(`Find the missing number.\n${a} + □ × ${c} = ${Tt}`, x,
        ['The × part is done first, so it must make up the rest of the total.', `□ × ${c} = ${Tt} − ${a} = ${Tt - a}.`],
        `${Tt} − ${a} = ${Tt - a}, and ${Tt - a} ÷ ${c} = ${x}. Check: ${a} + ${x} × ${c} = ${a} + ${x * c} = ${Tt}.`);
    };

    PMLM.registerSkill({
      id: 'g5.orderOps', grade: 5, unit: 'g5.u2', title: 'Order of operations', icon: '🚦',
      blurb: 'Brackets first, then × and ÷, then + and −',
      lesson: [
        { title: 'Which part first?',
          text: 'What is 2 + 3 × 4?\nLeft to right gives 5 × 4 = 20. **That is wrong!**\nThe rule says × comes before +: 3 × 4 = 12, then 2 + 12 = **14**.' },
        { title: 'The order',
          text: 'Always work in this order:\n**1.** Brackets ( )\n**2.** × and ÷\n**3.** + and −',
          visual: { type: 'table', headers: ['Order', 'What to do'], rows: [['1st', 'Brackets ( )'], ['2nd', '× and ÷'], ['3rd', '+ and −']] } },
        { title: 'Brackets change the answer',
          text: 'Brackets say "do me first!"\n(2 + 3) × 4 = 5 × 4 = **20**\n2 + 3 × 4 = 2 + 12 = **14**\nSame numbers, different answers.' },
        { title: 'Equal partners: left to right',
          text: '× and ÷ are equal partners. + and − are equal partners.\nWhen only partners are left, work from **left to right**.\n20 − 5 + 3 = 15 + 3 = **18** (not 20 − 8 = 12)' },
        { title: 'Worked example',
          text: 'Work out 18 − (4 + 2) × 2.\n**1.** Brackets: 4 + 2 = 6.\n**2.** Multiply: 6 × 2 = 12.\n**3.** Subtract: 18 − 12 = 6.\nAnswer: **6**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [evalQ, evalQ, choiceQ, spotQ],
          [evalQ, evalQ, choiceQ, spotQ, bracketQ],
          [evalQ, choiceQ, spotQ, bracketQ, missingQ],
        ], ctx);
      },
    });
  }

  /* 10 ── Multi-step word problems */
  {
    const changeQ = (L, ctx) => {
      const cur = ctx.currency, who = U.name();
      if (L < 3) {
        const n = R(2, L === 1 ? 5 : 6), p = L === 1 ? R(2, 9) * 100 : R(105, 495), tot = n * p;
        const note = [1000, 2000, 5000, 10000].find(x => x > tot);
        const item = pick(['pens', 'notebooks', 'apples', 'bottles of water', 'stickers']);
        return num(`${who} buys ${n} ${item}. Each one costs ${money(cur, p / 100)}.\n${who} pays with a ${money(cur, note / 100)} note. How much change does ${who} get?`, U.clean((note - tot) / 100),
          ['Step 1: find the total cost. Step 2: take it away from the money paid.', `Step 1: ${n} × ${money(cur, p / 100)} = ${money(cur, tot / 100)}.`],
          `${n} × ${money(cur, p / 100)} = ${money(cur, tot / 100)}. Then ${money(cur, note / 100)} − ${money(cur, tot / 100)} = ${money(cur, (note - tot) / 100)}.`, { prefix: cur });
      }
      const n1 = R(2, 4), p1 = R(125, 395), n2 = R(2, 3), p2 = R(55, 195), t1 = n1 * p1, t2 = n2 * p2, tot = t1 + t2;
      const note = [2000, 5000, 10000].find(x => x > tot);
      return num(`${who} buys ${n1} sandwiches at ${money(cur, p1 / 100)} each and ${n2} drinks at ${money(cur, p2 / 100)} each.\n${who} pays with a ${money(cur, note / 100)} note. How much change does ${who} get?`, U.clean((note - tot) / 100),
        ['Find the cost of the sandwiches and the drinks. Add them. Then take the total away from the money paid.', `Sandwiches: ${n1} × ${money(cur, p1 / 100)} = ${money(cur, t1 / 100)}.`],
        `Sandwiches ${money(cur, t1 / 100)} + drinks ${money(cur, t2 / 100)} = ${money(cur, tot / 100)}. Change: ${money(cur, note / 100)} − ${money(cur, tot / 100)} = ${money(cur, (note - tot) / 100)}.`, { prefix: cur });
    };

    const shareQ = L => {
      const r = retry(() => {
        const t = R(3, 8), per = R(L === 1 ? 3 : 6, L === 1 ? 12 : 30), total = t * per, k = R(2, 9), m = total / k;
        return Number.isInteger(m) && m >= 6 && m <= 60 && k !== t ? { t, per, total, k, m } : null;
      });
      return num(`There are ${r.k} boxes with ${r.m} pencils in each box.\nThe pencils are shared equally between ${r.t} tables. How many pencils does each table get?`, r.per,
        ['Step 1: find the total number of pencils. Step 2: share them equally.', `Step 1: ${r.k} × ${r.m} = ${r.total} pencils.`],
        `${r.k} × ${r.m} = ${r.total} pencils. ${r.total} ÷ ${r.t} = ${r.per} pencils for each table.`,
        { unit: 'pencils', visual: { type: 'barModel', rows: [{ label: 'Boxes', parts: r.k, value: String(r.m) }], total: '?' } });
    };

    const busQ = L => {
      const s = R(L === 1 ? 20 : 30, L === 1 ? 45 : 70), x = R(5, Math.min(25, s - 3)), y = R(4, 30);
      if (L === 3) {
        const x2 = R(3, 12), y2 = R(2, 15), mid = s - x + y;
        if (mid - x2 < 1 || x2 === y2) return busQ(L);
        const end = mid - x2 + y2;
        return num(`A bus has ${s} people on it. At the first stop, ${x} get off and ${y} get on.\nAt the second stop, ${x2} get off and ${y2} get on. How many people are on the bus now?`, end,
          ['Getting off means subtract. Getting on means add. Go one stop at a time.', `After the first stop: ${s} − ${x} + ${y} = ${mid}.`],
          `First stop: ${s} − ${x} + ${y} = ${mid}. Second stop: ${mid} − ${x2} + ${y2} = ${end}.`, { unit: 'people' });
      }
      return num(`A bus has ${s} people on it. At the next stop, ${x} people get off and ${y} people get on.\nHow many people are on the bus now?`, s - x + y,
        ['Getting off means subtract. Getting on means add. Do them in order.', `${s} − ${x} = ${s - x}.`],
        `${s} − ${x} = ${s - x}, then ${s - x} + ${y} = ${s - x + y} people.`, { unit: 'people' });
    };

    const saveQ = (L, ctx) => {
      const cur = ctx.currency, who = U.name();
      const w = L === 3 ? R(3, 12) + 0.5 : R(2, L === 1 ? 9 : 25), n = R(3, L === 1 ? 6 : 10), saved = U.clean(w * n);
      const C = Math.ceil(saved / 10) * 10 + R(1, 4) * 10;
      return num(`${who} saves ${money(cur, w)} every week for ${n} weeks.\nA game costs ${money(cur, C)}. How much more money does ${who} need?`, U.clean(C - saved),
        ['Step 1: find how much is saved. Step 2: find the difference between that and the price.', `Step 1: ${n} × ${money(cur, w)} = ${money(cur, saved)}.`],
        `${n} × ${money(cur, w)} = ${money(cur, saved)}. ${money(cur, C)} − ${money(cur, saved)} = ${money(cur, U.clean(C - saved))}.`, { prefix: cur });
    };

    const hallQ = L => {
      const rws = R(L === 1 ? 4 : 12, L === 1 ? 9 : 25), seats = R(L === 1 ? 6 : 15, L === 1 ? 12 : 30), e = R(3, Math.floor(rws * seats / 3));
      return num(`A hall has ${rws} rows of chairs with ${seats} chairs in each row.\n${e} chairs are empty. How many people are sitting down?`, rws * seats - e,
        ['Step 1: find the number of chairs. Step 2: take away the empty chairs.', `Step 1: ${rws} × ${seats} = ${rws * seats} chairs.`],
        `${rws} × ${seats} = ${rws * seats} chairs. ${rws * seats} − ${e} = ${rws * seats - e} people.`, { unit: 'people' });
    };

    const exprChoice = L => {
      if (coin()) {
        const s = R(20, 45), x = R(5, 15), y = R(4, 20);
        return choice(`A bus has ${s} people on it. ${x} people get off and ${y} people get on.\nWhich calculation finds how many people are on the bus now?`, `${s} − ${x} + ${y}`,
          [`${s} + ${x} + ${y}`, `${s} − ${x} − ${y}`, `${s} + ${x} − ${y}`],
          ['Getting off makes fewer people (−). Getting on makes more people (+).', `Start with ${s}. ${x} get off, so the first step is ${s} − ${x}.`],
          `${x} get off (− ${x}) and ${y} get on (+ ${y}): ${s} − ${x} + ${y} = ${s - x + y}.`);
      }
      const rws = R(4, 9), seats = R(6, 12), e = retry(() => { const x = R(3, 15); return x !== rws && x !== seats ? x : null; });
      return choice(`A hall has ${rws} rows of ${seats} chairs. ${e} chairs are empty.\nWhich calculation finds how many people are sitting down?`, `${rws} × ${seats} − ${e}`,
        [`${rws} + ${seats} − ${e}`, `${rws} × ${seats} + ${e}`, `${rws} × ${seats} × ${e}`],
        ['First find the total number of chairs. Rows of chairs means multiply.', `Total chairs = ${rws} × ${seats}. What do you do with the empty ones?`],
        `Chairs: ${rws} × ${seats} = ${rws * seats}. Take away the ${e} empty ones: ${rws} × ${seats} − ${e} = ${rws * seats - e}.`);
    };

    const threeStep = () => {
      const a = R(3, 8), b = R(12, 30), c = R(2, 6), d = R(10, 25), tot = a * b + c * d, g = R(Math.floor(tot / 4), Math.floor(tot * 3 / 4));
      if (tot - g === a * b || tot - g === c * d) return threeStep();
      return num(`A school buys ${a} boxes of ${b} pencils and ${c} packs of ${d} pens.\nIt gives out ${g} of these to the children. How many pencils and pens are left?`, tot - g,
        ['Find the number of pencils, then the number of pens. Add them. Then subtract what was given out.', `Pencils: ${a} × ${b} = ${a * b}.`],
        `Pencils: ${a} × ${b} = ${a * b}. Pens: ${c} × ${d} = ${c * d}. Total: ${tot}. Left: ${tot} − ${g} = ${tot - g}.`);
    };

    PMLM.registerSkill({
      id: 'g5.wordProblems', grade: 5, unit: 'g5.u2', title: 'Word problems', icon: '📝',
      blurb: 'Solve problems with two or more steps',
      lesson: [
        { title: 'Read, picture, plan',
          text: 'Read the question twice.\nAsk: **What do I know?** **What do I need to find?**\nMost problems here need two steps. Do one step at a time.' },
        { title: 'Draw a bar model',
          text: 'Sam has 3 bags with 12 marbles in each bag. Sam gives away 8 marbles.\nThe bar shows 3 × 12 = 36 marbles. Then 36 − 8 = **28** are left.',
          visual: { type: 'barModel', rows: [{ label: 'Bags', parts: 3, value: '12' }], total: '36' } },
        { title: 'Choose the operation',
          text: '**Altogether, total** → often add.\n**Difference, how many more, left** → often subtract.\n**Each, groups of, rows of** → often multiply.\n**Share equally** → divide.\nBut always think about the story, not just the words!' },
        { title: 'Check it makes sense',
          text: 'Estimate: is your answer about the right size?\nUse the inverse to check: if 36 − 8 = 28, then 28 + 8 = 36. ✓' },
        { title: 'Worked example',
          text: 'A school has 6 classes of 28 children. 37 children are away. How many are at school?\n**1.** Find the total: 6 × 28 = 168 children.\n**2.** Take away the children who are away: 168 − 37.\n**3.** 168 − 37 = 131.\nAnswer: **131 children**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [changeQ, shareQ, busQ, saveQ, hallQ, exprChoice],
          [changeQ, shareQ, busQ, saveQ, hallQ],
          [changeQ, shareQ, busQ, saveQ, hallQ, threeStep],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 3: Fractions, decimals, percentages and ratio ═══════════════════════
  PMLM.registerUnit({ id: 'g5.u3', grade: 5, name: 'Fractions, % and ratio', icon: '🍕' });

  const FN = { 2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths', 6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths',
    11: 'elevenths', 12: 'twelfths', 14: 'fourteenths', 15: 'fifteenths', 16: 'sixteenths', 18: 'eighteenths', 20: 'twentieths', 24: 'twenty-fourths', 100: 'hundredths' };
  // fname(4) = 'quarters', fname(4, 1) = 'quarter'
  const fname = (d, n) => { const p = FN[d] || `${d}ths`; return n === 1 ? (d === 2 ? 'half' : p.slice(0, -1)) : p; };
  const coprimeFrac = (dMin, dMax) => retry(() => { const d = R(dMin, dMax), n = R(1, d - 1); return U.gcd(n, d) === 1 ? [n, d] : null; });

  /* 11 ── Equivalent fractions and simplifying */
  {
    const missingQ = L => {
      const [n, d] = coprimeFrac(2, L === 1 ? 6 : 10), k = retry(() => { const x = R(2, L === 1 ? 4 : L === 2 ? 6 : 9); return x !== n && x !== d ? x : null; }), top = coin();
      if (L === 3 && coin()) {
        return num(`Find the missing number.\n${fr(n * k, d * k)} = ${top ? `{□/${d}}` : `{${n}/□}`}`, top ? n : d,
          ['Equivalent fractions: divide the top and the bottom by the **same** number.',
            top ? `${d * k} ÷ ${d} = ${k}, so the bottom was divided by ${k}.` : `${n * k} ÷ ${n} = ${k}, so the top was divided by ${k}.`],
          `${fr(n * k, d * k)} = ${fr(n, d)} (top and bottom ÷ ${k}). The missing number is ${top ? n : d}.`);
      }
      const vis = L === 1 && d * k <= 24 ? { visual: { type: 'fractionBar', bars: [{ parts: d, shaded: n }, { parts: d * k, shaded: 0 }] } } : {};
      return num(`Find the missing number.\n${fr(n, d)} = ${top ? `{□/${d * k}}` : `{${n * k}/□}`}`, top ? n * k : d * k,
        ['Equivalent fractions: multiply the top and the bottom by the **same** number.',
          top ? `${d} × ${k} = ${d * k}, so the bottom was multiplied by ${k}.` : `${n} × ${k} = ${n * k}, so the top was multiplied by ${k}.`],
        `${fr(n, d)} = ${fr(n * k, d * k)} (top and bottom × ${k}). The missing number is ${top ? n * k : d * k}.`, vis);
    };

    const simplifyQ = L => {
      const [n, d, k] = retry(() => {
        const [a, b] = coprimeFrac(2, L === 1 ? 6 : 12), m = R(2, L === 1 ? 4 : L === 2 ? 5 : 9);
        return b * m <= (L === 1 ? 24 : L === 2 ? 40 : 100) ? [a, b, m] : null;
      });
      const N = n * k, D = d * k;
      const vis = L === 1 && D <= 24 ? { visual: { type: 'fractionBar', bars: [{ parts: D, shaded: N }] } } : {};
      return fracQ(`Write ${fr(N, D)} in its simplest form.`, n, d,
        ['Divide the top and the bottom by the same number. Use the biggest number that divides both.',
          `The factors of ${N} are ${U.factors(N).join(', ')}. Which is the biggest one that also divides ${D}?`],
        `The biggest number that divides ${N} and ${D} is ${k}. ${N} ÷ ${k} = ${n} and ${D} ÷ ${k} = ${d}. So ${fr(N, D)} = ${fr(n, d)}.`,
        Object.assign({ simplest: true }, vis));
    };

    const whichEquiv = L => {
      const [n, d] = coprimeFrac(2, L === 1 ? 6 : 9), k = R(2, L === 1 ? 3 : 5);
      const same = (a, b) => a * d === b * n;
      const wr = [[n + 1, d + 1], [n + k, d + k], [n, d * k], [n * k, d + k], [n + 1, d]].filter(([a, b]) => a < b && !same(a, b));
      return choice(`Which fraction is equal to ${fr(n, d)}?`, fr(n * k, d * k), wr.map(([a, b]) => fr(a, b)),
        ['Multiply the top and the bottom by the **same** number. Adding the same number does not work!',
          `Check each one: what do you multiply ${d} by to get its bottom number? Does the top match?`],
        `${fr(n, d)} = ${fr(n * k, d * k)}, because the top and the bottom were both multiplied by ${k}.`);
    };

    const notEquiv = L => {
      const [n, d] = coprimeFrac(2, L === 2 ? 6 : 8), ks = U.sample([2, 3, 4, 5], 3);
      const bad = retry(() => { const a = n + R(1, 3), b = d + R(1, 3); return a < b && a * d !== b * n ? [a, b] : null; });
      return choice(`Which fraction is **not** equal to ${fr(n, d)}?`, fr(bad[0], bad[1]), ks.map(k => fr(n * k, d * k)),
        ['Equal fractions come from multiplying the top and bottom by the same number.',
          `For example, ${fr(n * ks[0], d * ks[0])} is ${fr(n, d)} with the top and bottom × ${ks[0]}. Check the others the same way.`],
        `${fr(bad[0], bad[1])} is not equal to ${fr(n, d)}: no number multiplies ${n} to give ${bad[0]} and ${d} to give ${bad[1]}. The others are all equal to ${fr(n, d)}.`);
    };

    const compareQ = L => {
      const d = R(2, 6), m = R(2, L === 2 ? 3 : 4), a = R(1, d - 1), D = d * m;
      const b = coin() && L === 3 ? a * m : retry(() => { const x = R(1, D - 1); return x !== a * m ? x : null; });
      const A = fr(a, d), B = fr(b, D), ans = b === a * m ? 'They are equal' : b > a * m ? B : A;
      const vis = L === 2 && D <= 24 ? { visual: { type: 'fractionBar', bars: [{ parts: d, shaded: a, label: A }, { parts: D, shaded: b, label: B }] } } : {};
      return choice(`Which fraction is bigger: ${A} or ${B}?`, ans, [A, B, 'They are equal'],
        ['Change them so they have the same denominator. Then compare the tops.',
          `${A} = ${fr(a * m, D)} (× ${m} top and bottom). Now compare with ${B}.`],
        `${A} = ${fr(a * m, D)}. ${ans === 'They are equal' ? `That is the same as ${B}, so they are equal.` : `${a * m} ${b > a * m ? '<' : '>'} ${b}, so ${ans} is bigger.`}`, vis);
    };

    PMLM.registerSkill({
      id: 'g5.equivFrac', grade: 5, unit: 'g5.u3', title: 'Equivalent fractions', icon: '🍰',
      blurb: 'Find equal fractions and simplify them',
      lesson: [
        { title: 'Same amount, different names',
          text: 'These bars have the same amount shaded.\n{1/2} = {2/4} = {4/8}\nFractions that are equal are called **equivalent**.',
          visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '{1/2}' }, { parts: 4, shaded: 2, label: '{2/4}' }, { parts: 8, shaded: 4, label: '{4/8}' }] } },
        { title: 'Multiply top and bottom',
          text: 'Multiply the top **and** the bottom by the same number.\n{2/3} = {4/6} (× 2) = {6/9} (× 3)\n**Never** just add: {2/3} is **not** {3/4}.' },
        { title: 'Simplifying',
          text: 'Divide the top and the bottom by the same number.\n{6/8} → divide both by 2 → {3/4}.\nA fraction is in its **simplest form** when only 1 divides both numbers.',
          visual: { type: 'fractionBar', bars: [{ parts: 8, shaded: 6, label: '{6/8}' }, { parts: 4, shaded: 3, label: '{3/4}' }] } },
        { title: 'Use the biggest factor',
          text: '{12/18}: the biggest number that divides 12 and 18 is 6.\n12 ÷ 6 = 2 and 18 ÷ 6 = 3, so {12/18} = {2/3} in one step.\n**Tip:** you can also divide in small steps: ÷ 2, then ÷ 3.' },
        { title: 'Worked example',
          text: 'Simplify {15/20}.\n**1.** Find a number that divides 15 and 20: 5 does.\n**2.** 15 ÷ 5 = 3 and 20 ÷ 5 = 4.\n**3.** Only 1 divides 3 and 4, so stop.\nAnswer: **{3/4}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [missingQ, missingQ, simplifyQ, whichEquiv],
          [missingQ, simplifyQ, simplifyQ, whichEquiv, notEquiv, compareQ],
          [missingQ, simplifyQ, simplifyQ, notEquiv, compareQ],
        ], ctx);
      },
    });
  }

  /* 12 ── Improper fractions and mixed numbers */
  {
    const make = L => retry(() => {
      const d = R(2, L === 1 ? 5 : L === 2 ? 8 : 12), w = R(1, L === 1 ? 3 : L === 2 ? 5 : 9), r = R(1, d - 1);
      return U.gcd(r, d) === 1 ? { d, w, r, n: w * d + r } : null;
    });
    const pies = (w, r, d) => ({ type: 'pie', pies: Array(w).fill({ parts: d, shaded: d }).concat([{ parts: d, shaded: r }]) });

    const toMixed = L => {
      const { d, w, r, n } = make(L);
      const vis = L === 1 && w <= 3 ? { visual: pies(w, r, d) } : {};
      return Object.assign({
        q: `Write ${fr(n, d)} as a mixed number.`, kind: 'fraction', answer: [n, d], mixed: true, simplest: true,
        hints: [`Divide the top by the bottom. The answer is the whole number. The remainder is the top of the fraction.`,
          `How many whole lots of ${d} fit into ${n}? Count in ${d}s: ${d}, ${2 * d}, ${3 * d}, …`],
        explain: `${n} ÷ ${d} = ${w} r ${r}, so ${fr(n, d)} = ${U.mixed(n, d)}.`,
      }, vis);
    };

    const toImproper = L => {
      const { d, w, r, n } = make(L);
      return fracQ(`Write ${U.mixed(n, d)} as an improper fraction.`, n, d,
        [`Change the wholes into ${fname(d)}: each whole is ${d} ${fname(d)}. Then add the extra ${fname(d)}.`,
          `${w} whole${w > 1 ? 's' : ''} = ${w} × ${d} = ${w * d} ${fname(d)}.`],
        `${w} × ${d} = ${w * d}, and ${w * d} + ${r} = ${n}. So ${U.mixed(n, d)} = ${fr(n, d)}.`);
    };

    const pieQ = L => {
      const { d, w, r, n } = retry(() => { const m = make(L); return m.d <= 8 && m.w <= 3 ? m : null; });
      return { q: 'What mixed number is shaded?', kind: 'fraction', answer: [n, d], mixed: true, visual: pies(w, r, d),
        hints: ['Count the fully shaded circles first. Then look at the circle that is only partly shaded.',
          `${w === 1 ? 'There is 1 whole circle' : `There are ${w} whole circles`} shaded. Each circle has ${d} equal parts.`],
        explain: `${w} whole${w > 1 ? 's' : ''} and ${fr(r, d)} more: ${U.mixed(n, d)}.` };
    };

    const missingWhole = L => {
      const { d, w, r, n } = make(L);
      return num(`Find the missing number.\n${fr(n, d)} = □ ${fr(r, d)}`, w,
        [`The whole number is how many lots of ${d} fit into ${n}.`, `Count in ${d}s up to ${n}: ${d}, ${2 * d}, …`],
        `${w} × ${d} = ${w * d}, and ${w * d} + ${r} = ${n}. So ${fr(n, d)} = ${U.mixed(n, d)} and □ = ${w}.`);
    };

    const compareQ = L => {
      const { d, w, r, n } = make(L);
      const n2 = coin() ? n : retry(() => { const x = n + R(-3, 3); return x !== n && x > d && x % d ? x : null; });
      const A = fr(n2, d), B = U.mixed(n, d), ans = n2 === n ? 'They are equal' : n2 > n ? A : B;
      return choice(`Which is bigger: ${A} or ${B}?`, ans, [A, B, 'They are equal'],
        ['Change the mixed number into an improper fraction. Then compare the tops.', `${w} whole${w > 1 ? 's' : ''} = ${w * d} ${fname(d)}. Add the ${r} extra ${fname(d, r)}.`],
        `${B} = ${fr(n, d)}. ${n2 === n ? `That is the same as ${A}.` : `${n2 > n ? n2 : n} ${fname(d)} is more than ${n2 > n ? n : n2} ${fname(d)}, so ${ans} is bigger.`}`);
    };

    const spotQ = L => {
      const { d, w, r, n } = make(L), who = U.name();
      const wr = [`${w} {${r}/${n}}`, `${w + 1} {${r}/${d}}`, ...(w < d ? [`${r} {${w}/${d}}`] : []), w > 1 ? `${w - 1} {${r + d}/${d}}` : `${w} {${d}/${r}}`].filter(x => x !== U.mixed(n, d));
      const said = wr[0];
      return choice(`${who} says ${fr(n, d)} = ${said}.\nWhat is the correct mixed number?`, U.mixed(n, d), wr,
        ['Divide the top by the bottom. The remainder goes on top of the fraction, and the bottom stays the same.',
          `How many lots of ${d} fit into ${n}? Count in ${d}s: ${d}, ${2 * d}, …`],
        `${n} ÷ ${d} = ${w} r ${r}, so ${fr(n, d)} = ${U.mixed(n, d)}. The denominator stays ${d}.`);
    };

    PMLM.registerSkill({
      id: 'g5.mixedNumbers', grade: 5, unit: 'g5.u3', title: 'Mixed numbers', icon: '🥧',
      blurb: 'Change between improper fractions and mixed numbers',
      lesson: [
        { title: 'More than one whole',
          text: 'In {7/4} the top is bigger than the bottom. It is an **improper fraction**.\n{7/4} is 7 quarters. 4 quarters make 1 whole, and 3 quarters are left.',
          visual: { type: 'pie', pies: [{ parts: 4, shaded: 4 }, { parts: 4, shaded: 3 }] } },
        { title: 'Mixed numbers',
          text: 'A **mixed number** has a whole number and a fraction.\n{7/4} = 1 {3/4} (one and three quarters).' },
        { title: 'Improper → mixed',
          text: 'Divide the top by the bottom.\n{11/3}: 11 ÷ 3 = 3 r 2.\nSo {11/3} = 3 {2/3}. The remainder goes on top; the bottom stays the same.' },
        { title: 'Mixed → improper',
          text: '2 {1/3}: each whole is 3 thirds, so 2 wholes = 2 × 3 = 6 thirds.\nAdd the 1 extra third: 6 + 1 = 7.\nSo 2 {1/3} = {7/3}.',
          visual: { type: 'pie', pies: [{ parts: 3, shaded: 3 }, { parts: 3, shaded: 3 }, { parts: 3, shaded: 1 }] } },
        { title: 'Worked example',
          text: 'Write {17/5} as a mixed number.\n**1.** Divide: how many 5s in 17? 5, 10, 15 → 3 fives.\n**2.** 17 − 15 = 2 left over.\n**3.** The 2 goes on top of the fifths.\nAnswer: **3 {2/5}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [toMixed, toMixed, toImproper, pieQ, missingWhole],
          [toMixed, toImproper, pieQ, missingWhole, spotQ],
          [toMixed, toImproper, missingWhole, spotQ, compareQ],
        ], ctx);
      },
    });
  }

  /* 13 ── Adding and subtracting fractions (same or related denominators) */
  {
    const sameQ = L => {
      const add = L === 1 ? Math.random() < 0.7 : coin(), big = L > 1 && add && coin();
      const r = retry(() => {
        const d = R(3, L === 1 ? 10 : 12), a = R(1, d - 1), b = R(1, d - 1), s = add ? a + b : a - b;
        if (s <= 0 || s % d === 0 || (!add && a === 2 * b)) return null;
        if (add && (big ? s < d : s > d)) return null;
        return { d, a, b, s };
      });
      const { d, a, b, s } = r;
      const vis = L === 1 ? { visual: { type: 'fractionBar', bars: [{ parts: d, shaded: a, label: fr(a, d) }, { parts: d, shaded: b, label: fr(b, d) }] } } : {};
      return fracQ(`Work out ${fr(a, d)} ${add ? '+' : M} ${fr(b, d)}`, s, d,
        [`The denominators are the same, so ${add ? 'add' : 'subtract'} the tops. The bottom stays ${d}.`,
          `${fr(a, d)} is ${a} ${fname(d, a)} and ${fr(b, d)} is ${b} ${fname(d, b)}. How many ${fname(d)} is that ${add ? 'altogether' : 'when you take them away'}?`],
        `${a} ${add ? '+' : M} ${b} = ${s}, so the answer is ${fr(s, d)}${s > d ? ` = ${U.mixed(s, d)}` : U.gcd(s, d) > 1 ? ` = ${U.fracS(s, d)}` : ''}.`,
        Object.assign(s > d ? { mixed: true } : {}, vis));
    };

    const relatedQ = L => {
      const add = L === 2 ? Math.random() < 0.7 : coin(), simp = L === 3 && coin();
      const r = retry(() => {
        const d1 = R(2, 6), m = R(2, L === 2 ? 3 : 4), D = d1 * m;
        if (D > 20) return null;
        const a = R(1, d1 - 1), b = R(1, D - 1), A = a * m;
        let s, first;
        if (add) { s = A + b; first = coin(); } else { first = A > b; s = Math.abs(A - b); }
        if (s <= 0 || s % D === 0 || (L === 2 && s > D)) return null;
        if (simp && U.gcd(s, D) === 1) return null;
        if (s * d1 === a * D || s === b) return null;
        return { d1, m, D, a, b, A, s, first };
      });
      const { d1, m, D, a, b, A, s, first } = r;
      const left = first ? fr(a, d1) : fr(b, D), right = first ? fr(b, D) : fr(a, d1);
      return fracQ(`Work out ${left} ${add ? '+' : M} ${right}${simp ? '\nGive your answer in its simplest form.' : ''}`, s, D,
        [`The denominators are different. Change ${fr(a, d1)} into ${fname(D)} first.`,
          `${fr(a, d1)} = ${fr(A, D)} (top and bottom × ${m}).`],
        `${fr(a, d1)} = ${fr(A, D)}. ${first ? `${fr(A, D)} ${add ? '+' : M} ${fr(b, D)}` : `${fr(b, D)} ${add ? '+' : M} ${fr(A, D)}`} = ${fr(s, D)}${s > D ? ` = ${U.mixed(s, D)}` : U.gcd(s, D) > 1 ? ` = ${U.fracS(s, D)}` : ''}.`,
        Object.assign(s > D ? { mixed: true } : {}, simp ? { simplest: true } : {}));
    };

    const spotQ = L => {
      const r = retry(() => { const d = R(3, 9), a = R(1, d - 2), b = R(1, d - 1 - a); return U.gcd(a + b, d) === 1 && U.gcd(a + b, 2 * d) === 1 ? { d, a, b } : null; });
      const { d, a, b } = r, who = U.name();
      return fracQ(`${who} says ${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, 2 * d)}.\nWhat is the correct answer?`, a + b, d,
        ['When the denominators are the same, the size of the parts does not change. Add only the tops!',
          `${fr(a, d)} is ${a} ${fname(d, a)}. ${fr(b, d)} is ${b} ${fname(d, b)}. How many ${fname(d)} altogether?`],
        `${a} ${fname(d, a)} + ${b} ${fname(d, b)} = ${a + b} ${fname(d, a + b)}, so the answer is ${fr(a + b, d)}. ${who} wrongly added the bottoms too.`);
    };

    const missingQ = L => {
      const d = R(4, 12), a = R(1, d - 2), c = R(a + 1, d - 1), add = coin();
      if (c === 2 * a) return missingQ(L);
      if (add) {
        return num(`Find the missing number.\n${fr(a, d)} + {□/${d}} = ${fr(c, d)}`, c - a,
          ['The denominators are all the same, so just look at the tops.', `${a} + □ = ${c}.`],
          `${a} + ${c - a} = ${c}, so the missing number is ${c - a}.`);
      }
      return num(`Find the missing number.\n${fr(c, d)} ${M} {□/${d}} = ${fr(a, d)}`, c - a,
        ['The denominators are all the same, so just look at the tops.', `${c} − □ = ${a}.`],
        `${c} − ${c - a} = ${a}, so the missing number is ${c - a}.`);
    };

    const wordQ = L => {
      const who = U.name(), other = pick(['a friend', 'a cousin', 'a classmate']);
      const r = retry(() => {
        const d1 = R(2, 4), m = R(2, 3), D = d1 * m, a = R(1, d1 - 1), b = R(1, D - 1), s = a * m + b;
        return s < D ? { d1, m, D, a, b, s } : null;
      });
      const { d1, m, D, a, b, s } = r;
      if (L === 3 && coin() && D - s !== b && (D - s) * d1 !== a * D) {
        return fracQ(`${who} eats ${fr(a, d1)} of a pizza. ${cap(other)} eats ${fr(b, D)} of the same pizza.\nWhat fraction of the pizza is left?`, D - s, D,
          ['Step 1: add the two fractions. Step 2: take the answer away from 1 whole.', `${fr(a, d1)} = ${fr(a * m, D)}, so together they eat ${fr(a * m, D)} + ${fr(b, D)}.`],
          `${fr(a * m, D)} + ${fr(b, D)} = ${fr(s, D)}. 1 whole = ${fr(D, D)}, and ${fr(D, D)} − ${fr(s, D)} = ${fr(D - s, D)}.`);
      }
      return fracQ(`${who} eats ${fr(a, d1)} of a pizza. ${cap(other)} eats ${fr(b, D)} of the same pizza.\nWhat fraction of the pizza do they eat altogether?`, s, D,
        [`"Altogether" means add. Change ${fr(a, d1)} into ${fname(D)} first.`, `${fr(a, d1)} = ${fr(a * m, D)}.`],
        `${fr(a * m, D)} + ${fr(b, D)} = ${fr(s, D)}${U.gcd(s, D) > 1 ? ` = ${U.fracS(s, D)}` : ''}.`);
    };

    PMLM.registerSkill({
      id: 'g5.addFrac', grade: 5, unit: 'g5.u3', title: 'Add and subtract fractions', icon: '➕',
      blurb: 'Add and subtract fractions with related denominators',
      lesson: [
        { title: 'Same denominator',
          text: 'When the bottoms are the same, add the tops. The bottom stays the same.\n{2/7} + {3/7} = {5/7}\n2 sevenths + 3 sevenths = 5 sevenths.',
          visual: { type: 'fractionBar', bars: [{ parts: 7, shaded: 2, label: '{2/7}' }, { parts: 7, shaded: 3, label: '{3/7}' }, { parts: 7, shaded: 5, label: '{5/7}' }] } },
        { title: "Don't add the bottoms!",
          text: '{1/4} + {2/4} is **not** {3/8}.\nQuarters stay quarters: 1 quarter + 2 quarters = 3 quarters.\n{1/4} + {2/4} = **{3/4}**' },
        { title: 'Related denominators',
          text: '{1/2} + {1/4}: 4 is a multiple of 2, so change the halves into quarters.\n{1/2} = {2/4}, so {2/4} + {1/4} = **{3/4}**.',
          visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '{1/2}' }, { parts: 4, shaded: 2, label: '{2/4}' }, { parts: 4, shaded: 1, label: '{1/4}' }] } },
        { title: 'Subtracting',
          text: 'Subtracting works the same way.\n{5/6} − {1/3} = {5/6} − {2/6} = {3/6} = {1/2}\nIf an answer is bigger than 1, write it as a mixed number: {7/5} = 1 {2/5}.' },
        { title: 'Worked example',
          text: 'Work out {3/4} + {5/8}.\n**1.** 8 is a multiple of 4, so change quarters into eighths: {3/4} = {6/8}.\n**2.** Add the tops: {6/8} + {5/8} = {11/8}.\n**3.** 11 eighths is more than 1 whole: {11/8} = 1 {3/8}.\nAnswer: **1 {3/8}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [sameQ, sameQ, sameQ, missingQ, spotQ],
          [sameQ, relatedQ, relatedQ, missingQ, spotQ, wordQ],
          [sameQ, relatedQ, relatedQ, relatedQ, spotQ, wordQ],
        ], ctx);
      },
    });
  }

  /* 14 ── Fractions of amounts */
  {
    const unitQ = L => {
      const d = R(2, L === 1 ? 6 : 10), A = d * R(2, 12);
      return num(`What is ${fr(1, d)} of ${A}?`, A / d,
        [`To find ${fr(1, d)}, share into ${d} equal parts: divide by ${d}.`, `Think: ${d} × □ = ${A}.`],
        `${A} ÷ ${d} = ${A / d}, so ${fr(1, d)} of ${A} is ${A / d}.`,
        { visual: { type: 'barModel', rows: [{ label: '', parts: d }], total: String(A) } });
    };

    const nonUnitQ = (L, ctx) => {
      const [n, d] = retry(() => { const f = coprimeFrac(3, L === 2 ? 8 : 12); return f[0] > 1 ? f : null; }), u = R(2, L === 2 ? 9 : 15), A = d * u, ans = n * u;
      const t = L === 3 ? R(1, 4) : 1;
      const what = { 1: [`${A}`, ''], 2: [`${A} m`, 'm'], 3: [`${A} kg`, 'kg'], 4: [money(ctx.currency, A), ''] }[t];
      return num(`What is ${fr(n, d)} of ${what[0]}?`, ans,
        ['Divide by the bottom number. Then multiply by the top number.', `First find ${fr(1, d)}: ${A} ÷ ${d} = ${u}.`],
        `${A} ÷ ${d} = ${u}, and ${u} × ${n} = ${ans}. So ${fr(n, d)} of ${what[0]} is ${t === 4 ? money(ctx.currency, ans) : ans + (what[1] ? ' ' + what[1] : '')}.`,
        Object.assign(t === 4 ? { prefix: ctx.currency } : what[1] ? { unit: what[1] } : {},
          L === 2 ? { visual: { type: 'barModel', rows: [{ label: '', parts: d }], total: String(A) } } : {}));
    };

    const wordQ = L => {
      const [n, d] = L === 1 ? [1, R(2, 6)] : coprimeFrac(3, 10), u = R(2, 9), A = d * u, part = n * u, who = U.name();
      const not = L === 3 && coin() && d - n >= 2;
      const ctxs = [
        [`A class has ${A} children. ${fr(n, d)} of them walk to school.`, 'walk to school', 'do not walk to school', 'children'],
        [`${who} has ${A} stickers and gives ${fr(n, d)} of them to a friend.`, 'does ' + who + ' give away', 'does ' + who + ' keep', 'stickers'],
        [`A bag has ${A} sweets. ${fr(n, d)} of the sweets are red.`, 'are red', 'are not red', 'sweets'],
      ];
      const [s, yes, no, thing] = pick(ctxs);
      const ask = /^does/.test(yes) ? `How many stickers ${not ? no : yes}?` : `How many ${thing} ${not ? no : yes}?`;
      const ans = not ? A - part : part;
      return num(`${s}\n${ask}`, ans,
        [not ? 'Step 1: find the fraction of the amount. Step 2: take it away from the total.' : 'Divide by the bottom number, then multiply by the top number.',
          n === 1 && !not ? `Share ${A} into ${d} equal groups. Think: ${d} × □ = ${A}.` : `${fr(1, d)} of ${A} is ${A} ÷ ${d} = ${u}.`],
        `${fr(1, d)} of ${A} = ${A} ÷ ${d} = ${u}.${n > 1 ? ` So ${fr(n, d)} of ${A} = ${u} × ${n} = ${part}.` : ''}${not ? ` ${A} − ${part} = ${ans}.` : ''}`, { unit: thing });
    };

    const spotQ = L => {
      const [n, d] = retry(() => { const f = coprimeFrac(3, 10); return f[0] > 1 ? f : null; }), u = R(3, 12), A = d * u, who = U.name();
      return num(`${who} says ${fr(n, d)} of ${A} is ${u}.\nWhat is the correct answer?`, n * u,
        [`${u} is only ${fr(1, d)} of ${A}. How many ${fname(d)} do you need?`, `${fr(1, d)} of ${A} = ${u}. You need ${n} of these parts.`],
        `${fr(1, d)} of ${A} = ${u}, so ${fr(n, d)} of ${A} = ${u} × ${n} = ${n * u}. ${who} forgot to multiply by ${n}.`);
    };

    const wholeQ = () => {
      const [n, d] = coin() ? [1, R(2, 10)] : coprimeFrac(3, 8), u = R(2, 12), have = n * u;
      return num(`${fr(n, d)} of a number is ${have}.\nWhat is the number?`, d * u,
        [`Draw a bar split into ${d} equal parts. ${n === 1 ? 'One part' : `${n} parts`} ${n === 1 ? 'is' : 'are'} worth ${have}.`,
          n === 1 ? `If one part is ${have}, the whole bar is ${d} parts.` : `One part is worth ${have} ÷ ${n} = ${u}.`],
        `${n === 1 ? '' : `One part = ${have} ÷ ${n} = ${u}. `}The whole is ${d} parts: ${d} × ${u} = ${d * u}.`,
        { visual: { type: 'barModel', rows: [{ label: '', parts: d }], total: '?' } });
    };

    const compareQ = () => {
      const nu = () => retry(() => { const f = coprimeFrac(3, 6); return f[0] > 1 ? f : null; });
      const [n1, d1] = nu(), [n2, d2] = nu(), u1 = R(2, 9), u2 = R(2, 9);
      if (d1 === d2) return compareQ();
      const A1 = d1 * u1, A2 = d2 * u2, v1 = n1 * u1, v2 = n2 * u2;
      const s1 = `${fr(n1, d1)} of ${A1}`, s2 = `${fr(n2, d2)} of ${A2}`;
      if (s1 === s2) return compareQ();
      const ans = v1 === v2 ? 'They are the same' : v1 > v2 ? s1 : s2;
      return choice('Which is bigger?', ans, [s1, s2, 'They are the same'],
        ['Work out each amount, then compare.', `${s1}: ${A1} ÷ ${d1} = ${u1}, then × ${n1}.`],
        `${s1} = ${v1} and ${s2} = ${v2}. ${v1 === v2 ? 'They are the same.' : `${ans} is bigger.`}`);
    };

    PMLM.registerSkill({
      id: 'g5.fracAmount', grade: 5, unit: 'g5.u3', title: 'Fractions of amounts', icon: '🍬',
      blurb: 'Find a fraction of a number or quantity',
      lesson: [
        { title: 'Unit fractions',
          text: 'To find {1/4} of 20, share 20 into 4 equal parts.\n20 ÷ 4 = 5, so {1/4} of 20 = **5**.',
          visual: { type: 'barModel', rows: [{ label: '', parts: 4, value: '5' }], total: '20' } },
        { title: 'More than one part',
          text: 'To find {3/4} of 20, find one quarter first, then take 3 of them.\n20 ÷ 4 = 5, and 5 × 3 = **15**.\n**Tip:** divide by the bottom, multiply by the top.' },
        { title: 'In real life',
          text: '{2/5} of 35 m: 35 ÷ 5 = 7, and 7 × 2 = **14 m**.\nThe answer keeps the same unit as the amount.' },
        { title: 'Finding the whole',
          text: 'If {1/3} of a number is 8, the whole is 3 parts.\n3 × 8 = **24**.',
          visual: { type: 'barModel', rows: [{ label: '', parts: 3, value: '8' }], total: '?' } },
        { title: 'Worked example',
          text: 'Find {5/8} of 48.\n**1.** Divide by the bottom: 48 ÷ 8 = 6. So {1/8} of 48 is 6.\n**2.** Multiply by the top: 6 × 5 = 30.\nAnswer: **30**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [unitQ, unitQ, unitQ, wordQ],
          [unitQ, nonUnitQ, nonUnitQ, wordQ, spotQ],
          [nonUnitQ, nonUnitQ, wordQ, spotQ, wholeQ, compareQ],
        ], ctx);
      },
    });
  }

  /* 15 ── Decimals and fractions (tenths and hundredths) */
  {
    const fracToDec = L => {
      const t = L === 1 ? 'tenth' : L === 2 ? pick(['tenth', 'hund', 'hund', 'half']) : pick(['hund', 'quarter', 'fifth', 'fifth']);
      let n, d, hints, ex;
      if (t === 'tenth') {
        d = 10; n = R(1, 9);
        hints = ['The first place after the decimal point is **tenths**.', `${fr(n, 10)} means ${n} ${fname(10, n)}. Put the ${n} in the tenths place.`];
        ex = `${fr(n, 10)} is ${n} ${fname(10, n)}, so it is ${F(n / 10)}.`;
      } else if (t === 'hund') {
        d = 100; n = coin() ? R(1, 9) : R(11, 99);
        if (n % 10 === 0) n += 1;
        hints = ['The second place after the decimal point is **hundredths**.',
          n < 10 ? `${fr(n, 100)} means ${n} ${fname(100, n)}. There are no tenths, so you need a 0 in the tenths place.` : `${fr(n, 100)} means ${n} hundredths. That is ${Math.floor(n / 10)} tenths and ${n % 10} hundredths.`];
        ex = `${fr(n, 100)} = ${F(U.clean(n / 100))}.`;
      } else if (t === 'half') {
        n = 1; d = 2;
        hints = ['Make an equivalent fraction with 10 on the bottom.', `${fr(1, 2)} = {□/10}. What do you multiply 2 by to get 10?`];
        ex = `${fr(1, 2)} = ${fr(5, 10)} = 0.5.`;
      } else if (t === 'quarter') {
        n = pick([1, 3]); d = 4;
        hints = ['Make an equivalent fraction with 100 on the bottom.', `4 × 25 = 100, so multiply the top by 25 too: ${n} × 25 = ${n * 25}.`];
        ex = `${fr(n, 4)} = ${fr(n * 25, 100)} = ${F(n / 4)}.`;
      } else {
        n = R(1, 4); d = 5;
        hints = ['Make an equivalent fraction with 10 on the bottom.', `5 × 2 = 10, so multiply the top by 2 too: ${n} × 2 = ${n * 2}.`];
        ex = `${fr(n, 5)} = ${fr(n * 2, 10)} = ${F(n / 5)}.`;
      }
      return num(`Write ${fr(n, d)} as a decimal.`, U.clean(n / d), hints, ex);
    };

    const decToFrac = L => {
      if (L === 3) {
        const x = pick([0.2, 0.4, 0.6, 0.8, 0.5, 0.25, 0.75, 0.05, 0.15, 0.35, 0.45, 0.04]);
        const dp = String(x).split('.')[1].length, den = Math.pow(10, dp), top = Math.round(x * den);
        return fracQ(`Write ${F(x)} as a fraction in its simplest form.`, top, den,
          ['Write it as tenths or hundredths first. Then simplify.', `${F(x)} = ${fr(top, den)}. Now divide the top and bottom by the same number.`],
          `${F(x)} = ${fr(top, den)} = ${U.fracS(top, den)}.`, { simplest: true });
      }
      const hund = L === 2 && coin(), top = hund ? R(11, 99) : R(1, 9), den = hund ? 100 : 10, x = U.clean(top / den);
      if (hund && top % 10 === 0) return decToFrac(1);
      return fracQ(`Write ${F(x)} as a fraction.`, top, den,
        ['Look at the last decimal place: tenths means the bottom is 10, hundredths means the bottom is 100.',
          hund ? `${F(x)} has 2 decimal places, so it is a number of **hundredths**.` : `${F(x)} has 1 decimal place, so it is a number of **tenths**.`],
        `${F(x)} = ${top} ${fname(den, top)} = ${fr(top, den)}${U.gcd(top, den) > 1 ? ` (or ${U.fracS(top, den)})` : ''}.`);
    };

    const lineQ = L => {
      if (L === 3) {
        const a = R(0, 9), k = retry(() => { const x = R(1, 9); return x !== 5 ? x : null; }), lo = U.clean(a / 10), hi = U.clean((a + 1) / 10), v = U.clean(lo + k / 100);
        return num('What number is marked **?** on the number line?', v,
          ['Work out what each small step is worth.', `There are 10 equal steps from ${F(lo)} to ${F(hi)}, so each step is worth 0.01.`],
          `Each step is 0.01. Count ${k} steps from ${F(lo)}: ${F(v)}.`,
          { visual: { type: 'numberLine', min: lo, max: hi, step: 0.01, labelEvery: 5, points: [{ at: v, label: '?' }] } });
      }
      const a = L === 1 ? 0 : R(1, 9), k = retry(() => { const x = R(1, 9); return x !== 5 ? x : null; }), v = U.clean(a + k / 10);
      return num('What number is marked **?** on the number line?', v,
        ['Work out what each small step is worth.', `There are 10 equal steps from ${a} to ${a + 1}, so each step is worth 0.1.`],
        `Each step is 0.1. Count ${k} steps from ${a}: ${F(v)}.`,
        { visual: { type: 'numberLine', min: a, max: a + 1, step: 0.1, labelEvery: 5, points: [{ at: v, label: '?' }] } });
    };

    const compareQ = L => {
      if (L === 3) {
        const [n, d] = pick([[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [7, 10], [3, 10]]), v = n / d;
        const x = pick([U.clean(v + pick([-0.05, 0.05, -0.1, 0.1, -0.15])), U.clean(v)]);
        if (x <= 0 || x >= 1) return compareQ(L);
        const A = fr(n, d), B = F(x), ans = U.clean(v) === x ? 'They are equal' : v > x ? A : B;
        return choice(`Which is bigger: ${A} or ${B}?`, ans, [A, B, 'They are equal'],
          ['Change the fraction into a decimal. Then compare.', `${A} = ${fr(n * (100 / d), 100)} as hundredths. Write ${B} as hundredths too.`],
          `${A} = ${F(v, 2)} and ${B} = ${F(x, 2)}. ${ans === 'They are equal' ? 'They are equal.' : `${ans} is bigger.`}`);
      }
      const big = coin();
      const vals = retry(() => {
        const t = R(3, 9);
        const v = [t / 10, (t - 1) / 10 + R(1, 9) / 100, t / 100, R(1, t - 2) / 10 + R(1, 9) / 100].map(U.clean);
        return new Set(v).size === 4 ? v : null;
      });
      const ans = big ? Math.max(...vals) : Math.min(...vals);
      return choice(`Which decimal is the **${big ? 'biggest' : 'smallest'}**?`, F(ans), vals.filter(x => x !== ans).map(x => F(x)),
        ['Compare the tenths first. Only look at the hundredths if the tenths are the same.',
          `Write them all with 2 decimal places: ${vals.map(x => F(x, 2)).join(', ')}.`],
        `With 2 decimal places, ${F(ans, 2)} is the ${big ? 'biggest' : 'smallest'}, so the answer is ${F(ans)}.`);
    };

    const spotQ = () => {
      const n = R(1, 9), who = U.name();
      return num(`${who} says ${fr(n, 100)} = ${F(n / 10)}.\nWhat is the correct decimal?`, U.clean(n / 100),
        [`${F(n / 10)} is ${n} tenth${n > 1 ? 's' : ''}, but ${fr(n, 100)} is ${n} hundredth${n > 1 ? 's' : ''}.`,
          'Hundredths go in the 2nd place after the decimal point. The tenths place is empty, so write a 0 there.'],
        `${fr(n, 100)} is ${n} hundredth${n > 1 ? 's' : ''}: ${F(U.clean(n / 100))}. ${F(n / 10)} would be ${fr(n, 10)}.`);
    };

    PMLM.registerSkill({
      id: 'g5.decFrac', grade: 5, unit: 'g5.u3', title: 'Decimals and fractions', icon: '🔟',
      blurb: 'Tenths and hundredths as fractions and decimals',
      lesson: [
        { title: 'Tenths',
          text: 'Split 1 whole into 10 equal parts. Each part is **one tenth**: {1/10} = 0.1\n7 parts shaded is {7/10} = **0.7**.',
          visual: { type: 'fractionBar', bars: [{ parts: 10, shaded: 7 }] } },
        { title: 'Hundredths',
          text: 'Split 1 whole into 100 parts: each is {1/100} = 0.01.\n{37/100} = 0.37: that is 3 tenths and 7 hundredths.\n{7/100} = 0.07: no tenths, so the tenths place has a 0.',
          visual: { type: 'placeValue', value: '0.37' } },
        { title: 'Fractions to know',
          text: 'These are worth learning by heart:',
          visual: { type: 'table', headers: ['Fraction', '{1/2}', '{1/4}', '{3/4}', '{1/5}', '{1/10}'], rows: [['Decimal', '0.5', '0.25', '0.75', '0.2', '0.1']] } },
        { title: 'Comparing decimals',
          text: 'Which is bigger, 0.6 or 0.45?\nWrite both with 2 decimal places: 0.60 and 0.45.\n60 hundredths is more than 45 hundredths, so **0.6** is bigger.',
          visual: { type: 'numberLine', min: 0, max: 1, step: 0.1, points: [{ at: 0.45, label: '0.45' }, { at: 0.6, label: '0.6' }] } },
        { title: 'Worked example',
          text: 'Write {23/100} as a decimal.\n**1.** {23/100} is 23 hundredths.\n**2.** 23 hundredths = 2 tenths and 3 hundredths.\n**3.** Put 2 in the tenths place and 3 in the hundredths place.\nAnswer: **0.23**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [fracToDec, fracToDec, decToFrac, lineQ, compareQ],
          [fracToDec, fracToDec, decToFrac, lineQ, compareQ, spotQ],
          [fracToDec, decToFrac, lineQ, compareQ, spotQ],
        ], ctx);
      },
    });
  }

  /* 16 ── Percentages of amounts */
  {
    // percentage → [multiple the amount must be, nudge, first-step builder, explain builder]
    const P = {
      50: [2, () => '50% is half: divide by 2.', A => `Half of ${F(A)}: ${F(A)} ÷ 2.`, (A, x) => `50% = {1/2}. ${F(A)} ÷ 2 = ${F(x)}.`],
      25: [4, () => '25% is a quarter: divide by 4 (or halve, then halve again).', A => `Half of ${F(A)} is ${F(A / 2)}. Now halve again.`, (A, x) => `25% = {1/4}. ${F(A)} ÷ 4 = ${F(x)}.`],
      10: [10, () => '10% is {1/10}: divide by 10.', A => `${F(A)} ÷ 10: move every digit one place to the right.`, (A, x) => `10% = {1/10}. ${F(A)} ÷ 10 = ${F(x)}.`],
      1: [100, () => '1% is {1/100}: divide by 100.', A => `${F(A)} ÷ 100: move every digit two places to the right.`, (A, x) => `1% = {1/100}. ${F(A)} ÷ 100 = ${F(x)}.`],
      20: [10, () => '20% = 2 × 10%. Find 10% first.', A => `10% of ${F(A)} = ${F(A / 10)}.`, (A, x) => `10% of ${F(A)} = ${F(A / 10)}, so 20% = 2 × ${F(A / 10)} = ${F(x)}.`],
      5: [20, () => '5% is half of 10%. Find 10% first.', A => `10% of ${F(A)} = ${F(A / 10)}.`, (A, x) => `10% of ${F(A)} = ${F(A / 10)}, so 5% = half of that = ${F(x)}.`],
      75: [4, () => '75% = 3 × 25%. Find 25% first.', A => `25% of ${F(A)} = ${F(A)} ÷ 4 = ${F(A / 4)}.`, (A, x) => `25% of ${F(A)} = ${F(A / 4)}, so 75% = 3 × ${F(A / 4)} = ${F(x)}.`],
      15: [20, () => '15% = 10% + 5%.', A => `10% of ${F(A)} = ${F(A / 10)}. 5% is half of that.`, (A, x) => `10% = ${F(A / 10)} and 5% = ${F(A / 20)}. 15% = ${F(A / 10)} + ${F(A / 20)} = ${F(x)}.`],
      2: [50, () => '2% = 2 × 1%. Find 1% first.', A => `1% of ${F(A)} = ${F(A)} ÷ 100 = ${F(U.clean(A / 100))}.`, (A, x) => `1% of ${F(A)} = ${F(U.clean(A / 100))}, so 2% = ${F(x)}.`],
    };
    [30, 40, 60, 70, 80, 90].forEach(p => {
      P[p] = [10, () => `${p}% = ${p / 10} × 10%. Find 10% first.`, A => `10% of ${F(A)} = ${F(A / 10)}.`, (A, x) => `10% of ${F(A)} = ${F(A / 10)}, so ${p}% = ${p / 10} × ${F(A / 10)} = ${F(x)}.`];
    });
    const pctPool = L => (L === 1 ? [50, 10, 50, 10, 25] : L === 2 ? [25, 1, 20, 5, 50, 10] : [30, 40, 60, 75, 15, 2, 1, 70, 90]);
    const amount = (p, L) => {
      const m = P[p][0], max = L === 1 ? 200 : L === 2 ? 600 : 1000;
      let A = m * R(Math.max(1, Math.ceil(20 / m)), Math.floor(max / m));
      if (p === 1 && L === 3 && coin()) A = 10 * R(11, 99);   // 1% can give a decimal at level 3
      if (p === 2 && A % 100 === 0) A += 50;
      return A;
    };

    const findQ = (L, ctx) => {
      const p = pick(pctPool(L)), A = amount(p, L), x = U.clean(A * p / 100), t = L === 1 ? 0 : R(0, 2);
      const [, nudge, step, ex] = P[p];
      const what = [F(A), `${F(A)} m`, money(ctx.currency, A)][t];
      return num(`What is ${p}% of ${what}?`, x, [nudge(), step(A)], t === 1 ? ex(A, x).replace(/\.$/, ' m.') : ex(A, x),
        t === 1 ? { unit: 'm' } : t === 2 ? { prefix: ctx.currency } : {});
    };

    const PAIRS = [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 10, 10], [3, 10, 30], [7, 10, 70], [1, 5, 20], [2, 5, 40], [1, 100, 1], [9, 100, 9]];
    const fracPct = L => {
      const [n, d, p] = pick(L === 1 ? PAIRS.slice(0, 4) : PAIRS);
      if (coin() || U.gcd(p, 100) === 1) {
        const wr = [`${n}${d}%`, `${d}%`, `${n}%`, `${100 - p}%`, `${p / 10}%`, `${p * 2}%`].filter(x => x !== `${p}%` && x.length <= 5);
        return choice(`Which percentage is the same as ${fr(n, d)}?`, `${p}%`, wr,
          ['Per cent means "out of 100". Make an equivalent fraction with 100 on the bottom.',
            `${d} × ${100 / d} = 100. Multiply the top by ${100 / d} too.`],
          `${fr(n, d)} = ${fr(n * 100 / d, 100)} = ${p}%.`);
      }
      const wr = [fr(p, 10), fr(1, p), fr(p, 1000), fr(n + 1, d), fr(n, d + 1)].filter(x => x !== fr(n, d) && x !== fr(p, 100));
      return choice(`Which fraction is the same as ${p}%?`, fr(n, d), wr,
        [`${p}% means ${p} out of 100: ${fr(p, 100)}. Now simplify it.`, `Divide the top and the bottom of ${fr(p, 100)} by the same number.`],
        `${p}% = ${fr(p, 100)} = ${fr(n, d)}.`);
    };

    const shadedQ = L => {
      const parts = pick(L === 1 ? [10, 10, 4] : [10, 4, 5, 20]), k = R(2, parts - 1), each = 100 / parts;
      return num('What percentage of the bar is shaded?', k * each,
        ['The whole bar is 100%.', `There are ${parts} equal parts, so each part is 100% ÷ ${parts} = ${each}%.`],
        `Each part is ${each}%. ${k} part${k > 1 ? 's are' : ' is'} shaded: ${k} × ${each}% = ${k * each}%.`,
        { unit: '%', visual: { type: 'fractionBar', bars: [{ parts, shaded: k }] } });
    };

    const wordQ = (L, ctx) => {
      const cur = ctx.currency, t = L === 1 ? R(1, 2) : R(1, 4);
      if (t === 1) {
        const p = pick(pctPool(L).filter(x => x !== 1 && x !== 2)), n = P[p][0] * R(Math.ceil(20 / P[p][0]), Math.floor(60 / P[p][0])) || 20;
        if (n % P[p][0]) return findQ(L, ctx);
        const x = n * p / 100;
        return num(`There are ${n} children in a school club. ${p}% of them have a pet.\nHow many children have a pet?`, x,
          [P[p][1](), P[p][2](n)], P[p][3](n, x).replace(/\.$/, ` children have a pet.`), { unit: 'children' });
      }
      if (t === 2) {
        const p = R(1, 9) * 10 + (L === 3 && coin() ? 5 : 0);
        return num(`In a class, ${p}% of the children are boys.\nWhat percentage of the children are girls?`, 100 - p,
          ['All the children together make 100%.', `Girls = 100% − ${p}%.`],
          `100% − ${p}% = ${100 - p}%.`, { unit: '%' });
      }
      const p = pick(L === 2 ? [10, 25, 50, 20] : t === 4 ? [10, 20, 25, 30] : [10, 20, 25, 30, 75]), price = P[p][0] * R(Math.ceil(20 / P[p][0]), Math.floor(200 / P[p][0])), off = price * p / 100;
      if (t === 3) {
        return num(`A jacket costs ${money(cur, price)}. In a sale there is ${p}% off.\nHow much money do you save?`, off,
          [P[p][1](), P[p][2](price)], P[p][3](price, off).replace(/\.$/, '') + `. You save ${money(cur, off)}.`, { prefix: cur });
      }
      return num(`A jacket costs ${money(cur, price)}. In a sale there is ${p}% off.\nWhat is the sale price?`, price - off,
        ['Step 1: find how much you save. Step 2: take it away from the price.', P[p][2](price)],
        `${p}% of ${money(cur, price)} = ${money(cur, off)}. Sale price: ${money(cur, price)} − ${money(cur, off)} = ${money(cur, price - off)}.`, { prefix: cur });
    };

    const spotQ = L => {
      const who = U.name();
      if (coin()) {
        const A = 10 * retry(() => { const x = R(3, 40); return x !== 10 ? x : null; });
        return num(`${who} says 10% of ${A} is 10.\nWhat is the correct answer?`, A / 10,
          ['10% does not mean "take 10". It means {10/100} = {1/10} of the amount.', `Find {1/10} of ${A}: divide by 10.`],
          `10% = {1/10}. ${A} ÷ 10 = ${A / 10}, not 10.`);
      }
      const A = 4 * R(8, 50);
      return num(`${who} says 25% of ${A} is ${A - 25}, because you "take away 25".\nWhat is the correct answer?`, A / 4,
        ['25% means 25 out of every 100. That is {1/4} of the amount.', `Find {1/4} of ${A}: half of ${A} is ${A / 2}. Now halve again.`],
        `25% = {1/4}. ${A} ÷ 4 = ${A / 4}.`);
    };

    PMLM.registerSkill({
      id: 'g5.percent', grade: 5, unit: 'g5.u3', title: 'Percentages', icon: '💯',
      blurb: 'Find 50%, 25%, 10% and 1% of amounts',
      lesson: [
        { title: 'Per cent means out of 100',
          text: '**%** means "out of 100".\n37% = {37/100}\nThe whole thing is 100%. This bar has 4 out of 10 parts shaded: {4/10} = {40/100} = **40%**.',
          visual: { type: 'fractionBar', bars: [{ parts: 10, shaded: 4 }] } },
        { title: 'Key percentages',
          text: 'Learn these four:',
          visual: { type: 'table', headers: ['Percentage', 'Fraction', 'How to find it'], rows: [['50%', '{1/2}', '÷ 2'], ['25%', '{1/4}', '÷ 4'], ['10%', '{1/10}', '÷ 10'], ['1%', '{1/100}', '÷ 100']] } },
        { title: 'Build other percentages',
          text: '20% = 2 × 10%\n5% = half of 10%\n75% = 3 × 25%\n30% of 80: 10% is 8, so 30% is 3 × 8 = 24.' },
        { title: 'Percentages in real life',
          text: 'A game costs 40 and has 25% off. You save 25% of 40 = 40 ÷ 4 = **10**.\n**Tip:** 10% is the most useful one. Divide by 10, then build up from it.' },
        { title: 'Worked example',
          text: 'Find 30% of 90.\n**1.** Find 10%: 90 ÷ 10 = 9.\n**2.** 30% is 3 lots of 10%.\n**3.** 3 × 9 = 27.\nAnswer: **27**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [findQ, findQ, fracPct, shadedQ, wordQ],
          [findQ, findQ, fracPct, shadedQ, wordQ, spotQ],
          [findQ, findQ, fracPct, wordQ, wordQ, spotQ],
        ], ctx);
      },
    });
  }

  /* 17 ── Ratio and proportion (introduction) */
  {
    // [singular, plural] names for each pair of things
    const SETS = [[['red bead', 'red beads'], ['blue bead', 'blue beads'], 'Red', 'Blue'], [['black tile', 'black tiles'], ['white tile', 'white tiles'], 'Black', 'White'],
      [['cup of flour', 'cups of flour'], ['cup of sugar', 'cups of sugar'], 'Flour', 'Sugar'], [['tin of yellow paint', 'tins of yellow paint'], ['tin of blue paint', 'tins of blue paint'], 'Yellow', 'Blue']];
    const nm = (n, w) => `${n} ${n === 1 ? w[0] : w[1]}`;
    const pair = (maxA, maxB) => retry(() => { const a = R(1, maxA), b = R(1, maxB); return a !== b && U.gcd(a, b) === 1 ? [a, b] : null; });

    const forEveryQ = L => {
      const [a, b] = pair(L === 1 ? 3 : 5, L === 1 ? 4 : 6), k = R(2, L === 1 ? 5 : 10), [x, y, X, Y] = pick(SETS);
      const flip = L > 1 && coin();
      const [ga, gb, gx, gy] = flip ? [b, a, y, x] : [a, b, x, y];
      if (gb < 2 || (L > 1 && ga < 2)) return forEveryQ(L);
      return num(`For every ${nm(a, x)} there ${b === 1 ? 'is' : 'are'} ${nm(b, y)}.\nThere are ${nm(ga * k, gx)}. How many ${gy[1]} are there?`, gb * k,
        ['Find how many groups there are. Then multiply.', `${ga * k} ÷ ${ga} = ${k} groups.`],
        `${ga * k} ÷ ${ga} = ${k} groups. Each group has ${nm(gb, gy)}, so ${k} × ${gb} = ${gb * k}.`,
        { visual: { type: 'barModel', rows: [{ label: X, parts: a }, { label: Y, parts: b }] } });
    };

    const inEveryQ = L => {
      if (L === 3 || (L === 2 && coin())) {
        const [a, b] = pair(5, 6);
        return fracQ(`In a necklace, there ${a === 1 ? 'is 1 black bead' : `are ${a} black beads`} for every ${b} white beads.\nWhat fraction of the beads are black?`, a, a + b,
          ['A fraction compares a part with the **whole**, not with the other part.', `In each group there are ${a} + ${b} = ${a + b} beads altogether.`],
          `${a} out of every ${a + b} beads ${a === 1 ? 'is' : 'are'} black, so ${fr(a, a + b)} are black. (Not ${fr(a, b)}: that compares black with white.)`,
          { visual: { type: 'barModel', rows: [{ label: 'Black', parts: a }, { label: 'White', parts: b }] } });
      }
      const t = R(3, 10), a = R(1, t - 1);
      return fracQ(`In a pattern, ${a} in every ${t} tiles ${a === 1 ? 'is' : 'are'} red.\nWhat fraction of the tiles are red?`, a, t,
        ['"In every" compares a part with the whole group.', `The whole group has ${t} tiles. How many of them are red?`],
        `${a} out of every ${t} tiles ${a === 1 ? 'is' : 'are'} red, so the fraction is ${fr(a, t)}${U.gcd(a, t) > 1 ? ` = ${U.fracS(a, t)}` : ''}.`);
    };

    const shareQ = L => {
      const [a, b] = pair(L === 1 ? 2 : 4, L === 1 ? 4 : 5), u = R(2, L === 1 ? 6 : 12), T = (a + b) * u;
      const [p1, p2] = retry(() => { const x = U.name(), y = U.name(); return x !== y ? [x, y] : null; });
      const askFirst = a === 1 ? false : b === 1 ? true : coin();
      return num(`Share ${T} sweets between ${p1} and ${p2} in the ratio ${a} : ${b}.\nHow many sweets does ${askFirst ? p1 : p2} get?`, (askFirst ? a : b) * u,
        ['Add the parts to find how many equal boxes there are. Then find what one box is worth.', `There are ${a} + ${b} = ${a + b} boxes. One box is worth ${T} ÷ ${a + b}.`],
        `${T} ÷ ${a + b} = ${u} in each box. ${askFirst ? p1 : p2} has ${askFirst ? a : b} box${(askFirst ? a : b) > 1 ? 'es' : ''}: ${askFirst ? a : b} × ${u} = ${(askFirst ? a : b) * u}.`,
        { unit: 'sweets', visual: { type: 'barModel', rows: [{ label: p1, parts: a }, { label: p2, parts: b }], total: String(T) } });
    };

    const ratioChoice = () => {
      const [cA, cB] = U.sample(['red', 'blue', 'green', 'yellow'], 2);
      const [r, b] = retry(() => { const x = R(2, 8), y = R(2, 8); return x !== y && U.gcd(x, y) === 1 && x + y <= 14 ? [x, y] : null; });
      return choice(`What is the ratio of ${cA} marbles to ${cB} marbles?`, `${r} : ${b}`, [`${b} : ${r}`, `${r} : ${r + b}`, `${b} : ${r + b}`, `${r + b} : ${r}`],
        [`The ratio ${cA} : ${cB} means "number of ${cA} : number of ${cB}", in that order.`, `Count the ${cA} marbles first.`],
        `There are ${r} ${cA} and ${b} ${cB} marbles, so the ratio is ${r} : ${b}.`,
        { visual: { type: 'bag', items: [{ color: cA, count: r }, { color: cB, count: b }] } });
    };

    const recipeQ = L => {
      const p = pick([2, 4, 5]), per = R(2, 9) * (L === 3 ? 10 : 25);
      if (L === 3 && coin()) {
        const p0 = pick([4, 5, 8]), g = p0 * R(2, 9) * 10, p1 = retry(() => { const x = R(2, 10); return x !== p0 && x % p0 ? x : null; });
        return num(`A recipe for ${p0} people uses ${g} g of rice.\nHow much rice is needed for ${p1} people?`, g / p0 * p1,
          ['Find the amount for 1 person first.', `${g} ÷ ${p0} = ${g / p0} g for 1 person.`],
          `${g} ÷ ${p0} = ${g / p0} g for 1 person. ${p1} × ${g / p0} = ${g / p0 * p1} g.`, { unit: 'g' });
      }
      const k = R(2, 4), g = per * p;
      return num(`A recipe for ${p} people uses ${g} g of rice.\nHow much rice is needed for ${p * k} people?`, g * k,
        ['Find how many times more people there are. Then use that many times as much rice.', `${p * k} ÷ ${p} = ${k}, so you need ${k} times as much.`],
        `${p * k} people is ${k} times as many, so ${k} × ${g} = ${g * k} g.`, { unit: 'g' });
    };

    const totalQ = () => {
      const [a, b] = retry(() => { const p = pair(4, 5); return p[0] >= 2 ? p : null; }), k = R(2, 8);
      return num(`The ratio of boys to girls in a club is ${a} : ${b}.\nThere are ${a * k} boys. How many children are in the club altogether?`, (a + b) * k,
        ['Find how many groups there are first.', `${a * k} boys ÷ ${a} = ${k} groups. Each group has ${a} + ${b} = ${a + b} children.`],
        `${a * k} ÷ ${a} = ${k} groups of ${a + b} children: ${k} × ${a + b} = ${(a + b) * k}.`, { unit: 'children' });
    };

    PMLM.registerSkill({
      id: 'g5.ratio', grade: 5, unit: 'g5.u3', title: 'Ratio and proportion', icon: '⚖️',
      blurb: 'Compare amounts using "for every" and "in every"',
      lesson: [
        { title: 'For every (ratio)',
          text: 'For every **2** red beads there are **3** blue beads.\nWe write this ratio as red : blue = **2 : 3**.\nThe order matters: blue : red would be 3 : 2.',
          visual: { type: 'barModel', rows: [{ label: 'Red', parts: 2 }, { label: 'Blue', parts: 3 }] } },
        { title: 'In every (proportion)',
          text: 'In every 5 beads, 2 are red.\nSo {2/5} of the beads are red.\nProportion compares a part with the **whole**.' },
        { title: 'Scaling up',
          text: 'Keep the groups the same. If there are 6 red beads, that is 3 groups of 2, so there are 3 × 3 = **9** blue beads.',
          visual: { type: 'table', headers: ['Red', '2', '4', '6', '8'], rows: [['Blue', '3', '6', '9', '12']] } },
        { title: 'Sharing in a ratio',
          text: 'Share 20 sweets in the ratio 1 : 3.\nThere are 1 + 3 = 4 boxes. Each box is 20 ÷ 4 = 5.\nSo the shares are **5** and **15**.',
          visual: { type: 'barModel', rows: [{ label: 'Ali', parts: 1, value: '5' }, { label: 'Mia', parts: 3, value: '5' }], total: '20' } },
        { title: 'Worked example',
          text: 'Share 30 stickers in the ratio 2 : 3.\n**1.** Count the boxes: 2 + 3 = 5.\n**2.** One box: 30 ÷ 5 = 6.\n**3.** 2 boxes = 12 and 3 boxes = 18. Check: 12 + 18 = 30.\nAnswer: **12 and 18**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [forEveryQ, forEveryQ, inEveryQ, shareQ, ratioChoice],
          [forEveryQ, inEveryQ, shareQ, ratioChoice, recipeQ],
          [forEveryQ, inEveryQ, shareQ, recipeQ, totalQ],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 4: Geometry and measure ═══════════════════════
  PMLM.registerUnit({ id: 'g5.u4', grade: 5, name: 'Geometry and measure', icon: '📐' });

  /* 18 ── Perimeter and area: rectangles and L-shapes */
  {
    const rect = L => retry(() => { const w = R(3, L === 1 ? 10 : 25), h = R(2, L === 1 ? 8 : 20); return w > h ? [w, h] : null; });
    const unitOf = () => pick(['cm', 'm']);
    const rectVis = (w, h, u) => ({ type: 'shape2d', shape: 'rectangle', dims: { base: `${w} ${u}`, height: `${h} ${u}` } });
    const makeL = L => retry(() => {
      const w = R(6, L === 2 ? 12 : 16), h = R(5, L === 2 ? 10 : 14), a = R(2, w - 3), b = R(2, h - 3);
      return w !== h && a !== b && w !== 2 * a && h !== 2 * b ? { w, h, a, b } : null;
    });
    const lVis = ({ w, h, a, b }, u) => ({ type: 'shape2d', shape: 'L', dims: { w: `${w} ${u}`, h: `${h} ${u}`, a: `${a} ${u}`, b: `${b} ${u}` } });

    const perimQ = L => {
      const [w, h] = rect(L), u = unitOf();
      return num('Find the perimeter of this rectangle.', 2 * (w + h),
        ['Perimeter is the distance all the way round the edge. Add all four sides.', `Opposite sides are equal, so the four sides are ${w}, ${h}, ${w} and ${h} ${u}.`],
        `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} ${u}.`, { unit: u, visual: rectVis(w, h, u) });
    };

    const areaQ = L => {
      const [w, h] = rect(L), u = unitOf();
      return num('Find the area of this rectangle.', w * h,
        ['Area of a rectangle = length × width.', `Picture ${h} rows of ${w} squares, each 1 ${u}^{2}. Work out ${w} × ${h}.`],
        `${w} × ${h} = ${w * h} ${u}^{2}.`, { unit: `${u}^{2}`, visual: rectVis(w, h, u) });
    };

    const gridQ = L => {
      if (L === 1 || coin()) {
        const w = R(3, 8), h = R(2, 6);
        return num('Each square is 1 cm^{2}. What is the area of the shaded rectangle?', w * h,
          ['Count the squares inside the shape, or multiply the number of rows by the number in each row.', `There are ${h} rows with ${w} squares in each row.`],
          `${h} rows of ${w}: ${h} × ${w} = ${w * h} cm^{2}.`,
          { unit: 'cm^{2}', visual: { type: 'grid', xmin: 0, xmax: w + 2, ymin: 0, ymax: h + 2, polygons: [{ pts: [[1, 1], [w + 1, 1], [w + 1, h + 1], [1, h + 1]] }] } });
      }
      const w = R(4, 8), h = R(4, 7), a = R(1, w - 2), b = R(1, h - 2), A = w * h - a * b;
      return num('Each square is 1 cm^{2}. What is the area of the shaded shape?', A,
        ['Split the shape into two rectangles. Count the squares in each, then add.', `The bottom part is ${w} squares wide and ${h - b} rows tall: ${w} × ${h - b} = ${w * (h - b)} squares.`],
        `Bottom part: ${w} × ${h - b} = ${w * (h - b)}. Top part: ${w - a} × ${b} = ${(w - a) * b}. Total: ${A} cm^{2}.`,
        { unit: 'cm^{2}', visual: { type: 'grid', xmin: 0, xmax: w + 2, ymin: 0, ymax: h + 2, polygons: [{ pts: [[1, 1], [w + 1, 1], [w + 1, h - b + 1], [w - a + 1, h - b + 1], [w - a + 1, h + 1], [1, h + 1]] }] } });
    };

    const squareQ = L => {
      const s = R(3, L === 1 ? 10 : 15), u = unitOf(), area = coin();
      return num(`A square has sides of ${s} ${u}.\nWhat is its ${area ? 'area' : 'perimeter'}?`, area ? s * s : 4 * s,
        [area ? 'Area = length × width. In a square, they are the same.' : 'A square has 4 equal sides. Add them all.',
          area ? `Work out ${s} × ${s}.` : `${s} + ${s} + ${s} + ${s}, or 4 × ${s}.`],
        area ? `${s} × ${s} = ${s * s} ${u}^{2}.` : `4 × ${s} = ${4 * s} ${u}.`,
        { unit: area ? `${u}^{2}` : u, visual: { type: 'shape2d', shape: 'square', dims: { base: `${s} ${u}` } } });
    };

    const areaVsPerim = L => {
      const [w, h] = retry(() => { const r = rect(L); return r[0] * r[1] !== 2 * (r[0] + r[1]) ? r : null; }), u = unitOf();
      return choice(`What is the **area** of this rectangle?`, `${w * h} ${u}^{2}`, [`${2 * (w + h)} ${u}^{2}`, `${w + h} ${u}^{2}`, `${2 * w * h} ${u}^{2}`],
        ['Area is the space inside: length × width. Do not add the sides — that is the perimeter!', `Work out ${w} × ${h}.`],
        `Area = ${w} × ${h} = ${w * h} ${u}^{2}. (${2 * (w + h)} is the perimeter.)`, { visual: rectVis(w, h, u) });
    };

    const missingArea = L => {
      const [w, h] = rect(Math.min(L, 2)), u = 'cm';
      return num(`The area of this rectangle is ${w * h} ${u}^{2}. Its length is ${w} ${u}.\nWhat is its width?`, h,
        ['Area = length × width, so width = area ÷ length.', `${w} × □ = ${w * h}.`],
        `${w * h} ÷ ${w} = ${h}, so the width is ${h} ${u}.`,
        { unit: u, visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `${w} ${u}`, height: '?' } } });
    };

    const missingPerim = () => {
      const [w, h] = retry(() => { const r = rect(2); return r[1] > 2 ? r : null; }), u = unitOf(), P = 2 * (w + h);
      return num(`The perimeter of a rectangle is ${P} ${u}. Its length is ${w} ${u}.\nWhat is its width?`, h,
        ['The perimeter is 2 lengths + 2 widths.', `Half the perimeter is one length + one width: ${P} ÷ 2 = ${P / 2}.`],
        `${P} ÷ 2 = ${P / 2}. ${P / 2} − ${w} = ${h}, so the width is ${h} ${u}.`,
        { unit: u, visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `${w} ${u}`, height: '?' } } });
    };

    const lArea = L => {
      const s = makeL(L), u = unitOf(), { w, h, a, b } = s, A = w * h - a * b;
      return num('Find the area of this shape.', A,
        ['Find the area of the big rectangle, then take away the missing corner. (Or split it into two rectangles.)',
          `The big rectangle is ${w} × ${h} = ${w * h} ${u}^{2}. The missing corner is ${a} × ${b}.`],
        `${w} × ${h} = ${w * h}. The corner is ${a} × ${b} = ${a * b}. ${w * h} − ${a * b} = ${A} ${u}^{2}.`,
        { unit: `${u}^{2}`, visual: lVis(s, u) });
    };

    const lPerim = L => {
      const s = makeL(L), u = unitOf(), { w, h, a, b } = s;
      return num('Find the perimeter of this shape.', 2 * (w + h),
        ['Find the two sides with no label first. Then add all six sides.', `Top edge: ${w} − ${a} = ${w - a} ${u}. Right edge: ${h} − ${b} = ${h - b} ${u}.`],
        `${w} + ${h} + ${w - a} + ${b} + ${a} + ${h - b} = ${2 * (w + h)} ${u}.`,
        { unit: u, visual: lVis(s, u) });
    };

    const lSide = L => {
      const s = makeL(L), u = unitOf(), { w, h, a, b } = s, top = coin();
      return num(`What is the length of the ${top ? 'top edge' : 'right-hand edge'} of this shape?`, top ? w - a : h - b,
        [top ? 'The top edge and the short step next to it together are as long as the bottom edge.' : 'The right-hand edge and the short step above it together are as tall as the left edge.',
          top ? `The bottom edge is ${w} ${u}. The step is ${a} ${u}.` : `The left edge is ${h} ${u}. The step is ${b} ${u}.`],
        top ? `${w} − ${a} = ${w - a} ${u}.` : `${h} − ${b} = ${h - b} ${u}.`, { unit: u, visual: lVis(s, u) });
    };

    PMLM.registerSkill({
      id: 'g5.perimArea', grade: 5, unit: 'g5.u4', title: 'Perimeter and area', icon: '📏',
      blurb: 'Perimeter and area of rectangles and L-shapes',
      lesson: [
        { title: 'Perimeter',
          text: 'The **perimeter** is the distance all the way round a shape.\nAdd all the sides: 6 + 4 + 6 + 4 = **20 cm**.',
          visual: { type: 'shape2d', shape: 'rectangle', dims: { base: '6 cm', height: '4 cm' } } },
        { title: 'Area',
          text: 'The **area** is the space inside, measured in squares (cm^{2} or m^{2}).\nThis rectangle has 4 rows of 6 squares: 6 × 4 = **24 cm^{2}**.\n**Area of a rectangle = length × width.**',
          visual: { type: 'grid', xmin: 0, xmax: 7, ymin: 0, ymax: 5, polygons: [{ pts: [[0, 0], [6, 0], [6, 4], [0, 4]] }] } },
        { title: 'L-shapes',
          text: 'Split an L-shape into two rectangles and add their areas.\nOr find the big rectangle and take away the missing corner.\nFor perimeter, find the missing sides first.',
          visual: { type: 'shape2d', shape: 'L', dims: { w: '10 cm', h: '8 cm', a: '4 cm', b: '3 cm' } } },
        { title: 'Missing sides',
          text: 'In the L-shape above, the top edge is 10 − 4 = **6 cm**.\nThe right-hand edge is 8 − 3 = **5 cm**.\n**Tip:** opposite sides of the whole shape add up to the same length.' },
        { title: 'Worked example',
          text: 'Find the area of the L-shape above.\n**1.** Big rectangle: 10 × 8 = 80 cm^{2}.\n**2.** Missing corner: 4 × 3 = 12 cm^{2}.\n**3.** Take it away: 80 − 12 = 68.\nAnswer: **68 cm^{2}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [perimQ, areaQ, gridQ, gridQ, squareQ, areaVsPerim],
          [perimQ, areaQ, gridQ, missingArea, lArea, lSide, areaVsPerim],
          [areaQ, missingArea, missingPerim, lArea, lArea, lPerim, lSide],
        ], ctx);
      },
    });
  }

  /* 19 ── Angles */
  {
    const TYPE = d => (d < 90 ? 'acute' : d === 90 ? 'right angle' : d < 180 ? 'obtuse' : 'straight angle');
    const DESC = { acute: 'less than 90°', 'right angle': 'exactly 90°', obtuse: 'between 90° and 180°', 'straight angle': 'exactly 180°' };
    const TYPES = ['acute', 'right angle', 'obtuse', 'straight angle'];
    const randAngle = () => pick([R(3, 14) * 5, R(22, 34) * 5, 90, R(3, 14) * 5, R(22, 34) * 5, 180]);

    const typeQ = L => {
      const d = randAngle(), t = TYPE(d);
      const text = L === 1 ? `An angle measures ${d}°.\nWhat type of angle is it?` : 'What type of angle is this?';
      return choice(text, t, TYPES.filter(x => x !== t),
        ['Compare it with a right angle (a square corner, 90°).', 'Acute is less than 90°. Obtuse is between 90° and 180°. A straight angle is exactly 180°.'],
        `${L === 1 ? `${d}°` : 'This angle'} is ${DESC[t]}, so it is ${t === 'acute' || t === 'obtuse' ? 'an ' + t + ' angle' : 'a ' + t}.`,
        L === 1 ? {} : { visual: { type: 'angle', mode: 'single', parts: [d], labels: [''] } });
    };

    const estimateQ = L => {
      const d = pick(L === 3 ? [20, 30, 45, 60, 75, 105, 120, 135, 150, 160] : [20, 30, 45, 60, 120, 135, 150, 160]), mirror = 180 - d;
      const others = U.shuffle(U.range(10, 170, 5).filter(c => Math.abs(c - d) >= 35 && Math.abs(c - mirror) >= 25));
      const two = [others[0]];
      for (const c of others) if (two.length < 2 && Math.abs(c - two[0]) >= 25) two.push(c);
      return choice('Estimate the size of this angle.', `${d}°`, [`${mirror}°`, ...two.map(c => `${c}°`)],
        ['Compare it with a right angle (90°). Is it smaller or bigger? Then compare it with half a right angle (45°).',
          d < 90 ? 'It is smaller than a right angle, so it must be less than 90°.' : 'It is bigger than a right angle, so it must be more than 90°.'],
        `The angle is ${d < 90 ? 'smaller' : 'bigger'} than a right angle. It is about ${d}°.`,
        { visual: { type: 'angle', mode: 'single', parts: [d], labels: ['?'] } });
    };

    const whichQ = () => {
      const want = pick(['acute', 'obtuse']);
      const right = want === 'acute' ? R(3, 17) * 5 : R(19, 35) * 5;
      const wr = want === 'acute' ? [90, R(19, 35) * 5, 180, R(19, 35) * 5] : [90, R(3, 17) * 5, 180, R(3, 17) * 5];
      return choice(`Which of these is an **${want}** angle?`, `${right}°`, wr.map(x => `${x}°`),
        [`An ${want} angle is ${DESC[want]}.`, want === 'acute' ? 'Look for the angle that is smaller than 90°. 90° itself is a right angle, not acute.' : 'Look for the angle between 90° and 180°. 90° and 180° themselves are not obtuse.'],
        `${right}° is ${DESC[want]}, so it is ${want}.`);
    };

    const lineQ = L => {
      if (L === 3 && coin()) {
        const a = R(4, 10) * 5 + R(0, 4), b = R(4, 10) * 5 + R(0, 4), c = 180 - a - b, k = R(0, 2);
        if ([a, b, c][k] === 90) return lineQ(L);
        const parts = [a, b, c], labels = parts.map((p, i) => (i === k ? '?' : `${p}°`)), known = parts.filter((p, i) => i !== k);
        return num('Find the angle marked **?**.', parts[k],
          ['Angles on a straight line add up to 180°.', `The two angles you know add up to ${known[0]}° + ${known[1]}° = ${known[0] + known[1]}°.`],
          `${known[0]} + ${known[1]} = ${known[0] + known[1]}, and 180 − ${known[0] + known[1]} = ${parts[k]}°.`,
          { unit: '°', visual: { type: 'angle', mode: 'line', parts, labels } });
      }
      const a = L === 1 ? R(2, 16) * 10 : R(15, 165), first = coin();
      const parts = first ? [a, 180 - a] : [180 - a, a], labels = first ? [`${a}°`, '?'] : ['?', `${a}°`];
      if (a === 90) return lineQ(L);
      return num('Find the angle marked **?**.', 180 - a,
        ['Angles on a straight line add up to 180°.', `□ + ${a}° = 180°. What do you add to ${a} to make 180?`],
        `180 − ${a} = ${180 - a}°.`, { unit: '°', visual: { type: 'angle', mode: 'line', parts, labels } });
    };

    const rightQ = () => {
      const a = R(10, 80);
      if (a === 45) return rightQ();
      return num(`A right angle is split into two smaller angles.\nOne of them is ${a}°. How big is the other one?`, 90 - a,
        ['A right angle is 90°. The two parts add up to 90°.', `□ + ${a}° = 90°.`],
        `90 − ${a} = ${90 - a}°.`, { unit: '°' });
    };

    const turnQ = () => {
      const k = R(2, 6), start = R(1, 12), end = (start + k - 1) % 12 + 1;
      return num(`The minute hand of a clock turns clockwise from ${start} to ${end}.\nHow many degrees does it turn?`, 30 * k,
        ['A full turn is 360°, and there are 12 numbers on a clock.', '360° ÷ 12 = 30°, so the hand turns 30° from one number to the next.'],
        `From ${start} to ${end} is ${k} number${k > 1 ? 's' : ''}. ${k} × 30° = ${30 * k}°.`, { unit: '°' });
    };

    PMLM.registerSkill({
      id: 'g5.angles', grade: 5, unit: 'g5.u4', title: 'Angles', icon: '📐',
      blurb: 'Estimate, compare and find angles on a line',
      lesson: [
        { title: 'Types of angle',
          text: '**Acute**: less than 90°.\n**Right angle**: exactly 90° (a square corner).\n**Obtuse**: between 90° and 180°.\n**Straight angle**: exactly 180° (a straight line).',
          visual: { type: 'angle', mode: 'single', parts: [90], labels: ['90°'] } },
        { title: 'Estimating angles',
          text: 'Compare an angle with a right angle.\nHalf a right angle is **45°**. A right angle and a half is **135°**.\nAsk: is it smaller or bigger than 90°? Then is it nearer 45° or 90°?',
          visual: { type: 'angle', mode: 'single', parts: [45], labels: ['45°'] } },
        { title: 'Angles on a straight line',
          text: 'Angles on a straight line always add up to **180°**.\n130° + 50° = 180°',
          visual: { type: 'angle', mode: 'line', parts: [130, 50], labels: ['130°', '50°'] } },
        { title: 'Turns',
          text: 'A quarter turn is 90°. A half turn is 180°. A full turn is 360°.\nOn a clock, the minute hand turns 30° from one number to the next.' },
        { title: 'Worked example',
          text: 'Two angles sit on a straight line. One is 65°. Find the other.\n**1.** Angles on a straight line add up to 180°.\n**2.** Work out 180 − 65.\n**3.** 180 − 65 = 115.\nAnswer: **115°**',
          visual: { type: 'angle', mode: 'line', parts: [65, 115], labels: ['65°', '?'] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [typeQ, typeQ, estimateQ, whichQ, lineQ],
          [typeQ, estimateQ, whichQ, lineQ, lineQ, rightQ],
          [estimateQ, lineQ, lineQ, rightQ, turnQ, typeQ],
        ], ctx);
      },
    });
  }

  /* 20 ── Triangles and quadrilaterals */
  {
    const TRI = ['equilateral triangle', 'isosceles triangle', 'scalene triangle'];
    const triAngles = () => {
      const t = pick([0, 1, 1, 2, 2]);
      if (t === 0) return { t, parts: [60, 60, 60] };
      if (t === 1) { const x = pick([30, 35, 40, 50, 55, 65, 70, 75]); return { t, parts: U.shuffle([x, x, 180 - 2 * x]) }; }
      return retry(() => { const a = R(5, 12) * 5, b = R(5, 12) * 5, c = 180 - a - b; return new Set([a, b, c]).size === 3 && c >= 25 && ![a, b, c].includes(90) ? { t, parts: [a, b, c] } : null; });
    };

    const triAngleQ = () => {
      const { t, parts } = triAngles();
      return choice('Look at the angles. What type of triangle is this?', TRI[t], TRI.filter((x, i) => i !== t),
        ['Equal angles mean equal sides. Count how many angles are the same size.',
          '3 equal angles → equilateral. Exactly 2 equal angles → isosceles. No equal angles → scalene.'],
        `The angles are ${parts.join('°, ')}°. ${t === 0 ? 'All three are equal' : t === 1 ? 'Exactly two are equal' : 'None are equal'}, so it is ${t === 2 ? 'a' : 'an'} ${TRI[t]}.`,
        { visual: { type: 'angle', mode: 'triangle', parts, labels: parts.map(p => `${p}°`) } });
    };

    const triSideQ = () => {
      const t = R(0, 2);
      const sides = t === 0 ? Array(3).fill(R(3, 12)) : t === 1 ? retry(() => { const a = R(3, 12), b = R(2, 15); return a !== b && b < 2 * a ? U.shuffle([a, a, b]) : null; })
        : retry(() => { const s = [R(3, 12), R(3, 12), R(3, 12)].sort((x, y) => x - y); return new Set(s).size === 3 && s[0] + s[1] > s[2] ? U.shuffle(s) : null; });
      return choice(`A triangle has sides of ${sides[0]} cm, ${sides[1]} cm and ${sides[2]} cm.\nWhat type of triangle is it?`, TRI[t], TRI.filter((x, i) => i !== t),
        ['Count how many sides are the same length.', '3 equal sides → equilateral. Exactly 2 equal sides → isosceles. All different → scalene.'],
        `${t === 0 ? 'All three sides are equal' : t === 1 ? 'Exactly two sides are equal' : 'All the sides are different'}, so it is ${t === 2 ? 'a' : 'an'} ${TRI[t]}.`);
    };

    const QUAD = {
      square: ['It has 4 right angles. Do all the sides look the same length?', 'a square: 4 equal sides and 4 right angles'],
      rectangle: ['It has 4 right angles. Are all the sides equal, or only the opposite sides?', 'a rectangle: 4 right angles, and only the opposite sides are equal'],
      parallelogram: ['It has 2 pairs of parallel sides, but no right angles. Are all the sides equal?', 'a parallelogram: 2 pairs of parallel sides, no right angles, and not all sides equal'],
      trapezium: ['Count the pairs of parallel sides.', 'a trapezium: exactly 1 pair of parallel sides'],
      rhombus: ['All four sides look equal. Are there any right angles?', 'a rhombus: 4 equal sides but no right angles'],
      kite: ['Look for two pairs of equal sides that are next to each other.', 'a kite: 2 pairs of equal sides next to each other, and no parallel sides'],
    };
    const MIX = { square: ['rhombus', 'rectangle', 'kite'], rectangle: ['square', 'parallelogram', 'trapezium'], parallelogram: ['rectangle', 'rhombus', 'trapezium'],
      trapezium: ['parallelogram', 'kite', 'rectangle'], rhombus: ['square', 'kite', 'parallelogram'], kite: ['rhombus', 'trapezium', 'parallelogram'] };

    const quadPic = () => {
      const s = pick(Object.keys(QUAD));
      return choice('What is the name of this quadrilateral?', s, MIX[s],
        ['Look at the sides (equal? parallel?) and the angles (right angles?).', QUAD[s][0]],
        `It is ${QUAD[s][1]}.`, { visual: { type: 'shape2d', shape: s } });
    };

    const PROPS = [
      ['square', 'I have 4 equal sides and 4 right angles.'],
      ['rectangle', 'I have 4 right angles. My opposite sides are equal, but not all my sides are equal.'],
      ['rhombus', 'I have 4 equal sides, but no right angles.'],
      ['parallelogram', 'I have 2 pairs of parallel sides and no right angles. Only my opposite sides are equal.'],
      ['trapezium', 'I have 4 sides and exactly 1 pair of parallel sides.'],
      ['kite', 'I have 2 pairs of equal sides that are next to each other, and no parallel sides.'],
      ['equilateral triangle', 'I have 3 sides, and they are all the same length.'],
      ['isosceles triangle', 'I have 3 sides. Exactly 2 of them are the same length.'],
      ['scalene triangle', 'I have 3 sides, and they are all different lengths.'],
    ];
    const propsQ = () => {
      const [name, desc] = pick(PROPS);
      const wr = /triangle/.test(name) ? TRI.concat(['square']) : MIX[name];
      return choice(`Which shape am I?\n"${desc}"`, name, wr.filter(x => x !== name),
        ['Read each clue and rule out the shapes that do not fit.', /triangle/.test(name) ? 'Triangles are named by how many sides are equal.' : 'First count the sides. Then check the right angles and parallel sides.'],
        `The shape is ${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}.`);
    };

    const TF = [
      ['Every square is a rectangle.', 'True', 'A rectangle needs 4 right angles and opposite sides equal. Does a square have these?', 'A square has 4 right angles and opposite sides equal, so it is a special rectangle.'],
      ['Every rectangle is a square.', 'False', 'Does every rectangle have 4 equal sides?', 'A rectangle can have 2 long sides and 2 short sides, so it is not always a square.'],
      ['A square is a special rhombus.', 'True', 'A rhombus needs 4 equal sides. Does a square have them?', 'A square has 4 equal sides, so it is a rhombus with right angles.'],
      ['A triangle can have two right angles.', 'False', 'Two right angles already make 180°. Is there any room left for the third angle?', 'The three angles of a triangle add up to 180°. Two right angles use up all 180°, so it is impossible.'],
      ['An equilateral triangle has three equal angles.', 'True', 'Equal sides go with equal angles.', 'All the sides are equal, so all the angles are equal too (each is 60°).'],
      ['A kite has two pairs of parallel sides.', 'False', 'Picture a kite. Do its opposite sides ever run side by side like train tracks?', 'A kite has no parallel sides. Its equal sides are next to each other.'],
      ['A trapezium has exactly one pair of parallel sides.', 'True', 'Picture a trapezium: the top and bottom run side by side.', 'A trapezium has exactly one pair of parallel sides.'],
      ['A rhombus always has four right angles.', 'False', 'Picture a diamond shape. Are its corners square?', 'A rhombus has 4 equal sides, but its angles are usually not right angles.'],
      ['A parallelogram has two pairs of parallel sides.', 'True', 'The name gives a clue: parallel.', 'Both pairs of opposite sides of a parallelogram are parallel.'],
      ['A scalene triangle has two equal sides.', 'False', 'Scalene means all the sides are different.', 'A scalene triangle has no equal sides. Two equal sides would make it isosceles.'],
    ];
    const tfQ = () => {
      const [s, a, h, e] = pick(TF);
      return choice(`True or false?\n"${s}"`, a, [a === 'True' ? 'False' : 'True'], ['Think about the sides, angles and parallel lines of each shape.', h], e);
    };

    const COUNT = [
      ['How many right angles does a rectangle have?', 4, 'rectangle', 'Look at each corner. Is it a square corner?', 'All 4 corners of a rectangle are right angles.'],
      ['How many pairs of parallel sides does a parallelogram have?', 2, 'parallelogram', 'Check the top and bottom, then the two slanted sides.', 'Both pairs of opposite sides are parallel: 2 pairs.'],
      ['How many pairs of parallel sides does a trapezium have?', 1, 'trapezium', 'Check the top and bottom, then the two slanted sides.', 'Only the top and bottom are parallel: 1 pair.'],
      ['How many pairs of parallel sides does a kite have?', 0, 'kite', 'Do any two sides run side by side like train tracks?', 'A kite has no parallel sides: 0 pairs.'],
      ['How many equal sides does a rhombus have?', 4, 'rhombus', 'A rhombus is like a square that has been pushed over.', 'All 4 sides of a rhombus are equal.'],
      ['How many right angles does a square have?', 4, 'square', 'Look at each corner. Is it a square corner?', 'All 4 corners of a square are right angles.'],
    ];
    const countQ = () => {
      const [q, a, s, h, e] = pick(COUNT);
      return num(q, a, ['Picture the shape and check each side or corner.', h], e, { visual: { type: 'shape2d', shape: s } });
    };

    PMLM.registerSkill({
      id: 'g5.shapes', grade: 5, unit: 'g5.u4', title: 'Triangles & quadrilaterals', icon: '🔺',
      blurb: 'Name and sort shapes by their sides and angles',
      lesson: [
        { title: 'Triangles by their sides',
          text: '**Equilateral**: 3 equal sides and 3 equal angles (60° each).\n**Isosceles**: 2 equal sides and 2 equal angles.\n**Scalene**: no equal sides and no equal angles.',
          visual: { type: 'angle', mode: 'triangle', parts: [70, 70, 40], labels: ['70°', '70°', '40°'] } },
        { title: 'Right-angled triangles',
          text: 'A **right-angled triangle** has one angle of 90°. The little square shows the right angle.',
          visual: { type: 'shape2d', shape: 'rightTriangle' } },
        { title: 'Quadrilaterals',
          text: 'A quadrilateral has 4 sides. Here are the special ones:',
          visual: { type: 'table', headers: ['Shape', 'Sides', 'Right angles', 'Parallel sides'], rows: [
            ['square', '4 equal', '4', '2 pairs'], ['rectangle', 'opposite equal', '4', '2 pairs'], ['rhombus', '4 equal', '0', '2 pairs'],
            ['parallelogram', 'opposite equal', '0', '2 pairs'], ['trapezium', '—', '—', '1 pair'], ['kite', '2 pairs next to each other', '—', '0']] } },
        { title: 'Parallel and perpendicular',
          text: '**Parallel** lines always stay the same distance apart, like train tracks.\n**Perpendicular** lines meet at a right angle.\nA square is a special rectangle **and** a special rhombus!' },
        { title: 'Worked example',
          text: 'A shape has 4 equal sides but no right angles. What is it?\n**1.** 4 sides → it is a quadrilateral.\n**2.** 4 equal sides → a square or a rhombus.\n**3.** No right angles → not a square.\nAnswer: **a rhombus**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [triSideQ, quadPic, quadPic, countQ, tfQ],
          [triAngleQ, triSideQ, quadPic, propsQ, countQ, tfQ],
          [triAngleQ, triSideQ, propsQ, propsQ, tfQ, quadPic],
        ], ctx);
      },
    });
  }

  /* 21 ── Coordinates, translation and reflection (first quadrant) */
  {
    const G = extra => Object.assign({ type: 'grid', xmin: 0, xmax: 10, ymin: 0, ymax: 10 }, extra);
    const pt = (lo = 1, hi = 9) => retry(() => { const x = R(lo, hi), y = R(lo, hi); return x !== y ? [x, y] : null; });
    const ACROSS = 'Go **across** first (the x-coordinate), then **up** (the y-coordinate).';
    const coordQ = (q, ans, hints, explain, extra) => Object.assign({ q, kind: 'coord', answer: ans, hints, explain }, extra || {});
    const mv = (d, pos, neg) => `${Math.abs(d)} square${Math.abs(d) > 1 ? 's' : ''} ${d > 0 ? pos : neg}`;

    const readQ = () => {
      const [x, y] = pt();
      return coordQ('What are the coordinates of point A?', [x, y],
        [ACROSS + ' Write them as (across, up).', 'Start at (0, 0). Count the squares across until you are directly below A.'],
        `A is ${x} across and ${y} up, so A is at (${x}, ${y}).`, { visual: G({ points: [{ x, y, label: 'A' }] }) });
    };

    const whichPoint = () => {
      const [x, y] = pt();
      const pts = [[x, y], [y, x]];
      while (pts.length < 4) { const p = pt(); if (!pts.some(q => q[0] === p[0] && q[1] === p[1])) pts.push(p); }
      const order = U.shuffle(pts), labels = ['A', 'B', 'C', 'D'], k = order.findIndex(p => p[0] === x && p[1] === y);
      return choice(`Which point is at (${x}, ${y})?`, labels[k], labels.filter((l, i) => i !== k),
        ['The first number tells you how far **across**. The second number tells you how far **up**.', `From (0, 0), go ${x} across first. Then go ${y} up.`],
        `(${x}, ${y}) means ${x} across and ${y} up. That is point ${labels[k]}. (Point ${labels[order.findIndex(p => p[0] === y && p[1] === x)]} is at (${y}, ${x}): the numbers are swapped.)`,
        { visual: G({ points: order.map((p, i) => ({ x: p[0], y: p[1], label: labels[i] })) }) });
    };

    const cornerQ = () => {
      const [x1, x2, y1, y2] = retry(() => { const a = R(1, 8), b = R(2, 9), c = R(1, 8), d = R(2, 9); return b - a >= 2 && d - c >= 2 ? [a, b, c, d] : null; });
      const corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], k = R(0, 3), names = ['A', 'B', 'C'];
      const known = [1, 2, 3].map(i => corners[(k + i) % 4]), D = corners[k];
      const sameX = known.find(p => p[0] === D[0]), sameY = known.find(p => p[1] === D[1]);
      return coordQ('A, B and C are three corners of a rectangle.\nWhat are the coordinates of the fourth corner, D?', D,
        ['The sides of a rectangle go straight across and straight up. D lines up with two of the other corners.',
          `D is straight above or below the corner at (${sameX[0]}, ${sameX[1]}), so its x-coordinate is ${D[0]}.`],
        `D lines up with (${sameX[0]}, ${sameX[1]}) going up and with (${sameY[0]}, ${sameY[1]}) going across. So D is (${D[0]}, ${D[1]}).`,
        { visual: G({ points: known.map((p, i) => ({ x: p[0], y: p[1], label: names[i] })), segments: [{ x1: known[0][0], y1: known[0][1], x2: known[1][0], y2: known[1][1] }, { x1: known[1][0], y1: known[1][1], x2: known[2][0], y2: known[2][1] }] }) });
    };

    const translateQ = L => {
      const r = retry(() => {
        const [x, y] = pt(), dx = L === 1 && coin() ? 0 : R(-5, 5), dy = L === 1 && dx !== 0 ? 0 : R(-5, 5);
        const nx = x + dx, ny = y + dy;
        return (dx || dy) && nx >= 0 && nx <= 10 && ny >= 0 && ny <= 10 ? { x, y, dx, dy, nx, ny } : null;
      });
      const { x, y, dx, dy, nx, ny } = r;
      const desc = [dx ? mv(dx, 'right', 'left') : '', dy ? mv(dy, 'up', 'down') : ''].filter(Boolean).join(' and ');
      const first = dx ? `Moving ${mv(dx, 'right', 'left')} changes x: ${x} ${dx > 0 ? '+' : M} ${Math.abs(dx)} = ${nx}.` : `Moving ${mv(dy, 'up', 'down')} changes y: ${y} ${dy > 0 ? '+' : M} ${Math.abs(dy)} = ${ny}.`;
      return coordQ(`Point P is at (${x}, ${y}). It is translated ${desc}.\nWhere is P now?`, [nx, ny],
        ['Right or left changes the x-coordinate (first number). Up or down changes the y-coordinate (second number).', first],
        `x: ${x} ${dx >= 0 ? '+' : M} ${Math.abs(dx)} = ${nx}. y: ${y} ${dy >= 0 ? '+' : M} ${Math.abs(dy)} = ${ny}. P moves to (${nx}, ${ny}).`,
        { visual: G({ points: [{ x, y, label: 'P' }] }) });
    };

    const shapeTranslate = () => {
      const r = retry(() => {
        const x = R(1, 6), y = R(1, 6), w = R(2, 3), h = R(2, 3), dx = R(-4, 4), dy = R(-4, 4);
        const tri = [[x, y], [x + w, y], [x, y + h]], moved = tri.map(([a, b]) => [a + dx, b + dy]);
        return dx && dy && moved.every(([a, b]) => a >= 0 && a <= 10 && b >= 0 && b <= 10) ? { tri, dx, dy, k: R(0, 2) } : null;
      });
      const { tri, dx, dy, k } = r, A = tri[k], ans = [A[0] + dx, A[1] + dy];
      return coordQ(`The triangle is translated ${mv(dx, 'right', 'left')} and ${mv(dy, 'up', 'down')}.\nWhat are the new coordinates of corner A?`, ans,
        ['Every corner moves the same way. Find where A is now, then move it.', `A is at (${A[0]}, ${A[1]}). Moving ${mv(dx, 'right', 'left')} makes x = ${ans[0]}.`],
        `A (${A[0]}, ${A[1]}) moves to (${A[0]} ${dx > 0 ? '+' : M} ${Math.abs(dx)}, ${A[1]} ${dy > 0 ? '+' : M} ${Math.abs(dy)}) = (${ans[0]}, ${ans[1]}).`,
        { visual: G({ polygons: [{ pts: tri }], points: [{ x: A[0], y: A[1], label: 'A' }] }) });
    };

    const reflectQ = L => {
      const vert = L === 2 || coin();
      const r = retry(() => {
        const k = R(3, 7), a = R(1, 9), b = R(1, 9), m = vert ? a : b;
        if (m === k) return null;
        const img = vert ? [2 * k - a, b] : [a, 2 * k - b];
        return img.every(v => v >= 0 && v <= 10) ? { k, a, b, img } : null;
      });
      const { k, a, b, img } = r, d = Math.abs((vert ? a : b) - k);
      const side = vert ? (a < k ? 'left' : 'right') : (b < k ? 'below' : 'above');
      const other = { left: 'right', right: 'left', below: 'above', above: 'below' }[side];
      const seg = vert ? { x1: k, y1: 0, x2: k, y2: 10 } : { x1: 0, y1: k, x2: 10, y2: k };
      return coordQ(`Reflect point P in the mirror line.\nWhat are the coordinates of the reflection?`, img,
        ['A reflection is the same distance from the mirror line, but on the other side.',
          `P is ${d} square${d > 1 ? 's' : ''} ${side === 'left' || side === 'right' ? 'to the ' + side + ' of' : side} the mirror line.`],
        `P is ${d} square${d > 1 ? 's' : ''} ${side === 'left' || side === 'right' ? 'to the ' + side + ' of' : side} the line, so the reflection is ${d} square${d > 1 ? 's' : ''} ${other === 'left' || other === 'right' ? 'to the ' + other : other}: (${img[0]}, ${img[1]}).`,
        { visual: G({ segments: [seg], points: [{ x: a, y: b, label: 'P' }] }) });
    };

    const spotQ = () => {
      const [x, y] = pt(), who = U.name();
      return coordQ(`${who} says point A is at (${y}, ${x}).\nWhat are the correct coordinates of A?`, [x, y],
        [ACROSS, `Count across from (0, 0) first: A is ${x} squares across.`],
        `A is ${x} across and ${y} up: (${x}, ${y}). ${who} wrote the numbers the wrong way round.`,
        { visual: G({ points: [{ x, y, label: 'A' }] }) });
    };

    PMLM.registerSkill({
      id: 'g5.coordinates', grade: 5, unit: 'g5.u4', title: 'Coordinates', icon: '📍',
      blurb: 'Read and plot points, translate and reflect',
      lesson: [
        { title: 'Reading coordinates',
          text: 'Coordinates tell you where a point is: **(across, up)**.\nA is at (3, 5): 3 across, then 5 up.\n**Tip:** "Along the corridor, then up the stairs."',
          visual: { type: 'grid', xmin: 0, xmax: 8, ymin: 0, ymax: 8, points: [{ x: 3, y: 5, label: 'A' }] } },
        { title: 'Order matters',
          text: '(2, 6) and (6, 2) are different points!\nThe first number is always the x-coordinate (across).\nThe second number is the y-coordinate (up).',
          visual: { type: 'grid', xmin: 0, xmax: 8, ymin: 0, ymax: 8, points: [{ x: 2, y: 6, label: '(2, 6)' }, { x: 6, y: 2, label: '(6, 2)' }] } },
        { title: 'Translation',
          text: 'A translation **slides** a shape. Every corner moves the same way.\nThis triangle moves 4 right and 2 up: add 4 to each x and 2 to each y.',
          visual: { type: 'grid', xmin: 0, xmax: 9, ymin: 0, ymax: 7, polygons: [{ pts: [[1, 1], [3, 1], [1, 3]] }, { pts: [[5, 3], [7, 3], [5, 5]], ghost: true }] } },
        { title: 'Reflection',
          text: 'A reflection **flips** a shape in a mirror line.\nEach point ends up the same distance from the mirror, on the other side.\nP (2, 3) is 2 squares left of the mirror at x = 4, so its reflection is 2 squares right: (6, 3).',
          visual: { type: 'grid', xmin: 0, xmax: 8, ymin: 0, ymax: 6, segments: [{ x1: 4, y1: 0, x2: 4, y2: 6 }], points: [{ x: 2, y: 3, label: 'P' }, { x: 6, y: 3, label: 'P′' }] } },
        { title: 'Worked example',
          text: 'Translate (2, 3) by 4 squares right and 1 square down.\n**1.** Right changes x: 2 + 4 = 6.\n**2.** Down changes y: 3 − 1 = 2.\n**3.** Put them together, x first.\nAnswer: **(6, 2)**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [readQ, readQ, whichPoint, translateQ, spotQ],
          [readQ, whichPoint, cornerQ, translateQ, reflectQ, spotQ],
          [cornerQ, translateQ, shapeTranslate, reflectQ, reflectQ, readQ],
        ], ctx);
      },
    });
  }

  /* 22 ── Time (24-hour clock, durations) and metric units */
  {
    const t24 = (h, m) => `${pad2(h)}:${pad2(m)}`;
    const t12 = (h, m) => `${h % 12 === 0 ? 12 : h % 12}:${pad2(m)} ${h < 12 ? 'am' : 'pm'}`;
    const dur = mins => { const h = Math.floor(mins / 60), m = mins % 60; return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`; };

    const to24 = L => {
      const pm = L === 1 || Math.random() < 0.75, h = R(1, 11), m = R(0, 11) * 5, H = pm ? h + 12 : h;
      const wr = pm ? [t24(h, m), t24(h + 10, m), t24(h + 11, m), t24(h + 2, m)] : [t24(h + 12, m), t24(h + 10, m), t24(h + 1, m)];
      return choice(`What is ${h}:${pad2(m)} ${pm ? 'pm' : 'am'} on the 24-hour clock?`, t24(H, m), wr,
        ['Morning (am) hours stay the same. Afternoon and evening (pm) hours: add 12.',
          pm ? `It is pm, so add 12 to the hours: ${h} + 12 = ${h + 12}.` : 'It is am, so the hours stay the same. Write 2 digits for the hours.'],
        `${h}:${pad2(m)} ${pm ? 'pm' : 'am'} is ${t24(H, m)}${pm ? ` (${h} + 12 = ${h + 12})` : ''}.`,
        L === 1 ? { visual: { type: 'clock', h, m } } : {});
    };

    const to12 = () => {
      const H = R(13, 23), m = R(0, 11) * 5;
      return choice(`What is ${t24(H, m)} on the 12-hour clock?`, t12(H, m), [`${H - 10}:${pad2(m)} pm`, t12(H - 12, m), `${H - 11}:${pad2(m)} pm`, `${H - 13 > 0 ? H - 13 : H - 9}:${pad2(m)} pm`],
        ['Hours bigger than 12 are in the afternoon or evening (pm). Take away 12.', `${H} − 12 = ${H - 12}.`],
        `${H} − 12 = ${H - 12}, so ${t24(H, m)} is ${t12(H, m)}.`);
    };

    const countOn = (h1, m1, h2, m2) => {
      const parts = [];
      let h = h1;
      if (m1) { parts.push(`${60 - m1} min to ${t24(h1 + 1, 0)}`); h = h1 + 1; }
      if (h2 > h) parts.push(`${h2 - h} h to ${t24(h2, 0)}`);
      if (m2) parts.push(`${m2} min to ${t24(h2, m2)}`);
      return parts.join(', then ');
    };

    const durationQ = L => {
      const r = retry(() => {
        const h1 = R(7, 18), m1 = L === 1 ? R(0, 3) * 15 : R(0, 11) * 5, d = L === 1 ? R(2, 8) * 15 : R(5, 40) * 5;
        const end = h1 * 60 + m1 + d, h2 = Math.floor(end / 60), m2 = end % 60;
        return h2 <= 23 && h2 > h1 && m2 !== m1 && !(m2 === 0 && h2 === h1 + 1) ? { h1, m1, d, h2, m2 } : null;
      });
      const { h1, m1, d, h2, m2 } = r;
      const X = (h2 * 100 + m2) - (h1 * 100 + m1), bad = `${Math.floor(X / 100) ? Math.floor(X / 100) + ' h ' : ''}${X % 100} min`;
      const wr = [bad, dur(d + 60), dur(Math.abs(d - 10)), dur(d + 10), dur(d - 60 > 0 ? d - 60 : d + 20)].filter(x => x !== dur(d));
      const [what, verb1, verb2] = pick([['bus journey', 'A bus leaves at', 'and arrives at'], ['film', 'A film starts at', 'and ends at'], ['swimming lesson', 'A swimming lesson starts at', 'and finishes at']]);
      return choice(`${verb1} ${t24(h1, m1)} ${verb2} ${t24(h2, m2)}.\nHow long is the ${what}?`, dur(d), wr,
        ['Count on: first to the next o\'clock, then whole hours, then the minutes left. (Do not subtract like normal numbers: an hour has 60 minutes, not 100!)',
          m1 ? `From ${t24(h1, m1)} to ${t24(h1 + 1, 0)} is ${60 - m1} minutes.` : `From ${t24(h1, 0)}, count the whole hours first.`],
        `${countOn(h1, m1, h2, m2)}. Total: ${dur(d)}.`);
    };

    const endQ = L => {
      const r = retry(() => {
        const h1 = R(8, 19), m1 = R(1, 11) * 5, dh = R(0, 2), dm = R(1, 11) * 5, end = h1 * 60 + m1 + dh * 60 + dm;
        return m1 + dm > 60 && end < 24 * 60 && dh * 60 + dm >= 20 ? { h1, m1, dh, dm, end } : null;
      });
      const { h1, m1, dh, dm, end } = r, h2 = Math.floor(end / 60), m2 = end % 60;
      const wr = [`${pad2(h1 + dh)}:${pad2(m1 + dm)}`, t24(h2 + 1, m2), t24(h2, (m2 + 10) % 60), t24(h2 - 1, m2)];
      return choice(`A film starts at ${t24(h1, m1)} and lasts ${dur(dh * 60 + dm)}.\nWhat time does it end?`, t24(h2, m2), wr,
        ['Add the hours first, then the minutes. Remember: 60 minutes make 1 hour.',
          dh ? `${t24(h1, m1)} + ${dh} h = ${t24(h1 + dh, m1)}. Now add ${dm} minutes.` : `It is ${60 - m1} minutes from ${t24(h1, m1)} to ${t24(h1 + 1, 0)}.`],
        `${t24(h1, m1)}${dh ? ` + ${dh} h = ${t24(h1 + dh, m1)}` : ''}. Then + ${dm} min: ${60 - m1} min takes you to ${t24(h1 + dh + 1, 0)}, and ${dm - (60 - m1)} min more gives ${t24(h2, m2)}.`);
    };

    const CONV = [['m', 'cm', 100, 'metres', 'centimetres'], ['cm', 'mm', 10, 'centimetres', 'millimetres'], ['km', 'm', 1000, 'kilometres', 'metres'],
      ['kg', 'g', 1000, 'kilograms', 'grams'], ['litres', 'ml', 1000, 'litres', 'millilitres']];
    const convertQ = L => {
      const [bigU, smallU, f] = pick(CONV);
      const down = L === 1 || coin();
      const x = L === 1 ? R(2, 12) : L === 2 ? U.clean(R(11, 99) / 10) : U.clean(R(101, 999) / 100);
      const y = U.clean(x * f);
      if (down) {
        return num(`${F(x)} ${bigU} = □ ${smallU}`, y,
          ['Changing a big unit into a small unit: multiply.', `1 ${bigU === 'litres' ? 'litre' : bigU} = ${F(f)} ${smallU}, so multiply ${F(x)} by ${F(f)}.`],
          `${F(x)} × ${F(f)} = ${F(y)}, so ${F(x)} ${bigU} = ${F(y)} ${smallU}.`, { unit: smallU });
      }
      return num(`${F(y)} ${smallU} = □ ${bigU}`, x,
        ['Changing a small unit into a big unit: divide.', `1 ${bigU === 'litres' ? 'litre' : bigU} = ${F(f)} ${smallU}, so divide ${F(y)} by ${F(f)}.`],
        `${F(y)} ÷ ${F(f)} = ${F(x)}, so ${F(y)} ${smallU} = ${F(x)} ${bigU}.`, { unit: bigU });
    };

    const mixedUnitQ = () => {
      const t = R(1, 4);
      if (t === 1) { const a = R(1, 9), b = R(5, 95); return num(`${a} m ${b} cm = □ cm`, 100 * a + b, ['1 m = 100 cm. Change the metres into centimetres, then add the extra centimetres.', `${a} m = ${a * 100} cm.`], `${a} m = ${a * 100} cm. ${a * 100} + ${b} = ${100 * a + b} cm.`, { unit: 'cm' }); }
      if (t === 2) { const a = R(1, 9), b = R(50, 950); return num(`${a} kg ${b} g = □ g`, 1000 * a + b, ['1 kg = 1000 g. Change the kilograms into grams, then add the extra grams.', `${a} kg = ${a * 1000} g.`], `${a} kg = ${a * 1000} g. ${a * 1000} + ${b} = ${1000 * a + b} g.`, { unit: 'g' }); }
      if (t === 3) { const h = R(1, 4), m = R(1, 11) * 5; return num(`${h} h ${m} min = □ minutes`, 60 * h + m, ['1 hour = 60 minutes (not 100!). Change the hours into minutes, then add the extra minutes.', `${h} h = ${h} × 60 = ${60 * h} minutes.`], `${h} × 60 = ${60 * h}. ${60 * h} + ${m} = ${60 * h + m} minutes.`, { unit: 'minutes' }); }
      const ml = pick([200, 250, 500]), Lt = pick([1, 1.5, 2, 3]), n = Lt * 1000 / ml;
      if (!Number.isInteger(n)) return mixedUnitQ();
      return num(`A bottle holds ${F(Lt)} litres of juice. A glass holds ${ml} ml.\nHow many glasses can be filled?`, n,
        ['Change the litres into millilitres first, so both amounts use the same unit.', `${F(Lt)} litres = ${F(Lt)} × 1000 = ${Lt * 1000} ml.`],
        `${F(Lt)} litres = ${Lt * 1000} ml. ${Lt * 1000} ÷ ${ml} = ${n} glasses.`, { unit: 'glasses' });
    };

    PMLM.registerSkill({
      id: 'g5.timeMeasure', grade: 5, unit: 'g5.u4', title: 'Time and measures', icon: '⏰',
      blurb: '24-hour clock, durations and metric units',
      lesson: [
        { title: 'The 24-hour clock',
          text: 'The 24-hour clock counts the hours from 00 to 23.\nMorning times stay the same. **Afternoon and evening: add 12.**',
          visual: { type: 'table', headers: ['12-hour clock', '24-hour clock'], rows: [['7:15 am', '07:15'], ['12:00 noon', '12:00'], ['3:45 pm', '15:45'], ['11:30 pm', '23:30'], ['12:00 midnight', '00:00']] } },
        { title: 'How long? Count on',
          text: 'From 09:40 to 11:15:\n09:40 → 10:00 is 20 min\n10:00 → 11:00 is 1 h\n11:00 → 11:15 is 15 min\nTotal: **1 h 35 min**.\n**Careful:** an hour has 60 minutes, not 100. Don\'t subtract times like normal numbers.' },
        { title: 'Metric units',
          text: 'Learn these:',
          visual: { type: 'table', headers: ['Measure', 'Facts'], rows: [['Length', '1 cm = 10 mm\n1 m = 100 cm\n1 km = 1000 m'], ['Mass', '1 kg = 1000 g'], ['Capacity', '1 litre = 1000 ml'], ['Time', '1 hour = 60 minutes']] } },
        { title: 'Converting',
          text: 'Big unit → small unit: **multiply**. 2.5 kg = 2.5 × 1000 = 2500 g.\nSmall unit → big unit: **divide**. 350 cm = 350 ÷ 100 = 3.5 m.\nMixed units: 3 m 45 cm = 300 + 45 = 345 cm.' },
        { title: 'Worked example',
          text: 'A film starts at 14:35 and lasts 1 h 50 min. When does it end?\n**1.** Add the hour: 14:35 + 1 h = 15:35.\n**2.** Add 25 min to reach 16:00. That leaves 50 − 25 = 25 min.\n**3.** 16:00 + 25 min = 16:25.\nAnswer: **16:25**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [to24, to24, durationQ, convertQ, convertQ],
          [to24, to12, durationQ, endQ, convertQ, convertQ],
          [to12, durationQ, endQ, convertQ, mixedUnitQ, mixedUnitQ],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 5: Data and probability ═══════════════════════
  PMLM.registerUnit({ id: 'g5.u5', grade: 5, name: 'Data and probability', icon: '📊' });

  /* 23 ── Bar charts, frequency tables and line graphs */
  {
    const TOPICS = [
      ['favourite fruit', ['Apple', 'Banana', 'Orange', 'Grape', 'Pear', 'Mango']],
      ['favourite pet', ['Cat', 'Dog', 'Fish', 'Rabbit', 'Bird', 'Hamster']],
      ['favourite sport', ['Football', 'Tennis', 'Swimming', 'Running', 'Cricket', 'Netball']],
      ['favourite colour', ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange']],
    ];
    const makeBars = L => {
      const [topic, names] = pick(TOPICS), n = L === 1 ? 4 : 5;
      const step = L === 1 ? pick([1, 2]) : L === 2 ? pick([2, 5]) : pick([5, 10]);
      const half = L === 3 && step === 10;
      const vals = retry(() => {
        const v = Array.from({ length: n }, () => step * R(1, 9) + (half && coin() ? step / 2 : 0));
        return new Set(v).size === n ? v : null;
      });
      const labels = U.sample(names, n);
      return { topic, step, bars: labels.map((label, i) => ({ label, value: vals[i] })) };
    };
    const chart = d => ({ type: 'barChart', bars: d.bars, step: d.step, yLabel: 'Children', title: `Our ${d.topic}` });
    const READ = 'Go to the top of the bar, then look straight across to the scale.';
    const scaleTip = d => `Each line on the scale is worth ${d.step}.${d.step === 10 ? ' A bar that stops halfway between two lines is worth 5 more than the line below.' : ''}`;

    const readQ = L => {
      const d = makeBars(L), b = pick(d.bars);
      return num(`The bar chart shows the ${d.topic} of some children.\nHow many children chose **${b.label}**?`, b.value,
        [READ, scaleTip(d)], `The ${b.label} bar reaches ${b.value}, so ${b.value} children chose ${b.label}.`,
        { visual: chart(d) });
    };

    const diffQ = L => {
      const d = makeBars(L), [x, y] = U.sample(d.bars, 2).sort((p, q) => q.value - p.value);
      return num(`The bar chart shows the ${d.topic} of some children.\nHow many more children chose **${x.label}** than **${y.label}**?`, x.value - y.value,
        ['Read both bars. Then find the difference: subtract.', `${x.label}: ${x.value} children. Now read ${y.label}.`],
        `${x.label} = ${x.value} and ${y.label} = ${y.value}. ${x.value} − ${y.value} = ${x.value - y.value}.`,
        { visual: chart(d) });
    };

    const totalQ = L => {
      const d = makeBars(L), tot = sum(d.bars.map(b => b.value));
      return num(`The bar chart shows the ${d.topic} of some children.\nHow many children were asked altogether?`, tot,
        ['Read every bar. Then add them all together.', `${d.bars[0].label} = ${d.bars[0].value}, ${d.bars[1].label} = ${d.bars[1].value}. Read the rest and add.`],
        `${d.bars.map(b => b.value).join(' + ')} = ${tot} children.`,
        { visual: chart(d) });
    };

    const mostQ = L => {
      const d = makeBars(L), most = coin(), vs = d.bars.map(b => b.value);
      const ans = d.bars.find(b => b.value === (most ? Math.max(...vs) : Math.min(...vs)));
      return choice(`The bar chart shows the ${d.topic} of some children.\nWhich was the **${most ? 'most' : 'least'}** popular?`, ans.label, d.bars.filter(b => b !== ans).map(b => b.label),
        [`The ${most ? 'most' : 'least'} popular has the ${most ? 'tallest' : 'shortest'} bar.`, 'Compare the tops of the bars with the scale.'],
        `${ans.label} has the ${most ? 'tallest' : 'shortest'} bar (${ans.value}), so it is the ${most ? 'most' : 'least'} popular.`,
        { visual: chart(d) });
    };

    const tableQ = L => {
      const [topic, names] = pick(TOPICS), n = 4, labels = U.sample(names, n), vals = labels.map(() => R(2, L === 1 ? 12 : 30)), tot = sum(vals);
      const k = R(0, n - 1), known = vals.filter((v, i) => i !== k);
      if (vals[k] === sum(known) || vals[k] === vals[0] + vals[1]) return tableQ(L);
      if (coin()) {
        return num(`The frequency table shows the ${topic} of ${tot} children.\nWhat is the missing frequency?`, vals[k],
          ['All the frequencies add up to the total number of children.', `Add the frequencies you know: ${known.join(' + ')} = ${sum(known)}.`],
          `${sum(known)} + □ = ${tot}, so □ = ${tot} − ${sum(known)} = ${vals[k]}.`,
          { visual: { type: 'table', headers: [topic.replace('favourite ', '').replace(/^./, c => c.toUpperCase()), 'Frequency'], rows: labels.map((l, i) => [l, i === k ? '□' : vals[i]]).concat([['**Total**', `**${tot}**`]]) } });
      }
      return num(`The frequency table shows the ${topic} of some children.\nHow many children were asked altogether?`, tot,
        ['Add up all the frequencies.', `${vals[0]} + ${vals[1]} = ${vals[0] + vals[1]}. Now add the others.`],
        `${vals.join(' + ')} = ${tot}.`,
        { visual: { type: 'table', headers: [topic.replace('favourite ', '').replace(/^./, c => c.toUpperCase()), 'Frequency'], rows: labels.map((l, i) => [l, vals[i]]) } });
    };

    // line graphs drawn on a grid: x = week, y = height in cm (or hour / temperature)
    const makeLine = () => {
      const plant = coin();
      const ys = retry(() => {
        const out = [R(plant ? 0 : 2, plant ? 2 : 6)];
        for (let i = 1; i <= 7; i++) out.push(plant ? out[i - 1] + R(0, 3) : out[i - 1] + R(-2, 3));
        const inc = out.slice(1).map((v, i) => v - out[i]), big = Math.max(...inc);
        return Math.max(...out) <= 12 && Math.min(...out) >= 0 && inc.filter(v => v === big).length === 1 ? out : null;
      });
      return { plant, ys };
    };
    const lineVis = ys => ({ type: 'grid', xmin: 0, xmax: 8, ymin: 0, ymax: 12, points: ys.map((y, x) => ({ x, y })), segments: ys.slice(1).map((y, i) => ({ x1: i, y1: ys[i], x2: i + 1, y2: y })) });
    const lineIntro = p => (p ? 'The line graph shows the height of a plant. Across: the week number. Up: the height in cm.' : 'The line graph shows the temperature in a garden. Across: the hour. Up: the temperature in °C.');

    const lineRead = () => {
      const { plant, ys } = makeLine(), x = R(1, 7);
      return num(`${lineIntro(plant)}\nWhat was the ${plant ? 'height' : 'temperature'} at ${plant ? 'week' : 'hour'} ${x}?`, ys[x],
        [`Find ${x} on the bottom axis. Go straight up to the line, then straight across to the side axis.`, `Put your finger on ${x} along the bottom and move it up until you touch the line.`],
        `At ${plant ? 'week' : 'hour'} ${x} the line is at ${ys[x]}, so the ${plant ? 'height' : 'temperature'} was ${ys[x]} ${plant ? 'cm' : '°C'}.`,
        { unit: plant ? 'cm' : '°C', visual: lineVis(ys) });
    };

    const lineChange = () => {
      const { plant, ys } = makeLine();
      const [a, b] = retry(() => { const p = R(0, 6), q = R(p + 1, 7); return ys[q] > ys[p] ? [p, q] : null; });
      return num(`${lineIntro(plant)}\nHow much did the ${plant ? 'plant grow' : 'temperature rise'} from ${plant ? 'week' : 'hour'} ${a} to ${plant ? 'week' : 'hour'} ${b}?`, ys[b] - ys[a],
        ['Read both values from the graph. Then subtract.', `At ${a} the ${plant ? 'height' : 'temperature'} was ${ys[a]}. Now read the value at ${b}.`],
        `${ys[b]} − ${ys[a]} = ${plant ? ys[b] - ys[a] + ' cm' : U.s(ys[b] - ys[a], 'degree')}.`,
        { unit: plant ? 'cm' : 'degrees', visual: lineVis(ys) });
    };

    const lineSteep = () => {
      const { plant, ys } = makeLine(), inc = ys.slice(1).map((v, i) => v - ys[i]), k = inc.indexOf(Math.max(...inc));
      const lab = i => `${plant ? 'week' : 'hour'} ${i} to ${i + 1}`;
      return choice(`${lineIntro(plant)}\nWhen did the ${plant ? 'plant grow' : 'temperature rise'} the most?`, lab(k),
        U.shuffle(U.range(0, 6).filter(i => i !== k)).map(lab),
        ['Look for the steepest part of the line going up.', 'Work out the change for each step: the value at the end minus the value at the start.'],
        `From ${plant ? 'week' : 'hour'} ${k} to ${k + 1} it went from ${ys[k]} to ${ys[k + 1]}: up ${inc[k]}. That is the biggest rise.`,
        { visual: lineVis(ys) });
    };

    PMLM.registerSkill({
      id: 'g5.graphs', grade: 5, unit: 'g5.u5', title: 'Graphs and tables', icon: '📊',
      blurb: 'Read bar charts, line graphs and frequency tables',
      lesson: [
        { title: 'Frequency tables',
          text: 'A **frequency table** shows how many times each thing happens.\nThe total is all the frequencies added together: 8 + 5 + 3 + 4 = **20**.',
          visual: { type: 'table', headers: ['Pet', 'Frequency'], rows: [['Cat', 8], ['Dog', 5], ['Fish', 3], ['Rabbit', 4]] } },
        { title: 'Bar charts',
          text: 'Read a bar by going from its top straight across to the scale.\n**Check the scale!** Here each line is worth 2. The Dog bar reaches 10.',
          visual: { type: 'barChart', bars: [{ label: 'Cat', value: 6 }, { label: 'Dog', value: 10 }, { label: 'Fish', value: 4 }, { label: 'Bird', value: 7 }], step: 2, yLabel: 'Children' } },
        { title: 'Line graphs',
          text: 'A **line graph** shows how something changes over time.\nThis one shows a plant growing. Across is the week; up is the height in cm.\nA steeper line means a faster change.',
          visual: { type: 'grid', xmin: 0, xmax: 6, ymin: 0, ymax: 8, points: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 7 }], segments: [{ x1: 0, y1: 1, x2: 1, y2: 2 }, { x1: 1, y1: 2, x2: 2, y2: 4 }, { x1: 2, y1: 4, x2: 3, y2: 5 }, { x1: 3, y1: 5, x2: 4, y2: 7 }] } },
        { title: 'Asking questions',
          text: '**How many?** Read one bar.\n**How many more?** Read two bars and subtract.\n**Altogether?** Read all the bars and add.\n**Most popular?** Find the tallest bar.' },
        { title: 'Worked example',
          text: 'Use the bar chart above. How many more children chose Dog than Fish?\n**1.** Each line is worth 2.\n**2.** Dog reaches 10. Fish reaches 4.\n**3.** 10 − 4 = 6.\nAnswer: **6 more children**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [readQ, readQ, diffQ, mostQ, tableQ, lineRead],
          [readQ, diffQ, totalQ, mostQ, tableQ, lineRead, lineChange],
          [readQ, diffQ, totalQ, tableQ, lineRead, lineChange, lineSteep],
        ], ctx);
      },
    });
  }

  /* 24 ── Mode, median and range */
  {
    const CTX = [['Here are the goals scored by a team in some matches:', ''], ['Here are the scores of some children in a spelling test:', ''],
      ['Here are the heights of some sunflowers, in cm:', 'cm'], ['Here are the numbers of books some children read in a month:', '']];
    const makeData = L => retry(() => {
      const n = L === 1 ? 5 : L === 2 ? pick([5, 7]) : pick([7, 9]), top = L === 1 ? 10 : L === 2 ? 20 : 50;
      const d = Array.from({ length: n }, () => R(1, top));
      const m = R(0, n - 1); d[(m + 1) % n] = d[m];                 // make sure some value repeats
      const counts = {}; d.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
      const max = Math.max(...Object.values(counts)), modes = Object.keys(counts).filter(k => counts[k] === max);
      const sorted = d.slice().sort((a, b) => a - b), med = sorted[(n - 1) / 2];
      if (modes.length !== 1 || d[(n - 1) / 2] === med) return null;
      return { d, sorted, mode: +modes[0], med, range: sorted[n - 1] - sorted[0], n };
    });

    const modeQ = L => {
      const s = makeData(L), [intro, u] = pick(CTX);
      return num(`${intro}\n${s.d.join(', ')}\nWhat is the **mode**?`, s.mode,
        ['The mode is the value that appears **most often**.', `Put them in order to see repeats easily: ${s.sorted.join(', ')}.`],
        `${s.mode} appears more often than any other value, so the mode is ${s.mode}.`, u ? { unit: u } : {});
    };

    const medianQ = L => {
      const s = makeData(L), [intro, u] = pick(CTX);
      return num(`${intro}\n${s.d.join(', ')}\nWhat is the **median**?`, s.med,
        ['Put the numbers in order, smallest to biggest. The median is the one in the middle.', `In order: ${s.sorted.join(', ')}. There are ${s.n} numbers.`],
        `In order: ${s.sorted.join(', ')}. The middle (${U.ord((s.n + 1) / 2)}) number is ${s.med}.`, u ? { unit: u } : {});
    };

    const rangeQ = L => {
      const s = makeData(L), [intro, u] = pick(CTX), max = s.sorted[s.n - 1];
      return num(`${intro}\n${s.d.join(', ')}\nWhat is the **range**?`, s.range,
        ['Range = biggest value − smallest value.', `The biggest value is ${max}. Now find the smallest.`],
        `${max} − ${s.sorted[0]} = ${s.range}, so the range is ${s.range}.`, u ? { unit: u } : {});
    };

    const choiceQ = L => {
      const s = makeData(L), [intro] = pick(CTX), mid = s.d[(s.n - 1) / 2];
      return nchoice(`${intro}\n${s.d.join(', ')}\nWhich is the **median**?`, s.med, [mid, s.mode, s.range],
        ['First put the numbers in order. Then find the middle one.', `There are ${s.n} numbers, so the median is the ${U.ord((s.n + 1) / 2)} one in order.`],
        `In order: ${s.sorted.join(', ')}. The middle number is ${s.med}. (${mid} is only in the middle of the list before it was ordered.)`);
    };

    const spotQ = L => {
      const s = makeData(L), mid = s.d[(s.n - 1) / 2], who = U.name();
      return num(`${who} says the median of these numbers is ${mid}, because it is in the middle of the list.\n${s.d.join(', ')}\nWhat is the correct median?`, s.med,
        ['The numbers must be put **in order** before you find the middle.', `In order: ${s.sorted.join(', ')}.`],
        `In order: ${s.sorted.join(', ')}. The middle number is ${s.med}, not ${mid}.`);
    };

    const tableQ = L => {
      const s = makeData(Math.max(L, 2)), names = U.sample(['Ali', 'Leyla', 'Sam', 'Mia', 'Omar', 'Aysel', 'Tom', 'Nina', 'Zara'], s.n);
      const ask = pick(['mode', 'range']);
      return num(`The table shows how many goals each player scored this season.\nWhat is the **${ask}** of the goals?`, ask === 'mode' ? s.mode : s.range,
        ask === 'mode' ? ['The mode is the number of goals that appears most often.', 'Look down the Goals column. Which number appears more than once?']
          : ['Range = biggest − smallest.', `The most goals is ${s.sorted[s.n - 1]}. Now find the fewest.`],
        ask === 'mode' ? `${s.mode} appears most often, so the mode is ${s.mode}.` : `${s.sorted[s.n - 1]} − ${s.sorted[0]} = ${s.range}.`,
        { visual: { type: 'table', headers: ['Player', 'Goals'], rows: names.map((nm, i) => [nm, s.d[i]]) } });
    };

    const missingQ = () => {
      const r = R(4, 30), lo = retry(() => { const x = R(1, 20); return x !== r ? x : null; });
      if (coin()) {
        return num(`The range of some numbers is ${r}. The smallest number is ${lo}.\nWhat is the biggest number?`, lo + r,
          ['Range = biggest − smallest. So biggest = smallest + range.', `□ − ${lo} = ${r}.`],
          `${lo} + ${r} = ${lo + r}. Check: ${lo + r} − ${lo} = ${r}.`);
      }
      return num(`The range of some numbers is ${r}. The biggest number is ${lo + r}.\nWhat is the smallest number?`, lo,
        ['Range = biggest − smallest. So smallest = biggest − range.', `${lo + r} − □ = ${r}.`],
        `${lo + r} − ${r} = ${lo}. Check: ${lo + r} − ${lo} = ${r}.`);
    };

    PMLM.registerSkill({
      id: 'g5.averages', grade: 5, unit: 'g5.u5', title: 'Mode, median and range', icon: '📈',
      blurb: 'Find the mode, median and range of a set of data',
      lesson: [
        { title: 'Mode',
          text: 'The **mode** is the value that appears **most often**.\n3, 5, 5, 7, 8 → the mode is **5**.\n**Tip:** "mode" sounds like "most".' },
        { title: 'Median',
          text: 'The **median** is the **middle** value when the numbers are in order.\n7, 2, 9, 4, 5 → in order: 2, 4, **5**, 7, 9.\nThe median is **5**.' },
        { title: 'Range',
          text: 'The **range** tells you how spread out the numbers are.\nRange = biggest − smallest.\n2, 4, 5, 7, 9 → 9 − 2 = **7**.' },
        { title: 'Order first!',
          text: 'Putting the numbers in order helps with all three.\nThe repeats sit next to each other (mode), the middle is easy to see (median), and the smallest and biggest are at the ends (range).',
          visual: { type: 'sequence', terms: ['2', '4', '5', '7', '9'] } },
        { title: 'Worked example',
          text: 'Data: 6, 3, 8, 3, 5\n**1.** Put them in order: 3, 3, 5, 6, 8.\n**2.** Mode: 3 appears twice → **3**.\n**3.** Median: the middle of 5 numbers is the 3rd → **5**.\n**4.** Range: 8 − 3 = **5**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [modeQ, medianQ, rangeQ, modeQ, rangeQ],
          [modeQ, medianQ, rangeQ, choiceQ, spotQ, tableQ],
          [medianQ, rangeQ, choiceQ, spotQ, tableQ, missingQ],
        ], ctx);
      },
    });
  }

  /* 25 ── Probability: likelihood and equally likely outcomes */
  {
    const WORDS = ['impossible', 'unlikely', 'even chance', 'likely', 'certain'];
    const MEAN = { impossible: 'it cannot happen', unlikely: 'it will probably not happen', 'even chance': 'it is just as likely to happen as not', likely: 'it will probably happen', certain: 'it will definitely happen' };
    const COLS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const word = (k, N) => (k === 0 ? 'impossible' : k === N ? 'certain' : 2 * k === N ? 'even chance' : 2 * k > N ? 'likely' : 'unlikely');
    const SCALE = 'none → impossible, less than half → unlikely, exactly half → even chance, more than half → likely, all → certain.';

    const bagQ = () => {
      const target = pick(WORDS);
      const r = retry(() => {
        const N = R(4, 12), cs = U.sample(COLS, 3), c = cs[0];
        let k;
        if (target === 'impossible') k = 0; else if (target === 'certain') k = N;
        else if (target === 'even chance') { if (N % 2) return null; k = N / 2; }
        else if (target === 'likely') k = R(Math.floor(N / 2) + 1, N - 1); else k = R(1, Math.ceil(N / 2) - 1);
        if (k < 0 || k > N || word(k, N) !== target) return null;
        const rest = N - k, o1 = rest ? R(rest > 1 ? 1 : rest, rest) : 0, o2 = rest - o1;
        const items = [{ color: cs[1], count: o1 }, { color: cs[2], count: o2 }, { color: c, count: k }].filter(it => it.count > 0);
        return { N, c, k, items };
      });
      return choice(`You pick one marble from this bag without looking.\nHow likely is it that you pick a **${r.c}** marble?`, target, WORDS.filter(w => w !== target),
        [`Count the ${r.c} marbles and the total number of marbles.`, `There ${r.k === 1 ? 'is' : 'are'} ${r.k} ${r.c} out of ${r.N}. Is that none, less than half, exactly half, more than half, or all?`],
        `${r.k} out of ${r.N} marbles ${r.k === 1 ? 'is' : 'are'} ${r.c}: ${r.k === 0 ? 'none' : r.k === r.N ? 'all of them' : 2 * r.k === r.N ? 'exactly half' : 2 * r.k > r.N ? 'more than half' : 'less than half'}. So it is ${target === 'even chance' ? 'an even chance' : target}.`,
        { nChoices: 5, visual: { type: 'bag', items: r.items } });
    };

    const spinnerQ = L => {
      const n = pick([6, 8]), most = L < 3 || coin();
      const r = retry(() => {
        const cs = U.sample(COLS, 3), a = R(1, n - 2), b = R(1, n - 1 - a), c = n - a - b, counts = [a, b, c];
        const target = most ? Math.max(...counts) : Math.min(...counts);
        return c >= 1 && counts.filter(x => x === target).length === 1 ? { cs, counts, k: counts.indexOf(target) } : null;
      });
      const sectors = U.shuffle(r.cs.flatMap((col, i) => Array(r.counts[i]).fill({ color: col })));
      return choice(`The spinner has ${n} equal sections.\nWhich colour is it **${most ? 'most' : 'least'}** likely to land on?`, r.cs[r.k], r.cs.filter((c, i) => i !== r.k),
        ['All the sections are the same size, so count the sections of each colour.', 'Go round the spinner and count one colour at a time. Write each number down.'],
        `${cap(r.cs.map((c, i) => `${c}: ${r.counts[i]}`).join(', '))}. ${cap(r.cs[r.k])} has the ${most ? 'most' : 'fewest'} sections, so it is the ${most ? 'most' : 'least'} likely.`,
        { visual: { type: 'spinner', sectors } });
    };

    const equalQ = () => {
      const r = retry(() => { const cs = U.sample(COLS, 3), a = R(1, 3), c = R(1, 4); return c !== a && 2 * a + c <= 10 ? { cs, a, c } : null; });
      const [x, y, z] = r.cs, sectors = U.shuffle([...Array(r.a).fill({ color: x }), ...Array(r.a).fill({ color: y }), ...Array(r.c).fill({ color: z })]);
      return choice('All the sections of this spinner are the same size.\nWhich two colours are **equally likely**?', `${x} and ${y}`, [`${x} and ${z}`, `${y} and ${z}`],
        ['Equally likely means they have the same chance. Count the sections of each colour.', `There ${r.a === 1 ? 'is' : 'are'} ${r.a} ${x} section${r.a > 1 ? 's' : ''}. Count the others.`],
        `${cap(x)} and ${y} both have ${r.a} section${r.a > 1 ? 's' : ''}, so they are equally likely. ${z} has ${r.c}.`,
        { visual: { type: 'spinner', sectors } });
    };

    const DICE = [['a 7', 'impossible', 'The dice only has 1 to 6.'], ['a number less than 7', 'certain', 'Every number on the dice is less than 7.'],
      ['an even number', 'even chance', '2, 4 and 6 are even: 3 out of 6.'], ['an odd number', 'even chance', '1, 3 and 5 are odd: 3 out of 6.'],
      ['a 6', 'unlikely', 'Only 1 out of 6 numbers is a 6.'], ['a number bigger than 1', 'likely', '2, 3, 4, 5 and 6 are bigger than 1: 5 out of 6.'],
      ['a number less than 3', 'unlikely', '1 and 2 are less than 3: 2 out of 6.'], ['a number bigger than 2', 'likely', '3, 4, 5 and 6 are bigger than 2: 4 out of 6.'],
      ['a number less than 4', 'even chance', '1, 2 and 3 are less than 4: 3 out of 6.'], ['a 0', 'impossible', 'There is no 0 on the dice.']];
    const diceQ = () => {
      const [ev, w, why] = pick(DICE);
      return choice(`You roll a normal dice numbered 1 to 6.\nHow likely is it that you roll **${ev}**?`, w, WORDS.filter(x => x !== w),
        ['List the numbers on the dice that would work. Compare with all 6 numbers.', SCALE],
        `${why} So it is ${w === 'even chance' ? 'an even chance' : w}.`, { nChoices: 5 });
    };

    const EVERY = [['A fair coin lands on heads.', 'even chance', 'A coin has 2 sides, heads and tails, which are equally likely.'],
      ['Tomorrow will come after today.', 'certain', 'This always happens.'], ['A cat will drive a bus to school.', 'impossible', 'Cats cannot drive!'],
      ['You will grow to be 10 metres tall.', 'impossible', 'No person can be that tall.'],
      ['You pick a blue sock from a drawer with 9 blue socks and 1 black sock.', 'likely', '9 out of 10 socks are blue: more than half.'],
      ['You pick a black sock from a drawer with 9 blue socks and 1 black sock.', 'unlikely', 'Only 1 out of 10 socks is black: less than half.'],
      ['A Monday is followed by a Tuesday.', 'certain', 'This always happens.']];
    const everyQ = () => {
      const [ev, w, why] = pick(EVERY);
      return choice(`How likely is this?\n"${ev}"`, w, WORDS.filter(x => x !== w),
        ['Think: could it ever happen? Will it always happen? Or is it somewhere in between?', SCALE],
        `${why} So it is ${w === 'even chance' ? 'an even chance' : w}.`, { nChoices: 5 });
    };

    const fracQ2 = () => {
      const [c1, c2] = U.sample(COLS, 2), a = R(1, 7), b = R(1, 8);
      if (a + b > 12 || a === b) return fracQ2();
      return fracQ(`A bag has ${a} ${c1} and ${b} ${c2} marbles.\nWhat fraction of the marbles are ${c1}?`, a, a + b,
        ['A fraction compares a part with the whole. Find the total number of marbles first.', `Total: ${a} + ${b} = ${a + b} marbles.`],
        `${a} out of ${a + b} marbles ${a === 1 ? 'is' : 'are'} ${c1}, so the fraction is ${fr(a, a + b)}.`,
        { visual: { type: 'bag', items: [{ color: c1, count: a }, { color: c2, count: b }] } });
    };

    const evenNumQ = () => {
      if (coin()) {
        const n = pick([4, 6, 8, 10, 12]);
        return num(`A spinner has ${n} equal sections.\nHow many sections must be red so that landing on red is an **even chance**?`, n / 2,
          ['An even chance means exactly half.', `Half of ${n} is ${n} ÷ 2.`],
          `Half of ${n} is ${n / 2}, so ${n / 2} sections must be red.`, { unit: 'sections' });
      }
      const b = R(2, 9), [c1, c2] = U.sample(COLS, 2);
      return num(`A bag has ${b} ${c1} marbles. You want an even chance of picking ${c2}.\nHow many ${c2} marbles must you add?`, b,
        ['An even chance means exactly half of the marbles are that colour.', `For an even chance, the ${c2} marbles must be the same number as the ${c1} marbles.`],
        `With ${b} ${c2} and ${b} ${c1}, half the marbles are ${c2}: an even chance.`, { unit: 'marbles' });
    };

    PMLM.registerSkill({
      id: 'g5.probability', grade: 5, unit: 'g5.u5', title: 'Probability', icon: '🎲',
      blurb: 'Describe and compare how likely things are',
      lesson: [
        { title: 'How likely?',
          text: 'We use these words to describe chance:',
          visual: { type: 'table', headers: ['Word', 'Meaning'], rows: WORDS.map(w => [`**${w}**`, MEAN[w]]) } },
        { title: 'Equally likely',
          text: 'This spinner has 4 equal sections, one of each colour.\nEach colour has the same chance, so they are **equally likely**.',
          visual: { type: 'spinner', sectors: [{ color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' }] } },
        { title: 'Count to compare',
          text: 'This bag has 3 red marbles and 1 blue marble.\nRed is **more likely** than blue: 3 out of 4 marbles are red.\nPicking red is **likely**. Picking blue is **unlikely**.',
          visual: { type: 'bag', items: [{ color: 'red', count: 3 }, { color: 'blue', count: 1 }] } },
        { title: 'Half-way: even chance',
          text: 'If exactly half the outcomes work, it is an **even chance**.\nA coin landing on heads: 1 out of 2.\nAn even number on a dice: 2, 4, 6 → 3 out of 6.' },
        { title: 'Worked example',
          text: 'A spinner has 8 equal sections: 5 blue, 2 red, 1 yellow. How likely is landing on green?\n**1.** Count the green sections: there are none.\n**2.** Something with no chance at all cannot happen.\nAnswer: **impossible**. (And blue, with 5 out of 8, is the most likely colour.)',
          visual: { type: 'spinner', sectors: [{ color: 'blue' }, { color: 'red' }, { color: 'blue' }, { color: 'yellow' }, { color: 'blue' }, { color: 'red' }, { color: 'blue' }, { color: 'blue' }] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [bagQ, bagQ, spinnerQ, diceQ, everyQ],
          [bagQ, spinnerQ, equalQ, diceQ, everyQ, fracQ2],
          [bagQ, spinnerQ, equalQ, diceQ, fracQ2, evenNumQ],
        ], ctx);
      },
    });
  }
})();
