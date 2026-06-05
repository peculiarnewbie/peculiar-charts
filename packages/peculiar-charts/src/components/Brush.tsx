import {
  type BrushRange,
  useChartContext,
} from '@src/components/context'
import { BrushContextProvider } from '@src/components/BrushContext'
import {
  type ComponentProps,
  type JSX,
  Show,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
} from 'solid-js'

const HANDLE_WIDTH = 5
const BRUSH_HEIGHT = 40
const BRUSH_GAP = 4
const BRUSH_INSET_KEY = '__brush__'

export type BrushProps = Omit<ComponentProps<'g'>, 'children'> & {
  /** Height of the brush area in pixels. @defaultValue `40` */
  height?: number
  /** Gap between the main chart and the brush in pixels. @defaultValue `4` */
  gap?: number
  /** Width of each drag handle in pixels. @defaultValue `5` */
  handleWidth?: number
  /** Controlled start index. */
  startIndex?: number
  /** Controlled end index. */
  endIndex?: number
  /** Called continuously during drag with the new range. */
  onChange?: (range: BrushRange) => void
  /** Called when the drag finishes. */
  onDragEnd?: (range: BrushRange) => void
  /** Series components to render as the mini chart preview. */
  children?: JSX.Element
}

/**
 * A data range selector with a mini chart preview.
 *
 * Renders draggable handles and a slide area below the main chart. Children
 * are rendered as a miniature preview of the full dataset.
 *
 * @data `data-pc-brush` - Present on the brush group element.
 * @data `data-pc-brush-bg` - Present on the background rect.
 * @data `data-pc-brush-slide` - Present on the selected range overlay.
 * @data `data-pc-brush-handle` - Present on each drag handle.
 */
const Brush = (props: BrushProps) => {
  const clipId = createUniqueId()
  const defaulted = mergeProps(
    {
      height: BRUSH_HEIGHT,
      gap: BRUSH_GAP,
      handleWidth: HANDLE_WIDTH,
    },
    props,
  )
  const [local, other] = splitProps(defaulted, [
    'height',
    'gap',
    'handleWidth',
    'startIndex',
    'endIndex',
    'onChange',
    'onDragEnd',
    'children',
  ])

  const ctx = useChartContext()
  const dataLen = () => ctx.data().length

  // --- state ---------------------------------------------------------------
  const [internalStart, setInternalStart] = createSignal(0)
  const [internalEnd, setInternalEnd] = createSignal(0)

  onMount(() => {
    const len = dataLen()
    if (len > 0) {
      if (local.startIndex === undefined) setInternalStart(0)
      if (local.endIndex === undefined) setInternalEnd(len - 1)
    }
  })

  const start = createMemo(() =>
    local.startIndex !== undefined ? local.startIndex : internalStart(),
  )
  const end = createMemo(() =>
    local.endIndex !== undefined ? local.endIndex : internalEnd(),
  )

  const clampedStart = createMemo(() =>
    Math.max(0, Math.min(start(), dataLen() - 1)),
  )
  const clampedEnd = createMemo(() =>
    Math.max(clampedStart(), Math.min(end(), dataLen() - 1)),
  )

  const setRange = (s: number, e: number) => {
    const len = dataLen()
    const cs = Math.max(0, Math.min(s, len - 1))
    const ce = Math.max(cs, Math.min(e, len - 1))
    if (local.startIndex === undefined) setInternalStart(cs)
    if (local.endIndex === undefined) setInternalEnd(ce)
    local.onChange?.({ startIndex: cs, endIndex: ce })
  }

  // --- displayed data for the main chart -----------------------------------
  createMemo(() => {
    ctx.setBrushRange({
      startIndex: clampedStart(),
      endIndex: clampedEnd(),
    })
  })

  onCleanup(() => ctx.setBrushRange(null))

  // --- dimensions ----------------------------------------------------------
  const insetTotal = local.height + local.gap
  const pad = 1
  const innerH = local.height - pad * 2

  onMount(() => {
    ctx.registerInset('bottom', BRUSH_INSET_KEY, insetTotal)
    onCleanup(() => ctx.unregisterInset('bottom', BRUSH_INSET_KEY))
  })

  const chartW = () => ctx.width()
  const chartH = () => ctx.height()
  const brushY = () => chartH() - insetTotal + local.gap
  const innerW = () => Math.max(0, chartW() - pad * 2)

  // --- pixel <-> index conversion ------------------------------------------
  const indexToX = (i: number) => {
    const len = dataLen()
    if (len <= 1) return pad
    return pad + (i / (len - 1)) * innerW()
  }

  const xToIndex = (x: number) => {
    const len = dataLen()
    if (len <= 1) return 0
    return Math.round(((x - pad) / innerW()) * (len - 1))
  }

  // --- drag ----------------------------------------------------------------
  const [dragging, setDragging] = createSignal<
    null | 'start' | 'end' | 'slide'
  >(null)
  const [dragStartIdx, setDragStartIdx] = createSignal(0)
  const [dragEndIdx, setDragEndIdx] = createSignal(0)

  const handlePointerDown = (
    which: 'start' | 'end' | 'slide',
    e: MouseEvent,
  ) => {
    e.preventDefault()
    setDragging(which)
    setDragStartIdx(clampedStart())
    setDragEndIdx(clampedEnd())

    const svg = (e.target as SVGElement).ownerSVGElement
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const svgScale = chartW() / rect.width
    const initSvgX = (e.clientX - rect.left) * svgScale
    const initIndex = xToIndex(initSvgX)

    const onMove = (ev: MouseEvent) => {
      const curSvgX = (ev.clientX - rect.left) * svgScale
      const indexDelta = xToIndex(curSvgX) - initIndex
      const len = dataLen()

      if (which === 'start') {
        const newStart = Math.max(
          0,
          Math.min(dragStartIdx() + indexDelta, clampedEnd()),
        )
        setRange(newStart, clampedEnd())
      } else if (which === 'end') {
        const newEnd = Math.max(
          clampedStart(),
          Math.min(dragEndIdx() + indexDelta, len - 1),
        )
        setRange(clampedStart(), newEnd)
      } else {
        const span = dragEndIdx() - dragStartIdx()
        let newStart = dragStartIdx() + indexDelta
        let newEnd = dragEndIdx() + indexDelta
        if (newStart < 0) {
          newStart = 0
          newEnd = span
        }
        if (newEnd > len - 1) {
          newEnd = len - 1
          newStart = newEnd - span
        }
        setRange(newStart, newEnd)
      }
    }

    const onUp = () => {
      setDragging(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      local.onDragEnd?.({ startIndex: clampedStart(), endIndex: clampedEnd() })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // --- render --------------------------------------------------------------
  const startX = () => indexToX(clampedStart())
  const endX = () => indexToX(clampedEnd())
  const hw = local.handleWidth

  return (
    <g data-pc-brush="" {...other}>
      {/* background */}
      <rect
        x={0}
        y={brushY()}
        width={chartW()}
        height={local.height}
        fill="#f4f4f5"
        stroke="#d4d4d8"
        stroke-width={1}
        rx={2}
        data-pc-brush-bg=""
      />

      {/* mini chart preview */}
      <Show when={local.children}>
        <clipPath id={`pc-brush-clip-${clipId}`}>
          <rect
            x={pad}
            y={brushY() + pad}
            width={innerW()}
            height={innerH}
          />
        </clipPath>
        <g clip-path={`url(#pc-brush-clip-${clipId})`}>
          <BrushContextProvider
            mainContext={ctx}
            width={innerW()}
            height={innerH}
            data={ctx.data}
          >
            <g transform={`translate(${pad}, ${brushY() + pad})`}>
              {local.children}
            </g>
          </BrushContextProvider>
        </g>
      </Show>

      {/* slide (selected range overlay) */}
      <rect
        x={Math.min(startX(), endX()) + hw}
        y={brushY()}
        width={Math.max(0, Math.abs(endX() - startX()) - hw * 2)}
        height={local.height}
        fill="#a1a1aa"
        fill-opacity={0.2}
        cursor="move"
        data-pc-brush-slide=""
        onMouseDown={(e) => handlePointerDown('slide', e)}
      />

      {/* start handle */}
      <rect
        x={startX()}
        y={brushY()}
        width={hw}
        height={local.height}
        fill="#a1a1aa"
        stroke="#71717a"
        stroke-width={0.5}
        cursor="col-resize"
        data-pc-brush-handle=""
        onMouseDown={(e) => handlePointerDown('start', e)}
      />

      {/* end handle */}
      <rect
        x={endX() - hw}
        y={brushY()}
        width={hw}
        height={local.height}
        fill="#a1a1aa"
        stroke="#71717a"
        stroke-width={0.5}
        cursor="col-resize"
        data-pc-brush-handle=""
        onMouseDown={(e) => handlePointerDown('end', e)}
      />
    </g>
  )
}

export default Brush
