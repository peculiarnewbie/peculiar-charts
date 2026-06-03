import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Bar,
  Chart,
  Legend,
} from 'peculiar-charts'
import { createSignal } from 'solid-js'

const dataA = [
  { month: 'Jan', revenue: 42, costs: 28 },
  { month: 'Feb', revenue: 55, costs: 32 },
  { month: 'Mar', revenue: 38, costs: 25 },
  { month: 'Apr', revenue: 71, costs: 40 },
  { month: 'May', revenue: 88, costs: 45 },
  { month: 'Jun', revenue: 62, costs: 35 },
  { month: 'Jul', revenue: 50, costs: 30 },
]

const dataB = [
  { month: 'Jan', revenue: 60, costs: 35 },
  { month: 'Feb', revenue: 45, costs: 42 },
  { month: 'Mar', revenue: 78, costs: 30 },
]

export default function AnimatedPhaseBars() {
  const [data, setData] = createSignal(dataA)
  return (
    <div class="flex h-full flex-col gap-3">
      <div class="flex gap-2">
        <button
          type="button"
          onClick={() => setData(dataA)}
          class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
        >
          7 items
        </button>
        <button
          type="button"
          onClick={() => setData(dataB)}
          class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
        >
          3 items
        </button>
      </div>
      <Chart data={data()} class="min-h-0 grow">
        <Axis axis="y" position="left" tickCount={4}>
          <AxisLabel />
          <AxisGrid class="stroke-black/10" />
        </Axis>
        <Axis dataKey="month" axis="x" position="bottom">
          <AxisLabel />
          <AxisLine class="stroke-black" />
        </Axis>
        <Legend class="text-xs" />
        <Bar
          dataKey="revenue"
          name="Revenue"
          class="text-blue-500"
          animation={{
            duration: 400,
            easing: 'ease-out',
            enter: { duration: 600, easing: 'ease' },
            exit: { duration: 350, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
          }}
        />
        <Bar
          dataKey="costs"
          name="Costs"
          class="text-rose-400"
          animation={{
            duration: 400,
            easing: 'ease-out',
            enter: { duration: 600, easing: 'ease' },
            exit: { duration: 350, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
          }}
        />
      </Chart>
    </div>
  )
}
