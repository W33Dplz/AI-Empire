export function runIntentClassifier(diffSummary, architecturalImpact, regressionGuard) {

    if (!diffSummary || !architecturalImpact || !regressionGuard) {
        throw new Error("diffSummary, architecturalImpact and regressionGuard required");
    }

    const layers = architecturalImpact.impactedLayers;

    let changeIntentType = "UNKNOWN";

    if (layers.dependencies.length > 0) {
        changeIntentType = "DEPENDENCY_CHANGE";
    }
    else if (layers.services.length > 0) {
        changeIntentType = "SERVICE_CHANGE";
    }
    else if (layers.routing.length > 0) {
        changeIntentType = "ROUTING_CHANGE";
    }
    else if (layers.ui.length > 0) {
        changeIntentType = "UI_CHANGE";
    }
    else if (layers.config.length > 0) {
        changeIntentType = "CONFIG_CHANGE";
    }

    let scopeConsistency = "MEDIUM";

    if (architecturalImpact.impactType === "STRUCTURAL" && changeIntentType === "DEPENDENCY_CHANGE") {
        scopeConsistency = "LOW";
    }
    else if (architecturalImpact.impactType === "LOCAL") {
        scopeConsistency = "HIGH";
    }

    const suspiciousPattern =
        layers.unknown.length > 0 ||
        (layers.config.length > 0 && layers.dependencies.length > 0) ||
        regressionGuard.regressionGuardLevel === "CRITICAL";

    let intentConfidence = "MEDIUM";

    if (changeIntentType === "UNKNOWN") {
        intentConfidence = "LOW";
    }
    else if (!suspiciousPattern) {
        intentConfidence = "HIGH";
    }

    return {
        changeIntentType,
        scopeConsistency,
        suspiciousPattern,
        intentConfidence
    };
}
