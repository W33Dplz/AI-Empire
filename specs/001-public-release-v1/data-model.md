# Data Model — AI-EMPIRE v1.0.0

This document defines the entities exchanged across module boundaries. The canonical source of truth is the Zod schema in `src/lib/schemas.js`; this document is the human-readable summary and rationale.

All entities are JSON-serialisable. Every field is documented; no entity has hidden "implementation detail" fields.

## Entity: Mission

A single supervision run, end-to-end.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string (UUID v4) | yes | Stable across the run. Used as the sandbox folder name. |
| `repoPath` | string (absolute path) | yes | Target repository's working directory on the host. |
| `targetBranch` | string | yes | Branch in the target repo being supervised (e.g. `lovable-dev`). |
| `baselineBranch` | string | no | Branch to diff against (defaults to `main`). |
| `status` | enum: `PENDING` \| `RUNNING` \| `DONE` \| `FAILED` | yes | Lifecycle marker. |
| `startedAt` | string (ISO 8601) | yes | Set on transition `PENDING → RUNNING`. |
| `finishedAt` | string (ISO 8601) | no | Set on transition to `DONE` or `FAILED`. |
| `verdict` | Verdict | no | Present only when `status === 'DONE'`. |
| `error` | string | no | Present only when `status === 'FAILED'`. |
| `sandboxPath` | string (absolute path) | yes | Where the isolated clone lives. |
| `reportPath` | string (absolute path) | no | Final markdown report file. Set at the end. |
| `adapter` | string | yes | Identifier of the integration adapter used (e.g. `default`, `lovable`). |

**State machine**:

```
PENDING ──► RUNNING ──► DONE
                  └──► FAILED
```

A mission cannot transition backwards. Stale `RUNNING` missions older than `MISSION_STALE_AFTER_MINUTES` (default 30) are reaped by `src/core/maintenance.js`.

## Entity: Plan

An ordered list of steps that the supervisor will attempt to apply or verify.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string (UUID v4) | yes | Unique per plan; one mission can produce multiple plans (e.g. an initial plan and a fix plan). |
| `missionId` | string | yes | Foreign key to `Mission.id`. |
| `generatedBy` | enum: `llm` \| `template` \| `human` | yes | Provenance. Required for audit. |
| `steps` | Step[] | yes | At least one step. |
| `summary` | string | no | One-line human-readable description. |
| `createdAt` | string (ISO 8601) | yes | |

A plan whose steps reference a path outside the sandbox is rejected by `RiskGate` before execution.

## Entity: Step

A single atomic action.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | `step-001`, `step-002`, … (sequential within a plan) |
| `type` | enum: `PATCH_FILE` \| `RUN_TEST` \| `RUN_BUILD` \| `RUN_LINT` \| `RUN_TYPECHECK` \| `GIT_COMMIT` \| `GIT_BRANCH` \| `NO_OP` | yes | Drives which agent executes it. |
| `target` | string | depends | For `PATCH_FILE`: relative path inside sandbox. For `RUN_*`: empty. For `GIT_*`: empty. |
| `content` | string | depends | For `PATCH_FILE`: full file content (UTF-8). For `RUN_*`: optional script name override. For `GIT_*`: empty. |
| `expected` | object | no | Domain-specific expected outcome. For `RUN_TEST` may be `{ exitCode: 0 }`. |
| `status` | enum: `PENDING` \| `OK` \| `FAILED` \| `SKIPPED` | yes | Filled in during execution. |
| `result` | object | no | Whatever the executing agent produced. |

**Type-specific contracts**:

- `PATCH_FILE`: `target` must resolve inside the sandbox via `path.resolve`; oversize content (> 256 KiB) rejected by RiskGate.
- `RUN_TEST`: executes `npm test` (or the script name in `content`) in the sandbox. Timeout: 5 minutes default.
- `RUN_BUILD`: executes `npm run build` if present in `package.json`. Skipped (status `SKIPPED`) if absent.
- `RUN_LINT` / `RUN_TYPECHECK`: same, opportunistic — `SKIPPED` if the script is absent.
- `GIT_COMMIT`: commits all changes in the sandbox under a deterministic message `mission(<id>): step <step-id>`.
- `GIT_BRANCH`: creates a branch `mission-<id>` in the sandbox.
- `NO_OP`: explicit no-op used by safety fallbacks.

## Entity: Verdict

The final outcome of a mission.

| Field | Type | Required | Notes |
|---|---|---|---|
| `verdict` | enum: `PASS` \| `FIX` \| `REJECT` | yes | The decision. |
| `score` | number (0–100) | yes | Composite score from `src/supervisor/scoring.js`. |
| `reasons` | string[] | yes | Human-readable explanations, ordered most-important-first. |
| `regressions` | Regression[] | yes | Detected regressions (may be empty). |
| `scopeDrift` | ScopeDrift \| null | yes | Result from `ScopeDriftDetector` (null = no drift). |
| `intent` | enum: `feature` \| `refactor` \| `chore` \| `breaking` \| `unknown` | yes | Classification from `IntentClassifier`. |
| `appliedFixes` | string[] | yes | List of fix attempts, with outcomes. Empty when verdict is `PASS` or `REJECT`. |
| `reportPath` | string | yes | Absolute path to the markdown report. |

**Decision matrix** (canonical, encoded in `src/supervisor/decision.js`):

| Build/test pass? | Regressions? | Scope drift? | Score | Verdict |
|---|---|---|---|---|
| no | any | any | any | `REJECT` |
| yes | yes (high severity) | any | any | `REJECT` |
| yes | yes (low/medium) | yes | < 60 | `FIX` |
| yes | no | yes | < 70 | `FIX` |
| yes | no | no | ≥ 70 | `PASS` |
| yes | yes (auto-fixable) | no | ≥ 70 | `FIX` |

A `FIX` verdict triggers a second iteration of plan → execute → verdict, capped at `MAX_FIX_ATTEMPTS` (default 1).

## Entity: Regression

| Field | Type | Notes |
|---|---|---|
| `kind` | enum: `import_missing` \| `test_newly_failing` \| `api_breaking_change` \| `dependency_downgrade` \| `other` | |
| `severity` | enum: `low` \| `medium` \| `high` | |
| `file` | string | Path inside the sandbox. |
| `description` | string | Human-readable. |
| `autoFixable` | boolean | Used by the decision matrix. |

## Entity: ScopeDrift

| Field | Type | Notes |
|---|---|---|
| `declaredIntent` | string | What the change claims to be (from commit message / plan summary). |
| `actualImpact` | string | What the architectural impact analysis revealed. |
| `divergence` | number (0–1) | 0 = aligned, 1 = totally divergent. |
| `evidence` | string[] | File paths or claims supporting the divergence. |

## Entity: Sandbox

A filesystem clone of the target repository under `MISSIONS_ROOT`.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Equals `Mission.id`. |
| `path` | string | Absolute path. Format: `<MISSIONS_ROOT>/<mission-id>/`. |
| `originalRef` | string | Git ref (commit SHA) of the target branch at clone time. |
| `cleanupPolicy` | enum: `on_success` \| `always` \| `never` | Default `on_success`. CLI flag `--keep-sandbox` forces `never`. |

## Entity: IntegrationAdapter

Optional plug-in describing how to source the target.

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g. `default`, `lovable`. Used in CLI `--adapter` flag. |
| `resolveTarget` | function | `(opts) → Promise<{ repoPath, targetBranch, baselineBranch }>`. |
| `postRun` | function | `(mission) → Promise<void>` — optional hook for posting comments, marking PRs, etc. |

The default adapter takes a local path. The Lovable adapter knows the `lovable-dev` convention and, in GitHub Action mode, posts a PR comment with the verdict.

## Persistence

State is stored as JSON files under `MISSIONS_ROOT/<mission-id>/`:

```
<MISSIONS_ROOT>/<mission-id>/
├── mission.json     # serialised Mission entity
├── plans/
│   ├── plan-001.json
│   └── plan-002.json   # only if a fix iteration was needed
├── verdict.json
├── report.md           # human-readable; also copied to --report-path
└── workdir/            # the sandboxed git clone
```

No database. Migrations are not a concern; the file format is the schema, and changes follow semver on the package.
