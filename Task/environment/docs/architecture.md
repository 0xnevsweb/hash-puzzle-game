# Architecture

This is a single-page React app, no router, no global state library.

- `src/index.jsx` boots React into `#root` in `index.html`.
- `src/App.jsx` owns puzzle and bridge state and renders the board.
- `src/data/puzzles.js` exports a list of puzzle definitions used by the
  dropdown.
- `src/utils/` holds pure modules — anything that can be unit-tested without
  rendering belongs here.
- Styles live in `src/index.css` (no framework, plain CSS).

Build output goes to `dist/`. The harness serves that directory at
`http://localhost:3000`; you don't need a long-running dev server for tests.
