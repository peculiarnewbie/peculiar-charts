import type { ComponentProps } from "solid-js";
import { assign } from "solid-js/web";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz ";

const PROPS_IGNORELIST: (keyof Omit<ComponentProps<"text">, "x" | "y">)[] = [
  "fill",
  "text-anchor",
  "dominant-baseline",
  "dx",
  "dy",
];

const sizeCache = new Map<string, { x: number; y: number }>();

/**
 * Measures the average character size of a label by inserting a hidden `<text>`
 * with the same props under the same parent. Cached per axis + prop signature.
 */
export const getAverageCharSize = (
  parentRef: SVGElement,
  props: Omit<ComponentProps<"text">, "x" | "y">,
  axisId: string,
) => {
  const propsCopy = { ...props };
  for (const prop of PROPS_IGNORELIST) delete propsCopy[prop];

  const cacheKey = `${axisId}-${JSON.stringify(propsCopy)}`;
  const cached = sizeCache.get(cacheKey);
  if (cached) return cached;

  const textElement = parentRef.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "text");
  assign(textElement, propsCopy, true, true);
  textElement.textContent = ALPHABET;
  textElement.style.visibility = "hidden";
  parentRef.appendChild(textElement);
  const bbox = textElement.getBBox();
  parentRef.removeChild(textElement);

  const size = { x: bbox.width / ALPHABET.length, y: bbox.height };
  sizeCache.set(cacheKey, size);
  return size;
};
