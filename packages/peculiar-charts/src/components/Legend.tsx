import { dataIf } from '@corvu/utils'
import { combineStyle } from '@corvu/utils/dom'
import { type SeriesMeta, useChartContext } from '@src/components/context'
import type { OverrideProps } from '@src/lib/types'
import {
  type ComponentProps,
  For,
  type JSX,
  mergeProps,
  splitProps,
} from 'solid-js'
import { Portal } from 'solid-js/web'

export type LegendProps = OverrideProps<
  ComponentProps<'div'>,
  {
    /** Toggle series visibility on click. @defaultValue `true` */
    interactive?: boolean
    /** Render a custom legend item from its series metadata. */
    children?: (series: SeriesMeta) => JSX.Element
  }
>

/**
 * Auto-generated legend driven by the series registry. Each registered series
 * gets an item; clicking toggles its visibility (when `interactive`).
 *
 * @data `data-pc-legend` - Present on the legend container.
 * @data `data-pc-legend-item` - Present on every legend item.
 * @data `data-pc-legend-swatch` - Present on every colour swatch.
 */
const Legend = (props: LegendProps) => {
  const defaultedProps = mergeProps({ interactive: true }, props)
  const [localProps, otherProps] = splitProps(defaultedProps, [
    'interactive',
    'children',
    'style',
  ])
  const chartContext = useChartContext()

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
              {localProps.children ? (
                localProps.children(series)
              ) : (
                <>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      'border-radius': '2px',
                      background: series.color,
                    }}
                    data-pc-legend-swatch=""
                  />
                  {series.name}
                </>
              )}
            </button>
          )}
        </For>
      </div>
    </Portal>
  )
}

export default Legend
