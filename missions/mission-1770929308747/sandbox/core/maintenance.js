import fs from "fs";
import path from "path";

export class Maintenance {
  constructor({ rootPath, logger }) {
    this.rootPath = rootPath;
    this.logger = logger;
  }

  cleanTestArtifacts() {
    const missionsPath = path.join(this.rootPath, "missions");

    if (!fs.existsSync(missionsPath)) return;

    const items = fs.readdirSync(missionsPath);

    items.forEach(item => {
      if (item.startsWith("mission-test-")) {
        const fullPath = path.join(missionsPath, item);
        fs.rmSync(fullPath, { recursive: true, force: true });
        this.logger.log(`Removed test sandbox: ${item}`);
      }
    });

    const microTestPath = path.join(this.rootPath, "microTest.js");

    if (fs.existsSync(microTestPath)) {
      fs.rmSync(microTestPath, { force: true });
      this.logger.log("Removed microTest.js");
    }
  }
}
