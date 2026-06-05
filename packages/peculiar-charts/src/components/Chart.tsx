import { combineStyle } from '@corvu/utils/dom'
import { mergeRefs } from '@corvu/utils/reactivity'
import {
  type AxisConfig,
  type AxisOrientation,
  type BarConfig,
  ChartContext,
  type Edge,
  type SeriesMeta,
  type StackEntry,
} from '@src/components/context'
import createSize from '@src/lib/dom/createSize'
import { paletteColor } from '@src/lib/palette'
import type { OverrideProps } from '@src/lib/types'
import { accessData, toNumeric, uniqueInOrder } from '@src/lib/utils'
import {
  type ComponentProps,
  type JSX,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
} from 'solid-js'

const DEFAULT_INSET = 8

export type ChartProps = OverrideProps<
  Omit<ComponentProps<'svg'>, 'viewBox'>,
  {
    /** Data array — either a flat array of numbers or an array of objects. */
    data: number[] | object[]
    /** viewBox width. `'responsive'` tracks the container. @defaultValue `'responsive'` */
    width?: 'responsive' | number
    /** viewBox height. `'responsive'` tracks the container. @defaultValue `'responsive'` */
    height?: 'responsive' | number
    /** Padding reserved inside the plot area. @defaultValue `8` */
    inset?:
      | number
      | { top?: number; right?: number; bottom?: number; left?: number }
    /** Global bar series configuration. */
    barConfig?: Partial<BarConfig>
    /** @hidden */
    children?: JSX.Element
  }
>

/**
 * Root svg element and context provider for a chart.
 *
 * @data `data-pc-chart` - Present on every chart svg element.
 * @data `data-pc-wrapper` - Present on every chart wrapper element.
 */
const Chart = (props: ChartProps) => {
  const defaultedProps = mergeProps(
    {
      width: 'responsive' as const,
      height: 'responsive' as const,
      inset: DEFAULT_INSET,
      barConfig: { bandGap: '10%', barGap: '10%' },
    },
    props,
  )

  const [localProps, otherProps] = splitProps(defaultedProps, [
    'data',
    'width',
    'height',
    'inset',
    'barConfig',
    'ref',
    'style',
  ])

  // --- insets -------------------------------------------------------------
  const [inset, setInset] = createSignal<Record<Edge, Map<string, number>>>({
    top: new Map(),
    right: new Map(),
    bottom: new Map(),
    left: new Map(),
  })

  // --- registries ---------------------------------------------------------
  const [axisConfigs, setAxisConfigs] = createSignal(
    new Map<string, AxisConfig>(),
  )
  const [extents, setExtents] = createSignal(
    new Map<string, Map<string, { min: number; max: number }>>(),
  )
  const [stacks, setStacks] = createSignal(
    new Map<string, Map<string, StackEntry>>(),
  )
  const [bars, setBars] = createSignal(new Set<string>())
  const [series, setSeries] = createSignal(
    new Map<
      string,
      {
        name: string
        type: string
        dataKey?: string
        order: number
        color?: string
      }
    >(),
  )
  const [hiddenSeries, setHiddenSeries] = createSignal(new Set<string>())
  let seriesOrder = 0

  // --- brush ---------------------------------------------------------------
  const [brushRange, setBrushRange] = createSignal<{
    startIndex: number
    endIndex: number
  } | null>(null)

  const displayedData = createMemo(() => {
    const range = brushRange()
    const d = localProps.data
    if (!range) return d
    return d.slice(range.startIndex, range.endIndex + 1)
  })

  const [pointerPosition, setPointerPosition] = createSignal<{
    x: number
    y: number
  } | null>(null)

  const [svgRef, setSvgRef] = createSignal<SVGElement | null>(null)
  const [wrapperRef, setWrapperRef] = createSignal<HTMLDivElement | null>(null)

  // --- size ---------------------------------------------------------------
  const containerSize = createSize({
    element: () => svgRef()?.parentElement ?? null,
  })

  createEffect(() => {
    const _inset = localProps.inset
    setInset((prev) => {
      const next = { ...prev }
      if (typeof _inset === 'number') {
        next.top.set('inset', _inset)
        next.right.set('inset', _inset)
        next.bottom.set('inset', _inset)
        next.left.set('inset', _inset)
      } else {
        next.top.set('inset', _inset.top ?? DEFAULT_INSET)
        next.right.set('inset', _inset.right ?? DEFAULT_INSET)
        next.bottom.set('inset', _inset.bottom ?? DEFAULT_INSET)
        next.left.set('inset', _inset.left ?? DEFAULT_INSET)
      }
      return next
    })
  })

  const resolveSize = (
    size: 'responsive' | number,
    dimension: 'width' | 'height',
  ) => {
    if (size === 'responsive') {
      const _containerSize = containerSize()
      if (!_containerSize) return 0
      return dimension === 'width' ? _containerSize[0] : _containerSize[1]
    }
    return size
  }

  const svgSize = createMemo(
    () =>
      [
        resolveSize(localProps.width, 'width'),
        resolveSize(localProps.height, 'height'),
      ] as [number, number],
  )

  const getInset = (edge: Edge, exclude?: string) => {
    let total = 0
    for (const [key, value] of inset()[edge]) {
      if (key === exclude) continue
      total += value
    }
    return total
  }

  const toSvgPosition = (position: number, dimension: 'width' | 'height') => {
    const _containerSize = containerSize()?.[dimension === 'width' ? 0 : 1]
    if (!_containerSize) return 0
    const _svgSize = svgSize()[dimension === 'width' ? 0 : 1]
    return (position / _containerSize) * _svgSize
  }

  const toContainerPosition = (
    position: number,
    dimension: 'width' | 'height',
  ) => {
    const _containerSize = containerSize()?.[dimension === 'width' ? 0 : 1]
    if (!_containerSize) return 0
    const _svgSize = svgSize()[dimension === 'width' ? 0 : 1]
    return (position / _svgSize) * _containerSize
  }

  const pointerInChart = createMemo(() => {
    const _pointerPosition = pointerPosition()
    if (!_pointerPosition) return false
    const left = getInset('left')
    const right = svgSize()[0] - getInset('right')
    const top = getInset('top')
    const bottom = svgSize()[1] - getInset('bottom')
    const x = toSvgPosition(_pointerPosition.x, 'width')
    const y = toSvgPosition(_pointerPosition.y, 'height')
    return x >= left && x <= right && y >= top && y <= bottom
  })

  // --- axis config + domain ----------------------------------------------
  const defaultAxisConfig = (orientation: AxisOrientation): AxisConfig => ({
    orientation,
    type:
      orientation === 'x' || orientation === 'angle' ? 'point' : 'linear',
    range: null,
    reverse: false,
  })

  const getAxisConfig = (axisId: string, orientation: AxisOrientation) =>
    axisConfigs().get(axisId) ?? defaultAxisConfig(orientation)

  const getDomain = (axisId: string, orientation: AxisOrientation) => {
    const config = getAxisConfig(axisId, orientation)

    if (config.type === 'band' || config.type === 'point') {
      const values = config.dataKey
        ? uniqueInOrder(accessData(localProps.data, config.dataKey))
        : Array.from({ length: localProps.data.length }, (_, i) => i)
      return { kind: 'categorical' as const, values }
    }

    let agg: { min: number; max: number }
    if (orientation === 'x') {
      const raw = config.dataKey
        ? accessData<unknown>(localProps.data, config.dataKey)
        : localProps.data.map((_, i) => i)
      const nums = raw.map(toNumeric).filter((n): n is number => n !== null)
      agg = nums.length
        ? { min: Math.min(...nums), max: Math.max(...nums) }
        : { min: 0, max: 0 }
    } else {
      // value axes (y / radius) aggregate registered series extents
      const axisExtents = extents().get(axisId)
      agg = axisExtents
        ? [...axisExtents.values()].reduce(
            (acc, e) => ({
              min: Math.min(acc.min, e.min),
              max: Math.max(acc.max, e.max),
            }),
            { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
          )
        : { min: 0, max: 0 }
    }

    const userMin = config.range?.[0]
    const userMax = config.range?.[1]
    return {
      kind: 'numeric' as const,
      min: typeof userMin === 'number' ? userMin : agg.min,
      max: typeof userMax === 'number' ? userMax : agg.max,
      userDefined: config.range !== null,
    }
  }

  const seriesMeta = createMemo<SeriesMeta[]>(() =>
    [...series().entries()]
      .map(([id, meta]) => ({
        id,
        name: meta.name,
        type: meta.type,
        dataKey: meta.dataKey,
        order: meta.order,
        color: meta.color ?? paletteColor(meta.order),
      }))
      .sort((a, b) => a.order - b.order),
  )

  return (
    <ChartContext.Provider
      value={{
        data: () => localProps.data,
        displayedData,
        brushRange,
        setBrushRange,
        width: () => svgSize()[0],
        height: () => svgSize()[1],
        getInset,
        registerInset: (edge, key, value) =>
          setInset((prev) => {
            prev[edge].set(key, value)
            return { ...prev }
          }),
        unregisterInset: (edge, key) =>
          setInset((prev) => {
            prev[edge].delete(key)
            return { ...prev }
          }),
        registerAxisConfig: (axisId, config) =>
          setAxisConfigs((prev) => new Map(prev).set(axisId, config)),
        unregisterAxisConfig: (axisId) =>
          setAxisConfigs((prev) => {
            const next = new Map(prev)
            next.delete(axisId)
            return next
          }),
        getAxisConfig,
        registerExtent: (axisId, seriesId, extent) =>
          setExtents((prev) => {
            const next = new Map(prev)
            const axis = new Map(next.get(axisId) ?? [])
            axis.set(seriesId, extent)
            next.set(axisId, axis)
            return next
          }),
        unregisterExtent: (axisId, seriesId) =>
          setExtents((prev) => {
            const axis = prev.get(axisId)
            if (!axis) return prev
            const next = new Map(prev)
            const nextAxis = new Map(axis)
            nextAxis.delete(seriesId)
            if (nextAxis.size === 0) next.delete(axisId)
            else next.set(axisId, nextAxis)
            return next
          }),
        getDomain,
        stacks,
        registerStack: (stackId, dataKey, seriesId, values) =>
          setStacks((prev) => {
            const stack = prev.get(stackId) ?? new Map<string, StackEntry>()
            const entry = stack.get(dataKey) ?? {
              seriesIds: new Set<string>(),
              values,
            }
            entry.seriesIds.add(seriesId)
            stack.set(dataKey, entry)
            prev.set(stackId, stack)
            return new Map(prev)
          }),
        unregisterStack: (stackId, dataKey, seriesId) =>
          setStacks((prev) => {
            const stack = prev.get(stackId)
            if (!stack) return prev
            const entry = stack.get(dataKey)
            if (!entry) return prev
            entry.seriesIds.delete(seriesId)
            if (entry.seriesIds.size === 0) stack.delete(dataKey)
            if (stack.size === 0) prev.delete(stackId)
            return new Map(prev)
          }),
        bars,
        registerBar: (key) => setBars((prev) => new Set(prev).add(key)),
        unregisterBar: (key) =>
          setBars((prev) => {
            const next = new Set(prev)
            next.delete(key)
            return next
          }),
        barConfig: () => localProps.barConfig as BarConfig,
        seriesMeta,
        registerSeriesMeta: (id, meta) =>
          setSeries((prev) => {
            const existing = prev.get(id)
            const order = existing?.order ?? seriesOrder++
            return new Map(prev).set(id, { ...meta, order })
          }),
        unregisterSeriesMeta: (id) =>
          setSeries((prev) => {
            const next = new Map(prev)
            next.delete(id)
            return next
          }),
        isSeriesVisible: (id) => !hiddenSeries().has(id),
        toggleSeries: (id) =>
          setHiddenSeries((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          }),
        pointerPosition,
        pointerInChart,
        wrapperRef,
        toSvgPosition,
        toContainerPosition,
      }}
    >
      <div
        ref={setWrapperRef}
        style={{ position: 'relative', width: '100%', height: '100%' }}
        data-pc-wrapper=""
      >
        <svg
          ref={mergeRefs(setSvgRef, localProps.ref)}
          style={combineStyle(
            { width: '100%', height: '100%' },
            localProps.style,
          )}
          viewBox={`0 0 ${svgSize()[0]} ${svgSize()[1]}`}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            setPointerPosition({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            })
          }}
          onMouseLeave={() => setPointerPosition(null)}
          data-pc-chart=""
          {...otherProps}
        >
          {props.children}
        </svg>
      </div>
    </ChartContext.Provider>
  )
}

export default Chart
