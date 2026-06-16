import {
  Area,
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Legend,
  type StackOffset,
} from "peculiar-charts";
import { createSignal } from "solid-js";

const data = [
  { month: "Jan", desktop: 28, mobile: 44, partner: 18 },
  { month: "Feb", desktop: 34, mobile: 38, partner: 24 },
  { month: "Mar", desktop: 30, mobile: 52, partner: 20 },
  { month: "Apr", desktop: 46, mobile: 48, partner: 28 },
  { month: "May", desktop: 42, mobile: 64, partner: 32 },
  { month: "Jun", desktop: 54, mobile: 58, partner: 36 },
  { month: "Jul", desktop: 50, mobile: 70, partner: 42 },
];

const modes: { value: StackOffset; label: string }[] = [
  { value: "none", label: "None" },
  { value: "expand", label: "Expand" },
  { value: "silhouette", label: "Silhouette" },
  { value: "sign", label: "Sign" },
];

export default function StackOffsetVariants() {
  const [mode, setMode] = createSignal<StackOffset>("silhouette");

  return (
    <div class="flex h-full flex-col gap-3">
      <div class="flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-xs">
        {modes.map((item) => (
          <button
            type="button"
            onClick={() => setMode(item.value)}
            class="rounded-md px-2.5 py-1 font-medium transition"
            classList={{
              "bg-zinc-900 text-white shadow-sm": mode() === item.value,
              "text-zinc-500 hover:bg-white hover:text-zinc-900": mode() !== item.value,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Chart data={data} stackOffset={mode()} class="min-h-0 grow">
        <Legend class="text-xs" />
        <Area
          dataKey="desktop"
          name="Desktop"
          stackId="traffic"
          fill="#2563eb"
          stroke="#1d4ed8"
          fill-opacity={0.65}
          color="#2563eb"
        />
        <Area
          dataKey="mobile"
          name="Mobile"
          stackId="traffic"
          fill="#14b8a6"
          stroke="#0f766e"
          fill-opacity={0.65}
          color="#14b8a6"
        />
        <Area
          dataKey="partner"
          name="Partner"
          stackId="traffic"
          fill="#f59e0b"
          stroke="#d97706"
          fill-opacity={0.65}
          color="#f59e0b"
        />
        <Axis dataKey="month" axis="x" position="bottom" type="point">
          <AxisLabel />
          <AxisGrid class="stroke-black/10" />
        </Axis>
        <Axis axis="y" position="left" type="linear" tickCount={5}>
          <AxisLabel />
          <AxisLine class="stroke-black" />
        </Axis>
      </Chart>
    </div>
  );
}
