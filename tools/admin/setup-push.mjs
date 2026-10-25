// Creates the key pair for daily reminders (Web Push) and puts each half where it belongs. The private key is
// never printed. Run from the repository root:
//
//   node tools/admin/setup-push.mjs             live: public key → src/config.js, private key → GitHub secret VAPID_PRIVATE_KEY
//   node tools/admin/setup-push.mjs --preview   staging: public key → src/config.preview.js, private key → ~/.config/pmlm/staging-vapid.json
//
// New keys make every existing reminder subscription stop working (each device would have to turn reminders on
// again), so it refuses to replace a key that is already set unless you add --force.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { spawnSync, execFileSync } from 'node:child_process';
import webpush from 'web-push';

const PREVIEW = process.argv.includes('--preview'), FORCE = process.argv.includes('--force');
const root = new URL('../../', import.meta.url);
const configPath = new URL(PREVIEW ? 'src/config.preview.js' : 'src/config.js', root);
const config = readFileSync(configPath, 'utf8');
if (/const PMLM_VAPID = '[^']+'/.test(config) && !FORCE) {
  console.error(`${PREVIEW ? 'src/config.preview.js' : 'src/config.js'} already has a reminder key. Add --force to replace it (devices must then turn reminders on again).`);
  process.exit(1);
}

const keys = webpush.generateVAPIDKeys();
if (PREVIEW) {
  const dir = `${homedir()}/.config/pmlm`;
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(`${dir}/staging-vapid.json`, JSON.stringify(keys), { mode: 0o600 });
  console.log(`Private key saved to ${dir}/staging-vapid.json`);
} else {
  const r = spawnSync('gh', ['secret', 'set', 'VAPID_PRIVATE_KEY', '--repo', 'Rendorf/play-more-learn-more'], { input: keys.privateKey, stdio: ['pipe', 'inherit', 'inherit'] });
  if (r.status !== 0) { console.error('Could not save the GitHub secret (is gh logged in?). Nothing was changed.'); process.exit(1); }
}
writeFileSync(configPath, config.replace(/const PMLM_VAPID = '[^']*';/, `const PMLM_VAPID = '${keys.publicKey}';`));
execFileSync('python3', [new URL('build.py', root).pathname, ...(PREVIEW ? ['--preview'] : [])], { stdio: 'inherit' });
console.log(`Public key written to ${PREVIEW ? 'src/config.preview.js' : 'src/config.js'}. Commit it together with the rebuilt files.`);
