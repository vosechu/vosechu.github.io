# Cat-café UI redesign implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the page so it reads at a glance and wears a swappable cat-café skin: copy in one `strings.js`, color in CSS variables, a fixed status bar, a diagram that grows one station per act, click-to-inspect controls, per-station latency sparklines, and a guided tour. The engine does not change.

**Architecture:** Pure logic goes in small testable modules (`theme.js` lookups, an availability function, an act-to-roster function, a tour state-machine reducer, a sparkline path function); DOM code is a thin adapter over them. That keeps every slice's new logic unit-testable under `node:test` with no DOM harness. Presentation-only changes are verified by reading and by the manual check at the end.

**Tech stack:** Vanilla ES modules, `node:test` + `node:assert/strict`, buildless. Run tests with `npm test` from `autonomous-actions/`.

## Global Constraints

- The engine's simulation behavior does not change: deterministic, no `Date.now`/`Math.random`/DOM. `getState` may gain additive, read-only fields (with tests); nothing that alters the simulation.
- No em dashes in any committed text or copy.
- All user-facing copy comes from `src/strings.js` by key; no hardcoded display strings in components. Keys are stable; only values change.
- All color comes from CSS custom properties plus the `COLORS` map in `theme.js`; no hardcoded hex in components.
- Internal target ids stay `'Database A'`, `'Service B'`, `'Service C'`, `'External'` (tests and the engine reference them).
- New logic ships with unit tests in the same slice. Pure functions are the unit under test; DOM glue stays thin.
- Every pairing of text/UI color meets APCA readability; verify at build, do not hardcode a guessed Lc.
- Each slice is its own commit and small (aim well under 400 changed lines).

## File structure

- `src/strings.js` — all copy (exists). Values only change; keys are stable.
- `src/theme.js` — NEW. Pure lookups over `STRINGS` and the `COLORS` map: `labelOf`, `shortOf`, `hoverOf`, `colorOf`, `act(i)`. Unit tested.
- `src/metrics.js` — NEW. Pure `availabilityPercent(rates)`. Unit tested.
- `src/topology.js` — NEW. Pure `rosterForAct(actIndex)` returning the visible target-id set. Unit tested.
- `src/tour.js` — NEW. Pure tour reducer (state + actions) and step definitions; DOM rendering is a thin consumer. Reducer unit tested.
- `src/sparkline.js` — NEW. Pure `sparklinePath(series, width, height, ceilingMs)` returning SVG path data. Unit tested.
- `src/config.js` — target factory loses `label`/`abbrev`/`note`; keeps mechanical fields.
- `src/scenarios.js` — `ACTS` keeps structural fields (`readoutVisible`, reveal roster); `actMeta` pulls title/instruction/caption from `STRINGS`.
- `src/controls.js`, `src/render.js`, `index.html` — consume the seams; house the bar, panel, sparkline, tour, and cleanup.

---

### Task 1: Copy and color seams

Introduce `theme.js`, route every label/color/act-text read through the seams, and drop the display fields from the target factory. No visible change (keep current colors as the initial variable values).

**Files:**
- Create: `src/theme.js`, `test/theme.test.js`
- Modify: `src/config.js` (target factory), `src/scenarios.js` (`actMeta`), `src/controls.js` (`labelOf`), `src/render.js` (color/label/abbrev reads), `index.html` (add station color variables)

**Interfaces:**
- Produces: `labelOf(id)`, `shortOf(id)`, `hoverOf(id)`, `colorOf(id)`, `act(i)` from `theme.js`; the `COLORS` map id to CSS variable.
- Consumes: `STRINGS` from `strings.js`.

- [ ] **Step 1: Write the failing test** — `test/theme.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { labelOf, shortOf, hoverOf, colorOf, act } from '../src/theme.js';
import { STRINGS } from '../src/strings.js';

test('theme lookups read station copy from STRINGS by id', () => {
  for (const id of ['Database A', 'Service B', 'Service C', 'External']) {
    assert.equal(labelOf(id), STRINGS.stations[id].label);
    assert.equal(shortOf(id), STRINGS.stations[id].short);
    assert.equal(hoverOf(id), STRINGS.stations[id].hover);
  }
});

test('every station id maps to a color variable', () => {
  for (const id of ['Database A', 'Service B', 'Service C', 'External']) {
    assert.match(colorOf(id), /^var\(--/);
  }
});

test('act() returns the STRINGS act entry by index', () => {
  assert.equal(act(3).title, STRINGS.acts[3].title);
  assert.equal(act(3).instruction, STRINGS.acts[3].instruction);
  assert.equal(act(3).caption, STRINGS.acts[3].caption);
});

test('unknown id falls back to the id itself, not a crash', () => {
  assert.equal(labelOf('Nope'), 'Nope');
});
```

- [ ] **Step 2: Run it, verify it fails** — `npm test` fails with `theme.js` not found.

- [ ] **Step 3: Create `src/theme.js`**

```js
import { STRINGS } from './strings.js';

// The one place that maps a target id to its color variable (defined in index.html).
export const COLORS = {
  'Database A': 'var(--station-core)',
  'Service B':  'var(--station-slow)',
  'Service C':  'var(--station-hang)',
  'External':   'var(--station-3p)',
};

export const labelOf = (id) => STRINGS.stations[id]?.label ?? id;
export const shortOf = (id) => STRINGS.stations[id]?.short ?? id;
export const hoverOf = (id) => STRINGS.stations[id]?.hover ?? '';
export const colorOf = (id) => COLORS[id] ?? 'var(--ink)';
export const act = (i) => STRINGS.acts[i];
```

- [ ] **Step 4: Add the station color variables to `index.html`**

In the existing `:root` block, add four variables set to the CURRENT hex values so the look does not change yet:

```css
    --station-core: #5aa2ff;   /* was Database A */
    --station-slow: #2fd6b8;   /* was Service B */
    --station-hang: #ff5a72;   /* was Service C */
    --station-3p:   #ffb64d;   /* was External */
```

- [ ] **Step 5: Drop display fields from the target factory** — `src/config.js`

Change the factory signature and body to keep only mechanical fields:

```js
  const target = (latencyMs) => ({
    latencyMs, errorRate: 0, capacity: DEFAULT_CAPACITY,
    breaker: null, bulkheadSize: 24, adaptive: null, timeoutMs: 30000,
  });
```

and the target entries to just their latency (ids are the keys):

```js
      'Database A': target(30),
      'Service B': target(50),
      'Service C': target(50),
      'External': target(120),
```

- [ ] **Step 6: Route the consumers through the seams**

- `src/controls.js` line 15: replace `const labelOf = (name) => sim.config.targets[name].label || name;` with an import from `theme.js` (`import { labelOf, colorOf, hoverOf, shortOf } from './theme.js';`) and delete the local definition.
- `src/render.js` line 34: replace the reads of `t.color`, `t.abbrev`, `t.label`, `t.note` with `colorOf(name)`, `shortOf(name)`, `labelOf(name)` (import them from `theme.js`); drop `notes` entirely (the "Slow, higher timeout" notes are gone in the redesign).
- `src/scenarios.js`: import `STRINGS` and rewrite `actMeta` to `return { ...STRINGS.acts[index], readoutVisible: ACTS[index].readoutVisible };`. Strip the inline `title`/`instruction`/`caption` from each `ACTS` entry, leaving `{ readoutVisible }` (and whatever structural fields exist).

- [ ] **Step 7: Run the whole suite** — `npm test`

Expected: all pass, including `theme.test.js`. Existing engine/scenarios tests must stay green (they reference ids, not labels). If a test that reads `.label`/`.note` off a target breaks, it was relying on a removed field; update that read to `labelOf(id)` (do not touch AI-DEV assertions on engine behavior).

- [ ] **Step 8: Syntax-check the DOM modules and commit**

```
node --check src/theme.js && node --check src/controls.js && node --check src/render.js && node --check src/scenarios.js
```

```bash
git add src/strings.js src/theme.js test/theme.test.js src/config.js src/scenarios.js src/controls.js src/render.js index.html
git commit -m "refactor(sim): copy and color seams (strings.js + theme.js), drop display fields from config"
```

---

### Task 2: Sunny palette

Set the cream/candy palette and verify contrast. Color only; copy already lives in `strings.js`.

**Files:**
- Modify: `index.html` (the `:root` variables and any hardcoded background/text colors)

**Interfaces:** none; changes variable values the seams already consume.

- [ ] **Step 1: Set the palette variables** in `index.html` `:root`: `--paper` (warm cream), `--ink` (near-black), `--happy` (green), `--grumpy` (red), and the four station colors to candy blueberry/mint/tomato/marmalade. Update `--ink-dim` and any panel/background colors to sit on paper.

- [ ] **Step 2: APCA verification.** For each text-on-background and thin-line pairing, compute the APCA Lc and confirm it meets the readability level for that text size (verify the exact thresholds against the APCA criteria; do not hardcode a guessed number). Adjust any failing color until it passes. Record the pairings checked in the commit body.

- [ ] **Step 3: Manual check.** Serve (`npx serve`) and confirm the page is legible and the four stations are distinguishable.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(sim): sunny cafe palette, APCA-verified"
```

---

### Task 3: Fixed bottom status bar

Add the RPM-style bar with a windowed availability metric, and remove the progressively-revealed chips.

**Files:**
- Create: `src/metrics.js`, `test/metrics.test.js`
- Modify: `index.html` (bar markup + styles; remove chip markup), `src/controls.js` (populate the bar each frame; remove `revealMetrics`)

**Interfaces:**
- Produces: `availabilityPercent(rates)` from `metrics.js`.
- Consumes: `getState().rates` (`successPerSec`, `degradedPerSec`, `clientErrorsPerSec`), `getState().latency.p95`, `getState().queue.depth`, `getState().rates.rejectPerSec`; `STRINGS.bar` for labels/hovers.

- [ ] **Step 1: Write the failing test** — `test/metrics.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availabilityPercent } from '../src/metrics.js';

test('all served requests succeed', () => {
  assert.equal(availabilityPercent({ successPerSec: 10, degradedPerSec: 0, clientErrorsPerSec: 0 }), 100);
});
test('degraded counts as available', () => {
  assert.equal(availabilityPercent({ successPerSec: 5, degradedPerSec: 5, clientErrorsPerSec: 0 }), 100);
});
test('all client errors is zero availability', () => {
  assert.equal(availabilityPercent({ successPerSec: 0, degradedPerSec: 0, clientErrorsPerSec: 10 }), 0);
});
test('nine of ten served is ninety percent', () => {
  assert.equal(availabilityPercent({ successPerSec: 9, degradedPerSec: 0, clientErrorsPerSec: 1 }), 90);
});
test('no traffic reads 100, never NaN', () => {
  assert.equal(availabilityPercent({ successPerSec: 0, degradedPerSec: 0, clientErrorsPerSec: 0 }), 100);
});
```

- [ ] **Step 2: Run it, verify it fails** — `metrics.js` not found.

- [ ] **Step 3: Create `src/metrics.js`**

```js
// Windowed availability: served requests over all resolved requests. Degraded
// requests were served (missing one dependency) and count as available.
// clientErrorsPerSec already includes starved requests. Rejects are leg-level
// and must not appear here. No traffic reads 100, never NaN.
export function availabilityPercent(rates) {
  const served = rates.successPerSec + rates.degradedPerSec;
  const total = served + rates.clientErrorsPerSec;
  return total === 0 ? 100 : (served / total) * 100;
}
```

- [ ] **Step 4: Run the suite, verify green** — `npm test` passes including `metrics.test.js`.

- [ ] **Step 5: Add the bar markup and styles** to `index.html`: a fixed, full-width bottom bar with fixed slots in this order, reading labels/hovers from `STRINGS.bar`: Happy cats (availability), Wait (p95), then Cats/s, Grumpy cats/s, Waiting for a seat, Turned away/s. Availability and Wait are the largest and each carries a pass/fail state (availability >= 99, p95 < 5000). Each slot shows the `STRINGS.bar.<key>.hover` as a title/ⓘ. Remove the chip markup (`chip-ok`, `chip-err`, `chip-p95`, `chip-deg`, `chip-q`, `chip-rej`).

- [ ] **Step 6: Populate the bar each frame** in `src/controls.js`: in `frame()`, read `state.rates`, `state.latency.p95`, `state.queue.depth`; compute `availabilityPercent(state.rates)`; write each slot's value and its pass/fail class. Delete `revealMetrics` and its calls (the bar shows every metric always, zeros when not in play).

- [ ] **Step 7: Run the suite and manual-check** — `npm test` green; serve and confirm the bar reads sensibly (0s at rest, availability drops when the Mouse Supplier fails).

- [ ] **Step 8: Commit**

```bash
git add src/metrics.js test/metrics.test.js index.html src/controls.js
git commit -m "feat(sim): fixed bottom status bar with windowed availability; remove chips"
```

---

### Task 4: Progressive topology and Act 0

Reveal one station per act and open calm. The roster is a pure function of the act; the controls layer applies it to `config.targets`.

**Files:**
- Create: `src/topology.js`, `test/topology.test.js`
- Modify: `src/controls.js` (apply the roster on act change; start at rate 0 on first load), `src/scenarios.js` (any per-act structural field the reveal needs)

**Interfaces:**
- Produces: `rosterForAct(actIndex)` returning the array of visible target ids at that act (cumulative).
- Consumes: `defaultConfig()` for the full set of target definitions to filter.

- [ ] **Step 1: Write the failing test** — `test/topology.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rosterForAct } from '../src/topology.js';

test('act 0 shows only the core datastore', () => {
  assert.deepEqual(rosterForAct(0), ['Database A']);
});
test('act 1 adds the third party', () => {
  const r = rosterForAct(1);
  assert.ok(r.includes('Database A') && r.includes('External'));
  assert.equal(r.length, 2);
});
test('act 3 adds the hanging service', () => {
  const r = rosterForAct(3);
  assert.ok(r.includes('Service C'));
  assert.equal(r.length, 3);
});
test('act 4 through 7 show all four', () => {
  for (const i of [4, 5, 6, 7]) assert.equal(rosterForAct(i).length, 4);
});
test('rosters are cumulative: each act is a superset of the previous', () => {
  for (let i = 1; i <= 7; i++) {
    const prev = new Set(rosterForAct(i - 1));
    for (const id of prev) assert.ok(rosterForAct(i).includes(id));
  }
});
```

- [ ] **Step 2: Run it, verify it fails** — `topology.js` not found.

- [ ] **Step 3: Create `src/topology.js`**

```js
// Which stations are visible at each act, cumulative. An incident act reveals
// the station it is about; a protection act reveals nothing new. Ids match the
// engine's stable target keys.
const CORE = 'Database A', THIRD_PARTY = 'External', HANG = 'Service C', SLOW = 'Service B';
const REVEAL_AT = { 0: CORE, 1: THIRD_PARTY, 3: HANG, 4: SLOW };

export function rosterForAct(actIndex) {
  const roster = [];
  for (let i = 0; i <= actIndex; i++) if (REVEAL_AT[i]) roster.push(REVEAL_AT[i]);
  return roster;
}
```

- [ ] **Step 4: Run the suite, verify green** — `npm test` passes including `topology.test.js`.

- [ ] **Step 5: Apply the roster on act change** in `src/controls.js`: when the act changes (the existing act-navigation path that calls `actMeta` and rebuilds controls), set `sim.config.targets` to the subset of a full default set whose ids are in `rosterForAct(actIndex)`, preserving id order. Keep a full default target set (from `defaultConfig()`) so forward navigation restores removed stations. `resetToDefaults` resets to the current act's roster, not all four. The engine needs no change (it iterates `config.targets`).

- [ ] **Step 6: Open calm** in `src/controls.js`: on first load, set the request rate and its slider to 0 so the initial screen (act 0) is calm. Do not force the rate on later act changes; the player drives it.

- [ ] **Step 7: Run the suite and manual-check** — `npm test` green; serve and confirm act 0 shows only the Kibble Bin at rate 0, and each act reveals one more station.

- [ ] **Step 8: Commit**

```bash
git add src/topology.js test/topology.test.js src/controls.js src/scenarios.js
git commit -m "feat(sim): progressive topology (one station per act) and a calm act 0"
```

---

### Task 5: Click a station to inspect it

Split the panel into an always-present System block and a station block that follows the selected node.

**Files:**
- Modify: `src/topology.js` (add `defaultStationForAct`), `test/topology.test.js` (test it), `src/controls.js` (selection state + panel split + node click), `src/render.js` (node click target + selected highlight)

**Interfaces:**
- Produces: `defaultStationForAct(actIndex)` returning the last-revealed id for that act.
- Consumes: `rosterForAct`, `labelOf`, the diagram nodes.

- [ ] **Step 1: Add the failing test** to `test/topology.test.js`

```js
import { defaultStationForAct } from '../src/topology.js';
test('the default selected station is the newest one the act revealed', () => {
  assert.equal(defaultStationForAct(0), 'Database A');
  assert.equal(defaultStationForAct(1), 'External');
  assert.equal(defaultStationForAct(3), 'Service C');
  assert.equal(defaultStationForAct(4), 'Service B');
  assert.equal(defaultStationForAct(7), 'Service B');
});
```

- [ ] **Step 2: Run it, verify it fails** — `defaultStationForAct` not exported.

- [ ] **Step 3: Add `defaultStationForAct`** to `src/topology.js`

```js
// The newest station on stage for this act (the one the act is about), used as
// the default panel selection. Acts that reveal nothing inherit the prior newest.
const NEWEST = { 0: 'Database A', 1: 'External', 3: 'Service C', 4: 'Service B' };
export function defaultStationForAct(actIndex) {
  let newest = 'Database A';
  for (let i = 0; i <= actIndex; i++) if (NEWEST[i]) newest = NEWEST[i];
  return newest;
}
```

- [ ] **Step 4: Run the suite, verify green.**

- [ ] **Step 5: Split the panel** in `src/controls.js`: build a persistent System block (the global toggles unlocked so far) and a single station block for the selected station (its latency, outgoing timeout, error rate, capacity, pool size, breaker). Track `selectedStation`; on act change set it to `defaultStationForAct(actIndex)`. Free play may still list all stations (as today).

- [ ] **Step 6: Wire node clicks** in `src/render.js` and `src/controls.js`: clicking a station node sets `selectedStation` and rebuilds the station block; the selected node gets a highlight (a ring or raised border). Only revealed stations are clickable.

- [ ] **Step 7: Run the suite and manual-check** — `npm test` green; serve and confirm clicking a station swaps the panel and highlights the node.

- [ ] **Step 8: Commit**

```bash
git add src/topology.js test/topology.test.js src/controls.js src/render.js
git commit -m "feat(sim): click a station to load its controls; System block always on"
```

---

### Task 6: Per-station latency sparkline and timeout clip

Add a small latency trend per station and show timeouts as the line clipping at the timeout ceiling. Remove the stopwatch icons.

**Files:**
- Create: `src/sparkline.js`, `test/sparkline.test.js`
- Modify: `src/engine.js` (additive `latencyP95` per target in `getState`), `test/engine.test.js` (test the field), `src/render.js` (rolling series + draw path; remove stopwatch)

**Interfaces:**
- Produces: `sparklinePath(series, width, height, ceilingMs)` returning an SVG path `d` string; `getState().targets[name].latencyP95`.
- Consumes: per-target completed latency (`recentByTarget`).

- [ ] **Step 1: Write the failing tests**

`test/sparkline.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sparklinePath } from '../src/sparkline.js';

test('empty series yields an empty path', () => {
  assert.equal(sparklinePath([], 100, 20, 1000), '');
});
test('a flat series draws a flat line within the box', () => {
  const d = sparklinePath([50, 50, 50], 100, 20, 1000);
  assert.match(d, /^M /);                 // starts with a moveto
  assert.ok(!/-\d/.test(d));              // no negative coordinates: stays in the box
});
test('values at or above the ceiling clip to the top of the box (y = 0)', () => {
  const d = sparklinePath([2000], 100, 20, 1000);   // 2000 > ceiling 1000
  assert.match(d, /(^| )\S+,0(\s|$)/);     // a point clamped to y = 0 (the ceiling)
});
```

Add to `test/engine.test.js`:
```js
test('getState exposes per-target completed p95 latency', () => {
  // AI-DEV: AI **MUST NOT** touch this test. If it fails, fix the engine, not the test.
  const cfg = defaultConfig();
  cfg.requestRatePerSec = 40;
  const sim = new Sim({ clock: { now: () => 0 }, rng: makeRng(111), config: cfg });
  sim.tick(0);
  run(sim, 50, 3000, 50);
  const s = sim.getState();
  for (const name of Object.keys(cfg.targets)) {
    assert.equal(typeof s.targets[name].latencyP95, 'number');
    assert.ok(s.targets[name].latencyP95 >= 0);
  }
});
```

- [ ] **Step 2: Run them, verify they fail** — `sparkline.js` missing; `latencyP95` undefined.

- [ ] **Step 3: Create `src/sparkline.js`**

```js
// Map a latency series to an SVG polyline path, newest last, scaled so the
// timeout ceiling is the top of the box. Values at or above the ceiling clip to
// the top (y = 0), so a hang reads as the line hitting the cap.
export function sparklinePath(series, width, height, ceilingMs) {
  if (!series || series.length === 0) return '';
  const n = series.length;
  const dx = n === 1 ? 0 : width / (n - 1);
  const pts = series.map((v, i) => {
    const clamped = Math.min(v, ceilingMs);
    const y = height - (clamped / ceilingMs) * height;   // ceiling -> y=0 (top)
    const x = i * dx;
    return `${x.toFixed(1)},${Math.max(0, y).toFixed(1)}`;
  });
  return `M ${pts.join(' L ')}`;
}
```

- [ ] **Step 4: Add the additive `getState` field** in `src/engine.js`: inside the per-target loop that builds `targets[name]`, add `latencyP95: this._percentileOf(this.recentByTarget[name], 95)`. This is read-only and does not affect the simulation.

- [ ] **Step 5: Run the suite, verify green.**

- [ ] **Step 6: Draw the sparkline** in `src/render.js`: keep a per-station rolling series (append `state.targets[name].latencyP95` each frame, cap the length); draw the path with `sparklinePath` using the station color and the station's `outgoingTimeoutMs` as the ceiling. Remove the stopwatch `g`/label elements and their update code.

- [ ] **Step 7: Run the suite and manual-check** — `npm test` green; serve, make the Napping Cat hang, and confirm its line rises and clips at the ceiling.

- [ ] **Step 8: Commit**

```bash
git add src/sparkline.js test/sparkline.test.js src/engine.js test/engine.test.js src/render.js
git commit -m "feat(sim): per-station latency sparkline; timeouts clip at the ceiling; remove stopwatch icons"
```

---

### Task 7: Guided tour

A four-step first-run tour with a pure reducer.

**Files:**
- Create: `src/tour.js`, `test/tour.test.js`
- Modify: `src/controls.js` (persistence, bubbles, buttons, the Tour button), `index.html` (tour dialog/bubble markup + styles)

**Interfaces:**
- Produces: `TOUR_STEPS`, `initialTourState(seen)`, `tourReducer(state, action)`.
- Consumes: `STRINGS.tour`; `localStorage` key `aa_tour_seen`.

- [ ] **Step 1: Write the failing test** — `test/tour.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_STEPS, initialTourState, tourReducer } from '../src/tour.js';

test('first visit auto-opens at step 0', () => {
  assert.deepEqual(initialTourState(false), { open: true, step: 0, seen: false });
});
test('a seen tour does not auto-open', () => {
  assert.equal(initialTourState(true).open, false);
});
test('next advances until the last step', () => {
  let s = initialTourState(false);
  for (let i = 1; i < TOUR_STEPS; i++) s = tourReducer(s, { type: 'next' });
  assert.equal(s.step, TOUR_STEPS - 1);
  assert.equal(s.open, true);
});
test('next on the last step closes and marks seen', () => {
  let s = { open: true, step: TOUR_STEPS - 1, seen: false };
  s = tourReducer(s, { type: 'next' });
  assert.equal(s.open, false);
  assert.equal(s.seen, true);
});
test('skip from any step closes and marks seen', () => {
  const s = tourReducer({ open: true, step: 1, seen: false }, { type: 'skip' });
  assert.equal(s.open, false);
  assert.equal(s.seen, true);
});
test('re-run opens at step 0 and does not clear seen', () => {
  const s = tourReducer({ open: false, step: 2, seen: true }, { type: 'open' });
  assert.deepEqual(s, { open: true, step: 0, seen: true });
});
test('step never leaves [0, TOUR_STEPS-1]', () => {
  let s = { open: true, step: TOUR_STEPS - 1, seen: false };
  s = tourReducer(s, { type: 'next' });   // closes; step must not exceed bound
  assert.ok(s.step <= TOUR_STEPS - 1 && s.step >= 0);
});
```

- [ ] **Step 2: Run it, verify it fails** — `tour.js` not found.

- [ ] **Step 3: Create `src/tour.js`**

```js
export const TOUR_STEPS = 4;   // welcome + bar + station + panel

export function initialTourState(seen) {
  return { open: !seen, step: 0, seen };
}

export function tourReducer(state, action) {
  switch (action.type) {
    case 'open':                                   // re-run: does not clear seen
      return { open: true, step: 0, seen: state.seen };
    case 'next':
      if (state.step >= TOUR_STEPS - 1) return { open: false, step: state.step, seen: true };
      return { open: true, step: state.step + 1, seen: state.seen };
    case 'skip':
      return { open: false, step: state.step, seen: true };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run the suite, verify green.**

- [ ] **Step 5: Wire the tour** in `src/controls.js` and `index.html`: read/write `localStorage['aa_tour_seen']`; initialize with `initialTourState(seen)`; on any state change with `seen` true, persist it. Render the welcome dialog (step 0) and the three bubbles (steps 1-3) from `STRINGS.tour`, positioned at the bar, a station, and the panel. Buttons Skip/Back/Next/Done from `STRINGS.tour.buttons`; the counter from `STRINGS.tour.step` with `{n}`/`{m}` filled. Place a Tour button (`STRINGS.tour.buttons.rerun`) between prev/next that dispatches `open`. The tour overlays; the sim keeps running.

- [ ] **Step 6: Run the suite and manual-check** — `npm test` green; serve in a fresh profile (or clear the key) and confirm the tour auto-opens once, Skip/Done both stop it re-opening, and the Tour button re-runs it.

- [ ] **Step 7: Commit**

```bash
git add src/tour.js test/tour.test.js src/controls.js index.html
git commit -m "feat(sim): first-run guided tour (reducer + bubbles, skip, page numbers, re-run)"
```

---

### Task 8: Cleanup and contrast pass

**Files:**
- Modify: `src/controls.js` (remove Little's Law), `index.html` (remove Little's Law styles + any title/subtitle; ribbon breakpoint), `src/render.js` (station ⓘ hovers)

**Interfaces:** none.

- [ ] **Step 1: Remove Little's Law** — delete `littleSection`/`updateLittle` and their calls in `src/controls.js`, and the `.little-law`/`#little-body` styles and markup in `index.html`.
- [ ] **Step 2: Remove any leftover title/subtitle** markup and styles from `index.html`.
- [ ] **Step 3: ⓘ hovers** — set a `title` (or an ⓘ affordance) on each station node from `hoverOf(id)`, and confirm each bar slot already carries its `STRINGS.bar.<key>.hover`.
- [ ] **Step 4: Ribbon breakpoint** — add a media query hiding `.forkribbon` below a chosen width.
- [ ] **Step 5: Final APCA pass** — re-verify every text/UI pairing across the finished page against APCA; fix any regressions. Record the pairings in the commit body.
- [ ] **Step 6: Run the suite and manual-check** — `npm test` green; serve and read the whole page cold.
- [ ] **Step 7: Commit**

```bash
git add src/controls.js src/render.js index.html
git commit -m "chore(sim): remove Little's Law, add hovers, ribbon breakpoint, final contrast pass"
```

---

## Self-Review

- **Spec coverage:** theme/color seams (Task 1) + palette (2); bottom bar + availability (3); progressive topology + Act 0 (4); click-to-inspect panel (5); sparkline + timeout clip, stopwatch removal (6); tour (7); Little's Law removal, hovers, ribbon breakpoint, title removal, APCA (8). Every spec section maps to a task.
- **Type consistency:** target ids are stable across all slices; `STRINGS` keys match `theme.js`/`scenarios.js` reads; `rosterForAct`/`defaultStationForAct` share id spelling; the tour state shape `{open, step, seen}` is identical in reducer, tests, and the DOM consumer; `sparklinePath` signature and `latencyP95` field match between producer and consumer.
- **Testable-logic isolation:** each new logic module (`theme`, `metrics`, `topology`, `sparkline`, `tour`) is pure and unit-tested; DOM glue stays thin and is verified by reading plus the manual check. `getState` gains only an additive tested field.
- **No placeholders:** every logic step carries real code and real test code; presentation steps name the exact file, element, and change, and instruct the implementer to read the current region first.

## Manual verification (after Task 8)

Serve (`npx serve`) and click through act 0 to free play: the café starts calm with one station, each act reveals one more, the bar reads sensibly, clicking a station swaps the panel, latency lines clip on a hang, the tour runs once and re-runs on demand, and the page passes a cold read.

## Execution handoff

One feature branch (`ui-redesign-cat-cafe`, stacked on the adaptive PR). Eight commits, dependency-ordered. Recommended: subagent-driven-development, a fresh implementer per task with a task review after each, then a whole-branch review, then finishing-a-development-branch to open the PR.
