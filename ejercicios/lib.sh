#!/usr/bin/env bash
# Helpers shared by the ten Git conflict exercises.
# The scripts are intentionally non-interactive so they can be run in CI
# and captured as evidence.
#
# Capture mode (CAPTURE_MODE=1) pauses the script every N console rows and
# waits for the PowerShell runner to take a real screenshot of the console
# window. That way every command and every output line appears in an image
# taken from the machine, not only the final summary.

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_ROOT="${WORK_ROOT:-$ROOT/.work}"

# Keep the exercises reproducible on Windows: do not convert LF/CRLF and do
# not emit the "LF will be replaced by CRLF" warning in the captured output.
export GIT_CONFIG_COUNT=1
export GIT_CONFIG_KEY_0=core.autocrlf
export GIT_CONFIG_VALUE_0=false

# Real identity of the person running the exercises. It is read from the
# global Git configuration of this machine, so the commits are authentic.
GIT_NAME="${GIT_NAME:-$(git config --global user.name 2>/dev/null)}"
GIT_EMAIL="${GIT_EMAIL:-$(git config --global user.email 2>/dev/null)}"
[ -n "$GIT_NAME" ] || GIT_NAME="Ivan"
[ -n "$GIT_EMAIL" ] || GIT_EMAIL="75749748@iegb.edu.pe"

PASS=0
FAIL=0

# ---------------------------------------------------------------- output ----
# Every line goes to the console and, when LOG is set, to the log file.
# This replaces `tee`, which would buffer the console and break the
# screenshot timing.
LOG="${LOG:-}"
if [ -n "$LOG" ]; then : > "$LOG"; fi

say() {
  printf '%s\n' "$*"
  if [ -n "$LOG" ]; then printf '%s\n' "$*" >> "$LOG"; fi
}

# --------------------------------------------------------------- capture ----
CAPTURE_MODE="${CAPTURE_MODE:-0}"
CAPTURE_DIR="${CAPTURE_DIR:-}"
CAPTURE_TAG="${CAPTURE_TAG:-run}"
CAPTURE_COLS="${CAPTURE_COLS:-95}"
CAPTURE_LIMIT="${CAPTURE_LIMIT:-30}"
BUDGET=0
SHOT_N=0

# Approximate number of console rows a text line occupies.
rows_of() {
  local len=${#1}
  local rows=$(( (len + CAPTURE_COLS) / CAPTURE_COLS ))
  [ "$rows" -ge 1 ] || rows=1
  printf '%s' "$rows"
}

snap() {
  [ "$CAPTURE_MODE" = "1" ] || return 0
  [ -n "$CAPTURE_DIR" ] || return 0
  SHOT_N=$((SHOT_N + 1))
  local ready="$CAPTURE_DIR/ready-$CAPTURE_TAG-$SHOT_N.flag"
  local go="$CAPTURE_DIR/go-$CAPTURE_TAG-$SHOT_N.flag"
  : > "$ready"
  local waited=0
  while [ ! -f "$go" ]; do
    sleep 0.1
    waited=$((waited + 1))
    [ "$waited" -lt 900 ] || break
  done
  BUDGET=0
}

add_rows() {
  BUDGET=$((BUDGET + $1))
  if [ "$CAPTURE_MODE" = "1" ] && [ "$BUDGET" -ge "$CAPTURE_LIMIT" ]; then
    snap
  fi
}

emit() {
  say "$1"
  add_rows "$(rows_of "$1")"
}

# ------------------------------------------------------------------ flow ----
if [ "$CAPTURE_MODE" = "1" ]; then
  say ""
  say "================================================================"
  say " Ejercicio : $(basename "$0")"
  say " Equipo    : ${COMPUTERNAME:-desconocido}   Usuario: ${USERNAME:-desconocido}"
  say " Fecha     : $(date '+%Y-%m-%d %H:%M:%S')"
  say " Git       : $(git --version 2>/dev/null)"
  say " Identidad : $GIT_NAME <$GIT_EMAIL>"
  say "================================================================"
  add_rows 8
fi

new_repo() {
  local name="$1"
  local dir="$WORK_ROOT/$name"
  rm -rf "$dir"
  mkdir -p "$dir"
  cd "$dir" || exit 1
  emit ""
  emit "workspace: $dir"
}

run() {
  local cmdline="" arg
  for arg in "$@"; do
    if [[ "$arg" == *" "* ]]; then
      cmdline="$cmdline \"$arg\""
    else
      cmdline="$cmdline $arg"
    fi
  done
  emit ""
  emit "\$${cmdline}"
  local out rc
  out="$("$@" 2>&1)"
  rc=$?
  if [ -n "$out" ]; then
    local line
    while IFS= read -r line; do
      emit "$line"
    done <<< "$out"
  fi
  if [ "$rc" -ne 0 ]; then
    emit "[exit $rc]"
  fi
  return 0
}

run_sh() {
  emit ""
  emit "\$ $1"
  local out rc
  out="$(bash -c "$1" 2>&1)"
  rc=$?
  if [ -n "$out" ]; then
    local line
    while IFS= read -r line; do
      emit "$line"
    done <<< "$out"
  fi
  if [ "$rc" -ne 0 ]; then
    emit "[exit $rc]"
  fi
  return 0
}

mark() {
  emit ""
  emit "### $* ###"
}

pass() {
  emit "  [PASS] $1"
  PASS=$((PASS + 1))
}

fail() {
  emit "  [FAIL] $1"
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
  emit ""
  emit "RESULTADO: $PASS PASS, $FAIL FAIL"
  # Solo se fotografía el final si la última línea no provocó ya una captura;
  # así no se guarda dos veces la misma pantalla.
  if [ "$CAPTURE_MODE" = "1" ] && [ "$BUDGET" -gt 0 ]; then
    snap
  fi
  if [ "$FAIL" -ne 0 ]; then
    exit 1
  fi
}
