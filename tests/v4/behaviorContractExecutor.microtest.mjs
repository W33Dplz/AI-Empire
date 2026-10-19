import fs from "fs";
import path from "path";
import { runBehaviorContractExecutor } from "../../v4-supervisor/behavior/behaviorContractExecutor.mjs";

const tempRepo = "./temp-behavior-repo";
const moduleDir = path.join(tempRepo, "core");

fs.mkdirSync(moduleDir, { recursive: true });

fs.writeFileSync(
    path.join(moduleDir, "math.mjs"),
    "export function add(a, b) { return a + b; }"
);

const spec = {
    executionTarget: {
        modulePath: "core/math.mjs",
        exportName: "add"
    },
    behavioralTests: [
        { input: [2, 3], expectedOutput: 5 },
        { input: [10, 1], expectedOutput: 11 }
    ]
};

console.log("BEHAVIOR CONTRACT TEST");
runBehaviorContractExecutor(tempRepo, spec).then(result => {
    console.log(result);
    fs.rmSync(tempRepo, { recursive: true, force: true });
});
