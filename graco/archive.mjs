#!/usr/bin/env node
// Copy the graco-* snapshots that `graco:baseline` or `graco:current` just wrote
// into `screenshots/graco/<YYYY-MM-DD>/<target>/` so historical runs are kept
// alongside the live pair that `pnpm vrt compare` consumes.
//
// Usage: node graco/archive.mjs <baseline|current>

import { promises as fs } from "node:fs";
import path from "node:path";

const target = process.argv[2];
if (target !== "baseline" && target !== "current") {
  console.error(`usage: node graco/archive.mjs <baseline|current>`);
  process.exit(2);
}

const ROOT = process.cwd();
const src = path.join(ROOT, "screenshots", target);
const date = new Date().toISOString().slice(0, 10);
const dest = path.join(ROOT, "screenshots", "graco", date, target);

let files;
try {
  files = (await fs.readdir(src)).filter((f) => f.startsWith("graco-"));
} catch {
  console.error(`[graco] source dir not found: ${src}`);
  process.exit(1);
}

if (files.length === 0) {
  console.warn(`[graco] no graco-* files in ${src} to archive`);
  process.exit(0);
}

await fs.mkdir(dest, { recursive: true });
for (const f of files) {
  await fs.copyFile(path.join(src, f), path.join(dest, f));
}
console.log(`[graco] archived ${files.length} files → ${path.relative(ROOT, dest)}`);
