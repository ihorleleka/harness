#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
HARNESS_PACKAGE="${HARNESS_PACKAGE:-github:ihorleleka/harness}"

npx "$HARNESS_PACKAGE" update "$SCRIPT_DIR/.." "$@"
