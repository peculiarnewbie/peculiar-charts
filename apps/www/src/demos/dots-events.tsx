import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Chart,
  Line,
} from 'peculiar-charts'
import { curveNatural } from 'peculiar-charts/curves'
import { createSignal } from 'solid-js'
import { sales } from '../data'

export default function DotsEvents() {
  const [picked, setPicked] = createSignal<{ day: string; v: number } | null>(
    null,
  )

  return (
    <div>
      <p class="mb-2 h-4 text-xs text-black/60">
        {picked()
          ? `clicked ${picked()!.day}: ${picked()!.v} coffees`
          : 'click a dot →'}
      </p>
      <Chart data={sales} inset={16}>
        <Axis axis="y" position="left" tickCount={4}>
          <AxisGrid class="stroke-black/10" />
        </Axis>
        <Axis dataKey="day" axis="x" position="bottom">
          <AxisLabel />
          <AxisLine class="stroke-black" />
        </Axis>
        <Line
          dataKey="coffee"
          curve={curveNatural}
          class="text-violet-500"
          stroke-width={2}
          // props-object form — merged onto the default dot <circle>
          dot={{ r: 3, 'stroke-width': 2, stroke: 'white' }}
          // function form — full control of the hover marker
          activeDot={(d) => (
            <circle
              cx={d.point[0]}
              cy={d.point[1]}
              r={7}
              class="fill-violet-500/20 stroke-violet-600"
              stroke-width={2}
            />
          )}
          // per-datum event — carries the datum, not just the DOM event
          onPointClick={(d) =>
            setPicked({ day: sales[d.index]!.day, v: d.value })
          }
        />
      </Chart>
    </div>
  )
}
