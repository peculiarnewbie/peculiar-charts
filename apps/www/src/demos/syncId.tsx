import {
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  Line,
  Point,
} from 'peculiar-charts'
import { TOOLTIP_SHELL } from '../demoStyles'

const monthly = Array.from({ length: 12 }, (_, i) => ({
  month: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]!,
  a: 40 + Math.sin((i / 12) * Math.PI * 2) * 10 + (i % 3) * 5,
  b: 30 + Math.cos((i / 12) * Math.PI * 2) * 15 + (i % 2) * 10,
}))

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
          dataKey="a"
          name="Series A"
          class="text-blue-500"
          color="#3b82f6"
          stroke-width={2}
        />
        <Point
          dataKey="a"
          class="text-blue-600 stroke-white"
          color="#2563eb"
          stroke-width={2}
          r={3}
          activeProps={{ r: 5 }}
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
          dataKey="b"
          name="Series B"
          class="text-emerald-500"
          color="#10b981"
          stroke-width={2}
        />
        <Point
          dataKey="b"
          class="text-emerald-600 stroke-white"
          color="#059669"
          stroke-width={2}
          r={3}
          activeProps={{ r: 5 }}
        />
      </Chart>
    </div>
  )
}
