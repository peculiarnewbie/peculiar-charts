import type { AxisOrientation, ChartContextType } from '@src/components/context'
import { type Scale, buildScale } from '@src/lib/scale'
import { getBarPadding } from '@src/lib/utils'
import { type Accessor, createMemo } from 'solid-js'

/**
 * The single source of truth for an axis scale. Both `<Axis>` and every series
 * call this with the same `axisId`/`orientation`, so they always agree on
 * placement. Reads the axis config + domain + plot rect from the chart context.
 */
const createScale = (props: {
  axisId: Accessor<string>
  orientation: Accessor<AxisOrientation>
  chartContext: ChartContextType
}): Accessor<Scale> => {
  return createMemo(() => {
    const ctx = props.chartContext
    const axisId = props.axisId()
    const orientation = props.orientation()
    const config = ctx.getAxisConfig(axisId, orientation)
    const domain = ctx.getDomain(axisId, orientation)

    let start: number
    let end: number
    if (orientation === 'x') {
      // point/linear x-scales inset by half a band so markers centre over bars
      const barPadding = config.type === 'band' ? 0 : getBarPadding(ctx)
      start = ctx.getInset('left') + barPadding + (config.padding?.left ?? 0)
      end =
        ctx.width() -
        ctx.getInset('right') -
        barPadding -
        (config.padding?.right ?? 0)
    } else {
      // value axis grows upward → inverted pixel range
      start =
        ctx.height() - ctx.getInset('bottom') - (config.padding?.bottom ?? 0)
      end = ctx.getInset('top') + (config.padding?.top ?? 0)
    }

    if (domain.kind === 'categorical') {
      return buildScale(config.type, domain.values, [start, end], {
        reverse: config.reverse,
      })
    }

    let min = domain.min
    const max = domain.max
    // value axes include the zero baseline unless the user pinned the range
    if (orientation === 'y' && !domain.userDefined) min = Math.min(min, 0)

    const scale = buildScale(config.type, [min, max], [start, end], {
      reverse: config.reverse,
    })
    if (
      !domain.userDefined &&
      orientation !== 'x' &&
      (scale.type === 'linear' || scale.type === 'log' || scale.type === 'time')
    ) {
      scale.scale.nice()
    }
    return scale
  })
}

export default createScale
