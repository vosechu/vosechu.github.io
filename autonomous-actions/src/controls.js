import { Sim, effectiveRate } from './engine.js';
import { defaultConfig, ADAPTIVE_MAX } from './config.js';
import { makeRng } from './rng.js';
import { initRender, render } from './render.js';
import { ACTS, actMeta } from './scenarios.js';

const clock = { now: () => performance.now() };
const sim = new Sim({ clock, rng: makeRng(1), config: defaultConfig() });
const handle = initRender(document.getElementById('stage'), sim.config);
const panel = document.getElementById('panel');

const ms = (v) => `${v} ms`;
const plain = (v) => `${v}`;
const pct = (v) => `${v}%`;
const perSec = (v) => `${v}/s`;
const dur = (v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} s` : `${v} ms`);
const labelOf = (name) => sim.config.targets[name].label || name;

// Append a labelled row (label + live value + the given input) to a parent.
function control(parent, label, input, fmt, value) {
  const wrap = document.createElement('label'); wrap.className = 'control';
  const lab = document.createElement('span'); lab.className = 'lab';
  const nm = document.createElement('span'); nm.textContent = label;
  const val = document.createElement('b'); val.textContent = fmt(value);
  lab.appendChild(nm); lab.appendChild(val);
  wrap.appendChild(lab); wrap.appendChild(input);
  parent.appendChild(wrap);
  return val;
}

function slider(parent, label, min, max, step, value, fmt, onInput, hooks = {}) {
  const input = document.createElement('input');
  Object.assign(input, { type: 'range', min, max, step, value });
  const val = control(parent, label, input, fmt, value);
  input.addEventListener('input', () => { const v = Number(input.value); val.textContent = fmt(v); onInput(v); });
  if (hooks.onGrab) input.addEventListener('pointerdown', hooks.onGrab);
  if (hooks.onRelease) { input.addEventListener('pointerup', hooks.onRelease); input.addEventListener('pointercancel', hooks.onRelease); }
  return { input, val };
}

// A log-scaled slider: the input runs 0..1000 evenly, mapped onto [min, max]
// logarithmically, so the low end is easy to set while the far end stays reachable.
function logSlider(parent, label, min, max, value, fmt, onInput) {
  const steps = 1000;
  const lmin = Math.log(min), lmax = Math.log(max);
  const toVal = (p) => Math.round(Math.exp(lmin + (lmax - lmin) * (p / steps)));
  const toPos = (v) => Math.round(((Math.log(Math.max(min, v)) - lmin) / (lmax - lmin)) * steps);
  const input = document.createElement('input');
  Object.assign(input, { type: 'range', min: 0, max: steps, step: 1, value: toPos(value) });
  const val = control(parent, label, input, fmt, value);
  input.addEventListener('input', () => { const v = toVal(Number(input.value)); val.textContent = fmt(v); onInput(v); });
}

function toggle(parent, label, checked, onChange) {
  const wrap = document.createElement('label'); wrap.className = 'control toggle';
  const nm = document.createElement('span'); nm.textContent = label;
  const input = document.createElement('input'); Object.assign(input, { type: 'checkbox', checked });
  input.addEventListener('change', () => onChange(input.checked));
  wrap.appendChild(nm); wrap.appendChild(input);
  parent.appendChild(wrap);
}

function heading(parent, text) {
  const h = document.createElement('div'); h.className = 'ctlgroup'; h.textContent = text;
  parent.appendChild(h);
}

// The rate slider doubles as the sine's center. Grabbing it freezes oscillation
// so the drag controls the rate directly; releasing resumes the sine from that
// value (phaseRef = now, so sin starts at 0) rather than snapping to the old phase.
let oscWasOn = false;
let rateUI = null;   // the request-rate slider input + value label, so the frame loop can animate it
let poolUIs = {};    // per-service bulkhead pool sliders, so adaptive can drive and lock them
function rateSlider(parent) {
  const osc = sim.config.loadOscillation;
  rateUI = slider(parent, 'Request rate', 1, 200, 1, sim.config.requestRatePerSec, perSec,
    (v) => { sim.config.requestRatePerSec = v; },
    {
      onGrab: () => { oscWasOn = osc.enabled; osc.enabled = false; },
      onRelease: () => { if (oscWasOn) { osc.phaseRef = clock.now(); osc.enabled = true; } oscWasOn = false; },
    });
}
function workerPoolSlider(parent) {
  slider(parent, 'Worker pool', 1, 60, 1, sim.config.workerPoolSize, plain, (v) => { sim.config.workerPoolSize = v; });
}
function timeoutControl(parent) {
  logSlider(parent, 'Front-door timeout', 100, 90000, sim.config.timeoutMs, dur, (v) => { sim.config.timeoutMs = v; });
}
function bulkheadsToggle(parent) {
  toggle(parent, 'Bulkheads', sim.config.bulkheadsEnabled, (on) => { sim.config.bulkheadsEnabled = on; });
}
// One service-level toggle enables an independent breaker on every callee. Each
// still trips on its own error count, so only a failing dependency opens.
function breakersToggle(parent) {
  const targets = sim.config.targets;
  const on = Object.values(targets).some((t) => t.breaker && t.breaker.enabled);
  toggle(parent, 'Breakers', on, (checked) => {
    for (const name of Object.keys(targets)) {
      const t = targets[name];
      if (checked) {
        if (!t.breaker) t.breaker = { enabled: true, errorThreshold: 5, windowMs: 1000, cooldownMs: 5000,
          state: 'closed', openedAtMs: null, errorTimestamps: [], probeInFlight: false };
        else t.breaker.enabled = true;
      } else if (t.breaker) {
        t.breaker.enabled = false;
      }
    }
  });
}
function adaptiveToggle(parent, name) {
  const t = sim.config.targets[name];
  if (!t.adaptive) t.adaptive = { enabled: false, sampleWindowMs: 400, baselineLatencyMs: 50, lastSampleMs: 0 };
  toggle(parent, 'adaptive pool', t.adaptive.enabled, (on) => { t.adaptive.enabled = on; });
}
function oscillationToggle(parent) {
  const osc = sim.config.loadOscillation;
  toggle(parent, 'Load oscillation', osc.enabled, (on) => {
    if (on) { osc.phaseRef = clock.now(); }
    else if (rateUI) { rateUI.input.value = String(sim.config.requestRatePerSec); rateUI.val.textContent = perSec(sim.config.requestRatePerSec); }
    osc.enabled = on;
  });
}

// Progressive disclosure: reveal a metric chip only once the act it belongs to
// makes it meaningful. ok/s and err/s are always up; latency and the worker
// queue appear with the slow-failure act; rejects appear with bulkheads.
function revealMetrics(actIndex) {
  const show = (id, on) => { const el = document.getElementById(id); if (el) el.style.display = on ? '' : 'none'; };
  show('chip-ok', true);
  show('chip-err', true);
  show('chip-p95', true);            // an SLO metric, shown alongside availability from the start
  show('chip-deg', actIndex >= 2);   // degraded responses appear once a breaker can contain a failure
  show('chip-q', actIndex >= 3);
  show('chip-rej', actIndex >= 5);
}

// Per-service sliders sit under the service's heading, so the labels drop the
// service name.
function latencySlider(parent, name) {
  logSlider(parent, 'latency', 10, 10000, sim.config.targets[name].latencyMs, dur,
    (v) => { sim.config.targets[name].latencyMs = v; });
}
function outgoingTimeoutSlider(parent, name) {
  logSlider(parent, 'outgoing timeout', 100, 90000, sim.config.targets[name].timeoutMs, dur,
    (v) => { sim.config.targets[name].timeoutMs = v; });
}
// Error rate is log-scaled so 0.1% and 100% are both reachable, with position 0
// meaning off. A small error rate matters (it can still breach the SLO), so the
// low end needs real resolution.
function errorRateSlider(parent, name) {
  const t = sim.config.targets[name];
  const STEPS = 1000, MIN = 0.1, MAX = 100;   // percent
  const lmin = Math.log(MIN), lspan = Math.log(MAX) - lmin;
  const toPct = (pos) => (pos <= 0 ? 0 : Math.exp(lmin + lspan * ((pos - 1) / (STEPS - 1))));
  const toPos = (pct) => (pct < MIN ? 0 : 1 + Math.round(((Math.log(pct) - lmin) / lspan) * (STEPS - 1)));
  const fmt = (pct) => (pct === 0 ? 'off' : pct < 1 ? `${pct.toFixed(2)}%` : `${Math.round(pct)}%`);
  const input = document.createElement('input');
  Object.assign(input, { type: 'range', min: 0, max: STEPS, step: 1, value: toPos(t.errorRate * 100) });
  const val = control(parent, 'error rate', input, fmt, t.errorRate * 100);
  input.addEventListener('input', () => { const p = toPct(Number(input.value)); val.textContent = fmt(p); t.errorRate = p / 100; });
}
function capacitySlider(parent, name) {
  slider(parent, 'capacity', 1, 60, 1, sim.config.targets[name].capacity, plain,
    (v) => { sim.config.targets[name].capacity = v; });
}
function bulkheadSlider(parent, name) {
  poolUIs[name] = slider(parent, 'pool size', 1, 24, 1, sim.config.targets[name].bulkheadSize, plain,
    (v) => { sim.config.targets[name].bulkheadSize = v; });
}
// Per-callee breaker tuning on one compact line: a trip count next to the window
// it is measured over. On/off is the service-level Breakers toggle, not here.
function breakerRow(parent, name) {
  const t = sim.config.targets[name];
  if (!t.breaker) t.breaker = { enabled: false, errorThreshold: 5, windowMs: 1000, cooldownMs: 5000,
    state: 'closed', openedAtMs: null, errorTimestamps: [], probeInFlight: false };
  const br = t.breaker;
  const row = document.createElement('div'); row.className = 'ctlrow';
  slider(row, 'num errors', 1, 200, 1, br.errorThreshold, plain, (v) => { br.errorThreshold = v; });
  logSlider(row, 'per time', 1000, 60000, br.windowMs, dur, (v) => { br.windowMs = v; });
  parent.appendChild(row);
}


// Progressive disclosure: each act keeps every knob unlocked by earlier acts and
// adds its own. Free play (the last act) unlocks the full matrix for every
// dependency. Reveal thresholds are 0-indexed act numbers.
function buildControls(actIndex) {
  const freePlay = actIndex >= ACTS.length - 1;
  panel.textContent = '';
  poolUIs = {};
  const header = document.createElement('div'); header.className = 'panelhead';
  const h2 = document.createElement('h2'); h2.textContent = freePlay ? 'Controls (free play)' : 'Controls';
  const reset = document.createElement('button'); reset.className = 'reset'; reset.textContent = 'Reset to defaults';
  reset.addEventListener('click', resetToDefaults);
  header.appendChild(h2); header.appendChild(reset);
  panel.appendChild(header);
  rateSlider(panel);
  if (freePlay) {
    breakersToggle(panel);
    bulkheadsToggle(panel);
    workerPoolSlider(panel);
    timeoutControl(panel);
    oscillationToggle(panel);
    for (const name of Object.keys(sim.config.targets)) {
      heading(panel, labelOf(name));
      latencySlider(panel, name);
      outgoingTimeoutSlider(panel, name);
      errorRateSlider(panel, name);
      capacitySlider(panel, name);
      bulkheadSlider(panel, name);
      adaptiveToggle(panel, name);
      breakerRow(panel, name);
    }
    return;
  }
  // Global knobs, unlocked as each act needs them.
  if (actIndex >= 2) breakersToggle(panel);      // the circuit-breaker act
  if (actIndex >= 5) bulkheadsToggle(panel);     // the bulkhead act
  if (actIndex >= 3) workerPoolSlider(panel);    // saturation is in play from the Analytics act on
  if (actIndex >= 4) timeoutControl(panel);      // front-door timeout: the load-shedding tradeoff in the Reports act
  // Service sections, focus service on top so its knobs stay at eye level. Each
  // gets the enter animation on the act that first reveals it.
  if (actIndex >= 4) {                           // Reports (the slow one): focus from its incident on
    const sec = section(actIndex === 4);
    heading(sec, labelOf('Service B'));
    latencySlider(sec, 'Service B');
    outgoingTimeoutSlider(sec, 'Service B');
    breakerRow(sec, 'Service B');
    if (actIndex >= 5) bulkheadSlider(sec, 'Service B');
    if (actIndex >= 6) adaptiveToggle(sec, 'Service B');
  }
  if (actIndex >= 3) {                           // Analytics (the fast one): focus of the timeout act
    const sec = section(actIndex === 3);
    heading(sec, labelOf('Service C'));
    latencySlider(sec, 'Service C');
    outgoingTimeoutSlider(sec, 'Service C');
    breakerRow(sec, 'Service C');
  }
  if (actIndex >= 1) {                           // External: its errors, and (once breakers exist) its breaker
    const sec = section(actIndex === 1);
    heading(sec, labelOf('External'));
    errorRateSlider(sec, 'External');
    if (actIndex >= 2) breakerRow(sec, 'External');
  }
}

// A service block wrapper appended to the panel; `entering` plays the reveal
// animation the first time that service appears.
function section(entering) {
  const sec = document.createElement('div');
  sec.className = entering ? 'section enter' : 'section';
  panel.appendChild(sec);
  return sec;
}

// Act progress dots
const progress = document.getElementById('progress');
const dots = ACTS.map(() => {
  const d = document.createElement('span');
  d.className = 'dot';
  progress.appendChild(d);
  return d;
});

const readoutElement = document.getElementById('readout');
const littlePanel = document.getElementById('little');
const littleBody = document.getElementById('little-body');
let actIndex = 0;
let readoutVisible = false;

// Little's Law lives in its own collapsible panel on the diagram, not the tour
// readout. It is always available; the Reports-slows act (index 4) is where
// required workers first blow past the pool, so it springs open there.
function updateLittle(state) {
  if (!littleBody) return;
  const rate = sim.config.requestRatePerSec;
  const req = state.required.workers;
  const holdMs = rate > 0 ? Math.round((req / rate) * 1000) : 0;
  const pool = state.workers.size;
  const over = req > pool;
  littleBody.innerHTML =
    `<div class="eq">${rate}/s × ${holdMs} ms held = <b>at least ${req.toFixed(1)} workers</b> to serve this traffic</div>`
    + `<div class="have">You have <b>${pool}</b>. ${over ? 'Short by ' + (req - pool).toFixed(1) + ': requests are queueing.' : 'Enough, with room to spare.'}</div>`;
  littleBody.className = over ? 'over' : '';
}

// Acts never touch the sim: the state stays however the player left it, and the
// instructions walk them into each scenario. Changing acts only updates the
// guide text, the unlocked controls, and the visible metrics.
function showAct(i) {
  actIndex = Math.max(0, Math.min(ACTS.length - 1, i));
  const meta = actMeta(actIndex);
  readoutVisible = meta.readoutVisible;
  document.getElementById('act-title').textContent = `${actIndex + 1}. ${meta.title}`;
  document.getElementById('act-instruction').textContent = meta.instruction ? `Try this: ${meta.instruction}` : '';
  document.getElementById('act-caption').textContent = meta.caption;
  dots.forEach((d, k) => { d.className = k === actIndex ? 'dot on' : 'dot'; });
  buildControls(actIndex);
  revealMetrics(actIndex);
  if (littlePanel && actIndex === 4) littlePanel.open = true;   // the saturation act opens Little's Law
}

// The only preset: return every knob to the healthy baseline and clear the sim,
// staying on the current act.
function resetToDefaults() {
  sim.config = defaultConfig();
  sim.reset();
  buildControls(actIndex);
  revealMetrics(actIndex);
}

// Reflect the current act in the URL hash (#1..#8) so the browser Back and
// Forward buttons move between acts. This is static-host friendly and works on
// GitHub Pages with no routing config: the server ignores the hash, and one
// hashchange handler is the single path that renders, so the in-app buttons and
// the browser buttons behave identically.
function actFromHash() {
  const n = parseInt((location.hash || '').replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n - 1 : 0;
}
function goToActNumber(num) {
  location.hash = `#${Math.max(1, Math.min(ACTS.length, num))}`;   // hashchange renders
}
window.addEventListener('hashchange', () => showAct(actFromHash()));
document.getElementById('next').addEventListener('click', () => goToActNumber(actIndex + 2));
document.getElementById('back').addEventListener('click', () => goToActNumber(actIndex));
showAct(actFromHash());

function frame() {
  sim.tick(clock.now());
  const state = sim.getState();
  render(state, handle);
  // When oscillation is on (and the slider is not being held), drive the rate
  // thumb from the current effective rate so the traffic is visibly breathing.
  const osc = sim.config.loadOscillation;
  if (rateUI && osc.enabled) {
    const eff = Math.round(effectiveRate(sim.config.requestRatePerSec, osc, clock.now()));
    rateUI.input.value = String(eff);
    rateUI.val.textContent = perSec(eff);
  }
  // Adaptive services drive and lock their own pool slider, so control is visibly
  // handed over: the thumb moves on its own and can no longer be dragged.
  for (const name of Object.keys(sim.config.targets)) {
    const ui = poolUIs[name];
    if (!ui) continue;
    const a = sim.config.targets[name].adaptive;
    const driven = !!(a && a.enabled && sim.config.bulkheadsEnabled);
    ui.input.disabled = driven;
    if (driven) {
      const size = sim.config.targets[name].bulkheadSize;
      ui.input.value = String(size);
      ui.val.textContent = plain(size);
    }
  }
  updateLittle(state);
  // The tour readout now carries only the adaptive-sizing line: the live pool and
  // the latency signal driving it.
  const adaptiveName = Object.keys(sim.config.targets).find(
    (n) => sim.config.targets[n].adaptive && sim.config.targets[n].adaptive.enabled);
  if (readoutVisible && adaptiveName) {
    const t = sim.config.targets[adaptiveName];
    const a = t.adaptive;
    const decision = a.target < t.bulkheadSize ? 'shedding' : a.target > t.bulkheadSize ? 'opening up' : 'steady';
    readoutElement.textContent = `${labelOf(adaptiveName)} pool ${t.bulkheadSize}/${ADAPTIVE_MAX} · observed ${dur(Math.round(a.observedMs || 0))} vs ${a.baselineLatencyMs} ms baseline · ${decision}`;
  } else {
    readoutElement.textContent = '';
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Exposed for the guided tour and any external harness.
export { sim, handle };
