// Content checks shared by tools/check-content.mjs and the in-game ?selftest=1 mode.
const PMLM_VALIDATE = (() => {
  const KINDS = ['number', 'fraction', 'choice', 'coord'];
  const VISUALS = ['base10', 'numberLine', 'array', 'objects', 'bond', 'fractionBar', 'pie', 'clock', 'coins',
    'shape2d', 'shape3d', 'angle', 'parallelLines', 'polygon', 'grid', 'barChart', 'pictogram', 'tally', 'table',
    'bag', 'spinner', 'balance', 'barModel', 'placeValue', 'sequence', 'thermometer'];
  const BAD = /NaN|undefined|Infinity|\[object|null/;

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const isInt = x => Number.isInteger(x);

  function textErrors(where, s, errs) {
    if (typeof s !== 'string' || !s.trim()) { errs.push(`${where}: empty or not a string`); return; }
    if (BAD.test(s)) errs.push(`${where}: contains "${s.match(BAD)[0]}" → ${s.slice(0, 80)}`);
    const opens = (s.match(/\{/g) || []).length, closes = (s.match(/\}/g) || []).length;
    if (opens !== closes) errs.push(`${where}: unbalanced braces → ${s.slice(0, 80)}`);
    if ((s.match(/\*\*/g) || []).length % 2) errs.push(`${where}: unbalanced ** → ${s.slice(0, 80)}`);
  }

  function visualErrors(where, v, errs) {
    if (!v) return;
    if (!VISUALS.includes(v.type)) { errs.push(`${where}: unknown visual type "${v.type}"`); return; }
    const json = JSON.stringify(v);
    if (BAD.test(json)) errs.push(`${where}: visual contains bad value → ${json.slice(0, 100)}`);
    if (v.type === 'angle') {
      const sum = (v.parts || []).reduce((a, b) => a + b, 0);
      const need = { line: 180, point: 360, triangle: 180 }[v.mode];
      if (need && Math.abs(sum - need) > 1e-6) errs.push(`${where}: angle parts sum ${sum}, need ${need}`);
      if (!v.labels || v.labels.length !== (v.parts || []).length) errs.push(`${where}: angle labels/parts length mismatch`);
    }
    if (v.type === 'numberLine' && v.step > 0 && (v.max - v.min) / v.step > 24.0001) errs.push(`${where}: numberLine has > 24 ticks`);
  }

  function skill(sk) {
    const errs = [];
    for (const f of ['id', 'unit', 'title', 'icon', 'blurb']) if (!sk[f]) errs.push(`missing ${f}`);
    if (!(Number.isInteger(sk.grade) && sk.grade >= 1 && sk.grade <= 9)) errs.push(`bad grade ${sk.grade}`);
    if (typeof sk.gen !== 'function') errs.push('gen is not a function');
    if (!Array.isArray(sk.lesson) || sk.lesson.length < 3 || sk.lesson.length > 5) errs.push('lesson must have 3–5 cards');
    (sk.lesson || []).forEach((c, i) => {
      textErrors(`lesson[${i}].text`, c.text, errs);
      if (c.title !== undefined) textErrors(`lesson[${i}].title`, c.title, errs);
      visualErrors(`lesson[${i}].visual`, c.visual, errs);
    });
    if (sk.title && sk.title.length > 26) errs.push(`title longer than 26 chars: ${sk.title}`);
    if (sk.blurb && sk.blurb.length > 60) errs.push(`blurb longer than 60 chars`);
    return errs;
  }

  function question(q) {
    const errs = [];
    if (!q || typeof q !== 'object') return ['gen returned nothing'];
    textErrors('q', q.q, errs);
    if (!KINDS.includes(q.kind)) errs.push(`bad kind "${q.kind}"`);
    if (!Array.isArray(q.hints) || q.hints.length !== 2) errs.push('hints must be an array of 2');
    else q.hints.forEach((h, i) => textErrors(`hints[${i}]`, h, errs));
    textErrors('explain', q.explain, errs);
    visualErrors('visual', q.visual, errs);
    if (q.prefix !== undefined) textErrors('prefix', q.prefix, errs);
    if (q.unit !== undefined) textErrors('unit', q.unit, errs);

    if (q.kind === 'number') {
      if (typeof q.answer !== 'number' || !Number.isFinite(q.answer)) errs.push(`number answer not finite: ${q.answer}`);
    } else if (q.kind === 'fraction') {
      const a = q.answer;
      if (!Array.isArray(a) || a.length !== 2 || !isInt(a[0]) || !isInt(a[1]) || a[1] === 0) errs.push(`bad fraction answer ${JSON.stringify(a)}`);
      else {
        if (a[0] % a[1] === 0) errs.push(`fraction answer is a whole number (${a[0]}/${a[1]}) — use kind number`);
        if (q.simplest && gcd(a[0], a[1]) !== 1) errs.push(`simplest set but answer ${a[0]}/${a[1]} not simplest`);
      }
    } else if (q.kind === 'choice') {
      const c = q.choices;
      if (!Array.isArray(c) || c.length < 2 || c.length > 5) errs.push(`choices must be 2–5, got ${c && c.length}`);
      else {
        c.forEach((x, i) => textErrors(`choices[${i}]`, x, errs));
        if (new Set(c).size !== c.length) errs.push(`duplicate choices ${JSON.stringify(c)}`);
        if (!c.includes(q.answer)) errs.push(`answer ${JSON.stringify(q.answer)} not in choices ${JSON.stringify(c)}`);
      }
    } else if (q.kind === 'coord') {
      const a = q.answer;
      if (!Array.isArray(a) || a.length !== 2 || !a.every(Number.isFinite)) errs.push(`bad coord answer ${JSON.stringify(a)}`);
    }
    return errs;
  }

  return { skill, question, VISUALS, KINDS };
})();
if (typeof module !== 'undefined') module.exports = PMLM_VALIDATE;
