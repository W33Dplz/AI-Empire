import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function generateTrackingSnapshot() {

    const timestamp = new Date().toISOString();

    const modules = await getModuleStatus();
    const commit = await getCurrentCommit();
    const legacyPresent = await checkLegacy();

    const phaseStatus = getPhaseStatus(modules);

    const snapshot = buildSnapshot(timestamp, modules, commit, legacyPresent, phaseStatus);

    await fs.appendFile("./manifest/TRACKING-SNAPSHOT.md", snapshot, "utf-8");

    return snapshot;
}

async function getModuleStatus() {

    const basePath = path.resolve("./v4-supervisor");
    const entries = await fs.readdir(basePath, { withFileTypes: true });

    const result = {};

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const modulePath = path.join(basePath, entry.name);
        const files = await fs.readdir(modulePath);

        const hasMjs = files.some(f => f.endsWith(".mjs"));

        result[entry.name] = hasMjs ? "ACTIVE" : "NOT STARTED";
    }

    return result;
}

function getPhaseStatus(modules) {

    return {
        intake: modules.intake === "ACTIVE" ? "COMPLETE" : "NOT STARTED",
        audit: modules.audit === "ACTIVE" ? "COMPLETE" : "NOT STARTED",
        test: modules.test === "ACTIVE" ? "COMPLETE" : "NOT STARTED",
        fix: modules.fix === "ACTIVE" ? "COMPLETE" : "NOT STARTED"
    };
}

async function getCurrentCommit() {
    try {
        const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"]);
        return stdout.trim();
    } catch {
        return "UNKNOWN";
    }
}

async function checkLegacy() {
    try {
        await fs.access("./legacy_v3");
        return "YES";
    } catch {
        return "NO";
    }
}

function buildSnapshot(timestamp, modules, commit, legacyPresent, phaseStatus) {

    const getStatus = name => modules[name] || "NOT STARTED";

    return (
"------------------------------------------------------------\n" +
"TRACKING SNAPSHOT — V4 — " + timestamp + "\n" +
"------------------------------------------------------------\n\n" +
"Architecture:\n" +
"- intake: " + getStatus("intake") + "\n" +
"- audit: " + getStatus("audit") + "\n" +
"- test: " + getStatus("test") + "\n" +
"- fix: " + getStatus("fix") + "\n" +
"- certify: " + getStatus("certify") + "\n" +
"- optimize: " + getStatus("optimize") + "\n" +
"- report: " + getStatus("report") + "\n\n" +
"Legacy:\n" +
"- legacy_v3 present: " + legacyPresent + "\n\n" +
"Current Commit:\n" +
"- hash: " + commit + "\n\n" +
"Phase Status:\n" +
"- Phase 1 (Intake): " + phaseStatus.intake + "\n" +
"- Phase 2 (Audit): " + phaseStatus.audit + "\n" +
"- Phase 3 (Test): " + phaseStatus.test + "\n" +
"- Phase 4 (Fix): " + phaseStatus.fix + "\n\n" +
"Next Logical Step:\n" +
"- Implement missing modules\n\n"
    );
}
