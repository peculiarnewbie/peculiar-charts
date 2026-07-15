import type { OverrideProps } from "@src/lib/types";
import { pointDefined } from "@src/lib/utils";
import { area, type CurveFactory, curveLinear, line } from "d3-shape";
import { type ComponentProps, createMemo, mergeProps, splitProps } from "solid-js";

export type CurveProps = OverrideProps<
  Omit<ComponentProps<"path">, "d">,
  {
    points: [number, number][];
    curve?: CurveFactory;
    baseLine?: number | number[];
    connectNulls?: boolean;
    /** When `'horizontal'`, the baseline runs along the x-axis instead of y. */
    layout?: "vertical" | "horizontal";
  }
>;

/** Renders a `<path>` from points, optionally as a filled area to a baseline. */
const Curve = (props: CurveProps) => {
  const defaultedProps = mergeProps(
    { baseLine: null, curve: curveLinear, connectNulls: false, layout: "vertical" as const },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, [
    "points",
    "curve",
    "baseLine",
    "connectNulls",
    "layout",
  ]);

  const path = createMemo(() =>
    getPath(
      localProps.curve,
      localProps.points,
      localProps.baseLine,
      localProps.connectNulls,
      localProps.layout,
    ),
  );

  return <path d={path() ?? undefined} {...otherProps} />;
};

const getPath = (
  curve: CurveFactory,
  points: [number, number][],
  baseLine: number | number[] | null,
  connectNulls: boolean,
  layout: "vertical" | "horizontal",
) => {
  const data = points.map((point, index) => ({
    point,
    baseLine: Array.isArray(baseLine) ? (baseLine[index] ?? Number.NaN) : baseLine,
  }));
  const datumDefined = (datum: CurveDatum) =>
    pointDefined(datum.point) && (datum.baseLine === null || Number.isFinite(datum.baseLine));

  if (connectNulls) {
    return createPathSegment(curve, data.filter(datumDefined), baseLine !== null, layout);
  }

  const segments: CurveDatum[][] = [];
  let current: CurveDatum[] = [];
  for (const datum of data) {
    if (!datumDefined(datum)) {
      if (current.length > 0) {
        segments.push(current);
        current = [];
      }
    } else {
      current.push(datum);
    }
  }
  if (current.length > 0) segments.push(current);

  return segments
    .map((segment) => createPathSegment(curve, segment, baseLine !== null, layout))
    .join(" ");
};

type CurveDatum = {
  point: [number, number];
  baseLine: number | null;
};

const createPathSegment = (
  curve: CurveFactory,
  data: CurveDatum[],
  hasBaseLine: boolean,
  layout: "vertical" | "horizontal",
) => {
  if (!hasBaseLine) {
    return line<CurveDatum>()
      .curve(curve)
      .x((datum) => datum.point[0])
      .y((datum) => datum.point[1])(data);
  }

  const fn = area<CurveDatum>().curve(curve);
  if (layout === "horizontal") {
    return fn
      .x0((datum) => datum.baseLine!)
      .x1((datum) => datum.point[0])
      .y((datum) => datum.point[1])(data);
  }
  return fn
    .x((datum) => datum.point[0])
    .y0((datum) => datum.baseLine!)
    .y1((datum) => datum.point[1])(data);
};

export default Curve;
