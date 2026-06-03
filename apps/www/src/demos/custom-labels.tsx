import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Line,
} from 'peculiar-charts'
import { sales } from '../data'

export default function CustomLabels() {
  return (
    <Chart data={sales} inset={{ top: 8, right: 8, bottom: 28, left: 8 }}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        {/* render-prop ticks: a swatch + text instead of a bare label */}
        <AxisLabel>
          {(tick) => (
            <g transform={`translate(${tick.x}, ${tick.y})`}>
              <circle cy={2} r={8} class="fill-teal-500" />
              <text
                y={4}
                text-anchor="middle"
                class="fill-white text-[8px] font-bold"
              >
                {String(tick.label).slice(0, 1)}
              </text>
            </g>
          )}
        </AxisLabel>
        <AxisLine class="stroke-black" />
      </Axis>
      <Line dataKey="tea" class="text-teal-600" stroke-width={2} />
    </Chart>
  )
}
