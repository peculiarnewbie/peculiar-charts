import { useChartContext } from "@src/components/context";
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  createPresence,
  resolveAnimation,
} from "@src/lib/animation";
import { type PointEvents, pointEvents } from "@src/lib/markers";
import { createPolarAngleScale, projectAngleScale } from "@src/lib/polar/scale";
import { polarToCartesian } from "@src/lib/polar/utils";
import { usePolarLayout } from "@src/lib/polar/context";
import createSeries from "@src/lib/createSeries";
import type { OverrideProps } from "@src/lib/types";
import { accessData } from "@src/lib/utils";
import Sector from "@src/shapes/Sector";
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

/** One radial bar's resolved sector and source value. */
export type RadialBarDatum = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  value: number;
  index: number;
  point: [number, number];
};

/** A radial-bar label adds a resolved SVG text position and anchor. */
export type RadialBarLabelDatum = RadialBarDatum & {
  labelPoint: [number, number];
  textAnchor: "start" | "middle" | "end";
};

/** How to render a radial-bar label. */
export type RadialBarLabelRenderer =
  | boolean
  | Omit<ComponentProps<"text">, "x" | "y" | "children">
  | ((datum: RadialBarLabelDatum) => JSX.Element);

export type RadialBarProps = OverrideProps<
  Omit<ComponentProps<"path">, "d">,
  {
    /** Data key for each bar's angular value. Omit for a plain number array. */
    dataKey?: string;
    /** Display name for legends/tooltips. @defaultValue `dataKey` */
    name?: string;
    /** Bound numeric angle-axis id. @defaultValue `'angle'` */
    angleAxisId?: string;
    /** Radial gap in px between concentric bars. @defaultValue `4` */
    barGap?: number;
    /** Explicit thickness in px for each concentric bar. */
    barSize?: number;
    /** Minimum non-zero angular span in radians. @defaultValue `0` */
    minAngle?: number;
    /** Rounded corner radius for bars in px. @defaultValue `0` */
    cornerRadius?: number;
    /** Draw the full angular track behind every bar — `true` or SVG path props. */
    background?: boolean | Omit<ComponentProps<"path">, "d">;
    /** Bar labels — `true`, SVG text props, or a custom render function. */
    label?: RadialBarLabelRenderer;
    /** Where to place default labels. @defaultValue `'inside'` */
    labelPosition?: "inside" | "outside";
    /** Distance in px beyond a ring for outside labels. @defaultValue `8` */
    labelOffset?: number;
    /** Explicit colour for the legend swatch. */
    color?: string;
    /** Animation configuration. */
    animation?: AnimationOptions;
  } & PointEvents
>;

/**
 * Concentric radial bars. Values map to angular spans using a numeric
 * `<PolarAngleAxis type="linear">`; data rows become rings from the inside out.
 *
 * @data `data-pc-radial-bar-group` - Present on the series group.
 * @data `data-pc-radial-bar` - Present on each rendered value sector.
 */
const RadialBar = (props: RadialBarProps) => {
  const seriesId = createUniqueId();
  const defaultedProps = mergeProps(
    {
      angleAxisId: "angle",
      barGap: 4,
      minAngle: 0,
      cornerRadius: 0,
      labelPosition: "inside" as const,
      labelOffset: 8,
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
      "angleAxisId",
      "barGap",
      "barSize",
      "minAngle",
      "cornerRadius",
      "background",
      "label",
      "labelPosition",
      "labelOffset",
      "color",
      "animation",
    ],
    ["onPointClick", "onPointEnter", "onPointLeave"],
  );
  const chartContext = useChartContext();
  const layout = usePolarLayout();

  const data = createMemo(() =>
    accessData<number>(chartContext.displayedData(), localProps.dataKey),
  );

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? "series",
    type: "radial-bar",
    yAxisId: () => localProps.angleAxisId,
    valueAxisId: () => localProps.angleAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => undefined,
    data,
    color: () => localProps.color,
    chartContext,
  });

  const angleScale = createPolarAngleScale({
    axisId: () => localProps.angleAxisId,
    layout,
    chartContext,
  });

  const withPoint = (bar: Omit<RadialBarDatum, "point">): RadialBarDatum => {
    const middleAngle = (bar.startAngle + bar.endAngle) / 2;
    const middleRadius = (bar.innerRadius + bar.outerRadius) / 2;
    return {
      ...bar,
      point: polarToCartesian(bar.cx, bar.cy, middleRadius, middleAngle),
    };
  };

  const bars = createMemo<RadialBarDatum[]>(() => {
    const values = data();
    const count = values.length;
    if (count === 0) return [];

    const available = Math.max(0, layout.outerRadius() - layout.innerRadius());
    const slot = available / count;
    const thickness = Math.max(0, Math.min(localProps.barSize ?? slot - localProps.barGap, slot));
    const baseline = projectAngleScale(angleScale(), 0);

    return values.map((value, index) => {
      const mapped = projectAngleScale(angleScale(), value);
      const direction = Math.sign(mapped - baseline) || 1;
      const span = Number.isFinite(mapped) && Number.isFinite(baseline) ? mapped - baseline : 0;
      const endAngle =
        value !== 0 && Math.abs(span) < localProps.minAngle
          ? baseline + direction * localProps.minAngle
          : mapped;
      const innerRadius = layout.innerRadius() + index * slot + (slot - thickness) / 2;
      const outerRadius = innerRadius + thickness;
      return withPoint({
        cx: layout.cx(),
        cy: layout.cy(),
        innerRadius,
        outerRadius,
        startAngle: baseline,
        endAngle,
        value,
        index,
      });
    });
  });

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  );
  const animatedBars = createPresence(
    bars,
    animOpts,
    (a, b, t) =>
      withPoint({
        cx: a.cx + (b.cx - a.cx) * t,
        cy: a.cy + (b.cy - a.cy) * t,
        innerRadius: a.innerRadius + (b.innerRadius - a.innerRadius) * t,
        outerRadius: a.outerRadius + (b.outerRadius - a.outerRadius) * t,
        startAngle: a.startAngle + (b.startAngle - a.startAngle) * t,
        endAngle: a.endAngle + (b.endAngle - a.endAngle) * t,
        value: b.value,
        index: b.index,
      }),
    (target) => withPoint({ ...target, endAngle: target.startAngle }),
    (current) => withPoint({ ...current, endAngle: current.startAngle }),
  );

  const backgroundProps = () =>
    localProps.background === true
      ? { fill: "currentColor", "fill-opacity": 0.12, stroke: "none" }
      : localProps.background;

  const labelDatum = (bar: RadialBarDatum): RadialBarLabelDatum => {
    const outside = localProps.labelPosition === "outside";
    const angle = outside ? bar.endAngle : (bar.startAngle + bar.endAngle) / 2;
    const radius = outside
      ? bar.outerRadius + localProps.labelOffset
      : (bar.innerRadius + bar.outerRadius) / 2;
    return {
      ...bar,
      labelPoint: polarToCartesian(bar.cx, bar.cy, radius, angle),
      textAnchor: outside ? (Math.cos(angle) >= 0 ? "start" : "end") : "middle",
    };
  };

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <g data-pc-radial-bar-group="">
        <For each={animatedBars()}>
          {(item) => {
            const bar = () => item.value;
            const valid = () =>
              Number.isFinite(bar().startAngle) &&
              Number.isFinite(bar().endAngle) &&
              bar().outerRadius > bar().innerRadius;
            return (
              <Show when={valid()}>
                <Show when={backgroundProps()}>
                  <Sector
                    cx={bar().cx}
                    cy={bar().cy}
                    innerRadius={bar().innerRadius}
                    outerRadius={bar().outerRadius}
                    startAngle={layout.startAngle()}
                    endAngle={layout.endAngle()}
                    cornerRadius={localProps.cornerRadius}
                    data-pc-radial-bar-background=""
                    {...backgroundProps()}
                  />
                </Show>
                <Sector
                  cx={bar().cx}
                  cy={bar().cy}
                  innerRadius={bar().innerRadius}
                  outerRadius={bar().outerRadius}
                  startAngle={bar().startAngle}
                  endAngle={bar().endAngle}
                  cornerRadius={localProps.cornerRadius}
                  data-pc-radial-bar=""
                  data-index={bar().index}
                  {...otherProps}
                  {...(item.mode === "exit"
                    ? {}
                    : pointEvents(eventProps, () => ({
                        value: bar().value,
                        index: bar().index,
                        point: bar().point,
                      })))}
                />
                <Show when={localProps.label && item.mode !== "exit"}>
                  {(() => {
                    const label = localProps.label;
                    const datum = labelDatum(bar());
                    return typeof label === "function" ? (
                      label(datum)
                    ) : (
                      <text
                        x={datum.labelPoint[0]}
                        y={datum.labelPoint[1]}
                        text-anchor={datum.textAnchor}
                        dominant-baseline="middle"
                        data-pc-radial-bar-label=""
                        {...(label === true ? {} : label)}
                      >
                        {datum.value}
                      </text>
                    );
                  })()}
                </Show>
              </Show>
            );
          }}
        </For>
      </g>
    </Show>
  );
};

export default RadialBar;
