import { useChartContext } from "@src/components/context";
import createScale from "@src/lib/createScale";
import { projectScale } from "@src/lib/scale";
import type { OverrideProps } from "@src/lib/types";
import { type ComponentProps, createMemo, mergeProps, splitProps } from "solid-js";

export type ReferenceAreaProps = OverrideProps<
  Omit<ComponentProps<"rect">, "x" | "y" | "width" | "height">,
  {
    /** Lower x bound. Defaults to the plot's left edge. */
    x1?: any;
    /** Upper x bound. Defaults to the plot's right edge. */
    x2?: any;
    /** Lower y bound. Defaults to the plot's bottom edge. */
    y1?: number;
    /** Upper y bound. Defaults to the plot's top edge. */
    y2?: number;
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string;
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string;
  }
>;

/** A shaded rectangular region spanning a range on either or both axes.
 *
 * @data `data-pc-reference-area` - Present on the rect element.
 */
const ReferenceArea = (props: ReferenceAreaProps) => {
  const defaultedProps = mergeProps(
    {
      xAxisId: "x",
      yAxisId: "y",
      fill: "currentColor",
      "fill-opacity": 0.1,
    },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, [
    "x1",
    "x2",
    "y1",
    "y2",
    "xAxisId",
    "yAxisId",
  ]);
  const ctx = useChartContext();

  const xScale = createScale({
    axisId: () => localProps.xAxisId,
    orientation: () => "x",
    chartContext: ctx,
  });
  const yScale = createScale({
    axisId: () => localProps.yAxisId,
    orientation: () => "y",
    chartContext: ctx,
  });

  const geom = createMemo(() => {
    const left = ctx.getInset("left");
    const right = ctx.width() - ctx.getInset("right");
    const top = ctx.getInset("top");
    const bottom = ctx.height() - ctx.getInset("bottom");
    const px1 = localProps.x1 !== undefined ? projectScale(xScale(), localProps.x1) : left;
    const px2 = localProps.x2 !== undefined ? projectScale(xScale(), localProps.x2) : right;
    const py1 = localProps.y1 !== undefined ? projectScale(yScale(), localProps.y1) : bottom;
    const py2 = localProps.y2 !== undefined ? projectScale(yScale(), localProps.y2) : top;
    return {
      x: Math.min(px1, px2),
      y: Math.min(py1, py2),
      width: Math.abs(px2 - px1),
      height: Math.abs(py2 - py1),
    };
  });

  return (
    <rect
      x={geom().x}
      y={geom().y}
      width={geom().width}
      height={geom().height}
      data-pc-reference-area=""
      {...otherProps}
    />
  );
};

export default ReferenceArea;
