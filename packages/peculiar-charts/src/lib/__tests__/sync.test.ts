import { describe, expect, it } from 'vitest'
import { createRoot } from 'solid-js'
import { syncBus } from '@src/lib/sync'

describe('SyncBus', () => {
  it('delivers events to listeners', () =>
    createRoot(() => {
      let received: any = null
      const listener = (syncId: string | number, payload: any) => {
        received = { syncId, payload }
      }

      syncBus.on(listener)
      const symbol = Symbol('test')
      syncBus.emit('chart-1', { active: true, index: 2, coordinate: undefined, label: 'b', dataKey: undefined, sourceViewBox: undefined }, symbol)

      expect(received).toBeDefined()
      expect(received.syncId).toBe('chart-1')
      expect(received.payload.index).toBe(2)

      syncBus.off(listener)
    }))

  it('does not deliver to removed listeners', () =>
    createRoot(() => {
      let count = 0
      const listener = () => { count++ }

      syncBus.on(listener)
      syncBus.off(listener)
      syncBus.emit('x', { active: true, index: 0, coordinate: undefined, label: undefined, dataKey: undefined, sourceViewBox: undefined }, Symbol())

      expect(count).toBe(0)
    }))
})
