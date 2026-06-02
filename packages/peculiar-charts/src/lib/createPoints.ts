import type { ChartContextType } from '@src/components/context'
import createScale from '@src/lib/createScale'
import { projectScale } from '@src/lib/scale'
import { axisValues } from '@src/lib/utils'
import { type Accessor, createMemo } from 'solid-js'

/**
 * Projects a series' data to `[x, y]` pixel coordinates. The x position comes
 * from the bound x-axis scale (categorical or numeric), the y position from the
 * bound value-axis scale, with stacking applied when a `stackId` is set.
 *
 * Non-finite y values become `[x, NaN]` so the shape layer can break the line.
 */
const createPoints = (props: {
  xAxisId: Accessor<string>
  yAxisId: Accessor<string>
  dataKey: Accessor<string | undefined>
  stackId: Accessor<string | undefined>
  data: Accessor<number[]>
  chartContext: ChartContextType
}) => {
  const ctx = props.chartContext

  const xScale = createScale({
    axisId: props.xAxisId,
    orientation: () => 'x',
    chartContext: ctx,
  })
  const yScale = createScale({
    axisId: props.yAxisId,
    orientation: () => 'y',
    chartContext: ctx,
  })

  return createMemo(() => {
    const data = props.data()
    const _xScale = xScale()
    const _yScale = yScale()

    const xValues = axisValues(ctx, props.xAxisId(), 'x')

    const stackId = props.stackId()
    const stack = stackId !== undefined && ctx.stacks().get(stackId)

    return data.map((value, i) => {
      let stacked = value
      if (stack) {
        const stackDataKeys = [...stack.keys()]
        const thisIdx = stackDataKeys.indexOf(props.dataKey() ?? '')
        if (thisIdx > 0) {
          for (let s = 0; s < thisIdx; s++) {
            stacked += stack.get(stackDataKeys[s]!)?.values[i] || 0
          }
        }
      }

      const x = projectScale(_xScale, xValues[i])
      const y =
        typeof value === 'number' && Number.isFinite(value)
          ? projectScale(_yScale, stacked)
          : Number.NaN
      return [x, y] as [number, number]
    })
  })
}

export default createPoints
