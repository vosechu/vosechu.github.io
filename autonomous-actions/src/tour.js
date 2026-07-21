// tour.js -- pure, DOM-free logic for the guided tour. Step navigation and
// popover positioning live in Driver.js (vendored; wired up in controls.js);
// this module holds only what stays testable without a DOM: the step
// definitions, the first-visit auto-open rule, and the per-act "new controls"
// map that the what's-new bubble reads.

// Ordered tour steps. `element` is a CSS selector Driver.js spotlights
// (null = a centered popover with no highlight); `copyKey` indexes
// STRINGS.tour for the popover body.
export const TOUR_STEP_DEFS = [
  { element: null,         copyKey: 'welcome' },            // centered intro
  { element: '#statusbar', copyKey: 'bubbleBar' },          // the scoreboard
  { element: '.col-deps',  copyKey: 'bubbleDeps' },         // upstream dependencies
  { element: '#panel',     copyKey: 'bubblePanel' },        // the control panel
  { element: '#tour',      copyKey: 'bubbleInstructions' }, // the act instructions
];

export const TOUR_STEPS = TOUR_STEP_DEFS.length;   // 5: welcome + bar + deps + panel + acts

// The tour auto-opens on a visitor's first load and never again once seen.
export function shouldAutoOpen(seen) {
  return !seen;
}

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
