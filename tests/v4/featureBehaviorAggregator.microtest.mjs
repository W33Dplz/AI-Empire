import fs from "fs";
import path from "path";
import { runFeatureBehaviorAggregator } from "../../v4-supervisor/behavior/featureBehaviorAggregator.mjs";

const tempRepo = "./temp-aggregator-repo";
const specDir = path.join(tempRepo, "ai-specs");
const moduleDir = path.join(tempRepo, "core");

fs.mkdirSync(specDir, { recursive: true });
fs.mkdirSync(moduleDir, { recursive: true });

fs.writeFileSync(
    path.join(moduleDir, "math.mjs"),
    "export function add(a, b) { return a + b; }"
);

const spec = {
    specVersion: "1.0",
    featureId: "FT-AGG-001",
    title: "Aggregator Test",
    description: "Testing aggregator",
    author: "Test",
    createdAt: new Date().toISOString(),
    scope: { type: "LOCAL", modules: ["core"] },
    executionTarget: {
        modulePath: "core/math.mjs",
        exportName: "add"
    },
    behavioralTests: [
        { input: [1, 2], expectedOutput: 3 },
        { input: [5, 5], expectedOutput: 10 }
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
    path.join(specDir, "FT-AGG-001.json"),
    JSON.stringify(spec, null, 2)
);

console.log("FEATURE BEHAVIOR AGGREGATOR TEST");
runFeatureBehaviorAggregator(tempRepo).then(result => {
    console.log(result);
    fs.rmSync(tempRepo, { recursive: true, force: true });
});
