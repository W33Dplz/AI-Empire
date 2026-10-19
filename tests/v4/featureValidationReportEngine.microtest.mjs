import fs from "fs";
import path from "path";
import { runFeatureValidationReportEngine } from "../../v4-supervisor/reporting/featureValidationReportEngine.mjs";

const tempRepo = "./temp-report-repo";
const specDir = path.join(tempRepo, "ai-specs");
const moduleDir = path.join(tempRepo, "core");

fs.mkdirSync(specDir, { recursive: true });
fs.mkdirSync(moduleDir, { recursive: true });

fs.writeFileSync(
    path.join(moduleDir, "math.mjs"),
    "// @ai-feature FT-REP-001\nexport function add(a, b) { return a + b; }"
);

const spec = {
    specVersion: "1.0",
    featureId: "FT-REP-001",
    title: "Report Test",
    description: "Testing report engine",
    author: "Test",
    createdAt: new Date().toISOString(),
    scope: { type: "LOCAL", modules: ["core"] },
    executionTarget: {
        modulePath: "core/math.mjs",
        exportName: "add"
    },
    behavioralTests: [
        { input: [1, 1], expectedOutput: 2 }
    ],
    nonRegressionZones: [],
    behavior: { inputs: [], outputs: [], sideEffects: [] },
    acceptanceCriteria: ["Must pass"],
    constraints: {
        noDependencyChange: true,
        noGlobalStateMutation: true,
        performanceBudgetMs: 10
    }
};

fs.writeFileSync(
    path.join(specDir, "FT-REP-001.json"),
    JSON.stringify(spec, null, 2)
);

console.log("FEATURE VALIDATION REPORT TEST");
runFeatureValidationReportEngine(tempRepo).then(result => {
    console.log(result);
    fs.rmSync(tempRepo, { recursive: true, force: true });
});
