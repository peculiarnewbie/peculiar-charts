import { createWritableMemo } from '@solid-primitives/memo'
import { AxisContext } from '@src/axis/context'
import { useChartContext } from '@src/components/context'
import createScale from '@src/lib/createScale'
import createTicks from '@src/lib/createTicks'
import type { ScaleType } from '@src/lib/scale'
import { type JSX, createEffect, mergeProps, onCleanup } from 'solid-js'

export type AxisProps = {
  /** Key to read categorical/x values from the data. Omit for plain arrays. */
  dataKey?: string
  /** Axis id series bind to. @defaultValue `'x'` for x, `'y'` for y */
  axisId?: string
  /** Scale type. @defaultValue `'point'` for x, `'linear'` for y */
  type?: ScaleType
  /** Target number of ticks. @defaultValue `5` */
  tickCount?: number
  /** Force specific tick values. */
  tickValues?: any[]
  /** Numeric domain override. @defaultValue `'auto'` */
  axisRange?: 'auto' | [number | 'min', number | 'max']
  /** Reverse the axis direction. */
  reverse?: boolean
  /** @hidden */
  children?: JSX.Element
} & (XAxisProps | YAxisProps)

export type XAxisProps = { axis: 'x'; position: 'top' | 'bottom' }
export type YAxisProps = { axis: 'y'; position: 'left' | 'right' }

export type { ScaleType }

/** Context provider + scale owner for a single axis. */
const Axis = (props: AxisProps) => {
  const defaultedProps = mergeProps(
    {
      type: props.axis === 'x' ? ('point' as const) : ('linear' as const),
      axisId: props.axis === 'x' ? 'x' : 'y',
      tickCount: 5,
      axisRange: 'auto' as const,
      reverse: false,
    },
    props,
  )
  const chartContext = useChartContext()

  createEffect(() => {
    chartContext.registerAxisConfig(defaultedProps.axisId, {
      orientation: defaultedProps.axis,
      type: defaultedProps.type,
      dataKey: defaultedProps.dataKey,
      range:
        defaultedProps.axisRange === 'auto' ? null : defaultedProps.axisRange,
      reverse: defaultedProps.reverse,
    })
    onCleanup(() => chartContext.unregisterAxisConfig(defaultedProps.axisId))
  })

  const scale = createScale({
    axisId: () => defaultedProps.axisId,
    orientation: () => defaultedProps.axis,
    chartContext,
  })

  const ticks = createTicks({
    scale,
    tickCount: () => defaultedProps.tickCount,
    tickValues: () => defaultedProps.tickValues,
  })

  const [labelTicks, setLabelTicks] = createWritableMemo(() => ticks())

  return (
    <AxisContext.Provider
      value={{
        axisId: () => defaultedProps.axisId,
        axis: () => defaultedProps.axis,
        position: () => defaultedProps.position,
        scale,
        ticks,
        labelTicks,
        setLabelTicks,
      }}
    >
      {defaultedProps.children}
    </AxisContext.Provider>
  )
}

export default Axis
