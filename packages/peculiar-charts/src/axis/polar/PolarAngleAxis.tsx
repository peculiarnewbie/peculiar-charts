import { createWritableMemo } from '@solid-primitives/memo'
import { PolarAxisContext } from '@src/axis/polar/context'
import { useChartContext } from '@src/components/context'
import { usePolarLayout } from '@src/lib/polar/context'
import {
  createPolarAngleScale,
  polarScaleTicks,
} from '@src/lib/polar/scale'
import { polarToCartesian } from '@src/lib/polar/utils'
import type { OverrideProps } from '@src/lib/types'
import { type JSX, createEffect, mergeProps, onCleanup } from 'solid-js'

export type PolarAngleAxisProps = {
  /** Key to read category labels from the data. */
  dataKey?: string
  /** Axis id series bind to. @defaultValue `'angle'` */
  axisId?: string
  /** Target number of ticks. @defaultValue `5` */
  tickCount?: number
  /** Force specific tick values. */
  tickValues?: any[]
  children?: JSX.Element
}

/** Angular axis — evenly spaces categories around the polar frame. */
const PolarAngleAxis = (props: PolarAngleAxisProps) => {
  const defaultedProps = mergeProps(
    { axisId: 'angle', tickCount: 5 },
    props,
  )
  const chartContext = useChartContext()
  const layout = usePolarLayout()

  createEffect(() => {
    chartContext.registerAxisConfig(defaultedProps.axisId, {
      orientation: 'angle',
      type: 'point',
      dataKey: defaultedProps.dataKey,
      range: null,
      reverse: false,
    })
    onCleanup(() => chartContext.unregisterAxisConfig(defaultedProps.axisId))
  })

  const scale = createPolarAngleScale({
    axisId: () => defaultedProps.axisId,
    layout,
    chartContext,
  })

  const ticks = () => {
    const forced = defaultedProps.tickValues
    if (forced) return forced
    return polarScaleTicks(scale(), defaultedProps.tickCount)
  }

  const [labelTicks, setLabelTicks] = createWritableMemo(() => ticks())

  return (
    <PolarAxisContext.Provider
      value={{
        axisId: () => defaultedProps.axisId,
        axis: () => 'angle',
        scale,
        ticks,
        labelTicks,
        setLabelTicks,
      }}
    >
      {defaultedProps.children}
    </PolarAxisContext.Provider>
  )
}

export default PolarAngleAxis

export const polarAngleLabelPosition = (
  layout: ReturnType<typeof usePolarLayout>,
  angle: number,
  offset = 12,
) => {
  const r = layout.outerRadius() + offset
  return polarToCartesian(layout.cx(), layout.cy(), r, angle)
}
