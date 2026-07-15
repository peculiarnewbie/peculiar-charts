import { type AxisOrientation, ChartContext, type ChartContextType } from "@src/components/context";
import { resolveAxisDomain } from "@src/lib/resolveAxisDomain";
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

  const getDomain = (axisId: string, orientation: AxisOrientation) => {
    const config = ctx.getAxisConfig(axisId, orientation);
    return resolveAxisDomain({
      config,
      orientation,
      data: props.data(),
      extents: extents().get(axisId)?.values(),
    });
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
