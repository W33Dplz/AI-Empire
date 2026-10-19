import fs from "fs";
import path from "path";
import { runSpecCodeMapper } from "./specCodeMapper.mjs";

const SPEC_MODE = "TRANSITIONAL"; // change to "STRICT" when ready

function detectFeatureTag(filePath, featureId) {
    if (!fs.existsSync(filePath)) return false;
    const content = fs.readFileSync(filePath, "utf8");
    const pattern = new RegExp(`@ai-feature\\s+${featureId}`);
    return pattern.test(content);
}

export function runSpecComplianceDetector(repoPath) {

    const mappings = runSpecCodeMapper(repoPath);

    const results = [];

    for (const feature of mappings) {

        let detected = false;

        for (const filePath of feature.resolvedFilePaths) {
            if (detectFeatureTag(filePath, feature.featureId)) {
                detected = true;
                break;
            }
        }

        let status = "COMPLIANT";
        let severity = "NONE";

        if (!detected) {
            if (SPEC_MODE === "STRICT") {
                status = "NON_COMPLIANT";
                severity = "ERROR";
            } else {
                status = "MISSING_DECLARATION";
                severity = "WARNING";
            }
        }

        results.push({
            featureId: feature.featureId,
            declarationDetected: detected,
            complianceStatus: status,
            severity
        });
    }

    return results;
}
