export function validateFeatureSpecV1(spec) {

    if (!spec || typeof spec !== "object") {
        throw new Error("Spec must be an object");
    }

    const requiredRootFields = [
        "specVersion",
        "featureId",
        "title",
        "description",
        "author",
        "createdAt",
        "scope",
        "behavior",
        "acceptanceCriteria",
        "nonRegressionZones",
        "constraints"
    ];

    for (const field of requiredRootFields) {
        if (!(field in spec)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    if (spec.specVersion !== "1.0") {
        throw new Error("Unsupported specVersion");
    }

    if (!spec.featureId || typeof spec.featureId !== "string") {
        throw new Error("Invalid featureId");
    }

    if (!["LOCAL", "GLOBAL"].includes(spec.scope.type)) {
        throw new Error("Invalid scope.type");
    }

    if (spec.scope.type === "LOCAL" && (!Array.isArray(spec.scope.modules) || spec.scope.modules.length === 0)) {
        throw new Error("LOCAL scope requires at least one module");
    }

    if (!Array.isArray(spec.behavior.inputs) || !Array.isArray(spec.behavior.outputs)) {
        throw new Error("Invalid behavior structure");
    }

    if (!Array.isArray(spec.acceptanceCriteria) || spec.acceptanceCriteria.length === 0) {
        throw new Error("At least one acceptanceCriteria required");
    }

    if (!Array.isArray(spec.nonRegressionZones)) {
        throw new Error("nonRegressionZones must be an array");
    }

    if (typeof spec.constraints !== "object") {
        throw new Error("Invalid constraints");
    }

    if (spec.constraints.performanceBudgetMs < 0) {
        throw new Error("Invalid performanceBudgetMs");
    }

    return {
        valid: true,
        specVersion: spec.specVersion
    };
}
