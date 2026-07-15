import type { ScaleType } from "@src/lib/scale";
import type { SyncMethod, SyncPayload } from "@src/lib/sync";
import { type Accessor, type Setter, createContext, useContext } from "solid-js";

export type Edge = "top" | "right" | "bottom" | "left";
export type AxisOrientation = "x" | "y" | "angle" | "radius";

/**
 * Resolved configuration for a single axis. Registered by `<Axis>`; a default
 * is synthesised (see {@link ChartContextType.getAxisConfig}) when a series
 * references an axis id that has no `<Axis>` rendered.
 */
export type AxisConfig = {
  orientation: AxisOrientation;
  type: ScaleType;
  /** Key used to read categorical values / x-values from the chart data. */
  dataKey?: string;
  /**
   * User-forced numeric domain. `'min'`/`'max'` keep the data-derived bound.
   * String expressions like `'dataMax + 1000'` or `'dataMin - 50'` are
   * evaluated against the computed data extent.
   */
  range: [number | "min" | string, number | "max" | string] | null;
  reverse: boolean;
  /** Pixel padding applied to the axis range edges. */
  padding?: { left?: number; right?: number; top?: number; bottom?: number };
  /** Keep duplicate category values in the categorical domain. */
  allowDuplicatedCategory?: boolean;
  /** Clip bound series to the plot area when user-defined domains overflow data. */
  allowDataOverflow?: boolean;
};

export type BarConfig = {
  bandGap: number | `${number}%`;
  barGap: number | `${number}%`;
  barSize?: number | `${number}%`;
  maxBarSize?: number | `${number}%`;
};

/** Domain summary for an axis, discriminated by whether it is categorical. */
export type Domain =
  | { kind: "categorical"; values: any[] }
  | { kind: "numeric"; min: number; max: number; userDefined: boolean };

/** Identity record every series registers, powering legends and tooltips. */
export type SeriesMeta = {
  id: string;
  name: string;
  type: string;
  /** Data key used to resolve per-datum values in tooltips. */
  dataKey?: string;
  /** Palette colour assigned by registration order. */
  color: string;
  order: number;
};

export type StackEntry = { seriesIds: Set<string>; values: number[] };
export type StackOffset = "none" | "expand" | "silhouette" | "sign";

export type BrushRange = { startIndex: number; endIndex: number };

export type SyncInteraction = {
  active: boolean;
  index: number | null;
  axisId: string;
  label: string | undefined;
  dataKey: string | undefined;
  sourceViewBox: SyncPayload["sourceViewBox"];
};

export type ChartContextType<TData extends unknown[] = unknown[]> = {
  data: Accessor<TData>;
  /** Data visible in the main chart area — sliced by brush range when a brush
   *  is present, otherwise identical to `data()`. Series and axes should read
   *  from this instead of `data()` so they respect the brush selection. */
  displayedData: Accessor<TData>;
  /** The active brush range, or `null` when no brush is rendered. */
  brushRange: Accessor<BrushRange | null>;
  /** @internal Used by `<Brush>` to update the range. */
  setBrushRange: (range: BrushRange | null) => void;
  width: Accessor<number>;
  height: Accessor<number>;
  plotClipPath: Accessor<string>;

  // --- plot rect / insets -------------------------------------------------
  getInset: (edge: Edge, exclude?: string) => number;
  registerInset: (edge: Edge, key: string, value: number) => void;
  unregisterInset: (edge: Edge, key: string) => void;

  // --- axis configuration -------------------------------------------------
  registerAxisConfig: (axisId: string, config: AxisConfig) => void;
  unregisterAxisConfig: (axisId: string) => void;
  /**
   * Returns the registered config for `axisId`, or a default derived from
   * `orientation` (`point` for x, `linear` for y) when none is registered.
   */
  getAxisConfig: (axisId: string, orientation: AxisOrientation) => AxisConfig;

  // --- numeric extent registry (per axis, per series) ---------------------
  registerExtent: (axisId: string, seriesId: string, extent: { min: number; max: number }) => void;
  unregisterExtent: (axisId: string, seriesId: string) => void;
  getDomain: (axisId: string, orientation: AxisOrientation) => Domain;

  // --- stacks -------------------------------------------------------------
  stackOffset: Accessor<StackOffset | undefined>;
  stacks: Accessor<Map<string, Map<string, StackEntry>>>;
  registerStack: (stackId: string, dataKey: string, seriesId: string, values: number[]) => void;
  unregisterStack: (stackId: string, dataKey: string, seriesId: string) => void;

  // --- bars ---------------------------------------------------------------
  bars: Accessor<Set<string>>;
  registerBar: (key: string) => void;
  unregisterBar: (key: string) => void;
  barConfig: Accessor<BarConfig>;

  // --- series identity ----------------------------------------------------
  seriesMeta: Accessor<SeriesMeta[]>;
  registerSeriesMeta: (
    id: string,
    meta: { name: string; type: string; dataKey?: string; color?: string },
  ) => void;
  unregisterSeriesMeta: (id: string) => void;
  isSeriesVisible: (id: string) => boolean;
  toggleSeries: (id: string) => void;

  // --- sync ----------------------------------------------------------------
  syncId: Accessor<string | number | undefined>;
  syncMethod: Accessor<SyncMethod | undefined>;
  syncInteraction: Accessor<SyncInteraction | null>;
  setSyncInteraction: Setter<SyncInteraction | null>;
  emitterSymbol: symbol;

  // --- pointer ------------------------------------------------------------
  pointerPosition: Accessor<{ x: number; y: number } | null>;
  pointerInChart: Accessor<boolean>;
  wrapperRef: Accessor<HTMLDivElement | null>;

  // --- coordinate conversions --------------------------------------------
  toSvgPosition: (position: number, dimension: "width" | "height") => number;
  toContainerPosition: (position: number, dimension: "width" | "height") => number;
};

export const ChartContext = createContext<ChartContextType<any>>();

export const useChartContext = <TData extends unknown[] = unknown[]>(): ChartContextType<TData> => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error(
      "[peculiar-charts]: Chart context not found. Make sure to wrap chart components in <Chart>",
    );
  }
  return context;
};
