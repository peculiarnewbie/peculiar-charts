import {
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  Bar,
  Chart,
  Legend,
} from 'peculiar-charts'
import { createSignal } from 'solid-js'
import { sales } from '../data'

export default function CustomBarShapes() {
  const [picked, setPicked] = createSignal<{ day: string; v: number } | null>(
    null,
  )

  return (
    <div>
      <p class="mb-2 h-4 text-xs text-black/60">
        {picked()
          ? `clicked ${picked()!.day}: ${picked()!.v} coffees`
          : 'click a bar →'}
      </p>
      <Chart data={sales}>
        <Legend class="text-xs" />
        <Bar
          dataKey="coffee"
          name="Coffee"
          class="text-blue-500"
          color="#3b82f6"
          shape={{ rx: 6, ry: 6 }}
          onPointClick={(d) =>
            setPicked({ day: sales[d.index]!.day, v: d.value })
          }
        />
        <Bar
          dataKey="tea"
          name="Tea"
          class="text-emerald-500"
          color="#10b981"
          shape={(bar) => (
            <rect
              x={bar.x + 2}
              y={bar.y + bar.height * 0.15}
              width={Math.max(0, bar.width - 4)}
              height={bar.height * 0.7}
              rx={bar.height * 0.35}
              class="fill-emerald-500"
              data-pc-bar=""
            />
          )}
        />
        <Axis axis="y" position="left" tickCount={4}>
          <AxisLabel />
          <AxisGrid class="stroke-black/10" />
        </Axis>
        <Axis dataKey="day" axis="x" position="bottom">
          <AxisLabel />
          <AxisLine class="stroke-black" />
        </Axis>
      </Chart>
    </div>
  )
}
