#!/bin/bash

mkdir -p /logs/verifier

if [ "$PWD" = "/" ]; then
  echo "Error: No working directory set. Please set a WORKDIR in your Dockerfile before running this script."
  exit 1
fi

cd /tests

rm -rf /tests/node_modules
ln -s /opt/tests-staging/node_modules /tests/node_modules

PLAYWRIGHT_BIN=/tests/node_modules/.bin/playwright
VITEST_BIN=/tests/node_modules/.bin/vitest

E2E_CODE=0
UNIT_CODE=0

"$PLAYWRIGHT_BIN" test || E2E_CODE=$?

"$VITEST_BIN" run || UNIT_CODE=$?

if [ $E2E_CODE -eq 0 ] && [ $UNIT_CODE -eq 0 ]; then
    (exit 0)
else
    (exit 1)
fi

if [ $? -eq 0 ]; then
    echo 1 > /logs/verifier/reward.txt
else
    echo 0 > /logs/verifier/reward.txt
fi
