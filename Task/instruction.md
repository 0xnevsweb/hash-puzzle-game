# Build a React Hashi Puzzle Game

Build a React single-page app that implements a Hashi (Bridges) puzzle game. The UI must look like a retro terminal: black background, green monospace text, no CSS frameworks. All source code must be placed under `/app/src/`. The app runs at `http://localhost:3000`.

## Rules

- Islands are numbered circles (1–8). The number equals the exact number of bridges that must be attached to it.
- Bridges are horizontal or vertical straight lines connecting two islands.
- Max 2 bridges between the same pair of islands.
- Bridges cannot cross each other.
- All islands must be connected into a single component when the puzzle is solved.

## Interaction

- **Mouse:** Click island A, then island B to add/remove bridges (no bridge → single → double → none). Right-click (or Ctrl+click) on a bridge toggles it.
- **Keyboard:** Arrow keys move a visible cursor between islands. Press Enter to select an island, then arrow keys to move toward another island, then Enter to toggle a bridge. Esc cancels the selection.
- Invalid moves show a descriptive error message inside an element with class `error-message`. The error clears on the next valid move. Error text must match: `"Cannot connect non-adjacent islands"`, `"Max 2 bridges per pair"`, `"Island would exceed its number"`, `"Bridges would cross"`.

## Features

- Puzzle coordinates are defined in `/app/src/data/puzzles.js`. Include a dropdown to switch between the three puzzles (Easy, Medium, Hard).
- A button labeled **Reset** clears all bridges for the current puzzle while keeping island positions and numbers.
- When all island numbers are satisfied and all islands are connected, display a banner with class `victory-banner` containing the text `SOLVED!`.

## Visual

- Render the board as an SVG element (800×600 pixels) anchored at the viewport top-left (no centering, no body/page padding). Pixel position of an island = `(grid_x * 40, grid_y * 40)`. Islands are SVG `<circle>` elements; bridges are SVG `<line>` elements. Each grid unit is 40px.
- Double bridges appear as two parallel lines. Single bridges appear as one line.
- The keyboard cursor must be clearly visible at all times. It must **not** be drawn as an additional `<circle>` (use a `<rect>`, stroke filter, group transform, or any non-`<circle>` element) so that the board's `<circle>` count equals the island count.

## Module API

Game logic lives at `/app/src/utils/hashiLogic.js` and must export the following named functions. Bridges are represented as `Map<string, number>` keyed by the canonical string `"x1,y1,x2,y2"` where the endpoint with the smaller `(x, then y)` sorts first; coordinates are **grid units**, not pixels.

- `canAddBridge(islands, bridges, from, to, delta)` → `{ valid: boolean, error: string | null }`. Validates a proposed bridge addition of `delta` (typically `1`) between two island objects `{id, x, y, value}`. Error string must be one of the four messages listed under **Interaction** above.
- `computeCurrentCounts(islands, bridges)` → `Map<islandId, number>` of the current total bridge count for each island.
- `checkConnectivity(islands, bridges)` → `boolean`. True iff every island is reachable from every other via bridges.
- `isVictory(islands, bridges)` → `boolean`. True iff every island's count equals its value, no bridges cross, and the graph is connected.