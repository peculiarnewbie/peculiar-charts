import {
  Area,
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Legend,
} from 'peculiar-charts'
import { sales } from '../data'

const toPercent = (v: number) => `${Math.round(v * 100)}%`

export default function PercentArea() {
  return (
    <Chart data={sales} stackOffset="expand">
      <Legend class="text-xs" />
      <Area
        dataKey="coffee"
        name="Coffee"
        stackId="drinks"
        fill="#3b82f6"
        stroke="#2563eb"
        fill-opacity={0.7}
        class="text-blue-500"
        color="#3b82f6"
      />
      <Area
        dataKey="tea"
        name="Tea"
        stackId="drinks"
        fill="#10b981"
        stroke="#059669"
        fill-opacity={0.7}
        class="text-emerald-500"
        color="#10b981"
      />
      <Axis dataKey="day" axis="x" position="bottom" type="point">
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis
        axis="y"
        position="left"
        type="linear"
        tickCount={6}
        tickFormatter={toPercent}
      >
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
    </Chart>
  )
}
