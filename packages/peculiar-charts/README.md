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
import { Chart, LineSeries, Axis } from "peculiar-charts";

function MyChart() {
  return (
    <Chart data={data} x="date" y="value">
      <Axis position="bottom" />
      <Axis position="left" />
      <LineSeries />
    </Chart>
  );
}
```

## License

MIT
