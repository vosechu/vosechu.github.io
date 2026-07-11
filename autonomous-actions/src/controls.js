import { Sim, effectiveRate } from './engine.js';
import { defaultConfig, MAX_TICK_MS } from './config.js';
import { makeRng } from './rng.js';
import { initRender, render } from './render.js';
import { ACTS, actMeta } from './scenarios.js';

const clock = { now: () => performance.now() };
const sim = new Sim({ clock, rng: makeRng(1), config: defaultConfig() });
const handle = initRender(document.getElementById('stage'), sim.config);
const panel = document.getElementById('panel');

const plain = (v) => `${v}`;
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
// One service-level toggle makes every dependency's bulkhead adaptive. Each learns
// its own floor from live traffic (the response time it sees with nothing queued),
// so a dependency whose queue grows sheds while the rest stay open.
function adaptiveToggle(parent) {
  const targets = sim.config.targets;
  const on = Object.values(targets).some((t) => t.adaptive && t.adaptive.enabled);
  toggle(parent, 'Adaptive pools', on, (checked) => {
    for (const name of Object.keys(targets)) {
      const t = targets[name];
      if (checked) {
        if (!t.adaptive) t.adaptive = { enabled: true, sampleWindowMs: 400, lastSampleMs: 0, floorMs: null };
        else { t.adaptive.enabled = true; t.adaptive.floorMs = null; }   // re-learn the floor on re-enable
      } else if (t.adaptive) {
        t.adaptive.enabled = false;
      }
    }
  });
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
  poolUIs[name] = slider(parent, 'pool size', 1, 60, 1, sim.config.targets[name].bulkheadSize, plain,
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
    const sys = section('System', false);
    breakersToggle(sys);
    bulkheadsToggle(sys);
    adaptiveToggle(sys);
    workerPoolSlider(sys);
    timeoutControl(sys);
    oscillationToggle(sys);
    littleSection(true);
    for (const name of Object.keys(sim.config.targets)) {
      const sec = section(labelOf(name), false, sim.config.targets[name].color);
      latencySlider(sec, name);
      outgoingTimeoutSlider(sec, name);
      errorRateSlider(sec, name);
      capacitySlider(sec, name);
      bulkheadSlider(sec, name);
      breakerRow(sec, name);
    }
    return;
  }
  // Global knobs live in a collapsible System section, unlocked as acts need them.
  if (actIndex >= 2) {
    const sys = section('System', actIndex === 2);
    breakersToggle(sys);                           // the circuit-breaker act
    if (actIndex >= 5) bulkheadsToggle(sys);       // the bulkhead act
    if (actIndex >= 6) adaptiveToggle(sys);        // the adaptive-sizing act: all pools adaptive
    if (actIndex >= 3) workerPoolSlider(sys);      // saturation is in play from the Analytics act on
    if (actIndex >= 4) timeoutControl(sys);        // front-door timeout: the Reports load-shedding tradeoff
  }
  littleSection(actIndex >= 4);                    // required-workers readout, opens at the saturation act
  // Service sections, focus service on top so its knobs stay at eye level.
  if (actIndex >= 4) {                             // Reports (the slow one): focus from its incident on
    const sec = section(labelOf('Service B'), actIndex === 4, sim.config.targets['Service B'].color);
    latencySlider(sec, 'Service B');
    outgoingTimeoutSlider(sec, 'Service B');
    breakerRow(sec, 'Service B');
    if (actIndex >= 5) bulkheadSlider(sec, 'Service B');
  }
  if (actIndex >= 3) {                             // Analytics (the fast one): focus of the timeout act
    const sec = section(labelOf('Service C'), actIndex === 3, sim.config.targets['Service C'].color);
    latencySlider(sec, 'Service C');
    outgoingTimeoutSlider(sec, 'Service C');
    breakerRow(sec, 'Service C');
  }
  if (actIndex >= 1) {                             // External: its errors, and (once breakers exist) its breaker
    const sec = section(labelOf('External'), actIndex === 1, sim.config.targets['External'].color);
    errorRateSlider(sec, 'External');
    if (actIndex >= 2) breakerRow(sec, 'External');
  }
}

// A collapsible section (native <details>) appended to the panel. `entering`
// plays the slide-and-flash reveal on the act a section first appears, so a
// newly unlocked block is obvious. Sections start open; the player can collapse
// any of them, which matters most in free play where every section shows at once.
function section(label, entering, color) {
  const sec = document.createElement('details');
  sec.className = entering ? 'section enter' : 'section';
  sec.open = true;
  // A color stripe ties the panel section to its service on the diagram. Kept as a
  // border (a UI element, not text) so it does not put low-contrast colored text on
  // the dark panel; the label stays high-contrast.
  if (color) { sec.style.borderLeft = `3px solid ${color}`; sec.style.paddingLeft = '8px'; }
  const sum = document.createElement('summary');
  sum.textContent = label;
  sec.appendChild(sum);
  panel.appendChild(sec);
  return sec;
}

// Little's Law as its own collapsible section: the required-workers readout,
// updated live by updateLittle. Opens at the saturation act; collapsible anytime.
function littleSection(open) {
  const sec = section("Little's Law (safe to ignore)", false);
  sec.open = open;
  const law = document.createElement('p');
  law.className = 'little-law';
  law.textContent = 'Workers you need = request rate × how long each request is held. The pool size is not part of the math; it is what you have to compare against.';
  const body = document.createElement('div');
  body.id = 'little-body';
  sec.appendChild(law);
  sec.appendChild(body);
}

// Act progress dots
const progress = document.getElementById('progress');
const dots = ACTS.map((_, k) => {
  const d = document.createElement('span');
  d.className = 'dot';
  d.title = `Go to act ${k + 1}`;
  d.addEventListener('click', () => goToActNumber(k + 1));
  progress.appendChild(d);
  return d;
});

const readoutElement = document.getElementById('readout');
let actIndex = 0;
let readoutVisible = false;

// Little's Law is a collapsible section in the controls panel (rebuilt per act by
// buildControls), so query its body fresh each frame rather than caching a stale ref.
function updateLittle(state) {
  const body = document.getElementById('little-body');
  if (!body) return;
  const rate = sim.config.requestRatePerSec;
  const req = state.required.workers;
  const holdMs = rate > 0 ? Math.round((req / rate) * 1000) : 0;
  const pool = state.workers.size;
  const over = req > pool;
  body.innerHTML =
    `<div class="eq">${rate}/s × ${holdMs} ms held = <b>at least ${req.toFixed(1)} workers</b> to serve this traffic</div>`
    + `<div class="have">You have <b>${pool}</b>. ${over ? 'Short by ' + (req - pool).toFixed(1) + ': requests are queueing.' : 'Enough, with room to spare.'}</div>`;
  body.className = over ? 'over' : '';
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

// The sim runs on a clamped clock: each frame advances it by at most MAX_TICK_MS
// of real time. A backgrounded tab or slept machine pauses requestAnimationFrame,
// and without this the next frame would jump the clock by the whole gap and inject
// rate*gap arrivals in a single tick, flooding the queue.
let simNowMs = null, lastFrameMs = null;
function frame() {
  const real = clock.now();
  simNowMs = simNowMs === null ? real : simNowMs + Math.min(real - lastFrameMs, MAX_TICK_MS);
  lastFrameMs = real;
  sim.tick(simNowMs);
  const state = sim.getState();
  render(state, handle);
  // When oscillation is on (and the slider is not being held), drive the rate
  // thumb from the current effective rate so the traffic is visibly breathing.
  const osc = sim.config.loadOscillation;
  if (rateUI && osc.enabled) {
    const eff = Math.round(effectiveRate(sim.config.requestRatePerSec, osc, simNowMs));
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
  // With every pool adaptive, surface the most-throttled one (smallest pool), so the
  // readout tracks whichever dependency is currently being shed.
  const adaptiveNames = Object.keys(sim.config.targets).filter(
    (n) => sim.config.targets[n].adaptive && sim.config.targets[n].adaptive.enabled);
  const adaptiveName = adaptiveNames.sort(
    (a, b) => sim.config.targets[a].bulkheadSize - sim.config.targets[b].bulkheadSize)[0];
  if (readoutVisible && adaptiveName) {
    const t = sim.config.targets[adaptiveName];
    const a = t.adaptive;
    const decision = a.decision || 'steady';
    readoutElement.textContent = `${labelOf(adaptiveName)} pool ${t.bulkheadSize}/${sim.config.workerPoolSize} · latency ${dur(Math.round(a.observedMs || 0))} vs floor ${dur(Math.round(a.floorMs || 0))} · ${decision}`;
  } else {
    readoutElement.textContent = '';
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Exposed for the guided tour and any external harness.
export { sim, handle };
