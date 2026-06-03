import {
  Area,
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Line,
  ReferenceLine,
} from 'peculiar-charts'
import { curveNatural } from 'peculiar-charts/curves'
import { wave } from '../data'

export default function NegativeFill() {
  return (
    <Chart data={wave}>
      <Axis axis="y" position="left" tickCount={5}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="m" axis="x" position="bottom">
        <AxisLine class="stroke-black/40" />
      </Axis>
      <ReferenceLine y={0} class="stroke-black/40" />
      {/* fill splits at the zero baseline */}
      <Area
        dataKey="v"
        curve={curveNatural}
        positiveFill="#3b82f6"
        negativeFill="#ef4444"
        fill-opacity={0.5}
      />
      <Line
        dataKey="v"
        curve={curveNatural}
        class="text-zinc-700"
        stroke-width={2}
      />
    </Chart>
  )
}
