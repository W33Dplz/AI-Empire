import { runFeatureClaimRegistry } from "../../v4-supervisor/registry/featureClaimRegistry.mjs";
import fs from "node:fs/promises";
import path from "node:path";

(async () => {

    const registryPath = path.join(process.cwd(), "v4-supervisor/registry/feature-claims.json");

    const scenarios = [
        {
            name: "LOW_declared_vs_HIGH_actual",
            feature: {
                featureId: "FT-LOW-HIGH",
                declaredIntent: "FEATURE",
                declaredScope: "GLOBAL",
                expectedImpactLevel: "LOW",
                declaredBy: "test",
                timestamp: new Date().toISOString()
            },
            impact: {
                architecturalRiskLevel: "HIGH",
                impactType: "STRUCTURAL",
                scope: "GLOBAL"
            }
        },
        {
            name: "LOCAL_declared_vs_GLOBAL_actual",
            feature: {
                featureId: "FT-LOCAL-GLOBAL",
                declaredIntent: "FEATURE",
                declaredScope: "LOCAL",
                expectedImpactLevel: "STRUCTURAL",
                declaredBy: "test",
                timestamp: new Date().toISOString()
            },
            impact: {
                architecturalRiskLevel: "HIGH",
                impactType: "STRUCTURAL",
                scope: "GLOBAL"
            }
        },
        {
            name: "GLOBAL_declared_vs_LOCAL_actual",
            feature: {
                featureId: "FT-GLOBAL-LOCAL",
                declaredIntent: "FEATURE",
                declaredScope: "GLOBAL",
                expectedImpactLevel: "STRUCTURAL",
                declaredBy: "test",
                timestamp: new Date().toISOString()
            },
            impact: {
                architecturalRiskLevel: "LOW",
                impactType: "LOCAL",
                scope: "LOCAL"
            }
        }
    ];

    for (const scenario of scenarios) {

        await fs.writeFile(registryPath, JSON.stringify([scenario.feature], null, 2));

        const result = await runFeatureClaimRegistry(
            process.cwd(),
            {},
            scenario.impact
        );

        console.log("STRICT_REGISTRY_TEST:", scenario.name);
        console.log(JSON.stringify(result, null, 2));
        console.log("--------------------------------------------------");
    }

})();
