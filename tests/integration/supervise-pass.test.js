import { describe, it, expect, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { supervise } from "../../src/supervisor/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE = path.resolve(__dirname, "../fixtures/demo-pass");
const missionsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ae-test-pass-"));

afterAll(() => {
  try {
    fs.rmSync(missionsRoot, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
});

describe("supervise() integration — PASS path", () => {
  it(
    "returns PASS verdict with score >= 70 and a real report path",
    async () => {
      const verdict = await supervise({
        repo: FIXTURE,
        branch: "main",
        missionsRoot,
        dryRun: true,
      });

      expect(verdict).toBeDefined();
      expect(verdict.verdict).toBe("PASS");
      expect(verdict.score).toBeGreaterThanOrEqual(70);
      expect(verdict.reportPath).toBeTypeOf("string");
      expect(fs.existsSync(verdict.reportPath)).toBe(true);
    },
    60000
  );
});
