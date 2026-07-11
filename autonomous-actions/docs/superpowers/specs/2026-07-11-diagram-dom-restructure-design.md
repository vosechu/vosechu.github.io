# Diagram DOM restructure design

Date: 2026-07-11
Status: Design approved; implementation plan pending.

## Summary

The diagram is one fixed-viewBox SVG, so each dependency's internals leak outside its
card and the text has no legible floor. Rebuild the boxes as real HTML/CSS (rem units,
flex/grid) that contain their contents and never shrink below a set size, and draw the
connecting arrows in one SVG overlay measured from the laid-out DOM. Scope is
`render.js` and its CSS plus a new pure `edges.js`; the engine, the 72 tests, and the
other modules are untouched.

## Problem

The system diagram is one SVG with a fixed `viewBox="0 0 1200 508"`, scaled to its
container by `svg#stage { width: 100% }`. Two consequences:

1. **Leak.** Each dependency's callee-side capacity grid, its `N/12 serving` count,
   and its inbound queue bar are drawn *outside* the card (`capY = y + NODE_H + 12`;
   queue at `NODE_X - 16`). Only the label sits inside the box.
2. **Illegible when small.** Everything scales with the viewBox, so text has no minimum
   size; it shrinks with the container, and the wide, sparse layout makes boxes read small.

## Goal

Each service is a self-contained box that holds its own parts, and text and box sizes
have a guaranteed legible floor. No custom zoom or pan.

## Approach: DOM boxes + SVG arrow overlay (Approach 1 layout)

Move the boxes from SVG primitives to real HTML/CSS (rem units, flex/grid, padding)
so they contain their contents and size to a legible floor. Keep the connecting
arrows as SVG, drawn in one absolutely-positioned overlay whose endpoints are
measured from the laid-out DOM.

### Conceptual model

Every concept factors into two element types:

- **Service node** (Our service *and* each dependency): incoming queue + worker pool,
  plus a front-door timeout on Our service only.
- **Call edge** (client -> us, us -> each dependency): outgoing connection pool +
  outgoing timeout + bulkhead + circuit breaker. The outbound protections live in Our
  service's egress rows, one per dependency. They are ours and outward-facing, not the
  dependency's. (A breaker on Payments is in our service, not at Payments.)

### Concept -> widget

| Concept | Widget |
|---|---|
| Workers (threads/processes/machines) | a row/grid of cells; filled = busy, empty = idle |
| Incoming queue | a thin fill-bar inside a fixed-height track at the box entrance (the numeric count stays in the bottom status bar, as today) |
| Front-door (incoming) timeout | a clock pill on Our service |
| Outgoing connection pool | a grid of connection cells per egress row |
| Outgoing timeout | a clock pill on the egress row |
| Bulkhead | a wall capping the pool cells past the cap, plus the cap number |
| Circuit breaker | a pill (passing / testing / blocking); open -> the arrow to that dependency greys and stops flowing |

### Layout

```
.diagram (position: relative)
├─ <svg class="edges">  ....... absolute overlay, inset:0, pointer-events:none, z-index below boxes
└─ .cols (flex row, gap)
   ├─ .col-client   -> Client box
   ├─ .col-service  -> Our service: incoming queue • worker pool • front-door timeout •
   │                    egress rows [pool │ wall │ breaker │ timeout], one per dependency
   └─ .col-deps     -> vertical stack of dependency boxes [worker pool • incoming queue];
                        rows hidden per act (display:none) as today
```

All outbound machinery stays in Our service; each dependency box is workers + queue
only. Ownership is unambiguous.

### Arrows

One SVG overlay. For each visible edge: a static base line (colored by state) plus a
flow path animated with `stroke-dashoffset` (unchanged from today). Endpoints come
from a pure `edgeEndpoints(fromRect, toRect)`: right-center of the source (egress row,
client, or service) to left-center of the target. `layoutEdges()` reads
`getBoundingClientRect()` for each anchor, converts to `.diagram`-relative
coordinates, and applies the geometry. A breaker opening adds a `blocked` class to its
edge: greyed, no flow.

### Hot-path rule

Box outer sizes are fixed within an act. Per-frame `render()` updates only inner state
(cell fills, queue-bar height inside a fixed track, breaker pill, fault colors) and
never reflows the layout. `layoutEdges()` runs only on: initial build, `ResizeObserver`
fire (window resize, panel collapse, font-size/zoom change), and act change (rows
revealed/hidden). Never per frame. Measurement runs inside a `requestAnimationFrame`
to coalesce bursts.

Value-bearing pills (timeouts, bulkhead cap) carry text that changes when the player
drags a slider. They use a fixed `min-width` so the text update never nudges the
layout; a slider change is not per-frame anyway, so if fixed-width ever proves
insufficient the control handler can also call `handle.relayout()`.

### Sizing / responsive

All rem. `.diagram { min-width: <floor, ~60rem to start, tuned during implementation> }`
and `.stagewrap { overflow-x: auto }`.
A narrow window scrolls horizontally; text never drops below the floor. Native browser
zoom and font-size settings work without extra code. Narrow behavior is scroll (not
column-wrap) so node positions stay stable for the guided tour's anchors.

## Components / isolation

- **`src/edges.js` (new, pure).** `edgeEndpoints(fromRect, toRect)` (and `edgePath` if a
  curve is used) from plain `{ left, top, width, height }` rects. No DOM. Unit-tested.
  This is where the new risk lives, so it carries the coverage.
- **`src/render.js` (rewritten, DOM glue).** `buildScene(root, config, onSelect)` builds
  the DOM boxes + overlay once and returns a handle; `render(state, handle, selected)`
  updates inner state per frame; `layoutEdges(handle)` (exposed as `handle.relayout()`)
  measures and redraws arrows. Verified by serving locally, not unit-tested (DOM glue).
- **`src/controls.js` (small change).** The `render()` call is unchanged; add a
  `handle.relayout()` call on act change. `document.getElementById('stage')` still
  resolves (it is now a div). Renaming the build function `initRender` -> `buildScene`
  also means updating its single import and call site here.
- **`index.html`.** `#stage` becomes a div; SVG-specific CSS is replaced with
  box/grid/pill/arrow CSS in rem; the flow keyframes are kept.

## Data flow

Build once. Per frame: `sim.tick` -> `render(state, handle, selected)` updates inner
state only; arrows stay put. On resize or act change: `layoutEdges` recomputes arrow
endpoints. The engine is unchanged and stays deterministic.

## Error handling / edge cases

- Hidden rows (an act has not revealed a dependency): its box, egress row, and arrow
  are `display:none`; `layoutEdges` skips hidden/zero-size anchors.
- `getBoundingClientRect` returns viewport coordinates; subtract the `.diagram` rect
  (and account for scroll) to get local coordinates.
- `ResizeObserver` is coalesced through `requestAnimationFrame` to avoid thrash.
- No `Date.now` / `Math.random` / DOM in the engine; unaffected.

## Testing

- `test/edges.test.js`: pure geometry, red-green, `node:test` + `assert/strict`.
  Cover: endpoints when the source is left of the target; hidden/zero-rect handling;
  the coordinate-conversion helper if one is extracted.
- The 72 existing tests stay green (engine, metrics, scenarios, telemetry, theme,
  topology, tour).
- `render.js` DOM glue is verified by serving at localhost:8000 and reviewing across
  acts: reveal/hide, a breaker opening severs the right arrow, narrow-window scroll,
  and the min-size floor.

## Alternatives considered

**Patch the existing SVG instead of rewriting.** Both stated goals are reachable
without a rewrite: enclose each dependency's capacity grid and queue by growing its
card rect and moving `capY` inside it (fixes the leak), and set
`svg#stage { min-width: <floor> }` with `.stagewrap { overflow-x: auto }` (gives a
pixel floor plus scroll). This is far less work and lower risk.

We reject it because the floor we want is rem-based, not a pixel constant. Rem sizing
respects the reader's font-size and browser-zoom settings (an accessibility win a pixel
floor cannot give), boxes size to their content instead of to a fixed viewBox, and real
DOM is easier to extend later (focus, ARIA, tooltips, new widgets). The SVG patch would
meet the letter of the goal and miss the reason for it.

## Details to pin during implementation

- **Half-open breaker on the arrow.** The pill reads `testing`; decide whether the
  arrow shows a single probe/trickle or just resumes normal flow. Not a blocker.
- **State is not color-only.** Preserve today's redundant cues so colorblind readers
  keep the lesson: the fire glyph on a failing dependency, the breaker pill text, and
  the flow speed (fast healthy vs slow congested vs static failing).
- **The rem floor value.** Start near 60rem for `.diagram` min-width and tune against a
  legible text minimum during implementation.

## Out of scope

- The act-aware tour overhaul (separate task).
- The cats-as-analogies copy pass (separate; narrative agent).
- Custom zoom/pan (explicitly unnecessary once the boxes are DOM).

## PR breakdown (ordered, smallest shippable slice first)

1. **PR1: `edges.js` pure geometry module + tests.** No consumer yet: scaffold the
   tested unit the rewrite depends on. Smallest, safe, green.
2. **PR2: DOM + overlay diagram rewrite.** Rewrite `render.js` to build the DOM boxes
   (Approach 1) and the SVG arrow overlay consuming `edges.js`; replace the `#stage`
   SVG with a div and the SVG-specific CSS with rem box/grid/pill/arrow CSS in
   `index.html`; wire `handle.relayout()` in `controls.js`; include the rem min-width +
   `overflow-x:auto` sizing floor. Verified manually across all acts. This is the
   atomic switch: the diagram renders the old way or the new way, so it lands as one
   coherent change rather than a half-migrated diagram.
