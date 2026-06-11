import { type MaybeAccessor, access } from "@corvu/utils/reactivity";
import { type Accessor, createEffect, createSignal, onCleanup, untrack } from "solid-js";

/** Tracks an element's `[width, height]` via a ResizeObserver. */
const createSize = (props: {
  element: MaybeAccessor<HTMLElement | null>;
}): Accessor<[number, number] | null> => {
  const [size, setSize] = createSignal<[number, number] | null>(null);

  const syncSize = (element: Element) => {
    untrack(() => {
      const newSize: [number, number] = [element.clientWidth, element.clientHeight];
      const current = size();
      if (current !== null && current[0] === newSize[0] && current[1] === newSize[1]) return;
      setSize(newSize);
    });
  };

  createEffect(() => {
    const element = access(props.element);
    if (!element) return;
    syncSize(element);
    const observer = new ResizeObserver(([entry]) => syncSize(entry!.target));
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });

  return size;
};

export default createSize;
