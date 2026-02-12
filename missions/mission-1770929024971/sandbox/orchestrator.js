import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import PipelineEngine from "./core/pipelineEngine.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function safeParse(content) {
  try {
    const parsed = JSON.parse(content);

    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error("Invalid plan structure");
    }

    return parsed;
  } catch (err) {
    throw new Error("Model returned invalid JSON structure");
  }
}

async function generatePlan(objective) {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a safe AI planner.

Allowed steps:
- CONTEXT_ANALYSIS
- PATCH_FILE
- NO_OP

Return ONLY valid JSON in this format:

{
  "analysis": "...",
  "steps": [
    {
      "type": "PATCH_FILE",
      "target": "example.txt",
      "content": "example"
    }
  ]
}

PATCH_FILE must target only files (no folders).
`
      },
      { role: "user", content: objective }
    ]
  });

  return safeParse(response.choices[0].message.content);
}

async function main() {
  const objective = process.argv.slice(2).join(" ");

  if (!objective) {
    console.log('Usage: node orchestrator.js "Your objective"');
    return;
  }

  const pipeline = new PipelineEngine();

  const plan = await generatePlan(objective);

  fs.writeFileSync("./memory/latest-plan.json", JSON.stringify(plan, null, 2));

  await pipeline.execute(plan);
}

main();
