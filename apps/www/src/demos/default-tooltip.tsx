import {
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  Line,
} from 'peculiar-charts'
import { TOOLTIP_SHELL } from '../demoStyles'
import { sales } from '../data'

/** Default tooltip — no `children`/`content`; lists registered series automatically. */
export default function DefaultTooltip() {
  return (
    <Chart data={sales}>
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
      <Line dataKey="coffee" name="Coffee" class="text-blue-500" stroke-width={2} />
      <Line dataKey="tea" name="Tea" class="text-emerald-500" stroke-width={2} />
    </Chart>
  )
}
