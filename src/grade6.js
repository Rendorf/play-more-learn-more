// Play More Learn More — Cambridge Primary Mathematics, Stage 6 (Grade 6, age about 11).
// Plain browser script: runs after src/util.js and only calls PMLM.registerUnit / PMLM.registerSkill.
// See src/CONTRACT.md for the shapes used here.
(() => {
  // ---------- small local helpers ----------
  const M = U.MINUS;
  const f = U.fmt;
  const fr = U.frac;
  const mx = U.mixed;
  const R = (x, dp = 8) => U.round(x, dp);
  const p10 = k => Math.pow(10, k);
  const L = (level, a, b, c) => (level === 1 ? a : level === 2 ? b : c);
  const run = list => U.pick(list)();
  const pl = n => (n === 1 ? '' : 's');
  const vis = v => (v ? { visual: v } : {});
  const names2 = () => {
    const a = U.name();
    let b = U.name();
    while (b === a) b = U.name();
    return [a, b];
  };
  const nonTen = (a, b) => {
    let m;
    do { m = U.rint(a, b); } while (m % 10 === 0);
    return m;
  };
  const money = x => (Number.isInteger(R(x, 2)) ? f(R(x, 2)) : f(x, 2));

  const num = (q, answer, hints, explain, extra) => Object.assign({ q, kind: 'number', answer, hints, explain }, extra || {});
  const fracQ = (q, n, d, hints, explain, extra) =>
    Object.assign({ q, kind: 'fraction', answer: U.simplify(n, d), hints, explain }, extra || {});
  const chq = (q, answer, choices, hints, explain, extra) =>
    Object.assign({ q, kind: 'choice', answer: String(answer), choices, hints, explain }, extra || {});
  const coordQ = (q, x, y, hints, explain, extra) => Object.assign({ q, kind: 'coord', answer: [x, y], hints, explain }, extra || {});
  // choices from strings, dropping copies of the answer
  const pick4 = (answer, distractors, n = 4) => U.choices(String(answer), distractors.filter(d => String(d) !== String(answer)), n);
  // choices from [string, value] pairs: no two options may have the same value (e.g. {2/4} and {1/2})
  const byValue = (ansStr, ansVal, opts, n = 4) => {
    const out = [[ansStr, ansVal]];
    for (const [s, v] of opts) {
      if (out.length >= n) break;
      if (!Number.isFinite(v)) continue;
      if (out.some(([s2, v2]) => s2 === s || Math.abs(v2 - v) < 1e-9)) continue;
      out.push([s, v]);
    }
    return U.shuffle(out.map(o => o[0]));
  };
  const andList = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
  // "+ 3" / "− 3"
  const signed = c => (c < 0 ? `${M} ${f(-c)}` : `+ ${f(c)}`);

  // Times-table hint: the first step of a × b, using a fact the child already knows.
  const mulStep = (a, b) => {
    if (a === 2) return `Double ${b}: ${b} + ${b}.`;
    if (a === 3) return `2 × ${b} = ${2 * b}. Now add one more ${b}.`;
    if (a === 4) return `2 × ${b} = ${2 * b}. Now double that.`;
    if (a === 5) return `10 × ${b} = ${10 * b}. Now halve it.`;
    if (a >= 6 && a <= 8) return `5 × ${b} = ${5 * b}. Now add ${a - 5} more lot${pl(a - 5)} of ${b}.`;
    if (a === 9) return `10 × ${b} = ${10 * b}. Now take away one lot of ${b}.`;
    if (a === 10) return `Multiplying by 10 moves every digit one place to the left.`;
    if (a === 11) return `10 × ${b} = ${10 * b}. Now add one more lot of ${b}.`;
    if (a === 12) return `10 × ${b} = ${10 * b}. Now add 2 × ${b} = ${2 * b}.`;
    return `Split ${a} into tens and ones and multiply each part by ${b}.`;
  };

  const PLACE = { 3: 'thousands', 2: 'hundreds', 1: 'tens', 0: 'ones', [-1]: 'tenths', [-2]: 'hundredths', [-3]: 'thousandths' };
  const leadPow = x => Math.floor(Math.log10(x) + 1e-9);
  const SING = { 3: 'thousand', 2: 'hundred', 1: 'ten', 0: 'one', [-1]: 'tenth', [-2]: 'hundredth', [-3]: 'thousandth' };
  const firstDigitStep = (x, shift) => {
    const lp = leadPow(x);
    const d0 = Math.floor(R(x / p10(lp)));
    const nm = p => (d0 === 1 ? SING[p] : PLACE[p]);
    return `Start with the first digit: ${d0} ${nm(lp)} becomes ${d0} ${nm(lp + shift)}.`;
  };

  // =====================================================================
  // Unit 1: Place value
  // =====================================================================
  PMLM.registerUnit({ id: 'g6.u1', grade: 6, name: 'Place value', icon: '🔢' });

  // ---------- 1. Decimals and place value ----------
  PMLM.registerSkill({
    id: 'g6.placeValue', grade: 6, unit: 'g6.u1', title: 'Decimals and place value', icon: '🔟',
    blurb: 'Decimals to 3 places; × and ÷ by 10, 100 and 1000',
    lesson: [
      {
        title: 'Places after the point',
        text: 'After the decimal point come **tenths**, **hundredths** and **thousandths**.\nIn 4.736 there are 4 ones, 7 tenths, 3 hundredths and 6 thousandths.',
        visual: { type: 'placeValue', value: '4.736' }
      },
      {
        title: 'What is a digit worth?',
        text: 'A digit\'s value depends on its **place**.\nThe 7 in 4.736 is in the tenths place, so it is worth **0.7**.\nThe 6 is in the thousandths place, so it is worth **0.006**.',
        visual: { type: 'table', headers: ['Digit', 'Place', 'Value'], rows: [['4', 'ones', '4'], ['7', 'tenths', '0.7'], ['3', 'hundredths', '0.03'], ['6', 'thousandths', '0.006']] }
      },
      {
        title: '× and ÷ by 10, 100, 1000',
        text: 'When you **multiply**, the digits move to the **left** and the number gets bigger.\nWhen you **divide**, the digits move to the **right** and the number gets smaller.\n10 → 1 place, 100 → 2 places, 1000 → 3 places.',
        visual: { type: 'table', headers: ['Calculation', 'Answer'], rows: [['3.52 × 10', '35.2'], ['3.52 × 100', '352'], ['3.52 × 1000', '3520'], ['3.52 ÷ 10', '0.352']] }
      },
      {
        title: 'Tip: count the zeros',
        text: 'The number of zeros tells you how many places to move: 1000 has **3** zeros, so move **3** places.\nFill any empty places with **0**: 4.7 × 100 = 470.\nThe decimal point stays still. The digits move!',
        visual: { type: 'placeValue', value: '470' }
      },
      {
        title: 'Worked example: 6.4 ÷ 100',
        text: '1. 100 has 2 zeros, so the digits move **2 places to the right**.\n2. 6 ones becomes 6 hundredths. 4 tenths becomes 4 thousandths.\n3. Fill the empty ones and tenths places with 0.\n4. So **6.4 ÷ 100 = 0.064**.',
        visual: { type: 'placeValue', value: '0.064' }
      }
    ],
    gen(level, ctx) {
      const cur = ctx.currency;

      const valueOfDigit = () => {
        const nInt = L(level, 1, U.rint(1, 2), U.rint(1, 3));
        const dp = L(level, 2, 3, 3);
        const digs = U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], nInt + dp);
        const str = digs.slice(0, nInt).join('') + '.' + digs.slice(nInt).join('');
        const i = U.rint(nInt, nInt + dp - 1);
        const d = digs[i], pw = nInt - 1 - i;
        const val = p => f(R(d * p10(p)));
        const ans = val(pw);
        return chq(`What is the value of the digit **${d}** in **${str}**?`, ans,
          pick4(ans, [val(pw + 1), val(pw - 1), val(pw + 2)]),
          ['After the decimal point the places are tenths, then hundredths, then thousandths.',
            `The ${d} is the ${U.ord(i - nInt + 1)} digit after the point, so it is in the **${PLACE[pw]}** place.`],
          `The ${d} is in the ${PLACE[pw]} place, so it is worth ${ans}.`,
          { visual: { type: 'placeValue', value: str, highlight: i } });
      };

      const mulDiv = () => {
        for (;;) {
          const k = L(level, U.rint(1, 2), U.rint(1, 3), U.rint(2, 3));
          const p = p10(k);
          const mul = Math.random() < 0.5;
          const dpB = mul ? L(level, 1, U.rint(1, 2), U.rint(1, 3)) : Math.min(3 - k, L(level, 0, U.rint(0, 1), U.rint(0, 2)));
          const m = nonTen(...L(level, [2, 99], [11, 999], [11, 9999]));
          const base = R(m / p10(dpB));
          const res = R(mul ? base * p : base / p);
          if (base >= 10000 || res >= 10000) continue;
          const op = mul ? '×' : '÷', dir = mul ? 'left' : 'right';
          return num(`${f(base)} ${op} ${f(p)} = ?`, res,
            [`${f(p)} has ${k} zero${pl(k)}, so every digit moves ${k} place${pl(k)} to the **${dir}**.`,
              firstDigitStep(base, mul ? k : -k)],
            `The digits move ${k} place${pl(k)} to the ${dir}: ${f(base)} ${op} ${f(p)} = ${f(res)}.`,
            { visual: { type: 'placeValue', value: f(base) } });
        }
      };

      const missing = () => {
        const k = L(level, U.rint(1, 2), U.rint(1, 3), U.rint(1, 3)), p = p10(k);
        const base = R(nonTen(11, 99) / 10);
        const big = R(base * p);
        const d0 = Math.floor(base);
        const v = level === 1 ? U.rint(0, 1) : U.rint(0, 2);
        const look = 'Compare the two numbers. How many places have the digits moved?';
        if (v === 0) {
          return num(`${f(base)} × □ = ${f(big)}`, p,
            [look, `The ${d0} has moved from the ones place to the ${PLACE[k]} place.`],
            `The digits moved ${k} place${pl(k)} to the left, so □ = ${f(p)}.`);
        }
        if (v === 1) {
          return num(`${f(big)} ÷ □ = ${f(base)}`, p,
            [look, `The ${d0} has moved from the ${PLACE[k]} place to the ones place.`],
            `The digits moved ${k} place${pl(k)} to the right, so □ = ${f(p)}.`);
        }
        return num(`□ × ${f(p)} = ${f(big)}`, base,
          [`Work backwards: divide ${f(big)} by ${f(p)}.`, firstDigitStep(big, -k)],
          `□ = ${f(big)} ÷ ${f(p)} = ${f(base)}.`);
      };

      const mistake = () => {
        const nm = U.name();
        if (Math.random() < 0.5) {
          const base = R(nonTen(11, 99) / 10);
          const k = L(level, 1, U.rint(1, 2), U.rint(2, 3)), p = p10(k);
          const ans = f(R(base * p));
          const wrong = f(base) + '0'.repeat(k);
          return chq(`${nm} says ${f(base)} × ${f(p)} = ${wrong}. What is the correct answer?`, ans,
            pick4(ans, [wrong, ...(k > 1 ? [f(R(base * p / 10))] : []), f(R(base * p * 10)), f(R(base + p))]),
            ['Putting zeros on the end of a decimal does not change its value. The digits must move.',
              firstDigitStep(base, k)],
            `${wrong} is worth the same as ${f(base)}, so nothing changed! The digits move ${k} place${pl(k)} left: ${f(base)} × ${f(p)} = ${ans}.`);
        }
        const m = nonTen(11, 99);
        const k = L(level, 2, U.rint(2, 3), 3), p = p10(k);
        const ans = f(R(m / p)), wrong = f(R(m * 10 / p));
        return chq(`${nm} says ${m} ÷ ${f(p)} = ${wrong}. What is the correct answer?`, ans,
          pick4(ans, [wrong, f(m * p), f(R(m / p / 10))]),
          [`${f(p)} has ${k} zeros. How many places should the digits move?`,
            `${nm} only moved the digits ${k - 1} place${pl(k - 1)}. They need to move ${k} places to the right.`],
          `Dividing by ${f(p)} moves the digits ${k} places to the right: ${m} ÷ ${f(p)} = ${ans}.`);
      };

      const word = () => {
        let t = U.rint(0, 2);
        const k = L(level, U.rint(1, 2), U.rint(1, 3), U.rint(2, 3)), n = p10(k);
        if (t === 1 && n < 100) t = 2;
        if (t === 0) {
          const price = R(nonTen(11, 99) / 100);
          const tot = R(price * n);
          return num(`One sticker costs ${cur}${f(price, 2)}. How much do ${f(n)} stickers cost?`, tot,
            [`Multiply by ${f(n)}: every digit moves ${k} place${pl(k)} to the left.`, firstDigitStep(price, k)],
            `${f(price, 2)} × ${f(n)} = ${money(tot)}, so ${f(n)} stickers cost ${cur}${money(tot)}.`, { prefix: cur });
        }
        if (t === 1) {
          const h = nonTen(11, 99);
          const one = R(h / n);
          const thing = n === 100 ? 'thin card' : 'paper';
          return num(`A pile of ${f(n)} identical sheets of ${thing} is ${h} mm high. How thick is one sheet?`, one,
            [`Divide by ${f(n)}: every digit moves ${k} place${pl(k)} to the right.`, firstDigitStep(h, -k)],
            `${h} ÷ ${f(n)} = ${f(one)}, so one sheet is ${f(one)} mm thick.`, { unit: 'mm' });
        }
        let w, unit, thing;
        if (n === 10) { w = R(nonTen(11, 99) / 10); unit = 'kg'; thing = 'books'; }
        else { w = nonTen(11, 99) * 10; unit = 'g'; thing = n === 100 ? 'pencils' : 'paper clips'; }
        const one = R(w / n);
        return num(`${f(n)} identical ${thing} weigh ${f(w)} ${unit} altogether. How much does one weigh?`, one,
          [`Share the weight equally: divide by ${f(n)}.`, firstDigitStep(w, -k)],
          `${f(w)} ÷ ${f(n)} = ${f(one)}, so one weighs ${f(one)} ${unit}.`, { unit });
      };

      const order = () => {
        const a = U.rint(1, 8), b = U.rint(1, 9);
        const vals = [R(a / 10 + b / 100), R(a / 10 + b / 1000), R((a + 1) / 10), R(a / 100 + b / 1000)];
        const big = Math.random() < 0.5;
        const ans = big ? vals[2] : vals[3];
        const sorted = vals.slice().sort((x, y) => x - y);
        return chq(`Which number is the **${big ? 'largest' : 'smallest'}**?`, f(ans), U.shuffle(vals.map(v => f(v))),
          ['A longer decimal is not always bigger! Compare the tenths first, then the hundredths.',
            `Give them all 3 decimal places: ${vals.map(v => f(v, 3)).join(', ')}.`],
          `In order from smallest to largest: ${sorted.map(v => f(v)).join(', ')}. The ${big ? 'largest' : 'smallest'} is ${f(ans)}.`);
      };

      return run(L(level,
        [valueOfDigit, mulDiv, mulDiv, word, mistake],
        [valueOfDigit, mulDiv, missing, mistake, word, order],
        [valueOfDigit, mulDiv, missing, mistake, word, order]));
    }
  });

  // ---------- 2. Rounding ----------
  const TARGET = { 1: '1 decimal place', 0: 'the nearest whole number', [-1]: 'the nearest ten', [-2]: 'the nearest hundred', [-3]: 'the nearest thousand' };
  // m is an integer meaning m ÷ 10^dpIn; round it to toDp decimal places (negative = tens, hundreds…)
  const roundInfo = (m, dpIn, toDp) => {
    const P = p10(dpIn - toDp), s = p10(dpIn);
    const lo = Math.floor(m / P) * P, hi = lo + P;
    const dd = Math.floor(m / (P / 10)) % 10;
    const up = dd >= 5;
    const out = v => R(v / s);
    return { x: out(m), lo: out(lo), hi: out(hi), ans: out(up ? hi : lo), dd, up, dp: Math.max(toDp, 0), dname: PLACE[-toDp - 1], target: TARGET[toDp] };
  };
  const roundHints = r => [
    `To round to ${r.target}, look at the **${r.dname}** digit. 5 or more: round up. 4 or less: round down.`,
    `${f(r.x)} is between ${f(r.lo, r.dp)} and ${f(r.hi, r.dp)}. The ${r.dname} digit is **${r.dd}**.`
  ];
  const roundExplain = r =>
    `${f(r.x)} is between ${f(r.lo, r.dp)} and ${f(r.hi, r.dp)}. The ${r.dname} digit is ${r.dd}, so round ${r.up ? 'up' : 'down'} to ${f(r.ans, r.dp)}.`;
  const roundLine = r => ({ type: 'numberLine', min: r.lo, max: r.hi, step: R((r.hi - r.lo) / 10), labelEvery: 5, points: [{ at: r.x, label: f(r.x) }] });

  PMLM.registerSkill({
    id: 'g6.rounding', grade: 6, unit: 'g6.u1', title: 'Rounding', icon: '🎯',
    blurb: 'Round to the nearest 10, 100, 1000, whole or 1 d.p.',
    lesson: [
      {
        title: 'What rounding means',
        text: 'Rounding gives a **simpler number that is close**.\n47 rounded to the nearest ten is **50**, because 47 is closer to 50 than to 40.',
        visual: { type: 'numberLine', min: 40, max: 50, step: 1, labelEvery: 5, points: [{ at: 47, label: '47' }] }
      },
      {
        title: 'The deciding digit',
        text: 'Look at the digit **just to the right** of the place you are rounding to.\n**5 or more** → round **up**.\n**4 or less** → round **down**.',
        visual: { type: 'table', headers: ['Round to…', 'Look at the…'], rows: [['nearest ten', 'ones digit'], ['nearest hundred', 'tens digit'], ['nearest thousand', 'hundreds digit'], ['whole number', 'tenths digit'], ['1 decimal place', 'hundredths digit']] }
      },
      {
        title: 'Rounding decimals',
        text: '3.67 to the nearest **whole number**: the tenths digit is 6, so round up to **4**.\n3.67 to **1 decimal place**: the hundredths digit is 7, so round up to **3.7**.',
        visual: { type: 'numberLine', min: 3.6, max: 3.7, step: 0.01, labelEvery: 5, points: [{ at: 3.67, label: '3.67' }] }
      },
      {
        title: 'Tip: watch out for 9s',
        text: 'Rounding up a 9 makes a carry.\n2.96 to 1 decimal place is **3.0** (not 2.10!).\n4950 to the nearest hundred is **5000**.',
        visual: { type: 'placeValue', value: '2.96' }
      },
      {
        title: 'Worked example: 6381',
        text: 'Round 6381 to the nearest hundred.\n1. The answer is either 6300 or 6400.\n2. Look at the digit to the right of the hundreds: the tens digit is **8**.\n3. 8 is 5 or more, so round up.\n4. **6381 ≈ 6400**.',
        visual: { type: 'numberLine', min: 6300, max: 6400, step: 10, labelEvery: 5, points: [{ at: 6381, label: '6381' }] }
      }
    ],
    gen(level, ctx) {
      const cur = ctx.currency;

      const roundInt = () => {
        const toDp = U.pick(L(level, [-1, -2], [-1, -2, -3], [-2, -3]));
        const P = p10(-toDp);
        let n;
        if (level === 3 && Math.random() < 0.35) {
          const A = P === 100 ? U.rint(10, 99) : U.rint(1, 9);
          n = A * 10 * P + 9 * P + U.rint(5, 9) * (P / 10) + U.rint(0, P / 10 - 1);
        } else {
          do { n = L(level, U.rint(101, 999), U.rint(1001, 9999), U.rint(10001, 99999)); } while (n % P === 0);
        }
        const r = roundInfo(n, 0, toDp);
        return num(`Round **${f(n)}** to ${r.target}.`, r.ans, roundHints(r), roundExplain(r), vis(level === 1 && roundLine(r)));
      };

      const roundDec = () => {
        let r;
        if (level === 1) r = roundInfo(nonTen(11, 199), 1, 0);
        else {
          const toDp = Math.random() < 0.4 ? 0 : 1;
          const m = level === 3 && Math.random() < 0.4 ? U.rint(1, 19) * 100 + 90 + U.rint(5, 9) : nonTen(101, 1999);
          r = roundInfo(m, 2, toDp);
        }
        return num(`Round **${f(r.x)}** to ${r.target}.`, r.ans, roundHints(r), roundExplain(r),
          vis((level === 1 || (level === 2 && Math.random() < 0.5)) && roundLine(r)));
      };

      const whichRounds = () => {
        let unit, P, T, desc;
        if (level === 1) { unit = 1; P = 10; T = U.rint(2, 9) * 10; desc = 'the nearest ten'; }
        else if (level === 2 && Math.random() < 0.5) { unit = 1; P = 100; T = U.rint(2, 9) * 100; desc = 'the nearest hundred'; }
        else { unit = 0.01; P = 10; do { T = U.rint(11, 99) * 10; } while (T % 100 === 0); desc = '1 decimal place'; }
        const dp = unit < 1 ? 1 : 0;
        const show = v => f(R(v * unit));
        const rnd = v => Math.round(v / P) * P;
        const half = P / 2;
        let c;
        do { c = T + U.rint(-half, half - 1); } while (c === T || (unit < 1 && c % 10 === 0));
        const cands = [T + U.rint(half, P - 1), T - U.rint(half + 1, P - 1), T + P + U.rint(1, half - 1), T - P - U.rint(1, half - 1)];
        if (unit < 1) cands.splice(1, 0, Math.floor(T / 100) * 100 + (T / 10) % 10);
        const dist = cands.filter(v => v > 0 && rnd(v) !== T && v % 10 !== 0);
        const Ts = f(R(T * unit), dp);
        const ex = dist[0];
        const nb = c > T ? T + P : T - P;
        return chq(`Which number rounds to **${Ts}** to ${desc}?`, show(c), pick4(show(c), dist.map(show)),
          [`Round each number to ${desc}. Which one gives ${Ts}?`,
            `For example, ${show(ex)} rounds to ${f(R(rnd(ex) * unit), dp)}, not ${Ts}.`],
          `${show(c)} is closer to ${Ts} than to ${f(R(nb * unit), dp)}, so it rounds to ${Ts}.`);
      };

      const mistake = () => {
        const nm = U.name();
        if (level === 3 && Math.random() < 0.5) {
          const A = U.rint(1, 19), h = U.rint(5, 9);
          const x = R(A + 0.9 + h / 100);
          const right = f(A + 1, 1), wrong = `${A}.10`, down = f(R(A + 0.9), 1);
          return chq(`${nm} rounded ${f(x)} to 1 decimal place and wrote ${wrong}. What is the correct answer?`, right,
            U.shuffle([right, wrong, down]),
            ['The hundredths digit is 5 or more, so the tenths digit goes up by 1. But the tenths digit is a 9!',
              '10 tenths make 1 whole, so rounding up 9 tenths changes the ones digit too.'],
            `The hundredths digit is ${h}, so round up. 9 tenths + 1 tenth = 1 whole, so ${f(x)} rounds to ${right}.`);
        }
        const toDp = L(level, -2, -3, -3), q = toDp + 1;
        let n, r, wrong;
        do {
          n = L(level, U.rint(101, 999), U.rint(1001, 9999), U.rint(10001, 99999));
          r = roundInfo(n, 0, toDp);
          wrong = roundInfo(n, 0, q).ans;
        } while (n % 10 === 0 || wrong === r.ans || wrong % p10(-toDp) === 0);
        const other = r.up ? r.lo : r.hi;
        return chq(`${nm} rounded ${f(n)} to ${r.target} and got ${f(wrong)}. What is the correct answer?`, f(r.ans),
          pick4(f(r.ans), [f(wrong), f(other)]),
          [`Rounding to ${r.target} gives an answer that ends in ${toDp === -2 ? '00' : '000'}.`,
            `${f(n)} is between ${f(r.lo)} and ${f(r.hi)}. Look at the ${r.dname} digit.`],
          `${nm} rounded to ${TARGET[q]} by mistake. The ${r.dname} digit is ${r.dd}, so ${f(n)} rounds to ${f(r.ans)}.`);
      };

      const word = () => {
        const t = U.rint(0, 2);
        if (t === 0) {
          const toDp = L(level, -1, -2, -3);
          let n;
          do { n = L(level, U.rint(101, 999), U.rint(1001, 9999), U.rint(10001, 99999)); } while (n % 10 === 0);
          const r = roundInfo(n, 0, toDp);
          const story = U.pick([`A stadium holds ${f(n)} people.`, `A school library has ${f(n)} books.`, `${f(n)} people visited a museum last month.`]);
          return num(`${story} Round this number to ${r.target}.`, r.ans, roundHints(r), roundExplain(r));
        }
        if (t === 1) {
          const r = level === 1 ? roundInfo(nonTen(11, 199), 1, 0) : roundInfo(nonTen(101, 999), 2, U.rint(0, 1));
          const item = U.pick([['A pencil is', 'long', 'cm'], ['A bag of rice weighs', '', 'kg'], ['A jug holds', 'of water', 'litres']]);
          return num(`${item[0]} ${f(r.x)} ${item[2]}${item[1] ? ' ' + item[1] : ''}. Round this to ${r.target}.`, r.ans,
            roundHints(r), roundExplain(r), { unit: item[2] });
        }
        const r = roundInfo(nonTen(101, L(level, 999, 4999, 9999)), 2, 0);
        return num(`A book costs ${cur}${f(r.x, 2)}. Round the price to the nearest whole number.`, r.ans,
          roundHints(r), roundExplain(r), { prefix: cur });
      };

      const range = () => {
        const p = U.pick([10, 100]);
        const T = U.rint(3, 20) * p;
        const small = Math.random() < 0.5;
        const ans = small ? T - p / 2 : T + p / 2 - 1;
        const W = p === 10 ? 'ten' : 'hundred';
        return num(`A whole number rounds to **${f(T)}** to the nearest ${W}. What is the **${small ? 'smallest' : 'largest'}** it could be?`, ans,
          [`It must be closer to ${f(T)} than to ${f(T - p)} or ${f(T + p)}. Halfway numbers round **up**.`,
            small ? `Try ${f(T - p / 2 - 1)}: it rounds down to ${f(T - p)}. What about the next number up?`
              : `Try ${f(T + p / 2)}: it is halfway, so it rounds up to ${f(T + p)}. What about the number just below it?`],
          small ? `${f(T - p / 2)} is halfway, and halfway rounds up to ${f(T)}. ${f(T - p / 2 - 1)} rounds down. So the smallest is ${f(ans)}.`
            : `${f(T + p / 2)} rounds up to ${f(T + p)}, so the largest number that rounds to ${f(T)} is ${f(ans)}.`);
      };

      return run(L(level,
        [roundInt, roundInt, roundDec, whichRounds, word],
        [roundInt, roundDec, roundDec, whichRounds, mistake, word],
        [roundInt, roundDec, whichRounds, mistake, word, range]));
    }
  });

  // ---------- 3. Negative numbers ----------
  // a number line from lo to hi (step 1, labels every 5), or null if it would be too long
  const nlFor = (lo, hi, points) => {
    const min = Math.floor((lo - 1) / 5) * 5, max = Math.ceil((hi + 1) / 5) * 5;
    if (max - min > 24) return null;
    return { type: 'numberLine', min, max, step: 1, labelEvery: 5, points };
  };

  PMLM.registerSkill({
    id: 'g6.negatives', grade: 6, unit: 'g6.u1', title: 'Negative numbers', icon: '🌡️',
    blurb: 'Order negatives, count through zero, temperatures',
    lesson: [
      {
        title: 'Below zero',
        text: 'Numbers **less than zero** are **negative**. We write them with a minus sign: −3 means 3 below zero.\nOn a thermometer, −3 °C is colder than 0 °C.',
        visual: { type: 'thermometer', value: -3, min: -10, max: 10 }
      },
      {
        title: 'Which is bigger?',
        text: 'On a number line, numbers get **bigger to the right**.\n−2 is bigger than −7, because −2 is further right (closer to zero).\nThe further below zero, the smaller the number.',
        visual: { type: 'numberLine', min: -10, max: 5, step: 1, labelEvery: 5, points: [{ at: -7, label: '−7' }, { at: -2, label: '−2' }] }
      },
      {
        title: 'Counting through zero',
        text: 'Start at −4 and count on 6.\nJump to zero first: −4 to 0 is **4** steps.\nThen 2 more steps: 0 to **2**.\nSo −4 + 6 = 2.',
        visual: { type: 'numberLine', min: -5, max: 5, step: 1, labelEvery: 5, jumps: [{ from: -4, to: 0, label: '4' }, { from: 0, to: 2, label: '2' }] }
      },
      {
        title: 'Temperature differences',
        text: 'The difference between −5 °C and 3 °C:\n−5 up to 0 is **5** degrees, then 0 up to 3 is **3** degrees.\n5 + 3 = **8** degrees.\nTip: when one is below zero and one is above, **add** the distances from zero.',
        visual: { type: 'numberLine', min: -5, max: 5, step: 1, labelEvery: 5, jumps: [{ from: -5, to: 0, label: '5' }, { from: 0, to: 3, label: '3' }] }
      },
      {
        title: 'Worked example: falling',
        text: 'It is 2 °C. The temperature falls by 7 degrees. What is the new temperature?\n1. Falling means counting **down**.\n2. From 2 down to 0 uses 2 degrees. 7 − 2 = 5 degrees still to go.\n3. 5 below zero is **−5 °C**.',
        visual: { type: 'thermometer', value: 2, min: -10, max: 10 }
      }
    ],
    gen(level) {
      const tempDiff = () => {
        for (;;) {
          let a, b;
          if (level === 1) { a = -U.rint(1, 8); b = U.rint(1, 9); }
          else if (level === 2) { a = -U.rint(2, 12); b = U.rint(1, 10); }
          else if (Math.random() < 0.5) { a = -U.rint(8, 18); b = -U.rint(1, 6); }
          else { a = -U.rint(4, 12); b = U.rint(3, 9); }
          const v = nlFor(a, b, [{ at: a, label: `${f(a)}°` }, { at: b, label: `${f(b)}°` }]);
          if (!v) continue;
          const both = b < 0;
          const q = both
            ? `It is ${f(a)} °C in one town and ${f(b)} °C in another. What is the difference between the two temperatures?`
            : `At night it was ${f(a)} °C. At midday it was ${f(b)} °C. How many degrees warmer was it at midday?`;
          return num(q, b - a,
            both ? [`Count up from the colder temperature, ${f(a)} °C, to the warmer one, ${f(b)} °C.`,
              `${f(a)} is ${-a} degrees below zero and ${f(b)} is ${-b} degree${pl(-b)} below zero.`]
              : [`Count up from ${f(a)} to 0, then from 0 to ${f(b)}.`, `From ${f(a)} up to 0 is ${-a} degree${pl(-a)}.`],
            both ? `${-a} − ${-b} = ${b - a}, so the difference is ${b - a} degrees.`
              : `${f(a)} up to 0 is ${-a} degree${pl(-a)}, then 0 up to ${b} is ${b} degree${pl(b)}. ${-a} + ${b} = ${b - a} degrees.`,
            { unit: '°C', visual: v });
        }
      };

      const riseFall = () => {
        for (;;) {
          const start = L(level, U.rint(-6, 6), U.rint(-10, 10), U.rint(-15, 12));
          const ch = U.rint(3, L(level, 9, 12, 15));
          const up = Math.random() < 0.5;
          const end = up ? start + ch : start - ch;
          const crosses = (start < 0 && end > 0) || (start > 0 && end < 0);
          const lim = level === 1 ? 10 : 20;
          if ((level < 3 && !crosses) || start === 0 || Math.abs(end) > lim) continue;
          const a = Math.abs(start);
          const steps = [1, 2, 3].map(i => f(start + (up ? i : -i))).join(', ');
          return num(`The temperature is ${f(start)} °C. It ${up ? 'rises' : 'falls'} by ${ch} degrees. What is the new temperature?`, end,
            [up ? 'Rising means counting **up** the thermometer.' : 'Falling means counting **down** the thermometer.',
              crosses ? `First go ${up ? 'up' : 'down'} to 0. That uses ${a} degree${pl(a)}, so you still have ${ch - a} to go.`
                : `Count ${up ? 'up' : 'down'} ${ch} from ${f(start)}: ${steps} …`],
            crosses ? `${f(start)} to 0 is ${a} degree${pl(a)}. ${ch} − ${a} = ${ch - a} more, so the new temperature is ${f(end)} °C.`
              : `Counting ${up ? 'up' : 'down'} ${ch} from ${f(start)} gives ${f(end)} °C.`,
            { unit: '°C', visual: { type: 'thermometer', value: start, min: -lim, max: lim } });
        }
      };

      const seq = () => {
        const step = U.rint(2, L(level, 3, 5, 9));
        const down = level === 1 || Math.random() < 0.6;
        const t0 = U.rint(1, 4 * step - 1);
        const terms = [0, 1, 2, 3, 4].map(i => t0 - i * step);
        if (!down) terms.reverse();
        const miss = level === 1 ? 4 : U.rint(1, 4);
        const ans = terms[miss];
        const prev = terms[miss - 1];
        return num(`What is the missing number?\n${terms.map((t, i) => (i === miss ? '□' : f(t))).join(', ')}`, ans,
          [`Find the step: how much does it go ${down ? 'down' : 'up'} each time?`,
            `It goes ${down ? 'down' : 'up'} by ${step} each time. Count through zero if you need to.`],
          `The rule is ${down ? 'subtract' : 'add'} ${step}. ${f(prev)} ${down ? '−' : '+'} ${step} = ${f(ans)}.`,
          { visual: { type: 'sequence', terms: terms.map((t, i) => (i === miss ? '?' : f(t))) } });
      };

      const order = (listMode) => {
        const vals = [];
        while (vals.length < 4) {
          const v = U.rint(-12, 9);
          if (!vals.some(w => Math.abs(w) === Math.abs(v))) vals.push(v);
        }
        const negs = vals.filter(v => v < 0);
        if (negs.length < 2) return order(listMode);
        const asc = vals.slice().sort((a, b) => a - b);
        const min = asc[0];
        if (listMode) {
          const show = arr => arr.map(v => f(v)).join(', ');
          const absOrd = vals.slice().sort((a, b) => Math.abs(a) - Math.abs(b));
          const negWrong = negs.slice().sort((a, b) => b - a).concat(vals.filter(v => v >= 0).sort((a, b) => a - b));
          const desc = asc.slice().reverse();
          return chq('Which list is in order from **smallest to largest**?', show(asc), pick4(show(asc), [show(negWrong), show(absOrd), show(desc)]),
            ['Negative numbers are smaller than zero. The further below zero, the smaller the number.',
              `The smallest number is ${f(min)}, because it is furthest below zero.`],
            `In order from smallest to largest: ${show(asc)}.`);
        }
        const temps = Math.random() < 0.6;
        const show = v => (temps ? `${f(v)} °C` : f(v));
        return chq(temps ? 'Which temperature is the **coldest**?' : 'Which number is the **smallest**?', show(min), U.shuffle(vals.map(show)),
          ['On a number line, smaller numbers are further to the left. The further below zero, the smaller.',
            `The numbers below zero are ${andList(negs.map(v => f(v)))}. Which is furthest below zero?`],
          `${f(min)} is furthest below zero, so ${show(min)} is the ${temps ? 'coldest' : 'smallest'}.`);
      };

      const readLine = () => {
        let v, st, lo;
        if (level === 1) {
          do { v = Math.random() < 0.8 ? -U.rint(1, 9) : U.rint(1, 9); } while (v % 5 === 0);
          st = 1; lo = Math.floor(v / 5) * 5;
        } else {
          do { v = 2 * (Math.random() < 0.8 ? -U.rint(1, 9) : U.rint(1, 9)); } while (v % 10 === 0);
          st = 2; lo = Math.floor(v / 10) * 10;
        }
        const span = st * 5;
        const n = (v - lo) / st;
        return num('What number is at the **?** on the number line?', v,
          [`Each small step is worth ${st}. Find 0 first.`, `The ? is between ${f(lo)} and ${f(lo + span)}.`],
          `From ${f(lo)}, count ${n} step${pl(n)} of ${st} to the right: the ? is at ${f(v)}.`,
          { visual: { type: 'numberLine', min: -10 * st, max: 10 * st, step: st, labelEvery: 5, points: [{ at: v, label: '?' }] } });
      };

      const mistake = () => {
        let a, b, wrong;
        do { a = -U.rint(2, 9); b = U.rint(2, 9); wrong = Math.abs(b + a); } while (wrong === 0);
        const nm = U.name();
        return num(`${nm} says the difference between ${f(a)} °C and ${b} °C is ${wrong} degrees. What is the correct difference?`, b - a,
          [`${nm} took one number away from the other. But ${f(a)} °C is below zero, so count up through zero.`,
            `From ${f(a)} up to 0 is ${-a} degrees.`],
          `From ${f(a)} to 0 is ${-a} degrees, and from 0 to ${b} is ${b} degrees. ${-a} + ${b} = ${b - a} degrees, not ${wrong}.`,
          { unit: '°C', visual: nlFor(a, b, [{ at: a, label: `${f(a)}°` }, { at: b, label: `${b}°` }]) });
      };

      return run(L(level,
        [tempDiff, riseFall, seq, () => order(false), readLine],
        [tempDiff, riseFall, seq, () => order(Math.random() < 0.5), readLine, mistake],
        [tempDiff, riseFall, seq, () => order(true), mistake]));
    }
  });

  // =====================================================================
  // Unit 2: Calculation
  // =====================================================================
  PMLM.registerUnit({ id: 'g6.u2', grade: 6, name: 'Calculation', icon: '✖️' });

  // ---------- 4. Times tables ----------
  PMLM.registerSkill({
    id: 'g6.timesTables', grade: 6, unit: 'g6.u2', title: 'Times tables to 12', icon: '⚡',
    blurb: 'Quick recall of tables to 12 × 12 and division facts',
    lesson: [
      {
        title: 'Facts come in families',
        text: 'One multiplication fact gives you **four** facts:\n7 × 8 = 56 and 8 × 7 = 56\n56 ÷ 7 = 8 and 56 ÷ 8 = 7',
        visual: { type: 'array', rows: 7, cols: 8 }
      },
      {
        title: 'Division is the inverse',
        text: 'To work out 72 ÷ 9, ask: **9 times what makes 72?**\n9 × 8 = 72, so 72 ÷ 9 = **8**.',
        visual: { type: 'objects', groups: [8, 8, 8, 8, 8, 8, 8, 8, 8] }
      },
      {
        title: 'Tricks for tricky tables',
        text: '**× 9**: times by 10, then take one lot away.\n**× 11** (up to 9 × 11): repeat the digit.\n**× 12**: times by 10, then add two lots.',
        visual: { type: 'table', headers: ['Fact', 'Trick'], rows: [['9 × 7', '70 − 7 = 63'], ['11 × 6', '66'], ['12 × 7', '70 + 14 = 84']] }
      },
      {
        title: 'Build from facts you know',
        text: 'Stuck on 6 × 8? Double 3 × 8.\n3 × 8 = 24, so 6 × 8 = **48**.\nStuck on 8 × 7? Swap it round: 7 × 8 is the same!',
        visual: { type: 'array', rows: 6, cols: 8 }
      },
      {
        title: 'Worked example: 84 ÷ 7',
        text: '1. Ask: 7 times what makes 84?\n2. 7 × 10 = 70. That leaves 84 − 70 = 14.\n3. 14 = 7 × 2, so 7 × 12 = 84.\n4. So **84 ÷ 7 = 12**.',
        visual: { type: 'objects', groups: [12, 12, 12, 12, 12, 12, 12] }
      }
    ],
    gen(level) {
      const lo = L(level, 2, 2, 6), hi = L(level, 10, 12, 12);
      const pair = () => [U.rint(lo, hi), U.rint(L(level, 2, 2, 3), hi)];
      const mstep = (a, b) => ((a === 10 && b !== 10) || (b < a && b <= 5) ? mulStep(b, a) : mulStep(a, b));
      const divStep = (a, c) => {
        const b = c / a;
        const anchor = b === 10 ? 5 : b === 5 ? 10 : b > 7 ? 10 : 5;
        const ac = a * anchor;
        return `${a} × ${anchor} = ${ac}. ${c} is ${c > ac ? 'more' : 'less'} than ${ac}, so the answer is ${c > ac ? 'more' : 'less'} than ${anchor}.`;
      };
      const countUp = (b, a, c) => {
        const list = [1, 2, 3].filter(k => k < a).map(k => k * b);
        return `Count up in ${b}s: ${list.join(', ')} … until you reach ${c}.`;
      };

      const mul = () => {
        const [a, b] = pair();
        return num(`${a} × ${b} = ?`, a * b,
          [`Use a fact you know and build from it. You can swap the order: ${a} × ${b} = ${b} × ${a}.`, mstep(a, b)],
          `${a} × ${b} = ${a * b}.`);
      };
      const div = () => {
        const [a, b] = pair(), c = a * b;
        return num(`${c} ÷ ${a} = ?`, b, [`Think: ${a} times what makes ${c}?`, divStep(a, c)], `${a} × ${b} = ${c}, so ${c} ÷ ${a} = ${b}.`);
      };
      const missing = () => {
        const [a, b] = pair(), c = a * b;
        if (Math.random() < 0.5) {
          return num(`□ × ${b} = ${c}`, a, [`Use the inverse: □ = ${c} ÷ ${b}.`, countUp(b, a, c)], `${a} × ${b} = ${c}, so □ = ${a}.`);
        }
        return num(`${c} ÷ □ = ${b}`, a, [`If ${c} ÷ □ = ${b}, then □ × ${b} = ${c}.`, countUp(b, a, c)],
          `${a} × ${b} = ${c}, so ${c} ÷ ${a} = ${b}. □ = ${a}.`);
      };
      const word = () => {
        const [a, b] = pair(), c = a * b;
        const t = U.rint(0, 2);
        if (t === 0) {
          return num(`A hall has ${b} rows of chairs with ${a} chairs in each row. How many chairs are there?`, c,
            [`${b} rows of ${a} means ${b} × ${a}.`, mstep(a, b)], `${b} × ${a} = ${c} chairs.`);
        }
        if (t === 1) {
          return num(`${c} stickers are shared equally between ${a} children. How many stickers does each child get?`, b,
            [`Sharing equally means dividing: ${c} ÷ ${a}.`, divStep(a, c)], `${c} ÷ ${a} = ${b}, because ${a} × ${b} = ${c}.`);
        }
        return num(`Pencils come in packs of ${a}. ${U.name()} needs exactly ${c} pencils. How many packs is that?`, b,
          [`How many ${a}s make ${c}? Work out ${c} ÷ ${a}.`, divStep(a, c)], `${c} ÷ ${a} = ${b}, so ${b} packs.`);
      };
      const wrongFact = () => {
        const facts = [], seen = new Set();
        while (facts.length < 4) {
          const [x, y] = pair();
          const k1 = `${x}x${y}`, k2 = `${y}x${x}`;
          if (seen.has(k1) || seen.has(k2)) continue;
          seen.add(k1);
          facts.push([x, y]);
        }
        const [x, y] = facts[0];
        const wrongVal = x * y + U.pick([-x, x, -y, y]);
        const bad = `${x} × ${y} = ${wrongVal}`;
        const good = facts.slice(1).map(([p, q]) => `${p} × ${q} = ${p * q}`);
        const [cx, cy] = facts[1];
        return chq('Which fact is **wrong**?', bad, U.shuffle([bad, ...good]),
          ['Check each fact. Use facts you are sure of to check the harder ones.', `Check one: ${cx} × ${cy} = ${cx * cy}. That one is right.`],
          `${x} × ${y} = ${x * y}, not ${wrongVal}. The other three facts are right.`);
      };
      const derived = () => {
        const [a, b] = pair(), c = a * b;
        if (Math.random() < 0.5) {
          return num(`${a * 10} × ${b} = ?`, c * 10,
            [`${a * 10} is 10 times ${a}. Use a times-table fact, then make it 10 times bigger.`, `${a} × ${b} = ${c}.`],
            `${a} × ${b} = ${c}, so ${a * 10} × ${b} = ${c * 10}.`);
        }
        return num(`${c * 10} ÷ ${a} = ?`, b * 10,
          [`${c * 10} is 10 times ${c}. Use a division fact, then make the answer 10 times bigger.`, `${c} ÷ ${a} = ${b}.`],
          `${c} ÷ ${a} = ${b}, so ${c * 10} ÷ ${a} = ${b * 10}.`);
      };

      return run(L(level,
        [mul, mul, div, missing, word],
        [mul, div, missing, word, wrongFact],
        [mul, div, missing, word, wrongFact, derived, derived]));
    }
  });

  // ---------- 5. Long multiplication ----------
  PMLM.registerSkill({
    id: 'g6.longMult', grade: 6, unit: 'g6.u2', title: 'Long multiplication', icon: '📝',
    blurb: 'Multiply 3- or 4-digit numbers by 2-digit numbers',
    lesson: [
      {
        title: 'Split the 2-digit number',
        text: 'To work out 243 × 36, split 36 into **30 + 6**.\n243 × 36 = 243 × 30 + 243 × 6.\nThe grid shows every part. Add them all: 7290 + 1458 = 8748.',
        visual: { type: 'table', headers: ['×', '200', '40', '3'], rows: [['30', '6000', '1200', '90'], ['6', '1200', '240', '18']] }
      },
      {
        title: 'The column method',
        text: '1. Multiply by the **ones** digit: 243 × 6 = 1458.\n2. Multiply by the **tens** digit: 243 × 30 = 7290. Write a **0** first, because you are multiplying by tens.\n3. **Add** the two rows: 1458 + 7290 = **8748**.',
        visual: { type: 'table', headers: ['', 'Th', 'H', 'T', 'O'], rows: [['', '', '2', '4', '3'], ['×', '', '', '3', '6'], ['243 × 6', '1', '4', '5', '8'], ['243 × 30', '7', '2', '9', '0'], ['total', '8', '7', '4', '8']] }
      },
      {
        title: 'Estimate to check',
        text: 'Round first: 243 × 36 ≈ 200 × 40 = 8000.\nOur answer, 8748, is close, so it is sensible.\nIf you got 2187 or 87,480, the estimate tells you something went wrong.'
      },
      {
        title: 'Common slips',
        text: '• Forgetting the **0** in the tens row (243 × 3 = 729, and 1458 + 729 = 2187 ✗).\n• Forgetting to **carry**.\n• Adding rows when the columns are not lined up. Keep your digits neat!'
      },
      {
        title: 'Worked example: 1527 × 24',
        text: '1. Ones: 1527 × 4 = 6108.\n2. Tens: write a 0, then 1527 × 2 = 3054, so 1527 × 20 = 30,540.\n3. Add: 6108 + 30,540 = **36,648**.\n4. Check: 2000 × 20 = 40,000. Close ✓'
      }
    ],
    gen(level, ctx) {
      const cur = ctx.currency;
      const make = () => {
        let A, B;
        do {
          A = L(level, U.rint(102, 499), U.rint(123, 987), U.rint(1023, 4999));
          B = L(level, U.rint(12, 29), U.rint(13, 89), U.rint(13, 98));
        } while (A % 10 === 0 || B % 10 === 0 || B === 19);
        const t = Math.floor(B / 10), o = B % 10;
        return { A, B, t, o, p1: A * o, p2: A * t * 10, ans: A * B };
      };
      const hints = m => [`Split ${m.B} into ${m.t * 10} + ${m.o}. Multiply ${f(m.A)} by each part, then add.`, `${f(m.A)} × ${m.o} = ${f(m.p1)}.`];
      const explain = m => `${f(m.A)} × ${m.o} = ${f(m.p1)} and ${f(m.A)} × ${m.t * 10} = ${f(m.p2)}. ${f(m.p1)} + ${f(m.p2)} = ${f(m.ans)}.`;
      const grid = m => {
        const s = String(m.A);
        const parts = s.split('').map((d, i) => Number(d) * p10(s.length - 1 - i)).filter(v => v > 0);
        return { type: 'table', headers: ['×', ...parts.map(v => f(v))], rows: [[String(m.t * 10), ...parts.map(() => '?')], [String(m.o), ...parts.map(() => '?')]] };
      };

      const compute = () => {
        const m = make();
        return num(`${f(m.A)} × ${m.B} = ?`, m.ans, hints(m), explain(m), vis(level === 1 && grid(m)));
      };
      const word = () => {
        const m = make();
        const qs = [
          [`A bike costs ${cur}${f(m.A)}. A club buys ${m.B} bikes. How much does it pay?`, { prefix: cur }],
          [`A machine makes ${f(m.A)} bottles every hour. How many bottles does it make in ${m.B} hours?`, {}],
          [`Each book has ${f(m.A)} pages. How many pages are there in ${m.B} copies of the book?`, {}],
          [`A school orders ${m.B} boxes of paper. Each box has ${f(m.A)} sheets. How many sheets is that?`, {}]
        ];
        const [q, extra] = U.pick(qs);
        return num(q, m.ans, hints(m), explain(m), extra);
      };
      const mistake = () => {
        const m = make(), nm = U.name();
        const kinds = [
          [m.p1 + m.A * m.t, 'Forgot the 0 when multiplying by the tens digit',
            `${nm} worked out ${f(m.A)} × ${m.t} = ${f(m.A * m.t)} with no 0. The tens row should be ${f(m.A)} × ${m.t * 10} = ${f(m.p2)}, so the answer is ${f(m.ans)}.`],
          [m.p1, 'Only multiplied by the ones digit',
            `${f(m.p1)} is just ${f(m.A)} × ${m.o}. ${nm} also needed ${f(m.A)} × ${m.t * 10} = ${f(m.p2)}. The answer is ${f(m.ans)}.`],
          [m.p2, 'Forgot to multiply by the ones digit',
            `${f(m.p2)} is just ${f(m.A)} × ${m.t * 10}. ${nm} also needed ${f(m.A)} × ${m.o} = ${f(m.p1)}. The answer is ${f(m.ans)}.`]
        ];
        const [W, desc, why] = U.pick(kinds);
        if (Math.random() < 0.5) {
          return chq(`${nm} worked out ${f(m.A)} × ${m.B} and got ${f(W)}. What is the correct answer?`, f(m.ans),
            pick4(f(m.ans), kinds.map(k => f(k[0]))),
            [`Check: did ${nm} multiply by both digits of ${m.B}, and write a 0 in the tens row?`, `${f(m.A)} × ${m.o} = ${f(m.p1)}.`],
            explain(m));
        }
        return chq(`${nm} worked out ${f(m.A)} × ${m.B} and got ${f(W)}. What mistake did ${nm} make?`, desc,
          U.shuffle(kinds.map(k => k[1]).concat('No mistake: the answer is right')),
          [`Work out the two parts yourself, then compare them with ${f(W)}.`, `${f(m.A)} × ${m.o} = ${f(m.p1)} and ${f(m.A)} × ${m.t * 10} = ${f(m.p2)}.`],
          why);
      };
      const estimate = () => {
        const m = make();
        const big = m.A >= 1000, P = big ? 1000 : 100;
        const Ar = Math.round(m.A / P) * P, Br = Math.round(m.B / 10) * 10;
        const est = Ar * Br;
        const otherA = Ar > m.A ? Ar - P : Ar + P;
        const cands = [est / 10, est * 10];
        if (otherA > 0 && Math.abs(otherA * Br - m.ans) > Math.abs(est - m.ans)) cands.push(otherA * Br);
        return chq(`Round each number to estimate ${f(m.A)} × ${m.B}. Which estimate is best?`, f(est), pick4(f(est), cands.map(v => f(v))),
          [`Round ${f(m.A)} to the nearest ${big ? 'thousand' : 'hundred'} and ${m.B} to the nearest ten.`, `${f(m.A)} ≈ ${f(Ar)} and ${m.B} ≈ ${Br}.`],
          `${f(m.A)} ≈ ${f(Ar)} and ${m.B} ≈ ${Br}. ${f(Ar)} × ${Br} = ${f(est)}. (The exact answer is ${f(m.ans)}.)`);
      };

      return run(L(level,
        [compute, compute, word, mistake],
        [compute, word, mistake, estimate],
        [compute, word, mistake, estimate]));
    }
  });

  // ---------- 6. Short division ----------
  PMLM.registerSkill({
    id: 'g6.shortDiv', grade: 6, unit: 'g6.u2', title: 'Short division', icon: '➗',
    blurb: 'Divide by a 1-digit number and use the remainder',
    lesson: [
      {
        title: 'The bus stop method',
        text: 'Short division works **from the left**, one digit at a time.\n**744 ÷ 6**\n7 ÷ 6 = 1 r 1. Write 1, carry 1 to make 14.\n14 ÷ 6 = 2 r 2. Write 2, carry 2 to make 24.\n24 ÷ 6 = 4. Write 4.\nSo 744 ÷ 6 = **124**.',
        visual: { type: 'table', headers: ['Step', 'Divide', 'Write', 'Carry'], rows: [['1', '7 ÷ 6', '1', '1'], ['2', '14 ÷ 6', '2', '2'], ['3', '24 ÷ 6', '4', '–']] }
      },
      {
        title: 'Remainders',
        text: 'Sometimes some are left over.\n47 ÷ 5 = 9 **r 2**, because 5 × 9 = 45 and 47 − 45 = 2.\nThe remainder is always **smaller** than the number you divide by.',
        visual: { type: 'objects', groups: [5, 5, 5, 5, 5, 5, 5, 5, 5, 2] }
      },
      {
        title: 'What does the remainder mean?',
        text: 'In a story, think about what the remainder means.\n50 children, 8 in each minibus: 50 ÷ 8 = 6 r 2. You need **7** minibuses so nobody is left behind (round **up**).\n50 cakes, 8 in each box: only **6** boxes are full (round **down**).'
      },
      {
        title: 'Remainders as fractions',
        text: 'You can write the remainder as a fraction of the number you divided by.\n47 ÷ 5 = 9 r 2 = **9 {2/5}**.\nSo 47 m of rope shared between 5 people is 9 {2/5} m each.'
      },
      {
        title: 'Worked example: 853 ÷ 4',
        text: '1. 8 ÷ 4 = 2. Write 2.\n2. 5 ÷ 4 = 1 r 1. Write 1, carry 1 to make 13.\n3. 13 ÷ 4 = 3 r 1. Write 3.\n4. **853 ÷ 4 = 213 r 1**.\nCheck: 4 × 213 = 852, and 852 + 1 = 853 ✓'
      }
    ],
    gen(level, ctx) {
      const cur = ctx.currency;
      const firstStep = (n, d) => {
        const s = String(n);
        let c = Number(s[0]);
        if (c < d && s.length > 1) c = Number(s.slice(0, 2));
        const q = Math.floor(c / d), r = c % d;
        return `First step: ${c} ÷ ${d} = ${q}${r ? ` r ${r}` : ''}. Write ${q}${r ? ` and carry the ${r} to the next digit` : ''}.`;
      };
      const nudge = 'Short division: divide one digit at a time, from the left. Carry any remainder to the next digit.';
      const quot = () => L(level, U.rint(11, 60), U.rint(21, 199), U.rint(201, 1999));
      const divisor = () => U.rint(L(level, 2, 3, 3), L(level, 5, 9, 9));

      const exact = () => {
        const d = divisor();
        let qt = quot();
        if (level > 1 && Math.random() < 0.3) qt = U.rint(1, L(level, 9, 9, 19)) * 100 + U.rint(1, 9);
        const n = qt * d;
        return num(`${f(n)} ÷ ${d} = ?`, qt, [nudge, firstStep(n, d)], `${f(n)} ÷ ${d} = ${f(qt)}. Check: ${d} × ${f(qt)} = ${f(n)} ✓`);
      };
      const remainder = () => {
        const d = divisor(), qt = quot(), r = U.rint(1, d - 1), n = qt * d + r;
        return num(`What is the remainder when ${f(n)} is divided by ${d}?`, r, [nudge, firstStep(n, d)],
          `${f(n)} ÷ ${d} = ${f(qt)} r ${r}, because ${d} × ${f(qt)} = ${f(qt * d)} and ${f(n)} − ${f(qt * d)} = ${r}.`);
      };
      const qr = () => {
        const zero = Math.random() < 0.4;
        const d = level === 2 && zero ? U.rint(3, 4) : U.rint(3, 9);
        const qt = zero ? U.rint(1, level === 2 ? 2 : 9) * 100 + U.rint(1, 9) : level === 2 ? U.rint(21, Math.floor(999 / d) - 1) : quot();
        const r = U.rint(1, d - 1), n = qt * d + r;
        const ans = `${qt} r ${r}`;
        const dists = [`${qt - 1} r ${r + d}`, `${qt + 1} r ${r}`, `${qt} r ${d - r}`];
        if (zero) dists.unshift(`${String(qt).replace('0', '')} r ${r}`);
        return chq(`${f(n)} ÷ ${d} = ?`, ans, pick4(ans, dists), [nudge, firstStep(n, d)],
          `${f(n)} ÷ ${d} = ${qt} r ${r}. Check: ${d} × ${qt} = ${f(d * qt)}, and ${f(d * qt)} + ${r} = ${f(n)}.${zero ? ' Don\'t forget the 0 in the answer!' : ''} The remainder must be less than ${d}.`);
      };
      const interpret = () => {
        const d = U.rint(L(level, 3, 4, 4), L(level, 6, 9, 9));
        const qt = L(level, U.rint(5, 15), U.rint(12, 60), U.rint(30, 250));
        const r = U.rint(1, d - 1), n = qt * d + r;
        const calc = `${f(n)} ÷ ${d} = ${qt} r ${r}.`;
        const bracket = `${d} × ${qt} = ${f(qt * d)} and ${d} × ${qt + 1} = ${f((qt + 1) * d)}. ${f(n)} is between them.`;
        const t = U.rint(0, 3);
        if (t === 0) {
          return num(`${f(n)} children are going on a trip. Each minibus holds ${d} children. How many minibuses are needed?`, qt + 1,
            [`Work out ${f(n)} ÷ ${d}. Then think: can any children be left behind?`, bracket],
            `${calc} ${qt} minibuses carry ${f(qt * d)} children. The other ${r} need one more minibus, so ${qt + 1} minibuses.`);
        }
        if (t === 1) {
          return num(`A baker has ${f(n)} cakes. A box holds ${d} cakes. How many boxes can be **filled**?`, qt,
            [`Work out ${f(n)} ÷ ${d}. A box that is not full does not count.`, bracket],
            `${calc} ${qt} boxes are full and ${r} cake${pl(r)} ${r === 1 ? 'is' : 'are'} left over. So ${qt} boxes.`);
        }
        if (t === 2) {
          return num(`${f(n)} cards are shared equally between ${d} players. How many cards are left over?`, r,
            [`Work out ${f(n)} ÷ ${d}. The cards left over are the remainder.`, `${d} × ${qt} = ${f(qt * d)}. How many more cards are there than that?`],
            `${calc} Each player gets ${qt} cards and ${r} ${r === 1 ? 'is' : 'are'} left over.`);
        }
        return num(`You have ${cur}${f(n)}. A book costs ${cur}${d}. How many books can you buy?`, qt,
          [`Work out ${f(n)} ÷ ${d}. Can you buy part of a book?`, bracket],
          `${calc} You can buy ${qt} books and you have ${cur}${r} left.`);
      };
      const inverse = () => {
        const d = divisor();
        let qt;
        do { qt = L(level, U.rint(11, 60), U.rint(21, 199), U.rint(101, 999)); } while (qt % 10 === 0);
        if (level === 3 && Math.random() < 0.5) {
          const r = U.rint(1, d - 1);
          return num(`□ ÷ ${d} = ${qt} r ${r}`, qt * d + r, ['Work backwards: multiply, then add the remainder.', `${d} × ${qt} = ${f(qt * d)}.`],
            `${d} × ${qt} = ${f(qt * d)}, and ${f(qt * d)} + ${r} = ${f(qt * d + r)}. So □ = ${f(qt * d + r)}.`);
        }
        const tens = qt - (qt % 10);
        return num(`□ ÷ ${d} = ${qt}`, qt * d, ['Work backwards: the opposite of dividing is multiplying.', `${d} × ${tens} = ${f(d * tens)}. Now add ${d} × ${qt % 10}.`],
          `□ = ${d} × ${qt} = ${f(qt * d)}.`);
      };
      const fracRem = () => {
        const d = U.rint(3, 9), qt = U.rint(5, 30), r = U.rint(1, d - 1), n = qt * d + r;
        const g = U.gcd(r, d);
        return fracQ(`${n} m of ribbon is cut into ${d} equal pieces. How long is each piece? Give your answer as a mixed number.`, n, d,
          [`Divide ${n} by ${d}. Then write the remainder as a fraction of ${d}.`, `${n} ÷ ${d} = ${qt} r ${r}.`],
          `${n} ÷ ${d} = ${qt} r ${r}. The remainder ${r} out of ${d} is ${fr(r, d)}${g > 1 ? ' = ' + U.fracS(r, d) : ''}, so each piece is ${mx(n, d)} m.`,
          { mixed: true, unit: 'm' });
      };
      const decRem = () => {
        const d = U.pick([2, 4, 5]), qt = U.rint(11, 99), r = U.rint(1, d - 1), n = qt * d + r;
        const ans = R(n / d);
        return num(`${cur}${n} is shared equally between ${d} friends. How much does each friend get?`, ans,
          [`Divide ${n} by ${d}. Instead of a remainder, carry on past the decimal point: write ${n} as ${n}.00.`, `${n} ÷ ${d} = ${qt} r ${r}.`],
          `${n} ÷ ${d} = ${qt} r ${r}, and ${r} ÷ ${d} = ${f(R(r / d))}. Each friend gets ${cur}${f(ans, 2)}.`, { prefix: cur });
      };

      return run(L(level,
        [exact, exact, remainder, interpret],
        [exact, remainder, qr, interpret, interpret, inverse],
        [exact, qr, interpret, inverse, fracRem, decRem]));
    }
  });

  // ---------- 7. Decimal calculations ----------
  // Column steps for decimals given as whole numbers of hundredths.
  const addStep = (ai, bi) => {
    if (ai % 10 || bi % 10) return `Hundredths first: ${ai % 10} + ${bi % 10} = ${ai % 10 + bi % 10}.`;
    const ta = Math.floor(ai / 10) % 10, tb = Math.floor(bi / 10) % 10;
    return `Tenths first: ${ta} + ${tb} = ${ta + tb}.`;
  };
  const subStep = (ai, bi) => {
    const col = ai % 10 || bi % 10 ? 1 : 10;
    const da = Math.floor(ai / col) % 10, db = Math.floor(bi / col) % 10;
    const name = col === 1 ? 'hundredths' : 'tenths';
    return da >= db ? `Start with the ${name}: ${da} − ${db} = ${da - db}.`
      : `Start with the ${name}: you can't take ${db} from ${da}, so exchange from the column to the left first.`;
  };
  const dps = (...xs) => (xs.some(x => x % 10) ? 2 : 1); // decimal places needed, for values in hundredths

  PMLM.registerSkill({
    id: 'g6.decimalCalc', grade: 6, unit: 'g6.u2', title: 'Decimal calculations', icon: '💰',
    blurb: 'Add and subtract decimals; multiply by 1 digit',
    lesson: [
      {
        title: 'Line up the points',
        text: 'To add or subtract decimals, write them in columns with the **decimal points lined up**. Fill gaps with **0**.\n4.5 + 2.37 → 4.50 + 2.37 = **6.87**',
        visual: { type: 'table', headers: ['', 'O', '.', 't', 'h'], rows: [['', '4', '.', '5', '0'], ['+', '2', '.', '3', '7'], ['=', '6', '.', '8', '7']] }
      },
      {
        title: 'Subtracting',
        text: 'For 7 − 2.46, write 7 as **7.00**. Then subtract column by column, exchanging when you need to.\n7.00 − 2.46 = **4.54**',
        visual: { type: 'table', headers: ['', 'O', '.', 't', 'h'], rows: [['', '7', '.', '0', '0'], ['−', '2', '.', '4', '6'], ['=', '4', '.', '5', '4']] }
      },
      {
        title: 'Multiplying by a 1-digit number',
        text: '0.3 × 4 means 4 lots of 3 tenths.\n3 tenths × 4 = 12 tenths = **1.2**.\nCareful! 0.3 × 4 is **not** 0.12.',
        visual: { type: 'fractionBar', bars: [{ parts: 10, shaded: 3, label: '0.3' }, { parts: 10, shaded: 3, label: '0.3' }, { parts: 10, shaded: 3, label: '0.3' }, { parts: 10, shaded: 3, label: '0.3' }] }
      },
      {
        title: 'Tip: ignore the point, then put it back',
        text: '2.36 × 3: work out 236 × 3 = 708.\n2.36 has **2** decimal places, so the answer has **2**: **7.08**.\nCheck with an estimate: 2.36 × 3 ≈ 2 × 3 = 6. 7.08 is close ✓'
      },
      {
        title: 'Worked example: 4.75 × 6',
        text: '1. Estimate: 5 × 6 = 30.\n2. Ignore the point: 475 × 6 = 2850.\n3. 4.75 has 2 decimal places, so the answer has 2: 28.50.\n4. **4.75 × 6 = 28.5** (close to 30 ✓)'
      }
    ],
    gen(level, ctx) {
      const cur = ctx.currency;
      const H = i => R(i / 100); // hundredths → number
      const pairAdd = () => {
        let ai, bi;
        if (level === 1) { ai = nonTen(11, 99) * 10; bi = nonTen(11, 99) * 10; }
        else if (level === 2) { ai = nonTen(11, 99) * 10; bi = nonTen(101, 999); }
        else { ai = nonTen(101, 1999); bi = nonTen(101, 999); }
        return Math.random() < 0.5 ? [ai, bi] : [bi, ai];
      };
      const pairSub = () => {
        let ai, bi;
        if (level === 1) { ai = nonTen(31, 99) * 10; bi = nonTen(11, ai / 10 - 1) * 10; }
        else if (level === 2) { ai = U.rint(3, 15) * 100; bi = nonTen(101, ai - 1); }
        else { ai = nonTen(51, 199) * 10; bi = nonTen(101, ai - 1); }
        return [ai, bi];
      };

      const add = () => {
        const [ai, bi] = pairAdd(), dp = dps(ai, bi), s = H(ai + bi);
        return num(`${f(H(ai))} + ${f(H(bi))} = ?`, s,
          ['Line up the decimal points. Fill any gaps with 0.', `Write it as ${f(H(ai), dp)} + ${f(H(bi), dp)}. ${addStep(ai, bi)}`],
          `${f(H(ai), dp)} + ${f(H(bi), dp)} = ${f(s, dp)}.`);
      };
      const sub = () => {
        const [ai, bi] = pairSub(), dp = dps(ai, bi), d = H(ai - bi);
        return num(`${f(H(ai))} − ${f(H(bi))} = ?`, d,
          ['Line up the decimal points. Fill any empty places with 0 (for example, 7 = 7.00).', `Write it as ${f(H(ai), dp)} − ${f(H(bi), dp)}. ${subStep(ai, bi)}`],
          `${f(H(ai), dp)} − ${f(H(bi), dp)} = ${f(d, dp)}. Check: ${f(d, dp)} + ${f(H(bi), dp)} = ${f(H(ai), dp)} ✓`);
      };
      const mul = () => {
        let xi, dp;
        if (level === 1) { xi = U.rint(2, 9); dp = 1; }
        else if (level === 2) { xi = nonTen(11, 99); dp = 1; }
        else { xi = nonTen(101, 999); dp = 2; }
        const m = U.rint(L(level, 2, 3, 3), 9);
        const x = R(xi / p10(dp)), raw = xi * m, ans = R(raw / p10(dp));
        const full = f(ans, dp), short = f(ans);
        const bars = level === 1 && m <= 4 ? { type: 'fractionBar', bars: Array.from({ length: m }, () => ({ parts: 10, shaded: xi, label: f(x) })) } : null;
        return num(`${f(x)} × ${m} = ?`, ans,
          ['Multiply as if there were no decimal point, then put the point back.', `${xi} × ${m} = ${raw}, and ${f(x)} has ${dp} decimal place${pl(dp)}.`],
          `${xi} × ${m} = ${raw}. ${f(x)} has ${dp} decimal place${pl(dp)}, so ${f(x)} × ${m} = ${full}${full !== short ? ' = ' + short : ''}.`, vis(bars));
      };
      const mistake = () => {
        const nm = U.name();
        if (Math.random() < 0.5) {
          const xi = U.rint(2, 9), m = U.rint(3, 9);
          const x = R(xi / 10), ans = R(xi * m / 10), wrong = R(xi * m / 100);
          return chq(`${nm} says ${f(x)} × ${m} = ${f(wrong)}. What is the correct answer?`, f(ans),
            pick4(f(ans), [f(wrong), f(xi * m), f(R(x + m))]),
            [`${f(x)} is ${xi} tenths. Multiplying by ${m} must make it bigger, not smaller!`, `${xi} tenths × ${m} = ${xi * m} tenths.`],
            `${xi} tenths × ${m} = ${xi * m} tenths = ${f(ans)}. ${f(wrong)} is smaller than ${f(x)}, so it can't be right.`);
        }
        const ai = nonTen(11, 99), bi = nonTen(101, 999);
        const a = R(ai / 10), b = R(bi / 100);
        const ans = R((ai * 10 + bi) / 100), wrong = R((ai + bi) / 100);
        return chq(`${nm} says ${f(a)} + ${f(b)} = ${f(wrong)}. What is the correct answer?`, f(ans),
          pick4(f(ans), [f(wrong), f(R((ai + bi) / 10))]),
          [`${nm} lined up the last digits instead of the decimal points.`, `Write ${f(a)} as ${f(a, 2)}, then add ${f(a, 2)} + ${f(b)}.`],
          `With the points lined up: ${f(a, 2)} + ${f(b)} = ${f(ans)}.`);
      };
      const moneyQ = () => {
        const t = U.rint(0, L(level, 1, 2, 2));
        const price = () => (level === 1 ? U.rint(11, 99) * 10 : nonTen(101, 999));
        if (t === 0) {
          const p1 = price(), p2 = price(), tot = H(p1 + p2);
          return num(`A notebook costs ${cur}${f(H(p1), 2)} and a pen costs ${cur}${f(H(p2), 2)}. How much do they cost altogether?`, tot,
            ['Add the two prices. Line up the decimal points.', `${f(H(p1), 2)} + ${f(H(p2), 2)}: ${addStep(p1, p2)}`],
            `${f(H(p1), 2)} + ${f(H(p2), 2)} = ${f(tot, 2)}, so they cost ${cur}${f(tot, 2)}.`, { prefix: cur });
        }
        if (t === 1) {
          const p = price();
          const note = U.pick([5, 10, 20].filter(n => n * 100 > p));
          const ch = H(note * 100 - p);
          return num(`You buy a sandwich for ${cur}${f(H(p), 2)} and pay with a ${cur}${note} note. How much change do you get?`, ch,
            [`Change = money paid − cost. Write ${note} as ${note}.00.`, `${note}.00 − ${f(H(p), 2)}: ${subStep(note * 100, p)}`],
            `${note}.00 − ${f(H(p), 2)} = ${f(ch, 2)}, so the change is ${cur}${f(ch, 2)}.`, { prefix: cur });
        }
        const p = nonTen(101, 999), m = U.rint(3, 9), tot = H(p * m);
        return num(`One ticket costs ${cur}${f(H(p), 2)}. How much do ${m} tickets cost?`, tot,
          [`Multiply ${f(H(p), 2)} by ${m}. Do ${p} × ${m} first, then put the point back.`, `${p} × ${m} = ${p * m}.`],
          `${p} × ${m} = ${p * m}. The price has 2 decimal places, so ${m} tickets cost ${cur}${f(tot, 2)}.`, { prefix: cur });
      };
      const length = () => {
        const nm = U.name();
        if (Math.random() < 0.5) {
          const [ai, bi] = pairSub(), dp = dps(ai, bi), d = H(ai - bi);
          return num(`A ribbon is ${f(H(ai))} m long. ${nm} cuts off ${f(H(bi))} m. How much ribbon is left?`, d,
            ['Subtract the piece cut off. Line up the decimal points.', `Write it as ${f(H(ai), dp)} − ${f(H(bi), dp)}. ${subStep(ai, bi)}`],
            `${f(H(ai), dp)} − ${f(H(bi), dp)} = ${f(d, dp)}, so ${f(d)} m is left.`, { unit: 'm' });
        }
        const [ai, bi] = pairAdd(), dp = dps(ai, bi), s = H(ai + bi);
        return num(`${nm} runs ${f(H(ai))} km on Monday and ${f(H(bi))} km on Tuesday. How far is that altogether?`, s,
          ['Add the two distances. Line up the decimal points.', `Write it as ${f(H(ai), dp)} + ${f(H(bi), dp)}. ${addStep(ai, bi)}`],
          `${f(H(ai), dp)} + ${f(H(bi), dp)} = ${f(s, dp)}, so ${nm} ran ${f(s)} km.`, { unit: 'km' });
      };

      return run(L(level,
        [add, sub, mul, moneyQ],
        [add, sub, mul, mistake, moneyQ, length],
        [add, sub, mul, mistake, moneyQ, length]));
    }
  });

  // =====================================================================
  // Unit 3: Number properties
  // =====================================================================
  PMLM.registerUnit({ id: 'g6.u3', grade: 6, name: 'Number properties', icon: '🧮' });

  const smallestFactor = n => {
    for (let p = 2; p * p <= n; p++) if (n % p === 0) return p;
    return n;
  };

  // ---------- 8. Factors, multiples and primes ----------
  PMLM.registerSkill({
    id: 'g6.factors', grade: 6, unit: 'g6.u3', title: 'Factors, multiples, primes', icon: '🧩',
    blurb: 'Find factors, multiples, common ones and primes',
    lesson: [
      {
        title: 'Factors',
        text: 'A **factor** divides a number exactly, with nothing left over.\nThe factors of 12 are **1, 2, 3, 4, 6 and 12**.\nThey come in pairs: 1 × 12, 2 × 6, 3 × 4.',
        visual: { type: 'array', rows: 3, cols: 4 }
      },
      {
        title: 'Multiples',
        text: '**Multiples** are the numbers in a times table. Multiples of 6: 6, 12, 18, 24, 30 …\nA **common multiple** is in both lists: 12 is a common multiple of 4 and 6.\nTip: factors are small (they fit **into** the number). Multiples are big (they come **out of** the table).',
        visual: { type: 'numberLine', min: 0, max: 24, step: 1, labelEvery: 6, jumps: [{ from: 0, to: 6, label: '+6' }, { from: 6, to: 12, label: '+6' }, { from: 12, to: 18, label: '+6' }, { from: 18, to: 24, label: '+6' }] }
      },
      {
        title: 'Prime numbers',
        text: 'A **prime number** has exactly **two** factors: 1 and itself.\n2, 3, 5, 7, 11, 13, 17, 19, 23, 29 are prime.\n1 is **not** prime: it has only one factor. 2 is the only even prime.',
        visual: { type: 'table', headers: ['Number', 'Factors', 'Prime?'], rows: [['7', '1, 7', 'yes'], ['9', '1, 3, 9', 'no'], ['1', '1', 'no'], ['2', '1, 2', 'yes']] }
      },
      {
        title: 'Tip: quick tests',
        text: 'A number can be divided by:\n**2** if it ends in 0, 2, 4, 6 or 8.\n**5** if it ends in 0 or 5.\n**3** if its digits add up to a multiple of 3. For example 51: 5 + 1 = 6, so 51 = 3 × 17 is **not** prime!'
      },
      {
        title: 'Worked example: factors of 36',
        text: '1. Start at 1 and find pairs: 1 × 36, 2 × 18, 3 × 12, 4 × 9.\n2. 5 does not work: 36 ÷ 5 has a remainder.\n3. 6 × 6: the pairs have met, so stop.\n4. Factors of 36: **1, 2, 3, 4, 6, 9, 12, 18, 36**.',
        visual: { type: 'array', rows: 4, cols: 9 }
      }
    ],
    gen(level) {
      const isFactor = () => {
        const N = U.pick(L(level, [12, 16, 18, 20, 24, 30, 36], [24, 32, 36, 40, 42, 45, 48, 54, 56, 60, 72], [48, 60, 72, 84, 90, 96, 108, 120]));
        const ans = U.pick(U.factors(N).filter(v => v >= 3 && v <= N / 2));
        const nf = U.shuffle(U.range(3, Math.min(N - 1, 20)).filter(v => N % v !== 0));
        const ex = nf[0];
        return chq(`Which of these is a **factor** of ${N}?`, String(ans), pick4(ans, [ex, N * 2, nf[1], nf[2]].map(String)),
          [`A factor of ${N} divides into ${N} exactly, with nothing left over.`, `Try ${ex}: ${N} ÷ ${ex} = ${Math.floor(N / ex)} r ${N % ex}, so ${ex} is not a factor.`],
          `${N} ÷ ${ans} = ${N / ans} exactly, so ${ans} is a factor of ${N}. (${N * 2} is a multiple of ${N}, not a factor.)`);
      };
      const isMultiple = () => {
        const k = U.pick(L(level, [3, 4, 5, 6, 8], [6, 7, 8, 9, 11, 12], [7, 9, 12, 13, 15]));
        const ans = k * U.rint(4, 12);
        const dist = [10 * U.rint(1, 9) + (k % 10), ans + 1, ans - 2, ans + 2, ans - 1]
          .filter((v, i, a) => v > 0 && v % k !== 0 && a.indexOf(v) === i);
        const ex = dist[0];
        return chq(`Which of these is a **multiple** of ${k}?`, String(ans), pick4(ans, dist.map(String)),
          [`Multiples of ${k} are in the ${k} times table: ${k}, ${2 * k}, ${3 * k} …`, `Divide by ${k}. For example, ${ex} ÷ ${k} = ${Math.floor(ex / k)} r ${ex % k}, so ${ex} is not a multiple.`],
          `${ans} = ${k} × ${ans / k}, so ${ans} is a multiple of ${k}.`);
      };
      const prime = () => {
        const primes = L(level, [2, 3, 5, 7, 11, 13, 17, 19], [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47],
          [29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);
        const comps = L(level, [1, 4, 6, 8, 9, 10, 12, 14, 15, 16], [1, 9, 15, 21, 25, 27, 33, 35, 39, 45, 49], [39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93]);
        const why = c => (c === 1 ? '1 has only one factor, so it is not prime.' : `${c} = ${smallestFactor(c)} × ${c / smallestFactor(c)}, so ${c} is not prime.`);
        if (level > 1 && Math.random() < 0.4) {
          const ps = U.sample(primes, 3), c = U.pick(comps.filter(v => v !== 1));
          return chq('Which of these is **not** a prime number?', String(c), U.shuffle([c, ...ps].map(String)),
            ['A prime number has exactly two factors: 1 and itself. Try dividing each number by 2, 3, 5 and 7.', `${ps[0]} has only two factors, 1 and ${ps[0]}, so ${ps[0]} is prime.`],
            why(c));
        }
        const p = U.pick(primes), cs = U.sample(comps, 3);
        return chq('Which of these is a **prime number**?', String(p), U.shuffle([p, ...cs].map(String)),
          ['A prime number has exactly two factors: 1 and itself. Try dividing each number by 2, 3, 5 and 7.', why(cs[0])],
          `${p} has only two factors, 1 and ${p}, so it is prime. ${why(cs[1])}`);
      };
      const missingPair = () => {
        const N = U.pick([12, 16, 18, 20, 24, 30, 36, 40, 48]);
        const a = U.pick(U.factors(N).filter(v => v > 1 && v <= N / 3));
        return num(`${N} = ${a} × □`, N / a, [`□ goes with ${a} to make ${N}. Work out ${N} ÷ ${a}.`, `Count up in ${a}s: ${a}, ${2 * a} … How many ${a}s make ${N}?`],
          `${a} × ${N / a} = ${N}, so □ = ${N / a}.`);
      };
      const countFactors = () => {
        const N = U.pick(L(level, [12, 18, 20], [12, 16, 18, 20, 24, 28, 30, 32], [24, 30, 36, 40, 45, 48, 60, 64, 72]));
        const fs = U.factors(N), f2 = fs[1];
        return num(`How many factors does ${N} have?`, fs.length,
          [`Find the factors in pairs, starting with 1 × ${N}.`, `1 × ${N} and ${f2} × ${N / f2} are the first two pairs. Keep going until the pairs meet.`],
          `The factors of ${N} are ${fs.join(', ')}. That is ${fs.length} factors.`);
      };
      const commonMultiple = () => {
        const [a, b] = U.pick(L(level, [[2, 3], [3, 4], [2, 5], [4, 5], [3, 5]], [[4, 6], [6, 8], [3, 4], [4, 10], [6, 9], [2, 7], [3, 8]],
          [[6, 8], [8, 12], [6, 10], [9, 12], [4, 6], [10, 15], [6, 9], [12, 18]]));
        const l = U.lcm(a, b);
        return num(`What is the **smallest** number that is a multiple of both ${a} and ${b}?`, l,
          ['List the multiples of each number. Look for the first number that is in both lists.', `Multiples of ${b}: ${b}, ${2 * b}, ${3 * b}, ${4 * b} …`],
          `Multiples of ${a}: ${U.range(a, l, a).join(', ')}. Multiples of ${b}: ${U.range(b, l, b).join(', ')}. The first one in both lists is ${l}.`);
      };
      const commonFactor = () => {
        const [a, b] = U.pick([[12, 18], [16, 24], [20, 30], [18, 27], [24, 36], [15, 25], [14, 21], [28, 42], [30, 45], [36, 48]]);
        const g = U.gcd(a, b);
        return num(`What is the **largest** number that is a factor of both ${a} and ${b}?`, g,
          ['List the factors of each number. Find the biggest number that is in both lists.', `Factors of ${a}: ${U.factors(a).join(', ')}.`],
          `Factors of ${a}: ${U.factors(a).join(', ')}. Factors of ${b}: ${U.factors(b).join(', ')}. The largest in both lists is ${g}.`);
      };
      const bags = () => {
        const N = U.pick([24, 30, 36, 40, 42, 48, 60]);
        const nm = U.name();
        const ans = U.pick(U.factors(N).filter(v => v >= 3 && v <= 12));
        const non = U.shuffle(U.range(3, 12).filter(v => N % v !== 0));
        return chq(`${nm} has ${N} sweets to put into bags. Every bag must have the same number of sweets, with none left over. How many bags could ${nm} use?`,
          String(ans), pick4(ans, non.map(String)),
          [`The number of bags must be a factor of ${N}.`, `Try ${non[0]} bags: ${N} ÷ ${non[0]} = ${Math.floor(N / non[0])} r ${N % non[0]}. That leaves sweets over.`],
          `${N} ÷ ${ans} = ${N / ans} exactly, so ${ans} bags of ${N / ans} sweets works.`);
      };
      const buses = () => {
        const [a, b] = U.pick([[6, 8], [4, 6], [10, 15], [6, 9], [8, 12], [12, 18], [4, 10]]);
        const l = U.lcm(a, b);
        return num(`A red bus leaves the station every ${a} minutes. A blue bus leaves every ${b} minutes. They both leave at 9:00. After how many minutes do they next leave together?`, l,
          ['Find the smallest number that is a multiple of both.', `The red bus leaves after ${a}, ${2 * a}, ${3 * a}, ${4 * a} … minutes.`],
          `Multiples of ${a}: ${U.range(a, l, a).join(', ')}. Multiples of ${b}: ${U.range(b, l, b).join(', ')}. They first match at ${l} minutes.`, { unit: 'minutes' });
      };

      return run(L(level,
        [isFactor, isMultiple, prime, missingPair, bags],
        [isFactor, isMultiple, prime, countFactors, commonMultiple, bags],
        [isFactor, prime, countFactors, commonMultiple, commonFactor, buses, bags]));
    }
  });

  // ---------- 9. Square and cube numbers ----------
  PMLM.registerSkill({
    id: 'g6.squares', grade: 6, unit: 'g6.u3', title: 'Square and cube numbers', icon: '🟦',
    blurb: 'Square numbers, square roots and cube numbers',
    lesson: [
      {
        title: 'Square numbers',
        text: 'A **square number** is a number times itself. 4 × 4 = 16, so 16 is a square number.\nWe write 4 × 4 as **4^{2}** and say "4 squared".',
        visual: { type: 'array', rows: 4, cols: 4 }
      },
      {
        title: 'The first square numbers',
        text: '1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144\nThese are 1^{2}, 2^{2}, 3^{2} … up to 12^{2}.\nCareful: 5^{2} means 5 × 5 = 25, **not** 5 × 2 = 10!',
        visual: { type: 'table', headers: ['n', '1', '2', '3', '4', '5', '6'], rows: [['n^{2}', '1', '4', '9', '16', '25', '36']] }
      },
      {
        title: 'Square roots',
        text: 'The **square root** goes backwards.\n7^{2} = 49, so the square root of 49 is **7**.\nWe write √49 = 7.',
        visual: { type: 'array', rows: 7, cols: 7 }
      },
      {
        title: 'Cube numbers',
        text: 'A **cube number** is a number times itself **three** times.\n2 × 2 × 2 = 8, so 8 is **2^{3}** ("2 cubed").\nThe first cube numbers are 1, 8, 27, 64, 125.',
        visual: { type: 'shape3d', shape: 'cube', dims: { l: '2', w: '2', h: '2' } }
      },
      {
        title: 'Worked example: 3^{3} + 4^{2}',
        text: '1. 3^{3} = 3 × 3 × 3. First 3 × 3 = 9, then 9 × 3 = 27.\n2. 4^{2} = 4 × 4 = 16.\n3. Add: 27 + 16 = **43**.'
      }
    ],
    gen(level) {
      const nmax = L(level, 10, 12, 12);
      const isSq = v => Number.isInteger(Math.sqrt(v));
      const cubeVis = n => ({ type: 'shape3d', shape: 'cube', dims: { l: String(n), w: String(n), h: String(n) } });

      const sq = () => {
        const n = U.rint(2, nmax);
        return num(Math.random() < 0.5 ? `${n}^{2} = ?` : `What is ${n} squared?`, n * n,
          [`${n}^{2} means ${n} × ${n} (not ${n} × 2).`, mulStep(n, n)], `${n}^{2} = ${n} × ${n} = ${n * n}.`);
      };
      const cube = () => {
        const n = level === 3 ? U.pick([2, 3, 4, 5, 6, 10]) : U.rint(2, 5);
        return num(`${n}^{3} = ?`, n * n * n, [`${n}^{3} means ${n} × ${n} × ${n}.`, `${n} × ${n} = ${n * n}. Now multiply by ${n} again.`],
          `${n}^{3} = ${n} × ${n} × ${n} = ${n * n} × ${n} = ${n * n * n}.`);
      };
      const root = () => {
        const n = U.rint(2, nmax), s = n * n;
        let g;
        do { g = n + U.pick([-2, -1, 1, 2]); } while (g < 1);
        const v = U.rint(0, 2);
        const q = v === 0 ? `What is the square root of ${s}?` : v === 1 ? `√${s} = ?` : `□^{2} = ${s}`;
        return num(q, n, [`Which number times itself makes ${s}?`, `Try ${g}: ${g} × ${g} = ${g * g}. Is that too big or too small?`],
          `${n} × ${n} = ${s}, so the answer is ${n}.`);
      };
      const which = cubeMode => {
        if (cubeMode) {
          const n = U.pick([2, 3, 5]), c = n * n * n; // not 64: it is a square number too
          const sqs = U.shuffle([9, 16, 25, 36, 49, 81, 100]);
          const s0 = sqs[0];
          return chq('Which of these is a **cube number**?', String(c), pick4(c, [s0, 3 * n, sqs[1], c + 1].map(String)),
            ['A cube number is a number times itself three times, like 2 × 2 × 2 = 8.', `${s0} = ${Math.sqrt(s0)} × ${Math.sqrt(s0)}. That makes it a square number, not a cube number.`],
            `${c} = ${n} × ${n} × ${n}, so ${c} is a cube number.`);
        }
        const n = U.rint(L(level, 3, 4, 4), nmax), s = n * n;
        const dist = [2 * n, s + 1, s - 1, s + n].filter(v => v > 1 && !isSq(v));
        const d0 = dist[0], k = Math.floor(Math.sqrt(d0));
        return chq('Which of these is a **square number**?', String(s), pick4(s, dist.map(String)),
          ['A square number is a number times itself, like 6 × 6 = 36.', `${d0} is not a square number: ${k} × ${k} = ${k * k} and ${k + 1} × ${k + 1} = ${(k + 1) * (k + 1)}.`],
          `${s} = ${n} × ${n}, so ${s} is a square number.`);
      };
      const mistake = cubeMode => {
        const nm = U.name();
        if (cubeMode) {
          const n = U.rint(2, 5), c = n * n * n;
          return chq(`${nm} says ${n}^{3} = ${3 * n}. What is ${n}^{3} really?`, String(c), U.numChoices(c, { extra: [3 * n, n * n, n + 3], min: 1 }),
            [`${n}^{3} means ${n} × ${n} × ${n}, not ${n} × 3.`, `${n} × ${n} = ${n * n}. Now multiply by ${n} again.`],
            `${n}^{3} = ${n} × ${n} × ${n} = ${c}. ${nm} worked out ${n} × 3 instead.`);
        }
        const n = U.rint(3, nmax);
        return chq(`${nm} says ${n}^{2} = ${2 * n}. What is ${n}^{2} really?`, String(n * n), U.numChoices(n * n, { extra: [2 * n, n + 2, n * n + n], min: 1 }),
          [`${n}^{2} means ${n} × ${n}, not ${n} × 2.`, mulStep(n, n)],
          `${n}^{2} = ${n} × ${n} = ${n * n}. ${nm} worked out ${n} × 2 instead.`);
      };
      const expr = () => {
        const t = U.rint(0, 2);
        if (t === 0) {
          const a = U.rint(2, 10), b = U.rint(2, 4), ans = a * a + b * b * b;
          return num(`${a}^{2} + ${b}^{3} = ?`, ans, ['Work out each power first, then add.', `${a}^{2} = ${a} × ${a} = ${a * a}.`],
            `${a}^{2} = ${a * a} and ${b}^{3} = ${b * b * b}. ${a * a} + ${b * b * b} = ${ans}.`);
        }
        if (t === 1) {
          const a = U.rint(5, 12), b = U.rint(2, a - 1), ans = a * a - b * b;
          return num(`${a}^{2} − ${b}^{2} = ?`, ans, ['Work out each square first, then subtract.', `${a}^{2} = ${a} × ${a} = ${a * a}.`],
            `${a}^{2} = ${a * a} and ${b}^{2} = ${b * b}. ${a * a} − ${b * b} = ${ans}.`);
        }
        const a = U.rint(3, 5), c = a * a * a, b = U.rint(2, Math.min(10, Math.floor(Math.sqrt(c - 1)))), ans = c - b * b;
        return num(`${a}^{3} − ${b}^{2} = ?`, ans, ['Work out each power first, then subtract.', `${a}^{3} = ${a} × ${a} × ${a} = ${c}.`],
          `${a}^{3} = ${c} and ${b}^{2} = ${b * b}. ${c} − ${b * b} = ${ans}.`);
      };
      const word = cubeMode => {
        if (cubeMode) {
          const n = U.rint(2, level === 3 ? 6 : 5);
          return num(`A big cube is built from small cubes, with ${n} small cubes along each edge. How many small cubes are used?`, n * n * n,
            [`The number of small cubes is ${n} × ${n} × ${n} = ${n}^{3}.`, `One layer has ${n} × ${n} = ${n * n} cubes. There are ${n} layers.`],
            `${n} × ${n} × ${n} = ${n * n * n} small cubes.`, { visual: cubeVis(n) });
        }
        const n = U.rint(3, nmax);
        if (Math.random() < 0.5) {
          return num(`Chairs are set out in a square, with ${n} rows of ${n} chairs. How many chairs are there?`, n * n,
            [`${n} rows of ${n} is ${n} × ${n} = ${n}^{2}.`, mulStep(n, n)], `${n} × ${n} = ${n * n} chairs.`);
        }
        let g;
        do { g = n + U.pick([-1, 1, 2]); } while (g < 2);
        return num(`A square garden has an area of ${n * n} m². How long is each side?`, n,
          [`Area of a square = side × side. Which number times itself makes ${n * n}?`, `Try ${g}: ${g} × ${g} = ${g * g}. Too big or too small?`],
          `${n} × ${n} = ${n * n}, so each side is ${n} m.`, { unit: 'm' });
      };

      return run(L(level,
        [sq, sq, root, () => which(false), () => mistake(false), () => word(false)],
        [sq, cube, root, () => which(Math.random() < 0.4), () => mistake(Math.random() < 0.4), () => word(Math.random() < 0.5)],
        [sq, cube, root, () => which(Math.random() < 0.5), () => mistake(Math.random() < 0.5), expr, () => word(Math.random() < 0.5)]));
    }
  });

  // ---------- 10. Order of operations ----------
  PMLM.registerSkill({
    id: 'g6.orderOps', grade: 6, unit: 'g6.u3', title: 'Order of operations', icon: '🚦',
    blurb: 'Brackets first, then × and ÷, then + and −',
    lesson: [
      {
        title: 'Does the order matter?',
        text: 'What is 2 + 3 × 4?\nAdd first: 5 × 4 = 20. Multiply first: 2 + 12 = 14.\nOnly one can be right! Maths has a rule so everyone gets the **same** answer: **14**.'
      },
      {
        title: 'The rule: BIDMAS',
        text: '**B**rackets first\n**I**ndices (powers, like 3^{2})\n**D**ivision and **M**ultiplication\n**A**ddition and **S**ubtraction',
        visual: { type: 'table', headers: ['Order', 'What to do'], rows: [['1st', 'Brackets ( )'], ['2nd', 'Indices (powers)'], ['3rd', '× and ÷'], ['4th', '+ and −']] }
      },
      {
        title: 'Equal partners: left to right',
        text: '× and ÷ are equal partners. Do them **left to right**. The same goes for + and −.\n20 − 8 + 3: left to right gives 12 + 3 = **15**.\n(Not 20 − 11 = 9!)'
      },
      {
        title: 'Brackets change the answer',
        text: '(2 + 3) × 4 = 5 × 4 = **20**\n2 + 3 × 4 = 2 + 12 = **14**\nBrackets say: "Do me first!"'
      },
      {
        title: 'Worked example: 18 − 2 × (3 + 4)',
        text: '1. Brackets: 3 + 4 = 7. Now you have 18 − 2 × 7.\n2. Multiply: 2 × 7 = 14. Now you have 18 − 14.\n3. Subtract: 18 − 14 = **4**.'
      }
    ],
    gen(level) {
      const r = (a, b) => U.rint(a, b);
      const T = {
        addMul: () => {
          const a = r(2, 20), b = r(2, 9), c = r(2, 9), bc = b * c;
          return { e: `${a} + ${b} × ${c}`, ans: a + bc, naive: (a + b) * c, first: `Multiply first: ${b} × ${c} = ${bc}. Now work out ${a} + ${bc}.`, steps: `${b} × ${c} = ${bc}, then ${a} + ${bc} = ${a + bc}.` };
        },
        mulAdd: () => {
          const a = r(2, 9), b = r(2, 9), c = r(2, 20), ab = a * b;
          return { e: `${a} × ${b} + ${c}`, ans: ab + c, naive: a * (b + c), first: `Multiply first: ${a} × ${b} = ${ab}. Now add ${c}.`, steps: `${a} × ${b} = ${ab}, then ${ab} + ${c} = ${ab + c}.` };
        },
        subMul: () => {
          const b = r(2, 9), c = r(2, 9), bc = b * c, a = bc + r(1, 20);
          return { e: `${a} − ${b} × ${c}`, ans: a - bc, naive: (a - b) * c, first: `Multiply first: ${b} × ${c} = ${bc}. Now work out ${a} − ${bc}.`, steps: `${b} × ${c} = ${bc}, then ${a} − ${bc} = ${a - bc}.` };
        },
        brAdd: () => {
          const a = r(2, 12), b = r(2, 12), c = r(2, 9), s = a + b;
          return { e: `(${a} + ${b}) × ${c}`, ans: s * c, naive: a + b * c, first: `Brackets first: ${a} + ${b} = ${s}. Now work out ${s} × ${c}.`, steps: `${a} + ${b} = ${s}, then ${s} × ${c} = ${s * c}.` };
        },
        brSub: () => {
          const b = r(2, 9), a = b + r(2, 9), c = r(2, 9), s = a - b;
          return { e: `(${a} − ${b}) × ${c}`, ans: s * c, naive: a - b * c, first: `Brackets first: ${a} − ${b} = ${s}. Now work out ${s} × ${c}.`, steps: `${a} − ${b} = ${s}, then ${s} × ${c} = ${s * c}.` };
        },
        mulSubMul: () => {
          let a, b, c, d;
          do { a = r(3, 9); b = r(3, 9); c = r(2, 9); d = r(2, 6); } while (a * b <= c * d);
          const ab = a * b, cd = c * d;
          return { e: `${a} × ${b} − ${c} × ${d}`, ans: ab - cd, naive: (ab - c) * d, first: `Do both multiplications first: ${a} × ${b} = ${ab} and ${c} × ${d} = ${cd}.`, steps: `${a} × ${b} = ${ab} and ${c} × ${d} = ${cd}, then ${ab} − ${cd} = ${ab - cd}.` };
        },
        addDiv: () => {
          const c = r(2, 9), q = r(2, 9), b = c * q, a = r(2, 20);
          return { e: `${a} + ${b} ÷ ${c}`, ans: a + q, naive: (a + b) % c === 0 ? (a + b) / c : null, first: `Divide first: ${b} ÷ ${c} = ${q}. Now work out ${a} + ${q}.`, steps: `${b} ÷ ${c} = ${q}, then ${a} + ${q} = ${a + q}.` };
        },
        mulBrSub: () => {
          const a = r(2, 6), b = r(2, 9), c = r(2, 9), s = b + c, d = r(1, Math.min(20, a * s - 1));
          return { e: `${a} × (${b} + ${c}) − ${d}`, ans: a * s - d, naive: a * b + c - d, first: `Brackets first: ${b} + ${c} = ${s}. Now work out ${a} × ${s} − ${d}.`, steps: `${b} + ${c} = ${s}, then ${a} × ${s} = ${a * s}, then ${a * s} − ${d} = ${a * s - d}.` };
        },
        divMul: () => {
          const b = r(2, 9), k = r(2, 9), a = b * k, c = r(2, 9);
          return { e: `${a} ÷ ${b} × ${c}`, ans: k * c, naive: a % (b * c) === 0 ? a / (b * c) : null, first: `× and ÷ are equal partners, so work left to right: ${a} ÷ ${b} = ${k} first.`, steps: `Left to right: ${a} ÷ ${b} = ${k}, then ${k} × ${c} = ${k * c}.` };
        },
        subAdd: () => {
          let a, b, c;
          do { a = r(20, 50); b = r(2, 19); c = r(2, 19); } while (b + c >= a);
          return { e: `${a} − ${b} + ${c}`, ans: a - b + c, naive: a - (b + c), first: `+ and − are equal partners, so work left to right: ${a} − ${b} = ${a - b} first.`, steps: `Left to right: ${a} − ${b} = ${a - b}, then ${a - b} + ${c} = ${a - b + c}.` };
        },
        addSq: () => {
          const a = r(2, 20), b = r(2, 9);
          return { e: `${a} + ${b}^{2}`, ans: a + b * b, naive: (a + b) * (a + b), first: `Indices (powers) first: ${b}^{2} = ${b * b}. Now work out ${a} + ${b * b}.`, steps: `${b}^{2} = ${b * b}, then ${a} + ${b * b} = ${a + b * b}.` };
        },
        brSq: () => {
          let a, b;
          do { a = r(1, 7); b = r(1, 7); } while (a + b > 10 || a + b < 4);
          const s = a + b;
          return { e: `(${a} + ${b})^{2}`, ans: s * s, naive: a + b * b, first: `Brackets first: ${a} + ${b} = ${s}. Now square it.`, steps: `${a} + ${b} = ${s}, then ${s}^{2} = ${s} × ${s} = ${s * s}.` };
        },
        sqSubMul: () => {
          let a, b, c;
          do { a = r(5, 12); b = r(2, 6); c = r(2, 6); } while (a * a <= b * c);
          return { e: `${a}^{2} − ${b} × ${c}`, ans: a * a - b * c, naive: (a * a - b) * c, first: `Indices first: ${a}^{2} = ${a * a}. Then multiply: ${b} × ${c} = ${b * c}.`, steps: `${a}^{2} = ${a * a} and ${b} × ${c} = ${b * c}, then ${a * a} − ${b * c} = ${a * a - b * c}.` };
        },
        mulBrDiv: () => {
          const d = r(2, 6), s = d * r(2, 5), b = r(1, s - 1), c = s - b, a = r(2, 9);
          return { e: `${a} × (${b} + ${c}) ÷ ${d}`, ans: a * s / d, naive: null, first: `Brackets first: ${b} + ${c} = ${s}. Now work left to right: ${a} × ${s} ÷ ${d}.`, steps: `${b} + ${c} = ${s}, then ${a} × ${s} = ${a * s}, then ${a * s} ÷ ${d} = ${a * s / d}.` };
        },
        brBr: () => {
          const a = r(2, 9), b = r(2, 9), c = r(5, 12), d = r(1, c - 1);
          return { e: `(${a} + ${b}) × (${c} − ${d})`, ans: (a + b) * (c - d), naive: a + b * c - d, first: `Work out both brackets: ${a} + ${b} = ${a + b} and ${c} − ${d} = ${c - d}.`, steps: `${a} + ${b} = ${a + b} and ${c} − ${d} = ${c - d}, then ${a + b} × ${c - d} = ${(a + b) * (c - d)}.` };
        }
      };
      const pool = L(level, ['addMul', 'mulAdd', 'subMul', 'brAdd', 'brSub'],
        ['mulSubMul', 'addDiv', 'mulBrSub', 'divMul', 'subAdd', 'addMul', 'brAdd'],
        ['addSq', 'brSq', 'sqSubMul', 'mulBrDiv', 'brBr', 'mulSubMul', 'divMul']);
      const nudge = level === 3 ? 'Brackets first, then powers, then × and ÷, then + and − (left to right).' : 'Brackets first, then × and ÷, then + and − (left to right).';
      const tmpl = () => T[U.pick(pool)]();
      const goodNaive = t => t.naive !== null && Number.isInteger(t.naive) && t.naive >= 0 && t.naive !== t.ans;

      const compute = (t = tmpl()) => num(`${t.e} = ?`, t.ans, [nudge, t.first], t.steps);
      const choice = () => {
        const t = tmpl();
        if (!goodNaive(t)) return compute(t);
        return chq(`${t.e} = ?`, f(t.ans), U.numChoices(t.ans, { extra: [t.naive], min: 0 }),
          [nudge, t.first], `${t.steps} (${f(t.naive)} comes from doing the operations in the wrong order.)`);
      };
      const mistake = () => {
        const t = tmpl(), nm = U.name();
        if (!goodNaive(t)) return compute(t);
        return num(`${nm} worked out ${t.e} and got ${f(t.naive)}. What is the correct answer?`, t.ans,
          [`${nm} did the operations in the wrong order. ${nudge}`, t.first], t.steps);
      };
      const brackets = () => {
        for (;;) {
          const a = r(2, 9), b = r(2, 9), c = r(4, 9), d = r(1, c - 1);
          const opts = [
            [`(${a} + ${b}) × ${c} − ${d}`, (a + b) * c - d, `${a} + ${b} = ${a + b}, ${a + b} × ${c} = ${(a + b) * c}, ${(a + b) * c} − ${d} = ${(a + b) * c - d}`],
            [`${a} + ${b} × (${c} − ${d})`, a + b * (c - d), `${c} − ${d} = ${c - d}, ${b} × ${c - d} = ${b * (c - d)}, ${a} + ${b * (c - d)} = ${a + b * (c - d)}`],
            [`(${a} + ${b}) × (${c} − ${d})`, (a + b) * (c - d), `${a} + ${b} = ${a + b}, ${c} − ${d} = ${c - d}, ${a + b} × ${c - d} = ${(a + b) * (c - d)}`],
            [`${a} + (${b} × ${c}) − ${d}`, a + b * c - d, '']
          ];
          if (new Set(opts.map(o => o[1])).size < 4) continue;
          const k = U.rint(0, 2);
          const [s, target, how] = opts[k];
          const w = opts[[0, 1, 2].filter(i => i !== k)[U.rint(0, 1)]];
          return chq(`Where should the brackets go to make this true?\n${a} + ${b} × ${c} − ${d} = ${target}`, s, U.shuffle(opts.map(o => o[0])),
            ['Try each one. Remember: work out the brackets first.', `Try ${w[0]}: that makes ${w[1]}, not ${target}.`],
            `${s}: ${how}.`);
        }
      };
      const word = () => {
        const nm = U.name();
        let a, b, c;
        do { a = r(2, 6); b = r(3, 9); c = r(2, 9); } while (a === c || b === c || a === b);
        if (Math.random() < 0.5) {
          const right = `${a} × ${b} + ${c}`;
          return chq(`${nm} buys ${a} packs of pens with ${b} pens in each pack, and ${c} single pens. Which calculation gives the total number of pens?`, right,
            U.shuffle([right, `${a} × (${b} + ${c})`, `(${a} + ${c}) × ${b}`, `${a} + ${b} × ${c}`]),
            ['First find the pens in the packs, then add the single pens.', `The packs hold ${a} × ${b} pens.`],
            `The packs hold ${a} × ${b} = ${a * b} pens. Add the ${c} single pens: ${right} = ${a * b + c}. No brackets are needed, because × is done first anyway.`);
        }
        const right = `${a} × (${b} + ${c})`;
        return chq(`${nm} has ${a} bags. Each bag has ${b} red beads and ${c} blue beads. Which calculation gives the total number of beads?`, right,
          U.shuffle([right, `${a} × ${b} + ${c}`, `${a} + ${b} + ${c}`, `${a} × ${b} × ${c}`]),
          ['First find how many beads are in one bag.', `One bag has ${b} + ${c} beads.`],
          `One bag has ${b} + ${c} = ${b + c} beads, and there are ${a} bags: ${right} = ${a * (b + c)}. The brackets make sure you add first.`);
      };

      return run(L(level,
        [() => compute(), () => compute(), choice, word],
        [() => compute(), choice, mistake, brackets, word],
        [() => compute(), choice, mistake, brackets, word]));
    }
  });

  // =====================================================================
  // Unit 4: Fractions, percentages and ratio
  // =====================================================================
  PMLM.registerUnit({ id: 'g6.u4', grade: 6, name: 'Fractions, % and ratio', icon: '🍕' });

  // a proper fraction in simplest form with a denominator from the list
  const properFrac = dens => {
    const b = U.pick(dens);
    let a;
    do { a = U.rint(1, b - 1); } while (U.gcd(a, b) !== 1);
    return [a, b];
  };
  const cmpSign = (x, y) => (x > y ? '>' : x < y ? '<' : '=');

  // ---------- 11. Equivalent fractions ----------
  PMLM.registerSkill({
    id: 'g6.equivFrac', grade: 6, unit: 'g6.u4', title: 'Equivalent fractions', icon: '🍕',
    blurb: 'Find equal fractions and simplify them',
    lesson: [
      {
        title: 'Same amount, different names',
        text: '{1/2}, {2/4} and {4/8} look different, but they show the **same amount**.\nThey are **equivalent fractions**.',
        visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '1/2' }, { parts: 4, shaded: 2, label: '2/4' }, { parts: 8, shaded: 4, label: '4/8' }] }
      },
      {
        title: 'Multiply top and bottom',
        text: 'To make an equivalent fraction, **multiply** the numerator and the denominator by the **same** number.\n{2/3} = {8/12} (both × 4).\nAdding the same number does **not** work!',
        visual: { type: 'fractionBar', bars: [{ parts: 3, shaded: 2, label: '2/3' }, { parts: 12, shaded: 8, label: '8/12' }] }
      },
      {
        title: 'Simplifying',
        text: 'To **simplify**, divide the top and bottom by a **common factor**. Stop when the only common factor is 1.\n{12/18} → ÷ 6 → {2/3}. This is the **simplest form**.',
        visual: { type: 'fractionBar', bars: [{ parts: 18, shaded: 12, label: '12/18' }, { parts: 3, shaded: 2, label: '2/3' }] }
      },
      {
        title: 'Tip: small steps are fine',
        text: 'Dividing by the **highest common factor** simplifies in one step. If you use a smaller factor, just keep going:\n{12/18} → ÷ 2 → {6/9} → ÷ 3 → {2/3}'
      },
      {
        title: 'Worked example: simplify {20/35}',
        text: '1. Find a number that divides both 20 and 35: **5**.\n2. 20 ÷ 5 = 4 and 35 ÷ 5 = 7.\n3. 4 and 7 have no common factor except 1.\n4. So **{20/35} = {4/7}**.'
      }
    ],
    gen(level) {
      const missing = () => {
        const [a, b] = properFrac(L(level, [2, 3, 4, 5, 6], [3, 4, 5, 6, 7, 8, 9, 10], [4, 5, 6, 7, 8, 9, 10, 12]));
        const k = U.rint(2, L(level, 5, 8, 9));
        const v = level === 3 ? U.rint(0, 2) : U.rint(0, 1);
        if (v === 0) {
          return num(`Find the missing number **n**.\n${fr(a, b)} = {n/${b * k}}`, a * k,
            ['What has the denominator been multiplied by? Do the same to the numerator.', `${b} × ${k} = ${b * k}, so the denominator was multiplied by ${k}.`],
            `${b} × ${k} = ${b * k}, so multiply the numerator by ${k} too: ${a} × ${k} = ${a * k}. ${fr(a, b)} = ${fr(a * k, b * k)}.`);
        }
        if (v === 1) {
          return num(`Find the missing number **n**.\n${fr(a, b)} = {${a * k}/n}`, b * k,
            ['What has the numerator been multiplied by? Do the same to the denominator.', `${a} × ${k} = ${a * k}, so the numerator was multiplied by ${k}.`],
            `${a} × ${k} = ${a * k}, so multiply the denominator by ${k} too: ${b} × ${k} = ${b * k}. ${fr(a, b)} = ${fr(a * k, b * k)}.`);
        }
        return num(`Find the missing number **n**.\n${fr(a * k, b * k)} = {n/${b}}`, a,
          ['What has the denominator been divided by? Do the same to the numerator.', `${b * k} ÷ ${k} = ${b}, so the denominator was divided by ${k}.`],
          `Divide the numerator by ${k} too: ${a * k} ÷ ${k} = ${a}. ${fr(a * k, b * k)} = ${fr(a, b)}.`);
      };
      const simplify = () => {
        const [a, b] = properFrac(L(level, [2, 3, 4, 5], [3, 4, 5, 6, 7, 8, 9, 10], [5, 6, 7, 8, 9, 10, 11, 12]));
        const k = L(level, U.pick([2, 3, 5]), U.rint(2, 8), U.pick([4, 5, 6, 8, 9, 10, 12]));
        const n = a * k, d = b * k, p = smallestFactor(k);
        const bar = level === 1 && d <= 24 ? { type: 'fractionBar', bars: [{ parts: d, shaded: n, label: `${n}/${d}` }] } : null;
        return fracQ(`Write ${fr(n, d)} in its simplest form.`, n, d,
          [`Find a number that divides both ${n} and ${d} exactly.`,
            p === k ? `${k} is a factor of both ${n} and ${d}. Divide the top and the bottom by ${k}.` : `Both divide by ${p}: ${fr(n, d)} = ${fr(n / p, d / p)}. Can you simplify again?`],
          `The highest common factor of ${n} and ${d} is ${k}. ${n} ÷ ${k} = ${a} and ${d} ÷ ${k} = ${b}, so ${fr(n, d)} = ${fr(a, b)}.`,
          Object.assign({ simplest: true }, vis(bar)));
      };
      const whichEquiv = () => {
        const [a, b] = properFrac([3, 4, 5, 6, 7, 8]);
        const k = U.rint(2, 5);
        const ans = fr(a * k, b * k);
        const cands = [[a + k, b + k], [a * k, b * (k + 1)], [a + 1, b + 1], [a * k, b + k]]
          .filter(([n, d]) => n * b !== d * a).map(([n, d]) => [fr(n, d), n / d]);
        return chq(`Which fraction is equivalent to ${fr(a, b)}?`, ans, byValue(ans, a / b, cands),
          ['Equivalent fractions: the top and bottom are multiplied by the **same** number.', `${fr(a + k, b + k)} adds ${k} to the top and bottom. Adding does not make equivalent fractions.`],
          `${a} × ${k} = ${a * k} and ${b} × ${k} = ${b * k}, so ${fr(a, b)} = ${ans}.`);
      };
      const notEquiv = () => {
        const [a, b] = properFrac([2, 3, 4, 5, 6]);
        const ks = U.sample([2, 3, 4, 5, 6], 3), k = U.rint(1, 4);
        const fake = fr(a + k, b + k);
        return chq(`Which fraction is **not** equivalent to ${fr(a, b)}?`, fake, U.shuffle([fake, ...ks.map(m => fr(a * m, b * m))]),
          ['Equivalent fractions: the top and bottom are multiplied by the **same** number.', `${fr(a * ks[0], b * ks[0])}: ${a} × ${ks[0]} = ${a * ks[0]} and ${b} × ${ks[0]} = ${b * ks[0]}, so that one is equivalent.`],
          `${fake} has ${k} added to the top and the bottom, and adding does not keep the fraction the same. The others are ${fr(a, b)} with the top and bottom multiplied by the same number.`);
      };
      const word = () => {
        if (Math.random() < 0.5) {
          let tot, part;
          do { tot = U.pick([20, 24, 25, 28, 30, 32, 36, 40]); part = U.rint(2, tot - 2); } while (U.gcd(part, tot) === 1);
          const [a, b] = U.simplify(part, tot);
          return fracQ(`In a class of ${tot} children, ${part} are girls. What fraction of the class are girls? Give your answer in its simplest form.`, part, tot,
            [`Write it as a fraction first: ${part} out of ${tot}. Then simplify.`, `${part} out of ${tot} is ${fr(part, tot)}.`],
            `${fr(part, tot)} = ${fr(a, b)} (divide the top and bottom by ${part / a}).`, { simplest: true });
        }
        const nm = U.name();
        let d, n;
        do { d = U.pick([6, 8, 10, 12, 16]); n = U.rint(2, d - 2); } while (U.gcd(n, d) === 1);
        const [a, b] = U.simplify(n, d);
        return fracQ(`A pizza is cut into ${d} equal slices. ${nm} eats ${n} slices. What fraction of the pizza does ${nm} eat? Give your answer in its simplest form.`, n, d,
          [`Write it as a fraction first: ${n} slices out of ${d}. Then simplify.`, `${nm} eats ${fr(n, d)} of the pizza.`],
          `${fr(n, d)} = ${fr(a, b)} (divide the top and bottom by ${n / a}).`, { simplest: true, visual: { type: 'pie', pies: [{ parts: d, shaded: n }] } });
      };
      const compare = () => {
        let a, b, c, d, Lc;
        for (;;) {
          [a, b] = properFrac([2, 3, 4, 5, 6]);
          if (level === 2) d = b * U.rint(2, 3);
          else { d = U.pick([3, 4, 5, 6, 8]); if (d === b) continue; }
          Lc = U.lcm(b, d);
          if (Lc > 24) continue;
          const target = a * Lc / b;
          if (Math.random() < 0.2 && (target * d) % Lc === 0 && target * d / Lc < d) c = target * d / Lc;
          else c = properFrac([d])[0];
          break;
        }
        const A = a * Lc / b, C = c * Lc / d;
        const ans = A === C ? 'They are equal' : A > C ? fr(a, b) : fr(c, d);
        const conv = [b !== Lc ? `${fr(a, b)} = ${fr(A, Lc)}` : '', d !== Lc ? `${fr(c, d)} = ${fr(C, Lc)}` : ''].filter(Boolean);
        return chq(`Which is bigger: ${fr(a, b)} or ${fr(c, d)}?`, ans, U.shuffle([fr(a, b), fr(c, d), 'They are equal']),
          ['Change them to the same denominator, then compare the numerators.', `Use ${Lc}: ${conv[0]}.`],
          `${conv.join(' and ')}. ${fr(A, Lc)} ${cmpSign(A, C)} ${fr(C, Lc)}, so ${A === C ? 'they are equal' : ans + ' is bigger'}.`);
      };

      return run(L(level,
        [missing, simplify, whichEquiv, word],
        [missing, simplify, whichEquiv, notEquiv, word, compare],
        [missing, simplify, notEquiv, word, compare]));
    }
  });

  // ---------- 12. Add and subtract fractions ----------
  PMLM.registerSkill({
    id: 'g6.addSubFrac', grade: 6, unit: 'g6.u4', title: 'Add and subtract fractions', icon: '➕',
    blurb: 'Make the denominators the same, then add or subtract',
    lesson: [
      {
        title: 'Same denominator: easy',
        text: 'When the denominators are the same, just add the **numerators**: {2/7} + {3/7} = {5/7}.\nThe denominator stays the same, because you are counting sevenths.',
        visual: { type: 'fractionBar', bars: [{ parts: 7, shaded: 2, label: '2/7' }, { parts: 7, shaded: 3, label: '3/7' }, { parts: 7, shaded: 5, label: '5/7' }] }
      },
      {
        title: 'Different denominators',
        text: '{1/2} + {1/3}: halves and thirds are different-sized pieces, so you can\'t add them yet.\nChange both into **sixths**: {1/2} = {3/6} and {1/3} = {2/6}.\nNow {3/6} + {2/6} = **{5/6}**.',
        visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '1/2' }, { parts: 6, shaded: 3, label: '3/6' }, { parts: 3, shaded: 1, label: '1/3' }, { parts: 6, shaded: 2, label: '2/6' }] }
      },
      {
        title: 'Never add the denominators!',
        text: 'A very common mistake: {1/2} + {1/3} = {2/5} ✗\n{2/5} is smaller than {1/2}, and adding can\'t make something smaller!\nAlways find a **common denominator** first.',
        visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '1/2' }, { parts: 5, shaded: 2, label: '2/5' }] }
      },
      {
        title: 'Answers bigger than 1',
        text: 'A top-heavy answer can be written as a **mixed number**: {7/6} = 1 {1/6}.\nWith mixed numbers, you can change them to top-heavy fractions first: 2 {1/4} = {9/4}.'
      },
      {
        title: 'Worked example: {3/4} + {2/3}',
        text: '1. A common denominator of 4 and 3 is **12**.\n2. {3/4} = {9/12} and {2/3} = {8/12}.\n3. {9/12} + {8/12} = {17/12}.\n4. As a mixed number: **1 {5/12}**.'
      }
    ],
    gen(level) {
      const pick2 = (add, wholes) => {
        for (;;) {
          let b, d;
          if (level === 1) {
            b = U.pick([2, 3, 4, 5]);
            d = b * U.pick([2, 3].filter(x => b * x <= 12));
            if (Math.random() < 0.5) [b, d] = [d, b];
          } else {
            [b, d] = U.sample([2, 3, 4, 5, 6, 8, 10, 12], 2);
            if (U.lcm(b, d) > 24) continue;
          }
          const a = properFrac([b])[0], c = properFrac([d])[0];
          let W1 = 0, W2 = 0;
          if (wholes && level === 3) { W1 = U.rint(1, 3); W2 = U.rint(0, 2); }
          const n1 = W1 * b + a, n2 = W2 * d + c;
          const Lc = U.lcm(b, d), N1 = n1 * Lc / b, N2 = n2 * Lc / d;
          const res = add ? N1 + N2 : N1 - N2;
          if (res <= 0 || res % Lc === 0) continue;
          if (level === 1 && add && res > Lc) continue;
          return { a, b, c, d, n1, n2, L: Lc, N1, N2, res, s1: mx(n1, b), s2: mx(n2, d), wholes: W1 + W2 > 0 };
        }
      };
      const convOne = (s, n, den, N, Lc) => {
        let out = s;
        if (s !== fr(n, den)) out += ` = ${fr(n, den)}`;
        if (den !== Lc) out += ` = ${fr(N, Lc)}`;
        return out === s ? null : out;
      };
      const convs = P => [convOne(P.s1, P.n1, P.b, P.N1, P.L), convOne(P.s2, P.n2, P.d, P.N2, P.L)].filter(Boolean).join(' and ');
      const hints = P => [
        P.wholes ? 'Change the mixed numbers to top-heavy fractions, then use a common denominator.'
          : `Find a common denominator: a number in both the ${P.b} and ${P.d} times tables.`,
        `Use ${P.L}: ${convs(P)}.`
      ];
      const tail = (n, d) => (mx(n, d) !== fr(n, d) ? ` = ${mx(n, d)}` : '');
      const explain = (P, op) => `${convs(P)}. ${fr(P.N1, P.L)} ${op} ${fr(P.N2, P.L)} = ${fr(P.res, P.L)}${tail(P.res, P.L)}.`;
      const big = P => (P.res > P.L ? { mixed: true } : {});

      const compute = () => {
        const add = Math.random() < 0.55;
        const P = pick2(add, true), op = add ? '+' : '−';
        return fracQ(`${P.s1} ${op} ${P.s2} = ?`, P.res, P.L, hints(P), explain(P, op), big(P));
      };
      const mistake = () => {
        const P = pick2(true, false), nm = U.name();
        const wrong = fr(P.a + P.c, P.b + P.d), ansStr = mx(P.res, P.L);
        return chq(`${nm} says ${fr(P.a, P.b)} + ${fr(P.c, P.d)} = ${wrong}. What is the correct answer?`, ansStr,
          byValue(ansStr, P.res / P.L, [[wrong, (P.a + P.c) / (P.b + P.d)], [fr(P.a + P.c, P.L), (P.a + P.c) / P.L], [fr(P.a * P.c, P.b * P.d), P.a * P.c / (P.b * P.d)]]),
          ['You can\'t add the denominators. Make the denominators the same first.', `Use ${P.L}: ${convs(P)}.`],
          `${explain(P, '+')} ${nm} added the denominators, but the pieces must be the same size before you add them.`);
      };
      const missing = () => {
        const P = pick2(true, false);
        const total = mx(P.res, P.L);
        const cv = [total !== fr(P.res, P.L) ? `${total} = ${fr(P.res, P.L)}` : '', P.b !== P.L ? `${fr(P.a, P.b)} = ${fr(P.N1, P.L)}` : ''].filter(Boolean);
        return fracQ(`${fr(P.a, P.b)} + □ = ${total}`, P.c, P.d,
          [`Work backwards: □ = ${total} − ${fr(P.a, P.b)}.`, cv.length ? `Use denominator ${P.L}: ${cv.join(' and ')}.` : `They already have the same denominator, ${P.L}. Subtract the numerators.`],
          `${fr(P.res, P.L)} − ${fr(P.N1, P.L)} = ${fr(P.N2, P.L)}${P.d !== P.L ? ' = ' + fr(P.c, P.d) : ''}, so □ = ${fr(P.c, P.d)}.`);
      };
      const word = () => {
        const [n1, n2] = names2();
        const t = U.rint(0, L(level, 0, 1, 2));
        if (t === 2) {
          const P = pick2(false, true);
          return fracQ(`A jug holds ${P.s1} litres of juice. ${n1} pours out ${P.s2} litre${P.n2 > P.d ? 's' : ''}. How much juice is left in the jug?`, P.res, P.L,
            hints(P), explain(P, '−'), Object.assign({ unit: 'litres' }, big(P)));
        }
        let P;
        do { P = pick2(true, false); } while (P.res >= P.L);
        if (t === 0) {
          return fracQ(`${n1} ate ${fr(P.a, P.b)} of a cake and ${n2} ate ${fr(P.c, P.d)} of it. What fraction of the cake did they eat altogether?`, P.res, P.L,
            hints(P), explain(P, '+'));
        }
        const left = P.L - P.res;
        return fracQ(`${n1} ate ${fr(P.a, P.b)} of a cake and ${n2} ate ${fr(P.c, P.d)} of it. What fraction of the cake is left?`, left, P.L,
          [`First find how much they ate altogether. The whole cake is 1 = ${fr(P.L, P.L)}.`, `Use ${P.L}: ${convs(P)}.`],
          `They ate ${fr(P.N1, P.L)} + ${fr(P.N2, P.L)} = ${fr(P.res, P.L)}. 1 − ${fr(P.res, P.L)} = ${fr(left, P.L)}${tail(left, P.L)}.`);
      };

      return run(L(level,
        [compute, compute, missing, word],
        [compute, compute, mistake, missing, word],
        [compute, compute, mistake, word]));
    }
  });

  // ---------- 13. Multiply and divide fractions by whole numbers ----------
  PMLM.registerSkill({
    id: 'g6.multDivFrac', grade: 6, unit: 'g6.u4', title: 'Fractions × and ÷', icon: '🍰',
    blurb: 'Multiply a fraction by a whole number, or divide it',
    lesson: [
      {
        title: 'Fraction × whole number',
        text: '{2/5} × 3 means 3 lots of {2/5}: {2/5} + {2/5} + {2/5} = {6/5}.\nShortcut: multiply the **numerator** only. 2 × 3 = 6, so the answer is {6/5} = 1 {1/5}.',
        visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 2, label: '2/5' }, { parts: 5, shaded: 2, label: '2/5' }, { parts: 5, shaded: 2, label: '2/5' }] }
      },
      {
        title: 'The denominator stays the same',
        text: 'Don\'t multiply the denominator too!\n{2/5} × 3 is **not** {6/15}. {6/15} is the same as {2/5}, so nothing has been multiplied.',
        visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 2, label: '2/5' }, { parts: 15, shaded: 6, label: '6/15' }] }
      },
      {
        title: 'Dividing by a whole number',
        text: '{1/3} ÷ 2 means split {1/3} into 2 equal parts. Each part is **{1/6}**.\nShortcut: multiply the **denominator** by the whole number. 3 × 2 = 6, so {1/3} ÷ 2 = {1/6}.',
        visual: { type: 'fractionBar', bars: [{ parts: 3, shaded: 1, label: '1/3' }, { parts: 6, shaded: 1, label: '1/6' }] }
      },
      {
        title: 'Tip: check the size',
        text: 'Multiplying by a whole number makes the fraction **bigger**.\nDividing by a whole number makes it **smaller**.\nIf your answer goes the wrong way, check your working!'
      },
      {
        title: 'Worked example: {3/4} ÷ 2',
        text: '1. Dividing by 2 means splitting into 2 equal parts.\n2. Multiply the denominator by 2: 4 × 2 = 8.\n3. The numerator stays 3.\n4. So **{3/4} ÷ 2 = {3/8}**.',
        visual: { type: 'fractionBar', bars: [{ parts: 4, shaded: 3, label: '3/4' }, { parts: 8, shaded: 3, label: '3/8' }] }
      }
    ],
    gen(level) {
      const fw = () => {
        for (;;) {
          const [a, b] = properFrac(L(level, [3, 4, 5, 6, 7, 8, 9, 10], [3, 4, 5, 6, 7, 8, 9, 10, 12], [4, 5, 6, 7, 8, 9, 10, 12]));
          const w = U.rint(2, L(level, 5, 9, 9));
          const n = a * w;
          if (n % b === 0 || (level === 1 && n > b)) continue;
          return { a, b, w, n };
        }
      };
      const fwHints = ({ a, b, w }) => [
        `Multiply the numerator by ${w}. The denominator stays the same.`,
        `${fr(a, b)} × ${w} is ${w} lots of ${fr(a, b)}. Count up: ${[1, 2, 3].filter(k => k < w).map(k => fr(a * k, b)).join(', ')} …`
      ];
      const fwExplain = ({ a, b, w, n }) => `${a} × ${w} = ${n}, so the answer is ${fr(n, b)}${mx(n, b) !== fr(n, b) ? ' = ' + mx(n, b) : ''}.`;

      const timesWhole = () => {
        const P = fw();
        const bars = level === 1 && P.w <= 4 ? { type: 'fractionBar', bars: Array.from({ length: P.w }, () => ({ parts: P.b, shaded: P.a, label: `${P.a}/${P.b}` })) } : null;
        return fracQ(Math.random() < 0.5 ? `${fr(P.a, P.b)} × ${P.w} = ?` : `${P.w} × ${fr(P.a, P.b)} = ?`, P.n, P.b, fwHints(P), fwExplain(P),
          Object.assign(P.n > P.b ? { mixed: true } : {}, vis(bars)));
      };
      const divParts = simplest => {
        let a, b, w;
        if (level === 1) { a = 1; b = U.rint(2, 5); w = U.rint(2, 4); }
        else if (simplest) {
          do { [a, b] = properFrac([3, 5, 7, 8, 9, 10, 11]); w = U.rint(2, 4); } while (a % w !== 0);
        } else {
          do { [a, b] = properFrac([3, 4, 5, 6, 7, 8]); w = U.rint(2, 5); } while (b * w > 40);
        }
        return { a, b, w };
      };
      const divWhole = simplest => {
        const { a, b, w } = divParts(simplest);
        const res = U.simplify(a, b * w);
        const bar = level === 1 ? { type: 'fractionBar', bars: [{ parts: b, shaded: a, label: `${a}/${b}` }] } : null;
        return fracQ(`${fr(a, b)} ÷ ${w} = ?${simplest ? '\nGive your answer in its simplest form.' : ''}`, a, b * w,
          [`Dividing by ${w} means splitting into ${w} equal parts. Multiply the denominator by ${w}.`,
            simplest ? `The denominator becomes ${b} × ${w} = ${b * w}, so you get ${fr(a, b * w)}. Now simplify it.` : `Each part is ${w} times smaller, so the denominator becomes ${b} × ${w}.`],
          `${fr(a, b)} ÷ ${w} = ${fr(a, b * w)}${res[1] !== b * w ? ' = ' + fr(...res) : ''}.`,
          Object.assign(simplest ? { simplest: true } : {}, vis(bar)));
      };
      const ofAmount = () => {
        let a, b;
        do { [a, b] = properFrac([3, 4, 5, 6, 8, 10]); } while (a < 2);
        const k = U.rint(2, 12), N = b * k;
        return num(`What is ${fr(a, b)} of ${N}?`, a * k, [`Find ${fr(1, b)} first by dividing by ${b}. Then multiply by ${a}.`, `${fr(1, b)} of ${N} = ${N} ÷ ${b} = ${k}.`],
          `${N} ÷ ${b} = ${k}, and ${k} × ${a} = ${a * k}.`);
      };
      const mistake = () => {
        const nm = U.name();
        if (Math.random() < 0.5) {
          let P;
          do { P = fw(); } while (P.a === 2 && P.w === 2);
          const { a, b, w, n } = P;
          const wrong = fr(n, b * w), ansStr = mx(n, b);
          return chq(`${nm} says ${fr(a, b)} × ${w} = ${wrong}. What is the correct answer?`, ansStr,
            byValue(ansStr, n / b, [[wrong, a / b], [fr(a, b * w), a / (b * w)], [fr(a + w, b), (a + w) / b]]),
            [`Multiplying by ${w} means ${w} lots. Only the numerator is multiplied; the denominator stays the same.`, `${wrong} simplifies back to ${fr(a, b)}, so it hasn't been multiplied at all!`],
            `${fwExplain(P)} ${nm} multiplied the denominator too.`);
        }
        let a, b, w;
        do { [a, b] = properFrac([3, 4, 5, 6, 7, 8]); w = U.rint(2, 4); } while (b * w > 40);
        const wrong = mx(a * w, b), res = U.simplify(a, b * w), ansStr = fr(...res);
        return chq(`${nm} says ${fr(a, b)} ÷ ${w} = ${wrong}. What is the correct answer?`, ansStr,
          byValue(ansStr, a / (b * w), [[wrong, a * w / b], [fr(a, b + w), a / (b + w)], [fr(a * w, b * w), a / b]]),
          ['Dividing by a whole number should make the fraction smaller, not bigger.', `Dividing by ${w} splits every piece into ${w}: the denominator becomes ${b} × ${w}.`],
          `${fr(a, b)} ÷ ${w} = ${fr(a, b * w)}${res[1] !== b * w ? ' = ' + ansStr : ''}. ${nm} multiplied instead of dividing.`);
      };
      const word = () => {
        const nm = U.name();
        const t = U.rint(0, L(level, 1, 3, 3));
        if (t === 0) {
          const P = fw();
          return fracQ(`A recipe needs ${fr(P.a, P.b)} of a cup of sugar. How much sugar is needed for ${P.w} batches?`, P.n, P.b, fwHints(P), fwExplain(P),
            Object.assign({ unit: 'cups' }, P.n > P.b ? { mixed: true } : {}));
        }
        if (t === 1) {
          const { a, b, w } = divParts(false);
          const res = U.simplify(a, b * w);
          return fracQ(`${nm} has ${fr(a, b)} of a pizza left. It is shared equally between ${w} friends. What fraction of the whole pizza does each friend get?`, a, b * w,
            [`Sharing between ${w} means dividing by ${w}: ${fr(a, b)} ÷ ${w}.`, `Each share is ${w} times smaller, so the denominator becomes ${b} × ${w}.`],
            `${fr(a, b)} ÷ ${w} = ${fr(a, b * w)}${res[1] !== b * w ? ' = ' + fr(...res) : ''} of the pizza each.`);
        }
        if (t === 2) {
          const P = fw();
          return fracQ(`Each lap of a track is ${fr(P.a, P.b)} km. ${nm} runs ${P.w} laps. How far is that?`, P.n, P.b, fwHints(P), fwExplain(P),
            Object.assign({ unit: 'km' }, P.n > P.b ? { mixed: true } : {}));
        }
        let a, b;
        do { [a, b] = properFrac([3, 4, 5, 6, 8]); } while (a < 2);
        const k = U.rint(3, 10), N = b * k;
        return num(`There are ${N} children in a club. ${fr(a, b)} of them play chess. How many children play chess?`, a * k,
          [`Find ${fr(1, b)} of ${N} first, then multiply by ${a}.`, `${fr(1, b)} of ${N} = ${N} ÷ ${b} = ${k}.`],
          `${N} ÷ ${b} = ${k}, and ${k} × ${a} = ${a * k} children.`);
      };

      return run(L(level,
        [timesWhole, () => divWhole(false), timesWhole, word],
        [timesWhole, () => divWhole(false), ofAmount, mistake, word],
        [timesWhole, () => divWhole(true), () => divWhole(false), ofAmount, mistake, word]));
    }
  });

  // ---------- 14. Fractions, decimals and percentages ----------
  PMLM.registerSkill({
    id: 'g6.fdp', grade: 6, unit: 'g6.u4', title: 'Fractions, decimals, %', icon: '🔄',
    blurb: 'Change between fractions, decimals and percentages',
    lesson: [
      {
        title: 'Three ways to say it',
        text: 'Fractions, decimals and percentages can show the **same amount**.\nLearn these by heart:',
        visual: { type: 'table', headers: ['Fraction', 'Decimal', 'Percentage'], rows: [['{1/2}', '0.5', '50%'], ['{1/4}', '0.25', '25%'], ['{3/4}', '0.75', '75%'], ['{1/5}', '0.2', '20%'], ['{1/10}', '0.1', '10%']] }
      },
      {
        title: 'Per cent means out of 100',
        text: '**Per cent** means **out of 100**. 37% = {37/100} = 0.37.\nTo change a decimal to a percentage, **multiply by 100**: 0.6 = **60%**.\nTo change a percentage to a decimal, **divide by 100**: 8% = **0.08**.',
        visual: { type: 'placeValue', value: '0.37' }
      },
      {
        title: 'Fraction to decimal',
        text: 'Make the denominator 10 or 100.\n{3/5} = {6/10} = 0.6 = 60%\n{7/20} = {35/100} = 0.35 = 35%',
        visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 3, label: '3/5' }, { parts: 10, shaded: 6, label: '6/10' }] }
      },
      {
        title: 'Watch out!',
        text: '0.3 is **30%**, not 3% (0.03 is 3%).\n{1/4} is 0.25, **not** 0.4 or 0.14.\n{1/3} is **not** 0.3: 0.3 is {3/10}.'
      },
      {
        title: 'Worked example: {9/25} as a %',
        text: '1. 25 × 4 = 100, so multiply the top and bottom by 4.\n2. {9/25} = {36/100}.\n3. 36 out of 100 is **36%**.\n4. As a decimal it is 0.36.'
      }
    ],
    gen(level) {
      const pool = L(level,
        [[1, 2], [1, 4], [3, 4], [1, 10], [3, 10], [7, 10], [9, 10]],
        [[1, 5], [2, 5], [3, 5], [4, 5], [1, 20], [3, 20], [7, 20], [9, 20], [11, 20], [1, 25], [4, 25], [6, 25], [12, 25], [1, 50], [7, 50], [3, 4]],
        [[1, 8], [3, 8], [5, 8], [7, 8], [13, 20], [17, 20], [8, 25], [21, 25], [3, 50], [27, 50], [9, 100], [37, 100], [3, 5]]);

      const fracToDec = () => {
        const [n, d] = U.pick(pool);
        const D = [10, 100, 1000].find(x => x % d === 0), k = D / d, v = R(n / d);
        return num(`Write ${fr(n, d)} as a decimal.`, v,
          ['Make the denominator 10, 100 or 1000. Then write it as a decimal.',
            k === 1 ? `The denominator is already ${D}, so this is ${n} ${D === 10 ? 'tenth' : 'hundredth'}${pl(n)}.` : `${d} × ${k} = ${D}, so ${fr(n, d)} = ${fr(n * k, D)}.`],
          `${fr(n, d)}${k === 1 ? '' : ' = ' + fr(n * k, D)} = ${f(v)}.`);
      };
      const fracToPct = () => {
        const [n, d] = U.pick(pool.filter(x => x[1] !== 100));
        const p = R(100 * n / d);
        if (100 % d === 0) {
          const k = 100 / d;
          return num(`Write ${fr(n, d)} as a percentage.`, p,
            ['Per cent means out of 100. Make the denominator 100.', `${d} × ${k} = 100, so multiply the top and bottom by ${k}.`],
            `${fr(n, d)} = ${fr(n * k, 100)} = ${f(p)}%.`, { unit: '%' });
        }
        const v = R(n / d);
        return num(`Write ${fr(n, d)} as a percentage.`, p,
          ['Change the fraction to a decimal first, then multiply by 100.', `${fr(n, d)} = ${fr(n * 1000 / d, 1000)} = ${f(v)}.`],
          `${fr(n, d)} = ${f(v)} = ${f(p)}%.`, { unit: '%' });
      };
      const decToPct = () => {
        const xt = L(level, Math.random() < 0.5 ? U.rint(1, 9) * 100 : nonTen(11, 99) * 10,
          Math.random() < 0.3 ? U.rint(1, 9) * 10 : nonTen(11, 99) * 10,
          Math.random() < 0.5 ? nonTen(101, 999) : nonTen(1, 99) * 10);
        const x = R(xt / 1000), p = R(xt / 10);
        return num(`Write ${f(x)} as a percentage.`, p,
          ['To change a decimal into a percentage, multiply by 100. The digits move 2 places to the left.', firstDigitStep(x, 2)],
          `${f(x)} × 100 = ${f(p)}, so ${f(x)} = ${f(p)}%.`, { unit: '%' });
      };
      const pctToDec = () => {
        const p = L(level, U.rint(1, 9) * 10, nonTen(11, 99), Math.random() < 0.4 ? U.rint(1, 9) : nonTen(11, 99));
        const v = R(p / 100);
        return num(`Write ${p}% as a decimal.`, v, ['Per cent means out of 100, so divide by 100.', `${p}% = ${fr(p, 100)}.`],
          `${p}% = ${fr(p, 100)} = ${f(v)}.`);
      };
      const pctToFrac = () => {
        let p;
        do { p = U.rint(2, 98); } while (U.gcd(p, 100) === 1 || (level < 3 && p % 5 !== 0));
        const [a, b] = U.simplify(p, 100);
        return fracQ(`Write ${p}% as a fraction in its simplest form.`, p, 100, ['Write it as a fraction out of 100, then simplify.', `${p}% = ${fr(p, 100)}.`],
          `${p}% = ${fr(p, 100)} = ${fr(a, b)} (divide the top and bottom by ${p / a}).`, { simplest: true });
      };
      const decToFrac = () => {
        let k, D;
        do { D = U.pick([10, 100]); k = U.rint(1, D - 1); } while (U.gcd(k, D) === 1 || (D === 100 && k % 10 === 0));
        const x = R(k / D), [a, b] = U.simplify(k, D);
        return fracQ(`Write ${f(x)} as a fraction in its simplest form.`, k, D, [`Write it as a fraction with denominator ${D}, then simplify.`, `${f(x)} = ${fr(k, D)}.`],
          `${f(x)} = ${fr(k, D)} = ${fr(a, b)}.`, { simplest: true });
      };
      const choiceSame = () => {
        if (Math.random() < 0.5) {
          const k = U.rint(2, 9), x = R(k / 10), ans = `${k * 10}%`;
          return chq(`Which is the same as ${f(x)}?`, ans, pick4(ans, [`${k}%`, fr(k, 100), fr(1, k)]),
            ['Per cent means out of 100. How many hundredths is it?', `${f(x)} = ${k} tenths = ${fr(k, 10)}.`],
            `${f(x)} = ${fr(k, 10)} = ${fr(k * 10, 100)} = ${k * 10}%. (${k}% would be ${f(R(k / 100))}.)`);
        }
        const [n, d] = U.pick([[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5]]);
        const pct = 100 * n / d, dec = f(R(n / d));
        const ans = Math.random() < 0.5 ? `${pct}%` : dec;
        const dist = [`${n}${d}%`, `0.${n}${d}`, n === 1 ? `0.${d}` : `${f(pct / 10)}%`];
        return chq(`Which is the same as ${fr(n, d)}?`, ans, pick4(ans, dist),
          ['Change the fraction so that the denominator is 100.', `${d} × ${100 / d} = 100, so ${fr(n, d)} = ${fr(pct, 100)}.`],
          `${fr(n, d)} = ${fr(pct, 100)} = ${pct}% = ${dec}.`);
      };
      const order = () => {
        const vals = U.sample([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80], 4);
        const forms = U.shuffle(['frac', 'pct', 'dec', 'dec']);
        const show = (p, form) => (form === 'pct' ? `${p}%` : form === 'dec' ? f(R(p / 100)) : fr(...U.simplify(p, 100)));
        const strs = vals.map((p, i) => show(p, forms[i]));
        const big = Math.random() < 0.5;
        const target = big ? Math.max(...vals) : Math.min(...vals);
        const ans = strs[vals.indexOf(target)];
        const fi = forms.indexOf('frac');
        return chq(`Which is the **${big ? 'largest' : 'smallest'}**?`, ans, U.shuffle(strs.slice()),
          ['Change them all into the same form. Percentages are easy to compare.', `For example, ${strs[fi]} = ${vals[fi]}%.`],
          `As percentages: ${vals.map((p, i) => (forms[i] === 'pct' ? `${p}%` : `${strs[i]} = ${p}%`)).join(', ')}. The ${big ? 'largest' : 'smallest'} is ${ans}.`);
      };

      return run(L(level,
        [fracToDec, fracToPct, decToPct, pctToDec, choiceSame],
        [fracToDec, fracToPct, decToPct, pctToDec, pctToFrac, decToFrac, choiceSame],
        [fracToDec, fracToPct, decToPct, pctToFrac, decToFrac, choiceSame, order]));
    }
  });

  // ---------- 15. Percentage of an amount ----------
  const pctNudge = p => (p === 50 ? '50% means half. You can divide by 2.' : p === 25 ? '25% means a quarter: halve it, then halve again.'
    : p === 75 ? '75% = 50% + 25%.' : p === 1 ? '1% means divide by 100.' : p === 10 ? '10% means divide by 10.' : `Find 10% first by dividing by 10. Then build up to ${p}%.`);
  const pctStep = (p, N) => {
    const t = R(N / 10), o = R(N / 100);
    if (p === 50) {
      const a = N - (N % 20), b = N % 20;
      return a > 0 && b > 0 ? `Split ${f(N)} into ${f(a)} and ${b}. Half of ${f(a)} is ${f(a / 2)}.`
        : b === 0 ? `${f(N)} is ${f(N / 10)} tens. Half of ${f(N / 10)} tens is ${f(N / 20)} tens.` : `Half of ${b}: what number doubled makes ${b}?`;
    }
    if (p === 10) return `To find 10%, divide by 10. ${firstDigitStep(N, -1)}`;
    if (p === 25) return `50% of ${f(N)} = ${f(R(N / 2))}. 25% is half of that.`;
    if (p === 75) return `50% of ${f(N)} = ${f(R(N / 2))} and 25% = ${f(R(N / 4))}.`;
    if (p === 1) return `1% means divide by 100. ${firstDigitStep(N, -2)}`;
    if (p === 2) return `1% of ${f(N)} = ${f(o)}. Now double it.`;
    if (p === 5) return `10% of ${f(N)} = ${f(t)}. 5% is half of that.`;
    if (p === 12) return `10% of ${f(N)} = ${f(t)} and 1% of ${f(N)} = ${f(o)}.`;
    if (p % 10 === 5) return `10% of ${f(N)} = ${f(t)}, so 5% = ${f(R(t / 2))}.`;
    return `10% of ${f(N)} = ${f(t)}. Now multiply by ${p / 10}.`;
  };
  const pctExplain = (p, N) => {
    const t = R(N / 10), o = R(N / 100), ans = R(N * p / 100);
    if (p === 50) return `50% is half: ${f(N)} ÷ 2 = ${f(ans)}.`;
    if (p === 10) return `10% of ${f(N)} = ${f(N)} ÷ 10 = ${f(ans)}.`;
    if (p === 25) return `50% = ${f(R(N / 2))}, and half of that is 25% = ${f(ans)}.`;
    if (p === 75) return `50% = ${f(R(N / 2))} and 25% = ${f(R(N / 4))}. 75% = ${f(R(N / 2))} + ${f(R(N / 4))} = ${f(ans)}.`;
    if (p === 1) return `1% of ${f(N)} = ${f(N)} ÷ 100 = ${f(ans)}.`;
    if (p === 2) return `1% = ${f(o)}, so 2% = 2 × ${f(o)} = ${f(ans)}.`;
    if (p === 5) return `10% = ${f(t)}, so 5% = ${f(t)} ÷ 2 = ${f(ans)}.`;
    if (p === 12) return `10% = ${f(t)} and 2% = 2 × ${f(o)} = ${f(R(2 * o))}. 12% = ${f(t)} + ${f(R(2 * o))} = ${f(ans)}.`;
    if (p % 10 === 5) {
      const k = (p - 5) / 10;
      return `10% = ${f(t)} and 5% = ${f(R(t / 2))}. ${p}% = ${k} × ${f(t)} + ${f(R(t / 2))} = ${f(R(k * t))} + ${f(R(t / 2))} = ${f(ans)}.`;
    }
    return `10% = ${f(t)}, so ${p}% = ${p / 10} × ${f(t)} = ${f(ans)}.`;
  };

  PMLM.registerSkill({
    id: 'g6.percentOf', grade: 6, unit: 'g6.u4', title: 'Percentage of an amount', icon: '💯',
    blurb: 'Find 10%, 25%, 50% and more of a number',
    lesson: [
      {
        title: 'Easy percentages',
        text: 'Some percentages are quick to find:',
        visual: { type: 'table', headers: ['Percentage', 'Do this'], rows: [['50%', '÷ 2 (half)'], ['25%', '÷ 4 (a quarter)'], ['10%', '÷ 10'], ['1%', '÷ 100']] }
      },
      {
        title: 'Build from 10%',
        text: 'Find 10% first, then build up.\n30% = 3 × 10%. 5% = half of 10%. 15% = 10% + 5%.\nExample: 10% of 80 = 8, so 30% of 80 = 3 × 8 = **24**.',
        visual: { type: 'barModel', rows: [{ label: '80', parts: 10, value: 8 }] }
      },
      {
        title: 'Tip: 75% and decimals',
        text: '75% = 50% + 25%. So 75% of 40 = 20 + 10 = **30**.\nAnswers can be decimals: 10% of 45 = 4.5, so 20% of 45 = **9**.'
      },
      {
        title: 'Worked example: 35% of 60',
        text: '1. 10% of 60 = 60 ÷ 10 = 6.\n2. 30% = 3 × 6 = 18.\n3. 5% = half of 6 = 3.\n4. 35% = 18 + 3 = **21**.'
      }
    ],
    gen(level, ctx) {
      const cur = ctx.currency;
      const pick = () => {
        if (level === 1) {
          const p = U.pick([50, 25, 10]);
          return [p, p === 50 ? 2 * U.rint(5, 60) : p === 25 ? 4 * U.rint(3, 30) : 10 * U.rint(2, 50)];
        }
        if (level === 2) {
          const p = U.pick([20, 30, 40, 60, 70, 80, 90, 75, 5]);
          return [p, p === 75 ? 4 * U.rint(3, 30) : 20 * U.rint(1, 20)];
        }
        return [U.pick([15, 35, 45, 65, 1, 2, 12, 95, 75]), 10 * U.rint(2, 40)];
      };

      const pctOf = () => {
        const [p, N] = pick(), ans = R(N * p / 100);
        return num(Math.random() < 0.5 ? `What is ${p}% of ${f(N)}?` : `Find ${p}% of ${f(N)}.`, ans, [pctNudge(p), pctStep(p, N)], pctExplain(p, N));
      };
      const moneyQ = () => {
        const [p, N] = pick(), save = R(N * p / 100);
        const item = U.pick(['jacket', 'bike', 'game', 'pair of trainers', 'tent']);
        if (level === 3 && p < 50 && Math.random() < 0.5) {
          const price = R(N - save);
          return num(`A ${item} costs ${cur}${f(N)}. In a sale, the price is cut by ${p}%. What is the sale price?`, price,
            [`First find ${p}% of ${f(N)}. Then take it away from ${f(N)}.`, pctStep(p, N)],
            `${pctExplain(p, N)} ${f(N)} − ${money(save)} = ${money(price)}, so the sale price is ${cur}${money(price)}.`, { prefix: cur });
        }
        return num(`A ${item} costs ${cur}${f(N)}. In a sale there is ${p}% off. How much money do you save?`, save, [pctNudge(p), pctStep(p, N)],
          `${pctExplain(p, N)} You save ${cur}${money(save)}.`, { prefix: cur });
      };
      const survey = () => {
        const p = U.pick(L(level, [10, 50, 25], [20, 30, 40, 60, 75], [15, 35, 45, 65, 12]));
        let N;
        do { N = 20 * U.rint(1, 30); } while ((N * p) % 100 !== 0);
        const ans = N * p / 100;
        return num(`There are ${N} children in a school. ${p}% of them walk to school. How many children walk to school?`, ans,
          [pctNudge(p), pctStep(p, N)], `${pctExplain(p, N)} So ${ans} children walk.`);
      };
      const mistakeChoice = () => {
        const [p, N] = level === 3 ? [U.pick([25, 75, 20, 30]), 20 * U.rint(2, 20)] : pick();
        const ans = R(N * p / 100);
        const choices = U.numChoices(ans, { extra: [N - p, R(N / 10), R(N / 2), R(ans * 10)], min: 0.01 });
        const nm = U.name();
        const wrong = N - p;
        if (wrong > 0 && wrong !== ans && Math.random() < 0.5) {
          return chq(`${nm} says ${p}% of ${f(N)} is ${f(wrong)}, because ${f(N)} − ${p} = ${f(wrong)}. What is the correct answer?`, f(ans),
            U.numChoices(ans, { extra: [wrong, R(N / 10), R(N / 2), R(ans * 10)], min: 0.01 }),
            [`${p}% does not mean "take away ${p}". It means ${p} out of every 100.`, pctStep(p, N)], pctExplain(p, N));
        }
        return chq(`Which is ${p}% of ${f(N)}?`, f(ans), choices, [pctNudge(p), pctStep(p, N)], pctExplain(p, N));
      };
      const missingPct = () => {
        const p = U.pick([10, 20, 25, 50, 75]);
        let N;
        do { N = 4 * U.rint(3, 50); } while ((N * p) % 100 !== 0);
        const ans = N * p / 100;
        return num(`□% of ${N} = ${ans}`, p, [`Write it as a fraction: ${ans} out of ${N}. Then make it out of 100.`, `${fr(ans, N)} = ${U.fracS(ans, N)}.`],
          `${fr(ans, N)} = ${U.fracS(ans, N)} = ${p}%.`, { unit: '%' });
      };
      const compare = () => {
        let p1, N1, p2, N2, a1, a2;
        do {
          p1 = U.pick([10, 20, 25, 30, 40, 50, 75]); N1 = 20 * U.rint(1, 10);
          p2 = U.pick([10, 20, 25, 30, 40, 50, 75]); N2 = 20 * U.rint(1, 10);
          a1 = N1 * p1 / 100; a2 = N2 * p2 / 100;
        } while (p1 === p2 || N1 === N2 || !Number.isInteger(a1) || !Number.isInteger(a2) || (a1 === a2 && Math.random() < 0.7));
        const s1 = `${p1}% of ${N1}`, s2 = `${p2}% of ${N2}`;
        const ans = a1 === a2 ? 'They are the same' : a1 > a2 ? s1 : s2;
        return chq(`Which is more: ${s1} or ${s2}?`, ans, U.shuffle([s1, s2, 'They are the same']),
          ['Work out both amounts, then compare them.', `${s1} = ${a1}.`],
          `${s1} = ${a1} and ${s2} = ${a2}. ${a1 === a2 ? 'They are the same.' : `${ans} is more.`}`);
      };

      return run(L(level,
        [pctOf, pctOf, moneyQ, survey, mistakeChoice],
        [pctOf, moneyQ, survey, mistakeChoice, missingPct],
        [pctOf, moneyQ, survey, missingPct, compare, mistakeChoice]));
    }
  });

  // ---------- 16. Ratio and proportion ----------
  PMLM.registerSkill({
    id: 'g6.ratio', grade: 6, unit: 'g6.u4', title: 'Ratio and proportion', icon: '⚖️',
    blurb: 'Share in a ratio and scale recipes up or down',
    lesson: [
      {
        title: 'What a ratio is',
        text: 'A **ratio** compares amounts.\nFor every 2 red beads there are 3 blue beads. The ratio of red to blue is **2 : 3**.\nThe order matters: blue to red is 3 : 2.',
        visual: { type: 'barModel', rows: [{ label: 'Red', parts: 2 }, { label: 'Blue', parts: 3 }] }
      },
      {
        title: 'Proportion: part of the whole',
        text: 'With 2 red and 3 blue, every group has 5 beads. So **{2/5}** of the beads are red.\nA ratio compares **part with part** (2 : 3).\nA proportion compares **part with whole** ({2/5}).',
        visual: { type: 'bag', items: [{ color: 'red', count: 2 }, { color: 'blue', count: 3 }] }
      },
      {
        title: 'Sharing in a ratio',
        text: 'Share 20 sweets in the ratio 2 : 3.\nThere are 2 + 3 = **5** parts. One part = 20 ÷ 5 = 4.\nSo one person gets 2 × 4 = **8** and the other gets 3 × 4 = **12**.',
        visual: { type: 'barModel', rows: [{ label: 'Ali', parts: 2 }, { label: 'Zara', parts: 3 }], total: 20 }
      },
      {
        title: 'Scaling a recipe',
        text: 'A recipe for 4 people uses 200 g of flour.\nFor 12 people (3 times as many) use 3 × 200 = **600 g**.\nIf the numbers are tricky, find the amount for **1** person first: 200 ÷ 4 = 50 g. For 6 people: 6 × 50 = **300 g**.'
      },
      {
        title: 'Worked example: share 35 in 3 : 4',
        text: '1. Add the parts: 3 + 4 = 7.\n2. One part: 35 ÷ 7 = 5.\n3. First share: 3 × 5 = **15**. Second share: 4 × 5 = **20**.\n4. Check: 15 + 20 = 35 ✓',
        visual: { type: 'barModel', rows: [{ label: 'Mia', parts: 3 }, { label: 'Leo', parts: 4 }], total: 35 }
      }
    ],
    gen(level) {
      const share = () => {
        let a, b;
        if (level === 1) { a = 1; b = U.rint(2, 4); if (Math.random() < 0.5) [a, b] = [b, a]; }
        else { do { a = U.rint(1, 7); b = U.rint(1, 7); } while (a === b || U.gcd(a, b) !== 1 || a + b > L(level, 10, 10, 12)); }
        const u = U.rint(2, L(level, 10, 12, 15)), total = (a + b) * u;
        const [n1, n2] = names2();
        const thing = U.pick(['stickers', 'sweets', 'marbles', 'cards']);
        if (level === 3 && Math.random() < 0.4) {
          return num(`${n1} and ${n2} share some ${thing} in the ratio ${a} : ${b}. ${n1} gets ${a * u}. How many does ${n2} get?`, b * u,
            [`${n1}'s ${a} part${pl(a)} ${a === 1 ? 'is' : 'are'} worth ${a * u}. Find what one part is worth.`, b === 1 ? `${n2} has 1 part, the same as one part of ${n1}'s share.` : a === 1 ? `One part is worth ${u}. ${n2} has ${b} parts.` : `One part = ${a * u} ÷ ${a} = ${u}.`],
            `One part = ${a * u} ÷ ${a} = ${u}. ${n2} gets ${b} × ${u} = ${b * u}.`,
            { visual: { type: 'barModel', rows: [{ label: n1, parts: a }, { label: n2, parts: b }] } });
        }
        const first = Math.random() < 0.5, who = first ? n1 : n2, k = first ? a : b;
        return num(`${n1} and ${n2} share ${total} ${thing} in the ratio ${a} : ${b}. How many does ${who} get?`, k * u,
          ['Add the parts of the ratio to find how many equal parts there are.', k === 1 ? `${a} + ${b} = ${a + b} parts. Share ${total} into ${a + b} equal parts.` : `${a} + ${b} = ${a + b} parts, so one part is ${total} ÷ ${a + b} = ${u}.`],
          `${a + b} parts. One part = ${total} ÷ ${a + b} = ${u}. ${who} gets ${k} × ${u} = ${k * u}.`,
          { visual: { type: 'barModel', rows: [{ label: n1, parts: a }, { label: n2, parts: b }], total } });
      };
      const findOther = () => {
        let a, b;
        do { a = U.rint(1, 5); b = U.rint(1, 6); } while (a === b || U.gcd(a, b) !== 1);
        const u = U.rint(2, L(level, 5, 9, 12));
        const story = `In a club, for every ${a} boy${pl(a)} there ${b === 1 ? 'is' : 'are'} ${b} girl${pl(b)}. There are ${a * u} boys.`;
        const bar = { type: 'barModel', rows: [{ label: 'Boys', parts: a }, { label: 'Girls', parts: b }] };
        if (level === 3 && Math.random() < 0.5) {
          return num(`${story} How many children are in the club altogether?`, (a + b) * u,
            [`How many groups of ${a} boy${pl(a)} are there?`, `${a * u} ÷ ${a} = ${u} groups. Each group has ${a} + ${b} = ${a + b} children.`],
            `There are ${u} groups of ${a + b} children: ${u} × ${a + b} = ${(a + b) * u} children.`, { visual: bar });
        }
        return num(`${story} How many girls are there?`, b * u,
          [`How many groups of ${a} boy${pl(a)} are there?`, b === 1 ? `Each group has 1 girl, so there is one girl for every group of ${a} boy${pl(a)}.` : `${a * u} ÷ ${a} = ${u} groups.`],
          `There are ${u} groups, and each group has ${b} girl${pl(b)}: ${u} × ${b} = ${b * u} girls.`, { visual: bar });
      };
      const recipe = () => {
        const [ing, unit] = U.pick([['flour', 'g'], ['sugar', 'g'], ['milk', 'ml'], ['rice', 'g'], ['butter', 'g']]);
        let p1, p2, per;
        if (level === 1) { p1 = U.pick([2, 3, 4, 5]); p2 = p1 * U.rint(2, 3); per = U.pick([20, 25, 30, 50, 100]); }
        else if (level === 2) { p1 = U.pick([2, 4, 6, 8]); p2 = U.pick(p1 > 2 ? [p1 / 2, p1 * 1.5, p1 * 2.5] : [3, 5]); per = U.pick([25, 30, 40, 50, 60]); }
        else { p1 = U.pick([3, 4, 5, 6, 8]); do { p2 = U.rint(2, 12); } while (p2 === p1 || p2 % p1 === 0); per = U.pick([15, 20, 25, 30, 35, 40, 45, 50, 60, 75]); }
        const amt = p1 * per, ans = p2 * per, k = p2 / p1;
        return num(`A recipe for ${p1} people uses ${amt} ${unit} of ${ing}. How much ${ing} is needed for ${p2} people?`, ans,
          level === 1 ? [`How many times bigger is ${p2} than ${p1}?`, `${p2} ÷ ${p1} = ${k}, so you need ${k} times as much ${ing}.`]
            : [`Find how much ${ing} is needed for 1 person first.`, `For 1 person: ${amt} ÷ ${p1} = ${per} ${unit}.`],
          level === 1 ? `${p2} people is ${k} times as many, so ${k} × ${amt} = ${ans} ${unit}.`
            : `1 person needs ${amt} ÷ ${p1} = ${per} ${unit}, so ${p2} people need ${p2} × ${per} = ${ans} ${unit}.`,
          { unit });
      };
      const proportion = mistakeMode => {
        let r, b;
        do { r = U.rint(1, 9); b = U.rint(1, 9); } while (r === b || r + b < 4 || (mistakeMode && (r > b || U.gcd(r, b) > 1)));
        const tot = r + b, ansStr = U.fracS(r, tot);
        const beads = `${r} red bead${pl(r)} and ${b} blue bead${pl(b)}`;
        const bag = { type: 'bag', items: [{ color: 'red', count: r }, { color: 'blue', count: b }] };
        if (mistakeMode) {
          const nm = U.name();
          return chq(`Beads are red and blue in the ratio ${r} : ${b}. ${nm} says ${fr(r, b)} of the beads are red. What fraction of the beads are really red?`, ansStr,
            byValue(ansStr, r / tot, [[fr(r, b), r / b], [U.fracS(b, tot), b / tot], [fr(1, 2), 0.5]]),
            ['A ratio compares part with part. A fraction of the beads compares the red part with the **whole**.', `For every ${r} red there ${b === 1 ? 'is' : 'are'} ${b} blue, so each group has ${r} + ${b} = ${tot} beads.`],
            `${r} out of every ${tot} beads are red, so the fraction is ${ansStr}. ${nm} compared red with blue instead of with all the beads.`, { visual: bag });
        }
        const hints = ['A fraction of the beads compares the red beads with **all** the beads.', `Altogether there are ${r} + ${b} = ${tot} beads.`];
        const explain = `${r} of the ${tot} beads are red, so the fraction is ${fr(r, tot)}${ansStr !== fr(r, tot) ? ' = ' + ansStr : ''}.`;
        if (Math.random() < 0.5) {
          return fracQ(`A bag has ${beads}. What fraction of the beads are red?`, r, tot, hints, explain, { visual: bag });
        }
        return chq(`A bag has ${beads}. What fraction of the beads are red?`, ansStr,
          byValue(ansStr, r / tot, [[fr(r, b), r / b], [U.fracS(b, tot), b / tot], [`${r} : ${b}`, -1]]), hints, explain, { visual: bag });
      };
      const simplifyR = () => {
        let a, b;
        do { a = U.rint(1, 6); b = U.rint(1, 9); } while (a === b || U.gcd(a, b) !== 1);
        const k = U.rint(2, L(level, 6, 6, 9)), A = a * k, B = b * k, p = smallestFactor(k);
        const ans = `${a} : ${b}`;
        const dists = [`${b} : ${a}`];
        if (p !== k) dists.push(`${A / p} : ${B / p}`);
        if (B - A + a > 0) dists.push(`${a} : ${B - A + a}`);
        dists.push(`${a} : ${B}`);
        return chq(`Write the ratio ${A} : ${B} in its simplest form.`, ans, pick4(ans, dists),
          ['Divide both numbers by the same number. Keep going until you can\'t any more.',
            p === k ? `${k} is a factor of both ${A} and ${B}.` : `Both divide by ${p}: ${A / p} : ${B / p}. Can you divide again?`],
          `${A} and ${B} both divide by ${k}: ${A} ÷ ${k} = ${a} and ${B} ÷ ${k} = ${b}. So ${A} : ${B} = ${a} : ${b}.`);
      };

      return run(L(level,
        [share, share, findOther, recipe, () => proportion(false)],
        [share, findOther, recipe, () => proportion(false), simplifyR, () => proportion(true)],
        [share, findOther, recipe, () => proportion(true), simplifyR]));
    }
  });

  // =====================================================================
  // Unit 5: Algebra and geometry
  // =====================================================================
  PMLM.registerUnit({ id: 'g6.u5', grade: 6, name: 'Algebra and geometry', icon: '📐' });

  // ---------- 17. Sequences and formulae ----------
  PMLM.registerSkill({
    id: 'g6.sequences', grade: 6, unit: 'g6.u5', title: 'Sequences and formulae', icon: '🔁',
    blurb: 'Continue sequences, find rules and use formulae',
    lesson: [
      {
        title: 'Term-to-term rules',
        text: 'A **sequence** is a list of numbers that follows a pattern. Each number is a **term**.\nThe **term-to-term rule** tells you how to get from one term to the next.\n5, 9, 13, 17 … The rule is **add 4**.',
        visual: { type: 'sequence', terms: ['5', '9', '13', '17', '?'], step: '+4' }
      },
      {
        title: 'Other kinds of rule',
        text: 'Sequences can go down: 30, 24, 18, 12 … (subtract 6).\nThey can go below zero: 7, 3, −1, −5 … (subtract 4).\nSome multiply: 2, 4, 8, 16 … (multiply by 2).\nAlways check the rule works for **every** pair of terms.',
        visual: { type: 'sequence', terms: ['30', '24', '18', '12'], step: '−6' }
      },
      {
        title: 'Position-to-term',
        text: 'To find the **10th** term without writing them all, look for the times table hiding inside.\n4, 8, 12, 16 … is the 4 times table, so the 10th term is 4 × 10 = 40.\n5, 9, 13, 17 … is **1 more** than the 4 times table, so the 10th term is 4 × 10 + 1 = **41**.',
        visual: { type: 'table', headers: ['Position', '1', '2', '3', '4', '10'], rows: [['4 × position', '4', '8', '12', '16', '40'], ['Term', '5', '9', '13', '17', '?']] }
      },
      {
        title: 'Formulae in words',
        text: 'A **formula** is a rule for working something out.\nA team gets 3 points for a win and 1 point for a draw:\nPoints = 3 × wins + draws.\n4 wins and 2 draws: 3 × 4 + 2 = 12 + 2 = **14** points.'
      },
      {
        title: 'Worked example: missing term',
        text: 'Find the missing term: 6, 11, □, 21, 26\n1. Find the rule: 11 − 6 = 5 and 26 − 21 = 5. The rule is **add 5**.\n2. Use it: 11 + 5 = **16**.\n3. Check: 16 + 5 = 21 ✓',
        visual: { type: 'sequence', terms: ['6', '11', '?', '21', '26'] }
      }
    ],
    gen(level, ctx) {
      const cur = ctx.currency;
      const ruleText = s => (s > 0 ? `add ${f(s)}` : `subtract ${f(-s)}`);
      const opText = s => `${s > 0 ? '+' : '−'} ${f(Math.abs(s))}`;
      const linear = () => {
        let start, step;
        if (level === 1) { start = U.rint(1, 20); step = U.rint(2, 10); }
        else if (level === 2) {
          if (Math.random() < 0.5) { start = U.rint(10, 50); step = U.rint(3, 12); }
          else { step = -U.rint(2, 9); start = U.rint(5, 40); }
        } else {
          const t = U.rint(0, 2);
          if (t === 0) {
            step = U.pick([0.5, 0.25, 1.5, 0.2, 0.3, -0.5, -0.2]);
            start = R((step * 100) % 10 ? U.rint(1, 20) * 0.25 : U.rint(1, 60) / 10);
            if (step < 0) start = R(start + 5);
          } else if (t === 1) { step = -U.rint(3, 9); start = U.rint(5, 25); }
          else { step = U.rint(6, 15); start = -U.rint(5, 30); }
        }
        return { terms: [0, 1, 2, 3, 4, 5].map(i => R(start + i * step)), step };
      };
      const seqVis = arr => ({ type: 'sequence', terms: arr });

      const next = () => {
        if (level === 3 && Math.random() < 0.25) {
          const dbl = Math.random() < 0.5;
          let terms;
          if (dbl) { const s = U.rint(1, 6); terms = [0, 1, 2, 3, 4].map(i => s * Math.pow(2, i)); }
          else { const s = U.pick([48, 64, 80, 96, 128, 160, 192]); terms = [0, 1, 2, 3, 4].map(i => s / Math.pow(2, i)); }
          const shown = terms.slice(0, 4), ans = terms[4];
          return num(`What is the next term?\n${shown.map(v => f(v)).join(', ')}, …`, ans,
            ['Find the rule. It might not be adding or subtracting!', `${shown[0]} → ${shown[1]} → ${shown[2]}: each term is ${dbl ? 'double' : 'half'} the one before.`],
            `The rule is ${dbl ? 'multiply by 2' : 'divide by 2'}. ${shown[3]} ${dbl ? '×' : '÷'} 2 = ${ans}.`, { visual: seqVis([...shown.map(String), '?']) });
        }
        const { terms, step } = linear();
        const shown = terms.slice(0, 4), ans = terms[4];
        return num(`What is the next term?\n${shown.map(v => f(v)).join(', ')}, …`, ans,
          ['Find the rule: how much does it change from one term to the next?', `From ${f(shown[0])} to ${f(shown[1])} is ${ruleText(step)}. Check that it works for the others too.`],
          `The rule is ${ruleText(step)}. ${f(shown[3])} ${opText(step)} = ${f(ans)}.`, { visual: seqVis([...shown.map(v => f(v)), '?']) });
      };
      const missing = () => {
        const { terms, step } = linear();
        const t5 = terms.slice(0, 5), miss = U.rint(1, 3), ans = t5[miss];
        const pi = miss === 1 ? 2 : 0;
        return num(`Find the missing term.\n${t5.map((t, i) => (i === miss ? '□' : f(t))).join(', ')}`, ans,
          ['Look at two terms that are next to each other to find the rule.', `From ${f(t5[pi])} to ${f(t5[pi + 1])} is ${ruleText(step)}.`],
          `The rule is ${ruleText(step)}. ${f(t5[miss - 1])} ${opText(step)} = ${f(ans)}.`, { visual: seqVis(t5.map((t, i) => (i === miss ? '?' : f(t)))) });
      };
      const rule = () => {
        const { terms, step } = linear();
        const shown = terms.slice(0, 4), ans = ruleText(step);
        const dbl = shown[0] > 0 && R(shown[1] / shown[0]) === 2;
        const near = step > 0 ? [R(step + 1), R(step - 1)] : [R(step - 1), R(step + 1)];
        const cands = [ruleText(-step), ...near.filter(s => s !== 0).map(ruleText)];
        if (dbl) cands.unshift('multiply by 2');
        const check = dbl ? `Check 'multiply by 2': ${f(shown[1])} × 2 = ${f(shown[1] * 2)}, but the next term is ${f(shown[2])}. So it is not that.`
          : `Check '${ruleText(-step)}': the terms are getting ${step > 0 ? 'bigger' : 'smaller'}, so it can't be that.`;
        return chq(`What is the term-to-term rule?\n${shown.map(v => f(v)).join(', ')}, …`, ans, pick4(ans, cands),
          ['Check that the rule works for **every** pair of terms, not just the first.', check],
          `Each term is ${f(Math.abs(step))} ${step > 0 ? 'more' : 'less'} than the one before, so the rule is ${ans}.`);
      };
      const posToTerm = () => {
        for (;;) {
          const a = U.rint(2, 9), c = U.rint(-5, 5), N = U.pick([10, 20, 50, 100]);
          const t = [1, 2, 3, 4].map(n => a * n + c);
          if (t[0] <= 0) continue;
          const ans = a * N + c, cs = c === 0 ? '' : ` ${signed(c)}`;
          return num(`The sequence ${t.join(', ')}, … continues. What is the ${U.ord(N)} term?`, ans,
            [`The terms go up by ${a} each time, so compare them with the ${a} times table.`, `1st term: ${a} × 1${cs} = ${t[0]}. 2nd term: ${a} × 2${cs} = ${t[1]}.`],
            `Each term is ${a} × position${cs}. The ${U.ord(N)} term is ${a} × ${N}${cs} = ${ans}.`,
            { visual: { type: 'table', headers: ['Position', '1', '2', '3', '4', String(N)], rows: [['Term', ...t.map(String), '?']] } });
        }
      };
      const posRule = () => {
        for (;;) {
          const a = U.rint(2, 9), c = U.rint(-4, 6);
          const t = [1, 2, 3, 4].map(n => a * n + c);
          if (t[0] <= 0 || a === c) continue;
          const fmtRule = (m, k) => `${m} × position${k === 0 ? '' : ' ' + signed(k)}`;
          const ans = fmtRule(a, c), trap = fmtRule(a, t[0]);
          return chq(`Which rule gives the terms of this sequence?\n${t.join(', ')}, …`, ans, pick4(ans, [trap, `position + ${a}`, fmtRule(t[0], a)]),
            ['Test each rule: put in position 1, 2, 3 and see if you get the terms.', `Test ${trap}: position 1 gives ${a} × 1 ${signed(t[0])} = ${a + t[0]}, but the 1st term is ${t[0]}.`],
            `Check ${ans}: position 1 gives ${t[0]}, position 2 gives ${t[1]}, position 3 gives ${t[2]} ✓`);
        }
      };
      const formula = () => {
        const t = U.rint(0, 3);
        const inverse = level === 3 && t !== 3 && Math.random() < 0.5;
        let base, per, n, text, ask, unitOpts, answerName, thing;
        if (t === 0) {
          base = U.pick([20, 30, 40, 50]); per = U.rint(3, 12); n = U.rint(5, 20);
          text = `Party cost in ${cur} = ${base} + ${per} × number of children`; thing = 'children';
          ask = `What is the cost for ${n} children?`; unitOpts = { prefix: cur }; answerName = 'cost';
        } else if (t === 1) {
          base = U.rint(2, 15); per = U.rint(2, 6); n = U.rint(3, 12);
          text = `Height of a plant in cm = ${base} + ${per} × number of weeks`; thing = 'weeks';
          ask = `How tall is the plant after ${n} weeks?`; unitOpts = { unit: 'cm' }; answerName = 'height';
        } else if (t === 2) {
          base = U.rint(2, 5); per = U.rint(2, 4); n = U.rint(3, 15);
          text = `Taxi fare in ${cur} = ${base} + ${per} × number of kilometres`; thing = 'kilometres';
          ask = `What is the fare for ${n} km?`; unitOpts = { prefix: cur }; answerName = 'fare';
        } else {
          const w = U.rint(2, 12), d = U.rint(1, 8);
          return num(`Points = 3 × wins + draws\nA team has ${w} wins and ${d} draws. How many points does it have?`, 3 * w + d,
            ['Put the numbers into the formula. Multiply before you add.', `3 × ${w} = ${3 * w}.`], `3 × ${w} + ${d} = ${3 * w} + ${d} = ${3 * w + d} points.`);
        }
        const total = base + per * n;
        if (inverse) {
          const q = t === 0 ? `A party cost ${cur}${total}. How many children came?` : t === 1 ? `After how many weeks is the plant ${total} cm tall?` : `A taxi fare was ${cur}${total}. How many kilometres was the trip?`;
          return num(`${text}\n${q}`, n, [`Work backwards: take away ${base} first, then divide by ${per}.`, `${total} − ${base} = ${total - base}.`],
            `${total} − ${base} = ${total - base}, and ${total - base} ÷ ${per} = ${n} ${thing}.`, t === 1 ? { unit: 'weeks' } : t === 2 ? { unit: 'km' } : {});
        }
        return num(`${text}\n${ask}`, total, ['Put the number into the formula. Remember: multiply before you add.', `${per} × ${n} = ${per * n}.`],
          `${base} + ${per} × ${n} = ${base} + ${per * n} = ${total}, so the ${answerName} is ${unitOpts.prefix || ''}${total}${unitOpts.unit ? ' ' + unitOpts.unit : ''}.`, unitOpts);
      };

      return run(L(level,
        [next, next, missing, rule, formula],
        [next, missing, rule, formula, formula],
        [next, missing, posToTerm, posRule, formula, rule]));
    }
  });

  // ---------- 18. Angles ----------
  PMLM.registerSkill({
    id: 'g6.angles', grade: 6, unit: 'g6.u5', title: 'Angles', icon: '📐',
    blurb: 'Angles in a triangle, on a line and round a point',
    lesson: [
      {
        title: 'Angles on a straight line',
        text: 'Angles on a straight line add up to **180°**.\nIf one angle is 130°, the other is 180° − 130° = **50°**.',
        visual: { type: 'angle', mode: 'line', parts: [130, 50], labels: ['130°', '50°'] }
      },
      {
        title: 'Angles around a point',
        text: 'A full turn is **360°**. Angles around a point add up to **360°**.\n120° + 150° + 90° = 360°',
        visual: { type: 'angle', mode: 'point', parts: [120, 150, 90], labels: ['120°', '150°', '90°'] }
      },
      {
        title: 'Angles in a triangle',
        text: 'The three angles inside **any** triangle add up to **180°**.\n60° + 70° + 50° = 180°\nTry it: tear the corners off a paper triangle. They fit together to make a straight line!',
        visual: { type: 'angle', mode: 'triangle', parts: [60, 70, 50], labels: ['60°', '70°', '50°'] }
      },
      {
        title: 'Tip: add, then subtract',
        text: 'To find a missing angle, **add** the angles you know, then **take** that away from 180° or 360°.\nA right angle is 90°. Check your answer looks the right size: acute is less than 90°, obtuse is between 90° and 180°.',
        visual: { type: 'angle', mode: 'single', parts: [90], labels: ['90°'] }
      },
      {
        title: 'Worked example: triangle',
        text: 'A triangle has angles 48°, 75° and x. Find x.\n1. Add the angles you know: 48° + 75° = 123°.\n2. Take it from 180°: 180° − 123° = 57°.\n3. So **x = 57°**.\n4. Check: 48 + 75 + 57 = 180 ✓',
        visual: { type: 'angle', mode: 'triangle', parts: [48, 75, 57], labels: ['48°', '75°', 'x'] }
      }
    ],
    gen(level) {
      const deg = v => `${v}°`;
      const rnd = (a, b) => (level === 3 ? U.rint(a, b) : 5 * U.rint(Math.ceil(a / 5), Math.floor(b / 5)));
      const sumOf = a => a.reduce((s, v) => s + v, 0);
      // parts in a random order, with the unknown labelled x
      const arrange = (known, xs) => {
        const items = U.shuffle([...known.map(v => [v, deg(v)]), ...xs.map(v => [v, 'x'])]);
        return { parts: items.map(i => i[0]), labels: items.map(i => i[1]) };
      };
      const ang = (mode, known, xs) => Object.assign({ type: 'angle', mode }, arrange(known, xs));

      const line = () => {
        if (level === 1 || Math.random() < 0.4) {
          const a = rnd(25, 155), x = 180 - a;
          return num('The angles are on a straight line. Find angle **x**.', x,
            ['Angles on a straight line add up to 180°.', `x + ${a}° = 180°. What do you add to ${a} to make 180?`],
            `180° − ${a}° = ${x}°.`, { unit: '°', visual: ang('line', [a], [x]) });
        }
        let a, b, x;
        do { a = rnd(20, 120); b = rnd(20, 120); x = 180 - a - b; } while (x < 20);
        return num('The angles are on a straight line. Find angle **x**.', x,
          ['Angles on a straight line add up to 180°.', `Add the angles you know: ${a}° + ${b}° = ${a + b}°.`],
          `${a}° + ${b}° = ${a + b}°. 180° − ${a + b}° = ${x}°.`, { unit: '°', visual: ang('line', [a, b], [x]) });
      };
      const lineXX = () => {
        const a = 2 * U.rint(15, 70), x = (180 - a) / 2;
        return num('The angles are on a straight line. The two angles marked x are equal. Find x.', x,
          ['Angles on a straight line add up to 180°.', `180° − ${a}° = ${180 - a}°. The two x angles share this equally.`],
          `180° − ${a}° = ${180 - a}°, and ${180 - a}° ÷ 2 = ${x}°.`, { unit: '°', visual: ang('line', [a], [x, x]) });
      };
      const point = () => {
        let known;
        if (level === 1) known = [90, rnd(40, 200)];
        else if (level === 2) { do { known = [rnd(40, 160), rnd(40, 160)]; } while (360 - sumOf(known) < 40); }
        else { do { known = [rnd(40, 120), rnd(40, 120), rnd(30, 120)]; } while (360 - sumOf(known) < 30); }
        const s = sumOf(known), x = 360 - s;
        return num('The angles are around a point. Find angle **x**.', x,
          ['Angles around a point add up to 360°.', `Add the angles you know: ${known.map(deg).join(' + ')} = ${s}°.`],
          `${known.map(deg).join(' + ')} = ${s}°. 360° − ${s}° = ${x}°.`, { unit: '°', visual: ang('point', known, [x]) });
      };
      const triangle = () => {
        let a, b, x;
        if (level === 1) { a = 90; b = rnd(20, 70); x = 90 - b; }
        else { do { a = rnd(25, 110); b = rnd(25, 110); x = 180 - a - b; } while (x < 20); }
        return num('Find angle **x** in this triangle.', x,
          ['The angles in a triangle add up to 180°.', `Add the angles you know: ${a}° + ${b}° = ${a + b}°.`],
          `${a}° + ${b}° = ${a + b}°. 180° − ${a + b}° = ${x}°.`, { unit: '°', visual: ang('triangle', [a, b], [x]) });
      };
      const iso = () => {
        if (Math.random() < 0.5) {
          const t = 2 * U.rint(10, 70), x = (180 - t) / 2;
          return num('This triangle is isosceles: the two angles marked x are equal. Find x.', x,
            ['The angles in a triangle add up to 180°, and the two x angles are equal.', `180° − ${t}° = ${180 - t}°. The two x angles share this equally.`],
            `180° − ${t}° = ${180 - t}°, and ${180 - t}° ÷ 2 = ${x}°.`, { unit: '°', visual: { type: 'angle', mode: 'triangle', parts: [x, x, t], labels: ['x', 'x', deg(t)] } });
        }
        const b = U.rint(25, 80), x = 180 - 2 * b;
        return num('This triangle is isosceles: its two base angles are equal. Find angle x.', x,
          ['The angles in a triangle add up to 180°.', `The two equal angles: ${b}° + ${b}° = ${2 * b}°.`],
          `${b}° + ${b}° = ${2 * b}°. 180° − ${2 * b}° = ${x}°.`, { unit: '°', visual: { type: 'angle', mode: 'triangle', parts: [b, b, x], labels: [deg(b), deg(b), 'x'] } });
      };
      const possible = () => {
        const mk = s => {
          for (;;) {
            const a = rnd(20, 120), b = rnd(20, 120), c = s - a - b;
            if (c >= 20 && c <= 150) return [a, b, c];
          }
        };
        const show = t => t.map(deg).join(', ');
        const right = mk(180), wrongs = U.sample([160, 170, 190, 200], 3).map(mk);
        return chq('Which set of angles could be the three angles of a triangle?', show(right), U.shuffle([right, ...wrongs].map(show)),
          ['The three angles of a triangle must add up to exactly 180°.', `Check ${show(wrongs[0])}: ${wrongs[0].join(' + ')} = ${sumOf(wrongs[0])}°, so that one is not possible.`],
          `${right.join(' + ')} = 180°, so ${show(right)} works. The other sets do not add up to 180°.`);
      };
      const slices = () => {
        const n = U.pick(L(level, [3, 4, 6], [3, 4, 5, 6, 8, 10], [5, 8, 9, 10, 12]));
        const a = 360 / n, ex = n === 4 ? 6 : 4;
        return num(`A round cake is cut into ${n} equal slices from the centre. What is the angle at the centre of each slice?`, a,
          ['A full turn around the centre is 360°. The slices share it equally.', `For example, ${ex} equal slices would each be 360° ÷ ${ex} = ${360 / ex}°. Now do it for ${n} slices.`],
          `360° ÷ ${n} = ${a}°.`, { unit: '°', visual: { type: 'angle', mode: 'point', parts: Array(n).fill(a), labels: Array(n).fill('x') } });
      };

      return run(L(level,
        [line, line, point, triangle, slices],
        [line, point, triangle, iso, possible, slices],
        [line, lineXX, point, iso, triangle, possible]));
    }
  });

  // ---------- 19. Area and perimeter ----------
  PMLM.registerSkill({
    id: 'g6.area', grade: 6, unit: 'g6.u5', title: 'Area and perimeter', icon: '📏',
    blurb: 'Rectangles, L-shapes and triangles',
    lesson: [
      {
        title: 'Perimeter: the distance around',
        text: '**Perimeter** is the total distance **around** the edge. Add up all the sides.\nRectangle 6 cm by 4 cm: 6 + 4 + 6 + 4 = **20 cm**.',
        visual: { type: 'shape2d', shape: 'rectangle', dims: { base: '6 cm', height: '4 cm' } }
      },
      {
        title: 'Area: the space inside',
        text: '**Area** is how many **squares** fit inside.\nFor a rectangle: **area = length × width**.\n6 cm × 4 cm = **24 cm²**. Area is measured in square units, like cm² and m².',
        visual: { type: 'array', rows: 4, cols: 6 }
      },
      {
        title: 'L-shapes',
        text: 'Split the shape into **two rectangles**, find each area and **add**.\nOr find the big rectangle and **take away** the missing corner:\n8 × 6 − 3 × 2 = 48 − 6 = **42 m²**.',
        visual: { type: 'shape2d', shape: 'L', dims: { w: '8 m', h: '6 m', a: '3 m', b: '2 m' } }
      },
      {
        title: 'Area of a triangle',
        text: 'A triangle is **half** of a rectangle.\n**Area = base × height ÷ 2**\nBase 8 cm, height 5 cm: 8 × 5 = 40, and 40 ÷ 2 = **20 cm²**.\nThe height must be at right angles to the base.',
        visual: { type: 'shape2d', shape: 'triangle', dims: { base: '8 cm', height: '5 cm' } }
      },
      {
        title: 'Worked example: an L-shape',
        text: 'A 10 cm by 7 cm rectangle has a 4 cm by 3 cm corner cut out. Find the area.\n1. Big rectangle: 10 × 7 = 70 cm².\n2. Missing corner: 4 × 3 = 12 cm².\n3. Area = 70 − 12 = **58 cm²**.',
        visual: { type: 'shape2d', shape: 'L', dims: { w: '10 cm', h: '7 cm', a: '4 cm', b: '3 cm' } }
      }
    ],
    gen(level) {
      const u = () => U.pick(['cm', 'm']);
      const dims = () => {
        let l, w;
        do {
          l = U.rint(...L(level, [2, 10], [4, 15], [5, 20]));
          w = U.rint(...L(level, [2, 9], [3, 12], [3, 12]));
        } while (l === w || l * w === 2 * (l + w));
        return [Math.max(l, w), Math.min(l, w)];
      };
      const rectVis = (l, w, un, hideW) => ({ type: 'shape2d', shape: 'rectangle', dims: { base: `${l} ${un}`, height: hideW ? '?' : `${w} ${un}` } });
      const lShape = () => {
        const w = U.rint(6, 14), h = U.rint(5, 12);
        return { w, h, a: U.rint(2, w - 3), b: U.rint(2, h - 3) };
      };
      const lVis = (s, un) => ({ type: 'shape2d', shape: 'L', dims: { w: `${s.w} ${un}`, h: `${s.h} ${un}`, a: `${s.a} ${un}`, b: `${s.b} ${un}` } });

      const rectArea = () => {
        const un = u();
        if (level === 3 && Math.random() < 0.5) {
          const li = nonTen(15, 99), l = R(li / 10), w = U.rint(2, 9), A = R(li * w / 10);
          return num('Find the area of this rectangle.', A, ['Area of a rectangle = length × width.', `${f(l)} × ${w}: first do ${li} × ${w} = ${li * w}, then put the decimal point back.`],
            `${f(l)} × ${w} = ${f(A)} ${un}².`, { unit: `${un}²`, visual: l >= w ? rectVis(f(l), w, un) : rectVis(w, f(l), un) });
        }
        const [l, w] = dims();
        return num('Find the area of this rectangle.', l * w,
          ['Area of a rectangle = length × width.', level === 1 ? `Think of ${w} rows with ${l} squares in each row: ${w} × ${l}.` : `Area = ${w} × ${l}. ${mulStep(w, l)}`],
          `${l} × ${w} = ${l * w} ${un}².`, { unit: `${un}²`, visual: rectVis(l, w, un) });
      };
      const rectPerim = () => {
        const un = u(), [l, w] = dims();
        return num('Find the perimeter of this rectangle.', 2 * (l + w),
          ['Perimeter is the distance all the way round. Add all four sides.', `${l} + ${w} = ${l + w}. That is only half of the way round.`],
          `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} ${un}.`, { unit: un, visual: rectVis(l, w, un) });
      };
      const missingSide = () => {
        const un = u(), [l, w] = dims();
        if (level === 1 || Math.random() < 0.6) {
          return num(`This rectangle has an area of ${l * w} ${un}². Its length is ${l} ${un}. What is its width?`, w,
            ['Area = length × width, so width = area ÷ length.', `Count up in ${l}s until you reach ${l * w}: ${l}, ${2 * l} …`],
            `${l * w} ÷ ${l} = ${w}, so the width is ${w} ${un}.`, { unit: un, visual: rectVis(l, w, un, true) });
        }
        const P = 2 * (l + w);
        return num(`This rectangle has a perimeter of ${P} ${un}. Its length is ${l} ${un}. What is its width?`, w,
          ['The perimeter is two lengths and two widths added together.', `Half the perimeter is ${P / 2} ${un}. That is one length plus one width.`],
          `${P} ÷ 2 = ${P / 2}, and ${P / 2} − ${l} = ${w}, so the width is ${w} ${un}.`, { unit: un, visual: rectVis(l, w, un, true) });
      };
      const lArea = () => {
        const un = u(), s = lShape(), big = s.w * s.h, cut = s.a * s.b, A = big - cut;
        return num('Find the area of this L-shape.', A,
          ['Find the big rectangle, then take away the missing corner. (Or split it into two rectangles.)', `Big rectangle: ${s.w} × ${s.h} = ${big} ${un}².`],
          `Big rectangle: ${s.w} × ${s.h} = ${big}. Missing corner: ${s.a} × ${s.b} = ${cut}. Area = ${big} − ${cut} = ${A} ${un}².`,
          { unit: `${un}²`, visual: lVis(s, un) });
      };
      const lPerim = () => {
        const un = u(), s = lShape(), P = 2 * (s.w + s.h);
        return num('Find the perimeter of this L-shape.', P,
          ['Add up all six sides. First work out the two sides that have no label.', `The sides with no label are ${s.w} − ${s.a} = ${s.w - s.a} ${un} and ${s.h} − ${s.b} = ${s.h - s.b} ${un}.`],
          `${s.w} + ${s.h} + ${s.w - s.a} + ${s.b} + ${s.a} + ${s.h - s.b} = ${P} ${un}.`, { unit: un, visual: lVis(s, un) });
      };
      const triArea = () => {
        const un = u();
        let b, h;
        do { b = U.rint(4, 16); h = U.rint(3, 12); } while (level === 2 && (b * h) % 2 !== 0);
        const A = R(b * h / 2);
        return num('Find the area of this triangle.', A, ['Area of a triangle = base × height ÷ 2.', `${b} × ${h} = ${b * h}.`],
          `${b} × ${h} = ${b * h}, and ${b * h} ÷ 2 = ${f(A)} ${un}².`,
          { unit: `${un}²`, visual: { type: 'shape2d', shape: U.pick(['triangle', 'rightTriangle']), dims: { base: `${b} ${un}`, height: `${h} ${un}` } } });
      };
      const confuse = () => {
        const un = u();
        if (level > 1 && Math.random() < 0.35) {
          let b, h;
          do { b = U.rint(4, 14); h = U.rint(3, 12); } while ((b * h) % 2 !== 0 || b === h);
          const A = b * h / 2;
          return chq(`What is the area of this triangle, in ${un}²?`, String(A), U.numChoices(A, { extra: [b * h, b + h, 2 * (b + h)], min: 1 }),
            ['Area of a triangle = base × height ÷ 2.', `${b} × ${h} = ${b * h}. Don't forget the last step!`],
            `${b} × ${h} ÷ 2 = ${b * h} ÷ 2 = ${A} ${un}². (${b * h} forgets to halve.)`,
            { visual: { type: 'shape2d', shape: 'triangle', dims: { base: `${b} ${un}`, height: `${h} ${un}` } } });
        }
        const [l, w] = dims(), area = l * w, per = 2 * (l + w);
        if (Math.random() < 0.5) {
          return chq(`What is the **perimeter** of this rectangle, in ${un}?`, String(per), U.numChoices(per, { extra: [area, l + w, 2 * l + w], min: 1 }),
            ['Perimeter is the distance all the way round: add all four sides.', `${l} + ${w} = ${l + w}. That is only half of the way round.`],
            `${l} + ${w} + ${l} + ${w} = ${per} ${un}. (${area} is the area, not the perimeter.)`, { visual: rectVis(l, w, un) });
        }
        return chq(`What is the **area** of this rectangle, in ${un}²?`, String(area), U.numChoices(area, { extra: [per, l + w, area * 2], min: 1 }),
          ['Area is the space inside: length × width.', `Area = ${w} × ${l}. ${mulStep(w, l)}`],
          `${l} × ${w} = ${area} ${un}². (${per} is the perimeter, not the area.)`, { visual: rectVis(l, w, un) });
      };
      const word = () => {
        const t = U.rint(0, L(level, 1, 1, 2));
        if (t === 0) {
          let l, w;
          do { l = U.rint(...L(level, [5, 20], [12, 40], [15, 60])); w = U.rint(...L(level, [3, 12], [8, 30], [10, 40])); } while (l === w);
          return num(`A field is ${l} m long and ${w} m wide. How much fencing is needed to go all the way round it?`, 2 * (l + w),
            ['"All the way round" means the perimeter: add all four sides.', `${l} + ${w} = ${l + w} m. That is only half of the way round.`],
            `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} m of fencing.`, { unit: 'm' });
        }
        if (t === 1) {
          const [l, w] = dims();
          return num(`A floor is ${l} m long and ${w} m wide. How many 1 m² tiles are needed to cover it?`, l * w,
            ['Covering the floor means finding the area: length × width.', `Area = ${w} × ${l}. ${mulStep(w, l)}`], `${l} × ${w} = ${l * w} m², so ${l * w} tiles.`);
        }
        const s = U.rint(3, 12);
        return num(`A square has a perimeter of ${4 * s} cm. What is its area?`, s * s,
          ['A square has 4 equal sides. Find the length of one side first.', `One side = ${4 * s} ÷ 4 = ${s} cm.`],
          `One side is ${s} cm, so the area is ${s} × ${s} = ${s * s} cm².`, { unit: 'cm²' });
      };

      return run(L(level,
        [rectArea, rectPerim, confuse, word, missingSide],
        [rectArea, rectPerim, missingSide, lArea, triArea, confuse, word],
        [rectArea, lArea, lPerim, triArea, missingSide, confuse, word]));
    }
  });

  // ---------- 20. Coordinates ----------
  PMLM.registerSkill({
    id: 'g6.coords', grade: 6, unit: 'g6.u5', title: 'Coordinates', icon: '📍',
    blurb: 'Read, plot and move points in all four quadrants',
    lesson: [
      {
        title: 'Along, then up',
        text: 'Coordinates (x, y) tell you where a point is.\nFirst go **along** the x-axis, then **up or down** the y-axis.\nTip: "along the corridor, then up the stairs". A is at (3, 2).',
        visual: { type: 'grid', xmin: 0, xmax: 6, ymin: 0, ymax: 6, points: [{ x: 3, y: 2, label: 'A' }] }
      },
      {
        title: 'Negative coordinates',
        text: 'Left of 0, the x-numbers are negative. Below 0, the y-numbers are negative.\nB(−4, 1): go 4 **left**, then 1 **up**.\nC(2, −3): go 2 **right**, then 3 **down**.',
        visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, points: [{ x: -4, y: 1, label: 'B' }, { x: 2, y: -3, label: 'C' }] }
      },
      {
        title: 'The four quadrants',
        text: 'The axes split the grid into **four quadrants**.\nTop right: (+, +). Top left: (−, +).\nBottom left: (−, −). Bottom right: (+, −).',
        visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, points: [{ x: 2, y: 3, label: '(2, 3)' }, { x: -2, y: 3, label: '(−2, 3)' }, { x: -2, y: -3, label: '(−2, −3)' }, { x: 2, y: -3, label: '(2, −3)' }] }
      },
      {
        title: 'Translating and reflecting',
        text: '**Translate** means slide. 3 right and 2 down: add 3 to x, take 2 from y. (1, 4) → (4, 2).\n**Reflect** in the y-axis: the x-number changes sign. (3, 2) → (−3, 2).\nReflect in the x-axis: the y-number changes sign. (3, 2) → (3, −2).',
        visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, polygons: [{ pts: [[1, 1], [4, 1], [1, 3]], label: 'A' }, { pts: [[-1, 1], [-4, 1], [-1, 3]], label: 'B', ghost: true }] }
      },
      {
        title: 'Worked example: missing corner',
        text: 'A rectangle has corners at (−2, 1), (3, 1) and (3, −3). Find the fourth corner.\n1. Plot the three points.\n2. The missing corner is straight below (−2, 1), so its x-number is −2.\n3. It is level with (3, −3), so its y-number is −3.\n4. The fourth corner is **(−2, −3)**.',
        visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5, points: [{ x: -2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: -3 }], segments: [{ x1: -2, y1: 1, x2: 3, y2: 1 }, { x1: 3, y1: 1, x2: 3, y2: -3 }] }
      }
    ],
    gen(level) {
      const c = (x, y) => `(${f(x)}, ${f(y)})`;
      const G = level === 1 ? { xmin: 0, xmax: 8, ymin: 0, ymax: 8 } : { xmin: -5, xmax: 5, ymin: -5, ymax: 5 };
      const grid = extra => Object.assign({ type: 'grid' }, G, extra);
      const rp = nonzero => {
        const lo = level === 1 ? 1 : -5, hi = level === 1 ? 7 : 5;
        let x, y;
        do { x = U.rint(lo, hi); y = U.rint(lo, hi); } while (nonzero && (x === 0 || y === 0));
        return [x, y];
      };
      const xMove = x => (x === 0 ? 'stay at 0 on the x-axis' : `go ${Math.abs(x)} ${x < 0 ? 'left' : 'right'}`);
      const yMove = y => (y === 0 ? 'stay level with the x-axis' : `go ${Math.abs(y)} ${y < 0 ? 'down' : 'up'}`);

      const read = () => {
        let x, y;
        do { [x, y] = rp(!(level === 3 && Math.random() < 0.3)); } while (level === 2 && x > 0 && y > 0 && Math.random() < 0.7);
        return coordQ('What are the coordinates of point **P**?', x, y,
          ['Go along the x-axis first, then up or down the y-axis.',
            x === 0 ? 'P is on the y-axis, so its x-number is 0.' : `P is ${Math.abs(x)} to the ${x < 0 ? 'left' : 'right'} of 0, so its x-number is ${f(x)}.`],
          `From 0, ${xMove(x)}, then ${yMove(y)}. P is at ${c(x, y)}.`, { visual: grid({ points: [{ x, y, label: 'P' }] }) });
      };
      const whichPoint = () => {
        let x, y, pts;
        if (level === 1) {
          do { [x, y] = rp(true); } while (x === y || x > 6 || y > 6);
          pts = [[x, y], [y, x], [x + 1, y], [x, y + 1]];
        } else {
          do { [x, y] = rp(true); } while (Math.abs(x) === Math.abs(y));
          pts = [[x, y], [y, x], [-x, y], [x, -y]];
        }
        const labels = U.shuffle(['A', 'B', 'C', 'D']);
        const points = pts.map((p, i) => ({ x: p[0], y: p[1], label: labels[i] }));
        const sameX = points.filter(p => p.x === x).map(p => p.label).sort();
        return chq(`Which point is at ${c(x, y)}?`, labels[0], ['A', 'B', 'C', 'D'],
          ['The first number tells you how far along (x). The second tells you how far up or down (y).', `Along first: ${xMove(x)} from 0. Points ${sameX.join(' and ')} are there.`],
          `From 0, ${xMove(x)}, then ${yMove(y)}: that is point ${labels[0]}. Point ${labels[1]} is at ${c(y, x)}: the numbers are the wrong way round.`,
          { visual: grid({ points }) });
      };
      const translate = () => {
        const steps = [-4, -3, -2, -1, 1, 2, 3, 4];
        for (;;) {
          const [x, y] = rp(level === 1);
          let dx = 0, dy = 0;
          if (level < 3 && Math.random() < 0.5) { if (Math.random() < 0.5) dx = U.pick(steps); else dy = U.pick(steps); }
          else { dx = U.pick(steps); dy = U.pick(steps); }
          const nx = x + dx, ny = y + dy;
          if (nx < G.xmin || nx > G.xmax || ny < G.ymin || ny > G.ymax) continue;
          const parts = [];
          if (dx) parts.push(`${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}`);
          if (dy) parts.push(`${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}`);
          const hint2 = dx && dy ? `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}: the x-number becomes ${f(x)} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${f(nx)}.`
            : dx ? `Only the x-number changes. The y-number stays ${f(y)}.` : `Only the y-number changes. The x-number stays ${f(x)}.`;
          return coordQ(`Point A is at ${c(x, y)}. It is translated ${parts.join(' and ')}. Where is it now?`, nx, ny,
            ['Moving right or left changes the x-number. Moving up or down changes the y-number.', hint2],
            `${dx ? `x: ${f(x)} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${f(nx)}.` : `x stays ${f(x)}.`} ${dy ? `y: ${f(y)} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)} = ${f(ny)}.` : `y stays ${f(y)}.`} A is now at ${c(nx, ny)}.`,
            { visual: grid({ points: [{ x, y, label: 'A' }] }) });
        }
      };
      const reflect = () => {
        const [x, y] = rp(true);
        const yAxis = Math.random() < 0.6;
        const [nx, ny] = yAxis ? [-x, y] : [x, -y];
        const d = yAxis ? Math.abs(x) : Math.abs(y);
        const hint2 = yAxis
          ? `P is ${d} square${pl(d)} to the ${x > 0 ? 'right' : 'left'} of the y-axis, so its reflection is ${d} square${pl(d)} to the ${x > 0 ? 'left' : 'right'}.`
          : `P is ${d} square${pl(d)} ${y > 0 ? 'above' : 'below'} the x-axis, so its reflection is ${d} square${pl(d)} ${y > 0 ? 'below' : 'above'} it.`;
        return coordQ(`Point P${c(x, y)} is reflected in the **${yAxis ? 'y-axis' : 'x-axis'}**. Where does it end up?`, nx, ny,
          ['A reflection is the same distance from the mirror line, but on the other side.', hint2],
          `${yAxis ? 'The x-number changes sign and the y-number stays the same' : 'The y-number changes sign and the x-number stays the same'}: ${c(x, y)} → ${c(nx, ny)}.`,
          { visual: grid({ points: [{ x, y, label: 'P' }] }) });
      };
      const missingCorner = () => {
        let x1, x2, y1, y2;
        do { x1 = U.rint(-5, 3); x2 = U.rint(x1 + 2, 5); y1 = U.rint(-5, 3); y2 = U.rint(y1 + 2, 5); } while (x1 >= 0 && y1 >= 0);
        const corners = [[x1, y2], [x2, y2], [x2, y1], [x1, y1]];
        const m = U.rint(0, 3);
        const D = corners[m], A = corners[(m + 1) % 4], B = corners[(m + 2) % 4], C = corners[(m + 3) % 4];
        const [nbX, nbXName, nbY, nbYName] = A[0] === D[0] ? [A, 'A', C, 'C'] : [C, 'C', A, 'A'];
        return coordQ('A, B and C are three corners of a rectangle. What are the coordinates of the fourth corner, D?', D[0], D[1],
          ['The sides of this rectangle go straight across and straight up and down.', `D is directly ${D[1] > nbX[1] ? 'above' : 'below'} ${nbXName}, so it has the same x-number: ${f(D[0])}.`],
          `D has the same x-number as ${nbXName} (${f(D[0])}) and the same y-number as ${nbYName} (${f(nbY[1])}). So D is at ${c(D[0], D[1])}.`,
          { visual: grid({ points: [{ x: A[0], y: A[1], label: 'A' }, { x: B[0], y: B[1], label: 'B' }, { x: C[0], y: C[1], label: 'C' }], segments: [{ x1: A[0], y1: A[1], x2: B[0], y2: B[1] }, { x1: B[0], y1: B[1], x2: C[0], y2: C[1] }] }) });
      };
      const quadrant = () => {
        let x, y;
        do { x = U.rint(-5, 5); y = U.rint(-5, 5); } while (x === 0 || y === 0 || (x > 0 && y > 0 && Math.random() < 0.6));
        const name = x > 0 ? (y > 0 ? 'top right' : 'bottom right') : (y > 0 ? 'top left' : 'bottom left');
        return chq(`In which quadrant is the point ${c(x, y)}?`, name, ['top left', 'top right', 'bottom left', 'bottom right'],
          ['A negative x-number means left of the y-axis. A negative y-number means below the x-axis.', `x = ${f(x)}, so the point is on the ${x < 0 ? 'left' : 'right'}.`],
          `x = ${f(x)} means ${x < 0 ? 'left' : 'right'} and y = ${f(y)} means ${y < 0 ? 'down' : 'up'}, so the point is in the ${name} quadrant.`,
          { visual: { type: 'grid', xmin: -5, xmax: 5, ymin: -5, ymax: 5 } });
      };

      return run(L(level,
        [read, read, whichPoint, translate],
        [read, whichPoint, translate, reflect, missingCorner, quadrant],
        [read, whichPoint, translate, reflect, missingCorner]));
    }
  });

  // =====================================================================
  // Unit 6: Data and probability
  // =====================================================================
  PMLM.registerUnit({ id: 'g6.u6', grade: 6, name: 'Data and probability', icon: '📊' });

  const total = a => a.reduce((s, v) => s + v, 0);

  // ---------- 21. Mean, median, mode and range ----------
  PMLM.registerSkill({
    id: 'g6.averages', grade: 6, unit: 'g6.u6', title: 'Mean, median, mode, range', icon: '📊',
    blurb: 'Find the averages and the range of a set of data',
    lesson: [
      {
        title: 'Mode and range',
        text: '**Mode**: the value that appears **most often**.\n**Range**: biggest − smallest. It shows how **spread out** the data is.\nFor 3, 5, 5, 8, 9: the mode is 5 and the range is 9 − 3 = 6.'
      },
      {
        title: 'Median: the middle',
        text: 'Put the numbers **in order**, then find the **middle** one.\n7, 2, 9, 4, 6 → 2, 4, **6**, 7, 9. The median is 6.\nIf there are two middle numbers, the median is **halfway** between them: 2, 4, 6, 8 → the median is 5.'
      },
      {
        title: 'Mean: share it out',
        text: '**Add** all the values, then **divide** by how many there are.\n4, 6, 8, 2: 4 + 6 + 8 + 2 = 20, and 20 ÷ 4 = **5**.\nThe mean is what each would get if the total were shared out equally.',
        visual: { type: 'barChart', bars: [{ label: 'A', value: 4 }, { label: 'B', value: 6 }, { label: 'C', value: 8 }, { label: 'D', value: 2 }], step: 1 }
      },
      {
        title: 'Don\'t mix them up!',
        text: '**Mo**de = the **mo**st common.\n**Med**ian = the **m**iddle (put them in order first!).\n**Mean** = add up, then share.\n**Range** = biggest − smallest. It tells you the spread, not an average.'
      },
      {
        title: 'Worked example: the mean',
        text: 'Goals in 5 matches: 3, 1, 4, 0, 2.\n1. Add: 3 + 1 + 4 + 0 + 2 = 10.\n2. There are 5 matches.\n3. Mean = 10 ÷ 5 = **2 goals**.',
        visual: { type: 'barChart', bars: [{ label: '1', value: 3 }, { label: '2', value: 1 }, { label: '3', value: 4 }, { label: '4', value: 0 }, { label: '5', value: 2 }], step: 1, title: 'Goals in each match' }
      }
    ],
    gen(level) {
      const list = (n, lo, hi) => Array.from({ length: n }, () => U.rint(lo, hi));
      const sorted = a => a.slice().sort((x, y) => x - y);
      const median = a => {
        const s = sorted(a), n = s.length;
        return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
      };
      const show = a => a.map(v => f(v)).join(', ');

      const mean = () => {
        let n, a;
        for (;;) {
          n = L(level, U.rint(3, 4), 5, U.rint(4, 5));
          a = list(n, L(level, 1, 2, 2), L(level, 12, 20, 30));
          const s = total(a);
          if (level < 3 ? s % n === 0 : (s * 10) % n === 0) break;
        }
        const s = total(a), m = R(s / n);
        const q = U.pick([
          `${U.name()} scored these marks in ${n} spelling tests: ${show(a)}. What is the mean mark?`,
          `Find the mean of these numbers: ${show(a)}.`,
          `A team scored these points in ${n} games: ${show(a)}. What is the mean number of points?`
        ]);
        return num(q, m, ['Add up all the numbers, then divide by how many numbers there are.', `${a.join(' + ')} = ${s}.`],
          `${a.join(' + ')} = ${s}. There are ${n} numbers, so the mean is ${s} ÷ ${n} = ${f(m)}.`);
      };
      const medianQ = () => {
        const n = L(level, 5, U.pick([5, 7]), 6);
        let a;
        do { a = list(n, 1, L(level, 15, 30, 40)); } while (n % 2 === 1 && a[(n - 1) / 2] === median(a));
        const s = sorted(a), med = median(a);
        return num(`What is the median of these numbers?\n${show(a)}`, med,
          ['Put the numbers in order first, then find the middle.', `In order: ${show(s)}.`],
          n % 2 ? `In order: ${show(s)}. The middle number is ${f(med)}.`
            : `In order: ${show(s)}. The two middle numbers are ${s[n / 2 - 1]} and ${s[n / 2]}. Halfway between them is ${f(med)}.`);
      };
      const modeQ = () => {
        const n = U.rint(6, 8), reps = level === 1 ? 3 : 2;
        const shoes = Math.random() < 0.5;
        const lo = shoes ? 30 : 1, hi = shoes ? 40 : 20;
        const m = U.rint(lo, hi);
        const others = U.sample(U.range(lo, hi).filter(v => v !== m), n - reps);
        const a = U.shuffle([...Array(reps).fill(m), ...others]);
        return num(shoes ? `These are the shoe sizes of ${n} children: ${show(a)}. What is the mode?` : `What is the mode of these numbers?\n${show(a)}`, m,
          ['The mode is the number that appears most often.', `In order: ${show(sorted(a))}.`],
          `${m} appears ${reps} times, more than any other number, so the mode is ${m}.`);
      };
      const rangeQ = () => {
        if (level === 3 && Math.random() < 0.6) {
          let a;
          do { a = list(6, -8, 12); } while (Math.min(...a) >= 0 || Math.max(...a) <= 0);
          const hi = Math.max(...a), lo = Math.min(...a);
          return num(`The midday temperatures in °C on six days were: ${show(a)}. What is the range?`, hi - lo,
            ['Range = highest − lowest.', `The highest is ${f(hi)} °C and the lowest is ${f(lo)} °C.`],
            `From ${f(lo)} up to 0 is ${-lo}, and from 0 up to ${hi} is ${hi}. ${-lo} + ${hi} = ${hi - lo}, so the range is ${hi - lo} °C.`, { unit: '°C' });
        }
        let a;
        do { a = list(L(level, 5, 6, 7), L(level, 1, 5, 10), L(level, 20, 50, 99)); } while (Math.max(...a) === Math.min(...a));
        const hi = Math.max(...a), lo = Math.min(...a);
        return num(`What is the range of these numbers?\n${show(a)}`, hi - lo, ['Range = biggest − smallest.', `The biggest is ${hi} and the smallest is ${lo}.`],
          `${hi} − ${lo} = ${hi - lo}.`);
      };
      const chart = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        let v;
        do { v = list(5, 1, L(level, 8, 10, 12)); } while (total(v) % 5 !== 0 || Math.max(...v) === Math.min(...v));
        const visual = { type: 'barChart', bars: days.map((d, i) => ({ label: d, value: v[i] })), step: 1, yLabel: 'Books', title: 'Books read each day' };
        if (Math.random() < 0.6) {
          const s = total(v);
          return num('The bar chart shows how many books a class read each day. What is the mean number of books per day?', s / 5,
            ['Read each bar, add the numbers, then divide by 5 (the number of days).', `${v.join(' + ')} = ${s}.`],
            `${v.join(' + ')} = ${s}, and ${s} ÷ 5 = ${s / 5}.`, { visual });
        }
        const hi = Math.max(...v), lo = Math.min(...v);
        return num('The bar chart shows how many books a class read each day. What is the range?', hi - lo,
          ['Range = highest − lowest. Find the tallest and the shortest bars.', `The tallest bar shows ${hi}.`], `${hi} − ${lo} = ${hi - lo}.`, { visual });
      };
      const mistake = () => {
        const nm = U.name();
        if (Math.random() < 0.5) {
          let a;
          do { a = list(5, 1, 20); } while (a[2] === median(a) || new Set(a).size < 5);
          const s = sorted(a), med = median(a);
          return chq(`${nm} says the median of ${show(a)} is ${a[2]}, because it is in the middle of the list. What is the median really?`, String(med),
            U.numChoices(med, { extra: [a[2], s[1], s[3]], min: 0 }),
            ['The numbers must be put in order before you find the middle.', `In order: ${show(s)}.`],
            `In order: ${show(s)}. The middle number is ${med}, not ${a[2]}.`);
        }
        let a;
        do { a = list(5, 1, 20); } while (total(a) % 5 !== 0 || median(a) === total(a) / 5);
        const m = total(a) / 5, med = median(a);
        return chq(`What is the **mean** of ${show(a)}?`, String(m), U.numChoices(m, { extra: [med, total(a), Math.max(...a) - Math.min(...a)], min: 0 }),
          ['Mean: add all the numbers, then divide by how many there are. Don\'t mix it up with the median (the middle number)!', `${a.join(' + ')} = ${total(a)}.`],
          `${a.join(' + ')} = ${total(a)}, and ${total(a)} ÷ 5 = ${m}. (${med} is the median, not the mean.)`);
      };
      const missingValue = () => {
        const n = U.rint(4, 5), m = U.rint(5, 15);
        let known;
        do { known = list(n - 1, 1, 25); } while (n * m - total(known) < 1 || n * m - total(known) > 30);
        const miss = n * m - total(known);
        return num(`The mean of ${n} numbers is ${m}. ${n - 1} of the numbers are ${andList(known.map(String))}. What is the missing number?`, miss,
          [`If the mean is ${m}, the ${n} numbers must add up to ${n} × ${m}.`, `Total = ${n} × ${m} = ${n * m}. The numbers you know add up to ${total(known)}.`],
          `The total must be ${n} × ${m} = ${n * m}. ${n * m} − ${total(known)} = ${miss}.`);
      };

      return run(L(level,
        [mean, medianQ, modeQ, rangeQ, chart],
        [mean, medianQ, modeQ, rangeQ, chart, mistake],
        [mean, medianQ, modeQ, rangeQ, chart, mistake, missingValue]));
    }
  });

  // ---------- 22. Probability ----------
  PMLM.registerSkill({
    id: 'g6.probability', grade: 6, unit: 'g6.u6', title: 'Probability', icon: '🎲',
    blurb: 'Describe chance and write probabilities as fractions',
    lesson: [
      {
        title: 'The language of chance',
        text: '**Impossible**: it cannot happen.\n**Unlikely**: it probably won\'t happen.\n**Even chance**: just as likely to happen as not.\n**Likely**: it probably will happen.\n**Certain**: it will definitely happen.',
        visual: { type: 'numberLine', min: 0, max: 1, step: 0.25, points: [{ at: 0, label: 'impossible' }, { at: 0.5, label: 'even chance' }, { at: 1, label: 'certain' }] }
      },
      {
        title: 'Probability as a fraction',
        text: 'Probability = **number of ways it can happen** ÷ **total number of outcomes**.\nA bag has 3 red marbles and 1 blue marble. The probability of picking red is **{3/4}**.',
        visual: { type: 'bag', items: [{ color: 'red', count: 3 }, { color: 'blue', count: 1 }] }
      },
      {
        title: 'The probability scale',
        text: 'Probabilities go from **0** (impossible) to **1** (certain). {1/2} is an even chance.\nRolling a 6 on a dice: {1/6}. That is unlikely.\nRolling a number less than 6: {5/6}. That is likely.'
      },
      {
        title: 'Spinners',
        text: 'This spinner has 8 equal sections, and 3 of them are blue.\nThe probability of blue is **{3/8}**.\nThe probability of **not** blue is {5/8}.\nThe two add up to 1, because something must happen!',
        visual: { type: 'spinner', sectors: [{ color: 'blue' }, { color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' }, { color: 'blue' }, { color: 'red' }, { color: 'green' }] }
      },
      {
        title: 'Worked example: marbles',
        text: 'A bag has 2 red, 5 blue and 3 green marbles. What is the probability of picking green?\n1. Total: 2 + 5 + 3 = 10 marbles.\n2. Green marbles: 3.\n3. The probability of green is **{3/10}**.',
        visual: { type: 'bag', items: [{ color: 'red', count: 2 }, { color: 'blue', count: 5 }, { color: 'green', count: 3 }] }
      }
    ],
    gen(level) {
      const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
      const WORDS = ['impossible', 'unlikely', 'even chance', 'likely', 'certain'];
      const wordFor = (k, n) => (k === 0 ? 'impossible' : k === n ? 'certain' : 2 * k === n ? 'even chance' : 2 * k < n ? 'unlikely' : 'likely');
      const whyWord = (k, n, what) => (k === 0 ? `None of the ${n} ${what || 'numbers work'}, so it is impossible.` : k === n ? `All ${n} ${what || 'numbers work'}, so it is certain.`
        : 2 * k === n ? `${k} out of ${n} is exactly half, so it is an even chance.`
          : 2 * k < n ? `${k} out of ${n} is less than half, so it is unlikely.` : `${k} out of ${n} is more than half, so it is likely.`);
      const simpTail = (k, n) => (U.gcd(k, n) > 1 ? ` = ${U.fracS(k, n)}` : '');
      const bagText = items => `${andList(items.map(it => `${it.count} ${it.color}`))} marbles`;
      const bagMake = k => {
        const cols = U.sample(COLORS, k);
        let counts;
        do { counts = cols.map(() => U.rint(1, 8)); } while (total(counts) > 20 || total(counts) < 4);
        return cols.map((color, i) => ({ color, count: counts[i] }));
      };

      const language = dice => {
        if (dice) {
          const evs = [
            ['You roll a 7.', []], ['You roll a number less than 7.', [1, 2, 3, 4, 5, 6]], ['You roll an even number.', [2, 4, 6]],
            ['You roll a 6.', [6]], ['You roll a number bigger than 1.', [2, 3, 4, 5, 6]], ['You roll an odd number.', [1, 3, 5]],
            ['You roll a 0.', []], ['You roll a number less than 3.', [1, 2]], ['You roll a number bigger than 2.', [3, 4, 5, 6]]
          ];
          const [e, ns] = U.pick(evs), k = ns.length;
          return chq(`You roll a normal dice numbered 1 to 6.\n${e} How likely is this?`, wordFor(k, 6), WORDS.slice(),
            ['Count how many of the 6 numbers would make it happen.', k ? `The numbers that work: ${ns.join(', ')}. That is ${k} out of 6.` : 'Look at the numbers 1 to 6. Do any of them work?'],
            whyWord(k, 6));
        }
        const kind = U.pick(WORDS);
        let items, colour, k;
        const [c1, c2, c3] = U.sample(COLORS, 3);
        if (kind === 'certain') { const n = U.rint(3, 10); items = [{ color: c1, count: n }]; colour = c1; k = n; }
        else if (kind === 'impossible') { items = [{ color: c1, count: U.rint(2, 8) }, { color: c2, count: U.rint(2, 8) }]; colour = c3; k = 0; }
        else if (kind === 'even chance') { const m = U.rint(2, 8); items = [{ color: c1, count: m }, { color: c2, count: m }]; colour = c1; k = m; }
        else if (kind === 'likely') { k = U.rint(7, 12); items = [{ color: c1, count: k }, { color: c2, count: U.rint(1, Math.floor(k / 3)) }]; colour = c1; }
        else { k = U.rint(1, 3); items = [{ color: c1, count: k }, { color: c2, count: U.rint(3 * k, 12) }]; colour = c1; }
        const n = total(items.map(i => i.count));
        return chq(`A bag has ${bagText(U.shuffle(items))}. You take one marble without looking. How likely is it that it is ${colour}?`, wordFor(k, n), WORDS.slice(),
          [`Compare the number of ${colour} marbles with the total number of marbles.`, `There ${k === 1 ? 'is' : 'are'} ${k} ${colour} marble${pl(k)} out of ${n}.`],
          whyWord(k, n, `marbles are ${colour}`), { visual: { type: 'bag', items } });
      };
      const bagFrac = () => {
        const items = bagMake(L(level, 2, U.rint(2, 3), 3));
        const n = total(items.map(i => i.count)), it = U.pick(items);
        return fracQ(`A bag has ${bagText(items)}. You take one marble without looking. What is the probability that it is ${it.color}?`, it.count, n,
          [`Probability = number of ${it.color} marbles ÷ total number of marbles.`, `Total: ${items.map(i => i.count).join(' + ')} = ${n} marbles.`],
          `There ${it.count === 1 ? 'is' : 'are'} ${it.count} ${it.color} out of ${n} marbles, so the probability is ${fr(it.count, n)}${simpTail(it.count, n)}.`,
          { visual: { type: 'bag', items } });
      };
      const spinnerFrac = () => {
        const n = U.pick(L(level, [4, 6, 8], [5, 6, 8, 10], [8, 9, 10, 12]));
        const cols = U.sample(COLORS, 3);
        let counts;
        do { const a = U.rint(1, n - 2), b = U.rint(1, n - a - 1); counts = [a, b, n - a - b]; } while (counts[2] < 1);
        const sectors = U.shuffle(cols.flatMap((col, i) => Array(counts[i]).fill(col))).map(color => ({ color }));
        const i = U.rint(0, 2), col = cols[i], k = counts[i];
        return fracQ(`The spinner has ${n} equal sections. What is the probability that it lands on ${col}?`, k, n,
          [`Probability = number of ${col} sections ÷ total number of sections.`, `There are ${n} sections in total, so the denominator is ${n}. Now count the ${col} ones.`],
          `${k} of the ${n} sections ${k === 1 ? 'is' : 'are'} ${col}, so the probability is ${fr(k, n)}${simpTail(k, n)}.`, { visual: { type: 'spinner', sectors } });
      };
      const diceQ = () => {
        const evs = [['an even number', [2, 4, 6]], ['a number greater than 4', [5, 6]], ['a 5', [5]], ['a number less than 3', [1, 2]],
          ['an odd number', [1, 3, 5]], ['a multiple of 3', [3, 6]], ['a prime number', [2, 3, 5]], ['a square number', [1, 4]],
          ['a factor of 6', [1, 2, 3, 6]], ['a number that is not 6', [1, 2, 3, 4, 5]]];
        const [e, ns] = U.pick(level === 2 ? evs.slice(0, 7) : evs);
        return fracQ(`You roll a normal dice numbered 1 to 6. What is the probability of rolling ${e}?`, ns.length, 6,
          ['A dice has 6 numbers, all equally likely: 1, 2, 3, 4, 5, 6.', `List the numbers that work: ${ns.join(', ')}.`],
          `${ns.length} of the 6 numbers work (${ns.join(', ')}), so the probability is ${fr(ns.length, 6)}${simpTail(ns.length, 6)}.`);
      };
      const mistake = () => {
        let r, b;
        do { r = U.rint(1, 9); b = U.rint(1, 9); } while (r === b);
        const nm = U.name(), ansStr = U.fracS(r, r + b);
        return chq(`A bag has ${r} red and ${b} blue marbles. ${nm} says the probability of picking red is ${fr(r, b)}. What is the correct probability?`, ansStr,
          byValue(ansStr, r / (r + b), [[fr(r, b), r / b], [U.fracS(b, r + b), b / (r + b)], [fr(1, 2), 0.5]]),
          ['The bottom number must be the **total** number of marbles.', `Total: ${r} + ${b} = ${r + b} marbles.`],
          `There ${r === 1 ? 'is' : 'are'} ${r} red out of ${r + b} marbles, so the probability of red is ${ansStr}. ${nm} divided by the number of blue marbles instead of the total.`,
          { visual: { type: 'bag', items: [{ color: 'red', count: r }, { color: 'blue', count: b }] } });
      };
      const notEvent = () => {
        const d = U.pick([5, 8, 10, 12, 20]);
        let a;
        do { a = U.rint(1, d - 1); } while (U.gcd(a, d) !== 1);
        const [ev, notEv] = U.pick([['it rains tomorrow', 'it does **not** rain tomorrow'], ['a bus is late', 'the bus is **not** late'], ['a team wins its next match', 'the team does **not** win']]);
        return fracQ(`The probability that ${ev} is ${fr(a, d)}. What is the probability that ${notEv}?`, d - a, d,
          ['Something either happens or it does not. The two probabilities add up to 1.', `1 = ${fr(d, d)}.`],
          `1 − ${fr(a, d)} = ${fr(d, d)} − ${fr(a, d)} = ${fr(d - a, d)}.`);
      };
      const moreLikely = () => {
        const tots = [4, 5, 8, 10, 12, 20];
        for (;;) {
          const [t1, t2] = U.sample(tots, 2);
          const r1 = U.rint(1, t1 - 1), r2 = U.rint(1, t2 - 1);
          if (r1 === r2) continue;
          const p1 = r1 / t1, p2 = r2 / t2;
          if ((r1 > r2) === (p1 > p2) && Math.random() < 0.7) continue;
          const same = Math.abs(p1 - p2) < 1e-9;
          const ans = same ? 'Both the same' : p1 > p2 ? 'Bag A' : 'Bag B';
          const Lc = U.lcm(t1, t2);
          return chq(`Bag A has ${r1} red marble${pl(r1)} out of ${t1}. Bag B has ${r2} red marble${pl(r2)} out of ${t2}. You pick one marble without looking. Which bag gives a better chance of red?`,
            ans, ['Bag A', 'Bag B', 'Both the same'],
            ['Compare the **fractions** of red marbles, not just the number of red marbles.', `Bag A: ${fr(r1, t1)} are red. Bag B: ${fr(r2, t2)} are red.`],
            `With the same denominator, Bag A has ${fr(r1 * Lc / t1, Lc)} and Bag B has ${fr(r2 * Lc / t2, Lc)} red. ${same ? 'They are the same.' : `${ans} gives the better chance.`}`);
        }
      };

      return run(L(level,
        [() => language(true), () => language(false), bagFrac, spinnerFrac],
        [() => language(Math.random() < 0.5), bagFrac, spinnerFrac, diceQ, mistake],
        [bagFrac, spinnerFrac, diceQ, mistake, notEvent, moreLikely, () => language(false)]));
    }
  });
})();
