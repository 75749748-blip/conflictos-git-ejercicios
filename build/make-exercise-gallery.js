const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'galeria-ejercicios.html');
const SEQ = path.join(__dirname, '..', 'build', 'real-captures', 'seq');

const exercises = [
  ['01', 'Conflicto simple en una línea', 'Básica', 'merge', 5, 'Las dos ramas cambiaron la misma línea de app.txt. Git deja las dos versiones entre marcas y espera que decidas.', 'Árbol limpio. app.txt conserva los dos cambios.'],
  ['02', 'Varios conflictos en un archivo', 'Intermedia', 'merge', 6, 'config.ini tiene dos zonas en conflicto: el nombre y el nivel de log. Cada zona se decide por separado.', 'Árbol limpio. Las dos zonas quedaron resueltas.'],
  ['03', 'Conflicto modificar / eliminar', 'Intermedia', 'merge', 4, 'Una rama editó notas.txt y la otra lo eliminó. Hay que decidir si el archivo debe seguir existiendo.', 'Árbol limpio. Se documentó la solución de eliminar notas.txt.'],
  ['04', 'Conflicto añadir / añadir', 'Intermedia', 'merge', 5, 'Dos ramas crearon el mismo CHANGELOG.md con contenidos distintos. No hay versión base que sirva de referencia.', 'Árbol limpio. Un solo CHANGELOG con las dos entradas.'],
  ['05', 'Conflicto con un archivo binario', 'Intermedia', 'merge', 4, 'logo.bin es binario: Git no puede comparar su contenido ni mostrar marcas. Solo puede quedarse con una versión completa.', 'Árbol limpio. logo.bin quedó con la versión de feature.'],
  ['06', 'Conflicto durante un rebase', 'Avanzada', 'rebase', 5, 'En un rebase, ours es la rama base y theirs es tu commit: justo al revés que en un merge.', 'Historia lineal. No hay merge commit.'],
  ['07', 'Conflicto en un cherry-pick', 'Avanzada', 'cherry-pick', 5, 'Cherry-pick copia un commit concreto de main sobre feature. El parche ya no encaja y Git pausa.', 'Árbol limpio. El cambio se aplicó una sola vez.'],
  ['08', 'Conflicto al recuperar un stash', 'Intermedia', 'stash pop', 4, 'Guardaste trabajo a medias, main avanzó y al recuperarlo choca con el commit nuevo.', 'Árbol limpio. El WIP se recuperó y el stash quedó vacío.'],
  ['09', 'Inspección y herramienta de merge', 'Intermedia', 'mergetool', 4, 'Antes de editar conviene reconstruir la base (:1:), tu lado (:2:) y el otro (:3:). La mergetool ayuda a elegir.', 'Árbol limpio. config.txt resuelto con información completa.'],
  ['10', 'Estrategias automáticas', 'Avanzada', 'estrategias', 15, 'Git ofrece atajos para casos claros: -X ours, -X theirs, merge=ours y union. No sustituyen la revisión.', 'Árbol limpio. Cada estrategia hizo lo esperado.']
];

const slugs = {
  '01': '01-conflicto-simple',
  '02': '02-varios-hunks',
  '03': '03-modificar-eliminar',
  '04': '04-add-add',
  '05': '05-binario',
  '06': '06-rebase',
  '07': '07-cherry-pick',
  '08': '08-stash',
  '09': '09-inspeccion-mergetool',
  '10': '10-estrategias'
};

function shots(n) {
  const dir = path.join(SEQ, n);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /^\d+\.png$/.test(f)).sort();
}

// Las imágenes se incrustan en el HTML: la galería funciona igual desde el
// repositorio, desde el paquete del Escritorio o abierta suelta en cualquier
// navegador, sin depender de rutas relativas.
function shotUri(n, f) {
  return `data:image/png;base64,${fs.readFileSync(path.join(SEQ, n, f)).toString('base64')}`;
}

const total = exercises.reduce((s, e) => s + e[4], 0);
const totalShots = exercises.reduce((s, e) => s + shots(e[0]).length, 0);

const cards = exercises.map(([n, title, diff, op, pass, what, result]) => {
  const files = shots(n);
  const imgs = files.map((f, i) => `
      <figure>
        <img src="${shotUri(n, f)}" alt="Captura ${i + 1} de ${files.length} del ejercicio ${n}: ${title}">
        <figcaption><b>Captura ${i + 1} de ${files.length}</b><span>comando y salida reales</span></figcaption>
      </figure>`).join('');
  return `
  <article class="card">
    <div class="top"><span class="num">${n}</span><div class="ttl"><h2>${title}</h2><p>${diff} · ${op}</p></div><span class="pass">${pass} PASS · 0 FAIL</span></div>
    <p class="what">${what}</p>
    <div class="shots">${imgs}</div>
    <div class="res"><span>✓</span>${result}</div>
    <div class="links"><a href="scripts/${slugs[n]}.sh">ver script</a><a href="logs/${slugs[n]}.log">ver log</a><span>${files.length} capturas reales</span></div>
  </article>`;
}).join('');

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>10 ejercicios · Conflictos de Git</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#eef2f7;color:#1e293b;font-family:'Segoe UI',system-ui,Arial,sans-serif}
  .page{max-width:1180px;margin:0 auto;padding:30px 22px 60px}
  .kicker{font-size:11px;letter-spacing:.2em;font-weight:800;color:#0f766e;text-transform:uppercase}
  h1{margin:7px 0 8px;font-size:34px;line-height:1.08;letter-spacing:-.02em;color:#0f172a}
  .lead{margin:0;color:#475569;font-size:14.5px;line-height:1.55;max-width:860px}
  .stats{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0 24px}
  .stats div{background:#0f172a;color:#fff;border-radius:12px;padding:11px 20px;min-width:130px}
  .stats b{display:block;font-size:21px;line-height:1;color:#2dd4bf}
  .stats span{display:block;margin-top:5px;font-size:11px;color:#cbd5e1}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
  .card{background:#fff;border:1px solid #dbe3ec;border-radius:16px;padding:18px;box-shadow:0 8px 24px rgba(15,23,42,.06)}
  .top{display:flex;align-items:flex-start;gap:11px;margin-bottom:9px}
  .num{width:32px;height:32px;flex:0 0 32px;border-radius:50%;background:#f0fdfa;border:1.5px solid #0d9488;color:#0f766e;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center}
  .ttl{flex:1;min-width:0}
  .ttl h2{margin:0;font-size:16px;line-height:1.25;color:#0f172a}
  .ttl p{margin:3px 0 0;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:#64748b}
  .pass{font-size:10.5px;font-weight:800;color:#166534;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:4px 9px;white-space:nowrap}
  .what{margin:0 0 11px;font-size:12.4px;line-height:1.5;color:#475569}
  .shots{display:flex;flex-direction:column;gap:9px}
  .shots figure{margin:0}
  .shots img{display:block;width:100%;border:1px solid #1e293b;border-radius:8px;background:#0b1220}
  .shots figcaption{display:flex;justify-content:space-between;margin-top:3px;font-size:10px;color:#94a3b8}
  .shots figcaption b{color:#0f766e}
  .res{display:flex;gap:7px;align-items:flex-start;margin:11px 0 8px;font-size:11.6px;line-height:1.45;color:#166534}
  .res span{width:16px;height:16px;flex:0 0 16px;border-radius:50%;background:#16a34a;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px}
  .links{display:flex;gap:14px;align-items:center;border-top:1px solid #e2e8f0;padding-top:9px;font-size:11px}
  .links a{color:#0f766e;font-weight:700;text-decoration:none}
  .links a:hover{text-decoration:underline}
  .links span{margin-left:auto;color:#94a3b8}
  .note{margin:24px 0 0;padding:13px 16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;font-size:12.5px;line-height:1.5;color:#78350f}
  @media (max-width:880px){.grid{grid-template-columns:1fr}}
  @media print{body{background:#fff}.page{max-width:none;padding:0}.card{break-inside:avoid;box-shadow:none}.stats div{-webkit-print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="kicker">Ejercicios verificados · Git</div>
  <h1>Los 10 ejercicios, con la ejecución completa</h1>
  <p class="lead">Cada tarjeta reúne todas las capturas reales de la consola: el comando escrito, su salida y el resultado final. Las imágenes se tomaron en este equipo mientras el script se ejecutaba, de modo que la secuencia no es un resumen sino el recorrido completo.</p>
  <div class="stats">
    <div><b>10/10</b><span>ejercicios completados</span></div>
    <div><b>${total}</b><span>comprobaciones PASS</span></div>
    <div><b>0</b><span>fallos</span></div>
    <div><b>${totalShots}</b><span>capturas reales</span></div>
  </div>
  <div class="grid">${cards}</div>
  <p class="note"><b>Cómo leer las capturas.</b> Cada línea que empieza con <code>$</code> es un comando ejecutado en este equipo; debajo aparece su salida real. La última captura de cada ejercicio termina con <code>RESULTADO: N PASS, 0 FAIL</code>. Los scripts y los logs completos están en las carpetas <code>scripts/</code> y <code>logs/</code>.</p>
</div></body></html>`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('Galería:', OUT, totalShots, 'capturas');
