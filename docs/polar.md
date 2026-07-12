# Polar charts (radar & radial bars)

**Naming:** **Radar** is the chart type users ask for (`<Radar>` series, "radar chart" in
demos). **Polar** is the coordinate-system prefix for layout and axes (`PolarLayout`,
`PolarGrid`, `PolarTooltip`, …) — the same split Recharts uses internally.

peculiar-charts supports radar / spider charts through a small layout + axis layer and a
`Radar` and `RadialBar` series. Polar components compose like cartesian ones: wrap them in `<Chart>`,
frame the drawable area with `<PolarLayout>`, register axes, then draw series.

Playground: **Radar** group in [charts.peculiarnewbie.com](https://charts.peculiarnewbie.com).

---

## Quick start

```tsx
import {
  Chart,
  Legend,
  PolarAngleAxis,
  PolarAngleLabel,
  PolarCrosshair,
  PolarGrid,
  PolarLayout,
  PolarRadiusAxis,
  PolarRadiusLabel,
  PolarTooltip,
  Radar,
} from "peculiar-charts";

const skills = [
  { skill: "Speed", alice: 120, bob: 98 },
  { skill: "Strength", alice: 98, bob: 130 },
  // …
];

function SkillsRadar() {
  return (
    <Chart data={skills} inset={24}>
      <Legend />
      <PolarLayout outerRadius="75%">
        <PolarAngleAxis dataKey="skill">
          <PolarAngleLabel />
          <PolarCrosshair stroke-dasharray="4,4" />
          <PolarTooltip />
        </PolarAngleAxis>
        <PolarRadiusAxis tickCount={4}>
          <PolarGrid />
          <PolarRadiusLabel />
        </PolarRadiusAxis>
        <Radar dataKey="alice" name="Alice" class="text-violet-500" />
        <Radar dataKey="bob" name="Bob" class="text-emerald-500" />
      </PolarLayout>
    </Chart>
  );
}
```

Styling is headless: pass Tailwind `class` + `currentColor`, or any SVG attribute via
`{...otherProps}` on `Radar`, grid paths, and labels.

---

## Architecture

```
<Chart>                         — data, insets, series registry, legend visibility
  <PolarLayout>                 — centre (cx, cy), inner/outer radius, angular range
    <PolarAngleAxis>            — categorical spokes (orientation: angle)
      <PolarAngleLabel />       — category labels around the perimeter
    <PolarRadiusAxis>           — numeric rings (orientation: radius)
      <PolarGrid />             — polygon/circle rings + radial spokes
      <PolarRadiusLabel />      — tick labels along one spoke
    <Radar />                   — closed polygon series
```

### Coordinate model

- **Angles** use standard math radians, SVG y-down: `0` is east, `-π/2` is top (chart
  default `startAngle`).
- **Radius** maps data values linearly from `innerRadius` to `outerRadius` (px or `%` of
  the smaller half-dimension of the plot rect).
- **`polarToCartesian(cx, cy, r, θ)`** is exported for custom overlays and annotations.

Scales are built with d3 (`scalePoint` for categories, `scaleLinear` for values). Domain
resolution reuses the cartesian chart context:

- **Angle axis** — categorical `point` domain from `dataKey`, or a numeric `linear` domain for
  radial bars and gauges.
- **Radius axis** — numeric domain from registered series extents (same as `y`), with
  optional `axisRange` override on `<PolarRadiusAxis>`.

### Series registration

`<Radar>` calls `createSeries` with `type: 'radar'` and registers its value extent on the
radius axis. Legend toggles and tooltip payloads work through the same `seriesMeta` registry
as cartesian series.

Point geometry is produced by **`createPolarPoints`** (exported) — project each datum through
the angle and radius scales, then render with **`PolarPolygon`** (closed `d3` line path).

---

## Components

| Component          | Role                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `PolarLayout`      | Provides `usePolarLayout()` — `cx`, `cy`, `innerRadius`, `outerRadius`, `startAngle`, `endAngle` |
| `PolarAngleAxis`   | Categorical spokes or a numeric angular-value scale; exposes polar axis context to children      |
| `PolarAngleLabel`  | Category labels outside `outerRadius`                                                            |
| `PolarRadiusAxis`  | Registers `orientation: 'radius'`; `angle` sets which spoke tick labels use                      |
| `PolarRadiusLabel` | Numeric tick labels along the radius axis spoke                                                  |
| `PolarGrid`        | Concentric rings (`gridType: 'polygon' \| 'circle'`) and optional `radialLines` spokes           |
| `PolarCrosshair`   | Radial guide line at the category spoke nearest the pointer                                      |
| `PolarTooltip`     | HTML tooltip (portaled) — default body or `content` render-prop                                  |
| `Radar`            | Filled/stroked closed polygon; `angleAxisId` / `radiusAxisId` bind axes                          |
| `RadialBar`        | Concentric progress rings; values map to a numeric angle axis                                    |
| `PolarPolygon`     | Low-level closed path from `[x, y][]` — for custom polar series                                  |

### `PolarLayout` props

| Prop          | Default     | Description                    |
| ------------- | ----------- | ------------------------------ |
| `cx`, `cy`    | plot centre | Centre in SVG coordinates      |
| `innerRadius` | `0`         | Inner bound (px or `%`)        |
| `outerRadius` | `'80%'`     | Outer bound (px or `%`)        |
| `startAngle`  | `-π/2`      | First category angle (radians) |
| `endAngle`    | `3π/2`      | Last category angle (radians)  |

### `Radar` props

| Prop           | Default    | Description                                         |
| -------------- | ---------- | --------------------------------------------------- |
| `dataKey`      | —          | Key for spoke values (omit for plain number arrays) |
| `name`         | `dataKey`  | Legend / tooltip label                              |
| `angleAxisId`  | `'angle'`  | Bound angle axis                                    |
| `radiusAxisId` | `'radius'` | Bound radius axis                                   |
| `fillOpacity`  | `0.35`     | Polygon fill opacity                                |
| `animation`    | —          | Tween polygon point geometry on data updates        |

`data-pc-radar-group` and `data-pc-radar` attributes are emitted for testing and styling.

### `RadialBar`

`<RadialBar>` renders one concentric ring per data row. Its `dataKey` maps to an angular span,
so pair it with a numeric angle axis and set a stable domain for gauge-like progress charts:

```tsx
<PolarLayout innerRadius="20%" outerRadius="85%">
  <PolarAngleAxis type="linear" axisRange={[0, 100]} />
  <RadialBar dataKey="value" background cornerRadius={4} />
</PolarLayout>
```

- `barGap` / `barSize` control radial spacing and thickness in pixels.
- `minAngle` ensures non-zero values remain visible (radians).
- `background` draws a full track for every ring; pass `true` or SVG path props.
- `label` accepts `true`, SVG text props, or a render function with the resolved bar and label
  geometry. `labelPosition="outside"` uses `labelOffset` and exposes `labelPoint` / `textAnchor`.
- `animation` tweens angular spans; entering and exiting bars grow from / shrink to the baseline.
- `onPointClick`, `onPointEnter`, and `onPointLeave` receive the value, source index, and
  centre point of the ring segment.

Use `data-pc-radial-bar-group`, `data-pc-radial-bar`, and `data-pc-radial-bar-background`
for testing or styling.

---

## Custom polar series

Author a new polar series without forking by reusing the same primitives as `Radar`:

```tsx
import {
  accessData,
  createPolarPoints,
  createSeries,
  PolarPolygon,
  useChartContext,
  usePolarLayout,
} from "peculiar-charts";
import { createMemo, createUniqueId } from "solid-js";

function MyPolarSeries(props: { dataKey: string }) {
  const chartContext = useChartContext();
  const layout = usePolarLayout();
  const seriesId = createUniqueId();
  const data = createMemo(() => accessData<number>(chartContext.data(), props.dataKey));

  createSeries({
    seriesId,
    name: () => props.dataKey,
    type: "custom-polar",
    yAxisId: () => "radius",
    dataKey: () => props.dataKey,
    stackId: () => undefined,
    data,
    chartContext,
  });

  const points = createPolarPoints({
    angleAxisId: () => "angle",
    radiusAxisId: () => "radius",
    dataKey: () => props.dataKey,
    data,
    layout,
    chartContext,
  });

  return <PolarPolygon points={points()} />;
}
```

Place the component inside `<PolarLayout>` after the axes so domains are registered.

---

## Tooltip and crosshair

Place `<PolarCrosshair>` and `<PolarTooltip>` inside `<PolarAngleAxis>` (not the radius axis).
They snap to the **nearest category spoke** by comparing the pointer angle from the chart centre
to each category's projected angle (`createPolarClosestTick`).

The tooltip **anchors on the active spoke** just outside `outerRadius` — it does not follow the
raw pointer, so it stays beside the chart even when the cursor is far from the centre.

```tsx
<PolarAngleAxis dataKey="skill">
  <PolarCrosshair class="stroke-zinc-400" stroke-dasharray="4,4" />
  <PolarTooltip class="rounded-lg border bg-white px-2 py-1 text-xs shadow-lg" />
</PolarAngleAxis>
```

`PolarTooltip` accepts the same `content` / `children` render-prop and `TooltipPayload` as
`<AxisTooltip>`. Use `usePolarClosestTick(angleAxisId)` in custom overlays for the active index.

Playground: **Radar → Radar chart** and **Custom tooltip**.

## Limitations (current)

- **Single value axis** — typical radar layout; biaxial polar is not implemented.
- **Recharts parity** — radial bars are supported; polar brush and richer tick customisation are
  still open. See `references/recharts/src/polar/` for comparison.

---

## References

- Recharts polar implementation: `references/recharts/src/polar/`
- Upstream Solid inspiration (no polar yet): `references/solid-charts/` — see
  `docs/references.md` for clone instructions.
