// strings.js
// -----------------------------------------------------------------------------
// The single edit surface for ALL user-facing copy (i18n-style). Change any
// value freely; the KEYS are stable and referenced throughout the app, so only
// edit the values. Colors live separately, as CSS custom properties in
// index.html.
//
// Frame: a working datacenter that cats have moved into, described by the arm's
// telemetry voice: literal, honest, glanceable. There are no cat graphics on the
// diagram; cats survive only as the occasional analogy the arm reaches for to
// explain what a dependency is doing. Use them sparingly, and only where the
// image genuinely clarifies the real system fact (never as decoration). Gentle,
// fond personality, but clarity always wins.
// Reflavor values freely; keep the KEYS and {tokens} stable.
// -----------------------------------------------------------------------------

export const STRINGS = {
  // Per-dependency copy. Keys are the stable internal ids used by the engine and
  // tests; do NOT rename the keys, only the values. label is the node title,
  // short is the terse diagram tag, hover states what it is and how it fails.
  stations: {
    'Database A': { label: 'Core datastore',                 short: 'core',     hover: 'The core datastore. Every request reads from it. Fast, always on, and the one dependency I never worry about.' },
    'Service B':  { label: 'Recommendations Service',        short: 'recs',     hover: 'Healthy when traffic is light, but its response time climbs as load rises and requests pile up behind it. It does not error; it just gets slow, in no hurry to catch up.' },
    'Service C':  { label: 'Search Service',                 short: 'search',   hover: 'Usually instant, but now and then it hangs: a call goes out, nothing comes back, and a worker waits. A tight timeout gives the worker back.' },
    'External':   { label: 'Payments Service (third-party)', short: 'payments', hover: 'A third-party we do not control. Usually it answers; sometimes it is simply gone and refuses the connection at once. A breaker skips it so one missing feature does not sink the rest.' },
  },

  // One entry per act, index 0..7. title carries a little of the arm's gentle
  // personality; instruction and caption stay plain so the lesson reads clearly.
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

  // Guided tour: button labels, the step counter, the welcome dialog, and one
  // line per bubble. {n} and {m} are filled in with the step number and total.
  // welcome is the one place the arm's voice gets a little room to breathe.
  tour: {
    buttons: { skip: 'Skip', prev: 'Back', next: 'Next', done: 'Done', rerun: 'Tour' },
    step: 'Step {n} of {m}',
    welcome: 'This is my service. Each request fans out to every [[dependency]] at once, and I hold a [[worker]] until the slowest one answers. Keep 99 of every 100 succeeding and the slow ones under 5 seconds; that promise is the [[SLO]]. Poke something and see what breaks.',
    bubbleBar: 'Down here is the scoreboard: availability and wait time against the goal, with the rest of the counters beside them.',
    bubbleStation: 'Each node is one dependency. Every request needs all of them at once, so the slowest one sets the pace.',
    bubblePanel: 'Use the knobs on the right to break things, then add protections and watch the system recover.',
  },

  // Fixed bottom status bar. label is the slot heading; hover is the one-line
  // info. Friendly-but-literal: this is the arm's scoreboard, so the labels name
  // the real metric and the hovers stay unambiguous (percentiles never get cute).
  bar: {
    availability: { label: 'Availability', hover: 'Share of requests that succeeded, even if a dependency was skipped. Goal 99%.' },
    p95:          { label: 'Wait',         hover: 'How long the slowest 5% of requests took, start to finish. Goal under 5s.' },
    throughput:   { label: 'Throughput',   hover: 'Requests served per second.' },
    errors:       { label: 'Errors',       hover: 'Requests that failed: a dependency errored, or the request never completed. Per second.' },
    queue:        { label: 'Queue',        hover: 'Requests waiting for a free worker.' },
    rejects:      { label: 'Rejects',      hover: 'Requests a bulkhead turned away fast to protect a dependency. Per second.' },
  },

  // The service diagram's telemetry chrome (the arm's own readouts): node labels,
  // region headings, breaker states, and the two numeric readouts. Templated
  // strings use {token} placeholders filled by src/telemetry.js (same convention
  // as tour.step). Keys are stable; only values change. Already in the arm's
  // telemetry voice and load-bearing for glanceability, so kept literal.
  telemetry: {
    client: 'Client',
    clientGlyph: 'retries',
    service: 'Our service',
    incoming: 'incoming',
    outbound: 'outbound',
    queue: 'queue',
    workers: 'workers',
    frontTimeout: 'front-door timeout',
    // A call with no breaker or no bulkhead says so instead of sitting blank.
    none: 'none',
    noCap: '-',
    // Column headers over the outbound call rows.
    callHead: { pool: 'connections', cap: 'cap', breaker: 'breaker', timeout: 'timeout' },
    // open/closed reads as jargon to non-electricians; keep these plain-language.
    breaker: { closed: 'passing', open: 'blocking', half_open: 'testing' },
    serviceSub: 'workers {workers}, connections {connections}/∞',
    capacityServing: '{inService}/{capacity} serving',
    capacityHeld: '{held} held: {inService}/{capacity} serving, {queued} queued',
  },

  // Miscellaneous UI labels.
  ui: {
    reset: 'Reset to defaults',
    system: 'System',
    controls: 'Controls',
    controlsFreePlay: 'Controls (free play)',
    tryThis: 'Try this:',
  },

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
};
