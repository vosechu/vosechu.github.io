// Pure formatters for the service diagram's telemetry chrome. render.js is a thin
// consumer of these; the formatters are the unit under test. All copy lives in
// STRINGS.telemetry with {token} placeholders (same convention as STRINGS.tour.step).
import { STRINGS } from './strings.js';

const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, key) => vars[key]);

// The engine's breaker states (closed/open/half_open) shown in plain language.
export const breakerLabel = (state) => STRINGS.telemetry.breaker[state] ?? state;

// The gateway sub-label: finite worker pool, connections shown against infinity.
export const serviceSub = (workers, connections) =>
  fill(STRINGS.telemetry.serviceSub, { workers, connections });

// A dependency's callee-side readout: just what is in service, or the held total
// (in service plus queued) when a queue has formed at the dependency.
export const capacityReadout = (inService, capacity, queued) =>
  queued > 0
    ? fill(STRINGS.telemetry.capacityHeld, { held: inService + queued, inService, capacity, queued })
    : fill(STRINGS.telemetry.capacityServing, { inService, capacity });
