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
import createBaseLine from "@src/lib/createBaseLine";
import createPoints from "@src/lib/createPoints";
import createScale from "@src/lib/createScale";
import createSeries from "@src/lib/createSeries";
import type { DotRenderer, PointEvents } from "@src/lib/markers";
import { clipPathForAxes } from "@src/lib/overflow";
import { projectScale } from "@src/lib/scale";
import type { OverrideProps } from "@src/lib/types";
import { accessData } from "@src/lib/utils";
import DotsLayer from "@src/series/Dots";
import Curve from "@src/shapes/Curve";
import type { CurveFactory } from "d3-shape";
import {
  type ComponentProps,
  type JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  splitProps,
} from "solid-js";

/** Props forwarded to a custom Area shape function. */
export type AreaShapeProps = ShapeAnimationProps &
  Omit<ComponentProps<"path">, "d"> & {
    points: [number, number][];
    baseLine: number | number[];
  };

/**
 * How to render a custom Area shape:
 * - a function — receives {@link AreaShapeProps}, returns JSX.
 */
export type AreaShapeRenderer = (props: AreaShapeProps) => JSX.Element;

export type AreaProps = OverrideProps<
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
    /** Area orientation. `'horizontal'` swaps axes: categories on Y, values on X. @defaultValue `'vertical'` */
    layout?: BarLayout;
    /** d3 curve interpolation factory. */
    curve?: CurveFactory;
    /** Connect across null/missing values. */
    connectNulls?: boolean;
    /** Fill for the portion above the zero baseline. Enables fill-by-value
     * (the area is split at zero), overriding `fill`. */
    positiveFill?: string;
    /** Fill for the portion below the zero baseline. Enables fill-by-value. */
    negativeFill?: string;
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
     * Receives the computed pixel-space points, baseline, SVG path props, and animation state.
     */
    shape?: AreaShapeRenderer;
  } & PointEvents
>;

/** Area series.
 *
 * @data `data-pc-area` - Present on every area path element.
 */
const Area = (props: AreaProps) => {
  const seriesId = createUniqueId();
  const clipId = createUniqueId();
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
      "positiveFill",
      "negativeFill",
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
  const valueAxisId = () => (horizontal() ? localProps.xAxisId : localProps.yAxisId);

  const seriesRawData = () => localProps.data;

  const rawData = createMemo(() =>
    accessData<number | [number, number]>(
      localProps.data ?? chartContext.displayedData(),
      localProps.dataKey,
    ),
  );

  const isRange = createMemo(() => Array.isArray(rawData()[0]));

  const data = createMemo(() => {
    const raw = rawData();
    if (!isRange()) return raw as number[];
    return (raw as [number, number][]).map((pair) => pair[1]);
  });

  const rangeBaseLine = createMemo(() => {
    if (!isRange()) return null;
    return (rawData() as [number, number][]).map((pair) => pair[0]);
  });

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? "series",
    type: "area",
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    valueAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    color: () => localProps.color,
    chartContext,
  });

  const rangeExtent = createMemo(() => {
    if (!isRange()) return null;
    const raw = rawData() as [number, number][];
    return {
      min: Math.min(...raw.map((pair) => pair[0])),
      max: Math.max(...raw.map((pair) => pair[1])),
    };
  });
  const valueScale = createScale({
    axisId: valueAxisId,
    orientation: () => (horizontal() ? "x" : "y"),
    chartContext,
  });
  createEffect(() => {
    const ext = rangeExtent();
    if (!ext) return;
    chartContext.registerExtent(valueAxisId(), seriesId, ext);
    onCleanup(() => chartContext.unregisterExtent(valueAxisId(), seriesId));
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

  const stackedBaseLine = createBaseLine({
    layout: () => localProps.layout,
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  });

  const baseLine = createMemo<number | number[]>(() => {
    const lower = rangeBaseLine();
    if (!lower) return stackedBaseLine();
    const _valueScale = valueScale();
    return lower.map((v) => projectScale(_valueScale, v));
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
  const animatedBaseLine = createTweenedArray(
    () => {
      const bl = baseLine();
      return Array.isArray(bl) ? bl : [bl];
    },
    animOpts,
    (a, b, t) => a + (b - a) * t,
    (target) => target,
    undefined,
    () => {
      const bl = baseLine();
      return Array.isArray(bl) ? animationKeys() : undefined;
    },
  );
  const resolvedAnimatedBaseLine = () => {
    const bl = baseLine();
    if (!Array.isArray(bl)) return bl;
    return animatedBaseLine();
  };

  const fillByValue = () =>
    localProps.positiveFill !== undefined || localProps.negativeFill !== undefined;

  const zeroPos = () => projectScale(valueScale(), 0);

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
              baseLine: resolvedAnimatedBaseLine(),
              animationElapsedTime: animElapsed(),
              isAnimating: isAnimating(),
              isEntrance: isEntrance() && animOpts().enabled !== false,
              ...otherProps,
            }))()
        ) : (
          <Show
            when={fillByValue()}
            fallback={
              <Curve
                points={animatedPoints()}
                baseLine={resolvedAnimatedBaseLine()}
                layout={localProps.layout}
                data-pc-area=""
                {...otherProps}
              />
            }
          >
            <defs>
              <clipPath id={`${clipId}-pos`}>
                {horizontal() ? (
                  <rect
                    x={zeroPos()}
                    y={0}
                    width={Math.max(0, chartContext.width() - zeroPos())}
                    height={chartContext.height()}
                  />
                ) : (
                  <rect x={0} y={0} width={chartContext.width()} height={zeroPos()} />
                )}
              </clipPath>
              <clipPath id={`${clipId}-neg`}>
                {horizontal() ? (
                  <rect x={0} y={0} width={zeroPos()} height={chartContext.height()} />
                ) : (
                  <rect
                    x={0}
                    y={zeroPos()}
                    width={chartContext.width()}
                    height={Math.max(0, chartContext.height() - zeroPos())}
                  />
                )}
              </clipPath>
            </defs>
            <Curve
              points={animatedPoints()}
              baseLine={zeroPos()}
              layout={localProps.layout}
              data-pc-area=""
              {...otherProps}
              fill={localProps.positiveFill ?? "none"}
              clip-path={`url(#${clipId}-pos)`}
            />
            <Curve
              points={animatedPoints()}
              baseLine={zeroPos()}
              layout={localProps.layout}
              data-pc-area=""
              {...otherProps}
              fill={localProps.negativeFill ?? "none"}
              clip-path={`url(#${clipId}-neg)`}
            />
          </Show>
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

export default Area;
