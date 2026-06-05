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

export default function HorizontalBars() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Bar
        dataKey="coffee"
        name="Coffee"
        layout="horizontal"
        class="text-blue-400"
        color="#60a5fa"
      />
      <Bar dataKey="tea" name="Tea" layout="horizontal" class="text-emerald-400" color="#34d399" />
      <Axis axis="x" position="bottom" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="y" position="left" type="point">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
    </Chart>
  )
}
