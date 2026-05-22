FROM node:20-bookworm

# Bake all Chromium OS dependencies needed by Playwright into the image, since
# the runtime container has no internet (allow_internet = false).
RUN apt-get update && apt-get install -y --no-install-recommends \
      libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 \
      libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 \
      libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 \
      libxcomposite1 libxdamage1 libxext6 libxfixes3 \
      libxkbcommon0 libxrandr2 xvfb \
      tmux \
      asciinema \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pre-install the game scaffold's node_modules (Vite + React) so the agent
# and solve.sh can run `npm run build` offline. The manifest + lockfile are
# copied first so this layer caches across iterations, and `npm ci` enforces
# a reproducible install from the committed lockfile.
COPY package.json package-lock.json /app/
RUN npm ci --no-audit --no-fund

# Drop the rest of the scaffold (source files, configs, docs, public assets)
# into /app so the agent starts from a realistic project layout rather than
# an empty directory.
COPY index.html vite.config.js /app/
COPY src/ /app/src/
COPY public/ /app/public/
COPY README.md CHANGELOG.md CONTRIBUTING.md LICENSE /app/
COPY .gitignore .editorconfig .nvmrc .prettierrc.json .prettierignore /app/
COPY jsconfig.json eslint.config.js /app/
COPY .vscode/ /app/.vscode/
COPY docs/ /app/docs/

# Pre-stage verifier node_modules + the Playwright Chromium browser at a stable
# location outside /tests (which gets populated at runtime). test.sh symlinks
# /tests/node_modules -> here so vitest / playwright resolve their deps offline.
RUN mkdir -p /opt/tests-staging
RUN cat > /opt/tests-staging/package.json <<'EOF'
{
  "name": "ui-task-tests",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/user-event": "^14.5.2",
    "happy-dom": "^15.11.7",
    "serve": "^14.2.4",
    "vitest": "^2.1.6"
  }
}
EOF

RUN cd /opt/tests-staging \
    && npm install --no-audit --no-fund \
    && npx playwright install chromium

WORKDIR /app
