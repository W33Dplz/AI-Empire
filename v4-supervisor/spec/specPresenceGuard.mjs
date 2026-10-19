import { validateSpecDirectory } from "./specDirectoryValidator.mjs";

export function runSpecPresenceGuard(repoPath) {

    const result = validateSpecDirectory(repoPath);

    if (!result.exists) {
        return {
            status: "NEUTRAL",
            specCount: 0
        };
    }

    return {
        status: "VALID",
        specCount: result.specs.length
    };
}
