export function buildImpactGraph(diffSummary) {

    if (!diffSummary || typeof diffSummary !== "object") {
        throw new Error("Invalid diffSummary");
    }

    if (!Array.isArray(diffSummary.modified)) {
        throw new Error("diffSummary.modified must be array");
    }

    return {
        affectedModules: [...diffSummary.modified],
        affectedRoutes: [],
        affectedServices: []
    };
}
