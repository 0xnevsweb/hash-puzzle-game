#!/bin/bash

# Runtime has no internet (task.toml: allow_internet = false). All verifier
# dependencies — Chromium OS libs, npm packages, the Playwright browser — are
# baked into the Docker image. See Task/environment/Dockerfile.

mkdir -p /logs/verifier

# Check if we're in a valid working directory
if [ "$PWD" = "/" ]; then
  echo "Error: No working directory set. Please set a WORKDIR in your Dockerfile before running this script."
  exit 1
fi

cd /tests

# Point /tests/node_modules at the pre-installed staging dir so vitest and
# Playwright resolve their packages without hitting the network.
rm -rf /tests/node_modules
ln -s /opt/tests-staging/node_modules /tests/node_modules

# Invoke the local binaries directly to avoid npx cache fallbacks.
PLAYWRIGHT_BIN=/tests/node_modules/.bin/playwright
VITEST_BIN=/tests/node_modules/.bin/vitest

# Initialize exit codes
E2E_CODE=0
UNIT_CODE=0

# Run E2E tests
"$PLAYWRIGHT_BIN" test || E2E_CODE=$?

# Run unit tests
"$VITEST_BIN" run || UNIT_CODE=$?

# Produce reward file (REQUIRED): pass only if both unit and E2E succeed
if [ "$E2E_CODE" -eq 0 ] && [ "$UNIT_CODE" -eq 0 ]; then
    echo 1 > /logs/verifier/reward.txt
    exit 0
else
    echo 0 > /logs/verifier/reward.txt
    exit 1
fi
