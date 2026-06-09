import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'

function mockGetBoundingClientRect() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    top: 0,
    right: 800,
    bottom: 600,
    left: 0,
    toJSON() {},
  })
}

const IGNORED_WARNINGS = [
  'Each child in a list should have a unique "key" prop',
]

function isIgnored(args: unknown[]): boolean {
  const msg = String(args[0] ?? '')
  return IGNORED_WARNINGS.some((pattern) => msg.includes(pattern))
}

function setupConsoleWarningToError() {
  const originalWarn = console.warn
  const originalError = console.error

  beforeEach(() => {
    console.warn = (...args: unknown[]) => {
      if (isIgnored(args)) return originalWarn(...args)
      throw new Error(`Unexpected console.warn: ${args.join(' ')}`)
    }
    console.error = (...args: unknown[]) => {
      if (isIgnored(args)) return originalError(...args)
      throw new Error(`Unexpected console.error: ${args.join(' ')}`)
    }
  })

  afterEach(() => {
    console.warn = originalWarn
    console.error = originalError
  })
}

mockGetBoundingClientRect()
setupConsoleWarningToError()
