import { runValidationCoverageEngine } from "../../v4-supervisor/validation/validationCoverageEngine.mjs";
import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";
import { runFeatureClaimRegistry } from "../../v4-supervisor/registry/featureClaimRegistry.mjs";

(async () => {

    const repo = "C:\\Users\\charl\\LOVABLE";
    const intake = await runIntake(repo);
    const registry = await runFeatureClaimRegistry(repo, intake.diffSummary, { architecturalRiskLevel: "HIGH" });

    const coverage = await runValidationCoverageEngine(repo, intake.diffSummary, registry);

    console.log("VALIDATION_COVERAGE_RESULT");
    console.log(JSON.stringify(coverage, null, 2));

})();
