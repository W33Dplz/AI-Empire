export function runRegressionGuardV2(
    architecturalImpact,
    diffSummary,
    audit,
    test,
    architecturalScore
) {

    const added = diffSummary.added || [];
    const modified = diffSummary.modified || [];

    let dependencyRisk = "NONE";
    let propagationRisk = "NONE";
    let configRisk = "NONE";
    let nonRuntimeRisk = "NONE";

    // -------------------------
    // AXE 1 – Dependency Risk
    // -------------------------

    const packageModified = modified.includes("package.json");
    const lockModified = modified.includes("package-lock.json");

    if (packageModified && !lockModified) {
        dependencyRisk = "MEDIUM";
    }

    if (packageModified && lockModified) {
        dependencyRisk = "MEDIUM";
    }

    if (!packageModified && lockModified) {
        dependencyRisk = "LOW";
    }

    // -------------------------
    // AXE 2 – Propagation Risk
    // -------------------------

    if (
        architecturalImpact.scope === "GLOBAL" &&
        architecturalImpact.impactType === "STRUCTURAL"
    ) {
        propagationRisk = "HIGH";
    }
    else if (architecturalImpact.impactType === "STRUCTURAL") {
        propagationRisk = "MEDIUM";
    }
    else if (architecturalImpact.scope === "LOCAL") {
        propagationRisk = "LOW";
    }

    // -------------------------
    // AXE 3 – Config Risk
    // -------------------------

    const configFiles = [...added, ...modified].filter(f =>
        f.toLowerCase().includes("config") ||
        f.toLowerCase().includes(".env")
    );

    if (configFiles.length > 0) {
        configRisk = "LOW";
    }

    // -------------------------
    // AXE 4 – Non-runtime Risk
    // -------------------------

    const runtimeFiles = [...added, ...modified].filter(f =>
        f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".mjs")
    );

    if (runtimeFiles.length === 0) {
        nonRuntimeRisk = "NONE";
    }

    // -------------------------
    // AGRÉGATION
    // -------------------------

    let regressionGuardLevel = "LOW";

    const _highCount = [
        dependencyRisk,
        propagationRisk,
        configRisk
    ].filter(r => r === "HIGH").length;

    const mediumCount = [
        dependencyRisk,
        propagationRisk,
        configRisk
    ].filter(r => r === "MEDIUM").length;

    if (
        propagationRisk === "HIGH" &&
        dependencyRisk === "HIGH" &&
        architecturalScore &&
        architecturalScore.architecturalScore <= 30
    ) {
        regressionGuardLevel = "CRITICAL";
    }
    else if (propagationRisk === "HIGH" || dependencyRisk === "HIGH") {
        regressionGuardLevel = "HIGH";
    }
    else if (mediumCount >= 2) {
        regressionGuardLevel = "HIGH";
    }
    else if (mediumCount === 1) {
        regressionGuardLevel = "MEDIUM";
    }

    return {
        dependencyRisk,
        propagationRisk,
        configRisk,
        nonRuntimeRisk,
        regressionGuardLevel
    };
}
