import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";
import { buildImpactGraphV2 } from "../../v4-supervisor/trace/impactGraphV2.mjs";

(async () => {

    const repo = "C:\\Users\\charl\\LOVABLE";
    const intake = await runIntake(repo);

    if (intake.earlyExit) {
        console.log("NO_DIFF");
        return;
    }

    const result = buildImpactGraphV2(intake.diffSummary);

    console.log("IMPACT_V2_RESULT");
    console.log(JSON.stringify(result, null, 2));

})();
