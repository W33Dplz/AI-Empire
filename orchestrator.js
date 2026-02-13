import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import PipelineEngine from "./legacy/core_v2/pipelineEngine.js";
import MissionDefinitionEngine from "./core/missionDefinitionEngine.js";
import RiskGate from "./core/riskGate.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function safeFallback(reason) {
  return {
    analysis: "Blocked by RiskGate: " + reason,
    steps: [{ type: "NO_OP" }]
  };
}

function validatePlan(parsed) {
  if (!parsed.steps || !Array.isArray(parsed.steps)) {
    return safeFallback("Invalid structure");
  }
  return parsed;
}

async function generatePlan(objective) {

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Return strict JSON {analysis, steps[]}" },
      { role: "user", content: objective }
    ]
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return validatePlan(parsed);
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
