#!/usr/bin/env bash
# The acme fixture, moved back to pre-PMF: scale work should be named and questioned.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp -R "$here/../../tests/fixtures/acme/." .
sed -i.bak 's/\*\*Stage:\*\* emerging-PMF/**Stage:** pre-PMF/' PRODUCT.md && rm -f PRODUCT.md.bak
