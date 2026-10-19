import { runIntake } from "./intake/intakeEngine.mjs";
import { runFeatureTrace } from "./trace/featureTraceEngine.mjs";
import { buildImpactGraphV2 } from "./trace/impactGraphV2.mjs";
import { runAudit } from "./audit/auditEngine.mjs";
import { runTests } from "./test/testEngine.mjs";
import { runRegressionGuardV2 } from "./regression/regressionGuardV2.mjs";
import { runFeatureClaimRegistry } from "./registry/featureClaimRegistry.mjs";
import { runArchitecturalScoreEngine } from "./scoring/architecturalScoreEngine.mjs";
import { runBaselineEngine } from "./baseline/baselineEngine.mjs";
import { runCommitIntentExtractor } from "./intent/commitIntentExtractor.mjs";
import { runIntentClassifier } from "./intent/intentClassifier.mjs";
import { runScopeDriftDetector } from "./intent/scopeDriftDetector.mjs";
import { runValidationCoverageEngine } from "./validation/validationCoverageEngine.mjs";
import { runDecisionEngine } from "./decision/decisionEngine.mjs";
import { runFeatureValidationReportEngine } from "./reporting/featureValidationReportEngine.mjs";

export async function runSupervisor(repoPath) {

    // 1. Intake
    const intake = await runIntake(repoPath);

    // 2. Trace
    const trace = runFeatureTrace(intake.diffSummary);

    // 3. Impact
    const architecturalImpact = buildImpactGraphV2(trace);

    // 4. Audit
    const audit = await runAudit(repoPath, intake.diffSummary);

    // 5. Test
    const test = await runTests(repoPath, intake.diffSummary);

    // 6. Regression Guard
    const regressionGuard = runRegressionGuardV2(
        intake,
        architecturalImpact
    );

    // 7. Feature Registry (repoPath + architecturalImpact requis)
    const featureRegistry = await runFeatureClaimRegistry(
        repoPath,
        intake.diffSummary,
        architecturalImpact
    );

    // 8. Architectural Score
    const architecturalScore = runArchitecturalScoreEngine(
        architecturalImpact,
        regressionGuard,
        audit,
        test,
        featureRegistry
    );

    // 9. Baseline (number only)
    const baseline = await runBaselineEngine(
        architecturalScore.architecturalScore
    );

    // 10. Commit Intent (repoPath only)
    const commitIntent = await runCommitIntentExtractor(repoPath);

    // 11. Intent Classifier (3 params obligatoires)
    const intent = runIntentClassifier(
        intake.diffSummary,
        architecturalImpact,
        regressionGuard
    );

    // 12. Scope Drift
    const scopeDrift = runScopeDriftDetector(
        commitIntent,
        architecturalImpact,
        regressionGuard
    );

    // 13. Validation Coverage
    const validationCoverage = await runValidationCoverageEngine(
        repoPath,
        intake.diffSummary,
        featureRegistry
    );

    // 14. Decision
    const decision = runDecisionEngine(
        architecturalScore,
        regressionGuard,
        intent,
        baseline,
        scopeDrift,
        featureRegistry,
        validationCoverage
    );

    // 15. Feature Validation Report
    const featureValidationReport = await runFeatureValidationReportEngine(
        repoPath
    );

    return {
        intake,
        trace,
        architecturalImpact,
        regressionGuard,
        architecturalScore,
        baseline,
        commitIntent,
        intent,
        scopeDrift,
        featureRegistry,
        validationCoverage,
        audit,
        test,
        decision,
        featureValidationReport
    };
}
