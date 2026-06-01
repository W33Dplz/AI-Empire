import { describe, it, expect } from "vitest";
import { loadConfig } from "../../src/config/load.js";

describe("loadConfig", () => {
  it("applies defaults when all inputs empty", () => {
    const cfg = loadConfig({ flags: {}, env: {}, dotenv: {} });
    expect(cfg.logLevel).toBe("info");
    expect(cfg.logFormat).toBe("pretty");
    expect(cfg.model).toBe("gpt-4o-mini");
    expect(cfg.maxFixAttempts).toBe(1);
    expect(cfg.keepSandbox).toBe(false);
    expect(cfg.dryRun).toBe(false);
    expect(cfg.adapter).toBe("default");
    expect(cfg.baseline).toBe("main");
    expect(cfg.reportPath).toBe("./ai-empire-report.md");
    expect(cfg.openaiApiKey).toBeUndefined();
    expect(typeof cfg.missionsRoot).toBe("string");
    expect(cfg.missionsRoot.length).toBeGreaterThan(0);
  });

  it("dotenv overrides default", () => {
    const cfg = loadConfig({
      flags: {},
      env: {},
      dotenv: { AI_EMPIRE_MODEL: "gpt-4o" },
    });
    expect(cfg.model).toBe("gpt-4o");
  });

  it("env overrides dotenv", () => {
    const cfg = loadConfig({
      flags: {},
      env: { AI_EMPIRE_MODEL: "gpt-4o-env" },
      dotenv: { AI_EMPIRE_MODEL: "gpt-4o-dotenv" },
    });
    expect(cfg.model).toBe("gpt-4o-env");
  });

  it("flag overrides env", () => {
    const cfg = loadConfig({
      flags: { model: "gpt-4o-flag" },
      env: { AI_EMPIRE_MODEL: "gpt-4o-env" },
      dotenv: { AI_EMPIRE_MODEL: "gpt-4o-dotenv" },
    });
    expect(cfg.model).toBe("gpt-4o-flag");
  });

  it("picks up OPENAI_API_KEY from env", () => {
    const cfg = loadConfig({
      flags: {},
      env: { OPENAI_API_KEY: "sk-test-123" },
      dotenv: {},
    });
    expect(cfg.openaiApiKey).toBe("sk-test-123");
  });

  it("throws on invalid logLevel", () => {
    expect(() =>
      loadConfig({
        flags: { logLevel: "banana" },
        env: {},
        dotenv: {},
      }),
    ).toThrow();
  });

  it("coerces maxFixAttempts to int from env string \"3\"", () => {
    const cfg = loadConfig({
      flags: {},
      env: { AI_EMPIRE_MAX_FIX_ATTEMPTS: "3" },
      dotenv: {},
    });
    expect(cfg.maxFixAttempts).toBe(3);
  });

  it("coerces keepSandbox to boolean from env string \"true\"", () => {
    const cfg = loadConfig({
      flags: {},
      env: { AI_EMPIRE_KEEP_SANDBOX: "true" },
      dotenv: {},
    });
    expect(cfg.keepSandbox).toBe(true);
  });
});
