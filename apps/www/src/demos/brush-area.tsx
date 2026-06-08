import {
  Area,
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Brush,
  Chart,
  Line,
} from 'peculiar-charts'
import { curveNatural } from 'peculiar-charts/curves'
import { TOOLTIP_SHELL } from '../demoStyles'

const data = Array.from({ length: 24 }, (_, i) => ({
  t: Date.UTC(2024, i, 1),
  value: Math.round(80 + Math.sin(i / 2.5) * 30 + (i % 3) * 8),
}))

const fmt = (t: Date) =>
  new Date(t).toLocaleDateString('en', { month: 'short' })

export default function BrushArea() {
  return (
    <Chart data={data}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis
        dataKey="t"
        axis="x"
        type="time"
        position="bottom"
        tickCount={6}
      >
        <AxisLabel format={fmt} />
        <AxisLine class="stroke-black" />
        <AxisCrosshair stroke-dasharray="6,6" class="stroke-black/60" />
        <AxisTooltip class={TOOLTIP_SHELL} />
      </Axis>
      <Area
        dataKey="value"
        curve={curveNatural}
        class="text-sky-200"
        color="#bae6fd"
      />
      <Line
        dataKey="value"
        curve={curveNatural}
        class="text-sky-600"
        color="#0284c7"
        stroke-width={2}
      />
      <Brush>
        <Area
          dataKey="value"
          curve={curveNatural}
          class="text-sky-200"
          color="#bae6fd"
        />
        <Line
          dataKey="value"
          curve={curveNatural}
          class="text-sky-400"
          color="#7dd3fc"
          stroke-width={1}
        />
      </Brush>
    </Chart>
  )
}
