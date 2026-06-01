import { describe, it, expect } from "vitest";
import { decide } from "../../src/supervisor/decision.js";

describe("supervisor/decide", () => {
  it("rejects when tests failed, even with high score", () => {
    const result = decide({
      testsPassed: false,
      regressions: [],
      scopeDrift: null,
      score: 95,
      intent: "x",
    });
    expect(result.verdict).toBe("REJECT");
    expect(result.score).toBe(95);
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("rejects when high-severity non-autofixable regression present", () => {
    const result = decide({
      testsPassed: true,
      regressions: [
        {
          severity: "high",
          kind: "api_breaking_change",
          file: "src/x.js",
          description: "x",
          autoFixable: false,
        },
      ],
      scopeDrift: null,
      score: 90,
      intent: "x",
    });
    expect(result.verdict).toBe("REJECT");
    expect(result.score).toBe(90);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("passes when tests green, no regressions, no drift, score >= 70", () => {
    const result = decide({
      testsPassed: true,
      regressions: [],
      scopeDrift: null,
      score: 80,
      intent: "x",
    });
    expect(result.verdict).toBe("PASS");
    expect(result.score).toBe(80);
  });

  it("returns FIX when scope drift detected with moderate score", () => {
    const result = decide({
      testsPassed: true,
      regressions: [],
      scopeDrift: {
        divergence: 0.8,
        declaredIntent: "x",
        actualImpact: "y",
        evidence: [],
      },
      score: 65,
      intent: "x",
    });
    expect(result.verdict).toBe("FIX");
    expect(result.score).toBe(65);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("returns FIX when low-severity autofixable regression present", () => {
    const result = decide({
      testsPassed: true,
      regressions: [
        {
          severity: "low",
          kind: "import_missing",
          file: "src/x.js",
          description: "x",
          autoFixable: true,
        },
      ],
      scopeDrift: null,
      score: 75,
      intent: "x",
    });
    expect(result.verdict).toBe("FIX");
    expect(result.score).toBe(75);
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});
