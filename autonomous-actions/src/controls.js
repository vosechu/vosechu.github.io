import { Sim, effectiveRate } from './engine.js';
import { defaultConfig, MAX_TICK_MS } from './config.js';
import { makeRng } from './rng.js';
import { buildScene, render } from './render.js';
import { ACTS, actMeta } from './scenarios.js';
import { labelOf, colorOf, hoverOf, shortOf } from './theme.js';
import { rosterForAct, defaultStationForAct } from './topology.js';
import { STRINGS } from './strings.js';
import { TOUR_STEPS, initialTourState, tourReducer } from './tour.js';

const clock = { now: () => performance.now() };
const sim = new Sim({ clock, rng: makeRng(1), config: defaultConfig() });
// The full default target set, kept around so a later act (or Reset to
// defaults) can restore a station that an earlier act's roster removed.
// sim.config.targets narrows to the current act's roster (topology.js); the
// diagram is built once from the full set (buildScene) and hides rows whose
// id is missing from state.targets (render.js).
const DEFAULT_TARGETS = defaultConfig().targets;
const handle = buildScene(document.getElementById('stage'), { targets: DEFAULT_TARGETS }, (name) => selectStation(name));
const panel = document.getElementById('panel');

// Narrow sim.config.targets to exactly the ids in `roster`, preserving the
// DEFAULT_TARGETS key order (so the diagram rows stay in a stable order).
// Ids already present in sim.config.targets keep their live (player-tuned)
// values; ids newly revealed come back with their default values.
function applyRoster(roster) {
  const revealed = new Set(roster);
  const next = {};
  for (const name of Object.keys(DEFAULT_TARGETS)) {
    if (!revealed.has(name)) continue;
    next[name] = sim.config.targets[name] || DEFAULT_TARGETS[name];
  }
  sim.config.targets = next;
}

const plain = (v) => `${v}`;
const perSec = (v) => `${v}/s`;
const dur = (v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} s` : `${v} ms`);

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
  logSlider(parent, 'Front-door timeout', 100, 90000, sim.config.timeoutMs, dur,
    (v) => { sim.config.timeoutMs = v; handle.service.frontTimeout.textContent = dur(v); });
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


// Which per-station controls this act has unlocked for `name`, so the station
// block (buildControls) and the free-play per-station sections show the same
// matrix a given act would have revealed. Mirrors the act-gating that used to
// live inline in buildControls, generalized to any revealed station (including
// the core datastore, which no single act singles out).
function stationControlsFor(sec, name, actIndex) {
  latencySlider(sec, name);
  outgoingTimeoutSlider(sec, name);
  if (name === 'External') {
    errorRateSlider(sec, name);
    if (actIndex >= 2) breakerRow(sec, name);
    return;
  }
  breakerRow(sec, name);
  if (name === 'Service B' && actIndex >= 5) bulkheadSlider(sec, name);
}

// Progressive disclosure: each act keeps every knob unlocked by earlier acts and
// adds its own. Free play (the last act) unlocks the full matrix for every
// dependency. Reveal thresholds are 0-indexed act numbers.
function buildControls(actIndex) {
  const freePlay = actIndex >= ACTS.length - 1;
  // The pill is a config readout, not gated by which act has unlocked the
  // slider itself, so it stays in sync on every rebuild (act change, station
  // select, reset), independent of timeoutControl below.
  handle.service.frontTimeout.textContent = dur(sim.config.timeoutMs);
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
    for (const name of Object.keys(sim.config.targets)) {
      const sec = section(labelOf(name), false);
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
  // This block is persistent: it shows regardless of which station is selected.
  if (actIndex >= 2) {
    const sys = section('System', actIndex === 2);
    breakersToggle(sys);                           // the circuit-breaker act
    if (actIndex >= 5) bulkheadsToggle(sys);       // the bulkhead act
    if (actIndex >= 6) adaptiveToggle(sys);        // the adaptive-sizing act: all pools adaptive
    if (actIndex >= 3) workerPoolSlider(sys);      // saturation is in play from the Analytics act on
    if (actIndex >= 4) timeoutControl(sys);        // front-door timeout: the Reports load-shedding tradeoff
  }
  // Single station block: only the selected station's controls, gated by
  // whatever this act has unlocked for it. Only a revealed station can be
  // selected (see selectStation), so the section always has a real match.
  if (sim.config.targets[selectedStation]) {
    const sec = section(labelOf(selectedStation), true);
    stationControlsFor(sec, selectedStation, actIndex);
  }
}

// A collapsible section (native <details>) appended to the panel. `entering`
// plays the slide-and-flash reveal on the act a section first appears, so a
// newly unlocked block is obvious. Sections start open; the player can collapse
// any of them, which matters most in free play where every section shows at once.
function section(label, entering) {
  const sec = document.createElement('details');
  sec.className = entering ? 'section enter' : 'section';
  sec.open = true;
  const sum = document.createElement('summary');
  sum.textContent = label;
  sec.appendChild(sum);
  panel.appendChild(sec);
  return sec;
}

// Act progress dots
const progress = document.getElementById('progress');
const dots = ACTS.map((_, k) => {
  const d = document.createElement('span');
  d.className = 'dot';
  d.addEventListener('click', () => goToActNumber(k + 1));   // dots are 1-based act numbers
  progress.appendChild(d);
  return d;
});

const readoutElement = document.getElementById('readout');
let actIndex = 0;
let readoutVisible = false;
// The station whose block the panel shows. Defaults to the newest station the
// current act revealed; clicking a revealed node (render.js, via selectStation)
// overrides it until the next act change.
let selectedStation = defaultStationForAct(0);

// Select a station for the panel: only a revealed station may be selected (an
// unrevealed one has no entry in sim.config.targets, so buildControls would
// have nothing to show), rebuild the panel, and refresh the diagram's highlight.
function selectStation(name) {
  if (!sim.config.targets[name]) return;
  selectedStation = name;
  buildControls(actIndex);
  render(sim.getState(), handle, selectedStation);
}

// Guided tour: a pure reducer (tour.js) driving a welcome dialog (step 0) and
// three bubbles (steps 1-3), anchored at the bar, a station, and the panel.
// localStorage persists whether the tour has been seen; guarded so a
// non-browser environment (no localStorage) degrades to "not seen" rather
// than throwing.
const TOUR_SEEN_KEY = 'aa_tour_seen';
function readTourSeen() {
  try { return typeof localStorage !== 'undefined' && localStorage.getItem(TOUR_SEEN_KEY) === '1'; }
  catch { return false; }
}
function writeTourSeen() {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(TOUR_SEEN_KEY, '1'); }
  catch { /* ignore: storage may be unavailable (private mode, etc.) */ }
}

let tourState = initialTourState(readTourSeen());

const tourOverlay = document.getElementById('tour-overlay');
const tourWelcome = document.getElementById('tour-welcome');
const tourBubbles = {
  1: document.getElementById('tourbubble-bar'),
  2: document.getElementById('tourbubble-station'),
  3: document.getElementById('tourbubble-panel'),
};
const TOUR_BUBBLE_TEXT = {
  1: STRINGS.tour.bubbleBar,
  2: STRINGS.tour.bubbleStation,
  3: STRINGS.tour.bubblePanel,
};

function tourStepLabel(step) {
  return STRINGS.tour.step.replace('{n}', String(step + 1)).replace('{m}', String(TOUR_STEPS));
}

function dispatchTour(action) {
  tourState = tourReducer(tourState, action);
  if (tourState.seen) writeTourSeen();
  renderTour();
}

function renderTour() {
  tourOverlay.classList.toggle('hidden', !tourState.open);
  if (!tourState.open) return;
  const isWelcome = tourState.step === 0;
  tourWelcome.style.display = isWelcome ? '' : 'none';
  for (const [step, el] of Object.entries(tourBubbles)) {
    el.style.display = !isWelcome && Number(step) === tourState.step ? '' : 'none';
  }
  if (isWelcome) {
    document.getElementById('tour-welcome-text').textContent = STRINGS.tour.welcome;
    document.getElementById('tour-welcome-step').textContent = tourStepLabel(tourState.step);
  } else {
    const el = tourBubbles[tourState.step];
    el.querySelector('p').textContent = TOUR_BUBBLE_TEXT[tourState.step];
    el.querySelector('.tourstep').textContent = tourStepLabel(tourState.step);
    // The last step's advance button reads "Done" instead of "Next".
    const nextBtn = el.querySelector('.tour-next-btn');
    nextBtn.textContent = tourState.step >= TOUR_STEPS - 1 ? STRINGS.tour.buttons.done : STRINGS.tour.buttons.next;
  }
}

document.getElementById('tour-skip').textContent = STRINGS.tour.buttons.skip;
document.getElementById('tour-next').textContent = STRINGS.tour.buttons.next;
document.getElementById('tour-skip').addEventListener('click', () => dispatchTour({ type: 'skip' }));
document.getElementById('tour-next').addEventListener('click', () => dispatchTour({ type: 'next' }));
for (const btn of document.querySelectorAll('.tour-skip-btn')) {
  btn.textContent = STRINGS.tour.buttons.skip;
  btn.addEventListener('click', () => dispatchTour({ type: 'skip' }));
}
for (const btn of document.querySelectorAll('.tour-prev-btn')) {
  btn.textContent = STRINGS.tour.buttons.prev;
  // The reducer has no dedicated "prev" action; back one step by re-dispatching
  // from a state that is one step earlier. Bounded at step 0 by tourReducer's
  // own [0, TOUR_STEPS-1] invariant (next never goes below 0 to begin with, so
  // this mirrors that by clamping here).
  btn.addEventListener('click', () => {
    const target = Math.max(0, tourState.step - 1);
    tourState = { ...tourState, step: target };
    renderTour();
  });
}
for (const btn of document.querySelectorAll('.tour-rerun-btn')) {
  btn.textContent = STRINGS.tour.buttons.rerun;
  btn.addEventListener('click', () => dispatchTour({ type: 'open' }));
}
for (const btn of document.querySelectorAll('.tour-next-btn')) {
  btn.addEventListener('click', () => dispatchTour({ type: 'next' }));
}
renderTour();

// Acts never patch sim state directly (ACTS carries no `patch` field, see
// scenarios.test.js): the knobs stay however the player left them, and the
// instructions walk them into each scenario. The one exception is the
// topology, which is act-driven rather than player-driven, so controls.js
// applies rosterForAct's subset to config.targets here; the bottom bar always
// shows every metric, so it needs no per-act update.
function showAct(i) {
  actIndex = Math.max(0, Math.min(ACTS.length - 1, i));
  const meta = actMeta(actIndex);
  readoutVisible = meta.readoutVisible;
  applyRoster(rosterForAct(actIndex));
  selectedStation = defaultStationForAct(actIndex);
  document.getElementById('act-title').textContent = `${actIndex + 1}. ${meta.title}`;
  document.getElementById('act-instruction').textContent = meta.instruction ? `Try this: ${meta.instruction}` : '';
  document.getElementById('act-caption').textContent = meta.caption;
  dots.forEach((d, k) => { d.className = k === actIndex ? 'dot on' : 'dot'; });
  buildControls(actIndex);
  // Reflect the new roster's box visibility before measuring arrows: render()
  // sets display:none on rows/boxes outside the new act, and layoutEdges
  // (driven by relayout) skips edges whose endpoint is hidden. Without this
  // render() first, a relayout racing ahead of the next animation frame's
  // render() would still see last act's visibility and draw stale arrows.
  render(sim.getState(), handle, selectedStation);
  handle.relayout();
}

// The only preset: return every knob to the healthy baseline and clear the sim,
// staying on the current act. Resets to the CURRENT act's roster, not all four,
// so reset never re-reveals a station the act has not gotten to yet.
function resetToDefaults() {
  const roster = rosterForAct(actIndex);
  sim.config = defaultConfig();
  applyRoster(roster);
  sim.reset();
  buildControls(actIndex);
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
// Open calm: act 0 starts at rate 0 so the first screen is quiet rather than
// showing traffic already flowing through the one revealed station. This is a
// one-time override of defaultConfig()'s requestRatePerSec (which stays 20;
// the engine test 'arrivals occupy workers' depends on that default), applied
// only before the very first render. Later act changes never touch the rate;
// the player drives it from here on.
sim.config.requestRatePerSec = 0;
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
  render(state, handle, selectedStation);
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
