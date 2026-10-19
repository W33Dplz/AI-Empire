import { validateFeatureSpecV1 } from "../../v4-supervisor/spec/featureSpecValidator.mjs";

const validSpec = {
    specVersion: "1.0",
    featureId: "auth-roles",
    title: "User Role Management",
    description: "Adds roles and permission system",
    author: "Diego",
    createdAt: new Date().toISOString(),
    scope: {
        type: "LOCAL",
        modules: ["auth"]
    },
    behavior: {
        inputs: [],
        outputs: [],
        sideEffects: []
    },
    acceptanceCriteria: [
        "Users can have roles",
        "Permissions are enforced"
    ],
    nonRegressionZones: [
        "login-flow"
    ],
    constraints: {
        noDependencyChange: true,
        noGlobalStateMutation: true,
        performanceBudgetMs: 200
    }
};

console.log("VALID SPEC TEST");
console.log(validateFeatureSpecV1(validSpec));

try {
    validateFeatureSpecV1({});
} catch (e) {
    console.log("INVALID SPEC TEST PASSED");
}
