import { Axis, AxisGrid, AxisLabel, AxisLine, Bar, Chart } from "peculiar-charts";

const adoption = [
  { channel: "Search", share: 0.8 },
  { channel: "Social", share: 7.2 },
  { channel: "Partners", share: 3.6 },
  { channel: "Email", share: 12.4 },
];

export default function BarBackgroundDemo() {
  return (
    <Chart data={adoption} inset={{ top: 16, right: 16, bottom: 28, left: 28 }}>
      <Axis axis="y" position="left" axisRange={[0, 15]} tickCount={4}>
        <AxisLabel format={(value) => `${value}%`} />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="channel" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
      <Bar
        dataKey="share"
        class="text-blue-500"
        background={{ class: "fill-blue-100" }}
        minPointSize={8}
        shape={{ rx: 5, ry: 5 }}
      />
    </Chart>
  );
}
