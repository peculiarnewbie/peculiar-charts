import type { AxisConfig, AxisOrientation, Domain } from "@src/components/context";
import { combineExtents, finiteExtent, type NumericExtent } from "@src/lib/extent";
import { resolveRangeValue } from "@src/lib/parseAxisRange";
import { accessData, toNumeric, uniqueInOrder } from "@src/lib/utils";

/** Pure axis-domain pipeline shared by the main chart and brush preview. */
export const resolveAxisDomain = (props: {
  config: AxisConfig;
  orientation: AxisOrientation;
  data: unknown[];
  extents?: Iterable<NumericExtent>;
}): Domain => {
  const { config, orientation, data } = props;

  if (config.type === "band" || config.type === "point") {
    const rawValues = config.dataKey
      ? accessData(data, config.dataKey)
      : Array.from({ length: data.length }, (_, index) => index);
    return {
      kind: "categorical",
      values: config.allowDuplicatedCategory ? rawValues : uniqueInOrder(rawValues),
    };
  }

  const dataExtent =
    orientation === "x" || orientation === "angle"
      ? finiteExtent(
          (config.dataKey ? accessData(data, config.dataKey) : data.map((_, index) => index)).map(
            toNumeric,
          ),
        )
      : undefined;
  const registeredExtent = combineExtents(props.extents ?? []);
  const aggregate = combineExtents([dataExtent, registeredExtent]) ?? { min: 0, max: 0 };

  const userMin = config.range?.[0];
  const userMax = config.range?.[1];
  const resolvedMin =
    userMin !== undefined ? resolveRangeValue(userMin, aggregate.min, aggregate.max) : undefined;
  const resolvedMax =
    userMax !== undefined ? resolveRangeValue(userMax, aggregate.min, aggregate.max) : undefined;

  return {
    kind: "numeric",
    min: resolvedMin ?? aggregate.min,
    max: resolvedMax ?? aggregate.max,
    userDefined: config.range !== null,
  };
};
