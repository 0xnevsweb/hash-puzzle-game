#!/bin/bash
set -e

# Runtime has no internet. /app/node_modules is pre-installed in the image
# (see Task/environment/Dockerfile) and survives the cp below since the source
# tree has no node_modules to overlay it.
cp -r /solution/game-files/* /app/
cd /app
npm run build

echo "Oracle solution deployed"
