// Play More Learn More — Cambridge Primary Stage 4 (Grade 4, age ~9).
// 5 units, 24 skills. See src/CONTRACT.md for the shapes used here.
(() => {
  // ───────────────────────── local helpers ─────────────────────────
  const M = U.MINUS;
  const F = x => U.fmt(x);                 // one argument only, so arr.map(F) is safe
  const R = U.rint;
  const pick = U.pick;
  const fr = U.frac;
  const coin = (p = 0.5) => Math.random() < p;
  const sum = arr => arr.reduce((s, v) => s + v, 0);
  const pad = n => (n < 10 ? '0' : '') + n;
  const retry = (fn, tries = 5000) => {
    for (let i = 0; i < tries; i++) { const r = fn(); if (r) return r; }
    throw new Error('generator could not find good numbers');
  };
  // pick a format function for this level and run it
  const byLevel = (level, sets, ctx) => pick(sets[Math.min(Math.max(level | 0, 1), sets.length) - 1])(level, ctx);

  const num = (q, answer, hints, explain, extra) =>
    Object.assign({ q, kind: 'number', answer: U.clean(answer), hints, explain }, extra || {});
  const choice = (q, answer, wrongs, hints, explain, extra, n = 4) => {
    const a = String(answer);
    const w = [...new Set(wrongs.map(String))].filter(x => x !== a && x !== '' && !/NaN|undefined|Infinity|null/.test(x));
    if (!w.length) throw new Error('no distractors for: ' + q);
    return Object.assign({ q, kind: 'choice', answer: a, choices: U.choices(a, w, n), hints, explain }, extra || {});
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
  const coordQ = (q, x, y, hints, explain, extra) =>
    Object.assign({ q, kind: 'coord', answer: [x, y], hints, explain }, extra || {});
  const cur = ctx => (ctx && ctx.currency) || '₼';
  const money = (c, x) => c + (Number.isInteger(U.clean(x)) ? U.fmt(x) : U.fmt(x, 2));
  const names = k => {
    const out = [];
    while (out.length < k) { const n = U.name(); if (!out.includes(n)) out.push(n); }
    return out;
  };
  // 'Count in 4s: 4, 8, …' listing only the multiples below p (so the list never shows p itself)
  const upTo = (t, p) => [t, 2 * t, 3 * t].filter(x => x < p).join(', ') + ', …';
  const listAnd = arr => (arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`);
  const dec1 = t => (t % 10 === 0 ? String(t / 10) : (t / 10).toFixed(1)); // tenths → '3.4'

  // place value
  const PLACES = ['ones', 'tens', 'hundreds', 'thousands'];
  const PLACE1 = ['one', 'ten', 'hundred', 'thousand'];
  const PV = [1, 10, 100, 1000];
  const digs = n => String(n).split('').map(Number);
  const distinctNum = len => +U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], len).join('');
  const digitAt = (n, place) => Math.floor(n / PV[place]) % 10;
  const pl = (d, place) => (d === 1 ? PLACE1[place] : PLACES[place]); // '1 ten', '3 tens'

  // ═══════════════════════ Unit 1: Number and place value ═══════════════════════
  PMLM.registerUnit({ id: 'g4.u1', grade: 4, name: 'Numbers to 10 000', icon: '🔢' });

  /* 1 ── Place value to 10 000, × and ÷ by 10 and 100 */
  {
    const valueOf = L => {
      const len = L === 1 ? 3 : 4;
      const n = distinctNum(len), ds = digs(n), i = R(0, len - 2), d = ds[i], place = len - 1 - i, val = d * PV[place];
      const q = `What is the value of the **${d}** in ${n}?`;
      const hints = ['Find the column the digit is in: thousands, hundreds, tens or ones.',
        `Read the columns from the right: ones, tens, hundreds${len === 4 ? ', thousands' : ''}. The ${d} is in the ${PLACES[place]} column.`];
      const explain = `The ${d} is in the ${PLACES[place]} column, so it is worth ${d} ${d === 1 ? PLACE1[place] : PLACES[place]}. That is ${F(val)}.`;
      if (L === 1) return choice(q, F(val), PV.slice(0, len).map(p => F(d * p)), hints, explain, { visual: { type: 'placeValue', value: String(n) } }, len);
      return num(q, val, hints, explain);
    };

    const digitIn = L => {
      const len = L === 1 ? 3 : 4;
      const n = distinctNum(len), ds = digs(n), place = R(1, len - 1), d = digitAt(n, place);
      return num(`Which digit is in the **${PLACES[place]}** place in ${n}?`, d,
        ['Name the places from the right: ones, tens, hundreds, thousands.',
          `The last digit, ${ds[len - 1]}, is in the ones place. Now move left one place at a time.`],
        `${n} has ${ds.map((x, k) => `${x} ${pl(x, len - 1 - k)}`).join(', ')}. The ${PLACES[place]} digit is ${d}.`);
    };

    const partition = L => {
      if (L === 3 && coin()) {
        const n = distinctNum(4), ds = digs(n), k = R(0, 3);
        const parts = ds.map((d, i) => d * PV[3 - i]);
        return num(`Find the missing number.\n${n} = ${parts.map((p, i) => (i === k ? '□' : F(p))).join(' + ')}`, parts[k],
          ['Split the number into thousands, hundreds, tens and ones.',
            `The missing part is the ${PLACES[3 - k]} part. The ${PLACES[3 - k]} digit of ${n} is ${ds[k]}.`],
          `${n} = ${parts.map(F).join(' + ')}, so the missing number is ${F(parts[k])}.`);
      }
      const ds = [R(1, 9), R(1, 9), R(1, 9), R(1, 9)];
      let zero = -1;
      if (L >= 2) { zero = pick([1, 2, 3]); ds[zero] = 0; }
      const n = +ds.join('');
      let parts = ds.map((d, i) => d * PV[3 - i]).filter(p => p > 0);
      if (L === 3) parts = U.shuffle(parts);
      const zp = 3 - zero;
      return num(`Write this as one number.\n${parts.map(F).join(' + ')}`, n,
        ['Put each part in its own column: thousands, hundreds, tens and ones.',
          zero >= 0 ? `There are no ${PLACES[zp]}, so the ${PLACES[zp]} digit is 0.`
            : `${F(ds[0] * 1000)} gives ${ds[0]} in the thousands column and ${F(ds[1] * 100)} gives ${ds[1]} in the hundreds column.`],
        `${ds.map((x, k) => `${x} ${pl(x, 3 - k)}`).join(', ')} make ${n}.`);
    };

    const times10 = L => {
      const ops = L === 1 ? ['x10', 'x100'] : L === 2 ? ['x10', 'x100', 'd10', 'd100'] : ['m10', 'm100', 'mdiv', 'mmul', 'x100', 'd100'];
      const op = pick(ops);
      if (op === 'x10') {
        const a = L === 1 ? R(11, 99) : R(101, 999);
        return num(`Work out ${a} × 10`, a * 10,
          ['When you multiply by 10, every digit moves 1 place to the left.',
            `The ones digit ${a % 10} moves to the tens place. Put a 0 in the empty ones place.`],
          `Each digit moves one place left: ${a} × 10 = ${F(a * 10)}.`);
      }
      if (op === 'x100') {
        const a = L === 1 ? pick([R(2, 9), R(11, 99)]) : R(11, 99);
        return num(`Work out ${a} × 100`, a * 100,
          ['When you multiply by 100, every digit moves 2 places to the left.',
            `The ones digit ${a % 10} moves to the hundreds place. Put 0s in the empty tens and ones places.`],
          `Each digit moves two places left: ${a} × 100 = ${F(a * 100)}.`);
      }
      if (op === 'd10') {
        const a = R(11, 999), n = a * 10;
        return num(`Work out ${F(n)} ÷ 10`, a,
          ['When you divide by 10, every digit moves 1 place to the right.',
            `The tens digit of ${F(n)} is ${digitAt(n, 1)}. It moves into the ones place.`],
          `Each digit moves one place right: ${F(n)} ÷ 10 = ${a}.`);
      }
      if (op === 'd100') {
        const a = R(2, 99), n = a * 100;
        return num(`Work out ${F(n)} ÷ 100`, a,
          ['When you divide by 100, every digit moves 2 places to the right.',
            `The hundreds digit of ${F(n)} is ${digitAt(n, 2)}. It moves into the ones place.`],
          `Each digit moves two places right: ${F(n)} ÷ 100 = ${a}.`);
      }
      if (op === 'm10') {
        const a = R(101, 999);
        return num(`Find the missing number.\n□ × 10 = ${F(a * 10)}`, a,
          ['Use the inverse: to undo × 10, divide by 10.',
            `□ = ${F(a * 10)} ÷ 10. Move each digit one place to the right.`],
          `${F(a * 10)} ÷ 10 = ${a}. Check: ${a} × 10 = ${F(a * 10)}.`);
      }
      if (op === 'm100') {
        const a = R(11, 99);
        return num(`Find the missing number.\n□ × 100 = ${F(a * 100)}`, a,
          ['Use the inverse: to undo × 100, divide by 100.',
            `□ = ${F(a * 100)} ÷ 100. Move each digit two places to the right.`],
          `${F(a * 100)} ÷ 100 = ${a}. Check: ${a} × 100 = ${F(a * 100)}.`);
      }
      if (op === 'mdiv') {
        const big = coin(), a = big ? R(11, 99) : R(101, 999), k = big ? 100 : 10, n = a * k;
        return num(`Find the missing number.\n${F(n)} ÷ □ = ${a}`, k,
          ['Compare the two numbers. How many places have the digits moved?',
            `Look at the ${big ? 'hundreds' : 'tens'} digit of ${F(n)}: it has become the ones digit of ${a}.`],
          `The digits moved ${big ? 'two places' : 'one place'} to the right, so ${F(n)} ÷ ${k} = ${a}.`);
      }
      const a = R(101, 999);
      return num(`Find the missing number.\n□ ÷ 10 = ${a}`, a * 10,
        ['Use the inverse: to undo ÷ 10, multiply by 10.',
          `□ = ${a} × 10. Move each digit one place to the left.`],
        `${a} × 10 = ${F(a * 10)}. Check: ${F(a * 10)} ÷ 10 = ${a}.`);
    };

    const moreLess = L => {
      return retry(() => {
        const more = coin();
        if (L === 3) {
          const step = pick([10, 100]), p = step === 10 ? 1 : 2;
          const ds = [R(2, 8), R(0, 9), R(0, 9), R(0, 9)];
          ds[3 - p] = more ? 9 : 0;
          const n = +ds.join(''), ans = more ? n + step : n - step;
          if (ans < 1000 || ans > 9999) return null;
          return num(`What is ${step} ${more ? 'more' : 'less'} than ${n}?`, ans,
            more ? [`Adding ${step} changes the ${PLACES[p]} digit, but it is already 9.`,
              `9 ${PLACES[p]} and 1 more make 10 ${PLACES[p]}, which is 1 ${PLACE1[p + 1]}. So the ${PLACES[p]} digit becomes 0 and the next digit to the left goes up by 1.`]
              : [`Taking away ${step} changes the ${PLACES[p]} digit, but there are 0 ${PLACES[p]}.`,
                `Exchange first: take 1 from the next place to the left that is not 0, then count back ${step}.`],
            `${n} ${more ? '+' : M} ${step} = ${ans}.`);
        }
        const len = L === 1 ? 3 : 4;
        const steps = L === 1 ? [10, 100] : [10, 100, 1000];
        const step = pick(steps), p = PV.indexOf(step);
        const n = len === 3 ? R(101, 989) : R(1001, 9989), d = digitAt(n, p);
        if (more ? d === 9 : d === 0) return null;
        if (!more && p === len - 1 && d === 1) return null;
        const ans = more ? n + step : n - step;
        if (String(ans).length !== len) return null;
        return num(`What is ${F(step)} ${more ? 'more' : 'less'} than ${n}?`, ans,
          [`Only one digit changes: the ${PLACES[p]} digit.`,
            `The ${PLACES[p]} digit of ${n} is ${d}. It goes ${more ? 'up' : 'down'} by 1.`],
          `${n} ${more ? '+' : M} ${F(step)} = ${ans}.`);
      });
    };

    const spot = () => {
      const who = U.name();
      if (coin()) {
        const a = R(11, 99), wrong = a * 10, right = a * 100;
        return num(`${who} says ${a} × 100 = ${F(wrong)}.\nWhat is the correct answer?`, right,
          ['Multiplying by 100 moves every digit 2 places to the left.',
            `${who} only moved the digits 1 place. That is × 10, not × 100.`],
          `${a} × 100 = ${F(right)}. Each digit moves two places left, and two 0s fill the empty places.`);
      }
      const th = R(1, 9), t = R(1, 9), n = th * 1000 + t * 10, wrong = th * 10 + t;
      return num(`${who} says ${n} ÷ 10 = ${wrong}.\nWhat is the correct answer?`, n / 10,
        ['Dividing by 10 moves every digit 1 place to the right. Only the 0 in the ones place drops off.',
          `${who} took away every 0. The 0 in the hundreds place must stay, to keep the other digits in their places.`],
        `${n} ÷ 10 = ${n / 10}. Each digit moves one place to the right.`);
    };

    PMLM.registerSkill({
      id: 'g4.placeValue', grade: 4, unit: 'g4.u1', title: 'Place value to 10 000', icon: '🧱',
      blurb: 'Thousands, hundreds, tens and ones; × and ÷ by 10, 100',
      lesson: [
        { title: 'Four places',
          text: 'In a 4-digit number each digit has a place: **thousands**, **hundreds**, **tens** and **ones**.\n3528 has 3 thousands, 5 hundreds, 2 tens and 8 ones.',
          visual: { type: 'placeValue', value: '3528' } },
        { title: 'What is a digit worth?',
          text: 'The place tells you what a digit is worth.\nIn 3528 the **5** is in the hundreds place, so it is worth **500**.\n3528 = 3000 + 500 + 20 + 8',
          visual: { type: 'placeValue', value: '3528', highlight: 1 } },
        { title: '× 10 and × 100',
          text: '**× 10:** every digit moves 1 place to the left. 46 × 10 = 460\n**× 100:** every digit moves 2 places to the left. 46 × 100 = 4600\nPut 0s in the empty places on the right.' },
        { title: '÷ 10 and ÷ 100',
          text: '**÷ 10:** every digit moves 1 place to the right. 3700 ÷ 10 = 370\n**÷ 100:** every digit moves 2 places to the right. 3700 ÷ 100 = 37\n**Tip:** never take away a 0 from the middle of a number. 4050 ÷ 10 = 405' },
        { title: 'Worked example',
          text: 'Work out 58 × 100.\n**1.** 58 is 5 tens and 8 ones.\n**2.** × 100 moves each digit 2 places left: 5 thousands and 8 hundreds.\n**3.** Put 0s in the tens and ones places.\nAnswer: **5800**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [valueOf, valueOf, digitIn, partition, times10, moreLess],
          [valueOf, partition, partition, times10, times10, moreLess, spot],
          [partition, partition, times10, times10, moreLess, moreLess, spot, valueOf],
        ], ctx);
      },
    });
  }

  /* 2 ── Rounding to the nearest 10, 100, 1000 */
  {
    const rnd = (n, p) => Math.round(n / p) * p;
    const PL = { 10: 'tens', 100: 'hundreds', 1000: 'thousands' };
    const LOOK = { 10: 'ones', 100: 'tens', 1000: 'hundreds' };
    const look = (n, p) => Math.floor(n / (p / 10)) % 10;
    const rule = (n, p) => {
      const d = look(n, p);
      return d >= 5 ? `The ${LOOK[p]} digit is ${d}. That is 5 or more, so round up.`
        : `The ${LOOK[p]} digit is ${d}. That is less than 5, so round down.`;
    };
    const line = (n, p) => {
      const lo = Math.floor(n / p) * p;
      return { type: 'numberLine', min: lo, max: lo + p, step: p / 10, labelEvery: String(lo + p).length >= 4 ? 5 : 1, points: [{ at: n, label: F(n) }] };
    };
    const hintsFor = (n, p) => {
      const lo = Math.floor(n / p) * p;
      return [`Find the two ${PL[p]} that ${F(n)} is between. Which one is it nearer to?`,
        `${F(n)} is between ${F(lo)} and ${F(lo + p)}. Halfway is ${F(lo + p / 2)}. Look at the ${LOOK[p]} digit.`];
    };
    const roundQ = (q, n, p, extra) => num(q, rnd(n, p), hintsFor(n, p), `${rule(n, p)} ${F(n)} rounds to ${F(rnd(n, p))}.`, extra);

    const basic = L => retry(() => {
      let n, p;
      if (L === 1) { p = 10; n = coin() ? R(12, 98) : R(101, 999); }
      else if (L === 2) { p = pick([10, 100]); n = p === 10 ? R(101, 9999) : R(101, 9999); }
      else {
        p = pick([10, 100, 1000]);
        n = R(1001, 9899);
        if (coin(0.6)) { // a "tricky" one where the next digit up changes too
          if (p === 10) n = Math.floor(n / 100) * 100 + 90 + R(5, 9);
          if (p === 100) n = Math.floor(n / 1000) * 1000 + 900 + R(50, 99);
          if (p === 1000) n = Math.floor(n / 1000) * 1000 + R(450, 549);
        }
      }
      if (n % p === 0) return null;
      const viz = L === 1 || (L === 2 && coin()) ? { visual: line(n, p) } : undefined;
      return roundQ(`Round ${F(n)} to the nearest ${F(p)}.`, n, p, viz);
    });

    const which = L => retry(() => {
      const p = L === 2 ? 10 : pick([10, 100]);
      const target = p === 10 ? 10 * R(3, 99) : 100 * R(2, 99);
      const ans = target + R(-p / 2, p / 2 - 1);
      if (ans === target) return null;
      const wrongs = [target - p / 2 - R(1, p === 10 ? 3 : 20), target + p / 2 + R(0, p === 10 ? 3 : 20), target + p + R(1, p / 2 - 1), target - p - R(1, p / 2 - 1)];
      if (wrongs.some(w => rnd(w, p) === target || w <= 0)) return null;
      return choice(`Which number rounds to ${F(target)} to the nearest ${p}?`, F(ans), wrongs.map(F),
        [`A number rounds to ${F(target)} if it is nearer to ${F(target)} than to ${F(target - p)} or ${F(target + p)}.`,
          `Halfway numbers round up: ${F(target - p / 2)} rounds up to ${F(target)}, but ${F(target + p / 2)} rounds up to ${F(target + p)}.`],
        `All the numbers from ${F(target - p / 2)} to ${F(target + p / 2 - 1)} round to ${F(target)}. ${F(ans)} is one of them.`);
    });

    const limits = () => {
      const p = pick([10, 100]);
      const target = p === 10 ? 10 * R(3, 99) : 100 * R(2, 49);
      if (coin()) {
        return num(`What is the **smallest** whole number that rounds to ${F(target)} to the nearest ${p}?`, target - p / 2,
          ['Think about the halfway number. A number exactly halfway rounds up.',
            `Halfway between ${F(target - p)} and ${F(target)} is ${F(target - p / 2)}. Does it round up or down?`],
          `${F(target - p / 2)} is exactly halfway, so it rounds up to ${F(target)}. Anything smaller rounds down to ${F(target - p)}. The answer is ${F(target - p / 2)}.`);
      }
      return num(`What is the **largest** whole number that rounds to ${F(target)} to the nearest ${p}?`, target + p / 2 - 1,
        ['Think about the halfway number. A number exactly halfway rounds up.',
          `Halfway between ${F(target)} and ${F(target + p)} is ${F(target + p / 2)}, and that rounds up to ${F(target + p)}.`],
        `${F(target + p / 2)} rounds up to ${F(target + p)}, so the largest number that rounds to ${F(target)} is ${F(target + p / 2 - 1)}.`);
    };

    const spot = L => retry(() => {
      const p = L === 2 ? pick([10, 100]) : pick([100, 1000]);
      const n = R(1001, 9899), d = look(n, p);
      if (d < 5 || n % p === 0) return null;
      const wrong = Math.floor(n / p) * p, who = U.name();
      return num(`${who} rounded ${F(n)} to the nearest ${F(p)} and got ${F(wrong)}.\nWhat should the answer be?`, rnd(n, p),
        [`Look at the ${LOOK[p]} digit. If it is 5 or more, round up.`,
          `The ${LOOK[p]} digit of ${F(n)} is ${d}.`],
        `${rule(n, p)} ${F(n)} rounds to ${F(rnd(n, p))}, not ${F(wrong)}.`);
    });

    const word = L => retry(() => {
      const p = L === 1 ? 10 : L === 2 ? pick([10, 100]) : pick([100, 1000]);
      const n = L === 1 ? R(101, 999) : R(1001, 9899);
      if (n % p === 0) return null;
      const who = U.name();
      const t = pick([
        [`${F(n)} people watched a football match. Round this number to the nearest ${F(p)}.`, ''],
        [`A school library has ${F(n)} books. Round this number to the nearest ${F(p)}.`, ''],
        [`A car travelled ${F(n)} km. Round this distance to the nearest ${F(p)} km.`, 'km'],
        [`${who} walked ${F(n)} steps today. Round this number to the nearest ${F(p)}.`, ''],
      ]);
      return roundQ(t[0], n, p, t[1] ? { unit: t[1] } : undefined);
    });

    PMLM.registerSkill({
      id: 'g4.rounding', grade: 4, unit: 'g4.u1', title: 'Rounding', icon: '🎯',
      blurb: 'Round numbers to the nearest 10, 100 or 1000',
      lesson: [
        { title: 'Which is nearer?',
          text: '**Rounding** means finding the nearest 10 (or 100, or 1000).\n43 is between 40 and 50. It is nearer to 40.\nSo 43 rounded to the nearest 10 is **40**.',
          visual: { type: 'numberLine', min: 40, max: 50, step: 1, points: [{ at: 43, label: '43' }] } },
        { title: 'The halfway rule',
          text: 'A number exactly halfway, like 45, rounds **up**: 45 → 50.\nLook at the digit just after the place you are rounding to:\n0, 1, 2, 3, 4 → round **down**\n5, 6, 7, 8, 9 → round **up**',
          visual: { type: 'numberLine', min: 40, max: 50, step: 1, points: [{ at: 45, label: '45' }] } },
        { title: 'Rounding to 100 and 1000',
          text: 'Round 3670 to the nearest **100**: look at the tens digit, 7. Round up → **3700**.\nRound 3670 to the nearest **1000**: look at the hundreds digit, 6. Round up → **4000**.',
          visual: { type: 'numberLine', min: 3000, max: 4000, step: 100, labelEvery: 5, points: [{ at: 3670, label: '3670' }] } },
        { title: 'Worked example',
          text: 'Round 6249 to the nearest 100.\n**1.** 6249 is between 6200 and 6300.\n**2.** Look at the tens digit: it is 4.\n**3.** 4 is less than 5, so round down.\nAnswer: **6200**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [basic, basic, basic, word],
          [basic, basic, which, spot, word],
          [basic, basic, which, limits, spot, word],
        ], ctx);
      },
    });
  }

  /* 3 ── Negative numbers in context */
  {
    const deg = t => `${F(t)} °C`;
    const degs = n => `${n} degree${n === 1 ? '' : 's'}`;
    const read = L => {
      if (L === 1) {
        const k = R(3, 7), min = -k, max = 10 - k;
        const v = coin(0.75) ? R(min + 1, -1) : R(1, max - 1);
        return num('What temperature does the thermometer show?', v,
          ['Find 0 on the scale. Temperatures below 0 are negative numbers.',
            v < 0 ? 'The red line stops below 0. Count the marks down from 0.' : 'The red line stops above 0. Count the marks up from 0.'],
          `The red line stops at ${deg(v)}.`, { unit: '°C', visual: { type: 'thermometer', value: v, min, max } });
      }
      const v = coin(0.75) ? -2 * R(1, 4) : 2 * R(1, 4);
      return num('What temperature does the thermometer show?', v,
        ['Find 0 on the scale. Temperatures below 0 are negative numbers.',
          `Each mark on this scale is 2 degrees. The red line stops ${v < 0 ? 'below' : 'above'} 0.`],
        `The red line stops at ${deg(v)}.`, { unit: '°C', visual: { type: 'thermometer', value: v, min: -10, max: 10 } });
    };

    const lineQ = L => retry(() => {
      const big = L === 3;
      const step = big ? 2 : 1, min = big ? -20 : -10, max = -min;
      const v = big ? -2 * R(1, 9) : coin(0.8) ? -R(1, 9) : R(1, 9);
      if (v % (5 * step) === 0) return null;
      const ref = Math.round(v / (5 * step)) * (5 * step), steps = Math.abs(v - ref) / step;
      return num('What number is shown by the **?** on the number line?', v,
        [`Numbers to the left of 0 are negative. Each small step is worth ${step}.`,
          `The ? is ${steps} ${steps === 1 ? 'step' : 'steps'} to the ${v < ref ? 'left' : 'right'} of ${F(ref)}.`],
        `Count ${steps} ${steps === 1 ? 'step' : 'steps'} of ${step} from ${F(ref)}: the ? is at ${F(v)}.`,
        { visual: { type: 'numberLine', min, max, step, labelEvery: 5, points: [{ at: v, label: '?' }] } });
    });

    const change = L => retry(() => {
      let s, d, up;
      const kind = L === 1 ? pick(['fallCross', 'riseCross']) : pick(['fallCross', 'riseCross', 'fallNeg', 'riseNeg']);
      const big = L === 3 ? 2 : 1;
      if (kind === 'fallCross') { s = R(1, 5 * big); d = R(s + 1, s + 5 * big); up = false; }
      else if (kind === 'riseCross') { s = -R(1, 5 * big); d = R(-s + 1, -s + 5 * big); up = true; }
      else if (kind === 'fallNeg') { s = -R(1, 6 * big); d = R(3, 5 * big); up = false; }
      else { s = -R(5, 7 * big + 2); d = R(3, -s - 1); up = true; }
      const e = up ? s + d : s - d;
      if (e === 0 || (kind === 'riseNeg' && e >= 0)) return null;
      let hints;
      if (kind === 'fallCross') hints = ['When it gets colder, count down. Use 0 as a stepping stone.', `From ${deg(s)} down to 0 °C is ${degs(s)}. How many more degrees do you still need to go down?`];
      else if (kind === 'riseCross') hints = ['When it gets warmer, count up. Use 0 as a stepping stone.', `From ${deg(s)} up to 0 °C is ${degs(-s)}. How many more degrees do you still need to go up?`];
      else if (kind === 'fallNeg') hints = [`When it gets colder, count down. Below 0 the numbers go ${M}1, ${M}2, ${M}3, …`, `Start at ${F(s)} and count down ${d}: ${F(s - 1)}, ${F(s - 2)}, …`];
      else hints = ['When it gets warmer, count up towards 0.', `Start at ${F(s)} and count up ${d}: ${F(s + 1)}, ${F(s + 2)}, …`];
      const lo = Math.min(s, e), hi = Math.max(s, e);
      const viz = L === 1 ? { visual: { type: 'thermometer', value: s, min: R(hi - 10, lo), max: 0 } } : {};
      if (viz.visual) viz.visual.max = viz.visual.min + 10;
      return num(`The temperature is ${deg(s)}. It ${up ? 'rises' : 'falls'} by ${d} degrees.\nWhat is the temperature now?`, e, hints,
        `${F(s)} ${up ? '+' : M} ${d} = ${F(e)}. The temperature is now ${deg(e)}.`, Object.assign({ unit: '°C' }, viz));
    });

    const diff = L => retry(() => {
      const both = L === 3 && coin();
      const lo = both ? -R(6, 15) : -R(1, L === 3 ? 12 : 9);
      const hi = both ? lo + R(2, -lo - 1) : R(1, L === 3 ? 15 : 10);
      if (hi >= 0 && both) return null;
      const dd = hi - lo, [t1, t2] = pick([['At 6 a.m.', 'at noon'], ['At night', 'in the afternoon'], ['In the morning', 'at lunchtime']]);
      return num(`${t1} the temperature was ${deg(lo)}. Later, ${t2}, it was ${deg(hi)}.\nBy how many degrees did the temperature rise?`, dd,
        both ? ['Count up from the lower temperature to the higher one.', `Start at ${F(lo)} and count up: ${F(lo + 1)}, ${F(lo + 2)}, … until you reach ${F(hi)}.`]
          : ['Count up from the lower temperature to the higher one. Use 0 as a stepping stone.', `From ${deg(lo)} up to 0 °C is ${degs(-lo)}.`],
        both ? `From ${F(lo)} up to ${F(hi)} is ${degs(dd)}.` : `${degs(-lo)} up to 0, then ${hi} more: ${-lo} + ${hi} = ${degs(dd)}.`,
        { unit: 'degrees' });
    });

    const colder = L => retry(() => {
      if (L === 1) {
        const a = -R(1, 9), b = coin() ? R(0, 9) : -R(1, 9);
        if (a === b) return null;
        const warm = coin(0.3), ans = warm ? Math.max(a, b) : Math.min(a, b);
        return choice(`Which temperature is ${warm ? 'warmer' : 'colder'}?`, deg(ans), [deg(a), deg(b)],
          ['Colder temperatures are lower on a thermometer, and further left on a number line.',
            (a < 0) === (b < 0) ? 'Both are below 0. The one further below 0 is colder.' : 'A temperature below 0 is colder than a temperature above 0.'],
          `${deg(Math.min(a, b))} is lower than ${deg(Math.max(a, b))}, so ${deg(ans)} is ${warm ? 'warmer' : 'colder'}.`, null, 2);
      }
      const ts = U.sample([-12, -9, -8, -7, -5, -4, -3, -2, -1, 0, 2, 3, 5, 6], 4);
      if (ts.filter(t => t < 0).length < 2) return null;
      const warm = coin(0.3), ans = warm ? Math.max(...ts) : Math.min(...ts);
      return choice(`Which is the ${warm ? 'warmest' : 'coldest'} temperature?`, deg(ans), ts.map(deg),
        ['Picture a number line. Colder is further left, warmer is further right.',
          `The negative temperatures are ${listAnd(ts.filter(t => t < 0).map(deg))}. The further below 0, the colder.`],
        `In order from coldest: ${ts.slice().sort((x, y) => x - y).map(deg).join(', ')}. The ${warm ? 'warmest' : 'coldest'} is ${deg(ans)}.`);
    });

    const order = () => retry(() => {
      const a = -R(5, 12), b = -R(1, 4), c = R(0, 4), d = R(5, 12);
      const right = [a, b, c, d], byAbs = right.slice().sort((x, y) => Math.abs(x) - Math.abs(y) || x - y);
      const w1 = [b, a, c, d], w3 = right.slice().reverse();
      const show = arr => arr.map(F).join(', ');
      if (show(byAbs) === show(right)) return null;
      return choice('Which list is in order from **coldest to warmest** (°C)?', show(right), [show(byAbs), show(w1), show(w3)],
        ['The coldest is the most negative number. The further below 0, the colder.',
          `Find the two negative numbers first. ${F(a)} is further below 0 than ${F(b)}.`],
        `From coldest to warmest: ${show(right)}.`);
    });

    const seq = L => retry(() => {
      const s = L === 2 ? pick([2, 5, 10]) : pick([3, 4, 5, 10]);
      const down = L === 2 || coin(0.6);
      const start = down ? s * R(1, 2) + R(1, s - 1 || 1) : -(s * R(2, 3) + R(1, s - 1 || 1));
      const terms = [0, 1, 2, 3, 4].map(i => (down ? start - i * s : start + i * s));
      if (down && !(terms[0] > 0 && terms[4] < 0)) return null;
      if (!down && !(terms[0] < 0 && terms[4] > 0)) return null;
      const k = L === 2 ? R(3, 4) : R(1, 4);
      if (terms[k] === 0) return null;
      const shown = terms.map((t, i) => (i === k ? '?' : F(t)));
      return num('Find the missing number in the sequence.', terms[k],
        ['Find the step: how much does the number change each time?',
          `Each number is ${s} ${down ? 'less' : 'more'} than the one before. Count ${down ? 'back' : 'on'} ${s} from ${F(terms[k - 1])}.`],
        `${F(terms[k - 1])} ${down ? M : '+'} ${s} = ${F(terms[k])}.`,
        { visual: { type: 'sequence', terms: shown, step: `${down ? M : '+'}${s}` } });
    });

    const spot = () => {
      const big = R(6, 12), small = R(1, big - 2), who = U.name();
      return choice(`${who} says ${deg(-big)} is warmer than ${deg(-small)}, because ${big} is bigger than ${small}.\nWhich temperature is really warmer?`,
        deg(-small), [deg(-big)],
        ['Below 0, the bigger the number after the minus sign, the colder it is.',
          `Picture a thermometer. Which one is further below 0: ${deg(-big)} or ${deg(-small)}? That one is colder.`],
        `${deg(-small)} is closer to 0, so it is warmer than ${deg(-big)}.`, null, 2);
    };

    PMLM.registerSkill({
      id: 'g4.negatives', grade: 4, unit: 'g4.u1', title: 'Negative numbers', icon: '🌡️',
      blurb: 'Read temperatures and count back past zero',
      lesson: [
        { title: 'Below zero',
          text: 'Numbers less than 0 are **negative**. We write them with a minus sign: −1, −2, −3.\nOn a thermometer, temperatures below 0 °C are negative. This one shows **−3 °C**.',
          visual: { type: 'thermometer', value: -3, min: -5, max: 5 } },
        { title: 'Use a number line',
          text: 'Negative numbers are to the **left** of 0.\nThe further left, the smaller (colder) the number.\n−7 is less than −2, because it is further from 0 on the left.',
          visual: { type: 'numberLine', min: -8, max: 4, step: 1, points: [{ at: -7, label: '−7' }, { at: -2, label: '−2' }] } },
        { title: 'Warmer and colder',
          text: 'Warmer → count **up** (right). Colder → count **down** (left).\nFrom −2 °C, a rise of 5 degrees: −2 → −1 → 0 → 1 → 2 → **3 °C**.\n**Tip:** stop at 0 on the way.',
          visual: { type: 'numberLine', min: -4, max: 4, step: 1, jumps: [{ from: -2, to: 0, label: '+2' }, { from: 0, to: 3, label: '+3' }] } },
        { title: 'Worked example',
          text: 'It is 4 °C. The temperature falls by 6 degrees. What is it now?\n**1.** Start at 4.\n**2.** Count down 4 to reach 0.\n**3.** Count down 2 more: −1, −2.\nAnswer: **−2 °C**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [read, read, lineQ, change, colder],
          [read, lineQ, change, change, diff, colder, seq],
          [lineQ, change, change, diff, order, seq, spot],
        ], ctx);
      },
    });
  }

  /* 4 ── Compare and order numbers, including tenths */
  {
    const firstDiff = (a, b) => { // place (3..0) where 4-digit (or shorter) numbers first differ
      for (let p = 3; p >= 0; p--) if (digitAt(a, p) !== digitAt(b, p)) return p;
      return -1;
    };
    const SIGNS = ['<', '>', '='];
    const signOf = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
    const meaning = s => (s === '<' ? '< means "is less than"' : s === '>' ? '> means "is greater than"' : '= means "is equal to"');

    const signQ = L => retry(() => {
      const len = L === 1 ? 3 : 4;
      const a = len === 3 ? R(101, 999) : R(1001, 9999);
      const keep = R(1, len - 1); // how many leading digits stay the same
      const da = digs(a), db = da.slice(0, keep);
      for (let i = keep; i < len; i++) db.push(R(0, 9));
      const b = +db.join('');
      if (b === a || String(b).length !== len) return null;
      const p = firstDiff(a, b), s = signOf(a, b);
      return choice(`Which sign goes in the box?\n${F(a)} □ ${F(b)}`, s, SIGNS,
        ['Compare the digits from the left. The first place where they are different decides.',
          `${F(a)} and ${F(b)} first differ in the ${PLACES[p]} place: ${digitAt(a, p)} and ${digitAt(b, p)}.`],
        `${digitAt(a, p)} ${pl(digitAt(a, p), p)} is ${s === '>' ? 'more' : 'less'} than ${digitAt(b, p)} ${pl(digitAt(b, p), p)}, so ${F(a)} ${s} ${F(b)}. (${meaning(s)})`, null, 3);
    });

    const eqSign = L => retry(() => {
      const ds = U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4), n = +ds.join('');
      const same = coin(0.45);
      const md = same ? ds.slice() : ds.slice();
      if (!same) { const [i, j] = pick([[1, 2], [2, 3], [1, 3]]); [md[i], md[j]] = [md[j], md[i]]; }
      const m = +md.join('');
      let parts = md.map((d, i) => d * PV[3 - i]);
      if (L === 3 || coin()) parts = U.shuffle(parts);
      const left = parts.map(F).join(' + '), s = signOf(m, n);
      return choice(`Which sign goes in the box?\n${left} □ ${F(n)}`, s, SIGNS,
        ['Work out the number on the left first, then compare.',
          `Put each part on the left in its own column. The thousands part is ${F(md[0] * 1000)}.`],
        `${left} = ${F(m)}. ${F(m)} ${s} ${F(n)}.`, null, 3);
    });

    const biggest = L => {
      const len = L === 1 ? 3 : 4, ds = U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], len);
      const perms = new Set();
      while (perms.size < 4) perms.add(+U.shuffle(ds).join(''));
      const list = [...perms], big = coin(0.6), ans = big ? Math.max(...list) : Math.min(...list);
      return choice(`Which number is the **${big ? 'biggest' : 'smallest'}**?`, F(ans), list.map(F),
        [`Compare the first digits (the ${len === 4 ? 'thousands' : 'hundreds'}) first. If they are the same, compare the next digits.`,
          `The first digits are ${list.map(x => digs(x)[0]).join(', ')}.`],
        `${F(ans)} is the ${big ? 'biggest' : 'smallest'}. In order: ${list.slice().sort((x, y) => x - y).map(F).join(', ')}.`);
    };

    const decSign = () => retry(() => {
      const a = R(1, 99);
      const t = pick(['sameOnes', 'diffOnes', 'swap', 'whole']);
      let b;
      if (t === 'sameOnes') b = Math.floor(a / 10) * 10 + R(1, 9);
      else if (t === 'diffOnes') b = R(1, 99);
      else if (t === 'swap') b = (a % 10) * 10 + Math.floor(a / 10);
      else b = 10 * R(1, 9);
      if (a % 10 === 0 || b === a || b < 1) return null;
      const s = signOf(a, b), oa = Math.floor(a / 10), ob = Math.floor(b / 10);
      return choice(`Which sign goes in the box?\n${dec1(a)} □ ${dec1(b)}`, s, SIGNS,
        ['Compare the whole number part (before the point) first. If that is the same, compare the tenths.',
          oa === ob ? `Both numbers have ${oa} ones. Now compare the tenths: ${a % 10} and ${b % 10}.` : `Compare the whole number parts: ${oa} and ${ob}.`],
        `${dec1(a)} ${s} ${dec1(b)}. (${meaning(s)})`, null, 3);
    });

    const between = () => retry(() => {
      const lo = R(5, 85), hi = lo + R(3, 8), ans = R(lo + 1, hi - 1);
      const wrongs = [lo - R(1, 3), hi + R(1, 3), (ans % 10) * 10 + Math.floor(ans / 10), hi + 10];
      if (wrongs.some(w => w >= lo && w <= hi) || wrongs.some(w => w <= 0) || ans % 10 === 0) return null;
      return choice(`Which number is between ${dec1(lo)} and ${dec1(hi)}?`, dec1(ans), wrongs.map(dec1),
        ['A number between them is bigger than the first number and smaller than the second.',
          `It must be more than ${dec1(lo)} and less than ${dec1(hi)}. Check the whole number part of each choice first.`],
        `${dec1(lo)} < ${dec1(ans)} < ${dec1(hi)}, so ${dec1(ans)} is between them.`);
    });

    const orderList = () => retry(() => {
      let vals, show, firstTip;
      if (coin()) {
        const th = R(2, 8);
        vals = U.sample(U.range(0, 999), 4).map(x => th * 1000 + x);
        show = v => F(v);
        firstTip = 'They all have the same thousands digit, so compare the hundreds, then the tens.';
      } else {
        vals = U.sample(U.range(11, 69).filter(x => x % 10), 4);
        show = dec1;
        firstTip = 'Compare the whole number part of each number first, then the tenths.';
      }
      const asc = vals.slice().sort((x, y) => x - y);
      const byLast = vals.slice().sort((x, y) => (x % 10) - (y % 10) || x - y);
      const swap = asc.slice(); [swap[1], swap[2]] = [swap[2], swap[1]];
      const desc = asc.slice().reverse();
      const S = arr => arr.map(show).join(', ');
      if (S(byLast) === S(asc)) return null;
      return choice('Which list is in order from **smallest to largest**?', S(asc), [S(byLast), S(swap), S(desc)],
        ['Find the smallest number first, then the next smallest, and so on.', firstTip],
        `In order from smallest: ${S(asc)}.`);
    });

    const missingDigit = () => retry(() => {
      const less = coin();
      const b = R(1200, 9800), th = digitAt(b, 3);
      const t = R(0, 9), o = R(0, 9);
      const val = d => th * 1000 + d * 100 + t * 10 + o;
      const ok = d => (less ? val(d) < b : val(d) > b);
      const good = U.range(0, 9).filter(ok);
      if (!good.length) return null;
      const ans = less ? Math.max(...good) : Math.min(...good);
      if (ans < 1 || ans > 8) return null;
      const shown = `${th}□${t}${o}`;
      return num(`What is the **${less ? 'biggest' : 'smallest'}** digit that can go in the box?\n${shown} ${less ? '<' : '>'} ${F(b)}`, ans,
        ['Try different digits in the box. Compare the two numbers from the left each time.',
          `The thousands digits are both ${th}. If the box were ${digitAt(b, 2)}, the hundreds would match too, and you would compare the tens: ${t} and ${digitAt(b, 1)}.`],
        `${F(val(ans))} ${less ? '<' : '>'} ${F(b)}, but ${F(val(less ? ans + 1 : ans - 1))} is not. So the answer is ${ans}.`);
    });

    const wordQ = () => retry(() => {
      const who = names(3);
      if (coin()) {
        const v = U.sample(U.range(12, 39).filter(x => x % 10), 3), far = coin(0.6), ans = far ? Math.max(...v) : Math.min(...v);
        const i = v.indexOf(ans);
        return choice(`Who jumped the ${far ? 'furthest' : 'shortest distance'}?`, who[i], who,
          ['Compare the whole metres first, then the tenths.', `Look at the whole metres: ${v.map(x => Math.floor(x / 10)).join(', ')}.`],
          `In order: ${v.map((x, k) => [x, who[k]]).sort((p, q) => p[0] - q[0]).map(p => `${p[1]} ${dec1(p[0])} m`).join(', ')}. ${who[i]} jumped the ${far ? 'furthest' : 'shortest distance'}.`,
          { visual: { type: 'table', headers: ['Name', 'Long jump (m)'], rows: who.map((n, k) => [n, dec1(v[k])]) } }, 3);
      }
      const th = R(2, 8), v = U.sample(U.range(0, 999), 3).map(x => th * 1000 + x), most = coin(0.6), ans = most ? Math.max(...v) : Math.min(...v);
      const i = v.indexOf(ans);
      return choice(`Three children played a computer game. Who scored the ${most ? 'most' : 'fewest'} points?`, who[i], who,
        ['Compare the digits from the left.', `All the scores have ${th} thousands, so compare the hundreds.`],
        `In order: ${v.slice().sort((x, y) => x - y).map(F).join(', ')}. ${who[i]} scored the ${most ? 'most' : 'fewest'} points.`,
        { visual: { type: 'table', headers: ['Name', 'Points'], rows: who.map((n, k) => [n, F(v[k])]) } }, 3);
    });

    PMLM.registerSkill({
      id: 'g4.compare', grade: 4, unit: 'g4.u1', title: 'Compare and order', icon: '⚖️',
      blurb: 'Use <, > and = and order numbers, including tenths',
      lesson: [
        { title: '< and >',
          text: '**<** means "is less than". **>** means "is greater than".\nThe open side of the sign faces the **bigger** number.\n3405 > 3099 and 2.5 < 2.8' },
        { title: 'Compare digit by digit',
          text: 'Line up the places and start at the **left**.\nThe thousands are the same. The hundreds are the same. The tens are different: 2 < 7.\nSo 4528 < 4571.',
          visual: { type: 'table', headers: ['', 'Th', 'H', 'T', 'O'], rows: [['4528', '4', '5', '**2**', '8'], ['4571', '4', '5', '**7**', '1']] } },
        { title: 'Tenths',
          text: 'The digit after the point shows **tenths**: 1 whole split into 10 parts.\n3.4 means 3 ones and 4 tenths.\nTo compare 3.4 and 3.7: the ones are the same, then 4 tenths < 7 tenths. So 3.4 < 3.7.',
          visual: { type: 'numberLine', min: 3, max: 4, step: 0.1, labelEvery: 5, points: [{ at: 3.4, label: '3.4' }, { at: 3.7, label: '3.7' }] } },
        { title: 'Ordering',
          text: 'To put numbers in order, find the smallest first, then the next smallest, and so on.\n**Tip:** compare the biggest place first (thousands, or the whole number part).' },
        { title: 'Worked example',
          text: 'Order 2.6, 3.1 and 2.9 from smallest to largest.\n**1.** Look at the ones: 2, 3, 2. So 3.1 is the largest.\n**2.** Compare 2.6 and 2.9: 6 tenths < 9 tenths.\n**3.** Write them in order.\nAnswer: **2.6, 2.9, 3.1**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [signQ, signQ, biggest, biggest],
          [signQ, eqSign, biggest, decSign, decSign, between, wordQ],
          [signQ, eqSign, decSign, between, orderList, orderList, missingDigit, wordQ],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 2: Calculation ═══════════════════════
  PMLM.registerUnit({ id: 'g4.u2', grade: 4, name: 'Calculation', icon: '➕' });

  // column helpers
  const colTable = (a, b, op) => {
    const len = Math.max(String(a).length, String(b).length);
    const heads = ['Th', 'H', 'T', 'O'].slice(4 - len);
    const row = (n, sym) => [sym, ...String(n).padStart(len, ' ').split('').map(c => (c === ' ' ? '' : c))];
    return { type: 'table', headers: ['', ...heads], rows: [row(a, ''), row(b, op)] };
  };
  const nDigits = (a, b) => Math.max(String(a).length, String(b).length);
  const addNoCarry = (a, b) => {
    let r = 0;
    for (let p = 0; p < nDigits(a, b); p++) r += ((digitAt(a, p) + digitAt(b, p)) % 10) * PV[p];
    return r;
  };
  const subSmallFromBig = (a, b) => {
    let r = 0;
    for (let p = 0; p < nDigits(a, b); p++) r += Math.abs(digitAt(a, p) - digitAt(b, p)) * PV[p];
    return r;
  };
  const carryCount = (a, b) => {
    let c = 0, n = 0;
    for (let p = 0; p < 4; p++) { c = digitAt(a, p) + digitAt(b, p) + c >= 10 ? 1 : 0; n += c; }
    return n;
  };
  const exchangeCount = (a, b) => {
    let br = 0, n = 0;
    for (let p = 0; p < 4; p++) { br = digitAt(a, p) - br < digitAt(b, p) ? 1 : 0; n += br; }
    return n;
  };
  const onesAddStep = (a, b) => {
    const s = (a % 10) + (b % 10);
    return `Ones: ${a % 10} + ${b % 10} = ${s}${s >= 10 ? `. Write ${s % 10} and carry 1 to the tens.` : '.'}`;
  };
  const onesSubStep = (a, b) => {
    const ao = a % 10, bo = b % 10;
    if (ao >= bo) return `Ones: ${ao} − ${bo} = ${ao - bo}.`;
    if (digitAt(a, 1) > 0) return `Ones: ${ao} is smaller than ${bo}, so exchange 1 ten for 10 ones: ${ao + 10} − ${bo} = ${ao + 10 - bo}. The tens digit goes down by 1.`;
    return `Ones: ${ao} is smaller than ${bo}, and there are no tens to exchange. Exchange from the next place that is not 0 first, then 1 ten for 10 ones: ${ao + 10} − ${bo} = ${ao + 10 - bo}.`;
  };

  /* 5 ── Column addition and subtraction */
  {
    const addQ = L => {
      const [a, b] = retry(() => {
        let x, y;
        if (L === 1) { x = R(100, 899); y = R(100, 899); if (x + y > 999) return null; }
        else if (L === 2) { x = R(1000, 8999); y = coin() ? R(100, 999) : R(1000, 8999); if (x + y > 9999) return null; }
        else { x = R(1000, 8999); y = R(1000, 8999); if (x + y > 9999 || carryCount(x, y) < 2) return null; }
        return carryCount(x, y) >= 1 ? [x, y] : null;
      });
      return num(`Work out ${F(a)} + ${F(b)}`, a + b,
        ['Line up the columns. Start with the ones, and carry 1 when a column makes 10 or more.', `${onesAddStep(a, b)} Now add the tens.`],
        `Add each column, starting with the ones and carrying when needed: ${F(a)} + ${F(b)} = ${F(a + b)}.`,
        L < 3 ? { visual: colTable(a, b, '+') } : undefined);
    };

    const subQ = L => {
      const [a, b] = retry(() => {
        let x, y;
        if (L === 1) { x = R(300, 999); y = R(100, x - 100); if (digs(x).includes(0)) return null; }
        else if (L === 2) { x = R(2000, 9999); y = coin() ? R(100, 999) : R(1000, x - 500); if (digs(x).includes(0)) return null; }
        else {
          const th = R(3, 9);
          x = pick([th * 1000, th * 1000 + R(1, 9), th * 1000 + 10 * R(1, 9), th * 1000 + 100 * R(1, 9) + R(1, 9)]);
          y = R(1000, x - 300);
        }
        if (y <= 0 || y >= x) return null;
        return exchangeCount(x, y) >= 1 ? [x, y] : null;
      });
      return num(`Work out ${F(a)} − ${F(b)}`, a - b,
        ['Line up the columns and start with the ones. If the top digit is smaller, exchange 1 from the next column.', `${onesSubStep(a, b)} Now do the tens.`],
        `${F(a)} − ${F(b)} = ${F(a - b)}. Check: ${F(a - b)} + ${F(b)} = ${F(a)}.`,
        L < 3 ? { visual: colTable(a, b, '−') } : undefined);
    };

    const spot = L => {
      const who = U.name();
      if (coin()) {
        const [a, b] = retry(() => {
          const x = R(1000, 7999), y = L === 2 ? R(100, 999) : R(1000, 8999 - x);
          return x + y <= 9999 && carryCount(x, y) >= 1 ? [x, y] : null;
        });
        const wrong = addNoCarry(a, b);
        let p = 0; while (digitAt(a, p) + digitAt(b, p) < 10) p++;
        const s = digitAt(a, p) + digitAt(b, p);
        return num(`${who} worked out ${F(a)} + ${F(b)} and got ${F(wrong)}.\nWhat is the correct answer?`, a + b,
          ['Check each column. When a column makes 10 or more, you must carry 1 to the next column.',
            `${PLACES[p][0].toUpperCase() + PLACES[p].slice(1)}: ${digitAt(a, p)} + ${digitAt(b, p)} = ${s}. ${who} wrote ${s % 10} but forgot to carry the 1.`],
          `Carrying properly gives ${F(a)} + ${F(b)} = ${F(a + b)}.`);
      }
      const [a, b] = retry(() => {
        const x = R(2000, 9999), y = L === 2 ? R(100, 999) : R(1000, x - 500);
        return y < x && exchangeCount(x, y) >= 1 && subSmallFromBig(x, y) !== x - y ? [x, y] : null;
      });
      const wrong = subSmallFromBig(a, b);
      let p = 0; while (digitAt(a, p) >= digitAt(b, p)) p++;
      return num(`${who} worked out ${F(a)} − ${F(b)} and got ${F(wrong)}.\nWhat is the correct answer?`, a - b,
        ['Always take the bottom digit away from the top digit. If the top digit is smaller, exchange from the next column.',
          `${PLACES[p][0].toUpperCase() + PLACES[p].slice(1)}: the top digit is ${digitAt(a, p)} and the bottom digit is ${digitAt(b, p)}. ${who} did ${digitAt(b, p)} − ${digitAt(a, p)} instead of exchanging.`],
        `Exchanging properly gives ${F(a)} − ${F(b)} = ${F(a - b)}.`);
    };

    const missing = () => {
      const t = R(1, 3);
      if (t === 1) {
        const c = pick([R(3, 9) * 1000, R(2000, 9999)]), b = R(1000, c - 500), a = c - b;
        return num(`Find the missing number.\n□ + ${F(b)} = ${F(c)}`, a,
          ['Use the inverse: undo adding by subtracting.', `□ = ${F(c)} − ${F(b)}.`],
          `${F(c)} − ${F(b)} = ${F(a)}. Check: ${F(a)} + ${F(b)} = ${F(c)}.`);
      }
      if (t === 2) {
        const a = R(3000, 9999), c = R(1000, a - 500), b = a - c;
        return num(`Find the missing number.\n${F(a)} − □ = ${F(c)}`, b,
          ['Ask: how much do I take away from the first number to get the answer?', `□ = ${F(a)} − ${F(c)}.`],
          `${F(a)} − ${F(c)} = ${F(b)}. Check: ${F(a)} − ${F(b)} = ${F(c)}.`);
      }
      const b = R(1000, 4999), c = R(1000, 9999 - b), a = b + c;
      return num(`Find the missing number.\n□ − ${F(b)} = ${F(c)}`, a,
        ['Use the inverse: undo subtracting by adding.', `□ = ${F(c)} + ${F(b)}.`],
        `${F(c)} + ${F(b)} = ${F(a)}. Check: ${F(a)} − ${F(b)} = ${F(c)}.`);
    };

    const word = L => {
      const who = U.name();
      const add = coin();
      if (add) {
        const [a, b] = retry(() => { const x = R(1000, 7999), y = L === 2 ? R(300, 999) : R(1000, 8999); return x + y <= 9999 && carryCount(x, y) ? [x, y] : null; });
        const t = pick([
          [`A library had ${F(a)} books. It bought ${F(b)} more. How many books does it have now?`, ''],
          [`${F(a)} people visited a museum on Saturday and ${F(b)} people visited on Sunday. How many people visited altogether?`, ''],
          [`${who} flew ${F(a)} km to visit a cousin, then ${F(b)} km more to the seaside. How far did ${who} fly in total?`, 'km'],
        ]);
        return num(t[0], a + b, ['Decide: do you need to add or subtract? "Altogether", "in total" and "more" here mean add.', `Work out ${F(a)} + ${F(b)}. ${onesAddStep(a, b)}`],
          `${F(a)} + ${F(b)} = ${F(a + b)}.`, t[1] ? { unit: t[1] } : undefined);
      }
      const [a, b] = retry(() => { const x = R(2000, 9999), y = L === 2 ? R(300, 999) : R(1000, x - 500); return y < x && exchangeCount(x, y) ? [x, y] : null; });
      const t = pick([
        [`A farmer had ${F(a)} sheep. The farmer sold ${F(b)} of them. How many sheep are left?`, ''],
        [`Town A has ${F(a)} people. Town B has ${F(b)} people. How many more people live in Town A?`, ''],
        [`A plane has to fly ${F(a)} km. It has flown ${F(b)} km so far. How much further does it have to fly?`, 'km'],
      ]);
      return num(t[0], a - b, ['Decide: do you need to add or subtract? "Left", "how many more" and "how much further" mean subtract.', `Work out ${F(a)} − ${F(b)}. ${onesSubStep(a, b)}`],
        `${F(a)} − ${F(b)} = ${F(a - b)}.`, t[1] ? { unit: t[1] } : undefined);
    };

    const estimate = () => {
      const r100 = x => Math.round(x / 100) * 100;
      const [a, b] = retry(() => { const x = R(1000, 7999), y = R(1000, 8999 - x); return x % 100 && y % 100 && x + y <= 9999 ? [x, y] : null; });
      if (coin()) {
        return num(`Round each number to the nearest 100. Then add them to estimate ${F(a)} + ${F(b)}.`, r100(a) + r100(b),
          ['Round first, then add the rounded numbers.', `${F(a)} rounds to ${F(r100(a))}.`],
          `${F(a)} → ${F(r100(a))} and ${F(b)} → ${F(r100(b))}. ${F(r100(a))} + ${F(r100(b))} = ${F(r100(a) + r100(b))}.`);
      }
      const big = Math.max(a, b) + R(1000, 2000) > 9999 ? Math.max(a, b) : Math.max(a, b) + R(1000, 2000), small = Math.min(a, b);
      if (r100(big) - r100(small) <= 0) return addQ(2);
      return num(`Round each number to the nearest 100. Then subtract to estimate ${F(big)} − ${F(small)}.`, r100(big) - r100(small),
        ['Round first, then subtract the rounded numbers.', `${F(big)} rounds to ${F(r100(big))}.`],
        `${F(big)} → ${F(r100(big))} and ${F(small)} → ${F(r100(small))}. ${F(r100(big))} − ${F(r100(small))} = ${F(r100(big) - r100(small))}.`);
    };

    PMLM.registerSkill({
      id: 'g4.addSub', grade: 4, unit: 'g4.u2', title: 'Column + and −', icon: '🧮',
      blurb: 'Add and subtract 4-digit numbers in columns',
      lesson: [
        { title: 'Line up the columns',
          text: 'Write the numbers with thousands under thousands, hundreds under hundreds, tens under tens and ones under ones.\nAlways start with the **ones**.',
          visual: { type: 'table', headers: ['', 'Th', 'H', 'T', 'O'], rows: [['', '2', '4', '3', '6'], ['+', '1', '3', '5', '2'], ['', '**3**', '**7**', '**8**', '**8**']] } },
        { title: 'Carrying',
          text: 'If a column adds up to 10 or more, write the ones digit and **carry** the 1 to the next column.\n6 + 7 = 13: write 3, carry 1 to the tens.' },
        { title: 'Exchanging',
          text: 'When subtracting, if the top digit is smaller, **exchange** 1 from the next column.\n52 − 17: 2 − 7 won\'t work. Exchange 1 ten for 10 ones, so 5 tens and 2 ones become 4 tens and 12 ones.\n12 − 7 = 5, then 4 − 1 = 3. So 52 − 17 = **35**',
          visual: { type: 'table', headers: ['', 'T', 'O'], rows: [['', '5 → 4', '2 → 12'], ['−', '1', '7'], ['', '**3**', '**5**']] } },
        { title: 'Estimate and check',
          text: 'Estimate first: 4812 + 2396 is about 4800 + 2400 = 7200.\nCheck a subtraction by adding: 35 + 17 = 52 ✓' },
        { title: 'Worked example',
          text: 'Work out 3526 + 2847.\n**1.** Ones: 6 + 7 = 13. Write 3, carry 1.\n**2.** Tens: 2 + 4 + 1 = 7.\n**3.** Hundreds: 5 + 8 = 13. Write 3, carry 1.\n**4.** Thousands: 3 + 2 + 1 = 6.\nAnswer: **6373**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [addQ, addQ, subQ, subQ],
          [addQ, subQ, spot, word, estimate],
          [addQ, subQ, subQ, spot, missing, word],
        ], ctx);
      },
    });
  }

  /* 6 ── Times tables to 10 × 10 and division facts */
  {
    const trick = (t, b) => ({
      2: `Double ${b}.`,
      3: `Double ${b} is ${2 * b}. Now add one more ${b}.`,
      4: `Double ${b} is ${2 * b}. Now double it again.`,
      5: `${b} × 10 = ${10 * b}. Now halve it.`,
      6: `${b} × 5 = ${5 * b}. Now add one more ${b}.`,
      7: `${b} × 5 = ${5 * b} and ${b} × 2 = ${2 * b}. Now add them.`,
      8: `${b} × 4 = ${4 * b}. Now double it.`,
      9: `${b} × 10 = ${10 * b}. Now take away ${b}.`,
      10: `${b} moves one place to the left, and a 0 goes in the ones place.`,
    }[t]);
    // choose which factor to use the trick on
    const tableOf = (x, y) => {
      for (const t of [10, 5, 9, 2]) { if (x === t) return [x, y]; if (y === t) return [y, x]; }
      return x >= y ? [x, y] : [y, x];
    };
    const pair = L => {
      if (L === 1) return [pick([2, 3, 4, 5, 10]), R(2, 10)];
      if (L === 2) return [R(2, 10), R(2, 10)];
      return [pick([6, 7, 8, 9]), R(3, 10)];
    };

    const factQ = L => {
      const [x, y] = coin() ? pair(L) : pair(L).reverse(), [t, b] = tableOf(x, y);
      const viz = L === 1 && x <= 6 && y <= 8 && coin(0.4) ? { visual: { type: 'array', rows: x, cols: y } } : undefined;
      return num(`Work out ${x} × ${y}`, x * y,
        [`Use a fact you know. You can turn it around: ${y} × ${x} is the same.`, trick(t, b)],
        `${x} × ${y} = ${x * y}.`, viz);
    };

    const divQ = L => {
      const [t, b] = L === 1 ? [pick([2, 5, 10]), R(2, 10)] : pair(L);
      const p = t * b;
      return num(`Work out ${p} ÷ ${t}`, b,
        [`Division is the inverse of multiplication. Think: ${t} × what = ${p}?`,
          `Count in ${t}s: ${upTo(t, p)} How many ${t}s make ${p}?`],
        `${t} × ${b} = ${p}, so ${p} ÷ ${t} = ${b}.`);
    };

    const missingQ = L => {
      const [t, b] = pair(L), p = t * b, k = R(1, 4);
      if (k === 1) return num(`Find the missing number.\n□ × ${t} = ${p}`, b,
        [`Think: what times ${t} makes ${p}?`, `Count in ${t}s until you reach ${p}: ${upTo(t, p)}`],
        `${b} × ${t} = ${p}, so the missing number is ${b}.`);
      if (k === 2) return num(`Find the missing number.\n${t} × □ = ${p}`, b,
        [`Use the inverse: □ = ${p} ÷ ${t}.`, `Count in ${t}s until you reach ${p}: ${upTo(t, p)}`],
        `${t} × ${b} = ${p}, so the missing number is ${b}.`);
      if (k === 3) return num(`Find the missing number.\n${p} ÷ □ = ${b}`, t,
        [`Think: ${b} × what = ${p}?`, `Count in ${b}s until you reach ${p}: ${upTo(b, p)}`],
        `${p} ÷ ${t} = ${b}, so the missing number is ${t}.`);
      return num(`Find the missing number.\n□ ÷ ${t} = ${b}`, p,
        ['Use the inverse: to undo ÷, multiply.', `□ = ${b} × ${t}. ${trick(...tableOf(b, t))}`],
        `${b} × ${t} = ${p}, so □ = ${p}. Check: ${p} ÷ ${t} = ${b}.`);
    };

    const familyQ = () => {
      const t = R(6, 9), b = R(3, 9);
      if (t === b) return familyQ();
      const p = t * b;
      const right = coin() ? `${p} ÷ ${b} = ${t}` : `${p} ÷ ${t} = ${b}`;
      return choice(`Which division fact goes with ${t} × ${b} = ${p}?`, right,
        [`${p} ÷ ${b} = ${t + 1}`, `${b} ÷ ${t} = ${p}`, `${t} ÷ ${p} = ${b}`, `${p} ÷ ${t} = ${b - 1}`],
        ['A fact family uses the same three numbers. The biggest number is divided.',
          `Start the division with ${p}, the biggest number.`],
        `${t} × ${b} = ${p}, so ${p} ÷ ${b} = ${t} and ${p} ÷ ${t} = ${b}.`);
    };

    const compareQ = () => {
      const eqPairs = [[[3, 8], [4, 6]], [[2, 9], [3, 6]], [[4, 9], [6, 6]], [[3, 4], [2, 6]], [[2, 8], [4, 4]], [[5, 8], [4, 10]], [[3, 10], [5, 6]], [[2, 10], [4, 5]], [[6, 4], [8, 3]]];
      let A, B;
      if (coin(0.3)) [A, B] = U.shuffle(pick(eqPairs));
      else {
        [A, B] = retry(() => {
          const a = [R(3, 9), R(3, 9)], b = [R(3, 9), R(3, 9)];
          const d = Math.abs(a[0] * a[1] - b[0] * b[1]);
          return d > 0 && d <= 8 && a[0] !== b[0] && a[0] !== b[1] ? [a, b] : null;
        });
      }
      const pa = A[0] * A[1], pb = B[0] * B[1], sA = `${A[0]} × ${A[1]}`, sB = `${B[0]} × ${B[1]}`;
      const ans = pa === pb ? 'They are equal' : pa > pb ? sA : sB;
      return choice(`Which is bigger: ${sA} or ${sB}?`, ans, [sA, sB, 'They are equal'],
        ['Work out each multiplication, then compare the answers.', `${sA} = ${pa}.`],
        `${sA} = ${pa} and ${sB} = ${pb}. ${pa === pb ? 'They are equal.' : `${ans} is bigger.`}`, null, 3);
    };

    const wordQ = L => {
      const [t, b] = pair(Math.max(L, 2)), p = t * b, who = U.name();
      const k = R(1, 5);
      if (k === 1) return num(`A hall has ${t} rows of chairs. There are ${b} chairs in each row. How many chairs are there?`, p,
        ['Equal rows: multiply the number of rows by the number in each row.', `Work out ${t} × ${b}. ${trick(...tableOf(t, b))}`],
        `${t} × ${b} = ${p} chairs.`);
      if (k === 2) return num(`${p} stickers are shared equally between ${t} children. How many stickers does each child get?`, b,
        ['Sharing equally means dividing.', `Work out ${p} ÷ ${t}. Think: ${t} × what = ${p}?`],
        `${p} ÷ ${t} = ${b}, because ${t} × ${b} = ${p}.`);
      if (k === 3) return num(`Pencils come in packs of ${t}. ${who} needs ${p} pencils. How many packs does ${who} need?`, b,
        [`How many groups of ${t} make ${p}? Divide.`, `Count in ${t}s until you reach ${p}: ${upTo(t, p)}`],
        `${p} ÷ ${t} = ${b} packs.`);
      if (k === 4) {
        const n = R(3, 10);
        return num(`A spider has 8 legs. How many legs do ${n} spiders have?`, 8 * n,
          ['Each spider has 8 legs, so multiply by 8.', `Work out ${n} × 8. ${trick(8, n)}`],
          `${n} × 8 = ${8 * n} legs.`);
      }
      const n = R(3, 10);
      return num(`There are 7 days in a week. How many days are there in ${n} weeks?`, 7 * n,
        ['Each week has 7 days, so multiply by 7.', `Work out ${n} × 7. ${trick(7, n)}`],
        `${n} × 7 = ${7 * n} days.`);
    };

    PMLM.registerSkill({
      id: 'g4.tables', grade: 4, unit: 'g4.u2', title: 'Times tables to 10 × 10', icon: '✖️',
      blurb: 'Quick recall of × facts and the ÷ facts that go with them',
      lesson: [
        { title: 'Multiplying is equal groups',
          text: '3 × 4 means 3 rows of 4 (or 4 rows of 3).\nCount them: 3 × 4 = **12**.',
          visual: { type: 'array', rows: 3, cols: 4 } },
        { title: 'Turn it around',
          text: '6 × 7 gives the same answer as 7 × 6.\nSo if you know one fact, you know the other one too!' },
        { title: 'Division is the inverse',
          text: '6 × 7 = 42, so 42 ÷ 7 = 6 and 42 ÷ 6 = 7.\nThese facts are a **fact family**: they use the same three numbers.\n**Tip:** to work out 42 ÷ 7, ask "7 times what makes 42?"' },
        { title: 'Handy tricks',
          text: '**× 4:** double, then double again.\n**× 5:** × 10, then halve.\n**× 8:** × 4, then double.\n**× 9:** × 10, then take away the number. 9 × 7 = 70 − 7 = 63' },
        { title: 'Worked example',
          text: 'Work out 56 ÷ 8.\n**1.** Ask: 8 × what = 56?\n**2.** Count in 8s: 8, 16, 24, 32, 40, 48, 56. That is 7 eights.\n**3.** So 8 × 7 = 56.\nAnswer: 56 ÷ 8 = **7**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [factQ, factQ, factQ, divQ],
          [factQ, factQ, divQ, divQ, missingQ, wordQ],
          [factQ, divQ, missingQ, familyQ, compareQ, wordQ],
        ], ctx);
      },
    });
  }

  /* 7 ── Multiply 2- and 3-digit numbers by a 1-digit number */
  {
    const partsOf = n => [Math.floor(n / 100) * 100, Math.floor((n % 100) / 10) * 10, n % 10].filter(x => x > 0);
    const grid = (n, m, show) => ({ type: 'table', headers: ['×', ...partsOf(n).map(F)], rows: [[String(m), ...partsOf(n).map(p => (show ? F(p * m) : '?'))]] });
    const pickN = L => {
      if (L === 1) return [retry(() => { const x = R(12, 49); return x % 10 ? x : null; }), R(2, 5)];
      if (L === 2) return coin() ? [retry(() => { const x = R(21, 99); return x % 10 ? x : null; }), R(3, 9)] : [R(101, 299), R(2, 5)];
      return [R(120, 999), R(3, 9)];
    };
    const partHint = (n, m) => {
      const ps = partsOf(n);
      return ps.slice(0, -1).map(p => `${F(p)} × ${m} = ${F(p * m)}`).join(' and ') + '.';
    };

    const mulQ = L => {
      const [n, m] = pickN(L), ps = partsOf(n);
      return num(`Work out ${n} × ${m}`, n * m,
        [`Split ${n} into ${ps.map(F).join(' + ')}. Multiply each part by ${m}, then add.`,
          ps.length > 1 ? partHint(n, m) + ` Now do ${ps[ps.length - 1]} × ${m}.` : `Use your ${m} times table.`],
        `${ps.map(p => `${F(p)} × ${m} = ${F(p * m)}`).join(', ')}. Add: ${ps.map(p => F(p * m)).join(' + ')} = ${F(n * m)}.`,
        L === 1 || (L === 2 && coin()) ? { visual: grid(n, m, false) } : undefined);
    };

    const missingCell = L => {
      const [n, m] = retry(() => { const x = L === 2 ? R(21, 99) : R(111, 999); return partsOf(x).length >= 2 ? [x, R(3, 9)] : null; });
      const ps = partsOf(n), big = ps.map((x, i) => i).filter(i => ps[i] >= 10), k = pick(big), p = ps[k];
      const v = grid(n, m, true);
      v.rows[0][k + 1] = '?';
      const lead = Math.floor(p / PV[String(p).length - 1]), placeV = PV[String(p).length - 1];
      return num(`The grid shows ${n} × ${m}. What number goes in the box with the **?**`, p * m,
        ['Each box is the number at the top × the number at the side.',
          placeV > 1 ? `The box is ${F(p)} × ${m}. Work out ${lead} × ${m} first, then make it ${placeV} times bigger.` : `The box is ${p} × ${m}. Use your ${m} times table.`],
        `${F(p)} × ${m} = ${F(p * m)}.`, { visual: v });
    };

    const spot = () => {
      const who = U.name();
      const [n, m] = retry(() => { const x = R(13, 89), y = R(3, 9); return (x % 10) * y >= 10 ? [x, y] : null; });
      const t = Math.floor(n / 10), o = n % 10;
      if (coin()) {
        const wrong = t * m * 10 + ((o * m) % 10);
        return num(`${who} worked out ${n} × ${m} and got ${wrong}.\nWhat is the correct answer?`, n * m,
          [`Check the ones. Did ${who} carry the tens?`,
            `${o} × ${m} = ${o * m}. Write ${(o * m) % 10} in the ones and carry ${Math.floor(o * m / 10)} into the tens.`],
          `${t * 10} × ${m} = ${t * 10 * m} and ${o} × ${m} = ${o * m}. ${t * 10 * m} + ${o * m} = ${n * m}.`);
      }
      const wrong = t * m + o * m;
      return num(`${who} worked out ${n} × ${m} like this: ${t} × ${m} = ${t * m} and ${o} × ${m} = ${o * m}, so the answer is ${wrong}.\nWhat is the correct answer?`, n * m,
        [`The ${t} in ${n} is worth ${t} ${pl(t, 1)}, not ${t} ${pl(t, 0)}.`, `So the first part is ${t * 10} × ${m}, not ${t} × ${m}.`],
        `${t * 10} × ${m} = ${t * 10 * m} and ${o} × ${m} = ${o * m}. ${t * 10 * m} + ${o * m} = ${n * m}.`);
    };

    const word = (L, ctx) => {
      const [n, m] = L === 2 ? [R(21, 99), R(3, 9)] : [R(112, 450), R(3, 9)], who = U.name(), c = cur(ctx);
      const t = pick([
        [`A box holds ${n} pencils. How many pencils are in ${m} boxes?`, {}],
        [`A ticket for a show costs ${money(c, n)}. How much do ${m} tickets cost?`, { prefix: c }],
        [`One lap of the track is ${n} m. ${who} runs ${m} laps. How far does ${who} run?`, { unit: 'm' }],
        [`A book has ${n} pages. How many pages are there in ${m} copies of the book?`, {}],
      ]);
      return num(t[0], n * m,
        ['You have equal groups, so multiply.', `Work out ${n} × ${m}. ${partHint(n, m)}`],
        `${n} × ${m} = ${F(n * m)}.`, t[1]);
    };

    const estimate = () => {
      const n = retry(() => { const x = R(120, 980); return x % 100 >= 10 && x % 100 <= 90 && x % 100 !== 50 ? x : null; }), m = R(3, 9), r = Math.round(n / 100) * 100;
      return num(`Round ${n} to the nearest 100. Then use it to estimate ${n} × ${m}.`, r * m,
        ['Round first, then multiply the rounded number.', `${n} rounds to ${r}.`],
        `${n} → ${r}. ${r} × ${m} = ${F(r * m)}, so ${n} × ${m} is about ${F(r * m)}.`);
    };

    PMLM.registerSkill({
      id: 'g4.multiply', grade: 4, unit: 'g4.u2', title: 'Multiply by 1 digit', icon: '🧩',
      blurb: 'Multiply 2- and 3-digit numbers by a 1-digit number',
      lesson: [
        { title: 'Split it up',
          text: 'To work out 23 × 4, split 23 into **20 + 3**.\n20 × 4 = 80 and 3 × 4 = 12.\nAdd: 80 + 12 = **92**.',
          visual: { type: 'table', headers: ['×', '20', '3'], rows: [['4', '80', '12']] } },
        { title: 'The grid method',
          text: 'For 146 × 3, split 146 into 100 + 40 + 6.\nMultiply each part, then add: 300 + 120 + 18 = **438**.',
          visual: { type: 'table', headers: ['×', '100', '40', '6'], rows: [['3', '300', '120', '18']] } },
        { title: 'Use your tables',
          text: '40 × 3: think 4 × 3 = 12, then make it 10 times bigger: **120**.\n200 × 4: think 2 × 4 = 8, then make it 100 times bigger: **800**.' },
        { title: 'Estimate first',
          text: '146 × 3 is about 150 × 3 = 450.\nIf your answer is far from 450, check your working!' },
        { title: 'Worked example',
          text: 'Work out 238 × 4.\n**1.** Split: 238 = 200 + 30 + 8.\n**2.** 200 × 4 = 800, 30 × 4 = 120, 8 × 4 = 32.\n**3.** Add: 800 + 120 + 32 = 952.\nAnswer: **952**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [mulQ, mulQ, mulQ],
          [mulQ, mulQ, missingCell, spot, word],
          [mulQ, mulQ, missingCell, spot, word, estimate],
        ], ctx);
      },
    });
  }

  /* 8 ── Divide a 2-digit number by a 1-digit number, with remainders */
  {
    const rem = (q, r) => (r ? `${q} r ${r}` : `${q}`);
    const splitTens = (p, t) => { const k = Math.floor(p / t / 10) * 10; return [k, k * t]; };

    const exact = L => {
      if (L === 1) {
        const [t, b] = retry(() => { const x = R(2, 5), y = R(3, 10); return x * y >= 10 ? [x, y] : null; }), p = t * b;
        return num(`Work out ${p} ÷ ${t}`, b,
          [`${p} ÷ ${t} means share ${p} into ${t} equal groups. Use your ${t} times table.`,
            `Count in ${t}s: ${upTo(t, p)} How many ${t}s make ${p}?`],
          `${t} × ${b} = ${p}, so ${p} ÷ ${t} = ${b}.`,
          { visual: { type: 'barModel', rows: [{ label: '', parts: t, value: '?' }], total: String(p) } });
      }
      const t = R(2, 6), q = R(11, Math.floor(99 / t)), p = t * q, [k, kt] = splitTens(p, t);
      return num(`Work out ${p} ÷ ${t}`, q,
        [`Split ${p} into a part you can divide easily (a multiple of ${t * 10}) and the rest.`,
          `${p} = ${kt} + ${p - kt}, and ${kt} ÷ ${t} = ${k}.`],
        `${kt} ÷ ${t} = ${k} and ${p - kt} ÷ ${t} = ${q - k}. So ${p} ÷ ${t} = ${q}.`);
    };

    const make = L => retry(() => {
      let t, q;
      if (L === 1) { t = R(2, 5); q = R(2, 9); }
      else if (L === 2) { t = R(3, 9); q = R(2, 10); }
      else { t = R(3, 6); q = R(11, 20); }
      const r = R(1, t - 1), p = t * q + r;
      return p >= 10 && p <= 99 ? { t, q, r, p } : null;
    });

    const remChoice = L => {
      const { t, q, r, p } = make(L);
      const wrongs = [rem(q - 1, r + t), rem(q + 1, t - r), rem(q, t - r), rem(q - 1, r)].filter(x => !/^0 /.test(x));
      const hints = L === 3
        ? (() => { const [k, kt] = splitTens(p, t); return [`Split ${p} into ${kt} (that is ${k} × ${t}) and ${p - kt}.`, `${kt} ÷ ${t} = ${k}. Now divide ${p - kt} by ${t} and find what is left over.`]; })()
        : [`Find the biggest multiple of ${t} that is not more than ${p}. What is left over is the remainder.`,
          `Count in ${t}s: ${upTo(t, p)} Stop before you go past ${p}.`];
      return choice(`Work out ${p} ÷ ${t}`, rem(q, r), wrongs, hints,
        `${t} × ${q} = ${t * q}, and ${p} − ${t * q} = ${r}. So ${p} ÷ ${t} = ${q} r ${r}.`);
    };

    const remNum = L => {
      const { t, q, r, p } = make(L);
      const viz = L === 1 && p <= 20 ? { visual: { type: 'objects', groups: [p], emoji: pick(['🍪', '🍓', '⭐', '🍬']) } } : undefined;
      return num(`What is the remainder when ${p} is divided by ${t}?`, r,
        [`Make as many groups of ${t} as you can. The remainder is what is left over.`, `${t} × ${q} = ${t * q}. How many more make ${p}?`],
        `${t} × ${q} = ${t * q} and ${p} − ${t * q} = ${r}. The remainder is ${r}.`, viz);
    };

    // first step for finding how many groups of t fit into p
    const groupStep = (t, p) => {
      if (p < 10 * t) return `Count in ${t}s: ${upTo(t, p)} Stop before you go past ${p}.`;
      const [k, kt] = splitTens(p, t);
      return `${p} = ${kt} + ${p - kt}, and ${kt} ÷ ${t} = ${k}. Now see how many ${t}s fit into ${p - kt}.`;
    };
    const wordRem = L => {
      const { t, q, r, p } = make(L), k = R(1, 4);
      const kids = n => (n === 1 ? '1 child' : `${n} children`);
      if (k === 1) return num(`${p} children are going on a trip. Each car can take ${t} children. How many cars are needed?`, q + 1,
        ['Divide, then think about the children who are left over.', `${t} × ${q} = ${t * q}, so ${q} cars carry ${t * q} children. ${r === 1 ? '1 more child still needs' : `${r} more children still need`} a seat.`],
        `${p} ÷ ${t} = ${q} r ${r}. The ${kids(r)} left over need${r === 1 ? 's' : ''} one more car, so ${q + 1} cars are needed.`);
      if (k === 2) return num(`${p} eggs are packed into boxes of ${t}. How many boxes can be filled?`, q,
        ['Divide. A box that is not full does not count.', groupStep(t, p)],
        `${p} ÷ ${t} = ${q} r ${r}. Only ${q} boxes are full; the ${r === 1 ? 'egg' : `${r} eggs`} left over cannot fill a box.`);
      if (k === 3) return num(`${p} sweets are shared equally between ${t} children. How many sweets are left over?`, r,
        ['Share equally by dividing. The remainder is what is left over.', `Each child gets ${q} sweets: ${t} × ${q} = ${t * q}.`],
        `${p} ÷ ${t} = ${q} r ${r}, so ${r} ${r === 1 ? 'sweet is' : 'sweets are'} left over.`);
      return num(`${p} sweets are shared equally between ${t} children. How many sweets does each child get?`, q,
        ['Share equally by dividing. Ignore the sweets left over.', groupStep(t, p)],
        `${p} ÷ ${t} = ${q} r ${r}, so each child gets ${q} sweets (and ${r} ${r === 1 ? 'is' : 'are'} left over).`);
    };

    const spot = () => {
      const { t, q, r, p } = make(2), who = U.name();
      if (q < 3) return remChoice(2);
      return choice(`${who} says ${p} ÷ ${t} = ${q - 1} r ${r + t}.\nWhat is the correct answer?`, rem(q, r), [rem(q + 1, t - r), rem(q, t - r), rem(q + 1, r), rem(q - 1, r)],
        ['The remainder must always be smaller than the number you divide by.', `${r + t} is bigger than ${t}, so one more group of ${t} fits.`],
        `${t} × ${q} = ${t * q} and ${p} − ${t * q} = ${r}. So ${p} ÷ ${t} = ${q} r ${r}.`);
    };

    PMLM.registerSkill({
      id: 'g4.divide', grade: 4, unit: 'g4.u2', title: 'Divide with remainders', icon: '➗',
      blurb: 'Divide a 2-digit number by a 1-digit number',
      lesson: [
        { title: 'Sharing equally',
          text: '12 ÷ 3 means share 12 into 3 equal groups.\nThere are 4 in each group, so 12 ÷ 3 = **4**.',
          visual: { type: 'objects', groups: [4, 4, 4], emoji: '🍪' } },
        { title: 'Remainders',
          text: 'Sometimes some are left over. That is the **remainder**.\n14 ÷ 3: make groups of 3. There are 4 groups, and 2 are left over.\n14 ÷ 3 = **4 r 2**',
          visual: { type: 'objects', groups: [3, 3, 3, 3, 2], emoji: '🍪' } },
        { title: 'Use your tables',
          text: '47 ÷ 5: which 5× fact is just below 47? 5 × 9 = 45.\n47 − 45 = 2, so 47 ÷ 5 = **9 r 2**.\n**Tip:** the remainder must be smaller than the number you divide by.' },
        { title: 'Bigger numbers: split it',
          text: '72 ÷ 4: split 72 into 40 + 32.\n40 ÷ 4 = 10 and 32 ÷ 4 = 8.\n10 + 8 = **18**.' },
        { title: 'Worked example',
          text: 'Work out 58 ÷ 4.\n**1.** Split 58 into 40 + 18.\n**2.** 40 ÷ 4 = 10.\n**3.** 18 ÷ 4 = 4 r 2, because 4 × 4 = 16.\n**4.** 10 + 4 = 14, with 2 left over.\nAnswer: **14 r 2**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [exact, exact, remChoice, remNum],
          [exact, exact, remChoice, remNum, wordRem],
          [exact, remChoice, remChoice, wordRem, wordRem, spot],
        ], ctx);
      },
    });
  }

  /* 9 ── Multiples and factors */
  {
    const RULES = {
      2: 'Multiples of 2 are even: they end in 0, 2, 4, 6 or 8.',
      5: 'Multiples of 5 end in 0 or 5.',
      10: 'Multiples of 10 end in 0.',
      25: 'Multiples of 25 end in 00, 25, 50 or 75.',
      50: 'Multiples of 50 end in 00 or 50.',
      100: 'Multiples of 100 end in 00.',
    };
    const multipleOf = L => retry(() => {
      const k = pick(L === 1 ? [2, 5, 10] : L === 2 ? [3, 4, 6, 25, 50] : [6, 7, 8, 9, 25, 50, 100]);
      const m = k >= 25 ? R(2, k === 100 ? 9 : 19) : L === 3 ? R(6, 15) : R(3, 12), ans = k * m;
      const near = k === 25 ? [ans + 10, ans - 5, ans + 15, ans + 20] : k === 50 ? [ans + 25, ans - 25, ans + 10, ans + 5] : k === 100 ? [ans + 50, ans + 10, ans - 50, ans + 5]
        : k === 4 ? [ans + 2, ans - 2, ans + 1, ans + 6] : k === 6 ? [ans + 3, ans - 2, ans + 2, ans - 3] : [ans + 1, ans - 1, ans + 2, ans - 2, ans + 3];
      const w = near.filter(x => x > 0 && x % k !== 0);
      if (w.length < 3) return null;
      const counts = coin(0.3), who = U.name();
      return choice(counts ? `${who} counts in ${k}s, starting at 0. Which of these numbers will ${who} say?` : `Which number is a multiple of ${k}?`,
        F(ans), w.map(F),
        [RULES[k] || `Multiples of ${k} are the numbers in the ${k} times table, and they carry on: ${k}, ${2 * k}, ${3 * k}, …`,
          `Check each number. ${F(w[0])} ÷ ${k} leaves a remainder, so ${F(w[0])} is not a multiple of ${k}.`],
        `${F(ans)} = ${m} × ${k}, so it is a multiple of ${k}.`);
    });

    const nextMultiple = L => {
      const k = pick(L === 1 ? [2, 3, 4, 5, 10] : [6, 7, 8, 9, 25]), s = R(2, 8);
      const terms = [0, 1, 2, 3].map(i => k * (s + i)), gap = L === 1 ? 3 : R(1, 3);
      return num(`These are multiples of ${k}. What number is missing?`, terms[gap],
        [`Multiples of ${k} go up in steps of ${k}.`, `Add ${k} to ${terms[gap - 1]}.`],
        `${terms[gap - 1]} + ${k} = ${terms[gap]}.`,
        { visual: { type: 'sequence', terms: terms.map((t, i) => (i === gap ? '?' : String(t))), step: `+${k}` } });
    };

    const NS = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48];
    const factorOf = () => retry(() => {
      const n = pick(NS), fs = U.factors(n).filter(f => f > 1 && f < n), ans = pick(fs);
      const non = U.range(2, 12).filter(x => n % x !== 0);
      if (non.length < 2) return null;
      const w = [2 * n, ...U.sample(non, 3)];
      const shownNon = w.filter(x => x !== 2 * n)[0];
      return choice(`Which number is a factor of ${n}?`, String(ans), w.map(String),
        [`A factor of ${n} divides into ${n} exactly, with nothing left over.`,
          `Try dividing ${n} by each number. ${shownNon} does not go into ${n} exactly. (And a factor can't be bigger than ${n}.)`],
        `${n} ÷ ${ans} = ${n / ans} with nothing left over, so ${ans} is a factor of ${n}.`);
    });

    const notFactor = () => retry(() => {
      const n = pick([12, 18, 20, 24, 30, 36, 40, 48]), fs = U.factors(n).filter(f => f > 1 && f < n);
      const non = U.range(3, 12).filter(x => n % x !== 0), ans = pick(non);
      if (fs.length < 3) return null;
      const w = U.sample(fs, 3), f1 = w[0];
      return choice(`Which number is **not** a factor of ${n}?`, String(ans), w.map(String),
        [`Factors come in pairs that multiply to make ${n}.`, `${f1} × ${n / f1} = ${n}, so ${f1} is a factor.`],
        `${n} ÷ ${ans} leaves a remainder of ${n % ans}, so ${ans} is not a factor of ${n}. The others all divide ${n} exactly.`);
    });

    const factorPair = () => retry(() => {
      const n = pick([12, 16, 18, 20, 24, 30, 36, 40, 48]);
      const pairs = U.factors(n).filter(f => f * f <= n).map(f => [f, n / f]);
      if (pairs.length < 3) return null;
      const k = R(1, pairs.length - 1), shown = pairs.slice(0, k).map(([a, b]) => `${a} × ${b}`);
      const [a, b] = pairs[k];
      return num(`Here are some factor pairs of ${n}: ${shown.join(', ')}.\nFind the missing number: ${a} × □ = ${n}`, b,
        [`The two numbers in a factor pair multiply to make ${n}.`, `Think: ${a} × what = ${n}? Count in ${a}s.`],
        `${a} × ${b} = ${n}, so the missing number is ${b}.`);
    });

    const countFactors = () => {
      const n = pick([6, 8, 10, 12, 14, 15, 16, 18, 20, 21, 24, 30]), fs = U.factors(n), f2 = fs[1];
      return num(`How many factors does ${n} have?`, fs.length,
        [`Find the factors in pairs that multiply to make ${n}, starting with 1 × ${n}.`,
          `1 × ${n} and ${f2} × ${n / f2} are two pairs. Keep checking 3, 4, 5, …`],
        `The factors of ${n} are ${fs.join(', ')}. That is ${fs.length} factors.`);
    };

    const commonMultiple = () => retry(() => {
      const [a, b] = pick([[2, 5], [3, 4], [2, 3], [4, 5], [3, 5], [2, 7], [4, 6]]), l = U.lcm(a, b);
      const ans = l * R(1, Math.floor(60 / l));
      const onlyA = a * R(2, 15), onlyB = b * R(2, 12), neither = R(11, 59);
      if (onlyA % b === 0 || onlyB % a === 0 || neither % a === 0 || neither % b === 0) return null;
      return choice(`Which number is a multiple of **both** ${a} and ${b}?`, String(ans), [onlyA, onlyB, neither].map(String),
        [`It must be in the ${a} times table **and** in the ${b} times table.`, `${onlyA} is a multiple of ${a}. Is it also a multiple of ${b}?`],
        `${ans} = ${ans / a} × ${a} and ${ans} = ${ans / b} × ${b}, so it is a multiple of both.`);
    });

    PMLM.registerSkill({
      id: 'g4.multiples', grade: 4, unit: 'g4.u2', title: 'Multiples and factors', icon: '🔍',
      blurb: 'Find multiples and factors of numbers',
      lesson: [
        { title: 'Multiples',
          text: 'The multiples of 4 are the answers in the 4 times table: 4, 8, 12, 16, 20, …\nThey keep going forever: 44, 48, 100 and 400 are multiples of 4 too.',
          visual: { type: 'sequence', terms: ['4', '8', '12', '16', '20'], step: '+4' } },
        { title: 'Spotting multiples',
          text: 'Multiples of **2** end in 0, 2, 4, 6 or 8.\nMultiples of **5** end in 0 or 5.\nMultiples of **10** end in 0.\nMultiples of **25** end in 00, 25, 50 or 75.' },
        { title: 'Factors',
          text: 'A **factor** divides a number exactly, with nothing left over.\nThe factors of 12 are 1, 2, 3, 4, 6 and 12.\nThey come in pairs: 1 × 12, 2 × 6, 3 × 4.',
          visual: { type: 'array', rows: 3, cols: 4 } },
        { title: 'Worked example',
          text: 'Find all the factors of 18.\n**1.** Start with 1 × 18.\n**2.** 2 × 9 = 18.\n**3.** 3 × 6 = 18.\n**4.** 4 and 5 don\'t divide 18. The next is 6, which we already have, so stop.\nAnswer: **1, 2, 3, 6, 9, 18**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [multipleOf, multipleOf, nextMultiple],
          [multipleOf, nextMultiple, factorOf, factorOf, factorPair],
          [multipleOf, notFactor, factorPair, countFactors, commonMultiple],
        ], ctx);
      },
    });
  }

  /* 10 ── Two-step word problems */
  {
    const big = (L, a, b, c) => (L === 1 ? a : L === 2 ? b : c);

    const multSub = L => {
      const who = U.name(), p = R(...big(L, [2, 5], [3, 9], [4, 9])), e = R(...big(L, [3, 6], [4, 10], [12, 25])), tot = p * e, g = R(2, Math.max(3, Math.floor(tot * 0.7)));
      return num(`${who} buys ${p} packs of stickers. There are ${e} stickers in each pack. ${who} gives ${g} stickers to a friend.\nHow many stickers does ${who} have now?`, tot - g,
        ['Step 1: find how many stickers there are altogether. Step 2: take away the ones given away.', `Step 1: ${p} × ${e} = ${tot} stickers.`],
        `${p} × ${e} = ${tot}. Then ${tot} − ${g} = ${tot - g}. ${who} has ${tot - g} stickers.`);
    };
    const multAdd = L => {
      const p = R(...big(L, [2, 5], [3, 9], [4, 9])), e = R(...big(L, [3, 6], [4, 10], [12, 24])), x = R(...big(L, [2, 9], [5, 30], [15, 60]));
      return num(`A shop has ${p} boxes of apples with ${e} apples in each box. It also has ${x} loose apples.\nHow many apples does the shop have?`, p * e + x,
        ['Step 1: find how many apples are in the boxes. Step 2: add the loose apples.', `Step 1: ${p} × ${e} = ${p * e} apples in boxes.`],
        `${p} × ${e} = ${p * e}. Then ${p * e} + ${x} = ${p * e + x} apples.`);
    };
    const addDiv = L => {
      const k = R(...big(L, [2, 5], [3, 8], [4, 9])), q = R(...big(L, [2, 5], [3, 9], [5, 12])), tot = k * q, a = R(1, tot - 1), b = tot - a;
      return num(`${a} boys and ${b} girls are put into teams of ${q}.\nHow many teams are there?`, k,
        ['Step 1: find how many children there are altogether. Step 2: divide them into teams.', `Step 1: ${a} + ${b} = ${tot} children.`],
        `${a} + ${b} = ${tot}. Then ${tot} ÷ ${q} = ${k} teams.`);
    };
    const subDiv = L => {
      const who = U.name(), k = R(...big(L, [2, 5], [3, 6], [4, 9])), q = R(...big(L, [2, 5], [3, 9], [4, 10])), rest = k * q, s = R(...big(L, [1, 6], [3, 12], [5, 20])), t = rest + s;
      return num(`${who} baked ${t} cakes. ${s} of them were eaten. The rest are shared equally onto ${k} plates.\nHow many cakes go on each plate?`, q,
        ['Step 1: find how many cakes are left. Step 2: share them equally.', `Step 1: ${t} − ${s} = ${rest} cakes left.`],
        `${t} − ${s} = ${rest}. Then ${rest} ÷ ${k} = ${q} cakes on each plate.`);
    };
    const change = (L, ctx) => retry(() => {
      const c = cur(ctx), who = U.name();
      const n = R(...big(L, [2, 4], [2, 5], [2, 4])), p = R(...big(L, [2, 5], [3, 12], [12, 45])), note = pick(big(L, [20], [20, 50], [100, 200]));
      if (n * p >= note) return null;
      const item = pick(['books', 'pens', 'toy cars', 'notebooks']);
      return num(`${who} buys ${n} ${item} that cost ${money(c, p)} each. ${who} pays with a ${money(c, note)} note.\nHow much change does ${who} get?`, note - n * p,
        ['Step 1: find the total cost. Step 2: take it away from the money paid.', `Step 1: ${n} × ${money(c, p)} = ${money(c, n * p)}.`],
        `${n} × ${p} = ${n * p}. Then ${note} − ${n * p} = ${note - n * p}. The change is ${money(c, note - n * p)}.`, { prefix: c });
    });
    const bus = L => {
      const a = R(...big(L, [10, 25], [25, 60], [40, 90])), b = R(3, a - 3), c = R(...big(L, [2, 9], [5, 20], [8, 30]));
      return num(`A bus has ${a} people on it. At the next stop, ${b} people get off and ${c} people get on.\nHow many people are on the bus now?`, a - b + c,
        ['Step 1: take away the people who get off. Step 2: add the people who get on.', `Step 1: ${a} − ${b} = ${a - b} people.`],
        `${a} − ${b} = ${a - b}. Then ${a - b} + ${c} = ${a - b + c} people.`);
    };
    const divMult = (L, ctx) => {
      const c = cur(ctx), k = R(...big(L, [2, 5], [3, 6], [4, 8])), u = R(...big(L, [2, 5], [2, 9], [6, 15])), m = R(2, 9);
      if (m === k) return divMult(L, ctx);
      const item = u <= 5 ? pick(['pencils', 'stickers', 'apples', 'balloons']) : pick(['books', 'toy cars', 'T-shirts', 'board games']);
      return num(`${k} ${item} cost ${money(c, k * u)}. Each one costs the same.\nHow much do ${m} ${item} cost?`, m * u,
        ['Step 1: find the cost of one. Step 2: multiply by how many you want.', `Step 1: ${money(c, k * u)} ÷ ${k} = ${money(c, u)} for one.`],
        `${k * u} ÷ ${k} = ${u}, so one costs ${money(c, u)}. Then ${m} × ${u} = ${m * u}. They cost ${money(c, m * u)}.`, { prefix: c });
    };
    const saving = (L, ctx) => retry(() => {
      const c = cur(ctx), who = U.name(), a = R(5, 25), w = R(4, 9), cost = R(a * w + 10, a * w + 150);
      return num(`${who} saves ${money(c, a)} every week for ${w} weeks. A bike costs ${money(c, cost)}.\nHow much more money does ${who} need?`, cost - a * w,
        ['Step 1: find how much has been saved. Step 2: find the difference.', `Step 1: ${w} × ${money(c, a)} = ${money(c, a * w)} saved.`],
        `${w} × ${a} = ${a * w}. Then ${cost} − ${a * w} = ${cost - a * w}. ${who} needs ${money(c, cost - a * w)} more.`, { prefix: c });
    });
    const whichCalc = L => {
      const who = U.name(), p = R(3, 9), e = R(4, 12), g = R(2, p * e - 2);
      if (coin()) {
        return choice(`${who} buys ${p} packs of stickers with ${e} stickers in each pack, then gives ${g} stickers away.\nWhich calculation finds how many stickers ${who} has now?`,
          `${p} × ${e} − ${g}`, [`${p} + ${e} − ${g}`, `${p} × ${e} + ${g}`, `${p} × ${g} − ${e}`],
          ['First find the total number of stickers. Then think: does giving away make it bigger or smaller?', `${p} packs of ${e} means ${p} × ${e}.`],
          `${p} × ${e} gives the total. Giving ${g} away means subtract: ${p} × ${e} − ${g} = ${p * e - g}.`);
      }
      const k = R(3, 6), q = R(3, 8), tot = k * q, a = R(1, tot - 1), b = tot - a;
      return choice(`${a} boys and ${b} girls are put into teams of ${q}.\nWhich calculation finds the number of teams?`,
        `(${a} + ${b}) ÷ ${q}`, [`${a} + ${b} × ${q}`, `(${a} + ${b}) × ${q}`, `${a} + ${b} − ${q}`],
        ['First find how many children there are. Then split them into teams.', 'Splitting into equal teams means dividing.'],
        `Add to find all the children, then divide by ${q}: (${a} + ${b}) ÷ ${q} = ${k} teams. The brackets mean "do this first".`);
    };

    PMLM.registerSkill({
      id: 'g4.wordProblems', grade: 4, unit: 'g4.u2', title: 'Two-step problems', icon: '🧠',
      blurb: 'Solve two-step word problems with + − × ÷',
      lesson: [
        { title: 'Read it twice',
          text: 'Read the problem slowly. Ask:\n**What do I need to find?**\n**What numbers do I know?**' },
        { title: 'Two steps',
          text: 'Some problems need **two** calculations. Do the first step, then use its answer in the second step.\n3 packs of 8 pens and 5 more pens: 3 × 8 = 24, then 24 + 5 = **29**.',
          visual: { type: 'barModel', rows: [{ label: 'Packs', parts: 3, value: '8' }, { label: 'Extra', parts: 1, value: '5' }], total: '?' } },
        { title: 'Choose the operation',
          text: '**altogether, total** → add (or multiply equal groups)\n**left, difference, how many more** → subtract\n**groups of, each, rows of** → multiply\n**share, split equally** → divide' },
        { title: 'Does it make sense?',
          text: 'Check your answer. If you gave things away, should you have more or fewer?\nEstimate first so you can spot a silly answer.' },
        { title: 'Worked example',
          text: 'Sam buys 4 packs of stickers with 6 in each pack. He gives away 9 stickers. How many does he have now?\n**1.** Find the total: 4 × 6 = 24 stickers.\n**2.** Take away 9: 24 − 9 = 15.\nAnswer: **15 stickers**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [multSub, multAdd, bus, change, addDiv],
          [multSub, multAdd, addDiv, subDiv, change, divMult, whichCalc],
          [multSub, addDiv, subDiv, change, divMult, saving, whichCalc],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 3: Fractions, decimals and percentages ═══════════════════════
  PMLM.registerUnit({ id: 'g4.u3', grade: 4, name: 'Fractions & decimals', icon: '🍕' });

  const DN = {
    2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'],
    7: ['seventh', 'sevenths'], 8: ['eighth', 'eighths'], 9: ['ninth', 'ninths'], 10: ['tenth', 'tenths'], 12: ['twelfth', 'twelfths'],
    100: ['hundredth', 'hundredths'],
  };
  const dname = (n, d) => (n === 1 ? DN[d][0] : DN[d][1]);
  const tail = (n, d) => (U.gcd(n, d) > 1 && n % d !== 0 ? ` This is the same as ${U.fracS(n, d)}.` : '');
  const BASES = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6]];
  const BASES3 = BASES.concat([[1, 8], [3, 8], [5, 8], [7, 8], [3, 10], [7, 10]]);
  const EMOJI = ['🍪', '🍓', '⭐', '🍬', '🌸', '🍎'];

  /* 11 ── Equivalent fractions */
  {
    const eqBars = () => retry(() => {
      const [n, d] = pick(BASES), k = R(2, 4), D = d * k;
      if (D > 12) return null;
      return num(`The two bars are the same length. Find the missing number.\n${fr(n, d)} = {□/${D}}`, n * k,
        ['Equivalent fractions cover the same amount of the bar. Whatever you do to the bottom, do the same to the top.',
          `${d} × ${k} = ${D}, so the bottom was multiplied by ${k}.`],
        `${n} × ${k} = ${n * k}, so ${fr(n, d)} = ${fr(n * k, D)}.`,
        { visual: { type: 'fractionBar', bars: [{ parts: d, shaded: n, label: fr(n, d) }, { parts: D, shaded: 0, label: `{?/${D}}` }] } });
    });

    const eqMissing = L => retry(() => {
      const [n, d] = pick(L === 3 ? BASES3 : BASES), k = R(2, L === 3 ? 4 : 5), D = d * k, N = n * k;
      if (D > (L === 3 ? 24 : 20)) return null;
      const t = R(1, 4);
      if (t === 1) return num(`Find the missing number.\n${fr(n, d)} = {□/${D}}`, N,
        ['Whatever you do to the bottom, do the same to the top.', `${d} × ${k} = ${D}. So multiply the top by ${k} too.`],
        `${n} × ${k} = ${N}, so ${fr(n, d)} = ${fr(N, D)}.`);
      if (t === 2) return num(`Find the missing number.\n${fr(n, d)} = {${N}/□}`, D,
        ['Whatever you do to the top, do the same to the bottom.', `${n} × ${k} = ${N}. So multiply the bottom by ${k} too.`],
        `${d} × ${k} = ${D}, so ${fr(n, d)} = ${fr(N, D)}.`);
      if (t === 3) return num(`Find the missing number.\n${fr(N, D)} = {□/${d}}`, n,
        ['You can also divide the top and the bottom by the same number.', `${D} ÷ ${k} = ${d}. So divide the top by ${k} too.`],
        `${N} ÷ ${k} = ${n}, so ${fr(N, D)} = ${fr(n, d)}.`);
      return num(`Find the missing number.\n${fr(N, D)} = {${n}/□}`, d,
        ['You can also divide the top and the bottom by the same number.', `${N} ÷ ${k} = ${n}. So divide the bottom by ${k} too.`],
        `${D} ÷ ${k} = ${d}, so ${fr(N, D)} = ${fr(n, d)}.`);
    });

    const eqChoice = L => retry(() => {
      const [n, d] = pick(L === 3 ? BASES3 : BASES), k = R(2, 4);
      const wrongs = [[n + k, d + k], [n, d * k], [n * k, d], [n + 1, d + 1], [d, n]].filter(([a, b]) => a * d !== b * n && b > 1);
      if (wrongs.length < 3) return null;
      const w0 = wrongs[0];
      return choice(`Which fraction is equivalent to ${fr(n, d)}?`, fr(n * k, d * k), wrongs.map(x => fr(...x)),
        ['Equivalent fractions are made by multiplying (or dividing) the top and the bottom by the same number.',
          `Check ${fr(...w0)}: the top went from ${n} to ${w0[0]} and the bottom from ${d} to ${w0[1]}. Is that the same × for both?`],
        `${n} × ${k} = ${n * k} and ${d} × ${k} = ${d * k}, so ${fr(n, d)} = ${fr(n * k, d * k)}.`);
    });

    const notEq = () => retry(() => {
      const [n, d] = pick(BASES), ks = U.sample([2, 3, 4, 5], 3), k = R(1, 4), wrong = [n + k, d + k];
      if (wrong[0] * d === wrong[1] * n) return null;
      return choice(`Which fraction is **not** equal to ${fr(n, d)}?`, fr(...wrong), ks.map(j => fr(n * j, d * j)),
        ['Check each fraction: were the top and the bottom both multiplied by the same number?',
          `${fr(n * ks[0], d * ks[0])}: ${n} × ${ks[0]} = ${n * ks[0]} and ${d} × ${ks[0]} = ${d * ks[0]}. So that one is equal.`],
        `${fr(...wrong)} is not equal to ${fr(n, d)}: ${k} was added to the top and the bottom instead of multiplying. The others are all equal to ${fr(n, d)}.`);
    });

    const simplify = () => {
      const [n, d] = pick(BASES3), k = R(2, 5), N = n * k, D = d * k;
      return fracQ(`Write ${fr(N, D)} in its simplest form.`, n, d,
        ['Divide the top and the bottom by the same number. Keep going until you can\'t divide any more.',
          `${N} and ${D} are both in the ${k} times table.`],
        `${N} ÷ ${k} = ${n} and ${D} ÷ ${k} = ${d}. So ${fr(N, D)} = ${fr(n, d)}.`, { simplest: true });
    };

    const spotAdd = () => {
      const [n, d] = pick(BASES), k = R(2, 4), N = n * k, add = N - n, who = U.name();
      return num(`${who} added ${add} to the top and the bottom of ${fr(n, d)} and wrote ${fr(n, d)} = ${fr(N, d + add)}. That is wrong!\nWhat should the bottom number be?\n${fr(n, d)} = {${N}/□}`, d * k,
        ['Equivalent fractions come from multiplying, not adding.', `${n} × ${k} = ${N}, so the top was multiplied by ${k}.`],
        `Multiply the bottom by ${k} too: ${d} × ${k} = ${d * k}. So ${fr(n, d)} = ${fr(N, d * k)}.`);
    };

    PMLM.registerSkill({
      id: 'g4.equivFractions', grade: 4, unit: 'g4.u3', title: 'Equivalent fractions', icon: '🍫',
      blurb: 'Find fractions that are worth the same',
      lesson: [
        { title: 'Same amount, different names',
          text: 'These bars are the same length. The shaded parts are the same size.\nSo {1/2}, {2/4} and {4/8} are **equivalent**: they are worth the same.',
          visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '{1/2}' }, { parts: 4, shaded: 2, label: '{2/4}' }, { parts: 8, shaded: 4, label: '{4/8}' }] } },
        { title: 'Multiply the top and the bottom',
          text: 'Multiply the top (numerator) and the bottom (denominator) by the **same** number:\n{1/3} = {2/6} (both × 2)\n{1/3} = {3/9} (both × 3)',
          visual: { type: 'fractionBar', bars: [{ parts: 3, shaded: 1, label: '{1/3}' }, { parts: 6, shaded: 2, label: '{2/6}' }] } },
        { title: 'Divide the top and the bottom',
          text: 'You can also divide both by the same number: {6/8} = {3/4} (both ÷ 2).\nThis is called **simplifying**.\n**Careful:** never add the same number to the top and bottom. {1/2} is not {2/3}!' },
        { title: 'Worked example',
          text: 'Fill the box: {3/4} = {□/12}\n**1.** Look at the bottoms: 4 → 12 is × 3.\n**2.** Do the same to the top: 3 × 3 = 9.\nAnswer: {3/4} = **{9/12}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [eqBars, eqBars, eqBars],
          [eqBars, eqMissing, eqMissing, eqChoice],
          [eqMissing, eqMissing, eqChoice, notEq, simplify, spotAdd],
        ], ctx);
      },
    });
  }

  /* 12 ── Fractions of amounts */
  {
    const ofExplain = (n, d, amt) => (n === 1 ? `${amt} ÷ ${d} = ${amt / d}, so ${fr(1, d)} of ${amt} is ${amt / d}.`
      : `${amt} ÷ ${d} = ${amt / d}, and ${amt / d} × ${n} = ${amt / d * n}. So ${fr(n, d)} of ${amt} is ${amt / d * n}.`);
    const ofHints = (n, d, amt) => (n === 1
      ? [`To find ${fr(1, d)}, share into ${d} equal groups (divide by ${d}).`, `Work out ${amt} ÷ ${d}. Think: ${d} × what = ${amt}?`]
      : ['Divide by the bottom number, then multiply by the top number.', `${fr(1, d)} of ${amt} = ${amt} ÷ ${d} = ${amt / d}.`]);

    const unitOf = () => {
      const d = pick([2, 3, 4, 5, 10]), k = R(2, { 2: 10, 3: 6, 4: 5, 5: 4, 10: 2 }[d]), amt = d * k;
      return num(`What is ${fr(1, d)} of ${amt}?`, k, ofHints(1, d, amt), ofExplain(1, d, amt),
        { visual: { type: 'objects', groups: [amt], emoji: pick(EMOJI) } });
    };

    const nonUnit = L => retry(() => {
      const d = pick(L <= 2 ? [3, 4, 5, 10] : [3, 4, 5, 6, 8, 10]), n = R(2, d - 1), k = R(2, L <= 2 ? 8 : 12), amt = d * k;
      if (U.gcd(n, d) !== 1) return null;
      return num(`What is ${fr(n, d)} of ${amt}?`, n * k, ofHints(n, d, amt), ofExplain(n, d, amt),
        L <= 2 ? { visual: { type: 'barModel', rows: [{ label: '', parts: d }], total: String(amt) } } : undefined);
    });

    const word = (L, ctx) => retry(() => {
      const d = pick([2, 3, 4, 5, 8, 10]), n = L === 1 ? 1 : R(1, d - 1), k = R(2, L <= 2 ? 8 : 12), amt = d * k, who = U.name(), c = cur(ctx);
      if (U.gcd(n, d) !== 1) return null;
      const left = L === 3 && coin();
      const t = pick([
        [`${who} has ${money(c, amt)} and spends ${fr(n, d)} of it.`, left ? `How much money does ${who} have left?` : `How much does ${who} spend?`, { prefix: c }],
        [`There are ${amt} children in a class. ${fr(n, d)} of them walk to school.`, left ? 'How many children do not walk to school?' : 'How many children walk to school?', {}],
        [`A ribbon is ${amt} cm long. ${who} cuts off ${fr(n, d)} of it.`, left ? 'How much ribbon is left?' : 'How long is the piece that was cut off?', { unit: 'cm' }],
        [`A farmer has ${amt} sheep. ${fr(n, d)} of them are black.`, left ? 'How many sheep are not black?' : 'How many sheep are black?', {}],
      ]);
      const part = n * k, ans = left ? amt - part : part;
      return num(`${t[0]}\n${t[1]}`, ans,
        left ? ['Step 1: find the fraction of the amount. Step 2: take it away from the whole amount.', `Step 1: ${fr(1, d)} of ${amt} = ${amt} ÷ ${d} = ${k}.`]
          : ofHints(n, d, amt),
        left ? `${fr(n, d)} of ${amt} = ${part}. Then ${amt} − ${part} = ${ans}.` : ofExplain(n, d, amt), t[2]);
    });

    const reverse = () => {
      const d = pick([2, 3, 4, 5, 10]), k = R(2, 12);
      return num(`${fr(1, d)} of a number is ${k}. What is the number?`, d * k,
        [`The whole number is made of ${d} equal parts, and each part is ${k}.`, `So the whole is ${d} lots of ${k}.`],
        `${d} × ${k} = ${d * k}. Check: ${fr(1, d)} of ${d * k} is ${k}.`,
        { visual: { type: 'barModel', rows: [{ label: '', parts: d, value: '' }], total: '?' } });
    };

    const spot = () => retry(() => {
      const d = pick([3, 4, 5, 6, 8, 10]), n = R(2, d - 1), k = R(2, 10), amt = d * k, who = U.name();
      if (U.gcd(n, d) !== 1) return null;
      return num(`${who} says ${fr(n, d)} of ${amt} is ${k}.\nWhat is the correct answer?`, n * k,
        [`${who} only found ${fr(1, d)}. You also need to multiply by the top number.`, `${amt} ÷ ${d} = ${k}. That is one ${DN[d][0]}.`],
        ofExplain(n, d, amt));
    });

    const compare = () => retry(() => {
      const d1 = pick([2, 3, 4, 5]), d2 = pick([3, 4, 5, 10]), k1 = R(2, 10), k2 = coin(0.25) ? k1 : R(2, 10);
      if (d1 === d2) return null;
      const s1 = `${fr(1, d1)} of ${d1 * k1}`, s2 = `${fr(1, d2)} of ${d2 * k2}`;
      const ans = k1 === k2 ? 'They are the same' : k1 > k2 ? s1 : s2;
      return choice(`Which is more: ${s1} or ${s2}?`, ans, [s1, s2, 'They are the same'],
        ['Work out each one, then compare.', `${s1} = ${d1 * k1} ÷ ${d1} = ${k1}.`],
        `${s1} = ${k1} and ${s2} = ${k2}. ${k1 === k2 ? 'They are the same.' : `${ans} is more.`}`, null, 3);
    });

    PMLM.registerSkill({
      id: 'g4.fractionOf', grade: 4, unit: 'g4.u3', title: 'Fractions of amounts', icon: '🍪',
      blurb: 'Find a fraction of a number, like three quarters of 20',
      lesson: [
        { title: 'One part',
          text: 'To find {1/4} of 12, share 12 into **4 equal groups**.\nOne group is {1/4}. There are 3 in each group, so {1/4} of 12 = **3**.',
          visual: { type: 'objects', groups: [3, 3, 3, 3], emoji: '🍪' } },
        { title: 'Divide by the bottom number',
          text: 'The bottom number tells you how many equal parts to make.\n{1/5} of 30 = 30 ÷ 5 = **6**\n{1/10} of 70 = 70 ÷ 10 = **7**' },
        { title: 'More than one part',
          text: '{3/4} of 12 means 3 of the 4 parts.\nFirst find {1/4}: 12 ÷ 4 = 3. Then 3 parts: 3 × 3 = **9**.\n**Tip:** divide by the bottom, times by the top.',
          visual: { type: 'barModel', rows: [{ label: '12', parts: 4, value: '3' }] } },
        { title: 'Worked example',
          text: 'Find {2/5} of 35.\n**1.** Divide by the bottom number: 35 ÷ 5 = 7.\n**2.** Multiply by the top number: 7 × 2 = 14.\nAnswer: **14**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [unitOf, unitOf, unitOf, word],
          [unitOf, nonUnit, nonUnit, word, word],
          [nonUnit, nonUnit, word, word, reverse, spot, compare],
        ], ctx);
      },
    });
  }

  /* 13 ── Adding and subtracting fractions with the same denominator */
  {
    const DENS = [4, 5, 6, 7, 8, 9, 10, 12];
    const bars2 = (a, b, d) => ({ type: 'fractionBar', bars: [{ parts: d, shaded: a, label: fr(a, d) }, { parts: d, shaded: b, label: fr(b, d) }] });

    const addF = L => retry(() => {
      const d = pick(L === 1 ? [4, 5, 6, 8, 10] : DENS), a = R(1, d - 2), b = R(1, d - 1 - a);
      return fracQ(`Work out ${fr(a, d)} + ${fr(b, d)}`, a + b, d,
        ['The bottom numbers are the same, so add the top numbers. The bottom number stays the same.',
          `${a} ${dname(a, d)} + ${b} ${dname(b, d)} makes some ${DN[d][1]}, so the bottom number stays ${d}.`],
        `${a} + ${b} = ${a + b}, so ${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, d)}.${tail(a + b, d)}`,
        L === 1 ? { visual: bars2(a, b, d) } : undefined);
    });

    const subF = L => retry(() => {
      const d = pick(L === 1 ? [4, 5, 6, 8, 10] : DENS), a = R(2, d - 1), b = R(1, a - 1);
      return fracQ(`Work out ${fr(a, d)} − ${fr(b, d)}`, a - b, d,
        ['The bottom numbers are the same, so subtract the top numbers. The bottom number stays the same.',
          `${a} ${dname(a, d)} take away ${b} ${dname(b, d)} leaves some ${DN[d][1]}, so the bottom number stays ${d}.`],
        `${a} − ${b} = ${a - b}, so ${fr(a, d)} − ${fr(b, d)} = ${fr(a - b, d)}.${tail(a - b, d)}`,
        L === 1 ? { visual: { type: 'fractionBar', bars: [{ parts: d, shaded: a, label: fr(a, d) }] } } : undefined);
    });

    const makeWhole = () => {
      const d = pick(DENS), a = R(1, d - 1), b = d - a;
      return num(`Work out ${fr(a, d)} + ${fr(b, d)}`, 1,
        ['Add the top numbers. Keep the bottom number the same.', `${a} + ${b} = ${d}, so you get ${fr(d, d)}. How many wholes is that?`],
        `${fr(a, d)} + ${fr(b, d)} = ${fr(d, d)}, and ${fr(d, d)} is 1 whole. The answer is 1.`);
    };

    const oneMinus = () => {
      const d = pick(DENS), a = R(1, d - 1);
      return fracQ(`Work out 1 − ${fr(a, d)}`, d - a, d,
        ['Write 1 whole as a fraction with the same bottom number.', `1 = ${fr(d, d)}. Now work out ${fr(d, d)} − ${fr(a, d)}.`],
        `1 = ${fr(d, d)}, and ${d} − ${a} = ${d - a}. So 1 − ${fr(a, d)} = ${fr(d - a, d)}.${tail(d - a, d)}`);
    };

    const missing = () => {
      const d = pick(DENS), a = R(1, d - 2), c = R(a + 1, d - 1);
      if (coin()) return num(`Find the missing number.\n${fr(a, d)} + {□/${d}} = ${fr(c, d)}`, c - a,
        ['The bottom numbers are all the same, so just think about the top numbers.', `${a} + □ = ${c}.`],
        `${a} + ${c - a} = ${c}, so the missing number is ${c - a}.`);
      return num(`Find the missing number.\n${fr(c, d)} − {□/${d}} = ${fr(a, d)}`, c - a,
        ['The bottom numbers are all the same, so just think about the top numbers.', `${c} − □ = ${a}.`],
        `${c} − ${c - a} = ${a}, so the missing number is ${c - a}.`);
    };

    const three = () => {
      const d = pick([7, 8, 9, 10, 12]), a = R(1, d - 3), b = R(1, d - 2 - a);
      if (coin()) {
        const c = R(1, d - 1 - a - b);
        return fracQ(`Work out ${fr(a, d)} + ${fr(b, d)} + ${fr(c, d)}`, a + b + c, d,
          ['Add the top numbers. The bottom number stays the same.', `${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, d)}.`],
          `${a} + ${b} + ${c} = ${a + b + c}, so the answer is ${fr(a + b + c, d)}.${tail(a + b + c, d)}`);
      }
      const c = R(1, a + b - 1);
      return fracQ(`Work out ${fr(a, d)} + ${fr(b, d)} − ${fr(c, d)}`, a + b - c, d,
        ['Work from left to right. Only the top numbers change.', `${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, d)}.`],
        `${a} + ${b} − ${c} = ${a + b - c}, so the answer is ${fr(a + b - c, d)}.${tail(a + b - c, d)}`);
    };

    const word = L => retry(() => {
      const d = pick([4, 5, 6, 8, 10, 12]), [p, q] = names(2), a = R(1, d - 2), b = R(1, d - 1 - a);
      const food = pick(['pizza', 'cake', 'pie', 'chocolate bar']);
      const story = `${p} ate ${fr(a, d)} of a ${food}. ${q} ate ${fr(b, d)} of the same ${food}.`;
      const t = L === 3 ? pick(['left', 'total', 'more']) : pick(['total', 'more']);
      if (t === 'left') return fracQ(`${story}\nWhat fraction of the ${food} is left?`, d - a - b, d,
        ['Step 1: add the fractions that were eaten. Step 2: take that away from 1 whole.', `Step 1: ${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, d)} was eaten.`],
        `${fr(a + b, d)} was eaten. 1 whole = ${fr(d, d)}, so ${fr(d, d)} − ${fr(a + b, d)} = ${fr(d - a - b, d)} is left.${tail(d - a - b, d)}`);
      if (t === 'total') return fracQ(`${story}\nWhat fraction of the ${food} did they eat altogether?`, a + b, d,
        ['"Altogether" means add. The bottom number stays the same.', `Add the top numbers: ${a} + ${b}.`],
        `${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, d)}.${tail(a + b, d)}`);
      if (a === b) return null;
      const [x, y, nx, ny] = a > b ? [a, b, p, q] : [b, a, q, p];
      return fracQ(`${story}\nHow much more of the ${food} did ${nx} eat than ${ny}?`, x - y, d,
        ['"How much more" means find the difference: subtract.', `Subtract the top numbers: ${x} − ${y}.`],
        `${fr(x, d)} − ${fr(y, d)} = ${fr(x - y, d)}.${tail(x - y, d)}`);
    });

    const spot = () => {
      const d = pick([3, 4, 5, 6, 7, 8, 9, 10]), a = R(1, d - 2), b = R(1, d - 1 - a), who = U.name();
      return fracQ(`${who} says ${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, 2 * d)}.\nWhat is the correct answer?`, a + b, d,
        ['When the bottom numbers are the same, you only add the top numbers.', `${who} added the bottom numbers too: ${d} + ${d} = ${2 * d}. The bottom number should stay ${d}.`],
        `${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, d)}. The parts are still ${DN[d][1]}, so the bottom number does not change.${tail(a + b, d)}`);
    };

    PMLM.registerSkill({
      id: 'g4.addFractions', grade: 4, unit: 'g4.u3', title: 'Add & subtract fractions', icon: '➕',
      blurb: 'Add and subtract fractions with the same denominator',
      lesson: [
        { title: 'Same-size parts',
          text: '{2/7} + {3/7}: all the parts are **sevenths**, so they are the same size.\n2 sevenths + 3 sevenths = 5 sevenths = **{5/7}**.',
          visual: { type: 'fractionBar', bars: [{ parts: 7, shaded: 2, label: '{2/7}' }, { parts: 7, shaded: 3, label: '{3/7}' }, { parts: 7, shaded: 5, label: '{5/7}' }] } },
        { title: 'Only the top changes',
          text: 'Add or subtract the **top** numbers. The **bottom** number stays the same.\n{5/8} − {2/8} = {3/8}\n**Careful:** {2/7} + {3/7} is NOT {5/14}. Don\'t add the bottoms!' },
        { title: 'Making a whole',
          text: '{3/5} + {2/5} = {5/5}, which is **1 whole**.\nTo work out 1 − {1/4}, write 1 as {4/4}: {4/4} − {1/4} = **{3/4}**.',
          visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 5, label: '{5/5}' }] } },
        { title: 'Worked example',
          text: 'Work out {7/10} − {3/10}.\n**1.** The bottom numbers are the same: tenths.\n**2.** Subtract the tops: 7 − 3 = 4.\n**3.** Keep the bottom: 10.\nAnswer: **{4/10}** (which is the same as {2/5})' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [addF, addF, addF, subF],
          [addF, subF, subF, makeWhole, oneMinus, word],
          [addF, subF, oneMinus, missing, three, word, spot],
        ], ctx);
      },
    });
  }

  /* 14 ── Tenths and hundredths as decimals */
  {
    const D2 = x => F(U.round(x, 2));
    const tenthsBar = () => {
      const k = R(1, 9);
      return num('What decimal is shaded?', k / 10,
        ['The bar is split into 10 equal parts. Each part is one tenth, which is 0.1.', 'Count the shaded parts in tenths: 0.1, 0.2, 0.3, …'],
        `${k} out of 10 parts are shaded: ${fr(k, 10)} = ${dec1(k)}.`,
        { visual: { type: 'fractionBar', bars: [{ parts: 10, shaded: k }] } });
    };

    const fracToDec = L => {
      if (L === 1 || coin(0.3)) {
        const k = R(1, 9);
        return num(`Write ${fr(k, 10)} as a decimal.`, k / 10,
          ['Tenths go in the first place after the decimal point.', `${fr(k, 10)} is 0 ones and ${k} ${dname(k, 10)}.`],
          `${fr(k, 10)} = ${dec1(k)}.`);
      }
      const k = coin(0.35) ? R(1, 9) : retry(() => { const x = R(11, 99); return x % 10 ? x : null; });
      const v = U.round(k / 100, 2);
      return num(`Write ${fr(k, 100)} as a decimal.`, v,
        ['Tenths go in the first place after the point. Hundredths go in the second place.',
          k < 10 ? `${fr(k, 100)} has 0 tenths and ${k} ${dname(k, 100)}.` : `${fr(k, 100)} is ${Math.floor(k / 10)} tenths and ${k % 10} ${dname(k % 10, 100)}.`],
        `${fr(k, 100)} = ${D2(v)}.${k < 10 ? ` (Not 0.${k}: that would be ${k} tenths.)` : ''}`);
    };

    const decToFrac = L => {
      const t = L === 2 ? R(1, 2) : R(1, 4);
      if (t === 1) {
        const k = retry(() => { const x = R(11, 99); return x % 10 ? x : null; }), v = U.round(k / 100, 2);
        return num(`Find the missing number.\n${D2(v)} = {□/100}`, k,
          ['The first digit after the point is tenths; the second is hundredths. 1 tenth = 10 hundredths.',
            `${D2(v)} is ${Math.floor(k / 10)} tenths and ${k % 10} hundredths. ${Math.floor(k / 10)} tenths = ${Math.floor(k / 10) * 10} hundredths.`],
          `${D2(v)} is ${k} hundredths, so ${D2(v)} = ${fr(k, 100)}.`);
      }
      if (t === 2) {
        const k = R(1, 9);
        return num(`Find the missing number.\n${dec1(k)} = {□/10}`, k,
          ['The first digit after the point shows tenths.', `Look at the digit straight after the point in ${dec1(k)}.`],
          `${dec1(k)} is ${k} ${dname(k, 10)}, so ${dec1(k)} = ${fr(k, 10)}.`);
      }
      if (t === 3) {
        const k = R(1, 9);
        return num(`Find the missing number.\n${dec1(k)} = {□/100}`, 10 * k,
          ['1 tenth is the same as 10 hundredths.', `${dec1(k)} is ${k} ${dname(k, 10)}. Each tenth is 10 hundredths.`],
          `${k} tenths = ${10 * k} hundredths, so ${dec1(k)} = ${fr(10 * k, 100)}.`);
      }
      const k = R(1, 9), v = U.round(k / 100, 2);
      return num(`Find the missing number.\n${D2(v)} = {□/100}`, k,
        ['The second digit after the point shows hundredths.', `${D2(v)} has 0 tenths.`],
        `${D2(v)} is ${k} ${dname(k, 100)}, so ${D2(v)} = ${fr(k, 100)}.`);
    };

    const digitValue = () => {
      const [a, b, c] = U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3), x = `${a}.${b}${c}`, w = R(0, 2), d = [a, b, c][w];
      const nm = (word1, word) => `${d} ${d === 1 ? word1 : word}`;
      const opts = [nm('one', 'ones'), nm('ten', 'tens'), nm('tenth', 'tenths'), nm('hundredth', 'hundredths')];
      const ans = [opts[0], opts[2], opts[3]][w];
      return choice(`What is the **${d}** worth in ${x}?`, ans, opts,
        ['The first digit after the point is tenths. The second digit after the point is hundredths.',
          'Find the digit in the chart and read the letter above it: O = ones, t = tenths, h = hundredths.'],
        `In ${x} the ${d} is in the ${['ones', 'tenths', 'hundredths'][w]} place, so it is worth ${ans}.`,
        { visual: { type: 'placeValue', value: x } });
    };

    const div10 = () => {
      const by = pick([10, 100]), n = coin() ? R(1, 9) : retry(() => { const x = R(11, 99); return x % 10 ? x : null; });
      const v = U.round(n / by, 2);
      return num(`Work out ${n} ÷ ${by}`, v,
        ['Dividing by 10 moves every digit 1 place to the right. Dividing by 100 moves every digit 2 places.',
          `The ones digit ${n % 10} moves to the ${by === 10 ? 'tenths' : 'hundredths'} place.`],
        `${n} ÷ ${by} = ${D2(v)}.`);
    };

    const partitionD = () => {
      const a = R(1, 9), b = R(1, 9), c = R(1, 9), v = U.round(a + b / 10 + c / 100, 2);
      if (coin()) return num(`Write this as one number.\n${a} + ${dec1(b)} + ${D2(c / 100)}`, v,
        ['Each part goes in its own place: ones, tenths, hundredths.', `${a} is the ones digit and ${dec1(b)} gives ${b} ${dname(b, 10)}.`],
        `${a} ${a === 1 ? 'one' : 'ones'}, ${b} ${dname(b, 10)} and ${c} ${dname(c, 100)} make ${D2(v)}.`);
      return num(`Write this as a decimal.\n${a} + ${fr(b, 10)} + ${fr(c, 100)}`, v,
        ['Each part goes in its own place: ones, tenths, hundredths.', `${fr(b, 10)} is ${b} ${dname(b, 10)}, so the first digit after the point is ${b}.`],
        `${a} ${a === 1 ? 'one' : 'ones'}, ${b} ${dname(b, 10)} and ${c} ${dname(c, 100)} make ${D2(v)}.`);
    };

    const spotD = () => {
      const k = R(1, 9), who = U.name();
      return num(`${who} writes ${fr(k, 100)} as 0.${k}.\nWhat should it be?`, U.round(k / 100, 2),
        [`0.${k} means ${k} ${dname(k, 10)}. Hundredths go in the second place after the point.`, `${fr(k, 100)} has 0 tenths and ${k} ${dname(k, 100)}.`],
        `${fr(k, 100)} = ${D2(k / 100)}. A 0 must hold the tenths place.`);
    };

    PMLM.registerSkill({
      id: 'g4.decimals', grade: 4, unit: 'g4.u3', title: 'Tenths and hundredths', icon: '🔟',
      blurb: 'Write tenths and hundredths as decimals',
      lesson: [
        { title: 'Tenths',
          text: 'Split 1 whole into **10** equal parts. Each part is {1/10}, which we write as **0.1**.\n3 parts shaded = {3/10} = **0.3**',
          visual: { type: 'fractionBar', bars: [{ parts: 10, shaded: 3 }] } },
        { title: 'Hundredths',
          text: 'Split 1 whole into **100** equal parts. Each part is {1/100} = **0.01**.\n{7/100} = 0.07 (0 tenths, 7 hundredths)\n{23/100} = 0.23 (2 tenths, 3 hundredths)',
          visual: { type: 'placeValue', value: '0.23' } },
        { title: 'Places after the point',
          text: '4.36 has 4 ones, 3 tenths and 6 hundredths.\nThe decimal point separates the whole numbers from the parts.\n**Tip:** ÷ 10 moves digits 1 place right: 7 ÷ 10 = 0.7. ÷ 100 moves them 2 places: 7 ÷ 100 = 0.07',
          visual: { type: 'placeValue', value: '4.36' } },
        { title: 'Worked example',
          text: 'Write {47/100} as a decimal.\n**1.** 47 hundredths = 4 tenths and 7 hundredths.\n**2.** There are 0 ones, so write 0 and then the point.\n**3.** Tenths digit 4, hundredths digit 7.\nAnswer: **0.47**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [tenthsBar, tenthsBar, fracToDec, fracToDec],
          [tenthsBar, fracToDec, fracToDec, decToFrac, digitValue],
          [fracToDec, decToFrac, digitValue, div10, partitionD, spotD],
        ], ctx);
      },
    });
  }

  /* 15 ── Percentages as parts of 100 */
  {
    const FR = { 50: [1, 2], 25: [1, 4], 10: [1, 10] };
    const shadedQ = L => {
      const t = L === 1 ? pick(['tenths', 'tenths', 'half', 'quarter']) : pick(['tenths', 'quarter', 'notShaded', 'notShaded']);
      let parts, k, not = false;
      if (t === 'half') { parts = 2; k = 1; }
      else if (t === 'quarter') { parts = 4; k = L === 1 ? 1 : pick([1, 3]); }
      else { parts = 10; k = R(1, 9); not = t === 'notShaded'; }
      const each = 100 / parts, ans = not ? 100 - k * each : k * each;
      return num(`What percentage of the bar is ${not ? '**not** shaded' : 'shaded'}?`, ans,
        ['The whole bar is 100%. Work out what one part is worth.', `There are ${parts} equal parts. Together they make 100%, so one part is 100 ÷ ${parts} per cent.`],
        not ? `${k} parts are shaded, so ${parts - k} parts are not. ${parts - k} × ${each}% = ${ans}%.` : `${k} ${k === 1 ? 'part is' : 'parts are'} shaded. ${k} × ${each}% = ${ans}%.`,
        { unit: '%', visual: { type: 'fractionBar', bars: [{ parts, shaded: k }] } });
    };

    const pctFrac = () => {
      if (coin(0.6)) {
        const p = pick([50, 25, 10]), [n, d] = FR[p];
        const wrong = { 50: [fr(1, 50), fr(1, 5), fr(1, 4)], 25: [fr(1, 25), fr(2, 5), fr(1, 2)], 10: [fr(1, 100), fr(1, 5), fr(1, 4)] }[p];
        return choice(`Which fraction is the same as ${p}%?`, fr(n, d), wrong,
          ['Per cent means "out of 100". Write the percentage as a fraction out of 100 first.', `${p}% = ${fr(p, 100)}. Now simplify it.`],
          `${p}% = ${fr(p, 100)} = ${fr(n, d)}.`);
      }
      const k = retry(() => { const x = R(11, 99); return x % 10 ? x : null; }), ex = k === 9 ? 3 : 9;
      const dig = String(k).split('');
      return choice(`Which fraction is the same as ${k}%?`, fr(k, 100), [fr(k, 10), fr(1, k), fr(+dig[0], +dig[1] || 10)],
        ['Per cent means "out of 100".', `For example, ${ex}% means ${ex} out of 100, which is ${fr(ex, 100)}.`],
        `${k}% means ${k} out of 100, so ${k}% = ${fr(k, 100)}.`);
    };

    const pctOf = L => {
      const p = pick([50, 25, 10]), big = L === 3;
      const x = p === 50 ? 2 * R(5, big ? 100 : 40) : p === 25 ? 4 * R(3, big ? 50 : 25) : 10 * R(2, big ? 90 : 30);
      const ans = x * p / 100, d = 100 / p;
      return num(`What is ${p}% of ${F(x)}?`, ans,
        [`${p}% is the same as ${fr(1, d)}.`,
          p === 50 ? `To find ${fr(1, 2)}, halve the number: ${F(x)} ÷ 2.` : p === 25 ? `To find ${fr(1, 4)}, halve and halve again. Half of ${F(x)} is ${F(x / 2)}.` : `To find ${fr(1, 10)}, divide by 10: every digit moves one place to the right.`],
        `${p}% = ${fr(1, d)}. ${F(x)} ÷ ${d} = ${F(ans)}.`);
    };

    const word = (L, ctx) => {
      const c = cur(ctx), who = U.name(), k = R(1, 4);
      if (k === 1) {
        const n = pick([20, 40, 60, 80, 100]), p = pick([10, 25, 50]), ans = n * p / 100;
        return num(`There are ${n} children in a school club. ${p}% of them have a pet cat.\nHow many children have a pet cat?`, ans,
          [`${p}% is the same as ${fr(...FR[p])}.`, `Find ${fr(...FR[p])} of ${n}: work out ${n} ÷ ${100 / p}.`],
          `${p}% of ${n} = ${n} ÷ ${100 / p} = ${ans} children.`);
      }
      if (k === 2) {
        const p = pick([10, 25, 50]), price = p === 10 ? 10 * R(2, 15) : 4 * R(5, 25), off = price * p / 100;
        const sale = L === 3 && coin();
        return num(`A coat costs ${money(c, price)}. In a sale there is ${p}% off.\n${sale ? 'How much does the coat cost in the sale?' : 'How much money do you save?'}`, sale ? price - off : off,
          sale ? ['Step 1: find how much money comes off. Step 2: take it away from the price.', `Step 1: ${p}% of ${money(c, price)} = ${money(c, price)} ÷ ${100 / p} = ${money(c, off)} off.`]
            : [`${p}% is the same as ${fr(...FR[p])}.`, `Find ${fr(...FR[p])} of ${money(c, price)}: work out ${price} ÷ ${100 / p}.`],
          sale ? `${p}% of ${price} = ${off}. ${price} − ${off} = ${price - off}. The sale price is ${money(c, price - off)}.` : `${p}% of ${price} = ${price} ÷ ${100 / p} = ${off}. You save ${money(c, off)}.`,
          { prefix: c });
      }
      if (k === 3) {
        const qn = pick([20, 40, 60, 80]), p = pick([25, 50]);
        return num(`A test has ${qn} questions. ${who} gets ${p}% of them right.\nHow many questions does ${who} get right?`, qn * p / 100,
          [`${p}% is the same as ${fr(...FR[p])}.`, `Find ${fr(...FR[p])} of ${qn}: work out ${qn} ÷ ${100 / p}.`],
          `${p}% of ${qn} = ${qn} ÷ ${100 / p} = ${qn * p / 100} questions.`);
      }
      const b = retry(() => { const x = R(11, 89); return x % 10 ? x : null; });
      return num(`A grid has 100 squares. ${b} of the squares are blue.\nWhat percentage of the squares are **not** blue?`, 100 - b,
        ['The whole grid is 100%, and each square is 1%.', `${b} squares are blue, so ${b}% is blue.`],
        `100% − ${b}% = ${100 - b}%.`, { unit: '%' });
    };

    const compare = () => retry(() => {
      const mk = () => { const p = pick([10, 25, 50]), x = p === 10 ? 10 * R(2, 12) : p === 25 ? 4 * R(3, 25) : 2 * R(5, 40); return [p, x, x * p / 100]; };
      const [p1, x1, v1] = mk(), [p2, x2, v2] = mk();
      if (p1 === p2) return null;
      if (Math.abs(v1 - v2) > 10) return null;
      const s1 = `${p1}% of ${x1}`, s2 = `${p2}% of ${x2}`, ans = v1 === v2 ? 'They are the same' : v1 > v2 ? s1 : s2;
      return choice(`Which is more: ${s1} or ${s2}?`, ans, [s1, s2, 'They are the same'],
        ['Work out each one, then compare.', `${s1} = ${x1} ÷ ${100 / p1} = ${v1}.`],
        `${s1} = ${v1} and ${s2} = ${v2}. ${v1 === v2 ? 'They are the same.' : `${ans} is more.`}`, null, 3);
    });

    PMLM.registerSkill({
      id: 'g4.percentages', grade: 4, unit: 'g4.u3', title: 'Percentages', icon: '💯',
      blurb: 'Understand 50%, 25% and 10% as parts of 100',
      lesson: [
        { title: 'Per cent means "out of 100"',
          text: '**%** means **per cent**, which means "out of 100".\n30% means 30 out of every 100.\nThe whole thing is **100%**. This bar has 10 parts, so each part is 10%. 3 parts = **30%**.',
          visual: { type: 'fractionBar', bars: [{ parts: 10, shaded: 3 }] } },
        { title: 'Fractions and percentages',
          text: '50% = {50/100} = **{1/2}** (a half)\n25% = {25/100} = **{1/4}** (a quarter)\n10% = {10/100} = **{1/10}** (a tenth)',
          visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '50%' }, { parts: 4, shaded: 1, label: '25%' }, { parts: 10, shaded: 1, label: '10%' }] } },
        { title: 'Percentages of amounts',
          text: '**50%** of 40: halve it → 20\n**25%** of 40: halve, then halve again → 10\n**10%** of 40: divide by 10 → 4' },
        { title: 'Worked example',
          text: 'Find 25% of 60.\n**1.** 25% is the same as {1/4}.\n**2.** Halve 60: 30.\n**3.** Halve again: 15.\nAnswer: **15**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [shadedQ, shadedQ, shadedQ, pctFrac],
          [shadedQ, pctFrac, pctOf, pctOf, word],
          [shadedQ, pctOf, pctOf, word, word, compare],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 4: Measure and geometry ═══════════════════════
  PMLM.registerUnit({ id: 'g4.u4', grade: 4, name: 'Measure and shape', icon: '📏' });

  /* 16 ── Time: 12- and 24-hour clocks, timetables, durations */
  {
    const t24 = (h, m) => `${pad(h)}:${pad(m)}`;
    const t12 = (h, m) => `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'a.m.' : 'p.m.'}`;
    const tm = mins => t24(Math.floor(mins / 60), mins % 60);

    const readClock = L => retry(() => {
      const h = R(1, 12), m = L === 1 ? 5 * R(1, 11) : coin() ? 5 * R(1, 11) : R(1, 59);
      if (m % 5 === 0 && L > 1 && coin(0.5)) return null; // more single-minute times at L2+
      const ans = `${h}:${pad(m)}`, nextH = (h % 12) + 1, prevH = ((h + 10) % 12) + 1;
      const wrongs = [m >= 30 ? `${nextH}:${pad(m)}` : `${prevH}:${pad(m)}`];
      if (m % 5 === 0) wrongs.push(`${h}:${pad(m / 5)}`);
      wrongs.push(`${h}:${pad(60 - m)}`);
      const near = Math.round(m / 5) % 12 || 12;
      wrongs.push(`${near}:${pad((h % 12) * 5)}`);
      return choice('What time does the clock show?', ans, wrongs,
        ['The short hand shows the hour. The long hand shows the minutes: each number on the clock is 5 minutes.',
          m % 5 === 0 ? `The long hand points at the ${m / 5}. Count in 5s from the 12: 5, 10, 15, …`
            : `The long hand is just past the ${Math.floor(m / 5) || 12}. Count in 5s to the ${Math.floor(m / 5) || 12}, then count on the small marks.`],
        `The short hand has gone past the ${h} but has not reached the ${nextH}, so the hour is ${h}. The long hand shows ${m} minutes past. The time is ${ans}.`,
        { visual: { type: 'clock', h, m } });
    });

    const to24 = L => retry(() => {
      if (L === 3 && coin(0.25)) {
        const noon = coin(), m = 5 * R(1, 11);
        const ans = noon ? t24(12, m) : t24(0, m);
        return choice(`Write ${12}:${pad(m)} ${noon ? 'p.m.' : 'a.m.'} in 24-hour time.`, ans, noon ? [t24(0, m), `24:${pad(m)}`, t24(13, m)] : [t24(12, m), `24:${pad(m)}`, t24(1, m)],
          ['12 p.m. is noon (midday). 12 a.m. is midnight, the start of the day.', noon ? 'Noon is halfway through the day, so it is not 00 or 24.' : 'In 24-hour time the day starts at 00:00.'],
          noon ? `12:${pad(m)} p.m. is just after noon, which is ${ans} in 24-hour time.` : `12:${pad(m)} a.m. is just after midnight, which is ${ans} in 24-hour time.`);
      }
      const pm = coin(0.7), h12 = R(1, 11), m = 5 * R(0, 11), h = pm ? h12 + 12 : h12, ans = t24(h, m);
      const wrongs = pm ? [t24(h12, m), t24(h12 + 10, m), t24(h12 + 11, m)] : [t24(h12 + 12, m), t24(h12 + 10, m), t24(h12 + 1, m)];
      return choice(`Write ${t12(h, m)} in 24-hour time.`, ans, wrongs,
        ['For p.m. times (afternoon and evening), add 12 to the hours. For a.m. times, keep the hours the same and use two digits.',
          `The minutes stay the same: :${pad(m)}. Now work out the hours. Is it a.m. or p.m.?`],
        pm ? `${t12(h, m)} is in the afternoon or evening, so add 12 to the hours: ${h12} + 12 = ${h}. It is ${ans}.`
          : `${t12(h, m)} is in the morning, so the hours stay the same. In 24-hour time it is ${ans}.`);
    });

    const to12 = () => {
      const h = R(13, 23), m = 5 * R(0, 11), ans = t12(h, m);
      return choice(`What is ${t24(h, m)} in 12-hour time?`, ans,
        [`${h - 10}:${pad(m)} p.m.`, `${h - 12}:${pad(m)} a.m.`, `${h - 11}:${pad(m)} p.m.`],
        ['If the hours are more than 12, take away 12 and write p.m.', `The minutes stay the same: :${pad(m)}. Now work out ${h} − 12.`],
        `${h} − 12 = ${h - 12}, so ${t24(h, m)} is the same as ${ans}`);
    };

    const duration = L => retry(() => {
      const sh = R(8, 17), sm = 5 * R(4, 11);
      const dur = 5 * R(Math.ceil((65 - sm) / 5), L === 2 ? 11 : 24);
      const end = sh * 60 + sm + dur, eh = Math.floor(end / 60), em = end % 60;
      if (dur > 120) return null;
      const segs = [`${60 - sm} minutes to ${t24(sh + 1, 0)}`];
      const nums = [60 - sm];
      if (eh === sh + 2) { segs.push(`60 minutes to ${t24(sh + 2, 0)}`); nums.push(60); }
      if (em) { segs.push(`${em} more minutes to ${t24(eh, em)}`); nums.push(em); }
      const what = pick([['A lesson starts', 'the lesson'], ['A film starts', 'the film'], ['Swimming practice starts', 'swimming practice'], ['A train journey starts', 'the journey']]);
      return num(`${what[0]} at ${t24(sh, sm)} and ends at ${t24(eh, em)}.\nHow many minutes does ${what[1]} last?`, dur,
        ['Count on from the start time to the next o\'clock, then on to the end time.', `From ${t24(sh, sm)} to ${t24(sh + 1, 0)} is ${60 - sm} minutes.`],
        `${segs.join(', then ')}. ${nums.length > 1 ? `${nums.join(' + ')} = ${dur} minutes.` : `That is ${dur} minutes.`}`,
        { unit: 'minutes' });
    });

    const endTime = () => retry(() => {
      const sh = R(9, 18), sm = 5 * R(2, 11), dh = R(0, 2), dm = 5 * R(2, 11);
      if (sm + dm <= 60) return null;
      const tot = sh * 60 + sm + dh * 60 + dm, ans = tm(tot);
      if (tot >= 24 * 60) return null;
      const wrongs = [tm(tot - 60), tm(tot + 10), sm + dm < 100 ? `${pad(sh + dh)}:${pad(sm + dm)}` : tm(tot - 10)];
      const durTxt = dh ? `${dh} hour${dh > 1 ? 's' : ''} ${dm} minutes` : `${dm} minutes`;
      const after = sh + dh, rest = dm - (60 - sm);
      return choice(`A film starts at ${t24(sh, sm)}. It lasts ${durTxt}.\nWhat time does it end?`, ans, wrongs,
        ['Add the hours first, then the minutes. Remember: 60 minutes make 1 hour, not 100.',
          dh ? `Add ${dh} hour${dh > 1 ? 's' : ''}: ${t24(sh, sm)} → ${t24(after, sm)}. Now add ${dm} minutes.` : `${60 - sm} minutes takes ${t24(sh, sm)} to ${t24(sh + 1, 0)}.`],
        `${dh ? `${t24(sh, sm)} + ${dh} hour${dh > 1 ? 's' : ''} = ${t24(after, sm)}. ` : ''}${60 - sm} minutes takes it to ${t24(after + 1, 0)}, and ${rest} more minutes makes ${ans}.`);
    });

    const timetable = L => retry(() => {
      const stops = U.sample(['Station', 'Park', 'School', 'Library', 'Market', 'Hospital', 'Zoo'], 4);
      const gaps = [0, R(5, 18), R(5, 18), R(5, 18)];
      const cum = gaps.map((g, i) => sum(gaps.slice(0, i + 1)));
      const first = R(7, 9) * 60 + 5 * R(0, 11), every = 5 * R(4, 9);
      const T = (b, s) => first + b * every + cum[s];
      const BUS = ['Bus A', 'Bus B', 'Bus C'];
      const viz = { type: 'table', headers: ['Stop', ...BUS], rows: stops.map((s, i) => [s, ...[0, 1, 2].map(b => tm(T(b, i)))]) };
      const kind = L === 2 ? pick(['reach', 'reach', 'howLong']) : pick(['howLong', 'next', 'nextArrive', 'reach']);
      const b = R(0, 2), who = U.name();
      if (kind === 'reach') {
        const j = R(1, 3);
        return choice(`Look at the bus timetable. ${BUS[b]} leaves the ${stops[0]} at ${tm(T(b, 0))}.\nWhat time does it get to the ${stops[j]}?`, tm(T(b, j)),
          [...[0, 1, 2].filter(x => x !== b).map(x => tm(T(x, j))), tm(T(b, j === 3 ? 2 : j + 1))],
          [`Find the ${BUS[b]} column. Read down it to the ${stops[j]} row.`, `${BUS[b]} is the column that starts with ${tm(T(b, 0))}.`],
          `Go down the ${BUS[b]} column to the ${stops[j]} row: ${tm(T(b, j))}.`, { visual: viz });
      }
      if (kind === 'howLong') {
        const i = R(0, 2), j = R(i + 1, 3), d = T(b, j) - T(b, i);
        return num(`Look at the bus timetable. How many minutes does ${BUS[b]} take to go from the ${stops[i]} to the ${stops[j]}?`, d,
          [`Find the two times in the ${BUS[b]} column. Count on from the first time to the second.`,
            `${BUS[b]} is at the ${stops[i]} at ${tm(T(b, i))} and at the ${stops[j]} at ${tm(T(b, j))}.`],
          `From ${tm(T(b, i))} to ${tm(T(b, j))} is ${d} minutes.`, { unit: 'minutes', visual: viz });
      }
      const i = R(0, 2), k = R(1, 2), arrive = T(k - 1, i) + R(1, every - 1);
      const row = [0, 1, 2].map(x => tm(T(x, i)));
      if (kind === 'next') {
        return choice(`Look at the bus timetable. ${who} gets to the ${stops[i]} at ${tm(arrive)}.\nWhat time does the next bus leave the ${stops[i]}?`, tm(T(k, i)),
          [...row.filter(x => x !== tm(T(k, i))), tm(T(k, i + 1))],
          [`Look along the ${stops[i]} row. Find the first time that is after ${tm(arrive)}.`, `The ${stops[i]} row shows ${row.join(', ')}.`],
          `${tm(T(k - 1, i))} has already gone. The next bus leaves at ${tm(T(k, i))}.`, { visual: viz });
      }
      const j = R(i + 1, 3);
      return choice(`Look at the bus timetable. ${who} gets to the ${stops[i]} at ${tm(arrive)} and catches the next bus.\nWhat time does ${who} get to the ${stops[j]}?`, tm(T(k, j)),
        [tm(T(k - 1, j)), tm(T(k, i)), ...(k < 2 ? [tm(T(k + 1, j))] : [tm(T(k, j === 3 ? 2 : j + 1))])],
        [`First find the next bus at the ${stops[i]} after ${tm(arrive)}. Then follow that column down.`, `The next bus at the ${stops[i]} is ${BUS[k]}, at ${tm(T(k, i))}.`],
        `${who} catches ${BUS[k]} at ${tm(T(k, i))}. It gets to the ${stops[j]} at ${tm(T(k, j))}.`, { visual: viz });
    });

    const minutesConvert = () => {
      const h = R(1, 3), m = 5 * R(1, 11);
      return num(`How many minutes are there in ${h} hour${h > 1 ? 's' : ''} ${m} minutes?`, 60 * h + m,
        ['There are 60 minutes in 1 hour (not 100).', `${h} hour${h > 1 ? 's' : ''} = ${h} × 60 = ${60 * h} minutes.`],
        `${60 * h} + ${m} = ${60 * h + m} minutes.`, { unit: 'minutes' });
    };

    PMLM.registerSkill({
      id: 'g4.time', grade: 4, unit: 'g4.u4', title: 'Time and timetables', icon: '⏰',
      blurb: '12- and 24-hour clocks, timetables and how long things take',
      lesson: [
        { title: 'Reading a clock',
          text: 'The **short** hand shows the hour. The **long** hand shows the minutes.\nEach number is 5 minutes for the long hand.\nThis clock shows **4:35** (35 minutes past 4).',
          visual: { type: 'clock', h: 4, m: 35 } },
        { title: '24-hour time',
          text: 'a.m. = morning (before noon). p.m. = afternoon and evening.\nFor p.m. times, **add 12** to the hours: 3:15 p.m. = 15:15.\nAlways use 4 digits: 7:20 a.m. = 07:20. Midnight is 00:00.',
          visual: { type: 'table', headers: ['12-hour', '24-hour'], rows: [['7:20 a.m.', '07:20'], ['12:30 p.m.', '12:30'], ['3:15 p.m.', '15:15'], ['10:45 p.m.', '22:45']] } },
        { title: 'How long does it take?',
          text: 'Count on to the next o\'clock, then on to the end time.\n10:45 → 11:00 is 15 minutes. 11:00 → 11:20 is 20 minutes.\nTotal: 15 + 20 = **35 minutes**.\n**Remember:** 1 hour = 60 minutes, not 100!' },
        { title: 'Timetables',
          text: 'Read **down** a column to follow one bus. Read **across** a row to see every bus at one stop.\nBus B gets to the Park at 09:12.',
          visual: { type: 'table', headers: ['Stop', 'Bus A', 'Bus B'], rows: [['Station', '08:30', '09:00'], ['Park', '08:42', '09:12'], ['School', '08:55', '09:25']] } },
        { title: 'Worked example',
          text: 'A film starts at 14:35 and lasts 1 hour 40 minutes. When does it end?\n**1.** Add 1 hour: 15:35.\n**2.** Add 25 minutes to reach 16:00.\n**3.** Add the last 15 minutes: 16:15.\nAnswer: **16:15**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [readClock, readClock, to24, to24],
          [readClock, to24, to12, duration, duration, timetable],
          [readClock, to24, duration, endTime, timetable, timetable, minutesConvert],
        ], ctx);
      },
    });
  }

  /* 17 ── Converting units of length, mass and capacity */
  {
    const CONV = [
      { big: 'm', one: 'metre', small: 'cm', f: 100, adj: 'longer' },
      { big: 'km', one: 'kilometre', small: 'm', f: 1000, adj: 'longer' },
      { big: 'cm', one: 'centimetre', small: 'mm', f: 10, adj: 'longer' },
      { big: 'kg', one: 'kilogram', small: 'g', f: 1000, adj: 'heavier' },
      { big: 'litres', one: 'litre', small: 'ml', f: 1000, adj: 'more' },
    ];
    const B = (c, a) => (c.big === 'litres' && a === 1 ? 'litre' : c.big);

    const toSmall = () => {
      const c = pick(CONV), a = R(2, 9);
      return num(`${a} ${B(c, a)} = □ ${c.small}`, a * c.f,
        [`There are ${c.f} ${c.small} in 1 ${c.one}. Changing to a smaller unit gives more of them, so multiply.`, `Work out ${a} × ${c.f}.`],
        `${a} × ${c.f} = ${F(a * c.f)}, so ${a} ${B(c, a)} = ${F(a * c.f)} ${c.small}.`, { unit: c.small });
    };

    const toBig = () => {
      const c = pick(CONV), a = R(2, 9);
      return num(`${F(a * c.f)} ${c.small} = □ ${c.big}`, a,
        [`There are ${c.f} ${c.small} in 1 ${c.one}. Changing to a bigger unit gives fewer of them, so divide.`, `Work out ${F(a * c.f)} ÷ ${c.f}.`],
        `${F(a * c.f)} ÷ ${c.f} = ${a}, so ${F(a * c.f)} ${c.small} = ${a} ${c.big}.`, { unit: c.big });
    };

    const mixed = () => {
      const c = pick(CONV), a = R(1, 9);
      const b = c.f === 10 ? R(1, 9) : c.f === 100 ? (coin(0.3) ? R(1, 9) : R(11, 99)) : (coin(0.3) ? 10 * R(1, 9) : R(101, 999));
      return num(`${a} ${B(c, a)} ${b} ${c.small} = □ ${c.small}`, a * c.f + b,
        ['Change the big unit first, then add the small part.', `${a} ${B(c, a)} = ${F(a * c.f)} ${c.small}.`],
        `${F(a * c.f)} + ${b} = ${F(a * c.f + b)}, so the answer is ${F(a * c.f + b)} ${c.small}.`, { unit: c.small });
    };

    const half = () => {
      const c = pick(CONV.filter(x => x.f >= 100)), a = R(1, 9), v = a * c.f + c.f / 2;
      if (coin()) return num(`${a}.5 ${c.big} = □ ${c.small}`, v,
        ['0.5 means a half. Change the whole number part first, then the half.', `${a} ${B(c, a)} = ${F(a * c.f)} ${c.small}, and half of ${c.f} is ${c.f / 2}.`],
        `${F(a * c.f)} + ${c.f / 2} = ${F(v)}, so ${a}.5 ${c.big} = ${F(v)} ${c.small}.`, { unit: c.small });
      return num(`${F(v)} ${c.small} = □ ${c.big}`, a + 0.5,
        [`There are ${c.f} ${c.small} in 1 ${c.one}. Divide by ${c.f}.`, `${F(a * c.f)} ${c.small} = ${a} ${B(c, a)}. The other ${c.f / 2} ${c.small} is half of a ${c.one}.`],
        `${F(v)} ÷ ${c.f} = ${a}.5, so ${F(v)} ${c.small} = ${a}.5 ${c.big}.`, { unit: c.big });
    };

    const compare = () => {
      const c = pick(CONV.filter(x => x.f >= 100)), a = R(1, 5);
      const same = coin(0.25), x = same ? a * c.f : a * c.f + pick([-1, 1]) * (c.f === 100 ? 10 * R(1, 5) : 100 * R(1, 5));
      const s1 = `${a} ${B(c, a)}`, s2 = `${F(x)} ${c.small}`;
      const ans = same ? 'They are the same' : a * c.f > x ? s1 : s2;
      const q = c.adj === 'more' ? `Which is more: ${s1} or ${s2}?` : `Which is ${c.adj}: ${s1} or ${s2}?`;
      return choice(q, ans, [s1, s2, 'They are the same'],
        ['Change them into the same unit first.', `${s1} = ${F(a * c.f)} ${c.small}.`],
        `${s1} = ${F(a * c.f)} ${c.small}. Compare with ${s2}: ${same ? 'they are the same.' : `${ans} is ${c.adj}.`}`, null, 3);
    };

    const word = () => {
      const who = U.name(), t = R(1, 4), a = R(1, 3);
      const xs = { 1: 50 * R(1, 19), 2: 50 * R(1, 19), 3: 50 * R(1, 19), 4: 5 * R(1, 19) };
      const x = xs[t] < a * (t === 4 ? 100 : 1000) ? xs[t] : 250;
      const T = {
        1: [`A jug holds ${a} litre${a > 1 ? 's' : ''} of juice. ${who} pours out ${x} ml.\nHow much juice is left in the jug, in ml?`, 1000, 'ml', `${a} litre${a > 1 ? 's' : ''}`],
        2: [`A path is ${a} km long. ${who} has walked ${x} m.\nHow much further is it to the end, in metres?`, 1000, 'm', `${a} km`],
        3: [`A bag of flour weighs ${a} kg. ${x} g is used to make a cake.\nHow many grams of flour are left?`, 1000, 'g', `${a} kg`],
        4: [`${who} has a ribbon ${a} m long and cuts off ${x} cm.\nHow many centimetres of ribbon are left?`, 100, 'cm', `${a} m`],
      }[t];
      const total = a * T[1];
      return num(T[0], total - x,
        ['Change both amounts to the same (smaller) unit first. Then subtract.', `${T[3]} = ${F(total)} ${T[2]}.`],
        `${T[3]} = ${F(total)} ${T[2]}. ${F(total)} − ${x} = ${F(total - x)} ${T[2]}.`, { unit: T[2] });
    };

    const chooseUnit = () => {
      const items = [
        ['the mass of an apple', 'g', 'm'], ['the mass of a big dog', 'kg', 'm'], ['the length of a pencil', 'cm', 'l'],
        ['the distance between two towns', 'km', 'l'], ['the amount of water in a bath', 'litres', 'c'], ['the amount of medicine on a spoon', 'ml', 'c'],
        ['the length of a football pitch', 'm', 'l'], ['the width of a fingernail', 'mm', 'l'], ['the mass of a bag of potatoes', 'kg', 'm'],
      ];
      const [what, ans, type] = pick(items);
      const all = ['g', 'kg', 'mm', 'cm', 'm', 'km', 'ml', 'litres'];
      const wrongs = U.shuffle(all.filter(u => u !== ans)).slice(0, 3);
      const tip = { l: 'Small lengths use mm or cm. Longer lengths use m. Long distances use km.', m: 'Light things are measured in g. Heavy things are measured in kg.', c: 'Small amounts of liquid use ml. Big amounts use litres.' }[type];
      return choice(`Which unit would you use to measure ${what}?`, ans, wrongs,
        ['First decide: is it a length, a mass (how heavy) or a capacity (how much liquid)?', tip],
        `${what[0].toUpperCase() + what.slice(1)} is best measured in ${ans}.`);
    };

    PMLM.registerSkill({
      id: 'g4.units', grade: 4, unit: 'g4.u4', title: 'Converting units', icon: '🥛',
      blurb: 'Change between cm, m, km, g, kg, ml and litres',
      lesson: [
        { title: 'Units to remember',
          text: '**Length:** 1 cm = 10 mm, 1 m = 100 cm, 1 km = 1000 m\n**Mass:** 1 kg = 1000 g\n**Capacity:** 1 litre = 1000 ml',
          visual: { type: 'table', headers: ['Length', 'Mass', 'Capacity'], rows: [['1 cm = 10 mm', '1 kg = 1000 g', '1 litre = 1000 ml'], ['1 m = 100 cm', '', ''], ['1 km = 1000 m', '', '']] } },
        { title: 'Big unit → small unit: multiply',
          text: 'A smaller unit means you need **more** of them, so multiply.\n3 m = 3 × 100 = **300 cm**\n4 kg = 4 × 1000 = **4000 g**' },
        { title: 'Small unit → big unit: divide',
          text: 'A bigger unit means you need **fewer** of them, so divide.\n5000 ml = 5000 ÷ 1000 = **5 litres**\n700 cm = 700 ÷ 100 = **7 m**\n**Tip:** half a kilogram is 500 g, half a metre is 50 cm.' },
        { title: 'Worked example',
          text: 'How many grams are in 3 kg 250 g?\n**1.** Change the kilograms: 3 kg = 3 × 1000 = 3000 g.\n**2.** Add the grams: 3000 + 250 = 3250.\nAnswer: **3250 g**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [toSmall, toSmall, toSmall, chooseUnit],
          [toSmall, toBig, toBig, mixed, mixed, chooseUnit],
          [toBig, mixed, half, half, compare, word, word],
        ], ctx);
      },
    });
  }

  /* 18 ── Perimeter and area of rectangles */
  {
    const rectGrid = (w, h) => ({ type: 'grid', xmin: 0, xmax: w + 2, ymin: 0, ymax: h + 2, polygons: [{ pts: [[1, 1], [1 + w, 1], [1 + w, 1 + h], [1, 1 + h]] }] });
    const LGrid = (w, h, a, b) => ({ type: 'grid', xmin: 0, xmax: w + 2, ymin: 0, ymax: h + 2, polygons: [{ pts: [[1, 1], [1 + w, 1], [1 + w, 1 + h - b], [1 + w - a, 1 + h - b], [1 + w - a, 1 + h], [1, 1 + h]] }] });
    const rect = (l, w) => ({ type: 'shape2d', shape: 'rectangle', dims: { base: `${l} cm`, height: `${w} cm` } });
    const dims = L => retry(() => { const l = R(3, L === 1 ? 9 : 12), w = R(2, L === 1 ? 6 : 9); return l > w ? [l, w] : null; });

    const areaCount = L => {
      const w = R(2, L === 1 ? 6 : 8), h = R(2, L === 1 ? 4 : 6);
      return num('Each square is 1 cm². What is the area of the shaded shape?', w * h,
        ['Area is the number of squares inside the shape. Count them, or count the rows and columns.', `There are ${w} squares in each row.`],
        `There are ${h} rows of ${w} squares: ${h} × ${w} = ${w * h} squares, so the area is ${w * h} cm².`,
        { unit: 'cm²', visual: rectGrid(w, h) });
    };

    const areaL = () => retry(() => {
      const w = R(4, 8), h = R(3, 6), a = R(1, w - 2), b = R(1, h - 1);
      return num('Each square is 1 cm². What is the area of the shaded shape?', w * h - a * b,
        ['Split the shape into two rectangles. Find the area of each, then add.', `The bottom rectangle is ${w} squares wide and ${h - b} squares tall: ${w} × ${h - b} = ${w * (h - b)} squares.`],
        `Bottom part: ${w} × ${h - b} = ${w * (h - b)}. Top part: ${w - a} × ${b} = ${(w - a) * b}. Total: ${w * (h - b)} + ${(w - a) * b} = ${w * h - a * b} cm².`,
        { unit: 'cm²', visual: LGrid(w, h, a, b) });
    });

    const perimRect = L => {
      const [l, w] = dims(L);
      return num(`What is the perimeter of this rectangle?`, 2 * (l + w),
        ['Perimeter is the distance all the way round. A rectangle has 2 long sides and 2 short sides.', `The two long sides: ${l} + ${l} = ${2 * l} cm.`],
        `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} cm.`, { unit: 'cm', visual: rect(l, w) });
    };

    const perimGrid = () => {
      const w = R(2, 8), h = R(2, 6);
      return num('Each square has sides of 1 cm. What is the perimeter of the shaded shape?', 2 * (w + h),
        ['Count the edges all the way round the outside of the shape.', `The bottom edge is ${w} cm and the side edge is ${h} cm.`],
        `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.`, { unit: 'cm', visual: rectGrid(w, h) });
    };

    const areaRect = L => {
      const [l, w] = dims(L);
      return num('What is the area of this rectangle?', l * w,
        ['Area of a rectangle = length × width.', `Imagine ${w} rows of 1 cm squares, with ${l} squares in each row.`],
        `${l} × ${w} = ${l * w}, so the area is ${l * w} cm².`, { unit: 'cm²', visual: rect(l, w) });
    };

    const square = () => {
      const s = R(3, 12), area = coin(0.4);
      return num(`A square has sides of ${s} cm. What is its ${area ? 'area' : 'perimeter'}?`, area ? s * s : 4 * s,
        area ? ['Area = length × width. All the sides of a square are the same.', `Work out ${s} × ${s}.`]
          : ['Perimeter is the distance all the way round. A square has 4 equal sides.', `Add up 4 sides: ${s} + ${s} + ${s} + ${s}, or work out 4 × ${s}.`],
        area ? `${s} × ${s} = ${s * s} cm².` : `4 × ${s} = ${4 * s} cm.`,
        { unit: area ? 'cm²' : 'cm', visual: { type: 'shape2d', shape: 'square', dims: { base: `${s} cm` } } });
    };

    const missingSide = () => {
      const [l, w] = dims(3);
      if (coin()) {
        const P = 2 * (l + w);
        return num(`A rectangle has a perimeter of ${P} cm. Its length is ${l} cm.\nHow wide is it?`, w,
          ['The perimeter is length + width + length + width.', `The two lengths make ${l} + ${l} = ${2 * l} cm. That leaves ${P} − ${2 * l} = ${P - 2 * l} cm for the two widths.`],
          `${P} − ${2 * l} = ${P - 2 * l}, and ${P - 2 * l} ÷ 2 = ${w}. The width is ${w} cm.`, { unit: 'cm', visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `${l} cm`, height: '? cm' } } });
      }
      return num(`A rectangle has an area of ${l * w} cm². Its length is ${l} cm.\nHow wide is it?`, w,
        ['Area = length × width. So the width = area ÷ length.', `Think: ${l} × what = ${l * w}?`],
        `${l * w} ÷ ${l} = ${w}. The width is ${w} cm.`, { unit: 'cm', visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `${l} cm`, height: '? cm' } } });
    };

    const spot = () => {
      const [l, w] = dims(3), who = U.name();
      return num(`${who} says the area of this rectangle is ${2 * (l + w)} cm².\nWhat is the correct area?`, l * w,
        [`${who} added up all the sides. That gives the perimeter, not the area.`, `Area = length × width = ${l} × ${w}.`],
        `${l} × ${w} = ${l * w}, so the area is ${l * w} cm². (${2 * (l + w)} cm is the perimeter.)`, { unit: 'cm²', visual: rect(l, w) });
    };

    const compare = () => retry(() => {
      const a = [R(3, 9), R(2, 8)], b = [R(3, 9), R(2, 8)];
      const pa = a[0] * a[1], pb = b[0] * b[1];
      if (a[0] === b[0] || Math.abs(pa - pb) > 6) return null;
      const ans = pa === pb ? 'They are the same' : pa > pb ? 'Rectangle A' : 'Rectangle B';
      return choice(`Rectangle A is ${a[0]} cm by ${a[1]} cm. Rectangle B is ${b[0]} cm by ${b[1]} cm.\nWhich rectangle has the bigger area?`, ans, ['Rectangle A', 'Rectangle B', 'They are the same'],
        ['Find the area of each rectangle (length × width), then compare.', `Area of A = ${a[0]} × ${a[1]} = ${pa} cm².`],
        `A: ${a[0]} × ${a[1]} = ${pa} cm². B: ${b[0]} × ${b[1]} = ${pb} cm². ${pa === pb ? 'They are the same.' : `${ans} is bigger.`}`, null, 3);
    });

    const perimL = () => retry(() => {
      const w = R(6, 12), h = R(5, 10), a = R(2, w - 3), b = R(2, h - 2);
      return num('All the corners are right angles. What is the perimeter of this shape?', 2 * (w + h),
        ['Work out the two missing side lengths first. Then add all six sides.',
          `The top edge is ${w} − ${a} = ${w - a} cm, and the right-hand edge is ${h} − ${b} = ${h - b} cm.`],
        `${w} + ${h} + ${w - a} + ${b} + ${a} + ${h - b} = ${2 * (w + h)} cm.`,
        { unit: 'cm', visual: { type: 'shape2d', shape: 'L', dims: { w: `${w} cm`, h: `${h} cm`, a: `${a} cm`, b: `${b} cm` } } });
    });

    PMLM.registerSkill({
      id: 'g4.perimeterArea', grade: 4, unit: 'g4.u4', title: 'Perimeter and area', icon: '🟩',
      blurb: 'Find the perimeter and area of rectangles',
      lesson: [
        { title: 'Perimeter',
          text: '**Perimeter** is the distance all the way **around** a shape. Add up all the sides.\nThis rectangle: 5 + 3 + 5 + 3 = **16 cm**.',
          visual: { type: 'shape2d', shape: 'rectangle', dims: { base: '5 cm', height: '3 cm' } } },
        { title: 'Area: count the squares',
          text: '**Area** is the space **inside** a shape. We measure it in squares.\nThis rectangle covers **12 squares**. If each square is 1 cm², the area is 12 cm².',
          visual: { type: 'grid', xmin: 0, xmax: 6, ymin: 0, ymax: 5, polygons: [{ pts: [[1, 1], [5, 1], [5, 4], [1, 4]] }] } },
        { title: 'A quicker way',
          text: 'For a rectangle, you don\'t need to count every square.\n4 squares in each row, 3 rows: 4 × 3 = 12.\n**Area of a rectangle = length × width.**\n**Tip:** area is in cm² (square centimetres); perimeter is in cm.' },
        { title: 'Worked example',
          text: 'A rectangle is 7 cm long and 4 cm wide. Find its perimeter and its area.\n**1.** Perimeter: 7 + 4 + 7 + 4 = 22 cm.\n**2.** Area: 7 × 4 = 28 cm².\nAnswer: perimeter **22 cm**, area **28 cm²**',
          visual: { type: 'shape2d', shape: 'rectangle', dims: { base: '7 cm', height: '4 cm' } } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [areaCount, areaCount, perimRect, perimGrid],
          [areaCount, areaL, perimRect, perimGrid, areaRect, square],
          [areaL, areaRect, square, missingSide, spot, compare, perimL],
        ], ctx);
      },
    });
  }

  /* 19 ── Angles: right, acute, obtuse; comparing angles */
  {
    const TYPES = ['acute', 'right angle', 'obtuse'];
    const typeOf = d => (d < 90 ? 'acute' : d === 90 ? 'right angle' : d < 180 ? 'obtuse' : 'straight line');
    const DEF = 'Acute: less than a right angle. Right angle: exactly a square corner (90°). Obtuse: more than a right angle but less than a straight line.';

    const classify = L => {
      const d = L === 1 ? pick([5 * R(4, 13), 90, 5 * R(23, 32)]) : pick([5 * R(4, 17), 90, 5 * R(19, 34)]);
      return choice('What type of angle is this?', typeOf(d), TYPES,
        [DEF, 'Imagine the corner of a piece of paper on the angle. Does the angle fit inside the corner, match it exactly, or open wider?'],
        d === 90 ? 'This angle is exactly a square corner, so it is a right angle.' : `This angle is ${d < 90 ? 'smaller' : 'bigger'} than a right angle (a square corner), so it is an ${typeOf(d)} angle.`,
        { visual: { type: 'angle', mode: 'single', parts: [d], labels: [''] } }, 3);
    };

    const classifyDeg = () => {
      const d = pick([5 * R(1, 17), 5 * R(19, 35), 90, 5 * R(16, 17), 5 * R(19, 20), 180]);
      return choice(`An angle measures ${d}°. What type of angle is it?`, typeOf(d), [...TYPES, 'straight line'],
        ['A right angle is 90°. A straight line is 180°. Acute angles are less than 90°; obtuse angles are between 90° and 180°.', `Compare ${d} with 90. Is it smaller, the same or bigger?`],
        `${d}° is ${d < 90 ? 'less than 90°' : d === 90 ? 'exactly 90°' : d < 180 ? 'between 90° and 180°' : 'exactly 180°'}, so it is ${d === 90 ? 'a right angle' : d === 180 ? 'a straight line' : `an ${typeOf(d)} angle`}.`, null, 4);
    };

    const pairLine = () => {
      const a = 5 * R(5, 15), parts = coin() ? [a, 180 - a] : [180 - a, a];
      const askObtuse = coin();
      const ans = askObtuse ? (parts[0] > 90 ? 'a' : 'b') : (parts[0] < 90 ? 'a' : 'b');
      return choice(`Look at angles **a** and **b** on the straight line. Which angle is ${askObtuse ? 'obtuse' : 'acute'}?`, ans, ['a', 'b'],
        ['Acute angles are smaller than a right angle. Obtuse angles are bigger than a right angle.', 'Together a and b make a straight line, which is 2 right angles. So one is bigger than a right angle and one is smaller.'],
        `Angle ${parts[0] > 90 ? 'a' : 'b'} is wider than a right angle (obtuse) and angle ${parts[0] > 90 ? 'b' : 'a'} is narrower (acute). The answer is ${ans}.`,
        { visual: { type: 'angle', mode: 'line', parts, labels: ['a', 'b'] } }, 2);
    };

    const rightAngles = () => {
      const t = pick([
        ['How many right angles make a straight line?', 2, 'A straight line is a half turn.', 'A right angle is a quarter turn. How many quarter turns make a half turn?', 'A straight line is a half turn, which is 2 right angles.', ''],
        ['How many right angles make a full turn?', 4, 'A right angle is a quarter turn.', 'How many quarters make a whole?', 'A full turn is 4 quarter turns, so it is 4 right angles.', ''],
        ['How many degrees are there in a right angle?', 90, 'A full turn is 360°. A right angle is a quarter turn.', 'Work out 360 ÷ 4.', 'A right angle is 90°.', '°'],
        ['How many degrees are there in 2 right angles?', 180, 'One right angle is 90°.', 'Work out 90 + 90.', '2 × 90° = 180°, which is a straight line.', '°'],
        ['How many degrees are there in 3 right angles?', 270, 'One right angle is 90°.', 'Work out 90 + 90 + 90.', '3 × 90° = 270°.', '°'],
      ]);
      return num(t[0], t[1], [t[2], t[3]], t[4], t[5] ? { unit: t[5] } : undefined);
    };

    const whichOne = () => {
      const want = pick(['acute', 'obtuse']);
      const ans = want === 'acute' ? 5 * R(10, 17) : 5 * R(19, 26);
      const wrongs = want === 'acute' ? [90, 5 * R(19, 23), 5 * R(24, 34), 180] : [90, 5 * R(10, 17), 5 * R(2, 9), 180];
      return choice(`Which of these angles is **${want}**?`, `${ans}°`, wrongs.map(x => `${x}°`),
        ['Acute angles are less than 90°. Obtuse angles are between 90° and 180°.', `Compare each angle with 90°. ${wrongs[0]}° is exactly a right angle, so it is not ${want}.`],
        `${ans}° is ${want === 'acute' ? 'less than 90°' : 'between 90° and 180°'}, so it is ${want}.`);
    };

    const clockAngle = () => {
      const h = pick([1, 2, 3, 4, 5, 7, 8, 9, 10, 11]), d = 30 * Math.min(h, 12 - h);
      return choice(`It is ${h} o'clock. What type of angle do the clock hands make?`, typeOf(d), TYPES,
        ['From 12 to 3 is a quarter turn: a right angle.', `The hands point at 12 and ${h}. Is that gap smaller than, the same as, or bigger than the gap from 12 to 3?`],
        `At ${h} o'clock the gap between the hands is ${d < 90 ? 'less than' : d === 90 ? 'exactly' : 'more than'} a quarter turn, so it is ${d === 90 ? 'a right angle' : `an ${typeOf(d)} angle`}.`,
        { visual: { type: 'clock', h, m: 0 } }, 3);
    };

    const order = () => {
      const right = 'acute, right angle, obtuse';
      return choice('Which list goes from the **smallest** angle to the **largest**?', right,
        ['obtuse, right angle, acute', 'right angle, acute, obtuse', 'acute, obtuse, right angle'],
        ['Think about a right angle in the middle. Which type is smaller and which is bigger?', 'Acute angles are less than a right angle.'],
        'Acute angles are smallest, then a right angle (90°), then obtuse angles. So: acute, right angle, obtuse.', null, 4);
    };

    const spot = () => {
      const d = 5 * R(20, 34), who = U.name();
      return choice(`${who} says a ${d}° angle is acute because it is less than 180°.\nWhat type of angle is it really?`, 'obtuse', ['acute', 'right angle', 'straight line'],
        ['Acute angles must be less than 90°, not 180°.', `${d}° is more than 90°.`],
        `${d}° is between 90° and 180°, so it is an obtuse angle.`);
    };

    PMLM.registerSkill({
      id: 'g4.angles', grade: 4, unit: 'g4.u4', title: 'Angles', icon: '📐',
      blurb: 'Right, acute and obtuse angles, and comparing angles',
      lesson: [
        { title: 'Right angles',
          text: 'A **right angle** is a quarter turn. It is exactly **90°**.\nWe mark it with a small square. The corners of a book are right angles.',
          visual: { type: 'angle', mode: 'single', parts: [90], labels: ['90°'] } },
        { title: 'Acute angles',
          text: 'An **acute** angle is **smaller** than a right angle (less than 90°).\nIt looks sharp and narrow.',
          visual: { type: 'angle', mode: 'single', parts: [40], labels: [''] } },
        { title: 'Obtuse angles',
          text: 'An **obtuse** angle is **bigger** than a right angle but smaller than a straight line (between 90° and 180°).\nIt looks wide open.',
          visual: { type: 'angle', mode: 'single', parts: [130], labels: [''] } },
        { title: 'Comparing angles',
          text: 'The size of an angle is how far it **turns**, not how long the lines are.\nA straight line is 2 right angles (180°). A full turn is 4 right angles (360°).\n**Tip:** use the corner of a piece of paper to check an angle.' },
        { title: 'Worked example',
          text: 'Is a 110° angle acute, right or obtuse?\n**1.** Compare it with a right angle: 90°.\n**2.** 110 is more than 90.\n**3.** 110 is less than 180, so it is not a straight line.\nAnswer: **obtuse**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [classify, classify, classify, rightAngles],
          [classify, classifyDeg, classifyDeg, pairLine, rightAngles, order],
          [classify, classifyDeg, whichOne, clockAngle, clockAngle, spot, pairLine],
        ], ctx);
      },
    });
  }

  /* 20 ── Quadrilaterals and symmetry */
  {
    const Q = {
      square: { sym: 4, clue: 'All 4 sides look the same length, and every corner is a right angle.' },
      rectangle: { sym: 2, clue: 'Every corner is a right angle, but 2 sides are longer than the other 2.' },
      rhombus: { sym: 2, clue: 'All 4 sides are the same length, but the corners are not right angles.' },
      parallelogram: { sym: 0, clue: 'Opposite sides are parallel and equal, but it leans over and has no right angles.' },
      trapezium: { sym: null, clue: 'Only one pair of sides is parallel: the top and the bottom.' },
      kite: { sym: 1, clue: 'It has two short sides next to each other at the top, and two long sides next to each other at the bottom.' },
    };
    const NAMES = Object.keys(Q);
    const SIMILAR = { square: ['rectangle', 'kite', 'trapezium'], rectangle: ['square', 'parallelogram', 'trapezium'], rhombus: ['kite', 'parallelogram', 'trapezium'], parallelogram: ['rectangle', 'rhombus', 'trapezium'], trapezium: ['parallelogram', 'rectangle', 'kite'], kite: ['rhombus', 'square', 'trapezium'] };

    const nameShape = L => {
      const s = pick(L === 1 ? ['square', 'rectangle', 'kite', 'trapezium', 'rhombus'] : NAMES);
      const viz = s === 'rectangle' ? { type: 'shape2d', shape: 'rectangle', dims: { base: '', height: '' } } : { type: 'shape2d', shape: s };
      return choice('What is the name of this shape?', s, SIMILAR[s],
        ['Count the sides. Then look for right angles, equal sides and parallel sides.', Q[s].clue],
        `It is a ${s}: ${Q[s].clue.charAt(0).toLowerCase() + Q[s].clue.slice(1)}`, { visual: viz });
    };

    const symCount = L => {
      const opts = L === 1 ? ['square', 'rectangle', 'kite', 'reg3', 'reg6'] : ['square', 'rectangle', 'kite', 'parallelogram', 'reg3', 'reg5', 'reg6', 'reg8'];
      const s = pick(opts);
      let viz, ans, nm;
      if (s.startsWith('reg')) { const n = +s.slice(3); viz = { type: 'polygon', n }; ans = n; nm = { 3: 'equilateral triangle', 5: 'regular pentagon', 6: 'regular hexagon', 8: 'regular octagon' }[n]; }
      else { viz = s === 'rectangle' ? { type: 'shape2d', shape: 'rectangle', dims: { base: '', height: '' } } : { type: 'shape2d', shape: s }; ans = Q[s].sym; nm = s; }
      const why = {
        square: 'one down, one across, and two corner to corner', rectangle: 'one down the middle and one across the middle (not corner to corner!)',
        kite: 'only the line from the top corner to the bottom corner', rhombus: 'the two lines from corner to corner', parallelogram: 'no fold makes the two halves match',
      }[s] || 'one through each corner';
      return num('How many lines of symmetry does this shape have?', ans,
        ['A line of symmetry folds a shape into two halves that match exactly, like a mirror.', 'Try a fold straight down the middle, then across the middle, then from corner to corner.'],
        `This ${nm} has ${ans} line${ans === 1 ? '' : 's'} of symmetry: ${why}.`, { visual: viz });
    };

    const props = () => {
      const t = pick([
        ['4 equal sides and 4 right angles', 'square', 'Two shapes always have 4 right angles. Which of them has all its sides equal?'],
        ['4 right angles, but not all its sides are equal', 'rectangle', 'Two shapes always have 4 right angles. Which of them can have long and short sides?'],
        ['4 equal sides but no right angles', 'rhombus', 'Two shapes have 4 equal sides. Which of them has no right angles?'],
        ['exactly one pair of parallel sides', 'trapezium', 'Parallel sides go in the same direction and never meet, like train tracks.'],
        ['two pairs of equal sides that are next to each other, and no parallel sides', 'kite', 'Think of the shape of a toy that flies in the wind.'],
        ['two pairs of parallel sides, no right angles, and not all its sides equal', 'parallelogram', 'Parallel sides go in the same direction and never meet. Think of a rectangle that has been pushed over.'],
      ]);
      return choice(`Which quadrilateral has ${t[0]}?`, t[1], SIMILAR[t[1]],
        ['Think about each shape: its sides, its angles and its parallel sides.', t[2]],
        `A ${t[1]} has ${t[0]}.`);
    };

    const countProp = () => {
      const t = pick([
        ['How many right angles does a rectangle have?', 4, 'Every corner of a rectangle is a square corner.'],
        ['How many pairs of parallel sides does a parallelogram have?', 2, 'Opposite sides of a parallelogram go in the same direction.'],
        ['How many pairs of parallel sides does a trapezium have?', 1, 'A trapezium has a top and a bottom that are parallel; its other two sides are not.'],
        ['How many sides of a rhombus are equal?', 4, 'A rhombus is like a square pushed over.'],
        ['How many right angles does a square have?', 4, 'Look at each corner of a square.'],
        ['How many sides does a quadrilateral have?', 4, '"Quad" means four.'],
      ]);
      return num(t[0], t[1], ['Picture the shape, or draw it quickly.', t[2]], `The answer is ${t[1]}. ${t[2]}`);
    };

    const trueFalse = () => {
      const t = pick([
        ['A square is a special kind of rectangle.', 'True', 'A square has 4 right angles and opposite sides equal, just like a rectangle.'],
        ['Every rectangle is a square.', 'False', 'A rectangle does not need 4 equal sides.'],
        ['A rhombus has 4 equal sides.', 'True', 'All 4 sides of a rhombus are the same length.'],
        ['A trapezium has 2 pairs of parallel sides.', 'False', 'A trapezium has exactly 1 pair of parallel sides.'],
        ['A kite has 4 right angles.', 'False', 'A kite has two pairs of equal sides next to each other; it does not have 4 right angles.'],
        ['A parallelogram has 2 pairs of parallel sides.', 'True', 'Both pairs of opposite sides in a parallelogram are parallel.'],
        ['A rectangle has 4 lines of symmetry.', 'False', 'A rectangle has only 2 lines of symmetry.'],
      ]);
      return choice(`True or false?\n${t[0]}`, t[1], t[1] === 'True' ? ['False'] : ['True'],
        ['Think about the properties: sides, right angles, parallel sides.', 'Picture or sketch the shape to check.'], t[2], null, 2);
    };

    const notQuad = () => {
      const ans = pick(['pentagon', 'triangle', 'hexagon']);
      return choice('Which of these shapes is **not** a quadrilateral?', ans, U.sample(NAMES, 3),
        ['A quadrilateral is any shape with 4 straight sides.', 'Count the sides of each shape.'],
        `A ${ans} has ${{ pentagon: 5, triangle: 3, hexagon: 6 }[ans]} sides, so it is not a quadrilateral.`);
    };

    PMLM.registerSkill({
      id: 'g4.shapes', grade: 4, unit: 'g4.u4', title: 'Quadrilaterals & symmetry', icon: '🔷',
      blurb: 'Name 4-sided shapes, their properties and symmetry',
      lesson: [
        { title: 'Squares and rectangles',
          text: 'A **quadrilateral** is any shape with 4 straight sides.\n**Square:** 4 equal sides and 4 right angles.\n**Rectangle:** 4 right angles, opposite sides equal.',
          visual: { type: 'shape2d', shape: 'rectangle', dims: { base: '', height: '' } } },
        { title: 'More quadrilaterals',
          text: 'Parallel sides go the same way and never meet.',
          visual: { type: 'table', headers: ['Shape', 'What to look for'], rows: [['rhombus', '4 equal sides, no right angles'], ['parallelogram', '2 pairs of parallel sides'], ['trapezium', 'exactly 1 pair of parallel sides'], ['kite', '2 pairs of equal sides next to each other']] } },
        { title: 'Lines of symmetry',
          text: 'A **line of symmetry** splits a shape into two halves that are mirror images.\nIf you fold along it, the halves match exactly.\nA rectangle has **2** lines of symmetry. A square has **4**.',
          visual: { type: 'grid', xmin: 0, xmax: 8, ymin: 0, ymax: 6, polygons: [{ pts: [[1, 1], [7, 1], [7, 5], [1, 5]] }], segments: [{ x1: 4, y1: 0, x2: 4, y2: 6 }, { x1: 0, y1: 3, x2: 8, y2: 3 }] } },
        { title: 'Worked example',
          text: 'Name the shape: 4 sides, all sides equal, no right angles.\n**1.** 4 sides → it is a quadrilateral.\n**2.** All sides equal → a square or a rhombus.\n**3.** No right angles → not a square.\nAnswer: **rhombus**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [nameShape, nameShape, symCount, countProp],
          [nameShape, symCount, symCount, props, countProp],
          [nameShape, symCount, props, trueFalse, trueFalse, notQuad],
        ], ctx);
      },
    });
  }

  /* 21 ── Coordinates in the first quadrant */
  {
    const G = (pts, extra) => Object.assign({ type: 'grid', xmin: 0, xmax: 8, ymin: 0, ymax: 8, points: pts }, extra || {});
    const P = (x, y) => `(${x}, ${y})`;

    const readPoint = L => {
      const x = R(1, L === 1 ? 6 : 8), y = R(1, L === 1 ? 6 : 8), lab = pick(['A', 'B', 'P', 'Q']);
      return coordQ(`What are the coordinates of point ${lab}?`, x, y,
        ['The first number is how far **across** (x). The second number is how far **up** (y).', `${lab} is ${x} square${x === 1 ? '' : 's'} across from 0.`],
        `${lab} is ${x} across and ${y} up, so it is at ${P(x, y)}.`, { visual: G([{ x, y, label: lab }]) });
    };

    const whichPoint = () => retry(() => {
      const x = R(1, 7), y = R(1, 7);
      if (x === y) return null;
      const cands = [[x, y], [y, x], [x, Math.min(8, y + 1) === y ? y - 1 : y + 1], [x === 1 ? 2 : x - 1, y]];
      const keys = new Set(cands.map(c => c.join(',')));
      if (keys.size !== 4) return null;
      const labels = ['A', 'B', 'C', 'D'], order = U.shuffle([0, 1, 2, 3]);
      const pts = order.map((ci, k) => ({ x: cands[ci][0], y: cands[ci][1], label: labels[k] }));
      const ans = labels[order.indexOf(0)], swapLab = labels[order.indexOf(1)];
      return choice(`Which point is at ${P(x, y)}?`, ans, labels,
        ['The first number is how far across. The second number is how far up.', `Go ${x} across first, then ${y} up. (Careful: ${swapLab} is at ${P(y, x)}, which is different!)`],
        `${P(x, y)} means ${x} across and ${y} up. That is point ${ans}.`, { visual: G(pts) }, 4);
    });

    const fourthCorner = L => retry(() => {
      const x1 = R(1, 4), x2 = R(x1 + 2, 7), y1 = R(1, 4), y2 = L === 3 && coin() ? y1 + (x2 - x1) : R(y1 + 2, 7);
      if (y2 > 8) return null;
      const sq = y2 - y1 === x2 - x1;
      // corners A (x1,y1) B (x2,y1) C (x2,y2) D (x1,y2); hide one
      const C4 = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], hide = R(0, 3);
      const shown = C4.map((c, i) => ({ x: c[0], y: c[1], label: 'ABCD'[i] })).filter((_, i) => i !== hide);
      const segs = [];
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; if (i !== hide && j !== hide) segs.push({ x1: C4[i][0], y1: C4[i][1], x2: C4[j][0], y2: C4[j][1] }); }
      const [hx, hy] = C4[hide], nb = C4[(hide + 1) % 4];
      const sameX = nb[0] === hx;
      return coordQ(`${shown.map(p => p.label).join(', ')} are three corners of a ${sq ? 'square' : 'rectangle'}. What are the coordinates of the fourth corner, ${'ABCD'[hide]}?`, hx, hy,
        [`Opposite sides of a ${sq ? 'square' : 'rectangle'} are the same length, and all the corners are right angles.`,
          sameX ? `${'ABCD'[hide]} is straight ${nb[1] > hy ? 'below' : 'above'} ${'ABCD'[(hide + 1) % 4]}, so it has the same x number: ${hx}.` : `${'ABCD'[hide]} is level with ${'ABCD'[(hide + 1) % 4]}, so it has the same y number: ${hy}.`],
        `The fourth corner is at ${P(hx, hy)}: in line with the corners next to it.`, { visual: G(shown, { segments: segs }) });
    });

    const translate = L => retry(() => {
      const x = R(1, 7), y = R(1, 7), dx = (L === 3 && coin() ? -1 : 1) * R(1, 4), dy = (L === 3 && coin() ? -1 : 1) * R(1, 4);
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx > 8 || ny < 0 || ny > 8) return null;
      const h = `${Math.abs(dx)} square${Math.abs(dx) > 1 ? 's' : ''} ${dx > 0 ? 'right' : 'left'}`, v = `${Math.abs(dy)} square${Math.abs(dy) > 1 ? 's' : ''} ${dy > 0 ? 'up' : 'down'}`;
      return coordQ(`Point A is at ${P(x, y)}. It moves ${h} and ${v}.\nWhere is it now?`, nx, ny,
        ['Moving right or left changes the first number. Moving up or down changes the second number.', `${x} ${dx > 0 ? '+' : M} ${Math.abs(dx)} = ${nx}, so the first number is ${nx}.`],
        `Across: ${x} ${dx > 0 ? '+' : M} ${Math.abs(dx)} = ${nx}. Up: ${y} ${dy > 0 ? '+' : M} ${Math.abs(dy)} = ${ny}. A is now at ${P(nx, ny)}.`,
        { visual: G([{ x, y, label: 'A' }]) });
    });

    const reflect = () => retry(() => {
      const vert = coin(), k = R(3, 5), d = R(1, 3) * (coin() ? -1 : 1), o = R(1, 7);
      const [x, y] = vert ? [k + d, o] : [o, k + d];
      const [nx, ny] = vert ? [k - d, o] : [o, k - d];
      if ([x, y, nx, ny].some(v => v < 1 || v > 8)) return null;
      const seg = vert ? { x1: k, y1: 0, x2: k, y2: 8 } : { x1: 0, y1: k, x2: 8, y2: k };
      const side = vert ? (d > 0 ? 'right' : 'left') : (d > 0 ? 'above' : 'below');
      return coordQ(`The thick line is a mirror line. Point A is reflected in the mirror line.\nWhat are the coordinates of the image of A?`, nx, ny,
        ['A reflection is the same distance from the mirror line, but on the other side.', `A is ${Math.abs(d)} square${Math.abs(d) > 1 ? 's' : ''} ${vert ? `to the ${side} of` : side} the mirror line.`],
        `Go ${Math.abs(d)} square${Math.abs(d) > 1 ? 's' : ''} to the other side of the line: the image is at ${P(nx, ny)}.`,
        { visual: G([{ x, y, label: 'A' }], { segments: [seg] }) });
    });

    const spot = () => retry(() => {
      const x = R(1, 7), y = R(1, 7), who = U.name(), swap = coin();
      if (swap && x === y) return null;
      const [wx, wy] = swap ? [y, x] : [x + 1, y + 1];
      if (wx > 8 || wy > 8) return null;
      return coordQ(`${who} says point P is at ${P(wx, wy)}. That is wrong.\nWhat are the correct coordinates of P?`, x, y,
        [swap ? 'Remember: across first, then up.' : 'Start counting from 0, not from 1.', `Start at 0. P is ${x} square${x === 1 ? '' : 's'} across.`],
        `P is ${x} across and ${y} up, so it is at ${P(x, y)}. ${swap ? `${who} wrote the numbers the wrong way round.` : `${who} started counting at 1 instead of 0.`}`,
        { visual: G([{ x, y, label: 'P' }]) });
    });

    PMLM.registerSkill({
      id: 'g4.coordinates', grade: 4, unit: 'g4.u4', title: 'Coordinates', icon: '📍',
      blurb: 'Read and use coordinates on a grid',
      lesson: [
        { title: 'Finding a point',
          text: 'Coordinates tell you where a point is on a grid. They are two numbers in brackets: **(x, y)**.\nPoint A is at **(4, 2)**.',
          visual: { type: 'grid', xmin: 0, xmax: 6, ymin: 0, ymax: 5, points: [{ x: 4, y: 2, label: 'A (4, 2)' }] } },
        { title: 'Across, then up',
          text: 'The **first** number is how far **across** (along the x-axis).\nThe **second** number is how far **up** (along the y-axis).\n**Tip:** "Along the corridor, then up the stairs."' },
        { title: 'Order matters',
          text: '(2, 4) and (4, 2) are **different** points!\nB is at (2, 4): 2 across, 4 up.\nA is at (4, 2): 4 across, 2 up.',
          visual: { type: 'grid', xmin: 0, xmax: 6, ymin: 0, ymax: 5, points: [{ x: 4, y: 2, label: 'A' }, { x: 2, y: 4, label: 'B' }] } },
        { title: 'Worked example',
          text: 'Find the coordinates of point P.\n**1.** Start at 0, where the axes meet.\n**2.** Go across until you are under P: that is 3.\n**3.** Go up to P: that is 5.\nAnswer: **(3, 5)**',
          visual: { type: 'grid', xmin: 0, xmax: 6, ymin: 0, ymax: 6, points: [{ x: 3, y: 5, label: 'P' }] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [readPoint, readPoint, readPoint, whichPoint],
          [readPoint, whichPoint, fourthCorner, translate, spot],
          [readPoint, fourthCorner, translate, reflect, reflect, spot],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 5: Data and probability ═══════════════════════
  PMLM.registerUnit({ id: 'g4.u5', grade: 4, name: 'Data and chance', icon: '📊' });

  /* 22 ── Frequency tables, bar charts and pictograms */
  {
    const TOPICS = [
      { noun: 'fruit', items: ['Apple', 'Banana', 'Orange', 'Grapes', 'Mango'] },
      { noun: 'pet', items: ['Cat', 'Dog', 'Fish', 'Rabbit', 'Bird'] },
      { noun: 'colour', items: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'] },
      { noun: 'sport', items: ['Football', 'Tennis', 'Swimming', 'Running', 'Basketball'] },
      { noun: 'season', items: ['Spring', 'Summer', 'Autumn', 'Winter'] },
    ];
    const Cap = s => s[0].toUpperCase() + s.slice(1);
    // k items with values that are multiples of `unit` (between lo and hi units), one clear biggest and smallest
    const makeData = (k, unit, lo, hi) => retry(() => {
      const t = pick(TOPICS), items = U.sample(t.items, Math.min(k, t.items.length)).map(x => x);
      const vals = items.map(() => unit * R(lo, hi));
      const mx = Math.max(...vals), mn = Math.min(...vals);
      if (vals.filter(v => v === mx).length > 1 || vals.filter(v => v === mn).length > 1) return null;
      return { t, items, vals };
    });
    const intro = t => `Some children voted for their favourite ${t.noun}.`;

    const tallyQ = () => {
      const { t, items, vals } = makeData(4, 1, 6, 17), i = R(0, items.length - 1), c = vals[i], g = Math.floor(c / 5), r = c % 5;
      return num(`${intro(t)} How many children chose **${items[i]}**?`, c,
        ['Each group of 4 marks with a line across them is 5. Count the groups in 5s, then add the single marks.',
          `${items[i]} has ${g} group${g === 1 ? '' : 's'} of 5${r ? ` and ${r} more mark${r === 1 ? '' : 's'}` : ' and no single marks'}.`],
        `${g} × 5 = ${g * 5}${r ? `, and ${g * 5} + ${r} = ${c}` : ''}. ${c} children chose ${items[i]}.`,
        { visual: { type: 'tally', rows: items.map((x, k) => ({ label: x, count: vals[k] })) } });
    };

    const freqQ = L => {
      const { t, items, vals } = makeData(4, 1, 3, L === 1 ? 15 : 30);
      const viz = { visual: { type: 'table', headers: [Cap(t.noun), 'Number of children'], rows: items.map((x, k) => [x, vals[k]]) } };
      const kind = L === 1 ? pick(['more', 'least']) : pick(['more', 'total', 'least']);
      if (kind === 'more') {
        const [i, j] = U.sample(U.range(0, items.length - 1), 2), [a, b] = vals[i] > vals[j] ? [i, j] : [j, i];
        return num(`${intro(t)} How many more children chose **${items[a]}** than **${items[b]}**?`, vals[a] - vals[b],
          ['Find both numbers in the table, then find the difference by subtracting.', `${items[a]}: ${vals[a]} children. ${items[b]}: ${vals[b]} children.`],
          `${vals[a]} − ${vals[b]} = ${vals[a] - vals[b]}.`, viz);
      }
      if (kind === 'total') {
        return num(`${intro(t)} How many children voted altogether?`, sum(vals),
          ['Add up all the numbers in the table.', `Start with the first two: ${vals[0]} + ${vals[1]} = ${vals[0] + vals[1]}.`],
          `${vals.join(' + ')} = ${sum(vals)} children.`, viz);
      }
      const mn = Math.min(...vals), ans = items[vals.indexOf(mn)];
      return choice(`${intro(t)} Which ${t.noun} was the **least** popular?`, ans, items,
        ['The least popular has the smallest number.', 'Compare the numbers in the table. Which is the smallest?'],
        `${ans} has the smallest number (${mn}), so it was the least popular.`, viz);
    };

    const barQ = L => {
      const step = pick(L === 1 ? [1, 2] : L === 2 ? [2, 5] : [2, 5, 10]);
      const halfOK = L === 3 && step !== 5;
      const { t, items, vals: base } = makeData(L === 1 ? 4 : 5, step, 1, 8);
      const i = R(0, items.length - 1);
      const vals = base.slice();
      if (halfOK && coin(0.7)) vals[i] = base[i] + step / 2;
      if (new Set(vals).size !== vals.length && halfOK) vals[i] = base[i];
      const viz = { visual: { type: 'barChart', bars: items.map((x, k) => ({ label: x, value: vals[k] })), step, yLabel: 'Number of children', title: `Favourite ${t.noun}` } };
      const half = vals[i] % step !== 0;
      const kind = L === 1 ? pick(['read', 'read', 'most']) : pick(['read', 'more', 'most', L === 3 ? 'total' : 'read']);
      if (kind === 'read' || half) {
        return num(`Look at the bar chart. How many children chose **${items[i]}**?`, vals[i],
          ['Go to the top of the bar, then look across to the scale on the left.',
            `The scale goes up in ${step}s: 0, ${step}, ${2 * step}, ${3 * step}, …${half ? ` The top of the ${items[i]} bar is halfway between two lines.` : ''}`],
          half ? `The bar stops halfway between ${vals[i] - step / 2} and ${vals[i] + step / 2}, so ${vals[i]} children chose ${items[i]}.` : `The top of the ${items[i]} bar lines up with ${vals[i]}.`, viz);
      }
      if (kind === 'more') {
        const j = retry(() => { const x = R(0, items.length - 1); return x !== i ? x : null; });
        const [a, b] = vals[i] > vals[j] ? [i, j] : [j, i];
        return num(`Look at the bar chart. How many more children chose **${items[a]}** than **${items[b]}**?`, vals[a] - vals[b],
          ['Read both bars, then subtract the smaller number from the bigger one.', `The ${items[a]} bar shows ${vals[a]}.`],
          `${items[a]}: ${vals[a]}. ${items[b]}: ${vals[b]}. ${vals[a]} − ${vals[b]} = ${vals[a] - vals[b]}.`, viz);
      }
      if (kind === 'total') {
        return num('Look at the bar chart. How many children voted altogether?', sum(vals),
          ['Read every bar, then add them all up.', `The first two bars show ${vals[0]} and ${vals[1]}.`],
          `${vals.join(' + ')} = ${sum(vals)} children.`, viz);
      }
      const most = coin(0.6), v = most ? Math.max(...vals) : Math.min(...vals), ans = items[vals.indexOf(v)];
      return choice(`Look at the bar chart. Which ${t.noun} was the **${most ? 'most' : 'least'}** popular?`, ans, items,
        [`The ${most ? 'most' : 'least'} popular has the ${most ? 'tallest' : 'shortest'} bar.`, 'Compare the heights of the bars.'],
        `${ans} has the ${most ? 'tallest' : 'shortest'} bar (${v}), so it was the ${most ? 'most' : 'least'} popular.`, viz, 5);
    };

    const pictoQ = L => {
      const per = pick(L === 2 ? [2, 5, 10] : [2, 10]);
      const { t, items, vals: base } = makeData(4, per, 1, 6);
      const vals = base.slice(), i = R(0, items.length - 1);
      if (L === 3) { vals[i] = base[i] + per / 2; if (coin()) { const j = (i + 1) % items.length; vals[j] = base[j] + per / 2; } }
      const viz = { visual: { type: 'pictogram', rows: items.map((x, k) => ({ label: x, count: vals[k] })), symbol: '🙂', per, title: `Favourite ${t.noun}` } };
      const kind = L === 2 ? pick(['read', 'read', 'more']) : pick(['read', 'total', 'more']);
      const full = Math.floor(vals[i] / per), half = vals[i] % per !== 0;
      if (kind === 'read') {
        return num(`Look at the pictogram. How many children chose **${items[i]}**?`, vals[i],
          [`Look at the key: each 🙂 stands for ${per} children.`,
            half ? `${items[i]} has ${full} whole 🙂 and half a 🙂. ${full} × ${per} = ${full * per}.` : `Count the 🙂 in the ${items[i]} row, then multiply by ${per}.`],
          half ? `${full} × ${per} = ${full * per}. Half a 🙂 is ${per / 2}. ${full * per} + ${per / 2} = ${vals[i]} children.` : `There are ${full} 🙂. ${full} × ${per} = ${vals[i]} children.`, viz);
      }
      if (kind === 'more') {
        const j = (i + 1 + R(0, items.length - 2)) % items.length, [a, b] = vals[i] > vals[j] ? [i, j] : [j, i];
        return num(`Look at the pictogram. How many more children chose **${items[a]}** than **${items[b]}**?`, vals[a] - vals[b],
          [`Use the key (🙂 = ${per}) to work out both numbers, then subtract.`, `${items[a]}: ${vals[a]} children.`],
          `${items[a]}: ${vals[a]}. ${items[b]}: ${vals[b]}. ${vals[a]} − ${vals[b]} = ${vals[a] - vals[b]}.`, viz);
      }
      return num('Look at the pictogram. How many children voted altogether?', sum(vals),
        [`Use the key (🙂 = ${per}) to find each row, then add them all.`, `${items[0]}: ${vals[0]} children. ${items[1]}: ${vals[1]} children.`],
        `${vals.join(' + ')} = ${sum(vals)} children.`, viz);
    };

    const showQ = () => {
      const per = pick([2, 10]), full = R(2, 6), half = coin(0.7), c = full * per + (half ? per / 2 : 0);
      const S = x => `${x} 🙂`;
      const ans = half ? `${full} and a half 🙂` : S(full);
      return choice(`In a pictogram, 🙂 stands for ${per} children. How should ${c} children be shown?`, ans,
        [S(c), S(full + 1), half ? S(full) : `${full} and a half 🙂`],
        [`Each 🙂 is ${per} children, so count in ${per}s.`, `${full} × ${per} = ${full * per}.${half ? ` Half a 🙂 is ${per / 2}.` : ''}`],
        half ? `${full} × ${per} = ${full * per}, and ${per / 2} more is half a 🙂. So ${c} is shown as ${full} and a half 🙂.` : `${full} × ${per} = ${c}, so ${c} is shown as ${full} 🙂.`);
    };

    PMLM.registerSkill({
      id: 'g4.charts', grade: 4, unit: 'g4.u5', title: 'Tables and charts', icon: '📊',
      blurb: 'Read tally charts, frequency tables, bar charts, pictograms',
      lesson: [
        { title: 'Tally and frequency',
          text: 'We use **tally marks** to count. Every 5th mark goes across the other 4, so you can count in 5s.\n**Frequency** means "how many". Cat has a frequency of 7.',
          visual: { type: 'tally', rows: [{ label: 'Cat', count: 7 }, { label: 'Dog', count: 12 }, { label: 'Fish', count: 4 }] } },
        { title: 'Bar charts',
          text: 'The height of each bar shows how many.\nRead across from the top of the bar to the scale. This scale goes up in **5s**.\nWhen a bar stops halfway between two lines, it is halfway between the numbers.',
          visual: { type: 'barChart', bars: [{ label: 'Red', value: 15 }, { label: 'Blue', value: 25 }, { label: 'Green', value: 10 }], step: 5, yLabel: 'Number of children' } },
        { title: 'Pictograms',
          text: 'In a pictogram each picture stands for an amount. **Always look at the key!**\nHere 🙂 = 10 children, so half a 🙂 = 5 children.\nSpring: 2 × 10 = 20. Summer: 3 × 10 + 5 = 35.',
          visual: { type: 'pictogram', rows: [{ label: 'Spring', count: 20 }, { label: 'Summer', count: 35 }], symbol: '🙂', per: 10 } },
        { title: 'Worked example',
          text: 'In a pictogram, 🙂 = 2 children. The Tennis row has 4 and a half 🙂. How many children chose Tennis?\n**1.** 4 whole 🙂: 4 × 2 = 8.\n**2.** Half a 🙂: half of 2 = 1.\n**3.** 8 + 1 = 9.\nAnswer: **9 children**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [tallyQ, tallyQ, freqQ, barQ, barQ],
          [freqQ, barQ, barQ, pictoQ, pictoQ],
          [freqQ, barQ, barQ, pictoQ, pictoQ, showQ],
        ], ctx);
      },
    });
  }

  /* 23 ── Venn and Carroll diagrams */
  {
    const PROPS = [
      { name: 'Even', not: 'Odd', adj: 'even', nadj: 'odd', t: n => n % 2 === 0 },
      { name: 'Multiple of 5', not: 'Not a multiple of 5', adj: 'a multiple of 5', nadj: 'not a multiple of 5', t: n => n % 5 === 0 },
      { name: 'Multiple of 3', not: 'Not a multiple of 3', adj: 'a multiple of 3', nadj: 'not a multiple of 3', t: n => n % 3 === 0 },
      { name: 'More than 50', not: '50 or less', adj: 'more than 50', nadj: '50 or less', t: n => n > 50 },
      { name: 'Multiple of 4', not: 'Not a multiple of 4', adj: 'a multiple of 4', nadj: 'not a multiple of 4', t: n => n % 4 === 0 },
      { name: 'Multiple of 10', not: 'Not a multiple of 10', adj: 'a multiple of 10', nadj: 'not a multiple of 10', t: n => n % 10 === 0 },
    ];
    const PAIRS = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3], [4, 3], [4, 1], [2, 4], [5, 3], [2, 5]];
    const pickPair = () => { const [a, b] = pick(PAIRS); return coin() ? [PROPS[a], PROPS[b]] : [PROPS[b], PROPS[a]]; };
    const desc = (P, n) => (P.t(n) ? P.adj : P.nadj);
    const pickNum = (ok, used) => retry(() => { const n = R(2, 99); return ok(n) && !used.includes(n) ? n : null; });

    const carrollCell = () => {
      const [A, B] = pickPair();
      const cells = [[true, true], [false, true], [true, false], [false, false]]; // [inA, inB] for (row B, col A) order below
      const test = (ca, rb) => n => A.t(n) === ca && B.t(n) === rb;
      const used = [], nums = {};
      for (const [ca, rb] of cells) { const k = `${ca}${rb}`; nums[k] = [pickNum(test(ca, rb), used)]; used.push(nums[k][0]); nums[k].push(pickNum(test(ca, rb), used)); used.push(nums[k][1]); }
      const [tca, trb] = pick(cells), tk = `${tca}${trb}`;
      const ans = pickNum(test(tca, trb), used); used.push(ans);
      const wrongs = cells.filter(([ca, rb]) => `${ca}${rb}` !== tk).map(([ca, rb]) => { const w = pickNum(test(ca, rb), used); used.push(w); return w; });
      const cellTxt = (ca, rb) => nums[`${ca}${rb}`].join(', ') + (`${ca}${rb}` === tk ? ', **?**' : '');
      const viz = { type: 'table', headers: ['', A.name, A.not], rows: [[`**${B.name}**`, cellTxt(true, true), cellTxt(false, true)], [`**${B.not}**`, cellTxt(true, false), cellTxt(false, false)]] };
      return choice('Which number belongs in the box with the **?** in this Carroll diagram?', String(ans), wrongs.map(String),
        ['A Carroll diagram sorts things two ways: by column and by row. The number must fit both.',
          `The **?** box is in the "${tca ? A.name : A.not}" column and the "${trb ? B.name : B.not}" row.`],
        `${ans} is ${desc(A, ans)} and ${desc(B, ans)}, so it belongs in that box.`, { visual: viz });
    };

    const vennWhere = () => {
      const [A, B] = pickPair(), n = R(2, 99), a = A.t(n), b = B.t(n);
      const OPTS = ['In the overlap of the two circles', `Only in the "${A.name}" circle`, `Only in the "${B.name}" circle`, 'Outside both circles'];
      const ans = a && b ? OPTS[0] : a ? OPTS[1] : b ? OPTS[2] : OPTS[3];
      return choice(`A Venn diagram has two circles: "${A.name}" and "${B.name}".\nWhere does the number ${n} go?`, ans, OPTS,
        [`Ask two questions: Is ${n} ${A.adj}? Is ${n} ${B.adj}?`, `Is ${n} ${A.adj}? ${a ? 'Yes' : 'No'}. Now check: is ${n} ${B.adj}?`],
        `${n} is ${desc(A, n)} and ${desc(B, n)}. So it goes ${ans.charAt(0).toLowerCase() + ans.slice(1)}.`, null, 4);
    };

    const vennWhich = () => {
      const [A, B] = pickPair(), used = [];
      const want = pick(['both', 'onlyA', 'neither']);
      const ok = { both: n => A.t(n) && B.t(n), onlyA: n => A.t(n) && !B.t(n), neither: n => !A.t(n) && !B.t(n) };
      const ans = pickNum(ok[want], used); used.push(ans);
      const others = Object.keys(ok).filter(k => k !== want).map(k => { const w = pickNum(ok[k], used); used.push(w); return w; });
      const extra = pickNum(n => !A.t(n) && B.t(n), used);
      const where = { both: 'in the overlap of the two circles', onlyA: `in the "${A.name}" circle but not in the "${B.name}" circle`, neither: 'outside both circles' }[want];
      return choice(`A Venn diagram has two circles: "${A.name}" and "${B.name}".\nWhich number goes ${where}?`, String(ans), [...others, extra].map(String),
        [`For each number, ask: Is it ${A.adj}? Is it ${B.adj}?`, `${others[0]} is ${desc(A, others[0])} and ${desc(B, others[0])}.`],
        `${ans} is ${desc(A, ans)} and ${desc(B, ans)}, so it goes ${where}.`);
    };

    const SETS = [
      { cols: ['Has a pet', 'No pet'], rows: ['Has a brother or sister', 'No brother or sister'],
        cell: (r, c) => `How many children have ${c ? 'no pet' : 'a pet'} and ${r ? 'no brother or sister' : 'a brother or sister'}?`,
        col: c => `How many children have ${c ? 'no pet' : 'a pet'}?`, row: r => `How many children have ${r ? 'no brother or sister' : 'a brother or sister'}?` },
      { cols: ['Can swim', 'Cannot swim'], rows: ['Girls', 'Boys'],
        cell: (r, c) => `How many ${r ? 'boys' : 'girls'} ${c ? 'cannot swim' : 'can swim'}?`,
        col: c => `How many children ${c ? 'cannot swim' : 'can swim'}?`, row: r => `How many ${r ? 'boys' : 'girls'} are there?` },
      { cols: ['Wears glasses', 'No glasses'], rows: ['Age 8', 'Age 9'],
        cell: (r, c) => `How many ${r ? '9' : '8'}-year-olds ${c ? 'do not wear glasses' : 'wear glasses'}?`,
        col: c => `How many children ${c ? 'do not wear glasses' : 'wear glasses'}?`, row: r => `How many ${r ? '9' : '8'}-year-olds are there?` },
    ];

    const carrollCount = L => {
      const S = pick(SETS), v = [[R(2, 15), R(2, 15)], [R(2, 15), R(2, 15)]];
      const viz = { type: 'table', headers: ['', S.cols[0], S.cols[1]], rows: [[`**${S.rows[0]}**`, v[0][0], v[0][1]], [`**${S.rows[1]}**`, v[1][0], v[1][1]]] };
      const kind = L === 2 ? pick(['cell', 'col', 'row']) : pick(['col', 'row', 'total']);
      const r = R(0, 1), c = R(0, 1);
      if (kind === 'cell') return num(`This Carroll diagram shows some children in a class.\n${S.cell(r, c)}`, v[r][c],
        ['Find the right column and the right row. The answer is where they meet.', `Look in the "${S.cols[c]}" column.`],
        `The "${S.cols[c]}" column and the "${S.rows[r]}" row meet at ${v[r][c]}.`, { visual: viz });
      if (kind === 'col') return num(`This Carroll diagram shows some children in a class.\n${S.col(c)}`, v[0][c] + v[1][c],
        [`Everyone in the "${S.cols[c]}" column counts. Add both boxes in that column.`, `The "${S.cols[c]}" column has ${v[0][c]} and ${v[1][c]}.`],
        `${v[0][c]} + ${v[1][c]} = ${v[0][c] + v[1][c]}.`, { visual: viz });
      if (kind === 'row') return num(`This Carroll diagram shows some children in a class.\n${S.row(r)}`, v[r][0] + v[r][1],
        [`Everyone in the "${S.rows[r]}" row counts. Add both boxes in that row.`, `The "${S.rows[r]}" row has ${v[r][0]} and ${v[r][1]}.`],
        `${v[r][0]} + ${v[r][1]} = ${v[r][0] + v[r][1]}.`, { visual: viz });
      const tot = v[0][0] + v[0][1] + v[1][0] + v[1][1];
      return num('This Carroll diagram shows some children in a class.\nHow many children are in the class altogether?', tot,
        ['Every child is in exactly one box. Add all four boxes.', `The top row: ${v[0][0]} + ${v[0][1]} = ${v[0][0] + v[0][1]}.`],
        `${v[0][0]} + ${v[0][1]} + ${v[1][0]} + ${v[1][1]} = ${tot} children.`, { visual: viz });
    };

    const vennCount = () => {
      const [x, y] = pick([['football', 'swimming'], ['cats', 'dogs'], ['apples', 'bananas'], ['reading', 'painting']]);
      const a = R(3, 12), b = R(2, 9), c = R(3, 12), d = R(1, 8);
      const viz = { type: 'table', headers: [`Only ${x}`, 'Both', `Only ${y}`, 'Neither'], rows: [[a, b, c, d]] };
      const k = R(1, 4);
      const intro = `Some children were asked if they like ${x} and ${y}. The table shows the four parts of a Venn diagram.`;
      if (k === 1) return num(`${intro}\nHow many children like ${x}?`, a + b,
        [`The "${x}" circle includes the children who like only ${x} AND the children who like both.`, `Only ${x}: ${a}. Both: ${b}.`],
        `${a} + ${b} = ${a + b} children like ${x}.`, { visual: viz });
      if (k === 2) return num(`${intro}\nHow many children like ${y}?`, c + b,
        [`The "${y}" circle includes the children who like only ${y} AND the children who like both.`, `Only ${y}: ${c}. Both: ${b}.`],
        `${c} + ${b} = ${b + c} children like ${y}.`, { visual: viz });
      if (k === 3) return num(`${intro}\nHow many children were asked altogether?`, a + b + c + d,
        ['Every child is in exactly one part. Add all four parts.', `${a} + ${b} = ${a + b}.`],
        `${a} + ${b} + ${c} + ${d} = ${a + b + c + d} children.`, { visual: viz });
      return num(`${intro}\nHow many children like at least one of ${x} or ${y}?`, a + b + c,
        ['Count everyone inside the circles: only one, only the other, and both. Leave out "Neither".', `${a} + ${b} = ${a + b}.`],
        `${a} + ${b} + ${c} = ${a + b + c} children.`, { visual: viz });
    };

    PMLM.registerSkill({
      id: 'g4.venn', grade: 4, unit: 'g4.u5', title: 'Venn and Carroll diagrams', icon: '⭕',
      blurb: 'Sort numbers and things with Venn and Carroll diagrams',
      lesson: [
        { title: 'Carroll diagrams',
          text: 'A **Carroll diagram** sorts things two ways, using columns and rows.\nEach number goes in the box where its column and its row meet.\n12 is even and not a multiple of 5.',
          visual: { type: 'table', headers: ['', 'Even', 'Odd'], rows: [['**Multiple of 5**', '10, 20', '15, 35'], ['**Not a multiple of 5**', '12, 8', '7, 21']] } },
        { title: 'Venn diagrams',
          text: 'A **Venn diagram** has circles that overlap.\nNumbers that fit **both** labels go in the **overlap** (the middle).\nNumbers that fit **neither** go **outside** both circles.' },
        { title: 'The four parts',
          text: 'A Venn diagram with circles "Even" and "Multiple of 3" has four parts:',
          visual: { type: 'table', headers: ['Only even', 'Both (overlap)', 'Only multiple of 3', 'Outside'], rows: [['4, 8, 10', '6, 12, 18', '3, 9, 15', '5, 7, 11']] } },
        { title: 'Worked example',
          text: 'Where does 30 go in a Venn diagram with circles "Even" and "Multiple of 5"?\n**1.** Is 30 even? Yes (it ends in 0).\n**2.** Is 30 a multiple of 5? Yes (it ends in 0).\n**3.** It fits both, so it goes in the overlap.\nAnswer: **in the overlap**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [carrollCell, carrollCell, vennWhere, vennWhere],
          [carrollCell, vennWhere, vennWhich, carrollCount, vennCount],
          [carrollCell, vennWhich, carrollCount, carrollCount, vennCount, vennCount],
        ], ctx);
      },
    });
  }

  /* 24 ── Probability words */
  {
    const WORDS = ['impossible', 'unlikely', 'even chance', 'likely', 'certain'];
    const COLS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const wordFor = (c, tot) => (c === 0 ? 'impossible' : c === tot ? 'certain' : 2 * c === tot ? 'even chance' : 2 * c < tot ? 'unlikely' : 'likely');
    const reason = (c, tot) => (c === 0 ? 'none of them' : c === tot ? 'all of them' : 2 * c === tot ? 'exactly half' : 2 * c < tot ? 'less than half' : 'more than half');
    const nearWords = (w, k) => {
      const i = WORDS.indexOf(w);
      return U.shuffle(WORDS.filter(x => x !== w)).sort((a, b) => Math.abs(WORDS.indexOf(a) - i) - Math.abs(WORDS.indexOf(b) - i)).slice(0, k);
    };
    const an = w => (w === 'even chance' ? 'an even chance' : w);
    const isAre = c => (c === 1 ? 'is' : 'are');
    const spinnerOf = list => ({ type: 'spinner', sectors: U.shuffle(list).map(c => ({ color: c, label: c[0].toUpperCase() })) });

    const spinnerQ = L => {
      const k = L === 1 ? 4 : pick([4, 6, 8]), [col, o1, o2] = U.sample(COLS, 3);
      const c = L === 1 ? pick([0, 1, 2, 3, 4]) : R(0, k);
      const others = Array.from({ length: k - c }, (_, i) => (i % 2 ? o2 : o1));
      const w = wordFor(c, k);
      return choice(`The arrow on this spinner is spun. How likely is it to land on **${col}**?`, w, nearWords(w, L === 1 ? 3 : 4),
        [`Count how many parts are ${col}. Compare with the total number of parts.`, `There are ${k} equal parts. ${c === 0 ? 'None' : c} of them ${c === 1 ? 'is' : 'are'} ${col}.`],
        `${c} out of ${k} parts ${isAre(c)} ${col}. That is ${reason(c, k)}, so it is ${an(w)}.`,
        { visual: spinnerOf([...Array(c).fill(col), ...others]) }, 5);
    };

    const bagQ = L => {
      const [col, o1] = U.sample(COLS, 2), tot = L === 1 ? R(4, 10) : R(6, 16);
      const c = L === 1 ? pick([0, Math.floor(tot / 2) === tot / 2 ? tot / 2 : 1, tot, 1, tot - 1]) : R(0, tot);
      const w = wordFor(c, tot);
      const items = [{ color: col, count: c }, { color: o1, count: tot - c }].filter(x => x.count > 0);
      return choice(`You pick one marble from this bag without looking. How likely is it to be **${col}**?`, w, nearWords(w, L === 1 ? 3 : 4),
        [`Count the ${col} marbles and all the marbles. Is it none, less than half, half, more than half, or all of them?`, `There are ${tot} marbles. ${c === 0 ? 'None' : c} of them ${c === 1 ? 'is' : 'are'} ${col}.`],
        `${c} out of ${tot} marbles ${isAre(c)} ${col}. That is ${reason(c, tot)}, so it is ${an(w)}.`,
        { visual: { type: 'bag', items } }, 5);
    };

    const mostLikely = () => retry(() => {
      const cols = U.sample(COLS, 3), counts = [R(1, 4), R(1, 4), R(1, 4)];
      const k = sum(counts);
      if (k > 12 || k < 4) return null;
      const most = coin(0.6), v = most ? Math.max(...counts) : Math.min(...counts);
      if (counts.filter(x => x === v).length > 1) return null;
      const ans = cols[counts.indexOf(v)];
      const list = []; cols.forEach((c, i) => { for (let j = 0; j < counts[i]; j++) list.push(c); });
      return choice(`Which colour is the arrow **${most ? 'most' : 'least'}** likely to land on?`, ans, cols,
        [`The colour with the ${most ? 'most' : 'fewest'} parts is the ${most ? 'most' : 'least'} likely.`, 'Count the parts of each colour.'],
        `${cols.map((c, i) => `${c}: ${counts[i]}`).join(', ')}. ${Cap2(ans)} has the ${most ? 'most' : 'fewest'} parts.`,
        { visual: spinnerOf(list) }, 3);
    });
    const Cap2 = s => s[0].toUpperCase() + s.slice(1);

    const EVENTS = [
      ['a number less than 7', [1, 2, 3, 4, 5, 6]], ['a 7', []], ['an even number', [2, 4, 6]], ['an odd number', [1, 3, 5]],
      ['a 6', [6]], ['a number bigger than 1', [2, 3, 4, 5, 6]], ['a number less than 3', [1, 2]], ['a number more than 2', [3, 4, 5, 6]],
      ['a number from 1 to 6', [1, 2, 3, 4, 5, 6]], ['a 0', []], ['a number bigger than 3', [4, 5, 6]],
    ];
    const diceQ = () => {
      const [ev, ok] = pick(EVENTS), w = wordFor(ok.length, 6);
      return choice(`You roll an ordinary dice numbered 1 to 6. How likely is it that you roll ${ev}?`, w, nearWords(w, 4),
        ['List the numbers you could roll: 1, 2, 3, 4, 5, 6. How many of them match?', `The numbers that match are: ${ok.length ? ok.join(', ') : 'none'}.`],
        `${ok.length} out of 6 numbers match. That is ${reason(ok.length, 6)}, so it is ${an(w)}.`, null, 5);
    };

    const whichEvent = () => retry(() => {
      const want = pick(['certain', 'impossible', 'even chance']);
      const good = EVENTS.filter(e => wordFor(e[1].length, 6) === want), bad = EVENTS.filter(e => wordFor(e[1].length, 6) !== want);
      const ans = pick(good), wr = U.sample(bad, 3);
      return choice(`You roll an ordinary dice numbered 1 to 6. Which of these is **${want === 'even chance' ? 'an even chance' : want}**?`, `Rolling ${ans[0]}`, wr.map(e => `Rolling ${e[0]}`),
        [want === 'certain' ? 'Certain means it will definitely happen, whatever you roll.' : want === 'impossible' ? 'Impossible means it can never happen.' : 'An even chance means exactly half of the numbers match: 3 out of 6.',
          `Check each one. Rolling ${wr[0][0]}: the numbers that match are ${wr[0][1].length ? wr[0][1].join(', ') : 'none'}.`],
        `Rolling ${ans[0]}: ${ans[1].length} out of 6 numbers match, so it is ${an(want)}.`);
    });

    const makeEven = () => {
      const b = R(4, 9), r = R(1, b - 1), [cr, cb] = pick([['red', 'blue'], ['green', 'yellow'], ['purple', 'orange']]);
      return num(`A bag has ${r} ${cr} and ${b} ${cb} marbles. How many more ${cr} marbles must be added so that there is an even chance of picking ${cr}?`, b - r,
        [`An even chance means half and half: the same number of ${cr} and ${cb} marbles.`, `There are ${b} ${cb} marbles, so you need ${b} ${cr} marbles altogether.`],
        `You need ${b} ${cr} marbles to match the ${b} ${cb} ones. ${b} − ${r} = ${b - r} more.`,
        { visual: { type: 'bag', items: [{ color: cr, count: r }, { color: cb, count: b }] } });
    };

    const spot = () => {
      const [col, o] = U.sample(COLS, 2), who = U.name();
      const t = pick([[1, 'impossible'], [3, 'certain'], [2, 'likely'], [1, 'even chance'], [3, 'even chance']]);
      const [c, said] = t, w = wordFor(c, 4);
      return choice(`${who} says landing on ${col} is **${an(said)}**. That is wrong. Which word should ${who} use?`, w, WORDS.filter(x => x !== said && x !== w),
        [`Count the ${col} parts and compare with the total.`, `${c} out of 4 parts ${isAre(c)} ${col}.`],
        `${c} out of 4 is ${reason(c, 4)}, so landing on ${col} is ${an(w)}, not ${an(said)}.`,
        { visual: spinnerOf([...Array(c).fill(col), ...Array(4 - c).fill(o)]) });
    };

    PMLM.registerSkill({
      id: 'g4.chance', grade: 4, unit: 'g4.u5', title: 'Chance', icon: '🎲',
      blurb: 'Certain, likely, even chance, unlikely or impossible?',
      lesson: [
        { title: 'How likely is it?',
          text: '**Probability** is about how likely something is to happen. We use these words:',
          visual: { type: 'table', headers: ['Word', 'Meaning'], rows: [['impossible', 'It can never happen.'], ['unlikely', 'It probably won\'t happen.'], ['even chance', 'Just as likely to happen as not (half and half).'], ['likely', 'It probably will happen.'], ['certain', 'It will definitely happen.']] } },
        { title: 'Spinners',
          text: 'This spinner has 4 equal parts: 3 red and 1 blue.\nLanding on red is **likely** (more than half).\nLanding on blue is **unlikely** (less than half).\nLanding on green is **impossible** (there is no green).',
          visual: { type: 'spinner', sectors: [{ color: 'red', label: 'R' }, { color: 'blue', label: 'B' }, { color: 'red', label: 'R' }, { color: 'red', label: 'R' }] } },
        { title: 'Bags of marbles',
          text: 'This bag has 4 red and 4 blue marbles.\nPicking red has an **even chance**: exactly half the marbles are red.',
          visual: { type: 'bag', items: [{ color: 'red', count: 4 }, { color: 'blue', count: 4 }] } },
        { title: 'Worked example',
          text: 'A bag has 6 green marbles and 2 yellow marbles. You pick one without looking. How likely is yellow?\n**1.** Count: 2 yellow out of 8 marbles.\n**2.** 2 is less than half of 8.\n**3.** It could happen, so it is not impossible.\nAnswer: **unlikely**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [spinnerQ, spinnerQ, bagQ, bagQ],
          [spinnerQ, bagQ, mostLikely, diceQ],
          [spinnerQ, bagQ, diceQ, whichEvent, makeEven, spot],
        ], ctx);
      },
    });
  }

  // ── END ──
})();
