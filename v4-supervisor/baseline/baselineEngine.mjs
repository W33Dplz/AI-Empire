import fs from "node:fs/promises";

export async function runBaselineEngine(currentScore) {

    if (typeof currentScore !== "number") {
        throw new Error("currentScore must be a number");
    }

    let previousScore = null;

    try {
        const content = await fs.readFile("./manifest/TRACKING-SNAPSHOT.md", "utf-8");

        const matches = content.match(/"architecturalScore":\s*(\d+)/g);

        if (matches && matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            const value = lastMatch.match(/(\d+)/);
            if (value) {
                previousScore = parseInt(value[1], 10);
            }
        }

    } catch {
        previousScore = null;
    }

    if (previousScore === null) {
        return {
            previousScore: null,
            delta: null,
            trend: "NO_BASELINE",
            aggravationDetected: false
        };
    }

    const delta = currentScore - previousScore;

    let trend = "STABLE";
    let aggravationDetected = false;

    if (delta < 0) {
        trend = "AGGRAVATION";
        if (delta <= -10) {
            aggravationDetected = true;
        }
    }

    if (delta > 0) {
        trend = "IMPROVEMENT";
    }

    return {
        previousScore,
        delta,
        trend,
        aggravationDetected
    };
}
