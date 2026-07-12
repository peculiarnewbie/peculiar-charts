import { useChartContext } from "@src/components/context";
import {
  type AnimationOptions,
  type ResolvedAnimationOptions,
  createPresence,
  resolveAnimation,
} from "@src/lib/animation";
import { paletteColor } from "@src/lib/palette";
import type { OverrideProps } from "@src/lib/types";
import { accessData } from "@src/lib/utils";
import { arc as d3arc, pie as d3pie } from "d3-shape";
import {
  type ComponentProps,
  For,
  type JSX,
  Show,
  createEffect,
  createMemo,
  createUniqueId,
  mergeProps,
  onCleanup,
  splitProps,
} from "solid-js";

/** Geometry and source data for one pie slice. */
export type PieSliceDatum = {
  /** Centre of the pie in SVG coordinates. */
  cx: number;
  /** Centre of the pie in SVG coordinates. */
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  /** Slice value after invalid and negative values have been excluded. */
  value: number;
  /** Slice name, from `nameKey` or the generated `Slice n` fallback. */
  name: string;
  /** Stable slice key, from `colorKey`, `nameKey`, or the source index. */
  key: string;
  index: number;
  /** Fraction of the visible pie represented by this slice, from 0 to 1. */
  percent: number;
  color: string;
};

/** A pie-label datum adds the resolved SVG text position. */
export type PieLabelDatum = PieSliceDatum & {
  /** Label coordinates relative to the pie centre (the parent group). */
  point: [number, number];
  textAnchor: "start" | "middle" | "end";
};

/** How to render pie labels: disabled, default text with SVG props, or a render function. */
export type PieLabelRenderer =
  | boolean
  | Omit<ComponentProps<"text">, "x" | "y" | "children">
  | ((datum: PieLabelDatum) => JSX.Element);

/** Handler for an individual pie slice interaction. */
export type PieSliceEventHandler = (datum: PieSliceDatum, event: MouseEvent) => void;

export type PieProps = OverrideProps<
  Omit<ComponentProps<"path">, "d">,
  {
    /** Data key for slice values. Omit for a plain number array. */
    dataKey?: string;
    /** Per-series data array. Overrides chart-level data for this pie. */
    data?: unknown[];
    /** Data key for slice names (legend/labels). */
    nameKey?: string;
    /** Data key for stable slice identity and palette assignment. @defaultValue `nameKey` */
    colorKey?: string;
    /** Explicit fill colours — map by `colorKey` value or callback. */
    colors?: Record<string, string> | ((key: string) => string | undefined);
    /** Inner radius — `0` for a pie, `> 0` (px or `%` of radius) for a donut. */
    innerRadius?: number | `${number}%`;
    /** Outer radius as px or `%` of the available radius. @defaultValue `'100%'` */
    outerRadius?: number | `${number}%`;
    /** Rounded corner radius for slices in px. */
    cornerRadius?: number;
    /** Angular padding between slices in radians. */
    padAngle?: number;
    /** Start angle of the pie in radians. @defaultValue `0` */
    startAngle?: number;
    /** End angle of the pie in radians. @defaultValue `2π` */
    endAngle?: number;
    /** Slice labels — `true`, SVG text props, or a custom render function. */
    label?: PieLabelRenderer;
    /** Where to place default labels. @defaultValue `'inside'` */
    labelPosition?: "inside" | "outside";
    /** Distance in px beyond the outer radius for outside labels. @defaultValue `12` */
    labelOffset?: number;
    /** Animation configuration. */
    animation?: AnimationOptions;
    /** Fired when a slice is clicked. */
    onSliceClick?: PieSliceEventHandler;
    /** Fired when the pointer enters a slice. */
    onSliceEnter?: PieSliceEventHandler;
    /** Fired when the pointer leaves a slice. */
    onSliceLeave?: PieSliceEventHandler;
  }
>;

const resolveRadius = (value: number | `${number}%`, available: number): number =>
  typeof value === "number" ? value : (Number.parseFloat(value) / 100) * available;

/** Pie / donut series. Self-contained — needs no axes. Each slice is registered
 * with the chart so it appears in `<Legend>` and can be toggled.
 *
 * @data `data-pc-pie-group` - Present on the pie group element.
 * @data `data-pc-pie-slice` - Present on every slice path element.
 */
const Pie = (props: PieProps) => {
  const pieId = createUniqueId();
  const defaultedProps = mergeProps(
    {
      innerRadius: 0,
      outerRadius: "100%" as const,
      cornerRadius: 0,
      padAngle: 0,
      startAngle: 0,
      endAngle: Math.PI * 2,
      labelPosition: "inside" as const,
      labelOffset: 12,
      stroke: "none",
    },
    props,
  );
  const [localProps, eventProps, otherProps] = splitProps(
    defaultedProps,
    [
      "dataKey",
      "data",
      "nameKey",
      "colorKey",
      "colors",
      "innerRadius",
      "outerRadius",
      "cornerRadius",
      "padAngle",
      "startAngle",
      "endAngle",
      "label",
      "labelPosition",
      "labelOffset",
      "animation",
    ],
    ["onSliceClick", "onSliceEnter", "onSliceLeave"],
  );
  const chartContext = useChartContext();

  const colorIndexByKey = new Map<string, number>();
  let nextPaletteIndex = 0;

  const paletteIndexFor = (key: string) => {
    let index = colorIndexByKey.get(key);
    if (index === undefined) {
      index = nextPaletteIndex++;
      colorIndexByKey.set(key, index);
    }
    return index;
  };

  const sliceColor = (key: string) => {
    const colors = localProps.colors;
    if (colors) {
      if (typeof colors === "function") {
        const color = colors(key);
        if (color !== undefined) return color;
      } else if (colors[key] !== undefined) {
        return colors[key]!;
      }
    }
    return paletteColor(paletteIndexFor(key));
  };

  const sliceId = (key: string) => `${pieId}-${key}`;

  const sourceData = () => localProps.data ?? chartContext.data();
  const values = createMemo(() => accessData<number>(sourceData(), localProps.dataKey));
  const names = createMemo(() =>
    localProps.nameKey
      ? accessData<any>(sourceData(), localProps.nameKey)
      : values().map((_, i) => `Slice ${i + 1}`),
  );
  const colorKeys = createMemo(() => {
    if (localProps.colorKey) {
      return accessData<any>(sourceData(), localProps.colorKey).map(String);
    }
    if (localProps.nameKey) return names().map(String);
    return values().map((_, i) => String(i));
  });

  // Register every slice as a series so the legend lists & toggles them.
  createEffect(() => {
    const _names = names();
    const _keys = colorKeys();
    _keys.forEach((key, i) =>
      chartContext.registerSeriesMeta(sliceId(key), {
        name: String(_names[i]),
        type: "pie",
        color: sliceColor(key),
      }),
    );
    onCleanup(() => _keys.forEach((key) => chartContext.unregisterSeriesMeta(sliceId(key))));
  });

  const colorOf = (id: string, key: string) =>
    chartContext.seriesMeta().find((s) => s.id === id)?.color ?? sliceColor(key);

  const layout = createMemo(() => {
    const _values = values();
    const _keys = colorKeys();
    const _names = names();

    const left = chartContext.getInset("left");
    const right = chartContext.width() - chartContext.getInset("right");
    const top = chartContext.getInset("top");
    const bottom = chartContext.height() - chartContext.getInset("bottom");

    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const available = Math.max(0, Math.min(right - left, bottom - top) / 2);
    const outerR = resolveRadius(localProps.outerRadius, available);
    const innerR = resolveRadius(localProps.innerRadius, outerR);

    const slices = _values
      .map((value, index) => ({
        value: typeof value === "number" && value > 0 ? value : 0,
        index,
        key: _keys[index]!,
        id: sliceId(_keys[index]!),
        name: String(_names[index] ?? `Slice ${index + 1}`),
      }))
      .filter((s) => chartContext.isSeriesVisible(s.id));

    const pieGen = d3pie<(typeof slices)[number]>()
      .value((d) => d.value)
      .sort(null)
      .startAngle(localProps.startAngle)
      .endAngle(localProps.endAngle)
      .padAngle(localProps.padAngle);

    const arcs = pieGen(slices);
    const total = arcs.reduce((sum, arc) => sum + arc.value, 0);

    return {
      cx,
      cy,
      innerR,
      outerR,
      slices: arcs.map((a) => ({
        startAngle: a.startAngle,
        endAngle: a.endAngle,
        id: a.data.id,
        index: a.data.index,
        key: a.data.key,
        name: a.data.name,
        value: a.value,
        percent: total === 0 ? 0 : a.value / total,
      })),
    };
  });

  const animOpts = createMemo<ResolvedAnimationOptions>(() =>
    resolveAnimation(localProps.animation),
  );
  const animatedSlices = createPresence(
    () => layout().slices,
    animOpts,
    (a, b, t) => ({
      startAngle: a.startAngle + (b.startAngle - a.startAngle) * t,
      endAngle: a.endAngle + (b.endAngle - a.endAngle) * t,
      id: b.id,
      index: b.index,
      key: b.key,
      name: b.name,
      value: b.value,
      percent: b.percent,
    }),
    (target) => ({
      startAngle: target.startAngle,
      endAngle: target.startAngle,
      id: target.id,
      index: target.index,
      key: target.key,
      name: target.name,
      value: target.value,
      percent: target.percent,
    }),
    (current) => ({
      startAngle: current.startAngle,
      endAngle: current.startAngle,
      id: current.id,
      index: current.index,
      key: current.key,
      name: current.name,
      value: current.value,
      percent: current.percent,
    }),
  );
  const animatedLayout = createMemo(() => {
    const { cx, cy, innerR, outerR } = layout();
    const arcGen = d3arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .cornerRadius(localProps.cornerRadius);
    return {
      cx,
      cy,
      slices: animatedSlices().map((item) => ({
        d: arcGen(item.value) ?? "",
        id: item.value.id,
        index: item.value.index,
        key: item.value.key,
        name: item.value.name,
        value: item.value.value,
        percent: item.value.percent,
        startAngle: item.value.startAngle,
        endAngle: item.value.endAngle,
        mode: item.mode,
      })),
    };
  });

  const sliceDatum = (
    slice: ReturnType<typeof animatedLayout>["slices"][number],
  ): PieSliceDatum => ({
    cx: animatedLayout().cx,
    cy: animatedLayout().cy,
    innerRadius: layout().innerR,
    outerRadius: layout().outerR,
    startAngle: slice.startAngle,
    endAngle: slice.endAngle,
    value: slice.value,
    name: slice.name,
    key: slice.key,
    index: slice.index,
    percent: slice.percent,
    color: colorOf(slice.id, slice.key),
  });

  const labelDatum = (
    slice: ReturnType<typeof animatedLayout>["slices"][number],
  ): PieLabelDatum => {
    const datum = sliceDatum(slice);
    const angle = (datum.startAngle + datum.endAngle) / 2 - Math.PI / 2;
    const outside = localProps.labelPosition === "outside";
    const radius = outside
      ? datum.outerRadius + localProps.labelOffset
      : (datum.innerRadius + datum.outerRadius) / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return {
      ...datum,
      point: [x, y],
      textAnchor: outside ? (Math.cos(angle) >= 0 ? "start" : "end") : "middle",
    };
  };

  return (
    <g data-pc-pie-group="" transform={`translate(${animatedLayout().cx}, ${animatedLayout().cy})`}>
      <For each={animatedLayout().slices}>
        {(slice) => {
          const datum = () => sliceDatum(slice);
          return (
            <>
              <path
                d={slice.d}
                fill={datum().color}
                data-pc-pie-slice=""
                data-index={slice.index}
                data-key={slice.key}
                {...otherProps}
                {...(slice.mode === "exit"
                  ? {}
                  : {
                      ...(eventProps.onSliceClick
                        ? {
                            onClick: (event: MouseEvent) =>
                              eventProps.onSliceClick?.(datum(), event),
                          }
                        : {}),
                      ...(eventProps.onSliceEnter
                        ? {
                            onMouseEnter: (event: MouseEvent) =>
                              eventProps.onSliceEnter?.(datum(), event),
                          }
                        : {}),
                      ...(eventProps.onSliceLeave
                        ? {
                            onMouseLeave: (event: MouseEvent) =>
                              eventProps.onSliceLeave?.(datum(), event),
                          }
                        : {}),
                    })}
              />
              <Show when={localProps.label && slice.mode !== "exit"}>
                {(() => {
                  const label = localProps.label;
                  const d = labelDatum(slice);
                  return typeof label === "function" ? (
                    label(d)
                  ) : (
                    <text
                      x={d.point[0]}
                      y={d.point[1]}
                      text-anchor={d.textAnchor}
                      dominant-baseline="middle"
                      data-pc-pie-label=""
                      {...(label === true ? {} : label)}
                    >
                      {d.name}
                    </text>
                  );
                })()}
              </Show>
            </>
          );
        }}
      </For>
    </g>
  );
};

export default Pie;
