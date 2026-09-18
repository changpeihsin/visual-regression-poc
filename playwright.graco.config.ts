import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv({ path: path.resolve(__dirname, "graco/.env") });

const baseURL = process.env.BASE_URL ?? "https://gracobaby-eu.dev";

export default defineConfig({
  testDir: "./graco/tests",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    headless: true,
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
