# Autonomous actions simulator implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a buildless JavaScript simulator that teaches circuit breakers and bulkheads by animating a real discrete-event engine, with a six-act guided tour that unlocks free-play.

**Architecture:** A pure, deterministic engine (`engine.js`) owns all simulation state: a finite worker pool, per-dependency connection pools, circuit breakers, timeouts, and an adaptive controller. A render layer reads engine state each animation frame and draws an SVG topology. Scenarios and controls drive the engine. The engine has zero browser dependencies so it runs under Node's test runner.

**Tech Stack:** Vanilla JavaScript (ES modules), SVG and CSS for rendering, `node:test` plus `node:assert` for tests, no bundler and no runtime dependencies.

## Global constraints

- No runtime dependencies. No framework, no bundler. `package.json` carries only a `test` script.
- Tests run on `node:test` + `node:assert`. Zero test dependencies.
- The engine is pure: no DOM, no `window`, no `requestAnimationFrame`, no `Date.now()`, no `Math.random()`. Time comes from an injected clock; randomness from an injected seeded RNG.
- Same seed plus same config plus same tick sequence produces an identical run.
- Prose and UI copy use US English. No em dashes in any committed text.
- Confirmed tests carry an `// AI-DEV:` marker inside the test body once they pass red-green-refactor. Never edit a marked test to make it pass; fix the code.
- Every source file ships with its tests in the same commit.

---

## File structure

- `autonomous-actions/index.html`: imports the modules via `<script type="module">`, holds the SVG root and control panel markup.
- `autonomous-actions/src/engine.js`: the `Sim` class plus pure helpers (`resolveOutcome`, `chooseTarget`, breaker and adaptive logic). The tested unit.
- `autonomous-actions/src/scenarios.js`: the six act definitions as data. No logic.
- `autonomous-actions/src/render.js`: reads `sim.getState()` and draws topology, worker grid, tokens, queue, breakers, metrics.
- `autonomous-actions/src/controls.js`: wires sliders and act navigation to the engine, runs the `requestAnimationFrame` loop.
- `autonomous-actions/src/config.js`: the default config object and named constants (pool sizes, fault durations, adaptive bounds).
- `autonomous-actions/test/engine.test.js`: all engine unit tests.
- `autonomous-actions/package.json`: `"test": "node --test"`.
- `autonomous-actions/README.md`: what it teaches, how to serve it, link to the live site.

The canonical engine API, referenced by every task:

```javascript
// A clock is any object with now(): number (milliseconds).
// An rng is any function () => number in [0, 1).
export class Sim {
  constructor({ clock, rng, config }) {}
  tick(nowMs) {}          // advance simulation to absolute time nowMs
  setConfig(patch) {}     // shallow-merge live control changes into config
  getState() {}           // return a snapshot object (see below)
}
```

`getState()` returns:

```javascript
{
  nowMs,
  workers: { size, busy, free, byTarget },     // byTarget: { [name]: count }
  queue: { depth },
  targets: {
    // per dependency:
    // { inFlight, bulkhead: { enabled, size, busy, free } | null,
    //   breaker: { state, errorsInWindow } | null }
  },
  counters: { success, error, timeout, reject, breakerOpen },  // cumulative
  rates: { successPerSec, errorPerSec, rejectPerSec },
  latency: { p50, p95 },                        // observed, ms, over recent completions
  required: { workers },                        // Little's Law: ratePerSec * avgHoldSec
}
```

Config shape (defined in `config.js`, Task 1):

```javascript
{
  requestRatePerSec: 20,
  workerPoolSize: 20,
  bulkheadsEnabled: false,
  timeoutMs: 30000,
  targets: {
    'Service B': { weight: 1, baseLatencyMs: 50, fault: 'none', slowLatencyMs: 8000,
                   breaker: null, bulkheadSize: 6, adaptive: null },
    'Service C': { weight: 1, baseLatencyMs: 50, fault: 'none', slowLatencyMs: 8000,
                   breaker: null, bulkheadSize: 6, adaptive: null },
    'Database A': { weight: 1, baseLatencyMs: 30, fault: 'none', slowLatencyMs: 8000,
                    breaker: null, bulkheadSize: 6, adaptive: null },
    'External': { weight: 1, baseLatencyMs: 120, fault: 'none', slowLatencyMs: 8000,
                  breaker: null, bulkheadSize: 6, adaptive: null },
  },
}
```

A `breaker` object, when present: `{ enabled, errorThreshold, windowMs, cooldownMs, state, openedAtMs, errorTimestamps }`.
An `adaptive` object, when present: `{ enabled, minSize, maxSize, sampleWindowMs, baselineLatencyMs, lastSampleMs }`.

---

## Task 1: Repo scaffold, config, and README

**Files:**
- Create: `autonomous-actions/package.json`
- Create: `autonomous-actions/src/config.js`
- Create: `autonomous-actions/test/engine.test.js`
- Create: `autonomous-actions/README.md`
- Create: `autonomous-actions/index.html`
- Create: `autonomous-actions/src/engine.js` (empty stub exporting `Sim`)

**Interfaces:**
- Produces: `defaultConfig()` returning the config object above; named constants `FAST_FAIL_MS`, `LATENCY_SAMPLE_SIZE`, `ADAPTIVE_MIN`, `ADAPTIVE_MAX`.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "autonomous-actions",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test" }
}
```

- [ ] **Step 2: Write `src/config.js`**

```javascript
export const FAST_FAIL_MS = 5;         // a clipped connection fails almost instantly
export const LATENCY_SAMPLE_SIZE = 50; // completions kept for p50/p95
export const ADAPTIVE_MIN = 2;
export const ADAPTIVE_MAX = 40;

export function defaultConfig() {
  const target = (baseLatencyMs) => ({
    weight: 1, baseLatencyMs, fault: 'none', slowLatencyMs: 8000,
    breaker: null, bulkheadSize: 6, adaptive: null,
  });
  return {
    requestRatePerSec: 20,
    workerPoolSize: 20,
    bulkheadsEnabled: false,
    timeoutMs: 30000,
    targets: {
      'Service B': target(50),
      'Service C': target(50),
      'Database A': target(30),
      'External': target(120),
    },
  };
}
```

- [ ] **Step 3: Write the `Sim` stub in `src/engine.js`**

```javascript
export class Sim {
  constructor({ clock, rng, config }) {
    this.clock = clock;
    this.rng = rng;
    this.config = config;
  }
  tick(_nowMs) {}
  setConfig(patch) { Object.assign(this.config, patch); }
  getState() { return { nowMs: this.clock.now() }; }
}
```

- [ ] **Step 4: Write a placeholder passing test in `test/engine.test.js`**

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim } from '../src/engine.js';
import { defaultConfig } from '../src/config.js';

const fixedClock = (ms) => ({ now: () => ms });
const seededRng = () => 0.5;

test('Sim constructs and reports the clock time', () => {
  const sim = new Sim({ clock: fixedClock(1000), rng: seededRng, config: defaultConfig() });
  assert.equal(sim.getState().nowMs, 1000);
});
```

- [ ] **Step 5: Run the test**

Run: `cd autonomous-actions && npm test`
Expected: 1 test passing.

- [ ] **Step 6: Write `index.html` and `README.md`**

`index.html`:

```html
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Autonomous actions</title></head>
<body>
  <svg id="stage" viewBox="0 0 1200 600" role="img" aria-label="system topology"></svg>
  <div id="panel"></div>
  <script type="module" src="./src/controls.js"></script>
</body>
</html>
```

`README.md` states: what it teaches (circuit breakers fail on slow dependencies; bulkheads fix it), how to serve it (`npx serve` or `python3 -m http.server`, then open the served URL, not the file), why `file://` will not work, and where the live site lives once Task 11 deploys it.

- [ ] **Step 7: Commit**

```bash
git add autonomous-actions/package.json autonomous-actions/src autonomous-actions/test autonomous-actions/index.html autonomous-actions/README.md
git commit -m "feat(autonomous-actions): scaffold, config, and passing test harness"
```

---

## Task 2: Engine core (pool, arrivals, lifecycle to success)

**Files:**
- Modify: `autonomous-actions/src/engine.js`
- Modify: `autonomous-actions/test/engine.test.js`

**Interfaces:**
- Consumes: `defaultConfig()` from `config.js`.
- Produces: `chooseTarget(targets, r)` returning a target name; `resolveOutcome(target, timeoutMs, r)` returning `{ outcome, latencyMs }` (this task: always `success` at `baseLatencyMs`); `Sim.tick`, `Sim.getState` with the fields `workers`, `queue`, `targets`, `counters`, `latency`, `required`. A request admitted at time `t` holds one shared worker until `t + latencyMs`. When the pool is full, requests enqueue and drain in FIFO order as workers free.

- [ ] **Step 1: Add a seeded RNG helper to the top of `test/engine.test.js`**

```javascript
// mulberry32: a small seeded PRNG so arrival/target choices are reproducible.
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const advancingClock = () => { let t = 0; return { now: () => t, set: (v) => { t = v; } }; };
```

- [ ] **Step 2: Write the failing tests**

```javascript
import { Sim, chooseTarget, resolveOutcome } from '../src/engine.js';

test('chooseTarget respects weights deterministically', () => {
  const targets = { A: { weight: 1 }, B: { weight: 3 } };
  // r just below 0.25 lands in A; above lands in B (total weight 4).
  assert.equal(chooseTarget(targets, 0.10), 'A');
  assert.equal(chooseTarget(targets, 0.50), 'B');
});

test('arrivals occupy workers', () => {
  const cfg = defaultConfig();
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(1), config: cfg });
  sim.tick(0);            // establishes the baseline time
  sim.clock = { now: () => 100 };
  sim.tick(100);          // 100ms at 20/s => 2 arrivals
  const s = sim.getState();
  assert.equal(s.workers.busy, 2);
  assert.equal(s.queue.depth, 0);
});

test('a full pool queues further arrivals', () => {
  const cfg = defaultConfig();
  cfg.workerPoolSize = 2;
  cfg.requestRatePerSec = 100;
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(2), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 100 };
  sim.tick(100);          // 10 arrivals, only 2 workers
  const s = sim.getState();
  assert.equal(s.workers.busy, 2);
  assert.ok(s.queue.depth >= 1);
});

test('completion releases a worker and drains the queue', () => {
  const cfg = defaultConfig();
  cfg.workerPoolSize = 1;
  cfg.requestRatePerSec = 100;
  cfg.targets = { Only: { weight: 1, baseLatencyMs: 50, fault: 'none', slowLatencyMs: 8000, breaker: null, bulkheadSize: 6, adaptive: null } };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(3), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 10 }; sim.tick(10);   // many arrive, 1 served, rest queued
  const before = sim.getState();
  assert.equal(before.workers.busy, 1);
  const queuedBefore = before.queue.depth;
  sim.clock = { now: () => 70 }; sim.tick(70);    // first completes at 60, next admitted
  const after = sim.getState();
  assert.equal(after.workers.busy, 1);
  assert.ok(after.queue.depth < queuedBefore);
});

test('same seed produces an identical run', () => {
  const run = () => {
    const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(7), config: defaultConfig() });
    for (let t = 0; t <= 2000; t += 100) { sim.clock = { now: () => t }; sim.tick(t); }
    return JSON.stringify(sim.getState());
  };
  assert.equal(run(), run());
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd autonomous-actions && npm test`
Expected: FAIL (`chooseTarget` and `resolveOutcome` not exported; `tick` is a no-op).

- [ ] **Step 4: Implement the engine core in `src/engine.js`**

```javascript
import { LATENCY_SAMPLE_SIZE } from './config.js';

export function chooseTarget(targets, r) {
  const names = Object.keys(targets);
  const total = names.reduce((sum, n) => sum + targets[n].weight, 0);
  let x = r * total;
  for (const n of names) { x -= targets[n].weight; if (x < 0) return n; }
  return names[names.length - 1];
}

export function resolveOutcome(target, _timeoutMs, _r) {
  // Extended in Task 3 with faults and timeouts. For now every call succeeds.
  return { outcome: 'success', latencyMs: target.baseLatencyMs };
}

export class Sim {
  constructor({ clock, rng, config }) {
    this.clock = clock;
    this.rng = rng;
    this.config = config;
    this.lastMs = null;
    this.arrivalCredit = 0;
    this.inflight = [];        // { target, startAt, completeAt, outcome, latencyMs }
    this.queue = [];           // { target, enqueuedAt }
    this.recent = [];          // recent completion latencies (ms)
    this.counters = { success: 0, error: 0, timeout: 0, reject: 0, breakerOpen: 0 };
  }

  setConfig(patch) { Object.assign(this.config, patch); }

  tick(nowMs) {
    if (this.lastMs === null) { this.lastMs = nowMs; return; }
    const dt = nowMs - this.lastMs;
    if (dt <= 0) { this.lastMs = nowMs; return; }
    this._resolveCompletions(nowMs);
    this._drainQueue(nowMs);
    this._generateArrivals(dt, nowMs);
    this.lastMs = nowMs;
  }

  _resolveCompletions(nowMs) {
    const still = [];
    for (const req of this.inflight) {
      if (req.completeAt <= nowMs) {
        this.counters[req.outcome] += 1;
        this._recordLatency(req.latencyMs);
      } else {
        still.push(req);
      }
    }
    this.inflight = still;
  }

  _drainQueue(nowMs) {
    while (this.queue.length > 0 && this.inflight.length < this.config.workerPoolSize) {
      const q = this.queue.shift();
      this._startService(q.target, nowMs);
    }
  }

  _generateArrivals(dt, nowMs) {
    this.arrivalCredit += (dt / 1000) * this.config.requestRatePerSec;
    while (this.arrivalCredit >= 1) {
      this.arrivalCredit -= 1;
      this._admit(chooseTarget(this.config.targets, this.rng()), nowMs);
    }
  }

  _admit(targetName, nowMs) {
    if (this.inflight.length < this.config.workerPoolSize) {
      this._startService(targetName, nowMs);
    } else {
      this.queue.push({ target: targetName, enqueuedAt: nowMs });
    }
  }

  _startService(targetName, nowMs) {
    const target = this.config.targets[targetName];
    const { outcome, latencyMs } = resolveOutcome(target, this.config.timeoutMs, this.rng());
    this.inflight.push({ target: targetName, startAt: nowMs, completeAt: nowMs + latencyMs, outcome, latencyMs });
  }

  _recordLatency(ms) {
    this.recent.push(ms);
    if (this.recent.length > LATENCY_SAMPLE_SIZE) this.recent.shift();
  }

  _percentile(p) {
    if (this.recent.length === 0) return 0;
    const sorted = [...this.recent].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[idx];
  }

  getState() {
    const byTarget = {};
    for (const req of this.inflight) byTarget[req.target] = (byTarget[req.target] || 0) + 1;
    const targets = {};
    for (const name of Object.keys(this.config.targets)) {
      targets[name] = { inFlight: byTarget[name] || 0, bulkhead: null, breaker: null };
    }
    const avgHoldSec = this.recent.length ? (this.recent.reduce((a, b) => a + b, 0) / this.recent.length) / 1000 : 0;
    return {
      nowMs: this.lastMs,
      workers: { size: this.config.workerPoolSize, busy: this.inflight.length, free: this.config.workerPoolSize - this.inflight.length, byTarget },
      queue: { depth: this.queue.length },
      targets,
      counters: { ...this.counters },
      rates: { successPerSec: 0, errorPerSec: 0, rejectPerSec: 0 }, // filled in Task 6
      latency: { p50: this._percentile(50), p95: this._percentile(95) },
      required: { workers: this.config.requestRatePerSec * avgHoldSec },
    };
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd autonomous-actions && npm test`
Expected: all Task 2 tests pass.

- [ ] **Step 6: Add `// AI-DEV:` markers to each passing test, then commit**

Add inside each test body: `// AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.`

```bash
git add autonomous-actions/src/engine.js autonomous-actions/test/engine.test.js
git commit -m "feat(autonomous-actions): engine core with pool, arrivals, and queueing"
```

---

## Task 3: Faults and timeouts

**Files:**
- Modify: `autonomous-actions/src/engine.js` (rewrite `resolveOutcome`)
- Modify: `autonomous-actions/test/engine.test.js`

**Interfaces:**
- Consumes: `FAST_FAIL_MS` from `config.js`.
- Produces: `resolveOutcome(target, timeoutMs, r)` returning `{ outcome, latencyMs }` where outcome is `success`, `error`, or `timeout`. A `clip` fault gives `{ error, FAST_FAIL_MS }`. A `slow` fault uses `slowLatencyMs`; if that exceeds `timeoutMs` the result is `{ timeout, timeoutMs }`, otherwise `{ success, slowLatencyMs }`. A `none` target uses `baseLatencyMs` with the same timeout guard.

- [ ] **Step 1: Write the failing tests**

```javascript
test('a clipped connection errors almost immediately', () => {
  const t = { baseLatencyMs: 50, fault: 'clip', slowLatencyMs: 8000 };
  assert.deepEqual(resolveOutcome(t, 30000, 0.5), { outcome: 'error', latencyMs: 5 });
});

test('a slow-but-successful call returns 200 when it beats the timeout', () => {
  const t = { baseLatencyMs: 50, fault: 'slow', slowLatencyMs: 8000 };
  assert.deepEqual(resolveOutcome(t, 30000, 0.5), { outcome: 'success', latencyMs: 8000 });
});

test('a slow call times out when it exceeds the timeout', () => {
  const t = { baseLatencyMs: 50, fault: 'slow', slowLatencyMs: 8000 };
  assert.deepEqual(resolveOutcome(t, 5000, 0.5), { outcome: 'timeout', latencyMs: 5000 });
});

test('a healthy call succeeds at its base latency', () => {
  const t = { baseLatencyMs: 50, fault: 'none', slowLatencyMs: 8000 };
  assert.deepEqual(resolveOutcome(t, 30000, 0.5), { outcome: 'success', latencyMs: 50 });
});

test('the worker is pinned for min(latency, timeout) under a slow fault', () => {
  const cfg = defaultConfig();
  cfg.timeoutMs = 5000;
  cfg.targets = { C: { weight: 1, baseLatencyMs: 50, fault: 'slow', slowLatencyMs: 8000, breaker: null, bulkheadSize: 6, adaptive: null } };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(4), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 100 }; sim.tick(100);   // one arrival, pinned until 100+5000
  sim.clock = { now: () => 5000 }; sim.tick(5000);
  assert.ok(sim.getState().workers.busy >= 1);      // still pinned at 5000
  sim.clock = { now: () => 5200 }; sim.tick(5200);   // completes at 5100 (timeout)
  assert.equal(sim.getState().counters.timeout, 1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd autonomous-actions && npm test`
Expected: FAIL (current `resolveOutcome` ignores faults and always succeeds).

- [ ] **Step 3: Rewrite `resolveOutcome` in `src/engine.js`**

```javascript
import { FAST_FAIL_MS, LATENCY_SAMPLE_SIZE } from './config.js';

export function resolveOutcome(target, timeoutMs, _r) {
  if (target.fault === 'clip') return { outcome: 'error', latencyMs: FAST_FAIL_MS };
  const nominal = target.fault === 'slow' ? target.slowLatencyMs : target.baseLatencyMs;
  if (nominal > timeoutMs) return { outcome: 'timeout', latencyMs: timeoutMs };
  return { outcome: 'success', latencyMs: nominal };
}
```

- [ ] **Step 4: Run to verify the tests pass**

Run: `cd autonomous-actions && npm test`
Expected: all pass.

- [ ] **Step 5: Add `// AI-DEV:` markers to the new tests, then commit**

```bash
git add autonomous-actions/src/engine.js autonomous-actions/test/engine.test.js
git commit -m "feat(autonomous-actions): fast, slow, and timeout fault outcomes"
```

---

## Task 4: Circuit breaker

**Files:**
- Modify: `autonomous-actions/src/engine.js`
- Modify: `autonomous-actions/test/engine.test.js`

**Interfaces:**
- Consumes: a `target.breaker` object `{ enabled, errorThreshold, windowMs, cooldownMs, state, openedAtMs, errorTimestamps, probeInFlight }`.
- Produces: breaker admission gating and recording inside `Sim`. An enabled open breaker short-circuits new requests (increments `counters.breakerOpen`, holds no worker). Errors and timeouts within `windowMs` count toward `errorThreshold`; hitting it opens the breaker. After `cooldownMs` the breaker half-opens and admits one probe; a successful probe closes it, a failed probe reopens it. `getState().targets[name].breaker` is `{ state, errorsInWindow }`.

- [ ] **Step 1: Add a time-stepping helper to `test/engine.test.js`**

```javascript
function run(sim, fromMs, toMs, stepMs) {
  for (let t = fromMs; t <= toMs; t += stepMs) { sim.clock = { now: () => t }; sim.tick(t); }
}
function breaker(overrides = {}) {
  return { enabled: true, errorThreshold: 3, windowMs: 10000, cooldownMs: 5000,
           state: 'closed', openedAtMs: null, errorTimestamps: [], probeInFlight: false, ...overrides };
}
function oneTarget(extra) {
  return { C: { weight: 1, baseLatencyMs: 50, fault: 'none', slowLatencyMs: 8000, breaker: null, bulkheadSize: 6, adaptive: null, ...extra } };
}
```

- [ ] **Step 2: Write the failing tests**

```javascript
test('breaker opens after the error threshold within the window', () => {
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ fault: 'clip', breaker: breaker() });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(11), config: cfg });
  sim.tick(0);
  run(sim, 10, 400, 10);
  assert.equal(sim.getState().targets.C.breaker.state, 'open');
});

test('an open breaker short-circuits without holding a worker', () => {
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ fault: 'clip', breaker: breaker() });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(12), config: cfg });
  sim.tick(0);
  run(sim, 10, 600, 10);
  const s = sim.getState();
  assert.equal(s.targets.C.breaker.state, 'open');
  assert.ok(s.counters.breakerOpen > 0);
  assert.equal(s.targets.C.inFlight, 0);
});

test('breaker half-opens after cooldown and closes on a healthy probe', () => {
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ fault: 'clip', breaker: breaker() });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(13), config: cfg });
  sim.tick(0);
  run(sim, 10, 400, 10);                 // trip it open
  assert.equal(sim.getState().targets.C.breaker.state, 'open');
  sim.config.targets.C.fault = 'none';   // dependency recovers
  run(sim, 410, 12000, 10);              // past the 5s cooldown, probe succeeds
  assert.equal(sim.getState().targets.C.breaker.state, 'closed');
});

test('a failed probe reopens the breaker', () => {
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ fault: 'clip', breaker: breaker() });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(14), config: cfg });
  sim.tick(0);
  run(sim, 10, 400, 10);                 // trip open, stays clip-faulted
  run(sim, 410, 12000, 10);              // probe after cooldown fails, reopens
  assert.equal(sim.getState().targets.C.breaker.state, 'open');
});

test('errors spaced beyond the window never trip the breaker', () => {
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ fault: 'clip', breaker: breaker({ windowMs: 200 }) });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(15), config: cfg });
  sim.tick(0);
  // One arrival every 5s is far slower than a 200ms window; drop rate to force spacing.
  sim.config.requestRatePerSec = 0.2;
  run(sim, 5000, 60000, 5000);
  assert.equal(sim.getState().targets.C.breaker.state, 'closed');
});
```

- [ ] **Step 3: Run to verify failure**

Run: `cd autonomous-actions && npm test`
Expected: FAIL (no breaker logic yet).

- [ ] **Step 4: Add breaker gating and recording to `src/engine.js`**

Replace `_admit` and `_resolveCompletions`, and add the two breaker helpers:

```javascript
  _admit(targetName, nowMs) {
    const target = this.config.targets[targetName];
    const br = target.breaker;
    if (br && br.enabled) {
      const gate = this._breakerGate(br, nowMs);
      if (gate === 'short_circuit') { this.counters.breakerOpen += 1; return; }
      if (gate === 'probe') br.probeInFlight = true;
    }
    if (this.inflight.length < this.config.workerPoolSize) this._startService(targetName, nowMs);
    else this.queue.push({ target: targetName, enqueuedAt: nowMs });
  }

  _breakerGate(br, nowMs) {
    if (br.state === 'open') {
      if (nowMs >= br.openedAtMs + br.cooldownMs) { br.state = 'half_open'; br.probeInFlight = false; return 'probe'; }
      return 'short_circuit';
    }
    if (br.state === 'half_open') return br.probeInFlight ? 'short_circuit' : 'probe';
    return 'closed';
  }

  _breakerRecord(br, outcome, nowMs) {
    const failed = outcome === 'error' || outcome === 'timeout';
    if (br.state === 'half_open') {
      if (failed) { br.state = 'open'; br.openedAtMs = nowMs; }
      else { br.state = 'closed'; }
      br.errorTimestamps = []; br.probeInFlight = false;
      return;
    }
    if (failed) {
      br.errorTimestamps.push(nowMs);
      br.errorTimestamps = br.errorTimestamps.filter((ts) => ts > nowMs - br.windowMs);
      if (br.errorTimestamps.length >= br.errorThreshold) { br.state = 'open'; br.openedAtMs = nowMs; }
    }
  }

  _resolveCompletions(nowMs) {
    const still = [];
    for (const req of this.inflight) {
      if (req.completeAt <= nowMs) {
        this.counters[req.outcome] += 1;
        this._recordLatency(req.latencyMs);
        const br = this.config.targets[req.target].breaker;
        if (br && br.enabled) this._breakerRecord(br, req.outcome, nowMs);
      } else {
        still.push(req);
      }
    }
    this.inflight = still;
  }
```

Update the breaker field in `getState()` so `targets[name].breaker` reports live state:

```javascript
    for (const name of Object.keys(this.config.targets)) {
      const br = this.config.targets[name].breaker;
      const breakerState = br && br.enabled
        ? { state: br.state, errorsInWindow: br.errorTimestamps.filter((ts) => ts > this.lastMs - br.windowMs).length }
        : null;
      targets[name] = { inFlight: byTarget[name] || 0, bulkhead: null, breaker: breakerState };
    }
```

- [ ] **Step 5: Run to verify the tests pass**

Run: `cd autonomous-actions && npm test`
Expected: all pass.

- [ ] **Step 6: Add `// AI-DEV:` markers, then commit**

```bash
git add autonomous-actions/src/engine.js autonomous-actions/test/engine.test.js
git commit -m "feat(autonomous-actions): per-dependency circuit breaker state machine"
```

---

## Task 5: Bulkhead (per-dependency pools)

**Files:**
- Modify: `autonomous-actions/src/engine.js`
- Modify: `autonomous-actions/test/engine.test.js`

**Interfaces:**
- Consumes: `config.bulkheadsEnabled` and `target.bulkheadSize`.
- Produces: when bulkheads are enabled, `_admit` draws from a per-dependency pool of `bulkheadSize` instead of the shared pool, and there is no queue. Exhaustion increments `counters.reject` and records an error against that dependency's breaker. Draining one dependency's pool leaves others untouched. `getState().targets[name].bulkhead` is `{ enabled, size, busy, free }` when enabled.

- [ ] **Step 1: Write the failing tests**

```javascript
test('bulkhead caps in-flight per dependency and rejects the overflow', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;                     // slow C succeeds slowly, stays pinned
  for (const n of Object.keys(cfg.targets)) cfg.targets[n].bulkheadSize = 3;
  cfg.targets['Service C'].fault = 'slow';   // 8s holds
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(21), config: cfg });
  sim.tick(0);
  run(sim, 50, 2000, 50);
  const s = sim.getState();
  assert.ok(s.targets['Service C'].inFlight <= 3);   // pool capped
  assert.ok(s.counters.reject > 0);                  // overflow rejected
});

test('one saturated bulkhead does not starve a healthy dependency', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  for (const n of Object.keys(cfg.targets)) cfg.targets[n].bulkheadSize = 3;
  cfg.targets['Service C'].fault = 'slow';
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(22), config: cfg });
  sim.tick(0);
  run(sim, 50, 2000, 50);
  // C's slow calls have not completed by 2000ms, so any success is a healthy dependency.
  assert.ok(sim.getState().counters.success > 0);
});

test('a bulkhead rejection counts as an error and trips the breaker', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  cfg.targets['Service C'].fault = 'slow';
  cfg.targets['Service C'].bulkheadSize = 2;
  cfg.targets['Service C'].breaker = breaker({ errorThreshold: 3 });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(23), config: cfg });
  sim.tick(0);
  run(sim, 50, 2000, 50);
  assert.equal(sim.getState().targets['Service C'].breaker.state, 'open');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd autonomous-actions && npm test`
Expected: FAIL (`_admit` ignores bulkheads).

- [ ] **Step 3: Branch `_admit` on bulkhead mode in `src/engine.js`**

Replace the acquire section of `_admit` (keep the breaker gating above it):

```javascript
  _admit(targetName, nowMs) {
    const target = this.config.targets[targetName];
    const br = target.breaker;
    if (br && br.enabled) {
      const gate = this._breakerGate(br, nowMs);
      if (gate === 'short_circuit') { this.counters.breakerOpen += 1; return; }
      if (gate === 'probe') br.probeInFlight = true;
    }
    if (this.config.bulkheadsEnabled) {
      const used = this.inflight.filter((r) => r.target === targetName).length;
      if (used < target.bulkheadSize) {
        this._startService(targetName, nowMs);
      } else {
        this.counters.reject += 1;
        if (br && br.enabled) this._breakerRecord(br, 'error', nowMs);
      }
      return;
    }
    if (this.inflight.length < this.config.workerPoolSize) this._startService(targetName, nowMs);
    else this.queue.push({ target: targetName, enqueuedAt: nowMs });
  }
```

Report the bulkhead in `getState()`:

```javascript
      const bulkhead = this.config.bulkheadsEnabled
        ? { enabled: true, size: this.config.targets[name].bulkheadSize, busy: byTarget[name] || 0,
            free: this.config.targets[name].bulkheadSize - (byTarget[name] || 0) }
        : null;
      targets[name] = { inFlight: byTarget[name] || 0, bulkhead, breaker: breakerState };
```

- [ ] **Step 4: Run to verify the tests pass**

Run: `cd autonomous-actions && npm test`
Expected: all pass.

- [ ] **Step 5: Add `// AI-DEV:` markers, then commit**

```bash
git add autonomous-actions/src/engine.js autonomous-actions/test/engine.test.js
git commit -m "feat(autonomous-actions): per-dependency bulkhead pools with reject-to-breaker"
```

---

## Task 6: Rates, Little's Law readout, and the adaptive controller

**Files:**
- Modify: `autonomous-actions/src/engine.js`
- Modify: `autonomous-actions/src/config.js` (add `ADAPTIVE_LATENCY_FACTOR`)
- Modify: `autonomous-actions/test/engine.test.js`

**Interfaces:**
- Consumes: `ADAPTIVE_MIN`, `ADAPTIVE_MAX`, `ADAPTIVE_LATENCY_FACTOR` from `config.js`; a `target.adaptive` object `{ enabled, sampleWindowMs, baselineLatencyMs, lastSampleMs }`.
- Produces: `getState().rates` populated from completions over the trailing second; `getState().required.workers` equal to `requestRatePerSec * avgHoldSec`. When bulkheads and adaptive are both enabled, `bulkheadSize` shrinks (halves, floored at `ADAPTIVE_MIN`) when the dependency's trailing p95 exceeds `ADAPTIVE_LATENCY_FACTOR * baselineLatencyMs`, and grows by one (capped at `ADAPTIVE_MAX`) when the pool is saturated and latency is healthy.

- [ ] **Step 1: Add the constant to `src/config.js`**

```javascript
export const ADAPTIVE_LATENCY_FACTOR = 2; // shrink when p95 exceeds 2x baseline
```

- [ ] **Step 2: Write the failing tests**

```javascript
import { ADAPTIVE_MIN } from '../src/config.js';

test("required workers follows Little's Law (rate times hold)", () => {
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 20;               // hold ~50ms => required ~1
  cfg.targets = oneTarget({ baseLatencyMs: 50 });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(31), config: cfg });
  sim.tick(0);
  run(sim, 50, 3000, 50);
  assert.ok(Math.abs(sim.getState().required.workers - 1) < 0.3);
});

test('success rate is positive under steady healthy load', () => {
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 40;
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(32), config: cfg });
  sim.tick(0);
  run(sim, 50, 3000, 50);
  assert.ok(sim.getState().rates.successPerSec > 0);
});

test('adaptive bulkhead shrinks under high latency', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ fault: 'slow', slowLatencyMs: 8000, bulkheadSize: 20,
    adaptive: { enabled: true, sampleWindowMs: 1000, baselineLatencyMs: 50, lastSampleMs: 0 } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(33), config: cfg });
  sim.tick(0);
  run(sim, 50, 12000, 50);                   // slow completions arrive after 8s, p95 spikes
  assert.ok(sim.config.targets.C.bulkheadSize < 20);
  assert.ok(sim.config.targets.C.bulkheadSize >= ADAPTIVE_MIN);
});

test('adaptive bulkhead never drops below the floor', () => {
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ fault: 'slow', slowLatencyMs: 8000, bulkheadSize: 8,
    adaptive: { enabled: true, sampleWindowMs: 500, baselineLatencyMs: 50, lastSampleMs: 0 } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(34), config: cfg });
  sim.tick(0);
  run(sim, 50, 40000, 50);
  assert.ok(sim.config.targets.C.bulkheadSize >= ADAPTIVE_MIN);
});
```

- [ ] **Step 3: Run to verify failure**

Run: `cd autonomous-actions && npm test`
Expected: FAIL (`rates` are zero, adaptive does nothing).

- [ ] **Step 4: Implement rates, per-target latency, and the adaptive pass in `src/engine.js`**

Import the constants and extend the constructor:

```javascript
import { FAST_FAIL_MS, LATENCY_SAMPLE_SIZE, ADAPTIVE_MIN, ADAPTIVE_MAX, ADAPTIVE_LATENCY_FACTOR } from './config.js';
```

Add to the constructor: `this.events = []; this.recentByTarget = {};`

Record per-target latency and completion events in `_resolveCompletions` (inside the `completeAt <= nowMs` branch, after counting):

```javascript
        this.events.push({ t: nowMs, outcome: req.outcome });
        (this.recentByTarget[req.target] ||= []).push(req.latencyMs);
        if (this.recentByTarget[req.target].length > LATENCY_SAMPLE_SIZE) this.recentByTarget[req.target].shift();
```

Record a reject event in `_admit` (next to `counters.reject += 1`): `this.events.push({ t: nowMs, outcome: 'reject' });`

Add the adaptive pass and call it from `tick` after `_generateArrivals`:

```javascript
  tick(nowMs) {
    if (this.lastMs === null) { this.lastMs = nowMs; return; }
    const dt = nowMs - this.lastMs;
    if (dt <= 0) { this.lastMs = nowMs; return; }
    this._resolveCompletions(nowMs);
    this._drainQueue(nowMs);
    this._generateArrivals(dt, nowMs);
    this._runAdaptive(nowMs);
    this.lastMs = nowMs;
  }

  _percentileOf(list, p) {
    if (!list || list.length === 0) return 0;
    const sorted = [...list].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  }

  _runAdaptive(nowMs) {
    if (!this.config.bulkheadsEnabled) return;
    for (const [name, target] of Object.entries(this.config.targets)) {
      const a = target.adaptive;
      if (!a || !a.enabled) continue;
      if (nowMs - a.lastSampleMs < a.sampleWindowMs) continue;
      a.lastSampleMs = nowMs;
      const p95 = this._percentileOf(this.recentByTarget[name], 95);
      const used = this.inflight.filter((r) => r.target === name).length;
      if (p95 > ADAPTIVE_LATENCY_FACTOR * a.baselineLatencyMs) {
        target.bulkheadSize = Math.max(ADAPTIVE_MIN, Math.floor(target.bulkheadSize / 2));
      } else if (used >= target.bulkheadSize) {
        target.bulkheadSize = Math.min(ADAPTIVE_MAX, target.bulkheadSize + 1);
      }
    }
  }
```

Compute rates in `getState()` (prune events to the trailing second):

```javascript
    this.events = this.events.filter((e) => e.t > this.lastMs - 1000);
    const perSec = (o) => this.events.filter((e) => e.outcome === o).length; // 1s window
    const successPerSec = perSec('success');
    const errorPerSec = perSec('error') + perSec('timeout');
    const rejectPerSec = perSec('reject');
```

Then set `rates: { successPerSec, errorPerSec, rejectPerSec }` in the returned object, replacing the Task 2 zero placeholder.

- [ ] **Step 5: Run to verify the tests pass**

Run: `cd autonomous-actions && npm test`
Expected: all pass.

- [ ] **Step 6: Add `// AI-DEV:` markers, then commit**

```bash
git add autonomous-actions/src/engine.js autonomous-actions/src/config.js autonomous-actions/test/engine.test.js
git commit -m "feat(autonomous-actions): rates, Little's Law readout, and adaptive bulkhead"
```

---

## Task 7: Rendering the static topology, worker grid, and metrics

**Files:**
- Create: `autonomous-actions/src/render.js`
- Modify: `autonomous-actions/index.html` (already has `#stage` and `#panel`)

**Interfaces:**
- Consumes: `sim.getState()`.
- Produces: `initRender(rootSvg)` draws the fixed nodes once and returns handles; `render(state)` updates the worker-slot grid and metrics each frame. Named export `TARGET_COLORS` maps each dependency to a color.

This layer is DOM-bound and verified by eye, not by unit test.

- [ ] **Step 1: Implement `src/render.js`**

The load-bearing visual is the worker grid: one rectangle per worker slot inside the gateway, filled with the color of the dependency currently pinned to it. When slow Service C eats the pool, the grid turns C-colored.

```javascript
export const TARGET_COLORS = {
  'Service B': '#2f9e8f', 'Service C': '#d6455d', 'Database A': '#3d6bb3', 'External': '#c98a2b',
};
const SVGNS = 'http://www.w3.org/2000/svg';
const el = (name, attrs) => { const n = document.createElementNS(SVGNS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

export function initRender(root) {
  // Draw laptop, gateway box, and one shielded box per dependency at fixed coordinates.
  // Return a handle object holding references to the groups render() updates.
  root.appendChild(el('rect', { x: 40, y: 260, width: 90, height: 60, rx: 6, fill: '#eee', stroke: '#999' })); // laptop
  const gateway = el('rect', { x: 380, y: 200, width: 220, height: 200, rx: 10, fill: '#f6f8f9', stroke: '#333' });
  root.appendChild(gateway);
  const slots = el('g', {}); root.appendChild(slots);
  const rows = Object.keys(TARGET_COLORS).map((name, i) => {
    const y = 150 + i * 90;
    root.appendChild(el('rect', { x: 900, y, width: 160, height: 56, rx: 8, fill: '#fff', stroke: TARGET_COLORS[name] }));
    root.appendChild(Object.assign(el('text', { x: 910, y: y + 32, 'font-size': 14 }), { textContent: name }));
    return name;
  });
  const metrics = el('text', { x: 40, y: 40, 'font-size': 14 }); root.appendChild(metrics);
  return { root, slots, rows, metrics };
}

export function render(state, h) {
  // Worker grid: a slot per worker, colored by the dependency it serves.
  h.slots.textContent = '';
  const size = state.workers.size;
  const cols = 5;
  const fillByIndex = [];
  for (const [name, count] of Object.entries(state.workers.byTarget)) for (let i = 0; i < count; i++) fillByIndex.push(TARGET_COLORS[name] || '#bbb');
  for (let i = 0; i < size; i++) {
    const gx = 400 + (i % cols) * 34, gy = 220 + Math.floor(i / cols) * 30;
    h.slots.appendChild(el('rect', { x: gx, y: gy, width: 28, height: 24, rx: 3, fill: fillByIndex[i] || '#e6e6e6', stroke: '#ccc' }));
  }
  const m = `rate ${state.rates.successPerSec}/s ok, ${state.rates.errorPerSec}/s err, ${state.rates.rejectPerSec}/s rej  |  queue ${state.queue.depth}  |  p95 ${state.latency.p95}ms`;
  h.metrics.textContent = m;
}
```

- [ ] **Step 2: Wire a temporary harness to see it**

Temporarily (removed in Task 9) add to the bottom of `render.js` a self-check that a reviewer can trigger, or just proceed to Task 9 which wires the loop. For this task, verify by importing `initRender`/`render` from a throwaway `<script type="module">` in `index.html` that constructs a `Sim`, ticks it a few times with a fake clock, and calls `render`.

- [ ] **Step 3: Serve and verify by eye**

Run: `cd autonomous-actions && python3 -m http.server 8000`
Open `http://localhost:8000/` and confirm: laptop, gateway, four shielded dependency boxes, a worker grid, and a metrics line all draw. Colors match `TARGET_COLORS`.

- [ ] **Step 4: Commit**

```bash
git add autonomous-actions/src/render.js autonomous-actions/index.html
git commit -m "feat(autonomous-actions): topology, worker grid, and metrics rendering"
```

---

## Task 8: Rendering tokens, queue, and breaker indicators

**Files:**
- Modify: `autonomous-actions/src/render.js`

**Interfaces:**
- Consumes: `sim.getState()` (`queue.depth`, `targets[name].breaker.state`, `workers.byTarget`).
- Produces: `render` also draws a queue backlog with its depth number, and a closed/open/half-open badge on each dependency row. In-flight requests animate as dots on the edge between the gateway and each dependency, count scaled to `workers.byTarget[name]`.

- [ ] **Step 1: Extend `render` with tokens, queue, and breaker badges**

```javascript
// Add inside render(state, h), after the worker grid:
// Queue backlog: a stack of small dots plus a number, left of the gateway.
for (let i = 0; i < Math.min(state.queue.depth, 20); i++)
  h.slots.appendChild(el('circle', { cx: 350, cy: 210 + i * 9, r: 3, fill: '#888' }));
h.slots.appendChild(Object.assign(el('text', { x: 320, y: 200, 'font-size': 12 }), { textContent: `q:${state.queue.depth}` }));

// Per-dependency: in-flight dots on the edge and a breaker badge.
state.rows = h.rows;
h.rows.forEach((name, idx) => {
  const y = 178 + idx * 90;
  const inflight = state.workers.byTarget[name] || 0;
  for (let i = 0; i < Math.min(inflight, 12); i++)
    h.slots.appendChild(el('circle', { cx: 640 + i * 18, cy: y, r: 4, fill: TARGET_COLORS[name] }));
  const br = state.targets[name].breaker;
  if (br) {
    const color = br.state === 'open' ? '#d6455d' : br.state === 'half_open' ? '#c98a2b' : '#2f9e8f';
    h.slots.appendChild(el('circle', { cx: 880, cy: y, r: 7, fill: color }));
  }
});
```

- [ ] **Step 2: Serve and verify by eye**

Run: `cd autonomous-actions && python3 -m http.server 8000`
Drive it via the Task 9 loop (or a temporary tick harness). Confirm tokens appear on active edges, the queue stack grows when the pool is full, and breaker badges change color when a breaker trips.

- [ ] **Step 3: Commit**

```bash
git add autonomous-actions/src/render.js
git commit -m "feat(autonomous-actions): tokens, queue backlog, and breaker badges"
```

---

## Task 9: Controls, the animation loop, and free-play

**Files:**
- Create: `autonomous-actions/src/controls.js`
- Create: `autonomous-actions/src/rng.js`

**Interfaces:**
- Consumes: `Sim`, `defaultConfig`, `initRender`, `render`.
- Produces: `makeRng(seed)` in `rng.js` (shared by browser and tests); a running `requestAnimationFrame` loop that ticks the sim on the real clock and renders each frame; a control panel whose sliders mutate `sim.config` live. This ships free-play: every control is active with no act structure yet.

- [ ] **Step 1: Create `src/rng.js`**

```javascript
export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 2: Create `src/controls.js`**

```javascript
import { Sim } from './engine.js';
import { defaultConfig } from './config.js';
import { makeRng } from './rng.js';
import { initRender, render } from './render.js';

const clock = { now: () => performance.now() };
const sim = new Sim({ clock, rng: makeRng(1), config: defaultConfig() });
const handle = initRender(document.getElementById('stage'));

function slider(label, min, max, step, value, onInput) {
  const wrap = document.createElement('label');
  wrap.style.display = 'block';
  wrap.textContent = `${label} `;
  const input = document.createElement('input');
  Object.assign(input, { type: 'range', min, max, step, value });
  input.addEventListener('input', () => onInput(Number(input.value)));
  wrap.appendChild(input);
  document.getElementById('panel').appendChild(wrap);
}

slider('request rate/s', 1, 200, 1, sim.config.requestRatePerSec, (v) => { sim.config.requestRatePerSec = v; });
slider('timeout ms', 100, 90000, 100, sim.config.timeoutMs, (v) => { sim.config.timeoutMs = v; });
slider('worker pool', 1, 60, 1, sim.config.workerPoolSize, (v) => { sim.config.workerPoolSize = v; });
for (const name of Object.keys(sim.config.targets)) {
  slider(`${name} latency ms`, 10, 20000, 10, sim.config.targets[name].baseLatencyMs, (v) => { sim.config.targets[name].baseLatencyMs = v; });
}

function frame() { sim.tick(clock.now()); render(sim.getState(), handle); requestAnimationFrame(frame); }
requestAnimationFrame(frame);

// Exposed for the guided tour in Task 10.
export { sim, handle };
```

- [ ] **Step 3: Serve and verify by eye**

Run: `cd autonomous-actions && python3 -m http.server 8000`
Open `http://localhost:8000/`. Confirm the loop runs (workers cycle), and that dragging "Service C latency" up to several thousand ms fills the worker grid with C's color and grows the queue. This is Act 3's behavior appearing in free-play, proof the engine and render agree.

- [ ] **Step 4: Commit**

```bash
git add autonomous-actions/src/controls.js autonomous-actions/src/rng.js
git commit -m "feat(autonomous-actions): live controls, animation loop, and free-play"
```

---

## Task 10: Scenarios and the guided tour

**Files:**
- Create: `autonomous-actions/src/scenarios.js`
- Create: `autonomous-actions/test/scenarios.test.js`
- Modify: `autonomous-actions/src/controls.js`
- Modify: `autonomous-actions/index.html` (add Next/Back and caption elements)

**Interfaces:**
- Consumes: `defaultConfig`, and the exported `sim` from `controls.js`.
- Produces: `ACTS` (an ordered array) and `applyAct(sim, index)` which resets config from `defaultConfig()` then applies that act's patch, sets `readoutVisible`, and returns `{ title, caption }`. Act navigation buttons call it. Act 3 exposes the two timeout presets; Act 5 turns on the readout and unlocks free-play.

- [ ] **Step 1: Create `src/scenarios.js`**

```javascript
import { defaultConfig } from './config.js';

function withBreaker(cfg, name) {
  cfg.targets[name].breaker = { enabled: true, errorThreshold: 5, windowMs: 10000, cooldownMs: 5000,
    state: 'closed', openedAtMs: null, errorTimestamps: [], probeInFlight: false };
}

export const ACTS = [
  { title: 'Healthy baseline', caption: 'Requests flow, workers cycle fast, pools stay empty.',
    readoutVisible: false, patch: (c) => c },
  { title: 'Fast failure, no protection', caption: 'Service C is clipped. Callers error instantly, workers free at once, B and the DB are fine.',
    readoutVisible: false, patch: (c) => { c.targets['Service C'].fault = 'clip'; return c; } },
  { title: 'Breaker on the fast failure', caption: 'The breaker trips and fails fast locally. Try dragging Service C latency up.',
    readoutVisible: false, patch: (c) => { c.targets['Service C'].fault = 'clip'; withBreaker(c, 'Service C'); return c; } },
  { title: 'Slow failure, breaker only', caption: 'Service C is slow but healthy. The breaker never trips, and slow C drains the shared pool until healthy B starves.',
    readoutVisible: false, patch: (c) => { c.targets['Service C'].fault = 'slow'; c.timeoutMs = 30000; withBreaker(c, 'Service C'); return c; } },
  { title: 'Bulkhead', caption: 'Each dependency gets its own pool. Slow C fills only its own pool, gets rejected, and the breaker finally trips.',
    readoutVisible: false, patch: (c) => { c.targets['Service C'].fault = 'slow'; c.timeoutMs = 30000; c.bulkheadsEnabled = true; withBreaker(c, 'Service C'); return c; } },
  { title: 'Tuning trap, then adaptive', caption: 'A fixed pool is a guess. Turn on adaptive and it finds the size itself. Controls are now unlocked.',
    readoutVisible: true, patch: (c) => {
      c.targets['Service C'].fault = 'slow'; c.timeoutMs = 30000; c.bulkheadsEnabled = true; withBreaker(c, 'Service C');
      c.targets['Service C'].adaptive = { enabled: true, sampleWindowMs: 1000, baselineLatencyMs: 50, lastSampleMs: 0 };
      return c;
    } },
];

// Act 3 timeout presets, applied on top of the current config.
export const ACT3_PRESETS = {
  '90s timeout + breaker': (c) => { c.timeoutMs = 90000; },
  '5s timeout, no breaker': (c) => { c.timeoutMs = 5000; c.targets['Service C'].breaker = null; },
};

export function applyAct(sim, index) {
  const act = ACTS[index];
  sim.config = act.patch(defaultConfig());
  return { title: act.title, caption: act.caption, readoutVisible: act.readoutVisible };
}
```

- [ ] **Step 2: Unit-test `applyAct` and the presets (`test/scenarios.test.js`)**

`applyAct` and the act data are pure, so they get real unit tests. Write these, run them (they pass against the Step 1 code), then add `// AI-DEV:` markers.

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTS, ACT3_PRESETS, applyAct } from '../src/scenarios.js';

test('there are six acts', () => {
  assert.equal(ACTS.length, 6);
});

test('Act 1 clips Service C with no breaker and no bulkheads', () => {
  const sim = { config: null };
  const meta = applyAct(sim, 1);
  assert.equal(sim.config.targets['Service C'].fault, 'clip');
  assert.equal(sim.config.targets['Service C'].breaker, null);
  assert.equal(sim.config.bulkheadsEnabled, false);
  assert.equal(meta.readoutVisible, false);
});

test('Act 3 makes Service C slow with a breaker but no bulkheads', () => {
  const sim = { config: null };
  applyAct(sim, 3);
  assert.equal(sim.config.targets['Service C'].fault, 'slow');
  assert.equal(sim.config.bulkheadsEnabled, false);
  assert.ok(sim.config.targets['Service C'].breaker.enabled);
});

test('Act 4 enables bulkheads', () => {
  const sim = { config: null };
  applyAct(sim, 4);
  assert.equal(sim.config.bulkheadsEnabled, true);
});

test('Act 5 enables the adaptive controller and shows the readout', () => {
  const sim = { config: null };
  const meta = applyAct(sim, 5);
  assert.ok(sim.config.targets['Service C'].adaptive.enabled);
  assert.equal(meta.readoutVisible, true);
});

test('the 90s preset sets a 90s timeout', () => {
  const sim = { config: null };
  applyAct(sim, 3);
  ACT3_PRESETS['90s timeout + breaker'](sim.config);
  assert.equal(sim.config.timeoutMs, 90000);
});

test('the 5s preset sets a 5s timeout and removes the breaker', () => {
  const sim = { config: null };
  applyAct(sim, 3);
  ACT3_PRESETS['5s timeout, no breaker'](sim.config);
  assert.equal(sim.config.timeoutMs, 5000);
  assert.equal(sim.config.targets['Service C'].breaker, null);
});
```

Run: `cd autonomous-actions && npm test`
Expected: all scenarios tests pass.

- [ ] **Step 3: Add navigation and caption to `index.html`**

```html
<div id="tour">
  <button id="back">Back</button>
  <span id="act-title"></span>
  <button id="next">Next</button>
  <p id="act-caption"></p>
  <div id="act3-presets"></div>
</div>
```

- [ ] **Step 4: Wire the tour in `controls.js`**

```javascript
import { ACTS, ACT3_PRESETS, applyAct } from './scenarios.js';

let actIndex = 0;
let readoutVisible = false;
function showAct(i) {
  actIndex = Math.max(0, Math.min(ACTS.length - 1, i));
  const meta = applyAct(sim, actIndex);
  readoutVisible = meta.readoutVisible;
  document.getElementById('act-title').textContent = `${actIndex + 1}. ${meta.title}`;
  document.getElementById('act-caption').textContent = meta.caption;
  const presets = document.getElementById('act3-presets');
  presets.textContent = '';
  if (actIndex === 3) {
    for (const [label, apply] of Object.entries(ACT3_PRESETS)) {
      const b = document.createElement('button');
      b.textContent = label; b.addEventListener('click', () => apply(sim.config));
      presets.appendChild(b);
    }
  }
}
document.getElementById('next').addEventListener('click', () => showAct(actIndex + 1));
document.getElementById('back').addEventListener('click', () => showAct(actIndex - 1));
showAct(0);
```

In `render`, show the `required` readout only when `readoutVisible` is true. Pass the flag through, or read a module-level export. Add to the metrics string when visible: `required ${state.required.workers.toFixed(1)} vs pool ${state.workers.size}`.

- [ ] **Step 5: Serve and walk the full tour**

Run: `cd autonomous-actions && python3 -m http.server 8000`
Step Act 0 through Act 5. Confirm each act's described behavior: Act 3 browns out and the two presets diverge (90s stays jammed, 5s recovers), Act 4 isolates C, Act 5 shows the readout and the adaptive pool resizing. Confirm free-play controls still work after Act 5.

- [ ] **Step 6: Commit**

```bash
git add autonomous-actions/src/scenarios.js autonomous-actions/test/scenarios.test.js autonomous-actions/src/controls.js autonomous-actions/index.html
git commit -m "feat(autonomous-actions): six-act guided tour with timeout presets and readout"
```

---

## Task 11: Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/pages.yml`
- Modify: `autonomous-actions/README.md` (add the live URL)

**Interfaces:**
- Produces: a Pages deployment serving the `autonomous-actions/` folder, and a README link to it.

- [ ] **Step 1: Add the Pages workflow**

```yaml
name: Deploy autonomous-actions to Pages
on:
  push:
    branches: [main]
    paths: ['autonomous-actions/**']
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: autonomous-actions
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Enable Pages in the repo settings**

In the repository settings, set Pages source to "GitHub Actions." This is a one-time manual step; note it in the commit body.

- [ ] **Step 3: Verify the deployment**

After the workflow runs on `main`, open the Pages URL and walk the tour once. Confirm the modules load over HTTPS (no `file://` CORS error).

- [ ] **Step 4: Add the URL to the README and commit**

```bash
git add .github/workflows/pages.yml autonomous-actions/README.md
git commit -m "chore(autonomous-actions): deploy to GitHub Pages"
```

---

## Self-review

**Spec coverage.** Every spec section maps to a task: engine model (Tasks 2 to 6), architecture and determinism (Tasks 1 to 2), the six acts and the Act 3 timeout contrast and Act 5 naming trap and readout (Task 10), the color-the-pool-by-dependency visual (Task 7), tokens and queue and breaker badges (Task 8), testing (engine Tasks 2 to 6, scenarios Task 10), deploy (Task 11). The terminology reference is documentation, carried in the spec and the README, no task needed.

**Placeholder scan.** No "TBD" or "handle edge cases" steps; every code step carries runnable code. Rendering steps are verified by eye by design, with explicit serve-and-observe criteria.

**Type consistency.** `resolveOutcome(target, timeoutMs, r)`, `chooseTarget(targets, r)`, `Sim.tick/getState/setConfig`, the breaker object fields, and the `adaptive` object fields are consistent across Tasks 2 through 10. `makeRng` is defined once in `rng.js` (Task 9) and mirrored in the test file. `getState()` grows fields across tasks but never renames them.

One known follow-up left out of scope on purpose: optional ingress rate-limiting as a side lesson. It is not part of the core arc and adds a second story; leave it for a later plan if wanted.
