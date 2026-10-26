#!/usr/bin/env bash
# Ejercicio 06 - Conflicto durante un rebase
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

new_repo "ejercicio-06-rebase"

mark "PREPARACION"
run git init -b main
run git config user.name "Alumno"
run git config user.email "alumno@example.com"
run git config merge.conflictStyle zdiff3
run_sh "printf 'version = 1\\n' > version.txt"
run git add version.txt
run git commit -m "base: version 1"

run git switch -c feature
run_sh "printf 'version = 2-feature\\n' > version.txt"
run git commit -am "feature: version 2"

run git switch main
run_sh "printf 'version = 2-main\\n' > version.txt"
run git commit -am "main: version 2"

run git switch feature
mark "CONFLICTO"
run git rebase main
run git status
run git show :1:version.txt
run git show :2:version.txt
run git show :3:version.txt
run cat version.txt

mark "RESOLUCION"
run_sh "printf 'version = 2 (main + feature)\\n' > version.txt"
run cat version.txt
run git add version.txt
run env GIT_EDITOR=true git rebase --continue

mark "VALIDACION"
run git status --short
run git log --oneline --graph --all --decorate
run git show HEAD:version.txt
run git branch --show-current

check_clean "el arbol de trabajo queda limpio"
check_no_markers "no quedan marcadores en el repositorio"
check_contains "se combinan main y feature" version.txt "version = 2 (main + feature)"
check_sh "main es ancestro de feature" "git merge-base --is-ancestor main feature"
check_sh "la historia quedo lineal, sin merge commits" "! git log --merges --oneline | grep -q ."

finish
