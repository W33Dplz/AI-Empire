import fs from "fs";
import path from "path";

const LOGS_DIR = path.resolve("./logs");

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export function log(message) {
  const entry = `[${new Date().toISOString()}] ${message}\n`;

  console.log(entry);

  fs.appendFileSync(
    path.join(LOGS_DIR, "empire.log"),
    entry
  );
}
