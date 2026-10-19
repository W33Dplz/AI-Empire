import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";
import { runAudit } from "../../v4-supervisor/audit/auditEngine.mjs";

(async () => {
    try {
        const intake = await runIntake("C:\\Users\\charl\\LOVABLE");

        if (intake.earlyExit) {
            console.log("AUDIT_SKIPPED_NO_DIFF");
            return;
        }

        const audit = await runAudit("C:\\Users\\charl\\LOVABLE", intake.diffSummary);

        console.log("AUDIT_RESULT");
        console.log(JSON.stringify(audit, null, 2));
    } catch (e) {
        console.error("AUDIT_FAIL", e.message);
        process.exit(1);
    }
})();
