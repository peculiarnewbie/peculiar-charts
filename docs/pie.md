# Pie & donut charts

`<Pie>` is a self-contained series: it only needs a `<Chart>` and data. Each visible slice
registers with `<Legend>`, so users can toggle categories without extra wiring.

```tsx
<Chart data={sales}>
  <Legend />
  <Pie dataKey="amount" nameKey="category" innerRadius="55%" />
</Chart>
```

## Data and labels

Use `data` when the pie should read a source separate from the chart-level data. `label` can be
`true` for slice names, SVG text props for the default labels, or a render function for full
control. The render datum includes the value, name, colour, percent, arc geometry, and resolved
label `point` / `textAnchor`.

```tsx
<Pie
  data={marketShare}
  dataKey="share"
  nameKey="product"
  labelPosition="outside"
  label={(slice) => (
    <text
      x={slice.point[0]}
      y={slice.point[1]}
      text-anchor={slice.textAnchor}
      dominant-baseline="middle"
    >
      {`${slice.name}: ${Math.round(slice.percent * 100)}%`}
    </text>
  )}
/>
```

`labelOffset` controls the distance beyond the outer radius for outside labels. Custom labels
render inside the pie group, so their coordinates are relative to the pie centre.

## Slice interactions

`onSliceClick`, `onSliceEnter`, and `onSliceLeave` receive the same slice datum plus the native
mouse event. This makes drill-down or coordinated highlighting straightforward.

```tsx
<Pie dataKey="amount" nameKey="category" onSliceClick={(slice) => setSelected(slice.key)} />
```
