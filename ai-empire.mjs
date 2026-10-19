import { runSupervisor } from "./v4-supervisor/supervisor.mjs";
import path from "node:path";
import process from "node:process";

async function main() {

    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error("Usage: node ai-empire.mjs <repoPath> [--json] [--verbose]");
        process.exit(1);
    }

    const repoPath = path.resolve(args[0]);
    const jsonMode = args.includes("--json");
    const verboseMode = args.includes("--verbose");

    const result = await runSupervisor(repoPath);

    if (verboseMode) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }

    const summary = {
        project: result.intake.projectName,
        certificationStatus: result.certification.certificationStatus,
        certificationConfidence: result.certification.certificationConfidence,
        decisionStatus: result.decision.overallStatus,
        driftSeverity: result.scopeDrift.driftSeverity,
        regressionGuardLevel: result.regressionGuard.regressionGuardLevel
    };

    if (jsonMode) {
        console.log(JSON.stringify(summary, null, 2));
        return;
    }

    console.log("AI-EMPIRE V4.0");
    console.log("Repository:", summary.project);
    console.log("");
    console.log("Certification:", summary.certificationStatus);
    console.log("Confidence:", summary.certificationConfidence);
}

main();
