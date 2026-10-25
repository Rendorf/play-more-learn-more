// Play More Learn More — Cambridge Lower Secondary Stage 8 (Grade 8, age ~13).
// 6 units, 22 skills. See src/CONTRACT.md for the shapes used here.
(() => {
  // ───────────────────────── local helpers ─────────────────────────
  const M = U.MINUS;
  const F = U.fmt;
  const R = U.rint;
  const pick = U.pick;
  const fr = U.frac;
  const P = x => (x < 0 ? `(${F(x)})` : F(x));            // bracket negatives: (−3)
  const A = x => F(Math.abs(x));                          // size without sign
  const sgn = () => (Math.random() < 0.5 ? -1 : 1);
  const nz = (a, b) => { let v = 0; while (v === 0) v = R(a, b); return v; };
  const retry = (fn, tries = 3000) => {
    for (let i = 0; i < tries; i++) { const r = fn(); if (r) return r; }
    throw new Error('generator could not find good numbers');
  };
  // pick a format function for this level and run it
  const byLevel = (level, sets, ctx) => pick(sets[Math.min(Math.max(level, 1), sets.length) - 1])(level, ctx);

  const num = (q, answer, hints, explain, extra) =>
    Object.assign({ q, kind: 'number', answer: U.clean(answer), hints, explain }, extra || {});
  const choice = (q, answer, wrongs, hints, explain, extra) => {
    const a = String(answer);
    const w = [...new Set(wrongs.map(String))].filter(x => x !== a && x !== '' && !/NaN|undefined|Infinity/.test(x));
    return Object.assign({ q, kind: 'choice', answer: a, choices: U.choices(a, w, 4), hints, explain }, extra || {});
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
  const ex = terms => U.expr(terms);
  const sum = arr => arr.reduce((s, v) => s + v, 0);

  // ═══════════════════════ Unit 1: Integers and powers ═══════════════════════
  PMLM.registerUnit({ id: 'g8.u1', grade: 8, name: 'Integers and powers', icon: '➗' });

  /* 1 ── Multiplying and dividing negative numbers */
  {
    const RULE = 'Same signs give a positive answer. Different signs give a negative answer.';
    const signs = (a, b) => ((a < 0) === (b < 0)
      ? 'the same, so the answer is positive'
      : 'different, so the answer is negative');
    const pairWithNeg = big => {
      let x = R(2, big) * sgn(), y = R(2, big) * sgn();
      if (x > 0 && y > 0) { if (Math.random() < 0.5) x = -x; else y = -y; }
      return [x, y];
    };

    const basic = L => {
      const [x, y] = pairWithNeg(L >= 2 ? 12 : 9);
      if (Math.random() < 0.5) {
        const ans = x * y;
        return num(`Work out ${F(x)} × ${P(y)}`, ans,
          [RULE, `Ignore the signs first: ${A(x)} × ${A(y)} = ${A(ans)}. Now decide: is the answer positive or negative?`],
          `The signs are ${signs(x, y)}. So ${F(x)} × ${P(y)} = ${F(ans)}.`);
      }
      const p = x * y; // p ÷ y = x
      return num(`Work out ${F(p)} ÷ ${P(y)}`, x,
        [`Division uses the same sign rules as multiplication. ${RULE}`,
          `Ignore the signs first: ${A(p)} ÷ ${A(y)} = ${A(x)}. Now decide: is the answer positive or negative?`],
        `The signs are ${signs(p, y)}. So ${F(p)} ÷ ${P(y)} = ${F(x)}.`);
    };

    const triple = () => {
      let a = R(2, 6) * sgn();
      const b = R(2, 5) * sgn(), c = R(2, 5) * sgn();
      if (a > 0 && b > 0 && c > 0) a = -a;
      const ab = a * b, ans = ab * c;
      const negs = [a, b, c].filter(v => v < 0).length;
      return num(`Work out ${F(a)} × ${P(b)} × ${P(c)}`, ans,
        ['Multiply two numbers at a time, using the sign rules each time.',
          `First pair: ${F(a)} × ${P(b)} = ${F(ab)}. Now multiply ${P(ab)} by ${P(c)}.`],
        `${A(a)} × ${A(b)} × ${A(c)} = ${A(ans)}. There ${negs === 1 ? 'is 1 negative sign (odd)' : `are ${negs} negative signs (${negs % 2 ? 'odd' : 'even'})`}, so the answer is ${F(ans)}.`);
    };

    const missing = () => {
      let [x, y] = pairWithNeg(9);
      const p = x * y;
      if (Math.random() < 0.5) {
        return num(`Find the missing number.\n□ × ${P(y)} = ${F(p)}`, x,
          [`Use the inverse: to undo × ${P(y)}, divide by ${P(y)}.`,
            `□ = ${F(p)} ÷ ${P(y)}. Without signs, ${A(p)} ÷ ${A(y)} = ${A(x)}. Now choose the sign.`],
          `□ = ${F(p)} ÷ ${P(y)} = ${F(x)}. Check: ${F(x)} × ${P(y)} = ${F(p)}.`);
      }
      return num(`Find the missing number.\n${F(p)} ÷ □ = ${F(x)}`, y,
        [`Ask: what do I divide ${F(p)} by to get ${F(x)}? Work out ${F(p)} ÷ ${P(x)}.`,
          `Without signs, ${A(p)} ÷ ${A(x)} = ${A(y)}. Now choose the sign.`],
        `□ = ${F(p)} ÷ ${P(x)} = ${F(y)}. Check: ${F(p)} ÷ ${P(y)} = ${F(x)}.`);
    };

    const realL1 = () => {
      const d = R(2, 6), h = R(3, 8);
      if (Math.random() < 0.5) {
        return num(`The temperature changes by ${M}${d} °C every hour.\nWhat is the total change after ${h} hours?`, -d * h,
          ['A fall in temperature is a negative change. Multiply the change each hour by the number of hours.',
            `Work out ${h} × (${M}${d}). Without signs, ${h} × ${d} = ${h * d}.`],
          `${h} × (${M}${d}) = ${F(-d * h)}, so the total change is ${F(-d * h)} °C.`, { unit: '°C' });
      }
      return num(`A diver goes down ${d} m every minute. Her depth changes by ${M}${d} m each minute.\nWhat is the total change in depth after ${h} minutes?`, -d * h,
        ['Going down is a negative change. Multiply the change each minute by the number of minutes.',
          `Work out ${h} × (${M}${d}). Without signs, ${h} × ${d} = ${h * d}.`],
        `${h} × (${M}${d}) = ${F(-d * h)}, so the change is ${F(-d * h)} m.`, { unit: 'm' });
    };

    const realL2 = () => {
      const per = R(2, 7), h = R(3, 8), tot = per * h;
      return num(`Over ${h} hours the temperature changes by ${M}${tot} °C. It changes by the same amount each hour.\nWhat is the change each hour?`, -per,
        ['Share the total change equally: divide by the number of hours.',
          `Work out ${M}${tot} ÷ ${h}. Without signs, ${tot} ÷ ${h} = ${per}.`],
        `${M}${tot} ÷ ${h} = ${M}${per} (different signs give a negative answer). The change is ${M}${per} °C each hour.`, { unit: '°C' });
    };

    const spotNum = () => {
      const a = R(2, 9), b = R(2, 9), who = U.name();
      return num(`${who} says ${M}${a} × (${M}${b}) = ${M}${a * b}.\nWhat is the correct answer?`, a * b,
        ['Look at the signs. Are they the same or different?',
          `Without signs, ${a} × ${b} = ${a * b}. Now look at the two signs: same or different?`],
        `Two negatives multiply to give a positive, so ${M}${a} × (${M}${b}) = ${a * b}.`);
    };

    const mixedOps = () => {
      const t = R(1, 4);
      if (t === 1) {
        const x = R(2, 9) * sgn(), y = R(2, 9) * sgn(), w = R(2, 6) * sgn(), k = R(2, 9) * sgn();
        const z = w * k, xy = x * y, ans = xy + k;
        return num(`Work out ${F(x)} × ${P(y)} + ${P(z)} ÷ ${P(w)}`, ans,
          ['Do × and ÷ before +. Use the sign rules for each part.',
            `${F(x)} × ${P(y)} = ${F(xy)} and ${P(z)} ÷ ${P(w)} = ${F(k)}. Now add these two answers.`],
          `${F(xy)} + ${P(k)} = ${F(ans)}.`);
      }
      if (t === 2) {
        const a = -R(6, 14), b = R(1, 5), c = R(2, 6) * sgn(), s = a + b, ans = s * c;
        return num(`Work out (${F(a)} + ${b}) × ${P(c)}`, ans,
          ['Brackets first, then multiply.',
            `${F(a)} + ${b} = ${F(s)}. Now work out ${P(s)} × ${P(c)}.`],
          `(${F(a)} + ${b}) = ${F(s)}, and ${P(s)} × ${P(c)} = ${F(ans)}.`);
      }
      if (t === 3) {
        const a = R(2, 6), b = R(2, 6), c = -R(2, 6), ans = a * a + b * c;
        return num(`Work out (${M}${a})^{2} + ${b} × ${P(c)}`, ans,
          ['Indices first, then ×, then +. A negative number squared is positive.',
            `(${M}${a})^{2} = (${M}${a}) × (${M}${a}) = ${a * a}. Now work out ${b} × ${P(c)} and add.`],
          `${a * a} + ${b} × ${P(c)} = ${a * a} + ${P(b * c)} = ${F(ans)}.`);
      }
      const right = R(2, 5), wrong = R(1, 3), r = R(2, 6), w = R(3, 9), who = U.name();
      const ans = right * r - wrong * w;
      return num(`In a quiz you score +${right} for a right answer and ${M}${wrong} for a wrong answer.\n${who} gets ${r} right and ${w} wrong. What is ${who}'s score?`, ans,
        ['Work out the points for right answers and for wrong answers, then add them.',
          `Right: ${r} × ${right} = ${r * right}. Wrong: ${w} × (${M}${wrong}) = ${M}${w * wrong}. Now add them.`],
        `${r * right} + (${M}${w * wrong}) = ${F(ans)}, so the score is ${F(ans)}.`);
    };

    const whichCorrect = () => {
      const make = good => {
        const [x, y] = pairWithNeg(9);
        if (Math.random() < 0.5) return `${F(x)} × ${P(y)} = ${F(good ? x * y : -x * y)}`;
        return `${F(x * y)} ÷ ${P(y)} = ${F(good ? x : -x)}`;
      };
      const right = make(true), w1 = make(false);
      return choice('Which calculation is correct?', right, [w1, make(false), make(false), make(false)],
        [RULE + ' Check the sign of each answer.', `${w1} is wrong: its sign should be the other way. Check the others the same way.`],
        `${right} is correct. The other answers have the wrong sign.`);
    };

    PMLM.registerSkill({
      id: 'g8.negatives', grade: 8, unit: 'g8.u1', title: 'Negative × and ÷', icon: '➖',
      blurb: 'Multiply and divide with negative numbers',
      lesson: [
        { title: 'Same signs → positive',
          text: 'When two numbers have the **same sign**, the answer is **positive**.\n4 × 3 = 12\n−4 × (−3) = 12\nTwo negatives cancel each other out.',
          visual: { type: 'table', headers: ['×', '+ number', '− number'], rows: [['+ number', '+', '−'], ['− number', '−', '+']] } },
        { title: 'Different signs → negative',
          text: 'When the signs are **different**, the answer is **negative**.\n3 × (−2) means 3 jumps of −2. You land on −6.\n−5 × 4 = −20',
          visual: { type: 'numberLine', min: -8, max: 2, step: 1, jumps: [{ from: 0, to: -2, label: '−2' }, { from: -2, to: -4, label: '−2' }, { from: -4, to: -6, label: '−2' }] } },
        { title: 'Dividing works the same way',
          text: 'Division follows the same sign rules.\n−20 ÷ (−5) = 4 (same signs)\n18 ÷ (−3) = −6 (different signs)\n**Tip:** work out the numbers first, then decide the sign.' },
        { title: 'Longer calculations',
          text: 'Use the order of operations: brackets, indices, × and ÷, then + and −.\nWith three or more numbers multiplied, count the negative signs: **even** → positive, **odd** → negative.\n−2 × 3 × (−5) = 30 (two negative signs)' },
        { title: 'Worked example',
          text: 'Work out −6 × (−3) + 20 ÷ (−4).\n**1.** × and ÷ first: −6 × (−3) = 18 (same signs).\n**2.** 20 ÷ (−4) = −5 (different signs).\n**3.** Add: 18 + (−5) = 13.\nAnswer: **13**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [basic, basic, basic, realL1, missing],
          [basic, triple, missing, realL2, spotNum, realL1],
          [mixedOps, mixedOps, mixedOps, whichCorrect, triple, missing],
        ], ctx);
      },
    });
  }

  /* 2 ── HCF and LCM using prime factors */
  {
    const expsOf = n => {
      const m = new Map();
      U.primeFactors(n).forEach(p => m.set(p, (m.get(p) || 0) + 1));
      return [...m];
    };
    const powStr = ent => ent.filter(([, e]) => e > 0).map(([p, e]) => (e > 1 ? `${p}^{${e}}` : `${p}`)).join(' × ');
    const pfPow = n => powStr(expsOf(n));
    const pfLong = n => U.primeFactors(n).join(' × ');

    const pfChoice = L => {
      const n = pick(L === 1 ? [12, 18, 20, 24, 28, 36, 40, 45, 50, 54, 56, 60, 72]
        : [84, 90, 96, 108, 120, 126, 132, 150, 168, 180, 196, 200, 210, 252]);
      const ent = expsOf(n);
      const w = [powStr(ent.map(([p, e], i) => [p, i === 0 ? e + 1 : e]))];
      const j = ent.findIndex(([, e]) => e >= 2);
      if (j >= 0) w.push(powStr(ent.map(([p, e], i) => [p, i === j ? e - 1 : e])));
      else w.push(powStr(ent.slice(0, -1)));
      const divs = U.factors(n).filter(d => d > 1 && d * d <= n && (!U.isPrime(d) || !U.isPrime(n / d)));
      if (divs.length) { const d = pick(divs); w.push(`${d} × ${n / d}`); }
      w.push(powStr(ent.map(([p, e], i) => [p, i === ent.length - 1 ? e + 1 : e])));
      const p0 = ent[0][0];
      return choice(`Which shows ${n} as a product of its prime factors?`, pfPow(n), w,
        ['Keep dividing by prime numbers (2, 3, 5, 7, …) until you reach 1. Every factor in the answer must be prime.',
          `Start with the smallest prime: ${n} ÷ ${p0} = ${n / p0}. Keep dividing ${n / p0} by primes.`],
        `${n} = ${pfLong(n)} = ${pfPow(n)}.`);
    };

    const fromPowers = L => {
      const ent = retry(() => {
        const e = [[2, R(1, 3)], [3, R(0, 2)], [5, R(0, L === 1 ? 1 : 2)], [7, L === 1 ? 0 : R(0, 1)]];
        const n = e.reduce((s, [p, k]) => s * Math.pow(p, k), 1);
        return e.filter(([, k]) => k > 0).length >= 2 && n <= (L === 1 ? 200 : 2000) && n > 20 ? e : null;
      });
      const n = ent.reduce((s, [p, k]) => s * Math.pow(p, k), 1);
      const big = ent.filter(([, k]) => k >= 2).map(([p, k]) => `${p}^{${k}} = ${Math.pow(p, k)}`);
      return num(`Which number is ${powStr(ent)}?`, n,
        ['Work out each power first, then multiply everything together.',
          big.length ? `${big.join(' and ')}. Now multiply all the parts together.` : `Multiply the primes one at a time: start with ${ent.filter(([, k]) => k > 0)[0][0]} × ${ent.filter(([, k]) => k > 0)[1][0]}.`],
        `${pfLong(n)} = ${F(n)}.`);
    };

    const pairNums = L => retry(() => {
      const g = L === 1 ? R(2, 6) : R(2, 12);
      const p = R(2, L === 1 ? 5 : 7), q = R(2, L === 1 ? 5 : 7);
      if (p === q || U.gcd(p, q) !== 1) return null;
      const a = g * p, b = g * q;
      if (a < 4 || b > (L === 1 ? 40 : 120)) return null;
      return Math.random() < 0.5 ? { a, b, g, l: g * p * q } : { a: b, b: a, g, l: g * p * q };
    });

    const hcfQ = L => {
      const { a, b, g } = pairNums(L);
      return num(`Find the HCF (highest common factor) of ${a} and ${b}.`, g,
        ['Write each number as a product of primes. The HCF is made from the primes they share.',
          `${a} = ${pfLong(a)} and ${b} = ${pfLong(b)}. Now multiply the primes that are in both lists (count repeats).`],
        `They share ${pfLong(g)}, so the HCF is ${g}.`);
    };
    const lcmQ = L => {
      const { a, b, l } = pairNums(L);
      return num(`Find the LCM (lowest common multiple) of ${a} and ${b}.`, l,
        ['Write each number as a product of primes. The LCM uses every prime, the greatest number of times it appears in either number.',
          `${a} = ${pfLong(a)} and ${b} = ${pfLong(b)}. Now take each prime the most times it appears in one list, and multiply.`],
        `LCM = ${pfLong(l)} = ${l}.`);
    };

    const givenPF = L => {
      const d = retry(() => {
        const primes = [2, 3, 5, 7];
        const ea = primes.map((p, i) => R(0, i >= 2 ? 1 : 3)), eb = primes.map((p, i) => R(0, i >= 2 ? 1 : 3));
        const val = es => primes.reduce((s, p, i) => s * Math.pow(p, es[i]), 1);
        const a = val(ea), b = val(eb);
        const h = primes.reduce((s, p, i) => s * Math.pow(p, Math.min(ea[i], eb[i])), 1);
        const l = primes.reduce((s, p, i) => s * Math.pow(p, Math.max(ea[i], eb[i])), 1);
        const shared = primes.filter((p, i) => Math.min(ea[i], eb[i]) > 0).length;
        if (a === b || a < 10 || b < 10 || shared < 2 || l > 2000 || h === a || h === b) return null;
        return { primes, ea, eb, a, b, h, l };
      });
      const sa = powStr(d.primes.map((p, i) => [p, d.ea[i]])), sb = powStr(d.primes.map((p, i) => [p, d.eb[i]]));
      if (Math.random() < 0.5) {
        const hs = powStr(d.primes.map((p, i) => [p, Math.min(d.ea[i], d.eb[i])]));
        return num(`A = ${sa}\nB = ${sb}\nFind the HCF of A and B as an ordinary number.`, d.h,
          ['For the HCF, use only primes that are in both, each with the **smaller** power.',
            `The HCF is ${hs}. Now work out its value.`],
          `HCF = ${hs} = ${d.h}.`);
      }
      const ls = powStr(d.primes.map((p, i) => [p, Math.max(d.ea[i], d.eb[i])]));
      return num(`A = ${sa}\nB = ${sb}\nFind the LCM of A and B as an ordinary number.`, d.l,
        ['For the LCM, use every prime that appears, each with the **bigger** power.',
          `The LCM is ${ls}. Now work out its value.`],
        `LCM = ${ls} = ${F(d.l)}.`);
    };

    const story = (L, ctx) => {
      const { a, b, g, l } = pairNums(L >= 2 ? 2 : 1);
      const t = R(1, 5);
      const hH = `Is this an HCF question or an LCM question? Write ${a} and ${b} as products of primes.`;
      const h2 = `${a} = ${pfLong(a)} and ${b} = ${pfLong(b)}.`;
      if (t === 1) {
        return num(`Two lights flash together. One flashes every ${a} seconds, the other every ${b} seconds.\nAfter how many seconds will they next flash together?`, l,
          [`"Together again" means a common multiple of ${a} and ${b}. You want the lowest one: the LCM.`, `${h2} Now find the LCM.`],
          `The LCM of ${a} and ${b} is ${l}, so they flash together again after ${l} seconds.`, { unit: 'seconds' });
      }
      if (t === 2) {
        return num(`Bus A leaves every ${a} minutes and bus B every ${b} minutes. Both leave at 8:00.\nHow many minutes until they next leave together?`, l,
          ['Both buses leave at a time that is a multiple of both numbers. Find the LCM.', `${h2} Now find the LCM.`],
          `The LCM of ${a} and ${b} is ${l}, so they next leave together after ${l} minutes.`, { unit: 'minutes' });
      }
      if (t === 3) {
        return num(`Two ribbons are ${a} cm and ${b} cm long. Both are cut into equal pieces, as long as possible, with nothing left over.\nHow long is each piece?`, g,
          ['The piece length must divide both lengths exactly. You want the biggest such number: the HCF.', `${h2} Now find the HCF.`],
          `The HCF of ${a} and ${b} is ${g}, so each piece is ${g} cm long.`, { unit: 'cm' });
      }
      if (t === 4) {
        return num(`${a} pencils and ${b} rubbers are packed into identical packs, with none left over.\nWhat is the greatest number of packs?`, g,
          [hH, `${h2} The number of packs must divide both numbers. Find the HCF.`],
          `The HCF of ${a} and ${b} is ${g}, so the greatest number of packs is ${g}.`, { unit: 'packs' });
      }
      return num(`Cups come in boxes of ${a} and saucers come in boxes of ${b}.\nWhat is the smallest number of cups you can buy so that you can buy exactly the same number of saucers?`, l,
        [hH, `${h2} The number must be in the ${a} times table and the ${b} times table. Find the LCM.`],
        `The LCM of ${a} and ${b} is ${l}, so the smallest number is ${l}.`, { unit: 'cups' });
    };

    const missingNum = () => {
      const { a, b, g, l } = pairNums(2);
      return num(`The HCF of ${a} and a number n is ${g}.\nThe LCM of ${a} and n is ${l}.\nFind n.`, b,
        ['For two numbers, HCF × LCM = the two numbers multiplied together.',
          `HCF × LCM = ${g} × ${l} = ${g * l}. So ${a} × n = ${g * l}.`],
        `n = ${g * l} ÷ ${a} = ${b}.`);
    };

    const three = () => {
      if (Math.random() < 0.5) {
        const [x, y, z] = retry(() => {
          const s = U.sample([2, 3, 4, 5, 6, 8, 9, 10, 12, 15], 3);
          const l = U.lcm(U.lcm(s[0], s[1]), s[2]);
          return l <= 180 ? s : null;
        });
        const l = U.lcm(U.lcm(x, y), z);
        return num(`Find the LCM of ${x}, ${y} and ${z}.`, l,
          ['Write each number as a product of primes. Use each prime the greatest number of times it appears in any one number.',
            `${x} = ${pfLong(x)}, ${y} = ${pfLong(y)}, ${z} = ${pfLong(z)}.`],
          `LCM = ${pfLong(l)} = ${l}.`);
      }
      const { g, ns } = retry(() => {
        const g = R(2, 8), m = U.sample([1, 2, 3, 4, 5, 7], 3);
        if (U.gcd(U.gcd(m[0], m[1]), m[2]) !== 1) return null;
        const ns = m.map(k => k * g).sort((p, q) => p - q);
        return ns[2] <= 60 && ns[0] > 1 ? { g, ns } : null;
      });
      return num(`Find the HCF of ${ns[0]}, ${ns[1]} and ${ns[2]}.`, g,
        ['Write each number as a product of primes. The HCF uses only primes found in all three.',
          `${ns.map(v => `${v} = ${pfLong(v)}`).join(', ')}.`],
        `All three share ${pfLong(g)}, so the HCF is ${g}.`);
    };

    PMLM.registerSkill({
      id: 'g8.hcfLcm', grade: 8, unit: 'g8.u1', title: 'HCF and LCM', icon: '🌳',
      blurb: 'Use prime factors to find the HCF and LCM',
      lesson: [
        { title: 'Prime factor decomposition',
          text: 'Every whole number bigger than 1 can be written as primes multiplied together.\nKeep dividing by primes until you reach 1:\n60 = 2 × 2 × 3 × 5 = 2^{2} × 3 × 5',
          visual: { type: 'table', headers: ['÷ prime', 'number'], rows: [['2', '60'], ['2', '30'], ['3', '15'], ['5', '5'], ['', '1']] } },
        { title: 'HCF: the primes they share',
          text: '24 = 2 × 2 × 2 × 3\n36 = 2 × 2 × 3 × 3\nBoth have 2 × 2 × 3, so the **HCF** = 12.\nWith powers: use the **smaller** power of each shared prime.',
          visual: { type: 'table', headers: ['number', 'prime factors'], rows: [['24', '**2 × 2** × 2 × **3**'], ['36', '**2 × 2** × **3** × 3']] } },
        { title: 'LCM: every prime, most times',
          text: 'For the **LCM**, take each prime the greatest number of times it appears in either number.\n24 = 2^{3} × 3 and 36 = 2^{2} × 3^{2}\nLCM = 2^{3} × 3^{2} = 72\n**Check:** HCF × LCM = 12 × 72 = 864 = 24 × 36.' },
        { title: 'Which one do I need?',
          text: '**HCF** → splitting things into the biggest equal groups or pieces.\n**LCM** → when two repeating things happen together again (buses, lights, packs).' },
        { title: 'Worked example',
          text: 'Find the HCF and LCM of 18 and 30.\n**1.** 18 = 2 × 3 × 3 and 30 = 2 × 3 × 5.\n**2.** Shared primes: 2 × 3, so HCF = **6**.\n**3.** LCM: 2 × 3 × 3 × 5 = **90**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [pfChoice, hcfQ, lcmQ, fromPowers, story],
          [pfChoice, givenPF, story, story, hcfQ, lcmQ],
          [givenPF, story, missingNum, three, pfChoice],
        ], ctx);
      },
    });
  }

  /* 3 ── Powers, roots and index laws */
  {
    const evalPow = L => {
      const [b, e] = pick(L === 1
        ? [[2, 3], [2, 4], [2, 5], [3, 3], [4, 3], [5, 3], [10, 3], [3, 4], [10, 4], [6, 3]]
        : [[-2, 3], [-3, 3], [-2, 4], [-5, 3], [2, 6], [3, 4], [7, 3], [-1, 5], [-10, 3], [-3, 4]]);
      const v = Math.pow(b, e);
      return num(`Work out ${P(b)}^{${e}}`, v,
        [`${P(b)}^{${e}} means ${e} lots of ${P(b)} multiplied together. It is not ${P(b)} × ${e}.`,
          e === 3 ? `${P(b)} × ${P(b)} = ${F(b * b)}. Now multiply by ${P(b)} one more time.` : `${P(b)} × ${P(b)} = ${F(b * b)}. You need ${e} lots of ${P(b)} multiplied together, so keep going.`],
        `${Array(e).fill(P(b)).join(' × ')} = ${F(v)}.`);
    };

    const roots = L => {
      if (Math.random() < 0.6) {
        const r = L === 1 ? R(4, 12) : R(11, 20), n = r * r;
        const t = r + pick([-2, -1, 1, 2]);
        return num(`Work out √${n}`, r,
          [`√${n} asks: which number multiplied by itself makes ${n}?`,
            `Try ${t}: ${t} × ${t} = ${t * t}. That is too ${t * t < n ? 'small' : 'big'}.`],
          `${r} × ${r} = ${n}, so √${n} = ${r}.`);
      }
      const r = pick(L === 1 ? [2, 3, 4, 5, 10] : [4, 5, 6, 7, 8, 9, 10]), n = r * r * r;
      const t = r === 2 ? 3 : r - 1;
      return num(`Work out ∛${n}`, r,
        [`∛${n} (the cube root) asks: which number multiplied by itself three times makes ${n}?`,
          `Try ${t}: ${t} × ${t} × ${t} = ${t * t * t}. That is too ${t < r ? 'small' : 'big'}.`],
        `${r} × ${r} × ${r} = ${n}, so ∛${n} = ${r}.`);
    };

    const rootBetween = () => {
      const k = R(3, 11);
      const n = R(k * k + 1, (k + 1) * (k + 1) - 1);
      return choice(`√${n} lies between which two whole numbers?`, `${k} and ${k + 1}`,
        [`${k - 1} and ${k}`, `${k + 1} and ${k + 2}`, `${k - 2} and ${k - 1}`],
        ['Find the square numbers just below and just above the number.',
          `${k} × ${k} = ${k * k}, which is less than ${n}. Now try the next whole number.`],
        `${k}^{2} = ${k * k} and ${k + 1}^{2} = ${(k + 1) * (k + 1)}. ${n} is between them, so √${n} is between ${k} and ${k + 1}.`);
    };

    const zeroIdx = L => {
      const t = L === 1 ? R(1, 2) : R(1, 3);
      if (t === 1) {
        const b = R(2, 25);
        return num(`Work out ${b}^{0}`, 1,
          ['Any number (except 0) to the power 0 has the same value.',
            `${b}^{3} ÷ ${b}^{3} = ${b}^{3 − 3} = ${b}^{0}. And any number divided by itself is …`],
          `${b}^{0} = 1, because ${b}^{3} ÷ ${b}^{3} is 1.`);
      }
      if (t === 2) {
        const b = R(2, 9), c = R(2, 6);
        return num(`Work out ${b}^{0} + ${c}^{2}`, 1 + c * c,
          ['Work out each power first. Remember what the zero index means.',
            `${b}^{0} = 1 (any number to the power 0 is 1). Now work out ${c}^{2} and add.`],
          `1 + ${c * c} = ${1 + c * c}.`);
      }
      const v = pick(['x', 'a', 'y', 'm']), m = R(2, 9);
      return choice(`Simplify ${v}^{${m}} ÷ ${v}^{${m}}`, '1', ['0', v, `${v}^{${2 * m}}`],
        ['Dividing powers of the same base: subtract the indices.',
          `${v}^{${m}} ÷ ${v}^{${m}} = ${v}^{${m} − ${m}} = ${v}^{0}. What is any number to the power 0?`],
        `${v}^{${m} − ${m}} = ${v}^{0} = 1. (Anything divided by itself is 1.)`);
    };

    const missIdx = L => {
      const b = pick([2, 3, 5, 7, 10]);
      const t = L === 1 ? pick(['mul', 'div']) : L === 2 ? pick(['mul', 'div', 'pow']) : pick(['pow', 'combo', 'base', 'combo2']);
      if (t === 'mul') {
        const m = R(2, 9), n = R(2, 9);
        return num(`Find the missing index.\n${b}^{${m}} × ${b}^{${n}} = ${b}^{□}`, m + n,
          ['When you multiply powers of the same number, add the indices.',
            `${b}^{${m}} × ${b}^{${n}} is ${m} lots of ${b} multiplied by ${n} more lots of ${b}. Add ${m} + ${n}.`],
          `${m} + ${n} = ${m + n}, so the missing index is ${m + n}.`);
      }
      if (t === 'div') {
        const m = R(6, 15), n = R(2, m - 2);
        return num(`Find the missing index.\n${b}^{${m}} ÷ ${b}^{${n}} = ${b}^{□}`, m - n,
          ['When you divide powers of the same number, subtract the indices.',
            `Work out ${m} − ${n}.`],
          `${m} − ${n} = ${m - n}, so the missing index is ${m - n}.`);
      }
      if (t === 'pow') {
        const m = R(2, 6), n = R(2, 5);
        return num(`Find the missing index.\n(${b}^{${m}})^{${n}} = ${b}^{□}`, m * n,
          ['A power of a power: multiply the indices.',
            `(${b}^{${m}})^{${n}} = ${Array(n).fill(`${b}^{${m}}`).join(' × ')}. Add the indices, or multiply ${m} × ${n}.`],
          `${m} × ${n} = ${m * n}, so the missing index is ${m * n}.`);
      }
      if (t === 'combo') {
        const v = pick(['x', 'a', 'y']);
        const { a, c, d } = retry(() => { const a = R(2, 5), c = R(2, 4), d = R(2, 12); return a * c - d >= 2 ? { a, c, d } : null; });
        return num(`Find the missing index.\n(${v}^{${a}})^{${c}} ÷ ${v}^{${d}} = ${v}^{□}`, a * c - d,
          ['Do the bracket first (multiply the indices), then divide (subtract the indices).',
            `(${v}^{${a}})^{${c}} = ${v}^{${a * c}}. Now work out ${v}^{${a * c}} ÷ ${v}^{${d}}.`],
          `${v}^{${a * c}} ÷ ${v}^{${d}} = ${v}^{${a * c - d}}, so the missing index is ${a * c - d}.`);
      }
      if (t === 'combo2') {
        const v = pick(['x', 'p', 'n']);
        const { a, c, d } = retry(() => { const a = R(2, 9), c = R(2, 9), d = R(2, 12); return a + c - d >= 2 ? { a, c, d } : null; });
        return num(`Find the missing index.\n${v}^{${a}} × ${v}^{${c}} ÷ ${v}^{${d}} = ${v}^{□}`, a + c - d,
          ['Multiply → add the indices. Divide → subtract the indices.',
            `${v}^{${a}} × ${v}^{${c}} = ${v}^{${a + c}}. Now divide by ${v}^{${d}}.`],
          `${a} + ${c} − ${d} = ${a + c - d}, so the missing index is ${a + c - d}.`);
      }
      const [big, small, k] = pick([[4, 2, 2], [8, 2, 3], [9, 3, 2], [27, 3, 3], [16, 2, 4], [25, 5, 2]]);
      const n = R(2, 4);
      return num(`Find the missing index.\n${big}^{${n}} = ${small}^{□}`, k * n,
        [`First write ${big} as a power of ${small}.`,
          `${big} = ${small}^{${k}}, so ${big}^{${n}} = (${small}^{${k}})^{${n}}. Now use the power of a power rule.`],
        `(${small}^{${k}})^{${n}} = ${small}^{${k * n}}, so the missing index is ${k * n}.`);
    };

    const lawChoice = L => {
      const v = pick(['a', 'x', 'y', 'm', 'p']);
      const t = L === 2 ? pick(['mul', 'div']) : pick(['mul', 'div', 'pow', 'pow', 'coef', 'coefDiv']);
      if (t === 'mul') {
        const [m, n] = retry(() => { const m = R(2, 8), n = R(2, 8); return m * n !== m + n && m !== n ? [m, n] : null; });
        return choice(`Simplify ${v}^{${m}} × ${v}^{${n}}`, `${v}^{${m + n}}`,
          [`${v}^{${m * n}}`, `2${v}^{${m + n}}`, `${v}^{${Math.abs(m - n)}}`],
          ['Same base, multiplying: add the indices.', `${v}^{${m}} × ${v}^{${n}} = ${v}^{${m} + ${n}}.`],
          `Add the indices: ${m} + ${n} = ${m + n}, so the answer is ${v}^{${m + n}}.`);
      }
      if (t === 'div') {
        const n = R(2, 5), m = n * R(2, 4);
        return choice(`Simplify ${v}^{${m}} ÷ ${v}^{${n}}`, `${v}^{${m - n}}`,
          [`${v}^{${m / n}}`, `${v}^{${m + n}}`, `${v}^{${m * n}}`],
          ['Same base, dividing: subtract the indices. Do not divide them.', `${v}^{${m}} ÷ ${v}^{${n}} = ${v}^{${m} − ${n}}.`],
          `Subtract the indices: ${m} − ${n} = ${m - n}, so the answer is ${v}^{${m - n}}.`);
      }
      if (t === 'pow') {
        const [m, n] = retry(() => { const m = R(2, 5), n = R(2, 4); return m * n !== m + n ? [m, n] : null; });
        return choice(`Simplify (${v}^{${m}})^{${n}}`, `${v}^{${m * n}}`,
          [`${v}^{${m + n}}`, `${n}${v}^{${m}}`, Math.pow(m, n) !== m * n ? `${v}^{${Math.pow(m, n)}}` : `${v}^{${m * n + 1}}`],
          ['A power of a power: multiply the indices.',
            `(${v}^{${m}})^{${n}} = ${Array(n).fill(`${v}^{${m}}`).join(' × ')}. Now add these indices.`],
          `${m} × ${n} = ${m * n}, so (${v}^{${m}})^{${n}} = ${v}^{${m * n}}.`);
      }
      if (t === 'coef') {
        const [p, q, m, n] = retry(() => {
          const p = R(2, 6), q = R(2, 6), m = R(2, 6), n = R(2, 6);
          return p * q !== p + q && m * n !== m + n ? [p, q, m, n] : null;
        });
        return choice(`Simplify ${p}${v}^{${m}} × ${q}${v}^{${n}}`, `${p * q}${v}^{${m + n}}`,
          [`${p + q}${v}^{${m + n}}`, `${p * q}${v}^{${m * n}}`, `${p + q}${v}^{${m * n}}`],
          ['Multiply the numbers. Then multiply the powers by adding the indices.',
            `Numbers: ${p} × ${q} = ${p * q}. Now deal with ${v}^{${m}} × ${v}^{${n}}.`],
          `${p} × ${q} = ${p * q} and ${v}^{${m}} × ${v}^{${n}} = ${v}^{${m + n}}, so the answer is ${p * q}${v}^{${m + n}}.`);
      }
      const q = R(2, 5), p = q * R(2, 5), n = R(2, 4), m = n + R(2, 6);
      return choice(`Simplify ${p}${v}^{${m}} ÷ ${q}${v}^{${n}}`, `${p / q}${v}^{${m - n}}`,
        [`${p - q}${v}^{${m - n}}`, `${p / q}${v}^{${m + n}}`, `${p * q}${v}^{${m - n}}`],
        ['Divide the numbers. Then divide the powers by subtracting the indices.',
          `Numbers: ${p} ÷ ${q} = ${p / q}. Now deal with ${v}^{${m}} ÷ ${v}^{${n}}.`],
        `${p} ÷ ${q} = ${p / q} and ${v}^{${m}} ÷ ${v}^{${n}} = ${v}^{${m - n}}, so the answer is ${p / q}${v}^{${m - n}}.`);
    };

    const spot = () => {
      const v = pick(['a', 'x', 'y']), m = R(2, 5), n = R(3, 5), who = U.name();
      return num(`${who} says (${v}^{${m}})^{${n}} = ${v}^{${m + n}}.\nWhat should the index be?`, m * n,
        [`(${v}^{${m}})^{${n}} means ${v}^{${m}} multiplied by itself ${n} times.`,
          `(${v}^{${m}})^{${n}} = ${Array(n).fill(`${v}^{${m}}`).join(' × ')}. Add these indices.`],
        `${who} added the indices. For a power of a power, multiply: ${m} × ${n} = ${m * n}.`);
    };

    const mixedEval = () => {
      const a = R(2, 5), b = pick([4, 9, 16, 25, 36, 49, 64, 81, 100]), c = R(2, 4);
      const v = Math.pow(a, c) + Math.sqrt(b);
      return num(`Work out ${a}^{${c}} + √${b}`, v,
        ['Work out the power and the square root separately, then add.',
          `${a}^{${c}} = ${Math.pow(a, c)}. Now find √${b}.`],
        `${Math.pow(a, c)} + ${Math.sqrt(b)} = ${v}.`);
    };

    PMLM.registerSkill({
      id: 'g8.powers', grade: 8, unit: 'g8.u1', title: 'Powers and index laws', icon: '⚡',
      blurb: 'Squares, cubes, roots and the laws of indices',
      lesson: [
        { title: 'Powers and roots',
          text: '5^{2} = 5 × 5 = 25 (5 squared)\n2^{3} = 2 × 2 × 2 = 8 (2 cubed)\nRoots go backwards: √25 = 5 and ∛8 = 2.\n**Careful:** 2^{3} is not 2 × 3.',
          visual: { type: 'array', rows: 5, cols: 5 } },
        { title: 'Multiply → add, divide → subtract',
          text: 'With the **same base**:\na^{3} × a^{4} = a^{3 + 4} = a^{7}\na^{6} ÷ a^{2} = a^{6 − 2} = a^{4}\nWhy? a^{3} × a^{4} is 3 a\'s times 4 more a\'s: 7 a\'s altogether.' },
        { title: 'Power of a power → multiply',
          text: '(a^{2})^{3} = a^{2} × a^{2} × a^{2} = a^{6}\nSo multiply the indices: 2 × 3 = 6.\nA very common mistake is to add them and write a^{5}.' },
        { title: 'The zero index',
          text: 'a^{3} ÷ a^{3} = a^{0}, but anything divided by itself is 1.\nSo **a^{0} = 1** for any number a (except 0).\n7^{0} = 1, 100^{0} = 1, x^{0} = 1' },
        { title: 'Worked example',
          text: 'Simplify (x^{4})^{2} ÷ x^{3}.\n**1.** Bracket first: (x^{4})^{2} = x^{4 × 2} = x^{8}.\n**2.** Divide: x^{8} ÷ x^{3} = x^{8 − 3}.\n**3.** Answer: **x^{5}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [evalPow, roots, zeroIdx, missIdx, missIdx],
          [lawChoice, missIdx, zeroIdx, evalPow, rootBetween, roots],
          [lawChoice, lawChoice, missIdx, spot, mixedEval, zeroIdx],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 2: Decimals and rounding ═══════════════════════
  PMLM.registerUnit({ id: 'g8.u2', grade: 8, name: 'Decimals and rounding', icon: '🔟' });

  /* 4 ── Multiplying and dividing by 0.1, 0.01 and powers of 10 */
  {
    const OPS = [
      { op: '× 0.1', f: x => x / 10, same: '÷ 10', nudge: 'Multiplying by 0.1 is the same as dividing by 10, so the answer gets smaller.', how: 'Each digit moves 1 place to the right.' },
      { op: '× 0.01', f: x => x / 100, same: '÷ 100', nudge: 'Multiplying by 0.01 is the same as dividing by 100, so the answer gets smaller.', how: 'Each digit moves 2 places to the right.' },
      { op: '÷ 0.1', f: x => x * 10, same: '× 10', nudge: 'Dividing by 0.1 is the same as multiplying by 10, so the answer gets bigger.', how: 'Each digit moves 1 place to the left.' },
      { op: '÷ 0.01', f: x => x * 100, same: '× 100', nudge: 'Dividing by 0.01 is the same as multiplying by 100, so the answer gets bigger.', how: 'Each digit moves 2 places to the left.' },
    ];
    const makeN = L => {
      const t = R(1, L === 1 ? 3 : 4);
      if (t === 1) return R(2, 99);
      if (t === 2) return R(101, 999);
      if (t === 3) return U.round(R(11, 999) / 10, 1);
      return U.round(R(101, 999) / 100, 2);
    };

    const basic = L => {
      const o = L === 1 ? pick([OPS[0], OPS[2]]) : pick(OPS);
      const n = makeN(L), ans = U.round(o.f(n), 8);
      const extra = L === 1 ? { visual: { type: 'placeValue', value: F(n) } } : {};
      return num(`Work out ${F(n)} ${o.op}`, ans,
        [o.nudge, `So work out ${F(n)} ${o.same}. ${o.how}`],
        `${F(n)} ${o.op} is the same as ${F(n)} ${o.same}, which is ${F(ans)}.`, extra);
    };

    const missingOp = L => {
      const n = makeN(L);
      const [sym, fac] = pick([['×', 0.1], ['×', 0.01], ['×', 10], ['×', 100], ['÷', 0.1], ['÷', 0.01], ['÷', 10], ['÷', 100]]);
      const res = U.round(sym === '×' ? n * fac : n / fac, 8);
      const bigger = res > n;
      const places = Math.abs(Math.round(Math.log10(res / n)));
      return choice(`Which number goes in the box?\n${F(n)} ${sym} □ = ${F(res)}`, F(fac), ['0.1', '0.01', '10', '100'],
        [`Is the answer bigger or smaller than ${F(n)}? Remember: ${sym === '×' ? 'multiplying by a number less than 1 makes it smaller' : 'dividing by a number less than 1 makes it bigger'}.`,
          `${F(n)} → ${F(res)}: the digits have moved ${places} place${places > 1 ? 's' : ''} to the ${bigger ? 'left (bigger)' : 'right (smaller)'}.`],
        `${F(n)} ${sym} ${F(fac)} = ${F(res)}, so the missing number is ${F(fac)}.`);
    };

    const sameAs = () => {
      const o = pick(OPS);
      return choice(`Which of these is the same as ${o.op}?`, o.same, ['÷ 10', '÷ 100', '× 10', '× 100'],
        [`0.1 = ${fr(1, 10)} and 0.01 = ${fr(1, 100)}. Think about how many of them fit into 1.`,
          `Try it with a number: 5 ${o.op} = ${F(o.f(5))}. Which option turns 5 into ${F(o.f(5))}?`],
        `5 ${o.op} = ${F(o.f(5))}, the same as 5 ${o.same}. So ${o.op} is the same as ${o.same}.`);
    };

    const compare = () => {
      const n = R(12, 95);
      return choice(`Which is bigger: ${n} × 0.1 or ${n} ÷ 0.1?`, `${n} ÷ 0.1`, [`${n} × 0.1`, 'They are equal'],
        ['× 0.1 is the same as ÷ 10. ÷ 0.1 is the same as × 10.',
          `${n} × 0.1 = ${F(n / 10)}. Now work out ${n} ÷ 0.1.`],
        `${n} × 0.1 = ${F(n / 10)} but ${n} ÷ 0.1 = ${n * 10}, so ${n} ÷ 0.1 is bigger.`);
    };

    const powTen = () => {
      const k = R(2, 4), p = Math.pow(10, k);
      if (Math.random() < 0.5) {
        const n = pick([U.round(R(101, 999) / 100, 2), U.round(R(11, 99) / 10, 1), U.round(R(11, 99) / 1000, 3)]);
        const ans = U.round(n * p, 6);
        return num(`Work out ${F(n)} × 10^{${k}}`, ans,
          [`10^{${k}} is 1 followed by ${k} zeros. Multiplying by it moves every digit ${k} places to the left.`,
            `10^{${k}} = ${F(p)}, so work out ${F(n)} × ${F(p)}.`],
          `${F(n)} × ${F(p)} = ${F(ans)}.`);
      }
      const n = pick([R(11, 99) * 100, R(101, 999) * 10, R(1001, 9999)]);
      const ans = U.round(n / p, 6);
      return num(`Work out ${F(n)} ÷ 10^{${k}}`, ans,
        [`10^{${k}} is 1 followed by ${k} zeros. Dividing by it moves every digit ${k} places to the right.`,
          `10^{${k}} = ${F(p)}, so work out ${F(n)} ÷ ${F(p)}.`],
        `${F(n)} ÷ ${F(p)} = ${F(ans)}.`);
    };

    const real = (L, ctx) => {
      const t = R(1, 5);
      if (t === 1) {
        const h = R(12, 95);
        return num(`One sheet of paper is 0.1 mm thick.\nHow many sheets make a pile ${h} mm tall?`, h * 10,
          ['How many 0.1s fit into the height? That means dividing by 0.1.',
            `Work out ${h} ÷ 0.1. Dividing by 0.1 is the same as multiplying by 10.`],
          `${h} ÷ 0.1 = ${h * 10}, so there are ${h * 10} sheets.`, { unit: 'sheets' });
      }
      if (t === 2) {
        const mm = R(105, 395);
        return num(`1 mm = 0.1 cm. A pencil is ${mm} mm long.\nHow long is it in centimetres?`, U.round(mm / 10, 2),
          ['Each millimetre is 0.1 cm, so multiply the number of millimetres by 0.1.',
            `Work out ${mm} × 0.1, which is the same as ${mm} ÷ 10.`],
          `${mm} × 0.1 = ${F(mm / 10)}, so it is ${F(mm / 10)} cm.`, { unit: 'cm' });
      }
      if (t === 3) {
        const cm = R(105, 495);
        return num(`1 cm = 0.01 m. A plank is ${cm} cm long.\nHow long is it in metres?`, U.round(cm / 100, 2),
          ['Each centimetre is 0.01 m, so multiply by 0.01.',
            `Work out ${cm} × 0.01, which is the same as ${cm} ÷ 100.`],
          `${cm} × 0.01 = ${F(cm / 100)}, so it is ${F(cm / 100)} m.`, { unit: 'm' });
      }
      if (t === 4) {
        const amt = R(12, 95) * pick([1, 10]);
        return num(`${U.name()} has ${money(ctx.currency, amt)}. She spends 0.1 of it.\nHow much does she spend?`, U.round(amt / 10, 2),
          ['0.1 of an amount means × 0.1.', `Work out ${F(amt)} × 0.1, the same as ${F(amt)} ÷ 10.`],
          `${F(amt)} × 0.1 = ${F(amt / 10)}, so she spends ${money(ctx.currency, amt / 10)}.`, { prefix: ctx.currency });
      }
      const area = U.round(R(15, 95) / 10, 1);
      return num(`Each tile covers 0.01 m². How many tiles are needed to cover ${F(area)} m²?`, U.round(area * 100, 4),
        ['How many 0.01s fit into the area? Divide by 0.01.',
          `Work out ${F(area)} ÷ 0.01, the same as ${F(area)} × 100.`],
        `${F(area)} ÷ 0.01 = ${F(area * 100)}, so ${F(area * 100)} tiles are needed.`, { unit: 'tiles' });
    };

    const spot = () => {
      const n = R(3, 95), who = U.name();
      if (Math.random() < 0.5) {
        return num(`${who} says ${n} ÷ 0.1 = ${F(n / 10)}.\nWhat is the correct answer?`, n * 10,
          ['Dividing by 0.1 asks how many tenths fit into the number. Is the answer bigger or smaller?',
            `Dividing by 0.1 is the same as multiplying by 10, so work out ${n} × 10.`],
          `${who} divided by 10 instead. ${n} ÷ 0.1 = ${n} × 10 = ${n * 10}.`);
      }
      return num(`${who} says ${n} × 0.01 = ${F(n * 100)}.\nWhat is the correct answer?`, U.round(n / 100, 4),
        ['Multiplying by 0.01 (a small number) makes the answer smaller, not bigger.',
          `Multiplying by 0.01 is the same as dividing by 100, so work out ${n} ÷ 100.`],
        `${who} multiplied by 100 instead. ${n} × 0.01 = ${n} ÷ 100 = ${F(n / 100)}.`);
    };

    PMLM.registerSkill({
      id: 'g8.decimals10', grade: 8, unit: 'g8.u2', title: '× and ÷ by 0.1 and 0.01', icon: '🔢',
      blurb: 'Multiply and divide by 0.1, 0.01 and powers of 10',
      lesson: [
        { title: 'Digits move, the point stays',
          text: 'When you × 10, every digit moves **1 place left**. When you ÷ 10, every digit moves **1 place right**.\n4.73 × 10 = 47.3\n4.73 ÷ 10 = 0.473',
          visual: { type: 'placeValue', value: '4.73' } },
        { title: '× 0.1 is the same as ÷ 10',
          text: '0.1 is one tenth, so × 0.1 means "find one tenth": the same as ÷ 10.\n× 0.01 is the same as ÷ 100.\n35 × 0.1 = 3.5\n35 × 0.01 = 0.35' },
        { title: '÷ 0.1 is the same as × 10',
          text: 'How many tenths are in 4? There are 40. So 4 ÷ 0.1 = 40.\n÷ 0.1 is the same as × 10, and ÷ 0.01 is the same as × 100.\n**Tip:** dividing by a number less than 1 makes the answer **bigger**.' },
        { title: 'Powers of 10',
          text: '10^{2} = 100, 10^{3} = 1000, 10^{4} = 10,000.\n× 10^{3} moves each digit 3 places left: 2.5 × 10^{3} = 2500.\n÷ 10^{2} moves each digit 2 places right: 470 ÷ 10^{2} = 4.7.' },
        { title: 'Worked example',
          text: 'Work out 4.6 ÷ 0.01.\n**1.** ÷ 0.01 is the same as × 100.\n**2.** 4.6 × 100: each digit moves 2 places left.\n**3.** Answer: **460**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [basic, basic, basic, compare, real],
          [basic, basic, missingOp, sameAs, real, spot],
          [powTen, powTen, real, spot, missingOp, basic],
        ], ctx);
      },
    });
  }

  /* 5 ── Significant figures and estimating */
  {
    const expOf = x => parseInt(Math.abs(x).toExponential().split('e')[1], 10);
    const sf = (x, n) => U.round(x, n - 1 - expOf(x));
    const digitsOf = x => Math.abs(x).toExponential(12).replace(/e.*$/, '').replace('.', '').replace(/0+$/, '');
    const placeName = e => ({ 4: 'ten thousands', 3: 'thousands', 2: 'hundreds', 1: 'tens', 0: 'ones', '-1': 'tenths', '-2': 'hundredths', '-3': 'thousandths', '-4': 'ten-thousandths' })[e];
    // a number with about 3 s.f. that rounds to r at 1 s.f.
    const near = (r) => retry(() => {
      const e = expOf(r), step = Math.pow(10, e);
      const a = U.round(r + (Math.random() * 0.9 - 0.45) * step, 2 - e);
      return a > 0 && sf(a, 1) === r && a !== r && digitsOf(a).length >= 2 ? a : null;
    });
    const roundHint = (x, n) => {
      const ds = digitsOf(x).padEnd(n + 1, '0'), e = expOf(x);
      const first = n === 1 ? `The 1st significant figure is ${ds[0]} (in the ${placeName(e)} column).` : `The first ${n} significant figures are ${ds.slice(0, n).split('').join(', ')}.`;
      return `${first} The next digit is ${ds[n]}, so decide: round up or down?`;
    };
    const NUDGE = 'Find the first non-zero digit: that is the 1st significant figure. Look at the digit after the last one you keep: 5 or more → round up.';

    const roundInt = L => {
      const n = retry(() => { const v = R(1000, L === 1 ? 9999 : 99999); return sf(v, 1) !== v ? v : null; });
      const ans = sf(n, 1);
      return num(`Round ${F(n)} to 1 significant figure.`, ans, [NUDGE, roundHint(n, 1)],
        `The digit after ${digitsOf(n)[0]} is ${digitsOf(n).padEnd(2, '0')[1]}, so round ${ans >= n ? 'up' : 'down'}. Zeros keep the place value: ${F(ans)}.`);
    };

    const round2Choice = () => {
      const n = retry(() => { const v = R(1000, 99999); return sf(v, 2) !== v && sf(v, 3) !== sf(v, 2) ? v : null; });
      const ans = sf(n, 2), e = expOf(n), unit = Math.pow(10, e - 1);
      const down = Math.floor(n / unit) * unit, up = down + unit;
      return choice(`Round ${F(n)} to 2 significant figures.`, F(ans),
        [F(Math.round(ans / unit)), F(sf(n, 3)), F(ans === down ? up : down)],
        [NUDGE + ' Keep the place value with zeros.', roundHint(n, 2)],
        `Keep 2 significant figures and fill the other places with zeros: ${F(n)} ≈ ${F(ans)}.`);
    };

    const roundDec = L => {
      const n = L <= 2 ? 2 : 3;
      const x = retry(() => {
        const v = L <= 2 ? U.round(R(1001, 9999) / 1000, 3) : U.round(R(10001, 99999) / 1000, 3);
        return sf(v, n) !== v && digitsOf(sf(v, n)).length === n ? v : null;
      });
      const ans = sf(x, n);
      return num(`Round ${F(x)} to ${n} significant figures.`, ans, [NUDGE, roundHint(x, n)],
        `Keep ${n} significant figures: ${F(x)} ≈ ${F(ans)}.`);
    };

    const smallDec = L => {
      const n = L === 2 ? R(1, 2) : 2;
      const x = retry(() => {
        const v = U.round(R(101, 999) / Math.pow(10, R(4, 6)), 8);
        return sf(v, n) !== v && digitsOf(sf(v, n)).length === n ? v : null;
      });
      const ans = sf(x, n);
      return num(`Round ${F(x)} to ${n} significant figure${n > 1 ? 's' : ''}.`, ans,
        ['Zeros at the front of a decimal are not significant. Start counting at the first non-zero digit.', roundHint(x, n)],
        `The zeros in front don't count. ${F(x)} ≈ ${F(ans)} (${n} s.f.).`);
    };

    const countSF = () => {
      const k = R(2, 4);
      const d = [R(1, 9)];
      for (let i = 1; i < k - 1; i++) d.push(Math.random() < 0.5 ? 0 : R(0, 9));
      d.push(R(1, 9));
      const t = R(1, 3);
      let s;
      if (t === 1) s = '0.' + '0'.repeat(R(1, 3)) + d.join('');
      else if (t === 2) { const p = R(1, k - 1); s = d.slice(0, p).join('') + '.' + d.slice(p).join(''); }
      else s = d.join('');
      return num(`How many significant figures does ${s} have?`, k,
        ['Start counting at the first non-zero digit. Zeros in front do not count; zeros between other digits do.',
          `The 1st significant figure is ${d[0]}. Count it and every digit after it.`],
        `The significant figures are ${d.join(', ')}, so ${s} has ${k} significant figures.`);
    };

    const estimate2 = (L, ctx) => {
      const ra = R(1, 9) * Math.pow(10, R(0, 2)), rb = R(1, 9) * Math.pow(10, R(0, 1));
      const a = near(ra), b = near(rb), ans = U.round(ra * rb, 6);
      if (Math.random() < 0.3) {
        const people = near(R(2, 9) * 100), price = near(R(2, 9));
        const rp = sf(people, 1), rc = sf(price, 1);
        return num(`${F(Math.round(people))} people each pay ${money(ctx.currency, U.round(price, 2))} for a ticket.\nEstimate the total by rounding each number to 1 significant figure.`, rp * rc,
          ['Round each number to 1 significant figure first, then multiply.',
            `${F(Math.round(people))} ≈ ${F(sf(Math.round(people), 1))} and ${F(U.round(price, 2), 2)} ≈ ${F(rc)}. Now multiply.`],
          `${F(sf(Math.round(people), 1))} × ${F(rc)} = ${F(sf(Math.round(people), 1) * rc)}, so the total is about ${money(ctx.currency, sf(Math.round(people), 1) * rc)}.`,
          { prefix: ctx.currency });
      }
      return num(`Estimate ${F(a)} × ${F(b)} by rounding each number to 1 significant figure.`, ans,
        ['Round each number to 1 significant figure, then do the easy calculation.',
          `${F(a)} ≈ ${F(ra)} and ${F(b)} ≈ ${F(rb)}. Now multiply.`],
        `${F(ra)} × ${F(rb)} = ${F(ans)}, so the answer is about ${F(ans)}.`);
    };

    const estimate3 = () => {
      const { ra, rb, rc } = retry(() => {
        const ra = R(1, 9) * Math.pow(10, R(0, 2)), rb = R(1, 9) * Math.pow(10, R(0, 1));
        const rc = pick([2, 3, 4, 5, 20, 30, 0.5, 0.2]);
        const v = U.round(ra * rb / rc, 6);
        return Number.isInteger(v) && v > 1 && rc !== ra && rc !== rb ? { ra, rb, rc } : null;
      });
      const a = near(ra), b = near(rb), c = near(rc), ans = U.round(ra * rb / rc, 6);
      return num(`Estimate (${F(a)} × ${F(b)}) ÷ ${F(c)} by rounding each number to 1 significant figure.`, ans,
        ['Round every number to 1 significant figure first. Then work out the top and divide.',
          `${F(a)} ≈ ${F(ra)}, ${F(b)} ≈ ${F(rb)} and ${F(c)} ≈ ${F(rc)}. So work out (${F(ra)} × ${F(rb)}) ÷ ${F(rc)}.`],
        `${F(ra)} × ${F(rb)} = ${F(ra * rb)}, and ${F(ra * rb)} ÷ ${F(rc)} = ${F(ans)}. The estimate is ${F(ans)}.`);
    };

    const spot = () => {
      const who = U.name();
      if (Math.random() < 0.5) {
        const x = retry(() => { const d1 = R(5, 8), d2 = R(0, 9), d3 = R(1, 9); return U.round((d1 * 100 + d2 * 10 + d3) / 10000, 6); });
        const ans = sf(x, 1);
        return num(`${who} rounds ${F(x)} to 1 significant figure and gets 0.1.\nWhat is the correct answer?`, ans,
          [`${who} rounded to 1 decimal place instead. For significant figures, start at the first non-zero digit.`,
            roundHint(x, 1)],
          `The 1st significant figure is ${digitsOf(x)[0]} in the hundredths column, so ${F(x)} ≈ ${F(ans)}.`);
      }
      const n = retry(() => { const v = R(10000, 99999); return sf(v, 2) !== v ? v : null; });
      const ans = sf(n, 2), short = Math.round(ans / 1000);
      return num(`${who} rounds ${F(n)} to 2 significant figures and writes ${short}.\nWhat should the answer be?`, ans,
        ['Rounding must not change the size of the number. Zeros hold the place value.', roundHint(n, 2)],
        `${who} forgot the zeros. ${F(n)} ≈ ${F(ans)} to 2 significant figures.`);
    };

    PMLM.registerSkill({
      id: 'g8.sigFigs', grade: 8, unit: 'g8.u2', title: 'Significant figures', icon: '🎯',
      blurb: 'Round to significant figures and estimate answers',
      lesson: [
        { title: 'What is a significant figure?',
          text: 'The **1st significant figure** is the first digit that is not zero.\nIn 3482 it is 3 (worth 3000).\nIn 0.0562 it is 5: zeros at the front of a decimal don\'t count.\nZeros between digits do count: 305 has 3 significant figures.',
          visual: { type: 'placeValue', value: '3482', highlight: 0 } },
        { title: 'Rounding to significant figures',
          text: 'Count the significant figures you need, then look at the **next** digit: 5 or more → round up.\n3482 to 2 s.f.: keep 3 and 4, next digit is 8 → **3500**.\nKeep the zeros! 3482 is about 3500, not 35.',
          visual: { type: 'placeValue', value: '3482', highlight: 2 } },
        { title: 'Small decimals',
          text: '0.04719 to 2 s.f.: the 1st significant figure is 4, the 2nd is 7. The next digit is 1 → round down.\n0.04719 ≈ **0.047**' },
        { title: 'Estimating',
          text: 'To estimate, round every number to **1 significant figure**, then calculate.\n38.7 × 21.4 ≈ 40 × 20 = 800\nUse ≈ to mean "is approximately equal to". Estimates help you check calculator answers.' },
        { title: 'Worked example',
          text: 'Estimate (28.4 × 6.9) ÷ 2.1.\n**1.** Round to 1 s.f.: 28.4 ≈ 30, 6.9 ≈ 7, 2.1 ≈ 2.\n**2.** Top: 30 × 7 = 210.\n**3.** Divide: 210 ÷ 2 = 105.\nEstimate: **105**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [roundInt, roundInt, round2Choice, roundDec],
          [smallDec, countSF, estimate2, round2Choice, roundInt],
          [estimate3, estimate2, roundDec, smallDec, spot, countSF],
        ], ctx);
      },
    });
  }

  // ═══════════════════ Unit 3: Fractions, percentages and ratio ═══════════════════
  PMLM.registerUnit({ id: 'g8.u3', grade: 8, name: 'Fractions, % and ratio', icon: '🍕' });

  /* 6 ── Fractions and mixed numbers: all four operations */
  {
    const SIMP = 'Give your answer in its simplest form.';
    const MIX = 'Give your answer as a mixed number in its simplest form.';
    const ask = (top, bot) => (top > bot ? MIX : SIMP);
    const opts = (top, bot) => (top > bot ? { simplest: true, mixed: true } : { simplest: true });
    const show = (n, d) => (n > d ? `${fr(n, d)} = ${U.mixed(n, d)}` : fr(n, d));
    const tidy = (n, d) => { const [a, b] = U.simplify(n, d); return a === n ? show(n, d) : `${fr(n, d)} = ${show(a, b)}`; };

    const conv = (n1, d1, n2, d2, l) => {
      const parts = [[n1, d1], [n2, d2]].filter(([, d]) => d !== l).map(([n, d]) => `${fr(n, d)} = ${fr(n * l / d, l)}`);
      return `Use ${l} as the common denominator: ${parts.join(' and ')}.`;
    };
    const addSub = L => {
      const r = retry(() => {
        let d1, d2;
        if (L === 1) { d1 = R(2, 6); d2 = d1 * R(2, 3); if (Math.random() < 0.5) [d1, d2] = [d2, d1]; }
        else { d1 = R(2, 9); d2 = R(2, 12); if (d1 === d2 || d2 % d1 === 0 || d1 % d2 === 0) return null; }
        const n1 = R(1, d1 - 1), n2 = R(1, d2 - 1);
        if (U.gcd(n1, d1) !== 1 || U.gcd(n2, d2) !== 1) return null;
        const plus = Math.random() < 0.5, l = U.lcm(d1, d2);
        const t1 = n1 * l / d1, t2 = n2 * l / d2, top = plus ? t1 + t2 : t1 - t2;
        if (top <= 0 || top % l === 0) return null;
        return { d1, d2, n1, n2, plus, l, t1, t2, top };
      });
      const op = r.plus ? '+' : M;
      return fracQ(`Work out ${fr(r.n1, r.d1)} ${op} ${fr(r.n2, r.d2)}\n${ask(...U.simplify(r.top, r.l))}`, r.top, r.l,
        ['To add or subtract fractions, first make the denominators the same.',
          `${conv(r.n1, r.d1, r.n2, r.d2, r.l)} Now ${r.plus ? 'add' : 'subtract'} the numerators.`],
        `${fr(r.t1, r.l)} ${op} ${fr(r.t2, r.l)} = ${tidy(r.top, r.l)}.`, opts(...U.simplify(r.top, r.l)));
    };

    const mult = L => {
      const r = retry(() => {
        const d1 = R(2, L === 1 ? 8 : 10), d2 = R(2, L === 1 ? 8 : 10), n1 = R(1, d1 - 1), n2 = R(1, d2 - 1);
        if (U.gcd(n1, d1) !== 1 || U.gcd(n2, d2) !== 1 || U.gcd(n1 * n2, d1 * d2) === 1) return null;
        return { d1, d2, n1, n2, t: n1 * n2, b: d1 * d2 };
      });
      return fracQ(`Work out ${fr(r.n1, r.d1)} × ${fr(r.n2, r.d2)}\n${SIMP}`, r.t, r.b,
        ['Multiply the numerators, multiply the denominators, then simplify.',
          `${r.n1} × ${r.n2} = ${r.t} and ${r.d1} × ${r.d2} = ${r.b}, giving ${fr(r.t, r.b)}. Now simplify it.`],
        `${fr(r.n1, r.d1)} × ${fr(r.n2, r.d2)} = ${tidy(r.t, r.b)}.`, { simplest: true });
    };

    const divide = () => {
      const r = retry(() => {
        const d1 = R(2, 9), d2 = R(2, 9), n1 = R(1, d1 - 1), n2 = R(1, d2 - 1);
        if (U.gcd(n1, d1) !== 1 || U.gcd(n2, d2) !== 1 || (n1 === n2 && d1 === d2)) return null;
        const t = n1 * d2, b = d1 * n2;
        if (t % b === 0) return null;
        return { d1, d2, n1, n2, t, b };
      });
      const [a, b] = U.simplify(r.t, r.b);
      return fracQ(`Work out ${fr(r.n1, r.d1)} ÷ ${fr(r.n2, r.d2)}\n${ask(a, b)}`, r.t, r.b,
        ['To divide by a fraction: keep the first fraction, change ÷ to ×, and flip the second fraction.',
          `${fr(r.n1, r.d1)} ÷ ${fr(r.n2, r.d2)} = ${fr(r.n1, r.d1)} × ${fr(r.d2, r.n2)}. Now multiply and simplify.`],
        `${fr(r.n1, r.d1)} × ${fr(r.d2, r.n2)} = ${tidy(r.t, r.b)}.`, opts(a, b));
    };

    const intTimes = () => {
      const r = retry(() => {
        const d = R(3, 9), n = R(1, d - 1), k = R(2, 9);
        if (U.gcd(n, d) !== 1 || (k * n) % d === 0 || k * n < d) return null;
        return { d, n, k };
      });
      const t = r.k * r.n, [a, b] = U.simplify(t, r.d);
      return fracQ(`Work out ${r.k} × ${fr(r.n, r.d)}\n${ask(a, b)}`, t, r.d,
        ['Multiply the whole number by the numerator. The denominator stays the same.',
          `${r.k} × ${fr(r.n, r.d)} = ${fr(t, r.d)}. Now simplify and write it as a mixed number.`],
        `${r.k} × ${fr(r.n, r.d)} = ${tidy(t, r.d)}.`, opts(a, b));
    };

    const mixedPair = () => retry(() => {
      const d1 = R(2, 6), d2 = R(2, 6), n1 = R(1, d1 - 1), n2 = R(1, d2 - 1);
      if (U.gcd(n1, d1) !== 1 || U.gcd(n2, d2) !== 1) return null;
      const w1 = R(1, 3), w2 = R(1, 2);
      return { d1, d2, A: w1 * d1 + n1, B: w2 * d2 + n2 };
    });

    const mixedOps = () => {
      const r = retry(() => {
        const p = mixedPair(), op = pick(['+', M, '×', '÷']);
        let t, b;
        if (op === '+' || op === M) {
          const l = U.lcm(p.d1, p.d2);
          t = op === '+' ? p.A * l / p.d1 + p.B * l / p.d2 : p.A * l / p.d1 - p.B * l / p.d2; b = l;
        } else if (op === '×') { t = p.A * p.B; b = p.d1 * p.d2; } else { t = p.A * p.d2; b = p.d1 * p.B; }
        if (t <= 0 || t % b === 0) return null;
        return Object.assign(p, { op, t, b });
      });
      const sa = U.mixed(r.A, r.d1), sb = U.mixed(r.B, r.d2), [a, b] = U.simplify(r.t, r.b);
      const word = { '+': 'add them', [M]: 'subtract them', '×': 'multiply them', '÷': 'keep, change, flip, then multiply' }[r.op];
      let work;
      if (r.op === '+' || r.op === M) work = `${fr(r.A * r.b / r.d1, r.b)} ${r.op} ${fr(r.B * r.b / r.d2, r.b)}`;
      else if (r.op === '×') work = `${fr(r.A, r.d1)} × ${fr(r.B, r.d2)}`;
      else work = `${fr(r.A, r.d1)} × ${fr(r.d2, r.B)}`;
      return fracQ(`Work out ${sa} ${r.op} ${sb}\n${ask(a, b)}`, r.t, r.b,
        ['Change the mixed numbers into improper fractions first.',
          `${sa} = ${fr(r.A, r.d1)} and ${sb} = ${fr(r.B, r.d2)}. Now ${word}.`],
        `${work} = ${tidy(r.t, r.b)}.`, opts(a, b));
    };

    const story = (L, ctx) => {
      const t = R(1, 4), who = U.name();
      if (t === 1) {
        const r = retry(() => {
          const d = pick([2, 3, 4]), n = R(1, d - 1), w = R(1, 3), k = R(2, 5);
          if (U.gcd(n, d) !== 1 || ((w * d + n) * k) % d === 0) return null;
          return { d, n, w, k, A: w * d + n };
        });
        const t2 = r.A * r.k;
        return fracQ(`A cake needs ${r.w} ${fr(r.n, r.d)} cups of flour.\nHow much flour is needed for ${r.k} cakes? ${MIX}`, t2, r.d,
          ['Multiply the amount for one cake by the number of cakes. Change the mixed number to an improper fraction first.',
            `${r.w} ${fr(r.n, r.d)} = ${fr(r.A, r.d)}. Now work out ${fr(r.A, r.d)} × ${r.k}.`],
          `${fr(r.A, r.d)} × ${r.k} = ${tidy(t2, r.d)} cups.`, { simplest: true, mixed: true, unit: 'cups' });
      }
      if (t === 2) {
        const [d, m] = pick([[2, 4], [2, 8], [4, 8], [3, 6], [2, 6], [4, 4], [2, 2], [3, 3]]);
        const n = d === 4 ? pick([1, 3]) : R(1, d - 1), w = R(1, 4), A = w * d + n, pieces = A * m / d;
        return num(`A ribbon is ${w} ${fr(n, d)} m long. It is cut into pieces that are each ${fr(1, m)} m long.\nHow many pieces are there?`, pieces,
          [`Work out ${w} ${fr(n, d)} ÷ ${fr(1, m)}. Change the mixed number to an improper fraction first.`,
            `${w} ${fr(n, d)} = ${fr(A, d)}, and ÷ ${fr(1, m)} is the same as × ${m}. Now work out ${fr(A, d)} × ${m}.`],
          `${fr(A, d)} × ${m} = ${fr(A * m, d)} = ${pieces}, so there are ${pieces} pieces.`, { unit: 'pieces' });
      }
      const p = mixedPair(), l = U.lcm(p.d1, p.d2);
      if (t === 3) {
        const top = p.A * l / p.d1 + p.B * l / p.d2;
        if (top % l === 0) return mixedOps();
        return fracQ(`${who} walks ${U.mixed(p.A, p.d1)} km to school and then ${U.mixed(p.B, p.d2)} km to the park.\nHow far is that altogether? ${MIX}`, top, l,
          ['Add the two distances. Change the mixed numbers to improper fractions (or add the whole numbers and the fractions separately).',
            `With denominator ${l}: ${U.mixed(p.A, p.d1)} = ${fr(p.A * l / p.d1, l)} and ${U.mixed(p.B, p.d2)} = ${fr(p.B * l / p.d2, l)}. Now add.`],
          `${fr(p.A * l / p.d1, l)} + ${fr(p.B * l / p.d2, l)} = ${tidy(top, l)} km.`, { simplest: true, mixed: true, unit: 'km' });
      }
      const big = Math.max(p.A / p.d1, p.B / p.d2) === p.A / p.d1 ? [p.A, p.d1, p.B, p.d2] : [p.B, p.d2, p.A, p.d1];
      const top = big[0] * l / big[1] - big[2] * l / big[3];
      if (top <= 0 || top % l === 0) return mixedOps();
      const [a, b] = U.simplify(top, l);
      return fracQ(`A jug holds ${U.mixed(big[0], big[1])} litres of juice. ${who} pours out ${U.mixed(big[2], big[3])} litres.\nHow much juice is left? ${ask(a, b)}`, top, l,
        ['Subtract the amount poured out. Change the mixed numbers to improper fractions first.',
          `With denominator ${l}: ${U.mixed(big[0], big[1])} = ${fr(big[0] * l / big[1], l)} and ${U.mixed(big[2], big[3])} = ${fr(big[2] * l / big[3], l)}. Now subtract.`],
        `${fr(big[0] * l / big[1], l)} − ${fr(big[2] * l / big[3], l)} = ${tidy(top, l)} litres.`, Object.assign(opts(a, b), { unit: 'litres' }));
    };

    const spot = () => {
      const who = U.name();
      if (Math.random() < 0.5) {
        const r = retry(() => {
          const d1 = R(2, 7), d2 = R(2, 9), n1 = R(1, d1 - 1), n2 = R(1, d2 - 1);
          if (d1 === d2 || U.gcd(n1, d1) !== 1 || U.gcd(n2, d2) !== 1) return null;
          const l = U.lcm(d1, d2), top = n1 * l / d1 + n2 * l / d2;
          return top % l === 0 ? null : { d1, d2, n1, n2, l, top };
        });
        const [a, b] = U.simplify(r.top, r.l);
        return fracQ(`${who} says ${fr(r.n1, r.d1)} + ${fr(r.n2, r.d2)} = ${fr(r.n1 + r.n2, r.d1 + r.d2)}.\nWhat is the correct answer? ${ask(a, b)}`, r.top, r.l,
          [`${who} added the tops and added the bottoms. You need a common denominator first.`,
            `${conv(r.n1, r.d1, r.n2, r.d2, r.l)} Now add.`],
          `${fr(r.n1 * r.l / r.d1, r.l)} + ${fr(r.n2 * r.l / r.d2, r.l)} = ${tidy(r.top, r.l)}.`, opts(a, b));
      }
      const r = retry(() => {
        const d1 = R(2, 9), d2 = R(2, 9), n1 = R(1, d1 - 1), n2 = R(1, d2 - 1);
        if (U.gcd(n1, d1) !== 1 || U.gcd(n2, d2) !== 1 || d1 === d2) return null;
        const t = n1 * d2, b = d1 * n2;
        return t % b === 0 ? null : { d1, d2, n1, n2, t, b };
      });
      const [a, b] = U.simplify(r.t, r.b);
      return fracQ(`${who} says ${fr(r.n1, r.d1)} ÷ ${fr(r.n2, r.d2)} = ${U.fracS(r.n1 * r.n2, r.d1 * r.d2)}.\nWhat is the correct answer? ${ask(a, b)}`, r.t, r.b,
        [`${who} multiplied instead of dividing. To divide, flip the second fraction and then multiply.`,
          `${fr(r.n1, r.d1)} ÷ ${fr(r.n2, r.d2)} = ${fr(r.n1, r.d1)} × ${fr(r.d2, r.n2)}. Now multiply.`],
        `${fr(r.n1, r.d1)} × ${fr(r.d2, r.n2)} = ${tidy(r.t, r.b)}.`, opts(a, b));
    };

    PMLM.registerSkill({
      id: 'g8.fractions', grade: 8, unit: 'g8.u3', title: 'Fractions: + − × ÷', icon: '🍰',
      blurb: 'Add, subtract, multiply and divide fractions',
      lesson: [
        { title: 'Adding and subtracting',
          text: 'Make the denominators the same first, then add or subtract the numerators.\n{2/3} + {1/4} = {8/12} + {3/12} = {11/12}\n**Never** add the bottoms: {1/3} + {1/4} is not {2/7}.',
          visual: { type: 'fractionBar', bars: [{ parts: 3, shaded: 2, label: '{2/3} = {8/12}' }, { parts: 4, shaded: 1, label: '{1/4} = {3/12}' }, { parts: 12, shaded: 11, label: '{11/12}' }] } },
        { title: 'Mixed numbers',
          text: 'Change mixed numbers into improper fractions first.\n2 {1/3} = {7/3} (2 wholes are {6/3}, plus {1/3})\nAt the end, change back: {17/4} = 4 {1/4}.',
          visual: { type: 'fractionBar', bars: [{ parts: 3, shaded: 3 }, { parts: 3, shaded: 3 }, { parts: 3, shaded: 1 }] } },
        { title: 'Multiplying',
          text: 'Multiply the tops, multiply the bottoms, then simplify.\n{3/4} × {2/5} = {6/20} = {3/10}\n**Tip:** you can cancel common factors before you multiply.' },
        { title: 'Dividing: keep, change, flip',
          text: '**Keep** the first fraction, **change** ÷ to ×, **flip** the second fraction.\n{2/3} ÷ {4/5} = {2/3} × {5/4} = {10/12} = {5/6}' },
        { title: 'Worked example',
          text: 'Work out 1 {1/2} × 2 {2/3}.\n**1.** Improper fractions: {3/2} × {8/3}.\n**2.** Multiply: {24/6}.\n**3.** Simplify: {24/6} = 4.\nAnswer: **4**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [addSub, addSub, mult, intTimes],
          [addSub, divide, mult, intTimes, mixedOps],
          [mixedOps, mixedOps, story, story, spot, divide],
        ], ctx);
      },
    });
  }

  /* 7 ── Recurring decimals; fractions to decimals */
  {
    const dec = (n, d) => {
      const whole = Math.floor(n / d);
      let r = n % d;
      const digits = [], seen = new Map();
      while (r !== 0 && !seen.has(r)) { seen.set(r, digits.length); r *= 10; digits.push(Math.floor(r / d)); r %= d; }
      if (r === 0) return { term: true, whole, str: digits.length ? `${whole}.${digits.join('')}` : `${whole}` };
      const s = seen.get(r), non = digits.slice(0, s).join(''), rep = digits.slice(s).join('');
      let long = non;
      while (long.length < 6) long += rep;
      return { term: false, whole, non, rep, str: `${whole}.${non}~{${rep}}`, long: `${whole}.${long}…` };
    };
    const pfLong = n => U.primeFactors(n).join(' × ');
    const firstStep = (n, d) => {
      if (n >= d) return `${n} ÷ ${d} = ${Math.floor(n / d)} remainder ${n % d}. Carry on after the decimal point: ${(n % d) * 10} ÷ ${d}.`;
      return `${d} into ${n}.0: ${n * 10} ÷ ${d} = ${Math.floor(n * 10 / d)} remainder ${(n * 10) % d}. Keep going until a remainder repeats.`;
    };
    const recWrongs = (n, d, D) => {
      const w = [`${D.whole}.${D.non}${D.rep}`];
      if (D.non) { w.push(`${D.whole}.~{${D.non}${D.rep}}`); w.push(`${D.whole}.~{${D.rep}}`); }
      else if (D.rep.length > 1) w.push(`${D.whole}.${D.rep.slice(0, -1)}~{${D.rep.slice(-1)}}`);
      else w.push(`${D.whole}.${D.rep}${D.rep}`);
      if (n < d) { w.push(`0.${n}${d}`); w.push(`0.${n}`); } else { w.push(`${D.whole}.${n % d}`); w.push(`${D.whole}.${n % d}${d}`); }
      return w;
    };

    const toRecurring = L => {
      const [n, d] = retry(() => {
        const d = pick(L === 1 ? [3, 9, 6, 3, 9] : L === 2 ? [6, 11, 12, 15, 18, 9] : [7, 12, 15, 11, 18, 22]);
        const n = L === 3 && Math.random() < 0.4 ? R(d + 1, 2 * d - 1) : R(1, d - 1);
        return U.gcd(n, d) === 1 ? [n, d] : null;
      });
      const D = dec(n, d);
      return choice(`Write ${fr(n, d)} as a decimal.`, D.str, recWrongs(n, d, D),
        ['Divide the numerator by the denominator. When a remainder repeats, the digits repeat too.', firstStep(n, d)],
        `${n} ÷ ${d} = ${D.long}, so ${fr(n, d)} = ${D.str}.`);
    };

    const terminating = L => {
      const [n, d] = retry(() => {
        const d = pick(L === 1 ? [2, 4, 5, 8, 20, 25] : [8, 16, 40, 25, 20, 50]);
        const n = L === 1 ? R(1, d - 1) : R(1, 2 * d - 1);
        return U.gcd(n, d) === 1 && n !== d ? [n, d] : null;
      });
      const D = dec(n, d), p = [10, 100, 1000, 10000].find(k => k % d === 0);
      return num(`Write ${fr(n, d)} as a decimal.`, U.round(n / d, 6),
        ['A fraction is a division: numerator ÷ denominator.',
          `Make the denominator ${F(p)}: ${fr(n, d)} = ${fr(n * p / d, p)}. Now write that as a decimal.`],
        `${fr(n, d)} = ${fr(n * p / d, p)} = ${D.str}.`);
    };

    const SNEAKY = [[3, 12], [6, 15], [9, 12], [3, 15], [7, 14], [3, 6], [9, 15], [21, 28], [3, 24], [9, 30]];
    const recFrac = () => retry(() => { const d = pick([3, 6, 7, 9, 11, 12, 15, 18]), n = R(1, d - 1); return U.gcd(n, d) === 1 ? [n, d] : null; });
    const termFrac = () => retry(() => { const d = pick([4, 5, 8, 16, 20, 25, 40]), n = R(1, d - 1); return U.gcd(n, d) === 1 ? [n, d] : null; });

    const whichType = () => {
      const s = pick(SNEAKY), [sa, sb] = U.simplify(s[0], s[1]);
      const sneakHint = `For example ${fr(s[0], s[1])} = ${fr(sa, sb)}, and ${U.isPrime(sb) ? `${sb} is prime` : `${sb} = ${pfLong(sb)}`}.`;
      const nudge = 'Simplify each fraction first. If the denominator then has only 2s and 5s as prime factors, the decimal terminates (stops). Otherwise it recurs.';
      if (Math.random() < 0.5) {
        const right = recFrac();
        const ws = [s, termFrac(), termFrac(), termFrac()].map(([a, b]) => fr(a, b));
        return choice('Which fraction is equal to a **recurring** decimal?', fr(...right), ws, [nudge, sneakHint],
          `${fr(...right)}: the denominator ${U.isPrime(right[1]) ? `${right[1]} is a prime other than 2 or 5` : `${right[1]} = ${pfLong(right[1])} has a prime factor other than 2 or 5`}, so it recurs: ${dec(...right).str}.`);
      }
      const ws = [recFrac(), recFrac(), recFrac(), recFrac()].map(([a, b]) => fr(a, b));
      return choice('Which fraction is equal to a **terminating** decimal?', fr(s[0], s[1]), ws,
        [nudge, `Try simplifying each fraction. ${fr(s[0], s[1])} has a common factor of ${U.gcd(s[0], s[1])}.`],
        `${fr(s[0], s[1])} = ${fr(sa, sb)}, and ${sb} has only 2s and 5s as prime factors, so it terminates: ${dec(sa, sb).str}.`);
    };

    const fromRecurring = () => {
      let rec, N, D, wrongs;
      if (Math.random() < 0.6) {
        const k = R(1, 8);
        rec = `0.~{${k}}`; [N, D] = U.simplify(k, 9);
        wrongs = [U.simplify(k, 10), [1, k], U.simplify(k, 99), U.simplify(k, 100)];
      } else {
        const ab = pick([18, 27, 36, 45, 54, 63, 72, 81]), s = String(ab);
        rec = `0.~{${s}}`; [N, D] = U.simplify(ab, 99);
        wrongs = [U.simplify(ab, 100), U.simplify(ab, 90), [1, ab]];
        if (+s[1] > +s[0]) wrongs.push(U.simplify(+s[0], +s[1]));
      }
      const ws = wrongs.filter(([a, b]) => a * D !== N * b && b > 1).map(([a, b]) => fr(a, b));
      return choice(`Which fraction is equal to ${rec}?`, fr(N, D), ws,
        ['Useful facts: 0.~{1} = {1/9} and 0.~{01} = {1/99}. Or work out each fraction as a division.',
          rec.length === 6 ? `0.~{1} = {1/9}, so ${rec} is ${rec.slice(4, 5)} lots of {1/9}. Simplify if you can.` : `0.~{01} = {1/99}, so ${rec} = {${rec.slice(4, 6)}/99}. Now simplify.`],
        `Check by dividing: ${N} ÷ ${D} = ${dec(N, D).long} So ${rec} = ${fr(N, D)}.`);
    };

    const order = () => {
      const a = R(2, 8), b = R(1, a - 1), big = Math.random() < 0.5;
      const opts = [`0.${a}`, `0.${a}${a}`, `0.~{${a}}`, `0.${a}~{${b}}`];
      const right = big ? opts[2] : opts[0];
      return choice(`Which number is the ${big ? '**largest**' : '**smallest**'}?`, right, opts,
        ['Write each number with lots of decimal places, then compare digit by digit from the left.',
          `0.~{${a}} = 0.${String(a).repeat(4)}… and 0.${a}~{${b}} = 0.${a}${String(b).repeat(3)}…`],
        `In order: 0.${a} < 0.${a}~{${b}} < 0.${a}${a} < 0.~{${a}}. The ${big ? 'largest' : 'smallest'} is ${right}.`);
    };

    PMLM.registerSkill({
      id: 'g8.recurring', grade: 8, unit: 'g8.u3', title: 'Recurring decimals', icon: '🔁',
      blurb: 'Turn fractions into terminating or recurring decimals',
      lesson: [
        { title: 'A fraction is a division',
          text: '{3/8} means 3 ÷ 8 = 0.375.\nThis decimal **terminates**: it stops.\nTip: {3/8} = {375/1000} = 0.375' },
        { title: 'Some decimals never stop',
          text: '{1/3} = 1 ÷ 3 = 0.3333… The 3 repeats forever.\nWe write it with a dot over the repeating digit: 0.~{3}.\n{2/11} = 0.181818… = 0.~{18} (dots over the first and last repeating digits).\n{1/6} = 0.1666… = 0.1~{6} (only the 6 repeats).' },
        { title: 'Terminating or recurring?',
          text: 'Simplify the fraction first. Then look at the denominator:\nonly 2s and 5s as prime factors → **terminates**.\nany other prime (3, 7, 11, …) → **recurs**.\n{7/20} terminates (20 = 2 × 2 × 5). {5/12} recurs (12 has a 3).' },
        { title: 'Useful ones to know',
          text: 'These come up a lot.',
          visual: { type: 'table', headers: ['fraction', 'decimal'], rows: [['{1/3}', '0.~{3}'], ['{2/3}', '0.~{6}'], ['{1/6}', '0.1~{6}'], ['{1/9}', '0.~{1}'], ['{1/11}', '0.~{09}']] } },
        { title: 'Worked example',
          text: 'Write {5/6} as a decimal.\n**1.** 50 ÷ 6 = 8 remainder 2, so the first digit is 8.\n**2.** 20 ÷ 6 = 3 remainder 2. The remainder 2 repeats, so 3 repeats.\n**3.** {5/6} = 0.8333… = **0.8~{3}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [toRecurring, toRecurring, terminating, terminating],
          [toRecurring, toRecurring, whichType, terminating],
          [toRecurring, whichType, fromRecurring, order, terminating],
        ], ctx);
      },
    });
  }

  /* 8 ── Percentage increase/decrease, percentage change, multipliers */
  {
    const pc = x => `${F(x)}%`;

    const multChoice = () => {
      const p = pick([3, 4, 5, 6, 7, 8, 9, 12, 15, 18, 24, 35, 45, 60]);
      const up = Math.random() < 0.5, m = U.round(up ? 1 + p / 100 : 1 - p / 100, 4);
      const w = [F(p / 100), F(U.round(up ? 1 - p / 100 : 1 + p / 100, 4))];
      if (p < 10) w.push(F(U.round(up ? 1 + p / 10 : 1 - p / 10, 4)));
      else if (up && p <= 24) w.push(F(p / 10));
      return choice(`Which multiplier ${up ? 'increases' : 'decreases'} an amount by ${p}%?`, F(m), w,
        [`The original amount is 100%. ${up ? 'Increasing' : 'Decreasing'} by ${p}% gives 100% ${up ? '+' : M} ${p}%.`,
          `100% ${up ? '+' : M} ${p}% = ${up ? 100 + p : 100 - p}%. Now write that percentage as a decimal.`],
        `100% ${up ? '+' : M} ${p}% = ${up ? 100 + p : 100 - p}% = ${F(m)}. The multiplier is ${F(m)}.`);
    };

    const apply = (L, ctx, forceDown) => {
      const up = forceDown ? false : (L === 1 ? true : Math.random() < 0.5);
      const p = pick(L === 1 ? [10, 20, 25, 50, 5, 15] : [12, 15, 35, 8, 4, 30, 45, 6, 18]);
      const amt = L === 1 ? R(1, 20) * 20 : R(1, 16) * 50;
      const m = U.round(up ? 1 + p / 100 : 1 - p / 100, 4), ans = U.round(amt * m, 2);
      const item = pick(['A bike', 'A jacket', 'A phone', 'A games console', 'A watch', 'A pair of trainers']);
      return num(`${item} costs ${money(ctx.currency, amt)}. The price ${up ? 'goes up' : 'goes down'} by ${p}%.\nWhat is the new price?`, ans,
        [`Use a multiplier: ${up ? 'increase' : 'decrease'} by ${p}% means multiply by 100% ${up ? '+' : M} ${p}% as a decimal.`,
          `The multiplier is ${F(m)}. Now work out ${F(amt)} × ${F(m)}.`],
        `${F(amt)} × ${F(m)} = ${F(ans, Number.isInteger(ans) ? undefined : 2)}, so the new price is ${money(ctx.currency, ans)}.`,
        { prefix: ctx.currency });
    };

    const CHANGE = [
      { what: 'price of a coat', cur: true, unit: '', k: 1 },
      { what: 'number of students at a school', cur: false, unit: ' students', k: 1 },
      { what: 'mass of a dog', cur: false, unit: ' kg', k: 0.1 },
      { what: 'price of a ticket', cur: true, unit: '', k: 1 },
      { what: 'population of a village', cur: false, unit: ' people', k: 10 },
    ];
    const scaled = (d, k) => ({ p: d.p, up: d.up, old: U.round(d.old * k, 4), nw: U.round(d.nw * k, 4), ch: U.round(d.ch * k, 4) });
    const changeData = L => retry(() => {
      const p = pick(L <= 2 ? [10, 20, 25, 30, 40, 50, 75, 5, 15] : [12.5, 2.5, 7.5, 17.5, 35, 8, 4, 22.5, 62.5, 6]);
      const up = Math.random() < 0.5;
      const old = R(2, 30) * (L <= 2 ? 10 : 20);
      const ch = old * p / 100;
      if (!Number.isInteger(U.clean(ch)) || (!up && ch >= old) || old === 100) return null;
      return { p, up, old, ch: U.clean(ch), nw: U.clean(up ? old + ch : old - ch) };
    });
    const show = (c, ctx, x) => (c.cur ? money(ctx.currency, x) : `${F(x)}${c.unit}`);

    const pctChange = (L, ctx) => {
      const c = pick(CHANGE), d = scaled(changeData(L), c.k);
      return num(`The ${c.what} goes from ${show(c, ctx, d.old)} to ${show(c, ctx, d.nw)}.\nWhat is the percentage ${d.up ? 'increase' : 'decrease'}?`, d.p,
        ['Percentage change = change ÷ original value × 100. Always divide by the **original** (starting) value.',
          `The change is ${d.up ? `${F(d.nw)} ${M} ${F(d.old)}` : `${F(d.old)} ${M} ${F(d.nw)}`} = ${F(d.ch)}. Now work out ${F(d.ch)} ÷ ${F(d.old)} × 100.`],
        `${F(d.ch)} ÷ ${F(d.old)} = ${F(d.ch / d.old)}, and × 100 gives ${pc(d.p)}. The percentage ${d.up ? 'increase' : 'decrease'} is ${pc(d.p)}.`,
        { unit: '%' });
    };

    const changeChoice = (L, ctx) => {
      const c = pick(CHANGE), d = scaled(changeData(2), c.k);
      const byNew = U.round(d.ch / d.nw * 100, 1);
      return choice(`The ${c.what} goes from ${show(c, ctx, d.old)} to ${show(c, ctx, d.nw)}.\nWhat is the percentage ${d.up ? 'increase' : 'decrease'}?`, pc(d.p),
        [pc(byNew), pc(d.ch), pc(U.round(d.nw / d.old * 100, 1))],
        ['Percentage change = change ÷ **original** value × 100.',
          `The change is ${F(d.ch)}. The original value is ${F(d.old)}.`],
        `${F(d.ch)} ÷ ${F(d.old)} × 100 = ${pc(d.p)}. (Dividing by the new value ${F(d.nw)} is a common mistake.)`);
    };

    const multFromValues = (L, ctx) => {
      const d = changeData(L);
      const m = U.round(d.nw / d.old, 4);
      return num(`A price changes from ${money(ctx.currency, d.old)} to ${money(ctx.currency, d.nw)}.\nWhat single multiplier changes the old price into the new price?`, m,
        ['Multiplier = new value ÷ old value.', `Work out ${F(d.nw)} ÷ ${F(d.old)}.`],
        `${F(d.nw)} ÷ ${F(d.old)} = ${F(m)}, so the multiplier is ${F(m)}.`);
    };

    const spot = (L, ctx) => {
      const d = retry(() => { const x = changeData(2); return x.up ? x : null; });
      const who = U.name(), wrong = U.round(d.ch / d.nw * 100, 1);
      return num(`A price rises from ${money(ctx.currency, d.old)} to ${money(ctx.currency, d.nw)}.\n${who} works out ${F(d.ch)} ÷ ${F(d.nw)} × 100 and says the increase is ${pc(wrong)}.\nWhat is the correct percentage increase?`, d.p,
        [`${who} divided by the new price. Percentage change must be divided by the **original** value.`,
          `Work out ${F(d.ch)} ÷ ${F(d.old)} × 100.`],
        `${F(d.ch)} ÷ ${F(d.old)} × 100 = ${pc(d.p)}.`, { unit: '%' });
    };

    const twoSteps = (L, ctx) => {
      const p = pick([10, 20, 25, 50]), q = pick([10, 20, 25, 50]), amt = R(1, 10) * 40;
      const m1 = U.round(1 + p / 100, 2), m2 = U.round(1 - q / 100, 2), ans = U.round(amt * m1 * m2, 2);
      return num(`A price of ${money(ctx.currency, amt)} goes up by ${p}%. Later the new price goes down by ${q}%.\nWhat is the final price?`, ans,
        ['Use a multiplier for each change. The second change is a percentage of the new price, not the original.',
          `The multipliers are ${F(m1)} and ${F(m2)}. First: ${F(amt)} × ${F(m1)} = ${F(U.round(amt * m1, 2))}.`],
        `${F(amt)} × ${F(m1)} × ${F(m2)} = ${F(ans)}, so the final price is ${money(ctx.currency, ans)}.`, { prefix: ctx.currency });
    };

    PMLM.registerSkill({
      id: 'g8.percentChange', grade: 8, unit: 'g8.u3', title: 'Percentage change', icon: '📈',
      blurb: 'Multipliers, % increase/decrease and % change',
      lesson: [
        { title: 'Multipliers',
          text: 'The original amount is 100%.\nIncrease by 20% → 120% → multiply by **1.2**.\nDecrease by 15% → 85% → multiply by **0.85**.\nEach box below is 10%.',
          visual: { type: 'barModel', rows: [{ label: 'Before', parts: 10, value: '100%' }, { label: 'After +20%', parts: 12, value: '120%' }] } },
        { title: 'Increase or decrease in one step',
          text: 'Increase 80 by 20%: 80 × 1.2 = 96.\nDecrease 60 by 15%: 60 × 0.85 = 51.\nA multiplier bigger than 1 makes it bigger; less than 1 makes it smaller.' },
        { title: 'Percentage change',
          text: 'Percentage change = {change/original} × 100\nAlways divide by the **original** (old) value, never the new one.\n40 → 50: change 10, so 10 ÷ 40 × 100 = 25% increase.' },
        { title: 'Two changes in a row',
          text: 'Use one multiplier for each change.\nUp 10% then down 10%: × 1.1 × 0.9 = × 0.99.\nSo you do **not** get back to the start: the second 10% is of a bigger amount.' },
        { title: 'Worked example',
          text: 'A bike drops from 240 to 180. What is the percentage decrease?\n**1.** Change: 240 − 180 = 60.\n**2.** Divide by the original: 60 ÷ 240 = 0.25.\n**3.** × 100: 0.25 × 100 = 25.\nAnswer: **25% decrease**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [multChoice, multChoice, apply, apply],
          [(l, c) => apply(l, c, true), apply, pctChange, changeChoice, multFromValues, multChoice],
          [pctChange, pctChange, spot, twoSteps, multFromValues, apply],
        ], ctx);
      },
    });
  }

  /* 9 ── Ratio and direct proportion */
  {
    const two = () => { const a = U.name(); let b = U.name(); while (b === a) b = U.name(); return [a, b]; };
    const coprime = (lo, hi) => retry(() => { const p = R(lo, hi), q = R(lo, hi); return p !== q && U.gcd(p, q) === 1 ? [p, q] : null; });

    const simplify = L => {
      const g = pick([4, 6, 8, 9, 10, 12]), [p, q] = coprime(1, 9), a = g * p, b = g * q;
      const f = U.primeFactors(g)[0];
      if (L >= 2 && Math.random() < 0.5) {
        const r = retry(() => { const s = R(1, 9); return s !== p && s !== q && U.gcd(U.gcd(p, q), s) === 1 ? s : null; });
        const c = g * r;
        return choice(`Write ${a} : ${b} : ${c} in its simplest form.`, `${p} : ${q} : ${r}`,
          [`${a / f} : ${b / f} : ${c / f}`, `${r} : ${q} : ${p}`, `${p} : ${q} : ${c}`],
          ['Divide every part by the highest common factor (HCF) of all three numbers.', `The HCF of ${a}, ${b} and ${c} is ${g}. Divide each part by it.`],
          `Divide each part by ${g}: ${p} : ${q} : ${r}.`);
      }
      return choice(`Write ${a} : ${b} in its simplest form.`, `${p} : ${q}`,
        [`${a / f} : ${b / f}`, `${q} : ${p}`, `${p} : ${b}`],
        ['Divide both parts by their highest common factor (HCF). Keep them in the same order.', `Both ${a} and ${b} divide by ${f}: ${a / f} : ${b / f}. Can you divide again?`],
        `The HCF of ${a} and ${b} is ${g}. ${a} ÷ ${g} = ${p} and ${b} ÷ ${g} = ${q}, so ${p} : ${q}.`);
    };

    const share = (L, ctx) => {
      const [n1, n2] = two(), [a, b] = coprime(1, L === 1 ? 5 : 8), k = R(2, L === 1 ? 10 : 25), T = (a + b) * k;
      const first = a === 1 ? false : b === 1 ? true : Math.random() < 0.5, who = first ? n1 : n2, part = first ? a : b;
      return num(`${n1} and ${n2} share ${money(ctx.currency, T)} in the ratio ${a} : ${b}.\nHow much does ${who} get?`, part * k,
        ['Add the parts of the ratio to find how many equal parts there are.',
          `${a} + ${b} = ${a + b} parts, so 1 part = ${F(T)} ÷ ${a + b} = ${k}. Now find ${who}'s share.`],
        `1 part = ${k}. ${who} gets ${U.s(part, 'part')}: ${part} × ${k} = ${money(ctx.currency, part * k)}.`,
        { prefix: ctx.currency, visual: { type: 'barModel', rows: [{ label: n1, parts: a }, { label: n2, parts: b }], total: money(ctx.currency, T) } });
    };

    const share3 = () => {
      const names = U.sample(['Ali', 'Mia', 'Sam', 'Zara', 'Omar', 'Lucy', 'Kenan', 'Nina'], 3);
      const r = retry(() => { const a = R(1, 5), b = R(1, 5), c = R(1, 6); return U.gcd(U.gcd(a, b), c) === 1 && !(a === b && b === c) ? [a, b, c] : null; });
      const k = R(2, 12), T = sum(r) * k, i = retry(() => { const j = R(0, 2); return r[j] >= 2 ? j + 1 : null; }) - 1;
      return num(`${T} stickers are shared between ${names[0]}, ${names[1]} and ${names[2]} in the ratio ${r.join(' : ')}.\nHow many stickers does ${names[i]} get?`, r[i] * k,
        ['Add all the parts of the ratio, then find what 1 part is worth.',
          `${r.join(' + ')} = ${sum(r)} parts, so 1 part = ${T} ÷ ${sum(r)} = ${k}.`],
        `${names[i]} gets ${U.s(r[i], 'part')}: ${r[i]} × ${k} = ${r[i] * k} stickers.`,
        { unit: 'stickers', visual: { type: 'barModel', rows: names.map((nm, j) => ({ label: nm, parts: r[j] })), total: `${T}` } });
    };

    const givenOne = (L, ctx) => {
      const [n1, n2] = two(), [a, b] = coprime(2, 9), k = R(2, 12);
      return num(`${n1} and ${n2} share some money in the ratio ${a} : ${b}.\n${n1} gets ${money(ctx.currency, a * k)}. How much does ${n2} get?`, b * k,
        [`${n1}'s ${a} part${a > 1 ? 's are' : ' is'} worth ${money(ctx.currency, a * k)}. Find what 1 part is worth.`,
          `1 part = ${a * k} ÷ ${a} = ${k}. Now find ${n2}'s ${b} parts.`],
        `1 part = ${k}, so ${n2} gets ${b} × ${k} = ${money(ctx.currency, b * k)}.`,
        { prefix: ctx.currency, visual: { type: 'barModel', rows: [{ label: n1, parts: a, value: money(ctx.currency, a * k) }, { label: n2, parts: b, value: '?' }] } });
    };

    const unitary = (L, ctx) => {
      const item = pick([['pens', 'pen'], ['notebooks', 'notebook'], ['apples', 'apple'], ['bottles of water', 'bottle of water'], ['rulers', 'ruler']]);
      const n = R(3, 8), u = L === 1 ? R(2, 12) * 10 : R(15, 95), m = retry(() => { const v = R(2, 12); return v !== n ? v : null; });
      const unit = u / 100, cost = U.round(n * unit, 2), ans = U.round(m * unit, 2);
      return num(`${n} ${item[0]} cost ${money(ctx.currency, cost)}.\nHow much do ${m} ${item[0]} cost?`, ans,
        ['Use the unitary method: find the cost of 1 first.',
          `1 ${item[1]} costs ${F(cost, 2)} ÷ ${n} = ${F(unit, 2)}. Now multiply by ${m}.`],
        `${m} × ${F(unit, 2)} = ${F(ans, 2)}, so ${m} ${item[0]} cost ${money(ctx.currency, ans)}.`, { prefix: ctx.currency });
    };

    const recipe = () => {
      const p = pick([2, 4, 5, 6]), per = R(3, 12) * 10, r = retry(() => { const v = R(2, 12); return v !== p ? v : null; });
      const thing = pick([['flour', 'g'], ['rice', 'g'], ['milk', 'ml'], ['sugar', 'g']]);
      return num(`A recipe for ${p} people uses ${p * per} ${thing[1]} of ${thing[0]}.\nHow much ${thing[0]} is needed for ${r} people?`, r * per,
        ['The amounts are in direct proportion. Find the amount for 1 person first.',
          `For 1 person: ${p * per} ÷ ${p} = ${per} ${thing[1]}. Now multiply by ${r}.`],
        `${per} × ${r} = ${r * per} ${thing[1]}.`, { unit: thing[1] });
    };

    const unitsRatio = () => {
      const [small, big, f] = pick([['cm', 'm', 100], ['g', 'kg', 1000], ['mm', 'cm', 10], ['minutes', 'hours', 60]]);
      const d = retry(() => {
        const B = R(1, 4), Bs = B * f, q = R(2, 9);
        if (Bs % q) return null;
        const k = Bs / q, p = R(1, 9);
        if (p === q || U.gcd(p, q) !== 1 || p * k >= Bs * 2 || p * k === Bs) return null;
        const [x, y] = U.simplify(p * k, B);
        if (`${x} : ${y}` === `${p} : ${q}`) return null;
        return { B, Bs, q, k, p, s: p * k, x, y };
      });
      const bigTxt = big === 'hours' ? `${d.B} hour${d.B > 1 ? 's' : ''}` : `${d.B} ${big}`;
      return choice(`Write ${d.s} ${small} : ${bigTxt} as a ratio in its simplest form.`, `${d.p} : ${d.q}`,
        [`${d.x} : ${d.y}`, `${d.q} : ${d.p}`, `${d.s} : ${d.Bs}`],
        [`Both parts must be in the same units before you simplify. 1 ${big === 'hours' ? 'hour' : big} = ${f} ${small}.`,
          `${bigTxt} = ${d.Bs} ${small}, so the ratio is ${d.s} : ${d.Bs}. Now simplify.`],
        `${d.s} : ${d.Bs}. Divide both by ${U.gcd(d.s, d.Bs)} to get ${d.p} : ${d.q}.`);
    };

    const difference = (L, ctx) => {
      const [n1, n2] = two(), [a, b] = retry(() => { const [x, y] = coprime(1, 9); return x < y ? [x, y] : null; }), k = R(2, 12);
      const D = (b - a) * k;
      return num(`${n1} and ${n2} share some sweets in the ratio ${a} : ${b}.\n${n2} gets ${D} more sweets than ${n1}. How many sweets are there altogether?`, (a + b) * k,
        ['The difference between their shares is worth a number of parts. Find what 1 part is worth.',
          `The difference is ${b} − ${a} = ${b - a} part${b - a > 1 ? 's' : ''}, so 1 part = ${D} ÷ ${b - a} = ${k}.`],
        `1 part = ${k}. Altogether there are ${a} + ${b} = ${a + b} parts: ${a + b} × ${k} = ${(a + b) * k} sweets.`,
        { unit: 'sweets', visual: { type: 'barModel', rows: [{ label: n1, parts: a }, { label: n2, parts: b }] } });
    };

    const toFraction = () => {
      const [a, b] = coprime(1, 9), [c1, c2] = U.sample(['red', 'blue', 'green', 'yellow'], 2);
      return fracQ(`A bag has ${c1} and ${c2} counters in the ratio ${a} : ${b}.\nWhat fraction of the counters are ${c1}?`, a, a + b,
        ['A fraction compares one part with the whole. Add the parts to find the whole.',
          `There are ${a} + ${b} = ${a + b} parts altogether.`],
        `The ${c1} counters are ${a} out of every ${a + b}, so the fraction is ${fr(a, a + b)}.`);
    };

    const bestBuy = (L, ctx) => {
      const d = retry(() => {
        const nA = R(2, 8), nB = R(3, 12), uA = R(30, 90), uB = R(30, 90);
        if (nA === nB || Math.abs(uA - uB) < 3) return null;
        return { nA, nB, uA, uB, pA: U.round(nA * uA / 100, 2), pB: U.round(nB * uB / 100, 2) };
      });
      const right = d.uA < d.uB ? 'Pack A' : 'Pack B';
      return choice(`Pack A: ${d.nA} pens for ${money(ctx.currency, d.pA)}\nPack B: ${d.nB} pens for ${money(ctx.currency, d.pB)}\nWhich pack is better value?`, right,
        ['Pack A', 'Pack B', 'They are the same value'],
        ['Find the cost of 1 pen in each pack. The cheaper price per pen is better value.',
          `Pack A: ${F(d.pA, 2)} ÷ ${d.nA} = ${F(d.uA / 100, 2)} per pen. Now do Pack B.`],
        `Pack A is ${money(ctx.currency, d.uA / 100)} per pen and Pack B is ${money(ctx.currency, d.uB / 100)} per pen, so ${right} is better value.`);
    };

    const spotShare = () => {
      const d = retry(() => {
        const [a, b] = coprime(1, 7), k = R(2, 10), T = (a + b) * k;
        return T % b === 0 && a !== 1 && b !== 1 && T <= 120 ? { a, b, k, T } : null;
      });
      const who = U.name();
      return num(`${who} shares ${d.T} sweets in the ratio ${d.a} : ${d.b} and writes:\n1 part = ${d.T} ÷ ${d.b} = ${d.T / d.b}, so the first share = ${d.a} × ${d.T / d.b} = ${d.a * d.T / d.b}.\nWhat should the first share be?`, d.a * d.k,
        [`${who} divided by one number of the ratio. Divide by the **total** number of parts.`,
          `There are ${d.a} + ${d.b} = ${d.a + d.b} parts, so 1 part = ${d.T} ÷ ${d.a + d.b} = ${d.k}.`],
        `1 part = ${d.k}, so the first share is ${d.a} × ${d.k} = ${d.a * d.k} sweets.`, { unit: 'sweets' });
    };

    PMLM.registerSkill({
      id: 'g8.ratio', grade: 8, unit: 'g8.u3', title: 'Ratio and proportion', icon: '🍪',
      blurb: 'Simplify and share in a ratio; use the unitary method',
      lesson: [
        { title: 'Simplifying a ratio',
          text: 'Divide every part by the same number (the HCF), like simplifying a fraction.\n12 : 18 → divide by 6 → **2 : 3**\nUse the same units first: 50 cm : 2 m = 50 : 200 = 1 : 4.' },
        { title: 'Sharing in a ratio',
          text: 'Share 40 in the ratio 3 : 5.\nThere are 3 + 5 = 8 equal parts. 1 part = 40 ÷ 8 = 5.\nShares: 3 × 5 = **15** and 5 × 5 = **25**. Check: 15 + 25 = 40.',
          visual: { type: 'barModel', rows: [{ label: 'Ali', parts: 3 }, { label: 'Mia', parts: 5 }], total: '40' } },
        { title: 'The unitary method',
          text: 'In direct proportion, find the value of **one** first.\n5 pens cost 3.50.\n1 pen costs 3.50 ÷ 5 = 0.70.\n8 pens cost 8 × 0.70 = 5.60.' },
        { title: 'Ratio and fractions',
          text: 'Red : blue = 3 : 5 means 3 red for every 5 blue.\nThere are 8 parts, so {3/8} are red and {5/8} are blue.\nCareful: red is not {3/5} of the total.' },
        { title: 'Worked example',
          text: 'Share 72 in the ratio 2 : 7.\n**1.** Total parts: 2 + 7 = 9.\n**2.** 1 part: 72 ÷ 9 = 8.\n**3.** Shares: 2 × 8 = 16 and 7 × 8 = 56.\nAnswer: **16 and 56** (check: 16 + 56 = 72)',
          visual: { type: 'barModel', rows: [{ label: 'A', parts: 2 }, { label: 'B', parts: 7 }], total: '72' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [simplify, share, share, unitary],
          [share3, givenOne, unitsRatio, recipe, simplify, unitary],
          [difference, toFraction, bestBuy, spotShare, givenOne, unitsRatio],
        ], ctx);
      },
    });
  }

  // ═══════════════════════════ Unit 4: Algebra ═══════════════════════════
  PMLM.registerUnit({ id: 'g8.u4', grade: 8, name: 'Algebra', icon: '🔤' });

  /* 10 ── Collecting like terms */
  {
    const LETTERS = [['x', 'y'], ['a', 'b'], ['m', 'n'], ['p', 'q']];
    const NUDGE = 'Like terms have exactly the same letters (and powers). Collect each kind separately. The sign in front of a term belongs to that term.';

    const twoVars = (L, ctx, spotIt) => {
      const [X, Y] = pick(LETTERS);
      const r = retry(() => {
        const a = R(1, 9), b = R(1, 9), c = L === 1 ? R(1, 9) : nz(-9, 9), d = L === 1 ? R(1, 9) : nz(-9, 9);
        if (a + c === 0 || b + d === 0) return null;
        if (L >= 2 && c > 0 && d > 0) return null;
        return { a, b, c, d, cx: a + c, cy: b + d };
      });
      const q = ex([[r.a, X], [r.b, Y], [r.c, X], [r.d, Y]]);
      const right = ex([[r.cx, X], [r.cy, Y]]);
      const all = r.a + r.b + r.c + r.d;
      const w = L === 1
        ? [ex([[all, X + Y]]), ex([[r.cx, X + '^{2}'], [r.cy, Y + '^{2}']]), ex([[r.a + r.d, X], [r.b + r.c, Y]])]
        : [ex([[r.a + Math.abs(r.c), X], [r.cy, Y]]), ex([[r.cx, X], [-r.cy, Y]]), ex([[r.cx, X], [r.b + Math.abs(r.d), Y]]), ex([[all, X + Y]])];
      const hints = [NUDGE, `${X}-terms: ${ex([[r.a, X], [r.c, X]])} = ${ex([[r.cx, X]])}. Now collect the ${Y}-terms.`];
      const explain = `${X}-terms: ${ex([[r.a, X], [r.c, X]])} = ${ex([[r.cx, X]])}. ${Y}-terms: ${ex([[r.b, Y], [r.d, Y]])} = ${ex([[r.cy, Y]])}. So the answer is ${right}.`;
      if (spotIt) {
        const who = U.name();
        return choice(`${who} simplifies ${q} and writes ${ex([[all, X + Y]])}.\nWhat should the answer be?`, right, w.slice(0, -1).concat([ex([[r.cx, X], [-r.cy, Y]])]),
          [`${who} added everything into one term, but ${X} and ${Y} are not like terms. ${NUDGE}`, hints[1]], explain);
      }
      return choice(`Simplify ${q}`, right, w, hints, explain);
    };

    const missing = L => {
      const v = pick(['a', 'x', 'm', 'y']);
      if (L === 1) {
        const a = R(4, 12), b = R(1, a - 1), c = R(1, 9), ans = a - b + c;
        return num(`${ex([[a, v], [-b, v], [c, v]])} = □${v}\nWhat number goes in the box?`, ans,
          ['All three terms are like terms. Work through them from left to right.', `${ex([[a, v], [-b, v]])} = ${ex([[a - b, v]])}. Now ${'add'} ${ex([[c, v]])}.`],
          `${a} − ${b} + ${c} = ${ans}, so the answer is ${ans}${v}.`);
      }
      const [X, Y] = pick(LETTERS);
      const a = R(5, 12), m = R(1, a - 1), b = R(1, 9);
      return num(`Find the missing number.\n${a}${X} − □${X} + ${ex([[b, Y]])} = ${ex([[a - m, X], [b, Y]])}`, m,
        [`Only the ${X}-terms change. ${Y}-terms stay as they are.`, `${a}${X} − □${X} must equal ${ex([[a - m, X]])}.`],
        `${a} − ${m} = ${a - m}, so □ = ${m}.`);
    };

    const coefficient = () => {
      const [X, Y] = pick(LETTERS);
      const a = R(2, 9), b = nz(-9, 9), c = nz(-9, 9), d = nz(-6, 6);
      if (b + d === 0) return coefficient();
      const q = ex([[a, X], [b, Y], [c, X], [d, Y]]);
      return num(`Simplify ${q}.\nWhat is the coefficient of ${Y} (the number in front of ${Y})?`, b + d,
        [`Collect only the ${Y}-terms. Keep the sign in front of each one.`, `The ${Y}-terms are ${ex([[b, Y]])} and ${ex([[d, Y]])} (with its sign).`],
        `${ex([[b, Y], [d, Y]])} = ${ex([[b + d, Y]])}, so the coefficient is ${F(b + d)}.`);
    };

    const constants = L => {
      const X = pick(['x', 'a', 'n', 'p']);
      const r = retry(() => {
        const a = R(2, 9), b = R(1, 12), c = R(1, 9), d = R(1, 12);
        if (L === 1 && (a <= c || b <= d)) return null;
        return a !== c && b !== d ? { a, b, c, d } : null;
      });
      const q = ex([[r.a, X], [r.b, ''], [-r.c, X], [-r.d, '']]);
      const right = ex([[r.a - r.c, X], [r.b - r.d, '']]);
      return choice(`Simplify ${q}`, right,
        [ex([[r.a - r.c, X], [r.b + r.d, '']]), ex([[r.a + r.c, X], [r.b - r.d, '']]), ex([[r.a - r.c + r.b - r.d, X]])],
        [NUDGE + ' Numbers on their own are like terms with each other.', `${X}-terms: ${ex([[r.a, X], [-r.c, X]])} = ${ex([[r.a - r.c, X]])}. Now collect the numbers.`],
        `${X}-terms give ${ex([[r.a - r.c, X]])}; numbers: ${r.b} − ${r.d} = ${F(r.b - r.d)}. So the answer is ${right}.`);
    };

    const squares = () => {
      const r = retry(() => {
        const a = R(1, 6), c = nz(-5, 5), b = nz(-9, 9), d = nz(-9, 9), e = nz(-9, 9);
        return a + c !== 0 && b + d !== 0 && a + b + c + d !== 0 ? { a, b, c, d, e } : null;
      });
      const q = ex([[r.a, 'x^{2}'], [r.b, 'x'], [r.c, 'x^{2}'], [r.d, 'x'], [r.e, '']]);
      const right = ex([[r.a + r.c, 'x^{2}'], [r.b + r.d, 'x'], [r.e, '']]);
      return choice(`Simplify ${q}`, right,
        [ex([[r.a + r.b + r.c + r.d, 'x^{2}'], [r.e, '']]), ex([[r.a + r.c, 'x^{4}'], [r.b + r.d, 'x^{2}'], [r.e, '']]), ex([[r.a + r.c, 'x^{2}'], [r.b + r.d + r.e, 'x']])],
        ['x^{2} and x are **not** like terms, so keep them apart. Adding x^{2}-terms does not change the power.',
          `x^{2}-terms: ${ex([[r.a, 'x^{2}'], [r.c, 'x^{2}']])} = ${ex([[r.a + r.c, 'x^{2}']])}. Now collect the x-terms and the number.`],
        `x^{2}-terms: ${ex([[r.a + r.c, 'x^{2}']])}; x-terms: ${ex([[r.b, 'x'], [r.d, 'x']])} = ${ex([[r.b + r.d, 'x']])}; number: ${F(r.e)}. Answer: ${right}.`);
    };

    const abba = () => {
      const [u, v] = pick([['a', 'b'], ['x', 'y'], ['p', 'q']]);
      const p = R(2, 7), q = R(1, 6), r = -R(1, 4);
      if (p + q + r <= 0 || p + r === 0 || p - q + r === 0 || p - q + r === p + q + r) return abba();
      return choice(`Simplify ${ex([[p, u + v], [q, v + u], [r, u + v]])}`, ex([[p + q + r, u + v]]),
        [ex([[p + q - r, u + v]]), ex([[p + q + r, `${u}^{2}${v}^{2}`]]), ex([[p - q + r, u + v]]), ex([[p + q, u + v]])],
        [`${u}${v} and ${v}${u} mean the same thing (${u} × ${v} = ${v} × ${u}), so they are like terms.`,
          `Write ${ex([[q, v + u]])} as ${ex([[q, u + v]])}. Now collect all the ${u}${v} terms.`],
        `${p} + ${q} − ${-r} = ${p + q + r}, so the answer is ${ex([[p + q + r, u + v]])}.`);
    };

    const perimeter = () => {
      const r = retry(() => {
        const p = R(1, 4), q = R(1, 9), s = R(1, 5), t = R(1, 6);
        return q !== t ? { p, q, s, t } : null;
      });
      const side1 = ex([[r.p, 'x'], [r.q, '']]), side2 = ex([[r.s, 'x'], [-r.t, '']]);
      const right = ex([[2 * (r.p + r.s), 'x'], [2 * (r.q - r.t), '']]);
      return choice(`A rectangle has sides (${side1}) cm and (${side2}) cm.\nWhich expression is its perimeter in cm?`, right,
        [ex([[r.p + r.s, 'x'], [r.q - r.t, '']]), ex([[2 * (r.p + r.s), 'x'], [2 * (r.q + r.t), '']]), ex([[2 * (r.p + r.s) + 2 * (r.q - r.t), 'x']])],
        ['A rectangle has 4 sides: two of each length. Add all four, then collect like terms.',
          `Two sides: (${side1}) + (${side2}) = ${ex([[r.p + r.s, 'x'], [r.q - r.t, '']])}. Now double it.`],
        `2 × (${ex([[r.p + r.s, 'x'], [r.q - r.t, '']])}) = ${right}.`,
        { visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `(${side1}) cm`, height: `(${side2}) cm` } } });
    };

    PMLM.registerSkill({
      id: 'g8.likeTerms', grade: 8, unit: 'g8.u4', title: 'Collecting like terms', icon: '🧺',
      blurb: 'Simplify expressions by collecting like terms',
      lesson: [
        { title: 'What are like terms?',
          text: 'Like terms have **exactly the same letters and powers**.\n3x and 5x are like terms. 3x and 3y are not.\nx^{2} and x are **not** like terms.\nab and ba **are** like terms, because a × b = b × a.',
          visual: { type: 'table', headers: ['x-terms', 'y-terms', 'numbers'], rows: [['4x, −x', '2y, 5y', '7, −3']] } },
        { title: 'Collect each kind',
          text: 'Add or subtract the numbers in front (the coefficients) of each kind of term.\n4a + 3b − a + 2b = 3a + 5b\nThe sign in front of a term belongs to it: −a means take away one a.' },
        { title: 'Powers stay the same',
          text: '2x^{2} + x^{2} = 3x^{2} (not 3x^{4}: you are counting x^{2}s).\n2x^{2} + 3x + x^{2} = 3x^{2} + 3x\nYou cannot combine 3x^{2} and 3x.' },
        { title: 'Worked example',
          text: 'Simplify 5x + 3y − 2x − 7y.\n**1.** x-terms: 5x − 2x = 3x.\n**2.** y-terms: 3y − 7y = −4y.\n**3.** Put them together: **3x − 4y**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [twoVars, twoVars, missing, constants],
          [twoVars, twoVars, constants, coefficient, missing],
          [squares, abba, perimeter, (l) => twoVars(3, null, true), squares, coefficient],
        ], ctx);
      },
    });
  }

  /* 11 ── Expanding and factorising single brackets */
  {
    const br = (inner) => `(${inner})`;
    const join = (e1, e2) => (e2.startsWith(M) ? `${e1} ${M} ${e2.slice(1)}` : `${e1} + ${e2}`);

    const expand1 = L => {
      const a = R(2, 9), b = R(1, 9) * sgn();
      const q = `${a}${br(ex([[1, 'x'], [b, '']]))}`;
      const right = ex([[a, 'x'], [a * b, '']]);
      const extra = L === 1 ? { visual: { type: 'table', headers: ['×', 'x', b < 0 ? `${M}${-b}` : `+${b}`], rows: [[`${a}`, '?', '?']] } } : {};
      return choice(`Expand ${q}`, right,
        [ex([[a, 'x'], [b, '']]), ex([[a, 'x'], [-a * b, '']]), ex([[1, 'x'], [a * b, '']]), ex([[a, 'x'], [a + b, '']])],
        [`Multiply **every** term inside the bracket by ${a}.`, `${a} × x = ${a}x. Now work out ${a} × ${P(b)}.`],
        `${a} × x = ${a}x and ${a} × ${P(b)} = ${F(a * b)}, so ${q} = ${right}.`, extra);
    };

    const numberTerm = () => {
      const a = R(2, 9), p = R(1, 5), b = R(1, 9) * sgn();
      const inner = ex([[p, 'x'], [b, '']]);
      return num(`Complete: ${a}(${inner}) = ${ex([[a * p, 'x']])} ${b < 0 ? M : '+'} □`, a * Math.abs(b),
        ['Multiply each term inside the bracket by the number outside.', `The second term is ${a} × ${P(b)}.`],
        `${a} × ${P(b)} = ${F(a * b)}, so ${a}(${inner}) = ${ex([[a * p, 'x'], [a * b, '']])}. The box is ${a * Math.abs(b)}.`);
    };

    const factorise1 = L => {
      const r = retry(() => {
        const g = R(2, L === 1 ? 6 : 9), p = R(1, 6), q = R(1, 9);
        return U.gcd(p, q) === 1 && !(p === 1 && q === 1) ? { g, p, q: q * (L === 1 ? 1 : sgn()) } : null;
      });
      const q = ex([[r.g * r.p, 'x'], [r.g * r.q, '']]);
      const right = `${r.g}${br(ex([[r.p, 'x'], [r.q, '']]))}`;
      const f = U.primeFactors(r.g)[0];
      const w = [`${r.g}${br(ex([[r.g * r.p, 'x'], [r.q, '']]))}`, `${r.g}${br(ex([[r.p, 'x'], [r.g * r.q, '']]))}`, `${r.g}${br(ex([[r.p, 'x'], [-r.q, '']]))}`];
      if (f !== r.g) w.unshift(`${f}${br(ex([[r.g * r.p / f, 'x'], [r.g * r.q / f, '']]))}`);
      return choice(`Factorise fully: ${q}`, right, w,
        ['Find the highest common factor (HCF) of both terms. Put it outside the bracket and divide each term by it.',
          `The HCF of ${r.g * r.p} and ${Math.abs(r.g * r.q)} is ${r.g}. So it starts ${r.g}( … ). Divide each term by ${r.g}.`],
        `${r.g * r.p}x ÷ ${r.g} = ${ex([[r.p, 'x']])} and ${F(r.g * r.q)} ÷ ${r.g} = ${F(r.q)}, so ${q} = ${right}. Check by expanding.`);
    };

    const missingFactor = () => {
      const g = R(2, 8), p = R(2, 6), q = R(1, 9);
      if (U.gcd(p, q) !== 1) return missingFactor();
      return num(`Complete: ${ex([[g * p, 'x'], [g * q, '']])} = ${g}(□x + ${q})`, p,
        [`Expanding ${g}(□x + ${q}) must give back ${g * p}x.`, `${g} × □ = ${g * p}.`],
        `${g * p} ÷ ${g} = ${p}, so □ = ${p}.`);
    };

    const negExpand = () => {
      const a = R(2, 9), b = R(1, 9) * sgn();
      const q = `${M}${a}${br(ex([[1, 'x'], [b, '']]))}`;
      const right = ex([[-a, 'x'], [-a * b, '']]);
      return choice(`Expand ${q}`, right,
        [ex([[-a, 'x'], [a * b, '']]), ex([[-a, 'x'], [b, '']]), ex([[a, 'x'], [a * b, '']])],
        [`Multiply every term inside by ${M}${a}. Watch the signs: negative × negative = positive.`,
          `${M}${a} × x = ${M}${a}x. Now work out ${M}${a} × ${P(b)}.`],
        `${M}${a} × x = ${M}${a}x and ${M}${a} × ${P(b)} = ${F(-a * b)}, so ${q} = ${right}.`);
    };

    const xExpand = () => {
      const b = R(1, 9) * sgn(), v = pick(['x', 'a', 'y']);
      const q = `${v}${br(ex([[1, v], [b, '']]))}`;
      return choice(`Expand ${q}`, ex([[1, `${v}^{2}`], [b, v]]),
        [ex([[2, v], [b, v]]), ex([[1, `${v}^{2}`], [b, '']]), ex([[1, v], [b, v]])],
        [`Multiply each term inside by ${v}. Remember ${v} × ${v} = ${v}^{2}.`, `${v} × ${v} = ${v}^{2}. Now work out ${v} × ${P(b)}.`],
        `${v} × ${v} = ${v}^{2} and ${v} × ${P(b)} = ${ex([[b, v]])}, so ${q} = ${ex([[1, `${v}^{2}`], [b, v]])}.`);
    };

    const twoBrackets = () => {
      const r = retry(() => {
        const a = R(2, 6), c = R(2, 6), b = nz(-7, 7), d = nz(-7, 7);
        return a * b + c * d !== 0 && b !== d ? { a, b, c, d } : null;
      });
      const q = `${r.a}${br(ex([[1, 'x'], [r.b, '']]))} + ${r.c}${br(ex([[1, 'x'], [r.d, '']]))}`;
      const right = ex([[r.a + r.c, 'x'], [r.a * r.b + r.c * r.d, '']]);
      return choice(`Expand and simplify ${q}`, right,
        [ex([[r.a + r.c, 'x'], [r.b + r.d, '']]), ex([[r.a + r.c, 'x'], [r.a * r.b + r.d, '']]), ex([[r.a * r.c, 'x'], [r.a * r.b + r.c * r.d, '']])],
        ['Expand each bracket first, then collect like terms.',
          `${r.a}${br(ex([[1, 'x'], [r.b, '']]))} = ${ex([[r.a, 'x'], [r.a * r.b, '']])}. Now expand the second bracket.`],
        `${ex([[r.a, 'x'], [r.a * r.b, '']])} + ${ex([[r.c, 'x'], [r.c * r.d, '']])} = ${right}.`);
    };

    const subBrackets = () => {
      const r = retry(() => {
        const a = R(3, 7), c = R(2, 6), b = R(1, 7), d = nz(-6, 6);
        return a !== c && a * b - c * d !== 0 && a * b + c * d !== a * b - c * d ? { a, b, c, d } : null;
      });
      const q = `${r.a}${br(ex([[1, 'x'], [r.b, '']]))} ${M} ${r.c}${br(ex([[1, 'x'], [r.d, '']]))}`;
      const right = ex([[r.a - r.c, 'x'], [r.a * r.b - r.c * r.d, '']]);
      return choice(`Expand and simplify ${q}`, right,
        [ex([[r.a - r.c, 'x'], [r.a * r.b + r.c * r.d, '']]), ex([[r.a - r.c, 'x'], [r.a * r.b - r.d, '']]), ex([[r.a + r.c, 'x'], [r.a * r.b - r.c * r.d, '']])],
        [`The ${M}${r.c} multiplies **both** terms in the second bracket.`,
          `${M}${r.c}${br(ex([[1, 'x'], [r.d, '']]))} = ${ex([[-r.c, 'x'], [-r.c * r.d, '']])}. Now expand the first bracket and collect like terms.`],
        `${join(ex([[r.a, 'x'], [r.a * r.b, '']]), ex([[-r.c, 'x'], [-r.c * r.d, '']]))} = ${right}.`);
    };

    const factoriseFully = () => {
      const r = retry(() => {
        const g = R(2, 6), p = R(1, 5), q = R(1, 7);
        return U.gcd(p, q) === 1 ? { g, p, q: q * sgn() } : null;
      });
      const q = ex([[r.g * r.p, 'x^{2}'], [r.g * r.q, 'x']]);
      const right = `${r.g}x${br(ex([[r.p, 'x'], [r.q, '']]))}`;
      return choice(`Factorise fully: ${q}`, right,
        [`${r.g}${br(ex([[r.p, 'x^{2}'], [r.q, 'x']]))}`, `x${br(ex([[r.g * r.p, 'x'], [r.g * r.q, '']]))}`, `${r.g}x${br(ex([[r.p, 'x'], [r.g * r.q, '']]))}`],
        ['"Fully" means take out the HCF of the numbers **and** any letters both terms share.',
          `The numbers ${r.g * r.p} and ${Math.abs(r.g * r.q)} have HCF ${r.g}, and both terms contain x. So take out ${r.g}x.`],
        `${q} = ${right}. Check: ${r.g}x × ${ex([[r.p, 'x']])} = ${ex([[r.g * r.p, 'x^{2}']])} and ${r.g}x × ${P(r.q)} = ${ex([[r.g * r.q, 'x']])}.`);
    };

    const expandX = () => {
      const a = R(2, 5), b = R(2, 6), c = R(1, 9) * sgn();
      const q = `${a}x${br(ex([[b, 'x'], [c, '']]))}`;
      const right = ex([[a * b, 'x^{2}'], [a * c, 'x']]);
      return choice(`Expand ${q}`, right,
        [ex([[a * b, 'x^{2}'], [a * c, '']]), ex([[a * b, 'x^{2}'], [c, 'x']]), ex([[a * b, 'x'], [a * c, 'x']])],
        [`Multiply each term inside by ${a}x. Multiply numbers with numbers and letters with letters.`,
          `${a}x × ${b}x = ${a * b}x^{2}. Now work out ${a}x × ${P(c)}.`],
        `${a}x × ${b}x = ${a * b}x^{2} and ${a}x × ${P(c)} = ${ex([[a * c, 'x']])}, so the answer is ${right}.`);
    };

    const area = () => {
      const a = R(2, 9), b = R(1, 9);
      return choice(`A rectangle is ${a} cm wide and (x + ${b}) cm long.\nWhich expression gives its area in cm²?`, ex([[a, 'x'], [a * b, '']]),
        [ex([[a, 'x'], [b, '']]), ex([[1, 'x'], [a * b, '']]), ex([[a, 'x'], [a + b, '']]), ex([[2, 'x'], [2 * (a + b), '']])],
        ['Area of a rectangle = length × width. Write it with a bracket, then expand.', `Area = ${a}(x + ${b}). Multiply both terms by ${a}.`],
        `${a}(x + ${b}) = ${ex([[a, 'x'], [a * b, '']])}.`,
        { visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `(x + ${b}) cm`, height: `${a} cm` } } });
    };

    const spot = () => {
      const a = R(2, 9), b = R(2, 9) * sgn(), who = U.name();
      const q = `${a}${br(ex([[1, 'x'], [b, '']]))}`;
      return choice(`${who} writes ${q} = ${ex([[a, 'x'], [b, '']])}.\nWhat is the correct expansion?`, ex([[a, 'x'], [a * b, '']]),
        [ex([[a, 'x'], [-a * b, '']]), ex([[1, 'x'], [a * b, '']]), ex([[a, 'x'], [a + b, '']])],
        [`${who} only multiplied the first term. The ${a} multiplies **everything** inside the bracket.`, `${a} × x = ${a}x. Now multiply ${a} × ${P(b)}.`],
        `${a} × ${P(b)} = ${F(a * b)}, so ${q} = ${ex([[a, 'x'], [a * b, '']])}.`);
    };

    PMLM.registerSkill({
      id: 'g8.brackets', grade: 8, unit: 'g8.u4', title: 'Expand and factorise', icon: '📦',
      blurb: 'Expand single brackets and factorise expressions',
      lesson: [
        { title: 'Expanding a bracket',
          text: 'Multiply **every** term inside the bracket by the term outside.\n3(x + 4) = 3 × x + 3 × 4 = 3x + 12\nA grid helps you not to miss a term.\n**Common mistake:** 3(x + 4) is not 3x + 4.',
          visual: { type: 'table', headers: ['×', 'x', '+4'], rows: [['3', '3x', '+12']] } },
        { title: 'Negatives and letters outside',
          text: '−2(x − 5) = −2x + 10 (negative × negative = positive)\nx(x + 3) = x^{2} + 3x\n2x(3x − 1) = 6x^{2} − 2x' },
        { title: 'Factorising',
          text: 'Factorising is expanding backwards. Find the HCF of the terms and put it outside.\n6x + 15: the HCF of 6 and 15 is 3.\n6x + 15 = 3(2x + 5)\nCheck by expanding: 3 × 2x + 3 × 5 = 6x + 15 ✓' },
        { title: 'Factorise fully',
          text: 'Take out the biggest factor you can, including letters.\n4x^{2} + 6x = **2x**(2x + 3)\n2(2x^{2} + 3x) and x(4x + 6) are true, but **not** fully factorised.' },
        { title: 'Worked example',
          text: 'Expand and simplify 3(x + 2) + 2(x − 4).\n**1.** 3(x + 2) = 3x + 6\n**2.** 2(x − 4) = 2x − 8\n**3.** Collect: 3x + 2x = 5x and 6 − 8 = −2.\nAnswer: **5x − 2**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [expand1, expand1, numberTerm, factorise1, missingFactor],
          [negExpand, xExpand, twoBrackets, factorise1, expand1, numberTerm],
          [subBrackets, factoriseFully, expandX, area, spot, twoBrackets],
        ], ctx);
      },
    });
  }

  /* 12 ── Substitution into expressions and formulae */
  {
    const NUDGE = 'Replace each letter with its value. Put negative numbers in brackets. Remember: 3a means 3 × a, and do powers before × and +.';

    const posLinear = () => {
      const t = R(1, 5), a = R(2, 9), b = R(2, 9), p = R(2, 9), q = R(2, 12);
      const vals = `a = ${a} and b = ${b}`;
      if (t === 1) return num(`Find the value of ${p}a + ${q} when a = ${a}.`, p * a + q, [NUDGE, `${p}a = ${p} × ${a} = ${p * a}. Now add ${q}.`], `${p} × ${a} + ${q} = ${p * a} + ${q} = ${p * a + q}.`);
      if (t === 2) {
        const v = p * a - q * b;
        return num(`Find the value of ${p}a − ${q}b when ${vals}.`, v, [NUDGE, `${p}a = ${p} × ${a} = ${p * a}. Now work out ${q}b and subtract.`], `${p * a} − ${q * b} = ${F(v)}.`);
      }
      if (t === 3) return num(`Find the value of ab + ${q} when ${vals}.`, a * b + q, [NUDGE + ' ab means a × b.', `ab = ${a} × ${b} = ${a * b}. Now add ${q}.`], `${a * b} + ${q} = ${a * b + q}.`);
      if (t === 4) return num(`Find the value of ${p}(a + ${q}) when a = ${a}.`, p * (a + q), [NUDGE + ' Work out the bracket first.', `a + ${q} = ${a} + ${q} = ${a + q}. Now multiply by ${p}.`], `${p} × ${a + q} = ${p * (a + q)}.`);
      const e = 2 * R(2, 9);
      return num(`Find the value of {a/2} + ${q} when a = ${e}.`, e / 2 + q, [NUDGE + ' {a/2} means a ÷ 2.', `{a/2} = ${e} ÷ 2 = ${e / 2}. Now add ${q}.`], `${e / 2} + ${q} = ${e / 2 + q}.`);
    };

    const negSub = () => {
      const t = R(1, 5), x = -R(1, 6), y = R(-6, 6) || 2, p = R(2, 7), q = R(2, 12);
      if (t === 1) {
        const v = p * x + q;
        return num(`Find the value of ${p}x + ${q} when x = ${F(x)}.`, v, [NUDGE, `${p}x = ${p} × ${P(x)} = ${F(p * x)}. Now add ${q}.`], `${F(p * x)} + ${q} = ${F(v)}.`);
      }
      if (t === 2) {
        const v = q - p * x;
        return num(`Find the value of ${q} − ${p}x when x = ${F(x)}.`, v, [NUDGE, `${p}x = ${p} × ${P(x)} = ${F(p * x)}. So work out ${q} − ${P(p * x)}.`], `${q} − ${P(p * x)} = ${q} + ${A(p * x)} = ${F(v)}.`);
      }
      if (t === 3) {
        const v = x * x + p * x;
        return num(`Find the value of x^{2} + ${p}x when x = ${F(x)}.`, v, [NUDGE + ' A negative number squared is positive.', `x^{2} = ${P(x)}^{2} = ${x * x}. Now work out ${p}x and add.`], `${x * x} + ${p} × ${P(x)} = ${x * x} + ${P(p * x)} = ${F(v)}.`);
      }
      if (t === 4) {
        const v = p * x - q * y;
        return num(`Find the value of ${p}x − ${q}y when x = ${F(x)} and y = ${F(y)}.`, v, [NUDGE, `${p}x = ${p} × ${P(x)} = ${F(p * x)}. Now work out ${q}y.`], `${p}x = ${F(p * x)} and ${q}y = ${F(q * y)}. ${F(p * x)} − ${P(q * y)} = ${F(v)}.`);
      }
      const v = x * x - q;
      return num(`Find the value of x^{2} − ${q} when x = ${F(x)}.`, v, [NUDGE + ' A negative number squared is positive.', `x^{2} = ${P(x)} × ${P(x)} = ${x * x}. Now subtract ${q}.`], `${x * x} − ${q} = ${F(v)}.`);
    };

    const formula = (L, ctx) => {
      const t = R(1, 4);
      if (t === 1) {
        const l = R(3, 15), w = R(2, 12);
        return num(`The perimeter of a rectangle is P = 2(l + w).\nFind P when l = ${l} and w = ${w}.`, 2 * (l + w), [NUDGE + ' Work out the bracket first.', `l + w = ${l} + ${w} = ${l + w}. Now multiply by 2.`], `P = 2 × ${l + w} = ${2 * (l + w)}.`);
      }
      if (t === 2) {
        const b = 2 * R(2, 10), h = R(3, 12);
        return num(`The area of a triangle is A = {1/2}bh.\nFind A when b = ${b} and h = ${h}.`, b * h / 2, [NUDGE + ' {1/2}bh means half of b × h.', `b × h = ${b} × ${h} = ${b * h}. Now halve it.`], `A = {1/2} × ${b * h} = ${b * h / 2}.`);
      }
      if (t === 3) {
        const s = R(2, 6), per = R(2, 4), d = R(3, 15);
        return num(`A taxi charges C = ${s} + ${per}d, where d is the distance in km.\nFind the cost C for a ${d} km journey.`, s + per * d, [NUDGE, `${per}d = ${per} × ${d} = ${per * d}. Now add ${s}.`], `C = ${s} + ${per * d} = ${s + per * d}, so it costs ${money(ctx.currency, s + per * d)}.`, { prefix: ctx.currency });
      }
      const u = R(1, 10), a = R(2, 6), tt = R(2, 8);
      return num(`v = u + at\nFind v when u = ${u}, a = ${a} and t = ${tt}.`, u + a * tt, [NUDGE + ' at means a × t.', `at = ${a} × ${tt} = ${a * tt}. Now add u.`], `v = ${u} + ${a * tt} = ${u + a * tt}.`);
    };

    const stretch = (L, ctx) => {
      const t = R(1, 6), who = U.name();
      if (t === 1) {
        const x = -R(2, 5), y = nz(-6, 6), p = R(2, 4), q = R(2, 5), v = p * x * x - q * y;
        return num(`Find the value of ${p}x^{2} − ${q}y when x = ${F(x)} and y = ${F(y)}.`, v,
          [NUDGE + ` ${p}x^{2} means ${p} × x^{2}: square first, then multiply.`, `x^{2} = ${P(x)}^{2} = ${x * x}, so ${p}x^{2} = ${p * x * x}. Now work out ${q}y.`],
          `${p * x * x} − ${q} × ${P(y)} = ${p * x * x} − ${P(q * y)} = ${F(v)}.`);
      }
      if (t === 2) {
        const x = -R(2, 9), k = R(1, 9);
        return num(`When x = ${F(x)}, ${who} says x^{2} = ${F(-x * x)}.\nWhat is the correct value of x^{2} + ${k}?`, x * x + k,
          [`${P(x)}^{2} means ${P(x)} × ${P(x)}. Negative × negative is positive.`, `${P(x)} × ${P(x)} = ${x * x}. Now add ${k}.`],
          `x^{2} = ${x * x} (not ${F(-x * x)}), so x^{2} + ${k} = ${x * x + k}.`);
      }
      if (t === 3) {
        const C = pick([-20, -15, -10, -5, 5, 10, 15, 20, 25, 30, 35, 40]), F9 = 9 * C / 5;
        return num(`F = {9/5}C + 32 changes °C into °F.\nFind F when C = ${F(C)}.`, F9 + 32,
          [NUDGE + ` {9/5}C means C × 9 ÷ 5.`, `{9/5} × ${P(C)} = ${F(9 * C)} ÷ 5 = ${F(F9)}. Now add 32.`],
          `F = ${F(F9)} + 32 = ${F(F9 + 32)}.`, { unit: '°F' });
      }
      if (t === 4) {
        const u = R(2, 20), a = R(2, 6), tt = R(2, 8), v = u + a * tt;
        return num(`v = u + at\nFind a when v = ${v}, u = ${u} and t = ${tt}.`, a,
          ['Substitute the values you know. Then solve the equation for a.', `${v} = ${u} + ${tt}a. Subtract ${u} from both sides: ${v - u} = ${tt}a.`],
          `${tt}a = ${v - u}, so a = ${v - u} ÷ ${tt} = ${a}.`);
      }
      if (t === 5) {
        const x = -R(3, 8), y = retry(() => { const v = R(1, 7); return Math.abs(x + v) >= 2 ? v : null; }), s = x + y;
        return num(`Find the value of (x + y)^{2} when x = ${F(x)} and y = ${y}.`, s * s,
          ['Work out the bracket first, then square it.', `x + y = ${F(x)} + ${y} = ${F(s)}. Now square it.`],
          `${P(s)}^{2} = ${P(s)} × ${P(s)} = ${s * s}.`);
      }
      const v0 = -R(2, 6), a = nz(-4, 4), tt = R(2, 6), v = v0 + a * tt;
      return num(`v = u + at\nFind v when u = ${F(v0)}, a = ${F(a)} and t = ${tt}.`, v,
        [NUDGE, `at = ${P(a)} × ${tt} = ${F(a * tt)}. Now add it to u.`],
        `v = ${F(v0)} + ${P(a * tt)} = ${F(v)}.`);
    };

    PMLM.registerSkill({
      id: 'g8.substitution', grade: 8, unit: 'g8.u4', title: 'Substitution', icon: '🧩',
      blurb: 'Put numbers into expressions and formulae',
      lesson: [
        { title: 'Swap letters for numbers',
          text: 'To **substitute**, replace each letter with its value.\nIf a = 4: 3a + 2 = 3 × 4 + 2 = 14.\nRemember 3a means 3 × a, and ab means a × b.' },
        { title: 'Negative values',
          text: 'Put negative numbers in **brackets** so you don\'t lose the sign.\nIf x = −3:\nx^{2} = (−3)^{2} = 9 (positive!)\n5 − 2x = 5 − 2 × (−3) = 5 + 6 = 11' },
        { title: 'Order of operations',
          text: 'Brackets, then powers, then × and ÷, then + and −.\n2x^{2} means 2 × x^{2}: square first, then multiply.\nIf x = 3: 2x^{2} = 2 × 9 = 18 (not 6^{2} = 36).' },
        { title: 'Formulae',
          text: 'A formula links quantities, like v = u + at.\nIf u = 5, a = 2 and t = 3:\nv = 5 + 2 × 3 = 5 + 6 = 11.\nIf you know v, you can substitute and solve to find another letter.' },
        { title: 'Worked example',
          text: 'Find 3x^{2} − 2y when x = −2 and y = 5.\n**1.** x^{2} = (−2)^{2} = 4.\n**2.** 3x^{2} = 3 × 4 = 12.\n**3.** 2y = 2 × 5 = 10.\n**4.** 12 − 10 = **2**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [posLinear, posLinear, formula],
          [negSub, negSub, formula, posLinear],
          [stretch, stretch, stretch, negSub],
        ], ctx);
      },
    });
  }

  /* 13 ── Equations with unknowns on both sides and brackets */
  {
    const side = (k, c) => ex([[k, 'x'], [c, '']]);
    // solve kx + c = jx + d and describe the steps
    const steps = (k, c, j, d) => {
      const out = [];
      let hint;
      let A2 = k, C2 = c, D2 = d, onLeft = true;
      if (j !== 0) {
        if (k > j) {
          hint = `${j > 0 ? `Take ${ex([[j, 'x']])} from` : `Add ${ex([[-j, 'x']])} to`} both sides: ${side(k - j, c)} = ${F(d)}.`;
          A2 = k - j; out.push(`${side(k - j, c)} = ${F(d)}`);
        } else {
          hint = `${k > 0 ? `Take ${ex([[k, 'x']])} from` : `Add ${ex([[-k, 'x']])} to`} both sides: ${F(c)} = ${side(j - k, d)}.`;
          A2 = j - k; C2 = d; D2 = c; onLeft = false; out.push(`${F(c)} = ${side(j - k, d)}`);
        }
      } else {
        hint = `${c > 0 ? `Subtract ${c} from` : `Add ${-c} to`} both sides: ${ex([[k, 'x']])} = ${F(d - c)}.`;
      }
      const rhs = D2 - C2, x = U.clean(rhs / A2);
      if (!(onLeft && A2 === 1)) out.push(onLeft ? `${ex([[A2, 'x']])} = ${F(rhs)}` : `${F(rhs)} = ${ex([[A2, 'x']])}`);
      out.push(`x = ${F(x)}`);
      return { hint, chain: out.join(' → '), x };
    };
    const NUDGE_BOTH = 'Get all the x-terms on one side first: take the smaller x-term from both sides. Then solve as usual.';

    const twoStep = () => {
      const a = R(2, 9), x = R(1, 12), b = nz(-20, 20), d = a * x + b;
      const s = steps(a, b, 0, d);
      return num(`Solve ${side(a, b)} = ${F(d)}`, x,
        ['Undo the operations in reverse order: first the + or −, then the ×.', s.hint + ' Now divide.'],
        `${side(a, b)} = ${F(d)} → ${s.chain}.`,
        { visual: { type: 'balance', left: side(a, b), right: F(d) } });
    };

    const both = L => {
      const r = retry(() => {
        const a = R(2, 9), c = L === 1 ? R(1, a - 1) : R(1, 9), x = L === 1 ? R(1, 10) : nz(-8, 10), b = nz(-15, 15);
        if (a === c) return null;
        const d = a * x + b - c * x;
        if (L === 1 && (b < 0 || d < 0)) return null;
        if (d === 0 || Math.abs(d) > 60) return null;
        return { a, b, c, d, x };
      });
      const s = steps(r.a, r.b, r.c, r.d);
      return num(`Solve ${side(r.a, r.b)} = ${side(r.c, r.d)}`, r.x,
        [NUDGE_BOTH, s.hint + ' Now finish solving.'],
        `${side(r.a, r.b)} = ${side(r.c, r.d)} → ${s.chain}.`,
        { visual: { type: 'balance', left: side(r.a, r.b), right: side(r.c, r.d) } });
    };

    const bracketOne = () => {
      const r = retry(() => {
        const a = R(2, 6), b = nz(-6, 8), x = nz(-6, 10), toX = Math.random() < 0.5, c = toX ? R(1, a - 1 || 1) : 0;
        if (toX && c >= a) return null;
        const d = a * (x + b) - c * x;
        return d !== 0 && Math.abs(d) <= 80 ? { a, b, x, c, d } : null;
      });
      const left = `${r.a}(${side(1, r.b)})`, right = r.c ? side(r.c, r.d) : F(r.d);
      const s = steps(r.a, r.a * r.b, r.c, r.d);
      return num(`Solve ${left} = ${right}`, r.x,
        ['Expand the bracket first. Then solve the equation.', `${left} = ${side(r.a, r.a * r.b)}, so ${side(r.a, r.a * r.b)} = ${right}.`],
        `Expand: ${side(r.a, r.a * r.b)} = ${right} → ${s.chain}.`,
        { visual: { type: 'balance', left, right } });
    };

    const bracketTwo = () => {
      const r = retry(() => {
        const a = R(2, 7), c = R(2, 7), b = nz(-6, 6), x = nz(-6, 9);
        if (a === c) return null;
        const num_ = a * (x + b) - c * x;
        if (num_ % c !== 0) return null;
        const d = num_ / c;
        return d !== 0 && Math.abs(d) <= 12 ? { a, b, c, d, x } : null;
      });
      const left = `${r.a}(${side(1, r.b)})`, right = `${r.c}(${side(1, r.d)})`;
      const s = steps(r.a, r.a * r.b, r.c, r.c * r.d);
      return num(`Solve ${left} = ${right}`, r.x,
        ['Expand both brackets, then get the x-terms on one side.', `Expanding gives ${side(r.a, r.a * r.b)} = ${side(r.c, r.c * r.d)}.`],
        `${side(r.a, r.a * r.b)} = ${side(r.c, r.c * r.d)} → ${s.chain}.`,
        { visual: { type: 'balance', left, right } });
    };

    const halfAnswer = () => {
      const r = retry(() => {
        const c = R(1, 6), a = c + 2, x = nz(-5, 6) + 0.5, b = nz(-12, 12), d = a * x + b - c * x;
        return Number.isInteger(d) && d !== 0 ? { a, b, c, d, x } : null;
      });
      const s = steps(r.a, r.b, r.c, r.d);
      return num(`Solve ${side(r.a, r.b)} = ${side(r.c, r.d)}\nGive your answer as a decimal.`, r.x,
        [NUDGE_BOTH + ' The answer does not have to be a whole number.', s.hint],
        `${side(r.a, r.b)} = ${side(r.c, r.d)} → ${s.chain}.`,
        { visual: { type: 'balance', left: side(r.a, r.b), right: side(r.c, r.d) } });
    };

    const negCoef = () => {
      const r = retry(() => {
        const k = -R(1, 4), j = R(1, 5), x = R(1, 9), d = nz(-8, 10), c = (j - k) * x + d;
        return c > 0 && c <= 50 ? { k, j, x, d, c } : null;
      });
      const left = ex([[r.c, ''], [r.k, 'x']]);
      const s = steps(r.k, r.c, r.j, r.d);
      return num(`Solve ${left} = ${side(r.j, r.d)}`, r.x,
        [`The left side has ${ex([[r.k, 'x']])}. Add ${ex([[-r.k, 'x']])} to both sides so all the x-terms are positive and on one side.`, s.hint + ' Now finish solving.'],
        `${left} = ${side(r.j, r.d)} → ${s.chain}.`,
        { visual: { type: 'balance', left, right: side(r.j, r.d) } });
    };

    const story = () => {
      const t = R(1, 3);
      if (t === 1) {
        const r = retry(() => {
          const a = R(2, 6), c = R(2, 7), x = R(2, 15), b = R(1, 12);
          if (a === c) return null;
          const d = a * x + b - c * x;
          return d !== 0 && Math.abs(d) <= 40 ? { a, b, c, d, x } : null;
        });
        const part2 = r.d > 0 ? `multiply it by ${r.c} and add ${r.d}` : `multiply it by ${r.c} and subtract ${-r.d}`;
        const s = steps(r.a, r.b, r.c, r.d);
        return num(`I think of a number. If I multiply it by ${r.a} and add ${r.b}, I get the same answer as when I ${part2}.\nWhat is my number?`, r.x,
          ['Call the number x and write an equation with x on both sides.', `${side(r.a, r.b)} = ${side(r.c, r.d)}. ${s.hint}`],
          `${side(r.a, r.b)} = ${side(r.c, r.d)} → ${s.chain}.`);
      }
      if (t === 2) {
        const r = retry(() => {
          const p = R(1, 3), q = R(2, 4), s1 = R(-30, 30), x = R(10, 40);
          const s2 = 180 - (1 + p + q) * x - s1;
          const angs = [x, p * x + s1, q * x + s2];
          return angs.every(v => v >= 15 && v <= 150) && s1 !== 0 && s2 !== 0 && p !== q ? { p, q, s1, s2, x, angs } : null;
        });
        const e2 = ex([[r.p, 'x'], [r.s1, '']]), e3 = ex([[r.q, 'x'], [r.s2, '']]);
        const k = 1 + r.p + r.q, c = r.s1 + r.s2;
        return num(`The angles of a triangle are x°, (${e2})° and (${e3})°.\nFind x.`, r.x,
          ['The angles in a triangle add up to 180°. Write an equation and solve it.', `x + ${e2} + ${e3} = 180, so ${side(k, c)} = 180.`],
          `${side(k, c)} = 180 → ${ex([[k, 'x']])} = ${180 - c} → x = ${r.x}.`,
          { visual: { type: 'angle', mode: 'triangle', parts: r.angs, labels: ['x', e2, e3] } });
      }
      const r = retry(() => {
        const a = R(3, 8), c = R(1, a - 1), x = R(1, 9), b = R(1, 12), d = a * x + b - c * x;
        return d > 0 && d !== b ? { a, b, c, d, x } : null;
      });
      const who = U.name();
      return num(`${who} solves ${side(r.a, r.b)} = ${side(r.c, r.d)}.\n${who}'s first step is ${side(r.a + r.c, r.b)} = ${r.d}. That is wrong.\nWhat is the correct value of x?`, r.x,
        [`To remove ${ex([[r.c, 'x']])} from the right, you must **subtract** ${ex([[r.c, 'x']])} from both sides, not add it.`,
          `${side(r.a, r.b)} − ${ex([[r.c, 'x']])} = ${side(r.c, r.d)} − ${ex([[r.c, 'x']])} gives ${side(r.a - r.c, r.b)} = ${r.d}.`],
        `${side(r.a - r.c, r.b)} = ${r.d} → ${r.a - r.c === 1 ? '' : `${ex([[r.a - r.c, 'x']])} = ${r.d - r.b} → `}x = ${r.x}.`);
    };

    PMLM.registerSkill({
      id: 'g8.equations', grade: 8, unit: 'g8.u4', title: 'Solving equations', icon: '⚖️',
      blurb: 'Unknowns on both sides, and equations with brackets',
      lesson: [
        { title: 'Keep it balanced',
          text: 'An equation is like a balance. Whatever you do to one side, do to the other.\n2x + 3 = 11\nTake 3 from both sides: 2x = 8\nDivide both sides by 2: x = 4',
          visual: { type: 'balance', left: '2x + 3', right: '11' } },
        { title: 'Unknowns on both sides',
          text: 'Get the x-terms on one side first. Take the **smaller** x-term from both sides.\n5x + 2 = 3x + 10\nTake 3x: 2x + 2 = 10\nTake 2: 2x = 8, so x = 4.',
          visual: { type: 'balance', left: '5x + 2', right: '3x + 10' } },
        { title: 'Brackets',
          text: 'Expand the brackets first, then solve.\n3(x − 2) = 2x + 5\n3x − 6 = 2x + 5\nTake 2x: x − 6 = 5, so x = 11.' },
        { title: 'Check your answer',
          text: 'Put your answer back into the equation. Both sides should match.\nx = 11: 3(11 − 2) = 27 and 2 × 11 + 5 = 27 ✓\nAnswers can be negative or decimals, like x = −3 or x = 2.5.' },
        { title: 'Worked example',
          text: 'Solve 4(x + 1) = x + 19.\n**1.** Expand: 4x + 4 = x + 19.\n**2.** Take x from both sides: 3x + 4 = 19.\n**3.** Take 4: 3x = 15.\n**4.** Divide by 3: **x = 5**.\nCheck: 4 × 6 = 24 and 5 + 19 = 24 ✓' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [twoStep, twoStep, both, both],
          [both, both, bracketOne, bracketOne, negCoef],
          [bracketTwo, halfAnswer, story, story, bracketOne, negCoef],
        ], ctx);
      },
    });
  }

  /* 14 ── Inequalities */
  {
    const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
    const STRICT = { '<': '≤', '≤': '<', '>': '≥', '≥': '>' };
    const WORDS = { '<': 'less than', '>': 'greater than', '≤': 'less than or equal to', '≥': 'greater than or equal to' };
    const KEY = '(○ means the number is not included, ● means it is included.)';
    const open = s => s === '<' || s === '>';
    const lineFor = (sym, a) => {
      const right = sym === '>' || sym === '≥';
      return { type: 'numberLine', min: a - 5, max: a + 5, step: 1, points: [{ at: a, label: open(sym) ? '○' : '●' }], jumps: [{ from: a, to: right ? a + 5 : a - 5 }] };
    };
    const NUDGE_SOLVE = 'Solve it just like an equation: do the same to both sides. Keep the inequality sign the same way round.';

    const readLine = () => {
      const a = R(-4, 4), sym = pick(['<', '>', '≤', '≥']);
      const right = sym === '>' || sym === '≥';
      return choice(`Which inequality is shown on the number line?\n${KEY}`, `x ${sym} ${F(a)}`, ['<', '>', '≤', '≥'].map(s => `x ${s} ${F(a)}`),
        ['○ (open circle) means < or >. ● (filled circle) means ≤ or ≥.', `The line goes to the ${right ? 'right, so x is bigger' : 'left, so x is smaller'} than ${F(a)}. Now look at the circle.`],
        `The circle is ${open(sym) ? 'open' : 'filled'} and the line goes ${right ? 'right' : 'left'}, so it shows x ${sym} ${F(a)}.`,
        { visual: lineFor(sym, a) });
    };

    const words = () => {
      const a = R(-6, 9), sym = pick(['<', '>', '≤', '≥']);
      return choice(`Write "x is ${WORDS[sym]} ${F(a)}" using symbols.`, `x ${sym} ${F(a)}`, ['<', '>', '≤', '≥'].map(s => `x ${s} ${F(a)}`),
        ['< means less than, > means greater than. A line under the sign (≤ or ≥) means "or equal to".', `"${WORDS[sym].includes('less') ? 'Less than' : 'Greater than'}" points the sign ${WORDS[sym].includes('less') ? '<' : '>'}. Does it also say "or equal to"?`],
        `"${WORDS[sym]}" is ${sym}, so x ${sym} ${F(a)}.`);
    };

    const whichSolution = () => {
      const a = R(-5, 8), sym = pick(['<', '>', '≤', '≥']);
      let right, wrongs;
      if (sym === '≥') { right = a; wrongs = [a - 1, a - 2, a - 3]; }
      else if (sym === '>') { right = a + 1; wrongs = [a, a - 1, a - 2]; }
      else if (sym === '<') { right = a - 1; wrongs = [a, a + 1, a + 2]; }
      else { right = a; wrongs = [a + 1, a + 2, a + 3]; }
      return choice(`Which number is a solution of x ${sym} ${F(a)}?`, F(right), wrongs.map(v => F(v)),
        [`x ${sym} ${F(a)} means x is ${WORDS[sym]} ${F(a)}.`, `Check ${F(a)} first: is ${F(a)} ${WORDS[sym]} ${F(a)}?`],
        `${F(right)} is ${WORDS[sym]} ${F(a)}, so it is a solution. The others are not.`);
    };

    const ineqSolve = (a, b, c, sym, form) => {
      // a*x + b sym c  ->  x sym k
      const k = (c - b) / a;
      const wrongs = [`x ${FLIP[sym]} ${F(k)}`, `x ${STRICT[sym]} ${F(k)}`];
      const alt = (c + b) / a;
      if (Number.isInteger(alt) && alt !== k) wrongs.push(`x ${sym} ${F(alt)}`);
      if (c - b !== k) wrongs.push(`x ${sym} ${F(c - b)}`);
      return { k, wrongs };
    };

    const solveSimple = () => {
      const a = R(2, 6), k = nz(-5, 8), b = nz(-10, 10), sym = pick(['<', '>', '≤', '≥']), c = a * k + b;
      const s = ineqSolve(a, b, c, sym);
      return choice(`Solve ${ex([[a, 'x'], [b, '']])} ${sym} ${F(c)}`, `x ${sym} ${F(k)}`, s.wrongs,
        [NUDGE_SOLVE, `${b > 0 ? `Subtract ${b} from` : `Add ${-b} to`} both sides: ${a}x ${sym} ${F(c - b)}.`],
        `${a}x ${sym} ${F(c - b)}, then divide by ${a}: x ${sym} ${F(k)}.`);
    };

    const countInts = () => {
      const lo = R(-6, 2), hi = lo + R(3, 7), sl = pick(['<', '≤']), sh = pick(['<', '≤']);
      const first = sl === '<' ? lo + 1 : lo, last = sh === '<' ? hi - 1 : hi, n = last - first + 1;
      return num(`How many integers (whole numbers) satisfy ${F(lo)} ${sl} x ${sh} ${F(hi)}?`, n,
        ['List the integers between the two ends. Check carefully whether each end is included: < does not include it, ≤ does.',
          `The smallest integer that works is ${F(first)}. Count up to the largest one that works.`],
        `The integers are ${U.range(first, last).map(v => F(v)).join(', ')}. That is ${n} integers.`);
    };

    const largestInt = () => {
      const a = R(2, 6), b = nz(-9, 12), sym = pick(['<', '≤']);
      const c = a * R(-3, 8) + b + R(0, a - 1);
      const k = (c - b) / a;
      let ans = Math.floor(k);
      if (sym === '<' && Number.isInteger(k)) ans = k - 1;
      return num(`What is the largest integer that satisfies ${ex([[a, 'x'], [b, '']])} ${sym} ${F(c)}?`, ans,
        [NUDGE_SOLVE + ' Then find the biggest whole number that fits.', `${b > 0 ? `Subtract ${b}` : `Add ${-b}`}: ${a}x ${sym} ${F(c - b)}, so x ${sym} ${F(c - b)} ÷ ${a}.`],
        `x ${sym} ${Number.isInteger(k) ? F(k) : `${F(c - b)} ÷ ${a} ≈ ${F(U.round(k, 2))}`}, so the largest integer is ${F(ans)}.`);
    };

    const bothSides = () => {
      const r = retry(() => {
        const a = R(3, 8), c = R(1, a - 1), k = nz(-4, 8), b = nz(-12, 12), d = (a - c) * k + b;
        return d !== b ? { a, b, c, d, k } : null;
      });
      const sym = pick(['<', '>', '≤', '≥']);
      const s = ineqSolve(r.a - r.c, r.b, r.d, sym);
      return choice(`Solve ${ex([[r.a, 'x'], [r.b, '']])} ${sym} ${ex([[r.c, 'x'], [r.d, '']])}`, `x ${sym} ${F(r.k)}`, s.wrongs,
        [NUDGE_SOLVE + ' Get the x-terms on one side first.', `Take ${ex([[r.c, 'x']])} from both sides: ${ex([[r.a - r.c, 'x'], [r.b, '']])} ${sym} ${F(r.d)}.`],
        `${ex([[r.a - r.c, 'x'], [r.b, '']])} ${sym} ${F(r.d)} → ${ex([[r.a - r.c, 'x']])} ${sym} ${F(r.d - r.b)} → x ${sym} ${F(r.k)}.`);
    };

    const bracketIneq = () => {
      const a = R(2, 5), b = nz(-6, 6), k = nz(-4, 8), sym = pick(['<', '>', '≤', '≥']), c = a * (k + b);
      const s = ineqSolve(a, a * b, c, sym);
      return choice(`Solve ${a}(${ex([[1, 'x'], [b, '']])}) ${sym} ${F(c)}`, `x ${sym} ${F(k)}`, s.wrongs.concat([`x ${sym} ${F(c / a + b)}`]),
        ['Expand the bracket (or divide both sides by the number outside), then solve.', `Divide both sides by ${a}: ${ex([[1, 'x'], [b, '']])} ${sym} ${F(c / a)}.`],
        `${ex([[1, 'x'], [b, '']])} ${sym} ${F(c / a)}, so x ${sym} ${F(k)}.`);
    };

    const doubleLine = () => {
      const lo = R(-5, 1), hi = lo + R(2, 6), sl = pick(['<', '≤']), sh = pick(['<', '≤']);
      const all = [['<', '<'], ['<', '≤'], ['≤', '<'], ['≤', '≤']].map(([p, q]) => `${F(lo)} ${p} x ${q} ${F(hi)}`);
      return choice(`Which inequality is shown on the number line?\n${KEY}`, `${F(lo)} ${sl} x ${sh} ${F(hi)}`, all,
        ['x is between the two circles. Use < for an open circle ○ and ≤ for a filled circle ●.', `At ${F(lo)} the circle is ${sl === '<' ? 'open' : 'filled'}, so the left sign is ${sl}. Now look at ${F(hi)}.`],
        `${F(lo)} is ${sl === '<' ? 'not included' : 'included'} and ${F(hi)} is ${sh === '<' ? 'not included' : 'included'}: ${F(lo)} ${sl} x ${sh} ${F(hi)}.`,
        { visual: { type: 'numberLine', min: lo - 2, max: hi + 2, step: 1, points: [{ at: lo, label: sl === '<' ? '○' : '●' }, { at: hi, label: sh === '<' ? '○' : '●' }], jumps: [{ from: lo, to: hi }] } });
    };

    const listInts = () => {
      const lo = R(-4, 2), hi = lo + R(3, 5), sl = pick(['<', '≤']), sh = pick(['<', '≤']);
      const first = sl === '<' ? lo + 1 : lo, last = sh === '<' ? hi - 1 : hi;
      const list = (p, q) => U.range(p, q).map(v => F(v)).join(', ');
      return choice(`Which list shows all the integers that satisfy ${F(lo)} ${sl} x ${sh} ${F(hi)}?`, list(first, last),
        [list(lo, hi), list(lo + 1, hi - 1), list(first === lo ? lo + 1 : lo, last), list(first, last === hi ? hi - 1 : hi)],
        ['< does not include the end number. ≤ does include it.', `Is ${F(lo)} included? The sign next to it is ${sl}.`],
        `Start at ${F(first)} and stop at ${F(last)}: ${list(first, last)}.`);
    };

    const smallestInt = () => {
      const a = R(2, 6), b = nz(-9, 9), c = a * R(-2, 8) + b + R(0, a - 1), sym = pick(['>', '≥']);
      const k = (c - b) / a;
      let ans = Math.ceil(k);
      if (sym === '>' && Number.isInteger(k)) ans = k + 1;
      return num(`What is the smallest integer n that satisfies ${ex([[a, 'n'], [b, '']])} ${sym} ${F(c)}?`, ans,
        [NUDGE_SOLVE + ' Then find the smallest whole number that fits.', `${b > 0 ? `Subtract ${b}` : `Add ${-b}`}: ${a}n ${sym} ${F(c - b)}, so n ${sym} ${F(c - b)} ÷ ${a}.`],
        `n ${sym} ${Number.isInteger(k) ? F(k) : `${F(c - b)} ÷ ${a} ≈ ${F(U.round(k, 2))}`}, so the smallest integer is ${F(ans)}.`);
    };

    PMLM.registerSkill({
      id: 'g8.inequalities', grade: 8, unit: 'g8.u4', title: 'Inequalities', icon: '↔️',
      blurb: 'Solve inequalities and show them on a number line',
      lesson: [
        { title: 'The four signs',
          text: '< means less than\n> means greater than\n≤ means less than or equal to\n≥ means greater than or equal to\nx > 2 means x can be any number bigger than 2, like 2.5, 3 or 100.' },
        { title: 'On a number line',
          text: '**Open circle ○** → the number is **not** included (< or >).\n**Filled circle ●** → the number **is** included (≤ or ≥).\nThis line shows x > 2: an open circle at 2 and a line going right.',
          visual: { type: 'numberLine', min: -3, max: 7, step: 1, points: [{ at: 2, label: '○' }], jumps: [{ from: 2, to: 7 }] } },
        { title: 'Solving',
          text: 'Solve an inequality like an equation: do the same to both sides.\n3x + 2 < 14\nTake 2: 3x < 12\nDivide by 3: x < 4' },
        { title: 'Integer solutions',
          text: 'Integers are whole numbers (…, −2, −1, 0, 1, 2, …).\nIntegers with −2 < x ≤ 3: −1, 0, 1, 2, 3.\n−2 is **not** included (<), but 3 **is** (≤).',
          visual: { type: 'numberLine', min: -4, max: 5, step: 1, points: [{ at: -2, label: '○' }, { at: 3, label: '●' }], jumps: [{ from: -2, to: 3 }] } },
        { title: 'Worked example',
          text: 'Solve 5x − 3 ≥ 2x + 9.\n**1.** Take 2x from both sides: 3x − 3 ≥ 9.\n**2.** Add 3: 3x ≥ 12.\n**3.** Divide by 3: **x ≥ 4**.\n**4.** Number line: filled circle at 4, line going right.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [readLine, readLine, words, whichSolution],
          [solveSimple, solveSimple, countInts, largestInt, readLine],
          [bothSides, doubleLine, bracketIneq, listInts, smallestInt, countInts],
        ], ctx);
      },
    });
  }

  /* 15 ── nth term of a linear sequence */
  {
    const rule = (d, c) => (d > 0 ? ex([[d, 'n'], [c, '']]) : ex([[c, ''], [d, 'n']]));
    const termsOf = (d, c, k = 4) => U.range(1, k).map(n => d * n + c);
    const seqVis = ts => ({ type: 'sequence', terms: ts.map(v => F(v)).concat(['…']) });

    const findTerm = L => {
      const d = R(2, 9), c = nz(-6, 10), k = L === 1 ? R(5, 20) : R(20, 100);
      const r = rule(d, c), v = d * k + c;
      return num(`The nth term of a sequence is ${r}.\nWhat is the ${U.ord(k)} term?`, v,
        [`Replace n with ${k}.`, `${d} × ${k} = ${d * k}. Now ${c >= 0 ? `add ${c}` : `subtract ${-c}`}.`],
        `${d} × ${k}${c ? ` ${c > 0 ? '+' : M} ${Math.abs(c)}` : ''} = ${F(v)}.`);
    };

    const firstThree = () => {
      const d = R(2, 7), c = retry(() => { const v = nz(-5, 6); return v !== d ? v : null; });
      const list = ts => ts.map(v => F(v)).join(', ');
      return choice(`Which are the first three terms of the sequence with nth term ${rule(d, c)}?`, list(termsOf(d, c, 3)),
        [list([d, 2 * d, 3 * d]), list([c, d + c, 2 * d + c]), list([d, d + c, d + 2 * c])],
        ['Substitute n = 1, then n = 2, then n = 3.', `n = 1: ${d} × 1${c > 0 ? ` + ${c}` : ` ${M} ${-c}`} = ${F(d + c)}. Now try n = 2 and n = 3.`],
        `n = 1, 2, 3 give ${list(termsOf(d, c, 3))}.`);
    };

    const differenceQ = () => {
      const d = nz(-6, 9), c = R(-5, 15), ts = termsOf(d, c, 4);
      if (d < 0 && c + d < 0) return differenceQ();
      return num(`What is the nth term coefficient (the number in front of n) for the sequence ${ts.map(v => F(v)).join(', ')}, …?`, d,
        ['The number in front of n is the difference between consecutive terms.', `Take each term away from the next one, starting with ${F(ts[1])} − ${P(ts[0])}. Check you get the same each time.`],
        `The terms go ${d > 0 ? 'up' : 'down'} by ${Math.abs(d)} each time, so the coefficient of n is ${F(d)}.`,
        { visual: seqVis(ts) });
    };

    const findRule = (L, ctx, spotIt) => {
      const r = retry(() => {
        const d = L === 2 ? R(2, 9) : nz(-6, 9), c = R(-8, 10);
        if (d === c || d + c === 0 || c === 0) return null;
        if (d < 0 && d * 4 + c < -10) return null;
        return { d, c };
      });
      const ts = termsOf(r.d, r.c), first = ts[0];
      const w = [rule(1, r.d).replace(/^n/, 'n'), rule(r.d, first), first !== 0 && first !== r.d ? rule(first, r.d) : rule(r.d, -r.c)];
      w.push(rule(r.d, -r.c));
      if (r.d < 0) w.push(rule(-r.d, r.c));
      const nudge = 'The number in front of n is the difference between terms. Then compare with the times table to find what to add or subtract.';
      const h2 = `The difference is ${F(r.d)}, so start with ${ex([[r.d, 'n']])}: ${termsOf(r.d, 0).map(v => F(v)).join(', ')}. How do the real terms compare?`;
      const ex_ = `Difference ${F(r.d)} → ${ex([[r.d, 'n']])}. Each term is ${r.c > 0 ? `${r.c} more` : `${-r.c} less`} than ${ex([[r.d, 'n']])}, so the nth term is ${rule(r.d, r.c)}.`;
      if (spotIt) {
        const who = U.name(), wrongRule = rule(first, r.d);
        if (first <= 0 || first === r.d) return findRule(L, null, false);
        return choice(`${who} says the nth term of ${ts.map(v => F(v)).join(', ')}, … is ${wrongRule}.\nWhat is the correct nth term?`, rule(r.d, r.c), w.filter(x => x !== wrongRule).concat([rule(r.d, first)]),
          [`${who} used the first term as the number in front of n. The number in front of n should be the difference.`, h2], ex_);
      }
      return choice(`Find the nth term of the sequence ${ts.map(v => F(v)).join(', ')}, …`, rule(r.d, r.c), w, [nudge, h2], ex_, { visual: seqVis(ts) });
    };

    const whichTerm = () => {
      const d = R(2, 9), c = nz(-6, 10), k = R(8, 40), X = d * k + c;
      return num(`The nth term of a sequence is ${rule(d, c)}.\nWhich term is equal to ${X}? (Find n.)`, k,
        [`Make ${rule(d, c)} equal to ${X} and solve for n.`, `${rule(d, c)} = ${X}, so ${d}n = ${X - c}. Now divide.`],
        `${d}n = ${X - c}, so n = ${X - c} ÷ ${d} = ${k}. It is the ${U.ord(k)} term.`);
    };

    const isIn = () => {
      const d = R(3, 9), c = nz(-6, 10), k = R(10, 40), inside = Math.random() < 0.5;
      const X = d * k + c + (inside ? 0 : R(1, d - 1));
      const n = (X - c) / d, NO = `No, ${X} is not in the sequence`;
      const yes = j => `Yes, it is the ${U.ord(j)} term`;
      const right = inside ? yes(k) : NO;
      const w = inside ? [NO, yes(k + 1), yes(Math.round(X / d)), yes(k - 1)] : [yes(Math.floor(n)), yes(Math.ceil(n)), yes(Math.round(X / d))];
      return choice(`The nth term of a sequence is ${rule(d, c)}.\nIs ${X} a term in this sequence?`, right, w,
        [`Make ${rule(d, c)} equal to ${X} and solve for n. If n is a whole number, ${X} is in the sequence.`,
          `${rule(d, c)} = ${X}, so ${d}n = ${X - c}. Is ${X - c} ÷ ${d} a whole number?`],
        inside ? `${X - c} ÷ ${d} = ${k}, a whole number. So ${X} is the ${U.ord(k)} term.` : `${X - c} ÷ ${d} ${Number.isInteger(U.clean(n * 100)) ? `= ${F(n)}` : `≈ ${F(U.round(n, 2))}`}, not a whole number. So ${X} is not in the sequence.`);
    };

    const sticks = () => {
      const d = R(2, 6), c = R(1, 4), k = R(10, 30), ts = termsOf(d, c, 3), shape = pick(['matchsticks', 'tiles', 'dots']);
      return num(`Pattern 1 has ${ts[0]} ${shape}, pattern 2 has ${ts[1]} and pattern 3 has ${ts[2]}.\nHow many ${shape} are in pattern ${k}?`, d * k + c,
        ['Find the nth term first: the difference is the number in front of n.', `The difference is ${d}, and ${d}n gives ${termsOf(d, 0, 3).join(', ')}, so the nth term is ${rule(d, c)}. Now put n = ${k}.`],
        `nth term = ${rule(d, c)}. Pattern ${k}: ${d} × ${k} + ${c} = ${d * k + c}.`, { unit: shape, visual: seqVis(ts) });
    };

    const ruleThenTerm = () => {
      const d = nz(-5, 8), c = R(-5, 12), k = pick([20, 30, 50, 100]);
      if (d < 0 && c < 8) return ruleThenTerm();
      const ts = termsOf(d, c);
      return num(`Find the ${U.ord(k)} term of the sequence ${ts.map(v => F(v)).join(', ')}, …`, d * k + c,
        ['Find the nth term first, then substitute.', `The difference is ${F(d)}, so the nth term is ${rule(d, c)}. Now put n = ${k}.`],
        `nth term = ${rule(d, c)}, so the ${U.ord(k)} term is ${F(d)} × ${k}${c ? ` ${c > 0 ? '+' : M} ${Math.abs(c)}` : ''} = ${F(d * k + c)}.`,
        { visual: seqVis(ts) });
    };

    PMLM.registerSkill({
      id: 'g8.nthTerm', grade: 8, unit: 'g8.u4', title: 'The nth term', icon: '🪜',
      blurb: 'Find and use the nth term of a linear sequence',
      lesson: [
        { title: 'Linear sequences',
          text: 'In a linear sequence the terms go up (or down) by the **same amount** each time.\n5, 8, 11, 14, … goes up by 3.\nThe **nth term** is a rule that gives any term from its position n.',
          visual: { type: 'sequence', terms: ['5', '8', '11', '14', '…'], step: '+3' } },
        { title: 'Finding the nth term',
          text: 'The difference is 3, so start with **3n** (the 3 times table).\n3n gives 3, 6, 9, 12. The real terms are 2 more.\nSo the nth term is **3n + 2**.',
          visual: { type: 'table', headers: ['n', '1', '2', '3', '4'], rows: [['3n', '3', '6', '9', '12'], ['term', '5', '8', '11', '14']] } },
        { title: 'Using the nth term',
          text: '10th term of 3n + 2: 3 × 10 + 2 = 32.\n**Careful:** the number in front of n is the **difference**, not the first term. 5, 8, 11 is not 5n + 3.\nGoing down by 4? The rule has −4n, like 20 − 4n.' },
        { title: 'Is a number in the sequence?',
          text: 'Set the nth term equal to the number and solve.\nIs 50 in 3n + 2? 3n + 2 = 50 → 3n = 48 → n = 16. A whole number, so **yes**.\nIs 60 in it? 3n = 58 → n = 19.33… Not whole, so **no**.' },
        { title: 'Worked example',
          text: 'Find the nth term of 7, 11, 15, 19, …\n**1.** The difference is 4, so start with 4n.\n**2.** 4n gives 4, 8, 12, 16.\n**3.** Each term is 3 more than 4n.\nAnswer: **4n + 3**',
          visual: { type: 'sequence', terms: ['7', '11', '15', '19', '…'], step: '+4' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [findTerm, findTerm, firstThree, differenceQ],
          [findRule, findRule, whichTerm, sticks, findTerm],
          [isIn, isIn, findRule, (l) => findRule(3, null, true), ruleThenTerm, whichTerm],
        ], ctx);
      },
    });
  }

  /* 16 ── Straight-line graphs y = mx + c */
  {
    const eq = (m, c) => `y = ${ex([[m, 'x'], [c, '']])}`;
    const pt = (x, y) => `(${F(x)}, ${F(y)})`;
    const G = extra => Object.assign({ type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5 }, extra);
    const inRange = y => y >= -5 && y <= 5;

    const gradEq = () => {
      const m = nz(-6, 6), c = R(-9, 9);
      if (Math.random() < 0.3 && m < 0 && c > 0) {
        const s = `y = ${ex([[c, ''], [m, 'x']])}`;
        return num(`What is the gradient of the line ${s}?`, m,
          ['In y = mx + c, the gradient is the number multiplying x (with its sign).', `Rewrite it as y = ${ex([[m, 'x'], [c, '']])}. Which number multiplies x?`],
          `${s} is the same as ${eq(m, c)}, so the gradient is ${F(m)}.`);
      }
      return num(`What is the gradient of the line ${eq(m, c)}?`, m,
        ['In y = mx + c, m is the gradient: the number multiplying x.', `Compare ${eq(m, c)} with y = mx + c. What is m?`],
        `The number multiplying x is ${F(m)}, so the gradient is ${F(m)}.`);
    };

    const interceptEq = L => {
      const m = nz(-5, 5), c = nz(-9, 9);
      if (L >= 2) {
        return { q: `Where does the line ${eq(m, c)} cross the y-axis?\nGive the coordinates.`, kind: 'coord', answer: [0, c],
          hints: ['On the y-axis, x = 0. Or use c in y = mx + c.', `Put x = 0 into ${eq(m, c)}. What is ${F(m)} × 0?`],
          explain: `When x = 0, y = ${F(c)}, so it crosses at (0, ${F(c)}).` };
      }
      return num(`What is the y-intercept of the line ${eq(m, c)}? (Where does it cross the y-axis?)`, c,
        ['In y = mx + c, c is the y-intercept: where the line crosses the y-axis.', `Put x = 0 into ${eq(m, c)}.`],
        `When x = 0, y = ${F(c)}. The y-intercept is ${F(c)}.`);
    };

    const yFromX = () => {
      const m = nz(-5, 6), c = nz(-8, 8), x = nz(-4, 6);
      return num(`The line ${eq(m, c)} passes through the point (${F(x)}, □).\nWhat is the missing y-coordinate?`, m * x + c,
        ['Substitute the x-value into the equation.', `y = ${F(m)} × ${P(x)} ${c > 0 ? '+' : M} ${Math.abs(c)}. First, ${F(m)} × ${P(x)} = ${F(m * x)}.`],
        `y = ${F(m * x)}${c ? ` ${c > 0 ? '+' : M} ${Math.abs(c)}` : ''} = ${F(m * x + c)}.`);
    };

    const lineData = () => retry(() => {
      const m = pick([-3, -2, -1, 1, 2, 3]), c = R(-3, 3);
      const xs = [-3, -2, -1, 1, 2, 3].filter(x => inRange(m * x + c));
      const far = xs.filter(x => Math.abs(x) >= 2);
      return xs.length ? { m, c, x1: pick(far.length ? far : xs) } : null;
    });

    const readGradient = () => {
      const d = lineData();
      const a = Math.min(0, d.x1), b = Math.max(0, d.x1);
      return num('What is the gradient of the line on the grid?', d.m,
        ['Gradient = change in y ÷ change in x, going from left to right. Downhill lines have a negative gradient.',
          `Use the two marked points. From x = ${F(a)} to x = ${F(b)}, the change in x is ${b - a}. Now find the change in y.`],
        `From ${pt(a, d.m * a + d.c)} to ${pt(b, d.m * b + d.c)}: y changes by ${F(d.m * (b - a))} while x changes by ${b - a}, so the gradient is ${F(d.m)}.`,
        { visual: G({ lines: [{ m: d.m, c: d.c }], points: [{ x: 0, y: d.c }, { x: d.x1, y: d.m * d.x1 + d.c }] }) });
    };

    const eqFromGraph = () => {
      const d = lineData();
      const w = [eq(-d.m, d.c), eq(d.m, -d.c)];
      if (d.c !== 0 && d.c !== d.m) w.push(eq(d.c, d.m));
      w.push(eq(d.m, d.c + 1));
      return choice('Which is the equation of the line on the grid?', eq(d.m, d.c), w,
        ['Find c: where the line crosses the y-axis. Find m: the gradient (up is +, down is −).', `The line crosses the y-axis at (0, ${F(d.c)}), so c = ${F(d.c)}. Now find the gradient.`],
        `c = ${F(d.c)} and the gradient is ${F(d.m)}, so the equation is ${eq(d.m, d.c)}.`,
        { visual: G({ lines: [{ m: d.m, c: d.c }] }) });
    };

    const pointOn = () => {
      const m = nz(-4, 4), c = R(-6, 6), x = nz(-3, 4), y = m * x + c;
      const cands = [[x, y + 1], [y, x], [x, m * x - c], [x + 1, y], [-x, y]];
      const w = cands.filter(([a, b]) => b !== m * a + c).map(([a, b]) => pt(a, b));
      return choice(`Which point lies on the line ${eq(m, c)}?`, pt(x, y), w,
        ['Substitute the x-coordinate of each point. If you get its y-coordinate, the point is on the line.', `For x = ${F(x)}: y = ${F(m)} × ${P(x)}${c ? ` ${c > 0 ? '+' : M} ${Math.abs(c)}` : ''}. Work it out and compare.`],
        `When x = ${F(x)}, y = ${F(y)}, so ${pt(x, y)} is on the line.`);
    };

    const gradTwoPoints = () => {
      const r = retry(() => {
        const m = pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]);
        const dx = Math.abs(m) === 0.5 ? pick([2, 4, 6]) : R(2, 5);
        const x1 = R(-4, 4), y1 = R(-6, 6), x2 = x1 + dx, y2 = y1 + m * dx;
        return Number.isInteger(y2) ? { m, x1, y1, x2, y2, dx, dy: m * dx } : null;
      });
      return num(`A line passes through ${pt(r.x1, r.y1)} and ${pt(r.x2, r.y2)}.\nWhat is its gradient? (Give a decimal if needed.)`, r.m,
        ['Gradient = change in y ÷ change in x.', `Change in y = ${F(r.y2)} − ${P(r.y1)} = ${F(r.dy)}. Change in x = ${F(r.x2)} − ${P(r.x1)} = ${r.dx}. Now divide.`],
        `${F(r.dy)} ÷ ${r.dx} = ${F(r.m)}.`);
    };

    const eqTwoPoints = () => {
      const r = retry(() => {
        const m = nz(-4, 4), c = R(-6, 6), x1 = R(1, 3), x2 = x1 + R(1, 3);
        return { m, c, x1, x2, y1: m * x1 + c, y2: m * x2 + c };
      });
      const w = [eq(r.m, r.y1), eq(-r.m, r.c), eq(r.m, -r.c)];
      w.push(eq(r.m, r.y1 + r.m * r.x1));
      return choice(`Which line passes through ${pt(r.x1, r.y1)} and ${pt(r.x2, r.y2)}?`, eq(r.m, r.c), w,
        ['First find the gradient: change in y ÷ change in x. Then use one point to find c.',
          `Gradient = (${F(r.y2)} − ${P(r.y1)}) ÷ (${r.x2} − ${r.x1}) = ${F(r.m)}. Now put ${pt(r.x1, r.y1)} into y = ${ex([[r.m, 'x']])} + c.`],
        `m = ${F(r.m)}. ${F(r.y1)} = ${F(r.m * r.x1)} + c, so c = ${F(r.c)}. The line is ${eq(r.m, r.c)}.`);
    };

    const parallel = () => {
      const m = nz(-5, 5), c = R(-6, 6), k = retry(() => { const v = R(-8, 8); return v !== c ? v : null; });
      const w = [eq(-m, c), eq(c === 0 || c === m ? m + 1 : c, m), eq(m + 1, k)];
      if (Math.abs(m) > 1) w.push(`y = {1/${Math.abs(m)}}x${c ? ` ${c > 0 ? '+' : M} ${Math.abs(c)}` : ''}`);
      return choice(`Which line is parallel to ${eq(m, c)}?`, eq(m, k), w,
        ['Parallel lines have the same gradient. Only the y-intercept is different.', `The gradient of ${eq(m, c)} is ${F(m)}. Look for another line with gradient ${F(m)}.`],
        `${eq(m, k)} also has gradient ${F(m)}, so it is parallel.`);
    };

    const xAxis = () => {
      const m = nz(-4, 4), r0 = nz(-5, 5), c = -m * r0;
      return { q: `Where does the line ${eq(m, c)} cross the x-axis?\nGive the coordinates.`, kind: 'coord', answer: [r0, 0],
        hints: ['On the x-axis, y = 0. Put y = 0 and solve for x.', `0 = ${ex([[m, 'x'], [c, '']])}, so ${ex([[m, 'x']])} = ${F(-c)}. Now divide.`],
        explain: `${ex([[m, 'x']])} = ${F(-c)}, so x = ${F(r0)}. It crosses at (${F(r0)}, 0).` };
    };

    const halfGraph = () => {
      const m = pick([0.5, -0.5, 1.5, -1.5]), c = R(-2, 2);
      const pts = [-4, -2, 0, 2, 4].map(x => ({ x, y: m * x + c })).filter(p => inRange(p.y));
      const p1 = pts[0], p2 = pts[pts.length - 1];
      return num('What is the gradient of the line on the grid? Give your answer as a decimal.', m,
        ['Gradient = change in y ÷ change in x. Use two points where the line crosses grid corners.',
          `From x = ${F(p1.x)} to x = ${F(p2.x)} the change in x is ${p2.x - p1.x}. Now find the change in y.`],
        `Change in y = ${F(p2.y - p1.y)}, change in x = ${p2.x - p1.x}, so the gradient is ${F(p2.y - p1.y)} ÷ ${p2.x - p1.x} = ${F(m)}.`,
        { visual: G({ lines: [{ m, c }], points: [{ x: p1.x, y: p1.y }, { x: p2.x, y: p2.y }] }) });
    };

    PMLM.registerSkill({
      id: 'g8.straightLines', grade: 8, unit: 'g8.u4', title: 'Straight-line graphs', icon: '📉',
      blurb: 'Gradient and y-intercept of y = mx + c',
      lesson: [
        { title: 'y = mx + c',
          text: 'Every straight line (not vertical) has an equation y = mx + c.\n**m** is the **gradient**: how steep it is.\n**c** is the **y-intercept**: where it crosses the y-axis.\ny = 2x + 1 has gradient 2 and crosses the y-axis at (0, 1).',
          visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, lines: [{ m: 2, c: 1, label: 'y = 2x + 1' }], points: [{ x: 0, y: 1 }] } },
        { title: 'Gradient',
          text: 'Gradient = {change in y/change in x}\nGo from left to right. Uphill → positive. Downhill → negative.\nThis line goes down 1 for every 1 across: gradient −1.',
          visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, lines: [{ m: -1, c: 3, label: 'y = −x + 3' }], points: [{ x: 0, y: 3 }, { x: 2, y: 1 }] } },
        { title: 'Points on a line',
          text: 'Substitute x to find y.\nIs (2, 7) on y = 3x + 1? 3 × 2 + 1 = 7 ✓ Yes.\nIs (1, 5) on it? 3 × 1 + 1 = 4, not 5. No.',
          visual: { type: 'table', headers: ['x', '−1', '0', '1', '2'], rows: [['y = 3x + 1', '−2', '1', '4', '7']] } },
        { title: 'Parallel lines',
          text: 'Parallel lines have the **same gradient**.\ny = 3x + 1 and y = 3x − 4 are parallel.\ny = 7 − 2x has gradient −2 (the number with the x).' },
        { title: 'Worked example',
          text: 'Find the equation of the line through (0, −2) and (2, 4).\n**1.** It crosses the y-axis at (0, −2), so c = −2.\n**2.** Gradient = (4 − (−2)) ÷ (2 − 0) = 6 ÷ 2 = 3.\n**3.** Answer: **y = 3x − 2**',
          visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, points: [{ x: 0, y: -2, label: '(0, −2)' }, { x: 2, y: 4, label: '(2, 4)' }] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [gradEq, interceptEq, yFromX, gradEq],
          [readGradient, eqFromGraph, pointOn, interceptEq, gradEq, yFromX],
          [gradTwoPoints, eqTwoPoints, parallel, xAxis, halfGraph, readGradient],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 5: Geometry and measure ═══════════════════════
  PMLM.registerUnit({ id: 'g8.u5', grade: 8, name: 'Geometry and measure', icon: '🔺' });

  /* 17 ── Angles: parallel lines and polygons */
  {
    const TRUE = (pos, th) => (/\.(tr|bl)$/.test(pos) ? th : 180 - th);
    const PAIRS = {
      corresponding: [['A.tr', 'B.tr'], ['A.tl', 'B.tl'], ['A.bl', 'B.bl'], ['A.br', 'B.br']],
      alternate: [['A.bl', 'B.tr'], ['A.br', 'B.tl']],
      coInterior: [['A.br', 'B.tr'], ['A.bl', 'B.tl']],
      vertOpp: [['A.tr', 'A.bl'], ['A.tl', 'A.br'], ['B.tr', 'B.bl'], ['B.tl', 'B.br']],
      straight: [['A.tr', 'A.tl'], ['A.tl', 'A.bl'], ['A.bl', 'A.br'], ['A.br', 'A.tr'], ['B.tr', 'B.tl'], ['B.tl', 'B.bl'], ['B.bl', 'B.br'], ['B.br', 'B.tr']],
    };
    const NAME = { corresponding: 'Corresponding angles', alternate: 'Alternate angles', coInterior: 'Co-interior angles', vertOpp: 'Vertically opposite angles', straight: 'Angles on a straight line' };
    const RULE = { corresponding: 'Corresponding angles are equal (F shape).', alternate: 'Alternate angles are equal (Z shape).', coInterior: 'Co-interior angles add up to 180° (C shape).', vertOpp: 'Vertically opposite angles are equal.', straight: 'Angles on a straight line add up to 180°.' };
    const SAME = t => t !== 'coInterior' && t !== 'straight';
    const WHERE = { tl: 'top left', tr: 'top right', bl: 'bottom left', br: 'bottom right' };
    const where = p => `${WHERE[p.slice(2)]} of the ${p[0] === 'A' ? 'top' : 'bottom'} crossing`;
    const POLY = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
    const vis = (th, labels) => ({ type: 'parallelLines', theta: th, labels });

    const pairQ = types => () => {
      const t = pick(types), pr = pick(PAIRS[t]), [g, u] = Math.random() < 0.5 ? pr : [pr[1], pr[0]];
      const th = R(25, 75), gv = TRUE(g, th), uv = TRUE(u, th);
      return num('The two horizontal lines are parallel. Find the angle x.', uv,
        ['Look at where the two angles are. Are they equal, or do they add up to 180°?', `These are ${NAME[t].toLowerCase()}. ${RULE[t]}`],
        `${RULE[t]} So x = ${SAME(t) ? `${gv}°` : `180° − ${gv}° = ${uv}°`}.`,
        { unit: '°', visual: vis(th, { [g]: `${gv}°`, [u]: 'x' }) });
    };

    const nameIt = () => {
      const t = pick(['corresponding', 'alternate', 'coInterior', 'vertOpp']), pr = pick(PAIRS[t]), th = R(30, 70);
      return choice('The two horizontal lines are parallel. What type of angles are a and b?', NAME[t],
        ['Corresponding angles', 'Alternate angles', 'Co-interior angles', 'Vertically opposite angles'],
        ['Corresponding: same position at each crossing (F). Alternate: opposite sides, between the lines (Z). Co-interior: same side, between the lines (C).',
          `a is at the ${where(pr[0])}; b is at the ${where(pr[1])}.`],
        `${NAME[t]}. ${RULE[t]}`, { visual: vis(th, { [pr[0]]: 'a', [pr[1]]: 'b' }) });
    };

    const twoStep = () => {
      const direct = new Set();
      [...PAIRS.corresponding, ...PAIRS.alternate, ...PAIRS.coInterior].forEach(([a, b]) => { direct.add(`${a}|${b}`); direct.add(`${b}|${a}`); });
      const [g, u] = retry(() => {
        const g = `${pick(['A', 'B'])}.${pick(['tl', 'tr', 'bl', 'br'])}`;
        const u = `${g[0] === 'A' ? 'B' : 'A'}.${pick(['tl', 'tr', 'bl', 'br'])}`;
        return direct.has(`${g}|${u}`) ? null : [g, u];
      });
      const th = R(25, 75), gv = TRUE(g, th), uv = TRUE(u, th), mid = `${u[0]}.${g.slice(2)}`;
      const step2 = uv === gv ? `x is vertically opposite it, so x = ${gv}°` : `x is on a straight line with it, so x = 180° − ${gv}° = ${uv}°`;
      return num('The two horizontal lines are parallel. Find the angle x.', uv,
        ['You may need two steps. Use corresponding angles to move to the other crossing, then use vertically opposite angles or a straight line.',
          `Corresponding angles are equal, so the angle at the ${where(mid)} is also ${gv}°.`],
        `The corresponding angle at the ${where(mid)} is ${gv}°. ${step2}.`,
        { unit: '°', visual: vis(th, { [g]: `${gv}°`, [u]: 'x' }) });
    };

    const algebra = () => {
      const th = R(30, 75);
      if (Math.random() < 0.5) {
        const pr = pick(PAIRS.coInterior), s1 = TRUE(pr[0], th), s2 = TRUE(pr[1], th);
        const r = retry(() => {
          const x = R(10, 35), a1 = R(2, 3), a2 = R(1, 3), b1 = s1 - a1 * x, b2 = s2 - a2 * x;
          return b1 !== 0 && b2 !== 0 && Math.abs(b1) < 100 && Math.abs(b2) < 100 ? { x, a1, a2, b1, b2 } : null;
        });
        const e1 = ex([[r.a1, 'x'], [r.b1, '']]), e2 = ex([[r.a2, 'x'], [r.b2, '']]);
        return num('The two horizontal lines are parallel. Find the value of x.', r.x,
          ['These are co-interior angles, so they add up to 180°. Write an equation.',
            `(${e1}) + (${e2}) = 180, so ${ex([[r.a1 + r.a2, 'x'], [r.b1 + r.b2, '']])} = 180.`],
          `${ex([[r.a1 + r.a2, 'x'], [r.b1 + r.b2, '']])} = 180 → ${ex([[r.a1 + r.a2, 'x']])} = ${180 - r.b1 - r.b2} → x = ${r.x}.`,
          { visual: vis(th, { [pr[0]]: `(${e1})°`, [pr[1]]: `(${e2})°` }) });
      }
      const t = pick(['corresponding', 'alternate']), pr = pick(PAIRS[t]), s = TRUE(pr[0], th);
      const r = retry(() => {
        const x = R(5, 30), a1 = R(3, 5), a2 = R(1, a1 - 1), b1 = s - a1 * x, b2 = s - a2 * x;
        return b1 !== 0 && b2 !== 0 && Math.abs(b1) < 100 && Math.abs(b2) < 120 ? { x, a1, a2, b1, b2 } : null;
      });
      const e1 = ex([[r.a1, 'x'], [r.b1, '']]), e2 = ex([[r.a2, 'x'], [r.b2, '']]);
      return num('The two horizontal lines are parallel. Find the value of x.', r.x,
        [`These are ${NAME[t].toLowerCase()}, so they are equal. Write an equation and solve it.`,
          `${e1} = ${e2}. Take ${ex([[r.a2, 'x']])} from both sides: ${ex([[r.a1 - r.a2, 'x'], [r.b1, '']])} = ${F(r.b2)}.`],
        `${ex([[r.a1 - r.a2, 'x'], [r.b1, '']])} = ${F(r.b2)} → ${r.a1 - r.a2 === 1 ? '' : `${ex([[r.a1 - r.a2, 'x']])} = ${F(r.b2 - r.b1)} → `}x = ${r.x}.`,
        { visual: vis(th, { [pr[0]]: `(${e1})°`, [pr[1]]: `(${e2})°` }) });
    };

    const angleSum = () => {
      const n = pick([5, 6, 7, 8, 9, 10, 12]);
      return num(`What is the sum of the interior angles of a ${POLY[n]}?`, (n - 2) * 180,
        ['Sum of interior angles = (n − 2) × 180°, where n is the number of sides. (A polygon splits into n − 2 triangles.)',
          `A ${POLY[n]} has ${n} sides, so work out (${n} − 2) × 180°.`],
        `(${n} − 2) × 180° = ${n - 2} × 180° = ${(n - 2) * 180}°.`, { unit: '°', visual: { type: 'polygon', n, show: 'interior' } });
    };

    const regExt = () => {
      const n = pick([3, 4, 5, 6, 8, 9, 10, 12]);
      return num(`Find the size of each exterior angle of a regular ${POLY[n]}.`, 360 / n,
        ['The exterior angles of any polygon add up to 360°.', `A regular ${POLY[n]} has ${n} equal exterior angles. Share 360° between them.`],
        `360° ÷ ${n} = ${360 / n}°.`, { unit: '°', visual: { type: 'polygon', n, show: 'exterior', label: 'x' } });
    };

    const regInt = () => {
      const n = pick([5, 6, 8, 9, 10, 12]), e = 360 / n;
      return num(`Find the size of each interior angle of a regular ${POLY[n]}.`, 180 - e,
        ['Find an exterior angle first (360° ÷ number of sides). Interior + exterior = 180°.', `Each exterior angle = 360° ÷ ${n} = ${e}°.`],
        `Exterior = ${e}°, so interior = 180° − ${e}° = ${180 - e}°.`, { unit: '°', visual: { type: 'polygon', n, show: 'interior', label: 'x' } });
    };

    const sidesFrom = () => {
      const e = pick([10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72]), n = 360 / e;
      if (Math.random() < 0.5) {
        return num(`Each exterior angle of a regular polygon is ${e}°.\nHow many sides does it have?`, n,
          ['The exterior angles add up to 360°.', `Each one is ${e}°. How many lots of ${e}° make 360°?`],
          `360 ÷ ${e} = ${n}, so it has ${n} sides.`, { unit: 'sides' });
      }
      return num(`Each interior angle of a regular polygon is ${180 - e}°.\nHow many sides does it have?`, n,
        ['Find the exterior angle first: interior + exterior = 180°. Then use the fact that exterior angles add up to 360°.',
          `Exterior angle = 180° − ${180 - e}° = ${e}°.`],
        `Exterior angle = ${e}°, and 360 ÷ ${e} = ${n}, so it has ${n} sides.`, { unit: 'sides' });
    };

    const irregular = () => {
      const n = pick([5, 6]), S = (n - 2) * 180;
      const r = retry(() => {
        const known = U.range(1, n - 1).map(() => R(Math.round(S / n) - 30, Math.round(S / n) + 30));
        const x = S - sum(known);
        return x >= 60 && x <= 175 ? { known, x } : null;
      });
      return num(`A ${POLY[n]} has angles of ${r.known.map(v => `${v}°`).join(', ')} and x.\nFind x.`, r.x,
        [`First find the sum of the interior angles of a ${POLY[n]}: (n − 2) × 180°.`, `The angles add up to ${S}°. The known angles add up to ${sum(r.known)}°.`],
        `${S}° − ${sum(r.known)}° = ${r.x}°.`, { unit: '°' });
    };

    const extIrregular = () => {
      const n = R(4, 6);
      const r = retry(() => {
        const known = U.range(1, n - 1).map(() => R(40, 110));
        const x = 360 - sum(known);
        return x >= 25 && x <= 150 ? { known, x } : null;
      });
      return num(`A ${POLY[n]} has exterior angles of ${r.known.map(v => `${v}°`).join(', ')} and x.\nFind x.`, r.x,
        ['The exterior angles of any polygon add up to 360°.', `The known exterior angles add up to ${sum(r.known)}°.`],
        `360° − ${sum(r.known)}° = ${r.x}°.`, { unit: '°' });
    };

    PMLM.registerSkill({
      id: 'g8.angles', grade: 8, unit: 'g8.u5', title: 'Angles and polygons', icon: '📐',
      blurb: 'Angles with parallel lines; angles in polygons',
      lesson: [
        { title: 'Corresponding angles',
          text: 'A line crossing two parallel lines makes angles in matching positions.\n**Corresponding angles are equal.** Look for an **F** shape.',
          visual: { type: 'parallelLines', theta: 60, labels: { 'A.tr': '60°', 'B.tr': '60°' } } },
        { title: 'Alternate angles',
          text: '**Alternate angles are equal.** They are between the parallel lines, on opposite sides of the crossing line. Look for a **Z** shape.',
          visual: { type: 'parallelLines', theta: 55, labels: { 'A.bl': 'a', 'B.tr': 'a' } } },
        { title: 'Co-interior angles',
          text: '**Co-interior angles add up to 180°.** They are between the parallel lines, on the same side. Look for a **C** shape.\nHere 110° + 70° = 180°.',
          visual: { type: 'parallelLines', theta: 70, labels: { 'A.br': '110°', 'B.tr': '70°' } } },
        { title: 'Angles in polygons',
          text: 'Sum of interior angles = **(n − 2) × 180°** for a polygon with n sides.\nExterior angles of any polygon add up to **360°**.\nRegular polygon: each exterior angle = 360° ÷ n, and interior = 180° − exterior.',
          visual: { type: 'polygon', n: 6, show: 'interior' } },
        { title: 'Worked example',
          text: 'Find each interior angle of a regular octagon.\n**1.** An octagon has 8 sides.\n**2.** Each exterior angle = 360° ÷ 8 = 45°.\n**3.** Interior = 180° − 45° = **135°**.\nCheck: (8 − 2) × 180° = 1080°, and 1080° ÷ 8 = 135° ✓',
          visual: { type: 'polygon', n: 8, show: 'exterior' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [pairQ(['corresponding', 'alternate']), pairQ(['corresponding', 'alternate']), pairQ(['vertOpp', 'straight']), angleSum, regExt],
          [pairQ(['coInterior']), pairQ(['corresponding', 'alternate', 'coInterior']), nameIt, regInt, extIrregular, angleSum],
          [twoStep, algebra, algebra, sidesFrom, irregular, regInt],
        ], ctx);
      },
    });
  }

  /* 18 ── Circumference and area of circles */
  {
    const P314 = 'Use π = 3.14 and give your answer to 1 decimal place.';
    const PBTN = 'Use the π button on your calculator and give your answer to 1 decimal place.';
    const r1 = v => U.round(v, 1);
    const f1 = v => F(r1(v), 1);
    const eq4 = v => (U.round(v, 4) === r1(v) ? `${F(U.round(v, 4))}` : `${F(U.round(v, 4))} ≈ ${f1(v)}`);
    const T = { tolerance: 0.05 };
    const circle = dims => ({ type: 'shape2d', shape: 'circle', dims });

    const circD = () => {
      const d = R(2, 20), u = pick(['cm', 'm']), v = 3.14 * d;
      return num(`A circle has a diameter of ${d} ${u}. Find its circumference.\n${P314}`, r1(v),
        ['Circumference = π × diameter (C = πd).', `C = 3.14 × ${d}. Work it out, then round to 1 decimal place.`],
        `C = 3.14 × ${d} = ${eq4(v)} ${u}.`,
        Object.assign({ unit: u, visual: circle({ diameter: `${d} ${u}` }) }, T));
    };

    const radDiam = () => {
      if (Math.random() < 0.5) {
        const r = R(2, 25);
        return num(`A circle has a radius of ${r} cm. What is its diameter?`, 2 * r,
          ['The diameter goes all the way across, through the centre. The radius goes from the centre to the edge.', 'The diameter is made of two radii.'],
          `Diameter = 2 × ${r} = ${2 * r} cm.`, { unit: 'cm', visual: circle({ radius: `${r} cm` }) });
      }
      const d = 2 * R(2, 25) - pick([0, 1]);
      return num(`A circle has a diameter of ${d} cm. What is its radius?`, d / 2,
        ['The radius is from the centre to the edge: half the diameter.', `Work out ${d} ÷ 2.`],
        `Radius = ${d} ÷ 2 = ${F(d / 2)} cm.`, { unit: 'cm', visual: circle({ diameter: `${d} cm` }) });
    };

    const formula = () => {
      if (Math.random() < 0.5) {
        return choice('Which formula gives the **area** of a circle with radius r?', 'πr^{2}', ['2πr', 'πd', 'πd^{2}', '2πr^{2}'],
          ['Area is measured in square units, so the formula has a squared length.', 'The area formula uses the radius, squared.'],
          'Area = πr^{2} (π times the radius squared).');
      }
      return choice('Which formula gives the **circumference** of a circle with diameter d?', 'πd', ['πd^{2}', 'πr^{2}', '2d', 'π + d'],
        ['The circumference is a length (the distance round the edge), so nothing is squared.', 'The circumference is a bit more than 3 diameters long.'],
        'Circumference = πd (π times the diameter), which is the same as 2πr.');
    };

    const circR = () => {
      const r = R(2, 15), v = 2 * 3.14 * r;
      return num(`A circle has a radius of ${r} cm. Find its circumference.\n${P314}`, r1(v),
        ['Circumference = 2πr, or find the diameter first and use πd.', `Diameter = 2 × ${r} = ${2 * r} cm. So C = 3.14 × ${2 * r}.`],
        `C = 3.14 × ${2 * r} = ${eq4(v)} cm.`,
        Object.assign({ unit: 'cm', visual: circle({ radius: `${r} cm` }) }, T));
    };

    const areaR = () => {
      const r = R(2, 12), u = pick(['cm', 'm']), v = 3.14 * r * r;
      const pond = u === 'm' && Math.random() < 0.5;
      return num(`${pond ? `A circular pond has a radius of ${r} m. Find the area of its surface.` : `A circle has a radius of ${r} ${u}. Find its area.`}\n${P314}`, r1(v),
        ['Area = πr^{2}. Square the radius first, then multiply by π.', `r^{2} = ${r} × ${r} = ${r * r}. Now multiply by 3.14.`],
        `A = 3.14 × ${r * r} = ${eq4(v)} ${u}².`,
        Object.assign({ unit: `${u}²`, visual: circle({ radius: `${r} ${u}` }) }, T));
    };

    const areaD = () => {
      const d = R(3, 24), r = d / 2, v = Math.PI * r * r;
      return num(`A circle has a diameter of ${d} cm. Find its area.\n${PBTN}`, r1(v),
        ['Area = πr^{2}, so you need the radius, not the diameter.', `Radius = ${d} ÷ 2 = ${F(r)} cm. Now work out π × ${F(r)}^{2}.`],
        `r = ${F(r)}, so A = π × ${F(r * r)} = ${F(U.round(v, 3))}… ≈ ${f1(v)} cm².`,
        Object.assign({ unit: 'cm²', visual: circle({ diameter: `${d} cm` }) }, T));
    };

    const semi = () => {
      const d = 2 * R(2, 10), r = d / 2;
      if (Math.random() < 0.5) {
        const v = 3.14 * r * r / 2;
        return num(`A semicircle has a diameter of ${d} cm. Find its area.\n${P314}`, r1(v),
          ['A semicircle is half a circle. Find the area of the whole circle, then halve it.', `Radius = ${r} cm. Whole circle: 3.14 × ${r * r} = ${F(U.round(3.14 * r * r, 4))} cm².`],
          `Half of ${F(U.round(3.14 * r * r, 4))} = ${eq4(v)} cm².`,
          Object.assign({ unit: 'cm²', visual: { type: 'shape2d', shape: 'semicircle' } }, T));
      }
      const v = Math.PI * d / 2 + d;
      return num(`A semicircle has a diameter of ${d} cm. Find its perimeter (the curved edge plus the straight edge).\n${PBTN}`, r1(v),
        ['Perimeter = half the circumference of the full circle + the diameter.', `Half the circumference = π × ${d} ÷ 2 = ${F(U.round(Math.PI * d / 2, 3))}… cm. Now add the straight edge.`],
        `${F(U.round(Math.PI * d / 2, 3))}… + ${d} = ${F(U.round(v, 3))}… ≈ ${f1(v)} cm.`,
        Object.assign({ unit: 'cm', visual: { type: 'shape2d', shape: 'semicircle' } }, T));
    };

    const reverseC = () => {
      const d = R(2, 30), C = U.round(3.14 * d, 2), half = Math.random() < 0.4 && d % 2 === 0;
      return num(`A circle has a circumference of ${F(C)} cm. Using π = 3.14, find its ${half ? 'radius' : 'diameter'}.`, half ? d / 2 : d,
        ['C = πd, so work backwards: d = C ÷ π.', `d = ${F(C)} ÷ 3.14.${half ? ' Then halve it for the radius.' : ''}`],
        `d = ${F(C)} ÷ 3.14 = ${d} cm${half ? `, so the radius is ${d / 2} cm` : ''}.`, Object.assign({ unit: 'cm' }, T));
    };

    const wheel = () => {
      const d = pick([50, 60, 64, 70, 72, 80]), turns = R(2, 10), v = Math.PI * d * turns;
      return num(`A bike wheel has a diameter of ${d} cm. How far does the bike travel in cm when the wheel turns ${turns} times?\n${PBTN}`, r1(v),
        ['In one turn the wheel travels its circumference: C = πd.', `One turn: π × ${d} = ${F(U.round(Math.PI * d, 3))}… cm. Now multiply by ${turns}.`],
        `${turns} × π × ${d} = ${F(U.round(v, 3))}… ≈ ${f1(v)} cm.`, Object.assign({ unit: 'cm' }, T));
    };

    const spot = () => {
      const d = 2 * R(2, 10), who = U.name(), r = d / 2, v = 3.14 * r * r;
      return num(`${who} finds the area of a circle with diameter ${d} cm like this: 3.14 × ${d}^{2} = ${F(U.round(3.14 * d * d, 2))} cm².\nWhat is the correct area? ${P314}`, r1(v),
        [`${who} used the diameter. The area formula A = πr^{2} needs the radius.`, `The radius is ${d} ÷ 2 = ${r} cm, so r^{2} = ${r * r}.`],
        `A = 3.14 × ${r * r} = ${eq4(v)} cm².`, Object.assign({ unit: 'cm²', visual: circle({ diameter: `${d} cm` }) }, T));
    };

    PMLM.registerSkill({
      id: 'g8.circles', grade: 8, unit: 'g8.u5', title: 'Circles', icon: '⭕',
      blurb: 'Circumference and area of a circle',
      lesson: [
        { title: 'Parts of a circle',
          text: '**Radius** r: centre to edge.\n**Diameter** d: all the way across through the centre. d = 2r.\n**Circumference** C: the distance all the way round.',
          visual: { type: 'shape2d', shape: 'circle', dims: { radius: 'r' } } },
        { title: 'Circumference',
          text: 'C = πd (or C = 2πr)\nπ (pi) ≈ 3.14159… We often use π ≈ 3.14.\nDiameter 10 cm: C = 3.14 × 10 = 31.4 cm.',
          visual: { type: 'shape2d', shape: 'circle', dims: { diameter: '10 cm' } } },
        { title: 'Area',
          text: 'A = πr^{2}\nSquare the **radius** first, then multiply by π.\nRadius 3 cm: A = 3.14 × 9 = 28.26 ≈ 28.3 cm².\nIf you are given the diameter, halve it first!' },
        { title: '3.14 or the π button?',
          text: 'Each question tells you which to use.\n"Use π = 3.14" → type 3.14.\n"Use the π button" → press π on your calculator.\nThen round to 1 decimal place: 28.26 → 28.3.' },
        { title: 'Worked example',
          text: 'A circular table has diameter 1.2 m. Find its area. Use π = 3.14.\n**1.** Radius = 1.2 ÷ 2 = 0.6 m.\n**2.** r^{2} = 0.6 × 0.6 = 0.36.\n**3.** A = 3.14 × 0.36 = 1.1304.\n**4.** To 1 decimal place: **1.1 m²**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [circD, circD, radDiam, formula],
          [circR, areaR, areaR, circD, formula],
          [areaD, semi, reverseC, wheel, spot, areaR],
        ], ctx);
      },
    });
  }

  /* 19 ── Area of parallelograms and trapezia; volume and surface area */
  {
    const para = (b, h) => ({ type: 'shape2d', shape: 'parallelogram', dims: { base: `${b} cm`, height: `${h} cm` } });
    const trap = (a, b, h) => ({ type: 'shape2d', shape: 'trapezium', dims: { top: `${a} cm`, base: `${b} cm`, height: `${h} cm` } });
    const cub = (l, w, h, u = 'cm') => ({ type: 'shape3d', shape: 'cuboid', dims: { l: `${l} ${u}`, w: `${w} ${u}`, h: `${h} ${u}` } });

    const parallelogram = L => {
      const b = R(3, 15), h = R(2, 12);
      if (L >= 2 && Math.random() < 0.5) {
        const s = h + R(1, 4);
        return num(`A parallelogram has a base of ${b} cm, a perpendicular height of ${h} cm and slanted sides of ${s} cm.\nFind its area.`, b * h,
          ['Area of a parallelogram = base × **perpendicular** height. You do not need the slanted side.', `Use the base ${b} cm and the height ${h} cm.`],
          `Area = ${b} × ${h} = ${b * h} cm². (The ${s} cm slanted side is not used.)`, { unit: 'cm²', visual: para(b, h) });
      }
      return num('Find the area of the parallelogram.', b * h,
        ['Area of a parallelogram = base × perpendicular height (the height at right angles to the base).', `The base is ${b} cm and the height is ${h} cm.`],
        `Area = ${b} × ${h} = ${b * h} cm².`, { unit: 'cm²', visual: para(b, h) });
    };

    const trapezium = () => {
      const r = retry(() => { const a = R(2, 10), b = a + R(2, 8), h = R(3, 10); return ((a + b) * h) % 2 === 0 ? { a, b, h } : null; });
      return num('Find the area of the trapezium.', (r.a + r.b) * r.h / 2,
        ['Area of a trapezium = {1/2}(a + b) × h, where a and b are the parallel sides.', `a + b = ${r.a} + ${r.b} = ${r.a + r.b}. Now multiply by the height ${r.h} and halve.`],
        `{1/2} × ${r.a + r.b} × ${r.h} = ${(r.a + r.b) * r.h / 2} cm².`, { unit: 'cm²', visual: trap(r.a, r.b, r.h) });
    };

    const volume = () => {
      const l = R(2, 12), w = R(2, 8), h = R(2, 10);
      return num('Find the volume of the cuboid.', l * w * h,
        ['Volume of a cuboid = length × width × height.', `${l} × ${w} = ${l * w}. Now multiply by the height, ${h}.`],
        `${l} × ${w} × ${h} = ${l * w * h} cm³.`, { unit: 'cm³', visual: cub(l, w, h) });
    };

    const surface = () => {
      const l = R(2, 10), w = R(2, 8), h = R(2, 8);
      const sa = 2 * (l * w + l * h + w * h);
      return num('Find the total surface area of the cuboid.', sa,
        ['A cuboid has 6 faces in 3 matching pairs. Find the area of each different face, add them, then double.',
          `The three different faces are ${l} × ${w} = ${l * w}, ${l} × ${h} = ${l * h} and ${w} × ${h} = ${w * h}. Add them, then double.`],
        `2 × (${l * w} + ${l * h} + ${w * h}) = 2 × ${l * w + l * h + w * h} = ${sa} cm².`, { unit: 'cm²', visual: cub(l, w, h) });
    };

    const prism = () => {
      if (Math.random() < 0.5) {
        const r = retry(() => { const b = R(2, 10), h = R(2, 10), L = R(3, 15); return (b * h) % 2 === 0 ? { b, h, L } : null; });
        const A = r.b * r.h / 2;
        return num(`A triangular prism is ${r.L} cm long. Its triangle end has a base of ${r.b} cm and a height of ${r.h} cm.\nFind its volume.`, A * r.L,
          ['Volume of a prism = area of the cross-section × length.', `Cross-section (triangle): {1/2} × ${r.b} × ${r.h} = ${A} cm². Now multiply by the length.`],
          `${A} × ${r.L} = ${A * r.L} cm³.`, { unit: 'cm³', visual: { type: 'shape3d', shape: 'triangularPrism', dims: { l: `${r.L} cm`, w: `${r.b} cm`, h: `${r.h} cm` } } });
      }
      const A = R(6, 40), L = R(3, 15);
      return num(`A prism has a cross-section with area ${A} cm² and a length of ${L} cm.\nFind its volume.`, A * L,
        ['Volume of a prism = area of the cross-section × length.', `Work out ${A} × ${L}.`],
        `${A} × ${L} = ${A * L} cm³.`, { unit: 'cm³' });
    };

    const missingDim = () => {
      if (Math.random() < 0.5) {
        const l = R(2, 12), w = R(2, 8), h = R(2, 10), V = l * w * h;
        return num(`A cuboid has a volume of ${V} cm³. It is ${l} cm long and ${w} cm wide.\nHow tall is it?`, h,
          ['Volume = length × width × height. Work backwards to find the height.', `${l} × ${w} = ${l * w}, so ${l * w} × height = ${V}.`],
          `Height = ${V} ÷ ${l * w} = ${h} cm.`, { unit: 'cm', visual: cub(l, w, '?') });
      }
      const r = retry(() => { const a = R(3, 10), b = a + R(2, 8), h = R(2, 12); return (a + b) % 2 === 0 ? { a, b, h } : null; });
      const A = (r.a + r.b) * r.h / 2;
      return num(`A trapezium has parallel sides of ${r.a} cm and ${r.b} cm. Its area is ${A} cm².\nFind its height.`, r.h,
        ['Area = {1/2}(a + b) × h. Put in what you know, then solve for h.', `{1/2} × (${r.a} + ${r.b}) = ${(r.a + r.b) / 2}, so ${(r.a + r.b) / 2} × h = ${A}.`],
        `h = ${A} ÷ ${(r.a + r.b) / 2} = ${r.h} cm.`, { unit: 'cm', visual: trap(r.a, r.b, '?') });
    };

    const tank = () => {
      const l = 10 * R(3, 8), w = 10 * R(2, 5), h = 10 * R(2, 6), V = l * w * h;
      return num(`A fish tank is a cuboid ${l} cm long, ${w} cm wide and ${h} cm tall.\nHow many litres of water does it hold when full? (1 litre = 1000 cm³)`, V / 1000,
        ['Find the volume in cm³, then divide by 1000 to change cm³ into litres.', `Volume = ${l} × ${w} × ${h} = ${F(V)} cm³.`],
        `${F(V)} cm³ ÷ 1000 = ${F(V / 1000)} litres.`, { unit: 'litres', visual: cub(l, w, h) });
    };

    const cube = () => {
      const s = R(2, 10), V = s * s * s;
      return num(`A cube has a volume of ${V} cm³. Find its total surface area.`, 6 * s * s,
        ['First find the length of one edge: which number cubed gives the volume? A cube has 6 square faces.', `${s} × ${s} × ${s} = ${V}, so each edge is ${s} cm. Each face is ${s} × ${s}.`],
        `Each face is ${s * s} cm², so the surface area is 6 × ${s * s} = ${6 * s * s} cm².`, { unit: 'cm²', visual: { type: 'shape3d', shape: 'cube' } });
    };

    const spot = () => {
      const b = R(4, 12), h = R(3, 9), s = h + R(1, 3), who = U.name();
      return num(`A parallelogram has base ${b} cm, perpendicular height ${h} cm and slanted side ${s} cm.\n${who} says the area is ${b} × ${s} = ${b * s} cm². What is the correct area?`, b * h,
        [`${who} used the slanted side. You need the perpendicular height (at right angles to the base).`, `Use base ${b} cm and height ${h} cm.`],
        `Area = ${b} × ${h} = ${b * h} cm².`, { unit: 'cm²', visual: para(b, h) });
    };

    PMLM.registerSkill({
      id: 'g8.areaVolume', grade: 8, unit: 'g8.u5', title: 'Area and volume', icon: '🧊',
      blurb: 'Parallelograms, trapezia, cuboids and prisms',
      lesson: [
        { title: 'Parallelogram',
          text: 'Area = base × **perpendicular** height.\nThe height is at right angles to the base, not the slanted side.\n8 × 5 = 40 cm²',
          visual: { type: 'shape2d', shape: 'parallelogram', dims: { base: '8 cm', height: '5 cm' } } },
        { title: 'Trapezium',
          text: 'Area = {1/2}(a + b) × h\na and b are the two parallel sides, h is the height between them.\n{1/2} × (4 + 10) × 5 = {1/2} × 14 × 5 = 35 cm²',
          visual: { type: 'shape2d', shape: 'trapezium', dims: { top: '4 cm', base: '10 cm', height: '5 cm' } } },
        { title: 'Volume of cuboids and prisms',
          text: 'Cuboid: V = length × width × height.\n5 × 3 × 2 = 30 cm³\nAny prism: V = area of cross-section × length.\nVolume is in cubic units (cm³, m³). 1 litre = 1000 cm³.',
          visual: { type: 'shape3d', shape: 'cuboid', dims: { l: '5 cm', w: '3 cm', h: '2 cm' } } },
        { title: 'Surface area',
          text: 'Surface area = the total area of all the faces.\nA cuboid has 3 pairs of matching faces:\nSA = 2 × (lw + lh + wh)\n5 by 3 by 2: 2 × (15 + 10 + 6) = 62 cm²' },
        { title: 'Worked example',
          text: 'A triangular prism is 10 cm long. The triangle has base 6 cm and height 4 cm. Find the volume.\n**1.** Area of the triangle: {1/2} × 6 × 4 = 12 cm².\n**2.** Volume = 12 × 10 = **120 cm³**.',
          visual: { type: 'shape3d', shape: 'triangularPrism', dims: { l: '10 cm', w: '6 cm', h: '4 cm' } } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [parallelogram, parallelogram, volume, volume, trapezium],
          [trapezium, trapezium, surface, parallelogram, volume],
          [prism, missingDim, tank, cube, spot, surface],
        ], ctx);
      },
    });
  }

  /* 20 ── Transformations and midpoints */
  {
    const pt = (x, y) => `(${F(x)}, ${F(y)})`;
    const G = extra => Object.assign({ type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5 }, extra);
    const ok = (x, y) => x >= -5 && x <= 5 && y >= -5 && y <= 5;
    const move = (dx, dy) => [dx ? `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}` : '', dy ? `${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}` : ''].filter(Boolean).join(' and ');
    const coord = (q, answer, hints, explain, extra) => Object.assign({ q, kind: 'coord', answer, hints, explain }, extra || {});
    const TRI = [[[0, 0], [3, 0], [0, 2]], [[0, 0], [2, 0], [0, 3]], [[0, 0], [3, 0], [1, 2]], [[0, 0], [2, 1], [0, 3]], [[0, 0], [3, 1], [1, 2]]];

    const translate = L => {
      const r = retry(() => {
        const x = R(-4, 4), y = R(-4, 4), dx = nz(-5, 5), dy = nz(-5, 5);
        return ok(x + dx, y + dy) ? { x, y, dx, dy } : null;
      });
      if (L >= 2) {
        const tri = pick(TRI), ox = r.x, oy = r.y;
        const pts = tri.map(([a, b]) => [a + ox, b + oy]);
        if (pts.some(([a, b]) => !ok(a, b) || !ok(a + r.dx, b + r.dy))) return translate(1);
        const i = R(0, 2), nm = 'PQR'[i], [px, py] = pts[i];
        return coord(`Triangle PQR is translated ${move(r.dx, r.dy)}.\nWhat are the coordinates of the image of ${nm}?`, [px + r.dx, py + r.dy],
          [`Every point moves the same way: ${move(r.dx, r.dy)}. Right/left changes x, up/down changes y.`, `${nm} is ${pt(px, py)}. Change the x-coordinate first: ${F(px)} ${r.dx > 0 ? '+' : M} ${Math.abs(r.dx)} = ${F(px + r.dx)}.`],
          `${nm} ${pt(px, py)} moves to ${pt(px + r.dx, py + r.dy)}.`,
          { visual: G({ polygons: [{ pts, label: 'PQR' }], points: pts.map(([a, b], j) => ({ x: a, y: b, label: 'PQR'[j] })) }) });
      }
      return coord(`Point A ${pt(r.x, r.y)} is translated ${move(r.dx, r.dy)}.\nWhere is its image?`, [r.x + r.dx, r.y + r.dy],
        ['Right/left changes the x-coordinate. Up/down changes the y-coordinate.', `x: ${F(r.x)} ${r.dx > 0 ? '+' : M} ${Math.abs(r.dx)} = ${F(r.x + r.dx)}. Now change the y-coordinate.`],
        `x becomes ${F(r.x + r.dx)} and y becomes ${F(r.y + r.dy)}: ${pt(r.x + r.dx, r.y + r.dy)}.`,
        { visual: G({ points: [{ x: r.x, y: r.y, label: 'A' }] }) });
    };

    const reflectAxis = () => {
      const x = nz(-5, 5), y = nz(-5, 5), inX = Math.random() < 0.5;
      const ans = inX ? [x, -y] : [-x, y];
      return coord(`Point P ${pt(x, y)} is reflected in the ${inX ? 'x-axis' : 'y-axis'}.\nWhere is its image?`, ans,
        ['The image is the same distance from the mirror line, on the other side.', inX ? `The mirror is the x-axis (horizontal), so the x-coordinate stays ${F(x)}. P is ${Math.abs(y)} ${y > 0 ? 'above' : 'below'} it.` : `The mirror is the y-axis (vertical), so the y-coordinate stays ${F(y)}. P is ${Math.abs(x)} to the ${x > 0 ? 'right' : 'left'} of it.`],
        `The image is ${pt(...ans)}.`, { visual: G({ points: [{ x, y, label: 'P' }] }) });
    };

    const reflectLine = () => {
      const r = retry(() => {
        const vert = Math.random() < 0.5, a = nz(-3, 3), x = R(-5, 5), y = R(-5, 5);
        const img = vert ? [2 * a - x, y] : [x, 2 * a - y];
        const dist = vert ? Math.abs(x - a) : Math.abs(y - a);
        return dist >= 1 && ok(...img) ? { vert, a, x, y, img, dist } : null;
      });
      const line = r.vert ? `x = ${F(r.a)}` : `y = ${F(r.a)}`;
      const seg = r.vert ? { x1: r.a, y1: -5, x2: r.a, y2: 5 } : { x1: -5, y1: r.a, x2: 5, y2: r.a };
      return coord(`Point P ${pt(r.x, r.y)} is reflected in the line ${line}.\nWhere is its image?`, r.img,
        [`The line ${line} is ${r.vert ? 'vertical' : 'horizontal'}. The image is the same distance from it, on the other side.`,
          r.vert ? `P is ${r.dist} unit${r.dist > 1 ? 's' : ''} to the ${r.x > r.a ? 'right' : 'left'} of x = ${F(r.a)}. The y-coordinate stays ${F(r.y)}.` : `P is ${r.dist} unit${r.dist > 1 ? 's' : ''} ${r.y > r.a ? 'above' : 'below'} y = ${F(r.a)}. The x-coordinate stays ${F(r.x)}.`],
        `The image is ${r.dist} unit${r.dist > 1 ? 's' : ''} on the other side: ${pt(...r.img)}.`,
        { visual: G({ points: [{ x: r.x, y: r.y, label: 'P' }], segments: [seg] }) });
    };

    const rotate = () => {
      const x = nz(-5, 5), y = nz(-5, 5), t = pick(['180', 'cw', 'acw']);
      const ans = t === '180' ? [-x, -y] : t === 'cw' ? [y, -x] : [-y, x];
      const words = t === '180' ? 'rotated 180° about the origin (0, 0)' : `rotated 90° ${t === 'cw' ? 'clockwise' : 'anticlockwise'} about the origin (0, 0)`;
      const h2 = t === '180' ? `A half turn about (0, 0) sends each point to the opposite side: both coordinates change sign.` : `For a quarter turn about (0, 0), the coordinates swap places: (${F(x)}, ${F(y)}) → (${F(y)}, ${F(x)}). Then one of them changes sign.`;
      return coord(`Point P ${pt(x, y)} is ${words}.\nWhere is its image?`, ans,
        ['Imagine turning the grid around the origin (or use tracing paper). The distance from the origin stays the same.', h2],
        `P ${pt(x, y)} goes to ${pt(...ans)}.`, { visual: G({ points: [{ x, y, label: 'P' }, { x: 0, y: 0, label: 'O' }] }) });
    };

    const enlarge = () => {
      const r = retry(() => {
        const k = pick([2, 3]), cx = R(0, 3), cy = R(0, 3), tri = pick(TRI);
        const ox = cx + R(1, 2), oy = cy + R(1, 2);
        const pts = tri.map(([a, b]) => [a + ox, b + oy]);
        const ims = pts.map(([a, b]) => [cx + k * (a - cx), cy + k * (b - cy)]);
        return ims.every(([a, b]) => a <= 14 && b <= 14) ? { pts, ims, k, cx, cy } : null;
      });
      const { k, cx, cy } = r;
      const i = R(0, 2), nm = 'PQR'[i], [px, py] = r.pts[i], dx = px - cx, dy = py - cy;
      return coord(`Triangle PQR is enlarged by scale factor ${k} with centre C ${pt(cx, cy)}.\nWhat are the coordinates of the image of ${nm}?`, r.ims[i],
        ['Find how far the point is from the centre, multiply that distance by the scale factor, and measure it from the centre again.',
          `From C to ${nm}: ${move(dx, dy)}. Multiply by ${k}: ${move(k * dx, k * dy)}. Now count that from C.`],
        `C ${pt(cx, cy)} + ${move(k * dx, k * dy)} gives ${pt(...r.ims[i])}.`,
        { visual: { type: 'grid', xmin: -1, xmax: 14, ymin: -1, ymax: 14, polygons: [{ pts: r.pts, label: 'PQR' }], points: [{ x: cx, y: cy, label: 'C' }].concat(r.pts.map(([a, b], j) => ({ x: a, y: b, label: 'PQR'[j] }))) } });
    };

    const describe = () => {
      const T = {
        'Reflection in the y-axis': ([x, y]) => [-x, y],
        'Reflection in the x-axis': ([x, y]) => [x, -y],
        'Rotation 180° about (0, 0)': ([x, y]) => [-x, -y],
      };
      const same = (A, B) => A.length === B.length && A.every(([x, y]) => B.some(([u, v]) => u === x && v === y));
      const d = retry(() => {
        const tri = pick(TRI), ox = R(1, 2), oy = R(1, 2);
        const A = tri.map(([a, b]) => [a + ox, b + oy]);
        const kind = pick(['Reflection in the y-axis', 'Reflection in the x-axis', 'Rotation 180° about (0, 0)', 'T']);
        let B, label = kind;
        const dx = -R(4, 6), dy = pick([0, -R(3, 6)]);
        if (kind === 'T') { B = A.map(([x, y]) => [x + dx, y + dy]); label = `Translation ${move(dx, dy)}`; }
        else B = A.map(T[kind]);
        if (!B.every(([x, y]) => ok(x, y))) return null;
        const cands = Object.keys(T).filter(k => same(A.map(T[k]), B));
        if (kind === 'T' ? cands.length : cands.length !== 1) return null;
        // a translation distractor: the vector from A's first vertex to B's first vertex
        const tdx = B[0][0] - A[0][0], tdy = B[0][1] - A[0][1];
        const tWrong = kind === 'T' ? null : (tdx || tdy ? `Translation ${move(tdx, tdy)}` : null);
        return { A, B, label, tWrong };
      });
      const wrongs = Object.keys(T).filter(k => k !== d.label);
      if (d.tWrong) wrongs.unshift(d.tWrong);
      return choice('Which single transformation maps shape A onto shape B?', d.label, wrongs,
        ['Reflection flips a shape over a line. Rotation turns it. Translation slides it without turning or flipping.',
          'Compare the shapes: is B the same way round as A (a slide), or has it been flipped or turned? Check one corner.'],
        `${d.label} maps every corner of A onto the matching corner of B.`,
        { visual: G({ polygons: [{ pts: d.A, label: 'A' }, { pts: d.B, label: 'B', ghost: true }] }) });
    };

    const midpoint = L => {
      const r = retry(() => {
        const x1 = R(L === 1 ? 0 : -5, 5), y1 = R(L === 1 ? 0 : -5, 5), x2 = R(L === 1 ? 0 : -5, 5), y2 = R(L === 1 ? 0 : -5, 5);
        if (Math.abs(x2 - x1) + Math.abs(y2 - y1) < 3 || x1 === x2 || y1 === y2) return null;
        if (L < 3 && ((x1 + x2) % 2 || (y1 + y2) % 2)) return null;
        if (L === 3 && !((x1 + x2) % 2 || (y1 + y2) % 2)) return null;
        return { x1, y1, x2, y2 };
      });
      const mx = (r.x1 + r.x2) / 2, my = (r.y1 + r.y2) / 2;
      return coord(`Find the midpoint of the line from A ${pt(r.x1, r.y1)} to B ${pt(r.x2, r.y2)}.${L === 3 ? '\nUse decimals if you need to.' : ''}`, [mx, my],
        ['The midpoint is halfway: add the x-coordinates and halve, then add the y-coordinates and halve.', `x: (${F(r.x1)} + ${P(r.x2)}) ÷ 2 = ${F(r.x1 + r.x2)} ÷ 2 = ${F(mx)}. Now do the same for y.`],
        `x = ${F(mx)} and y = (${F(r.y1)} + ${P(r.y2)}) ÷ 2 = ${F(my)}, so the midpoint is ${pt(mx, my)}.`,
        { visual: G({ segments: [{ x1: r.x1, y1: r.y1, x2: r.x2, y2: r.y2 }], points: [{ x: r.x1, y: r.y1, label: 'A' }, { x: r.x2, y: r.y2, label: 'B' }] }) });
    };

    const endpoint = () => {
      const r = retry(() => {
        const ax = R(-5, 5), ay = R(-5, 5), mx = R(-4, 4), my = R(-4, 4), bx = 2 * mx - ax, by = 2 * my - ay;
        return ok(bx, by) && (ax !== mx || ay !== my) && ax !== mx && ay !== my ? { ax, ay, mx, my, bx, by } : null;
      });
      return coord(`M ${pt(r.mx, r.my)} is the midpoint of the line AB. A is ${pt(r.ax, r.ay)}.\nWhat are the coordinates of B?`, [r.bx, r.by],
        ['B is the same distance from M as A is, but on the other side.', `From A to M: x changes by ${F(r.mx - r.ax)} and y changes by ${F(r.my - r.ay)}. Do the same again from M.`],
        `${F(r.mx)} + ${P(r.mx - r.ax)} = ${F(r.bx)} and ${F(r.my)} + ${P(r.my - r.ay)} = ${F(r.by)}, so B is ${pt(r.bx, r.by)}.`,
        { visual: G({ points: [{ x: r.ax, y: r.ay, label: 'A' }, { x: r.mx, y: r.my, label: 'M' }] }) });
    };

    PMLM.registerSkill({
      id: 'g8.transformations', grade: 8, unit: 'g8.u5', title: 'Transformations', icon: '🔄',
      blurb: 'Reflect, rotate, translate, enlarge; find midpoints',
      lesson: [
        { title: 'Translation',
          text: 'A translation **slides** a shape. It does not turn or flip.\n"3 right and 2 down": add 3 to every x-coordinate and take 2 from every y-coordinate.\n(1, 4) → (4, 2)',
          visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, polygons: [{ pts: [[-4, 2], [-1, 2], [-4, 4]], label: 'A' }, { pts: [[-1, 0], [2, 0], [-1, 2]], label: 'B', ghost: true }] } },
        { title: 'Reflection',
          text: 'A reflection **flips** a shape in a mirror line. Each point ends up the same distance from the line, on the other side.\nIn the y-axis: (x, y) → (−x, y). In the x-axis: (x, y) → (x, −y).',
          visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, polygons: [{ pts: [[1, 1], [4, 1], [1, 3]], label: 'A' }, { pts: [[-1, 1], [-4, 1], [-1, 3]], label: 'B', ghost: true }] } },
        { title: 'Rotation',
          text: 'A rotation **turns** a shape about a centre. You need the angle and the direction.\nAbout (0, 0):\n180°: (x, y) → (−x, −y)\n90° clockwise: (x, y) → (y, −x)\n90° anticlockwise: (x, y) → (−y, x)\nTracing paper helps!' },
        { title: 'Enlargement and midpoints',
          text: '**Enlargement** by scale factor 2 from centre C: every point ends up twice as far from C, in the same direction.\n**Midpoint** of a line: add the two x-coordinates and halve, then add the two y-coordinates and halve. It is the mean of the x\'s and the mean of the y\'s.' },
        { title: 'Worked example',
          text: 'Find the midpoint of (2, 7) and (6, −1).\n**1.** x: (2 + 6) ÷ 2 = 4.\n**2.** y: (7 + (−1)) ÷ 2 = 6 ÷ 2 = 3.\n**3.** Midpoint: **(4, 3)**.',
          visual: { type: 'grid', xmin: -1, xmax: 8, ymin: -2, ymax: 8, segments: [{ x1: 2, y1: 7, x2: 6, y2: -1 }], points: [{ x: 2, y: 7, label: '(2, 7)' }, { x: 6, y: -1, label: '(6, −1)' }] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [translate, translate, reflectAxis, reflectAxis, midpoint],
          [reflectLine, rotate, rotate, translate, midpoint, reflectLine],
          [enlarge, describe, describe, endpoint, midpoint, rotate],
        ], ctx);
      },
    });
  }

  // ═══════════════════ Unit 6: Statistics and probability ═══════════════════
  PMLM.registerUnit({ id: 'g8.u6', grade: 8, name: 'Statistics and chance', icon: '🎲' });

  /* 21 ── Mean, median, mode and range from frequency tables */
  {
    const CTX = [
      { head: 'Goals', what: 'the number of goals scored in some football matches', who: 'matches', s: [0, 0] },
      { head: 'Children', what: 'the number of children in some families', who: 'families', s: [0, 1] },
      { head: 'Pets', what: 'the number of pets some students have', who: 'students', s: [0, 0] },
      { head: 'Shoe size', what: 'the shoe sizes of some students', who: 'students', s: [3, 6] },
      { head: 'Books', what: 'the number of books some students read last month', who: 'students', s: [0, 2] },
      { head: 'Score', what: 'the scores when a dice was rolled', who: 'rolls', s: [1, 1], k: 6 },
    ];
    const make = (L, cond) => retry(() => {
      const c = pick(CTX), k = c.k || R(4, 6), s = R(c.s[0], c.s[1]);
      const vals = U.range(s, s + k - 1), fs = vals.map(() => R(L === 1 ? 1 : 0, 9));
      fs[0] = Math.max(fs[0], 1); fs[k - 1] = Math.max(fs[k - 1], 1);
      const mx = Math.max(...fs);
      if (fs.filter(f => f === mx).length > 1) return null;
      const n = sum(fs);
      if (n < 8 || n > 40) return null;
      const t = { c, vals, fs, n, sfx: sum(vals.map((v, i) => v * fs[i])), mode: vals[fs.indexOf(mx)], mx };
      return !cond || cond(t) ? t : null;
    });
    const vis = (t, hide) => ({ type: 'table', headers: [t.c.head, 'Frequency'], rows: t.vals.map((v, i) => [String(v), i === hide ? '?' : String(t.fs[i])]) });
    const intro = t => `The table shows ${t.c.what}.`;
    const listOf = t => t.vals.flatMap((v, i) => Array(t.fs[i]).fill(v));
    const fxList = t => t.vals.map((v, i) => `${v} × ${t.fs[i]}`).join(' + ');

    const mode = () => {
      const t = make(1);
      return num(`${intro(t)}\nWhat is the mode?`, t.mode,
        ['The mode is the value that appears most often: the one with the highest frequency.', `The highest frequency is ${t.mx}. Which value in the first column has that frequency?`],
        `The highest frequency is ${t.mx}, for ${t.mode}. So the mode is ${t.mode}.`, { visual: vis(t) });
    };

    const range = () => {
      const t = make(1), lo = t.vals[0], hi = t.vals[t.vals.length - 1];
      return num(`${intro(t)}\nWhat is the range?`, hi - lo,
        ['Range = largest value − smallest value. Use the values in the first column, not the frequencies.', `The smallest value is ${lo}. Find the largest value.`],
        `${hi} − ${lo} = ${hi - lo}.`, { visual: vis(t) });
    };

    const total = () => {
      const t = make(1);
      return num(`${intro(t)}\nHow many ${t.c.who} are there altogether?`, t.n,
        ['Each frequency tells you how many there are with that value. Add up the frequency column.', `Start adding: ${t.fs[0]} + ${t.fs[1]} = ${t.fs[0] + t.fs[1]}. Keep going.`],
        `${t.fs.join(' + ')} = ${t.n}.`, { visual: vis(t) });
    };

    const median = () => {
      const t = make(2), list = listOf(t), n = t.n;
      const med = n % 2 ? list[(n - 1) / 2] : (list[n / 2 - 1] + list[n / 2]) / 2;
      const pos = n % 2 ? `the ${U.ord((n + 1) / 2)} value` : `halfway between the ${U.ord(n / 2)} and ${U.ord(n / 2 + 1)} values`;
      return num(`${intro(t)}\nWhat is the median?`, med,
        ['The median is the middle value when all the values are in order. The table is already in order.', `There are ${n} values, so the median is ${pos}. Count down the frequency column to find it.`],
        `There are ${n} values. The median is ${pos}, which is ${F(med)}.`, { visual: vis(t) });
    };

    const mean = L => {
      const exact = L === 2;
      const t = make(2, x => (exact ? (x.sfx * 10) % x.n === 0 : (x.sfx * 10) % x.n !== 0));
      const m = t.sfx / t.n;
      return num(`${intro(t)}\nWork out the mean.${exact ? '' : ' Give your answer to 1 decimal place.'}`, exact ? m : U.round(m, 1),
        ['Mean = total of (value × frequency) ÷ total frequency.', `Total of value × frequency: ${fxList(t)} = ${t.sfx}.`],
        `Total = ${t.sfx} and there are ${t.n} ${t.c.who}. ${t.sfx} ÷ ${t.n} = ${exact ? F(m) : `${U.round(m, 3) === U.clean(m) ? F(m) : `${F(U.round(m, 3))}…`} ≈ ${F(U.round(m, 1), 1)}`}.`,
        Object.assign({ visual: vis(t) }, exact ? {} : { tolerance: 0.05 }));
    };

    const spotMode = () => {
      const t = make(2, x => x.mx !== x.mode);
      const who = U.name();
      return num(`${intro(t)}\n${who} says the mode is ${t.mx}. What is the mode really?`, t.mode,
        [`${who} gave the highest frequency. The mode is a value from the first column.`, `The highest frequency, ${t.mx}, is in the row for one of the values.`],
        `${t.mx} is the frequency. The value with that frequency is ${t.mode}, so the mode is ${t.mode}.`, { visual: vis(t) });
    };

    const totalFx = () => {
      const t = make(2, x => x.c.head === 'Goals' || x.c.head === 'Books' || x.c.head === 'Pets');
      const thing = t.c.head.toLowerCase();
      return num(`${intro(t)}\nHow many ${thing} is that altogether?`, t.sfx,
        [`For each row, multiply the number of ${thing} by its frequency. Then add.`, `${fxList(t)}. Work out each part, then add.`],
        `${fxList(t)} = ${t.sfx}.`, { visual: vis(t) });
    };

    const missingF = () => {
      const r = retry(() => {
        const t = make(2), j = R(0, t.vals.length - 1), f = R(1, 9);
        if (t.vals[j] === 0) return null;
        const fs = t.fs.slice(); fs[j] = f;
        const n = sum(fs), S = sum(t.vals.map((v, i) => v * fs[i]));
        if (S % n !== 0) return null;
        const m = S / n;
        if (m === t.vals[j]) return null;
        const mx = Math.max(...fs);
        if (fs.filter(v => v === mx).length > 1) return null;
        return Object.assign({}, t, { fs, j, f, n, m, Sk: S - t.vals[j] * f, Nk: n - f });
      });
      const v = r.vals[r.j];
      return num(`${intro(r)} One frequency is missing.\nThe mean is ${r.m}. Find the missing frequency.`, r.f,
        ['Call the missing frequency k. Write the mean as (total of value × frequency) ÷ (total frequency) and solve.',
          `Without the missing row: total frequency = ${r.Nk} and total of value × frequency = ${r.Sk}. So (${r.Sk} + ${ex([[v, 'k']])}) ÷ (${r.Nk} + k) = ${r.m}.`],
        `${r.Sk} + ${ex([[v, 'k']])} = ${ex([[r.m * r.Nk, ''], [r.m, 'k']])}${v - r.m === 1 ? '' : ` → ${ex([[v - r.m, 'k']])} = ${F(r.m * r.Nk - r.Sk)}`} → k = ${r.f}.`,
        { visual: vis(r, r.j) });
    };

    const which = () => {
      const base = U.sample(U.range(10, 16), R(5, 6)).sort((a, b) => a - b);
      const out = R(35, 75);
      const data = base.concat([out]);
      return choice(`The ages of the people at a party are:\n${data.join(', ')}\nWhich average best shows a typical age?`, 'Median', ['Mean', 'Mode'],
        ['Look for a value that is very different from the others. Does any value appear more than once?',
          `${out} is much bigger than the rest. It pulls the mean up. Every value appears only once.`],
        `The median is best: the mean is pulled up by ${out}, and there is no mode because every value is different.`);
    };

    PMLM.registerSkill({
      id: 'g8.averages', grade: 8, unit: 'g8.u6', title: 'Averages from tables', icon: '📊',
      blurb: 'Mean, median, mode and range from frequency tables',
      lesson: [
        { title: 'The four measures',
          text: '**Mean** = total ÷ how many values.\n**Median** = the middle value when they are in order.\n**Mode** = the most common value.\n**Range** = largest − smallest (it shows how spread out the data is).' },
        { title: 'Reading a frequency table',
          text: 'Frequency means "how many times".\nThis table says 2 matches had 0 goals, 4 matches had 1 goal, and so on.\nThe **mode** is the value with the highest frequency: **2 goals** (not 5!).',
          visual: { type: 'table', headers: ['Goals', 'Frequency'], rows: [['0', '2'], ['1', '4'], ['2', '5'], ['3', '3'], ['4', '1']] } },
        { title: 'Mean from a table',
          text: 'Multiply each value by its frequency (f × x), add them up, then divide by the total frequency.',
          visual: { type: 'table', headers: ['Goals (x)', 'Frequency (f)', 'f × x'], rows: [['0', '2', '0'], ['1', '4', '4'], ['2', '5', '10'], ['3', '3', '9'], ['4', '1', '4'], ['**Total**', '**15**', '**27**']] } },
        { title: 'Median and range from a table',
          text: 'Total frequency 15, so the median is the 8th value (halfway: (15 + 1) ÷ 2 = 8).\nCount down: 2 zeros, then 4 ones (that\'s 6), then the 2s start at the 7th. So the median is **2**.\nRange = 4 − 0 = **4**.' },
        { title: 'Worked example',
          text: 'Find the mean number of goals from the table.\n**1.** f × x: 0, 4, 10, 9, 4.\n**2.** Total of f × x = 27.\n**3.** Total frequency = 15.\n**4.** Mean = 27 ÷ 15 = **1.8 goals**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [mode, range, total, mode],
          [median, mean, spotMode, totalFx, median],
          [mean, missingF, which, median, totalFx],
        ], ctx);
      },
    });
  }

  /* 22 ── Probability */
  {
    const COLS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const bagData = () => retry(() => {
      const k = R(2, 4), cols = U.sample(COLS, k), counts = cols.map(() => R(1, 8));
      const total = sum(counts);
      return total <= 20 && total >= 5 ? { cols, counts, total } : null;
    });
    const bagVis = d => ({ type: 'bag', items: d.cols.map((c, i) => ({ color: c, count: d.counts[i] })) });
    const PRULE = 'Probability = number of ways it can happen ÷ total number of equally likely outcomes.';
    const ofTotal = (k, n) => { const [a, b] = U.simplify(k, n); return a === k ? fr(k, n) : `${fr(k, n)} = ${fr(a, b)}`; };

    const bagP = () => {
      const d = bagData(), i = R(0, d.cols.length - 1);
      return fracQ(`A marble is picked at random from the bag.\nWhat is the probability that it is ${d.cols[i]}?`, d.counts[i], d.total,
        [PRULE, `Count all the marbles: ${d.counts.join(' + ')} = ${d.total}.`],
        `${d.counts[i]} of the ${d.total} marbles ${d.counts[i] === 1 ? 'is' : 'are'} ${d.cols[i]}, so P(${d.cols[i]}) = ${ofTotal(d.counts[i], d.total)}.`, { visual: bagVis(d) });
    };

    const bagNot = () => {
      const d = bagData(), i = R(0, d.cols.length - 1), k = d.total - d.counts[i];
      return fracQ(`A marble is picked at random from the bag.\nWhat is the probability that it is **not** ${d.cols[i]}?`, k, d.total,
        ['P(not A) = 1 − P(A). Or count the marbles that are not that colour.', `P(${d.cols[i]}) = ${fr(d.counts[i], d.total)}. Now work out 1 − ${fr(d.counts[i], d.total)}.`],
        `1 − ${fr(d.counts[i], d.total)} = ${ofTotal(k, d.total)}.`, { visual: bagVis(d) });
    };

    const notDec = () => {
      const p = U.round(R(5, 95) / 100, 2), ev = pick([['it rains tomorrow', 'rain'], ['a team wins its next match', 'win'], ['the bus is late', 'late'], ['a seed grows', 'grows']]);
      return num(`The probability that ${ev[0]} is ${F(p)}.\nWhat is the probability that this does **not** happen?`, U.round(1 - p, 2),
        ['The probabilities of something happening and not happening add up to 1. So P(not A) = 1 − P(A).', `Work out 1 − ${F(p)}.`],
        `1 − ${F(p)} = ${F(U.round(1 - p, 2))}.`);
    };

    const missingTable = () => {
      const cols = U.sample(['Red', 'Blue', 'Green', 'Yellow'], 4);
      const r = retry(() => {
        const ps = [R(1, 8), R(1, 8), R(1, 8)].map(v => v * 5);
        const miss = 100 - sum(ps);
        return miss >= 5 && miss <= 60 ? { ps: ps.map(v => v / 100), miss: miss / 100 } : null;
      });
      const j = R(0, 3), row = [], known = r.ps.slice();
      let k = 0;
      for (let i = 0; i < 4; i++) row.push(i === j ? '?' : F(known[k++]));
      const sk = U.round(sum(r.ps), 2);
      return num(`A spinner can only land on red, blue, green or yellow. The table shows the probabilities.\nWhat is the probability that it lands on ${cols[j].toLowerCase()}?`, r.miss,
        ['The outcomes are mutually exclusive and cover everything, so their probabilities add up to 1.', `The known probabilities add up to ${F(sk)}.`],
        `1 − ${F(sk)} = ${F(r.miss)}.`,
        { visual: { type: 'table', headers: ['Colour'].concat(cols), rows: [['Probability'].concat(row)] } });
    };

    const expected = () => {
      if (Math.random() < 0.5) {
        const p = pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.6, 0.05]), n = pick([20, 40, 60, 80, 100, 120, 200, 300, 500]);
        const e = U.round(p * n, 6);
        if (!Number.isInteger(e)) return expected();
        return num(`The probability that a spinner lands on red is ${F(p)}.\nIt is spun ${n} times. How many times would you expect it to land on red?`, e,
          ['Expected frequency = probability × number of trials.', `Work out ${F(p)} × ${n}.`],
          `${F(p)} × ${n} = ${e}.`);
      }
      const d = bagData(), i = R(0, d.cols.length - 1), times = d.total * R(2, 10);
      return num(`A marble is picked from the bag and put back. This is done ${times} times.\nHow many times would you expect to pick ${d.cols[i]}?`, d.counts[i] * times / d.total,
        ['Expected frequency = probability × number of trials.', `P(${d.cols[i]}) = ${fr(d.counts[i], d.total)}. Now work out ${fr(d.counts[i], d.total)} × ${times}.`],
        `${fr(d.counts[i], d.total)} × ${times} = ${d.counts[i] * times / d.total}.`, { visual: bagVis(d) });
    };

    const bagOr = () => {
      const d = retry(() => { const x = bagData(); return x.cols.length >= 3 ? x : null; });
      const [i, j] = U.sample(U.range(0, d.cols.length - 1), 2), k = d.counts[i] + d.counts[j];
      return fracQ(`A marble is picked at random from the bag.\nWhat is the probability that it is ${d.cols[i]} or ${d.cols[j]}?`, k, d.total,
        ['A marble cannot be two colours at once, so these events are mutually exclusive: add their probabilities.', `P(${d.cols[i]}) = ${fr(d.counts[i], d.total)} and P(${d.cols[j]}) = ${fr(d.counts[j], d.total)}. Now add them.`],
        `${fr(d.counts[i], d.total)} + ${fr(d.counts[j], d.total)} = ${ofTotal(k, d.total)}.`, { visual: bagVis(d) });
    };

    const spinner = () => {
      const n = pick([5, 6, 8, 10, 12]), cols = U.sample(['red', 'blue', 'green', 'yellow'], 3);
      const sectors = U.range(1, n).map(() => ({ color: pick(cols) }));
      const c = pick(sectors).color, k = sectors.filter(s => s.color === c).length;
      if (k === n) return spinner();
      return fracQ(`The spinner has ${n} equal sections. What is the probability that it lands on ${c}?`, k, n,
        [PRULE, `There are ${n} equal sections. Count the ${c} ones.`],
        `${k} of the ${n} sections ${k === 1 ? 'is' : 'are'} ${c}, so P(${c}) = ${ofTotal(k, n)}.`, { visual: { type: 'spinner', sectors } });
    };

    const sampleSpace = () => {
      const r = retry(() => {
        const a = R(3, 6), b = R(3, 6), op = pick(['total', 'total', 'product']);
        const outs = [];
        for (let i = 1; i <= a; i++) for (let j = 1; j <= b; j++) outs.push(op === 'total' ? i + j : i * j);
        const t = pick(['eq', 'gt', 'even']);
        let cond, test;
        if (t === 'eq') { const v = pick(outs); cond = `the ${op} is ${v}`; test = x => x === v; }
        else if (t === 'gt') { const v = R(3, Math.max(...outs) - 1); cond = `the ${op} is more than ${v}`; test = x => x > v; }
        else { cond = `the ${op} is even`; test = x => x % 2 === 0; }
        const k = outs.filter(test).length;
        return k > 0 && k < outs.length ? { a, b, op, cond, k, n: outs.length } : null;
      });
      const sym = r.op === 'total' ? '+' : '×';
      const rows = U.range(1, r.a).map(i => [String(i)].concat(U.range(1, r.b).map(() => '')));
      return fracQ(`Two fair spinners are spun. Spinner A is numbered 1 to ${r.a}; spinner B is numbered 1 to ${r.b}. The two scores are ${r.op === 'total' ? 'added' : 'multiplied'}.\nWhat is the probability that ${r.cond}?`, r.k, r.n,
        [`Make a sample space table: write every ${r.op} in the grid. Each cell is equally likely.`, `There are ${r.a} × ${r.b} = ${r.n} outcomes. Fill in the grid and count the ones where ${r.cond}.`],
        `${r.k} of the ${r.n} outcomes ${r.k === 1 ? 'works' : 'work'}, so the probability is ${ofTotal(r.k, r.n)}.`,
        { visual: { type: 'table', headers: [`A ${sym} B`].concat(U.range(1, r.b).map(String)), rows } });
    };

    const coinDice = () => {
      const EV = [['an even number', 3], ['an odd number', 3], ['a number greater than 4', 2], ['a number less than 3', 2], ['a 6', 1], ['a prime number', 3], ['a multiple of 3', 2]];
      const [e, k] = pick(EV), side = pick(['heads', 'tails']);
      return fracQ(`A fair coin is flipped and a fair six-sided dice is rolled.\nWhat is the probability of getting ${side} and ${e}?`, k, 12,
        ['List all the possible outcomes (the sample space): H1, H2, … , T6.', `There are 2 × 6 = 12 equally likely outcomes. Count the ones with ${side} and ${e}.`],
        `${k} of the 12 outcomes ${k === 1 ? 'works' : 'work'}, so the probability is ${ofTotal(k, 12)}.`);
    };

    const exclusive = () => {
      const E = { 'an even number': [2, 4, 6], 'an odd number': [1, 3, 5], 'a prime number': [2, 3, 5], 'a number more than 4': [5, 6], 'a number less than 3': [1, 2], 'a multiple of 3': [3, 6], 'a 6': [6], 'a 1': [1] };
      const names = Object.keys(E);
      const pairs = [];
      for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) pairs.push([names[i], names[j], E[names[i]].some(v => E[names[j]].includes(v))]);
      const good = pick(pairs.filter(p => !p[2])), bad = U.sample(pairs.filter(p => p[2]), 3);
      const s = p => `${p[0]} and ${p[1]}`;
      const orList = a => (a.length === 1 ? `${a[0]}` : `${a.slice(0, -1).join(', ')} or ${a[a.length - 1]}`);
      const b0 = bad[0];
      return choice('A fair dice is rolled once. Which pair of events are **mutually exclusive**?', s(good), bad.map(s),
        ['Mutually exclusive events cannot happen at the same time: they have no outcomes in common.', `Check one pair: ${b0[0]} means ${orList(E[b0[0]])}; ${b0[1]} means ${orList(E[b0[1]])}. Do they share a number?`],
        `${good[0][0].toUpperCase() + good[0].slice(1)} means ${orList(E[good[0]])}; ${good[1]} means ${orList(E[good[1]])}. They share no numbers, so they are mutually exclusive.`);
    };

    const spotNot = () => {
      const a = R(1, 8), b = R(1, 9), p = U.round((10 * a + b) / 100, 2), wrong = U.round((10 * (10 - a) + (10 - b)) / 100, 2), who = U.name();
      if (wrong === U.round(1 - p, 2) || wrong >= 1) return spotNot();
      return num(`The probability that ${who} wins a game is ${F(p)}.\n${who} says the probability of not winning is ${F(wrong)}. What is the correct probability?`, U.round(1 - p, 2),
        [`P(not winning) = 1 − P(winning). Check: ${F(p)} + ${F(wrong)} should equal 1. Does it?`, `Work out 1.00 − ${F(p, 2)} carefully (you can count up from ${F(p, 2)} to 1).`],
        `1 − ${F(p)} = ${F(U.round(1 - p, 2))}. Check: ${F(p)} + ${F(U.round(1 - p, 2))} = 1 ✓`);
    };

    const expectedMissing = () => {
      const r = retry(() => {
        const a = R(1, 8) * 5, b = R(1, 8) * 5, c = 100 - a - b, n = pick([20, 40, 60, 80, 100, 200]);
        return c >= 5 && Number.isInteger(c * n / 100) ? { a: a / 100, b: b / 100, c: c / 100, n } : null;
      });
      return num(`A spinner lands on red, blue or green. P(red) = ${F(r.a)} and P(blue) = ${F(r.b)}.\nIt is spun ${r.n} times. How many times would you expect green?`, U.round(r.c * r.n, 6),
        ['First find P(green): the three probabilities add up to 1. Then expected frequency = probability × number of spins.', `P(green) = 1 − ${F(r.a)} − ${F(r.b)} = ${F(r.c)}.`],
        `P(green) = ${F(r.c)}, and ${F(r.c)} × ${r.n} = ${F(U.round(r.c * r.n, 6))}.`);
    };

    PMLM.registerSkill({
      id: 'g8.probability', grade: 8, unit: 'g8.u6', title: 'Probability', icon: '🪙',
      blurb: 'P(not A), mutually exclusive events, expected results',
      lesson: [
        { title: 'Probability as a fraction',
          text: 'Probability goes from 0 (impossible) to 1 (certain).\nP(event) = {number of ways it can happen/total number of outcomes}\nThis bag: P(red) = {3/10}.',
          visual: { type: 'bag', items: [{ color: 'red', count: 3 }, { color: 'blue', count: 5 }, { color: 'green', count: 2 }] } },
        { title: 'Not happening',
          text: 'Something either happens or it doesn\'t, so:\n**P(not A) = 1 − P(A)**\nP(rain) = 0.3 → P(no rain) = 1 − 0.3 = 0.7' },
        { title: 'Mutually exclusive events',
          text: '**Mutually exclusive** events cannot happen at the same time (like getting red and getting blue with one pick).\nFor them: P(A or B) = P(A) + P(B).\nProbabilities of all the possible outcomes add up to 1.',
          visual: { type: 'table', headers: ['Colour', 'Red', 'Blue', 'Green'], rows: [['Probability', '0.35', '0.4', '?']] } },
        { title: 'Expected frequency and sample spaces',
          text: 'Expected frequency = probability × number of trials.\nP(red) = {1/4}, spun 80 times → expect {1/4} × 80 = 20 reds.\nFor two events, list every outcome in a **sample space** table.',
          visual: { type: 'table', headers: ['+', '1', '2', '3'], rows: [['1', '2', '3', '4'], ['2', '3', '4', '5'], ['3', '4', '5', '6']] } },
        { title: 'Worked example',
          text: 'P(red) = 0.35 and P(blue) = 0.4. The only other colour is green. Find P(green).\n**1.** All probabilities add up to 1.\n**2.** 0.35 + 0.4 = 0.75.\n**3.** P(green) = 1 − 0.75 = **0.25**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [bagP, bagP, bagNot, notDec, spinner],
          [missingTable, expected, bagOr, spinner, notDec, bagNot],
          [sampleSpace, sampleSpace, coinDice, exclusive, spotNot, expectedMissing],
        ], ctx);
      },
    });
  }
})();
