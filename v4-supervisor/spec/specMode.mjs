/*
 SPEC_MODE — Phase 2 Design Flag

 TRANSITIONAL:
 - Absence of /ai-specs tolerated
 - Invalid structure throws error
 - No enforcement on feature mapping

 STRICT:
 - /ai-specs required
 - Feature mapping required
 - Enforcement enabled

 Current Phase: TRANSITIONAL
*/

export const SPEC_MODE = "TRANSITIONAL";

export function getSpecMode() {
    return SPEC_MODE;
}
