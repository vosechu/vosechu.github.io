# Act-Aware Tour and Vocabulary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the sim's copy self-explaining (control-name chips that provably match the panel, glossary hover tooltips) and the guided tour act-aware (five anchored steps, what's-new bubbles per act, red dot for skippers).

**Architecture:** Copy in `strings.js` embeds `{{Control label}}` and `[[term]]` tokens; a pure `src/copy.js` parses them into segments and DOM glue renders spans. `tour.js` stays a pure reducer, gaining a `skipped` flag and a per-act new-controls map. `controls.js` renders the five steps into ONE reusable bubble positioned by measuring its anchor when the step opens.

**Tech Stack:** Buildless vanilla ES modules, `node:test` + `node:assert/strict`, plain DOM/CSS. No new dependencies.

**Design spec:** `docs/superpowers/specs/2026-07-11-act-aware-tour-design.md`

## Global Constraints

- Buildless: no build step, no new dependencies. Tests run with `npm test` from `autonomous-actions/`.
- No em dashes anywhere; the only non-ASCII allowed is the existing `∞` and the pre-existing 🔥.
- Engine ids `'Database A'`, `'Service B'`, `'Service C'`, `'External'` are stable keys; only display values change.
- Hot-path rule: the per-frame `render()` path is untouched. All bubble measuring happens on step-open, what's-new-open, or window resize.
- `strings.js` is the single edit surface for all user-facing copy. No hardcoded copy in JS.
- Do not modify any test containing an `// AI-DEV` marker (none exist in the touched files today; the rule stands).
- Control LABELS do not change; the copy changes to match them.
- Work happens on a branch named `act-aware-tour` created from master; the spec/plan docs are its first commit.

## File Structure

- `src/copy.js` (new, pure): `parseCopy`, `glossaryDef`. No DOM.
- `test/copy.test.js` (new): parser and glossary lookup tests.
- `test/strings.test.js` (new): token-resolution invariants over all of STRINGS.
- `src/strings.js`: adds `controls` and `glossary` blocks; act/tour copy audited to tokens; `tour.whatsNew` added; tour step copy for 5 steps.
- `src/tour.js`: TOUR_STEPS 4 -> 5; state gains `skipped`; `NEW_CONTROLS_BY_ACT` export.
- `test/tour.test.js`: updated for the new state shape plus new transitions.
- `src/controls.js`: reads labels from `STRINGS.controls`; renders copy through `parseCopy`; five-step tour with dynamic anchoring; what's-new bubble; red dot; skip persistence.
- `index.html`: one reusable tour bubble replaces the three fixed ones; `#whatsnew` element; `.term`/`.ctl`/`.dot` CSS.

---

## PR1: Copy foundations (no visible change)

### Task 1: `STRINGS.controls` + `STRINGS.glossary`, controls.js reads labels

**Files:**
- Modify: `src/strings.js` (add two blocks)
- Modify: `src/controls.js` (replace hardcoded label literals)
- Test: `test/strings.test.js` (new)

**Interfaces:**
- Produces: `STRINGS.controls` (map of camelCase key -> exact label string) and `STRINGS.glossary` (map of lowercase term -> definition). Later tasks rely on these names verbatim.

- [ ] **Step 1: Write the failing test**

Create `test/strings.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../src/strings.js';

// Walk every string value in STRINGS (any nesting).
function collectStrings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (node && typeof node === 'object') for (const v of Object.values(node)) collectStrings(v, out);
  return out;
}
const all = collectStrings(STRINGS);
const chipTokens = all.flatMap((s) => [...s.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]));
const termTokens = all.flatMap((s) => [...s.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]));

test('STRINGS.controls exists and every label is a nonempty string', () => {
  const labels = Object.values(STRINGS.controls);
  assert.ok(labels.length >= 14);
  for (const l of labels) assert.ok(typeof l === 'string' && l.length > 0);
});

test('STRINGS.glossary exists with lowercase keys and nonempty definitions', () => {
  const entries = Object.entries(STRINGS.glossary);
  assert.ok(entries.length >= 12);
  for (const [k, v] of entries) {
    assert.equal(k, k.toLowerCase(), `glossary key "${k}" must be lowercase`);
    assert.ok(typeof v === 'string' && v.length > 0);
  }
});

test('every {{chip}} in STRINGS names a real control label, exactly', () => {
  const labels = new Set(Object.values(STRINGS.controls));
  for (const chip of chipTokens) assert.ok(labels.has(chip), `chip {{${chip}}} has no matching control label`);
});

test('every [[term]] in STRINGS resolves to a glossary entry (case-insensitive)', () => {
  for (const term of termTokens) {
    assert.ok(Object.hasOwn(STRINGS.glossary, term.toLowerCase()), `term [[${term}]] missing from glossary`);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL. `STRINGS.controls` is undefined (TypeError in `Object.values`).

- [ ] **Step 3: Add the two blocks to `src/strings.js`**

Insert after the `ui:` block, before the closing `};`:

```js
  // Exact labels of every player-facing control in the right panel. controls.js
  // reads these, and copy references them as {{chips}}; test/strings.test.js
  // enforces that every chip matches one of these values exactly, so the
  // instructions can never drift from the panel again.
  controls: {
    requestRate: 'Request rate',
    workerPool: 'Worker pool',
    frontDoorTimeout: 'Front-door timeout',
    breakers: 'Breakers',
    bulkheads: 'Bulkheads',
    adaptivePools: 'Adaptive pools',
    oscillation: 'Load oscillation',
    latency: 'latency',
    outgoingTimeout: 'outgoing timeout',
    errorRate: 'error rate',
    capacity: 'capacity',
    poolSize: 'pool size',
    numErrors: 'num errors',
    perTime: 'per time',
  },

  // Definitions behind [[term]] tokens in copy: hover (or focus) a dotted
  // underline anywhere in instructions, captions, or the tour and one of
  // these appears. Keys are lowercase; lookup is case-insensitive. Telemetry
  // voice: plain, literal, one or two sentences.
  glossary: {
    'slo': 'The service level objective: the promise this service is graded on. Here: 99 of every 100 requests succeed, and the slowest 5% finish in under 5 seconds.',
    'worker': 'One unit of concurrency in our service. Each request holds a worker until every dependency answers or times out; when all workers are busy, new requests wait in the queue.',
    'dependency': 'A service ours must call to answer a request. Every request here fans out to all of them at once.',
    'queue': 'Requests waiting for a free worker. A growing queue means work is arriving faster than it is finishing.',
    'breaker': 'A circuit breaker watches a dependency for errors and, after enough failures, stops calling it for a while: fail fast now, retest later.',
    'bulkhead': 'A cap on how many of our workers one dependency may hold at once, so a slow dependency cannot drag every worker down with it.',
    'connection pool': 'The outbound connections our service may hold to one dependency. Each in-flight call occupies one.',
    'timeout': 'The longest we will wait on a call before giving up and taking the worker back.',
    'adaptive pool': 'A bulkhead that sizes itself: it learns a dependency\'s normal response time and sheds load only when its queue grows.',
    'wait': 'How long a request takes start to finish. The scoreboard tracks the slowest 5% of requests (the p95).',
    'throughput': 'Requests served per second.',
    'rejects': 'Requests a bulkhead turned away immediately instead of letting them wait for a slow dependency.',
  },
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS (all four new tests; chip/term tests pass vacuously, no tokens exist yet).

- [ ] **Step 5: Point `controls.js` at the labels**

Replace each hardcoded label literal with its `STRINGS.controls` read (the surrounding code is untouched):

- `rateSlider`: `control(parent, 'Request rate', ...)` -> `control(parent, STRINGS.controls.requestRate, ...)`
- `workerPoolSlider`: `'Worker pool'` -> `STRINGS.controls.workerPool`
- `timeoutControl`: `'Front-door timeout'` -> `STRINGS.controls.frontDoorTimeout`
- `bulkheadsToggle`: `'Bulkheads'` -> `STRINGS.controls.bulkheads`
- `breakersToggle`: `'Breakers'` -> `STRINGS.controls.breakers`
- `adaptiveToggle`: `'Adaptive pools'` -> `STRINGS.controls.adaptivePools`
- `oscillationToggle`: `'Load oscillation'` -> `STRINGS.controls.oscillation`
- `latencySlider`: `'latency'` -> `STRINGS.controls.latency`
- `outgoingTimeoutSlider`: `'outgoing timeout'` -> `STRINGS.controls.outgoingTimeout`
- `errorRateSlider`: `'error rate'` -> `STRINGS.controls.errorRate`
- `capacitySlider`: `'capacity'` -> `STRINGS.controls.capacity`
- `bulkheadSlider`: `'pool size'` -> `STRINGS.controls.poolSize`
- `breakerRow`: `'num errors'` -> `STRINGS.controls.numErrors`, `'per time'` -> `STRINGS.controls.perTime`

- [ ] **Step 6: Run the full suite and syntax checks**

Run: `npm test` then `node --check src/controls.js && node --check src/strings.js`
Expected: PASS / clean. Serve locally, hard reload, confirm the panel labels read exactly as before.

- [ ] **Step 7: Commit**

```bash
git add src/strings.js src/controls.js test/strings.test.js
git commit -m "feat(sim): add STRINGS.controls and glossary; controls read labels from strings"
```

### Task 2: `src/copy.js` pure parser

**Files:**
- Create: `src/copy.js`
- Test: `test/copy.test.js`

**Interfaces:**
- Consumes: `STRINGS.glossary` from Task 1.
- Produces: `parseCopy(str) -> [{ type: 'text'|'term'|'ctl', value: string }]` and `glossaryDef(term) -> string|null`. Task 3 renders these segments.

- [ ] **Step 1: Write the failing tests**

Create `test/copy.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCopy, glossaryDef } from '../src/copy.js';

test('plain text passes through as one text segment', () => {
  assert.deepEqual(parseCopy('No tokens here.'), [{ type: 'text', value: 'No tokens here.' }]);
});

test('a {{chip}} splits into text, ctl, text', () => {
  assert.deepEqual(parseCopy('Turn on {{Breakers}} now'), [
    { type: 'text', value: 'Turn on ' },
    { type: 'ctl', value: 'Breakers' },
    { type: 'text', value: ' now' },
  ]);
});

test('a [[term]] becomes a term segment keeping its casing', () => {
  assert.deepEqual(parseCopy('within the [[SLO]].'), [
    { type: 'text', value: 'within the ' },
    { type: 'term', value: 'SLO' },
    { type: 'text', value: '.' },
  ]);
});

test('adjacent tokens produce no empty text segments', () => {
  assert.deepEqual(parseCopy('{{Breakers}}[[breaker]]'), [
    { type: 'ctl', value: 'Breakers' },
    { type: 'term', value: 'breaker' },
  ]);
});

test('malformed tokens render as plain text, never throw', () => {
  assert.deepEqual(parseCopy('a {{b [[c'), [{ type: 'text', value: 'a {{b [[c' }]);
});

test('glossaryDef is case-insensitive and null for unknown terms', () => {
  assert.equal(typeof glossaryDef('SLO'), 'string');
  assert.equal(glossaryDef('slo'), glossaryDef('SLO'));
  assert.equal(glossaryDef('flux capacitor'), null);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL. Cannot import from `../src/copy.js` (module does not exist).

- [ ] **Step 3: Write the implementation**

Create `src/copy.js`:

```js
// copy.js
// Pure parser for the two copy tokens strings.js may embed:
//   [[term]]  - a glossary term; renders as a dotted-underline hover.
//   {{label}} - a control chip; must equal a right-panel control label
//               exactly (test/strings.test.js enforces this).
// parseCopy splits a string into segments; DOM glue (controls.js) turns
// segments into spans. Malformed tokens simply fail to match and pass
// through as plain text: this module never throws on copy.

import { STRINGS } from './strings.js';

const TOKEN = /\[\[([^\]]+)\]\]|\{\{([^}]+)\}\}/g;

export function parseCopy(str) {
  const out = [];
  let last = 0;
  for (const m of str.matchAll(TOKEN)) {
    if (m.index > last) out.push({ type: 'text', value: str.slice(last, m.index) });
    if (m[1] != null) out.push({ type: 'term', value: m[1] });
    else out.push({ type: 'ctl', value: m[2] });
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push({ type: 'text', value: str.slice(last) });
  return out;
}

// Definition for a [[term]], case-insensitive; null when the glossary has no
// entry (the strings test keeps that from shipping, this keeps it from throwing).
export function glossaryDef(term) {
  return STRINGS.glossary[term.toLowerCase()] ?? null;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS (all copy tests plus the whole suite).

- [ ] **Step 5: Commit**

```bash
git add src/copy.js test/copy.test.js
git commit -m "feat(sim): add pure copy-token parser (chips and glossary terms)"
```

---

## PR2: Rich copy rendering (visible highlighting)

### Task 3: Render instructions and captions through `parseCopy`

**Files:**
- Modify: `src/controls.js` (add `renderCopyInto`; use it in `showAct`)
- Modify: `index.html` (`.term` / `.ctl` CSS)

**Interfaces:**
- Consumes: `parseCopy`, `glossaryDef` from `./copy.js`.
- Produces: `renderCopyInto(el, str)` in controls.js; Task 5's tour rendering reuses it.

- [ ] **Step 1: Add the renderer to `controls.js`**

Add the import and the helper (near the other helpers):

```js
import { parseCopy, glossaryDef } from './copy.js';

// Render tokenized copy into an element: plain text nodes, {{chips}} as .ctl
// spans, [[terms]] as focusable .term spans carrying their glossary tip.
function renderCopyInto(el, str) {
  el.textContent = '';
  for (const seg of parseCopy(str)) {
    if (seg.type === 'text') { el.appendChild(document.createTextNode(seg.value)); continue; }
    const span = document.createElement('span');
    span.textContent = seg.value;
    if (seg.type === 'ctl') { span.className = 'ctl'; }
    else {
      span.className = 'term';
      span.tabIndex = 0;
      const tip = document.createElement('span');
      tip.className = 'tip';
      tip.textContent = glossaryDef(seg.value) ?? '';
      span.appendChild(tip);
    }
    el.appendChild(span);
  }
}
```

In `showAct(i)`, replace the two `textContent` assignments for instruction and caption:

```js
  renderCopyInto(document.getElementById('act-instruction'),
    meta.instruction ? `${STRINGS.ui.tryThis} ${meta.instruction}` : '');
  renderCopyInto(document.getElementById('act-caption'), meta.caption);
```

- [ ] **Step 2: Add the CSS to `index.html`**

Next to the existing `.info .tip` rules:

```css
    /* Tokenized copy: [[terms]] are dotted-underline glossary hovers (same
       tip visual as the bar's info hovers); {{chips}} echo a control label. */
    .term { position: relative; text-decoration: underline dotted; text-underline-offset: 2px; cursor: help; }
    .term .tip {
      display: none; position: absolute; bottom: 140%; left: 50%; transform: translateX(-50%);
      width: 240px; background: var(--panel-solid); border: 1px solid var(--border); border-radius: 8px;
      padding: 8px 10px; font-size: 11px; font-weight: 400; color: var(--ink); line-height: 1.45; z-index: 70;
    }
    .term:hover .tip, .term:focus .tip { display: block; }
    .ctl {
      font-size: 0.85em; font-weight: 650; padding: 0 0.35em; white-space: nowrap;
      border: 1px solid var(--border); border-radius: 0.5em; background: var(--panel);
    }
```

- [ ] **Step 3: Verify no behavior change yet**

Run: `npm test` and `node --check src/controls.js`
Expected: PASS / clean. Serve, hard reload: instructions and captions read exactly as before (no tokens exist in copy yet).

- [ ] **Step 4: Commit**

```bash
git add src/controls.js index.html
git commit -m "feat(sim): render act copy through the token parser"
```

### Task 4: Copy audit: chips and terms in the act copy and welcome

**Files:**
- Modify: `src/strings.js` (acts, tour.welcome)
- Modify: `test/strings.test.js` (one added test)

**Interfaces:**
- Consumes: the token forms from Task 2; the control labels from Task 1.

- [ ] **Step 1: Write the failing test**

Append to `test/strings.test.js`:

```js
test('the act copy references control chips (instructions stay actionable)', () => {
  const actStrings = collectStrings(STRINGS.acts);
  const chips = actStrings.flatMap((s) => [...s.matchAll(/\{\{([^}]+)\}\}/g)]);
  assert.ok(chips.length >= 6, 'expected the audited act copy to name controls as {{chips}}');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL (`expected the audited act copy to name controls as {{chips}}`).

- [ ] **Step 3: Replace the act copy in `src/strings.js`**

Replace the eight `acts` entries with:

```js
  acts: [
    { title: 'A quiet morning',                 instruction: 'Find the highest {{Request rate}} the system still serves within the [[SLO]].',                                    caption: 'Each request hits every [[dependency]] at once and holds a [[worker]] until the slowest one returns.' },
    { title: 'Payments drops out',              instruction: 'Make Payments fail: raise its {{error rate}} and watch availability fall.',                                        caption: 'A fast failure with nothing to catch it goes straight to the caller.' },
    { title: 'Stop waiting on Payments',        instruction: 'Turn on {{Breakers}} and watch one trip so the system stops waiting on Payments.',                                 caption: 'A [[breaker]] skips a dependency you know is down, trading that one feature for the [[SLO]].' },
    { title: 'Search freezes',                  instruction: 'Make Search hang: raise its {{latency}}, then rein it in with a tight {{outgoing timeout}}.',                      caption: 'A [[timeout]] caps how long one hung call can tie up a [[worker]].' },
    { title: 'Recommendations backs up',        instruction: 'Push {{Request rate}} until Recommendations backs up and [[wait]] time crosses the [[SLO]].',                      caption: 'A [[breaker]] cannot help a dependency that is slow but not failing.' },
    { title: 'Give Recommendations its own lane', instruction: 'Turn on {{Bulkheads}} and cap Recommendations with its {{pool size}} so overflow is turned away fast.',          caption: 'A [[bulkhead]] turns a slow dependency into fast rejections the breaker can catch.' },
    { title: 'Stop guessing the size',          instruction: 'Turn on {{Adaptive pools}} while calm, then push {{Request rate}} and watch Recommendations size its own lane.',   caption: 'It learns the normal response time and sheds only when the [[queue]] grows. One knob instead of a guess.' },
    { title: 'The place is yours',              instruction: 'Everything is unlocked. Break the [[SLO]] however you like.',                                                      caption: 'No single tool wins. Which one holds depends on whether the dependency is slow or failing.' },
  ],
```

And replace `tour.welcome` with:

```js
    welcome: 'This is my service. Each request fans out to every [[dependency]] at once, and I hold a [[worker]] until the slowest one answers. Keep 99 of every 100 succeeding and the slow ones under 5 seconds; that promise is the [[SLO]]. Poke something and see what breaks.',
```

Note: `tour.welcome` is rendered by Task 5's tour rewrite; until then the welcome shows raw brackets, which is fine on this branch (PR3 lands before merge; the acceptance sweep in Task 8 checks the final state).

- [ ] **Step 4: Run to verify everything passes**

Run: `npm test`
Expected: PASS, including the chip-resolution and term-resolution invariants against the new copy.

- [ ] **Step 5: Verify visually**

Serve, hard reload. Act 1: "Find the highest `Request rate` ..." with a chip and a dotted [[SLO]] whose hover shows the definition. Walk all 8 acts; every chip text appears verbatim in the right panel when that act's controls are revealed.

- [ ] **Step 6: Commit**

```bash
git add src/strings.js test/strings.test.js
git commit -m "feat(sim): audit act copy to name exact controls and define terms"
```

---

## PR3: Act-aware tour

### Task 5: `tour.js` reducer: five steps, skipped flag, new-controls map

**Files:**
- Modify: `src/tour.js`
- Test: `test/tour.test.js` (updated shape + new tests)

**Interfaces:**
- Produces: `TOUR_STEPS === 5`; `initialTourState(seen, skipped)`; state shape `{ open, step, seen, skipped }`; `tourReducer` actions `open` / `next` / `skip`; `NEW_CONTROLS_BY_ACT` (keys 1..7, values arrays of `STRINGS.controls` key names or `['freePlay']`). Task 7 consumes all of these.

- [ ] **Step 1: Rewrite the tests (red)**

Replace `test/tour.test.js` with:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_STEPS, NEW_CONTROLS_BY_ACT, initialTourState, tourReducer } from '../src/tour.js';

test('the tour has five steps', () => {
  assert.equal(TOUR_STEPS, 5);
});
test('first visit auto-opens at step 0, not skipped', () => {
  assert.deepEqual(initialTourState(false, false), { open: true, step: 0, seen: false, skipped: false });
});
test('a seen tour does not auto-open and preserves a persisted skip', () => {
  const s = initialTourState(true, true);
  assert.equal(s.open, false);
  assert.equal(s.skipped, true);
});
test('next advances until the last step', () => {
  let s = initialTourState(false, false);
  for (let i = 1; i < TOUR_STEPS; i++) s = tourReducer(s, { type: 'next' });
  assert.equal(s.step, TOUR_STEPS - 1);
  assert.equal(s.open, true);
});
test('next on the last step closes, marks seen, and clears skipped', () => {
  let s = { open: true, step: TOUR_STEPS - 1, seen: false, skipped: true };
  s = tourReducer(s, { type: 'next' });
  assert.equal(s.open, false);
  assert.equal(s.seen, true);
  assert.equal(s.skipped, false);
});
test('skip from any step closes, marks seen, and sets skipped', () => {
  const s = tourReducer({ open: true, step: 1, seen: false, skipped: false }, { type: 'skip' });
  assert.equal(s.open, false);
  assert.equal(s.seen, true);
  assert.equal(s.skipped, true);
});
test('re-run opens at step 0, keeps seen, and clears skipped (the red dot)', () => {
  const s = tourReducer({ open: false, step: 2, seen: true, skipped: true }, { type: 'open' });
  assert.deepEqual(s, { open: true, step: 0, seen: true, skipped: false });
});
test('step never leaves [0, TOUR_STEPS-1]', () => {
  let s = { open: true, step: TOUR_STEPS - 1, seen: false, skipped: false };
  s = tourReducer(s, { type: 'next' });
  assert.ok(s.step <= TOUR_STEPS - 1 && s.step >= 0);
});
test('NEW_CONTROLS_BY_ACT covers exactly the acts that unlock or reveal controls', () => {
  assert.deepEqual(Object.keys(NEW_CONTROLS_BY_ACT).map(Number).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
  for (const list of Object.values(NEW_CONTROLS_BY_ACT)) assert.ok(Array.isArray(list) && list.length > 0);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL (TOUR_STEPS is 4; NEW_CONTROLS_BY_ACT not exported; state has no `skipped`).

- [ ] **Step 3: Rewrite `src/tour.js`**

```js
export const TOUR_STEPS = 5;   // welcome + bar + upstream deps + panel + act bar

// Acts that unlock a system control or reveal a station whose sliders the
// act's instruction depends on. Values name STRINGS.controls keys (or the
// 'freePlay' sentinel); STRINGS.tour.whatsNew carries the matching copy.
export const NEW_CONTROLS_BY_ACT = {
  1: ['errorRate'],                        // Payments revealed; its error rate drives the act
  2: ['breakers'],
  3: ['workerPool', 'outgoingTimeout'],    // Search revealed; its timeout drives the act
  4: ['frontDoorTimeout'],                 // Recommendations revealed
  5: ['bulkheads', 'poolSize'],
  6: ['adaptivePools'],
  7: ['freePlay'],
};

export function initialTourState(seen, skipped = false) {
  return { open: !seen, step: 0, seen, skipped };
}

export function tourReducer(state, action) {
  switch (action.type) {
    case 'open':                                   // re-run: does not clear seen; clears the skip (and its dot)
      return { open: true, step: 0, seen: state.seen, skipped: false };
    case 'next':
      if (state.step >= TOUR_STEPS - 1) return { open: false, step: state.step, seen: true, skipped: false };
      return { ...state, open: true, step: state.step + 1 };
    case 'skip':
      return { open: false, step: state.step, seen: true, skipped: true };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run to verify tour tests pass**

Run: `npm test`
Expected: tour tests PASS. (`controls.js` still calls `initialTourState(readTourSeen())`; the missing second argument defaults to `false`, so the app and remaining suite stay green.)

- [ ] **Step 5: Commit**

```bash
git add src/tour.js test/tour.test.js
git commit -m "feat(sim): five-step tour reducer with skip state and per-act controls map"
```

### Task 6: Markup and CSS: one reusable bubble, what's-new, red dot

**Files:**
- Modify: `index.html`

**Interfaces:**
- Produces: elements `#tourbubble` (with `#tourbubble-text`, `#tourbubble-step`, `.tour-skip-btn`, `.tour-prev-btn`, `.tour-next-btn`), `#whatsnew` (with `#whatsnew-text`, `#whatsnew-done`), CSS classes `.tourbubble.hidden`, `.tour-rerun-btn.dot`. Task 7 wires them.

- [ ] **Step 1: Replace the three fixed bubbles with one**

Inside `#tour-overlay`, delete the `#tourbubble-bar`, `#tourbubble-station`, and `#tourbubble-panel` divs entirely. In their place:

```html
    <div class="tourbubble" id="tourbubble">
      <p id="tourbubble-text"></p>
      <div class="tourfoot">
        <span class="tourstep" id="tourbubble-step"></span>
        <button class="tour-skip-btn">Skip</button>
        <button class="tour-prev-btn">Back</button>
        <button class="tour-next-btn">Next</button>
      </div>
    </div>
```

AFTER the closing `</div>` of `#tour-overlay` (a sibling, so it shows while the tour overlay is hidden), add:

```html
  <div class="tourbubble hidden" id="whatsnew">
    <p id="whatsnew-text"></p>
    <div class="tourfoot">
      <button id="whatsnew-done">Done</button>
    </div>
  </div>
```

- [ ] **Step 2: CSS changes**

Delete the three per-id position rules (`#tourbubble-bar { ... }`, `#tourbubble-station { ... }`, `#tourbubble-panel { ... }`). Add:

```css
    .tourbubble.hidden { display: none; }
    #whatsnew { z-index: 85; }
    /* Red notification dot on the Tour button: an act unlocked new controls
       while the tour was skipped. Cleared when the tour is opened. */
    .tour-rerun-btn { position: relative; }
    .tour-rerun-btn.dot::after {
      content: ''; position: absolute; top: -3px; right: -3px;
      width: 9px; height: 9px; border-radius: 50%; background: var(--red);
    }
```

(`.tourbubble` already carries `position: fixed` and `pointer-events: auto`; JS sets `left`/`top` inline.)

- [ ] **Step 3: Verify statically**

Run: `npm test` (unchanged). Serve, hard reload: no console errors. The tour will be broken until Task 7 rewires it (old JS references removed ids); that is expected mid-branch. Confirm the page's diagram and controls still work.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(sim): single reusable tour bubble, whats-new element, tour-button dot"
```

### Task 7: `controls.js`: anchored steps, what's-new, dot, persistence

**Files:**
- Modify: `src/controls.js` (the tour section and `showAct`)
- Modify: `src/strings.js` (tour step copy + whatsNew block)

**Interfaces:**
- Consumes: everything Tasks 1-6 produced (`parseCopy`/`glossaryDef` via `renderCopyInto`, reducer + `NEW_CONTROLS_BY_ACT`, `#tourbubble`/`#whatsnew` markup).

- [ ] **Step 1: Tour copy in `src/strings.js`**

Replace the `tour` block's bubble lines (keep `buttons`, `step`, `welcome`):

```js
    bubbleBar: 'Down here is the scoreboard: availability and [[wait]] time against the goal, with the rest of the counters beside them. Hover any label for what it means.',
    bubbleDeps: 'These boxes are the upstream dependencies. Every request needs all of them at once, so the slowest one sets the pace. Click a box to select it and its controls appear on the right.',
    bubblePanel: 'These knobs break things and add protections. When an act names a control, like {{Request rate}}, the name matches a label here exactly.',
    bubbleInstructions: 'Your instructions live here. Each act sets one goal ("Try this"), and Back, Next, and the dots move between acts. New controls get introduced as acts unlock them.',
```

And add inside the `tour` block:

```js
    // One line per act that unlocks or reveals controls (keys match
    // NEW_CONTROLS_BY_ACT in tour.js). Shown in the whats-new bubble on
    // forward entry, or represented by the Tour button's red dot after a skip.
    whatsNew: {
      1: 'New: Payments Service and its {{error rate}} slider. Push it up to make the third party fail.',
      2: 'New: {{Breakers}}. One toggle arms an independent [[breaker]] on every outbound call.',
      3: 'New: Search Service with its {{outgoing timeout}}, and the {{Worker pool}} slider.',
      4: 'New: Recommendations Service, and the {{Front-door timeout}} for shedding load at the door.',
      5: 'New: {{Bulkheads}} and the Recommendations {{pool size}} cap.',
      6: 'New: {{Adaptive pools}}. Each [[bulkhead]] learns its own size.',
      7: 'Free play: every control is unlocked for every dependency.',
    },
```

- [ ] **Step 2: Rewrite the tour section of `controls.js`**

Update the import: `import { TOUR_STEPS, NEW_CONTROLS_BY_ACT, initialTourState, tourReducer } from './tour.js';`

Replace everything from `const TOUR_SEEN_KEY` through `renderTour();` (the old bubble map, TOUR_BUBBLE_TEXT, dispatch/render, and button wiring) with:

```js
// Guided tour: a pure reducer (tour.js) driving a welcome dialog (step 0) and
// one reusable bubble (steps 1-4) that is measured against its anchor when the
// step opens (and on window resize while open), never per frame. localStorage
// persists seen and skipped; both degrade to defaults when storage is missing.
const TOUR_SEEN_KEY = 'aa_tour_seen';
const TOUR_SKIP_KEY = 'aa_tour_skipped';
function readFlag(key) {
  try { return typeof localStorage !== 'undefined' && localStorage.getItem(key) === '1'; }
  catch { return false; }
}
function writeFlag(key, on) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (on) localStorage.setItem(key, '1'); else localStorage.removeItem(key);
  } catch { /* ignore: storage may be unavailable (private mode, etc.) */ }
}

let tourState = initialTourState(readFlag(TOUR_SEEN_KEY), readFlag(TOUR_SKIP_KEY));

const tourOverlay = document.getElementById('tour-overlay');
const tourWelcome = document.getElementById('tour-welcome');
const tourBubble = document.getElementById('tourbubble');
const whatsnewEl = document.getElementById('whatsnew');

// Step 1..4 anchors: what the bubble points at and which side it prefers.
// Copy keys index STRINGS.tour.
const TOUR_STEP_DEFS = [
  null,                                                        // 0: welcome dialog
  { anchor: '#statusbar', prefer: 'above', key: 'bubbleBar' },
  { anchor: '.col-deps',  prefer: 'left',  key: 'bubbleDeps' },
  { anchor: '#panel',     prefer: 'left',  key: 'bubblePanel' },
  { anchor: '#tour',      prefer: 'above', key: 'bubbleInstructions' },
];

// Place a fixed-position bubble adjacent to its anchor, clamped to the
// viewport. Measures once per call (step open, whats-new open, window resize
// while open): never on the per-frame path.
function positionBubble(bubble, anchorEl, prefer) {
  const a = anchorEl.getBoundingClientRect();
  const b = bubble.getBoundingClientRect();
  let left, top;
  if (prefer === 'above') { left = a.left + a.width / 2 - b.width / 2; top = a.top - b.height - 12; }
  else if (prefer === 'left') { left = a.left - b.width - 16; top = a.top + 16; }
  else { left = a.left + a.width / 2 - b.width / 2; top = a.bottom + 12; }
  left = Math.max(8, Math.min(left, window.innerWidth - b.width - 8));
  top = Math.max(8, Math.min(top, window.innerHeight - b.height - 8));
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
}

function setTourDot(on) {
  for (const btn of document.querySelectorAll('.tour-rerun-btn')) btn.classList.toggle('dot', on);
}

function tourStepLabel(step) {
  return STRINGS.tour.step.replace('{n}', String(step + 1)).replace('{m}', String(TOUR_STEPS));
}

function dispatchTour(action) {
  tourState = tourReducer(tourState, action);
  if (tourState.seen) writeFlag(TOUR_SEEN_KEY, true);
  writeFlag(TOUR_SKIP_KEY, tourState.skipped);
  if (action.type === 'open') setTourDot(false);   // opening the tour answers the dot
  renderTour();
}

function renderTour() {
  tourOverlay.classList.toggle('hidden', !tourState.open);
  if (!tourState.open) return;
  const isWelcome = tourState.step === 0;
  tourWelcome.style.display = isWelcome ? '' : 'none';
  tourBubble.style.display = isWelcome ? 'none' : '';
  if (isWelcome) {
    renderCopyInto(document.getElementById('tour-welcome-text'), STRINGS.tour.welcome);
    document.getElementById('tour-welcome-step').textContent = tourStepLabel(0);
    return;
  }
  const def = TOUR_STEP_DEFS[tourState.step];
  renderCopyInto(document.getElementById('tourbubble-text'), STRINGS.tour[def.key]);
  document.getElementById('tourbubble-step').textContent = tourStepLabel(tourState.step);
  tourBubble.querySelector('.tour-next-btn').textContent =
    tourState.step >= TOUR_STEPS - 1 ? STRINGS.tour.buttons.done : STRINGS.tour.buttons.next;
  positionBubble(tourBubble, document.querySelector(def.anchor), def.prefer);
}
window.addEventListener('resize', () => { if (tourState.open && tourState.step > 0) renderTour(); });

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
  // Back one step by rendering from one step earlier; bounded at 0.
  btn.addEventListener('click', () => {
    tourState = { ...tourState, step: Math.max(0, tourState.step - 1) };
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

// Whats-new: on forward entry into an act that unlocks controls, either show
// the one-line bubble (tour not skipped) or light the Tour button's dot.
// Once per act per session; Back never re-triggers it.
let prevActIndex = -1;
const whatsNewShown = new Set();
document.getElementById('whatsnew-done').textContent = STRINGS.tour.buttons.done;
document.getElementById('whatsnew-done').addEventListener('click', () => whatsnewEl.classList.add('hidden'));
function maybeShowWhatsNew(i) {
  if (i <= prevActIndex || whatsNewShown.has(i) || !NEW_CONTROLS_BY_ACT[i]) return;
  if (tourState.skipped) { setTourDot(true); return; }
  whatsNewShown.add(i);
  renderCopyInto(document.getElementById('whatsnew-text'), STRINGS.tour.whatsNew[i]);
  whatsnewEl.classList.remove('hidden');
  positionBubble(whatsnewEl, panel, 'left');
}

renderTour();
setTourDot(false);
```

In `showAct(i)`, after `buildControls(actIndex)` and before the closing lines, add:

```js
  maybeShowWhatsNew(actIndex);
  prevActIndex = actIndex;
```

(Keep the existing `render(...)` + `handle.relayout()` lines; order relative to them does not matter, the bubble measures the already-built panel.)

Also update the initial-state line that used the old helpers: delete `readTourSeen`/`writeTourSeen` (replaced by `readFlag`/`writeFlag` above).

- [ ] **Step 3: Verify live**

Run: `npm test` and `node --check src/controls.js`. Then serve, hard reload with localStorage cleared (`localStorage.clear()` in the console):
- Welcome opens; five steps; step 2 bubble sits by the scoreboard, step 3 by the dependency boxes, step 4 by the right panel, step 5 by the act bar; Done closes.
- Advance to act 2 (hash `#2`): whats-new bubble appears by the panel naming `error rate`; Done dismisses; Back to act 1 and forward again does NOT re-show.
- `localStorage.clear()`, reload, Skip immediately, advance an act: no bubble, red dot on the Tour button; open Tour: dot clears.
- Resize the window with a bubble open: it re-anchors.

- [ ] **Step 4: Commit**

```bash
git add src/controls.js src/strings.js
git commit -m "feat(sim): act-aware tour with anchored steps, whats-new, and skip dot"
```

### Task 8: Regression and acceptance sweep

**Files:** none (verification only)

- [ ] **Step 1: Full suite + syntax**

Run: `npm test`
Expected: PASS. Roughly 95 tests (76 prior + copy, strings, and tour additions), 0 fail.
Run: `node --check src/controls.js && node --check src/tour.js && node --check src/copy.js && node --check src/strings.js`
Expected: clean.

- [ ] **Step 2: No-em-dash and hot-path checks**

Run: `grep -rn "—" src/ index.html || echo clean` -> expect `clean`.
Run: `grep -n "getBoundingClientRect" src/render.js` -> expect only the layoutEdges block (no new per-frame callers).

- [ ] **Step 3: Manual acceptance (serve at localhost:8000)**

- Fresh visitor (cleared storage): welcome -> five steps in order with correct anchors at normal and narrow widths.
- Every act instruction shows chips that match panel labels verbatim; hovering [[SLO]], [[worker]], [[wait]] shows definitions; keyboard focus does too.
- Whats-new appears exactly once per unlocking act on forward entry; never on Back.
- Skip path: red dot appears on the next unlocking act; opening the tour clears it; completing the tour prevents future dots (skipped false).
- Refresh mid-session: seen and skipped persist.

- [ ] **Step 4: Commit anything the sweep fixed**

```bash
git add -A
git commit -m "chore(sim): acceptance-sweep fixes for the act-aware tour"
```

---

## Self-Review

**Spec coverage:** tokens + parser (Task 2), controls extraction + enforcement test (Task 1), glossary (Task 1), copy audit (Task 4), rich rendering + CSS (Task 3), five steps with anchors (Tasks 5-7), whats-new map + bubble (Tasks 5, 7), skip state + red dot + persistence (Tasks 5-7), hot-path rule (positionBubble only on open/resize), error cases (malformed tokens Task 2 test; unknown term -> strings test; storage-missing guard Task 7; Back never re-triggers Task 7). PR breakdown matches the spec's three PRs.

**Placeholder scan:** none. Every code step carries complete code; the copy audit carries the full eight-act text.

**Type consistency:** `parseCopy` segments `{type, value}` consumed by `renderCopyInto` (Tasks 2/3); `initialTourState(seen, skipped)` and state `{open, step, seen, skipped}` consistent across Tasks 5/7; `NEW_CONTROLS_BY_ACT` keys 1..7 match `STRINGS.tour.whatsNew` keys (Tasks 5/7); element ids in Task 6 match Task 7's lookups (`tourbubble`, `tourbubble-text`, `tourbubble-step`, `whatsnew`, `whatsnew-text`, `whatsnew-done`).
