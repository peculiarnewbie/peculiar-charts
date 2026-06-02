import { combineStyle } from '@corvu/utils/dom'
import { useAxisContext } from '@src/axis/context'
import { useChartContext } from '@src/components/context'
import createClosestTick from '@src/lib/createClosestTick'
import createSize from '@src/lib/dom/createSize'
import { isNumeric } from '@src/lib/scale'
import type { OverrideProps } from '@src/lib/types'
import { axisValues } from '@src/lib/utils'
import {
  type ComponentProps,
  type JSX,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
} from 'solid-js'
import { Portal, isDev } from 'solid-js/web'

export type TooltipProps = OverrideProps<
  ComponentProps<'div'>,
  {
    /** Gap between the tick and the tooltip. @defaultValue `16` */
    tickGap?: number
    /** Gap between the pointer and the tooltip. @defaultValue `16` */
    pointerGap?: number
    /** Render the tooltip body from the closest tick's datum. */
    children: (props: { data: any }) => JSX.Element
  }
>

/** HTML tooltip positioned near the closest tick, Portaled out of the svg.
 *
 * @data `data-pc-axis-tooltip` - Present on every tooltip element.
 */
const Tooltip = (props: TooltipProps) => {
  const defaultedProps = mergeProps({ tickGap: 16, pointerGap: 16 }, props)
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'tickGap',
    'pointerGap',
    'children',
    'style',
  ])
  const chartContext = useChartContext()
  const axisContext = useAxisContext()

  if (
    isDev &&
    isNumeric(axisContext.scale().type) &&
    axisContext.axis() === 'y'
  ) {
    throw new Error(
      '[peculiar-charts] Tooltip can not be used with a numeric value axis',
    )
  }

  const [tooltipRef, setTooltipRef] = createSignal<HTMLDivElement | null>(null)
  const tooltipSize = createSize({ element: tooltipRef })

  const pointerPosition = createMemo<{ x: number; y: number } | undefined>(
    (prev) => chartContext.pointerPosition() ?? prev,
  )

  const closestTick = createClosestTick({
    axis: axisContext.axis,
    scale: axisContext.scale,
    values: () =>
      axisValues(chartContext, axisContext.axisId(), axisContext.axis()),
    chartContext,
  })

  const x = () => {
    const _pointerPosition = pointerPosition()
    const tick = closestTick()
    if (!_pointerPosition || !tick) return 0
    const _tooltipSize = tooltipSize()
    const containerWidth = chartContext.toContainerPosition(
      chartContext.width(),
      'width',
    )
    if (axisContext.axis() === 'x') {
      const tickPosition = chartContext.toContainerPosition(
        tick.position,
        'width',
      )
      const preferred = tickPosition + localProps.tickGap
      if (_tooltipSize && preferred + _tooltipSize[0] > containerWidth)
        return tickPosition - localProps.tickGap - _tooltipSize[0]
      return preferred
    }
    const preferred = _pointerPosition.x + localProps.pointerGap
    if (_tooltipSize && preferred + _tooltipSize[0] > containerWidth)
      return _pointerPosition.x - localProps.pointerGap - _tooltipSize[0]
    return preferred
  }

  const y = () => {
    const _pointerPosition = pointerPosition()
    const tick = closestTick()
    if (!_pointerPosition || !tick) return 0
    const _tooltipSize = tooltipSize()
    const containerHeight = chartContext.toContainerPosition(
      chartContext.height(),
      'height',
    )
    if (axisContext.axis() === 'y') {
      const tickPosition = chartContext.toContainerPosition(
        tick.position,
        'height',
      )
      const preferred = tickPosition + localProps.tickGap
      if (_tooltipSize && preferred + _tooltipSize[1] > containerHeight)
        return tickPosition - localProps.tickGap - _tooltipSize[1]
      return preferred
    }
    const preferred = _pointerPosition.y + localProps.pointerGap
    if (_tooltipSize && preferred + _tooltipSize[1] > containerHeight)
      return _pointerPosition.y - localProps.pointerGap - _tooltipSize[1]
    return preferred
  }

  return (
    <Portal mount={chartContext.wrapperRef() ?? undefined}>
      <div
        ref={setTooltipRef}
        style={combineStyle(
          {
            position: 'absolute',
            'pointer-events': 'none',
            top: 0,
            left: 0,
            opacity: chartContext.pointerInChart() ? 1 : 0,
            transform: `translate3d(${x()}px, ${y()}px, 0px)`,
          },
          localProps.style,
        )}
        data-pc-axis-tooltip=""
        {...otherProps}
      >
        {localProps.children({
          get data() {
            return chartContext.data()[closestTick()?.index ?? 0]
          },
        })}
      </div>
    </Portal>
  )
}

export default Tooltip
