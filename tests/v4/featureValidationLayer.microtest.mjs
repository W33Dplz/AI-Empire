import fs from "fs";
import path from "path";
import { runFeatureValidationLayer } from "../../v4-supervisor/feature/featureValidationLayer.mjs";

const tempRepo = "./temp-feature-validation";
const specDir = path.join(tempRepo, "ai-specs");
const moduleDir = path.join(tempRepo, "core");

fs.mkdirSync(specDir, { recursive: true });
fs.mkdirSync(moduleDir, { recursive: true });

fs.writeFileSync(
    path.join(moduleDir, "math.mjs"),
    "// @ai-feature FT-VAL-001\nexport function add(a, b) { return a + b; }"
);

const spec = {
    specVersion: "1.0",
    featureId: "FT-VAL-001",
    title: "Validation Test",
    description: "Testing validation layer",
    author: "Test",
    createdAt: new Date().toISOString(),
    scope: { type: "LOCAL", modules: ["core"] },
    executionTarget: {
        modulePath: "core/math.mjs",
        exportName: "add"
    },
    behavioralTests: [
        { input: [2, 2], expectedOutput: 4 }
    ],
    behavior: { inputs: [], outputs: [], sideEffects: [] },
    acceptanceCriteria: ["Must pass"],
    nonRegressionZones: [],
    constraints: {
        noDependencyChange: true,
        noGlobalStateMutation: true,
        performanceBudgetMs: 10
    }
};

fs.writeFileSync(
    path.join(specDir, "FT-VAL-001.json"),
    JSON.stringify(spec, null, 2)
);

console.log("FEATURE VALIDATION LAYER TEST");
runFeatureValidationLayer(tempRepo).then(result => {
    console.log(result);
    fs.rmSync(tempRepo, { recursive: true, force: true });
});
