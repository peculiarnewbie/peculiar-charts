import {
  Area,
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Legend,
  Line,
} from 'peculiar-charts'
import { sales } from '../data'

export default function StackedArea() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Area dataKey="coffee" name="Coffee" stackId="s" class="text-blue-300" color="#93c5fd" />
      <Area dataKey="tea" name="Tea" stackId="s" class="text-emerald-300" color="#6ee7b7" />
      <Line
        dataKey="coffee"
        stackId="s"
        class="text-blue-600"
        color="#2563eb"
        stroke-width={2}
      />
      <Line
        dataKey="tea"
        stackId="s"
        class="text-emerald-600"
        color="#059669"
        stroke-width={2}
      />
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
    </Chart>
  )
}
