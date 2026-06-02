import {
  Area,
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisMark,
  AxisTooltip,
  AxisValueLine,
  Bar,
  Chart,
  Legend,
  Line,
  Pie,
  Point,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  SeriesLabel,
} from 'peculiar-charts'
import { curveNatural, curveStepAfter } from 'peculiar-charts/curves'

const data = Array.from({ length: 7 }, (_, i) => ({
  day: `Day ${i + 1}`,
  coffee: Math.round(Math.random() * 100) + 10,
  tea: Math.round(Math.random() * 100) + 40,
  revenue: Math.round(Math.random() * 4000) + 2000,
  nulls: i === 3 ? null : Math.round(Math.random() * 100) + 10,
}))

// Irregular, time-based x: monthly samples as epoch-ms timestamps.
const series = Array.from({ length: 12 }, (_, i) => ({
  t: Date.UTC(2024, i, 1),
  price: Math.round(120 + Math.sin(i / 1.7) * 40 + i * 3),
}))

// A signal that crosses zero, for fill-by-value.
const wave = Array.from({ length: 13 }, (_, i) => ({
  m: `M${i + 1}`,
  v: Math.round(Math.sin(i / 1.5) * 60),
}))

// Solid actuals then a dashed projected tail, overlapping at the seam.
const forecast = Array.from({ length: 12 }, (_, i) => {
  const base = 40 + Math.round(Math.sin(i / 1.3) * 16)
  return {
    m: `M${i + 1}`,
    actual: i <= 7 ? base : null,
    projected: i >= 7 ? base + (i - 7) * 5 : null,
  }
})

const monthLabel = (t: Date) =>
  new Date(t).toLocaleDateString('en', { month: 'short' })

const Card = (props: { title: string; children: any }) => (
  <div class="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
    <p class="mb-2 text-xs font-medium text-zinc-500">{props.title}</p>
    <div class="relative h-[240px]">{props.children}</div>
  </div>
)

export default function Playground() {
  return (
    <div class="min-h-screen bg-zinc-50 p-8 text-sm text-zinc-800">
      <h1 class="mb-6 text-lg font-semibold">peculiar-charts · lab</h1>
      <div class="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Line + Point + Grid + Tooltip">
          <Chart data={data}>
            <Axis axis="y" position="left" tickCount={4}>
              <AxisLabel />
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis dataKey="day" axis="x" position="bottom">
              <AxisLabel />
              <AxisLine class="stroke-black" />
              <AxisCrosshair
                stroke-dasharray="6,6"
                class="stroke-black/60 transition-opacity"
              />
              <AxisTooltip class="flex flex-col rounded-lg border border-zinc-200 bg-white shadow-lg overflow-hidden">
                {(p) => (
                  <>
                    <div class="bg-zinc-50 border-b border-zinc-200 p-2 text-xs font-medium">
                      {p.data.day}
                    </div>
                    <div class="flex items-center gap-2 p-2 text-xs">
                      <div class="size-2 rounded-full bg-blue-500" />
                      <span class="grow">Coffee</span>
                      <span>{p.data.coffee}</span>
                    </div>
                  </>
                )}
              </AxisTooltip>
            </Axis>
            <Line
              dataKey="coffee"
              name="Coffee"
              class="text-blue-500"
              stroke-width={3}
            />
            <Point
              dataKey="coffee"
              class="text-blue-600 stroke-white transition-all"
              stroke-width={2}
              r={4}
              activeProps={{ r: 6 }}
            />
          </Chart>
        </Card>

        <Card title="Datetime x-axis + tooltip (numeric x, irregular spacing)">
          <Chart data={series}>
            <Axis axis="y" position="left" tickCount={4}>
              <AxisLabel />
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis
              dataKey="t"
              axis="x"
              type="time"
              position="bottom"
              tickCount={6}
            >
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
            <Area dataKey="price" curve={curveNatural} class="text-sky-200" />
            <Line
              dataKey="price"
              curve={curveNatural}
              class="text-sky-600"
              stroke-width={2}
            />
          </Chart>
        </Card>

        <Card title="Data labels (SeriesLabel)">
          <Chart data={data} inset={{ top: 24, right: 8, bottom: 8, left: 8 }}>
            <Axis axis="y" position="left" tickCount={4}>
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis dataKey="day" axis="x" position="bottom">
              <AxisLabel />
              <AxisLine class="stroke-black" />
            </Axis>
            <Line dataKey="tea" class="text-emerald-500" stroke-width={2} />
            <Point dataKey="tea" class="text-emerald-600" r={3} />
            <SeriesLabel
              dataKey="tea"
              class="fill-emerald-700 text-[10px] font-medium"
            />
          </Chart>
        </Card>

        <Card title="Stepline + dashed">
          <Chart data={data}>
            <Axis axis="y" position="left" tickCount={4}>
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis dataKey="day" axis="x" position="bottom">
              <AxisLabel />
              <AxisLine class="stroke-black" />
            </Axis>
            <Line
              dataKey="coffee"
              curve={curveStepAfter}
              class="text-blue-600"
              stroke-width={2}
            />
            <Line
              dataKey="tea"
              class="text-amber-500"
              stroke-width={2}
              stroke-dasharray="6,4"
            />
          </Chart>
        </Card>

        <Card title="Gradient line + forecast tail">
          <Chart data={forecast}>
            <defs>
              <linearGradient id="grad-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#22c55e" />
                <stop offset="100%" stop-color="#3b82f6" />
              </linearGradient>
            </defs>
            <Axis axis="y" position="left" tickCount={4}>
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis dataKey="m" axis="x" position="bottom">
              <AxisLabel interval={1} />
              <AxisLine class="stroke-black" />
            </Axis>
            <Line dataKey="actual" stroke="url(#grad-line)" stroke-width={3} />
            <Line
              dataKey="projected"
              class="text-blue-400"
              stroke-width={3}
              stroke-dasharray="2,6"
              stroke-linecap="round"
            />
          </Chart>
        </Card>

        <Card title="Negative values (fill by value)">
          <Chart data={wave}>
            <Axis axis="y" position="left" tickCount={5}>
              <AxisLabel />
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis dataKey="m" axis="x" position="bottom">
              <AxisLine class="stroke-black/40" />
            </Axis>
            <ReferenceLine y={0} class="stroke-black/40" />
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
        </Card>

        <Card title="Annotations (reference line / area / dot)">
          <Chart data={series}>
            <Axis axis="y" position="left" tickCount={4} axisRange={[100, 240]}>
              <AxisLabel />
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis
              dataKey="t"
              axis="x"
              type="time"
              position="bottom"
              tickCount={6}
            >
              <AxisLabel format={monthLabel} />
              <AxisLine class="stroke-black" />
            </Axis>
            <ReferenceArea
              y1={150}
              y2={190}
              class="fill-amber-400"
              fill-opacity={0.15}
            />
            <ReferenceLine
              y={170}
              class="stroke-amber-500"
              stroke-dasharray="6,4"
              label="target"
              labelProps={{ class: 'fill-amber-600 text-[10px]' }}
            />
            <Line
              dataKey="price"
              curve={curveNatural}
              class="text-indigo-600"
              stroke-width={2}
            />
            <ReferenceDot
              x={series[8]!.t}
              y={series[8]!.price}
              r={5}
              class="fill-rose-500 stroke-white"
              stroke-width={2}
              label="peak"
              labelProps={{ class: 'fill-rose-600 text-[10px] font-medium' }}
            />
          </Chart>
        </Card>

        <Card title="Custom dots (render-prop)">
          <Chart data={data} inset={16}>
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
              class="text-violet-400"
              stroke-width={2}
            />
            <Point dataKey="coffee">
              {(d) => (
                <text
                  x={d.point[0]}
                  y={d.point[1]}
                  text-anchor="middle"
                  dominant-baseline="central"
                  font-size={d.active ? 20 : 15}
                >
                  {d.value > 60 ? '😀' : '😟'}
                </text>
              )}
            </Point>
          </Chart>
        </Card>

        <Card title="Custom / image tick labels (render-prop)">
          <Chart data={data} inset={{ top: 8, right: 8, bottom: 28, left: 8 }}>
            <Axis axis="y" position="left" tickCount={4}>
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis dataKey="day" axis="x" position="bottom">
              <AxisLabel>
                {(tick) => (
                  <g transform={`translate(${tick.x}, ${tick.y})`}>
                    <circle cy={2} r={7} class="fill-teal-500" />
                    <text
                      y={3}
                      text-anchor="middle"
                      class="fill-white text-[8px] font-bold"
                    >
                      {tick.label.replace('Day ', '')}
                    </text>
                  </g>
                )}
              </AxisLabel>
              <AxisLine class="stroke-black" />
            </Axis>
            <Line dataKey="tea" class="text-teal-600" stroke-width={2} />
          </Chart>
        </Card>

        <Card title="Biaxial (two value axes)">
          <Chart data={data}>
            <Legend class="text-xs" />
            <Axis axis="y" position="left" tickCount={4}>
              <AxisLabel class="fill-blue-600" />
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis axis="y" axisId="revenue" position="right" tickCount={4}>
              <AxisLabel class="fill-emerald-600" />
            </Axis>
            <Axis dataKey="day" axis="x" position="bottom">
              <AxisLabel />
              <AxisLine class="stroke-black" />
            </Axis>
            <Line
              dataKey="coffee"
              name="Coffee"
              class="text-blue-600"
              stroke-width={2}
            />
            <Line
              dataKey="revenue"
              name="Revenue"
              yAxisId="revenue"
              class="text-emerald-600"
              stroke-width={2}
            />
          </Chart>
        </Card>

        <Card title="Stacked Area + Legend (click to toggle)">
          <Chart data={data}>
            <Legend class="text-xs" />
            <Area
              dataKey="coffee"
              name="Coffee"
              stackId="s"
              class="text-blue-300"
            />
            <Area
              dataKey="tea"
              name="Tea"
              stackId="s"
              class="text-emerald-300"
            />
            <Line
              dataKey="coffee"
              stackId="s"
              class="text-blue-600"
              stroke-width={2}
            />
            <Line
              dataKey="tea"
              stackId="s"
              class="text-emerald-600"
              stroke-width={2}
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
        </Card>

        <Card title="Grouped Bars + Line overlay + Legend">
          <Chart data={data}>
            <Legend class="text-xs" />
            <Axis axis="y" position="left" tickCount={4}>
              <AxisLabel />
              <AxisGrid class="stroke-black/10" />
            </Axis>
            <Axis dataKey="day" axis="x" position="bottom">
              <AxisLabel />
              <AxisLine class="stroke-black" />
              <AxisMark class="stroke-black" />
            </Axis>
            <Bar dataKey="coffee" name="Coffee" class="text-blue-400" />
            <Bar dataKey="tea" name="Tea" class="text-emerald-400" />
            <Line dataKey="coffee" class="text-blue-700" stroke-width={3} />
          </Chart>
        </Card>

        <Card title="Curved area + value lines + gaps">
          <Chart data={data}>
            <Axis
              axis="y"
              position="right"
              axisRange={[0, 120]}
              tickValues={[0, 50, 90, 120]}
            >
              <AxisLabel />
              <AxisValueLine
                value={90}
                stroke-dasharray="8"
                class="text-amber-500"
              />
            </Axis>
            <Axis dataKey="day" axis="x" position="bottom">
              <AxisLabel />
              <AxisLine class="stroke-black" />
              <AxisCrosshair class="stroke-black/60 transition-opacity" />
            </Axis>
            <Area
              dataKey="nulls"
              curve={curveNatural}
              class="text-purple-200"
            />
            <Line
              dataKey="nulls"
              curve={curveNatural}
              class="text-purple-600"
              stroke-width={3}
            />
            <Point
              dataKey="nulls"
              class="text-purple-700 stroke-white"
              stroke-width={2}
              r={4}
            />
          </Chart>
        </Card>

        <Card title="Pie (slices register into the legend — click to toggle)">
          <Chart data={data}>
            <Legend class="text-xs" />
            <Pie
              dataKey="coffee"
              nameKey="day"
              padAngle={0.01}
              cornerRadius={2}
            />
          </Chart>
        </Card>

        <Card title="Donut">
          <Chart data={data}>
            <Legend class="text-xs" />
            <Pie
              dataKey="coffee"
              nameKey="day"
              innerRadius="60%"
              padAngle={0.015}
              cornerRadius={3}
            />
          </Chart>
        </Card>
      </div>
    </div>
  )
}
