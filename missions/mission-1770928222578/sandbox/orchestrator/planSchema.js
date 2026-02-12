const ALLOWED_STEP_TYPES = [
  "PATCH_FILE"
];

function validatePlan(plan) {
  if (!plan || typeof plan !== "object") {
    throw new Error("Plan must be an object");
  }

  if (!Array.isArray(plan.steps)) {
    throw new Error("Plan must contain a steps array");
  }

  if (plan.steps.length === 0) {
    throw new Error("Plan must contain at least one step");
  }

  for (const step of plan.steps) {
    validateStep(step);
  }

  return true;
}

function validateStep(step) {
  if (!step.type) {
    throw new Error("Step missing type");
  }

  if (!ALLOWED_STEP_TYPES.includes(step.type)) {
    throw new Error("Unsupported step type: " + step.type);
  }

  switch (step.type) {
    case "PATCH_FILE":
      if (!step.target || typeof step.target !== "string") {
        throw new Error("PATCH_FILE requires target string");
      }

      if (typeof step.content !== "string") {
        throw new Error("PATCH_FILE requires content string");
      }
      break;

    default:
      throw new Error("Unhandled step type: " + step.type);
  }
}

export { validatePlan };
