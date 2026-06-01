import { describe, it, expect } from "vitest";
import { classifyIntent } from "../../src/supervisor/intent.js";

describe("classifyIntent", () => {
  it("classifies added source file with feat: commit as 'feature'", () => {
    const result = classifyIntent({
      files: { added: ["src/feature.js"], modified: [], deleted: [] },
      commitMessages: ["feat: add"],
    });
    expect(result.intent).toBe("feature");
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("classifies modified-only source files with refactor: commit as 'refactor'", () => {
    const result = classifyIntent({
      files: {
        added: [],
        modified: ["src/lib/x.js", "src/lib/y.js"],
        deleted: [],
      },
      commitMessages: ["refactor: extract"],
    });
    expect(result.intent).toBe("refactor");
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("classifies docs/config modifications with chore: commit as 'chore'", () => {
    const result = classifyIntent({
      files: {
        added: [],
        modified: ["README.md", ".eslintrc"],
        deleted: [],
      },
      commitMessages: ["chore: docs"],
    });
    expect(result.intent).toBe("chore");
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("classifies deletions + BREAKING CHANGE commit as 'breaking'", () => {
    const result = classifyIntent({
      files: {
        added: [],
        modified: ["package.json"],
        deleted: ["src/api.js"],
      },
      commitMessages: ["BREAKING CHANGE: remove api"],
    });
    expect(result.intent).toBe("breaking");
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("returns 'unknown' with LOW confidence when files and messages are empty", () => {
    const result = classifyIntent({
      files: { added: [], modified: [], deleted: [] },
      commitMessages: [],
    });
    expect(result.intent).toBe("unknown");
    expect(result.confidence).toBe("LOW");
  });
});
