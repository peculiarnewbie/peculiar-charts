import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
} from "peculiar-charts";
import { curveNatural } from "peculiar-charts/curves";
import { monthLabel, priceSeries } from "../data";

export default function Annotations() {
  const peak = priceSeries[8]!;
  return (
    <Chart data={priceSeries}>
      <Axis axis="y" position="left" tickCount={4} axisRange={[100, 240]}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="t" axis="x" type="time" position="bottom" tickCount={6}>
        <AxisLabel format={monthLabel} />
        <AxisLine class="stroke-black" />
      </Axis>
      <ReferenceArea y1={150} y2={190} class="fill-amber-400" fill-opacity={0.15} />
      <ReferenceLine
        y={170}
        class="stroke-amber-500"
        stroke-dasharray="6,4"
        label="target"
        labelProps={{ class: "fill-amber-600 text-[10px]" }}
      />
      <Line dataKey="price" curve={curveNatural} class="text-indigo-600" stroke-width={2} />
      <ReferenceDot
        x={peak.t}
        y={peak.price}
        r={5}
        class="fill-rose-500 stroke-white"
        stroke-width={2}
        label="peak"
        labelProps={{ class: "fill-rose-600 text-[10px] font-medium" }}
      />
    </Chart>
  );
}
