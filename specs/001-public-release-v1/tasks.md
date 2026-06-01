---
description: "Task list for AI-EMPIRE v1.0.0 OSS public release"
---

# Tasks: AI-EMPIRE v1.0.0 — OSS Public Release

**Input**: Design documents from `/specs/001-public-release-v1/`

**Prerequisites**: [plan.md](./plan.md) ✅, [spec.md](./spec.md) ✅

**Tests**: Tests are mandatory in this project (Constitution principle V — OSS-Friendly requires `npm test` to work on a fresh clone). Test tasks are marked `[T]` and must FAIL before the corresponding implementation task is started.

**Organization**: Tasks are grouped by phase and by user story to enable parallel execution.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[T]**: Test task — must be written and FAILING before the corresponding implementation
- **[Story]**: US1 / US2 / US3, mapped to the user stories in [spec.md](./spec.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repository hygiene, scaffolding, baseline tooling. Blocks everything else.

- [ ] **T001** Delete `_internal_archive/`, `manifest/archive/`, all `*.backup.js`, all `*.backup.md` from working tree. Verify with `git status` that only intended files remain.
- [ ] **T002** Move `legacy_v3/orchestrator/` → `src/brain/`. Update all imports. Verify `node worker.js` still runs (smoke).
- [ ] **T003** Move `core/` → `src/core/`, `agents/` → `src/agents/`, `v4-supervisor/` → `src/supervisor/`. Update all imports. Verify smoke.
- [ ] **T004** [P] Move `manifest/AI-EMPIRE-MANIFEST.md` + `manifest/V4-ROADMAP.md` → `docs/architecture.md` (consolidated). Delete remaining `manifest/`.
- [ ] **T005** [P] Update `package.json`: add `"bin": { "ai-empire": "./bin/ai-empire" }`, `"engines": { "node": ">=20" }`, add scripts (`test`, `lint`, `format`, `demo`, `dev`), bump version to `0.1.0`. Add `commander`, `zod`, `pino` dependencies. Add `vitest`, `eslint`, `prettier`, `@vitest/coverage-v8` devDependencies.
- [ ] **T006** [P] Add `eslint.config.js` with `@eslint/js` recommended + `import/no-unresolved`. Add `.prettierrc`. Add `.editorconfig`.
- [ ] **T007** [P] Write `specs/001-public-release-v1/data-model.md` documenting Mission, Plan, Step, Verdict, Sandbox, IntegrationAdapter entities (Zod schemas as source of truth).
- [ ] **T008** [P] Write `specs/001-public-release-v1/contracts/cli.md` documenting CLI surface: subcommands, flags, exit codes.
- [ ] **T009** [P] Write `specs/001-public-release-v1/contracts/github-action.md` documenting Action inputs (`repo`, `branch`, `openai-key`, `report-path`) and outputs (`verdict`, `report-artifact-path`).

**Checkpoint**: Repository structure matches `plan.md`. `npm install` works. No code yet in new locations besides moved files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story can be delivered.

⚠️ **CRITICAL**: No user story work can begin until this phase is complete.

- [ ] **T010** [T] [P] Write `tests/unit/paths.test.js` covering `getMissionsRoot()`, `resolveInsideSandbox()`, `assertInsideSandbox()` — all expectations across Linux, macOS, Windows separator semantics. MUST FAIL initially.
- [ ] **T011** Implement `src/lib/paths.js` with cross-platform path utilities. Replace every hardcoded `C:/AI-EMPIRE-MISSIONS/` reference in the codebase with `getMissionsRoot()`. Tests T010 now PASS.
- [ ] **T012** [T] [P] Write `tests/unit/config.test.js` covering `loadConfig()` precedence: CLI flags > env vars > `.env` file > defaults. Validation via Zod.
- [ ] **T013** Implement `src/config/load.js`. Tests T012 PASS.
- [ ] **T014** [T] [P] Write `tests/unit/riskGate.test.js` covering path escape attempts, oversized files, forbidden patterns. MUST FAIL initially.
- [ ] **T015** Port `src/core/riskGate.js` from existing code, harden with explicit path-escape detection (`path.resolve` outside sandbox → reject). Tests T014 PASS.
- [ ] **T016** [T] [P] Write `tests/unit/sandboxManager.test.js` covering clone, cleanup, concurrent access detection.
- [ ] **T017** Port `src/core/sandboxManager.js` from existing code, use `paths.js` for all roots. Tests T016 PASS.
- [ ] **T018** [P] Add structured logging via `pino`. Replace every `console.log` / `logger.info` style call with `logger.info({ event, ...ctx })`. Stream defaults to stderr; report stays on stdout.
- [ ] **T019** [P] Define `LLMClient` interface in `src/llm/llm-client.js`. Implement `src/llm/openai-client.js` against it. The brain depends on the interface, not on the OpenAI SDK directly.
- [ ] **T020** [P] Set up GitHub Actions CI workflow `.github/workflows/ci.yml`: matrix `os: [ubuntu-latest, windows-latest]`, `node: [20, 22]`. Steps: install, lint, test. Visible on every PR.

**Checkpoint**: Foundation is portable and tested. Determinism gates fixed. CI matrix green on `main`. User stories can now proceed in parallel.

---

## Phase 3: User Story 1 — Local CLI supervise (Priority: P1) 🎯 MVP

**Goal**: A solo developer can `npx ai-empire supervise --repo ./demo --branch dev` and receive a verdict report.

**Independent Test**: Acceptance scenario 1 from spec.md: clean Node.js repo → PASS verdict + report in under 60 seconds.

### Tests for User Story 1

- [ ] **T021** [T] [P] [US1] Write `tests/integration/supervise-pass.test.js` using `tests/fixtures/demo-pass/`. Asserts: exit 0, report file exists, verdict === `PASS`.
- [ ] **T022** [T] [P] [US1] Write `tests/integration/supervise-reject.test.js` using `tests/fixtures/demo-reject/`. Asserts: exit 2, verdict === `REJECT`, report names the broken file.
- [ ] **T023** [T] [P] [US1] Write `tests/integration/supervise-fix.test.js` using `tests/fixtures/demo-fix/`. Asserts: exit 1, verdict === `FIX`, at least one auto-fix attempted, report shows fix outcome.
- [ ] **T024** [T] [P] [US1] Write `tests/unit/intentClassifier.test.js` (existing module — port + extend).
- [ ] **T025** [T] [P] [US1] Write `tests/unit/decisionEngine.test.js` covering PASS / FIX / REJECT decision matrix.
- [ ] **T026** [T] [P] [US1] Write `tests/unit/intake.test.js` for the new `IntakeEngine` (currently stub).

### Implementation for User Story 1

- [ ] **T027** [P] [US1] Implement `src/supervisor/intake.js`: takes (repoPath, branch), validates git repo, clones into sandbox, returns `Mission` object. Tests T026 PASS.
- [ ] **T028** [P] [US1] Define Zod schemas in `src/lib/schemas.js` for Mission, Plan, Step, Verdict (from data-model.md). Used at every boundary.
- [ ] **T029** [P] [US1] Port + complete `src/supervisor/intent.js`. Tests T024 PASS.
- [ ] **T030** [P] [US1] Port + complete `src/supervisor/decision.js` returning `{ verdict, reasons, score }`. Tests T025 PASS.
- [ ] **T031** [US1] Implement `src/supervisor/index.js` exporting `supervise({ repo, branch, ...opts }) → Promise<Verdict>`. Orchestrates Brain → DevAgent → TestAgent → AuditAgent → DecisionEngine pipeline. Uses every Foundational gate.
- [ ] **T032** [US1] Implement `src/cli/commands/supervise.js` wrapping `supervise()` from T031. Translates Verdict to markdown report (`src/lib/report.js`) and exit code. Tests T021/T022/T023 PASS.
- [ ] **T033** [P] [US1] Implement `src/cli/commands/doctor.js` checking node version, OpenAI key, write permission to MISSIONS_ROOT, network reachability.
- [ ] **T034** [P] [US1] Implement `src/cli/commands/version.js` reading from `package.json`.
- [ ] **T035** [US1] Implement `src/cli/index.js` using `commander` to dispatch subcommands. Add `bin/ai-empire` shebang shim.
- [ ] **T036** [P] [US1] Bundle demo fixtures `tests/fixtures/demo-pass/`, `demo-reject/`, `demo-fix/`: each a minimal Node project (package.json + 1 src file + 1 test) crafted to produce the expected verdict.
- [ ] **T037** [P] [US1] Add `npm run demo` script that runs `supervise` against `tests/fixtures/demo-pass` and prints the report path.

**Checkpoint US1**: `npx ai-empire supervise --repo ./demo --branch dev` works end-to-end on Linux + Windows. All US1 acceptance scenarios pass.

---

## Phase 4: User Story 2 — GitHub Action (Priority: P2)

**Goal**: A team push to `lovable-dev` triggers AI-EMPIRE via a GitHub Action that comments on the PR.

**Independent Test**: Acceptance scenario 1 from US2: push to `lovable-dev` → check appears on PR within 5 min → comment posted with verdict.

### Tests for User Story 2

- [ ] **T038** [T] [P] [US2] Write `tests/integration/action-input-validation.test.js` for the Action wrapper's input parsing (without invoking GitHub actually).
- [ ] **T039** [T] [P] [US2] Write `tests/integration/action-comment-format.test.js` asserting the PR comment markdown matches `contracts/github-action.md`.

### Implementation for User Story 2

- [ ] **T040** [P] [US2] Author `.github/actions/supervise/action.yml` as composite action: inputs (`repo`, `branch`, `openai-key`, `report-path`), runs the CLI, sets outputs, uploads report as artefact.
- [ ] **T041** [P] [US2] Implement `src/integrations/github-comment.js` posting a PR comment via `gh` CLI (no extra npm dep — Action runner provides `gh`).
- [ ] **T042** [P] [US2] Add example consumer workflow at `examples/lovable-demo/.github/workflows/ai-empire.yml` to copy-paste into target repos.
- [ ] **T043** [P] [US2] Write `docs/github-action.md`: 3-step install (add workflow, set secret, push). Acceptance scenarios documented as troubleshooting flow.
- [ ] **T044** [US2] Add `.github/workflows/ai-empire-demo.yml` running supervise against bundled `demo-pass` fixture on every push to `main` — self-test of the Action wrapper. Visible as a green check on the repo homepage.

**Checkpoint US2**: A demo target repo can install the Action with a single workflow file + 1 secret and receive a verdict comment within 5 min of a push.

---

## Phase 5: User Story 3 — OSS-ready release (Priority: P3)

**Goal**: An OSS contributor can read README → install → test → contribute in under 5 minutes.

**Independent Test**: Acceptance scenarios from US3: fresh clone → `npm install && npm test && npm run demo` succeeds.

- [ ] **T045** [P] [US3] Rewrite `README.md` for end-users (not authors): badges (CI, npm, license), 30-second "what is it", 5-minute quickstart, CLI reference, GitHub Action reference, FAQ, link to architecture doc.
- [ ] **T046** [P] [US3] Write `CONTRIBUTING.md`: spec-driven workflow (constitution → spec → plan → tasks → implement), how to propose a new integration adapter, how to run tests locally.
- [ ] **T047** [P] [US3] Write `CODE_OF_CONDUCT.md` (adopt Contributor Covenant v2.1).
- [ ] **T048** [P] [US3] Write `SECURITY.md`: how to report a vulnerability, the known risk model (LLM-generated plan executes JS in sandbox), out-of-scope (npm dependency confusion).
- [ ] **T049** [P] [US3] Add `LICENSE` (MIT, year 2026).
- [ ] **T050** [P] [US3] Write `CHANGELOG.md` with v0.1.0 entry (this release).
- [ ] **T051** [P] [US3] Add `.github/ISSUE_TEMPLATE/bug_report.yml` + `feature_request.yml`. Add `.github/PULL_REQUEST_TEMPLATE.md`.
- [ ] **T052** [P] [US3] Author `specs/001-public-release-v1/quickstart.md`: copy-paste from-zero-to-verdict transcript including expected output.
- [ ] **T053** [P] [US3] Write `docs/architecture.md` consolidating the original manifest content into reader-oriented architecture doc with a sequence diagram.
- [ ] **T054** [P] [US3] Write `docs/adapters.md` documenting how to write a custom integration adapter (interface, examples, registration).
- [ ] **T055** [P] [US3] Author `examples/lovable-demo/` — a minimal Lovable-style repo used in screencasts and as the demo fixture for the Action.
- [ ] **T056** [US3] Configure `.github/workflows/release.yml`: triggered by tag `v*`, publishes to npm, drafts a GitHub Release with auto-generated notes from `CHANGELOG.md`.
- [ ] **T057** [US3] Add npm provenance + `publishConfig.access: public` to `package.json`. Reserve the npm package name `ai-empire`.

**Checkpoint US3**: External contributor can succeed without help. Repo passes the "fresh clone test" on Linux and Windows.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening before v1.0.0 tag.

- [ ] **T058** [P] Run `npm audit` and resolve any high/critical advisories.
- [ ] **T059** [P] Bump test coverage to ≥ 70% on `src/` (vitest coverage gate enforced in CI).
- [ ] **T060** [P] Review every public log statement for sensitive data (no key fragments, no full file contents in INFO level).
- [ ] **T061** [P] Add an end-to-end "fresh-clone test" CI job: `git clone`, `npm install`, `npm run demo` — must pass on Linux and Windows.
- [ ] **T062** Tag `v0.1.0` and publish to npm. Verify `npx ai-empire@0.1.0 supervise --help` works from anywhere on the planet.
- [ ] **T063** Run the supervisor against a real Lovable-generated repo (Charles to provide or simulate). Document any issue found.
- [ ] **T064** [P] Run a manual UX pass on the README's quickstart timing it with a stopwatch on a clean VM — must clear SC-001 (< 5 min).
- [ ] **T065** After 30 days of green CI on `main`, tag `v1.0.0`. Update `CHANGELOG.md`. Draft GitHub Release with screencast + highlights.

**Checkpoint Final**: v1.0.0 published. Project meets every success criterion in `spec.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies, can start immediately.
- **Foundational (Phase 2)**: depends on Setup. **BLOCKS** all user stories.
- **User Story 1 (Phase 3)**: depends on Phase 2. No dependency on US2 / US3.
- **User Story 2 (Phase 4)**: depends on Phase 2 + US1 (Action wraps the CLI; CLI must exist).
- **User Story 3 (Phase 5)**: depends on Phase 2; can run in parallel with US1 implementation since doc tasks reference contracts, not internals.
- **Polish (Phase 6)**: depends on all desired user stories.

### Within Each User Story

- Tests `[T]` are written and FAILING before the corresponding implementation.
- Schemas (Zod) before code that uses them.
- Library / supervisor modules before CLI commands.
- Each story is independently completable.

### Parallel Opportunities

- All `[P]` tasks within a phase can run concurrently when assigned to different workers.
- Phase 3 (US1) and Phase 5 (US3 doc) can be parallelised: an agent writes code while another writes docs against the published contracts (`contracts/cli.md`, `contracts/github-action.md` finalised in Phase 1).
- All test tasks `[T]` of US1 (T021–T026) can be written in parallel.
- Phase 6 polish tasks T058–T061 can all run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational — CI matrix green, paths portable, gates tested.
3. Complete Phase 3 US1 — CLI works end-to-end.
4. **STOP and VALIDATE**: tag `v0.2.0-mvp`, dogfood internally for one supervisor run on a real target.

### Incremental Delivery

1. v0.1.0 — Phase 1 + 2 complete (private/preview release: portable, tested, no CLI yet).
2. v0.2.0-mvp — US1 done. Local CLI works.
3. v0.3.0 — US2 done. GitHub Action available.
4. v0.9.0 — US3 done. Public OSS-ready candidate.
5. v1.0.0 — Phase 6 polish + 30-day CI stability.

### Parallel Team Strategy (if running multiple Claude agents)

- Once Phase 2 completes:
  - **Agent A**: Phase 3 (US1 implementation).
  - **Agent B**: Phase 5 documentation against the contracts (US3 doc tasks T045, T046, T052, T053, T054).
  - **Agent C**: Phase 4 once US1 has a CLI (waits on T035).
- Each agent operates in its own git worktree to avoid file conflicts (see `Workflow` tool's `isolation: 'worktree'`).

---

## Notes

- `[P]` tasks = different files, no dependencies — safe to parallelise.
- `[T]` test tasks must FAIL before the corresponding implementation is started (TDD enforced by Constitution principle III).
- `[Story]` label maps each task to a user story for traceability.
- Commit after each task or logical group with a Conventional Commit message (`feat:`, `chore:`, `test:`, `docs:`).
- Stop at any checkpoint to validate the story independently before continuing.
- Avoid: vague tasks (each task must produce a verifiable artefact), cross-story dependencies that break the MVP-first strategy, scope creep into post-v1 features (multi-package-manager, alternative LLM providers).
