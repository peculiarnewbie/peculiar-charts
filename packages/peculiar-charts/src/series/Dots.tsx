import { useChartContext } from '@src/components/context'
import createClosestTick from '@src/lib/createClosestTick'
import createScale from '@src/lib/createScale'
import { Dot, type DotRenderer, type PointEvents } from '@src/lib/markers'
import { axisValues, pointDefined } from '@src/lib/utils'
import { type Accessor, For, Show } from 'solid-js'

/**
 * Overlays markers on a line/area series: a `dot` at every point, and an
 * `activeDot` at the point nearest the pointer. Self-contained — it resolves
 * the active index from the x-axis scale itself, the same way crosshairs and
 * tooltips do.
 *
 * @data `data-pc-dot-group` - Present on the dot group element.
 */
const DotsLayer = (props: {
  points: Accessor<[number, number][]>
  data: Accessor<number[]>
  xAxisId: string
  dot?: DotRenderer
  activeDot?: DotRenderer
  events: PointEvents
}) => {
  const ctx = useChartContext()

  const xScale = createScale({
    axisId: () => props.xAxisId,
    orientation: () => 'x',
    chartContext: ctx,
  })

  const closestTick = createClosestTick({
    axis: () => 'x',
    scale: xScale,
    values: () => axisValues(ctx, props.xAxisId, 'x'),
    chartContext: ctx,
  })

  // The active marker, or null. Returns an object (not a bare index) so an
  // active index of 0 isn't read as falsy by `<Show>`.
  const active = () => {
    if (!props.activeDot || !ctx.pointerInChart()) return null
    const i = closestTick()?.index
    if (i === undefined) return null
    const point = props.points()[i]
    if (!point || !pointDefined(point)) return null
    return { i, point }
  }

  return (
    <>
      <Show when={props.dot}>
        <g data-pc-dot-group="">
          <For each={props.points()}>
            {(point, index) => (
              <Show when={pointDefined(point)}>
                <Dot
                  renderer={props.dot}
                  point={point}
                  value={props.data()[index()] as number}
                  index={index()}
                  active={false}
                  events={props.events}
                />
              </Show>
            )}
          </For>
        </g>
      </Show>
      <Show when={active()}>
        {(a) => (
          // The active marker is a hover affordance: it sits on top of its dot,
          // so it must not intercept the pointer — otherwise it would steal the
          // hover (causing flicker) and swallow clicks meant for the dot.
          <g data-pc-active-dot="" style={{ 'pointer-events': 'none' }}>
            <Dot
              renderer={props.activeDot}
              point={a().point}
              value={props.data()[a().i] as number}
              index={a().i}
              active
            />
          </g>
        )}
      </Show>
    </>
  )
}

export default DotsLayer
