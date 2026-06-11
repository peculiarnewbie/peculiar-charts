# Testing Strategy

Research from recharts and ag-charts reference clones, adapted for peculiar-charts.

## Current State

| What | Detail |
|---|---|
| Runner | Vitest 4.x with `happy-dom` |
| Files | 12 test files (1 component, 11 unit) |
| Helpers | `createMockChartContext()` only |
| Coverage | Not configured |
| Snapshots | None |
| Setup file | None |

## What to Borrow

### From Recharts (SVG-based, closest match)

Recharts has 291 test files. Their SVG-first approach maps directly to our architecture.

**SVG assertion helpers.** Per-element helpers that query by CSS class and assert SVG attributes. This is their core testing pattern and the highest-value thing to copy.

```ts
// references/recharts/test/helper/expectBars.ts
export function expectBars(container: Element, expected: Array<{
  d?: string
  x?: string | number
  y?: string | number
  width?: string | number
  height?: string | number
}>) {
  const bars = container.querySelectorAll('.recharts-bar-rectangle')
  expect(bars).toHaveLength(expected.length)
  expected.forEach((exp, i) => {
    const rect = bars[i].querySelector('rect') ?? bars[i].querySelector('path')
    if (exp.d) expect(rect).toHaveAttribute('d', exp.d)
    if (exp.x !== undefined) expect(rect).toHaveAttribute('x', String(exp.x))
    // ...
  })
}
```

Adapt this pattern for our elements: `expectLines()`, `expectBars()`, `expectDots()`, `expectPieSectors()`, etc. Query by our CSS classes or `data-*` attributes.

**`mockGetBoundingClientRect`.** jsdom and happy-dom return zeros for `getBoundingClientRect`. Any chart that sizes from its container needs this mock. Recharts calls it in every test that renders a chart.

```ts
// references/recharts/test/helper/mockGetBoundingClientRect.ts
export function mockGetBoundingClientRect() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, width: 800, height: 600,
    top: 0, right: 800, bottom: 600, left: 0,
    toJSON() {},
  })
}
```

**Console warnings as test failures.** Intercepts `console.warn`/`console.error` and throws, with an ignore-list for known warnings. Catches regressions early.

```ts
// references/recharts/test/helper/consoleWarningToError.ts
export function setupConsoleWarningToError() {
  const originalWarn = console.warn
  const originalError = console.error
  beforeEach(() => {
    console.warn = (...args: unknown[]) => {
      if (isIgnored(args)) return originalWarn(...args)
      throw new Error(`Unexpected console.warn: ${args.join(' ')}`)
    }
    console.error = (...args: unknown[]) => {
      if (isIgnored(args)) return originalError(...args)
      throw new Error(`Unexpected console.error: ${args.join(' ')}`)
    }
  })
  afterEach(() => {
    console.warn = originalWarn
    console.error = originalError
  })
}
```

**Parameterized tests across chart types.** Run shared test cases against Line, Bar, Area, Pie, etc. via `describe.each()`.

```ts
// references/recharts/test/helper/parameterizedTestCases.tsx
const allCartesianChartCases = [
  { name: 'LineChart', ChartComponent: LineChart },
  { name: 'BarChart', ChartComponent: BarChart },
  { name: 'AreaChart', ChartComponent: AreaChart },
]

describe.each(allCartesianChartCases)('$name', ({ ChartComponent }) => {
  it('renders with data', () => { /* ... */ })
})
```

### From AG Charts (Canvas-based, heavier)

AG Charts uses real Canvas rendering via `skia-canvas` in Node.js. This is overkill for our SVG-based library, but some patterns are worth adopting.

**Image snapshot testing.** For visual regression, compare rendered output pixel-by-pixel with `pixelmatch`. Useful as a safety net once chart rendering stabilizes, but lower priority than unit tests.

```ts
// references/ag-charts/libraries/ag-charts-test/src/canvas/to-match-image.ts
// Custom matcher using pixelmatch — 0.01 per-pixel threshold, 0.05% max diff
```

**Animation mock infrastructure.** Replace `requestAnimationFrame` with controllable callbacks for deterministic animation testing.

```ts
// references/ag-charts/packages/ag-charts-community/src/chart/test/utils.ts
export function spyOnAnimationManager() {
  // Replaces AnimationManager scheduling with vi.fn() callbacks
  // Allows tests to advance animations to specific progress (0-1)
}
```

Only worth building if our `createTweened` / `createPresence` animations become complex enough to need it.

**`Caster` class.** Type-safe runtime narrowing of internal chart objects. Avoids `as any` casts in tests while providing runtime safety. Could be useful if we test internal chart state.

```ts
// references/ag-charts/libraries/ag-charts-test/src/caster.ts
// Fluent API: caster.cast(Scale).findProperty('domain').accessProperty('0')
```

## Recommended Implementation Order

### Phase 1 — Foundation (do first)

1. **Create `vitest.setup.ts`** with `mockGetBoundingClientRect`, console warning interceptor, and `happy-dom` cleanup.
2. **Add `@testing-library/jest-dom`** for `.toBeInTheDocument()`, `.toHaveAttribute()`, `.toHaveTextContent()` matchers.
3. **Configure coverage** with `@vitest/coverage-v8`.

### Phase 2 — SVG Assertion Helpers

4. **Create `src/__tests__/helpers/` directory** with per-element assertion helpers:
   - `expectLines(container, expected)` — query `.pc-line-path` elements, assert `d` attribute
   - `expectBars(container, expected)` — query `.pc-bar-rect` elements, assert `x`, `y`, `width`, `height`
   - `expectDots(container, expected)` — query `.pc-dot` elements, assert `cx`, `cy`, `r`
   - `expectPieSectors(container, expected)` — query `.pc-pie-sector` elements, assert `d` path
   - `expectAxisTicks(container, axisId, expected)` — query tick labels, assert text and position
5. **Write a shared test data fixture** (`_data.ts`) with canonical datasets for tests.

### Phase 3 — Component Integration Tests

6. **Parameterized chart rendering tests** — render each chart type with canonical data, assert SVG output.
7. **Interaction tests** — use `@solidjs/testing-library`'s `fireEvent` for click/hover, assert tooltip/active state changes.
8. **Responsive tests** — mock `getBoundingClientRect` with different sizes, assert chart adapts.

### Phase 4 — Visual Regression (optional, later)

9. **Playwright component tests** for screenshot comparison, similar to recharts' `test-vr/` approach.

## Key Differences from Recharts

| Aspect | Recharts | peculiar-charts |
|---|---|---|
| Framework | React | SolidJS |
| DOM env | jsdom | happy-dom |
| Rendering | `@testing-library/react` `render()` | `@solidjs/testing-library` `render()` |
| State | Redux selectors | Solid signals/memos |
| Selector testing | `createSelectorTestCase` with spy | Test signal values directly via `createRoot` |
| Animation | Custom `MockProgressAnimationManager` | `createTweened` — simpler, may not need mocking yet |

## Key Differences from AG Charts

| Aspect | AG Charts | peculiar-charts |
|---|---|---|
| Rendering | Canvas (skia-canvas in Node) | SVG |
| Test infra | Dedicated `ag-charts-test` package | Helpers in `__tests__/helpers/` |
| Image snapshots | Core testing strategy | Nice-to-have, not essential |
| Memory benchmarks | `sizeOf()` deep object analysis | Not needed yet |

## File Layout

```
packages/peculiar-charts/src/__tests__/
  helpers/
    expectLines.ts
    expectBars.ts
    expectDots.ts
    expectPieSectors.ts
    expectAxisTicks.ts
    mockGetBoundingClientRect.ts
    consoleWarningToError.ts
    renderChart.tsx          # Wrapper that sets up context + mocks
  _data.ts                   # Shared test fixtures
  components.test.tsx         # Existing — expand with parameterized cases
  scale.test.ts              # Existing
  ...

vitest.setup.ts              # New — global setup
```
