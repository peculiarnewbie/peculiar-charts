import { useChartContext } from "@src/components/context";
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  createPresence,
  resolveAnimation,
} from "@src/lib/animation";
import createBands, { barScopeKey, type BarLayout } from "@src/lib/createBands";
import createBaseLine from "@src/lib/createBaseLine";
import createPoints from "@src/lib/createPoints";
import createSeries from "@src/lib/createSeries";
import {
  BarShape,
  type BarShapeProps,
  type BarShapeRenderer,
  type PointEvents,
} from "@src/lib/markers";
import type { OverrideProps } from "@src/lib/types";
import { accessData } from "@src/lib/utils";
import {
  type ComponentProps,
  For,
  Show,
  createEffect,
  createMemo,
  createUniqueId,
  mergeProps,
  onCleanup,
  splitProps,
} from "solid-js";

export type BarProps = OverrideProps<
  Omit<ComponentProps<"rect">, "x" | "width" | "y" | "height">,
  {
    /** Data key for the value-axis values. Omit for plain number arrays. */
    dataKey?: string;
    /** Per-series data array. Overrides chart-level `data` for this series. */
    data?: unknown[];
    /** Display name for legends/tooltips. @defaultValue `dataKey` */
    name?: string;
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string;
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string;
    /** Stack id — series sharing one stack are stacked. */
    stackId?: string;
    /** Bar orientation. @defaultValue `'vertical'` */
    layout?: BarLayout;
    /** Custom bar rendering — bool, props-object, or function. @defaultValue `true` */
    shape?: BarShapeRenderer;
    /** Minimum px size for non-zero bars. Useful when values are visually tiny. */
    minPointSize?: number;
    /** Full-slot bar backgrounds — `true` or SVG rect props. */
    background?: boolean | BarBackgroundProps;
    /** Explicit colour for legend / tooltip swatches. */
    color?: string;
    /** Animation configuration. */
    animation?: AnimationOptions;
  } & PointEvents
>;

type BarRect = { x: number; y: number; width: number; height: number; index: number };

/** Props for a bar's optional full-slot background rectangle. */
export type BarBackgroundProps = BarShapeProps;

/** Bar series.
 *
 * @data `data-pc-bar-group` - Present on every bar group element.
 * @data `data-pc-bar` - Present on every bar rect element.
 */
const Bar = (props: BarProps) => {
  const seriesId = createUniqueId();
  const defaultedProps = mergeProps(
    {
      xAxisId: "x",
      yAxisId: "y",
      layout: "vertical" as const,
      fill: "currentColor",
      stroke: "none",
    },
    props,
  );
  const [localProps, eventProps, otherProps] = splitProps(
    defaultedProps,
    [
      "dataKey",
      "name",
      "data",
      "xAxisId",
      "yAxisId",
      "stackId",
      "layout",
      "shape",
      "minPointSize",
      "background",
      "color",
      "animation",
    ],
    ["onPointClick", "onPointEnter", "onPointLeave"],
  );
  const chartContext = useChartContext();
  const horizontal = () => localProps.layout === "horizontal";

  // Reserve a slot in the grouped-bar layout while visible.
  createEffect(() => {
    if (!chartContext.isSeriesVisible(seriesId)) return;
    const scopeKey = barScopeKey(
      localProps.layout,
      horizontal() ? localProps.yAxisId : localProps.xAxisId,
    );
    const slotKey = localProps.stackId ?? seriesId;
    chartContext.registerBar(scopeKey, slotKey, seriesId);
    onCleanup(() => chartContext.unregisterBar(scopeKey, slotKey, seriesId));
  });

  const seriesRawData = () => localProps.data;

  const data = createMemo(() =>
    accessData<number>(localProps.data ?? chartContext.displayedData(), localProps.dataKey),
  );

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? "series",
    type: "bar",
    layout: () => localProps.layout,
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    valueAxisId: () => (horizontal() ? localProps.xAxisId : localProps.yAxisId),
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    color: () => localProps.color,
    chartContext,
  });

  const points = createPoints({
    seriesId,
    layout: () => localProps.layout,
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    seriesData: seriesRawData,
    chartContext,
  });

  const baseLine = createBaseLine({
    seriesId,
    layout: () => localProps.layout,
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  });

  const bands = createBands({
    seriesId,
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    stackId: () => localProps.stackId,
    layout: () => localProps.layout,
    data,
    chartContext,
  });

  const bars = (): BarRect[] => {
    const _points = points();
    const _baseLine = baseLine();
    const baseLineValues = Array.isArray(_baseLine)
      ? _baseLine
      : Array.from({ length: _points.length }, () => _baseLine);
    const _bands = bands();

    return _points.map((point, i) => {
      const band = _bands[i]!;
      const base = baseLineValues[i]!;
      if (horizontal()) {
        const xValue = point[0];
        const width = Math.abs(xValue - base);
        const minSize = width > 0 ? Math.max(0, localProps.minPointSize ?? 0) : 0;
        const resolvedWidth = Math.max(width, minSize);
        return {
          x: xValue >= base ? base : base - resolvedWidth,
          y: band.y,
          width: resolvedWidth,
          height: band.height,
          index: i,
        };
      }
      const yValue = point[1];
      const height = Math.abs(yValue - base);
      const minSize = height > 0 ? Math.max(0, localProps.minPointSize ?? 0) : 0;
      const resolvedHeight = Math.max(height, minSize);
      return {
        x: band.x,
        y: yValue >= base ? base : base - resolvedHeight,
        width: band.width,
        height: resolvedHeight,
        index: i,
      };
    });
  };

  const backgroundBars = (): BarRect[] => {
    const _bands = bands();
    const left = chartContext.getInset("left");
    const right = chartContext.width() - chartContext.getInset("right");
    const top = chartContext.getInset("top");
    const bottom = chartContext.height() - chartContext.getInset("bottom");
    return _bands.map((band, index) =>
      horizontal()
        ? { x: left, y: band.y, width: right - left, height: band.height, index }
        : { x: band.x, y: top, width: band.width, height: bottom - top, index },
    );
  };

  const backgroundProps = () => {
    const background = localProps.background;
    if (!background) return undefined;
    return mergeProps(
      { fill: "currentColor", "fill-opacity": 0.12, stroke: "none" } as BarBackgroundProps,
      background === true ? {} : background,
    );
  };

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  );
  const enterBar = (bar: BarRect): BarRect => {
    const _baseLine = baseLine();
    const bl = Array.isArray(_baseLine) ? _baseLine[0] : _baseLine;
    if (horizontal()) {
      return { x: bl ?? 0, y: bar.y, width: 0, height: bar.height, index: bar.index };
    }
    return { x: bar.x, y: bl ?? 0, width: bar.width, height: 0, index: bar.index };
  };
  const exitBar = (bar: BarRect): BarRect => {
    if (horizontal()) {
      return { x: bar.x, y: bar.y, width: 0, height: bar.height, index: bar.index };
    }
    return { x: bar.x, y: bar.y + bar.height, width: bar.width, height: 0, index: bar.index };
  };
  const animatedBars = createPresence(
    bars,
    animOpts,
    (a, b, t) => ({
      x: a.x + (b.x - a.x) * t,
      width: a.width + (b.width - a.width) * t,
      y: a.y + (b.y - a.y) * t,
      height: a.height + (b.height - a.height) * t,
      index: b.index,
    }),
    enterBar,
    exitBar,
  );

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <g data-pc-bar-group="">
        <Show when={backgroundProps()}>
          <For each={backgroundBars()}>
            {(bar) => (
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                data-pc-bar-background=""
                {...backgroundProps()}
              />
            )}
          </For>
        </Show>
        <For each={animatedBars()}>
          {(item) => {
            const bar = () => item.value;
            const idx = () => bar().index;
            return (
              <BarShape
                renderer={localProps.shape ?? true}
                bar={bar()}
                value={data()[idx()] as number}
                index={idx()}
                defaults={otherProps}
                events={item.mode === "exit" ? undefined : eventProps}
              />
            );
          }}
        </For>
      </g>
    </Show>
  );
};

export default Bar;
