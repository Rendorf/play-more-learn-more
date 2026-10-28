// The landing page fits phones and tablets (no sideways scrolling), in both halves. Runs on every device project.
import { test, expect } from '@playwright/test';

test('the landing page fits the screen', async ({ page }) => {
  for (const part of ['kids', 'grownups']) {
    await page.goto(`/welcome.html#${part}`);
    await expect(page.locator(`#${part}`)).toBeVisible();
    const bad = await page.evaluate(() => {
      const w = document.documentElement.clientWidth, out = [];
      if (document.documentElement.scrollWidth > w + 1) out.push(`page is ${document.documentElement.scrollWidth}px wide on a ${w}px screen`);
      for (const el of document.querySelectorAll('header *, nav *, main *, footer *')) {
        if (!el.getClientRects().length) continue;
        const r = el.getBoundingClientRect();
        if (r.right > w + 1 || r.left < -1) out.push(`${el.tagName.toLowerCase()}.${el.className} (${Math.round(r.left)}–${Math.round(r.right)} of ${w})`);
      }
      return out.slice(0, 10);
    });
    expect(bad, part).toEqual([]);
  }
});
