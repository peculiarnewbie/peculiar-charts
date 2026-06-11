import { usePolarAxisContext } from "@src/axis/polar/context";
import { usePolarLayout } from "@src/lib/polar/context";
import { type PolarRadiusScale, projectRadiusScale } from "@src/lib/polar/scale";
import { polarToCartesian } from "@src/lib/polar/utils";
import type { OverrideProps } from "@src/lib/types";
import { type ComponentProps, For, mergeProps, splitProps } from "solid-js";

export type PolarRadiusLabelProps = OverrideProps<
  Omit<ComponentProps<"text">, "x" | "y">,
  {
    /** Format a tick value to its label string. @defaultValue `String` */
    format?: (value: number) => string;
    /** Offset along the spoke in px (positive = outward). @defaultValue `6` */
    offset?: number;
  }
>;

/** Numeric tick labels along a radius-axis spoke.
 *
 * @data `data-pc-polar-radius-label-group` - Present on the label group element.
 * @data `data-pc-polar-radius-label` - Present on every label text element.
 */
const PolarRadiusLabel = (props: PolarRadiusLabelProps) => {
  const defaultedProps = mergeProps(
    {
      format: (value: number) => String(value),
      offset: 6,
      fill: "currentColor",
      "text-anchor": "middle" as const,
      "dominant-baseline": "central" as const,
    },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, ["format", "offset"]);
  const axisContext = usePolarAxisContext();
  const layout = usePolarLayout();
  const angle = () => axisContext.angle?.() ?? 0;

  const position = (tick: number) => {
    const radius =
      projectRadiusScale(axisContext.scale() as PolarRadiusScale, tick) + localProps.offset;
    return polarToCartesian(layout.cx(), layout.cy(), radius, angle());
  };

  return (
    <g data-pc-polar-radius-label-group="">
      <For each={axisContext.labelTicks()}>
        {(tick) => {
          const [x, y] = position(tick);
          return (
            <text x={x} y={y} data-pc-polar-radius-label="" {...otherProps}>
              {localProps.format(tick)}
            </text>
          );
        }}
      </For>
    </g>
  );
};

export default PolarRadiusLabel;
