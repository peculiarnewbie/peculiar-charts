import { Axis, AxisGrid, AxisLabel, AxisLine, Bubble, Chart } from "peculiar-charts";
import { createSignal } from "solid-js";

const dataA = [
  { x: 12, y: 34, z: 8 },
  { x: 28, y: 55, z: 15 },
  { x: 45, y: 22, z: 5 },
  { x: 33, y: 67, z: 20 },
  { x: 18, y: 41, z: 12 },
  { x: 50, y: 30, z: 10 },
  { x: 8, y: 72, z: 25 },
];

const dataB = [
  { x: 20, y: 40, z: 10 },
  { x: 35, y: 50, z: 18 },
  { x: 15, y: 60, z: 6 },
];

export default function AnimatedBubble() {
  const [data, setData] = createSignal(dataA);
  return (
    <div class="flex h-full flex-col gap-3">
      <div class="flex gap-2">
        <button
          type="button"
          onClick={() => setData(dataA)}
          class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
        >
          7 bubbles
        </button>
        <button
          type="button"
          onClick={() => setData(dataB)}
          class="rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
        >
          3 bubbles
        </button>
      </div>
      <Chart data={data()} class="min-h-0 grow">
        <Axis axis="x" position="bottom">
          <AxisLabel />
          <AxisGrid class="stroke-black/10" />
          <AxisLine class="stroke-black" />
        </Axis>
        <Axis axis="y" position="left">
          <AxisLabel />
          <AxisGrid class="stroke-black/10" />
        </Axis>
        <Bubble
          dataKey="y"
          sizeKey="z"
          sizeRange={[6, 28]}
          fill="currentColor"
          class="text-blue-400"
          animation={{
            duration: 500,
            easing: "ease-out",
            exit: { duration: 400, easing: "ease-in" },
          }}
        />
      </Chart>
    </div>
  );
}
