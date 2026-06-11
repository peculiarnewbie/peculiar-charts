import type { OverrideProps } from "@src/lib/types";
import { pointDefined } from "@src/lib/utils";
import { type CurveFactory, line, curveLinearClosed } from "d3-shape";
import { type ComponentProps, createMemo, mergeProps, splitProps } from "solid-js";

export type PolarPolygonProps = OverrideProps<
  Omit<ComponentProps<"path">, "d">,
  {
    points: [number, number][];
    curve?: CurveFactory;
  }
>;

/** Closed polygon path — used by {@link Radar} for filled regions. */
const PolarPolygon = (props: PolarPolygonProps) => {
  const defaultedProps = mergeProps(
    { curve: curveLinearClosed, fill: "currentColor", stroke: "currentColor" },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, ["points", "curve"]);

  const path = createMemo(() => {
    const defined = localProps.points.filter(pointDefined);
    if (defined.length < 2) return null;
    return line().curve(localProps.curve)(defined);
  });

  return <path d={path() ?? undefined} {...otherProps} />;
};

export default PolarPolygon;
