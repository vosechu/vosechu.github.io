export const TOUR_STEPS = 4;   // welcome + bar + station + panel

export function initialTourState(seen) {
  return { open: !seen, step: 0, seen };
}

export function tourReducer(state, action) {
  switch (action.type) {
    case 'open':                                   // re-run: does not clear seen
      return { open: true, step: 0, seen: state.seen };
    case 'next':
      if (state.step >= TOUR_STEPS - 1) return { open: false, step: state.step, seen: true };
      return { open: true, step: state.step + 1, seen: state.seen };
    case 'skip':
      return { open: false, step: state.step, seen: true };
    default:
      return state;
  }
}
