import type { JSX } from "solid-js";

/** bool | render-fn — shared by tooltip, legend, and other overlay bodies. */
export type ContentRenderer<T> = boolean | ((payload: T) => JSX.Element);

/** Prefer `content`, then `children`, then default to `true`. */
export const resolveContentRenderer = <T>(
  content: ContentRenderer<T> | undefined,
  children: ContentRenderer<T> | undefined,
): ContentRenderer<T> => content ?? children ?? true;

export const renderContent = <T>(
  renderer: ContentRenderer<T>,
  payload: T,
  Default: (props: { payload: T }) => JSX.Element,
) => {
  if (renderer === true) return Default({ payload });
  if (typeof renderer === "function") return renderer(payload);
  return null;
};
