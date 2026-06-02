import { useAxisContext } from '@src/axis/context'
import { useChartContext } from '@src/components/context'
import createLabelTicks from '@src/lib/createLabelTicks'
import { getAverageCharSize } from '@src/lib/dom/charSize'
import createSvgSize from '@src/lib/dom/createSvgSize'
import { projectScale } from '@src/lib/scale'
import type { OverrideProps } from '@src/lib/types'
import {
  type ComponentProps,
  For,
  type JSX,
  Show,
  createEffect,
  createSignal,
  createUniqueId,
  mergeProps,
  splitProps,
} from 'solid-js'

/** A resolved tick passed to a custom label renderer. */
export type LabelTick = {
  /** Raw tick value. */
  value: any
  /** Formatted label string. */
  label: string
  /** Pixel x of the tick. */
  x: number
  /** Pixel y of the tick. */
  y: number
}

export type LabelProps = OverrideProps<
  Omit<ComponentProps<'text'>, 'x' | 'y'>,
  {
    /** Format a tick value to its label string. @defaultValue `String` */
    format?: (value: any) => string
    /** Label thinning strategy. @defaultValue `'preserveEnd'` */
    interval?: 'preserveStart' | 'preserveEnd' | 'preserveStartEnd' | number
    /** Minimum gap between labels in px. @defaultValue `16` */
    labelGap?: number
    /** Render each tick yourself (e.g. an `<image>` or styled markup) instead
     * of the default `<text>`. Receives the tick value, label and position. */
    children?: (tick: LabelTick) => JSX.Element
  }
>

/** Axis tick labels.
 *
 * @data `data-pc-axis-label-group` - Present on every label group element.
 * @data `data-pc-axis-label` - Present on every label text element.
 */
const Label = (props: LabelProps) => {
  const chartContext = useChartContext()
  const axisContext = useAxisContext()

  const defaultedProps = mergeProps(
    {
      format: (value: any) => String(value),
      interval: 'preserveEnd' as const,
      labelGap: 16,
      fill: 'currentColor',
      'text-anchor':
        axisContext.position() === 'left'
          ? ('end' as const)
          : axisContext.position() === 'right'
            ? ('start' as const)
            : ('middle' as const),
      'dominant-baseline':
        axisContext.axis() === 'y' ? ('central' as const) : undefined,
      dx:
        axisContext.position() === 'left'
          ? '-0.5em'
          : axisContext.position() === 'right'
            ? '0.5em'
            : undefined,
      dy: axisContext.position() === 'bottom' ? '0.3em' : undefined,
    },
    props,
  )
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'format',
    'interval',
    'labelGap',
    'children',
  ])

  const [labelGroupRef, setLabelGroupRef] = createSignal<SVGGElement | null>(
    null,
  )

  createSvgSize({
    element: labelGroupRef,
    dimension: () => (axisContext.axis() === 'x' ? 'height' : 'width'),
    onSizeChange: (size: number) =>
      chartContext.registerInset(
        axisContext.position(),
        'axis.label',
        chartContext.toSvgPosition(
          size,
          axisContext.axis() === 'x' ? 'height' : 'width',
        ),
      ),
    onCleanup: () =>
      chartContext.unregisterInset(axisContext.position(), 'axis.label'),
  })

  const labelAxisId = createUniqueId()

  // DOM measurement can't run inside a memo in Solid, so mirror into a signal.
  const [averageCharSize, setAverageCharSize] = createSignal({ x: 0, y: 0 })
  createEffect(() => {
    const ref = labelGroupRef()
    if (!ref) return
    setAverageCharSize(getAverageCharSize(ref, otherProps, labelAxisId))
  })

  createLabelTicks({
    ticks: axisContext.ticks,
    interval: () => localProps.interval,
    labelGap: () => localProps.labelGap,
    format: () => localProps.format,
    averageCharSize,
    chartContext,
    axisContext,
  })

  const x = (tick: any) => {
    switch (axisContext.position()) {
      case 'top':
      case 'bottom': {
        const tickPosition = projectScale(axisContext.scale(), tick)
        const size = averageCharSize().x * localProps.format(tick).length
        const start = tickPosition - size / 2
        const end = tickPosition + size / 2
        if (start < 0) return tickPosition - start
        if (end > chartContext.width())
          return tickPosition - (end - chartContext.width())
        return tickPosition
      }
      case 'left':
        return chartContext.getInset('left')
      case 'right':
        return chartContext.width() - chartContext.getInset('right')
    }
  }

  const y = (tick: any) => {
    switch (axisContext.position()) {
      case 'top':
        return chartContext.getInset('top', 'axis.label')
      case 'bottom':
        return (
          chartContext.height() - chartContext.getInset('bottom', 'axis.label')
        )
      case 'left':
      case 'right':
        return projectScale(axisContext.scale(), tick)
    }
  }

  return (
    <g ref={setLabelGroupRef} data-pc-axis-label-group="">
      <For each={axisContext.labelTicks()}>
        {(tick) => (
          <Show
            when={localProps.children}
            fallback={
              <text
                x={x(tick)}
                y={y(tick)}
                data-pc-axis-label=""
                {...otherProps}
              >
                {localProps.format(tick)}
              </text>
            }
          >
            {(children) =>
              children()({
                value: tick,
                label: localProps.format(tick),
                x: x(tick) ?? 0,
                y: y(tick) ?? 0,
              })
            }
          </Show>
        )}
      </For>
    </g>
  )
}

export default Label
