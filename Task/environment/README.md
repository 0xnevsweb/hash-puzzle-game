# Hashi Puzzle Game

A retro-terminal Hashi (Bridges) puzzle implemented in React + Vite.

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
```

The production build is emitted to `/app/dist`. The test harness serves that
directory on `http://localhost:3000`.

## Layout

- `src/index.jsx` — React entry point.
- `src/App.jsx` — top-level component.
- `src/data/puzzles.js` — Easy / Medium / Hard puzzle definitions.
- `src/utils/` — pure helpers (game logic lives here).
- `public/` — static assets copied verbatim into the build.
