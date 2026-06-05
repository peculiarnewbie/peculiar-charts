import {
  Area,
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  Line,
} from 'peculiar-charts'
import { curveNatural } from 'peculiar-charts/curves'
import { monthLabel, priceSeries } from '../data'

export default function DatetimeAxis() {
  return (
    <Chart data={priceSeries}>
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      {/* numeric/time x with irregular spacing — points sit at their real date */}
      <Axis dataKey="t" axis="x" type="time" position="bottom" tickCount={6}>
        <AxisLabel format={monthLabel} />
        <AxisLine class="stroke-black" />
        <AxisCrosshair class="stroke-black/50" stroke-dasharray="4,4" />
        <AxisTooltip class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-lg">
          {(p) => (
            <span>
              {monthLabel(new Date(p.data.t))}: <b>{p.data.price}</b>
            </span>
          )}
        </AxisTooltip>
      </Axis>
      <Area dataKey="price" curve={curveNatural} class="text-sky-200" color="#bae6fd" />
      <Line
        dataKey="price"
        curve={curveNatural}
        class="text-sky-600"
        color="#0284c7"
        stroke-width={2}
      />
    </Chart>
  )
}
