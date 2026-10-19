import { runDecisionEngine } from "../../v4-supervisor/decision/decisionEngine.mjs";
import { runSupervisor } from "../../v4-supervisor/supervisor.mjs";

(async () => {

    const repo = "C:\\Users\\charl\\LOVABLE";
    const supervisorResult = await runSupervisor(repo);

    const decision = runDecisionEngine(
        supervisorResult.architecturalScore,
        supervisorResult.regressionGuard,
        supervisorResult.intent || { suspiciousPattern:false, intentConfidence:"HIGH", scopeConsistency:"HIGH", changeIntentType:"UNKNOWN" },
        supervisorResult.baseline
    );

    console.log("DECISION_RESULT");
    console.log(JSON.stringify(decision, null, 2));

})();
