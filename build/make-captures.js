const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { exercises } = require('./exercises-data');

const BUILD = __dirname;
const ROOT = path.resolve(BUILD, '..');
const LOGS = path.join(ROOT, 'ejercicios', 'logs');
const OUT = path.join(ROOT, 'capturas');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const MAX_LINES = 60;

function parseSections(file) {
  const lines = fs.readFileSync(path.join(LOGS, file), 'utf8').replace(/\r/g, '').split('\n');
  const sections = [];
  let current = { name: 'INICIO', lines: [] };
  for (const line of lines) {
    const match = line.match(/^### (.+) ###$/);
    if (match) {
      sections.push(current);
      current = { name: match[1], lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);

  for (const section of sections) {
    section.blocks = [];
    let block = null;
    for (const line of section.lines) {
      if (line.startsWith('$ ')) {
        if (block) section.blocks.push(block);
        block = { cmd: line.slice(2), out: [] };
      } else if (block) {
        block.out.push(line);
      }
    }
    if (block) section.blocks.push(block);
  }
  return sections;
}

function getSection(sections, name) {
  const found = sections.find(s => s.name === name);
  if (!found) throw new Error(`No se encontro la seccion: ${name}`);
  return found;
}

const EXACT = new Set(['git status', 'git status --short', 'git diff', 'git diff --check', 'git diff --base']);

function matches(cmd, include) {
  if (EXACT.has(include)) return cmd === include;
  return cmd.includes(include);
}

function collectChecks(sections) {
  const checks = [];
  for (const section of sections) {
    for (const line of section.lines) {
      if (/^\s*\[(PASS|FAIL)\]/.test(line) || line.startsWith('RESULTADO:')) {
        checks.push(line.replace(/\s+$/, ''));
      }
    }
  }
  return checks;
}

function selectedBlocks(log, shot) {
  const sections = shot.sections.map(name => getSection(log, name));
  const blocks = [];
  for (const section of sections) {
    for (const block of section.blocks) {
      if (shot.include.some(include => matches(block.cmd, include))) {
        blocks.push(block);
      }
    }
  }
  return { blocks, sections };
}

function blockLines(block) {
  const out = [`$ ${block.cmd}`];
  const lines = [...block.out];
  while (lines.length) {
    const last = lines[lines.length - 1];
    if (last.trim() === '' || /^\s*\[(PASS|FAIL)\]/.test(last) || last.startsWith('RESULTADO:')) {
      lines.pop();
    } else {
      break;
    }
  }
  return out.concat(lines);
}

function chunkBlocks(blocks, maxLines) {
  const chunks = [];
  let current = [];
  let count = 0;
  for (const block of blocks) {
    const n = blockLines(block).length + 1;
    if (current.length && count + n > maxLines) {
      chunks.push(current);
      current = [];
      count = 0;
    }
    current.push(block);
    count += n;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

function esc(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colorize(line) {
  let safe = esc(line);
  if (line.startsWith('$ ')) {
    safe = `<span class="prompt">$</span> <span class="command">${esc(line.slice(2))}</span>`;
  } else if (/^\s*\[PASS\]/.test(line)) {
    safe = safe.replace('[PASS]', '<span class="pass">[PASS]</span>');
  } else if (/^\s*\[FAIL\]/.test(line)) {
    safe = safe.replace('[FAIL]', '<span class="fail">[FAIL]</span>');
  } else if (line.startsWith('RESULTADO:')) {
    safe = `<span class="result">${safe}</span>`;
  } else if (/^\[exit \d+\]/.test(line)) {
    safe = `<span class="exit">${safe}</span>`;
  } else if (/^(<<<<<<<|=======|>>>>>>>|\|\|\|\|\|\|\|)/.test(line)) {
    safe = `<span class="marker">${safe}</span>`;
  } else if (/^(UU|AA|UD|DU|DD|AU|UA)\s/.test(line)) {
    safe = `<span class="status">${safe}</span>`;
  } else if (line.includes('CONFLICT') || line.includes('Automatic merge failed') || line.includes('Cannot merge binary')) {
    safe = `<span class="error">${safe}</span>`;
  } else if (line.startsWith('On branch') || line.startsWith('You have unmerged paths') || line.startsWith('All conflicts fixed')) {
    safe = `<span class="info">${safe}</span>`;
  } else if (/^(\*|\||\\| )/.test(line) && /(\*|\||\\)/.test(line)) {
    safe = `<span class="graph">${safe}</span>`;
  }
  return safe;
}

function htmlFor(title, subtitle, lines, footer) {
  const body = lines.map(colorize).join('\n');
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #0b1220; }
  body { padding: 18px; }
  .window { width: 1200px; background: #0f172a; border: 1px solid #24334a; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,.45); }
  .bar { height: 50px; background: #111c2e; border-bottom: 1px solid #24334a; display: flex; align-items: center; padding: 0 18px; gap: 8px; }
  .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .red { background: #fb7185; } .yellow { background: #fbbf24; } .green { background: #34d399; }
  .bar .title { margin-left: 12px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; color: #cbd5e1; letter-spacing: .01em; }
  .bar .sub { margin-left: auto; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #64748b; }
  .body { padding: 22px 26px 24px; }
  pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-family: Consolas, 'Cascadia Mono', monospace; font-size: 16px; line-height: 1.55; color: #dbe7f3; }
  .prompt { color: #2dd4bf; font-weight: 700; }
  .command { color: #f8fafc; }
  .pass { color: #34d399; font-weight: 700; }
  .fail { color: #fb7185; font-weight: 700; }
  .result { color: #fbbf24; font-weight: 700; }
  .exit { color: #fb7185; }
  .marker { color: #fda4af; font-weight: 700; }
  .status { color: #fbbf24; font-weight: 700; }
  .error { color: #fda4af; }
  .info { color: #93c5fd; }
  .graph { color: #7dd3fc; }
  .foot { display: flex; justify-content: space-between; gap: 20px; padding: 12px 26px 16px; border-top: 1px solid #1e2b40; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #64748b; }
  .foot .badge { color: #5eead4; }
</style></head><body>
  <div class="window">
    <div class="bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span><span class="title">Git Bash — ${esc(title)}</span><span class="sub">${esc(subtitle)}</span></div>
    <div class="body"><pre>${body}</pre></div>
    <div class="foot"><span>${esc(footer)}</span><span class="badge">Git 2.56.0 · Windows · sesión verificada</span></div>
  </div>
</body></html>`;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

  let images = 0;
  for (const exercise of exercises) {
    const logFile = `${exercise.slug}.log`;
    const log = parseSections(logFile);
    const outDir = path.join(OUT, exercise.slug);
    fs.mkdirSync(outDir, { recursive: true });

    for (const shot of exercise.shots) {
      const { blocks, sections } = selectedBlocks(log, shot);
      if (!blocks.length) {
        throw new Error(`Sin bloques para ${exercise.slug} / ${shot.id}`);
      }
      const chunks = chunkBlocks(blocks, MAX_LINES);
      const checks = shot.checks ? collectChecks(sections) : [];

      for (let index = 0; index < chunks.length; index++) {
        const chunk = chunks[index];
        const lines = [];
        chunk.forEach((block, i) => {
          if (i > 0) lines.push('');
          lines.push(...blockLines(block));
        });
        if (index === chunks.length - 1 && checks.length) {
          lines.push('');
          lines.push(...checks);
        }
        const suffix = chunks.length > 1 ? ` (${index + 1}/${chunks.length})` : '';
        const file = path.join(outDir, `${shot.id}${chunks.length > 1 ? `-${index + 1}` : ''}.png`);
        const title = `Ejercicio ${exercise.n} · ${shot.label}${suffix}`;
        const subtitle = `${lines.length} líneas de la sesión real`;
        const footer = `Log: ejercicios/logs/${logFile} · ${exercise.title}`;
        const html = htmlFor(title, subtitle, lines, footer);
        await page.setContent(html, { waitUntil: 'load' });
        const el = await page.$('.window');
        await el.screenshot({ path: file });
        images++;
        console.log(`OK ${path.relative(ROOT, file)} (${lines.length} líneas)`);
      }
    }
  }

  await browser.close();
  console.log(`\nCapturas generadas: ${images} en ${OUT}`);
})();
