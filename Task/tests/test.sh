#!/bin/bash

# Runtime has no internet (task.toml: allow_internet = false). All verifier
# dependencies — Chromium OS libs, npm packages, the Playwright browser — are
# baked into the Docker image. See Task/environment/Dockerfile.

mkdir -p /logs/verifier

cd /tests

# Point /tests/node_modules at the pre-installed staging dir so vitest and
# Playwright resolve their packages without hitting the network. Replace any
# pre-existing node_modules to guarantee a known-good symlink — if it's stale
# or partial, npx will silently fall back to its own cache and the verifier
# will try to import @playwright/test from the wrong tree.
rm -rf /tests/node_modules
ln -s /opt/tests-staging/node_modules /tests/node_modules

# Invoke the local binaries directly. Using `npx` risks falling back to the
# global npx package cache if local resolution hiccups, which produced the
# ERR_MODULE_NOT_FOUND / "vitest: not found" failures seen previously.
PLAYWRIGHT_BIN=/tests/node_modules/.bin/playwright
VITEST_BIN=/tests/node_modules/.bin/vitest

# E2E tests; playwright.config.ts webServer starts /app/build automatically.
"$PLAYWRIGHT_BIN" test
E2E_CODE=$?

# Unit tests
"$VITEST_BIN" run
UNIT_CODE=$?

# Check both test results and set exit code accordingly
if [ $E2E_CODE -eq 0 ] && [ $UNIT_CODE -eq 0 ]; then
    (exit 0)
else
    (exit 1)
fi

# The reward section MUST be exactly as below and at the end of the file
if [ $? -eq 0 ]; then
    echo 1 > /logs/verifier/reward.txt
else
    echo 0 > /logs/verifier/reward.txt
fi
