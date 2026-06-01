import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Command } from "commander";
import { superviseCommand } from "./commands/supervise.js";
import { doctor } from "./commands/doctor.js";
import { version as versionCommand } from "./commands/version.js";

function readPkgVersion() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pkgPath = path.resolve(__dirname, "../../package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  return pkg.version;
}

export function buildProgram() {
  const program = new Command();
  const pkgVersion = readPkgVersion();

  program
    .name("ai-empire")
    .description("AI-Empire code supervision CLI")
    .version(pkgVersion, "-v, --version", "output the current version");

  program
    .command("supervise")
    .description("Run the supervisor on a repository branch")
    .option("--repo <path>", "path to the repository")
    .option("--branch <name>", "target branch")
    .option("--baseline <name>", "baseline branch (default: main)")
    .option("--report-path <path>", "where to write the report markdown")
    .option("--missions-root <path>", "missions root directory")
    .option("--adapter <name>", "adapter to use")
    .option("--model <name>", "LLM model")
    .option("--max-fix-attempts <n>", "maximum fix attempts")
    .option("--keep-sandbox", "keep sandbox after run")
    .option("--dry-run", "run without requiring OPENAI key")
    .option("--log-level <level>", "log level")
    .option("--log-format <format>", "log format (pretty|json)")
    .action(async (opts) => {
      const flags = {
        repo: opts.repo,
        branch: opts.branch,
        baseline: opts.baseline,
        reportPath: opts.reportPath,
        missionsRoot: opts.missionsRoot,
        adapter: opts.adapter,
        model: opts.model,
        maxFixAttempts: opts.maxFixAttempts,
        keepSandbox: opts.keepSandbox,
        dryRun: opts.dryRun,
        logLevel: opts.logLevel,
        logFormat: opts.logFormat,
      };
      const code = await superviseCommand(flags);
      process.exit(code);
    });

  program
    .command("doctor")
    .description("Diagnose environment readiness")
    .action(async () => {
      const code = await doctor();
      process.exit(code);
    });

  program
    .command("version")
    .description("Print version info")
    .action(() => {
      const code = versionCommand();
      process.exit(code);
    });

  return program;
}

export async function main(argv) {
  const program = buildProgram();
  await program.parseAsync(argv);
}

export default { main, buildProgram };
