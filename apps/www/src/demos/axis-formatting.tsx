import {
  Area,
  Axis,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisTooltip,
  Chart,
  Line,
} from 'peculiar-charts'
import { curveNatural } from 'peculiar-charts/curves'

const revenue = [
  { quarter: 1, value: 84000 },
  { quarter: 2, value: 112000 },
  { quarter: 3, value: 96000 },
  { quarter: 4, value: 138000 },
]

const formatCurrency = (value: number) => `$${Math.round(value / 1000)}k`
const formatQuarter = (value: number) => `Q${value}`

export default function AxisFormatting() {
  return (
    <Chart<typeof revenue> data={revenue}>
      <Axis
        axis="y"
        position="left"
        tickCount={4}
        tickFormatter={formatCurrency}
      >
        <AxisLabel />
        <AxisGrid class="stroke-black/10" />
      </Axis>
      <Axis
        dataKey="quarter"
        axis="x"
        type="linear"
        position="bottom"
        tickValues={[1, 2, 3, 4]}
        tickFormatter={formatQuarter}
      >
        <AxisLabel />
        <AxisLine class="stroke-black" />
        <AxisTooltip class="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-lg">
          {(p) => {
            const row = p.data as (typeof revenue)[number]
            return (
              <span>
                {formatQuarter(row.quarter)}:{' '}
                <b>{formatCurrency(row.value)}</b>
              </span>
            )
          }}
        </AxisTooltip>
      </Axis>
      <Area
        dataKey="value"
        curve={curveNatural}
        class="text-indigo-200"
        color="#c7d2fe"
      />
      <Line
        dataKey="value"
        curve={curveNatural}
        class="text-indigo-600"
        color="#4f46e5"
        stroke-width={2}
      />
    </Chart>
  )
}
