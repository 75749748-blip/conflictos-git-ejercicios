# Detección y resolución de conflictos de código

Documentación de los **10 ejercicios prácticos** sobre conflictos de Git. Cada ejercicio se ejecutó en un repositorio temporal, se resolvió y se validó con comprobaciones automáticas. La entrega principal es la **guía de 19 páginas**; el anexo técnico, la presentación y el repositorio reúnen la evidencia.

> **Resultado global:** 10/10 ejercicios ejecutados, **57 comprobaciones PASS y 0 FAIL**.
>
> **Repositorio:** <https://github.com/75749748-blip/conflictos-git-ejercicios>
>
> **Autor:** Ivan &lt;75749748@iegb.edu.pe&gt; · Octubre 2026
>
> **Entorno:** equipo `IVAN` · Windows 11 · Git 2.56.0.windows.1 · Git Bash · GitHub CLI 2.102.0

## Contenido

| Documento | Enlace |
|---|---|
| **Guía principal (PDF, 19 páginas)** | **[documentacion/Conflictos-Git-Guia-Simple.pdf](documentacion/Conflictos-Git-Guia-Simple.pdf)** |
| Anexo técnico (PDF, 13 páginas) | [documentacion/Documentacion-Ejercicios-Conflictos-Git.pdf](documentacion/Documentacion-Ejercicios-Conflictos-Git.pdf) |
| Mapa mental (Canvas HTML5) | [mapa-mental/mapa-mental.html](mapa-mental/mapa-mental.html) · [PNG](mapa-mental/mapa-mental.png) · [vista documentada](mapa-mental/vista-documentada.png) |
| Presentación (PPTX) | [Conflictos-Git-Presentacion.pptx](Conflictos-Git-Presentacion.pptx) |
| Presentación (PDF) | [Conflictos-Git-Presentacion.pdf](Conflictos-Git-Presentacion.pdf) |
| Guía extensa (Markdown) | [Guia-Conflictos-Git.md](Guia-Conflictos-Git.md) |
| Guía extensa (PDF, consulta) | [Guia-Conflictos-Git.pdf](Guia-Conflictos-Git.pdf) |
| Galería HTML de los 10 ejercicios | [build/galeria-ejercicios.html](build/galeria-ejercicios.html) |
| Capturas de las sesiones | [build/real-captures/seq/](build/real-captures/seq/) |
| Scripts y logs | [ejercicios/](ejercicios/) |

## Estructura de la guía

1. **Marco conceptual**: qué es un conflicto, por qué Git se detiene y cómo se leen las marcas.
2. **Metodología**: modelo de resolución en cinco fases, con el mapa mental en Canvas HTML5.
3. **Procedimiento**: secuencia aplicada (detectar, entender, resolver, verificar, prevenir).
4. **Ejercicios 01–10**: descripción del caso, procedimiento y captura real de la consola.
5. **Anexo A · Diccionario**: 49 comandos con su función y el motivo de uso.
6. **Resultados y conclusiones**: 57 comprobaciones, 0 fallos y pautas de contingencia.

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
2. Toma la identidad real de `git config --global` (en este equipo `Ivan <75749748@iegb.edu.pe>`) y la fija en cada repositorio de práctica.
3. Provoca el conflicto real, lo resuelve y ejecuta las validaciones.
4. Guarda la salida completa en `ejercicios/logs/`.
5. Devuelve código 0 solo si todas las comprobaciones pasan.

Para ejecutar uno solo:

```bash
cd ejercicios
bash 06-rebase.sh
```

## Evidencia

- **51 capturas reales de consola** en [`build/real-captures/seq/`](build/real-captures/seq/): cada ejercicio tiene su propia carpeta (`01/` … `10/`) con 4–10 imágenes. Se tomaron de la ventana de comandos de este equipo mientras los scripts se ejecutaban; no se reconstruyeron desde los logs.
- El script se detiene cada **36 filas**, el runner fotografía la consola real y luego continúa. Entre todas las imágenes de un ejercicio aparecen **todos los comandos (`$ …`) y todas sus salidas**, además del `RESULTADO: N PASS, 0 FAIL` final.
- Encabezado de entorno en cada ejecución: equipo (`IVAN`), usuario (`Ivan`), fecha, versión de Git e identidad (`Ivan <75749748@iegb.edu.pe>`).
- Cada log contiene la salida de Git, los comandos ejecutados y el bloque `RESULTADO: N PASS, 0 FAIL`.
- El **mapa mental** está dibujado con Canvas HTML5 en [`mapa-mental/mapa-mental.html`](mapa-mental/mapa-mental.html); el PNG se exporta a 3600 × 2500 px.
- La guía principal tiene **19 páginas**: marco conceptual, metodología, procedimiento, una página por ejercicio con su captura, diccionario de 49 comandos, resultados y conclusiones.
- El anexo técnico tiene **13 páginas**: una ficha por ejercicio con su captura de cierre y la validación automática.
- La galería [`build/galeria-ejercicios.html`](build/galeria-ejercicios.html) reúne las 51 capturas en una sola página.

### Volver a tomar las capturas

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build\real-captures\capture-seq.ps1
# un solo ejercicio
powershell -NoProfile -ExecutionPolicy Bypass -File .\build\real-captures\capture-seq.ps1 -Only 05
```

Requiere Windows, Git para Windows y una sesión de escritorio activa: la captura usa `CopyFromScreen` sobre la ventana real de `conhost`. El detalle del método está en [`build/real-captures/README.md`](build/real-captures/README.md).

### Regenerar los entregables

```bash
cd build
node make-canvas-map.js         # mapa-mental.png y vista-documentada.png
node make-doc-simple.js         # guía principal de 19 páginas
node make-doc.js                # anexo técnico de 13 páginas
node make-ppt.js                # presentación PPTX
node make-exercise-gallery.js   # galeria-ejercicios.html
```

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build\animate-ppt.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\build\package-desktop.ps1
```

## Estructura

```text
.
├── Guia-Conflictos-Git.md
├── Guia-Conflictos-Git.pdf
├── Conflictos-Git-Presentacion.pptx
├── Conflictos-Git-Presentacion.pdf
├── documentacion/
│   ├── Conflictos-Git-Guia-Simple.pdf          (guía principal, 19 páginas)
│   └── Documentacion-Ejercicios-Conflictos-Git.pdf  (anexo técnico, 13 páginas)
├── mapa-mental/
│   ├── mapa-mental.html
│   ├── mapa-mental.png
│   └── vista-documentada.png
├── build/
│   ├── real-captures/
│   │   ├── seq/                                (51 capturas reales)
│   │   ├── run-01.cmd … run-10.cmd
│   │   ├── capture-seq.ps1
│   │   └── capture-window.ps1
│   ├── comandos.js                             (49 comandos del diccionario)
│   ├── make-doc-simple.js
│   ├── make-doc.js
│   ├── make-canvas-map.js
│   ├── make-ppt.js
│   ├── make-exercise-gallery.js
│   ├── galeria-ejercicios.html
│   └── package-desktop.ps1
├── ejercicios/
│   ├── lib.sh
│   ├── 01-conflicto-simple.sh … 10-estrategias.sh
│   ├── run-all.sh
│   └── logs/
└── capturas/                                   (capturas de la guía extensa)
```

## Nota sobre los repositorios de práctica

Los repositorios temporales de cada ejercicio se crean dentro de `.work/` y no se suben. Lo que se versiona es el **script reproducible**, el **log de la ejecución** y las **capturas**. Así el docente puede repetir cada práctica desde cero sin depender de estados locales.
