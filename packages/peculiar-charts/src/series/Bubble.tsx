import { dataIf } from "@corvu/utils";
import { useChartContext } from "@src/components/context";
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  createPresence,
  resolveAnimation,
} from "@src/lib/animation";
import createClosestTick from "@src/lib/createClosestTick";
import createPoints from "@src/lib/createPoints";
import createScale from "@src/lib/createScale";
import createSeries from "@src/lib/createSeries";
import { type PointEvents, pointEvents } from "@src/lib/markers";
import type { OverrideProps } from "@src/lib/types";
import { accessData, axisValues, pointDefined } from "@src/lib/utils";
import {
  type ComponentProps,
  For,
  type JSX,
  Show,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
} from "solid-js";

/** A bubble's pixel position and radius plus the datum it came from. */
export type BubbleDatum = {
  point: [number, number];
  /** The y-value. */
  value: number;
  /** The size-value (z) before scaling. */
  size: number;
  /** The mapped pixel radius. */
  radius: number;
  index: number;
  active: boolean;
};

export type BubbleProps = OverrideProps<
  Omit<ComponentProps<"circle">, "cx" | "cy" | "r">,
  {
    /** Data key for the y-values. Omit for plain number arrays. */
    dataKey?: string;
    /** Data key for the size (z) values driving each bubble's radius. */
    sizeKey?: string;
    /** `[minRadius, maxRadius]` in pixels. @defaultValue `[4, 24]` */
    sizeRange?: [number, number];
    /** Explicit `[min, max]` size domain. Defaults to the data extent. */
    sizeDomain?: [number, number];
    /** Display name for legends/tooltips. @defaultValue `dataKey` */
    name?: string;
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string;
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string;
    /** `<circle>` props applied when the bubble is the active (hovered) one. */
    activeProps?: Omit<ComponentProps<"circle">, "cx" | "cy" | "r">;
    /** Render a custom marker per bubble instead of a `<circle>`. */
    children?: (datum: BubbleDatum) => JSX.Element;
    /** Explicit colour for legend / tooltip swatches. */
    color?: string;
    /** Animation configuration. */
    animation?: AnimationOptions;
  } & PointEvents
>;

/** Maps a size value to a pixel radius so that bubble *area* is proportional to
 * the value (radius scales with the square root of the value). */
const sizeToRadius = (
  z: number,
  [zMin, zMax]: [number, number],
  [rMin, rMax]: [number, number],
): number => {
  if (!Number.isFinite(z)) return Number.NaN;
  if (zMax === zMin) return rMax;
  const t = (z - zMin) / (zMax - zMin);
  return Math.sqrt(rMin * rMin + t * (rMax * rMax - rMin * rMin));
};

/** Bubble (scatter with sized markers) series.
 *
 * @data `data-pc-bubble-group` - Present on the bubble group element.
 * @data `data-pc-bubble` - Present on every bubble circle element.
 */
const Bubble = (props: BubbleProps) => {
  const seriesId = createUniqueId();
  const defaultedProps = mergeProps(
    {
      xAxisId: "x",
      yAxisId: "y",
      sizeRange: [4, 24] as [number, number],
      fill: "currentColor",
      "fill-opacity": 0.6,
    },
    props,
  );
  const [localProps, eventProps, otherProps] = splitProps(
    defaultedProps,
    [
      "dataKey",
      "sizeKey",
      "sizeRange",
      "sizeDomain",
      "name",
      "xAxisId",
      "yAxisId",
      "activeProps",
      "children",
      "color",
      "animation",
    ],
    ["onPointClick", "onPointEnter", "onPointLeave"],
  );
  const chartContext = useChartContext();

  const data = createMemo(() =>
    accessData<number>(chartContext.displayedData(), localProps.dataKey),
  );
  const sizeData = createMemo(() =>
    accessData<number>(chartContext.displayedData(), localProps.sizeKey),
  );

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? "series",
    type: "bubble",
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => undefined,
    data,
    color: () => localProps.color,
    chartContext,
  });

  const points = createPoints({
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => undefined,
    data,
    chartContext,
  });

  const sizeDomain = createMemo<[number, number]>(() => {
    if (localProps.sizeDomain) return localProps.sizeDomain;
    const nums = sizeData().filter((z) => Number.isFinite(z));
    return nums.length ? [Math.min(...nums), Math.max(...nums)] : [0, 1];
  });

  const radii = createMemo(() => {
    // No size key → uniform markers (a plain scatter), at the mid radius.
    if (localProps.sizeKey === undefined) {
      const [rMin, rMax] = localProps.sizeRange;
      const r = (rMin + rMax) / 2;
      return data().map(() => r);
    }
    return sizeData().map((z) => sizeToRadius(z, sizeDomain(), localProps.sizeRange));
  });

  const xScale = createScale({
    axisId: () => localProps.xAxisId,
    orientation: () => "x",
    chartContext,
  });

  const closestTick = createClosestTick({
    axis: () => "x",
    scale: xScale,
    values: () => axisValues(chartContext, localProps.xAxisId, "x"),
    chartContext,
  });

  const isActive = (index: number) =>
    chartContext.pointerInChart() && closestTick()?.index === index;

  const circleProps = (index: number) =>
    isActive(index) ? mergeProps(otherProps, localProps.activeProps) : otherProps;

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  );
  const circles = createMemo(() =>
    points().map((p, i) => ({
      cx: p[0],
      cy: p[1],
      r: radii()[i] ?? 0,
      index: i,
    })),
  );
  const animatedCircles = createPresence(
    circles,
    animOpts,
    (a, b, t) => ({
      cx: a.cx + (b.cx - a.cx) * t,
      cy: a.cy + (b.cy - a.cy) * t,
      r: a.r + (b.r - a.r) * t,
      index: b.index,
    }),
    (target) => ({ cx: target.cx, cy: target.cy, r: 0, index: target.index }),
    (current) => ({ cx: current.cx, cy: current.cy, r: 0, index: current.index }),
  );

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <g data-pc-bubble-group="">
        <For each={animatedCircles()}>
          {(item) => {
            const c = () => item.value;
            const dataIndex = () =>
              animatedCircles()
                .filter((i) => i.mode !== "exit")
                .indexOf(item);
            const valid = () =>
              pointDefined([c().cx, c().cy]) &&
              ((Number.isFinite(c().r) && c().r > 0) || item.mode === "exit");
            return (
              <Show when={valid()}>
                {item.mode === "exit" || !localProps.children ? (
                  <circle
                    cx={c().cx}
                    cy={c().cy}
                    data-active={dataIf(isActive(dataIndex()))}
                    data-pc-bubble=""
                    {...circleProps(dataIndex())}
                    {...(item.mode === "exit"
                      ? {}
                      : pointEvents(eventProps, () => ({
                          value: data()[dataIndex()] as number,
                          index: dataIndex(),
                          point: [c().cx, c().cy],
                        })))}
                    r={Math.max(0, c().r)}
                  />
                ) : (
                  localProps.children({
                    point: [c().cx, c().cy],
                    value: data()[dataIndex()] as number,
                    size: sizeData()[dataIndex()] as number,
                    radius: c().r,
                    index: dataIndex(),
                    active: isActive(dataIndex()),
                  })
                )}
              </Show>
            );
          }}
        </For>
      </g>
    </Show>
  );
};

export default Bubble;
