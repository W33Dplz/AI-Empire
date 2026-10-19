import { SPEC_MODE, getSpecMode } from "../../v4-supervisor/spec/specMode.mjs";

console.log("SPEC MODE TEST");
console.log("Direct:", SPEC_MODE);
console.log("Getter:", getSpecMode());

if (SPEC_MODE !== "TRANSITIONAL") {
    throw new Error("Spec mode mismatch");
}
