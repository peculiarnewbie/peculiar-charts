import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  type ChartEventPayload,
  Line,
} from "peculiar-charts";
import { For, createSignal } from "solid-js";

const data = [
  { day: "Mon", revenue: 4200, orders: 120 },
  { day: "Tue", revenue: 5800, orders: 185 },
  { day: "Wed", revenue: 3900, orders: 110 },
  { day: "Thu", revenue: 7100, orders: 240 },
  { day: "Fri", revenue: 6400, orders: 210 },
  { day: "Sat", revenue: 8200, orders: 290 },
  { day: "Sun", revenue: 5100, orders: 160 },
];

const LogItem = (props: { label: string; payload: ChartEventPayload<typeof data> }) => (
  <div class="flex items-start gap-2 text-xs font-mono">
    <span class="shrink-0 text-zinc-500">{props.label}</span>
    <span class="text-zinc-300">
      idx={props.payload.index}{" "}
      {props.payload.datum ? (
        <>
          [{props.payload.datum.day}]{" "}
          {props.payload.series.map((s) => `${s.name}=${String(s.value ?? "—")}`).join(" ")}
        </>
      ) : (
        "(outside)"
      )}
    </span>
  </div>
);

export default function ChartLevelEventsDemo() {
  const [log, setLog] = createSignal<
    { id: number; label: string; payload: ChartEventPayload<typeof data> }[]
  >([]);
  let nextId = 0;
  let moveThrottle = 0;

  const push = (label: string, payload: ChartEventPayload<typeof data>) => {
    setLog((prev) => [{ id: nextId++, label, payload }, ...prev].slice(0, 12));
  };

  const throttledMove = (payload: ChartEventPayload<typeof data>) => {
    const now = Date.now();
    if (now - moveThrottle < 100) return;
    moveThrottle = now;
    push("move", payload);
  };

  return (
    <div class="flex flex-col gap-4">
      <div class="h-[300px]">
        <Chart
          data={data}
          width={600}
          height={300}
          onChartPointerMove={throttledMove}
          onChartClick={(p) => push("click", p)}
          onChartPointerDown={(p) => push("down", p)}
          onChartPointerUp={(p) => push("up", p)}
          onChartPointerLeave={(p) => push("leave", p)}
          class="select-none"
        >
          <Axis axis="y" position="left" tickCount={5}>
            <AxisLabel format={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <AxisLine />
            <AxisGrid class="stroke-black/10" />
          </Axis>
          <Axis dataKey="day" axis="x" position="bottom" tickCount={7}>
            <AxisLabel />
            <AxisLine />
            <AxisTooltip
              content={(p) => (
                <div class="rounded-md bg-zinc-900 px-3 py-2 text-xs text-zinc-100 shadow-lg border border-zinc-700">
                  <div class="font-medium mb-1">{String(p.label ?? "")}</div>
                  <For each={p.series}>
                    {(s) => (
                      <div class="flex justify-between gap-4">
                        <span class="text-zinc-400">{s.name}</span>
                        <span class="font-mono">
                          ${(s.value as number)?.toLocaleString?.() ?? "—"}
                        </span>
                      </div>
                    )}
                  </For>
                </div>
              )}
            />
          </Axis>
          <Line
            dataKey="revenue"
            name="Revenue"
            stroke="dodgerblue"
            stroke-width={2}
            dot={{ r: 3, class: "fill-indigo-600" }}
            activeDot={{
              r: 5,
              class: "fill-indigo-600 stroke-white",
              "stroke-width": 2,
            }}
          />
        </Chart>
      </div>
      <div class="text-xs text-zinc-500">
        Interact with the chart — move, click, press, release. Event log below:
      </div>
      <div class="h-[200px] overflow-auto rounded-md bg-zinc-950 p-3 flex flex-col gap-1">
        <For each={log()}>{(item) => <LogItem label={item.label} payload={item.payload} />}</For>
        {log().length === 0 && <div class="text-xs text-zinc-600 italic">No events yet</div>}
      </div>
    </div>
  );
}
