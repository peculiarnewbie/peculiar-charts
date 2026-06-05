# peculiar-charts

Composable, unstyled, headless charts for SolidJS.

## Docs & Examples

[charts.peculiarnewbie.com](https://charts.peculiarnewbie.com)

## Install

```bash
npm install peculiar-charts
# or
pnpm add peculiar-charts
```

## Quick Start

```tsx
import { Chart, Line, Axis, AxisLabel, AxisMark } from "peculiar-charts";

const data = [
  { name: "Page A", value: 1500 },
  { name: "Page B", value: 2300 },
  { name: "Page C", value: 1800 },
];

function MyChart() {
  return (
    <Chart data={data}>
      <Axis axis="x" position="bottom" dataKey="name">
        <AxisMark />
        <AxisLabel />
      </Axis>
      <Axis axis="y" position="left">
        <AxisMark />
        <AxisLabel />
      </Axis>
      <Line dataKey="value" />
    </Chart>
  );
}
```

## License

MIT
