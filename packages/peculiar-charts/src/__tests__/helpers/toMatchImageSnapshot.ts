import * as fs from 'node:fs'
import * as path from 'node:path'
import type { MatcherState } from '@vitest/expect'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { svgToPng } from './svgToPng'

export interface MatchImageSnapshotOptions {
  /** pixelmatch per-pixel color distance threshold (0-1). Default: 0.01 */
  threshold?: number
  /** Max percentage of differing pixels allowed. Default: 0.05 */
  failureThreshold?: number
  /** PNG background color. Default: '#ffffff' */
  background?: string
}

const DEFAULTS: Required<MatchImageSnapshotOptions> = {
  threshold: 0.01,
  failureThreshold: 0.05,
  background: '#ffffff',
}

function getSnapshotDir(testPath: string): string {
  return path.join(path.dirname(testPath), '__image_snapshots__')
}

function getSnapshotPath(testPath: string, testName: string): string {
  const dir = getSnapshotDir(testPath)
  const sanitized = testName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
  return path.join(dir, `${sanitized}-snap.png`)
}

export function toMatchImageSnapshot(
  this: MatcherState,
  received: string,
  options: MatchImageSnapshotOptions = {},
) {
  const { testPath, currentTestName, snapshotState } = this
  const opts = { ...DEFAULTS, ...options }

  if (!testPath || !currentTestName) {
    throw new Error('toMatchImageSnapshot requires testPath and currentTestName')
  }

  const snapshotPath = getSnapshotPath(testPath, currentTestName)
  const snapshotDir = path.dirname(snapshotPath)

  const actualPng = svgToPng(received, { background: opts.background })
  const { width, height } = actualPng

  if (!fs.existsSync(snapshotPath)) {
    fs.mkdirSync(snapshotDir, { recursive: true })
    fs.writeFileSync(snapshotPath, PNG.sync.write(actualPng))
    return {
      message: () => `New snapshot saved: ${path.relative(process.cwd(), snapshotPath)}`,
      pass: true,
    }
  }

  const expectedBuffer = fs.readFileSync(snapshotPath)
  const expectedPng = PNG.sync.read(expectedBuffer)

  if (expectedPng.width !== width || expectedPng.height !== height) {
    const diffPath = snapshotPath.replace('-snap.png', '-diff.png')
    const receivedPath = snapshotPath.replace('-snap.png', '-received.png')
    fs.writeFileSync(receivedPath, PNG.sync.write(actualPng))

    return {
      message: () =>
        `Image dimensions changed: ${expectedPng.width}x${expectedPng.height} → ${width}x${height}`,
      pass: false,
    }
  }

  const diff = new PNG({ width, height })
  const mismatchedPixels = pixelmatch(
    actualPng.data,
    expectedPng.data,
    diff.data,
    width,
    height,
    { threshold: opts.threshold },
  )

  const diffPercentage = (mismatchedPixels * 100) / (width * height)
  const pass = diffPercentage <= opts.failureThreshold

  if (!pass) {
    const diffPath = snapshotPath.replace('-snap.png', '-diff.png')
    const receivedPath = snapshotPath.replace('-snap.png', '-received.png')
    fs.writeFileSync(diffPath, PNG.sync.write(diff))
    fs.writeFileSync(receivedPath, PNG.sync.write(actualPng))
  } else {
    const diffPath = snapshotPath.replace('-snap.png', '-diff.png')
    const receivedPath = snapshotPath.replace('-snap.png', '-received.png')
    if (fs.existsSync(diffPath)) fs.unlinkSync(diffPath)
    if (fs.existsSync(receivedPath)) fs.unlinkSync(receivedPath)
  }

  return {
    message: () =>
      `Image differed by ${mismatchedPixels} pixels (${diffPercentage.toFixed(3)}%), ` +
      `threshold: ${opts.failureThreshold}%`,
    pass,
  }
}
