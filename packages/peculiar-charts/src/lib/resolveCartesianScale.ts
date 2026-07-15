import type { AxisConfig, AxisOrientation, Domain, Edge } from "@src/components/context";
import { buildScale, type Scale } from "@src/lib/scale";
import { isDev } from "solid-js/web";

const resolveLogDomain = (min: number, max: number): [number, number] => {
  const valid = Number.isFinite(min) && Number.isFinite(max) && min !== 0 && max !== 0;
  if (valid && Math.sign(min) === Math.sign(max)) return [min, max];

  const message = `[peculiar-charts]: Log scale domain bounds must be finite, non-zero, and have the same sign; received [${min}, ${max}]`;
  if (isDev) throw new Error(message);

  return max < 0 ? [-10, -1] : [1, 10];
};

/** Pure scale resolver used by rendering, hooks, hit-testing, and sync. */
export const resolveCartesianScale = (props: {
  config: AxisConfig;
  domain: Domain;
  orientation: AxisOrientation;
  width: number;
  height: number;
  insets: Record<Edge, number>;
  barPadding?: number;
}): Scale => {
  const { config, domain, orientation, insets } = props;
  let start: number;
  let end: number;

  if (orientation === "x") {
    const barPadding = config.type === "band" ? 0 : (props.barPadding ?? 0);
    start = insets.left + barPadding + (config.padding?.left ?? 0);
    end = props.width - insets.right - barPadding - (config.padding?.right ?? 0);
  } else {
    start = props.height - insets.bottom - (config.padding?.bottom ?? 0);
    end = insets.top + (config.padding?.top ?? 0);
  }

  if (domain.kind === "categorical") {
    return buildScale(config.type, domain.values, [start, end], { reverse: config.reverse });
  }

  let min = domain.min;
  let max = domain.max;
  if (orientation === "y" && config.type === "linear" && !domain.userDefined) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  if (config.type === "log") [min, max] = resolveLogDomain(min, max);

  const scale = buildScale(config.type, [min, max], [start, end], {
    reverse: config.reverse,
  });
  if (
    !domain.userDefined &&
    orientation !== "x" &&
    (scale.type === "linear" || scale.type === "log" || scale.type === "time")
  ) {
    scale.scale.nice();
  }
  return scale;
};
