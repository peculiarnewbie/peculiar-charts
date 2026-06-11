/** Resolve px or `%` of an available radius to pixels. */
export const resolveRadius = (value: number | `${number}%`, available: number): number =>
  typeof value === "number" ? value : (Number.parseFloat(value) / 100) * available;

/** Convert polar coordinates (math angle, y-down svg) to `[x, y]`. */
export const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): [number, number] => [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
