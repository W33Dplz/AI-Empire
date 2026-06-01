export function buildImpactGraphV2(diffSummary) {

    if (!diffSummary || typeof diffSummary !== "object") {
        throw new Error("diffSummary required");
    }

    const files = []
        .concat(diffSummary.modified || [])
        .concat(diffSummary.added || []);

    const impactedLayers = {
        ui: [],
        routing: [],
        services: [],
        config: [],
        dependencies: [],
        unknown: []
    };

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

    const analysis = computeArchitecturalImpact(impactedLayers);

    return {
        impactedLayers,
        impactType: analysis.impactType,
        scope: analysis.scope,
        propagationSurfaceScore: analysis.propagationSurfaceScore,
        architecturalRiskLevel: analysis.architecturalRiskLevel
    };
}

function computeArchitecturalImpact(layers) {

    if (layers.dependencies.length > 0) {
        return {
            impactType: "STRUCTURAL",
            scope: "GLOBAL",
            propagationSurfaceScore: 9,
            architecturalRiskLevel: "HIGH"
        };
    }

    if (layers.services.length > 0) {
        return {
            impactType: "BEHAVIORAL",
            scope: "MODULE",
            propagationSurfaceScore: 6,
            architecturalRiskLevel: "MEDIUM"
        };
    }

    if (layers.routing.length > 0) {
        return {
            impactType: "BEHAVIORAL",
            scope: "MODULE",
            propagationSurfaceScore: 5,
            architecturalRiskLevel: "MEDIUM"
        };
    }

    if (layers.ui.length > 0) {
        return {
            impactType: "BEHAVIORAL",
            scope: "LOCAL",
            propagationSurfaceScore: 3,
            architecturalRiskLevel: "LOW"
        };
    }

    if (layers.config.length > 0) {
        return {
            impactType: "CONFIGURATION",
            scope: "GLOBAL",
            propagationSurfaceScore: 7,
            architecturalRiskLevel: "HIGH"
        };
    }

    return {
        impactType: "UNKNOWN",
        scope: "LOCAL",
        propagationSurfaceScore: 1,
        architecturalRiskLevel: "LOW"
    };
}
