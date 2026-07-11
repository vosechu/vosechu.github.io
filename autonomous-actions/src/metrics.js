// Windowed availability: served requests over all resolved requests. Degraded
// requests were served (missing one dependency) and count as available.
// clientErrorsPerSec already includes starved requests. Rejects are leg-level
// and must not appear here. No traffic reads 100, never NaN.
export function availabilityPercent(rates) {
  const served = rates.successPerSec + rates.degradedPerSec;
  const total = served + rates.clientErrorsPerSec;
  return total === 0 ? 100 : (served / total) * 100;
}
