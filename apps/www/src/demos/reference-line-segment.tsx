import {
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  Line,
  ReferenceLine,
  useClosestTick,
  usePointerInChart,
} from "peculiar-charts";
import { Show, createMemo } from "solid-js";

const data = [
  { month: "Jan", current: 118, compare: 128 },
  { month: "Feb", current: 132, compare: 136 },
  { month: "Mar", current: 126, compare: 144 },
  { month: "Apr", current: 148, compare: 154 },
  { month: "May", current: 164, compare: 162 },
  { month: "Jun", current: 176, compare: 170 },
];

function HoverComparison() {
  const tick = useClosestTick<typeof data>("x", "x");
  const pointerInChart = usePointerInChart();
  const hoverPercentage = createMemo(() => {
    if (!pointerInChart()) return 100;
    const index = tick()?.index ?? data.length - 1;
    return (index / (data.length - 1)) * 100;
  });
  const segment = createMemo(() => {
    const active = tick()?.datum;
    if (!pointerInChart() || !active) return undefined;
    return [
      { x: active.month, y: active.compare },
      { x: active.month, y: active.current },
    ] as [{ x: string; y: number }, { x: string; y: number }];
  });

  return (
    <>
      <defs>
        <linearGradient id="compareLineColor" x1="0%" y1="0" x2="100%" y2="0">
          <stop offset="0%" stop-color="#e11d48" stop-opacity="1" />
          <stop offset={`${hoverPercentage()}%`} stop-color="#e11d48" stop-opacity="1" />
          <stop offset={`${hoverPercentage()}%`} stop-color="#e11d48" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#e11d48" stop-opacity="0.2" />
        </linearGradient>
      </defs>
      <Show when={segment()}>
        {(activeSegment) => (
          <ReferenceLine
            segment={activeSegment()}
            class="stroke-rose-500"
            stroke-width={10}
            stroke-linecap="round"
            stroke-opacity={0.24}
          />
        )}
      </Show>
    </>
  );
}

export default function ReferenceLineSegment() {
  return (
    <Chart<typeof data> data={data}>
      <Axis axis="y" position="left" axisRange={[100, 190]} tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="month" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisCrosshair class="stroke-black/35" />
        <AxisTooltip class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-lg">
          {(p) => {
            const row = p.data as (typeof data)[number];
            return (
              <span>
                {row.month}: <b>{row.current}</b> vs {row.compare}
              </span>
            );
          }}
        </AxisTooltip>
      </Axis>
      <HoverComparison />
      <Line
        dataKey="compare"
        class="text-rose-600"
        color="#e11d48"
        stroke="url(#compareLineColor)"
        stroke-width={2}
        stroke-dasharray="0.1 5"
        stroke-linecap="round"
        activeDot={{
          r: 4,
          class: "fill-rose-500 stroke-white",
          "stroke-width": 2,
        }}
      />
      <Line
        dataKey="current"
        class="text-indigo-600"
        color="#4f46e5"
        stroke-width={3}
        dot={false}
        activeDot={{
          r: 4,
          class: "fill-indigo-600 stroke-white",
          "stroke-width": 2,
        }}
      />
    </Chart>
  );
}
