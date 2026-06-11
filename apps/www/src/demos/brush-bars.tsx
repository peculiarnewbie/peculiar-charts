import {
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Bar,
  Brush,
  Chart,
} from "peculiar-charts";
import { TOOLTIP_SHELL } from "../demoStyles";

const data = Array.from({ length: 24 }, (_, i) => ({
  month: `M${i + 1}`,
  coffee: Math.round(40 + Math.sin(i / 2.5) * 25 + (i % 3) * 6),
  tea: Math.round(30 + Math.cos(i / 3) * 20 + ((i + 1) % 3) * 5),
}));

export default function BrushBars() {
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
      <Bar dataKey="coffee" name="Coffee" class="text-blue-400" color="#60a5fa" />
      <Bar dataKey="tea" name="Tea" class="text-emerald-400" color="#34d399" />
      <Brush>
        <Bar dataKey="coffee" class="text-blue-300" color="#93c5fd" />
        <Bar dataKey="tea" class="text-emerald-300" color="#6ee7b7" />
      </Brush>
    </Chart>
  );
}
