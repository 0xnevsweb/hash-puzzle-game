## Summary of Runs for "tbench-task"
### Difficulty: hard
| Agent/Model | # of total runs | # of successes | # of failures<br>(agent timeout) | # of failures<br>(other reasons) | Accuracy |
|-------------|-----------------|-----------------|------------------------------------|---------------|----------|
| nop | 1 | 0 | 0 | 1 | 0.0 |
| oracle | 3 | 3 | 0 | 0 | 1.0 |
| terminus-claude-opus-4-6 | 5 | 3 | 0 | 2 | 0.6 |
| terminus-gpt5-2 | 5 | 1 | 0 | 4 | 0.2 |
<details>
<summary>Tests Result</summary>

⚠️ Some tests are not passed by any agent run. It's not clear if this task is solvable or simply super hard.
| Test Name | Successful Runs / Total Runs |
|-------------|------------------------------|
| e2e: right-click on bridge midpoint removes bridge | 0 / 6 |
| e2e: ctrl+click on bridge midpoint removes bridge | 0 / 6 |
| e2e: error message clears after subsequent valid move | 0 / 6 |
| e2e: clicking island A then island B cycles bridge (none → single → double → none) | 1 / 6 |
| e2e: invalid move displays correct error string | 1 / 6 |
| e2e: victory banner shows when puzzle solved | 1 / 6 |
| e2e: Reset button clears all bridges | 1 / 6 |
| unit: canAddBridge rejects self-connection (from === to) | 4 / 6 |
</details>

### Analysis on Agent Failures
| Check       | Outcome  | Explanation              |
|-------------|----------|--------------------------|
| Task Instruction Sufficiency | ✅ PASS | ## Job Summary: Hashi Puzzle Game Implementation

### 1. Overall Results
**0/6 trials passed** (all earned reward 0.0). All 6 agents successfully built and compiled the app, and all passed unit tests (15–16/16), but none passed enough e2e tests to earn a reward.

| Trial | Unit Tests | E2E Tests | Reward |
|-------|-----------|-----------|--------|
| tbench-task__fLd3RZX | 15/16 | 4/11 | 0.0 |
| tbench-task__6orhWnM | 16/16 | 8/11 | 0.0 |
| tbench-task__GCCnRTA | 16/16 | 4/11 | 0.0 |
| tbench-task__2HhAehu | 16/16 | 4/11 | 0.0 |
| tbench-task__P5zyqoT | 16/16 | 4/11 | 0.0 |
| tbench-task__rT582UM | 15/16 | 4/11 | 0.0 |

**tbench-task__6orhWnM** was the best performer at 8/11 e2e tests, the only trial with passing bridge-creation via mouse clicks.

---

### 2. Common Failure Patterns

**Bug A — Controls div above SVG (4 trials: fLd3RZX, GCCnRTA, 2HhAehu, rT582UM):**
The most prevalent failure. Agents placed a `<div className="controls">` above the SVG, pushing it down the page. The spec explicitly states the SVG must be *"anchored to the viewport top-left — no centering, no page padding."* Tests click at absolute pixel (80, 80) for the island at grid (2,2); any vertical offset causes all coordinate-dependent clicks to miss. This single mistake cascaded into 5–7 e2e failures per trial.

**Bug B — Mouse click events silently failing (2 trials: P5zyqoT, rT582UM partially):**
Despite correct logic (unit tests pass), `onIslandClick` handlers didn't fire for mouse events in the headless browser. The root cause was likely related to SVG event binding or z-index stacking issues. Both trials passed keyboard navigation tests but failed all mouse-based tests.

**Bug C — Right/ctrl-click handlers on islands, not bridge lines (5/6 trials):**
The spec says *"Right-click or Ctrl+click on an existing bridge removes it entirely,"* and tests click the **midpoint of the bridge line** (e.g., pixel 160, 80). Every agent except (arguably) 6orhWnM attached `onContextMenu` to island `<circle>` elements rather than `<line>` elements, causing right-click and ctrl-click removal tests to fail.

**Bug D — Self-connection in `canAddBridge` (2 trials: fLd3RZX, rT582UM):**
`canAddBridge(id, id)` returned `{ valid: true }` instead of `{ valid: false }`. A minor spec omission (the four error strings are listed but `from === to` isn't explicitly covered), though the expected behavior is reasonable.

**Bug E — Error banner not clearing (1 trial: 6orhWnM):**
`selectedId` was not reset after an error, so the subsequent valid move deselected/reselected rather than creating a bridge, preventing error clearance.

---

### 3. Hack Check
**No reward hacking detected.** All 6 trials received `reward_hacking: pass`. No agent accessed `solution/`, modified test files, or wrote to reward files. All work was legitimate implementation.

---

### 4. Systematic Instruction Issues

One genuine spec gap: the **self-connection case in `canAddBridge`** — the spec lists four valid error strings but doesn't explicitly state what to return when `from === to`. Two agents returned `valid: true`, failing the unit test. This is a minor but fixable omission.

Otherwise, all major failures stem from agents **not following explicit requirements**, not from spec gaps:
- "No centering, no page padding" → ignored by 4/6 agents
- "Right-click on an existing bridge" → bridge line interaction ignored by 5/6 agents

The spec is sufficiently detailed; the failures are implementation errors.

---

### 5. Progress for Failed Trials

| Trial | Closest Gap | Key Missing Piece |
|-------|-------------|-------------------|
| 6orhWnM | 8/11 (73%) | Right-click on line elements + error-clear bug |
| fLd3RZX | 4/11 (36%) | Controls div offset + right-click on lines |
| GCCnRTA | 4/11 (36%) | Controls div offset |
| 2HhAehu | 4/11 (36%) | Controls div offset + click event registration |
| P5zyqoT | 4/11 (36%) | Silent mouse-click failure + right-click on lines |
| rT582UM | 4/11 (36%) | Silent click failure + controls div offset + self-connection |

The 4 passing tests across most trials were always the same: initial render, puzzle change resets board, keyboard navigation, and Escape cancels selection — all tests that don't require absolute-pixel mouse clicks.

---

### 6. Key Differences Between Agents

Only one agent (6orhWnM) correctly implemented mouse-click bridge creation without layout offset bugs, getting 2× more passing e2e tests than the rest. The critical differentiator was correctly positioning the SVG at the viewport top-left. All agents implemented the game logic correctly (unit tests), but most stumbled on the same two UI/event-handling requirements: SVG anchoring and bridge-line click targets. A targeted fix of just these two issues (move controls *inside* the SVG or below it; add `onContextMenu`/`onClick` handlers to `<line>` elements) would likely push the best agent to 10–11/11 e2e tests. |
<!-- test-summary-end -->