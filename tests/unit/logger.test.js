import { describe, it, expect } from "vitest";
import { createLogger } from "../../src/lib/logger.js";

describe("logger", () => {
  it("createLogger returns object with info/warn/error/debug", () => {
    const log = createLogger({ format: "json" });
    expect(typeof log.info).toBe("function");
    expect(typeof log.warn).toBe("function");
    expect(typeof log.error).toBe("function");
    expect(typeof log.debug).toBe("function");
  });
  it("info call does not throw", () => {
    const log = createLogger({ format: "json", level: "info" });
    expect(() => log.info({ event: "test.event", foo: "bar" }, "hello")).not.toThrow();
  });
});
