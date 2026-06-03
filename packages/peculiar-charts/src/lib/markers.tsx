import { dataIf } from '@corvu/utils'
import { type ComponentProps, type JSX, Show, mergeProps } from 'solid-js'

/** A marker's pixel position plus the datum it represents. */
export type DotDatum = {
  point: [number, number]
  value: number
  index: number
  active: boolean
}

/** Props accepted by the default dot `<circle>`; its position is supplied. */
export type DotProps = Omit<ComponentProps<'circle'>, 'cx' | 'cy'>

/**
 * How to render a marker. Mirrors Recharts' normalised shape prop:
 * - `false` (or omitted) — no marker.
 * - `true` — the default `<circle>`.
 * - a partial-props object — merged onto the default `<circle>`.
 * - a function — full control; receives the {@link DotDatum}.
 */
export type DotRenderer =
  | boolean
  | DotProps
  | ((datum: DotDatum) => JSX.Element)

/** The datum handed to a per-point event handler. */
export type PointEventDatum = {
  /** The series value at this index. */
  value: number
  index: number
  point: [number, number]
}

export type PointEventHandler = (
  datum: PointEventDatum,
  event: MouseEvent,
) => void

/**
 * Per-datum event callbacks a series can accept. Unlike the raw SVG handlers
 * that ride through `{...otherProps}`, these carry the datum, not just the DOM
 * event.
 */
export type PointEvents = {
  /** Fired when a point/marker is clicked. */
  onPointClick?: PointEventHandler
  /** Fired when the pointer enters a point/marker. */
  onPointEnter?: PointEventHandler
  /** Fired when the pointer leaves a point/marker. */
  onPointLeave?: PointEventHandler
}

type PointEventAttrs = {
  onClick?: JSX.EventHandlerUnion<SVGElement, MouseEvent>
  onMouseEnter?: JSX.EventHandlerUnion<SVGElement, MouseEvent>
  onMouseLeave?: JSX.EventHandlerUnion<SVGElement, MouseEvent>
}

/**
 * Builds the DOM event-handler props for a per-datum element from the series'
 * {@link PointEvents}. Only the handlers the user provided are attached, so
 * spreading the result is a no-op when no callbacks are set. Spread it *after*
 * `{...otherProps}` — an `onPointClick` then takes precedence over a raw
 * `onClick` on the same element.
 */
export const pointEvents = (
  events: PointEvents,
  datum: () => PointEventDatum,
): PointEventAttrs => {
  const out: PointEventAttrs = {}
  if (events.onPointClick)
    out.onClick = (e: MouseEvent) => events.onPointClick?.(datum(), e)
  if (events.onPointEnter)
    out.onMouseEnter = (e: MouseEvent) => events.onPointEnter?.(datum(), e)
  if (events.onPointLeave)
    out.onMouseLeave = (e: MouseEvent) => events.onPointLeave?.(datum(), e)
  return out
}

/**
 * Renders a single marker from a {@link DotRenderer}. The default `<circle>`
 * carries `data-pc-dot` + `data-active`, the merged props, and any per-datum
 * event handlers. A function renderer takes over entirely (and wires its own
 * events).
 *
 * @data `data-pc-dot` - Present on every default dot circle.
 */
export const Dot = (props: {
  renderer: DotRenderer | undefined
  point: [number, number]
  value: number
  index: number
  active: boolean
  /** Defaults merged under a props-object renderer (e.g. series colour). */
  defaults?: DotProps
  events?: PointEvents
}) => {
  const datum = (): DotDatum => ({
    point: props.point,
    value: props.value,
    index: props.index,
    active: props.active,
  })
  return (
    <Show when={props.renderer !== undefined && props.renderer !== false}>
      <Show
        when={
          typeof props.renderer === 'function'
            ? (props.renderer as (d: DotDatum) => JSX.Element)
            : null
        }
        fallback={
          <circle
            cx={props.point[0]}
            cy={props.point[1]}
            data-pc-dot=""
            data-active={dataIf(props.active)}
            {...mergeProps(
              { r: 3, fill: 'currentColor' } as DotProps,
              props.defaults,
              props.renderer === true ? {} : (props.renderer as DotProps),
            )}
            {...(props.events
              ? pointEvents(props.events, () => ({
                  value: props.value,
                  index: props.index,
                  point: props.point,
                }))
              : {})}
          />
        }
      >
        {(fn) => fn()(datum())}
      </Show>
    </Show>
  )
}
