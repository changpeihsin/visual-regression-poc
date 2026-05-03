import { promises as fs } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import config from "../../vrt.config.ts";
import { serializeDom, type SerializeOptions } from "./serializeDom.ts";

const ROOT = process.cwd();

function hideSelectorsCSS(selectors: string[]): string {
  if (selectors.length === 0) return "";
  return `${selectors.join(", ")} { visibility: hidden !important; }`;
}

export async function takeSnapshot(page: Page, name: string): Promise<void> {
  const target = process.env.VRT_TARGET ?? "current";
  if (target !== "baseline" && target !== "current") {
    throw new Error(`Invalid VRT_TARGET: "${target}". Must be "baseline" or "current".`);
  }

  const outDir = path.join(ROOT, "screenshots", target);
  await fs.mkdir(outDir, { recursive: true });

  for (const vp of config.viewports) {
    await page.setViewportSize(vp);

    if (config.excludeSelectors.length > 0) {
      await page.addStyleTag({
        content: hideSelectorsCSS(config.excludeSelectors),
      });
    }

    await page.evaluate(() => {
      const fonts = (document as Document & { fonts?: { ready: Promise<void> } }).fonts;
      return fonts ? fonts.ready : Promise.resolve();
    });

    const png = await page.screenshot({ fullPage: false });

    const dom = await page.evaluate(serializeDom, {
      excludeSelectors: config.excludeSelectors,
      computedStyleProps: config.computedStyleProps,
    } satisfies SerializeOptions);

    const key = `${name}-${vp.width}x${vp.height}`;
    const pngPath = path.join(outDir, `${key}.png`);
    const jsonPath = path.join(outDir, `${key}.json`);

    await fs.writeFile(pngPath, png);
    await fs.writeFile(
      jsonPath,
      JSON.stringify(
        {
          name,
          viewport: vp,
          devicePixelRatio: dom.dpr,
          elements: dom.elements,
        },
        null,
        2
      )
    );

    console.log(
      `[vrt] captured ${target}/${key}  (${dom.elements.length} elements)`
    );
  }
}
