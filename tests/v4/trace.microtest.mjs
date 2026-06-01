import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";
import { runFeatureTrace } from "../../v4-supervisor/trace/featureTraceEngine.mjs";

(async () => {
    try {

        const repo = "C:\\Users\\charl\\LOVABLE";
        const intake = await runIntake(repo);

        if (intake.earlyExit) {
            console.log("TRACE_SKIPPED_NO_DIFF");
            return;
        }

        const trace = runFeatureTrace(intake.diffSummary);

        console.log("TRACE_RESULT");
        console.log(JSON.stringify(trace, null, 2));

    } catch (e) {
        console.error("TRACE_FAIL", e.message);
        process.exit(1);
    }
})();
