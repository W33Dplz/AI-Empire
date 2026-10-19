import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";
import { runAudit } from "../../v4-supervisor/audit/auditEngine.mjs";
import { runTests } from "../../v4-supervisor/test/testEngine.mjs";

(async () => {
    try {
        const intake = await runIntake("C:\\Users\\charl\\LOVABLE");

        if (intake.earlyExit) {
            console.log("TEST_SKIPPED_NO_DIFF");
            return;
        }

        const audit = await runAudit("C:\\Users\\charl\\LOVABLE", intake.diffSummary);

        if (!audit.auditPassed) {
            console.log("TEST_ABORTED_AUDIT_FAIL");
            return;
        }

        const test = await runTests("C:\\Users\\charl\\LOVABLE", intake.diffSummary);

        console.log("TEST_RESULT");
        console.log(JSON.stringify(test, null, 2));

    } catch (e) {
        console.error("TEST_FAIL", e.message);
        process.exit(1);
    }
})();
