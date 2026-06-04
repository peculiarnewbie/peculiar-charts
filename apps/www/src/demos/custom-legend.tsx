import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Bar,
  Chart,
  Legend,
  Line,
} from 'peculiar-charts'
import { sales } from '../data'

export default function CustomLegend() {
  return (
    <Chart data={sales}>
      <Legend
        class="text-xs"
        content={(series) => (
          <>
            <span
              class="size-3 rounded-sm"
              style={{ background: series.color }}
              data-pc-legend-swatch=""
            />
            <span class="font-medium uppercase tracking-wide" data-pc-legend-name="">
              {series.name}
            </span>
          </>
        )}
      />
      <Bar dataKey="coffee" name="Coffee" class="text-blue-400" />
      <Bar dataKey="tea" name="Tea" class="text-emerald-400" />
      <Axis axis="y" position="left" tickCount={4}>
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis dataKey="day" axis="x" position="bottom">
        <AxisLabel />
        <AxisLine class="stroke-black" />
      </Axis>
      <Line dataKey="coffee" class="text-blue-700" stroke-width={2} />
    </Chart>
  )
}
