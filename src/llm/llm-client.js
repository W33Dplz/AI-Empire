export class LLMClient {
  async generatePlan(_input) { throw new Error("LLMClient.generatePlan must be implemented"); }
  async health() { throw new Error("LLMClient.health must be implemented"); }
}
