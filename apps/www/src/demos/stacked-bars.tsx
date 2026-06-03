import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Bar,
  Chart,
  Legend,
} from 'peculiar-charts'
import { sales } from '../data'

export default function StackedBars() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Bar dataKey="coffee" name="Coffee" stackId="s" class="text-blue-400" />
      <Bar dataKey="tea" name="Tea" stackId="s" class="text-emerald-400" />
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
