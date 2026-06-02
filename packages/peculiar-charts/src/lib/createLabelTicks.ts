import type { AxisContextType } from '@src/axis/context'
import type { ChartContextType } from '@src/components/context'
import { type Scale, projectScale } from '@src/lib/scale'
import { type Accessor, createEffect } from 'solid-js'

/**
 * Filters axis ticks down to the labels that actually fit without overlapping,
 * honouring the `interval` strategy. The surviving set is published to the axis
 * context so Label/Grid/Mark all render the same ticks.
 */
const createLabelTicks = (props: {
  ticks: Accessor<any[]>
  interval: Accessor<
    'preserveStart' | 'preserveEnd' | 'preserveStartEnd' | number
  >
  labelGap: Accessor<number>
  format: Accessor<(value: any) => string>
  averageCharSize: Accessor<{ x: number; y: number }>
  chartContext: ChartContextType
  axisContext: AxisContextType
}) => {
  createEffect(() => {
    const scale = props.axisContext.scale()
    const interval = props.interval()

    if (typeof interval === 'number') {
      props.axisContext.setLabelTicks(
        props.ticks().filter((_, i) => i % interval === 0),
      )
      return
    }

    const axis = props.axisContext.axis()
    const chartSize =
      axis === 'x' ? props.chartContext.width() : props.chartContext.height()

    switch (interval) {
      case 'preserveStart': {
        const sign = axis === 'x' ? 1 : -1
        props.axisContext.setLabelTicks(
          calculateLabelTicks(
            props.ticks(),
            sign,
            chartSize,
            props.averageCharSize(),
            axis,
            props.labelGap(),
            props.format(),
            scale,
          ),
        )
        break
      }
      case 'preserveEnd': {
        const sign = axis === 'x' ? -1 : 1
        props.axisContext.setLabelTicks(
          calculateLabelTicks(
            [...props.ticks()].reverse(),
            sign,
            chartSize,
            props.averageCharSize(),
            axis,
            props.labelGap(),
            props.format(),
            scale,
          ).reverse(),
        )
        break
      }
      case 'preserveStartEnd': {
        const sign = axis === 'x' ? -1 : 1
        const ticks = [...props.ticks()].reverse()
        const firstTick = ticks[ticks.length - 1]!
        const size =
          props.averageCharSize()[axis] *
          (axis === 'x' ? props.format()(firstTick).length : 1)
        const tickPosition = projectScale(scale, firstTick)
        const start = tickPosition - size / 2
        let end = tickPosition + size / 2
        if (axis === 'x' && start < 0) end = size

        const visible = calculateLabelTicks(
          ticks.slice(0, -1),
          sign,
          chartSize,
          props.averageCharSize(),
          axis,
          props.labelGap(),
          props.format(),
          scale,
          end + props.labelGap(),
        )
        props.axisContext.setLabelTicks([...visible, firstTick].reverse())
        break
      }
    }
  })
}

const calculateLabelTicks = (
  ticks: any[],
  sign: number,
  chartSize: number,
  averageCharSize: { x: number; y: number },
  axis: 'x' | 'y',
  labelGap: number,
  format: (value: any) => string,
  scale: Scale,
  fixedStart?: number,
) => {
  const visible: any[] = []
  let lastPosition =
    sign > 0 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY

  for (const tick of ticks) {
    const size =
      averageCharSize[axis] * (axis === 'x' ? format(tick).length : 1)
    const tickPosition = projectScale(scale, tick)
    let start = tickPosition - size / 2
    let end = tickPosition + size / 2

    if (axis === 'x') {
      if (start < 0) {
        start = 0
        end = start + size
      } else if (end > chartSize) {
        end = chartSize
        start = end - size
      }
    }

    const hasGap =
      sign > 0
        ? start >= lastPosition + labelGap
        : end <= lastPosition - labelGap

    if ((!fixedStart || start >= fixedStart) && hasGap && end <= chartSize) {
      visible.push(tick)
      lastPosition = sign > 0 ? end : start
    }
  }
  return visible
}

export default createLabelTicks
