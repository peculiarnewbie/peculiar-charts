import { useChartContext } from "@src/components/context";
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  type ShapeAnimationProps,
  createTweenedArray,
  interpolatePoint,
  resolveAnimation,
} from "@src/lib/animation";
import type { BarLayout } from "@src/lib/createBands";
import createPoints from "@src/lib/createPoints";
import createSeries from "@src/lib/createSeries";
import type { DotRenderer, PointEvents } from "@src/lib/markers";
import { clipPathForAxes } from "@src/lib/overflow";
import type { OverrideProps } from "@src/lib/types";
import { accessData } from "@src/lib/utils";
import DotsLayer from "@src/series/Dots";
import Curve from "@src/shapes/Curve";
import type { CurveFactory } from "d3-shape";
import {
  type ComponentProps,
  type JSX,
  Show,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  splitProps,
} from "solid-js";

/** Props forwarded to a custom Line shape function. */
export type LineShapeProps = ShapeAnimationProps &
  Omit<ComponentProps<"path">, "d"> & {
    points: [number, number][];
  };

/**
 * How to render a custom Line shape:
 * - a function — receives {@link LineShapeProps}, returns JSX.
 */
export type LineShapeRenderer = (props: LineShapeProps) => JSX.Element;

export type LineProps = OverrideProps<
  Omit<ComponentProps<"path">, "d">,
  {
    /** Data key for the y-values. Omit for plain number arrays. */
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
    /** Line orientation. `'horizontal'` swaps axes: categories on Y, values on X. @defaultValue `'vertical'` */
    layout?: BarLayout;
    /** d3 curve interpolation factory. */
    curve?: CurveFactory;
    /** Connect across null/missing values. */
    connectNulls?: boolean;
    /** Marker at every point. `true`/props-object/function — see {@link DotRenderer}. */
    dot?: DotRenderer;
    /** Marker at the point nearest the pointer (hover highlight). */
    activeDot?: DotRenderer;
    /** Explicit colour for legend / tooltip swatches. */
    color?: string;
    /** Animation configuration. */
    animation?: AnimationOptions;
    /**
     * Custom shape renderer. Replaces the default `<Curve>` path.
     * Receives the computed pixel-space points, SVG path props, and animation state.
     */
    shape?: LineShapeRenderer;
  } & PointEvents
>;

/** Line series.
 *
 * @data `data-pc-line` - Present on every line path element.
 */
const Line = (props: LineProps) => {
  const seriesId = createUniqueId();
  const defaultedProps = mergeProps(
    {
      xAxisId: "x",
      yAxisId: "y",
      layout: "vertical" as const,
      stroke: "currentColor",
      fill: "none",
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
      "dot",
      "activeDot",
      "color",
      "animation",
      "shape",
    ],
    ["onPointClick", "onPointEnter", "onPointLeave"],
  );
  const chartContext = useChartContext();
  const horizontal = () => localProps.layout === "horizontal";

  const seriesRawData = () => localProps.data;

  const data = createMemo(() =>
    accessData<number>(localProps.data ?? chartContext.displayedData(), localProps.dataKey),
  );

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? "series",
    type: "line",
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
    layout: () => localProps.layout,
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    seriesData: seriesRawData,
    chartContext,
  });

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  );
  const animationKeys = createMemo<unknown[] | undefined>(() => {
    const matchBy = animOpts().matchBy;
    if (!matchBy || matchBy === "index") return undefined;
    const raw = (localProps.data ?? chartContext.displayedData()) as unknown[];
    if (typeof matchBy === "string") return accessData<unknown>(raw, matchBy);
    return raw.map((datum, index) => matchBy(datum, index, raw));
  });
  const NaN_POINT: [number, number] = [Number.NaN, Number.NaN];

  const [animElapsed, setAnimElapsed] = createSignal(1);
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [isEntrance, setIsEntrance] = createSignal(true);

  const animatedPoints = createTweenedArray(
    points,
    animOpts,
    (a, b, t) => animOpts().interpolate?.(a, b, t) ?? interpolatePoint(a, b, t),
    (target) => (Number.isNaN(target[0]) ? NaN_POINT : target),
    (elapsed) => {
      setAnimElapsed(elapsed);
      if (elapsed < 1) {
        setIsAnimating(true);
      } else {
        setIsAnimating(false);
        setIsEntrance(false);
      }
    },
    animationKeys,
  );

  const hasShape = () => localProps.shape !== undefined;
  const clipPath = () =>
    clipPathForAxes(chartContext, [
      { axisId: localProps.xAxisId, orientation: "x" },
      { axisId: localProps.yAxisId, orientation: "y" },
    ]);

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <g clip-path={clipPath()}>
        {hasShape() ? (
          (() =>
            localProps.shape!({
              points: animatedPoints(),
              animationElapsedTime: animElapsed(),
              isAnimating: isAnimating(),
              isEntrance: isEntrance() && animOpts().enabled !== false,
              ...otherProps,
            }))()
        ) : (
          <Curve
            points={animatedPoints()}
            layout={localProps.layout}
            data-pc-line=""
            {...otherProps}
          />
        )}
        <Show when={localProps.dot || localProps.activeDot}>
          <DotsLayer
            points={animatedPoints}
            data={data}
            xAxisId={() => localProps.xAxisId}
            yAxisId={() => localProps.yAxisId}
            layout={() => localProps.layout}
            dot={localProps.dot}
            activeDot={localProps.activeDot}
            events={eventProps}
          />
        </Show>
      </g>
    </Show>
  );
};

export default Line;
