export function runRegressionGuard(traceResult) {

    if (!traceResult) {
        throw new Error("traceResult required");
    }

    const layers = traceResult.impactedLayers;

    let regressionScope = "NONE";
    let regressionGuardLevel = "LOW";
    let indirectRisk = false;

    if (layers.dependencies.length > 0) {
        regressionScope = "GLOBAL";
        regressionGuardLevel = "HIGH";
        indirectRisk = true;
    }
    else if (layers.services.length > 0) {
        regressionScope = "SERVICE_BOUND";
        regressionGuardLevel = "MEDIUM";
        indirectRisk = true;
    }
    else if (layers.routing.length > 0) {
        regressionScope = "ROUTE_BOUND";
        regressionGuardLevel = "MEDIUM";
    }
    else if (layers.ui.length > 0) {
        regressionScope = "UI_BOUND";
        regressionGuardLevel = "LOW";
    }

    return {
        regressionScope,
        indirectRisk,
        regressionGuardLevel
    };
}
