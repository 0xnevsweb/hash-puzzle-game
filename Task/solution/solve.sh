#!/bin/bash
set -e

cp -r /oracle/game-files/* /app/
cd /app
npm install
npm run build

echo "Oracle solution deployed"
