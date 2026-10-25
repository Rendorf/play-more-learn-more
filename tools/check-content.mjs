// Usage: node tools/check-content.mjs src/grade2.js [--runs 300] [--samples 3] [--skill g2.placeValue]
// Runs every generator many times per level and reports contract violations.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const files = args.filter((a, i) => a.endsWith('.js') && !(args[i - 1] || '').startsWith('--'));
const RUNS = +opt('--runs', 300);
const SAMPLES = +opt('--samples', 0);
const ONLY = opt('--skill', null);

const units = [], skills = [];
const ctx = {
  console, Math, JSON, Number, String, Array, Object, Set, Map,
  PMLM: {
    registerUnit: u => units.push(u),
    registerSkill: s => skills.push(s),
  },
};
vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.resolve(f), 'utf8') + '\n;this.U = typeof U !== "undefined" ? U : this.U; this.PMLM_VALIDATE = typeof PMLM_VALIDATE !== "undefined" ? PMLM_VALIDATE : this.PMLM_VALIDATE;', ctx, { filename: f });
load(path.join(root, 'src/util.js'));
load(path.join(root, 'src/validate.js'));
for (const f of files) load(f);

const V = ctx.PMLM_VALIDATE;
let total = 0;
const unitIds = new Set(units.map(u => u.id));
const seen = new Set();
for (const u of units) {
  if (!u.id || !u.name || !u.icon || !(u.grade >= 1 && u.grade <= 9)) { console.log(`UNIT ${JSON.stringify(u)}: missing id/name/icon/grade`); total++; }
  if (u.name && u.name.length > 22) { console.log(`UNIT ${u.id}: name longer than 22 chars`); total++; }
}
for (const sk of skills) {
  if (ONLY && sk.id !== ONLY) continue;
  const errs = new Map();
  const add = e => errs.set(e, (errs.get(e) || 0) + 1);
  if (seen.has(sk.id)) add('duplicate skill id');
  seen.add(sk.id);
  if (!unitIds.has(sk.unit)) add(`unit "${sk.unit}" not registered`);
  V.skill(sk).forEach(add);
  for (const level of [1, 2, 3]) {
    const qs = new Set();
    for (let i = 0; i < RUNS; i++) {
      let q;
      try { q = sk.gen(level, { currency: '₼' }); } catch (e) { add(`L${level} gen threw: ${e.message}`); continue; }
      V.question(q).forEach(e => add(`L${level} ${e}`));
      if (q && q.q) qs.add(q.q + JSON.stringify(q.visual || ''));
      if (SAMPLES && i < SAMPLES) {
        console.log(`\n[${sk.id} L${level}] ${q.q}`);
        if (q.visual) console.log(`   visual: ${JSON.stringify(q.visual)}`);
        if (q.choices) console.log(`   choices: ${q.choices.join(' | ')}`);
        console.log(`   answer: ${JSON.stringify(q.answer)}${q.unit ? ' ' + q.unit : ''}${q.simplest ? ' (simplest)' : ''}`);
        console.log(`   hints: ${q.hints && q.hints.join(' / ')}`);
        console.log(`   explain: ${q.explain}`);
      }
    }
    if (qs.size < Math.min(8, RUNS)) add(`L${level} only ${qs.size} distinct questions in ${RUNS} runs (want more variety)`);
  }
  if (errs.size) {
    console.log(`\n✗ ${sk.id}`);
    for (const [e, n] of errs) console.log(`   ${n > 1 ? `(${n}×) ` : ''}${e}`);
    total += errs.size;
  }
}
console.log(`\n${units.length} units, ${skills.length} skills checked, ${RUNS} runs per level. ${total ? total + ' problem(s).' : 'All clean ✓'}`);
process.exit(total ? 1 : 0);
