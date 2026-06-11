import { polarAngleLabelPosition } from "@src/axis/polar/PolarAngleAxis";
import { usePolarAxisContext } from "@src/axis/polar/context";
import { usePolarLayout } from "@src/lib/polar/context";
import { projectAngleScale, type PolarAngleScale } from "@src/lib/polar/scale";
import type { OverrideProps } from "@src/lib/types";
import { type ComponentProps, For, mergeProps, splitProps } from "solid-js";

export type PolarAngleLabelProps = OverrideProps<
  Omit<ComponentProps<"text">, "x" | "y">,
  {
    /** Format a category to its label string. @defaultValue `String` */
    format?: (value: any) => string;
    /** Outward offset from the outer radius in px. @defaultValue `12` */
    offset?: number;
  }
>;

/** Category labels around the polar perimeter.
 *
 * @data `data-pc-polar-angle-label-group` - Present on the label group element.
 * @data `data-pc-polar-angle-label` - Present on every label text element.
 */
const PolarAngleLabel = (props: PolarAngleLabelProps) => {
  const defaultedProps = mergeProps(
    {
      format: (value: any) => String(value),
      offset: 12,
      fill: "currentColor",
      "text-anchor": "middle" as const,
      "dominant-baseline": "central" as const,
    },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, ["format", "offset"]);
  const axisContext = usePolarAxisContext();
  const layout = usePolarLayout();

  const position = (tick: any) => {
    const angle = projectAngleScale(axisContext.scale() as PolarAngleScale, tick);
    return polarAngleLabelPosition(layout, angle, localProps.offset);
  };

  return (
    <g data-pc-polar-angle-label-group="">
      <For each={axisContext.labelTicks()}>
        {(tick) => {
          const [x, y] = position(tick);
          return (
            <text x={x} y={y} data-pc-polar-angle-label="" {...otherProps}>
              {localProps.format(tick)}
            </text>
          );
        }}
      </For>
    </g>
  );
};

export default PolarAngleLabel;
