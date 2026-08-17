import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createTestRun } from "./createRun.ts";

describe("createTestRun", () => {
  test("creates a queued Joie UK job from a safe PDP URL", () => {
    const run = createTestRun(
      {
        categoryId: "product",
        featureId: "pdp-behavior",
        brandId: "joie",
        environmentId: "uk-dev",
        targetUrl: "https://joiebaby.dev/uk/pact-pro-lightweight-compact-stroller",
        requestedBy: " QA User ",
      },
      {
        createId: () => "run-1",
        now: () => new Date("2026-08-14T08:00:00.000Z"),
      }
    );

    assert.deepEqual(run, {
      id: "run-1",
      categoryId: "product",
      featureId: "pdp-behavior",
      brandId: "joie",
      environmentId: "uk-dev",
      market: "UK",
      targetUrl: "https://joiebaby.dev/uk/pact-pro-lightweight-compact-stroller",
      requestedBy: "QA User",
      status: "queued",
      createdAt: "2026-08-14T08:00:00.000Z",
      updatedAt: "2026-08-14T08:00:00.000Z",
      checks: [],
      artifacts: [],
      warnings: [],
    });
  });

  test("rejects unknown brands and environments", () => {
    assert.throws(
      () =>
        createTestRun({
          categoryId: "product",
          featureId: "pdp-behavior",
          brandId: "unknown",
          environmentId: "uk-dev",
          targetUrl: "https://joiebaby.dev/uk/product",
          requestedBy: "QA",
        }),
      /Unknown brand/
    );
    assert.throws(
      () =>
        createTestRun({
          categoryId: "product",
          featureId: "pdp-behavior",
          brandId: "joie",
          environmentId: "production",
          targetUrl: "https://joiebaby.dev/uk/product",
          requestedBy: "QA",
        }),
      /Unknown environment/
    );
  });

  test("rejects unknown categories and test features", () => {
    assert.throws(
      () =>
        createTestRun({
          categoryId: "account",
          featureId: "pdp-behavior",
          brandId: "joie",
          environmentId: "uk-dev",
          targetUrl: "https://joiebaby.dev/uk/product",
          requestedBy: "QA",
        }),
      /Unknown test category/
    );
    assert.throws(
      () =>
        createTestRun({
          categoryId: "product",
          featureId: "plp-behavior",
          brandId: "joie",
          environmentId: "uk-dev",
          targetUrl: "https://joiebaby.dev/uk/product",
          requestedBy: "QA",
        }),
      /Unknown test feature/
    );
  });

  test("requires a short non-empty requester name", () => {
    assert.throws(
      () =>
        createTestRun({
          categoryId: "product",
          featureId: "pdp-behavior",
          brandId: "joie",
          environmentId: "uk-dev",
          targetUrl: "https://joiebaby.dev/uk/product",
          requestedBy: "   ",
        }),
      /requestedBy is required/
    );
    assert.throws(
      () =>
        createTestRun({
          categoryId: "product",
          featureId: "pdp-behavior",
          brandId: "joie",
          environmentId: "uk-dev",
          targetUrl: "https://joiebaby.dev/uk/product",
          requestedBy: "x".repeat(101),
        }),
      /100 characters or fewer/
    );
  });

  test("does not create a job for an unsafe PDP URL", () => {
    assert.throws(
      () =>
        createTestRun({
          categoryId: "product",
          featureId: "pdp-behavior",
          brandId: "joie",
          environmentId: "uk-dev",
          targetUrl: "https://127.0.0.1/uk/internal",
          requestedBy: "QA",
        }),
      /not allowed/
    );
  });
});
