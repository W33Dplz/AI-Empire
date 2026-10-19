import fs from "node:fs/promises";
import path from "node:path";

export async function runAudit(repoPath, diffSummary) {

    if (!repoPath) {
        throw new Error("repoPath required");
    }

    if (!diffSummary || typeof diffSummary !== "object") {
        throw new Error("diffSummary required");
    }

    const missingFiles = [];
    const unexpectedFiles = [];

    for (const file of diffSummary.modified.concat(diffSummary.added)) {
        const fullPath = path.join(repoPath, file);
        try {
            await fs.access(fullPath);
        } catch {
            missingFiles.push(file);
        }
    }

    for (const file of diffSummary.deleted) {
        const fullPath = path.join(repoPath, file);
        try {
            await fs.access(fullPath);
            unexpectedFiles.push(file);
        } catch {
        }
    }

    let packageJsonValid = true;

    if (diffSummary.modified.includes("package.json")) {
        try {
            const pkg = await fs.readFile(path.join(repoPath, "package.json"), "utf-8");
            JSON.parse(pkg);
        } catch {
            packageJsonValid = false;
        }
    }

    const fileIntegrityOk = missingFiles.length === 0 && unexpectedFiles.length === 0;
    const auditPassed = fileIntegrityOk && packageJsonValid;

    return {
        fileIntegrityOk,
        missingFiles,
        unexpectedFiles,
        packageJsonValid,
        auditPassed
    };
}
