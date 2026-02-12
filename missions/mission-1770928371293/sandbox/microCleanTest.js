import { Maintenance } from "./core/maintenance.js";

const cleaner = new Maintenance({
  rootPath: process.cwd(),
  logger: console
});

cleaner.cleanTestArtifacts();

console.log("Cleanup complete");
