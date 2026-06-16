import {
  type AxisOrientation,
  ChartContext,
  type ChartContextType,
  type Domain,
} from "@src/components/context";
import { toNumeric } from "@src/lib/utils";
import { type Accessor, type JSX, createSignal } from "solid-js";

/**
 * Wraps brush children in a `ChartContext.Provider` that overrides dimensions,
 * disables registration (so preview series don't pollute the main chart), and
 * provides `displayedData` as the full data array.
 */
export const BrushContextProvider = (props: {
  mainContext: ChartContextType<any>;
  width: Accessor<number>;
  height: Accessor<number>;
  data: Accessor<any[]>;
  children: JSX.Element;
}) => {
  const [extents, setExtents] = createSignal(
    new Map<string, Map<string, { min: number; max: number }>>(),
  );

  const ctx = props.mainContext;

  const getDomain = (axisId: string, orientation: AxisOrientation): Domain => {
    const config = ctx.getAxisConfig(axisId, orientation);

    if (config.type === "band" || config.type === "point") {
      const values = config.dataKey
        ? [...new Set(accessData(props.data(), config.dataKey))]
        : Array.from({ length: props.data().length }, (_, i) => i);
      return { kind: "categorical", values };
    }

    const axisExtents = extents().get(axisId);
    if (axisExtents && axisExtents.size > 0) {
      const agg = [...axisExtents.values()].reduce(
        (acc, e) => ({
          min: Math.min(acc.min, e.min),
          max: Math.max(acc.max, e.max),
        }),
        { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
      );
      return {
        kind: "numeric",
        min: Math.min(agg.min, 0),
        max: agg.max,
        userDefined: false,
      };
    }

    // For numeric x-axis (e.g. time), derive domain from data values
    if (orientation === "x") {
      const raw = config.dataKey
        ? accessData<unknown>(props.data(), config.dataKey)
        : props.data().map((_, i) => i);
      const nums = raw.map(toNumeric).filter((n): n is number => n !== null);
      if (nums.length) {
        return {
          kind: "numeric",
          min: Math.min(...nums),
          max: Math.max(...nums),
          userDefined: false,
        };
      }
    }

    return { kind: "numeric", min: 0, max: 1, userDefined: false };
  };

  const noop = () => {};
  const noopInset = () => 0;
  const emptySet = () => new Set<string>();
  const emptyMap = () => new Map<string, Map<string, any>>();

  const value: ChartContextType<any> = {
    data: props.data,
    displayedData: props.data,
    brushRange: () => null,
    setBrushRange: noop,
    width: () => props.width(),
    height: () => props.height(),
    plotClipPath: () => "",

    getInset: noopInset,
    registerInset: noop,
    unregisterInset: noop,

    registerAxisConfig: noop,
    unregisterAxisConfig: noop,
    getAxisConfig: (id, orientation) => ctx.getAxisConfig(id, orientation),

    registerExtent: (axisId, seriesId, extent) =>
      setExtents((prev) => {
        const next = new Map(prev);
        const axis = new Map(next.get(axisId) ?? []);
        axis.set(seriesId, extent);
        next.set(axisId, axis);
        return next;
      }),
    unregisterExtent: (axisId, seriesId) =>
      setExtents((prev) => {
        const axis = prev.get(axisId);
        if (!axis) return prev;
        const next = new Map(prev);
        const nextAxis = new Map(axis);
        nextAxis.delete(seriesId);
        if (nextAxis.size === 0) next.delete(axisId);
        else next.set(axisId, nextAxis);
        return next;
      }),
    getDomain,

    stacks: emptyMap,
    stackOffset: ctx.stackOffset,
    registerStack: noop,
    unregisterStack: noop,

    bars: emptySet,
    registerBar: noop,
    unregisterBar: noop,
    barConfig: ctx.barConfig,

    seriesMeta: ctx.seriesMeta,
    registerSeriesMeta: noop,
    unregisterSeriesMeta: noop,
    isSeriesVisible: () => true,
    toggleSeries: noop,

    pointerPosition: () => null,
    pointerInChart: () => false,
    wrapperRef: () => null,

    syncId: () => undefined,
    syncMethod: () => undefined,
    syncInteraction: () => null,
    setSyncInteraction: noop,
    emitterSymbol: Symbol("brush-emitter"),

    toSvgPosition: (pos, dim) =>
      (pos / (dim === "width" ? props.width() : props.height())) *
      (dim === "width" ? props.width() : props.height()),
    toContainerPosition: (pos, dim) =>
      (pos / (dim === "width" ? props.width() : props.height())) *
      (dim === "width" ? props.width() : props.height()),
  };

  return <ChartContext.Provider value={value}>{props.children}</ChartContext.Provider>;
};

function accessData<T>(data: unknown, dataKey: string | undefined): T[] {
  if (!dataKey) return data as T[];
  const keys = dataKey.split(".");
  return (data as Record<string, any>[]).map((entry) =>
    keys.reduce((acc, key) => acc?.[key], entry),
  ) as T[];
}
