// Play More Learn More — Cambridge Lower Secondary Stage 9 (Grade 9, age ~14).
// 6 units, 23 skills. See src/CONTRACT.md for the shapes used here.
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
    const w = [...new Set(wrongs.map(String))].filter(x => x !== a && x !== '' && !/NaN|undefined|Infinity/.test(x));
    if (!w.length) throw new Error('choice with no distractors: ' + q);
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
  const coord = (q, x, y, hints, explain, extra) =>
    Object.assign({ q, kind: 'coord', answer: [U.clean(x), U.clean(y)], hints, explain }, extra || {});
  const money = (cur, x) => cur + (Number.isInteger(U.clean(x)) ? F(x) : F(x, 2));
  const ex = terms => U.expr(terms);
  const sum = arr => arr.reduce((s, v) => s + v, 0);
  const pw = (b, e) => `${b}^{${F(e)}}`;                  // 2^{−3}
  const isSq = n => Number.isInteger(Math.sqrt(n));

  // ═══════════════════════ Unit 1: Number ═══════════════════════
  PMLM.registerUnit({ id: 'g9.u1', grade: 9, name: 'Powers and accuracy', icon: '⚡' });

  /* 1 ── Indices and the index laws */
  {
    // monomial like 15x^{6}
    const mono = (c, e, v = 'x') => (c === 1 ? '' : c === -1 ? M : F(c)) + (e === 0 ? (Math.abs(c) === 1 ? '1' : '') : e === 1 ? v : `${v}^{${F(e)}}`);

    const missing = L => {
      const b = pick(L === 1 ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [2, 3, 5, 7, 10, 'a', 'x', 'y']);
      const t = R(1, 3);
      let m, n;
      if (L === 1) { m = R(2, 9); n = R(2, 9); if (t === 2 && m <= n) [m, n] = [n + 1, m]; if (t === 3) { m = R(2, 5); n = R(2, 4); } }
      else {
        m = nz(-6, 9); n = nz(-6, 9);
        if (m > 0 && n > 0) { if (coin()) m = -m; else n = -n; }
        if (t === 3) { m = nz(-5, 5); n = nz(-4, 4); if (m > 0 && n > 0) m = -m; }
      }
      if (t === 1) {
        return num(`${pw(b, m)} × ${pw(b, n)} = ${b}^{□}\nFind the missing index.`, m + n,
          ['When you multiply powers of the same base, **add** the indices.', `${pw(b, m)} × ${pw(b, n)} = ${b}^{${F(m)} + ${P(n)}}. Now add.`],
          `Add the indices: ${F(m)} + ${P(n)} = ${F(m + n)}. So the missing index is ${F(m + n)}.`);
      }
      if (t === 2) {
        return num(`${pw(b, m)} ÷ ${pw(b, n)} = ${b}^{□}\nFind the missing index.`, m - n,
          ['When you divide powers of the same base, **subtract** the indices.', `${pw(b, m)} ÷ ${pw(b, n)} = ${b}^{${F(m)} − ${P(n)}}. Now subtract carefully.`],
          `Subtract the indices: ${F(m)} − ${P(n)} = ${F(m - n)}. So the missing index is ${F(m - n)}.`);
      }
      return num(`(${pw(b, m)})^{${F(n)}} = ${b}^{□}\nFind the missing index.`, m * n,
        ['For a power of a power, **multiply** the indices.', `(${pw(b, m)})^{${F(n)}} = ${b}^{${F(m)} × ${P(n)}}. Now multiply${m < 0 || n < 0 ? ', using the sign rules' : ''}.`],
        `Multiply the indices: ${F(m)} × ${P(n)} = ${F(m * n)}. So the missing index is ${F(m * n)}.`);
    };

    const NEG = [[2, 5], [3, 4], [4, 3], [5, 3], [10, 3], [6, 2], [7, 2], [8, 2], [9, 2]];
    const zeroNeg = L => {
      if (L === 1 && coin()) {
        const b = pick([7, 13, 25, 99, 250, 1000]);
        return num(`Work out ${b}^{0}`, 1,
          ['Think of the pattern: each time the index goes down by 1, you divide by the base.', `${b}^{1} = ${b}. Divide by ${b} once more to get ${b}^{0}.`],
          `Any number (except 0) to the power 0 is 1. So ${b}^{0} = 1.`);
      }
      const [b, mx] = pick(NEG), n = R(2, mx), v = Math.pow(b, n);
      const q = `Work out ${pw(b, -n)}`;
      const hints = ['A negative index means "1 over" the positive power. It does **not** make the answer negative.', `${pw(b, -n)} = 1 ÷ ${pw(b, n)}. Work out ${pw(b, n)} first.`];
      const exp = `${pw(b, -n)} = 1 ÷ ${pw(b, n)} = ${fr(1, v)}.`;
      if (coin()) return fracQ(q + '\nGive your answer as a fraction.', 1, v, hints, exp);
      return choice(q, fr(1, v), [`${M}${v}`, fr(1, b * n), `${M}${b * n}`, fr(-1, v)], hints, exp);
    };

    const algebra = () => {
      const t = R(1, 3);
      if (t === 1) {
        const a = R(2, 6), b = R(2, 6), m = R(2, 6), n = m === 2 ? R(3, 5) : R(2, 5);
        const ans = mono(a * b, m + n);
        return choice(`Simplify ${mono(a, m)} × ${mono(b, n)}`, ans,
          [mono(a + b, m + n), mono(a * b, m * n), mono(a + b, m * n)],
          ['Multiply the numbers. Then add the indices of x.', `Numbers: ${a} × ${b} = ${a * b}. Now deal with x^{${m}} × x^{${n}}.`],
          `${a} × ${b} = ${a * b} and x^{${m}} × x^{${n}} = x^{${m + n}}. So the answer is ${ans}.`);
      }
      if (t === 2) {
        const a = R(2, 5), m = R(2, 5), k = pick([2, 2, 3]);
        const ak = Math.pow(a, k), ans = mono(ak, m * k);
        return choice(`Simplify (${mono(a, m)})^{${k}}`, ans,
          [mono(a, m * k), mono(a * k, m * k), mono(ak, m + k), mono(a * k, m + k), mono(a, m + k)],
          ['Everything inside the bracket gets the power: the number and the x part.', `The number: ${a}^{${k}} = ${ak}. Now work out (x^{${m}})^{${k}}.`],
          `${a}^{${k}} = ${ak} and (x^{${m}})^{${k}} = x^{${m * k}}. So the answer is ${ans}.`);
      }
      const b = R(2, 6), a = R(2, 6), n = R(2, 4), m = n + R(2, 5);
      const ans = mono(a, m - n);
      return choice(`Simplify ${mono(a * b, m)} ÷ ${mono(b, n)}`, ans,
        [mono(a * b - b, m - n), mono(a, m + n), mono(a * b - b, m + n), mono(a * b * b, m - n)],
        ['Divide the numbers. Then subtract the indices of x.', `Numbers: ${a * b} ÷ ${b} = ${a}. Now deal with x^{${m}} ÷ x^{${n}}.`],
        `${a * b} ÷ ${b} = ${a} and x^{${m}} ÷ x^{${n}} = x^{${m - n}}. So the answer is ${ans}.`);
    };

    const spot = () => {
      const [b, mx] = pick(NEG), n = R(2, mx), v = Math.pow(b, n), who = U.name();
      const wrong = coin() ? `${M}${v}` : `${M}${b * n}`;
      return fracQ(`${who} says ${pw(b, -n)} = ${wrong}.\nWhat is the correct value? Give it as a fraction.`, 1, v,
        ['A negative index never makes the answer negative. It means "1 over".', `${pw(b, -n)} = 1 ÷ ${pw(b, n)}. Work out ${pw(b, n)}.`],
        `${pw(b, -n)} = 1 ÷ ${pw(b, n)} = ${fr(1, v)}. ${who} wrongly made the answer negative.`);
    };

    const fracBase = () => {
      const [p, q] = pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [1, 2], [1, 3], [5, 6], [3, 7]]);
      const k = pick([1, 2, 2, 3]);
      const n = Math.pow(q, k), d = Math.pow(p, k);
      const flip = p === 1 ? `${q}^{${k}}` : `(${fr(q, p)})^{${k}}`;
      return fracQ(`Work out (${fr(p, q)})^{${F(-k)}}${p === 1 ? '' : '\nGive your answer as a fraction.'}`, n, d,
        ['A negative index means take the reciprocal (turn the fraction upside down), then use the positive power.', `Flip the fraction: (${fr(p, q)})^{${F(-k)}} = ${flip}.`],
        `(${fr(p, q)})^{${F(-k)}} = ${flip} = ${d === 1 ? n : fr(n, d)}.`);
    };

    const findN = () => {
      const [b, mx] = pick(NEG), n = R(2, mx), v = Math.pow(b, n);
      if (coin()) {
        return num(`Find n.\n${b}^{n} = ${fr(1, v)}`, -n,
          ['"1 over" a power means the index is negative.', `${v} = ${pw(b, n)}, so ${fr(1, v)} = 1 ÷ ${pw(b, n)}. Write this with a negative index.`],
          `${fr(1, v)} = 1 ÷ ${pw(b, n)} = ${pw(b, -n)}, so n = ${F(-n)}.`);
      }
      return num(`Find n.\n${b}^{n} = 1`, 0,
        ['Which index always gives the answer 1?', `${b}^{1} = ${b}. To get from ${b} to 1, divide by ${b} once more, so the index goes down by 1.`],
        `Any number (except 0) to the power 0 is 1, so n = 0.`);
    };

    const combined = () => {
      const b = pick([2, 2, 3, 5, 10]);
      const target = b === 2 ? R(-4, 3) : R(-2, 2);
      const m = R(3, 8), k = R(2, 9), n = target - m + k;
      if (n === 0) return null;
      const q = `Work out ${pw(b, m)} × ${pw(b, n)} ÷ ${pw(b, k)}`;
      const hints = ['Combine into one power of ' + b + ' first: add for ×, subtract for ÷.', `${pw(b, m)} × ${pw(b, n)} = ${pw(b, m + n)}. Now divide by ${pw(b, k)}.`];
      const val = Math.pow(b, Math.abs(target));
      const exp = `The index is ${F(m)} + ${P(n)} − ${k} = ${F(target)}, so the answer is ${pw(b, target)} = ${target < 0 ? fr(1, val) : F(val)}.`;
      if (target < 0) return fracQ(q + '\nGive your answer as a fraction.', 1, val, hints, exp);
      return num(q, val, hints, exp);
    };

    PMLM.registerSkill({
      id: 'g9.indices', grade: 9, unit: 'g9.u1', title: 'Indices and index laws', icon: '⚡',
      blurb: 'Positive, zero and negative powers and the laws',
      lesson: [
        { title: 'The three index laws',
          text: 'For powers of the **same base**:\n• Multiply → **add** the indices\n• Divide → **subtract** the indices\n• Power of a power → **multiply** the indices',
          visual: { type: 'table', headers: ['Law', 'Example'], rows: [['a^{m} × a^{n} = a^{m + n}', '5^{3} × 5^{4} = 5^{7}'], ['a^{m} ÷ a^{n} = a^{m − n}', '5^{6} ÷ 5^{2} = 5^{4}'], ['(a^{m})^{n} = a^{mn}', '(5^{2})^{3} = 5^{6}']] } },
        { title: 'The zero index',
          text: 'Each time the index goes down by 1, you divide by the base.\nFollow the pattern: 2^{3} = 8, 2^{2} = 4, 2^{1} = 2, so **2^{0} = 1**.\nAny number (except 0) to the power 0 is 1.',
          visual: { type: 'sequence', terms: ['8', '4', '2', '?'], step: '÷ 2' } },
        { title: 'Negative indices',
          text: 'Keep going down the pattern: 2^{−1} = {1/2}, 2^{−2} = {1/4}, 2^{−3} = {1/8}.\nSo a^{−n} = 1 ÷ a^{n}.\n**Careful:** 2^{−3} is **not** −8. A negative index means "1 over", not "negative".' },
        { title: 'Algebra uses the same laws',
          text: 'Deal with the numbers and the letters separately.\n3x^{4} × 5x^{2} = 15x^{6} (multiply 3 × 5, add 4 + 2)\n(2x^{3})^{2} = 4x^{6} (square the 2 as well!)' },
        { title: 'Worked example',
          text: 'Work out 5^{7} × 5^{−2} ÷ 5^{8}.\n**1.** Multiply → add: 7 + (−2) = 5, so 5^{5}.\n**2.** Divide → subtract: 5 − 8 = −3, so 5^{−3}.\n**3.** Negative index means "1 over": 5^{−3} = 1 ÷ 5^{3} = 1 ÷ 125.\nAnswer: **{1/125}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [missing, missing, zeroNeg, zeroNeg],
          [missing, zeroNeg, algebra, algebra, spot],
          [() => retry(combined), fracBase, findN, algebra, missing],
        ], ctx);
      },
    });
  }

  /* 2 ── Standard form */
  {
    const sf = (a, n) => `${F(a)} × 10^{${F(n)}}`;
    const val = (a, n) => U.clean(a * Math.pow(10, n));
    const mant = () => (coin() ? R(11, 99) / 10 : R(101, 999) / 100);   // 1.1 … 9.99
    const fixA = a => U.clean(a);

    const toSF = L => {
      const small = L >= 2 && coin();
      const a = fixA(mant());
      const n = small ? -R(2, L === 3 ? 7 : 5) : R(3, L === 1 ? 6 : 8);
      const v = val(a, n);
      const hints = small
        ? ['Move the decimal point until the number is between 1 and 10. Moving right gives a **negative** power of 10.', `The first non-zero digit gives ${F(a)}. Count how many places the decimal point moves to get from ${F(v)} to ${F(a)}.`]
        : ['Write a number between 1 and 10, then × a power of 10.', `The number between 1 and 10 is ${F(a)}. Count how many places the decimal point moves to get from ${F(v)} to ${F(a)}.`];
      const exp = `${F(v)} = ${sf(a, n)}, because the decimal point moves ${Math.abs(n)} places${small ? ' to the right' : ''}.`;
      if (coin()) return num(`Write ${F(v)} in standard form.\n${F(v)} = ${F(a)} × 10^{□}`, n, hints, exp);
      return choice(`Write ${F(v)} in standard form.`, sf(a, n),
        [sf(U.clean(a * 10), n - 1), sf(a, n + 1), sf(a, n - 1), sf(U.clean(a / 10), n + 1), sf(a, -n)], hints, exp);
    };

    const fromSF = L => {
      const small = L >= 2 && coin();
      const a = fixA(mant());
      const n = small ? -R(1, 5) : R(2, L === 1 ? 5 : 7);
      const v = val(a, n);
      return num(`Write ${sf(a, n)} as an ordinary number.`, v,
        [small ? 'A negative power of 10 makes the number **smaller**: move the decimal point to the left.' : 'A positive power of 10 makes the number **bigger**: move the decimal point to the right.',
          `Start with ${F(a)} and move the decimal point ${Math.abs(n)} places to the ${small ? 'left' : 'right'}, filling gaps with zeros.`],
        `${sf(a, n)} = ${F(v)}.`);
    };

    const compare = L => {
      const items = retry(() => {
        const base = R(-3, 6), out = [];
        for (let i = 0; i < 4; i++) out.push([fixA(R(11, 98) / 10), base + R(0, 2)]);
        const vals = out.map(([a, n]) => val(a, n));
        if (new Set(vals).size < 4) return null;
        if (new Set(out.map(o => o[1])).size < 2) return null;
        return out;
      });
      const big = coin();
      const vals = items.map(([a, n]) => val(a, n));
      const target = big ? Math.max(...vals) : Math.min(...vals);
      const ans = items[vals.indexOf(target)];
      return choice(`Which number is the ${big ? 'largest' : 'smallest'}?`, sf(...ans), items.filter(x => x !== ans).map(x => sf(...x)),
        ['Compare the powers of 10 first. The bigger power of 10 means the bigger number.', 'If two numbers have the same power of 10, compare the numbers in front.'],
        `The ${big ? 'largest' : 'smallest'} is ${sf(...ans)} = ${F(val(...ans))}.`);
    };

    const isSF = () => {
      const a = fixA(mant()), n = nz(-6, 8), d = R(1, 9), big = R(11, 95);
      return choice('Which number is written in standard form?', sf(a, n),
        [sf(big, n), `0.${d} × 10^{${F(n)}}`, `${F(a)} × 100^{${F(n)}}`, sf(big * 10, n)],
        ['Standard form is A × 10^{n} where A is at least 1 and less than 10.', 'Check the first number in each one: is it between 1 and 10? Is it multiplied by a power of **10**?'],
        `${sf(a, n)} is in standard form because ${F(a)} is between 1 and 10.`);
    };

    const multiply = () => {
      const a = R(2, 9), b = R(2, 9), m = R(2, 8), n = R(2, 8) * (coin() ? 1 : -1);
      const p = a * b;
      const [A1, E1] = p >= 10 ? [U.clean(p / 10), m + n + 1] : [p, m + n];
      return choice(`Work out (${sf(a, m)}) × (${sf(b, n)}).\nGive your answer in standard form.`, sf(A1, E1),
        [p >= 10 ? sf(p, m + n) : sf(U.clean(p * 10), m + n - 1), sf(A1, m + n === E1 ? E1 + 1 : m + n), sf(A1, m * n), sf(a + b, m + n)],
        ['Multiply the numbers, then multiply the powers of 10 by **adding** the indices.', `${a} × ${b} = ${p} and 10^{${m}} × 10^{${F(n)}} = 10^{${F(m + n)}}.${p >= 10 ? ' Is ' + p + ' between 1 and 10?' : ''}`],
        `${a} × ${b} = ${p}, and 10^{${m}} × 10^{${F(n)}} = 10^{${F(m + n)}}.${p >= 10 ? ` ${p} × 10^{${F(m + n)}} = ${sf(A1, E1)}.` : ''} Answer: ${sf(A1, E1)}.`);
    };

    const divide = () => {
      const b = R(2, 9), c = R(2, 9), a = b * c > 9 ? null : b * c;
      const m = R(4, 9), n = R(1, 3);
      if (a) {
        return choice(`Work out (${sf(a, m)}) ÷ (${sf(b, n)}).\nGive your answer in standard form.`, sf(c, m - n),
          [sf(c, m + n), sf(a - b, m - n), sf(c, Math.round(m / n) === m / n ? m / n : m - n + 1)],
          ['Divide the numbers, then divide the powers of 10 by **subtracting** the indices.', `${a} ÷ ${b} = ${c}. Now work out 10^{${m}} ÷ 10^{${n}}.`],
          `${a} ÷ ${b} = ${c} and 10^{${m}} ÷ 10^{${n}} = 10^{${m - n}}. Answer: ${sf(c, m - n)}.`);
      }
      // a < b case: e.g. (2 × 10^8) ÷ (5 × 10^3) = 0.4 × 10^5 = 4 × 10^4
      const [x, y, q] = pick([[2, 5, 0.4], [1, 2, 0.5], [3, 5, 0.6], [1, 4, 0.25], [3, 4, 0.75], [2, 4, 0.5], [4, 5, 0.8], [1, 5, 0.2]]);
      const qq = U.clean(q * 10);
      return choice(`Work out (${sf(x, m)}) ÷ (${sf(y, n)}).\nGive your answer in standard form.`, sf(qq, m - n - 1),
        [`${F(q)} × 10^{${m - n}}`, sf(qq, m - n), sf(qq, m - n + 1), sf(qq, m + n - 1)],
        ['Divide the numbers and subtract the indices. Then check the first number is between 1 and 10.', `${x} ÷ ${y} = ${F(q)}, and 10^{${m}} ÷ 10^{${n}} = 10^{${m - n}}. But ${F(q)} is less than 1, so adjust it.`],
        `${F(q)} × 10^{${m - n}} = ${sf(qq, m - n - 1)}, because ${F(q)} = ${qq} × 10^{${M}1}.`);
    };

    const context = () => {
      const t = R(1, 3);
      if (t === 1) {
        const a = fixA(R(11, 99) / 10), n = -R(4, 7), v = val(a, n);
        return choice(`A grain of pollen is ${F(v)} m wide.\nWrite this in standard form.`, sf(a, n),
          [sf(a, -n), sf(a, n + 1), sf(a, n - 1), sf(U.clean(a * 10), n - 1)],
          ['A small number has a **negative** power of 10.', `The number between 1 and 10 is ${F(a)}. Count how many places the decimal point moves.`],
          `The decimal point moves ${-n} places to the right, so ${F(v)} m = ${sf(a, n)} m.`);
      }
      if (t === 2) {
        const a = fixA(R(11, 99) / 10), n = R(6, 9), v = val(a, n);
        return num(`The population of a region is ${sf(a, n)} people.\nWrite this as an ordinary number.`, v,
          ['10^{' + n + '} means move the decimal point ' + n + ' places to the right.', `Start with ${F(a)} and move the decimal point ${n} places to the right.`],
          `${sf(a, n)} = ${F(v)} people.`);
      }
      const s = 3, sec = R(2, 6), e = R(2, 3), tot = s * sec, [A1, E1] = tot >= 10 ? [U.clean(tot / 10), 5 + e + 1] : [tot, 5 + e];
      return choice(`Light travels about 3 × 10^{5} km in one second.\nHow far does it travel in ${sf(sec, e)} seconds?`, sf(A1, E1) + ' km',
        [sf(tot, 5 + e) + ' km', sf(A1, 5 * e) + ' km', sf(3 + sec, 5 + e) + ' km', sf(A1, E1 + 1) + ' km'],
        ['Distance = speed × time. Multiply the numbers, add the indices.', `3 × ${sec} = ${tot} and 10^{5} × 10^{${e}} = 10^{${5 + e}}.`],
        `3 × ${sec} = ${tot}, 10^{5} × 10^{${e}} = 10^{${5 + e}}, so the distance is ${sf(A1, E1)} km.`);
    };

    PMLM.registerSkill({
      id: 'g9.standardForm', grade: 9, unit: 'g9.u1', title: 'Standard form', icon: '🔭',
      blurb: 'Write, convert and compare very big and small numbers',
      lesson: [
        { title: 'What is standard form?',
          text: 'A number in standard form looks like **A × 10^{n}**.\n• A is at least 1 and less than 10\n• n is a whole number (it can be negative)\n45 000 = 4.5 × 10^{4}',
          visual: { type: 'placeValue', value: '45000', highlight: 0 } },
        { title: 'Big numbers',
          text: 'Put the decimal point after the first digit, then count how many places it moved.\n3 200 000 → 3.2 (the point moved 6 places)\nSo 3 200 000 = 3.2 × 10^{6}.' },
        { title: 'Small numbers',
          text: 'For numbers less than 1, the power of 10 is **negative**.\n0.000 72 → 7.2 (the point moved 4 places to the right)\nSo 0.000 72 = 7.2 × 10^{−4}.\n**Check:** 45 × 10^{3} is **not** standard form, because 45 is bigger than 10.' },
        { title: 'Comparing and calculating',
          text: 'To compare, look at the power of 10 first: 2 × 10^{5} is bigger than 9 × 10^{4}.\nTo multiply, multiply the numbers and add the indices. Then make sure A is between 1 and 10.' },
        { title: 'Worked example',
          text: 'Work out (4 × 10^{3}) × (5 × 10^{6}).\n**1.** Multiply the numbers: 4 × 5 = 20.\n**2.** Add the indices: 10^{3} × 10^{6} = 10^{9}. So far: 20 × 10^{9}.\n**3.** 20 is not between 1 and 10: 20 = 2 × 10^{1}.\nAnswer: **2 × 10^{10}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [toSF, toSF, fromSF, fromSF, isSF],
          [toSF, fromSF, compare, compare, isSF, context],
          [multiply, divide, compare, toSF, context, fromSF],
        ], ctx);
      },
    });
  }

  /* 3 ── Rational and irrational numbers, simple surds */
  {
    const RAT = [['√4', '√4 = 2 = {2/1}'], ['√9', '√9 = 3 = {3/1}'], ['√25', '√25 = 5'], ['√49', '√49 = 7'], ['√100', '√100 = 10'],
      ['0.~{3}', '0.~{3} = {1/3}'], ['0.~{18}', '0.~{18} = {2/11}'], [fr(2, 7), 'it is already a fraction'], [fr(5, 9), 'it is already a fraction'],
      ['3.14', '3.14 = {314/100}'], [`${M}5`, `${M}5 = {${M}5/1}`], ['0.125', '0.125 = {1/8}'], ['1.~{6}', '1.~{6} = {5/3}'], ['√64', '√64 = 8']];
    const IRR = [['√2', '2 is not a square number'], ['√3', '3 is not a square number'], ['√5', '5 is not a square number'],
      ['√7', '7 is not a square number'], ['√8', '8 is not a square number'], ['√10', '10 is not a square number'],
      ['√15', '15 is not a square number'], ['√20', '20 is not a square number'], ['π', 'its decimals go on forever without repeating'],
      ['√50', '50 is not a square number'], ['√99', '99 is not a square number']];

    const whichIrr = () => {
      const ans = pick(IRR);
      const traps = U.sample(RAT.filter(r => ['3.14', '0.~{3}', '1.~{6}', '√49', '√64'].includes(r[0])), 1);
      const wr = [...traps, ...U.sample(RAT.filter(r => !traps.includes(r)), 2)];
      return choice('Which number is **irrational**?', ans[0], wr.map(r => r[0]),
        ['A rational number can be written as a fraction of two whole numbers. Roots of square numbers, and decimals that stop or repeat, are rational.',
          `For example, ${wr[0][0]} is rational: ${wr[0][1]}. Check the other numbers the same way.`],
        `${ans[0]} is irrational because ${ans[1]}. The others can all be written as fractions.`);
    };

    const whichRat = () => {
      const ans = pick(RAT), wr = U.sample(IRR, 3);
      return choice('Which number is **rational**?', ans[0], wr.map(r => r[0]),
        ['Rational means it can be written as a fraction of two whole numbers.',
          `For example, ${wr[0][0]} is irrational because ${wr[0][1]}. Check the other numbers.`],
        `${ans[0]} is rational: ${ans[1]}. The others are irrational.`);
    };

    const between = L => {
      const n = retry(() => { const v = R(5, L === 3 ? 200 : 99); return isSq(v) ? null : v; });
      const k = Math.floor(Math.sqrt(n)), h = Math.floor(n / 2);
      return choice(`√${n} lies between which two whole numbers?`, `${k} and ${k + 1}`,
        [`${k - 1} and ${k}`, `${k + 1} and ${k + 2}`, `${h} and ${h + 1}`],
        ['Find the square numbers just below and just above ' + n + '.', `${n} is between two square numbers. Try ${k}^{2} = ${k * k}. What is the next square number?`],
        `${k * k} < ${n} < ${(k + 1) * (k + 1)}, so √${k * k} < √${n} < √${(k + 1) * (k + 1)}. That means √${n} is between ${k} and ${k + 1}.`);
    };

    const belowNum = L => {
      const n = retry(() => { const v = R(10, L === 3 ? 300 : 120); return isSq(v) ? null : v; });
      const k = Math.floor(Math.sqrt(n));
      return num(`What is the largest whole number that is less than √${n}?`, k,
        [`Find the biggest square number that is less than ${n}.`, `For example, ${k - 1}^{2} = ${(k - 1) * (k - 1)}, which is less than ${n}. Can you go one higher?`],
        `${k}^{2} = ${k * k} < ${n} but ${k + 1}^{2} = ${(k + 1) * (k + 1)} > ${n}. So √${n} is between ${k} and ${k + 1}, and the answer is ${k}.`);
    };

    const product = () => {
      if (coin()) {
        const a = pick([2, 3, 5, 6, 7, 10, 11, 13]);
        return num(`Work out √${a} × √${a}`, a,
          ['A square root times itself gives the number under the root.', 'For example, √4 × √4 = 2 × 2 = 4, and √9 × √9 = 3 × 3 = 9. The same idea works for every square root.'],
          `√${a} × √${a} = ${a}, because squaring undoes the square root.`);
      }
      const [a, b] = pick([[2, 8], [3, 12], [5, 20], [2, 18], [3, 27], [2, 32], [5, 45], [6, 24], [2, 50], [7, 28]]);
      return num(`Work out √${a} × √${b}`, Math.sqrt(a * b),
        ['You can multiply the numbers under the roots: √a × √b = √(a × b).', `√${a} × √${b} = √(${a} × ${b}) = √${a * b}.`],
        `√${a} × √${b} = √${a * b} = ${Math.sqrt(a * b)}.`);
    };

    const simplify = () => {
      const k = R(2, 5), m = pick([2, 3, 5, 6, 7]), N = k * k * m;
      const ans = `${k}√${m}`;
      const wr = [`${m}√${k}`, `${k * k}√${m}`, `${k + 1}√${m}`, `${k}√${k * m}`];
      if (N % 2 === 0) wr.unshift(`${N / 2}√2`);
      return choice(`Simplify √${N}`, ans, wr,
        ['Look for a **square number** that is a factor. Split the root into two roots.', `${N} = ${k * k} × ${m}, so √${N} = √${k * k} × √${m}.`],
        `√${N} = √${k * k} × √${m} = ${k}√${m}.`);
    };

    const statement = () => {
      const a = pick([2, 3, 5, 7]), b = pick([2, 3, 5, 6].filter(x => x !== a)), s = R(3, 9), d = R(1, 8);
      const TRUE = [`√${a} × √${a} = ${a}`, `√${a * b} = √${a} × √${b}`, 'π is irrational', `0.~{${d}} is rational`, `√${s * s} is rational`];
      const FALSE = [`√${a} + √${b} = √${a + b}`, `√${s * s} is irrational`, `0.~{${d}} is irrational`, `√${a} × √${a} = ${2 * a}`, '3.14 is irrational', `√${a} is rational`];
      const t = pick(TRUE);
      return choice('Which statement is **true**?', t, U.sample(FALSE, 3),
        ['Test each statement carefully. Recurring decimals are rational. Roots of non-square numbers are irrational.',
          'Watch out for adding roots: √9 + √16 = 3 + 4 = 7, but √25 = 5. So √a + √b is **not** √(a + b).'],
        `"${t}" is the true statement.`);
    };

    PMLM.registerSkill({
      id: 'g9.surds', grade: 9, unit: 'g9.u1', title: 'Rational and irrational', icon: '♾️',
      blurb: 'Tell rational from irrational numbers; simple surds',
      lesson: [
        { title: 'Rational numbers',
          text: 'A **rational** number can be written as a fraction {a/b} of two whole numbers.\nWhole numbers, fractions, decimals that stop and decimals that **repeat** are all rational.',
          visual: { type: 'table', headers: ['Number', 'As a fraction'], rows: [['5', '{5/1}'], ['0.75', '{3/4}'], ['0.~{3}', '{1/3}'], ['√16', '{4/1}']] } },
        { title: 'Irrational numbers',
          text: 'An **irrational** number cannot be written as a fraction. Its decimals go on forever **without repeating**.\n√2 = 1.414 213 56…   π = 3.141 592 65…\n√n is irrational unless n is a square number.\n**Careful:** 3.14 is rational. It is only close to π.' },
        { title: 'Estimating square roots',
          text: 'Find the square numbers either side.\n49 < 50 < 64, so 7 < √50 < 8.\n50 is very close to 49, so √50 is just a bit more than 7.',
          visual: { type: 'numberLine', min: 6, max: 9, step: 1, points: [{ at: 7.07, label: '√50' }] } },
        { title: 'Simple surds',
          text: 'An irrational root like √2 is called a **surd**.\n• √a × √a = a, so √3 × √3 = 3\n• √a × √b = √(ab), so √2 × √8 = √16 = 4\n• √12 = √(4 × 3) = 2√3\n**But** √9 + √16 = 7, not √25. You cannot add roots like that.' },
        { title: 'Worked example',
          text: 'Simplify √75.\n**1.** Find a square number that is a factor of 75: 75 = 25 × 3.\n**2.** Split the root: √75 = √25 × √3.\n**3.** √25 = 5.\nAnswer: **5√3**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [whichIrr, whichRat, between, belowNum],
          [whichIrr, between, product, statement, whichRat],
          [simplify, simplify, statement, product, belowNum],
        ], ctx);
      },
    });
  }

  /* 4 ── Rounding, estimation and bounds */
  {
    const sigDigits = x => String(x).replace('-', '').replace('.', '').replace(/^0+/, '');
    const makeX = L => {
      let d; do { d = R(1001, 9999); } while (d % 10 === 0);
      const k = pick(L === 1 ? [-6, -5, -4, -2, 0, 1] : [-7, -6, -5, -4, -3, -2, 0, 1, 2]);
      return U.clean(d * Math.pow(10, k));
    };

    const round = L => {
      const x = makeX(L), n = L === 1 ? pick([1, 2]) : pick([1, 2, 3]), ans = U.sigfig(x, n), s = sigDigits(x);
      return num(`Round ${F(x)} to ${U.s(n, 'significant figure')}.`, ans,
        ['Start counting at the first non-zero digit. Then look at the next digit: 5 or more rounds up.',
          `The first ${n === 1 ? 'significant figure is' : n + ' significant figures are'} ${s.slice(0, n)}, and the next digit is ${s[n]}. Keep the place value the same${x >= 10 ? ' (fill in zeros)' : ''}.`],
        `${F(x)} rounded to ${U.s(n, 'significant figure')} is ${F(ans)}.`);
    };

    const spotSF = () => {
      const x = retry(() => {
        let d; do { d = R(1001, 9999); } while (d % 10 === 0);
        const v = U.clean(d / 100000);
        return U.sigfig(v, 2) !== U.sigfig(v, 3) ? v : null;
      });
      const ans = U.sigfig(x, 3), wrong = U.sigfig(x, 2), who = U.name(), s = sigDigits(x);
      return num(`${who} rounds ${F(x)} to 3 significant figures and gets ${F(wrong)}.\nWhat is the correct answer?`, ans,
        ['Zeros at the start of a decimal are **not** significant. Start counting at the first non-zero digit.',
          `The first significant figure of ${F(x)} is ${s[0]}. Count 3 figures from there, then look at the next digit.`],
        `${who} counted the 0 after the decimal point. The 3 significant figures start at ${s[0]}: ${F(x)} ≈ ${F(ans)}.`);
    };

    const est3 = k => { let v; do { v = R(101, 999); } while (v % 10 === 0); return U.clean(v * Math.pow(10, k)); };
    const estimate = L => {
      if (L === 1 || coin()) {
        const a = est3(pick([-2, -1, 0])), b = est3(pick([-2, -1])), ra = U.sigfig(a, 1), rb = U.sigfig(b, 1), ans = U.clean(ra * rb);
        return num(`Estimate ${F(a)} × ${F(b)} by rounding each number to 1 significant figure.`, ans,
          ['Round each number to 1 significant figure first. Then do the easier calculation.', `${F(a)} ≈ ${F(ra)}. Now round ${F(b)} the same way.`],
          `${F(a)} ≈ ${F(ra)} and ${F(b)} ≈ ${F(rb)}, so the estimate is ${F(ra)} × ${F(rb)} = ${F(ans)}.`);
      }
      const r = retry(() => {
        const rb = pick([0.2, 0.4, 0.5, 2, 4, 5, 20, 30, 40, 50]);
        const ra = R(1, 9) * Math.pow(10, R(2, 3));
        const ans = U.clean(ra / rb);
        if (!Number.isInteger(ans)) return null;
        const a = U.sigfig(ra * (1 + R(-25, 35) / 100), 3), b = U.sigfig(rb * (1 + R(-20, 30) / 100), 2);
        if (U.sigfig(a, 1) !== ra || U.sigfig(b, 1) !== rb || a === ra || b === rb) return null;
        return { a, b, ra, rb, ans };
      });
      return num(`Estimate ${F(r.a)} ÷ ${F(r.b)} by rounding each number to 1 significant figure.`, r.ans,
        ['Round each number to 1 significant figure first. Then do the easier calculation.', `${F(r.a)} ≈ ${F(r.ra)} and ${F(r.b)} ≈ ${F(r.rb)}. Now work out ${F(r.ra)} ÷ ${F(r.rb)}.`],
        `${F(r.ra)} ÷ ${F(r.rb)} = ${F(r.ans)}, so the estimate is ${F(r.ans)}.${r.rb < 1 ? ' (Dividing by a number less than 1 makes the answer bigger.)' : ''}`);
    };

    const CTX = [
      () => ({ thing: 'A pencil is', letter: 'l', u: 1, unit: 'cm', phrase: 'to the nearest centimetre', m: R(8, 19) }),
      () => ({ thing: 'A path is', letter: 'l', u: 10, unit: 'm', phrase: 'to the nearest 10 metres', m: 10 * R(5, 60) }),
      () => ({ thing: 'A bag of rice has a mass of', letter: 'm', u: 0.1, unit: 'kg', phrase: 'correct to 1 decimal place', m: R(11, 99) / 10 }),
      () => ({ thing: 'A parcel has a mass of', letter: 'm', u: 100, unit: 'g', phrase: 'to the nearest 100 grams', m: 100 * R(3, 30) }),
      () => ({ thing: 'A runner\'s time is', letter: 't', u: 0.1, unit: 's', phrase: 'correct to 1 decimal place', m: R(105, 160) / 10 }),
    ];
    const bound = () => {
      const c = pick(CTX)(), lower = coin(), half = U.clean(c.u / 2);
      const lo = U.clean(c.m - half), hi = U.clean(c.m + half), ans = lower ? lo : hi;
      return num(`${c.thing} ${F(c.m)} ${c.unit}, ${c.phrase}.\nWhat is the **${lower ? 'lower' : 'upper'}** bound?`, ans,
        ['The bounds are **half a unit** either side of the rounded value.', `The unit here is ${F(c.u)} ${c.unit}, and half of that is ${F(half)} ${c.unit}. Now ${lower ? 'subtract it from' : 'add it to'} ${F(c.m)}.`],
        `Half of ${F(c.u)} is ${F(half)}. ${F(c.m)} ${lower ? '−' : '+'} ${F(half)} = ${F(ans)} ${c.unit}.`, { unit: c.unit });
    };

    const boundIneq = () => {
      const c = pick(CTX)(), half = U.clean(c.u / 2), v = c.letter;
      const lo = F(U.clean(c.m - half)), hi = F(U.clean(c.m + half));
      return choice(`${c.thing} ${F(c.m)} ${c.unit}, ${c.phrase}. The exact value is ${v} ${c.unit}.\nWhich inequality shows the possible values of ${v}?`, `${lo} ≤ ${v} < ${hi}`,
        [`${lo} ≤ ${v} ≤ ${hi}`, `${lo} < ${v} ≤ ${hi}`, `${F(U.clean(c.m - c.u))} ≤ ${v} < ${F(U.clean(c.m + c.u))}`, `${F(c.m)} ≤ ${v} < ${F(U.clean(c.m + c.u))}`],
        ['Go half a unit down and half a unit up. Think about which end is included.', `Half of ${F(c.u)} is ${F(half)}, so the lower bound is ${lo}. The upper bound itself would round up, so it is not included.`],
        `The lower bound is ${lo} (included) and the upper bound is ${hi} (not included, because it rounds up). So ${lo} ≤ ${v} < ${hi}.`);
    };

    const boundCalc = () => {
      const t = R(1, 3);
      if (t === 1) {
        const s = R(5, 15), up = coin(), side = up ? s + 0.5 : s - 0.5;
        return num(`A square has sides of ${s} cm, to the nearest centimetre.\nWhat is the **${up ? 'upper' : 'lower'}** bound of its perimeter?`, 4 * side,
          [`For the ${up ? 'biggest' : 'smallest'} perimeter, use the ${up ? 'upper' : 'lower'} bound of the side.`, `The ${up ? 'upper' : 'lower'} bound of the side is ${F(side)} cm. A square has 4 sides.`],
          `Perimeter bound = 4 × ${F(side)} = ${F(4 * side)} cm.`, { unit: 'cm' });
      }
      if (t === 2) {
        const a = R(12, 40), b = R(12, 40), up = coin(), ans = up ? a + b + 1 : a + b - 1;
        return num(`Two planks are ${a} cm and ${b} cm long, each to the nearest centimetre. They are put end to end.\nWhat is the **${up ? 'upper' : 'lower'}** bound of the total length?`, ans,
          [`Use the ${up ? 'upper' : 'lower'} bound of each plank, then add.`, `The ${up ? 'upper' : 'lower'} bounds are ${F(up ? a + 0.5 : a - 0.5)} cm and ${F(up ? b + 0.5 : b - 0.5)} cm.`],
          `${F(up ? a + 0.5 : a - 0.5)} + ${F(up ? b + 0.5 : b - 0.5)} = ${ans} cm.`, { unit: 'cm' });
      }
      const a = R(4, 12), b = R(3, 9), ua = a + 0.5, ub = b + 0.5, ans = U.clean(ua * ub);
      return num(`A rectangle is ${a} cm by ${b} cm, each to the nearest centimetre.\nWhat is the **upper** bound of its area?`, ans,
        ['For the biggest area, use the upper bound of both lengths.', `The upper bounds are ${F(ua)} cm and ${F(ub)} cm. Multiply them.`],
        `${F(ua)} × ${F(ub)} = ${F(ans)} cm².`, { unit: 'cm²' });
    };

    PMLM.registerSkill({
      id: 'g9.bounds', grade: 9, unit: 'g9.u1', title: 'Rounding and bounds', icon: '🎯',
      blurb: 'Significant figures, estimates and upper/lower bounds',
      lesson: [
        { title: 'Significant figures',
          text: 'Start counting at the **first non-zero digit**.\nLook at the next digit: 5 or more rounds up.\nFor big numbers, fill in zeros to keep the place value.',
          visual: { type: 'table', headers: ['Number', '1 s.f.', '2 s.f.', '3 s.f.'], rows: [['45 682', '50 000', '46 000', '45 700'], ['0.004 562', '0.005', '0.0046', '0.004 56']] } },
        { title: 'Estimating',
          text: 'Round every number to 1 significant figure, then calculate.\n48.7 × 3.12 ≈ 50 × 3 = 150\n612 ÷ 0.48 ≈ 600 ÷ 0.5 = 1200\n**Tip:** dividing by 0.5 is the same as multiplying by 2.' },
        { title: 'Upper and lower bounds',
          text: 'A pencil is 23 cm long, to the nearest cm.\nIts real length could be anything from **22.5 cm** up to **23.5 cm**.\nThese are the **lower bound** and the **upper bound**: half a unit either side.',
          visual: { type: 'numberLine', min: 22, max: 24, step: 0.5, points: [{ at: 22.5, label: 'lower' }, { at: 23, label: '23' }, { at: 23.5, label: 'upper' }] } },
        { title: 'Writing the bounds',
          text: 'We write 22.5 ≤ l < 23.5.\nThe lower bound is included. The upper bound is **not**, because 23.5 would round up to 24.\nTo 1 decimal place, the unit is 0.1, so go 0.05 either side.' },
        { title: 'Worked example',
          text: 'A square has sides of 8 cm, to the nearest cm. Find the upper bound of its perimeter.\n**1.** Bounds of a side: 7.5 cm and 8.5 cm.\n**2.** The biggest perimeter uses the upper bound: 4 × 8.5.\n**3.** 4 × 8.5 = 34.\nAnswer: **34 cm**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [round, round, estimate, bound],
          [round, spotSF, estimate, bound, bound],
          [boundIneq, boundCalc, boundCalc, estimate, spotSF, round],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 2: Fractions, percentages and proportion ═══════════════════════
  PMLM.registerUnit({ id: 'g9.u2', grade: 9, name: 'Fractions, % and ratio', icon: '🍰' });

  // signed fraction text: −{3/4}
  const sfr = (n, d) => { const [a, b] = U.simplify(n, d); return b === 1 ? F(a) : (a < 0 ? M + fr(-a, b) : fr(a, b)); };
  // signed mixed number text: −1 {3/4}
  const smx = (n, d) => { const [x, y] = U.simplify(n, d); return x < 0 ? M + U.mixed(-x, y) : U.mixed(x, y); };
  // signed fraction text without simplifying
  const sf0 = (n, d) => (n < 0 ? M + fr(-n, d) : fr(n, d));
  // ' = simplest form' only when it looks different
  const eqS = (n, d) => (sf0(n, d) === smx(n, d) ? '' : ` = ${smx(n, d)}`);

  /* 5 ── Calculating with fractions */
  {
    const proper = (dmax = 12) => { const d = R(2, dmax), n = R(1, d - 1); return U.simplify(n, d); };
    const mixedNum = (wmax = 3) => { const [n, d] = proper(9); return [R(1, wmax) * d + n, d]; };
    const OPS = {
      '+': (a, b) => [a[0] * b[1] + b[0] * a[1], a[1] * b[1]],
      '−': (a, b) => [a[0] * b[1] - b[0] * a[1], a[1] * b[1]],
      '×': (a, b) => [a[0] * b[0], a[1] * b[1]],
      '÷': (a, b) => [a[0] * b[1], a[1] * b[0]],
    };
    const commonHint = (a, b) => {
      const l = U.lcm(a[1], b[1]);
      const conv = [a, b].filter(f => f[1] !== l).map(f => `${sf0(f[0], f[1])} = ${sf0(f[0] * l / f[1], l)}`);
      return `The lowest common denominator of ${a[1]} and ${b[1]} is ${l}: ${conv.join(' and ')}.`;
    };

    const addSub = L => retry(() => {
      const a = proper(L === 1 ? 10 : 12), b = proper(L === 1 ? 10 : 12), op = coin() ? '+' : '−';
      if (a[1] === b[1]) return null;
      const [n, d] = U.simplify(...OPS[op](a, b));
      if (n <= 0 || d === 1) return null;
      const l = U.lcm(a[1], b[1]), A1 = a[0] * l / a[1], B1 = b[0] * l / b[1], top = op === '+' ? A1 + B1 : A1 - B1;
      return fracQ(`Work out ${fr(...a)} ${op} ${fr(...b)}\nGive your answer in its simplest form.`, n, d,
        ['Make the denominators the same first. Then ' + (op === '+' ? 'add' : 'subtract') + ' the numerators only.', commonHint(a, b)],
        `${fr(A1, l)} ${op} ${fr(B1, l)} = ${fr(top, l)}${eqS(top, l)}.`, { simplest: true, mixed: n > d });
    });

    const multiply = L => retry(() => {
      const a = L === 1 ? proper(10) : mixedNum(2), b = proper(12);
      const [n, d] = U.simplify(a[0] * b[0], a[1] * b[1]);
      if (d === 1) return null;
      const aTxt = L === 1 ? fr(...a) : smx(...a);
      return fracQ(`Work out ${aTxt} × ${fr(...b)}\nGive your answer in its simplest form.`, n, d,
        [L === 1 ? 'Multiply the numerators, and multiply the denominators. Then simplify.' : 'Change the mixed number to an improper fraction first. Then multiply tops and bottoms.',
          L === 1 ? `Numerators: ${a[0]} × ${b[0]} = ${a[0] * b[0]}. Now multiply the denominators: ${a[1]} × ${b[1]}.` : `${aTxt} = ${fr(...a)}. Now work out ${fr(...a)} × ${fr(...b)}.`],
        `${fr(...a)} × ${fr(...b)} = ${fr(a[0] * b[0], a[1] * b[1])}${eqS(a[0] * b[0], a[1] * b[1])}.`, { simplest: true, mixed: n > d });
    });

    const divide = L => retry(() => {
      const a = L === 1 ? proper(10) : mixedNum(3), b = coin() ? proper(9) : mixedNum(2);
      const [n, d] = U.simplify(a[0] * b[1], a[1] * b[0]);
      if (d === 1) return null;
      const aT = a[0] > a[1] ? smx(...a) : fr(...a), bT = b[0] > b[1] ? smx(...b) : fr(...b);
      const conv = [a, b].filter(x => x[0] > x[1]).map(x => `${smx(...x)} = ${fr(...x)}`);
      return fracQ(`Work out ${aT} ÷ ${bT}\nGive your answer in its simplest form.`, n, d,
        ['To divide by a fraction, multiply by its reciprocal (flip the second fraction).' + (conv.length ? ' Change mixed numbers to improper fractions first.' : ''),
          `${conv.length ? conv.join(' and ') + '. ' : ''}So work out ${fr(...a)} × ${fr(b[1], b[0])}.`],
        `${fr(...a)} ÷ ${fr(...b)} = ${fr(...a)} × ${fr(b[1], b[0])} = ${fr(a[0] * b[1], a[1] * b[0])}${eqS(a[0] * b[1], a[1] * b[0])}.`, { simplest: true, mixed: n > d });
    });

    const mixedAddSub = () => retry(() => {
      const a = mixedNum(4), b = mixedNum(2), op = coin() ? '+' : '−';
      if (a[1] === b[1]) return null;
      const [n, d] = U.simplify(...OPS[op](a, b));
      if (n <= d || d === 1) return null;
      return fracQ(`Work out ${smx(...a)} ${op} ${smx(...b)}\nGive your answer as a mixed number in its simplest form.`, n, d,
        ['Change both mixed numbers to improper fractions, then use a common denominator.',
          `${smx(...a)} = ${fr(...a)} and ${smx(...b)} = ${fr(...b)}. ${commonHint(a, b).replace('The lowest', 'Then the lowest')}`],
        `${fr(...a)} ${op} ${fr(...b)} = ${fr(...OPS[op](a, b))}${eqS(...OPS[op](a, b))}.`, { simplest: true, mixed: true });
    });

    const negatives = () => retry(() => {
      const op = pick(['+', '−', '×', '÷']);
      let a = proper(9), b = coin() ? proper(9) : mixedNum(1);
      a = [-a[0], a[1]];
      if (coin()) b = [-b[0], b[1]];
      const [n, d] = U.simplify(...OPS[op](a, b));
      if (n === 0 || d === 1) return null;
      if ((op === '+' || op === '−') && a[1] === b[1]) return null;
      const bT = b[0] < 0 ? `(${smx(...b)})` : smx(...b);
      const hint = op === '+' || op === '−'
        ? ['Use a common denominator. Take care with the signs.' + (Math.abs(b[0]) > b[1] ? ' Change the mixed number to an improper fraction.' : ''), commonHint(a, b)]
        : ['Work out the size first, then the sign: same signs give +, different signs give −.' + (Math.abs(b[0]) > b[1] ? ' Change the mixed number to an improper fraction.' : ''),
          op === '×' ? `Without signs: ${fr(-a[0], a[1])} × ${fr(Math.abs(b[0]), b[1])}. Then decide the sign.` : `Without signs: ${fr(-a[0], a[1])} × ${fr(b[1], Math.abs(b[0]))} (flip the second fraction). Then decide the sign.`];
      let work;
      if (op === '+' || op === '−') {
        const l = U.lcm(a[1], b[1]), A1 = a[0] * l / a[1], B1 = b[0] * l / b[1], top = op === '+' ? A1 + B1 : A1 - B1;
        work = `${sf0(A1, l)} ${op} ${B1 < 0 ? '(' + sf0(B1, l) + ')' : sf0(B1, l)} = ${sf0(top, l)}${eqS(top, l)}`;
      } else {
        const [pn, pd] = OPS[op](a, b);
        work = `${op === '÷' ? `${sf0(...a)} × ${b[0] < 0 ? '(' + sf0(b[1] * Math.sign(b[0]), Math.abs(b[0])) + ')' : fr(b[1], b[0])} = ` : ''}${sf0(pd < 0 ? -pn : pn, Math.abs(pd))}${eqS(pd < 0 ? -pn : pn, Math.abs(pd))}`;
      }
      return fracQ(`Work out ${sfr(...a)} ${op} ${bT}\nGive your answer in its simplest form.`, n, d, hint,
        `${sfr(...a)} ${op} ${bT}${Math.abs(b[0]) > b[1] ? ` = ${sf0(...a)} ${op} ${b[0] < 0 ? '(' + sf0(...b) + ')' : sf0(...b)}` : ''} = ${work}.`, { simplest: true, mixed: Math.abs(n) > d });
    });

    const spot = () => retry(() => {
      const a = proper(9), b = proper(9), who = U.name();
      if (a[1] === b[1]) return null;
      const [n, d] = U.simplify(...OPS['+'](a, b));
      const wn = a[0] + b[0], wd = a[1] + b[1];
      if (d === 1 || n * wd === wn * d) return null;
      return fracQ(`${who} says ${fr(...a)} + ${fr(...b)} = ${fr(wn, wd)}.\nWhat is the correct answer, in its simplest form?`, n, d,
        [`${who} added the tops and added the bottoms. You must make the denominators the same first.`, commonHint(a, b)],
        `${fr(a[0] * U.lcm(a[1], b[1]) / a[1], U.lcm(a[1], b[1]))} + ${fr(b[0] * U.lcm(a[1], b[1]) / b[1], U.lcm(a[1], b[1]))} = ${U.mixed(n, d)}.`, { simplest: true, mixed: n > d });
    });

    const word = (L, ctx) => {
      if (coin()) {
        return retry(() => {
          const q = pick([3, 4, 5, 8]), p = R(1, q - 1), k = R(4, 16);
          if (U.gcd(p, q) !== 1) return null;
          const [tn, td] = U.simplify(k * p, q);
          if (td === 1 || tn < td) return null;
          return num(`A ribbon is ${smx(tn, td)} m long. It is cut into pieces that are each ${fr(p, q)} m long.\nHow many pieces are there?`, k,
            ['Divide the total length by the length of one piece.', `${smx(tn, td)} = ${fr(tn, td)}. Work out ${fr(tn, td)} ÷ ${fr(p, q)} = ${fr(tn, td)} × ${fr(q, p)}.`],
            `${fr(tn, td)} ÷ ${fr(p, q)} = ${fr(tn, td)} × ${fr(q, p)} = ${k}. There are ${k} pieces.`);
        });
      }
      return retry(() => {
        const a = mixedNum(3), b = mixedNum(2), who = U.name();
        if (a[1] === b[1]) return null;
        const [n, d] = U.simplify(...OPS['+'](a, b));
        if (d === 1) return null;
        return fracQ(`${who} walks ${smx(...a)} km to the park and then ${smx(...b)} km to a friend's house.\nHow far does ${who} walk altogether? Give your answer as a mixed number.`, n, d,
          ['Add the two distances. Add the whole numbers, then add the fractions using a common denominator.', commonHint([a[0] % a[1], a[1]], [b[0] % b[1], b[1]])],
          `${smx(...a)} + ${smx(...b)} = ${U.mixed(n, d)} km.`, { simplest: true, mixed: true, unit: 'km' });
      });
    };

    const order = () => retry(() => {
      const a = proper(8), b = proper(6), c = proper(6);
      const bc = U.simplify(b[0] * c[0], b[1] * c[1]);
      if (a[1] === bc[1]) return null;
      const [n, d] = U.simplify(...OPS['+'](a, bc));
      if (d === 1) return null;
      return fracQ(`Work out ${fr(...a)} + ${fr(...b)} × ${fr(...c)}\nGive your answer in its simplest form.`, n, d,
        ['Order of operations: multiply before you add.', `${fr(...b)} × ${fr(...c)} = ${fr(...bc)}. Now add this to ${fr(...a)}.`],
        `${fr(...b)} × ${fr(...c)} = ${fr(...bc)}, and ${fr(...a)} + ${fr(...bc)} = ${U.mixed(n, d)}.`, { simplest: true, mixed: n > d });
    });

    PMLM.registerSkill({
      id: 'g9.fractions', grade: 9, unit: 'g9.u2', title: 'Calculating with fractions', icon: '🍰',
      blurb: 'All four operations with fractions and mixed numbers',
      lesson: [
        { title: 'Adding and subtracting',
          text: 'Make the denominators the same, then add or subtract the numerators.\n{2/3} + {1/4} = {8/12} + {3/12} = {11/12}\n**Never** add the bottoms: {2/3} + {1/4} is not {3/7}.',
          visual: { type: 'fractionBar', bars: [{ parts: 12, shaded: 8, label: '{8/12}' }, { parts: 12, shaded: 3, label: '{3/12}' }] } },
        { title: 'Multiplying',
          text: 'Multiply the tops and multiply the bottoms. Cancel first to keep numbers small.\n{3/4} × {2/9} = {6/36} = {1/6}\nWith mixed numbers, change to improper fractions first: 1{1/2} = {3/2}.' },
        { title: 'Dividing',
          text: 'Keep the first fraction, change ÷ to ×, and flip the second fraction.\n{2/3} ÷ {4/5} = {2/3} × {5/4} = {10/12} = {5/6}' },
        { title: 'Negative fractions',
          text: 'The sign rules are the same as for whole numbers.\n−{1/2} × {2/3} = −{1/3} (different signs)\n−{3/4} ÷ (−{1/2}) = {3/2} = 1{1/2} (same signs)\n−{1/2} + {3/4} = −{2/4} + {3/4} = {1/4}' },
        { title: 'Worked example',
          text: 'Work out 2{1/3} ÷ 1{3/4}.\n**1.** Improper fractions: 2{1/3} = {7/3} and 1{3/4} = {7/4}.\n**2.** Flip and multiply: {7/3} × {4/7} = {28/21}.\n**3.** Simplify: {28/21} = {4/3} = 1{1/3}.\nAnswer: **1{1/3}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [addSub, addSub, multiply, divide, word],
          [mixedAddSub, divide, multiply, spot, word, addSub],
          [negatives, negatives, order, mixedAddSub, divide, word],
        ], ctx);
      },
    });
  }

  /* 6 ── Recurring decimals to fractions */
  {
    const decRep = (n, d) => {
      let r = n % d, digits = '';
      const seen = new Map();
      while (r !== 0 && !seen.has(r)) { seen.set(r, digits.length); r *= 10; digits += Math.floor(r / d); r %= d; }
      if (r === 0) return { pre: digits, rep: '' };
      const i = seen.get(r);
      return { pre: digits.slice(0, i), rep: digits.slice(i) };
    };
    const LIST1 = [[1, 3], [2, 3], [1, 6], [5, 6], [1, 9], [2, 9], [4, 9], [5, 9], [7, 9], [1, 11], [2, 11], [3, 11], [5, 11], [7, 11]];
    const LIST2 = [...LIST1, [1, 12], [5, 12], [7, 12], [1, 15], [2, 15], [4, 15], [1, 7], [2, 7], [3, 7], [1, 18], [7, 18]];

    const toDec = L => {
      const [n, d] = pick(L === 1 ? LIST1 : LIST2), { pre, rep } = decRep(n, d);
      const ans = `0.${pre}~{${rep}}`;
      const wr = [`0.${pre}${rep}`, `0.${n}${d}`];
      if (rep.length >= 2) wr.push(`0.${pre}${rep[0]}~{${rep.slice(1)}}`);
      if (rep.length === 2 && rep[0] !== rep[1]) wr.push(`0.${pre}~{${rep[1]}${rep[0]}}`);
      if (pre) wr.push(`0.~{${pre}${rep}}`);
      if (rep.length === 1) wr.push(`0.${pre}${rep}${rep}`);
      return choice(`Write ${fr(n, d)} as a decimal.`, ans, wr,
        [`Divide ${n} by ${d}. Keep going until the digits start to repeat.`, `${n} ÷ ${d} = 0.${(pre + rep + rep).slice(0, 4)}… Which digits repeat?`],
        `${n} ÷ ${d} = 0.${pre}${rep}${rep}… so ${fr(n, d)} = ${ans}.`);
    };

    const oneDigit = () => {
      const a = R(1, 8);
      const [n, d] = U.simplify(a, 9);
      return fracQ(`Write 0.~{${a}} as a fraction in its simplest form.`, n, d,
        ['Let x = the decimal. One digit repeats, so multiply by 10.', `x = 0.~{${a}} and 10x = ${a}.~{${a}}. Now subtract x from 10x.`],
        `9x = ${a}, so x = ${fr(a, 9)}${d !== 9 ? ` = ${fr(n, d)}` : ''}.`, { simplest: true });
    };

    const twoDigit = () => {
      const k = retry(() => { const v = R(1, 98); return v % 11 === 0 ? null : v; });
      const ab = String(k).padStart(2, '0'), [n, d] = U.simplify(k, 99);
      return fracQ(`Write 0.~{${ab}} as a fraction in its simplest form.`, n, d,
        ['Let x = the decimal. Two digits repeat, so multiply by 100.', `x = 0.~{${ab}} and 100x = ${ab}.~{${ab}}. Subtract x from 100x to get rid of the repeating part.`],
        `100x − x = ${k}, so 99x = ${k} and x = ${fr(k, 99)}${d !== 99 ? ` = ${fr(n, d)}` : ''}.`, { simplest: true });
    };

    const preDigit = () => {
      const a = R(0, 9), b = retry(() => { const v = R(1, 9); return v === a ? null : v; });
      const top = 9 * a + b, [n, d] = U.simplify(top, 90);
      return fracQ(`Write 0.${a}~{${b}} as a fraction in its simplest form.`, n, d,
        ['Only the ' + b + ' repeats. Multiply by 10 and by 100, then subtract so the repeating parts cancel.', `Let x = 0.${a}~{${b}}. Then 10x = ${a}.~{${b}} and 100x = ${10 * a + b}.~{${b}}.`],
        `100x − 10x = ${10 * a + b} − ${a} = ${top}, so 90x = ${top} and x = ${fr(top, 90)}${d !== 90 ? ` = ${fr(n, d)}` : ''}.`, { simplest: true });
    };

    const threeDigit = () => {
      const k = retry(() => { const v = R(1, 998); return v % 111 === 0 ? null : v; });
      const abc = String(k).padStart(3, '0'), [n, d] = U.simplify(k, 999);
      return fracQ(`Write 0.~{${abc}} as a fraction in its simplest form.`, n, d,
        ['Three digits repeat, so multiply by 1000.', `x = 0.~{${abc}} and 1000x = ${abc}.~{${abc}}. Subtract x from 1000x.`],
        `999x = ${k}, so x = ${fr(k, 999)}${d !== 999 ? ` = ${fr(n, d)}` : ''}.`, { simplest: true });
    };

    const withWhole = () => {
      const w = R(1, 3);
      if (coin()) {
        const a = R(1, 8), [n, d] = U.simplify(9 * w + a, 9);
        return fracQ(`Write ${w}.~{${a}} as a mixed number in its simplest form.`, n, d,
          ['Keep the whole number part. Change the recurring decimal part into a fraction.', `${w}.~{${a}} = ${w} + 0.~{${a}}. Let x = 0.~{${a}}, so 10x = ${a}.~{${a}}.`],
          `0.~{${a}} = ${fr(a, 9)}${U.gcd(a, 9) > 1 ? ` = ${U.fracS(a, 9)}` : ''}, so ${w}.~{${a}} = ${U.mixed(n, d)}.`, { simplest: true, mixed: true });
      }
      const k = retry(() => { const v = R(1, 98); return v % 11 === 0 ? null : v; });
      const ab = String(k).padStart(2, '0'), [n, d] = U.simplify(99 * w + k, 99);
      return fracQ(`Write ${w}.~{${ab}} as a mixed number in its simplest form.`, n, d,
        ['Keep the whole number part. Change the recurring decimal part into a fraction.', `${w}.~{${ab}} = ${w} + 0.~{${ab}}. Let x = 0.~{${ab}}, so 100x = ${ab}.~{${ab}}.`],
        `0.~{${ab}} = ${fr(k, 99)}${U.gcd(k, 99) > 1 ? ` = ${U.fracS(k, 99)}` : ''}, so ${w}.~{${ab}} = ${U.mixed(n, d)}.`, { simplest: true, mixed: true });
    };

    const spot = () => {
      const who = U.name();
      if (coin()) {
        const a = R(1, 8), [n, d] = U.simplify(a, 9);
        return fracQ(`${who} says 0.~{${a}} = ${fr(a, 10)}.\nWhat is the correct fraction, in its simplest form?`, n, d,
          [`${fr(a, 10)} = 0.${a}, which stops. But 0.~{${a}} goes on forever: 0.${a}${a}${a}…`, `Let x = 0.~{${a}}. Then 10x = ${a}.~{${a}}. Subtract x from 10x.`],
          `9x = ${a}, so 0.~{${a}} = ${fr(a, 9)}${d !== 9 ? ` = ${fr(n, d)}` : ''}, not ${fr(a, 10)}.`, { simplest: true });
      }
      const k = retry(() => { const v = R(10, 98); return v % 11 === 0 || v % 10 === 0 ? null : v; });
      const [n, d] = U.simplify(k, 99);
      return fracQ(`${who} says 0.~{${k}} = ${fr(k, 100)}.\nWhat is the correct fraction, in its simplest form?`, n, d,
        [`${fr(k, 100)} = 0.${k}, which stops. But 0.~{${k}} goes on forever.`, `Let x = 0.~{${k}}. Then 100x = ${k}.~{${k}}. Subtract x from 100x.`],
        `99x = ${k}, so 0.~{${k}} = ${fr(k, 99)}${d !== 99 ? ` = ${fr(n, d)}` : ''}, not ${fr(k, 100)}.`, { simplest: true });
    };

    const pf = d => (U.isPrime(d) ? `${d} is prime` : `${d} = ${U.primeFactors(d).join(' × ')}`);
    const which = () => {
      const REC = [[5, 12], [2, 3], [4, 7], [1, 6], [7, 15], [5, 9], [3, 11], [1, 30], [7, 18]];
      const TERM = [[3, 8], [7, 20], [9, 16], [4, 5], [11, 25], [3, 40], [1, 32], [7, 50], [5, 4]];
      const want = coin();
      const ans = pick(want ? REC : TERM), wr = U.sample(want ? TERM : REC, 3);
      return choice(`Which fraction gives a **${want ? 'recurring' : 'terminating'}** decimal?`, fr(...ans), wr.map(f => fr(...f)),
        ['Write the denominator (in simplest form) as a product of primes. If the only primes are 2 and 5, the decimal stops (terminates).',
          `For example, ${pf(wr[0][1])}. Check the other denominators the same way.`],
        `${pf(ans[1])}, so ${fr(...ans)} gives a ${want ? 'recurring' : 'terminating'} decimal${want ? ' (it has a prime factor other than 2 and 5)' : ''}.`);
    };

    PMLM.registerSkill({
      id: 'g9.recurring', grade: 9, unit: 'g9.u2', title: 'Recurring decimals', icon: '🔁',
      blurb: 'Change recurring decimals into fractions',
      lesson: [
        { title: 'Recurring decimals',
          text: 'Some fractions give decimals that repeat forever.\n{1/3} = 0.333… = 0.~{3}\n{5/11} = 0.4545… = 0.~{45}\n{1/6} = 0.1666… = 0.1~{6}\nThe dots show the first and last digit of the repeating block.' },
        { title: 'Which decimals recur?',
          text: 'Write the fraction in its simplest form. Look at the prime factors of the denominator.\nOnly 2s and 5s → the decimal stops: {3/8} = 0.375\nAny other prime → it recurs: {5/12} = 0.41~{6}',
          visual: { type: 'table', headers: ['Fraction', 'Denominator', 'Decimal'], rows: [['{3/8}', '2 × 2 × 2', 'stops'], ['{7/20}', '2 × 2 × 5', 'stops'], ['{5/12}', '2 × 2 × 3', 'recurs']] } },
        { title: 'The ×10, ×100 trick',
          text: 'Let x = the decimal. Multiply by 10 if one digit repeats, 100 if two digits repeat, and so on.\nThen subtract x: the repeating parts cancel out.\nx = 0.~{7} → 10x = 7.~{7} → 9x = 7 → x = {7/9}' },
        { title: 'Worked example',
          text: 'Write 0.~{36} as a fraction.\n**1.** Let x = 0.363636…\n**2.** Two digits repeat, so 100x = 36.363636…\n**3.** Subtract: 100x − x = 36, so 99x = 36.\n**4.** x = {36/99} = {4/11}\nAnswer: **{4/11}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [toDec, toDec, oneDigit, oneDigit, which],
          [twoDigit, twoDigit, preDigit, toDec, spot, which],
          [preDigit, threeDigit, withWhole, twoDigit, spot],
        ], ctx);
      },
    });
  }

  /* 7 ── Percentage change, reverse and compound percentages */
  {
    const mult = (p, up) => U.clean(1 + (up ? p : -p) / 100);
    const ITEMS = ['jacket', 'bike', 'phone', 'lamp', 'watch', 'printer', 'desk', 'guitar'];

    const incDec = (L, ctx) => {
      const p = pick(L === 1 ? [5, 10, 15, 20, 25, 30, 40] : [4, 8, 12, 15, 35, 3, 6]), up = coin(), m = mult(p, up);
      const cur = x => money(ctx.currency, x);
      if (coin()) {
        const A = R(4, 90) * 10, ans = U.round(A * m, 2), item = pick(ITEMS);
        return num(`A ${item} costs ${cur(A)}. The price ${up ? 'goes up' : 'goes down'} by ${p}%.\nWhat is the new price?`, ans,
          ['Use a multiplier: 100% ' + (up ? 'plus' : 'minus') + ' the percentage, written as a decimal.', `${up ? '100% + ' : '100% − '}${p}% = ${up ? 100 + p : 100 - p}% = ${F(m)}. Now work out ${F(A)} × ${F(m)}.`],
          `${F(A)} × ${F(m)} = ${F(ans, Number.isInteger(ans) ? 0 : 2)}, so the new price is ${cur(ans)}.`, { prefix: ctx.currency });
      }
      const A = retry(() => { const v = R(12, 90) * 100; return Number.isInteger(U.clean(v * p / 100)) ? v : null; }), ans = U.round(A * m, 0);
      return num(`A town has ${F(A)} people. The population ${up ? 'increases' : 'decreases'} by ${p}%.\nWhat is the new population?`, ans,
        ['Use a multiplier: 100% ' + (up ? 'plus' : 'minus') + ' the percentage, written as a decimal.', `${up ? '100% + ' : '100% − '}${p}% = ${up ? 100 + p : 100 - p}% = ${F(m)}. Now work out ${F(A)} × ${F(m)}.`],
        `${F(A)} × ${F(m)} = ${F(ans)} people.`);
    };

    const multChoice = () => {
      const p = pick([3, 6, 7, 15, 35, 45, 2, 9, 12]), up = coin(), m = mult(p, up);
      const wr = up ? [U.clean(p / 100), U.clean(1 + p / 10), mult(p, false), p] : [mult(p, true), U.clean(p / 100), p / 10 < 1 ? U.clean(1 - p / 10) : U.clean(p / 10), U.clean(1 - p / 1000)];
      return choice(`Which multiplier ${up ? 'increases' : 'decreases'} an amount by ${p}%?`, F(m), wr.map(x => F(x)),
        [`${up ? 'An increase' : 'A decrease'} of ${p}% leaves you with ${up ? 100 + p : 100 - p}% of the amount.`, `${up ? 100 + p : 100 - p}% as a decimal: divide by 100.`],
        `100% ${up ? '+' : '−'} ${p}% = ${up ? 100 + p : 100 - p}% = ${F(m)}.`);
    };

    const pctChange = (L, ctx) => {
      const r = retry(() => {
        const old = pick([20, 40, 50, 60, 80, 120, 150, 160, 200, 240, 250, 300, 400, 500]), p = pick([5, 10, 15, 20, 25, 30, 35, 40, 12, 8]);
        const diff = U.clean(old * p / 100);
        return Number.isInteger(diff) ? { old, p, diff } : null;
      });
      const up = coin(), nw = up ? r.old + r.diff : r.old - r.diff, cur = x => money(ctx.currency, x), item = pick(ITEMS);
      const q = `The price of a ${item} ${up ? 'rises' : 'falls'} from ${cur(r.old)} to ${cur(nw)}.\nWhat is the percentage ${up ? 'increase' : 'decrease'}?`;
      const hints = ['Percentage change = change ÷ **original** amount × 100.', `The change is ${cur(r.diff)}. Divide it by the original price, ${cur(r.old)}, then × 100.`];
      const exp = `${r.diff} ÷ ${r.old} × 100 = ${r.p}%.`;
      if (L === 3 && coin()) {
        return choice(q, `${r.p}%`, [`${F(U.round(r.diff / nw * 100, 1))}%`, `${r.diff}%`, `${F(U.round(nw / r.old * 100, 1))}%`], hints, exp + ' (Always divide by the original amount, not the new one.)');
      }
      return num(q, r.p, hints, exp, { unit: '%' });
    };

    const reverse = (L, ctx) => {
      const up = L === 2 ? true : coin(), p = pick(up ? [10, 20, 25, 30, 40, 15, 5] : [10, 20, 25, 30, 40, 15, 35]), m = mult(p, up);
      const O = retry(() => { const v = R(3, 60) * 20; return Number.isInteger(U.clean(v * m * 100)) ? v : null; }), N = U.round(O * m, 2);
      const cur = x => money(ctx.currency, x), item = pick(ITEMS);
      const q = up ? `After a ${p}% price rise, a ${item} costs ${cur(N)}.\nWhat was the price before the rise?`
        : `In a sale, all prices are reduced by ${p}%. A ${item} now costs ${cur(N)}.\nWhat was the price before the sale?`;
      return num(q, O,
        [`${cur(N)} is ${up ? 100 + p : 100 - p}% of the original price. Divide by the multiplier. Do **not** just ${up ? 'take' : 'add'} ${p}% of the new price.`,
          `Original × ${F(m)} = ${F(N)}. So divide ${F(N)} by ${F(m)}.`],
        `${F(N)} ÷ ${F(m)} = ${F(O)}, so the original price was ${cur(O)}. Check: ${F(O)} × ${F(m)} = ${F(N)}.`, { prefix: ctx.currency });
    };

    const reverseSpot = (L, ctx) => {
      const p = pick([10, 20, 25, 40]), m = mult(p, true), O = R(3, 40) * 20, N = U.round(O * m, 2), who = U.name();
      const wrong = U.round(N * (1 - p / 100), 2), cur = x => money(ctx.currency, x);
      return num(`After a ${p}% increase, a ticket costs ${cur(N)}.\n${who} says the old price was ${cur(N)} − ${p}% of ${cur(N)} = ${cur(wrong)}.\nWhat was the old price really?`, O,
        [`${p}% of the **new** price is not the same as ${p}% of the old price. The new price is ${100 + p}% of the old price.`, `Old price × ${F(m)} = ${F(N)}. Divide ${F(N)} by ${F(m)}.`],
        `${F(N)} ÷ ${F(m)} = ${F(O)}, so the old price was ${cur(O)}. ${who}'s answer is too small.`, { prefix: ctx.currency });
    };

    const compound = (L, ctx) => {
      const cur = x => money(ctx.currency, x);
      if (coin()) {
        const P0 = R(5, 50) * 100, r = pick([2, 3, 4, 5, 6]), n = R(2, 4), m = mult(r, true), ans = U.round(P0 * Math.pow(m, n), 2);
        return num(`${U.name()} invests ${cur(P0)} at ${r}% compound interest per year.\nHow much is it worth after ${n} years? Give your answer to 2 decimal places.`, ans,
          ['Compound interest: multiply by the multiplier once for **every** year.', `The multiplier is ${F(m)}. Work out ${F(P0)} × ${F(m)}^{${n}}.`],
          `${F(P0)} × ${F(m)}^{${n}} ${U.clean(P0 * Math.pow(m, n)) === ans ? '=' : '≈'} ${F(ans, 2)}, so it is worth ${cur(ans)}.`, { prefix: ctx.currency, tolerance: 0.005 });
      }
      const V = R(8, 25) * 1000, r = pick([10, 15, 20, 12]), n = R(2, 3), m = mult(r, false), ans = U.round(V * Math.pow(m, n), 2);
      return num(`A car is worth ${cur(V)}. Its value goes down by ${r}% every year.\nWhat is it worth after ${n} years? Give your answer to 2 decimal places.`, ans,
        ['Each year the value is multiplied by the same multiplier. Use a power.', `The multiplier is 100% − ${r}% = ${F(m)}. Work out ${F(V)} × ${F(m)}^{${n}}.`],
        `${F(V)} × ${F(m)}^{${n}} ${U.clean(V * Math.pow(m, n)) === ans ? '=' : '≈'} ${F(ans, 2)}, so the car is worth ${cur(ans)}.`, { prefix: ctx.currency, tolerance: 0.005 });
    };

    const compChoice = (L, ctx) => {
      const P0 = R(5, 50) * 100, r = pick([2, 3, 4, 5, 6, 8]), n = R(3, 5), m = mult(r, true), cur = x => money(ctx.currency, x);
      return choice(`${cur(P0)} is invested at ${r}% compound interest per year.\nWhich calculation gives its value after ${n} years?`, `${F(P0)} × ${F(m)}^{${n}}`,
        [`${F(P0)} × ${F(U.clean(1 + r * n / 100))}`, `${F(P0)} × ${F(m)} × ${n}`, `${F(P0)} × ${F(U.clean(r / 100))}^{${n}}`, `${F(P0)} × ${F(m)}^{${n - 1}}`],
        ['With compound interest, the interest is added every year, so each year you multiply by the same multiplier.', `The multiplier for one year is ${F(m)}. How many times do you multiply by it?`],
        `Multiply by ${F(m)} once for each of the ${n} years: ${F(P0)} × ${F(m)}^{${n}}.`);
    };

    PMLM.registerSkill({
      id: 'g9.percentages', grade: 9, unit: 'g9.u2', title: 'Percentage change', icon: '📈',
      blurb: 'Multipliers, reverse percentages, compound change',
      lesson: [
        { title: 'Multipliers',
          text: 'Start from 100%, then add or take away the change.\nIncrease by 25% → 125% → **× 1.25** (4 quarters become 5)\nDecrease by 15% → 85% → **× 0.85**\nIncrease 80 by 15%: 80 × 1.15 = 92',
          visual: { type: 'barModel', rows: [{ label: 'Before', parts: 4, value: '25%' }, { label: 'After', parts: 5, value: '25%' }] } },
        { title: 'Percentage change',
          text: 'Percentage change = {change/original} × 100\nA price rises from 40 to 46. The change is 6.\n{6/40} × 100 = 15%. So it is a 15% increase.\n**Always** divide by the original amount.' },
        { title: 'Reverse percentages',
          text: 'After a 20% rise, a price is 96. What was it before?\n96 is 120% of the old price, so old × 1.2 = 96.\nDivide: 96 ÷ 1.2 = 80.\n**Wrong way:** 96 − 20% of 96 = 76.80. The 20% was of the old price, not the new one!' },
        { title: 'Compound change',
          text: 'When a percentage change happens again and again, multiply again and again.\n2000 at 3% compound interest for 2 years:\n2000 × 1.03 × 1.03 = 2000 × 1.03^{2} = 2121.80' },
        { title: 'Worked example',
          text: 'A car worth 12 000 loses 15% of its value each year. Find its value after 3 years.\n**1.** Multiplier: 100% − 15% = 85% = 0.85.\n**2.** Three years: 12 000 × 0.85^{3}.\n**3.** 0.85^{3} = 0.614 125, and 12 000 × 0.614 125 = 7369.5.\nAnswer: **7369.50**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [incDec, incDec, multChoice, pctChange],
          [pctChange, reverse, reverse, incDec, multChoice, reverseSpot],
          [compound, compound, compChoice, reverse, reverseSpot, pctChange],
        ], ctx);
      },
    });
  }

  /* 8 ── Direct and inverse proportion */
  {
    const directCost = (L, ctx) => {
      const pc = 5 * R(10, 90), k = R(2, 8), m = retry(() => { const v = R(3, 15); return v === k ? null : v; });
      const C = U.clean(k * pc / 100), ans = U.clean(m * pc / 100), item = pick(['notebooks', 'pens', 'bottles of water', 'bus tickets', 'apples']);
      const cur = x => money(ctx.currency, x);
      return num(`${k} ${item} cost ${cur(C)}.\nHow much do ${m} ${item} cost?`, ans,
        ['This is direct proportion: find the cost of 1 first, then multiply.', `1 costs ${cur(C)} ÷ ${k}. Then multiply by ${m}.`],
        `1 costs ${cur(C)} ÷ ${k} = ${cur(pc / 100)}, so ${m} cost ${m} × ${cur(pc / 100)} = ${cur(ans)}.`, { prefix: ctx.currency });
    };

    const recipe = () => {
      const n = pick([2, 4, 5, 6, 8]), m = retry(() => { const v = pick([3, 4, 6, 9, 10, 12, 15]); return v === n ? null : v; });
      const per = R(3, 15) * 10, base = U.clean(per * n);
      const ans = U.clean(per * m);
      return num(`A recipe for ${n} people uses ${base} g of flour.\nHow much flour is needed for ${m} people?`, ans,
        ['Find the amount for 1 person first, then multiply.', `For 1 person: ${base} ÷ ${n} = ${per} g.`],
        `${per} g per person × ${m} people = ${ans} g.`, { unit: 'g' });
    };

    const inverseWork = () => {
      const r = retry(() => {
        const w = R(2, 9), d = R(3, 12), T = w * d;
        const opts = U.factors(T).filter(x => x !== w && x !== d && x >= 2 && x <= 20);
        return opts.length ? { w, d, T, w2: pick(opts) } : null;
      });
      const ans = r.T / r.w2;
      return num(`${r.w} builders take ${r.d} days to build a wall.\nHow long would ${r.w2} builders take, working at the same rate?`, ans,
        ['More builders finish **faster**: this is inverse proportion. Find the total amount of work first.', `${r.w} builders × ${r.d} days = ${r.T} builder-days of work. Share these between ${r.w2} builders.`],
        `${r.T} ÷ ${r.w2} = ${ans}, so it takes ${U.s(ans, 'day')}.`, { unit: 'days' });
    };

    const speed = () => {
      const r = retry(() => {
        const s1 = pick([40, 45, 50, 60, 70, 80, 90]), t1 = pick([2, 3, 4, 5, 1.5, 2.5]), D = U.clean(s1 * t1);
        const s2 = pick([30, 40, 45, 50, 60, 75, 80, 90, 100, 120]);
        const t2 = U.clean(D / s2);
        return s2 !== s1 && Number.isInteger(D) && Number.isInteger(U.clean(t2 * 4)) ? { s1, t1, s2, t2, D } : null;
      });
      return num(`At ${r.s1} km/h a journey takes ${F(r.t1)} hours.\nHow long does the same journey take at ${r.s2} km/h?`, r.t2,
        ['Faster means less time: speed and time are in inverse proportion. Find the distance first.', `Distance = ${r.s1} × ${F(r.t1)} = ${r.D} km.`],
        `${r.D} ÷ ${r.s2} = ${F(r.t2)}, so the journey takes ${F(r.t2)} hours.`, { unit: 'hours' });
    };

    const makeTable = type => {
      if (type === 'direct') {
        const k = pick([2, 3, 4, 5, 1.5, 2.5, 6]), x0 = R(1, 3), dx = R(1, 3), xs = [0, 1, 2, 3].map(i => x0 + i * dx);
        return { xs, ys: xs.map(x => U.clean(k * x)), k };
      }
      if (type === 'inverse') {
        const K = pick([24, 36, 48, 60, 72, 120]), xs = U.sample(U.factors(K).filter(x => x > 1 && x < K), 4).sort((a, b) => a - b);
        return { xs, ys: xs.map(x => K / x), k: K };
      }
      const a = R(1, 4), c = nz(1, 6), x0 = R(1, 3), xs = [0, 1, 2, 3].map(i => x0 + i * R(1, 2));
      return { xs, ys: xs.map(x => a * x + c), k: 0 };
    };
    const ratioTxt = (y, x) => (Number.isInteger(U.clean(y / x)) ? F(U.clean(y / x)) : U.fracS(y, x));

    const tableType = () => {
      const type = pick(['direct', 'inverse', 'neither']), t = makeTable(type);
      const ans = { direct: 'Direct proportion', inverse: 'Inverse proportion', neither: 'Neither' }[type];
      return choice('Look at the table. What type of proportion is it?', ans, ['Direct proportion', 'Inverse proportion', 'Neither'],
        ['Direct proportion: y ÷ x is always the same. Inverse proportion: x × y is always the same.',
          `First pair: ${t.ys[0]} ÷ ${t.xs[0]} = ${ratioTxt(t.ys[0], t.xs[0])} and ${t.xs[0]} × ${t.ys[0]} = ${F(t.xs[0] * t.ys[0])}. Check the second pair the same way.`],
        type === 'direct' ? `y ÷ x = ${F(t.k)} every time, so it is direct proportion.`
          : type === 'inverse' ? `x × y = ${t.k} every time, so it is inverse proportion.`
            : 'Neither y ÷ x nor x × y stays the same, so it is neither.',
        { visual: { type: 'table', headers: ['x', ...t.xs.map(String)], rows: [['y', ...t.ys.map(v => F(v))]] } });
    };

    const tableMissing = () => {
      const type = coin() ? 'direct' : 'inverse', t = makeTable(type), i = R(1, 3), ans = t.ys[i];
      const cells = t.ys.map((v, j) => (j === i ? '?' : F(v)));
      return num(`y is ${type === 'direct' ? 'directly' : 'inversely'} proportional to x.\nFind the missing value in the table.`, ans,
        [type === 'direct' ? 'In direct proportion, y ÷ x is always the same number.' : 'In inverse proportion, x × y is always the same number.',
          type === 'direct' ? `y ÷ x = ${t.ys[0]} ÷ ${t.xs[0]} = ${F(t.k)}. Use this for x = ${t.xs[i]}.` : `x × y = ${t.xs[0]} × ${t.ys[0]} = ${t.k}. Use this for x = ${t.xs[i]}.`],
        type === 'direct' ? `y = ${F(t.k)} × ${t.xs[i]} = ${F(ans)}.` : `y = ${t.k} ÷ ${t.xs[i]} = ${F(ans)}.`,
        { visual: { type: 'table', headers: ['x', ...t.xs.map(String)], rows: [['y', ...cells]] } });
    };

    const formula = L => {
      if (L === 3 && coin()) {
        const r = retry(() => {
          const K = pick([24, 30, 36, 40, 48, 60, 72, 90, 120]), a = pick(U.factors(K).filter(x => x > 1 && x < K)), c = pick(U.factors(K).filter(x => x > 1 && x < K && x !== a));
          return c ? { K, a, b: K / a, c, ans: K / c } : null;
        });
        return num(`y is inversely proportional to x.\nWhen x = ${r.a}, y = ${r.b}. Find y when x = ${r.c}.`, r.ans,
          ['Inverse proportion means x × y is always the same (y = {k/x}).', `k = ${r.a} × ${r.b} = ${r.K}. Now work out ${r.K} ÷ ${r.c}.`],
          `k = ${r.K}, so y = ${r.K} ÷ ${r.c} = ${r.ans}.`);
      }
      const k = pick([2, 3, 4, 5, 6, 1.5, 2.5, 0.5]), a = R(2, 10), c = retry(() => { const v = R(2, 20); return v === a ? null : v; });
      const b = U.clean(k * a), ans = U.clean(k * c);
      return num(`y is directly proportional to x.\nWhen x = ${a}, y = ${F(b)}. Find y when x = ${c}.`, ans,
        ['Direct proportion means y = kx for some number k.', `k = y ÷ x = ${F(b)} ÷ ${a} = ${F(k)}. Now multiply k by ${c}.`],
        `y = ${F(k)} × ${c} = ${F(ans)}.`);
    };

    const which = () => {
      const D = ['the number of tickets bought and the total cost', 'the distance travelled at a steady speed and the time taken', 'the number of litres of fuel and the price paid', 'the length of a square\'s side and its perimeter'];
      const I = ['the number of workers and the time to finish a job', 'the speed of a car and the time for the same journey', 'the number of people sharing a prize and each person\'s share', 'the number of taps filling a tank and the time it takes'];
      const want = coin() ? 'inverse' : 'direct', ans = pick(want === 'inverse' ? I : D), wr = U.sample(want === 'inverse' ? D : I, 3);
      return choice(`Which pair is in **${want}** proportion?`, ans, wr,
        ['Direct: when one doubles, the other doubles. Inverse: when one doubles, the other halves.', 'Imagine doubling the first quantity in each pair. Does the second one double or halve?'],
        `For ${ans}: doubling one ${want === 'inverse' ? 'halves' : 'doubles'} the other, so they are in ${want} proportion.`);
    };

    PMLM.registerSkill({
      id: 'g9.proportion', grade: 9, unit: 'g9.u2', title: 'Direct and inverse', icon: '⚖️',
      blurb: 'Solve direct and inverse proportion problems',
      lesson: [
        { title: 'Direct proportion',
          text: 'Two quantities are in **direct proportion** if one doubles when the other doubles.\ny ÷ x is always the same: y = kx.\n3 pens cost 2.40, so 1 pen costs 0.80 and 5 pens cost 4.00.',
          visual: { type: 'table', headers: ['Pens', '1', '2', '3', '5'], rows: [['Cost', '0.80', '1.60', '2.40', '4.00']] } },
        { title: 'Inverse proportion',
          text: 'Two quantities are in **inverse proportion** if one **halves** when the other doubles.\nx × y is always the same: y = {k/x}.\n4 workers take 6 days. That is 24 worker-days, so 3 workers take 24 ÷ 3 = 8 days.',
          visual: { type: 'table', headers: ['Workers', '1', '2', '3', '4'], rows: [['Days', '24', '12', '8', '6']] } },
        { title: 'Spot the type',
          text: '**Ask:** if I double the first amount, what happens to the second?\nIt doubles → direct (cost of tickets).\nIt halves → inverse (speed and time for a journey).\n**Common mistake:** treating inverse proportion like direct proportion.' },
        { title: 'Worked example',
          text: 'y is inversely proportional to x. When x = 6, y = 10. Find y when x = 4.\n**1.** x × y stays the same: k = 6 × 10 = 60.\n**2.** So y = {60/x}.\n**3.** When x = 4: y = 60 ÷ 4 = 15.\nAnswer: **y = 15**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [directCost, directCost, recipe, inverseWork],
          [tableType, tableMissing, formula, inverseWork, which, recipe],
          [formula, formula, speed, tableMissing, tableType, which],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 3: Algebra ═══════════════════════
  PMLM.registerUnit({ id: 'g9.u3', grade: 9, name: 'Algebra', icon: '🔤' });

  const lin = (a, b, v = 'x') => ex([[a, v], [b, '']]);                    // 3x − 5
  const quad = (a, b, c, v = 'x') => ex([[a, v + '^{2}'], [b, v], [c, '']]); // x^{2} + 5x + 6
  const brk = (a, b, v = 'x') => `(${lin(a, b, v)})`;

  /* 9 ── Expanding and factorising */
  {
    const single = L => {
      const k = L === 1 ? R(2, 9) : retry(() => { const v = nz(-6, 9); return Math.abs(v) >= 2 ? v : null; }), a = R(1, 5), b = nz(-9, 9);
      const ans = lin(k * a, k * b);
      const kT = k === -1 ? M : F(k);
      return choice(`Expand ${kT}${brk(a, b)}`, ans,
        [lin(k * a, b), lin(k * a, -k * b), lin(a, k * b), lin(k + a, k * b)],
        ['Multiply **every** term inside the bracket by the number outside.' + (k < 0 ? ' The number outside is negative, so watch the signs.' : ''),
          `${P(k)} × ${U.term(a, 'x')} = ${U.term(k * a, 'x')}. Now work out ${P(k)} × ${P(b)}.`],
        `${P(k)} × ${U.term(a, 'x')} = ${U.term(k * a, 'x')} and ${P(k)} × ${P(b)} = ${F(k * b)}. So the answer is ${ans}.`);
    };

    const factorise = L => {
      if (L >= 2 && coin()) {
        const k = R(2, 6), a = R(2, 5), b = retry(() => { const v = nz(-7, 9); return U.gcd(a, v) === 1 ? v : null; });
        const ans = `${k}x${brk(a, b)}`;
        return choice(`Factorise fully ${quad(k * a, k * b, 0)}`, ans,
          [`${k}(${quad(a, b, 0)})`, `x${brk(k * a, k * b)}`, `${k}x(${ex([[a, 'x'], [k * b, '']])})`, `${k}x(${ex([[a, 'x^{2}'], [b, '']])})`],
          ['Find the highest common factor of both terms. It can include x as well as a number.', `The HCF of ${k * a} and ${A(k * b)} is ${k}, and both terms contain x. So take out ${k}x.`],
          `${quad(k * a, k * b, 0)} = ${k}x × ${U.term(a, 'x')} ${k * b < 0 ? '−' : '+'} ${k}x × ${A(b)} = ${ans}.`);
      }
      const k = pick([4, 6, 8, 9, 10, 12]), a = R(1, 5), b = retry(() => { const v = nz(-7, 9); return U.gcd(a, v) === 1 ? v : null; });
      const d = pick(U.factors(k).filter(x => x > 1 && x < k));
      const ans = `${k}${brk(a, b)}`;
      return choice(`Factorise fully ${lin(k * a, k * b)}`, ans,
        [`${d}${brk(k * a / d, k * b / d)}`, `${k}${brk(a, k * b)}`, `${k}${brk(a, -b)}`, `${k}${brk(k * a, k * b)}`],
        ['Find the **highest** common factor of the numbers. Put it outside the bracket.', `The HCF of ${k * a} and ${A(k * b)} is ${k}. Divide each term by ${k}.`],
        `${k * a} ÷ ${k} = ${a} and ${F(k * b)} ÷ ${k} = ${F(b)}, so ${lin(k * a, k * b)} = ${ans}. Check by expanding.`);
    };

    const binomial = () => {
      const a = nz(-9, 9), b = nz(-9, 9);
      const ans = quad(1, a + b, a * b);
      return choice(`Expand and simplify ${brk(1, a)}${brk(1, b)}`, ans,
        [quad(1, 0, a * b), quad(1, a * b, a + b), quad(1, a + b, -a * b), quad(1, a - b, a * b), quad(2, a + b, a * b)],
        ['Multiply each term in the first bracket by each term in the second bracket. That is 4 multiplications.',
          `First, x × x = x^{2} and x × ${P(b)} = ${U.term(b, 'x')}. Now multiply ${P(a)} by each term in the second bracket.`],
        `x^{2} ${U.term(b, 'x', false)} ${U.term(a, 'x', false)} ${U.term(a * b, '', false)} = ${ans}.`.replace(/\s+/g, ' '));
    };

    const square = (L) => {
      const a = nz(-9, 9), who = U.name(), ans = quad(1, 2 * a, a * a);
      const wrongs = [quad(1, 0, a * a), quad(1, a, a * a), quad(1, 2 * a, 2 * a), quad(1, 0, -a * a), quad(1, 2 * a, -a * a)];
      const hints = [`${brk(1, a)}^{2} means ${brk(1, a)}${brk(1, a)}. Write the bracket out twice!`, `x × x = x^{2} and x × ${P(a)} = ${U.term(a, 'x')}. There are two of these middle terms.`];
      const exp = `${brk(1, a)}${brk(1, a)} = x^{2} ${U.term(a, 'x', false)} ${U.term(a, 'x', false)} ${U.term(a * a, '', false)} = ${ans}.`.replace(/\s+/g, ' ');
      if (L === 3 || coin()) {
        return choice(`${who} says ${brk(1, a)}^{2} = ${quad(1, 0, a * a)}.\nWhat is the correct expansion?`, ans, wrongs.slice(1), hints, exp + ` ${who} forgot the middle terms.`);
      }
      return choice(`Expand ${brk(1, a)}^{2}`, ans, wrongs, hints, exp);
    };

    const missing = () => {
      const a = R(2, 9), b = R(1, 9);
      if (coin()) {
        return num(`Find the missing number.\n(x + ${a})(x + □) = ${quad(1, a + b, a * b)}`, b,
          ['The two numbers in the brackets multiply to give the number term, and add to give the x coefficient.', `${a} × □ = ${a * b}. Check that ${a} + □ = ${a + b} too.`],
          `${a} × ${b} = ${a * b} and ${a} + ${b} = ${a + b}, so the missing number is ${b}.`);
      }
      const s = sgn(), bb = s * b;
      if (a + bb === 0) return num(`Expand (x + ${a})(x ${U.term(bb, '', false).trim()}).\nWhat is the number term (the constant)?`, a * bb,
        ['The number term comes from multiplying the two numbers in the brackets.', `Multiply ${a} by ${P(bb)}.`],
        `${a} × ${P(bb)} = ${F(a * bb)}.`);
      return num(`Expand (x + ${a})(x ${U.term(bb, '', false).trim()}).\nWhat is the coefficient of x?`, a + bb,
        ['The x terms come from x × (second number) and (first number) × x. Add them.', `x × ${P(bb)} = ${U.term(bb, 'x')} and ${a} × x = ${a}x. Now collect them.`],
        `${U.term(bb, 'x')} + ${a}x = ${U.term(a + bb, 'x')}, so the coefficient of x is ${F(a + bb)}.`);
    };

    const simplify = () => {
      const m = R(2, 6), n = R(2, 6), a = nz(-6, 8), b = nz(-6, 8), minus = coin();
      const cx = minus ? m - n : m + n, cc = minus ? m * a - n * b : m * a + n * b;
      if (cx === 0) return null;
      const ans = lin(cx, cc);
      return choice(`Expand and simplify ${m}${brk(1, a)} ${minus ? '−' : '+'} ${n}${brk(1, b)}`, ans,
        minus ? [lin(cx, m * a + n * b), lin(m + n, cc), lin(cx, m * a - b)] : [lin(cx, m * a + b), lin(cx, a + b), lin(m * n, cc)],
        ['Expand each bracket separately, then collect like terms.' + (minus ? ' The minus sign multiplies **both** terms in the second bracket.' : ''),
          `${m}${brk(1, a)} = ${lin(m, m * a)} and ${minus ? '−' : ''}${n}${brk(1, b)} = ${lin(minus ? -n : n, minus ? -n * b : n * b)}.`],
        `${lin(m, m * a)} ${minus ? '' : '+ '}${lin(minus ? -n : n, minus ? -n * b : n * b).replace(/^−/, '− ')} = ${ans}.`);
    };

    const twoLinear = () => {
      const p = R(2, 4), q = R(1, 3), a = nz(-7, 7), b = nz(-7, 7);
      const mid = p * b + q * a;
      if (mid === 0) return null;
      const ans = quad(p * q, mid, a * b);
      return choice(`Expand and simplify ${brk(p, a)}${brk(q, b)}`, ans,
        [quad(p * q, 0, a * b), quad(p * q, p * b + a, a * b), quad(p * q, p * b - q * a, a * b), quad(p + q, mid, a * b), quad(p * q, mid, -a * b)],
        ['Multiply each term in the first bracket by each term in the second bracket, then collect the x terms.',
          `${U.term(p, 'x')} × ${U.term(q, 'x')} = ${U.term(p * q, 'x^{2}')} and ${U.term(p, 'x')} × ${P(b)} = ${U.term(p * b, 'x')}. Now multiply ${P(a)} by each term.`],
        `${U.term(p * q, 'x^{2}')} ${U.term(p * b, 'x', false)} ${U.term(q * a, 'x', false)} ${U.term(a * b, '', false)} = ${ans}.`.replace(/\s+/g, ' '));
    };

    PMLM.registerSkill({
      id: 'g9.expand', grade: 9, unit: 'g9.u3', title: 'Expand and factorise', icon: '🧮',
      blurb: 'Expand brackets, including two binomials; factorise',
      lesson: [
        { title: 'Expanding one bracket',
          text: 'Multiply **every** term inside by the term outside.\n3(2x − 5) = 6x − 15\n−2(x − 4) = −2x + 8 (negative × negative = positive)',
          visual: { type: 'table', headers: ['×', '2x', '−5'], rows: [['3', '6x', '−15']] } },
        { title: 'Two brackets',
          text: 'Each term in the first bracket multiplies each term in the second. A grid helps.\n(x + 3)(x + 5) = x^{2} + 5x + 3x + 15\n= x^{2} + 8x + 15',
          visual: { type: 'table', headers: ['×', 'x', '+5'], rows: [['x', 'x^{2}', '5x'], ['+3', '3x', '15']] } },
        { title: 'Squaring a bracket',
          text: '(x + 3)^{2} means (x + 3)(x + 3).\n= x^{2} + 3x + 3x + 9 = x^{2} + 6x + 9\n**Very common mistake:** (x + 3)^{2} = x^{2} + 9. That forgets the middle terms!' },
        { title: 'Factorising',
          text: 'Factorising is expanding backwards. Take out the **highest** common factor.\n12x + 18 = 6(2x + 3)\n6x^{2} + 9x = 3x(2x + 3)\nCheck by expanding your answer.' },
        { title: 'Worked example',
          text: 'Expand and simplify (2x + 1)(x − 4).\n**1.** 2x × x = 2x^{2} and 2x × (−4) = −8x.\n**2.** 1 × x = x and 1 × (−4) = −4.\n**3.** Collect the x terms: −8x + x = −7x.\nAnswer: **2x^{2} − 7x − 4**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [single, single, factorise, factorise, binomial],
          [binomial, binomial, square, missing, () => retry(simplify), factorise, single],
          [() => retry(twoLinear), () => retry(twoLinear), square, factorise, missing, () => retry(simplify)],
        ], ctx);
      },
    });
  }

  /* 10 ── Linear equations */
  {
    const eqTxt = (a, b, c, d) => `${lin(a, b)} = ${lin(c, d)}`;
    const twoStep = L => {
      const a = R(2, 9), x = L === 1 ? R(1, 12) : nz(-9, 12), b = nz(-15, 15), c = a * x + b;
      return num(`Solve ${lin(a, b)} = ${F(c)}`, x,
        ['Undo the operations in reverse order: deal with the number term first, then divide.', `${b > 0 ? 'Subtract' : 'Add'} ${A(b)} ${b > 0 ? 'from' : 'to'} both sides: ${a}x = ${F(c - b)}.`],
        `${a}x = ${F(c - b)}, so x = ${F(c - b)} ÷ ${a} = ${F(x)}.`);
    };

    const bracket = L => {
      const a = R(2, 7), x = L === 1 ? R(1, 10) : nz(-8, 12), b = nz(-9, 9), c = a * (x + b);
      return num(`Solve ${a}${brk(1, b)} = ${F(c)}`, x,
        ['Divide both sides by the number outside the bracket (or expand the bracket first).', `Divide both sides by ${a}: ${lin(1, b)} = ${F(c / a)}.`],
        `${lin(1, b)} = ${F(c / a)}, so x = ${F(x)}.`);
    };

    const bothSides = L => {
      const x = L === 2 ? R(-5, 12) : nz(-9, 12), c = R(1, 6), a = c + R(1, 6), b = nz(-15, 15), d = (a - c) * x + b;
      return num(`Solve ${eqTxt(a, b, c, d)}`, x,
        ['Get all the x terms on one side: subtract the smaller x term from both sides.', `Subtract ${U.term(c, 'x')} from both sides: ${lin(a - c, b)} = ${F(d)}.`],
        `${lin(a - c, b)} = ${F(d)}, so ${U.term(a - c, 'x')} = ${F(d - b)} and x = ${F(x)}.`,
        { visual: { type: 'balance', left: lin(a, b), right: lin(c, d) } });
    };

    const fractionEq = () => {
      const b = R(2, 6);
      if (coin()) {
        const x = nz(-10, 20), a = nz(-9, 9), c = (x + a) / b;
        if (!Number.isInteger(c)) return null;
        return num(`Solve {${lin(1, a)}/${b}} = ${F(c)}`, x,
          ['Multiply both sides by the denominator to clear the fraction.', `Multiply both sides by ${b}: ${lin(1, a)} = ${F(b * c)}.`],
          `${lin(1, a)} = ${F(b * c)}, so x = ${F(x)}.`);
      }
      const k = nz(-6, 9), x = b * k, a = nz(-8, 8), c = k + a;
      return num(`Solve {x/${b}} ${U.term(a, '', false).trim()} = ${F(c)}`, x,
        [`First ${a > 0 ? 'subtract' : 'add'} ${A(a)}, then multiply by ${b}.`, `${a > 0 ? 'Subtract' : 'Add'} ${A(a)}: {x/${b}} = ${F(c - a)}.`],
        `{x/${b}} = ${F(k)}, so x = ${F(k)} × ${b} = ${F(x)}.`);
    };

    const fracBoth = () => {
      const x = nz(-6, 10), m = R(2, 5), n = retry(() => { const v = R(2, 6); return v === m ? null : v; }), p = R(1, 3), q = R(1, 3), v = nz(-4, 8);
      if (n * p === m * q) return null;
      const a = m * v - p * x, b = n * v - q * x;
      if (a === 0 || b === 0) return null;
      return num(`Solve {${lin(p, a)}/${m}} = {${lin(q, b)}/${n}}`, x,
        ['Multiply both sides by both denominators (cross-multiply) to clear the fractions.', `${n}${brk(p, a)} = ${m}${brk(q, b)}. Now expand both sides.`],
        `${lin(n * p, n * a)} = ${lin(m * q, m * b)}, so ${U.term(n * p - m * q, 'x')} = ${F(m * b - n * a)} and x = ${F(x)}.`);
    };

    const bracketsBoth = () => {
      const x = nz(-6, 12), a = R(2, 6), c = retry(() => { const v = R(2, 7); return v === a ? null : v; }), b = nz(-8, 8);
      const d = (a * (x + b)) / c - x;
      if (!Number.isInteger(d) || d === 0) return null;
      return num(`Solve ${a}${brk(1, b)} = ${c}${brk(1, d)}`, x,
        ['Expand both brackets first, then collect the x terms on one side.', `Expanding: ${lin(a, a * b)} = ${lin(c, c * d)}.`],
        `${lin(a, a * b)} = ${lin(c, c * d)}, so ${a > c ? `${U.term(a - c, 'x')} = ${F(c * d - a * b)}` : `${F(a * b - c * d)} = ${U.term(c - a, 'x')}`} and x = ${F(x)}.`);
    };

    const fracAnswer = () => {
      const c = R(1, 4), k = R(2, 6), a = c + k, top = retry(() => { const v = nz(-15, 20); return v % k === 0 ? null : v; });
      const b = nz(-9, 9), d = top + b;
      const [n, dd] = U.simplify(top, k);
      return fracQ(`Solve ${eqTxt(a, b, c, d)}\nGive your answer as a fraction.`, n, dd,
        ['Collect the x terms on one side and the numbers on the other.', `Subtract ${U.term(c, 'x')} from both sides: ${lin(k, b)} = ${F(d)}.`],
        `${U.term(k, 'x')} = ${F(top)}, so x = ${sfr(top, k)}.`);
    };

    const puzzle = () => {
      const x = R(2, 15), a = R(3, 7), c = R(1, a - 1), b = R(1, 12), d = (a - c) * x - b;
      if (d <= 0) return null;
      return num(`I think of a number. I multiply it by ${a} and subtract ${b}.\nI get the same answer if I multiply my number by ${c} and add ${d}.\nWhat is my number?`, x,
        ['Call the number n and write an equation with n on both sides.', `${a}n − ${b} = ${c === 1 ? '' : c}n + ${d}. Now subtract ${c === 1 ? '' : c}n from both sides.`],
        `${a}n − ${b} = ${c === 1 ? '' : c}n + ${d}, so ${a - c === 1 ? `n = ${d + b}` : `${a - c}n = ${d + b} and n = ${x}`}.`);
    };

    const spot = () => {
      const x = R(2, 9), c = R(1, 4), a = c + R(2, 5), b = R(2, 9), d = (a - c) * x - b, who = U.name();
      if (d <= 0) return null;
      const wrongRHS = d - b, wx = wrongRHS / (a - c);
      return num(`${who} solves ${lin(a, -b)} = ${lin(c, d)} like this:\n${lin(a - c, -b)} = ${d}\n${U.term(a - c, 'x')} = ${F(wrongRHS)}\nx = ${sfr(wrongRHS, a - c)}\nFind the mistake. What is the correct value of x?`, x,
        ['Check each line. To remove − ' + b + ' from the left side, what must you do to both sides?', `From ${lin(a - c, -b)} = ${d}, **add** ${b} to both sides (not subtract).`],
        `${who} subtracted ${b} instead of adding it. ${U.term(a - c, 'x')} = ${d + b}, so x = ${x}.`);
    };

    const perimeter = () => {
      const x = R(2, 9), p = R(2, 3), a = R(1, 6), b = R(1, 6), P0 = 2 * (p * x + a) + 2 * (x + b);
      return num(`A rectangle has length (${lin(p, a)}) cm and width (${lin(1, b)}) cm.\nIts perimeter is ${P0} cm. Find x.`, x,
        ['Perimeter = 2 × length + 2 × width. Write an equation and solve it.', `2(${lin(p, a)}) + 2(${lin(1, b)}) = ${P0}, so ${lin(2 * p + 2, 2 * a + 2 * b)} = ${P0}.`],
        `${lin(2 * p + 2, 2 * a + 2 * b)} = ${P0}, so ${U.term(2 * p + 2, 'x')} = ${P0 - 2 * a - 2 * b} and x = ${x}.`,
        { visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `(${lin(p, a)}) cm`, height: `(${lin(1, b)}) cm` } } });
    };

    PMLM.registerSkill({
      id: 'g9.equations', grade: 9, unit: 'g9.u3', title: 'Linear equations', icon: '🔑',
      blurb: 'Solve equations with brackets, fractions, x both sides',
      lesson: [
        { title: 'Keep it balanced',
          text: 'An equation is like a balance. Whatever you do to one side, do to the other.\nUndo operations in reverse order.\n3x + 7 = 22 → 3x = 15 → x = 5',
          visual: { type: 'balance', left: '3x + 7', right: '22' } },
        { title: 'Unknowns on both sides',
          text: 'Subtract the **smaller** x term from both sides first.\n7x − 4 = 3x + 16\n4x − 4 = 16 (subtract 3x)\n4x = 20, so x = 5',
          visual: { type: 'balance', left: '7x − 4', right: '3x + 16' } },
        { title: 'Brackets and fractions',
          text: 'Brackets: expand first (or divide both sides).\n4(x − 3) = 20 → x − 3 = 5 → x = 8\nFractions: multiply both sides by the denominator.\n{x + 5/3} = 4 → x + 5 = 12 → x = 7' },
        { title: 'Check your answer',
          text: 'Put your answer back into the equation. Both sides should match.\nx = 5 in 7x − 4 = 3x + 16:\n35 − 4 = 31 and 15 + 16 = 31 ✓' },
        { title: 'Worked example',
          text: 'Solve {2x + 1/3} = {x + 4/2}.\n**1.** Multiply both sides by 3 and by 2: 2(2x + 1) = 3(x + 4).\n**2.** Expand: 4x + 2 = 3x + 12.\n**3.** Subtract 3x: x + 2 = 12, so x = 10.\nAnswer: **x = 10**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [twoStep, twoStep, bracket, bracket, () => retry(fractionEq)],
          [bothSides, bothSides, () => retry(fractionEq), () => retry(puzzle), () => retry(spot), bracket, perimeter],
          [() => retry(fracBoth), () => retry(fracBoth), () => retry(bracketsBoth), fracAnswer, bothSides, perimeter],
        ], ctx);
      },
    });
  }

  /* 11 ── Changing the subject of a formula */
  {
    // each template → { f: formula, t: target letter, ans, wr: [...], h: hint step, e: explanation }
    const T1 = [
      () => ({ f: 'v = u + at', t: 'u', ans: 'u = v − at', wr: ['u = v + at', 'u = at − v', 'u = {v/at}'], h: 'Subtract at from both sides.', e: 'v − at = u, so u = v − at.' }),
      () => { const k = R(2, 12), s = sgn(); return { f: `y = x ${s > 0 ? '+' : '−'} ${k}`, t: 'x', ans: `x = y ${s > 0 ? '−' : '+'} ${k}`, wr: [`x = y ${s > 0 ? '+' : '−'} ${k}`, `x = ${k} ${s > 0 ? '−' : '+'} y`, `x = {y/${k}}`], h: `${s > 0 ? 'Subtract' : 'Add'} ${k} ${s > 0 ? 'from' : 'to'} both sides.`, e: `Do the inverse of ${s > 0 ? '+' : '−'} ${k}: x = y ${s > 0 ? '−' : '+'} ${k}.` }; },
      () => { const k = R(2, 9); return { f: `y = ${k}x`, t: 'x', ans: `x = {y/${k}}`, wr: [`x = y − ${k}`, `x = ${k}y`, `x = {${k}/y}`], h: `x is multiplied by ${k}. Divide both sides by ${k}.`, e: `Divide both sides by ${k}: x = {y/${k}}.` }; },
      () => { const a = R(2, 9), b = nz(-9, 9), bs = b > 0 ? '−' : '+', bw = b > 0 ? '+' : '−'; return { f: `y = ${lin(a, b)}`, t: 'x', ans: `x = {y ${bs} ${A(b)}/${a}}`, wr: [`x = {y ${bw} ${A(b)}/${a}}`, `x = {y/${a}} ${bs} ${A(b)}`, `x = ${a}(y ${bs} ${A(b)})`], h: `First ${b > 0 ? 'subtract' : 'add'} ${A(b)} on both sides: y ${bs} ${A(b)} = ${a}x.`, e: `y ${bs} ${A(b)} = ${a}x, then divide by ${a}: x = {y ${bs} ${A(b)}/${a}}.` }; },
      () => ({ f: 'C = πd', t: 'd', ans: 'd = {C/π}', wr: ['d = C − π', 'd = πC', 'd = {π/C}'], h: 'd is multiplied by π. Divide both sides by π.', e: 'Divide both sides by π: d = {C/π}.' }),
    ];
    const T2 = [
      () => ({ f: 'A = {1/2}bh', t: 'h', ans: 'h = {2A/b}', wr: ['h = {A/2b}', 'h = {2b/A}', 'h = 2Ab'], h: 'Multiply both sides by 2 to clear the half: 2A = bh.', e: '2A = bh, then divide by b: h = {2A/b}.' }),
      () => ({ f: 'P = 2l + 2w', t: 'l', ans: 'l = {P − 2w/2}', wr: ['l = {P/2} − 2w', 'l = P − 2w − 2', 'l = {P + 2w/2}'], h: 'Subtract 2w from both sides: P − 2w = 2l.', e: 'P − 2w = 2l, then divide by 2: l = {P − 2w/2}.' }),
      () => { const a = R(2, 9), b = R(2, 6); return { f: `y = {x + ${a}/${b}}`, t: 'x', ans: `x = ${b}y − ${a}`, wr: [`x = {y − ${a}/${b}}`, `x = ${b}(y + ${a})`, `x = ${b}y + ${a}`], h: `Multiply both sides by ${b}: ${b}y = x + ${a}.`, e: `${b}y = x + ${a}, then subtract ${a}: x = ${b}y − ${a}.` }; },
      () => ({ f: 'C = 2πr', t: 'r', ans: 'r = {C/2π}', wr: ['r = C − 2π', 'r = {2π/C}', 'r = 2πC'], h: 'r is multiplied by 2π. Divide both sides by 2π.', e: 'Divide both sides by 2π: r = {C/2π}.' }),
      () => ({ f: 's = {d/t}', t: 't', ans: 't = {d/s}', wr: ['t = ds', 't = {s/d}', 't = d − s'], h: 'Multiply both sides by t: st = d.', e: 'st = d, then divide by s: t = {d/s}.' }),
      () => ({ f: 'F = {9/5}C + 32', t: 'C', ans: 'C = {5/9}(F − 32)', wr: ['C = {5/9}F − 32', 'C = {9/5}(F − 32)', 'C = {5/9}(F + 32)'], h: 'Subtract 32 from both sides first: F − 32 = {9/5}C.', e: 'F − 32 = {9/5}C. Multiply by {5/9}: C = {5/9}(F − 32).' }),
      () => ({ f: 'y = mx + c', t: 'x', ans: 'x = {y − c/m}', wr: ['x = {y/m} − c', 'x = {y + c/m}', 'x = m(y − c)'], h: 'Subtract c from both sides: y − c = mx.', e: 'y − c = mx, then divide by m: x = {y − c/m}.' }),
      () => ({ f: 'a = {v − u/t}', t: 'v', ans: 'v = u + at', wr: ['v = at − u', 'v = {u/at}', 'v = u + {a/t}'], h: 'Multiply both sides by t: at = v − u.', e: 'at = v − u, then add u: v = u + at.' }),
    ];
    const T3 = [
      () => ({ f: 'A = πr^{2}', t: 'r', ans: 'r = √(A ÷ π)', wr: ['r = {A/2π}', 'r = √A − π', 'r = (A ÷ π)^{2}', 'r = √(A − π)'], h: 'Divide both sides by π: {A/π} = r^{2}.', e: '{A/π} = r^{2}, so take the square root: r = √(A ÷ π).' }),
      () => ({ f: 'E = {1/2}mv^{2}', t: 'v', ans: 'v = √(2E ÷ m)', wr: ['v = √(E ÷ 2m)', 'v = {2E/m}', 'v = √(2Em)'], h: 'Multiply both sides by 2: 2E = mv^{2}.', e: '2E = mv^{2}, so v^{2} = {2E/m}. Take the square root: v = √(2E ÷ m).' }),
      () => ({ f: 'V = πr^{2}h', t: 'h', ans: 'h = {V/πr²}', wr: ['h = V − πr²', 'h = {πr²/V}', 'h = {V/2πr}'], h: 'h is multiplied by πr^{2}. Divide both sides by πr^{2}.', e: 'Divide both sides by πr^{2}: h = {V/πr²}.' }),
      () => { const a = pick([12, 20, 24, 30, 36]); return { f: `y = {${a}/x}`, t: 'x', ans: `x = {${a}/y}`, wr: [`x = ${a}y`, `x = {y/${a}}`, `x = ${a} − y`], h: 'Multiply both sides by x: xy = ' + a + '.', e: `xy = ${a}, then divide by y: x = {${a}/y}.` }; },
      () => ({ f: 's = {(u + v)t/2}', t: 'u', ans: 'u = {2s/t} − v', wr: ['u = {2s − v/t}', 'u = 2st − v', 'u = {s/2t} − v'], h: 'Multiply both sides by 2, then divide by t: {2s/t} = u + v.', e: '{2s/t} = u + v, so u = {2s/t} − v.' }),
      () => { const a = R(2, 9); return { f: `y = 3(x − ${a})`, t: 'x', ans: `x = {y/3} + ${a}`, wr: [`x = {y/3} − ${a}`, `x = 3y + ${a}`, `x = {y + ${a}/3}`], h: `Divide both sides by 3: {y/3} = x − ${a}.`, e: `{y/3} = x − ${a}, then add ${a}: x = {y/3} + ${a}.` }; },
    ];

    const rearrange = L => {
      const t = pick([T1, T2, T3][L - 1])();
      return choice(`Make **${t.t}** the subject of the formula\n${t.f}`, t.ans, t.wr,
        [`Use inverse operations to get ${t.t} on its own. Undo what happens to ${t.t}, in reverse order.`, t.h], t.e);
    };

    const spot = () => {
      const a = R(2, 9), b = R(2, 9), who = U.name();
      return choice(`${who} makes x the subject of y = ${a}x − ${b} and writes x = {y − ${b}/${a}}.\nWhat should the answer be?`, `x = {y + ${b}/${a}}`,
        [`x = {y − ${b}/${a}}`, `x = {y/${a}} + ${b}`, `x = ${a}(y + ${b})`],
        [`To undo − ${b}, you must do the opposite on both sides.`, `Add ${b} to both sides: y + ${b} = ${a}x.`],
        `y + ${b} = ${a}x, so x = {y + ${b}/${a}}. ${who} subtracted ${b} instead of adding it.`);
    };

    const substitute = () => {
      const t = R(1, 4);
      if (t === 1) {
        const u = R(0, 12), a = R(2, 6), tt = R(2, 9), v = u + a * tt;
        return num(`v = u + at\nFind t when v = ${v}, u = ${u} and a = ${a}.`, tt,
          ['Make t the subject first, or put the numbers in and solve the equation.', `${v} = ${u} + ${a}t. Subtract ${u} from both sides.`],
          `${v} − ${u} = ${a}t, so ${v - u} = ${a}t and t = ${tt}.`);
      }
      if (t === 2) {
        const b = pick([4, 6, 8, 10, 12]), h = R(3, 12), Ar = b * h / 2;
        return num(`A = {1/2}bh\nFind h when A = ${Ar} and b = ${b}.`, h,
          ['Rearrange to h = {2A/b}, or put the numbers in and solve.', `${Ar} = {1/2} × ${b} × h, so ${Ar} = ${b / 2}h.`],
          `${Ar} = ${b / 2}h, so h = ${Ar} ÷ ${b / 2} = ${h}.`);
      }
      if (t === 3) {
        const l = R(5, 15), w = R(2, l - 1), Pp = 2 * l + 2 * w;
        return num(`P = 2l + 2w\nFind w when P = ${Pp} and l = ${l}.`, w,
          ['Put the numbers in, then solve the equation for w.', `${Pp} = 2 × ${l} + 2w, so ${Pp} = ${2 * l} + 2w.`],
          `2w = ${Pp} − ${2 * l} = ${Pp - 2 * l}, so w = ${w}.`);
      }
      const m = R(2, 6), x = nz(-6, 9), c = nz(-9, 9), y = m * x + c;
      return num(`y = mx + c\nFind x when y = ${F(y)}, m = ${m} and c = ${F(c)}.`, x,
        ['Rearrange to x = {y − c/m}, or put the numbers in and solve.', `${F(y)} = ${m}x ${c < 0 ? '−' : '+'} ${A(c)}. ${c < 0 ? 'Add' : 'Subtract'} ${A(c)} on both sides.`],
        `${m}x = ${F(y - c)}, so x = ${F(x)}.`);
    };

    PMLM.registerSkill({
      id: 'g9.subject', grade: 9, unit: 'g9.u3', title: 'Changing the subject', icon: '🔄',
      blurb: 'Rearrange formulae to get a letter on its own',
      lesson: [
        { title: 'What is the subject?',
          text: 'The **subject** is the letter on its own on one side.\nIn v = u + at, the subject is v.\nTo change the subject, rearrange the formula using inverse operations, just like solving an equation.' },
        { title: 'Undo in reverse order',
          text: 'Make x the subject of y = 3x + 5.\nTo build y: × 3, then + 5.\nTo undo: − 5, then ÷ 3.\ny − 5 = 3x, so x = {y − 5/3}',
          visual: { type: 'table', headers: ['To build y from x', 'To undo (get x back)'], rows: [['1. × 3', '1. − 5'], ['2. + 5', '2. ÷ 3']] } },
        { title: 'Fractions and squares',
          text: 'Clear fractions by multiplying: s = {d/t} → st = d → t = {d/s}\nUndo a square with a square root: A = πr^{2} → r^{2} = {A/π} → r = √(A ÷ π)' },
        { title: 'Worked example',
          text: 'Make l the subject of P = 2l + 2w.\n**1.** Subtract 2w from both sides: P − 2w = 2l.\n**2.** Divide both sides by 2.\n**3.** l = {P − 2w/2}\nAnswer: **l = {P − 2w/2}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [rearrange, rearrange, rearrange, substitute],
          [rearrange, rearrange, substitute, spot],
          [rearrange, rearrange, rearrange, substitute, spot],
        ], ctx);
      },
    });
  }

  /* 12 ── Linear inequalities */
  {
    const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
    const STRICT = { '<': '≤', '≤': '<', '>': '≥', '≥': '>' };
    const sym = () => pick(['<', '>', '≤', '≥']);

    const solveSimple = L => {
      const a = R(2, 8), k = L === 1 ? R(1, 10) : nz(-8, 10), b = nz(-12, 12), c = a * k + b, s = sym();
      return choice(`Solve ${lin(a, b)} ${s} ${F(c)}`, `x ${s} ${F(k)}`,
        [`x ${FLIP[s]} ${F(k)}`, `x ${STRICT[s]} ${F(k)}`, `x ${s} ${F(c - b)}`, ...(Number.isInteger((c + b) / a) ? [`x ${s} ${F((c + b) / a)}`] : []), `x ${FLIP[s]} ${F(-k)}`],
        ['Solve it just like an equation, but keep the inequality sign.', `${b > 0 ? 'Subtract' : 'Add'} ${A(b)} ${b > 0 ? 'from' : 'to'} both sides: ${a}x ${s} ${F(c - b)}.`],
        `${a}x ${s} ${F(c - b)}, so x ${s} ${F(k)}.`);
    };

    const bothSides = () => {
      const c = R(1, 5), a = c + R(1, 5), k = nz(-6, 10), b = nz(-12, 12), d = (a - c) * k + b, s = sym();
      return choice(`Solve ${lin(a, b)} ${s} ${lin(c, d)}`, `x ${s} ${F(k)}`,
        [`x ${FLIP[s]} ${F(k)}`, `x ${STRICT[s]} ${F(k)}`, ...(Number.isInteger((d + b) / (a - c)) ? [`x ${s} ${F((d + b) / (a - c))}`] : []), `x ${s} ${F(-k)}`, `x ${s} ${F(d - b)}`],
        ['Collect the x terms on one side, keeping the inequality sign.', `Subtract ${U.term(c, 'x')} from both sides: ${lin(a - c, b)} ${s} ${F(d)}.`],
        `${lin(a - c, b)} ${s} ${F(d)}, so ${U.term(a - c, 'x')} ${s} ${F(d - b)} and x ${s} ${F(k)}.`);
    };

    const doubleIneq = () => {
      const a = R(2, 5), lo = R(-6, 2), hi = lo + R(2, 6), b = nz(-7, 7), p = a * lo + b, q = a * hi + b;
      const [s1, s2] = pick([['<', '≤'], ['≤', '<'], ['≤', '≤'], ['<', '<']]);
      return choice(`Solve ${F(p)} ${s1} ${lin(a, b)} ${s2} ${F(q)}`, `${F(lo)} ${s1} x ${s2} ${F(hi)}`,
        [`${F(lo)} ${STRICT[s1]} x ${STRICT[s2]} ${F(hi)}`, `${F(p - b)} ${s1} x ${s2} ${F(q - b)}`, `${F(U.round(p / a, 2))} ${s1} x ${s2} ${F(U.round(q / a, 2))}`, `${F(lo)} ${s1} x ${s2} ${F(q - b)}`],
        ['Do the same thing to **all three** parts.', `${b > 0 ? 'Subtract' : 'Add'} ${A(b)} on all three parts: ${F(p - b)} ${s1} ${a}x ${s2} ${F(q - b)}.`],
        `${F(p - b)} ${s1} ${a}x ${s2} ${F(q - b)}. Divide all three parts by ${a}: ${F(lo)} ${s1} x ${s2} ${F(hi)}.`);
    };

    const negDivide = () => {
      const a = R(2, 6), k = nz(-5, 6), c = nz(-10, 15), d = c - a * k, s = sym();
      // c − ax  s  d   →  −ax s d − c  →  x FLIP[s] k
      return choice(`Solve ${F(c)} − ${U.term(a, 'x')} ${s} ${F(d)}`, `x ${FLIP[s]} ${F(k)}`,
        [`x ${s} ${F(k)}`, `x ${FLIP[s]} ${F(-k)}`, `x ${s} ${F(-k)}`],
        ['When you multiply or divide both sides by a **negative** number, you must reverse the inequality sign.', `Subtract ${F(c)} from both sides: −${U.term(a, 'x')} ${s} ${F(d - c)}.`],
        `−${U.term(a, 'x')} ${s} ${F(d - c)}. Dividing by −${a} reverses the sign: x ${FLIP[s]} ${F(k)}.`);
    };

    const intCount = L => {
      if (L === 3) {
        const a = R(2, 4), lo = R(-5, 1), hi = lo + R(2, 6), b = nz(-6, 6), p = a * lo + b, q = a * hi + b;
        const n = hi - lo; // lo < n ≤ hi
        return num(`How many integers n satisfy ${F(p)} < ${lin(a, b, 'n')} ≤ ${F(q)}?`, n,
          ['Solve the inequality first, then list the integers.', `${b > 0 ? 'Subtract' : 'Add'} ${A(b)}, then divide all parts by ${a}: ${F(lo)} < n ≤ ${F(hi)}.`],
          `${F(lo)} < n ≤ ${F(hi)}: the integers are ${U.range(lo + 1, hi).map(v => F(v)).join(', ')}. That is ${n} integers.`);
      }
      const lo = R(-6, 2), hi = lo + R(2, 7), [s1, s2] = pick([['<', '≤'], ['≤', '<'], ['≤', '≤'], ['<', '<']]);
      const from = s1 === '<' ? lo + 1 : lo, to = s2 === '<' ? hi - 1 : hi, list = U.range(from, to);
      return num(`How many integers x satisfy ${F(lo)} ${s1} x ${s2} ${F(hi)}?`, list.length,
        ['< means the end number is **not** included. ≤ means it **is** included.', `The smallest integer that works is ${F(from)}. Now find the largest and count.`],
        `The integers are ${list.map(v => F(v)).join(', ')}. That is ${list.length}.`);
    };

    const smallest = () => {
      const a = R(2, 7), b = nz(-10, 10), c = R(-10, 30), big = coin();
      const v = (c - b) / a;   // boundary
      const strict = coin();
      const s = big ? (strict ? '>' : '≥') : (strict ? '<' : '≤');
      let ans;
      if (big) ans = Number.isInteger(v) ? (strict ? v + 1 : v) : Math.ceil(v);
      else ans = Number.isInteger(v) ? (strict ? v - 1 : v) : Math.floor(v);
      return num(`What is the ${big ? 'smallest' : 'largest'} integer that satisfies ${lin(a, b)} ${s} ${F(c)}?`, ans,
        ['Solve the inequality first. Then think about which whole numbers fit.', `${b > 0 ? 'Subtract' : 'Add'} ${A(b)}: ${a}x ${s} ${F(c - b)}. Now divide by ${a}.`],
        `x ${s} ${Number.isInteger(v) ? F(v) : `${sfr(c - b, a)} (= ${F(U.round(v, 2))}${Number.isInteger(U.round(v, 2)) || U.round(v, 2) === v ? '' : '…'})`}, so the ${big ? 'smallest' : 'largest'} integer is ${F(ans)}.`);
    };

    const lineWhich = () => {
      const lo = R(-5, 3), hi = lo + R(1, 5);
      const correct = [`${F(lo)} ≤ x ≤ ${F(hi)}`, `${F(lo - 1)} < x ≤ ${F(hi)}`, `${F(lo)} ≤ x < ${F(hi + 1)}`, `${F(lo - 1)} < x < ${F(hi + 1)}`];
      const wrong = [`${F(lo)} < x ≤ ${F(hi)}`, `${F(lo)} ≤ x < ${F(hi)}`, `${F(lo - 1)} ≤ x ≤ ${F(hi)}`, `${F(lo)} ≤ x ≤ ${F(hi + 1)}`, `${F(lo)} < x < ${F(hi)}`];
      const ans = pick(correct);
      return choice('x is an integer. The dots show **all** the values of x.\nWhich inequality describes them?', ans, U.sample(wrong, 3),
        ['Check the smallest and largest dots. Is each end number included (≤) or not (<)?', `The smallest dot is at ${F(lo)} and the largest is at ${F(hi)}. Test the end numbers in each inequality.`],
        `The integers are ${U.range(lo, hi).map(v => F(v)).join(', ')}. ${ans} gives exactly these.`,
        { visual: { type: 'numberLine', min: lo - 3, max: hi + 3, step: 1, points: U.range(lo, hi).map(v => ({ at: v })) } });
    };

    const listInts = () => {
      const lo = R(-5, 2), hi = lo + R(2, 5), [s1, s2] = pick([['<', '≤'], ['≤', '<'], ['<', '<'], ['≤', '≤']]);
      const set = (a, b) => U.range(a, b).map(v => F(v)).join(', ');
      const from = s1 === '<' ? lo + 1 : lo, to = s2 === '<' ? hi - 1 : hi;
      return choice(`Which list shows all the integers that satisfy ${F(lo)} ${s1} x ${s2} ${F(hi)}?`, set(from, to),
        [set(lo, hi), set(lo + 1, hi - 1), set(lo, hi - 1), set(lo + 1, hi)].filter(x => x),
        ['< means the end number is not included. ≤ means it is included.', `Is ${F(lo)} included? The sign next to it is ${s1}.`],
        `${F(lo)} is ${s1 === '<' ? 'not ' : ''}included and ${F(hi)} is ${s2 === '<' ? 'not ' : ''}included, so the integers are ${set(from, to)}.`,
        { visual: { type: 'numberLine', min: lo - 2, max: hi + 2, step: 1, points: [{ at: lo, label: F(lo) }, { at: hi, label: F(hi) }] } });
    };

    PMLM.registerSkill({
      id: 'g9.inequalities', grade: 9, unit: 'g9.u3', title: 'Linear inequalities', icon: '↔️',
      blurb: 'Solve inequalities and show them on a number line',
      lesson: [
        { title: 'Inequality signs',
          text: '< less than   ≤ less than or equal to\n> greater than   ≥ greater than or equal to\nx > 2 means x can be 2.1, 3, 50… but **not** 2.\nx ≥ 2 includes 2.',
          visual: { type: 'table', headers: ['Inequality', 'Is 2 included?'], rows: [['x > 2', 'no'], ['x ≥ 2', 'yes'], ['x < 2', 'no'], ['x ≤ 2', 'yes']] } },
        { title: 'Integer solutions',
          text: 'Which integers satisfy −2 < x ≤ 3?\n−2 is **not** included, 3 **is** included.\nSo x = −1, 0, 1, 2, 3.',
          visual: { type: 'numberLine', min: -4, max: 5, step: 1, points: [{ at: -1 }, { at: 0 }, { at: 1 }, { at: 2 }, { at: 3 }] } },
        { title: 'Solving inequalities',
          text: 'Solve them like equations: do the same to both sides.\n2x + 3 > 11\n2x > 8 (subtract 3)\nx > 4 (divide by 2)' },
        { title: 'Careful with negatives',
          text: 'If you multiply or divide by a **negative** number, reverse the sign.\n7 − 3x > 1\n−3x > −6\nx < 2 (÷ −3, so > becomes <)\nCheck with x = 0: 7 − 0 = 7, and 7 > 1 ✓' },
        { title: 'Worked example',
          text: 'Solve −3 < 2x + 1 ≤ 9.\n**1.** Subtract 1 from all three parts: −4 < 2x ≤ 8.\n**2.** Divide all three parts by 2: −2 < x ≤ 4.\n**3.** Integer solutions: −1, 0, 1, 2, 3, 4.\nAnswer: **−2 < x ≤ 4**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [solveSimple, solveSimple, intCount, lineWhich, listInts],
          [bothSides, doubleIneq, lineWhich, intCount, smallest, solveSimple],
          [negDivide, negDivide, doubleIneq, smallest, intCount, bothSides],
        ], ctx);
      },
    });
  }

  /* 13 ── Simultaneous linear equations */
  {
    const eq = (a, b, c) => `${ex([[a, 'x'], [b, 'y']])} = ${F(c)}`;
    const pair = (e1, e2) => `${e1}\n${e2}`;

    const addElim = L => {
      const x = R(2, 10), y = L === 1 ? R(1, x - 1 || 1) : nz(-5, 9), s = x + y, d = x - y, askX = coin();
      if (x === y) return null;
      return num(`Solve the simultaneous equations.\n${pair(eq(1, 1, s), eq(1, -1, d))}\nFind the value of **${askX ? 'x' : 'y'}**.`, askX ? x : y,
        ['Add the two equations: the y terms cancel out.', askX ? `Adding: 2x = ${F(s + d)}.` : `Adding: 2x = ${F(s + d)}, so x = ${F(x)}. Now put x = ${F(x)} into x + y = ${F(s)}.`],
        `Adding gives 2x = ${F(s + d)}, so x = ${F(x)}. Then ${F(x)} + y = ${F(s)}, so y = ${F(y)}.`);
    };

    const subElim = () => {
      const x = nz(-4, 8), y = nz(-4, 8), b = R(1, 4), a1 = R(3, 7), a2 = retry(() => { const v = R(1, 5); return a1 - v < 2 ? null : v; });
      const c1 = a1 * x + b * y, c2 = a2 * x + b * y, askX = coin();
      const da = a1 - a2, dc = c1 - c2;
      return num(`Solve the simultaneous equations.\n${pair(eq(a1, b, c1), eq(a2, b, c2))}\nFind the value of **${askX ? 'x' : 'y'}**.`, askX ? x : y,
        ['Both equations have the same y term. Subtract one equation from the other.', askX ? `First − second: ${U.term(da, 'x')} = ${F(dc)}.` : `First − second: ${U.term(da, 'x')} = ${F(dc)}, so x = ${F(x)}. Now put this into the second equation.`],
        `Subtracting gives ${U.term(da, 'x')} = ${F(dc)}, so x = ${F(x)}. Then ${eq(a2, b, c2).replace('x', `(${F(x)})`).replace(/^(\d*)\(/, (m, k) => (k ? k + ' × (' : '('))} gives y = ${F(y)}.`);
    };

    const substitution = () => {
      const x = nz(-4, 7), m = nz(-3, 4), c = nz(-6, 6), y = m * x + c, a = R(1, 5), b = nz(-3, 4);
      if (a + b * m === 0) return null;
      const d = a * x + b * y, askX = coin();
      return num(`Solve the simultaneous equations.\n${pair(`y = ${lin(m, c)}`, eq(a, b, d))}\nFind the value of **${askX ? 'x' : 'y'}**.`, askX ? x : y,
        ['The first equation tells you what y equals. Substitute it into the second equation.', `${U.term(a, 'x')} ${b < 0 ? '−' : '+'} ${A(b) === '1' ? '' : A(b)}(${lin(m, c)}) = ${F(d)}. Now expand and solve for x.`],
        `${lin(a + b * m, b * c)} = ${F(d)}, so x = ${F(x)}. Then y = ${m === 1 ? '' : m === -1 ? M : F(m) + ' × '}${P(x)} ${c < 0 ? '−' : '+'} ${A(c)} = ${F(y)}.`);
    };

    const multiplyOne = () => {
      const x = nz(-4, 8), y = nz(-4, 8), a2 = R(1, 4), b2 = nz(-3, 3), k = R(2, 4), a1 = retry(() => { const v = R(1, 7); return v === k * a2 ? null : v; });
      const b1 = k * b2, c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y, askX = coin();
      const da = a1 - k * a2, dc = c1 - k * c2;
      return num(`Solve the simultaneous equations.\n${pair(eq(a1, b1, c1), eq(a2, b2, c2))}\nFind the value of **${askX ? 'x' : 'y'}**.`, askX ? x : y,
        [`Multiply the second equation by ${k} so that the y terms match. Then subtract.`, `× ${k}: ${eq(k * a2, k * b2, k * c2)}. ${da > 0 ? 'Subtract this from the first equation.' : 'Subtract the first equation from this one.'}`],
        `Subtracting gives ${U.term(Math.abs(da), 'x')} = ${F(da > 0 ? dc : -dc)}, so x = ${F(x)}. Substituting back gives y = ${F(y)}.`);
    };

    const tickets = (L, ctx) => {
      const ad = R(6, 15), ch = R(2, ad - 1), n1 = R(1, 3), n2 = n1 + R(1, 2), m = R(2, 4);
      const t1 = n1 * ad + m * ch, t2 = n2 * ad + m * ch, askA = coin(), cur = x => money(ctx.currency, x);
      return num(`${n1} adult ${n1 === 1 ? 'ticket' : 'tickets'} and ${m} child tickets cost ${cur(t1)}.\n${n2} adult tickets and ${m} child tickets cost ${cur(t2)}.\nHow much is one ${askA ? 'adult' : 'child'} ticket?`, askA ? ad : ch,
        ['Write two equations, using a for an adult ticket and c for a child ticket. Then eliminate c.', `${n1 === 1 ? '' : n1}a + ${m}c = ${t1} and ${n2}a + ${m}c = ${t2}. Subtract the first from the second.`],
        `Subtracting: ${n2 - n1 === 1 ? `a = ${ad}` : `${n2 - n1}a = ${t2 - t1}, so a = ${ad}`}. Then ${n1 === 1 ? '' : n1 + ' × '}${ad} + ${m}c = ${t1}, so c = ${ch}.`, { prefix: ctx.currency });
    };

    const coordAns = () => {
      const x = nz(-5, 6), y = nz(-5, 6), a = R(1, 3), b = R(1, 3), c = R(1, 3), d = -R(1, 3);
      if (a * d - b * c === 0) return null;
      return coord(`Solve the simultaneous equations.\n${pair(eq(a, b, a * x + b * y), eq(c, d, c * x + d * y))}\nGive your answer as (x, y).`, x, y,
        ['Make the coefficients of x (or y) the same in both equations, then add or subtract to eliminate it.',
          a === c ? `Both equations have ${U.term(a, 'x')}. Subtract the second equation from the first.`
            : `${[c > 1 ? `Multiply the first equation by ${c}` : '', a > 1 ? `${c > 1 ? 'and' : 'Multiply'} the second by ${a}` : ''].filter(Boolean).join(' ')}, so both have ${U.term(a * c, 'x')}. Then subtract.`],
        `Eliminating x gives y = ${F(y)}. Substituting back gives x = ${F(x)}. So the solution is (${F(x)}, ${F(y)}).`);
    };

    const whichPair = () => {
      const x = R(1, 7), y = retry(() => { const v = R(1, 7); return v === x ? null : v; });
      const a = R(1, 4), b = R(1, 4), c = R(1, 4), d = -R(1, 3);
      const sol = (p, q) => `x = ${F(p)}, y = ${F(q)}`;
      const e1 = eq(a, b, a * x + b * y), e2 = eq(c, d, c * x + d * y);
      // a pair that only fits the first equation
      const only1 = b % a === 0 ? [x + b / a, y - 1] : [x - b, y + a];
      return choice(`Which values of x and y satisfy **both** equations?\n${pair(e1, e2)}`, sol(x, y),
        [sol(y, x), sol(...only1), sol(x, -y), sol(-x, y)],
        ['A solution must make **both** equations true. Test each pair in both equations.', `Test x = ${F(y)}, y = ${F(x)} in the first equation: ${a} × ${F(y)} + ${b} × ${F(x)} = ${F(a * y + b * x)}. Does it equal ${F(a * x + b * y)}?`],
        `x = ${F(x)}, y = ${F(y)}: ${a} × ${F(x)} + ${b} × ${F(y)} = ${F(a * x + b * y)} ✓ and ${c} × ${F(x)} − ${-d} × ${F(y)} = ${F(c * x + d * y)} ✓.`);
    };

    PMLM.registerSkill({
      id: 'g9.simultaneous', grade: 9, unit: 'g9.u3', title: 'Simultaneous equations', icon: '🔗',
      blurb: 'Solve two equations with two unknowns',
      lesson: [
        { title: 'Two equations, two unknowns',
          text: 'Simultaneous equations are both true **at the same time**.\nx + y = 5 and y = x + 1 meet where both lines cross: x = 2, y = 3.',
          visual: { type: 'grid', xmin: -2, xmax: 6, ymin: -2, ymax: 6, lines: [{ m: -1, c: 5, label: 'x + y = 5' }, { m: 1, c: 1, label: 'y = x + 1' }], points: [{ x: 2, y: 3, label: '(2, 3)' }] } },
        { title: 'Elimination',
          text: 'Add or subtract the equations to make one letter disappear.\nx + y = 10\nx − y = 4\nAdd: 2x = 14, so x = 7. Then 7 + y = 10, so y = 3.' },
        { title: 'Make the numbers match',
          text: 'If no letter cancels yet, multiply an equation first.\n2x + 3y = 13\nx + y = 5 → × 3 → 3x + 3y = 15\nSubtract: x = 2. Then y = 3.' },
        { title: 'Substitution',
          text: 'If one equation says y = …, put it into the other.\ny = 2x + 1 and 3x + y = 16\n3x + (2x + 1) = 16 → 5x = 15 → x = 3, y = 7' },
        { title: 'Worked example',
          text: 'Solve 3x + 2y = 16 and x + 2y = 8.\n**1.** Both have 2y, so subtract: 2x = 8.\n**2.** x = 4.\n**3.** Put x = 4 in x + 2y = 8: 2y = 4, so y = 2.\n**4.** Check in the first: 12 + 4 = 16 ✓\nAnswer: **x = 4, y = 2**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [L => retry(() => addElim(L)), L => retry(() => addElim(L)), subElim, whichPair],
          [subElim, () => retry(substitution), L => retry(() => addElim(L)), whichPair, tickets],
          [multiplyOne, multiplyOne, () => retry(coordAns), () => retry(substitution), tickets],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 4: Sequences and graphs ═══════════════════════
  PMLM.registerUnit({ id: 'g9.u4', grade: 9, name: 'Sequences and graphs', icon: '📉' });

  /* 14 ── nth term of linear and simple quadratic sequences */
  {
    // nth term text: 3n + 2, or 23 − 3n for decreasing sequences
    const nth = (d, c) => (d < 0 && c > 0 ? `${F(c)} − ${U.term(-d, 'n')}` : lin(d, c, 'n'));
    const terms = (f, k = 4) => U.range(1, k).map(f);

    const linearNth = L => {
      const d = L === 1 ? R(2, 9) : nz(-6, 9), a = L === 1 ? R(1, 12) : R(-5, 25), c = a - d;
      if (c === 0 || d === 1) return null;
      const t = terms(n => d * n + c);
      return choice(`Find the nth term of the sequence\n${t.map(v => F(v)).join(', ')}, …`, nth(d, c),
        [lin(1, d, 'n'), lin(d, a, 'n'), lin(a, d, 'n'), nth(d, -c), nth(-d, c)].filter(x => x !== nth(d, c)),
        ['The difference between terms tells you the number in front of n. Then adjust with a number term.', `The terms go up by ${F(d)} each time, so the nth term starts with ${U.term(d, 'n')}. When n = 1, ${U.term(d, 'n')} gives ${F(d)}. What must you add to get ${F(a)}?`],
        `The difference is ${F(d)}, so start with ${U.term(d, 'n')}. ${F(a)} − ${P(d)} = ${F(c)}, so the nth term is ${nth(d, c)}.`,
        L === 1 ? { visual: { type: 'sequence', terms: t.map(v => F(v)), step: (d > 0 ? '+' : M) + A(d) } } : undefined);
    };

    const findTerm = L => {
      const d = L === 1 ? R(2, 9) : nz(-7, 9), c = nz(-10, 10), n = pick([10, 12, 15, 20, 25, 30, 50, 100]);
      return num(`The nth term of a sequence is ${nth(d, c)}.\nFind the ${U.ord(n)} term.`, d * n + c,
        ['Replace n with the term number.', `Put n = ${n}: ${d === 1 ? n : `${F(d)} × ${n}`} ${c < 0 ? '−' : '+'} ${A(c)}.`],
        `${F(d)} × ${n} ${c < 0 ? '−' : '+'} ${A(c)} = ${F(d * n + c)}.`);
    };

    const whichTerm = () => {
      const d = R(2, 9), c = nz(-8, 10), n = R(8, 40), v = d * n + c;
      if (coin()) {
        return num(`The nth term of a sequence is ${lin(d, c, 'n')}.\nWhich term is equal to ${F(v)}?`, n,
          ['Make an equation: nth term = the value. Then solve it for n.', `${lin(d, c, 'n')} = ${F(v)}, so ${d}n = ${F(v - c)}.`],
          `${d}n = ${F(v - c)}, so n = ${n}. It is the ${U.ord(n)} term.`);
      }
      const yes = coin(), val = yes ? v : v + R(1, d - 1);
      const ans = yes ? `Yes, it is the ${U.ord(n)} term` : 'No, because n would not be a whole number';
      return choice(`The nth term of a sequence is ${lin(d, c, 'n')}.\nIs ${F(val)} a term in the sequence?`, ans,
        yes ? [`Yes, it is the ${U.ord(n + 1)} term`, 'No, because n would not be a whole number', `Yes, it is the ${U.ord(n - 1)} term`]
          : [`Yes, it is the ${U.ord(n)} term`, `Yes, it is the ${U.ord(n + 1)} term`, 'No, because n would be negative'],
        ['Solve nth term = the number. A term number must be a whole number.', `${lin(d, c, 'n')} = ${F(val)}, so ${d}n = ${F(val - c)}. Is ${F(val - c)} ÷ ${d} a whole number?`],
        yes ? `${d}n = ${F(val - c)} gives n = ${n}, a whole number. So ${F(val)} is the ${U.ord(n)} term.` : `${d}n = ${F(val - c)} gives n = ${Number.isInteger(U.clean((val - c) / d * 100)) ? F(U.clean((val - c) / d)) : F(U.round((val - c) / d, 2)) + '…'}, which is not a whole number. So ${F(val)} is not in the sequence.`);
    };

    const spot = () => {
      const d = R(2, 8), a = R(d + 1, 20), c = a - d, who = U.name(), t = terms(n => d * n + c);
      return choice(`${who} says the nth term of ${t.join(', ')}, … is n + ${d}.\nWhat is the correct nth term?`, lin(d, c, 'n'),
        [lin(1, d, 'n'), lin(d, a, 'n'), lin(a, d, 'n')],
        [`n + ${d} gives ${1 + d}, ${2 + d}, ${3 + d}, … which goes up by 1, not ${d}. The difference goes **in front of** n.`, `Start with ${d}n: it gives ${d}, ${2 * d}, ${3 * d}, … Compare these with the sequence.`],
        `The difference is ${d}, so use ${d}n. ${a} − ${d} = ${c}, so the nth term is ${lin(d, c, 'n')}.`);
    };

    const QUADS = () => {
      const t = R(1, 3);
      const pm = v => (v ? ` ${v < 0 ? '−' : '+'} ${A(v)}` : '');
      if (t === 1) { const c = nz(-5, 5); return { f: n => n * n + c, txt: quad(1, 0, c, 'n'), w: n => `${n * n}${pm(c)}` }; }
      if (t === 2) { const a = pick([2, 3]), c = R(-4, 4); return { f: n => a * n * n + c, txt: quad(a, 0, c, 'n'), w: n => `${a} × ${n * n}${pm(c)}` }; }
      const b = nz(-3, 3); return { f: n => n * n + b * n, txt: quad(1, b, 0, 'n'), w: n => `${n * n} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? n : `${A(b)} × ${n}`}` };
    };

    const quadNth = () => {
      const qd = QUADS(), t = terms(qd.f), d1 = t[1] - t[0], second = (t[2] - t[1]) - d1;
      const a = second / 2;
      const wr = [quad(second, 0, t[0] - second, 'n'), lin(d1, t[0] - d1, 'n'), quad(a, 0, t[0] - a + 1, 'n'), quad(a, 1, t[0] - a - 1, 'n')];
      return choice(`Find the nth term of the sequence\n${t.map(v => F(v)).join(', ')}, …`, qd.txt, wr,
        ['The differences are not the same, so look at the **second** differences. Half the second difference is the number in front of n^{2}.',
          `First differences: ${[t[1] - t[0], t[2] - t[1], t[3] - t[2]].map(v => F(v)).join(', ')}. Second difference: ${second}. So the nth term starts with ${U.term(a, 'n^{2}')}.`],
        `The second difference is ${second}, so start with ${U.term(a, 'n^{2}')}. Comparing with ${U.term(a, 'n^{2}')} (${terms(n => a * n * n).join(', ')}) gives ${qd.txt}.`);
    };

    const quadNext = () => {
      const qd = QUADS(), t = terms(qd.f, 5), d = [t[1] - t[0], t[2] - t[1], t[3] - t[2]];
      return num(`Find the next term of the sequence\n${t.slice(0, 4).map(v => F(v)).join(', ')}, …`, t[4],
        ['Find the differences between terms. They change by the same amount each time.', `The differences are ${d.map(v => F(v)).join(', ')}. How much do the differences go up by each time?`],
        `The next difference is ${F(t[4] - t[3])}, so the next term is ${F(t[3])} + ${P(t[4] - t[3])} = ${F(t[4])}.`,
        { visual: { type: 'sequence', terms: [...t.slice(0, 4).map(v => F(v)), '?'] } });
    };

    const quadTerm = () => {
      const qd = QUADS(), n = pick([6, 7, 8, 9, 10, 12, 15, 20]);
      return num(`The nth term of a sequence is ${qd.txt}.\nFind the ${U.ord(n)} term.`, qd.f(n),
        ['Replace n with the term number. Work out n^{2} first.', `n^{2} = ${n}^{2} = ${n * n}.`],
        `With n = ${n}: ${qd.w(n)} = ${F(qd.f(n))}.`);
    };

    PMLM.registerSkill({
      id: 'g9.sequences', grade: 9, unit: 'g9.u4', title: 'The nth term', icon: '🔢',
      blurb: 'Linear and simple quadratic sequences',
      lesson: [
        { title: 'Linear sequences',
          text: 'In a linear sequence the terms go up (or down) by the same amount.\n5, 8, 11, 14, … goes up by 3.\nThe difference goes **in front of n**: the nth term starts with 3n.',
          visual: { type: 'sequence', terms: ['5', '8', '11', '14'], step: '+3' } },
        { title: 'Finding the nth term',
          text: '3n gives 3, 6, 9, 12, …\nThe sequence is 5, 8, 11, 14: each term is 2 more.\nSo the nth term is **3n + 2**.\nCheck: n = 4 gives 3 × 4 + 2 = 14 ✓' },
        { title: 'Using the nth term',
          text: 'Put in a term number: 20th term of 3n + 2 is 3 × 20 + 2 = 62.\nIs 100 a term? 3n + 2 = 100 → 3n = 98 → n = 32.67…\nn is not a whole number, so 100 is **not** a term.' },
        { title: 'Quadratic sequences',
          text: 'If the differences change, look at the **second differences**.\n2, 5, 10, 17: differences 3, 5, 7; second difference 2.\nHalf of the second difference goes in front of n^{2}.\nn^{2} gives 1, 4, 9, 16, so this is **n^{2} + 1**.',
          visual: { type: 'sequence', terms: ['2', '5', '10', '17', '26'] } },
        { title: 'Worked example',
          text: 'Find the nth term of 20, 17, 14, 11, …\n**1.** The difference is −3, so start with −3n.\n**2.** −3n gives −3, −6, −9, … Each term is 23 more.\n**3.** So the nth term is −3n + 23.\nAnswer: **23 − 3n**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [L => retry(() => linearNth(L)), L => retry(() => linearNth(L)), findTerm, findTerm, spot],
          [L => retry(() => linearNth(L)), whichTerm, whichTerm, findTerm, spot, quadNext],
          [quadNth, quadNth, quadNext, quadTerm, L => retry(() => linearNth(L)), whichTerm],
        ], ctx);
      },
    });
  }

  /* 15 ── Straight-line graphs */
  {
    const yEq = (m, c) => (m === 0 ? `y = ${F(c)}` : `y = ${lin(m, c)}`);

    const gradFromEq = () => {
      const m = nz(-6, 6), c = nz(-9, 9), form = R(1, 3);
      if (form === 1) {
        return num(`What is the gradient of the line ${yEq(m, c)}?`, m,
          ['In y = mx + c, the gradient is m: the number in front of x.', `Compare ${yEq(m, c)} with y = mx + c. What number multiplies x?`],
          `The number in front of x is ${F(m)}, so the gradient is ${F(m)}.`);
      }
      if (form === 2) {
        return coord(`Where does the line ${yEq(m, c)} cross the y-axis?\nGive the coordinates.`, 0, c,
          ['On the y-axis, x = 0. In y = mx + c, the y-intercept is c.', `Put x = 0: y = ${F(m)} × 0 ${c < 0 ? '−' : '+'} ${A(c)}.`],
          `When x = 0, y = ${F(c)}. The line crosses the y-axis at (0, ${F(c)}).`);
      }
      return num(`The line y = ${F(c)} ${m < 0 ? '−' : '+'} ${U.term(Math.abs(m), 'x')} is drawn.\nWhat is its gradient?`, m,
        ['The gradient is the number multiplying x. The order of the terms does not matter.', `Find the term with x in it. The gradient is the number in that term, including its sign. (${F(c)} is the y-intercept, not the gradient.)`],
        `y = ${lin(m, c)}, so the gradient is ${F(m)} (not ${F(c)}).`);
    };

    const gradGrid = () => {
      const r = retry(() => {
        const x1 = R(-4, 1), y1 = R(-4, 3), dx = R(2, 5), dy = nz(-7, 7), x2 = x1 + dx, y2 = y1 + dy;
        return y2 >= -5 && y2 <= 5 && x2 <= 5 ? { x1, y1, x2, y2, dx, dy } : null;
      });
      return fracQ('Find the gradient of the line segment AB.', r.dy, r.dx,
        ['Gradient = change in y ÷ change in x (rise ÷ run). Going down to the right means a negative gradient.', `From A to B: x changes by ${r.dx} and y changes by ${F(r.dy)}.`],
        `Gradient = ${F(r.dy)} ÷ ${r.dx} = ${sfr(r.dy, r.dx)}.`,
        { visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, segments: [{ x1: r.x1, y1: r.y1, x2: r.x2, y2: r.y2 }], points: [{ x: r.x1, y: r.y1, label: 'A' }, { x: r.x2, y: r.y2, label: 'B' }] } });
    };

    const gradPoints = () => {
      const r = retry(() => {
        const x1 = R(-6, 6), y1 = R(-8, 10), dx = nz(-6, 8), dy = nz(-12, 12);
        return Math.abs(dx) >= 2 && (dx > 0 || coin()) ? { x1, y1, x2: x1 + dx, y2: y1 + dy, dx, dy } : null;
      });
      return fracQ(`Find the gradient of the line through (${F(r.x1)}, ${F(r.y1)}) and (${F(r.x2)}, ${F(r.y2)}).`, r.dy, r.dx,
        ['Gradient = {change in y/change in x}. Subtract the coordinates in the same order.', `Change in y = ${F(r.y2)} − ${P(r.y1)} = ${F(r.dy)}. Now find the change in x.`],
        `Gradient = {${F(r.dy)}/${F(r.dx)}}${fr(r.dy, r.dx) === sfr(r.dy, r.dx) ? '' : ` = ${sfr(r.dy, r.dx)}`}.`);
    };

    const eqFromGraph = () => {
      const m = pick([-3, -2, -1, 1, 2, 3, 0.5, -0.5]), c = nz(-3, 3);
      const mT = x => (x === 0.5 ? '{1/2}x' : x === -0.5 ? `${M}{1/2}x` : U.term(x, 'x'));
      const eqs = (mm, cc) => `y = ${mT(mm)} ${cc < 0 ? '−' : '+'} ${A(cc)}`;
      const wr = [eqs(-m, c), eqs(m, -c), `y = ${U.term(c, 'x')} ${m < 0 ? '−' : '+'} ${Math.abs(m) === 0.5 ? '{1/2}' : A(m)}`];
      if (Math.abs(m) !== 1) wr.push(eqs(m === 0.5 ? 2 : m === -0.5 ? -2 : (m > 0 ? 0.5 : -0.5), c));
      return choice('Which equation matches the line on the grid?', eqs(m, c), wr,
        ['Find where the line crosses the y-axis (that is c). Then find the gradient: how far up for every 1 across (that is m).', `The line crosses the y-axis at (0, ${F(c)}), so c = ${F(c)}. Now pick two points where the line crosses grid corners and work out rise ÷ run.`],
        `The y-intercept is ${F(c)} and the gradient is ${Math.abs(m) === 0.5 ? (m < 0 ? M : '') + '{1/2}' : F(m)}, so the line is ${eqs(m, c)}.`,
        { visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, lines: [{ m, c }] } });
    };

    const parallel = L => {
      const m = nz(-5, 5), c = nz(-8, 8), k = retry(() => { const v = nz(-9, 9); return v === c ? null : v; });
      if (L === 3 && coin()) {
        const f = pick([2, 3]);
        return choice(`Which line is parallel to ${yEq(m, c)}?`, `${f}y = ${lin(f * m, f * k)}`,
          [`${f}y = ${lin(m, f * k)}`, `y = ${lin(f * m, k)}`, `${f}y = ${lin(-f * m, f * k)}`, `y = ${lin(-m, c)}`],
          ['Parallel lines have the same gradient. Rearrange each equation into y = mx + c to compare.', `For an equation like ${f}y = …, divide everything by ${f} to get y on its own.`],
          `${f}y = ${lin(f * m, f * k)} → y = ${lin(m, k)}. It has gradient ${F(m)}, the same as ${yEq(m, c)}.`);
      }
      return choice(`Which line is parallel to ${yEq(m, c)}?`, yEq(m, k),
        [yEq(-m, c), yEq(c, m), yEq(m + 1, c), yEq(k, m)].filter(x => x !== yEq(m, k)),
        ['Parallel lines have the same gradient (the same number in front of x).', `The gradient of ${yEq(m, c)} is ${F(m)}. Look for another line with gradient ${F(m)}.`],
        `${yEq(m, k)} also has gradient ${F(m)}, so it is parallel. The y-intercept can be different.`);
    };

    const through = () => {
      const m = nz(-4, 5), p = nz(-4, 5), c = nz(-7, 9), q = m * p + c, c0 = retry(() => { const v = nz(-9, 9); return v === c ? null : v; });
      return choice(`A line is parallel to ${yEq(m, c0)} and passes through (${F(p)}, ${F(q)}).\nWhat is its equation?`, yEq(m, c),
        [yEq(m, q), yEq(m, q + m * p), yEq(m, c0), yEq(p, q)],
        ['Parallel means the same gradient, so the line is y = ' + U.term(m, 'x') + ' + c. Use the point to find c.', `Put x = ${F(p)}, y = ${F(q)} into y = ${U.term(m, 'x')} + c: ${F(q)} = ${F(m * p)} + c.`],
        `${F(q)} = ${F(m * p)} + c, so c = ${F(c)}. The equation is ${yEq(m, c)}.`);
    };

    const rearranged = () => {
      const t = R(1, 3);
      if (t === 1) {
        const f = pick([2, 3, 4]), m = nz(-4, 5), c = nz(-5, 5);
        return num(`What is the gradient of the line ${f}y = ${lin(f * m, f * c)}?`, m,
          ['Rearrange into the form y = mx + c first.', `Divide every term by ${f}.`],
          `y = ${lin(m, c)}, so the gradient is ${F(m)}.`);
      }
      if (t === 2) {
        const a = R(1, 6), c = nz(-9, 9);
        return num(`What is the gradient of the line ${U.term(a, 'x')} + y = ${F(c)}?`, -a,
          ['Rearrange into the form y = mx + c first.', `Subtract ${U.term(a, 'x')} from both sides: y = ${F(c)} − ${U.term(a, 'x')}.`],
          `y = ${lin(-a, c)}, so the gradient is ${F(-a)}.`);
      }
      const a = R(1, 5), b = pick([2, 3, 4, 5].filter(v => U.gcd(v, a) === 1 && v !== a)), c = b * R(1, 4);
      return fracQ(`What is the gradient of the line ${U.term(a, 'x')} + ${b}y = ${c}?`, -a, b,
        ['Rearrange into the form y = mx + c first.', `${b}y = ${c} − ${U.term(a, 'x')}. Now divide every term by ${b}.`],
        `y = ${F(c / b)} − ${fr(a, b)}x, so the gradient is ${sfr(-a, b)}.`);
    };

    const onLine = () => {
      const m = nz(-3, 4), c = nz(-6, 6), x = nz(-4, 5), y = m * x + c;
      return choice(`Which point lies on the line ${yEq(m, c)}?`, `(${F(x)}, ${F(y)})`,
        [`(${F(y)}, ${F(x)})`, `(${F(x)}, ${F(y + 1)})`, `(${F(x)}, ${F(m * x - c)})`, `(${F(-x)}, ${F(y)})`],
        ['Substitute the x-coordinate into the equation. Do you get the y-coordinate?', `For example, for (${F(x)}, ?): y = ${F(m)} × ${P(x)} ${c < 0 ? '−' : '+'} ${A(c)}. Work it out.`],
        `${F(m)} × ${P(x)} ${c < 0 ? '−' : '+'} ${A(c)} = ${F(y)}, so (${F(x)}, ${F(y)}) is on the line.`);
    };

    PMLM.registerSkill({
      id: 'g9.lines', grade: 9, unit: 'g9.u4', title: 'Straight-line graphs', icon: '📉',
      blurb: 'Gradient, intercept, y = mx + c and parallel lines',
      lesson: [
        { title: 'Gradient',
          text: 'The **gradient** tells you how steep a line is.\nGradient = {change in y/change in x} = {rise/run}\nFrom A to B: rise 6, run 3, so the gradient is 6 ÷ 3 = 2.\nUp to the right → positive. Down to the right → negative.',
          visual: { type: 'grid', xmin: -1, xmax: 6, ymin: -1, ymax: 7, segments: [{ x1: 1, y1: 1, x2: 4, y2: 7 }], points: [{ x: 1, y: 1, label: 'A' }, { x: 4, y: 7, label: 'B' }] } },
        { title: 'y = mx + c',
          text: 'Every straight line (except vertical ones) can be written as **y = mx + c**.\n• m is the gradient\n• c is where the line crosses the y-axis (the y-intercept)\ny = 2x + 1: gradient 2, crosses at (0, 1).',
          visual: { type: 'grid', xmin: -4, xmax: 4, ymin: -4, ymax: 6, lines: [{ m: 2, c: 1, label: 'y = 2x + 1' }] } },
        { title: 'Parallel lines',
          text: 'Parallel lines have the **same gradient**.\ny = 2x + 1 and y = 2x − 3 are parallel.\nTo compare, first rearrange to y = mx + c: 2y = 4x + 6 → y = 2x + 3 (gradient 2).',
          visual: { type: 'grid', xmin: -4, xmax: 4, ymin: -5, ymax: 5, lines: [{ m: 2, c: 1, label: 'y = 2x + 1' }, { m: 2, c: -3, label: 'y = 2x − 3' }] } },
        { title: 'Worked example',
          text: 'Find the line parallel to y = 3x − 2 through (2, 10).\n**1.** Parallel → same gradient: y = 3x + c.\n**2.** Put in x = 2, y = 10: 10 = 6 + c.\n**3.** So c = 4.\nAnswer: **y = 3x + 4**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [gradFromEq, gradFromEq, gradGrid, gradGrid, onLine],
          [eqFromGraph, eqFromGraph, parallel, gradPoints, gradGrid, onLine],
          [through, rearranged, rearranged, parallel, eqFromGraph, gradPoints],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 5: Geometry and measure ═══════════════════════
  PMLM.registerUnit({ id: 'g9.u5', grade: 9, name: 'Geometry and measure', icon: '📐' });

  /* 16 ── Pythagoras' theorem */
  {
    const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25], [10, 24, 26], [20, 21, 29], [9, 40, 41]];
    const tri = (a, b) => ({ type: 'shape2d', shape: 'rightTriangle', dims: { base: a, height: b } });
    const DP1 = '\nGive your answer to 1 decimal place.';

    const hyp = L => {
      let a, b, c, exact = true;
      if (L === 1 || coin()) [a, b, c] = U.shuffle(pick(TRIPLES).slice(0, 2)).concat([0]);
      else { a = R(2, 15); b = R(2, 15); exact = isSq(a * a + b * b); }
      c = Math.sqrt(a * a + b * b);
      const ans = exact ? c : U.round(c, 1);
      return num(`Find the length of the hypotenuse (the longest side).${exact ? '' : DP1}`, ans,
        ['Pythagoras: c^{2} = a^{2} + b^{2}, where c is the hypotenuse. Square, add, then square root.', `${a}^{2} + ${b}^{2} = ${a * a} + ${b * b} = ${a * a + b * b}. Now find the square root.`],
        `c^{2} = ${a * a + b * b}, so c = √${a * a + b * b} = ${exact ? F(ans) + ' cm' : F(ans, 1) + ' cm (to 1 d.p.)'}.`,
        Object.assign({ unit: 'cm', visual: tri(`${a} cm`, `${b} cm`) }, exact ? {} : { tolerance: 0.05 }));
    };

    const short = L => {
      let a, b, c, exact = true;
      if (L <= 2 && (L === 1 || coin())) { const t = pick(TRIPLES); c = t[2]; [a, b] = U.shuffle([t[0], t[1]]); }
      else { c = R(8, 20); a = R(3, c - 2); b = Math.sqrt(c * c - a * a); exact = Number.isInteger(b); }
      const ans = exact ? b : U.round(b, 1);
      return num(`The hypotenuse of this right-angled triangle is ${c} cm.\nFind the missing side.${exact ? '' : DP1}`, ans,
        ['To find a **shorter** side, square both sides you know and **subtract**: a^{2} = c^{2} − b^{2}.', `${c}^{2} − ${a}^{2} = ${c * c} − ${a * a} = ${c * c - a * a}. Now find the square root.`],
        `The missing side = √${c * c - a * a} = ${exact ? F(ans) + ' cm' : F(ans, 1) + ' cm (to 1 d.p.)'}.`,
        Object.assign({ unit: 'cm', visual: tri(`${a} cm`, '?') }, exact ? {} : { tolerance: 0.05 }));
    };

    const isRight = () => {
      const t = pick(TRIPLES), yes = coin(), [a, b] = t, c = yes ? t[2] : t[2] + pick([-1, 1]);
      return choice(`A triangle has sides ${a} cm, ${b} cm and ${c} cm.\nIs it a right-angled triangle?`, yes ? 'Yes' : 'No', [yes ? 'No' : 'Yes'],
        ['It is right-angled only if (shorter side)^{2} + (shorter side)^{2} = (longest side)^{2}.', `${a}^{2} + ${b}^{2} = ${a * a + b * b}. Now work out ${c}^{2} and compare.`],
        `${a}^{2} + ${b}^{2} = ${a * a + b * b} and ${c}^{2} = ${c * c}. ${yes ? 'They are equal, so it is right-angled.' : 'They are not equal, so it is not right-angled.'}`);
    };

    const real = () => {
      if (coin()) {
        const L0 = R(4, 9), d = U.round(R(10, Math.round(L0 * 10 * 0.5)) / 10, 1), h = Math.sqrt(L0 * L0 - d * d), ans = U.round(h, 1);
        return num(`A ladder ${L0} m long leans against a wall. Its foot is ${F(d)} m from the wall.\nHow high up the wall does it reach?${DP1}`, ans,
          ['The ladder is the hypotenuse. You want a shorter side, so subtract.', `${L0}^{2} − ${F(d)}^{2} = ${L0 * L0} − ${F(U.clean(d * d))} = ${F(U.clean(L0 * L0 - d * d))}. Now find the square root.`],
          `Height = √${F(U.clean(L0 * L0 - d * d))} = ${F(ans, 1)} m (to 1 d.p.).`, { unit: 'm', tolerance: 0.05, visual: tri(`${F(d)} m`, '?') });
      }
      const a = R(3, 15), b = R(2, a), c = Math.sqrt(a * a + b * b), exact = isSq(a * a + b * b), ans = exact ? c : U.round(c, 1);
      return num(`A rectangle is ${a} cm long and ${b} cm wide.\nHow long is its diagonal?${exact ? '' : DP1}`, ans,
        ['The diagonal splits the rectangle into two right-angled triangles. The diagonal is the hypotenuse.', `${a}^{2} + ${b}^{2} = ${a * a} + ${b * b} = ${a * a + b * b}.`],
        `Diagonal = √${a * a + b * b} = ${exact ? F(ans) + ' cm' : F(ans, 1) + ' cm (to 1 d.p.)'}.`,
        Object.assign({ unit: 'cm', visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `${a} cm`, height: `${b} cm` } } }, exact ? {} : { tolerance: 0.05 }));
    };

    const gridDist = () => {
      const r = retry(() => {
        const x1 = R(-5, 0), y1 = R(-5, 2), x2 = R(1, 5), y2 = R(-5, 5);
        return y2 !== y1 ? { x1, y1, x2, y2 } : null;
      });
      const dx = r.x2 - r.x1, dy = Math.abs(r.y2 - r.y1), s2 = dx * dx + dy * dy, exact = isSq(s2), ans = exact ? Math.sqrt(s2) : U.round(Math.sqrt(s2), 1);
      return num(`Find the length of the line segment AB.${exact ? '' : DP1}`, ans,
        ['Make a right-angled triangle: go across, then up or down. AB is the hypotenuse.', `Across: ${dx} units. ${r.y2 > r.y1 ? 'Up' : 'Down'}: ${dy} units. So AB^{2} = ${dx}^{2} + ${dy}^{2}.`],
        `AB^{2} = ${dx * dx} + ${dy * dy} = ${s2}, so AB = √${s2} = ${exact ? F(ans) + ' units' : F(ans, 1) + ' units (to 1 d.p.)'}.`,
        Object.assign({ unit: 'units', visual: { type: 'grid', segments: [{ x1: r.x1, y1: r.y1, x2: r.x2, y2: r.y2 }], points: [{ x: r.x1, y: r.y1, label: 'A' }, { x: r.x2, y: r.y2, label: 'B' }] } }, exact ? {} : { tolerance: 0.05 }));
    };

    const spot = () => {
      const t = pick(TRIPLES), who = U.name();
      if (coin()) {
        return num(`The two shorter sides of a right-angled triangle are ${t[0]} cm and ${t[1]} cm.\n${who} says the hypotenuse is ${t[0]} + ${t[1]} = ${t[0] + t[1]} cm.\nWhat is the correct length?`, t[2],
          [`You cannot just add the sides. Square them first: c^{2} = a^{2} + b^{2}.`, `${t[0]}^{2} + ${t[1]}^{2} = ${t[0] * t[0] + t[1] * t[1]}. Now square root.`],
          `c = √${t[0] * t[0] + t[1] * t[1]} = ${t[2]} cm. ${who} forgot to square and square root.`, { unit: 'cm', visual: tri(`${t[0]} cm`, `${t[1]} cm`) });
      }
      const wrong = U.round(Math.sqrt(t[2] * t[2] + t[0] * t[0]), 1);
      return num(`A right-angled triangle has hypotenuse ${t[2]} cm and one side ${t[0]} cm.\n${who} works out the other side as √(${t[2]}^{2} + ${t[0]}^{2}) = ${F(wrong)} cm.\nWhat is the correct length?`, t[1],
        ['For a shorter side you must **subtract** the squares, not add them.', `${t[2]}^{2} − ${t[0]}^{2} = ${t[2] * t[2]} − ${t[0] * t[0]} = ${t[2] * t[2] - t[0] * t[0]}.`],
        `√${t[2] * t[2] - t[0] * t[0]} = ${t[1]} cm. ${who} added instead of subtracting (the answer must be shorter than the hypotenuse!).`, { unit: 'cm', visual: tri(`${t[0]} cm`, '?') });
    };

    PMLM.registerSkill({
      id: 'g9.pythagoras', grade: 9, unit: 'g9.u5', title: "Pythagoras' theorem", icon: '📐',
      blurb: 'Find missing sides of right-angled triangles',
      lesson: [
        { title: 'The hypotenuse',
          text: 'In a right-angled triangle, the longest side is the **hypotenuse**. It is opposite the right angle.\nPythagoras\' theorem: **a^{2} + b^{2} = c^{2}**, where c is the hypotenuse.',
          visual: { type: 'shape2d', shape: 'rightTriangle', dims: { base: 'a', height: 'b' } } },
        { title: 'Finding the hypotenuse',
          text: 'Square the two shorter sides and **add**. Then square root.\nSides 6 cm and 8 cm:\n6^{2} + 8^{2} = 36 + 64 = 100\nc = √100 = 10 cm',
          visual: { type: 'shape2d', shape: 'rightTriangle', dims: { base: '8 cm', height: '6 cm' } } },
        { title: 'Finding a shorter side',
          text: 'Square both sides you know and **subtract**: a^{2} = c^{2} − b^{2}.\nHypotenuse 13 cm, one side 5 cm:\n13^{2} − 5^{2} = 169 − 25 = 144, so the side is 12 cm.\n**Check:** a shorter side must be less than the hypotenuse.' },
        { title: 'Is it right-angled?',
          text: 'Test the three sides. If (short)^{2} + (short)^{2} = (long)^{2}, there is a right angle.\n7, 24, 25: 49 + 576 = 625 = 25^{2} ✓\nThe numbers 3, 4, 5 and 5, 12, 13 are worth remembering.' },
        { title: 'Worked example',
          text: 'A ladder 5 m long has its foot 1.5 m from a wall. How high does it reach?\n**1.** The ladder is the hypotenuse, so subtract: 5^{2} − 1.5^{2}.\n**2.** 25 − 2.25 = 22.75.\n**3.** √22.75 = 4.769…\nAnswer: **4.8 m** (to 1 d.p.)' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [hyp, hyp, short, isRight],
          [hyp, short, short, isRight, real, spot],
          [short, real, real, gridDist, hyp, spot],
        ], ctx);
      },
    });
  }

  /* 17 ── Angles in polygons and with parallel lines */
  {
    const NAMES = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
    const REG = [3, 4, 5, 6, 8, 9, 10, 12];

    const sumInt = () => {
      const n = pick([5, 6, 7, 8, 9, 10, 12]);
      return num(`What is the sum of the interior angles of a ${NAMES[n]} (${n} sides)?`, (n - 2) * 180,
        ['Split the polygon into triangles from one corner. An n-sided polygon makes (n − 2) triangles.', `A ${n}-sided polygon makes ${n} − 2 = ${n - 2} triangles, and each triangle has 180°.`],
        `(${n} − 2) × 180° = ${n - 2} × 180° = ${(n - 2) * 180}°.`, { unit: '°', visual: { type: 'polygon', n } });
    };

    const extReg = () => {
      const n = pick(REG);
      return num(`This is a regular ${NAMES[n]}. Find the size of one **exterior** angle.`, 360 / n,
        ['The exterior angles of any polygon add up to 360°.', `A regular ${NAMES[n]} has ${n} equal exterior angles. Share 360° between them.`],
        `360° ÷ ${n} = ${360 / n}°.`, { unit: '°', visual: { type: 'polygon', n, show: 'exterior', label: '?' } });
    };

    const intReg = () => {
      const n = pick(REG.filter(v => v > 4));
      return num(`This is a regular ${NAMES[n]}. Find the size of one **interior** angle.`, 180 - 360 / n,
        ['Find the exterior angle first. Interior + exterior = 180°.', `Exterior angle = 360° ÷ ${n} = ${360 / n}°.`],
        `Exterior = ${360 / n}°, so interior = 180° − ${360 / n}° = ${180 - 360 / n}°.`, { unit: '°', visual: { type: 'polygon', n, show: 'interior', label: '?' } });
    };

    const sides = () => {
      const n = pick([8, 9, 10, 12, 15, 18, 20, 24, 30, 36]), ext = 360 / n;
      if (coin()) {
        return num(`Each exterior angle of a regular polygon is ${ext}°.\nHow many sides does it have?`, n,
          ['All the exterior angles add up to 360°.', `Number of sides = 360° ÷ one exterior angle = 360 ÷ ${ext}.`],
          `360 ÷ ${ext} = ${n}, so the polygon has ${n} sides.`);
      }
      return num(`Each interior angle of a regular polygon is ${180 - ext}°.\nHow many sides does it have?`, n,
        ['Find the exterior angle first (interior + exterior = 180°). Then divide 360° by it.', `Exterior angle = 180° − ${180 - ext}° = ${ext}°.`],
        `Exterior = ${ext}°, and 360 ÷ ${ext} = ${n} sides.`);
    };

    const missing = () => {
      const r = retry(() => {
        const n = pick([4, 5, 6]), S = (n - 2) * 180, given = U.range(1, n - 1).map(() => R(n === 4 ? 60 : 85, n === 4 ? 130 : 150));
        const m = S - sum(given);
        return m >= 50 && m <= 170 ? { n, S, given, m } : null;
      });
      return num(`A ${NAMES[r.n]} has angles ${r.given.map(g => g + '°').join(', ')} and x.\nFind x.`, r.m,
        [`First find the sum of the interior angles of a ${NAMES[r.n]}.`, `Sum = (${r.n} − 2) × 180° = ${r.S}°. The given angles add up to ${sum(r.given)}°.`],
        `x = ${r.S}° − ${sum(r.given)}° = ${r.m}°.`, { unit: '°' });
    };

    const algebra = () => {
      const r = retry(() => {
        const n = pick([4, 5, 6]), S = (n - 2) * 180, co = U.range(1, n).map(() => R(1, 4)), k = sum(co);
        if (S % k) return null;
        const x = S / k;
        return Math.max(...co) * x < 180 && new Set(co).size > 1 ? { n, S, co, k, x } : null;
      });
      const angs = r.co.map(c => (c === 1 ? 'x' : c + 'x'));
      return num(`The angles of a ${NAMES[r.n]} are ${angs.join(', ')}.\nFind the value of x.`, r.x,
        [`The angles of a ${NAMES[r.n]} add up to (${r.n} − 2) × 180° = ${r.S}°.`, `Add the angles: ${angs.join(' + ')} = ${r.k}x. So ${r.k}x = ${r.S}.`],
        `${r.k}x = ${r.S}, so x = ${r.x}°.`, { unit: '°' });
    };

    // parallel lines: tr = bl = theta, tl = br = 180 − theta
    const size = (pos, th) => (pos === 'tr' || pos === 'bl' ? th : 180 - th);
    const REL = [
      [['A.tr', 'B.tr'], 'corr'], [['A.tl', 'B.tl'], 'corr'], [['A.bl', 'B.bl'], 'corr'], [['A.br', 'B.br'], 'corr'],
      [['A.bl', 'B.tr'], 'alt'], [['A.br', 'B.tl'], 'alt'],
      [['A.br', 'B.tr'], 'co'], [['A.bl', 'B.tl'], 'co'],
      [['A.tr', 'A.bl'], 'vo'], [['B.tl', 'B.br'], 'vo'], [['A.tl', 'A.br'], 'vo'], [['B.tr', 'B.bl'], 'vo'],
      [['A.tr', 'A.tl'], 'line'], [['B.bl', 'B.br'], 'line'], [['B.tr', 'B.br'], 'line'], [['A.tl', 'A.bl'], 'line'],
    ];
    const FACT = {
      corr: 'Corresponding angles are equal', alt: 'Alternate angles are equal', co: 'Co-interior angles add up to 180°',
      vo: 'Vertically opposite angles are equal', line: 'Angles on a straight line add up to 180°',
    };
    const plAngle = () => {
      const th = R(25, 80), [[p, q], rel] = pick(REL), [known, target] = coin() ? [p, q] : [q, p];
      const kv = size(known.split('.')[1], th), tv = size(target.split('.')[1], th);
      const labels = { [known]: kv + '°', [target]: 'x' };
      const equal = rel === 'corr' || rel === 'alt' || rel === 'vo';
      return num('The two horizontal lines are parallel. Find the angle x.', tv,
        ['Look at where the two angles are. Are they corresponding, alternate, co-interior, vertically opposite or on a straight line?', `These are ${FACT[rel].toLowerCase().replace(/ (are equal|add up to 180°)/, '')}. ${equal ? 'So they are equal.' : 'So they add up to 180°.'}`],
        `${FACT[rel]}, so x = ${equal ? kv + '°' : `180° − ${kv}° = ${tv}°`}.`, { unit: '°', visual: { type: 'parallelLines', theta: th, labels } });
    };

    const plReason = () => {
      const th = R(25, 80), [[p, q], rel] = pick(REL.filter(r => r[1] !== 'line' && r[1] !== 'vo' || coin())), kv = size(p.split('.')[1], th), tv = size(q.split('.')[1], th);
      return choice(`The two horizontal lines are parallel. x = ${tv}°.\nWhich fact explains this?`, FACT[rel], U.shuffle(Object.values(FACT).filter(f => f !== FACT[rel])),
        ['Corresponding: same position at each crossing (F shape). Alternate: opposite sides, between the lines (Z shape). Co-interior: same side, between the lines (C shape).', 'Are both angles at the same crossing, or one at each crossing? Are they between the parallel lines?'],
        `${FACT[rel]}.`, { visual: { type: 'parallelLines', theta: th, labels: { [p]: kv + '°', [q]: 'x' } } });
    };

    const plTwoStep = () => {
      const th = R(25, 80), POS = ['tr', 'tl', 'bl', 'br'];
      const r = retry(() => {
        const a = pick(POS), b = pick(POS);
        if (REL.some(([[u, v]]) => (u === 'A.' + a && v === 'B.' + b))) return null;   // not a one-step pair
        return { a, b };
      });
      const known = 'A.' + r.a, target = 'B.' + r.b, kv = size(r.a, th), tv = size(r.b, th);
      return num('The two horizontal lines are parallel. Find the angle x.', tv,
        ['You may need two steps. First move the known angle to the other crossing using corresponding angles.', `By corresponding angles, the angle at B in the same position as the ${kv}° angle is also ${kv}°.`],
        `The corresponding angle at B is ${kv}°. Then x ${kv === tv ? `= ${kv}° (vertically opposite)` : `= 180° − ${kv}° = ${tv}° (angles on a straight line)`}.`,
        { unit: '°', visual: { type: 'parallelLines', theta: th, labels: { [known]: kv + '°', [target]: 'x' } } });
    };

    PMLM.registerSkill({
      id: 'g9.angles', grade: 9, unit: 'g9.u5', title: 'Polygons and parallels', icon: '🔷',
      blurb: 'Angles in polygons and on parallel lines',
      lesson: [
        { title: 'Interior angle sum',
          text: 'From one corner, a polygon with n sides splits into (n − 2) triangles.\nSum of interior angles = **(n − 2) × 180°**\nPentagon: 3 × 180° = 540°',
          visual: { type: 'polygon', n: 5, show: 'interior', label: '108°' } },
        { title: 'Exterior angles',
          text: 'The exterior angles of **any** polygon add up to **360°**.\nRegular polygon: one exterior angle = 360° ÷ n.\nInterior + exterior = 180° (they sit on a straight line).',
          visual: { type: 'polygon', n: 6, show: 'exterior', label: '60°' } },
        { title: 'Parallel lines',
          text: '**Corresponding** angles are equal (F shape).\n**Alternate** angles are equal (Z shape).\n**Co-interior** angles add up to 180° (C shape).',
          visual: { type: 'parallelLines', theta: 60, labels: { 'A.tr': '60°', 'B.tr': '60°', 'B.tl': '120°' } } },
        { title: 'Give a reason',
          text: 'Always say which fact you used.\nVertically opposite angles are equal.\nAngles on a straight line add up to 180°.\nSometimes you need two steps: move the angle across with corresponding angles, then use a straight line.' },
        { title: 'Worked example',
          text: 'Each interior angle of a regular polygon is 156°. How many sides does it have?\n**1.** Exterior angle = 180° − 156° = 24°.\n**2.** Exterior angles add up to 360°.\n**3.** 360 ÷ 24 = 15.\nAnswer: **15 sides**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [sumInt, extReg, plAngle, plAngle, intReg],
          [intReg, sides, plAngle, plReason, missing, extReg],
          [sides, algebra, missing, plTwoStep, plTwoStep, plReason],
        ], ctx);
      },
    });
  }

  // π answers: worked with π = 3.14 and rounded to 1 d.p.; the tolerance also accepts the calculator π button.
  const PI_TXT = 'Use π = 3.14 and give your answer to 1 decimal place.';
  const ap = (x, ans) => (U.round(x, 6) === ans ? `= ${F(ans, 1)}` : `= ${F(U.round(x, 4))} ≈ ${F(ans, 1)}`);
  const piAns = f => {
    const a = f(3.14), b = f(Math.PI), ans = U.round(a, 1);
    return { ans, tol: U.round(Math.abs(U.round(b, 1) - ans), 1) + 0.05 };
  };

  /* 18 ── Circles: circumference, area, arcs and sectors */
  {
    const circ = (r, useD) => ({ type: 'shape2d', shape: 'circle', dims: useD ? { diameter: `${2 * r} cm` } : { radius: `${r} cm` } });

    const circumference = L => {
      const r = R(2, L === 1 ? 10 : 15), useD = coin(), { ans, tol } = piAns(p => p * 2 * r);
      return num(`Find the circumference of this circle.\n${PI_TXT}`, ans,
        ['Circumference = π × diameter (C = πd), or C = 2πr.', useD ? `The diameter is ${2 * r} cm. Work out 3.14 × ${2 * r}.` : `The radius is ${r} cm, so the diameter is ${2 * r} cm. Work out 3.14 × ${2 * r}.`],
        `C = 3.14 × ${2 * r} ${ap(U.clean(3.14 * 2 * r), ans)} cm.`, { unit: 'cm', tolerance: tol, visual: circ(r, useD) });
    };

    const area = L => {
      const r = R(2, L === 1 ? 10 : 15), useD = L >= 2 && coin(), { ans, tol } = piAns(p => p * r * r);
      return num(`Find the area of this circle.\n${PI_TXT}`, ans,
        ['Area = π × radius squared (A = πr^{2}).' + (useD ? ' Careful: the picture shows the diameter.' : ''), useD ? `The radius is half the diameter: ${2 * r} ÷ 2 = ${r} cm. Now work out 3.14 × ${r}^{2}.` : `r^{2} = ${r} × ${r} = ${r * r}. Now multiply by 3.14.`],
        `A = 3.14 × ${r}^{2} = 3.14 × ${r * r} ${ap(U.clean(3.14 * r * r), ans)} cm².`, { unit: 'cm²', tolerance: tol, visual: circ(r, useD) });
    };

    const reverseC = () => {
      const d = R(4, 30), C = U.clean(3.14 * d), askR = coin() && d % 2 === 0;
      return num(`A circle has a circumference of ${F(C)} cm. Use π = 3.14.\nFind its ${askR ? 'radius' : 'diameter'}.`, askR ? d / 2 : d,
        ['C = πd, so d = C ÷ π.' + (askR ? ' Then halve it to get the radius.' : ''), `d = ${F(C)} ÷ 3.14.`],
        `d = ${F(C)} ÷ 3.14 = ${d} cm${askR ? `, so the radius is ${d / 2} cm` : ''}.`, { unit: 'cm', tolerance: 0.05 });
    };

    const reverseA = () => {
      const r = R(2, 12), Ar = U.clean(3.14 * r * r);
      return num(`A circle has an area of ${F(Ar)} cm². Use π = 3.14.\nFind its radius.`, r,
        ['A = πr^{2}. Divide by π, then take the square root.', `r^{2} = ${F(Ar)} ÷ 3.14 = ${r * r}.`],
        `r^{2} = ${r * r}, so r = √${r * r} = ${r} cm.`, { unit: 'cm', tolerance: 0.05 });
    };

    const semicircle = () => {
      const r = R(2, 12);
      if (coin()) {
        const { ans, tol } = piAns(p => p * r * r / 2);
        return num(`Find the area of this semicircle.\n${PI_TXT}`, ans,
          ['A semicircle is half a circle: area = {1/2} × πr^{2}.', `The radius is ${2 * r} ÷ 2 = ${r} cm. Area of the full circle = 3.14 × ${r * r}.`],
          `{1/2} × 3.14 × ${r * r} ${ap(U.clean(1.57 * r * r), ans)} cm².`, { unit: 'cm²', tolerance: tol, visual: { type: 'shape2d', shape: 'semicircle', dims: { diameter: `${2 * r} cm` } } });
      }
      const { ans, tol } = piAns(p => p * r + 2 * r);
      return num(`Find the perimeter of this semicircle (the curved edge and the straight edge).\n${PI_TXT}`, ans,
        ['Perimeter = half the circumference + the diameter.', `Half the circumference = {1/2} × 3.14 × ${2 * r} = ${F(U.clean(3.14 * r))} cm. Now add the straight edge.`],
        `${F(U.clean(3.14 * r))} + ${2 * r} ${ap(U.clean(3.14 * r + 2 * r), ans)} cm.`, { unit: 'cm', tolerance: tol, visual: { type: 'shape2d', shape: 'semicircle', dims: { diameter: `${2 * r} cm` } } });
    };

    const SECT = [[30, 12, 1], [40, 9, 1], [45, 8, 1], [60, 6, 1], [72, 5, 1], [90, 4, 1], [120, 3, 1], [135, 8, 3], [150, 12, 5], [240, 3, 2], [270, 4, 3]];
    const sector = () => {
      const [th, parts, shaded] = pick(SECT), r = R(3, 12), arc = coin();
      const frac = U.fracS(th, 360);
      if (arc) {
        const { ans, tol } = piAns(p => th / 360 * 2 * p * r);
        return num(`A sector has radius ${r} cm and angle ${th}°.\nFind the length of its arc. ${PI_TXT}`, ans,
          [`The arc is a fraction of the full circumference: {${th}/360} × 2πr.`, `{${th}/360} = ${frac}. The full circumference is 2 × 3.14 × ${r} = ${F(U.clean(6.28 * r))} cm.`],
          `Arc = ${frac} × ${F(U.clean(6.28 * r))} ${ap(U.round(th / 360 * 6.28 * r, 4), ans)} cm.`, { unit: 'cm', tolerance: tol, visual: { type: 'pie', pies: [{ parts, shaded }] } });
      }
      const { ans, tol } = piAns(p => th / 360 * p * r * r);
      return num(`A sector has radius ${r} cm and angle ${th}°.\nFind its area. ${PI_TXT}`, ans,
        [`The sector is a fraction of the whole circle: {${th}/360} × πr^{2}.`, `{${th}/360} = ${frac}. The area of the full circle is 3.14 × ${r * r} = ${F(U.clean(3.14 * r * r))} cm².`],
        `Area = ${frac} × ${F(U.clean(3.14 * r * r))} ${ap(U.round(th / 360 * 3.14 * r * r, 4), ans)} cm².`, { unit: 'cm²', tolerance: tol, visual: { type: 'pie', pies: [{ parts, shaded }] } });
    };

    const spot = () => {
      const d = pick([6, 8, 10, 12, 14, 20]), who = U.name(), wrong = U.clean(3.14 * d * d);
      if (coin()) {
        return choice(`${who} finds the area of a circle with **diameter** ${d} cm:\n3.14 × ${d}^{2} = ${F(wrong)} cm².\nWhat mistake did ${who} make?`, 'Used the diameter instead of the radius',
          ['Used the formula for circumference', 'Should have multiplied by 2 at the end', 'Should not have squared anything'],
          ['The formula A = πr^{2} uses the radius. What was used here?', `The radius is half the diameter: ${d / 2} cm.`],
          `A = πr^{2} needs the radius, ${d / 2} cm. Correct area: 3.14 × ${d / 2}^{2} = ${F(U.clean(3.14 * d * d / 4))} cm².`);
      }
      const r = d / 2, wr = U.clean(3.14 * r * r);
      return choice(`${who} wants the **circumference** of a circle with radius ${r} cm and works out 3.14 × ${r}^{2} = ${F(wr)}.\nWhat mistake did ${who} make?`, 'Used the area formula instead of C = 2πr',
        ['Used the diameter instead of the radius', 'Should have divided by 2', 'Nothing: the answer is correct'],
        ['Which formula is for the distance around the circle?', 'Circumference = 2πr. Area = πr^{2}.'],
        `Circumference = 2 × 3.14 × ${r} = ${F(U.clean(6.28 * r))} cm. ${who} found the area instead.`);
    };

    PMLM.registerSkill({
      id: 'g9.circles', grade: 9, unit: 'g9.u5', title: 'Circles and sectors', icon: '⭕',
      blurb: 'Circumference, area, arcs and sectors',
      lesson: [
        { title: 'Parts of a circle',
          text: 'The **radius** r goes from the centre to the edge.\nThe **diameter** d goes all the way across: d = 2r.\nThe **circumference** C is the distance around the edge.\nπ ≈ 3.14 (the π button gives 3.14159…)',
          visual: { type: 'shape2d', shape: 'circle', dims: { radius: 'r' } } },
        { title: 'The two formulas',
          text: 'Circumference: **C = πd** (or C = 2πr)\nArea: **A = πr^{2}**\nRadius 5 cm: C = 3.14 × 10 = 31.4 cm, A = 3.14 × 25 = 78.5 cm²\n**Careful:** if you are given the diameter, halve it before finding the area.' },
        { title: 'Arcs and sectors',
          text: 'A **sector** is a slice of a circle. Its **arc** is the curved edge.\nUse the fraction {angle/360} of the whole circle.\nA 90° sector is {90/360} = {1/4} of the circle.',
          visual: { type: 'pie', pies: [{ parts: 4, shaded: 1 }] } },
        { title: 'Working backwards',
          text: 'Given C, find d: d = C ÷ π. 31.4 ÷ 3.14 = 10 cm\nGiven A, find r: r^{2} = A ÷ π, then square root.\n78.5 ÷ 3.14 = 25, so r = 5 cm.' },
        { title: 'Worked example',
          text: 'Find the area of a sector with radius 6 cm and angle 60°. Use π = 3.14.\n**1.** Fraction of the circle: {60/360} = {1/6}.\n**2.** Whole circle: 3.14 × 6^{2} = 3.14 × 36 = 113.04 cm².\n**3.** {1/6} × 113.04 = 18.84.\nAnswer: **18.8 cm²** (to 1 d.p.)' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [circumference, circumference, area, area],
          [area, circumference, reverseC, semicircle, spot],
          [sector, sector, reverseA, semicircle, area, reverseC],
        ], ctx);
      },
    });
  }

  /* 19 ── Volume and surface area of prisms and cylinders */
  {
    const cuboid = (l, w, h) => ({ type: 'shape3d', shape: 'cuboid', dims: { l: `${l} cm`, w: `${w} cm`, h: `${h} cm` } });
    const prism = (b, h, L) => ({ type: 'shape3d', shape: 'triangularPrism', dims: { l: b ? `${b} cm` : '', h: h ? `${h} cm` : '', w: `${L} cm` } });
    const cyl = (r, h) => ({ type: 'shape3d', shape: 'cylinder', dims: { r: `${r} cm`, h: `${h} cm` } });

    const cuboidVol = () => {
      const l = R(3, 12), w = R(2, 8), h = R(2, 10);
      return num('Find the volume of this cuboid.', l * w * h,
        ['Volume of a cuboid = length × width × height.', `${l} × ${w} = ${l * w}. Now multiply by ${h}.`],
        `${l} × ${w} × ${h} = ${l * w * h} cm³.`, { unit: 'cm³', visual: cuboid(l, w, h) });
    };

    const crossSection = () => {
      const Ar = R(6, 40), L = R(3, 15);
      return num(`A prism has a cross-section with area ${Ar} cm². It is ${L} cm long.\nFind its volume.`, Ar * L,
        ['Volume of any prism = area of cross-section × length.', `Work out ${Ar} × ${L}.`],
        `${Ar} × ${L} = ${Ar * L} cm³.`, { unit: 'cm³', visual: prism(0, 0, L) });
    };

    const triVol = () => {
      const b = R(2, 10), h = R(2, 10), L = R(3, 15), A0 = b * h / 2;
      return num('The cross-section of this prism is a triangle.\nFind the volume of the prism.', U.clean(A0 * L),
        ['First find the area of the triangle ({1/2} × base × height). Then multiply by the length.', `Triangle area = {1/2} × ${b} × ${h} = ${F(A0)} cm².`],
        `Volume = ${F(A0)} × ${L} = ${F(A0 * L)} cm³.`, { unit: 'cm³', visual: prism(b, h, L) });
    };

    const cylVol = () => {
      const r = R(2, 10), h = R(3, 20), { ans, tol } = piAns(p => p * r * r * h);
      return num(`Find the volume of this cylinder.\n${PI_TXT}`, ans,
        ['A cylinder is a prism with a circle cross-section: V = πr^{2}h.', `Area of the circle = 3.14 × ${r}^{2} = 3.14 × ${r * r} = ${F(U.clean(3.14 * r * r))} cm². Now multiply by the height.`],
        `V = ${F(U.clean(3.14 * r * r))} × ${h} ${ap(U.clean(3.14 * r * r * h), ans)} cm³.`, { unit: 'cm³', tolerance: tol, visual: cyl(r, h) });
    };

    const cuboidSA = () => {
      const l = R(3, 12), w = R(2, 8), h = R(2, 10), sa = 2 * (l * w + l * h + w * h);
      return num('Find the total surface area of this cuboid.', sa,
        ['A cuboid has 6 faces in 3 matching pairs. Find the area of each different face, add, then double.', `The three different faces are ${l} × ${w} = ${l * w}, ${l} × ${h} = ${l * h} and ${w} × ${h} = ${w * h} cm².`],
        `2 × (${l * w} + ${l * h} + ${w * h}) = 2 × ${l * w + l * h + w * h} = ${sa} cm².`, { unit: 'cm²', visual: cuboid(l, w, h) });
    };

    const cylSA = () => {
      const r = R(2, 9), h = R(3, 15), { ans, tol } = piAns(p => 2 * p * r * r + 2 * p * r * h);
      const ends = U.clean(2 * 3.14 * r * r), curved = U.clean(2 * 3.14 * r * h);
      return num(`Find the total surface area of this closed cylinder.\n${PI_TXT}`, ans,
        ['Surface area = two circles + the curved surface. The curved surface opens out into a rectangle: 2πr × h.', `Two circles: 2 × 3.14 × ${r}^{2} = ${F(ends)} cm². Now find the curved surface: 2 × 3.14 × ${r} × ${h}.`],
        `${F(ends)} + ${F(curved)} ${ap(U.clean(ends + curved), ans)} cm².`, { unit: 'cm²', tolerance: tol, visual: cyl(r, h) });
    };

    const triSA = () => {
      const [b, h, s] = pick([[6, 4, 5], [10, 12, 13], [16, 6, 10], [8, 3, 5], [24, 5, 13], [12, 8, 10]]), L = R(4, 15);
      const ends = b * h, sides = (b + 2 * s) * L;
      return num(`The cross-section of this prism is an isosceles triangle. Its two sloping sides are each ${s} cm.\nFind the total surface area of the prism.`, ends + sides,
        ['Add the areas of all 5 faces: 2 triangles and 3 rectangles.', `Two triangles: 2 × {1/2} × ${b} × ${h} = ${ends} cm². The rectangles are ${b} × ${L}, ${s} × ${L} and ${s} × ${L}.`],
        `Triangles ${ends} cm² + rectangles (${b} + ${s} + ${s}) × ${L} = ${sides} cm². Total = ${ends + sides} cm².`, { unit: 'cm²', visual: prism(b, h, L) });
    };

    const reverse = () => {
      if (coin()) {
        const l = R(4, 12), w = R(2, 8), h = R(2, 10), V = l * w * h;
        return num(`A cuboid has a volume of ${V} cm³. It is ${l} cm long and ${w} cm wide.\nHow high is it?`, h,
          ['Volume = length × width × height. Divide the volume by the area of the base.', `Base area = ${l} × ${w} = ${l * w} cm². Now divide ${V} by ${l * w}.`],
          `${V} ÷ ${l * w} = ${h} cm.`, { unit: 'cm', visual: cuboid(l, w, '?') });
      }
      const l = 10 * R(3, 8), w = 10 * R(2, 5), h = 10 * R(2, 6), V = l * w * h;
      return num(`A fish tank is a cuboid ${l} cm long, ${w} cm wide and ${h} cm high.\nHow many litres of water does it hold when full? (1 litre = 1000 cm³)`, V / 1000,
        ['Find the volume in cm³ first. Then divide by 1000 to change to litres.', `Volume = ${l} × ${w} × ${h} = ${F(V)} cm³.`],
        `${F(V)} cm³ ÷ 1000 = ${F(V / 1000)} litres.`, { unit: 'litres', visual: cuboid(l, w, h) });
    };

    PMLM.registerSkill({
      id: 'g9.prisms', grade: 9, unit: 'g9.u5', title: 'Prisms and cylinders', icon: '🧊',
      blurb: 'Volume and surface area of prisms and cylinders',
      lesson: [
        { title: 'What is a prism?',
          text: 'A **prism** has the same cross-section all the way through.\nCuboids, triangular prisms and cylinders all work the same way:\n**Volume = area of cross-section × length**',
          visual: { type: 'shape3d', shape: 'triangularPrism', dims: { l: 'base', h: 'height', w: 'length' } } },
        { title: 'Cylinders',
          text: 'A cylinder is a prism with a circle as its cross-section.\nVolume = πr^{2} × h\nr = 3 cm, h = 10 cm: 3.14 × 9 × 10 = 282.6 cm³',
          visual: { type: 'shape3d', shape: 'cylinder', dims: { r: '3 cm', h: '10 cm' } } },
        { title: 'Surface area',
          text: 'Surface area = the total area of all the faces.\nCuboid: 3 pairs of rectangles.\nCylinder: 2 circles + a curved surface. Unroll it: a rectangle 2πr long and h high.\nSo surface area = 2πr^{2} + 2πrh.' },
        { title: 'Units',
          text: 'Volume is in cubic units: cm³, m³.\nArea is in square units: cm², m².\n1 litre = 1000 cm³, so 60 000 cm³ = 60 litres.' },
        { title: 'Worked example',
          text: 'A triangular prism has a triangle with base 6 cm and height 4 cm. It is 10 cm long. Find its volume.\n**1.** Triangle area = {1/2} × 6 × 4 = 12 cm².\n**2.** Volume = area × length = 12 × 10.\n**3.** = 120.\nAnswer: **120 cm³**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [cuboidVol, cuboidVol, crossSection, triVol],
          [triVol, cylVol, cylVol, cuboidSA, crossSection],
          [cylSA, triSA, reverse, reverse, cylVol, cuboidSA],
        ], ctx);
      },
    });
  }

  /* 20 ── Transformations, enlargement and similar shapes */
  {
    const pt = (x, y) => `(${F(x)}, ${F(y)})`;
    const tri = () => {
      const px = R(1, 2), py = R(1, 2), a = R(2, 3), b = retry(() => { const v = R(1, 3); return v === a ? null : v; });
      return [[px, py], [px + a, py], [px, py + b]];
    };
    const key = pts => pts.map(([x, y]) => `${x},${y}`).sort().join(' ');
    const TF = {
      ry: { name: 'Reflection in the y-axis', f: ([x, y]) => [-x, y] },
      rx: { name: 'Reflection in the x-axis', f: ([x, y]) => [x, -y] },
      rxy: { name: 'Reflection in the line y = x', f: ([x, y]) => [y, x] },
      cw: { name: 'Rotation 90° clockwise about (0, 0)', f: ([x, y]) => [y, -x] },
      acw: { name: 'Rotation 90° anticlockwise about (0, 0)', f: ([x, y]) => [-y, x] },
      r180: { name: 'Rotation 180° about (0, 0)', f: ([x, y]) => [-x, -y] },
      en2: { name: 'Enlargement, scale factor 2, centre (0, 0)', f: ([x, y]) => [2 * x, 2 * y] },
    };

    const describe = () => {
      const obj = tri(), k = pick(Object.keys(TF).filter(t => t !== 'en2' || Math.max(...obj.flat()) <= 3));
      const img = obj.map(TF[k].f);
      const others = Object.keys(TF).filter(t => t !== k && key(obj.map(TF[t].f)) !== key(img)).map(t => TF[t].name);
      const mi = [0, 1, 2].find(i => img[i][0] !== obj[i][0] || img[i][1] !== obj[i][1]);
      const [dx, dy] = [img[mi][0] - obj[mi][0], img[mi][1] - obj[mi][1]];
      others.push('Translation ' + [dx ? `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}` : '', dy ? `${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}` : ''].filter(Boolean).join(' and '));
      return choice('Describe the single transformation that maps shape A onto shape B.', TF[k].name, U.sample(others, 3),
        ['Is B the same size as A? Is it flipped over (reflection), turned (rotation) or just slid (translation)? A different size means enlargement.', `Follow one corner: A has a corner at ${pt(...obj[mi])}. It moves to ${pt(...img[mi])} on B.`],
        `${TF[k].name} maps A onto B: the corner ${pt(...obj[mi])} goes to ${pt(...img[mi])}.`,
        { visual: { type: 'grid', xmin: -6, xmax: 6, ymin: -6, ymax: 6, polygons: [{ pts: obj, label: 'A' }, { pts: img, label: 'B' }] } });
    };

    const reflectPt = () => {
      const x = nz(-4, 4), y = nz(-4, 4), t = R(1, 4);
      if (t === 1) return coord(`Reflect the point P${pt(x, y)} in the x-axis.\nWhat are the coordinates of the image?`, x, -y,
        ['Reflecting in the x-axis keeps x the same. The point ends up the same distance on the other side of the x-axis.', `P is ${A(y)} ${y > 0 ? 'above' : 'below'} the x-axis, so the image is ${A(y)} ${y > 0 ? 'below' : 'above'} it.`],
        `The image is ${pt(x, -y)}.`, { visual: { type: 'grid', points: [{ x, y, label: 'P' }] } });
      if (t === 2) return coord(`Reflect the point P${pt(x, y)} in the y-axis.\nWhat are the coordinates of the image?`, -x, y,
        ['Reflecting in the y-axis keeps y the same. The point ends up the same distance on the other side of the y-axis.', `P is ${A(x)} to the ${x > 0 ? 'right' : 'left'} of the y-axis, so the image is ${A(x)} to the ${x > 0 ? 'left' : 'right'}.`],
        `The image is ${pt(-x, y)}.`, { visual: { type: 'grid', points: [{ x, y, label: 'P' }] } });
      if (t === 3) {
        const yy = x === y ? y + (y < 4 ? 1 : -1) : y;
        return coord(`Reflect the point P${pt(x, yy)} in the line y = x.\nWhat are the coordinates of the image?`, yy, x,
          ['Reflecting in the line y = x swaps the x- and y-coordinates.', `P is ${pt(x, yy)}. Swap the two numbers.`],
          `The image is ${pt(yy, x)}.`, { visual: { type: 'grid', points: [{ x, y: yy, label: 'P' }], lines: [{ m: 1, c: 0, label: 'y = x' }] } });
      }
      const k = nz(-2, 2), yy = retry(() => { const v = R(-4, 4); return v !== k && Math.abs(2 * k - v) <= 5 ? v : null; });
      return coord(`Reflect the point P${pt(x, yy)} in the line y = ${F(k)}.\nWhat are the coordinates of the image?`, x, 2 * k - yy,
        ['The image is the same distance from the mirror line, on the other side. x stays the same.', `P is ${A(yy - k)} ${yy > k ? 'above' : 'below'} the line y = ${F(k)}.`],
        `${A(yy - k)} ${yy > k ? 'below' : 'above'} y = ${F(k)} is y = ${F(2 * k - yy)}, so the image is ${pt(x, 2 * k - yy)}.`,
        { visual: { type: 'grid', points: [{ x, y: yy, label: 'P' }], lines: [{ m: 0, c: k, label: `y = ${F(k)}` }] } });
    };

    const translatePt = () => {
      const x = R(-4, 4), y = R(-4, 4), a = nz(-5, 5), b = nz(-5, 5);
      return coord(`The point P${pt(x, y)} is translated ${A(a)} ${a > 0 ? 'right' : 'left'} and ${A(b)} ${b > 0 ? 'up' : 'down'}.\nWhere does P end up?`, x + a, y + b,
        ['Right and left change the x-coordinate. Up and down change the y-coordinate.', `x: ${F(x)} ${a > 0 ? '+' : '−'} ${A(a)} = ${F(x + a)}. Now do the same for y.`],
        `${pt(x, y)} → ${pt(x + a, y + b)}.`, { visual: { type: 'grid', points: [{ x, y, label: 'P' }] } });
    };

    const rotatePt = () => {
      const x = nz(-4, 4), y = nz(-4, 4), k = pick(['cw', 'acw', 'r180']), [nx, ny] = TF[k].f([x, y]);
      const how = { cw: '90° clockwise', acw: '90° anticlockwise', r180: '180°' }[k];
      return coord(`Rotate the point P${pt(x, y)} ${how} about the origin (0, 0).\nWhere does P end up?`, nx, ny,
        [k === 'r180' ? 'A half turn about (0, 0) changes the sign of both coordinates.' : 'Imagine tracing paper: pin it at (0, 0) and turn a quarter turn. Or use the rule: ' + (k === 'cw' ? '(x, y) → (y, −x).' : '(x, y) → (−y, x).'),
          k === 'r180' ? `Change the sign of x: ${F(x)} → ${F(-x)}. Now do the same for y.` : `With x = ${F(x)} and y = ${F(y)}, the new x-coordinate is ${k === 'cw' ? F(y) : F(-y)}.`],
        `${pt(x, y)} → ${pt(nx, ny)}.`, { visual: { type: 'grid', points: [{ x, y, label: 'P' }, { x: 0, y: 0, label: 'O' }] } });
    };

    const enlargeO = L => {
      const half = L === 3 && coin();
      const k = half ? 0.5 : pick([2, 3]);
      const obj = half ? (() => { const px = pick([0, 2]), py = pick([2, 4]), a = pick([2, 4, 6]), b = pick([2, 4].filter(v => v !== a)); return [[px, py], [px + a, py], [px, py + b]]; })() : tri();
      const v = obj[R(0, 2)], [nx, ny] = [U.clean(v[0] * k), U.clean(v[1] * k)];
      return coord(`The triangle is enlarged by scale factor ${half ? '{1/2}' : k}, centre (0, 0).\nWhere does the corner marked V end up?`, nx, ny,
        [half ? 'A scale factor of {1/2} makes the shape smaller: halve the distances from the centre.' : `With centre (0, 0), multiply both coordinates by the scale factor.`, `V is at ${pt(...v)}. Its x-coordinate becomes ${F(v[0])} × ${half ? '{1/2}' : k} = ${F(nx)}.`],
        `${pt(...v)} × ${half ? '{1/2}' : k} → ${pt(nx, ny)}.`,
        { visual: { type: 'grid', xmin: -1, xmax: half ? 9 : 10, ymin: -1, ymax: half ? 9 : 10, polygons: [{ pts: obj }], points: [{ x: v[0], y: v[1], label: 'V' }] } });
    };

    const enlargeC = () => {
      const r = retry(() => {
        const cx = R(-3, 2), cy = R(-3, 2), dx = nz(-3, 3), dy = nz(-3, 3), k = pick([2, 3]);
        const px = cx + dx, py = cy + dy, nx = cx + k * dx, ny = cy + k * dy;
        return Math.abs(px) <= 6 && Math.abs(py) <= 6 ? { cx, cy, px, py, nx, ny, k, dx, dy } : null;
      });
      return coord(`P is enlarged by scale factor ${r.k} with centre C${pt(r.cx, r.cy)}.\nWhere does P end up?`, r.nx, r.ny,
        ['Find how to get from C to P, then multiply that movement by the scale factor.', `From C to P: ${A(r.dx)} ${r.dx > 0 ? 'right' : 'left'} and ${A(r.dy)} ${r.dy > 0 ? 'up' : 'down'}. Multiply each by ${r.k}, starting from C.`],
        `From C go ${A(r.k * r.dx)} ${r.dx > 0 ? 'right' : 'left'} and ${A(r.k * r.dy)} ${r.dy > 0 ? 'up' : 'down'}: ${pt(r.nx, r.ny)}.`,
        { visual: { type: 'grid', xmin: -6, xmax: 6, ymin: -6, ymax: 6, points: [{ x: r.cx, y: r.cy, label: 'C' }, { x: r.px, y: r.py, label: 'P' }] } });
    };

    const sfGrid = () => {
      const w = R(1, 3), h = R(1, 2), k = pick([2, 3]), shrink = coin();
      const small = [[1, 1], [1 + w, 1], [1 + w, 1 + h], [1, 1 + h]];
      const bx = 3 + w, big = [[bx, 1], [bx + k * w, 1], [bx + k * w, 1 + k * h], [bx, 1 + k * h]];
      if (bx + k * w > 14 || 1 + k * h > 10) return null;
      const [A1, B1] = shrink ? [big, small] : [small, big];
      const polys = [{ pts: A1, label: 'A' }, { pts: B1, label: 'B' }];
      const hints = ['Scale factor = a length on B ÷ the matching length on A.', `The bottom edge of A is ${shrink ? k * w : w} squares long. Count the bottom edge of B.`];
      const vis = { visual: { type: 'grid', xmin: 0, xmax: 14, ymin: 0, ymax: 10, polygons: polys } };
      if (shrink) return fracQ('Shape B is an enlargement of shape A.\nWhat is the scale factor?', 1, k, hints, `${w} ÷ ${k * w} = ${fr(1, k)}. B is smaller, so the scale factor is less than 1.`, vis);
      return num('Shape B is an enlargement of shape A.\nWhat is the scale factor?', k, hints, `${k * w} ÷ ${w} = ${k}, so the scale factor is ${k}.`, vis);
    };

    const similar = () => {
      const a = R(2, 8), b = retry(() => { const v = R(2, 10); return v === a ? null : v; }), k = pick([2, 3, 1.5, 2.5, 4]), c = U.clean(k * a), ans = U.clean(k * b);
      if (!Number.isInteger(c)) return null;
      if (coin()) {
        return num(`Rectangles A and B are similar.\nA is ${a} cm by ${b} cm. B is ${F(c)} cm by ? cm (the ${F(c)} cm side matches the ${a} cm side).\nFind the missing length.`, ans,
          ['Similar shapes: every length is multiplied by the same scale factor.', `Scale factor = ${F(c)} ÷ ${a} = ${F(k)}.`],
          `Scale factor ${F(k)}, so the missing length = ${b} × ${F(k)} = ${F(ans)} cm.`,
          { unit: 'cm', visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `${F(c)} cm`, height: '?' } } });
      }
      return num(`Triangles PQR and XYZ are similar.\nPQ = ${a} cm, QR = ${b} cm and XY = ${F(c)} cm.\nFind YZ.`, ans,
        ['Match the sides: PQ ↔ XY and QR ↔ YZ. Find the scale factor from the pair you know.', `Scale factor = XY ÷ PQ = ${F(c)} ÷ ${a} = ${F(k)}.`],
        `YZ = QR × ${F(k)} = ${b} × ${F(k)} = ${F(ans)} cm.`, { unit: 'cm' });
    };

    const areaSF = () => {
      const k = pick([2, 3, 4]), Ar = R(2, 12), who = U.name();
      return num(`Shape A has an area of ${Ar} cm². It is enlarged by scale factor ${k} to make shape B.\n${who} says the area of B is ${Ar * k} cm². What is the correct area?`, Ar * k * k,
        ['Draw a 1 × 1 square and enlarge it by scale factor ' + k + '. How many of the small squares fit inside?', `Each length is × ${k}, so area is × ${k} × ${k} = ${k * k}.`],
        `Area scale factor = ${k}^{2} = ${k * k}, so the area of B is ${Ar} × ${k * k} = ${Ar * k * k} cm².`, { unit: 'cm²' });
    };

    PMLM.registerSkill({
      id: 'g9.transform', grade: 9, unit: 'g9.u5', title: 'Transformations', icon: '🪞',
      blurb: 'Reflect, rotate, translate, enlarge; similar shapes',
      lesson: [
        { title: 'Four transformations',
          text: '**Translation:** slide (say how far right/left and up/down).\n**Reflection:** flip in a mirror line.\n**Rotation:** turn (give the angle, direction and centre).\n**Enlargement:** change size (give the scale factor and centre).',
          visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, polygons: [{ pts: [[1, 1], [4, 1], [1, 3]], label: 'A' }, { pts: [[-1, 1], [-4, 1], [-1, 3]], label: 'B' }] } },
        { title: 'Coordinate rules',
          text: 'Reflect in the x-axis: (x, y) → (x, −y)\nReflect in the y-axis: (x, y) → (−x, y)\nReflect in y = x: (x, y) → (y, x)\nRotate 180° about (0, 0): (x, y) → (−x, −y)' },
        { title: 'Enlargement',
          text: 'Scale factor 2: every length doubles, and every point is twice as far from the centre.\nScale factor {1/2}: lengths halve, so the shape gets smaller.\nCentre (0, 0): multiply the coordinates by the scale factor.',
          visual: { type: 'grid', xmin: 0, xmax: 8, ymin: 0, ymax: 6, polygons: [{ pts: [[1, 1], [3, 1], [1, 2]], label: 'A' }, { pts: [[2, 2], [6, 2], [2, 4]], label: 'B' }] } },
        { title: 'Similar shapes',
          text: 'Similar shapes are enlargements of each other: same angles, lengths in the same ratio.\nScale factor = new length ÷ old length.\n**Careful:** if lengths are × 3, areas are × 9 (3^{2}).' },
        { title: 'Worked example',
          text: 'Enlarge P(3, 2) by scale factor 2, centre C(1, 1).\n**1.** From C to P: 2 right and 1 up.\n**2.** Double it: 4 right and 2 up.\n**3.** Start at C(1, 1): (1 + 4, 1 + 2).\nAnswer: **(5, 3)**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [reflectPt, reflectPt, translatePt, () => retry(sfGrid), describe],
          [rotatePt, enlargeO, describe, () => retry(similar), reflectPt, () => retry(sfGrid)],
          [enlargeC, enlargeC, enlargeO, describe, () => retry(similar), areaSF],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 6: Statistics and probability ═══════════════════════
  PMLM.registerUnit({ id: 'g9.u6', grade: 9, name: 'Statistics and chance', icon: '📊' });

  /* 21 ── Grouped frequency tables: estimated mean, modal class */
  {
    const CTXS = [
      { head: 'Time, t (minutes)', v: 't', ws: [5, 10], starts: [0], what: 'the times some students took to finish a puzzle' },
      { head: 'Mass, m (kg)', v: 'm', ws: [5, 10], starts: [0, 10], what: 'the masses of some parcels' },
      { head: 'Height, h (cm)', v: 'h', ws: [10, 5], starts: [140, 150], what: 'the heights of some students' },
      { head: 'Score, s', v: 's', ws: [10, 20], starts: [0], what: 'the scores in a test' },
    ];
    const make = (k = R(4, 5)) => retry(() => {
      const c = pick(CTXS), w = pick(c.ws), st = pick(c.starts);
      const cls = U.range(0, k - 1).map(i => [st + i * w, st + (i + 1) * w]);
      const fs = cls.map(() => R(2, 12));
      const mx = Math.max(...fs);
      if (fs.filter(f => f === mx).length > 1) return null;
      const labels = cls.map(([a, b]) => `${a} < ${c.v} ≤ ${b}`), mids = cls.map(([a, b]) => U.clean((a + b) / 2));
      const N = sum(fs), S = sum(fs.map((f, i) => f * mids[i]));
      return { c, w, cls, fs, labels, mids, N, S };
    });
    const tableOf = (t, extra) => ({ type: 'table', headers: [t.c.head, 'Frequency'], rows: t.labels.map((l, i) => [l, t.fs[i]]), ...(extra || {}) });

    const modal = () => {
      const t = make(), i = t.fs.indexOf(Math.max(...t.fs));
      return choice(`The table shows ${t.c.what}.\nWhat is the modal class?`, t.labels[i], t.labels.filter((_, j) => j !== i),
        ['The modal class is the class with the **highest frequency**.', 'Look down the frequency column for the biggest number.'],
        `The highest frequency is ${t.fs[i]}, so the modal class is ${t.labels[i]}.`, { visual: tableOf(t) });
    };

    const midpoint = () => {
      const t = make(), i = R(0, t.cls.length - 1), [a, b] = t.cls[i];
      return num(`The table shows ${t.c.what}.\nWhat is the midpoint of the class ${t.labels[i]}?`, t.mids[i],
        ['The midpoint is halfway between the two ends of the class.', `Add the ends and halve: (${a} + ${b}) ÷ 2.`],
        `(${a} + ${b}) ÷ 2 = ${F(t.mids[i])}.`, { visual: tableOf(t) });
    };

    const mean = () => {
      const t = make(), ans = U.round(t.S / t.N, 1);
      return num(`The table shows ${t.c.what}.\nEstimate the mean. Give your answer to 1 decimal place.`, ans,
        ['Use the midpoint of each class. Work out midpoint × frequency for each row, add them up, then divide by the total frequency.', `The midpoints are ${t.mids.map(v => F(v)).join(', ')}. The total frequency is ${t.N}.`],
        `Total of midpoint × frequency = ${F(t.S)}. ${F(t.S)} ÷ ${t.N} = ${F(U.round(t.S / t.N, 3))}${U.round(t.S / t.N, 3) === t.S / t.N ? '' : '…'} ≈ ${F(ans, 1)}.`,
        { tolerance: 0.05, visual: tableOf(t) });
    };

    const fxMissing = () => {
      const t = make(4), i = R(0, 3), askMid = coin();
      const rows = t.labels.map((l, j) => [l, t.fs[j], j === i && askMid ? '?' : F(t.mids[j]), j === i ? (askMid ? '' : '?') : F(t.fs[j] * t.mids[j])]);
      if (askMid) rows[i][3] = F(t.fs[i] * t.mids[i]);
      const vis = { type: 'table', headers: [t.c.head, 'Frequency', 'Midpoint', 'Midpoint × frequency'], rows };
      if (askMid) {
        return num(`${U.name()} is estimating the mean. Find the missing midpoint in the table.`, t.mids[i],
          ['The midpoint is halfway between the ends of the class.', `The class is ${t.labels[i]}. Add the two ends and halve.`],
          `(${t.cls[i][0]} + ${t.cls[i][1]}) ÷ 2 = ${F(t.mids[i])}.`, { visual: vis });
      }
      return num(`${U.name()} is estimating the mean. Find the missing value in the table.`, U.clean(t.fs[i] * t.mids[i]),
        ['Multiply the midpoint by the frequency for that row.', `In that row the midpoint is ${F(t.mids[i])} and the frequency is ${t.fs[i]}.`],
        `${F(t.mids[i])} × ${t.fs[i]} = ${F(t.fs[i] * t.mids[i])}.`, { visual: vis });
    };

    const medianClass = () => {
      const t = retry(() => {
        const tt = make();
        const pos = tt.N % 2 ? [(tt.N + 1) / 2] : [tt.N / 2, tt.N / 2 + 1];
        const clsOf = p => { let c = 0; for (let i = 0; i < tt.fs.length; i++) { c += tt.fs[i]; if (p <= c) return i; } return -1; };
        const cs = pos.map(clsOf);
        return cs[0] === cs[cs.length - 1] ? Object.assign(tt, { mi: cs[0], pos }) : null;
      });
      const cum = t.fs.map((_, i) => sum(t.fs.slice(0, i + 1)));
      return choice(`The table shows ${t.c.what}.\nWhich class contains the median?`, t.labels[t.mi], t.labels.filter((_, j) => j !== t.mi),
        [`There are ${t.N} values. The median is the ${t.N % 2 ? U.ord(t.pos[0]) : `${U.ord(t.pos[0])} and ${U.ord(t.pos[1])}`} value${t.N % 2 ? '' : 's'} in order.`, `Add up the frequencies as you go down: ${cum.slice(0, 3).join(', ')}, … Where is the ${U.ord(t.pos[0])} value?`],
        `The running totals are ${cum.join(', ')}. The ${U.ord(t.pos[0])} value is in ${t.labels[t.mi]}.`, { visual: tableOf(t) });
    };

    const why = () => {
      const t = make();
      return choice(`${U.name()} uses this table to work out the mean of ${t.c.what}.\nWhy is the answer only an **estimate**?`, 'We do not know the exact values, so we use midpoints',
        ['Some of the frequencies are too small', 'The table has too many classes', 'The total frequency is not a multiple of 10'],
        ['Think about what the table hides. Do you know each individual value?', `For example, in the class ${t.labels[0]} we only know there are ${t.fs[0]} values, not what they are.`],
        'Grouped data hides the exact values. We assume each value is at the midpoint of its class, so the mean is an estimate.', { visual: tableOf(t) });
    };

    PMLM.registerSkill({
      id: 'g9.groupedData', grade: 9, unit: 'g9.u6', title: 'Grouped data', icon: '📊',
      blurb: 'Modal class and estimated mean from a frequency table',
      lesson: [
        { title: 'Grouped frequency tables',
          text: 'Data can be grouped into **classes**. 10 < t ≤ 20 means more than 10 and up to 20.\nThe **modal class** is the class with the highest frequency.',
          visual: { type: 'table', headers: ['Time, t (minutes)', 'Frequency'], rows: [['0 < t ≤ 10', 3], ['10 < t ≤ 20', 7], ['20 < t ≤ 30', 6], ['30 < t ≤ 40', 4]] } },
        { title: 'Midpoints',
          text: 'We do not know the exact values in a class, so we use the **midpoint**.\nMidpoint of 10 < t ≤ 20 = (10 + 20) ÷ 2 = 15.\nWe pretend all 7 values are 15.' },
        { title: 'Estimating the mean',
          text: '1. Find each midpoint.\n2. Multiply midpoint × frequency.\n3. Add these up and divide by the total frequency.',
          visual: { type: 'table', headers: ['Class', 'Frequency', 'Midpoint', 'Midpoint × frequency'], rows: [['0 < t ≤ 10', 3, 5, 15], ['10 < t ≤ 20', 7, 15, 105], ['20 < t ≤ 30', 6, 25, 150], ['30 < t ≤ 40', 4, 35, 140]] } },
        { title: 'Worked example',
          text: 'Estimate the mean time from the table above.\n**1.** Add the last column: 15 + 105 + 150 + 140 = 410.\n**2.** Total frequency: 3 + 7 + 6 + 4 = 20.\n**3.** 410 ÷ 20 = 20.5.\nAnswer: **about 20.5 minutes**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [modal, modal, midpoint, midpoint, fxMissing],
          [mean, mean, modal, medianClass, fxMissing],
          [mean, mean, medianClass, why, fxMissing],
        ], ctx);
      },
    });
  }

  /* 22 ── Scatter graphs and correlation */
  {
    const pearson = pts => {
      const n = pts.length, mx = sum(pts.map(p => p.x)) / n, my = sum(pts.map(p => p.y)) / n;
      let sxy = 0, sxx = 0, syy = 0;
      pts.forEach(p => { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; });
      return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
    };
    const cloud = type => retry(() => {
      const xs = U.sample(U.range(1, 10), 10);
      const pts = xs.map(x => {
        let y;
        if (type === 'pos') y = Math.round(0.8 * x + 1 + R(-1, 1));
        else if (type === 'neg') y = Math.round(10 - 0.8 * x + R(-1, 1));
        else y = R(1, 9);
        return { x, y: Math.max(0, Math.min(10, y)) };
      });
      const r = pearson(pts);
      const ok = type === 'pos' ? r > 0.8 : type === 'neg' ? r < -0.8 : Math.abs(r) < 0.2;
      return ok ? pts : null;
    });
    const NAME = { pos: 'Positive correlation', neg: 'Negative correlation', none: 'No correlation' };

    const corrType = () => {
      const type = pick(['pos', 'neg', 'none']);
      return choice('What type of correlation does this scatter graph show?', NAME[type], Object.values(NAME).filter(v => v !== NAME[type]),
        ['Positive: as x increases, y tends to increase. Negative: as x increases, y tends to decrease. No correlation: no pattern.', 'Imagine drawing one straight line through the middle of the points. Does it go up, down, or is there no clear line?'],
        `${NAME[type]}: ${type === 'pos' ? 'the points go up from left to right' : type === 'neg' ? 'the points go down from left to right' : 'the points are scattered with no pattern'}.`,
        { visual: { type: 'grid', xmin: 0, xmax: 10, ymin: 0, ymax: 10, points: cloud(type) } });
    };

    const CTX = {
      pos: ['the temperature and the number of ice creams sold', 'the height of a person and their shoe size', 'the hours spent revising and the test score', 'the age of a tree and its height'],
      neg: ['the temperature and the number of scarves sold', 'the age of a car and its value', 'the speed of a car and the time for a journey', 'the outside temperature and the cost of heating a home'],
      none: ['a person\'s shoe size and their test score', 'the day of the month someone was born and their height', 'the colour of a car and its top speed', 'a person\'s house number and their age'],
    };
    const context = () => {
      const type = pick(['pos', 'neg', 'none']), pair = pick(CTX[type]);
      return choice(`What type of correlation would you expect between ${pair}?`, NAME[type], Object.values(NAME).filter(v => v !== NAME[type]),
        ['Ask: when the first one goes up, what happens to the second one?', 'If the second tends to go up too, it is positive. If it tends to go down, it is negative. If there is no link, there is no correlation.'],
        `${NAME[type]}: ${type === 'pos' ? 'when one goes up, the other tends to go up' : type === 'neg' ? 'when one goes up, the other tends to go down' : 'there is no link between them'}.`);
    };

    const estimate = () => {
      const [m, c] = pick([[1, 0], [1, 1], [0.5, 2], [0.5, 3], [-1, 10], [-1, 9], [-0.5, 8], [-0.5, 9]]);
      const xs = U.sample(U.range(1, 9), 8).sort((a, b) => a - b);
      const pts = xs.map(x => ({ x, y: Math.max(0, Math.min(10, Math.round(m * x + c + R(-1, 1)))) }));
      const cand = U.range(2, 8).filter(x => Number.isInteger(m * x + c)), free = cand.filter(x => !xs.includes(x));
      const x0 = pick(free.length ? free : cand);
      const ans = U.clean(m * x0 + c);
      return num(`The scatter graph has a line of best fit.\nUse the line to estimate y when x = ${x0}.`, ans,
        ['Go up from the x value to the line, then across to the y-axis.', `Find x = ${x0} on the x-axis and go straight up until you hit the line.`],
        `At x = ${x0} the line is at y = ${F(ans)}.`,
        { tolerance: 0.5, visual: { type: 'grid', xmin: 0, xmax: 10, ymin: 0, ymax: 10, points: pts, lines: [{ m, c }] } });
    };

    const outlier = () => {
      const type = coin() ? 'pos' : 'neg';
      const pts = cloud(type).slice(0, 9);
      const f = x => (type === 'pos' ? 0.8 * x + 1 : 10 - 0.8 * x);
      // move one point well away from the trend
      const oi = R(2, 6), o = pts[oi];
      o.y = f(o.x) > 5 ? Math.max(0, Math.round(f(o.x)) - 6) : Math.min(10, Math.round(f(o.x)) + 6);
      const others = U.sample(pts.filter((p, i) => i !== oi && Math.abs(p.y - f(p.x)) <= 1.5), 3);
      if (others.length < 3) return null;
      const letters = U.shuffle(['A', 'B', 'C', 'D']);
      o.label = letters[0];
      others.forEach((p, i) => { p.label = letters[i + 1]; });
      return choice('Which labelled point is an **outlier**?', letters[0], letters.slice(1),
        ['An outlier is a point that does not fit the pattern of the others.', 'Look at the trend of most points. Which labelled point is far away from it?'],
        `Point ${letters[0]} is far from the trend of the other points, so it is the outlier.`,
        { visual: { type: 'grid', xmin: 0, xmax: 10, ymin: 0, ymax: 10, points: pts } });
    };

    const CAUSE = [
      { q: 'In summer, ice-cream sales and cases of sunburn both go up. They show positive correlation.', ans: 'Hot, sunny weather causes both. Ice cream does not cause sunburn.', wr: ['Eating ice cream causes sunburn.', 'Sunburn makes people buy ice cream.', 'There is no correlation between them.'] },
      { q: 'Towns with more libraries also have more crime. They show positive correlation.', ans: 'Bigger towns have more of both. Libraries do not cause crime.', wr: ['Libraries cause crime.', 'Crime makes towns build libraries.', 'This is negative correlation.'] },
      { q: 'Children with bigger feet tend to have a bigger vocabulary. They show positive correlation.', ans: 'Older children have bigger feet and know more words. Feet do not cause vocabulary.', wr: ['Big feet help children learn words.', 'Learning words makes feet grow.', 'This is negative correlation.'] },
    ];
    const causation = () => {
      const c = pick(CAUSE);
      return choice(`${c.q}\nWhich statement is correct?`, c.ans, c.wr,
        ['Correlation shows that two things are linked. It does **not** prove that one causes the other.', 'Is there a third thing that could make both of them go up together?'],
        `${c.ans} Correlation does not mean causation.`);
    };

    const reliable = () => {
      const lo = R(1, 3), hi = lo + R(6, 8), out = hi + R(8, 20), inside = U.sample(U.range(lo + 1, hi - 1), 3);
      return choice(`A line of best fit is drawn for data with x from ${lo} to ${hi}.\nWhich estimate is the **least** reliable?`, `Estimating y when x = ${out}`,
        inside.map(v => `Estimating y when x = ${v}`),
        ['Estimates inside the range of the data are more reliable than estimates outside it.', `Which x value is outside the range ${lo} to ${hi}?`],
        `x = ${out} is outside the data (${lo} to ${hi}). We do not know if the pattern continues, so that estimate is the least reliable.`);
    };

    PMLM.registerSkill({
      id: 'g9.scatter', grade: 9, unit: 'g9.u6', title: 'Scatter graphs', icon: '🔵',
      blurb: 'Correlation, lines of best fit and outliers',
      lesson: [
        { title: 'Scatter graphs',
          text: 'A scatter graph plots pairs of data as points, to see if two things are linked.\n**Positive correlation:** as one goes up, the other tends to go up.',
          visual: { type: 'grid', xmin: 0, xmax: 10, ymin: 0, ymax: 10, points: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 8 }, { x: 9, y: 8 }] } },
        { title: 'Negative and no correlation',
          text: '**Negative correlation:** as one goes up, the other tends to go down (age of a car and its value).\n**No correlation:** no pattern (shoe size and test score).',
          visual: { type: 'grid', xmin: 0, xmax: 10, ymin: 0, ymax: 10, points: [{ x: 1, y: 9 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 3 }, { x: 9, y: 1 }] } },
        { title: 'Line of best fit',
          text: 'Draw a straight line through the middle of the points, following the trend.\nUse it to estimate: go up from x to the line, then across to y.\nEstimates **outside** the data range are not reliable.\nA point far from the others is an **outlier**.',
          visual: { type: 'grid', xmin: 0, xmax: 10, ymin: 0, ymax: 10, points: [{ x: 1, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 7 }, { x: 9, y: 7 }], lines: [{ m: 0.7, c: 1.2 }] } },
        { title: 'Worked example',
          text: 'Ice-cream sales and sunburn cases show positive correlation. Does ice cream cause sunburn?\n**1.** Correlation shows a link, not a cause.\n**2.** Look for a hidden reason: hot, sunny weather.\n**3.** Sunshine increases both.\nAnswer: **No.** Correlation does not mean causation.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [corrType, corrType, context, context],
          [corrType, estimate, estimate, () => retry(outlier), context],
          [estimate, () => retry(outlier), causation, reliable, corrType],
        ], ctx);
      },
    });
  }

  /* 23 ── Probability of combined events */
  {
    const complement = () => {
      if (coin()) {
        const p = R(1, 19) * 5, [ev, nev] = pick([['it rains tomorrow', 'it does **not** rain tomorrow'], ['a train is late', 'the train is **not** late'], ['a team wins its next match', 'the team does **not** win'], ['a seed grows', 'the seed does **not** grow']]);
        return num(`The probability that ${ev} is ${F(p / 100)}.\nWhat is the probability that ${nev}?`, U.clean(1 - p / 100),
          ['An event either happens or it does not. The two probabilities add up to 1.', `Work out 1 − ${F(p / 100)}.`],
          `1 − ${F(p / 100)} = ${F(U.clean(1 - p / 100))}.`);
      }
      const d = pick([5, 6, 8, 9, 10, 12]), n = R(1, d - 1);
      return fracQ(`The probability of picking a winning ticket is ${fr(n, d)}.\nWhat is the probability of **not** picking a winning ticket?`, d - n, d,
        ['The probability that something does not happen = 1 − the probability that it does.', `1 = ${fr(d, d)}. Work out ${fr(d, d)} − ${fr(n, d)}.`],
        `1 − ${fr(n, d)} = ${fr(d - n, d)}${U.gcd(d - n, d) > 1 ? ` = ${U.fracS(d - n, d)}` : ''}.`);
    };

    const space = () => {
      const p = R(3, 4), q = R(3, 5), A1 = U.range(1, p), B1 = U.range(1, q);
      const sums = []; A1.forEach(a => B1.forEach(b => sums.push(a + b)));
      const t = R(1, 2);
      let count, desc;
      if (t === 1) { const s = pick([...new Set(sums)].filter(v => sums.filter(x => x === v).length >= 2)); count = sums.filter(x => x === s).length; desc = `the total is ${s}`; }
      else { const k = R(4, p + q - 2); count = sums.filter(x => x > k).length; desc = `the total is more than ${k}`; }
      return fracQ(`Two fair spinners, numbered 1 to ${p} and 1 to ${q}, are spun. The scores are added.\nThe table shows all the possible totals. What is the probability that ${desc}?`, count, p * q,
        ['Count the outcomes that work, then divide by the total number of outcomes.', `There are ${p} × ${q} = ${p * q} outcomes altogether. Count the ones where ${desc}.`],
        `${count} out of ${p * q} outcomes work, so the probability is ${fr(count, p * q)}${U.gcd(count, p * q) > 1 ? ` = ${U.fracS(count, p * q)}` : ''}.`,
        { visual: { type: 'table', headers: ['+', ...B1.map(String)], rows: A1.map(a => [String(a), ...B1.map(b => String(a + b))]) } });
    };

    const dice = () => {
      const t = R(1, 3);
      if (t === 1) {
        const s = R(3, 11), c = 6 - Math.abs(7 - s);
        return fracQ(`Two fair dice are thrown and the scores are added.\nWhat is the probability of a total of ${s}?`, c, 36,
          ['There are 6 × 6 = 36 equally likely outcomes. List the pairs that make the total.', `Pairs that add to ${s} include (${Math.max(1, s - 6)}, ${s - Math.max(1, s - 6)}). Find them all.`],
          `There are ${c} ways to make ${s} out of 36, so the probability is ${fr(c, 36)}${U.gcd(c, 36) > 1 ? ` = ${U.fracS(c, 36)}` : ''}.`);
      }
      if (t === 2) {
        return fracQ('Two fair dice are thrown.\nWhat is the probability of getting a double (both dice the same)?', 6, 36,
          ['There are 36 equally likely outcomes. Count the doubles.', 'The doubles are (1, 1), (2, 2), … How many are there?'],
          'There are 6 doubles out of 36 outcomes: {6/36} = {1/6}.');
      }
      const k = R(2, 5);
      return fracQ(`A fair coin is thrown and a fair dice is rolled.\nWhat is the probability of a head and a number greater than ${k}?`, 6 - k, 12,
        ['The events are independent, so multiply the probabilities.', `P(head) = {1/2} and P(more than ${k}) = ${fr(6 - k, 6)}.`],
        `{1/2} × ${fr(6 - k, 6)} = ${fr(6 - k, 12)}${U.gcd(6 - k, 12) > 1 ? ` = ${U.fracS(6 - k, 12)}` : ''}.`);
    };

    const bagVis = (r, b) => ({ type: 'bag', items: [{ color: 'red', count: r }, { color: 'blue', count: b }] });
    const withRepl = () => {
      const r = R(1, 6), b = R(1, 6), n = r + b, col = coin() ? 'red' : 'blue', c = col === 'red' ? r : b;
      return fracQ(`A bag has ${r} red and ${U.s(b, 'blue counter')}. ${U.name()} takes a counter, puts it back, then takes another.\nWhat is the probability that both are ${col}?`, c * c, n * n,
        ['The counter is put back, so the second pick is just like the first. Multiply the probabilities.', `P(${col}) = ${fr(c, n)} each time. Work out ${fr(c, n)} × ${fr(c, n)}.`],
        `${fr(c, n)} × ${fr(c, n)} = ${fr(c * c, n * n)}${U.gcd(c * c, n * n) > 1 ? ` = ${U.fracS(c * c, n * n)}` : ''}.`, { visual: bagVis(r, b) });
    };

    const relFreq = () => {
      const N = pick([50, 100, 200, 250, 400, 500]), k = R(Math.round(N / 10), Math.round(N / 3)), who = U.name();
      if (coin()) {
        return num(`${who} rolls a dice ${N} times and gets a six ${k} times.\nWhat is the relative frequency of getting a six? Give your answer as a decimal.`, U.clean(k / N),
          ['Relative frequency = number of times it happened ÷ number of trials.', `Work out ${k} ÷ ${N}.`],
          `${k} ÷ ${N} = ${F(U.clean(k / N))}.`);
      }
      const p = pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4]), T = pick([60, 80, 100, 200, 300, 500]);
      return num(`The probability that a drawing pin lands point up is ${F(p)}.\n${who} drops it ${T} times. How many times would you expect it to land point up?`, U.clean(p * T),
        ['Expected number = probability × number of trials.', `Work out ${F(p)} × ${T}.`],
        `${F(p)} × ${T} = ${F(U.clean(p * T))} times.`);
    };

    const exactlyOne = () => {
      const r = R(1, 5), b = R(1, 5), n = r + b;
      return fracQ(`A bag has ${r} red and ${U.s(b, 'blue counter')}. A counter is taken, put back, and a second counter is taken.\nWhat is the probability of getting exactly one red?`, 2 * r * b, n * n,
        ['Exactly one red can happen two ways: red then blue, or blue then red. Find both and add.', `P(red then blue) = ${fr(r, n)} × ${fr(b, n)} = ${fr(r * b, n * n)}. Now find P(blue then red).`],
        `${fr(r * b, n * n)} + ${fr(r * b, n * n)} = ${fr(2 * r * b, n * n)}${U.gcd(2 * r * b, n * n) > 1 ? ` = ${U.fracS(2 * r * b, n * n)}` : ''}.`, { visual: bagVis(r, b) });
    };

    const without = () => {
      const r = R(2, 6), b = R(1, 6), n = r + b;
      return fracQ(`A bag has ${r} red and ${U.s(b, 'blue counter')}. ${U.name()} takes two counters **without** putting the first back.\nWhat is the probability that both are red?`, r * (r - 1), n * (n - 1),
        ['After the first red is taken, there is one less red and one less counter in the bag.', `P(first red) = ${fr(r, n)}. Then P(second red) = ${fr(r - 1, n - 1)}. Multiply them.`],
        `${fr(r, n)} × ${fr(r - 1, n - 1)} = ${fr(r * (r - 1), n * (n - 1))}${U.gcd(r * (r - 1), n * (n - 1)) > 1 ? ` = ${U.fracS(r * (r - 1), n * (n - 1))}` : ''}.`, { visual: bagVis(r, b) });
    };

    const atLeast = () => {
      if (coin()) {
        const k = R(2, 4), d = Math.pow(2, k);
        return fracQ(`A fair coin is thrown ${k} times.\nWhat is the probability of getting at least one head?`, d - 1, d,
          ['"At least one head" is everything except "no heads at all". Use 1 − P(no heads).', `P(no heads) = P(all tails) = ${Array(k).fill('{1/2}').join(' × ')} = ${fr(1, d)}.`],
          `1 − ${fr(1, d)} = ${fr(d - 1, d)}.`);
      }
      return fracQ('Two fair dice are thrown.\nWhat is the probability of getting at least one six?', 11, 36,
        ['Use 1 − P(no sixes).', 'P(no six on one dice) = {5/6}. So P(no sixes on both) = {5/6} × {5/6} = {25/36}.'],
        '1 − {25/36} = {11/36}.');
    };

    const spot = () => {
      const who = U.name();
      if (coin()) {
        return fracQ(`${who} says: "The probability of two heads when I throw two coins is {1/2} + {1/2} = 1."\nWhat is the correct probability?`, 1, 4,
          ['A probability of 1 means certain. Is two heads certain? For "and" with independent events, multiply.', 'List the outcomes: HH, HT, TH, TT. How many are two heads?'],
          `{1/2} × {1/2} = {1/4}. ${who} added instead of multiplying.`);
      }
      const r = R(2, 5), b = R(2, 5), n = r + b;
      return fracQ(`A bag has ${r} red and ${U.s(b, 'blue counter')}. A counter is taken and put back, twice.\n${who} says P(both red) = ${fr(r, n)} + ${fr(r, n)} = ${sfr(2 * r, n)}. What is the correct probability?`, r * r, n * n,
        ['For "this **and** that" with independent events, multiply the probabilities.', `Work out ${fr(r, n)} × ${fr(r, n)}.`],
        `${fr(r, n)} × ${fr(r, n)} = ${fr(r * r, n * n)}${U.gcd(r, n) > 1 ? ` = ${U.fracS(r * r, n * n)}` : ''}. ${who} added instead of multiplying.`, { visual: bagVis(r, b) });
    };

    PMLM.registerSkill({
      id: 'g9.probability', grade: 9, unit: 'g9.u6', title: 'Combined events', icon: '🎲',
      blurb: 'Sample spaces, tree diagrams and relative frequency',
      lesson: [
        { title: 'Sample spaces',
          text: 'A **sample space** lists every possible outcome. A table helps when there are two events.\nTwo spinners 1–3: 9 outcomes. A total of 4 happens 3 times, so P(total 4) = {3/9} = {1/3}.',
          visual: { type: 'table', headers: ['+', '1', '2', '3'], rows: [['1', '2', '3', '4'], ['2', '3', '4', '5'], ['3', '4', '5', '6']] } },
        { title: 'AND means multiply',
          text: 'For independent events: P(A and B) = P(A) × P(B).\nP(head and a six) = {1/2} × {1/6} = {1/12}\nA tree diagram shows this: multiply **along** the branches, add **down** the ends.' },
        { title: 'Without replacement',
          text: 'If the first item is **not** put back, the second probability changes.\n5 red, 3 blue. P(red, red) = {5/8} × {4/7} = {20/56} = {5/14}',
          visual: { type: 'bag', items: [{ color: 'red', count: 5 }, { color: 'blue', count: 3 }] } },
        { title: 'Relative frequency',
          text: 'Relative frequency = {times it happened/number of trials}\nA pin lands point up 46 times in 200 drops: 46 ÷ 200 = 0.23.\nMore trials give a better estimate of the probability.\nExpected number = probability × trials.' },
        { title: 'Worked example',
          text: 'Throw a fair coin 3 times. Find P(at least one head).\n**1.** The opposite of "at least one head" is "no heads" (TTT).\n**2.** P(TTT) = {1/2} × {1/2} × {1/2} = {1/8}.\n**3.** 1 − {1/8} = {7/8}.\nAnswer: **{7/8}**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [complement, complement, space, space, relFreq],
          [dice, withRepl, relFreq, space, dice, complement],
          [exactlyOne, without, atLeast, spot, withRepl, dice],
        ], ctx);
      },
    });
  }
})();
