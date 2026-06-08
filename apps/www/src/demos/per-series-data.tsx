import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Legend,
  Line,
  Point,
} from 'peculiar-charts'
import { sales } from '../data'

const weatherData = [
  { day: 'Mon', temp: 18 },
  { day: 'Tue', temp: 22 },
  { day: 'Wed', temp: 15 },
  { day: 'Thu', temp: 25 },
  { day: 'Fri', temp: 28 },
  { day: 'Sat', temp: 24 },
  { day: 'Sun', temp: 20 },
]

export default function PerSeriesData() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Line
        dataKey="coffee"
        name="Coffee (chart data)"
        class="text-blue-500"
        color="#3b82f6"
        stroke-width={2}
      />
      <Line
        data={weatherData}
        dataKey="temp"
        name="Temp (series data)"
        class="text-amber-500"
        color="#f59e0b"
        stroke-width={2}
        stroke-dasharray="6 3"
      />
      <Point
        dataKey="coffee"
        class="text-blue-600 stroke-white"
        color="#2563eb"
        stroke-width={2}
        r={3}
      />
      <Point
        data={weatherData}
        dataKey="temp"
        class="text-amber-600 stroke-white"
        color="#d97706"
        stroke-width={2}
        r={3}
      />
      <Axis dataKey="day" axis="x" position="bottom" type="point">
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis axis="y" position="left" type="linear" tickCount={5}>
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
    </Chart>
  )
}
