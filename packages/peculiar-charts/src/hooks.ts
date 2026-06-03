import {
  type AxisOrientation,
  type Domain,
  useChartContext,
} from '@src/components/context'
import createScale from '@src/lib/createScale'
import type { Scale } from '@src/lib/scale'
import { axisValues } from '@src/lib/utils'
import { type Accessor, createMemo } from 'solid-js'

/**
 * The plot rectangle — the drawable area inside the axis insets, in SVG
 * coordinates. `x`/`y` are the top-left corner; `width`/`height` the extent.
 * The individual `left`/`right`/`top`/`bottom` insets are included for
 * convenience.
 */
export type PlotArea = {
  x: number
  y: number
  width: number
  height: number
  left: number
  right: number
  top: number
  bottom: number
}

/**
 * Reactive access to an axis scale, the same primitive `<Axis>` and every
 * series use internally — so an annotation drawn with it lands exactly where
 * the chart places its data.
 *
 * ```tsx
 * function Marker() {
 *   const x = useScale('x')
 *   const y = useScale('y')
 *   return <circle cx={projectScale(x(), 'Page A')} cy={projectScale(y(), 1500)} r={5} />
 * }
 * ```
 *
 * @param axisId Axis to read. Defaults to `'x'`/`'y'` based on `orientation`.
 * @param orientation `'x'` or `'y'`. @defaultValue `'x'`
 */
export const useScale = (
  axisId?: string,
  orientation: AxisOrientation = 'x',
): Accessor<Scale> => {
  const ctx = useChartContext()
  return createScale({
    axisId: () => axisId ?? orientation,
    orientation: () => orientation,
    chartContext: ctx,
  })
}

/** The x-axis scale. @param axisId @defaultValue `'x'` */
export const useXScale = (axisId = 'x'): Accessor<Scale> =>
  useScale(axisId, 'x')

/** The value-axis scale. @param axisId @defaultValue `'y'` */
export const useYScale = (axisId = 'y'): Accessor<Scale> =>
  useScale(axisId, 'y')

/** The resolved domain for an axis (categorical values or numeric min/max). */
export const useDomain = (
  axisId?: string,
  orientation: AxisOrientation = 'x',
): Accessor<Domain> => {
  const ctx = useChartContext()
  return createMemo(() => ctx.getDomain(axisId ?? orientation, orientation))
}

/**
 * The plot rectangle (drawable area inside the axis insets). Use it to size
 * full-bleed overlays, background bands, or to clamp custom drawing.
 */
export const usePlotArea = (): Accessor<PlotArea> => {
  const ctx = useChartContext()
  return createMemo(() => {
    const left = ctx.getInset('left')
    const right = ctx.getInset('right')
    const top = ctx.getInset('top')
    const bottom = ctx.getInset('bottom')
    return {
      x: left,
      y: top,
      width: Math.max(0, ctx.width() - left - right),
      height: Math.max(0, ctx.height() - top - bottom),
      left,
      right,
      top,
      bottom,
    }
  })
}

/** The chart's outer pixel size (the SVG viewport, insets included). */
export const useChartSize = (): Accessor<{ width: number; height: number }> => {
  const ctx = useChartContext()
  return createMemo(() => ({ width: ctx.width(), height: ctx.height() }))
}

/** The chart's data array. */
export const useData = <T = any>(): Accessor<T[]> => {
  const ctx = useChartContext()
  return ctx.data as Accessor<T[]>
}

/**
 * The per-datum domain values for an axis — the values read from the axis's
 * `dataKey`, or the data indices when no key is set. Pair with {@link useScale}
 * + `projectScale` to place a marker on every datum.
 */
export const useAxisValues = (
  axisId?: string,
  orientation: AxisOrientation = 'x',
): Accessor<any[]> => {
  const ctx = useChartContext()
  return createMemo(() => axisValues(ctx, axisId ?? orientation, orientation))
}
