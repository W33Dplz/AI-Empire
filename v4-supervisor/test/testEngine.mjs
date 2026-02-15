import fs from "node:fs/promises";
import path from "node:path";

export async function runTests(repoPath, diffSummary) {

    if (!repoPath) {
        throw new Error("repoPath required");
    }

    if (!diffSummary || typeof diffSummary !== "object") {
        throw new Error("diffSummary required");
    }

    let packageJsonValid = true;
    let packageLockValid = true;

    if (diffSummary.modified.includes("package.json")) {
        try {
            const pkgRaw = await fs.readFile(path.join(repoPath, "package.json"), "utf-8");
            JSON.parse(pkgRaw);
        } catch {
            packageJsonValid = false;
        }
    }

    if (diffSummary.modified.includes("package-lock.json")) {
        try {
            const lockRaw = await fs.readFile(path.join(repoPath, "package-lock.json"), "utf-8");
            JSON.parse(lockRaw);
        } catch {
            packageLockValid = false;
        }
    }

    const testPassed = packageJsonValid && packageLockValid;

    return {
        packageJsonValid,
        packageLockValid,
        testPassed
    };
}
