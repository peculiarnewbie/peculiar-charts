import { Axis, AxisGrid, AxisLabel, AxisLine, Chart, Legend, Line, Point } from "peculiar-charts";
import { sales } from "../data";

export default function VerticalLine() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Line
        dataKey="coffee"
        name="Coffee"
        layout="horizontal"
        class="text-blue-500"
        color="#3b82f6"
        stroke-width={2}
      />
      <Line
        dataKey="tea"
        name="Tea"
        layout="horizontal"
        class="text-emerald-500"
        color="#10b981"
        stroke-width={2}
      />
      <Point
        dataKey="coffee"
        layout="horizontal"
        class="text-blue-600 stroke-white"
        color="#2563eb"
        stroke-width={2}
        r={3}
      />
      <Point
        dataKey="tea"
        layout="horizontal"
        class="text-emerald-600 stroke-white"
        color="#059669"
        stroke-width={2}
        r={3}
      />
      <Axis axis="x" position="bottom" type="linear" tickCount={5}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="y" position="left" type="point">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
    </Chart>
  );
}
