// Family saving against the local emulators (?emu=1) with the real Firebase SDK and the real firestore.rules:
// a stuck live connection falls back to plain HTTPS, a stale copy never overwrites progress, a parent locks a
// child's device from their own phone, and bug reports carry the game's diagnostics. Each device is its own
// browser context.
import { test, expect } from '@playwright/test';
import { clearEmulators, docs, putDoc, waitForDocs, newPlayer, openParents, typePin, playRound, home, act, tab, state } from './helpers.mjs';

const EMU = '/index.html?emu=1';
const CHANNEL = '**/google.firestore.v1.Firestore/**';   // the SDK's live connection (not the REST API)
async function fresh(page) { await page.goto(EMU); await page.evaluate(() => localStorage.clear()); await page.reload(); }
async function practiseRound(page) { await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise'); await playRound(page); await home(page); }
const serverKid = async (fid, name) => (await docs(`families/${fid}/players`)).map(d => JSON.parse(d.data)).find(p => p.name === name);

// A parent with two children, Kid A and Kid B, and Kid A's own device linked to the family
async function family(browser) {
  const parent = await (await browser.newContext()).newPage();
  await fresh(parent);
  await newPlayer(parent, { name: 'Kid A', grade: 3 });
  await openParents(parent);
  await act(parent, 'newplayer'); await parent.fill('#np-name', 'Kid B'); await parent.locator('[data-act="createplayer"]').click(); await parent.waitForTimeout(1700);
  if (await parent.locator('.sheet [data-act="close"]').count()) await parent.locator('.sheet [data-act="close"]').last().click();
  await openParents(parent);
  await act(parent, 'loginopen');
  await parent.fill('#pl-email', 'parent@example.com'); await parent.fill('#pl-pass', 'secret123');
  await act(parent, 'signupemail');
  await expect(parent.getByText('Devices and parents')).toBeVisible({ timeout: 20000 });
  const fid = (await docs('families'))[0]._id;
  await expect.poll(async () => (await docs(`families/${fid}/players`)).length, { timeout: 20000 }).toBe(2);
  await act(parent, 'mkcode', '[data-r="device"]');
  const code = (await parent.locator('.codebox').innerText()).trim();

  const child = await (await browser.newContext()).newPage();
  await fresh(child);
  await act(child, 'linkopen');
  await child.fill('#lk-code', code); await child.fill('#lk-name', "Kid A's tablet");
  await act(child, 'linkgo');
  await child.locator('#tabs:visible, [data-act="pick"]').first().waitFor({ timeout: 20000 });
  if (await child.locator('[data-act="pick"]').count()) await child.locator('[data-act="pick"]', { hasText: 'Kid A' }).click();
  await child.locator('#tabs').waitFor();
  const cs = await state(child);
  expect(cs.profiles.find(p => p.id === cs.current).name).toBe('Kid A');
  const deviceId = (await docs(`families/${fid}/devices`))[0]._id;
  return { parent, child, fid, deviceId };
}

test.beforeEach(async () => { await clearEmulators(); });

test('a stuck live connection: saving switches to the backup route, and a stale copy never wins', async ({ browser }) => {
  test.setTimeout(240000);
  const { child, fid } = await family(browser);
  await practiseRound(child);
  await expect.poll(async () => (await serverKid(fid, 'Kid A')).stats.rounds, { timeout: 20000 }).toBe(1);

  // The case that prompted this: the device reloads, but Firebase's live connection can't get through (plain HTTPS still can)
  await child.route(CHANNEL, r => r.abort());
  await child.reload();
  await child.locator('#tabs').waitFor();
  await practiseRound(child);
  await expect.poll(async () => (await serverKid(fid, 'Kid A')).stats.rounds, { timeout: 90000, message: 'the round reaches the family through the backup route' }).toBe(2);
  await openParents(child);
  await expect(child.locator('#view')).toContainText('using the backup connection');
  await expect(child.locator('#view')).toContainText('Last saved online:');
  await act(child, 'syncnow');
  await expect(child.locator('.toast').last()).toContainText('Saved online', { timeout: 30000 });

  // Someone saves an old copy of Kid A later (less progress, newer time): the device keeps the progress and puts it back
  const now = await serverKid(fid, 'Kid A');
  const old = Object.assign({}, now, { stats: Object.assign({}, now.stats, { answered: 1, rounds: 0 }), brain: 10, updatedAt: Date.now() + 60000 });
  await putDoc(`families/${fid}/players/${now.id}`, { data: JSON.stringify(old), updatedAt: old.updatedAt });
  await expect.poll(async () => (await serverKid(fid, 'Kid A')).stats.rounds, { timeout: 60000, message: 'the device re-uploads the copy with more progress' }).toBe(2);
  expect((await state(child)).profiles.find(p => p.name === 'Kid A').stats.rounds).toBe(2);
});

test('a parent locks a child\'s device from their own phone; the PIN unlocks it for now', async ({ browser }) => {
  test.setTimeout(240000);
  const { parent, child, fid, deviceId } = await family(browser);
  const kidA = (await state(parent)).profiles.find(p => p.name === 'Kid A');
  await parent.selectOption(`select[data-change="devplayer"][data-id="${deviceId}"]`, kidA.id);
  await expect.poll(async () => (await docs(`families/${fid}/devices`))[0].player).toBe(kidA.id);
  await expect.poll(async () => (await state(child)).lock, { timeout: 30000 }).toBe(kidA.id);

  // Kid A can't switch to Kid B or add a player
  await act(child, 'players');
  await expect(child.locator('.sheet')).toContainText("This is Kid A's device");
  await expect(child.locator('.sheet [data-act="pick"]')).toHaveCount(0);
  // A grown-up unlocks it with the PIN until the game closes
  await act(child, 'unlockdev');
  await typePin(child);
  await expect(child.locator('.sheet [data-act="pick"]')).toHaveCount(2);
  await child.locator('.sheet [data-act="pick"]', { hasText: 'Kid B' }).click();
  expect((await state(child)).current).not.toBe(kidA.id);
  // Closing the game locks it again
  await child.reload(); await child.locator('#tabs').waitFor();
  await expect(child.locator('.chip.player')).toContainText('Kid A');
  // it is saved a moment later (slower machines need longer than a fixed wait)
  await expect.poll(async () => (await state(child)).current, { timeout: 15000 }).toBe(kidA.id);

  // The parent unlocks it
  await parent.selectOption(`select[data-change="devplayer"][data-id="${deviceId}"]`, '');
  await expect.poll(async () => (await state(child)).lock || null, { timeout: 30000 }).toBe(null);
  await act(child, 'players');
  await expect(child.locator('.sheet [data-act="pick"]')).toHaveCount(2);
});

test('bug reports: a pop-up when something breaks (never mid-round) and a report button, with diagnostics and no names', async ({ page }) => {
  await fresh(page);
  await newPlayer(page, { name: 'Secret Name', grade: 2 });
  // Something breaks on the map: the pop-up offers a report
  await page.evaluate(() => setTimeout(() => { throw new Error('Test boom'); }, 0));
  await expect(page.locator('.sheet')).toContainText('Oops! Something went wrong');
  await act(page, 'bugkind', '[data-v="stuck"]');
  await page.fill('#bugtext', 'The button did nothing');
  await act(page, 'bugsend');
  const [bug] = await waitForDocs('feedback', f => f.kind === 'bug' && /Test boom/.test(f.err || ''));
  expect(bug).toMatchObject({ what: 'stuck', text: 'The button did nothing', screen: 'home/play' });
  expect(bug.sync).toContain('status=');
  expect(bug.log).toContain('createplayer');

  // Mid-round, the pop-up waits until the round is over
  await page.locator('#view [data-act="skill"].pulse').click(); await act(page, 'practise');
  await page.evaluate(() => setTimeout(() => { throw new Error('Mid-round boom'); }, 0));
  await page.waitForTimeout(1000);
  await expect(page.locator('.sheet')).toHaveCount(0);
  await act(page, 'quit'); await act(page, 'leave');
  await expect(page.locator('.sheet')).toContainText('Oops!');
  await act(page, 'close');

  // A problem the game didn't notice: the 🐞 button in the Me tab
  await tab(page, 'me');
  await act(page, 'bugopen');
  await act(page, 'bugkind', '[data-v="points"]');
  await act(page, 'bugsend');
  await waitForDocs('feedback', f => f.kind === 'bug' && f.what === 'points');
  expect(JSON.stringify(await docs('feedback'))).not.toContain('Secret Name');
});
