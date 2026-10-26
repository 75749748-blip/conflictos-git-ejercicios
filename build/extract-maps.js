const fs = require('fs');
const md = fs.readFileSync('C:/Users/gambo/Documents/Git-Conflictos/Guia-Conflictos-Git.md','utf8');
const blocks = [...md.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)].map(m => m[1].replace(/\r/g,''));
console.log('mermaid blocks:', blocks.length);
fs.writeFileSync('C:/Users/gambo/Documents/Git-Conflictos/build/mapa-mental.mmd', blocks[0], 'utf8');
fs.writeFileSync('C:/Users/gambo/Documents/Git-Conflictos/build/mapa-conceptual-full.mmd', blocks[1], 'utf8');
const compact = `flowchart LR
  A["Dos ramas divergen"] --> B["Integración<br/>merge · rebase · pick · stash"]
  B --> C{"¿Se solapan<br/>los cambios?"}
  C -->|"No"| D["Auto-merge"]
  C -->|"Sí"| E["CONFLICTO"]
  E --> F["Diagnóstico<br/>:1: :2: :3:"]
  F --> G["Resolución<br/>manual · ours/theirs · mergetool"]
  G --> H["Validar<br/>diff --check + tests"]
  H --> I["Cerrar<br/>commit / --continue"]
  E --> J["Abortar<br/>--abort"]
  G -.-> K["rerere"]
  D --> I
`;
fs.writeFileSync('C:/Users/gambo/Documents/Git-Conflictos/build/mapa-conceptual.mmd', compact, 'utf8');