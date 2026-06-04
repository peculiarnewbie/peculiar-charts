import type {
  AxisOrientation,
  ChartContextType,
  SeriesMeta,
} from '@src/components/context'
import {
  type ContentRenderer,
  renderContent,
  resolveContentRenderer,
} from '@src/lib/content'
import { SeriesSwatch } from '@src/lib/seriesChrome'
import { accessData, axisValues } from '@src/lib/utils'
import { For } from 'solid-js'

/** A visible series row in a tooltip payload. */
export type TooltipSeriesItem = SeriesMeta & {
  /** Value at the active datum index, when the series registered a `dataKey`. */
  value: unknown
}

/** Context passed to tooltip renderers — the active datum plus registered series. */
export type TooltipPayload = {
  /** Full data row at the active index. */
  data: any
  /** Index of the active datum along the tooltip axis. */
  index: number
  /** Domain label for the active tick (e.g. the x-axis category). */
  label: unknown
  /** Visible series with values resolved at `index`. */
  series: TooltipSeriesItem[]
}

export type TooltipRenderer = ContentRenderer<TooltipPayload>

/** Builds the tooltip payload for the datum nearest the pointer on an axis. */
export const buildTooltipPayload = (
  ctx: ChartContextType,
  axisId: string,
  orientation: AxisOrientation,
  index: number,
): TooltipPayload => {
  const data = ctx.data()
  const row = data[index]
  const labels = axisValues(ctx, axisId, orientation)

  const series = ctx
    .seriesMeta()
    .filter((s) => ctx.isSeriesVisible(s.id))
    .map((s) => ({
      ...s,
      value:
        s.dataKey !== undefined
          ? accessData<unknown>(data, s.dataKey)[index]
          : undefined,
    }))

  return {
    data: row,
    index,
    label: labels[index],
    series,
  }
}

/**
 * Default unstyled tooltip body — header from the axis label, one row per
 * visible registered series. Style it with Tailwind/classes on `<AxisTooltip>`.
 *
 * @data `data-pc-tooltip-header` - Label row.
 * @data `data-pc-tooltip-row` - Series value row.
 * @data `data-pc-tooltip-swatch` - Colour swatch.
 */
export const TooltipContent = (props: { payload: TooltipPayload }) => (
  <>
    <div data-pc-tooltip-header="">{String(props.payload.label ?? '')}</div>
    <For each={props.payload.series}>
      {(s) => (
        <div data-pc-tooltip-row="">
          <SeriesSwatch
            color={s.color}
            data-pc-tooltip-swatch=""
            style={{ width: '8px', height: '8px', 'border-radius': '9999px' }}
          />
          <span data-pc-tooltip-name="">{s.name}</span>
          <span data-pc-tooltip-value="">
            {s.value === undefined || s.value === null ? '—' : String(s.value)}
          </span>
        </div>
      )}
    </For>
  </>
)

export const resolveTooltipRenderer = resolveContentRenderer<TooltipPayload>

export const renderTooltipBody = (
  renderer: TooltipRenderer,
  payload: TooltipPayload,
) =>
  renderContent(renderer, payload, ({ payload: p }) => (
    <TooltipContent payload={p} />
  ))
