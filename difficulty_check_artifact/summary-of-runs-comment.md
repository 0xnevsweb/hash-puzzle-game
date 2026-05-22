## Summary of Runs for "tbench-task"
### Difficulty: hard
| Agent/Model | # of total runs | # of successes | # of failures<br>(agent timeout) | # of failures<br>(other reasons) | Accuracy |
|-------------|-----------------|-----------------|------------------------------------|---------------|----------|
| nop | 1 | 0 | 0 | 1 | 0.0 |
| oracle | 3 | 3 | 0 | 0 | 1.0 |
| terminus-claude-opus-4-6 | 5 | 0 | 0 | 5 | 0.0 |
| terminus-gpt5-2 | 5 | 0 | 0 | 5 | 0.0 |
<details>
<summary>Tests Result</summary>

⚠️ Some tests are not passed by any agent run. It's not clear if this task is solvable or simply super hard.
| Test Name | Successful Runs / Total Runs |
|-------------|------------------------------|
</details>

### Analysis on Agent Failures
| Check       | Outcome  | Explanation              |
|-------------|----------|--------------------------|
| Task Instruction Sufficiency | ❌ FAIL | ## Job Summary: Hashi Puzzle React Game (10 Trials)

---

### 1. Overall Results
**0/10 trials passed** (reward 0.0 across the board — binary all-or-nothing grading). Unit test performance was universally perfect: all 10 trials passed all 16 `hashiLogic.js` unit tests, confirming solid game logic. E2E results varied widely:

| Trial | E2E Passed | Unit Tests |
|---|---|---|
| H75Vu72, tACcoq7 | **7/8** | 16/16 |
| HNZHgid, RWfECF6, 6vfAoaC, fqiTKNy, hWBLy3d | **3/8** | 16/16 |
| LudGz2M, tWzJMnj, bZeij5v | **2/8** | 16/16 |

---

### 2. Common Failure Patterns

**Pattern A — SVG not anchored to viewport top-left (8/10 trials):** The dominant failure across nearly every trial. Agents placed a controls bar (puzzle selector + Reset button) *above* the SVG in normal document flow, shifting the SVG downward. The E2E tests click at absolute page coordinates assuming the SVG starts at `(0,0)` — e.g., clicking `(80,80)` to hit the island at grid `(2,2)`. With a header div offset, clicks land in the control bar instead of on islands. Affected: **HNZHgid, RWfECF6, 6vfAoaC, LudGz2M, fqiTKNy, hWBLy3d**, and a variant in **tWzJMnj** (used `position: absolute; top: 0; left: 0` causing the SVG to *overlay* the controls, blocking Reset button clicks instead). The spec was unambiguous: *"The board is a single SVG of 800×600 anchored to the viewport top-left — no centering, no page padding."*

**Pattern B — Right-click handler missing from bridge elements (3–4 trials):** Agents wired right-click handlers only to island `<circle>` elements, not to bridge `<line>` elements. Tests right-click at bridge midpoints to test removal. Affected: **HNZHgid, RWfECF6, 6vfAoaC** (and likely others where coordinate failures masked this).

**Pattern C — Keyboard navigation requires global focus (tACcoq7):** The agent used `onKeyDown` on a `tabIndex={0}` div rather than a `window`/`document` event listener. The test explicitly blurs all elements before pressing keys, so keyboard events weren't captured. This was the *only* failure for this otherwise near-perfect trial.

**Pattern D — Puzzle change not clearing bridges (H75Vu72):** The `onChange` handler for the puzzle selector didn't fully reset the bridges state — a single `<line>` remained after switching puzzles.

**Pattern E — Click/bridge rendering broken in build (bZeij5v):** A distinct failure where all 16 unit tests passed but clicking islands in the E2E browser produced zero `<line>` elements, suggesting a runtime wiring bug specific to the deployed build.

---

### 3. Hack Check
**No cheating detected in any trial.** All 10 trials received `reward_hacking: pass`. No agent accessed the `solution/` directory, modified test files, or wrote to reward files. All work was constructive implementation under `/app/src/`.

---

### 4. Systematic Instruction Issues

One spec gap was flagged: **tACcoq7** received `task_specification: fail`. The keyboard test blurs all focused elements before pressing keys, which implicitly requires a global (document/window-level) keyboard listener — but the instructions only say *"Arrow keys move a cursor... Enter selects an island"* without specifying focus-independence. An agent implementing `onKeyDown` on a focusable container is following a reasonable interpretation of the spec. All other 9 trials received `task_specification: pass` — the SVG layout and right-click requirements were considered clear.

**However**, the near-universal failure on Pattern A suggests a practical spec enforcement gap: 8/10 agents ignored or misread the "anchored to viewport top-left" constraint. The requirement may benefit from additional framing (e.g., explicitly warning *"do not place any element above the SVG in the DOM"* or providing a CSS snippet).

---

### 5. Progress (Failed Trials)

Agents got the *hard* part right (game logic, build, unit tests) but failed on *layout and event-wiring* details:
- **Top tier (87.5%):** H75Vu72, tACcoq7 — one bug each, both minor and fixable
- **Mid tier (37.5%):** HNZHgid, RWfECF6, 6vfAoaC, fqiTKNy, hWBLy3d — layout bug + right-click bug
- **Low tier (25%):** LudGz2M, tWzJMnj, bZeij5v — layout/positioning bugs plus secondary failures

Average E2E pass rate: **3.3/8 (41%)**, but unit test pass rate: **100%**.

---

### 6. Key Takeaways

The task is essentially solved (logic-wise) — every agent nailed the 16 unit tests. The binary grading scheme means a single bug costs 100% of reward. The highest-leverage fix for future runs would be a **stronger rendering constraint** in the instructions (e.g., forbidding any DOM sibling above the SVG, providing a starter CSS skeleton with `margin: 0; padding: 0` on `body`), and adding an explicit note that **keyboard handlers must work regardless of focus state**. |
<!-- test-summary-end -->