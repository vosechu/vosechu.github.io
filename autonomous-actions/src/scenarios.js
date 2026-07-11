import { STRINGS } from './strings.js';

// Acts are guide-only: each carries whether the tour's adaptive readout shows,
// and (via controls.js) which knobs it unlocks. The player-facing title,
// instruction, and caption live in strings.js, keyed by the same index. Acts do
// NOT set any state; the instructions walk the player into each scenario and
// the sim stays however they left it. "Reset to defaults" is the only way back
// to the baseline.
export const ACTS = [
  { readoutVisible: false },   // 0: Baseline and the SLO
  { readoutVisible: false },   // 1: Incident: External refuses connections
  { readoutVisible: false },   // 2: Response: circuit breaker
  { readoutVisible: false },   // 3: Incident: Analytics hangs
  { readoutVisible: false },   // 4: Incident: Reports slows down
  { readoutVisible: false },   // 5: Response: bulkhead
  { readoutVisible: true },    // 6: Response: adaptive sizing
  { readoutVisible: true },    // 7: Free play
];

export function actMeta(index) {
  return { ...STRINGS.acts[index], readoutVisible: ACTS[index].readoutVisible };
}
