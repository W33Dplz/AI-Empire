import { runIntake } from "../../v4-supervisor/intake/intakeEngine.mjs";
import { buildImpactGraphV2 } from "../../v4-supervisor/trace/impactGraphV2.mjs";
import { runCommitIntentExtractor } from "../../v4-supervisor/intent/commitIntentExtractor.mjs";
import { runFeatureClaimRegistry } from "../../v4-supervisor/registry/featureClaimRegistry.mjs";

(async () => {

    const repo = "C:\\Users\\charl\\LOVABLE";

    const intake = await runIntake(repo);
    const impact = buildImpactGraphV2(intake.diffSummary);
    const commitIntent = await runCommitIntentExtractor(repo);

    const result = await runFeatureClaimRegistry(repo, impact, commitIntent);

    console.log("FEATURE_REGISTRY_RESULT");
    console.log(JSON.stringify(result, null, 2));

})();
