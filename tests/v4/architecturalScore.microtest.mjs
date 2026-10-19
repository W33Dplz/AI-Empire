import { runSupervisor } from "../../v4-supervisor/supervisor.mjs";
import { runRegressionGuardV2 } from "../../v4-supervisor/regression/regressionGuardV2.mjs";
import { runArchitecturalScoreEngine } from "../../v4-supervisor/scoring/architecturalScoreEngine.mjs";

(async () => {
    try {

        const repo = "C:\\Users\\charl\\LOVABLE";

        const supervisorResult = await runSupervisor(repo);

        const regression = runRegressionGuardV2(
            supervisorResult.architecturalImpact,
            supervisorResult.intake.diffSummary,
            supervisorResult.audit,
            supervisorResult.test
        );

        const score = runArchitecturalScoreEngine(
            supervisorResult.architecturalImpact,
            regression,
            supervisorResult.audit,
            supervisorResult.test
        );

        console.log("ARCHITECTURAL_SCORE_RESULT");
        console.log(JSON.stringify(score, null, 2));

    } catch (e) {
        console.error("ARCHITECTURAL_SCORE_FAIL", e.message);
        process.exit(1);
    }
})();
