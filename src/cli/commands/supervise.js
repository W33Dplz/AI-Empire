import fs from "node:fs";
import { ZodError } from "zod";
import { supervise } from "../../supervisor/index.js";
import { loadConfig } from "../../config/load.js";

const EXIT = { PASS: 0, FIX: 1, REJECT: 2 };

export async function superviseCommand(flags = {}) {
  let cfg;
  try {
    try {
      cfg = loadConfig({ flags, env: process.env, dotenv: {} });
    } catch (err) {
      if (err instanceof ZodError) {
        const msg = err.issues
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; ");
        process.stderr.write(`E_INVALID_CONFIG: ${msg}\n`);
        return 40;
      }
      throw err;
    }

    if (!cfg.repo) {
      process.stderr.write(
        "E_INVALID_CONFIG: --repo is required (or AI_EMPIRE_REPO)\n"
      );
      return 40;
    }
    if (!cfg.branch) {
      process.stderr.write(
        "E_INVALID_CONFIG: --branch is required (or AI_EMPIRE_BRANCH)\n"
      );
      return 40;
    }

    if (!fs.existsSync(cfg.repo)) {
      process.stderr.write(
        `E_NO_GIT: repository path does not exist: ${cfg.repo}\n`
      );
      return 10;
    }

    if (!cfg.dryRun && !cfg.openaiApiKey) {
      process.stderr.write(
        "E_NO_OPENAI_KEY: OPENAI_API_KEY is required when --dry-run is not set\n"
      );
      return 20;
    }

    const verdict = await supervise({
      repo: cfg.repo,
      branch: cfg.branch,
      baseline: cfg.baseline,
      missionsRoot: cfg.missionsRoot,
      adapter: cfg.adapter,
      reportPath: cfg.reportPath,
      maxFixAttempts: cfg.maxFixAttempts,
      dryRun: cfg.dryRun,
    });

    try {
      const markdown = fs.readFileSync(verdict.reportPath, "utf8");
      process.stdout.write(markdown);
      if (!markdown.endsWith("\n")) process.stdout.write("\n");
    } catch (err) {
      process.stderr.write(
        `E_INTERNAL: failed to read report at ${verdict.reportPath}: ${err.message}\n`
      );
      return 99;
    }

    const code = EXIT[verdict.verdict];
    return code === undefined ? 99 : code;
  } catch (err) {
    process.stderr.write(`E_INTERNAL: ${err.message}\n`);
    return 99;
  }
}

export default superviseCommand;
