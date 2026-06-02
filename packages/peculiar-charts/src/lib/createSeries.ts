import type { ChartContextType } from '@src/components/context'
import { type Accessor, createEffect, onCleanup } from 'solid-js'

/**
 * Registers a series with the chart: its identity (for legends/tooltips), its
 * stack membership, and its value extent on the y-axis (stack-aware). When the
 * series is toggled off via the legend it withdraws its extent so the domain
 * recomputes without it.
 */
const createSeries = (props: {
  seriesId: string
  name: Accessor<string>
  type: string
  yAxisId: Accessor<string>
  dataKey: Accessor<string | undefined>
  stackId: Accessor<string | undefined>
  data: Accessor<number[]>
  chartContext: ChartContextType
}) => {
  const ctx = props.chartContext

  // identity
  createEffect(() => {
    ctx.registerSeriesMeta(props.seriesId, {
      name: props.name(),
      type: props.type,
    })
    onCleanup(() => ctx.unregisterSeriesMeta(props.seriesId))
  })

  // stack membership
  createEffect(() => {
    const stackId = props.stackId()
    if (!stackId || !ctx.isSeriesVisible(props.seriesId)) return
    ctx.registerStack(
      stackId,
      props.dataKey() ?? '',
      props.seriesId,
      props.data(),
    )
    onCleanup(() =>
      ctx.unregisterStack(stackId, props.dataKey() ?? '', props.seriesId),
    )
  })

  // value extent on the y-axis (stack-aware)
  createEffect(() => {
    if (!ctx.isSeriesVisible(props.seriesId)) return

    const stackId = props.stackId()
    const stack = stackId !== undefined && ctx.stacks().get(stackId)
    const data = props.data()

    const stackValues = stack
      ? [...stack.values()].flatMap((s) => s.values)
      : []
    const min = Math.min(...data, ...stackValues)

    let max: number | null = null
    if (stack) {
      const stackDataKeys = [...stack.keys()]
      for (let i = 0; i < data.length; i++) {
        let stacked = 0
        for (const key of stackDataKeys)
          stacked += stack.get(key)?.values[i] ?? 0
        max = Math.max(max ?? stacked, stacked)
      }
    }
    max = max ?? Math.max(...data)

    ctx.registerExtent(props.yAxisId(), props.seriesId, { min, max })
    onCleanup(() => ctx.unregisterExtent(props.yAxisId(), props.seriesId))
  })
}

export default createSeries
