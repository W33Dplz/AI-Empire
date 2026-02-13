import fs from "fs";
import path from "path";

export function loadProjectContext() {
  const packagePath = path.resolve("./package.json");

  if (!fs.existsSync(packagePath)) {
    throw new Error("package.json missing");
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

  return {
    dependencies: pkg.dependencies || {},
    scripts: pkg.scripts || {}
  };
}
