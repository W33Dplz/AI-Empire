export function runFeatureVerificationEngine(
    featureRegistry,
    architecturalImpact,
    diffSummary
) {

    if (!featureRegistry || !architecturalImpact || !diffSummary) {
        throw new Error("featureRegistry, architecturalImpact and diffSummary required");
    }

    const verificationIssues = [];

    if (!featureRegistry.featureDeclared) {
        return {
            featureVerified: false,
            structuralAlignment: "MISMATCH",
            verificationConfidence: "LOW",
            verificationIssues: ["No feature declared"]
        };
    }

    const declaredScope = featureRegistry.declaredScope || "UNKNOWN";
    const realScope = architecturalImpact.scope;

    let structuralAlignment = "ALIGNED";

    if (declaredScope === "LOCAL" && realScope === "GLOBAL") {
        structuralAlignment = "MISMATCH";
        verificationIssues.push("Declared LOCAL but impact GLOBAL");
    }
    else if (declaredScope === "GLOBAL" && realScope === "LOCAL") {
        structuralAlignment = "PARTIAL";
        verificationIssues.push("Declared GLOBAL but impact LOCAL");
    }

    const runtimeFiles = [
        ...(diffSummary.modified || []),
        ...(diffSummary.added || [])
    ].filter(f =>
        f.endsWith(".js") ||
        f.endsWith(".ts") ||
        f.endsWith(".mjs")
    );

    if (runtimeFiles.length === 0) {
        verificationIssues.push("No runtime code modified");
    }

    let verificationConfidence = "HIGH";

    if (structuralAlignment === "MISMATCH") {
        verificationConfidence = "LOW";
    }
    else if (structuralAlignment === "PARTIAL") {
        verificationConfidence = "MEDIUM";
    }

    const featureVerified = structuralAlignment !== "MISMATCH";

    return {
        featureVerified,
        structuralAlignment,
        verificationConfidence,
        verificationIssues
    };
}
