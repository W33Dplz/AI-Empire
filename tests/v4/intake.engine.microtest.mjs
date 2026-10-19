import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";

(async () => {
    try {
        const report = await runIntake("C:\\Users\\charl\\LOVABLE");
        console.log("INTAKE_OK");
        console.log(JSON.stringify(report, null, 2));
    } catch (e) {
        console.error("INTAKE_FAIL", e.message);
        process.exit(1);
    }
})();
