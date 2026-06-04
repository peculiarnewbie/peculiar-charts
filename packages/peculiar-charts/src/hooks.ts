import {
  type AxisOrientation,
  type Domain,
  useChartContext,
} from '@src/components/context'
import createScale from '@src/lib/createScale'
import createClosestTick from '@src/lib/createClosestTick'
import createPolarClosestTick, {
  type ClosestPolarTick,
} from '@src/lib/polar/createPolarClosestTick'
import { usePolarLayout } from '@src/lib/polar/context'
import {
  createPolarAngleScale,
  type PolarAngleScale,
} from '@src/lib/polar/scale'
import { type Scale, invertScale } from '@src/lib/scale'
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

/**
 * Maps a pixel position back to a domain value on an axis scale — the inverse
 * of `projectScale`. Returns an accessor that takes a pixel coordinate.
 *
 * ```tsx
 * const invertY = useInverseYScale()
 * const yValue = () => invertY(svgPointer()?.y ?? NaN)
 * ```
 */
export const useInverseScale = (
  axisId?: string,
  orientation: AxisOrientation = 'x',
): Accessor<(pixel: number) => any> => {
  const scale = useScale(axisId, orientation)
  return createMemo(() => {
    const s = scale()
    return (pixel: number) => invertScale(s, pixel)
  })
}

/** Pixel→data on the x-axis. @param axisId @defaultValue `'x'` */
export const useInverseXScale = (axisId = 'x'): Accessor<(pixel: number) => any> =>
  useInverseScale(axisId, 'x')

/** Pixel→data on the value axis. @param axisId @defaultValue `'y'` */
export const useInverseYScale = (axisId = 'y'): Accessor<(pixel: number) => any> =>
  useInverseScale(axisId, 'y')

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

/** Pointer position in container (HTML) coordinates, or `null` when outside. */
export const usePointerPosition = (): Accessor<{
  x: number
  y: number
} | null> => {
  const ctx = useChartContext()
  return ctx.pointerPosition
}

/** Whether the pointer is currently over the chart plot area. */
export const usePointerInChart = (): Accessor<boolean> => {
  const ctx = useChartContext()
  return ctx.pointerInChart
}

/** Pointer position converted to SVG coordinates. */
export const useSvgPointerPosition = (): Accessor<{
  x: number
  y: number
} | null> => {
  const ctx = useChartContext()
  return createMemo(() => {
    const pointer = ctx.pointerPosition()
    if (!pointer) return null
    return {
      x: ctx.toSvgPosition(pointer.x, 'width'),
      y: ctx.toSvgPosition(pointer.y, 'height'),
    }
  })
}

/**
 * The datum nearest the pointer along an axis — the same logic crosshairs and
 * tooltips use internally. Returns the datum index, its domain value, pixel
 * position, and the full data row.
 */
export type ClosestTick = {
  index: number
  value: any
  position: number
  datum: any
}

export type { ClosestPolarTick }

/**
 * The category spoke nearest the pointer on a polar angle axis — same logic
 * {@link PolarTooltip} and {@link PolarCrosshair} use internally.
 */
export const usePolarClosestTick = (
  angleAxisId = 'angle',
): Accessor<ClosestPolarTick | undefined> => {
  const ctx = useChartContext()
  const layout = usePolarLayout()
  const scale = createPolarAngleScale({
    axisId: () => angleAxisId,
    layout,
    chartContext: ctx,
  })
  const values = useAxisValues(angleAxisId, 'angle')
  const closest = createPolarClosestTick({
    layout,
    scale: () => scale() as PolarAngleScale,
    values,
    chartContext: ctx,
  })
  return createMemo(() => {
    const tick = closest()
    if (!tick) return undefined
    return {
      index: tick.index,
      value: values()[tick.index],
      angle: tick.angle,
      datum: ctx.data()[tick.index],
    }
  })
}

export const useClosestTick = (
  axisId?: string,
  orientation: 'x' | 'y' = 'x',
): Accessor<ClosestTick | undefined> => {
  const ctx = useChartContext()
  const scale = useScale(axisId, orientation)
  const values = useAxisValues(axisId, orientation)
  const closest = createClosestTick({
    axis: () => orientation,
    scale,
    values,
    chartContext: ctx,
  })
  return createMemo(() => {
    const tick = closest()
    if (!tick) return undefined
    const rows = ctx.data()
    return {
      index: tick.index,
      value: values()[tick.index],
      position: tick.position,
      datum: rows[tick.index],
    }
  })
}
