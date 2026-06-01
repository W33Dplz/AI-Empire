import { z } from "zod";
import { getMissionsRoot } from "../lib/paths.js";

const boolFromString = z.preprocess(
  (v) => typeof v === "string" ? (v === "true" || v === "1") : v,
  z.boolean()
);

export const ConfigSchema = z.object({
  logLevel: z.enum(["trace","debug","info","warn","error"]).default("info"),
  logFormat: z.enum(["pretty","json"]).default("pretty"),
  model: z.string().default("gpt-4o-mini"),
  maxFixAttempts: z.coerce.number().int().min(0).default(1),
  keepSandbox: boolFromString.default(false),
  dryRun: boolFromString.default(false),
  adapter: z.string().default("default"),
  baseline: z.string().default("main"),
  reportPath: z.string().default("./ai-empire-report.md"),
  missionsRoot: z.string().optional(),
  openaiApiKey: z.string().optional(),
  repo: z.string().optional(),
  branch: z.string().optional(),
});

const ENV_MAP = {
  AI_EMPIRE_LOG_LEVEL: "logLevel",
  AI_EMPIRE_LOG_FORMAT: "logFormat",
  AI_EMPIRE_MODEL: "model",
  AI_EMPIRE_MAX_FIX_ATTEMPTS: "maxFixAttempts",
  AI_EMPIRE_KEEP_SANDBOX: "keepSandbox",
  AI_EMPIRE_DRY_RUN: "dryRun",
  AI_EMPIRE_ADAPTER: "adapter",
  AI_EMPIRE_BASELINE: "baseline",
  AI_EMPIRE_REPORT_PATH: "reportPath",
  AI_EMPIRE_MISSIONS_ROOT: "missionsRoot",
  AI_EMPIRE_REPO: "repo",
  AI_EMPIRE_BRANCH: "branch",
  OPENAI_API_KEY: "openaiApiKey",
};

function mapEnv(src) {
  const out = {};
  if (!src) return out;
  for (const [k, v] of Object.entries(ENV_MAP)) {
    if (src[k] !== undefined && src[k] !== "") out[v] = src[k];
  }
  return out;
}

function compact(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined && v !== "") out[k] = v;
  }
  return out;
}

export function loadConfig({ flags = {}, env = {}, dotenv = {} } = {}) {
  const layered = Object.assign({}, mapEnv(dotenv), mapEnv(env), compact(flags));
  const parsed = ConfigSchema.parse(layered);
  if (!parsed.missionsRoot) parsed.missionsRoot = getMissionsRoot(env);
  return parsed;
}
