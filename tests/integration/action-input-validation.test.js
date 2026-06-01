import { describe, it, expect } from "vitest";
import { parseActionInputs } from "../../src/integrations/github-action/parseInputs.js";

describe("parseActionInputs() — GitHub Action env validation (US2)", () => {
  it("returns parsed inputs when all required env are set", () => {
    const env = {
      INPUT_REPO: "owner/repo",
      INPUT_BRANCH: "main",
      INPUT_OPENAI_KEY: "sk-test-123",
      INPUT_REPORT_PATH: "./custom-report.md",
    };
    const result = parseActionInputs(env);
    expect(result).toEqual({
      repo: "owner/repo",
      branch: "main",
      openaiKey: "sk-test-123",
      reportPath: "./custom-report.md",
    });
  });

  it("throws when INPUT_REPO is missing", () => {
    const env = {
      INPUT_BRANCH: "main",
      INPUT_OPENAI_KEY: "sk-test-123",
      INPUT_REPORT_PATH: "./report.md",
    };
    expect(() => parseActionInputs(env)).toThrow(/INPUT_REPO/);
  });

  it("throws when INPUT_BRANCH is missing", () => {
    const env = {
      INPUT_REPO: "owner/repo",
      INPUT_OPENAI_KEY: "sk-test-123",
      INPUT_REPORT_PATH: "./report.md",
    };
    expect(() => parseActionInputs(env)).toThrow(/INPUT_BRANCH/);
  });

  it("defaults reportPath to './ai-empire-report.md' when INPUT_REPORT_PATH is absent", () => {
    const env = {
      INPUT_REPO: "owner/repo",
      INPUT_BRANCH: "main",
      INPUT_OPENAI_KEY: "sk-test-123",
    };
    const result = parseActionInputs(env);
    expect(result.reportPath).toBe("./ai-empire-report.md");
  });

  it("allows openaiKey to be absent (optional — caller may pass dry-run flag)", () => {
    const env = {
      INPUT_REPO: "owner/repo",
      INPUT_BRANCH: "main",
    };
    const result = parseActionInputs(env);
    expect(result.repo).toBe("owner/repo");
    expect(result.branch).toBe("main");
    expect(result.openaiKey).toBeUndefined();
    expect(result.reportPath).toBe("./ai-empire-report.md");
  });
});
