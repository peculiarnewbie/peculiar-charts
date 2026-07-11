import { type JSX, Show } from "solid-js";
import { highlight } from "sugar-high";
import intervalTimelineCode from "./demos/interval-timeline?raw";

type DocsRouteProps = {
  path: string;
};

type DocsPageProps = {
  children: JSX.Element;
  eyebrow: string;
  title: string;
  lead: string;
};

const Code = (props: { children: string; filename?: string }) => (
  <div class="my-6 overflow-hidden rounded-xl border border-zinc-800">
    <Show when={props.filename}>
      <div class="border-b border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs text-zinc-400">
        {props.filename}
      </div>
    </Show>
    <pre class="overflow-auto bg-zinc-950 p-4 text-[13px] leading-relaxed text-zinc-100">
      <code class="sh" innerHTML={highlight(props.children)} />
    </pre>
  </div>
);

const DocsPage = (props: DocsPageProps) => (
  <div class="min-h-screen bg-zinc-50 text-zinc-900" data-docs-route="">
    <header class="border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a href="/" class="font-semibold hover:text-blue-600">
          peculiar-charts
        </a>
        <nav class="flex items-center gap-4 text-sm text-zinc-600">
          <a href="/docs" class="hover:text-zinc-900">
            Docs
          </a>
          <a href="/docs/getting-started" class="hover:text-zinc-900">
            Getting started
          </a>
          <a href="/#demos" class="hover:text-zinc-900">
            Demos
          </a>
        </nav>
      </div>
    </header>

    <main class="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-[11rem_minmax(0,1fr)]">
      <aside class="text-sm md:sticky md:top-6 md:h-min">
        <p class="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-zinc-400">Docs</p>
        <nav class="grid gap-1 text-zinc-600">
          <a href="/docs" class="rounded px-2 py-1 hover:bg-zinc-100 hover:text-zinc-950">
            Overview
          </a>
          <a
            href="/docs/getting-started"
            class="rounded px-2 py-1 hover:bg-zinc-100 hover:text-zinc-950"
          >
            Getting started
          </a>
          <a href="/docs/tooltips" class="rounded px-2 py-1 hover:bg-zinc-100 hover:text-zinc-950">
            Tooltips
          </a>
          <a
            href="/docs/recipes/biaxial"
            class="rounded px-2 py-1 hover:bg-zinc-100 hover:text-zinc-950"
          >
            Biaxial charts
          </a>
          <a
            href="/docs/recipes/timeline"
            class="rounded px-2 py-1 hover:bg-zinc-100 hover:text-zinc-950"
          >
            Interval timelines
          </a>
          <a
            href="/docs/series/bar"
            class="rounded px-2 py-1 hover:bg-zinc-100 hover:text-zinc-950"
          >
            Bars
          </a>
        </nav>
      </aside>

      <article>
        <p class="font-mono text-xs uppercase tracking-[0.2em] text-blue-600">{props.eyebrow}</p>
        <h1 class="mt-3 text-4xl font-semibold tracking-tight">{props.title}</h1>
        <p class="mt-4 max-w-2xl text-base leading-7 text-zinc-600">{props.lead}</p>
        <div class="mt-10 max-w-3xl text-sm leading-6 text-zinc-700">{props.children}</div>
      </article>
    </main>
  </div>
);

const GETTING_STARTED = [
  'import { Axis, AxisLabel, AxisLine, Chart, Line } from "peculiar-charts";',
  "",
  "const data = [",
  '  { day: "Mon", sales: 42 },',
  '  { day: "Tue", sales: 55 },',
  '  { day: "Wed", sales: 38 },',
  "];",
  "",
  "export default function SalesChart() {",
  "  return (",
  "    <Chart data={data}>",
  '      <Axis axis="y" position="left" tickFormatter={(value) => "$" + value}>',
  "        <AxisLabel />",
  "      </Axis>",
  '      <Axis dataKey="day" axis="x" position="bottom">',
  "        <AxisLabel />",
  "        <AxisLine />",
  "      </Axis>",
  '      <Line dataKey="sales" />',
  "    </Chart>",
  "  );",
  "}",
].join("\n");

const TOOLTIP_COMPOSITION = [
  'import { AxisTooltip, TooltipContent } from "peculiar-charts";',
  "",
  '<Axis dataKey="day" axis="x" position="bottom">',
  '  <AxisTooltip class="rounded-lg border bg-white p-2 shadow-sm">',
  "    {(payload) => (",
  "      <TooltipContent payload={payload}>",
  "        {(active) => (",
  '          <p class="mt-2 text-xs text-zinc-500">',
  "            Sample {active.index + 1}",
  "          </p>",
  "        )}",
  "      </TooltipContent>",
  "    )}",
  "  </AxisTooltip>",
  "</Axis>",
].join("\n");

const BIAXIAL = [
  'import { Axis, AxisGrid, AxisLabel, AxisLine, Chart, Line } from "peculiar-charts";',
  "",
  "const samples = [",
  "  { t: 0, cpuSeconds: 1.2, gpuCycles: 2300000 },",
  "  { t: 1, cpuSeconds: 1.8, gpuCycles: 3100000 },",
  "  { t: 2, cpuSeconds: 1.4, gpuCycles: 2700000 },",
  "];",
  "",
  "<Chart data={samples}>",
  '  <Axis axis="y" position="left" tickFormatter={(value) => value + "s"}>',
  "    <AxisLabel />",
  "    <AxisGrid />",
  "  </Axis>",
  '  <Axis axis="y" axisId="gpu" position="right" tickFormatter={(value) => value + " cycles"}>',
  "    <AxisLabel />",
  "  </Axis>",
  '  <Axis dataKey="t" axis="x" position="bottom" type="linear">',
  '    <AxisLabel format={(value) => "t+" + value} />',
  "    <AxisLine />",
  "  </Axis>",
  "",
  '  <Line dataKey="cpuSeconds" name="CPU" />',
  '  <Line dataKey="gpuCycles" name="GPU" yAxisId="gpu" />',
  "</Chart>",
].join("\n");

const TIMELINE = intervalTimelineCode;

const HORIZONTAL_BARS = [
  'import { Axis, AxisGrid, AxisLabel, AxisLine, Bar, Chart } from "peculiar-charts";',
  "",
  "<Chart data={services}>",
  '  <Bar dataKey="cpuSeconds" layout="horizontal" />',
  '  <Axis axis="x" position="bottom" type="linear">',
  '    <AxisLabel format={(value) => value + "s"} />',
  "    <AxisGrid />",
  "  </Axis>",
  '  <Axis dataKey="service" axis="y" position="left" type="point">',
  "    <AxisLabel />",
  "    <AxisLine />",
  "  </Axis>",
  "</Chart>",
].join("\n");

const Overview = () => (
  <DocsPage
    eyebrow="Documentation"
    title="Compose the chart you need."
    lead="Peculiar Charts is a headless SolidJS charting library. Start with a Chart and axes, then add series or custom SVG children that read the same reactive scales."
  >
    <section>
      <h2 class="text-xl font-semibold text-zinc-950">Start here</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <a
          href="/docs/getting-started"
          class="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300"
        >
          <h3 class="font-semibold text-zinc-950">Getting started</h3>
          <p class="mt-1 text-zinc-600">Build a first line chart and learn the axis primitives.</p>
        </a>
        <a
          href="/docs/tooltips"
          class="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300"
        >
          <h3 class="font-semibold text-zinc-950">Tooltips</h3>
          <p class="mt-1 text-zinc-600">
            Use the default body, replace it, or extend it with children.
          </p>
        </a>
        <a
          href="/docs/recipes/biaxial"
          class="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300"
        >
          <h3 class="font-semibold text-zinc-950">Biaxial charts</h3>
          <p class="mt-1 text-zinc-600">Bind CPU and GPU metrics to independent value axes.</p>
        </a>
        <a
          href="/docs/recipes/timeline"
          class="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300"
        >
          <h3 class="font-semibold text-zinc-950">Interval timelines</h3>
          <p class="mt-1 text-zinc-600">
            Render Gantt, flame, and trace spans with Rectangle and scales.
          </p>
        </a>
      </div>
    </section>
  </DocsPage>
);

const GettingStarted = () => (
  <DocsPage
    eyebrow="Getting started"
    title="A chart is a scale-aware SVG surface."
    lead="Axes own scales and their children draw the chrome. Series read those scales automatically. All components are unstyled SVG or HTML, so classes and native attributes pass through."
  >
    <p>
      Install the package with{" "}
      <code class="rounded bg-zinc-100 px-1.5 py-0.5">pnpm add peculiar-charts</code>, then add a
      chart to a Solid component.
    </p>
    <Code filename="SalesChart.tsx">{GETTING_STARTED}</Code>
    <section class="mt-8">
      <h2 class="text-xl font-semibold text-zinc-950">Axis names and formatting</h2>
      <p class="mt-3">
        <code class="rounded bg-zinc-100 px-1.5 py-0.5">Line</code> is a data series.{" "}
        <code class="rounded bg-zinc-100 px-1.5 py-0.5">AxisLine</code> is the axis baseline; the
        explicit name avoids importing two components named <code>Line</code>.
      </p>
      <p class="mt-3">
        Put shared tick formatting on <code>Axis</code> with <code>tickFormatter</code>. Use{" "}
        <code>AxisLabel format</code> only when that label needs to override its parent formatter.
      </p>
    </section>
  </DocsPage>
);

const Tooltips = () => (
  <DocsPage
    eyebrow="Tooltips"
    title="Replace the body or extend the default one."
    lead="AxisTooltip owns placement and visibility. Its content or children render-prop receives the active datum, label, index, and visible series. TooltipContent provides the standard header and series rows."
  >
    <Code filename="Chart.tsx">{TOOLTIP_COMPOSITION}</Code>
    <p>
      Children of <code>TooltipContent</code> render after the default body. Use a function child
      when the extra UI needs the active payload. For a completely different body, return your own
      markup from <code>AxisTooltip content</code> or its function child instead.
    </p>
  </DocsPage>
);

const Biaxial = () => (
  <DocsPage
    eyebrow="Recipe"
    title="Biaxial charts"
    lead="Give each value scale a distinct axis ID, then bind the affected series to that ID. This keeps CPU seconds and GPU cycles independently scaled while sharing a time axis."
  >
    <Code filename="CpuGpuChart.tsx">{BIAXIAL}</Code>
    <p>
      The left axis uses the default <code>y</code> ID. The right axis is named <code>gpu</code>,
      and only the GPU series supplies <code>yAxisId="gpu"</code>. The same pattern works for
      horizontal series with <code>xAxisId</code>.
    </p>
  </DocsPage>
);

const Timeline = () => (
  <DocsPage
    eyebrow="Recipe"
    title="Interval timelines"
    lead="For traces, Gantt charts, and flame-style spans, render a custom child over a numeric time axis and categorical lane axis. Each Rectangle begins at start and ends at end."
  >
    <Code filename="Intervals.tsx">{TIMELINE}</Code>
    <p>
      This is intentionally a documented composition pattern rather than a constrained interval
      series: spans can carry arbitrary lane hierarchy, colors, labels, and interactions. If they
      need legend or tooltip registration, promote the child into a custom series with the exported
      <code> createSeries </code> primitive.
    </p>
  </DocsPage>
);

const Bars = () => (
  <DocsPage
    eyebrow="Series"
    title="Bar orientation"
    lead="A Bar dataKey always identifies its numeric value-axis value. The layout determines whether that value axis is vertical or horizontal."
  >
    <Code filename="HorizontalBars.tsx">{HORIZONTAL_BARS}</Code>
    <p>
      The default layout is <code>vertical</code>: categories are on X and values are on Y. With{" "}
      <code>layout="horizontal"</code>, categories move to Y and values move to X. Grouping,
      stacking, and axis IDs work the same way in both orientations.
    </p>
  </DocsPage>
);

const NotFound = () => (
  <DocsPage
    eyebrow="Documentation"
    title="Page not found"
    lead="This documentation route does not exist yet. Start from the overview to browse the available guides."
  >
    <a href="/docs" class="font-medium text-blue-600 hover:text-blue-700">
      Go to the docs overview
    </a>
  </DocsPage>
);

export default function DocsRoute(props: DocsRouteProps) {
  switch (props.path.replace(/\/$/, "")) {
    case "/docs":
      return <Overview />;
    case "/docs/getting-started":
      return <GettingStarted />;
    case "/docs/tooltips":
      return <Tooltips />;
    case "/docs/recipes/biaxial":
      return <Biaxial />;
    case "/docs/recipes/timeline":
      return <Timeline />;
    case "/docs/series/bar":
      return <Bars />;
    default:
      return <NotFound />;
  }
}
