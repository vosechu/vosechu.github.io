import { STRINGS } from './strings.js';

// The one place that maps a target id to its color variable (defined in index.html).
export const COLORS = {
  'Database A': 'var(--station-core)',
  'Service B':  'var(--station-slow)',
  'Service C':  'var(--station-hang)',
  'External':   'var(--station-3p)',
};

export const labelOf = (id) => STRINGS.stations[id]?.label ?? id;
export const shortOf = (id) => STRINGS.stations[id]?.short ?? id;
export const hoverOf = (id) => STRINGS.stations[id]?.hover ?? '';
export const colorOf = (id) => COLORS[id] ?? 'var(--ink)';
export const act = (i) => STRINGS.acts[i];
