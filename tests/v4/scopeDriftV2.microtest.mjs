import { runScopeDriftDetector } from "../../v4-supervisor/intent/scopeDriftDetector.mjs";

const scenarios = [
    {
        name: "unknown_structural",
        intent: { declaredIntentType: "UNKNOWN", declaredScope: "GLOBAL" },
        impact: { impactType: "STRUCTURAL", scope: "GLOBAL" }
    },
    {
        name: "bugfix_global_structural",
        intent: { declaredIntentType: "BUG_FIX", declaredScope: "LOCAL" },
        impact: { impactType: "STRUCTURAL", scope: "GLOBAL" }
    },
    {
        name: "aligned_feature",
        intent: { declaredIntentType: "FEATURE", declaredScope: "GLOBAL" },
        impact: { impactType: "STRUCTURAL", scope: "GLOBAL" }
    }
];

for (const s of scenarios) {
    const result = runScopeDriftDetector(s.intent, s.impact, {});
    console.log("DRIFT_TEST:", s.name);
    console.log(JSON.stringify(result, null, 2));
    console.log("-----------------------------------");
}
