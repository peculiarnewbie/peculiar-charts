import { Chart, Legend, Pie } from 'peculiar-charts'
import { createSignal } from 'solid-js'

const dataA = [
  { day: 'Mon', coffee: 42, tea: 60 },
  { day: 'Tue', coffee: 55, tea: 48 },
  { day: 'Wed', coffee: 38, tea: 72 },
  { day: 'Thu', coffee: 71, tea: 65 },
  { day: 'Fri', coffee: 88, tea: 90 },
  { day: 'Sat', coffee: 64, tea: 81 },
  { day: 'Sun', coffee: 50, tea: 58 },
]

const dataB = [
  { day: 'Mon', coffee: 65, tea: 40 },
  { day: 'Tue', coffee: 48, tea: 55 },
  { day: 'Wed', coffee: 72, tea: 38 },
  { day: 'Thu', coffee: 55, tea: 80 },
]

export default function AnimatedPie() {
  const [data, setData] = createSignal(dataA)
  return (
    <div class="flex h-full flex-col gap-3">
      <div class="flex gap-2">
        <button
          type="button"
          onClick={() => setData(dataA)}
          class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
        >
          Week A
        </button>
        <button
          type="button"
          onClick={() => setData(dataB)}
          class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
        >
          Week B
        </button>
      </div>
      <Chart data={data()} class="min-h-0 grow">
        <Legend class="text-xs" />
        <Pie
          dataKey="coffee"
          nameKey="day"
          padAngle={0.01}
          cornerRadius={2}
          animation
        />
      </Chart>
    </div>
  )
}
