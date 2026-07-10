// Acts are guide-only: each carries a title, a player instruction, an
// explanatory caption, whether the tour's adaptive readout shows, and (via
// controls.js) which knobs it unlocks. Acts do NOT set any state; the
// instructions walk the player into each scenario and the sim stays however
// they left it. "Reset to defaults" is the only way back to the baseline.
export const ACTS = [
  { title: 'Baseline and the SLO',
    instruction: 'Push the request rate up as high as you can without the system breaking or causing queueing. Your goal is to find the maximum traffic we can handle while maintaining our 99% availability and p95 response time of less than 5 seconds.',
    caption: 'Every request calls all dependencies at once and holds a worker until the slowest one replies, so throughput is the pool divided by that hold time.',
    readoutVisible: false },

  { title: 'Incident: External refuses connections',
    instruction: 'Set its error rate to 100% and watch availability fall, since every request calls it. What is the maximum error rate we can handle and still meet our SLO?',
    caption: 'Fast failures return instantly, so they never tie up a worker. But with nothing to catch them, they pass straight to the client and the SLO breaks.',
    readoutVisible: false },

  { title: 'Response: circuit breaker',
    instruction: 'Turn the External error rate up to 5% and confirm the SLO breaches. Then ship a breaker: turn breakers on with a threshold around 5 errors per second, and watch it trip. The failing calls become degraded responses instead of errors, so availability recovers.',
    caption: 'A breaker short-circuits calls to a dependency we already know is down, so we stop paying for them. Availability recovers, but only if that feature can be switched off: the feature that needed the External Service is now down for 100% of people, instead of the whole service being down for some of them. It is a difficult call.',
    readoutVisible: false },

  { title: 'Incident: Analytics hangs',
    instruction: 'Analytics is supposed to be fast, so a tight timeout on it is cheap. Set its outgoing timeout to about 200 ms and notice healthy traffic is untouched. Then make it hang: drag its latency up to several seconds. The timeout cuts the hung calls at 200 ms, they count as errors, and the breaker you already shipped trips and turns them into degraded responses.',
    caption: 'A timeout limits the damage one runaway call can do: it caps how long we will wait, so a single hung request cannot tie up a worker indefinitely. On a dependency that is meant to be fast, a tight timeout is cheap insurance: set just above normal latency, it almost never fires in health, but it cuts a hang short, and the breaker then catches the errors it produces.',
    readoutVisible: false },

  { title: 'Incident: Reports slows down',
    instruction: 'Push the request rate to about 150/s, then drag Reports latency up to 8 s. Workers pile up and the SLO falls as p95 crosses 5 s, with no errors for a breaker to catch. Turn the breaker on: it never trips, because Reports is slow, not failing, and even if it were failing, 8 s calls could not stack 5 errors into a 1 s window. Try the outgoing timeout you just used, too: tight enough to help, it kills good Reports traffic; loose enough to spare it, it does not save the pool. Last, drop the front-door timeout and watch queue and p95 fall while errors climb. That is shedding load, not fixing it.',
    caption: 'A breaker cannot help a dependency that is slow but not failing: it never errors, so it never trips. A timeout cannot tell slow-but-fine from broken, so on a legitimately slow dependency it just trades one failure for another. Nothing you have learned bounds the damage while still serving Reports. That is what a bulkhead is for.',
    readoutVisible: false },

  { title: 'Response: bulkhead',
    instruction: 'Give Reports its own pool. Turn on bulkheads and cap Reports; overflow is rejected fast, its breaker trips, and the other pools keep serving.',
    caption: 'A bulkhead gives each dependency its own slice of the workers, so a slow one can exhaust only its own slice. It turns slow calls into fast rejections, and fast failures are exactly what a breaker catches, so the SLO holds. The catch: a rejection is still an error unless something contains it, and the cap hard-cuts every call over the limit, so you size it conservatively from real numbers. Guess low and you shed good traffic; guess high and it stops protecting you.',
    readoutVisible: false },

  { title: 'Response: adaptive sizing',
    instruction: 'Reset to defaults, then turn on adaptive sizing while traffic is healthy so it can learn each dependency\'s normal response time. Now push the request rate up until Reports has more calls than it can serve and its queue grows, and watch its pool shed toward the number it can actually handle. Drop the rate back down and watch it reopen.',
    caption: 'A fixed pool is a guess that goes stale as traffic shifts. Adaptive sizing learns the floor, the response time it sees when nothing is queued, then sizes on how far latency has climbed above that floor rather than on the raw number. So a dependency that is simply slow, like a database with naturally high and variable response times, is left alone, while one whose queue is growing gets shed until the queue clears. It lags a real shift by a sample or two and it has to see healthy traffic first to learn the floor, but that is one forgiving knob instead of a brittle per-dependency guess, and anything already measuring per-call latency, like an APM agent, can hold this SLO on every connection with almost nothing to tune.',
    readoutVisible: true },

  { title: 'Free play',
    instruction: 'Everything is unlocked, for every dependency. Break the SLO however you like and see which protections hold.',
    caption: 'No single tool wins. Which protection holds the SLO depends on whether the failure is fast or slow, and on whether you can turn the feature off.',
    readoutVisible: true },
];

export function actMeta(index) {
  const act = ACTS[index];
  return { title: act.title, caption: act.caption, instruction: act.instruction, readoutVisible: act.readoutVisible };
}
