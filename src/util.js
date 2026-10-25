// Shared helpers for question generators (see CONTRACT.md).
const U = (() => {
  const MINUS = '−';

  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const sample = (arr, k) => shuffle(arr).slice(0, k);
  const range = (a, b, step = 1) => {
    const out = [];
    for (let x = a; step > 0 ? x <= b : x >= b; x += step) out.push(x);
    return out;
  };

  const gcd = (a, b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  };
  const lcm = (a, b) => (a && b ? Math.abs(a * b) / gcd(a, b) : 0);
  const simplify = (n, d) => {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    return [n / g, d / g];
  };

  // Remove binary float noise: 0.1 + 0.2 -> 0.3
  const clean = x => +(+x).toPrecision(12);
  const round = (x, dp = 0) => {
    const f = Math.pow(10, dp);
    return clean(Math.round(clean(x * f)) / f);
  };
  const sigfig = (x, n) => (x === 0 ? 0 : clean(+(+x).toPrecision(n)));

  const fmt = (x, dp) => {
    if (typeof x === 'string') return x;
    let v = clean(x);
    let s = dp === undefined ? String(Math.abs(v)) : Math.abs(v).toFixed(dp);
    if (s.includes('e')) s = Math.abs(v).toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
    let [int, dec] = s.split('.');
    if (int.length >= 5) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    s = dec !== undefined ? int + '.' + dec : int;
    return (v < 0 ? MINUS : '') + s;
  };

  const frac = (n, d) => `{${fmt(n)}/${fmt(d)}}`;
  const fracS = (n, d) => frac(...simplify(n, d));
  const mixed = (n, d) => {
    [n, d] = simplify(n, d);
    if (d === 1) return fmt(n);
    if (Math.abs(n) < d) return frac(n, d);
    const whole = Math.trunc(n / d);
    const rem = Math.abs(n) % d;
    return `${fmt(whole)} {${rem}/${d}}`;
  };

  const isPrime = n => {
    if (n < 2 || n % 1) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };
  const factors = n => {
    const out = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i);
    return out;
  };
  const primeFactors = n => {
    const out = [];
    let m = n;
    for (let p = 2; p * p <= m; p++) while (m % p === 0) { out.push(p); m /= p; }
    if (m > 1) out.push(m);
    return out;
  };

  const bad = s => s === '' || /NaN|undefined|Infinity|null/.test(s);

  const choices = (answer, distractors, n = 4) => {
    const a = String(answer);
    const out = [a];
    for (const d of distractors) {
      const s = String(d);
      if (!bad(s) && !out.includes(s)) out.push(s);
      if (out.length >= n) break;
    }
    return shuffle(out);
  };

  const numChoices = (answer, opts = {}) => {
    const { extra = [], n = 4, min = -Infinity, dp } = opts;
    const a = clean(answer);
    const isInt = Number.isInteger(a);
    const near = isInt
      ? [a + 1, a - 1, a + 10, a - 10, a + 2, a - 2, a * 10, a + 5, a - 5, a + 100]
      : [a * 10, a / 10, a + 0.1, a - 0.1, a + 1, a - 1, a * 100, a / 100, a + 0.01];
    const cands = [...extra, ...near]
      .filter(x => typeof x === 'string' || (Number.isFinite(x) && x >= min && clean(x) !== a))
      .map(x => (typeof x === 'string' ? x : fmt(clean(x), dp)));
    return choices(fmt(a, dp), cands, n);
  };

  // Algebra terms: term(3,'x') -> '3x', term(-1,'x',false) -> ' − x', term(5,'',false) -> ' + 5'
  const term = (c, v = 'x', first = true) => {
    if (c === 0) return '';
    const abs = Math.abs(c);
    const body = v && abs === 1 ? v : fmt(abs) + v;
    if (first) return (c < 0 ? MINUS : '') + body;
    return (c < 0 ? ` ${MINUS} ` : ' + ') + body;
  };
  const expr = terms => {
    let s = '';
    for (const [c, v] of terms) {
      if (c === 0) continue;
      s += term(c, v, s === '');
    }
    return s || '0';
  };

  const NAMES = ['Ali', 'Leyla', 'Sam', 'Mia', 'Omar', 'Aysel', 'Tom', 'Nina', 'Murad', 'Zara',
    'Ravi', 'Emma', 'Kenan', 'Lucy', 'Farid', 'Sofia', 'Jack', 'Amina', 'Leo', 'Nigar'];
  const name = () => pick(NAMES);
  const s = (n, word, plural) => `${fmt(n)} ${n === 1 ? word : plural || word + 's'}`;
  const ord = n => {
    const t = n % 100;
    if (t >= 11 && t <= 13) return n + 'th';
    return n + (['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  };

  return {
    MINUS, rint, pick, shuffle, sample, range, gcd, lcm, simplify, clean, round, sigfig, fmt,
    frac, fracS, mixed, isPrime, factors, primeFactors, choices, numChoices, term, expr, name, s, ord
  };
})();
