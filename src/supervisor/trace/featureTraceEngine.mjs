export function runFeatureTrace(diffSummary) {

    if (!diffSummary || typeof diffSummary !== "object") {
        throw new Error("diffSummary required");
    }

    const impactedLayers = {
        ui: [],
        routing: [],
        services: [],
        config: [],
        dependencies: [],
        unknown: []
    };

    const files = []
        .concat(diffSummary.modified || [])
        .concat(diffSummary.added || []);

    for (const file of files) {

        if (file.includes("/pages/") || file.includes("/app/")) {
            impactedLayers.routing.push(file);
        }
        else if (file.includes("/components/")) {
            impactedLayers.ui.push(file);
        }
        else if (file.includes("/services/") || file.includes("/api/")) {
            impactedLayers.services.push(file);
        }
        else if (file === "package.json" || file === "package-lock.json") {
            impactedLayers.dependencies.push(file);
        }
        else if (file.includes(".env") || file.includes("config")) {
            impactedLayers.config.push(file);
        }
        else {
            impactedLayers.unknown.push(file);
        }
    }

    const regressionRiskLevel = calculateRisk(impactedLayers);

    return {
        impactedLayers,
        regressionRiskLevel
    };
}

function calculateRisk(layers) {

    if (layers.dependencies.length > 0) {
        return "HIGH";
    }

    if (layers.services.length > 0) {
        return "MEDIUM";
    }

    if (layers.routing.length > 0) {
        return "MEDIUM";
    }

    if (layers.ui.length > 0) {
        return "LOW";
    }

    return "LOW";
}
