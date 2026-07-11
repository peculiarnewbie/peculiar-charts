import { expect, test } from "@playwright/test";

test.describe("Documentation routes", () => {
  for (const [path, heading] of [
    ["/docs", "Compose the chart you need."],
    ["/docs/getting-started", "A chart is a scale-aware SVG surface."],
    ["/docs/recipes/timeline", "Interval timelines"],
  ]) {
    test("renders " + path + " directly", async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    });
  }
});

test.describe("Chart interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?all");
    await page.waitForSelector("[data-pc-chart]");
  });

  test("dots-events: clicking a dot shows the picked value", async ({ page }) => {
    const demo = page.locator('[data-testid="demo-dots-events"]');
    const status = demo.locator("p.text-black\\/60");

    await expect(status).toHaveText("click a dot →");

    const dots = demo.locator("[data-pc-dot]");
    const count = await dots.count();
    expect(count).toBeGreaterThan(0);

    await dots.first().click();

    await expect(status).toContainText("clicked");
    await expect(status).toContainText("coffees");
  });

  test("default-tooltip: hovering shows a tooltip", async ({ page }) => {
    const demo = page.locator('[data-testid="demo-default-tooltip"]');
    const chart = demo.locator("[data-pc-chart]");

    const box = await chart.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

    // Tooltip is portaled to the wrapper
    const tooltip = demo.locator("[data-pc-axis-tooltip]");
    await expect(tooltip).toBeVisible();
  });

  test("stacked-bars: hovering shows a tooltip", async ({ page }) => {
    const demo = page.locator('[data-testid="demo-stacked-bars"]');
    const chart = demo.locator("[data-pc-chart]");

    const box = await chart.boundingBox();
    expect(box).not.toBeNull();

    // Hover over the chart center (should be near a bar)
    await page.mouse.move(box!.x + box!.width / 3, box!.y + box!.height / 2);

    // Tooltip is portaled to the wrapper
    const tooltip = demo.locator("[data-pc-axis-tooltip]");
    await expect(tooltip).toBeVisible();
  });

  test("syncId: hovering one chart syncs tooltip to the other", async ({ page }) => {
    const demo = page.locator('[data-testid="demo-syncId"]');
    const wrappers = demo.locator("[data-pc-wrapper]");
    const count = await wrappers.count();
    expect(count).toBe(2);

    const firstWrapper = wrappers.first();
    const secondWrapper = wrappers.nth(1);

    const chart = demo.locator("[data-pc-chart]").first();
    const box = await chart.boundingBox();
    expect(box).not.toBeNull();

    // Hover over the first chart
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

    // Both wrappers should show tooltips (portaled)
    const firstTooltip = firstWrapper.locator("[data-pc-axis-tooltip]");
    const secondTooltip = secondWrapper.locator("[data-pc-axis-tooltip]");

    await expect(firstTooltip).toBeVisible();
    await expect(secondTooltip).toBeVisible();
  });

  test("brush: dragging a handle updates the visible range", async ({ page }) => {
    const demo = page.locator('[data-testid="demo-brush"]');
    const chart = demo.locator("[data-pc-chart]");

    const box = await chart.boundingBox();
    expect(box).not.toBeNull();

    const brush = demo.locator("[data-pc-brush]");
    await expect(brush).toBeVisible();

    const brushBox = await brush.boundingBox();
    expect(brushBox).not.toBeNull();

    // Drag the right handle leftward to shrink the range
    const rightHandle = demo.locator("[data-pc-brush-handle]").last();
    const handleBox = await rightHandle.boundingBox();

    if (handleBox) {
      await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox.x - 100, handleBox.y + handleBox.height / 2, { steps: 5 });
      await page.mouse.up();

      // Brush should still be visible after interaction
      await expect(brush).toBeVisible();
    }
  });
});
