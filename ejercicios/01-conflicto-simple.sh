#!/usr/bin/env bash
# Ejercicio 01 - Conflicto simple en una linea
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$HERE/lib.sh"

new_repo "ejercicio-01-linea"

mark "PREPARACION"
run git init -b main
run git config user.name "$GIT_NAME"
run git config user.email "$GIT_EMAIL"
run git config merge.conflictStyle zdiff3
run_sh "printf 'linea 1\\nlinea 2\\nlinea 3\\n' > app.txt"
run git add app.txt
run git commit -m "base: crea app.txt"

run git switch -c feature
run_sh "printf 'linea 1\\nlinea 2 (feature)\\nlinea 3\\n' > app.txt"
run git commit -am "feature: cambia la linea 2"

run git switch main
run_sh "printf 'linea 1\\nlinea 2 (main)\\nlinea 3\\n' > app.txt"
run git commit -am "main: cambia la linea 2"

mark "CONFLICTO"
run git merge feature
run git status --short
run git diff
run git show :1:app.txt
run git show :2:app.txt
run git show :3:app.txt
run cat app.txt

mark "RESOLUCION"
run_sh "printf 'linea 1\\nlinea 2 (main)\\nlinea 2 (feature)\\nlinea 3\\n' > app.txt"
run cat app.txt
run git add app.txt
run git commit -m "merge: integra feature conservando ambos cambios"

mark "VALIDACION"
run git status --short
run git diff --check
run git log --oneline --graph --all --decorate
run git show HEAD:app.txt

check_clean "el arbol de trabajo queda limpio"
check_no_markers "no quedan marcadores en el repositorio"
check_contains "se conserva el cambio de main" app.txt "linea 2 (main)"
check_contains "se conserva el cambio de feature" app.txt "linea 2 (feature)"
check_sh "existe un commit de merge" "git log --merges --oneline | grep -q ."

finish
