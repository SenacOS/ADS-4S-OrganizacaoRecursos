import { defineConfig } from '@playwright/test';

// PLAYWRIGHT_CHANNEL=chrome usa o Chrome instalado; sem valor, usa Chromium do Playwright.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.js',
  timeout: 15000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: 'test-results/frontend',
  reporter: [['list'], ['json', { outputFile: 'test-results/frontend/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1366, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'node tests/browser/static-server.mjs',
    url: 'http://127.0.0.1:4173/login.html',
    reuseExistingServer: false,
    timeout: 15000,
  },
});
