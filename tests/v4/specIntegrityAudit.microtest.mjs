import fs from "fs";
import path from "path";
import { runSpecIntegrityAudit } from "../../v4-supervisor/spec/specIntegrityAudit.mjs";

const tempRepo = "./temp-integrity-repo";
const specDir = path.join(tempRepo, "ai-specs");
const moduleDir = path.join(tempRepo, "core");

fs.mkdirSync(specDir, { recursive: true });
fs.mkdirSync(moduleDir, { recursive: true });

const validSpec = {
    specVersion: "1.0",
    featureId: "FT-INTEGRITY-001",
    title: "Integrity Test",
    description: "Testing integrity audit",
    author: "Test",
    createdAt: new Date().toISOString(),
    scope: {
        type: "LOCAL",
        modules: ["core"]
    },
    behavior: {
        inputs: [],
        outputs: [],
        sideEffects: []
    },
    acceptanceCriteria: ["Must validate"],
    nonRegressionZones: [],
    constraints: {
        noDependencyChange: true,
        noGlobalStateMutation: true,
        performanceBudgetMs: 10
    }
};

fs.writeFileSync(
    path.join(specDir, "FT-INTEGRITY-001.json"),
    JSON.stringify(validSpec, null, 2)
);

console.log("VALID INTEGRITY TEST");
console.log(runSpecIntegrityAudit(tempRepo));

fs.rmSync(moduleDir, { recursive: true, force: true });

console.log("INVALID INTEGRITY TEST");
console.log(runSpecIntegrityAudit(tempRepo));

fs.rmSync(tempRepo, { recursive: true, force: true });
