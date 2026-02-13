import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import PipelineEngine from "./legacy/core_v2/pipelineEngine.js";
import MissionDefinitionEngine from "./core/missionDefinitionEngine.js";
import RiskGate from "./core/riskGate.js";
import AuditLogger from "./core/auditLogger.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function safeFallback(reason) {
  AuditLogger.log("PLAN_BLOCKED", { reason });
  return {
    analysis: "Blocked: " + reason,
    steps: [{ type: "NO_OP" }]
  };
}

function validateStructure(plan) {
  if (!plan.analysis || typeof plan.analysis !== "string") {
    return false;
  }
  if (!plan.steps || !Array.isArray(plan.steps)) {
    return false;
  }
  return true;
}

async function generatePlan(objective) {

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `Return ONLY valid JSON with format: { "analysis": string, "steps": [ { "type": "PATCH_FILE"|"NO_OP", "target"?: string, "content"?: string } ] }` },
      { role: "user", content: objective }
    ]
  });

  const parsed = JSON.parse(response.choices[0].message.content);

  if (!validateStructure(parsed)) {
    return safeFallback("Invalid structure contract");
  }

  if (!parsed.steps.every(s => typeof s === "object" && s.type)) { return safeFallback("Invalid step contract"); } return parsed;
}

async function main() {

  const objective = process.argv.slice(2).join(" ");
  if (!objective) return;

  const pipeline = new PipelineEngine();

  const mission = MissionDefinitionEngine.generateMission(
    "default-project",
    objective
  );

  fs.writeFileSync(
    "./memory/latest-mission.json",
    JSON.stringify(mission, null, 2),
    { encoding: "utf8" }
  );

  const rawPlan = await generatePlan(
    mission.lovableLayer.generatedPrompt
  );

  const riskEvaluation = RiskGate.evaluate(rawPlan);

  console.log("Risk score:", riskEvaluation.riskScore);

  const finalPlan = riskEvaluation.allowed
    ? rawPlan
    : safeFallback("Risk too high");

  fs.writeFileSync(
    "./memory/latest-plan.json",
    JSON.stringify(finalPlan, null, 2),
    { encoding: "utf8" }
  );

  await pipeline.execute(finalPlan);
}

main();



