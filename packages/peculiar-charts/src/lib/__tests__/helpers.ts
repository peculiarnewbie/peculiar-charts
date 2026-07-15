import type {
  BarRegistry,
  ChartContextType,
  ScopedStack,
  SyncInteraction,
} from "@src/components/context";
import { createSignal } from "solid-js";

export const createMockChartContext = (overrides?: Partial<ChartContextType>): ChartContextType => {
  const [data] = createSignal<any[]>([]);
  const [width] = createSignal(800);
  const [height] = createSignal(400);
  const [seriesMeta] = createSignal<any[]>([]);
  const [hiddenSeries, setHiddenSeries] = createSignal(new Set<string>());
  const [stacks] = createSignal(new Map<string, ScopedStack>());
  const [bars, setBars] = createSignal<BarRegistry>(new Map());
  const [pointerPosition] = createSignal(null);
  const [syncInteraction, setSyncInteraction] = createSignal<SyncInteraction | null>(null);
  const [brushRange, setBrushRange] = createSignal(null);

  const axisConfigs = new Map<string, any>();
  const extents = new Map<string, Map<string, { min: number; max: number }>>();

  return {
    data,
    displayedData: data,
    brushRange,
    setBrushRange,
    width,
    height,
    plotClipPath: () => "url(#test-plot)",
    getInset: () => 0,
    registerInset: () => {},
    unregisterInset: () => {},
    registerAxisConfig: (axisId, _ownerId, config) => axisConfigs.set(axisId, config),
    unregisterAxisConfig: (axisId) => axisConfigs.delete(axisId),
    getAxisConfig: (axisId, orientation) =>
      axisConfigs.get(axisId) ?? {
        orientation,
        type: orientation === "x" ? "point" : "linear",
        range: null,
        reverse: false,
      },
    registerExtent: (axisId, seriesId, extent) => {
      let axis = extents.get(axisId);
      if (!axis) {
        axis = new Map();
        extents.set(axisId, axis);
      }
      axis.set(seriesId, extent);
    },
    unregisterExtent: (axisId, seriesId) => {
      extents.get(axisId)?.delete(seriesId);
    },
    getDomain: (axisId, _orientation) => {
      const config = axisConfigs.get(axisId);
      if (config?.type === "band" || config?.type === "point") {
        return { kind: "categorical" as const, values: [] };
      }
      return { kind: "numeric" as const, min: 0, max: 100, userDefined: false };
    },
    stacks,
    stackOffset: () => undefined,
    registerStack: () => {},
    unregisterStack: () => {},
    bars,
    registerBar: (scopeKey, slotKey, seriesId) =>
      setBars((prev) => {
        const next = new Map(prev);
        const slots = new Map(next.get(scopeKey) ?? []);
        slots.set(slotKey, new Set(slots.get(slotKey) ?? []).add(seriesId));
        next.set(scopeKey, slots);
        return next;
      }),
    unregisterBar: (scopeKey, slotKey, seriesId) =>
      setBars((prev) => {
        const next = new Map(prev);
        const slots = new Map(next.get(scopeKey) ?? []);
        const owners = new Set(slots.get(slotKey) ?? []);
        owners.delete(seriesId);
        if (owners.size) slots.set(slotKey, owners);
        else slots.delete(slotKey);
        if (slots.size) next.set(scopeKey, slots);
        else next.delete(scopeKey);
        return next;
      }),
    barConfig: () => ({ bandGap: "10%" as const, barGap: "10%" as const }),
    seriesMeta,
    registerSeriesMeta: () => {},
    unregisterSeriesMeta: () => {},
    isSeriesVisible: (id) => !hiddenSeries().has(id),
    toggleSeries: (id) =>
      setHiddenSeries((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    syncId: () => undefined,
    syncMethod: () => undefined,
    syncInteraction,
    setSyncInteraction,
    emitterSymbol: Symbol("test"),
    pointerPosition,
    pointerInChart: () => false,
    wrapperRef: () => null,
    toSvgPosition: (pos) => pos,
    toContainerPosition: (pos) => pos,
    ...overrides,
  };
};
