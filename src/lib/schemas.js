import { z } from "zod";

export const MissionStatus = z.enum(["PENDING", "RUNNING", "DONE", "FAILED"]);
export const PlanProvenance = z.enum(["llm", "template", "human"]);
export const StepType = z.enum([
  "PATCH_FILE",
  "RUN_TEST",
  "RUN_BUILD",
  "RUN_LINT",
  "RUN_TYPECHECK",
  "GIT_COMMIT",
  "GIT_BRANCH",
  "NO_OP",
]);
export const StepStatus = z.enum(["PENDING", "OK", "FAILED", "SKIPPED"]);
export const VerdictKind = z.enum(["PASS", "FIX", "REJECT"]);
export const IntentKind = z.enum([
  "feature",
  "refactor",
  "chore",
  "breaking",
  "unknown",
]);
export const RegressionKind = z.enum([
  "import_missing",
  "test_newly_failing",
  "api_breaking_change",
  "dependency_downgrade",
  "other",
]);
export const Severity = z.enum(["low", "medium", "high"]);

export const StepSchema = z.object({
  id: z.string(),
  type: StepType,
  target: z.string().default(""),
  content: z.string().default(""),
  expected: z.record(z.any()).optional(),
  status: StepStatus.default("PENDING"),
  result: z.record(z.any()).optional(),
});

export const PlanSchema = z.object({
  id: z.string(),
  missionId: z.string(),
  generatedBy: PlanProvenance,
  steps: z.array(StepSchema).min(1),
  summary: z.string().optional(),
  createdAt: z.string(),
});

export const RegressionSchema = z.object({
  kind: RegressionKind,
  severity: Severity,
  file: z.string(),
  description: z.string(),
  autoFixable: z.boolean(),
});

export const ScopeDriftSchema = z.object({
  declaredIntent: z.string(),
  actualImpact: z.string(),
  divergence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});

export const VerdictSchema = z.object({
  verdict: VerdictKind,
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  regressions: z.array(RegressionSchema).default([]),
  scopeDrift: ScopeDriftSchema.nullable().default(null),
  intent: IntentKind,
  appliedFixes: z.array(z.string()).default([]),
  reportPath: z.string(),
});

export const MissionSchema = z.object({
  id: z.string().uuid(),
  repoPath: z.string(),
  targetBranch: z.string(),
  baselineBranch: z.string().optional(),
  status: MissionStatus,
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  verdict: VerdictSchema.optional(),
  error: z.string().optional(),
  sandboxPath: z.string(),
  reportPath: z.string().optional(),
  adapter: z.string(),
});
