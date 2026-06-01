# Feature Specification: AI-EMPIRE v1.0.0 — OSS Public Release

**Feature Branch**: `001-public-release-v1`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Bring AI-EMPIRE from ~30% prototype to a v1.0.0 release that any developer with a Lovable (or any other code-generation pipeline) project can install, configure and use in under 5 minutes."

## User Scenarios & Testing

### User Story 1 — Solo developer audits a generated project locally (Priority: P1) 🎯 MVP

A developer has a project (typically Lovable-generated, but any Node/TS repo works) and wants a quick, automated quality gate before merging changes into their protected branch. They install AI-EMPIRE globally via `npm install -g ai-empire` or run it directly with `npx ai-empire`, configure an OpenAI API key in a `.env` file, point the CLI at their repo path, and receive a structured verdict (PASS / FIX / REJECT) with a markdown report listing what changed, what tests were run, what regressions or scope drifts were detected, and what was auto-fixed.

**Why this priority**: This is the minimum viable product. Without the local CLI flow, no one can evaluate the tool. Every other surface (GitHub Action, hosted dashboard) depends on this core engine being reliable.

**Independent Test**: Install via `npx ai-empire@latest supervise --repo ./demo-project --branch dev`, see a markdown verdict file generated, exit code reflects the verdict (0 PASS / 1 FIX-NEEDED / 2 REJECTED). The same command rerun on the same input produces the same verdict.

**Acceptance Scenarios**:

1. **Given** a clean Node.js repo with a passing `npm test`, **When** the developer runs `ai-empire supervise --repo ./demo --branch dev`, **Then** the tool produces a `PASS` verdict and a report at `./ai-empire-report.md` within 60 seconds.
2. **Given** a repo where the developer added a console.log to `package.json` (corrupting it), **When** the developer runs the supervisor, **Then** the tool produces a `REJECT` verdict naming the broken file and the failing `npm install` step.
3. **Given** a repo where a recent commit introduced an obvious regression (a deleted exported function still imported elsewhere), **When** the developer runs the supervisor, **Then** the tool produces a `FIX` verdict, attempts an auto-fix, retests, and reports either success or escalation.
4. **Given** no `OPENAI_API_KEY` is configured, **When** the developer runs the supervisor, **Then** the tool exits with a clear error explaining how to set the key (link to `.env.example`), without leaking partial state.
5. **Given** a Windows host, **When** the developer runs the supervisor on a repo at `C:\Users\foo\proj`, **Then** the tool behaves identically to a Linux host (no path-separator failure).

---

### User Story 2 — Team integrates supervisor as a GitHub Action (Priority: P2)

A team using Lovable (or any code-gen pipeline) wants every push to their `lovable-dev` branch to be supervised automatically. They add a single workflow file (`.github/workflows/ai-empire.yml`) to their repository, set `OPENAI_API_KEY` as a repository secret, and from that moment every push to `lovable-dev` triggers AI-EMPIRE, which posts a verdict comment on the resulting Pull Request and either marks the PR as ready-to-merge or blocks it with a structured diagnostic.

**Why this priority**: This is the real-world automation hook. Without it, AI-EMPIRE is just a local CLI competing against `husky` hooks. With it, AI-EMPIRE becomes a continuous quality gate visible to the whole team.

**Independent Test**: A demo repository with the workflow file installed receives a push that introduces a deliberate regression. The Action runs, posts a comment with the verdict on the open PR, sets the appropriate check status (success/failure), and surfaces the markdown report as a workflow artefact.

**Acceptance Scenarios**:

1. **Given** a repository with `.github/workflows/ai-empire.yml` installed and `OPENAI_API_KEY` secret set, **When** a push lands on `lovable-dev` with a valid change, **Then** within 5 minutes a check named `ai-empire/supervise` reports success on the resulting PR and a verdict comment appears.
2. **Given** the same setup, **When** a push lands that breaks `npm test`, **Then** the check reports failure, the comment explains what failed, and the workflow artefact contains the full report.
3. **Given** a missing `OPENAI_API_KEY` secret, **When** the Action runs, **Then** it fails fast with an actionable error in the workflow log (not silently passing).

---

### User Story 3 — OSS contributor evaluates and contributes (Priority: P3)

An open-source developer discovers AI-EMPIRE (via Codex for OSS, Hacker News, or a search) and wants to understand what it is, try it in 5 minutes, and potentially open a PR. They land on the README, follow a quickstart that runs an in-repo demo, find a `CONTRIBUTING.md` explaining the spec-driven workflow, browse open issues with `good-first-issue` labels, and open a PR that automatically triggers green CI on Linux + Windows.

**Why this priority**: Required for the project to function as actual OSS, not a code dump. Drives the criteria for "shippable" beyond pure code correctness.

**Independent Test**: A fresh clone of the repo on a clean machine — Linux or Windows — runs `npm install && npm test && npm run demo` successfully without manual edits. README quickstart steps work as written.

**Acceptance Scenarios**:

1. **Given** a freshly cloned repo, **When** the contributor runs `npm install && npm test`, **Then** all tests pass in under 60 seconds on Linux and Windows.
2. **Given** the same fresh clone, **When** the contributor runs `npm run demo`, **Then** an end-to-end supervisor flow executes against a bundled demo target and prints a verdict.
3. **Given** an open PR from a fork, **When** CI runs, **Then** lint + type-check + tests + smoke-supervisor execute on Linux and Windows runners and all post status to the PR.

---

### Edge Cases

- The target repository is empty or non-git → tool exits with a structured error (`E_NO_GIT`) before any LLM call.
- The target repository's `npm install` itself fails (broken `package.json`) → REJECT verdict, exit code 2, no LLM cost burnt on planning.
- Network outage during OpenAI call → retries with exponential backoff (max 3 attempts), then exits with `E_LLM_UNREACHABLE` preserving sandbox state for debugging.
- Two concurrent supervisor invocations against the same target → second invocation detects an active sandbox and either queues or exits with `E_CONCURRENT` (configurable).
- The OpenAI key is rotated mid-mission → current mission completes if already past plan generation; otherwise fails with a clear error.
- A `PATCH_FILE` plan step targets a path outside the sandbox (`../../etc/passwd`) → mission rejected pre-execution by `RiskGate`, logged.
- A plan step contains JS that imports a malicious module from `npm` → out of scope for v1; documented as a known risk in `SECURITY.md`.

## Requirements

### Functional Requirements

- **FR-001**: The tool MUST expose a CLI entry point named `ai-empire` with at minimum the subcommand `supervise`.
- **FR-002**: `ai-empire supervise --repo <path>` MUST clone the target repo into an isolated sandbox before any mutation.
- **FR-003**: The tool MUST read `OPENAI_API_KEY` from the process environment, optionally loaded via a local `.env` file.
- **FR-004**: The tool MUST emit a verdict of exactly one of: `PASS`, `FIX`, `REJECT`.
- **FR-005**: The tool MUST exit with code `0` on PASS, `1` on FIX-required, `2` on REJECT, `3+` on internal errors (with documented codes).
- **FR-006**: The tool MUST write a human-readable markdown report at a configurable path (default `./ai-empire-report.md`).
- **FR-007**: The tool MUST function identically on Linux, macOS and Windows.
- **FR-008**: The tool MUST never write to a path outside the configured `MISSIONS_ROOT` and the report output path.
- **FR-009**: The tool MUST ship a GitHub Action wrapper that internally runs the same CLI, invokable via `uses: W33Dplz/AI-Empire/.github/actions/supervise@v1`.
- **FR-010**: The tool MUST support a `--dry-run` flag that produces the verdict without executing any LLM call (using cached/mocked decisions) — used in tests.
- **FR-011**: The tool MUST emit structured JSON logs (one event per line) on a configurable log stream, independent of the human-readable report.
- **FR-012**: The repository MUST publish to npm under the package name `ai-empire` so that `npx ai-empire` works without prior installation.

### Key Entities

- **Mission**: a single supervision run, identified by a UUID. Fields: id, repo path, target branch, started_at, status (`PENDING` | `RUNNING` | `DONE` | `FAILED`), verdict, report_path.
- **Plan**: an ordered list of `Step`s produced either by the LLM or by deterministic templates. Fields: id, steps[], generated_by.
- **Step**: a single atomic action. Type ∈ {`PATCH_FILE`, `RUN_TEST`, `RUN_BUILD`, `GIT_COMMIT`, `GIT_BRANCH`}. Targets, content, expected outcome.
- **Verdict**: outcome of a mission. Fields: verdict (`PASS`/`FIX`/`REJECT`), reasons[], regressions[], scope_drift, score, report_path.
- **Sandbox**: an isolated filesystem clone of the target. Fields: id (matches mission_id), path, cleanup_policy.
- **Integration adapter**: optional plugin describing how to source the target. Default adapter clones a local path; Lovable adapter knows the `lovable-dev` branch convention.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A new user can go from "I have a Node.js repo" to "I have a verdict report in front of me" in under **5 minutes** following only the README quickstart, on a clean machine.
- **SC-002**: `npm test` completes in under **60 seconds** on Linux and on Windows on a clean clone with default settings.
- **SC-003**: For a corpus of 10 deliberately broken demo targets, the tool produces a `REJECT` verdict in **at least 9 out of 10** cases with the correct failing file named in the report.
- **SC-004**: For a corpus of 10 deliberately clean demo targets, the tool produces a `PASS` verdict in **10 out of 10** cases.
- **SC-005**: CI matrix (Linux + Windows) is green on `main` for **30 consecutive days** before claiming v1.0.0.
- **SC-006**: A first-time OSS contributor can open a PR that triggers a green CI in their fork **without help** (validated by at least 1 external contributor before v1.0.0 tag).
- **SC-007**: GitHub Action setup (single YAML file + 1 secret) completes successfully on a demo Lovable-style repo in under **3 minutes** of human time.

## Assumptions

- Users have Node.js 20+ installed.
- Users have an OpenAI account with API access and a usable key.
- Target repos are valid git repositories with at least a `package.json`.
- Target repos use `npm` (not `yarn`/`pnpm`/`bun`) for v1.0.0 — multi-package-manager support deferred to v1.1.
- Lovable-generated repos follow Lovable's convention (`lovable-dev` branch as the volatile one). Other code-generators are supported only via custom configuration.
- GitHub Action distribution uses GitHub Marketplace once v1.0.0 is tagged.
- The "Codex for OSS" submission deadline is not in scope here; this spec focuses on technical readiness, not marketing timing.
