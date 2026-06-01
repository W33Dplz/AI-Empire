import { describe, it, expect } from "vitest";
import { formatComment } from "../../src/integrations/github-comment.js";

const baseVerdict = {
  verdict: "PASS",
  score: 87,
  intent: "Add a new login button to the homepage",
  reasons: [
    "All tests pass on the supervised branch.",
    "Lint is clean.",
    "No regression detected against baseline.",
  ],
  regressions: [],
  missionId: "11111111-2222-3333-4444-555555555555",
};

describe("formatComment(verdict) — PR comment markdown contract (T039)", () => {
  it("includes the verdict header with the literal verdict in bold", () => {
    const body = formatComment(baseVerdict);
    expect(body).toContain("## AI-EMPIRE verdict: **PASS**");
  });

  it("includes the score line in the form `Score: NN/100`", () => {
    const body = formatComment(baseVerdict);
    expect(body).toMatch(/Score:\s*87\/100/);
  });

  it("includes the intent line prefixed with `Intent:`", () => {
    const body = formatComment(baseVerdict);
    expect(body).toContain("Intent: Add a new login button to the homepage");
  });

  it("lists reasons as a markdown bullet list", () => {
    const body = formatComment(baseVerdict);
    for (const reason of baseVerdict.reasons) {
      expect(body).toContain(`- ${reason}`);
    }
  });

  it("does NOT include a `## Regressions` section when there are no regressions", () => {
    const body = formatComment(baseVerdict);
    expect(body).not.toContain("## Regressions");
  });

  it("includes a `## Regressions` section when regressions.length > 0", () => {
    const body = formatComment({
      ...baseVerdict,
      verdict: "FIX",
      regressions: [
        { id: "test-1", message: "auth.spec.js failed" },
        { id: "test-2", message: "build broke" },
      ],
    });
    expect(body).toContain("## Regressions");
    expect(body).toContain("auth.spec.js failed");
    expect(body).toContain("build broke");
  });

  it("truncates very long reports so the comment body stays under 64000 chars", () => {
    const huge = "x".repeat(200_000);
    const body = formatComment({
      ...baseVerdict,
      reasons: [huge],
    });
    expect(body.length).toBeLessThan(64000);
    // GitHub absolute limit is 65536 — keep a safe margin.
    expect(body.length).toBeLessThan(65536);
  });

  it("returns a non-empty string", () => {
    const body = formatComment(baseVerdict);
    expect(typeof body).toBe("string");
    expect(body.length).toBeGreaterThan(0);
  });
});
