export function runCertificationEngine(
    decision,
    scopeDrift,
    validationCoverage,
    featureVerification,
    featureRegistry
) {

    if (!decision || !scopeDrift || !validationCoverage || !featureVerification) {
        throw new Error("Missing required certification inputs");
    }

    let certificationStatus = "READY";
    const certificationReasons = [];

    if (decision.overallStatus === "BLOCKED") {
        certificationStatus = "BLOCKED";
        certificationReasons.push("Decision engine blocked change");
    }
    else if (
        decision.overallStatus === "REVIEW" ||
        scopeDrift.driftSeverity === "HIGH" ||
        validationCoverage.coverageRiskLevel === "HIGH"
    ) {
        certificationStatus = "REVIEW";
        certificationReasons.push("Requires review based on governance signals");
    }
    else if (
        decision.overallStatus === "READY" &&
        featureVerification.featureVerified === true &&
        scopeDrift.driftSeverity === "NONE" &&
        validationCoverage.coverageRiskLevel === "NONE" &&
        (!featureRegistry || featureRegistry.registryConfidenceImpact !== "INVALIDATE")
    ) {
        certificationStatus = "CERTIFIED";
        certificationReasons.push("All governance dimensions aligned");
    }

    let certificationConfidence = "HIGH";

    if (certificationStatus === "REVIEW") {
        certificationConfidence = "MEDIUM";
    }

    return {
        certificationStatus,
        certificationReasons,
        certificationConfidence
    };
}
