import { colorOf, shortOf, labelOf, hoverOf } from './theme.js';
import { availabilityPercent } from './metrics.js';
import { STRINGS } from './strings.js';
import { breakerLabel, serviceSub, capacityReadout } from './telemetry.js';
import { edgeEndpoints, toLocalRect } from './edges.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const MAX_SLOTS = 60;    // incoming worker slots the grid can show
const OUT_VIEW = 30;     // outbound pool slots shown per dependency (tracks the worker pool)
const CAP_SLOTS = 30;    // callee-side worker slots shown per dependency
const QUEUE_MAX = 50;    // front-door queue depth that fills its track
const DEP_QUEUE_MAX = 8; // per-dependency upstream queue depth that fills its track

const fmtDur = (v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} s` : `${v} ms`);

const svgEl = (name, attrs = {}) => {
  const n = document.createElementNS(SVGNS, name);
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
// toggle .busy/.walled per frame without rebuilding.
function cells(parent, n) {
  const wrap = div('cells');
  const out = [];
  for (let i = 0; i < n; i++) { const c = div('cell'); wrap.appendChild(c); out.push(c); }
  parent.appendChild(wrap);
  return { wrap, cells: out };
}
// A horizontal queue track (fills left to right); returns the fill element.
function queueTrack(parent) {
  const track = div('queue h'); const fill = div('fill'); track.appendChild(fill);
  parent.appendChild(track); return fill;
}

// One arrow: a base line (static color) plus a flow line (animated per frame
// by render(), via its edge-flow class), both appended to the overlay so they
// paint behind the boxes. `fromEl`/`toEl` are measured later by layoutEdges.
function makeEdge(overlay, fromEl, toEl) {
  const line = svgEl('line', { class: 'edge' });
  const flow = svgEl('line', { class: 'edge-flow' });
  overlay.append(line, flow);
  return { line, flow, fromEl, toEl };
}

// Measure every edge's boxes and draw the arrows onto them. Runs on build,
// on ResizeObserver, and on act change (handle.relayout, wired in buildScene)
// -- never per frame; see the hot-path rule on render() below.
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

// Fill a cell grid to reflect the live boundaries of a pool, not just how much
// of it is busy right now:
//   - `busy` cells (from 0) are marked busy.
//   - `visible` bounds how many cells this pool currently has; cells at or
//     past it are `hidden` (visibility:hidden, so the grid keeps its layout
//     slot -- hot-path rule, no reflow), matching the old grid's "this slot
//     doesn't exist right now" look. Used by the worker pool (bounded by the
//     worker-count slider) and the egress pool (bounded by the same slider,
//     clamped to the grid size).
//   - `wallFrom`/`wallTo`, if given, mark a red bulkhead wall across that
//     sub-range of the visible cells. Only the egress pool uses this, and
//     only when a bulkhead actually exists for that dependency; with no
//     bulkhead the caller passes wallFrom === wallTo (or omits both), so no
//     cell ever gets `walled`.
// The ranges are mutually exclusive by construction (busy never reaches
// wallFrom), so each cell gets exactly one state.
function fillCells(cellsArr, { busy = 0, visible = cellsArr.length, wallFrom = null, wallTo = null } = {}) {
  for (let i = 0; i < cellsArr.length; i++) {
    let cls = 'cell';
    if (i >= visible) cls += ' hidden';
    else if (wallFrom != null && i >= wallFrom && i < wallTo) cls += ' walled';
    else if (i < busy) cls += ' busy';
    cellsArr[i].className = cls;
  }
}

// The fixed bottom status bar: one slot per STRINGS.bar key, every metric
// always visible (no progressive reveal). Label/hover text is static copy,
// set once here; only the value and pass/fail class change per frame (render()).
function buildStatusBar() {
  const byId = (id) => document.getElementById(id);
  const bar = {};
  for (const key of Object.keys(STRINGS.bar)) {
    const copy = STRINGS.bar[key];
    const labelEl = byId(`bar-${key}-label`);
    if (labelEl) labelEl.textContent = copy.label;
    const hoverEl = byId(`bar-${key}-hover`);
    if (hoverEl) hoverEl.textContent = copy.hover;
    bar[key] = { slot: byId(`bar-${key}`), value: byId(`bar-${key}-value`) };
  }
  return bar;
}

// Build the fixed scene once. render() only updates classes, text, and inline
// styles so CSS transitions animate every change. `onSelect(name)` fires when
// a dependency box is clicked; only revealed dependencies are clickable (an
// unrevealed one is hidden via display:none in render(), which also blocks
// pointer events).
//
// The overlay carries one client->service edge and one service-egress->dependency
// edge per target (handle.edges), drawn once here and re-measured by
// handle.relayout() (see layoutEdges above) on build, resize, and act change.
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

  // Column 2: Our service (incoming queue, workers, front-door timeout, egress rows)
  const serviceCol = div('col col-service');
  const serviceBox = div('box service');
  serviceBox.appendChild(div('label', STRINGS.telemetry.service));
  // Service-level fault cue (mirrors the dependency .fire): lit when the
  // client-visible error ratio crosses the threshold computed in render().
  const serviceFire = div('fire', '🔥');
  serviceBox.appendChild(serviceFire);
  const serviceSubEl = div('sub', '');                // "workers X, connections Y/inf" per frame
  serviceBox.appendChild(serviceSubEl);
  // Incoming side: shares the outbound rows' grid, so the worker cells start
  // exactly where the connections column does. The queue lies horizontal in
  // the 4rem name column, and the labels sit in a header row above the
  // widgets, matching the outbound section.
  serviceBox.appendChild(div('micro heading', STRINGS.telemetry.incoming));
  const inHead = div('egress call head');
  inHead.append(div('micro', STRINGS.telemetry.queue), div('micro', STRINGS.telemetry.workers));
  serviceBox.appendChild(inHead);
  const svcQueueRow = div('egress call');
  const svcQueueFill = queueTrack(svcQueueRow);
  const svcWorkers = cells(svcQueueRow, MAX_SLOTS);
  serviceBox.appendChild(svcQueueRow);
  // Front-door timeout pill, labeled. Its text is sim.config.timeoutMs, which is
  // config, not per-frame state, so controls.js sets it (on build and on the
  // front-door timeout slider's input), not render().
  const ftRow = div('egress');
  ftRow.appendChild(div('tag', STRINGS.telemetry.frontTimeout));
  const frontTimeout = div('pill');
  ftRow.appendChild(frontTimeout);
  serviceBox.appendChild(ftRow);
  // Outbound side: one labeled call row per dependency, under a shared header
  // row that names the columns (the rows and header share the .egress.call grid).
  serviceBox.appendChild(div('micro heading', STRINGS.telemetry.outbound));
  const hd = STRINGS.telemetry.callHead;
  const head = div('egress call head');
  head.append(div('micro', ''), div('micro', hd.pool), div('micro', hd.cap), div('micro', hd.breaker), div('micro', hd.timeout));
  serviceBox.appendChild(head);
  const egress = {};
  for (const name of names) {
    const row = div('egress call');
    row.appendChild(div('tag', shortOf(name)));
    const pool = cells(row, OUT_VIEW);
    const wall = div('pill', '');                     // bulkhead cap; text per frame
    const breakerPill = div('pill breaker');
    const outTimeout = div('pill');
    row.append(wall, breakerPill, outTimeout);
    serviceBox.appendChild(row);
    egress[name] = { row, poolCells: pool.cells, wall, breakerPill, timeoutPill: outTimeout };
  }
  serviceCol.appendChild(serviceBox); cols.appendChild(serviceCol);

  // Column 3: Dependencies (workers, queue), hidden per act
  const depsCol = div('col col-deps');
  const deps = {};
  for (const name of names) {
    const box = div('box dep'); box.dataset.name = name;
    // A custom property, not an inline border-color: an inline style would beat
    // the .box.dep.slow/.faulted class rules (equal-specificity classes lose to
    // higher-specificity ones, but nothing beats an inline style), so the fault
    // colors could never show through. --depcolor lets .box.dep's own border-color
    // rule read it, and the two-class .slow/.faulted rules (higher specificity)
    // override that rule normally, no !important needed.
    box.style.setProperty('--depcolor', colorOf(name));
    box.appendChild(div('label', labelOf(name)));
    // Non-color redundant cue for a failing dependency: absolutely positioned
    // (box is position:relative) so it never affects the box's outer size,
    // hidden by default via the .fire CSS rule, toggled by render() (hot path:
    // a class toggle only, no layout work).
    const fire = div('fire', '🔥');
    box.appendChild(fire);
    // Live capacity readout ("3/12 serving"), so the grid's bright-vs-dim cell
    // boundary has a number next to it. Text set per frame; the box width is
    // fixed in CSS so the changing text can never resize it (hot-path rule).
    const capLabel = div('sub', '');
    box.appendChild(capLabel);
    // Same queue-then-workers language as the incoming section: labels in a
    // header row above, horizontal queue on the left, cells beside it.
    const dHead = div('egress deprow head');
    dHead.append(div('micro', STRINGS.telemetry.queue), div('micro', STRINGS.telemetry.workers));
    box.appendChild(dHead);
    const drow = div('egress deprow');
    const dqueue = queueTrack(drow);
    const dworkers = cells(drow, CAP_SLOTS);
    box.appendChild(drow);
    if (onSelect) box.addEventListener('click', () => onSelect(name));
    box.title = hoverOf(name);
    depsCol.appendChild(box);
    deps[name] = { box, workerCells: dworkers.cells, queueBar: dqueue, fire, capLabel };
  }
  cols.appendChild(depsCol);

  // Status bar: today's build logic, extracted verbatim into a helper.
  const bar = buildStatusBar();

  const handle = {
    diagram: root, overlay, bar, names, edges: [], ema: {},
    service: {
      sub: serviceSubEl, queueBar: svcQueueFill, workerCells: svcWorkers.cells,
      frontTimeout, egress, fire: serviceFire,
    },
    deps,
    edgeByName: new Map(),   // dependency name -> its egress-row->box edge, for render()'s flow classes
    relayout: () => {},
  };

  // Arrows: one client->service edge, then one service-egress-row->dependency
  // edge per target (kept in stable name order), so handle.edges.length is
  // always handle.names.length + 1 (the +1 is the client edge) for the
  // browser QA checklist.
  handle.clientEdge = makeEdge(overlay, clientBox, serviceBox);
  handle.edges.push(handle.clientEdge);
  for (const name of names) {
    const edge = makeEdge(overlay, egress[name].row, deps[name].box);
    handle.edges.push(edge);
    handle.edgeByName.set(name, edge);
  }

  // Coalesce layout work into one measure-and-draw per animation frame: build,
  // ResizeObserver, and act change (controls.js) can all fire close together.
  let raf = null;
  handle.relayout = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; layoutEdges(handle); });
  };
  new ResizeObserver(handle.relayout).observe(root);
  handle.relayout();   // initial draw

  return handle;
}

export function render(state, h, selectedStation) {
  const size = state.workers.size;

  // Counts come from a 1s sliding window recomputed every frame, so at low rates
  // they flicker 0/1. Exponentially smooth the DISPLAYED numbers and bar/box fills
  // (not the fault-color thresholds) so they read steadily.
  const e = h.ema;
  const sm = (key, v, a = 0.12) => { e[key] = e[key] == null ? v : e[key] + (v - e[key]) * a; return e[key]; };
  const smi = (key, v) => Math.round(sm(key, v));

  // Incoming worker pool: filled by total busy workers; cells past the live
  // worker-pool size are hidden, so the worker pool slider visibly resizes the
  // grid (not just how much of it looks busy).
  const busyN = smi('wbusy', state.workers.busy);
  fillCells(h.service.workerCells, { busy: busyN, visible: size });
  // The worker pool is finite, but the service accepts connections without a hard
  // cap (the overflow queues), so connections are shown against infinity.
  h.service.sub.textContent = serviceSub(size, busyN);

  // The service queue is the horizontal variant, so its fill grows in width.
  const qd = smi('wq', state.queue.depth);
  h.service.queueBar.style.width = `${(Math.min(qd, QUEUE_MAX) / QUEUE_MAX) * 100}%`;

  // Service-level fault cue: what fraction of what the client sees is failing,
  // a ratio (rate-independent) rather than a raw count, computed from the same
  // raw windowed rates (state.rates) used for the status bar below -- not the
  // EMA-smoothed display values, matching the pre-rewrite gateway logic exactly.
  const served = state.rates.successPerSec + state.rates.degradedPerSec + state.rates.clientErrorsPerSec;
  const errRatio = served > 0 ? state.rates.clientErrorsPerSec / served : 0;
  const serviceFailing = errRatio > 0.15;   // a sixth of client traffic failing is already an alarm
  h.service.fire.classList.toggle('show', serviceFailing);

  // Client -> service edge: danger when the service itself is failing that much
  // of its client traffic, active whenever the service currently holds any
  // inflight work (the same raw, unsmoothed signal each dependency edge uses),
  // else quiet.
  h.clientEdge.flow.setAttribute('class',
    serviceFailing ? 'edge-flow danger' : (state.workers.busy > 0 ? 'edge-flow active' : 'edge-flow'));

  for (const name of h.names) {
    const d = h.deps[name];
    const eg = h.service.egress[name];
    const t = state.targets[name];
    // Progressive topology (topology.js) narrows sim.config.targets per act, so an
    // unrevealed station has no entry in state.targets. Hide its dependency box
    // and its service egress row rather than reading fields off it.
    if (!t) {
      d.box.style.display = 'none';
      eg.row.style.display = 'none';
      continue;
    }
    d.box.style.display = '';
    eg.row.style.display = '';

    const inflight = state.workers.byTarget[name] || 0;
    const br = t.breaker;
    const bh = t.bulkhead;
    const cap = bh ? bh.size : size;
    const failing = (br && br.state === 'open') || (t.errorsPerSec || 0) > 0;
    // Amber when this dependency itself is backing up: its own queue is filling,
    // or it is near its concurrency cap. A healthy dependency that is merely
    // starved of our workers has an empty upstream queue, so it stays quiet.
    const backedUp = (t.upstream && t.upstream.queueDepth > 0);
    const congested = !failing && (backedUp || (cap > 0 && inflight >= Math.max(1, Math.ceil(cap * 0.75))));

    // This dependency's edge: blocked when its breaker has tripped (no calls are
    // even attempted), else danger/congested mirror the box's own fault state,
    // else active while it is merely carrying traffic.
    let flowClass = 'edge-flow';
    if (br && br.state === 'open') flowClass = 'edge-flow blocked';
    else if (failing) flowClass = 'edge-flow danger';
    else if (congested) flowClass = 'edge-flow congested';
    else if (inflight > 0) flowClass = 'edge-flow active';
    h.edgeByName.get(name).flow.setAttribute('class', flowClass);

    // Outbound connection pool. The grid tracks the live worker pool, so cells
    // past poolShown are hidden (the worker pool slider visibly resizes this
    // grid too). A dependency with no bulkhead can use the whole visible pool;
    // a bulkhead walls off the cells between its own cap and poolShown (red,
    // reserved for the other dependencies). With bulkheads off, bulkheadCap
    // === poolShown, so the wall range is empty and no cell is ever walled.
    const poolShown = Math.min(size, OUT_VIEW);
    const bulkheadCap = bh ? Math.min(bh.size, poolShown) : poolShown;
    const flN = smi(`fl_${name}`, inflight);
    fillCells(eg.poolCells, {
      busy: Math.min(flN, bulkheadCap),
      visible: poolShown,
      wallFrom: bh ? bulkheadCap : null,
      wallTo: poolShown,
    });
    // The cap pill only shows a number when a bulkhead actually exists; with
    // none configured it reads "-" (dimmed) rather than sitting blank or
    // echoing the whole worker pool as if it were a cap.
    if (bh) {
      eg.wall.className = 'pill';
      eg.wall.textContent = String(bh.size);
    } else {
      eg.wall.className = 'pill off';
      eg.wall.textContent = STRINGS.telemetry.noCap;
    }
    // Same for the breaker pill: "none" (dimmed) when this call has no breaker,
    // so a blank pill never asks the reader to guess what blank means.
    if (br) {
      eg.breakerPill.className = `pill breaker ${br.state}`;
      eg.breakerPill.textContent = breakerLabel(br.state);
    } else {
      eg.breakerPill.className = 'pill breaker off';
      eg.breakerPill.textContent = STRINGS.telemetry.none;
    }
    eg.timeoutPill.textContent = fmtDur(t.outgoingTimeoutMs);

    // Callee-side capacity: the grid shows exactly this dependency's live
    // capacity (cells past it are hidden, same rule as the worker grid), so a
    // worker only ever sees slots that actually exist; the capacity slider
    // visibly resizes the grid. Overflow fills the queue track (the numeric
    // count stays in the status bar and the readout below).
    const ds = t.upstream || { capacity: CAP_SLOTS, inService: 0, queueDepth: 0 };
    const inSvc = smi(`sv_${name}`, ds.inService);
    const dq = smi(`dq_${name}`, ds.queueDepth);
    fillCells(d.workerCells, { busy: inSvc, visible: Math.min(ds.capacity, CAP_SLOTS) });
    d.queueBar.style.width = `${(Math.min(dq, DEP_QUEUE_MAX) / DEP_QUEUE_MAX) * 100}%`;   // horizontal track
    d.capLabel.textContent = capacityReadout(inSvc, ds.capacity, dq);

    d.box.className = 'box dep' + (failing ? ' faulted' : congested ? ' slow' : '') + (name === selectedStation ? ' selected' : '');
    d.fire.classList.toggle('show', failing);
  }

  const okS = smi('ok', state.rates.successPerSec);
  const degS = smi('deg', state.rates.degradedPerSec);
  const errS = smi('err', state.rates.errorPerSec);
  const rejS = smi('rej', state.rates.rejectPerSec);
  const p95 = sm('p95', state.latency.p95);   // precise value drives the pass/fail check

  // Fixed bottom status bar: every slot updates every frame, no progressive
  // reveal. Availability comes from the windowed rates via availabilityPercent;
  // p95 and availability each carry a pass/fail state against the SLO.
  const avail = availabilityPercent({ successPerSec: okS, degradedPerSec: degS, clientErrorsPerSec: errS });
  const availPass = avail >= 99;
  h.bar.availability.value.textContent = `${Math.round(avail)}%`;
  h.bar.availability.slot.setAttribute('class', `barslot emph ${availPass ? 'pass' : 'fail'}`);

  const p95Pass = p95 < 5000;
  h.bar.p95.value.textContent = fmtDur(Math.round(p95));
  h.bar.p95.slot.setAttribute('class', `barslot emph ${p95Pass ? 'pass' : 'fail'}`);

  h.bar.throughput.value.textContent = String(okS);
  h.bar.errors.value.textContent = String(errS);
  h.bar.queue.value.textContent = String(qd);
  h.bar.rejects.value.textContent = String(rejS);
}
