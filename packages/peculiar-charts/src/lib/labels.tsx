import { type ComponentProps, type JSX, Show, mergeProps } from 'solid-js'

/** Anchor geometry for a value label and its connector line. */
export type LabelLineDatum = {
  /** Data point in svg coordinates. */
  point: [number, number]
  /** Label anchor in svg coordinates. */
  labelPoint: [number, number]
  value: number
  index: number
}

/** Props for the default connector `<line>`; endpoints are supplied. */
export type LabelLineProps = Omit<
  ComponentProps<'line'>,
  'x1' | 'y1' | 'x2' | 'y2'
>

/**
 * Renders a connector from a data point to its label — Recharts' `labelLine`:
 * - `true` — default `<line>`.
 * - props-object — merged onto the default `<line>`.
 * - function — full control; receives {@link LabelLineDatum}.
 */
export type LabelLineRenderer =
  | boolean
  | LabelLineProps
  | ((datum: LabelLineDatum) => JSX.Element)

/**
 * Renders a label connector from a {@link LabelLineRenderer}.
 *
 * @data `data-pc-label-line` - Present on every default connector line.
 */
export const LabelLine = (props: {
  renderer: LabelLineRenderer
  datum: LabelLineDatum
  defaults?: LabelLineProps
}) => {
  const { point, labelPoint } = props.datum
  return (
    <Show
      when={
        typeof props.renderer === 'function'
          ? (props.renderer as (d: LabelLineDatum) => JSX.Element)
          : null
      }
      fallback={
        <line
          x1={point[0]}
          y1={point[1]}
          x2={labelPoint[0]}
          y2={labelPoint[1]}
          data-pc-label-line=""
          {...mergeProps(
            {
              stroke: 'currentColor',
              'stroke-width': 1,
              fill: 'none',
            } as LabelLineProps,
            props.defaults,
            props.renderer === true ? {} : (props.renderer as LabelLineProps),
          )}
        />
      }
    >
      {(fn) => fn()(props.datum)}
    </Show>
  )
}
