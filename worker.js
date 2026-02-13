import fs from "fs";
import Brain from "./orchestrator/brain.js";

const QUEUE_FILE = "./queue.json";
const brain = new Brain();

function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return [];

  let raw = fs.readFileSync(QUEUE_FILE, "utf8");

  if (!raw.trim()) return [];

  // Remove BOM if present
  raw = raw.replace(/^\uFEFF/, "");

  let data;

  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.log("Queue corrupted. Resetting.");
    return [];
  }

  // If object instead of array, wrap it
  if (!Array.isArray(data)) {
    return [data];
  }

  return data;
}

function saveQueue(queue) {
  fs.writeFileSync(
    QUEUE_FILE,
    JSON.stringify(queue, null, 2),
    { encoding: "utf8" }
  );
}

async function processQueue() {
  let queue = loadQueue();

  const pendingJobs = queue.filter(j => j.status === "PENDING");

  for (const job of pendingJobs) {
    job.status = "RUNNING";
    saveQueue(queue);

    try {
      const result = await brain.executeMission(job.plan);

      if (result.status === "READY_FOR_DECISION") {
        await brain.approveMission(result.missionId);
      }

      job.status = "DONE";
    } catch (err) {
      job.status = "FAILED";
      job.error = err.message;
    }

    saveQueue(queue);
  }
}

console.log("AI-EMPIRE Worker started...");
setInterval(processQueue, 2000);
