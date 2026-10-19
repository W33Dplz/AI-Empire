import { runFeatureVerificationEngine } from "../../v4-supervisor/verification/featureVerificationEngine.mjs";

const scenarios = [
    {
        name: "aligned_global",
        registry: { featureDeclared: true, declaredScope: "GLOBAL" },
        impact: { scope: "GLOBAL" },
        diff: { modified: ["service.js"] }
    },
    {
        name: "partial_global_local",
        registry: { featureDeclared: true, declaredScope: "GLOBAL" },
        impact: { scope: "LOCAL" },
        diff: { modified: ["service.js"] }
    },
    {
        name: "mismatch_local_global",
        registry: { featureDeclared: true, declaredScope: "LOCAL" },
        impact: { scope: "GLOBAL" },
        diff: { modified: ["service.js"] }
    },
    {
        name: "no_feature",
        registry: { featureDeclared: false },
        impact: { scope: "GLOBAL" },
        diff: { modified: ["service.js"] }
    }
];

for (const s of scenarios) {

    const result = runFeatureVerificationEngine(
        s.registry,
        s.impact,
        s.diff
    );

    console.log("VERIFICATION_TEST:", s.name);
    console.log(JSON.stringify(result, null, 2));
    console.log("------------------------------------------------");
}
