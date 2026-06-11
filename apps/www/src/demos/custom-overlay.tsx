import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Line,
  projectScale,
  useData,
  usePlotArea,
  useXScale,
  useYScale,
} from "peculiar-charts";
import { curveNatural } from "peculiar-charts/curves";
import { For } from "solid-js";
import { monthLabel, priceSeries } from "../data";

/**
 * A custom overlay authored entirely in user-land — it is just a child of
 * `<Chart>`. It reads the same scales the chart uses via the exported hooks,
 * so its markers land exactly on the data. No registration, no fork.
 */
function PeakTrough() {
  const data = useData<typeof priceSeries>();
  const x = useXScale();
  const y = useYScale();
  const plot = usePlotArea();

  const extremes = () => {
    const rows = data();
    let lo = rows[0]!;
    let hi = rows[0]!;
    for (const r of rows) {
      if (r.price < lo.price) lo = r;
      if (r.price > hi.price) hi = r;
    }
    return [
      { row: hi, label: `peak ${hi.price}`, cls: "fill-rose-500" },
      { row: lo, label: `low ${lo.price}`, cls: "fill-sky-500" },
    ];
  };

  return (
    <g data-demo-overlay="">
      {/* band spanning the full plot height at the peak's x */}
      <line
        x1={projectScale(x(), extremes()[0]!.row.t)}
        x2={projectScale(x(), extremes()[0]!.row.t)}
        y1={plot().top}
        y2={plot().top + plot().height}
        class="stroke-rose-300"
        stroke-dasharray="3,4"
      />
      <For each={extremes()}>
        {(e) => {
          const cx = () => projectScale(x(), e.row.t);
          const cy = () => projectScale(y(), e.row.price);
          return (
            <>
              <circle cx={cx()} cy={cy()} r={5} class={e.cls} />
              <text
                x={cx()}
                y={cy() - 10}
                text-anchor="middle"
                class={`${e.cls} text-[10px] font-medium`}
              >
                {e.label}
              </text>
            </>
          );
        }}
      </For>
    </g>
  );
}

export default function CustomOverlay() {
  return (
    <Chart data={priceSeries}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="t" axis="x" type="time" position="bottom" tickCount={6}>
        <AxisLabel format={monthLabel} />
        <AxisLine class="stroke-black" />
      </Axis>
      <Line dataKey="price" curve={curveNatural} class="text-indigo-600" stroke-width={2} />
      <PeakTrough />
    </Chart>
  );
}
