import { dataIf } from '@corvu/utils'
import { useChartContext } from '@src/components/context'
import createClosestTick from '@src/lib/createClosestTick'
import createPoints from '@src/lib/createPoints'
import createScale from '@src/lib/createScale'
import createSeries from '@src/lib/createSeries'
import { type PointEvents, pointEvents } from '@src/lib/markers'
import type { OverrideProps } from '@src/lib/types'
import { accessData, axisValues, pointDefined } from '@src/lib/utils'
import {
  type ComponentProps,
  For,
  type JSX,
  Show,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
} from 'solid-js'

/** A bubble's pixel position and radius plus the datum it came from. */
export type BubbleDatum = {
  point: [number, number]
  /** The y-value. */
  value: number
  /** The size-value (z) before scaling. */
  size: number
  /** The mapped pixel radius. */
  radius: number
  index: number
  active: boolean
}

export type BubbleProps = OverrideProps<
  Omit<ComponentProps<'circle'>, 'cx' | 'cy' | 'r'>,
  {
    /** Data key for the y-values. Omit for plain number arrays. */
    dataKey?: string
    /** Data key for the size (z) values driving each bubble's radius. */
    sizeKey?: string
    /** `[minRadius, maxRadius]` in pixels. @defaultValue `[4, 24]` */
    sizeRange?: [number, number]
    /** Explicit `[min, max]` size domain. Defaults to the data extent. */
    sizeDomain?: [number, number]
    /** Display name for legends/tooltips. @defaultValue `dataKey` */
    name?: string
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string
    /** `<circle>` props applied when the bubble is the active (hovered) one. */
    activeProps?: Omit<ComponentProps<'circle'>, 'cx' | 'cy' | 'r'>
    /** Render a custom marker per bubble instead of a `<circle>`. */
    children?: (datum: BubbleDatum) => JSX.Element
  } & PointEvents
>

/** Maps a size value to a pixel radius so that bubble *area* is proportional to
 * the value (radius scales with the square root of the value). */
const sizeToRadius = (
  z: number,
  [zMin, zMax]: [number, number],
  [rMin, rMax]: [number, number],
): number => {
  if (!Number.isFinite(z)) return Number.NaN
  if (zMax === zMin) return rMax
  const t = (z - zMin) / (zMax - zMin)
  return Math.sqrt(rMin * rMin + t * (rMax * rMax - rMin * rMin))
}

/** Bubble (scatter with sized markers) series.
 *
 * @data `data-pc-bubble-group` - Present on the bubble group element.
 * @data `data-pc-bubble` - Present on every bubble circle element.
 */
const Bubble = (props: BubbleProps) => {
  const seriesId = createUniqueId()
  const defaultedProps = mergeProps(
    {
      xAxisId: 'x',
      yAxisId: 'y',
      sizeRange: [4, 24] as [number, number],
      fill: 'currentColor',
      'fill-opacity': 0.6,
    },
    props,
  )
  const [localProps, eventProps, otherProps] = splitProps(
    defaultedProps,
    [
      'dataKey',
      'sizeKey',
      'sizeRange',
      'sizeDomain',
      'name',
      'xAxisId',
      'yAxisId',
      'activeProps',
      'children',
    ],
    ['onPointClick', 'onPointEnter', 'onPointLeave'],
  )
  const chartContext = useChartContext()

  const data = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.dataKey),
  )
  const sizeData = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.sizeKey),
  )

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? 'series',
    type: 'bubble',
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => undefined,
    data,
    chartContext,
  })

  const points = createPoints({
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => undefined,
    data,
    chartContext,
  })

  const sizeDomain = createMemo<[number, number]>(() => {
    if (localProps.sizeDomain) return localProps.sizeDomain
    const nums = sizeData().filter((z) => Number.isFinite(z))
    return nums.length ? [Math.min(...nums), Math.max(...nums)] : [0, 1]
  })

  const radii = createMemo(() => {
    // No size key → uniform markers (a plain scatter), at the mid radius.
    if (localProps.sizeKey === undefined) {
      const [rMin, rMax] = localProps.sizeRange
      const r = (rMin + rMax) / 2
      return data().map(() => r)
    }
    return sizeData().map((z) =>
      sizeToRadius(z, sizeDomain(), localProps.sizeRange),
    )
  })

  const xScale = createScale({
    axisId: () => localProps.xAxisId,
    orientation: () => 'x',
    chartContext,
  })

  const closestTick = createClosestTick({
    axis: () => 'x',
    scale: xScale,
    values: () => axisValues(chartContext, localProps.xAxisId, 'x'),
    chartContext,
  })

  const isActive = (index: number) =>
    chartContext.pointerInChart() && closestTick()?.index === index

  const circleProps = (index: number) =>
    isActive(index)
      ? mergeProps(otherProps, localProps.activeProps)
      : otherProps

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <g data-pc-bubble-group="">
        <For each={points()}>
          {(point, index) => (
            <Show
              when={pointDefined(point) && Number.isFinite(radii()[index()])}
            >
              <Show
                when={localProps.children}
                fallback={
                  <circle
                    cx={point[0]}
                    cy={point[1]}
                    r={radii()[index()]}
                    data-active={dataIf(isActive(index()))}
                    data-pc-bubble=""
                    {...circleProps(index())}
                    {...pointEvents(eventProps, () => ({
                      value: data()[index()] as number,
                      index: index(),
                      point,
                    }))}
                  />
                }
              >
                {(children) =>
                  children()({
                    point,
                    value: data()[index()] as number,
                    size: sizeData()[index()] as number,
                    radius: radii()[index()]!,
                    index: index(),
                    active: isActive(index()),
                  })
                }
              </Show>
            </Show>
          )}
        </For>
      </g>
    </Show>
  )
}

export default Bubble
