#!/usr/bin/env bash
# Helpers shared by the ten Git conflict exercises.
# The scripts are intentionally non-interactive so they can be run in CI
# and captured as evidence.

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_ROOT="${WORK_ROOT:-$ROOT/.work}"

# Keep the exercises reproducible on Windows: do not convert LF/CRLF and do
# not emit the "LF will be replaced by CRLF" warning in the captured output.
export GIT_CONFIG_COUNT=1
export GIT_CONFIG_KEY_0=core.autocrlf
export GIT_CONFIG_VALUE_0=false

PASS=0
FAIL=0

new_repo() {
  local name="$1"
  local dir="$WORK_ROOT/$name"
  rm -rf "$dir"
  mkdir -p "$dir"
  cd "$dir" || exit 1
  printf 'workspace: %s\n' "$dir"
}

run() {
  printf '\n$'
  local arg
  for arg in "$@"; do
    if [[ "$arg" == *" "* ]]; then
      printf ' "%s"' "$arg"
    else
      printf ' %s' "$arg"
    fi
  done
  printf '\n'
  "$@" 2>&1
  local rc=$?
  if [ "$rc" -ne 0 ]; then
    printf '[exit %d]\n' "$rc"
  fi
  return 0
}

run_sh() {
  printf '\n$ %s\n' "$1"
  bash -c "$1" 2>&1
  local rc=$?
  if [ "$rc" -ne 0 ]; then
    printf '[exit %d]\n' "$rc"
  fi
  return 0
}

mark() {
  printf '\n### %s ###\n' "$*"
}

pass() {
  printf '  [PASS] %s\n' "$1"
  PASS=$((PASS + 1))
}

fail() {
  printf '  [FAIL] %s\n' "$1"
  FAIL=$((FAIL + 1))
}

check_sh() {
  local desc="$1"
  local cmd="$2"
  if bash -c "$cmd" >/dev/null 2>&1; then
    pass "$desc"
  else
    fail "$desc"
  fi
}

check_clean() {
  local desc="${1:-el arbol de trabajo queda limpio}"
  if [ -z "$(git status --porcelain)" ]; then
    pass "$desc"
  else
    fail "$desc"
  fi
}

check_no_markers() {
  local desc="${1:-no quedan marcadores de conflicto}"
  if git grep -qE '^(<<<<<<<|=======|>>>>>>>|\|\|\|\|\|\|\|)' -- . 2>/dev/null; then
    fail "$desc"
  else
    pass "$desc"
  fi
}

check_contains() {
  local desc="$1"
  local file="$2"
  local text="$3"
  if [ -f "$file" ] && grep -Fq "$text" "$file"; then
    pass "$desc"
  else
    fail "$desc"
  fi
}

check_not_contains() {
  local desc="$1"
  local file="$2"
  local text="$3"
  if [ -f "$file" ] && ! grep -Fq "$text" "$file"; then
    pass "$desc"
  else
    fail "$desc"
  fi
}

check_exists() {
  local desc="$1"
  local file="$2"
  if [ -e "$file" ]; then
    pass "$desc"
  else
    fail "$desc"
  fi
}

check_absent() {
  local desc="$1"
  local file="$2"
  if [ ! -e "$file" ]; then
    pass "$desc"
  else
    fail "$desc"
  fi
}

check_empty_stash() {
  local desc="${1:-la lista de stash quedo vacia}"
  if [ -z "$(git stash list)" ]; then
    pass "$desc"
  else
    fail "$desc"
  fi
}

check_conflict_count() {
  local desc="$1"
  local file="$2"
  local expected="$3"
  local actual
  actual="$(grep -c '^<<<<<<<' "$file" 2>/dev/null || true)"
  if [ "$actual" = "$expected" ]; then
    pass "$desc"
  else
    fail "$desc (esperado $expected, encontrado ${actual:-0})"
  fi
}

finish() {
  printf '\nRESULTADO: %d PASS, %d FAIL\n' "$PASS" "$FAIL"
  if [ "$FAIL" -ne 0 ]; then
    exit 1
  fi
}
