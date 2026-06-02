import type { ChartContextType } from '@src/components/context'
import createScale from '@src/lib/createScale'
import { projectScale } from '@src/lib/scale'
import { type Accessor, createMemo } from 'solid-js'

/**
 * Baseline y-coordinate(s) for area/bar series. A plain series sits on the
 * zero line; a stacked series sits on top of the series below it in the stack.
 */
const createBaseLine = (props: {
  yAxisId: Accessor<string>
  dataKey: Accessor<string | undefined>
  stackId: Accessor<string | undefined>
  data: Accessor<number[]>
  chartContext: ChartContextType
}) => {
  const ctx = props.chartContext
  const yScale = createScale({
    axisId: props.yAxisId,
    orientation: () => 'y',
    chartContext: ctx,
  })

  return createMemo<number | number[]>(() => {
    const _yScale = yScale()
    const zero = projectScale(_yScale, 0)

    const stackId = props.stackId()
    const stack = stackId !== undefined && ctx.stacks().get(stackId)
    if (!stack) return zero

    const stackDataKeys = [...stack.keys()]
    const thisIdx = stackDataKeys.indexOf(props.dataKey() ?? '')
    if (thisIdx <= 0) return zero

    return props.data().map((_, i) => {
      let baseLine = 0
      for (let s = 0; s < thisIdx; s++) {
        baseLine += stack.get(stackDataKeys[s]!)?.values[i] ?? 0
      }
      return projectScale(_yScale, baseLine)
    })
  })
}

export default createBaseLine
