// strings.js
// -----------------------------------------------------------------------------
// The single edit surface for ALL user-facing copy (i18n-style). Change any
// value freely; the KEYS are stable and referenced throughout the app, so only
// edit the values. Colors live separately, as CSS custom properties in
// index.html.
//
// Current theme: a cat cafe. Reflavor freely without touching component code.
// -----------------------------------------------------------------------------

export const STRINGS = {
  // Per-dependency copy. Keys are the stable internal ids used by the engine and
  // tests; do NOT rename the keys, only the values.
  stations: {
    'Database A': { label: 'The Kibble Bin',    short: 'Kibble',  hover: 'Your data store. Fast and always stocked; every cat needs a scoop.' },
    'Service B':  { label: 'The Groomer',       short: 'Groomer', hover: 'Grooming takes time, and the line backs up when it is busy. This is the one that gets slow under load.' },
    'Service C':  { label: 'The Napping Cat',   short: 'Nap',     hover: 'Usually quick, but sometimes a cat just sits and stares into the void. That is a hang.' },
    'External':   { label: 'The Mouse Supplier', short: 'Mice',   hover: 'An outside supplier. Sometimes the mice just do not show up.' },
  },

  // One entry per act, index 0..7. title carries the cat-cafe framing; the
  // instruction and caption stay plain so the lesson reads clearly.
  acts: [
    { title: 'A quiet morning',                instruction: 'Find the highest customer rate the cafe still serves within the SLO.',                          caption: 'Each cat needs every station at once and keeps a staff member until the slowest station is done.' },
    { title: 'The mice do not show up',        instruction: 'Make the Mouse Supplier fail and watch happy cats fall.',                                        caption: 'A fast failure with nothing to catch it goes straight to the cat.' },
    { title: 'Stop waiting on the mice',       instruction: 'Turn on a breaker and watch it trip so the cafe stops waiting on the mice.',                     caption: 'A breaker skips a station you know is down, trading that feature for the SLO.' },
    { title: 'A cat zones out',                instruction: 'Make the Napping Cat hang, then add a tight timeout.',                                           caption: 'A timeout caps how long one staring cat can tie up a staff member.' },
    { title: 'The grooming line backs up',     instruction: 'Push the customer rate until the Groomer backs up and wait time crosses the SLO.',              caption: 'A breaker cannot help a station that is slow but not failing.' },
    { title: 'Give the Groomer its own line',  instruction: 'Turn on bulkheads and cap the Groomer so its overflow is turned away fast.',                    caption: 'A bulkhead turns a slow station into fast rejections the breaker can catch.' },
    { title: 'Stop guessing the line',         instruction: 'Turn on adaptive sizing while calm, then push load and watch the Groomer size its own line.',   caption: 'It learns the normal wait and sheds only when the line grows. One knob instead of a guess.' },
    { title: 'Run the cafe',                   instruction: 'Everything is unlocked. Break the SLO however you like.',                                        caption: 'No single tool wins. Which one holds depends on whether the station is slow or failing.' },
  ],

  // Guided tour: button labels, the step counter, the welcome dialog, and one
  // line per bubble. {n} and {m} are filled in with the step number and total.
  tour: {
    buttons: { skip: 'Skip', prev: 'Back', next: 'Next', done: 'Done', rerun: 'Tour' },
    step: 'Step {n} of {m}',
    welcome: 'Welcome to the cat cafe. Every cat that pads in needs all four stations at once, and a staff member stays with them until the slowest station is done. Your job: keep 99% of cats happy and served in under 5 seconds. Poke things and see what breaks.',
    bubbleBar: 'Down here: are the cats happy? Availability and wait time against your goal, plus the details.',
    bubbleStation: 'Each station does one job. A cat needs all of them, so the slowest one sets the pace.',
    bubblePanel: 'Poke the knobs on the right to break things, then add protections and watch the cafe recover.',
  },

  // Fixed bottom status bar. label is the slot heading; hover is the one-line info.
  bar: {
    availability: { label: 'Happy cats',        hover: 'Cats served, even if one station was skipped. Goal 99%.' },
    p95:          { label: 'Wait',              hover: 'How long the slowest 5% of cats waited. Goal under 5s.' },
    throughput:   { label: 'Cats/s',            hover: 'Cats served per second.' },
    errors:       { label: 'Grumpy cats/s',     hover: 'Cats that left unhappy: a station failed, or they never got served.' },
    queue:        { label: 'Waiting for a seat', hover: 'Cats waiting for any staff member to free up.' },
    rejects:      { label: 'Turned away/s',     hover: 'Calls a bulkhead rejected fast to protect a station.' },
  },

  // Miscellaneous UI labels.
  ui: {
    reset: 'Reset to defaults',
    system: 'System',
  },
};
