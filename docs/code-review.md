# Code Quality and Architecture Review

Last reviewed: 2026-07-15

## Remediation progress

Phase 1 was completed on 2026-07-15:

- Finding 3: finite extent calculation is shared by series, Cartesian domains, ranged areas, and
  brush preview domains. Invalid values are ignored, empty series do not register extents, and the
  reducer does not use spread-based minimum/maximum calls.
- Finding 4: automatic zero baselines are limited to linear value axes. Log bounds are validated as
  finite, non-zero, and same-sign; invalid development domains throw a descriptive error, while
  production uses a deterministic same-sign fallback domain.
- Finding 5: top-level, enter, and exit animation delays now subtract delay from elapsed time and
  have before/at/after boundary coverage.
- Finding 6: partial bar configuration is merged property-by-property and all sizes/gaps validate
  finite non-negative pixel or percentage values.
- Finding 8: area points and array baselines remain paired while segmenting gaps and while using
  `connectNulls`, for both vertical and horizontal layouts.
- Finding 9: positive and negative fill paths preserve the resolved ranged or stacked baseline and
  use zero only as their clipping boundary.
- Finding 48: formatting and lint warnings were cleared, including the package manifest formatting
  failure. The documented format, lint, typecheck, test, and library-build commands are clean.

Regression coverage: `extent.test.ts`, `createScale.test.ts`, `animation.test.ts`,
`barConfig.test.ts`, `Curve.test.tsx`, `utils.test.ts`, and `components.test.tsx`.

Phase 2 is in progress. The shared domain/scale foundation was completed on 2026-07-15:

- Finding 1: axes, series, hooks, chart events, and sync now use one pure Cartesian scale resolver,
  including reversal, axis padding, bar padding, zero/log policy, nicening, and range direction.
- Finding 2: `interactionAxisId` explicitly selects the category axis for chart events and sync;
  charts with multiple x axes default to `"x"` unless one is selected, and sync payloads include the
  source axis ID.
- Finding 20: main charts and brush previews now use one pure domain pipeline for categorical
  duplication, finite contributions, explicit/expression ranges, and empty-domain behavior.

Regression coverage: `resolveAxisDomain.test.ts`, `resolveCartesianScale.test.ts`,
`components.test.tsx`, and `sync.test.ts`.

## Executive summary

peculiar-charts has a strong product and API direction: composable Solid components,
self-registering series, headless SVG output, reusable geometry helpers, render props, and public
hooks make it a promising foundation for a first-class SolidJS charting library.

The main constraint is no longer feature breadth. The implementation has accumulated several
competing sources of truth for domains, scales, registries, and interactions. Those inconsistencies
now create correctness bugs in edge cases such as reversed axes, log scales, missing values,
stacked areas with gaps, animation delays, partial bar configuration, multiple axes, and brush
interaction.

Current assessment:

| Dimension                       | Score | Target |
| ------------------------------- | ----: | -----: |
| API concept                     |  8/10 |  10/10 |
| Composability and extensibility |  8/10 |  10/10 |
| Correctness robustness          |  5/10 |  10/10 |
| Accessibility                   |  3/10 |  10/10 |
| Internal architecture           |  5/10 |  10/10 |
| Test and release discipline     |  6/10 |  10/10 |

The recommended order is correctness first, then registry and state architecture, then
accessibility and performance, followed by public API stabilization and release automation.

## What is already strong

- Series are composed as children and register themselves instead of requiring a central series
  union.
- Geometry, scale, stack, marker, tooltip, and animation logic is mostly separated into reusable
  modules.
- Solid cleanup is generally used correctly for registry entries, observers, animation frames, and
  event listeners.
- `Domain`, `Scale`, and animation presence types use useful discriminated unions.
- Object-parameter APIs are used consistently in low-level helpers.
- SVG attributes and render props provide meaningful headless customization.
- The package builds successfully into Solid and compiled ESM outputs.
- The current suite passes 219 unit/component/image tests and 8 Playwright tests.

## Critical and high-severity findings

### 1. Rendering and interaction use different x-scale implementations

Status: resolved 2026-07-15.

Series and axes use `createScale`, including reversal, axis padding, bar padding, domain behavior,
and range normalization (`src/lib/createScale.ts:20`). Chart-level events and cross-chart sync build
a separate simplified scale in `Chart.tsx:385`.

This can make hover, click, tooltip, and sync selection disagree with rendered points on reversed,
padded, bar-combined, or custom-axis charts.

Required change:

- Extract one pure scale resolver used by axes, series, hooks, chart events, and sync.
- Remove direct scale construction from `Chart`.
- Require interaction consumers to identify the axis they use instead of assuming `"x"`.

Acceptance criteria:

- Reversed, padded, numeric/time, and bar-combined axes select the visually nearest datum.
- Unit tests prove rendering and hit-testing use equivalent scale configuration.

### 2. Chart-level events and sync are hardcoded to axis `"x"`

Status: resolved 2026-07-15.

`Chart.tsx:385-398` derives event ticks and scale from the default `"x"` axis, regardless of the
axis IDs bound to rendered series.

Required change:

- Add an explicit interaction axis policy or derive it from the tooltip/crosshair/series binding.
- Include the source axis ID in sync payloads.
- Define behavior for charts with multiple candidate category axes.

### 3. Missing and empty values corrupt inferred domains

Status: resolved 2026-07-15.

`createSeries.ts:48-70` uses `Math.min(...data)` and `Math.max(...data)` without filtering. Empty data
produces `Infinity/-Infinity`; `undefined` and `NaN` can poison the domain. This conflicts with the
gap handling in `createPoints.ts:61-79`.

Required change:

- Introduce a shared finite extent reducer.
- Do not register an extent when a series has no finite values, or use a documented neutral domain.
- Apply the same policy to ranged areas, stacks, Cartesian domains, and brush preview domains.

### 4. Automatic log axes include zero

Status: resolved 2026-07-15.

`createScale.ts:42-55` expands every automatic y-domain to include zero, including log scales. D3
log scales cannot contain zero, so projections become `NaN` and ticks disappear.

Required change:

- Apply zero-baseline expansion only to compatible linear scales.
- Validate that log bounds are finite, non-zero, and have the same sign.
- Define behavior for invalid or mixed-sign log data: error in development and documented fallback
  or omission in production.

### 5. Animation delay is implemented as a fast-forward

Status: resolved 2026-07-15.

`createTweened` initializes its clock with `now - delay` (`animation.ts:223-245`), and
`createPresence` calculates elapsed time with `+ item.delay` (`animation.ts:426-438`). Positive
delays therefore advance animations instead of delaying them.

Required change:

- Use `elapsed = now - startTime - delay`, consistently across all animation primitives.
- Test frames before, at, and after the delay boundary.
- Test top-level, enter, and exit phase delays independently.

### 6. Partial `barConfig` can fail at runtime

Status: resolved 2026-07-15.

`ChartProps` accepts `Partial<BarConfig>`, but `mergeProps` replaces the entire default object in
`Chart.tsx:129-137`. The result is cast back to complete `BarConfig` in `Chart.tsx:709`. Passing only
`barGap`, for example, leaves `bandGap` undefined and can cause `gapToPadding` to call `.slice()` on
undefined.

Required change:

- Resolve `barConfig` with an explicit property-by-property merge.
- Validate finite values and percentage syntax.
- Remove the completeness cast.

### 7. Stack identity is underspecified

Stacks are keyed by `stackId` and then `dataKey` in `Chart.tsx:678-700`. They are not scoped by
layout, category axis, value axis, or unique series identity.

Consequences:

- Reusing a stack ID on different axes combines unrelated series.
- Two stacked series using the same data key collapse into one layer.
- Horizontal and vertical stacks can contaminate one another.

Required change:

- Define stack identity as a structured key containing layout, category axis ID, value axis ID, and
  stack ID.
- Store each series as a distinct entry keyed by series ID; keep `dataKey` as metadata.
- Validate that members of a stack have compatible data lengths and axes.

### 8. Area baselines become misaligned after gaps

Status: resolved 2026-07-15.

`Curve.tsx:52-70` filters or segments point arrays while retaining the original baseline array.
`createPathSegment` then indexes that baseline from zero. Ranged and stacked area segments after a
gap can therefore use baselines belonging to earlier rows. `connectNulls` has the same alignment
problem.

Required change:

- Represent area geometry as indexed tuples containing point and baseline together.
- Segment/filter the tuples, not the point array alone.
- Add ranged and stacked gap tests with gaps near the start, middle, and end.

### 9. Positive and negative area fills discard the real baseline

Status: resolved 2026-07-15.

When `positiveFill` or `negativeFill` is active, `Area.tsx:294-349` renders both paths against zero
instead of the resolved ranged or stacked baseline. This changes geometry rather than only color.

Required change:

- Preserve `resolvedAnimatedBaseLine()` for both colored paths.
- Use zero only as the clipping boundary that chooses the color.

### 10. Presence animations do not have stable item identity

`createPresence` matches source and previous items only by index (`animation.ts:504-565`). Inserted,
removed, or reordered data can morph one datum into another. The public `matchBy` option cannot be
used by Bar, Bubble, Pie, Point, or RadialBar even though those components expose the shared
animation option type.

Required change:

- Add keyed identity to `createPresence`.
- Thread `matchBy` through every series that supports data mutation.
- Give Pie a stable default based on slice ID and warn on duplicate IDs.

### 11. Brush interaction is mouse-only and inaccessible

`Brush.tsx:148-204` uses `mousedown`, `mousemove`, and `mouseup`. The handles and slide have no
focus behavior, keyboard controls, slider semantics, accessible names, or current-value reporting.

Required change:

- Use Pointer Events and pointer capture for mouse, touch, and pen.
- Make handles keyboard-operable with Arrow, Page Up/Down, Home, and End behavior.
- Add suitable ARIA roles, min/max/current values, orientation, and labels.
- Preserve controlled and uncontrolled behavior for all input modes.

### 12. Multiple axis labels overwrite the same inset

Every `AxisLabel` registers its size under the constant key `"axis.label"` in `Label.tsx:117-127`.
Multiple labels on one edge do not accumulate space; cleanup of either can remove the inset used by
the other.

Required change:

- Register each label with a stable owner-specific key.
- Make all inset registrations owner-aware.
- Test two axes on one edge and dynamic mounting/unmounting.

## Medium-severity correctness and API findings

### 13. Uncontrolled brush state does not handle asynchronous data

The full-range end index is initialized only in `onMount` (`Brush.tsx:80-86`). A chart mounted with
an empty array and populated later remains selected at `[0, 0]`.

Track whether the user has changed the uncontrolled range. Expand an untouched range as data
arrives while preserving deliberate user selection.

### 14. Pie and Radar ignore the active brush range

Radar reads `chartContext.data()` (`Radar.tsx:73`), and Pie defaults to `chartContext.data()`
(`Pie.tsx:180`). Other main-chart series read `displayedData()`.

All series should follow one documented brush policy. If a particular series intentionally ignores
the brush, that must be explicit through a prop rather than an implementation accident.

### 15. Per-series data categories do not contribute to the scale domain

`createPoints` can read categories from a series-level data override, but the registered axis domain
still comes from chart-level data. Categories that exist only in per-series data project to `NaN`.

Series-level data must either register categorical domain contributions or be required to use an
explicit independent axis.

### 16. Duplicate pie keys create duplicate IDs

Pie slice IDs are based on the configured color/name key (`Pie.tsx:178-206`). Duplicate values
overwrite legend metadata and share visibility identity.

Require or derive unique slice identity independently from display name and color key.

### 17. Axis registry ownership is lossy

Axis configuration is stored as one `Map<axisId, config>`. Multiple mounted axes sharing an ID use
last-writer-wins, while cleanup of either removes the shared configuration (`Axis.tsx:66-78`).

Use owner-aware registration and either compose compatible duplicate axes or reject ambiguous
configurations with a development error.

### 18. Bar grouping is not scoped by axis or layout

All visible bars contribute to one global set used by `createBands.ts:46-53`. Bars on unrelated
category axes still reserve grouping slots beside one another.

Scope bar groups by layout and category-axis ID, with stack ID forming the grouped slot identity.

### 19. `BarConfig.barSize` and `maxBarSize` are no-ops

Both options are public in `context.ts:33-38` but are never read by Cartesian bar layout.

Implement and test them or remove them before the next stable API release. Silent no-op options are
worse than missing options.

### 20. Brush preview has a second, inconsistent domain engine

Status: resolved 2026-07-15.

`BrushContext.tsx:28-72` duplicates main-chart domain resolution while ignoring or changing explicit
ranges, duplicate-category behavior, and other scale rules.

The preview should use the same pure domain and scale subsystem with only its dimensions and visible
data overridden.

### 21. Closest-tick computations preserve stale results

`createClosestTick.ts:42-76` often returns its previous value when data becomes empty or the pointer
disappears. If no projected value is finite, it can retain or produce an invalid result.

Separate these states explicitly:

- active pointer result
- synchronized result
- configured default result
- no result

Hooks should not expose a row that no longer exists.

### 22. `ReferenceLine` permits impossible prop states

`x`, `y`, and `segment` are optional and can also be supplied together (`ReferenceLine.tsx:7-24`).
With none, the component projects `undefined`; with several, precedence is implicit.

Use a discriminated union requiring exactly one of x, y, or segment.

### 23. Schema validation is one-shot and warning-only

Validation runs during component construction (`Chart.tsx:113-127`), so updated data is not
revalidated. Async schemas are ignored and transformed output is discarded.

Clarify whether `schema` is advisory development diagnostics or a real validation boundary. If it
remains advisory, rename/document it accordingly. If it is a boundary, make validation reactive and
define async and transformed-output behavior.

### 24. Sync state can survive a `syncId` change

The listener is cleaned up, but `syncInteraction` is not cleared when the ID changes or becomes
undefined. Reset remote interaction state during sync effect cleanup.

### 25. `data-active` handling is inconsistent

Point writes a raw boolean (`Point.tsx:199-213`), while Dot and Bubble use `dataIf`. Normalize data
attribute semantics so `[data-active]` never matches inactive marks.

### 26. Label collision behavior has edge cases

- Numeric interval handling uses `i % interval === 0`; if Recharts parity is intended, interval 1
  should normally skip one tick rather than render every tick.
- `preserveStartEnd` assumes a first tick exists (`createLabelTicks.ts:64-87`).
- Collision estimates use average character width and do not account for rotation or custom render
  output.

Document whether collision handling is heuristic or exact and test empty ticks, rotated labels,
long mixed-width text, and numeric interval semantics.

## Performance and scalability findings

### 27. Bubble rendering performs an O(n²) lookup

Each rendered bubble filters the entire animated list and calls `indexOf` in
`Bubble.tsx:207-214`. Carry the source index in the animated item, as Point already does.

### 28. Pointer movement repeats full-data scans

Point, Bubble, Dots, Tooltip, and Crosshair can each create an independent closest-tick scan. With
multiple series, one pointer event performs several O(n) traversals.

Resolve and cache active indices once per interaction axis, then expose them through focused hooks.

### 29. Spread-based extents do not scale

Repeated `Math.min(...values)` and `Math.max(...values)` calls allocate arguments and can throw a
`RangeError` for large datasets. Replace them with the shared linear finite extent reducer.

### 30. Iterator Helpers leak into the browser baseline

`createBands.ts:40-42` and `utils.ts:87` rely on iterator `.map().toArray()`. The package targets
`esnext`, so this is not transpiled for browsers without Iterator Helpers.

Use `Array.from` or document and enforce the supported runtime baseline.

### 31. Label measurement caching provides little reuse

The cache key includes a unique label component ID (`Label.tsx:129-136`), which prevents equivalent
labels across mounts from sharing measurements while the global cache continues to grow.

Key by font/measurement-relevant properties and use a bounded cache.

## Accessibility findings

### 32. Clickable marks are not keyboard-operable

Bars, dots, bubbles, pie slices, and radial bars attach mouse callbacks without focus, keyboard
activation, roles, or accessible names.

Provide a consistent opt-in interactive-mark contract that supports:

- `tabIndex`
- Enter and Space activation
- focus/blur datum callbacks
- accessible label renderers
- `aria-current` or `aria-selected` where appropriate

### 33. Hidden tooltips remain in the accessibility tree

Axis and polar tooltips are hidden using opacity alone (`Tooltip.tsx:126-148`,
`PolarTooltip.tsx:111-133`). Apply `aria-hidden` when inactive and document an optional live-region
strategy for keyboard interaction.

### 34. The chart has no documented accessible naming pattern

SVG prop passthrough allows consumers to add accessibility, but the library should document and test
`role="img"`, accessible names, `<title>`, `<desc>`, and a tabular-data fallback pattern.

### 35. Reduced-motion changes are not observed reactively during an animation

Animation effects read the reduced-motion accessor through `untrack`. A preference change does not
itself rerun the effect. Decide whether an in-flight animation should stop immediately and implement
that policy consistently.

## Type safety and public API findings

### 36. Generic context typing is caller-asserted

The actual Solid context stores `ChartContextType<any>`, while `useChartContext<T>()` allows callers
to select any `T` (`context.ts:142-152`). Data type information is not genuinely transmitted from
the ancestor Chart.

Avoid advertising this as a fully end-to-end generic guarantee. Prefer focused typed render props or
a typed chart factory if true context propagation is required.

### 37. Domain values remain pervasive `any`

Axis ticks, categorical domains, inverse scales, references, labels, and sync callbacks use `any`.
Introduce a shared `DomainValue = string | number | Date` and use `unknown` where consumers must
narrow.

### 38. Exported low-level primitives depend on the whole internal context

`createSeries`, `createPoints`, and `createScale` are public but accept `ChartContextType`, coupling
extensions to the complete internal service locator.

Expose smaller capability interfaces such as `ScaleContext`, `SeriesRegistry`, and
`InteractionState`, or offer higher-level extension hooks.

### 39. The root entry point has mixed stability levels

The root exports high-level components, internal registration primitives, animation engines, scale
constructors, hooks, tooltip builders, and context access.

Define API stability tiers and consider subpaths:

- `peculiar-charts` for stable components and common hooks
- `peculiar-charts/primitives` for shapes and geometry
- `peculiar-charts/animation` for animation APIs
- `peculiar-charts/core` or `internal` for advanced extension contracts

## Architecture findings

### 40. `Chart.tsx` is a god component

At 777 lines, Chart owns sizing, layout, insets, axis configuration, extents, stacks, bars, series
metadata, visibility, brush state, sync, pointer events, schema validation, palette ordering, and SVG
rendering.

Split it into internal controllers:

1. `createLayoutController` — dimensions, plot rectangle, insets, coordinate conversion
2. `createAxisController` — axis ownership, domain contributions, scale resolution
3. `createSeriesController` — series metadata, visibility, palette identity
4. `createStackController` — scoped stack membership and extents
5. `createInteractionController` — pointer, active index, tooltip/crosshair state
6. `createSyncController` — transport and synchronized interaction state
7. `createBrushController` — controlled/uncontrolled selection state

Chart should compose these controllers and render the wrapper/SVG rather than implement their rules.

### 41. `ChartContext` is a service locator

`context.ts:70-140` exposes nearly every subsystem. Split internal contexts by responsibility and
keep focused public hooks as the compatibility boundary. Custom consumers should rarely need the raw
aggregate context.

### 42. Collection ownership and mutation are inconsistent

Some registry operations clone before mutation, while stack registration mutates nested maps and
sets before cloning only the outer map (`Chart.tsx:678-700`). Establish one immutable-update policy
or encapsulate all mutation inside controller-owned stores.

### 43. Hidden-series state is not cleaned up on unregistration

Removing series metadata does not remove the ID from `hiddenSeries`. Dynamic mount/toggle/unmount
cycles can accumulate unreachable IDs. Series-controller cleanup should remove every piece of state
owned by that series.

### 44. Domain behavior is distributed across too many implementations

Main Cartesian domains, brush domains, polar angle domains, polar radius domains, and chart event
scales apply overlapping but different rules.

Create one pure domain pipeline:

```text
data/series contributions
  -> validated finite/categorical contributions
  -> stack-aware aggregation
  -> user-domain resolution
  -> scale-specific validation
  -> nice-domain policy
  -> pixel range resolution
  -> final scale
```

Polar and Cartesian scales should share domain aggregation and validation while differing only in
their pixel/radian range adapters.

## Tests, delivery, and documentation

### 45. Tests emphasize happy paths

Add regression coverage for:

- empty, missing, invalid, and asynchronously loaded data
- automatic positive and negative log scales
- reversed and padded interaction hit-testing
- custom axis IDs in chart events and sync
- animation delay, interruption, insertion, removal, and reordering
- stacked and ranged areas with gaps
- partial bar configuration and all public bar options
- duplicate stack IDs/data keys across different axes and layouts
- multiple axes and labels on one edge
- per-series categories differing from chart data
- brush behavior for every series type
- touch, pen, and keyboard brush input
- duplicate pie identities
- large datasets and pointer-move budgets
- SSR rendering and hydration
- accessibility roles, names, focus, keyboard activation, and hidden overlays

### 46. Coverage is configured but unenforced

Add a `test:coverage` script and meaningful thresholds. Start from the measured baseline, then raise
thresholds as critical paths gain tests. Require branch coverage for domain, stack, animation, and
interaction state machines rather than relying only on aggregate line coverage.

### 47. CI is absent

Every pull request should run:

1. install with frozen lockfile
2. formatting check
3. lint with warnings treated according to policy
4. typecheck
5. unit/component/image tests
6. coverage thresholds
7. library and documentation builds
8. package dry-run and export smoke tests
9. Playwright interaction/accessibility tests

### 48. Current repository checks are not clean

Status: resolved 2026-07-15.

- Typecheck passes.
- Library build passes.
- 219 Vitest tests pass.
- 8 Playwright tests pass.
- Lint passes without warnings.
- Format check passes.

The main branch should remain green under every documented command.

### 49. Architecture documentation has drifted

The previous version of this document claimed no tests existed. `docs/extensibility.md` still says
cross-chart sync is missing in places despite its implementation.

Treat capability and architecture documents as maintained artifacts:

- Link claims to tests or public demos.
- Add a reviewed date.
- Update roadmap status in the same change that ships a feature.
- Prefer concise architecture decision records for lasting design choices.

## Target architecture

The 10/10 target is not a large framework. It is a small set of independently testable controllers
with one-way data flow and one source of truth per concern.

```text
Chart
  |
  +-- Layout controller
  |     dimensions, insets, plot rectangle, coordinate conversion
  |
  +-- Axis/domain controller
  |     contributions -> domain -> validated scale
  |
  +-- Series controller
  |     identity, palette, visibility, metadata
  |
  +-- Stack/bar controller
  |     axis-scoped grouping, stacking, extents
  |
  +-- Interaction controller
  |     pointer -> active axis/index -> tooltip/crosshair/events
  |
  +-- Sync adapter
  |     serializes/deserializes interaction state
  |
  +-- Brush controller
        controlled/uncontrolled range and accessible input behavior
```

Design rules:

- Domain and scale resolution is pure and shared.
- Registrations have explicit owner IDs and cleanup semantics.
- Registry keys encode every dimension required for isolation.
- Derived state is computed, not mirrored into multiple mutable stores.
- Public hooks depend on narrow capability interfaces.
- Data identity is stable and explicit for animation and interaction.
- Accessibility is part of component behavior, not a later styling pass.
- Every public option is implemented, tested, and documented.

## Phased remediation roadmap

### Phase 1 — correctness baseline

- Centralize finite extent calculation.
- Fix automatic log domains.
- Fix animation delay semantics.
- Deep-merge and validate bar configuration.
- Fix area baseline alignment across gaps.
- Preserve stacked/ranged baselines for positive/negative fills.
- Add regression tests for every fix.

Exit criteria:

- No known high-severity geometry or animation defects.
- All invalid domains are handled deterministically.
- All checks pass locally and in CI.

### Phase 2 — domain, scale, and registry architecture

- Extract shared domain and scale resolvers.
- Make axis, inset, stack, bar, and series registrations owner-aware.
- Scope stack and bar identities correctly.
- Remove duplicated BrushContext domain logic.
- Move controllers out of Chart.

Exit criteria:

- One source of truth for each domain and scale.
- `Chart.tsx` primarily composes controllers and renders structure.
- Multiple axes/layouts/stacks cannot contaminate one another.

### Phase 3 — interaction and animation identity

- Centralize active index per axis.
- Make chart events and sync axis-aware.
- Add keyed presence animation.
- Clear stale interaction and sync state deterministically.
- Remove Bubble O(n²) indexing.

Exit criteria:

- One nearest-datum scan per active axis and pointer update.
- Reordering data never morphs unrelated identities.
- Custom/reversed/padded axes behave identically across rendering and interaction.

### Phase 4 — accessibility

- Rebuild Brush on Pointer Events with keyboard and ARIA support.
- Add keyboard-operable interactive marks.
- Define accessible tooltip behavior.
- Document SVG naming and data-table fallback patterns.
- Add automated accessibility tests and manual screen-reader test notes.

Exit criteria:

- Every built-in interactive component works with mouse, touch, keyboard, and assistive technology.
- Accessibility behavior is documented as part of the public API.

### Phase 5 — public API and performance hardening

- Replace public `any` with domain value types or `unknown`.
- Separate stable and advanced API subpaths.
- Resolve generic context claims.
- Implement or remove every no-op option.
- Establish large-data performance budgets.
- Replace unsupported Iterator Helpers or document the runtime baseline.

Exit criteria:

- Public APIs have an explicit stability policy.
- No documented option is silently ignored.
- Representative large charts meet interaction and render budgets.

### Phase 6 — release discipline and documentation

- Enforce CI, coverage, formatting, lint, typecheck, build, pack, and E2E checks.
- Add export/consumer smoke tests against the packed tarball.
- Refresh feature parity and extensibility documents.
- Add decision records for domain policy, registry identity, sync, and accessibility.

Exit criteria:

- Main is always releasable.
- Documentation and demos reflect the shipped implementation.
- Package consumers are tested against the same artifacts that are published.

## Definition of 10/10

The library reaches the target when:

- Correctness: all supported scale, series, stack, layout, gap, animation, and interaction
  combinations have deterministic behavior and adversarial tests.
- Architecture: each concern has one source of truth, focused ownership, and isolated tests.
- Accessibility: all interactive components work across pointer, touch, keyboard, and assistive
  technology.
- Performance: interaction work is bounded and measured; large datasets do not trigger quadratic
  work or argument-limit failures.
- API quality: invalid states are rejected or unrepresentable; public options are implemented and
  typed; advanced internals have explicit stability boundaries.
- Delivery: CI validates the packed consumer artifact, not only source imports.
- Documentation: behavior, limitations, browser support, accessibility, and architecture remain
  synchronized with the implementation.

This document should be updated as findings are resolved. Each remediation should add or reference
the regression test that prevents the issue from returning.
