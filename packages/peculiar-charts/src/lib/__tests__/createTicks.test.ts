import { describe, expect, it } from 'vitest'
import { createRoot, createSignal } from 'solid-js'
import { buildScale } from '@src/lib/scale'
import createTicks from '@src/lib/createTicks'

describe('createTicks', () => {
  it('returns scale ticks when no tickValues forced', () =>
    createRoot((dispose) => {
      const scale = () => buildScale('linear', [0, 100], [0, 500])
      const tickCount = () => 5
      const tickValues = () => undefined

      const ticks = createTicks({ scale, tickCount, tickValues })
      const result = ticks()
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((t: unknown) => typeof t === 'number')).toBe(true)
      dispose()
    }))

  it('returns forced tickValues when provided', () =>
    createRoot((dispose) => {
      const scale = () => buildScale('linear', [0, 100], [0, 500])
      const tickCount = () => 5
      const tickValues = () => [0, 25, 50, 75, 100]

      const ticks = createTicks({ scale, tickCount, tickValues })
      expect(ticks()).toEqual([0, 25, 50, 75, 100])
      dispose()
    }))

  it('returns domain for band scale', () =>
    createRoot((dispose) => {
      const scale = () => buildScale('band', ['a', 'b', 'c'], [0, 300])
      const tickCount = () => 5
      const tickValues = () => undefined

      const ticks = createTicks({ scale, tickCount, tickValues })
      expect(ticks()).toEqual(['a', 'b', 'c'])
      dispose()
    }))

  it('reacts to scale changes', () =>
    createRoot((dispose) => {
      const [domain, setDomain] = createSignal([0, 100])
      const scale = () => buildScale('linear', domain(), [0, 500])
      const tickCount = () => 5
      const tickValues = () => undefined

      const ticks = createTicks({ scale, tickCount, tickValues })
      const first = ticks()
      expect(first.length).toBeGreaterThan(0)

      setDomain([0, 1000])
      const second = ticks()
      // Ticks should change when domain changes
      expect(second).not.toEqual(first)
      dispose()
    }))
})
