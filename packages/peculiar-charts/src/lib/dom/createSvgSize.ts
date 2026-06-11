import { type MaybeAccessor, access } from "@corvu/utils/reactivity";
import { type Accessor, createEffect, createSignal, onCleanup, untrack } from "solid-js";

/** Tracks one dimension of an SVG element, reporting changes to a callback —
 * used so axis labels can register the space they occupy as a chart inset. */
const createSvgSize = (props: {
  element: MaybeAccessor<SVGElement | null>;
  dimension: MaybeAccessor<"width" | "height">;
  onSizeChange?: (size: number) => void;
  onCleanup?: () => void;
}): Accessor<number | null> => {
  const [size, setSize] = createSignal<number | null>(null);

  const syncSize = (element: Element) => {
    const dimension = access(props.dimension);
    untrack(() => {
      const rect = element.getBoundingClientRect();
      const newSize = dimension === "width" ? rect.width : rect.height;
      if (newSize === 0 || size() === newSize) return;
      setSize(newSize);
      props.onSizeChange?.(newSize);
    });
  };

  createEffect(() => {
    const element = access(props.element);
    if (!element) return;
    syncSize(element);
    const observer = new ResizeObserver(([entry]) => syncSize(entry!.target));
    observer.observe(element);
    onCleanup(() => {
      observer.disconnect();
      props.onCleanup?.();
    });
  });

  return size;
};

export default createSvgSize;
