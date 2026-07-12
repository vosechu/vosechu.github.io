// edges.js
// Pure geometry for the diagram's arrow overlay. render.js measures DOM boxes
// with getBoundingClientRect (viewport coords), converts them into coordinates
// local to the .diagram container, then asks for each arrow's endpoints. No DOM
// here, so it is unit-tested with plain rect objects.

// Translate a viewport rect (getBoundingClientRect) into coordinates local to
// the container, so a line drawn in the container-sized SVG overlay lines up
// with the boxes. Size is unchanged, only the origin shifts.
export function toLocalRect(rect, containerRect) {
  return {
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top,
    width: rect.width,
    height: rect.height,
  };
}

// Endpoints for an arrow from the right-center of fromRect to the left-center of
// toRect, both already in local coords. Our service fans out to the dependencies
// on its right, so every edge leaves a right edge and lands on a left edge.
export function edgeEndpoints(fromRect, toRect) {
  return {
    x1: fromRect.left + fromRect.width,
    y1: fromRect.top + fromRect.height / 2,
    x2: toRect.left,
    y2: toRect.top + toRect.height / 2,
  };
}
