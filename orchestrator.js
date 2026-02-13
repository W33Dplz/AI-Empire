import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import PipelineEngine from "./legacy/core_v2/pipelineEngine.js";
import MissionDefinitionEngine from "./core/missionDefinitionEngine.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function safeFallback(reason) {
  return {
    analysis: "Auto fallback: " + reason,
    steps: [{ type: "NO_OP" }]
  };
}

function validatePlan(parsed) {
  const allowedTypes = ["CONTEXT_ANALYSIS","PATCH_FILE","NO_OP"];

  if (!parsed.steps || !Array.isArray(parsed.steps)) {
    return safeFallback("Missing steps");
  }

  for (const step of parsed.steps) {
    if (!allowedTypes.includes(step.type)) {
      return safeFallback("Unauthorized step type");
    }

    if (step.type === "PATCH_FILE") {
      if (!step.target || !step.target.startsWith("sandbox/")) {
        return safeFallback("Outside sandbox");
      }

      if (!step.target.match(/\.js$|\.json$/)) {
        return safeFallback("Invalid extension");
      }
    }
  }

  return parsed;
}

async function generatePlan(objective) {
  const systemPrompt = `
You are a STRICT contract-based planner.
All PATCH_FILE targets MUST start with "sandbox/".
Return valid JSON only.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: objective }
    ]
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return validatePlan(parsed);
}

async function main() {
  const objective = process.argv.slice(2).join(" ");

  if (!objective) {
    console.log('Usage: node orchestrator.js "Your objective"');
    return;
  }

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

  const plan = await generatePlan(
    mission.lovableLayer.generatedPrompt
  );

  fs.writeFileSync(
    "./memory/latest-plan.json",
    JSON.stringify(plan, null, 2),
    { encoding: "utf8" }
  );

  await pipeline.execute(plan);
}

main();
