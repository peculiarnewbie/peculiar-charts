import type { ChartContextType } from '@src/components/context'
import type { BarLayout } from '@src/lib/createBands'
import createScale from '@src/lib/createScale'
import { projectScale } from '@src/lib/scale'
import { axisValues } from '@src/lib/utils'
import { type Accessor, createMemo } from 'solid-js'

/**
 * Projects a series' data to `[x, y]` pixel coordinates. The category axis
 * position and value-axis position depend on `layout` — vertical bars use x
 * for categories and y for values; horizontal bars flip that.
 *
 * Non-finite values become `NaN` on the value axis so the shape layer can break.
 */
const createPoints = (props: {
  layout?: Accessor<BarLayout>
  xAxisId: Accessor<string>
  yAxisId: Accessor<string>
  dataKey: Accessor<string | undefined>
  stackId: Accessor<string | undefined>
  data: Accessor<number[]>
  chartContext: ChartContextType
}) => {
  const ctx = props.chartContext
  const layout = () => props.layout?.() ?? 'vertical'

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
    const horizontal = layout() === 'horizontal'

    const categoryValues = axisValues(
      ctx,
      horizontal ? props.yAxisId() : props.xAxisId(),
      horizontal ? 'y' : 'x',
    )
    const categoryScale = horizontal ? _yScale : _xScale
    const valueScale = horizontal ? _xScale : _yScale

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

      const category = projectScale(categoryScale, categoryValues[i])
      const val =
        typeof value === 'number' && Number.isFinite(value)
          ? projectScale(valueScale, stacked)
          : Number.NaN
      return [horizontal ? val : category, horizontal ? category : val] as [
        number,
        number,
      ]
    })
  })
}

export default createPoints
