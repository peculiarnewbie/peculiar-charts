import type { ChartContextType } from '@src/components/context'
import type { BarLayout } from '@src/lib/createBands'
import createScale from '@src/lib/createScale'
import { projectScale } from '@src/lib/scale'
import { type Accessor, createMemo } from 'solid-js'

/**
 * Baseline coordinate(s) for area/bar series. A plain series sits on the zero
 * line; a stacked series sits on top of the series below it in the stack.
 */
const createBaseLine = (props: {
  layout: Accessor<BarLayout>
  xAxisId: Accessor<string>
  yAxisId: Accessor<string>
  dataKey: Accessor<string | undefined>
  stackId: Accessor<string | undefined>
  data: Accessor<number[]>
  chartContext: ChartContextType
}) => {
  const ctx = props.chartContext
  const valueScale = createScale({
    axisId: () =>
      props.layout() === 'horizontal'
        ? props.xAxisId()
        : props.yAxisId(),
    orientation: () => (props.layout() === 'horizontal' ? 'x' : 'y'),
    chartContext: ctx,
  })

  return createMemo<number | number[]>(() => {
    const _scale = valueScale()
    const zero = projectScale(_scale, 0)

    const stackId = props.stackId()
    const stack = stackId !== undefined && ctx.stacks().get(stackId)
    if (!stack) return zero

    const stackDataKeys = [...stack.keys()]
    const thisIdx = stackDataKeys.indexOf(props.dataKey() ?? '')
    if (thisIdx <= 0) return zero

    const expand = ctx.stackOffset?.() === 'expand'

    return props.data().map((_, i) => {
      if (expand) {
        let total = 0
        for (const key of stackDataKeys)
          total += stack.get(key)?.values[i] ?? 0
        if (total === 0) return projectScale(_scale, 0)
        let baseLine = 0
        for (let s = 0; s < thisIdx; s++)
          baseLine += stack.get(stackDataKeys[s]!)?.values[i] ?? 0
        return projectScale(_scale, baseLine / total)
      }

      let baseLine = 0
      for (let s = 0; s < thisIdx; s++) {
        baseLine += stack.get(stackDataKeys[s]!)?.values[i] ?? 0
      }
      return projectScale(_scale, baseLine)
    })
  })
}

export default createBaseLine
