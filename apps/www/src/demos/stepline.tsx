import { Axis, AxisGrid, AxisLabel, AxisLine, Chart, Line } from "peculiar-charts";
import { curveStepAfter } from "peculiar-charts/curves";
import { sales } from "../data";

export default function Stepline() {
  return (
    <Chart data={sales}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
      <Line dataKey="coffee" curve={curveStepAfter} class="text-blue-600" stroke-width={2} />
      <Line dataKey="tea" class="text-amber-500" stroke-width={2} stroke-dasharray="6,4" />
    </Chart>
  );
}
