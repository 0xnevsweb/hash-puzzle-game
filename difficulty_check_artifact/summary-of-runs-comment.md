## Summary of Runs for "tbench-task"
### Difficulty: medium
| Agent/Model | # of total runs | # of successes | # of failures<br>(agent timeout) | # of failures<br>(other reasons) | Accuracy |
|-------------|-----------------|-----------------|------------------------------------|---------------|----------|
| nop | 1 | 0 | 0 | 1 | 0.0 |
| oracle | 3 | 3 | 0 | 0 | 1.0 |
| terminus-claude-opus-4-6 | 5 | 5 | 0 | 0 | 1.0 |
| terminus-gpt5-2 | 5 | 2 | 0 | 3 | 0.4 |
<details>
<summary>Tests Result</summary>

⚠️ Some tests are not passed by any agent run. It's not clear if this task is solvable or simply super hard.
| Test Name | Successful Runs / Total Runs |
|-------------|------------------------------|
</details>

### Analysis on Agent Failures
| Check       | Outcome  | Explanation              |
|-------------|----------|--------------------------|
| Task Instruction Sufficiency | ✅ PASS | ## Job Summary: React Hashi Puzzle Game

### 1. Overall Results
**0/3 trials passed** (all scored 0.0 reward due to binary/all-or-nothing grading). No agent information was provided, so model/agent differentiation isn't possible from this data.

---

### 2. Common Failure Patterns

Two distinct failure modes emerged:

**Pattern A — `useEffect` timing bug (2/3 trials: `EC6z9dB`, `Vi3PPvp`)**
Both agents used a React `useEffect` hook keyed on `[puzzleName]` to clear bridge state on puzzle change. This creates a two-render sequence: render 1 shows stale bridges, render 2 clears them. The test snapshot fires between renders, finding 1 `<line>` element instead of 0. The fix is trivially simple — reset state inline in the `onChange` handler. Both agents passed 26/27 tests, making this a high-leverage miss.

**Pattern B — SVG layout offset (1/3 trials: `fjbMKmS`)**
This agent added a control toolbar div above the SVG, violating the explicit "no page padding, anchored to viewport top-left" requirement. Since e2e tests hard-code pixel coordinates assuming SVG origin at (0,0), all mouse-based tests failed. Only 4/11 e2e tests passed (those not relying on pixel-accurate clicks).

---

### 3. Hack Check
**No cheating detected.** All three trials passed the `reward_hacking` check. Agents wrote legitimate source code in `/app/src/`, ran real builds, and did not access `solution/`, modify test files, or write to reward files.

---

### 4. Instruction Issues
**No systematic instruction gaps.** Both checks flagged `task_specification: pass` across all trials. The spec was explicit on both failure points:
- *"clearing the bridges map... in the same state update that swaps the puzzle, so the next render shows zero `<line>` elements"* — directly rules out `useEffect`
- *"single SVG of 800x600 anchored to the viewport top-left — no centering, no page padding"* — directly rules out toolbar layouts

These are agent execution failures, not specification ambiguities.

---

### 5. Progress (How Close Did Agents Get?)

| Trial | Unit Tests | E2E Tests | Total | Gap |
|---|---|---|---|---|
| `EC6z9dB` | 16/16 | 10/11 | 26/27 | 1 test, ~5-line fix |
| `Vi3PPvp` | 16/16 | 10/11 | 26/27 | 1 test, ~5-line fix |
| `fjbMKmS` | 16/16 | 4/11 | 20/27 | 7 tests, layout restructure needed |

`EC6z9dB` and `Vi3PPvp` were extremely close — a single `onChange` handler change would have yielded a passing score. `fjbMKmS` had a broader layout problem affecting 7 tests, requiring more significant refactoring.

---

### 6. Key Observations
- The `useEffect` anti-pattern appeared independently in 2/3 agents, suggesting this is a common React pitfall that agents default to when the spec requires more careful state co-location
- All agents successfully implemented the core game logic (16/16 unit tests passed universally), indicating the algorithmic challenge was well within capability
- The binary scoring policy is particularly punishing here — the two near-miss trials (96% test passage) scored identically to a hypothetical 0% run |
<!-- test-summary-end -->