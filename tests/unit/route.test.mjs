// The Cloudflare Worker: which page "/" serves on which host (worker/index.js), its settings (tools/deploy/wrangler.json),
// move.json's headers (_headers), and what tools/deploy/stage.sh publishes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = new URL('../../', import.meta.url);
// The repo root has no package.json, so Node can't tell that worker/index.js is a module: load it from its source
const worker = await import('data:text/javascript,' + encodeURIComponent(readFileSync(new URL('worker/index.js', root), 'utf8')));

// Runs the Worker for one request. assets(req) plays Cloudflare's static files (env.ASSETS): /welcome is the landing
// page, anything else the game.
const serve = async req => new Response(new URL(req.url).pathname === '/welcome' ? 'landing' : 'game');
async function visit(url, assets = serve) {
  const asked = [];
  const env = { ASSETS: { fetch: async req => { asked.push(req); return assets(req); } } };
  const res = await worker.default.fetch(new Request(url, { headers: { 'If-None-Match': '"v1"' } }), env);
  return { res, asked, body: await res.text() };
}

test('pmlm.uk and www.pmlm.uk show the landing page at /', async () => {
  for (const url of ['https://pmlm.uk/', 'https://www.pmlm.uk/', 'https://pmlm.uk/?src=ff1']) {
    const v = await visit(url);
    assert.equal(v.body, 'landing', url);
    assert.equal(v.asked.length, 1);
    assert.equal(v.asked[0].url, new URL('/welcome', url).href, 'asks the static files for /welcome on the same host');
    assert.equal(v.asked[0].headers.get('If-None-Match'), '"v1"', 'keeps the request headers, so caching still works');
  }
  const unchanged = await visit('https://pmlm.uk/', async () => new Response(null, { status: 304 }));
  assert.equal(unchanged.res.status, 304, 'a "not changed" answer is passed on');
});

test('every other host, and ?stay=1, gets the game', async () => {
  for (const url of ['https://play.pmlm.uk/', 'https://play-more-learn-more.acct.workers.dev/', 'https://pr-12-play-more-learn-more.acct.workers.dev/',
    'http://localhost:8788/', 'http://127.0.0.1:8788/', 'https://pmlm.uk.evil.example/', 'https://notpmlm.uk/', 'https://pmlm.uk/?stay=1',
    'https://www.pmlm.uk/?invite=AB&stay=1']) {
    const v = await visit(url);
    assert.equal(v.body, 'game', url);
    assert.equal(v.asked.length, 1, url);
    assert.equal(v.asked[0].url, url, url + ' is passed to the static files as it came');
  }
});

test('if the landing page is missing or anything fails, the game is served', async () => {
  const missing = await visit('https://pmlm.uk/', async req => (new URL(req.url).pathname === '/welcome' ? new Response('Page not found', { status: 404 }) : new Response('game')));
  assert.equal(missing.body, 'game');
  let calls = 0;
  const broken = await visit('https://pmlm.uk/', async () => { if (calls++ === 0) throw new Error('ASSETS hiccup'); return new Response('game'); });
  assert.equal(broken.body, 'game');
});

test('the Worker runs only for "/" and keeps the dashboard\'s custom domains', () => {
  const c = JSON.parse(readFileSync(new URL('tools/deploy/wrangler.json', root), 'utf8'));
  assert.deepEqual(c.assets.run_worker_first, ['/'], 'every other file comes straight from the static files, with _headers');
  assert.equal(c.assets.binding, 'ASSETS');
  assert.equal(c.assets.not_found_handling, '404-page', 'a mistyped address gets 404.html, not the game');
  assert.equal(c.assets.directory, '../../_site', 'what stage.sh publishes');
  assert.equal(new URL(c.main, new URL('tools/deploy/', root)).href, new URL('worker/index.js', root).href);
  assert.equal(c.routes, undefined, 'no routes: wrangler deploy leaves pmlm.uk and play.pmlm.uk as set in the dashboard');
});

test('_headers lets any address read move.json and never caches it', () => {
  const rules = {};
  let path = null;
  for (const line of readFileSync(new URL('_headers', root), 'utf8').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) { rules[path = line.trim()] = {}; continue; }
    const i = line.indexOf(':');
    rules[path][line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  assert.ok(rules['/move.json'], '_headers has a /move.json rule');
  assert.equal(rules['/move.json']['access-control-allow-origin'], '*');
  assert.match(rules['/move.json']['cache-control'], /\bno-store\b/);
});

test('stage.sh publishes only the served files, and nothing at all when one is missing', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'pmlm-stage-'));
  try {
    const repo = join(tmp, 'repo');
    const put = (p, text = 'x') => { mkdirSync(dirname(join(repo, p)), { recursive: true }); writeFileSync(join(repo, p), text); };
    const served = ['index.html', 'welcome.html', 'stats.html', '404.html', 'manifest.webmanifest', 'sw.js', 'move.json', '_headers',
      'icons/icon-192.png', 'landing/hero.jpg'];
    for (const f of served) put(f, f === 'index.html' ? "const BUILD = 'test';" : 'x');
    for (const f of ['worker/index.js', 'src/engine.js', 'tests/package.json', 'tools/deploy/stage.sh', 'build.py', 'firestore.rules',
      'CLAUDE.md', 'build/artifact.html', '.github/workflows/deploy.yml', 'landing/.DS_Store']) put(f);

    const stage = out => spawnSync('bash', [fileURLToPath(new URL('tools/deploy/stage.sh', root)), out],
      { env: { ...process.env, STAGE_ROOT: repo }, encoding: 'utf8' });
    const files = dir => readdirSync(dir, { recursive: true }).filter(f => statSync(join(dir, f)).isFile()).map(f => f.split('\\').join('/')).sort();

    const ok = stage(join(tmp, 'site'));
    assert.equal(ok.status, 0, ok.stderr);
    assert.deepEqual(files(join(tmp, 'site')), [...served].sort(), 'the served files and nothing else (no worker/, src/, tests/ …)');
    assert.equal(stage(join(tmp, 'site')).status, 1, 'refuses a folder that already has files in it');

    rmSync(join(repo, 'welcome.html'));
    const noLanding = stage(join(tmp, 'site2'));
    assert.equal(noLanding.status, 1);
    assert.match(noLanding.stderr, /welcome\.html/);
    assert.ok(!existsSync(join(tmp, 'site2')), 'nothing staged');

    put('welcome.html');
    rmSync(join(repo, 'landing/hero.jpg'));
    const noPictures = stage(join(tmp, 'site3'));
    assert.equal(noPictures.status, 1);
    assert.match(noPictures.stderr, /landing/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
