import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Line,
  useInverseYScale,
  usePlotArea,
  usePointerInChart,
  useSvgPointerPosition,
} from "peculiar-charts";
import { Show } from "solid-js";
import { monthLabel, priceSeries } from "../data";

/** Reads the y-value under the pointer via invertScale — no fork required. */
function YReadout() {
  const pointer = useSvgPointerPosition();
  const invertY = useInverseYScale();
  const plot = usePlotArea();
  const active = usePointerInChart();

  const value = () => {
    const p = pointer();
    if (!p || !active()) return null;
    const y = p.y;
    if (y < plot().top || y > plot().top + plot().height) return null;
    const raw = invertY()(y);
    return typeof raw === "number" && Number.isFinite(raw) ? Math.round(raw) : null;
  };

  return (
    <Show when={value() != null}>
      {(v) => (
        <g pointer-events="none">
          <line
            x1={plot().left}
            x2={plot().left + plot().width}
            y1={pointer()!.y}
            y2={pointer()!.y}
            class="stroke-indigo-400/60"
            stroke-dasharray="4,4"
          />
          <rect
            x={plot().left + plot().width - 52}
            y={pointer()!.y - 14}
            width={48}
            height={20}
            rx={4}
            class="fill-indigo-600"
          />
          <text
            x={plot().left + plot().width - 28}
            y={pointer()!.y}
            text-anchor="middle"
            dominant-baseline="central"
            class="fill-white text-[10px] font-medium"
          >
            {v()}
          </text>
        </g>
      )}
    </Show>
  );
}

export default function InverseScale() {
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
      <Line dataKey="price" class="text-indigo-600" stroke-width={2} />
      <YReadout />
    </Chart>
  );
}
