import fs from "fs";
import path from "path";
import { validateFeatureSpecV1 } from "./featureSpecValidator.mjs";

const FILE_REGEX = /^FT-[A-Z0-9\-]+\.json$/;

export function validateSpecDirectory(repoPath) {

    const specDir = path.join(repoPath, "ai-specs");

    if (!fs.existsSync(specDir)) {
        return {
            exists: false,
            specs: []
        };
    }

    const files = fs.readdirSync(specDir);

    const seenFeatureIds = new Set();
    const validSpecs = [];

    for (const file of files) {

        if (!FILE_REGEX.test(file)) {
            throw new Error(`Invalid spec filename: ${file}`);
        }

        const fullPath = path.join(specDir, file);
        const raw = fs.readFileSync(fullPath, "utf-8");

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new Error(`Invalid JSON in spec file: ${file}`);
        }

        validateFeatureSpecV1(parsed);

        const expectedFeatureId = file.replace(".json", "");

        if (parsed.featureId !== expectedFeatureId) {
            throw new Error(`featureId mismatch in ${file}`);
        }

        if (seenFeatureIds.has(parsed.featureId)) {
            throw new Error(`Duplicate featureId detected: ${parsed.featureId}`);
        }

        seenFeatureIds.add(parsed.featureId);

        validSpecs.push(parsed.featureId);
    }

    return {
        exists: true,
        specs: validSpecs
    };
}
