import { useChartContext } from "@src/components/context";
import createPoints from "@src/lib/createPoints";
import { LabelLine, type LabelLineRenderer } from "@src/lib/labels";
import type { OverrideProps } from "@src/lib/types";
import { accessData, pointDefined } from "@src/lib/utils";
import {
  type ComponentProps,
  For,
  type JSX,
  Show,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";

/** A label's anchor point plus the datum it came from. */
export type SeriesLabelDatum = {
  point: [number, number];
  /** Where the label sits — end of the connector when `labelLine` is set. */
  labelPoint: [number, number];
  value: number;
  index: number;
};

export type SeriesLabelProps = OverrideProps<
  Omit<ComponentProps<"text">, "x" | "y">,
  {
    /** Data key for the y-values. Omit for plain number arrays. */
    dataKey?: string;
    /** Bound x-axis id. @defaultValue `'x'` */
    xAxisId?: string;
    /** Bound value-axis id. @defaultValue `'y'` */
    yAxisId?: string;
    /** Stack id — must match the labelled series' stack. */
    stackId?: string;
    /** Pixel offset above each point (away from the plot). @defaultValue `8` */
    offset?: number;
    /** Format a value to its label string. @defaultValue `String` */
    format?: (value: number, index: number) => string;
    /** Connector from point to label — bool, props-object, or function. */
    labelLine?: LabelLineRenderer;
    /** Render each label yourself instead of the default `<text>`. */
    children?: (datum: SeriesLabelDatum) => JSX.Element;
  }
>;

/** Renders a value label at each data point of a series.
 *
 * @data `data-pc-series-label-group` - Present on the label group element.
 * @data `data-pc-series-label` - Present on every label text element.
 */
const SeriesLabel = (props: SeriesLabelProps) => {
  const defaultedProps = mergeProps(
    {
      xAxisId: "x",
      yAxisId: "y",
      offset: 8,
      format: (value: number) => String(value),
      fill: "currentColor",
      "text-anchor": "middle" as const,
    },
    props,
  );
  const [localProps, otherProps] = splitProps(defaultedProps, [
    "dataKey",
    "xAxisId",
    "yAxisId",
    "stackId",
    "offset",
    "format",
    "labelLine",
    "children",
  ]);
  const chartContext = useChartContext();

  const data = createMemo(() =>
    accessData<number>(chartContext.displayedData(), localProps.dataKey),
  );

  const points = createPoints({
    xAxisId: () => localProps.xAxisId,
    yAxisId: () => localProps.yAxisId,
    dataKey: () => localProps.dataKey,
    stackId: () => localProps.stackId,
    data,
    chartContext,
  });

  const labelPoint = (point: [number, number]): [number, number] => [
    point[0],
    point[1] - localProps.offset,
  ];

  const datum = (point: [number, number], value: number, index: number): SeriesLabelDatum => ({
    point,
    labelPoint: labelPoint(point),
    value,
    index,
  });

  return (
    <g data-pc-series-label-group="">
      <For each={points()}>
        {(point, index) => (
          <Show when={pointDefined(point)}>
            {(() => {
              const d = datum(point, data()[index()] as number, index());
              return (
                <>
                  <Show when={localProps.labelLine}>
                    <LabelLine renderer={localProps.labelLine!} datum={d} />
                  </Show>
                  <Show
                    when={localProps.children}
                    fallback={
                      <text
                        x={d.labelPoint[0]}
                        y={d.labelPoint[1]}
                        data-pc-series-label=""
                        {...otherProps}
                      >
                        {localProps.format(d.value, d.index)}
                      </text>
                    }
                  >
                    {(children) => children()(d)}
                  </Show>
                </>
              );
            })()}
          </Show>
        )}
      </For>
    </g>
  );
};

export default SeriesLabel;
