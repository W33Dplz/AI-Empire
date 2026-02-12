import Brain from "./orchestrator/brain.js";
import fs from "fs";

const test = async () => {
  const brain = new Brain();
  const plan = JSON.parse(fs.readFileSync("./microPlan.json"));

  const result = await brain.executeMission(plan);

  console.log("=== BRAIN RESULT ===");
  console.log(result);
};

test();
