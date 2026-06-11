import {
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  Line,
  Point,
} from "peculiar-charts";
import { sales } from "../data";

export default function BasicLine() {
  return (
    <Chart<typeof sales> data={sales}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisCrosshair stroke-dasharray="6,6" class="stroke-black/60" />
        <AxisTooltip class="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
          {(p) => {
            const row = p.data as (typeof sales)[number];
            return (
              <>
                <div class="border-b border-zinc-200 bg-zinc-50 p-2 text-xs font-medium">
                  {row.day}
                </div>
                <div class="flex items-center gap-2 p-2 text-xs">
                  <div class="size-2 rounded-full bg-blue-500" />
                  <span class="grow">Coffee</span>
                  <span>{row.coffee}</span>
                </div>
              </>
            );
          }}
        </AxisTooltip>
      </Axis>
      <Line dataKey="coffee" name="Coffee" class="text-blue-500" color="#3b82f6" stroke-width={3} />
      <Point
        dataKey="coffee"
        class="text-blue-600 stroke-white transition-all"
        color="#2563eb"
        stroke-width={2}
        r={4}
        activeProps={{ r: 6 }}
      />
    </Chart>
  );
}
