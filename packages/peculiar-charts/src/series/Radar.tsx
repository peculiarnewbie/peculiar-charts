import { useChartContext } from "@src/components/context";
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  createTweenedArray,
  interpolatePoint,
  resolveAnimation,
} from "@src/lib/animation";
import createPolarPoints from "@src/lib/polar/createPolarPoints";
import { usePolarLayout } from "@src/lib/polar/context";
import createSeries from "@src/lib/createSeries";
import type { OverrideProps } from "@src/lib/types";
import { accessData } from "@src/lib/utils";
import PolarPolygon from "@src/shapes/PolarPolygon";
import {
  type ComponentProps,
  Show,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
} from "solid-js";

export type RadarProps = OverrideProps<
  Omit<ComponentProps<"path">, "d">,
  {
    /** Data key for spoke values. Omit for plain number arrays. */
    dataKey?: string;
    /** Display name for legends/tooltips. @defaultValue `dataKey` */
    name?: string;
    /** Bound angle-axis id. @defaultValue `'angle'` */
    angleAxisId?: string;
    /** Bound radius-axis id. @defaultValue `'radius'` */
    radiusAxisId?: string;
    /** Fill opacity. @defaultValue `0.35` */
    fillOpacity?: number;
    /** Explicit colour for legend / tooltip swatches. */
    color?: string;
    /** Animation configuration. */
    animation?: AnimationOptions;
  }
>;

/** Radar / spider series — a closed polygon over polar axes.
 *
 * @data `data-pc-radar-group` - Present on the radar group element.
 * @data `data-pc-radar` - Present on the radar polygon path.
 */
const Radar = (props: RadarProps) => {
  const seriesId = createUniqueId();
  const defaultedProps = mergeProps(
    {
      angleAxisId: "angle",
      radiusAxisId: "radius",
      fillOpacity: 0.35,
      stroke: "currentColor",
      fill: "currentColor",
    },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, [
    "dataKey",
    "name",
    "angleAxisId",
    "radiusAxisId",
    "fillOpacity",
    "color",
    "animation",
  ]);
  const chartContext = useChartContext();
  const layout = usePolarLayout();

  const data = createMemo(() => accessData<number>(chartContext.data(), localProps.dataKey));

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? "series",
    type: "radar",
    yAxisId: () => localProps.radiusAxisId,
    valueAxisId: () => localProps.radiusAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => undefined,
    data,
    color: () => localProps.color,
    chartContext,
  });

  const points = createPolarPoints({
    angleAxisId: () => localProps.angleAxisId,
    radiusAxisId: () => localProps.radiusAxisId,
    dataKey: () => localProps.dataKey,
    data,
    layout,
    chartContext,
  });

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  );
  const animationKeys = createMemo<unknown[] | undefined>(() => {
    const matchBy = animOpts().matchBy;
    if (!matchBy || matchBy === "index") return undefined;
    const raw = chartContext.data() as unknown[];
    if (typeof matchBy === "string") return accessData<unknown>(raw, matchBy);
    return raw.map((datum, index) => matchBy(datum, index, raw));
  });
  const animatedPoints = createTweenedArray(
    points,
    animOpts,
    (a, b, t) => animOpts().interpolate?.(a, b, t) ?? interpolatePoint(a, b, t),
    (target) =>
      Number.isNaN(target[0])
        ? ([Number.NaN, Number.NaN] as [number, number])
        : ([layout.cx(), layout.cy()] as [number, number]),
    undefined,
    animationKeys,
  );

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <g data-pc-radar-group="">
        <PolarPolygon
          points={animatedPoints()}
          fill-opacity={localProps.fillOpacity}
          data-pc-radar=""
          {...otherProps}
        />
      </g>
    </Show>
  );
};

export default Radar;
