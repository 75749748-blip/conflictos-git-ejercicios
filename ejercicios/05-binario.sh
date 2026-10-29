#!/usr/bin/env bash
# Ejercicio 05 - Conflicto binario
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

new_repo "ejercicio-05-binario"

mark "PREPARACION"
run git init -b main
run git config user.name "$GIT_NAME"
run git config user.email "$GIT_EMAIL"
run_sh "printf '*.bin binary\\n' > .gitattributes"
run_sh "printf 'version 1\\n' > logo.bin"
run git add .gitattributes logo.bin
run git commit -m "base: logo v1 y atributo binario"
run git check-attr -a -- logo.bin

run git switch -c feature
run_sh "printf 'version FEATURE\\n' > logo.bin"
run git commit -am "feature: version FEATURE del logo"

run git switch main
run_sh "printf 'version MAIN\\n' > logo.bin"
run git commit -am "main: version MAIN del logo"

mark "CONFLICTO"
run git merge feature
run git status --short
run git diff
run cat logo.bin

mark "RESOLUCION"
run git checkout --theirs -- logo.bin
run cat logo.bin
run git add logo.bin
run git commit -m "merge: usa la version FEATURE del logo binario"

mark "VALIDACION"
run git status --short
run git diff --check
run cat logo.bin
run git log --oneline --graph --all --decorate

check_clean "el arbol de trabajo queda limpio"
check_contains "se eligio la version FEATURE" logo.bin "version FEATURE"
check_not_contains "no se conserva la version MAIN" logo.bin "version MAIN"
check_sh "existe un commit de merge" "git log --merges --oneline | grep -q ."

finish
