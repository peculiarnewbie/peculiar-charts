import type { ChartContextType } from "@src/components/context";
import type { BarLayout } from "@src/lib/createBands";
import createScale from "@src/lib/createScale";
import { projectScale } from "@src/lib/scale";
import { axisValues } from "@src/lib/utils";
import { type Accessor, createMemo } from "solid-js";

/**
 * Projects a series' data to `[x, y]` pixel coordinates. The category axis
 * position and value-axis position depend on `layout` — vertical bars use x
 * for categories and y for values; horizontal bars flip that.
 *
 * Non-finite values become `NaN` on the value axis so the shape layer can break.
 */
const createPoints = (props: {
  layout?: Accessor<BarLayout>;
  xAxisId: Accessor<string>;
  yAxisId: Accessor<string>;
  dataKey: Accessor<string | undefined>;
  stackId: Accessor<string | undefined>;
  data: Accessor<number[]>;
  /** Per-series raw data for category extraction. When set, `axisValues` reads
   * category positions from this instead of `ctx.displayedData()`. */
  seriesData?: Accessor<unknown[] | undefined>;
  chartContext: ChartContextType;
}) => {
  const ctx = props.chartContext;
  const layout = () => props.layout?.() ?? "vertical";

  const xScale = createScale({
    axisId: props.xAxisId,
    orientation: () => "x",
    chartContext: ctx,
  });
  const yScale = createScale({
    axisId: props.yAxisId,
    orientation: () => "y",
    chartContext: ctx,
  });

  return createMemo(() => {
    const data = props.data();
    const _xScale = xScale();
    const _yScale = yScale();
    const horizontal = layout() === "horizontal";

    const categoryValues = axisValues(
      ctx,
      horizontal ? props.yAxisId() : props.xAxisId(),
      horizontal ? "y" : "x",
      props.seriesData?.(),
    );
    const categoryScale = horizontal ? _yScale : _xScale;
    const valueScale = horizontal ? _xScale : _yScale;

    const stackId = props.stackId();
    const stack = stackId !== undefined && ctx.stacks().get(stackId);
    const expand = ctx.stackOffset?.() === "expand";

    return data.map((value, i) => {
      let stacked = value;
      if (stack) {
        const stackDataKeys = [...stack.keys()];
        const thisIdx = stackDataKeys.indexOf(props.dataKey() ?? "");
        if (expand) {
          let total = 0;
          for (const key of stackDataKeys) total += stack.get(key)?.values[i] ?? 0;
          if (total !== 0) {
            for (let s = 0; s < thisIdx; s++)
              stacked += stack.get(stackDataKeys[s]!)?.values[i] || 0;
            stacked = stacked / total;
          } else {
            stacked = 0;
          }
        } else if (thisIdx > 0) {
          for (let s = 0; s < thisIdx; s++) {
            stacked += stack.get(stackDataKeys[s]!)?.values[i] || 0;
          }
        }
      }

      const category = projectScale(categoryScale, categoryValues[i]);
      const val =
        typeof value === "number" && Number.isFinite(value)
          ? projectScale(valueScale, stacked)
          : Number.NaN;
      return [horizontal ? val : category, horizontal ? category : val] as [number, number];
    });
  });
};

export default createPoints;
