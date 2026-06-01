import { describe, it, expect, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { supervise } from "../../src/supervisor/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE = path.resolve(__dirname, "../fixtures/demo-reject");
const missionsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ae-test-reject-"));

afterAll(() => {
  try {
    fs.rmSync(missionsRoot, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
});

describe("supervise() integration — REJECT path", () => {
  it(
    "returns REJECT verdict with reasons mentioning package.json/json/invalid",
    async () => {
      const verdict = await supervise({
        repo: FIXTURE,
        branch: "main",
        missionsRoot,
        dryRun: true,
      });

      expect(verdict).toBeDefined();
      expect(verdict.verdict).toBe("REJECT");
      expect(Array.isArray(verdict.reasons)).toBe(true);
      const reasonsJoined = verdict.reasons.join(" ").toLowerCase();
      expect(reasonsJoined).toMatch(/package\.json|json|invalid/);
    },
    60000
  );
});
