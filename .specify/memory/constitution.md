# AI-EMPIRE Constitution

This document defines the non-negotiable principles that govern AI-EMPIRE's design, evolution and review. Every change — code, docs, dependencies, defaults — must comply. Violations require an explicit justification logged in the plan's *Complexity Tracking* section.

## Core Principles

### I. Project-Agnostic by Design

AI-EMPIRE supervises **any** repository, not just Lovable outputs. Lovable is the reference use case, not a hard dependency. No file path, branch name, code generator or framework specific to a single vendor may be hard-coded outside of optional adapters. The supervisor receives a target repository and a configuration; it must work the same way for a hand-written project as for a Lovable-generated one.

**Implication**: any vendor-specific assumption lives in `integrations/<vendor>/`, behind a stable interface, and is opt-in via configuration.

### II. Safety-First (NON-NEGOTIABLE)

The supervisor must never silently mutate state outside the sandbox it owns.

- No writes to the target repository's protected branches (`main`, `master`, `production`) without an explicit human-approved merge.
- All file mutations happen in an isolated working tree (`sandbox/<mission-id>/`) cloned from the target.
- All shell commands execute with `cwd` constrained to the sandbox; no relative path escape allowed.
- Credentials are read from the environment only — never logged, never persisted, never serialised into mission state.
- Destructive operations (`rm -rf`, `git reset --hard`, `force-push`) inside the supervisor's own code are prohibited unless gated by an explicit human-approved mission decision.

### III. Determinism Over Intelligence

Decision-making logic is deterministic. LLM calls (OpenAI) are confined to **plan generation** and **natural-language summarisation**. Every gate — `RiskGate`, `AuditAgent`, `ScopeDriftDetector`, `RegressionGuard`, `DecisionEngine` — is pure code with reproducible inputs and outputs.

**Implication**: a given (repository state, mission plan) tuple always produces the same verdict. Audit and replay are first-class.

### IV. Cross-Platform Portability

AI-EMPIRE runs identically on Linux, macOS and Windows. No path may be hard-coded with a drive letter, OS-specific separator or absolute root. Configurable roots default to OS-appropriate locations (`~/.ai-empire/missions` on Unix; `%USERPROFILE%\.ai-empire\missions` on Windows). The Node runtime is the only required dependency (Node 20 LTS minimum).

**Implication**: every PR must demonstrate Linux + Windows compatibility via CI matrix runs.

### V. OSS-Friendly by Default

A new contributor or evaluator must be able to:

1. Read a single-page README and understand what the project does and why.
2. Install and run a demo in under 5 minutes.
3. Run the test suite in under 60 seconds.
4. Open a PR that triggers a CI pipeline visible from the PR page.

All public surfaces (README, CLI `--help`, error messages, schema docs) are written in plain English. License is permissive (MIT). `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue templates and PR templates are mandatory.

## Technical Constraints

- **Runtime**: Node.js 20.x LTS or newer. ESM only (`"type": "module"`).
- **Dependencies**: minimise direct dependencies; every added package requires justification in the plan. No native modules without explicit need.
- **AI provider**: OpenAI SDK v4+. Provider must be swappable via an abstract `LLMClient` interface (Anthropic, local models, etc. — added later).
- **Testing**: Vitest. Unit tests for every gate module. Integration tests for the full mission loop.
- **CI**: GitHub Actions. Linux + Windows matrix. Lint + type-check + tests on every PR.

## Development Workflow

- All work happens on feature branches named `###-feature-name` (sequential numbering matches `specs/` folders).
- PRs require: green CI, no merge conflicts, updated documentation if user-visible behaviour changes.
- `main` is protected. No direct pushes.
- Spec-driven development: every non-trivial feature begins with a `specs/<feature>/spec.md` and `plan.md` before any code is written.
- Constitution Check (in `plan.md`) is a hard gate: a plan that violates a principle without explicit complexity justification is rejected.

## Governance

- This constitution supersedes any other documented practice.
- Amendments require a PR labelled `constitution-amendment`, a rationale, and a migration plan for any code now in violation.
- Versioning follows SemVer: MAJOR for principle removals or backward-incompatible changes, MINOR for new principles or sections, PATCH for clarifications.
- A violation found in review must either be fixed or the constitution must be amended in the same change set — never both deferred.

**Version**: 1.0.0 | **Ratified**: 2026-06-01 | **Last Amended**: 2026-06-01
