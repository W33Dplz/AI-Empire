import { runSpecComplianceDetector } from "../spec/specComplianceDetector.mjs";
import { runFeatureBehaviorAggregator } from "../behavior/featureBehaviorAggregator.mjs";

export async function runFeatureValidationLayer(repoPath) {

    const complianceResults = runSpecComplianceDetector(repoPath);
    const behaviorResults = await runFeatureBehaviorAggregator(repoPath);

    const featureMap = {};

    for (const c of complianceResults) {
        featureMap[c.featureId] = {
            declarationDetected: c.declarationDetected,
            complianceStatus: c.complianceStatus,
            severity: c.severity
        };
    }

    for (const b of behaviorResults.results) {

        if (!featureMap[b.featureId]) {
            continue;
        }

        if (!featureMap[b.featureId].declarationDetected) {
            featureMap[b.featureId].finalStatus = "MISSING_DECLARATION";
            continue;
        }

        if (b.status === "PASSED") {
            featureMap[b.featureId].finalStatus = "VALIDATED";
        } else if (b.status === "FAILED") {
            featureMap[b.featureId].finalStatus = "FAILED_BEHAVIOR";
        } else {
            featureMap[b.featureId].finalStatus = "DECLARED_BUT_NOT_TESTED";
        }
    }

    const results = Object.keys(featureMap).map(featureId => ({
        featureId,
        ...featureMap[featureId]
    }));

    const allValidated = results.every(r => r.finalStatus === "VALIDATED");

    return {
        globalStatus: allValidated ? "ALL_FEATURES_VALIDATED" : "FEATURE_VALIDATION_ISSUES",
        featureCount: results.length,
        results
    };
}
