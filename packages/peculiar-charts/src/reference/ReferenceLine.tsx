import { useChartContext } from "@src/components/context";
import createScale from "@src/lib/createScale";
import { projectScale } from "@src/lib/scale";
import type { OverrideProps } from "@src/lib/types";
import { type ComponentProps, Show, createMemo, mergeProps, splitProps } from "solid-js";

export type ReferenceLineProps = OverrideProps<
  Omit<ComponentProps<"line">, "x1" | "y1" | "x2" | "y2">,
  {
    /** Two data-space points — draws a segment between arbitrary x/y values. */
    segment?: [{ x: any; y: any }, { x: any; y: any }];
    /** Value on the x-axis — draws a vertical line. */
    x?: any;
    /** Value on the y-axis — draws a horizontal line. */
    y?: number;
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string;
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string;
    /** Optional text label drawn at the line's start edge. */
    label?: string;
    /** Props forwarded to the label `<text>`. */
    labelProps?: ComponentProps<"text">;
  }
>;

/** A straight annotation line at a constant x or y value.
 *
 * @data `data-pc-reference-line` - Present on the line element.
 */
const ReferenceLine = (props: ReferenceLineProps) => {
  const defaultedProps = mergeProps(
    { xAxisId: "x", yAxisId: "y", stroke: "currentColor", "stroke-width": 1 },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, [
    "segment",
    "x",
    "y",
    "xAxisId",
    "yAxisId",
    "label",
    "labelProps",
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
    if (localProps.segment) {
      const [start, end] = localProps.segment;
      return {
        x1: projectScale(xScale(), start.x),
        y1: projectScale(yScale(), start.y),
        x2: projectScale(xScale(), end.x),
        y2: projectScale(yScale(), end.y),
        lx: projectScale(xScale(), start.x),
        ly: projectScale(yScale(), start.y),
      };
    }
    if (localProps.y !== undefined) {
      const p = projectScale(yScale(), localProps.y);
      return { x1: left, x2: right, y1: p, y2: p, lx: left, ly: p };
    }
    const p = projectScale(xScale(), localProps.x);
    return { x1: p, x2: p, y1: top, y2: bottom, lx: p, ly: top };
  });

  return (
    <g data-pc-reference-line-group="">
      <line
        x1={geom().x1}
        y1={geom().y1}
        x2={geom().x2}
        y2={geom().y2}
        data-pc-reference-line=""
        {...otherProps}
      />
      <Show when={localProps.label}>
        <text
          x={geom().lx}
          y={geom().ly}
          dx={4}
          dy={-4}
          fill="currentColor"
          data-pc-reference-label=""
          {...localProps.labelProps}
        >
          {localProps.label}
        </text>
      </Show>
    </g>
  );
};

export default ReferenceLine;
