import { describe, it, expect } from "vitest";
import { LLMClient } from "../../src/llm/llm-client.js";
import { OpenAIClient } from "../../src/llm/openai-client.js";

describe("LLMClient", () => {
  it("abstract generatePlan throws", async () => {
    const c = new LLMClient();
    await expect(c.generatePlan({ prompt: "x" })).rejects.toThrow(/must be implemented/);
  });
  it("OpenAIClient extends LLMClient", () => {
    const c = new OpenAIClient({ apiKey: "sk-test" });
    expect(c).toBeInstanceOf(LLMClient);
  });
  it("OpenAIClient throws without apiKey", () => {
    expect(() => new OpenAIClient({})).toThrow(/E_NO_OPENAI_KEY/);
  });
});
