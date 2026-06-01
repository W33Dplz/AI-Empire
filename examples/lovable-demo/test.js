import { test } from "node:test";
import assert from "node:assert/strict";
import { handler } from "./index.js";

test("handler returns status 200", () => {
  const res = handler({});
  assert.equal(res.status, 200);
});

test("handler returns hello body", () => {
  const res = handler({});
  assert.equal(res.body, "Hello from Lovable demo");
});
