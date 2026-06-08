import {
  Area,
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
} from 'peculiar-charts'

const data = [
  { day: 'Mon', temp: [8, 18] },
  { day: 'Tue', temp: [10, 22] },
  { day: 'Wed', temp: [7, 16] },
  { day: 'Thu', temp: [12, 24] },
  { day: 'Fri', temp: [14, 26] },
  { day: 'Sat', temp: [11, 20] },
  { day: 'Sun', temp: [9, 17] },
]

export default function RangedArea() {
  return (
    <Chart<typeof data> data={data}>
      <Axis axis="y" position="left" tickFormatter={(v) => `${v}°`}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisTooltip class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-lg">
          {(p) => {
            const row = p.data as (typeof data)[number]
            const range = row.temp as [number, number]
            return (
              <span>
                {row.day}: <b>{range[0]}°</b> – {range[1]}°
              </span>
            )
          }}
        </AxisTooltip>
      </Axis>
      <Area
        dataKey="temp"
        name="Temperature"
        class="text-sky-500"
        fill="oklch(0.7 0.1 240)"
        fill-opacity={0.3}
        stroke="oklch(0.55 0.15 240)"
        stroke-width={2}
        dot={{ r: 3, class: 'fill-sky-500' }}
        activeDot={{
          r: 5,
          class: 'fill-sky-500 stroke-white',
          'stroke-width': 2,
        }}
      />
    </Chart>
  )
}
