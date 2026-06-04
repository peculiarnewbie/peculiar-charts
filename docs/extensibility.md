# Extensibility: peculiar-charts vs Recharts

A code-grounded comparison of how far each library can be customized **without forking**,
and a prioritized roadmap for closing the gap.

> **TL;DR** — peculiar-charts' *internal* architecture is arguably more extensible than
> Recharts (adding a whole new series type is one self-contained file; Recharts can't do
> it at all without editing core state). But our *published* surface exposes much less of
> that power. Recharts still wins on breadth of what a **consumer** can reach: ~25 hooks,
> a pile of shape primitives, richer render-props, per-datum events, and cross-chart sync.
> **We have now closed the biggest gap** — roadmap items 1–4, 6, and 7 below are done, and item 3
> render-prop followups are complete (`dot`/`activeDot`, axis ticks, bar `shape`, tooltip/legend
> `content`, `SeriesLabel labelLine`). **Polar/radar** is shipped (`docs/polar.md`), including
> polar tooltip/crosshair. Remaining gaps: more shape primitives and cross-chart `syncId` sync.

---

## Scope

"Extensibility" here means everything a user can do from *outside* the package:

1. Styling and raw-SVG control
2. Composing charts from children
3. Authoring brand-new series types
4. Custom rendering via render-props (dots, ticks, labels, tooltips, shapes)
5. Reading internal chart state (scales, plot rect, offsets) from custom components
6. Events and interaction hooks (per-item callbacks, cross-chart sync)
7. The exported public API surface (components, hooks, utils, primitives)

References below cite real files in this repo:
- Ours: `packages/peculiar-charts/src/`
- Upstream clones (read-only, see `docs/references.md`): `references/recharts/src/`,
  `references/solid-charts/packages/solid-charts/src/`

---

## Scorecard

| Dimension | peculiar-charts | Recharts | Verdict |
|---|---|---|---|
| Styling / SVG passthrough | Fully headless: `data-pc-*` attrs + `{...otherProps}` spread + Tailwind `class`; `OverrideProps<T,P>` | Ships styled (`recharts-*` classes + default palette); `className` + SVG props spread | **peculiar-charts** — truly unstyled, no defaults to fight |
| Composability model | Children + self-registration into a Solid context registry | Children + self-registration into Redux | **Tie** — same shape, ours is lighter-weight |
| Adding a new series type | Trivial **in-tree**: one self-contained file, no core edits | **Closed**: series are a Redux discriminated union; a new type needs a core fork | **peculiar-charts** (architecturally) — but neither exposes this to consumers |
| Render-props | Function children on several components **+ `dot`/`activeDot` on Line/Area** (bool \| props-object \| function) **+ `<AxisLabel>` / `<AxisMark>` tick render-props** **+ `<Bar shape>`, `<SeriesLabel labelLine>`, tooltip/legend `content`** | `shape`/`dot`/`activeDot`/`content`/`label`/`tick`/`labelLine`, each accepting element \| function \| props-object \| bool | **Tie** — core render-prop surfaces now match; Recharts still accepts ready-made elements |
| Custom child reading internal state | **Now exported** — `useChartContext`, `useScale`/`useXScale`/`useYScale`, `useInverseScale`/`useInverseXScale`/`useInverseYScale`, `useDomain`, `usePlotArea`, `useChartSize`, `useData`, `useAxisValues`, `usePointerPosition`, `useSvgPointerPosition`, `usePointerInChart`, `useClosestTick` + `projectScale`/`invertScale`/`buildScale` | ~25 public hooks including inverse scales and active-tooltip hooks | **Tie** on the core interaction pattern — inverse scales and closest-tick hooks now match; Recharts still has more layout/tooltip variants |
| Per-item events / interaction | **`onPointClick`/`onPointEnter`/`onPointLeave(datum, event)` on Line/Area/Bar/Point/Bubble**, carrying the datum; raw SVG events still ride `{...otherProps}`; no `syncId` yet | `onClick/onMouseEnter(data, index)` per series; `syncId` cross-chart sync; active-tooltip hooks | **Tie** on per-datum events; Recharts still ahead on `syncId` |
| Shape primitives exported | `Curve` + `/curves`, **`Dot`**, **`Rectangle`**, **`Sector`**, **`PolarPolygon`** | `Curve`, `Rectangle`, `Sector`, `Dot`, `Cross`, `Symbols`, `Surface`, `Layer` | **Recharts** — still more primitives (`Cross`, `Symbols`, …) |
| Polar / radar | **`PolarLayout`**, angle/radius axes, grid, **`Radar`**, **`PolarTooltip`**, **`PolarCrosshair`**, `usePolarClosestTick`, `createPolarPoints` — see `docs/polar.md` | `RadarChart`, `RadialBarChart`, polar tooltip/crosshair | **Tie** on radar + polar interaction; Recharts ahead on radial bar |

---

## The core insight

What makes Recharts feel extensible to a *user* is one pattern:

> **Drop any custom component as a child of the chart, and pull scales / offset / plot area
> out of context via a hook.**

That single mechanism powers custom annotations, overlays, and bespoke interactions without
touching the library. Example from Recharts:

```tsx
function CustomAnnotation() {
  const xScale = useXAxisScale()
  const yScale = useYAxisScale()
  if (!xScale || !yScale) return null
  return <circle cx={xScale('Page A')} cy={yScale(1500)} r={5} fill="red" />
}

<LineChart data={data}>
  <XAxis dataKey="name" />
  <YAxis />
  <Line dataKey="value" />
  <CustomAnnotation />   {/* renders freely, no registration needed */}
</LineChart>
```

We have the *exact same machinery* — a context holding scales, the plot rect, domains, and a
series registry. **As of the hooks release we now export the door to it**: `useChartContext`
plus focused hooks (`useScale`/`useXScale`/`useYScale`, `useDomain`, `usePlotArea`,
`useChartSize`, `useData`, `useAxisValues`) and the scale/projection primitives (`createScale`,
`projectScale`, `buildScale`, `scaleTicks`). See the **Custom overlay (hooks)** playground demo,
which draws its own peak/trough markers from a plain child with no registration. The example
below now works verbatim against our API (swap `useXAxisScale`→`useXScale`,
`xScale('Page A')`→`projectScale(xScale(), 'Page A')`).

So the situation is mirror-imaged:

- **Recharts** is *closed* for new **series types** (the type set is a Redux union:
  `AreaSettings | BarSettings | LineSettings | ScatterSettings`, see
  `references/recharts/src/state/graphicalItemsSlice.ts`) but *wide open* for custom **children/overlays**.
- **peculiar-charts** is *open* to add **series in-tree** (Bubble was added in a single file —
  `packages/peculiar-charts/src/series/Bubble.tsx` — with no core edits) and now *open* to
  **consumers** too — `createSeries`/`createPoints`/`createScale` are exported (roadmap item 2).

The upshot: our **maintainer-facing** extensibility is genuinely better; our
**consumer-facing** surface is what lags.

---

## How each mechanism actually works

### Styling — we win

peculiar-charts is headless by construction. Every component:
- emits a `data-pc-*` attribute (e.g. `data-pc-line`, `data-pc-bubble`, `data-pc-point-group`),
- spreads `{...otherProps}` onto the underlying SVG element after defaults, so arbitrary SVG
  attributes pass straight through,
- accepts a Tailwind `class` (demos color series with `class="text-violet-500"` + `currentColor`).

The `OverrideProps<Base, Extra>` type lets a component take all the SVG props of its root
element *plus* its own, with the extras winning. There are no shipped colors or class names to
override. Recharts, by contrast, ships `recharts-*` classes and a default palette you often
have to neutralize.

### Composability — tie

Both use "children + self-registration":
- **Ours**: a series calls `createSeries(...)` (identity + stack + y-extent),
  `createScale(...)`, and `createPoints(...)`, all writing into the chart context registry.
  See `packages/peculiar-charts/src/lib/createSeries.ts`.
- **Recharts**: graphical items render `SetCartesianGraphicalItem` / `SetPolarGraphicalItem`
  which dispatch Redux actions on mount/unmount. See `references/recharts/src/state/SetGraphicalItem.ts`.

Same architecture; ours is lighter (fine-grained signals vs a Redux store).

### New series types — we win in-tree, neither exposes it

Adding `Bubble` to peculiar-charts touched only:
- `src/series/Bubble.tsx` (the component, reusing `createPoints` + `createSeries`),
- `src/index.ts` (exports),
- a demo + the dataset.

No changes to `Chart`, the context, the scale layer, or any registry. Recharts cannot add a
series type without editing the discriminated union baked into its Redux slices and selectors.

**Caveat:** `createSeries`/`createPoints`/`createScale` still take the `chartContext` returned by
`useChartContext()` as a param — a future ergonomics pass could make them grab context implicitly.

### Render-props — closing the gap

We expose function children on `Point`, `Bubble`, `AxisLabel`, `AxisMark`, `SeriesLabel`, and
`AxisTooltip`. They receive a typed datum or tick (e.g. `PointDatum`, `BubbleDatum`,
`LabelTick`, `MarkTick`).

**As of the markers release, `Line` and `Area` accept `dot` and `activeDot`**, each a
`DotRenderer` = **bool | props-object | function** — normalized through one `Dot` helper
(`src/lib/markers.tsx`), the analogue of Recharts' `Shape`. `dot={{ r: 3, stroke: 'white' }}`
merges a partial-props object onto the default `<circle>`; `activeDot={(d) => …}` takes over the
hover marker entirely. The `activeDot` overlay is rendered `pointer-events: none` so it never
steals hover or swallows a click meant for the dot beneath it. See the **Dots + per-datum
events** demo. `Dot` is also exported as a standalone shape primitive.

Remaining gaps vs Recharts: fewer *surfaces* (no `shape`/`content`/`labelLine`/`tick` renderer
props yet), and the ready-`element` form is intentionally unsupported — Solid elements aren't
`cloneElement`-able, so the props-object form covers that case instead.

### Reading internal state from a custom child — now exported

Recharts exports ~25 hooks from `references/recharts/src/hooks.ts`, including inverse scales,
layout helpers, and active-tooltip hooks. We now export the core interaction surface:
`useScale` / `useInverseScale`, pointer hooks, and `useClosestTick`. See the
**Inverse scale (hooks)** and **Custom overlay (hooks)** demos.

The context lives at `packages/peculiar-charts/src/components/context.ts` and is
reachable via `useChartContext()` and the focused hooks in `src/hooks.ts`.

### Events & interaction — per-datum events now match; `syncId` still pending

- **Ours**: `Line`, `Area`, `Bar`, `Point` and `Bubble` now accept `onPointClick`,
  `onPointEnter` and `onPointLeave`, each called with `(datum: PointEventDatum, event)` where the
  datum carries `{ value, index, point }` — not just the raw DOM event. Built from one
  `pointEvents` helper (`src/lib/markers.tsx`); for Line/Area the handlers attach to the dots, so
  enable `dot`/`activeDot` to make a line interactive. Raw SVG handlers still ride
  `{...otherProps}` onto the underlying element. No cross-chart sync yet.
- **Recharts**: per-series `onClick/onMouseEnter(data, index)`; `syncId` synchronizes tooltip
  and brush across charts via an event bus
  (`references/recharts/src/synchronisation/useChartSynchronisation.tsx`), with `syncMethod`
  `'index' | 'value' | fn`.

### Public API surface

- **Ours** (`packages/peculiar-charts/src/index.ts`): chart + series + axis + reference +
  legend components, their prop/datum types, `Curve` + a `/curves` subpath, **plus a hooks
  layer** (`useChartContext`, `useScale`/`useXScale`/`useYScale`, `useDomain`, `usePlotArea`,
  `useChartSize`, `useData`, `useAxisValues`), the **series primitives** (`createScale`,
  `createSeries`, `createPoints`), and **scale/data utilities** (`projectScale`, `buildScale`,
  `scaleTicks`, `isCategorical`, `isNumeric`, `accessData`, `axisValues`, `toNumeric`), the
  `dot`/`activeDot` render-prop types (`DotRenderer`, `DotDatum`, `DotProps`) + the `Dot` shape
  primitive, per-datum event types (`PointEvents`, `PointEventDatum`, `PointEventHandler`),
  **inverse scale** (`invertScale`) + **pointer/closest-tick hooks** (`useInverseScale`,
  `useInverseXScale`, `useInverseYScale`, `usePointerPosition`, `useSvgPointerPosition`,
  `usePointerInChart`, `useClosestTick`), **animation primitives** (`createTweened`,
  `createTweenedArray`, `createPresence`, …), and axis tick types (`MarkTick`). Shape primitives
  are `Curve` + `Dot` + `Rectangle` + `Sector`.
- **Recharts** (`references/recharts/src/index.ts`): 13 chart components, 8 series, 5 axes, annotations,
  layout components, shape primitives (`Curve`, `Rectangle`, `Sector`, `Dot`, `Cross`,
  `Symbols`), containers (`Surface`, `Layer`, `ResponsiveContainer`), ~25 hooks, and utilities
  (`getNiceTickValues`, `getRelativeCoordinate`, chart factory functions).

---

## Roadmap to close the gap

Ordered by leverage-to-effort.

### 1. Export the chart context / scale primitives — *highest leverage* ✅ DONE
Exposed `useChartContext` **plus** focused hooks: `useScale(axisId, orientation)`,
`useXScale`/`useYScale`, `useDomain`, `usePlotArea()`, `useChartSize()`, `useData()`,
`useAxisValues()` — and the scale primitives `projectScale` / `buildScale` / `scaleTicks` /
`isCategorical` / `isNumeric`. See `src/hooks.ts` and the **Custom overlay (hooks)** demo.

- **Outcome**: unlocked the #1 Recharts pattern — custom children that read scales to draw
  annotations, overlays, and bespoke interactions. Verified end-to-end (typecheck + screenshot
  harness, 0 NaN geometry).
- **Followups now done**: inverse (pixel→data) scales via `invertScale` / `useInverseScale`, pointer + closest-tick hooks (`usePointerPosition`, `useSvgPointerPosition`, `usePointerInChart`, `useClosestTick`). See the **Inverse scale (hooks)** demo.

### 2. Export the series primitives ✅ DONE
Exposed `createSeries`, `createPoints`, `createScale` (and the `accessData` / `axisValues` /
`toNumeric` data utilities) so a consumer can author a real series that registers extents /
legend membership / stacking — matching what we do in-tree. With (1)+(2) a user can now write
their own `Bubble` without forking.

- **Note**: these still take the `chartContext` returned by `useChartContext()` as a param, the
  same shape we use in-tree. A future ergonomics pass could make them grab context implicitly.

### 3. Broaden render-props + add `dot`/`activeDot` to Line/Area ✅ DONE
Added `dot`/`activeDot` on `Line`/`Area`, each a `DotRenderer` = **bool | props-object |
function**, normalized through one `Dot` helper (`src/lib/markers.tsx`) — the analogue of
Recharts' `Shape`. `Dot` is exported as a shape primitive. Custom markers no longer require a
separate `<Point>`. The ready-`element` form is intentionally skipped (Solid elements aren't
cloneable; the props-object form covers it). Verified via the **Dots + per-datum events** demo
(screenshot harness counts `data-pc-dot`; a Playwright probe confirms the function `activeDot`
appears on hover).

Followups also done: `<AxisMark>` tick render-prop; `<Bar shape>`; `<AxisTooltip content>` +
`TooltipContent`; `<Legend content>` + `LegendItemContent`; `<SeriesLabel labelLine>` + exported
`LabelLine` primitive (`src/lib/labels.tsx`). Shared overlay helpers live in `src/lib/content.ts`.

### 4. Per-datum events ✅ DONE
Added `onPointClick` / `onPointEnter` / `onPointLeave(datum, event)` to `Line`, `Area`, `Bar`,
`Point` and `Bubble`, carrying `PointEventDatum` (`{ value, index, point }`) instead of just the
DOM event. One shared `pointEvents` helper builds the handlers; on Line/Area they ride the dots
(the `activeDot` overlay is `pointer-events: none` so it can't swallow a dot click — caught and
fixed during verification). Confirmed end-to-end with a Playwright click probe.

- **Effort spent**: low-medium, shared with item 3 (same `markers.tsx` module).

### 5. `syncId`-style cross-chart sync
Synchronize tooltip/crosshair (and later brush) across charts sharing a `syncId`.

- **Effort**: high; overlaps with the deferred interaction tier (brush/zoom/realtime). Best done
  as part of that effort.

### 6. Animation support ✅ DONE
Shipped Solid-native geometry tweening: `createTweened` / `createTweenedArray` / `createPresence`
primitives, an `animation` prop on every series, reduced-motion handling, enter/update/exit with
per-phase config and cubic-bezier easing. See `docs/animation.md` and the **Animation** demo
group.

- **Followups not yet done**: spring physics, draw-in paths, path morphing, global chart-level
  animation config, color interpolation, staggered enter (listed in `docs/animation.md`).

### 7. Inverse scales + pointer hooks + axis tick render-prop ✅ DONE
Exposed `invertScale` (pixel→data companion to `projectScale`) and `useInverseScale` /
`useInverseXScale` / `useInverseYScale`. Added pointer/closest-tick hooks
(`usePointerPosition`, `useSvgPointerPosition`, `usePointerInChart`, `useClosestTick`) so custom
overlays can read hover state without forking tooltip internals. `<AxisMark>` accepts a `children`
render-prop for custom tick marks (see **Custom tick marks** demo).

- **Effort**: low-medium; reuses existing scale + `createClosestTick` machinery.

---

## Summary

| | peculiar-charts | Recharts |
|---|---|---|
| Maintainer-facing extensibility (add series, swap internals) | **Stronger** | Weaker (closed series union) |
| Consumer-facing extensibility (no fork) | **Near parity** (hooks, render-props, custom series; polar shipped) | Stronger on `syncId`, polar tooltip, element render-props |
| Headless styling | **Stronger** | Weaker (ships styles) |
| Published hooks / primitives | 12+ focused hooks + scale/series/data/animation primitives | ~25 hooks + shape primitives |

Items **1 and 2** are done. Next high-leverage gaps: **`syncId`** (item 5), polar
tooltip/crosshair, and remaining shape primitives. See `docs/polar.md` for the polar API.
