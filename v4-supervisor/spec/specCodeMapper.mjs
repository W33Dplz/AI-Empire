import fs from "fs";
import path from "path";
import { buildSpecRegistry } from "./specRegistryBuilder.mjs";

function collectFilesRecursive(basePath) {
    let results = [];

    if (!fs.existsSync(basePath)) {
        return results;
    }

    const entries = fs.readdirSync(basePath);

    for (const entry of entries) {
        const fullPath = path.join(basePath, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(collectFilesRecursive(fullPath));
        } else {
            results.push(fullPath);
        }
    }

    return results;
}

export function runSpecCodeMapper(repoPath) {

    const registry = buildSpecRegistry(repoPath);

    const mapping = [];

    for (const feature of registry.features) {

        let resolvedFilePaths = [];

        if (feature.scopeType === "LOCAL") {
            for (const modulePath of feature.scopeModules) {
                const fullModulePath = path.join(repoPath, modulePath);
                resolvedFilePaths = resolvedFilePaths.concat(
                    collectFilesRecursive(fullModulePath)
                );
            }
        }

        if (feature.scopeType === "GLOBAL") {
            resolvedFilePaths = collectFilesRecursive(repoPath)
                .filter(p => !p.includes(path.join(repoPath, "ai-specs")));
        }

        mapping.push({
            featureId: feature.featureId,
            scopeType: feature.scopeType,
            resolvedFileCount: resolvedFilePaths.length,
            resolvedFilePaths
        });
    }

    return mapping;
}
