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
import AxisMark, { type MarkProps as AxisMarkProps } from '@src/axis/Mark'
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
  useAxisValues,
  useChartSize,
  useData,
  useDomain,
  usePlotArea,
  useScale,
  useXScale,
  useYScale,
} from '@src/hooks'
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

export type {
  // Chart
  ChartProps,
  BarConfig,
  AxisConfig,
  AxisOrientation,
  Domain,
  SeriesMeta,
  // Series
  AreaProps,
  BarProps,
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
  ScaleType,
  Scale,
  PlotArea,
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
  // Hooks — read chart state from custom children
  useChartContext,
  useScale,
  useXScale,
  useYScale,
  useDomain,
  usePlotArea,
  useChartSize,
  useData,
  useAxisValues,
  // Series primitives — author custom series without forking
  createScale,
  createSeries,
  createPoints,
  // Scale primitives
  buildScale,
  projectScale,
  scaleTicks,
  isCategorical,
  isNumeric,
  // Data utilities
  accessData,
  axisValues,
  toNumeric,
}
