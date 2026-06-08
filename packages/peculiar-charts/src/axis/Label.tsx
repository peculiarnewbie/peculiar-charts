import { useAxisContext } from "@src/axis/context";
import { useChartContext } from "@src/components/context";
import createLabelTicks, { type LabelInterval } from "@src/lib/createLabelTicks";
import { getAverageCharSize } from "@src/lib/dom/charSize";
import createSvgSize from "@src/lib/dom/createSvgSize";
import { projectScale } from "@src/lib/scale";
import type { OverrideProps } from "@src/lib/types";
import {
  type ComponentProps,
  For,
  type JSX,
  Show,
  createEffect,
  createSignal,
  createUniqueId,
  mergeProps,
  splitProps,
} from "solid-js";

/** A resolved tick passed to a custom label renderer. */
export type LabelTick = {
  /** Raw tick value. */
  value: any;
  /** Index in the parent axis' full tick list. */
  index: number;
  /** Index in the rendered label list after interval filtering. */
  visibleIndex: number;
  /** Formatted label string. */
  label: string;
  /** Pixel x of the tick. */
  x: number;
  /** Pixel y of the tick. */
  y: number;
};

export type LabelProps = OverrideProps<
  Omit<ComponentProps<"text">, "x" | "y">,
  {
    /** Format a tick value to its label string. Defaults to the parent Axis `tickFormatter`. */
    format?: (value: any) => string;
    /** Label thinning strategy. Use `'all'` or `0` to render every tick. @defaultValue `'preserveEnd'` */
    interval?: LabelInterval;
    /** Minimum gap between labels in px. @defaultValue `16` */
    labelGap?: number;
    /** Distance in px from the axis edge to the label anchor. */
    tickMargin?: number;
    /** Rotate default labels around their tick anchor, in degrees. */
    angle?: number;
    /** Offset alternating labels into multiple rows/columns. `true` means `2`. */
    stagger?: boolean | number;
    /** Render each tick yourself (e.g. an `<image>` or styled markup) instead
     * of the default `<text>`. Receives the tick value, label and position. */
    children?: (tick: LabelTick) => JSX.Element;
  }
>;

/** Axis tick labels.
 *
 * @data `data-pc-axis-label-group` - Present on every label group element.
 * @data `data-pc-axis-label` - Present on every label text element.
 */
const Label = (props: LabelProps) => {
  const chartContext = useChartContext();
  const axisContext = useAxisContext();

  const defaultedProps = mergeProps(
    {
      interval: "preserveEnd" as const,
      labelGap: 16,
      tickMargin: 0,
      fill: "currentColor",
      "text-anchor":
        axisContext.position() === "left"
          ? ("end" as const)
          : axisContext.position() === "right"
            ? ("start" as const)
            : ("middle" as const),
      "dominant-baseline": axisContext.axis() === "y" ? ("central" as const) : undefined,
      dx:
        axisContext.position() === "left"
          ? "-0.5em"
          : axisContext.position() === "right"
            ? "0.5em"
            : undefined,
      dy: axisContext.position() === "bottom" ? "0.3em" : undefined,
    },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, [
    "format",
    "interval",
    "labelGap",
    "tickMargin",
    "angle",
    "stagger",
    "children",
  ]);

  const [labelGroupRef, setLabelGroupRef] = createSignal<SVGGElement | null>(null);

  createSvgSize({
    element: labelGroupRef,
    dimension: () => (axisContext.axis() === "x" ? "height" : "width"),
    onSizeChange: (size: number) =>
      chartContext.registerInset(
        axisContext.position(),
        "axis.label",
        chartContext.toSvgPosition(size, axisContext.axis() === "x" ? "height" : "width"),
      ),
    onCleanup: () => chartContext.unregisterInset(axisContext.position(), "axis.label"),
  });

  const labelAxisId = createUniqueId();

  // DOM measurement can't run inside a memo in Solid, so mirror into a signal.
  const [averageCharSize, setAverageCharSize] = createSignal({ x: 0, y: 0 });
  createEffect(() => {
    const ref = labelGroupRef();
    if (!ref) return;
    setAverageCharSize(getAverageCharSize(ref, otherProps, labelAxisId));
  });

  const format = (value: any) =>
    localProps.format ? localProps.format(value) : axisContext.tickFormatter()(value);

  createLabelTicks({
    ticks: axisContext.ticks,
    interval: () => localProps.interval,
    labelGap: () => localProps.labelGap,
    format: () => format,
    averageCharSize,
    chartContext,
    axisContext,
  });

  const staggerOffset = (visibleIndex: number) => {
    const stagger = localProps.stagger;
    if (!stagger) return 0;
    const rows = stagger === true ? 2 : Math.max(1, Math.floor(stagger));
    return (visibleIndex % rows) * (averageCharSize().y + localProps.labelGap);
  };

  const x = (tick: any, visibleIndex: number) => {
    switch (axisContext.position()) {
      case "top":
      case "bottom": {
        const tickPosition = projectScale(axisContext.scale(), tick);
        const size = averageCharSize().x * format(tick).length;
        const start = tickPosition - size / 2;
        const end = tickPosition + size / 2;
        if (start < 0) return tickPosition - start;
        if (end > chartContext.width()) return tickPosition - (end - chartContext.width());
        return tickPosition;
      }
      case "left":
        return chartContext.getInset("left") - localProps.tickMargin - staggerOffset(visibleIndex);
      case "right":
        return (
          chartContext.width() -
          chartContext.getInset("right") +
          localProps.tickMargin +
          staggerOffset(visibleIndex)
        );
    }
  };

  const y = (tick: any, visibleIndex: number) => {
    switch (axisContext.position()) {
      case "top":
        return (
          chartContext.getInset("top", "axis.label") -
          localProps.tickMargin -
          staggerOffset(visibleIndex)
        );
      case "bottom":
        return (
          chartContext.height() -
          chartContext.getInset("bottom", "axis.label") +
          localProps.tickMargin +
          staggerOffset(visibleIndex)
        );
      case "left":
      case "right":
        return projectScale(axisContext.scale(), tick);
    }
  };

  const transform = (tick: any, visibleIndex: number) => {
    const angle = localProps.angle;
    if (angle == null) return otherProps.transform;
    const anchorX = x(tick, visibleIndex) ?? 0;
    const anchorY = y(tick, visibleIndex) ?? 0;
    const rotate = `rotate(${angle}, ${anchorX}, ${anchorY})`;
    return otherProps.transform ? `${otherProps.transform} ${rotate}` : rotate;
  };

  const tickProps = (tick: any, visibleIndex: number): LabelTick => ({
    value: tick,
    index: axisContext.ticks().findIndex((value) => Object.is(value, tick)),
    visibleIndex,
    label: format(tick),
    x: x(tick, visibleIndex) ?? 0,
    y: y(tick, visibleIndex) ?? 0,
  });

  return (
    <g ref={setLabelGroupRef} data-pc-axis-label-group="">
      <For each={axisContext.labelTicks()}>
        {(tick, index) => (
          <Show
            when={localProps.children}
            fallback={
              <text
                {...otherProps}
                x={x(tick, index())}
                y={y(tick, index())}
                transform={transform(tick, index())}
                data-pc-axis-label=""
              >
                {format(tick)}
              </text>
            }
          >
            {(children) => children()(tickProps(tick, index()))}
          </Show>
        )}
      </For>
    </g>
  );
};

export default Label;
