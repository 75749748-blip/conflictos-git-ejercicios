const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BUILD = __dirname;
const ROOT = path.resolve(BUILD, '..');
const OUT_DIR = path.join(ROOT, 'documentacion');
const OUT_PDF = path.join(OUT_DIR, 'Conflictos-Git-Guia-Simple.pdf');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REPO = 'https://github.com/75749748-blip/conflictos-git-ejercicios';


function esc(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function dataUri(rel) {
  return `data:image/png;base64,${fs.readFileSync(path.join(ROOT, rel)).toString('base64')}`;
}

const MAP = dataUri('mapa-mental/mapa-mental.png');
const { grupos } = require('./comandos');
const TOTAL_CMDS = grupos.reduce((s, g) => s + g.items.length, 0);

// Cada ejercicio tiene una secuencia de capturas reales: la consola se
// fotografía cada ~36 filas, así que entre todas las imágenes aparecen todos
// los comandos y todas las salidas, no solo el resumen final.
function seqShots(n) {
  const dir = path.join(ROOT, 'build', 'real-captures', 'seq', n);
  if (!fs.existsSync(dir)) {
    return [dataUri(`build/real-captures/${n}.png`)];
  }
  const files = fs.readdirSync(dir).filter(f => /^\d+\.png$/.test(f)).sort();
  return files.map(f => dataUri(path.join('build', 'real-captures', 'seq', n, f)));
}

const SHOTS = Object.fromEntries(
  ['01','02','03','04','05','06','07','08','09','10'].map(n => [n, seqShots(n)])
);
const TOTAL_SHOTS = Object.values(SHOTS).reduce((s, a) => s + a.length, 0);

const exercises = [
  {
    n: '01', difficulty: 'Básica', op: 'merge', pass: 5,
    title: 'Conflicto simple en una línea',
    what: 'Las dos ramas modificaron la misma línea de <code>app.txt</code>. Git no puede decidir cuál conservar y deja ambas versiones dentro del archivo, entre las marcas <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> y <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>.',
    steps: [
      { code: 'git status --short', text: 'El archivo se presenta con el estado <b>UU</b>: ambos lados lo modificaron.' },
      { code: 'app.txt', text: 'Se conservan las dos líneas, <b>linea 2 (main)</b> y <b>linea 2 (feature)</b>, y se eliminan las marcas.' },
      { code: 'git add + git commit', text: 'Se marca el archivo como resuelto y se confirma el merge.' }
    ],
    result: 'Árbol de trabajo limpio. app.txt conserva los dos cambios y no quedan marcadores.'
  },
  {
    n: '02', difficulty: 'Intermedia', op: 'merge', pass: 6,
    title: 'Varios conflictos en un archivo',
    what: 'El mismo <code>config.ini</code> presenta dos zonas en conflicto: el nombre de la aplicación y el nivel de log. Cada zona admite una decisión independiente; no conviene aplicar una sola respuesta a todo el archivo.',
    steps: [
      { code: 'git diff', text: 'Se localizan los dos bloques de conflicto y se identifica el cambio de cada lado.' },
      { code: 'config.ini', text: 'El nombre se unifica como <b>demo (main+feature)</b> y el nivel de log se fija en <b>debug</b>.' },
      { code: 'git add + git commit', text: 'Se eliminan las marcas y se confirma el merge.' }
    ],
    result: 'Árbol de trabajo limpio. Las dos zonas quedaron resueltas con decisiones independientes.'
  },
  {
    n: '03', difficulty: 'Intermedia', op: 'merge', pass: 4,
    title: 'Conflicto modificar / eliminar',
    what: 'Una rama editó <code>notas.txt</code> y la otra lo eliminó. El caso equivale a decidir si el archivo debe seguir existiendo. Es el estado <b>UD</b> y la decisión es de producto, no de sintaxis.',
    steps: [
      { code: 'git status + cat', text: 'Se comprueba el estado y se lee el contenido que una de las ramas quiso conservar.' },
      { code: 'git add  ·  git rm', text: 'La decisión se registra con <b>add</b>, si se conserva el archivo, o con <b>rm</b>, si se acepta la eliminación.' },
      { code: 'git commit', text: 'Se confirma el merge con la decisión adoptada.' }
    ],
    result: 'Árbol de trabajo limpio. Se documentó la solución de eliminar notas.txt.'
  },
  {
    n: '04', difficulty: 'Intermedia', op: 'merge', pass: 5,
    title: 'Conflicto añadir / añadir',
    what: 'Dos ramas crearon el mismo archivo nuevo, <code>CHANGELOG.md</code>, con contenidos distintos. Es el estado <b>AA</b>: no existe una versión base del archivo que sirva de referencia.',
    steps: [
      { code: 'cat CHANGELOG.md', text: 'Git concatena los dos documentos. Ambos se leen antes de editar.' },
      { code: 'CHANGELOG.md', text: 'Las entradas <b>1.1.0</b> y <b>1.0.1</b> se ordenan en un único changelog.' },
      { code: 'git add + git commit', text: 'Se guarda el archivo unificado y se confirma.' }
    ],
    result: 'Árbol de trabajo limpio. Un solo CHANGELOG con las dos entradas.'
  },
  {
    n: '05', difficulty: 'Intermedia', op: 'merge', pass: 4,
    title: 'Conflicto con un archivo binario',
    what: '<code>logo.bin</code> es un archivo binario. Git no puede comparar su contenido ni mostrar marcas: solo puede conservar una versión completa. Para mantener las dos, una de ellas tendría que renombrarse antes de integrar.',
    steps: [
      { code: 'git diff', text: 'Git muestra el aviso <b>Cannot merge binary files</b>; no hay texto que editar.' },
      { code: 'git checkout --theirs', text: 'Se selecciona una versión completa del archivo (en este caso, la de <b>feature</b>).' },
      { code: 'git add + git commit', text: 'Se marca la versión elegida y se confirma el merge.' }
    ],
    result: 'Árbol de trabajo limpio. logo.bin conserva la versión de feature.'
  },
  {
    n: '06', difficulty: 'Avanzada', op: 'rebase', pass: 5,
    title: 'Conflicto durante un rebase',
    what: 'En un rebase, Git reaplica los commits sobre otra base. Si el parche no encaja, <b>ours</b> es la rama base y <b>theirs</b> es el commit propio: al revés que en un merge.',
    steps: [
      { code: 'git status', text: 'Se identifica el archivo que detuvo el rebase.' },
      { code: 'git show :2: :3:', text: 'Se comparan la base (main) y el commit (feature) y se resuelve el archivo.' },
      { code: 'git add + git rebase --continue', text: 'Se marca la resolución y se reanuda el rebase.' }
    ],
    result: 'Historia lineal, sin commit de merge, con los cambios conservados.'
  },
  {
    n: '07', difficulty: 'Avanzada', op: 'cherry-pick', pass: 5,
    title: 'Conflicto en un cherry-pick',
    what: 'Cherry-pick copia un commit concreto de <code>main</code> sobre <code>feature</code>. El parche ya no encaja en la nueva base y Git se detiene para que se ajuste.',
    steps: [
      { code: 'git log --oneline', text: 'Se identifica el commit de main que se va a aplicar.' },
      { code: 'git cherry-pick <hash>', text: 'El commit se aplica sobre feature y se registra el conflicto.' },
      { code: 'git add + --continue', text: 'Se resuelve app.txt, se marca y se reanuda el cherry-pick.' }
    ],
    result: 'Árbol de trabajo limpio. El cambio se aplicó una sola vez, sin duplicarlo.'
  },
  {
    n: '08', difficulty: 'Intermedia', op: 'stash pop', pass: 4,
    title: 'Conflicto al recuperar un stash',
    what: 'El trabajo a medias se guardó con <code>stash</code>, la rama principal avanzó y, al recuperarlo, entra en conflicto con el commit nuevo. Las marcas muestran <b>Updated upstream</b> y <b>Stashed changes</b>.',
    steps: [
      { code: 'git stash pop', text: 'Se recupera el trabajo guardado y se registra el conflicto.' },
      { code: 'app.txt', text: 'El WIP se combina con el cambio de main y se eliminan las marcas.' },
      { code: 'git add + stash drop', text: 'Se marca la resolución, se descarta el stash ya aplicado y se confirma.' }
    ],
    result: 'Árbol de trabajo limpio. El WIP se recuperó y la lista de stash quedó vacía.'
  },
  {
    n: '09', difficulty: 'Intermedia', op: 'mergetool', pass: 4,
    title: 'Inspección y herramienta de merge',
    what: 'Antes de editar conviene reconstruir las tres versiones: la base (<code>:1:</code>), la versión local (<code>:2:</code>) y la remota (<code>:3:</code>). Con esa información, la herramienta de merge permite elegir el resultado sin adivinar.',
    steps: [
      { code: 'git show :1: :2: :3:', text: 'Se leen la base, la versión local y la versión remota.' },
      { code: 'git mergetool', text: 'La herramienta de merge construye el resultado final de config.txt.' },
      { code: 'git add + git commit', text: 'Se guarda, se marca y se confirma el merge.' }
    ],
    result: 'Árbol de trabajo limpio. config.txt se resolvió con información completa.'
  },
  {
    n: '10', difficulty: 'Avanzada', op: 'estrategias', pass: 15,
    title: 'Estrategias automáticas',
    what: 'Git ofrece atajos para casos previsibles: <code>-X ours</code>, <code>-X theirs</code>, un driver <code>merge=ours</code> y la estrategia <code>union</code>. Reducen trabajo, pero no sustituyen la revisión del resultado.',
    steps: [
      { code: '-X ours  ·  -X theirs', text: 'Ambas estrategias se prueban en ramas desechables y se comprueba qué se conserva.' },
      { code: 'merge=ours', text: 'Se configura un driver para archivos de lock que no deben cambiar.' },
      { code: 'union', text: 'Se conservan las dos líneas cuando ambas aportan información y se valida el resultado.' }
    ],
    result: 'Árbol de trabajo limpio. Cada estrategia produjo el efecto esperado.'
  }
];

const totalPass = exercises.reduce((s, e) => s + e.pass, 0);

function foot() {
  return `<div class="foot"><span>Detección y resolución de conflictos · Guía simple</span><span>{{PAGE}} / {{TOTAL}}</span></div>`;
}

function head(eyebrow, title, sub) {
  return `<div class="eyebrow">${eyebrow}</div><h2>${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}`;
}

function cover() {
  const rows = [
    ['1', 'Detectar', 'estado y archivos afectados'],
    ['2', 'Entender', 'qué quiso cada lado'],
    ['3', 'Resolver', 'una decisión por bloque'],
    ['4', 'Verificar', 'sin marcas y con pruebas'],
    ['5', 'Prevenir', 'ramas cortas, integrar seguido']
  ].map(([n, t, d], i) => `<div class="crow" style="--c:${['#2dd4bf','#60a5fa','#fbbf24','#fb7185','#4ade80'][i]}"><span class="cn">${n}</span><div><b>${t}</b><small>${d}</small></div></div>`).join('');

  return `<section class="page cover">
    <div class="cbar"></div>
    <div class="cglow g1"></div><div class="cglow g2"></div>
    <div class="cgrid"></div>
    <div class="ctop">
      <div class="ceyebrow">Detección y resolución de conflictos de código</div>
      <h1>Merge<br><em>Conflicts</em></h1>
      <p class="clead">Documentación de los <b>diez ejercicios</b> de detección y resolución de conflictos de código.<br>Ejecución real, procedimiento aplicado y resultado verificado.</p>
      <div class="cstats">
        <div><b>10/10</b><span>ejercicios</span></div>
        <div><b>57</b><span>comprobaciones</span></div>
        <div><b>0</b><span>fallos</span></div>
        <div><b>${TOTAL_CMDS}</b><span>comandos explicados</span></div>
      </div>
    </div>
    <div class="clist"><div class="clist-t">Fases del proceso</div>${rows}</div>
    <div class="cfeatures"><span>10 ejercicios paso a paso</span><span>Mapa mental en Canvas HTML5</span><span>${TOTAL_SHOTS} capturas reales</span></div>
    <div class="cindex">
      <div><b>01</b><span>Marco conceptual</span></div>
      <div><b>02</b><span>Metodología</span></div>
      <div><b>03</b><span>Procedimiento</span></div>
      <div><b>04</b><span>Ejercicios 01–10</span></div>
      <div><b>05</b><span>Anexo A · Comandos</span></div>
      <div><b>06</b><span>Resultados y conclusiones</span></div>
    </div>
    <div class="cfoot"><span>Ivan &lt;75749748@iegb.edu.pe&gt; · Octubre 2026 · equipo IVAN</span><span>github.com/75749748-blip/conflictos-git-ejercicios</span></div>
    <div class="cnote">Un conflicto no es un error: es una decisión pendiente.</div>
  </section>`;
}

function pageIdeas() {
  const cards = [
    ['01', 'El conflicto no es un fallo', 'Git detiene la operación para no perder trabajo. El repositorio permanece intacto y la decisión queda pendiente.'],
    ['02', 'La decisión no es automática', 'Git muestra las dos versiones y unas marcas. La elección corresponde a quien mantiene el código.'],
    ['03', 'Resolver equivale a decidir', 'Cabe conservar un lado, combinar los dos o eliminar el archivo. El resultado debe tener sentido para el proyecto.']
  ].map(([n, t, d]) => `<div class="idea"><span class="inum">${n}</span><h3>${t}</h3><p>${d}</p></div>`).join('');

  return `<section class="page p2">
    ${head('1 · Marco conceptual', 'Conceptos básicos', 'Definiciones necesarias para interpretar el estado del repositorio y las marcas de conflicto.')}
    <div class="ideas">${cards}</div>
    <div class="label">DEFINICIONES BÁSICAS</div>
    <div class="gloss">
      <div><b>Rama</b><span>Una línea de trabajo paralela. <code>main</code> suele ser la principal.</span></div>
      <div><b>Merge</b><span>Une dos ramas en un commit nuevo que conserva las dos historias.</span></div>
      <div><b>Marcador</b><span><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> y <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> separan las versiones en conflicto.</span></div>
      <div><b>Índice</b><span>Zona donde se prepara lo que entrará en el próximo commit mediante <code>git add</code>.</span></div>
    </div>
    <div class="need"><b>Requisitos del entorno:</b> Windows 11, Git para Windows 2.56.0 y una terminal Git Bash.</div>
    <div class="example">
      <pre class="excode"><span class="mark">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</span>
linea 2 (main)
<span class="sep">=======</span>
linea 2 (feature)
<span class="mark">&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature</span></pre>
      <div class="extext">
        <b>Anatomía de las marcas</b>
        <ul>
          <li><code>HEAD</code> identifica la rama actual.</li>
          <li><code>=======</code> separa las dos versiones.</li>
          <li><code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature</code> nombra la rama que se integra.</li>
        </ul>
        <p>Las marcas no se eliminan antes de leerlas: primero se decide y después se limpia el archivo.</p>
      </div>
    </div>
    <div class="gold"><span>Criterio general</span>Un cambio que no se comprende no debe resolverse: primero se consultan las dos versiones.</div>
    ${foot()}
  </section>`;
}

function pageMap() {
  const rows = [
    ['1', 'Detectar', 'Estado, archivos UU y marcas en el archivo.'],
    ['2', 'Entender', 'Qué quería cada lado y por qué.'],
    ['3', 'Resolver', 'Una decisión por cada bloque.'],
    ['4', 'Verificar', 'Sin marcas, con pruebas y commit.'],
    ['5', 'Prevenir', 'Ramas cortas, avisos e integración frecuente.']
  ].map(([n, t, d], i) => `<div class="mrow" style="--c:${['#0d9488','#2563eb','#d97706','#e11d48','#16a34a'][i]}"><span>${n}</span><div><b>${t}</b><small>${d}</small></div></div>`).join('');

  return `<section class="page p3">
    ${head('2 · Metodología', 'Modelo de resolución en cinco fases', 'Las cuatro primeras fases componen el ciclo de resolución; la quinta agrupa las prácticas que evitan su repetición.')}
    <div class="mapframe"><img src="${MAP}" alt="Mapa mental de cinco ramas: detectar, entender, resolver, verificar y prevenir"></div>
    <div class="mapgrid">${rows}
      <div class="mgold"><b>Criterio general</b><span>Un cambio que no se comprende no debe resolverse: primero se consultan las dos versiones.</span></div>
    </div>
    <p class="mapnote">Mapa elaborado con <b>Canvas HTML5</b> (<code>mapa-mental/mapa-mental.html</code>), disponible también como PNG de alta resolución.</p>
    ${foot()}
  </section>`;
}

function pageMethod() {
  const steps = [
    ['1', 'Detectar', 'Se consulta el estado y se localizan los archivos marcados.', 'git status --short'],
    ['2', 'Entender', 'Se comparan las dos versiones antes de editar.', 'git diff'],
    ['3', 'Resolver', 'Se elige o se combina; se eliminan todos los marcadores.', 'editor + git add'],
    ['4', 'Verificar', 'Se confirma que no quedan marcas y que las pruebas pasan.', 'git diff --check']
  ].map(([n, t, d, c], i) => `<div class="mstep" style="--c:${['#0d9488','#2563eb','#d97706','#e11d48'][i]}"><span class="mn">${n}</span><h3>${t}</h3><p>${d}</p><code>${c}</code></div>`).join('');

  const rows = exercises.map(e => `<tr><td class="c">${e.n}</td><td><b>${e.title}</b></td><td>${e.op}</td><td class="ok">${e.pass} PASS · 0 FAIL</td></tr>`).join('');

  return `<section class="page p4">
    ${head('3 · Procedimiento', 'Secuencia de resolución', 'El orden es constante. Si el análisis no es concluyente, se regresa al primer paso antes de editar.')}
    <div class="msteps">${steps}</div>
    <div class="prevent"><b>5 · Prevenir</b><span>Ramas cortas, integraciones frecuentes y aviso cuando dos personas trabajan sobre el mismo archivo.</span></div>
    <div class="label">LOS 10 EJERCICIOS DOCUMENTADOS</div>
    <table class="overview"><thead><tr><th style="width:7%">#</th><th style="width:53%">Ejercicio</th><th style="width:17%">Operación</th><th style="width:23%">Resultado</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="usenote"><b>Alcance del documento.</b> Cada ejercicio se documenta con su descripción, el procedimiento aplicado, la captura de consola y el resultado verificado. El anexo final reúne los comandos empleados, con su función y el motivo de su uso.</div>
    <div class="label" style="margin-top:6mm">ESTADOS DE CONFLICTO EN GIT STATUS</div>
    <div class="states">
      <div><b>UU</b><span>Los dos modificaron el archivo.</span></div>
      <div><b>AA</b><span>Los dos añadieron el mismo archivo.</span></div>
      <div><b>UD</b><span>Uno modificó y el otro eliminó.</span></div>
      <div><b>DU</b><span>Uno eliminó y el otro modificó.</span></div>
    </div>
    ${foot()}
  </section>`;
}

function pageExercise(e) {
  const steps = e.steps.map((s, i) => `<div class="step"><span class="sn">${i + 1}</span><div class="st"><p>${s.text}</p><code>${s.code}</code></div></div>`).join('');
  const shots = SHOTS[e.n];
  return `<section class="page pex">
    <div class="exhead"><div class="eyebrow">4 · Ejercicio ${e.n} / 10 · ${e.difficulty}</div><span class="op">${e.op}</span></div>
    <h2 class="extitle">${e.title}</h2>
    <div class="label">DESCRIPCIÓN DEL CASO</div>
    <p class="what">${e.what}</p>
    <div class="label">PROCEDIMIENTO APLICADO</div>
    <div class="steps">${steps}</div>
    <div class="result"><div class="rnum"><b>${e.pass}</b><span>PASS</span></div><div class="rdiv"></div><div class="rnum zero"><b>0</b><span>FAIL</span></div><div class="rdesc">${e.result}</div></div>
    <div class="shot"><img src="${shots[0]}" alt="Captura 1 de ${shots.length} del ejercicio ${e.n}: ${e.title}"><div class="cap"><span>Captura real 1 de ${shots.length} · consola del equipo</span><span>${e.pass} PASS · 0 FAIL</span></div></div>
    ${foot()}
  </section>`;
}

function pageEvidence(e, group) {
  const total = SHOTS[e.n].length;
  const figs = group.map(g => `<figure class="ev">
      <img src="${g.src}" alt="Captura ${g.k} de ${total} del ejercicio ${e.n}: ${e.title}">
      <figcaption><b>Captura ${g.k} de ${total}</b><span>comando y salida reales</span></figcaption>
    </figure>`).join('');
  const range = group.length > 1 ? `${group[0].k} y ${group[group.length - 1].k}` : `${group[0].k}`;
  return `<section class="page pev">
    <div class="exhead"><div class="eyebrow">Ejercicio ${e.n} / 10 · evidencia de ejecución</div><span class="op">${e.op}</span></div>
    <p class="evlead"><b>Continuación de la consola real.</b> Cada línea <code>$</code> es un comando escrito en este equipo y debajo aparece su salida. Las capturas ${range} de ${total} completan la secuencia del ejercicio ${e.n}.</p>
    <div class="evwrap">${figs}</div>
    ${foot()}
  </section>`;
}

// ------------------------------------------------------- diccionario -------
// Cada comando del taller, en una tabla: qué hace y por qué se usó. Está
// pensado para quien nunca ha usado Git, pero sin gastar una página por
// comando.
function glossaryUnits() {
  const units = [];
  for (const g of grupos) {
    units.push({ type: 'group', titulo: g.titulo, nota: g.nota });
    for (const it of g.items) units.push({ type: 'cmd', it });
  }
  return units;
}

function glossaryChunks() {
  const units = glossaryUnits();
  const size = Math.ceil(units.length / 3);
  const chunks = [];
  for (let i = 0; i < units.length; i += size) chunks.push(units.slice(i, i + size));
  // Si una página termina en un título de grupo, el título pasa a la siguiente.
  for (let i = 0; i < chunks.length - 1; i++) {
    while (chunks[i].length && chunks[i][chunks[i].length - 1].type === 'group') {
      chunks[i + 1].unshift(chunks[i].pop());
    }
  }
  return chunks;
}

function pageGlossary(chunk, index, total) {
  const rows = chunk.map(u => u.type === 'group'
    ? `<tr class="ghead"><td colspan="2">${esc(u.titulo)}</td></tr>`
    : `<tr><td class="gc"><code>${esc(u.it.c)}</code></td><td><b>Función.</b> ${esc(u.it.q)}<br><b>Motivo de uso.</b> ${esc(u.it.p)}</td></tr>`).join('');
  const intro = index === 0
    ? `<p class="gintro"><b>${TOTAL_CMDS} comandos.</b> Se indica la función de cada uno y el motivo de su empleo en los ejercicios. Todos aparecen en las capturas de las páginas anteriores.</p>`
    : '';
  return `<section class="page pglo">
    <div class="exhead"><div class="eyebrow">Anexo A · Diccionario de comandos · ${index + 1} / ${total}</div><span class="op">${TOTAL_CMDS} comandos</span></div>
    <h2 class="extitle">Comandos empleados</h2>
    ${intro}
    <table class="gtable"><thead><tr><th style="width:37%">Comando</th><th>Función y motivo de uso</th></tr></thead><tbody>${rows}</tbody></table>
    ${foot()}
  </section>`;
}

function pageResults() {
  const rows = exercises.map(e => `<tr><td class="c">${e.n}</td><td>${e.title}</td><td class="num">${e.pass}</td><td class="num">0</td><td class="ok">✓ Verificado</td></tr>`).join('');
  return `<section class="page p5">
    ${head('5 · Resultados', 'Resultados de la ejecución', 'Cada cifra procede de la última línea del registro de ejecución: RESULTADO: N PASS, 0 FAIL.')}
    <div class="bigstats">
      <div><b>10/10</b><span>ejercicios completados</span></div>
      <div><b>57</b><span>comprobaciones PASS</span></div>
      <div class="z"><b>0</b><span>fallos</span></div>
      <div><b>${TOTAL_SHOTS}</b><span>capturas reales</span></div>
    </div>
    <table class="results"><thead><tr><th style="width:7%">#</th><th style="width:55%">Ejercicio</th><th style="width:10%">PASS</th><th style="width:10%">FAIL</th><th style="width:18%">Estado</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="oknote"><b>Criterio de verificación.</b> Cada script genera el conflicto, aplica la resolución y ejecuta comprobaciones automáticas. En los diez casos el árbol de trabajo quedó limpio y sin marcadores.</div>
    <div class="coverage"><div class="label">OPERACIONES CUBIERTAS</div><div class="tags"><span>merge</span><span>rebase</span><span>cherry-pick</span><span>stash pop</span><span>binarios</span><span>mergetool</span><span>estrategias</span></div></div>
    <div class="label" style="margin-top:7mm">OBTENCIÓN DE LA EVIDENCIA</div>
    <div class="evid">
      <div><span>1</span><b>Generación del conflicto</b><p>Un script prepara un repositorio temporal y provoca el conflicto.</p></div>
      <div><span>2</span><b>Resolución y validación</b><p>Se aplica la solución y se ejecutan comprobaciones PASS/FAIL.</p></div>
      <div><span>3</span><b>Registro de la evidencia</b><p>Las capturas de consola y el registro completo se incorporan al repositorio.</p></div>
    </div>
    ${foot()}
  </section>`;
}

function pageClose() {
  return `<section class="page p6">
    ${head('6 · Conclusiones', 'Procedimiento de contingencia', 'Actuación prevista cuando la resolución no es evidente.')}
    <div class="cols">
      <div class="col">
        <h3>Cuando la resolución no es clara</h3>
        <ol class="cl">
          <li>No se elimina el archivo ni la carpeta <code>.git</code>.</li>
          <li>Se ejecuta <code>git status --short</code> para identificar los archivos en conflicto.</li>
          <li>Se ejecuta <code>git diff</code> y se leen ambas versiones antes de editar.</li>
          <li>Si el análisis no concluye, se aborta la operación: <code>git merge --abort</code>, <code>git rebase --abort</code> o <code>git cherry-pick --abort</code>.</li>
          <li>Abortar es una salida válida: la operación puede repetirse desde el inicio.</li>
        </ol>
      </div>
      <div class="col">
        <h3>Errores que deben evitarse</h3>
        <ul class="cl no">
          <li>Confirmar un archivo que todavía contiene <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>.</li>
          <li>Aplicar <code>-X ours</code> o <code>-X theirs</code> sin revisar los cambios.</li>
          <li>Eliminar <code>.git</code> para resolver un conflicto.</li>
          <li>Resolver sin analizar, solo para que el comando finalice.</li>
        </ul>
        <div class="minigold"><b>Cuestión central</b><span>¿Qué pretendía cada uno de los dos lados?</span></div>
      </div>
    </div>
    <div class="label">UBICACIÓN DE LA EVIDENCIA</div>
    <div class="repo"><b>Repositorio público</b><a href="${REPO}">${REPO.replace('https://', '')}</a><div class="tree"><span><code>ejercicios/</code> scripts y logs</span><span><code>build/real-captures/</code> capturas de consola</span><span><code>mapa-mental/</code> canvas HTML5 y PNG</span><span><code>documentacion/</code> este documento</span></div></div>
    <div class="label" style="margin-top:7mm">LISTA DE COMPROBACIÓN PREVIA AL COMMIT</div>
    <div class="checklist">
      <div><span>✓</span>Sin marcas pendientes <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code></div>
      <div><span>✓</span><code>git diff --check</code> sin errores</div>
      <div><span>✓</span>Pruebas del proyecto superadas</div>
      <div><span>✓</span>Cambio de cada lado comprendido</div>
    </div>
    <div class="closing"><p>Un conflicto bien resuelto deja el historial más claro, no más sucio.</p><span>10/10 ejercicios · 57 PASS · 0 FAIL</span></div>
    ${foot()}
  </section>`;
}

function html() {
  const pages = [cover(), pageIdeas(), pageMap(), pageMethod()];
  for (const e of exercises) pages.push(pageExercise(e));
  const chunks = glossaryChunks();
  chunks.forEach((c, i) => pages.push(pageGlossary(c, i, chunks.length)));
  pages.push(pageResults(), pageClose());
  const total = String(pages.length).padStart(2, '0');
  const body = pages
    .map((p, i) => p.replace('{{PAGE}}', String(i + 1).padStart(2, '0')))
    .join('')
    .replace(/\{\{TOTAL\}\}/g, total);

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Detección y resolución de conflictos de código · Guía simple</title><style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #1e293b; }
    .page { position: relative; width: 210mm; height: 297mm; overflow: hidden; page-break-after: always; background: #fff; padding: 15mm 18mm 20mm; }
    .page:last-child { page-break-after: auto; }
    .eyebrow { font-size: 8pt; letter-spacing: .2em; font-weight: 800; color: #0f766e; text-transform: uppercase; }
    h2 { margin: 1.6mm 0 2.4mm; font-size: 22pt; line-height: 1.12; letter-spacing: -.02em; color: #0f172a; }
    .sub { margin: 0 0 6mm; font-size: 10.4pt; line-height: 1.55; color: #475569; }
    .label { font-size: 7.4pt; letter-spacing: .16em; font-weight: 800; color: #64748b; text-transform: uppercase; margin: 0 0 2mm; }
    code { font-family: Consolas, 'Courier New', monospace; font-size: .92em; background: #f1f5f9; color: #0f172a; padding: .3mm 1.2mm; border-radius: 1.2mm; }
    .foot { position: absolute; left: 18mm; right: 18mm; bottom: 8mm; display: flex; justify-content: space-between; border-top: .3mm solid #e2e8f0; padding-top: 2mm; font-size: 7.4pt; color: #94a3b8; }

    /* Portada */
    .cover { background: #0b1220; color: #fff; padding: 17mm 18mm 14mm; }
    .cbar { position: absolute; left: 0; top: 0; width: 100%; height: 2.2mm; background: linear-gradient(90deg,#2dd4bf,#60a5fa 48%,#fb7185); }
    .cglow { position: absolute; border-radius: 50%; }
    .g1 { width: 170mm; height: 170mm; right: -60mm; top: -70mm; background: radial-gradient(circle, rgba(45,212,191,.20), rgba(45,212,191,0) 68%); }
    .g2 { width: 150mm; height: 150mm; left: -70mm; bottom: -60mm; background: radial-gradient(circle, rgba(251,113,133,.14), rgba(251,113,133,0) 70%); }
    .cgrid { position: absolute; inset: 0; opacity: .45; background-image: linear-gradient(rgba(148,163,184,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.10) 1px, transparent 1px); background-size: 11mm 11mm; }
    .ctop { position: relative; z-index: 2; }
    .ceyebrow { font-size: 8.5pt; letter-spacing: .24em; font-weight: 800; color: #5eead4; text-transform: uppercase; }
    .cover h1 { margin: 7mm 0 4mm; font-size: 52pt; line-height: .95; letter-spacing: -.03em; font-weight: 800; }
    .cover h1 em { font-style: normal; color: #2dd4bf; }
    .clead { margin: 0 0 8mm; font-size: 14pt; line-height: 1.35; color: #cbd5e1; }
    .clead b { color: #fbbf24; font-weight: 600; }
    .cstats { display: flex; gap: 4mm; }
    .cstats div { border: .3mm solid rgba(94,234,212,.35); background: rgba(15,118,110,.14); border-radius: 3mm; padding: 2.6mm 4mm; min-width: 30mm; }
    .cstats b { display: block; font-size: 18pt; line-height: 1; color: #fff; }
    .cstats span { display: block; margin-top: 1.4mm; font-size: 7.6pt; color: #99f6e4; }
    .clist { position: relative; z-index: 2; margin-top: 10mm; background: rgba(255,255,255,.035); border: .3mm solid rgba(148,163,184,.25); border-radius: 6mm; padding: 4mm 6mm 3mm; }
    .clist-t { font-size: 7.6pt; letter-spacing: .18em; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 1mm; }
    .crow { display: flex; align-items: center; gap: 4mm; padding: 3.1mm 0; border-bottom: .3mm solid rgba(148,163,184,.14); }
    .crow:last-child { border-bottom: 0; }
    .cn { width: 9mm; height: 9mm; border-radius: 50%; border: .4mm solid var(--c); color: var(--c); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11pt; flex: 0 0 9mm; }
    .crow b { display: block; font-size: 11.5pt; color: #fff; }
    .crow small { display: block; font-size: 8.4pt; color: #94a3b8; margin-top: .4mm; }
    .cnote { position: absolute; left: 18mm; bottom: 26mm; font-size: 9.6pt; color: #5eead4; z-index: 2; }
    .cfeatures { position: relative; z-index: 2; display: flex; flex-wrap: wrap; gap: 2.5mm; margin-top: 5mm; }
    .cfeatures span { font-size: 7.8pt; color: #cbd5e1; border: .3mm solid rgba(148,163,184,.30); border-radius: 10mm; padding: 1.6mm 3mm; background: rgba(255,255,255,.04); }
    .cindex { position: relative; z-index: 2; margin-top: 9mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.6mm 6mm; }
    .cindex div { display: flex; gap: 2.6mm; align-items: baseline; font-size: 8.6pt; color: #cbd5e1; border-top: .25mm solid rgba(148,163,184,.22); padding-top: 2.2mm; }
    .cindex b { color: #2dd4bf; font-size: 7.4pt; letter-spacing: .1em; }
    .cfoot { position: absolute; left: 18mm; right: 18mm; bottom: 12mm; display: flex; justify-content: space-between; font-size: 7.4pt; color: #64748b; z-index: 2; }

    /* Página 2 */
    .ideas { display: flex; gap: 4mm; margin: 2mm 0 8mm; }
    .idea { flex: 1; background: #f8fafc; border: .3mm solid #e2e8f0; border-radius: 3.5mm; padding: 5mm 5mm 4mm; }
    .inum { display: inline-flex; align-items: center; justify-content: center; width: 8.5mm; height: 8.5mm; border-radius: 50%; background: #ccfbf1; color: #0f766e; font-size: 10pt; font-weight: 800; }
    .idea h3 { margin: 2.6mm 0 1.6mm; font-size: 11.5pt; color: #0f172a; line-height: 1.25; }
    .idea p { margin: 0; font-size: 9pt; line-height: 1.5; color: #475569; }
    .gloss { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-bottom: 6mm; }
    .gloss div { background: #fff; border: .3mm solid #e2e8f0; border-left: 1mm solid #99f6e4; border-radius: 2.5mm; padding: 3.2mm 4mm; }
    .gloss b { display: block; font-size: 10pt; color: #0f172a; margin-bottom: .8mm; }
    .gloss span { font-size: 8.8pt; line-height: 1.45; color: #475569; }
    .need { background: #f0fdfa; border: .3mm solid #99f6e4; border-radius: 2.5mm; padding: 3.4mm 4mm; font-size: 9.2pt; color: #134e4a; margin-bottom: 4mm; }
    .example { display: grid; grid-template-columns: 1fr 1.18fr; gap: 4mm; margin: 0 0 4.5mm; }
    .excode { margin: 0; background: #0b1220; color: #e2e8f0; border-radius: 3mm; padding: 4mm 4.5mm; font: 8.2pt/1.7 Consolas, 'Courier New', monospace; white-space: pre; }
    .excode .mark { color: #fbbf24; font-weight: 700; }
    .excode .sep { color: #fb7185; font-weight: 700; }
    .extext { background: #f8fafc; border: .3mm solid #e2e8f0; border-radius: 3mm; padding: 3.4mm 4mm; }
    .extext b { display: block; font-size: 9.6pt; color: #0f172a; margin-bottom: 1mm; }
    .extext ul { margin: 0 0 2mm; padding-left: 4mm; }
    .extext li { font-size: 8.5pt; line-height: 1.5; color: #475569; margin-bottom: .9mm; }
    .extext p { margin: 0; font-size: 8.2pt; line-height: 1.45; color: #64748b; font-style: italic; }
    .gold { background: #0f172a; color: #e2e8f0; border-radius: 3mm; padding: 4.5mm 5mm; font-size: 9.6pt; line-height: 1.45; }
    .gold span { display: block; font-size: 7.4pt; letter-spacing: .16em; font-weight: 800; color: #5eead4; text-transform: uppercase; margin-bottom: 1.2mm; }

    /* Página 3: mapa */
    .mapframe { border: .3mm solid #dbe3ec; border-radius: 3.5mm; padding: 1.6mm; background: #fff; box-shadow: 0 3mm 8mm rgba(15,23,42,.10); margin: 1mm 0 4mm; }
    .mapframe img { display: block; width: 100%; border-radius: 2.4mm; }
    .mapgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4mm 4mm; }
    .mrow { display: flex; gap: 2.6mm; align-items: flex-start; background: #f8fafc; border: .3mm solid #e8eef5; border-radius: 2.4mm; padding: 2.4mm 3mm; }
    .mrow > span { width: 6.4mm; height: 6.4mm; flex: 0 0 6.4mm; border-radius: 50%; border: .35mm solid var(--c); color: var(--c); font-weight: 800; font-size: 8pt; display: flex; align-items: center; justify-content: center; }
    .mrow b { display: block; font-size: 9.4pt; color: #0f172a; }
    .mrow small { display: block; font-size: 8pt; line-height: 1.35; color: #64748b; margin-top: .3mm; }
    .mgold { background: #0f172a; border-radius: 2.4mm; padding: 3mm 3.6mm; color: #fff; }
    .mgold b { display: block; font-size: 8pt; letter-spacing: .12em; color: #5eead4; text-transform: uppercase; margin-bottom: .8mm; }
    .mgold span { font-size: 8.2pt; line-height: 1.4; color: #cbd5e1; }
    .mapnote { font-size: 8pt; color: #64748b; margin: 3mm 0 0; }

    /* Página 4: método */
    .msteps { display: flex; gap: 3mm; margin: 1mm 0 3mm; }
    .mstep { flex: 1; background: #f8fafc; border: .3mm solid #e2e8f0; border-top: 1.2mm solid var(--c); border-radius: 2.5mm; padding: 3.4mm 3.6mm; }
    .mn { display: inline-flex; align-items: center; justify-content: center; width: 7mm; height: 7mm; border-radius: 50%; background: #fff; border: .35mm solid var(--c); color: var(--c); font-weight: 800; font-size: 8.5pt; }
    .mstep h3 { margin: 2mm 0 1.2mm; font-size: 10.5pt; }
    .mstep p { margin: 0 0 2mm; font-size: 8pt; line-height: 1.4; color: #475569; min-height: 15mm; }
    .mstep code { font-size: 7.2pt; display: inline-block; }
    .prevent { display: flex; gap: 3mm; align-items: baseline; background: #f0fdf4; border: .3mm solid #bbf7d0; border-radius: 2.5mm; padding: 2.6mm 4mm; font-size: 8.6pt; color: #166534; margin-bottom: 6mm; }
    .prevent b { color: #15803d; white-space: nowrap; }
    .overview { width: 100%; border-collapse: collapse; margin-bottom: 3mm; }
    .overview th { background: #0f766e; color: #fff; font-size: 7.6pt; text-align: left; padding: 1.8mm 2.4mm; }
    .overview td { border-bottom: .25mm solid #e2e8f0; padding: 1.55mm 2.4mm; font-size: 7.9pt; color: #334155; }
    .overview tr:nth-child(even) td { background: #f8fafc; }
    .overview td.c { color: #0f766e; font-weight: 800; }
    .overview .ok { color: #047857; font-weight: 700; white-space: nowrap; }
    .usenote { background: #fffbeb; border-left: 1mm solid #f59e0b; border-radius: 2mm; padding: 2.8mm 3.6mm; font-size: 8.4pt; line-height: 1.45; color: #78350f; }
    .states { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
    .states div { background: #f8fafc; border: .3mm solid #e2e8f0; border-radius: 2.5mm; padding: 3mm 3.4mm; }
    .states b { display: block; font: 800 15pt Consolas, 'Courier New', monospace; color: #0f766e; margin-bottom: 1mm; }
    .states span { font-size: 8pt; line-height: 1.4; color: #475569; }
    .evid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
    .evid div { background: #f8fafc; border: .3mm solid #e2e8f0; border-radius: 3mm; padding: 3.4mm 4mm; }
    .evid span { display: inline-flex; align-items: center; justify-content: center; width: 6.2mm; height: 6.2mm; border-radius: 50%; background: #0f172a; color: #5eead4; font-size: 8pt; font-weight: 800; }
    .evid b { display: block; font-size: 9.4pt; color: #0f172a; margin: 1.6mm 0 1mm; }
    .evid p { margin: 0; font-size: 8pt; line-height: 1.45; color: #475569; }
    .checklist { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4mm 4mm; }
    .checklist div { display: flex; align-items: center; gap: 2.4mm; background: #f8fafc; border: .3mm solid #e2e8f0; border-radius: 2mm; padding: 2.4mm 3mm; font-size: 8.8pt; color: #334155; }
    .checklist span { width: 5.2mm; height: 5.2mm; flex: 0 0 5.2mm; border-radius: 50%; background: #16a34a; color: #fff; font-size: 7.4pt; font-weight: 800; display: flex; align-items: center; justify-content: center; }

    /* Ejercicios */
    .exhead { display: flex; justify-content: space-between; align-items: center; }
    .op { font-size: 7.4pt; font-weight: 700; letter-spacing: .08em; color: #0f766e; background: #f0fdfa; border: .3mm solid #99f6e4; border-radius: 20mm; padding: 1.2mm 3mm; text-transform: uppercase; }
    .extitle { font-size: 20pt; margin: 1.4mm 0 4mm; }
    .what { margin: 0 0 4mm; font-size: 9.6pt; line-height: 1.55; color: #334155; }
    .steps { display: flex; flex-direction: column; gap: 1.8mm; margin-bottom: 3.6mm; }
    .step { display: flex; gap: 2.6mm; background: #f8fafc; border: .3mm solid #e8eef5; border-radius: 2.4mm; padding: 2.1mm 3mm; }
    .sn { width: 6mm; height: 6mm; flex: 0 0 6mm; border-radius: 50%; background: #0f172a; color: #fff; font-size: 7.8pt; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-top: .3mm; }
    .st p { margin: 0 0 .8mm; font-size: 9pt; line-height: 1.4; color: #334155; }
    .st code { font-size: 7.8pt; }
    .result { display: flex; align-items: center; gap: 3mm; background: #f0fdf4; border: .3mm solid #bbf7d0; border-left: 1.2mm solid #16a34a; border-radius: 2.4mm; padding: 2.4mm 3.4mm; margin-bottom: 3.4mm; }
    .rnum { text-align: center; line-height: 1; }
    .rnum b { display: block; font-size: 17pt; font-weight: 800; color: #166534; }
    .rnum span { display: block; font-size: 6.4pt; letter-spacing: .12em; font-weight: 800; color: #16a34a; margin-top: .6mm; }
    .rnum.zero b { color: #475569; }
    .rnum.zero span { color: #94a3b8; }
    .rdiv { width: .3mm; height: 9mm; background: #bbf7d0; }
    .rdesc { font-size: 8.6pt; line-height: 1.4; color: #166534; }
    .shot { text-align: center; }
    .shot img { display: block; width: 144mm; margin: 0 auto; border: .3mm solid #1e293b; border-radius: 2mm; background: #0b1220; }
    .cap { display: flex; justify-content: space-between; width: 144mm; margin: 1.4mm auto 0; font-size: 7.2pt; color: #94a3b8; }

    /* Diccionario de comandos */
    .pglo .extitle { font-size: 17pt; margin: 0 0 1.8mm; }
    .gintro { margin: 0 0 2.4mm; font-size: 8.4pt; line-height: 1.45; color: #475569; }
    .gintro b { color: #0f766e; }
    .gtable { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 7.3pt; }
    .gtable th { background: #0f766e; color: #fff; text-align: left; padding: 1.5mm 2mm; font-size: 6.9pt; letter-spacing: .1em; text-transform: uppercase; }
    .gtable td { padding: 1.3mm 2mm; border-bottom: .25mm solid #e2e8f0; vertical-align: top; line-height: 1.38; color: #475569; }
    .gtable td.gc { padding-right: 3mm; }
    .gtable td.gc code { font-family: Consolas, 'Courier New', monospace; font-size: 7.5pt; font-weight: 700; color: #0f766e; word-break: break-word; }
    .gtable td b { color: #0f172a; }
    .gtable tr.ghead td { background: #f0fdfa; color: #0f766e; font-weight: 800; font-size: 7.2pt; letter-spacing: .05em; text-transform: uppercase; padding: 1.8mm 2mm; border-bottom: .4mm solid #99f6e4; }

    /* Páginas de evidencia: secuencia completa de la consola */    .pev { padding-bottom: 18mm; }
    .evlead { margin: 0 0 3.2mm; font-size: 8.4pt; line-height: 1.45; color: #475569; background: #f8fafc; border: .3mm solid #e8eef5; border-radius: 2.4mm; padding: 2.4mm 3.2mm; }
    .evlead b { color: #0f172a; }
    .evwrap { display: flex; flex-direction: column; gap: 3.2mm; }
    .ev { margin: 0; }
    .ev img { display: block; width: 112mm; margin: 0 auto; border: .3mm solid #1e293b; border-radius: 2mm; background: #0b1220; }
    .ev figcaption { display: flex; justify-content: space-between; width: 112mm; margin: 1.2mm auto 0; font-size: 6.9pt; color: #94a3b8; }
    .ev figcaption b { color: #0f766e; font-weight: 700; }

    /* Resultados */
    .bigstats { display: flex; gap: 3mm; margin: 2mm 0 6mm; }
    .bigstats div { flex: 1; background: #0f172a; color: #fff; border-radius: 3mm; padding: 4mm; text-align: center; }
    .bigstats b { display: block; font-size: 24pt; line-height: 1; color: #2dd4bf; }
    .bigstats .z b { color: #fbbf24; }
    .bigstats span { display: block; margin-top: 1.4mm; font-size: 7.8pt; color: #cbd5e1; }
    .results { width: 100%; border-collapse: collapse; }
    .results th { background: #0f766e; color: #fff; font-size: 7.8pt; text-align: left; padding: 2mm 2.6mm; }
    .results td { border-bottom: .25mm solid #e2e8f0; padding: 2.05mm 2.6mm; font-size: 8.8pt; color: #334155; }
    .results tr:nth-child(even) td { background: #f8fafc; }
    .results td.c { color: #0f766e; font-weight: 800; }
    .results td.num { font-weight: 700; color: #166534; }
    .results td.ok { color: #047857; font-weight: 700; }
    .oknote { background: #f0fdf4; border: .3mm solid #bbf7d0; border-radius: 2.5mm; padding: 3.2mm 4mm; font-size: 8.8pt; line-height: 1.5; color: #166534; margin: 5mm 0 4mm; }
    .tags { display: flex; flex-wrap: wrap; gap: 2mm; }
    .tags span { font-size: 8pt; font-weight: 600; color: #0f766e; background: #f0fdfa; border: .3mm solid #99f6e4; border-radius: 10mm; padding: 1.2mm 3mm; }

    /* Cierre */
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-bottom: 7mm; }
    .col h3 { margin: 0 0 3mm; font-size: 13pt; color: #0f172a; }
    .cl { margin: 0; padding-left: 5mm; }
    .cl li { font-size: 9.2pt; line-height: 1.5; color: #334155; margin-bottom: 2.4mm; }
    .cl.no { list-style: none; padding-left: 0; }
    .cl.no li { position: relative; padding-left: 5.5mm; }
    .cl.no li:before { content: '×'; position: absolute; left: 0; top: -.2mm; color: #e11d48; font-weight: 800; font-size: 12pt; }
    .minigold { background: #fffbeb; border: .3mm solid #fde68a; border-radius: 2.5mm; padding: 3mm 4mm; margin-top: 4mm; }
    .minigold b { display: block; font-size: 7.4pt; letter-spacing: .14em; color: #b45309; text-transform: uppercase; margin-bottom: 1mm; }
    .minigold span { font-size: 9.4pt; color: #78350f; font-weight: 600; }
    .repo { background: #0b1220; border-radius: 3mm; padding: 4mm 5mm; color: #e2e8f0; }
    .repo > b { display: block; font-size: 7.4pt; letter-spacing: .16em; color: #5eead4; text-transform: uppercase; margin-bottom: 1.2mm; }
    .repo > a { display: block; font-size: 10.5pt; color: #fff; text-decoration: none; margin-bottom: 3.4mm; }
    .tree { display: flex; flex-wrap: wrap; gap: 1.6mm 5mm; }
    .tree span { font-size: 8pt; color: #94a3b8; }
    .tree code { background: rgba(94,234,212,.10); color: #5eead4; font-size: 7.6pt; }
    .closing { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 7mm; border-top: .3mm solid #e2e8f0; padding-top: 4mm; }
    .closing p { margin: 0; font-size: 11pt; color: #0f172a; font-weight: 600; }
    .closing span { font-size: 8pt; color: #0f766e; font-weight: 700; }
  </style></head><body>
    ${body}
  </body></html>`;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const docHtml = html();
  fs.writeFileSync(path.join(BUILD, 'doc-simple.html'), docHtml, 'utf8');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });
  await page.setContent(docHtml, { waitUntil: 'load' });

  const overflow = await page.evaluate(() => {
    return [...document.querySelectorAll('.page')].map((p, i) => {
      const limit = p.getBoundingClientRect().bottom;
      let max = 0;
      [...p.children].forEach(c => {
        const r = c.getBoundingClientRect();
        if (r.height > 0) max = Math.max(max, r.bottom - p.getBoundingClientRect().top);
      });
      return { page: i + 1, contentBottom: Math.round(max), pageHeight: Math.round(p.getBoundingClientRect().height), overflow: max > p.getBoundingClientRect().height + 1 };
    });
  });
  console.log(JSON.stringify(overflow.filter(o => o.overflow)));

  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();
  console.log('PDF:', OUT_PDF, (fs.statSync(OUT_PDF).size / 1024 / 1024).toFixed(2) + ' MB');
})();
