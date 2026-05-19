#!/bin/bash
set -e

cp -r /solution/game-files/* /app/
cd /app
npm install
npm run build

echo "Oracle solution deployed"
