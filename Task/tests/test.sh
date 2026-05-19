#!/bin/bash

mkdir -p /logs/verifier
mkdir -p /var/cache/apt/archives/partial

# Single consolidated apt pass: Node.js repo + all Chromium OS deps together.
# Avoids the apt-lock race that occurs when --with-deps spawns a second apt
# while the first apt-get is still holding the dpkg/lists lock.
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

apt-get install -y --no-install-recommends \
  nodejs \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 \
  libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 \
  libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 \
  libxcomposite1 libxdamage1 libxext6 libxfixes3 \
  libxkbcommon0 libxrandr2 xvfb

cd /tests
npm install

# Install Chromium binary only — OS deps are already present above.
npx playwright install chromium

# E2E tests; playwright.config.ts webServer starts /app/build automatically.
npx playwright test
E2E_CODE=$?

# Unit tests
npm run test
UNIT_CODE=$?

# Check both test results and set exit code accordingly
if [ $E2E_CODE -eq 0 ] && [ $UNIT_CODE -eq 0 ]; then
    exit 0
else
    exit 1
fi

# The reward section MUST be exactly as below and at the end of the file
if [ $? -eq 0 ]; then
    echo 1 > /logs/verifier/reward.txt
else
    echo 0 > /logs/verifier/reward.txt
fi