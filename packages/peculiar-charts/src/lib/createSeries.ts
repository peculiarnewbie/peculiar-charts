import type { ChartContextType } from "@src/components/context";
import type { BarLayout } from "@src/lib/createBands";
import { finiteExtent } from "@src/lib/extent";
import {
  createStackScope,
  getScopedStack,
  resolveStackOffset,
  stackExtent,
} from "@src/lib/stacking";
import { type Accessor, createEffect, onCleanup } from "solid-js";

/**
 * Registers a series with the chart: its identity (for legends/tooltips), its
 * stack membership, and its value extent on the y-axis (stack-aware). When the
 * series is toggled off via the legend it withdraws its extent so the domain
 * recomputes without it.
 */
const createSeries = (props: {
  seriesId: string;
  name: Accessor<string>;
  type: string;
  layout?: Accessor<BarLayout>;
  xAxisId?: Accessor<string>;
  yAxisId: Accessor<string>;
  /** Axis that receives the value extent. @defaultValue `yAxisId` */
  valueAxisId?: Accessor<string>;
  dataKey: Accessor<string | undefined>;
  stackId: Accessor<string | undefined>;
  data: Accessor<number[]>;
  /** Explicit colour for legend / tooltip swatches. Falls back to the palette. */
  color?: Accessor<string | undefined>;
  chartContext: ChartContextType;
}) => {
  const ctx = props.chartContext;
  const valueAxisId = () => props.valueAxisId?.() ?? props.yAxisId();
  const stackScope = (stackId: string) =>
    createStackScope({
      layout: props.layout?.() ?? "vertical",
      xAxisId: props.xAxisId?.() ?? "x",
      yAxisId: props.yAxisId(),
      stackId,
    });

  // identity
  createEffect(() => {
    ctx.registerSeriesMeta(props.seriesId, {
      name: props.name(),
      type: props.type,
      dataKey: props.dataKey(),
      color: props.color?.(),
    });
    onCleanup(() => ctx.unregisterSeriesMeta(props.seriesId));
  });

  // stack membership
  createEffect(() => {
    const stackId = props.stackId();
    if (!stackId || !ctx.isSeriesVisible(props.seriesId)) return;
    const scope = stackScope(stackId);
    ctx.registerStack(scope, {
      seriesId: props.seriesId,
      dataKey: props.dataKey(),
      values: props.data(),
    });
    onCleanup(() => ctx.unregisterStack(scope, props.seriesId));
  });

  // value extent on the value axis (stack-aware)
  createEffect(() => {
    if (!ctx.isSeriesVisible(props.seriesId)) return;

    const stackId = props.stackId();
    const stack = stackId !== undefined && getScopedStack(ctx.stacks(), stackScope(stackId));
    const data = props.data();

    if (stack) {
      ctx.registerExtent(
        valueAxisId(),
        props.seriesId,
        stackExtent(stack, resolveStackOffset(ctx.stackOffset?.())),
      );
      onCleanup(() => ctx.unregisterExtent(valueAxisId(), props.seriesId));
      return;
    }

    const extent = finiteExtent(data);
    if (!extent) return;
    ctx.registerExtent(valueAxisId(), props.seriesId, extent);
    onCleanup(() => ctx.unregisterExtent(valueAxisId(), props.seriesId));
  });
};

export default createSeries;
