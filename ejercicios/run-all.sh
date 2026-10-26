#!/usr/bin/env bash
# Ejecuta los diez ejercicios y guarda un log por ejercicio.
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
status=0
for script in 01-*.sh 02-*.sh 03-*.sh 04-*.sh 05-*.sh 06-*.sh 07-*.sh 08-*.sh 09-*.sh 10-*.sh; do
  [ -f "$script" ] || continue
  name="${script%.sh}"
  printf '\n== %s ==\n' "$script"
  NO_COLOR=1 bash "$script" > "logs/$name.log" 2>&1
  rc=$?
  printf 'exit=%d\n' "$rc"
  if [ "$rc" -ne 0 ]; then
    status=1
    tail -n 20 "logs/$name.log"
  fi
done
exit "$status"
