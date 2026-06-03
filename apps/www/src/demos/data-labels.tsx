import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Line,
  Point,
  SeriesLabel,
} from 'peculiar-charts'
import { sales } from '../data'

export default function DataLabels() {
  return (
    <Chart data={sales} inset={{ top: 24, right: 8, bottom: 8, left: 8 }}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
      <Line dataKey="tea" class="text-emerald-500" stroke-width={2} />
      <Point dataKey="tea" class="text-emerald-600" r={3} />
      <SeriesLabel
        dataKey="tea"
        class="fill-emerald-700 text-[10px] font-medium"
      />
    </Chart>
  )
}
