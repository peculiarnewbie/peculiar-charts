import type { ChartContextType } from "@src/components/context";
import type { PolarLayout } from "@src/lib/polar/context";
import {
  createPolarAngleScale,
  createPolarRadiusScale,
  projectAngleScale,
  projectRadiusScale,
} from "@src/lib/polar/scale";
import { polarToCartesian } from "@src/lib/polar/utils";
import { axisValues } from "@src/lib/utils";
import { type Accessor, createMemo } from "solid-js";

const createPolarPoints = (props: {
  angleAxisId: Accessor<string>;
  radiusAxisId: Accessor<string>;
  dataKey: Accessor<string | undefined>;
  data: Accessor<number[]>;
  layout: PolarLayout;
  chartContext: ChartContextType;
}) => {
  const angleScale = createPolarAngleScale({
    axisId: props.angleAxisId,
    layout: props.layout,
    chartContext: props.chartContext,
  });
  const radiusScale = createPolarRadiusScale({
    axisId: props.radiusAxisId,
    layout: props.layout,
    chartContext: props.chartContext,
  });

  return createMemo(() => {
    const categories = axisValues(props.chartContext, props.angleAxisId(), "angle");
    const values = props.data();
    const cx = props.layout.cx();
    const cy = props.layout.cy();
    const aScale = angleScale();
    const rScale = radiusScale();

    return values.map((value, i) => {
      const angle = projectAngleScale(aScale, categories[i]);
      const radius = projectRadiusScale(rScale, value);
      if (!Number.isFinite(angle) || !Number.isFinite(radius))
        return [Number.NaN, Number.NaN] as [number, number];
      return polarToCartesian(cx, cy, radius, angle);
    });
  });
};

export default createPolarPoints;
