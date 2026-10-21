#!/usr/bin/env bash
# Copies the acme fixture (an existing product with BuilderOS memory) into the empty workspace.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp -R "$here/../../tests/fixtures/acme/." .
