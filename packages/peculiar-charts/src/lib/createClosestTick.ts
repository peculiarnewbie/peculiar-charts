import type { ChartContextType } from '@src/components/context'
import { type Scale, projectScale } from '@src/lib/scale'
import { type Accessor, createMemo } from 'solid-js'

type ClosestTick = { index: number; position: number }

/**
 * The datum nearest the pointer along an axis, plus its svg position.
 *
 * Works for any scale kind: every datum's domain value is projected to a pixel
 * through the axis scale, then the nearest one to the pointer is picked. This
 * handles evenly-spaced categorical axes and irregular numeric/time axes alike.
 * Used by crosshairs, tooltips and active-point highlighting.
 *
 * When the chart is receiving a cross-chart sync event (`syncInteraction`), the
 * index is forced to the synced value instead of matching by pointer position.
 */
const createClosestTick = (props: {
  axis: Accessor<'x' | 'y'>
  scale: Accessor<Scale>
  /** Per-datum domain values for this axis (categories, numbers or dates). */
  values: Accessor<any[]>
  chartContext: ChartContextType
}) => {
  const ctx = props.chartContext
  return createMemo<ClosestTick | undefined>((prev) => {
    const sync = ctx.syncInteraction()
    if (sync?.active && sync.index != null) {
      const values = props.values()
      const scale = props.scale()
      if (sync.index >= 0 && sync.index < values.length) {
        const position = projectScale(scale, values[sync.index])
        if (Number.isFinite(position)) {
          return { index: sync.index, position }
        }
      }
      return undefined
    }

    const pointerPosition = ctx.pointerPosition()
    if (!pointerPosition) return prev

    const scale = props.scale()
    const values = props.values()
    if (values.length === 0) return prev

    const position =
      props.axis() === 'x'
        ? ctx.toSvgPosition(pointerPosition.x, 'width')
        : ctx.toSvgPosition(pointerPosition.y, 'height')

    let bestIndex = 0
    let bestDistance = Number.POSITIVE_INFINITY
    let bestPosition = Number.NaN
    for (let i = 0; i < values.length; i++) {
      const projected = projectScale(scale, values[i])
      if (!Number.isFinite(projected)) continue
      const distance = Math.abs(projected - position)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = i
        bestPosition = projected
      }
    }

    if (bestIndex === prev?.index) return prev
    return { index: bestIndex, position: bestPosition }
  })
}

export default createClosestTick
