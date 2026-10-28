// Sends the daily reminders. .github/workflows/reminders.yml runs it every hour; the rules for who gets what are
// in src/reminders.js (PMLM_REMINDERS.plan), shared with the game and the unit tests.
//
//   node send-reminders.mjs                      live project, credentials from the environment (GitHub secrets)
//   node send-reminders.mjs --env staging        staging project, credentials from ~/.config/pmlm/ (see README)
//   node send-reminders.mjs --dry-run            print who would get which message, send nothing
//   node send-reminders.mjs --only <account id>  just that device (for testing), ignoring the hour and the back-off
//   node send-reminders.mjs --emulator           the local Firestore emulator (tests)
//   --now 2026-10-25T17:05:00Z                   pretend it is this time (tests)
//
// Environment: FIREBASE_SERVICE_ACCOUNT (the key JSON) and VAPID_PRIVATE_KEY. Without them it exits quietly, so the
// hourly job stays green until reminders are set up.
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import vm from 'node:vm';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import webpush from 'web-push';

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const ENV = opt('--env') || 'live', DRY = args.includes('--dry-run'), ONLY = opt('--only'), EMU = args.includes('--emulator');
const NOW = opt('--now') ? Date.parse(opt('--now')) : Date.now();
// The contact address the push services see. Taps open the address each device subscribed from (sw.js opens its own
// scope), so an old pmlm.uk subscription lands on the landing page, which sends the device on to play.pmlm.uk.
const SITE = ENV === 'staging' ? 'https://rendorf.github.io/pmlm-preview/' : 'https://play.pmlm.uk/';
const root = new URL('../../', import.meta.url);

// The game's own files: reminder rules and the public key
const ctx = vm.createContext({ Intl, Date, Math, String, Number, Array, Object });
vm.runInContext(readFileSync(new URL('src/reminders.js', root), 'utf8') + '\nthis.R = PMLM_REMINDERS;', ctx);
const R = ctx.R;
const configText = readFileSync(new URL(ENV === 'staging' ? 'src/config.preview.js' : 'src/config.js', root), 'utf8');
const VAPID_PUBLIC = (configText.match(/const PMLM_VAPID = '([^']*)'/) || [])[1] || '';

function credentials() {
  if (ENV === 'staging') {
    const dir = `${homedir()}/.config/pmlm`;
    const sa = existsSync(`${dir}/staging-service-account.json`) ? readFileSync(`${dir}/staging-service-account.json`, 'utf8') : '';
    const vk = existsSync(`${dir}/staging-vapid.json`) ? JSON.parse(readFileSync(`${dir}/staging-vapid.json`, 'utf8')).privateKey : '';
    return { sa: process.env.FIREBASE_SERVICE_ACCOUNT_STAGING || sa, vapid: process.env.VAPID_PRIVATE_KEY_STAGING || vk };
  }
  return { sa: process.env.FIREBASE_SERVICE_ACCOUNT || '', vapid: process.env.VAPID_PRIVATE_KEY || '' };
}

async function main() {
  const { sa, vapid } = credentials();
  if (EMU) {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
    initializeApp({ projectId: 'demo-pmlm' });
  } else {
    if (!sa || !vapid || !VAPID_PUBLIC) {
      console.log(`Reminders are not set up for ${ENV} yet (service account, VAPID private key or public key missing). Nothing to do.`);
      return;
    }
    initializeApp({ credential: cert(JSON.parse(sa)) });
  }
  if (!DRY) {
    if (!vapid || !VAPID_PUBLIC) throw new Error('Sending needs VAPID keys. Use --dry-run with the emulator.');
    webpush.setVapidDetails(SITE, VAPID_PUBLIC, vapid);
  }
  const db = getFirestore();
  const snap = ONLY ? [await db.collection('push').doc(ONLY).get()].filter(d => d.exists) : (await db.collection('push').get()).docs;
  let sent = 0, skipped = 0, removed = 0;
  for (const doc of snap) {
    const d = doc.data();
    let p = R.plan(d, NOW);
    // --only: a test message for one device, whatever the hour
    if (ONLY && !p.send) p = Object.assign(R.plan(Object.assign({}, d, { hour: R.local(NOW, d.tz, d.off).hour, lastSent: '', kids: (d.kids || []).map(k => Object.assign({}, k, { last: '2000-01-01' })) }), NOW), { send: true });
    const who = doc.id.slice(0, 6);
    if (!p.send) { skipped++; if (DRY) console.log(`${who}…  skip: ${p.reason}`); continue; }
    if (DRY) { console.log(`${who}…  send ${p.id}: "${p.title}" / "${p.body}" (${p.reason})`); sent++; continue; }
    try {
      await webpush.sendNotification({ endpoint: d.sub.endpoint, keys: { p256dh: d.sub.p256dh, auth: d.sub.auth } },
        JSON.stringify({ title: p.title, body: p.body }), { TTL: 6 * 3600, urgency: 'normal' });
      await doc.ref.update({ lastSent: p.day, lastMsg: p.id });
      sent++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) { await doc.ref.delete(); removed++; }
      else console.log(`${who}…  failed: ${e.statusCode || ''} ${e.message}`);
    }
  }
  console.log(`${ENV}${DRY ? ' (dry run)' : ''}: ${sent} sent, ${skipped} not due, ${removed} expired subscriptions removed.`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
