# Act-aware tour and vocabulary design

Date: 2026-07-11
Status: Design approved; implementation plan pending.

## Summary

An alpha player could not find "request rate" because the instructions and the
control labels disagree, and terms like SLO are used but never defined. This
design makes the copy self-explaining (control-name chips that provably match
the panel, glossary hover tooltips) and makes the guided tour act-aware: five
anchored steps, a "what's new" bubble when an act unlocks controls, and a red
dot on the Tour button for players who skipped. Scope: `strings.js`, a new pure
`copy.js`, `tour.js`, `controls.js`, `index.html` CSS/markup, plus tests for
every pure piece.

## Problem

1. Instructions name concepts, not controls: "turn on a breaker" (toggle says
   Breakers), "adaptive sizing" (toggle says Adaptive pools), "cap
   Recommendations" (slider says pool size). Players scan the panel for a
   string that is not there.
2. SLO appears in five acts and is defined nowhere. Worker, bulkhead, wait
   time, and others lean on the player already knowing them.
3. The tour is four static steps with hardcoded bubble positions; step 2
   points at a generic "station" instead of the upstream dependencies; nothing
   introduces the controls an act unlocks; nothing points at the act
   instructions themselves; skipping is silent and permanent.

## Decisions already made (with the user)

- Definitions are hover tooltips fed by a glossary in `strings.js`, reusing the
  status bar's `.tip` visual language. No inline-definition copy rewrite.
- The copy changes to match the control labels, not the other way around.
  Control labels stay stable.
- Copy layer is token-based (approach A): explicit markers in strings, parsed
  by a pure module. No raw HTML in strings, no dictionary auto-matching.

## Design

### 1. Copy tokens and the pure parser (`src/copy.js`)

Two markers may appear in instruction, caption, and tour copy in `strings.js`:

- `[[SLO]]` - a glossary term. Renders as a dotted-underline span; hover or
  keyboard focus shows the definition.
- `{{Breakers}}` - a control chip. Renders as a small chip styled like a panel
  label; its text must equal a real control label exactly.

`src/copy.js` is pure and unit-tested:

- `parseCopy(str) -> [{ type: 'text'|'term'|'ctl', value }]`
  Splits a string on the two token forms. Unknown or malformed tokens fall
  back to plain text segments (never throw, never render brackets).
- Glossary lookup is case-insensitive on the key ("SLO" and "slo" both hit the
  `slo` entry) while the displayed text keeps the copy's casing.

DOM glue (in `controls.js` for the act bar, tour rendering for bubbles) turns
segments into spans:

- term: `<span class="term" tabindex="0">SLO<span class="tip">...</span></span>`
- ctl: `<span class="ctl">Breakers</span>`

### 2. Control labels move to `STRINGS.controls`

Every user-facing control label currently hardcoded in `controls.js` becomes a
value in `STRINGS.controls` (requestRate, workerPool, frontDoorTimeout,
breakers, bulkheads, adaptivePools, oscillation, latency, outgoingTimeout,
errorRate, capacity, poolSize, numErrors, perTime). `controls.js` reads them.

Test-enforced invariant (new `test/strings.test.js`): every `{{chip}}` token
appearing anywhere in `STRINGS` equals some value of `STRINGS.controls`. The
alpha-player mismatch becomes a failing test, not a bug report.

### 3. Glossary (`STRINGS.glossary`)

Keys (lowercase): slo, worker, dependency, queue, breaker, bulkhead,
connection pool, timeout, adaptive pool, wait, throughput, rejects. One or two
plain sentences each, telemetry voice, no em dashes. The status bar keeps its
existing info hovers; the glossary serves the running copy (instructions,
captions, tour bubbles).

### 4. Copy audit

Rewrite `STRINGS.acts` instructions (and captions where needed) so every
control mention is a `{{chip}}` with the exact label and every jargon term is
a `[[term]]` on first use per act. Example:

    Before: 'Turn on a breaker and watch it trip so the system stops waiting on Payments.'
    After:  'Turn on {{Breakers}} and watch one trip so the system stops waiting on Payments.'

### 5. Five act-aware tour steps

Steps become data: `TOUR_STEP_DEFS = [welcome, bar, deps, panel, actbar]`,
`TOUR_STEPS = 5`. Content per step lives in `STRINGS.tour`:

0. Welcome (unchanged dialog, copy updated to mention the [[SLO]]).
1. Scoreboard: anchored to `#statusbar` (existing bubble).
2. Upstream dependencies: anchored to the diagram's `.col-deps` column;
   explains fan-out and that the slowest dependency sets the pace. Replaces
   the old "station" step.
3. Controls panel: anchored to `#panel` (existing bubble, copy updated).
4. Your instructions: anchored to `#tour` (the act bar); explains that each
   act sets a goal there ("Try this") and the Back/Next/dots navigation.

Anchoring: bubbles stop using hardcoded fixed positions. When a step opens,
`positionBubble(bubble, anchorEl)` measures `anchorEl.getBoundingClientRect()`
once and places the bubble adjacent (above the bar, left of the panel, below
the deps column, above the act bar), clamped to the viewport. Re-measured on
window resize while open. Never measured per animation frame.

### 6. What's new on act change

A pure per-act map in `tour.js` (keys into `STRINGS.tour.whatsNew`):

    NEW_CONTROLS_BY_ACT = {
      1: ['errorRate'],                  // Payments revealed; its error rate drives act 1's goal
      2: ['breakers'],
      3: ['workerPool', 'outgoingTimeout'],   // Search revealed; its timeout drives the act
      4: ['frontDoorTimeout'],           // Recommendations revealed
      5: ['bulkheads', 'poolSize'],
      6: ['adaptivePools'],
      7: ['freePlay'],       // everything unlocked; one summary line
    }

The map covers every act that unlocks a system control OR reveals a station
whose per-station sliders the act's instruction depends on. The tour.js test
asserts the map's keys against this list so a future act cannot silently skip
its introduction.

`STRINGS.tour.whatsNew` carries one short line per act, chip-tokened, e.g.
act 2: 'New control: {{Breakers}}. One toggle arms an independent [[breaker]]
on every outbound call.'

On act change (controls.js `showAct`):

- If the act has new controls and the player has NOT skipped: show a single
  dismissible bubble anchored to `#panel` with that line. It does not block
  the sim; Done closes it.
- If the player HAS skipped: no bubble; the Tour button gains a red dot.

### 7. Skip state and the red dot

`tour.js` state gains `skipped`. Transitions:

- `skip` action: `open=false, seen=true, skipped=true`.
- `open` action (Tour button): `skipped=false` (dot cleared), `open=true, step=0`.
- Completing the tour (`next` past the last step): `seen=true, skipped=false`.

Persistence: `aa_tour_seen` (existing) plus `aa_tour_skipped` in localStorage,
same guarded read/write pattern. The red dot is CSS: `.tour-rerun-btn.dot`
with an `::after` red circle; controls.js toggles the class from tour state
whenever an act change finds new controls while `skipped` is true.

### 8. Hot-path rule (unchanged)

All measuring happens on step-open, bubble-open, or window resize. The per
frame `render()` path is untouched.

## Components and blast radius

- `src/copy.js` + `test/copy.test.js`: new, pure parser.
- `src/tour.js` + `test/tour.test.js`: reducer gains `skipped` and act-change
  logic; `NEW_CONTROLS_BY_ACT`; TOUR_STEPS becomes 5. Red-green on every
  transition.
- `src/strings.js`: `controls`, `glossary`, `tour.whatsNew`, five step texts,
  audited act copy.
- `test/strings.test.js`: new; chips match control labels; glossary keys
  resolve for every `[[term]]` used.
- `src/controls.js`: reads labels from `STRINGS.controls`; renders
  instruction/caption through `parseCopy`; tour rendering for five steps,
  dynamic positioning, what's-new bubble, dot toggling.
- `index.html`: `.term`/`.ctl`/`.dot` CSS. The four positioned bubbles
  collapse into ONE reusable bubble element that positionBubble moves and
  fills per step; the welcome dialog stays its own element; the what's-new
  bubble reuses the same reusable element. No diagram changes.
- Engine, render.js hot path, theme, topology: untouched.

## Error handling / edge cases

- Unknown `[[term]]` (no glossary entry): renders as plain text, and the
  strings test fails so it cannot ship silently.
- Malformed tokens (unclosed braces): plain text, parser never throws.
- Acts revisited (Back): what's-new shows only on forward entry into an act
  whose controls are newly unlocked relative to the previous act index, and
  only once per session per act (a shown-set in controls.js state).
- Tour opened mid-act: dot clears; the five steps describe whatever is
  currently visible (copy is act-agnostic by design).
- localStorage unavailable: same degrade-to-defaults guard as `aa_tour_seen`.

## Testing

- `copy.test.js`: text-only, single term, single chip, mixed, adjacent
  tokens, malformed tokens, case-insensitive glossary lookup.
- `tour.test.js`: existing seven tests stay green (TOUR_STEPS updates);
  new: skip sets skipped, open clears skipped, completion clears skipped,
  NEW_CONTROLS_BY_ACT covers exactly the acts that unlock controls.
- `strings.test.js`: every chip resolves to a control label; every term
  resolves to a glossary key.
- Manual (localhost:8000): five steps anchor correctly at normal and narrow
  widths; what's-new appears on act 2 forward-entry and not on Back; skip
  then act-advance shows the dot; opening the tour clears it.

## Out of scope

- The cats-as-analogies copy pass (narrative agent, separate).
- Any diagram/render.js changes.
- Touch/mobile-specific tour layout beyond viewport clamping.

## PR breakdown (ordered, smallest shippable slice first)

1. **PR1: copy foundations.** `STRINGS.controls` extraction (controls.js reads
   labels from strings), `STRINGS.glossary` data, `src/copy.js` parser +
   `test/copy.test.js`, `test/strings.test.js` invariants. No visible change.
2. **PR2: rich copy rendering.** Instructions/captions render through
   `parseCopy` with `.term`/`.ctl` CSS; act copy audited to use chips and
   terms. Visible: highlighting and hover definitions.
3. **PR3: act-aware tour.** Five steps, dynamic anchoring, what's-new bubble,
   skip state + red dot, reducer changes + tests, tour copy.
