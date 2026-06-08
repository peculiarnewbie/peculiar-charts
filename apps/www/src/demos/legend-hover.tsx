import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  Legend,
  Line,
  type SeriesMeta,
} from 'peculiar-charts'
import { createSignal } from 'solid-js'

const data = [
  { month: 'Jan', revenue: 120, costs: 80 },
  { month: 'Feb', revenue: 140, costs: 85 },
  { month: 'Mar', revenue: 130, costs: 90 },
  { month: 'Apr', revenue: 160, costs: 95 },
  { month: 'May', revenue: 180, costs: 100 },
  { month: 'Jun', revenue: 170, costs: 105 },
]

export default function LegendHover() {
  const [hovered, setHovered] = createSignal<string | null>(null)

  const highlightOpacity = (key: string) => {
    const h = hovered()
    if (!h) return 1
    return h === key ? 1 : 0.25
  }

  return (
    <Chart data={data}>
      <Axis axis="y" position="left">
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="month" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisTooltip class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-lg" />
      </Axis>
      <Legend
        onMouseEnter={(series: SeriesMeta) =>
          setHovered(series.dataKey ?? null)
        }
        onMouseLeave={() => setHovered(null)}
      />
      <Line
        dataKey="revenue"
        name="Revenue"
        class="text-indigo-600"
        color="#4f46e5"
        stroke-width={2}
        dot={false}
        opacity={highlightOpacity('revenue')}
      />
      <Line
        dataKey="costs"
        name="Costs"
        class="text-rose-600"
        color="#e11d48"
        stroke-width={2}
        stroke-dasharray="6 3"
        dot={false}
        opacity={highlightOpacity('costs')}
      />
    </Chart>
  )
}
