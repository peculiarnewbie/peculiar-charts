import { createWritableMemo } from "@solid-primitives/memo";
import { PolarAxisContext } from "@src/axis/polar/context";
import { useChartContext } from "@src/components/context";
import { usePolarLayout } from "@src/lib/polar/context";
import { createPolarAngleScale, polarScaleTicks } from "@src/lib/polar/scale";
import { polarToCartesian } from "@src/lib/polar/utils";
import { type JSX, createEffect, createUniqueId, mergeProps, onCleanup } from "solid-js";

export type PolarAngleAxisProps = {
  /** Key to read category or numeric angle values from the data. */
  dataKey?: string;
  /** Axis id series bind to. @defaultValue `'angle'` */
  axisId?: string;
  /** Scale type. Use `'linear'` for radial bars / gauges. @defaultValue `'point'` */
  type?: "point" | "linear";
  /** Numeric domain override when `type="linear"`. @defaultValue `'auto'` */
  axisRange?: "auto" | [number | "min", number | "max"];
  /** Target number of ticks. @defaultValue `5` */
  tickCount?: number;
  /** Force specific tick values. */
  tickValues?: any[];
  children?: JSX.Element;
};

/** Angular axis — evenly spaces categories around the polar frame. */
const PolarAngleAxis = (props: PolarAngleAxisProps) => {
  const defaultedProps = mergeProps(
    { axisId: "angle", type: "point" as const, axisRange: "auto" as const, tickCount: 5 },
    props,
  );
  const chartContext = useChartContext();
  const layout = usePolarLayout();
  const ownerId = createUniqueId();

  createEffect(() => {
    chartContext.registerAxisConfig(defaultedProps.axisId, ownerId, {
      orientation: "angle",
      type: defaultedProps.type,
      dataKey: defaultedProps.dataKey,
      range: defaultedProps.axisRange === "auto" ? null : defaultedProps.axisRange,
      reverse: false,
    });
    onCleanup(() => chartContext.unregisterAxisConfig(defaultedProps.axisId, ownerId));
  });

  const scale = createPolarAngleScale({
    axisId: () => defaultedProps.axisId,
    layout,
    chartContext,
  });

  const ticks = () => {
    const forced = defaultedProps.tickValues;
    if (forced) return forced;
    return polarScaleTicks(scale(), defaultedProps.tickCount);
  };

  const [labelTicks, setLabelTicks] = createWritableMemo(() => ticks());

  return (
    <PolarAxisContext.Provider
      value={{
        axisId: () => defaultedProps.axisId,
        axis: () => "angle",
        scale,
        ticks,
        labelTicks,
        setLabelTicks,
      }}
    >
      {defaultedProps.children}
    </PolarAxisContext.Provider>
  );
};

export default PolarAngleAxis;

export const polarAngleLabelPosition = (
  layout: ReturnType<typeof usePolarLayout>,
  angle: number,
  offset = 12,
) => {
  const r = layout.outerRadius() + offset;
  return polarToCartesian(layout.cx(), layout.cy(), r, angle);
};
