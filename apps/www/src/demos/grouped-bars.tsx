import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisMark,
  Bar,
  Chart,
  Legend,
  Line,
} from 'peculiar-charts'
import { sales } from '../data'

export default function GroupedBars() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisMark class="stroke-black" />
      </Axis>
      <Bar dataKey="coffee" name="Coffee" class="text-blue-400" />
      <Bar dataKey="tea" name="Tea" class="text-emerald-400" />
      <Line dataKey="coffee" class="text-blue-700" stroke-width={3} />
    </Chart>
  )
}
