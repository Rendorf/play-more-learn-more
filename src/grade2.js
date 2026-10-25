// Play More Learn More — Cambridge Stage 2 (Grade 2, age about 7).
// Plain browser script (see CONTRACT.md): registers 5 units and 20 skills, using the U helpers.
(() => {
  const M = U.MINUS;
  const R = U.rint;
  const P = U.pick;
  const TOP = [0, 20, 50, 100];

  // ---------- small local helpers ----------
  const tidy = o => { Object.keys(o).forEach(k => { if (o[k] === undefined) delete o[k]; }); return o; };
  const num = (q, answer, hints, explain, extra) => tidy(Object.assign({ q, kind: 'number', answer, hints, explain }, extra));
  const ch = (q, answer, wrong, hints, explain, extra, n) => tidy(Object.assign({
    q, kind: 'choice', answer: String(answer), choices: U.choices(String(answer), wrong.map(String), n || 4), hints, explain
  }, extra));

  const tens = n => Math.floor(n / 10);
  const ones = n => n % 10;
  const tw = k => (k === 1 ? 'ten' : 'tens');
  const ow = k => (k === 1 ? 'one' : 'ones');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const nextHour = h => (h % 12) + 1;
  const twoNames = () => { const a = U.name(); let b = U.name(); while (b === a) b = U.name(); return [a, b]; };
  const EMOJI = ['🍎', '⭐', '🔵', '🌸', '🍪', '🐞'];

  // A step-1 number line that covers `vals`. Values in `hide` never land on a labelled tick,
  // so the answer is never printed under the line.
  function line(vals, hide, extra) {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const base = Math.floor(lo / 10) * 10;
    const mins = [base, base - 5, lo - 1, lo - 2, lo - 3, lo - 4, lo - 6, lo - 7].filter(m => m >= 0 && m <= lo);
    for (const min of mins) {
      for (const span of [10, 20]) {
        const max = min + span;
        if (max < hi) continue;
        for (const le of [5, 10, span]) {
          if (hide.every(h => (h - min) % le !== 0)) return Object.assign({ type: 'numberLine', min, max, step: 1, labelEvery: le }, extra);
        }
      }
    }
    const min = Math.max(0, lo - 3);
    return Object.assign({ type: 'numberLine', min, max: min + 20, step: 1, labelEvery: 20 }, extra);
  }

  // First concrete step for a + b or a − b (never the final answer).
  function addStep(a, b) {
    if (b < 10) return `Start at ${a} and count on ${b}.`;
    if (ones(b) === 0) return a < 10 ? `Start at ${b} and count on ${a}.` : `${a} has ${tens(a)} ${tw(tens(a))}. Add ${tens(b)} more ${tw(tens(b))}.`;
    return `Add the tens first: ${a} + ${tens(b) * 10} = ${a + tens(b) * 10}. Then add ${ones(b)}.`;
  }
  function subStep(a, b) {
    if (b < 10) return `Start at ${a} and count back ${b}.`;
    if (ones(b) === 0) return `${a} has ${tens(a)} ${tw(tens(a))}. Take away ${tens(b)} ${tw(tens(b))}.`;
    return `Take away the tens first: ${a} ${M} ${tens(b) * 10} = ${a - tens(b) * 10}. Then take away ${ones(b)}.`;
  }

  // =====================================================================
  // UNIT 1 — Numbers to 100
  // =====================================================================
  PMLM.registerUnit({ id: 'g2.u1', grade: 2, name: 'Numbers to 100', icon: '🔢' });

  // ---------- 1. Counting and patterns ----------
  function makeSeq(top, d, up, len, aligned) {
    const room = top - (len - 1) * d;
    const s = aligned ? d * R(0, Math.floor(room / d)) : R(1, room);
    const t = U.range(0, len - 1).map(i => s + i * d);
    return up ? t : t.reverse();
  }

  PMLM.registerSkill({
    id: 'g2.counting', grade: 2, unit: 'g2.u1', title: 'Counting and patterns', icon: '🐸',
    blurb: 'Count on and back, and count in 2s, 5s and 10s',
    lesson: [
      {
        title: 'Count on and count back',
        text: 'Counting **on** means the numbers get **bigger**: 23, 24, 25.\nCounting **back** means the numbers get **smaller**: 25, 24, 23.',
        visual: { type: 'numberLine', min: 20, max: 30, step: 1, labelEvery: 1, jumps: [{ from: 23, to: 24, label: '+1' }, { from: 24, to: 25, label: '+1' }] }
      },
      {
        title: 'Before and after',
        text: 'The number **after** is 1 more.\nThe number **before** is 1 less.\nAfter 39 comes **40**. Before 39 comes **38**.',
        visual: { type: 'numberLine', min: 35, max: 45, step: 1, labelEvery: 1, points: [{ at: 39, label: '39' }] }
      },
      {
        title: 'Skip counting',
        text: 'We can count in bigger jumps.\nIn **2s**: 2, 4, 6, 8, 10\nIn **5s**: 5, 10, 15, 20, 25\nIn **10s**: 10, 20, 30, 40, 50',
        visual: { type: 'sequence', terms: ['5', '10', '15', '20', '25'], step: '+5' }
      },
      {
        title: 'Tip: find the jump',
        text: 'Look at two numbers next to each other. How much does it go up or down? Then do the **same jump** again.\nCounting in 10s from 34: 34, 44, 54, 64. Only the **tens** digit changes!',
        visual: { type: 'sequence', terms: ['34', '44', '54', '64'], step: '+10' }
      },
      {
        title: 'Worked example',
        text: 'Find the missing number: 15, 20, 25, □\n1. Look at the jumps: 15 to 20 is +5. 20 to 25 is +5.\n2. So we are counting in **5s**.\n3. 25 + 5 = 30. The missing number is **30**.',
        visual: { type: 'sequence', terms: ['15', '20', '25', '?'], step: '+5' }
      }
    ],
    gen(level) {
      const top = TOP[level];
      const f = P(['near', 'seq', 'seq', 'rule', level > 1 ? 'seq' : 'near']);

      if (f === 'near') {
        const after = Math.random() < 0.5;
        let n;
        if (level > 1 && Math.random() < 0.5) n = after ? 10 * R(1, top / 10 - 1) + 9 : 10 * R(2, top / 10);
        else n = R(2, top - 1);
        const ans = after ? n + 1 : n - 1;
        const words = after ? P(['comes **after**', 'is **1 more** than']) : P(['comes **before**', 'is **1 less** than']);
        return num(`What number ${words} ${n}?`, ans,
          [after ? 'The number after is 1 more. Count on 1.' : 'The number before is 1 less. Count back 1.',
            `Find ${n} on the number line. Move 1 step to the ${after ? 'right' : 'left'}.`],
          after ? `${n} + 1 = ${ans}. The number after ${n} is **${ans}**.` : `${n} ${M} 1 = ${ans}. The number before ${n} is **${ans}**.`,
          { visual: line([n, ans], [ans], { points: [{ at: n, label: String(n) }, { at: ans, label: '?' }] }) });
      }

      const steps = level === 1 ? [1, 2, 2, 5] : level === 2 ? [1, 2, 5, 10, 10] : [2, 5, 10, 10];
      const d = P(steps);
      const up = Math.random() < (level === 1 ? 0.8 : 0.55);
      const aligned = d === 5 || (d === 2 && level < 3) || (d === 10 && level === 2 && Math.random() < 0.5);

      if (f === 'seq') {
        const len = level === 1 ? 4 : 5;
        const terms = makeSeq(top, d, up, len, aligned);
        const gap = level === 1 ? len - 1 : R(0, len - 1);
        const ans = terms[gap];
        const shown = terms.map((t, i) => (i === gap ? '□' : String(t)));
        let step;
        if (gap > 0) step = up ? `add ${d} to ${terms[gap - 1]}` : `take ${d} away from ${terms[gap - 1]}`;
        else step = up ? `take ${d} away from ${terms[1]}` : `add ${d} to ${terms[1]}`;
        return num(`What number is missing?\n${shown.join(', ')}`, ans,
          ['Look at two numbers next to each other. How much does it change each time?',
            `The numbers go ${up ? 'up' : 'down'} by ${d} each time. So ${step}.`],
          `The numbers go ${up ? 'up' : 'down'} by ${d} each time: ${terms.join(', ')}. The missing number is **${ans}**.`,
          { visual: { type: 'sequence', terms: terms.map((t, i) => (i === gap ? '?' : String(t))) } });
      }

      // 'rule' — name the pattern
      const terms = makeSeq(top, d, up, 4, aligned);
      const nm = (dd, u) => `Count ${u ? 'on' : 'back'} in ${dd}s`;
      const tempting = d === 10 ? 1 : d === 5 ? 10 : d === 2 ? 1 : 2;
      const wrong = [nm(d, !up), nm(tempting, up), ...U.shuffle([1, 2, 5, 10].filter(x => x !== d)).map(x => nm(x, up))];
      return ch(`How does this pattern go?\n${terms.join(', ')}`, nm(d, up), wrong,
        ['Look at the first two numbers. Is the second one bigger or smaller?',
          `Work out the jump from ${terms[0]} to ${terms[1]}.`],
        `Each number is ${d} ${up ? 'more' : 'less'} than the one before, so the answer is **${nm(d, up)}**.`,
        { visual: { type: 'sequence', terms: terms.map(String) } });
    }
  });

  // ---------- 2. Tens and ones ----------
  PMLM.registerSkill({
    id: 'g2.tensOnes', grade: 2, unit: 'g2.u1', title: 'Tens and ones', icon: '🧱',
    blurb: 'Split a number into tens and ones',
    lesson: [
      {
        title: 'Ten ones make a ten',
        text: 'When we have 10 ones, we can join them into **1 ten**.\nA ten is a stick of 10 cubes. Here is 1 ten and 3 ones: that is **13**.',
        visual: { type: 'base10', n: 13 }
      },
      {
        title: 'Reading tens and ones',
        text: 'This picture shows **3 tens** and **4 ones**.\n3 tens is 30. 30 and 4 more is **34**.',
        visual: { type: 'base10', n: 34 }
      },
      {
        title: 'Splitting a number',
        text: 'We can split (partition) a number into tens and ones.\n47 = 40 + 7\nThe **first digit** tells you the tens. The **last digit** tells you the ones.',
        visual: { type: 'bond', whole: 47, parts: [40, 7] }
      },
      {
        title: 'Tip: watch out!',
        text: '40 + 7 is **47**, not 407!\nThe 4 goes in the **tens** place and the 7 goes in the **ones** place.',
        visual: { type: 'placeValue', value: 47 }
      },
      {
        title: 'Worked example',
        text: 'How many tens and ones are in 62?\n1. Look at the first digit: 6. That means **6 tens**, which is 60.\n2. Look at the last digit: 2. That means **2 ones**.\n3. So 62 = 60 + 2.',
        visual: { type: 'base10', n: 62 }
      }
    ],
    gen(level) {
      const pickN = noZero => {
        let n;
        do { n = level === 1 ? R(10, 20) : level === 2 ? R(21, 50) : R(21, 99); } while (noZero && n % 10 === 0);
        return n;
      };
      const f = P(level === 1 ? ['read', 'read', 'count', 'part', 'build', 'make'] : ['read', 'count', 'part', 'build', 'make', 'value']);

      if (f === 'read') {
        const n = pickN(false), t = tens(n), o = ones(n);
        return num('What number do the blocks show?', n,
          ['Count the tens sticks first. Then count the ones cubes.',
            o === 0 ? 'There are no ones cubes. Count the tens sticks in 10s.' : `There ${t === 1 ? 'is' : 'are'} ${t} ${tw(t)}. That makes ${t * 10}. Now count on the ones.`],
          o === 0 ? `${t} ${tw(t)} make **${n}**.` : `${t} ${tw(t)} is ${t * 10}. ${t * 10} and ${o} more is **${n}**.`,
          { visual: { type: 'base10', n } });
      }
      if (f === 'count') {
        const n = pickN(true), t = tens(n), o = ones(n);
        const vis = level === 1 ? { type: 'base10', n } : undefined;
        if (Math.random() < 0.5) {
          return num(`${n} = □ ${tw(2)} and ${o} ${ow(o)}`, t,
            ['The first digit tells you how many tens.', `${n} = ${t * 10} + ${o}. How many tens make ${t * 10}?`],
            `${n} = ${t * 10} + ${o}, and ${t * 10} is ${t} ${tw(t)}. So the answer is **${t}**.`, { visual: vis });
        }
        return num(`${n} = ${t} ${tw(t)} and □ ones`, o,
          ['The last digit tells you how many ones.', `${t} ${tw(t)} make ${t * 10}. Work out ${n} ${M} ${t * 10}.`],
          `${n} = ${t * 10} + ${o}, so there are **${o}** ones.`, { visual: vis });
      }
      if (f === 'part') {
        const n = pickN(true), t = tens(n), o = ones(n);
        if (level === 3 && Math.random() < 0.35) {
          const k = R(1, t - 1), ans = n - k * 10;
          return num(`${n} = ${k * 10} + □`, ans,
            ['You can split a number in different ways, not only into tens and ones.', `Take ${k * 10} away from ${n}: ${n} ${M} ${k * 10}.`],
            `${n} ${M} ${k * 10} = ${ans}, so ${n} = ${k * 10} + **${ans}**.`,
            { visual: { type: 'bond', whole: n, parts: [k * 10, '?'] } });
        }
        if (Math.random() < 0.5) {
          return num(`${n} = ${t * 10} + □`, o,
            ['Split the number into tens and ones.', `${t * 10} is the tens part. What is left when you take ${t * 10} from ${n}?`],
            `${n} is ${t} ${tw(t)} and ${o} ${ow(o)}, so ${n} = ${t * 10} + **${o}**.`,
            { visual: { type: 'bond', whole: n, parts: [t * 10, '?'] } });
        }
        return num(`${n} = □ + ${o}`, t * 10,
          ['Split the number into tens and ones.', `${n} has ${t} ${tw(t)}. What ${t === 1 ? 'is 1 ten' : `are ${t} tens`} worth?`],
          `${n} is ${t} ${tw(t)} and ${o} ${ow(o)}. ${t} ${tw(t)} is ${t * 10}, so ${n} = **${t * 10}** + ${o}.`,
          { visual: { type: 'bond', whole: n, parts: ['?', o] } });
      }
      if (f === 'build') {
        const n = pickN(true), t = tens(n), o = ones(n);
        const wrong = [t * 100 + o, o !== t ? o * 10 + t : n + 10, t + o];
        return ch(`What is ${t * 10} + ${o}?`, n, wrong,
          ['The first number is the tens. The second number is the ones.', `Start at ${t * 10} and count on ${o}.`],
          `${t * 10} + ${o} is ${t} ${tw(t)} and ${o} ${ow(o)}. It is not ${t * 100 + o}. The answer is **${n}**.`);
      }
      if (f === 'make') {
        if (level === 3 && Math.random() < 0.3) {
          const t = R(2, 8), o2 = R(10, 15), ans = (t + 1) * 10 + (o2 - 10);
          return num(`What number has **${t} tens** and **${o2} ones**?`, ans,
            ['10 ones make 1 more ten.', `${o2} ones is 1 ten and ${o2 - 10} ${ow(o2 - 10)}.`],
            `${o2} ones is 1 ten and ${o2 - 10} ${ow(o2 - 10)}. So there are ${t + 1} tens and ${o2 - 10} ${ow(o2 - 10)}, which is **${ans}**.`);
        }
        const n = pickN(true), t = tens(n), o = ones(n);
        return num(`What number has **${t} ${tw(t)}** and **${o} ${ow(o)}**?`, n,
          ['Tens come first, then ones.', `${t} ${tw(t)} is ${t * 10}. Now add ${o} ${ow(o)}.`],
          `${t * 10} + ${o} = **${n}**.`);
      }
      // 'value' — value of a digit
      let n;
      do { n = pickN(true); } while (tens(n) === ones(n));
      const t = tens(n), o = ones(n);
      const askTens = Math.random() < 0.6;
      const d = askTens ? t : o, val = askTens ? t * 10 : o;
      const wrong = askTens ? [t, t * 100, n] : [o * 10, o * 100, n];
      return ch(`What is the value of the **${d}** in ${n}?`, val, wrong,
        ['Is the digit in the tens place or the ones place?',
          askTens ? `The ${t} is in the **tens** place. How much are ${t} tens worth?` : `The ${o} is in the **ones** place. How much are ${o} ${ow(o)} worth?`],
        `In ${n}, the ${d} is in the ${askTens ? 'tens' : 'ones'} place, so it is worth **${val}**.`,
        { visual: { type: 'placeValue', value: n, highlight: askTens ? 0 : 1 } });
    }
  });

  // ---------- 3. Compare and order ----------
  const signOf = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const cmpWord = (a, b) => (a < b ? 'less than' : a > b ? 'greater than' : 'equal to');
  const cmpHint = (a, b) => {
    if (a === b) return 'Check each digit. Are the tens the same? Are the ones the same?';
    if (a < 10 || b < 10) return `Count up from 0. Which do you reach first, ${a} or ${b}?`;
    if (tens(a) !== tens(b)) return `${a} has ${tens(a)} ${tw(tens(a))}. ${b} has ${tens(b)} ${tw(tens(b))}.`;
    return `Both have ${tens(a)} ${tw(tens(a))}. Now look at the ones: ${ones(a)} and ${ones(b)}.`;
  };

  PMLM.registerSkill({
    id: 'g2.compare', grade: 2, unit: 'g2.u1', title: 'Compare and order', icon: '⚖️',
    blurb: 'Use <, > and = to compare numbers',
    lesson: [
      {
        title: 'Which is bigger?',
        text: 'To compare two numbers, look at the **tens** first.\n52 has 5 tens. 38 has 3 tens. So **52 is bigger**.\nOn a number line, bigger numbers are further to the **right**.',
        visual: { type: 'numberLine', min: 30, max: 60, step: 2, labelEvery: 5, points: [{ at: 38, label: '38' }, { at: 52, label: '52' }] }
      },
      {
        title: 'Same tens? Look at the ones',
        text: '45 and 48 both have 4 tens.\nNow look at the ones: 8 is more than 5.\nSo **48 is bigger**.',
        visual: { type: 'table', headers: ['Number', 'Tens', 'Ones'], rows: [['45', '4', '5'], ['48', '4', '8']] }
      },
      {
        title: 'The signs <, > and =',
        text: '**>** means "is greater than": 9 > 4\n**<** means "is less than": 4 < 9\n**=** means "is equal to": 6 = 6\nTip: the open side of < and > always faces the **bigger** number, like a hungry mouth!'
      },
      {
        title: 'Putting numbers in order',
        text: 'To order numbers from smallest to biggest, find the **smallest** first, then the next one, and so on.\n23, 32, 38 is in order, smallest first.',
        visual: { type: 'numberLine', min: 20, max: 40, step: 1, labelEvery: 5, points: [{ at: 23, label: '23' }, { at: 32, label: '32' }, { at: 38, label: '38' }] }
      },
      {
        title: 'Worked example',
        text: 'Put <, > or = in the box: 63 □ 36\n1. Look at the tens: 63 has 6 tens. 36 has 3 tens.\n2. 6 tens is more than 3 tens, so 63 is bigger.\n3. The open side faces 63: **63 > 36**.',
        visual: { type: 'table', headers: ['Number', 'Tens', 'Ones'], rows: [['63', '6', '3'], ['36', '3', '6']] }
      }
    ],
    gen(level) {
      const top = TOP[level];
      const f = P(level === 1 ? ['sign', 'sign', 'true', 'big', 'order']
        : level === 2 ? ['sign', 'true', 'big', 'order', 'between'] : ['sign', 'true', 'big', 'order', 'between', 'expr']);

      const pair = allowEqual => {
        const r = Math.random();
        if (allowEqual && r < 0.15) { const a = R(3, top); return [a, a]; }
        if (top > 20 && r < 0.45) {
          let t, o;
          do { t = R(1, 9); o = R(1, 9); } while (t === o || t * 10 + o > top || o * 10 + t > top);
          return U.shuffle([t * 10 + o, o * 10 + t]);
        }
        let a, b;
        if (r < 0.7) {
          do { const t = R(1, Math.floor((top - 1) / 10)); a = t * 10 + R(0, 9); b = t * 10 + R(0, 9); } while (a === b || a > top || b > top);
          return [a, b];
        }
        do { a = R(1, top); b = R(1, top); } while (a === b);
        return [a, b];
      };
      const someNumbers = k => {
        const set = new Set();
        const a = R(level === 1 ? 5 : 12, top);
        set.add(a);
        const sw = ones(a) * 10 + tens(a);
        if (a >= 10 && ones(a) > 0 && sw <= top && sw !== a) set.add(sw);
        let guard = 0;
        while (set.size < k && guard++ < 200) {
          const b = Math.random() < 0.5 ? tens(a) * 10 + R(0, 9) : R(1, top);
          if (b >= 1 && b <= top) set.add(b);
        }
        return U.shuffle([...set]);
      };

      if (f === 'sign') {
        const [a, b] = pair(true);
        const s = signOf(a, b);
        return ch(`Which sign goes in the box?\n${a} □ ${b}`, s, ['<', '>', '='],
          ['Look at the tens first. If the tens are the same, look at the ones.', cmpHint(a, b)],
          a === b ? `${a} and ${b} are the same number, so **${a} = ${b}**.`
            : `The open side faces the bigger number. ${a} is ${cmpWord(a, b)} ${b}, so **${a} ${s} ${b}**.`, {}, 3);
      }
      if (f === 'true') {
        const [a, b] = pair(false);
        const s = signOf(a, b);
        return ch('Which one is **true**?', `${a} ${s} ${b}`, [`${a} > ${b}`, `${a} < ${b}`, `${a} = ${b}`],
          ['> means "is greater than". < means "is less than".', cmpHint(a, b)],
          `${a} is ${cmpWord(a, b)} ${b}, so the true one is **${a} ${s} ${b}**.`, {}, 3);
      }
      if (f === 'big') {
        const nums = someNumbers(4);
        const sorted = nums.slice().sort((x, y) => x - y);
        const big = Math.random() < 0.5;
        const ans = big ? sorted[sorted.length - 1] : sorted[0];
        return ch(`Which number is the **${big ? 'biggest' : 'smallest'}**?`, ans, nums.filter(x => x !== ans),
          ['Look at the tens digits first. Then look at the ones.',
            big ? `${sorted[0]} is the smallest, so it is not the answer. Compare the others.` : `${sorted[sorted.length - 1]} is the biggest, so it is not the answer. Compare the others.`],
          `In order: ${sorted.join(', ')}. The ${big ? 'biggest' : 'smallest'} is **${ans}**.`, {}, nums.length);
      }
      if (f === 'order') {
        let nums = someNumbers(3);
        const sorted = nums.slice().sort((x, y) => x - y);
        const smallFirst = level === 1 || Math.random() < 0.7;
        const correct = smallFirst ? sorted : sorted.slice().reverse();
        while (nums.join() === correct.join()) nums = U.shuffle(nums);
        const s = arr => arr.join(', ');
        const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(p => p.map(i => correct[i]));
        const byOnes = correct.slice().sort((x, y) => ones(x) - ones(y) || x - y);
        const wrong = [correct.slice().reverse(), byOnes, ...U.shuffle(perms)].map(s).filter(x => x !== s(correct));
        return ch(`Put these numbers in order, **${smallFirst ? 'smallest' : 'biggest'}** first.\n${s(nums)}`, s(correct), wrong,
          [`Find the ${smallFirst ? 'smallest' : 'biggest'} number first. Look at the tens.`, `${correct[0]} goes first. Which number comes next?`],
          `${correct[0]} is the ${smallFirst ? 'smallest' : 'biggest'}, then ${correct[1]}, then ${correct[2]}. The order is **${s(correct)}**.`);
      }
      if (f === 'between') {
        const t = R(1, top / 10 - 1), lo = t * 10, hi = lo + 10;
        const ans = lo + R(1, 9);
        const sw = ones(ans) * 10 + tens(ans);
        const cands = [sw, lo - R(1, 9), hi + R(1, 9), hi + 10 + R(1, 9), lo - 10 + R(1, 9)]
          .filter(x => x >= 1 && x <= 100 && (x < lo || x > hi));
        return ch(`Which number is **between** ${lo} and ${hi}?`, ans, cands,
          [`It must be bigger than ${lo} and smaller than ${hi}.`, `Numbers between ${lo} and ${hi} all have ${t} ${tw(t)}.`],
          `${ans} is bigger than ${lo} and smaller than ${hi}, so the answer is **${ans}**.`);
      }
      // 'expr' — compare a split number with a number
      const t = R(1, 9), o = R(1, 9), n = t * 10 + o;
      const x = P([n, o * 10 + t, n + 1, n - 1, n + 10, n - 10].filter(v => v >= 1 && v <= 100));
      const left = Math.random() < 0.7 ? `${t * 10} + ${o}` : `${o} + ${t * 10}`;
      const s = signOf(n, x);
      return ch(`Which sign goes in the box?\n${left} □ ${x}`, s, ['<', '>', '='],
        ['Work out the left side first.', `${left} is ${t} ${tw(t)} and ${o} ${ow(o)}.`],
        `${left} = ${n}. ${n} is ${cmpWord(n, x)} ${x}, so the sign is **${s}**.`, {}, 3);
    }
  });

  // ---------- 4. Odd and even ----------
  PMLM.registerSkill({
    id: 'g2.oddEven', grade: 2, unit: 'g2.u1', title: 'Odd and even', icon: '🧦',
    blurb: 'Find odd and even numbers',
    lesson: [
      {
        title: 'Even numbers make pairs',
        text: 'An **even** number can be put into pairs with **none left over**.\n8 socks make 4 pairs. 8 is even.',
        visual: { type: 'objects', groups: [2, 2, 2, 2], emoji: '🧦' }
      },
      {
        title: 'Odd numbers have 1 left over',
        text: 'An **odd** number always has **1 left over** when you make pairs.\n7 socks make 3 pairs and 1 is left over. 7 is odd.',
        visual: { type: 'objects', groups: [2, 2, 2, 1], emoji: '🧦' }
      },
      {
        title: 'Look at the last digit',
        text: 'Even numbers end in **0, 2, 4, 6 or 8**.\nOdd numbers end in **1, 3, 5, 7 or 9**.\nFor a big number, only the **ones digit** matters!',
        visual: { type: 'sequence', terms: ['2', '4', '6', '8', '10'], step: '+2' }
      },
      {
        title: 'Worked example',
        text: 'Is 47 odd or even?\n1. Look at the ones digit: it is **7**.\n2. 7 is one of 1, 3, 5, 7, 9, so it is odd.\n3. So **47 is odd**.',
        visual: { type: 'placeValue', value: 47, highlight: 1 }
      }
    ],
    gen(level) {
      const top = TOP[level];
      const f = P(['is', 'is', 'which', 'next', 'pairs']);
      const oe = n => (n % 2 === 0 ? 'even' : 'odd');

      if (f === 'is') {
        const n = R(2, top);
        const pairsLine = level === 1 ? ` ${n} makes ${Math.floor(n / 2)} ${Math.floor(n / 2) === 1 ? 'pair' : 'pairs'}${n % 2 ? ' and 1 left over' : ' with none left over'}.` : '';
        return ch(`Is **${n}** odd or even?`, cap(oe(n)), ['Odd', 'Even'],
          [level === 1 ? 'Can you put them all into pairs, with none left over?' : 'Only the ones digit matters.',
            `${n} ends in ${ones(n)}. Is ${ones(n)} one of 0, 2, 4, 6, 8?`],
          `${n} ends in ${ones(n)}.${pairsLine} So ${n} is **${oe(n)}**.`,
          { visual: level === 1 ? { type: 'objects', groups: [n], emoji: '🧦' } : undefined }, 2);
      }
      if (f === 'which') {
        const want = P(['odd', 'even']);
        let ans;
        do { ans = R(2, top - 1); } while (oe(ans) !== want);
        const wrong = U.shuffle([ans + 1, ans - 1, ans + 3, ans - 3, ans + 5, ans + 11, ans - 11, ans + 9]
          .filter(x => x >= 1 && x <= top && oe(x) !== want));
        return ch(`Which number is **${want}**?`, ans, wrong,
          [want === 'even' ? 'Even numbers end in 0, 2, 4, 6 or 8.' : 'Odd numbers end in 1, 3, 5, 7 or 9.',
            'Look only at the last digit of each number.'],
          `${ans} ends in ${ones(ans)}, which is ${want}. The answer is **${ans}**.`);
      }
      if (f === 'next') {
        const want = P(['odd', 'even']);
        const n = R(1, top - 2);
        const ans = oe(n + 1) === want ? n + 1 : n + 2;
        return num(`What is the next **${want}** number after ${n}?`, ans,
          [`${cap(want)} numbers go up in 2s.`, `Count on from ${n}, one number at a time. Stop at the first ${want} number.`],
          `${n + 1} is ${oe(n + 1)}${ans === n + 2 ? `, so go on 1 more to ${n + 2}` : ''}. The next ${want} number is **${ans}**.`);
      }
      // 'pairs' — word problem
      const n = R(level === 1 ? 4 : 10, top);
      const name = U.name();
      const socks = Math.random() < 0.5;
      const even = n % 2 === 0;
      let q, ans, opts;
      if (socks) {
        q = `${name} has ${n} socks. Can ${name} put them all into pairs?`;
        opts = ['Yes, with none left over', 'No, 1 sock is left over'];
        ans = even ? opts[0] : opts[1];
      } else {
        q = `There are ${n} children. They get into pairs. Is 1 child left without a partner?`;
        opts = ['Yes, 1 child is left over', 'No, everyone has a partner'];
        ans = even ? opts[1] : opts[0];
      }
      return ch(q, ans, opts,
        ['Even numbers make pairs with none left over. Odd numbers have 1 left over.', `Is ${n} odd or even? Look at its last digit: ${ones(n)}.`],
        `${n} is ${oe(n)}. ${even ? `It makes ${n / 2} pairs with none left over` : `It makes ${(n - 1) / 2} pairs and 1 is left over`}. So the answer is: **${ans}**.`,
        { visual: n <= 20 ? { type: 'objects', groups: [n], emoji: socks ? '🧦' : '🙂' } : undefined }, 2);
    }
  });

  // =====================================================================
  // UNIT 2 — Add and subtract
  // =====================================================================
  PMLM.registerUnit({ id: 'g2.u2', grade: 2, name: 'Add and subtract', icon: '➕' });

  // ---------- 5. Number bonds ----------
  const bondNudge = T => (T === 10 ? 'Think of your pairs that make 10.'
    : T === 20 ? 'A pair to 20 is like a pair to 10, with one more ten.'
      : 'A pair of tens to 100 is like a pair to 10.');
  const bondStep = (a, T) => {
    if (T === 10) return `Count on from ${a} to 10. How many jumps?`;
    if (T === 20) {
      if (a === 10) return 'Count on from 10 to 20. How many jumps?';
      if (a > 10) return `${a} is 10 + ${a - 10}. What goes with ${a - 10} to make 10?`;
      return `First jump from ${a} to 10. Then jump from 10 to 20.`;
    }
    return `Think in tens: ${a / 10} tens + □ tens = 10 tens. What goes with ${a / 10} to make 10?`;
  };
  const BOND_THINGS = [['stars', '⭐'], ['apples', '🍎'], ['dots', '🔵'], ['flowers', '🌸']];

  PMLM.registerSkill({
    id: 'g2.bonds', grade: 2, unit: 'g2.u2', title: 'Number bonds', icon: '🔗',
    blurb: 'Pairs of numbers that make 10, 20 and 100',
    lesson: [
      {
        title: 'Pairs that make 10',
        text: 'Some pairs of numbers make **10**:\n0 + 10, 1 + 9, 2 + 8, 3 + 7, 4 + 6, 5 + 5\nLearn these by heart. They help with lots of maths!',
        visual: { type: 'bond', whole: 10, parts: [3, 7] }
      },
      {
        title: 'See the pair',
        text: 'Here are 10 stars in two groups.\n6 in one group and 4 in the other.\n6 + 4 = 10, and 10 − 6 = 4.',
        visual: { type: 'objects', groups: [6, 4], emoji: '⭐' }
      },
      {
        title: 'Pairs that make 20',
        text: 'If 3 + 7 = 10, then **13 + 7 = 20**.\nJust add one more ten!',
        visual: { type: 'bond', whole: 20, parts: [13, 7] }
      },
      {
        title: 'Pairs of tens that make 100',
        text: 'If 3 + 7 = 10, then **30 + 70 = 100**.\n3 tens and 7 tens make 10 tens, and 10 tens is 100.',
        visual: { type: 'bond', whole: 100, parts: [30, 70] }
      },
      {
        title: 'Worked example',
        text: 'What goes with 6 to make 10?  6 + □ = 10\n1. Start at 6.\n2. Count on to 10: 7, 8, 9, 10. That is 4 jumps.\n3. So 6 + **4** = 10.',
        visual: { type: 'numberLine', min: 0, max: 10, step: 1, labelEvery: 1, points: [{ at: 6, label: '6' }], jumps: [{ from: 6, to: 7, label: '1' }, { from: 7, to: 8, label: '2' }, { from: 8, to: 9, label: '3' }, { from: 9, to: 10, label: '4' }] }
      }
    ],
    gen(level) {
      const T = level === 1 ? 10 : level === 2 ? P([10, 20, 20]) : P([100, 100, 100, 20]);
      const a = T === 100 ? 10 * R(1, 9) : T === 20 ? R(1, 19) : R(1, 9);
      const b = T - a;
      const f = P(['box', 'box', 'sub', 'more', 'pair']);

      if (f === 'box') {
        const form = R(0, 2);
        const q = form === 0 ? `${a} + □ = ${T}` : form === 1 ? `□ + ${a} = ${T}` : `${T} = ${a} + □`;
        return num(q, b, [bondNudge(T), bondStep(a, T)],
          `${a} + ${b} = ${T}, so the missing number is **${b}**.`,
          { visual: { type: 'bond', whole: T, parts: form === 1 ? ['?', a] : [a, '?'] } });
      }
      if (f === 'sub') {
        return num(`${T} ${M} ${a} = □`, b, [bondNudge(T), `Think: ${a} + □ = ${T}.`],
          `${a} + ${b} = ${T}, so ${T} ${M} ${a} = **${b}**.`,
          { visual: level < 3 ? { type: 'bond', whole: T, parts: [a, '?'] } : undefined });
      }
      if (f === 'more') {
        if (T === 100) {
          return num(`The blocks show ${a}. How much more makes 100?`, b,
            ['100 is 10 tens. Count the tens sticks.', `There ${a === 10 ? 'is 1 ten' : `are ${a / 10} tens`}. How many more tens make 10 tens?`],
            `${a} + ${b} = 100. You need **${b}** more.`, { visual: { type: 'base10', n: a } });
        }
        const [w, e] = P(BOND_THINGS);
        return num(`Here are ${a} ${w}. How many more ${w} make ${T}?`, b,
          [bondNudge(T), bondStep(a, T)],
          `${a} + ${b} = ${T}. You need **${b}** more.`, { visual: { type: 'objects', groups: [a], emoji: e } });
      }
      // 'pair' — which pair makes T?
      let cands;
      if (T === 10) cands = [[a, b + 1], [a, b - 1], [a + 1, b + 1], [a - 1, b]];
      else if (T === 20) cands = [[a, b + 1], [a, b - 1], a >= 10 ? [a - 10, b] : [a + 10, b], [a + 1, b + 1]];
      else cands = [[a, b + 10], [a, b - 10], [a / 10, b / 10], [a + 10, b + 10]];
      const wrongPairs = U.shuffle(cands.filter(([x, y]) => x >= 0 && y >= 0 && x + y !== T));
      const wrong = wrongPairs.map(([x, y]) => `${x} + ${y}`);
      const [cx, cy] = wrongPairs[0];
      return ch(`Which pair makes **${T}**?`, `${a} + ${b}`, wrong,
        [T === 10 ? 'Add each pair. Which one makes exactly 10?' : T === 20 ? 'For 20, the ones must make 10, plus one more ten.' : 'For 100, the tens must make 10 tens.',
          `Try ${cx} + ${cy}: that makes ${cx + cy}, so it is not that one.`],
        `${a} + ${b} = ${T}, so the answer is **${a} + ${b}**.`);
    }
  });

  // ---------- 6. Add and subtract 10s ----------
  PMLM.registerSkill({
    id: 'g2.addTens', grade: 2, unit: 'g2.u2', title: 'Add and subtract tens', icon: '🔟',
    blurb: 'Add or take away tens, like 34 + 10 and 58 − 20',
    lesson: [
      {
        title: '10 more',
        text: 'When you add 10, the **tens digit goes up by 1**.\nThe ones digit stays the same.\n34 + 10 = **44**',
        visual: { type: 'numberLine', min: 30, max: 50, step: 1, labelEvery: 5, points: [{ at: 34, label: '34' }, { at: 44, label: '44' }], jumps: [{ from: 34, to: 44, label: '+10' }] }
      },
      {
        title: 'Add a ten stick',
        text: '34 is 3 tens and 4 ones.\nAdd 1 more ten stick: now there are 4 tens and 4 ones.\nThat is **44**.',
        visual: { type: 'base10', n: 34 }
      },
      {
        title: 'Taking away tens',
        text: 'To take away 20, take away **2 tens**.\nThe ones stay the same.\n58 − 20: 5 tens take away 2 tens is 3 tens. So 58 − 20 = **38**.',
        visual: { type: 'base10', n: 58 }
      },
      {
        title: 'Tip: count in tens',
        text: 'For 26 + 30, count on in tens from 26:\n36, 46, **56**.\nOnly the tens digit changes!',
        visual: { type: 'numberLine', min: 20, max: 60, step: 2, labelEvery: 5, points: [{ at: 26, label: '26' }, { at: 56, label: '56' }], jumps: [{ from: 26, to: 36, label: '+10' }, { from: 36, to: 46, label: '+10' }, { from: 46, to: 56, label: '+10' }] }
      },
      {
        title: 'Worked example',
        text: 'Work out 72 − 30.\n1. 72 is 7 tens and 2 ones.\n2. Take away 3 tens: 7 tens − 3 tens = 4 tens.\n3. The ones stay 2. So 72 − 30 = **42**.',
        visual: { type: 'base10', n: 72 }
      }
    ],
    gen(level) {
      const top = TOP[level];
      const f = P(level === 1 ? ['calc', 'calc', 'words', 'choice'] : ['calc', 'words', 'missing', 'jumps', 'choice']);
      let n, k, add, ans;
      for (let i = 0; i < 1000; i++) {
        add = Math.random() < 0.55;
        k = level === 1 ? 1 : level === 2 ? R(1, 2) : R(1, 6);
        n = R(1, top);
        if (n % 10 === 0 && Math.random() < 0.85) continue;
        ans = add ? n + 10 * k : n - 10 * k;
        if (ans < 1 || ans > top) continue;
        if (f === 'jumps' && (k > 3 || n % 10 === 0 || (k > 1 && n % 2 === 1))) continue;
        break;
      }
      const K = 10 * k, tn = tens(n), on = ones(n), sign = add ? '+' : M;
      const hint1 = add ? 'Adding tens only changes the tens digit. The ones stay the same.' : 'Taking away tens only changes the tens digit. The ones stay the same.';
      const hint2 = n < 10 ? `${n} has no tens yet. Add ${k} ${tw(k)}.`
        : !add && tn === k ? (k === 1 ? `Find ${n} on a number line. Count back 10 ones.` : `Count back in tens from ${n}: ${n - 10}, ... Do ${k} jumps of 10.`)
          : `${n} is ${tn} ${tw(tn)} and ${on} ${ow(on)}. ${add ? 'Add' : 'Take away'} ${k} ${tw(k)}.`;
      const tensAfter = add ? tn + k : tn - k;
      const explain = n < 10 ? `${n} has no tens. Add ${k} ${tw(k)}: ${k} ${tw(k)} and ${on} ${ow(on)} is **${ans}**.`
        : `${tn} ${tw(tn)} ${sign} ${k} ${tw(k)} = ${tensAfter} ${tw(tensAfter)}. The ones stay ${on}. So ${n} ${sign} ${K} = **${ans}**.`;

      if (f === 'calc') {
        return num(`${n} ${sign} ${K} = □`, ans, [hint1, hint2], explain, { visual: { type: 'base10', n } });
      }
      if (f === 'words') {
        return num(`What is **${K} ${add ? 'more' : 'less'}** than ${n}?`, ans, [hint1, hint2], explain);
      }
      if (f === 'missing') {
        return num(`${n} ${sign} □ = ${ans}`, K,
          ['Look at the tens digits. The ones did not change.', `The tens went from ${tn} to ${tens(ans)}.`],
          `${tn} ${tw(tn)} to ${tens(ans)} ${tw(tens(ans))} is ${k} ${tw(k)}, which is ${K}. So □ = **${K}**.`);
      }
      if (f === 'jumps') {
        const lo = Math.min(n, ans);
        const min = tens(lo) * 10, max = min + 10 * (k + 1);
        const step = max - min <= 20 ? 1 : 2;
        const jumps = U.range(0, k - 1).map(i => ({ from: add ? n + 10 * i : n - 10 * i, to: add ? n + 10 * (i + 1) : n - 10 * (i + 1), label: add ? '+10' : `${M}10` }));
        const path = [n, ...jumps.map(j => j.to)];
        return num(`${n} ${sign} ${K} = □\nUse the jumps of 10 on the number line.`, ans,
          ['Each jump is 10. Only the tens digit changes.',
            k === 1 ? hint2 : `The first jump goes from ${n} to ${jumps[0].to}. Keep jumping.`],
          `${path.slice(0, -1).join(', ')}, then **${ans}**. So ${n} ${sign} ${K} = **${ans}**.`,
          { visual: { type: 'numberLine', min, max, step, labelEvery: 10 / step, points: [{ at: n, label: String(n) }, { at: ans, label: '?' }], jumps } });
      }
      // 'choice' — common mistakes
      const wrong = add ? [n + k, k > 1 ? n + 10 : n + 20, n - K, ans + 1, ans - 1]
        : [n - k, k > 1 ? n - 10 : n - 20, n + K, ans + 1, ans - 1];
      return ch(`What is ${n} ${sign} ${K}?`, ans, wrong.filter(x => x >= 0 && x !== ans), [hint1, hint2], explain);
    }
  });

  // ---------- 7. 2-digit ± 1-digit ----------
  function prob1(level) {
    const top = TOP[level];
    const wantCross = Math.random() < [0, 0.5, 0.6, 0.8][level];
    for (let i = 0; i < 1000; i++) {
      const add = Math.random() < 0.5;
      const b = R(2, 9);
      if (add) {
        const a = level === 1 ? R(2, 18) : R(11, top - 2);
        const s = a + b;
        if (s > top) continue;
        const o = ones(a) + b;
        if (o === 10 && Math.random() < 0.7) continue;
        if ((o > 10) !== wantCross) continue;
        if (level === 1 && a < 10 && !wantCross) continue;
        return { a, b, add, ans: s, cross: o > 10 };
      }
      const a = level === 1 ? R(11, 19) : R(11, top);
      const cross = ones(a) < b;
      if (cross !== wantCross) continue;
      return { a, b, add, ans: a - b, cross };
    }
    return { a: 46, b: 7, add: true, ans: 53, cross: true };
  }

  PMLM.registerSkill({
    id: 'g2.addOnes', grade: 2, unit: 'g2.u2', title: 'Add and subtract ones', icon: '🎯',
    blurb: 'Like 46 + 7 and 53 − 8, going through a ten',
    lesson: [
      {
        title: 'Adding ones',
        text: 'To work out 23 + 4, keep the tens the same and add the ones.\n3 + 4 = 7, so 23 + 4 = **27**.',
        visual: { type: 'base10', n: 23 }
      },
      {
        title: 'Going through a ten',
        text: '46 + 7: the ones make more than 10!\nSplit 7 into **4 + 3**.\n46 + 4 = 50. Then 50 + 3 = **53**.',
        visual: { type: 'numberLine', min: 45, max: 55, step: 1, labelEvery: 5, points: [{ at: 46, label: '46' }, { at: 53, label: '53' }], jumps: [{ from: 46, to: 50, label: '+4' }, { from: 50, to: 53, label: '+3' }] }
      },
      {
        title: 'Taking away through a ten',
        text: '53 − 8: split 8 into **3 + 5**.\n53 − 3 = 50. Then 50 − 5 = **45**.',
        visual: { type: 'numberLine', min: 40, max: 55, step: 1, labelEvery: 5, points: [{ at: 53, label: '53' }, { at: 45, label: '45' }], jumps: [{ from: 53, to: 50, label: '−3' }, { from: 50, to: 45, label: '−5' }] }
      },
      {
        title: 'Tip: use your pairs to 10',
        text: 'Pairs to 10 tell you how far it is to the next ten.\n46 needs **4** to make 50, because 6 + 4 = 10.',
        visual: { type: 'bond', whole: 10, parts: [6, 4] }
      },
      {
        title: 'Worked example',
        text: 'Work out 38 + 5.\n1. 38 needs 2 to make 40. Split 5 into 2 + 3.\n2. 38 + 2 = 40.\n3. 40 + 3 = **43**.',
        visual: { type: 'numberLine', min: 35, max: 45, step: 1, labelEvery: 5, points: [{ at: 38, label: '38' }, { at: 43, label: '43' }], jumps: [{ from: 38, to: 40, label: '+2' }, { from: 40, to: 43, label: '+3' }] }
      }
    ],
    gen(level) {
      const { a, b, add, ans, cross } = prob1(level);
      const sign = add ? '+' : M;
      const o = ones(a), t = tens(a);
      const zeroOnes = !add && o === 0; // like 40 − 6
      let ten, n1, rest;
      if (add) { ten = (t + 1) * 10; n1 = ten - a; rest = b - n1; } else { ten = t * 10; n1 = o; rest = b - o; }

      let hints, explain;
      if (add && cross) {
        hints = ['Make the next ten first. Then add the rest.', `${a} + ${n1} = ${ten}. You still have ${rest} more to add.`];
        explain = `${a} + ${n1} = ${ten}, then ${ten} + ${rest} = **${ans}**.`;
      } else if (add) {
        if (a < 10) {
          hints = ['Count on from the bigger number.', `Start at ${a} and count on ${b}.`];
          explain = `${a} + ${b} = **${ans}**.`;
        } else if (o + b === 10) {
          hints = ['Keep the tens. Add the ones.', `${o} + ${b} = 10. That makes a new ten!`];
          explain = `${o} + ${b} = 10, which makes a new ten. So ${a} + ${b} = **${ans}**.`;
        } else {
          hints = ['Keep the tens. Add the ones.', `${o} + ${b} = ${o + b}. The ${t} ${tw(t)} ${t === 1 ? 'stays' : 'stay'} the same.`];
          explain = `${o} + ${b} = ${o + b}, so ${a} + ${b} = **${ans}**.`;
        }
      } else if (cross && zeroOnes) {
        hints = ['Break one ten into ones.', `${a} is ${a - 10} and 10. 10 ${M} ${b} = ${10 - b}.`];
        explain = `${a} = ${a - 10} + 10. 10 ${M} ${b} = ${10 - b}, and ${a - 10} + ${10 - b} = **${ans}**.`;
      } else if (cross) {
        hints = ['Take away to get back to a ten first. Then take away the rest.', `${a} ${M} ${n1} = ${ten}. You still have ${rest} more to take away.`];
        explain = `${a} ${M} ${n1} = ${ten}, then ${ten} ${M} ${rest} = **${ans}**.`;
      } else {
        hints = ['Keep the tens. Take away from the ones.', `${o} ${M} ${b} = ${o - b}. The ${t} ${tw(t)} ${t === 1 ? 'stays' : 'stay'} the same.`];
        explain = `${o} ${M} ${b} = ${o - b}, so ${a} ${M} ${b} = **${ans}**.`;
      }

      const f = P(cross ? (level === 1 ? ['calc', 'line', 'choice'] : ['calc', 'line', 'split', 'choice']) : ['calc', 'calc', 'choice']);
      if (f === 'line') {
        const jumps = zeroOnes ? [{ from: a, to: ans, label: `${M}${b}` }]
          : [{ from: a, to: ten, label: `${sign}${n1}` }, { from: ten, to: ans, label: `${sign}${rest}` }];
        return num(`${a} ${sign} ${b} = □\nUse the jumps on the number line.`, ans, hints, explain,
          { visual: line([a, ans], [ans], { points: [{ at: a, label: String(a) }, { at: ans, label: '?' }], jumps }) });
      }
      if (f === 'split' && !zeroOnes) {
        if (add) {
          return num(`To work out ${a} + ${b}, first make a ten.\n${a} + □ = ${ten}`, n1,
            [`What do you add to ${o} ones to make 10?`, `${o} + □ = 10 is a pair to 10.`],
            `${a} + ${n1} = ${ten}, then ${ten} + ${rest} = ${ans}. The missing number is **${n1}**.`);
        }
        return num(`To work out ${a} ${M} ${b}, first get back to a ten.\n${a} ${M} □ = ${ten}`, n1,
          ['How many ones do you take away to reach the ten?', `Count back from ${a} to ${ten}. How many jumps?`],
          `${a} ${M} ${n1} = ${ten}, then ${ten} ${M} ${rest} = ${ans}. The missing number is **${n1}**.`);
      }
      if (f === 'choice') {
        let wrong;
        if (add) wrong = cross ? [ans - 10, ...(a >= 10 ? [`${t}${o + b}`] : []), ans - 1, ans + 1] : [ans + 10, ans - 1, ans + 1];
        else wrong = cross ? [zeroOnes ? t * 10 + b : t * 10 + (b - o), ans + 1, ans + 10, ans - 1] : [ans - 10, ans + 1, ans - 1];
        return ch(`What is ${a} ${sign} ${b}?`, ans, wrong.filter(x => typeof x === 'string' || x >= 0), hints, explain);
      }
      return num(`${a} ${sign} ${b} = □`, ans, hints, explain,
        { visual: level === 1 && add && a < 10 ? { type: 'objects', groups: [a, b], emoji: P(EMOJI) } : undefined });
    }
  });

  // ---------- 8. 2-digit ± 2-digit ----------
  function prob2(level) {
    const top = level === 1 ? 50 : 100;
    const wantCross = level === 3 ? Math.random() < 0.7 : false;
    for (let i = 0; i < 1000; i++) {
      const add = Math.random() < 0.5;
      let a, b;
      if (add) { a = R(11, top - 10); b = R(10, top - 10); if (a + b > top) continue; } else { a = R(20, top); b = R(10, a - 1); }
      if ((ones(a) === 0 || ones(b) === 0) && Math.random() < 0.75) continue;
      const cross = add ? ones(a) + ones(b) >= 10 : ones(a) < ones(b);
      if (cross !== wantCross) continue;
      return { a, b, add, ans: add ? a + b : a - b, cross };
    }
    return { a: 34, b: 25, add: true, ans: 59, cross: false };
  }

  PMLM.registerSkill({
    id: 'g2.add2digit', grade: 2, unit: 'g2.u2', title: 'Two 2-digit numbers', icon: '🧮',
    blurb: 'Add and subtract numbers like 34 + 25 and 67 − 23',
    lesson: [
      {
        title: 'Tens and ones',
        text: 'To add 34 + 25, add the **tens**, then add the **ones**.\nTens: 30 + 20 = 50\nOnes: 4 + 5 = 9\nTogether: 50 + 9 = **59**',
        visual: { type: 'table', headers: ['', 'Tens', 'Ones'], rows: [['34', '3', '4'], ['25', '2', '5'], ['Total', '5', '9']] }
      },
      {
        title: 'Jump on a number line',
        text: '36 + 22: start at 36.\nJump on 2 tens: 46, 56.\nThen jump on 2 ones: **58**.',
        visual: { type: 'numberLine', min: 30, max: 60, step: 2, labelEvery: 5, points: [{ at: 36, label: '36' }, { at: 58, label: '58' }], jumps: [{ from: 36, to: 46, label: '+10' }, { from: 46, to: 56, label: '+10' }, { from: 56, to: 58, label: '+2' }] }
      },
      {
        title: 'Taking away',
        text: '67 − 23: take away the tens first.\n67 − 20 = 47\nThen take away the ones: 47 − 3 = **44**.',
        visual: { type: 'base10', n: 67 }
      },
      {
        title: 'When the ones go past 10',
        text: '38 + 25: tens first, 38 + 20 = 58.\nThen add 5 ones through the ten:\n58 + 2 = 60, then 60 + 3 = **63**.',
        visual: { type: 'numberLine', min: 55, max: 65, step: 1, labelEvery: 5, points: [{ at: 58, label: '58' }, { at: 63, label: '63' }], jumps: [{ from: 58, to: 60, label: '+2' }, { from: 60, to: 63, label: '+3' }] }
      },
      {
        title: 'Worked example',
        text: 'Work out 45 + 32.\n1. Add the tens: 45 + 30 = 75.\n2. Add the ones: 75 + 2 = 77.\n3. So 45 + 32 = **77**.',
        visual: { type: 'base10', n: 45 }
      }
    ],
    gen(level) {
      const { a, b, add, ans, cross } = prob2(level);
      const sign = add ? '+' : M;
      const ta = tens(a), oa = ones(a), tb = tens(b), ob = ones(b);
      const mid = add ? a + tb * 10 : a - tb * 10;
      const hints = add
        ? ['Add the tens first, then add the ones.', ob === 0 ? `${a} has ${ta} ${tw(ta)}. Add ${tb} more ${tw(tb)}.` : `${a} + ${tb * 10} = ${mid}. Now add ${ob}.`]
        : ['Take away the tens first, then the ones.', ob === 0 ? `${a} has ${ta} ${tw(ta)}. Take away ${tb} ${tw(tb)}.` : `${a} ${M} ${tb * 10} = ${mid}. Now take away ${ob}.`];
      const working = ob === 0 ? `${a} ${sign} ${b} = ${ans}` : `${a} ${sign} ${tb * 10} = ${mid}. Then ${mid} ${sign} ${ob} = ${ans}`;
      const explain = ob === 0 ? `${ta} ${tw(ta)} ${sign} ${tb} ${tw(tb)} = ${tens(mid)} tens, and the ones stay ${oa}. So ${a} ${sign} ${b} = **${ans}**.`
        : `${a} ${sign} ${tb * 10} = ${mid}. Then ${mid} ${sign} ${ob} = **${ans}**.`;

      const f = P(['calc', 'calc', 'tens', 'choice', 'check']);
      if (f === 'tens' && mid >= 10) {
        return num(`${a} ${sign} ${b}\nStep 1: ${add ? 'add' : 'take away'} the tens.\n${a} ${sign} ${tb * 10} = □`, mid,
          [`Only the tens change. The ${oa} ${ow(oa)} ${oa === 1 ? 'stays' : 'stay'} the same.`, `${a} has ${ta} ${tw(ta)}. ${add ? 'Add' : 'Take away'} ${tb} ${tw(tb)}.`],
          `${ta} ${tw(ta)} ${sign} ${tb} ${tw(tb)} = ${tens(mid)} ${tw(tens(mid))}, and the ones stay ${oa}. So ${a} ${sign} ${tb * 10} = **${mid}**.`);
      }
      // typical mistakes
      let mistakes;
      if (add) mistakes = cross ? [ans - 10, ...(oa + ob >= 10 ? [`${ta + tb}${oa + ob}`] : []), ans + 1, ans + 10] : [ans + 10, ans - 10, ans + 1];
      else mistakes = cross ? [(ta - tb) * 10 + (ob - oa), ans + 10, a + b, ans - 1] : [ans + 10, ans - 10, a + b, ans + 1];
      mistakes = mistakes.filter(x => typeof x === 'string' || (x > 0 && x !== ans));
      if (f === 'choice') return ch(`What is ${a} ${sign} ${b}?`, ans, mistakes, hints, explain);
      if (f === 'check') {
        const name = U.name();
        const right = Math.random() < 0.4;
        const swapped = ones(ans) * 10 + tens(ans);
        const bad = cross ? Number(mistakes[0]) : (swapped !== ans && ones(ans) > 0 ? swapped : ans + 10 <= 100 ? ans + 10 : ans - 10);
        const shown = right ? ans : bad;
        const yes = 'Yes';
        const correct = right ? yes : `No, it is ${ans}`;
        const others = right ? [`No, it is ${ans + 10 <= 100 ? ans + 10 : ans - 10}`, `No, it is ${ans - 1}`] : [yes, `No, it is ${Math.abs(bad - ans) === 10 ? ans + 1 : ans + 10 <= 100 ? ans + 10 : ans - 10}`];
        return ch(`${name} says ${a} ${sign} ${b} = ${shown}.\nIs ${name} right?`, correct, others, hints,
          `${working}. So ${name} is ${right ? 'right' : 'wrong'}. The answer is **${correct}**.`, {}, 3);
      }
      return num(`${a} ${sign} ${b} = □`, ans, hints, explain, { visual: level < 3 ? { type: 'base10', n: a } : undefined });
    }
  });

  // ---------- 9. Missing numbers ----------
  PMLM.registerSkill({
    id: 'g2.missing', grade: 2, unit: 'g2.u2', title: 'Missing numbers', icon: '❓',
    blurb: 'Find the number hiding in the box',
    lesson: [
      {
        title: 'The box hides a number',
        text: 'In □ + 7 = 15, the box is a number we do not know yet.\nWe need a number that adds to 7 to make 15.',
        visual: { type: 'bond', whole: 15, parts: ['?', 7] }
      },
      {
        title: 'Part, part, whole',
        text: 'Adding joins two **parts** to make a **whole**: 8 + 7 = 15.\nIf you know the whole and one part, take away to find the other part:\n15 − 7 = 8',
        visual: { type: 'bond', whole: 15, parts: [8, 7] }
      },
      {
        title: 'Add and take away are opposites',
        text: 'One fact gives you more facts!\n8 + 7 = 15, so 15 − 7 = 8 and 15 − 8 = 7.\nTaking away **undoes** adding. This is called the **inverse**.',
        visual: { type: 'bond', whole: 15, parts: [8, 7] }
      },
      {
        title: 'Tip: count on',
        text: 'For 20 − □ = 12, count on from 12 up to 20.\n13, 14, 15 ... 20 is 8 jumps.\nSo □ = 8.',
        visual: { type: 'numberLine', min: 10, max: 20, step: 1, labelEvery: 5, points: [{ at: 12, label: '12' }, { at: 20, label: '20' }], jumps: [{ from: 12, to: 20, label: '+8' }] }
      },
      {
        title: 'Worked example',
        text: '□ + 6 = 14\n1. The whole is 14. One part is 6.\n2. Take away the part you know: 14 − 6.\n3. 14 − 6 = 8, so □ = **8**. Check: 8 + 6 = 14 ✓',
        visual: { type: 'bond', whole: 14, parts: ['?', 6] }
      }
    ],
    gen(level) {
      let x, y;
      for (let i = 0; i < 1000; i++) {
        if (level === 1) { x = R(1, 15); y = R(1, 15); if (x + y <= 20 && x + y >= 5) break; }
        else if (level === 2) { x = R(3, 40); y = R(2, 40); if (x + y <= 50 && (x >= 10 || y >= 10)) break; }
        else { x = R(10, 80); y = R(5, 80); if (x + y <= 100) break; }
      }
      const w = x + y;
      const f = P(level === 1 ? ['addFirst', 'addSecond', 'subSecond', 'subFirst']
        : ['addFirst', 'addSecond', 'subSecond', 'subFirst', 'inverse', 'inverseNum']);

      if (f === 'addFirst') {
        return num(`□ + ${y} = ${w}`, x,
          [`The box and ${y} are the parts. ${w} is the whole.`, `To find a part, take the other part away from the whole: ${w} ${M} ${y}.`],
          `${w} ${M} ${y} = ${x}. Check: ${x} + ${y} = ${w}. So □ = **${x}**.`,
          { visual: { type: 'bond', whole: w, parts: ['?', y] } });
      }
      if (f === 'addSecond') {
        return num(`${x} + □ = ${w}`, y,
          [`What do you add to ${x} to make ${w}?`, `Count on from ${x} up to ${w}, or work out ${w} ${M} ${x}.`],
          `${w} ${M} ${x} = ${y}. Check: ${x} + ${y} = ${w}. So □ = **${y}**.`,
          { visual: { type: 'bond', whole: w, parts: [x, '?'] } });
      }
      if (f === 'subSecond') {
        return num(`${w} ${M} □ = ${x}`, y,
          [`What do you take away from ${w} to leave ${x}?`, `Count on from ${x} up to ${w}, or work out ${w} ${M} ${x}.`],
          `${w} ${M} ${x} = ${y}. Check: ${w} ${M} ${y} = ${x}. So □ = **${y}**.`,
          { visual: { type: 'bond', whole: w, parts: [x, '?'] } });
      }
      if (f === 'subFirst') {
        return num(`□ ${M} ${y} = ${x}`, w,
          [`${y} was taken away and ${x} was left. What did you start with?`, `Put the parts back together: ${x} + ${y}.`],
          `${x} + ${y} = ${w}. Check: ${w} ${M} ${y} = ${x}. So □ = **${w}**.`,
          { visual: { type: 'bond', whole: '?', parts: [y, x] } });
      }
      if (f === 'inverse') {
        const correct = Math.random() < 0.5 ? `${w} ${M} ${y} = ${x}` : `${w} ${M} ${x} = ${y}`;
        return ch(`${x} + ${y} = ${w}\nWhich fact is **also** true?`, correct,
          [`${x} ${M} ${y} = ${w}`, `${y} ${M} ${w} = ${x}`, `${w} + ${y} = ${x}`],
          ['Adding and taking away are opposites. They use the same three numbers.', `The whole is ${w}. Take one part away from ${w} to get the other part.`],
          `${x} + ${y} = ${w}. Taking one part away from the whole leaves the other part, so the answer is **${correct}**.`);
      }
      // 'inverseNum'
      const askY = level === 3 && Math.random() < 0.5;
      return num(`${x} + ${y} = ${w}\nSo ${w} ${M} ${askY ? x : y} = □`, askY ? y : x,
        ['Use the fact you are given. Adding and taking away are opposites.', `${w} is the whole. ${x} and ${y} are its two parts.`],
        `${x} + ${y} = ${w}, so ${w} ${M} ${askY ? x : y} = **${askY ? y : x}**.`);
    }
  });

  // ---------- 10. Word problems ----------
  const THINGS = [['stickers', '⭐'], ['marbles', '🔵'], ['cards', '🃏'], ['sweets', '🍬'], ['shells', '🐚'], ['pencils', '✏️'], ['books', '📘']];

  PMLM.registerSkill({
    id: 'g2.wordProblems', grade: 2, unit: 'g2.u2', title: 'Word problems', icon: '📖',
    blurb: 'Read a story, then add or take away',
    lesson: [
      {
        title: 'Read the story slowly',
        text: 'Read the story. Then ask yourself:\nDo things **join together**? Then **add**.\nDo things **go away**? Then **take away**.',
        visual: { type: 'objects', groups: [5, 3], emoji: '🍎' }
      },
      {
        title: 'Adding words',
        text: 'Words like **altogether**, **in total** and **more** often mean add.\nAli has 5 apples and gets 3 more. How many altogether?\n5 + 3 = **8**',
        visual: { type: 'objects', groups: [5, 3], emoji: '🍎' }
      },
      {
        title: 'Taking away words',
        text: 'Words like **left**, **gave away**, **ate** and **flew away** often mean take away.\nThere were 9 birds. 4 flew away. How many are left?\n9 − 4 = **5**',
        visual: { type: 'objects', groups: [9], emoji: '🐦' }
      },
      {
        title: 'How many more?',
        text: 'Mia has 12 stickers. Sam has 8. How many more does Mia have?\n"How many more" means find the **difference**: 12 − 8 = **4**.',
        visual: { type: 'barChart', bars: [{ label: 'Mia', value: 12 }, { label: 'Sam', value: 8 }], step: 2, title: 'Stickers' }
      },
      {
        title: 'Worked example',
        text: 'Leyla has 24 beads. She buys 13 more. How many beads does she have now?\n1. She gets **more** beads, so we **add**: 24 + 13.\n2. Tens: 20 + 10 = 30. Ones: 4 + 3 = 7.\n3. 30 + 7 = **37** beads.',
        visual: { type: 'base10', n: 24 }
      }
    ],
    gen(level) {
      const top = TOP[level];
      const [n1, n2] = twoNames();
      const [w, e] = P(THINGS);
      const addNums = () => {
        for (let i = 0; i < 1000; i++) {
          const a = level === 1 ? R(3, 15) : level === 2 ? R(12, 35) : R(15, 70);
          const b = level === 1 ? R(2, 9) : level === 2 ? R(5, 20) : R(8, 45);
          if (a + b <= top) return [a, b];
        }
        return [12, 5];
      };
      const subNums = () => {
        const a = level === 1 ? R(8, 20) : level === 2 ? R(20, 50) : R(30, 99);
        const b = level === 1 ? R(2, a - 1) : level === 2 ? R(5, a - 3) : R(8, a - 5);
        return [a, b];
      };
      const type = P(level === 3 ? ['add', 'add', 'take', 'take', 'diff', 'start'] : ['add', 'add', 'take', 'take', 'diff']);
      let a, b, q, ans, unit = w, vis, hints, explain;

      if (type === 'add') {
        [a, b] = addNums();
        ans = a + b;
        const t = R(0, 3);
        if (t === 0) q = `${n1} has ${a} ${w}. ${n1} gets ${b} more. How many ${w} does ${n1} have now?`;
        else if (t === 1) q = `There are ${a} red ${w} and ${b} blue ${w}. How many ${w} are there altogether?`;
        else if (t === 2) q = `${n1} has ${a} ${w}. ${n2} has ${b} ${w}. How many ${w} do they have in total?`;
        else { q = `${a} people are on a bus. ${b} more people get on. How many people are on the bus now?`; unit = 'people'; }
        vis = level === 1 ? { type: 'objects', groups: [a, b], emoji: unit === 'people' ? '🙂' : e } : undefined;
        hints = ['Are things being put together, or taken away?', `They are put together, so add: ${a} + ${b}. ${addStep(a, b)}`];
        explain = `${a} + ${b} = ${ans}. The answer is **${ans}** ${unit}.`;
      } else if (type === 'take') {
        [a, b] = subNums();
        ans = a - b;
        const t = R(0, 2);
        if (t === 0) q = `${n1} has ${a} ${w} and gives ${b} to a friend. How many ${w} does ${n1} have left?`;
        else if (t === 1) { q = `There are ${a} birds in a tree. ${b} birds fly away. How many birds are left?`; unit = 'birds'; }
        else { q = `A shop has ${a} cakes. It sells ${b} cakes. How many cakes are left?`; unit = 'cakes'; }
        vis = level === 1 ? { type: 'objects', groups: [a], emoji: unit === 'birds' ? '🐦' : unit === 'cakes' ? '🧁' : e } : undefined;
        hints = ['Are things being put together, or taken away?', `Some go away, so take away: ${a} ${M} ${b}. ${subStep(a, b)}`];
        explain = `${a} ${M} ${b} = ${ans}. The answer is **${ans}** ${unit}.`;
      } else if (type === 'diff') {
        [a, b] = subNums();
        ans = a - b;
        q = Math.random() < 0.5
          ? `${n1} has ${a} ${w}. ${n2} has ${b} ${w}. How many more ${w} does ${n1} have than ${n2}?`
          : `${n1} needs ${a} ${w}. ${n1} has ${b} so far. How many more ${w} does ${n1} need?`;
        vis = level === 1 ? { type: 'objects', groups: [a, b], emoji: e } : undefined;
        hints = ['"How many more" means find the difference.', `Find the difference: ${a} ${M} ${b}. You can count on from ${b} up to ${a}.`];
        explain = `${a} ${M} ${b} = ${ans}. The answer is **${ans}** ${unit}.`;
      } else {
        [a, b] = addNums();
        const c = a + b;
        ans = a;
        q = `${n1} had some ${w}. Then ${n1} got ${b} more. Now ${n1} has ${c}. How many ${w} did ${n1} have at the start?`;
        hints = ['Work backwards from the end.', `${n1} got ${b} more to reach ${c}. Take the ${b} away again: ${c} ${M} ${b}.`];
        explain = `${c} ${M} ${b} = ${a}. Check: ${a} + ${b} = ${c}. The answer is **${a}** ${unit}.`;
      }

      if (type !== 'start' && Math.random() < 0.25) {
        const isAdd = type === 'add';
        return ch(`${q}\nWhich number sentence do you need?`, isAdd ? `${a} + ${b}` : `${a} ${M} ${b}`, [`${a} + ${b}`, `${a} ${M} ${b}`],
          [hints[0], isAdd ? 'Things join together here.' : type === 'diff' ? 'We need the difference between the two numbers.' : 'Some of them go away here.'],
          `${isAdd ? 'They join together, so we add' : type === 'diff' ? 'We find the difference, so we take away' : 'Some go away, so we take away'}: **${isAdd ? `${a} + ${b}` : `${a} ${M} ${b}`}**.`, {}, 2);
      }
      return num(q, ans, hints, explain, { unit, visual: vis });
    }
  });

  // =====================================================================
  // UNIT 3 — Multiply and divide
  // =====================================================================
  PMLM.registerUnit({ id: 'g2.u3', grade: 2, name: 'Multiply and divide', icon: '✖️' });

  // ---------- 11. Arrays and repeated addition ----------
  PMLM.registerSkill({
    id: 'g2.arrays', grade: 2, unit: 'g2.u3', title: 'Equal groups and arrays', icon: '🟦',
    blurb: 'Multiply using equal groups, arrays and adding again',
    lesson: [
      {
        title: 'Equal groups',
        text: 'Here are 3 groups with 2 in each group.\nEvery group has the **same** number. They are **equal groups**.\n2 + 2 + 2 = 6',
        visual: { type: 'objects', groups: [2, 2, 2], emoji: '🍪' }
      },
      {
        title: 'Adding again is multiplying',
        text: 'Adding the same number again and again is **multiplying**.\n3 groups of 2 is 2 + 2 + 2 = 6.\nWe write it as **3 × 2 = 6**.',
        visual: { type: 'objects', groups: [2, 2, 2], emoji: '🍪' }
      },
      {
        title: 'Arrays',
        text: 'An **array** is things set out in rows and columns.\nThis array has 3 rows of 4.\n4 + 4 + 4 = 12, so **3 × 4 = 12**.',
        visual: { type: 'array', rows: 3, cols: 4, emoji: '🔵' }
      },
      {
        title: 'Tip: turn it round',
        text: 'Turn the array on its side: now it is 4 rows of 3.\nIt still has 12! So **3 × 4 = 4 × 3**.\nYou can multiply in any order.',
        visual: { type: 'array', rows: 4, cols: 3, emoji: '🔵' }
      },
      {
        title: 'Worked example',
        text: 'How many stars are there?\n1. Count the rows: 2. Count how many in each row: 5.\n2. Add 5 two times: 5 + 5 = 10.\n3. So 2 × 5 = **10** stars.',
        visual: { type: 'array', rows: 2, cols: 5, emoji: '⭐' }
      }
    ],
    gen(level) {
      let r, c;
      do {
        if (level === 1) { r = R(2, 3); c = R(2, 5); } else if (level === 2) { r = R(2, 5); c = P([2, 3, 4, 5, 5, 10]); } else { r = R(2, 6); c = P([2, 3, 4, 5, 10]); }
      } while (r === 2 && c === 2);
      const tot = r * c;
      const e = P(EMOJI);
      const adds = Array(r).fill(c).join(' + ');
      const notTurned = s => s !== `${c} × ${r}`;
      const f = P(level === 1 ? ['count', 'groups', 'sentence', 'add'] : ['count', 'groups', 'sentence', 'repeat', 'box', 'turn']);

      if (f === 'count') {
        return num('How many are there altogether?', tot,
          ['Count the rows. Then count how many are in each row.', `There are ${r} rows of ${c}. Add: ${adds}.`],
          `${r} rows of ${c} is ${adds} = ${tot}. So ${r} × ${c} = **${tot}**.`,
          { visual: { type: 'array', rows: r, cols: c, emoji: e } });
      }
      if (f === 'groups') {
        return num(`There are ${r} groups of ${c}. How many altogether?`, tot,
          [`Count in ${c}s, one group at a time.`, `Add ${r} lots of ${c}: ${adds}.`],
          `${adds} = ${tot}. So ${r} groups of ${c} is **${tot}**.`,
          { visual: { type: 'objects', groups: Array(r).fill(c), emoji: e } });
      }
      if (f === 'add') {
        return num(`${adds} = □`, tot,
          [`Add one ${c} at a time, or count in ${c}s.`, r === 2 ? `Start at ${c} and count on ${c}.` : `${c} + ${c} = ${2 * c}. Keep adding ${c}.`],
          `${adds} = **${tot}**.`,
          { visual: { type: 'objects', groups: Array(r).fill(c), emoji: e } });
      }
      if (f === 'sentence') {
        const wrong = [[r, c, '+'], [r, c + 1, '×'], [r + 1, c, '×'], [r, r, '×'], [c, c, '×']]
          .filter(([x, y, op]) => (op === '+' ? x + y : x * y) !== tot)
          .map(([x, y, op]) => `${x} ${op} ${y}`).filter(notTurned);
        return ch('Which number sentence matches the array?', `${r} × ${c}`, wrong,
          ['× means "rows of" or "groups of".', `Count the rows: there are ${r}. How many are in each row?`],
          `There are ${r} rows with ${c} in each row, so it is **${r} × ${c}**.`,
          { visual: { type: 'array', rows: r, cols: c, emoji: e } });
      }
      if (f === 'repeat') {
        const wrong = [[r, c, '+'], [c, c, '×'], [r + 1, c, '×'], [r, r, '×'], [r - 1, c, '×']]
          .filter(([x, y, op]) => x > 0 && (op === '+' ? x + y : x * y) !== tot)
          .map(([x, y, op]) => `${x} ${op} ${y}`).filter(notTurned);
        return ch(`${adds} is the same as ...`, `${r} × ${c}`, wrong,
          [`Count how many ${c}s are added together.`, `Touch each ${c} with your finger as you count how many there are.`],
          `${c} is added ${r} times, so it is **${r} × ${c}**.`);
      }
      if (f === 'box') {
        return num(`${adds} = □ × ${c}`, r,
          [`Count how many ${c}s are added together.`, `Touch each ${c} with your finger as you count how many there are.`],
          `${c} is added ${r} times, so ${adds} = **${r}** × ${c}.`);
      }
      return num(`${r} × ${c} = ${tot}\nSo what is ${c} × ${r}?`, tot,
        ['Turning an array round does not change how many there are.', `${c} × ${r} is the same array, turned on its side.`],
        `You can multiply in any order, so ${c} × ${r} = ${r} × ${c} = **${tot}**.`,
        { visual: { type: 'array', rows: r, cols: c, emoji: e } });
    }
  });

  // ---------- 12. 2, 5 and 10 times tables ----------
  PMLM.registerSkill({
    id: 'g2.tables', grade: 2, unit: 'g2.u3', title: 'The 2, 5 and 10 tables', icon: '🔁',
    blurb: 'Know facts like 7 × 2, 4 × 5 and 6 × 10',
    lesson: [
      {
        title: 'The 2 times table',
        text: 'Count in 2s: 2, 4, 6, 8, 10, 12 ...\n4 × 2 = 8 (4 jumps of 2).\nThe answers are all **even**.',
        visual: { type: 'numberLine', min: 0, max: 12, step: 1, labelEvery: 2, jumps: [{ from: 0, to: 2, label: '+2' }, { from: 2, to: 4, label: '+2' }, { from: 4, to: 6, label: '+2' }, { from: 6, to: 8, label: '+2' }] }
      },
      {
        title: 'The 5 times table',
        text: 'Count in 5s: 5, 10, 15, 20, 25 ...\n3 × 5 = 15 (3 jumps of 5).\nThe answers always end in **5 or 0**.',
        visual: { type: 'numberLine', min: 0, max: 30, step: 5, labelEvery: 1, jumps: [{ from: 0, to: 5, label: '+5' }, { from: 5, to: 10, label: '+5' }, { from: 10, to: 15, label: '+5' }] }
      },
      {
        title: 'The 10 times table',
        text: 'Count in 10s: 10, 20, 30, 40 ...\n6 × 10 = 60 (6 tens).\nThe answers always end in **0**.',
        visual: { type: 'base10', n: 60 }
      },
      {
        title: 'Dividing',
        text: 'Division is the opposite of multiplying.\n4 × 5 = 20, so **20 ÷ 5 = 4**.\nAsk yourself: how many 5s make 20?',
        visual: { type: 'objects', groups: [5, 5, 5, 5], emoji: '⭐' }
      },
      {
        title: 'Worked example',
        text: 'Work out 7 × 2.\n1. Count in 2s, 7 times: 2, 4, 6, 8, 10, 12, 14.\n2. Hold up a finger for each jump, so you know when you have done 7.\n3. So 7 × 2 = **14**.',
        visual: { type: 'numberLine', min: 0, max: 16, step: 1, labelEvery: 2, jumps: U.range(0, 6).map(i => ({ from: 2 * i, to: 2 * i + 2, label: '+2' })) }
      }
    ],
    gen(level) {
      const t = level === 1 ? P([2, 2, 10, 5]) : P([2, 5, 10]);
      const n = level === 1 ? R(2, t === 5 ? 4 : 5) : R(2, 10);
      const p = t * n;
      const countTo = k => U.range(1, k).map(i => i * t).join(', ');
      const f = P(level === 1 ? ['fact', 'fact', 'word', 'table'] : level === 2 ? ['fact', 'fact', 'missing', 'word', 'table'] : ['fact', 'missing', 'div', 'div', 'word', 'table']);

      if (f === 'fact') {
        const flip = Math.random() < 0.4;
        const expr = flip ? `${t} × ${n}` : `${n} × ${t}`;
        return num(`${expr} = □`, p,
          [`Count in ${t}s.`, n > 2 ? `Count in ${t}s and keep track on your fingers: ${countTo(2)}, ...` : `Start at ${t} and count on ${t} more.`],
          `Count in ${t}s, ${n} times: ${countTo(n)}. So ${expr} = **${p}**.`,
          { visual: level === 1 ? { type: 'array', rows: n, cols: t, emoji: P(EMOJI) } : undefined });
      }
      if (f === 'missing') {
        const q = Math.random() < 0.5 ? `□ × ${t} = ${p}` : `${t} × □ = ${p}`;
        return num(q, n,
          [`How many ${t}s make ${p}?`, `Count in ${t}s up to ${p}. Count the jumps on your fingers.`],
          `Count in ${t}s: ${countTo(n)}. That is ${n} jumps, so □ = **${n}**.`);
      }
      if (f === 'div') {
        return num(`${p} ÷ ${t} = □`, n,
          [`÷ ${t} means: how many ${t}s make ${p}?`, `Count in ${t}s up to ${p}: ${countTo(Math.min(2, n - 1))}, ... Count the jumps.`],
          `${n} × ${t} = ${p}, so ${p} ÷ ${t} = **${n}**.`);
      }
      if (f === 'word') {
        const W = {
          2: [[`A bike has 2 wheels. How many wheels do ${n} bikes have?`, 'wheels'], [`Socks come in pairs. How many socks are in ${n} pairs?`, 'socks']],
          5: [[`A hand has 5 fingers. How many fingers are on ${n} hands?`, 'fingers'], [`A pack has 5 stickers. How many stickers are in ${n} packs?`, 'stickers']],
          10: [[`A box holds 10 pencils. How many pencils are in ${n} boxes?`, 'pencils'], [`A tray holds 10 cakes. How many cakes are on ${n} trays?`, 'cakes']]
        };
        const D = {
          2: [`${p} socks are put into pairs. How many pairs are there?`, 'pairs'],
          5: [`${p} stickers are put into packs of 5. How many packs are there?`, 'packs'],
          10: [`${p} pencils are put into boxes of 10. How many boxes are there?`, 'boxes']
        };
        if (level === 3 && Math.random() < 0.4) {
          const [q, unit] = D[t];
          return num(q, n, [`How many groups of ${t} make ${p}?`, `Count in ${t}s up to ${p}. Count the jumps.`],
            `${p} ÷ ${t} = ${n}, because ${n} × ${t} = ${p}. The answer is **${n}** ${unit}.`, { unit });
        }
        const [q, unit] = P(W[t]);
        return num(q, p, [`Each one has ${t}. Count in ${t}s.`, `${n} lots of ${t}: count ${countTo(Math.min(2, n - 1))}, ... and stop after ${n} jumps.`],
          `${n} × ${t} = ${p}. The answer is **${p}** ${unit}.`, { unit });
      }
      // 'table' — which number is in the table?
      const near = t === 2 ? [p + 1, p - 1, p + 3, p - 3, p + 11]
        : t === 5 ? [p + 1, p - 1, p + 2, p - 2, p + 3, ones(p) * 10 + tens(p)]
          : [p + 5, p - 5, p + 1, p - 1, p + 2];
      const wrong = U.shuffle(near.filter(x => x > 0 && x % t !== 0));
      return ch(`Which number is in the **${t}** times table?`, p, wrong,
        [t === 2 ? 'Numbers in the 2 times table are even.' : t === 5 ? 'Numbers in the 5 times table end in 5 or 0.' : 'Numbers in the 10 times table end in 0.',
          t === 2 ? 'Even numbers end in 0, 2, 4, 6 or 8. Look at the last digit of each number.' : 'Look at the last digit of each number.'],
        `${n} × ${t} = ${p}. The answer is **${p}**.`);
    }
  });

  // ---------- 13. Doubling and halving ----------
  const WORD_THINGS = ['stickers', 'marbles', 'sweets', 'cards', 'shells'];
  const doubleStep = n => {
    if (n < 10) return `Start at ${n} and count on ${n} more.`;
    const t = tens(n), o = ones(n);
    if (o === 0) return `${n} is ${t} ${tw(t)}. Double ${t} ${tw(t)}.`;
    return `Double the tens: double ${t * 10} is ${t * 20}. Now double the ${o} and add.`;
  };
  const halfStep = m => {
    if (m <= 20) return `Find a number that adds to itself to make ${m}: □ + □ = ${m}.`;
    const t = tens(m), o = ones(m);
    if (t % 2 === 0) return o === 0 ? `${m} is ${t} tens. Half of ${t} is ${t / 2}.` : `Half of ${t * 10} is ${t * 5}. Now find half of ${o} and add.`;
    return `Split ${m} into ${(t - 1) * 10} and ${10 + o}. Half of ${(t - 1) * 10} is ${(t - 1) * 5}. Now find half of ${10 + o} and add.`;
  };

  PMLM.registerSkill({
    id: 'g2.doubleHalve', grade: 2, unit: 'g2.u3', title: 'Doubling and halving', icon: '👯',
    blurb: 'Double means 2 times as many. Half means 2 equal parts.',
    lesson: [
      {
        title: 'Doubling',
        text: 'To **double** a number, add it to itself.\nDouble 4 is 4 + 4 = **8**.',
        visual: { type: 'objects', groups: [4, 4], emoji: '🐞' }
      },
      {
        title: 'Halving',
        text: 'To **halve** a number, split it into **2 equal groups**.\nHalf of 10 is **5**, because 5 + 5 = 10.',
        visual: { type: 'objects', groups: [5, 5], emoji: '🍓' }
      },
      {
        title: 'Opposites',
        text: 'Halving undoes doubling.\nDouble 6 is 12, so half of 12 is 6.',
        visual: { type: 'bond', whole: 12, parts: [6, 6] }
      },
      {
        title: 'Tip: split into tens and ones',
        text: 'Double 23: double 20 is 40, double 3 is 6. 40 + 6 = **46**.\nHalf of 48: half of 40 is 20, half of 8 is 4. 20 + 4 = **24**.',
        visual: { type: 'base10', n: 23 }
      },
      {
        title: 'Worked example',
        text: 'What is half of 30?\n1. 3 tens do not split into 2 equal groups, so split 30 into **20 and 10**.\n2. Half of 20 is 10. Half of 10 is 5.\n3. 10 + 5 = 15. Half of 30 is **15**.',
        visual: { type: 'base10', n: 30 }
      }
    ],
    gen(level) {
      const dn = () => (level === 1 ? R(1, 10) : level === 2 ? R(5, 25) : (Math.random() < 0.5 ? R(10, 50) : 5 * R(2, 10)));
      const hn = () => (level === 1 ? 2 * R(1, 10) : level === 2 ? 2 * R(5, 25) : (Math.random() < 0.5 ? 2 * R(10, 50) : 10 * R(2, 10)));
      const f = P(level === 1 ? ['double', 'half', 'double', 'half', 'word'] : ['double', 'half', 'undo', 'word', 'choice']);
      const dExplain = n => (n < 10 ? `Double ${n} = ${n} + ${n} = **${2 * n}**.`
        : ones(n) === 0 ? `Double ${tens(n)} ${tw(tens(n))} is ${2 * tens(n)} tens. Double ${n} = **${2 * n}**.`
          : `Double ${tens(n) * 10} is ${tens(n) * 20}. Double ${ones(n)} is ${2 * ones(n)}. ${tens(n) * 20} + ${2 * ones(n)} = **${2 * n}**.`);
      const hExplain = m => `${m / 2} + ${m / 2} = ${m}, so half of ${m} is **${m / 2}**.`;

      if (f === 'double') {
        const n = dn();
        return num(`What is **double** ${n}?`, 2 * n, ['Double means add the number to itself.', doubleStep(n)], dExplain(n),
          { visual: level === 1 ? { type: 'objects', groups: [n, n], emoji: P(EMOJI) } : { type: 'base10', n } });
      }
      if (f === 'half') {
        const m = hn();
        return num(`What is **half** of ${m}?`, m / 2, ['Half means split into 2 equal groups.', halfStep(m)], hExplain(m),
          { visual: level === 1 ? { type: 'objects', groups: [m], emoji: P(EMOJI) } : { type: 'base10', n: m } });
      }
      if (f === 'undo') {
        if (Math.random() < 0.5) {
          const n = dn();
          return num(`**Double** a number is ${2 * n}. What is the number?`, n,
            ['Halving undoes doubling.', `Find half of ${2 * n}.`],
            `Half of ${2 * n} is ${n}. Check: double ${n} is ${2 * n}. The number is **${n}**.`);
        }
        const k = hn() / 2;
        return num(`**Half** of a number is ${k}. What is the number?`, 2 * k,
          ['Doubling undoes halving.', `Double ${k}: ${k} + ${k}.`],
          `Double ${k} is ${2 * k}. Check: half of ${2 * k} is ${k}. The number is **${2 * k}**.`);
      }
      if (f === 'word') {
        const [n1, n2] = twoNames();
        const w = P(WORD_THINGS);
        const t = R(0, 2);
        if (t === 0) {
          const n = Math.max(2, dn());
          return num(`${n1} has ${n} ${w}. ${n2} has double that number. How many ${w} does ${n2} have?`, 2 * n,
            ['Double means 2 times as many.', doubleStep(n)], dExplain(n), { unit: w });
        }
        const m = hn();
        if (t === 1) {
          return num(`${n1} has ${m} ${w} and gives half of them to ${n2}. How many ${w} does ${n2} get?`, m / 2,
            ['Half means 2 equal groups.', halfStep(m)], hExplain(m), { unit: w });
        }
        return num(`${m} children make 2 equal teams. How many children are in each team?`, m / 2,
          ['2 equal teams means halving.', halfStep(m)], hExplain(m), { unit: 'children' });
      }
      // 'choice' — spot the right answer among real mistakes
      if (Math.random() < 0.5) {
        const n = dn();
        const t = tens(n), o = ones(n);
        const wrong = [n + 2, ...(n >= 10 ? [`${2 * t}${2 * o}`, `${2 * t}${o}`] : []), n % 2 === 0 ? n / 2 : n + 1, 2 * n + 10]
          .filter(x => String(x) !== String(2 * n));
        return ch(`What is **double** ${n}?`, 2 * n, wrong, ['Double means add the number to itself.', doubleStep(n)], dExplain(n));
      }
      const m = hn();
      const t = tens(m), o = ones(m);
      const wrong = [2 * m, Math.floor(t / 2) * 10 + Math.floor(o / 2), m - 2, Math.ceil(t / 2) * 10 + Math.floor(o / 2), m / 2 + 10]
        .filter(x => x > 0 && x !== m / 2);
      return ch(`What is **half** of ${m}?`, m / 2, wrong, ['Half means split into 2 equal groups.', halfStep(m)], hExplain(m));
    }
  });

  // ---------- 14. Sharing and grouping ----------
  const SHARE_THINGS = [['cookies', '🍪'], ['sweets', '🍬'], ['apples', '🍎'], ['stickers', '⭐'], ['balls', '⚽'], ['pencils', '✏️']];

  PMLM.registerSkill({
    id: 'g2.share', grade: 2, unit: 'g2.u3', title: 'Sharing and grouping', icon: '🍪',
    blurb: 'Share things out equally, or put them into equal groups',
    lesson: [
      {
        title: 'Sharing equally',
        text: '**Sharing** means giving out fairly, so everyone gets the **same**.\nShare 12 cookies between 3 friends: give 1 each, again and again, until none are left.\nEach friend gets **4**.',
        visual: { type: 'objects', groups: [4, 4, 4], emoji: '🍪' }
      },
      {
        title: 'Grouping',
        text: '**Grouping** means making groups of the same size.\nHow many groups of 2 can we make from 8 socks?\nCount the groups: **4**.',
        visual: { type: 'objects', groups: [2, 2, 2, 2], emoji: '🧦' }
      },
      {
        title: 'The ÷ sign',
        text: 'Sharing and grouping are both **division**.\nWe write 12 ÷ 3 = 4.\n÷ means "shared equally between" or "how many groups of".',
        visual: { type: 'array', rows: 3, cols: 4, emoji: '🍪' }
      },
      {
        title: 'Tip: use your tables',
        text: 'Multiplying helps you divide!\n5 × 4 = 20, so 20 ÷ 5 = 4 and 20 ÷ 4 = 5.',
        visual: { type: 'array', rows: 4, cols: 5, emoji: '⭐' }
      },
      {
        title: 'Worked example',
        text: 'Share 15 sweets between 5 children. How many does each child get?\n1. Draw 5 circles, one for each child.\n2. Put the sweets in one at a time, round and round.\n3. Each circle has 3. So 15 ÷ 5 = **3**.',
        visual: { type: 'objects', groups: [3, 3, 3, 3, 3], emoji: '🍬' }
      }
    ],
    gen(level) {
      let k, each;
      if (level === 1) { k = P([2, 2, 3]); each = R(2, k === 2 ? 6 : 4); }
      else if (level === 2) { k = P([2, 3, 4, 5]); each = R(2, Math.floor(20 / k)); }
      else { k = P([2, 3, 4, 5, 10]); each = k === 3 || k === 4 ? R(2, 6) : R(2, Math.min(10, Math.floor(50 / k))); }
      const T = k * each;
      const [w, e] = P(SHARE_THINGS);
      const vis = T <= 20 ? { type: 'objects', groups: [T], emoji: e } : undefined;
      const f = P(level === 1 ? ['share', 'group', 'fair', 'share'] : ['share', 'group', 'divide', 'fair']);

      if (f === 'share' || (f === 'divide' && ![2, 5, 10].includes(k))) {
        return num(`Share ${T} ${w} equally between ${k} children. How many ${w} does each child get?`, each,
          ['Give them out one at a time, round and round, until none are left.',
            level < 3 ? `Draw ${k} circles. Share the ${w} out one by one.` : `Think: ${k} × □ = ${T}. Count in ${k}s up to ${T}.`],
          `${T} shared between ${k} is ${each} each, because ${k} × ${each} = ${T}. So ${T} ÷ ${k} = **${each}**.`,
          { unit: w, visual: vis });
      }
      if (f === 'group') {
        return num(`There are ${T} ${w}. Put them into groups of ${k}. How many groups are there?`, each,
          [`Make a group of ${k}. Then make another group of ${k}. Keep going.`, `Count in ${k}s up to ${T}. Count how many jumps.`],
          `${T} makes ${each} groups of ${k}, because ${each} × ${k} = ${T}. So ${T} ÷ ${k} = **${each}**.`,
          { unit: 'groups', visual: vis });
      }
      if (f === 'divide' && [2, 5, 10].includes(k)) {
        return num(`${T} ÷ ${k} = □`, each,
          [`÷ means share equally. How many ${k}s make ${T}?`, `Count in ${k}s up to ${T}. Count the jumps.`],
          `${each} × ${k} = ${T}, so ${T} ÷ ${k} = **${each}**.`);
      }
      // 'fair' — is it shared equally?
      const g = R(2, 4), s = R(2, 6);
      const equal = Math.random() < 0.5;
      const groups = Array(g).fill(s);
      if (!equal) groups[R(0, g - 1)] += P([1, -1]);
      const total = sum(groups);
      const opts = ['Yes, every group has the same', 'No, the groups are not the same'];
      const ans = equal ? opts[0] : opts[1];
      return ch(`${total} ${w} are put into ${g} groups. Is it shared equally?`, ans, opts,
        ['Count how many are in each group.', `The first group has ${groups[0]}. Check the other groups.`],
        `The groups have ${groups.join(', ')}. ${equal ? 'They are all the same' : 'They are not all the same'}, so the answer is **${ans}**.`,
        { visual: { type: 'objects', groups, emoji: e } }, 2);
    }
  });

  // =====================================================================
  // UNIT 4 — Fractions
  // =====================================================================
  PMLM.registerUnit({ id: 'g2.u4', grade: 2, name: 'Fractions', icon: '🍕' });

  // ---------- 15. Halves and quarters of shapes ----------
  const FWORD = { '1/2': 'one half', '1/4': 'one quarter', '3/4': 'three quarters', '2/4': 'two quarters' };
  const FWRONG = {
    '1/2': ['{1/1}', '{2/1}', '{1/4}'],
    '1/4': ['{1/3}', '{4/1}', '{3/4}', '{1/2}'],
    '3/4': ['{3/1}', '{4/3}', '{1/4}'],
    '2/4': ['{2/2}', '{4/2}', '{1/4}', '{3/4}']
  };

  PMLM.registerSkill({
    id: 'g2.fracShapes', grade: 2, unit: 'g2.u4', title: 'Halves and quarters', icon: '🥧',
    blurb: 'Find a half, a quarter and three quarters of a shape',
    lesson: [
      {
        title: 'Equal parts',
        text: 'A **fraction** is a part of a whole.\nThe parts must be **equal**: all the same size.\nThis circle is cut into 2 equal parts.',
        visual: { type: 'pie', pies: [{ parts: 2, shaded: 1 }] }
      },
      {
        title: 'One half',
        text: 'Cut a whole into **2 equal parts**.\nEach part is **one half**. We write {1/2}.\nThe bottom number says how many equal parts. The top number says how many we have.',
        visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '{1/2}' }] }
      },
      {
        title: 'Quarters',
        text: 'Cut a whole into **4 equal parts**.\nEach part is **one quarter**: {1/4}.\nThree parts are **three quarters**: {3/4}.',
        visual: { type: 'pie', pies: [{ parts: 4, shaded: 1 }, { parts: 4, shaded: 3 }] }
      },
      {
        title: 'Tip: 2 quarters make a half',
        text: '{2/4} is the same as {1/2}.\nLook: 2 quarters cover the same amount as 1 half.',
        visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '{1/2}' }, { parts: 4, shaded: 2, label: '{2/4}' }] }
      },
      {
        title: 'Worked example',
        text: 'What fraction is shaded?\n1. Count all the equal parts: **4**. That is the bottom number.\n2. Count the shaded parts: **3**. That is the top number.\n3. So {3/4} is shaded: three quarters.',
        visual: { type: 'pie', pies: [{ parts: 4, shaded: 3 }] }
      }
    ],
    gen(level) {
      const opts = level === 1 ? [[2, 1], [4, 1]] : [[2, 1], [4, 1], [4, 3], [4, 3], [4, 2]];
      const pic = (p, s) => (Math.random() < 0.5 ? { type: 'pie', pies: [{ parts: p, shaded: s }] } : { type: 'fractionBar', bars: [{ parts: p, shaded: s }] });
      const f = P(level === 1 ? ['name', 'name', 'equal', 'count'] : level === 2 ? ['name', 'name', 'not', 'equal', 'count']
        : ['name', 'not', 'equal', 'count', 'write', 'same']);

      if (f === 'name' || f === 'write') {
        const [p, s] = P(opts);
        const key = `${s}/${p}`;
        const hints = ['Count all the equal parts. Then count the shaded parts.', `There are ${p} equal parts altogether. That is the bottom number.`];
        const explain = `${s} of the ${p} equal parts ${s === 1 ? 'is' : 'are'} shaded, so the answer is **${U.frac(s, p)}** (${FWORD[key]}).`;
        if (f === 'write') return { q: 'What fraction is shaded?', kind: 'fraction', answer: [s, p], hints, explain, visual: pic(p, s) };
        return ch('What fraction is shaded?', U.frac(s, p), FWRONG[key], hints, explain, { visual: pic(p, s) });
      }
      if (f === 'not') {
        const [p, s] = P([[4, 1], [4, 3], [4, 3], [2, 1]]);
        const u = p - s, key = `${u}/${p}`;
        return ch('What fraction is **not** shaded?', U.frac(u, p), [U.frac(s, p), ...FWRONG[key]],
          ['Count all the equal parts. Then count the parts that are **not** shaded.', `There are ${p} equal parts. ${s} ${s === 1 ? 'is' : 'are'} shaded.`],
          `${u} of the ${p} equal parts ${u === 1 ? 'is' : 'are'} not shaded, so the answer is **${U.frac(u, p)}**.`,
          { visual: pic(p, s) });
      }
      if (f === 'equal') {
        const k = P([2, 4]);
        const piece = k === 2 ? 'a half' : 'a quarter', pieces = k === 2 ? 'halves' : 'quarters';
        if (level > 1 && Math.random() < 0.4) {
          const ans = `${k} equal parts`;
          const wrong = [`${k} parts of different sizes`, `${k === 2 ? 4 : 2} equal parts`, '3 equal parts'];
          return ch(`A shape is cut into ${pieces}. What does it look like?`, ans, wrong,
            [`${cap(pieces)} must be equal parts.`, `Count: how many ${pieces} make a whole?`],
            `${cap(pieces)} means ${k} parts that are all the same size. The answer is **${ans}**.`);
        }
        const obj = P(['cake', 'pizza', 'sandwich', 'pie', 'chocolate bar']);
        const eq = Math.random() < 0.5;
        const choices = ['Yes, the parts are equal', 'No, the parts are not equal'];
        const ans = eq ? choices[0] : choices[1];
        return ch(`${U.name()} cuts a ${obj} into ${k} pieces. The pieces are ${eq ? 'all the same size' : 'different sizes'}. Is each piece ${piece}?`, ans, choices,
          ['Halves and quarters must be **equal** parts.', `For ${pieces}, there must be ${k} pieces **and** they must all be the same size.`],
          `${eq ? `The ${k} pieces are equal, so each one is ${piece}` : `The pieces are different sizes, so they are not ${pieces}`}. The answer is **${ans}**.`, {}, 2);
      }
      if (f === 'count') {
        const v = P(level === 1 ? ['qWhole', 'hWhole', 'shade', 'shade'] : ['qWhole', 'hWhole', 'qHalf', 'shade', 'shade']);
        if (v === 'qWhole') {
          return num('How many quarters make one whole?', 4,
            ['A quarter is 1 of the equal parts when you cut a whole into quarters.', 'Think of a pizza cut into quarters. Count the pieces.'],
            'A whole cut into quarters has 4 equal parts, so **4** quarters make one whole.');
        }
        if (v === 'hWhole') {
          return num('How many halves make one whole?', 2,
            ['A half is 1 of the equal parts when you cut a whole into halves.', 'Think of a sandwich cut in half. Count the pieces.'],
            'A whole cut in half has 2 equal parts, so **2** halves make one whole.');
        }
        if (v === 'qHalf') {
          return num('How many quarters make one half?', 2,
            ['Think of a whole cut into 4 equal parts.', 'Half of the whole is half of the 4 parts.'],
            'A whole has 4 quarters. Half of 4 is 2, so **2** quarters make one half.',
            { visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1, label: '{1/2}' }, { parts: 4, shaded: 0, label: 'quarters' }] } });
        }
        const [p, s] = level === 1 ? P([[2, 1], [4, 1]]) : P([[4, 1], [4, 3], [4, 2], [2, 1]]);
        const target = level === 3 && p === 4 && s === 2 && Math.random() < 0.5 ? U.frac(1, 2) : U.frac(s, p);
        const half = target === U.frac(1, 2) && p === 4;
        return num(`This shape has ${p} equal parts. How many parts would you shade to show ${target}?`, s,
          ['The bottom number tells you how many equal parts. The top number tells you how many to shade.',
            half ? 'A half is half of the parts. What is half of 4?' : `The shape already has ${p} equal parts, the same as the bottom number of ${target}.`],
          half ? 'Half of 4 parts is 2 parts, so shade **2**.' : `${target} means ${s} of the ${p} equal parts, so shade **${s}**.`,
          { visual: { type: 'pie', pies: [{ parts: p, shaded: 0 }] } });
      }
      // 'same'
      if (Math.random() < 0.5) {
        return ch(`Which fraction is the same as ${U.frac(2, 4)}?`, U.frac(1, 2), [U.frac(1, 4), U.frac(2, 2), U.frac(4, 2)],
          ['Look at the bar. How much of it is shaded?', 'Is the shaded part a quarter, a half or the whole bar?'],
          `2 quarters cover the same amount as 1 half, so ${U.frac(2, 4)} = **${U.frac(1, 2)}**.`,
          { visual: { type: 'fractionBar', bars: [{ parts: 4, shaded: 2 }] } });
      }
      return ch(`Which fraction is the same as ${U.frac(1, 2)}?`, U.frac(2, 4), [U.frac(1, 4), U.frac(2, 1), U.frac(3, 4)],
        ['Look at the bar. Imagine cutting each half into 2 equal pieces.', 'Then the bar has 4 quarters. How many of them are shaded?'],
        `Cut each half in two: 1 half becomes 2 quarters, so ${U.frac(1, 2)} = **${U.frac(2, 4)}**.`,
        { visual: { type: 'fractionBar', bars: [{ parts: 2, shaded: 1 }] } });
    }
  });

  // ---------- 16. Fractions of amounts ----------
  PMLM.registerSkill({
    id: 'g2.fracAmount', grade: 2, unit: 'g2.u4', title: 'Fractions of amounts', icon: '🍬',
    blurb: 'Find a half, a quarter or three quarters of a number',
    lesson: [
      {
        title: 'Half of a number',
        text: 'To find **half**, share into **2 equal groups**.\nHalf of 8 is **4**.',
        visual: { type: 'objects', groups: [4, 4], emoji: '🍎' }
      },
      {
        title: 'A quarter of a number',
        text: 'To find **a quarter**, share into **4 equal groups**.\nA quarter of 12 is **3**.',
        visual: { type: 'objects', groups: [3, 3, 3, 3], emoji: '🍓' }
      },
      {
        title: 'Three quarters',
        text: '**Three quarters** means 3 of the 4 equal groups.\nA quarter of 12 is 3, so three quarters of 12 is 3 + 3 + 3 = **9**.',
        visual: { type: 'objects', groups: [3, 3, 3, 3], emoji: '🍓' }
      },
      {
        title: 'Tip: halve and halve again',
        text: 'A quarter is half of a half!\nHalf of 20 is 10. Half of 10 is 5.\nSo {1/4} of 20 = **5**.',
        visual: { type: 'fractionBar', bars: [{ parts: 1, shaded: 1, label: '20' }, { parts: 2, shaded: 1, label: '{1/2} = 10' }, { parts: 4, shaded: 1, label: '{1/4} = 5' }] }
      },
      {
        title: 'Worked example',
        text: 'Find {3/4} of 8.\n1. Share 8 into 4 equal groups: 2 in each group.\n2. So {1/4} of 8 is 2.\n3. Three quarters is 3 groups: 2 + 2 + 2 = **6**.',
        visual: { type: 'objects', groups: [2, 2, 2, 2], emoji: '🍬' }
      }
    ],
    gen(level) {
      const k = P(level === 1 ? ['h'] : level === 2 ? ['h', 'q', 'q'] : ['h', 'q', 't', 't']);
      const n = k === 'h' ? (level === 1 ? 2 * R(1, 10) : level === 2 ? 2 * R(3, 20) : 2 * R(5, 50)) : 4 * R(1, level === 2 ? 5 : 10);
      const [fn, fd] = k === 'h' ? [1, 2] : k === 'q' ? [1, 4] : [3, 4];
      const fr = U.frac(fn, fd);
      const unit = n / fd, ans = unit * fn;
      const hints = k === 'h' ? ['Half means share into 2 equal groups.', halfStep(n)]
        : k === 'q' ? ['A quarter means share into 4 equal groups.', `Halve, then halve again. Half of ${n} is ${n / 2}.`]
          : ['First find one quarter. Then take 3 of those.', `Share ${n} into 4 equal groups: ${unit} in each group.`];
      const explain = k === 't' ? `${U.frac(1, 4)} of ${n} is ${unit}. Three quarters is 3 groups: ${unit} + ${unit} + ${unit} = **${ans}**.`
        : `${n} shared into ${fd} equal groups is ${unit} in each group. So ${fr} of ${n} is **${ans}**.`;
      const f = P(level === 1 ? ['find', 'find', 'word'] : level === 2 ? ['find', 'find', 'word', 'compare'] : ['find', 'word', 'whole', 'compare']);

      if (f === 'find') {
        return num(`What is ${fr} of ${n}?`, ans, hints, explain,
          { visual: n <= 20 ? { type: 'objects', groups: [n], emoji: P(EMOJI) } : { type: 'fractionBar', bars: [{ parts: fd, shaded: fn, label: String(n) }] } });
      }
      if (f === 'word') {
        const [n1, n2] = twoNames();
        const w = P(WORD_THINGS);
        if (k === 'h') {
          return num(`${n1} has ${n} ${w} and gives half of them to ${n2}. How many ${w} does ${n2} get?`, ans, hints, explain, { unit: w });
        }
        if (k === 'q') {
          return num(`There are ${n} children in a class. A quarter of them walk to school. How many children walk to school?`, ans, hints, explain, { unit: 'children' });
        }
        return num(`${n1} has ${n} ${w}. ${n1} uses three quarters of them. How many ${w} does ${n1} use?`, ans, hints, explain, { unit: w });
      }
      if (f === 'whole') {
        if (k === 'h') {
          const m = R(3, 25);
          return num(`Half of a number is ${m}. What is the number?`, 2 * m,
            ['Two halves make a whole.', `The whole is 2 halves: double ${m}.`],
            `Two halves make the whole: ${m} + ${m} = **${2 * m}**.`);
        }
        const m = R(2, 10);
        return num(`A quarter of a number is ${m}. What is the number?`, 4 * m,
          ['Four quarters make a whole.', `Add ${m} four times: ${m} + ${m} + ${m} + ${m}.`],
          `Four quarters make the whole: ${m} + ${m} + ${m} + ${m} = **${4 * m}**.`);
      }
      // 'compare'
      const a = 2 * R(2, 10);
      const b = Math.random() < 0.4 ? a + (a % 4 ? 2 : 0) : 4 * R(1, 6);
      const va = a / 2, vb = b / 4;
      const A = `${U.frac(1, 2)} of ${a}`, B = `${U.frac(1, 4)} of ${b}`, S = 'They are the same';
      const best = va > vb ? A : vb > va ? B : S;
      return ch('Which is **more**?', best, [A, B, S],
        ['Work out each one first.', `${U.frac(1, 2)} of ${a} is ${va}. Now work out ${U.frac(1, 4)} of ${b}.`],
        `${A} = ${va}. ${B} = ${vb}. So the answer is **${best}**.`, {}, 3);
    }
  });

  // =====================================================================
  // UNIT 5 — Measure, shape and data
  // =====================================================================
  PMLM.registerUnit({ id: 'g2.u5', grade: 2, name: 'Measure, shape, data', icon: '📏' });

  // ---------- 17. Telling the time ----------
  const timeName = (h, m) => (m === 0 ? `${h} o'clock` : m === 15 ? `quarter past ${h}` : m === 30 ? `half past ${h}` : `quarter to ${nextHour(h)}`);
  // time from minutes since midnight (any whole number of quarter hours)
  const timeAt = t => { const h = Math.floor(t / 60) % 12 || 12; return timeName(h, t % 60); };

  PMLM.registerSkill({
    id: 'g2.time', grade: 2, unit: 'g2.u5', title: 'Telling the time', icon: '🕒',
    blurb: "O'clock, half past, quarter past and quarter to",
    lesson: [
      {
        title: 'The two hands',
        text: 'A clock has two hands.\nThe **short hand** shows the **hour**.\nThe **long hand** shows the **minutes**.',
        visual: { type: 'clock', h: 3, m: 0 }
      },
      {
        title: "O'clock",
        text: "When the long hand points straight up to **12**, it is **o'clock**.\nThe short hand shows which hour.\nThis clock shows **3 o'clock**.",
        visual: { type: 'clock', h: 3, m: 0 }
      },
      {
        title: 'Half past',
        text: 'When the long hand points to **6**, it has gone half way round. It is **half past**.\nThe short hand is half way between 7 and 8.\nThis clock shows **half past 7**.',
        visual: { type: 'clock', h: 7, m: 30 }
      },
      {
        title: 'Quarter past and quarter to',
        text: 'Long hand on **3**: it is **quarter past** the hour.\nLong hand on **9**: it is **quarter to** the next hour.\nThis clock shows **quarter to 5**. The short hand is nearly at 5.',
        visual: { type: 'clock', h: 4, m: 45 }
      },
      {
        title: 'Worked example',
        text: 'What time does this clock show?\n1. Look at the long hand first. It points to **3**, so it is **quarter past**.\n2. Look at the short hand. It has just gone past **2**.\n3. So the time is **quarter past 2**.',
        visual: { type: 'clock', h: 2, m: 15 }
      }
    ],
    gen(level) {
      const h = R(1, 12), m = P(level === 1 ? [0, 30] : [0, 30, 15, 45]);
      const nh = nextHour(h);
      const f = P(level === 1 ? ['read', 'read', 'read', 'hand'] : level === 2 ? ['read', 'read', 'hand', 'facts'] : ['read', 'hand', 'facts', 'later', 'later']);

      if (f === 'read') {
        const ans = timeName(h, m);
        let wrong;
        if (m === 0) wrong = [`half past ${h}`, h !== 12 ? "12 o'clock" : "6 o'clock", `${nh} o'clock`];
        else if (m === 30) wrong = level === 1 ? [`half past ${nh}`, `${h} o'clock`, `${nh} o'clock`] : [`half past ${nh}`, `${h} o'clock`, `quarter past ${h}`];
        else if (m === 15) wrong = [`quarter to ${h}`, `half past ${h}`, `${h} o'clock`];
        else wrong = [`quarter to ${h}`, `quarter past ${nh}`, `half past ${h}`];
        const step = {
          0: "The long hand points to 12, so it is **o'clock**. Which number does the short hand point to?",
          30: 'The long hand points to 6, so it is **half past**. Which number has the short hand gone past?',
          15: 'The long hand points to 3, so it is **quarter past**. Which number has the short hand just gone past?',
          45: 'The long hand points to 9, so it is **quarter to**. Which number is the short hand nearly at?'
        }[m];
        const why = {
          0: `The long hand is on 12 and the short hand is on ${h}. It is **${ans}**.`,
          30: `The long hand is on 6, so it is half past. The short hand is half way between ${h} and ${nh}. It is **${ans}**.`,
          15: `The long hand is on 3, so it is quarter past. The short hand is just past ${h}. It is **${ans}**.`,
          45: `The long hand is on 9, so it is quarter to. The short hand is nearly at ${nh}. It is **${ans}**.`
        }[m];
        return ch('What time does the clock show?', ans, wrong, ['Look at the long hand first. Then look at the short hand.', step], why,
          { visual: { type: 'clock', h, m } });
      }
      if (f === 'hand') {
        if (Math.random() < 0.6) {
          const pos = { 0: 12, 30: 6, 15: 3, 45: 9 }[m];
          const wrong = level === 1 ? ['to the 12', 'to the 6', `to the ${h}`] : ['to the 12', 'to the 6', 'to the 3', 'to the 9'];
          const tip = {
            0: "At o'clock, the long hand is right at the top.",
            30: 'At half past, the long hand has gone half way round the clock.',
            15: 'At quarter past, the long hand has gone a quarter of the way round.',
            45: 'At quarter to, the long hand has gone three quarters of the way round.'
          }[m];
          return ch(`At ${timeName(h, m)}, where does the **long** hand point?`, `to the ${pos}`, wrong,
            ['The long hand shows the minutes.', tip],
            `At ${timeName(h, m)}, the long hand points **to the ${pos}**.`, {}, level === 1 ? 3 : 4);
        }
        return ch(`At ${h} o'clock, where does the **short** hand point?`, `to the ${h}`, ['to the 12', `to the ${nh}`, 'to the 6'],
          ['The short hand shows the hour.', `At ${h} o'clock the long hand points straight up to 12. The short hand shows the hour.`],
          `At ${h} o'clock, the long hand points to the 12 and the short hand points **to the ${h}**.`);
      }
      if (f === 'facts') {
        const F = [
          ['How many minutes are in **1 hour**?', 60, 'minutes', ['The long hand goes all the way round the clock in 1 hour.', 'Each number on the clock is 5 minutes for the long hand. Count in 5s all the way round.'], 'There are **60** minutes in 1 hour.'],
          ['How many minutes are in **half an hour**?', 30, 'minutes', ['There are 60 minutes in 1 hour.', 'Half an hour is half of 60.'], 'Half of 60 is 30. There are **30** minutes in half an hour.'],
          ['How many minutes are in **a quarter of an hour**?', 15, 'minutes', ['There are 60 minutes in 1 hour.', 'From 12 to 3 is a quarter of the way round. Count in 5s: 5, 10, ...'], 'There are **15** minutes in a quarter of an hour.'],
          ['How many hours are in **1 day**?', 24, 'hours', ['A day is a daytime and a night-time together.', 'The short hand goes round the clock twice in a day: 12 + 12.'], '12 + 12 = 24. There are **24** hours in a day.'],
          ['How many days are in **1 week**?', 7, 'days', ['Say the days of the week.', 'Monday, Tuesday, Wednesday ... count them on your fingers.'], 'Monday to Sunday is **7** days.'],
          [`How many minutes is it from **${h} o'clock** to **half past ${h}**?`, 30, 'minutes', ['The long hand moves from 12 to 6.', 'That is half way round the clock. Half an hour is half of 60 minutes.'], `From ${h} o'clock to half past ${h} is half an hour, which is **30** minutes.`],
          [`How many minutes is it from **half past ${h}** to **${nh} o'clock**?`, 30, 'minutes', ['The long hand moves from 6 back up to 12.', 'That is half way round the clock. Half an hour is half of 60 minutes.'], `From half past ${h} to ${nh} o'clock is half an hour, which is **30** minutes.`],
          [`How many minutes is it from **${h} o'clock** to **quarter past ${h}**?`, 15, 'minutes', ['The long hand moves from 12 to 3.', 'Each number is 5 minutes. Count in 5s from 12 to 3.'], `From ${h} o'clock to quarter past ${h} is a quarter of an hour, which is **15** minutes.`],
          [`How many minutes is it from **${h} o'clock** to **${nh} o'clock**?`, 60, 'minutes', ['The long hand goes all the way round once.', 'That is 1 hour. How many minutes are in 1 hour?'], `From ${h} o'clock to ${nh} o'clock is 1 hour, which is **60** minutes.`]
        ];
        const [q, ans, unit, hints, explain] = P(F);
        return num(q, ans, hints, explain, { unit });
      }
      // 'later' — what time will it be?
      const m0 = P([0, 30]);
      const dur = P([15, 30, 60]);
      const start = h * 60 + m0, end = start + dur;
      const ans = timeAt(end);
      const durText = dur === 15 ? 'a quarter of an hour' : dur === 30 ? 'half an hour' : '1 hour';
      const wrong = U.shuffle([end + 60, start, end + 15, end - 15 === start ? end + 30 : end - 15, end + 30].map(timeAt)).filter(s => s !== ans);
      return ch(`The clock shows ${timeName(h, m0)}. What time will it be in ${durText}?`, ans, wrong,
        ['Start at the time on the clock. Move the long hand on.',
          dur === 15 ? 'A quarter of an hour: the long hand moves a quarter of the way round, 3 numbers on.'
            : dur === 30 ? 'Half an hour: the long hand moves half way round, 6 numbers on.'
              : '1 hour: the long hand goes all the way round, and the short hand moves on 1 number.'],
        `${cap(durText)} after ${timeName(h, m0)} is **${ans}**.`,
        { visual: { type: 'clock', h, m: m0 } });
    }
  });

  // ---------- 18. Money ----------
  const ITEMS = ['pencil', 'ball', 'book', 'toy car', 'kite', 'cap', 'drink', 'teddy', 'puzzle', 'comic', 'yo-yo'];
  const COINS = [null, [1, 2, 5, 10], [1, 2, 5, 10, 20], [1, 2, 5, 10, 20, 50]];

  PMLM.registerSkill({
    id: 'g2.money', grade: 2, unit: 'g2.u5', title: 'Money', icon: '💰',
    blurb: 'Add up coins and notes, and work out change',
    lesson: [
      {
        title: 'Coins and notes',
        text: 'We use coins and notes to pay for things.\nEach one has a value written on it: 1, 2, 5, 10 ...\nA bigger number means it is worth more.',
        visual: { type: 'coins', values: [1, 2, 5, 10] }
      },
      {
        title: 'Adding money',
        text: 'Start with the **biggest** one, then count on.\n10, then 15, then 16, 17.\nAltogether this is worth **17**.',
        visual: { type: 'coins', values: [10, 5, 1, 1] }
      },
      {
        title: 'Different ways to pay',
        text: 'You can make the same amount in different ways.\n10 is the same as 5 + 5.\nIt is also the same as 5 + 2 + 2 + 1.',
        visual: { type: 'coins', values: [5, 2, 2, 1] }
      },
      {
        title: 'Change',
        text: 'If you pay too much, you get **change** back.\nA toy costs 13. You pay 20.\nCount on from 13 to 20: that is 7. Your change is **7**.',
        visual: { type: 'numberLine', min: 10, max: 20, step: 1, labelEvery: 5, points: [{ at: 13, label: '13' }], jumps: [{ from: 13, to: 20, label: '+7' }] }
      },
      {
        title: 'Worked example',
        text: 'A book costs 34. You pay with a 50 note. How much change?\n1. Count on from 34 to 40: that is 6.\n2. Count on from 40 to 50: that is 10.\n3. 6 + 10 = 16. The change is **16**.',
        visual: { type: 'numberLine', min: 30, max: 50, step: 1, labelEvery: 5, points: [{ at: 34, label: '34' }], jumps: [{ from: 34, to: 40, label: '+6' }, { from: 40, to: 50, label: '+10' }] }
      }
    ],
    gen(level, ctx) {
      const cur = ctx && ctx.currency ? ctx.currency : '';
      const money = v => `${cur}${v}`;
      const pre = cur ? { prefix: cur } : {};
      const coins = COINS[level];
      const top = TOP[level];
      const name = U.name();
      const countOn = (from, to) => {
        if (from % 10 === 0) return `Count on in tens from ${money(from)} to ${money(to)}, then count any ones.`;
        const nt = (tens(from) + 1) * 10;
        if (nt >= to) return `Count on from ${money(from)} to ${money(to)}. How many?`;
        return `Count on from ${money(from)} to ${money(nt)}: that is ${nt - from}. Now count on to ${money(to)}.`;
      };
      const f = P(level === 1 ? ['count', 'count', 'shop', 'change', 'makes'] : ['count', 'shop', 'change', 'makes', 'need']);

      if (f === 'count') {
        let vals;
        const [lo, hi] = level === 1 ? [2, 4] : level === 2 ? [3, 5] : [3, 6];
        do { vals = U.range(1, R(lo, hi)).map(() => P(coins)); } while (sum(vals) > top || new Set(vals).size < 2);
        const sorted = vals.slice().sort((x, y) => y - x);
        const total = sum(vals);
        return num('How much money is there altogether?', total,
          ['Start with the biggest one. Then count on.',
            sorted.length === 2 ? `Start with ${money(sorted[0])} and count on ${sorted[1]}.` : `Start with ${money(sorted[0])}. Count on ${money(sorted[1])} to make ${money(sorted[0] + sorted[1])}. Keep going.`],
          `${sorted.map(money).join(' + ')} = **${money(total)}**.`,
          Object.assign({ visual: { type: 'coins', values: level === 1 ? sorted : U.shuffle(vals) } }, pre));
      }
      if (f === 'shop') {
        let a, b;
        do {
          a = level === 1 ? R(2, 12) : level === 2 ? R(5, 30) : R(10, 60);
          b = level === 1 ? R(2, 9) : level === 2 ? R(5, 25) : R(10, 45);
        } while (a + b > top);
        const [i1, i2] = U.sample(ITEMS, 2);
        return num(`A ${i1} costs ${money(a)}. A ${i2} costs ${money(b)}. How much do they cost altogether?`, a + b,
          ['Altogether means add.', addStep(a, b)],
          `${money(a)} + ${money(b)} = **${money(a + b)}**.`, pre);
      }
      if (f === 'change') {
        const pay = P(level === 1 ? [10, 20] : level === 2 ? [20, 50] : [50, 100]);
        const cost = R(pay === 10 ? 2 : Math.floor(pay / 4), pay - 1);
        const item = P(ITEMS);
        return num(`${name} buys a ${item} for ${money(cost)} and pays with ${money(pay)}. How much change does ${name} get?`, pay - cost,
          ['Change is the money you get back. Count on from the price up to what you paid.', countOn(cost, pay)],
          `${money(cost)} + ${money(pay - cost)} = ${money(pay)}, so the change is **${money(pay - cost)}**.`,
          Object.assign({ visual: { type: 'coins', values: [pay] } }, pre));
      }
      if (f === 'makes') {
        const big = coins[coins.length - 1];
        let T;
        do { T = level === 1 ? R(6, 19) : level === 2 ? R(11, 49) : R(21, 99); } while (coins.includes(T));
        const greedy = [];
        let r = T;
        for (const c of coins.slice().reverse()) while (r >= c) { greedy.push(c); r -= c; }
        const str = l => l.slice().sort((x, y) => y - x).map(money).join(' + ');
        const variants = [];
        greedy.forEach((v, i) => {
          coins.forEach(c => { if (c !== v && c < big * 2) { const alt = greedy.slice(); alt[i] = c; variants.push(alt); } });
          if (greedy.length > 1) variants.push(greedy.filter((_, j) => j !== i));
        });
        variants.push(greedy.concat([1]));
        const tol = Math.max(3, Math.round(T * 0.3));
        const wrongLists = U.shuffle(variants.filter(l => sum(l) !== T && Math.abs(sum(l) - T) <= tol && l.length >= 2 && l.length <= 7));
        const seen = new Set();
        const wrong = [];
        for (const l of wrongLists) { const s = str(l); if (!seen.has(s)) { seen.add(s); wrong.push([s, sum(l)]); } }
        return ch(`Which of these make exactly ${money(T)}?`, str(greedy), wrong.map(x => x[0]),
          [`Add up each one. Which makes exactly ${money(T)}?`, `Check one: ${wrong[0][0]} makes ${money(wrong[0][1])}, so it is not that one.`],
          `${str(greedy)} = ${money(T)}. The answer is **${str(greedy)}**.`);
      }
      // 'need' — how much more?
      const c = level === 2 ? R(15, 50) : R(30, 99);
      const h = level === 2 ? R(5, c - 2) : R(10, c - 3);
      const item = P(ITEMS);
      return num(`${name} has ${money(h)}. A ${item} costs ${money(c)}. How much more money does ${name} need?`, c - h,
        [`Find the difference between the price and what ${name} has.`, countOn(h, c)],
        `${money(h)} + ${money(c - h)} = ${money(c)}, so ${name} needs **${money(c - h)}** more.`, pre);
    }
  });

  // ---------- 19. 2D and 3D shapes ----------
  const SH2 = {
    circle: { name: 'circle', wrong: ['Sphere', 'Semicircle', 'Square'], hints: ['Does it have any straight sides or corners?', 'It is flat and perfectly round all the way round.'], why: 'It is flat and round, with no corners, so it is a **circle**.' },
    triangle: { name: 'triangle', sides: 3, wrong: ['Square', 'Rectangle', 'Pentagon'] },
    square: { name: 'square', sides: 4, sym: 4, wrong: ['Rectangle', 'Cube', 'Triangle'], hints: ['Count the sides. Then look at how long they are.', 'All 4 sides are the same length.'], why: 'It has 4 sides that are all the same length, so it is a **square**.' },
    rectangle: { name: 'rectangle', sides: 4, sym: 2, wrong: ['Square', 'Cuboid', 'Triangle'], hints: ['Count the sides. Then look at how long they are.', 'It has 2 long sides and 2 short sides.'], why: 'It has 4 sides: 2 long and 2 short, so it is a **rectangle**.' },
    pentagon: { name: 'pentagon', sides: 5, wrong: ['Hexagon', 'Octagon', 'Square'] },
    hexagon: { name: 'hexagon', sides: 6, wrong: ['Pentagon', 'Octagon', 'Rectangle'] },
    octagon: { name: 'octagon', sides: 8, wrong: ['Hexagon', 'Pentagon', 'Circle'] },
    semicircle: { name: 'semicircle', sym: 1, wrong: ['Circle', 'Triangle', 'Rectangle'], hints: ['Look at the sides. Are they straight or curved?', 'It has 1 straight side and 1 curved side.'], why: 'It is half of a circle, so it is a **semicircle**.' }
  };
  const SH3 = {
    cube: { name: 'cube', faces: 6, edges: 12, vertices: 8, wrong: ['Square', 'Cylinder', 'Square-based pyramid'], hints: ['Look at the faces. What shape are they?', 'All its faces are squares of the same size, like a dice.'], why: 'All 6 faces are squares, so it is a **cube**.' },
    cuboid: { name: 'cuboid', faces: 6, edges: 12, vertices: 8, wrong: ['Rectangle', 'Cube', 'Cylinder'], hints: ['Look at the faces. What shape are they?', 'It is shaped like a box. Some faces are rectangles.'], why: 'It is shaped like a box with rectangle faces, so it is a **cuboid**.' },
    sphere: { name: 'sphere', flat: 0, wrong: ['Circle', 'Cylinder', 'Cone'], hints: ['Is it flat, or round all over?', 'It is round all over, like a ball.'], why: 'It is round all over like a ball, so it is a **sphere**.' },
    cylinder: { name: 'cylinder', flat: 2, wrong: ['Circle', 'Cone', 'Cuboid'], hints: ['Look at the two ends. What shape are they?', 'It has 2 flat circle ends and a curved side, like a tin.'], why: 'It has 2 circle ends and a curved side, so it is a **cylinder**.' },
    cone: { name: 'cone', flat: 1, wrong: ['Triangle', 'Cylinder', 'Square-based pyramid'], hints: ['Look at the bottom, then look at the top.', 'It has 1 flat circle face and comes to a point, like a party hat.'], why: 'It has a circle face and a point at the top, so it is a **cone**.' },
    squarePyramid: { name: 'square-based pyramid', faces: 5, edges: 8, vertices: 5, wrong: ['Triangle', 'Cone', 'Triangular prism'], hints: ['Look at the bottom face and the side faces.', 'The bottom is a square. The side faces are triangles that meet at a point.'], why: 'It has a square bottom and triangle faces that meet at a point, so it is a **square-based pyramid**.' },
    triangularPrism: { name: 'triangular prism', faces: 5, edges: 9, vertices: 6, wrong: ['Triangle', 'Square-based pyramid', 'Cuboid'], hints: ['Look at the two end faces.', 'Both ends are triangles. The other faces are rectangles.'], why: 'Both ends are triangles and the other faces are rectangles, so it is a **triangular prism**.' }
  };
  const FACE_Q = {
    'cube.faces': ['A face is a flat surface. Some faces are hidden at the back!', 'Think of a dice: top, bottom, and the faces all round the sides.', 'Top, bottom and 4 round the sides: a cube has **6** faces.'],
    'cuboid.faces': ['A face is a flat surface. Some faces are hidden at the back!', 'Think of a box: the top and bottom make 2. Now count the faces round the sides.', 'Top, bottom and 4 round the sides: a cuboid has **6** faces.'],
    'cylinder.flat': ['A flat face is a part you could stand it on.', 'Think of a tin can. Look at its top and its bottom.', 'The top and the bottom are flat circles. A cylinder has **2** flat faces.'],
    'cone.flat': ['A flat face is a part you could stand it on.', 'Think of a party hat. Is the pointy part flat? Is the bottom flat?', 'Only the circle at the bottom is flat. A cone has **1** flat face.'],
    'sphere.flat': ['A flat face is a part you could stand it on.', 'Think of a ball. Is any part of it flat?', 'A sphere is curved all over. It has **0** flat faces.'],
    'cube.edges': ['An edge is where two faces meet.', 'Count the 4 edges round the top, then the 4 round the bottom. Then count the edges going up and down.', '4 on top + 4 on the bottom + 4 going up and down = **12** edges.'],
    'cube.vertices': ['A vertex is a corner, where edges meet.', 'The top face has 4 corners. Now count the corners of the bottom face.', '4 corners on top + 4 on the bottom = **8** vertices.'],
    'cuboid.vertices': ['A vertex is a corner, where edges meet.', 'The top face has 4 corners. Now count the corners of the bottom face.', '4 corners on top + 4 on the bottom = **8** vertices.'],
    'squarePyramid.faces': ['A face is a flat surface. Some faces are hidden at the back!', 'The bottom is a square: that is 1 face. Now count the triangles round the sides.', '1 square + 4 triangles = **5** faces.'],
    'squarePyramid.vertices': ['A vertex is a corner, where edges meet.', 'The square bottom has 4 corners. Now look at the top.', '4 corners at the bottom + 1 at the top = **5** vertices.'],
    'squarePyramid.edges': ['An edge is where two faces meet.', 'The square bottom has 4 edges. Now count the edges going up to the point.', '4 round the bottom + 4 going up to the point = **8** edges.'],
    'triangularPrism.faces': ['A face is a flat surface. Some faces are hidden at the back!', 'There are 2 triangle faces, one at each end. Now count the rectangles.', '2 triangles + 3 rectangles = **5** faces.'],
    'triangularPrism.vertices': ['A vertex is a corner, where edges meet.', 'Each triangle end has 3 corners.', '3 corners at each of the 2 ends: 3 + 3 = **6** vertices.']
  };
  const SYM = {
    square: ['Try folding it top to bottom, then side to side. Then try corner to corner.', 'A square folds into matching halves top to bottom, side to side, and corner to corner both ways. It has **4** lines of symmetry.'],
    rectangle: ['Try folding it top to bottom, then side to side. Does corner to corner work?', 'A rectangle folds into matching halves top to bottom and side to side, but not corner to corner. It has **2** lines of symmetry.'],
    semicircle: ['Try folding it so the two ends of the curve meet.', 'A semicircle only matches when you fold it down the middle. It has **1** line of symmetry.']
  };

  PMLM.registerSkill({
    id: 'g2.shapes', grade: 2, unit: 'g2.u5', title: '2D and 3D shapes', icon: '🔺',
    blurb: 'Name shapes and count sides, corners and faces',
    lesson: [
      {
        title: '2D shapes are flat',
        text: 'A **2D shape** is flat, like a drawing.\nIts straight edges are called **sides**.\nWhere two sides meet is a **corner** (also called a **vertex**).\nA triangle has 3 sides and 3 corners.',
        visual: { type: 'shape2d', shape: 'triangle' }
      },
      {
        title: 'Names of 2D shapes',
        text: '**Triangle**: 3 sides\n**Square** and **rectangle**: 4 sides\n**Pentagon**: 5 sides\n**Hexagon**: 6 sides\n**Octagon**: 8 sides\nA **circle** is round, with no corners.',
        visual: { type: 'shape2d', shape: 'hexagon' }
      },
      {
        title: '3D shapes are solid',
        text: 'A **3D shape** is solid, like a box or a ball.\nIts flat surfaces are called **faces**. Faces meet at **edges**. Corners are **vertices**.\nA **cube** has 6 square faces, 12 edges and 8 vertices.',
        visual: { type: 'shape3d', shape: 'cube' }
      },
      {
        title: 'Lines of symmetry',
        text: 'A **line of symmetry** cuts a shape into 2 halves that match, like a mirror.\nFold a square in half and the halves match.\nA square has **4** lines of symmetry. A rectangle has **2**.',
        visual: { type: 'shape2d', shape: 'square' }
      },
      {
        title: 'Worked example',
        text: 'How many sides does a pentagon have?\n1. Put your finger on one side and count it: 1.\n2. Go round the shape, counting each side: 2, 3, 4, 5.\n3. Stop when you are back at the start. A pentagon has **5** sides.',
        visual: { type: 'shape2d', shape: 'pentagon' }
      }
    ],
    gen(level) {
      const pool2 = level === 1 ? ['circle', 'triangle', 'square', 'rectangle']
        : level === 2 ? ['circle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'semicircle']
          : ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'octagon', 'semicircle'];
      const pool3 = level === 2 ? ['cube', 'cuboid', 'sphere', 'cylinder', 'cone'] : ['cube', 'cuboid', 'sphere', 'cylinder', 'cone', 'squarePyramid', 'triangularPrism'];
      const polys = pool2.filter(k => SH2[k].sides);
      const f = P(level === 1 ? ['name2d', 'name2d', 'sides', 'riddle'] : level === 2 ? ['name2d', 'name3d', 'sides', 'riddle', 'faces', 'dim']
        : ['name2d', 'name3d', 'sides', 'faces', 'faces', 'sym', 'riddle']);

      if (f === 'name2d') {
        const key = P(pool2), s = SH2[key];
        const hints = s.hints || ['Count the straight sides.', 'Start at one corner and count each side as you go round. Which name means that many sides?'];
        const why = s.why || `It has ${s.sides} straight sides, so it is a **${s.name}**.`;
        return ch('What is the name of this shape?', cap(s.name), s.wrong, hints, why, { visual: { type: 'shape2d', shape: key } });
      }
      if (f === 'name3d') {
        const key = P(pool3), s = SH3[key];
        return ch('What is the name of this 3D shape?', cap(s.name), s.wrong, s.hints, s.why, { visual: { type: 'shape3d', shape: key } });
      }
      if (f === 'sides') {
        const key = P(polys), s = SH2[key];
        const corners = Math.random() < 0.4;
        return num(`How many ${corners ? 'corners' : 'sides'} does this shape have?`, s.sides,
          [corners ? 'A corner is where two sides meet.' : 'A side is a straight edge of the shape.',
            `Put your finger on one ${corners ? 'corner' : 'side'} and count it: 1. Then go round the shape, counting each one.`],
          `This is a ${s.name}. It has ${s.sides} sides and ${s.sides} corners. The answer is **${s.sides}**.`,
          { visual: { type: 'shape2d', shape: key } });
      }
      if (f === 'riddle') {
        const key = P(polys), s = SH2[key];
        let q, wrong;
        if (key === 'square') { q = 'I am a flat shape with 4 sides. All my sides are the same length. What am I?'; wrong = ['Rectangle', 'Triangle', 'Cube']; }
        else if (key === 'rectangle') { q = 'I am a flat shape with 4 sides: 2 long sides and 2 short sides. What am I?'; wrong = ['Square', 'Triangle', 'Cuboid']; }
        else { q = `I am a flat shape with ${s.sides} straight sides and ${s.sides} corners. What am I?`; wrong = polys.filter(k => k !== key).map(k => cap(SH2[k].name)); }
        return ch(q, cap(s.name), U.shuffle(wrong),
          ['Think about how many sides each shape has.', `Try drawing it: draw ${s.sides} straight sides joined up, then look at your shape.`],
          `A ${s.name} has ${s.sides} sides${key === 'square' ? ', all the same length' : key === 'rectangle' ? ', 2 long and 2 short' : ''}. The answer is **${cap(s.name)}**.`);
      }
      if (f === 'faces') {
        const keys = level === 2 ? ['cube.faces', 'cuboid.faces', 'cylinder.flat', 'cone.flat', 'sphere.flat']
          : Object.keys(FACE_Q);
        const id = P(keys);
        const [shape, prop] = id.split('.');
        const s = SH3[shape];
        const val = prop === 'flat' ? s.flat : s[prop];
        const q = prop === 'flat' ? `How many **flat** faces does a ${s.name} have?`
          : prop === 'vertices' ? `How many vertices (corners) does a ${s.name} have?` : `How many ${prop} does a ${s.name} have?`;
        const [h1, h2, why] = FACE_Q[id];
        return num(q, val, [h1, h2], why, { visual: { type: 'shape3d', shape } });
      }
      if (f === 'sym') {
        const key = P(['square', 'rectangle', 'semicircle']);
        const [h2, why] = SYM[key];
        return num('How many lines of symmetry does this shape have?', SH2[key].sym,
          ['A line of symmetry cuts a shape into 2 halves that match, like a mirror.', h2], why,
          { visual: { type: 'shape2d', shape: key } });
      }
      // 'dim' — 2D or 3D?
      const want3 = Math.random() < 0.5;
      const flat = U.sample(pool2.map(k => cap(SH2[k].name)), 3);
      const solid = U.sample(pool3.map(k => cap(SH3[k].name)), 3);
      const ans = want3 ? solid[0] : flat[0];
      return ch(want3 ? 'Which shape is **3D** (solid)?' : 'Which shape is **2D** (flat)?', ans, want3 ? flat : solid,
        ['A 3D shape is solid, like a box or a ball. A 2D shape is flat, like a drawing.', 'Imagine each one. Could you pick it up and hold it like a box or a ball?'],
        `A ${ans.toLowerCase()} is ${want3 ? 'solid' : 'flat'}, so the answer is **${ans}**.`);
    }
  });

  // ---------- 20. Pictograms, tally charts and block charts ----------
  const DATA = [
    { title: 'Favourite fruit', cat: 'fruit', labels: ['Apple', 'Banana', 'Orange', 'Pear'] },
    { title: 'Favourite colour', cat: 'colour', labels: ['Red', 'Blue', 'Green', 'Yellow'] },
    { title: 'Favourite pet', cat: 'pet', labels: ['Cat', 'Dog', 'Fish', 'Rabbit'] },
    { title: 'Favourite sport', cat: 'sport', labels: ['Football', 'Swimming', 'Tennis', 'Running'] }
  ];

  PMLM.registerSkill({
    id: 'g2.data', grade: 2, unit: 'g2.u5', title: 'Pictograms and charts', icon: '📊',
    blurb: 'Read pictograms, tally charts and block charts',
    lesson: [
      {
        title: 'Tally marks',
        text: 'We use tally marks to count. Each line is **1**.\nThe 5th line goes across the other 4, like a gate. A gate is **5**.\nCount the gates in 5s, then count on the single lines.',
        visual: { type: 'tally', rows: [{ label: 'Cat', count: 7 }, { label: 'Dog', count: 4 }] }
      },
      {
        title: 'Pictograms',
        text: 'A **pictogram** uses pictures to show numbers.\nAlways look at the **key** to see what one picture means.\nHere each 🙂 means **1** child.',
        visual: { type: 'pictogram', rows: [{ label: 'Apple', count: 5 }, { label: 'Banana', count: 3 }, { label: 'Pear', count: 6 }], symbol: '🙂', per: 1, title: 'Favourite fruit' }
      },
      {
        title: 'Block charts',
        text: 'In a **block chart** (bar chart), the taller the bar, the more there are.\nGo to the top of a bar, then look across to the numbers on the side.\nBlue has **8**.',
        visual: { type: 'barChart', bars: [{ label: 'Red', value: 5 }, { label: 'Blue', value: 8 }, { label: 'Green', value: 3 }], step: 1, yLabel: 'Children', title: 'Favourite colour' }
      },
      {
        title: 'How many more?',
        text: 'To find **how many more**, take the smaller number from the bigger number.\nBlue has 8 and Green has 3.\n8 − 3 = **5**, so 5 more children chose Blue.',
        visual: { type: 'barChart', bars: [{ label: 'Red', value: 5 }, { label: 'Blue', value: 8 }, { label: 'Green', value: 3 }], step: 1, yLabel: 'Children', title: 'Favourite colour' }
      },
      {
        title: 'Worked example',
        text: 'How many children chose Swimming?\n1. Find the Swimming row.\n2. Count the pictures: 6.\n3. The key says each 🙂 is 1 child, so **6** children chose Swimming.',
        visual: { type: 'pictogram', rows: [{ label: 'Football', count: 4 }, { label: 'Swimming', count: 6 }, { label: 'Tennis', count: 2 }], symbol: '🙂', per: 1, title: 'Favourite sport' }
      }
    ],
    gen(level) {
      const d = P(DATA);
      const k = level === 1 ? 3 : 4;
      const labels = d.labels.slice(0, k);
      const chart = P(level === 1 ? ['pictogram', 'tally'] : ['pictogram', 'tally', 'bar']);
      const even = level === 3 && chart !== 'tally';
      const pool = U.range(level === 1 ? 1 : level === 2 ? 1 : 2, level === 1 ? 8 : level === 2 ? 12 : 20).filter(x => !even || x % 2 === 0);
      const v = U.sample(pool, k);
      const per = level === 3 && chart === 'pictogram' ? 2 : 1;
      const rows = labels.map((label, i) => ({ label, count: v[i] }));
      const visual = chart === 'pictogram' ? { type: 'pictogram', rows, symbol: '🙂', per, title: d.title }
        : chart === 'tally' ? { type: 'tally', rows }
          : { type: 'barChart', bars: labels.map((label, i) => ({ label, value: v[i] })), step: level === 3 ? 2 : 1, yLabel: 'Children', title: d.title };
      const lookFor = chart === 'pictogram' ? 'row' : chart === 'tally' ? 'row' : 'bar';
      const readHints = L => (chart === 'pictogram'
        ? (per === 1 ? [`Find the ${L} row. Each 🙂 means 1 child.`, `Count the pictures in the ${L} row.`]
          : ['Look at the key: each 🙂 means 2 children.', `Find the ${L} row. Count in 2s for each picture: 2, 4, 6, ...`])
        : chart === 'tally' ? ['Each gate of 5 lines is 5. Each single line is 1.', `Find the ${L} row. Count the gates in 5s first, then count on the single lines.`]
          : [`Find the ${L} bar.`, `Go to the top of the ${L} bar, then look across to the numbers on the side.`]);
      const f = P(level === 1 ? ['read', 'read', 'most', 'more'] : level === 2 ? ['read', 'most', 'least', 'more', 'total'] : ['read', 'most', 'more', 'total', 'totalAll']);

      if (f === 'read') {
        const i = R(0, k - 1), L = labels[i];
        return num(`How many children chose **${L}**?`, v[i], readHints(L),
          `Reading the ${L} ${lookFor}: **${v[i]}** ${v[i] === 1 ? 'child' : 'children'} chose ${L}.`, { visual });
      }
      if (f === 'most' || f === 'least') {
        const most = f === 'most';
        const target = most ? Math.max(...v) : Math.min(...v);
        const L = labels[v.indexOf(target)];
        const look = chart === 'bar' ? (most ? 'Find the tallest bar.' : 'Find the shortest bar.')
          : chart === 'tally' ? (most ? 'Find the row with the most tally marks.' : 'Find the row with the fewest tally marks.')
            : (most ? 'Find the row with the most pictures.' : 'Find the row with the fewest pictures.');
        return ch(`Which ${d.cat} did the **${most ? 'most' : 'fewest'}** children choose?`, L, labels.filter(x => x !== L),
          [most ? 'Most means the biggest number.' : 'Fewest means the smallest number.', look],
          `${L} has ${target}, the ${most ? 'most' : 'fewest'}. The answer is **${L}**.`, { visual }, k);
      }
      if (f === 'more') {
        let [i, j] = U.sample(U.range(0, k - 1), 2);
        if (v[i] < v[j]) [i, j] = [j, i];
        const diff = v[i] - v[j];
        return num(`How many more children chose **${labels[i]}** than **${labels[j]}**?`, diff,
          ['"How many more" means find the difference. Take the smaller number from the bigger one.', `Find both numbers first. ${labels[i]} has ${v[i]}.`],
          `${labels[i]}: ${v[i]}. ${labels[j]}: ${v[j]}. ${v[i]} ${M} ${v[j]} = **${diff}**.`, { visual });
      }
      if (f === 'total') {
        const [i, j] = U.sample(U.range(0, k - 1), 2);
        return num(`Altogether, how many children chose **${labels[i]}** or **${labels[j]}**?`, v[i] + v[j],
          ['Altogether means add.', `${labels[i]} has ${v[i]}. Now find ${labels[j]} and add.`],
          `${labels[i]}: ${v[i]}. ${labels[j]}: ${v[j]}. ${v[i]} + ${v[j]} = **${v[i] + v[j]}**.`, { visual });
      }
      const total = sum(v);
      return num('How many children were asked altogether?', total,
        ['Add up the numbers for every row.', `Start with the first two: ${v[0]} + ${v[1]} = ${v[0] + v[1]}. Then add the others.`],
        `${v.join(' + ')} = **${total}**.`, { visual });
    }
  });
})();
