export const FAST_FAIL_MS = 5;         // a clipped connection fails almost instantly
export const LATENCY_SAMPLE_SIZE = 50; // completions kept for p95
export const ADAPTIVE_MIN = 2;
// Adaptive sizing scales against, and is capped by, the live worker pool size
// (config.workerPoolSize), so the pool floats up to whatever the pool is set to.
export const DEFAULT_CAPACITY = 30;    // callee-side service slots; matches the 30 shown boxes
// The rAF driver advances the sim by at most this much real time per frame. A
// backgrounded tab or slept machine pauses requestAnimationFrame; without this
// cap the next frame would jump the clock by the whole gap and inject rate*gap
// arrivals in one tick, flooding the queue. Tests call tick() directly and are
// unaffected.
export const MAX_TICK_MS = 250;

export function defaultConfig() {
  // timeoutMs here is our OUTGOING timeout wrapping the call to this callee,
  // separate from the front-door config.timeoutMs below.
  const target = (latencyMs, color, abbrev, label, note) => ({
    latencyMs, errorRate: 0, capacity: DEFAULT_CAPACITY,
    breaker: null, bulkheadSize: 30, adaptive: null, timeoutMs: 30000, color, abbrev, label, note,
  });
  return {
    requestRatePerSec: 20,
    workerPoolSize: 30,
    bulkheadsEnabled: false,
    timeoutMs: 30000,
    // Order here drives the diagram top-to-bottom and the slider list. Keys are
    // internal ids; label/note are what the player sees.
    targets: {
      'Database A': target(30, '#5aa2ff', 'DB', 'Database', ''),
      'Service B': target(50, '#2fd6b8', 'Rep', 'Reports Service', ''),
      'Service C': target(50, '#ff5a72', 'An', 'Analytics Service', ''),
      'External': target(120, '#ffb64d', 'Ext', 'External Service', ''),
    },
    // phaseRef shifts the sine's zero crossing so it can resume from wherever the
    // player releases the rate slider instead of snapping back to the old phase.
    loadOscillation: { enabled: false, amplitude: 0.5, periodMs: 20000, phaseRef: 0 },
  };
}
