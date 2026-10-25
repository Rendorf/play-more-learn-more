// Every question generator and teaching picture, run inside the real browser engines (Chromium and Safari's WebKit)
import { test, expect } from '@playwright/test';

test('in-game self-test: all 201 skills, no problems', async ({ page }) => {
  await page.goto('/index.html#selftest');
  const r = await page.waitForFunction(() => window.__selftest, null, { timeout: 120000 }).then(h => h.jsonValue());
  expect(r.skills).toBe(201);
  expect(r.errors).toEqual([]);
});
