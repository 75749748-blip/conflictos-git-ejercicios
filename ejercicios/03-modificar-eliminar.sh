#!/usr/bin/env bash
# Ejercicio 03 - Conflicto modificar/eliminar (UD)
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

new_repo "ejercicio-03-mod-delete"

mark "PREPARACION"
run git init -b main
run git config user.name "$GIT_NAME"
run git config user.email "$GIT_EMAIL"
run git config merge.conflictStyle zdiff3
run_sh "printf 'uno\\ndos\\ntres\\n' > notas.txt"
run git add notas.txt
run git commit -m "base: crea notas.txt"

run git switch -c feature
run git rm notas.txt
run git commit -m "feature: elimina notas.txt"

run git switch main
run_sh "printf 'uno\\ndos (main)\\ntres\\n' > notas.txt"
run git commit -am "main: edita notas.txt"

mark "CONFLICTO"
run git merge feature
run git status --short
run git status
run cat notas.txt
run git log --merge --oneline -- notas.txt

mark "RESOLUCION A - CONSERVAR"
run git add notas.txt
run git commit -m "merge: conserva notas.txt con la edicion de main"
run cat notas.txt
run git log --oneline --graph --all --decorate

mark "RESOLUCION B - ELIMINAR"
run git reset --hard HEAD~1
run git merge feature
run git status --short
run git rm notas.txt
run git commit -m "merge: acepta la eliminacion de notas.txt"
run git status --short

mark "VALIDACION"
run bash -c 'if [ -f notas.txt ]; then echo "notas.txt existe"; else echo "notas.txt eliminado"; fi'
run git log --oneline --graph --all --decorate
run git diff --check

check_clean "el arbol de trabajo queda limpio"
check_absent "notas.txt ya no existe" notas.txt
check_sh "existe un commit de merge" "git log --merges --oneline | grep -q ."
check_sh "el historial registra la eliminacion" "git log --oneline --all | grep -q 'acepta la eliminacion'"

finish
