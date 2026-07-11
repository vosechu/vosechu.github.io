# Diagram DOM Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the system diagram from a fixed-viewBox SVG into DOM boxes (rem-sized, self-contained) with an SVG arrow overlay measured from the laid-out DOM.

**Architecture:** Boxes become real HTML/CSS in three columns (Client, Our service, Dependencies). Arrows live in one absolutely-positioned `<svg>` overlay whose endpoints are computed by a pure `edges.js` module from `getBoundingClientRect()` measurements. Per-frame `render()` updates only inner state and never reflows; `layoutEdges()` recomputes arrows on build, resize, and act change.

**Tech Stack:** Buildless vanilla ES modules, `node:test` + `assert/strict`, plain DOM/CSS. No build step, no new dependencies.

**Design spec:** `docs/superpowers/specs/2026-07-11-diagram-dom-restructure-design.md`

## Global Constraints

- Buildless: no build step, no new dependencies, no framework. Plain ES modules loaded by `index.html`.
- Tests run with `npm test` from `autonomous-actions/`. Use `node:test` + `node:assert/strict`.
- The engine is deterministic and untouched: no `Date.now`, `Math.random`, or DOM in `engine.js`.
- Copy contains no em dashes. The only non-ASCII allowed is the existing `∞`.
- Engine target ids are stable keys: `'Database A'`, `'Service B'`, `'Service C'`, `'External'`. `render` keys off these ids; only display values (in `strings.js`) change. Do not rename ids.
- All diagram sizing is in rem. `.diagram` has a `min-width` floor; `.stagewrap` gets `overflow-x: auto`.
- Hot-path rule: per-frame `render()` never changes box outer size or triggers layout. `layoutEdges()` runs only on build, `ResizeObserver` fire, and act change.
- Do not modify any test containing an `// AI-DEV` marker. (None in scope, but the rule stands.)
- The 72 existing tests stay green: `engine`, `metrics`, `scenarios`, `telemetry`, `theme`, `topology`, `tour`.

## File Structure

- Create `src/edges.js`: pure arrow geometry: `toLocalRect`, `edgeEndpoints`. No DOM. Unit-tested.
- Create `test/edges.test.js`: tests for the two pure functions.
- Modify `src/render.js`: rewrite the diagram build + arrow layout to DOM + overlay; keep the status-bar build/update logic and the per-frame read/compute logic. Rename `initRender` -> `buildScene`.
- Modify `index.html`: `#stage` becomes a `<div>`; replace the SVG diagram CSS with rem box/grid/pill/arrow CSS plus the `min-width` + `overflow-x` floor. Keep the `.edge-flow` classes and `@keyframes flow`.
- Modify `src/controls.js`: update the `buildScene` import + call; add `handle.relayout()` on act change.

---

## PR1: Pure arrow geometry (`edges.js`)

### Task 1: `toLocalRect`

**Files:**
- Create: `src/edges.js`
- Test: `test/edges.test.js`

**Interfaces:**
- Produces: `toLocalRect(rect, containerRect) -> { left, top, width, height }`, where `rect` and `containerRect` are `{ left, top, width, height }` (viewport coords, as from `getBoundingClientRect()`). Returns `rect` translated into coordinates local to `containerRect`.

- [ ] **Step 1: Write the failing tests**

Create `test/edges.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toLocalRect } from '../src/edges.js';

test('toLocalRect subtracts the container origin and keeps size', () => {
  const rect = { left: 130, top: 96, width: 90, height: 60 };
  const container = { left: 30, top: 16, width: 1000, height: 500 };
  assert.deepEqual(toLocalRect(rect, container), { left: 100, top: 80, width: 90, height: 60 });
});

test('toLocalRect of the container itself sits at the origin', () => {
  const container = { left: 30, top: 16, width: 1000, height: 500 };
  assert.deepEqual(toLocalRect(container, container), { left: 0, top: 0, width: 1000, height: 500 });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL: cannot import `toLocalRect` from `../src/edges.js` (module/file does not exist).

- [ ] **Step 3: Write the minimal implementation**

Create `src/edges.js`:

```js
// edges.js
// Pure geometry for the diagram's arrow overlay. render.js measures DOM boxes
// with getBoundingClientRect (viewport coords), converts them into coordinates
// local to the .diagram container, then asks for each arrow's endpoints. No DOM
// here, so it is unit-tested with plain rect objects.

// Translate a viewport rect (getBoundingClientRect) into coordinates local to
// the container, so a line drawn in the container-sized SVG overlay lines up
// with the boxes. Size is unchanged; only the origin shifts.
export function toLocalRect(rect, containerRect) {
  return {
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top,
    width: rect.width,
    height: rect.height,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS (the two `toLocalRect` tests; the existing 72 stay green).

- [ ] **Step 5: Commit**

```bash
git add src/edges.js test/edges.test.js
git commit -m "feat(sim): add toLocalRect geometry helper for arrow overlay"
```

### Task 2: `edgeEndpoints`

**Files:**
- Modify: `src/edges.js`
- Test: `test/edges.test.js`

**Interfaces:**
- Produces: `edgeEndpoints(fromRect, toRect) -> { x1, y1, x2, y2 }`, both rects in local coords. `(x1,y1)` = right-center of `fromRect`; `(x2,y2)` = left-center of `toRect`.

- [ ] **Step 1: Write the failing tests**

Append to `test/edges.test.js`:

```js
import { edgeEndpoints } from '../src/edges.js';

test('edgeEndpoints leaves the source right-center and lands on the target left-center', () => {
  const from = { left: 0, top: 0, width: 100, height: 40 };   // right-center = (100, 20)
  const to = { left: 300, top: 100, width: 80, height: 60 };  // left-center  = (300, 130)
  assert.deepEqual(edgeEndpoints(from, to), { x1: 100, y1: 20, x2: 300, y2: 130 });
});

test('edgeEndpoints handles a target above the source (upward fan-out)', () => {
  const from = { left: 0, top: 200, width: 100, height: 40 };  // right-center = (100, 220)
  const to = { left: 300, top: 0, width: 80, height: 40 };     // left-center  = (300, 20)
  assert.deepEqual(edgeEndpoints(from, to), { x1: 100, y1: 220, x2: 300, y2: 20 });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL: `edgeEndpoints` is not exported from `../src/edges.js`.

- [ ] **Step 3: Write the minimal implementation**

Append to `src/edges.js`:

```js
// Endpoints for an arrow from the right-center of fromRect to the left-center of
// toRect, both already in local coords. Our service fans out to the dependencies
// on its right, so every edge leaves a right edge and lands on a left edge.
export function edgeEndpoints(fromRect, toRect) {
  return {
    x1: fromRect.left + fromRect.width,
    y1: fromRect.top + fromRect.height / 2,
    x2: toRect.left,
    y2: toRect.top + toRect.height / 2,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS (all four `edges` tests + the 72 existing).

- [ ] **Step 5: Commit**

```bash
git add src/edges.js test/edges.test.js
git commit -m "feat(sim): add edgeEndpoints geometry for arrow overlay"
```

---

## PR2: DOM + overlay diagram rewrite

PR2 is the atomic switch from SVG to DOM. Its tasks build on each other and each ends
in a manual verification by serving the app, because `render.js` is DOM glue (no unit
tests, by project convention). Keep the dev server running the whole time:

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory .
```

Open `http://127.0.0.1:8000/` and hard-reload after each change.

**Risk-reducer used throughout PR2:** the current `render()` already computes everything
correctly (per-dependency `failing`/`congested`, the `smi(...)` smoothing, the status-bar
values). Preserve that read/compute logic verbatim. The rewrite changes only the DOM
*write* targets: SVG rect attributes become CSS classes and inline styles on `<div>`s;
the edge classes (`edge-flow active/congested/danger`) move onto the overlay lines
unchanged.

### Task 3: DOM boxes + CSS (static scene)

**Files:**
- Modify: `index.html` (`#stage` element + diagram CSS)
- Modify: `src/render.js` (rewrite `initRender` -> `buildScene`, DOM build only)

**Interfaces:**
- Produces: `buildScene(root, config, onSelect) -> handle`. `handle` fields used by later tasks:
  - `handle.diagram`: the `.diagram` root element.
  - `handle.overlay`: the `<svg class="edges">` element.
  - `handle.service`: `{ workerCells: HTMLElement[], queueBar, timeoutPill, egress: { [name]: { row, poolCells: HTMLElement[], wall, breakerPill, timeoutPill } } }`.
  - `handle.deps`: `{ [name]: { box, label, workerCells: HTMLElement[], queueBar } }`.
  - `handle.bar`: the existing status-bar element map (unchanged from today).
  - `handle.edges`: `Array<{ line, flow, fromEl, toEl }>` (populated in Task 4; create the empty array here).
  - `handle.relayout`: set in Task 4.

- [ ] **Step 1: Convert `#stage` to a div in `index.html`**

Replace:

```html
<svg id="stage" viewBox="0 0 1200 508" role="img" aria-label="system topology"></svg>
```

with:

```html
<div id="stage" role="img" aria-label="system topology"></div>
```

- [ ] **Step 2: Replace the SVG diagram CSS with rem box/grid/pill/arrow CSS**

In `index.html`, remove the SVG-node CSS blocks (`.card`, `.slot`, `.slotx`, `.queuetrack`, `.queuebar`, `.nodelabel`, `.nodesub`, `.region`, `.glyph`, `.fire`, `.badge`, `.badgelabel`, `.outlabel`, `.queuename`, `svg#stage`). **Keep** the `.edge` / `.edge-flow` rules and `@keyframes flow`: they now style the overlay lines. Add:

```css
/* Diagram is now DOM boxes (rem-sized) plus one SVG arrow overlay. */
#stage.diagram { position: relative; min-width: 60rem; }   /* legibility floor; tune */
.stagewrap { overflow-x: auto; }
.diagram .edges {                       /* arrow overlay, behind the boxes */
  position: absolute; inset: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 0; overflow: visible;
}
.diagram .cols {
  position: relative; z-index: 1;       /* boxes paint over the arrows */
  display: flex; align-items: center; gap: 3rem; padding: 0.5rem;
}
.diagram .col-deps { display: flex; flex-direction: column; gap: 1rem; margin-left: auto; }
.box {
  background: var(--panel-solid); border: 1px solid var(--border);
  border-radius: 0.6rem; padding: 0.6rem 0.7rem; min-width: 9rem;
}
.box.dep { cursor: pointer; }
.box.dep.selected { box-shadow: 0 0 0 2px var(--teal); }
.box.dep.slow { border-color: var(--amber); }
.box.dep.faulted { border-color: var(--red); }
.box .label { font-size: 0.85rem; font-weight: 650; color: var(--ink); }
.box .sub { font-size: 0.7rem; color: var(--ink-dim); }
/* Worker / connection cells: a wrapping grid of small squares. */
.cells { display: flex; flex-wrap: wrap; gap: 0.15rem; margin-top: 0.35rem; }
.cell { width: 0.55rem; height: 0.55rem; border-radius: 0.12rem; background: var(--slot-idle, #d8cebc); }
.cell.busy { background: var(--teal); }
.cell.walled { background: transparent; outline: 1px solid var(--red); opacity: 0.5; }
/* Queue: a fixed-height track with a bottom-anchored fill. */
.queue { position: relative; width: 0.5rem; height: 3rem; border-radius: 0.25rem;
  background: var(--slot-idle, #d8cebc); }
.queue .fill { position: absolute; left: 0; right: 0; bottom: 0; height: 0;
  background: var(--amber); border-radius: 0.25rem; transition: height .2s ease; }
/* Pills: fixed min-width so a value change never reflows. */
.pill { display: inline-block; min-width: 3.2rem; text-align: center;
  font-size: 0.68rem; padding: 0.1rem 0.4rem; border-radius: 0.8rem;
  border: 1px solid var(--border); color: var(--ink-dim); }
.pill.breaker.closed { color: var(--teal); }
.pill.breaker.open   { color: var(--red); }
.pill.breaker.half_open { color: var(--amber); }
/* Egress rows inside Our service: one per dependency. */
.egress { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.35rem; }
.egress .tag { min-width: 4rem; font-size: 0.72rem; color: var(--ink-dim); }
/* Open-breaker edge: greyed, no flow. */
.edge-flow.blocked { stroke: var(--ink-dim); opacity: 0.3; animation: none; stroke-dasharray: 2 6; }
```

- [ ] **Step 3: Rewrite `initRender` -> `buildScene` in `src/render.js` (DOM build only)**

Replace the `initRender` function with `buildScene`. Add these DOM helpers near the top of `render.js` and remove the SVG `el(...)` helper's diagram usages (keep `el` only if the overlay build needs it in Task 4; the SVG overlay lines are created with `document.createElementNS`).

```js
const XHTML = 'http://www.w3.org/1999/xhtml';
const svgEl = (name, attrs = {}) => {
  const n = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};
const div = (cls, text) => {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  if (text != null) d.textContent = text;
  return d;
};
// A wrapping grid of `n` idle cells; returns the cell elements so render() can
// toggle `.busy`/`.walled` per frame without rebuilding.
function cells(parent, n) {
  const wrap = div('cells');
  const out = [];
  for (let i = 0; i < n; i++) { const c = div('cell'); wrap.appendChild(c); out.push(c); }
  parent.appendChild(wrap);
  return { wrap, cells: out };
}
// A fixed-height queue track with a bottom-anchored fill; returns the fill.
function queue(parent) {
  const track = div('queue'); const fill = div('fill'); track.appendChild(fill);
  parent.appendChild(track); return fill;
}
```

Build the scene (structure; fill each box per the widget spec below):

```js
export function buildScene(root, config, onSelect) {
  root.textContent = '';
  root.className = 'diagram';
  root.id = 'stage';
  const names = Object.keys(config.targets);

  const overlay = svgEl('svg', { class: 'edges' });   // behind the boxes
  root.appendChild(overlay);

  const cols = div('cols'); root.appendChild(cols);

  // Column 1: Client
  const clientCol = div('col col-client');
  const clientBox = div('box client');
  clientBox.appendChild(div('label', STRINGS.telemetry.client));
  clientBox.appendChild(div('sub', STRINGS.telemetry.clientGlyph));
  clientCol.appendChild(clientBox); cols.appendChild(clientCol);

  // Column 2: Our service (incoming queue • workers • front-door timeout • egress rows)
  const serviceCol = div('col col-service');
  const serviceBox = div('box service');
  serviceBox.appendChild(div('label', STRINGS.telemetry.service));
  const serviceSub = div('sub', '');                 // "workers X, connections Y/∞" per frame
  serviceBox.appendChild(serviceSub);
  const svcQueueRow = div('egress');                 // reuse the flex row for queue + workers
  const svcQueueFill = queue(svcQueueRow);
  const svcWorkers = cells(svcQueueRow, MAX_SLOTS);
  serviceBox.appendChild(svcQueueRow);
  const frontTimeout = div('pill');                  // front-door timeout; text set per frame
  serviceBox.appendChild(frontTimeout);
  const egress = {};
  for (const name of names) {
    const row = div('egress');
    row.appendChild(div('tag', shortOf(name)));
    const pool = cells(row, OUT_VIEW);
    const wall = div('pill', '');                    // bulkhead cap; text per frame
    const breakerPill = div('pill breaker');
    const outTimeout = div('pill');
    row.append(wall, breakerPill, outTimeout);
    serviceBox.appendChild(row);
    egress[name] = { row, poolCells: pool.cells, wall, breakerPill, timeoutPill: outTimeout };
  }
  serviceCol.appendChild(serviceBox); cols.appendChild(serviceCol);

  // Column 3: Dependencies (workers • queue), hidden per act
  const depsCol = div('col col-deps');
  const deps = {};
  for (const name of names) {
    const box = div('box dep'); box.dataset.name = name;
    box.style.borderColor = colorOf(name);
    const label = div('label', labelOf(name));
    box.appendChild(label);
    const drow = div('egress');
    const dqueue = queue(drow);
    const dworkers = cells(drow, CAP_SLOTS);
    box.appendChild(drow);
    if (onSelect) box.addEventListener('click', () => onSelect(name));
    box.title = hoverOf(name);
    depsCol.appendChild(box);
    deps[name] = { box, label, workerCells: dworkers.cells, queueBar: dqueue };
  }
  cols.appendChild(depsCol);

  // Status bar: keep the existing build logic verbatim (element map into `bar`).
  const bar = buildStatusBar();   // extract today's bar-building code into this helper

  const handle = {
    diagram: root, overlay, cols, bar, edges: [],
    service: {
      sub: serviceSub, queueBar: svcQueueFill, workerCells: svcWorkers.cells,
      frontTimeout, egress,
    },
    deps,
    relayout: () => {},   // replaced in Task 4
  };
  return handle;
}
```

Widget spec (what each box contains: build these with the helpers above):
- Client box: label + sub (`retries` glyph text).
- Our service box: label; sub line (workers/connections, set per frame); a worker-cell grid (`MAX_SLOTS`); a queue track; a front-door timeout pill; one egress row per dependency, each = tag (short name) + connection-pool cell grid (`OUT_VIEW`) + bulkhead-cap pill + breaker pill + outgoing-timeout pill.
- Each dependency box: label; a worker-cell grid (`CAP_SLOTS`) + a queue track.

- [ ] **Step 4: Verify the static scene renders and contains its parts**

Serve and reload. Confirm by eye:
- Three columns: Client, Our service, a vertical stack of four dependency boxes.
- Every dependency box visually holds its own label, worker cells, and queue track (nothing sits outside a box).
- Our service box holds the worker grid, queue, front-door pill, and four egress rows.
- No arrows yet (Task 4). No console errors.
- Narrow the window below 60rem: the stage scrolls horizontally and text stays the same size (does not shrink).

- [ ] **Step 5: Commit**

```bash
git add index.html src/render.js
git commit -m "feat(sim): build the diagram as DOM boxes (no arrows yet)"
```

### Task 4: Arrow overlay + `layoutEdges`

**Files:**
- Modify: `src/render.js` (add edges to `buildScene`, add `layoutEdges`, wire `ResizeObserver`)

**Interfaces:**
- Consumes: `edgeEndpoints`, `toLocalRect` from `./edges.js`; `handle` fields from Task 3.
- Produces: `handle.edges` populated; `handle.relayout()` recomputes all arrows.

- [ ] **Step 1: Import the geometry and create the edges in `buildScene`**

At the top of `render.js`:

```js
import { edgeEndpoints, toLocalRect } from './edges.js';
```

In `buildScene`, after the columns and `handle` exist, create one edge per call. Each edge is a base line plus a flow line (same `edge-flow` classes as today), appended to the overlay:

```js
function makeEdge(overlay, fromEl, toEl) {
  const line = svgEl('line', { class: 'edge' });
  const flow = svgEl('line', { class: 'edge-flow' });
  overlay.append(line, flow);
  return { line, flow, fromEl, toEl };
}
// client -> service, then service-egress-row -> each dependency
handle.edges.push(makeEdge(overlay, clientBox, serviceBox));
for (const name of names) handle.edges.push(makeEdge(overlay, egress[name].row, deps[name].box));
```

- [ ] **Step 2: Add `layoutEdges` and expose `relayout`**

```js
// Measure the boxes and lay the arrows onto them. Runs on build, ResizeObserver,
// and act change only. Never per frame (see the hot-path rule).
function layoutEdges(h) {
  const c = h.diagram.getBoundingClientRect();
  h.overlay.setAttribute('viewBox', `0 0 ${c.width} ${c.height}`);
  for (const e of h.edges) {
    const hidden = e.fromEl.offsetParent === null || e.toEl.offsetParent === null;
    e.line.style.display = hidden ? 'none' : '';
    e.flow.style.display = hidden ? 'none' : '';
    if (hidden) continue;
    const from = toLocalRect(e.fromEl.getBoundingClientRect(), c);
    const to = toLocalRect(e.toEl.getBoundingClientRect(), c);
    const { x1, y1, x2, y2 } = edgeEndpoints(from, to);
    for (const seg of [e.line, e.flow]) {
      seg.setAttribute('x1', x1); seg.setAttribute('y1', y1);
      seg.setAttribute('x2', x2); seg.setAttribute('y2', y2);
    }
  }
}
```

In `buildScene`, before `return handle`, wire the observer and set `relayout` (rAF-coalesced):

```js
let raf = null;
handle.relayout = () => {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = null; layoutEdges(handle); });
};
new ResizeObserver(handle.relayout).observe(root);
handle.relayout();   // initial draw
```

- [ ] **Step 3: Verify arrows connect and track**

Serve and reload. Confirm:
- One arrow Client -> Our service; one arrow from each egress row to its dependency box (four fan-out arrows).
- Endpoints touch the box edges (leave a right edge, land on a left edge).
- Resize the window: arrows follow the boxes with no stale positions.
- No console errors; no visible per-frame jitter.

- [ ] **Step 4: Commit**

```bash
git add src/render.js
git commit -m "feat(sim): draw arrows in an overlay measured from the DOM boxes"
```

### Task 5: Live per-frame `render()` (DOM writes)

**Files:**
- Modify: `src/render.js` (`render(state, handle, selected)` body)

**Interfaces:**
- Consumes: `handle` from Tasks 3-4; the same `state` shape today's `render` reads.
- Produces: `render(state, handle, selected)` updates inner state only; no reflow, no `layoutEdges` call.

- [ ] **Step 1: Keep the read/compute logic; swap the DOM writes**

Preserve today's per-frame computation verbatim (the `failing`/`congested` derivation, the `smi(...)` smoothing, the status-bar value updates). Replace only the write targets:

- Fill a cell grid: given a count `n` and cell array, set `.busy` on the first `n`, clear the rest. Helper:

```js
function fillCells(cellsArr, n, extraClass) {
  for (let i = 0; i < cellsArr.length; i++) {
    cellsArr[i].className = 'cell' + (i < n ? ' busy' : '') + (extraClass && i >= n ? ` ${extraClass}` : '');
  }
}
```

- Bulkhead wall: cells beyond the cap get `walled` instead of idle (pass the cap as the boundary).
- Queue fill: `fill.style.height = `${Math.min(depth, MAX) / MAX * 100}%``.
- Breaker pill: `pill.className = `pill breaker ${br.state}``; `pill.textContent = breakerLabel(br.state)`.
- Timeout / bulkhead-cap pills: `pill.textContent = fmtDur(ms)` / `String(cap)` (fixed `min-width` prevents reflow).
- Dependency box fault class: `box.className = 'box dep' + (failing ? ' faulted' : congested ? ' slow' : '') + (name === selected ? ' selected' : '')`.
- Edge flow class: set on the matching `handle.edges[k].flow`:

```js
let flowClass = 'edge-flow';
if (br && br.state === 'open') flowClass = 'edge-flow blocked';
else if (failing) flowClass = 'edge-flow danger';
else if (congested) flowClass = 'edge-flow congested';
else if (inflight > 0) flowClass = 'edge-flow active';
edgeFor(handle, name).flow.setAttribute('class', flowClass);
```

Add a small lookup so `render` can find an edge by target name (build a `Map` in `buildScene`, or match `e.toEl === deps[name].box`).

- Service sub line: `handle.service.sub.textContent = serviceSub(workers, connections)` (reuse `telemetry.js`).
- Status bar: keep the existing update block, writing into `handle.bar` exactly as today.

**Do not** call `layoutEdges` here.

- [ ] **Step 2: Verify live behavior**

Serve, reload, drag Request rate up. Confirm:
- Worker cells fill/empty with load; queue fill rises when workers saturate.
- The status bar values move exactly as before.
- Enable Breakers, force `External` to fail: its breaker pill reads `blocking`, and only its arrow greys/stops (the others keep flowing).
- Make `Search` hang and `Recommendations` slow: their arrows show the congested/danger styles; other arrows unaffected.
- Frames stay smooth (no stutter) at high rate with all dependencies active.

- [ ] **Step 3: Commit**

```bash
git add src/render.js
git commit -m "feat(sim): drive the DOM diagram from live sim state each frame"
```

### Task 6: `controls.js` wiring

**Files:**
- Modify: `src/controls.js`

**Interfaces:**
- Consumes: `buildScene`, `handle.relayout`.

- [ ] **Step 1: Update the import and build call**

```js
// was: import { initRender, render } from './render.js';
import { buildScene, render } from './render.js';
// was: const handle = initRender(document.getElementById('stage'), ...);
const handle = buildScene(document.getElementById('stage'), { targets: DEFAULT_TARGETS }, (name) => selectStation(name));
```

- [ ] **Step 2: Relayout arrows on act change**

In `showAct(i)`, after `buildControls(actIndex)` and after the render that reflects the new act's revealed rows, add:

```js
handle.relayout();   // rows revealed/hidden changed the layout; redraw arrows
```

Reveal/hide of a dependency box is done by toggling a `display:none` class on `handle.deps[name].box` (and its egress row `handle.service.egress[name].row`) for ids not in the current act's roster: mirror today's `deprow` hide. Do this in `render` (driven by which ids are present in `state.targets`) or in `showAct`; whichever today's code already uses for row visibility. `layoutEdges` already skips hidden endpoints (`offsetParent === null`).

- [ ] **Step 3: Verify acts and reveal/hide**

Serve, reload. Step through all 8 acts (Next/Back and the progress dots). Confirm:
- Act 1 shows only the core datastore box + its arrow; later acts reveal more boxes and their arrows appear.
- Hidden dependencies have no dangling arrows.
- Arrow count always equals the number of visible dependency boxes plus the client edge.
- Selecting a dependency highlights its box and shows its controls.

- [ ] **Step 4: Commit**

```bash
git add src/controls.js
git commit -m "feat(sim): relayout diagram arrows on act change; use buildScene"
```

### Task 7: Regression + acceptance sweep

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS, `tests 76 / pass 76 / fail 0` (72 existing + 4 new `edges` tests).

- [ ] **Step 2: `node --check` the rewritten modules**

Run: `node --check src/render.js && node --check src/edges.js && node --check src/controls.js`
Expected: no output (all parse).

- [ ] **Step 3: Manual acceptance sweep (serve at localhost:8000)**

Walk this checklist (derived from the design's invariants):
- Containment: every dependency box holds its own label, workers, and queue; nothing renders in the gutter between boxes. Holds at act 8 (all four visible) and under max load (queues deep).
- Legibility floor: narrow the window to its minimum; text never shrinks below its floor, the stage scrolls, and no box overlaps or clips.
- Arrow topology: exactly one Client->service arrow and one service->dep arrow per visible dependency; no dep->dep or dep->service arrows.
- State: open a breaker -> only that arrow greys; slow vs failing look different from each other and from healthy; the fire glyph still marks a failing dependency.
- Reveal/hide: stepping acts adds/removes boxes and their arrows together, with no dangling endpoints.
- Performance: at high request rate with oscillation on, frames stay smooth; the browser profiler shows no per-frame forced layout from the tick.

- [ ] **Step 4: Final commit (if any cleanup)**

```bash
git add -A
git commit -m "chore(sim): finalize DOM diagram restructure"
```

---

## Self-Review

**Spec coverage:** Problem/leak (Task 3 containment), legibility floor (Task 3 CSS + Task 7 sweep), DOM boxes + overlay (Tasks 3-4), concept->widget mapping (Task 3 widget spec + Task 5 writes), hot-path rule (Task 5 does no layout; Task 4 confines `layoutEdges`), pure `edges.js` + tests (Tasks 1-2), `render.js`/`index.html`/`controls.js` blast radius (Tasks 3-6), testing (Task 7). "Details to pin" from the spec: half-open breaker arrow (handled: `blocked` only on `open`; `half_open` keeps normal flow, pill reads `testing`), non-color cues (fire glyph + pill text + flow speed preserved in Task 5), rem floor value (60rem start in Task 3 CSS). Alternatives-considered and out-of-scope are design context, no task needed.

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N". `buildStatusBar()` in Task 3 is an explicit instruction to extract today's existing bar-building code into a helper, not a placeholder. The 60rem min-width is a stated starting value to tune, not a gap.

**Type consistency:** `buildScene` return `handle` fields (`diagram`, `overlay`, `service.egress[name]`, `deps[name].workerCells/queueBar`, `edges[].{line,flow,fromEl,toEl}`, `relayout`) are used consistently in Tasks 4-6. `edgeEndpoints`/`toLocalRect` signatures match Tasks 1-2. Edge lookup by target name is defined in Task 5 Step 1.
