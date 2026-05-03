#!/usr/bin/env tsx
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { runCompare } from "./engine/compare.ts";
import { generateReport } from "./report/generate.ts";

const program = new Command();
program
  .name("vrt")
  .description("Visual Regression Testing POC")
  .version("0.1.0");

program
  .command("capture")
  .description("Run Playwright tests and write snapshots to screenshots/<target>/")
  .option("-t, --target <target>", "baseline or current", "current")
  .action((opts: { target: string }) => {
    if (opts.target !== "baseline" && opts.target !== "current") {
      console.error(
        `Invalid --target: "${opts.target}". Use "baseline" or "current".`
      );
      process.exit(2);
    }
    const env = {
      ...process.env,
      VRT_TARGET: opts.target,
      PLAYWRIGHT_HOST_PLATFORM_OVERRIDE:
        process.env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE ?? "",
    };
    const proc = spawn("pnpm", ["exec", "playwright", "test"], {
      stdio: "inherit",
      env,
    });
    proc.on("exit", (code) => process.exit(code ?? 0));
  });

program
  .command("compare")
  .description("Compare baseline ↔ current and produce a static HTML report")
  .option("-o, --open", "open the resulting report in the browser", false)
  .action(async (opts: { open: boolean }) => {
    const { reportDir, data } = await runCompare();
    await generateReport(reportDir, data);
    console.log(`[vrt] report written to ${reportDir}/index.html`);
    if (opts.open) {
      const opener =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
            ? "start"
            : "xdg-open";
      spawn(opener, [path.join(reportDir, "index.html")], {
        stdio: "ignore",
        detached: true,
      }).unref();
    }
  });

program
  .command("approve")
  .description("Promote current snapshots to baseline")
  .argument("[name]", "snapshot name (omit to approve all)")
  .option("-y, --yes", "skip confirmation prompt", false)
  .action(async (name: string | undefined, opts: { yes: boolean }) => {
    const root = process.cwd();
    const fromDir = path.join(root, "screenshots", "current");
    const toDir = path.join(root, "screenshots", "baseline");
    let files: string[];
    try {
      files = await fs.readdir(fromDir);
    } catch {
      console.error(
        `[vrt] no current snapshots found at ${fromDir}. Run \`vrt capture --target current\` first.`
      );
      process.exit(1);
    }

    const targets = name
      ? files.filter((f) => f.startsWith(`${name}-`))
      : files;

    if (targets.length === 0) {
      console.error(`[vrt] no snapshots match "${name ?? "<all>"}".`);
      process.exit(1);
    }

    if (!opts.yes) {
      console.log("[vrt] about to overwrite baseline files:");
      for (const f of targets) {
        console.log("  ", path.join("screenshots", "baseline", f));
      }
      const proceed = await confirm("Proceed? [y/N] ");
      if (!proceed) {
        console.log("[vrt] aborted.");
        process.exit(0);
      }
    }

    await fs.mkdir(toDir, { recursive: true });
    for (const f of targets) {
      await fs.copyFile(path.join(fromDir, f), path.join(toDir, f));
    }
    console.log(
      `[vrt] approved ${targets.length} file${targets.length === 1 ? "" : "s"}.`
    );
  });

async function confirm(prompt: string): Promise<boolean> {
  process.stdout.write(prompt);
  return new Promise((resolve) => {
    const onData = (buf: Buffer): void => {
      const ans = buf.toString().trim().toLowerCase();
      process.stdin.removeListener("data", onData);
      process.stdin.pause();
      resolve(ans === "y" || ans === "yes");
    };
    process.stdin.resume();
    process.stdin.once("data", onData);
  });
}

program.parse();
