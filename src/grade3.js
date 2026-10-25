// Play More Learn More — Cambridge Primary Stage 3 (Grade 3, age ~8).
// 5 units, 22 skills. See src/CONTRACT.md for the shapes used here.
(() => {
  // ───────────────────────── local helpers ─────────────────────────
  const M = U.MINUS;
  const R = U.rint;
  const pick = U.pick;
  const fr = U.frac;
  const coin = (p = 0.5) => Math.random() < p;
  const retry = (fn, tries = 4000) => {
    for (let i = 0; i < tries; i++) { const r = fn(); if (r) return r; }
    throw new Error('generator could not find good numbers');
  };
  // pick a format function for this level and run it
  const byLevel = (level, sets, ctx) => pick(sets[Math.min(Math.max(level | 0, 1), sets.length) - 1])(level, ctx);

  const num = (q, answer, hints, explain, extra) =>
    Object.assign({ q, kind: 'number', answer, hints, explain }, extra || {});
  const choice = (q, answer, wrongs, hints, explain, extra, n = 4) => {
    const a = String(answer);
    const w = [...new Set(wrongs.map(String))].filter(x => x !== a && x !== '' && !/NaN|undefined|Infinity|null/.test(x));
    return Object.assign({ q, kind: 'choice', answer: a, choices: U.choices(a, w, n), hints, explain }, extra || {});
  };
  const fracQ = (q, n, d, hints, explain, extra) =>
    Object.assign({ q, kind: 'fraction', answer: [n, d], hints, explain }, extra || {});

  const dig = n => [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];   // [hundreds, tens, ones]
  const r10 = n => Math.round(n / 10) * 10;
  const r100 = n => Math.round(n / 100) * 100;
  const sum = arr => arr.reduce((s, v) => s + v, 0);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const pl = (n, word, plural) => `${n} ${n === 1 ? word : plural || word + 's'}`;
  const hundreds = h => pl(h, 'hundred');
  const tens = t => pl(t, 'ten');
  const ones = o => pl(o, 'one');
  const sgn = up => (up ? '+' : M);
  const money = (cur, x) => cur + x;   // whole amounts only at this stage

  const KIDS = [['Ali', 'he', 'his'], ['Leyla', 'she', 'her'], ['Sam', 'he', 'his'], ['Mia', 'she', 'her'],
    ['Omar', 'he', 'his'], ['Aysel', 'she', 'her'], ['Tom', 'he', 'his'], ['Nina', 'she', 'her'],
    ['Murad', 'he', 'his'], ['Zara', 'she', 'her'], ['Ravi', 'he', 'his'], ['Emma', 'she', 'her'],
    ['Kenan', 'he', 'his'], ['Lucy', 'she', 'her'], ['Farid', 'he', 'his'], ['Sofia', 'she', 'her'],
    ['Jack', 'he', 'his'], ['Amina', 'she', 'her'], ['Leo', 'he', 'his'], ['Nigar', 'she', 'her']];
  const mk = ([n, he, his]) => ({ n, he, He: cap(he), his, His: cap(his), him: he === 'he' ? 'him' : 'her' });
  const kid = () => mk(pick(KIDS));
  const kids2 = () => U.sample(KIDS, 2).map(mk);

  // Column layout for written + and − : a table with H T O headings
  const colTable = (a, b, op) => {
    const len = Math.max(String(a).length, String(b).length);
    const heads = ['H', 'T', 'O'].slice(3 - len);
    const row = (x, s) => [s, ...String(x).padStart(len, ' ').split('').map(c => (c === ' ' ? '' : c))];
    return { type: 'table', headers: ['', ...heads], rows: [row(a, ''), row(b, op)] };
  };

  // ═══════════════════════ Unit 1: Numbers to 1000 ═══════════════════════
  PMLM.registerUnit({ id: 'g3.u1', grade: 3, name: 'Numbers to 1000', icon: '🔢' });

  /* 1 ── Hundreds, tens and ones */
  {
    const PLACE = ['hundreds', 'tens', 'ones'], ONE = ['hundred', 'ten', 'one'], WORTH = [100, 10, 1];
    const pv = (d, p) => (d === 1 ? `1 ${ONE[p]}` : `${d} ${PLACE[p]}`);
    const nz3 = () => U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);

    const read = L => {
      const h = R(1, L === 1 ? 4 : 9), t = R(L === 1 ? 1 : 0, 9), o = t === 0 ? R(1, 9) : R(L === 1 ? 1 : 0, 9), n = h * 100 + t * 10 + o;
      return num('What number do the blocks show?', n,
        ['Count the big squares (hundreds) first, then the sticks (tens), then the little cubes (ones).',
          `There ${h === 1 ? 'is 1 big square' : `are ${h} big squares`}, so that is ${h * 100}. Now count the sticks and the little cubes.`],
        `${cap(hundreds(h))}, ${tens(t)} and ${ones(o)} make ${h * 100} + ${t * 10} + ${o} = ${n}.`,
        { visual: { type: 'base10', n } });
    };

    const valueOf = L => {
      // hundreds or tens only: the value of a ones digit is the digit itself, so any hint would give it away
      const ds = nz3(), n = ds[0] * 100 + ds[1] * 10 + ds[2], p = R(0, 1), d = ds[p], v = d * WORTH[p];
      const q = `What is the value of the digit **${d}** in **${n}**?`;
      const hints = ['Find the place of the digit. Is it in the hundreds, the tens or the ones?',
        `The ${d} is in the ${PLACE[p]} place. How much ${d === 1 ? 'is' : 'are'} ${pv(d, p)} worth?`];
      const explain = `The ${d} is in the ${PLACE[p]} place, so it is worth ${pv(d, p)}, which is ${v}.`;
      if (L === 1) return choice(q, v, [d, d * 10, d * 100], hints, explain, { visual: { type: 'placeValue', value: n, highlight: p } });
      return num(q, v, hints, explain, { visual: { type: 'placeValue', value: n } });
    };

    const build = L => {
      const h = R(1, 9), t = R(L === 1 ? 1 : 0, 9), o = t === 0 ? R(1, 9) : R(L === 1 ? 1 : 0, 9), n = h * 100 + t * 10 + o;
      let parts = [`**${hundreds(h)}**`, `**${tens(t)}**`, `**${ones(o)}**`];
      if (L >= 2 && coin(0.6)) parts = U.shuffle(parts);
      return num(`${parts[0]}, ${parts[1]} and ${parts[2]}.\nWhat number is this?`, n,
        ['Write the hundreds digit first, then the tens digit, then the ones digit.',
          `${cap(hundreds(h))} is ${h * 100}. Now work out the tens and the ones, and add them on.`],
        `${h * 100} + ${t * 10} + ${o} = ${n}.`);
    };

    const zero = () => {
      const h = R(1, 9);
      if (coin()) {
        const o = R(1, 9), n = h * 100 + o;
        return choice(`**${hundreds(h)}** and **${ones(o)}**. There are no tens.\nWhat number is this?`, n,
          [h * 10 + o, h * 100 + o * 10, `${h * 100}${o}`],
          ['The tens place is empty, so it needs a 0 to hold the place.',
            `${cap(hundreds(h))} is ${h * 100}. Now put the ${ones(o)} in the ones place.`],
          `${h * 100} + ${o} = ${n}. The 0 holds the tens place.`);
      }
      const t = R(1, 9), n = h * 100 + t * 10;
      return choice(`**${hundreds(h)}** and **${tens(t)}**. There are no ones.\nWhat number is this?`, n,
        [h * 10 + t, h * 100 + t, t * 100 + h * 10],
        ['The ones place is empty, so it needs a 0 to hold the place.',
          `${cap(hundreds(h))} is ${h * 100}. ${cap(tens(t))} is ${t * 10}.`],
        `${h * 100} + ${t * 10} = ${n}. The 0 holds the ones place.`);
    };

    const partition = () => {
      const h = R(1, 9), t = R(1, 9), o = R(1, 9), n = h * 100 + t * 10 + o;
      const parts = [h * 100, t * 10, o], k = R(0, 2), ans = parts[k];
      const terms = parts.map((v, i) => (i === k ? '□' : String(v))).join(' + ');
      const known = parts.filter((_, i) => i !== k);
      return num(`Find the missing number.\n${coin() ? `${n} = ${terms}` : `${terms} = ${n}`}`, ans,
        ['Split the number into hundreds, tens and ones. Which part is missing?',
          `Add the two parts you know: ${known[0]} + ${known[1]} = ${known[0] + known[1]}. What do you add to that to make ${n}?`],
        `${n} = ${h * 100} + ${t * 10} + ${o}, so the missing number is ${ans}.`);
    };

    const regroup = () => {
      const h = R(1, 7), T = R(11, 19), o = R(1, 9), n = h * 100 + T * 10 + o;
      if (coin()) {
        return num(`**${hundreds(h)}**, **${T} tens** and **${ones(o)}**.\nWhat number is this?`, n,
          ['10 tens make 1 hundred. Change the tens into hundreds and tens first.',
            `${T} tens is ${T * 10}. Now add ${h * 100} + ${T * 10} + ${o}.`],
          `${T} tens is ${T * 10}. ${h * 100} + ${T * 10} + ${o} = ${n}.`);
      }
      const [nh, nt] = dig(n);
      return num(`Fill in the gap.\n${n} = ${hundreds(nh - 1)} + □ tens + ${ones(o)}`, nt + 10,
        ['One hundred can be changed into 10 tens.',
          `${n} is ${hundreds(nh)}, ${tens(nt)} and ${ones(o)}. Change 1 of the hundreds into 10 tens.`],
        `${n} is ${hundreds(nh)}, ${tens(nt)} and ${ones(o)}. Changing 1 hundred into 10 tens gives ${hundreds(nh - 1)}, ${nt + 10} tens and ${ones(o)}. The missing number is ${nt + 10}.`);
    };

    const times10 = () => {
      const a = retry(() => { const v = R(11, 99); return v % 10 ? v : null; });
      const [, t, o] = dig(a);
      if (coin()) {
        return num(`Work out **${a} × 10**.`, a * 10,
          ['When you multiply by 10, each digit moves one place to the left. A 0 fills the ones place.',
            `${t * 10} × 10 = ${t * 100}. Now work out ${o} × 10 and add.`],
          `${t * 100} + ${o * 10} = ${a * 10}. So ${a} × 10 = ${a * 10}.`);
      }
      return num(`Work out **${a * 10} ÷ 10**.`, a,
        ['When you divide by 10, each digit moves one place to the right.',
          `${t * 100} ÷ 10 = ${t * 10}. Now work out ${o * 10} ÷ 10 and add.`],
        `${t * 10} + ${o} = ${a}. So ${a * 10} ÷ 10 = ${a}, because ${a} × 10 = ${a * 10}.`);
    };

    const spot = () => {
      const w = kid(), h = R(1, 9), o = R(1, 9), n = h * 100 + o;
      return num(`${w.n} says that ${hundreds(h)} and ${ones(o)} is **${h}${o}**.\nWhat is the correct number?`, n,
        ['There are no tens. Which digit keeps the tens place?',
          `${cap(hundreds(h))} is ${h * 100}. Now add ${ones(o)}.`],
        `${h * 100} + ${o} = ${n}. ${w.n} forgot the 0 that holds the tens place.`);
    };

    PMLM.registerSkill({
      id: 'g3.placeValue', grade: 3, unit: 'g3.u1', title: 'Hundreds, tens and ones', icon: '🧱',
      blurb: 'Read, build and split numbers up to 1000',
      lesson: [
        { title: 'Hundreds, tens and ones',
          text: 'A 3-digit number is made of **hundreds**, **tens** and **ones**.\nBig square = 100. Stick = 10. Little cube = 1.\nThis picture shows **243**: 2 hundreds, 4 tens and 3 ones.',
          visual: { type: 'base10', n: 243 } },
        { title: 'Each place has a value',
          text: 'Where a digit sits tells you what it is worth.\nIn **243**, the **2** is in the hundreds place, so it is worth **200**.\nThe 4 is worth 40. The 3 is worth 3.',
          visual: { type: 'placeValue', value: 243, highlight: 0 } },
        { title: 'Zero holds a place',
          text: '**305** has no tens. The **0** keeps the tens place empty.\n305 = 300 + 0 + 5\n**Tip:** without the 0 it would say 35, which is much smaller!',
          visual: { type: 'base10', n: 305 } },
        { title: 'Swapping tens and hundreds',
          text: '10 ones make 1 ten. 10 tens make 1 hundred.\nSo **2 hundreds and 13 tens** = 200 + 130 = **330**.\n**× 10:** each digit moves one place to the left. 24 × 10 = **240**.' },
        { title: 'Worked example',
          text: 'Write **4 hundreds, 7 tens and 6 ones** as a number.\n**1.** 4 hundreds = 400\n**2.** 7 tens = 70\n**3.** 6 ones = 6\n**4.** 400 + 70 + 6 = **476**',
          visual: { type: 'base10', n: 476 } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [read, read, valueOf, build],
          [read, valueOf, partition, zero, build],
          [regroup, regroup, times10, spot, valueOf, build],
        ], ctx);
      },
    });
  }

  /* 2 ── Compare and order */
  {
    const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
    const firstDiff = (a, b) => {
      const sa = String(a), sb = String(b);
      if (sa.length !== sb.length) {
        const [big, small] = sa.length > sb.length ? [a, b] : [b, a];
        return `${big} has ${String(big).length} digits but ${small} has only ${String(small).length}.`;
      }
      const names = sa.length === 3 ? ['hundreds', 'tens', 'ones'] : ['tens', 'ones'];
      for (let i = 0; i < sa.length; i++) {
        if (sa[i] !== sb[i]) return `${i ? `They have the same ${names.slice(0, i).join(' and ')}. ` : ''}Compare the ${names[i]}: ${sa[i]} and ${sb[i]}.`;
      }
      return 'Both numbers have the same digits.';
    };
    const SIGNS = ['<', '>', '='];
    const signHint = 'Compare the biggest place first. The open side of the sign faces the bigger number.';

    const signQ = L => {
      let a, b;
      if (L === 1) {
        if (coin(0.4)) { a = R(10, 99); b = retry(() => { const v = R(10, 99); return Math.floor(v / 10) !== Math.floor(a / 10) ? v : null; }); }
        else { a = R(100, 999); b = retry(() => { const v = R(100, 999); return Math.floor(v / 100) !== Math.floor(a / 100) ? v : null; }); }
      } else {
        const t = R(1, 3);
        if (t === 1) {
          const h = R(1, 9);
          a = h * 100 + R(0, 99);
          b = retry(() => { const v = h * 100 + R(0, 99); return v !== a ? v : null; });
        } else if (t === 2) {
          a = R(51, 99);
          b = 100 + R(0, Math.floor(a / 10) - 1) * 10 + R(0, 9);
        } else {
          const [x, y] = U.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 2), h = R(1, 9);
          a = h * 100 + x * 10 + y; b = h * 100 + y * 10 + x;
        }
        if (coin()) [a, b] = [b, a];
      }
      const s = sign(a, b);
      return choice(`Which sign goes in the box?\n**${a}** □ **${b}**`, s, SIGNS,
        [signHint, `${firstDiff(a, b)} Which number is bigger?`],
        `${Math.max(a, b)} is bigger than ${Math.min(a, b)}, so ${a} ${s} ${b}.`, null, 3);
    };

    const biggest = () => {
      const ds = U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
      const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
        .map(p => ds[p[0]] * 100 + ds[p[1]] * 10 + ds[p[2]]).sort((x, y) => x - y);
      const most = coin();
      const ans = most ? perms[5] : perms[0], twin = most ? perms[4] : perms[1];
      const others = U.sample(perms.filter(x => x !== ans && x !== twin), 2);
      const lead = Math.floor(ans / 100);
      return choice(`Which number is the **${most ? 'greatest' : 'smallest'}**?`, ans, [twin, ...others],
        [`Look at the hundreds digits first. If two numbers have the same hundreds, look at the tens.`,
          `The ${most ? 'biggest' : 'smallest'} hundreds digit is ${lead}. Two numbers start with ${lead}. Compare their tens.`],
        `${ans} and ${twin} both have ${hundreds(lead)}. ${ans} has ${most ? 'more' : 'fewer'} tens, so ${ans} is the ${most ? 'greatest' : 'smallest'}.`);
    };

    const order = () => {
      const nums = retry(() => {
        const h = R(1, 9), x = h * 100 + R(0, 99), y = h * 100 + R(0, 99), z = R(100, 999);
        if (new Set([x, y, z]).size < 3 || Math.floor(z / 100) === h || Math.floor(x / 10) === Math.floor(y / 10)) return null;
        return [x, y, z];
      });
      const asc = coin(0.7);
      const s = nums.slice().sort((p, q) => (asc ? p - q : q - p));
      const lists = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(p => p.map(i => s[i]).join(', '));
      const ans = lists[0];
      const wrongs = [lists[1], ...U.sample(lists.slice(2), 2)];
      return choice(`Which list is in order from **${asc ? 'smallest to largest' : 'largest to smallest'}**?`, ans, wrongs,
        ['Compare the hundreds first. If two numbers have the same hundreds, compare their tens.',
          `The ${asc ? 'smallest' : 'largest'} number is ${s[0]}, so it goes first. Now compare the other two.`],
        `In order from ${asc ? 'smallest to largest' : 'largest to smallest'}: ${ans}.`);
    };

    const between = () => {
      const lo = R(1, 9) * 100 + R(0, 7) * 10, hi = lo + 20;
      const ans = retry(() => { const v = lo + R(1, 19); return v % 10 ? v : null; });
      const [h, t, o] = dig(ans), swapped = h * 100 + o * 10 + t;
      const w2 = hi + R(1, 9);
      const wrongs = [lo - R(1, 9), w2];
      if (swapped <= lo || swapped >= hi) wrongs.push(swapped);
      wrongs.push(hi + 10 + R(1, 9));
      return choice(`Which number is between **${lo}** and **${hi}**?`, ans, wrongs,
        [`A number between ${lo} and ${hi} is bigger than ${lo} and smaller than ${hi}.`,
          `Look at ${w2}: it is bigger than ${hi}, so it is not between them. Check the others the same way.`],
        `${ans} is bigger than ${lo} and smaller than ${hi}, so ${ans} is between them.`);
    };

    const digitCards = () => {
      const withZero = coin(0.4);
      const ds = withZero ? [0, ...U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 2)] : U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
      const big = coin();
      const desc = ds.slice().sort((a, b) => b - a), asc = ds.slice().sort((a, b) => a - b);
      if (asc[0] === 0) [asc[0], asc[1]] = [asc[1], asc[0]];
      const ans = +(big ? desc : asc).join('');
      const cards = U.shuffle(ds).join(', ');
      let hints;
      if (big) hints = ['Put the biggest digit in the hundreds place, then the next biggest in the tens place.',
        `The biggest digit is ${desc[0]}, so the number starts with ${desc[0]}. Which digit goes in the tens place?`];
      else if (withZero) hints = ['Put the smallest digit first. But a 3-digit number cannot start with 0!',
        `0 can't go first, so start with ${asc[0]}. Where should the 0 go to keep the number small?`];
      else hints = ['Put the smallest digit in the hundreds place, then the next smallest in the tens place.',
        `The smallest digit is ${asc[0]}, so the number starts with ${asc[0]}. Which digit goes next?`];
      return num(`Use each digit once: **${cards}**.\nWhat is the **${big ? 'largest' : 'smallest'}** 3-digit number you can make?`, ans, hints,
        big ? `Biggest digit first, then the next biggest: ${ans}.`
          : withZero ? `A number can't start with 0, so start with ${asc[0]}, then put the 0 next: ${ans}.`
            : `Smallest digit first, then the next smallest: ${ans}.`);
    };

    const compareExpr = () => {
      const [h, t, o] = U.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3), n = h * 100 + t * 10 + o;
      const k = R(1, 3), other = k === 1 ? n : k === 2 ? h * 100 + o * 10 + t : o * 100 + t * 10 + h;
      const left = coin(0.7) ? `${h * 100} + ${t * 10} + ${o}` : `${o} + ${h * 100} + ${t * 10}`;
      const s = sign(n, other);
      return choice(`Which sign goes in the box?\n**${left}** □ **${other}**`, s, SIGNS,
        ['Work out the left side first. Then compare the two numbers.',
          `${left} = ${n}. Now compare ${n} with ${other}.`],
        `${left} = ${n}. ${n === other ? `${n} is the same as ${other}` : `${Math.max(n, other)} is bigger than ${Math.min(n, other)}`}, so the sign is ${s}.`, null, 3);
    };

    const missingDigit = () => retry(() => {
      const h = R(1, 9), t = R(1, 8), o1 = R(0, 9), o2 = R(0, 9), target = h * 100 + t * 10 + o2, gt = coin();
      const ok = [], bad = [];
      for (let d = 0; d <= 9; d++) { const v = h * 100 + d * 10 + o1; ((gt ? v > target : v < target) ? ok : bad).push(d); }
      if (!ok.length || bad.length < 3) return null;
      const ans = pick(ok), s = gt ? '>' : '<';
      return choice(`Which digit can go in the box?\n**${h}□${o1} ${s} ${target}**`, ans, U.sample(bad, 3),
        ['Both numbers have the same hundreds digit, so the tens digit decides.',
          `The tens digit of ${target} is ${t}. The left number must be ${gt ? 'bigger' : 'smaller'}. Try each choice in the box.`],
        `${h}${ans}${o1} ${s} ${target}, so ${ans} works. The other digits make it false.`);
    });

    const spotC = () => {
      const w = kid(), a = R(81, 99), b = 100 + R(0, 9) * 10 + R(0, 9);
      return choice(`${w.n} says **${a} > ${b}** because ${Math.floor(a / 10)} is bigger than 1.\nIs ${w.he} right?`,
        `No, ${b} is bigger`, [`Yes, ${a} is bigger`, 'No, they are equal'],
        ['Count the digits first. A 3-digit number has hundreds.',
          `${a} has no hundreds. ${b} has 1 hundred.`],
        `${b} has 1 hundred and ${a} has none, so ${a} < ${b}. No, ${b} is bigger, so ${w.n} is wrong.`, null, 3);
    };

    PMLM.registerSkill({
      id: 'g3.compare', grade: 3, unit: 'g3.u1', title: 'Compare and order', icon: '⚖️',
      blurb: 'Use < and > and put numbers in order',
      lesson: [
        { title: 'Look at the hundreds first',
          text: 'To compare two numbers, start with the **biggest place**.\n**452** and **387**: 4 hundreds is more than 3 hundreds.\nSo 452 is bigger.',
          visual: { type: 'table', headers: ['', 'H', 'T', 'O'], rows: [['452', '4', '5', '2'], ['387', '3', '8', '7']] } },
        { title: 'Same hundreds? Look at the tens',
          text: '**364** and **346** both have 3 hundreds.\nNow look at the tens: 6 tens is more than 4 tens.\nSo 364 is bigger.',
          visual: { type: 'table', headers: ['', 'H', 'T', 'O'], rows: [['364', '3', '6', '4'], ['346', '3', '4', '6']] } },
        { title: 'The signs < and >',
          text: '**>** means "is greater than". **<** means "is less than".\nThe open side always faces the **bigger** number.\n**452 > 387** and **346 < 364**.' },
        { title: 'Putting numbers in order',
          text: 'Compare the numbers two at a time.\nOn a number line, smaller numbers are further to the left.\nSmallest to largest: **158, 518, 851**.',
          visual: { type: 'numberLine', min: 0, max: 1000, step: 100, points: [{ at: 158, label: '158' }, { at: 518, label: '518' }, { at: 851, label: '851' }] } },
        { title: 'Worked example',
          text: 'Put **518, 581, 158** in order, smallest first.\n**1.** Hundreds: 5, 5 and 1. So **158** is the smallest.\n**2.** 518 and 581 both have 5 hundreds. Compare the tens: 1 ten is less than 8 tens.\n**3.** So 518 comes before 581.\nAnswer: **158, 518, 581**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [signQ, signQ, biggest],
          [signQ, order, between, biggest, spotC],
          [digitCards, compareExpr, missingDigit, order, spotC],
        ], ctx);
      },
    });
  }

  /* 3 ── Rounding to 10 and 100 */
  {
    const near10 = L => {
      const n = retry(() => { const v = L === 1 ? R(11, 99) : R(101, 995); return v % 10 ? v : null; });
      const lo = Math.floor(n / 10) * 10, hi = lo + 10, o = n % 10, ans = r10(n);
      const visual = L === 1
        ? { type: 'numberLine', min: lo, max: hi, step: 1, points: [{ at: n }] }
        : { type: 'numberLine', min: lo, max: hi, step: 1, labelEvery: 5, points: [{ at: n, label: String(n) }] };
      return num(`Round **${n}** to the nearest 10.`, ans,
        ['Find the tens on each side of the number. Which one is nearer?',
          `${n} is between ${lo} and ${hi}. The ones digit is ${o}. ${o === 5 ? 'That is exactly halfway. What does the rule say?' : 'Is that less than 5, or 5 or more?'}`],
        `${n} is between ${lo} and ${hi}. The ones digit is ${o}, so round ${o >= 5 ? 'up' : 'down'} to ${ans}.`,
        L < 3 ? { visual } : {});
    };

    const near100 = L => {
      const n = retry(() => { const v = R(101, L === 3 ? 999 : 949); return v % 100 ? v : null; });
      const lo = Math.floor(n / 100) * 100, hi = lo + 100, t = Math.floor(n / 10) % 10, ans = r100(n);
      return num(`Round **${n}** to the nearest 100.`, ans,
        ['Look at the tens digit. 0 to 4: round down. 5 to 9: round up.',
          `${n} is between ${lo} and ${hi}. Its tens digit is ${t}.`],
        `${n} is between ${lo} and ${hi}. The tens digit is ${t}, so round ${t >= 5 ? 'up' : 'down'} to ${ans}.`,
        L < 3 ? { visual: { type: 'numberLine', min: lo, max: hi, step: 10, labelEvery: 5, points: [{ at: n, label: String(n) }] } } : {});
    };

    const whichRounds = L => {
      const T = L === 1 ? R(2, 9) * 10 : R(11, 98) * 10;
      const ans = retry(() => { const v = T + R(-5, 4); return v !== T ? v : null; });
      const why = v => {
        const lo = Math.floor(v / 10) * 10, o = v % 10;
        return `${v} has ${ones(o)}, so it rounds ${o >= 5 ? 'up' : 'down'} to ${o >= 5 ? lo + 10 : lo}`;
      };
      return choice(`Which number rounds to **${T}** (to the nearest 10)?`, ans, [T + 5, T - 6, T + R(6, 9), T - R(7, 9)],
        [`A number rounds to ${T} if ${T} is the nearest ten to it.`,
          `For example, ${why(T + 5)}. Check the other numbers the same way.`],
        `${why(ans)}. So ${ans} is the answer.`);
    };

    const couldBe = () => {
      const T = R(2, 9) * 100;
      const ans = retry(() => { const v = T + R(-50, 49); return v !== T ? v : null; });
      const w1 = T + 50 + R(0, 9);
      const why = v => {
        const lo = Math.floor(v / 100) * 100, t = Math.floor(v / 10) % 10;
        return `${v} has ${tens(t)}, so it rounds ${t >= 5 ? 'up' : 'down'} to ${t >= 5 ? lo + 100 : lo}`;
      };
      return choice(`Which number rounds to **${T}** (to the nearest 100)?`, ans, [w1, T - 51 - R(0, 8), T + R(60, 99), T - R(60, 99)],
        ['To round to the nearest 100, look at the tens digit of each number.',
          `For example, ${why(w1)}. Check the others the same way.`],
        `${why(ans)}. So ${ans} is the answer.`);
    };

    const spotR = () => {
      const w = kid(), h = R(1, 8), n = h * 100 + 40 + R(5, 9);
      return num(`${w.n} rounds **${n}** to the nearest 100 and gets **${(h + 1) * 100}**.\nWhat is the correct answer?`, h * 100,
        ['To round to the nearest 100, look only at the tens digit.',
          `${n} is between ${h * 100} and ${(h + 1) * 100}. Its tens digit is 4.`],
        `The tens digit of ${n} is 4, so it rounds down to ${h * 100}. ${w.n} rounded twice (${n} → ${r10(n)} → ${(h + 1) * 100}). Always round in one go.`);
    };

    const word = () => {
      const things = ['books in the school library', 'people at a concert', 'children in a school', 'seats in a cinema', 'apples on a farm stall', 'cars in a car park'];
      const n = retry(() => { const v = R(101, 989); return v % 10 ? v : null; }), to = pick([10, 100]);
      const lo = Math.floor(n / to) * to, d = to === 10 ? n % 10 : Math.floor(n / 10) % 10, ans = to === 10 ? r10(n) : r100(n);
      return num(`There are **${n}** ${pick(things)}.\nRound this number to the nearest ${to}.`, ans,
        [to === 10 ? 'Look at the ones digit. 0 to 4: round down. 5 to 9: round up.' : 'Look at the tens digit. 0 to 4: round down. 5 to 9: round up.',
          `${n} is between ${lo} and ${lo + to}. The ${to === 10 ? 'ones' : 'tens'} digit is ${d}.`],
        `The ${to === 10 ? 'ones' : 'tens'} digit is ${d}, so ${n} rounds ${d >= 5 ? 'up' : 'down'} to ${ans}.`);
    };

    PMLM.registerSkill({
      id: 'g3.round', grade: 3, unit: 'g3.u1', title: 'Rounding to 10 and 100', icon: '🎯',
      blurb: 'Round numbers to the nearest 10 or 100',
      lesson: [
        { title: 'The nearest ten',
          text: 'Rounding finds the **nearest** ten.\n**37** is between 30 and 40. It is closer to **40**.\nSo 37 rounds to **40**.',
          visual: { type: 'numberLine', min: 30, max: 40, step: 1, points: [{ at: 37, label: '37' }] } },
        { title: 'The halfway rule',
          text: 'Look at the **ones** digit. 0, 1, 2, 3 or 4: round **down**. 5, 6, 7, 8 or 9: round **up**.\nA number ending in 5 is exactly halfway. We round it **up**.\n45 rounds to **50**. 44 rounds to **40**.',
          visual: { type: 'numberLine', min: 40, max: 50, step: 1, points: [{ at: 45, label: '45' }] } },
        { title: 'Three-digit numbers',
          text: '**473** is between 470 and 480.\nThe ones digit is 3, so round **down**.\n473 rounds to **470** (to the nearest 10).',
          visual: { type: 'numberLine', min: 470, max: 480, step: 1, labelEvery: 5, points: [{ at: 473, label: '473' }] } },
        { title: 'The nearest hundred',
          text: 'To round to the nearest 100, look at the **tens** digit.\n**260** is between 200 and 300. The tens digit is 6, so round **up** to **300**.\n**Tip:** don\'t round twice. Use the tens digit only.',
          visual: { type: 'numberLine', min: 200, max: 300, step: 10, labelEvery: 5, points: [{ at: 260, label: '260' }] } },
        { title: 'Worked example',
          text: 'Round **651** to the nearest 100.\n**1.** Which hundreds is it between? 600 and 700.\n**2.** Look at the tens digit: **5**.\n**3.** 5 means round **up**.\nAnswer: 651 rounds to **700**.',
          visual: { type: 'numberLine', min: 600, max: 700, step: 10, labelEvery: 5, points: [{ at: 651, label: '651' }] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [near10, near10, near10, whichRounds],
          [near10, near100, whichRounds, near100],
          [spotR, couldBe, near100, near10, word],
        ], ctx);
      },
    });
  }

  /* 4 ── Counting in steps */
  {
    const makeSeq = L => retry(() => {
      const s = L === 1 ? pick([2, 5, 10]) : pick([3, 4, 5, 10, 100, 4, 3]);
      const dir = L === 1 ? 1 : coin(0.55) ? 1 : -1;
      let a;
      if (L === 1) a = s === 10 ? R(1, 50) : s * R(1, 8);
      else if (s === 100) a = R(1, 9) * 10 + R(0, 9) + 100 * R(0, 5);
      else if (L === 2) a = R(0, 400);
      else a = R(100, 960);
      const terms = [0, 1, 2, 3, 4].map(i => a + dir * s * i);
      if (terms.some(v => v < 0 || v > 1000)) return null;
      if (L === 3 && s === 10 && Math.floor(terms[0] / 100) === Math.floor(terms[4] / 100)) return null;
      return { s, dir, terms };
    });
    const ruleName = (dir, s) => `${dir > 0 ? 'add' : 'subtract'} ${s}`;

    const nextQ = L => {
      const { s, dir, terms } = makeSeq(L), last = terms[3], ans = terms[4];
      return num(L === 1 ? `Count in **${s}s**. What number comes next?` : 'What number comes next?', ans,
        [L === 1 ? `Count on ${s} more from the last number.` : 'Find how much the numbers go up or down each time.',
          L === 1 ? `The last number is ${last}. What is ${last} + ${s}?` : `${terms[0]} → ${terms[1]} is ${sgn(dir > 0)}${s}. So ${ruleName(dir, s)} to ${last}.`],
        `The rule is ${ruleName(dir, s)}. ${last} ${sgn(dir > 0)} ${s} = ${ans}.`,
        { visual: { type: 'sequence', terms: [...terms.slice(0, 4).map(String), '?'] } });
    };

    const midQ = L => {
      const { s, dir, terms } = makeSeq(L), k = R(1, 3);
      const [p, q] = k >= 2 ? [0, 1] : [2, 3];
      return num('What is the missing number?', terms[k],
        ['Find the rule first: how much does it change each time?',
          `${terms[p]} → ${terms[q]} is ${sgn(dir > 0)}${s}. The number before the gap is ${terms[k - 1]}.`],
        `The rule is ${ruleName(dir, s)}. ${terms[k - 1]} ${sgn(dir > 0)} ${s} = ${terms[k]}.`,
        { visual: { type: 'sequence', terms: terms.map((v, i) => (i === k ? '?' : String(v))) } });
    };

    const ruleQ = L => {
      const { s, dir, terms } = makeSeq(Math.max(2, L));
      const ans = ruleName(dir, s);
      const wrongs = s === 100 ? [ruleName(-dir, 100), ruleName(dir, 10), ruleName(dir, 1)]
        : s === 10 ? [ruleName(-dir, 10), ruleName(dir, 1), ruleName(dir, 100)]
          : [ruleName(-dir, s), ruleName(dir, s + 1), ruleName(dir, s - 1), ruleName(dir, s * 2)];
      return choice('What is the rule for this sequence?', ans, wrongs,
        ['Look at how much the numbers change from one box to the next. Do they go up or down?',
          `Work out the difference between ${terms[0]} and ${terms[1]}.`],
        `Each number is ${s} ${dir > 0 ? 'more' : 'less'} than the one before, so the rule is ${ans}.`,
        { visual: { type: 'sequence', terms: terms.slice(0, 4).map(String) } });
    };

    const countOn = L => {
      const s = L === 2 ? pick([10, 100]) : pick([10, 100, 5, 4, 3]), k = R(3, 6), dir = coin(0.6) ? 1 : -1;
      const a = retry(() => {
        const v = R(100, 900), end = v + dir * s * k;
        if (end < 20 || end > 1000) return null;
        if (L === 3 && Math.floor(v / 100) === Math.floor(end / 100)) return null;
        return v;
      });
      const ans = a + dir * s * k;
      const tip = s === 10 ? ' The tens digit changes each time.' : s === 100 ? ' The hundreds digit changes each time.' : '';
      return num(`Start at **${a}**. Count ${dir > 0 ? 'on' : 'back'} in **${s}s**.\nMake **${k}** jumps. What number do you land on?`, ans,
        [`Each jump ${dir > 0 ? 'adds' : 'takes away'} ${s}.${tip}`,
          `Jump 1: ${a} → ${a + dir * s}. Jump 2: ${a + dir * s} → ${a + 2 * dir * s}. Keep going until you have made ${k} jumps.`],
        `${k} jumps of ${s} is ${k * s}. ${a} ${sgn(dir > 0)} ${k * s} = ${ans}.`);
    };

    const firstQ = () => {
      const { s, dir, terms } = makeSeq(3);
      return num('What is the first number?', terms[0],
        ['Find the rule, then work backwards.',
          `${terms[1]} → ${terms[2]} is ${sgn(dir > 0)}${s}. To go back one step, do the opposite.`],
        `The rule is ${ruleName(dir, s)}. Going back one step: ${terms[1]} ${sgn(dir < 0)} ${s} = ${terms[0]}.`,
        { visual: { type: 'sequence', terms: ['?', ...terms.slice(1).map(String)] } });
    };

    const multQ = () => {
      const s = pick([2, 3, 4, 5, 10]), k = R(4, 12), ans = s * k, w = kid();
      const cands = U.shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + 3, ans + 5, ans - 5]).filter(v => v > 0 && v % s !== 0);
      return choice(`${w.n} counts in **${s}s**, starting at 0.\nWhich number will ${w.he} say?`, ans, cands,
        [`The numbers in the ${s}s count are the ${s} times table.`,
          `${w.n} says ${s}, ${2 * s}, ${3 * s}, … Keep counting and see which choice ${w.he} says.`],
        `${ans} = ${k} × ${s}, so ${w.n} says it. The other numbers are not in the ${s} times table.`);
    };

    PMLM.registerSkill({
      id: 'g3.count', grade: 3, unit: 'g3.u1', title: 'Counting in steps', icon: '🦘',
      blurb: 'Count on and back in 2s, 3s, 4s, 5s, 10s and 100s',
      lesson: [
        { title: 'Steps of the same size',
          text: 'When we count in steps, we add the **same amount** each time.\nCounting in 3s: 3, 6, 9, 12, 15 …',
          visual: { type: 'sequence', terms: ['3', '6', '9', '12', '15'], step: '+3' } },
        { title: 'Counting back',
          text: 'We can count **back** too. Then the numbers get smaller.\nCounting back in 4s: 20, 16, 12, 8 …',
          visual: { type: 'sequence', terms: ['20', '16', '12', '8'], step: '−4' } },
        { title: 'Tens and hundreds',
          text: 'Counting in **10s** changes the **tens** digit: 47, 57, 67, 77.\nCounting in **100s** changes the **hundreds** digit: 215, 315, 415.\nThe other digits stay the same!',
          visual: { type: 'sequence', terms: ['215', '315', '415', '515'], step: '+100' } },
        { title: 'Find the rule',
          text: 'To find the rule, see how much the number changes each time.\n14, 19, 24, 29: each number is **5 more**, so the rule is **add 5**.',
          visual: { type: 'numberLine', min: 14, max: 29, step: 1, labelEvery: 5, jumps: [{ from: 14, to: 19, label: '+5' }, { from: 19, to: 24, label: '+5' }, { from: 24, to: 29, label: '+5' }] } },
        { title: 'Worked example',
          text: 'What comes next? **96, 93, 90, 87, □**\n**1.** 96 to 93 is 3 less. 93 to 90 is 3 less.\n**2.** So the rule is **subtract 3**.\n**3.** 87 − 3 = **84**.\nAnswer: **84**',
          visual: { type: 'sequence', terms: ['96', '93', '90', '87', '?'] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [nextQ, nextQ, midQ],
          [nextQ, midQ, ruleQ, countOn],
          [nextQ, firstQ, multQ, countOn, ruleQ],
        ], ctx);
      },
    });
  }

  /* 5 ── Odd and even */
  {
    const EMO = ['🍎', '⭐', '🧦', '🐟', '🍪', '🌸'];
    const par = v => (v % 2 ? 'odd' : 'even');
    const EVEN = [0, 2, 4, 6, 8], ODD = [1, 3, 5, 7, 9];

    const single = () => {
      const n = R(3, 20), even = n % 2 === 0, p = Math.floor(n / 2);
      return choice(`Is **${n}** odd or even?`, par(n), [even ? 'odd' : 'even'],
        ['Try to put the objects into pairs. Is one left over?',
          `Make pairs: ${p} pairs use ${2 * p} of them. Are any left over?`],
        `${n} makes ${p} pairs${even ? ' with none left over' : ' and 1 left over'}, so ${n} is ${par(n)}.`,
        { visual: { type: 'objects', groups: [n], emoji: pick(EMO) } }, 2);
    };

    const whichParity = L => {
      const wantEven = coin(), want = wantEven ? 'even' : 'odd', other = wantEven ? 'odd' : 'even';
      const pd = wantEven ? EVEN : ODD, qd = wantEven ? ODD : EVEN;
      const nz = arr => arr.filter(d => d > 0);
      const mkAns = () => (L === 1 ? R(1, 9) * 10 + pick(pd) : pick(nz(qd)) * 100 + pick(qd) * 10 + pick(pd));
      const mkWrong = () => (L === 1 ? R(1, 9) * 10 + pick(qd) : pick(nz(pd)) * 100 + pick(pd) * 10 + pick(qd));
      const ans = mkAns();
      const wrongs = retry(() => { const s = new Set([mkWrong(), mkWrong(), mkWrong()]); return s.size === 3 ? [...s] : null; });
      return choice(`Which number is **${want}**?`, ans, wrongs,
        ['Only the ones digit tells you if a number is odd or even.',
          `${wrongs[0]} ends in ${wrongs[0] % 10}, so it is ${other}. Check the others the same way.`],
        `${ans} ends in ${ans % 10}, so it is ${want}. The others end in ${other} digits.`);
    };

    const nextP = () => {
      const n = coin(0.4) ? R(1, 9) * 100 + pick([-2, -1, 0, 1]) : R(101, 997);
      const wantEven = coin(), w = wantEven ? 'even' : 'odd', after = coin(0.7);
      let ans = after ? n + 1 : n - 1;
      if ((ans % 2 === 0) !== wantEven) ans = after ? ans + 1 : ans - 1;
      return num(after ? `What is the next **${w}** number after **${n}**?` : `What is the **${w}** number just before **${n}**?`, ans,
        [`${cap(w)} numbers end in ${wantEven ? '0, 2, 4, 6 or 8' : '1, 3, 5, 7 or 9'}. They go up in 2s.`,
          `${n} ends in ${n % 10}, so it is ${par(n)}. ${par(n) === w
            ? (after ? `The next ${w} number is 2 more than ${n}.` : `The ${w} number before it is 2 less than ${n}.`)
            : (after ? `So the next ${w} number is just 1 more than ${n}.` : `So the ${w} number before it is just 1 less than ${n}.`)}`],
        `${ans} ends in ${ans % 10}, so it is ${w}. It is the ${w} number ${after ? 'just after' : 'just before'} ${n}.`);
    };

    const sumP = L => {
      const big = L === 3 ? 499 : 99, sub = L === 3 && coin(0.4);
      let x = R(11, big), y = R(11, big);
      if (sub) { if (x === y) y = x - 1; if (y > x) [x, y] = [y, x]; }
      const res = sub ? x - y : x + y, op = sub ? M : '+';
      return choice(`Is **${x} ${op} ${y}** odd or even?\nTry to answer without working it out.`, par(res), [res % 2 ? 'even' : 'odd'],
        [sub ? 'Taking away follows the same rules as adding: odd and odd make even, even and even make even, odd and even make odd.'
          : 'odd + odd = even, even + even = even, odd + even = odd.',
          `${x} is ${par(x)} and ${y} is ${par(y)}.`],
        `${x} is ${par(x)} and ${y} is ${par(y)}. ${cap(par(x))} ${op} ${par(y)} = ${par(res)}. (Check: ${x} ${op} ${y} = ${res}.) So the answer is ${par(res)}.`, null, 2);
    };

    const countP = () => {
      const a = R(20, 90), b = a + R(7, 13), wantEven = coin(), w = wantEven ? 'even' : 'odd';
      const list = [];
      for (let v = a + 1; v < b; v++) if ((v % 2 === 0) === wantEven) list.push(v);
      return num(`How many **${w}** numbers are there between **${a}** and **${b}**?\n(Do not count ${a} or ${b}.)`, list.length,
        [`List the numbers between ${a} and ${b}, then pick out the ${w} ones.`,
          `The numbers go ${a + 1}, ${a + 2}, ${a + 3}, … and stop at ${b - 1}.`],
        `The ${w} numbers are ${list.join(', ')}. That is ${list.length}.`);
    };

    const possible = () => {
      const [p1, p2, res] = pick([['odd', 'odd', 'even'], ['even', 'even', 'even'], ['odd', 'even', 'odd']]);
      const yes = coin(), w = kid(), opp = res === 'even' ? 'odd' : 'even';
      let t = R(20, 99);
      if ((t % 2 === 0) !== ((yes ? res : opp) === 'even')) t += 1;
      const ex = { odd: [3, 5], even: [2, 4] }, e1 = ex[p1][0], e2 = ex[p2][1];
      const what = p1 === p2 ? `two ${p1} numbers` : 'an odd number and an even number';
      const ans = yes ? `Yes, because ${p1} + ${p2} is always ${res}` : `No, because ${p1} + ${p2} is always ${res}`;
      const wrongs = yes ? [`No, because ${p1} + ${p2} is always ${opp}`, `No, because ${t} is too big`]
        : [`Yes, because ${p1} + ${p2} is always ${opp}`, 'Yes, any answer is possible'];
      return choice(`${w.n} adds ${what} and gets **${t}**.\nCould ${w.he} be right?`, ans, wrongs,
        [`Think about odd and even. What does ${p1} + ${p2} always make?`,
          `Try small numbers: ${e1} + ${e2} = ${e1 + e2}. Is that odd or even? Is ${t} odd or even?`],
        `${cap(p1)} + ${p2} is always ${res}. ${t} is ${par(t)}, so ${yes ? `yes, ${w.n} could be right` : `no, ${w.n} must be wrong`}.`, null, 3);
    };

    const riddle = () => {
      const t = R(2, 9), wantEven = coin(), w = wantEven ? 'even' : 'odd';
      const o = pick(wantEven ? [2, 4, 6, 8] : ODD), n = t * 10 + o;
      const list = (wantEven ? [2, 4, 6, 8] : ODD).map(d => t * 10 + d);
      return num(`I am an **${w}** number between **${t * 10}** and **${t * 10 + 10}**.\nMy digits add up to **${t + o}**. What number am I?`, n,
        [`List the ${w} numbers between ${t * 10} and ${t * 10 + 10}.`,
          `They are ${list.join(', ')}. Add up the digits of each one.`],
        `${t} + ${o} = ${t + o}, so the number is ${n}.`);
    };

    PMLM.registerSkill({
      id: 'g3.oddEven', grade: 3, unit: 'g3.u1', title: 'Odd and even', icon: '🧦',
      blurb: 'Spot odd and even numbers and their patterns',
      lesson: [
        { title: 'Even numbers make pairs',
          text: 'An **even** number can be put into pairs with **none left over**.\n8 is even: it makes 4 pairs.',
          visual: { type: 'objects', groups: [2, 2, 2, 2], emoji: '🧦' } },
        { title: 'Odd numbers have one left over',
          text: 'An **odd** number always has **one left over** when you make pairs.\n7 is odd: 3 pairs and 1 left over.',
          visual: { type: 'objects', groups: [2, 2, 2, 1], emoji: '🧦' } },
        { title: 'Look at the ones digit',
          text: 'You only need the **ones** digit!\nEven numbers end in **0, 2, 4, 6 or 8**.\nOdd numbers end in **1, 3, 5, 7 or 9**.\nSo **374** is even and **829** is odd.',
          visual: { type: 'placeValue', value: 374, highlight: 2 } },
        { title: 'Adding odd and even',
          text: 'even + even = **even**\nodd + odd = **even**\nodd + even = **odd**\nTaking away follows the same rules.\nExample: 3 + 5 = 8 (odd + odd = even).',
          visual: { type: 'table', headers: ['+', 'even', 'odd'], rows: [['**even**', 'even', 'odd'], ['**odd**', 'odd', 'even']] } },
        { title: 'Worked example',
          text: 'Is **37 + 24** odd or even?\n**1.** 37 ends in 7, so it is odd.\n**2.** 24 ends in 4, so it is even.\n**3.** odd + even = odd.\nAnswer: **odd** (check: 37 + 24 = 61)' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [single, single, whichParity],
          [whichParity, nextP, sumP],
          [countP, possible, riddle, sumP, nextP],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 2: Add and subtract ═══════════════════════
  PMLM.registerUnit({ id: 'g3.u2', grade: 3, name: 'Add and subtract', icon: '➕' });

  /* 6 ── Mental adding and subtracting */
  {
    const WORTH = [100, 10, 1];
    const pickMental = (L, sub) => retry(() => {
      const a = R(101, 989), p = L === 1 ? R(0, 2) : L === 2 ? pick([0, 1, 1, 2, 2]) : pick([1, 2]);
      const d = R(1, 9), k = d * WORTH[p], res = sub ? a - k : a + k;
      if (res < 100 || res > 999) return null;
      const da = dig(a), cross = sub ? da[p] < d : da[p] + d > 9;
      if (p === 0 && cross) return null;
      if (L === 1 && cross) return null;
      if (L >= 2 && p !== 0 && !cross) return null;
      if (L === 3 && Math.floor(res / 100) === Math.floor(a / 100)) return null;
      // bridging the ones through a ten must leave something to do after the ten
      if (p === 2 && cross && !sub && da[2] + d === 10) return null;
      if (p === 2 && cross && sub && da[2] === 0 && d < 2) return null;
      return { a, k, p, d, res, cross, da, sub };
    });

    const mHints = ({ a, k, p, d, cross, da, sub }) => {
      const op = sub ? M : '+';
      if (p === 0) return ['Adding or taking away hundreds only changes the hundreds digit.',
        `${a} has ${hundreds(da[0])}. ${da[0]} ${op} ${d} = ${sub ? da[0] - d : da[0] + d} hundreds.`];
      if (p === 1) {
        if (!cross) return ['Adding or taking away tens only changes the tens digit.',
          `${a} has ${tens(da[1])}. ${da[1]} ${op} ${d} = ${sub ? da[1] - d : da[1] + d} tens.`];
        if (!sub) return ['If the tens go past 9, the hundreds go up by 1.',
          `${a} has ${tens(da[1])}. ${da[1]} + ${d} = ${da[1] + d} tens. That is 1 hundred and ${tens(da[1] + d - 10)}.`];
        return ['If there are not enough tens, change 1 hundred into 10 tens.',
          `${a} has ${tens(da[1])}. Change 1 hundred into 10 tens: now there are ${da[1] + 10} tens. Take away ${tens(d)}.`];
      }
      if (!cross) return ['Adding or taking away ones only changes the ones digit.',
        `${a} has ${ones(da[2])}. ${da[2]} ${op} ${d} = ${sub ? da[2] - d : da[2] + d}.`];
      if (!sub) {
        const toTen = 10 - da[2];
        return ['Make the next ten first, then add the rest.',
          `${a} + ${toTen} = ${a + toTen}. Now add the other ${d - toTen}.`];
      }
      if (da[2] === 0) return ['Take away 1 to get off the whole ten, then take away the rest.', `${a} ${M} 1 = ${a - 1}. Now take away the other ${d - 1}.`];
      return ['Go back to the ten first, then take away the rest.',
        `${a} ${M} ${da[2]} = ${a - da[2]}. Now take away the other ${d - da[2]}.`];
    };
    const mExplain = ({ a, k, p, d, res, cross, da, sub }) => {
      const op = sub ? M : '+';
      let why = '';
      if (cross && p === 1) why = sub ? `There were not enough tens, so 1 hundred became 10 tens. `
        : `${da[1]} tens + ${d} tens = ${da[1] + d} tens, which is 1 hundred and ${tens(da[1] + d - 10)}. `;
      if (cross && p === 2) why = sub ? `We went back past ${Math.floor(a / 10) * 10}. ` : `We went past ${Math.ceil(a / 10) * 10}. `;
      return `${why}${a} ${op} ${k} = ${res}.`;
    };

    const calc = L => {
      const m = pickMental(L, coin());
      return num(`Work out **${m.a} ${m.sub ? M : '+'} ${m.k}**.`, m.res, mHints(m), mExplain(m),
        L === 1 ? { visual: { type: 'base10', n: m.a } } : {});
    };

    const missing = () => {
      const m = pickMental(1, coin());
      const t = R(1, 3);
      if (t === 1 && !m.sub) {
        return num(`Find the missing number.\n${m.a} + □ = ${m.res}`, m.k,
          ['Compare the two numbers. Which digit has changed, and by how much?',
            `Look at ${m.a} and ${m.res} one place at a time: hundreds, tens, then ones.`],
          `Only the ${['hundreds', 'tens', 'ones'][m.p]} digit changed, by ${m.d}. So the missing number is ${m.k}.`);
      }
      if (t === 2 || !m.sub) {
        const [x, y] = m.sub ? [m.res, m.a] : [m.a, m.res];   // x − □ = ... uses y − k = x
        return num(`Find the missing number.\n${y} ${M} □ = ${x}`, m.k,
          ['Compare the two numbers. Which digit has changed, and by how much?',
            `Look at ${y} and ${x} one place at a time: hundreds, tens, then ones.`],
          `Only the ${['hundreds', 'tens', 'ones'][m.p]} digit changed, by ${m.d}. So the missing number is ${m.k}.`);
      }
      return num(`Find the missing number.\n□ ${M} ${m.k} = ${m.res}`, m.a,
        ['Work backwards. Undo taking away by adding.',
          `□ = ${m.res} + ${m.k}.`],
        `${m.res} + ${m.k} = ${m.a}. Check: ${m.a} ${M} ${m.k} = ${m.res}.`);
    };

    const spot = () => {
      const m = pickMental(3, coin()), w = kid();
      let wrong;
      if (m.p === 1) wrong = m.sub ? m.da[0] * 100 + (m.d - m.da[1]) * 10 + m.da[2] : m.da[0] * 100 + ((m.da[1] + m.d) % 10) * 10 + m.da[2];
      else wrong = m.sub ? m.res + 100 : m.res - 100;
      if (wrong === m.res) wrong = m.res + 10;
      const why = m.p === 1
        ? (m.sub ? `${w.n} took the smaller tens digit from the bigger one. You must change 1 hundred into 10 tens.` : `${w.n} forgot that the hundreds go up by 1.`)
        : (m.sub ? `${w.n} forgot that the hundreds go down by 1.` : `${w.n} forgot that the hundreds go up by 1.`);
      return num(`${w.n} says **${m.a} ${m.sub ? M : '+'} ${m.k} = ${wrong}**.\nWhat is the correct answer?`, m.res, mHints(m),
        `${why} ${m.a} ${m.sub ? M : '+'} ${m.k} = ${m.res}.`);
    };

    const word = () => {
      const m = retry(() => { const x = pickMental(3, coin()); return x.p === 1 ? x : null; }), w = kid();
      const q = m.sub
        ? pick([`A book has **${m.a}** pages. ${w.n} has read **${m.k}** pages.\nHow many pages are left to read?`,
          `There are **${m.a}** people at a show. **${m.k}** people go home early.\nHow many people are still at the show?`,
          `A farmer has **${m.a}** eggs. ${w.He} sells **${m.k}** of them.\nHow many eggs are left?`])
        : pick([`A school has **${m.a}** children. **${m.k}** more children join.\nHow many children are there now?`,
          `${w.n} has **${m.a}** stickers. ${w.He} gets **${m.k}** more.\nHow many stickers does ${w.he} have now?`,
          `A shop has **${m.a}** pencils. **${m.k}** more pencils arrive.\nHow many pencils does the shop have now?`]);
      return num(q, m.res, mHints(m), mExplain(m));
    };

    const adjust = () => {
      const k = pick([9, 99, 19]), sub = coin(), a = retry(() => { const v = R(120, 880); return v % 10 ? v : null; });
      const res = sub ? a - k : a + k, k1 = k + 1;
      if (sub) return num(`Work out **${a} ${M} ${k}**.`, res,
        [`Taking away ${k} is the same as taking away ${k1}, then adding 1 back.`,
          `${a} ${M} ${k1} = ${a - k1}. Now add 1.`],
        `${a} ${M} ${k1} = ${a - k1}, then add 1: ${res}.`);
      return num(`Work out **${a} + ${k}**.`, res,
        [`Adding ${k} is the same as adding ${k1}, then taking away 1.`,
          `${a} + ${k1} = ${a + k1}. Now take away 1.`],
        `${a} + ${k1} = ${a + k1}, then take away 1: ${res}.`);
    };

    PMLM.registerSkill({
      id: 'g3.mental', grade: 3, unit: 'g3.u2', title: 'Mental add and subtract', icon: '🧠',
      blurb: 'Add and take away ones, tens or hundreds in your head',
      lesson: [
        { title: 'Adding hundreds',
          text: 'To add hundreds, only the **hundreds** digit changes.\n352 + 200 = **552**\n(3 hundreds + 2 hundreds = 5 hundreds)',
          visual: { type: 'base10', n: 352 } },
        { title: 'Adding tens',
          text: 'To add tens, change the **tens** digit.\n352 + 40 = **392**\nIf the tens go past 9, the hundreds go up by 1:\n382 + 30 = **412**',
          visual: { type: 'numberLine', min: 350, max: 400, step: 10, jumps: [{ from: 352, to: 362, label: '+10' }, { from: 362, to: 372, label: '+10' }, { from: 372, to: 382, label: '+10' }, { from: 382, to: 392, label: '+10' }] } },
        { title: 'Make the next ten',
          text: '345 + 3 = **348**: only the ones change.\nIf the ones go past 9, go through the next ten:\n347 + 5 → 347 + 3 = 350, then 2 more = **352**.',
          visual: { type: 'numberLine', min: 345, max: 355, step: 1, jumps: [{ from: 347, to: 350, label: '+3' }, { from: 350, to: 352, label: '+2' }] } },
        { title: 'Taking away',
          text: 'Taking away works the same way.\n675 − 300 = **375** (the hundreds change)\n675 − 20 = **655** (the tens change)\n402 − 5 → back 2 to 400, then back 3 more = **397**',
          visual: { type: 'numberLine', min: 395, max: 405, step: 1, jumps: [{ from: 402, to: 400, label: '−2' }, { from: 400, to: 397, label: '−3' }] } },
        { title: 'Worked example',
          text: 'Work out **468 + 50**.\n**1.** 468 has 6 tens. Add 5 tens: 6 + 5 = 11 tens.\n**2.** 11 tens is 1 hundred and 1 ten.\n**3.** So the hundreds go from 4 to 5, and the tens digit is 1.\nAnswer: **518**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [calc, calc, calc],
          [calc, calc, missing, calc],
          [calc, spot, word, adjust, missing],
        ], ctx);
      },
    });
  }

  /* 7 ── Column addition */
  {
    const carries = (a, b) => {
      const A = dig(a), B = dig(b), c1 = A[2] + B[2] > 9 ? 1 : 0, c2 = A[1] + B[1] + c1 > 9 ? 1 : 0;
      return [c1, c2];
    };
    const pickAdd = L => retry(() => {
      let a, b;
      if (L === 1) { a = coin() ? R(10, 99) : R(100, 899); b = coin() ? R(10, 99) : R(100, 599); }
      else if (L === 2) { a = R(100, 899); b = coin() ? R(11, 99) : R(100, 599); }
      else { a = R(100, 899); b = coin(0.3) ? R(11, 99) : R(100, 699); }
      if (b > a) [a, b] = [b, a];
      if (a + b > 999) return null;
      const [c1, c2] = carries(a, b), n = c1 + c2;
      if (L === 1 && n !== 0) return null;
      if (L === 2 && n !== 1) return null;
      if (L === 3 && n !== 2) return null;
      return [a, b];
    });
    const steps = (a, b) => {
      const A = dig(a), B = dig(b), lines = [];
      const o = A[2] + B[2], c1 = o > 9 ? 1 : 0;
      lines.push(`Ones: ${A[2]} + ${B[2]} = ${o}${c1 ? `. Write ${o % 10} and carry 1 ten.` : '.'}`);
      const t = A[1] + B[1] + c1, c2 = t > 9 ? 1 : 0;
      lines.push(`Tens: ${A[1]} + ${B[1]}${c1 ? ' + 1' : ''} = ${t}${c2 ? `. Write ${t % 10} and carry 1 hundred.` : '.'}`);
      if (a >= 100 || b >= 100 || c2) lines.push(`Hundreds: ${A[0]} + ${B[0]}${c2 ? ' + 1' : ''} = ${A[0] + B[0] + c2}.`);
      return lines;
    };
    const aHints = (a, b) => ['Line up the columns. Add the ones first, then the tens, then the hundreds.',
      `${steps(a, b)[0]} Now add the tens.`];
    const aExplain = (a, b) => `${steps(a, b).join('\n')}\nSo ${a} + ${b} = ${a + b}.`;
    const noCarry = (a, b) => { const A = dig(a), B = dig(b); return ((A[0] + B[0]) % 10) * 100 + ((A[1] + B[1]) % 10) * 10 + (A[2] + B[2]) % 10; };

    const calc = L => {
      const [a, b] = pickAdd(L);
      return num(`Work out **${a} + ${b}**.`, a + b, aHints(a, b), aExplain(a, b), { visual: colTable(a, b, '+') });
    };

    const calcChoice = L => {
      const [a, b] = pickAdd(L), s = a + b, [c1, c2] = carries(a, b);
      const wrongs = [noCarry(a, b)];
      if (c1 && c2) wrongs.push(s - 10, s - 100);
      wrongs.push(s + 10, s - 1, s + 100);
      return choice(`Work out **${a} + ${b}**.`, s, wrongs.filter(v => v > 0), aHints(a, b), aExplain(a, b), { visual: colTable(a, b, '+') });
    };

    const word = L => {
      const [a, b] = pickAdd(L), w = kid();
      const q = pick([
        `There are **${a}** sheep and **${b}** goats on a farm.\nHow many animals are there altogether?`,
        `A library has **${a}** story books and **${b}** picture books.\nHow many books is that in total?`,
        `On Saturday **${a}** people visited the zoo. On Sunday **${b}** people visited.\nHow many people visited altogether?`,
        `${w.n} scored **${a}** points in the first game and **${b}** points in the second game.\nWhat was ${w.his} total score?`,
        `A shop sold **${a}** apples in the morning and **${b}** apples in the afternoon.\nHow many apples did it sell?`,
      ]);
      return num(q, a + b, ['The word "altogether" or "total" means add. ' + aHints(a, b)[0], aHints(a, b)[1]], aExplain(a, b));
    };

    const spot = () => {
      const [a, b] = pickAdd(3), w = kid(), bad = noCarry(a, b);
      return num(`${w.n} says **${a} + ${b} = ${bad}**.\nWhat is the correct answer?`, a + b,
        ['Check each column. When a column makes 10 or more, did 1 get carried to the next column?', aHints(a, b)[1]],
        `${w.n} forgot to carry.\n${aExplain(a, b)}`, { visual: colTable(a, b, '+') });
    };

    PMLM.registerSkill({
      id: 'g3.colAdd', grade: 3, unit: 'g3.u2', title: 'Column addition', icon: '🧮',
      blurb: 'Add 3-digit numbers in columns, with carrying',
      lesson: [
        { title: 'Line up the columns',
          text: 'Write the numbers one under the other.\nOnes under ones, tens under tens, hundreds under hundreds.',
          visual: colTable(342, 125, '+') },
        { title: 'Start with the ones',
          text: 'Always add the **ones** first, then the **tens**, then the **hundreds**.\n342 + 125:\nOnes: 2 + 5 = 7\nTens: 4 + 2 = 6\nHundreds: 3 + 1 = 4\nAnswer: **467**' },
        { title: 'Carrying',
          text: 'If a column adds up to **10 or more**, you carry.\n7 + 8 = 15 ones. 15 ones = 1 ten and 5 ones.\nWrite **5** in the ones column and carry **1** to the tens column.\n**Tip:** don\'t forget to add the carried 1!',
          visual: { type: 'base10', n: 15 } },
        { title: 'Worked example',
          text: 'Work out **247 + 186**.\n**1.** Ones: 7 + 6 = 13. Write 3, carry 1.\n**2.** Tens: 4 + 8 + 1 = 13. Write 3, carry 1.\n**3.** Hundreds: 2 + 1 + 1 = 4.\nAnswer: **433**',
          visual: colTable(247, 186, '+') },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [calc, calc, word],
          [calc, calcChoice, word, calc],
          [calc, spot, word, calcChoice],
        ], ctx);
      },
    });
  }

  /* 8 ── Column subtraction */
  {
    const info = (a, b) => {
      const A = dig(a), B = dig(b), ones = A[2] < B[2], zero = ones && A[1] === 0;
      const tens = !zero && A[1] - (ones ? 1 : 0) < B[1];
      return { ones, tens, zero, n: (ones ? 1 : 0) + (tens ? 1 : 0) };
    };
    const pickSub = L => retry(() => {
      let a, b;
      if (L === 1) { a = coin() ? R(20, 99) : R(200, 999); b = R(10, a < 100 ? a - 1 : 499); }
      else if (L === 2) { a = R(200, 999); b = coin() ? R(11, 99) : R(100, a - 10); }
      else { a = R(200, 999); b = coin(0.3) ? R(11, 99) : R(100, a - 10); }
      if (b >= a || a - b < 10 || a - b === b) return null;
      const e = info(a, b);
      if (L === 1 && e.n !== 0) return null;
      if (L === 2 && (e.n !== 1 || e.zero)) return null;
      if (L === 3 && !(e.n === 2 || e.zero)) return null;
      return [a, b];
    });
    const steps = (a, b) => {
      let [ah, at, ao] = dig(a);
      const [bh, bt, bo] = dig(b), lines = [];
      if (ao < bo) {
        if (at === 0) { ah -= 1; at = 10; lines.push('Ones: there are no tens to exchange, so first change 1 hundred into 10 tens.'); }
        at -= 1; ao += 10;
        lines.push(`Ones: exchange 1 ten for 10 ones. ${ao} − ${bo} = ${ao - bo}.`);
      } else lines.push(`Ones: ${ao} − ${bo} = ${ao - bo}.`);
      if (at < bt) { ah -= 1; at += 10; lines.push(`Tens: exchange 1 hundred for 10 tens. ${at} − ${bt} = ${at - bt}.`); }
      else lines.push(`Tens: ${at} − ${bt} = ${at - bt}.`);
      if (a >= 100) lines.push(`Hundreds: ${ah} − ${bh} = ${ah - bh}.`);
      return lines;
    };
    const sHints = (a, b) => {
      const l = steps(a, b), first = l[0].startsWith('Ones: there') ? `${l[0]} ${l[1].replace('Ones: ', 'Then ')}` : l[0];
      return ['Start with the ones. If the top digit is smaller, exchange 1 ten for 10 ones. Never swap the digits round!',
        `${first} Now do the tens.`];
    };
    const sExplain = (a, b) => `${steps(a, b).join('\n')}\nSo ${a} − ${b} = ${a - b}.`;
    const smallFromBig = (a, b) => { const A = dig(a), B = dig(b); return Math.abs(A[0] - B[0]) * 100 + Math.abs(A[1] - B[1]) * 10 + Math.abs(A[2] - B[2]); };
    const noReduce = (a, b) => {
      const A = dig(a), B = dig(b);
      let o = A[2] - B[2], t = A[1] - B[1];
      if (o < 0) o += 10;
      if (t < 0) t += 10;
      return (A[0] - B[0]) * 100 + t * 10 + o;
    };

    const calc = L => {
      const [a, b] = pickSub(L);
      return num(`Work out **${a} − ${b}**.`, a - b, sHints(a, b), sExplain(a, b), { visual: colTable(a, b, M) });
    };

    const calcChoice = L => {
      const [a, b] = pickSub(L), d = a - b;
      return choice(`Work out **${a} − ${b}**.`, d, [smallFromBig(a, b), noReduce(a, b), d + 10, d - 10, d + 100].filter(v => v > 0),
        sHints(a, b), sExplain(a, b), { visual: colTable(a, b, M) });
    };

    const inverse = () => {
      const [a, b] = pickSub(2), d = a - b;
      return choice(`Which addition can you use to check that **${a} − ${b} = ${d}**?`, `${d} + ${b}`, [`${a} + ${b}`, `${a} + ${d}`, `${d} + ${d}`],
        ['Adding is the opposite of taking away. Answer + the number taken away = the starting number.',
          `Start with the answer, ${d}. What do you add to it to get back to ${a}?`],
        `${d} + ${b} = ${a}, so ${d} + ${b} checks the subtraction.`, null, 4);
    };

    const word = L => {
      const [a, b] = pickSub(L), [p, q] = kids2();
      const t = R(1, 5);
      let text, unit;
      if (t === 1) text = `A shop had **${a}** apples. It sold **${b}** of them.\nHow many apples are left?`;
      else if (t === 2) text = `A plane has **${a}** seats. **${b}** seats are taken.\nHow many seats are empty?`;
      else if (t === 3) text = `${p.n} has **${a}** stickers. ${q.n} has **${b}** stickers.\nHow many more stickers does ${p.n} have than ${q.n}?`;
      else if (t === 4) { text = `One tower is **${a} cm** tall. Another tower is **${b} cm** tall.\nWhat is the difference in height?`; unit = 'cm'; }
      else text = `A book has **${a}** pages. ${p.n} has read **${b}** pages.\nHow many pages are left to read?`;
      return num(text, a - b,
        [`This is a take away problem: work out ${a} − ${b}. ${sHints(a, b)[0]}`, sHints(a, b)[1]],
        sExplain(a, b), unit ? { unit } : {});
    };

    const spot = () => {
      const [a, b] = retry(() => { const p = pickSub(3); return smallFromBig(...p) !== p[0] - p[1] ? p : null; });
      const w = kid(), bad = smallFromBig(a, b);
      return num(`${w.n} says **${a} − ${b} = ${bad}**.\nWhat is the correct answer?`, a - b, sHints(a, b),
        `${w.n} took the smaller digit from the bigger one instead of exchanging.\n${sExplain(a, b)}`, { visual: colTable(a, b, M) });
    };

    const missing = () => {
      const [a, b] = pickSub(3), d = a - b;
      if (coin()) return num(`Find the missing number.\n□ − ${b} = ${d}`, a,
        ['Work backwards. Undo taking away by adding.', `□ = ${d} + ${b}. Add the ones first.`],
        `${d} + ${b} = ${a}. Check: ${a} − ${b} = ${d}.`);
      return num(`Find the missing number.\n${a} − □ = ${d}`, b,
        ['What do you take away from the first number to get the answer? Work out the difference.', `□ = ${a} − ${d}.`],
        `${a} − ${d} = ${b}. Check: ${a} − ${b} = ${d}.`);
    };

    PMLM.registerSkill({
      id: 'g3.colSub', grade: 3, unit: 'g3.u2', title: 'Column subtraction', icon: '➖',
      blurb: 'Take away 3-digit numbers in columns, with exchanging',
      lesson: [
        { title: 'Start with the ones',
          text: 'Write the bigger number on top. Line up the columns.\nTake away the **ones** first, then the tens, then the hundreds.\n587 − 243: 7 − 3 = 4, 8 − 4 = 4, 5 − 2 = 3.\nAnswer: **344**',
          visual: colTable(587, 243, M) },
        { title: 'When the top digit is smaller',
          text: 'In **352 − 128**, the ones are 2 − 8. You can\'t take 8 from 2!\n**Don\'t** swap them round to do 8 − 2. That is a very common mistake.',
          visual: colTable(352, 128, M) },
        { title: 'Exchange a ten',
          text: 'Change **1 ten** into **10 ones**.\nThe 5 tens become **4 tens**. The 2 ones become **12 ones**.\nNow 12 − 8 = 4.\n**Tip:** the number is still 352: 3 hundreds, 4 tens and 12 ones.',
          visual: { type: 'base10', n: 352 } },
        { title: 'Worked example',
          text: 'Work out **352 − 128**.\n**1.** Ones: 2 − 8? Exchange 1 ten. 12 − 8 = 4.\n**2.** Tens: 4 − 2 = 2 (the 5 became 4).\n**3.** Hundreds: 3 − 1 = 2.\nAnswer: **224**\n**Check:** 224 + 128 = 352 ✓',
          visual: colTable(352, 128, M) },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [calc, calc, word],
          [calc, calcChoice, inverse, word],
          [calc, spot, word, missing],
        ], ctx);
      },
    });
  }

  /* 9 ── Estimate and check */
  {
    const estPair = (L, plus) => retry(() => {
      const unit = L === 1 ? 10 : 100, r = L === 1 ? r10 : r100;
      let a = L === 1 ? R(11, 89) : R(110, 890), b = L === 1 ? R(11, 89) : R(110, 890);
      if (!plus && a < b) [a, b] = [b, a];
      if (a === b) return null;
      const exact = plus ? a + b : a - b, ra = r(a), rb = r(b), est = plus ? ra + rb : ra - rb;
      if (exact > 999 || est <= 0 || r(exact) !== est) return null;
      if ([a, b, exact].some(v => v % unit === unit / 2)) return null;
      return { a, b, exact, est, unit, ra, rb };
    });

    const closest = L => {
      const plus = coin(0.6), op = plus ? '+' : M;
      const { a, b, exact, est, unit, ra, rb } = estPair(L, plus);
      return choice(`Which is the closest estimate for **${a} ${op} ${b}**?`, est,
        [est + unit, est - unit, est + 2 * unit, est - 2 * unit].filter(v => v > 0),
        [`Round each number to the nearest ${unit} first.`, `${a} rounds to ${ra}. ${b} rounds to ${rb}.`],
        `${ra} ${op} ${rb} = ${est}. (The exact answer is ${exact}${exact === est ? ' too!' : '.'}) So the closest estimate is ${est}.`);
    };

    const estNumber = L => {
      const plus = coin(0.6), op = plus ? '+' : M;
      const { a, b, est, unit, ra, rb } = estPair(L === 1 ? 1 : 2, plus);
      return num(`Estimate **${a} ${op} ${b}** by rounding each number to the nearest ${unit}.`, est,
        [`Round each number to the nearest ${unit}, then ${plus ? 'add' : 'take away'}.`, `${a} rounds to ${ra}.`],
        `${a} rounds to ${ra} and ${b} rounds to ${rb}. ${ra} ${op} ${rb} = ${est}.`);
    };

    const check = () => {
      const { a, b, exact, est, ra, rb } = estPair(2, true), w = kid(), right = coin(0.35);
      const given = right ? exact : exact - 100 >= 100 && coin() ? exact - 100 : exact + 100;
      if (given > 999) return closest(2);
      const ans = right ? 'Yes, it is about right' : `No, it should be about ${est}`;
      const wrongs = right ? [`No, it should be about ${est + 100}`, `No, it should be about ${est > 100 ? est - 100 : est + 200}`]
        : ['Yes, it is about right', `No, it should be about ${r100(given)}`];
      return choice(`${w.n} worked out **${a} + ${b} = ${given}**.\nUse an estimate to check. Is ${w.his} answer about right?`, ans, wrongs,
        ['Round each number to the nearest 100 and add. Is the answer close to that?',
          `${a} rounds to ${ra} and ${b} rounds to ${rb}.`],
        `Estimate: ${ra} + ${rb} = ${est}. ${given} is ${right ? 'close to' : 'not close to'} ${est}. ${right ? 'Yes, it is about right' : `No, it should be about ${est}. (The real answer is ${exact}.)`}`, null, 3);
    };

    const calcFor = E => retry(() => {
      const plus = coin(0.6);
      let ra, rb;
      if (plus) { ra = R(1, E / 100 - 1) * 100; rb = E - ra; } else { rb = R(1, Math.max(1, 9 - E / 100)) * 100; ra = E + rb; }
      if (ra < 100 || rb < 100 || ra > 900) return null;
      const off = () => { const v = R(-40, 40); return v === 0 ? 7 : v; };
      const a = ra + off(), b = rb + off(), exact = plus ? a + b : a - b;
      if (a > 999 || b > 999 || a <= b && !plus || r100(exact) !== E) return null;
      return { text: `${a} ${plus ? '+' : M} ${b}`, ra, rb, op: plus ? '+' : M };
    });

    const closeTo = () => {
      const targets = U.sample([300, 400, 500, 600, 700, 800], 4), T = targets[0];
      const c = targets.map(calcFor);
      return choice(`Which calculation has an answer close to **${T}**?`, c[0].text, c.slice(1).map(x => x.text),
        ['Estimate each one by rounding the numbers to the nearest 100.',
          `For example, ${c[1].text} is about ${c[1].ra} ${c[1].op} ${c[1].rb} = ${targets[1]}. Try the others.`],
        `${c[0].text} is about ${c[0].ra} ${c[0].op} ${c[0].rb} = ${T}.`);
    };

    const wordEst = () => {
      const { a, b, exact, est, ra, rb } = estPair(2, true), w = kid();
      const q = pick([
        `A shop sold **${a}** apples on Monday and **${b}** apples on Tuesday.\n**About** how many apples did it sell?`,
        `${w.n}'s school has **${a}** children. The school next door has **${b}** children.\n**About** how many children is that altogether?`,
        `A train has **${a}** people on it. At the station **${b}** more get on.\n**About** how many people are on the train now?`]);
      return choice(q, est, [est + 100, est - 100, est + 200].filter(v => v > 0),
        ['"About" means estimate. Round each number to the nearest 100, then add.',
          `${a} rounds to ${ra}. ${b} rounds to ${rb}.`],
        `${ra} + ${rb} = ${est}. (The exact answer is ${exact}.) So about ${est}.`);
    };

    PMLM.registerSkill({
      id: 'g3.estimate', grade: 3, unit: 'g3.u2', title: 'Estimate and check', icon: '🔍',
      blurb: 'Round to estimate, then check your answers',
      lesson: [
        { title: 'What is an estimate?',
          text: 'An **estimate** is a clever guess that is close to the answer.\nWe round the numbers first so they are easy to work with.' },
        { title: 'Round, then add',
          text: 'Estimate **48 + 31**.\n48 is about **50**. 31 is about **30**.\n50 + 30 = **80**. So the answer is about 80.\n(The exact answer is 79. Very close!)',
          visual: { type: 'numberLine', min: 30, max: 50, step: 1, labelEvery: 5, points: [{ at: 31, label: '31' }, { at: 48, label: '48' }] } },
        { title: 'Three-digit numbers',
          text: 'For bigger numbers, round to the nearest **100**.\nEstimate **412 + 289**: 400 + 300 = **700**.\nThe exact answer is 701.' },
        { title: 'Check your answer',
          text: 'Use an estimate to check. If your answer is far away, look again!\nLeo worked out 312 + 195 = **407**.\nEstimate: 300 + 200 = 500. 407 is not close to 500, so Leo should check again.\n(The real answer is 507.)' },
        { title: 'Worked example',
          text: 'Estimate **596 − 207**.\n**1.** 596 rounds to 600.\n**2.** 207 rounds to 200.\n**3.** 600 − 200 = 400.\nAnswer: about **400**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [closest, closest, estNumber],
          [closest, check, closest, estNumber],
          [closeTo, estNumber, wordEst, check],
        ], ctx);
      },
    });
  }

  /* 10 ── Two-step word problems */
  {
    const two = (q, s1, v1, s2, v2, extra) => num(q, v2,
      ['This needs two steps. What do you need to find first?', `Step 1: ${s1} = ${v1}. Now do step 2.`],
      `Step 1: ${s1} = ${v1}.\nStep 2: ${s2} = ${v2}.\nAnswer: ${v2}.`, extra);

    const getsGives = () => {
      const w = kid(), a = R(20, 60), b = R(5, 25), v1 = a + b;
      const c = retry(() => { const v = R(5, a + b - 5); return v !== a && v !== b ? v : null; });
      return two(`${w.n} has **${a}** stickers. ${w.He} gets **${b}** more. Then ${w.he} gives **${c}** to a friend.\nHow many stickers does ${w.n} have now?`,
        `${a} + ${b}`, v1, `${v1} − ${c}`, v1 - c);
    };
    const bus = () => {
      const a = R(20, 50), b = R(5, a - 5), c = retry(() => { const v = R(3, 20); return v !== b ? v : null; }), v1 = a - b;
      return two(`A bus has **${a}** people on it. At a stop, **${b}** people get off and **${c}** people get on.\nHow many people are on the bus now?`,
        `${a} − ${b}`, v1, `${v1} + ${c}`, v1 + c);
    };
    const threeAdd = () => {
      const a = R(5, 30), b = R(5, 30), c = R(5, 30), [x, y, z] = U.sample(['red', 'blue', 'green', 'yellow'], 3);
      return two(`A box has **${a}** ${x} pencils, **${b}** ${y} pencils and **${c}** ${z} pencils.\nHow many pencils are in the box altogether?`,
        `${a} + ${b}`, a + b, `${a + b} + ${c}`, a + b + c);
    };
    const fewer = L => {
      const [p, q] = kids2(), a = L === 3 ? R(150, 450) : R(30, 80), d = L === 3 ? R(20, a - 50) : R(5, a - 10), b = a - d;
      return two(`${p.n} has **${a}** marbles. ${q.n} has **${d}** fewer marbles than ${p.n}.\nHow many marbles do they have altogether?`,
        `${a} − ${d}`, b, `${a} + ${b}`, a + b);
    };
    const more = () => {
      const w = kid(), a = R(12, 40), d = R(4, 20), b = a + d;
      return two(`${w.n} read **${a}** pages on Monday. On Tuesday ${w.he} read **${d}** more pages than on Monday.\nHow many pages did ${w.he} read on the two days?`,
        `${a} + ${d}`, b, `${a} + ${b}`, a + b);
    };
    const mulAdd = () => {
      const w = kid(), p = pick([2, 3, 4, 5, 10]), n = R(2, 6), e = R(3, 15);
      return two(`${w.n} buys **${n}** packs of pens. Each pack has **${p}** pens. ${w.He} also has **${e}** pens at home.\nHow many pens does ${w.he} have now?`,
        `${n} × ${p}`, n * p, `${n * p} + ${e}`, n * p + e,
        { visual: { type: 'barModel', rows: [{ label: 'packs', parts: n, value: String(p) }] } });
    };
    const subSub = () => {
      const a = R(50, 99), b = R(10, 30), c = R(5, a - b - 3), v1 = a - b;
      return two(`A baker made **${a}** cakes. **${b}** cakes were sold in the morning and **${c}** in the afternoon.\nHow many cakes are left?`,
        `${a} − ${b}`, v1, `${v1} − ${c}`, v1 - c);
    };
    const school = () => {
      const g = R(120, 300), b = R(120, 300), t = R(100, g + b - 50), v1 = g + b;
      return two(`A school has **${g}** girls and **${b}** boys. **${t}** children go on a trip.\nHow many children stay at school?`,
        `${g} + ${b}`, v1, `${v1} − ${t}`, v1 - t);
    };
    const mulSub = () => {
      const w = kid(), p = pick([4, 5, 8, 10]), n = R(2, 6), u = R(1, n * p - 1);
      return two(`A box holds **${p}** eggs. ${w.n} buys **${n}** boxes and uses **${u}** eggs.\nHow many eggs are left?`,
        `${n} × ${p}`, n * p, `${n * p} − ${u}`, n * p - u,
        { visual: { type: 'barModel', rows: [{ label: 'boxes', parts: n, value: String(p) }] } });
    };
    const divAdd = () => {
      const k = pick([2, 3, 4, 5]), q = R(3, 10), e = R(2, 6);
      return two(`**${k * q}** sweets are shared equally between **${k}** children. Then each child gets **${e}** more sweets.\nHow many sweets does each child have now?`,
        `${k * q} ÷ ${k}`, q, `${q} + ${e}`, q + e);
    };
    const shop3 = () => {
      const a = R(300, 900), b = R(60, Math.floor(a / 2)), c = R(40, a - b - 20), v1 = a - b;
      return two(`A shop had **${a}** books. It sold **${b}** books on Monday and **${c}** books on Tuesday.\nHow many books are left?`,
        `${a} − ${b}`, v1, `${v1} − ${c}`, v1 - c);
    };

    PMLM.registerSkill({
      id: 'g3.twoStep', grade: 3, unit: 'g3.u2', title: 'Two-step problems', icon: '🧩',
      blurb: 'Solve word problems that need two steps',
      lesson: [
        { title: 'Read it twice',
          text: 'Some problems need **two steps**.\nRead the problem carefully. What do you know? What do you need to find?\nDo one step at a time.' },
        { title: 'Picture the problem',
          text: 'Mia has 24 stickers. She gets 15 more, then gives away 10.\n**Step 1:** 24 + 15 = 39\n**Step 2:** 39 − 10 = 29\nShe has **29** stickers.',
          visual: { type: 'numberLine', min: 20, max: 40, step: 1, labelEvery: 5, jumps: [{ from: 24, to: 39, label: '+15' }, { from: 39, to: 29, label: '−10' }] } },
        { title: 'Clue words',
          text: '**altogether, total, more** → often add\n**left, fewer, difference, gave away** → often take away\n**each, groups of, packs of** → often multiply\n**shared equally** → divide\n**Tip:** check that your answer makes sense!' },
        { title: 'Groups first',
          text: 'Ali buys 3 packs of 5 pens. He already has 4 pens.\n**Step 1:** 3 × 5 = 15 pens in the packs.\n**Step 2:** 15 + 4 = 19 pens.',
          visual: { type: 'barModel', rows: [{ label: 'packs', parts: 3, value: '5' }] } },
        { title: 'Worked example',
          text: 'A bus has 36 people. At a stop, 12 get off and 19 get on. How many people are on the bus now?\n**1.** 12 get off: 36 − 12 = 24.\n**2.** 19 get on: 24 + 19 = 43.\nAnswer: **43** people' },
      ],
      gen(level, ctx) {
        // re-roll when the answer just repeats a number from the question (e.g. 15 get off, 15 get on)
        const fresh = f => (L, c) => retry(() => {
          const r = f(L, c), given = (r.q.match(/\*\*(\d+)\*\*/g) || []).map(s => +s.replace(/\*/g, ''));
          return given.includes(r.answer) ? null : r;
        });
        return byLevel(level, [
          [getsGives, bus, threeAdd],
          [fewer, more, mulAdd, subSub],
          [school, mulSub, divAdd, shop3, fewer],
        ].map(set => set.map(fresh)), ctx);
      },
    });
  }

  // ═══════════════════════ Unit 3: Multiply and divide ═══════════════════════
  PMLM.registerUnit({ id: 'g3.u3', grade: 3, name: 'Multiply and divide', icon: '✖️' });

  /* 11 ── Times tables 2, 3, 4, 5, 8, 10 */
  {
    const tHints = (a, t) => {
      switch (t) {
        case 2: return ['× 2 means double.', `Double ${a} means ${a} + ${a}.`];
        case 3: return ['× 3 is three lots. Work out × 2, then add one more lot.', `${a} × 2 = ${a * 2}. Now add one more ${a}.`];
        case 4: return ['× 4 means double, then double again.', `Double ${a} is ${a * 2}. Now double that.`];
        case 5: return ['× 5 is half of × 10.', `${a} × 10 = ${a * 10}. Now find half of it.`];
        case 8: return ['× 8 means double, double and double again.', `Double ${a} is ${a * 2}. Double again: ${a * 4}. Now double once more.`];
        default: return ['× 10 makes a number ten times bigger. The digits move one place to the left.', `${a} × 10 means ${a} tens. Count in 10s, ${a} times, using your fingers.`];
      }
    };
    const T1 = [2, 5, 10], T2 = [3, 4, 8, 3, 4, 8, 2, 5], TALL = [2, 3, 4, 5, 8, 10];

    const mulArray = () => {
      const t = pick(T1), a = R(3, 10);
      return num(`Work out **${a} × ${t}**.`, a * t,
        [`${a} × ${t} means ${a} rows of ${t}. Count in ${t}s.`,
          `Count in ${t}s, one row at a time: ${t}, ${2 * t}, … Stop when you have counted all ${a} rows.`],
        `${a} rows of ${t} make ${a * t}. So ${a} × ${t} = ${a * t}.`,
        { visual: { type: 'array', rows: a, cols: t } });
    };

    const mulFact = L => {
      const t = pick(L === 2 ? T2 : TALL), a = R(2, 10), flip = coin();
      return num(`Work out **${flip ? `${t} × ${a}` : `${a} × ${t}`}**.`, a * t, tHints(a, t),
        `${a} × ${t} = ${a * t}.${flip ? ` (${t} × ${a} is the same as ${a} × ${t}.)` : ''}`);
    };

    const missingFactor = L => {
      const t = pick(L === 1 ? T1 : TALL), a = R(2, 10), p = a * t;
      return num(`Find the missing number.\n${coin() ? `□ × ${t} = ${p}` : `${t} × □ = ${p}`}`, a,
        [`Count in ${t}s until you reach ${p}. How many ${t}s did you count?`,
          `${t}, ${2 * t}, ${3 * t}, … Keep counting to ${p}, using your fingers.`],
        `${a} × ${t} = ${p}, so the missing number is ${a}.`);
    };

    const divFact = L => {
      const t = pick(L === 2 ? T2 : TALL), a = R(2, 10), p = a * t;
      return num(`Work out **${p} ÷ ${t}**.`, a,
        [`Division is the opposite of multiplication. Think: what × ${t} = ${p}?`,
          `Count in ${t}s up to ${p}: ${t}, ${2 * t}, ${3 * t}, … How many ${t}s?`],
        `${a} × ${t} = ${p}, so ${p} ÷ ${t} = ${a}.`);
    };

    const CTX = {
      2: ['A pair of socks has 2 socks. How many socks are in **N** pairs?', 'Each child has 2 hands. How many hands do **N** children have?'],
      3: ['A tricycle has 3 wheels. How many wheels do **N** tricycles have?', 'A triangle has 3 sides. How many sides do **N** triangles have?'],
      4: ['A dog has 4 legs. How many legs do **N** dogs have?', 'A car has 4 wheels. How many wheels do **N** cars have?'],
      5: ['A hand has 5 fingers. How many fingers are on **N** hands?', 'A star has 5 points. How many points do **N** stars have?'],
      8: ['A spider has 8 legs. How many legs do **N** spiders have?', 'An octopus has 8 arms. How many arms do **N** octopuses have?'],
      10: ['A box holds 10 pencils. How many pencils are in **N** boxes?', 'A pack has 10 stickers. How many stickers are in **N** packs?'],
    };
    const wordMul = L => {
      const t = pick(L === 2 ? [3, 4, 8, 5, 2] : TALL), a = R(3, 10);
      return num(pick(CTX[t]).replace('N', a), a * t,
        [`There are ${a} lots of ${t}. Multiply: ${a} × ${t}.`, tHints(a, t)[1]],
        `${a} × ${t} = ${a * t}.`);
    };

    const wordDiv = () => {
      const t = pick([2, 3, 4, 5, 8, 10]), a = R(2, 10), p = a * t;
      if (coin()) return num(`**${p}** pencils are put into packs of **${t}**.\nHow many packs are there?`, a,
        [`How many groups of ${t} make ${p}? Work out ${p} ÷ ${t}.`, `Count in ${t}s up to ${p}: ${t}, ${2 * t}, ${3 * t}, …`],
        `${p} ÷ ${t} = ${a}, because ${a} × ${t} = ${p}. There are ${a} packs.`);
      return num(`**${p}** children stand in **${t}** equal lines.\nHow many children are in each line?`, a,
        [`Share ${p} equally into ${t} lines. Work out ${p} ÷ ${t}.`, `Think: ${t} × □ = ${p}. Count in ${t}s up to ${p}.`],
        `${p} ÷ ${t} = ${a}, because ${t} × ${a} = ${p}. There are ${a} children in each line.`);
    };

    const missingDiv = () => {
      const t = pick([2, 3, 4, 5, 8, 10]), a = R(2, 10), p = a * t;
      if (coin()) return num(`Find the missing number.\n□ ÷ ${t} = ${a}`, p,
        ['Work backwards: the opposite of ÷ is ×.', `□ = ${a} × ${t}.`],
        `${a} × ${t} = ${p}, so ${p} ÷ ${t} = ${a}. The missing number is ${p}.`);
      return num(`Find the missing number.\n${p} ÷ □ = ${a}`, t,
        [`Think: ${a} × □ = ${p}.`, `How many lots of ${a} make ${p}? Count in ${a}s: ${a}, ${2 * a}, ${3 * a}, …`],
        `${a} × ${t} = ${p}, so ${p} ÷ ${t} = ${a}. The missing number is ${t}.`);
    };

    const family = () => {
      const [a, b] = U.sample([2, 3, 4, 5, 8, 10], 2), p = a * b, ans = coin() ? `${p} ÷ ${b} = ${a}` : `${p} ÷ ${a} = ${b}`;
      return choice(`Which division fact goes with **${a} × ${b} = ${p}**?`, ans,
        [`${a} ÷ ${b} = ${p}`, `${b} ÷ ${p} = ${a}`, `${p} ÷ ${b} = ${a + 1}`],
        [`In a division fact, start with the biggest number, ${p}.`, `${p} ÷ ${b} asks: how many ${b}s make ${p}?`],
        `${a} × ${b} = ${p}, so ${p} ÷ ${b} = ${a} and ${p} ÷ ${a} = ${b}. The answer is ${ans}.`);
    };

    PMLM.registerSkill({
      id: 'g3.tables', grade: 3, unit: 'g3.u3', title: 'Times tables', icon: '✖️',
      blurb: 'The 2, 3, 4, 5, 8 and 10 tables and division facts',
      lesson: [
        { title: 'Equal groups',
          text: '**3 × 4** means 3 groups of 4.\n4 + 4 + 4 = **12**',
          visual: { type: 'objects', groups: [4, 4, 4], emoji: '🍓' } },
        { title: 'Arrays',
          text: 'An **array** shows rows and columns.\n2 rows of 5 = 2 × 5 = **10**.\nTurn it round: 5 × 2 = 10 too. The order does not matter!',
          visual: { type: 'array', rows: 2, cols: 5 } },
        { title: 'Table tricks',
          text: '**× 2:** double.\n**× 4:** double, then double again.\n**× 8:** double, double, double!\n**× 10:** the digits move one place left: 7 × 10 = 70.\n**× 5:** half of × 10: 6 × 5 = 30.' },
        { title: 'Division undoes multiplication',
          text: 'If **3 × 4 = 12**, then **12 ÷ 4 = 3** and **12 ÷ 3 = 4**.\n12 shared into 3 equal rows is 4 in each row.',
          visual: { type: 'array', rows: 3, cols: 4 } },
        { title: 'Worked example',
          text: 'Work out **7 × 8**.\n**1.** × 8 means double three times.\n**2.** Double 7 = 14.\n**3.** Double 14 = 28.\n**4.** Double 28 = 56.\nAnswer: **56**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [mulArray, mulArray, missingFactor],
          [mulFact, mulFact, divFact, wordMul, missingFactor],
          [mulFact, divFact, wordDiv, missingDiv, family, wordMul],
        ], ctx);
      },
    });
  }

  /* 12 ── 2-digit × 1-digit */
  {
    const split = n => [Math.floor(n / 10) * 10, n % 10];
    const grid = (n, m) => { const [t, o] = split(n); return { type: 'table', headers: ['×', String(t), String(o)], rows: [[String(m), '?', '?']] }; };
    const mHints = (n, m) => {
      const [t, o] = split(n);
      return ['Split the number into tens and ones. Multiply each part, then add.',
        `${n} = ${t} + ${o}. ${t} × ${m} = ${t * m}. Now work out ${o} × ${m} and add.`];
    };
    const mExplain = (n, m) => {
      const [t, o] = split(n);
      return `${t} × ${m} = ${t * m} and ${o} × ${m} = ${o * m}.\n${t * m} + ${o * m} = ${n * m}. So ${n} × ${m} = ${n * m}.`;
    };
    const pickN = (lo, hi) => retry(() => { const v = R(lo, hi); return v % 10 ? v : null; });

    const teens = () => {
      const n = R(11, 19), m = R(2, 5);
      return num(`Work out **${n} × ${m}**.`, n * m, mHints(n, m), mExplain(n, m),
        { visual: n <= 12 ? { type: 'array', rows: m, cols: n } : grid(n, m) });
    };

    const tensTimes = () => {
      const t = R(2, 9), m = R(2, 5);
      return num(`Work out **${t * 10} × ${m}**.`, t * m * 10,
        [`Use a table fact first: ${t} × ${m}. Then make it tens.`,
          `${t} × ${m} = ${t * m}. So ${t} tens × ${m} = ${t * m} tens.`],
        `${t} × ${m} = ${t * m}, so ${t * 10} × ${m} = ${t * m} tens = ${t * m * 10}.`);
    };

    const rows = () => {
      const m = R(2, 5), n = R(11, 19), thing = pick([['chairs', '🪑'], ['flowers', '🌷'], ['stars', '⭐'], ['apples', '🍎']]);
      return num(`There are **${m}** rows of ${thing[0]}. Each row has **${n}** ${thing[0]}.\nHow many ${thing[0]} are there?`, n * m,
        [`Work out ${m} × ${n}. ${mHints(n, m)[0]}`, mHints(n, m)[1]], mExplain(n, m),
        n <= 12 ? { visual: { type: 'array', rows: m, cols: n, emoji: thing[1] } } : {});
    };

    const general = L => {
      const n = L === 2 ? pickN(21, 49) : pickN(21, 99), m = R(2, 5);
      return num(`Work out **${n} × ${m}**.`, n * m, mHints(n, m), mExplain(n, m), L === 2 ? { visual: grid(n, m) } : {});
    };

    const mistakes = L => {
      const n = L === 2 ? pickN(21, 49) : pickN(21, 99), m = R(2, 5), [t, o] = split(n), p = n * m;
      const wrongs = [t + o * m, (t / 10) * m + o * m, p - 10, p + 10];
      if (o * m >= 10) wrongs.unshift(+`${(t / 10) * m}${o * m}`);
      return choice(`Work out **${n} × ${m}**.`, p, wrongs.filter(v => v > 0 && v < 10000), mHints(n, m), mExplain(n, m));
    };

    const partial = () => {
      const n = retry(() => { const v = pickN(21, 49); return v % 10 >= 2 ? v : null; }), m = R(2, 5), [t, o] = split(n);
      if (coin()) return num(`Find the missing number.\n${n} × ${m} = ${t * m} + □`, o * m,
        [`Split ${n} into ${t} and ${o}. ${t} × ${m} = ${t * m} is already there.`, `The missing part is ${o} × ${m}.`],
        `${n} × ${m} = ${t} × ${m} + ${o} × ${m} = ${t * m} + ${o * m}. The missing number is ${o * m}.`);
      return num(`Find the missing number.\n${n} × ${m} = □ + ${o * m}`, t * m,
        [`Split ${n} into ${t} and ${o}. ${o} × ${m} = ${o * m} is already there.`, `The missing part is ${t} × ${m}. Use ${t / 10} × ${m} = ${(t / 10) * m}.`],
        `${n} × ${m} = ${t} × ${m} + ${o} × ${m} = ${t * m} + ${o * m}. The missing number is ${t * m}.`);
    };

    const word = (L, ctx) => {
      const n = pickN(21, 99), m = R(2, 5), cur = ctx.currency, w = kid();
      const t = R(1, 4);
      if (t === 1) return num(`One T-shirt costs **${money(cur, n)}**.\nHow much do **${m}** T-shirts cost?`, n * m, mHints(n, m), mExplain(n, m), { prefix: cur });
      const q = t === 2 ? `A pack has **${n}** crayons.\nHow many crayons are in **${m}** packs?`
        : t === 3 ? `A bus has **${n}** seats.\nHow many seats are there on **${m}** buses?`
          : `${w.n} reads **${n}** pages every day.\nHow many pages does ${w.he} read in **${m}** days?`;
      return num(q, n * m, mHints(n, m), mExplain(n, m));
    };

    const spot = () => {
      const n = pickN(21, 99), m = R(2, 5), [t, o] = split(n), w = kid(), d = t / 10;
      return num(`${w.n} says **${n} × ${m} = ${d * m + o * m}**.\n${w.He} did ${d} × ${m} = ${d * m} and ${o} × ${m} = ${o * m}, then added.\nWhat is the correct answer?`, n * m,
        [`What is the ${d} in ${n} really worth?`, `The ${d} in ${n} means ${t}. ${t} × ${m} = ${t * m}.`],
        `The ${d} in ${n} is ${tens(d)}, so it is ${t}. ${mExplain(n, m)}`);
    };

    PMLM.registerSkill({
      id: 'g3.mul2d', grade: 3, unit: 'g3.u3', title: '2-digit × 1-digit', icon: '🔲',
      blurb: 'Multiply numbers like 23 × 4 by splitting them',
      lesson: [
        { title: 'Tens times a number',
          text: 'To multiply tens, use your tables.\n3 × 4 = 12, so **30 × 4 = 120**.\nThink: 3 tens × 4 = 12 tens = 120.',
          visual: { type: 'base10', n: 120 } },
        { title: 'Split the number',
          text: 'To work out **23 × 4**, split 23 into tens and ones: **20** and **3**.\nThen multiply each part by 4.',
          visual: { type: 'table', headers: ['×', '20', '3'], rows: [['4', '?', '?']] } },
        { title: 'The grid method',
          text: 'Fill in the grid:\n20 × 4 = **80**\n3 × 4 = **12**\nThen add: 80 + 12 = **92**.\nSo 23 × 4 = 92.',
          visual: { type: 'table', headers: ['×', '20', '3'], rows: [['4', '80', '12']] } },
        { title: 'Arrays show it too',
          text: '4 rows of 12 = 4 rows of 10 + 4 rows of 2.\n40 + 8 = **48**\nSo 12 × 4 = 48.',
          visual: { type: 'array', rows: 4, cols: 12 } },
        { title: 'Worked example',
          text: 'Work out **36 × 5**.\n**1.** Split 36 into 30 and 6.\n**2.** 30 × 5 = 150\n**3.** 6 × 5 = 30\n**4.** 150 + 30 = 180\nAnswer: **180**',
          visual: { type: 'table', headers: ['×', '30', '6'], rows: [['5', '150', '30']] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [teens, tensTimes, rows],
          [general, mistakes, partial, tensTimes],
          [general, word, spot, mistakes],
        ], ctx);
      },
    });
  }

  /* 13 ── Division with remainders */
  {
    const THINGS = [['sweets', '🍬'], ['stickers', '⭐'], ['apples', '🍎'], ['cookies', '🍪'], ['marbles', '🔵']];
    const rText = (q, r) => `${q} r ${r}`;
    const pickDR = (L, maxN) => retry(() => {
      const d = L === 1 ? R(2, 5) : pick([2, 3, 4, 5, 3, 4, 5]), q = L === 1 ? R(1, 6) : L === 2 ? R(2, 10) : R(3, 12), r = R(1, d - 1);
      const n = d * q + r;
      if (maxN && n > maxN) return null;
      return { n, d, q, r };
    });
    const dHints = ({ n, d }) => [`Find the biggest number in the ${d} times table that is not more than ${n}.`,
      `Count in ${d}s: ${d}, ${2 * d}, ${3 * d}, … Stop before you go past ${n}.`];
    const dExplain = ({ n, d, q, r }) => `${q} × ${d} = ${q * d}, and ${n} − ${q * d} = ${r}. So ${n} ÷ ${d} = ${q} r ${r}.`;

    const share = () => {
      const x = pickDR(1, 20), [thing, e] = pick(THINGS), each = coin();
      return num(`Share **${x.n}** ${thing} equally between **${x.d}** children.\n${each ? 'How many does each child get?' : 'How many are left over?'}`, each ? x.q : x.r,
        ['Give them out one at a time to each child, round and round, until there are not enough to go round again.',
          `Count in ${x.d}s: ${x.d}, ${2 * x.d}, … Stop before you go past ${x.n}.`],
        `${x.d} × ${x.q} = ${x.d * x.q}. ${x.n} − ${x.d * x.q} = ${x.r}. Each child gets ${x.q} and ${x.r} ${x.r === 1 ? 'is' : 'are'} left over.`,
        { visual: { type: 'objects', groups: [x.n], emoji: e } });
    };

    const groups = L => {
      const x = pickDR(L, L === 1 ? 20 : 0), [thing, e] = pick(THINGS);
      return num(`How many groups of **${x.d}** can you make from **${x.n}** ${thing}?`, x.q,
        [`Make groups of ${x.d} until there are not enough left for another group.`,
          `Count in ${x.d}s: ${x.d}, ${2 * x.d}, … Stop before you go past ${x.n}.`],
        `${x.q} groups of ${x.d} make ${x.q * x.d}, with ${x.r} left over. So you can make ${x.q} groups.`,
        L === 1 ? { visual: { type: 'objects', groups: [x.n], emoji: e } } : {});
    };

    const remChoice = L => {
      const x = pickDR(L), { n, d, q, r } = x;
      const wrongs = [rText(q - 1, r + d), rText(q + 1, d - r), rText(q, r + 1 < d ? r + 1 : r - 1)];
      if (r !== q) wrongs.push(rText(r, q));
      return choice(`Work out **${n} ÷ ${d}**.`, rText(q, r), wrongs, dHints(x), dExplain(x));
    };

    const remOnly = L => {
      const x = pickDR(L);
      return num(`What is the remainder when **${x.n}** is divided by **${x.d}**?`, x.r, dHints(x), `${dExplain(x)} The remainder is ${x.r}.`);
    };

    const tables = () => {
      const x = pickDR(3);
      return num(`**${x.n}** children are going to a party. **${x.d}** children can sit at each table.\nHow many tables are needed so every child has a seat?`, x.q + 1,
        [`Work out ${x.n} ÷ ${x.d}. Then think about the children who are left over.`,
          `Count in ${x.d}s: ${x.d}, ${2 * x.d}, … How many full tables can you make? Some children still need a seat.`],
        `${dExplain(x)} ${x.q} tables are full, and the ${x.r === 1 ? 'child' : `${x.r} children`} left over ${x.r === 1 ? 'needs' : 'need'} one more table. So ${x.q + 1} tables are needed.`);
    };

    const boxes = () => {
      const x = pickDR(3);
      return num(`A box holds **${x.d}** cakes. There are **${x.n}** cakes.\nHow many boxes can be filled completely?`, x.q,
        [`Work out ${x.n} ÷ ${x.d}. A box only counts if it is full.`,
          `Count in ${x.d}s: ${x.d}, ${2 * x.d}, … How many full boxes before you go past ${x.n}?`],
        `${dExplain(x)} The ${x.r === 1 ? 'cake' : `${x.r} cakes`} left over can't fill a box. So ${x.q} boxes can be filled.`);
    };

    const spot = () => {
      const x = retry(() => { const v = pickDR(3); return v.q >= 2 ? v : null; }), { n, d, q, r } = x, w = kid();
      const bad = rText(q - 1, r + d);
      return choice(`${w.n} says **${n} ÷ ${d} = ${bad}**.\nWhat is the correct answer?`, rText(q, r),
        [bad, rText(q + 1, d - r), rText(q, r + 1 < d ? r + 1 : r - 1)],
        ['A remainder must always be smaller than the number you divide by.',
          `${r + d} is bigger than ${d}, so another group of ${d} fits.`],
        `${w.n}'s remainder was too big. ${dExplain(x)}`);
    };

    const missingRem = () => {
      const x = pickDR(3), { n, d, q, r } = x;
      return num(`Find the missing number.\n□ ÷ ${d} = ${q} r ${r}`, n,
        ['Work backwards: multiply, then add the remainder.', `${q} × ${d} = ${q * d}. Now add the remainder.`],
        `${q} × ${d} = ${q * d}, and ${q * d} + ${r} = ${n}. So ${n} ÷ ${d} = ${q} r ${r}.`);
    };

    PMLM.registerSkill({
      id: 'g3.remainders', grade: 3, unit: 'g3.u3', title: 'Division with remainders', icon: '🍪',
      blurb: 'Share and group, and find what is left over',
      lesson: [
        { title: 'Sharing equally',
          text: '**14 ÷ 3**: share 14 sweets between 3 children.\nEach child gets **4**, and **2** are left over.\nWe write **14 ÷ 3 = 4 r 2** (r means remainder).\nThe last circle shows the 2 left over.',
          visual: { type: 'objects', groups: [4, 4, 4, 2], emoji: '🍬' } },
        { title: 'Grouping',
          text: '**17 ÷ 5**: how many groups of 5 can you make from 17?\n3 groups of 5 = 15. **2** are left over.\n17 ÷ 5 = **3 r 2**',
          visual: { type: 'objects', groups: [5, 5, 5, 2], emoji: '⭐' } },
        { title: 'Use your times tables',
          text: '**23 ÷ 4**: count in 4s: 4, 8, 12, 16, 20, 24 …\n24 is too big, so use **20**. 20 = 5 × 4.\n23 − 20 = **3** left over.\nSo 23 ÷ 4 = **5 r 3**.',
          visual: { type: 'numberLine', min: 0, max: 24, step: 1, labelEvery: 4, jumps: [{ from: 0, to: 4 }, { from: 4, to: 8 }, { from: 8, to: 12 }, { from: 12, to: 16 }, { from: 16, to: 20 }], points: [{ at: 23, label: '23' }] } },
        { title: 'The remainder is always smaller',
          text: 'The remainder must be **smaller** than the number you divide by.\nWhen you divide by 4, the remainder can only be 0, 1, 2 or 3.\nIf it is bigger, you can make another group!' },
        { title: 'Worked example',
          text: 'Work out **29 ÷ 3**.\n**1.** Count in 3s: 3, 6, 9, … 27, 30.\n**2.** 30 is too big, so use **27**. 27 = 9 × 3.\n**3.** 29 − 27 = **2** left over.\nAnswer: **9 r 2**' },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [share, share, groups],
          [remChoice, remOnly, groups, remChoice],
          [remChoice, tables, boxes, spot, missingRem],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 4: Fractions ═══════════════════════
  PMLM.registerUnit({ id: 'g3.u4', grade: 3, name: 'Fractions', icon: '🍕' });

  const PART = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'],
    6: ['sixth', 'sixths'], 8: ['eighth', 'eighths'], 10: ['tenth', 'tenths'] };
  const partName = (k, d) => (k === 1 ? PART[d][0] : PART[d][1]);

  /* 14 ── Fractions of shapes */
  {
    const pic = (parts, shaded) => (coin() ? { type: 'pie', pies: [{ parts, shaded }] } : { type: 'fractionBar', bars: [{ parts, shaded }] });
    const shadedHints = (d, k) => ['Count all the equal parts. That number goes on the bottom.',
      `There are ${d} equal parts. How many are shaded? That number goes on the top.`];

    const unitShaded = () => {
      const d = pick([2, 3, 4, 5, 10]);
      return fracQ('What fraction of the shape is shaded?', 1, d, shadedHints(d, 1),
        `There are ${d} equal parts and 1 is shaded, so ${fr(1, d)} is shaded.`, { visual: pic(d, 1) });
    };

    const nonUnit = () => {
      const d = pick([3, 4, 5, 6, 8, 10]), k = R(2, d - 1);
      return fracQ('What fraction of the shape is shaded?', k, d, shadedHints(d, k),
        `There are ${d} equal parts and ${k} are shaded, so ${fr(k, d)} is shaded.`, { visual: pic(d, k) });
    };

    const notShaded = () => {
      const d = pick([3, 4, 5, 6, 8, 10]), k = R(1, d - 1);
      return fracQ('What fraction of the shape is **not** shaded?', d - k, d,
        ['Count all the equal parts. Then count the parts that are NOT shaded.',
          `There are ${d} parts and ${k} ${k === 1 ? 'is' : 'are'} shaded. How many are white?`],
        `${d} − ${k} = ${d - k} parts are not shaded, so the answer is ${fr(d - k, d)}.`, { visual: pic(d, k) });
    };

    const toWhole = () => {
      const d = pick([3, 4, 5, 6, 8, 10]), k = retry(() => { const v = R(1, d - 1); return 2 * v !== d ? v : null; });
      return num('How many more parts must be shaded so that the **whole** shape is shaded?', d - k,
        ['The whole shape is shaded when every part is shaded.',
          `There are ${d} parts. ${k} ${k === 1 ? 'is' : 'are'} shaded already.`],
        `${d} − ${k} = ${d - k}. Shade ${d - k} more ${d - k === 1 ? 'part' : 'parts'} to make ${fr(d, d)}, one whole.`, { visual: pic(d, k) });
    };

    const whichBar = L => {
      const ds = U.sample([2, 3, 4, 5, 10], 3), i = R(0, 2), labels = ['A', 'B', 'C'];
      // no two bars may show the same amount (e.g. 1/2 and 5/10), or two answers would be right
      const sh = retry(() => {
        const s = ds.map(d => (L === 1 ? 1 : R(1, d - 1)));
        return new Set(s.map((k, j) => k / ds[j])).size === 3 ? s : null;
      });
      const target = fr(sh[i], ds[i]);
      return choice(`Which bar has **${target}** shaded?`, labels[i], labels.filter((_, j) => j !== i),
        [`Look at the bottom number: ${ds[i]}. Find the bar cut into ${ds[i]} equal parts.`,
          'Count the parts in bar A, then bar B, then bar C. Then check how many are shaded.'],
        `Bar ${labels[i]} has ${ds[i]} equal parts and ${sh[i]} ${sh[i] === 1 ? 'is' : 'are'} shaded. That is ${target}.`,
        { visual: { type: 'fractionBar', bars: ds.map((d, j) => ({ parts: d, shaded: sh[j], label: labels[j] })) } }, 3);
    };

    const largest = () => {
      const ds = U.sample([2, 3, 4, 5, 6, 8, 10], 3), labels = ['A', 'B', 'C'], big = coin();
      const best = big ? Math.min(...ds) : Math.max(...ds), i = ds.indexOf(best);
      return choice(`All the bars are the same size. Each one has 1 part shaded.\nWhich bar has the **${big ? 'largest' : 'smallest'}** fraction shaded?`, labels[i], labels.filter((_, j) => j !== i),
        ['When a whole is cut into more parts, each part is smaller.',
          `Bar A shows ${fr(1, ds[0])}, bar B shows ${fr(1, ds[1])} and bar C shows ${fr(1, ds[2])}.`],
        `${fr(1, best)} is the ${big ? 'largest' : 'smallest'}, because its bar is cut into the ${big ? 'fewest' : 'most'} parts. So the answer is bar ${labels[i]}.`,
        { visual: { type: 'fractionBar', bars: ds.map((d, j) => ({ parts: d, shaded: 1, label: labels[j] })) } }, 3);
    };

    const colours = () => {
      const d = pick([5, 6, 8, 10]), r = R(1, d - 2), b = R(1, d - r - 1), w = d - r - b;
      return fracQ(`A shape is cut into **${d}** equal parts. **${r}** ${r === 1 ? 'part is' : 'parts are'} red and **${b}** ${b === 1 ? 'part is' : 'parts are'} blue. The rest are white.\nWhat fraction of the shape is white?`, w, d,
        ['First find how many parts are white.', `${r} + ${b} = ${r + b} parts are coloured. How many of the ${d} parts are left?`],
        `${d} − ${r + b} = ${w}. ${w === 1 ? '1 part is' : `${w} parts are`} white, so ${fr(w, d)} is white.`);
    };

    const shadeMore = () => {
      const d = pick([5, 6, 8, 10]), k = R(1, d - 3), m = R(1, d - k - 1);
      return fracQ(`If you shade **${m}** more ${m === 1 ? 'part' : 'parts'}, what fraction of the bar will be shaded?`, k + m, d,
        ['Count the parts shaded now, then add the new ones. The bottom number stays the same.',
          `Now ${k} out of ${d} parts are shaded. Add ${m} more.`],
        `${k} + ${m} = ${k + m} parts out of ${d}, so ${fr(k + m, d)} will be shaded.`,
        { visual: { type: 'fractionBar', bars: [{ parts: d, shaded: k }] } });
    };

    const oneWhole = () => {
      const d = pick([3, 4, 5, 6, 8]);
      return choice('Which fraction is the same as **one whole**?', fr(d, d), [fr(1, d), fr(d - 1, d), fr(d, d * 2)],
        ['One whole means every part is shaded.',
          `Picture a shape cut into ${d} equal parts. How many parts must you shade to shade all of it?`],
        `${fr(d, d)} means ${d} out of ${d} parts. That is all of it, so ${fr(d, d)} = 1.`);
    };

    PMLM.registerSkill({
      id: 'g3.fracShapes', grade: 3, unit: 'g3.u4', title: 'Fractions of shapes', icon: '🍕',
      blurb: 'Name the fraction of a shape that is shaded',
      lesson: [
        { title: 'Equal parts',
          text: 'A fraction is a part of a whole.\nThe whole must be cut into **equal** parts.\nThis pizza has 4 equal parts. One part is **one quarter**: {1/4}.',
          visual: { type: 'pie', pies: [{ parts: 4, shaded: 1 }] } },
        { title: 'Top and bottom',
          text: 'The **bottom** number tells you how many equal parts the whole has.\nThe **top** number tells you how many parts we take.\n{3/5} means 3 out of 5 equal parts.',
          visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 3, label: '{3/5}' }] } },
        { title: 'Unit fractions',
          text: 'A **unit fraction** has **1** on top: {1/2}, {1/3}, {1/4}, {1/10}.\nThe more parts the whole is cut into, the **smaller** each part is!',
          visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '{1/2}' }, { parts: 3, shaded: 1, label: '{1/3}' }, { parts: 4, shaded: 1, label: '{1/4}' }, { parts: 10, shaded: 1, label: '{1/10}' }] } },
        { title: 'One whole',
          text: 'When every part is shaded, we have **one whole**.\n{4/4} = 1 and {10/10} = 1.',
          visual: { type: 'pie', pies: [{ parts: 4, shaded: 4 }] } },
        { title: 'Worked example',
          text: 'What fraction is shaded?\n**1.** Count all the equal parts: **5**. That is the bottom number.\n**2.** Count the shaded parts: **2**. That is the top number.\nAnswer: {2/5}',
          visual: { type: 'pie', pies: [{ parts: 5, shaded: 2 }] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [unitShaded, unitShaded, whichBar, toWhole],
          [nonUnit, nonUnit, notShaded, toWhole, whichBar],
          [colours, shadeMore, largest, oneWhole, notShaded],
        ], ctx);
      },
    });
  }

  /* 15 ── Fractions of amounts */
  {
    const THINGS = [['sweets', '🍬'], ['apples', '🍎'], ['stars', '⭐'], ['fish', '🐟'], ['cookies', '🍪']];
    const bar = (d, n, val = '?') => ({ type: 'barModel', rows: [{ label: '', parts: d, value: val }], total: String(n) });

    const unitSet = () => {
      const d = pick([2, 3, 4, 5]), q = R(2, d === 5 ? 4 : 5), n = d * q, [thing, e] = pick(THINGS);
      return num(`Find ${fr(1, d)} of **${n}**.`, q,
        [`To find ${fr(1, d)}, share into ${d} equal groups.`,
          `Share the ${n} ${thing} into ${d} equal groups. How many are in each group?`],
        `${n} ÷ ${d} = ${q}, so ${fr(1, d)} of ${n} is ${q}.`,
        { visual: { type: 'objects', groups: [n], emoji: e } });
    };

    const unitBar = () => {
      const d = pick([2, 3, 4, 5, 10]), q = R(2, 10), n = d * q;
      return num(`Find ${fr(1, d)} of **${n}**.`, q,
        [`To find ${fr(1, d)}, divide by ${d}.`, `Work out ${n} ÷ ${d}. Think: what × ${d} = ${n}?`],
        `${n} ÷ ${d} = ${q}, so ${fr(1, d)} of ${n} is ${q}.`, { visual: bar(d, n) });
    };

    const threeQ = () => {
      const q = R(2, 10), n = 4 * q;
      return num(`Find ${fr(3, 4)} of **${n}**.`, 3 * q,
        [`First find ${fr(1, 4)}, then take 3 of those parts.`, `${fr(1, 4)} of ${n} = ${n} ÷ 4 = ${q}.`],
        `${fr(1, 4)} of ${n} is ${q}. ${fr(3, 4)} is 3 lots of ${q}: 3 × ${q} = ${3 * q}.`, { visual: bar(4, n) });
    };

    const wordUnit = L => {
      const d = L === 1 ? pick([2, 4]) : pick([2, 3, 4, 5, 10]), q = L === 1 ? R(2, 6) : R(2, 10), n = d * q, w = kid();
      const t = R(1, 3);
      const q1 = t === 1 ? `There are **${n}** children in a class. ${fr(1, d)} of them walk to school.\nHow many children walk to school?`
        : t === 2 ? `A bag has **${n}** sweets. ${w.n} eats ${fr(1, d)} of them.\nHow many sweets does ${w.he} eat?`
          : `A farmer has **${n}** sheep. ${fr(1, d)} of them are black.\nHow many black sheep are there?`;
      return num(q1, q, [`${fr(1, d)} of ${n} means ${n} shared into ${d} equal groups.`, `Work out ${n} ÷ ${d}.`],
        `${n} ÷ ${d} = ${q}, so the answer is ${q}.`, L === 1 ? { visual: bar(d, n) } : {});
    };

    const FR3 = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 10], [7, 10], [3, 4], [2, 3]];
    const nonUnit = () => {
      const [k, d] = pick(FR3), q = R(2, 10), n = d * q;
      return num(`Find ${fr(k, d)} of **${n}**.`, k * q,
        [`First find ${fr(1, d)}, then take ${k} of those parts.`, `${fr(1, d)} of ${n} = ${n} ÷ ${d} = ${q}.`],
        `${fr(1, d)} of ${n} is ${q}. ${fr(k, d)} is ${k} lots of ${q}: ${k} × ${q} = ${k * q}.`, { visual: bar(d, n) });
    };

    const missingWhole = () => {
      const d = pick([2, 3, 4, 5, 10]), q = R(2, 10), n = d * q;
      return num(`Find the missing number.\n${fr(1, d)} of □ = ${q}`, n,
        [`If ${fr(1, d)} is ${q}, then the whole is ${d} parts of ${q}.`, `Each of the ${d} boxes holds ${q}. Work out ${d} × ${q}.`],
        `${d} × ${q} = ${n}. Check: ${fr(1, d)} of ${n} = ${n} ÷ ${d} = ${q}.`,
        { visual: { type: 'barModel', rows: [{ label: '', parts: d, value: String(q) }], total: '?' } });
    };

    const spot = () => {
      const [k, d] = pick(FR3), q = R(2, 10), n = d * q, w = kid();
      return num(`${w.n} says ${fr(k, d)} of **${n}** is **${q}**.\nWhat is the correct answer?`, k * q,
        [`${w.n} found only ${fr(1, d)}. How many ${PART[d][1]} do you need?`, `${fr(1, d)} of ${n} is ${q}. You need ${k} of those parts.`],
        `${w.n} stopped at ${fr(1, d)}. ${fr(k, d)} of ${n} is ${k} × ${q} = ${k * q}.`);
    };

    const wordNonUnit = () => {
      const [k, d] = pick([[3, 4], [2, 3], [3, 10], [2, 5]]), q = R(2, 10), n = d * q, w = kid();
      return num(`${w.n} has **${n}** marbles. ${w.He} gives ${fr(k, d)} of them to a friend.\nHow many marbles does ${w.he} give away?`, k * q,
        [`First find ${fr(1, d)} of ${n}, then take ${k} of those parts.`, `${fr(1, d)} of ${n} = ${n} ÷ ${d} = ${q}.`],
        `${fr(1, d)} of ${n} is ${q}, so ${fr(k, d)} is ${k} × ${q} = ${k * q}.`);
    };

    PMLM.registerSkill({
      id: 'g3.fracAmounts', grade: 3, unit: 'g3.u4', title: 'Fractions of amounts', icon: '🍬',
      blurb: 'Find a fraction of a number, like ¾ of 20',
      lesson: [
        { title: 'Half of a set',
          text: 'To find {1/2} of 10, share 10 into **2** equal groups.\nEach group has 5.\nSo {1/2} of 10 = **5**.',
          visual: { type: 'objects', groups: [5, 5], emoji: '🍎' } },
        { title: 'Divide by the bottom number',
          text: 'To find {1/3} of 12, share 12 into **3** equal groups.\n12 ÷ 3 = 4, so {1/3} of 12 = **4**.\n**Tip:** to find a unit fraction, divide by the bottom number.',
          visual: { type: 'objects', groups: [4, 4, 4], emoji: '🍬' } },
        { title: 'More than one part',
          text: 'To find {3/4} of 20:\nFirst find {1/4}: 20 ÷ 4 = **5**.\nThen take **3** of those parts: 3 × 5 = **15**.',
          visual: { type: 'barModel', rows: [{ label: '', parts: 4, value: '5' }], total: '20' } },
        { title: 'Worked example',
          text: 'Find {2/3} of 15.\n**1.** Find {1/3}: 15 ÷ 3 = 5.\n**2.** We need **2** thirds: 2 × 5 = 10.\nAnswer: {2/3} of 15 = **10**',
          visual: { type: 'barModel', rows: [{ label: '', parts: 3, value: '5' }], total: '15' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [unitSet, unitSet, wordUnit],
          [unitBar, threeQ, wordUnit, unitBar],
          [nonUnit, missingWhole, spot, nonUnit, wordNonUnit],
        ], ctx);
      },
    });
  }

  /* 16 ── Equivalent fractions, comparing, adding */
  {
    const SIGNS = ['<', '>', '='];
    const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');

    const missing = L => {
      const [d, D] = pick(L === 1 ? [[2, 4], [2, 10], [2, 6]] : [[2, 4], [2, 10], [5, 10], [4, 8], [2, 8]]);
      const k = R(1, d - 1), f = D / d, K = k * f, askDen = L >= 2 && coin(0.35);
      if (askDen) return num(`Find the missing number.\n${fr(k, d)} = {${K}/□}`, D,
        ['Equivalent fractions cover the same amount. Multiply the top and the bottom by the same number.',
          `The top number went from ${k} to ${K}. What was ${k} multiplied by? Do the same to the bottom number.`],
        `${fr(k, d)} = ${fr(K, D)}, because the top and the bottom were both multiplied by ${f}. The missing number is ${D}.`);
      return num(`Find the missing number.\n${fr(k, d)} = {□/${D}}`, K,
        ['Equivalent fractions cover the same amount. Multiply the top and the bottom by the same number.',
          `The bottom number went from ${d} to ${D}. What was ${d} multiplied by? Do the same to the top number.`],
        `${fr(k, d)} = ${fr(K, D)}, because the top and the bottom were both multiplied by ${f}. The missing number is ${K}.`,
        L < 3 ? { visual: { type: 'fractionBar', bars: [{ parts: d, shaded: k, label: fr(k, d) }, { parts: D, shaded: 0, label: `{?/${D}}` }] } } : {});
    };

    const cmpSame = L => {
      const d = pick([4, 5, 6, 8, 10]), a = R(1, d - 1), b = retry(() => { const v = R(1, d - 1); return v !== a ? v : null; });
      const s = sign(a, b);
      return choice(`Which sign goes in the box?\n${fr(a, d)} □ ${fr(b, d)}`, s, SIGNS,
        ['The bottom numbers are the same, so the parts are the same size. Compare the top numbers.',
          `${fr(a, d)} is ${pl(a, 'part')}. ${fr(b, d)} is ${pl(b, 'part')}.`],
        `${cap(pl(a, 'part'))} ${a > b ? 'is more than' : 'is less than'} ${pl(b, 'part')}, so ${fr(a, d)} ${s} ${fr(b, d)}.`,
        L === 1 ? { visual: { type: 'fractionBar', bars: [{ parts: d, shaded: a, label: fr(a, d) }, { parts: d, shaded: b, label: fr(b, d) }] } } : null, 3);
    };

    const whichEqual = () => {
      const SETS = [
        { f: [1, 2], ok: [[2, 4], [5, 10]], bad: [[1, 4], [2, 5], [2, 2], [4, 10], [1, 3]] },
        { f: [1, 5], ok: [[2, 10]], bad: [[1, 10], [2, 5], [5, 10], [5, 1]] },
        { f: [2, 5], ok: [[4, 10]], bad: [[2, 10], [4, 5], [3, 10], [5, 2]] },
        { f: [3, 4], ok: [[6, 8]], bad: [[3, 8], [6, 4], [4, 5], [4, 3]] },
        { f: [1, 4], ok: [[2, 8]], bad: [[1, 8], [2, 4], [4, 1], [3, 4]] },
      ];
      const s = pick(SETS), [n, d] = s.f, [a, b] = pick(s.ok);
      return choice(`Which fraction is equal to ${fr(n, d)}?`, fr(a, b), U.sample(s.bad, 3).map(([x, y]) => fr(x, y)),
        ['Equivalent fractions: multiply the top and the bottom by the same number.',
          `Try multiplying the top and bottom of ${fr(n, d)} by 2, then by 5. Do you get one of the choices?`],
        `${fr(n, d)} = ${fr(a, b)}: the top and the bottom were both multiplied by ${a / n}.`);
    };

    const addSub = () => {
      const d = pick([4, 5, 6, 8, 10]), sub = coin(0.4);
      let a, b;
      if (sub) { a = R(2, d - 1); b = R(1, a - 1); } else { a = R(1, d - 2); b = R(1, d - 1 - a); }
      const res = sub ? a - b : a + b, op = sub ? M : '+';
      return fracQ(`Work out ${fr(a, d)} ${op} ${fr(b, d)}.`, res, d,
        [`The bottom numbers are the same, so ${sub ? 'take away' : 'add'} the top numbers. The bottom number stays ${d}.`,
          `Top numbers: ${a} ${op} ${b}.`],
        `${a} ${op} ${b} = ${res}, and the bottom stays ${d}. So the answer is ${fr(res, d)}.`,
        { visual: { type: 'fractionBar', bars: sub ? [{ parts: d, shaded: a, label: fr(a, d) }] : [{ parts: d, shaded: a, label: fr(a, d) }, { parts: d, shaded: b, label: fr(b, d) }] } });
    };

    const cmpUnit = () => {
      const [x, y] = U.sample([2, 3, 4, 5, 6, 8, 10], 2), s = x < y ? '>' : '<';
      return choice(`Which sign goes in the box?\n${fr(1, x)} □ ${fr(1, y)}`, s, SIGNS,
        ['Both top numbers are 1. The more parts the whole is cut into, the smaller each part is.',
          `${fr(1, x)} is 1 of ${x} equal parts. ${fr(1, y)} is 1 of ${y} equal parts. Which parts are bigger?`],
        `${fr(1, Math.min(x, y))} is bigger, because the whole is cut into fewer parts. So ${fr(1, x)} ${s} ${fr(1, y)}.`, null, 3);
    };

    const orderSame = () => {
      const d = pick([5, 6, 8, 10]), tops = U.sample(U.range(1, d - 1), 3).sort((p, q) => p - q);
      const lists = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(p => p.map(i => fr(tops[i], d)).join(', '));
      return choice('Which list is in order from **smallest** to **largest**?', lists[0], [lists[5], ...U.sample(lists.slice(1, 5), 2)],
        ['The bottom numbers are the same, so just compare the top numbers.',
          `The top numbers are ${U.shuffle(tops).join(', ')}. Which is the smallest?`],
        `The parts are the same size, so order by the top numbers: ${lists[0]}.`);
    };

    const cmpHalf = () => {
      const d = pick([4, 6, 8, 10]), k = R(1, d - 1), h = d / 2, s = sign(k, h);
      return choice(`Which sign goes in the box?\n${fr(k, d)} □ ${fr(1, 2)}`, s, SIGNS,
        ['Change the fractions so they have the same bottom number.',
          k === h ? `How many ${PART[d][1]} make one half? Think: half of ${d} is how many?`
            : `${fr(1, 2)} = ${fr(h, d)}. Now compare ${fr(k, d)} and ${fr(h, d)}.`],
        `${fr(1, 2)} = ${fr(h, d)}. ${k === h ? `${fr(k, d)} is the same as ${fr(h, d)}` : `${cap(pl(k, 'part'))} ${k > h ? 'is more than' : 'is less than'} ${pl(h, 'part')}`}, so ${fr(k, d)} ${s} ${fr(1, 2)}.`, null, 3);
    };

    const spotAdd = () => {
      const d = pick([4, 5, 8, 10]), a = R(1, d - 2), b = R(1, d - 1 - a), w = kid();
      return fracQ(`${w.n} says ${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, 2 * d)}.\nWhat is the correct answer?`, a + b, d,
        ['When the bottom numbers are the same, only add the top numbers. The bottom number stays the same.',
          `${w.n} added the bottom numbers too. The bottom should stay ${d}.`],
        `${a} + ${b} = ${a + b} and the bottom stays ${d}. So the answer is ${fr(a + b, d)}.`);
    };

    const myth = () => {
      const [x, y] = U.sample([3, 4, 5, 6, 8, 10], 2), small = Math.min(x, y), large = Math.max(x, y), w = kid();
      return choice(`${w.n} says ${fr(1, large)} is bigger than ${fr(1, small)}, because ${large} is bigger than ${small}.\nIs ${w.he} right?`,
        `No, ${fr(1, small)} is bigger`, [`Yes, ${fr(1, large)} is bigger`, 'No, they are the same size'],
        ['Think about sharing a cake. Is a piece bigger when you share it between more people, or fewer people?',
          `${fr(1, small)} is 1 of ${small} parts. ${fr(1, large)} is 1 of ${large} parts.`],
        `When a whole is cut into more parts, each part is smaller. ${w.n} is wrong: No, ${fr(1, small)} is bigger.`, null, 3);
    };

    PMLM.registerSkill({
      id: 'g3.fracEquiv', grade: 3, unit: 'g3.u4', title: 'Equivalent fractions', icon: '🟰',
      blurb: 'Find equal fractions, compare them and add them',
      lesson: [
        { title: 'Same amount, different names',
          text: '{1/2} and {2/4} cover the **same amount**.\nThey are **equivalent** fractions.',
          visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '{1/2}' }, { parts: 4, shaded: 2, label: '{2/4}' }] } },
        { title: 'Making equal fractions',
          text: '{1/2} = {2/4} = {5/10}\n{1/5} = {2/10}\n**Tip:** multiply the top and the bottom by the **same** number.\n{1/5}: 1 × 2 = 2 and 5 × 2 = 10, so {1/5} = {2/10}.',
          visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 1, label: '{1/5}' }, { parts: 10, shaded: 2, label: '{2/10}' }] } },
        { title: 'Comparing fractions',
          text: 'When the bottom numbers are the same, compare the **top** numbers.\n{4/5} > {2/5} because 4 parts is more than 2 parts.\nWith 1 on top, fewer parts means **bigger** parts: {1/3} > {1/5}.',
          visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 4, label: '{4/5}' }, { parts: 5, shaded: 2, label: '{2/5}' }] } },
        { title: 'Adding and taking away',
          text: 'When the bottom numbers are the same, add (or take away) the **top** numbers. The bottom number stays the same.\n{1/5} + {2/5} = {3/5}\n**Don\'t** add the bottom numbers!',
          visual: { type: 'fractionBar', bars: [{ parts: 5, shaded: 1, label: '{1/5}' }, { parts: 5, shaded: 2, label: '{2/5}' }, { parts: 5, shaded: 3, label: '{3/5}' }] } },
        { title: 'Worked example',
          text: 'Which is bigger, {3/10} or {1/2}?\n**1.** Change {1/2} into tenths: {1/2} = {5/10}.\n**2.** Compare {3/10} and {5/10}: 5 parts is more than 3 parts.\nAnswer: {1/2} is bigger.',
          visual: { type: 'fractionBar', bars: [{ parts: 10, shaded: 3, label: '{3/10}' }, { parts: 2, shaded: 1, label: '{1/2}' }] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [missing, cmpSame, missing],
          [missing, whichEqual, addSub, cmpSame, addSub],
          [cmpUnit, orderSame, cmpHalf, spotAdd, myth, missing],
        ], ctx);
      },
    });
  }

  // ═══════════════════════ Unit 5: Measure, shape and data ═══════════════════════
  PMLM.registerUnit({ id: 'g3.u5', grade: 3, name: 'Measure, shape, data', icon: '📏' });

  /* 17 ── Telling the time */
  {
    const nh = h => (h % 12) + 1, ph = h => ((h + 10) % 12) + 1;
    const dg = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
    const words = (h, m) => (m === 0 ? `${h} o'clock` : m === 15 ? `quarter past ${h}` : m === 30 ? `half past ${h}`
      : m === 45 ? `quarter to ${nh(h)}` : m < 30 ? `${m} past ${h}` : `${60 - m} to ${nh(h)}`);
    const clock = (h, m) => ({ type: 'clock', h, m });
    // hands at least 20° apart, so a child can tell them apart (no 1:05 or quarter past 3 with the hands on top of each other)
    const apart = (h, m) => { const d = Math.abs(((h % 12) + m / 60) * 30 - m * 6) % 360; return Math.min(d, 360 - d) >= 20; };
    const clockTime = (hs, ms) => retry(() => { const h = pick(hs), m = pick(ms); return apart(h, m) ? [h, m] : null; });

    const readEasy = () => {
      const [h, m] = clockTime(U.range(1, 12), [0, 30, 15, 45, 0, 30]);
      const wrongs = {
        0: [`half past ${h}`, `${nh(h)} o'clock`, `12 o'clock`, `quarter past ${h}`],
        30: [`half past ${nh(h)}`, `${h} o'clock`, `quarter past ${h}`, `6 o'clock`],
        15: [`quarter to ${h}`, `3 o'clock`, `half past ${h}`, `quarter past ${nh(h)}`],
        45: [`quarter past ${nh(h)}`, `quarter to ${h}`, `9 o'clock`, `half past ${h}`],
      }[m];
      return choice('What time does the clock show?', words(h, m), wrongs,
        ['The short hand shows the hour. The long hand shows the minutes.',
          m === 0 ? 'Where is the long hand pointing? If it points to 12, it is an o\'clock time.'
            : `The long hand points to ${m / 5}. ${m === 30 ? 'That is halfway round the clock.' : m === 15 ? 'That is a quarter of the way round.' : 'That is three quarters of the way round.'}`],
        `The long hand points to ${m ? m / 5 : 12} and the short hand ${m === 0 ? `points to ${h}` : m === 45 ? `is nearly at ${nh(h)}` : `is just past ${h}`}. The time is ${words(h, m)}.`,
        { visual: clock(h, m) });
    };

    const hours = () => {
      const s = R(1, 8), len = R(2, 4), e = s + len, w = kid();
      const q = pick([`A party starts at **${s} o'clock** and ends at **${e} o'clock**.\nHow many hours long is the party?`,
        `${w.n} goes to the park at **${s} o'clock** and comes home at **${e} o'clock**.\nHow many hours is ${w.he} at the park?`]);
      return num(q, len, ['Count on in hours from the start time to the end time.', `From ${s} o'clock to ${s + 1} o'clock is 1 hour. Keep counting to ${e} o'clock.`],
        `From ${s} o'clock to ${e} o'clock is ${len} hours.`, { unit: 'hours' });
    };

    const read5 = () => {
      const [h, m] = clockTime(U.range(1, 12), [5, 10, 20, 25, 35, 40, 50, 55, 15, 45]);
      const wrongs = [dg(h, m / 5), m >= 30 ? dg(nh(h), m) : dg(ph(h), m), dg(m / 5, (h * 5) % 60), dg(h, 60 - m), dg(nh(h), 60 - m), dg(ph(h), m / 5)];
      return choice('What time does the clock show?', dg(h, m), wrongs,
        ['The short hand shows the hour. The long hand shows the minutes. Count in 5s from the 12.',
          `The short hand has gone past ${h} but has not reached ${nh(h)}, so the hour is ${h}. Now count the minutes in 5s.`],
        `The hour is ${h}. The long hand points to ${m / 5}, and ${m / 5} × 5 = ${m} minutes. The time is ${dg(h, m)}.`,
        { visual: clock(h, m) });
    };

    const toWords = () => {
      const h = R(1, 12), m = pick([5, 10, 20, 25, 35, 40, 50, 55, 15, 45]), ans = words(h, m);
      const wrongs = m < 30
        ? [m === 15 ? `quarter to ${h}` : `${m} to ${h}`, m === 15 ? `quarter past ${nh(h)}` : `${m} past ${nh(h)}`, `${60 - m} past ${h}`]
        : [m === 45 ? `quarter past ${h}` : `${60 - m} past ${h}`, `${m} to ${nh(h)}`, m === 45 ? `quarter to ${h}` : `${60 - m} to ${h}`];
      return choice(`Which time is the same as **${dg(h, m)}**?`, ans, wrongs,
        [m < 30 ? 'Before half past, we say minutes **past** the hour.' : 'After half past, we say minutes **to** the next hour.',
          m < 30 ? `${dg(h, m)} means ${m} minutes after ${h} o'clock.` : `There are 60 minutes in an hour. ${m} minutes have gone, so work out 60 − ${m}.`],
        m < 30 ? `${dg(h, m)} is ${m} minutes after ${h} o'clock, so it is ${ans}.` : `${dg(h, m)} is ${60 - m} minutes before ${nh(h)} o'clock, so it is ${ans}.`);
    };

    const duration = () => {
      const [h, m1] = clockTime(U.range(1, 11), [0, 5, 10, 15, 20, 25, 30, 35, 40]), m2 = m1 + 5 * R(3, (55 - m1) / 5), w = kid();
      const S = dg(h, m1), E = dg(h, m2);
      const q = pick([`A film starts at **${S}** and ends at **${E}**.\nHow long is the film?`,
        `Lunch starts at **${S}** and ends at **${E}**.\nHow long is lunch?`,
        `${w.n} starts reading at **${S}** and stops at **${E}**.\nHow long does ${w.he} read for?`,
        `A swimming lesson starts at **${S}** and finishes at **${E}**.\nHow long is the lesson?`]);
      return num(q, m2 - m1, ['Count on from the start time to the end time in 5s or 10s.',
        `From ${S} to ${dg(h, m1 + 10)} is 10 minutes. Keep counting on to ${E}.`],
        `From ${S} to ${E} is ${m2 - m1} minutes.`, { unit: 'minutes', visual: clock(h, m1) });
    };

    const durationCross = () => {
      const h = R(1, 11), m1 = pick([30, 35, 40, 45, 50, 55]), m2 = 5 * R(1, (m1 - 5) / 5), tot = 60 - m1 + m2;
      const S = dg(h, m1), E = dg(h + 1, m2), w = kid();
      const q = pick([`A football match starts at **${S}** and ends at **${E}**.\nHow many minutes is that?`,
        `${w.n} leaves home at **${S}** and gets to school at **${E}**.\nHow long does the journey take?`,
        `A cake goes in the oven at **${S}** and comes out at **${E}**.\nHow long does it bake for?`]);
      return num(q, tot, ['Jump to the next o\'clock first, then count on.', `From ${S} to ${h + 1}:00 is ${60 - m1} minutes.`],
        `${S} to ${h + 1}:00 is ${60 - m1} minutes. ${h + 1}:00 to ${E} is ${m2} minutes. ${60 - m1} + ${m2} = ${tot} minutes.`, { unit: 'minutes' });
    };

    const addMinutes = () => {
      const h = R(1, 11), m = pick([30, 35, 40, 45, 50, 55]), k = 5 * R((65 - m) / 5, 10), e = m + k - 60;
      const S = dg(h, m), ans = dg(h + 1, e);
      const wrongs = [`${h}:${m + k}`, dg(h, e), dg(h + 1, (e + 10) % 60)];
      if (m - k >= 0) wrongs.push(dg(h, m - k));
      const q = pick([`What time is it **${k} minutes** after **${S}**?`,
        `A bus leaves at **${S}**. The trip takes **${k} minutes**.\nWhat time does the bus arrive?`,
        `A cake goes in the oven at **${S}**. It bakes for **${k} minutes**.\nWhat time is it ready?`]);
      return choice(q, ans, wrongs, ['Jump to the next o\'clock first, then add the minutes that are left.',
        `From ${S} to ${h + 1}:00 is ${60 - m} minutes. That leaves ${k - (60 - m)} more minutes.`],
        `${S} + ${60 - m} minutes = ${h + 1}:00. Then ${k - (60 - m)} more minutes makes ${ans}.`);
    };

    const FACTS = [
      ['How many minutes are there in **1 hour**?', 60, ['The long hand goes once round the clock in 1 hour.', 'Count in 5s for each of the 12 numbers: 5, 10, 15, …']],
      ['How many minutes are there in **half an hour**?', 30, ['Half an hour is half of 1 hour. 1 hour is 60 minutes.', 'Find half of 60.']],
      ['How many minutes are there in a **quarter of an hour**?', 15, ['In a quarter of an hour, the long hand moves from 12 to 3.', 'Count in 5s from 12 to 3: 5, 10, …']],
      ['How many hours are there in **1 day**?', 24, ['A day has 12 hours up to midday and 12 more hours after midday.', 'Work out 12 + 12.']],
      ['How many days are there in **1 week**?', 7, ['Say the days of the week in order.', 'Monday, Tuesday, Wednesday, … Count them all.']],
      ['How many minutes are there in **2 hours**?', 120, ['1 hour = 60 minutes.', 'Work out 60 + 60.']],
    ];
    const facts = () => {
      const [q, a, hints] = pick(FACTS);
      return num(q, a, hints, `The answer is ${a}.`);
    };

    PMLM.registerSkill({
      id: 'g3.time', grade: 3, unit: 'g3.u5', title: 'Telling the time', icon: '🕒',
      blurb: 'Read clocks to 5 minutes and work out how long',
      lesson: [
        { title: 'Two hands',
          text: 'The **short** hand shows the **hour**.\nThe **long** hand shows the **minutes**.\nThis clock shows **3 o\'clock** (3:00).',
          visual: { type: 'clock', h: 3, m: 0 } },
        { title: 'Counting in 5s',
          text: 'The long hand moves **5 minutes** from one number to the next.\nCount in 5s from the 12: at 1 it is 5, at 2 it is 10 …\nThis clock shows **10 past 4**. We write **4:10**.',
          visual: { type: 'clock', h: 4, m: 10 } },
        { title: 'Past and to',
          text: 'Before the 6 we say minutes **past** the hour.\nAfter the 6 we say minutes **to** the next hour.\n**4:40** is **20 to 5**. **4:45** is **quarter to 5**.\n**Tip:** the short hand is nearly at 5, but the hour is still 4.',
          visual: { type: 'clock', h: 4, m: 40 } },
        { title: 'How long does it take?',
          text: 'To find how long something takes, count on from the start time.\nStart 2:15, end 2:50.\nCount on: 2:15 → 2:45 is 30 minutes, 2:45 → 2:50 is 5 more.\nSo it takes **35 minutes**.\n**Tip:** facts to know: 60 minutes = 1 hour, 24 hours = 1 day, 7 days = 1 week.',
          visual: { type: 'clock', h: 2, m: 15 } },
        { title: 'Worked example',
          text: 'What time does this clock show?\n**1.** The short hand is just past **7**, so the hour is 7.\n**2.** The long hand points to **4**. Count in 5s: 5, 10, 15, 20.\n**3.** So it is 20 minutes past 7.\nAnswer: **7:20**',
          visual: { type: 'clock', h: 7, m: 20 } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [readEasy, readEasy, readEasy, hours],
          [read5, read5, toWords, duration],
          [durationCross, addMinutes, facts, read5, toWords],
        ], ctx);
      },
    });
  }

  /* 18 ── Length, mass and capacity */
  {
    const NAME = { cm: 'centimetres', m: 'metres', g: 'grams', kg: 'kilograms', ml: 'millilitres', l: 'litres' };
    const KIND = { cm: 'length', m: 'length', g: 'mass', kg: 'mass', ml: 'capacity', l: 'capacity' };
    const SIB = { cm: 'm', m: 'cm', g: 'kg', kg: 'g', ml: 'l', l: 'ml' };
    const ITEMS = [
      ['the length of a pencil', 'cm'], ['the width of a book', 'cm'], ['the length of a spoon', 'cm'], ['the length of your foot', 'cm'],
      ['the length of a swimming pool', 'm'], ['the height of a house', 'm'], ['the length of a football pitch', 'm'], ['the height of a tall tree', 'm'],
      ['the mass of an apple', 'g'], ['the mass of a pencil', 'g'], ['the mass of a letter', 'g'], ['the mass of a banana', 'g'],
      ['the mass of a big dog', 'kg'], ['the mass of a sack of potatoes', 'kg'], ['the mass of a bike', 'kg'], ['the mass of a grown-up', 'kg'],
      ['how much medicine fits on a spoon', 'ml'], ['how much water fits in a glass', 'ml'], ['how much water fits in a cup', 'ml'], ['how much juice is in a small carton', 'ml'],
      ['how much water fits in a bath', 'l'], ['how much water fits in a bucket', 'l'], ['how much water fits in a fish tank', 'l'], ['how much water fits in a big watering can', 'l'],
    ];

    const unitChoice = () => {
      const [item, u] = pick(ITEMS), kind = KIND[u], isSmall = ['cm', 'g', 'ml'].includes(u);
      const small = isSmall ? u : SIB[u], big = SIB[small];
      const others = Object.keys(NAME).filter(x => KIND[x] !== kind);
      return choice(`Which unit is best for measuring **${item}**?`, NAME[u], [NAME[SIB[u]], ...U.sample(others, 2).map(x => NAME[x])],
        ['First decide: is it a length, a mass (how heavy) or a capacity (how much it holds)?',
          `It is a ${kind}. We measure ${kind} in ${NAME[small]} (for small amounts) or ${NAME[big]} (for big amounts). Is it small or big?`],
        `${cap(item)} is a ${kind}, and it is ${isSmall ? 'quite small' : 'quite big'}. So ${NAME[u]} are best.`);
    };

    const scale = L => {
      let min = 0, step, ticks = 10, every, u;
      if (L === 1) { step = pick([1, 2, 5, 10]); every = 2; u = 'cm'; }
      else if (L === 2) { [step, ticks, every] = pick([[10, 10, 5], [20, 10, 5], [50, 10, 2], [100, 10, 5], [2, 10, 5], [10, 20, 5], [5, 20, 4]]); u = pick(step >= 10 ? ['g', 'ml'] : ['cm', 'g']); }
      else { min = R(1, 5) * 100; [step, ticks, every] = pick([[10, 10, 5], [20, 10, 5], [50, 10, 2], [25, 12, 4]]); u = pick(['g', 'ml']); }
      const max = min + step * ticks;
      // past the first labelled mark, so the answer is never just the size of one step
      const j = retry(() => { const v = R(every + 1, ticks - 1); return v % every ? v : null; });
      const v = min + j * step, gap = step * every, lab = min + Math.floor(j / every) * gap, k = j % every;
      return num(`This scale is in **${NAME[u]}**. What does the **?** show?`, v,
        ['Not every mark has a number. Work out what each small step is worth first.',
          `From ${lab} to ${lab + gap} there are ${every} small steps. Each step is ${gap} ÷ ${every} = ${step}.`],
        `Each small step is ${step}. The ? is ${k} ${k === 1 ? 'step' : 'steps'} after ${lab}, so it shows ${lab} + ${k * step} = ${v} ${u}.`,
        { unit: u, visual: { type: 'numberLine', min, max, step, labelEvery: every, points: [{ at: v, label: '?' }] } });
    };

    const CONV = [['m', 'cm', 100], ['kg', 'g', 1000], ['l', 'ml', 1000]];
    const conv = L => {
      const [a, b, f] = pick(CONV);
      if (L === 3) {
        if (coin(0.4)) return num(`Fill in the gap.\n**${fr(1, 2)} ${a}** = □ ${b}`, f / 2,
          [`1 ${a} = ${f} ${b}.`, `Half a ${NAME[a].slice(0, -1)} is half of ${f} ${b}. Find half of ${f}.`],
          `1 ${a} = ${f} ${b}, so ${fr(1, 2)} ${a} = ${f / 2} ${b}.`, { unit: b });
        const k = R(1, 4), r = b === 'cm' ? R(1, 9) * 10 + R(0, 9) : R(1, 9) * 100;
        return num(`Fill in the gap.\n**${k} ${a} ${r} ${b}** = □ ${b}`, k * f + r,
          [`1 ${a} = ${f} ${b}. Change the ${NAME[a]} into ${NAME[b]} first.`, `${k} ${a} = ${k * f} ${b}. Now add the ${r} ${b}.`],
          `${k} ${a} = ${k * f} ${b}. ${k * f} + ${r} = ${k * f + r} ${b}.`, { unit: b });
      }
      const k = R(3, 9);
      if (coin()) return num(`Fill in the gap.\n**${k} ${a}** = □ ${b}`, k * f,
        [`1 ${a} = ${f} ${b}.`, `1 ${a} = ${f} ${b}, so 2 ${a} = ${2 * f} ${b}. Keep going to ${k} ${a}.`],
        `1 ${a} = ${f} ${b}, so ${k} ${a} = ${k} × ${f} = ${k * f} ${b}.`, { unit: b });
      return num(`Fill in the gap.\n**${k * f} ${b}** = □ ${a}`, k,
        [`1 ${a} = ${f} ${b}. How many lots of ${f} make ${k * f}?`, `Count in ${f}s: ${f}, ${2 * f}, ${3 * f}, … up to ${k * f}.`],
        `${k * f} ÷ ${f} = ${k}, so ${k * f} ${b} = ${k} ${a}.`, { unit: a });
    };

    const compare = () => {
      const [a, b, f] = pick(CONV), adj = { m: 'longer', kg: 'heavier', l: 'more' }[a], x = R(1, 2);
      const t = R(1, 5), step = f / 10;
      const y = t === 1 ? x * f : t <= 3 ? x * f - R(1, 9) * step : x * f + R(1, 9) * step;
      const big = `${x} ${a}`, small = `${y} ${b}`;
      const ans = y === x * f ? 'They are the same' : y < x * f ? big : small;
      return choice(`Which is **${adj}**: **${big}** or **${small}**?`, ans, [big, small, 'They are the same'],
        [`Change them into the same unit first. 1 ${a} = ${f} ${b}.`, `${x} ${a} = ${x * f} ${b}. Now compare ${x * f} ${b} with ${y} ${b}.`],
        `${x} ${a} = ${x * f} ${b}. ${y === x * f ? `So ${big} and ${small} are equal. They are the same.` : `${Math.max(y, x * f)} ${b} is ${adj} than ${Math.min(y, x * f)} ${b}, so the answer is ${ans}.`}`, null, 3);
    };

    const word3 = () => {
      const w = kid(), t = R(1, 3);
      if (t === 1) {
        const p = R(1, 9) * 100;
        return num(`A jug holds **1 litre** of water. ${w.n} pours out **${p} ml**.\nHow much water is left in the jug?`, 1000 - p,
          ['Change 1 litre into millilitres first.', `1 l = 1000 ml. Now work out 1000 − ${p}.`], `1 l = 1000 ml. 1000 − ${p} = ${1000 - p} ml.`, { unit: 'ml' });
      }
      if (t === 2) {
        const p = R(1, 9) * 10 + R(1, 9);
        return num(`A ribbon is **1 m** long. ${w.n} cuts off **${p} cm**.\nHow much ribbon is left?`, 100 - p,
          ['Change 1 metre into centimetres first.', `1 m = 100 cm. Now work out 100 − ${p}.`], `1 m = 100 cm. 100 − ${p} = ${100 - p} cm.`, { unit: 'cm' });
      }
      const p = R(1, 19) * 50;
      return num(`A bag of flour has a mass of **1 kg**. **${p} g** is used to make a cake.\nHow much flour is left?`, 1000 - p,
        ['Change 1 kilogram into grams first.', `1 kg = 1000 g. Now work out 1000 − ${p}.`], `1 kg = 1000 g. 1000 − ${p} = ${1000 - p} g.`, { unit: 'g' });
    };

    const word2 = () => {
      const t = R(1, 3);
      if (t === 1) {
        const a = R(8, 20), b = retry(() => { const v = a + R(5, 20); return v !== 2 * a ? v : null; });
        return num(`A pencil is **${a} cm** long. A ruler is **${b} cm** long.\nHow much longer is the ruler?`, b - a,
          ['"How much longer" means find the difference. Take away.', `Work out ${b} − ${a}.`], `${b} − ${a} = ${b - a} cm.`, { unit: 'cm' });
      }
      if (t === 2) {
        const a = R(1, 6) * 50 + 100, b = R(1, 6) * 50 + 100;
        return num(`A bag of rice has a mass of **${a} g**. A bag of beans has a mass of **${b} g**.\nWhat is their total mass?`, a + b,
          ['"Total" means add.', `Work out ${a} + ${b}. Add the hundreds first.`], `${a} + ${b} = ${a + b} g.`, { unit: 'g' });
      }
      const a = R(2, 9) * 100, b = R(1, a / 100 - 1) * 50;
      return num(`A bottle holds **${a} ml** of juice. **${b} ml** is poured into a glass.\nHow much juice is left in the bottle?`, a - b,
        ['Juice is poured out, so take away.', `Work out ${a} − ${b}.`], `${a} − ${b} = ${a - b} ml.`, { unit: 'ml' });
    };

    PMLM.registerSkill({
      id: 'g3.measure', grade: 3, unit: 'g3.u5', title: 'Length, mass, capacity', icon: '📏',
      blurb: 'Choose units, change units and read scales',
      lesson: [
        { title: 'Units of measure',
          text: '**Length** (how long): centimetres (cm) and metres (m).\n**Mass** (how heavy): grams (g) and kilograms (kg).\n**Capacity** (how much it holds): millilitres (ml) and litres (l).',
          visual: { type: 'table', headers: ['Measure', 'Small unit', 'Big unit', 'Fact'], rows: [['Length', 'cm', 'm', '1 m = 100 cm'], ['Mass', 'g', 'kg', '1 kg = 1000 g'], ['Capacity', 'ml', 'l', '1 l = 1000 ml']] } },
        { title: 'Which unit?',
          text: 'Use the **small** unit for small things and the **big** unit for big things.\nA pencil is about 15 **cm** long. A door is about 2 **m** tall.\nAn apple is about 100 **g**. A big dog is about 30 **kg**.' },
        { title: 'Reading a scale',
          text: 'Not every mark has a number. Work out what each **small step** is worth.\nHere, from 0 to 100 there are 5 steps, so each step is **20**.\nThe dot is 3 steps after 0, so it shows **60**.',
          visual: { type: 'numberLine', min: 0, max: 200, step: 20, labelEvery: 5, points: [{ at: 60, label: '60' }] } },
        { title: 'Changing units',
          text: 'Metres to centimetres: × 100. **3 m = 300 cm**\nKilograms to grams: × 1000. **2 kg = 2000 g**\nHalf a metre = **50 cm**. Half a litre = **500 ml**.\n1 m 25 cm = 100 + 25 = **125 cm**.' },
        { title: 'Worked example',
          text: 'This scale is in millilitres. What does the ? show?\n**1.** The labels go 0, 500, 1000. From 0 to 500 there are 5 steps.\n**2.** Each step is 500 ÷ 5 = **100** ml.\n**3.** The ? is 3 steps after 500.\n**4.** 500 + 300 = 800.\nAnswer: **800 ml**',
          visual: { type: 'numberLine', min: 0, max: 1000, step: 100, labelEvery: 5, points: [{ at: 800, label: '?' }] } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [unitChoice, scale, unitChoice],
          [scale, conv, unitChoice, word2],
          [scale, conv, compare, word3],
        ], ctx);
      },
    });
  }

  /* 19 ── Money: totals and change */
  {
    const CHEAP = [['pencil', 'pencils'], ['rubber', 'rubbers'], ['ruler', 'rulers'], ['sticker', 'stickers'], ['yo-yo', 'yo-yos'],
      ['comic', 'comics'], ['sandwich', 'sandwiches'], ['notebook', 'notebooks']];
    const DEAR = [['ball', 'balls'], ['book', 'books'], ['toy car', 'toy cars'], ['kite', 'kites'], ['cap', 'caps'],
      ['puzzle', 'puzzles'], ['bag', 'bags'], ['board game', 'board games'], ['T-shirt', 'T-shirts']];
    const itemFor = p => pick(p < 15 ? CHEAP : DEAR);    // keep prices believable

    const count = L => {
      const vals = retry(() => {
        const pool = L === 1 ? [10, 5, 2, 1] : [20, 10, 5, 2, 1, 50];
        const v = Array.from({ length: R(2, L === 1 ? 4 : 5) }, () => pick(pool)).sort((a, b) => b - a);
        const t = sum(v);
        return t <= (L === 1 ? 30 : 100) ? v : null;
      });
      return (cur => {
        const t = sum(vals), first = vals[0];
        return num('How much money is there altogether?', t,
          ['Start with the biggest one. Then count on the others.',
            vals.length > 2 ? `Start with ${money(cur, first)}. Add ${money(cur, vals[1])}: that makes ${money(cur, first + vals[1])}. Now count on the rest.`
              : `Start with ${money(cur, first)} and count on ${vals[1]} more.`],
          `${vals.join(' + ')} = ${t}. There is ${money(cur, t)} altogether.`,
          { prefix: cur, visual: { type: 'coins', values: vals } });
      });
    };

    const addPrices = (L, ctx) => {
      const cur = ctx.currency;
      const price = () => retry(() => { const v = L === 1 ? R(2, 15) : R(12, 48); return v % 10 ? v : null; });
      const p1 = price(), p2 = price(), [i1] = itemFor(p1), [i2] = retry(() => { const it = itemFor(p2); return it[0] !== i1 ? it : null; });
      return num(`A ${i1} costs **${money(cur, p1)}** and a ${i2} costs **${money(cur, p2)}**.\nHow much do they cost altogether?`, p1 + p2,
        ['"Altogether" means add the prices.', p2 >= 10 ? `Add the tens first: ${p1} + ${Math.floor(p2 / 10) * 10} = ${p1 + Math.floor(p2 / 10) * 10}. Now add the ${ones(p2 % 10)}.` : `Start at ${p1} and count on ${p2} more.`],
        `${p1} + ${p2} = ${p1 + p2}. Together they cost ${money(cur, p1 + p2)}.`, { prefix: cur });
    };

    const change = (L, ctx) => {
      const cur = ctx.currency, w = kid(), pay = L === 2 ? pick([10, 20, 50]) : pick([20, 50, 100]);
      const p = retry(() => { const v = R(Math.ceil(pay / 3), pay - 1); return v % 5 ? v : null; }), [item] = itemFor(p);
      const nt = Math.ceil(p / 10) * 10;
      return num(`${w.n} buys a ${item} for **${money(cur, p)}**. ${w.He} pays with **${money(cur, pay)}**.\nHow much change does ${w.he} get?`, pay - p,
        ['Change = the money you pay − the price. You can count on from the price.',
          nt < pay ? `Count on from ${money(cur, p)} to ${money(cur, nt)}: that is ${nt - p}. Now count on to ${money(cur, pay)}.` : `Count on from ${money(cur, p)} to ${money(cur, pay)} on your fingers, one at a time.`],
        `${pay} − ${p} = ${pay - p}. ${w.n} gets ${money(cur, pay - p)} change.`, { prefix: cur, visual: { type: 'coins', values: [pay] } });
    };

    const makeAmount = (L, ctx) => {
      const cur = ctx.currency, POOL = [20, 10, 5, 2, 1];
      const combo = () => Array.from({ length: 3 }, () => pick(POOL)).sort((a, b) => b - a);
      const right = combo(), T = sum(right), str = c => c.map(v => money(cur, v)).join(' + ');
      const wrongs = [];
      for (let i = 0; i < 200 && wrongs.length < 3; i++) {
        const c = combo(), s = sum(c);
        if (s !== T && Math.abs(s - T) <= 6 && !wrongs.some(w => w.s === s)) wrongs.push({ c, s });
      }
      if (!wrongs.length) wrongs.push({ c: [right[0], right[1], right[2] === 1 ? 2 : 1], s: 0 });
      const w0 = wrongs[0];
      return choice(`Which coins and notes make **${money(cur, T)}**?`, str(right), wrongs.map(x => str(x.c)),
        ['Add up the money in each choice. Start with the biggest.',
          `For example, ${str(w0.c)} makes ${money(cur, sum(w0.c))}. Check the others the same way.`],
        `${right.join(' + ')} = ${T}, so ${str(right)} makes ${money(cur, T)}.`);
    };

    const twoChange = (L, ctx) => {
      const cur = ctx.currency, w = kid(), p1 = R(6, 45), p2 = R(6, 45), t = p1 + p2, pay = t < 50 ? 50 : 100;
      const [i1] = itemFor(p1), [i2] = retry(() => { const it = itemFor(p2); return it[0] !== i1 ? it : null; });
      return num(`${w.n} buys a ${i1} for **${money(cur, p1)}** and a ${i2} for **${money(cur, p2)}**.\n${w.He} pays with **${money(cur, pay)}**. How much change does ${w.he} get?`, pay - t,
        ['First find the total cost. Then work out the change.', `Total: ${p1} + ${p2} = ${t}. Now take it away from ${pay}.`],
        `Total: ${p1} + ${p2} = ${t}. Change: ${pay} − ${t} = ${pay - t}. ${w.n} gets ${money(cur, pay - t)} change.`,
        { prefix: cur, visual: { type: 'coins', values: [pay] } });
    };

    const howMany = (L, ctx) => {
      const cur = ctx.currency, c = pick([2, 5, 10]), k = R(3, 10), T = c * k;
      return num(`How many **${money(cur, c)}** coins make **${money(cur, T)}**?`, k,
        [`Count in ${c}s until you reach ${T}.`, `${c}, ${2 * c}, ${3 * c}, … How many ${c}s did you count?`],
        `${k} × ${c} = ${T}, so ${k} coins make ${money(cur, T)}.`);
    };

    const each = (L, ctx) => {
      const cur = ctx.currency, [one, many] = pick(CHEAP), p = R(2, 10), k = R(3, 5);
      return num(`One ${one} costs **${money(cur, p)}**.\nHow much do **${k}** ${many} cost?`, p * k,
        [`Multiply the price by the number of ${many}.`, `Work out ${k} × ${p}. Count in ${p}s: ${p}, ${2 * p}, … Stop when you have counted ${k} of them.`],
        `${k} × ${p} = ${p * k}. They cost ${money(cur, p * k)}.`, { prefix: cur });
    };

    const missingPrice = (L, ctx) => {
      const cur = ctx.currency, w = kid(), pay = pick([20, 50, 100]), ch = R(2, pay / 2), [item] = itemFor(pay - ch);
      return num(`${w.n} had **${money(cur, pay)}**. ${w.He} bought a ${item} and got **${money(cur, ch)}** change.\nHow much did the ${item} cost?`, pay - ch,
        ['Price + change = the money paid. So price = money paid − change.', `Work out ${pay} − ${ch}.`],
        `${pay} − ${ch} = ${pay - ch}. The ${item} cost ${money(cur, pay - ch)}. Check: ${pay - ch} + ${ch} = ${pay}.`, { prefix: cur });
    };

    PMLM.registerSkill({
      id: 'g3.money', grade: 3, unit: 'g3.u5', title: 'Money and change', icon: '💰',
      blurb: 'Add up money and work out change',
      lesson: [
        { title: 'Coins and notes',
          text: 'We pay with **coins** and **notes**. Each one has a value.\nTo find the total, add the values. Start with the **biggest**.\nHere: 10 + 5 + 2 = **17**.',
          visual: { type: 'coins', values: [10, 5, 2] } },
        { title: 'Adding prices',
          text: 'A book costs 25 and a pen costs 8.\nTotal: 25 + 8 = **33**.\n**Tip:** add the tens first, then the ones.' },
        { title: 'Change',
          text: '**Change** is the money you get back when you pay too much.\nChange = money paid − price.\nPay with a 20 note for something that costs 13: 20 − 13 = **7** change.',
          visual: { type: 'coins', values: [20] } },
        { title: 'Count on to find change',
          text: 'You can also **count on** from the price to the money paid.\n13 → 15 is 2. 15 → 20 is 5.\n2 + 5 = **7** change.',
          visual: { type: 'numberLine', min: 13, max: 20, step: 1, jumps: [{ from: 13, to: 15, label: '+2' }, { from: 15, to: 20, label: '+5' }] } },
        { title: 'Worked example',
          text: 'Ali buys a toy for 36 and a ball for 12. He pays with a 50 note. How much change does he get?\n**1.** Total: 36 + 12 = 48.\n**2.** Change: 50 − 48 = 2.\nAnswer: **2** change.',
          visual: { type: 'coins', values: [50] } },
      ],
      gen(level, ctx) {
        const C = (L, c) => count(L)(c.currency);
        return byLevel(level, [
          [C, C, addPrices],
          [change, makeAmount, addPrices, C],
          [twoChange, howMany, each, missingPrice, change],
        ], ctx);
      },
    });
  }

  /* 20 ── 2D shapes, right angles and symmetry */
  {
    const SIDES = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6, octagon: 8, kite: 4, trapezium: 4, parallelogram: 4, rhombus: 4, L: 6 };
    const LABEL = { triangle: 'triangle', square: 'square', rectangle: 'rectangle', pentagon: 'pentagon', hexagon: 'hexagon', octagon: 'octagon', kite: 'kite', trapezium: 'trapezium', parallelogram: 'parallelogram', rhombus: 'rhombus', rightTriangle: 'triangle' };
    const shape = s => ({ type: 'shape2d', shape: s });

    const nameShape = () => {
      const s = pick(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'octagon']);
      const W = { triangle: ['square', 'pentagon', 'rectangle'], square: ['rectangle', 'pentagon', 'hexagon'], rectangle: ['square', 'hexagon', 'pentagon'],
        pentagon: ['hexagon', 'octagon', 'triangle'], hexagon: ['pentagon', 'octagon', 'rectangle'], octagon: ['hexagon', 'pentagon', 'square'] }[s];
      const four = s === 'square' || s === 'rectangle';
      return choice('What is the name of this shape?', s, W,
        four ? ['It has 4 sides. Are all 4 sides the same length?', 'Compare the top side with the side going up. Are they the same length?']
          : ['Count the sides. The number of sides tells you the name.', 'Put your finger on one corner. Count each side as you go round the shape.'],
        four ? `It has 4 sides and 4 right angles. ${s === 'square' ? 'All the sides are the same length, so it is a square.' : 'Two sides are long and two are short, so it is a rectangle.'}`
          : `It has ${SIDES[s]} sides, so it is a ${s}.`, { visual: shape(s) });
    };

    const countV = L => {
      const s = pick(L === 1 ? ['triangle', 'rectangle', 'square', 'pentagon', 'hexagon'] : ['pentagon', 'hexagon', 'octagon', 'kite', 'trapezium', 'parallelogram', 'triangle']);
      const what = pick(['sides', 'vertices (corners)']);
      return num(`How many ${what} does this shape have?`, SIDES[s],
        ['Put your finger on one corner and go round the shape.', 'Count each one as you pass it. Stop when you get back to where you started.'],
        `This ${LABEL[s]} has ${SIDES[s]} sides and ${SIDES[s]} vertices.`, { visual: shape(s) });
    };

    const rightAngle = () => {
      const d = pick([30, 45, 60, 120, 135, 150, 90, 40, 140]);
      const ans = d < 90 ? 'smaller than a right angle' : d > 90 ? 'bigger than a right angle' : 'a right angle';
      return choice('Is this angle smaller than a right angle, a right angle, or bigger than a right angle?', ans,
        ['smaller than a right angle', 'a right angle', 'bigger than a right angle'],
        ['A right angle is a square corner, like the corner of a book.',
          'Imagine putting the corner of a book into the angle. Is the opening smaller, the same, or bigger?'],
        `The opening is ${d < 90 ? 'narrower than' : d > 90 ? 'wider than' : 'exactly'} a square corner, so it is ${ans}.`,
        { visual: { type: 'angle', mode: 'single', parts: [d], labels: [''] } }, 3);
    };

    const RA = { rectangle: 4, square: 4, rightTriangle: 1, pentagon: 0, hexagon: 0, octagon: 0, parallelogram: 0, trapezium: 0 };
    const RA_WHY = {
      rectangle: 'All 4 corners of a rectangle are right angles.', square: 'All 4 corners of a square are right angles.',
      rightTriangle: 'Only one corner is a square corner. The other two are smaller than a right angle.',
      pentagon: 'Every corner of a regular pentagon is bigger than a right angle.', hexagon: 'Every corner of a regular hexagon is bigger than a right angle.',
      octagon: 'Every corner of a regular octagon is bigger than a right angle.',
      parallelogram: 'Two corners are smaller than a right angle and two are bigger, so none are right angles.',
      trapezium: 'None of the corners of this trapezium are square corners.',
    };
    const raCount = () => {
      const s = pick(Object.keys(RA));
      return num(`How many right angles does this ${LABEL[s]} have?`, RA[s],
        ['A right angle is a square corner. Check every corner of the shape.', 'Count the corners first. Then look at each one: is it a square corner?'],
        `${RA_WHY[s]} So the answer is ${RA[s]}.`, { visual: shape(s) });
    };

    // A fold line is drawn as a 2-point ghost polygon, which the engine strokes out and back with dashes "6 5"
    // at 30 px per square on this 1–11 × 1–9 grid. The dash pattern carries on into the return pass, so the two passes
    // line up only when the length is 11k + 3 px. Stretch the segment about its middle to that length; otherwise the
    // dashes of one pass fill the gaps of the other and the line looks solid.
    const fold = ([a, b]) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * 30, f = (Math.ceil((len - 3) / 11) * 11 + 3) / len;
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      return [[mx + (a[0] - mx) * f, my + (a[1] - my) * f], [mx + (b[0] - mx) * f, my + (b[1] - my) * f]];
    };
    // Squared-paper shapes with a dashed fold line: [name, points, [line, isSymmetry, note]...]
    const SYM = [
      ['rectangle', [[2, 3], [10, 3], [10, 7], [2, 7]], [[[6, 2.3], [6, 7.7]], true], [[[1.3, 5], [10.7, 5]], true], [[[2, 3], [10, 7]], false, 'A diagonal of a rectangle is **not** a line of symmetry!']],
      ['square', [[3, 2], [9, 2], [9, 8], [3, 8]], [[[6, 1.3], [6, 8.7]], true], [[[2.3, 1.3], [9.7, 8.7]], true]],
      ['triangle', [[2, 2], [10, 2], [6, 8]], [[[6, 1.3], [6, 8.7]], true], [[[1.3, 4], [10.7, 4]], false]],
      ['house shape', [[3, 2], [9, 2], [9, 5], [6, 8], [3, 5]], [[[6, 1.3], [6, 8.7]], true], [[[2.3, 5], [9.7, 5]], false]],
      ['T shape', [[2, 8], [10, 8], [10, 6], [7, 6], [7, 2], [5, 2], [5, 6], [2, 6]], [[[6, 1.3], [6, 8.7]], true], [[[1.3, 5], [10.7, 5]], false]],
      ['L shape', [[3, 2], [9, 2], [9, 4], [5, 4], [5, 8], [3, 8]], [[[6, 1.3], [6, 8.7]], false], [[[2.3, 5], [9.7, 5]], false]],
      ['arrow', [[2, 4], [6, 4], [6, 2], [10, 5], [6, 8], [6, 6], [2, 6]], [[[1.3, 5], [10.7, 5]], true], [[[6, 1.3], [6, 8.7]], false]],
      ['parallelogram', [[2, 3], [8, 3], [10, 7], [4, 7]], [[[6, 2.3], [6, 7.7]], false], [[[2, 3], [10, 7]], false, 'A parallelogram has no lines of symmetry.']],
      ['kite', [[6, 2], [9, 6], [6, 8], [3, 6]], [[[6, 1.3], [6, 8.7]], true], [[[2.3, 6], [9.7, 6]], false]],
      ['right-angled triangle', [[3, 2], [9, 2], [3, 8]], [[[2.5, 1.5], [7, 6]], true], [[[6, 1.3], [6, 8.7]], false]],
    ];
    const symLine = L => {
      const [name, pts, ...lines] = pick(L === 2 ? SYM.filter(s => !['right-angled triangle', 'parallelogram', 'L shape'].includes(s[0])) : SYM);
      const [line, yes, note] = pick(lines);
      return choice(`Is the dashed line a line of symmetry of this ${name}?`, yes ? 'Yes' : 'No', [yes ? 'No' : 'Yes'],
        ['Imagine folding the shape along the dashed line. Would the two halves fit exactly on top of each other?',
          'Pick one corner on one side of the line. Is there a matching corner the same distance away on the other side?'],
        yes ? 'When you fold along the line, the two halves match exactly. So it is a line of symmetry: Yes.'
          : `When you fold along the line, the two halves do not match. So it is not a line of symmetry: No.${note ? ' ' + note : ''}`,
        { visual: { type: 'grid', xmin: 1, xmax: 11, ymin: 1, ymax: 9, polygons: [{ pts }, { pts: fold(line), ghost: true }] } }, 2);
    };

    const SYMN = [
      ['square', 4, false, 'A square has 4 lines of symmetry: one up, one across and the 2 diagonals.'],
      ['rectangle', 2, false, 'A rectangle has 2 lines of symmetry: one up and one across. Its diagonals are not lines of symmetry.'],
      ['kite', 1, false, 'A kite has 1 line of symmetry, from its top corner to its bottom corner.'],
      ['rhombus', 2, false, 'This rhombus has 2 lines of symmetry: its two diagonals.'],
      ['parallelogram', 0, false, 'This parallelogram has no lines of symmetry. The halves never match when you fold it.'],
      ['pentagon', 5, true, 'A regular pentagon has 5 lines of symmetry, one through each corner.'],
      ['hexagon', 6, true, 'A regular hexagon has 6 lines of symmetry.'],
      ['octagon', 8, true, 'A regular octagon has 8 lines of symmetry.'],
    ];
    const symCount = () => {
      const [s, n, reg, why] = pick(SYMN);
      return num(`How many lines of symmetry does this ${reg ? 'regular ' : ''}${s} have?`, n,
        ['A line of symmetry folds the shape into two matching halves. Try lines going up, across and from corner to corner.',
          'Try a line straight down the middle first. Do the halves match? Then try across, then corner to corner.'],
        `${why} So the answer is ${n}.`, { visual: shape(s) });
    };

    const regular = () => {
      const [s, reg] = pick([['L', false], ['hexagon', true], ['pentagon', true], ['rectangle', false], ['square', true], ['octagon', true], ['parallelogram', false], ['kite', false]]);
      return choice('Is this shape **regular** or **irregular**?', reg ? 'regular' : 'irregular', [reg ? 'irregular' : 'regular'],
        ['A regular shape has all its sides the same length and all its angles the same size.',
          'Look at the sides. Are they all the same length?'],
        reg ? 'All its sides are the same length and all its angles are the same, so it is regular.'
          : 'Its sides are not all the same length, so it is irregular.', { visual: shape(s) }, 2);
    };

    const lName = () => {
      if (coin()) return num('How many sides does this shape have?', 6,
        ['Put your finger on one corner and go round the shape.', 'Count each straight side as you pass it. Stop when you get back to the start.'],
        'It has 6 straight sides. (It is an irregular hexagon.)', { visual: shape('L') });
      return choice('This shape has 6 straight sides. What is it called?', 'hexagon', ['octagon', 'pentagon', 'rectangle'],
        ['The name of a shape comes from how many sides it has.', 'A 5-sided shape is a pentagon. What is a 6-sided shape?'],
        'Any shape with 6 straight sides is a hexagon. This one is an irregular hexagon.', { visual: shape('L') });
    };

    PMLM.registerSkill({
      id: 'g3.shapes2d', grade: 3, unit: 'g3.u5', title: '2D shapes and symmetry', icon: '🔷',
      blurb: 'Name shapes, find right angles and lines of symmetry',
      lesson: [
        { title: 'Sides and vertices',
          text: '2D shapes are flat. Their straight edges are called **sides**.\nTheir corners are called **vertices** (one corner is a **vertex**).\nA pentagon has **5 sides** and **5 vertices**.',
          visual: { type: 'shape2d', shape: 'pentagon' } },
        { title: 'Shape names',
          text: 'The name tells you how many sides.\nA **regular** shape has all sides the same length and all angles the same. If not, it is **irregular**.',
          visual: { type: 'table', headers: ['Sides', 'Name'], rows: [['3', 'triangle'], ['4', 'quadrilateral (square, rectangle, kite …)'], ['5', 'pentagon'], ['6', 'hexagon'], ['8', 'octagon']] } },
        { title: 'Right angles',
          text: 'A **right angle** is a square corner, like the corner of a book.\nWe mark a right angle with a little square.\nA rectangle has **4** right angles.',
          visual: { type: 'shape2d', shape: 'rectangle' } },
        { title: 'Lines of symmetry',
          text: 'A **line of symmetry** cuts a shape into two halves that match exactly, like a mirror.\nIf you fold along the line, the halves fit on top of each other.\nThe dashed line is a line of symmetry of this rectangle. A rectangle has **2**. Its diagonals are **not** lines of symmetry!',
          visual: { type: 'grid', xmin: 1, xmax: 11, ymin: 1, ymax: 9, polygons: [{ pts: [[2, 3], [10, 3], [10, 7], [2, 7]] }, { pts: fold([[6, 2.3], [6, 7.7]]), ghost: true }] } },
        { title: 'Worked example',
          text: 'Name this shape and count its right angles.\n**1.** Count the sides: 3. So it is a **triangle**.\n**2.** Check each corner. One corner is square (it has the little square mark).\n**3.** The other two corners are smaller than a right angle.\nAnswer: a triangle with **1** right angle.',
          visual: { type: 'shape2d', shape: 'rightTriangle' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [nameShape, countV, nameShape],
          [rightAngle, raCount, symLine, countV],
          [symLine, symCount, regular, lName, raCount],
        ], ctx);
      },
    });
  }

  /* 21 ── 3D shapes */
  {
    const S3 = {
      cube: { name: 'cube', f: 6, e: 12, v: 8, flat: 6 },
      cuboid: { name: 'cuboid', f: 6, e: 12, v: 8, flat: 6 },
      squarePyramid: { name: 'square-based pyramid', f: 5, e: 8, v: 5, flat: 5 },
      triangularPrism: { name: 'triangular prism', f: 5, e: 9, v: 6, flat: 5 },
      cylinder: { name: 'cylinder', flat: 2 },
      cone: { name: 'cone', flat: 1 },
      sphere: { name: 'sphere', flat: 0 },
    };
    const POLY = ['cube', 'cuboid', 'squarePyramid', 'triangularPrism'];
    const WRONG = {
      cube: ['cuboid', 'square', 'sphere'], cuboid: ['cube', 'rectangle', 'cylinder'], cylinder: ['cone', 'circle', 'cuboid'],
      cone: ['cylinder', 'triangle', 'square-based pyramid'], sphere: ['circle', 'cylinder', 'cone'],
      squarePyramid: ['triangular prism', 'cone', 'triangle'], triangularPrism: ['square-based pyramid', 'cuboid', 'triangle'],
    };
    const WORD = { f: 'faces', e: 'edges', v: 'vertices (corners)' };
    const HOW = {
      f: 'Count the flat surfaces. Remember the ones at the back that you can\'t see.',
      e: 'An edge is where two faces meet. The dashed lines are edges at the back.',
      v: 'A vertex is a corner where edges meet. The dashed lines show the hidden corners too.',
    };
    const STEP = {
      cube: { f: 'Front, back, top, bottom, left side, right side …', e: 'Count the 4 edges round the front face first.', v: 'Count the 4 corners of the front face first.' },
      cuboid: { f: 'Front, back, top, bottom, left side, right side …', e: 'Count the 4 edges round the front face first.', v: 'Count the 4 corners of the front face first.' },
      squarePyramid: { f: 'There is 1 square face on the bottom. Now count the triangle faces.', e: 'The square base has 4 edges. Now count the edges that go up to the top point.', v: 'The square base has 4 corners. Is there one more at the top?' },
      triangularPrism: { f: 'There are 2 triangle faces, at the front and back. Now count the rectangle faces.', e: 'The front triangle has 3 edges and the back triangle has 3 edges. Now count the edges joining them.', v: 'The front triangle has 3 corners. Now count the corners of the back triangle.' },
    };

    const nameIt = () => {
      const k = pick(Object.keys(S3));
      return choice('What is the name of this 3D shape?', S3[k].name, WRONG[k],
        ['Look at the faces. Are they flat or curved? What shape are they?',
          k === 'cube' || k === 'cuboid' ? 'All its faces are flat. Are they all squares, or are some rectangles?'
            : k === 'sphere' ? 'It is round all over, like a ball. Remember: circle is the name of a flat 2D shape.'
              : k === 'cylinder' ? 'It has a flat circle at each end and a curved side.'
                : k === 'cone' ? 'It has one flat circle face and comes to a point.'
                  : k === 'squarePyramid' ? 'Look at the bottom face, then look at the top. Does it come to a point?'
                    : 'Look at the two end faces. What shape are they?'],
        `This shape is a ${S3[k].name}.`, { visual: { type: 'shape3d', shape: k } });
    };

    const countIt = L => {
      const k = L === 1 ? pick(['cube', 'cuboid']) : pick(POLY), p = L === 1 ? 'f' : pick(['f', 'e', 'v']), s = S3[k];
      return num(`How many ${WORD[p]} does a ${s.name} have?`, s[p], [HOW[p], STEP[k][p]],
        `A ${s.name} has ${s.f} faces, ${s.e} edges and ${s.v} vertices. So the answer is ${s[p]}.`,
        { visual: { type: 'shape3d', shape: k } });
    };

    const flatFaces = () => {
      const k = pick(['cylinder', 'cone', 'sphere']), s = S3[k];
      const why = { cylinder: 'A cylinder has 2 flat circle faces (top and bottom) and 1 curved surface.', cone: 'A cone has 1 flat circle face and 1 curved surface.', sphere: 'A sphere has only one curved surface. It has no flat faces.' }[k];
      return num(`How many **flat** faces does a ${s.name} have?`, s.flat,
        ['A flat face could lie flat on a table. A curved surface would roll.',
          'Look at the top and the bottom of the shape. Are they flat?'],
        `${why} So the answer is ${s.flat}.`, { visual: { type: 'shape3d', shape: k } });
    };

    const whichShape = () => {
      const k = pick(['squarePyramid', 'triangularPrism', 'cube']), s = S3[k];
      const others = k === 'cube' ? ['square-based pyramid', 'triangular prism', 'cylinder'] : k === 'squarePyramid' ? ['triangular prism', 'cube', 'cone'] : ['square-based pyramid', 'cuboid', 'cylinder'];
      const ans = k === 'cube' ? 'cube' : s.name;
      return choice(`Which 3D shape has **${s.f} faces, ${s.e} edges and ${s.v} vertices**?`, ans, others,
        ['Picture each shape and count its faces first.',
          k === 'cube' ? 'A triangular prism has 5 faces and a cylinder has only 2 flat faces. Now count the faces of the other shapes.'
            : 'A square-based pyramid and a triangular prism both have 5 faces. Now count the edges of each one.'],
        `A ${s.name} has ${s.f} faces, ${s.e} edges and ${s.v} vertices.`);
    };

    const riddle = () => {
      const R3 = [
        ['I have **2** flat circle faces and **1** curved surface. What am I?', 'cylinder', ['cone', 'sphere', 'circle']],
        ['I have **1** flat circle face, **1** curved surface and a point at the top. What am I?', 'cone', ['cylinder', 'square-based pyramid', 'sphere']],
        ['I have **no** flat faces and **no** corners. I roll in every direction. What am I?', 'sphere', ['cylinder', 'circle', 'cone']],
        ['I have **6** faces and they are **all squares**. What am I?', 'cube', ['cuboid', 'square-based pyramid', 'square']],
        ['I have **6** faces and some of them are **rectangles**. What am I?', 'cuboid', ['cube', 'triangular prism', 'rectangle']],
        ['I have **5** faces: **2 triangles** and **3 rectangles**. What am I?', 'triangular prism', ['square-based pyramid', 'cuboid', 'triangle']],
        ['I have **5** faces: **1 square** and **4 triangles**. What am I?', 'square-based pyramid', ['triangular prism', 'cube', 'cone']],
      ];
      const [q, a, w] = pick(R3);
      return choice(q, a, w, ['Is the answer a 3D shape? Picture each choice in your head.',
        'Think about the faces of each choice: are they flat or curved? What shape are they?'], `The answer is a ${a}.`);
    };

    const diff = () => {
      const [x, y] = retry(() => { const p = U.sample(POLY, 2); return S3[p[0]].e !== S3[p[1]].e ? p : null; });
      const [big, small] = S3[x].e > S3[y].e ? [S3[x], S3[y]] : [S3[y], S3[x]];
      return num(`How many more edges does a ${big.name} have than a ${small.name}?`, big.e - small.e,
        ['Find the number of edges of each shape, then take away.', `A ${big.name} has ${big.e} edges. How many does a ${small.name} have?`],
        `A ${big.name} has ${big.e} edges and a ${small.name} has ${small.e}. ${big.e} − ${small.e} = ${big.e - small.e}.`);
    };

    const faceShape = () => {
      const F = [
        ['What shape are the faces of a **cube**?', 'squares', ['triangles', 'circles', 'rectangles that are not squares'], 'cube'],
        ['What shape are the two end faces of a **triangular prism**?', 'triangles', ['squares', 'circles', 'pentagons'], 'triangularPrism'],
        ['What shape is the flat face of a **cone**?', 'a circle', ['a square', 'a triangle', 'a rectangle'], 'cone'],
        ['What shape are the side faces of a **square-based pyramid**?', 'triangles', ['squares', 'circles', 'rectangles'], 'squarePyramid'],
        ['What shape are the flat faces of a **cylinder**?', 'circles', ['squares', 'triangles', 'rectangles'], 'cylinder'],
      ];
      const [q, a, w, k] = pick(F);
      return choice(q, a, w, ['Look carefully at the picture of the shape.', 'Trace round one face with your finger. How many sides does it have?'],
        `The answer is ${a}.`, { visual: { type: 'shape3d', shape: k } });
    };

    PMLM.registerSkill({
      id: 'g3.shapes3d', grade: 3, unit: 'g3.u5', title: '3D shapes', icon: '🧊',
      blurb: 'Name 3D shapes and count faces, edges and vertices',
      lesson: [
        { title: 'Faces, edges and vertices',
          text: '3D shapes are solid. You can hold them.\nA **face** is a flat surface.\nAn **edge** is where two faces meet.\nA **vertex** is a corner (more than one are **vertices**).\nDashed lines show the edges at the back.',
          visual: { type: 'shape3d', shape: 'cube' } },
        { title: 'Cubes and cuboids',
          text: 'A **cube** has 6 square faces, 12 edges and 8 vertices.\nA **cuboid** also has 6 faces, 12 edges and 8 vertices, but some faces are rectangles.',
          visual: { type: 'shape3d', shape: 'cuboid' } },
        { title: 'Pyramids and prisms',
          text: 'A **square-based pyramid** has 5 faces, 8 edges and 5 vertices.\nA **triangular prism** has 5 faces, 9 edges and 6 vertices.',
          visual: { type: 'shape3d', shape: 'squarePyramid' } },
        { title: 'Curved surfaces',
          text: 'A **sphere** has one curved surface and no flat faces.\nA **cylinder** has 2 flat circle faces and 1 curved surface.\nA **cone** has 1 flat circle face and 1 curved surface.',
          visual: { type: 'shape3d', shape: 'cylinder' } },
        { title: 'Worked example',
          text: 'How many edges does a triangular prism have?\n**1.** Edges round the front triangle: 3.\n**2.** Edges round the back triangle: 3.\n**3.** Edges joining the front to the back: 3.\n**4.** 3 + 3 + 3 = 9.\nAnswer: **9** edges',
          visual: { type: 'shape3d', shape: 'triangularPrism' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [nameIt, countIt, nameIt],
          [countIt, flatFaces, whichShape, nameIt],
          [riddle, diff, faceShape, countIt, whichShape],
        ], ctx);
      },
    });
  }

  /* 22 ── Bar charts, pictograms, Carroll and Venn diagrams */
  {
    const CHARTS = [
      { title: 'Favourite pets', labels: ['Cat', 'Dog', 'Fish', 'Bird', 'Rabbit'], what: 'favourite pets' },
      { title: 'Favourite fruit', labels: ['Apple', 'Banana', 'Orange', 'Grapes', 'Pear'], what: 'favourite fruit' },
      { title: 'Favourite colours', labels: ['Red', 'Blue', 'Green', 'Yellow', 'Pink'], what: 'favourite colours' },
      { title: 'Favourite sports', labels: ['Football', 'Tennis', 'Swimming', 'Running'], what: 'favourite sports' },
    ];
    const makeChart = L => {
      const c = pick(CHARTS), k = R(3, Math.min(5, c.labels.length));
      const labels = U.sample(c.labels, k);
      let step, vals;
      if (L === 1) {
        step = pick([1, 2]);
        vals = U.sample(step === 1 ? U.range(1, 10) : U.range(2, 16, 2), k);
      } else if (L === 2) {
        step = pick([2, 5, 10]);
        vals = U.sample(step === 2 ? U.range(1, 19) : step === 5 ? U.range(5, 40, 5) : U.range(10, 80, 5), k);
        if (step === 2 && vals.every(v => v % 2 === 0)) vals[0] = vals[0] + 1 > 19 ? vals[0] - 1 : vals[0] + 1;
        if (step === 10 && vals.every(v => v % 10 === 0)) vals[0] += 5;
        if (new Set(vals).size < k) return makeChart(L);
      } else {
        step = pick([5, 10, 2]);
        vals = U.sample(step === 2 ? U.range(1, 19) : step === 5 ? U.range(5, 50, 5) : U.range(10, 100, 5), k);
      }
      const bars = labels.map((label, i) => ({ label, value: vals[i] }));
      return { c, bars, step, visual: { type: 'barChart', bars, step, title: c.title, yLabel: 'Children' } };
    };
    const kids = n => pl(n, 'child', 'children');
    const readHint = (b, step) => [
      `Find the top of the ${b.label} bar. Read across to the numbers on the side.`,
      b.value % step ? `The scale goes up in ${step}s. The ${b.label} bar stops halfway between ${b.value - (b.value % step)} and ${b.value - (b.value % step) + step}. What number is halfway?`
        : `The numbers on the side go up in ${step}s: 0, ${step}, ${2 * step}, ${3 * step}, … Which number is level with the top of the ${b.label} bar?`];

    const barRead = L => {
      const { c, bars, step, visual } = makeChart(L), b = pick(bars);
      return num(`The bar chart shows the ${c.what} of some children.\nHow many children chose **${b.label}**?`, b.value,
        readHint(b, step), `The ${b.label} bar reaches ${b.value}. So ${kids(b.value)} chose ${b.label}.`, { visual });
    };

    const barMost = L => {
      const { c, bars, visual } = makeChart(L), most = coin(0.6);
      const best = bars.reduce((p, q) => ((most ? q.value > p.value : q.value < p.value) ? q : p));
      return choice(`The bar chart shows the ${c.what} of some children.\nWhich was the **${most ? 'most' : 'least'}** popular?`, best.label, bars.filter(b => b !== best).map(b => b.label),
        [`The ${most ? 'tallest' : 'shortest'} bar shows the ${most ? 'most' : 'least'} popular.`, 'Compare the heights of the bars. Which one is the ' + (most ? 'tallest?' : 'shortest?')],
        `The ${best.label} bar is the ${most ? 'tallest' : 'shortest'}, so ${best.label} was the ${most ? 'most' : 'least'} popular.`, { visual }, 5);
    };

    const barDiff = L => {
      const { c, bars, step, visual } = makeChart(L), [a, b] = U.sample(bars, 2), [hi, lo] = a.value > b.value ? [a, b] : [b, a];
      const more = coin();
      return num(`The bar chart shows the ${c.what} of some children.\nHow many ${more ? `more children chose **${hi.label}** than **${lo.label}**` : `fewer children chose **${lo.label}** than **${hi.label}**`}?`, hi.value - lo.value,
        ['Read both bars, then find the difference by taking away.', `${hi.label} has ${hi.value}. Now read the ${lo.label} bar.`],
        `${hi.label}: ${hi.value}. ${lo.label}: ${lo.value}. ${hi.value} − ${lo.value} = ${hi.value - lo.value}.`, { visual });
    };

    const barTotal = L => {
      const { c, bars, visual } = makeChart(L);
      if (coin()) {
        const [a, b] = U.sample(bars, 2);
        return num(`The bar chart shows the ${c.what} of some children.\nHow many children chose **${a.label}** or **${b.label}**?`, a.value + b.value,
          ['Read both bars, then add.', `${a.label} has ${a.value}. Now read the ${b.label} bar and add.`],
          `${a.value} + ${b.value} = ${a.value + b.value}.`, { visual });
      }
      return num(`The bar chart shows the ${c.what} of some children.\nHow many children were asked altogether?`, sum(bars.map(b => b.value)),
        ['Read every bar, then add them all up.', `${bars[0].label} has ${bars[0].value}. Read the other bars and keep adding.`],
        `${bars.map(b => b.value).join(' + ')} = ${sum(bars.map(b => b.value))}.`, { visual });
    };

    const PICTOS = [
      { title: 'Books read', labels: ['Ali', 'Mia', 'Tom', 'Zara'], symbol: '📚', q: l => `How many books did **${l}** read?` },
      { title: 'Ice creams sold', labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], symbol: '🍦', q: l => `How many ice creams were sold on **${l}**?` },
      { title: 'Goals scored', labels: ['Red team', 'Blue team', 'Green team'], symbol: '⚽', q: l => `How many goals did the **${l}** score?` },
      { title: 'Apples picked', labels: ['Leyla', 'Omar', 'Nina', 'Ravi'], symbol: '🍎', q: l => `How many apples did **${l}** pick?` },
    ];
    const makePicto = L => {
      const p = pick(PICTOS), k = Math.min(p.labels.length, R(3, 4));
      const labels = U.sample(p.labels, k).sort((a, b) => p.labels.indexOf(a) - p.labels.indexOf(b));   // days stay in order
      let per, pool;
      if (L === 1) { per = pick([1, 2]); pool = per === 1 ? U.range(1, 8) : U.range(2, 14, 2); }
      else if (L === 2) { per = pick([2, 10]); pool = per === 2 ? U.range(1, 15) : U.range(5, 70, 5); }
      else { per = pick([5, 10, 4]); pool = per === 5 ? U.range(5, 40, 5) : per === 10 ? U.range(5, 80, 5) : U.range(2, 32, 2); }
      const counts = U.sample(pool.filter(v => v !== per || per === 1), k);   // one lone whole symbol makes the key-hint give the answer
      const rows = labels.map((label, i) => ({ label, count: counts[i] }));
      return { p, rows, per, visual: { type: 'pictogram', rows, symbol: p.symbol, per, title: p.title } };
    };
    const pRead = (row, per, sym) => {
      const full = Math.floor(row.count / per), part = row.count % per;
      return [`Look at the key: each ${sym} stands for ${per}.`,
        per === 1 ? `Count the ${sym} in the ${row.label} row.`
          : `${row.label} has ${full} whole ${sym}${part ? ` and ${part * 2 === per ? 'half' : part * 4 === per ? 'a quarter' : 'three quarters'} of a ${sym}` : ''}. Each whole one is ${per}.`];
    };

    const pictoRead = L => {
      const { p, rows, per, visual } = makePicto(L), row = pick(rows), full = Math.floor(row.count / per), part = row.count % per;
      return num(`Look at the pictogram.\n${p.q(row.label)}`, row.count, pRead(row, per, p.symbol),
        per === 1 ? `There ${row.count === 1 ? 'is 1 symbol' : `are ${row.count} symbols`}, so the answer is ${row.count}.`
          : `${pl(full, 'whole symbol')} = ${full} × ${per} = ${full * per}.${part ? ` The part symbol is worth ${part}. ${full * per} + ${part} = ${row.count}.` : ''} So the answer is ${row.count}.`, { visual });
    };

    const pictoDiff = L => {
      const { p, rows, per, visual } = makePicto(L), [a, b] = U.sample(rows, 2), [hi, lo] = a.count > b.count ? [a, b] : [b, a];
      return num(`Look at the pictogram.\nHow many more for **${hi.label}** than for **${lo.label}**?`, hi.count - lo.count,
        [`Use the key: each ${p.symbol} stands for ${per}. Work out both rows, then take away.`, `${hi.label} has ${hi.count}. Now work out ${lo.label}.`],
        `${hi.label}: ${hi.count}. ${lo.label}: ${lo.count}. ${hi.count} − ${lo.count} = ${hi.count - lo.count}.`, { visual });
    };

    const RULE_A = [
      { is: 'even', not: 'not even', circle: 'even numbers', test: v => v % 2 === 0, hint: v => `Look at its ones digit: ${v % 10}.` },
      { is: 'a multiple of 5', not: 'not a multiple of 5', circle: 'multiples of 5', test: v => v % 5 === 0, hint: v => `Does ${v} end in 0 or 5?` },
      { is: 'odd', not: 'not odd', circle: 'odd numbers', test: v => v % 2 === 1, hint: v => `Look at its ones digit: ${v % 10}.` },
      { is: 'a multiple of 10', not: 'not a multiple of 10', circle: 'multiples of 10', test: v => v % 10 === 0, hint: v => `Does ${v} end in 0?` },
    ];
    const ruleB = () => {
      const N = pick([20, 30, 50]), more = coin();
      return more ? { is: `more than ${N}`, not: `not more than ${N}`, circle: `numbers more than ${N}`, test: v => v > N, N }
        : { is: `less than ${N}`, not: `not less than ${N}`, circle: `numbers less than ${N}`, test: v => v < N, N };
    };
    // all numbers 2–99 that fit (or don't fit) each rule; never the boundary number itself
    const cands = (A, B, a, b) => U.range(2, 99).filter(v => A.test(v) === a && B.test(v) === b && v !== B.N);
    const rulePair = need => retry(() => {
      const A = pick(RULE_A), B = ruleB();
      return [[true, true], [true, false], [false, true], [false, false]].every(([a, b]) => cands(A, B, a, b).length >= need) ? [A, B] : null;
    });

    const carroll = () => {
      const [A, B] = rulePair(3), inA = coin(), inB = coin();
      const x = pick(cands(A, B, inA, inB));
      const cell = (a, b) => U.sample(cands(A, B, a, b).filter(v => v !== x), 2).sort((p, q) => p - q).join(', ');
      const table = { type: 'table', headers: ['', A.is, A.not], rows: [[B.is, cell(true, true), cell(false, true)], [B.not, cell(true, false), cell(false, false)]] };
      const box = (a, b) => `${a ? A.is : A.not} and ${b ? B.is : B.not}`;
      return choice(`Where does **${x}** go in the Carroll diagram?`, box(inA, inB), [box(!inA, inB), box(inA, !inB), box(!inA, !inB)],
        [`Ask two questions: is ${x} ${A.is}? Is ${x} ${B.is}?`, `Is ${x} ${A.is}? ${A.hint(x)}`],
        `${x} ${inA ? 'is' : 'is not'} ${A.is}, and it ${inB ? 'is' : 'is not'} ${B.is}. So it goes in the box for "${box(inA, inB)}".`, { visual: table });
    };

    const venn = () => {
      const [A, B] = rulePair(1), inA = coin(), inB = coin(), x = pick(cands(A, B, inA, inB));
      const opts = { both: 'In the middle, where the circles overlap', a: `Only in the "${A.circle}" circle`, b: `Only in the "${B.circle}" circle`, none: 'Outside both circles' };
      const key = inA && inB ? 'both' : inA ? 'a' : inB ? 'b' : 'none';
      return choice(`A Venn diagram has two circles. One circle is for **${A.circle}**. The other circle is for **${B.circle}**.\nWhere does **${x}** go?`, opts[key],
        Object.keys(opts).filter(k => k !== key).map(k => opts[k]),
        [`Check both rules. Is ${x} ${A.is}? Is ${x} ${B.is}?`, `Is ${x} ${A.is}? ${A.hint(x)}`],
        `${x} ${inA ? 'is' : 'is not'} ${A.is}, and it ${inB ? 'is' : 'is not'} ${B.is}. ${key === 'both' ? 'It fits both rules' : key === 'none' ? 'It fits neither rule' : 'It fits only one rule'}. Answer: ${opts[key]}.`,
        { visual: { type: 'table', headers: ['Circle 1', 'Circle 2'], rows: [[A.circle, B.circle]] } });
    };

    PMLM.registerSkill({
      id: 'g3.data', grade: 3, unit: 'g3.u5', title: 'Charts and sorting', icon: '📊',
      blurb: 'Read bar charts and pictograms, and sort numbers',
      lesson: [
        { title: 'Bar charts',
          text: 'A **bar chart** shows data with bars. The taller the bar, the more there is.\nRead across from the top of a bar to the scale.\nHere the scale goes up in **2s**. The Dog bar stops halfway between 8 and 10, so it shows **9**.',
          visual: { type: 'barChart', bars: [{ label: 'Cat', value: 6 }, { label: 'Dog', value: 9 }, { label: 'Fish', value: 4 }], step: 2, title: 'Favourite pets', yLabel: 'Children' } },
        { title: 'Pictograms',
          text: 'A **pictogram** uses pictures. Always read the **key**!\nHere one ⭐ stands for 2.\nSo ⭐⭐⭐ means **6**, and half a ⭐ means **1**.\nMonday: 6. Tuesday: 5.',
          visual: { type: 'pictogram', rows: [{ label: 'Monday', count: 6 }, { label: 'Tuesday', count: 5 }], symbol: '⭐', per: 2, title: 'Stars earned' } },
        { title: 'Carroll diagrams',
          text: 'A **Carroll diagram** sorts things into boxes using two rules.\nWhere does 14 go? It is even, and it is **not** more than 20.\nSo it goes in the bottom-left box.',
          visual: { type: 'table', headers: ['', 'even', 'not even'], rows: [['more than 20', '24, 36', '27, 41'], ['not more than 20', '8, 16', '9, 15']] } },
        { title: 'Venn diagrams',
          text: 'A **Venn diagram** sorts things into circles.\nIf a number fits **both** rules, it goes in the **middle**, where the circles overlap.\nIf it fits **one** rule, it goes only in that circle.\nIf it fits **neither** rule, it goes **outside** the circles.' },
        { title: 'Worked example',
          text: 'How many more children chose Dog than Cat?\n**1.** Read the Dog bar: 9.\n**2.** Read the Cat bar: 6.\n**3.** Find the difference: 9 − 6 = 3.\nAnswer: **3** more children',
          visual: { type: 'barChart', bars: [{ label: 'Cat', value: 6 }, { label: 'Dog', value: 9 }, { label: 'Fish', value: 4 }], step: 2, title: 'Favourite pets', yLabel: 'Children' } },
      ],
      gen(level, ctx) {
        return byLevel(level, [
          [barRead, pictoRead, barMost],
          [barRead, barDiff, pictoRead, carroll, pictoDiff],
          [barTotal, pictoRead, venn, carroll, barDiff],
        ], ctx);
      },
    });
  }
})();
