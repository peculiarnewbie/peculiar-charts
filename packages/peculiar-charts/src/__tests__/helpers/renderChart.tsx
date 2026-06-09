import type { JSX } from 'solid-js'
import { render } from '@solidjs/testing-library'
import Chart from '@src/components/Chart'

interface RenderChartOptions {
  data?: unknown[]
  width?: number
  height?: number
  children?: JSX.Element
}

export function renderChart(options: RenderChartOptions = {}) {
  const {
    data = [
      { x: 'A', y: 10 },
      { x: 'B', y: 20 },
      { x: 'C', y: 15 },
    ],
    width = 400,
    height = 300,
    children,
  } = options

  const result = render(() => (
    <Chart data={data} width={width} height={height}>
      {children}
    </Chart>
  ))

  const svg = result.container.querySelector('[data-pc-chart]')!

  return {
    ...result,
    svg,
  }
}
