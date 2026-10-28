const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const HTML = 'file:///' + path.join(ROOT, 'mapa-mental', 'mapa-mental.html').replace(/\\/g, '/');
const OUT = path.join(ROOT, 'mapa-mental', 'mapa-mental.png');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1200, deviceScaleFactor: 1 });
  await page.goto(HTML, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.mapReady === true', { timeout: 20000 });
  const data = await page.evaluate(() => document.getElementById('mindmap').toDataURL('image/png'));
  const buf = Buffer.from(data.split(',')[1], 'base64');
  fs.writeFileSync(OUT, buf);
  const meta = await page.evaluate(() => {
    const c = document.getElementById('mindmap');
    return { w: c.width, h: c.height };
  });
  console.log(`Canvas exportado: ${OUT} (${meta.w}x${meta.h})`);

  await page.screenshot({
    path: path.join(ROOT, 'mapa-mental', 'vista-documentada.png'),
    fullPage: true
  });
  await browser.close();
})();
