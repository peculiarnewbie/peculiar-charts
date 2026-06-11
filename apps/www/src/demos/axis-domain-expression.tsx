import { Axis, AxisGrid, AxisLabel, AxisLine, Chart, Legend, Line, Point } from "peculiar-charts";

const data = [
  { name: "Page A", uv: 4000, pv: 2400 },
  { name: "Page B", uv: 3000, pv: 1398 },
  { name: "Page C", uv: 2000, pv: 9800 },
  { name: "Page D", uv: 2780, pv: 3908 },
  { name: "Page E", uv: 1890, pv: 4800 },
  { name: "Page F", uv: 2390, pv: 3800 },
  { name: "Page G", uv: 3490, pv: 4300 },
];

export default function AxisDomainExpression() {
  return (
    <Chart data={data}>
      <Legend class="text-xs" />
      <Line
        dataKey="pv"
        name="pv"
        layout="horizontal"
        class="text-indigo-500"
        color="#6366f1"
        stroke-width={2}
      />
      <Line
        dataKey="uv"
        name="uv"
        layout="horizontal"
        class="text-amber-500"
        color="#f59e0b"
        stroke-width={2}
      />
      <Point
        dataKey="pv"
        layout="horizontal"
        class="text-indigo-600 stroke-white"
        color="#4f46e5"
        stroke-width={2}
        r={3}
      />
      <Point
        dataKey="uv"
        layout="horizontal"
        class="text-amber-600 stroke-white"
        color="#d97706"
        stroke-width={2}
        r={3}
      />
      <Axis axis="x" position="bottom" type="linear" axisRange={[0, "dataMax + 1000"]}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="name" axis="y" position="left" type="point">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
    </Chart>
  );
}
