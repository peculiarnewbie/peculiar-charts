# Feature Parity: Line & Area Charts vs Recharts

A deep-dive comparison of what Recharts' Line and Area chart examples demonstrate versus
what peculiar-charts currently supports. Based on the 20 LineChart and 13 AreaChart examples
in Recharts' docs and storybook.

> **TL;DR** — Core rendering (curves, dots, labels, stacking, null handling, axes, vertical
> layout, per-series data, percent stacking) is at parity. The gaps are in **ranged areas**,
> **custom shape rendering**, **advanced animation controls**, and
> a handful of tooltip configuration options. None require architectural changes —
> they're all additions to the existing prop surface.

---

## Reference scope

| Source          | What was analyzed                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Recharts        | `references/recharts/www/src/docs/exampleComponents/LineChart/` (20 files), `AreaChart/` (13 files), storybook examples for sync, time series, custom shapes |
| Peculiar-charts | `packages/peculiar-charts/src/` (all series, lib, reference, component files), `apps/www/src/demos/`                                                         |

Implementation examples for closed parity gaps should live on the hidden www route
`/feature-parity`, not in the main public demo picker. Keep the route linked from this
document only so the landing page stays focused on polished product examples.

---

## Scorecard

| Feature                                  | Recharts                                                                                                                | Peculiar-charts                                                                                                    | Gap                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| **Curve interpolation types**            | `"monotone"`, `"linear"`, `"natural"`, d3 curve fns                                                                     | 19 d3 curve factories exported + any `CurveFactory`                                                                | **Parity**                   |
| **`connectNulls`**                       | boolean on Line/Area                                                                                                    | boolean on Line/Area                                                                                               | **Parity**                   |
| **Stacking** (`stackId`)                 | on Line/Area                                                                                                            | on Line/Area                                                                                                       | **Parity**                   |
| **Biaxial axes** (`yAxisId`)             | multiple YAxis + yAxisId on series                                                                                      | multiple Axis + yAxisId on series                                                                                  | **Parity**                   |
| **ReferenceLine/Area/Dot**               | full support                                                                                                            | full support                                                                                                       | **Parity**                   |
| **`syncId`** (cross-chart sync)          | supported + `syncMethod`                                                                                                | supported + `syncMethod`                                                                                           | **Parity**                   |
| **Brush** (data range selector)          | supported                                                                                                               | supported                                                                                                          | **Parity**                   |
| **Dot customization**                    | bool/props-object/function                                                                                              | bool/props-object/function (`DotRenderer`)                                                                         | **Parity**                   |
| **Label customization**                  | `label` prop (bool/props-object/function)                                                                               | `<SeriesLabel>` component (offset/format/render-prop)                                                              | **Parity** (different shape) |
| **Gradient fill**                        | SVG `<defs>` + `<linearGradient>`                                                                                       | SVG `<defs>` + `<linearGradient>`                                                                                  | **Parity**                   |
| **Fill by value (+/-)**                  | custom gradient with `useYAxisScale` hook                                                                               | `positiveFill`/`negativeFill` props                                                                                | **Parity** (better API)      |
| **Null/missing data gaps**               | path breaks at null                                                                                                     | path breaks at null/NaN                                                                                            | **Parity**                   |
| **Per-datum events**                     | `onClick`/`onMouseEnter` on series                                                                                      | `onPointClick`/`onPointEnter`/`onPointLeave` on dots                                                               | **Parity**                   |
| **Animation**                            | `isAnimationActive`, `duration`, `easing`, `begin`                                                                      | `animation` prop with enter/exit phases, easing, delay                                                             | **Parity** (richer config)   |
| **Tiny/minimal chart**                   | no axes/grid/tooltip                                                                                                    | headless — omit any component                                                                                      | **Parity**                   |
| **Dashed line**                          | `strokeDasharray` on Line                                                                                               | `stroke-dasharray` via SVG passthrough                                                                             | **Parity**                   |
| **SVG stroke props**                     | `strokeWidth`, `strokeLinecap`, `strokeOpacity`, `opacity`                                                              | all pass through via `{...otherProps}`                                                                             | **Parity**                   |
| ---                                      | ---                                                                                                                     | ---                                                                                                                | ---                          |
| **Vertical layout**                      | `layout="vertical"` on chart                                                                                            | `layout="horizontal"` on Line/Area/Point                                                                           | **Parity**                   |
| **Ranged area** (`[min, max]` tuples)    | data values as `[low, high]` arrays                                                                                     | `<Area dataKey="temp" />` with `[low, high]` tuple data                                                            | **Parity**                   |
| **Percent stacking**                     | `stackOffset="expand"`                                                                                                  | `stackOffset="expand"` on `<Chart>`                                                                                | **Parity**                   |
| **`stackOffset` variants**               | `"expand"`, `"silhouette"`, `"sign"`, `"none"`                                                                          | `"expand"` supported                                                                                               | **Partial**                  |
| **Custom `shape` on Line/Area**          | custom component receives `animationElapsedTime`, `isEntrance`                                                          | `shape` prop on Line/Area — function receives points, SVG props, animation state                                         | **Parity**                   |
| **Custom `animationInterpolateFn`**      | custom interpolation logic for animation                                                                                | Not supported                                                                                                      | **Missing**                  |
| **Animation match strategy**             | `animationMatchBy` (`matchByIndex`/`matchByDataKey`)                                                                    | Not supported                                                                                                      | **Missing**                  |
| **Chart-level mouse/touch events**       | `onClick`, `onMouseMove`, `onMouseDown`, `onMouseUp`, `onDoubleClick`, `onContextMenu`, touch events on chart container | `onChartClick`, `onChartPointerMove`, `onChartPointerDown`, `onChartPointerUp`, `onChartPointerLeave` on `<Chart>` | **Parity**                   |
| **Axis padding**                         | `padding={{ left: 30, right: 30 }}` on XAxis/YAxis                                                                      | `padding={{ left, right, top, bottom }}` on `<Axis>`                                                               | **Parity**                   |
| **ReferenceLine `segment`**              | line between two arbitrary `{x, y}` points                                                                              | `segment` prop with two data-space endpoints                                                                       | **Parity**                   |
| **Per-series data**                      | `<Line data={seriesData}>` — each series carries own data                                                               | `data` prop on Line/Area/Point/Bar                                                                                 | **Parity**                   |
| **Axis domain expressions**              | `domain={[0, 'dataMax + 1000']}` with string expressions                                                                | `axisRange` takes numeric bounds only                                                                              | **Missing**                  |
| **`allowDataOverflow`**                  | clips rendered geometry to axis domain                                                                                  | Not verified                                                                                                       | **Unknown**                  |
| **`tickFormatter` on axis**              | custom tick label formatting function                                                                                   | `tickFormatter` on `<Axis>` + local `<AxisLabel format>` override                                                  | **Parity**                   |
| **Tooltip `defaultIndex`**               | show tooltip at a position on load                                                                                      | Not verified                                                                                                       | **Unknown**                  |
| **Legend `onMouseEnter`/`onMouseLeave`** | hover events on legend items                                                                                            | `onMouseEnter`/`onMouseLeave` on `<Legend>`                                                                        | **Parity**                   |
| **`allowDuplicatedCategory`**            | deduplicate category axis labels                                                                                        | Not verified                                                                                                       | **Unknown**                  |
| **Axis `mirror`**                        | render ticks on opposite side                                                                                           | Not verified                                                                                                       | **Unknown**                  |

---

## Missing features in detail

### 1. Vertical layout ✅

Recharts' `layout="vertical"` on `<LineChart>` / `<AreaChart>` swaps axes: categories render
on the Y axis, values on the X axis. This is a distinct chart orientation used for horizontal
line/area charts (e.g., comparing categories side-by-side).

```tsx
// Recharts
<LineChart layout="vertical" data={data}>
  <XAxis type="number" />
  <YAxis dataKey="name" type="category" />
  <Line dataKey="value" />
</LineChart>
```

Peculiar-charts now supports `layout="horizontal"` on `<Line>`, `<Area>`, and `<Point>`.
When set, the category axis becomes Y and the value axis becomes X. The `<Curve>` shape
uses `x0` instead of `y0` for area baselines, and `<DotsLayer>` tracks the Y axis for
hover detection.

```tsx
// Peculiar-charts
<Chart data={data}>
  <Line dataKey="value" layout="horizontal" />
  <Axis axis="x" position="bottom" type="linear" />
  <Axis dataKey="name" axis="y" position="left" type="point" />
</Chart>
```

**Affects:** Vertical Line Chart, Vertical Line Chart With Specified Domain.

---

### 2. Ranged area (`[min, max]` tuples) ✅

Recharts' `<Area>` can render data values as `[low, high]` tuples, filling the region
between two value lines instead of from baseline to a single value.

```tsx
// Recharts — data: [{ temperature: [10, 25] }, { temperature: [15, 30] }]
<Area dataKey="temperature" stroke="#8884d8" fill="#8884d8" />
```

Peculiar-charts now detects `[low, high]` tuple data in `<Area>` automatically. The upper
values become the area path; the lower values become the baseline. The domain covers both
bounds.

```tsx
// Peculiar-charts — same API, automatic tuple detection
<Area dataKey="temp" fill="skyblue" stroke="steelblue" />
```

**Affects:** Ranged Area Chart, Range Area Custom Animation.

---

### 3. Percent stacking (`stackOffset="expand"`) ✅

Recharts normalizes stacked values to 0–100% when `stackOffset="expand"` is set on the
chart. Combined with `tickFormatter={toPercent}` on the Y axis, this produces a
percentage-stacked area chart.

```tsx
// Recharts
<AreaChart stackOffset="expand" data={data}>
  <YAxis tickFormatter={toPercent} />
  <Area stackId="1" dataKey="uv" />
  <Area stackId="1" dataKey="pv" />
</AreaChart>
```

Peculiar-charts now supports `stackOffset="expand"` on `<Chart>`. The stacking logic in
`createPoints` normalizes cumulative values to 0–1 after summation. `createSeries` registers
a fixed `[0, 1]` domain. `createBaseLine` normalizes baselines the same way. Axis tick
formatting for percentages uses `tickFormatter` on `<Axis>`.

```tsx
// Peculiar-charts
<Chart data={data} stackOffset="expand">
  <Area dataKey="uv" stackId="1" />
  <Area dataKey="pv" stackId="1" />
  <Axis axis="y" position="left" type="linear" tickFormatter={(v) => `${Math.round(v * 100)}%`} />
</Chart>
```

**Affects:** Percent Area Chart.

---

### 4. Custom `shape` on Line/Area ✅

Recharts lets you replace the default path rendering with a custom component. The custom
shape receives all the standard props plus animation state:

```tsx
// Recharts
<Line shape={(props) => <CustomShape {...props} />} animationDuration={600} />

// CustomShape receives: points, stroke, animationElapsedTime, isEntrance, isAnimating
```

This enables opacity-fade animations, grow-from-bottom effects, draw-in reveals, and any
other custom rendering logic.

Peculiar-charts now supports a `shape` prop on `<Line>` and `<Area>`. When provided, the
shape function receives the computed pixel-space points, all SVG path props, and animation
state (`animationElapsedTime`, `isAnimating`, `isEntrance`). The default `<Curve>` rendering
is bypassed — the shape function returns the JSX to render instead.

```tsx
// Peculiar-charts
function OpacityFadeShape(props) {
  const { animationElapsedTime, isEntrance, points, ...svgProps } = props
  const opacity = isEntrance ? animationElapsedTime : 1
  return <Curve points={points} stroke-opacity={opacity} {...svgProps} />
}

<Line dataKey="value" shape={OpacityFadeShape} animation={{ duration: 800 }} />
```

For `<Area>`, the shape function also receives `baseLine` (the area baseline in pixel
space — a scalar for unstacked, an array for stacked).

**Affects:** Line that animates opacity, Custom Animation Example, Range Area Custom
Animation, Custom Line Shape Chart.

---

### 5. Custom `animationInterpolateFn`

Recharts allows a custom interpolation function for animation, giving full control over
how geometry transitions between states:

```tsx
// Recharts
<Area
  animationInterpolateFn={(from, to, t) => {
    // custom interpolation logic
    return interpolate(from, to, t);
  }}
/>
```

Peculiar-charts' animation system uses `createTweenedArray` with a fixed `interpolatePoint`
function. There's no hook to override it.

**What's needed:** An `interpolate` option in `AnimationOptions` (or a separate
`animationInterpolate` prop) that accepts a custom interpolation function.

**Affects:** Custom Animation Example.

---

### 6. Animation match strategy (`animationMatchBy`)

When data changes (new points added, removed, or reordered), Recharts controls how old
data maps to new data for the transition:

```tsx
// Recharts
<Line animationDuration={600} animationMatchBy={matchByDataKey('label')} />
// or
<Line animationDuration={600} animationMatchBy={matchByIndex} />
```

Without this, transitions when data length changes may produce incorrect intermediate states.

**What's needed:** An `animationMatchBy` option in `AnimationOptions` that controls the
keying strategy for `createTweenedArray` / `createPresence`.

**Affects:** Animated Time Series (sliding window data).

---

### 7. Chart-level mouse/touch events ✅

Recharts exposes full mouse and touch event handlers on the chart container, each receiving
both the native event and a `MouseHandlerDataParam` (active tooltip index, chart-relative
coordinates, data at the active index):

```tsx
// Recharts
<LineChart
  onMouseDown={(state) => { /* state = { activeTooltipIndex, chartX, chartY, ... } */ }}
  onMouseMove={(state) => { /* track drag */ }}
  onMouseUp={(state) => { /* end drag, compute zoom range */ }}
>
```

Peculiar-charts now uses `PointerEvent` (unified mouse + touch + pen) on the chart SVG
and exposes five chart-level callbacks that fire with a `ChartEventPayload`:

```tsx
// Peculiar-charts
<Chart
  data={data}
  onChartPointerMove={(p) => { /* p.x, p.y, p.index, p.datum, p.series */ }}
  onChartClick={(p) => { /* same payload */ }}
  onChartPointerDown={(p) => { /* ... */ }}
  onChartPointerUp={(p) => { /* ... */ }}
  onChartPointerLeave={(p) => { /* ... */ }}
>
```

`ChartEventPayload` includes: `event` (PointerEvent), `x`/`y` (SVG viewBox coords),
`index` (closest datum), `datum` (data row), `series` (visible series with values).

**Affects:** Highlight And Zoom, Compare Two Lines, Custom Events, Prevent Right Click.

---

### 8. Axis padding ✅

Recharts adds spacing at axis edges to prevent data points from sitting flush against the
chart boundary:

```tsx
// Recharts
<XAxis padding={{ left: 30, right: 30 }} />
```

Peculiar-charts now supports `padding={{ left, right, top, bottom }}` on `<Axis>`. The
padding is applied to the axis scale range in `createScale`.

```tsx
// Peculiar-charts
<Axis dataKey="day" axis="x" position="bottom" padding={{ left: 30, right: 30 }} />
```

**Affects:** Line Chart With X Axis Padding.

---

### 9. Axis tick label layout ✅

Recharts exposes axis-level tick label controls such as `interval={0}`, `minTickGap`,
`angle`, `tickMargin`, `tickSize`, and custom `tick` renderers.

Peculiar-charts keeps these controls on the composable axis children:

```tsx
// Recharts
<XAxis interval={0} angle={-45} minTickGap={8} tickMargin={8} />

// Peculiar-charts
<Axis dataKey="day" axis="x" position="bottom">
  <AxisLabel interval="all" angle={-45} labelGap={8} tickMargin={8} />
  <AxisMark length={6} />
</Axis>
```

For dense categorical labels such as flags/icons, `<AxisLabel>` also supports
`stagger` and exposes both `index` and `visibleIndex` to custom renderers:

```tsx
<AxisLabel interval="all" stagger>
  {(tick) => <image x={tick.x - 8} y={tick.y - 8} href={flagUrl(tick.value)} />}
</AxisLabel>
```

**Affects:** Line Chart Axis Interval, Customized Label Line Chart.

---

### 10. Per-series data ✅

Recharts allows each series to carry its own data array, independent of the chart-level
data:

```tsx
// Recharts
<LineChart>
  <Line data={series1Data} dataKey="value" name="Series A" />
  <Line data={series2Data} dataKey="value" name="Series B" />
</LineChart>
```

Peculiar-charts now accepts a `data` prop on `<Line>`, `<Area>`, `<Point>`, and `<Bar>`.
When provided, the series reads category and value positions from its own data instead of
the chart-level `data`. The category axis tick labels still come from the chart-level data.

```tsx
// Peculiar-charts
<Chart data={chartData}>
  <Line dataKey="coffee" name="Coffee" /> {/* chart-level data */}
  <Line data={weatherData} dataKey="temp" name="Temp" /> {/* per-series data */}
</Chart>
```

**Affects:** Line Chart Has Multi Series.

---

## Recharts examples → features mapping

Each Recharts example and which features it exercises:

### LineChart

| Example              | Key features used                                                                   |
| -------------------- | ----------------------------------------------------------------------------------- |
| Simple Line Chart    | `type="monotone"`, `dot`, `activeDot`, CartesianGrid, Tooltip, Legend               |
| Dashed Line Chart    | `strokeDasharray`                                                                   |
| Vertical Line Chart  | `layout="vertical"`, `XAxis type="number"`, `YAxis type="category"`                 |
| Biaxial Line Chart   | dual `YAxis` with `yAxisId`, `orientation="right"`                                  |
| Vertical + Domain    | `layout="vertical"`, `domain={[0, 'dataMax + 1000']}`                               |
| Connect Nulls        | `connectNulls`                                                                      |
| X Axis Padding       | `XAxis padding={{ left, right }}`                                                   |
| Reference Lines      | `ReferenceLine` with `x` and `y`                                                    |
| Customized Dot       | `dot={CustomDot}` function renderer                                                 |
| Customized Label     | `label={CustomLabel}` function renderer, custom `tick` on XAxis                     |
| Synchronized         | `syncId`, `Brush`                                                                   |
| Opacity Animation    | `shape`, `animationDuration`, `animationElapsedTime`, `isEntrance`                  |
| Highlight & Zoom     | `onMouseDown/Move/Up`, dynamic `domain`, `allowDataOverflow`, `ReferenceArea`       |
| Multi Series         | per-Series `data`, `allowDuplicatedCategory={false}`                                |
| Axis Interval        | `interval`, `minTickGap`, `angle`, `tickMargin`, custom `tick` on XAxis/YAxis       |
| Negative + Reference | `domain={['auto','auto']}`, `allowDataOverflow`, `ReferenceLine y={0}`              |
| Compare Two Lines    | `segment` on ReferenceLine, custom Tooltip `content`, `cursor`, SVG gradient stroke |
| Dynamic Z-Index      | `zIndex` on Line (conditional), `Legend onMouseEnter/onMouseLeave`                  |
| Tiny Line Chart      | minimal chart (no axes/grid/tooltip)                                                |
| Animated Time Series | `animationDuration`, `animationMatchBy`, sliding window data                        |

### AreaChart

| Example              | Key features used                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Simple Area          | `type="monotone"`, `fillOpacity`, SVG gradient fill                                                                   |
| Stacked Area         | `stackId`, `niceTicks="snap125"`                                                                                      |
| Ranged Area          | data as `[min, max]` tuples                                                                                           |
| Connect Nulls        | `connectNulls` (single + stacked variants)                                                                            |
| Cardinal Area        | `type={curveCardinal.tension(0.2)}` (d3 curve function)                                                               |
| Percent Area         | `stackOffset="expand"`, `tickFormatter={toPercent}`, custom Tooltip                                                   |
| Synchronized Area    | `syncId`, `animationBegin`, `animationDuration`, `strokeDasharray`                                                    |
| Tiny Area            | minimal chart                                                                                                         |
| Fill By Value        | `fill="url(#splitColor)"`, `useYAxisScale()` hook, `useChartHeight()` hook                                            |
| Custom Animation     | `shape`, `animationInterpolateFn`, `usePlotArea()`, `interpolate()`                                                   |
| Range Area Animation | `shape`, `animationInterpolateFn`, `baseValue="dataMax"`, generic type param                                          |
| Custom Events        | `onClick`, `onMouseMove`, `onMouseDown/Up`, `onDoubleClick`, `onContextMenu`, touch events, `getRelativeCoordinate()` |
| Prevent Right Click  | `onContextMenu={(_, e) => e.preventDefault()}`                                                                        |

---

## Recharts hooks referenced in examples

| Hook                      | Used in                                | Purpose                                        |
| ------------------------- | -------------------------------------- | ---------------------------------------------- |
| `useYAxisScale()`         | Fill By Value                          | Get Y-axis scale for value-to-pixel mapping    |
| `useChartHeight()`        | Fill By Value                          | Get chart height for gradient calculations     |
| `usePlotArea()`           | Custom Animation, Range Area Animation | Get plot area dimensions for custom animations |
| `useActiveTooltipLabel()` | Dual Line Chart (storybook)            | Get active tooltip label for cross-series sync |

Peculiar-charts equivalents: `useYScale()`, `useChartSize()`, `usePlotArea()`,
`useClosestTick()` — mostly at parity.

---

## Prioritized roadmap

Ordered by impact × effort:

| Priority | Feature                                   | Effort     | Impact                                         |
| -------- | ----------------------------------------- | ---------- | ---------------------------------------------- |
| 1        | ~~Vertical layout~~                       | ~~Medium~~ | ~~Unlocks a whole chart orientation~~          |
| 2        | ~~Per-series `data` prop~~                | ~~Low~~    | ~~Multi-series with independent data sources~~ |
| 3        | ~~Percent stacking (`stackOffset`)~~      | ~~Medium~~ | ~~Unlocks percentage-stacked areas~~           |
| 4        | ~~Custom `shape` on Line/Area~~           | ~~Medium~~ | ~~Unlocks custom rendering + advanced animations~~ |
| 5        | Animation match strategy                  | Medium     | Correct transitions when data changes shape    |
| 6        | Custom `animationInterpolateFn`           | Low-Medium | Full animation control                         |
| 7        | `stackOffset` variants (silhouette, sign) | Medium     | Streamgraph + signed stacking                  |

Vertical layout is the biggest remaining gap — it blocks an entire chart orientation.
Items 2–3 are low-hanging fruit. Items 4–7 round out the surface for full parity.

Completed since this plan was written:

- **Custom `shape` on Line/Area** — `<Line>` and `<Area>` now accept a `shape` prop — a
  function that receives the computed pixel-space points, all SVG path props (stroke, fill,
  curve, etc.), and animation state (`animationElapsedTime` as raw 0→1 progress before
  easing, `isAnimating`, `isEntrance`). For `<Area>`, the shape also receives `baseLine`.
  The default `<Curve>` rendering is bypassed when `shape` is provided. Animation state is
  tracked via a new `onProgress` callback on `createTweenedArray`.
- **Percent stacking (`stackOffset="expand"`)** — `<Chart stackOffset="expand">` normalizes
  stacked values to 0–1. `createPoints` divides cumulative stacked values by the per-category
  total; `createSeries` registers a fixed `[0, 1]` domain; `createBaseLine` normalizes
  baselines the same way. Combine with `tickFormatter` on `<Axis>` for percentage labels.
- **Per-series `data` prop** — `<Line>`, `<Area>`, `<Point>`, and `<Bar>` now accept a `data`
  prop that overrides chart-level `data` for that series only. Both category and value
  extraction use the per-series data; `createPoints` passes the series data to `axisValues`
  for correct category positioning.
- **Vertical layout** — `<Line>`, `<Area>`, and `<Point>` now accept `layout="horizontal"` to
  swap axes: categories render on the Y axis, values on the X axis. The `<Curve>` shape
  switches to `x0` for area baselines; `<DotsLayer>` and `<Point>` track the Y axis for
  hover detection; `<createSeries>` registers the value extent on the correct axis.
- **`tickFormatter` on Axis** — `tickFormatter` is now available on `<Axis>` and is used by
  default `<AxisLabel>` rendering; `<AxisLabel format>` remains available as a local override.
- **ReferenceLine `segment`** — `<ReferenceLine segment={[{ x, y }, { x, y }]}>` now draws
  arbitrary data-space annotation lines; `x` and `y` still draw vertical/horizontal lines.
- **Axis `padding`** — `<Axis padding={{ left, right, top, bottom }}>` now insets the axis
  scale range by the given pixel amounts, preventing data points from sitting flush against
  the chart boundary.
- **Ranged area (`[min, max]` tuples)** — `<Area>` now detects `[low, high]` tuple data
  automatically. The upper values become the area path; the lower values become the
  baseline. The domain covers both bounds.
- **Legend `onMouseEnter`/`onMouseLeave`** — `<Legend>` now accepts hover event callbacks
  that fire with the `SeriesMeta` when the pointer enters or leaves a legend item.
- **Chart-level pointer events** — `<Chart>` now accepts `onChartClick`,
  `onChartPointerMove`, `onChartPointerDown`, `onChartPointerUp`, and
  `onChartPointerLeave`. Each fires with a `ChartEventPayload` containing SVG
  coordinates, closest datum index, the data row, and visible series values. The SVG
  uses `PointerEvent` (unified mouse + touch + pen) internally.

---

## Future work (already tracked in `docs/animation.md`)

These overlap with the Recharts examples but are already documented as future work:

- **Draw-in effects** (stroke-dasharray reveal for Line/Area paths)
- **Path morphing** (smooth shape transitions for dramatically different geometries)
- **Staggered enter** (delay per-datum for cascading reveals)
- **Spring physics** (natural-feeling motion without explicit duration/easing)
- **Color interpolation** (animated fill/stroke transitions)
