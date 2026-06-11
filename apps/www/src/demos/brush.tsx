import {
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Brush,
  Chart,
  Line,
  Point,
} from "peculiar-charts";
import { TOOLTIP_SHELL } from "../demoStyles";

const data = Array.from({ length: 24 }, (_, i) => ({
  month: `M${i + 1}`,
  value: Math.round(60 + Math.sin(i / 2.5) * 30 + (i % 3) * 8),
}));

export default function BrushDemo() {
  return (
    <Chart data={data}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="month" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisCrosshair stroke-dasharray="6,6" class="stroke-black/60" />
        <AxisTooltip class={TOOLTIP_SHELL} />
      </Axis>
      <Line dataKey="value" name="Value" class="text-blue-500" color="#3b82f6" stroke-width={2} />
      <Point
        dataKey="value"
        class="text-blue-600 stroke-white"
        color="#2563eb"
        stroke-width={2}
        r={3}
        activeProps={{ r: 5 }}
      />
      <Brush>
        <Line dataKey="value" class="text-blue-400" color="#93c5fd" stroke-width={1} />
      </Brush>
    </Chart>
  );
}
