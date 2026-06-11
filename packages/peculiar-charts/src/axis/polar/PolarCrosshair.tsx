import { usePolarAxisContext } from "@src/axis/polar/context";
import { useChartContext } from "@src/components/context";
import createPolarClosestTick from "@src/lib/polar/createPolarClosestTick";
import { usePolarLayout } from "@src/lib/polar/context";
import { type PolarAngleScale } from "@src/lib/polar/scale";
import { polarToCartesian } from "@src/lib/polar/utils";
import { axisValues } from "@src/lib/utils";
import { type ComponentProps, mergeProps } from "solid-js";
import { isDev } from "solid-js/web";

export type PolarCrosshairProps = Omit<ComponentProps<"line">, "x1" | "y1" | "x2" | "y2">;

/** Radial guide line at the category spoke nearest the pointer.
 *
 * @data `data-pc-polar-crosshair` - Present on the crosshair line element.
 */
const PolarCrosshair = (props: PolarCrosshairProps) => {
  const chartContext = useChartContext();
  const axisContext = usePolarAxisContext();
  const layout = usePolarLayout();

  if (isDev && axisContext.axis() === "radius") {
    throw new Error("[peculiar-charts] PolarCrosshair must be used inside <PolarAngleAxis>");
  }

  const defaultedProps = mergeProps({ stroke: "currentColor", "stroke-width": 1 }, props);

  const closestTick = createPolarClosestTick({
    layout,
    scale: () => axisContext.scale() as PolarAngleScale,
    values: () => axisValues(chartContext, axisContext.axisId(), axisContext.axis()),
    chartContext,
  });

  const x1 = () => {
    const tick = closestTick();
    if (!tick) return undefined;
    return polarToCartesian(layout.cx(), layout.cy(), layout.innerRadius(), tick.angle)[0];
  };
  const y1 = () => {
    const tick = closestTick();
    if (!tick) return undefined;
    return polarToCartesian(layout.cx(), layout.cy(), layout.innerRadius(), tick.angle)[1];
  };
  const x2 = () => {
    const tick = closestTick();
    if (!tick) return undefined;
    return polarToCartesian(layout.cx(), layout.cy(), layout.outerRadius(), tick.angle)[0];
  };
  const y2 = () => {
    const tick = closestTick();
    if (!tick) return undefined;
    return polarToCartesian(layout.cx(), layout.cy(), layout.outerRadius(), tick.angle)[1];
  };

  return (
    <line
      x1={x1()}
      y1={y1()}
      x2={x2()}
      y2={y2()}
      opacity={chartContext.pointerInChart() ? 1 : 0}
      data-pc-polar-crosshair=""
      {...defaultedProps}
    />
  );
};

export default PolarCrosshair;
