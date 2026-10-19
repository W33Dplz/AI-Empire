import { runSupervisor } from "../../v4-supervisor/supervisor.mjs";
import { runBaselineEngine } from "../../v4-supervisor/baseline/baselineEngine.mjs";

(async () => {
    try {

        const repo = "C:\\Users\\charl\\LOVABLE";

        const supervisorResult = await runSupervisor(repo);

        const currentScore = supervisorResult.architecturalScore.architecturalScore;

        const baseline = await runBaselineEngine(currentScore);

        console.log("BASELINE_RESULT");
        console.log(JSON.stringify(baseline, null, 2));

    } catch (e) {
        console.error("BASELINE_FAIL", e.message);
        process.exit(1);
    }
})();
