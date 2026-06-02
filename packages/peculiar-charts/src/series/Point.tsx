import { dataIf } from '@corvu/utils'
import { useChartContext } from '@src/components/context'
import createClosestTick from '@src/lib/createClosestTick'
import createPoints from '@src/lib/createPoints'
import createScale from '@src/lib/createScale'
import createSeries from '@src/lib/createSeries'
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

/** A point's pixel position plus the datum it came from. */
export type PointDatum = {
  point: [number, number]
  value: number
  index: number
  active: boolean
}

export type PointProps = OverrideProps<
  Omit<ComponentProps<'circle'>, 'cx' | 'cy'>,
  {
    /** Data key for the y-values. Omit for plain number arrays. */
    dataKey?: string
    /** Display name for legends/tooltips. @defaultValue `dataKey` */
    name?: string
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string
    /** Stack id — series sharing one stack are stacked. */
    stackId?: string
    /** `<circle>` props applied when the point is the active (hovered) one. */
    activeProps?: Omit<ComponentProps<'circle'>, 'cx' | 'cy'>
    /** Render a custom marker per point (e.g. an image or emoji) instead of a
     * `<circle>`. Receives the point's pixel position, value and active state. */
    children?: (datum: PointDatum) => JSX.Element
  }
>

/** Point (marker) series.
 *
 * @data `data-pc-point-group` - Present on every point group element.
 * @data `data-pc-point` - Present on every point circle element.
 */
const Point = (props: PointProps) => {
  const seriesId = createUniqueId()
  const defaultedProps = mergeProps(
    { xAxisId: 'x', yAxisId: 'y', r: 4, fill: 'currentColor' },
    props,
  )
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'dataKey',
    'name',
    'xAxisId',
    'yAxisId',
    'stackId',
    'activeProps',
    'children',
  ])
  const chartContext = useChartContext()

  const data = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.dataKey),
  )

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? 'series',
    type: 'point',
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  const points = createPoints({
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
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
      <g data-pc-point-group="">
        <For each={points().filter(pointDefined)}>
          {(point, index) => (
            <Show
              when={localProps.children}
              fallback={
                <circle
                  cx={point[0]}
                  cy={point[1]}
                  data-active={dataIf(isActive(index()))}
                  data-pc-point=""
                  {...circleProps(index())}
                />
              }
            >
              {(children) =>
                children()({
                  point,
                  value: data()[index()] as number,
                  index: index(),
                  active: isActive(index()),
                })
              }
            </Show>
          )}
        </For>
      </g>
    </Show>
  )
}

export default Point
