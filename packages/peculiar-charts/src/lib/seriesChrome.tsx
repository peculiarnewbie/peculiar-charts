import { splitProps, type ComponentProps } from 'solid-js'

type SwatchProps = Omit<ComponentProps<'span'>, 'children'>

/** Shared colour swatch — pass `data-pc-*` via spread for legend vs tooltip. */
export const SeriesSwatch = (props: SwatchProps & { color: string }) => {
  const [local, rest] = splitProps(props, ['color', 'style'])
  return (
    <span
      {...rest}
      style={{
        display: 'inline-block',
        'flex-shrink': 0,
        background: local.color,
        ...(typeof local.style === 'object' && local.style !== null
          ? local.style
          : {}),
      }}
    />
  )
}
