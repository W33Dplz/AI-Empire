import { describe, it, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { supervise } from "../../src/supervisor/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, "../fixtures/demo-fix");

describe("supervise() integration — demo-fix fixture", () => {
  it("attempts at least one auto-fix and resolves to FIX or REJECT", async () => {
    const verdict = await supervise({
      repo: FIXTURE,
      branch: "dev",
      maxFixAttempts: 1,
    });

    expect(verdict).toBeDefined();
    expect(["FIX", "REJECT"].includes(verdict.verdict)).toBe(true);
    expect(Array.isArray(verdict.appliedFixes)).toBe(true);
    expect(verdict.appliedFixes.length).toBeGreaterThanOrEqual(1);
  }, 60_000);
});
