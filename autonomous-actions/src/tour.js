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
