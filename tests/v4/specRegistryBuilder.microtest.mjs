import fs from "fs";
import path from "path";
import { buildSpecRegistry } from "../../v4-supervisor/spec/specRegistryBuilder.mjs";

const tempRepo = "./temp-test-repo-registry";
const specDir = path.join(tempRepo, "ai-specs");

fs.mkdirSync(specDir, { recursive: true });

const spec = {
    specVersion: "1.0",
    featureId: "FT-REG-001",
    title: "Registry Test",
    description: "Testing registry builder",
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
    acceptanceCriteria: ["Must register"],
    nonRegressionZones: [],
    constraints: {
        noDependencyChange: true,
        noGlobalStateMutation: true,
        performanceBudgetMs: 50
    }
};

fs.writeFileSync(
    path.join(specDir, "FT-REG-001.json"),
    JSON.stringify(spec, null, 2)
);

console.log("SPEC REGISTRY TEST");
console.log(buildSpecRegistry(tempRepo));

fs.rmSync(tempRepo, { recursive: true, force: true });
