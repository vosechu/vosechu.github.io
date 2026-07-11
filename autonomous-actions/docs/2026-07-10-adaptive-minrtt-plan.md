# Adaptive minRTT Controller Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the inert bulkhead default and replace the frozen-baseline adaptive controller with a passive minRTT gradient controller that learns each dependency's floor and sheds only when a queue climbs above it.

**Architecture:** All three tasks land on one branch (`adaptive-minrtt-controller`) and ship as one PR. The engine (`src/engine.js`) stays deterministic: injected clock, seeded rng, no `Date.now`/`Math.random`/DOM. The controller reads completed per-dependency latency (p95 of `recentByTarget`), not in-flight leg age.

**Tech Stack:** Vanilla ES modules, `node:test` + `node:assert/strict`. Run tests with `npm test` from `autonomous-actions/`.

## Global Constraints

- No em dashes in any committed text (code, comments, copy, commit messages).
- Deterministic engine: no `Date.now`, `Math.random`, or DOM access in `src/engine.js`.
- Tests ship in the same commit as the code they test.
- A test that has passed the red-green cycle gets an AI-DEV marker as its first line: `// AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.`
- **If a pre-existing AI-DEV-marked test fails after Task 1's default change, the default is wrong, not the test.** Adjust the default; never edit an AI-DEV test. The only AI-DEV tests this plan removes are the four named in Task 2 (approved spec change).
- Constants live in `src/config.js` and are imported; no unnamed magic numbers in `engine.js`.

## File Structure

- `src/config.js` — default config + tuning constants. Task 1 changes two defaults; Task 2 adds `ADAPTIVE_HEADROOM`.
- `src/engine.js` — the `Sim` class. Task 2 replaces `_runAdaptive`, removes `_maxInflightAge`.
- `test/engine.test.js` — Task 1 adds one test; Task 2 removes four old adaptive tests and adds four new ones.
- `src/controls.js` — Task 3 updates the adaptive toggle's object shape and the tour readout line.
- `src/scenarios.js` — Task 3 rewrites the adaptive act's copy.

---

### Task 1: Fix the inert bulkhead default

The bulkhead can never reject when its size equals the worker pool, and the dependency never queues when its capacity equals the pool, because per-dependency concurrency can never exceed the pool. Drop both defaults below the pool.

**Files:**
- Modify: `src/config.js` (the `DEFAULT_CAPACITY` const and the `target` factory's `bulkheadSize`)
- Test: `test/engine.test.js`

**Interfaces:**
- Consumes: `defaultConfig()`, `Sim`, the file-local `run(sim, from, to, step)` and `makeRng(seed)` helpers already defined at the bottom of the test file.
- Produces: nothing new; behavior-only change to defaults.

- [ ] **Step 1: Write the failing test**

Add this test to `test/engine.test.js` (near the other bulkhead tests, after the `'a bulkhead rejection counts as an error and trips the breaker'` test). No AI-DEV marker yet.

```js
test('at the default settings a full bulkhead rejects overflow and a downstream queue forms', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 200;
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(101), config: cfg });
  sim.tick(0);
  run(sim, 50, 3000, 50);
  const s = sim.getState();
  assert.ok(s.counters.reject > 0);   // bulkheadSize below the pool, so overflow is rejected
  const queued = Object.values(s.targets).some((t) => t.upstream.queueDepth > 0);
  assert.ok(queued);                    // capacity below the pool, so calls queue at the dependency
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd autonomous-actions && npm test`
Expected: the new test FAILS (`reject` is 0 and no queue forms, because the defaults still sit at the pool size). All other tests pass.

- [ ] **Step 3: Change the defaults**

In `src/config.js`, change `DEFAULT_CAPACITY` from `30` to `12`:

```js
export const DEFAULT_CAPACITY = 12;    // callee-side service slots; below the pool so a queue can form
```

In the `target` factory, change `bulkheadSize: 30` to `bulkheadSize: 24`:

```js
    breaker: null, bulkheadSize: 24, adaptive: null, timeoutMs: 30000, color, abbrev, label, note,
```

- [ ] **Step 4: Run the whole suite to verify green**

Run: `cd autonomous-actions && npm test`
Expected: all tests PASS, including the new one. If any pre-existing AI-DEV test now fails, the chosen default is wrong — adjust the default (not the test) until green.

- [ ] **Step 5: Add the AI-DEV marker and commit**

Add as the new test's first line inside the function body:
```js
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
```

```bash
git add src/config.js test/engine.test.js
git commit -m "fix(sim): drop bulkhead and capacity defaults below the worker pool so they engage"
```

---

### Task 2: Passive minRTT gradient controller

Replace the frozen-baseline `_runAdaptive` with a controller that learns each dependency's floor (running minimum of completed p95) and sizes the pool by the gradient `floor / current`. Remove `_maxInflightAge` (it becomes unused, and reading in-flight age is exactly what misleads a floor on a slow-but-fine dependency).

**Approved spec change:** this removes four AI-DEV-marked tests that encode the old proportional-baseline behavior (`'adaptive bulkhead settles at the floor under very high latency'`, `'adaptive bulkhead opens to the max under healthy latency'`, `'adaptive bulkhead settles at a middling size for middling latency'`, `'adaptive reacts to a slow dependency before any call completes'`). The user approved replacing `_runAdaptive`, which necessarily changes what these assert. New tests replace them and get AI-DEV markers after the red-green cycle.

**Files:**
- Modify: `src/config.js` (add `ADAPTIVE_HEADROOM`)
- Modify: `src/engine.js` (import line, replace `_runAdaptive`, remove `_maxInflightAge`)
- Test: `test/engine.test.js` (remove four tests, add four)

**Interfaces:**
- Consumes: `ADAPTIVE_MIN`, `ADAPTIVE_HEADROOM` from config; `this._percentileOf(list, p)`, `this.recentByTarget[name]`, `this.config.workerPoolSize` in the engine.
- Produces: on each enabled `target.adaptive`, the controller writes `floorMs` (learned floor), `target` (desired size), `observedMs` (current p95), and `decision` (`'shedding'|'opening up'|'steady'`) for the readout. The adaptive object shape is `{ enabled, sampleWindowMs, lastSampleMs, floorMs }` — no `baselineLatencyMs`.

- [ ] **Step 1: Add the headroom constant**

In `src/config.js`, below `ADAPTIVE_MIN`:

```js
export const ADAPTIVE_HEADROOM = 4;    // a healthy pool grows by this many slots per sample, so it keeps probing upward
```

- [ ] **Step 2: Remove the four old adaptive tests**

Delete these four tests from `test/engine.test.js` (currently the last four in the file): `'adaptive bulkhead settles at the floor under very high latency'`, `'adaptive bulkhead opens to the max under healthy latency'`, `'adaptive bulkhead settles at a middling size for middling latency'`, and `'adaptive reacts to a slow dependency before any call completes'`.

- [ ] **Step 3: Write the four new failing tests**

Add these to `test/engine.test.js` where the deleted tests were. No AI-DEV markers yet. (`oneTarget`, `run`, `makeRng`, `ADAPTIVE_MIN` are already imported/defined in the file.)

```js
test('adaptive learns the dependency floor and opens toward the pool under healthy latency', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 10;
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ latencyMs: 50, capacity: 50, bulkheadSize: 8,
    adaptive: { enabled: true, sampleWindowMs: 500, lastSampleMs: 0, floorMs: null } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(201), config: cfg });
  sim.tick(0);
  run(sim, 50, 12000, 50);
  assert.equal(sim.config.targets.C.adaptive.floorMs, 50);              // learned the unloaded latency
  assert.equal(sim.config.targets.C.bulkheadSize, cfg.workerPoolSize);  // opened to the pool
});

test('adaptive sheds a queuing dependency and settles between the floor and the pool', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 2;                  // healthy warm-up: demand below capacity, no queue
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ latencyMs: 50, capacity: 4, bulkheadSize: 20,
    adaptive: { enabled: true, sampleWindowMs: 500, lastSampleMs: 0, floorMs: null } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(202), config: cfg });
  sim.tick(0);
  run(sim, 50, 3000, 50);                     // learns the floor while healthy
  assert.equal(sim.config.targets.C.adaptive.floorMs, 50);
  sim.config.requestRatePerSec = 200;          // overload: demand far above capacity, queue climbs
  run(sim, 3050, 9000, 50);
  const size = sim.config.targets.C.bulkheadSize;
  assert.ok(size < 20);                                              // shed from where it started
  assert.ok(size > ADAPTIVE_MIN && size < cfg.workerPoolSize);       // a middle, not collapsed, not open
});

test('adaptive does not shed a dependency that is slow but not queuing', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 10;
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ latencyMs: 8000, capacity: 50, bulkheadSize: 8,
    adaptive: { enabled: true, sampleWindowMs: 1000, lastSampleMs: 0, floorMs: null } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(203), config: cfg });
  sim.tick(0);
  run(sim, 50, 20000, 50);
  assert.equal(sim.config.targets.C.adaptive.floorMs, 8000);           // floor is the flat slow latency
  assert.equal(sim.config.targets.C.bulkheadSize, cfg.workerPoolSize); // stayed open, not shed
});

test('adaptive leaves the pool untouched when adaptive is disabled', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 200;
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ latencyMs: 50, capacity: 4, bulkheadSize: 15,
    adaptive: { enabled: false, sampleWindowMs: 500, lastSampleMs: 0, floorMs: null } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(204), config: cfg });
  sim.tick(0);
  run(sim, 50, 5000, 50);
  assert.equal(sim.config.targets.C.bulkheadSize, 15);                 // unchanged: the controller is off
});
```

- [ ] **Step 4: Run the new tests to verify they fail**

Run: `cd autonomous-actions && npm test`
Expected: the four new tests FAIL (the old controller uses `baselineLatencyMs` and `_maxInflightAge`, so `floorMs` is never set and sizing differs). This confirms the tests exercise the new behavior.

- [ ] **Step 5: Replace the controller**

In `src/engine.js`, add `ADAPTIVE_HEADROOM` to the import on line 1:

```js
import { FAST_FAIL_MS, LATENCY_SAMPLE_SIZE, ADAPTIVE_MIN, ADAPTIVE_HEADROOM } from './config.js';
```

Replace the whole `_runAdaptive` method (its comment block and body) with:

```js
  // Passive minRTT gradient controller (the Netflix Gradient2 / TCP Vegas family).
  // It reads COMPLETED latency, never in-flight leg age: age ramps from zero to the
  // full response time for any slow call, so a floor learned from it would misread a
  // merely-slow dependency as overloaded and shed it. Completed latency stays flat
  // when a dependency is slow-but-fine, so only a queue climbing above the learned
  // floor pulls the gradient below 1 and sheds the pool. It floats up to the live
  // worker pool size. Known limit: the floor is learned from live traffic, so a
  // dependency overloaded from the very first sample learns an inflated floor; every
  // scenario warms up healthy first, which is how real controllers behave.
  _runAdaptive(nowMs) {
    if (!this.config.bulkheadsEnabled) return;
    for (const [name, target] of Object.entries(this.config.targets)) {
      const a = target.adaptive;
      if (!a || !a.enabled) continue;
      if (nowMs - a.lastSampleMs < a.sampleWindowMs) continue;
      const current = this._percentileOf(this.recentByTarget[name], 95);
      if (current <= 0) continue;            // no completed sample yet, so nothing to learn from
      a.lastSampleMs = nowMs;
      a.floorMs = a.floorMs == null ? current : Math.min(a.floorMs, current);
      const gradient = Math.min(1, a.floorMs / Math.max(current, 1));
      const prev = target.bulkheadSize;
      const desired = Math.max(ADAPTIVE_MIN,
        Math.min(this.config.workerPoolSize, Math.round(prev * gradient + ADAPTIVE_HEADROOM)));
      target.bulkheadSize = desired;
      a.target = desired;         // exposed for the readout
      a.observedMs = current;     // the latency signal that drove this decision
      a.decision = desired < prev ? 'shedding' : desired > prev ? 'opening up' : 'steady';
    }
  }
```

- [ ] **Step 6: Remove the now-unused `_maxInflightAge`**

Confirm nothing else references it:

Run: `cd autonomous-actions && grep -rn "_maxInflightAge" src test`
Expected: after removing the method, zero matches. Delete the `_maxInflightAge` method (its comment block and body) from `src/engine.js`.

- [ ] **Step 7: Run the whole suite to verify green**

Run: `cd autonomous-actions && npm test`
Expected: all tests PASS, including the four new adaptive tests, and no regressions in the untouched AI-DEV tests.

- [ ] **Step 8: Add AI-DEV markers and commit**

Add as the first line inside each of the four new adaptive test functions:
```js
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
```

Run `npm test` once more to confirm still green, then:

```bash
git add src/config.js src/engine.js test/engine.test.js
git commit -m "feat(sim): learn-the-floor minRTT gradient controller replaces frozen baseline"
```

---

### Task 3: Wire the readout and act copy

The controller no longer uses `baselineLatencyMs`; the toggle must build the new adaptive shape and the readout must show the learned floor. The adaptive act's copy must walk the player through warm-up-then-overload on a capacity-limited dependency.

**Files:**
- Modify: `src/controls.js` (the `adaptiveToggle` object shape + comment, and the tour readout line)
- Modify: `src/scenarios.js` (the `'Response: adaptive sizing'` act copy)

**Interfaces:**
- Consumes: `a.observedMs`, `a.floorMs`, `a.decision` written by the Task 2 controller; the `dur`, `labelOf` helpers already in `controls.js`.
- Produces: no new interface; display + copy only. No tests (DOM/copy layer; the engine tests cover the behavior).

- [ ] **Step 1: Update the adaptive toggle to build the new shape**

In `src/controls.js`, replace the `adaptiveToggle` comment (the three-line block above the function) with:

```js
// One service-level toggle makes every dependency's bulkhead adaptive. Each learns
// its own floor from live traffic (the response time it sees with nothing queued),
// so a dependency whose queue grows sheds while the rest stay open.
```

Replace the two branch lines inside the `if (checked)` block:

```js
        if (!t.adaptive) t.adaptive = { enabled: true, sampleWindowMs: 400, lastSampleMs: 0, floorMs: null };
        else { t.adaptive.enabled = true; t.adaptive.floorMs = null; }   // re-learn the floor on re-enable
```

- [ ] **Step 2: Update the tour readout line**

In `src/controls.js`, replace the two lines that compute `decision` and set `readoutElement.textContent` (currently referencing `a.baselineLatencyMs`) with:

```js
    const decision = a.decision || 'steady';
    readoutElement.textContent = `${labelOf(adaptiveName)} pool ${t.bulkheadSize}/${sim.config.workerPoolSize} · latency ${dur(Math.round(a.observedMs || 0))} vs floor ${dur(Math.round(a.floorMs || 0))} · ${decision}`;
```

- [ ] **Step 3: Rewrite the adaptive act copy**

In `src/scenarios.js`, replace the `instruction` and `caption` of the `'Response: adaptive sizing'` act with:

```js
    instruction: 'Reset to defaults, then turn on adaptive sizing while traffic is healthy so it can learn each dependency\'s normal response time. Now push the request rate up until Reports has more calls than it can serve and its queue grows, and watch its pool shed toward the number it can actually handle. Drop the rate back down and watch it reopen.',
    caption: 'A fixed pool is a guess that goes stale as traffic shifts. Adaptive sizing learns the floor, the response time it sees when nothing is queued, then sizes on how far latency has climbed above that floor rather than on the raw number. So a dependency that is simply slow, like a database with naturally high and variable response times, is left alone, while one whose queue is growing gets shed until the queue clears. It lags a real shift by a sample or two and it has to see healthy traffic first to learn the floor, but that is one forgiving knob instead of a brittle per-dependency guess, and anything already measuring per-call latency, like an APM agent, can hold this SLO on every connection with almost nothing to tune.',
```

- [ ] **Step 4: Verify the suite still passes and the toggle has no stale references**

Run: `cd autonomous-actions && npm test`
Expected: all tests PASS (no test changes this task).

Run: `cd autonomous-actions && grep -rn "baselineLatencyMs" src test`
Expected: zero matches (the old field is fully gone).

- [ ] **Step 5: Syntax-check the touched modules and commit**

Run: `cd autonomous-actions && node --check src/controls.js && node --check src/scenarios.js`
Expected: no output (both parse).

```bash
git add src/controls.js src/scenarios.js
git commit -m "feat(sim): show learned floor in the adaptive readout; rewrite the adaptive act"
```

---

## Self-Review

- **Spec coverage:** Task 1 covers "fix the inert default"; Task 2 covers the controller (learn floor, gradient sizing, drop in-flight age, replace old tests) and the six behaviors in the spec's test list; Task 3 covers the readout and act copy. All spec sections map to a task.
- **Type consistency:** the adaptive object shape `{ enabled, sampleWindowMs, lastSampleMs, floorMs }` is identical in the tests (Task 2), the toggle (Task 3), and what the controller reads/writes. `a.decision`, `a.target`, `a.observedMs`, `a.floorMs` are written in Task 2 and read in Task 3.
- **Placeholder scan:** every code step carries the exact code; no TBD/TODO.
- **AI-DEV boundary:** only the four named old adaptive tests are removed (approved). Every other AI-DEV test is untouched; if one breaks under Task 1, the default is adjusted, not the test.

## Manual verification (after Task 3, before finishing)

Serve and click through the adaptive act to confirm the readout shows `latency … vs floor …` and the pool sheds under load then reopens:

Run: `cd autonomous-actions && npx serve` then open the adaptive act.

## PR breakdown

This is a single feature branch (`adaptive-minrtt-controller`) shipping as one PR. The three tasks are its three commits, dependency-ordered: (1) the inert-default fix stands alone and is the smallest shippable slice; (2) the controller depends on nothing from Task 1 but is grouped here as the behavior it enables; (3) the readout and copy depend on the fields Task 2 writes. After Task 3, use superpowers:finishing-a-development-branch to push and open the PR.

