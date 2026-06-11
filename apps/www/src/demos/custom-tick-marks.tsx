import { Axis, AxisGrid, AxisLabel, AxisLine, AxisMark, Chart, Line } from "peculiar-charts";
import { sales } from "../data";

export default function CustomTickMarks() {
  return (
    <Chart data={sales} inset={{ top: 8, right: 8, bottom: 28, left: 8 }}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisMark>
          {(tick) => (
            <polygon
              points={`${tick.x},${tick.y} ${tick.x - 4},${tick.y + 8} ${tick.x + 4},${tick.y + 8}`}
              class="fill-violet-500"
              data-pc-axis-mark=""
            />
          )}
        </AxisMark>
        <AxisLabel class="text-xs fill-zinc-600" />
        <AxisLine class="stroke-black" />
      </Axis>
      <Line dataKey="tea" class="text-violet-600" stroke-width={2} />
    </Chart>
  );
}
