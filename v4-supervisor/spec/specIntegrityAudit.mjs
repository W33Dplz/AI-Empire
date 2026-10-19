import fs from "fs";
import path from "path";
import { buildSpecRegistry } from "./specRegistryBuilder.mjs";

export function runSpecIntegrityAudit(repoPath) {

    const registry = buildSpecRegistry(repoPath);

    if (registry.specCount === 0) {
        return {
            status: "NO_SPECS",
            issues: []
        };
    }

    const issues = [];

    for (const feature of registry.features) {

        if (feature.scopeType === "LOCAL") {

            if (!Array.isArray(feature.scopeModules) || feature.scopeModules.length === 0) {
                issues.push({
                    featureId: feature.featureId,
                    type: "ORPHAN_SPEC",
                    message: "LOCAL scope without modules"
                });
                continue;
            }

            for (const modulePath of feature.scopeModules) {

                const fullPath = path.join(repoPath, modulePath);

                if (!fs.existsSync(fullPath)) {
                    issues.push({
                        featureId: feature.featureId,
                        type: "MISSING_MODULE",
                        message: `Module path does not exist: ${modulePath}`
                    });
                }
            }
        }
    }

    return {
        status: issues.length === 0 ? "VALID" : "INVALID",
        issues
    };
}
