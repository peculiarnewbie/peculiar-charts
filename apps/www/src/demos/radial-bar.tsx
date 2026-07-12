import { Chart, Legend, PolarAngleAxis, PolarLayout, RadialBar } from "peculiar-charts";
import { createSignal } from "solid-js";

const progressA = [
  { name: "Shipments", value: 88 },
  { name: "Returns", value: 64 },
  { name: "Support", value: 42 },
  { name: "Quality", value: 76 },
];

const progressB = [
  { name: "Shipments", value: 62 },
  { name: "Returns", value: 91 },
  { name: "Support", value: 55 },
  { name: "Quality", value: 38 },
];

export default function RadialBarDemo() {
  const [progress, setProgress] = createSignal(progressA);
  return (
    <div class="flex h-full flex-col gap-3">
      <button
        type="button"
        onClick={() => setProgress((current) => (current === progressA ? progressB : progressA))}
        class="w-fit rounded-md border border-zinc-200 px-2.5 py-1 text-xs transition hover:bg-zinc-100"
      >
        Toggle progress
      </button>
      <Chart data={progress()} inset={24} class="min-h-0 grow">
        <Legend />
        <PolarLayout
          innerRadius="22%"
          outerRadius="85%"
          startAngle={-Math.PI / 2}
          endAngle={Math.PI * 1.5}
        >
          <PolarAngleAxis type="linear" axisRange={[0, 100]} />
          <RadialBar
            dataKey="value"
            name="Progress"
            background
            cornerRadius={4}
            labelPosition="outside"
            label={(bar) => (
              <text
                x={bar.labelPoint[0]}
                y={bar.labelPoint[1]}
                text-anchor={bar.textAnchor}
                dominant-baseline="middle"
                class="fill-zinc-600 text-[9px]"
              >
                {`${bar.value}%`}
              </text>
            )}
            animation={{ duration: 500 }}
          />
        </PolarLayout>
      </Chart>
    </div>
  );
}
