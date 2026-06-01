import OpenAI from "openai";
import { LLMClient } from "./llm-client.js";

export class OpenAIClient extends LLMClient {
  constructor(opts = {}) {
    super();
    const apiKey = opts.apiKey;
    if (!apiKey) throw new Error("E_NO_OPENAI_KEY: OPENAI_API_KEY is required");
    this.client = new OpenAI({ apiKey });
    this.model = opts.model || "gpt-4o-mini";
  }
  async generatePlan(input) {
    const model = input.model || this.model;
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You output a JSON plan only, no prose." },
        { role: "user", content: input.prompt },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices?.[0]?.message?.content ?? "{}";
    try { return JSON.parse(raw); }
    catch (e) { throw new Error("E_LLM_INVALID_PLAN: " + e.message); }
  }
  async health() {
    try { await this.client.models.list(); return { ok: true }; }
    catch (e) { return { ok: false, error: e.message }; }
  }
}

export function createLLMClient(opts) { return new OpenAIClient(opts); }
