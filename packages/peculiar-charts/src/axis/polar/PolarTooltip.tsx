import { combineStyle } from "@corvu/utils/dom";
import { usePolarAxisContext } from "@src/axis/polar/context";
import { useChartContext } from "@src/components/context";
import createSize from "@src/lib/dom/createSize";
import createPolarClosestTick from "@src/lib/polar/createPolarClosestTick";
import { usePolarLayout } from "@src/lib/polar/context";
import { type PolarAngleScale } from "@src/lib/polar/scale";
import { polarToCartesian } from "@src/lib/polar/utils";
import {
  type TooltipPayload,
  type TooltipRenderer,
  buildTooltipPayload,
  renderTooltipBody,
  resolveTooltipRenderer,
} from "@src/lib/tooltip";
import type { OverrideProps } from "@src/lib/types";
import { axisValues } from "@src/lib/utils";
import { type ComponentProps, createMemo, createSignal, mergeProps, splitProps } from "solid-js";
import { Portal, isDev } from "solid-js/web";

export type PolarTooltipProps = OverrideProps<
  ComponentProps<"div">,
  {
    /** Offset outward along the active spoke from `outerRadius`, in px. @defaultValue `12` */
    pointerGap?: number;
    content?: TooltipRenderer;
    children?: TooltipRenderer;
  }
>;

export type { TooltipPayload, TooltipRenderer };

/** HTML tooltip for polar charts — snaps to the nearest category spoke.
 *
 * Place inside `<PolarAngleAxis>`. Uses the same payload shape as {@link AxisTooltip}.
 *
 * @data `data-pc-polar-tooltip` - Present on the tooltip element.
 */
const PolarTooltip = (props: PolarTooltipProps) => {
  const defaultedProps = mergeProps({ pointerGap: 12 }, props);
  const [localProps, otherProps] = splitProps(defaultedProps, [
    "pointerGap",
    "content",
    "children",
    "style",
  ]);
  const chartContext = useChartContext();
  const axisContext = usePolarAxisContext();
  const layout = usePolarLayout();
  const renderer = () => resolveTooltipRenderer(localProps.content, localProps.children);

  if (isDev && axisContext.axis() === "radius") {
    throw new Error("[peculiar-charts] PolarTooltip must be used inside <PolarAngleAxis>");
  }

  const [tooltipRef, setTooltipRef] = createSignal<HTMLDivElement | null>(null);
  const tooltipSize = createSize({ element: tooltipRef });

  const closestTick = createPolarClosestTick({
    layout,
    scale: () => axisContext.scale() as PolarAngleScale,
    values: () => axisValues(chartContext, axisContext.axisId(), axisContext.axis()),
    chartContext,
  });

  const payload = createMemo<TooltipPayload | undefined>(() => {
    const tick = closestTick();
    if (!tick) return undefined;
    return buildTooltipPayload(chartContext, axisContext.axisId(), "angle", tick.index);
  });

  /** Anchor on the active spoke just outside the chart — not at the raw pointer. */
  const anchor = createMemo(() => {
    const tick = closestTick();
    if (!tick) return undefined;
    const [sx, sy] = polarToCartesian(
      layout.cx(),
      layout.cy(),
      layout.outerRadius() + localProps.pointerGap,
      tick.angle,
    );
    return {
      x: chartContext.toContainerPosition(sx, "width"),
      y: chartContext.toContainerPosition(sy, "height"),
    };
  });

  const clampPosition = (preferred: number, size: number | undefined, max: number) => {
    if (size === undefined) return preferred;
    if (preferred + size > max) return Math.max(0, max - size);
    if (preferred < 0) return 0;
    return preferred;
  };

  const x = () => {
    const a = anchor();
    if (!a) return 0;
    const size = tooltipSize();
    const max = chartContext.toContainerPosition(chartContext.width(), "width");
    return clampPosition(a.x, size?.[0], max);
  };

  const y = () => {
    const a = anchor();
    if (!a) return 0;
    const size = tooltipSize();
    const max = chartContext.toContainerPosition(chartContext.height(), "height");
    return clampPosition(a.y, size?.[1], max);
  };

  return (
    <Portal mount={chartContext.wrapperRef() ?? undefined}>
      <div
        ref={setTooltipRef}
        style={combineStyle(
          {
            position: "absolute",
            "pointer-events": "none",
            top: 0,
            left: 0,
            opacity: chartContext.pointerInChart() ? 1 : 0,
            transform: `translate3d(${x()}px, ${y()}px, 0px)`,
          },
          localProps.style,
        )}
        data-pc-polar-tooltip=""
        {...otherProps}
      >
        {(() => {
          const p = payload();
          return p ? renderTooltipBody(renderer(), p) : null;
        })()}
      </div>
    </Portal>
  );
};

export default PolarTooltip;
