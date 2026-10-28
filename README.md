# Conflictos de código en Git — Ejercicios verificados

Documentación y evidencia de los **10 ejercicios prácticos** de la guía de conflictos de Git. Cada ejercicio se ejecutó en un repositorio temporal real, se resolvió y se validó con comprobaciones automáticas.

> **Resultado global:** 10/10 ejercicios ejecutados, **57 comprobaciones PASS y 0 FAIL**.
>
> **Repositorio:** <https://github.com/75749748-blip/conflictos-git-ejercicios>
>
> **Autor:** Ivan · Octubre 2026
>
> **Entorno:** Windows 11 · Git 2.56.0.windows.1 · Git Bash · GitHub CLI 2.102.0

## Contenido

| Documento | Enlace |
|---|---|
| Guía completa (Markdown) | [Guia-Conflictos-Git.md](Guia-Conflictos-Git.md) |
| Guía completa (PDF) | [Guia-Conflictos-Git.pdf](Guia-Conflictos-Git.pdf) |
| Presentación animada (PPTX) | [Conflictos-Git-Presentacion.pptx](Conflictos-Git-Presentacion.pptx) |
| Presentación animada (PDF) | [Conflictos-Git-Presentacion.pdf](Conflictos-Git-Presentacion.pdf) |
| **Guía simple (PDF)** | **[documentacion/Conflictos-Git-Guia-Simple.pdf](documentacion/Conflictos-Git-Guia-Simple.pdf)** |
| Mapa mental (Canvas HTML5) | [mapa-mental/mapa-mental.html](mapa-mental/mapa-mental.html) · [PNG](mapa-mental/mapa-mental.png) |
| Documentación técnica con capturas | [Documentacion-Ejercicios-Conflictos-Git.pdf](documentacion/Documentacion-Ejercicios-Conflictos-Git.pdf) |
| Capturas de las sesiones | [capturas/](capturas/) |
| Scripts y logs | [ejercicios/](ejercicios/) |

## Los 10 ejercicios

| # | Ejercicio | Qué se probó | Script | Log | Resultado |
|---|---|---|---|---|---|
| 01 | Conflicto simple en una línea | `UU`, marcadores, conservar ambos cambios | [01](ejercicios/01-conflicto-simple.sh) | [log](ejercicios/logs/01-conflicto-simple.log) | 5 PASS · 0 FAIL |
| 02 | Varios hunks | Dos regiones, decisiones independientes | [02](ejercicios/02-varios-hunks.sh) | [log](ejercicios/logs/02-varios-hunks.log) | 6 PASS · 0 FAIL |
| 03 | Modificar/eliminar | `UD`, conservar y eliminar | [03](ejercicios/03-modificar-eliminar.sh) | [log](ejercicios/logs/03-modificar-eliminar.log) | 4 PASS · 0 FAIL |
| 04 | Añadir/añadir | `AA`, unificar dos archivos nuevos | [04](ejercicios/04-add-add.sh) | [log](ejercicios/logs/04-add-add.log) | 5 PASS · 0 FAIL |
| 05 | Binario | `--theirs`, sin marcadores | [05](ejercicios/05-binario.sh) | [log](ejercicios/logs/05-binario.log) | 4 PASS · 0 FAIL |
| 06 | Rebase | `ours`/`theirs` invertidos, historia lineal | [06](ejercicios/06-rebase.sh) | [log](ejercicios/logs/06-rebase.log) | 5 PASS · 0 FAIL |
| 07 | Cherry-pick | Aplicar un commit concreto | [07](ejercicios/07-cherry-pick.sh) | [log](ejercicios/logs/07-cherry-pick.log) | 5 PASS · 0 FAIL |
| 08 | Stash pop | `Updated upstream` / `Stashed changes` | [08](ejercicios/08-stash.sh) | [log](ejercicios/logs/08-stash.log) | 4 PASS · 0 FAIL |
| 09 | Inspección y mergetool | Etapas `:1: :2: :3:`, `diff3`, herramienta | [09](ejercicios/09-inspeccion-mergetool.sh) | [log](ejercicios/logs/09-inspeccion-mergetool.log) | 4 PASS · 0 FAIL |
| 10 | Estrategias y automatización | `-X ours`, `-s ours`, `rerere`, drivers | [10](ejercicios/10-estrategias.sh) | [log](ejercicios/logs/10-estrategias.log) | 15 PASS · 0 FAIL |

## Presentación

La presentación tiene **20 diapositivas en 16:9**, con transiciones, animaciones de entrada, notas del expositor y los dos mapas de la guía. Está pensada para una exposición de 15–20 minutos.

- `Conflictos-Git-Presentacion.pptx`: versión editable con animaciones.
- `Conflictos-Git-Presentacion.pdf`: versión lista para proyectar o imprimir.
- Fuente: `build/make-ppt.js`; animación aplicada con `build/animate-ppt.ps1`.

## Cómo reproducirlo

Requisitos: Git para Windows (Git Bash) y un shell compatible.

```bash
cd ejercicios
bash run-all.sh
```

El script:

1. Crea un repositorio temporal por ejercicio en `.work/` (ignorado por Git).
2. Configura un usuario local de práctica (`Alumno <alumno@example.com>`).
3. Provoca el conflicto real, lo resuelve y ejecuta las validaciones.
4. Guarda la salida completa en `ejercicios/logs/`.
5. Devuelve código 0 solo si todas las comprobaciones pasan.

Para ejecutar uno solo:

```bash
cd ejercicios
bash 06-rebase.sh
```

## Evidencia

- **10 capturas reales de consola** en [`build/real-captures/`](build/real-captures/): se tomaron de la ventana de comandos del equipo del autor después de ejecutar cada script. La guía simple usa solo estas capturas.
- **23 capturas de terminal** en [`capturas/`](capturas/): versión ilustrada de la documentación técnica, generada desde los logs con `build/make-captures.js`.
- Cada log contiene la salida de Git, los comandos ejecutados y el bloque `RESULTADO: N PASS, 0 FAIL`.
- El **mapa mental** está dibujado con Canvas HTML5 en [`mapa-mental/mapa-mental.html`](mapa-mental/mapa-mental.html); el PNG se exporta a 3600 × 2500 px.
- La guía simple reúne el mapa, el método de 4 pasos y una página por ejercicio con su captura real.

## Estructura

```text
.
├── Guia-Conflictos-Git.md
├── Guia-Conflictos-Git.pdf
├── Conflictos-Git-Presentacion.pptx
├── Conflictos-Git-Presentacion.pdf
├── documentacion/
│   ├── Conflictos-Git-Guia-Simple.pdf
│   └── Documentacion-Ejercicios-Conflictos-Git.pdf
├── mapa-mental/
│   ├── mapa-mental.html
│   └── mapa-mental.png
├── build/real-captures/
│   ├── 01.png … 10.png
│   ├── run-01.cmd … run-10.cmd
│   └── capture-all.ps1
├── capturas/
│   ├── 01-conflicto-simple/
│   ├── ...
│   └── 10-estrategias/
├── ejercicios/
│   ├── lib.sh
│   ├── 01-conflicto-simple.sh
│   ├── ...
│   ├── 10-estrategias.sh
│   ├── run-all.sh
│   └── logs/
└── build/
    ├── make-pdf.js
    ├── make-captures.js
    ├── make-doc.js
    ├── make-doc-simple.js
    ├── make-canvas-map.js
    ├── make-ppt.js
    ├── animate-ppt.ps1
    ├── exercises-data.js
    └── mapa-mental.png / mapa-conceptual-compact.png
```

## Nota sobre los repositorios de práctica

Los repositorios temporales de cada ejercicio se crean dentro de `.work/` y no se suben. Lo que se versiona es el **script reproducible**, el **log de la ejecución** y las **capturas**. Así el docente puede repetir cada práctica desde cero sin depender de estados locales.
