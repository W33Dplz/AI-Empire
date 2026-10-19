import fs from "fs";
import path from "path";
import { validateSpecDirectory } from "./specDirectoryValidator.mjs";

export function buildSpecRegistry(repoPath) {

    const validation = validateSpecDirectory(repoPath);

    if (!validation.exists) {
        return {
            specCount: 0,
            features: []
        };
    }

    const specDir = path.join(repoPath, "ai-specs");
    const files = fs.readdirSync(specDir);

    const features = [];

    for (const file of files) {

        const fullPath = path.join(specDir, file);
        const raw = fs.readFileSync(fullPath, "utf-8");
        const parsed = JSON.parse(raw);

        features.push({
            featureId: parsed.featureId,
            scopeType: parsed.scope.type,
            scopeModules: parsed.scope.modules
        });
    }

    return {
        specCount: features.length,
        features
    };
}
