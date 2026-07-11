// Trim a fixed-point string's trailing ".0" so an exact 0 renders as "0", not
// "0.0" (a clamped-to-ceiling point must read as a bare "0" for callers that
// match on it literally).
const fmt = (n) => {
  const s = n.toFixed(1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
};

// Map a latency series to an SVG polyline path, newest last, scaled so the
// timeout ceiling is the top of the box. Values at or above the ceiling clip to
// the top (y = 0), so a hang reads as the line hitting the cap.
export function sparklinePath(series, width, height, ceilingMs) {
  if (!series || series.length === 0) return '';
  const n = series.length;
  const dx = n === 1 ? 0 : width / (n - 1);
  const pts = series.map((v, i) => {
    const clamped = Math.min(v, ceilingMs);
    const y = height - (clamped / ceilingMs) * height;   // ceiling -> y=0 (top)
    const x = i * dx;
    return `${fmt(x)},${fmt(Math.max(0, y))}`;
  });
  return `M ${pts.join(' L ')}`;
}
