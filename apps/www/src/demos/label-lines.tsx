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

export default function LabelLines() {
  return (
    <Chart data={sales} inset={{ top: 28, right: 8, bottom: 8, left: 8 }}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
      <Line dataKey="coffee" class="text-violet-500" stroke-width={2} />
      <Point dataKey="coffee" class="text-violet-600" r={3} />
      <SeriesLabel
        dataKey="coffee"
        offset={14}
        class="fill-violet-700 text-[10px] font-semibold"
        labelLine={(d) => (
          <line
            x1={d.point[0]}
            y1={d.point[1]}
            x2={d.labelPoint[0]}
            y2={d.labelPoint[1]}
            class="stroke-violet-400"
            stroke-dasharray="3,3"
            data-pc-label-line=""
          />
        )}
      />
    </Chart>
  )
}
