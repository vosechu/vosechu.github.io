export const FAST_FAIL_MS = 5;         // a clipped connection fails almost instantly
export const LATENCY_SAMPLE_SIZE = 50; // completions kept for p50/p95
export const ADAPTIVE_MIN = 2;
export const ADAPTIVE_MAX = 24;            // healthy pool size; matches the 24 shown slots
export const DEFAULT_CAPACITY = 24;    // callee-side service slots; matches the 24 shown boxes

export function defaultConfig() {
  // timeoutMs here is our OUTGOING timeout wrapping the call to this callee,
  // separate from the front-door config.timeoutMs below.
  const target = (latencyMs, color, abbrev, label, note) => ({
    weight: 1, latencyMs, errorRate: 0, capacity: DEFAULT_CAPACITY,
    breaker: null, bulkheadSize: 24, adaptive: null, timeoutMs: 30000, color, abbrev, label, note,
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
      'Service B': target(50, '#2fd6b8', 'Rep', 'Reports Service', 'Slow, higher timeout'),
      'Service C': target(50, '#ff5a72', 'An', 'Analytics Service', 'Fast, lower timeout'),
      'External': target(120, '#ffb64d', 'Ext', 'External Service', 'Random outages'),
    },
    // phaseRef shifts the sine's zero crossing so it can resume from wherever the
    // player releases the rate slider instead of snapping back to the old phase.
    loadOscillation: { enabled: false, amplitude: 0.5, periodMs: 20000, phaseRef: 0 },
  };
}
