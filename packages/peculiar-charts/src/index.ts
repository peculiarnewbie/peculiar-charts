import Axis, {
  type AxisProps,
  type XAxisProps,
  type YAxisProps,
  type ScaleType,
} from "@src/axis/Axis";
import AxisCrosshair, { type CrosshairProps as AxisCrosshairProps } from "@src/axis/Crosshair";
import AxisGrid, { type GridProps as AxisGridProps } from "@src/axis/Grid";
import AxisLabel, {
  type LabelProps as AxisLabelProps,
  type LabelTick as AxisLabelTick,
} from "@src/axis/Label";
import AxisLine, { type LineProps as AxisLineProps } from "@src/axis/Line";
import AxisMark, { type MarkProps as AxisMarkProps, type MarkTick } from "@src/axis/Mark";
import AxisTooltip, {
  type TooltipProps as AxisTooltipProps,
  type TooltipPayload,
  type TooltipRenderer,
} from "@src/axis/Tooltip";
import AxisValueLine, { type ValueLineProps as AxisValueLineProps } from "@src/axis/ValueLine";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import PolarAngleAxis, { type PolarAngleAxisProps } from "@src/axis/polar/PolarAngleAxis";
import PolarAngleLabel, { type PolarAngleLabelProps } from "@src/axis/polar/PolarAngleLabel";
import PolarCrosshair, { type PolarCrosshairProps } from "@src/axis/polar/PolarCrosshair";
import PolarGrid, { type PolarGridProps } from "@src/axis/polar/PolarGrid";
import PolarLayout, { type PolarLayoutProps } from "@src/axis/polar/PolarLayout";
import PolarRadiusAxis, { type PolarRadiusAxisProps } from "@src/axis/polar/PolarRadiusAxis";
import PolarRadiusLabel, { type PolarRadiusLabelProps } from "@src/axis/polar/PolarRadiusLabel";
import PolarTooltip, { type PolarTooltipProps } from "@src/axis/polar/PolarTooltip";
import Brush, { type BrushProps } from "@src/components/Brush";
import Chart, { type ChartEventPayload, type ChartProps } from "@src/components/Chart";
import Legend, { type LegendProps, type LegendItemRenderer } from "@src/components/Legend";
import {
  type AxisConfig,
  type AxisOrientation,
  type BarConfig,
  type BrushRange,
  type Domain,
  type SeriesMeta,
  type StackOffset,
  type SyncInteraction,
  useChartContext,
} from "@src/components/context";
import {
  type ClosestPolarTick,
  type ClosestTick,
  type PlotArea,
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
  usePolarClosestTick,
  useScale,
  useSvgPointerPosition,
  useXScale,
  useYScale,
} from "@src/hooks";
import {
  type AnimationEasing,
  type AnimationMatchBy,
  type AnimationOptions,
  type PhaseConfig,
  type PresenceItem,
  type PresenceMode,
  type ResolvedAnimationOptions,
  type ResolvedPhaseConfig,
  type ShapeAnimationProps,
  createPresence,
  createTweened,
  createTweenedArray,
  interpolateNumber,
  interpolatePoint,
  resolveAnimation,
} from "@src/lib/animation";
import type { BarLayout } from "@src/lib/createBands";
import createPoints from "@src/lib/createPoints";
import createScale from "@src/lib/createScale";
import createSeries from "@src/lib/createSeries";
import {
  LabelLine,
  type LabelLineDatum,
  type LabelLineProps,
  type LabelLineRenderer,
} from "@src/lib/labels";
import { LegendItemContent } from "@src/lib/legend";
import {
  type BarDatum,
  BarShape,
  type BarShapeProps,
  type BarShapeRenderer,
  Dot,
  type DotDatum,
  type DotProps,
  type DotRenderer,
  type PointEventDatum,
  type PointEventHandler,
  type PointEvents,
} from "@src/lib/markers";
import { type PolarLayout as PolarLayoutContext, usePolarLayout } from "@src/lib/polar/context";
import createPolarPoints from "@src/lib/polar/createPolarPoints";
import { polarToCartesian } from "@src/lib/polar/utils";
import {
  type Scale,
  buildScale,
  invertScale,
  isCategorical,
  isNumeric,
  projectScale,
  scaleTicks,
} from "@src/lib/scale";
import type { SyncHandlerParam, SyncMethod, SyncPayload } from "@src/lib/sync";
import {
  TooltipContent,
  type TooltipContentProps,
  type TooltipSeriesItem,
  buildTooltipPayload,
} from "@src/lib/tooltip";
import type { OverrideProps } from "@src/lib/types";
import { accessData, axisValues, toNumeric } from "@src/lib/utils";
import ReferenceArea, { type ReferenceAreaProps } from "@src/reference/ReferenceArea";
import ReferenceDot, { type ReferenceDotProps } from "@src/reference/ReferenceDot";
import ReferenceLine, { type ReferenceLineProps } from "@src/reference/ReferenceLine";
import Area, {
  type AreaProps,
  type AreaShapeProps,
  type AreaShapeRenderer,
} from "@src/series/Area";
import Bar, { type BarProps } from "@src/series/Bar";
import Bubble, { type BubbleDatum, type BubbleProps } from "@src/series/Bubble";
import Line, {
  type LineProps,
  type LineShapeProps,
  type LineShapeRenderer,
} from "@src/series/Line";
import Pie, { type PieProps } from "@src/series/Pie";
import Point, { type PointDatum, type PointProps } from "@src/series/Point";
import Radar, { type RadarProps } from "@src/series/Radar";
import SeriesLabel, { type SeriesLabelDatum, type SeriesLabelProps } from "@src/series/SeriesLabel";
import Curve from "@src/shapes/Curve";
import type { CurveProps } from "@src/shapes/Curve";
import PolarPolygon, { type PolarPolygonProps } from "@src/shapes/PolarPolygon";
import Rectangle, { type RectangleProps } from "@src/shapes/Rectangle";
import Sector, { type SectorProps } from "@src/shapes/Sector";

export type {
  // Chart
  ChartEventPayload,
  ChartProps,
  BrushProps,
  BrushRange,
  BarConfig,
  AxisConfig,
  AxisOrientation,
  Domain,
  SeriesMeta,
  StackOffset,
  SyncMethod,
  SyncHandlerParam,
  SyncPayload,
  SyncInteraction,
  // Standard Schema
  StandardSchemaV1,
  // Animation
  AnimationEasing,
  AnimationMatchBy,
  AnimationOptions,
  PhaseConfig,
  PresenceItem,
  PresenceMode,
  ResolvedAnimationOptions,
  ResolvedPhaseConfig,
  ShapeAnimationProps,
  // Series
  AreaProps,
  AreaShapeProps,
  AreaShapeRenderer,
  BarProps,
  BarLayout,
  BubbleProps,
  BubbleDatum,
  LineProps,
  LineShapeProps,
  LineShapeRenderer,
  PieProps,
  RadarProps,
  PointProps,
  PointDatum,
  SeriesLabelProps,
  SeriesLabelDatum,
  LabelLineRenderer,
  LabelLineDatum,
  LabelLineProps,
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
  TooltipContentProps,
  TooltipPayload,
  TooltipRenderer,
  TooltipSeriesItem,
  AxisValueLineProps,
  // Polar
  PolarLayoutProps,
  PolarLayoutContext,
  PolarAngleAxisProps,
  PolarAngleLabelProps,
  PolarRadiusAxisProps,
  PolarRadiusLabelProps,
  PolarGridProps,
  PolarCrosshairProps,
  PolarTooltipProps,
  PolarPolygonProps,
  // Reference / annotations
  ReferenceLineProps,
  ReferenceAreaProps,
  ReferenceDotProps,
  // Overlays
  LegendProps,
  LegendItemRenderer,
  // Render-props / markers
  DotRenderer,
  DotDatum,
  DotProps,
  BarShapeRenderer,
  BarDatum,
  BarShapeProps,
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
  ClosestPolarTick,
};

export {
  Chart,
  Brush,
  Legend,
  // Series
  Area,
  Bar,
  Bubble,
  Line,
  Pie,
  Radar,
  Point,
  SeriesLabel,
  // Polar
  PolarLayout,
  PolarAngleAxis,
  PolarAngleLabel,
  PolarRadiusAxis,
  PolarRadiusLabel,
  PolarGrid,
  PolarCrosshair,
  PolarTooltip,
  PolarPolygon,
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
  Curve,
  Dot,
  BarShape,
  LabelLine,
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
  usePolarClosestTick,
  usePolarLayout,
  // Series primitives — author custom series without forking
  createScale,
  createSeries,
  createPoints,
  createPolarPoints,
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
  polarToCartesian,
  // Tooltip / legend bodies
  TooltipContent,
  LegendItemContent,
  buildTooltipPayload,
};
