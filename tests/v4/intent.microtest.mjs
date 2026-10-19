import { runIntentClassifier } from "../../v4-supervisor/intent/intentClassifier.mjs";
import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";
import { buildImpactGraphV2 } from "../../v4-supervisor/trace/impactGraphV2.mjs";
import { runRegressionGuardV2 } from "../../v4-supervisor/regression/regressionGuardV2.mjs";
import { runAudit } from "../../v4-supervisor/audit/auditEngine.mjs";
import { runTests } from "../../v4-supervisor/test/testEngine.mjs";

(async () => {

    const repo = "C:\\Users\\charl\\LOVABLE";
    const intake = await runIntake(repo);
    const impact = buildImpactGraphV2(intake.diffSummary);
    const audit = await runAudit(repo, intake.diffSummary);
    const test = await runTests(repo, intake.diffSummary);
    const regression = runRegressionGuardV2(impact, intake.diffSummary, audit, test);

    const intent = runIntentClassifier(intake.diffSummary, impact, regression);

    console.log("INTENT_RESULT");
    console.log(JSON.stringify(intent, null, 2));

})();
