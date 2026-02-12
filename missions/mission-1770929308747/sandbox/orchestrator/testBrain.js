import Brain from "./brain.js";

const brain = new Brain();

const plan = {
  steps: [
    {
      type: "PATCH_FILE",
      target: "brain/test.txt",
      content: "Brain V3 execution successful"
    }
  ]
};

const result = await brain.executeMission(plan);

console.log(result);
