import {
  Area,
  Axis,
  AxisCrosshair,
  AxisLabel,
  AxisLine,
  AxisValueLine,
  Chart,
  Line,
  Point,
} from "peculiar-charts";
import { curveNatural } from "peculiar-charts/curves";
import { sales } from "../data";

export default function CurvedGaps() {
  return (
    <Chart data={sales}>
      <Axis axis="y" position="right" axisRange={[0, 120]} tickValues={[0, 50, 90, 120]}>
        <AxisLabel />
        <AxisValueLine value={90} stroke-dasharray="8" class="text-amber-500" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisCrosshair class="stroke-black/60" />
      </Axis>
      {/* `nulls` has a hole on Thu — the line breaks across it */}
      <Area dataKey="nulls" curve={curveNatural} class="text-purple-200" />
      <Line dataKey="nulls" curve={curveNatural} class="text-purple-600" stroke-width={3} />
      <Point dataKey="nulls" class="text-purple-700 stroke-white" stroke-width={2} r={4} />
    </Chart>
  );
}
