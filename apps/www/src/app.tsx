import { For, Show, createMemo, createSignal } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { highlight } from 'sugar-high'

import AnimatedArea from './demos/animated-area'
import animatedAreaCode from './demos/animated-area?raw'
import AnimatedBars from './demos/animated-bars'
import animatedBarsCode from './demos/animated-bars?raw'
import AnimatedBubble from './demos/animated-bubble'
import animatedBubbleCode from './demos/animated-bubble?raw'
import AnimatedLine from './demos/animated-line'
import animatedLineCode from './demos/animated-line?raw'
import AnimatedPhaseBars from './demos/animated-phase-bars'
import animatedPhaseBarsCode from './demos/animated-phase-bars?raw'
import AnimatedPie from './demos/animated-pie'
import animatedPieCode from './demos/animated-pie?raw'
import Annotations from './demos/annotations'
import annotationsCode from './demos/annotations?raw'
import Basic from './demos/basic'
import basicCode from './demos/basic?raw'
import Biaxial from './demos/biaxial'
import biaxialCode from './demos/biaxial?raw'
import BrushDemo from './demos/brush'
import BrushArea from './demos/brush-area'
import brushAreaCode from './demos/brush-area?raw'
import BrushBars from './demos/brush-bars'
import brushBarsCode from './demos/brush-bars?raw'
import brushCode from './demos/brush?raw'
import BubbleChart from './demos/bubble'
import bubbleCode from './demos/bubble?raw'
import CustomBarShapes from './demos/custom-bar-shapes'
import customBarShapesCode from './demos/custom-bar-shapes?raw'
import CustomDots from './demos/custom-dots'
import customDotsCode from './demos/custom-dots?raw'
import CustomLabels from './demos/custom-labels'
import customLabelsCode from './demos/custom-labels?raw'
import CustomLegend from './demos/custom-legend'
import customLegendCode from './demos/custom-legend?raw'
import CustomOverlay from './demos/custom-overlay'
import customOverlayCode from './demos/custom-overlay?raw'
import CustomTickMarks from './demos/custom-tick-marks'
import customTickMarksCode from './demos/custom-tick-marks?raw'
import DataLabels from './demos/data-labels'
import dataLabelsCode from './demos/data-labels?raw'
import Datetime from './demos/datetime'
import datetimeCode from './demos/datetime?raw'
import DefaultTooltip from './demos/default-tooltip'
import defaultTooltipCode from './demos/default-tooltip?raw'
import Donut from './demos/donut'
import donutCode from './demos/donut?raw'
import DotsEvents from './demos/dots-events'
import dotsEventsCode from './demos/dots-events?raw'
import Gaps from './demos/gaps'
import gapsCode from './demos/gaps?raw'
import Gradient from './demos/gradient'
import gradientCode from './demos/gradient?raw'
import GroupedBars from './demos/grouped-bars'
import groupedBarsCode from './demos/grouped-bars?raw'
import HorizontalBars from './demos/horizontal-bars'
import horizontalBarsCode from './demos/horizontal-bars?raw'
import InverseScale from './demos/inverse-scale'
import inverseScaleCode from './demos/inverse-scale?raw'
import LabelLines from './demos/label-lines'
import labelLinesCode from './demos/label-lines?raw'
import Negative from './demos/negative'
import negativeCode from './demos/negative?raw'
import PieDemo from './demos/pie'
import pieCode from './demos/pie?raw'
import RadarDemo from './demos/radar'
import RadarCustomTooltipDemo from './demos/radar-custom-tooltip'
import radarCustomTooltipCode from './demos/radar-custom-tooltip?raw'
import radarCode from './demos/radar?raw'
import StackedArea from './demos/stacked-area'
import stackedAreaCode from './demos/stacked-area?raw'
import StackedBars from './demos/stacked-bars'
import stackedBarsCode from './demos/stacked-bars?raw'
import Stepline from './demos/stepline'
import steplineCode from './demos/stepline?raw'
import SyncIdDemo from './demos/syncId'
import syncIdCode from './demos/syncId?raw'

type Demo = {
  id: string
  group: string
  title: string
  desc: string
  Comp: () => any
  code: string
  tall?: boolean
}

const DEMOS: Demo[] = [
  {
    id: 'basic',
    group: 'Line',
    title: 'Line + points + tooltip',
    desc: 'A line series with hover points, a crosshair, and an HTML tooltip portaled out of the SVG.',
    Comp: Basic,
    code: basicCode,
  },
  {
    id: 'default-tooltip',
    group: 'Line',
    title: 'Default tooltip',
    desc: '`<AxisTooltip>` with no `children` — auto-lists every visible registered series at the hovered index. Override with `content={(p) => …}` or `children`.',
    Comp: DefaultTooltip,
    code: defaultTooltipCode,
  },
  {
    id: 'datetime',
    group: 'Line',
    title: 'Datetime x-axis',
    desc: 'A real time axis — points sit at their actual date, so irregular spacing just works. Crosshair + tooltip snap to the nearest sample.',
    Comp: Datetime,
    code: datetimeCode,
  },
  {
    id: 'stepline',
    group: 'Line',
    title: 'Stepline + dashed',
    desc: 'Any d3 curve via the `curve` prop (here `curveStepAfter`); dashed strokes are just `stroke-dasharray` passthrough.',
    Comp: Stepline,
    code: steplineCode,
  },
  {
    id: 'gradient',
    group: 'Line',
    title: 'Gradient + forecast tail',
    desc: 'A gradient stroke (`stroke="url(#id)"`) for actuals, then a dashed projected tail — two line series sharing the seam.',
    Comp: Gradient,
    code: gradientCode,
  },
  {
    id: 'biaxial',
    group: 'Line',
    title: 'Biaxial',
    desc: 'Two value axes with independent domains — bind each series to a different `yAxisId`.',
    Comp: Biaxial,
    code: biaxialCode,
  },
  {
    id: 'stacked-area',
    group: 'Area',
    title: 'Stacked area',
    desc: 'Series sharing a `stackId` stack together. The legend toggles each one on click.',
    Comp: StackedArea,
    code: stackedAreaCode,
  },
  {
    id: 'negative',
    group: 'Area',
    title: 'Fill by value',
    desc: 'Set `positiveFill` / `negativeFill` and the area splits at the zero baseline.',
    Comp: Negative,
    code: negativeCode,
  },
  {
    id: 'gaps',
    group: 'Area',
    title: 'Curves + null gaps',
    desc: 'Missing values break the line and area; a value-line marks a threshold on a pinned axis range.',
    Comp: Gaps,
    code: gapsCode,
  },
  {
    id: 'data-labels',
    group: 'Markers',
    title: 'Data labels',
    desc: '`<SeriesLabel>` renders a label at each point — `format` it, add `labelLine` (bool, props-object, or function), or take over with a render-prop.',
    Comp: DataLabels,
    code: dataLabelsCode,
  },
  {
    id: 'label-lines',
    group: 'Markers',
    title: 'Label lines',
    desc: '`<SeriesLabel labelLine={…}>` draws a connector from each point to its label — props-object for a styled line, or a function for full control.',
    Comp: LabelLines,
    code: labelLinesCode,
  },
  {
    id: 'custom-dots',
    group: 'Markers',
    title: 'Custom dots',
    desc: '`<Point>` takes a children render-prop — render an emoji, an image, anything, with access to the active state.',
    Comp: CustomDots,
    code: customDotsCode,
  },
  {
    id: 'dots-events',
    group: 'Markers',
    title: 'Dots + per-datum events',
    desc: '`<Line>` takes `dot` / `activeDot` (bool, props-object, or function) so markers need no separate `<Point>`; `onPointClick(datum)` carries the datum, not just the DOM event.',
    Comp: DotsEvents,
    code: dotsEventsCode,
  },
  {
    id: 'bubble',
    group: 'Markers',
    title: 'Bubble',
    desc: '`<Bubble>` plots `(x, y)` on numeric axes and encodes a third value as area-proportional radius via `sizeKey`.',
    Comp: BubbleChart,
    code: bubbleCode,
  },
  {
    id: 'custom-labels',
    group: 'Markers',
    title: 'Custom tick labels',
    desc: 'Axis `<AxisLabel>` takes a render-prop too — swatches, images, styled markup per tick.',
    Comp: CustomLabels,
    code: customLabelsCode,
  },
  {
    id: 'custom-tick-marks',
    group: 'Markers',
    title: 'Custom tick marks',
    desc: '`<AxisMark>` accepts a `children` render-prop — draw diamonds, ticks, or any SVG at each tick position instead of the default line.',
    Comp: CustomTickMarks,
    code: customTickMarksCode,
  },
  {
    id: 'annotations',
    group: 'Annotations',
    title: 'Reference shapes',
    desc: '`<ReferenceArea>`, `<ReferenceLine>` and `<ReferenceDot>` — each resolves against the axis scales, with optional labels.',
    Comp: Annotations,
    code: annotationsCode,
  },
  {
    id: 'custom-legend',
    group: 'Annotations',
    title: 'Custom legend',
    desc: '`<Legend>` accepts `content` (alias for `children`) per series — bool for the default swatch + name, or a function for full control.',
    Comp: CustomLegend,
    code: customLegendCode,
  },
  {
    id: 'custom-overlay',
    group: 'Annotations',
    title: 'Custom overlay (hooks)',
    desc: 'A user-land child reads the chart scales via `useXScale` / `useYScale` / `usePlotArea` + `projectScale` — drawing its own peak/trough markers with no registration or fork.',
    Comp: CustomOverlay,
    code: customOverlayCode,
  },
  {
    id: 'inverse-scale',
    group: 'Annotations',
    title: 'Inverse scale (hooks)',
    desc: 'A custom overlay uses `useInverseYScale` + `useSvgPointerPosition` to read the y-value under the pointer — the pixel→data companion to `projectScale`.',
    Comp: InverseScale,
    code: inverseScaleCode,
  },
  {
    id: 'grouped-bars',
    group: 'Bar',
    title: 'Grouped bars + line',
    desc: 'Multiple bar series group side by side; a line series overlays on the same categorical axis.',
    Comp: GroupedBars,
    code: groupedBarsCode,
  },
  {
    id: 'stacked-bars',
    group: 'Bar',
    title: 'Stacked bars + tooltip',
    desc: 'Stacked bars with the default `<AxisTooltip>` — no render-prop needed; series rows come from the registry.',
    Comp: StackedBars,
    code: stackedBarsCode,
  },
  {
    id: 'horizontal-bars',
    group: 'Bar',
    title: 'Horizontal bars',
    desc: 'Set `layout="horizontal"` to flip the value axis to x and categories to y — grouped bars work the same way.',
    Comp: HorizontalBars,
    code: horizontalBarsCode,
  },
  {
    id: 'custom-bar-shapes',
    group: 'Bar',
    title: 'Custom bar shapes',
    desc: '`<Bar>` takes a `shape` prop (bool, props-object, or function) — rounded rects via `shape={{ rx: 6 }}` or a fully custom marker per datum; `onPointClick` works on the default shape.',
    Comp: CustomBarShapes,
    code: customBarShapesCode,
  },
  {
    id: 'pie',
    group: 'Pie',
    title: 'Pie',
    desc: 'Self-contained — no axes needed. Each slice registers into the legend and can be toggled.',
    Comp: PieDemo,
    code: pieCode,
  },
  {
    id: 'donut',
    group: 'Pie',
    title: 'Donut',
    desc: 'A pie with `innerRadius` — plus `padAngle` and `cornerRadius` for the gaps and rounding.',
    Comp: Donut,
    code: donutCode,
  },
  {
    id: 'radar',
    group: 'Radar',
    title: 'Radar chart',
    desc: 'Radar / spider chart — `<PolarLayout>` + `<Radar>` series. `<PolarCrosshair>` and `<PolarTooltip>` snap to the nearest category spoke.',
    Comp: RadarDemo,
    code: radarCode,
  },
  {
    id: 'radar-custom-tooltip',
    group: 'Radar',
    title: 'Custom tooltip',
    desc: '`<PolarTooltip content={(p) => …}>` — same `TooltipPayload` as `<AxisTooltip>`. Tooltip anchors on the active spoke, not the raw pointer.',
    Comp: RadarCustomTooltipDemo,
    code: radarCustomTooltipCode,
  },
  {
    id: 'animated-bars',
    group: 'Animation',
    title: 'Animated bars',
    desc: 'Bar series with `animation` — toggle between 5 and 3 items to see entering bars grow and exiting bars shrink to baseline.',
    Comp: AnimatedBars,
    code: animatedBarsCode,
  },
  {
    id: 'animated-line',
    group: 'Animation',
    title: 'Animated line + points',
    desc: 'Line and Point series with `animation` — points tween their coordinates and exiting points shrink to zero radius. The path snaps on remove (no per-point exit for lines).',
    Comp: AnimatedLine,
    code: animatedLineCode,
  },
  {
    id: 'animated-area',
    group: 'Animation',
    title: 'Animated area',
    desc: 'Stacked area series with `animation` — the filled region morphs smoothly as data changes. Toggle between 7 and 4 items to see the path snap on removal (no per-point exit for areas).',
    Comp: AnimatedArea,
    code: animatedAreaCode,
  },
  {
    id: 'animated-pie',
    group: 'Animation',
    title: 'Animated pie (exit)',
    desc: 'Pie series with `animation` — toggle between 7 and 4 slices; exiting slices shrink to zero angular span.',
    Comp: AnimatedPie,
    code: animatedPieCode,
  },
  {
    id: 'animated-bubble',
    group: 'Animation',
    title: 'Animated bubble (exit)',
    desc: 'Bubble series with `animation` — bubbles exit by shrinking to zero radius when data shrinks.',
    Comp: AnimatedBubble,
    code: animatedBubbleCode,
  },
  {
    id: 'animated-phase-bars',
    group: 'Animation',
    title: 'Phase-config bars',
    desc: 'Per-phase animation config — enter grows over 600ms with `ease`, exit snaps first with a springy cubic-bezier, update tweens at 400ms `ease-out`. Toggle between 7 and 3 items to see exits.',
    Comp: AnimatedPhaseBars,
    code: animatedPhaseBarsCode,
    tall: true,
  },
  {
    id: 'brush',
    group: 'Brush',
    title: 'Line + brush',
    desc: '`<Brush>` renders a draggable range selector below the chart with a mini preview. Drag the handles or the slide area to filter the visible data. Children render as a miniature of the full dataset.',
    Comp: BrushDemo,
    code: brushCode,
    tall: true,
  },
  {
    id: 'brush-area',
    group: 'Brush',
    title: 'Area + brush (time axis)',
    desc: 'Area chart with a time-based x-axis and a brush. The area and line preview in the brush use lighter fills so the main chart remains visually dominant.',
    Comp: BrushArea,
    code: brushAreaCode,
    tall: true,
  },
  {
    id: 'brush-bars',
    group: 'Brush',
    title: 'Grouped bars + brush',
    desc: 'Grouped bar series with a brush range selector. The brush preview uses the same bars at reduced opacity — drag the handles to zoom into a subset of months.',
    Comp: BrushBars,
    code: brushBarsCode,
    tall: true,
  },
  {
    id: 'syncId',
    group: 'Sync',
    title: 'syncId — cross-chart sync',
    desc: 'Two `<Chart>` components with the same `syncId` synchronise tooltips and crosshairs. Hover one chart and the other follows — works across mixed series and different data lengths.',
    Comp: SyncIdDemo,
    code: syncIdCode,
    tall: true,
  },
]

const GROUPS = [...new Set(DEMOS.map((d) => d.group))]
const INSTALL = 'npm i peculiar-charts'

const FEATURES = [
  {
    claim: 'Headless, unstyled SVG.',
    line: 'Every component is a plain SVG element with your classes and props passed straight through. Style it with Tailwind, CSS, anything.',
    chip: 'data-pc-* hooks',
  },
  {
    claim: 'One scale primitive, every axis.',
    line: 'Axes and series share the same scale. Positioning is value-based — project an x through the axis scale — so numeric, time and categorical axes all work the same way.',
    chip: 'linear · log · time · band · point',
  },
  {
    claim: 'Components register themselves.',
    line: 'Series report their identity, extent and stack membership into the chart via effects. The legend, domains and tooltips fall out of that registry.',
    chip: 'fine-grained reactivity',
  },
  {
    claim: 'Render-props everywhere.',
    line: 'Custom dots, custom tick labels, tooltip bodies, data labels — take over the markup whenever the default is not enough.',
    chip: '<Point>{(d) => …}</Point>',
  },
]

function InstallCommand() {
  const [copied, setCopied] = createSignal(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard needs https */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      class="inline-flex items-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2 font-mono text-sm shadow-sm transition hover:border-zinc-400"
    >
      <span class="text-zinc-400">$</span>
      <code>{INSTALL}</code>
      <span class="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
        {copied() ? 'Copied!' : 'Copy'}
      </span>
    </button>
  )
}

function ChartFrame(props: { tall?: boolean; children: any }) {
  return (
    <div
      class="relative w-full rounded-lg border border-zinc-200 bg-white p-4"
      classList={{ 'h-[420px]': props.tall, 'h-[320px]': !props.tall }}
    >
      {props.children}
    </div>
  )
}

function Playground() {
  const [group, setGroup] = createSignal(GROUPS[0]!)
  const inGroup = createMemo(() => DEMOS.filter((d) => d.group === group()))
  const [id, setId] = createSignal(inGroup()[0]!.id)
  const [mode, setMode] = createSignal<'live' | 'code'>('live')
  const demo = createMemo(() => DEMOS.find((d) => d.id === id()) ?? DEMOS[0]!)

  const selectGroup = (g: string) => {
    setGroup(g)
    setId(DEMOS.find((d) => d.group === g)!.id)
    setMode('live')
  }

  return (
    <section id="demos" class="mx-auto max-w-5xl px-6 py-16">
      <h2 class="mb-6 text-2xl font-semibold tracking-tight">Try it out</h2>

      <div class="mb-3 flex flex-wrap gap-1.5">
        <For each={GROUPS}>
          {(g) => (
            <button
              type="button"
              onClick={() => selectGroup(g)}
              class="rounded-full px-3 py-1 text-sm font-medium transition"
              classList={{
                'bg-zinc-900 text-white': group() === g,
                'bg-zinc-100 text-zinc-600 hover:bg-zinc-200': group() !== g,
              }}
            >
              {g}
            </button>
          )}
        </For>
      </div>

      <div class="mb-5 flex flex-wrap gap-1.5">
        <For each={inGroup()}>
          {(d) => (
            <button
              type="button"
              onClick={() => {
                setId(d.id)
                setMode('live')
              }}
              class="rounded-md px-2.5 py-1 text-xs transition"
              classList={{
                'bg-zinc-200 text-zinc-900': id() === d.id,
                'text-zinc-500 hover:bg-zinc-100': id() !== d.id,
              }}
            >
              {d.title}
            </button>
          )}
        </For>
      </div>

      <div class="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold">{demo().title}</h3>
          <p class="mt-1 max-w-2xl text-sm text-zinc-500">{demo().desc}</p>
        </div>
        <div class="flex shrink-0 rounded-lg border border-zinc-200 p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setMode('live')}
            class="rounded-md px-3 py-1 font-medium transition"
            classList={{
              'bg-zinc-900 text-white': mode() === 'live',
              'text-zinc-500': mode() !== 'live',
            }}
          >
            Live
          </button>
          <button
            type="button"
            onClick={() => setMode('code')}
            class="rounded-md px-3 py-1 font-mono transition"
            classList={{
              'bg-zinc-900 text-white': mode() === 'code',
              'text-zinc-500': mode() !== 'code',
            }}
          >
            {'</>'}
          </button>
        </div>
      </div>

      <Show
        when={mode() === 'live'}
        fallback={
          <div class="overflow-auto rounded-lg bg-zinc-950 p-4 text-[13px] leading-relaxed">
            <pre>
              <code class="sh" innerHTML={highlight(demo().code)} />
            </pre>
          </div>
        }
      >
        <ChartFrame tall={demo().tall}>
          <Dynamic component={demo().Comp} />
        </ChartFrame>
      </Show>
    </section>
  )
}

function Landing() {
  return (
    <div class="min-h-screen bg-zinc-50 text-zinc-900">
      <header class="border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <span class="font-semibold">peculiar-charts</span>
          <nav class="flex items-center gap-4 text-sm text-zinc-600">
            <a href="#demos" class="hover:text-zinc-900">
              Demos
            </a>
            <a href="#features" class="hover:text-zinc-900">
              Features
            </a>
            <a href="#start" class="hover:text-zinc-900">
              Quick start
            </a>
          </nav>
        </div>
      </header>

      <section class="mx-auto max-w-5xl px-6 pt-20 pb-12 text-center">
        <p class="mb-3 text-sm font-medium text-zinc-400">peculiar-charts</p>
        <h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Composable charts,{' '}
          <span class="text-blue-600">built on signals.</span>
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-zinc-500">
          A headless SolidJS charting library — lines, areas, bars, pies,
          annotations and more, every element unstyled and yours to compose.
        </p>
        <div class="mt-8 flex justify-center">
          <InstallCommand />
        </div>
      </section>

      <Playground />

      <section id="features" class="border-t border-zinc-200 bg-white">
        <div class="mx-auto max-w-5xl px-6 py-16">
          <h2 class="mb-8 text-2xl font-semibold tracking-tight">
            What makes it peculiar
          </h2>
          <ol class="divide-y divide-zinc-100">
            <For each={FEATURES}>
              {(f, i) => (
                <li class="grid grid-cols-[auto_1fr] gap-x-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <span class="font-mono text-sm text-zinc-300">
                    {String(i() + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 class="font-semibold">{f.claim}</h3>
                    <p class="mt-1 text-sm text-zinc-500">{f.line}</p>
                  </div>
                  <code class="col-span-2 mt-2 rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-500 sm:col-span-1 sm:mt-0">
                    {f.chip}
                  </code>
                </li>
              )}
            </For>
          </ol>
        </div>
      </section>

      <section id="start" class="mx-auto max-w-5xl px-6 py-16">
        <h2 class="mb-6 text-2xl font-semibold tracking-tight">Get started</h2>
        <div class="overflow-hidden rounded-lg border border-zinc-200">
          <div class="border-b border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs text-zinc-400">
            App.tsx
          </div>
          <div class="bg-zinc-950 p-4 text-[13px] leading-relaxed">
            <pre>
              <code class="sh" innerHTML={highlight(QUICKSTART)} />
            </pre>
          </div>
        </div>
      </section>

      <footer class="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400">
        peculiar-charts · headless charts for SolidJS
      </footer>
    </div>
  )
}

const QUICKSTART = `import { Chart, Axis, AxisLabel, Line } from "peculiar-charts";

const data = [
  { day: "Mon", sales: 42 },
  { day: "Tue", sales: 55 },
  { day: "Wed", sales: 38 },
];

export default () => (
  <Chart data={data}>
    <Axis axis="y" position="left">
      <AxisLabel />
    </Axis>
    <Axis dataKey="day" axis="x" position="bottom">
      <AxisLabel />
    </Axis>
    <Line dataKey="sales" class="text-blue-500" stroke-width={2} />
  </Chart>
);`

/** A flat grid of every demo — used by the screenshot harness (visit `/?all`). */
function AllDemos() {
  return (
    <div class="min-h-screen bg-zinc-50 p-6 text-sm text-zinc-800">
      <div class="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
        <For each={DEMOS}>
          {(d) => (
            <div class="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p class="mb-2 text-xs font-medium text-zinc-500">{d.title}</p>
              <div class="relative h-[240px]">
                <Dynamic component={d.Comp} />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

export default function App() {
  const all = typeof location !== 'undefined' && location.search.includes('all')
  return (
    <Show when={all} fallback={<Landing />}>
      {<AllDemos />}
    </Show>
  )
}
