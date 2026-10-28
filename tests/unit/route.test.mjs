// Cloudflare Pages: which page "/" serves on which host (functions/index.js), move.json's headers (_headers), and
// what tools/deploy/stage.sh publishes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = new URL('../../', import.meta.url);
// The repo root has no package.json, so Node can't tell that functions/index.js is a module: load it from its source
const { onRequest } = await import('data:text/javascript,' + encodeURIComponent(readFileSync(new URL('functions/index.js', root), 'utf8')));

const GAME = new Response('game');
// Runs the function for one request. assets(req) plays Cloudflare's static files (env.ASSETS).
async function visit(url, assets = async () => new Response('landing')) {
  const asked = [];
  let nexts = 0;
  const ctx = {
    request: new Request(url, { headers: { 'If-None-Match': '"v1"' } }),
    env: { ASSETS: { fetch: async req => { asked.push(req); return assets(req); } } },
    next: async () => { nexts++; return GAME; },
  };
  const res = await onRequest(ctx);
  return { res, asked, nexts, body: res === GAME ? 'game' : await res.text() };
}

test('pmlm.uk and www.pmlm.uk show the landing page at /', async () => {
  for (const url of ['https://pmlm.uk/', 'https://www.pmlm.uk/', 'https://pmlm.uk/?src=ff1']) {
    const v = await visit(url);
    assert.equal(v.body, 'landing', url);
    assert.equal(v.nexts, 0);
    assert.equal(v.asked.length, 1);
    assert.equal(v.asked[0].url, new URL('/welcome', url).href, 'asks Pages for /welcome on the same host');
    assert.equal(v.asked[0].headers.get('If-None-Match'), '"v1"', 'keeps the request headers, so caching still works');
  }
  const unchanged = await visit('https://pmlm.uk/', async () => new Response(null, { status: 304 }));
  assert.equal(unchanged.res.status, 304, 'a "not changed" answer is passed on');
  assert.equal(unchanged.nexts, 0);
});

test('every other host, and ?stay=1, gets the game', async () => {
  for (const url of ['https://play.pmlm.uk/', 'https://xyz.pages.dev/', 'https://pr-12.pmlm-uk.pages.dev/', 'http://localhost:8788/',
    'http://127.0.0.1:8788/', 'https://pmlm.uk.evil.example/', 'https://notpmlm.uk/', 'https://pmlm.uk/?stay=1', 'https://www.pmlm.uk/?invite=AB&stay=1']) {
    const v = await visit(url);
    assert.equal(v.res, GAME, url);
    assert.equal(v.asked.length, 0, url + ' never asks for the landing page');
  }
});

test('if the landing page is missing or anything fails, the game is served', async () => {
  const missing = await visit('https://pmlm.uk/', async () => new Response('Page not found', { status: 404 }));
  assert.equal(missing.res, GAME);
  assert.equal(missing.nexts, 1);
  const broken = await visit('https://pmlm.uk/', async () => { throw new Error('ASSETS is down'); });
  assert.equal(broken.res, GAME);
  assert.equal(broken.nexts, 1);
  const noAssets = await onRequest({ request: new Request('https://pmlm.uk/'), env: {}, next: async () => GAME });
  assert.equal(noAssets, GAME, 'no ASSETS binding at all');
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
    for (const f of ['functions/index.js', 'src/engine.js', 'tests/package.json', 'tools/deploy/stage.sh', 'build.py', 'firestore.rules',
      'CLAUDE.md', 'build/artifact.html', '.github/workflows/deploy.yml', 'landing/.DS_Store']) put(f);

    const stage = out => spawnSync('bash', [fileURLToPath(new URL('tools/deploy/stage.sh', root)), out],
      { env: { ...process.env, STAGE_ROOT: repo }, encoding: 'utf8' });
    const files = dir => readdirSync(dir, { recursive: true }).filter(f => statSync(join(dir, f)).isFile()).map(f => f.split('\\').join('/')).sort();

    const ok = stage(join(tmp, 'site'));
    assert.equal(ok.status, 0, ok.stderr);
    assert.deepEqual(files(join(tmp, 'site')), [...served].sort(), 'the served files and nothing else (no functions/, src/, tests/ …)');
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
