import fs from "node:fs/promises";
import path from "node:path";

async function scanTests(repoPath) {
    const results = [];

    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (["node_modules", ".git"].includes(entry.name)) continue;
                await walk(fullPath);
            } else {
                const lower = entry.name.toLowerCase();
                if (
                    lower.includes(".test.") ||
                    lower.includes(".spec.") ||
                    dir.toLowerCase().includes("test")
                ) {
                    results.push(fullPath);
                }
            }
        }
    }

    await walk(repoPath);
    return results;
}

function isExecutableCodeFile(filePath) {
    const lower = filePath.toLowerCase();

    if (
        lower.endsWith(".js") ||
        lower.endsWith(".ts") ||
        lower.endsWith(".mjs") ||
        lower.endsWith(".cjs")
    ) {
        if (lower.endsWith(".d.ts")) return false;
        if (lower.endsWith("package.json")) return false;
        if (lower.endsWith("package-lock.json")) return false;
        return true;
    }

    return false;
}

export async function runValidationCoverageEngine(repoPath, diffSummary, featureRegistry) {

    if (!repoPath || !diffSummary) {
        throw new Error("repoPath and diffSummary required");
    }

    const files = []
        .concat(diffSummary.modified || [])
        .concat(diffSummary.added || []);

    const codeFiles = files.filter(isExecutableCodeFile);

    const modifiedModules = Array.from(
        new Set(
            codeFiles
                .map(f => path.basename(f).split(".")[0])
                .filter(Boolean)
        )
    );

    const testFiles = await scanTests(repoPath);

    const detectedTestFiles = [];
    const modulesWithoutTests = [];

    for (const moduleName of modifiedModules) {

        const found = testFiles.find(t =>
            t.toLowerCase().includes(moduleName.toLowerCase())
        );

        if (found) {
            detectedTestFiles.push(found);
        } else {
            modulesWithoutTests.push(moduleName);
        }
    }

    let featureHasAssociatedTest = null;

    if (featureRegistry && featureRegistry.featureDeclared && modifiedModules.length > 0) {
        featureHasAssociatedTest = modulesWithoutTests.length === 0;
    }

    let coverageConfidence = "HIGH";
    let coverageRiskLevel = "NONE";

    if (modifiedModules.length === 0) {
        coverageConfidence = "NOT_APPLICABLE";
        coverageRiskLevel = "NONE";
    }
    else if (modulesWithoutTests.length === modifiedModules.length) {
        coverageConfidence = "LOW";
        coverageRiskLevel = "HIGH";
    }
    else if (modulesWithoutTests.length > 0) {
        coverageConfidence = "MEDIUM";
        coverageRiskLevel = "WARNING";
    }

    if (
        modifiedModules.length > 0 &&
        featureRegistry &&
        featureRegistry.featureDeclared &&
        featureHasAssociatedTest === false
    ) {
        coverageConfidence = "NONE";
        coverageRiskLevel = "CRITICAL";
    }

    return {
        modifiedModules,
        detectedTestFiles,
        modulesWithoutTests,
        featureHasAssociatedTest,
        coverageConfidence,
        coverageRiskLevel
    };
}
