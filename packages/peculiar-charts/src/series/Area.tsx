import { useChartContext } from '@src/components/context'
import createBaseLine from '@src/lib/createBaseLine'
import createPoints from '@src/lib/createPoints'
import createScale from '@src/lib/createScale'
import createSeries from '@src/lib/createSeries'
import { projectScale } from '@src/lib/scale'
import type { OverrideProps } from '@src/lib/types'
import { accessData } from '@src/lib/utils'
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

export type AreaProps = OverrideProps<
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
    /** Fill for the portion above the zero baseline. Enables fill-by-value
     * (the area is split at zero), overriding `fill`. */
    positiveFill?: string
    /** Fill for the portion below the zero baseline. Enables fill-by-value. */
    negativeFill?: string
  }
>

/** Area series.
 *
 * @data `data-pc-area` - Present on every area path element.
 */
const Area = (props: AreaProps) => {
  const seriesId = createUniqueId()
  const clipId = createUniqueId()
  const defaultedProps = mergeProps(
    { xAxisId: 'x', yAxisId: 'y', fill: 'currentColor', stroke: 'none' },
    props,
  )
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'dataKey',
    'name',
    'xAxisId',
    'yAxisId',
    'stackId',
    'positiveFill',
    'negativeFill',
  ])
  const chartContext = useChartContext()

  const data = createMemo(() =>
    accessData<number>(chartContext.data(), localProps.dataKey),
  )

  createSeries({
    seriesId,
    name: () => localProps.name ?? localProps.dataKey ?? 'series',
    type: 'area',
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

  const baseLine = createBaseLine({
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  })

  const fillByValue = () =>
    localProps.positiveFill !== undefined ||
    localProps.negativeFill !== undefined

  const yScale = createScale({
    axisId: () => localProps.yAxisId,
    orientation: () => 'y',
    chartContext,
  })
  const zeroY = () => projectScale(yScale(), 0)

  return (
    <Show when={chartContext.isSeriesVisible(seriesId)}>
      <Show
        when={fillByValue()}
        fallback={
          <Curve
            points={points()}
            baseLine={baseLine()}
            data-pc-area=""
            {...otherProps}
          />
        }
      >
        <defs>
          <clipPath id={`${clipId}-pos`}>
            <rect x={0} y={0} width={chartContext.width()} height={zeroY()} />
          </clipPath>
          <clipPath id={`${clipId}-neg`}>
            <rect
              x={0}
              y={zeroY()}
              width={chartContext.width()}
              height={Math.max(0, chartContext.height() - zeroY())}
            />
          </clipPath>
        </defs>
        <Curve
          points={points()}
          baseLine={zeroY()}
          data-pc-area=""
          {...otherProps}
          fill={localProps.positiveFill ?? 'none'}
          clip-path={`url(#${clipId}-pos)`}
        />
        <Curve
          points={points()}
          baseLine={zeroY()}
          data-pc-area=""
          {...otherProps}
          fill={localProps.negativeFill ?? 'none'}
          clip-path={`url(#${clipId}-neg)`}
        />
      </Show>
    </Show>
  )
}

export default Area
