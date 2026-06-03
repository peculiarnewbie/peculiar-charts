import { useChartContext } from '@src/components/context'
import createPoints from '@src/lib/createPoints'
import createSeries from '@src/lib/createSeries'
import type { DotRenderer, PointEvents } from '@src/lib/markers'
import type { OverrideProps } from '@src/lib/types'
import { accessData } from '@src/lib/utils'
import DotsLayer from '@src/series/Dots'
import Curve from '@src/shapes/Curve'
import type { CurveFactory } from 'd3-shape'
import {
  type ComponentProps,
  Show,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
} from 'solid-js'

export type LineProps = OverrideProps<
  Omit<ComponentProps<'path'>, 'd'>,
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
    /** d3 curve interpolation factory. */
    curve?: CurveFactory
    /** Connect across null/missing values. */
    connectNulls?: boolean
    /** Marker at every point. `true`/props-object/function — see {@link DotRenderer}. */
    dot?: DotRenderer
    /** Marker at the point nearest the pointer (hover highlight). */
    activeDot?: DotRenderer
  } & PointEvents
>

/** Line series.
 *
 * @data `data-pc-line` - Present on every line path element.
 */
const Line = (props: LineProps) => {
  const seriesId = createUniqueId()
  const defaultedProps = mergeProps(
    { xAxisId: 'x', yAxisId: 'y', stroke: 'currentColor', fill: 'none' },
    props,
  )
  const [localProps, eventProps, otherProps] = splitProps(
    defaultedProps,
    ['dataKey', 'name', 'xAxisId', 'yAxisId', 'stackId', 'dot', 'activeDot'],
    ['onPointClick', 'onPointEnter', 'onPointLeave'],
  )
  const chartContext = useChartContext()

  const data = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.dataKey),
  )

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? 'series',
    type: 'line',
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

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <Curve points={points()} data-pc-line="" {...otherProps} />
      <Show when={localProps.dot || localProps.activeDot}>
        <DotsLayer
          points={points}
          data={data}
          xAxisId={localProps.xAxisId}
          dot={localProps.dot}
          activeDot={localProps.activeDot}
          events={eventProps}
        />
      </Show>
    </Show>
  )
}

export default Line
