import type { ScaleType } from '@src/lib/scale'
import { type Accessor, createContext, useContext } from 'solid-js'

export type Edge = 'top' | 'right' | 'bottom' | 'left'
export type AxisOrientation = 'x' | 'y'

/**
 * Resolved configuration for a single axis. Registered by `<Axis>`; a default
 * is synthesised (see {@link ChartContextType.getAxisConfig}) when a series
 * references an axis id that has no `<Axis>` rendered.
 */
export type AxisConfig = {
  orientation: AxisOrientation
  type: ScaleType
  /** Key used to read categorical values / x-values from the chart data. */
  dataKey?: string
  /** User-forced numeric domain, `'min'`/`'max'` keep the data-derived bound. */
  range: [number | 'min', number | 'max'] | null
  reverse: boolean
}

export type BarConfig = {
  bandGap: number | `${number}%`
  barGap: number | `${number}%`
  barSize?: number | `${number}%`
  maxBarSize?: number | `${number}%`
}

/** Domain summary for an axis, discriminated by whether it is categorical. */
export type Domain =
  | { kind: 'categorical'; values: any[] }
  | { kind: 'numeric'; min: number; max: number; userDefined: boolean }

/** Identity record every series registers, powering legends and tooltips. */
export type SeriesMeta = {
  id: string
  name: string
  type: string
  /** Palette colour assigned by registration order. */
  color: string
  order: number
}

export type StackEntry = { seriesIds: Set<string>; values: number[] }

export type ChartContextType = {
  data: Accessor<any[]>
  width: Accessor<number>
  height: Accessor<number>

  // --- plot rect / insets -------------------------------------------------
  getInset: (edge: Edge, exclude?: string) => number
  registerInset: (edge: Edge, key: string, value: number) => void
  unregisterInset: (edge: Edge, key: string) => void

  // --- axis configuration -------------------------------------------------
  registerAxisConfig: (axisId: string, config: AxisConfig) => void
  unregisterAxisConfig: (axisId: string) => void
  /**
   * Returns the registered config for `axisId`, or a default derived from
   * `orientation` (`point` for x, `linear` for y) when none is registered.
   */
  getAxisConfig: (axisId: string, orientation: AxisOrientation) => AxisConfig

  // --- numeric extent registry (per axis, per series) ---------------------
  registerExtent: (
    axisId: string,
    seriesId: string,
    extent: { min: number; max: number },
  ) => void
  unregisterExtent: (axisId: string, seriesId: string) => void
  getDomain: (axisId: string, orientation: AxisOrientation) => Domain

  // --- stacks -------------------------------------------------------------
  stacks: Accessor<Map<string, Map<string, StackEntry>>>
  registerStack: (
    stackId: string,
    dataKey: string,
    seriesId: string,
    values: number[],
  ) => void
  unregisterStack: (stackId: string, dataKey: string, seriesId: string) => void

  // --- bars ---------------------------------------------------------------
  bars: Accessor<Set<string>>
  registerBar: (key: string) => void
  unregisterBar: (key: string) => void
  barConfig: Accessor<BarConfig>

  // --- series identity ----------------------------------------------------
  seriesMeta: Accessor<SeriesMeta[]>
  registerSeriesMeta: (id: string, meta: { name: string; type: string }) => void
  unregisterSeriesMeta: (id: string) => void
  isSeriesVisible: (id: string) => boolean
  toggleSeries: (id: string) => void

  // --- pointer ------------------------------------------------------------
  pointerPosition: Accessor<{ x: number; y: number } | null>
  pointerInChart: Accessor<boolean>
  wrapperRef: Accessor<HTMLDivElement | null>

  // --- coordinate conversions --------------------------------------------
  toSvgPosition: (position: number, dimension: 'width' | 'height') => number
  toContainerPosition: (
    position: number,
    dimension: 'width' | 'height',
  ) => number
}

export const ChartContext = createContext<ChartContextType>()

export const useChartContext = () => {
  const context = useContext(ChartContext)
  if (!context) {
    throw new Error(
      '[peculiar-charts]: Chart context not found. Make sure to wrap chart components in <Chart>',
    )
  }
  return context
}
