# UI redesign: the cat café

> Temporary design doc. Delete once the redesign has shipped and settled.

## Goal
Rebuild the page so a first-time viewer understands it without a walkthrough: a fixed status bar, a diagram that grows one station at a time, a guided tour, and a playful cat-café skin. The simulation engine does not change.

## Why
A customer on a live call could not tell what the diagram was, what "External" meant, or whether the system was healthy. The sim also has to sell a pitch: an agent that already measures per-call latency can hold an SLO on its own. Both want the same thing here, a page that reads at a glance and is a little bit charming.

## Constraints that hold across every section
- **The engine does not change.** `src/engine.js` stays deterministic (injected clock, seeded rng, no `Date.now`/`Math.random`/DOM). This redesign is presentation only: `config.js`, `controls.js`, `render.js`, `scenarios.js`, `index.html`.
- **Theme is swappable.** Station names and colors are provisional; the build must make them a one-file change (see Theme system).
- **APCA contrast.** Every text and UI pairing meets APCA readability levels. Verify the exact Lc thresholds against the APCA criteria at build; do not hardcode a guessed number.
- **No em dashes** in any committed text or copy.
- **Tests ship with code.** Presentation logic that carries branching (availability math, the topology schedule, the tour state machine) gets unit tests in the same PR.

## Theme system (build this first, everything else consumes it)
Two seams, so a reskin never touches the engine or the tests:

1. **All copy lives in `src/strings.js`** (already created), an i18n-style module keyed by stable ids: `stations` (label, short, hover per internal target id), `acts` (title, instruction, caption per act), `tour` (buttons, welcome, bubbles), `bar` (label + hover per metric), and `ui`. Components read text from `STRINGS` by key and never hardcode a string. The internal target ids (`'Database A'`, `'Service B'`, `'Service C'`, `'External'`) stay as stable ids that tests reference; only the values change. Editing copy is editing this one file.
2. **All color lives in CSS custom properties** in one `:root` block in `index.html` (`--cat-blueberry`, `--cat-mint`, `--cat-tomato`, `--cat-marmalade`, plus `--paper`, `--ink`, `--happy`, `--grumpy`), with a small map in `config.js` from target id to its color variable. The mechanical target fields (latency, capacity, bulkheadSize, etc.) stay where they are. Recoloring is editing these variables.

The current `label`/`abbrev`/`note` fields baked into the `config.js` target factory are removed in favor of these two seams.

## Palette: sunny café (light)
Warm cream/off-white paper, near-black ink for text (an easy APCA win). Four candy station colors: blueberry (Kibble Bin), mint (Groomer), tomato (Napping Cat), marmalade (Mouse Supplier). Happy cats green, grumpy cats red. Station colors fill shapes and thick strokes; text and thin lines use ink or a color only where it still clears APCA against paper.

## Layout
Three regions, no title or subtitle:
- **Bottom:** a fixed status bar spanning the width, RPM-style, always visible.
- **Center:** the café diagram (the worker pool, the customer queue, the stations).
- **Right:** the controls panel.

The fork-me ribbon stays but hides below a width breakpoint (a media query) so it never covers controls.

## Bottom status bar
Every metric in fixed slots, always shown, reading 0 when not yet in play (RPM bars always show every number). Left-anchored and largest: the two SLO values, each flagged pass/fail against the target.
- **Availability %** = windowed `(success + degraded) / (success + degraded + clientErrors)`. Degraded counts as available: the cat was served, just without one station. `clientErrors` already includes starved requests; rejects are leg-level and must not appear here. When no requests resolved in the window (denominator 0), show 100% (or a dash), never NaN. Target 99%.
- **p95 response time**, target under 5s.
- Then, smaller: throughput (cats/s), errors/s, worker-queue depth, rejects/s.

The current progressively-revealed metric chips are removed; the bar replaces them.

## Node visuals
Keep the slot-box stations (each slot is a concurrency unit, filled = in use): the "slots filling up" image is the concurrency lesson. Add per station:
- A small **latency sparkline** (recent observed response time), so a climbing latency is visible as a trend, not just a fill level.
- **Timeouts show on the sparkline**: the line rises to the outgoing-timeout ceiling and clips there, so a hang reads as "the line hit the cap and got cut." The per-connection stopwatch icons are removed; the graph shows it better.

## Progressive topology and Act 0
A new Act 0 opens calm: request rate 0, nothing blinking, only the Kibble Bin on screen, so the first thing a viewer sees is legible. Each act then reveals one more station, matched to what that act teaches:

| Act | Station revealed | What it teaches |
|---|---|---|
| 0 Baseline | Kibble Bin only | find the max rate that holds the SLO |
| 1 Mouse Supplier ghosts you | + Mouse Supplier | a fast failure with nothing to catch it breaks the SLO |
| 2 Catch it | (same) | a breaker contains the failing station |
| 3 The Napping Cat zones out | + Napping Cat | a tight timeout on a fast station is cheap insurance |
| 4 The Groomer backs up | + Groomer | slow-but-not-failing defeats breaker and timeout |
| 5 Give the Groomer its own pool | (same) | a bulkhead contains a slow station |
| 6 Stop guessing the pool | (same) | adaptive sizing finds the pool on its own |
| 7 Free play | all | everything unlocked |

Revealing a station shows its node, its diagram line, and (when selected) its panel block.

**This is a deliberate departure from today's "acts set no state" rule.** Right now acts are pure guides and the player drives everything. Topology is different: the act sets the station roster (which entries exist in `config.targets`) as its starting point, because a request fans out to whatever stations exist, so the metrics must reflect only the revealed ones. The player still drives every knob (rate, latency, error rate, breaker, and so on); only the roster is act-driven. "Reset to defaults" resets to the current act's roster, not all four. The engine needs no change: it already iterates whatever `config.targets` contains.

**Interaction with Back/Forward act navigation.** The app already routes acts through the URL hash, so Back/Forward move between acts. The roster is a pure function of the current act (the cumulative set up to that act), so navigating back to an earlier act shrinks the café to that act's stations and forward restores them. Knob edits do not survive navigation: changing acts already rebuilds the controls today, and a hidden station cannot show its knobs anyway, so leaving an act discards its per-station tweaks (the same as today). This keeps roster derivation stateless and back-navigation predictable; the player uses "Reset to defaults" within an act, not act-hopping, to undo.

## Panel: click a station to inspect it
The right panel becomes two parts:
- A small **System block**, always present, for the global toggles unlocked so far (breakers, bulkheads, adaptive, worker pool, front-door timeout, oscillation).
- A **station block** that follows the selected station: click a node in the diagram to load that station's controls (latency, outgoing timeout, error rate, capacity, pool size, breaker). Default selection is the newest station the current act introduced, so the panel already shows what the act is about.

Clicking a station highlights it in the diagram and swaps the station block. Only one station's controls show at a time (free play may list all, matching today).

## Guided tour
On first ever load, a welcome dialog opens with the only prose in the app: a short, twee cat-café intro. Then a few bubbles point at the parts in turn: the status bar, a station, the panel. Four steps total (welcome + three bubbles).

State machine (with unit tests):
- **Step index** stays in `[0, M-1]`; "step N of M" renders `N = index + 1`.
- **Next** advances while `index < M-1`; on the last step it closes the tour (no wrap, no overrun). The last step's button reads "Done".
- **Skip** (present on every step) closes the tour from any step.
- **Persistence:** one `localStorage` key, `aa_tour_seen`. The tour auto-opens on load only if the key is unset. Both finishing (Done) and Skip set it, so a dismissed tour never auto-opens again.
- **Re-run:** a Tour button placed between prev/next reopens the tour at step 0 at any time, and does NOT clear `aa_tour_seen` (re-running now must not cause an auto-open next load).

The tour positions bubbles against existing elements and never blocks the sim (the café keeps running behind it).

## Cleanup
- **Little's Law** is removed from the UI entirely (it was already flagged "safe to ignore").
- **ⓘ hovers** on each station and each bar metric, one plain sentence each.
- **Fork ribbon** hidden below a width breakpoint.

## Copy voice
Twee, warm, PostHog-silly, but never at the cost of the lesson. Act titles use the cat-café framing (the table above). Captions keep teaching in plain language; the charm is in the framing and the ⓘ hovers, not in burying the point. All expository prose lives in the tour welcome; everywhere else is labels, captions, and hovers.

## What stays the same
The engine, its determinism, and every existing engine test. Availability math, the topology schedule, and the tour state machine are new presentation logic and get their own unit tests.

## Open by design
The theme (names and colors) is provisional; `strings.js` and the palette variables exist precisely so this stays cheap to change after seeing it rendered. `strings.js` already carries the cat-café copy.

## PR breakdown (one plan, dependency-ordered, each a small slice)
1. **Copy + color seams.** Commit `strings.js`; add the palette CSS variables and the id-to-color map; route `defaultConfig()`, the diagram, the acts, and the existing controls to read every label and color from the seams instead of hardcoded strings. Keep the current look (dark palette placeholder is fine). Unit test that config and acts read their text from `STRINGS`. Everything else builds on this.
2. **Sunny palette.** Set the cream/candy palette variable values and the id-to-color map to the four candy colors; verify each pairing against APCA. Color only; copy is already in `strings.js`.
3. **Bottom status bar.** Add the fixed bar and the windowed availability metric (with tests); remove the metric chips.
4. **Progressive topology + Act 0.** Add Act 0 and the act-to-station reveal schedule (with a test on the schedule); start with the Kibble Bin.
5. **Click-to-inspect panel.** Split the panel into System + selected-station blocks; wire node clicks to selection.
6. **Latency sparkline + timeout clip.** Add the per-station sparkline in `render.js`; show timeouts as a clipped line; remove the stopwatch icons.
7. **Guided tour.** The tour state machine (with tests), welcome dialog, bubbles, skip, page numbers, Tour button, first-visit persistence.
8. **Cleanup + contrast pass.** Remove Little's Law, add ⓘ hovers, ribbon breakpoint, remove title/subtitle, and the APCA verification pass across the final palette.

