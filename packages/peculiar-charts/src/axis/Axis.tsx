import { AxisContext } from "@src/axis/context";
import { useChartContext } from "@src/components/context";
import createScale from "@src/lib/createScale";
import createTicks from "@src/lib/createTicks";
import type { ScaleType } from "@src/lib/scale";
import { type JSX, createEffect, createSignal, mergeProps, onCleanup } from "solid-js";

export type AxisProps = {
  /** Key to read categorical/x values from the data. Omit for plain arrays. */
  dataKey?: string;
  /** Axis id series bind to. @defaultValue `'x'` for x, `'y'` for y */
  axisId?: string;
  /** Scale type. @defaultValue `'point'` for x, `'linear'` for y */
  type?: ScaleType;
  /** Target number of ticks. @defaultValue `5` */
  tickCount?: number;
  /** Force specific tick values. */
  tickValues?: any[];
  /** Format tick values for default axis labels. */
  tickFormatter?: (value: any) => string;
  /**
   * Numeric domain override. Numbers set literal bounds; `'min'`/`'max'`
   * keep the data-derived bound. String expressions like `'dataMax + 1000'`
   * or `'dataMin - 50'` are evaluated against the computed data extent.
   * @defaultValue `'auto'`
   */
  axisRange?: "auto" | [number | "min" | string, number | "max" | string];
  /** Reverse the axis direction. */
  reverse?: boolean;
  /** Pixel padding at axis edges. Prevents data points from sitting flush
   *  against the chart boundary. */
  padding?: { left?: number; right?: number; top?: number; bottom?: number };
  /** Recharts-style flag; `false` deduplicates category values. @defaultValue `false` */
  allowDuplicatedCategory?: boolean;
  /** Clip bound series to the plot area when the axis domain hides data. @defaultValue `false` */
  allowDataOverflow?: boolean;
  /** Render ticks and labels inside the plot area. @defaultValue `false` */
  mirror?: boolean;
  /** @hidden */
  children?: JSX.Element;
} & (XAxisProps | YAxisProps);

export type XAxisProps = { axis: "x"; position: "top" | "bottom" };
export type YAxisProps = { axis: "y"; position: "left" | "right" };

export type { ScaleType };

/** Context provider + scale owner for a single axis. */
const Axis = (props: AxisProps) => {
  const defaultedProps = mergeProps(
    {
      type: props.axis === "x" ? ("point" as const) : ("linear" as const),
      axisId: props.axis === "x" ? "x" : "y",
      tickCount: 5,
      tickFormatter: (value: any) => String(value),
      axisRange: "auto" as const,
      reverse: false,
      allowDuplicatedCategory: false,
      allowDataOverflow: false,
      mirror: false,
    },
    props,
  );
  const chartContext = useChartContext();

  createEffect(() => {
    chartContext.registerAxisConfig(defaultedProps.axisId, {
      orientation: defaultedProps.axis,
      type: defaultedProps.type,
      dataKey: defaultedProps.dataKey,
      range: defaultedProps.axisRange === "auto" ? null : defaultedProps.axisRange,
      reverse: defaultedProps.reverse,
      padding: defaultedProps.padding,
      allowDuplicatedCategory: defaultedProps.allowDuplicatedCategory,
      allowDataOverflow: defaultedProps.allowDataOverflow,
    });
    onCleanup(() => chartContext.unregisterAxisConfig(defaultedProps.axisId));
  });

  const scale = createScale({
    axisId: () => defaultedProps.axisId,
    orientation: () => defaultedProps.axis,
    chartContext,
  });

  const ticks = createTicks({
    scale,
    tickCount: () => defaultedProps.tickCount,
    tickValues: () => defaultedProps.tickValues,
  });

  // `<Label>` supplies a memo for collision-filtered ticks. Keeping that memo
  // as an accessor avoids an effect that copies derived data into another signal.
  const [labelTickSource, setLabelTickSource] = createSignal<(() => any[]) | undefined>();
  const labelTicks = () => labelTickSource()?.() ?? ticks();

  return (
    <AxisContext.Provider
      value={{
        axisId: () => defaultedProps.axisId,
        axis: () => defaultedProps.axis,
        position: () => defaultedProps.position,
        mirror: () => defaultedProps.mirror,
        tickFormatter: () => defaultedProps.tickFormatter,
        scale,
        ticks,
        labelTicks,
        setLabelTicks: (source) => setLabelTickSource(() => source),
      }}
    >
      {defaultedProps.children}
    </AxisContext.Provider>
  );
};

export default Axis;
