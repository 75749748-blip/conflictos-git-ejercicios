#!/usr/bin/env bash
# Ejercicio 07 - Conflicto en un cherry-pick
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

new_repo "ejercicio-07-cherry-pick"

mark "PREPARACION"
run git init -b main
run git config user.name "Alumno"
run git config user.email "alumno@example.com"
run git config merge.conflictStyle zdiff3
run_sh "printf 'linea 1\\nlinea 2\\nlinea 3\\n' > app.txt"
run git add app.txt
run git commit -m "base"

run git switch -c feature
run_sh "printf 'linea 1\\nlinea 2 (feature)\\nlinea 3\\n' > app.txt"
run git commit -am "feature: ajusta la linea 2"

run git switch main
run_sh "printf 'linea 1\\nlinea 2 (main)\\nlinea 3\\n' > app.txt"
run git commit -am "main: ajusta la linea 2"

HASH="$(git rev-parse main)"
printf '\ncommit a aplicar: %s\n' "$HASH"
run git switch feature
mark "CONFLICTO"
run git cherry-pick "$HASH"
run git status
run git show :1:app.txt
run git show :2:app.txt
run git show :3:app.txt
run cat app.txt

mark "RESOLUCION"
run_sh "printf 'linea 1\\nlinea 2 (main + feature)\\nlinea 3\\n' > app.txt"
run cat app.txt
run git add app.txt
run env GIT_EDITOR=true git cherry-pick --continue

mark "VALIDACION"
run git status --short
run git log --oneline --graph --all --decorate
run git show HEAD:app.txt

check_clean "el arbol de trabajo queda limpio"
check_no_markers "no quedan marcadores en el repositorio"
check_contains "se combinan ambos cambios" app.txt "linea 2 (main + feature)"
check_sh "el commit de main quedo aplicado en feature" "git log --oneline feature | grep -q 'main: ajusta la linea 2'"
check_sh "no se creo un merge commit" "! git log --merges --oneline | grep -q ."

finish
