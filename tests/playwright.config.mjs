// Browser tests (run through `npm run e2e`, which starts the Firebase emulators first). One worker: the tests
// share the emulators. Phones and tablets: WebKit is Safari's engine (iPhone, iPad), Chromium is Android's.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.spec.mjs',
  globalSetup: './e2e/setup.mjs',
  timeout: 180000,
  expect: { timeout: 15000 },
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://127.0.0.1:8766', trace: 'retain-on-failure', serviceWorkers: 'allow' },
  webServer: { command: 'python3 -m http.server 8766 --bind 127.0.0.1', cwd: '..', url: 'http://127.0.0.1:8766/index.html', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone', use: { ...devices['iPhone 13'] }, testMatch: /(selftest|layout|existing)\.spec\.mjs/ },
    { name: 'android', use: { ...devices['Pixel 7'] }, testMatch: /(layout)\.spec\.mjs/ },
    { name: 'ipad', use: { ...devices['iPad (gen 7)'] }, testMatch: /(selftest|layout)\.spec\.mjs/ },
  ],
});
