// Copies every document in the Firebase database (family accounts, players, codes, test data) to a JSON file on
// this computer. Run it before publishing new rules or merging a release, so there is always a restore point.
//
//   node backup-firestore.mjs --key ~/.config/pmlm/live-service-account.json
//       → ~/AgentMemory/PlayMoreLearnMore-backups/<project>-<date-time>.json  (read-only for the database)
//   node backup-firestore.mjs --key <key.json> --restore <backup.json> --yes
//       writes every document in the backup back (documents not in the backup are left alone)
//   --emulator   use the local Firestore emulator instead (tests)
//   --out <dir>  another folder for the backup
//
// The backup holds family data, so it is written outside the repository and never committed.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const EMU = args.includes('--emulator');
const expand = p => (p && p.startsWith('~/') ? join(homedir(), p.slice(2)) : p);

if (EMU) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  initializeApp({ projectId: 'demo-pmlm' });
} else {
  if (!opt('--key')) { console.error('Give the service-account key file: --key ~/.config/pmlm/live-service-account.json'); process.exit(1); }
  initializeApp({ credential: cert(JSON.parse(readFileSync(expand(opt('--key')), 'utf8'))) });
}
const db = getFirestore();

// Timestamps are stored as { "__ts": milliseconds } so they come back as timestamps on restore
const pack = v => (v instanceof Timestamp ? { __ts: v.toMillis() } : Array.isArray(v) ? v.map(pack) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, pack(x)])) : v);
const unpack = v => (v && typeof v === 'object' && '__ts' in v ? Timestamp.fromMillis(v.__ts) : Array.isArray(v) ? v.map(unpack) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, unpack(x)])) : v);

// listDocuments also finds documents that only hold subcollections
async function dumpCollection(col, out) {
  for (const ref of await col.listDocuments()) {
    const snap = await ref.get();
    if (snap.exists) out[ref.path] = pack(snap.data());
    for (const sub of await ref.listCollections()) await dumpCollection(sub, out);
  }
}

if (opt('--restore')) {
  if (!args.includes('--yes')) { console.error('Restoring overwrites documents. Add --yes to confirm.'); process.exit(1); }
  const data = JSON.parse(readFileSync(expand(opt('--restore')), 'utf8'));
  const paths = Object.keys(data.docs || {});
  for (let i = 0; i < paths.length; i += 400) {
    const b = db.batch();
    for (const p of paths.slice(i, i + 400)) b.set(db.doc(p), unpack(data.docs[p]));
    await b.commit();
  }
  console.log(`Restored ${paths.length} documents from ${opt('--restore')}`);
} else {
  const docs = {};
  for (const col of await db.listCollections()) await dumpCollection(col, docs);
  const project = EMU ? 'emulator' : JSON.parse(readFileSync(expand(opt('--key')), 'utf8')).project_id;
  const dir = expand(opt('--out') || '~/AgentMemory/PlayMoreLearnMore-backups');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${project}-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`);
  writeFileSync(file, JSON.stringify({ project, at: new Date().toISOString(), count: Object.keys(docs).length, docs }, null, 1), { mode: 0o600 });
  console.log(`Saved ${Object.keys(docs).length} documents to ${file}`);
}
