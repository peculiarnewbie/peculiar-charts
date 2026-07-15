import { describe, expect, it } from "vitest";
import { renderContent, resolveContentRenderer } from "../content";

describe("resolveContentRenderer", () => {
  it("prefers content over children", () => {
    const content = () => "content";
    const children = () => "children";
    expect(resolveContentRenderer(content, children)).toBe(content);
  });

  it("falls back to children when content is undefined", () => {
    const children = () => "children";
    expect(resolveContentRenderer(undefined, children)).toBe(children);
  });

  it("defaults to true when both are undefined", () => {
    expect(resolveContentRenderer(undefined, undefined)).toBe(true);
  });
});

describe("renderContent", () => {
  const Default = ({ payload }: { payload: string }) => `default:${payload}`;

  it("calls Default when renderer is true", () => {
    const result = renderContent(true, "data", Default);
    expect(result).toBe("default:data");
  });

  it("calls function renderer with payload", () => {
    const renderer = (p: string) => `custom:${p}`;
    const result = renderContent(renderer, "data", Default);
    expect(result).toBe("custom:data");
  });

  it("returns null when renderer is false", () => {
    const result = renderContent(false as any, "data", Default);
    expect(result).toBeNull();
  });
});
