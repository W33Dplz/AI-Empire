import fs from "node:fs/promises";
import path from "node:path";

export async function runFeatureClaimRegistry(repoPath, diffSummary, architecturalImpact) {

    const registryPath = path.join(process.cwd(), "v4-supervisor/registry/feature-claims.json");

    let registry = [];

    try {
        const raw = await fs.readFile(registryPath, "utf-8");
        registry = JSON.parse(raw);
    } catch {
        throw new Error("Feature registry unreadable");
    }

    const latestFeature = registry.length > 0 ? registry[registry.length - 1] : null;

    if (!latestFeature) {
        return {
            featureDeclared: false,
            registryWarnings: ["missingFeatureDeclaration"],
            registryBlockingIssues: [],
            mismatchSeverity: "NONE",
            registryConfidenceImpact: "NONE"
        };
    }

    const evaluation = evaluateDeclaredVsActual(latestFeature, architecturalImpact);

    return {
        featureDeclared: true,
        registryWarnings: evaluation.warnings,
        registryBlockingIssues: evaluation.blocking,
        mismatchSeverity: evaluation.severity,
        registryConfidenceImpact: evaluation.confidenceImpact
    };
}

function evaluateDeclaredVsActual(feature, architecturalImpact) {

    const warnings = [];
    const blocking = [];

    let severity = "NONE";
    let confidenceImpact = "NONE";

    if (feature.expectedImpactLevel === "LOW" && architecturalImpact.architecturalRiskLevel === "HIGH") {
        blocking.push("Declared LOW but actual HIGH impact");
        severity = "MAJOR";
        confidenceImpact = "INVALIDATE";
    }

    if (feature.declaredScope === "LOCAL" && architecturalImpact.scope === "GLOBAL") {
        blocking.push("Declared LOCAL but actual GLOBAL scope");
        severity = "MAJOR";
        confidenceImpact = "INVALIDATE";
    }

    if (feature.declaredScope === "GLOBAL" && architecturalImpact.scope === "LOCAL") {
        warnings.push("Declared GLOBAL but change localized");
        severity = "MINOR";
        confidenceImpact = "REDUCE";
    }

    if (feature.expectedImpactLevel === "STRUCTURAL" && architecturalImpact.impactType === "LOCAL") {
        warnings.push("Declared STRUCTURAL but impact local");
        severity = severity === "MAJOR" ? "MAJOR" : "MINOR";
        confidenceImpact = severity === "MAJOR" ? "INVALIDATE" : "REDUCE";
    }

    return { warnings, blocking, severity, confidenceImpact };
}
