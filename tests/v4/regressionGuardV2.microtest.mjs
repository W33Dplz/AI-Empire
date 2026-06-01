import { runRegressionGuardV2 } from "../../v4-supervisor/regression/regressionGuardV2.mjs";

const dummyImpact = {
    scope: "GLOBAL",
    impactType: "STRUCTURAL"
};

const dummyScoreLow = { architecturalScore: 20 };
const dummyScoreMedium = { architecturalScore: 50 };

const scenarios = [
    {
        name: "dependency-only",
        diff: { modified: ["package.json"], added: [] },
        score: dummyScoreMedium
    },
    {
        name: "structural-only",
        diff: { modified: ["service.js"], added: [] },
        score: dummyScoreMedium
    },
    {
        name: "config-only",
        diff: { modified: ["config.js"], added: [] },
        score: dummyScoreMedium
    },
    {
        name: "mixed",
        diff: { modified: ["package.json", "service.js"], added: [] },
        score: dummyScoreMedium
    },
    {
        name: "critical-combination",
        diff: { modified: ["package.json", "service.js"], added: [] },
        score: dummyScoreLow
    }
];

for (const scenario of scenarios) {

    const result = runRegressionGuardV2(
        dummyImpact,
        scenario.diff,
        {},
        {},
        scenario.score
    );

    console.log("REGRESSION_TEST:", scenario.name);
    console.log(JSON.stringify(result, null, 2));
    console.log("------------------------------------------------");
}
