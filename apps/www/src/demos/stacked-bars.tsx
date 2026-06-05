import {
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Bar,
  Chart,
  Legend,
  Line,
} from 'peculiar-charts'
import { TOOLTIP_SHELL } from '../demoStyles'
import { sales } from '../data'

export default function StackedBars() {
  return (
    <Chart data={sales}>
      <Legend class="text-xs" />
      <Bar dataKey="coffee" name="Coffee" stackId="s" class="text-blue-400" color="#60a5fa" />
      <Bar dataKey="tea" name="Tea" stackId="s" class="text-emerald-400" color="#34d399" />
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisCrosshair stroke-dasharray="6,6" class="stroke-black/60" />
        <AxisTooltip class={TOOLTIP_SHELL} />
      </Axis>
    </Chart>
  )
}
