import fs from "fs";
import path from "path";
import { validateSpecDirectory } from "../../v4-supervisor/spec/specDirectoryValidator.mjs";

const tempRepo = "./temp-test-repo";
const specDir = path.join(tempRepo, "ai-specs");

fs.mkdirSync(specDir, { recursive: true });

const validSpec = {
    specVersion: "1.0",
    featureId: "FT-TEST-001",
    title: "Test Feature",
    description: "Testing spec directory",
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
    acceptanceCriteria: ["Must work"],
    nonRegressionZones: [],
    constraints: {
        noDependencyChange: true,
        noGlobalStateMutation: true,
        performanceBudgetMs: 100
    }
};

fs.writeFileSync(
    path.join(specDir, "FT-TEST-001.json"),
    JSON.stringify(validSpec, null, 2)
);

console.log("SPEC DIRECTORY TEST");
console.log(validateSpecDirectory(tempRepo));

fs.rmSync(tempRepo, { recursive: true, force: true });
