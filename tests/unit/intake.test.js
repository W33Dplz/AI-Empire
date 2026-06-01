import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createIntake } from "../../src/supervisor/intake.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, "..", "fixtures", "demo-pass");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("createIntake", () => {
  let missionsRoot;

  beforeEach(() => {
    missionsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-empire-intake-"));
  });

  afterEach(() => {
    if (missionsRoot && fs.existsSync(missionsRoot)) {
      fs.rmSync(missionsRoot, { recursive: true, force: true });
    }
  });

  it("returns Mission with uuid id, RUNNING status, sandboxPath containing package.json, and default adapter", async () => {
    const mission = await createIntake({
      repoPath: fixturePath,
      targetBranch: "main",
      baselineBranch: "main",
      missionsRoot,
    });

    expect(mission).toBeDefined();
    expect(mission.id).toMatch(UUID_REGEX);
    expect(mission.status).toBe("RUNNING");
    expect(mission.adapter).toBe("default");
    expect(mission.sandboxPath).toBeDefined();
    expect(fs.existsSync(path.join(mission.sandboxPath, "package.json"))).toBe(
      true
    );
  });

  it("throws when repoPath does not exist", async () => {
    const missingRepo = path.join(
      os.tmpdir(),
      "ai-empire-nonexistent-" + Date.now()
    );

    await expect(
      createIntake({
        repoPath: missingRepo,
        targetBranch: "main",
        baselineBranch: "main",
        missionsRoot,
      })
    ).rejects.toThrow();
  });
});
