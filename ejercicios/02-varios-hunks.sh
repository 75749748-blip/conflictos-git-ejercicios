#!/usr/bin/env bash
# Ejercicio 02 - Varios hunks en un mismo archivo
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

new_repo "ejercicio-02-hunks"

mark "PREPARACION"
run git init -b main
run git config user.name "$GIT_NAME"
run git config user.email "$GIT_EMAIL"
run git config merge.conflictStyle zdiff3
run_sh "printf '[app]\\nnombre = demo\\nversion = 1.0\\npuerto = 8080\\n\\n[db]\\nhost = localhost\\npuerto = 5432\\n\\n[log]\\nnivel = info\\nruta = logs/app.log\\n' > config.ini"
run git add config.ini
run git commit -m "base: configuracion inicial"

run git switch -c feature
run_sh "printf '[app]\\nnombre = demo-feature\\nversion = 1.0\\npuerto = 8080\\n\\n[db]\\nhost = localhost\\npuerto = 5432\\n\\n[log]\\nnivel = debug\\nruta = logs/app.log\\n' > config.ini"
run git commit -am "feature: nombre y nivel debug"

run git switch main
run_sh "printf '[app]\\nnombre = demo-main\\nversion = 1.0\\npuerto = 8080\\n\\n[db]\\nhost = localhost\\npuerto = 5432\\n\\n[log]\\nnivel = warn\\nruta = logs/app.log\\n' > config.ini"
run git commit -am "main: nombre y nivel warn"

mark "CONFLICTO"
run git merge feature
run git status --short
run git diff
check_conflict_count "hay dos regiones de conflicto" config.ini 2

mark "RESOLUCION"
run_sh "printf '[app]\\nnombre = demo (main+feature)\\nversion = 1.0\\npuerto = 8080\\n\\n[db]\\nhost = localhost\\npuerto = 5432\\n\\n[log]\\nnivel = debug\\nruta = logs/app.log\\n' > config.ini"
run cat config.ini
run git add config.ini
run git commit -m "merge: combina nombre y elige nivel debug"

mark "VALIDACION"
run git status --short
run git diff --check
run git show HEAD:config.ini

check_clean "el arbol de trabajo queda limpio"
check_no_markers "no quedan marcadores en el repositorio"
check_contains "el nombre combina ambos lados" config.ini "nombre = demo (main+feature)"
check_contains "se eligio el nivel debug" config.ini "nivel = debug"
check_not_contains "no se conserva el nivel warn" config.ini "nivel = warn"

finish
