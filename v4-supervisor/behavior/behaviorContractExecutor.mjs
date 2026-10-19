import path from "path";
import { pathToFileURL } from "url";
import fs from "fs";

export async function runBehaviorContractExecutor(repoPath, spec) {

    if (!spec.executionTarget) {
        throw new Error("Missing executionTarget in spec");
    }

    if (!Array.isArray(spec.behavioralTests)) {
        throw new Error("Missing behavioralTests array in spec");
    }

    const moduleFullPath = path.join(repoPath, spec.executionTarget.modulePath);

    if (!fs.existsSync(moduleFullPath)) {
        throw new Error("Execution module does not exist");
    }

    const moduleUrl = pathToFileURL(moduleFullPath).href;
    const importedModule = await import(moduleUrl);

    const targetFunction = importedModule[spec.executionTarget.exportName];

    if (typeof targetFunction !== "function") {
        throw new Error("Exported function not found");
    }

    const results = [];

    for (const test of spec.behavioralTests) {

        const output = await targetFunction(...test.input);

        const success =
            JSON.stringify(output) === JSON.stringify(test.expectedOutput);

        results.push({
            input: test.input,
            expectedOutput: test.expectedOutput,
            actualOutput: output,
            success
        });
    }

    const allPassed = results.every(r => r.success);

    return {
        status: allPassed ? "PASSED" : "FAILED",
        testCount: results.length,
        results
    };
}
