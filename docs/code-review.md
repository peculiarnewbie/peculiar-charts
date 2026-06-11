# Code Review — Quality TypeScript Principles

## What's already good

**Discriminated unions — excellent use.** `Domain` (`context.ts:33`), `Scale` (`scale.ts:25`), and `PresenceItem` (`animation.ts:332`) are textbook discriminated unions. The `kind: 'categorical' | 'numeric'` and `type: 'linear' | 'log' | ...` tags make invalid states unrepresentable.

**Object params everywhere.** `createSeries`, `createPoints`, `createScale`, `buildScale`, `createTweened`, `createPresence` — all use object arguments. No positional-arg traps.

**`OverrideProps<T, P>` utility** (`types.ts:2`) — clean way to extend SVG element props without losing native attributes. Used consistently across every component's props type.

**Context with runtime guard** (`context.ts:146-153`) — `useChartContext()` throws a clear message instead of returning `undefined`. Impossible to use outside a `<Chart>`.

**`resolveAnimation`** (`animation.ts:60`) — collapses `boolean | object | undefined` into a fully-resolved `ResolvedAnimationOptions`. Downstream code never checks for missing fields.

---

## Issues to address

### 1. `any` is pervasive — 50+ occurrences

The type system is deliberately weakened in the data pipeline:

| Location                 | Issue                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `context.ts:62`          | `data: Accessor<any[]>`                                                                   |
| `hooks.ts:85,94,98`      | `useInverseScale` returns `Accessor<(pixel: number) => any>`                              |
| `hooks.ts:141`           | `useData<T = any>()` — generic defaults to `any`                                          |
| `hooks.ts:154`           | `useAxisValues` returns `Accessor<any[]>`                                                 |
| `scale.ts:44,79,100,129` | `buildScale`, `projectScale`, `invertScale`, `scaleTicks` all use `any` for domain values |
| `utils.ts:6`             | `accessData<T>` casts `unknown` → `T[]` with no runtime check                             |
| `Chart.tsx:378`          | `axisValues(... as any, ...)` — explicit cast to bypass types                             |

This is the single biggest gap against "make impossible states unrepresentable." A `string` passed where a `number` domain is expected will silently produce `NaN` pixel coordinates. Consider:

- Branded types for domain values (`NumericValue`, `CategoryValue`) validated at the `<Chart data={...}>` / `<Axis dataKey={...}>` boundary.
- At minimum, generic the data row type through the context: `ChartContextType<TDataRow>` so `accessData` can narrow.

### 2. No tests at all

Vitest and Playwright are installed but zero test files exist. The `test` script in root `package.json` runs `vitest run` against nothing. For a charting library, the highest-value first tests would be:

- `buildScale` / `projectScale` / `invertScale` — pure functions, easy to test with real d3 scales.
- `createPoints` with stacked/expand modes — the stacking arithmetic in `createPoints.ts:60-81` is complex enough to regress.
- `resolveAnimation` — edge cases around `boolean | object | undefined`.

### 3. `as any` cast in sync path

`Chart.tsx:378`:

```ts
axisValues({ getAxisConfig, displayedData } as any, "x", "x");
```

This constructs a partial `ChartContextType` and bypasses the type system. `axisValues` expects `ChartContextType` but only uses `getAxisConfig` and `displayedData`. Extract an interface for the subset (`Pick<ChartContextType, 'getAxisConfig' | 'displayedData'>`) and overload `axisValues` to accept it.

### 4. `SyncBus` is a global singleton with no cleanup

`sync.ts:55` — `export const syncBus = new SyncBus()` is module-level. In SSR or multi-root Solid apps, this leaks listeners across boundaries. Consider attaching it to a Solid context or accepting it via props.

### 5. `SyncMethod` uses `any[]`

`sync.ts:4`:

```ts
| ((ticks: any[], data: SyncHandlerParam) => number)
```

The `ticks` array should be typed as the domain value type, not `any[]`.

### 6. Mutable `seriesOrder` counter breaks on HMR

`Chart.tsx:170`:

```ts
let seriesOrder = 0;
```

This is a plain `let` inside the component body. On Hot Module Replacement (or re-renders triggered by Solid's reactivity), it resets to 0 but the `series` map still holds old orders, causing color palette mismatches. Use a `createSignal` or derive order from `series().size`.

### 7. No Standard Schema support

Props like `dataKey`, `tickValues`, `data` accept raw values with no validation boundary. For a library, accepting `StandardSchemaV1<unknown, T>` for user-provided data would let consumers plug in Zod/Valibot/Arktype without the library picking a side.

### 8. Branded types could prevent axis ID collisions

Axis IDs are plain strings (`xAxisId?: string`). Two series with `xAxisId="x"` and `xAxisId="X"` would silently get different axes. A branded `AxisId` validated once (lowercased/trimmed) would prevent this class of bug.

### 9. `MouseEvent` → `PointerEvent` unsafe cast

`Chart.tsx:576-577`:

```ts
buildChartEventPayload(event as unknown as PointerEvent);
```

The SVG `onPointerMove` handler receives a `PointerEvent`, but `fireChartPointerMove` is typed `(event: MouseEvent)`. The double-cast masks this. Type the handler param correctly as `PointerEvent` and remove the cast.

### 10. No observability hooks

The library has no OpenTelemetry spans or instrumentation points. For a charting library this is lower priority than for a service, but exposing an optional `onRender` / `onAnimationStart` callback with timing data would let consumers instrument their own OTel spans around chart renders.

---

## Summary

| Principle                         | Status                                                                     |
| --------------------------------- | -------------------------------------------------------------------------- |
| Impossible states unrepresentable | **Good** on scale/domain types; **weak** on data pipeline (`any`)          |
| End-to-end types                  | **Not applicable** (no DB/server); generic data row type is underspecified |
| Object args                       | **Excellent** — consistent across all primitives                           |
| Standard Schema                   | **Not present**                                                            |
| Real tests                        | **None** — biggest gap                                                     |
| OpenTelemetry                     | **Not present**                                                            |

The strongest recommendation: add tests for the pure-function core (`scale.ts`, `utils.ts`, `animation.ts` resolve logic) and tighten the `any` usage in the data pipeline. Those two changes would have the highest impact on maintainability.

---

## Changes made

### 1. Generic data row type (`TData`)

`ChartContextType<TData extends unknown[]>`, `ChartProps<TData>`, `ChartEventPayload<TData>`, `TooltipPayload<TData>`, `ClosestTick<TData>`, `useData<TData>()`, `useClosestTick<TData>()`, `useAxisValues<TData>()` are now all generic over the data array type. Usage:

```tsx
// The data array type flows through the component
<Chart<typeof data> data={data}>
  <AxisTooltip>
    {(p) => {
      // p.series[].value is typed via SeriesMeta
      // p.data is TData[number] (unknown by default — cast in renderer)
    }}
  </AxisTooltip>
</Chart>

// Event payloads carry the datum type
<Chart<typeof data> data={data} onChartClick={(p) => {
  p.datum // TData[number] | undefined — typed!
}} />

// Hooks carry the type
const tick = useClosestTick<typeof data>('x', 'x')
tick()?.datum // TData[number] — typed!
```

### 2. Narrowed internal helper params

`axisValues` now accepts `Pick<ChartContextType, 'getAxisConfig' | 'displayedData'>` instead of the full context. `getBarPadding` accepts `Pick<ChartContextType, 'bars' | 'getInset' | 'width' | 'displayedData' | 'barConfig'>`. Removed the `as any` cast in `Chart.tsx:381`.

### 3. Runtime validation at boundaries

- `accessData` now throws if `data` is not an array.
- `<Chart>` validates `data` is an array in dev mode.
- `<Chart>` accepts an optional `schema` prop (`StandardSchemaV1<TData>`) for runtime validation via any Standard Schema–compatible library (Zod, Valibot, ArkType, etc.).

```tsx
import { z } from 'zod'

const schema = z.array(z.object({ day: z.string(), coffee: z.number() }))

<Chart data={sales} schema={schema}>
  {/* console.warn in dev mode if data doesn't match schema */}
</Chart>
```

### 4. Standard Schema support

`@standard-schema/spec` added as a dependency. `StandardSchemaV1` is re-exported from the library. The `schema` prop on `<Chart>` is typed as `StandardSchemaV1<TData>`, so the schema's inferred output type must match `TData`.
