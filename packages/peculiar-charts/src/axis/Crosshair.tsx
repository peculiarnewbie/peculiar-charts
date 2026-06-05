import { useAxisContext } from '@src/axis/context'
import { useChartContext } from '@src/components/context'
import createClosestTick from '@src/lib/createClosestTick'
import { isNumeric } from '@src/lib/scale'
import { axisValues } from '@src/lib/utils'
import { type ComponentProps, mergeProps } from 'solid-js'
import { isDev } from 'solid-js/web'

export type CrosshairProps = Omit<
  ComponentProps<'line'>,
  'x1' | 'y1' | 'x2' | 'y2'
>

/** Guide line following the closest tick to the pointer.
 *
 * @data `data-pc-axis-crosshair` - Present on every crosshair line element.
 */
const Crosshair = (props: CrosshairProps) => {
  const chartContext = useChartContext()
  const axisContext = useAxisContext()

  // Numeric x snaps to the nearest datum, which is fine; a numeric *value* axis
  // has no discrete data positions to snap to, so it stays disallowed.
  if (
    isDev &&
    isNumeric(axisContext.scale().type) &&
    axisContext.axis() === 'y'
  ) {
    throw new Error(
      '[peculiar-charts] Crosshair can not be used with a numeric value axis',
    )
  }

  const defaultedProps = mergeProps(
    { stroke: 'currentColor', 'stroke-width': 1 },
    props,
  )

  const closestTick = createClosestTick({
    axis: axisContext.axis,
    scale: axisContext.scale,
    values: () =>
      axisValues(chartContext, axisContext.axisId(), axisContext.axis()),
    chartContext,
  })

  const x = () => {
    const tick = closestTick()
    if (!tick) return undefined
    return axisContext.axis() === 'x'
      ? tick.position
      : chartContext.getInset('left')
  }
  const y = () => {
    const tick = closestTick()
    if (!tick) return undefined
    return axisContext.axis() === 'x'
      ? chartContext.getInset('top')
      : tick.position
  }
  const x2 = () => {
    const tick = closestTick()
    if (!tick) return undefined
    return axisContext.axis() === 'x'
      ? tick.position
      : chartContext.width() - chartContext.getInset('right')
  }
  const y2 = () => {
    const tick = closestTick()
    if (!tick) return undefined
    return axisContext.axis() === 'x'
      ? chartContext.height() - chartContext.getInset('bottom')
      : tick.position
  }

  return (
    <line
      x1={x()}
      y1={y()}
      x2={x2()}
      y2={y2()}
      opacity={
        chartContext.pointerInChart() || chartContext.syncInteraction()?.active
          ? 1
          : 0
      }
      data-pc-axis-crosshair=""
      {...defaultedProps}
    />
  )
}

export default Crosshair
