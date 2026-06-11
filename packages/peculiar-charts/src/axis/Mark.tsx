import { useAxisContext } from "@src/axis/context";
import { useChartContext } from "@src/components/context";
import { projectScale } from "@src/lib/scale";
import type { OverrideProps } from "@src/lib/types";
import { type ComponentProps, For, type JSX, Show, mergeProps, splitProps } from "solid-js";

/** A resolved tick passed to a custom mark renderer. */
export type MarkTick = {
  /** Raw tick value. */
  value: any;
  /** Inner anchor x (on the axis edge). */
  x: number;
  /** Inner anchor y (on the axis edge). */
  y: number;
  /** Outer end x of the default tick mark. */
  x2: number;
  /** Outer end y of the default tick mark. */
  y2: number;
};

export type MarkProps = OverrideProps<
  Omit<ComponentProps<"line">, "x1" | "y1" | "x2" | "y2">,
  {
    /** Tick mark length in px. @defaultValue `6` */
    length?: number;
    /** Render each tick mark yourself instead of the default `<line>`. */
    children?: (tick: MarkTick) => JSX.Element;
  }
>;

/** Tick marks between the plot and the axis labels.
 *
 * @data `data-pc-axis-mark-group` - Present on every mark group element.
 * @data `data-pc-axis-mark` - Present on every mark line element.
 */
const Mark = (props: MarkProps) => {
  const defaultedProps = mergeProps(
    { stroke: "currentColor", "stroke-width": 1, length: 6 },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, ["length", "children"]);
  const chartContext = useChartContext();
  const axisContext = useAxisContext();

  const pos = (tick: any) => projectScale(axisContext.scale(), tick);

  const x = (tick: any) => {
    switch (axisContext.position()) {
      case "top":
      case "bottom":
        return pos(tick);
      case "left":
        return chartContext.getInset("left");
      case "right":
        return chartContext.width() - chartContext.getInset("right");
    }
  };
  const y = (tick: any) => {
    switch (axisContext.position()) {
      case "top":
        return chartContext.getInset("top");
      case "bottom":
        return chartContext.height() - chartContext.getInset("bottom");
      case "left":
      case "right":
        return pos(tick);
    }
  };
  const x2 = (tick: any) => {
    switch (axisContext.position()) {
      case "top":
      case "bottom":
        return pos(tick);
      case "left":
        return chartContext.getInset("left") - localProps.length;
      case "right":
        return chartContext.width() - chartContext.getInset("right") + localProps.length;
    }
  };
  const y2 = (tick: any) => {
    switch (axisContext.position()) {
      case "top":
        return chartContext.getInset("top") - localProps.length;
      case "bottom":
        return chartContext.height() - chartContext.getInset("bottom") + localProps.length;
      case "left":
      case "right":
        return pos(tick);
    }
  };

  const tickProps = (tick: any): MarkTick => ({
    value: tick,
    x: x(tick) ?? 0,
    y: y(tick) ?? 0,
    x2: x2(tick) ?? 0,
    y2: y2(tick) ?? 0,
  });

  return (
    <g data-pc-axis-mark-group="">
      <For each={axisContext.labelTicks()}>
        {(tick) => (
          <Show
            when={localProps.children}
            fallback={
              <line
                x1={x(tick)}
                y1={y(tick)}
                x2={x2(tick)}
                y2={y2(tick)}
                data-pc-axis-mark=""
                {...otherProps}
              />
            }
          >
            {(children) => children()(tickProps(tick))}
          </Show>
        )}
      </For>
    </g>
  );
};

export default Mark;
