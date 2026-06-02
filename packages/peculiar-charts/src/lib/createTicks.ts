import { type Scale, scaleTicks } from '@src/lib/scale'
import { type Accessor, createMemo } from 'solid-js'

/** Resolves the tick values for an axis — user-forced, or derived from the scale. */
const createTicks = (props: {
  scale: Accessor<Scale>
  tickCount: Accessor<number>
  tickValues: Accessor<any[] | undefined>
}) =>
  createMemo(() => {
    const tickValues = props.tickValues()
    if (tickValues) return tickValues
    return scaleTicks(props.scale(), props.tickCount())
  })

export default createTicks
