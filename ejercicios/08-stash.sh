#!/usr/bin/env bash
# Ejercicio 08 - Conflicto al aplicar un stash
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

new_repo "ejercicio-08-stash"

mark "PREPARACION"
run git init -b main
run git config user.name "Alumno"
run git config user.email "alumno@example.com"
run git config merge.conflictStyle zdiff3
run_sh "printf 'linea 1\\nlinea 2\\nlinea 3\\n' > app.txt"
run git add app.txt
run git commit -m "base"

run_sh "printf 'linea 1\\nlinea 2 (WIP)\\nlinea 3\\n' > app.txt"
run git stash push -m "wip: linea 2"
run git stash list

run_sh "printf 'linea 1\\nlinea 2 (commit)\\nlinea 3\\n' > app.txt"
run git commit -am "main: cambia la linea 2"

mark "CONFLICTO"
run git stash pop
run git status --short
run git stash list
run cat app.txt

mark "RESOLUCION"
run_sh "printf 'linea 1\\nlinea 2 (commit + WIP)\\nlinea 3\\n' > app.txt"
run cat app.txt
run git add app.txt
run git stash drop
run git commit -m "feat: recupera el WIP combinado con el cambio de main"

mark "VALIDACION"
run git status --short
run git stash list
run git show HEAD:app.txt
run git log --oneline --graph --all --decorate

check_clean "el arbol de trabajo queda limpio"
check_no_markers "no quedan marcadores en el repositorio"
check_contains "se combinan commit y WIP" app.txt "linea 2 (commit + WIP)"
check_empty_stash "el stash se elimino despues de resolver"

finish
