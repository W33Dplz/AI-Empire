import { runCommitIntentExtractor } from "../../v4-supervisor/intent/commitIntentExtractor.mjs";

(async () => {

    const repo = "C:\\Users\\charl\\LOVABLE";

    const result = await runCommitIntentExtractor(repo);

    console.log("COMMIT_INTENT_RESULT");
    console.log(JSON.stringify(result, null, 2));

})();
