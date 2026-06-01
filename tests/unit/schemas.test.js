import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import {
  VerdictSchema,
  MissionSchema,
  PlanSchema,
} from "../../src/lib/schemas.js";

describe("schemas", () => {
  it("VerdictSchema accepts a minimal valid PASS verdict with defaults", () => {
    const parsed = VerdictSchema.parse({
      verdict: "PASS",
      score: 95,
      reasons: ["all checks green"],
      intent: "feature",
      reportPath: "reports/verdict.json",
    });
    expect(parsed.verdict).toBe("PASS");
    expect(parsed.regressions).toEqual([]);
    expect(parsed.scopeDrift).toBeNull();
    expect(parsed.appliedFixes).toEqual([]);
  });

  it("MissionSchema rejects a non-uuid id", () => {
    const result = MissionSchema.safeParse({
      id: "not-a-uuid",
      repoPath: "/repo",
      targetBranch: "main",
      status: "PENDING",
      startedAt: new Date().toISOString(),
      sandboxPath: "/tmp/sbx",
      adapter: "local",
    });
    expect(result.success).toBe(false);
  });

  it("PlanSchema rejects an empty steps array", () => {
    const result = PlanSchema.safeParse({
      id: randomUUID(),
      missionId: randomUUID(),
      generatedBy: "llm",
      steps: [],
      createdAt: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});
