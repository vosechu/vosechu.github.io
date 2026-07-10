# Autonomous actions: a live simulator for circuit breakers and bulkheads

## Summary

Static diagrams cannot teach circuit breakers and bulkheads, because the core problem is temporal: connection pools fill over time, and a slow-but-healthy dependency drains a shared worker pool in a way no single frame can show. This app is a buildless JavaScript simulator with a real discrete-event engine. It runs a fixed topology (laptop, gateway, downstream services and databases), animates requests as they occupy and release worker slots, and lets the viewer inject fast and slow faults and toggle protection mechanisms. A guided six-act tour lands one claim ("slow is worse than dead"), then unlocks free-play. The load-bearing constraint: the visuals must be a faithful rendering of true engine state, never a scripted animation, so the free-play mode stays honest and the "aha" is emergent.

## Problem

People do not internalize why a circuit breaker fails to protect against a slow dependency, or why a finite connection pool (a bulkhead) is the thing that saves them. The author has written six blog posts and many diagrams on this and still cannot make it land.

The reason is that the failure is dynamic. A circuit breaker trips on errors per unit time. A slow-but-successful dependency produces no errors, so the breaker never trips, yet every in-flight request pins a worker for the full slow duration. The shared worker pool drains to zero, and requests to healthy dependencies starve. This is `L = lambda * W` (Little's Law): required concurrency equals arrival rate times hold time, and a large `W` blows up `L` past any pool you would size. A still image cannot show a pool draining or a queue climbing.

Solved looks like: a viewer with no prior knowledge watches the shared pool turn one color as a slow dependency eats it, sees a healthy request starve, and can state why afterward. They can then dial in two real-world configs (a 90s timeout with a breaker, a 5s timeout with no breaker) and predict which survives.

## Approach and key decisions

Four decisions, each settled during brainstorming:

- **Hybrid tour then sandbox.** The six-act guided tour is the lesson and runs on the same live engine as free-play. On rails to the aha, then controls unlock. A pure sandbox lets people wander past the point; a pure tour blocks curiosity.
- **Real discrete-event simulation, not scripted animation.** Request tokens acquire a finite worker slot, hold it for the call duration, and release it. Pools, breakers, and queues are real state. The visuals only render that state. Free-play is meaningless without this.
- **Buildless single-page app, vanilla JavaScript.** No framework, no bundler. Ships to GitHub Pages off this public repo and opens with a trivial static server locally. The topology is small and fixed, so a framework earns nothing.
- **Deterministic engine.** The engine takes an injected clock and a seeded RNG. The browser advances the clock with real elapsed time; tests advance a fake clock in fixed steps. Same seed means same run, so every scenario is reproducible and every bug is repeatable.

## Simulation model

**Entities.** A request token carries a target dependency, a state (traveling, queued, in-service, done, rejected, errored, timed-out), and timestamps. Nodes are the laptop (load generator), the gateway ("Our service"), and downstream nodes (Service B, Service C, Database A, one External). Downstream nodes have a response profile: base latency plus a fault state. The gateway holds a finite worker pool (the shared resource). With bulkheads on, each dependency also gets its own finite connection pool. Each dependency optionally has a circuit breaker.

**The loop, evaluated against real elapsed time each frame:**

1. The load generator emits requests at the request rate, each picking a target from a fixed mix.
2. The request reaches the gateway and must acquire a worker. With bulkheads off, it takes from the shared pool; none free means it queues. With bulkheads on, it takes from that dependency's pool; exhaustion means an instant reject, while other dependencies keep their own workers.
3. The breaker for that dependency is checked. Open means fail fast locally and release the worker at once. Closed or half-open means proceed.
4. The downstream call resolves one of three ways, and the worker stays pinned until it does: success after `callee latency` (a slow fault inflates this, and a slow call still returns 200 if it beats the timeout), a fast error (clipped-connection fault), or a timeout error at `request timeout` if still outstanding.
5. Breaker accounting: errors, timeouts, and bulkhead rejections all count toward "N errors within the window." Hitting the threshold opens the breaker for a cooldown, then it half-opens (one request through), and a success closes it.

**The subtlety that makes the demo work.** The killer case is slow-but-successful responses that beat a too-generous timeout. They produce no errors, so the breaker stays closed, yet every worker is pinned for the full slow duration and the pool drains. "Slow success" is a first-class outcome in the model, distinct from "error." This is also what makes the timeout an honest lever: a tighter timeout converts slow successes into timeout-errors, releasing workers sooner and finally tripping the breaker, at the cost of failing that traffic. Worker hold time is `min(callee latency, timeout)`, which is the whole 90s-versus-5s story in one expression.

**Adaptive bulkhead.** In the capstone, the per-dependency pool size auto-adjusts with a gradient or AIMD-style controller: sample latency, shrink the limit when latency runs above baseline, grow it when healthy, stay within bounds. This is the mechanism Envoy's adaptive concurrency filter and Netflix concurrency-limits actually ship (see [Terminology reference](#terminology-reference)).

## Architecture

Buildless, but split into modules because the queuing math is correctness-critical and tests ship with it.

- `engine.js`: a pure ES module with the `Sim` class plus pool, breaker, and bulkhead logic. No DOM, no browser APIs. This is the tested unit.
- `scenarios.js`: the act definitions as data (preset slider values, which mechanisms are on, which controls are live, caption text). No logic.
- `render.js`: reads engine state each frame and draws the SVG topology, pools, tokens, queue, and metrics. No simulation logic.
- `controls.js`: wires sliders and act navigation to the engine.
- `index.html`: imports the above via `<script type="module">`. No bundler, no `node_modules` to run it.

Native ES modules do not load over `file://` in most browsers (CORS), so double-clicking `index.html` will not work. Local viewing is `npx serve` or `python3 -m http.server` in the folder; the real home is GitHub Pages. This is the standard buildless tradeoff, taken because a testable engine is worth more than a double-clickable file.

## Scenario flow

The topology is fixed across all acts: laptop to gateway to Service B, Service C, Database A, one External. Service C is the designated victim. Service B stays healthy throughout, so its collateral suffering is what makes cascading failure visible. Sliders stay live in every act; each act presets them and narrates.

| Act | Setup | Mechanisms | The point |
|---|---|---|---|
| 0. Healthy baseline | No faults | None | Teach the visual vocabulary: token, worker slot, pool, queue |
| 1. Fast failure, no protection | Clip Service C | None | Fast failures are annoying but self-limiting; workers free instantly |
| 2. Breaker on fast failure | Clip C | Breaker on C | Breakers are great at fast failures. Callee-latency slider is live and encouraged, so the viewer walks into Act 3 by dragging it up |
| 3. Slow failure, breaker only | C slow-but-successful (8s, 200), loose timeout | Breaker on C | The money shot: one slow healthy dependency drains the shared pool and starves healthy Service B while the breaker sits useless |
| 4. Bulkhead | C still slow | Breaker plus per-dependency pools | Bulkheads contain the blast radius and convert slow failures into fast rejects, which finally trip the breaker |
| 5. Tuning trap, then adaptive | C slow, pool mis-sized | Adaptive bulkhead | Fixed pools are a guess (too small rejects good bursts, too big does not protect); adaptive self-tunes. Controls then unlock into free-play |

Inside Act 3, two one-click presets carry the real-world contrast: "90s timeout plus breaker" (hopeless, pool dead many times over) versus "5s timeout, no breaker" (survivable, workers recycle). Same slow C, opposite outcomes. This is where the timeout stops being a config value and becomes a strategy with a cost.

In Act 5, the `required = rate * hold` readout turns on (default off before then), predicting exhaustion a beat before it happens on screen. The act also names the terminology trap out loud: Envoy calls its bulkhead a "circuit breaker," Semian and resilience4j bulkheads are fixed, and the only thing that self-tunes is an adaptive concurrency limit.

## Visual design

Match the author's existing diagram language: laptop on the left, the gateway as the center box, shielded downstream boxes on the right, labeled connection lines, toggle switches for mechanisms, a fire icon for faults, teal for healthy and red for failing.

The load-bearing visual: the worker pool is a grid of slots inside the gateway, and each occupied slot is colored by the dependency it is pinned to. When slow C eats the pool, the grid turns C-colored until no room is left for a Service B request. "One slow dependency is starving everything else" becomes a color filling a box.

Supporting elements: tokens are dots moving along edges, colored by state (in-flight, success, error, timeout, reject). The queue is a visible backlog with a live depth number, display-only. With bulkheads on, the single pool splits into per-dependency slot groups, so C's group can be full while B's sits open beside it. Each edge shows a closed / open / half-open breaker indicator. A metrics strip shows success, error, and reject rates, observed p50 and p95, and the `required` versus pool-size readout in Act 5. An act panel holds the title, caption, Next and Back, and a per-act reset.

## Testing

The engine holds the correctness, so that is where the tests go. Unit tests on `engine.js` run on Node's built-in runner (`node:test` plus `node:assert`, zero test dependencies), deterministic via the injected clock and seeded RNG:

- Pool acquire and release; exhaustion queues without a bulkhead and rejects with one.
- Worker hold equals `min(latency, timeout)`, released at the expected tick.
- Slow-success and timeout-error are distinct outcomes.
- Breaker state machine: closed to open after N errors in the window; cooldown to half-open to closed on success; timeouts and bulkhead rejections both count.
- Bulkhead isolation: draining C's pool does not block Service B.
- The `required = rate * hold` readout matches Little's Law and predicts the exhaustion tick.
- The adaptive controller shrinks under high latency, grows when healthy, stays within bounds.
- Same seed produces an identical run.

Each test follows red-green-refactor, test names describe the behavior, and confirmed tests carry an `// AI-DEV:` marker so they are not later "fixed" by editing the test. `render.js` and `controls.js` are thin and DOM-bound, so they get a light smoke check and manual browser verification, not a heavy DOM integration suite.

## Risks and tradeoffs

- **Rendering strain.** DOM and SVG can struggle past a few hundred animated tokens. Accepted, because the point reads at modest token counts (a 20-slot pool filling is legible at a glance). If it strains, swap only the token layer to Canvas; the engine does not change.
- **Not double-clickable.** The buildless-but-modular choice needs a static server locally. Accepted for a testable engine. Documented in the README.
- **Engine fidelity versus simplicity.** A full production resilience library is out of scope. The model captures pools, breakers, timeouts, bulkheads, and one adaptive controller, which is enough for the six acts. More knobs would dilute the aha.
- **Reversibility.** Two-way door throughout. It is a static site with no data and no dependents.

## Terminology reference

Verified against current docs on 2026-07-09:

- **Envoy** labels its static concurrency limits (max connections, max pending requests, max requests) "circuit breakers," which are bulkheads by function. Its separate adaptive concurrency filter is a gradient controller that samples latency (minRTT versus current) and resizes the limit on its own. So "Envoy adaptive circuit breakers" are adaptive bulkheads. Sources: [envoyproxy.io adaptive_concurrency_filter](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/adaptive_concurrency_filter), [gateway.envoyproxy.io circuit-breaker](https://gateway.envoyproxy.io/docs/tasks/traffic/circuit-breaker/).
- **Semian** (Shopify, Ruby) provides fixed bulkheads only, via SysV semaphores. No adaptive mode. Source: [github.com/Shopify/semian](https://github.com/Shopify/semian).
- **Hystrix** (Netflix) ships a fixed thread-pool bulkhead and is in maintenance mode. Its adaptive successor is Netflix [concurrency-limits](https://netflixtechblog.medium.com/performance-under-load-3e6fa9a60581) (an adaptive bulkhead); the other successor, resilience4j, is still fixed (SemaphoreBulkhead or FixedThreadPoolBulkhead). Sources: [Netflix/Hystrix README](https://github.com/Netflix/Hystrix/blob/master/README.md), [resilience4j bulkhead docs](https://resilience4j.readme.io/docs/bulkhead).

The takeaway the app teaches: the adaptive mechanism that ships in the wild is an adaptive bulkhead (adaptive concurrency limit), not an adaptive error-rate breaker, and in the Ruby and JVM worlds bulkheads are still a manual-tuning problem.

## PR breakdown

Dependency-ordered, smallest shippable slice first, scaffolding before the behavior that consumes it, each targeting roughly 400 changed lines or fewer.

1. **Repo scaffold and README.** `autonomous-actions/` with `index.html` stub, empty module files, `package.json` (only a `test` script pointing at `node --test`), and a README that states what the app teaches and how to serve it. No behavior. Ships green with a placeholder passing test.
2. **Engine core: pool, tokens, clock, RNG.** `engine.js` with the injected clock, seeded RNG, worker pool acquire/release, and the request lifecycle through success. Unit tests for acquire/release, exhaustion-queues, `min(latency, timeout)` hold, and determinism. No breaker, no bulkhead yet.
3. **Faults and timeouts.** Add clipped (fast error) and slow (inflated latency) faults, plus the slow-success versus timeout-error distinction. Tests for each outcome and for the worker-release tick under a timeout.
4. **Circuit breaker.** Add the breaker state machine and error-window accounting (errors and timeouts count). Tests for closed-to-open, cooldown-to-half-open-to-closed, and window expiry.
5. **Bulkhead.** Add per-dependency pools, instant reject on exhaustion, isolation from other dependencies, and rejection counting toward the breaker. Tests for isolation and for reject-trips-breaker.
6. **Little's Law readout and adaptive controller.** Add `required = rate * hold` computation and the gradient/AIMD adaptive pool. Tests for the readout value, the exhaustion prediction, and the controller's shrink/grow/bounds behavior.
7. **Rendering: static topology and pools.** `render.js` draws the topology, the worker-slot grid colored by dependency, and the metrics strip from engine state. Smoke check plus manual verification.
8. **Rendering: tokens, queue, breaker indicators.** Animate tokens along edges, show queue depth, draw breaker state per edge. Manual verification against the engine.
9. **Controls and free-play.** `controls.js` wires all sliders to the engine live. Ships free-play as the baseline interaction before the guided tour is layered on.
10. **Scenarios and the guided tour.** `scenarios.js` plus act navigation: the six acts, presets, live-control masks, captions, the two Act 3 timeout presets, and the Act 5 readout toggle and free-play unlock. This is the wire-it-together PR that turns the parts into the lesson.
11. **Deploy to GitHub Pages.** Pages workflow or branch config, plus a README link to the live URL.

