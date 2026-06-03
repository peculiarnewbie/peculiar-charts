# Solid JS Patterns

These are the Solid-specific rules we follow in this codebase.

## Core Model

Solid components run once. State changes update the reactive graph, not the component function.

- Put setup in the component body.
- Put reactive reads in JSX, `createMemo`, or `createEffect`.
- Do not expect code in the component body to re-run after signals change.

## Props

Props are reactive objects. Do not destructure them directly.

```tsx
// Avoid: loses reactivity
const { dataKey } = props
const dataKey = props.dataKey

// Prefer
const dataKey = () => props.dataKey

// Or, for components
const [localProps, otherProps] = splitProps(props, ['dataKey'])
```

Use `mergeProps` for defaults because it preserves reactivity.

```tsx
const defaultedProps = mergeProps({ xAxisId: 'x' }, props)
```

Use `splitProps` for local/event/rest prop groups.

```tsx
const [localProps, eventProps, otherProps] = splitProps(
  defaultedProps,
  ['dataKey', 'xAxisId'],
  ['onPointClick'],
)
```

## Accessors

Pass changing values as accessors, especially through helpers and context.

```tsx
createScale({
  axisId: () => localProps.xAxisId,
  orientation: () => 'x',
  chartContext,
})
```

Avoid capturing reactive props as plain values unless they are intentionally structural and static, such as axis orientation or layout position.

## Derived State

Use `createMemo` for derived values.

```tsx
const data = createMemo(() => accessData(chartContext.data(), localProps.dataKey))
```

Keep memos pure: no signal writes, DOM reads, registrations, or side effects.

Use `createEffect` for synchronization with external systems or registries, and always pair registrations with `onCleanup`.

```tsx
createEffect(() => {
  chartContext.registerSeriesMeta(seriesId, meta())
  onCleanup(() => chartContext.unregisterSeriesMeta(seriesId))
})
```

## Lists

Use Solid control flow for lists and conditionals.

- Use `<For>` when list order or length can change.
- Use `<Index>` only when list length/order are stable and item contents change.
- Do not filter a list before `<For>` if you need original data indexes. Iterate the full list and gate invalid items with `<Show>`.

```tsx
<For each={points()}>
  {(point, index) => (
    <Show when={pointDefined(point)}>
      <circle cx={point[0]} cy={point[1]} data-index={index()} />
    </Show>
  )}
</For>
```

## Effects

Effects are for side effects, not normal derived state.

- Do not write signals in effects just to compute another value; use `createMemo`.
- Do not rely on effect execution order.
- Use `onMount` for one-time setup.
- Use `onCleanup` for listeners, subscriptions, intervals, observers, and registry entries.

## Context

Wrap `useContext` in a project hook that throws a useful error.

```tsx
export const useChartContext = () => {
  const context = useContext(ChartContext)
  if (!context) throw new Error('Chart context not found')
  return context
}
```

Context values should expose accessors for reactive state.

```tsx
<ChartContext.Provider value={{ data: () => localProps.data }}>
  {props.children}
</ChartContext.Provider>
```

## Children

Passing JSX children through once is fine.

If reading `props.children` multiple times, use Solid's `children` helper or a controlled render-prop pattern that avoids recreating children unexpectedly.

Render props in this repo usually receive already-projected chart state, for example `{ point, value, index, active }`.

## Static Structural Props

Some props are intentionally treated as static because changing them would rebuild chart structure:

- `axis`
- `position`
- default axis IDs
- layout orientation

If a prop should be dynamic, pass it as an accessor through helpers instead of reading it once during setup.
