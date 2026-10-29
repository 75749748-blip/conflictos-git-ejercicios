#!/usr/bin/env bash
# Ejercicio 10 - Estrategias automaticas, rerere y merge drivers
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

mark "PARTE A - -X ours frente a -s ours"
new_repo "ejercicio-10a-estrategias"
run git init -b main
run git config user.name "$GIT_NAME"
run git config user.email "$GIT_EMAIL"
run_sh "printf 'linea 1\\nlinea 2\\nlinea 3\\n' > app.txt"
run git add app.txt
run git commit -m "base"

run git switch -c feature
run_sh "printf 'linea 1\\nlinea 2 (feature)\\nlinea 3\\n' > app.txt"
run_sh "printf 'aportado por feature\\n' > nueva.txt"
run git add app.txt nueva.txt
run git commit -m "feature: linea 2 y nueva.txt"

run git switch main
run_sh "printf 'linea 1\\nlinea 2 (main)\\nlinea 3\\n' > app.txt"
run git commit -am "main: linea 2"

run git merge --no-edit -X ours feature
run cat app.txt
run ls nueva.txt
run git show --stat --oneline HEAD
check_contains "-X ours conserva la linea de main" app.txt "linea 2 (main)"
check_exists "-X ours conserva nueva.txt de feature" nueva.txt

run git reset --hard HEAD~1
run git merge --no-edit -s ours feature
run cat app.txt
run_sh "if [ -e nueva.txt ]; then echo 'nueva.txt existe'; else echo 'nueva.txt NO existe'; fi"
run git show --stat --oneline HEAD
run git diff HEAD~1 HEAD --stat
check_contains "-s ours conserva la linea de main" app.txt "linea 2 (main)"
check_absent "-s ours descarta nueva.txt" nueva.txt

mark "PARTE B - rerere"
new_repo "ejercicio-10b-rerere"
run git init -b main
run git config user.name "$GIT_NAME"
run git config user.email "$GIT_EMAIL"
run git config rerere.enabled true
run git config rerere.autoUpdate true
run_sh "printf 'linea 1\\nlinea 2\\nlinea 3\\n' > app.txt"
run git add app.txt
run git commit -m "base"

run git switch -c feature
run_sh "printf 'linea 1\\nlinea 2 (feature)\\nlinea 3\\n' > app.txt"
run git commit -am "feature: linea 2"

run git switch main
run_sh "printf 'linea 1\\nlinea 2 (main)\\nlinea 3\\n' > app.txt"
run git commit -am "main: linea 2"

run git merge feature
run cat app.txt
run_sh "printf 'linea 1\\nlinea 2 (main + feature)\\nlinea 3\\n' > app.txt"
run git add app.txt
run git rerere status
run git commit -m "merge: resolucion registrada por rerere"

run git reset --hard HEAD~1
run git merge feature
run git status --short
run cat app.txt
run git add app.txt
run git commit -m "merge: rerere reutiliza la resolucion"
run git log --oneline --graph --all --decorate

check_clean "el arbol de trabajo queda limpio" 
check_no_markers "no quedan marcadores en el repositorio"
check_contains "rerere aplico la resolucion combinada" app.txt "linea 2 (main + feature)"
check_sh "existe cache de rerere" "test -d .git/rr-cache"

mark "PARTE C - merge=union y merge=ours"
new_repo "ejercicio-10c-drivers"
run git init -b main
run git config user.name "$GIT_NAME"
run git config user.email "$GIT_EMAIL"
run_sh "printf 'deps.lock merge=union\\n' > .gitattributes"
run_sh "printf 'lock-a\\n' > deps.lock"
run git add .gitattributes deps.lock
run git commit -m "main: lockfile con merge=union"

run git switch -c feature-union
run_sh "printf 'lock-b\\n' > deps.lock"
run git commit -am "feature: lock-b"

run git switch main
run_sh "printf 'lock-main\\n' > deps.lock"
run git commit -am "main: lock-main"

run git merge --no-edit feature-union
run cat deps.lock
run git check-attr merge deps.lock
check_contains "union conserva lock-main" deps.lock "lock-main"
check_contains "union conserva lock-b" deps.lock "lock-b"
check_no_markers "union no deja marcadores"

run_sh "printf '*.ours merge=ours\\n' >> .gitattributes"
run git config merge.ours.driver true
run_sh "printf 'base\\n' > config.ours"
run git add .gitattributes config.ours
run git commit -m "main: driver ours"

run git switch -c feature-ours
run_sh "printf 'feature\\n' > config.ours"
run git commit -am "feature: config.ours"

run git switch main
run_sh "printf 'main\\n' > config.ours"
run git commit -am "main: config.ours"

run git merge --no-edit feature-ours
run cat config.ours
run git check-attr merge config.ours
check_contains "merge=ours conserva main" config.ours "main"
check_not_contains "merge=ours no aplica feature" config.ours "feature"

mark "VALIDACION FINAL"
run git status --short
run git diff --check
run git log --oneline --graph --all --decorate

check_clean "el arbol de trabajo queda limpio (drivers)"
check_no_markers "no quedan marcadores (drivers)"

finish
