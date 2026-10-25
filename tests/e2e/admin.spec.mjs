// The owner's tools, against the local Firestore emulator: who gets a reminder, and backup + restore.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { ROOT, clearEmulators, putDoc, docs } from './helpers.mjs';

const node = (script, ...args) => execFileSync('node', [`${ROOT}tools/admin/${script}`, '--emulator', ...args], { encoding: 'utf8', env: Object.assign({}, process.env, { FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' }) });
const sub = { endpoint: 'https://push.example.test/x', p256dh: 'p', auth: 'a' };
const kid = (last, str = 1, wish = -1) => ({ av: '🦊', str, last, wish });

test('reminder sender: the right devices get the right message', async () => {
  await clearEmulators();
  // 17:05 in Baku on 2026-10-25, 13:05 in London (clocks went back that morning)
  await putDoc('push/streaky', { owner: 'streaky', sub, tz: 'Asia/Baku', off: 240, hour: 17, kids: [kid('2026-10-24', 4)], t: 1 });
  await putDoc('push/playedtoday', { owner: 'playedtoday', sub, tz: 'Asia/Baku', off: 240, hour: 17, kids: [kid('2026-10-25', 2)], t: 1 });
  await putDoc('push/later', { owner: 'later', sub, tz: 'Asia/Baku', off: 240, hour: 19, kids: [kid('2026-10-24')], t: 1 });
  await putDoc('push/london', { owner: 'london', sub, tz: 'Europe/London', off: 0, hour: 13, kids: [kid('2026-10-22', 1, 10)], t: 1 });
  await putDoc('push/gone', { owner: 'gone', sub, tz: 'Asia/Baku', off: 240, hour: 17, kids: [kid('2026-10-01')], t: 1 });
  const out = node('send-reminders.mjs', '--dry-run', '--now', '2026-10-25T13:05:00Z');
  expect(out).toMatch(/streak…\s+send streak\.\d/);
  expect(out).toMatch(/played…\s+skip: played today/);
  expect(out).toMatch(/later…\s+skip: not the chosen hour/);
  expect(out).toMatch(/london…\s+send wish\.\d.*10%/);
  expect(out).toMatch(/gone…\s+skip: stopped after 14 days/);
  expect(out).toContain('2 sent, 3 not due');
  // --only sends a test message to one device whatever the time
  expect(node('send-reminders.mjs', '--dry-run', '--only', 'later', '--now', '2026-10-25T13:05:00Z')).toMatch(/later…\s+send/);
});

test('backup copies every document and restore brings them back', async () => {
  await clearEmulators();
  await putDoc('families/f1', { createdBy: 'f1', shared: '{"pin":"x"}', updatedAt: 5 });
  await putDoc('families/f1/players/p1', { data: '{"name":"Kid","coins":12}', updatedAt: 6 });
  await putDoc('families/f1/parents/f1', { email: 'parent@example.com', joinedAt: 1 });
  await putDoc('events/e1', { d: 'd1', type: 'round', n: 10 });
  const dir = mkdtempSync(`${tmpdir()}/pmlm-backup-`);
  expect(node('backup-firestore.mjs', '--out', dir)).toContain('Saved 4 documents');
  const file = `${dir}/${readdirSync(dir)[0]}`;
  const saved = JSON.parse(readFileSync(file, 'utf8'));
  expect(saved.docs['families/f1/players/p1'].data).toBe('{"name":"Kid","coins":12}');
  await clearEmulators();
  expect(await docs('events')).toEqual([]);
  expect(() => node('backup-firestore.mjs', '--restore', file)).toThrow(/--yes/);
  expect(node('backup-firestore.mjs', '--restore', file, '--yes')).toContain('Restored 4 documents');
  const r = await fetch('http://127.0.0.1:8080/v1/projects/demo-pmlm/databases/(default)/documents/families/f1/players/p1', { headers: { Authorization: 'Bearer owner' } });
  expect((await r.json()).fields.data.stringValue).toBe('{"name":"Kid","coins":12}');
});
