import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Legend,
  Line,
} from 'peculiar-charts'
import { sales } from '../data'

export default function Biaxial() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel class="fill-blue-600" />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      {/* second value axis, its own id + domain */}
      <Axis axis="y" axisId="revenue" position="right" tickCount={4}>
        <AxisLabel class="fill-emerald-600" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
      <Line
        dataKey="coffee"
        name="Coffee"
        class="text-blue-600"
        stroke-width={2}
      />
      <Line
        dataKey="revenue"
        name="Revenue"
        yAxisId="revenue"
        class="text-emerald-600"
        stroke-width={2}
      />
    </Chart>
  )
}
