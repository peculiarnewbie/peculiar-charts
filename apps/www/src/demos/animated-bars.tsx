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
]

const dataB = [
  { month: 'Jan', revenue: 60, costs: 35 },
  { month: 'Feb', revenue: 45, costs: 42 },
  { month: 'Mar', revenue: 78, costs: 30 },
]

export default function AnimatedBars() {
  const [data, setData] = createSignal(dataA)
  return (
    <div class="flex h-full flex-col gap-3">
      <div class="flex gap-2">
        <button
          type="button"
          onClick={() => setData(dataA)}
          class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
        >
          Dataset A
        </button>
        <button
          type="button"
          onClick={() => setData(dataB)}
          class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
        >
          Dataset B
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
        <Bar dataKey="revenue" name="Revenue" class="text-blue-500" color="#3b82f6" animation />
        <Bar dataKey="costs" name="Costs" class="text-rose-400" color="#fb7185" animation />
      </Chart>
    </div>
  )
}
