import type { ChartContextType } from "@src/components/context";
import type { PolarLayout } from "@src/lib/polar/context";
import { type PolarAngleScale, projectAngleScale } from "@src/lib/polar/scale";
import { type Accessor, createMemo } from "solid-js";

export type ClosestPolarTick = { index: number; angle: number };

/** Shortest angular distance between two radians in `[0, π]`. */
export const angularDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return d > Math.PI ? 2 * Math.PI - d : d;
};

/**
 * The category spoke nearest the pointer — by comparing the pointer angle from
 * the polar centre to each category's projected angle.
 */
const createPolarClosestTick = (props: {
  layout: PolarLayout;
  scale: Accessor<PolarAngleScale>;
  values: Accessor<any[]>;
  chartContext: ChartContextType;
}) =>
  createMemo<ClosestPolarTick | undefined>((prev) => {
    const pointer = props.chartContext.pointerPosition();
    if (!pointer || !props.chartContext.pointerInChart()) return prev;

    const px = props.chartContext.toSvgPosition(pointer.x, "width");
    const py = props.chartContext.toSvgPosition(pointer.y, "height");
    const pointerAngle = Math.atan2(py - props.layout.cy(), px - props.layout.cx());

    const scale = props.scale();
    const values = props.values();
    if (values.length === 0) return prev;

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestAngle = Number.NaN;
    for (let i = 0; i < values.length; i++) {
      const angle = projectAngleScale(scale, values[i]);
      if (!Number.isFinite(angle)) continue;
      const distance = angularDistance(pointerAngle, angle);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
        bestAngle = angle;
      }
    }

    if (!Number.isFinite(bestAngle)) return prev;
    if (bestIndex === prev?.index) return prev;
    return { index: bestIndex, angle: bestAngle };
  });

export default createPolarClosestTick;
