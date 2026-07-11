import { colorOf, shortOf, labelOf } from './theme.js';
import { availabilityPercent } from './metrics.js';
import { sparklinePath } from './sparkline.js';
import { STRINGS } from './strings.js';

const SERVICE_COLOR = '#a78bfa';   // our service's own workers (incoming)
// Plain-language breaker states (open/closed reads as jargon to non-electricians).
const BREAKER_LABEL = { closed: 'passing', open: 'blocking', half_open: 'testing' };

const SVGNS = 'http://www.w3.org/2000/svg';
const MAX_SLOTS = 60;    // incoming worker slots the grid can show
const OUT_VIEW = 30;     // outbound pool slots shown per dependency (tracks the worker pool)
const OUT_COLS = 8;      // wrapped into rows of this many
const CAP_SLOTS = 30;    // callee-side capacity slots shown per dependency
const CAP_COLS = 12;     // wrapped into rows of this many
const SPARK_W = 90, SPARK_H = 32;   // latency sparkline box, per dependency row
const SPARK_LEN = 40;               // rolling series length (frames kept)
const GW = { x: 420, y: 96, w: 300, h: 300 };
const HUB_Y = GW.y + GW.h / 2;   // gateway vertical center; the client and callee edges converge here
const NODE_X = 980, NODE_W = 180, NODE_H = 64;
const rowY = (i) => 36 + i * 118;
const rowCY = (i) => rowY(i) + NODE_H / 2;

const fmtDur = (v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} s` : `${v} ms`);

function el(name, attrs = {}, text) {
  const n = document.createElementNS(SVGNS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (text != null) n.textContent = text;
  return n;
}

// Build the fixed scene once. render() only updates attributes and classes so
// CSS transitions and keyframes animate every change. `onSelect(name)` fires
// when a station card is clicked; only revealed stations are clickable (an
// unrevealed row is hidden via `display: none`, which also blocks pointer
// events, so no extra guard is needed here).
export function initRender(root, config, onSelect) {
  root.textContent = '';
  const names = Object.keys(config.targets);
  const colors = {}, abbrev = {}, labels = {};
  for (const name of names) {
    colors[name] = colorOf(name); abbrev[name] = shortOf(name); labels[name] = labelOf(name);
  }

  const defs = el('defs');
  const glow = el('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' });
  glow.appendChild(el('feGaussianBlur', { stdDeviation: 3, result: 'b' }));
  const merge = el('feMerge');
  merge.appendChild(el('feMergeNode', { in: 'b' }));
  merge.appendChild(el('feMergeNode', { in: 'SourceGraphic' }));
  glow.appendChild(merge); defs.appendChild(glow); root.appendChild(defs);

  root.appendChild(el('rect', { class: 'bg', x: 0, y: 0, width: 1200, height: 600 }));

  // Edges beneath nodes.
  root.appendChild(el('line', { class: 'edge', x1: 150, y1: HUB_Y, x2: GW.x, y2: HUB_Y }));
  const clientFlow = el('line', { class: 'edge-flow', x1: 150, y1: HUB_Y, x2: GW.x, y2: HUB_Y });
  root.appendChild(clientFlow);

  // Each dependency's row is spread across three separate loops below (its edge,
  // its outbound pool, its card). A row-group per loop lets render() hide the
  // whole row in one place when an act has not revealed that station yet.
  const deps = {};
  names.forEach((name, i) => {
    const cy = rowCY(i);
    const g = el('g', { class: 'deprow' });
    root.appendChild(g);
    g.appendChild(el('line', { class: 'edge', x1: GW.x + GW.w, y1: HUB_Y, x2: NODE_X, y2: cy }));
    const flow = el('line', { class: 'edge-flow', x1: GW.x + GW.w, y1: HUB_Y, x2: NODE_X, y2: cy });
    g.appendChild(flow);
    deps[name] = { flow, rowGroups: [g] };
  });

  // Client (centered on the gateway hub line)
  root.appendChild(el('rect', { class: 'card', x: 60, y: HUB_Y - 30, width: 90, height: 60, rx: 8 }));
  root.appendChild(el('text', { class: 'nodelabel', x: 105, y: HUB_Y - 4, 'text-anchor': 'middle' }, 'Client'));
  root.appendChild(el('text', { class: 'glyph', x: 105, y: HUB_Y + 13, 'text-anchor': 'middle' }, 'retries'));

  // Gateway
  const gwCard = el('rect', { class: 'card gateway', x: GW.x, y: GW.y, width: GW.w, height: GW.h, rx: 12 });
  root.appendChild(gwCard);
  root.appendChild(el('text', { class: 'nodelabel', x: GW.x + 16, y: GW.y + 26 }, 'Our service'));
  const gwFire = el('text', { class: 'fire', x: GW.x + GW.w - 20, y: GW.y + 30, 'text-anchor': 'middle', opacity: 0 }, '🔥');
  root.appendChild(gwFire);
  const gwSub = el('text', { class: 'nodesub', x: GW.x + 16, y: GW.y + 44 }, '');
  root.appendChild(gwSub);
  root.appendChild(el('text', { class: 'region', x: 436, y: GW.y + 62 }, 'incoming'));
  root.appendChild(el('text', { class: 'region', x: 562, y: GW.y + 62 }, 'outbound'));

  // Left: incoming worker pool (service colored). Show up to workers.size of these.
  const leftSlots = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const col = i % 5, r = Math.floor(i / 5);
    const s = el('rect', { class: 'slot', x: 436 + col * 24, y: GW.y + 74 + r * 17, width: 20, height: 13, rx: 3 });
    root.appendChild(s); leftSlots.push(s);
  }

  // Right: outbound connection pools, one row per dependency, colored by callee.
  // The grid tracks the worker pool (a dependency with no bulkhead can use all of
  // it); a bulkhead walls off the slots past its cap with a red X. A latency
  // sparkline to the right of each pool trends that dependency's completed p95;
  // the line clips at the top of the box when it hits the outgoing timeout.
  const out = {};
  names.forEach((name, i) => {
    const y = GW.y + 74 + i * 56;
    const g = el('g', { class: 'deprow' });
    root.appendChild(g);
    g.appendChild(el('text', { class: 'outlabel', x: 562, y: y + 12 }, abbrev[name]));
    const slots = [], xs = [];
    for (let k = 0; k < OUT_VIEW; k++) {
      const col = k % OUT_COLS, r = Math.floor(k / OUT_COLS);
      const sx = 586 + col * 13, sy = y + 2 + r * 13, w = 11;
      slots.push(g.appendChild(el('rect', { class: 'slot', x: sx, y: sy, width: w, height: w, rx: 2 })));
      xs.push(g.appendChild(el('path', { class: 'slotx', d: `M${sx} ${sy}L${sx + w} ${sy + w}M${sx + w} ${sy}L${sx} ${sy + w}` })));
    }
    const sparkX = 722, sparkY = y + 2;
    const sparkGroup = el('g', { class: 'sparkline', transform: `translate(${sparkX},${sparkY})` });
    sparkGroup.appendChild(el('rect', { class: 'sparklinebox', x: 0, y: 0, width: SPARK_W, height: SPARK_H, rx: 3 }));
    const sparkPath = el('path', { class: 'sparklinepath', d: '' });
    sparkPath.style.stroke = colors[name];
    sparkGroup.appendChild(sparkPath);
    g.appendChild(sparkGroup);
    out[name] = { slots, xs, sparkPath, series: [], rowGroup: g };
  });

  // Worker queue: a fill bar just left of the incoming workers, inside the
  // gateway, growing upward as requests wait for a free worker. The numeric
  // count lives in the "queued" metric chip.
  root.appendChild(el('rect', { class: 'queuetrack', x: 424, y: GW.y + 74, width: 8, height: 200, rx: 2 }));
  const queueBar = el('rect', { class: 'queuebar', x: 424, y: GW.y + 274, width: 8, height: 0, rx: 2 });
  root.appendChild(queueBar);
  const queueLabel = el('text', { class: 'outlabel', x: 428, y: GW.y + 70, 'text-anchor': 'middle' }, '');
  root.appendChild(queueLabel);

  // Dependencies
  names.forEach((name, i) => {
    const y = rowY(i), cy = rowCY(i);
    const g = el('g', { class: 'deprow' });
    root.appendChild(g);
    const card = el('rect', { class: 'card dep', x: NODE_X, y, width: NODE_W, height: NODE_H, rx: 10 });
    card.style.stroke = colors[name];
    if (onSelect) card.addEventListener('click', () => onSelect(name));
    g.appendChild(card);
    g.appendChild(el('text', { class: 'nodelabel', x: NODE_X + 14, y: y + 26 }, labels[name]));
    const fire = el('text', { class: 'fire', x: NODE_X + NODE_W - 16, y: y + 26, 'text-anchor': 'middle', opacity: 0 }, '🔥');
    g.appendChild(fire);
    const badge = el('circle', { class: 'badge', cx: 930, cy: cy - 6, r: 9, opacity: 0 });
    const badgeLabel = el('text', { class: 'badgelabel', x: 930, y: cy + 16, 'text-anchor': 'middle' }, '');
    g.appendChild(badge); g.appendChild(badgeLabel);

    // Callee-side capacity: this dependency's own service slots (filled = in
    // service, colored by the callee), with a count of anything queued at it.
    const capY = y + NODE_H + 12;
    const capSlots = [];
    for (let k = 0; k < CAP_SLOTS; k++) {
      const col = k % CAP_COLS, r = Math.floor(k / CAP_COLS);
      const s = el('rect', { class: 'slot', x: NODE_X + col * 12, y: capY + r * 12, width: 9, height: 9, rx: 2 });
      g.appendChild(s); capSlots.push(s);
    }
    const capLabel = el('text', { class: 'outlabel', x: NODE_X, y: capY + 34 }, '');
    g.appendChild(capLabel);

    // Downstream queue: a fill bar in front of the callee, growing as requests
    // wait for one of its capacity slots.
    g.appendChild(el('rect', { class: 'queuetrack', x: NODE_X - 16, y, width: 8, height: NODE_H, rx: 2 }));
    const depQueueBar = el('rect', { class: 'queuebar', x: NODE_X - 16, y: y + NODE_H, width: 8, height: 0, rx: 2 });
    g.appendChild(depQueueBar);
    const depQueueLabel = el('text', { class: 'outlabel', x: NODE_X - 12, y: y - 3, 'text-anchor': 'middle' }, '');
    g.appendChild(depQueueLabel);
    deps[name].rowGroups.push(g, out[name].rowGroup);
    Object.assign(deps[name], { card, badge, badgeLabel, fire, capSlots, capLabel, depQueueBar, depQueueLabel, depQueueBottom: y + NODE_H });
  });

  const byId = (id) => document.getElementById(id);
  // The fixed bottom status bar: one slot per STRINGS.bar key, every metric
  // always visible (no progressive reveal). Label/hover text is static copy,
  // set once here; only the value and pass/fail class change per frame.
  const bar = {};
  for (const key of Object.keys(STRINGS.bar)) {
    const copy = STRINGS.bar[key];
    const labelEl = byId(`bar-${key}-label`);
    if (labelEl) labelEl.textContent = copy.label;
    const hoverEl = byId(`bar-${key}-hover`);
    if (hoverEl) hoverEl.textContent = copy.hover;
    bar[key] = { slot: byId(`bar-${key}`), value: byId(`bar-${key}-value`) };
  }

  return { leftSlots, out, deps, clientFlow, gwCard, gwFire, gwSub, queueBar, queueLabel, bar, names, colors, ema: {} };
}

// Paint a fixed grid of slots: [0, filled) are busy (colored), [filled, available)
// are open track, and everything past `available` gets restClass. Workers hide
// their unused slots ('slot'); outbound pools dim theirs ('slot capped') so the
// grid stays a constant size while still showing the bulkhead cap.
function paintSlots(slots, available, filled, color, restClass = 'slot') {
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (i < filled) { s.setAttribute('class', 'slot on filled'); s.style.fill = color; }
    else if (i < available) { s.setAttribute('class', 'slot on'); s.style.fill = ''; }
    else { s.setAttribute('class', restClass); s.style.fill = ''; }
  }
}

// Outbound pool grid: busy slots colored, open slots as track, slots the bulkhead
// walls off get a red X overlay, and slots past the shown pool are hidden. This
// keeps the grid sized to the worker pool so a bulkhead visibly reserves the rest.
function paintOutbound(slots, xs, filled, available, poolShown, color) {
  const busy = Math.min(filled, available);
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i], x = xs[i];
    let cls, showX = false;
    if (i < busy) { cls = 'slot on filled'; s.style.fill = color; }
    else if (i < available) { cls = 'slot on'; s.style.fill = ''; }
    else if (i < poolShown) { cls = 'slot on walled'; s.style.fill = ''; showX = true; }
    else { cls = 'slot'; s.style.fill = ''; }
    s.setAttribute('class', cls);
    x.setAttribute('class', showX ? 'slotx on' : 'slotx');
  }
}

export function render(state, h, selectedStation) {
  const size = state.workers.size;

  // Counts come from a 1s sliding window recomputed every frame, so at low rates
  // they flicker 0/1. Exponentially smooth the DISPLAYED numbers and bar/box fills
  // (not the fault-color thresholds) so they read steadily.
  const e = h.ema;
  const sm = (key, v, a = 0.12) => { e[key] = e[key] == null ? v : e[key] + (v - e[key]) * a; return e[key]; };
  const smi = (key, v) => Math.round(sm(key, v));

  // Incoming worker pool: uniform service color, filled by total busy workers.
  const busyN = smi('wbusy', state.workers.busy);
  paintSlots(h.leftSlots, size, busyN, SERVICE_COLOR);
  // The worker pool is finite, but the service accepts connections without a hard
  // cap (the overflow queues), so connections are shown against infinity.
  h.gwSub.textContent = `workers ${size}, connections ${busyN}/∞`;

  // Gateway health: what fraction of what the client sees is failing. This scales
  // the gateway fire and reddens the client edge, and it is rate-independent.
  const served = state.rates.successPerSec + state.rates.degradedPerSec + state.rates.clientErrorsPerSec;
  const errRatio = served > 0 ? state.rates.clientErrorsPerSec / served : 0;
  const onFire = errRatio > 0.15;   // a sixth of client traffic failing is already an alarm
  h.gwCard.setAttribute('class', onFire ? 'card gateway faulted' : 'card gateway');
  h.gwFire.setAttribute('opacity', errRatio > 0.02 ? Math.min(1, 0.2 + errRatio) : 0);

  const busy = state.workers.busy > 0 || state.queue.depth > 0;
  h.clientFlow.setAttribute('class', onFire ? 'edge-flow danger' : (busy ? 'edge-flow active' : 'edge-flow'));

  const qd = smi('wq', state.queue.depth);
  const qh = Math.min(Math.min(qd, 50) * 4, 200);   // track is 200px tall (bottom at GW.y + 274)
  h.queueBar.setAttribute('height', qh);
  h.queueBar.setAttribute('y', GW.y + 274 - qh);
  h.queueLabel.textContent = qd > 0 ? String(qd) : '';

  for (const name of h.names) {
    const d = h.deps[name];
    const t = state.targets[name];
    // Progressive topology (topology.js) narrows sim.config.targets per act, so an
    // unrevealed station has no entry in state.targets. Hide its whole row (edge,
    // outbound pool, dependency card) rather than reading fields off it.
    for (const g of d.rowGroups) g.setAttribute('display', t ? 'inline' : 'none');
    if (!t) continue;
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

    // Outbound connection pool. The grid tracks the worker pool, so a dependency
    // with no bulkhead can use all of it; a bulkhead walls off (X) the slots past
    // its cap, showing those workers are reserved for the other dependencies.
    const poolShown = Math.min(size, OUT_VIEW);
    const available = bh ? Math.min(bh.size, poolShown) : poolShown;
    paintOutbound(h.out[name].slots, h.out[name].xs, smi(`fl_${name}`, inflight), available, poolShown, h.colors[name]);
    // Latency sparkline: a rolling trend of this dependency's completed p95,
    // scaled to its outgoing timeout so a hang reads as the line clipping at
    // the top of the box.
    const series = h.out[name].series;
    series.push(t.latencyP95 || 0);
    if (series.length > SPARK_LEN) series.shift();
    h.out[name].sparkPath.setAttribute('d', sparklinePath(series, SPARK_W, SPARK_H, t.outgoingTimeoutMs));

    // Callee-side capacity: filled = in service now, dim = slots past this
    // dependency's own capacity. A queue at the dependency is shown as a count.
    const ds = t.upstream || { capacity: CAP_SLOTS, inService: 0, queueDepth: 0 };
    const inSvc = smi(`sv_${name}`, ds.inService);
    const dq = smi(`dq_${name}`, ds.queueDepth);
    paintSlots(d.capSlots, Math.min(ds.capacity, CAP_SLOTS), inSvc, h.colors[name], 'slot capped');
    d.capLabel.textContent = dq > 0
      ? `${inSvc + dq} held: ${inSvc}/${ds.capacity} serving, ${dq} queued`
      : `${inSvc}/${ds.capacity} serving`;

    // Upstream queue bar in front of the dependency (its own waiting requests).
    // A depth of 8 fills the bar; queues here are bounded by workers minus capacity.
    const dqh = Math.min(dq, 8) * (NODE_H / 8);
    d.depQueueBar.setAttribute('height', dqh);
    d.depQueueBar.setAttribute('y', d.depQueueBottom - dqh);
    d.depQueueLabel.textContent = dq > 0 ? String(dq) : '';

    // Edge flow: red when failing, amber and slow when congested, teal when healthy.
    let flowClass = 'edge-flow';
    if (failing) flowClass = 'edge-flow danger';
    else if (congested) flowClass = 'edge-flow congested';
    else if (inflight > 0) flowClass = 'edge-flow active';
    d.flow.setAttribute('class', flowClass);

    let cardClass = 'card dep';
    if (failing) cardClass = 'card dep faulted';
    else if (congested) cardClass = 'card dep slow';
    if (name === selectedStation) cardClass += ' selected';
    d.card.setAttribute('class', cardClass);

    d.fire.setAttribute('opacity', failing ? 1 : 0);

    if (br) {
      d.badge.setAttribute('class', `badge ${br.state}`);
      d.badge.setAttribute('opacity', 1);
      d.badgeLabel.textContent = BREAKER_LABEL[br.state] || br.state;
    } else {
      d.badge.setAttribute('class', 'badge');
      d.badge.setAttribute('opacity', 0);
      d.badgeLabel.textContent = '';
    }
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
