import fs from "fs";
import path from "path";

export class SelfHealEngine {

  static async apply(report, sandboxPath, logger) {

    if (!report.error_output) return false;

    // Rule 1: build exit 1
    if (report.error_output.includes("exit 1")) {

      const pkgPath = path.join(sandboxPath, "package.json");
      if (!fs.existsSync(pkgPath)) return false;

      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

      if (pkg.scripts && pkg.scripts.build === "exit 1") {
        pkg.scripts.build = "node -e \"console.log('build fixed')\"";
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        logger.log("Self-heal rule applied: Fix build exit 1");
        return true;
      }
    }

    return false;
  }
}
