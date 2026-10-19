import fs from "fs";
import path from "path";
import { runBehaviorContractExecutor } from "./behaviorContractExecutor.mjs";
import { buildSpecRegistry } from "../spec/specRegistryBuilder.mjs";

export async function runFeatureBehaviorAggregator(repoPath) {

    const registry = buildSpecRegistry(repoPath);

    const results = [];

    for (const feature of registry.features) {

        const specPath = path.join(repoPath, "ai-specs", feature.featureId + ".json");

        if (!fs.existsSync(specPath)) {
            continue;
        }

        const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

        if (!spec.executionTarget || !spec.behavioralTests) {
            results.push({
                featureId: feature.featureId,
                status: "NO_BEHAVIOR_DEFINED",
                passed: false
            });
            continue;
        }

        const executionResult = await runBehaviorContractExecutor(repoPath, spec);

        results.push({
            featureId: feature.featureId,
            status: executionResult.status,
            passed: executionResult.status === "PASSED",
            testCount: executionResult.testCount
        });
    }

    const allPassed = results.every(r => r.passed);

    return {
        globalStatus: allPassed ? "ALL_PASSED" : "SOME_FAILED",
        featureCount: results.length,
        results
    };
}
