import { Axis, AxisGrid, AxisLabel, AxisLine, Bubble, Chart } from "peculiar-charts";
import { bubbles } from "../data";

export default function BubbleChart() {
  return (
    <Chart data={bubbles} inset={{ top: 28, right: 28, bottom: 28, left: 36 }}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      {/* numeric x — each bubble sits at its real (price, rating) coordinate */}
      <Axis dataKey="price" axis="x" type="linear" position="bottom" tickCount={6}>
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      {/* radius encodes sales volume (area-proportional) */}
      <Bubble
        dataKey="rating"
        sizeKey="volume"
        sizeRange={[5, 28]}
        class="text-violet-500"
        stroke="white"
        stroke-width={1}
        activeProps={{ "fill-opacity": 0.9 }}
      />
    </Chart>
  );
}
