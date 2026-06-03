import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

// `/?all` renders every demo in a flat grid (the verification view).
const URL = process.env.PC_URL ?? 'http://localhost:5371/?all'
// Default into a gitignored `.tmp/` at the repo root (this file lives at
// apps/www/scripts/screenshot.mjs → three levels up).
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const OUT = process.env.PC_OUT ?? resolve(REPO_ROOT, '.tmp/pc-lab.png')
mkdirSync(dirname(OUT), { recursive: true })
const EXECUTABLE =
  process.env.PC_CHROME ??
  `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell`

const browser = await chromium.launch({ executablePath: EXECUTABLE })
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } })

const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console.error: ${m.text()}`)
})
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

// Sanity assertions against rendered DOM
const counts = await page.evaluate(() => ({
  charts: document.querySelectorAll('[data-pc-chart]').length,
  lines: document.querySelectorAll('[data-pc-line]').length,
  areas: document.querySelectorAll('[data-pc-area]').length,
  bars: document.querySelectorAll('[data-pc-bar]').length,
  points: document.querySelectorAll('[data-pc-point]').length,
  dots: document.querySelectorAll('[data-pc-dot]').length,
  bubbles: document.querySelectorAll('[data-pc-bubble]').length,
  pieSlices: document.querySelectorAll('[data-pc-pie-slice]').length,
  legendItems: document.querySelectorAll('[data-pc-legend-item]').length,
  seriesLabels: document.querySelectorAll('[data-pc-series-label]').length,
  referenceLines: document.querySelectorAll('[data-pc-reference-line]').length,
  referenceAreas: document.querySelectorAll('[data-pc-reference-area]').length,
  referenceDots: document.querySelectorAll('[data-pc-reference-dot]').length,
  // any path/rect/line/circle with NaN coords indicates a scale bug
  nanGeom: [
    ...document.querySelectorAll('path[d], rect, line, circle'),
  ].filter((el) =>
    ['d', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy']
      .map((a) => el.getAttribute(a))
      .some((v) => v?.includes('NaN')),
  ).length,
}))

await page.screenshot({ path: OUT, fullPage: true })
await browser.close()

console.log('rendered:', JSON.stringify(counts))
if (errors.length) {
  console.log('PAGE ERRORS:\n' + errors.join('\n'))
  process.exit(1)
}
if (counts.charts === 0 || counts.nanGeom > 0) {
  console.log('SANITY FAIL: no charts or NaN geometry present')
  process.exit(1)
}
console.log('OK — screenshot at', OUT)
