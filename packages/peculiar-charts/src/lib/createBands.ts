import type { ChartContextType } from '@src/components/context'
import { gapToPadding } from '@src/lib/utils'
import { scaleBand } from 'd3-scale'
import { type Accessor, createMemo } from 'solid-js'

export type BarLayout = 'vertical' | 'horizontal'

export type BarBand = { x: number; y: number; width: number; height: number }

/**
 * Per-datum bar slot rectangles. Bars own their band layout (independent of
 * the axis scale): an outer band scale splits the plot into one slot per
 * datum, and an inner scale divides each slot between registered bar series so
 * grouped bars sit side by side.
 */
const createBands = (props: {
  seriesId: string
  stackId: Accessor<string | undefined>
  data: Accessor<number[]>
  layout: Accessor<BarLayout>
  chartContext: ChartContextType
}) => {
  const ctx = props.chartContext
  return createMemo((): BarBand[] => {
    const data = props.data()
    const horizontal = props.layout() === 'horizontal'

    const left = ctx.getInset('left')
    const right = ctx.width() - ctx.getInset('right')
    const top = ctx.getInset('top')
    const bottom = ctx.height() - ctx.getInset('bottom')
    const plotWidth = right - left
    const plotHeight = bottom - top
    const plotSpan = horizontal ? plotHeight : plotWidth

    const barConfig = ctx.barConfig()
    const bandGap = gapToPadding(barConfig.bandGap, plotSpan / data.length)
    const barGap = gapToPadding(barConfig.barGap, plotSpan / data.length)

    const bandScale = scaleBand()
      .domain(Array(data.length).keys().map(String).toArray())
      .range(horizontal ? [top, bottom] : [left, right])
      .paddingInner(bandGap)
      .paddingOuter(bandGap / 2)

    const bars = ctx.bars()
    const barGroupScale = scaleBand()
      .domain([...bars.values()])
      .range([0, bandScale.bandwidth()])
      .paddingInner(barGap)

    const barThickness = barGroupScale.bandwidth()
    const groupOffset = barGroupScale(String(props.stackId() ?? props.seriesId)) ?? 0

    return Array.from({ length: data.length }, (_, index) => {
      const bandOffset = bandScale(String(index)) ?? 0
      if (horizontal) {
        return {
          x: 0,
          y: bandOffset + groupOffset,
          width: 0,
          height: barThickness,
        }
      }
      return {
        x: bandOffset + groupOffset,
        y: 0,
        width: barThickness,
        height: 0,
      }
    })
  })
}

export default createBands
