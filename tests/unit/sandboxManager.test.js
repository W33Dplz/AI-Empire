import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import SandboxManager from "../../src/core/sandboxManager.js";

describe("SandboxManager", () => {
  let missionsRoot;
  let fixtureRoot;

  beforeEach(() => {
    missionsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-empire-test-"));
    fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-empire-fixture-"));
  });

  afterEach(() => {
    if (missionsRoot && fs.existsSync(missionsRoot)) {
      fs.rmSync(missionsRoot, { recursive: true, force: true });
    }
    if (fixtureRoot && fs.existsSync(fixtureRoot)) {
      fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("constructor throws on missing missionId", () => {
    expect(() => new SandboxManager(undefined, { missionsRoot })).toThrow();
    expect(() => new SandboxManager(null, { missionsRoot })).toThrow();
    expect(() => new SandboxManager("", { missionsRoot })).toThrow();
  });

  it("constructor creates sandbox dir at missionsRoot/<id>/sandbox", () => {
    const missionId = "mission-001";
    const sm = new SandboxManager(missionId, { missionsRoot });
    const expected = path.join(missionsRoot, missionId, "sandbox");

    expect(fs.existsSync(expected)).toBe(true);
    expect(fs.statSync(expected).isDirectory()).toBe(true);
    expect(sm.getSandboxPath()).toBe(expected);
  });

  it("cloneProject copies a fixture", () => {
    fs.writeFileSync(path.join(fixtureRoot, "index.js"), "console.log('hi');");
    fs.mkdirSync(path.join(fixtureRoot, "src"));
    fs.writeFileSync(path.join(fixtureRoot, "src", "app.js"), "export const x = 1;");

    const sm = new SandboxManager("mission-clone", { missionsRoot });
    sm.cloneProject(fixtureRoot);

    const sandboxPath = sm.getSandboxPath();
    expect(fs.existsSync(path.join(sandboxPath, "index.js"))).toBe(true);
    expect(fs.existsSync(path.join(sandboxPath, "src", "app.js"))).toBe(true);
    expect(fs.readFileSync(path.join(sandboxPath, "index.js"), "utf8")).toBe(
      "console.log('hi');"
    );
  });

  it("cloneProject excludes node_modules", () => {
    fs.writeFileSync(path.join(fixtureRoot, "package.json"), "{}");
    fs.mkdirSync(path.join(fixtureRoot, "node_modules"));
    fs.mkdirSync(path.join(fixtureRoot, "node_modules", "lodash"));
    fs.writeFileSync(
      path.join(fixtureRoot, "node_modules", "lodash", "index.js"),
      "module.exports = {};"
    );

    const sm = new SandboxManager("mission-no-nm", { missionsRoot });
    sm.cloneProject(fixtureRoot);

    const sandboxPath = sm.getSandboxPath();
    expect(fs.existsSync(path.join(sandboxPath, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(sandboxPath, "node_modules"))).toBe(false);
  });

  it("resolveSafePath returns joined absolute path for 'foo.js'", () => {
    const sm = new SandboxManager("mission-safe", { missionsRoot });
    const resolved = sm.resolveSafePath("foo.js");
    const expected = path.join(sm.getSandboxPath(), "foo.js");

    expect(path.isAbsolute(resolved)).toBe(true);
    expect(resolved).toBe(expected);
  });

  it("resolveSafePath throws on '../escape.js'", () => {
    const sm = new SandboxManager("mission-escape", { missionsRoot });
    expect(() => sm.resolveSafePath("../escape.js")).toThrow();
  });

  it("concurrent: second new SandboxManager(sameId, sameRoot) throws E_SANDBOX_BUSY", () => {
    const missionId = "mission-busy";
    const first = new SandboxManager(missionId, { missionsRoot });
    expect(first).toBeDefined();

    let err;
    try {
      new SandboxManager(missionId, { missionsRoot });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe("E_SANDBOX_BUSY");
  });

  it("cleanup() removes the mission folder", () => {
    const missionId = "mission-cleanup";
    const sm = new SandboxManager(missionId, { missionsRoot });
    const missionFolder = path.join(missionsRoot, missionId);

    expect(fs.existsSync(missionFolder)).toBe(true);

    sm.cleanup();

    expect(fs.existsSync(missionFolder)).toBe(false);
  });
});
