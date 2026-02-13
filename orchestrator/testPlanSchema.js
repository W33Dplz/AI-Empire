import { validatePlan } from "./planSchema.js";

const validPlan = {
  steps: [
    {
      type: "PATCH_FILE",
      target: "test.txt",
      content: "Hello"
    }
  ]
};

validatePlan(validPlan);

console.log("Plan schema validation passed.");
