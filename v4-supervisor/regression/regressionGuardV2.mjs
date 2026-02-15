export function runRegressionGuardV2(architecturalImpact, diffSummary, auditResult, testResult) {

    if (!architecturalImpact || !diffSummary || !auditResult || !testResult) {
        throw new Error("All inputs required for Regression Guard V2");
    }

    const impacted = architecturalImpact.impactedLayers || {};

    let regressionScope = "LOCAL";
    let propagationRisk = "LOW";
    let validationCoverageRisk = "LOW";
    let manualVerificationZones = [];

    if (architecturalImpact.impactType === "STRUCTURAL" &&
        architecturalImpact.scope === "GLOBAL") {
        regressionScope = "GLOBAL";
    }

    if ((impacted.dependencies && impacted.dependencies.length > 0) ||
        architecturalImpact.propagationSurfaceScore >= 8) {
        propagationRisk = "HIGH";
        manualVerificationZones.push("dependencies");
        manualVerificationZones.push("bootstrap");
        manualVerificationZones.push("runtime");
    }

    if (!testResult.testPassed) {
        validationCoverageRisk = "HIGH";
    } else if (architecturalImpact.architecturalRiskLevel === "HIGH") {
        validationCoverageRisk = "HIGH";
    }

    let regressionGuardLevel = "MODERATE";

    if (architecturalImpact.propagationSurfaceScore >= 8) {
        regressionGuardLevel = "CRITICAL";
    } else if (architecturalImpact.propagationSurfaceScore >= 5) {
        regressionGuardLevel = "HIGH";
    }

    return {
        regressionScope,
        propagationRisk,
        validationCoverageRisk,
        regressionGuardLevel,
        manualVerificationZones
    };
}
