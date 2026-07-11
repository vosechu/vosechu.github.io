// Which stations are visible at each act, cumulative. An incident act reveals
// the station it is about; a protection act reveals nothing new. Ids match the
// engine's stable target keys.
const CORE = 'Database A', THIRD_PARTY = 'External', HANG = 'Service C', SLOW = 'Service B';
const REVEAL_AT = { 0: CORE, 1: THIRD_PARTY, 3: HANG, 4: SLOW };

export function rosterForAct(actIndex) {
  const roster = [];
  for (let i = 0; i <= actIndex; i++) if (REVEAL_AT[i]) roster.push(REVEAL_AT[i]);
  return roster;
}

// The newest station on stage for this act (the one the act is about), used as
// the default panel selection. Acts that reveal nothing inherit the prior newest.
export function defaultStationForAct(actIndex) {
  let newest = CORE;
  for (let i = 0; i <= actIndex; i++) if (REVEAL_AT[i]) newest = REVEAL_AT[i];
  return newest;
}
