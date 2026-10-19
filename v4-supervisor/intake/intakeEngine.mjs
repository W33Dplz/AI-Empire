import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { validateIntakeReport } from "./intakeTypes.mjs";
import { buildImpactGraph } from "./impactGraphBuilder.mjs";

const execFileAsync = promisify(execFile);

export async function runIntake(repoPath) {

    if (!repoPath || typeof repoPath !== "string") {
        throw new Error("Explicit external repoPath required");
    }

    const aiEmpireRoot = path.resolve(".");
    const targetPath = path.resolve(repoPath);

    if (targetPath === aiEmpireRoot) {
        throw new Error("Self-analysis forbidden");
    }

    const gitPath = path.join(targetPath, ".git");

    try {
        await fs.access(gitPath);
    } catch {
        throw new Error("Target is not a valid local git repository");
    }

    const defaultBranch = await detectDefaultBranch(targetPath);

    const lovableBranchExists = await branchExists(targetPath, "lovable-dev");
    if (!lovableBranchExists) {
        throw new Error("lovable-dev branch not found");
    }

    const diff = await getDiff(targetPath, defaultBranch);

    if (
        diff.added.length === 0 &&
        diff.modified.length === 0 &&
        diff.deleted.length === 0
    ) {
        return {
            earlyExit: true,
            reason: "No changes detected"
        };
    }

    const mainCommit = await getCommit(targetPath, defaultBranch);
    const lovableCommit = await getCommit(targetPath, "lovable-dev");

    const impact = buildImpactGraph(diff);

    const report = {
        projectName: path.basename(targetPath),
        baselineMode: false,
        branches: {
            main: mainCommit,
            lovableDev: lovableCommit
        },
        diffSummary: diff,
        impactSummary: impact,
        riskLevel: "LEVEL_1",
        requiresFullAudit: true,
        timestamp: new Date().toISOString()
    };

    validateIntakeReport(report);

    return report;
}

async function detectDefaultBranch(repoPath) {
    try {
        const { stdout } = await execFileAsync("git", ["symbolic-ref", "refs/remotes/origin/HEAD"], { cwd: repoPath });
        const parts = stdout.trim().split("/");
        return parts[parts.length - 1];
    } catch {
        const { stdout } = await execFileAsync("git", ["branch", "--show-current"], { cwd: repoPath });
        return stdout.trim();
    }
}

async function branchExists(repoPath, branch) {
    try {
        await execFileAsync("git", ["rev-parse", "--verify", branch], { cwd: repoPath });
        return true;
    } catch {
        return false;
    }
}

async function getCommit(repoPath, branch) {
    const { stdout } = await execFileAsync("git", ["rev-parse", branch], { cwd: repoPath });
    return stdout.trim();
}

async function getDiff(repoPath, baseBranch) {
    const range = baseBranch + "..lovable-dev";
    const { stdout } = await execFileAsync("git", ["diff", "--name-status", range], { cwd: repoPath });

    const added = [];
    const modified = [];
    const deleted = [];

    const lines = stdout.split("\n");

    for (const line of lines) {
        if (!line) continue;

        const parts = line.split("\t");
        const status = parts[0];
        const file = parts[1];

        if (status === "A") added.push(file);
        if (status === "M") modified.push(file);
        if (status === "D") deleted.push(file);
    }

    return { added, modified, deleted };
}
