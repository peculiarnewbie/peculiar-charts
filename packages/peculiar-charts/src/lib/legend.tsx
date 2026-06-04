import type { SeriesMeta } from '@src/components/context'
import { SeriesSwatch } from '@src/lib/seriesChrome'
import type { ContentRenderer } from '@src/lib/content'
import { renderContent, resolveContentRenderer } from '@src/lib/content'

export type LegendItemRenderer = ContentRenderer<SeriesMeta>

/**
 * Default unstyled legend item — swatch + name. Style via classes on `<Legend>`.
 *
 * @data `data-pc-legend-swatch` - Colour swatch.
 * @data `data-pc-legend-name` - Series name.
 */
export const LegendItemContent = (props: { series: SeriesMeta }) => (
  <>
    <SeriesSwatch
      color={props.series.color}
      data-pc-legend-swatch=""
      style={{ width: '10px', height: '10px', 'border-radius': '2px' }}
    />
    <span data-pc-legend-name="">{props.series.name}</span>
  </>
)

export const resolveLegendItemRenderer = resolveContentRenderer<SeriesMeta>

export const renderLegendItem = (
  renderer: LegendItemRenderer,
  series: SeriesMeta,
) =>
  renderContent(renderer, series, ({ payload }) => (
    <LegendItemContent series={payload} />
  ))
