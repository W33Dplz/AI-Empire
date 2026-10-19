import fs from "fs";
import path from "path";
import { runSpecPresenceGuard } from "../../v4-supervisor/spec/specPresenceGuard.mjs";

const repoWithoutSpecs = "./temp-repo-no-specs";
fs.mkdirSync(repoWithoutSpecs, { recursive: true });

console.log("NO SPECS TEST");
console.log(runSpecPresenceGuard(repoWithoutSpecs));

const repoWithSpecs = "./temp-repo-with-specs";
const specDir = path.join(repoWithSpecs, "ai-specs");
fs.mkdirSync(specDir, { recursive: true });

const validSpec = {
    specVersion: "1.0",
    featureId: "FT-GUARD-001",
    title: "Guard Test",
    description: "Testing presence guard",
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
    path.join(specDir, "FT-GUARD-001.json"),
    JSON.stringify(validSpec, null, 2)
);

console.log("VALID SPECS TEST");
console.log(runSpecPresenceGuard(repoWithSpecs));

fs.rmSync(repoWithoutSpecs, { recursive: true, force: true });
fs.rmSync(repoWithSpecs, { recursive: true, force: true });
