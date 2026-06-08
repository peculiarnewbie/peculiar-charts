import { describe, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import Chart from '@src/components/Chart'
import Line from '@src/series/Line'
import Bar from '@src/series/Bar'
import Point from '@src/series/Point'
import Bubble from '@src/series/Bubble'
import Pie from '@src/series/Pie'
import Radar from '@src/series/Radar'
import Axis from '@src/axis/Axis'
import PolarLayout from '@src/axis/polar/PolarLayout'
import PolarAngleAxis from '@src/axis/polar/PolarAngleAxis'
import PolarRadiusAxis from '@src/axis/polar/PolarRadiusAxis'

const data = [
  { x: 'A', y: 10 },
  { x: 'B', y: 20 },
  { x: 'C', y: 15 },
]

describe('Chart', () => {
  it('renders an SVG with data-pc-chart attribute', () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" />
      </Chart>
    ))

    const svg = container.querySelector('[data-pc-chart]')
    expect(svg).not.toBeNull()
    expect(svg?.tagName).toBe('svg')
  })

  it('renders a wrapper div with data-pc-wrapper', () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300} />
    ))

    const wrapper = container.querySelector('[data-pc-wrapper]')
    expect(wrapper).not.toBeNull()
    expect(wrapper?.tagName).toBe('DIV')
  })

  it('sets viewBox from width/height props', () => {
    const { container } = render(() => (
      <Chart data={data} width={500} height={250} />
    ))

    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('viewBox')).toBe('0 0 500 250')
  })
})

describe('Line', () => {
  it('renders a path with data-pc-line attribute', () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" />
      </Chart>
    ))

    const line = container.querySelector('[data-pc-line]')
    expect(line).not.toBeNull()
    expect(line?.tagName).toBe('path')
    expect(line?.getAttribute('d')).toBeTruthy()
  })

  it('applies stroke and fill props', () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Line dataKey="y" stroke="red" />
      </Chart>
    ))

    const line = container.querySelector('[data-pc-line]')
    expect(line?.getAttribute('stroke')).toBe('red')
  })
})

describe('Bar', () => {
  it('renders rect elements', () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" />
      </Chart>
    ))

    const group = container.querySelector('[data-pc-bar-group]')
    expect(group).not.toBeNull()

    const rects = container.querySelectorAll('[data-pc-bar]')
    expect(rects.length).toBe(data.length)
  })

  it('bars have non-zero dimensions', () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bar dataKey="y" />
      </Chart>
    ))

    const rects = container.querySelectorAll('[data-pc-bar]')
    for (const rect of rects) {
      const w = Number(rect.getAttribute('width'))
      const h = Number(rect.getAttribute('height'))
      expect(w).toBeGreaterThan(0)
      expect(h).toBeGreaterThan(0)
    }
  })
})

describe('Point', () => {
  it('renders circle elements with data-pc-point', () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Point dataKey="y" />
      </Chart>
    ))

    const group = container.querySelector('[data-pc-point-group]')
    expect(group).not.toBeNull()

    const circles = container.querySelectorAll('[data-pc-point]')
    expect(circles.length).toBe(data.length)
  })

  it('circles have cx, cy, and r attributes', () => {
    const { container } = render(() => (
      <Chart data={data} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Point dataKey="y" r={6} />
      </Chart>
    ))

    const circles = container.querySelectorAll('[data-pc-point]')
    for (const circle of circles) {
      expect(circle.getAttribute('cx')).toBeTruthy()
      expect(circle.getAttribute('cy')).toBeTruthy()
      const r = Number(circle.getAttribute('r'))
      expect(r).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('Bubble', () => {
  const bubbleData = [
    { x: 'A', y: 10, z: 100 },
    { x: 'B', y: 20, z: 200 },
    { x: 'C', y: 15, z: 150 },
  ]

  it('renders circle elements with data-pc-bubble', () => {
    const { container } = render(() => (
      <Chart data={bubbleData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bubble dataKey="y" sizeKey="z" />
      </Chart>
    ))

    const group = container.querySelector('[data-pc-bubble-group]')
    expect(group).not.toBeNull()

    const circles = container.querySelectorAll('[data-pc-bubble]')
    expect(circles.length).toBe(bubbleData.length)
  })

  it('bubble radii vary by size key', () => {
    const { container } = render(() => (
      <Chart data={bubbleData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bubble dataKey="y" sizeKey="z" sizeRange={[4, 20]} />
      </Chart>
    ))

    const circles = container.querySelectorAll('[data-pc-bubble]')
    const radii = [...circles].map((c) => Number(c.getAttribute('r')))
    // All radii should be positive
    expect(radii.every((r) => r > 0)).toBe(true)
    // Radii should not all be the same (size key varies)
    expect(new Set(radii).size).toBeGreaterThan(1)
  })

  it('without sizeKey renders uniform circles', () => {
    const { container } = render(() => (
      <Chart data={bubbleData} width={400} height={300}>
        <Axis axis="x" position="bottom" dataKey="x" />
        <Axis axis="y" position="left" />
        <Bubble dataKey="y" />
      </Chart>
    ))

    const circles = container.querySelectorAll('[data-pc-bubble]')
    const radii = [...circles].map((c) => Number(c.getAttribute('r')))
    // All radii should be the same
    expect(new Set(radii).size).toBe(1)
  })
})

describe('Pie', () => {
  const pieData = [
    { name: 'A', value: 30 },
    { name: 'B', value: 50 },
    { name: 'C', value: 20 },
  ]

  it('renders slice paths with data-pc-pie-slice', () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" />
      </Chart>
    ))

    const group = container.querySelector('[data-pc-pie-group]')
    expect(group).not.toBeNull()

    const slices = container.querySelectorAll('[data-pc-pie-slice]')
    expect(slices.length).toBe(pieData.length)
  })

  it('slices have d attribute (arc paths)', () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" />
      </Chart>
    ))

    const slices = container.querySelectorAll('[data-pc-pie-slice]')
    for (const slice of slices) {
      expect(slice.getAttribute('d')).toBeTruthy()
    }
  })

  it('slices have fill colours', () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" />
      </Chart>
    ))

    const slices = container.querySelectorAll('[data-pc-pie-slice]')
    for (const slice of slices) {
      const fill = slice.getAttribute('fill')
      expect(fill).toBeTruthy()
      expect(fill).not.toBe('none')
    }
  })

  it('slices have data-key and data-index', () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" />
      </Chart>
    ))

    const slices = container.querySelectorAll('[data-pc-pie-slice]')
    slices.forEach((slice, i) => {
      expect(slice.hasAttribute('data-key')).toBe(true)
      expect(slice.hasAttribute('data-index')).toBe(true)
    })
  })

  it('renders donut with innerRadius', () => {
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" innerRadius="40%" />
      </Chart>
    ))

    const slices = container.querySelectorAll('[data-pc-pie-slice]')
    expect(slices.length).toBe(pieData.length)
    // Donut slices should have different arc paths than a full pie
    // (just verify they render — the arc geometry is a d3 concern)
  })

  it('respects custom colors', () => {
    const colors = { A: '#ff0000', B: '#00ff00', C: '#0000ff' }
    const { container } = render(() => (
      <Chart data={pieData} width={400} height={400}>
        <Pie dataKey="value" nameKey="name" colors={colors} />
      </Chart>
    ))

    const slices = container.querySelectorAll('[data-pc-pie-slice]')
    const fills = [...slices].map((s) => s.getAttribute('fill'))
    expect(fills).toContain('#ff0000')
    expect(fills).toContain('#00ff00')
    expect(fills).toContain('#0000ff')
  })
})

describe('Radar', () => {
  const radarData = [
    { cat: 'A', val: 80 },
    { cat: 'B', val: 60 },
    { cat: 'C', val: 90 },
    { cat: 'D', val: 70 },
  ]

  it('renders a polygon path with data-pc-radar', () => {
    const { container } = render(() => (
      <Chart data={radarData} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis dataKey="cat" />
          <PolarRadiusAxis />
          <Radar dataKey="val" />
        </PolarLayout>
      </Chart>
    ))

    const group = container.querySelector('[data-pc-radar-group]')
    expect(group).not.toBeNull()

    const polygon = container.querySelector('[data-pc-radar]')
    expect(polygon).not.toBeNull()
    expect(polygon?.tagName).toBe('path')
    expect(polygon?.getAttribute('d')).toBeTruthy()
  })

  it('applies fill-opacity', () => {
    const { container } = render(() => (
      <Chart data={radarData} width={400} height={400}>
        <PolarLayout>
          <PolarAngleAxis dataKey="cat" />
          <PolarRadiusAxis />
          <Radar dataKey="val" fillOpacity={0.5} />
        </PolarLayout>
      </Chart>
    ))

    const polygon = container.querySelector('[data-pc-radar]')
    expect(polygon?.getAttribute('fill-opacity')).toBe('0.5')
  })
})
