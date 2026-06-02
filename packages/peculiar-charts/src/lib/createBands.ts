import type { ChartContextType } from '@src/components/context'
import { gapToPadding } from '@src/lib/utils'
import { scaleBand } from 'd3-scale'
import { type Accessor, createMemo } from 'solid-js'

/**
 * Per-datum `{ x, width }` rectangles for a bar series. Bars own their band
 * layout (independent of the x-axis scale): an outer band scale splits the plot
 * into one slot per datum, and an inner scale divides each slot between the
 * registered bar series so grouped bars sit side by side.
 */
const createBands = (props: {
  seriesId: string
  stackId: Accessor<string | undefined>
  data: Accessor<number[]>
  chartContext: ChartContextType
}) => {
  const ctx = props.chartContext
  return createMemo(() => {
    const data = props.data()

    const left = ctx.getInset('left')
    const right = ctx.width() - ctx.getInset('right')
    const chartWidth = right - left

    const barConfig = ctx.barConfig()
    const bandGap = gapToPadding(barConfig.bandGap, chartWidth / data.length)
    const barGap = gapToPadding(barConfig.barGap, chartWidth / data.length)

    const bandScale = scaleBand()
      .domain(Array(data.length).keys().map(String).toArray())
      .range([left, right])
      .paddingInner(bandGap)

    const bars = ctx.bars()
    const barGroupScale = scaleBand()
      .domain([...bars.values()])
      .range([0, bandScale.bandwidth()])
      .paddingInner(barGap)

    const barWidth = barGroupScale.bandwidth()
    const groupX = barGroupScale(String(props.stackId() ?? props.seriesId)) ?? 0

    return Array.from({ length: data.length }, (_, index) => ({
      x: (bandScale(String(index)) ?? 0) + groupX,
      width: barWidth,
    }))
  })
}

export default createBands
