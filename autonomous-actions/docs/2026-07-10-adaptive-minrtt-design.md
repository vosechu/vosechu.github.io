# Adaptive concurrency: a real minRTT controller on capacity-limited dependencies

> Temporary design doc. Delete once the work has shipped and settled.

## Goal
Make the adaptive bulkhead actually operate, with a passive minRTT gradient controller, and fix the regression that leaves the bulkhead inert.

## The bug (fix first)
Every request sends one leg per dependency, so concurrency to any single dependency can never exceed the worker pool. A per-dependency limit set at the pool size can never reject. The defaults were widened to 30 (the pool size), so the bulkhead never fires, and the capacity was set at 30 too, so nothing ever queues at the dependency. Fix: default `capacity` and `bulkheadSize` sit below the pool.

## The model
Each dependency has two properties:
- **Service floor:** its unloaded response time (the latency slider).
- **Capacity:** how many calls it serves at once.

Extra calls queue at the dependency, so observed response time = floor + queue wait. Overload (demand above capacity) makes that time climb above the floor. The engine already models capacity, a downstream queue, and queue-inclusive latency; only the default parameters were wrong.

## The controller (passive, per dependency)
The controller reads **completed** latency, not the age of in-flight legs. In-flight age ramps from zero to the full response time for any slow call, so a floor learned from it would mislearn on a dependency that is simply slow, and shed it. Completed latency does not: a flat-slow dependency reports the same value every window, so its floor equals its current, and it is left open. Only a queue climbing above the floor sheds.

Each sample window, for each dependency whose adaptive is enabled and that has at least one completed sample:
- **current** = p95 of the dependency's recent completed response times.
- **floor** = running minimum of `current` across windows (the learned minRTT). Seeded on the first sample.
- **gradient** = min(1, floor / current). Near 1 when fast, below 1 when queuing.
- **newLimit** = clamp(round(limit × gradient + HEADROOM), MIN, workerPool).

Fast, so gradient is 1 and the limit grows by HEADROOM each window until it clamps at the pool. Queuing, so gradient falls and the limit settles where `limit × gradient + HEADROOM ≈ limit`, near the capacity where the queue clears. Reopening re-creates the queue, so it holds there. Stable. HEADROOM is a small constant so a healthy pool keeps opening; MIN is about 2.

The limit is applied directly (no half-stepping): the headroom-limited growth is already gradual, and a direct write is simpler to reason about and test.

**Known limitation (teaching-honest, not fixed):** the floor is learned from live traffic, so a dependency that is overloaded from the very first window learns an already-inflated floor and will not shed. The intended flow, and every scenario, warms up healthy before load rises — which is how real controllers behave. No periodic re-probe (YAGNI).

## What it teaches
It tells two states apart:
- **Slow but not overloaded:** response time sits flat at the floor, gradient near 1, no shed.
- **Overloaded:** response time climbs above the floor, gradient below 1, shed, the queue clears, the SLO holds.

This is the answer to "how does adaptive handle a dependency with hugely variable response times, like a database": it does not size on the absolute latency, it sizes on how far latency has climbed above the floor it learned, so ordinary variation around a stable floor does not cause it to flap.

## Tests (deterministic, observable)
Engine latency is fixed per target, so all variation is queue-induced and runs are reproducible under a seeded rng.
- **Learns the floor:** after healthy warm-up, `adaptive.floorMs` is within tolerance of the unloaded latency.
- **Opens toward the pool when healthy:** start the limit small, run healthy, the limit grows to the worker-pool size.
- **Sheds when overloaded:** warm up healthy, then a low-capacity dependency under high rate drives observed above the floor; the limit ends well below where it started.
- **Settles in the middle under sustained moderate overload:** the limit ends strictly above MIN and strictly below the pool.
- **Does not shed a slow-but-not-queuing dependency:** a high-latency dependency with capacity above the offered concurrency never queues, so its limit stays open (at the pool), not shrunk.
- **Stable, does not oscillate:** across the last several windows of a steady overload the limit stays within a narrow band.
- **Inert when adaptive is off:** with `bulkheadsEnabled` false or `adaptive.enabled` false, the limit never changes.

## PR breakdown (ships as one PR; each item is one task/commit on the branch)
1. **Fix the inert defaults.** Set `capacity` and `bulkheadSize` below the pool in `defaultConfig`. Test that the bulkhead now rejects overflow and a downstream queue forms at the default settings. Smallest behavior fix.
2. **Passive minRTT gradient controller.** Replace the frozen-baseline `_runAdaptive` with the gradient rule and a per-dependency running-minimum floor; drop `_maxInflightAge` if it is then unused; add `HEADROOM`. Replace the four old adaptive tests (they encode the old proportional-baseline behavior and carry AI-DEV markers; this is the approved spec change) with the deterministic tests above, re-adding AI-DEV markers after the red-green cycle. Inert unless adaptive is enabled.
3. **Wire the readout and act copy.** Show learned floor vs current response time and the shed/open decision in the tour readout. Update the adaptive act so the player drives overload on a capacity-limited dependency and watches it settle.
