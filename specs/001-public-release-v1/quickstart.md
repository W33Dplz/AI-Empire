# Quickstart — AI-EMPIRE in 5 minutes

From zero to your first PASS / FIX / REJECT verdict on a real codebase, with no edits to the commands below.

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **git** (any recent version)
- **OpenAI API key** (optional — only needed for full LLM runs; the `--dry-run` flow works offline)

Quick check:

```bash
node -v        # should print v20.x.x or higher
git --version  # any recent version
```

If you plan to do a full (non-dry) run, export your key:

```bash
export OPENAI_API_KEY="sk-..."        # macOS / Linux
setx OPENAI_API_KEY "sk-..."          # Windows (new shell after)
```

## Install

Global install (recommended for repeated use):

```bash
npm i -g ai-empire
```

Or one-shot via `npx` (no install):

```bash
npx ai-empire --help
```

## Verify install

```bash
node -v
ai-empire --version
ai-empire doctor
```

`ai-empire doctor` checks Node version, git availability, `OPENAI_API_KEY` presence, and write access to the report directory. Expected last line: `doctor: OK`.

## First run on a sample fixture

Clone the repo to get the bundled fixtures, then run the supervisor in dry-run mode (no LLM calls, deterministic output):

```bash
git clone https://github.com/W33Dplz/AI-Empire.git
cd AI-Empire
ai-empire supervise --repo tests/fixtures/demo-pass --branch main --dry-run
```

Expected stdout (abbreviated):

```
ai-empire v1.0.0 — supervise
repo:    tests/fixtures/demo-pass
branch:  main
mode:    dry-run (no LLM calls)

[1/4] Loading repo state ............ OK
[2/4] Running adapters .............. OK (lint, typecheck, tests)
[3/4] Scoring ....................... OK
[4/4] Writing report ................ OK

──────────────────────────────────────────
Verdict: PASS
Score:   100 / 100
Reasons: all gates green; no regressions detected
Report:  ./ai-empire-report.md
──────────────────────────────────────────
exit 0
```

Exit code `0` confirms PASS.

## First run on your project

Point the supervisor at any local repo and branch:

```bash
ai-empire supervise --repo /path/to/your/repo --branch dev --dry-run
```

**`--dry-run` vs full run**:

- `--dry-run` — runs the deterministic adapters (lint, typecheck, tests) and scoring, but **skips the LLM review pass**. Free, offline, fast (~10–60s). Use for CI smoke and first contact.
- Full run (drop `--dry-run`) — same adapters **plus** an LLM verdict over the diff and execution log. Requires `OPENAI_API_KEY`. Slower (~1–3 min) and incurs API cost.

## Reading the report

By default the report is written to `./ai-empire-report.md` in the current working directory. Override with `--report-path`:

```bash
ai-empire supervise --repo . --branch main --dry-run --report-path ./reports/verdict.md
```

Report sections:

- **Verdict** — `PASS`, `FIX`, or `REJECT` (the single line that matters)
- **Reasons** — bullet list explaining the verdict in plain English
- **Regressions** — diff-scoped findings: new failures, new warnings, coverage drops
- **Execution log** — full stdout/stderr of every adapter, in run order, for debugging

Open the report in any markdown viewer, or grep it:

```bash
grep -E "^Verdict:" ./ai-empire-report.md
```

## Exit codes

| Code | Meaning | When |
|------|---------|------|
| `0`  | PASS    | All gates green, no regressions |
| `1`  | FIX     | Recoverable issues; report lists exact steps |
| `2`  | REJECT  | Structural / governance failure; do not merge |
| `10` | `E_CONFIG`   | Invalid CLI flags or missing config |
| `11` | `E_REPO`     | Repo path missing, not a git repo, or unreadable |
| `12` | `E_BRANCH`   | Branch not found |
| `13` | `E_ADAPTER`  | Adapter crashed (lint/test runner missing) |
| `14` | `E_LLM`      | LLM call failed (network, auth, rate limit) |
| `15` | `E_REPORT`   | Cannot write report file |

Full mapping and flag reference: see [`contracts/cli.md`](./contracts/cli.md).

Use in CI:

```bash
ai-empire supervise --repo . --branch "$GITHUB_REF_NAME" --dry-run
case $? in
  0) echo "PASS — merge OK" ;;
  1) echo "FIX — see report" ; exit 1 ;;
  2) echo "REJECT — block merge" ; exit 1 ;;
  *) echo "Tool error code $?" ; exit 1 ;;
esac
```

## Next steps

- Contribute an adapter or fix: [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
- How the supervisor is wired: [`docs/architecture.md`](../../docs/architecture.md)
- Write your own adapter (Python, Go, Rust, ...): [`docs/adapters.md`](../../docs/adapters.md)
