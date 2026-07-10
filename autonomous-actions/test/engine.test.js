import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sim, resolveOutcome, effectiveRate } from '../src/engine.js';
import { defaultConfig, ADAPTIVE_MIN, ADAPTIVE_MAX } from '../src/config.js';

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
const fixedClock = (ms) => ({ now: () => ms });
const seededRng = () => 0.5;

test('Sim constructs and reports the clock time', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const sim = new Sim({ clock: fixedClock(1000), rng: seededRng, config: defaultConfig() });
  sim.tick(1000);
  assert.equal(sim.getState().nowMs, 1000);
});

test('arrivals occupy workers', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
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
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
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
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const cfg = defaultConfig();
  cfg.workerPoolSize = 1;
  cfg.requestRatePerSec = 100;
  cfg.targets = { Only: { weight: 1, latencyMs: 50, errorRate: 0, capacity: 50, breaker: null, bulkheadSize: 6, adaptive: null } };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(3), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 100 }; sim.tick(100);   // 10 arrive, 1 served, 9 queued
  const before = sim.getState();
  assert.equal(before.workers.busy, 1);
  assert.ok(before.queue.depth >= 1);
  const queuedBefore = before.queue.depth;
  sim.config.requestRatePerSec = 0;                // stop new arrivals so draining is observable
  sim.clock = { now: () => 200 }; sim.tick(200);    // request from t=100 completes at 150, a queued one is promoted
  const after = sim.getState();
  assert.equal(after.workers.busy, 1);              // worker reused
  assert.ok(after.queue.depth < queuedBefore);      // queue drained by one
});

test('same seed produces an identical run', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const run = () => {
    const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(7), config: defaultConfig() });
    for (let t = 0; t <= 2000; t += 100) { sim.clock = { now: () => t }; sim.tick(t); }
    return JSON.stringify(sim.getState());
  };
  assert.equal(run(), run());
});

test('an errored connection fails almost immediately', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const t = { latencyMs: 50, errorRate: 1 };
  assert.deepEqual(resolveOutcome(t, 30000, 0.5), { outcome: 'error', latencyMs: 5 });
});

test('a slow-but-successful call returns 200 when it beats the timeout', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const t = { latencyMs: 8000, errorRate: 0 };
  assert.deepEqual(resolveOutcome(t, 30000, 0.5), { outcome: 'success', latencyMs: 8000 });
});

test('a slow call times out when it exceeds the timeout', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const t = { latencyMs: 8000, errorRate: 0 };
  assert.deepEqual(resolveOutcome(t, 5000, 0.5), { outcome: 'timeout', latencyMs: 5000 });
});

test('a healthy call succeeds at its base latency', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const t = { latencyMs: 50, errorRate: 0 };
  assert.deepEqual(resolveOutcome(t, 30000, 0.5), { outcome: 'success', latencyMs: 50 });
});

test('errorRate is a boundary: r below it errors, r above it does not', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const t = { latencyMs: 50, errorRate: 0.5 };
  assert.deepEqual(resolveOutcome(t, 30000, 0.4), { outcome: 'error', latencyMs: 5 });
  assert.deepEqual(resolveOutcome(t, 30000, 0.6), { outcome: 'success', latencyMs: 50 });
});

test('effectiveRate returns the base rate when oscillation is disabled', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  assert.equal(effectiveRate(20, { enabled: false, amplitude: 0.5, periodMs: 20000 }, 5000), 20);
  assert.equal(effectiveRate(20, null, 5000), 20);
});

test('effectiveRate oscillates sinusoidally around the base rate when enabled', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const osc = { enabled: true, amplitude: 0.5, periodMs: 20000 };
  assert.equal(effectiveRate(20, osc, 0), 20);           // sin(0) = 0 -> base
  assert.equal(effectiveRate(20, osc, 5000), 30);        // quarter period -> sin = 1 -> base * 1.5
  assert.equal(effectiveRate(20, osc, 15000), 10);       // three-quarter period -> sin = -1 -> base * 0.5
});

test('the worker is pinned for min(latency, timeout) under a slow dependency', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const cfg = defaultConfig();
  cfg.timeoutMs = 5000;
  cfg.workerPoolSize = 1;
  cfg.targets = { C: { weight: 1, latencyMs: 8000, errorRate: 0, capacity: 50, breaker: null, bulkheadSize: 6, adaptive: null } };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(4), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 100 }; sim.tick(100);   // one arrival, pinned until 100+5000
  sim.clock = { now: () => 5000 }; sim.tick(5000);
  assert.ok(sim.getState().workers.busy >= 1);      // still pinned at 5000
  sim.clock = { now: () => 5200 }; sim.tick(5200);   // completes at 5100 (timeout)
  assert.equal(sim.getState().counters.timeout, 1);
});

test('a callee outgoing timeout bounds only that callee, below the front door', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  // Our per-callee outgoing wrapper abandons the leg at its own timeout (1s),
  // independent of the generous front-door timeout (30s) and the callee's 8s latency.
  const cfg = defaultConfig();
  cfg.timeoutMs = 30000;
  cfg.workerPoolSize = 20;
  cfg.requestRatePerSec = 10;
  cfg.targets = {
    Slow: { weight: 1, latencyMs: 8000, errorRate: 0, capacity: 50, breaker: null, bulkheadSize: 24, adaptive: null, timeoutMs: 1000 },
  };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(91), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 100 }; sim.tick(100);   // one request; the Slow leg is wrapped at 1s
  sim.config.requestRatePerSec = 0;
  sim.clock = { now: () => 1200 }; sim.tick(1200);  // past the 1s outgoing timeout, well before 8s
  assert.equal(sim.getState().counters.timeout, 1);
});

test('getState reports per-callee outgoing-timeout cuts separately from other errors', () => {
  // The diagram's stopwatch flashes on timeoutsPerSec, so a slow-but-not-erroring
  // callee whose leg our wrapper abandons must show timeouts (not generic errors).
  const cfg = defaultConfig();
  cfg.workerPoolSize = 20;
  cfg.requestRatePerSec = 20;
  cfg.timeoutMs = 30000;
  cfg.targets = { C: { weight: 1, latencyMs: 8000, errorRate: 0, capacity: 50, breaker: null, bulkheadSize: 24, adaptive: null, timeoutMs: 1000 } };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(92), config: cfg });
  sim.tick(0);
  run(sim, 50, 1200, 50);   // legs to C are wrapped at 1s, so they get cut at ~1s
  const s = sim.getState();
  assert.ok(s.targets.C.timeoutsPerSec > 0);   // the stopwatch would be flashing
});

function run(sim, fromMs, toMs, stepMs) {
  for (let t = fromMs; t <= toMs; t += stepMs) { sim.clock = { now: () => t }; sim.tick(t); }
}

function breaker(overrides = {}) {
  return { enabled: true, errorThreshold: 3, windowMs: 10000, cooldownMs: 5000,
           state: 'closed', openedAtMs: null, errorTimestamps: [], probeInFlight: false, ...overrides };
}

function oneTarget(extra) {
  return { C: { weight: 1, latencyMs: 50, errorRate: 0, capacity: 50, breaker: null, bulkheadSize: 6, adaptive: null, ...extra } };
}

test('a request fans out to every callee and fails if any one callee fails', () => {
  // The v3 model: one incoming request calls ALL callees. With one of the four
  // callees erroring 100% and nothing to contain it, essentially every request
  // fails. (The old single-target model wrongly showed only ~1/4 failing.)
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets['External'].errorRate = 1;   // one of four callees always errors
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(71), config: cfg });
  sim.tick(0);
  run(sim, 50, 2000, 50);
  const s = sim.getState();
  assert.equal(s.rates.successPerSec, 0);   // no request can fully succeed
  assert.ok(s.rates.errorPerSec > 0);
});

test('a breaker on the failing callee contains it so requests succeed degraded', () => {
  // Once the breaker on the erroring callee opens, that leg is short-circuited
  // (contained), so the request succeeds on its other callees instead of failing.
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets['External'].errorRate = 1;
  cfg.targets['External'].breaker = breaker();
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(72), config: cfg });
  sim.tick(0);
  run(sim, 50, 8000, 50);
  const s = sim.getState();
  assert.equal(s.targets['External'].breaker.state, 'open');
  assert.ok(s.rates.degradedPerSec > 0);    // served degraded (without External) once contained
  assert.equal(s.rates.successPerSec, 0);   // never fully successful: every request calls External
});

test('a callee slot frees when its leg completes, even while a slower leg still runs', () => {
  // A request fans out to fast A (50ms) and slow C (8000ms). A's downstream slot
  // must be released the moment A answers; only C stays in service. Without this,
  // every fast dependency would look saturated for as long as the slowest one runs.
  const cfg = defaultConfig();
  cfg.workerPoolSize = 20;
  cfg.requestRatePerSec = 10;
  cfg.timeoutMs = 30000;
  cfg.targets = {
    A: { weight: 1, latencyMs: 50, errorRate: 0, capacity: 50, breaker: null, bulkheadSize: 6, adaptive: null },
    C: { weight: 1, latencyMs: 8000, errorRate: 0, capacity: 50, breaker: null, bulkheadSize: 6, adaptive: null },
  };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(81), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 100 }; sim.tick(100);   // one request admitted, fans out to A and C
  sim.config.requestRatePerSec = 0;                // no further arrivals
  sim.clock = { now: () => 200 }; sim.tick(200);   // A finished at ~150; C runs until ~8100
  const s = sim.getState();
  assert.equal(s.targets.A.upstream.inService, 0);   // A's slot released
  assert.equal(s.targets.C.upstream.inService, 1);   // C still holds its slot
  assert.equal(s.workers.busy, 1);                     // request still pins its worker, waiting on C
});

test('a full bulkhead contains a slow callee so the request still completes fast', () => {
  // C is slow and its bulkhead is small; once full, C is rejected fast (contained),
  // so requests complete on the fast callees instead of pinning workers on slow C.
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  cfg.targets['Service C'].latencyMs = 8000;
  cfg.targets['Service C'].bulkheadSize = 3;
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(73), config: cfg });
  sim.tick(0);
  run(sim, 50, 3000, 50);
  const s = sim.getState();
  assert.ok(s.targets['Service C'].bulkhead.busy <= 3);   // slow work capped
  assert.ok(s.counters.reject > 0);                        // overflow rejected fast
  assert.ok(s.rates.degradedPerSec > 0);                   // requests still served, degraded (without C)
});

test('breaker opens after the error threshold within the window', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ errorRate: 1, breaker: breaker() });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(11), config: cfg });
  sim.tick(0);
  run(sim, 10, 400, 10);
  assert.equal(sim.getState().targets.C.breaker.state, 'open');
});

test('an open breaker short-circuits without holding a worker', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ errorRate: 1, breaker: breaker() });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(12), config: cfg });
  sim.tick(0);
  run(sim, 10, 600, 10);
  const s = sim.getState();
  assert.equal(s.targets.C.breaker.state, 'open');
  assert.ok(s.counters.breakerOpen > 0);
  assert.equal(s.targets.C.inFlight, 0);
});

test('breaker half-opens after cooldown and closes on a healthy probe', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ errorRate: 1, breaker: breaker() });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(13), config: cfg });
  sim.tick(0);
  run(sim, 10, 400, 10);                 // trip it open
  assert.equal(sim.getState().targets.C.breaker.state, 'open');
  sim.config.targets.C.errorRate = 0;    // dependency recovers
  run(sim, 410, 12000, 10);              // past the 5s cooldown, probe succeeds
  assert.equal(sim.getState().targets.C.breaker.state, 'closed');
});

test('a failed probe reopens the breaker', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ errorRate: 1, breaker: breaker() });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(14), config: cfg });
  sim.tick(0);
  run(sim, 10, 400, 10);                 // trip open, stays erroring
  run(sim, 410, 12000, 10);              // probe after cooldown fails, reopens
  assert.equal(sim.getState().targets.C.breaker.state, 'open');
});

test('errors spaced beyond the window never trip the breaker', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 100;
  cfg.targets = oneTarget({ errorRate: 1, breaker: breaker({ windowMs: 200 }) });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(15), config: cfg });
  sim.tick(0);
  // One arrival every 5s is far slower than a 200ms window; drop rate to force spacing.
  sim.config.requestRatePerSec = 0.2;
  run(sim, 5000, 60000, 5000);
  assert.equal(sim.getState().targets.C.breaker.state, 'closed');
});

test('bulkhead caps in-flight per dependency and rejects the overflow', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  for (const n of Object.keys(cfg.targets)) cfg.targets[n].bulkheadSize = 3;
  cfg.targets['Service C'].latencyMs = 8000;
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(21), config: cfg });
  sim.tick(0);
  run(sim, 50, 2000, 50);
  const s = sim.getState();
  assert.ok(s.targets['Service C'].inFlight <= 3);
  assert.ok(s.counters.reject > 0);
});

test('one saturated bulkhead does not starve a healthy dependency', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  for (const n of Object.keys(cfg.targets)) cfg.targets[n].bulkheadSize = 3;
  cfg.targets['Service C'].latencyMs = 8000;   // 8s holds, cannot complete before t=2000
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(22), config: cfg });
  sim.tick(0);
  run(sim, 50, 2000, 50);
  const s = sim.getState();
  // Service C's own pool is saturated and stuck on the slow dependency.
  assert.equal(s.targets['Service C'].bulkhead.busy, 3);
  // Yet healthy dependencies are still served. C (8s) cannot have completed by 2000ms,
  // so every success came from another dependency. Without per-dependency pools, slow C
  // would occupy the shared pool and this count would collapse toward zero.
  assert.ok(s.counters.success > 0);
});

test('a bulkhead rejection counts as an error and trips the breaker', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  cfg.targets['Service C'].latencyMs = 8000;
  cfg.targets['Service C'].bulkheadSize = 2;
  cfg.targets['Service C'].breaker = breaker({ errorThreshold: 3 });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(23), config: cfg });
  sim.tick(0);
  run(sim, 50, 2000, 50);
  assert.equal(sim.getState().targets['Service C'].breaker.state, 'open');
});

test('a downstream serves only up to its capacity; the rest wait in its queue holding a worker', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const cfg = defaultConfig();
  cfg.workerPoolSize = 20;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  cfg.targets = { C: { weight: 1, latencyMs: 8000, errorRate: 0, capacity: 1, breaker: null, bulkheadSize: 60, adaptive: null } };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(41), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 100 }; sim.tick(100);   // 10 arrive; capacity 1 serves one, nine wait downstream
  const s = sim.getState();
  assert.equal(s.targets.C.upstream.inService, 1);   // capacity caps concurrent service
  assert.equal(s.targets.C.upstream.queueDepth, 9);  // the overflow waits at the downstream
  assert.equal(s.workers.busy, 10);                    // every waiting request still pins a worker
});

test('a request waiting on a slow, low-capacity downstream times out at our deadline', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const cfg = defaultConfig();
  cfg.workerPoolSize = 20;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 1000;
  cfg.targets = { C: { weight: 1, latencyMs: 8000, errorRate: 0, capacity: 1, breaker: null, bulkheadSize: 60, adaptive: null } };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(42), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 100 }; sim.tick(100);       // 10 admitted, all deadline at 1100
  sim.config.requestRatePerSec = 0;                    // stop new work so the timeouts are observable
  sim.clock = { now: () => 1200 }; sim.tick(1200);     // past the 1000ms deadline
  const s = sim.getState();
  assert.equal(s.counters.timeout, 10);                // eight never reached service, yet all time out
  assert.equal(s.targets.C.upstream.queueDepth, 0);  // the queue drained
  assert.equal(s.targets.C.upstream.inService, 0);
});

test('observed latency includes the downstream queue wait, not just service time', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const cfg = defaultConfig();
  cfg.workerPoolSize = 20;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;                               // generous, so nothing times out
  cfg.targets = { C: { weight: 1, latencyMs: 50, errorRate: 0, capacity: 1, breaker: null, bulkheadSize: 60, adaptive: null } };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(43), config: cfg });
  sim.tick(0);
  sim.clock = { now: () => 100 }; sim.tick(100);       // 10 arrive; capacity 1 serves them one at a time
  sim.config.requestRatePerSec = 0;
  run(sim, 150, 1000, 50);                             // let the queue drain through the single slot
  // Service is 50ms, but the tail waited behind the queue, so p95 must exceed a single service time.
  assert.ok(sim.getState().latency.p95 > 50);
});

test('starvation: requests that cannot get a worker time out as client errors without blaming the healthy dependency', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const cfg = defaultConfig();
  cfg.workerPoolSize = 1;              // a single worker, easily monopolized
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 1000;                // clients give up after 1s
  cfg.targets = {
    C: { weight: 20, latencyMs: 8000, errorRate: 0, capacity: 50, breaker: null, bulkheadSize: 6, adaptive: null }, // slow, hogs the worker
    B: { weight: 1, latencyMs: 50, errorRate: 0, capacity: 50, breaker: null, bulkheadSize: 6, adaptive: null },     // healthy victim
  };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(51), config: cfg });
  sim.tick(0);
  run(sim, 50, 3000, 50);
  const s = sim.getState();
  assert.ok(s.counters.starve > 0);            // some requests never got a worker before the deadline
  assert.equal(s.targets.B.errorsPerSec, 0);   // B is healthy: its own node never lights from starvation
  assert.ok(s.rates.clientErrorsPerSec > 0);   // yet the client sees failures (the gateway is on fire)
});

test('reset clears in-flight work, the queue, and counters so an act starts clean', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const cfg = defaultConfig();
  cfg.workerPoolSize = 2;
  cfg.requestRatePerSec = 100;
  cfg.targets = { C: { weight: 1, latencyMs: 8000, errorRate: 0, capacity: 1, breaker: null, bulkheadSize: 6, adaptive: null } };
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(61), config: cfg });
  sim.tick(0);
  run(sim, 50, 1000, 50);                       // build up in-flight work and a backlog
  assert.ok(sim.getState().workers.busy > 0);   // there is state to clear
  sim.reset();
  const s = sim.getState();
  assert.equal(s.workers.busy, 0);
  assert.equal(s.queue.depth, 0);
  assert.equal(s.counters.success + s.counters.timeout + s.counters.starve, 0);
});

test("required workers follows Little's Law (rate times hold)", () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 20;
  cfg.targets = oneTarget({ latencyMs: 50 });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(31), config: cfg });
  sim.tick(0);
  run(sim, 50, 3000, 50);
  assert.ok(Math.abs(sim.getState().required.workers - 1) < 0.3);
});

test('success rate is windowed, not cumulative', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 40;
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(32), config: cfg });
  sim.tick(0);
  run(sim, 50, 3000, 50);
  assert.ok(sim.getState().rates.successPerSec > 0);   // positive under load
  sim.config.requestRatePerSec = 0;                     // stop new work
  run(sim, 3050, 5000, 50);                             // healthy calls finish; over 1s passes with no completions
  assert.equal(sim.getState().rates.successPerSec, 0);  // window emptied; a cumulative counter would stay > 0
});

test('adaptive bulkhead settles at the floor under very high latency', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  // Proportional sizing: baseline 50 over p95 8000 gives a target far below the
  // floor, so the pool clamps down to ADAPTIVE_MIN and stays there.
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ latencyMs: 8000, bulkheadSize: 20,
    adaptive: { enabled: true, sampleWindowMs: 1000, baselineLatencyMs: 50, lastSampleMs: 0 } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(33), config: cfg });
  sim.tick(0);
  run(sim, 50, 20000, 50);
  assert.equal(sim.config.targets.C.bulkheadSize, ADAPTIVE_MIN);
});

test('adaptive bulkhead opens to the max under healthy latency', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  // When p95 sits at the baseline, the proportional target is ADAPTIVE_MAX, so a
  // small pool grows open rather than staying pinned or shrinking.
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 10;
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ latencyMs: 50, bulkheadSize: 8,
    adaptive: { enabled: true, sampleWindowMs: 1000, baselineLatencyMs: 50, lastSampleMs: 0 } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(35), config: cfg });
  sim.tick(0);
  run(sim, 50, 12000, 50);
  assert.equal(sim.config.targets.C.bulkheadSize, ADAPTIVE_MAX);
});

test('adaptive bulkhead settles at a middling size for middling latency', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  // The point of proportional sizing over shrink-to-floor: at 4x baseline (200 vs
  // 50) the pool settles strictly between the floor and the max, at round(50/200*24)=6.
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ latencyMs: 200, bulkheadSize: 20,
    adaptive: { enabled: true, sampleWindowMs: 1000, baselineLatencyMs: 50, lastSampleMs: 0 } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(34), config: cfg });
  sim.tick(0);
  run(sim, 50, 12000, 50);
  const size = sim.config.targets.C.bulkheadSize;
  assert.ok(size > ADAPTIVE_MIN && size < ADAPTIVE_MAX);   // a distinct middle, not the floor
  assert.equal(size, 6);
});

test('adaptive reacts to a slow dependency before any call completes', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If the test is failing, it is because you removed or broke code.
  // A leg to an 8s dependency does not complete for 8s. A controller watching
  // only completed latency would sit blind and keep the pool at its start size;
  // watching outstanding leg age lets it shrink within the first seconds.
  const cfg = defaultConfig();
  cfg.bulkheadsEnabled = true;
  cfg.requestRatePerSec = 100;
  cfg.timeoutMs = 30000;
  cfg.targets = oneTarget({ latencyMs: 8000, bulkheadSize: 24,
    adaptive: { enabled: true, sampleWindowMs: 400, baselineLatencyMs: 50, lastSampleMs: 0 } });
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(36), config: cfg });
  sim.tick(0);
  run(sim, 50, 2000, 50);   // well before the first 8s completion
  assert.ok(sim.config.targets.C.bulkheadSize < 8);   // already shrinking, not stuck at the start
});
