import { colorOf, shortOf, labelOf, hoverOf } from './theme.js';
import { availabilityPercent } from './metrics.js';
import { STRINGS } from './strings.js';
import { breakerLabel, serviceSub } from './telemetry.js';
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
// A fixed-height queue track with a bottom-anchored fill; returns the fill.
function queue(parent) {
  const track = div('queue'); const fill = div('fill'); track.appendChild(fill);
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

// Fill a cell grid: cells before `n` are marked busy. If `wallAt` is given,
// cells from `wallAt` onward are marked walled (a bulkhead reserves them for
// other dependencies); everything between `n` and `wallAt` stays a plain idle
// cell. `n` is always <= wallAt (a bulkhead never lets more legs through than
// its own cap), so busy and walled never land on the same cell.
function fillCells(cellsArr, n, wallAt) {
  for (let i = 0; i < cellsArr.length; i++) {
    let cls = 'cell';
    if (i < n) cls += ' busy';
    else if (wallAt != null && i >= wallAt) cls += ' walled';
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
  const serviceSubEl = div('sub', '');                // "workers X, connections Y/inf" per frame
  serviceBox.appendChild(serviceSubEl);
  const svcQueueRow = div('egress');                  // reuse the flex row for queue + workers
  const svcQueueFill = queue(svcQueueRow);
  const svcWorkers = cells(svcQueueRow, MAX_SLOTS);
  serviceBox.appendChild(svcQueueRow);
  // Front-door timeout pill: its text is sim.config.timeoutMs, which is config,
  // not per-frame state, so controls.js sets it (on build and on the front-door
  // timeout slider's input), not render().
  const frontTimeout = div('pill');
  serviceBox.appendChild(frontTimeout);
  const egress = {};
  for (const name of names) {
    const row = div('egress');
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

  // Status bar: today's build logic, extracted verbatim into a helper.
  const bar = buildStatusBar();

  const handle = {
    diagram: root, overlay, cols, bar, names, edges: [], ema: {},
    service: {
      sub: serviceSubEl, queueBar: svcQueueFill, workerCells: svcWorkers.cells,
      frontTimeout, egress,
    },
    deps,
    edgeByName: new Map(),   // dependency name -> its egress-row->box edge, for render()'s flow classes
    relayout: () => {},
  };

  // Arrows: one client->service edge, then one service-egress-row->dependency
  // edge per target (kept in stable name order so edge count always matches
  // handle.names for the browser QA checklist).
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

  // Incoming worker pool: filled by total busy workers.
  const busyN = smi('wbusy', state.workers.busy);
  fillCells(h.service.workerCells, busyN);
  // The worker pool is finite, but the service accepts connections without a hard
  // cap (the overflow queues), so connections are shown against infinity.
  h.service.sub.textContent = serviceSub(size, busyN);

  const qd = smi('wq', state.queue.depth);
  h.service.queueBar.style.height = `${(Math.min(qd, QUEUE_MAX) / QUEUE_MAX) * 100}%`;

  // Client -> service edge: active whenever the service currently holds any
  // inflight work, the same raw (unsmoothed) signal each dependency edge uses.
  h.clientEdge.flow.setAttribute('class', state.workers.busy > 0 ? 'edge-flow active' : 'edge-flow');

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

    // Outbound connection pool. The grid tracks the worker pool, so a dependency
    // with no bulkhead can use all of it; a bulkhead walls off the cells past its
    // cap, showing those workers are reserved for the other dependencies.
    const poolShown = Math.min(size, OUT_VIEW);
    const available = bh ? Math.min(bh.size, poolShown) : poolShown;
    const flN = smi(`fl_${name}`, inflight);
    fillCells(eg.poolCells, flN, available);
    eg.wall.textContent = String(cap);
    if (br) {
      eg.breakerPill.className = `pill breaker ${br.state}`;
      eg.breakerPill.textContent = breakerLabel(br.state);
    } else {
      eg.breakerPill.className = 'pill breaker';
      eg.breakerPill.textContent = '';
    }
    eg.timeoutPill.textContent = fmtDur(t.outgoingTimeoutMs);

    // Callee-side capacity: filled = in service now. A queue at the dependency
    // fills its own queue track (the numeric count stays in the status bar).
    const ds = t.upstream || { capacity: CAP_SLOTS, inService: 0, queueDepth: 0 };
    const inSvc = smi(`sv_${name}`, ds.inService);
    const dq = smi(`dq_${name}`, ds.queueDepth);
    fillCells(d.workerCells, inSvc);
    d.queueBar.style.height = `${(Math.min(dq, DEP_QUEUE_MAX) / DEP_QUEUE_MAX) * 100}%`;

    d.box.className = 'box dep' + (failing ? ' faulted' : congested ? ' slow' : '') + (name === selectedStation ? ' selected' : '');
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
