import { useAxisContext } from "@src/axis/context";
import { useChartContext } from "@src/components/context";
import { type ComponentProps, mergeProps } from "solid-js";

export type LineProps = Omit<ComponentProps<"line">, "x1" | "y1" | "x2" | "y2">;

/** The axis baseline.
 *
 * @data `data-pc-axis-line` - Present on every axis line element.
 */
const Line = (props: LineProps) => {
  const defaultedProps = mergeProps({ stroke: "currentColor", "stroke-width": 1 }, props);
  const chartContext = useChartContext();
  const axisContext = useAxisContext();

  const left = () => chartContext.getInset("left");
  const right = () => chartContext.width() - chartContext.getInset("right");
  const top = () => chartContext.getInset("top");
  const bottom = () => chartContext.height() - chartContext.getInset("bottom");

  const x = () => (axisContext.position() === "right" ? right() : left());
  const y = () => (axisContext.position() === "bottom" ? bottom() : top());
  const x2 = () =>
    axisContext.position() === "top" || axisContext.position() === "bottom" ? right() : x();
  const y2 = () =>
    axisContext.position() === "left" || axisContext.position() === "right" ? bottom() : y();

  return <line x1={x()} y1={y()} x2={x2()} y2={y2()} data-pc-axis-line="" {...defaultedProps} />;
};

export default Line;
