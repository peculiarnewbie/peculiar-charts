import { combineStyle } from "@corvu/utils/dom";
import { mergeRefs } from "@corvu/utils/reactivity";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import {
  type BarConfig,
  ChartContext,
  type Edge,
  type SeriesMeta,
  type StackOffset,
  type SyncInteraction,
} from "@src/components/context";
import { createAxisController } from "@src/components/controllers/createAxisController";
import { createSeriesController } from "@src/components/controllers/createSeriesController";
import { createStackBarController } from "@src/components/controllers/createStackBarController";
import createSize from "@src/lib/dom/createSize";
import { resolveBarConfig } from "@src/lib/barConfig";
import { resolveCartesianScale } from "@src/lib/resolveCartesianScale";
import { type Scale, projectScale } from "@src/lib/scale";
import { type SyncMethod, type SyncPayload, syncBus } from "@src/lib/sync";
import type { OverrideProps } from "@src/lib/types";
import { accessData, axisValues, getBarPadding } from "@src/lib/utils";
import {
  type ComponentProps,
  type JSX,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  splitProps,
} from "solid-js";
import { isDev } from "solid-js/web";

/** Context provided to chart-level event callbacks. */
export type ChartEventPayload<TData extends unknown[] = unknown[]> = {
  /** The original pointer event. */
  event: PointerEvent;
  /** Pointer position in SVG viewBox coordinates. */
  x: number;
  y: number;
  /** Index of the closest datum, or `null` if outside the plot area. */
  index: number | null;
  /** Full data row at the active index. */
  datum: TData[number] | undefined;
  /** Visible series with values resolved at `index`. */
  series: (SeriesMeta & { value: unknown })[];
};

const DEFAULT_INSET = 8;

export type ChartProps<TData extends unknown[] = unknown[]> = OverrideProps<
  Omit<ComponentProps<"svg">, "viewBox">,
  {
    /** Data array — either a flat array of numbers or an array of objects. */
    data: TData;
    /**
     * Optional Standard Schema validator for `data`. When provided in dev
     * mode, the data is validated at mount and console warnings are emitted
     * for validation issues. Works with Zod, Valibot, ArkType, or any
     * Standard Schema–compatible library.
     */
    schema?: StandardSchemaV1<TData>;
    /** viewBox width. `'responsive'` tracks the container. @defaultValue `'responsive'` */
    width?: "responsive" | number;
    /** viewBox height. `'responsive'` tracks the container. @defaultValue `'responsive'` */
    height?: "responsive" | number;
    /** Padding reserved inside the plot area. @defaultValue `8` */
    inset?: number | { top?: number; right?: number; bottom?: number; left?: number };
    /** Global bar series configuration. */
    barConfig?: Partial<BarConfig>;
    /**
     * Stack offset mode.
     * - `'none'` (default): raw cumulative stacking.
     * - `'expand'`: normalize stacked values to 0–1 (percentage stacking).
     * - `'silhouette'`: center each stack around zero (streamgraph).
     * - `'sign'`: stack positive and negative values separately.
     */
    stackOffset?: StackOffset;
    /**
     * Sync identifier. Charts sharing the same `syncId` synchronise their
     * tooltips and crosshairs — hovering one chart shows the tooltip on all.
     */
    syncId?: string | number;
    /**
     * How to match ticks across synced charts.
     * - `'index'`: use the data index directly (default)
     * - `'value'`: match by tick label string
     * - `function`: custom callback receiving (ticks, handlerParam) → index
     */
    syncMethod?: SyncMethod;
    /**
     * Category-axis ID used for chart-level events and cross-chart sync.
     * Charts with multiple x axes must select one explicitly. @defaultValue `'x'`
     */
    interactionAxisId?: string;
    /** Fired when the pointer is clicked on the chart. */
    onChartClick?: (payload: ChartEventPayload<TData>) => void;
    /** Fired when the pointer moves over the chart. */
    onChartPointerMove?: (payload: ChartEventPayload<TData>) => void;
    /** Fired when the pointer leaves the chart. */
    onChartPointerLeave?: (payload: ChartEventPayload<TData>) => void;
    /** Fired when a pointer button is pressed on the chart. */
    onChartPointerDown?: (payload: ChartEventPayload<TData>) => void;
    /** Fired when a pointer button is released on the chart. */
    onChartPointerUp?: (payload: ChartEventPayload<TData>) => void;
    /** @hidden */
    children?: JSX.Element;
  }
>;

/**
 * Root svg element and context provider for a chart.
 *
 * @data `data-pc-chart` - Present on every chart svg element.
 * @data `data-pc-wrapper` - Present on every chart wrapper element.
 */
const Chart = <TData extends unknown[]>(props: ChartProps<TData>) => {
  if (isDev && !Array.isArray(props.data)) {
    throw new Error(`[peculiar-charts]: <Chart> requires a data array, got ${typeof props.data}`);
  }

  if (isDev && props.schema) {
    const result = (props.schema as StandardSchemaV1)["~standard"].validate(props.data);
    if (result instanceof Promise) {
      console.warn(
        "[peculiar-charts]: Async schema validation is not supported at render time. Data will not be validated.",
      );
    } else if (result.issues?.length) {
      console.warn("[peculiar-charts]: Schema validation issues:", result.issues);
    }
  }

  const defaultedProps = mergeProps(
    {
      width: "responsive" as const,
      height: "responsive" as const,
      inset: DEFAULT_INSET,
      interactionAxisId: "x",
    },
    props,
  );

  const [localProps, otherProps] = splitProps(defaultedProps, [
    "data",
    "schema",
    "width",
    "height",
    "inset",
    "barConfig",
    "stackOffset",
    "ref",
    "style",
    "syncId",
    "syncMethod",
    "interactionAxisId",
    "onChartClick",
    "onChartPointerMove",
    "onChartPointerLeave",
    "onChartPointerDown",
    "onChartPointerUp",
  ]);

  // Keep a typed reference to the data — mergeProps/splitProps widen generics.
  const data = () => props.data;
  const barConfig = createMemo(() => resolveBarConfig(localProps.barConfig));
  const clipId = createUniqueId();

  // --- emitter symbol (self-guard for sync; one per chart instance) --------
  const emitterSymbol = Symbol("peculiar-chart-emitter");

  // --- insets -------------------------------------------------------------
  const [inset, setInset] = createSignal<Record<Edge, Map<string, number>>>({
    top: new Map(),
    right: new Map(),
    bottom: new Map(),
    left: new Map(),
  });

  const stackBarController = createStackBarController();
  const seriesController = createSeriesController();

  // --- brush ---------------------------------------------------------------
  const [brushRange, setBrushRange] = createSignal<{
    startIndex: number;
    endIndex: number;
  } | null>(null);

  const displayedData = createMemo(() => {
    const range = brushRange();
    const d = data();
    if (!range) return d;
    return d.slice(range.startIndex, range.endIndex + 1);
  });
  const axisController = createAxisController(() => displayedData());

  const [pointerPosition, setPointerPosition] = createSignal<{
    x: number;
    y: number;
  } | null>(null);

  // --- sync interaction state ---------------------------------------------
  const [syncInteraction, setSyncInteraction] = createSignal<SyncInteraction | null>(null);

  const isReceivingSync = () => syncInteraction()?.sourceViewBox != null;

  const [svgRef, setSvgRef] = createSignal<SVGElement | null>(null);
  const [wrapperRef, setWrapperRef] = createSignal<HTMLDivElement | null>(null);

  // --- size ---------------------------------------------------------------
  const containerSize = createSize({
    element: () => svgRef()?.parentElement ?? null,
  });

  createEffect(() => {
    const _inset = localProps.inset;
    setInset((prev) => {
      const next = { ...prev };
      if (typeof _inset === "number") {
        next.top.set("inset", _inset);
        next.right.set("inset", _inset);
        next.bottom.set("inset", _inset);
        next.left.set("inset", _inset);
      } else {
        next.top.set("inset", _inset.top ?? DEFAULT_INSET);
        next.right.set("inset", _inset.right ?? DEFAULT_INSET);
        next.bottom.set("inset", _inset.bottom ?? DEFAULT_INSET);
        next.left.set("inset", _inset.left ?? DEFAULT_INSET);
      }
      return next;
    });
  });

  const resolveSize = (size: "responsive" | number, dimension: "width" | "height") => {
    if (size === "responsive") {
      const _containerSize = containerSize();
      if (!_containerSize) return 0;
      return dimension === "width" ? _containerSize[0] : _containerSize[1];
    }
    return size;
  };

  const svgSize = createMemo(
    () =>
      [resolveSize(localProps.width, "width"), resolveSize(localProps.height, "height")] as [
        number,
        number,
      ],
  );

  const getInset = (edge: Edge, exclude?: string) => {
    let total = 0;
    for (const [key, value] of inset()[edge]) {
      if (key === exclude) continue;
      total += value;
    }
    return total;
  };

  const toSvgPosition = (position: number, dimension: "width" | "height") => {
    const _containerSize = containerSize()?.[dimension === "width" ? 0 : 1];
    if (!_containerSize) return 0;
    const _svgSize = svgSize()[dimension === "width" ? 0 : 1];
    return (position / _containerSize) * _svgSize;
  };

  const toContainerPosition = (position: number, dimension: "width" | "height") => {
    const _containerSize = containerSize()?.[dimension === "width" ? 0 : 1];
    if (!_containerSize) return 0;
    const _svgSize = svgSize()[dimension === "width" ? 0 : 1];
    return (position / _svgSize) * _containerSize;
  };

  const pointerInChart = createMemo(() => {
    const _pointerPosition = pointerPosition();
    if (!_pointerPosition) return false;
    const left = getInset("left");
    const right = svgSize()[0] - getInset("right");
    const top = getInset("top");
    const bottom = svgSize()[1] - getInset("bottom");
    const x = toSvgPosition(_pointerPosition.x, "width");
    const y = toSvgPosition(_pointerPosition.y, "height");
    return x >= left && x <= right && y >= top && y <= bottom;
  });

  const { getAxisConfig, getDomain } = axisController;
  const { seriesMeta, isSeriesVisible } = seriesController;
  const { bars } = stackBarController;

  // --- interaction-axis scale (for chart events + sync) -------------------
  const interactionScale = createMemo(() => {
    const axisId = localProps.interactionAxisId;
    const config = getAxisConfig(axisId, "x");
    return resolveCartesianScale({
      config,
      domain: getDomain(axisId, "x"),
      orientation: "x",
      width: svgSize()[0],
      height: svgSize()[1],
      insets: {
        top: getInset("top"),
        right: getInset("right"),
        bottom: getInset("bottom"),
        left: getInset("left"),
      },
      barPadding: getBarPadding({
        bars,
        getInset,
        width: () => svgSize()[0],
        displayedData,
        barConfig,
      }),
    });
  });

  const interactionAxisValues = createMemo(() =>
    axisValues({ getAxisConfig, displayedData }, localProps.interactionAxisId, "x"),
  );

  // --- sync emission helpers ----------------------------------------------
  const findClosestTickIndex = (scale: Scale, values: any[], svgX: number): number => {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < values.length; i++) {
      const projected = projectScale(scale, values[i]);
      if (!Number.isFinite(projected)) continue;
      const distance = Math.abs(projected - svgX);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    return bestIndex;
  };

  const viewBox = createMemo(() => ({
    x: getInset("left"),
    y: getInset("top"),
    width: Math.max(0, svgSize()[0] - getInset("left") - getInset("right")),
    height: Math.max(0, svgSize()[1] - getInset("top") - getInset("bottom")),
  }));

  // Sync consumers resolve by datum index, so rebroadcasting movements within
  // the same tick only creates needless work in every linked chart.
  let lastEmittedSyncState: string | undefined;

  const emitSync = (active: boolean, index: number | null, label: string | undefined) => {
    if (isReceivingSync()) return;
    const syncId = localProps.syncId;
    if (syncId == null) return;
    const state = `${String(syncId)}:${localProps.interactionAxisId}:${active}:${index ?? ""}:${label ?? ""}`;
    if (state === lastEmittedSyncState) return;
    lastEmittedSyncState = state;
    const coord: SyncPayload["coordinate"] = active
      ? {
          x: toSvgPosition(pointerPosition()?.x ?? 0, "width"),
          y: toSvgPosition(pointerPosition()?.y ?? 0, "height"),
        }
      : undefined;
    const sourceViewBox = active ? viewBox() : undefined;
    syncBus.emit(
      syncId,
      {
        active,
        index,
        axisId: localProps.interactionAxisId,
        coordinate: coord,
        label,
        dataKey: undefined,
        sourceViewBox,
      },
      emitterSymbol,
    );
  };

  // --- sync listener -------------------------------------------------------
  createEffect(() => {
    const currentSyncId = localProps.syncId;
    if (currentSyncId == null) return;

    const listener = (
      incomingSyncId: string | number,
      payload: SyncPayload,
      emittingSymbol: symbol,
    ) => {
      if (emittingSymbol === emitterSymbol) return;
      if (incomingSyncId !== currentSyncId) return;
      // A remote interaction supersedes the local emission state. If this
      // chart becomes the source again, it must be able to announce its state.
      lastEmittedSyncState = undefined;

      if (!payload.active) {
        setSyncInteraction({
          active: false,
          index: null,
          axisId: payload.axisId,
          label: undefined,
          dataKey: undefined,
          sourceViewBox: undefined,
        });
        return;
      }

      const syncMethod = localProps.syncMethod ?? "index";
      const ticks = interactionAxisValues();
      let activeIndex: number | null = null;

      if (payload.index == null) {
        setSyncInteraction({
          active: false,
          index: null,
          axisId: payload.axisId,
          label: undefined,
          dataKey: undefined,
          sourceViewBox: payload.sourceViewBox,
        });
        return;
      }

      if (syncMethod === "index") {
        activeIndex = payload.index;
      } else if (syncMethod === "value") {
        const matchIdx = ticks.findIndex((t: any) => String(t) === payload.label);
        activeIndex = matchIdx >= 0 ? matchIdx : null;
      } else if (typeof syncMethod === "function") {
        const param = {
          activeTooltipIndex: payload.index ?? undefined,
          isTooltipActive: payload.active,
          activeIndex: payload.index ?? undefined,
          activeLabel: payload.label,
          activeDataKey: payload.dataKey,
          activeCoordinate: payload.coordinate,
        };
        activeIndex = syncMethod(ticks, param) ?? null;
      }

      if (activeIndex == null || activeIndex < 0 || activeIndex >= ticks.length) {
        setSyncInteraction({
          active: false,
          index: null,
          axisId: payload.axisId,
          label: undefined,
          dataKey: undefined,
          sourceViewBox: payload.sourceViewBox,
        });
        return;
      }

      setSyncInteraction({
        active: true,
        index: activeIndex,
        axisId: payload.axisId,
        label: payload.label,
        dataKey: payload.dataKey,
        sourceViewBox: payload.sourceViewBox,
      });
    };

    syncBus.on(listener);
    onCleanup(() => syncBus.off(listener));
  });

  // --- chart-level event payload ------------------------------------------
  const buildChartEventPayload = (event: PointerEvent): ChartEventPayload<TData> => {
    const svg = svgRef();
    if (!svg) {
      return { event, x: 0, y: 0, index: null, datum: undefined, series: [] };
    }
    const rect = svg.getBoundingClientRect();
    const containerX = event.clientX - rect.left;
    const containerY = event.clientY - rect.top;
    const svgX = toSvgPosition(containerX, "width");
    const svgY = toSvgPosition(containerY, "height");

    const left = getInset("left");
    const right = svgSize()[0] - getInset("right");
    const top = getInset("top");
    const bottom = svgSize()[1] - getInset("bottom");
    if (svgX < left || svgX > right || svgY < top || svgY > bottom) {
      return { event, x: svgX, y: svgY, index: null, datum: undefined, series: [] };
    }

    const data = displayedData();
    const ticks = interactionAxisValues();
    const idx = ticks.length ? findClosestTickIndex(interactionScale(), ticks, svgX) : null;

    const visibleSeries = seriesMeta()
      .filter((series) => isSeriesVisible(series.id))
      .map((s) => ({
        ...s,
        value:
          idx != null && s.dataKey !== undefined
            ? accessData<unknown>(data, s.dataKey)[idx]
            : undefined,
      }));

    return {
      event,
      x: svgX,
      y: svgY,
      index: idx,
      datum: idx != null ? data[idx] : undefined,
      series: visibleSeries,
    };
  };

  const fireChartPointerMove = (event: MouseEvent) => {
    const svg = svgRef();
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setPointerPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    if (localProps.syncId != null && !isReceivingSync()) {
      const svgX = toSvgPosition(event.clientX - rect.left, "width");
      const svgY = toSvgPosition(event.clientY - rect.top, "height");
      const left = getInset("left");
      const right = svgSize()[0] - getInset("right");
      const top = getInset("top");
      const bottom = svgSize()[1] - getInset("bottom");
      if (svgX >= left && svgX <= right && svgY >= top && svgY <= bottom) {
        const idx = findClosestTickIndex(interactionScale(), interactionAxisValues(), svgX);
        const label = String(interactionAxisValues()[idx] ?? "");
        emitSync(true, idx, label);
      } else {
        emitSync(false, null, undefined);
      }
    }
    localProps.onChartPointerMove?.(buildChartEventPayload(event as unknown as PointerEvent));
  };

  const fireChartPointerLeave = (event: MouseEvent) => {
    setPointerPosition(null);
    emitSync(false, null, undefined);
    localProps.onChartPointerLeave?.(buildChartEventPayload(event as unknown as PointerEvent));
  };

  const fireChartClick = (event: MouseEvent) => {
    localProps.onChartClick?.(buildChartEventPayload(event as unknown as PointerEvent));
  };

  const fireChartPointerDown = (event: MouseEvent) => {
    localProps.onChartPointerDown?.(buildChartEventPayload(event as unknown as PointerEvent));
  };

  const fireChartPointerUp = (event: MouseEvent) => {
    localProps.onChartPointerUp?.(buildChartEventPayload(event as unknown as PointerEvent));
  };

  return (
    <ChartContext.Provider
      value={{
        data,
        displayedData,
        brushRange,
        setBrushRange,
        width: () => svgSize()[0],
        height: () => svgSize()[1],
        plotClipPath: () => `url(#${clipId})`,
        getInset,
        registerInset: (edge, key, value) =>
          setInset((prev) => {
            const contributions = new Map(prev[edge]);
            contributions.set(key, value);
            return { ...prev, [edge]: contributions };
          }),
        unregisterInset: (edge, key) =>
          setInset((prev) => {
            const contributions = new Map(prev[edge]);
            contributions.delete(key);
            return { ...prev, [edge]: contributions };
          }),
        ...axisController,
        ...stackBarController,
        stackOffset: () => localProps.stackOffset,
        barConfig,
        ...seriesController,
        syncId: () => localProps.syncId,
        syncMethod: () => localProps.syncMethod,
        syncInteraction,
        setSyncInteraction,
        emitterSymbol,
        pointerPosition,
        pointerInChart,
        wrapperRef,
        toSvgPosition,
        toContainerPosition,
      }}
    >
      <div
        ref={setWrapperRef}
        style={{ position: "relative", width: "100%", height: "100%" }}
        data-pc-wrapper=""
      >
        <svg
          ref={mergeRefs(setSvgRef, localProps.ref)}
          style={combineStyle({ width: "100%", height: "100%" }, localProps.style)}
          viewBox={`0 0 ${svgSize()[0]} ${svgSize()[1]}`}
          onPointerMove={fireChartPointerMove}
          onPointerLeave={fireChartPointerLeave}
          onClick={fireChartClick}
          onPointerDown={fireChartPointerDown}
          onPointerUp={fireChartPointerUp}
          data-pc-chart=""
          {...otherProps}
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x={viewBox().x}
                y={viewBox().y}
                width={viewBox().width}
                height={viewBox().height}
              />
            </clipPath>
          </defs>
          {props.children}
        </svg>
      </div>
    </ChartContext.Provider>
  );
};

export default Chart;
