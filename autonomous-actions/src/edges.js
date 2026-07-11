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
