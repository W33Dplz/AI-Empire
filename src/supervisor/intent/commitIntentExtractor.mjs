import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runCommitIntentExtractor(repoPath) {

    if (!repoPath) {
        throw new Error("repoPath required");
    }

    const { stdout } = await execFileAsync("git", ["log", "-1", "--pretty=%B"], { cwd: repoPath });

    const message = stdout.trim().toLowerCase();

    let declaredIntentType = "UNKNOWN";
    let intentConfidence = "LOW";

    if (message.includes("fix") || message.includes("bug") || message.includes("patch")) {
        declaredIntentType = "BUG_FIX";
        intentConfidence = "HIGH";
    }
    else if (message.includes("refactor") || message.includes("cleanup")) {
        declaredIntentType = "REFACTOR";
        intentConfidence = "HIGH";
    }
    else if (message.includes("feature") || message.includes("add") || message.includes("implement")) {
        declaredIntentType = "FEATURE";
        intentConfidence = "MEDIUM";
    }
    else if (message.includes("deps") || message.includes("dependency") || message.includes("upgrade")) {
        declaredIntentType = "DEPENDENCY_UPDATE";
        intentConfidence = "HIGH";
    }

    return {
        declaredIntentType,
        intentConfidence,
        rawCommitMessage: stdout.trim()
    };
}
