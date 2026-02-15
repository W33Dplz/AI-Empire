import { runIntake } from "./intake/intakeEngine.mjs";
import { runFeatureTrace } from "./trace/featureTraceEngine.mjs";
import { buildImpactGraphV2 } from "./trace/impactGraphV2.mjs";
import { runAudit } from "./audit/auditEngine.mjs";
import { runTest } from "./test/testEngine.mjs";
import { runFixEngine } from "./fix/fixEngine.mjs";

export async function runSupervisor(repoPath) {

    const intake = await runIntake(repoPath);

    if (intake.earlyExit) {
        return {
            intake,
            overallStatus: "NO_CHANGE",
            requiresHumanReview: false
        };
    }

    const trace = runFeatureTrace(intake.diffSummary);
    const architecturalImpact = buildImpactGraphV2(intake.diffSummary);

    const audit = await runAudit(repoPath);
    const test = await runTest(repoPath);
    const fix = runFixEngine(audit, test);

    const requiresHumanReview =
        architecturalImpact.architecturalRiskLevel === "HIGH";

    const overallStatus =
        audit.auditPassed && test.testPassed
            ? "READY"
            : "BLOCKED";

    return {
        intake,
        trace,
        architecturalImpact,
        audit,
        test,
        fix,
        overallStatus,
        requiresHumanReview
    };
}
