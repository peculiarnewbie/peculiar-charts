import type { AxisOrientation, ChartContextType } from "@src/components/context";

export const clipPathForAxes = (
  chartContext: ChartContextType,
  axes: { axisId: string; orientation: AxisOrientation }[],
): string | undefined =>
  axes.some((axis) => chartContext.getAxisConfig(axis.axisId, axis.orientation).allowDataOverflow)
    ? chartContext.plotClipPath()
    : undefined;
