import { Area, Axis, AxisGrid, AxisLabel, AxisLine, Chart, Legend } from "peculiar-charts";
import { createSignal } from "solid-js";

const dataA = [
  { day: "Mon", coffee: 42, tea: 60 },
  { day: "Tue", coffee: 55, tea: 48 },
  { day: "Wed", coffee: 38, tea: 72 },
  { day: "Thu", coffee: 71, tea: 65 },
  { day: "Fri", coffee: 88, tea: 90 },
  { day: "Sat", coffee: 64, tea: 81 },
  { day: "Sun", coffee: 50, tea: 58 },
];

const dataB = [
  { day: "Mon", coffee: 65, tea: 40 },
  { day: "Tue", coffee: 48, tea: 55 },
  { day: "Wed", coffee: 72, tea: 38 },
  { day: "Thu", coffee: 55, tea: 80 },
];

export default function AnimatedArea() {
  const [data, setData] = createSignal(dataA);
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
        <Axis axis="y" position="left" tickCount={4}>
          <AxisLabel />
          <AxisGrid class="stroke-black/10" />
        </Axis>
        <Axis dataKey="day" axis="x" position="bottom">
          <AxisLabel />
          <AxisLine class="stroke-black" />
        </Axis>
        <Legend class="text-xs" />
        <Area
          dataKey="coffee"
          name="Coffee"
          class="text-blue-500"
          color="#3b82f6"
          fill-opacity={0.3}
          stroke-width={2}
          animation
        />
        <Area
          dataKey="tea"
          name="Tea"
          class="text-emerald-500"
          color="#10b981"
          fill-opacity={0.3}
          stroke-width={2}
          animation
        />
      </Chart>
    </div>
  );
}
