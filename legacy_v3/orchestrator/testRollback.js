import Brain from "./brain.js";

const brain = new Brain();

const invalidPlan = {
  steps: [
    {
      type: "PATCH_FILE",
      target: "brain/test.txt",
      content: "Rollback test"
    },
    {
      type: "UNKNOWN_STEP",
      target: "invalid.txt"
    }
  ]
};

const result = await brain.executeMission(invalidPlan);

console.log(result);
