import { combineStyle } from '@corvu/utils/dom'
import { usePolarAxisContext } from '@src/axis/polar/context'
import { useChartContext } from '@src/components/context'
import createSize from '@src/lib/dom/createSize'
import createPolarClosestTick from '@src/lib/polar/createPolarClosestTick'
import { usePolarLayout } from '@src/lib/polar/context'
import { type PolarAngleScale } from '@src/lib/polar/scale'
import {
  type TooltipPayload,
  type TooltipRenderer,
  buildTooltipPayload,
  renderTooltipBody,
  resolveTooltipRenderer,
} from '@src/lib/tooltip'
import type { OverrideProps } from '@src/lib/types'
import { axisValues } from '@src/lib/utils'
import {
  type ComponentProps,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
} from 'solid-js'
import { Portal, isDev } from 'solid-js/web'

export type PolarTooltipProps = OverrideProps<
  ComponentProps<'div'>,
  {
    /** Gap between the pointer and the tooltip. @defaultValue `16` */
    pointerGap?: number
    content?: TooltipRenderer
    children?: TooltipRenderer
  }
>

export type { TooltipPayload, TooltipRenderer }

/** HTML tooltip for polar charts — snaps to the nearest category spoke.
 *
 * Place inside `<PolarAngleAxis>`. Uses the same payload shape as {@link AxisTooltip}.
 *
 * @data `data-pc-polar-tooltip` - Present on the tooltip element.
 */
const PolarTooltip = (props: PolarTooltipProps) => {
  const defaultedProps = mergeProps({ pointerGap: 16 }, props)
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'pointerGap',
    'content',
    'children',
    'style',
  ])
  const chartContext = useChartContext()
  const axisContext = usePolarAxisContext()
  const layout = usePolarLayout()
  const renderer = () =>
    resolveTooltipRenderer(localProps.content, localProps.children)

  if (isDev && axisContext.axis() === 'radius') {
    throw new Error(
      '[peculiar-charts] PolarTooltip must be used inside <PolarAngleAxis>',
    )
  }

  const [tooltipRef, setTooltipRef] = createSignal<HTMLDivElement | null>(null)
  const tooltipSize = createSize({ element: tooltipRef })

  const pointerPosition = createMemo<{ x: number; y: number } | undefined>(
    (prev) => chartContext.pointerPosition() ?? prev,
  )

  const closestTick = createPolarClosestTick({
    layout,
    scale: () => axisContext.scale() as PolarAngleScale,
    values: () =>
      axisValues(
        chartContext,
        axisContext.axisId(),
        axisContext.axis(),
      ),
    chartContext,
  })

  const payload = createMemo<TooltipPayload | undefined>(() => {
    const tick = closestTick()
    if (!tick) return undefined
    return buildTooltipPayload(
      chartContext,
      axisContext.axisId(),
      'angle',
      tick.index,
    )
  })

  const x = () => {
    const pointer = pointerPosition()
    if (!pointer) return 0
    const _tooltipSize = tooltipSize()
    const containerWidth = chartContext.toContainerPosition(
      chartContext.width(),
      'width',
    )
    const preferred = pointer.x + localProps.pointerGap
    if (_tooltipSize && preferred + _tooltipSize[0] > containerWidth)
      return pointer.x - localProps.pointerGap - _tooltipSize[0]
    return preferred
  }

  const y = () => {
    const pointer = pointerPosition()
    if (!pointer) return 0
    const _tooltipSize = tooltipSize()
    const containerHeight = chartContext.toContainerPosition(
      chartContext.height(),
      'height',
    )
    const preferred = pointer.y + localProps.pointerGap
    if (_tooltipSize && preferred + _tooltipSize[1] > containerHeight)
      return pointer.y - localProps.pointerGap - _tooltipSize[1]
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
        data-pc-polar-tooltip=""
        {...otherProps}
      >
        {(() => {
          const p = payload()
          return p ? renderTooltipBody(renderer(), p) : null
        })()}
      </div>
    </Portal>
  )
}

export default PolarTooltip
