import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";
import { buildImpactGraphV2 } from "../../v4-supervisor/trace/impactGraphV2.mjs";
import { runRegressionGuardV2 } from "../../v4-supervisor/regression/regressionGuardV2.mjs";
import { runCommitIntentExtractor } from "../../v4-supervisor/intent/commitIntentExtractor.mjs";
import { runScopeDriftDetector } from "../../v4-supervisor/intent/scopeDriftDetector.mjs";
import { runAudit } from "../../v4-supervisor/audit/auditEngine.mjs";
import { runTests } from "../../v4-supervisor/test/testEngine.mjs";

(async () => {

    const repo = "C:\\Users\\charl\\LOVABLE";

    const intake = await runIntake(repo);
    const impact = buildImpactGraphV2(intake.diffSummary);
    const audit = await runAudit(repo, intake.diffSummary);
    const test = await runTests(repo, intake.diffSummary);
    const regression = runRegressionGuardV2(impact, intake.diffSummary, audit, test);
    const commitIntent = await runCommitIntentExtractor(repo);

    const drift = runScopeDriftDetector(commitIntent, impact, regression);

    console.log("SCOPE_DRIFT_RESULT");
    console.log(JSON.stringify(drift, null, 2));

})();
