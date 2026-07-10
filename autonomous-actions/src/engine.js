import { FAST_FAIL_MS, LATENCY_SAMPLE_SIZE, ADAPTIVE_MIN } from './config.js';

// One outbound call's outcome, ignoring queueing. r is a [0,1) roll.
export function resolveOutcome(target, timeoutMs, r) {
  if (r < target.errorRate) return { outcome: 'error', latencyMs: FAST_FAIL_MS };
  const nominal = target.latencyMs;
  if (nominal > timeoutMs) return { outcome: 'timeout', latencyMs: timeoutMs };
  return { outcome: 'success', latencyMs: nominal };
}

export function effectiveRate(baseRatePerSec, osc, nowMs) {
  if (!osc || !osc.enabled) return baseRatePerSec;
  const factor = 1 + osc.amplitude * Math.sin((2 * Math.PI * (nowMs - (osc.phaseRef || 0))) / osc.periodMs);
  return Math.max(0, baseRatePerSec * factor);
}

function pushCapped(list, value, max = LATENCY_SAMPLE_SIZE) {
  list.push(value);
  if (list.length > max) list.shift();
}

// The v3 model: one incoming request FANS OUT to every callee in parallel. The
// request holds exactly one worker until its slowest leg returns (latency = the
// max leg), and it succeeds only if every leg either succeeds or fails in a
// CONTAINED way. A breaker short-circuit is contained; a bulkhead rejection is
// contained too (a slow failure turned fast, which the breaker then catches).
// Any uncontained failure (error, timeout, downstream-queue timeout) fails the
// whole request.
//
// A leg's phase is one of:
//   'shortcircuit' - breaker open, contained, resolves in FAST_FAIL_MS
//   'reject'       - bulkhead full, contained, resolves in FAST_FAIL_MS
//   'error'        - the call errored, uncontained, resolves in FAST_FAIL_MS
//   'queued'       - waiting for a downstream service slot (holds nothing yet)
//   'service'      - occupying a downstream slot until serviceEndAt
// and once resolved carries a status: 'success' | 'contained' | 'failed'.
export class Sim {
  constructor({ clock, rng, config }) {
    this.clock = clock;
    this.rng = rng;
    this.config = config;
    this.lastMs = null;
    this.arrivalCredit = 0;
    this.inflight = [];        // requests: { startAt, deadlineAt, legs, done }
    this.queue = [];           // worker-pool wait queue: { enqueuedAt }
    this.recent = [];          // recent per-request latencies (ms)
    this.counters = { success: 0, error: 0, timeout: 0, reject: 0, starve: 0, breakerOpen: 0 };
    this.events = [];          // windowed: { t, scope:'leg'|'req', target?, kind }
    this.recentByTarget = {};  // per-callee observed-latency samples (ms)
  }

  setConfig(patch) { Object.assign(this.config, patch); }

  // Clear all runtime state while keeping the clock, rng, and config. Called on
  // act changes so each scenario starts clean, not with the previous backlog.
  reset() {
    this.lastMs = null;
    this.arrivalCredit = 0;
    this.inflight = [];
    this.queue = [];
    this.recent = [];
    this.counters = { success: 0, error: 0, timeout: 0, reject: 0, starve: 0, breakerOpen: 0 };
    this.events = [];
    this.recentByTarget = {};
  }

  tick(nowMs) {
    if (this.lastMs === null) { this.lastMs = nowMs; return; }
    const dt = nowMs - this.lastMs;
    if (dt <= 0) { this.lastMs = nowMs; return; }
    this._resolveCompletions(nowMs);
    this._promoteDownstream(nowMs);
    this._expireQueue(nowMs);
    this._drainQueue(nowMs);
    this._generateArrivals(dt, nowMs);
    this._runAdaptive(nowMs);
    this.events = this.events.filter((e) => e.t > nowMs - 1000);
    this.lastMs = nowMs;
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

  // Count this callee's legs that hold or want a downstream slot (real work).
  _activeLegs(name) {
    let count = 0;
    for (const req of this.inflight) {
      for (const leg of req.legs) {
        if (leg.target === name && (leg.phase === 'service' || leg.phase === 'queued')) count += 1;
      }
    }
    return count;
  }

  _inService(name) {
    let count = 0;
    for (const req of this.inflight) {
      for (const leg of req.legs) if (leg.target === name && leg.phase === 'service') count += 1;
    }
    return count;
  }

  // The longest an in-flight leg to this callee has been running. A leg that has
  // been outstanding a long time signals a slow dependency before it completes,
  // so the adaptive controller can react to an 8s dependency within one sample
  // window instead of waiting the full 8s for the first completion.
  _maxInflightAge(name, nowMs) {
    let maxAge = 0;
    for (const req of this.inflight) {
      for (const leg of req.legs) {
        if (leg.target === name && (leg.phase === 'service' || leg.phase === 'queued')) {
          maxAge = Math.max(maxAge, nowMs - req.startAt);
        }
      }
    }
    return maxAge;
  }

  // Start one outbound leg to a callee. Applies the breaker gate, then (if
  // bulkheads are on) the per-callee concurrency cap, then rolls the call
  // outcome. Contained legs (short-circuit, reject) resolve fast and do not
  // hold a downstream slot.
  // Our outgoing timeout wrapping the call to this callee. A callee may set its
  // own (target.timeoutMs); otherwise it inherits the front-door timeout. This is
  // distinct from config.timeoutMs, which is the incoming/front-door patience.
  _legTimeout(target) {
    return target.timeoutMs != null ? target.timeoutMs : this.config.timeoutMs;
  }

  _startLeg(name, nowMs) {
    const target = this.config.targets[name];
    const legTimeout = this._legTimeout(target);
    const br = target.breaker;
    if (br && br.enabled) {
      const gate = this._breakerGate(br, nowMs);
      if (gate === 'short_circuit') {
        this.counters.breakerOpen += 1;
        return { target: name, phase: 'shortcircuit', status: null, endAt: nowMs + FAST_FAIL_MS };
      }
      if (gate === 'probe') br.probeInFlight = true;
    }
    if (this.config.bulkheadsEnabled && this._activeLegs(name) >= target.bulkheadSize) {
      // A full bulkhead turns slow work into a fast, contained failure. It still
      // counts against the breaker, so a saturated bulkhead trips the breaker.
      this.counters.reject += 1;
      this.events.push({ t: nowMs, scope: 'leg', target: name, kind: 'reject' });
      if (br && br.enabled) this._breakerRecord(br, 'error', nowMs);
      return { target: name, phase: 'reject', status: null, endAt: nowMs + FAST_FAIL_MS };
    }
    const base = resolveOutcome(target, legTimeout, this.rng());
    if (base.outcome === 'error') {
      return { target: name, phase: 'error', status: null, endAt: nowMs + base.latencyMs };
    }
    // Each leg carries its own deadline from its callee's outgoing timeout.
    const deadlineAt = nowMs + legTimeout;
    if (this._inService(name) < target.capacity) {
      return { target: name, phase: 'service', status: null, deadlineAt, serviceEndAt: nowMs + target.latencyMs };
    }
    return { target: name, phase: 'queued', status: null, deadlineAt, serviceEndAt: null };
  }

  _beginRequest(nowMs) {
    const legs = Object.keys(this.config.targets).map((name) => this._startLeg(name, nowMs));
    this.inflight.push({ startAt: nowMs, legs, done: false });
  }

  // Resolve a single leg if it has finished this tick, returning its observed
  // span (ms) and status, or null if it is still running.
  _resolveLeg(leg, req, nowMs) {
    if (leg.phase === 'shortcircuit') {
      return nowMs >= leg.endAt ? { observedMs: FAST_FAIL_MS, status: 'contained', kind: null } : null;
    }
    if (leg.phase === 'reject') {
      return nowMs >= leg.endAt ? { observedMs: FAST_FAIL_MS, status: 'contained', kind: null } : null;
    }
    if (leg.phase === 'error') {
      return nowMs >= leg.endAt ? { observedMs: FAST_FAIL_MS, status: 'failed', kind: 'error' } : null;
    }
    if (leg.phase === 'queued') {
      // Still waiting for a downstream slot: the only exit this early is our outgoing timeout.
      return nowMs >= leg.deadlineAt
        ? { observedMs: leg.deadlineAt - req.startAt, status: 'failed', kind: 'timeout' } : null;
    }
    // 'service': whichever comes first, service finishing or our outgoing timeout.
    const endMs = Math.min(leg.serviceEndAt, leg.deadlineAt);
    if (nowMs < endMs) return null;
    const ok = leg.serviceEndAt <= leg.deadlineAt;
    return { observedMs: endMs - req.startAt, status: ok ? 'success' : 'failed', kind: ok ? 'success' : 'timeout' };
  }

  _resolveCompletions(nowMs) {
    const still = [];
    for (const req of this.inflight) {
      let allDone = true;
      let maxSpan = 0;
      for (const leg of req.legs) {
        if (leg.status !== null) { maxSpan = Math.max(maxSpan, leg.observedMs); continue; }
        const done = this._resolveLeg(leg, req, nowMs);
        if (!done) { allDone = false; continue; }
        leg.status = done.status;
        leg.observedMs = done.observedMs;
        leg.phase = 'done';   // release this callee's slot now, not when the whole request ends
        maxSpan = Math.max(maxSpan, done.observedMs);
        // Contained legs (short-circuit, reject) never touched the downstream, so
        // they feed neither its latency samples nor its breaker. Only real calls do.
        if (done.kind) {
          this.counters[done.kind] += 1;
          this.events.push({ t: nowMs, scope: 'leg', target: leg.target, kind: done.kind });
          pushCapped((this.recentByTarget[leg.target] ||= []), done.observedMs);
          const br = this.config.targets[leg.target].breaker;
          if (br && br.enabled) this._breakerRecord(br, done.kind, nowMs);
        }
      }
      if (!allDone) { still.push(req); continue; }
      // Every leg resolved. A failed leg errors the whole request. Otherwise it is
      // served; if any leg was contained (short-circuited or rejected) the response
      // is degraded (returned without that dependency) rather than a full success.
      const failed = req.legs.some((l) => l.status === 'failed');
      const degraded = req.legs.some((l) => l.status === 'contained');
      const outcome = failed ? 'error' : degraded ? 'degraded' : 'success';
      this.events.push({ t: nowMs, scope: 'req', kind: outcome });
      this._recordLatency(maxSpan);
    }
    this.inflight = still;
  }

  // Fill freed downstream slots from that callee's waiting legs, oldest first.
  _promoteDownstream(nowMs) {
    for (const [name, target] of Object.entries(this.config.targets)) {
      let free = target.capacity - this._inService(name);
      if (free <= 0) continue;
      for (const req of this.inflight) {
        if (free <= 0) break;
        for (const leg of req.legs) {
          if (free <= 0) break;
          if (leg.target === name && leg.phase === 'queued' && leg.status === null) {
            leg.phase = 'service';
            leg.serviceEndAt = nowMs + target.latencyMs;
            free -= 1;
          }
        }
      }
    }
  }

  // A request waiting for a free worker gives up when our timeout elapses. It
  // never reached any callee, so it is charged to no dependency (a 'starve').
  _expireQueue(nowMs) {
    const still = [];
    for (const q of this.queue) {
      if (nowMs >= q.enqueuedAt + this.config.timeoutMs) {
        this.counters.starve += 1;
        this.events.push({ t: nowMs, scope: 'req', kind: 'starve' });
      } else {
        still.push(q);
      }
    }
    this.queue = still;
  }

  _drainQueue(nowMs) {
    while (this.queue.length > 0 && this.inflight.length < this.config.workerPoolSize) {
      this.queue.shift();
      this._beginRequest(nowMs);
    }
  }

  _admit(nowMs) {
    if (this.inflight.length < this.config.workerPoolSize) this._beginRequest(nowMs);
    else this.queue.push({ enqueuedAt: nowMs });
  }

  _generateArrivals(dt, nowMs) {
    const rate = effectiveRate(this.config.requestRatePerSec, this.config.loadOscillation, nowMs);
    this.arrivalCredit += (dt / 1000) * rate;
    while (this.arrivalCredit >= 1) {
      this.arrivalCredit -= 1;
      this._admit(nowMs);
    }
  }

  _recordLatency(ms) { pushCapped(this.recent, ms); }

  // Percentile over completed latencies AND the current age of in-flight requests,
  // so a growing backlog raises the latency in real time (as an APM agent measuring
  // live requests would see it) instead of only once the queue drains or times out.
  _percentile(p) {
    const ages = this.inflight.map((req) => this.lastMs - req.startAt);
    return this._percentileOf(this.recent.concat(ages), p);
  }

  _percentileOf(list, p) {
    if (!list || list.length === 0) return 0;
    const sorted = [...list].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  }

  // Proportional bulkhead sizing. The healthy pool is the full worker pool; as
  // observed latency rises above the baseline, the target size shrinks inversely
  // toward ADAPTIVE_MIN (size ~ baseline / p95). Each sample the pool moves halfway
  // to its target, so the change is visible and settles at a size that reflects the
  // current latency, rather than always collapsing to the floor.
  _runAdaptive(nowMs) {
    if (!this.config.bulkheadsEnabled) return;
    for (const [name, target] of Object.entries(this.config.targets)) {
      const a = target.adaptive;
      if (!a || !a.enabled) continue;
      if (nowMs - a.lastSampleMs < a.sampleWindowMs) continue;
      a.lastSampleMs = nowMs;
      const p95 = this._percentileOf(this.recentByTarget[name], 95);
      const observed = Math.max(p95, this._maxInflightAge(name, nowMs));
      const ratio = a.baselineLatencyMs / Math.max(observed, 1);
      const ceiling = this.config.workerPoolSize;   // adaptive floats up to the live pool size
      const desired = Math.max(ADAPTIVE_MIN, Math.min(ceiling, Math.round(ratio * ceiling)));
      a.target = desired;         // exposed for the adaptive readout
      a.observedMs = observed;    // the latency signal that drove this decision
      const gap = desired - target.bulkheadSize;
      if (gap !== 0) {
        const step = Math.max(1, Math.round(Math.abs(gap) / 2));
        target.bulkheadSize += gap > 0 ? Math.min(step, gap) : Math.max(-step, gap);
      }
    }
  }

  getState() {
    const active = {};      // legs holding/wanting a slot, per callee
    const queuedByTarget = {};
    for (const req of this.inflight) {
      for (const leg of req.legs) {
        if (leg.phase === 'service' || leg.phase === 'queued') {
          active[leg.target] = (active[leg.target] || 0) + 1;
          if (leg.phase === 'queued') queuedByTarget[leg.target] = (queuedByTarget[leg.target] || 0) + 1;
        }
      }
    }
    const legErrors = (name) => this.events.filter(
      (e) => e.scope === 'leg' && e.target === name && (e.kind === 'error' || e.kind === 'timeout' || e.kind === 'reject')).length;
    // Just the outgoing-timeout cuts for this callee, so the diagram's stopwatch can
    // flash only while our wrapper is actually abandoning calls to it.
    const legTimeouts = (name) => this.events.filter(
      (e) => e.scope === 'leg' && e.target === name && e.kind === 'timeout').length;
    const targets = {};
    for (const name of Object.keys(this.config.targets)) {
      const cfg = this.config.targets[name];
      const br = cfg.breaker;
      const breakerState = br && br.enabled
        ? { state: br.state, errorsInWindow: br.errorTimestamps.filter((ts) => ts > this.lastMs - br.windowMs).length }
        : null;
      const bulkhead = this.config.bulkheadsEnabled
        ? { enabled: true, size: cfg.bulkheadSize, busy: active[name] || 0,
            free: Math.max(0, cfg.bulkheadSize - (active[name] || 0)) }
        : null;
      const upstream = { capacity: cfg.capacity, inService: this._inService(name), queueDepth: queuedByTarget[name] || 0 };
      targets[name] = { inFlight: active[name] || 0, upstream, bulkhead, breaker: breakerState,
        errorsPerSec: legErrors(name), timeoutsPerSec: legTimeouts(name), outgoingTimeoutMs: this._legTimeout(cfg) };
    }
    const avgHoldSec = this.recent.length ? (this.recent.reduce((a, b) => a + b, 0) / this.recent.length) / 1000 : 0;
    const reqPerSec = (kind) => this.events.filter((e) => e.scope === 'req' && e.kind === kind).length;
    const successPerSec = reqPerSec('success');
    const degradedPerSec = reqPerSec('degraded');   // served, but missing a contained dependency
    // Client-facing failures: requests that errored, plus requests that never
    // got a worker (starve). Contained leg rejects are NOT client errors.
    const errorPerSec = reqPerSec('error') + reqPerSec('starve');
    const rejectPerSec = this.events.filter((e) => e.scope === 'leg' && e.kind === 'reject').length;
    return {
      nowMs: this.lastMs,
      workers: { size: this.config.workerPoolSize, busy: this.inflight.length, byTarget: active },
      queue: { depth: this.queue.length },
      targets,
      counters: { ...this.counters },
      rates: { successPerSec, degradedPerSec, errorPerSec, rejectPerSec, clientErrorsPerSec: errorPerSec },
      latency: { p95: this._percentile(95) },
      required: { workers: this.config.requestRatePerSec * avgHoldSec },
    };
  }
}
