const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');

const BUILD = __dirname;
const ROOT = path.resolve(BUILD, '..');
const MD_PATH = path.join(ROOT, 'Guia-Conflictos-Git.md');
const OUT_PDF = path.join(ROOT, 'Guia-Conflictos-Git.pdf');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function dataUri(file) {
  const p = path.join(BUILD, file);
  const b = fs.readFileSync(p);
  return `data:image/png;base64,${b.toString('base64')}`;
}

const cover = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Conflictos de código</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 210mm; height: 297mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #0b1220; color: #f8fafc; overflow: hidden; }
  .cover { position: relative; width: 210mm; height: 297mm; overflow: hidden; }
  .glow { position: absolute; border-radius: 50%; filter: blur(2px); }
  .g1 { width: 520px; height: 520px; right: -180px; top: -170px; background: radial-gradient(circle, rgba(45,212,191,.22), rgba(45,212,191,0) 68%); }
  .g2 { width: 460px; height: 460px; left: -210px; bottom: -190px; background: radial-gradient(circle, rgba(251,113,133,.16), rgba(251,113,133,0) 70%); }
  .grid { position: absolute; inset: 0; opacity: .18; background-image: linear-gradient(rgba(148,163,184,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.14) 1px, transparent 1px); background-size: 42px 42px; }
  .bar { position: absolute; left: 0; top: 0; width: 100%; height: 7px; background: linear-gradient(90deg, #2dd4bf, #60a5fa 48%, #fb7185); }
  .content { position: absolute; left: 22mm; top: 31mm; width: 112mm; z-index: 3; }
  .eyebrow { font-size: 9.5pt; letter-spacing: .22em; font-weight: 700; color: #2dd4bf; text-transform: uppercase; margin-bottom: 12mm; }
  h1 { font-size: 45pt; line-height: .98; letter-spacing: -.025em; margin: 0 0 8mm; color: #ffffff; font-weight: 800; }
  h1 em { font-style: normal; color: #2dd4bf; }
  .subtitle { font-size: 15.5pt; line-height: 1.28; color: #cbd5e1; margin: 0 0 8mm; font-weight: 400; }
  .subtitle strong { color: #fbbf24; font-weight: 600; }
  .desc { font-size: 10.5pt; line-height: 1.6; color: #94a3b8; margin: 0 0 11mm; max-width: 100mm; }
  .meta { display: flex; gap: 5mm; flex-wrap: wrap; margin-bottom: 19mm; }
  .meta span { font-size: 8.8pt; color: #e2e8f0; border: 1px solid rgba(45,212,191,.45); background: rgba(15,118,110,.20); border-radius: 20px; padding: 4px 9px; }
  .foot { position: absolute; left: 22mm; bottom: 20mm; font-size: 8.8pt; color: #64748b; letter-spacing: .04em; z-index: 3; }
  .art { position: absolute; right: 8mm; top: 34mm; width: 78mm; height: 225mm; z-index: 2; }
  .caption { position: absolute; right: 13mm; bottom: 26mm; font-size: 8.5pt; color: #64748b; z-index: 3; text-align: right; }
  .badge { position: absolute; right: 18mm; top: 22mm; z-index: 4; font-size: 8.5pt; letter-spacing: .14em; text-transform: uppercase; color: #fecdd3; border: 1px solid rgba(251,113,133,.55); background: rgba(251,113,133,.12); border-radius: 20px; padding: 5px 10px; }
</style></head>
<body>
  <div class="cover">
    <div class="glow g1"></div><div class="glow g2"></div><div class="grid"></div><div class="bar"></div>
    <div class="badge">merge conflict</div>
    <div class="content">
      <div class="eyebrow">Guía práctica · Git</div>
      <h1>Conflictos<br>de <em>código</em></h1>
      <p class="subtitle">Detección, diagnóstico y resolución de <strong>merge conflicts</strong></p>
      <p class="desc">El modelo mental, los comandos esenciales, el procedimiento completo y 10 ejercicios reproducibles para dejar de temerle al conflicto.</p>
      <div class="meta"><span>10 ejercicios</span><span>Mapas</span><span>Chuleta</span><span>Checklist</span></div>
    </div>
    <div class="art">
      <svg viewBox="0 0 300 620" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mainline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#0f766e"/>
          </linearGradient>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
        </defs>
        <path d="M70 40 L70 580" stroke="url(#mainline)" stroke-width="5" stroke-linecap="round"/>
        <path d="M70 240 C 190 240, 190 150, 250 150 L250 340 C 250 430, 160 430, 70 470" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 0"/>
        <circle cx="70" cy="40" r="10" fill="#0b1220" stroke="#2dd4bf" stroke-width="4"/>
        <circle cx="70" cy="150" r="9" fill="#0b1220" stroke="#2dd4bf" stroke-width="4"/>
        <circle cx="70" cy="330" r="9" fill="#0b1220" stroke="#2dd4bf" stroke-width="4"/>
        <circle cx="250" cy="150" r="9" fill="#0b1220" stroke="#fbbf24" stroke-width="4"/>
        <circle cx="250" cy="260" r="9" fill="#0b1220" stroke="#fbbf24" stroke-width="4"/>
        <circle cx="250" cy="340" r="9" fill="#0b1220" stroke="#fbbf24" stroke-width="4"/>
        <circle cx="70" cy="470" r="13" fill="#fb7185" opacity=".18" filter="url(#soft)"/>
        <path d="M70 449 L91 470 L70 491 L49 470 Z" fill="#0b1220" stroke="#fb7185" stroke-width="4"/>
        <path d="M64 470 L76 470 M70 464 L70 476" stroke="#fb7185" stroke-width="3" stroke-linecap="round"/>
        <circle cx="70" cy="580" r="8" fill="#0b1220" stroke="#2dd4bf" stroke-width="4"/>
        <text x="18" y="44" fill="#5eead4" font-family="Segoe UI, Arial" font-size="13" font-weight="700">main</text>
        <text x="250" y="132" fill="#fcd34d" font-family="Segoe UI, Arial" font-size="12" font-weight="700" text-anchor="middle">feature</text>
        <text x="100" y="522" fill="#fda4af" font-family="Segoe UI, Arial" font-size="12" font-weight="700">conflicto</text>
        <text x="100" y="540" fill="#94a3b8" font-family="Segoe UI, Arial" font-size="10">dos intenciones</text>
        <text x="100" y="556" fill="#94a3b8" font-family="Segoe UI, Arial" font-size="10">una decisión</text>
      </svg>
    </div>
    <div class="foot">Octubre 2026 · Git 2.40+ · Documento de estudio</div>
    <div class="caption">Base · ours · theirs<br>una guía para decidir</div>
  </div>
</body></html>`;

let md = fs.readFileSync(MD_PATH, 'utf8').replace(/\r\n/g, '\n');

// Quitamos el título y subtítulo porque ya están en la portada.
md = md.replace(/^# Detección y resolución de conflictos de código \(\*merge conflicts\*\)\n\n\*\*Guía teórico-práctica:[^\n]*\*\*\n\n/, '');

// Reemplazamos los bloques Mermaid por las figuras renderizadas.
let diagram = 0;
md = md.replace(/```mermaid\n([\s\S]*?)```/g, () => {
  const isMind = diagram === 0;
  const src = isMind ? 'mapa-mental.png' : 'mapa-conceptual-compact.png';
  const alt = isMind ? 'Mapa mental de conflictos de código' : 'Mapa conceptual de la resolución de conflictos';
  const cap = isMind
    ? 'Mapa mental. Los ocho bloques que hay que dominar: definición, detección, diagnóstico, resolución, cierre, verificación, prevención y automatización.'
    : 'Mapa conceptual. Del solapamiento de cambios al cierre de la operación, con las ramas de auto-merge, abortar y rerere.';
  diagram++;
  return `<figure class="diagram"><img src="${dataUri(src)}" alt="${alt}"><figcaption>${cap}</figcaption></figure>`;
});

// La nota sobre visores Mermaid ya no aplica al PDF.
md = md.replace(/^> Los bloques `mermaid`.*$/m, '> Los dos mapas se incluyen como figuras vectoriales para que puedas ampliarlos sin perder nitidez.');

const bodyHtml = marked.parse(md, { gfm: true, breaks: false });

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Conflictos de código · Guía práctica</title>
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html { width: 100%; max-width: 100%; }
  body { width: 180mm; max-width: 180mm; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 10.2pt; line-height: 1.55; overflow-wrap: break-word; }
  p, li, blockquote, h1, h2, h3, h4 { overflow-wrap: break-word; }
  .doc-head { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 2px solid #ccfbf1; padding-bottom: 7pt; margin-bottom: 14pt; }
  .doc-head .k { font-size: 8pt; letter-spacing: .2em; font-weight: 700; color: #0f766e; text-transform: uppercase; }
  .doc-head .t { font-size: 10.5pt; color: #0f172a; font-weight: 600; min-width: 0; overflow-wrap: anywhere; text-align: right; }
  h1, h2, h3, h4 { color: #0f172a; font-weight: 700; line-height: 1.2; page-break-after: avoid; }
  h1 { font-size: 21pt; margin: 0 0 9pt; letter-spacing: -.01em; }
  h2 { font-size: 15.5pt; margin: 21pt 0 8pt; padding-bottom: 4pt; border-bottom: 2px solid #ccfbf1; }
  h3 { font-size: 11.8pt; margin: 14pt 0 5pt; color: #0f766e; }
  h4 { font-size: 10.5pt; margin: 11pt 0 4pt; color: #115e59; }
  p { margin: 0 0 7pt; text-align: justify; }
  ul, ol { margin: 0 0 8pt; padding-left: 18pt; }
  li { margin-bottom: 3pt; }
  li > p { margin-bottom: 2pt; }
  code { font-family: Consolas, 'Courier New', monospace; font-size: 8.7pt; background: #f1f5f9; padding: 1px 3px; border-radius: 2px; color: #0f172a; overflow-wrap: anywhere; }
  pre { background: #0b1220; color: #e2e8f0; padding: 9pt 11pt; border-radius: 6pt; overflow: hidden; margin: 8pt 0 10pt; page-break-inside: auto; max-width: 100%; }
  pre code { background: transparent; color: inherit; padding: 0; font-size: 8.4pt; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; }
  pre code.language-text { font-size: 7.35pt; line-height: 1.38; white-space: pre-wrap; }
  blockquote { margin: 9pt 0; padding: 7pt 10pt; background: #f0fdfa; border-left: 4pt solid #14b8a6; color: #134e4a; page-break-inside: avoid; }
  blockquote p { margin: 0 0 3pt; }
  blockquote p:last-child { margin-bottom: 0; }
  table { width: 100%; max-width: 100%; table-layout: fixed; border-collapse: collapse; margin: 8pt 0 10pt; font-size: 8.75pt; }
  th { background: #0f766e; color: #fff; text-align: left; padding: 5pt 6pt; font-weight: 600; overflow-wrap: anywhere; }
  td { border-bottom: .5pt solid #e2e8f0; padding: 4.5pt 6pt; vertical-align: top; overflow-wrap: anywhere; word-break: break-word; }
  tr:nth-child(even) td { background: #f8fafc; }
  tr { page-break-inside: avoid; }
  figure { margin: 12pt 0 14pt; text-align: center; page-break-inside: avoid; }
  figure img { max-width: 100%; height: auto; border: .5pt solid #e2e8f0; border-radius: 4pt; padding: 5pt; background: #fff; }
  figcaption { font-size: 8.4pt; color: #64748b; margin-top: 5pt; font-style: italic; line-height: 1.4; }
  hr { border: 0; border-top: .5pt solid #e2e8f0; margin: 14pt 0; }
  a { color: #0f766e; text-decoration: none; }
  .doc-head + h2 { margin-top: 0; }
  h2 + p, h2 + ul, h2 + ol, h3 + p { margin-top: 0; }
  strong { color: #0f172a; }
  @media print { a { color: #0f766e; } }
</style></head>
<body>
  <div class="doc-head"><span class="k">Guía completa</span><span class="t">Conflictos de código en Git</span></div>
  ${bodyHtml}
</body></html>`;

(async () => {
  fs.writeFileSync(path.join(BUILD, 'guia-body.html'), html, 'utf8');
  fs.writeFileSync(path.join(BUILD, 'guia-cover.html'), cover, 'utf8');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.emulateMediaType('print');

  await page.setContent(cover, { waitUntil: 'load', timeout: 60000 });
  await page.pdf({ path: path.join(BUILD, 'cover.pdf'), format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

  await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })));
  });
  await page.pdf({
    path: path.join(BUILD, 'body.pdf'),
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%; padding:0 15mm; font-family:'Segoe UI',Arial,sans-serif; font-size:7.5px; color:#64748b; display:flex; justify-content:space-between;">
      <span>Conflictos de código · Git</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: '17mm', right: 0, bottom: '17mm', left: 0 }
  });

  await browser.close();

  const out = await PDFDocument.create();
  const coverDoc = await PDFDocument.load(fs.readFileSync(path.join(BUILD, 'cover.pdf')));
  const bodyDoc = await PDFDocument.load(fs.readFileSync(path.join(BUILD, 'body.pdf')));
  for (const p of await out.copyPages(coverDoc, coverDoc.getPageIndices())) out.addPage(p);
  for (const p of await out.copyPages(bodyDoc, bodyDoc.getPageIndices())) out.addPage(p);
  out.setTitle('Conflictos de código en Git · Guía práctica');
  out.setAuthor('Guía de estudio');
  out.setSubject('Detección, diagnóstico y resolución de merge conflicts');
  out.setKeywords(['Git', 'merge conflict', 'conflictos', 'rebase', 'cherry-pick']);
  out.setCreator('OpenCode');
  fs.writeFileSync(OUT_PDF, await out.save());

  console.log(`PDF generado: ${OUT_PDF}`);
  console.log(`Páginas: ${out.getPageCount()}`);
  console.log(`Tamaño: ${(fs.statSync(OUT_PDF).size / 1024).toFixed(1)} KB`);
})();
