import { describe, expect, it } from 'vitest'
import { createRoot, createSignal } from 'solid-js'
import { buildScale } from '@src/lib/scale'
import { createMockChartContext } from './helpers'
import createClosestTick from '@src/lib/createClosestTick'

describe('createClosestTick', () => {
  it('returns undefined when no pointer position', () =>
    createRoot((dispose) => {
      const ctx = createMockChartContext()
      const scale = () => buildScale('point', ['a', 'b', 'c'], [0, 300])
      const values = () => ['a', 'b', 'c']

      const closest = createClosestTick({
        axis: () => 'x',
        scale,
        values,
        chartContext: ctx,
      })

      expect(closest()).toBeUndefined()
      dispose()
    }))

  it('finds the closest tick to pointer', () =>
    createRoot((dispose) => {
      const [pointerPos, setPointerPos] = createSignal<{ x: number; y: number } | null>(null)
      const ctx = createMockChartContext({
        pointerPosition: pointerPos,
        toSvgPosition: (pos) => pos,
      })
      const scale = () => buildScale('point', ['a', 'b', 'c'], [0, 300])
      const values = () => ['a', 'b', 'c']

      const closest = createClosestTick({
        axis: () => 'x',
        scale,
        values,
        chartContext: ctx,
      })

      // No pointer yet
      expect(closest()).toBeUndefined()

      // Pointer near first tick (x=0)
      setPointerPos({ x: 10, y: 0 })
      const at0 = closest()
      expect(at0).toBeDefined()
      expect(at0!.index).toBe(0)

      // Pointer near last tick (x=300)
      setPointerPos({ x: 290, y: 0 })
      const at2 = closest()
      expect(at2).toBeDefined()
      expect(at2!.index).toBe(2)

      dispose()
    }))

  it('returns prev when index unchanged (memo stability)', () =>
    createRoot((dispose) => {
      const [pointerPos, setPointerPos] = createSignal<{ x: number; y: number } | null>(null)
      const ctx = createMockChartContext({
        pointerPosition: pointerPos,
        toSvgPosition: (pos) => pos,
      })
      const scale = () => buildScale('point', ['a', 'b', 'c'], [0, 300])
      const values = () => ['a', 'b', 'c']

      const closest = createClosestTick({
        axis: () => 'x',
        scale,
        values,
        chartContext: ctx,
      })

      setPointerPos({ x: 10, y: 0 })
      const first = closest()
      setPointerPos({ x: 20, y: 0 })
      const second = closest()
      // Same object reference when index hasn't changed
      expect(first).toBe(second)
      dispose()
    }))

  it('uses syncInteraction index when active', () =>
    createRoot((dispose) => {
      const [sync, setSync] = createSignal<any>(null)
      const ctx = createMockChartContext({ syncInteraction: sync })
      const scale = () => buildScale('point', ['a', 'b', 'c'], [0, 300])
      const values = () => ['a', 'b', 'c']

      const closest = createClosestTick({
        axis: () => 'x',
        scale,
        values,
        chartContext: ctx,
      })

      setSync({ active: true, index: 1 })
      const result = closest()
      expect(result).toBeDefined()
      expect(result!.index).toBe(1)
      dispose()
    }))
})
