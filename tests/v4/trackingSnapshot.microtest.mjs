import { generateTrackingSnapshot } from "../../v4-supervisor/report/trackingSnapshotBuilder.mjs";

(async () => {
    try {
        const snapshot = await generateTrackingSnapshot();
        console.log("SNAPSHOT_GENERATED");
        console.log(snapshot);
    } catch (e) {
        console.error("SNAPSHOT_FAIL", e.message);
        process.exit(1);
    }
})();
