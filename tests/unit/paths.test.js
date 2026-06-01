import { describe, it, expect } from "vitest";
import path from "node:path";
import os from "node:os";

import {
  getMissionsRoot,
  resolveInsideSandbox,
  assertInsideSandbox,
} from "../../src/lib/paths.js";

describe("getMissionsRoot", () => {
  it("returns AI_EMPIRE_MISSIONS_ROOT (resolved) when set in env arg", () => {
    const custom = path.resolve(os.tmpdir(), "ai-empire-missions-custom");
    const result = getMissionsRoot({ AI_EMPIRE_MISSIONS_ROOT: custom });
    expect(result).toBe(path.resolve(custom));
  });

  it("defaults to <homedir>/.ai-empire/missions when env var unset", () => {
    const result = getMissionsRoot({});
    expect(result).toBe(path.join(os.homedir(), ".ai-empire", "missions"));
  });

  it("returns an absolute path", () => {
    const result = getMissionsRoot({});
    expect(path.isAbsolute(result)).toBe(true);

    const custom = path.resolve(os.tmpdir(), "ai-empire-missions-abs");
    const result2 = getMissionsRoot({ AI_EMPIRE_MISSIONS_ROOT: custom });
    expect(path.isAbsolute(result2)).toBe(true);
  });
});

describe("resolveInsideSandbox", () => {
  const sandboxRoot = path.resolve(os.tmpdir(), "ai-empire-sandbox-test");

  it("returns joined path for simple relative input", () => {
    const result = resolveInsideSandbox(sandboxRoot, "sub/file.txt");
    expect(result).toBe(path.resolve(sandboxRoot, "sub/file.txt"));
  });

  it("rejects '../escape.js' traversal", () => {
    expect(() => resolveInsideSandbox(sandboxRoot, "../escape.js")).toThrow();
  });

  it("rejects absolute path outside sandbox", () => {
    const outside = path.resolve(os.tmpdir(), "ai-empire-other-root", "x.txt");
    expect(() => resolveInsideSandbox(sandboxRoot, outside)).toThrow();
  });
});

describe("assertInsideSandbox", () => {
  const sandboxRoot = path.resolve(os.tmpdir(), "ai-empire-sandbox-assert");

  it("passes for nested file inside sandbox", () => {
    const inside = path.join(sandboxRoot, "nested", "deep", "file.json");
    expect(() => assertInsideSandbox(sandboxRoot, inside)).not.toThrow();
  });

  it("throws for sibling path next to sandboxRoot", () => {
    const sibling = path.resolve(sandboxRoot, "..", "ai-empire-sandbox-assert-evil", "x.txt");
    expect(() => assertInsideSandbox(sandboxRoot, sibling)).toThrow();
  });
});
