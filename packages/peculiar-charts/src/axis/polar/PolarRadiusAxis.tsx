import { createWritableMemo } from "@solid-primitives/memo";
import { PolarAxisContext } from "@src/axis/polar/context";
import { useChartContext } from "@src/components/context";
import { usePolarLayout } from "@src/lib/polar/context";
import { createPolarRadiusScale, polarScaleTicks } from "@src/lib/polar/scale";
import { type JSX, createEffect, createUniqueId, mergeProps, onCleanup } from "solid-js";

export type PolarRadiusAxisProps = {
  /** Axis id series bind to. @defaultValue `'radius'` */
  axisId?: string;
  /** Target number of ticks. @defaultValue `5` */
  tickCount?: number;
  /** Force specific tick values. */
  tickValues?: any[];
  /** Numeric domain override. @defaultValue `'auto'` */
  axisRange?: "auto" | [number | "min", number | "max"];
  /** Angle in radians where radius ticks are drawn. @defaultValue `0` (right) */
  angle?: number;
  children?: JSX.Element;
};

/** Radial value axis — maps data magnitudes to distance from centre. */
const PolarRadiusAxis = (props: PolarRadiusAxisProps) => {
  const defaultedProps = mergeProps(
    {
      axisId: "radius",
      tickCount: 5,
      axisRange: "auto" as const,
      angle: 0,
    },
    props,
  );
  const chartContext = useChartContext();
  const layout = usePolarLayout();
  const ownerId = createUniqueId();

  createEffect(() => {
    chartContext.registerAxisConfig(defaultedProps.axisId, ownerId, {
      orientation: "radius",
      type: "linear",
      range: defaultedProps.axisRange === "auto" ? null : defaultedProps.axisRange,
      reverse: false,
    });
    onCleanup(() => chartContext.unregisterAxisConfig(defaultedProps.axisId, ownerId));
  });

  const scale = createPolarRadiusScale({
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
        axis: () => "radius",
        scale,
        ticks,
        labelTicks,
        setLabelTicks,
        angle: () => defaultedProps.angle,
      }}
    >
      {defaultedProps.children}
    </PolarAxisContext.Provider>
  );
};

export default PolarRadiusAxis;
