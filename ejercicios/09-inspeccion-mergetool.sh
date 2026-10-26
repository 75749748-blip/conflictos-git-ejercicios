#!/usr/bin/env bash
# Ejercicio 09 - Inspeccion forense y mergetool
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/lib.sh"

new_repo "ejercicio-09-inspeccion"

mark "PREPARACION"
run git init -b main
run git config user.name "Alumno"
run git config user.email "alumno@example.com"
run_sh "printf 'valor = 1\\n' > config.txt"
run git add config.txt
run git commit -m "base: valor 1"

run git switch -c feature
run_sh "printf 'valor = 2\\n' > config.txt"
run git commit -am "feature: valor 2"

run git switch main
run_sh "printf 'valor = 3\\n' > config.txt"
run git commit -am "main: valor 3"

run git config merge.conflictStyle diff3
mark "CONFLICTO"
run git merge feature
run git status
run git diff
run git show :1:config.txt
run git show :2:config.txt
run git show :3:config.txt
run git log --merge --oneline -- config.txt
run git diff --base -- config.txt
run cat config.txt

mark "MERGECOLL - HERRAMIENTA PERSONALIZADA"
cat > resolver.sh <<'EOF'
#!/usr/bin/env bash
# Herramienta de merge no interactiva para la demostracion.
# Argumentos de git mergetool: BASE LOCAL REMOTE MERGED
printf 'valor = 5\n' > "$4"
exit 0
EOF
chmod +x resolver.sh
run cat resolver.sh
run git config merge.tool resolver
run git config mergetool.prompt false
run git config mergetool.resolver.cmd "$PWD/resolver.sh \"\$BASE\" \"\$LOCAL\" \"\$REMOTE\" \"\$MERGED\""
run git config --get mergetool.resolver.cmd
run_sh "printf 'y\\n' | git mergetool --tool=resolver"
run git status --short
run cat config.txt

mark "RESOLUCION"
run git commit -m "merge: resuelve config.txt con mergetool"
run cat config.txt

run rm -f resolver.sh config.txt.orig

mark "VALIDACION"
run git status --short
run git diff --check
run git show HEAD:config.txt
run git log --oneline --graph --all --decorate

check_clean "el arbol de trabajo queda limpio"
check_no_markers "no quedan marcadores en el repositorio"
check_contains "el valor final es 5" config.txt "valor = 5"
check_sh "existe un commit de merge" "git log --merges --oneline | grep -q ."

finish
