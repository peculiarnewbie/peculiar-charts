import type { AxisOrientation, ChartContextType } from "@src/components/context";
import { scaleBand } from "d3-scale";

/** Narrow view of the chart context used by {@link axisValues}. */
type AxisValuesContext = Pick<ChartContextType, "getAxisConfig" | "displayedData">;

/** Reads a (optionally dot-pathed) key out of each datum, or returns the
 * array as-is when no key is given (data is a plain array of values). */
export const accessData = <T>(data: unknown, dataKey: string | undefined): T[] => {
  if (!dataKey) {
    if (!Array.isArray(data)) {
      throw new Error(
        `[peculiar-charts]: Expected data to be an array when no dataKey is set, got ${typeof data}`,
      );
    }
    return data as T[];
  }
  if (!Array.isArray(data)) {
    throw new Error(`[peculiar-charts]: Expected data to be an array, got ${typeof data}`);
  }
  const keys = dataKey.split(".");
  return (data as Record<string, any>[]).map((entry) =>
    keys.reduce((acc, key) => acc?.[key], entry),
  ) as T[];
};

/** The per-datum domain values for an axis — the values read from the axis's
 * `dataKey`, or the data indices when no key is set. Shared by point projection
 * and pointer hit-testing so they agree on where each datum sits. Reads from
 * `displayedData` so the brush range is respected. When `seriesData` is
 * provided it is used instead of `displayedData` (per-series data override). */
export const axisValues = (
  ctx: AxisValuesContext,
  axisId: string,
  orientation: AxisOrientation,
  seriesData?: unknown[],
): any[] => {
  const config = ctx.getAxisConfig(axisId, orientation);
  const source = seriesData ?? ctx.displayedData();
  return config.dataKey ? accessData<any>(source, config.dataKey) : source.map((_, i) => i);
};

/** Coerce a domain value to a finite number (Date → epoch ms), or `null`. */
export const toNumeric = (value: unknown): number | null => {
  const n = value instanceof Date ? value.getTime() : Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Order-preserving de-duplication, used to build categorical domains. */
export const uniqueInOrder = <T>(values: T[]): T[] => {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const v of values) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
};

/** Converts a gap expressed in px or `%` into a d3 padding ratio. */
export const gapToPadding = (gap: number | `${number}%`, bandwidth: number) => {
  if (typeof gap === "number") return gap / bandwidth;
  return Number.parseFloat(gap.slice(0, -1)) / 100;
};

/** Narrow view of the chart context used by {@link getBarPadding}. */
type BarPaddingContext = Pick<
  ChartContextType,
  "bars" | "getInset" | "width" | "displayedData" | "barConfig"
>;

/** Half a band's width — the amount point/linear x-scales are inset by so
 * that line/area markers centre over bar bands when bars are present. */
export const getBarPadding = (chartContext: BarPaddingContext) => {
  if (chartContext.bars().size === 0) return 0;

  const left = chartContext.getInset("left");
  const right = chartContext.width() - chartContext.getInset("right");
  const chartWidth = right - left;
  const dataLength = chartContext.displayedData().length;

  const barConfig = chartContext.barConfig();
  const bandGap = gapToPadding(barConfig.bandGap, chartWidth / dataLength);

  const bandScale = scaleBand()
    .domain(Array(dataLength).keys().map(String).toArray())
    .range([left, right])
    .paddingInner(bandGap)
    .paddingOuter(bandGap / 2);

  return bandScale.step() / 2;
};

export const pointDefined = (point: [number, number]) =>
  typeof point[0] === "number" &&
  !Number.isNaN(point[0]) &&
  typeof point[1] === "number" &&
  !Number.isNaN(point[1]);
