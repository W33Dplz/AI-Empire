import Brain from "./orchestrator/brain.js";
import fs from "fs";

const test = async () => {
  const brain = new Brain();
  const plan = JSON.parse(fs.readFileSync("./microPlan.json"));

  const result = await brain.executeMission(plan);

  console.log("=== AFTER EXECUTE ===");
  console.log(result);

  if (result.status === "READY_FOR_DECISION") {
    console.log("Approving mission...");

    const approval = await brain.approveMission(result.missionId);

    console.log("=== AFTER APPROVAL ===");
    console.log(approval);
  }
};

test();
