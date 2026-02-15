import { runIntake } from "./intake/intakeEngine.mjs";
import { runFeatureTrace } from "./trace/featureTraceEngine.mjs";
import { buildImpactGraphV2 } from "./trace/impactGraphV2.mjs";
import { runAudit } from "./audit/auditEngine.mjs";
import { runTests } from "./test/testEngine.mjs";
import { runFixEngine } from "./fix/fixEngine.mjs";
import { runRegressionGuardV2 } from "./regression/regressionGuardV2.mjs";
import { runArchitecturalScoreEngine } from "./scoring/architecturalScoreEngine.mjs";

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

    const audit = await runAudit(repoPath, intake.diffSummary);

    let test = {
        packageJsonValid: true,
        packageLockValid: true,
        testPassed: true
    };

    const diffEmpty =
        intake.diffSummary &&
        intake.diffSummary.added.length === 0 &&
        intake.diffSummary.modified.length === 0 &&
        intake.diffSummary.deleted.length === 0;

    if (!diffEmpty) {
        test = await runTests(repoPath, intake.diffSummary);
    }

    const fix = runFixEngine(audit, test);

    const regressionGuard = runRegressionGuardV2(
        architecturalImpact,
        intake.diffSummary,
        audit,
        test
    );

    const architecturalScore = runArchitecturalScoreEngine(
        architecturalImpact,
        regressionGuard,
        audit,
        test
    );

    let overallStatus = "READY";
    let requiresHumanReview = false;

    if (architecturalScore.decisionHint === "DANGEROUS") {
        overallStatus = "BLOCKED";
        requiresHumanReview = true;
    } else if (architecturalScore.decisionHint === "REVIEW_REQUIRED") {
        overallStatus = "REVIEW";
        requiresHumanReview = true;
    }

    return {
        intake,
        trace,
        architecturalImpact,
        regressionGuard,
        architecturalScore,
        audit,
        test,
        fix,
        overallStatus,
        requiresHumanReview
    };
}
