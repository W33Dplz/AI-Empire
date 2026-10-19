export function runFixEngine(auditResult, testResult) {

    if (!auditResult || !testResult) {
        throw new Error("auditResult and testResult required");
    }

    const fixableIssues = [];
    const manualInterventionRequired = [];

    if (!auditResult.fileIntegrityOk) {
        manualInterventionRequired.push("File integrity mismatch detected");
    }

    if (!auditResult.packageJsonValid) {
        manualInterventionRequired.push("Invalid package.json structure");
    }

    if (!testResult.packageJsonValid) {
        manualInterventionRequired.push("package.json JSON parse failed");
    }

    if (!testResult.packageLockValid) {
        manualInterventionRequired.push("package-lock.json JSON parse failed");
    }

    const safeAutoFixPossible = false;

    const nextAction =
        manualInterventionRequired.length > 0 ? "manual" : "none";

    return {
        fixableIssues,
        manualInterventionRequired,
        safeAutoFixPossible,
        nextAction
    };
}
