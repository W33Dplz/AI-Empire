import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

async function executeZone(repoPath, zone) {

    const moduleFullPath = path.join(repoPath, zone.executionTarget.modulePath);

    if (!fs.existsSync(moduleFullPath)) {
        throw new Error("NonRegression module not found");
    }

    const moduleUrl = pathToFileURL(moduleFullPath).href;
    const importedModule = await import(moduleUrl);

    const targetFunction = importedModule[zone.executionTarget.exportName];

    if (typeof targetFunction !== "function") {
        throw new Error("NonRegression export not found");
    }

    const results = [];

    for (const test of zone.behavioralTests) {

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

    const passed = results.every(r => r.success);

    return {
        passed,
        testCount: results.length,
        results
    };
}

export async function runNonRegressionZoneExecutor(repoPath) {

    const specsDir = path.join(repoPath, "ai-specs");

    if (!fs.existsSync(specsDir)) {
        return { globalStatus: "NO_SPECS", results: [] };
    }

    const specFiles = fs.readdirSync(specsDir).filter(f => f.endsWith(".json"));

    const results = [];

    for (const file of specFiles) {

        const specPath = path.join(specsDir, file);
        const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

        if (!Array.isArray(spec.nonRegressionZones) || spec.nonRegressionZones.length === 0) {
            continue;
        }

        for (const zone of spec.nonRegressionZones) {

            const zoneResult = await executeZone(repoPath, zone);

            results.push({
                featureId: spec.featureId,
                passed: zoneResult.passed,
                testCount: zoneResult.testCount
            });
        }
    }

    const allPassed = results.every(r => r.passed);

    return {
        globalStatus: allPassed ? "NON_REGRESSION_OK" : "NON_REGRESSION_FAILED",
        zoneCount: results.length,
        results
    };
}
