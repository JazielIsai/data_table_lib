import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173/examples/',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    headless: true
  },
  webServer: {
    command: 'npm run examples -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173/examples/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
