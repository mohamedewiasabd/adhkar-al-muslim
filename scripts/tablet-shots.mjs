import { chromium } from 'playwright-core';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

const DIST = resolve('dist');
const OUT = resolve('release/play-assets/screenshots');
const PORT = 8090;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/') path = '/index.html';
    const file = join(DIST, path);
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

await new Promise((r) => server.listen(PORT, r));
console.log(`→ serving ${DIST} at http://127.0.0.1:${PORT}`);

const candidates = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/snap/bin/chromium', '/usr/bin/chromium-browser'];
const fs = await import('node:fs');
const exe = candidates.find((c) => fs.existsSync(c));

const browser = await chromium.launch({
  executablePath: exe,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});

/** خطة اللقطات: [اسم, تابع, تمرير عمودي اختياري] */
const shots = [
  ['01-home-adhkar-morning', 'adhkar', 0],
  ['02-home-adhkar-cards', 'adhkar', 550],
  ['03-quran', 'quran', 0],
  ['04-tasbeeh', 'tasbeeh', 0],
  ['05-wird-daily', 'wird', 0],
  ['06-duas', 'duas', 0],
  ['07-stats', 'stats', 0],
];

const sizes = [
  ['tablet-7inch', 800, 1280],
  ['tablet-10inch', 1600, 2560],
];

for (const [dir, width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  for (const [name, tab, scrollY] of shots) {
    await page.evaluate(() => window.scrollTo(0, 0));
    if (tab !== 'adhkar') {
      await page.click(`#tab-${tab}`);
      await page.waitForTimeout(700);
    }
    if (scrollY > 0) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
      await page.waitForTimeout(500);
    }
    const outDir = join(OUT, dir);
    await mkdir(outDir, { recursive: true });
    const outPath = join(outDir, `${name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✓ ${dir}/${name}.png`);
  }

  await page.close();
}

await browser.close();
server.close();
console.log('تم انتهاء التوليد.');