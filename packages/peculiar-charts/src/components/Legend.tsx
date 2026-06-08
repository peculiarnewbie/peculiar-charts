import { dataIf } from '@corvu/utils'
import { combineStyle } from '@corvu/utils/dom'
import { type SeriesMeta, useChartContext } from '@src/components/context'
import {
  type LegendItemRenderer,
  renderLegendItem,
  resolveLegendItemRenderer,
} from '@src/lib/legend'
import type { OverrideProps } from '@src/lib/types'
import { type ComponentProps, For, mergeProps, splitProps } from 'solid-js'
import { Portal } from 'solid-js/web'

export type LegendProps = OverrideProps<
  ComponentProps<'div'>,
  {
    /** Toggle series visibility on click. @defaultValue `true` */
    interactive?: boolean
    /**
     * Per-series legend item renderer — Recharts-style alias for `children`.
     * `true` (or omit both) renders the default swatch + name.
     */
    content?: LegendItemRenderer
    /** Per-series legend item renderer. Alias: see `content`. */
    children?: LegendItemRenderer
    /** Fired when the pointer enters a legend item. */
    onMouseEnter?: (series: SeriesMeta, event: MouseEvent) => void
    /** Fired when the pointer leaves a legend item. */
    onMouseLeave?: (series: SeriesMeta, event: MouseEvent) => void
  }
>

export type { LegendItemRenderer }

/**
 * Auto-generated legend driven by the series registry. Each registered series
 * gets an item; clicking toggles its visibility (when `interactive`).
 *
 * @data `data-pc-legend` - Present on the legend container.
 * @data `data-pc-legend-item` - Present on every legend item.
 */
const Legend = (props: LegendProps) => {
  const defaultedProps = mergeProps({ interactive: true }, props)
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'interactive',
    'content',
    'children',
    'style',
    'onMouseEnter',
    'onMouseLeave',
  ])
  const chartContext = useChartContext()
  const itemRenderer = () =>
    resolveLegendItemRenderer(localProps.content, localProps.children)

  return (
    <Portal mount={chartContext.wrapperRef() ?? undefined}>
      <div
        style={combineStyle(
          {
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            'flex-wrap': 'wrap',
            gap: '8px',
          },
          localProps.style,
        )}
        data-pc-legend=""
        {...otherProps}
      >
        <For each={chartContext.seriesMeta()}>
          {(series) => (
            <button
              type="button"
              disabled={!localProps.interactive}
              onClick={() =>
                localProps.interactive && chartContext.toggleSeries(series.id)
              }
              onMouseEnter={(e) => localProps.onMouseEnter?.(series, e)}
              onMouseLeave={(e) => localProps.onMouseLeave?.(series, e)}
              style={{
                display: 'flex',
                'align-items': 'center',
                gap: '6px',
                cursor: localProps.interactive ? 'pointer' : 'default',
                opacity: chartContext.isSeriesVisible(series.id) ? 1 : 0.4,
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                color: 'inherit',
              }}
              data-pc-legend-item=""
              data-hidden={dataIf(!chartContext.isSeriesVisible(series.id))}
            >
              {renderLegendItem(itemRenderer(), series)}
            </button>
          )}
        </For>
      </div>
    </Portal>
  )
}

export default Legend
