const pptxgen = require('pptxgenjs');
const path = require('path');

const BUILD = __dirname;
const ROOT = path.resolve(BUILD, '..');
const OUT = path.join(ROOT, 'Conflictos-Git-Presentacion.pptx');

const BG = '0B1220', PANEL = '111C2E', PANEL2 = '0F172A';
const TEAL = '2DD4BF', BLUE = '60A5FA', AMBER = 'FBBF24', CORAL = 'FB7185';
const TXT = 'F8FAFC', MUTED = '94A3B8', LINE = '24334A';
const W = 13.333, H = 7.5;

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Ivan';
pptx.company = 'Prácticas de Git';
pptx.subject = 'Conflictos de código en Git';
pptx.title = 'Conflictos de código en Git';
pptx.lang = 'es-ES';
pptx.theme = { headFontFace: 'Segoe UI', bodyFontFace: 'Segoe UI', lang: 'es-ES' };
const P = pptx.ShapeType;

let n = 0;
const an = key => `a${String(n).padStart(2, '0')}_${key}`;

function base(s, accent = TEAL) {
  s.background = { color: BG };
  s.addShape(P.rect, { x: 0, y: 0, w: W, h: 0.07, fill: { color: accent }, line: { color: accent, width: 0 } });
  s.addShape(P.ellipse, { x: 11.0, y: -1.6, w: 3.8, h: 3.8, fill: { color: '0F2A33', transparency: 62 }, line: { color: '0F2A33', transparency: 100 } });
  s.addShape(P.ellipse, { x: -1.4, y: 5.8, w: 3.2, h: 3.2, fill: { color: '2A1724', transparency: 72 }, line: { color: '2A1724', transparency: 100 } });
}

function tx(s, str, x, y, w, h, size = 14, color = TXT, o = {}) {
  s.addText(str, {
    x, y, w, h, fontFace: o.fontFace || 'Segoe UI', fontSize: size, color,
    bold: !!o.bold, italic: !!o.italic, align: o.align || 'left', valign: o.valign || 'top',
    margin: 0, fit: 'shrink', breakLine: false, charSpacing: o.charSpacing || 0,
    lineSpacingMultiple: o.lineSpacingMultiple || 1,
    hyperlink: o.hyperlink ? { url: o.hyperlink } : undefined,
    objectName: o.name ? an(o.name) : undefined
  });
}

function kicker(s, str, y = 0.6) {
  tx(s, str.toUpperCase(), 0.65, y, 11.8, 0.25, 9, TEAL, { bold: true, charSpacing: 2.2 });
}

function title(s, str, sub = '', y = 0.9, size = 29) {
  tx(s, str, 0.65, y, 12.0, 0.62, size, TXT, { bold: true, name: 'title' });
  if (sub) tx(s, sub, 0.67, y + 0.68, 11.7, 0.42, 12.5, MUTED, { name: 'lead' });
}

function footer(s, section) {
  s.addShape(P.line, { x: 0.55, y: 7.12, w: 12.22, h: 0, line: { color: LINE, width: 0.8 } });
  tx(s, section, 0.55, 7.17, 9.0, 0.2, 8, '64748B');
  tx(s, String(n).padStart(2, '0'), 12.15, 7.14, 0.55, 0.25, 9, TEAL, { bold: true, align: 'right' });
}

function box(s, x, y, w, h, fill = PANEL, line = LINE, r = 0.08, trans = 0) {
  s.addShape(P.roundRect, { x, y, w, h, rectRadius: r, fill: { color: fill, transparency: trans }, line: { color: line, width: 0.9 } });
}

function card(s, x, y, w, h, head, body, accent = TEAL, o = {}) {
  box(s, x, y, w, h);
  s.addShape(P.rect, { x, y, w: 0.055, h, fill: { color: accent }, line: { color: accent, width: 0 } });
  tx(s, head, x + 0.2, y + 0.15, w - 0.35, 0.33, o.headSize || 13.5, accent, { bold: true, name: o.name });
  tx(s, body, x + 0.2, y + 0.56, w - 0.38, h - 0.68, o.bodySize || 10, o.bodyColor || MUTED, { lineSpacingMultiple: 1.12 });
}

function code(s, x, y, w, h, lines, size = 9.2, label = '', name = 'code') {
  box(s, x, y, w, h, '080E1A', '1E2B40', 0.07);
  s.addShape(P.rect, { x: x + 0.08, y: y + 0.1, w: w - 0.16, h: 0.18, fill: { color: '0F1B2D' }, line: { color: '0F1B2D', width: 0 } });
  [CORAL, AMBER, TEAL].forEach((c, i) => s.addShape(P.ellipse, { x: x + 0.16 + i * 0.12, y: y + 0.155, w: 0.07, h: 0.07, fill: { color: c }, line: { color: c, width: 0 } }));
  if (label) tx(s, label, x + 0.55, y + 0.12, w - 0.7, 0.18, 7.5, '64748B');
  tx(s, lines.join('\n'), x + 0.16, y + 0.38, w - 0.32, h - 0.48, size, 'DBE7F3', { fontFace: 'Consolas', lineSpacingMultiple: 1.05, name });
}

function chip(s, x, y, w, label, color = TEAL) {
  box(s, x, y, w, 0.3, '0D2A33', color, 0.15, 20);
  tx(s, label, x, y + 0.045, w, 0.2, 8.5, color, { bold: true, align: 'center', charSpacing: 0.5 });
}

function imgFit(s, file, x, y, w, h, ratio, name = 'img') {
  let iw = w, ih = w / ratio;
  if (ih > h) { ih = h; iw = h * ratio; }
  s.addImage({ path: file, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih, objectName: an(name) });
}

function notes(s, str) { s.addNotes(str); }

// 01
{
  n++;
  const s = pptx.addSlide(); base(s, TEAL);
  tx(s, 'GIT · CONFLICTOS DE CÓDIGO', 0.9, 0.85, 7.2, 0.3, 10, TEAL, { bold: true, charSpacing: 2.3 });
  tx(s, 'Conflictos\nde código', 0.85, 1.3, 7.2, 1.8, 42, TXT, { bold: true, lineSpacingMultiple: 0.93, name: 'title' });
  tx(s, 'Detectar · entender · resolver · verificar', 0.9, 3.25, 7.0, 0.45, 17, AMBER, { name: 'lead' });
  tx(s, 'Guía visual y práctica para salir de un merge, rebase, cherry-pick o stash sin perder cambios.', 0.9, 3.8, 6.7, 0.8, 11.5, MUTED, { lineSpacingMultiple: 1.25 });
  chip(s, 0.9, 4.85, 1.65, '10 EJERCICIOS', TEAL);
  chip(s, 2.7, 4.85, 1.65, '57 PASS · 0 FAIL', AMBER);
  chip(s, 4.5, 4.85, 1.55, 'GIT 2.56', BLUE);
  tx(s, 'Ivan · Octubre 2026', 0.9, 6.55, 4.5, 0.3, 10, MUTED);
  tx(s, 'github.com/75749748-blip/conflictos-git-ejercicios', 0.9, 6.85, 6.3, 0.25, 9, '5EEAD4');
  code(s, 8.15, 1.15, 4.45, 3.35, [
    '$ git merge feature', 'Auto-merging app.txt', 'CONFLICT (content):', 'Merge conflict in app.txt', '',
    '$ git status --short', 'UU app.txt', '', '$ git add app.txt', '$ git commit -m "merge: ..."', '',
    '[PASS] árbol limpio', 'RESULTADO: 5 PASS, 0 FAIL'
  ], 10.0, 'La evidencia real de la práctica', 'code');
  box(s, 8.15, 4.72, 4.45, 1.02, '0D2A33', TEAL, 0.08, 8);
  tx(s, 'EN 20 DIAPOSITIVAS', 8.35, 4.86, 3.9, 0.2, 7.5, TEAL, { bold: true, charSpacing: 1.6 });
  tx(s, 'Diagnóstico · resolución · verificación', 8.35, 5.1, 3.95, 0.28, 10.2, TXT, { bold: true });
  tx(s, '10 ejercicios reales, no solo teoría.', 8.35, 5.42, 3.95, 0.2, 8, MUTED);
  s.addShape(P.rect, { x: 8.15, y: 6.08, w: 4.45, h: 0.03, fill: { color: TEAL }, line: { color: TEAL, width: 0 } });
  tx(s, 'El conflicto no se adivina: se diagnostica.', 8.15, 6.2, 4.45, 0.3, 9, '64748B', { italic: true });
  footer(s, 'Portada');
  notes(s, 'Abrir con la idea central: un conflicto no es un fallo del código, es una decisión que Git no puede tomar solo. En esta sesión veremos cómo detectarlo, entenderlo, resolverlo y comprobarlo.');
}

// 02
{
  n++;
  const s = pptx.addSlide(); base(s, BLUE);
  kicker(s, '01 · El problema');
  title(s, 'El conflicto no es un error', 'Es una decisión que Git no puede tomar.');
  card(s, 0.65, 2.0, 3.85, 2.1, 'Dos historias', 'Dos ramas cambiaron el mismo archivo desde una base común.', TEAL, { name: 'c1' });
  card(s, 4.74, 2.0, 3.85, 2.1, 'Misma región', 'Los cambios se solapan y Git no sabe cuál conservar o cómo combinarlos.', BLUE, { name: 'c2' });
  card(s, 8.83, 2.0, 3.85, 2.1, 'Decisión humana', 'Una persona lee el contexto, elige el resultado y lo valida.', AMBER, { name: 'c3' });
  s.addShape(P.ellipse, { x: 0.9, y: 4.95, w: 0.45, h: 0.45, fill: { color: PANEL }, line: { color: TEAL, width: 1.2 } });
  tx(s, 'base', 0.86, 5.05, 0.55, 0.2, 8, TEAL, { align: 'center' });
  s.addShape(P.line, { x: 1.35, y: 4.55, w: 1.55, h: 0.62, line: { color: TEAL, width: 1.5 } });
  s.addShape(P.line, { x: 1.35, y: 5.17, w: 1.55, h: 0.62, line: { color: CORAL, width: 1.5, endArrowType: 'triangle' } });
  tx(s, 'main', 2.9, 4.39, 0.8, 0.25, 9, TEAL);
  tx(s, 'feature', 2.9, 5.7, 0.8, 0.25, 9, CORAL);
  box(s, 4.35, 4.7, 2.1, 0.9, '13202F', AMBER, 0.1);
  tx(s, 'merge', 4.35, 4.9, 2.1, 0.3, 12, AMBER, { bold: true, align: 'center' });
  tx(s, 'Git se detiene y marca el archivo.', 4.35, 5.22, 2.1, 0.2, 8, MUTED, { align: 'center' });
  tx(s, 'Sin conflicto: Git combina automáticamente.\nCon conflicto: Git pide una decisión.', 7.2, 5.02, 5.3, 0.6, 11.5, TXT, { align: 'right' });
  footer(s, 'El problema');
  notes(s, 'Explicar la diferencia entre un error y un conflicto: Git sí detectó el solapamiento; lo que no puede es decidir la intención. Las tres condiciones: dos historias, misma región, decisión humana.');
}

// 03
{
  n++;
  const s = pptx.addSlide(); base(s, CORAL);
  kicker(s, '02 · Anatomía');
  title(s, 'Leer los marcadores', 'El archivo muestra las tres versiones. No conviene borrar a ciegas.');
  code(s, 0.65, 1.95, 7.3, 3.25, ['linea 1', '<<<<<<< HEAD', 'linea 2 (main)', '||||||| base', 'linea 2', '=======', 'linea 2 (feature)', '>>>>>>> feature', 'linea 3'], 11, 'diff3 / zdiff3', 'code');
  box(s, 0.65, 5.38, 7.3, 0.72, '0D2A33', AMBER, 0.08, 10);
  tx(s, 'diff3 añade la base; zdiff3 la colapsa cuando coincide.', 0.86, 5.55, 6.9, 0.3, 9.5, TXT);
  [['<<<<<<< HEAD', 'ours: rama actual', TEAL], ['||||||| base', 'base común (diff3)', AMBER], ['=======', 'separador', '64748B'], ['>>>>>>> feature', 'theirs: rama que se integra', CORAL]].forEach((r, i) => {
    const y = 2.0 + i * 0.92;
    box(s, 8.35, y, 4.3, 0.74, PANEL, r[2], 0.08);
    tx(s, r[0], 8.52, y + 0.12, 3.95, 0.24, 9, r[2], { fontFace: 'Consolas', bold: true });
    tx(s, r[1], 8.52, y + 0.38, 3.95, 0.2, 8.5, MUTED);
  });
  tx(s, 'Con merge.conflictStyle=zdiff3 también se ve la base y queda claro qué cambió cada lado.', 0.65, 6.3, 7.3, 0.4, 10, MUTED, { italic: true });
  footer(s, 'Anatomía');
  notes(s, 'Recorrer el marcador de arriba a abajo. HEAD es ours; la etiqueta de la rama es theirs. La base solo aparece con diff3/zdiff3. Insistir: no se elige una línea sin entender las tres.');
}

// 04
{
  n++;
  const s = pptx.addSlide(); base(s, TEAL);
  kicker(s, '03 · Mapa mental');
  title(s, 'Del conflicto a la verificación', 'Seis nodos para no perder el hilo.');
  box(s, 0.55, 2.05, 12.25, 4.75, '0A1220', LINE, 0.06);
  imgFit(s, path.join(BUILD, 'mapa-mental.png'), 0.72, 2.1, 11.9, 4.45, 1800 / 966, 'map');
  tx(s, 'Detectar → entender → resolver → marcar → confirmar → verificar', 0.65, 6.62, 11.2, 0.25, 9, MUTED, { italic: true });
  footer(s, 'Mapa mental');
  notes(s, 'Usar el mapa como columna vertebral de la presentación. Cada ejercicio vuelve a estos seis nodos; la diferencia está en el comando que dispara el conflicto.');
}

// 05
{
  n++;
  const s = pptx.addSlide(); base(s, AMBER);
  kicker(s, '04 · Diagnóstico');
  title(s, 'Los estados que deben reconocerse', 'git status --short es el primer diagnóstico.');
  [['UU', 'modificado por ambos', 'Contenido en conflicto', TEAL], ['AA', 'añadido por ambos', 'Dos archivos nuevos', BLUE], ['UD / DU', 'modificado / eliminado', 'Una rama borró el archivo', AMBER], ['DD', 'eliminado por ambos', 'Ambos lo borraron distinto', CORAL]].forEach((d, i) => {
    const x = 0.65 + (i % 2) * 6.2, y = 2.0 + Math.floor(i / 2) * 2.05;
    box(s, x, y, 5.95, 1.75, PANEL, d[3], 0.08);
    tx(s, d[0], x + 0.22, y + 0.22, 0.9, 0.55, 25, d[3], { bold: true, fontFace: 'Consolas' });
    tx(s, d[1], x + 1.15, y + 0.24, 4.5, 0.28, 12, TXT, { bold: true });
    tx(s, d[2], x + 1.15, y + 0.6, 4.45, 0.4, 10, MUTED);
    tx(s, `git status --short  →  ${d[0]} archivo`, x + 1.15, y + 1.08, 4.45, 0.25, 8.5, d[3], { fontFace: 'Consolas' });
  });
  tx(s, 'UU es el más común. AA aparece cuando ambos crean el mismo archivo. UD/DU y DD requieren una decisión de producto.', 0.65, 6.45, 12.0, 0.4, 10, MUTED, { italic: true });
  footer(s, 'Diagnóstico');
  notes(s, 'No memorizar siglas sin contexto: cada estado cuenta una historia. UU: ambos modificaron. AA: ambos crearon. UD/DU: una rama borró. DD: ambos borraron. El estado decide qué comandos tienen sentido.');
}

// 06
{
  n++;
  const s = pptx.addSlide(); base(s, TEAL);
  kicker(s, '05 · Método');
  title(s, 'Resolver en cinco pasos', 'Primero entender; después elegir; al final verificar.');
  [['01', 'Detectar', 'git status\nUU app.txt', TEAL], ['02', 'Entender', 'git diff\ngit show :1: :2: :3:', BLUE], ['03', 'Editar', 'Abrir el archivo\ncombinar la intención', AMBER], ['04', 'Marcar', 'git add app.txt', CORAL], ['05', 'Verificar', 'git diff --check\ngit commit', 'A78BFA']].forEach((st, i) => {
    const x = 0.55 + i * 2.53;
    s.addShape(P.ellipse, { x: x + 0.03, y: 2.0, w: 0.55, h: 0.55, fill: { color: st[3] }, line: { color: st[3], width: 0 } });
    tx(s, st[0], x + 0.03, 2.12, 0.55, 0.2, 9, BG, { bold: true, align: 'center' });
    tx(s, st[1], x + 0.03, 2.7, 2.25, 0.3, 14, TXT, { bold: true });
    box(s, x, 3.12, 2.27, 1.35, PANEL, st[3], 0.07);
    tx(s, st[2], x + 0.15, 3.3, 1.98, 0.95, 8.5, MUTED, { fontFace: 'Consolas' });
    if (i < 4) s.addShape(P.line, { x: x + 2.3, y: 2.27, w: 0.22, h: 0, line: { color: '334155', width: 1.5, endArrowType: 'triangle' } });
  });
  box(s, 0.65, 5.0, 12.0, 1.05, '0D2A33', TEAL, 0.08, 10);
  tx(s, 'Regla de oro', 0.9, 5.17, 1.8, 0.25, 11, TEAL, { bold: true });
  tx(s, 'No resuelvas un conflicto que no entiendes. Si el diff no tiene sentido, vuelve a la base y reconstruye las tres versiones.', 2.55, 5.15, 9.85, 0.55, 11.5, TXT);
  footer(s, 'Método');
  notes(s, 'Presentar el flujo como una checklist mental. El paso 2 es el que más se salta y el que más errores causa. Verificar no es opcional: git diff --check detecta marcadores olvidados.');
}

// 07
{
  n++;
  const s = pptx.addSlide(); base(s, BLUE);
  kicker(s, '06 · Prácticas');
  title(s, 'Los 10 ejercicios', 'Todos ejecutados y verificados: 57 PASS · 0 FAIL.');
  [['01', 'Conflicto simple', '5 PASS'], ['02', 'Varios hunks', '6 PASS'], ['03', 'Modificar/eliminar', '4 PASS'], ['04', 'Añadir/añadir', '5 PASS'], ['05', 'Binario', '4 PASS'], ['06', 'Rebase', '5 PASS'], ['07', 'Cherry-pick', '5 PASS'], ['08', 'Stash pop', '4 PASS'], ['09', 'Inspección + mergetool', '4 PASS'], ['10', 'Estrategias + rerere', '15 PASS']].forEach((it, i) => {
    const x = 0.65 + (i < 5 ? 0 : 6.15), y = 2.0 + (i % 5) * 0.87;
    box(s, x, y, 5.9, 0.7, PANEL, LINE, 0.06);
    tx(s, it[0], x + 0.16, y + 0.16, 0.45, 0.3, 13, TEAL, { bold: true, fontFace: 'Consolas' });
    tx(s, it[1], x + 0.72, y + 0.18, 3.7, 0.28, 11, TXT, { bold: true });
    tx(s, it[2], x + 4.55, y + 0.18, 1.15, 0.25, 9, '34D399', { bold: true, align: 'right' });
  });
  tx(s, 'Cada práctica tiene script, log y captura. El repositorio permite repetirlas desde cero.', 0.65, 6.6, 12.0, 0.3, 10, MUTED, { italic: true });
  footer(s, 'Prácticas');
  notes(s, 'Mostrar el mapa completo antes de entrar en detalle. Los ejercicios 1-5 son de merge; 6-8 son operaciones que reescriben o aplican commits; 9-10 son diagnóstico y automatización.');
}

// 08
{
  n++;
  const s = pptx.addSlide(); base(s, CORAL);
  kicker(s, '07 · La trampa');
  title(s, 'Ours y theirs no son lo que parecen', 'En un merge, ours es la rama actual. En un rebase, ours es la base.');
  card(s, 0.65, 2.0, 5.95, 2.2, 'MERGE', 'ours = rama actual (HEAD)\ntheirs = rama que se integra\n\n:2: = ours   ·   :3: = theirs', TEAL, { name: 'merge' });
  card(s, 6.85, 2.0, 5.95, 2.2, 'REBASE', 'ours = rama base (upstream)\ntheirs = commit que se reaplica\n\n:2: = base   ·   :3: = commit reaplicado', CORAL, { name: 'rebase' });
  box(s, 0.65, 4.6, 12.15, 1.2, '2A1724', CORAL, 0.08);
  tx(s, 'Trampa frecuente', 0.9, 4.8, 2.2, 0.25, 11, CORAL, { bold: true });
  tx(s, 'Si se usa --ours en un rebase, se conserva la base y puede perderse el cambio que se estaba reaplicando. No es “mi versión”: es la versión de la base.', 2.95, 4.77, 9.55, 0.7, 10.5, TXT);
  code(s, 0.65, 6.0, 12.15, 0.75, ['git show :2:archivo   # ours   ·   git show :3:archivo   # theirs'], 9.5, 'La forma segura de comprobarlo', 'code');
  footer(s, 'La trampa');
  notes(s, 'Esta es la diapositiva que más importa. En merge, ours=mi rama; en rebase, ours=base. Por eso hay que mirar :2: y :3: y no fiarse de la etiqueta.');
}

// 09
{
  n++;
  const s = pptx.addSlide(); base(s, TEAL);
  kicker(s, '08 · Práctica 1');
  title(s, 'Conflicto simple en una línea', 'El caso base: mismo archivo, misma línea, dos intenciones.');
  code(s, 0.65, 1.95, 5.55, 2.85, ['$ git merge feature', 'CONFLICT (content):', 'Merge conflict in app.txt', '', '$ git status --short', 'UU app.txt', '', '$ cat app.txt', '<<<<<<< HEAD', 'linea 2 (main)', '=======', 'linea 2 (feature)', '>>>>>>> feature'], 9.2, 'Detección real', 'code');
  [['1', 'Abrir app.txt y leer los dos lados.'], ['2', 'Escribir la versión final (aquí, ambas).'], ['3', 'git add app.txt y commit.'], ['4', 'Verificar con git diff --check y git log.']].forEach((st, i) => {
    const y = 1.98 + i * 0.78;
    s.addShape(P.ellipse, { x: 6.55, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: TEAL }, line: { color: TEAL, width: 0 } });
    tx(s, st[0], 6.55, y + 0.09, 0.38, 0.18, 9, BG, { bold: true, align: 'center' });
    tx(s, st[1], 7.1, y + 0.02, 5.45, 0.32, 11, TXT);
  });
  chip(s, 6.55, 5.3, 1.05, '5 PASS', '34D399');
  chip(s, 7.75, 5.3, 1.35, '0 FAIL', '34D399');
  tx(s, 'Salida real · la captura completa está en la documentación PDF', 6.55, 5.75, 5.8, 0.22, 8, MUTED, { italic: true });
  box(s, 0.65, 6.28, 11.25, 0.58, '0D2A33', TEAL, 0.08, 10);
  tx(s, 'Lección: conservar ambas líneas es una decisión intencional, no un empate.', 0.9, 6.43, 10.8, 0.25, 9.5, TXT);
  box(s, 12.0, 1.95, 0.75, 2.85, '0A1220', LINE, 0.06);
  tx(s, '01', 12.08, 2.12, 0.6, 0.4, 18, TEAL, { bold: true, align: 'center' });
  tx(s, 'simple', 12.02, 2.65, 0.7, 0.65, 8, MUTED, { align: 'center' });
  footer(s, 'Práctica 1');
  notes(s, 'Mostrar el conflicto más pequeño posible. La decisión aquí es conservar ambas líneas; en otros casos será elegir una. Lo importante es que el resultado sea intencional y verificado.');
}

// 10
{
  n++;
  const s = pptx.addSlide(); base(s, BLUE);
  kicker(s, '09 · Prácticas 2, 3 y 4');
  title(s, 'Casos que cambian la decisión', 'Varios hunks · modificar/eliminar · añadir/añadir.');
  card(s, 0.65, 2.0, 3.85, 3.0, '02 · Varios hunks', 'Un archivo, dos regiones.\n\nResolver por bloque.\nNo aplicar --ours a todo.\n\n6 PASS', TEAL, { name: 'c1', bodySize: 11 });
  card(s, 4.74, 2.0, 3.85, 3.0, '03 · UD', 'feature borró notas.txt\nmain lo editó.\n\nConservar → git add\nEliminar → git rm\n\nSe probaron ambas.', BLUE, { name: 'c2', bodySize: 11 });
  card(s, 8.83, 2.0, 3.85, 3.0, '04 · AA', 'Ambas ramas crearon\nCHANGELOG.md distinto.\n\nNo hay base común.\nUnificar y git add.\n\n5 PASS', AMBER, { name: 'c3', bodySize: 11 });
  box(s, 0.65, 5.28, 12.0, 0.78, '0D2A33', TEAL, 0.08, 8);
  tx(s, 'La pregunta común: ¿qué debe existir y con qué contenido? Git muestra; la persona decide.', 0.9, 5.46, 11.4, 0.3, 10.5, TXT);
  footer(s, 'Prácticas 2, 3 y 4');
  notes(s, 'Agrupar estos tres casos porque obligan a decidir sobre la existencia o la forma del archivo, no solo sobre una línea. En UD se probaron conservar y eliminar; en AA se unificó el changelog.');
}

// 11
{
  n++;
  const s = pptx.addSlide(); base(s, CORAL);
  kicker(s, '10 · Práctica 5');
  title(s, 'Binarios: no hay marcadores', 'Git no puede mostrar ni fusionar el contenido. Se elige una versión completa.');
  s.addShape(P.roundRect, { x: 0.65, y: 2.0, w: 2.3, h: 2.3, rectRadius: 0.12, fill: { color: '2A1724' }, line: { color: CORAL, width: 1.2 } });
  tx(s, 'BIN', 0.65, 2.75, 2.3, 0.55, 34, CORAL, { bold: true, align: 'center' });
  tx(s, 'logo.bin', 0.65, 3.35, 2.3, 0.25, 10, MUTED, { align: 'center', fontFace: 'Consolas' });
  code(s, 3.35, 1.98, 8.95, 3.4, ['$ git status --short', 'UU logo.bin', '', '$ git diff', 'warning: Cannot merge binary files', '', '$ git checkout --theirs -- logo.bin', '$ git add logo.bin', '$ git commit -m "merge: usa la version FEATURE"'], 9.5, 'La resolución posible', 'code');
  tx(s, 'Si deben conservarse las dos versiones, se renombra una antes de integrar. Git no genera una combinación.', 0.65, 5.7, 11.7, 0.5, 11, TXT);
  chip(s, 0.65, 6.45, 1.15, '4 PASS', '34D399');
  footer(s, 'Práctica 5');
  notes(s, 'No perder tiempo intentando editar un binario como texto. Se elige ours o theirs; si se necesitan ambos, se renombra uno antes del merge. La validación comprueba el contenido final.');
}

// 12
{
  n++;
  const s = pptx.addSlide(); base(s, TEAL);
  kicker(s, '11 · Práctica 6');
  title(s, 'Rebase: la historia se reescribe', 'El commit se reaplica sobre otra base. Si choca, la operación se detiene.');
  code(s, 0.65, 1.95, 7.3, 2.9, ['$ git switch feature', '$ git rebase main', 'CONFLICT (content): version.txt', '$ git show :2:version.txt   # base', '$ git show :3:version.txt   # commit propio', '$ git add version.txt', '$ GIT_EDITOR=true git rebase --continue'], 9.2, 'Secuencia', 'code');
  box(s, 8.3, 1.95, 4.35, 2.9, '0D2A33', TEAL, 0.08);
  tx(s, 'OJO', 8.55, 2.15, 1.0, 0.3, 12, AMBER, { bold: true });
  tx(s, 'En rebase, ours = base y theirs = commit propio. La etiqueta «ours» no equivale a «versión propia».', 8.55, 2.6, 3.8, 1.1, 10.5, TXT);
  tx(s, 'ANTES', 0.8, 5.15, 0.8, 0.25, 9, '64748B', { bold: true });
  tx(s, 'DESPUÉS', 7.0, 5.15, 1.2, 0.25, 9, '64748B', { bold: true });
  s.addShape(P.line, { x: 1.6, y: 5.55, w: 4.0, h: 0, line: { color: TEAL, width: 1.5 } });
  s.addShape(P.line, { x: 1.6, y: 6.0, w: 2.6, h: 0, line: { color: CORAL, width: 1.5 } });
  for (let i = 0; i < 3; i++) s.addShape(P.ellipse, { x: 1.65 + i * 1.15, y: 5.44, w: 0.22, h: 0.22, fill: { color: TEAL }, line: { color: TEAL, width: 0 } });
  for (let i = 0; i < 2; i++) s.addShape(P.ellipse, { x: 1.65 + i * 1.15, y: 5.89, w: 0.22, h: 0.22, fill: { color: CORAL }, line: { color: CORAL, width: 0 } });
  s.addShape(P.line, { x: 7.8, y: 5.55, w: 4.6, h: 0, line: { color: TEAL, width: 1.5 } });
  for (let i = 0; i < 5; i++) s.addShape(P.ellipse, { x: 7.85 + i * 0.9, y: 5.44, w: 0.22, h: 0.22, fill: { color: i < 3 ? TEAL : AMBER }, line: { color: i < 3 ? TEAL : AMBER, width: 0 } });
  tx(s, 'lineal, sin merge commit', 7.85, 6.12, 4.8, 0.25, 9, AMBER);
  chip(s, 0.65, 6.55, 1.15, '5 PASS', '34D399');
  footer(s, 'Práctica 6');
  notes(s, 'Dibujar la diferencia: antes hay bifurcación; después hay línea. El conflicto se resuelve una vez por commit reaplicado. Recordar la inversión de ours/theirs.');
}

// 13
{
  n++;
  const s = pptx.addSlide(); base(s, BLUE);
  kicker(s, '12 · Práctica 7');
  title(s, 'Cherry-pick: un commit a la vez', 'Reaplicas un cambio concreto sobre otra base. El parche puede no encajar.');
  code(s, 0.65, 1.95, 7.1, 2.6, ['$ HASH=$(git rev-parse main)', '$ git switch feature', '$ git cherry-pick $HASH', 'CONFLICT (content): app.txt', '', '$ git status', '$ git add app.txt', '$ GIT_EDITOR=true git cherry-pick --continue'], 9.3, 'Secuencia', 'code');
  box(s, 8.15, 1.95, 4.5, 2.6, PANEL, BLUE, 0.08);
  tx(s, 'Qué está pasando', 8.38, 2.15, 3.9, 0.3, 12, BLUE, { bold: true });
  tx(s, 'Git copia el cambio del commit elegido y lo intenta aplicar sobre feature.\n\nNo crea un merge commit: reescribe un parche. Si la base cambió, hay conflicto.\n\nSe resuelve, se marca y se continúa.', 8.38, 2.58, 3.95, 1.8, 10.2, TXT, { lineSpacingMultiple: 1.2 });
  tx(s, 'El conflicto es local a ese parche, no a toda la rama.', 0.65, 4.88, 11.8, 0.3, 10.5, MUTED, { italic: true });
  box(s, 0.65, 5.4, 12.0, 0.72, '2A2312', AMBER, 0.08, 8);
  tx(s, 'Cuidado: si el commit depende de otros cambios, el parche puede no compilar.', 0.9, 5.57, 11.4, 0.3, 10, TXT);
  chip(s, 0.65, 6.4, 1.15, '5 PASS', '34D399');
  footer(s, 'Práctica 7');
  notes(s, 'Cherry-pick no fusiona ramas: copia un cambio. Por eso el conflicto es local a ese parche. Se resuelve, se marca y se continúa con --continue.');
}

// 14
{
  n++;
  const s = pptx.addSlide(); base(s, AMBER);
  kicker(s, '13 · Práctica 8');
  title(s, 'Stash: recuperar sin perder', 'El WIP choca con un commit nuevo. El stash sigue ahí hasta que lo resuelvas.');
  [['WIP', 'editas app.txt', TEAL], ['stash', 'guardas el trabajo', BLUE], ['commit', 'main cambia la línea', AMBER], ['pop', 'conflicto al aplicar', CORAL], ['drop', 'solo después de resolver', '34D399']].forEach((f, i) => {
    const x = 0.65 + i * 2.48;
    box(s, x, 2.0, 2.15, 1.15, PANEL, f[2], 0.08);
    tx(s, f[0], x + 0.12, 2.14, 1.9, 0.3, 13, f[2], { bold: true, align: 'center', fontFace: 'Consolas' });
    tx(s, f[1], x + 0.12, 2.52, 1.9, 0.35, 8.5, MUTED, { align: 'center' });
    if (i < 4) s.addShape(P.line, { x: x + 2.18, y: 2.57, w: 0.25, h: 0, line: { color: '334155', width: 1.2, endArrowType: 'triangle' } });
  });
  code(s, 0.65, 3.75, 7.3, 2.3, ['$ git stash pop', 'CONFLICT (content): app.txt', 'Updated upstream / Stashed changes', '', '$ git add app.txt', '$ git stash drop', '$ git commit -m "feat: recupera el WIP"'], 9.4, 'La secuencia segura', 'code');
  box(s, 8.3, 3.75, 4.35, 2.3, '2A2312', AMBER, 0.08);
  tx(s, 'Recuerda', 8.55, 3.95, 1.3, 0.25, 11, AMBER, { bold: true });
  tx(s, 'Si pop genera conflicto, el stash NO se elimina. Primero se resuelve; después, drop y commit.', 8.55, 4.35, 3.85, 1.0, 10.5, TXT);
  chip(s, 0.65, 6.5, 1.15, '4 PASS', '34D399');
  footer(s, 'Práctica 8');
  notes(s, 'El stash no es una copia de seguridad eterna. Si pop conflictúa, se conserva; hay que resolver, marcar y hacer drop explícitamente. Validar que la lista quede vacía.');
}

// 15
{
  n++;
  const s = pptx.addSlide(); base(s, CORAL);
  kicker(s, '14 · Práctica 9');
  title(s, 'Inspección forense', 'Antes de editar, reconstruye las tres versiones.');
  [[':1:', 'BASE', 'Lo que había antes', AMBER], [':2:', 'OURS', 'Rama actual', TEAL], [':3:', 'THEIRS', 'Rama que se integra', CORAL]].forEach((st, i) => {
    const x = 0.65 + i * 2.55;
    box(s, x, 2.0, 2.3, 1.55, PANEL, st[3], 0.08);
    tx(s, st[0], x + 0.15, 2.15, 2.0, 0.4, 24, st[3], { bold: true, fontFace: 'Consolas' });
    tx(s, st[1], x + 0.15, 2.7, 2.0, 0.25, 10, TXT, { bold: true });
    tx(s, st[2], x + 0.15, 3.0, 2.0, 0.3, 8.5, MUTED);
  });
  code(s, 8.35, 1.98, 4.3, 1.78, ['$ git show :1:config.txt', '$ git show :2:config.txt', '$ git show :3:config.txt', '$ git log --merge --oneline', '$ git diff --base'], 8.5, 'Reconstruir', 'code');
  box(s, 0.65, 3.95, 11.95, 2.0, PANEL, LINE, 0.08);
  tx(s, 'Mergetool', 0.9, 4.15, 2.0, 0.3, 14, TEAL, { bold: true });
  tx(s, 'Una herramienta recibe BASE, LOCAL, REMOTE y MERGED. Puede ser visual (VS Code, meld, Beyond Compare) o un script propio. Git marca el archivo cuando la herramienta termina con éxito.', 2.55, 4.12, 9.75, 0.9, 10.5, TXT);
  tx(s, 'La base explica el “por qué” del conflicto. Sin ella, solo ves dos versiones y adivinas.', 0.9, 5.25, 11.3, 0.35, 10, MUTED, { italic: true });
  chip(s, 0.65, 6.4, 1.15, '4 PASS', '34D399');
  footer(s, 'Práctica 9');
  notes(s, 'Mostrar las tres etapas como capas de una historia. La base es la pieza que suele faltar. git log --merge y git diff --base dan contexto; mergetool automatiza la edición, no la decisión.');
}

// 16
{
  n++;
  const s = pptx.addSlide(); base(s, AMBER);
  kicker(s, '15 · Práctica 10');
  title(s, 'Estrategias automáticas', 'Atajos que reducen trabajo... y pueden ocultar decisiones.');
  [['-X ours', 'Fusiona, pero en los hunks conflictivos conserva ours. Los cambios no conflictivos de la otra rama sí entran.', 'Riesgo: se pierden hunks de la otra rama sin aviso.', TEAL], ['-s ours', 'Crea un merge commit cuyo árbol es idéntico al de la rama actual. Ignora todo el árbol de la otra.', 'Riesgo: se descarta la otra rama por completo.', CORAL], ['merge=union', 'Concatena las líneas de ambos lados. Útil en listas; peligroso en JSON o código.', 'Riesgo: archivo sintácticamente inválido.', AMBER], ['merge=ours', 'Un driver que deja el archivo de ours. La otra versión se ignora sin conflicto.', 'Riesgo: cambios invisibles.', BLUE]].forEach((c, i) => {
    const x = 0.65 + (i % 2) * 6.2, y = 1.98 + Math.floor(i / 2) * 2.1;
    box(s, x, y, 5.95, 1.8, PANEL, c[3], 0.07);
    tx(s, c[0], x + 0.2, y + 0.15, 5.4, 0.3, 14, c[3], { bold: true, fontFace: 'Consolas' });
    tx(s, c[1], x + 0.2, y + 0.55, 5.5, 0.75, 9.5, TXT);
    tx(s, c[2], x + 0.2, y + 1.38, 5.5, 0.28, 8.5, c[3], { italic: true });
  });
  chip(s, 0.65, 6.4, 1.35, '15 PASS', '34D399');
  tx(s, 'Se probaron las cuatro variantes y se verificó qué se conservó y qué se descartó.', 2.2, 6.45, 9.8, 0.25, 9, MUTED);
  footer(s, 'Práctica 10');
  notes(s, 'No presentar estas estrategias como magia. -X ours fusiona; -s ours ignora; union concatena; ours oculta. La diferencia entre -X y -s es la que más se confunde.');
}

// 17
{
  n++;
  const s = pptx.addSlide(); base(s, TEAL);
  kicker(s, '16 · Práctica 10B y 10C');
  title(s, 'rerere y merge drivers', 'Recordar una resolución o delegar la fusión a una regla.');
  card(s, 0.65, 1.98, 5.95, 3.9, 'rerere', 'Reuse Recorded Resolution.\n\n1. rerere.enabled true\n2. conflicto y resolución\n3. Git recuerda el conflicto\n4. se repite el merge\n5. aplica la solución\n\nSolo funciona con conflictos idénticos.', TEAL, { name: 'rerere', bodySize: 10 });
  card(s, 6.85, 1.98, 5.95, 3.9, 'merge drivers', '.gitattributes decide por ruta.\n\ndeps.lock merge=union\n*.ours    merge=ours\n\nunion concatena; ours conserva\nel archivo de nuestra rama.\n\nPotentes y silenciosos: documentar.', BLUE, { name: 'drivers', bodySize: 10 });
  code(s, 0.65, 6.0, 12.15, 0.72, ['git config rerere.enabled true   ·   git config merge.ours.driver true'], 9.0, 'Configuración mínima', 'code');
  footer(s, 'Práctica 10B y 10C');
  notes(s, 'rerere es útil en ramas longevas y merges repetidos. Los drivers son reglas por archivo; pueden evitar conflictos, pero también ocultar cambios. La validación comprueba el contenido final.');
}

// 18
{
  n++;
  const s = pptx.addSlide(); base(s, TEAL);
  kicker(s, '17 · Mapa conceptual');
  title(s, 'Todo el sistema en una imagen', 'Del origen del conflicto a la decisión y la verificación.');
  box(s, 0.55, 2.03, 12.25, 4.5, '0A1220', LINE, 0.06);
  imgFit(s, path.join(BUILD, 'mapa-conceptual-compact.png'), 0.72, 2.12, 11.9, 4.3, 1800 / 497, 'map');
  tx(s, 'Conflicto → diagnóstico → resolución → estrategia → validación', 0.65, 6.6, 11.4, 0.25, 9, MUTED, { italic: true });
  footer(s, 'Mapa conceptual');
  notes(s, 'Cerrar la parte conceptual con el mapa. Los ejercicios son instancias de este sistema; la estrategia se elige después de diagnosticar, no antes.');
}

// 19
{
  n++;
  const s = pptx.addSlide(); base(s, AMBER);
  kicker(s, '18 · Evidencia');
  title(s, '10/10 verificados', 'La práctica no termina cuando Git deja de quejarse: termina cuando las pruebas pasan.');
  box(s, 0.65, 2.0, 3.7, 1.55, PANEL, TEAL, 0.08);
  tx(s, '10/10', 0.85, 2.18, 3.3, 0.6, 28, TEAL, { bold: true });
  tx(s, 'ejercicios ejecutados', 0.87, 2.8, 3.2, 0.25, 9, MUTED);
  box(s, 4.55, 2.0, 3.7, 1.55, PANEL, AMBER, 0.08);
  tx(s, '57', 4.75, 2.18, 3.3, 0.6, 28, AMBER, { bold: true });
  tx(s, 'comprobaciones PASS', 4.77, 2.8, 3.2, 0.25, 9, MUTED);
  box(s, 8.45, 2.0, 3.7, 1.55, PANEL, '34D399', 0.08);
  tx(s, '0', 8.65, 2.18, 3.3, 0.6, 28, '34D399', { bold: true });
  tx(s, 'fallos', 8.67, 2.8, 3.2, 0.25, 9, MUTED);
  box(s, 0.65, 3.95, 12.0, 2.1, '0D2A33', TEAL, 0.08);
  tx(s, 'Repositorio público', 0.9, 4.15, 3.0, 0.3, 13, TEAL, { bold: true });
  tx(s, 'github.com/75749748-blip/conflictos-git-ejercicios', 0.9, 4.55, 7.2, 0.3, 11, '5EEAD4', { hyperlink: 'https://github.com/75749748-blip/conflictos-git-ejercicios' });
  tx(s, 'Guía · PDF · PPT · 10 scripts · 10 logs · 51 capturas reales', 0.9, 5.0, 7.5, 0.25, 9.5, MUTED);
  tx(s, 'Cada log termina en RESULTADO: N PASS, 0 FAIL. Cada captura sale de ese log.', 0.9, 5.45, 10.8, 0.3, 10, MUTED, { italic: true });
  footer(s, 'Evidencia');
  notes(s, 'Mostrar el repositorio como evidencia reproducible. Los números no son una promesa: están en los logs y en las capturas. Cualquiera puede ejecutar run-all.sh y obtener el mismo resultado.');
}

// 20
{
  n++;
  const s = pptx.addSlide(); base(s, TEAL);
  kicker(s, '19 · Cierre');
  title(s, 'Checklist para salir del conflicto', 'Entender, decidir, marcar y verificar.');
  ['¿Sé qué cambió cada lado y por qué?', '¿Leí la base y las tres etapas?', '¿Resolví por bloque, no por archivo?', '¿Quité todos los marcadores?', '¿Ejecuté git diff --check?', '¿El resultado pasa las pruebas?'].forEach((c, i) => {
    const x = 0.65 + (i % 2) * 6.2, y = 1.98 + Math.floor(i / 2) * 0.78;
    s.addShape(P.ellipse, { x, y: y + 0.08, w: 0.26, h: 0.26, fill: { color: '0D2A33' }, line: { color: TEAL, width: 1.2 } });
    tx(s, '✓', x, y + 0.095, 0.26, 0.18, 9, TEAL, { bold: true, align: 'center' });
    tx(s, c, x + 0.42, y + 0.03, 5.4, 0.35, 11, TXT);
  });
  box(s, 0.65, 4.55, 12.0, 1.55, '0D2A33', TEAL, 0.08, 8);
  tx(s, '10/10', 0.95, 4.78, 1.55, 0.55, 28, TEAL, { bold: true });
  tx(s, 'ejercicios', 0.98, 5.32, 1.5, 0.25, 9, MUTED);
  tx(s, '57', 2.95, 4.78, 1.0, 0.55, 28, AMBER, { bold: true });
  tx(s, 'PASS', 2.98, 5.32, 1.0, 0.25, 9, MUTED);
  tx(s, '0', 4.45, 4.78, 0.8, 0.55, 28, '34D399', { bold: true });
  tx(s, 'FAIL', 4.48, 5.32, 0.8, 0.25, 9, MUTED);
  tx(s, 'Repositorio y evidencia:', 6.1, 4.85, 5.9, 0.25, 9, MUTED);
  tx(s, 'github.com/75749748-blip/conflictos-git-ejercicios', 6.1, 5.15, 6.0, 0.3, 10, '5EEAD4', { hyperlink: 'https://github.com/75749748-blip/conflictos-git-ejercicios' });
  tx(s, 'Guía · PDF · PPT · 10 scripts · 10 logs · 51 capturas reales', 6.1, 5.55, 5.9, 0.25, 9, MUTED);
  tx(s, 'Gracias.', 0.65, 6.55, 3.0, 0.35, 16, TXT, { bold: true });
  footer(s, 'Cierre');
  notes(s, 'Terminar con la checklist y la evidencia. La idea que debe quedar: un conflicto se resuelve con método, no con memoria. El repositorio permite repetir cada práctica.');
}

(async () => {
  await pptx.writeFile({ fileName: OUT });
  console.log('PPTX:', OUT);
  console.log('Slides:', n);
})();
