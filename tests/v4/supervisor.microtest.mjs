import { runSupervisor } from "../../v4-supervisor/supervisor.mjs";

(async () => {
    try {

        const repo = "C:\\Users\\charl\\LOVABLE";

        const result = await runSupervisor(repo);

        console.log("SUPERVISOR_RESULT");
        console.log(JSON.stringify(result, null, 2));

    } catch (e) {
        console.error("SUPERVISOR_FAIL", e.message);
        process.exit(1);
    }
})();
