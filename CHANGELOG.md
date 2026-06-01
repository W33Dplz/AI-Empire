# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0-mvp] - 2026-06-01
### Added
- Cross-platform paths (`src/lib/paths.js`) — Linux + Windows tested in CI matrix
- Zod-based config loader (`src/config/load.js`) with CLI > env > .env > defaults precedence
- Hardened RiskGate: path-escape detection, oversize content rejection (256 KiB), prompt-injection patterns
- SandboxManager with concurrent-mission detection (E_SANDBOX_BUSY)
- Structured pino logger (`src/lib/logger.js`)
- LLMClient interface + OpenAI implementation
- Zod schemas (Mission, Plan, Step, Verdict, Regression, ScopeDrift) — single source of truth
- Supervisor orchestrator: intake → diff → intent → tests → decision → verdict
- CLI binary `ai-empire` with `supervise`, `doctor`, `version` subcommands
- Three demo fixtures (`demo-pass`, `demo-reject`, `demo-fix`) + integration tests
- `npm run demo` runs supervise against `demo-pass` and exits 0
- GitHub Actions CI matrix: Ubuntu + Windows × Node 20 + 22

### Changed
- Repository restructured: `legacy_v3/` → `src/brain/`, `core/` → `src/core/`, `agents/` → `src/agents/`, `v4-supervisor/` → `src/supervisor/`
- Removed hardcoded `C:/AI-EMPIRE-MISSIONS` references (use `getMissionsRoot()` from `src/lib/paths.js`)

### Security
- Path-escape validation on every PATCH_FILE step
- Oversize content guard (256 KiB ceiling) on plans
- Prompt-injection pattern detection on plan.analysis

## [0.1.0] - 2026-06-01
### Added
- Initial public scaffold (Spec-Kit constitution + spec + plan + tasks)
