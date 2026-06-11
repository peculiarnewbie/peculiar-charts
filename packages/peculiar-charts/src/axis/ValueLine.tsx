import { useAxisContext } from "@src/axis/context";
import { useChartContext } from "@src/components/context";
import { projectScale } from "@src/lib/scale";
import type { OverrideProps } from "@src/lib/types";
import { type ComponentProps, mergeProps, splitProps } from "solid-js";

export type ValueLineProps = OverrideProps<
  Omit<ComponentProps<"line">, "x1" | "y1" | "x2" | "y2">,
  {
    /** Value on the axis scale to draw the line at. */
    value: any;
  }
>;

/** A reference line at a specific value on the axis scale.
 *
 * @data `data-pc-axis-value-line` - Present on every value line element.
 */
const ValueLine = (props: ValueLineProps) => {
  const defaultedProps = mergeProps({ stroke: "currentColor", "stroke-width": 1 }, props);
  const [localProps, otherProps] = splitProps(defaultedProps, ["value"]);
  const chartContext = useChartContext();
  const axisContext = useAxisContext();

  const pos = () => projectScale(axisContext.scale(), localProps.value);

  const x = () => (axisContext.axis() === "x" ? pos() : chartContext.getInset("left"));
  const y = () => (axisContext.axis() === "x" ? chartContext.getInset("top") : pos());
  const x2 = () =>
    axisContext.axis() === "x" ? pos() : chartContext.width() - chartContext.getInset("right");
  const y2 = () =>
    axisContext.axis() === "x" ? chartContext.height() - chartContext.getInset("bottom") : pos();

  return (
    <line
      x1={x()}
      y1={y()}
      x2={x2()}
      y2={y2()}
      data-value={localProps.value}
      data-pc-axis-value-line=""
      {...otherProps}
    />
  );
};

export default ValueLine;
