import type { MatchImageSnapshotOptions } from '@src/__tests__/helpers/toMatchImageSnapshot'

declare module 'vitest' {
  interface Assertion {
    toMatchImageSnapshot(options?: MatchImageSnapshotOptions): void
  }
  interface AsymmetricMatchersContaining {
    toMatchImageSnapshot(options?: MatchImageSnapshotOptions): void
  }
}
