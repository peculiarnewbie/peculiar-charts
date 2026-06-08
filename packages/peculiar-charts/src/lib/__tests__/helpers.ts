import type { ChartContextType } from '@src/components/context'
import { createSignal } from 'solid-js'

export const createMockChartContext = (
  overrides?: Partial<ChartContextType>,
): ChartContextType => {
  const [data, setData] = createSignal<any[]>([])
  const [width, setWidth] = createSignal(800)
  const [height, setHeight] = createSignal(400)
  const [seriesMeta, setSeriesMeta] = createSignal<any[]>([])
  const [hiddenSeries, setHiddenSeries] = createSignal(new Set<string>())
  const [stacks, setStacks] = createSignal(new Map())
  const [bars, setBars] = createSignal(new Set<string>())
  const [pointerPosition, setPointerPosition] = createSignal(null)
  const [syncInteraction, setSyncInteraction] = createSignal(null)
  const [brushRange, setBrushRange] = createSignal(null)

  const axisConfigs = new Map<string, any>()
  const extents = new Map<string, Map<string, { min: number; max: number }>>()

  return {
    data,
    displayedData: data,
    brushRange,
    setBrushRange,
    width,
    height,
    getInset: () => 0,
    registerInset: () => {},
    unregisterInset: () => {},
    registerAxisConfig: (axisId, config) => axisConfigs.set(axisId, config),
    unregisterAxisConfig: (axisId) => axisConfigs.delete(axisId),
    getAxisConfig: (axisId, orientation) =>
      axisConfigs.get(axisId) ?? {
        orientation,
        type: orientation === 'x' ? 'point' : 'linear',
        range: null,
        reverse: false,
      },
    registerExtent: (axisId, seriesId, extent) => {
      let axis = extents.get(axisId)
      if (!axis) {
        axis = new Map()
        extents.set(axisId, axis)
      }
      axis.set(seriesId, extent)
    },
    unregisterExtent: (axisId, seriesId) => {
      extents.get(axisId)?.delete(seriesId)
    },
    getDomain: (axisId, orientation) => {
      const config = axisConfigs.get(axisId)
      if (config?.type === 'band' || config?.type === 'point') {
        return { kind: 'categorical' as const, values: [] }
      }
      return { kind: 'numeric' as const, min: 0, max: 100, userDefined: false }
    },
    stacks,
    stackOffset: () => undefined,
    registerStack: () => {},
    unregisterStack: () => {},
    bars,
    registerBar: (key) => bars((prev) => new Set(prev).add(key)),
    unregisterBar: (key) =>
      bars((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      }),
    barConfig: () => ({ bandGap: '10%' as const, barGap: '10%' as const }),
    seriesMeta,
    registerSeriesMeta: () => {},
    unregisterSeriesMeta: () => {},
    isSeriesVisible: (id) => !hiddenSeries().has(id),
    toggleSeries: (id) =>
      setHiddenSeries((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      }),
    syncId: () => undefined,
    syncMethod: () => undefined,
    syncInteraction,
    setSyncInteraction,
    emitterSymbol: Symbol('test'),
    pointerPosition,
    pointerInChart: () => false,
    wrapperRef: () => null,
    toSvgPosition: (pos) => pos,
    toContainerPosition: (pos) => pos,
    ...overrides,
  }
}
