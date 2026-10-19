import { runDecisionEngine } from "../../v4-supervisor/decision/decisionEngine.mjs";

const dummyScore = { decisionHint: "SAFE" };
const dummyRegression = { regressionGuardLevel: "LOW" };
const dummyIntent = { suspiciousPattern: false, scopeConsistency: "HIGH" };
const dummyBaseline = {};
const dummyDrift = {};
const dummyRegistry = { registryBlockingIssues: [], registryWarnings: [] };

const scenarios = [
    { level: "CRITICAL" },
    { level: "HIGH" },
    { level: "WARNING" },
    { level: "NONE" }
];

for (const scenario of scenarios) {

    const coverage = {
        coverageRiskLevel: scenario.level
    };

    const result = runDecisionEngine(
        dummyScore,
        dummyRegression,
        dummyIntent,
        dummyBaseline,
        dummyDrift,
        dummyRegistry,
        coverage
    );

    console.log("COVERAGE_TEST:", scenario.level);
    console.log(JSON.stringify(result, null, 2));
    console.log("------------------------------------------------");
}
