import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Line,
  Point,
} from 'peculiar-charts'
import { curveNatural } from 'peculiar-charts/curves'
import { sales } from '../data'

export default function CustomDots() {
  return (
    <Chart data={sales} inset={16}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
      <Line
        dataKey="coffee"
        curve={curveNatural}
        class="text-violet-400"
        stroke-width={2}
      />
      {/* render anything per point via the children render-prop */}
      <Point dataKey="coffee">
        {(d) => (
          <text
            x={d.point[0]}
            y={d.point[1]}
            text-anchor="middle"
            dominant-baseline="central"
            font-size={d.active ? '20' : '15'}
          >
            {d.value > 60 ? '😀' : '😟'}
          </text>
        )}
      </Point>
    </Chart>
  )
}
