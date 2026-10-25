// Before the browser tests: build the preview copy and the mock-Firebase pages, and fetch the live version.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { ROOT, oldBuild, TEST_VAPID } from './helpers.mjs';

export default function setup() {
  execFileSync('python3', [`${ROOT}build.py`, '--preview'], { stdio: 'inherit' });
  execFileSync('python3', [`${ROOT}tools/make-synctest.py`], { stdio: 'inherit' });
  // A copy of the game with a (made-up) reminder key, next to its own service worker, for the reminder tests
  mkdirSync(`${ROOT}tests/.cache/vapid`, { recursive: true });
  writeFileSync(`${ROOT}tests/.cache/vapid/index.html`, readFileSync(`${ROOT}index.html`, 'utf8').replace("const PMLM_VAPID = '';", `const PMLM_VAPID = '${TEST_VAPID}';`));
  copyFileSync(`${ROOT}sw.js`, `${ROOT}tests/.cache/vapid/sw.js`);
  const old = oldBuild();
  console.log(`Comparing with the live version ${old.ref.slice(0, 7)}`);
}
