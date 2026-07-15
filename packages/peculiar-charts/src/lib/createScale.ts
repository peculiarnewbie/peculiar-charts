import type { AxisOrientation, ChartContextType } from "@src/components/context";
import { resolveCartesianScale } from "@src/lib/resolveCartesianScale";
import type { Scale } from "@src/lib/scale";
import { getBarPadding } from "@src/lib/utils";
import { type Accessor, createMemo } from "solid-js";

/**
 * The single source of truth for an axis scale. Both `<Axis>` and every series
 * call this with the same `axisId`/`orientation`, so they always agree on
 * placement. Reads the axis config + domain + plot rect from the chart context.
 */
const createScale = (props: {
  axisId: Accessor<string>;
  orientation: Accessor<AxisOrientation>;
  chartContext: ChartContextType;
}): Accessor<Scale> => {
  return createMemo(() => {
    const ctx = props.chartContext;
    const axisId = props.axisId();
    const orientation = props.orientation();
    const config = ctx.getAxisConfig(axisId, orientation);
    const domain = ctx.getDomain(axisId, orientation);

    return resolveCartesianScale({
      config,
      domain,
      orientation,
      width: ctx.width(),
      height: ctx.height(),
      insets: {
        top: ctx.getInset("top"),
        right: ctx.getInset("right"),
        bottom: ctx.getInset("bottom"),
        left: ctx.getInset("left"),
      },
      barPadding: orientation === "x" && config.type !== "band" ? getBarPadding(ctx) : 0,
    });
  });
};

export default createScale;
