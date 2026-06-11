import { Resvg } from "@resvg/resvg-js";
import { PNG } from "pngjs";

export interface SvgToPngOptions {
  width?: number;
  height?: number;
  background?: string;
}

export function svgToPng(svgString: string, options: SvgToPngOptions = {}): PNG {
  const { background = "#ffffff" } = options;

  const resvg = new Resvg(svgString, {
    background,
    font: { loadSystemFonts: false },
    shapeRendering: 2,
  });

  const rendered = resvg.render();
  const pngBuffer = rendered.asPng();
  return PNG.sync.read(pngBuffer);
}

export function svgToPngBuffer(svgString: string, options: SvgToPngOptions = {}): Buffer {
  const { background = "#ffffff" } = options;

  const resvg = new Resvg(svgString, {
    background,
    font: { loadSystemFonts: false },
    shapeRendering: 2,
  });

  const rendered = resvg.render();
  return rendered.asPng();
}
