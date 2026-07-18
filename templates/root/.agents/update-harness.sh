#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
AGENTS_DIR=$(basename "$SCRIPT_DIR")
HARNESS_PACKAGE="${HARNESS_PACKAGE:-github:ihorleleka/harness}"

exec npx "$HARNESS_PACKAGE" update "$SCRIPT_DIR/.." --agents-dir "$AGENTS_DIR" "$@"
