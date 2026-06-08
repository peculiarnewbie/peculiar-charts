import {
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  Line,
} from 'peculiar-charts'

const data = [
  { day: 'Mon', sales: 42 },
  { day: 'Tue', sales: 55 },
  { day: 'Wed', sales: 38 },
  { day: 'Thu', sales: 67 },
  { day: 'Fri', sales: 51 },
  { day: 'Sat', sales: 73 },
  { day: 'Sun', sales: 62 },
]

export default function AxisPadding() {
  return (
    <Chart data={data}>
      <Axis axis="y" position="left">
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis
        dataKey="day"
        axis="x"
        position="bottom"
        padding={{ left: 30, right: 30 }}
      >
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisCrosshair class="stroke-black/35" />
        <AxisTooltip class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-lg" />
      </Axis>
      <Line
        dataKey="sales"
        class="text-indigo-600"
        color="#4f46e5"
        stroke-width={2}
        dot={{ r: 3, class: 'fill-indigo-600' }}
        activeDot={{
          r: 5,
          class: 'fill-indigo-600 stroke-white',
          'stroke-width': 2,
        }}
      />
    </Chart>
  )
}
