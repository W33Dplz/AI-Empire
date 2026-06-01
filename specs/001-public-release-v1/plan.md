# Implementation Plan: AI-EMPIRE v1.0.0 — OSS Public Release

**Branch**: `001-public-release-v1` | **Date**: 2026-06-01 | **Spec**: [./spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-public-release-v1/spec.md`

## Summary

Promote the current V4.2 prototype (≈30% complete, Windows-only, no docs, no CLI, no tests) to a v1.0.0 release publishable on npm + GitHub Marketplace. Approach: lock the surface as a CLI + GitHub Action wrapping an internal `supervise()` library; harden portability and safety; complete the `IntakeEngine` stub (currently the blocker for any external repo); add Vitest tests covering all gates; ship documentation, CI matrix and a permissive license.

The existing V3 brain + agents (devAgent, gitAgent, testAgent, auditAgent) are reused as-is — they work. The V4 supervisor stubs (intent, decision, scoring, regression, baseline, trace) are completed only where required by the v1.0.0 user stories; over-engineering is deferred.

## Technical Context

**Language/Version**: Node.js 20 LTS or newer. ESM only (`"type": "module"`).

**Primary Dependencies**:
- `openai` ^4.0.0 — LLM client for plan generation
- `simple-git` ^3.30 — git operations on target and sandbox
- `dotenv` ^16.0 — `.env` loading
- `commander` ^12 — CLI framework
- `zod` ^3.23 — runtime schema validation for plans and config
- `pino` ^9 — structured JSON logging
- *(dev)* `vitest` ^2 — test framework
- *(dev)* `@vitest/coverage-v8` — coverage
- *(dev)* `eslint` ^9 + `@eslint/js` — linting
- *(dev)* `prettier` ^3 — formatting

**Storage**: filesystem only. Mission state and reports are markdown + JSON files under `MISSIONS_ROOT` (default `~/.ai-empire/missions/`, `%USERPROFILE%\.ai-empire\missions\` on Windows). No database.

**Testing**: Vitest, unit + integration. Coverage gate ≥ 70% on `src/`.

**Target Platform**: Node 20+ on Linux, macOS, Windows. Distributed as npm package + GitHub Action.

**Project Type**: CLI tool + library (single project layout).

**Performance Goals**:
- Cold supervise of a 1k-LOC repo in < 60s wall-clock (excluding LLM latency).
- `npm test` of AI-EMPIRE itself in < 60s.
- GitHub Action end-to-end (cold runner) in < 5 min for a small target.

**Constraints**:
- Memory < 512 MB during a single mission on the default Node runtime.
- No native modules.
- LLM cost per supervise run kept under $0.05 average (use `gpt-4o-mini` by default; `gpt-4o` opt-in via flag).

**Scale/Scope**:
- Target a single-repo supervisor for v1.0.0; multi-repo orchestration deferred.
- ~3k LOC source post-cleanup, ~1.5k LOC tests.

## Constitution Check

Each principle of `.specify/memory/constitution.md` is checked against this plan.

| Principle | Status | Notes |
|---|---|---|
| I. Project-Agnostic by Design | ✅ Pass | Lovable specifics isolated in `src/integrations/lovable/`. Default adapter operates on any repo path + branch. |
| II. Safety-First (NON-NEGOTIABLE) | ✅ Pass | All mutations occur in `sandbox/<mission-id>/` cloned from target. `RiskGate` checks every `PATCH_FILE` target stays inside sandbox. No write to target's protected branch is part of v1. |
| III. Determinism Over Intelligence | ⚠️ Partial — to verify post-Phase 2 | LLM confined to plan generation (`Brain.generatePlan`). All gates are pure code. Re-check: confirm that no gate calls the LLM during decision or scoring. |
| IV. Cross-Platform Portability | ⚠️ Action required | Current code has hardcoded `C:/AI-EMPIRE-MISSIONS/` paths. Phase 1 task T020 replaces these with `path.join(os.homedir(), '.ai-empire', 'missions')` and an env override. CI matrix added (Linux + Windows) in Phase 1. |
| V. OSS-Friendly by Default | ⚠️ Action required | No README usable by a stranger, no LICENSE, no CONTRIBUTING.md, no demo. Addressed across User Story 3 tasks. |

**Verdict**: plan approved with two outstanding violations both scheduled for resolution in the Setup + Foundational phases. No deviation requires a Complexity Tracking entry (all violations are accepted and resolved within this plan).

## Project Structure

### Documentation (this feature)

```
specs/001-public-release-v1/
├── plan.md              # This file
├── spec.md              # User stories + requirements
├── research.md          # (optional — not produced; tech context is plain)
├── data-model.md        # Schema of Mission, Plan, Step, Verdict (produced in T007)
├── quickstart.md        # End-to-end demo walkthrough (produced in T040)
├── contracts/           # CLI contract, GitHub Action input/output schema
│   ├── cli.md
│   └── github-action.md
└── tasks.md             # Output of Spec-Kit `/tasks` — atomic todos
```

### Source Code (repository root)

```
ai-empire/
├── bin/
│   └── ai-empire              # Node shebang entry, calls src/cli/index.js
├── src/
│   ├── cli/                   # Commander setup, command handlers
│   │   ├── index.js
│   │   └── commands/
│   │       ├── supervise.js
│   │       ├── doctor.js      # Diagnose env (node version, key set, etc.)
│   │       └── version.js
│   ├── core/                  # Migrated from current /core (logger, riskGate, sandbox, missionDefinition)
│   ├── agents/                # Migrated from current /agents (dev, git, test, audit)
│   ├── supervisor/            # V4 supervisor — only modules required for v1 are completed
│   │   ├── intake.js          # NEW — replaces stub IntakeEngine
│   │   ├── decision.js        # From v4-supervisor/decision
│   │   ├── intent.js
│   │   ├── regression.js
│   │   └── scoring.js
│   ├── brain/                 # Migrated from legacy_v3/orchestrator/brain.js
│   ├── integrations/
│   │   ├── default/           # Plain git repo adapter
│   │   └── lovable/           # Lovable convention adapter
│   ├── llm/
│   │   └── openai-client.js   # Thin wrapper exposing LLMClient interface
│   ├── config/
│   │   └── load.js            # Env + .env + CLI flags merged into typed Config
│   └── lib/
│       └── paths.js           # Cross-platform path utilities
├── tests/
│   ├── unit/
│   │   ├── riskGate.test.js
│   │   ├── auditAgent.test.js
│   │   ├── sandboxManager.test.js
│   │   ├── intentClassifier.test.js
│   │   ├── decisionEngine.test.js
│   │   └── paths.test.js
│   ├── integration/
│   │   ├── supervise-pass.test.js
│   │   ├── supervise-reject.test.js
│   │   └── supervise-fix.test.js
│   └── fixtures/
│       ├── demo-pass/         # Bundled demo target (clean)
│       ├── demo-reject/       # Bundled demo target (broken)
│       └── demo-fix/          # Bundled demo target (auto-fixable)
├── .github/
│   ├── actions/
│   │   └── supervise/         # Composite GitHub Action wrapping the CLI
│   │       └── action.yml
│   ├── workflows/
│   │   ├── ci.yml             # Lint + test matrix
│   │   ├── release.yml        # npm publish on tag
│   │   └── ai-empire-demo.yml # Self-test against demo fixtures
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── quickstart.md
│   ├── architecture.md
│   ├── adapters.md
│   └── github-action.md
├── examples/
│   └── lovable-demo/          # Reference target repo for screencasts
├── .specify/                  # Spec-Kit metadata (this file's parent)
├── specs/                     # Spec-driven artefacts (this feature lives here)
├── CLAUDE.md                  # Agent context for contributors using Claude Code
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE                    # MIT
├── CHANGELOG.md
├── package.json
└── .gitignore
```

**Structure Decision**: Single project (CLI + library). The supervisor logic is a single npm package exposing both an importable API (`import { supervise } from 'ai-empire'`) and a CLI binary. The GitHub Action is a thin composite action that internally runs the CLI. Lovable specifics live in a sibling directory `src/integrations/lovable/` behind a stable adapter interface.

The existing `legacy_v3/` becomes `src/brain/` (the brain code is still the core orchestrator); the existing `v4-supervisor/` is collapsed into `src/supervisor/` with stub modules either completed or removed. `manifest/`, `_internal_archive/`, the `.backup.*` files and `node_modules/` (already excluded) are deleted as part of Phase 1.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Two distribution channels (npm + GitHub Action) for v1 | Spec FR-009 + FR-012 — local CLI is the MVP (US1), GitHub Action is the real-world hook (US2). | Single distribution rejected: a CLI-only release does not satisfy US2; an Action-only release does not satisfy US1. |
| Custom `LLMClient` interface despite only one provider in v1 | Constitution principle "AI provider must be swappable" + cost / model flexibility (gpt-4o-mini vs gpt-4o). | Direct OpenAI import everywhere rejected: it would force a breaking change the moment Anthropic or local models are added (post-v1). |

No other constitution violation is introduced. Determinism and portability gaps detected in the Constitution Check are scheduled as Phase 1 / Phase 2 tasks rather than accepted complexity.
