# Architecture

This document is the consolidated architecture reference for AI-EMPIRE. It supersedes the historical `manifest/` directory.

## Mission

AI-EMPIRE is a code-supervision engine. Its job is to take a repository produced by a generation pipeline (e.g. Lovable) — or any repository where automated changes need a quality gate — and decide whether those changes are safe to merge into a protected branch.

Mental model:

```
generator (Lovable, Codex, human-with-AI…)
    │
    ▼  push
volatile branch  (e.g. lovable-dev)
    │
    ▼
AI-EMPIRE  ── clones into isolated sandbox
            ── runs audit + tests + auto-fix + scoring
            ── emits a Verdict: PASS / FIX / REJECT
            ── attaches a Markdown report
    │
    ▼  manual or gated merge
protected branch  (main)
```

AI-EMPIRE never mutates the protected branch. It produces a decision and surfaces it to a human (or to a CI status check), then stays out of the way.

## Module map

The codebase is structured as a single Node 20 ESM project:

```
src/
├── cli/           # commander-based entry point  (Phase 3)
├── core/          # cross-cutting primitives — logger, riskGate, sandboxManager, missionDefinition, riskEngine, auditLogger, maintenance, selfHeal
├── agents/        # devAgent (patch files), gitAgent (branch + commit), testAgent (npm run), auditAgent (diff integrity)
├── brain/         # orchestrator that drives a mission end-to-end (legacy V3 brain, ported)
├── supervisor/    # V4 layer — intent, decision, scoring, regression, baseline, trace
├── integrations/  # default repo adapter + lovable adapter  (Phase 4)
├── llm/           # LLMClient interface + openai-client
└── lib/           # paths, schemas (Zod), report rendering
```

Three execution surfaces wrap the same library:

1. **CLI** — `npx ai-empire supervise --repo <path> --branch <name>` for local use.
2. **GitHub Action** — `.github/actions/supervise/` wrapping the CLI for CI use.
3. **Programmatic** — `import { supervise } from 'ai-empire'` for embedding.

## Mission lifecycle

1. **Intake** — `src/supervisor/intake.js` resolves the target repository and target branch, validates it is a git repo, and creates an isolated sandbox clone under `MISSIONS_ROOT/<mission-id>/`.
2. **Plan generation** — `src/brain` asks the LLM (default `gpt-4o-mini`) for a structured `Plan` of `Step`s. The plan is validated against `src/lib/schemas.js` before any step runs.
3. **Risk gate** — `src/core/riskGate.js` rejects steps that target paths outside the sandbox, that match forbidden patterns, or that exceed safety thresholds.
4. **Execution** — `DevAgent` applies `PATCH_FILE` steps; `GitAgent` commits on a `mission-<id>` branch inside the sandbox; `TestAgent` runs `npm install`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm test` as configured.
5. **Audit** — `AuditAgent` verifies the diff stays within the announced scope.
6. **Scoring + decision** — `src/supervisor/intent.js`, `regression.js`, `scoring.js`, `decision.js` produce a final `Verdict` (`PASS` / `FIX` / `REJECT`) with reasons and score.
7. **Report** — `src/lib/report.js` renders a Markdown report at the configured output path.
8. **Cleanup** — sandbox is preserved on failure for debugging, purged on success unless `--keep-sandbox` is passed.

## Reusable V3 modules

The following modules from the V3 codebase are kept as-is in v1.0.0 because they already work:

- `src/core/riskEngine.js` + `riskGate.js`
- `src/core/sandboxManager.js`
- `src/core/missionDefinitionEngine.js`
- `src/core/logger.js` + `auditLogger.js`
- `src/agents/*` (dev, git, test, audit)
- `src/brain/brain.js` (orchestrator)

## V4 supervisor — roadmap

The V4 supervisor layer extends V3 with deterministic scoring and decision. v1.0.0 ships the modules required by the user stories in `specs/001-public-release-v1/spec.md`; the rest is post-v1.

| Module | Purpose | v1.0.0 status |
|---|---|---|
| `intent/intentClassifier.js` | Deterministic classification of change type (feature / refactor / chore / breaking) | ✅ Ported + tested |
| `intent/commitIntentExtractor.js` | Parse intent from commit messages | ✅ Ported |
| `intent/scopeDriftDetector.js` | Detect mismatch between declared intent and actual architectural impact | ✅ Ported + tested |
| `regression/regressionGuard.js` | Deterministic propagation analysis | ✅ Ported + tested |
| `baseline/baselineEngine.js` | Score comparison + aggravation detection | ✅ Ported |
| `scoring/architecturalScoreEngine.js` | Registry-aware scoring | ✅ Ported |
| `decision/decisionEngine.js` | Pure score-driven verdict | ✅ Ported + tested |
| `trace/featureTraceEngine.js` | Feature-claim → file mapping | ⚠️ Partial — deferred refinements post-v1 |
| `trace/impactGraph.js` | Architectural scope + propagation graph | ⚠️ Partial — deferred refinements post-v1 |
| `intake.js` (new) | Single entry point validating target repo and creating sandbox | 🚧 New in v1.0.0 |

## Engines deferred to post-v1.0.0

The original V4 manifest enumerated additional engines that are not required for the v1.0.0 user stories and are postponed:

- **Optimization Engine** — detect redundancies, improve maintainability automatically. Risk too high for v1; humans review.
- **Certification Engine** — full repository integrity score, separate from the per-mission verdict.
- **Multi-Project Expansion** — project registry, cross-project supervision, baseline detection per project. v1 is single-mission, single-target.

## Non-negotiable safety properties

These are enforced by the design and by the constitution (`.specify/memory/constitution.md`):

- No writes to protected branches of the target repository.
- All file mutations happen inside `MISSIONS_ROOT/<mission-id>/`, never touch the user's working copy.
- No shell command runs with a `cwd` outside the sandbox.
- Credentials are read from the environment, never logged or persisted.
- A given (repo-state, plan) input always produces the same verdict — gates are pure code.

## Versioning

v0.x — pre-release iterations, public-private boundary at the developer's discretion.
v1.0.0 — first OSS-ready release. Tagged after 30 days of green CI on `main`.
v1.x — additive features behind opt-in flags.
v2.x — breaking changes to the CLI / Action surface (very rare; constitution requires migration plan).

See [`../CHANGELOG.md`](../CHANGELOG.md) for the full history.
