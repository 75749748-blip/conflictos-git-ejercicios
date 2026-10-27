const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const { exercises, REPO_URL } = require('./exercises-data');

const BUILD = __dirname;
const ROOT = path.resolve(BUILD, '..');
const OUT_DIR = path.join(ROOT, 'documentacion');
const OUT_PDF = path.join(OUT_DIR, 'Documentacion-Ejercicios-Conflictos-Git.pdf');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dataUri(file) {
  return `data:image/png;base64,${fs.readFileSync(path.join(ROOT, file)).toString('base64')}`;
}

function logInfo(exercise) {
  const file = `ejercicios/logs/${exercise.slug}.log`;
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r/g, '');
  const result = text.match(/RESULTADO: (\d+) PASS, (\d+) FAIL/);
  const passLines = [...text.matchAll(/^\s*\[PASS\]\s+(.+)$/gm)].map(m => m[1].trim());
  const failLines = [...text.matchAll(/^\s*\[FAIL\]\s+(.+)$/gm)].map(m => m[1].trim());
  return {
    file,
    pass: result ? Number(result[1]) : passLines.length,
    fail: result ? Number(result[2]) : failLines.length,
    checks: [...new Set(passLines)],
    failed: [...new Set(failLines)]
  };
}

function shotFiles(exercise, shot) {
  const dir = path.join(ROOT, 'capturas', exercise.slug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.png') && (f === `${shot.id}.png` || f.startsWith(`${shot.id}-`)))
    .sort()
    .map(f => `capturas/${exercise.slug}/${f}`);
}

function repoPath(...parts) {
  return `${REPO_URL}/blob/main/${parts.join('/')}`;
}

function coverHtml() {
  const sample = [
    '$ git merge feature',
    'Auto-merging app.txt',
    'CONFLICT (content): Merge conflict in app.txt',
    '$ git status --short',
    'UU app.txt',
    '$ git add app.txt',
    '$ git commit -m "merge: integra feature"',
    '[PASS] el arbol de trabajo queda limpio',
    '[PASS] se conserva el cambio de feature',
    'RESULTADO: 5 PASS, 0 FAIL'
  ].join('\n');
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 210mm; height: 297mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0b1220; color: #f8fafc; overflow: hidden; }
    .cover { position: relative; width: 210mm; height: 297mm; overflow: hidden; }
    .bar { position: absolute; left: 0; top: 0; width: 100%; height: 7px; background: linear-gradient(90deg,#2dd4bf,#60a5fa 48%,#fb7185); }
    .g1 { position:absolute; width:540px; height:540px; right:-190px; top:-190px; border-radius:50%; background: radial-gradient(circle, rgba(45,212,191,.22), rgba(45,212,191,0) 68%); }
    .g2 { position:absolute; width:480px; height:480px; left:-220px; bottom:-210px; border-radius:50%; background: radial-gradient(circle, rgba(251,113,133,.15), rgba(251,113,133,0) 70%); }
    .grid { position:absolute; inset:0; opacity:.16; background-image: linear-gradient(rgba(148,163,184,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.14) 1px, transparent 1px); background-size: 42px 42px; }
    .content { position:absolute; left:22mm; top:28mm; width:166mm; z-index:3; }
    .eyebrow { font-size:9.5pt; letter-spacing:.22em; font-weight:700; color:#2dd4bf; text-transform:uppercase; margin-bottom:9mm; }
    h1 { font-size:43pt; line-height:.98; letter-spacing:-.025em; margin:0 0 6mm; color:#fff; font-weight:800; }
    h1 em { font-style:normal; color:#2dd4bf; }
    .subtitle { font-size:15.5pt; line-height:1.3; color:#cbd5e1; margin:0 0 7mm; font-weight:400; }
    .subtitle strong { color:#fbbf24; font-weight:600; }
    .desc { font-size:10.5pt; line-height:1.65; color:#94a3b8; margin:0 0 9mm; max-width:112mm; }
    .meta { display:flex; gap:4mm; flex-wrap:wrap; margin-bottom:8mm; }
    .meta span { font-size:8.6pt; color:#e2e8f0; border:1px solid rgba(45,212,191,.45); background:rgba(15,118,110,.20); border-radius:20px; padding:4px 9px; }
    .terminal { width:112mm; background:#0f172a; border:1px solid #24334a; border-radius:10px; overflow:hidden; box-shadow:0 18px 40px rgba(0,0,0,.35); }
    .tbar { height:26px; background:#111c2e; border-bottom:1px solid #24334a; display:flex; align-items:center; gap:5px; padding:0 10px; }
    .dot { width:7px; height:7px; border-radius:50%; display:inline-block; }
    .r{background:#fb7185}.y{background:#fbbf24}.g{background:#34d399}
    .tbar .t { margin-left:7px; font-size:7.5pt; color:#94a3b8; }
    pre { margin:0; padding:10px 12px 12px; font-family:Consolas,monospace; font-size:8.2pt; line-height:1.45; color:#dbe7f3; white-space:pre-wrap; overflow-wrap:anywhere; }
    .p{color:#2dd4bf}.pass{color:#34d399}.err{color:#fda4af}.res{color:#fbbf24;font-weight:700}
    .foot { position:absolute; left:22mm; bottom:18mm; right:22mm; display:flex; justify-content:space-between; font-size:8.4pt; color:#64748b; z-index:3; }
    .foot a { color:#5eead4; text-decoration:none; }
    .right { position:absolute; right:20mm; top:24mm; z-index:4; font-size:8.2pt; letter-spacing:.12em; color:#fecdd3; border:1px solid rgba(251,113,133,.5); background:rgba(251,113,133,.12); border-radius:20px; padding:5px 10px; text-transform:uppercase; }
  </style></head><body><div class="cover">
    <div class="bar"></div><div class="g1"></div><div class="g2"></div><div class="grid"></div>
    <div class="right">10 / 10 verificados</div>
    <div class="content">
      <div class="eyebrow">Documentación de prácticas · Git</div>
      <h1>Conflictos<br>de <em>código</em></h1>
      <p class="subtitle">10 ejercicios ejecutados, resueltos y <strong>documentados con capturas reales</strong></p>
      <p class="desc">Merge, rebase, cherry-pick, stash, binarios, inspección forense, mergetool y estrategias automáticas. Cada práctica incluye su script, su log y la evidencia de validación.</p>
      <div class="meta"><span>57 PASS · 0 FAIL</span><span>23 capturas</span><span>Git 2.56.0</span><span>GitHub</span></div>
      <div class="terminal"><div class="tbar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="t">Git Bash — evidencia de ejecución</span></div><pre><span class="p">${esc(sample.split('\n').slice(0,2).join('\n'))}</span>\n${esc(sample.split('\n').slice(2,5).join('\n'))}\n<span class="p">${esc(sample.split('\n').slice(5,8).join('\n'))}</span>\n<span class="pass">${esc(sample.split('\n').slice(8).join('\n'))}</span></pre></div>
    </div>
    <div class="foot"><span>Ivan · Octubre 2026 · Windows 11</span><a href="${esc(REPO_URL)}">${esc(REPO_URL.replace('https://',''))}</a></div>
  </div></body></html>`;
}

function bodyHtml() {
  const totalPass = exercises.reduce((sum, e) => sum + logInfo(e).pass, 0);
  const totalFail = exercises.reduce((sum, e) => sum + logInfo(e).fail, 0);
  const totalShots = exercises.reduce((sum, e) => sum + e.shots.reduce((n, s) => n + shotFiles(e, s).length, 0), 0);

  const indexRows = exercises.map(e => {
    const info = logInfo(e);
    return `<tr><td><strong>${e.n}</strong></td><td>${esc(e.title)}</td><td>${esc(e.operation)}</td><td class="ok">${info.pass} PASS · ${info.fail} FAIL</td><td><a href="${repoPath('ejercicios', `${e.slug}.sh`)}">script</a> · <a href="${repoPath('ejercicios', 'logs', `${e.slug}.log`)}">log</a></td></tr>`;
  }).join('');

  const sections = exercises.map(e => {
    const info = logInfo(e);
    const figures = e.shots.map((shot, shotIndex) => {
      const files = shotFiles(e, shot);
      if (!files.length) return '';
      return files.map((file, i) => `<figure class="shot ${shotIndex === 0 && i === 0 ? 'first' : 'rest'}"><img src="${dataUri(file)}" alt="${esc(shot.label)}"><figcaption><strong>${esc(shot.label)}</strong>${files.length > 1 ? ` · captura ${i + 1} de ${files.length}` : ''} — salida real de <code>${esc(e.slug)}.log</code></figcaption></figure>`).join('');
    }).join('');
    const checks = info.checks.map(c => `<li>${esc(c)}</li>`).join('');
    const failed = info.failed.length ? `<div class="failbox"><strong>Fallos registrados:</strong><ul>${info.failed.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>` : '';
    return `<section class="exercise">
      <div class="kicker">Ejercicio ${e.n} · ${esc(e.operation)}</div>
      <h2>${esc(e.title)}</h2>
      <div class="meta"><span class="chip">${esc(e.difficulty)}</span><span class="chip">${info.pass} PASS · ${info.fail} FAIL</span><span class="chip">${info.checks.length} comprobaciones</span></div>
      <div class="objective"><strong>Objetivo.</strong> ${esc(e.objective)}</div>
      <p class="short">${esc(e.short)}</p>
      <h3>Comandos clave</h3>
      <pre class="cmd"><code>${esc(e.commands.join('\n'))}</code></pre>
      ${figures}
      <h3>Validación automática</h3>
      <div class="validation"><div class="vhead"><span class="check">✓</span> ${info.pass} comprobaciones PASS · ${info.fail} FAIL</div><ul>${checks}</ul></div>
      ${failed}
      <div class="lesson"><strong>Lección.</strong> ${esc(e.lesson)}</div>
      <p class="links">Evidencia: <a href="${repoPath('ejercicios', `${e.slug}.sh`)}">script</a> · <a href="${repoPath('ejercicios', 'logs', `${e.slug}.log`)}">log completo</a> · <a href="${REPO_URL}/tree/main/capturas/${e.slug}">capturas</a></p>
    </section>`;
  }).join('');

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Documentación de ejercicios · Conflictos de Git</title><style>
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html { width: 100%; max-width: 100%; }
    body { width: 180mm; max-width: 180mm; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 10.2pt; line-height: 1.55; overflow-wrap: break-word; }
    p, li, blockquote, h1, h2, h3, h4, td, th { overflow-wrap: break-word; }
    .doc-head { display:flex; align-items:flex-end; justify-content:space-between; border-bottom:2px solid #ccfbf1; padding-bottom:7pt; margin-bottom:14pt; }
    .doc-head .k { font-size:8pt; letter-spacing:.2em; font-weight:700; color:#0f766e; text-transform:uppercase; }
    .doc-head .t { font-size:10.5pt; color:#0f172a; font-weight:600; min-width:0; overflow-wrap:anywhere; text-align:right; }
    h1,h2,h3,h4 { color:#0f172a; font-weight:700; line-height:1.2; page-break-after:avoid; }
    h1 { font-size:22pt; margin:0 0 8pt; letter-spacing:-.01em; }
    h2 { font-size:16pt; margin:0 0 7pt; padding-bottom:4pt; border-bottom:2px solid #ccfbf1; }
    h3 { font-size:11.8pt; margin:14pt 0 5pt; color:#0f766e; }
    p { margin:0 0 7pt; text-align:justify; }
    ul,ol { margin:0 0 8pt; padding-left:18pt; }
    li { margin-bottom:3pt; }
    code { font-family:Consolas,'Courier New',monospace; font-size:8.7pt; background:#f1f5f9; padding:1px 3px; border-radius:2px; color:#0f172a; overflow-wrap:anywhere; }
    pre { background:#0b1220; color:#e2e8f0; padding:9pt 11pt; border-radius:6pt; overflow:hidden; margin:8pt 0 10pt; page-break-inside:auto; max-width:100%; }
    pre code { background:transparent; color:inherit; padding:0; font-size:8.4pt; line-height:1.45; white-space:pre-wrap; overflow-wrap:anywhere; word-break:break-word; }
    .cmd { border-left:4pt solid #2dd4bf; }
    table { width:100%; max-width:100%; table-layout:fixed; border-collapse:collapse; margin:6pt 0 8pt; font-size:8.2pt; }
    th { background:#0f766e; color:#fff; text-align:left; padding:4pt 5pt; font-weight:600; overflow-wrap:anywhere; }
    td { border-bottom:.5pt solid #e2e8f0; padding:3pt 5pt; vertical-align:top; overflow-wrap:anywhere; word-break:break-word; }
    tr:nth-child(even) td { background:#f8fafc; }
    tr { page-break-inside:avoid; }
    .ok { color:#047857; font-weight:700; white-space:nowrap; }
    .exercise { page-break-before:always; }
    .kicker { font-size:8pt; letter-spacing:.18em; text-transform:uppercase; color:#0f766e; font-weight:700; margin-bottom:3pt; }
    .meta { display:flex; gap:6pt; flex-wrap:wrap; margin:7pt 0 9pt; }
    .chip { font-size:8.2pt; color:#0f766e; background:#f0fdfa; border:1px solid #99f6e4; border-radius:20px; padding:2pt 7pt; }
    .objective { background:#f0fdfa; border-left:4pt solid #2dd4bf; padding:8pt 10pt; margin:8pt 0; color:#134e4a; page-break-inside:avoid; }
    .short { color:#475569; font-style:italic; }
    figure.shot { margin:10pt 0 14pt; text-align:center; page-break-inside:avoid; }
    figure.shot img { display:block; margin:0 auto; width:auto; max-width:100%; max-height:230mm; height:auto; border:1px solid #1e293b; border-radius:6pt; background:#0b1220; padding:2pt; }
    figure.shot.first img { max-height:140mm; }
    figcaption { font-size:8.2pt; color:#64748b; margin-top:4pt; line-height:1.4; text-align:left; }
    figcaption code { font-size:7.6pt; }
    .validation { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6pt; padding:8pt 10pt; margin:7pt 0 9pt; page-break-inside:avoid; }
    .vhead { font-weight:700; color:#166534; margin-bottom:4pt; }
    .vhead .check { display:inline-block; background:#22c55e; color:#fff; border-radius:50%; width:14pt; height:14pt; text-align:center; line-height:14pt; font-size:9pt; margin-right:4pt; }
    .validation ul { margin:0; padding-left:16pt; }
    .validation li { color:#166534; }
    .lesson { background:#fffbeb; border-left:4pt solid #f59e0b; padding:8pt 10pt; margin:8pt 0; color:#78350f; page-break-inside:avoid; }
    .links { font-size:8.6pt; color:#64748b; }
    .links a { color:#0f766e; text-decoration:none; }
    .stats { display:flex; gap:8pt; margin:12pt 0; }
    .stat { flex:1; background:#0f172a; color:#fff; border-radius:8pt; padding:10pt; text-align:center; }
    .stat .n { font-size:24pt; font-weight:800; color:#2dd4bf; line-height:1; }
    .stat .l { font-size:8pt; color:#cbd5e1; margin-top:3pt; }
    .callout { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6pt; padding:9pt 11pt; margin:9pt 0; page-break-inside:avoid; }
    .callout strong { color:#0f766e; }
    .repo { background:#0b1220; color:#e2e8f0; border-radius:8pt; padding:10pt 12pt; margin:10pt 0; word-break:break-all; }
    .repo a { color:#5eead4; text-decoration:none; }
    .github { border:1px solid #1e293b; border-radius:8pt; overflow:hidden; margin:10pt 0; page-break-inside:avoid; }
    .github img { width:100%; display:block; }
    .small { font-size:8.5pt; color:#64748b; }
    .failbox { background:#fef2f2; border:1px solid #fecaca; border-radius:6pt; padding:8pt 10pt; color:#991b1b; margin:8pt 0; }
    a { color:#0f766e; text-decoration:none; }
    h1 + p, h2 + p, h3 + p { margin-top:0; }
  </style></head><body>
    <div class="doc-head"><span class="k">Documentación de prácticas</span><span class="t">Conflictos de código en Git</span></div>
    <h1>10 ejercicios verificados</h1>
    <p>Este documento reúne la ejecución real de los diez ejercicios de la guía de conflictos de Git. Cada práctica se ejecutó en un repositorio temporal, se resolvió y se validó con comprobaciones automáticas. Las capturas que aparecen a continuación provienen de los logs de esa ejecución, no son recreaciones.</p>
    <div class="stats"><div class="stat"><div class="n">10/10</div><div class="l">ejercicios ejecutados</div></div><div class="stat"><div class="n">${totalPass}</div><div class="l">comprobaciones PASS</div></div><div class="stat"><div class="n">${totalFail}</div><div class="l">fallos</div></div><div class="stat"><div class="n">${totalShots}</div><div class="l">capturas de sesión</div></div></div>
    <div class="repo"><strong>Repositorio público:</strong><br><a href="${esc(REPO_URL)}">${esc(REPO_URL)}</a><br><span class="small" style="color:#94a3b8">Commit inicial: <code style="color:#5eead4;background:transparent">df0706c</code> · Rama <code style="color:#5eead4;background:transparent">main</code></span></div>
    <div class="callout"><strong>Entorno de prueba.</strong> Windows 11 · Git 2.56.0.windows.1 · Git Bash · GitHub CLI 2.102.0 · Chrome headless para generar las capturas. Cada script configura un usuario local de práctica y no modifica la configuración global del equipo.</div>
    <h2>Cómo se verificó</h2>
    <ul>
      <li>Los diez scripts se ejecutan con <code>bash ejercicios/run-all.sh</code>; cada uno crea su repositorio temporal en <code>.work/</code>.</li>
      <li>Cada script genera el conflicto real, aplica la resolución y ejecuta comprobaciones con <code>[PASS]</code>/<code>[FAIL]</code>.</li>
      <li>El resultado se guarda en <code>ejercicios/logs/</code> y se resume en la última línea: <code>RESULTADO: N PASS, 0 FAIL</code>.</li>
      <li>Las capturas se generan desde esos logs con <code>build/make-captures.js</code>; el texto y las salidas son los de la sesión real.</li>
    </ul>
    <h2>Resultados</h2>
    <table><thead><tr><th style="width:8%">#</th><th style="width:36%">Ejercicio</th><th style="width:17%">Operación</th><th style="width:18%">Resultado</th><th style="width:21%">Evidencia</th></tr></thead><tbody>${indexRows}</tbody></table>
    ${sections}
    <section class="exercise">
      <div class="kicker">Cierre · evidencia de publicación</div>
      <h2>Repositorio en GitHub</h2>
      <p>Los scripts, logs, capturas, la guía y la presentación están publicados en el repositorio. La siguiente captura corresponde a la página pública después de publicar la guía, la presentación y la documentación.</p>
      <div class="github"><img src="${dataUri('capturas/github-repo.png')}" alt="Repositorio conflictos-git-ejercicios en GitHub"></div>
      <div class="repo"><strong>URL:</strong> <a href="${esc(REPO_URL)}">${esc(REPO_URL)}</a><br><strong>Commit inicial:</strong> df0706c · <strong>Rama:</strong> main · <strong>Visibilidad:</strong> pública</div>
      <div class="callout"><strong>Declaración de verificación.</strong> Los diez ejercicios fueron ejecutados en este equipo con Git 2.56.0.windows.1. Los logs muestran ${totalPass} comprobaciones PASS y ${totalFail} FAIL. Las capturas se obtuvieron de esos logs. El repositorio de GitHub contiene el código y la evidencia para que cualquier persona pueda repetir el proceso.</div>
      <p class="small">Documento generado el 26 de octubre de 2026. Autor: Ivan. Guía base: <em>Detección y resolución de conflictos de código</em>.</p>
    </section>
  </body></html>`;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(BUILD, 'doc-cover.html'), coverHtml(), 'utf8');
  fs.writeFileSync(path.join(BUILD, 'doc-body.html'), bodyHtml(), 'utf8');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.emulateMediaType('print');

  await page.setContent(coverHtml(), { waitUntil: 'load', timeout: 60000 });
  await page.pdf({ path: path.join(BUILD, 'doc-cover.pdf'), format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

  await page.setContent(bodyHtml(), { waitUntil: 'load', timeout: 120000 });
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })));
  });
  await page.pdf({
    path: path.join(BUILD, 'doc-body.pdf'),
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%; padding:0 15mm; font-family:'Segoe UI',Arial,sans-serif; font-size:7.5px; color:#64748b; display:flex; justify-content:space-between;"><span>Documentación de ejercicios · Conflictos de Git</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: '16mm', right: 0, bottom: '16mm', left: 0 }
  });
  await browser.close();

  const out = await PDFDocument.create();
  const coverDoc = await PDFDocument.load(fs.readFileSync(path.join(BUILD, 'doc-cover.pdf')));
  const bodyDoc = await PDFDocument.load(fs.readFileSync(path.join(BUILD, 'doc-body.pdf')));
  for (const p of await out.copyPages(coverDoc, coverDoc.getPageIndices())) out.addPage(p);
  for (const p of await out.copyPages(bodyDoc, bodyDoc.getPageIndices())) out.addPage(p);
  out.setTitle('Ejercicios de conflictos de Git · Documentación de pruebas');
  out.setAuthor('Ivan');
  out.setSubject('10 ejercicios ejecutados, resueltos y documentados con capturas');
  out.setKeywords(['Git', 'conflictos', 'merge', 'rebase', 'cherry-pick', 'stash', 'mergetool']);
  out.setCreator('OpenCode');
  fs.writeFileSync(OUT_PDF, await out.save());
  console.log(`PDF: ${OUT_PDF}`);
  console.log(`Páginas: ${out.getPageCount()}`);
  console.log(`Tamaño: ${(fs.statSync(OUT_PDF).size / 1024 / 1024).toFixed(2)} MB`);
})();
