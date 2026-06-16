import type { ChartContextType } from "@src/components/context";
import type { BarLayout } from "@src/lib/createBands";
import createScale from "@src/lib/createScale";
import { projectScale } from "@src/lib/scale";
import { stackBaseValue, stackKeys } from "@src/lib/stacking";
import { type Accessor, createMemo } from "solid-js";

/**
 * Baseline coordinate(s) for area/bar series. A plain series sits on the zero
 * line; a stacked series sits on top of the series below it in the stack.
 */
const createBaseLine = (props: {
  layout: Accessor<BarLayout>;
  xAxisId: Accessor<string>;
  yAxisId: Accessor<string>;
  dataKey: Accessor<string | undefined>;
  stackId: Accessor<string | undefined>;
  data: Accessor<number[]>;
  chartContext: ChartContextType;
}) => {
  const ctx = props.chartContext;
  const valueScale = createScale({
    axisId: () => (props.layout() === "horizontal" ? props.xAxisId() : props.yAxisId()),
    orientation: () => (props.layout() === "horizontal" ? "x" : "y"),
    chartContext: ctx,
  });

  return createMemo<number | number[]>(() => {
    const _scale = valueScale();
    const zero = projectScale(_scale, 0);

    const stackId = props.stackId();
    const stack = stackId !== undefined && ctx.stacks().get(stackId);
    if (!stack) return zero;

    const keys = stackKeys(stack);

    return props.data().map((_, i) => {
      const baseLine = stackBaseValue({
        stack,
        keys,
        dataKey: props.dataKey(),
        index: i,
        value: props.data()[i] ?? 0,
        offset: ctx.stackOffset?.(),
      });
      return projectScale(_scale, baseLine);
    });
  });
};

export default createBaseLine;
