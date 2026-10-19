import { runSupervisor } from "../../v4-supervisor/supervisor.mjs";
import { runRegressionGuardV2 } from "../../v4-supervisor/regression/regressionGuardV2.mjs";

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

        console.log("REGRESSION_V2_RESULT");
        console.log(JSON.stringify(regression, null, 2));

    } catch (e) {
        console.error("REGRESSION_V2_FAIL", e.message);
        process.exit(1);
    }
})();
