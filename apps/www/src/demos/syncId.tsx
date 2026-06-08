import {
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  Line,
} from 'peculiar-charts'
import { TOOLTIP_SHELL } from '../demoStyles'

const monthly = [
  { month: 'Jan', revenue: 40, profit: 14 },
  { month: 'Feb', revenue: 45, profit: 20 },
  { month: 'Mar', revenue: 42, profit: 16 },
  { month: 'Apr', revenue: 55, profit: 24 },
  { month: 'May', revenue: 50, profit: 22 },
  { month: 'Jun', revenue: 65, profit: 30 },
  { month: 'Jul', revenue: 75, profit: 38 },
  { month: 'Aug', revenue: 70, profit: 34 },
  { month: 'Sep', revenue: 60, profit: 26 },
  { month: 'Oct', revenue: 52, profit: 20 },
  { month: 'Nov', revenue: 62, profit: 28 },
  { month: 'Dec', revenue: 70, profit: 34 },
]

export default function SyncIdDemo() {
  return (
    <div class="grid grid-cols-2 gap-4 h-full">
      <Chart data={monthly} syncId="demo-sync" height="responsive">
        <Axis axis="y" position="left" tickCount={4}>
          <AxisLabel />
          <AxisGrid class="stroke-black/10" />
        </Axis>
        <Axis dataKey="month" axis="x" position="bottom">
          <AxisLabel />
          <AxisLine class="stroke-black" />
          <AxisCrosshair
            stroke-dasharray="6,6"
            class="stroke-blue-400/60"
          />
          <AxisTooltip class={TOOLTIP_SHELL} />
        </Axis>
        <Line
          dataKey="revenue"
          name="Revenue"
          class="text-blue-500"
          color="#3b82f6"
          stroke-width={2}
          dot={{ r: 3, fill: '#2563eb', stroke: '#ffffff', 'stroke-width': 2 }}
          activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', 'stroke-width': 2 }}
        />
      </Chart>

      <Chart data={monthly} syncId="demo-sync" height="responsive">
        <Axis axis="y" position="left" tickCount={4}>
          <AxisLabel />
          <AxisGrid class="stroke-black/10" />
        </Axis>
        <Axis dataKey="month" axis="x" position="bottom">
          <AxisLabel />
          <AxisLine class="stroke-black" />
          <AxisCrosshair
            stroke-dasharray="6,6"
            class="stroke-emerald-400/60"
          />
          <AxisTooltip class={TOOLTIP_SHELL} />
        </Axis>
        <Line
          dataKey="profit"
          name="Profit"
          class="text-emerald-500"
          color="#10b981"
          stroke-width={2}
          dot={{ r: 3, fill: '#059669', stroke: '#ffffff', 'stroke-width': 2 }}
          activeDot={{ r: 5, fill: '#059669', stroke: '#ffffff', 'stroke-width': 2 }}
        />
      </Chart>
    </div>
  )
}
