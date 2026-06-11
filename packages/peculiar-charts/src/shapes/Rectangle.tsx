import { type ComponentProps } from "solid-js";

export type RectangleProps = ComponentProps<"rect">;

/** Plain SVG `<rect>` shape primitive for custom overlays and series authors. */
const Rectangle = (props: RectangleProps) => <rect {...props} />;

export default Rectangle;
