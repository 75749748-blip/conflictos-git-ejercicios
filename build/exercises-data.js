// Metadata shared by the screenshot generator and the documentation PDF.
// Every shot is built from lines that were actually produced by the exercise
// script; no terminal output is invented.

const REPO_URL = 'https://github.com/75749748-blip/conflictos-git-ejercicios';

const exercises = [
  {
    n: '01',
    slug: '01-conflicto-simple',
    title: 'Conflicto simple en una línea',
    short: 'Marcadores, estado UU y resolución conservando ambos cambios.',
    difficulty: 'Básica',
    operation: 'merge',
    objective: 'Identificar un conflicto UU, leer los marcadores y resolver conservando los dos cambios.',
    lesson: 'Git detiene la integración porque las dos ramas modificaron la misma línea. La decisión es humana: aquí se conservan ambas intenciones.',
    commands: [
      'git switch main',
      'git merge feature',
      'git status --short',
      'cat app.txt',
      'git add app.txt',
      'git commit -m "merge: integra feature conservando ambos cambios"'
    ],
    shots: [
      {
        id: '01-conflicto',
        label: 'Detección del conflicto',
        sections: ['CONFLICTO'],
        include: ['git merge feature', 'git status --short', 'git show :1:app.txt', 'git show :2:app.txt', 'git show :3:app.txt', 'cat app.txt'],
        checks: false
      },
      {
        id: '02-resolucion',
        label: 'Resolución y validación',
        sections: ['RESOLUCION', 'VALIDACION'],
        include: ['cat app.txt', 'git add app.txt', 'git commit -m', 'git status --short', 'git diff --check', 'git log --oneline', 'git show HEAD:app.txt'],
        checks: true
      }
    ]
  },
  {
    n: '02',
    slug: '02-varios-hunks',
    title: 'Varios hunks en un mismo archivo',
    short: 'Dos regiones de conflicto y una decisión distinta en cada una.',
    difficulty: 'Intermedia',
    operation: 'merge',
    objective: 'Resolver dos bloques de conflicto de forma independiente, con una decisión distinta en cada uno.',
    lesson: 'Un archivo puede contener varios conflictos. Se resuelven por separado: no conviene aplicar --ours o --theirs a todo el archivo.',
    commands: [
      'git merge feature',
      'git status --short',
      'git diff',
      'cat config.ini',
      'git add config.ini',
      'git commit -m "merge: combina nombre y elige nivel debug"'
    ],
    shots: [
      {
        id: '01-conflicto',
        label: 'Dos hunks en conflicto',
        sections: ['CONFLICTO'],
        include: ['git merge feature', 'git status --short', 'git diff'],
        checks: false
      },
      {
        id: '02-resolucion',
        label: 'Resolución por bloque y validación',
        sections: ['RESOLUCION', 'VALIDACION'],
        include: ['cat config.ini', 'git add config.ini', 'git commit -m', 'git status --short', 'git diff --check', 'git show HEAD:config.ini'],
        checks: true
      }
    ]
  },
  {
    n: '03',
    slug: '03-modificar-eliminar',
    title: 'Conflicto modificar/eliminar',
    short: 'UD: una rama editó el archivo y la otra lo eliminó.',
    difficulty: 'Intermedia',
    operation: 'merge',
    objective: 'Decidir entre conservar un archivo editado o aceptar su eliminación, probando las dos soluciones.',
    lesson: 'El estado UD obliga a una decisión de producto: ¿el archivo debe existir? Se probaron conservar y eliminar, cada una en su propio merge.',
    commands: [
      'git merge feature',
      'git status --short',
      'cat notas.txt',
      'git add notas.txt          # Solución A: conservar',
      'git rm notas.txt           # Solución B: eliminar',
      'git commit -m "merge: acepta la eliminacion de notas.txt"'
    ],
    shots: [
      {
        id: '01-conflicto',
        label: 'Conflicto UD y solución A: conservar',
        sections: ['CONFLICTO', 'RESOLUCION A - CONSERVAR'],
        include: ['git merge feature', 'git status --short', 'git status', 'cat notas.txt', 'git log --merge', 'git add notas.txt', 'git commit -m "merge: conserva', 'cat notas.txt'],
        checks: false
      },
      {
        id: '02-resolucion',
        label: 'Solución B: eliminar, y validación',
        sections: ['RESOLUCION B - ELIMINAR', 'VALIDACION'],
        include: ['git reset --hard', 'git merge feature', 'git status --short', 'git rm notas.txt', 'git commit -m "merge: acepta', 'bash -c "if', 'git log --oneline', 'git diff --check'],
        checks: true
      }
    ]
  },
  {
    n: '04',
    slug: '04-add-add',
    title: 'Conflicto añadir/añadir',
    short: 'AA: dos ramas crearon el mismo archivo con contenidos distintos.',
    difficulty: 'Intermedia',
    operation: 'merge',
    objective: 'Combinar dos archivos nuevos creados de forma independiente con el mismo nombre.',
    lesson: 'En un AA no hay una base común para el archivo. Git muestra los dos documentos completos y deja la unificación al criterio humano.',
    commands: [
      'git merge feature',
      'git status --short          # AA CHANGELOG.md',
      'git ls-files -u',
      'cat CHANGELOG.md',
      'git add CHANGELOG.md',
      'git commit -m "merge: unifica changelog con las entradas 1.1.0 y 1.0.1"'
    ],
    shots: [
      {
        id: '01-conflicto',
        label: 'Estado AA y las dos versiones',
        sections: ['CONFLICTO'],
        include: ['git merge feature', 'git status --short', 'git diff', 'cat CHANGELOG.md', 'git ls-files -u'],
        checks: false
      },
      {
        id: '02-resolucion',
        label: 'Changelog unificado y validación',
        sections: ['RESOLUCION', 'VALIDACION'],
        include: ['cat CHANGELOG.md', 'git add CHANGELOG.md', 'git commit -m', 'git status --short', 'git diff --check', 'git show HEAD:CHANGELOG.md'],
        checks: true
      }
    ]
  },
  {
    n: '05',
    slug: '05-binario',
    title: 'Conflicto binario',
    short: 'Sin marcadores: Git no puede fusionar el contenido; se elige una versión.',
    difficulty: 'Intermedia',
    operation: 'merge',
    objective: 'Resolver un archivo tratado como binario, donde no existen marcadores de texto.',
    lesson: 'En binarios no se edita el conflicto: se elige una versión completa. Para conservar ambas, hay que renombrar una antes de integrar.',
    commands: [
      'git merge feature',
      'git status --short          # UU logo.bin',
      'git diff                   # Cannot merge binary files',
      'git checkout --theirs -- logo.bin',
      'git add logo.bin',
      'git commit -m "merge: usa la version FEATURE del logo binario"'
    ],
    shots: [
      {
        id: '01-conflicto',
        label: 'Conflicto binario sin marcadores',
        sections: ['CONFLICTO'],
        include: ['git merge feature', 'git status --short', 'git diff', 'cat logo.bin'],
        checks: false
      },
      {
        id: '02-resolucion',
        label: 'Elección de theirs y validación',
        sections: ['RESOLUCION', 'VALIDACION'],
        include: ['git checkout --theirs', 'cat logo.bin', 'git add logo.bin', 'git commit -m', 'git status --short', 'git diff --check', 'git log --oneline'],
        checks: true
      }
    ]
  },
  {
    n: '06',
    slug: '06-rebase',
    title: 'Conflicto durante un rebase',
    short: 'Ours y theirs se invierten: ours es la base, theirs es tu commit.',
    difficulty: 'Avanzada',
    operation: 'rebase',
    objective: 'Resolver un conflicto durante un rebase y comprobar que la historia queda lineal, sin merge commit.',
    lesson: 'En rebase, ours (:2:) es la rama base y theirs (:3:) es el commit que se está reaplicando. La respuesta es la inversa de un merge.',
    commands: [
      'git switch feature',
      'git rebase main',
      'git status',
      'git show :2:version.txt     # main (ours en rebase)',
      'git show :3:version.txt     # feature (theirs en rebase)',
      'git add version.txt',
      'GIT_EDITOR=true git rebase --continue'
    ],
    shots: [
      {
        id: '01-conflicto',
        label: 'Rebase detenido y mapa invertido',
        sections: ['CONFLICTO'],
        include: ['git rebase main', 'git status', 'git show :1:version.txt', 'git show :2:version.txt', 'git show :3:version.txt', 'cat version.txt'],
        checks: false
      },
      {
        id: '02-resolucion',
        label: 'Continuación y validación lineal',
        sections: ['RESOLUCION', 'VALIDACION'],
        include: ['cat version.txt', 'git add version.txt', 'env GIT_EDITOR', 'git status --short', 'git log --oneline', 'git show HEAD:version.txt'],
        checks: true
      }
    ]
  },
  {
    n: '07',
    slug: '07-cherry-pick',
    title: 'Conflicto en un cherry-pick',
    short: 'Aplicar un commit concreto de main sobre feature y resolver.',
    difficulty: 'Avanzada',
    operation: 'cherry-pick',
    objective: 'Aplicar un commit concreto de otra rama y resolver el conflicto que genera.',
    lesson: 'Cherry-pick reaplica un cambio sobre otra base. El conflicto aparece porque el parche ya no encaja; se resuelve y se continúa con --continue.',
    commands: [
      'HASH=$(git rev-parse main)',
      'git switch feature',
      'git cherry-pick $HASH',
      'git status',
      'git add app.txt',
      'GIT_EDITOR=true git cherry-pick --continue'
    ],
    shots: [
      {
        id: '01-conflicto',
        label: 'El commit de main no encaja en feature',
        sections: ['CONFLICTO'],
        include: ['git cherry-pick', 'git status', 'git show :1:app.txt', 'git show :2:app.txt', 'git show :3:app.txt', 'cat app.txt'],
        checks: false
      },
      {
        id: '02-resolucion',
        label: 'Continuación y validación',
        sections: ['RESOLUCION', 'VALIDACION'],
        include: ['cat app.txt', 'git add app.txt', 'env GIT_EDITOR', 'git status --short', 'git log --oneline', 'git show HEAD:app.txt'],
        checks: true
      }
    ]
  },
  {
    n: '08',
    slug: '08-stash',
    title: 'Conflicto al aplicar un stash',
    short: 'Updated upstream / Stashed changes: el WIP choca con un commit nuevo.',
    difficulty: 'Intermedia',
    operation: 'stash pop',
    objective: 'Recuperar trabajo guardado temporalmente cuando el árbol ya cambió.',
    lesson: 'Si stash pop conflictúa, el stash no se elimina. Se resuelve, se marca el archivo, se hace drop y se confirma el resultado.',
    commands: [
      'git stash push -m "wip: linea 2"',
      'git commit -am "main: cambia la linea 2"',
      'git stash pop',
      'git status --short',
      'git add app.txt',
      'git stash drop',
      'git commit -m "feat: recupera el WIP combinado con el cambio de main"'
    ],
    shots: [
      {
        id: '01-conflicto',
        label: 'Stash pop con conflicto',
        sections: ['CONFLICTO'],
        include: ['git stash pop', 'git status --short', 'git stash list', 'cat app.txt'],
        checks: false
      },
      {
        id: '02-resolucion',
        label: 'Resolución, drop y validación',
        sections: ['RESOLUCION', 'VALIDACION'],
        include: ['cat app.txt', 'git add app.txt', 'git stash drop', 'git commit -m', 'git status --short', 'git stash list', 'git show HEAD:app.txt', 'git log --oneline'],
        checks: true
      }
    ]
  },
  {
    n: '09',
    slug: '09-inspeccion-mergetool',
    title: 'Inspección forense y mergetool',
    short: 'Etapas :1: :2: :3:, diff3, git log --merge y una herramienta de merge.',
    difficulty: 'Intermedia',
    operation: 'merge + mergetool',
    objective: 'Usar las etapas del índice, el estilo diff3, git log --merge y una herramienta de merge para resolver con información completa.',
    lesson: 'Antes de editar, reconstruye las tres versiones. La base (|||||||) explica qué cambió cada lado y evita elegir a ciegas.',
    commands: [
      'git merge feature',
      'git show :1:config.txt    # base',
      'git show :2:config.txt    # ours',
      'git show :3:config.txt    # theirs',
      'git log --merge --oneline -- config.txt',
      'git mergetool --tool=resolver',
      'git commit -m "merge: resuelve config.txt con mergetool"'
    ],
    shots: [
      {
        id: '01-conflicto',
        label: 'Inspección de base, ours y theirs',
        sections: ['CONFLICTO'],
        include: ['git merge feature', 'git status', 'git show :1:config.txt', 'git show :2:config.txt', 'git show :3:config.txt', 'git log --merge', 'git diff --base', 'cat config.txt'],
        checks: false
      },
      {
        id: '02-mergetool',
        label: 'Resolución con una herramienta de merge',
        sections: ['MERGECOLL - HERRAMIENTA PERSONALIZADA'],
        include: ['cat resolver.sh', 'git config merge.tool', 'git config mergetool.prompt', 'git config mergetool.resolver.cmd', 'git config --get', 'git mergetool', 'git status --short', 'cat config.txt'],
        checks: false
      },
      {
        id: '03-resolucion',
        label: 'Cierre y validación',
        sections: ['RESOLUCION', 'VALIDACION'],
        include: ['git commit -m', 'git status --short', 'git diff --check', 'git show HEAD:config.txt', 'git log --oneline'],
        checks: true
      }
    ]
  },
  {
    n: '10',
    slug: '10-estrategias',
    title: 'Estrategias automáticas, rerere y merge drivers',
    short: '-X ours, -s ours, rerere, merge=union y merge=ours, con resultados verificados.',
    difficulty: 'Avanzada',
    operation: 'estrategias',
    objective: 'Comparar las herramientas que reducen el trabajo manual y entender qué se conserva y qué se descarta en cada una.',
    lesson: 'Ninguna estrategia automática avisa de lo que descartó. -X ours fusiona; -s ours ignora el árbol ajeno; union concatena; ours oculta cambios.',
    commands: [
      'git merge -X ours feature       # conserva hunks no conflictivos',
      'git merge -s ours feature       # descarta todo el árbol de feature',
      'git config rerere.enabled true',
      'git config merge.ours.driver true',
      'git merge feature-union         # .gitattributes: merge=union'
    ],
    shots: [
      {
        id: '01-estrategias',
        label: 'Parte A: -X ours frente a -s ours',
        sections: ['PARTE A - -X ours frente a -s ours'],
        include: ['git merge --no-edit -X ours', 'cat app.txt', 'ls nueva.txt', 'git show --stat --oneline HEAD', 'git reset --hard', 'git merge --no-edit -s ours', 'cat app.txt', 'if [ -e nueva', 'git show --stat --oneline HEAD', 'git diff HEAD~1'],
        checks: false
      },
      {
        id: '02-rerere',
        label: 'Parte B: rerere reutiliza la resolución',
        sections: ['PARTE B - rerere'],
        include: ['git merge feature', 'cat app.txt', 'git add app.txt', 'git rerere status', 'git commit -m "merge: resolucion', 'git reset --hard', 'git status --short', 'git commit -m "merge: rerere', 'git log --oneline'],
        checks: false
      },
      {
        id: '03-drivers',
        label: 'Parte C: merge=union y merge=ours',
        sections: ['PARTE C - merge=union y merge=ours'],
        include: ['git merge --no-edit feature-union', 'cat deps.lock', 'git check-attr merge deps.lock', 'git merge --no-edit feature-ours', 'cat config.ours', 'git check-attr merge config.ours'],
        checks: false
      },
      {
        id: '04-validacion',
        label: 'Validación final de las tres partes',
        sections: ['VALIDACION FINAL'],
        include: ['git status --short', 'git diff --check', 'git log --oneline'],
        checks: true
      }
    ]
  }
];

module.exports = { exercises, REPO_URL };
