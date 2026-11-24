import { createServer } from 'vite';
import { chromium } from '@playwright/test';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL
    ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  const base = server.resolvedUrls.local[0];
  const results = [];
  for (const rows of [1000, 5000]) {
    for (const paginated of [false, true]) {
      const page = await browser.newPage();
      await page.goto(`${base}benchmarks/?rows=${rows}&paginated=${paginated}`);
      await page.waitForFunction(() => window.__DT_BENCHMARK !== undefined);
      results.push(await page.evaluate(() => window.__DT_BENCHMARK));
      await page.close();
    }
  }
  console.table(results);
} finally {
  await browser?.close();
  await server.close();
}
