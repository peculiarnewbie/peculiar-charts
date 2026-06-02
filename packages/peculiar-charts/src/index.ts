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
import type {
  AxisConfig,
  BarConfig,
  Domain,
  SeriesMeta,
} from '@src/components/context'
import type { Scale } from '@src/lib/scale'
import type { OverrideProps } from '@src/lib/types'
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
  Domain,
  SeriesMeta,
  // Series
  AreaProps,
  BarProps,
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
  // Others
  OverrideProps,
  CurveProps,
  ScaleType,
  Scale,
}

export {
  Chart,
  Legend,
  // Series
  Area,
  Bar,
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
}
