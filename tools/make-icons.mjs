// Draws the PNG app icons from icons/icon.svg with the test browser. Run after changing the SVG:
//   cd tests && npm install && cd .. && node tools/make-icons.mjs
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../tests/package.json', import.meta.url));
const { chromium } = require('playwright');
const svg = readFileSync(new URL('../icons/icon.svg', import.meta.url), 'utf8');
const SIZES = { 'icon-192.png': 192, 'icon-512.png': 512, 'icon-maskable-512.png': 512, 'apple-touch-icon.png': 180 };

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size] of Object.entries(SIZES)) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  await page.screenshot({ path: new URL(`../icons/${name}`, import.meta.url).pathname });
  console.log(`icons/${name} (${size}×${size})`);
}
await browser.close();
