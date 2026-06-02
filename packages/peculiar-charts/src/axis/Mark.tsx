import { useAxisContext } from '@src/axis/context'
import { useChartContext } from '@src/components/context'
import { projectScale } from '@src/lib/scale'
import type { OverrideProps } from '@src/lib/types'
import { type ComponentProps, For, mergeProps } from 'solid-js'

export type MarkProps = OverrideProps<
  Omit<ComponentProps<'line'>, 'x1' | 'y1' | 'x2' | 'y2'>,
  {
    /** Tick mark length in px. @defaultValue `6` */
    length?: number
  }
>

/** Tick marks between the plot and the axis labels.
 *
 * @data `data-pc-axis-mark-group` - Present on every mark group element.
 * @data `data-pc-axis-mark` - Present on every mark line element.
 */
const Mark = (props: MarkProps) => {
  const defaultedProps = mergeProps(
    { stroke: 'currentColor', 'stroke-width': 1, length: 6 },
    props,
  )
  const chartContext = useChartContext()
  const axisContext = useAxisContext()

  const pos = (tick: any) => projectScale(axisContext.scale(), tick)

  const x = (tick: any) => {
    switch (axisContext.position()) {
      case 'top':
      case 'bottom':
        return pos(tick)
      case 'left':
        return chartContext.getInset('left')
      case 'right':
        return chartContext.width() - chartContext.getInset('right')
    }
  }
  const y = (tick: any) => {
    switch (axisContext.position()) {
      case 'top':
        return chartContext.getInset('top')
      case 'bottom':
        return chartContext.height() - chartContext.getInset('bottom')
      case 'left':
      case 'right':
        return pos(tick)
    }
  }
  const x2 = (tick: any) => {
    switch (axisContext.position()) {
      case 'top':
      case 'bottom':
        return pos(tick)
      case 'left':
        return chartContext.getInset('left') - defaultedProps.length
      case 'right':
        return (
          chartContext.width() -
          chartContext.getInset('right') +
          defaultedProps.length
        )
    }
  }
  const y2 = (tick: any) => {
    switch (axisContext.position()) {
      case 'top':
        return chartContext.getInset('top') - defaultedProps.length
      case 'bottom':
        return (
          chartContext.height() -
          chartContext.getInset('bottom') +
          defaultedProps.length
        )
      case 'left':
      case 'right':
        return pos(tick)
    }
  }

  return (
    <g data-pc-axis-mark-group="">
      <For each={axisContext.labelTicks()}>
        {(tick) => (
          <line
            x1={x(tick)}
            y1={y(tick)}
            x2={x2(tick)}
            y2={y2(tick)}
            data-pc-axis-mark=""
            {...defaultedProps}
          />
        )}
      </For>
    </g>
  )
}

export default Mark
