import Axis, {
  type AxisProps,
  type XAxisProps,
  type YAxisProps,
  type ScaleType,
} from '@src/axis/Axis'
import AxisCrosshair, {
  type CrosshairProps as AxisCrosshairProps,
} from '@src/axis/Crosshair'
import AxisGrid, { type GridProps as AxisGridProps } from '@src/axis/Grid'
import AxisLabel, {
  type LabelProps as AxisLabelProps,
  type LabelTick as AxisLabelTick,
} from '@src/axis/Label'
import AxisLine, { type LineProps as AxisLineProps } from '@src/axis/Line'
import AxisMark, { type MarkProps as AxisMarkProps, type MarkTick } from '@src/axis/Mark'
import AxisTooltip, {
  type TooltipProps as AxisTooltipProps,
} from '@src/axis/Tooltip'
import AxisValueLine, {
  type ValueLineProps as AxisValueLineProps,
} from '@src/axis/ValueLine'
import Chart, { type ChartProps } from '@src/components/Chart'
import Legend, { type LegendProps } from '@src/components/Legend'
import {
  type AxisConfig,
  type AxisOrientation,
  type BarConfig,
  type Domain,
  type SeriesMeta,
  useChartContext,
} from '@src/components/context'
import {
  type PlotArea,
  type ClosestTick,
  useAxisValues,
  useChartSize,
  useClosestTick,
  useData,
  useDomain,
  useInverseScale,
  useInverseXScale,
  useInverseYScale,
  usePlotArea,
  usePointerInChart,
  usePointerPosition,
  useScale,
  useSvgPointerPosition,
  useXScale,
  useYScale,
} from '@src/hooks'
import {
  type AnimationEasing,
  type AnimationOptions,
  type PhaseConfig,
  type PresenceItem,
  type PresenceMode,
  type ResolvedAnimationOptions,
  type ResolvedPhaseConfig,
  createPresence,
  createTweened,
  createTweenedArray,
  interpolateNumber,
  interpolatePoint,
  resolveAnimation,
} from '@src/lib/animation'
import type { BarLayout } from '@src/lib/createBands'
import createPoints from '@src/lib/createPoints'
import createScale from '@src/lib/createScale'
import createSeries from '@src/lib/createSeries'
import {
  Dot,
  type DotDatum,
  type DotProps,
  type DotRenderer,
  type PointEventDatum,
  type PointEventHandler,
  type PointEvents,
} from '@src/lib/markers'
import {
  type Scale,
  buildScale,
  invertScale,
  isCategorical,
  isNumeric,
  projectScale,
  scaleTicks,
} from '@src/lib/scale'
import type { OverrideProps } from '@src/lib/types'
import { accessData, axisValues, toNumeric } from '@src/lib/utils'
import ReferenceArea, {
  type ReferenceAreaProps,
} from '@src/reference/ReferenceArea'
import ReferenceDot, {
  type ReferenceDotProps,
} from '@src/reference/ReferenceDot'
import ReferenceLine, {
  type ReferenceLineProps,
} from '@src/reference/ReferenceLine'
import Area, { type AreaProps } from '@src/series/Area'
import Bar, { type BarProps } from '@src/series/Bar'
import Bubble, { type BubbleDatum, type BubbleProps } from '@src/series/Bubble'
import Line, { type LineProps } from '@src/series/Line'
import Pie, { type PieProps } from '@src/series/Pie'
import Point, { type PointDatum, type PointProps } from '@src/series/Point'
import SeriesLabel, {
  type SeriesLabelDatum,
  type SeriesLabelProps,
} from '@src/series/SeriesLabel'
import type { CurveProps } from '@src/shapes/Curve'
import Rectangle, { type RectangleProps } from '@src/shapes/Rectangle'
import Sector, { type SectorProps } from '@src/shapes/Sector'

export type {
  // Chart
  ChartProps,
  BarConfig,
  AxisConfig,
  AxisOrientation,
  Domain,
  SeriesMeta,
  // Animation
  AnimationEasing,
  AnimationOptions,
  PhaseConfig,
  PresenceItem,
  PresenceMode,
  ResolvedAnimationOptions,
  ResolvedPhaseConfig,
  // Series
  AreaProps,
  BarProps,
  BarLayout,
  BubbleProps,
  BubbleDatum,
  LineProps,
  PieProps,
  PointProps,
  PointDatum,
  SeriesLabelProps,
  SeriesLabelDatum,
  // Axis
  AxisProps,
  XAxisProps,
  YAxisProps,
  AxisCrosshairProps,
  AxisGridProps,
  AxisLabelProps,
  AxisLabelTick,
  AxisLineProps,
  AxisMarkProps,
  MarkTick,
  AxisTooltipProps,
  AxisValueLineProps,
  // Reference / annotations
  ReferenceLineProps,
  ReferenceAreaProps,
  ReferenceDotProps,
  // Overlays
  LegendProps,
  // Render-props / markers
  DotRenderer,
  DotDatum,
  DotProps,
  // Per-datum events
  PointEvents,
  PointEventDatum,
  PointEventHandler,
  // Others
  OverrideProps,
  CurveProps,
  RectangleProps,
  SectorProps,
  ScaleType,
  Scale,
  PlotArea,
  ClosestTick,
}

export {
  Chart,
  Legend,
  // Series
  Area,
  Bar,
  Bubble,
  Line,
  Pie,
  Point,
  SeriesLabel,
  // Axis
  Axis,
  AxisCrosshair,
  AxisGrid,
  AxisLabel,
  AxisLine,
  AxisMark,
  AxisTooltip,
  AxisValueLine,
  // Reference / annotations
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  // Shape primitives
  Dot,
  Rectangle,
  Sector,
  // Hooks — read chart state from custom children
  useChartContext,
  useScale,
  useXScale,
  useYScale,
  useInverseScale,
  useInverseXScale,
  useInverseYScale,
  useDomain,
  usePlotArea,
  useChartSize,
  useData,
  useAxisValues,
  usePointerPosition,
  useSvgPointerPosition,
  usePointerInChart,
  useClosestTick,
  // Series primitives — author custom series without forking
  createScale,
  createSeries,
  createPoints,
  // Animation primitives — author custom animated series
  createTweened,
  createTweenedArray,
  createPresence,
  interpolateNumber,
  interpolatePoint,
  resolveAnimation,
  // Scale primitives
  buildScale,
  projectScale,
  invertScale,
  scaleTicks,
  isCategorical,
  isNumeric,
  // Data utilities
  accessData,
  axisValues,
  toNumeric,
}
