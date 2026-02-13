import fs from "fs";
import path from "path";

const logDir = path.resolve("./logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export function log(message) {
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  console.log(entry);
  fs.appendFileSync(path.join(logDir, "empire.log"), entry);
}
