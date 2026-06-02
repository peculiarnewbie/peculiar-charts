import { useChartContext } from '@src/components/context'
import createScale from '@src/lib/createScale'
import { projectScale } from '@src/lib/scale'
import type { OverrideProps } from '@src/lib/types'
import {
  type ComponentProps,
  Show,
  createMemo,
  mergeProps,
  splitProps,
} from 'solid-js'

export type ReferenceDotProps = OverrideProps<
  Omit<ComponentProps<'circle'>, 'cx' | 'cy'>,
  {
    /** Value on the x-axis. */
    x: any
    /** Value on the y-axis. */
    y: number
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string
    /** Optional text label drawn next to the dot. */
    label?: string
    /** Props forwarded to the label `<text>`. */
    labelProps?: ComponentProps<'text'>
  }
>

/** A marker at a fixed (x, y) value, optionally labelled.
 *
 * @data `data-pc-reference-dot` - Present on the circle element.
 */
const ReferenceDot = (props: ReferenceDotProps) => {
  const defaultedProps = mergeProps(
    { xAxisId: 'x', yAxisId: 'y', r: 4, fill: 'currentColor' },
    props,
  )
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'x',
    'y',
    'xAxisId',
    'yAxisId',
    'label',
    'labelProps',
  ])
  const ctx = useChartContext()

  const xScale = createScale({
    axisId: () => localProps.xAxisId,
    orientation: () => 'x',
    chartContext: ctx,
  })
  const yScale = createScale({
    axisId: () => localProps.yAxisId,
    orientation: () => 'y',
    chartContext: ctx,
  })

  const geom = createMemo(() => ({
    cx: projectScale(xScale(), localProps.x),
    cy: projectScale(yScale(), localProps.y),
  }))

  return (
    <g data-pc-reference-dot-group="">
      <circle
        cx={geom().cx}
        cy={geom().cy}
        data-pc-reference-dot=""
        {...otherProps}
      />
      <Show when={localProps.label}>
        <text
          x={geom().cx}
          y={geom().cy}
          dx={8}
          dy={4}
          fill="currentColor"
          data-pc-reference-label=""
          {...localProps.labelProps}
        >
          {localProps.label}
        </text>
      </Show>
    </g>
  )
}

export default ReferenceDot
