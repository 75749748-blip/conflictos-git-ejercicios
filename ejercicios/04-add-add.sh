#!/usr/bin/env bash
# Ejercicio 04 - Conflicto anadir/anadir (AA)
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

new_repo "ejercicio-04-add-add"

mark "PREPARACION"
run git init -b main
run git config user.name "$GIT_NAME"
run git config user.email "$GIT_EMAIL"
run git config merge.conflictStyle zdiff3
run_sh "printf 'node_modules/\\n' > .gitignore"
run git add .gitignore
run git commit -m "base: ignora node_modules"

run git switch -c feature
run_sh "printf '# Changelog\\n\\n## 1.1.0\\n- Login\\n' > CHANGELOG.md"
run git add CHANGELOG.md
run git commit -m "feature: changelog 1.1.0"

run git switch main
run_sh "printf '# Changelog\\n\\n## 1.0.1\\n- Dashboard\\n' > CHANGELOG.md"
run git add CHANGELOG.md
run git commit -m "main: changelog 1.0.1"

mark "CONFLICTO"
run git merge feature
run git status --short
run git diff
run cat CHANGELOG.md
run git ls-files -u

mark "RESOLUCION"
run_sh "printf '# Changelog\\n\\n## 1.1.0\\n- Login\\n\\n## 1.0.1\\n- Dashboard\\n' > CHANGELOG.md"
run cat CHANGELOG.md
run git add CHANGELOG.md
run git commit -m "merge: unifica changelog con las entradas 1.1.0 y 1.0.1"

mark "VALIDACION"
run git status --short
run git diff --check
run git show HEAD:CHANGELOG.md

check_clean "el arbol de trabajo queda limpio"
check_no_markers "no quedan marcadores en el repositorio"
check_contains "el changelog conserva la version 1.1.0" CHANGELOG.md "## 1.1.0"
check_contains "el changelog conserva la version 1.0.1" CHANGELOG.md "## 1.0.1"
check_sh "existe un commit de merge" "git log --merges --oneline | grep -q ."

finish
