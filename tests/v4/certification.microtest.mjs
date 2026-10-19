import { runCertificationEngine } from "../../v4-supervisor/certification/certificationEngine.mjs";

const scenarios = [
    {
        name: "blocked_case",
        decision: { overallStatus: "BLOCKED" },
        drift: { driftSeverity: "NONE" },
        coverage: { coverageRiskLevel: "NONE" },
        verification: { featureVerified: true },
        registry: {}
    },
    {
        name: "review_case",
        decision: { overallStatus: "REVIEW" },
        drift: { driftSeverity: "MEDIUM" },
        coverage: { coverageRiskLevel: "WARNING" },
        verification: { featureVerified: true },
        registry: {}
    },
    {
        name: "certified_case",
        decision: { overallStatus: "READY" },
        drift: { driftSeverity: "NONE" },
        coverage: { coverageRiskLevel: "NONE" },
        verification: { featureVerified: true },
        registry: { registryConfidenceImpact: "NONE" }
    }
];

for (const s of scenarios) {
    const result = runCertificationEngine(
        s.decision,
        s.drift,
        s.coverage,
        s.verification,
        s.registry
    );

    console.log("CERTIFICATION_TEST:", s.name);
    console.log(JSON.stringify(result, null, 2));
    console.log("-----------------------------------");
}
