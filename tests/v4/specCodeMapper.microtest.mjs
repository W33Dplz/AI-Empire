import fs from "fs";
import path from "path";
import { runSpecCodeMapper } from "../../v4-supervisor/spec/specCodeMapper.mjs";

const tempRepo = "./temp-mapper-repo";
const specDir = path.join(tempRepo, "ai-specs");
const moduleDir = path.join(tempRepo, "core");

fs.mkdirSync(specDir, { recursive: true });
fs.mkdirSync(moduleDir, { recursive: true });

fs.writeFileSync(path.join(moduleDir, "fileA.js"), "console.log('A');");
fs.writeFileSync(path.join(moduleDir, "fileB.js"), "console.log('B');");

const spec = {
    specVersion: "1.0",
    featureId: "FT-MAP-001",
    title: "Mapping Test",
    description: "Testing mapping",
    author: "Test",
    createdAt: new Date().toISOString(),
    scope: {
        type: "LOCAL",
        modules: ["core"]
    },
    behavior: { inputs: [], outputs: [], sideEffects: [] },
    acceptanceCriteria: ["Must map files"],
    nonRegressionZones: [],
    constraints: {
        noDependencyChange: true,
        noGlobalStateMutation: true,
        performanceBudgetMs: 10
    }
};

fs.writeFileSync(
    path.join(specDir, "FT-MAP-001.json"),
    JSON.stringify(spec, null, 2)
);

console.log("SPEC CODE MAPPING TEST");
console.log(runSpecCodeMapper(tempRepo));

fs.rmSync(tempRepo, { recursive: true, force: true });
