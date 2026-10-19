import fs from "fs";
import path from "path";
import { runSpecComplianceDetector } from "../../v4-supervisor/spec/specComplianceDetector.mjs";

const tempRepo = "./temp-compliance-repo";
const specDir = path.join(tempRepo, "ai-specs");
const moduleDir = path.join(tempRepo, "core");

fs.mkdirSync(specDir, { recursive: true });
fs.mkdirSync(moduleDir, { recursive: true });

fs.writeFileSync(path.join(moduleDir, "fileA.js"), "// @ai-feature FT-COMP-001\nconsole.log('A');");

const spec = {
    specVersion: "1.0",
    featureId: "FT-COMP-001",
    title: "Compliance Test",
    description: "Testing compliance",
    author: "Test",
    createdAt: new Date().toISOString(),
    scope: {
        type: "LOCAL",
        modules: ["core"]
    },
    behavior: { inputs: [], outputs: [], sideEffects: [] },
    acceptanceCriteria: ["Must declare feature"],
    nonRegressionZones: [],
    constraints: {
        noDependencyChange: true,
        noGlobalStateMutation: true,
        performanceBudgetMs: 10
    }
};

fs.writeFileSync(
    path.join(specDir, "FT-COMP-001.json"),
    JSON.stringify(spec, null, 2)
);

console.log("COMPLIANCE TEST");
console.log(runSpecComplianceDetector(tempRepo));

fs.rmSync(tempRepo, { recursive: true, force: true });
