import fs from "fs";
import path from "path";
import { runNonRegressionZoneExecutor } from "../../v4-supervisor/nonregression/nonRegressionZoneExecutor.mjs";

const tempRepo = "./temp-nonregression-repo";
const specDir = path.join(tempRepo, "ai-specs");
const moduleDir = path.join(tempRepo, "core");

fs.mkdirSync(specDir, { recursive: true });
fs.mkdirSync(moduleDir, { recursive: true });

fs.writeFileSync(
    path.join(moduleDir, "math.mjs"),
    "export function multiply(a, b) { return a * b; }"
);

const spec = {
    specVersion: "1.0",
    featureId: "FT-NR-001",
    title: "NonRegression Test",
    description: "Testing non regression",
    author: "Test",
    createdAt: new Date().toISOString(),
    scope: { type: "LOCAL", modules: ["core"] },
    nonRegressionZones: [
        {
            executionTarget: {
                modulePath: "core/math.mjs",
                exportName: "multiply"
            },
            behavioralTests: [
                { input: [2, 3], expectedOutput: 6 }
            ]
        }
    ]
};

fs.writeFileSync(
    path.join(specDir, "FT-NR-001.json"),
    JSON.stringify(spec, null, 2)
);

console.log("NON REGRESSION ZONE TEST");
runNonRegressionZoneExecutor(tempRepo).then(result => {
    console.log(result);
    fs.rmSync(tempRepo, { recursive: true, force: true });
});
