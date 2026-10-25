// Play More Learn More — Cambridge Lower Secondary Stage 7 (Grade 7, age ~12).
// 5 units, 23 skills. See src/CONTRACT.md for the shapes used here.
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
  // fraction answer; falls back to a number question when the value is whole
  const fracQ = (q, n, d, hints, explain, extra) => {
    const [a, b] = U.simplify(n, d);
    if (b === 1) {
      const e = Object.assign({}, extra || {});
      delete e.simplest; delete e.mixed;
      return num(q, a, hints, explain, e);
    }
    const e = Object.assign({}, extra || {});
    if (Math.abs(a) < b) delete e.mixed;
    // the engine wants a mixed number when an improper answer must be in simplest form, so say so
    if (e.simplest && e.mixed) q = q.replace(SIMPLE, 'Give your answer as a mixed number in its simplest form.');
    return Object.assign({ q, kind: 'fraction', answer: [a, b], hints, explain }, e);
  };
  const money = (cur, x) => cur + (Number.isInteger(U.clean(x)) ? F(x) : F(x, 2));
  const sum = arr => arr.reduce((s, v) => s + v, 0);
  const coordS = (x, y) => `(${F(x)}, ${F(y)})`;
  const SIMPLE = 'Give your answer in its simplest form.';

  // ═══════════════════════ Unit 1: Number and integers ═══════════════════════
  PMLM.registerUnit({ id: 'g7.u1', grade: 7, name: 'Number and integers', icon: '🔢' });

  /* 1 ── Adding and subtracting integers */
  {
    // a op b, where op is '+' or '−' and b may be negative
    const info = (a, op, b) => {
      const eff = op === '+' ? b : -b;
      const ans = a + eff;
      const expr = `${F(a)} ${op === '+' ? '+' : M} ${P(b)}`;
      const dir = eff < 0 ? 'left' : 'right';
      let nudge, step;
      if (b < 0) {
        nudge = op === '+'
          ? 'Adding a negative number is the same as subtracting.'
          : 'Subtracting a negative number is the same as adding. Two minus signs next to each other make a plus.';
        step = `${expr} = ${F(a)} ${eff < 0 ? M : '+'} ${A(b)}. Start at ${F(a)} and move ${A(b)} to the ${dir}.`;
      } else {
        nudge = op === '+'
          ? 'Adding a positive number means moving right on the number line.'
          : 'Subtracting a positive number means moving left on the number line.';
        step = `Start at ${F(a)} and move ${b} to the ${dir}.`;
      }
      const why = `Start at ${F(a)} and move ${A(b)} to the ${dir}. You land on ${F(ans)}.`;
      return { ans, expr, nudge, step, why };
    };
    const NL = a => ({ type: 'numberLine', min: -12, max: 12, step: 1, labelEvery: 2, points: [{ at: a, label: 'start' }] });

    const basic1 = () => {
      const [a, op, b] = retry(() => {
        const a = R(-9, 9), b = R(1, 9), op = pick(['+', '−']);
        const ans = op === '+' ? a + b : a - b;
        return Math.abs(ans) <= 12 && (a < 0 || ans < 0) ? [a, op, b] : null;
      });
      const I = info(a, op, b);
      return num(`Work out ${I.expr}`, I.ans, [I.nudge, I.step], `${I.why} So ${I.expr} = ${F(I.ans)}.`, { visual: NL(a) });
    };

    const basic2 = () => {
      const a = nz(-15, 15), b = -R(2, 12), op = pick(['+', '−']);
      const I = info(a, op, b);
      return num(`Work out ${I.expr}`, I.ans, [I.nudge, I.step], `${I.expr} = ${F(I.ans)}. ${I.why}`);
    };

    const three = () => {
      const a = nz(-12, 12), b = -R(2, 12), c = nz(-12, 12);
      const o1 = pick(['+', '−']), o2 = pick(['+', '−']);
      const first = info(a, o1, b);
      const second = info(first.ans, o2, c);
      const e = `${F(a)} ${o1 === '+' ? '+' : M} ${P(b)} ${o2 === '+' ? '+' : M} ${P(c)}`;
      return num(`Work out ${e}`, second.ans,
        ['Work from left to right, one step at a time. Change any "− (negative)" into "+".',
          `First: ${first.expr} = ${F(first.ans)}. Now work out ${second.expr}.`],
        `${first.expr} = ${F(first.ans)}, then ${second.expr} = ${F(second.ans)}.`);
    };

    const missing = () => {
      if (Math.random() < 0.5) {
        const b = nz(-9, 9), c = R(-12, 12);
        return num(`Find the missing number.\n□ + ${P(b)} = ${F(c)}`, c - b,
          ['Use the inverse. To undo adding, subtract.',
            `□ = ${F(c)} ${M} ${P(b)}. Work this out carefully.`],
          `□ = ${F(c)} ${M} ${P(b)} = ${F(c - b)}. Check: ${F(c - b)} + ${P(b)} = ${F(c)}.`);
      }
      const a = R(-10, 10), c = R(-10, 10);
      if (a === c) return basic2();
      return num(`Find the missing number.\n${F(a)} ${M} □ = ${F(c)}`, a - c,
        [`Ask: what do I take away from ${F(a)} to get ${F(c)}?`,
          `□ = ${F(a)} ${M} ${P(c)}. Work this out carefully.`],
        `□ = ${F(a)} ${M} ${P(c)} = ${F(a - c)}. Check: ${F(a)} ${M} ${P(a - c)} = ${F(c)}.`);
    };

    const real = () => {
      const t = R(1, 4);
      if (t === 1) {
        const s = -R(2, 9), up = R(3, 14), e = s + up;
        return num(`At midnight the temperature was ${F(s)} °C. By midday it had risen by ${up} degrees.\nWhat was the temperature at midday?`, e,
          ['Rising means the temperature goes up, so add.',
            `Work out ${F(s)} + ${up}. Start at ${F(s)} and count up ${up}.`],
          `${F(s)} + ${up} = ${F(e)}, so it was ${F(e)} °C.`,
          { unit: '°C', visual: { type: 'thermometer', value: s, min: -15, max: 15 } });
      }
      if (t === 2) {
        const s = R(1, 8), down = R(s + 1, s + 9), e = s - down;
        return num(`The temperature was ${s} °C. During the night it fell by ${down} degrees.\nWhat was the new temperature?`, e,
          ['Falling means the temperature goes down, so subtract.',
            `Work out ${s} ${M} ${down}. Count down ${s} to reach 0 first.`],
          `${s} ${M} ${down} = ${F(e)}, so it was ${F(e)} °C.`,
          { unit: '°C', visual: { type: 'thermometer', value: s, min: -15, max: 15 } });
      }
      if (t === 3) {
        const lo = -R(2, 9), hi = R(2, 9);
        return num(`One morning it was ${F(lo)} °C in Moscow and ${hi} °C in Baku.\nWhat is the difference between the two temperatures?`, hi - lo,
          ['The difference is the gap between the numbers. Count up from the lower temperature to the higher one.',
            `From ${F(lo)} up to 0 is ${A(lo)} degrees. Then add the gap from 0 up to ${hi}.`],
          `${A(lo)} + ${hi} = ${hi - lo}. The difference is ${hi - lo} degrees. (${hi} ${M} (${F(lo)}) = ${hi - lo})`, { unit: '°C' });
      }
      const f = R(1, 5), d = R(f + 1, f + 4), e = f - d;
      return num(`A lift is on floor ${f}. It goes down ${d} floors.\nThe ground floor is 0 and floors below ground are negative. Which floor is the lift on now?`, e,
        ['Going down means subtract.', `Work out ${f} ${M} ${d}. Going down ${f} floors takes you to floor 0.`],
        `${f} ${M} ${d} = ${F(e)}, so the lift is on floor ${F(e)}.`);
    };

    const spot = () => {
      const who = U.name();
      if (Math.random() < 0.5) {
        const a = R(2, 9), b = R(2, 9);
        if (a === b) return basic2();
        return num(`${who} says ${M}${a} ${M} ${b} = ${F(-a + b)}.\nWhat is the correct answer?`, -a - b,
          ['You start below zero and then take away more, so you must go further down.',
            `Start at ${M}${a} and move ${b} to the left.`],
          `${M}${a} ${M} ${b} = ${F(-a - b)}. ${who} moved right instead of left.`);
      }
      const a = R(2, 9), b = R(2, 9);
      if (a === b) return basic2();
      return num(`${who} says ${a} ${M} (${M}${b}) = ${F(a - b)}.\nWhat is the correct answer?`, a + b,
        ['Subtracting a negative is the same as adding.', `${a} ${M} (${M}${b}) = ${a} + ${b}.`],
        `${a} ${M} (${M}${b}) = ${a} + ${b} = ${a + b}. ${who} subtracted instead of adding.`);
    };

    const which = () => {
      const a = R(-9, -2), b = R(2, 9);
      const right = a - b;
      return choice(`Which calculation has the answer ${F(right)}?`,
        `${F(a)} ${M} ${b}`,
        [`${F(a)} + ${b}`, `${F(a)} ${M} (${M}${b})`, `${b} ${M} ${A(a)}`],
        ['Work out each calculation. Use the number line in your head.',
          `${F(a)} + ${b} = ${F(a + b)}, so that one is not right. Check the others.`],
        `${F(a)} ${M} ${b} = ${F(right)}: start at ${F(a)} and move ${b} left.`);
    };

    PMLM.registerSkill({
      id: 'g7.addSubInt', grade: 7, unit: 'g7.u1', title: 'Add and subtract integers', icon: '➕',
      blurb: 'Add and subtract positive and negative numbers',
      lesson: [
        { title: 'Numbers below zero',
          text: 'Integers are whole numbers. They can be positive, negative or zero.\nNegative numbers are less than zero. They sit to the **left** of 0 on a number line.\n−8 is smaller than −2, because it is further left.',
          visual: { type: 'numberLine', min: -6, max: 6, step: 1, points: [{ at: -4, label: '−4' }, { at: 3, label: '3' }] } },
        { title: 'Adding and subtracting',
          text: '**Add** a positive number → move **right**.\n**Subtract** a positive number → move **left**.\n−5 − 3: start at −5 and move 3 left. You land on **−8**, not −2.',
          visual: { type: 'numberLine', min: -10, max: 2, step: 1, jumps: [{ from: -5, to: -8, label: '− 3' }] } },
        { title: 'When the number is negative',
          text: 'Adding a negative is the same as subtracting:\n4 + (−6) = 4 − 6 = −2\nSubtracting a negative is the same as adding:\n2 − (−4) = 2 + 4 = 6\n**Tip:** two minus signs next to each other make a plus.' },
        { title: 'Real life: temperature',
          text: 'Temperatures below freezing are negative.\nIf it is −3 °C and it gets 7 degrees warmer, work out −3 + 7 = 4 °C.\nThe difference between −3 °C and 4 °C is 3 + 4 = 7 degrees.',
          visual: { type: 'thermometer', value: -3, min: -10, max: 10 } },
        { title: 'Worked example',
          text: 'Work out −6 − (−9) + (−5).\n**1.** Change the double minus: −6 − (−9) = −6 + 9.\n**2.** Start at −6 and move 9 right: you land on 3.\n**3.** 3 + (−5) = 3 − 5 = −2.\nAnswer: **−2**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [basic1, basic1, basic1, real, spot],
          [basic2, basic2, missing, real, spot, basic1],
          [three, three, missing, real, spot, which, basic2],
        ], ctx);
      },
    });
  }

  /* 2 ── Multiplying and dividing integers */
  {
    const RULE = 'Different signs give a negative answer. Same signs give a positive answer.';
    // one negative and one positive
    const pairOneNeg = big => {
      const x = R(2, big), y = R(2, big);
      return Math.random() < 0.5 ? [-x, y] : [x, -y];
    };
    const signWord = (a, b) => ((a < 0) === (b < 0) ? 'the same, so the answer is positive' : 'different, so the answer is negative');

    const basic = L => {
      const big = L === 1 ? 6 : 10;
      const both = L === 3 && Math.random() < 0.4;
      if (Math.random() < 0.5) {
        const [x, y] = both ? [-R(2, big), -R(2, big)] : pairOneNeg(big);
        const ans = x * y;
        return num(`Work out ${F(x)} × ${P(y)}`, ans,
          [RULE, `Ignore the signs first: ${A(x)} × ${A(y)} = ${A(ans)}. Now decide: positive or negative?`],
          `The signs are ${signWord(x, y)}. So ${F(x)} × ${P(y)} = ${F(ans)}.`);
      }
      // dividend p ÷ divisor y = x; only one negative shown unless 'both'
      const q = R(2, big), d = R(2, big);
      let x, y;
      if (both) { y = -d; x = q; } else if (Math.random() < 0.5) { y = d; x = -q; } else { y = -d; x = -q; }
      const p = x * y;
      return num(`Work out ${F(p)} ÷ ${P(y)}`, x,
        [`Division uses the same sign rules as multiplication. ${RULE}`,
          `Ignore the signs first: ${A(p)} ÷ ${A(y)} = ${A(x)}. Now decide: positive or negative?`],
        `The signs are ${signWord(p, y)}. So ${F(p)} ÷ ${P(y)} = ${F(x)}.`);
    };

    const missing = () => {
      const x = -R(2, 9), y = R(2, 9) * sgn();
      const p = x * y;
      return num(`Find the missing number.\n□ × ${P(y)} = ${F(p)}`, x,
        [`Use the inverse: to undo × ${P(y)}, divide by ${P(y)}.`,
          `□ = ${F(p)} ÷ ${P(y)}. Without signs, ${A(p)} ÷ ${A(y)} = ${A(x)}. Now choose the sign.`],
        `□ = ${F(p)} ÷ ${P(y)} = ${F(x)}. Check: ${F(x)} × ${P(y)} = ${F(p)}.`);
    };

    const real = L => {
      const t = R(1, 3);
      if (t === 1 || L === 1) {
        const d = R(2, 6), h = R(2, 8);
        return num(`The temperature changes by ${M}${d} °C every hour.\nWhat is the total change after ${h} hours?`, -d * h,
          ['A fall is a negative change. Multiply the change each hour by the number of hours.',
            `Work out ${h} × (${M}${d}). Without signs, ${h} × ${d} = ${h * d}.`],
          `${h} × (${M}${d}) = ${F(-d * h)}, so the total change is ${F(-d * h)} °C.`, { unit: '°C' });
      }
      if (t === 2) {
        const per = R(2, 7), n = R(3, 8), tot = per * n;
        return num(`Over ${n} hours the temperature changes by ${M}${tot} °C. It changes by the same amount each hour.\nWhat is the change each hour?`, -per,
          ['Share the total change equally: divide by the number of hours.',
            `Work out ${M}${tot} ÷ ${n}. Without signs, ${tot} ÷ ${n} = ${per}.`],
          `${M}${tot} ÷ ${n} = ${M}${per}. The change is ${M}${per} °C each hour.`, { unit: '°C' });
      }
      const d = R(3, 9), m = R(2, 6);
      return num(`A submarine's depth changes by ${M}${d} m every minute.\nWhat is the total change in depth after ${m} minutes?`, -d * m,
        ['Going down is a negative change. Multiply.', `Work out ${m} × (${M}${d}). Without signs, ${m} × ${d} = ${m * d}.`],
        `${m} × (${M}${d}) = ${F(-d * m)} m.`, { unit: 'm' });
    };

    const spot = () => {
      const a = R(2, 9), b = R(2, 9), who = U.name();
      if (Math.random() < 0.5) {
        return num(`${who} says ${a} × (${M}${b}) = ${a * b}.\nWhat is the correct answer?`, -a * b,
          ['Look at the signs. Are they the same or different?', `Without signs, ${a} × ${b} = ${a * b}. One number is negative and one is positive.`],
          `Different signs give a negative answer, so ${a} × (${M}${b}) = ${F(-a * b)}.`);
      }
      return num(`${who} says ${M}${a * b} ÷ ${b} = ${a}.\nWhat is the correct answer?`, -a,
        ['Look at the signs. Are they the same or different?', `Without signs, ${a * b} ÷ ${b} = ${a}. One number is negative and one is positive.`],
        `Different signs give a negative answer, so ${M}${a * b} ÷ ${b} = ${M}${a}.`);
    };

    const which = L => {
      const x = R(2, 9), y = R(2, 9);
      const opts = [`${M}${x} × ${y}`, `${x} × (${M}${y})`, `${M}${x * y} ÷ ${y}`];
      const right = L === 3 ? `${M}${x} × (${M}${y})` : `${x * y} ÷ ${y}`;
      return choice('Which calculation gives a **positive** answer?', right, opts,
        [RULE, `${opts[0]}: the signs are different, so that answer is negative. Check the others.`],
        `${right} is the only one where the signs are the same, so its answer is positive.`);
    };

    const combo = () => {
      const t = R(1, 3);
      if (t === 1) {
        const a = -R(2, 6), b = R(2, 5), c = R(2, 5);
        const ab = a * b, ans = ab * c;
        return num(`Work out ${F(a)} × ${b} × ${c}`, ans,
          ['Multiply two numbers at a time, using the sign rules each time.', `First: ${F(a)} × ${b} = ${F(ab)}. Now multiply by ${c}.`],
          `${F(a)} × ${b} = ${F(ab)}, and ${F(ab)} × ${c} = ${F(ans)}.`);
      }
      if (t === 2) {
        const k = R(2, 6), b = R(2, 5), q = -R(2, 6), p = q * k;
        const ans = p / k + b;
        return num(`Work out ${F(p)} ÷ ${k} + ${b}`, ans,
          ['Divide before you add.', `${F(p)} ÷ ${k} = ${F(q)}. Now add ${b}.`],
          `${F(p)} ÷ ${k} = ${F(q)}, then ${F(q)} + ${b} = ${F(ans)}.`);
      }
      const a = R(2, 6), b = -R(2, 6), c = R(1, 9);
      const ans = a * b - c;
      return num(`Work out ${a} × ${P(b)} ${M} ${c}`, ans,
        ['Multiply before you subtract.', `${a} × ${P(b)} = ${F(a * b)}. Now subtract ${c}.`],
        `${a} × ${P(b)} = ${F(a * b)}, then ${F(a * b)} ${M} ${c} = ${F(ans)}.`);
    };

    PMLM.registerSkill({
      id: 'g7.mulDivInt', grade: 7, unit: 'g7.u1', title: 'Integers × and ÷', icon: '✖️',
      blurb: 'Multiply and divide when a number is negative',
      lesson: [
        { title: 'Repeated jumps',
          text: '3 × (−2) means 3 jumps of −2.\nStart at 0 and jump left three times. You land on **−6**.\nSo a positive times a negative is negative.',
          visual: { type: 'numberLine', min: -8, max: 2, step: 1, jumps: [{ from: 0, to: -2, label: '−2' }, { from: -2, to: -4, label: '−2' }, { from: -4, to: -6, label: '−2' }] } },
        { title: 'The sign rules',
          text: '**Different signs** → negative answer: 4 × (−5) = −20\n**Same signs** → positive answer: 4 × 5 = 20 and −4 × (−5) = 20',
          visual: { type: 'table', headers: ['×', '+ number', '− number'], rows: [['+ number', '+', '−'], ['− number', '−', '+']] } },
        { title: 'Dividing works the same way',
          text: '−18 ÷ 3 = −6 (different signs)\n20 ÷ (−4) = −5 (different signs)\n**Tip:** work out the numbers without signs first. Then decide the sign.' },
        { title: 'Worked example',
          text: 'Work out −28 ÷ 4.\n**1.** Ignore the signs: 28 ÷ 4 = 7.\n**2.** The signs are different (− and +).\n**3.** So the answer is negative.\nAnswer: **−7**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [basic, basic, basic, real, which],
          [basic, basic, missing, real, spot, which],
          [basic, combo, combo, missing, spot, which, real],
        ], ctx);
      },
    });
  }

  /* 3 ── Factors, multiples, primes, HCF and LCM */
  {
    const pairNums = (L, needLcm) => retry(() => {
      const g = L === 1 ? R(2, 6) : R(2, 12);
      const p = R(needLcm ? 2 : 1, L === 1 ? 4 : 6), q = R(2, L === 1 ? 5 : 7);
      if (p >= q || U.gcd(p, q) !== 1) return null;
      const a = g * p, b = g * q;
      if (a < 4 || b > (L === 1 ? 40 : 100)) return null;
      return { a, b, g, l: g * p * q };
    });
    const facList = n => U.factors(n).join(', ');

    const hcfQ = L => {
      const { a, b, g } = pairNums(L);
      return num(`Find the HCF (highest common factor) of ${a} and ${b}.`, g,
        ['List the factors of each number. The HCF is the biggest number that is in both lists.',
          `Factors of ${a}: ${facList(a)}. Now list the factors of ${b}.`],
        `Factors of ${b}: ${facList(b)}. The biggest number in both lists is ${g}, so the HCF is ${g}.`);
    };

    const lcmQ = L => {
      const { a, b, l } = pairNums(L, true);
      return num(`Find the LCM (lowest common multiple) of ${a} and ${b}.`, l,
        ['List the multiples of each number. The LCM is the first number that is in both lists.',
          `Start at ${b} and count up in ${b}s. Check each number: is it in the ${a} times table?`],
        `${l} = ${l / b} × ${b} and ${l} = ${l / a} × ${a}. It is the first number in both lists, so the LCM is ${l}.`);
    };

    const primeQ = () => {
      const prime = pick([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);
      const fakes = U.sample([1, 9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 57, 63, 69, 77, 81, 87, 91], 3);
      const f = fakes.find(x => x > 1) || 9;
      const sp = U.factors(f)[1];
      return choice('Which of these numbers is **prime**?', String(prime), fakes.map(String),
        ['A prime number has exactly two factors: 1 and itself. (1 is not prime.)',
          `Test each number. ${f} = ${sp} × ${f / sp}, so ${f} is not prime. Check the others the same way.`],
        `${prime} has only two factors, 1 and ${prime}, so it is prime. Each of the others has a different number of factors.`);
    };

    const multQ = L => {
      const k = L === 1 ? pick([4, 6, 8, 9]) : pick([6, 8, 9, 12, 15]);
      const ans = k * R(3, 12);
      const wr = [k * R(3, 9) + 1, U.factors(k)[1], k * R(2, 9) + k - 1, k * 10 + 1, k * R(3, 9) - 2]
        .filter(x => x % k !== 0);
      return choice(`Which of these is a **multiple** of ${k}?`, String(ans), wr.map(String),
        [`A multiple of ${k} is in the ${k} times table. Check: does ${k} divide into it exactly?`,
          `${U.factors(k)[1]} is a **factor** of ${k}, not a multiple. Try dividing each of the others by ${k}.`],
        `${ans} = ${ans / k} × ${k}, so ${ans} is a multiple of ${k}.`);
    };

    const factorQ = () => {
      const n = pick([18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 54, 56, 60]);
      const fs = U.factors(n).filter(x => x > 2 && x < n);
      const ans = pick(fs);
      const wr = [2 * n, ...U.sample(U.range(4, n - 1).filter(x => n % x !== 0), 4)];
      return choice(`Which of these is a **factor** of ${n}?`, String(ans), wr.map(String),
        [`A factor of ${n} divides into ${n} exactly, with nothing left over.`,
          `${2 * n} is a **multiple** of ${n}, not a factor. Try dividing ${n} by each of the others.`],
        `${n} ÷ ${ans} = ${n / ans} exactly, so ${ans} is a factor of ${n}.`);
    };

    const countFactors = () => {
      const n = pick([12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50]);
      const fs = U.factors(n), second = fs[1];
      return num(`How many factors does ${n} have?`, fs.length,
        [`Find the factors in pairs that multiply to make ${n}. Stop when the pairs start to repeat.`,
          `The first pairs are 1 × ${n} and ${second} × ${n / second}. Find the rest, then count every factor.`],
        `The factors of ${n} are ${facList(n)}. That is ${fs.length} factors.`);
    };

    const story = L => {
      const t = R(1, 4);
      if (t <= 2) {
        const { a, b, l } = pairNums(L >= 2 ? 2 : 1, true);
        if (t === 1) {
          return num(`Two lights flash together. One flashes every ${a} seconds and the other every ${b} seconds.\nAfter how many seconds will they next flash together?`, l,
            ['"Together again" means a number in both times tables. You want the lowest one: the LCM.',
              `Start at ${b} and count up in ${b}s. Check each number: is it in the ${a} times table?`],
            `The LCM of ${a} and ${b} is ${l}, so they flash together again after ${l} seconds.`, { unit: 'seconds' });
        }
        return num(`Bread rolls come in packs of ${a} and burgers come in packs of ${b}.\nWhat is the smallest number of each you can buy so that you have the same number of rolls and burgers?`, l,
          ['The number must be in the ' + a + ' times table and the ' + b + ' times table. Find the LCM.',
            `Start at ${b} and count up in ${b}s. Check each number: is it in the ${a} times table?`],
          `The LCM of ${a} and ${b} is ${l}, so the smallest number is ${l}.`);
      }
      const { a, b, g } = pairNums(L >= 2 ? 2 : 1);
      if (t === 3) {
        return num(`${a} pencils and ${b} rubbers are shared into identical packs, with none left over.\nWhat is the greatest number of packs?`, g,
          ['The number of packs must divide into both numbers exactly. You want the biggest: the HCF.',
            `Factors of ${a}: ${facList(a)}. Which of these also divide into ${b}?`],
          `The HCF of ${a} and ${b} is ${g}, so the greatest number of packs is ${g}.`, { unit: 'packs' });
      }
      return num(`Two ribbons are ${a} cm and ${b} cm long. They are cut into pieces that are all the same length, as long as possible, with nothing left over.\nHow long is each piece?`, g,
        ['The piece length must divide into both lengths exactly. You want the biggest: the HCF.',
          `Factors of ${a}: ${facList(a)}. Which of these also divide into ${b}?`],
        `The HCF of ${a} and ${b} is ${g}, so each piece is ${g} cm long.`, { unit: 'cm' });
    };

    const spot = L => {
      const { a, b, g, l } = pairNums(L, true);
      const who = U.name();
      return num(`${who} says the HCF of ${a} and ${b} is ${l}.\nWhat is the correct HCF?`, g,
        ['The HCF is a **factor** of both numbers, so it cannot be bigger than the smaller number.',
          `Factors of ${a}: ${facList(a)}. Which is the biggest one that also divides into ${b}?`],
        `${who} found the LCM by mistake. The HCF of ${a} and ${b} is ${g}.`);
    };

    const lcm3 = () => {
      const [x, y, z] = retry(() => {
        const s = U.sample([2, 3, 4, 5, 6, 8, 9, 10, 12], 3).sort((p, q) => p - q);
        const l = U.lcm(U.lcm(s[0], s[1]), s[2]);
        return l <= 120 && l !== s[2] ? s : null;
      });
      const l = U.lcm(U.lcm(x, y), z);
      return num(`Find the LCM of ${x}, ${y} and ${z}.`, l,
        ['Count up in multiples of the biggest number. Stop at the first one that the other two numbers divide into.',
          `Count up in ${z}s, starting at ${z}. For each one, check whether ${x} and ${y} both divide into it.`],
        `${l} is the first multiple of ${z} that ${x} and ${y} both divide into, so the LCM is ${l}.`);
    };

    PMLM.registerSkill({
      id: 'g7.factors', grade: 7, unit: 'g7.u1', title: 'Factors, primes, HCF, LCM', icon: '🧩',
      blurb: 'Factors, multiples, primes, HCF and LCM',
      lesson: [
        { title: 'Factors and multiples',
          text: 'A **factor** divides into a number exactly. Factors of 12: 1, 2, 3, 4, 6, 12.\nA **multiple** is in the times table. Multiples of 12: 12, 24, 36, …\n**Tip:** factors are small (never bigger than the number). Multiples are big.',
          visual: { type: 'array', rows: 3, cols: 4 } },
        { title: 'Prime numbers',
          text: 'A **prime** number has exactly two factors: 1 and itself.\n2, 3, 5, 7, 11, 13, 17, 19, 23, 29 are prime.\n1 is **not** prime (it has only one factor). 2 is the only even prime.' },
        { title: 'HCF: highest common factor',
          text: 'List the factors of both numbers. The HCF is the biggest one in both lists.\nFactors of 12: 1, 2, 3, **4**, 6, 12\nFactors of 20: 1, 2, **4**, 5, 10, 20\nHCF of 12 and 20 = **4**' },
        { title: 'LCM: lowest common multiple',
          text: 'List the multiples. The LCM is the first one in both lists.\nMultiples of 6: 6, 12, 18, **24**, 30\nMultiples of 8: 8, 16, **24**, 32\nLCM of 6 and 8 = **24**\nHCF → sharing into groups. LCM → things happening together again.' },
        { title: 'Worked example',
          text: 'Buses leave every 10 minutes and every 15 minutes. Both leave at 9:00. When do they next leave together?\n**1.** "Together again" → LCM.\n**2.** Multiples of 15: 15, **30**, 45. Multiples of 10: 10, 20, **30**.\n**3.** LCM = 30, so after 30 minutes, at **9:30**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [factorQ, multQ, primeQ, hcfQ, lcmQ, countFactors],
          [hcfQ, lcmQ, primeQ, story, spot, countFactors],
          [hcfQ, lcmQ, story, story, spot, lcm3, primeQ],
        ], ctx);
      },
    });
  }

  /* 4 ── Squares, cubes and roots */
  {
    const sq = L => {
      const n = L === 1 ? R(3, 12) : L === 2 ? R(5, 15) : R(11, 20);
      return num(`Work out ${n}^{2}`, n * n,
        [`${n}^{2} means ${n} × ${n}. It is **not** ${n} × 2.`, `Write it out: ${n} × ${n}. ${n > 12 ? `Split it: ${n} × 10 = ${n * 10}, then add ${n} × ${n - 10}.` : 'Use your times tables.'}`],
        `${n} × ${n} = ${n * n}, so ${n}^{2} = ${n * n}.`);
    };
    const cube = L => {
      const n = pick(L === 1 ? [2, 3, 4, 5, 10] : L === 2 ? [2, 3, 4, 5, 6, 10] : [3, 4, 5, 6, 7, 8, 9]);
      return num(`Work out ${n}^{3}`, n * n * n,
        [`${n}^{3} means ${n} × ${n} × ${n}. It is **not** ${n === 3 ? '3 + 3 + 3' : `${n} × 3`}.`, `First ${n} × ${n} = ${n * n}. Now multiply by ${n} again.`],
        `${n} × ${n} × ${n} = ${n * n * n}, so ${n}^{3} = ${n * n * n}.`);
    };
    const sqrtQ = L => {
      const r = L === 1 ? R(2, 12) : L === 2 ? R(4, 15) : R(11, 20), n = r * r;
      const t = r + pick([-2, -1, 1, 2]);
      return num(`Work out √${n}`, r,
        [`√${n} asks: which number multiplied by itself makes ${n}?`,
          `Try ${t}: ${t} × ${t} = ${t * t}. That is too ${t * t < n ? 'small' : 'big'}.`],
        `${r} × ${r} = ${n}, so √${n} = ${r}.`);
    };
    const cbrtQ = L => {
      const r = pick(L <= 2 ? [2, 3, 4, 5, 10] : [4, 5, 6, 7, 8, 9]), n = r * r * r;
      const t = r === 2 ? 3 : r - 1;
      return num(`Work out ∛${n}`, r,
        [`∛${n} (the cube root) asks: which number multiplied by itself **three** times makes ${n}?`,
          `Try ${t}: ${t} × ${t} × ${t} = ${t * t * t}. That is too ${t < r ? 'small' : 'big'}.`],
        `${r} × ${r} × ${r} = ${n}, so ∛${n} = ${r}.`);
    };
    const combo = L => {
      const t = R(1, 3);
      if (t === 1) {
        const a = R(2, L === 3 ? 12 : 9), b = R(2, 5);
        return num(`Work out ${a}^{2} + ${b}^{3}`, a * a + b * b * b,
          ['Work out each power on its own, then add.', `${a}^{2} = ${a} × ${a} = ${a * a}. Now work out ${b}^{3}.`],
          `${a * a} + ${b * b * b} = ${a * a + b * b * b}.`);
      }
      if (t === 2) {
        const r = R(2, 12), b = R(2, 9);
        return num(`Work out √${r * r} + ${b}^{2}`, r + b * b,
          ['Work out the square root and the square separately, then add.', `√${r * r} = ${r}. Now work out ${b}^{2}.`],
          `${r} + ${b * b} = ${r + b * b}.`);
      }
      const a = R(5, 12), r = R(2, a - 1);
      return num(`Work out ${a}^{2} ${M} √${r * r}`, a * a - r,
        ['Work out the square and the square root separately, then subtract.', `${a}^{2} = ${a * a}. Now find √${r * r}.`],
        `${a * a} ${M} ${r} = ${a * a - r}.`);
    };
    const missing = L => {
      if (L === 3 && Math.random() < 0.5) {
        const r = pick([2, 3, 4, 5, 6, 10]);
        return num(`□ is a positive whole number.\n□^{3} = ${r * r * r}. What is □?`, r,
          ['You need a number that, multiplied by itself three times, makes ' + r * r * r + '.', `This is the same as finding ∛${r * r * r}. Try small numbers: 2^{3} = 8, 3^{3} = 27, …`],
          `${r} × ${r} × ${r} = ${r * r * r}, so □ = ${r}.`);
      }
      const r = R(3, L === 1 ? 10 : 15);
      return num(`□ is a positive whole number.\n□^{2} = ${r * r}. What is □?`, r,
        [`You need a number that, multiplied by itself, makes ${r * r}.`, `This is the same as finding √${r * r}. Think of the square numbers.`],
        `${r} × ${r} = ${r * r}, so □ = ${r}.`);
    };
    const spot = () => {
      const n = R(3, 12), who = U.name();
      if (Math.random() < 0.6) {
        return num(`${who} says ${n}^{2} = ${2 * n}.\nWhat is the correct value of ${n}^{2}?`, n * n,
          [`${who} worked out ${n} × 2. What does the little 2 really mean?`, `${n}^{2} means ${n} × ${n}.`],
          `${n}^{2} = ${n} × ${n} = ${n * n}, not ${n} × 2.`);
      }
      const m = pick([2, 4, 5]);
      return num(`${who} says ${m}^{3} = ${3 * m}.\nWhat is the correct value of ${m}^{3}?`, m * m * m,
        [`${who} worked out ${m} × 3. What does the little 3 really mean?`, `${m}^{3} means ${m} × ${m} × ${m}. Start with ${m} × ${m} = ${m * m}.`],
        `${m}^{3} = ${m} × ${m} × ${m} = ${m * m * m}.`);
    };
    const whichSquare = () => {
      const s = R(4, 12), ans = s * s;
      const wr = [ans + 1, ans - 2, pick([8, 27, 125]), 2 * s, ans + s].filter(x => Math.sqrt(x) % 1 !== 0);
      return choice('Which of these is a **square number**?', String(ans), wr.map(String),
        ['A square number is a whole number multiplied by itself, like 9 = 3 × 3.',
          'List the square numbers: 1 × 1 = 1, 2 × 2 = 4, 3 × 3 = 9, 4 × 4 = 16, … Keep going and look for one of them in the choices.'],
        `${ans} = ${s} × ${s}, so it is a square number.`);
    };
    const real = L => {
      if (L === 3 && Math.random() < 0.5) {
        const r = pick([2, 3, 4, 5, 6, 10]);
        return num(`A cube has a volume of ${r * r * r} cm³.\nHow long is each edge?`, r,
          ['The volume of a cube is edge × edge × edge.', `You need the cube root: which number × itself × itself = ${r * r * r}?`],
          `${r} × ${r} × ${r} = ${r * r * r}, so each edge is ${r} cm.`, { unit: 'cm', visual: { type: 'shape3d', shape: 'cube', dims: { l: '?' } } });
      }
      const r = R(4, L === 1 ? 10 : 15);
      return num(`A square garden has an area of ${r * r} m².\nHow long is one side?`, r,
        ['The area of a square is side × side.', `You need the square root: which number × itself = ${r * r}?`],
        `${r} × ${r} = ${r * r}, so each side is ${r} m.`, { unit: 'm', visual: { type: 'shape2d', shape: 'square', dims: { base: '? m' } } });
    };

    PMLM.registerSkill({
      id: 'g7.powers', grade: 7, unit: 'g7.u1', title: 'Squares, cubes and roots', icon: '🟦',
      blurb: 'Square and cube numbers and their roots',
      lesson: [
        { title: 'Square numbers',
          text: 'A square number is a number multiplied by itself.\n4^{2} = 4 × 4 = 16 ("4 squared")\nThe dots make a 4 by 4 square.\nSquare numbers: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, …',
          visual: { type: 'array', rows: 4, cols: 4 } },
        { title: 'Cube numbers',
          text: 'A cube number is a number multiplied by itself three times.\n2^{3} = 2 × 2 × 2 = 8 ("2 cubed")\nCube numbers: 1, 8, 27, 64, 125, …, 1000\n**Careful:** 2^{3} is not 2 × 3.',
          visual: { type: 'shape3d', shape: 'cube', dims: { l: '2', w: '2', h: '2' } } },
        { title: 'Roots go backwards',
          text: 'The **square root** √ undoes squaring: 5^{2} = 25, so √25 = 5.\nThe **cube root** ∛ undoes cubing: 4^{3} = 64, so ∛64 = 4.\n**Tip:** learn the squares up to 15 × 15 = 225.' },
        { title: 'Worked example',
          text: 'Work out √49 + 2^{3}.\n**1.** √49 = 7, because 7 × 7 = 49.\n**2.** 2^{3} = 2 × 2 × 2 = 8.\n**3.** Add: 7 + 8 = 15.\nAnswer: **15**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [sq, sq, cube, sqrtQ, whichSquare, spot, real],
          [sq, cube, sqrtQ, cbrtQ, combo, missing, spot, real],
          [sq, cube, cbrtQ, combo, combo, missing, real, sqrtQ],
        ], ctx);
      },
    });
  }

  /* 5 ── Place value, rounding, × and ÷ by 10, 100, 1000 */
  {
    const PLACE = ['ones', 'tenths', 'hundredths', 'thousandths'];
    const dpWords = n => (n === 0 ? 'the nearest whole number' : `${n} decimal place${n > 1 ? 's' : ''}`);
    const pow10 = e => U.clean(Math.pow(10, e));

    const roundQ = L => {
      const k = L === 1 ? 2 : L === 2 ? 3 : pick([3, 4]);
      const n = L === 1 ? pick([0, 1, 1]) : L === 2 ? pick([0, 1, 1, 2, 2]) : pick([1, 2, 2, 3].filter(v => v < k));
      const wantCarry = L === 3 && Math.random() < 0.35;
      const { xi, lo, d } = retry(() => {
        const xi = R(pow10(k) + 1, 60 * pow10(k));
        if (xi % 10 === 0) return null;
        const lo = Math.floor(xi / pow10(k - n));
        const d = Math.floor(xi / pow10(k - n - 1)) % 10;
        if (wantCarry && !(lo % 10 === 9 && d >= 5)) return null;
        return { xi, lo, d };
      });
      const x = U.clean(xi / pow10(k));
      const ans = U.clean((lo + (d >= 5 ? 1 : 0)) / pow10(n));
      const loV = U.clean(lo / pow10(n)), hiV = U.clean((lo + 1) / pow10(n));
      const intDigits = String(Math.floor(x)).length;
      return num(`Round ${F(x)} to ${dpWords(n)}.`, ans,
        [`Look at the digit just after the ${PLACE[n]} digit. 5 or more → round up. 4 or less → the ${PLACE[n]} digit stays the same.`,
          `${F(x)} is between ${F(loV, n)} and ${F(hiV, n)}. The digit after the ${PLACE[n]} digit is ${d}.`],
        `The next digit is ${d}, ${d >= 5 ? 'which is 5 or more, so round up' : 'which is 4 or less, so the digit stays the same'}. ${F(x)} rounded to ${dpWords(n)} is ${F(ans, n)}.`,
        L === 1 ? { visual: { type: 'placeValue', value: F(x), highlight: intDigits + n - 1 } } : undefined);
    };

    // value of the leading digit, e.g. 3.45 → 3, 0.47 → 0.4, 245 → 200
    const leadValue = x => {
      let e = 0;
      while (U.clean(x / pow10(e + 1)) >= 1) e++;
      while (U.clean(x / pow10(e)) < 1) e--;
      return U.clean(Math.floor(U.clean(x / pow10(e))) * pow10(e));
    };
    const makeX = L => {
      const k = L === 1 ? pick([0, 1]) : pick([1, 2]);
      const xi = retry(() => { const v = R(11, L === 1 ? 99 : 999); return v % 10 ? v : null; });
      return U.clean(xi / pow10(k));
    };

    const p10Q = L => {
      const x = makeX(L);
      const p = pick(L === 1 ? [10, 100] : [10, 100, 1000]);
      const op = pick(['×', '÷']);
      const res = U.clean(op === '×' ? x * p : x / p);
      const lv = leadValue(x), lv2 = U.clean(op === '×' ? lv * p : lv / p);
      const places = String(p).length - 1;
      return num(`Work out ${F(x)} ${op} ${F(p)}`, res,
        [`${op} ${F(p)} moves every digit ${places} place${places > 1 ? 's' : ''} to the ${op === '×' ? 'left' : 'right'}. The digits stay the same.`,
          `The first digit of ${F(x)} is worth ${F(lv)}. After ${op} ${F(p)} it is worth ${F(lv2)}. Move the other digits the same way.`],
        `${op === '×' ? 'Multiplying' : 'Dividing'} by ${F(p)} moves every digit ${places} place${places > 1 ? 's' : ''} to the ${op === '×' ? 'left' : 'right'}. ${F(x)} ${op} ${F(p)} = ${F(res)}.`,
        L === 1 ? { visual: { type: 'placeValue', value: F(x) } } : undefined);
    };

    const missingP = L => {
      const x = makeX(L);
      const p = pick([10, 100, 1000]);
      const op = pick(['×', '÷']);
      const res = U.clean(op === '×' ? x * p : x / p);
      const lv = leadValue(x), lv2 = U.clean(op === '×' ? lv * p : lv / p);
      return num(`Find the missing number.\n${F(x)} ${op} □ = ${F(res)}`, p,
        ['The digits are the same, so □ is 10, 100 or 1000. Count how many places the digits have moved.',
          `The first digit of ${F(x)} is worth ${F(lv)}. In ${F(res)} it is worth ${F(lv2)}.`],
        `The digits moved ${String(p).length - 1} place${p > 10 ? 's' : ''}, so ${F(x)} ${op} ${F(p)} = ${F(res)}. □ = ${F(p)}.`);
    };

    const spotP = () => {
      const x = U.clean(R(11, 99) / 10);
      if (x % 1 === 0) return p10Q(2);
      const who = U.name();
      return num(`${who} says ${F(x)} × 10 = ${F(x)}0.\nWhat is the correct answer?`, U.clean(x * 10),
        ['Adding a zero on the end of a decimal does not change its value. Multiplying by 10 moves every digit one place left.',
          `The ${Math.floor(x)} in the ones place is worth ${Math.floor(x)}. After × 10 it is worth ${Math.floor(x) * 10}.`],
        `${F(x)}0 is the same as ${F(x)}. Each digit moves one place left, so ${F(x)} × 10 = ${F(x * 10)}.`);
    };

    const realP = (L, ctx) => {
      const t = R(1, 3);
      if (t === 1) {
        const pp = U.clean(R(105, 399) / 100), tot = U.clean(pp * 10);
        return num(`A box of 10 pens costs ${money(ctx.currency, tot)}.\nHow much does one pen cost?`, pp,
          ['One pen costs a tenth of the box: divide by 10.', '÷ 10 moves every digit one place to the right. The tens digit becomes the ones digit.'],
          `${money(ctx.currency, tot)} ÷ 10 = ${money(ctx.currency, pp)}.`, { prefix: ctx.currency });
      }
      if (t === 2) {
        const th = U.clean(R(5, 15) / 100), pile = U.clean(th * 1000);
        return num(`One sheet of card is ${F(th)} mm thick.\nHow thick is a pile of 1000 sheets?`, pile,
          ['Multiply the thickness of one sheet by 1000.', '× 1000 moves every digit 3 places to the left.'],
          `${F(th)} × 1000 = ${F(pile)}, so the pile is ${F(pile)} mm thick.`, { unit: 'mm' });
      }
      const w = U.clean(R(21, 99) / 10);
      if (w % 1 === 0) return realP(L, ctx);
      const tot = U.clean(w * 100);
      return num(`100 identical marbles weigh ${F(tot)} g.\nHow much does one marble weigh?`, w,
        ['Divide the total weight by 100.', '÷ 100 moves every digit 2 places to the right.'],
        `${F(tot)} ÷ 100 = ${F(w)}, so one marble weighs ${F(w)} g.`, { unit: 'g' });
    };

    const placeChoice = () => {
      const target = R(1, 3);
      const others = U.sample([1, 2, 3, 4, 5, 6, 8, 9], 3);
      const build = pos => {
        const ds = others.slice();
        ds.splice(pos, 0, 7);
        return `${ds[0]}.${ds[1]}${ds[2]}${ds[3]}`;
      };
      const ans = build(target);
      const wr = [0, 1, 2, 3].filter(p => p !== target).map(build);
      return choice(`In which number is the 7 worth **7 ${PLACE[target]}**?`, ans, wr,
        ['After the decimal point the places are tenths, hundredths, then thousandths.',
          `In ${build(0)} the 7 is in the ones place. Check where the 7 sits in each of the other numbers.`],
        `In ${ans} the 7 is the ${U.ord(target)} digit after the decimal point, so it is worth 7 ${PLACE[target]}.`);
    };

    PMLM.registerSkill({
      id: 'g7.decimals', grade: 7, unit: 'g7.u1', title: 'Rounding and powers of 10', icon: '🔟',
      blurb: 'Place value, rounding decimals, × and ÷ by 10, 100, 1000',
      lesson: [
        { title: 'Place value',
          text: 'Each place is worth 10 times the place to its right.\nIn 4.736 the 4 is 4 ones, the 7 is 7 **tenths**, the 3 is 3 **hundredths** and the 6 is 6 **thousandths**.',
          visual: { type: 'placeValue', value: '4.736', highlight: 1 } },
        { title: '× and ÷ by 10, 100, 1000',
          text: '× 10 moves every digit 1 place **left**. × 100 → 2 places. × 1000 → 3 places.\n÷ moves the digits **right** in the same way.\n3.45 × 100 = 345\n27 ÷ 1000 = 0.027\n**Careful:** 4.6 × 10 is 46, not 4.60.' },
        { title: 'Rounding to decimal places',
          text: 'To round to 1 decimal place, keep 1 digit after the point.\nLook at the **next** digit:\n5 or more → round up. 4 or less → keep the digit.\n6.38 → 6.4 (the 8 rounds the 3 up)\n6.32 → 6.3',
          visual: { type: 'numberLine', min: 6.3, max: 6.4, step: 0.01, labelEvery: 5, points: [{ at: 6.38, label: '6.38' }] } },
        { title: 'Worked example',
          text: 'Round 12.4962 to 2 decimal places.\n**1.** Keep 2 digits after the point: 12.49|62.\n**2.** The next digit is 6, which is 5 or more, so round up.\n**3.** 12.49 goes up to 12.50.\nAnswer: **12.50** (keep the 0 to show 2 decimal places)' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [roundQ, roundQ, p10Q, p10Q, spotP, placeChoice],
          [roundQ, roundQ, p10Q, p10Q, realP, spotP, placeChoice],
          [roundQ, roundQ, p10Q, missingP, missingP, realP],
        ], ctx);
      },
    });
  }

  /* 6 ── Order of operations */
  {
    const NUDGE = 'Use BIDMAS: Brackets, then Indices (powers), then × and ÷, then + and −.';

    const addMul = L => {
      const big = L === 1 ? 9 : 12;
      const a = R(2, big * 2), b = R(2, big > 9 ? 9 : 6), c = R(2, big > 9 ? 9 : 6);
      const t = R(1, 3);
      if (t === 1) return num(`Work out ${a} + ${b} × ${c}`, a + b * c, [NUDGE + ' Multiply before you add.', `First: ${b} × ${c} = ${b * c}.`], `${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}. (Not ${(a + b) * c}!)`);
      if (t === 2) return num(`Work out ${b} × ${c} + ${a}`, a + b * c, [NUDGE, `First: ${b} × ${c} = ${b * c}.`], `${b} × ${c} = ${b * c}, then ${b * c} + ${a} = ${a + b * c}.`);
      const a2 = b * c + R(1, 20);
      return num(`Work out ${a2} ${M} ${b} × ${c}`, a2 - b * c, [NUDGE + ' Multiply before you subtract.', `First: ${b} × ${c} = ${b * c}.`], `${b} × ${c} = ${b * c}, then ${a2} ${M} ${b * c} = ${a2 - b * c}.`);
    };

    const divQ = () => {
      const c = R(2, 9), q = R(2, 9), b = c * q, a = R(q + 1, 30);
      if (Math.random() < 0.5) return num(`Work out ${a} + ${b} ÷ ${c}`, a + q, [NUDGE + ' Divide before you add.', `First: ${b} ÷ ${c} = ${q}.`], `${b} ÷ ${c} = ${q}, then ${a} + ${q} = ${a + q}.`);
      return num(`Work out ${a} ${M} ${b} ÷ ${c}`, a - q, [NUDGE + ' Divide before you subtract.', `First: ${b} ÷ ${c} = ${q}.`], `${b} ÷ ${c} = ${q}, then ${a} ${M} ${q} = ${a - q}.`);
    };

    const brackets = () => {
      const t = R(1, 3);
      if (t === 1) {
        const a = R(2, 12), b = R(2, 9), c = R(2, 9);
        return num(`Work out (${a} + ${b}) × ${c}`, (a + b) * c, ['Brackets first.', `${a} + ${b} = ${a + b}. Now multiply by ${c}.`], `(${a} + ${b}) = ${a + b}, then ${a + b} × ${c} = ${(a + b) * c}.`);
      }
      if (t === 2) {
        const a = R(2, 9), c = R(1, 9), b = c + R(2, 9);
        return num(`Work out ${a} × (${b} ${M} ${c})`, a * (b - c), ['Brackets first.', `${b} ${M} ${c} = ${b - c}. Now multiply by ${a}.`], `(${b} ${M} ${c}) = ${b - c}, then ${a} × ${b - c} = ${a * (b - c)}.`);
      }
      const c = R(2, 6), q = R(2, 9), s = c * q, b = R(1, s - 1), a = s - b;
      return num(`Work out (${a} + ${b}) ÷ ${c}`, q, ['Brackets first.', `${a} + ${b} = ${s}. Now divide by ${c}.`], `(${a} + ${b}) = ${s}, then ${s} ÷ ${c} = ${q}.`);
    };

    const indices = L => {
      const t = R(1, L === 3 ? 4 : 2);
      if (t === 1) {
        const a = R(2, 9), b = R(2, 6), c = R(2, 6);
        return num(`Work out ${a}^{2} + ${b} × ${c}`, a * a + b * c, [NUDGE, `Indices first: ${a}^{2} = ${a * a}. Next work out ${b} × ${c}.`], `${a * a} + ${b * c} = ${a * a + b * c}.`);
      }
      if (t === 2) {
        const a = R(2, 5), b = R(2, 5);
        return num(`Work out ${a} × ${b}^{2}`, a * b * b, [NUDGE + ' The power belongs only to the number it is attached to.', `Indices first: ${b}^{2} = ${b * b}. Now multiply by ${a}.`], `${b}^{2} = ${b * b}, then ${a} × ${b * b} = ${a * b * b}. (Not (${a} × ${b})^{2} = ${a * a * b * b}.)`);
      }
      if (t === 3) {
        const a = R(2, 6), b = R(1, 5), c = R(2, 4);
        return num(`Work out ${a} × (${b} + ${c})^{2}`, a * (b + c) * (b + c), [NUDGE, `Brackets first: ${b} + ${c} = ${b + c}. Next square it.`], `(${b + c})^{2} = ${(b + c) * (b + c)}, then ${a} × ${(b + c) * (b + c)} = ${a * (b + c) * (b + c)}.`);
      }
      const a = R(2, 9), b = R(5, 12), c = R(2, 4);
      return num(`Work out ${a} ${M} ${b} × ${c}`, a - b * c, [NUDGE + ' The answer can be negative.', `First: ${b} × ${c} = ${b * c}. Now work out ${a} ${M} ${b * c}.`], `${b} × ${c} = ${b * c}, then ${a} ${M} ${b * c} = ${F(a - b * c)}.`);
    };

    const spot = () => {
      const a = R(2, 9), b = R(2, 9), c = R(2, 9), who = U.name();
      return num(`${who} says ${a} + ${b} × ${c} = ${(a + b) * c}.\nWhat is the correct answer?`, a + b * c,
        [`${who} worked from left to right. What should come first, + or ×?`, `Multiply first: ${b} × ${c} = ${b * c}.`],
        `× comes before +: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.`);
    };

    const placeBrackets = () => {
      const d = retry(() => {
        const a = R(2, 9), b = R(2, 9), c = R(3, 9), e = R(1, c - 1);
        const opts = [
          [`(${a} + ${b}) × ${c} ${M} ${e}`, (a + b) * c - e],
          [`${a} + ${b} × (${c} ${M} ${e})`, a + b * (c - e)],
          [`(${a} + ${b}) × (${c} ${M} ${e})`, (a + b) * (c - e)],
          [`${a} + (${b} × ${c}) ${M} ${e}`, a + b * c - e],
        ];
        const k = R(0, 2), v = opts[k][1];   // option 3 changes nothing, so it is only ever a wrong choice
        if (opts.filter(o => o[1] === v).length !== 1) return null;
        return { opts, k, v, plain: `${a} + ${b} × ${c} ${M} ${e}` };
      });
      const right = d.opts[d.k][0];
      return choice(`Where should the brackets go to make this correct?\n${d.plain} = ${d.v}`, right, d.opts.filter((o, i) => i !== d.k).map(o => o[0]),
        ['Work out each option, doing the brackets first each time.',
          `Try ${d.opts[(d.k + 1) % 4][0]}: it equals ${d.opts[(d.k + 1) % 4][1]}, so that is not it. Try the others.`],
        `${right} = ${d.v}.`);
    };

    const realQ = (L, ctx) => {
      const n = R(2, 6), p = R(2, 9), e = R(1, 9), who = U.name();
      const cur = ctx.currency;
      return choice(`${who} buys ${n} books at ${cur}${p} each and a pen for ${cur}${e}.\nWhich calculation gives the total cost?`, `${n} × ${p} + ${e}`,
        [`${n} × (${p} + ${e})`, `${n} + ${p} × ${e}`, `(${n} + ${p}) × ${e}`],
        ['The books cost the number of books × the price. Then add the pen.',
          `The books cost ${n} × ${p}. Which calculation does that first, then adds ${e}?`],
        `${n} × ${p} + ${e} = ${n * p} + ${e} = ${cur}${n * p + e}. With BIDMAS the × is done first, so no brackets are needed.`);
    };

    PMLM.registerSkill({
      id: 'g7.bidmas', grade: 7, unit: 'g7.u1', title: 'Order of operations', icon: '🧮',
      blurb: 'Use BIDMAS with brackets and powers',
      lesson: [
        { title: 'Why order matters',
          text: 'What is 2 + 3 × 4?\nLeft to right gives 5 × 4 = 20. That is **wrong**.\nMultiply first: 3 × 4 = 12, then 2 + 12 = **14**.\nEveryone uses the same order, so everyone gets the same answer.' },
        { title: 'BIDMAS',
          text: 'Do the operations in this order:',
          visual: { type: 'table', headers: ['Order', 'Letter', 'Means'], rows: [['1st', 'B', 'Brackets ( )'], ['2nd', 'I', 'Indices: powers like 3^{2}'], ['3rd', 'D M', '÷ and × (left to right)'], ['4th', 'A S', '+ and − (left to right)']] } },
        { title: 'Brackets and powers',
          text: '(2 + 3) × 4 = 5 × 4 = 20: the brackets go first.\n2 × 3^{2} = 2 × 9 = 18: the power only belongs to the 3.\n**Tip:** underline the part you will do first.' },
        { title: 'Worked example',
          text: 'Work out 20 − (1 + 2)^{2} × 2.\n**1.** Brackets: 1 + 2 = 3.\n**2.** Indices: 3^{2} = 9.\n**3.** Multiply: 9 × 2 = 18.\n**4.** Subtract: 20 − 18 = 2.\nAnswer: **2**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [addMul, addMul, divQ, brackets, spot, realQ],
          [addMul, divQ, brackets, indices, spot, placeBrackets, realQ],
          [indices, indices, brackets, placeBrackets, spot, divQ],
        ], ctx);
      },
    });
  }

  // ═══════════════════ Unit 2: Fractions, decimals, percentages, ratio ═══════════════════
  PMLM.registerUnit({ id: 'g7.u2', grade: 7, name: 'Fractions and ratio', icon: '🍕' });

  /* 7 ── Adding and subtracting fractions and mixed numbers */
  {
    const bars = (a1, d1, a2, d2) => (d1 <= 24 && d2 <= 24 && a1 <= d1 && a2 <= d2
      ? { type: 'fractionBar', bars: [{ parts: d1, shaded: a1, label: fr(a1, d1) }, { parts: d2, shaded: a2, label: fr(a2, d2) }] }
      : undefined);
    const opS = op => (op === '+' ? '+' : M);
    // a1/d1 ± a2/d2 worked through a common denominator
    const work = (a1, d1, op, a2, d2) => {
      const L = U.lcm(d1, d2), n1 = a1 * L / d1, n2 = a2 * L / d2;
      const n = op === '+' ? n1 + n2 : n1 - n2;
      const [sn, sd] = U.simplify(n, L);
      const cv = [];
      if (d1 !== L) cv.push(`${fr(a1, d1)} = ${fr(n1, L)}`);
      if (d2 !== L) cv.push(`${fr(a2, d2)} = ${fr(n2, L)}`);
      const conv = cv.join(' and ');
      const tail = (sn !== n || sd !== L) || Math.abs(sn) > sd ? ` = ${U.mixed(sn, sd)}` : '';
      return { L, n1, n2, n, sn, sd, conv, line: `${fr(n1, L)} ${opS(op)} ${fr(n2, L)} = ${fr(n, L)}${tail}` };
    };
    const NUDGE = 'You can only add or subtract fractions when the denominators are the same. Find a common denominator.';

    const pairFr = (L, op, dens) => retry(() => {
      const d1 = pick(dens), d2 = pick(dens);
      if (d1 === d2) return null;
      if (L === 1 && d1 % d2 !== 0 && d2 % d1 !== 0) return null;
      if (U.lcm(d1, d2) > 24) return null;
      const a1 = R(1, d1 - 1), a2 = R(1, d2 - 1);
      if (U.gcd(a1, d1) !== 1 || U.gcd(a2, d2) !== 1) return null;
      if (op === M && a1 * d2 <= a2 * d1) return null;
      return [a1, d1, a2, d2];
    });

    const sameDen = () => {
      const d = pick([5, 7, 8, 9, 10, 11, 12]), op = pick(['+', M]);
      const a = op === M ? R(2, d - 1) : R(1, d - 1);
      const b = op === M ? R(1, a - 1) : R(1, d - 1);
      const n = op === '+' ? a + b : a - b;
      return fracQ(`Work out ${fr(a, d)} ${op} ${fr(b, d)}`, n, d,
        ['The denominators are the same, so the pieces are the same size. Just add or subtract the numerators.',
          `The denominator stays as ${d}. Work out ${a} ${op} ${b} for the numerator.`],
        `${fr(a, d)} ${op} ${fr(b, d)} = ${fr(n, d)}${U.gcd(n, d) > 1 || n > d ? ` = ${U.mixed(n, d)}` : ''}. Only the numerators are added or subtracted.`,
        { mixed: true, visual: bars(a, d, b, d) });
    };

    const diffDen = L => {
      const op = pick(['+', M]);
      const [a1, d1, a2, d2] = pairFr(L, op, L === 1 ? [2, 3, 4, 6, 8, 10, 12] : [2, 3, 4, 5, 6, 8, 10, 12]);
      const w = work(a1, d1, op, a2, d2);
      return fracQ(`Work out ${fr(a1, d1)} ${op} ${fr(a2, d2)}${L >= 2 ? '\n' + SIMPLE : ''}`, w.n, w.L,
        [NUDGE, `Use ${w.L} as the denominator: ${w.conv}.`],
        `${w.conv}. So ${w.line}.`,
        { mixed: true, simplest: L >= 2, visual: L === 1 ? bars(a1, d1, a2, d2) : undefined });
    };

    const mixedNums = () => {
      const op = pick(['+', M]);
      const [a1, d1, a2, d2] = pairFr(2, '+', [2, 3, 4, 5, 6, 8, 10, 12]);
      let w1 = R(1, 4), w2 = R(1, 3);
      if (op === M) w1 = w2 + 2 + R(0, 1);
      const i1 = w1 * d1 + a1, i2 = w2 * d2 + a2;
      const w = work(i1, d1, op, i2, d2);
      return fracQ(`Work out ${w1} ${fr(a1, d1)} ${op} ${w2} ${fr(a2, d2)}\nGive your answer as a mixed number in its simplest form.`, w.n, w.L,
        ['Change both mixed numbers into improper fractions first. Then use a common denominator.',
          `${w1} ${fr(a1, d1)} = ${fr(i1, d1)} and ${w2} ${fr(a2, d2)} = ${fr(i2, d2)}. Now write both with the denominator ${w.L}.`],
        `${fr(i1, d1)} ${op} ${fr(i2, d2)} = ${w.line}.`,
        { mixed: true, simplest: true });
    };

    const spot = () => {
      const [a1, d1, a2, d2] = pairFr(2, '+', [2, 3, 4, 5, 6, 8, 10]);
      const w = work(a1, d1, '+', a2, d2), who = U.name();
      return fracQ(`${who} says ${fr(a1, d1)} + ${fr(a2, d2)} = ${fr(a1 + a2, d1 + d2)}.\nWhat is the correct answer?`, w.n, w.L,
        [`${who} added the tops and added the bottoms. You must make the denominators the same first.`,
          `Use ${w.L} as the denominator: ${w.conv}.`],
        `${w.conv}. So the answer is ${w.line}. You never add the denominators.`,
        { mixed: true });
    };

    const real = () => {
      if (Math.random() < 0.5) {
        const [a1, d1, a2, d2] = pairFr(2, '+', [2, 3, 4, 5, 6, 8]);
        if (a1 * d2 + a2 * d1 >= d1 * d2) return real();
        const w = work(a1, d1, '+', a2, d2), p = U.name(), q = U.name();
        if (p === q) return real();
        return fracQ(`${p} ate ${fr(a1, d1)} of a pizza and ${q} ate ${fr(a2, d2)} of the same pizza.\nWhat fraction of the pizza did they eat altogether?`, w.n, w.L,
          ['"Altogether" means add. Make the denominators the same first.', `Use ${w.L} as the denominator: ${w.conv}.`],
          `${w.conv}. ${w.line} of the pizza.`);
      }
      const [a1, d1, a2, d2] = pairFr(2, M, [2, 3, 4, 5, 6, 8, 10]);
      const w = work(a1, d1, M, a2, d2), who = U.name();
      return fracQ(`A jug holds ${fr(a1, d1)} of a litre of juice. ${who} drinks ${fr(a2, d2)} of a litre.\nHow much juice is left?`, w.n, w.L,
        ['"Left" means subtract. Make the denominators the same first.', `Use ${w.L} as the denominator: ${w.conv}.`],
        `${w.conv}. ${w.line} of a litre is left.`, { unit: 'litre' });
    };

    const missing = () => {
      const [a1, d1, a2, d2] = pairFr(2, '+', [2, 3, 4, 5, 6, 8, 10, 12]);
      if (a1 * d2 + a2 * d1 >= d1 * d2) return missing();
      const L = U.lcm(d1, d2);
      const [tn, td] = U.simplify(a1 * L / d1 + a2 * L / d2, L);
      const [xn, xd] = U.simplify(a2, d2);
      const T = U.lcm(td, d1);
      return fracQ(`Find the missing fraction.\n${fr(a1, d1)} + □ = ${fr(tn, td)}`, xn, xd,
        ['Use the inverse: □ = the total − the fraction you know.',
          `□ = ${fr(tn, td)} ${M} ${fr(a1, d1)}. With the denominator ${T} this is ${fr(tn * T / td, T)} ${M} ${fr(a1 * T / d1, T)}.`],
        `${fr(tn, td)} ${M} ${fr(a1, d1)} = ${fr(tn * T / td - a1 * T / d1, T)}${U.gcd(tn * T / td - a1 * T / d1, T) > 1 ? ` = ${fr(xn, xd)}` : ''}. So □ = ${fr(xn, xd)}.`);
    };

    PMLM.registerSkill({
      id: 'g7.fracAddSub', grade: 7, unit: 'g7.u2', title: 'Add and subtract fractions', icon: '🍕',
      blurb: 'Add and subtract fractions and mixed numbers',
      lesson: [
        { title: 'Same denominator',
          text: 'When the denominators are the same, the pieces are the same size.\nAdd the numerators. Keep the denominator.\n{2/7} + {3/7} = {5/7}\n**Never** add the denominators.',
          visual: { type: 'fractionBar', bars: [{ parts: 7, shaded: 2, label: '{2/7}' }, { parts: 7, shaded: 5, label: '{5/7}' }] } },
        { title: 'Different denominators',
          text: 'Make the pieces the same size first: find a **common denominator** (a common multiple).\n{1/3} + {1/4}: 12 is in both the 3 and 4 times tables.\n{1/3} = {4/12} and {1/4} = {3/12}, so the answer is {7/12}.',
          visual: { type: 'fractionBar', bars: [{ parts: 3, shaded: 1, label: '{1/3}' }, { parts: 12, shaded: 4, label: '{4/12}' }, { parts: 4, shaded: 1, label: '{1/4}' }, { parts: 12, shaded: 3, label: '{3/12}' }] } },
        { title: 'Simplest form and mixed numbers',
          text: 'Simplify by dividing top and bottom by the same number: {6/8} = {3/4}.\nAn answer like {11/8} is bigger than 1. As a mixed number it is 1 {3/8}.\nFor mixed numbers, change to improper fractions first: 2 {1/3} = {7/3}.' },
        { title: 'Worked example',
          text: 'Work out 1 {1/2} + {3/4}.\n**1.** Improper fraction: 1 {1/2} = {3/2}.\n**2.** Common denominator 4: {3/2} = {6/4}.\n**3.** {6/4} + {3/4} = {9/4}.\n**4.** As a mixed number: {9/4} = **2 {1/4}**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [sameDen, sameDen, diffDen, diffDen, real],
          [diffDen, diffDen, spot, real, sameDen, mixedNums],
          [mixedNums, mixedNums, diffDen, missing, spot, real],
        ], ctx);
      },
    });
  }

  /* 8 ── Multiplying and dividing fractions by integers */
  {
    const timesFrac = L => {
      const k = R(2, L === 1 ? 4 : 9), b = pick([3, 4, 5, 6, 7, 8, 9, 10]), a = R(1, b - 1);
      if (U.gcd(a, b) !== 1) return timesFrac(L);
      const n = k * a;
      return fracQ(`Work out ${k} × ${fr(a, b)}${L >= 2 ? '\n' + SIMPLE : ''}`, n, b,
        ['Multiplying a fraction by a whole number: multiply the numerator only. The size of the pieces (the denominator) does not change.',
          `${k} × ${fr(a, b)} means ${k} lots of ${fr(a, b)}. The denominator stays ${b}. Work out ${k} × ${a} for the numerator.`],
        `${k} × ${fr(a, b)} = ${fr(n, b)}${U.gcd(n, b) > 1 || n > b ? ` = ${U.mixed(n, b)}` : ''}.`,
        { mixed: true, simplest: L >= 2, visual: L === 1 ? { type: 'fractionBar', bars: Array.from({ length: k }, () => ({ parts: b, shaded: a })) } : undefined });
    };

    const fracOf = (L, ctx) => {
      const b = pick([3, 4, 5, 6, 8, 10]), a = L === 1 ? 1 : R(2, b - 1);
      if (U.gcd(a, b) !== 1) return fracOf(L, ctx);
      const N = b * R(2, L === 1 ? 10 : 15), one = N / b, ans = one * a;
      if (Math.random() < 0.5) {
        return num(`Find ${fr(a, b)} of ${N}.`, ans,
          a > 1 ? [`Divide by the denominator to find ${fr(1, b)}, then multiply by the numerator.`, `${fr(1, b)} of ${N} = ${N} ÷ ${b} = ${one}. Now multiply by ${a}.`]
            : [`To find ${fr(1, b)} of an amount, split it into ${b} equal parts: divide by ${b}.`, `Work out ${N} ÷ ${b}. Think: ${b} × what = ${N}?`],
          `${N} ÷ ${b} = ${one}${a > 1 ? `, and ${one} × ${a} = ${ans}` : ''}. So ${fr(a, b)} of ${N} is ${ans}.`,
          { visual: { type: 'barModel', rows: [{ label: String(N), parts: b }] } });
      }
      return num(`A class has ${N} pupils. ${fr(a, b)} of them walk to school.\nHow many pupils walk to school?`, ans,
        [`Find ${fr(a, b)} of ${N}: divide by ${b}${a > 1 ? `, then multiply by ${a}` : ''}.`, a > 1 ? `${N} ÷ ${b} = ${one}. Now multiply by ${a}.` : `Work out ${N} ÷ ${b}. Think: ${b} × what = ${N}?`],
        `${N} ÷ ${b} = ${one}${a > 1 ? `, and ${one} × ${a} = ${ans}` : ''}. So ${ans} pupils walk.`,
        { unit: 'pupils', visual: { type: 'barModel', rows: [{ label: 'pupils', parts: b }], total: String(N) } });
    };

    const divInt = L => {
      const b = pick([2, 3, 4, 5, 6, 8]), a = R(1, b - 1), k = R(2, 5);
      if (U.gcd(a, b) !== 1) return divInt(L);
      const [sn, sd] = U.simplify(a, b * k);
      return fracQ(`Work out ${fr(a, b)} ÷ ${k}\n${SIMPLE}`, sn, sd,
        [`Dividing by ${k} splits every piece into ${k} smaller pieces. Multiply the denominator by ${k}.`,
          `${fr(a, b)} ÷ ${k} = ${fr(a, `${b} × ${k}`)}. Work out the denominator, then simplify if you can.`],
        `${fr(a, b)} ÷ ${k} = ${fr(a, b * k)}${sn !== a ? ` = ${fr(sn, sd)}` : ''}.`,
        { simplest: true });
    };

    const spot = () => {
      const k = R(2, 5), b = pick([3, 5, 7, 9]), a = R(1, b - 1), who = U.name();
      if (U.gcd(a, b) !== 1 || k * a <= b) return spot();
      return fracQ(`${who} says ${k} × ${fr(a, b)} = ${fr(k * a, k * b)}.\nWhat is the correct answer?`, k * a, b,
        [`${who} multiplied the top and the bottom. Does the size of each piece change?`, `Only the numerator is multiplied: ${k} × ${a}. The denominator stays ${b}.`],
        `${k} × ${fr(a, b)} = ${fr(k * a, b)} = ${U.mixed(k * a, b)}. (${fr(k * a, k * b)} is the same as ${fr(a, b)}, so it cannot be right.)`,
        { mixed: true });
    };

    const real = () => {
      if (Math.random() < 0.5) {
        const b = pick([2, 3, 4, 5]), a = R(1, b - 1), k = R(3, 8);
        if (U.gcd(a, b) !== 1 || (k * a) % b === 0) return real();
        return fracQ(`Each bottle holds ${fr(a, b)} of a litre of water.\nHow many litres do ${k} bottles hold?\nGive your answer as a mixed number.`, k * a, b,
          ['Multiply the amount in one bottle by the number of bottles.', `${k} × ${fr(a, b)} = ${fr(`${k} × ${a}`, b)}.`],
          `${k} × ${fr(a, b)} = ${fr(k * a, b)} = ${U.mixed(k * a, b)} litres.`, { mixed: true, simplest: true, unit: 'litres' });
      }
      const b = pick([2, 3, 4, 5]), a = R(1, b - 1), k = R(2, 4);
      if (U.gcd(a, b) !== 1) return real();
      const [sn, sd] = U.simplify(a, b * k);
      return fracQ(`${fr(a, b)} kg of cake is shared equally between ${k} people.\nHow much does each person get?`, sn, sd,
        [`Sharing between ${k} means ÷ ${k}. Multiply the denominator by ${k}.`, `${fr(a, b)} ÷ ${k} = ${fr(a, `${b} × ${k}`)}.`],
        `${fr(a, b)} ÷ ${k} = ${fr(a, b * k)}${sn !== a ? ` = ${fr(sn, sd)}` : ''} kg each.`, { unit: 'kg' });
    };

    const missingWhole = () => {
      const b = pick([3, 4, 5, 6, 8]), a = R(1, b - 1);
      if (U.gcd(a, b) !== 1) return missingWhole();
      const one = R(2, 9), N = one * b, part = one * a;
      return num(`${fr(a, b)} of a number is ${part}.\nWhat is the number?`, N,
        [`${fr(a, b)} is ${a} equal part${a > 1 ? 's' : ''} out of ${b}. Find the size of one part first.`,
          a > 1 ? `${a} parts are ${part}, so one part is ${part} ÷ ${a} = ${one}.` : `One part is ${part}. How many parts make the whole number?`],
        `One part is ${one}. There are ${b} parts, so the number is ${one} × ${b} = ${N}.`,
        { visual: { type: 'barModel', rows: [{ label: '?', parts: b }] } });
    };

    PMLM.registerSkill({
      id: 'g7.fracInt', grade: 7, unit: 'g7.u2', title: 'Fractions × and ÷ integers', icon: '✂️',
      blurb: 'Multiply and divide fractions by whole numbers',
      lesson: [
        { title: 'Whole number × fraction',
          text: '3 × {2/5} means 3 lots of {2/5}.\n{2/5} + {2/5} + {2/5} = {6/5}\nMultiply the **numerator** only. The denominator stays the same.\n{6/5} = 1 {1/5}',
          visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 2 }, { parts: 5, shaded: 2 }, { parts: 5, shaded: 2 }] } },
        { title: 'A fraction of an amount',
          text: 'To find {3/4} of 20:\nDivide by the denominator: 20 ÷ 4 = 5 (that is {1/4}).\nMultiply by the numerator: 5 × 3 = 15.',
          visual: { type: 'barModel', rows: [{ label: '20', parts: 4, value: '5' }] } },
        { title: 'Fraction ÷ whole number',
          text: '{2/3} ÷ 4: split every third into 4 smaller pieces. Each piece is now a twelfth.\n{2/3} ÷ 4 = {2/12} = {1/6}\nMultiply the **denominator** by the whole number, then simplify.' },
        { title: 'Worked example',
          text: 'Work out 4 × {5/6}. Give the answer as a mixed number in its simplest form.\n**1.** Multiply the numerator: 4 × 5 = 20, so {20/6}.\n**2.** Simplify: {20/6} = {10/3}.\n**3.** 10 ÷ 3 = 3 remainder 1, so the answer is **3 {1/3}**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [timesFrac, timesFrac, fracOf, fracOf, real],
          [timesFrac, fracOf, divInt, spot, real, missingWhole],
          [timesFrac, divInt, divInt, spot, real, missingWhole, fracOf],
        ], ctx);
      },
    });
  }

  /* 9 ── Converting fractions, decimals and percentages */
  {
    const P1 = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10]];
    const P2 = P1.concat([[1, 20], [3, 20], [7, 20], [9, 20], [11, 20], [1, 25], [3, 25], [6, 25], [1, 50], [7, 50], [13, 50]]);
    const P3 = P2.concat([[1, 8], [3, 8], [5, 8], [7, 8]]);
    const pairs = L => (L === 1 ? P1 : L === 2 ? P2 : P3);
    const pctOf = (a, d) => U.clean(a * 100 / d);
    const denFor = d => (10 % d === 0 ? 10 : 100 % d === 0 ? 100 : 1000);

    const fracToPct = L => {
      const [a, d] = pick(pairs(L)), p = pctOf(a, d);
      const step = 100 % d === 0
        ? `100 ÷ ${d} = ${100 / d}, so multiply the top and the bottom by ${100 / d}.`
        : `${fr(1, 8)} = 12.5%. So ${fr(a, 8)} is ${a} × 12.5%.`;
      return num(`Write ${fr(a, d)} as a percentage.`, p,
        ['Per cent means "out of 100". Make the denominator 100.', step],
        `${fr(a, d)} = ${fr(F(p), 100)} = ${F(p)}%.`,
        { unit: '%', visual: L === 1 ? { type: 'fractionBar', bars: [{ parts: d, shaded: a }] } : undefined });
    };

    const fracToDec = L => {
      const [a, d] = pick(pairs(L)), den = denFor(d), m = den / d, dec = U.clean(a / d);
      return num(`Write ${fr(a, d)} as a decimal.`, dec,
        [`Make the denominator 10, 100 or 1000. Then write it as a decimal.`,
          `Multiply the top and the bottom by ${m}: ${fr(a, d)} = ${fr(a * m, den)}.`],
        `${fr(a, d)} = ${fr(a * m, den)} = ${F(dec)}.`);
    };

    const decToPct = L => {
      const [a, d] = pick(pairs(L)), dec = U.clean(a / d), p = pctOf(a, d);
      return num(`Write ${F(dec)} as a percentage.`, p,
        ['To change a decimal into a percentage, multiply by 100.', `× 100 is × 10 and then × 10 again. ${F(dec)} × 10 = ${F(dec * 10)}.`],
        `${F(dec)} × 100 = ${F(p)}, so ${F(dec)} = ${F(p)}%.`, { unit: '%' });
    };

    const pctToDec = L => {
      const p = L === 3 && Math.random() < 0.4 ? pick([4, 8, 120, 150, 175, 12.5, 2.5]) : pctOf(...pick(pairs(Math.min(L, 2))));
      const dec = U.clean(p / 100);
      return num(`Write ${F(p)}% as a decimal.`, dec,
        ['Per cent means "out of 100", so divide by 100.', `${F(p)}% = ${fr(F(p), 100)}. ÷ 100 moves every digit 2 places to the right.`],
        `${F(p)} ÷ 100 = ${F(dec)}, so ${F(p)}% = ${F(dec)}.`);
    };

    const pctToFrac = L => {
      const [a0, d0] = pick(pairs(Math.min(L, 2))), p = pctOf(a0, d0);
      const [a, d] = U.simplify(p, 100);
      return fracQ(`Write ${F(p)}% as a fraction.\n${SIMPLE}`, a, d,
        ['Per cent means "out of 100". Write it over 100, then simplify.', `${F(p)}% = ${fr(F(p), 100)}. Now divide the top and the bottom by the same number.`],
        `${F(p)}% = ${fr(F(p), 100)} = ${fr(a, d)}.`, { simplest: true });
    };

    const decToFrac = L => {
      const [a, d] = pick(pairs(L)), dec = U.clean(a / d);
      const den = String(F(dec)).split('.')[1].length === 1 ? 10 : String(F(dec)).split('.')[1].length === 2 ? 100 : 1000;
      const n = Math.round(dec * den);
      if (U.gcd(n, den) === 1) return decToFrac(L);
      return fracQ(`Write ${F(dec)} as a fraction.\n${SIMPLE}`, a, d,
        ['Use place value: tenths, hundredths or thousandths. Then simplify.', `${F(dec)} = ${fr(n, den)}. Now divide the top and the bottom by the same number.`],
        `${F(dec)} = ${fr(n, den)} = ${fr(a, d)}.`, { simplest: true });
    };

    const compare = () => {
      const FR = { 20: [1, 5], 25: [1, 4], 30: [3, 10], 35: [7, 20], 40: [2, 5], 45: [9, 20], 50: [1, 2], 55: [11, 20], 60: [3, 5], 65: [13, 20], 70: [7, 10], 75: [3, 4], 80: [4, 5] };
      const keys = Object.keys(FR).map(Number);
      const start = R(0, keys.length - 6);
      const vals = U.sample(keys.slice(start, start + 6), 4);
      const forms = U.shuffle(['f', 'd', 'p', pick(['f', 'd', 'p'])]);
      const show = (v, f) => (f === 'f' ? fr(...FR[v]) : f === 'd' ? F(v / 100) : `${v}%`);
      const items = vals.map((v, i) => ({ v, s: show(v, forms[i]), f: forms[i] }));
      const big = Math.random() < 0.5;
      const ans = items.reduce((m, it) => ((big ? it.v > m.v : it.v < m.v) ? it : m));
      const conv = items.find(it => it.f !== 'p');
      return choice(`Which of these is the **${big ? 'largest' : 'smallest'}**?`, ans.s, items.filter(it => it !== ans).map(it => it.s),
        ['Change them all into the same form. Percentages are usually easiest.', `For example, ${conv.s} = ${conv.v}%. Change the others too.`],
        `As percentages: ${items.map(it => (it.f === 'p' ? it.s : `${it.s} = ${it.v}%`)).join(', ')}. The ${big ? 'largest' : 'smallest'} is ${ans.s}.`);
    };

    const spot = () => {
      const who = U.name();
      if (Math.random() < 0.5) {
        const t = R(1, 9);
        return num(`${who} says ${F(t / 10)} = ${t}%.\nWhat is the correct percentage?`, t * 10,
          ['To change a decimal into a percentage, multiply by 100.', `Multiply by 10, then by 10 again. ${F(t / 10)} × 10 = ${t}.`],
          `${F(t / 10)} × 100 = ${t * 10}, so ${F(t / 10)} = ${t * 10}%, not ${t}%.`, { unit: '%' });
      }
      const h = R(1, 9);
      return num(`${who} says ${F(h / 100)} = ${h * 10}%.\nWhat is the correct percentage?`, h,
        ['To change a decimal into a percentage, multiply by 100.', `Multiply by 10, then by 10 again. ${F(h / 100)} × 10 = ${F(h / 10)}.`],
        `${F(h / 100)} × 100 = ${h}, so ${F(h / 100)} = ${h}%.`, { unit: '%' });
    };

    PMLM.registerSkill({
      id: 'g7.fdp', grade: 7, unit: 'g7.u2', title: 'Fractions, decimals and %', icon: '🔄',
      blurb: 'Change between fractions, decimals and percentages',
      lesson: [
        { title: 'Three ways to write a part',
          text: 'Percent means "out of 100".\n{1/4} = 0.25 = 25%\nThese all show the same amount: a quarter of the whole.',
          visual: { type: 'fractionBar', bars: [{ parts: 4, shaded: 1, label: '{1/4}' }, { parts: 20, shaded: 5, label: '25%' }] } },
        { title: 'Fraction → decimal or %',
          text: 'Make the denominator 10 or 100.\n{3/5} = {6/10} = 0.6\n{7/20} = {35/100} = 0.35 = 35%\nFor eighths, remember {1/8} = 0.125 = 12.5%.' },
        { title: 'Decimal ↔ %',
          text: 'Decimal → %: multiply by 100. 0.4 = **40%** (not 4%)\n% → decimal: divide by 100. 7% = **0.07**\n% → fraction: write over 100 and simplify. 45% = {45/100} = {9/20}',
          visual: { type: 'table', headers: ['Fraction', 'Decimal', '%'], rows: [['{1/2}', '0.5', '50%'], ['{1/4}', '0.25', '25%'], ['{3/4}', '0.75', '75%'], ['{1/5}', '0.2', '20%'], ['{1/10}', '0.1', '10%']] } },
        { title: 'Worked example',
          text: 'Which is bigger: {3/5} or 58%?\n**1.** Change {3/5} to a percentage: {3/5} = {60/100}.\n**2.** So {3/5} = 60%.\n**3.** 60% is more than 58%.\nAnswer: **{3/5}** is bigger.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [fracToPct, fracToDec, decToPct, pctToDec, spot],
          [fracToPct, fracToDec, decToPct, pctToFrac, decToFrac, compare, spot],
          [fracToPct, fracToDec, pctToDec, pctToFrac, decToFrac, compare, compare],
        ], ctx);
      },
    });
  }

  /* 10 ── Percentages of quantities */
  {
    const easy = () => {
      const p = pick([10, 50, 25, 20, 5, 1, 75]);
      const N = { 10: 10 * R(2, 30), 50: 2 * R(5, 60), 25: 4 * R(3, 30), 20: 5 * R(2, 20), 5: 20 * R(1, 10), 1: 100 * R(1, 9), 75: 4 * R(2, 20) }[p];
      const ans = U.clean(N * p / 100);
      const H = {
        10: ['10% is one tenth, so divide by 10.', `Divide ${N} by 10: every digit moves one place to the right.`],
        50: ['50% is one half.', `50% = ${fr(1, 2)}, so work out ${N} ÷ 2.`],
        25: ['25% is one quarter.', `Halve ${N} to get ${N / 2}. Now halve it again.`],
        20: ['20% is 2 × 10%.', `10% of ${N} = ${N / 10}. Now double it.`],
        5: ['5% is half of 10%.', `10% of ${N} = ${N / 10}. Now halve it.`],
        1: ['1% is one hundredth, so divide by 100.', `Divide ${N} by 100: every digit moves two places to the right.`],
        75: ['75% = 50% + 25%.', `50% of ${N} = ${N / 2}. Now find 25% (half of that) and add.`],
      }[p];
      const E = {
        10: `${N} ÷ 10 = ${F(ans)}`, 50: `${N} ÷ 2 = ${F(ans)}`, 25: `${N} ÷ 4 = ${F(ans)}`, 20: `10% = ${N / 10}, so 20% = 2 × ${N / 10} = ${F(ans)}`,
        5: `10% = ${N / 10}, so 5% = ${N / 10} ÷ 2 = ${F(ans)}`, 1: `${N} ÷ 100 = ${F(ans)}`, 75: `50% = ${N / 2} and 25% = ${N / 4}, so 75% = ${N / 2} + ${N / 4} = ${F(ans)}`,
      }[p];
      return num(`Find ${p}% of ${N}.`, ans, H, `${E}. So ${p}% of ${N} is ${F(ans)}.`);
    };

    // build p% from 10%, 5% and 1%
    const buildUp = (p, N) => {
      const t = Math.floor(p / 10), f = p % 10 >= 5 ? 1 : 0, o = p % 5;
      const parts = [];
      if (t) parts.push(t > 1 ? `${t} × 10%` : '10%');
      if (f) parts.push('5%');
      if (o) parts.push(o > 1 ? `${o} × 1%` : '1%');
      const known = [`10% of ${F(N)} = ${F(N / 10)}`];
      if (f) known.push(`5% = ${F(N / 20)}`);
      if (o) known.push(`1% = ${F(N / 100)}`);
      return { recipe: `${p}% = ${parts.join(' + ')}`, known: known.join(', ') };
    };

    const build = () => {
      const p = pick([30, 40, 60, 70, 90, 15, 35, 45, 65, 85, 2, 12]);
      const N = p === 2 || p === 12 ? 50 * R(1, 10) : 20 * R(2, 20);
      const ans = U.clean(N * p / 100), b = buildUp(p, N);
      return num(`Find ${p}% of ${N}.`, ans,
        ['Find 10% first (÷ 10). Use it to build up the percentage you need.', `${b.known}. Now use ${b.recipe}.`],
        `${b.recipe}. So ${p}% of ${N} = ${F(ans)}.`);
    };

    const sale = (L, ctx) => {
      const cur = ctx.currency;
      const p = pick([10, 20, 25, 15, 30, 40]), N = 20 * R(2, 15), off = U.clean(N * p / 100), who = pick(['coat', 'bike', 'game', 'pair of trainers', 'lamp']);
      const b = buildUp(p, N);
      if (L === 3 && Math.random() < 0.6) {
        return num(`A ${who} costs ${cur}${N}. In a sale it has ${p}% off.\nWhat is the sale price?`, N - off,
          ['First find how much is taken off. Then subtract it from the price.', `${b.known}. ${b.recipe}.`],
          `${p}% of ${cur}${N} = ${cur}${F(off)}. ${cur}${N} − ${cur}${F(off)} = ${cur}${F(N - off)}.`, { prefix: cur });
      }
      return num(`A ${who} costs ${cur}${N}. In a sale it has ${p}% off.\nHow much money is taken off?`, off,
        [`Find ${p}% of ${N}. Start with 10%.`, `${b.known}. ${b.recipe}.`],
        `${p}% of ${cur}${N} = ${cur}${F(off)}.`, { prefix: cur, visual: { type: 'barModel', rows: [{ label: '100%', parts: 10 }], total: `${cur}${N}` } });
    };

    const asPct = () => {
      const b = pick([10, 20, 25, 50, 200]), a = R(Math.ceil(b / 3), b - 1), who = U.name();
      const m = 100 / b, p = U.clean(a * m);
      if (p % 1) return asPct();
      return num(`${who} scored ${a} out of ${b} in a test.\nWhat percentage is that?`, p,
        ['Write the score as a fraction. Then make the denominator 100.', `${a} out of ${b} = ${fr(a, b)}. ${b < 100 ? `100 ÷ ${b} = ${m}, so multiply the top and the bottom by ${m}.` : 'Divide the top and the bottom by 2.'}`],
        `${fr(a, b)} = ${fr(p, 100)} = ${p}%.`, { unit: '%' });
    };

    const missing = () => {
      const p = pick([10, 20, 25, 50, 75, 5, 30, 40]);
      const N = { 25: 4, 75: 4, 5: 20 }[p] ? ({ 25: 4, 75: 4, 5: 20 }[p]) * R(2, 15) : 10 * R(2, 15);
      const part = U.clean(N * p / 100);
      if (part % 1) return missing();
      const [sn, sd] = U.simplify(part, N);
      return num(`Find the missing number.\n□% of ${N} = ${F(part)}`, p,
        ['Write the part as a fraction of the whole, then change it into a percentage.', `${F(part)} out of ${N} = ${fr(F(part), N)}${sn !== part ? ` = ${fr(sn, sd)}` : ''}.`],
        `${fr(F(part), N)} = ${fr(sn, sd)} = ${p}%. Check: ${p}% of ${N} = ${F(part)}.`, { unit: '%' });
    };

    const spot = () => {
      const N = 20 * R(2, 15), who = U.name();
      return num(`${who} says 5% of ${N} is ${N / 5}.\nWhat is the correct answer?`, N / 20,
        [`${who} divided by 5. But 5% is not ${fr(1, 5)}. 5% is half of 10%.`, `10% of ${N} = ${N / 10}.`],
        `10% of ${N} = ${N / 10}, so 5% = ${N / 10} ÷ 2 = ${N / 20}.`);
    };

    PMLM.registerSkill({
      id: 'g7.percent', grade: 7, unit: 'g7.u2', title: 'Percentages of amounts', icon: '💯',
      blurb: 'Find percentages of amounts, with and without money',
      lesson: [
        { title: 'Key percentages',
          text: '100% is the whole amount.\n50% = half (÷ 2)\n25% = a quarter (÷ 4)\n10% = a tenth (÷ 10)\n1% = a hundredth (÷ 100)',
          visual: { type: 'barModel', rows: [{ label: '100%', parts: 10, value: '10%' }], total: '200' } },
        { title: 'Build up from 10%',
          text: 'Find 35% of 200.\n10% of 200 = 20\n5% = half of 10% = 10\n35% = 10% + 10% + 10% + 5% = 20 + 20 + 20 + 10 = **70**' },
        { title: 'Percentages in shops',
          text: '"20% off" means you save 20% of the price.\nA bike costs 150. 10% = 15, so 20% = 30.\nYou save 30, and you pay 150 − 30 = 120.' },
        { title: 'Worked example',
          text: 'Find 15% of 60.\n**1.** 10% of 60 = 60 ÷ 10 = 6.\n**2.** 5% is half of 10% = 3.\n**3.** 15% = 10% + 5% = 6 + 3.\nAnswer: **9**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [easy, easy, easy, spot, sale],
          [build, build, easy, sale, spot, asPct],
          [build, sale, sale, asPct, missing, spot],
        ], ctx);
      },
    });
  }

  /* 11 ── Ratio and proportion */
  {
    const coprime = (max, minA = 1) => retry(() => {
      const a = R(minA, max), b = R(1, max);
      return a !== b && U.gcd(a, b) === 1 ? [a, b] : null;
    });
    const PAIRS = [['boys', 'girls', 'In a club'], ['red beads', 'blue beads', 'In a bag'], ['cats', 'dogs', 'At an animal shelter'], ['apples', 'oranges', 'In a box']];

    const simplify = L => {
      const [a0, b0] = coprime(L === 1 ? 5 : 7), g = R(2, L === 1 ? 6 : 12), a = a0 * g, b = b0 * g;
      const ans = `${a0} : ${b0}`;
      const fs = U.factors(g).filter(f => f > 1 && f < g);
      const wr = [`${b0} : ${a0}`, `${a0} : ${b}`];
      if (fs.length) wr.unshift(`${a / fs[0]} : ${b / fs[0]}`);
      else wr.push(`${a} : ${b0}`);
      return choice(`Write ${a} : ${b} in its simplest form.`, ans, wr,
        ['Divide both numbers by the same number. Keep going until they have no common factor except 1.',
          `Both ${a} and ${b} are in the ${g} times table. Divide **both** sides by ${g}.`],
        `${a} ÷ ${g} = ${a0} and ${b} ÷ ${g} = ${b0}, so ${a} : ${b} = ${ans}.`);
    };

    const missingRatio = L => {
      const [a0, b0] = coprime(6), k = R(2, L === 1 ? 5 : 9);
      if (Math.random() < 0.5) {
        return num(`Find the missing number.\n${a0} : ${b0} = ${a0 * k} : □`, b0 * k,
          ['Equivalent ratios: multiply both sides by the same number.', `${a0} × ${k} = ${a0 * k}, so multiply ${b0} by ${k} as well.`],
          `${b0} × ${k} = ${b0 * k}, so ${a0} : ${b0} = ${a0 * k} : ${b0 * k}.`);
      }
      return num(`Find the missing number.\n${a0 * k} : ${b0 * k} = ${a0} : □`, b0,
        ['Equivalent ratios: divide both sides by the same number.', `${a0 * k} ÷ ${k} = ${a0}, so divide ${b0 * k} by ${k} as well.`],
        `${b0 * k} ÷ ${k} = ${b0}, so ${a0 * k} : ${b0 * k} = ${a0} : ${b0}.`);
    };

    const share = (L, ctx) => {
      const [a, b] = coprime(L === 1 ? 4 : 7), k = R(2, L === 1 ? 10 : 15), N = (a + b) * k;
      const p = U.name(); let q = U.name(); while (q === p) q = U.name();
      const askFirst = a >= 2 && (b < 2 || Math.random() < 0.5);
      if (!askFirst && b < 2) return share(L, ctx);
      const who = askFirst ? p : q, r = askFirst ? a : b;
      const cur = ctx.currency;
      return num(`${p} and ${q} share ${cur}${N} in the ratio ${a} : ${b}.\nHow much does ${who} get?`, r * k,
        ['Add the numbers in the ratio to find the total number of parts.', `${a} + ${b} = ${a + b} parts. One part = ${N} ÷ ${a + b} = ${k}.`],
        `One part is ${cur}${k}. ${who} gets ${r} parts: ${r} × ${k} = ${cur}${r * k}.`,
        { prefix: cur, visual: { type: 'barModel', rows: [{ label: p, parts: a }, { label: q, parts: b }] } });
    };

    const givenOne = L => {
      const [a, b] = retry(() => { const [x, y] = coprime(L === 1 ? 5 : 7); return y >= 2 ? [x, y] : null; });
      const k = R(2, L === 1 ? 6 : 12), [n1, n2, where] = pick(PAIRS);
      return num(`${where}, the ratio of ${n1} to ${n2} is ${a} : ${b}.\nThere are ${a * k} ${n1}. How many ${n2} are there?`, b * k,
        [`${a} part${a > 1 ? 's' : ''} stand${a > 1 ? '' : 's'} for ${a * k} ${n1}. Find what one part is worth.`, a > 1 ? `One part = ${a * k} ÷ ${a} = ${k}.` : `One part = ${k}. The ${n2} are ${b} parts.`],
        `One part is ${k}. ${n2[0].toUpperCase() + n2.slice(1)}: ${b} × ${k} = ${b * k}.`,
        { visual: { type: 'barModel', rows: [{ label: n1, parts: a }, { label: n2, parts: b }] } });
    };

    const proportion = (L, ctx) => {
      const cur = ctx.currency;
      if (Math.random() < 0.5) {
        const u = L === 3 ? U.clean(R(5, 30) * 0.25) : R(2, 15), n1 = R(2, 6);
        let n2 = R(3, 12); if (n2 === n1) n2 = n1 + 1;
        const item = pick(['pens', 'notebooks', 'tickets', 'bottles of juice']);
        return num(`${n1} ${item} cost ${money(cur, u * n1)}.\nHow much do ${n2} ${item} cost?`, U.clean(u * n2),
          ['Find the cost of one first. Then multiply.', `One costs ${money(cur, u * n1)} ÷ ${n1} = ${money(cur, u)}.`],
          `One costs ${money(cur, u)}, so ${n2} cost ${n2} × ${money(cur, u)} = ${money(cur, u * n2)}.`, { prefix: cur });
      }
      const q = R(2, 10) * (L === 3 ? 15 : 10), p1 = pick([2, 4, 5]);
      let p2 = pick([3, 6, 8, 10]); if (p2 === p1) p2 = 7;
      return num(`A recipe for ${p1} people uses ${q * p1} g of flour.\nHow much flour is needed for ${p2} people?`, q * p2,
        ['Find the amount for one person first. Then multiply.', `For one person: ${q * p1} ÷ ${p1} = ${q} g.`],
        `${q} g for each person, so ${p2} × ${q} = ${q * p2} g.`, { unit: 'g' });
    };

    const threePart = (L, ctx) => {
      const [a, b, c] = retry(() => { const s = [R(1, 5), R(1, 5), R(2, 6)]; return new Set(s).size === 3 ? s : null; });
      const k = R(2, 10), N = (a + b + c) * k, big = Math.max(a, b, c);
      return num(`${ctx.currency}${N} is shared in the ratio ${a} : ${b} : ${c}.\nWhat is the largest share?`, big * k,
        ['Add all the numbers in the ratio to find the total number of parts.', `${a} + ${b} + ${c} = ${a + b + c} parts. One part = ${N} ÷ ${a + b + c} = ${k}.`],
        `One part is ${k}. The largest share is ${big} parts: ${big} × ${k} = ${ctx.currency}${big * k}.`, { prefix: ctx.currency });
    };

    const difference = () => {
      const [a, b] = retry(() => { const a = R(2, 5), b = R(a + 1, 9); return U.gcd(a, b) === 1 ? [a, b] : null; });
      const k = R(2, 12), D = (b - a) * k, p = U.name(); let q = U.name(); while (q === p) q = U.name();
      return num(`${p} and ${q} share some sweets in the ratio ${a} : ${b}.\n${q} gets ${D} more sweets than ${p}. How many sweets does ${p} get?`, a * k,
        [`${q} has ${b} − ${a} = ${b - a} more parts than ${p}. Those parts are the ${D} extra sweets.`, `${b - a} part${b - a > 1 ? 's' : ''} = ${D}, so one part = ${D} ÷ ${b - a} = ${k}.`],
        `One part is ${k}. ${p} has ${a} parts: ${a} × ${k} = ${a * k} sweets.`,
        { unit: 'sweets', visual: { type: 'barModel', rows: [{ label: p, parts: a }, { label: q, parts: b }] } });
    };

    const spot = (L, ctx) => {
      const m = R(2, 4), k = R(1, 4), N = m * (m + 1) * k, who = U.name();
      return num(`Share ${ctx.currency}${N} in the ratio 1 : ${m}.\n${who} says the shares are ${ctx.currency}${N / m} and ${ctx.currency}${N - N / m}.\nWhat should the bigger share be?`, m * N / (m + 1),
        [`${who} divided by ${m}. But the ratio 1 : ${m} has 1 + ${m} parts altogether.`, `1 + ${m} = ${m + 1} parts. One part = ${N} ÷ ${m + 1} = ${N / (m + 1)}.`],
        `One part is ${N / (m + 1)}. The bigger share is ${m} parts: ${m} × ${N / (m + 1)} = ${ctx.currency}${m * N / (m + 1)}.`, { prefix: ctx.currency });
    };

    PMLM.registerSkill({
      id: 'g7.ratio', grade: 7, unit: 'g7.u2', title: 'Ratio and proportion', icon: '⚖️',
      blurb: 'Simplify ratios, share in a ratio and use proportion',
      lesson: [
        { title: 'What is a ratio?',
          text: 'A ratio compares parts. For every 2 red beads there are 3 blue beads.\nRed : blue = **2 : 3**\nThe order matters: blue : red = 3 : 2.',
          visual: { type: 'barModel', rows: [{ label: 'red', parts: 2 }, { label: 'blue', parts: 3 }] } },
        { title: 'Simplifying',
          text: 'Divide both numbers by the same number, like simplifying a fraction.\n12 : 18 → divide both by 6 → **2 : 3**\nIf you only divide by 2 or 3, keep going until you can\'t divide any more.' },
        { title: 'Sharing in a ratio',
          text: 'Share 35 in the ratio 2 : 5.\nTotal parts: 2 + 5 = 7.\nOne part: 35 ÷ 7 = 5.\nShares: 2 × 5 = 10 and 5 × 5 = 25.',
          visual: { type: 'barModel', rows: [{ label: 'A', parts: 2, value: '5' }, { label: 'B', parts: 5, value: '5' }] } },
        { title: 'Proportion: find one first',
          text: '4 pens cost 6. How much do 7 pens cost?\nOne pen: 6 ÷ 4 = 1.50\nSeven pens: 7 × 1.50 = 10.50\nThis is called the **unitary method**.' },
        { title: 'Worked example',
          text: 'The ratio of boys to girls is 3 : 4. There are 15 boys. How many girls?\n**1.** 3 parts = 15 boys.\n**2.** One part = 15 ÷ 3 = 5.\n**3.** Girls = 4 parts = 4 × 5 = 20.\nAnswer: **20 girls**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [simplify, missingRatio, share, givenOne, proportion],
          [simplify, missingRatio, share, share, givenOne, proportion, spot],
          [simplify, share, proportion, threePart, difference, spot, givenOne],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 3: Algebra ═══════════════════════
  PMLM.registerUnit({ id: 'g7.u3', grade: 7, name: 'Algebra', icon: '🔤' });

  const EX = terms => U.expr(terms);
  const LETTERS = [['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q'], ['c', 'd']];

  /* 12 ── Writing and simplifying expressions */
  {
    const collect1 = () => {
      const v = pick(['x', 'a', 'y', 'n', 'm']);
      if (Math.random() < 0.6) {
        const [p, q] = retry(() => { const p = R(2, 9), q = R(2, 9); return p * q !== p + q ? [p, q] : null; });
        return choice(`Simplify ${p}${v} + ${q}${v}`, `${p + q}${v}`, [`${p + q}${v}^{2}`, `${p * q}${v}`, `${p + q}`],
          ['Like terms have the same letter. Add the numbers in front; the letter stays the same.',
            `${p}${v} + ${q}${v} means ${p} lots of ${v} plus ${q} more lots of ${v}. Add ${p} + ${q}.`],
          `${p} + ${q} = ${p + q}, so ${p}${v} + ${q}${v} = ${p + q}${v}. The letter does not get squared.`);
      }
      const p = R(5, 12), q = R(2, p - 1), d = p - q;
      return choice(`Simplify ${p}${v} ${M} ${q}${v}`, U.term(d, v), [`${d}`, `${p + q}${v}`, `${d}${v}^{2}`, d === 1 ? `1${v}^{2}` : `${d - 1}${v}`],
        ['Like terms: subtract the numbers in front. The letter stays.', `${p} lots of ${v} take away ${q} lots of ${v}. Work out ${p} ${M} ${q}.`],
        `${p} ${M} ${q} = ${d}, so ${p}${v} ${M} ${q}${v} = ${U.term(d, v)}.`);
    };

    const collect2 = L => {
      const [u, w] = pick(LETTERS);
      const t = retry(() => {
        const a = R(2, 9), b = R(1, 9), c = R(1, 8) * (L === 3 ? sgn() : 1), d = R(1, 8) * sgn();
        return a + c !== 0 && b + d !== 0 && a + c !== a - c && b + d !== b - d ? { a, b, c, d } : null;
      });
      const { a, b, c, d } = t;
      const q = EX([[a, u], [b, w], [c, u], [d, w]]);
      const ans = EX([[a + c, u], [b + d, w]]);
      const wr = [`${F(a + b + c + d)}${u}${w}`, `${U.term(a + c, u)}^{2}${U.term(b + d, w, false)}^{2}`];
      if (c < 0 || d < 0) wr.unshift(EX([[a + Math.abs(c), u], [b + Math.abs(d), w]]));
      if (b === 1 || d === 1) wr.unshift(EX([[a + c, u], [(b === 1 ? 0 : b) + (d === 1 ? 0 : d), w]]));
      wr.push(EX([[a * c, u], [b * d, w]]));
      return choice(`Simplify ${q}`, ans, wr,
        [`Collect the ${u} terms together and the ${w} terms together. The sign in front of a term belongs to it.`,
          `${u} terms: ${EX([[a, u], [c, u]])} = ${U.term(a + c, u)}. Now do the ${w} terms.`],
        `${EX([[a, u], [c, u]])} = ${U.term(a + c, u)} and ${EX([[b, w], [d, w]])} = ${U.term(b + d, w)}. So the answer is ${ans}.`);
    };

    const constants = () => {
      const v = pick(['x', 'a', 'n', 'y']);
      const a = R(2, 8), b = R(2, 12), c = R(1, 7), d = R(1, 15);
      if (b === d) return constants();
      const q = `${a}${v} + ${b} + ${U.term(c, v)} ${M} ${d}`;
      const ans = EX([[a + c, v], [b - d, '']]);
      return choice(`Simplify ${q}`, ans,
        [EX([[a + c, v], [b + d, '']]), `${F(a + c + b - d)}${v}`, EX([[a + c, v], [d - b, '']]), EX([[a * c, v], [b - d, '']])],
        ['Collect the letter terms together, and the number terms together. Numbers and letters are not like terms.',
          `Letter terms: ${a}${v} + ${U.term(c, v)} = ${U.term(a + c, v)}. Now work out the numbers: ${b} ${M} ${d}.`],
        `${a}${v} + ${U.term(c, v)} = ${U.term(a + c, v)} and ${b} ${M} ${d} = ${F(b - d)}. So the answer is ${ans}.`);
    };

    const write = L => {
      const k = R(2, 9), m = R(1, 9), n = pick(['n', 'x', 'y']);
      const T = [
        () => [`Add ${k} to ${n}.`, `${n} + ${k}`, [`${k}${n}`, `${n} ${M} ${k}`, `${k} ${M} ${n}`]],
        () => [`Subtract ${n} from ${k}.`, `${k} ${M} ${n}`, [`${n} ${M} ${k}`, `${k}${n}`, `${n} + ${k}`]],
        () => [`Multiply ${n} by ${k}, then subtract ${m}.`, `${k}${n} ${M} ${m}`, [`${k}(${n} ${M} ${m})`, `${m} ${M} ${k}${n}`, `${k}${n} + ${m}`]],
        () => [`Divide ${n} by ${k}.`, fr(n, k), [fr(k, n), `${k}${n}`, `${n} ${M} ${k}`]],
        () => [`Add ${m} to ${n}, then multiply the result by ${k}.`, `${k}(${n} + ${m})`, [`${k}${n} + ${m}`, `${n} + ${k * m}`, `${k} + ${n} + ${m}`]],
        () => [`${U.name()} has ${n} sweets. ${U.name()} has ${k} more than double that number. How many sweets does the second child have?`, `2${n} + ${k}`, [`2(${n} + ${k})`, `${n} + ${k + 2}`, `2${n} ${M} ${k}`]],
      ];
      const [words, ans, wr] = pick(L === 1 ? T.slice(0, 4) : T)();
      return choice(`Which expression means:\n"${words}"`, ans, wr,
        ['Read the words in order. Brackets show that something is done first, to the whole thing.',
          `Use the letter ${n} for the number. Check each choice by reading it back in words.`],
        `"${words}" is written as ${ans}.`);
    };

    const spot = () => {
      const who = U.name();
      if (Math.random() < 0.5) {
        const v = pick(['x', 'a', 'y']), p = R(2, 7), q = R(2, 7);
        if (p * q === p + q) return spot();
        return choice(`${who} says ${p}${v} + ${q}${v} = ${p + q}${v}^{2}.\nWhat is the correct answer?`, `${p + q}${v}`, [`${p + q}${v}^{2}`, `${p * q}${v}`, `${p + q}`],
          ['When you add like terms, only the number in front changes.', `${p} lots of ${v} plus ${q} lots of ${v}. How many lots of ${v} altogether?`],
          `${p}${v} + ${q}${v} = ${p + q}${v}. ${v}^{2} means ${v} × ${v}, which only happens when you multiply.`);
      }
      const [u, w] = pick(LETTERS), p = R(2, 8), q = R(2, 8);
      return choice(`${who} says ${p}${u} + ${q}${w} = ${p + q}${u}${w}.\nWhat is the correct answer?`, 'It cannot be simplified',
        [`${p + q}${u}${w}`, `${p + q}${u}`, `${p * q}${u}${w}`],
        [`Can you collect ${u} terms with ${w} terms? Like terms must have exactly the same letters.`, `${p}${u} and ${q}${w} have different letters, so they are not like terms.`],
        `${p}${u} and ${q}${w} are not like terms, so ${p}${u} + ${q}${w} cannot be simplified.`);
    };

    const notEqual = () => {
      const v = pick(['x', 'y', 'a', 'n']), k = R(5, 12), p = R(2, k - 2), r = R(1, 5);
      const right = pick([`${k} + ${v}`, `${p}${v} + ${k - p}`, `${v}^{${k}}`]);
      return choice(`Which expression is **not** equal to ${k}${v}?`, right, [`${p}${v} + ${k - p}${v}`, `${k + r}${v} ${M} ${U.term(r, v)}`, `${v} × ${k}`],
        [`Simplify each one and compare it with ${k}${v}.`, `${p}${v} + ${k - p}${v} = ${k}${v}, so that one is equal. Check the others.`],
        `${right} is not the same as ${k}${v}. The others all simplify to ${k}${v}.`);
    };

    const perimeter = () => {
      const v = pick(['x', 'a', 'y']), a = R(2, 5), b = R(1, 9), c = R(1, 4), d = R(1, 9);
      const base = EX([[a, v], [b, '']]), ht = EX([[c, v], [d, '']]);
      const ans = EX([[2 * (a + c), v], [2 * (b + d), '']]);
      return choice(`Find an expression for the perimeter of this rectangle.\nSimplify your answer.`, ans,
        [EX([[a + c, v], [b + d, '']]), EX([[a + c, v], [2 * (b + d), '']]), `${2 * (a + c + b + d)}${v}`],
        ['The perimeter is the distance all the way round: add all four sides.',
          `Two sides are ${base} and two sides are ${ht}. So ${v} terms: ${a}${v} + ${a}${v} + ${U.term(c, v)} + ${U.term(c, v)}.`],
        `(${base}) + (${ht}) + (${base}) + (${ht}) = ${ans}.`,
        { visual: { type: 'shape2d', shape: 'rectangle', dims: { base, height: ht } } });
    };

    const expand = L => {
      const v = pick(['x', 'a', 'y', 'n']), k = R(2, 7), a = R(1, 5), b = R(1, 9), op = pick(['+', M]);
      const inside = `${U.term(a, v)} ${op} ${b}`, s = op === '+' ? 1 : -1;
      if (L === 3 && Math.random() < 0.5) {
        const c = R(1, 6);
        const ans = EX([[k * a + c, v], [s * k * b, '']]);
        return choice(`Expand and simplify ${k}(${inside}) + ${U.term(c, v)}`, ans,
          [EX([[k * a + c, v], [s * b, '']]), EX([[a + c, v], [s * k * b, '']]), EX([[k * a + c, v], [-s * k * b, '']])],
          ['Expand the bracket first: multiply **every** term inside by the number outside. Then collect like terms.',
            `${k}(${inside}) = ${EX([[k * a, v], [s * k * b, '']])}. Now add ${U.term(c, v)}.`],
          `${k}(${inside}) = ${EX([[k * a, v], [s * k * b, '']])}. Then ${U.term(k * a, v)} + ${U.term(c, v)} = ${U.term(k * a + c, v)}. Answer: ${ans}.`);
      }
      const ans = EX([[k * a, v], [s * k * b, '']]);
      return choice(`Expand ${k}(${inside})`, ans,
        [EX([[k * a, v], [s * b, '']]), EX([[k + a, v], [s * (k + b), '']]), EX([[k * a, v], [-s * k * b, '']])],
        ['Multiply **every** term inside the bracket by the number outside.', `${k} × ${U.term(a, v)} = ${U.term(k * a, v)}. Now multiply ${k} × ${b}.`],
        `${k} × ${U.term(a, v)} = ${U.term(k * a, v)} and ${k} × ${b} = ${k * b}. So ${k}(${inside}) = ${ans}.`);
    };

    PMLM.registerSkill({
      id: 'g7.expressions', grade: 7, unit: 'g7.u3', title: 'Simplifying expressions', icon: '🔤',
      blurb: 'Write expressions, collect like terms, expand brackets',
      lesson: [
        { title: 'Letters stand for numbers',
          text: 'In algebra a letter stands for an unknown number.\n3n means 3 × n.\nn + 5 means "5 more than n".\n{n/2} means n ÷ 2.\nIf n = 4, then 3n = 12 and n + 5 = 9.' },
        { title: 'Like terms',
          text: '**Like terms** have exactly the same letters: 3x and 5x are like terms.\nAdd or subtract the numbers in front:\n3x + 5x = 8x (not 8x^{2})\n7a − a = 6a (a means 1a)\n3x + 2y cannot be simplified: x and y are different.' },
        { title: 'Collecting like terms',
          text: 'Group the same letters. Each sign belongs to the term after it.\n5a + 3b − 2a + b\n= 5a − 2a + 3b + b\n= **3a + 4b**',
          visual: { type: 'table', headers: ['a terms', 'b terms'], rows: [['5a, −2a', '3b, +b'], ['= 3a', '= 4b']] } },
        { title: 'Expanding brackets',
          text: 'Multiply **every** term inside the bracket by the number outside.\n3(x + 4) = 3x + 12\n2(5y − 1) = 10y − 2\n**Careful:** 3(x + 4) is not 3x + 4.' },
        { title: 'Worked example',
          text: 'Simplify 4x + 7 − x + 2(x − 5).\n**1.** Expand: 2(x − 5) = 2x − 10.\n**2.** x terms: 4x − x + 2x = 5x.\n**3.** Numbers: 7 − 10 = −3.\nAnswer: **5x − 3**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [collect1, collect1, write, spot, collect2],
          [collect2, constants, write, spot, notEqual, perimeter, expand],
          [collect2, constants, expand, expand, perimeter, notEqual, write],
        ], ctx);
      },
    });
  }

  /* 13 ── Substitution into expressions and formulae */
  {
    const lin1 = L => {
      const v = pick(['x', 'n', 'a', 'y']), a = R(2, 9), b = R(1, 20), val = L === 3 ? -R(1, 6) : R(1, 10);
      const op = pick(['+', M]), ans = op === '+' ? a * val + b : a * val - b;
      return num(`Find the value of ${a}${v} ${op} ${b} when ${v} = ${F(val)}.`, ans,
        [`Replace ${v} with ${F(val)}. Remember ${a}${v} means ${a} × ${v}.`, `${a}${v} = ${a} × ${P(val)} = ${F(a * val)}. Now ${op === '+' ? 'add' : 'subtract'} ${b}.`],
        `${a} × ${P(val)} = ${F(a * val)}, then ${F(a * val)} ${op} ${b} = ${F(ans)}.`);
    };

    const two = L => {
      const [u, w] = pick(LETTERS);
      const a = R(2, 6), b = R(2, 6);
      const x = L === 3 ? R(-5, 6) : R(1, 8), y = L === 3 ? -R(1, 6) : R(1, 8);
      const op = pick(['+', M]), ans = op === '+' ? a * x + b * y : a * x - b * y;
      return num(`Find the value of ${a}${u} ${op} ${b}${w} when ${u} = ${F(x)} and ${w} = ${F(y)}.`, ans,
        ['Replace each letter with its number. Do the multiplying before the adding or subtracting.',
          `${a}${u} = ${a} × ${P(x)} = ${F(a * x)} and ${b}${w} = ${b} × ${P(y)} = ${F(b * y)}.`],
        `${F(a * x)} ${op} ${P(b * y)} = ${F(ans)}.`);
    };

    const squares = L => {
      const v = pick(['x', 'n', 'a']);
      const val = L === 3 ? -R(2, 6) : R(2, 9);
      if (Math.random() < 0.5) {
        const b = R(1, 20);
        return num(`Find the value of ${v}^{2} + ${b} when ${v} = ${F(val)}.`, val * val + b,
          [`${v}^{2} means ${v} × ${v}.${val < 0 ? ' A negative times a negative is positive.' : ''}`, `${v}^{2} = ${P(val)} × ${P(val)} = ${val * val}. Now add ${b}.`],
          `${P(val)}^{2} = ${val * val}, then ${val * val} + ${b} = ${val * val + b}.`);
      }
      const a = pick([2, 3, 4, 5].filter(x => x !== Math.abs(val)));
      return num(`Find the value of ${a}${v}^{2} when ${v} = ${F(val)}.`, a * val * val,
        [`${a}${v}^{2} means ${a} × ${v} × ${v}. Only the ${v} is squared, so square it first.`, `${v}^{2} = ${P(val)} × ${P(val)} = ${val * val}. Now multiply by ${a}.`],
        `${P(val)}^{2} = ${val * val}, then ${a} × ${val * val} = ${a * val * val}. (Not (${a} × ${P(val)})^{2}.)`);
    };

    const formula = (L, ctx) => {
      const t = R(1, 4);
      if (t === 1) {
        const f = R(2, 5), r = R(2, 4), d = R(3, 15);
        return num(`A taxi company uses the formula C = ${f} + ${r}d.\nC is the cost in ${ctx.currency} and d is the distance in km.\nFind C when d = ${d}.`, f + r * d,
          [`Replace d with ${d}. ${r}d means ${r} × d.`, `${r} × ${d} = ${r * d}. Now add ${f}.`],
          `C = ${f} + ${r} × ${d} = ${f} + ${r * d} = ${f + r * d}.`, { prefix: ctx.currency });
      }
      if (t === 2) {
        const l = R(4, 20), w = R(2, l - 1);
        return num(`The perimeter of a rectangle is P = 2l + 2w.\nFind P when l = ${l} cm and w = ${w} cm.`, 2 * l + 2 * w,
          ['Replace l and w with their numbers. Multiply before you add.', `2l = 2 × ${l} = ${2 * l}. Now work out 2w and add.`],
          `P = 2 × ${l} + 2 × ${w} = ${2 * l} + ${2 * w} = ${2 * l + 2 * w} cm.`,
          { unit: 'cm', visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `${l} cm`, height: `${w} cm` } } });
      }
      if (t === 3) {
        const u = R(0, 10), a = R(2, 5), tt = R(2, 8);
        return num(`Use the formula v = u + at.\nFind v when u = ${u}, a = ${a} and t = ${tt}.`, u + a * tt,
          ['at means a × t. Do the multiplying first.', `at = ${a} × ${tt} = ${a * tt}. Now add u.`],
          `v = ${u} + ${a} × ${tt} = ${u} + ${a * tt} = ${u + a * tt}.`);
      }
      const n = R(2, 5), c = R(4, 9) * 5;
      return num(`The time T, in minutes, to cook a chicken is T = 20n + ${c}, where n is its mass in kg.\nFind T when n = ${n}.`, 20 * n + c,
        ['Replace n with the mass. 20n means 20 × n.', `20 × ${n} = ${20 * n}. Now add ${c}.`],
        `T = 20 × ${n} + ${c} = ${20 * n} + ${c} = ${20 * n + c} minutes.`, { unit: 'minutes' });
    };

    const negatives = () => {
      const v = pick(['x', 'n', 'y']), k = R(2, 6), a = R(5, 20), b = R(2, 5);
      if (Math.random() < 0.5) {
        return num(`Find the value of ${a} ${M} ${b}${v} when ${v} = ${M}${k}.`, a + b * k,
          [`Replace ${v} with (${M}${k}). Then subtracting a negative is the same as adding.`, `${b}${v} = ${b} × (${M}${k}) = ${M}${b * k}. Now work out ${a} ${M} (${M}${b * k}).`],
          `${a} ${M} (${M}${b * k}) = ${a} + ${b * k} = ${a + b * k}.`);
      }
      const x = R(2, 9), y = -R(2, 9);
      return num(`Find the value of ${b}(x + y) when x = ${x} and y = ${F(y)}.`, b * (x + y),
        ['Brackets first: replace x and y, and add them. Then multiply.', `x + y = ${x} + (${F(y)}) = ${F(x + y)}.`],
        `x + y = ${F(x + y)}, then ${b} × ${P(x + y)} = ${F(b * (x + y))}.`);
    };

    const fracSub = () => {
      const c = pick([2, 3, 4, 5]), s = c * R(2, 8), x = R(1, s - 1), y = s - x;
      return num(`Find the value of {x + y/${c}} when x = ${x} and y = ${y}.`, s / c,
        ['The fraction line works like a bracket: work out the top first, then divide.', `x + y = ${x} + ${y} = ${s}. Now divide by ${c}.`],
        `(${x} + ${y}) ÷ ${c} = ${s} ÷ ${c} = ${s / c}.`);
    };

    const spot = () => {
      const who = U.name();
      if (Math.random() < 0.5) {
        const a = R(2, 9), v = R(2, 9);
        return num(`When x = ${v}, ${who} says ${a}x = ${a}${v}.\nWhat is the value of ${a}x when x = ${v}?`, a * v,
          [`${a}x means ${a} × x. It does not mean the digits ${a} and ${v} written next to each other.`, `Work out ${a} × ${v}.`],
          `${a}x = ${a} × ${v} = ${a * v}, not ${a}${v}.`);
      }
      const v = R(3, 9);
      return num(`When n = ${v}, ${who} says n^{2} = ${2 * v}.\nWhat is the value of n^{2} when n = ${v}?`, v * v,
        ['n^{2} means n × n, not n × 2.', `n^{2} = ${v} × ${v}.`],
        `n^{2} = ${v} × ${v} = ${v * v}. ${who} worked out ${v} × 2 instead.`);
    };

    PMLM.registerSkill({
      id: 'g7.substitution', grade: 7, unit: 'g7.u3', title: 'Substitution', icon: '🔁',
      blurb: 'Put numbers into expressions and formulae',
      lesson: [
        { title: 'Swap letters for numbers',
          text: '**Substitute** means replace each letter with its number.\nIf x = 4:\n3x + 2 = 3 × 4 + 2 = 14\n**Careful:** 3x is 3 × 4 = 12, not 34.' },
        { title: 'Order of operations still counts',
          text: 'If a = 5 and b = 2:\na^{2} = 5 × 5 = 25\n2a^{2} = 2 × 25 = 50 (square first, then multiply)\n{a + b/7} = 7 ÷ 7 = 1 (the top first)' },
        { title: 'Formulae',
          text: 'A formula is a rule linking quantities.\nPerimeter of a rectangle: P = 2l + 2w\nWhen l = 6 and w = 3: P = 12 + 6 = 18.',
          visual: { type: 'shape2d', shape: 'rectangle', dims: { base: 'l = 6', height: 'w = 3' } } },
        { title: 'Negative numbers',
          text: 'Put negative numbers in brackets so you don\'t lose the sign.\nIf x = −3:\n2x = 2 × (−3) = −6\nx^{2} = (−3) × (−3) = 9\n10 − x = 10 − (−3) = 13' },
        { title: 'Worked example',
          text: 'Find 5 + 3n when n = −4.\n**1.** Replace n: 5 + 3 × (−4).\n**2.** Multiply first: 3 × (−4) = −12.\n**3.** Add: 5 + (−12) = 5 − 12 = −7.\nAnswer: **−7**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [lin1, lin1, two, formula, spot],
          [lin1, two, squares, formula, fracSub, spot],
          [lin1, two, squares, negatives, negatives, formula, fracSub],
        ], ctx);
      },
    });
  }

  /* 14 ── Solving one- and two-step linear equations */
  {
    const V = () => pick(['x', 'n', 'a', 'y', 'm']);
    const bal = (l, r) => ({ type: 'balance', left: l, right: r });
    const SAME = 'Do the same to both sides to keep the balance. Use inverse operations to get the letter on its own.';

    const oneStep = () => {
      const v = V(), t = R(1, 4);
      if (t === 1) {
        const x = R(2, 15), a = R(2, 20), b = x + a;
        return num(`Solve ${v} + ${a} = ${b}`, x, [`${SAME} The inverse of + ${a} is − ${a}.`, `Subtract ${a} from both sides: ${v} = ${b} ${M} ${a}.`],
          `${v} = ${b} ${M} ${a} = ${x}. Check: ${x} + ${a} = ${b}.`, { prefix: `${v} = `, visual: bal(`${v} + ${a}`, `${b}`) });
      }
      if (t === 2) {
        const a = R(2, 12), b = R(1, 15), x = a + b;
        return num(`Solve ${v} ${M} ${a} = ${b}`, x, [`${SAME} The inverse of − ${a} is + ${a}.`, `Add ${a} to both sides: ${v} = ${b} + ${a}.`],
          `${v} = ${b} + ${a} = ${x}. Check: ${x} ${M} ${a} = ${b}.`, { prefix: `${v} = `, visual: bal(`${v} ${M} ${a}`, `${b}`) });
      }
      if (t === 3) {
        const a = R(2, 9), x = R(2, 12), b = a * x;
        return num(`Solve ${a}${v} = ${b}`, x, [`${SAME} ${a}${v} means ${a} × ${v}, so divide.`, `Divide both sides by ${a}: ${v} = ${b} ÷ ${a}.`],
          `${v} = ${b} ÷ ${a} = ${x}. Check: ${a} × ${x} = ${b}.`, { prefix: `${v} = `, visual: bal(`${a}${v}`, `${b}`) });
      }
      const a = R(2, 6), b = R(2, 10), x = a * b;
      return num(`Solve ${fr(v, a)} = ${b}`, x, [`${SAME} ${fr(v, a)} means ${v} ÷ ${a}, so multiply.`, `Multiply both sides by ${a}: ${v} = ${b} × ${a}.`],
        `${v} = ${b} × ${a} = ${x}. Check: ${x} ÷ ${a} = ${b}.`, { prefix: `${v} = `, visual: bal(`${v} ÷ ${a}`, `${b}`) });
    };

    const twoStep = L => {
      const v = V(), a = R(2, 9), b = R(1, 20), op = pick(['+', M]);
      const x = L === 3 ? nz(-6, 12) : R(1, 12), c = op === '+' ? a * x + b : a * x - b;
      const lhs = `${a}${v} ${op} ${b}`;
      return num(`Solve ${lhs} = ${F(c)}`, x,
        [`Undo the ${op} ${b} first, then undo the × ${a}.`,
          `${op === '+' ? 'Subtract' : 'Add'} ${b} on both sides: ${a}${v} = ${F(c)} ${op === '+' ? M : '+'} ${b} = ${F(a * x)}.`],
        `${a}${v} = ${F(a * x)}, so ${v} = ${F(a * x)} ÷ ${a} = ${F(x)}. Check: ${a} × ${P(x)} ${op} ${b} = ${F(c)}.`,
        { prefix: `${v} = `, visual: bal(lhs, F(c)) });
    };

    const bracketEq = () => {
      const v = V(), a = R(2, 6), b = R(1, 9), x = retry(() => { const x = nz(-5, 10); return x + b !== 0 ? x : null; }), c = a * (x + b);
      return num(`Solve ${a}(${v} + ${b}) = ${F(c)}`, x,
        ['Divide both sides by the number outside the bracket first. (Or expand the bracket.)',
          `Divide both sides by ${a}: ${v} + ${b} = ${F(c)} ÷ ${a} = ${F(x + b)}.`],
        `${v} + ${b} = ${F(x + b)}, so ${v} = ${F(x + b)} ${M} ${b} = ${F(x)}.`,
        { prefix: `${v} = `, visual: bal(`${a}(${v} + ${b})`, F(c)) });
    };

    const think = L => {
      const a = R(2, 9), b = R(1, 20), x = R(2, L === 3 ? 20 : 12), op = pick(['+', M]);
      const c = op === '+' ? a * x + b : a * x - b;
      if (c <= 0) return think(L);
      return num(`I think of a number. I multiply it by ${a}, then I ${op === '+' ? 'add' : 'subtract'} ${b}.\nThe answer is ${c}. What was my number?`, x,
        ['Write an equation using n for the number. Then solve it.',
          `${a}n ${op} ${b} = ${c}, so ${a}n = ${c} ${op === '+' ? M : '+'} ${b} = ${a * x}.`],
        `${a}n = ${a * x}, so n = ${a * x} ÷ ${a} = ${x}. Check: ${x} × ${a} ${op} ${b} = ${c}.`);
    };

    const spot = () => {
      const a = R(2, 9), b = R(2, 15), x = R(2, 12), c = a * x + b, who = U.name();
      return num(`${who} is solving ${a}x + ${b} = ${c}.\nThe first line of the working says ${a}x = ${c + b}.\nWhat is the correct value of x?`, x,
        [`${who} added ${b} to both sides. To undo + ${b} you must subtract ${b}.`, `${a}x = ${c} ${M} ${b} = ${a * x}.`],
        `${a}x = ${c} ${M} ${b} = ${a * x}, so x = ${a * x} ÷ ${a} = ${x}.`);
    };

    const perimeterEq = () => {
      const v = pick(['x', 'a', 'y']), a = R(2, 4), b = R(1, 6), x = R(2, 9);
      const P_ = 2 * (a * x + b) + 2 * x;
      const base = EX([[a, v], [b, '']]);
      return num(`The perimeter of this rectangle is ${P_} cm.\nFind the value of ${v}.`, x,
        ['Add all four sides to make an expression for the perimeter. Set it equal to the perimeter and solve.',
          `Perimeter = 2(${base}) + 2${v} = ${EX([[2 * a + 2, v], [2 * b, '']])}. So ${EX([[2 * a + 2, v], [2 * b, '']])} = ${P_}.`],
        `${2 * a + 2}${v} = ${P_} ${M} ${2 * b} = ${P_ - 2 * b}, so ${v} = ${P_ - 2 * b} ÷ ${2 * a + 2} = ${x}.`,
        { prefix: `${v} = `, visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `(${base}) cm`, height: `${v} cm` } } });
    };

    const writeEq = () => {
      const a = R(2, 9), b = R(1, 12), c = R(b + 2, 40);
      return choice(`Which equation matches this sentence?\n"${a} times a number, minus ${b}, equals ${c}."`, `${a}n ${M} ${b} = ${c}`,
        [`${a}(n ${M} ${b}) = ${c}`, `${b} ${M} ${a}n = ${c}`, `${a}n + ${b} = ${c}`, `n ${M} ${a * b} = ${c}`],
        ['Use n for the number and follow the words in order.', `"${a} times a number" is ${a}n. What happens next?`],
        `${a} times n is ${a}n. Minus ${b} gives ${a}n ${M} ${b}. So the equation is ${a}n ${M} ${b} = ${c}.`);
    };

    PMLM.registerSkill({
      id: 'g7.equations', grade: 7, unit: 'g7.u3', title: 'Solving equations', icon: '⚖️',
      blurb: 'Solve one- and two-step equations with a balance',
      lesson: [
        { title: 'An equation is a balance',
          text: 'x + 5 = 12 means both sides weigh the same.\nTo find x, keep the balance level: whatever you do to one side, do to the other.\nTake 5 from both sides: x = 7.',
          visual: { type: 'balance', left: 'x + 5', right: '12' } },
        { title: 'Inverse operations',
          text: 'Undo each operation with its opposite:\n+ ↔ −\n× ↔ ÷\n4x = 20 → divide both sides by 4 → x = 5\n{x/3} = 6 → multiply both sides by 3 → x = 18' },
        { title: 'Two-step equations',
          text: 'Undo the + or − first, then the × or ÷.\n3x + 4 = 19\nSubtract 4: 3x = 15\nDivide by 3: x = 5',
          visual: { type: 'balance', left: '3x + 4', right: '19' } },
        { title: 'Check your answer',
          text: 'Put your answer back into the equation.\nx = 5: 3 × 5 + 4 = 19 ✓\nIf both sides match, you are right.' },
        { title: 'Worked example',
          text: 'Solve 5x − 7 = 18.\n**1.** Undo the − 7: add 7 to both sides. 5x = 25.\n**2.** Undo the × 5: divide both sides by 5. x = 5.\n**3.** Check: 5 × 5 − 7 = 18 ✓\nAnswer: **x = 5**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [oneStep, oneStep, oneStep, twoStep, think],
          [twoStep, twoStep, oneStep, think, spot, writeEq],
          [twoStep, twoStep, bracketEq, think, spot, perimeterEq],
        ], ctx);
      },
    });
  }

  /* 15 ── Sequences: term-to-term and position-to-term */
  {
    const seqVis = (terms, hideIdx) => ({ type: 'sequence', terms: terms.map((t, i) => (i === hideIdx ? '?' : F(t))) });

    const arith = L => {
      const d = L === 1 ? R(2, 9) * (Math.random() < 0.7 ? 1 : -1) : nz(-9, 12);
      const a = L === 1 ? (d > 0 ? R(1, 20) : R(40, 60)) : R(-10, 25);
      return { a, d, terms: [0, 1, 2, 3, 4].map(i => a + i * d) };
    };

    const nextTerm = L => {
      if (L === 3 && Math.random() < 0.4) {
        const r = pick([2, 3]), a = R(1, 5), terms = [0, 1, 2, 3, 4].map(i => a * Math.pow(r, i));
        return num(`What is the next term in this sequence?\n${terms.slice(0, 4).map(t => F(t)).join(', ')}, …`, terms[4],
          ['Look at how you get from one term to the next. Is it adding the same amount each time, or multiplying?',
            `${F(terms[1])} ÷ ${F(terms[0])} = ${r} and ${F(terms[2])} ÷ ${F(terms[1])} = ${r}. So the rule is "multiply by ${r}".`],
          `The rule is "multiply by ${r}": ${F(terms[3])} × ${r} = ${F(terms[4])}.`, { visual: seqVis(terms, 4) });
      }
      const { d, terms } = arith(L);
      return num(`What is the next term in this sequence?\n${terms.slice(0, 4).map(t => F(t)).join(', ')}, …`, terms[4],
        ['Find the difference between neighbouring terms. That gives the term-to-term rule.',
          `${F(terms[1])} ${M} ${P(terms[0])} = ${F(d)}. So the rule is "${d > 0 ? 'add' : 'subtract'} ${A(d)}".`],
        `The rule is "${d > 0 ? 'add' : 'subtract'} ${A(d)}": ${F(terms[3])} ${d > 0 ? '+' : M} ${A(d)} = ${F(terms[4])}.`, { visual: seqVis(terms, 4) });
    };

    const missingMid = L => {
      const { d, terms } = arith(L);
      const k = R(1, 2);
      return num(`Find the missing term.\n${terms.slice(0, 4).map((t, i) => (i === k ? '□' : F(t))).join(', ')}`, terms[k],
        ['The terms go up or down by the same amount each time. Use the terms you know to find that amount.',
          `From ${F(terms[k === 1 ? 2 : 0])} to ${F(terms[k === 1 ? 3 : 1])} the change is ${d > 0 ? '+' : M}${A(d)}.`],
        `The rule is "${d > 0 ? 'add' : 'subtract'} ${A(d)}", so the missing term is ${F(terms[k])}.`, { visual: seqVis(terms.slice(0, 4), k) });
    };

    const ruleChoice = L => {
      if (L >= 2 && Math.random() < 0.4) {
        const r = pick([2, 3]), a = R(2, 6), t = [0, 1, 2, 3].map(i => a * Math.pow(r, i));
        return choice(`What is the term-to-term rule?\n${t.map(t => F(t)).join(', ')}, …`, `Multiply by ${r}`,
          [`Add ${t[1] - t[0]}`, `Add ${r}`, `Multiply by ${r + 1}`],
          ['Check your rule works for **every** step, not just the first one.', `${t[0]} + ${t[1] - t[0]} = ${t[1]}, but does ${t[1]} + ${t[1] - t[0]} make ${t[2]}?`],
          `Each term is ${r} times the one before: ${t[0]} × ${r} = ${t[1]}, ${t[1]} × ${r} = ${t[2]}. The rule is "multiply by ${r}".`);
      }
      const { d, terms } = arith(1);
      const ad = Math.abs(d), ans = d > 0 ? `Add ${ad}` : `Subtract ${ad}`;
      return choice(`What is the term-to-term rule?\n${terms.slice(0, 4).map(t => F(t)).join(', ')}, …`, ans,
        [d > 0 ? `Subtract ${ad}` : `Add ${ad}`, `Multiply by ${ad}`, `${d > 0 ? 'Add' : 'Subtract'} ${ad + 1}`, `Add ${F(terms[0])}`],
        ['Find the difference between neighbouring terms. Are the terms going up or down?', `Work out ${F(terms[1])} ${M} ${P(terms[0])}.`],
        `${F(terms[1])} ${M} ${P(terms[0])} = ${F(d)}. The terms go ${d > 0 ? 'up' : 'down'} by ${ad} each time, so the rule is "${ans.toLowerCase()}".`);
    };

    const nthTerm = L => {
      const a = R(2, 9), b = L === 3 ? nz(-9, 9) : R(1, 9), k = R(L === 1 ? 5 : 10, L === 1 ? 10 : 50);
      const rule = EX([[a, 'n'], [b, '']]), t = [1, 2, 3].map(n => a * n + b);
      return num(`The nth term of a sequence is ${rule}.\nFind the ${U.ord(k)} term.`, a * k + b,
        [`The nth term is a position-to-term rule. Replace n with the position, ${k}.`, `${a} × ${k} = ${a * k}. Now ${b > 0 ? 'add' : 'subtract'} ${A(b)}.`],
        `${a} × ${k} ${b > 0 ? '+' : M} ${A(b)} = ${a * k + b}, so the ${U.ord(k)} term is ${a * k + b}.`,
        { visual: { type: 'table', headers: ['Position (n)', '1', '2', '3', String(k)], rows: [['Term', F(t[0]), F(t[1]), F(t[2]), '?']] } });
    };

    const whichNth = () => {
      const a = R(2, 9), b = nz(-6, 9), t = [1, 2, 3, 4].map(n => a * n + b);
      const ans = EX([[a, 'n'], [b, '']]);
      return choice(`Which is the nth term of this sequence?\n${t.map(t => F(t)).join(', ')}, …`, ans,
        [`n + ${a}`, EX([[a, 'n'], [t[0], '']]), EX([[b, 'n'], [a, '']]), EX([[a, 'n'], [-b, '']])],
        [`The terms go up by ${a} each time, so the rule starts with ${a}n (the ${a} times table).`,
          `When n = 1, ${a}n = ${a}. The first term is ${F(t[0])}. What do you add to (or subtract from) ${a} to get ${F(t[0])}?`],
        `The difference is ${a}, so use ${a}n. ${a} × 1 ${b > 0 ? '+' : M} ${A(b)} = ${F(t[0])}, so the nth term is ${ans}.`);
    };

    const termNumber = () => {
      const a = R(2, 9), b = R(1, 9), k = R(8, 30), T = a * k + b;
      const rule = EX([[a, 'n'], [b, '']]);
      return num(`The nth term of a sequence is ${rule}.\nWhich term is equal to ${T}?`, k,
        [`Make an equation: ${rule} = ${T}. Solve it to find n.`, `${a}n = ${T} ${M} ${b} = ${a * k}.`],
        `${a}n = ${a * k}, so n = ${a * k} ÷ ${a} = ${k}. It is the ${U.ord(k)} term.`);
    };

    const pattern = L => {
      const p = R(3, 8), d = R(2, 6), k = R(L === 3 ? 10 : 5, L === 3 ? 30 : 12);
      const ans = p + (k - 1) * d;
      return num(`Pattern 1 uses ${p} matchsticks. Each new pattern uses ${d} more matchsticks than the one before.\nHow many matchsticks are in pattern ${k}?`, ans,
        [`From pattern 1 to pattern ${k}, how many times do you add ${d}?`, `${k} ${M} 1 = ${k - 1} steps of ${d}: ${k - 1} × ${d} = ${(k - 1) * d}. Now add the first pattern.`],
        `${p} + ${k - 1} × ${d} = ${p} + ${(k - 1) * d} = ${ans} matchsticks.`,
        { unit: 'matchsticks', visual: { type: 'table', headers: ['Pattern', '1', '2', '3'], rows: [['Matchsticks', p, p + d, p + 2 * d]] } });
    };

    PMLM.registerSkill({
      id: 'g7.sequences', grade: 7, unit: 'g7.u3', title: 'Sequences', icon: '🔢',
      blurb: 'Term-to-term rules and nth term rules',
      lesson: [
        { title: 'Term-to-term rules',
          text: 'A sequence is a list of numbers that follows a rule.\nThe **term-to-term rule** tells you how to get from one term to the next.\n3, 7, 11, 15, … The rule is "add 4".',
          visual: { type: 'sequence', terms: ['3', '7', '11', '15', '?'], step: '+4' } },
        { title: 'Going down or multiplying',
          text: '20, 17, 14, 11, … rule "subtract 3". It can go below zero: 2, −1, −4.\n2, 6, 18, 54, … rule "multiply by 3".\n**Tip:** check the rule works for every step.' },
        { title: 'Position-to-term rules',
          text: 'The **nth term** links a term to its position n.\nFor 3n + 2:\nn = 1 → 3 × 1 + 2 = 5\nn = 2 → 3 × 2 + 2 = 8\nn = 10 → 3 × 10 + 2 = 32',
          visual: { type: 'table', headers: ['Position (n)', '1', '2', '3', '10'], rows: [['3n + 2', '5', '8', '11', '32']] } },
        { title: 'Finding the nth term',
          text: '5, 8, 11, 14, … goes up by 3, so it is linked to the 3 times table: 3n.\n3n gives 3, 6, 9, 12. Each term here is 2 more.\nSo the nth term is **3n + 2**.' },
        { title: 'Worked example',
          text: 'Find the 20th term of 4, 9, 14, 19, …\n**1.** It goes up by 5, so start with 5n.\n**2.** 5n gives 5, 10, 15, … Each term is 1 less, so the nth term is 5n − 1.\n**3.** n = 20: 5 × 20 − 1 = 99.\nAnswer: **99**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [nextTerm, nextTerm, missingMid, ruleChoice, nthTerm, pattern],
          [nextTerm, missingMid, ruleChoice, nthTerm, nthTerm, pattern, whichNth],
          [nextTerm, nthTerm, whichNth, whichNth, termNumber, pattern, ruleChoice],
        ], ctx);
      },
    });
  }

  /* 16 ── Function machines */
  {
    const OPS = {
      '+': k => ({ s: `+ ${k}`, f: x => x + k, inv: y => y - k, invS: `${M} ${k}` }),
      '−': k => ({ s: `${M} ${k}`, f: x => x - k, inv: y => y + k, invS: `+ ${k}` }),
      '×': k => ({ s: `× ${k}`, f: x => x * k, inv: y => y / k, invS: `÷ ${k}` }),
      '÷': k => ({ s: `÷ ${k}`, f: x => x / k, inv: y => y * k, invS: `× ${k}` }),
    };
    const mkOp = (sym, L) => OPS[sym](sym === '×' || sym === '÷' ? R(2, L === 1 ? 5 : 9) : R(1, L === 1 ? 10 : 20));
    const vis = (inp, ops, out) => ({ type: 'sequence', terms: [String(inp), ...ops.map(o => o.s), String(out)] });

    // a valid input for these ops (whole numbers all the way, no negatives below L3)
    const makeMachine = (L, n) => retry(() => {
      const syms = n === 1 ? [pick(['+', '−', '×', '÷'])] : [pick(['×', '×', '÷']), pick(['+', '−'])];
      const ops = syms.map(s => mkOp(s, L));
      const x = syms[0] === '÷' ? ops[0].inv(R(1, 12)) : R(L === 3 ? -5 : 1, 15);
      let v = x;
      const mids = [];
      for (const o of ops) { v = o.f(v); mids.push(v); if (!Number.isInteger(v) || (L < 3 && v <= 0)) return null; }
      return { ops, x, y: v, mids };
    });

    const output = L => {
      const { ops, x, y, mids } = makeMachine(L, L === 1 && Math.random() < 0.5 ? 1 : 2);
      return num(`What is the output of this function machine?`, y,
        ['Put the input in and do each step in order, from left to right.',
          ops.length === 1 ? `Work out ${F(x)} ${ops[0].s}.` : `First step: ${F(x)} ${ops[0].s} = ${F(mids[0])}. Now do the second step.`],
        `${ops.map((o, i) => `${F(i ? mids[i - 1] : x)} ${o.s} = ${F(mids[i])}`).join(', then ')}. The output is ${F(y)}.`,
        { visual: vis(F(x), ops, '?') });
    };

    const input = L => {
      const { ops, x, y, mids } = makeMachine(L, 2);
      return num(`The output of this function machine is ${F(y)}.\nWhat was the input?`, x,
        ['Work backwards from the output. Use the inverse of each step, in reverse order.',
          `Undo the last step (${ops[1].s}) with ${ops[1].invS}: ${F(y)} ${ops[1].invS} = ${F(mids[0])}. Now undo the first step.`],
        `${F(y)} ${ops[1].invS} = ${F(mids[0])}, then ${F(mids[0])} ${ops[0].invS} = ${F(x)}. The input was ${F(x)}.`,
        { visual: vis('?', ops, F(y)) });
    };

    const table = L => {
      const a = R(2, 6), b = R(1, 9), sub = Math.random() < 0.4;
      const f = x => (sub ? a * x - b : a * x + b);
      const ops = [OPS['×'](a), sub ? OPS['−'](b) : OPS['+'](b)];
      const ins = [1, 2, 3, R(5, 12)];
      const k = R(0, 3), missOut = Math.random() < 0.6;
      const rows = ins.map((x, i) => (i === k ? (missOut ? [String(x), '?'] : ['?', F(f(x))]) : [String(x), F(f(x))]));
      if (missOut) {
        return num(`The function machine is: input → ${ops[0].s} → ${ops[1].s} → output.\nFind the missing output in the table.`, f(ins[k]),
          ['Put the input through each step of the machine, in order.', `${ins[k]} ${ops[0].s} = ${a * ins[k]}. Now do ${ops[1].s}.`],
          `${ins[k]} ${ops[0].s} = ${a * ins[k]}, then ${ops[1].s} gives ${F(f(ins[k]))}.`,
          { visual: { type: 'table', headers: ['Input', 'Output'], rows } });
      }
      const y = f(ins[k]);
      return num(`The function machine is: input → ${ops[0].s} → ${ops[1].s} → output.\nFind the missing input in the table.`, ins[k],
        ['Work backwards: undo the last step first, then the first step.', `${F(y)} ${ops[1].invS} = ${F(a * ins[k])}. Now undo ${ops[0].s}.`],
        `${F(y)} ${ops[1].invS} = ${a * ins[k]}, then ${a * ins[k]} ÷ ${a} = ${ins[k]}.`,
        { visual: { type: 'table', headers: ['Input', 'Output'], rows } });
    };

    const ruleStr = (m, c) => (c === 0 ? `× ${m}` : `× ${m} then ${c > 0 ? '+' : M} ${Math.abs(c)}`);
    const findRule = () => {
      const a = R(2, 6), b = R(1, 9), ins = U.sample([1, 2, 3, 4, 5, 10], 3).sort((p, q) => p - q);
      const f = x => a * x + b, outs = ins.map(f);
      const ans = ruleStr(a, b);
      const cands = [[a + 1, b - ins[0]], [a, b + 1], [a - 1, b + ins[0]], [1, outs[0] - ins[0]], [a + 1, b]]
        .filter(([m, c]) => m >= 1 && !ins.every((x, i) => m * x + c === outs[i]))
        .map(([m, c]) => (m === 1 ? `+ ${c}` : ruleStr(m, c)));
      return choice('Which rule does this function machine use?', ans, cands,
        ['A rule must work for **every** row of the table, not just the first.',
          `Look at how much the output goes up when the input goes up by 1. Try each rule on the input ${ins[1]}.`],
        `${ans}: ${ins.map((x, i) => `${x} → ${outs[i]}`).join(', ')}. It works for every row.`,
        { visual: { type: 'table', headers: ['Input', 'Output'], rows: ins.map((x, i) => [String(x), String(outs[i])]) } });
    };

    const asEquation = () => {
      const a = R(2, 9), b = R(1, 12), sub = Math.random() < 0.4;
      const ans = `y = ${a}x ${sub ? M : '+'} ${b}`;
      return choice(`A function machine takes an input x, does ${'× ' + a}, then ${sub ? `${M} ${b}` : `+ ${b}`}. The output is y.\nWhich equation shows this function?`, ans,
        [`y = ${a}(x ${sub ? M : '+'} ${b})`, `y = x ${sub ? M : '+'} ${a * b}`, `y = ${b}x ${sub ? M : '+'} ${a}`, `y = x + ${a} ${sub ? M : '+'} ${b}`],
        ['Follow the machine in order: start with x, do the first step, then the second step.', `After the first step you have ${a}x. What does the second step do to it?`],
        `x × ${a} = ${a}x, then ${sub ? `${M} ${b}` : `+ ${b}`} gives ${a}x ${sub ? M : '+'} ${b}. So ${ans}.`);
    };

    PMLM.registerSkill({
      id: 'g7.functions', grade: 7, unit: 'g7.u3', title: 'Function machines', icon: '⚙️',
      blurb: 'Find outputs and inputs, and spot the rule',
      lesson: [
        { title: 'Input → rule → output',
          text: 'A function machine does the same thing to every input.\nInput 4 → × 3 → + 2 → output 14.\nEach input gives exactly **one** output.',
          visual: { type: 'sequence', terms: ['4', '× 3', '+ 2', '14'] } },
        { title: 'Working backwards',
          text: 'To find the input, start at the output and use **inverse operations** in reverse order.\nOutput 20 ← × 3 ← + 2: undo + 2 first (20 − 2 = 18), then undo × 3 (18 ÷ 3 = 6). Input = 6.',
          visual: { type: 'sequence', terms: ['?', '× 3', '+ 2', '20'] } },
        { title: 'Tables of values',
          text: 'Input → × 2 → + 1 → output',
          visual: { type: 'table', headers: ['Input', 'Output'], rows: [['1', '3'], ['2', '5'], ['3', '7'], ['10', '21']] } },
        { title: 'Machines as equations',
          text: 'If the input is x and the output is y:\nx → × 2 → + 1 → y\nis the same as **y = 2x + 1**.\nThe output goes up by 2 each time the input goes up by 1.' },
        { title: 'Worked example',
          text: 'Machine: × 4 then − 3. The output is 25. Find the input.\n**1.** Undo the last step, − 3: 25 + 3 = 28.\n**2.** Undo × 4: 28 ÷ 4 = 7.\n**3.** Check: 7 × 4 − 3 = 25 ✓\nAnswer: **7**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [output, output, output, input, table],
          [output, input, input, table, table, findRule],
          [input, table, findRule, findRule, asEquation, output],
        ], ctx);
      },
    });
  }

  /* 17 ── Coordinates in four quadrants and straight lines */
  {
    const lr = x => (x > 0 ? 'right' : 'left'), ud = y => (y > 0 ? 'up' : 'down');
    const sq = n => `${Math.abs(n)} square${Math.abs(n) === 1 ? '' : 's'}`;
    const pt = (lo, hi, allowZero) => (allowZero ? R(lo, hi) : nz(lo, hi));

    const readPoint = L => {
      const [x, y] = retry(() => {
        const x = L === 1 ? R(1, 5) * (Math.random() < 0.6 ? 1 : -1) : pt(-5, 5, L === 3), y = L === 1 ? R(1, 5) * (Math.random() < 0.6 ? 1 : -1) : pt(-5, 5, L === 3);
        return x === 0 && y === 0 ? null : [x, y];
      });
      const lab = pick(['A', 'B', 'P', 'Q']);
      return {
        q: `What are the coordinates of point ${lab}?`, kind: 'coord', answer: [x, y],
        hints: ['The x-coordinate (across) comes first, then the y-coordinate (up or down). "Along the corridor, then up the stairs."',
          x === 0 ? `${lab} is on the y-axis, so its x-coordinate is 0.` : `Start at (0, 0). ${lab} is ${sq(x)} to the ${lr(x)}, so x = ${F(x)}.`],
        explain: `${lab} is ${x === 0 ? 'on the y-axis' : `${sq(x)} ${lr(x)}`} and ${y === 0 ? 'on the x-axis' : `${sq(y)} ${ud(y)}`}, so ${lab} = ${coordS(x, y)}.`,
        visual: { type: 'grid', points: [{ x, y, label: lab }] },
      };
    };

    const whichPoint = () => {
      const [x, y] = retry(() => { const x = nz(-5, 5), y = nz(-5, 5); return Math.abs(x) !== Math.abs(y) ? [x, y] : null; });
      const pts = U.shuffle([[x, y], [y, x], [-x, y], [x, -y]]);
      const labels = ['A', 'B', 'C', 'D'];
      const k = pts.findIndex(p => p[0] === x && p[1] === y);
      return choice(`Which point is at ${coordS(x, y)}?`, labels[k], labels.filter((l, i) => i !== k),
        ['The first number is x: go left or right. The second number is y: go up or down.', `x = ${F(x)}, so go ${sq(x)} to the ${lr(x)} first.`],
        `${coordS(x, y)}: ${sq(x)} ${lr(x)}, then ${sq(y)} ${ud(y)}. That is point ${labels[k]}.`,
        { visual: { type: 'grid', points: pts.map((p, i) => ({ x: p[0], y: p[1], label: labels[i] })) } });
    };

    const complete = () => {
      const [x1, x2, y1, y2] = retry(() => {
        const x1 = R(-5, 3), x2 = R(x1 + 2, 5), y1 = R(-5, 3), y2 = R(y1 + 2, 5);
        return (x1 < 0 || y1 < 0) ? [x1, x2, y1, y2] : null;
      });
      const flip = Math.random() < 0.5;
      const A = [x1, flip ? y2 : y1], B = [x2, flip ? y2 : y1], C = [x2, flip ? y1 : y2], D = [x1, flip ? y1 : y2];
      return {
        q: `A, B and C are three corners of a rectangle ABCD.\nWhat are the coordinates of D?`, kind: 'coord', answer: D,
        hints: ['D lines up with A in one direction and with C in the other.', `D is directly ${D[1] > A[1] ? 'above' : 'below'} A, so its x-coordinate is ${F(D[0])}, the same as A.`],
        explain: `D has the same x-coordinate as A (${F(A[0])}) and the same y-coordinate as C (${F(C[1])}), so D = ${coordS(D[0], D[1])}.`,
        visual: { type: 'grid', points: [{ x: A[0], y: A[1], label: 'A' }, { x: B[0], y: B[1], label: 'B' }, { x: C[0], y: C[1], label: 'C' }], segments: [{ x1: A[0], y1: A[1], x2: B[0], y2: B[1] }, { x1: B[0], y1: B[1], x2: C[0], y2: C[1] }] },
      };
    };

    const lineEq = L => {
      const t = pick(L === 3 ? ['v', 'h', 'd', 'n'] : ['v', 'h', 'd']);
      const a = nz(-4, 4);
      if (t === 'v') {
        return choice('What is the equation of the line?', `x = ${F(a)}`, [`y = ${F(a)}`, `x = ${F(-a)}`, 'y = x'],
          ['Read the coordinates of some points on the line. Which coordinate stays the same?', `The points (${F(a)}, 1), (${F(a)}, 2) and (${F(a)}, ${M}3) are all on the line.`],
          `Every point on the line has x-coordinate ${F(a)}, so the line is x = ${F(a)}. It is vertical (parallel to the y-axis).`,
          { visual: { type: 'grid', segments: [{ x1: a, y1: -5, x2: a, y2: 5 }] } });
      }
      if (t === 'h') {
        return choice('What is the equation of the line?', `y = ${F(a)}`, [`x = ${F(a)}`, `y = ${F(-a)}`, 'y = x'],
          ['Read the coordinates of some points on the line. Which coordinate stays the same?', `The points (1, ${F(a)}), (2, ${F(a)}) and (${M}3, ${F(a)}) are all on the line.`],
          `Every point on the line has y-coordinate ${F(a)}, so the line is y = ${F(a)}. It is horizontal (parallel to the x-axis).`,
          { visual: { type: 'grid', lines: [{ m: 0, c: a }] } });
      }
      const m = t === 'd' ? 1 : -1;
      return choice('What is the equation of the line?', m === 1 ? 'y = x' : `y = ${M}x`, [m === 1 ? `y = ${M}x` : 'y = x', 'x = 0', 'y = 0', `x = ${F(a)}`],
        ['Read the coordinates of some points on the line. How is y linked to x?', `The points (1, ${F(m)}), (2, ${F(2 * m)}) and (3, ${F(3 * m)}) are on the line.`],
        `For every point on the line, y ${m === 1 ? 'is the same as x' : 'is the negative of x'}, so the line is ${m === 1 ? 'y = x' : `y = ${M}x`}.`,
        { visual: { type: 'grid', lines: [{ m, c: 0 }] } });
    };

    const onLine = () => {
      const t = pick(['x', 'y', 'd']), a = nz(-5, 5);
      if (t === 'd') {
        const k = nz(-5, 5);
        return choice('Which point lies on the line y = x?', coordS(k, k), [coordS(k, -k), coordS(k, k + 1), coordS(0, k)],
          ['On the line y = x, the y-coordinate is always equal to the x-coordinate.', 'Check each point: is the second number the same as the first?'],
          `${coordS(k, k)} has y = x, so it lies on the line y = x.`);
      }
      const k = retry(() => { const k = nz(-5, 5); return Math.abs(k) !== Math.abs(a) ? k : null; });
      if (t === 'x') {
        return choice(`Which point lies on the line x = ${F(a)}?`, coordS(a, k), [coordS(k, a), coordS(-a, k), coordS(k, -a)],
          [`Every point on the line x = ${F(a)} has x-coordinate ${F(a)}.`, 'The x-coordinate is the **first** number. Check each point.'],
          `${coordS(a, k)} has x-coordinate ${F(a)}, so it lies on x = ${F(a)}.`);
      }
      return choice(`Which point lies on the line y = ${F(a)}?`, coordS(k, a), [coordS(a, k), coordS(k, -a), coordS(-a, k)],
        [`Every point on the line y = ${F(a)} has y-coordinate ${F(a)}.`, 'The y-coordinate is the **second** number. Check each point.'],
        `${coordS(k, a)} has y-coordinate ${F(a)}, so it lies on y = ${F(a)}.`);
    };

    const cross = () => {
      const a = nz(-5, 5), b = nz(-5, 5);
      return {
        q: `Where do the lines x = ${F(a)} and y = ${F(b)} cross?`, kind: 'coord', answer: [a, b],
        hints: [`Every point on x = ${F(a)} has x-coordinate ${F(a)}. Every point on y = ${F(b)} has y-coordinate ${F(b)}.`, `The crossing point is on both lines, so its x-coordinate is ${F(a)}.`],
        explain: `The point is on both lines, so x = ${F(a)} and y = ${F(b)}. They cross at ${coordS(a, b)}.`,
      };
    };

    PMLM.registerSkill({
      id: 'g7.coordinates', grade: 7, unit: 'g7.u3', title: 'Coordinates and lines', icon: '📍',
      blurb: 'Coordinates in four quadrants, and lines x = a, y = b',
      lesson: [
        { title: 'Four quadrants',
          text: 'The x-axis goes across and the y-axis goes up. They cross at the origin (0, 0).\nNegative x is to the left. Negative y is down.\nA is at (3, 2). B is at (−4, −1).',
          visual: { type: 'grid', points: [{ x: 3, y: 2, label: 'A' }, { x: -4, y: -1, label: 'B' }] } },
        { title: 'x first, then y',
          text: 'Coordinates are written (x, y).\n**Along the corridor, then up the stairs:** go across first, then up or down.\n(2, −3) means 2 right, then 3 down. It is **not** the same as (−3, 2).' },
        { title: 'Lines x = a and y = b',
          text: 'Every point on the line **x = 2** has x-coordinate 2: (2, −1), (2, 0), (2, 4). It is vertical.\nEvery point on **y = −3** has y-coordinate −3. It is horizontal.',
          visual: { type: 'grid', lines: [{ m: 0, c: -3, label: 'y = −3' }], segments: [{ x1: 2, y1: -5, x2: 2, y2: 5 }] } },
        { title: 'The line y = x',
          text: 'On the line **y = x**, both coordinates are equal: (1, 1), (−2, −2), (4, 4).\nIt goes diagonally through the origin.',
          visual: { type: 'grid', lines: [{ m: 1, c: 0, label: 'y = x' }] } },
        { title: 'Worked example',
          text: 'Write the coordinates of P: 4 squares left of the origin and 1 square up.\n**1.** Across first: 4 left means x = −4.\n**2.** Then up: 1 up means y = 1.\n**3.** Write (x, y).\nAnswer: **(−4, 1)**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [readPoint, readPoint, readPoint, whichPoint, lineEq],
          [readPoint, whichPoint, complete, lineEq, onLine, cross],
          [readPoint, complete, complete, lineEq, onLine, cross],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 4: Shape and measure ═══════════════════════
  PMLM.registerUnit({ id: 'g7.u4', grade: 7, name: 'Shape and measure', icon: '📐' });

  /* 18 ── Angles: on a line, round a point, vertically opposite, triangles, quadrilaterals */
  {
    const D = x => `${x}°`;
    const five = (a, b) => 5 * R(Math.ceil(a / 5), Math.floor(b / 5));

    const lineQ = L => {
      if (L === 1) {
        const a = retry(() => { const a = five(25, 155); return a !== 90 ? a : null; }), x = 180 - a;
        const first = Math.random() < 0.5;
        return num('Find the size of angle x.', x,
          ['Angles on a straight line add up to 180°.', `x + ${a}° = 180°. So x = 180° ${M} ${a}°.`],
          `Angles on a straight line add up to 180°. 180 ${M} ${a} = ${x}, so x = ${x}°.`,
          { unit: '°', visual: { type: 'angle', mode: 'line', parts: first ? [a, x] : [x, a], labels: first ? [D(a), 'x'] : ['x', D(a)] } });
      }
      const [a, b] = retry(() => { const a = five(30, 90), b = five(30, 90); return 180 - a - b >= 30 ? [a, b] : null; });
      const x = 180 - a - b, k = R(0, 2);
      const parts = [a, b]; parts.splice(k, 0, x);
      const labels = parts.map((p, i) => (i === k ? 'x' : D(p)));
      return num('Find the size of angle x.', x,
        ['Angles on a straight line add up to 180°.', `The two angles you know add up to ${a}° + ${b}° = ${a + b}°.`],
        `180 ${M} ${a + b} = ${x}, so x = ${x}°.`,
        { unit: '°', visual: { type: 'angle', mode: 'line', parts, labels } });
    };

    const pointQ = L => {
      const n = L === 1 ? 3 : 4;
      const known = retry(() => {
        const ks = Array.from({ length: n - 1 }, () => five(40, 150));
        const x = 360 - sum(ks);
        return x >= 40 && x <= 200 ? ks : null;
      });
      const x = 360 - sum(known), k = R(0, n - 1);
      const parts = known.slice(); parts.splice(k, 0, x);
      return num('Find the size of angle x.', x,
        ['Angles round a point add up to 360°.', `The angles you know add up to ${known.map(D).join(' + ')} = ${sum(known)}°.`],
        `360 ${M} ${sum(known)} = ${x}, so x = ${x}°.`,
        { unit: '°', visual: { type: 'angle', mode: 'point', parts, labels: parts.map((p, i) => (i === k ? 'x' : D(p))) } });
    };

    const vertOpp = () => {
      const a = retry(() => { const a = five(30, 150); return a !== 90 ? a : null; });
      const ask = pick([1, 2, 3]);
      const labels = [D(a), '', '', '']; labels[ask] = 'x';
      const ans = ask === 2 ? a : 180 - a;
      return num('Two straight lines cross. Find the size of angle x.', ans,
        ask === 2
          ? ['Vertically opposite angles (opposite each other where two lines cross) are equal.', 'Look at where the two lines cross. Which angle is directly across from x, on the other side of the crossing point?']
          : ['Angle x and the angle you know are next to each other on a straight line.', `Angles on a straight line add up to 180°, so x + ${a}° = 180°.`],
        ask === 2 ? `Vertically opposite angles are equal, so x = ${a}°.` : `x = 180° ${M} ${a}° = ${180 - a}° (angles on a straight line).`,
        { unit: '°', visual: { type: 'angle', mode: 'point', parts: [a, 180 - a, a, 180 - a], labels } });
    };

    const triangleQ = () => {
      const [a, b] = retry(() => { const a = R(30, 95), b = R(30, 95); return 180 - a - b >= 25 ? [a, b] : null; });
      const c = 180 - a - b, parts = [a, b, c], k = R(0, 2);
      const known = parts.filter((p, i) => i !== k);
      return num('Find the size of angle x in the triangle.', parts[k],
        ['The three angles in a triangle add up to 180°.', `The two angles you know add up to ${known[0]}° + ${known[1]}° = ${known[0] + known[1]}°.`],
        `180 ${M} ${known[0] + known[1]} = ${parts[k]}, so x = ${parts[k]}°.`,
        { unit: '°', visual: { type: 'angle', mode: 'triangle', parts, labels: parts.map((p, i) => (i === k ? 'x' : D(p))) } });
    };

    const isosceles = () => {
      if (Math.random() < 0.5) {
        const t = 2 * R(15, 60), b = (180 - t) / 2;
        return num(`This triangle is isosceles. The two base angles are equal.\nThe top angle is ${t}°. Find the base angle x.`, b,
          ['The angles in a triangle add up to 180°, and the two base angles are equal.', `The two base angles together are 180° ${M} ${t}° = ${180 - t}°.`],
          `The two base angles share ${180 - t}° equally: ${180 - t} ÷ 2 = ${b}, so x = ${b}°.`,
          { unit: '°', visual: { type: 'angle', mode: 'triangle', parts: [b, b, t], labels: ['x', '', D(t)] } });
      }
      const b = R(30, 80), t = 180 - 2 * b;
      return num(`This triangle is isosceles. The two base angles are equal.\nOne base angle is ${b}°. Find the top angle x.`, t,
        ['The two base angles are equal, and all three angles add up to 180°.', `Both base angles are ${b}°, so together they make ${2 * b}°.`],
        `180 ${M} ${2 * b} = ${t}, so x = ${t}°.`,
        { unit: '°', visual: { type: 'angle', mode: 'triangle', parts: [b, b, t], labels: [D(b), '', 'x'] } });
    };

    const quadQ = () => {
      const ks = retry(() => { const k = [R(50, 140), R(50, 140), R(50, 140)]; const x = 360 - sum(k); return x >= 40 && x <= 170 ? k : null; });
      const x = 360 - sum(ks);
      return num(`Three angles of a quadrilateral are ${ks.map(D).join(', ').replace(/, (?=[^,]*$)/, ' and ')}.\nFind the fourth angle.`, x,
        ['The four angles in a quadrilateral add up to 360°.', `The three angles you know add up to ${sum(ks)}°.`],
        `360 ${M} ${sum(ks)} = ${x}, so the fourth angle is ${x}°.`, { unit: '°' });
    };

    const whichTri = () => {
      const [a, b] = retry(() => { const a = R(30, 90), b = R(30, 90); return 180 - a - b >= 20 ? [a, b] : null; });
      const c = 180 - a - b;
      const set = arr => arr.map(D).join(', ');
      return choice('Which set of angles could be the three angles of a triangle?', set([a, b, c]),
        [set([a, b, c + 10]), set([a, b, c - 10 > 0 ? c - 10 : c + 20]), set([a + 90, b, c + 90 > 179 ? c : c + 90]), set([90, 90, a])],
        ['The three angles of a triangle must add up to exactly 180°. Add up each set.', `For example, ${set([a, b, c + 10])} adds up to ${190}°, so that set cannot be a triangle.`],
        `${a} + ${b} + ${c} = 180, so ${set([a, b, c])} could be a triangle. The other sets do not add up to 180°.`);
    };

    PMLM.registerSkill({
      id: 'g7.angles', grade: 7, unit: 'g7.u4', title: 'Angle rules', icon: '📐',
      blurb: 'Angles on a line, round a point, in triangles and more',
      lesson: [
        { title: 'On a straight line',
          text: 'Angles on a straight line add up to **180°** (half a turn).\n130° + x = 180°, so x = 50°.',
          visual: { type: 'angle', mode: 'line', parts: [130, 50], labels: ['130°', 'x'] } },
        { title: 'Round a point',
          text: 'Angles round a point add up to **360°** (a full turn).\n100° + 140° + x = 360°, so x = 120°.',
          visual: { type: 'angle', mode: 'point', parts: [100, 140, 120], labels: ['100°', '140°', 'x'] } },
        { title: 'Vertically opposite angles',
          text: 'When two straight lines cross, the angles opposite each other are **equal**.\nHere both 70° angles are opposite each other, and so are both 110° angles.',
          visual: { type: 'angle', mode: 'point', parts: [70, 110, 70, 110], labels: ['70°', '110°', '70°', '110°'] } },
        { title: 'Triangles and quadrilaterals',
          text: 'The angles in a **triangle** add up to **180°**.\nThe angles in a **quadrilateral** add up to **360°**.\nIn an isosceles triangle the two base angles are equal.',
          visual: { type: 'angle', mode: 'triangle', parts: [70, 50, 60], labels: ['70°', '50°', '60°'] } },
        { title: 'Worked example',
          text: 'A triangle has angles 48°, 75° and x. Find x.\n**1.** Angles in a triangle add up to 180°.\n**2.** Add the angles you know: 48 + 75 = 123.\n**3.** 180 − 123 = 57.\nAnswer: **x = 57°**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [lineQ, lineQ, pointQ, triangleQ, whichTri],
          [lineQ, pointQ, vertOpp, triangleQ, quadQ, whichTri],
          [lineQ, pointQ, vertOpp, triangleQ, isosceles, isosceles, quadQ],
        ], ctx);
      },
    });
  }

  /* 19 ── Area of triangles, parallelograms, compound shapes; perimeter */
  {
    const rectQ = L => {
      const l = R(3, L === 1 ? 12 : 20), w = R(2, l - 1);
      if (Math.random() < 0.5) {
        return num(`Find the area of this rectangle.`, l * w,
          ['Area of a rectangle = length × width.', `Multiply ${l} × ${w}.`],
          `${l} × ${w} = ${l * w} cm².`, { unit: 'cm²', visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `${l} cm`, height: `${w} cm` } } });
      }
      return num(`Find the perimeter of this rectangle.`, 2 * (l + w),
        ['Perimeter is the distance all the way round. Add all four sides.', `Two sides are ${l} cm and two sides are ${w} cm: ${l} + ${w} + ${l} + ${w}.`],
        `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} cm.`, { unit: 'cm', visual: { type: 'shape2d', shape: 'rectangle', dims: { base: `${l} cm`, height: `${w} cm` } } });
    };

    const triQ = L => {
      const [b, h] = retry(() => { const b = R(3, L === 1 ? 12 : 20), h = R(2, L === 1 ? 10 : 16); return (b * h) % 2 === 0 ? [b, h] : null; });
      const shape = L === 1 || Math.random() < 0.3 ? 'rightTriangle' : 'triangle';
      return num(`Find the area of this triangle.`, b * h / 2,
        ['Area of a triangle = ½ × base × height. The height must be at right angles to the base.', `Base × height = ${b} × ${h} = ${b * h}.`],
        `½ × ${b} × ${h} = ${b * h} ÷ 2 = ${b * h / 2} cm².`,
        { unit: 'cm²', visual: { type: 'shape2d', shape, dims: { base: `${b} cm`, height: `${h} cm` } } });
    };

    const paraQ = L => {
      const b = R(4, 15), h = R(3, 12), s = h + R(1, 4);
      return num(`Find the area of this parallelogram.${L === 3 ? `\nThe sloping sides are each ${s} cm long.` : ''}`, b * h,
        ['Area of a parallelogram = base × perpendicular height (the height at right angles to the base).' + (L === 3 ? ' Do not use the sloping side.' : ''), `Use the base ${b} cm and the height ${h} cm.`],
        `${b} × ${h} = ${b * h} cm².${L === 3 ? ` The sloping side (${s} cm) is not needed.` : ''}`,
        { unit: 'cm²', visual: { type: 'shape2d', shape: 'parallelogram', dims: { base: `${b} cm`, height: `${h} cm` } } });
    };

    const lShape = () => retry(() => {
      const w = R(6, 14), h = R(5, 12), a = R(2, w - 3), b = R(2, h - 2);
      return { w, h, a, b };
    });
    const compoundA = () => {
      const { w, h, a, b } = lShape();
      return num('Find the area of this shape. All the corners are right angles.', w * h - a * b,
        ['Find the area of the whole big rectangle, then take away the missing corner. (Or split it into two rectangles.)', `Big rectangle: ${w} × ${h} = ${w * h} cm². The missing corner is ${a} cm by ${b} cm.`],
        `${w * h} ${M} ${a} × ${b} = ${w * h} ${M} ${a * b} = ${w * h - a * b} cm².`,
        { unit: 'cm²', visual: { type: 'shape2d', shape: 'L', dims: { w: `${w} cm`, h: `${h} cm`, a: `${a} cm`, b: `${b} cm` } } });
    };
    const compoundP = () => {
      const { w, h, a, b } = lShape();
      return num('Find the perimeter of this shape. All the corners are right angles.', 2 * (w + h),
        ['Find the two missing side lengths first. Then add all six sides.', `The top edge is ${w} ${M} ${a} = ${w - a} cm. The right edge is ${h} ${M} ${b} = ${h - b} cm.`],
        `${w} + ${h} + ${w - a} + ${b} + ${a} + ${h - b} = ${2 * (w + h)} cm.`,
        { unit: 'cm', visual: { type: 'shape2d', shape: 'L', dims: { w: `${w} cm`, h: `${h} cm`, a: `${a} cm`, b: `${b} cm` } } });
    };

    const missing = L => {
      if (L === 3 && Math.random() < 0.5) {
        const b = R(4, 16), h = R(3, 12), A = b * h / 2;
        if (A % 1) return missing(L);
        return num(`A triangle has an area of ${A} cm² and a base of ${b} cm.\nFind its height.`, h,
          ['Area = ½ × base × height. So base × height = 2 × area.', `Base × height = 2 × ${A} = ${2 * A}. So ${b} × height = ${2 * A}.`],
          `Height = ${2 * A} ÷ ${b} = ${h} cm.`, { unit: 'cm', visual: { type: 'shape2d', shape: 'triangle', dims: { base: `${b} cm`, height: '?' } } });
      }
      const w = R(2, 9), l = R(w + 1, 15);
      return num(`A rectangle has an area of ${l * w} cm². Its width is ${w} cm.\nFind its length.`, l,
        ['Area = length × width, so length = area ÷ width.', `Length × ${w} = ${l * w}. Divide ${l * w} by ${w}.`],
        `${l * w} ÷ ${w} = ${l} cm.`, { unit: 'cm', visual: { type: 'shape2d', shape: 'rectangle', dims: { base: '?', height: `${w} cm` } } });
    };

    const real = (L, ctx) => {
      if (Math.random() < 0.5) {
        const l = R(5, 15), w = R(3, l - 1), c = R(2, 9);
        return num(`A rectangular garden is ${l} m long and ${w} m wide.\nGrass seed costs ${ctx.currency}${c} for each m². How much does it cost to seed the whole garden?`, l * w * c,
          ['First find the area of the garden. Then multiply by the cost of 1 m².', `Area = ${l} × ${w} = ${l * w} m².`],
          `Area = ${l * w} m². Cost = ${l * w} × ${c} = ${ctx.currency}${l * w * c}.`, { prefix: ctx.currency });
      }
      const W = R(4, 8), H = R(3, 5), dw = 1, dh = 2;
      return num(`A wall is ${W} m wide and ${H} m high. It has a door ${dw} m wide and ${dh} m high.\nWhat area of wall needs painting?`, W * H - dw * dh,
        ['Find the area of the whole wall, then take away the area of the door.', `Wall: ${W} × ${H} = ${W * H} m². Door: ${dw} × ${dh} = ${dw * dh} m².`],
        `${W * H} ${M} ${dw * dh} = ${W * H - dw * dh} m².`, { unit: 'm²' });
    };

    const spot = () => {
      const [b, h] = retry(() => { const b = R(4, 14), h = R(3, 12); return (b * h) % 2 === 0 ? [b, h] : null; });
      const who = U.name();
      return num(`${who} says the area of this triangle is ${b} × ${h} = ${b * h} cm².\nWhat is the correct area?`, b * h / 2,
        [`A triangle is half of a rectangle with the same base and height.`, `${b} × ${h} = ${b * h} is the area of the whole rectangle around the triangle.`],
        `Area = ½ × ${b} × ${h} = ${b * h / 2} cm². ${who} forgot to halve.`,
        { unit: 'cm²', visual: { type: 'shape2d', shape: 'triangle', dims: { base: `${b} cm`, height: `${h} cm` } } });
    };

    PMLM.registerSkill({
      id: 'g7.area', grade: 7, unit: 'g7.u4', title: 'Area and perimeter', icon: '⬛',
      blurb: 'Rectangles, triangles, parallelograms and L-shapes',
      lesson: [
        { title: 'Rectangles',
          text: '**Area** is the space inside a shape, in squares: cm², m².\nArea of a rectangle = length × width.\n**Perimeter** is the distance all the way round, in cm or m.\nA 6 cm by 4 cm rectangle: area = 24 cm², perimeter = 6 + 4 + 6 + 4 = 20 cm.',
          visual: { type: 'shape2d', shape: 'rectangle', dims: { base: '6 cm', height: '4 cm' } } },
        { title: 'Triangles',
          text: 'A triangle is half of a rectangle.\nArea of a triangle = ½ × base × height\nThe height is measured at **right angles** to the base.\n½ × 8 × 5 = 20 cm²',
          visual: { type: 'shape2d', shape: 'triangle', dims: { base: '8 cm', height: '5 cm' } } },
        { title: 'Parallelograms',
          text: 'Cut a triangle off one end and move it to the other end: you get a rectangle.\nArea of a parallelogram = base × perpendicular height\n**Don\'t** use the sloping side.',
          visual: { type: 'shape2d', shape: 'parallelogram', dims: { base: '7 cm', height: '4 cm' } } },
        { title: 'Compound shapes',
          text: 'Split the shape into rectangles, or find the big rectangle and take away the missing piece.\nBig rectangle: 10 × 8 = 80. Missing corner: 4 × 3 = 12. Area = 80 − 12 = 68 cm².',
          visual: { type: 'shape2d', shape: 'L', dims: { w: '10 cm', h: '8 cm', a: '4 cm', b: '3 cm' } } },
        { title: 'Worked example',
          text: 'Find the area of a triangle with base 12 cm and height 7 cm.\n**1.** Area = ½ × base × height.\n**2.** 12 × 7 = 84.\n**3.** Half of 84 = 42.\nAnswer: **42 cm²**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [rectQ, rectQ, triQ, triQ, paraQ, spot],
          [triQ, paraQ, compoundA, missing, real, spot, rectQ],
          [triQ, paraQ, compoundA, compoundP, missing, real],
        ], ctx);
      },
    });
  }

  /* 20 ── Volume (and surface area) of cuboids */
  {
    const cub = (l, w, h, u = 'cm') => ({ type: 'shape3d', shape: 'cuboid', dims: { l: `${l} ${u}`, w: `${w} ${u}`, h: `${h} ${u}` } });

    const cuboidV = L => {
      const l = R(2, L === 1 ? 8 : 15), w = R(2, L === 1 ? 6 : 10), h = R(2, L === 1 ? 6 : 10);
      return num('Find the volume of this cuboid.', l * w * h,
        ['Volume of a cuboid = length × width × height.', `Start with length × width: ${l} × ${w} = ${l * w}. Now multiply by the height.`],
        `${l} × ${w} × ${h} = ${l * w} × ${h} = ${l * w * h} cm³.`, { unit: 'cm³', visual: cub(l, w, h) });
    };

    const cubeV = () => {
      const s = R(2, 10);
      return num(`A cube has edges of ${s} cm.\nFind its volume.`, s * s * s,
        ['All the edges of a cube are the same length. Volume = edge × edge × edge.', `${s} × ${s} = ${s * s}. Now multiply by ${s} again.`],
        `${s} × ${s} × ${s} = ${s * s * s} cm³.`, { unit: 'cm³', visual: { type: 'shape3d', shape: 'cube', dims: { l: `${s} cm` } } });
    };

    const countCubes = () => {
      const l = R(2, 6), w = R(2, 4), h = R(2, 4);
      return num(`This cuboid is made from 1 cm cubes. It is ${l} cubes long, ${w} cubes wide and ${h} cubes high.\nHow many cubes are there?`, l * w * h,
        ['Count the cubes in one layer, then multiply by the number of layers.', `One layer has ${l} × ${w} = ${l * w} cubes. There are ${h} layers.`],
        `${l * w} cubes in each layer × ${h} layers = ${l * w * h} cubes. The volume is ${l * w * h} cm³.`,
        { unit: 'cubes', visual: { type: 'shape3d', shape: 'cuboid', dims: { l: String(l), w: String(w), h: String(h) } } });
    };

    const missingDim = () => {
      const l = R(3, 12), w = R(2, 8), h = R(2, 10), V = l * w * h;
      return num(`This cuboid has a volume of ${V} cm³.\nFind its height.`, h,
        ['Volume = length × width × height. Work backwards to find the height.', `Length × width = ${l} × ${w} = ${l * w}. So ${l * w} × height = ${V}.`],
        `Height = ${V} ÷ ${l * w} = ${h} cm.`,
        { unit: 'cm', visual: { type: 'shape3d', shape: 'cuboid', dims: { l: `${l} cm`, w: `${w} cm`, h: '?' } } });
    };

    const litres = () => {
      const [l, w, h] = retry(() => { const l = 10 * R(3, 8), w = 10 * R(2, 5), h = 10 * R(2, 6); return (l * w * h) % 1000 === 0 ? [l, w, h] : null; });
      const V = l * w * h;
      return num(`A fish tank is a cuboid ${l} cm long, ${w} cm wide and ${h} cm high.\nHow many litres of water does it hold when it is full? (1 litre = 1000 cm³)`, V / 1000,
        ['Find the volume in cm³ first. Then divide by 1000 to change cm³ into litres.', `Volume = ${l} × ${w} × ${h} = ${F(V)} cm³.`],
        `${F(V)} cm³ ÷ 1000 = ${V / 1000} litres.`, { unit: 'litres', visual: cub(l, w, h) });
    };

    const packing = () => {
      const c = pick([2, 3, 5]), nl = R(2, 6), nw = R(2, 4), nh = R(1, 3);
      const L_ = c * nl, W = c * nw, H = c * nh;
      return num(`A box is ${L_} cm long, ${W} cm wide and ${H} cm high.\nHow many cubes with edges of ${c} cm fit exactly inside it?`, nl * nw * nh,
        ['Find how many cubes fit along each edge of the box. Then multiply.', `Along the length: ${L_} ÷ ${c} = ${nl} cubes. Along the width: ${W} ÷ ${c} = ${nw} cubes.`],
        `${nl} × ${nw} × ${nh} = ${nl * nw * nh} cubes (${L_} ÷ ${c}, ${W} ÷ ${c} and ${H} ÷ ${c}).`, { unit: 'cubes', visual: cub(L_, W, H) });
    };

    const surface = () => {
      if (Math.random() < 0.5) {
        const s = R(2, 10);
        return num(`A cube has edges of ${s} cm.\nFind its total surface area.`, 6 * s * s,
          ['A cube has 6 faces. Each face is a square.', `One face: ${s} × ${s} = ${s * s} cm².`],
          `6 faces × ${s * s} cm² = ${6 * s * s} cm².`, { unit: 'cm²', visual: { type: 'shape3d', shape: 'cube', dims: { l: `${s} cm` } } });
      }
      const l = R(3, 10), w = R(2, 8), h = R(2, 8);
      const sa = 2 * (l * w + l * h + w * h);
      return num('Find the total surface area of this cuboid.', sa,
        ['A cuboid has 6 rectangular faces, in 3 matching pairs: top and bottom, front and back, two ends.', `Top: ${l} × ${w} = ${l * w}. Front: ${l} × ${h} = ${l * h}. End: ${w} × ${h} = ${w * h}. Each comes twice.`],
        `2 × (${l * w} + ${l * h} + ${w * h}) = 2 × ${l * w + l * h + w * h} = ${sa} cm².`, { unit: 'cm²', visual: cub(l, w, h) });
    };

    const spot = () => {
      const l = R(3, 9), w = R(2, 6), h = R(2, 6), who = U.name();
      return num(`${who} says the volume of this cuboid is ${l} + ${w} + ${h} = ${l + w + h} cm³.\nWhat is the correct volume?`, l * w * h,
        [`${who} added the lengths. Volume is length × width × height.`, `${l} × ${w} = ${l * w}. Now multiply by ${h}.`],
        `${l} × ${w} × ${h} = ${l * w * h} cm³.`, { unit: 'cm³', visual: cub(l, w, h) });
    };

    PMLM.registerSkill({
      id: 'g7.volume', grade: 7, unit: 'g7.u4', title: 'Volume of cuboids', icon: '📦',
      blurb: 'Volume and surface area of cubes and cuboids',
      lesson: [
        { title: 'What is volume?',
          text: 'Volume is the amount of space inside a 3D shape.\nWe measure it in cubes: a 1 cm cube has a volume of **1 cm³**.\nThis cube is 2 cm by 2 cm by 2 cm, so it is made of 8 small cubes: 8 cm³.',
          visual: { type: 'shape3d', shape: 'cube', dims: { l: '2 cm', w: '2 cm', h: '2 cm' } } },
        { title: 'Volume of a cuboid',
          text: 'Volume = length × width × height\n5 × 3 × 2 = 30 cm³\n**Tip:** length × width tells you how many cubes are in one layer. × height counts the layers.',
          visual: { type: 'shape3d', shape: 'cuboid', dims: { l: '5 cm', w: '3 cm', h: '2 cm' } } },
        { title: 'Units and litres',
          text: 'Lengths in cm → volume in cm³. Lengths in m → volume in m³.\n1 litre = 1000 cm³\nA tank holding 24 000 cm³ holds 24 litres.' },
        { title: 'Surface area',
          text: 'Surface area is the total area of all the faces.\nA cuboid has 6 faces in 3 pairs.\nFor 5 × 3 × 2: 2 × (15 + 10 + 6) = 62 cm².\n**Careful:** surface area is in cm², volume is in cm³.' },
        { title: 'Worked example',
          text: 'A cuboid is 8 cm long, 5 cm wide and 3 cm high. Find its volume.\n**1.** Volume = length × width × height.\n**2.** 8 × 5 = 40 (one layer).\n**3.** 40 × 3 = 120.\nAnswer: **120 cm³**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [cuboidV, cuboidV, cubeV, countCubes, spot],
          [cuboidV, cubeV, missingDim, litres, spot, countCubes],
          [cuboidV, missingDim, litres, packing, surface, surface],
        ], ctx);
      },
    });
  }

  /* 21 ── Transformations: reflect, rotate, translate */
  {
    const G = { xmin: -6, xmax: 6, ymin: -6, ymax: 6 };
    const grid = extra => Object.assign({ type: 'grid' }, G, extra);
    const inG = (x, y) => Math.abs(x) <= 6 && Math.abs(y) <= 6;
    const sqs = n => `${Math.abs(n)} square${Math.abs(n) === 1 ? '' : 's'}`;
    const dirX = n => (n > 0 ? 'right' : 'left'), dirY = n => (n > 0 ? 'up' : 'down');
    const coordQ = (q, ans, hints, explain, visual) => ({ q, kind: 'coord', answer: ans, hints, explain, visual });

    const translate = L => {
      const r = retry(() => {
        const x = nz(-5, 5), y = nz(-5, 5), a = L === 1 ? R(1, 5) * sgn() : nz(-6, 6), b = L === 1 ? 0 : nz(-6, 6);
        const b2 = L === 1 && Math.random() < 0.5 ? nz(-5, 5) : b;
        return inG(x + a, y + b2) ? { x, y, a, b: b2 } : null;
      });
      const { x, y, a, b } = r;
      const move = [a ? `${sqs(a)} ${dirX(a)}` : '', b ? `${sqs(b)} ${dirY(b)}` : ''].filter(Boolean).join(' and ');
      return coordQ(`Point A is translated ${move}.\nWhat are the coordinates of its image?`, [x + a, y + b],
        ['Left and right change the x-coordinate. Up and down change the y-coordinate.',
          a ? `Moving ${sqs(a)} ${dirX(a)} changes x: ${F(x)} ${a > 0 ? '+' : M} ${A(a)} = ${F(x + a)}.` : `There is no left or right move, so x stays ${F(x)}.`],
        `x: ${F(x)} ${a >= 0 ? '+' : M} ${A(a)} = ${F(x + a)}. y: ${F(y)} ${b >= 0 ? '+' : M} ${A(b)} = ${F(y + b)}. The image is ${coordS(x + a, y + b)}.`,
        grid({ points: [{ x, y, label: 'A' }] }));
    };

    const reflectAxis = () => {
      const x = nz(-5, 5), y = nz(-5, 5), inX = Math.random() < 0.5;
      const ans = inX ? [x, -y] : [-x, y];
      return coordQ(`Reflect point A in the ${inX ? 'x' : 'y'}-axis.\nWhat are the coordinates of its image?`, ans,
        ['A reflection makes a mirror image. The image is the same distance from the mirror line, on the other side.',
          inX ? `A is ${sqs(y)} ${y > 0 ? 'above' : 'below'} the x-axis. The image must be the same distance on the other side.` : `A is ${sqs(x)} to the ${x > 0 ? 'right' : 'left'} of the y-axis. The image must be the same distance on the other side.`],
        inX ? `The x-coordinate stays ${F(x)}. The y-coordinate changes from ${F(y)} to ${F(-y)}. The image is ${coordS(...ans)}.`
          : `The y-coordinate stays ${F(y)}. The x-coordinate changes from ${F(x)} to ${F(-x)}. The image is ${coordS(...ans)}.`,
        grid({ points: [{ x, y, label: 'A' }], lines: inX ? [{ m: 0, c: 0 }] : [], segments: inX ? [] : [{ x1: 0, y1: -6, x2: 0, y2: 6 }] }));
    };

    const reflectLine = () => {
      const vert = Math.random() < 0.5, m = nz(-3, 3);
      const r = retry(() => {
        const x = R(-6, 6), y = R(-6, 6);
        const ans = vert ? [2 * m - x, y] : [x, 2 * m - y];
        if ((vert ? x : y) === m || !inG(...ans)) return null;
        return { x, y, ans };
      });
      const { x, y, ans } = r, d = vert ? x - m : y - m;
      return coordQ(`Reflect point A in the line ${vert ? 'x' : 'y'} = ${F(m)}.\nWhat are the coordinates of its image?`, ans,
        ['Count the squares from A to the mirror line. The image is the same distance on the other side.',
          vert ? `A is ${sqs(d)} to the ${d > 0 ? 'right' : 'left'} of the line x = ${F(m)}. Its y-coordinate does not change.`
            : `A is ${sqs(d)} ${d > 0 ? 'above' : 'below'} the line y = ${F(m)}. Its x-coordinate does not change.`],
        `A is ${sqs(d)} from the mirror line, so the image is ${sqs(d)} on the other side: ${coordS(...ans)}.`,
        grid({ points: [{ x, y, label: 'A' }], lines: vert ? [] : [{ m: 0, c: m }], segments: vert ? [{ x1: m, y1: -6, x2: m, y2: 6 }] : [] }));
    };

    const rotate = L => {
      const x = nz(-5, 5), y = nz(-5, 5);
      const t = L === 3 ? pick(['180', 'cw', 'acw']) : '180';
      const ans = t === '180' ? [-x, -y] : t === 'cw' ? [y, -x] : [-y, x];
      const name = t === '180' ? '180°' : `90° ${t === 'cw' ? 'clockwise' : 'anticlockwise'}`;
      const hint2 = t === '180'
        ? `A is ${sqs(x)} ${dirX(x)} and ${sqs(y)} ${dirY(y)} from (0, 0). A half turn sends it the same distances in the opposite directions.`
        : (() => {
          const turn = t === 'cw' ? { right: 'down', down: 'left', left: 'up', up: 'right' } : { right: 'up', up: 'left', left: 'down', down: 'right' };
          return `A is ${sqs(x)} ${dirX(x)} and ${sqs(y)} ${dirY(y)} from (0, 0). After a quarter turn ${t === 'cw' ? 'clockwise' : 'anticlockwise'}, "${dirX(x)}" becomes "${turn[dirX(x)]}" and "${dirY(y)}" becomes "${turn[dirY(y)]}".`;
        })();
      return coordQ(`Rotate point A ${name} about the origin (0, 0).\nWhat are the coordinates of its image?`, ans,
        ['Imagine tracing paper pinned at (0, 0). Turn it and see where A goes.', hint2],
        `A ${name} turn about (0, 0) takes ${coordS(x, y)} to ${coordS(...ans)}.`,
        grid({ points: [{ x, y, label: 'A' }, { x: 0, y: 0 }] }));
    };

    // an asymmetric right-angled triangle in one quadrant
    const baseTri = () => {
      const sx = sgn(), sy = sgn(), ox = R(1, 2), oy = R(1, 2), w = R(2, 3), h = w === 2 ? 3 : 2;
      return [[ox, oy], [ox + w, oy], [ox, oy + h]].map(([px, py]) => [sx * px, sy * py]);
    };
    const key = pts => pts.map(p => p.join(',')).sort().join('|');

    const vertex = () => {
      const tri = baseTri(), A_ = tri[0];
      const t = pick(['rx', 'ry', 'r180']);
      const f = { rx: ([x, y]) => [x, -y], ry: ([x, y]) => [-x, y], r180: ([x, y]) => [-x, -y] }[t];
      const ans = f(A_), name = { rx: 'reflected in the x-axis', ry: 'reflected in the y-axis', r180: 'rotated 180° about (0, 0)' }[t];
      return coordQ(`The triangle is ${name}.\nWhat are the coordinates of the image of corner A?`, ans,
        ['Just transform the one corner you need.', `A is at ${coordS(...A_)}. ${t === 'r180' ? 'A half turn about (0, 0) sends it to the opposite side of the origin.' : `Find its mirror image in the ${t === 'rx' ? 'x' : 'y'}-axis.`}`],
        `A ${coordS(...A_)} goes to ${coordS(...ans)}.`,
        grid({ polygons: [{ pts: tri }], points: [{ x: A_[0], y: A_[1], label: 'A' }] }));
    };

    const which = () => {
      const tri = baseTri();
      const tx = R(2, 4) * -Math.sign(tri[0][0]), ty = R(1, 3) * -Math.sign(tri[0][1]);
      const T = {
        'Reflection in the y-axis': ([x, y]) => [-x, y],
        'Reflection in the x-axis': ([x, y]) => [x, -y],
        'Rotation 180° about (0, 0)': ([x, y]) => [-x, -y],
        [`Translation ${sqs(tx)} ${dirX(tx)} and ${sqs(ty)} ${dirY(ty)}`]: ([x, y]) => [x + tx, y + ty],
      };
      const names = Object.keys(T);
      const ansName = pick(names), img = tri.map(T[ansName]);
      if (!img.every(p => inG(...p))) return which();
      const wrong = names.filter(n => n !== ansName && key(tri.map(T[n])) !== key(img));
      return choice('Which transformation maps shape A onto shape B?', ansName, wrong,
        ['Compare the two shapes. Has the shape flipped over, turned, or just slid?', 'A translation slides without turning or flipping. A reflection flips the shape over a mirror line. A 180° rotation turns it upside down.'],
        `${ansName} maps shape A onto shape B.`,
        { visual: grid({ polygons: [{ pts: tri, label: 'A' }, { pts: img, label: 'B' }] }) });
    };

    PMLM.registerSkill({
      id: 'g7.transform', grade: 7, unit: 'g7.u4', title: 'Transformations', icon: '🔄',
      blurb: 'Reflect, rotate and translate points and shapes',
      lesson: [
        { title: 'Translation: a slide',
          text: 'A translation slides a shape. It does not turn or flip.\nMove 4 right and 1 down: (−3, 2) → (1, 1).\nRight/left changes x. Up/down changes y.',
          visual: { type: 'grid', xmin: -6, xmax: 6, ymin: -6, ymax: 6, polygons: [{ pts: [[-4, 2], [-2, 2], [-4, 5]], label: 'A' }, { pts: [[0, 1], [2, 1], [0, 4]], label: 'B' }] } },
        { title: 'Reflection: a flip',
          text: 'A reflection flips a shape over a mirror line.\nEach point ends up the **same distance** from the mirror, on the other side.\nIn the y-axis: (3, 2) → (−3, 2). In the x-axis: (3, 2) → (3, −2).',
          visual: { type: 'grid', xmin: -6, xmax: 6, ymin: -6, ymax: 6, polygons: [{ pts: [[1, 1], [4, 1], [1, 3]], label: 'A' }, { pts: [[-1, 1], [-4, 1], [-1, 3]], label: 'B' }] } },
        { title: 'Rotation: a turn',
          text: 'A rotation turns a shape about a centre point.\nYou need the **angle** (90° or 180°), the **direction** (clockwise or anticlockwise) and the **centre**.\n180° about (0, 0): (3, 2) → (−3, −2).',
          visual: { type: 'grid', xmin: -6, xmax: 6, ymin: -6, ymax: 6, polygons: [{ pts: [[1, 1], [4, 1], [1, 3]], label: 'A' }, { pts: [[-1, -1], [-4, -1], [-1, -3]], label: 'B' }] } },
        { title: 'Worked example',
          text: 'Reflect A(4, −1) in the line x = 2.\n**1.** The mirror line is vertical, so y stays −1.\n**2.** A is 2 squares to the right of x = 2.\n**3.** The image is 2 squares to the left: x = 0.\nAnswer: **(0, −1)**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [translate, translate, reflectAxis, reflectAxis, which],
          [translate, reflectAxis, reflectLine, rotate, which, vertex],
          [reflectLine, reflectLine, rotate, rotate, vertex, which, translate],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 5: Data and chance ═══════════════════════
  PMLM.registerUnit({ id: 'g7.u5', grade: 7, name: 'Data and chance', icon: '📊' });

  /* 22 ── Mean, median, mode and range; comparing data */
  {
    const list = a => a.map(v => F(v)).join(', ');
    const sorted = a => a.slice().sort((p, q) => p - q);

    const meanQ = L => {
      const n = L === 1 ? pick([3, 4, 5]) : L === 2 ? pick([5, 6, 8]) : pick([4, 5]), hi = L === 1 ? 20 : 50;
      const data = retry(() => {
        const m = R(3, hi - 3), d = Array.from({ length: n - 1 }, () => R(1, hi));
        const last = (L === 3 ? m * n + R(1, n - 1) : m * n) - sum(d);
        if (last < 1 || last > hi) return null;
        return U.shuffle([...d, last]);
      });
      const s = sum(data), mean = U.round(s / n, 2);
      return num(`Find the mean of these numbers.\n${list(data)}${L === 3 && s % n ? '\nGive your answer as a decimal.' : ''}`, mean,
        ['Mean = the total of all the numbers ÷ how many numbers there are.', `Total = ${data.map(v => F(v)).join(' + ')} = ${s}.`],
        `Total = ${s}. There are ${n} numbers. ${s} ÷ ${n} = ${F(mean)}.`);
    };

    const medianQ = L => {
      const n = L === 1 ? pick([5, 7]) : pick([5, 6, 7, 8]);
      const data = retry(() => {
        const d = Array.from({ length: n }, () => R(1, L === 1 ? 20 : 60));
        return new Set(d).size >= n - 1 ? d : null;
      });
      const s = sorted(data), med = n % 2 ? s[(n - 1) / 2] : U.clean((s[n / 2 - 1] + s[n / 2]) / 2);
      return num(`Find the median of these numbers.\n${list(data)}`, med,
        ['Put the numbers in order first. The median is the middle number.' + (n % 2 ? '' : ' With two middle numbers, the median is halfway between them.'),
          `In order: ${list(s)}. There are ${n} numbers.`],
        n % 2 ? `In order: ${list(s)}. The middle (${U.ord((n + 1) / 2)}) number is ${F(med)}.`
          : `In order: ${list(s)}. The middle two are ${s[n / 2 - 1]} and ${s[n / 2]}. Halfway between them is ${F(med)}.`);
    };

    const modeQ = () => {
      const m = R(2, 15);
      const others = U.sample(U.range(1, 20).filter(v => v !== m), R(3, 5));
      const twice = others[0];
      const data = U.shuffle([m, m, m, twice, twice, ...others.slice(1)]);
      const ex = others.length > 1 ? others[1] : twice;
      return num(`Find the mode of these numbers.\n${list(data)}`, m,
        ['The mode is the value that appears most often.', `Count how many times each value appears. For example, ${ex} appears ${data.filter(v => v === ex).length === 1 ? 'once' : 'twice'}.`],
        `${m} appears 3 times, more than any other value, so the mode is ${m}.`);
    };

    const modeChart = () => {
      const labels = U.sample(['red', 'blue', 'green', 'yellow', 'purple', 'orange'], R(4, 5));
      const vals = retry(() => {
        const v = labels.map(() => R(2, 12));
        const mx = Math.max(...v);
        return v.filter(x => x === mx).length === 1 ? v : null;
      });
      const ans = labels[vals.indexOf(Math.max(...vals))];
      return choice('The bar chart shows the favourite colours of a class.\nWhich colour is the mode?', ans, labels.filter(l => l !== ans),
        ['The mode is the most common value. On a bar chart it is the tallest bar.', 'Compare the heights of the bars. Which one reaches highest?'],
        `The tallest bar is ${ans} (${Math.max(...vals)} pupils), so the mode is ${ans}.`,
        { visual: { type: 'barChart', bars: labels.map((l, i) => ({ label: l, value: vals[i] })), yLabel: 'pupils' } });
    };

    const rangeQ = L => {
      if (L === 3 && Math.random() < 0.6) {
        const temps = retry(() => { const t = Array.from({ length: 6 }, () => R(-9, 12)); return Math.min(...t) < 0 && Math.max(...t) > 0 ? t : null; });
        const mx = Math.max(...temps), mn = Math.min(...temps);
        return num(`The midday temperatures (°C) in a town for six days were:\n${list(temps)}\nFind the range.`, mx - mn,
          ['Range = highest value − lowest value.', `The highest is ${F(mx)} and the lowest is ${F(mn)}. Work out ${F(mx)} ${M} (${F(mn)}).`],
          `${F(mx)} ${M} (${F(mn)}) = ${F(mx)} + ${A(mn)} = ${mx - mn}, so the range is ${mx - mn} °C.`, { unit: '°C' });
      }
      const data = Array.from({ length: R(5, 7) }, () => R(1, L === 1 ? 30 : 99));
      const mx = Math.max(...data), mn = Math.min(...data);
      if (mx === mn) return rangeQ(L);
      return num(`Find the range of these numbers.\n${list(data)}`, mx - mn,
        ['Range = highest value − lowest value. It shows how spread out the data is.', `The highest value is ${mx}. Now find the lowest.`],
        `${mx} ${M} ${mn} = ${mx - mn}, so the range is ${mx - mn}.`);
    };

    const missingMean = () => {
      const n = pick([3, 4, 5]), m = R(4, 15);
      const known = retry(() => {
        const k = Array.from({ length: n - 1 }, () => R(1, 25));
        const last = m * n - sum(k);
        return last >= 1 && last <= 30 ? k : null;
      });
      const last = m * n - sum(known);
      return num(`The mean of ${n} numbers is ${m}.\n${n - 1 === 2 ? 'Two' : n - 1 === 3 ? 'Three' : 'Four'} of the numbers are ${list(known)}.\nWhat is the missing number?`, last,
        ['Mean × how many numbers = the total of all the numbers.', `The total must be ${m} × ${n} = ${m * n}. The numbers you know add up to ${sum(known)}.`],
        `${m * n} ${M} ${sum(known)} = ${last}, so the missing number is ${last}.`);
    };

    const compare = () => {
      const [mA, mB] = retry(() => { const a = R(8, 20), b = R(8, 20); return a !== b ? [a, b] : null; });
      const [rA, rB] = retry(() => { const a = R(2, 15), b = R(2, 15); return a !== b ? [a, b] : null; });
      const hiM = mA > mB ? 'Team A' : 'Team B', loM = mA > mB ? 'Team B' : 'Team A';
      const loR = rA < rB ? 'Team A' : 'Team B', hiR = rA < rB ? 'Team B' : 'Team A';
      const askMean = Math.random() < 0.5;
      const ans = askMean ? `${hiM} scored more on average.` : `${loR} had more consistent scores.`;
      return choice('The table shows the mean and range of two teams\' scores.\nWhich statement is correct?', ans,
        [`${loM} scored more on average.`, `${hiR} had more consistent scores.`, 'Both teams had the same mean.'],
        ['The mean tells you which is higher on average. The range tells you how spread out (how consistent) the scores are. A smaller range means more consistent.',
          `Compare the means: ${mA} and ${mB}. Then compare the ranges: ${rA} and ${rB}.`],
        `${hiM} has the higher mean (${Math.max(mA, mB)}), so it scored more on average. ${loR} has the smaller range (${Math.min(rA, rB)}), so its scores were more consistent.`,
        { visual: { type: 'table', headers: ['Team', 'Mean', 'Range'], rows: [['Team A', mA, rA], ['Team B', mB, rB]] } });
    };

    const spot = () => {
      const data = retry(() => {
        const d = U.sample(U.range(1, 30), 5);
        const s = sorted(d);
        return d[2] !== s[2] ? d : null;
      });
      const s = sorted(data), who = U.name();
      return num(`${who} says the median of ${list(data)} is ${data[2]}, because it is in the middle of the list.\nWhat is the correct median?`, s[2],
        [`${who} forgot something important. What must you do before finding the middle number?`, 'Put the numbers in order from smallest to largest first.'],
        `In order: ${list(s)}. The middle number is ${s[2]}, so the median is ${s[2]}.`);
    };

    PMLM.registerSkill({
      id: 'g7.averages', grade: 7, unit: 'g7.u5', title: 'Averages and range', icon: '📊',
      blurb: 'Mean, median, mode and range, and comparing data',
      lesson: [
        { title: 'Three averages',
          text: 'Data: 3, 7, 4, 7, 9\n**Mode** = the most common value: 7\n**Median** = the middle value in order: 3, 4, **7**, 7, 9 → 7\n**Mean** = total ÷ how many: (3 + 7 + 4 + 7 + 9) ÷ 5 = 30 ÷ 5 = 6' },
        { title: 'The median',
          text: 'Always put the numbers **in order** first.\nWith an even number of values, there are two middle values. The median is halfway between them.\n2, 5, **6, 10**, 12, 15 → median = 8' },
        { title: 'The range',
          text: 'Range = highest − lowest. It shows how **spread out** the data is.\n3, 7, 4, 7, 9 → range = 9 − 3 = 6\nA small range means the data is **consistent** (close together).' },
        { title: 'Comparing data',
          text: 'Use an average to say which is higher, and the range to say which is more consistent.',
          visual: { type: 'table', headers: ['Player', 'Mean', 'Range'], rows: [['Ana', '15', '12'], ['Ben', '13', '4']] } },
        { title: 'Worked example',
          text: 'Find the mean of 12, 15, 9, 14.\n**1.** Add them: 12 + 15 + 9 + 14 = 50.\n**2.** Count them: there are 4 numbers.\n**3.** 50 ÷ 4 = 12.5.\nAnswer: **12.5**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [meanQ, medianQ, modeQ, rangeQ, modeChart, spot],
          [meanQ, meanQ, medianQ, modeQ, rangeQ, compare, spot],
          [meanQ, medianQ, rangeQ, missingMean, missingMean, compare],
        ], ctx);
      },
    });
  }

  /* 23 ── Probability */
  {
    const COLS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const makeBag = (k, maxTotal) => retry(() => {
      const cs = U.sample(COLS, k).map(c => ({ color: c, count: R(1, 7) }));
      const t = sum(cs.map(c => c.count));
      return t <= maxTotal && t >= 4 ? cs : null;
    });

    const bagQ = L => {
      const items = makeBag(L === 1 ? 2 : 3, 20), total = sum(items.map(i => i.count));
      const it = pick(items);
      const [n, d] = U.simplify(it.count, total);
      return fracQ(`A marble is taken at random from the bag.\nWhat is the probability that it is ${it.color}?${L === 3 ? '\n' + SIMPLE : ''}`, it.count, total,
        ['Probability = number of ways it can happen ÷ total number of outcomes. Each marble is equally likely.',
          `Count all the marbles: there are ${total} altogether. Now count the ${it.color} ones.`],
        `${it.count} out of ${total} marbles ${it.count === 1 ? 'is' : 'are'} ${it.color}, so P(${it.color}) = ${fr(it.count, total)}${n !== it.count ? ` = ${fr(n, d)}` : ''}.`,
        { simplest: L === 3, visual: { type: 'bag', items } });
    };

    const spinnerQ = L => {
      const k = R(5, 10), sectors = Array.from({ length: k }, (_, i) => ({ label: String(i + 1), color: COLS[i % COLS.length] }));
      const t = pick(['even', 'more', 'num']);
      let fav, desc;
      if (t === 'even') { fav = Math.floor(k / 2); desc = 'an even number'; }
      else if (t === 'more') { const m = R(2, k - 2); fav = k - m; desc = `a number greater than ${m}`; }
      else { fav = 1; desc = `the number ${R(1, k)}`; }
      const [n, d] = U.simplify(fav, k);
      return fracQ(`The spinner has ${k} equal sections. It is spun once.\nWhat is the probability of getting ${desc}?${L === 3 ? '\n' + SIMPLE : ''}`, fav, k,
        ['All the sections are the same size, so each number is equally likely. Probability = favourable outcomes ÷ total outcomes.',
          `There are ${k} possible outcomes. Which of them give ${desc}?`],
        `${fav} out of ${k} equal sections give ${desc}, so the probability is ${fr(fav, k)}${n !== fav ? ` = ${fr(n, d)}` : ''}.`,
        { simplest: L === 3, visual: { type: 'spinner', sectors } });
    };

    const diceQ = L => {
      const opts = [
        ['an even number', [2, 4, 6]], ['an odd number', [1, 3, 5]], ['a prime number', [2, 3, 5]],
        ['a number less than 3', [1, 2]], ['a number greater than 4', [5, 6]], ['a multiple of 3', [3, 6]],
        ['a 6', [6]], ['a number greater than 2', [3, 4, 5, 6]], ['a factor of 6', [1, 2, 3, 6]],
      ];
      const [desc, fav] = pick(opts);
      const [n, d] = U.simplify(fav.length, 6);
      return fracQ(`A fair six-sided dice is rolled.\nWhat is the probability of rolling ${desc}?${L === 3 ? '\n' + SIMPLE : ''}`, fav.length, 6,
        ['List all the outcomes: 1, 2, 3, 4, 5, 6. They are all equally likely.', `Which of 1, 2, 3, 4, 5, 6 count as ${desc}? Count them.`],
        `${fav.length === 1 ? 'The only outcome that works is' : 'The outcomes that work are'} ${fav.join(', ')}: ${fav.length} out of 6. P = ${fr(fav.length, 6)}${n !== fav.length ? ` = ${fr(n, d)}` : ''}.`,
        { simplest: L === 3 });
    };

    const WORDS = ['impossible', 'unlikely', 'even chance', 'likely', 'certain'];
    const wordsQ = () => {
      const t = R(0, 4), c = pick(COLS);
      let items;
      if (t === 0) items = [{ color: pick(COLS.filter(x => x !== c)), count: R(4, 10) }];
      else if (t === 4) items = [{ color: c, count: R(4, 10) }];
      else {
        const o = pick(COLS.filter(x => x !== c));
        const [a, b] = t === 1 ? [R(1, 3), R(5, 9)] : t === 2 ? (n => [n, n])(R(2, 6)) : [R(5, 9), R(1, 3)];
        items = [{ color: c, count: a }, { color: o, count: b }];
      }
      const total = sum(items.map(i => i.count)), red = (items.find(i => i.color === c) || { count: 0 }).count;
      return choice(`One marble is taken from this bag without looking.\nHow likely is it to be ${c}?`, WORDS[t], WORDS.filter((w, i) => i !== t),
        ['Compare the number of ' + c + ' marbles with the total. None → impossible. All → certain. Exactly half → even chance.',
          `There ${red === 1 ? 'is' : 'are'} ${red} ${c} marble${red === 1 ? '' : 's'} out of ${total}.`],
        `${red} out of ${total} ${red === 1 ? 'is' : 'are'} ${c}, so it is ${WORDS[t]}.`,
        { visual: { type: 'bag', items } });
    };

    const notQ = L => {
      if (L === 2 || Math.random() < 0.5) {
        const p = R(1, 9) / 10, ev = pick(['it rains tomorrow', 'the bus is late', 'Leyla wins the game', 'a seed grows']);
        return num(`The probability that ${ev} is ${F(p)}.\nWhat is the probability that this does **not** happen?`, U.clean(1 - p),
          ['Something either happens or it does not. The two probabilities add up to 1.', `P(not) = 1 ${M} ${F(p)}.`],
          `1 ${M} ${F(p)} = ${F(1 - p)}.`);
      }
      const d = pick([5, 7, 8, 9, 11, 12]), n = R(1, d - 1);
      return fracQ(`The probability that a counter is red is ${fr(n, d)}.\nWhat is the probability that it is **not** red?`, d - n, d,
        ['The probability of red and the probability of not red add up to 1.', `1 = ${fr(d, d)}. So P(not red) = ${fr(d, d)} ${M} ${fr(n, d)}.`],
        `${fr(d, d)} ${M} ${fr(n, d)} = ${fr(d - n, d)}.`);
    };

    const scaleQ = () => {
      const EV = [[0, 'rolling a 7 on a normal dice'], [1 / 6, 'rolling a 5 on a fair dice'], [0.5, 'getting heads when you flip a fair coin'], [5 / 6, 'rolling a number less than 6 on a fair dice'], [1, 'rolling a number less than 7 on a normal dice']];
      const used = U.sample(EV, 4).sort((a, b) => a[0] - b[0]);
      const labels = U.shuffle(['A', 'B', 'C', 'D']);
      const target = pick(used), k = used.indexOf(target);
      return choice(`Which letter on the probability scale shows the probability of ${target[1]}?`, labels[k], labels.filter((l, i) => i !== k),
        ['0 means impossible, 1 means certain, and 0.5 (halfway) means even chance.', 'Is the event impossible, unlikely, even chance, likely or certain? Find that part of the scale.'],
        `The probability of ${target[1]} is ${target[0] === 0 || target[0] === 1 || target[0] === 0.5 ? F(target[0]) : fr(Math.round(target[0] * 6), 6)}, so it is at ${labels[k]}.`,
        { visual: { type: 'numberLine', min: 0, max: 1, step: 0.1, labelEvery: 5, points: used.map((e, i) => ({ at: U.round(e[0], 3), label: labels[i] })) } });
    };

    const compareBags = () => {
      const r = retry(() => {
        const a = R(1, 6), b = R(2, 9), c = R(1, 6), d = R(2, 9);
        return a * (c + d) !== c * (a + b) && a + b <= 12 && c + d <= 12 ? { a, b, c, d } : null;
      });
      const pA = r.a / (r.a + r.b), pB = r.c / (r.c + r.d), ans = pA > pB ? 'Bag A' : 'Bag B';
      const L_ = U.lcm(r.a + r.b, r.c + r.d);
      return choice(`Bag A has ${r.a} red and ${r.b} blue marbles.\nBag B has ${r.c} red and ${r.d} blue marbles.\nYou take one marble from one bag. Which bag gives the better chance of getting red?`, ans,
        [ans === 'Bag A' ? 'Bag B' : 'Bag A', 'Both bags give the same chance'],
        ['Write the probability of red for each bag as a fraction. Then compare the fractions.', `P(red from A) = ${fr(r.a, r.a + r.b)} and P(red from B) = ${fr(r.c, r.c + r.d)}. Write both with denominator ${L_}.`],
        `${fr(r.a, r.a + r.b)} = ${fr(r.a * L_ / (r.a + r.b), L_)} and ${fr(r.c, r.c + r.d)} = ${fr(r.c * L_ / (r.c + r.d), L_)}. ${ans} has the bigger probability.`);
    };

    PMLM.registerSkill({
      id: 'g7.probability', grade: 7, unit: 'g7.u5', title: 'Probability', icon: '🎲',
      blurb: 'The 0 to 1 scale and equally likely outcomes',
      lesson: [
        { title: 'The probability scale',
          text: 'Probability measures how likely something is, from **0** to **1**.\n0 = impossible, 0.5 = even chance, 1 = certain.\nUnlikely events are near 0. Likely events are near 1.',
          visual: { type: 'numberLine', min: 0, max: 1, step: 0.1, labelEvery: 5, points: [{ at: 0, label: 'impossible' }, { at: 0.5, label: 'even' }, { at: 1, label: 'certain' }] } },
        { title: 'Equally likely outcomes',
          text: 'When all outcomes are equally likely:\nP(event) = {number of ways it can happen/total number of outcomes}\nThis bag has 3 red and 5 blue marbles. P(red) = {3/8}.',
          visual: { type: 'bag', items: [{ color: 'red', count: 3 }, { color: 'blue', count: 5 }] } },
        { title: 'Spinners and dice',
          text: 'A fair dice has 6 equally likely outcomes: 1, 2, 3, 4, 5, 6.\nP(even) = {3/6} = {1/2}\nOn this spinner, P(blue) = {2/5}.',
          visual: { type: 'spinner', sectors: [{ color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'blue' }, { color: 'yellow' }] } },
        { title: 'Not happening',
          text: 'P(it happens) + P(it does not happen) = 1\nIf P(rain) = 0.3, then P(no rain) = 1 − 0.3 = 0.7.\nIf P(red) = {3/8}, then P(not red) = {5/8}.' },
        { title: 'Worked example',
          text: 'A bag has 4 green, 2 yellow and 6 red counters. Find P(green).\n**1.** Total counters: 4 + 2 + 6 = 12.\n**2.** Green counters: 4.\n**3.** P(green) = {4/12}.\n**4.** Simplify: {4/12} = **{1/3}**.' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [wordsQ, wordsQ, bagQ, bagQ, diceQ, scaleQ],
          [bagQ, spinnerQ, diceQ, notQ, scaleQ, wordsQ],
          [bagQ, spinnerQ, diceQ, notQ, compareBags, compareBags],
        ], ctx);
      },
    });
  }
})();
