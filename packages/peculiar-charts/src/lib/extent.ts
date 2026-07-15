export type NumericExtent = { min: number; max: number };

/** Returns the extent of the finite numeric values in `values`. */
export const finiteExtent = (values: Iterable<unknown>): NumericExtent | undefined => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    if (value === null || value === undefined) continue;
    const numeric = value instanceof Date ? value.getTime() : Number(value);
    if (!Number.isFinite(numeric)) continue;
    if (numeric < min) min = numeric;
    if (numeric > max) max = numeric;
  }

  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : undefined;
};

/** Combines already validated extents, ignoring invalid registry entries. */
export const combineExtents = (
  extents: Iterable<NumericExtent | undefined>,
): NumericExtent | undefined => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const extent of extents) {
    if (!extent || !Number.isFinite(extent.min) || !Number.isFinite(extent.max)) continue;
    if (extent.min < min) min = extent.min;
    if (extent.max > max) max = extent.max;
  }

  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : undefined;
};
