import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Line,
} from 'peculiar-charts'
import { forecast } from '../data'

export default function GradientForecast() {
  return (
    <Chart data={forecast}>
      <defs>
        <linearGradient id="grad-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#22c55e" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="m" axis="x" position="bottom">
        <AxisLabel interval={1} />
        <AxisLine class="stroke-black" />
      </Axis>
      {/* solid gradient actuals … */}
      <Line dataKey="actual" stroke="url(#grad-line)" stroke-width={3} />
      {/* … then a dashed projected tail */}
      <Line
        dataKey="projected"
        class="text-blue-400"
        stroke-width={3}
        stroke-dasharray="2,6"
        stroke-linecap="round"
      />
    </Chart>
  )
}
