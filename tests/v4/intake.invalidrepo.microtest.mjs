import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";

(async () => {
    try {
        await runIntake("C:\\InvalidPath\\FakeRepo");
        console.error("INVALID_REPO_TEST_FAIL");
        process.exit(1);
    } catch (e) {
        console.log("INVALID_REPO_TEST_PASS");
    }
})();
