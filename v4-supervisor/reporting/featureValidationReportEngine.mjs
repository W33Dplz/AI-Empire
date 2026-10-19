import { runFeatureValidationLayer } from "../feature/featureValidationLayer.mjs";
import { runNonRegressionZoneExecutor } from "../nonregression/nonRegressionZoneExecutor.mjs";

export async function runFeatureValidationReportEngine(repoPath) {

    const featureValidation = await runFeatureValidationLayer(repoPath);
    const nonRegression = await runNonRegressionZoneExecutor(repoPath);

    const report = [];

    for (const feature of featureValidation.results) {

        const regressionIssues = nonRegression.results
            .filter(r => r.featureId === feature.featureId && !r.passed);

        let finalStatus = "VALIDATED";

        if (feature.finalStatus !== "VALIDATED") {
            finalStatus = feature.finalStatus;
        }

        if (regressionIssues.length > 0) {
            finalStatus = "FAILED_NON_REGRESSION";
        }

        report.push({
            featureId: feature.featureId,
            declaration: feature.declarationDetected ? "OK" : "MISSING",
            behavior: feature.finalStatus === "VALIDATED" ? "PASSED" : feature.finalStatus,
            nonRegression: regressionIssues.length === 0 ? "OK" : "FAILED",
            finalStatus
        });
    }

    const hasFailures = report.some(r => r.finalStatus !== "VALIDATED");

    return {
        repoStatus: hasFailures ? "UNSAFE" : "SAFE",
        featureCount: report.length,
        report
    };
}
