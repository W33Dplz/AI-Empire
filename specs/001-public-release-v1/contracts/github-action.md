# GitHub Action Contract — `supervise`

This document is the public contract of the AI-EMPIRE GitHub Action. Breaking changes require a MAJOR action version bump (`v1`, `v2`, …).

## Usage

```yaml
# .github/workflows/ai-empire.yml in the consumer's repository
name: AI-EMPIRE supervise
on:
  push:
    branches: [lovable-dev]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write   # required to post the verdict comment

jobs:
  supervise:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # required so the supervisor can diff against the baseline

      - uses: W33Dplz/AI-Empire/.github/actions/supervise@v1
        with:
          branch: lovable-dev
          openai-key: ${{ secrets.OPENAI_API_KEY }}
```

The action is a **composite action** in the AI-EMPIRE repository at the path `.github/actions/supervise/`. It is referenced by tag (`@v1`, `@v0.2.0`, …) — never by branch — in consumer workflows. The repository maintains floating `v1` / `v2` tags pointing to the latest compatible release.

## Inputs

| Name | Required | Default | Description |
|---|---|---|---|
| `repo` | no | `.` (the runner workspace) | Path to the target repository relative to the runner workspace. |
| `branch` | yes | — | The volatile branch to supervise. |
| `baseline` | no | `main` | Branch to diff against. |
| `openai-key` | yes | — | OpenAI API key. Pass from a repository secret, never inline. |
| `model` | no | `gpt-4o-mini` | Underlying LLM model. |
| `adapter` | no | `default` | Integration adapter (e.g. `lovable`). |
| `max-fix-attempts` | no | `1` | Maximum auto-fix iterations. |
| `report-path` | no | `ai-empire-report.md` | Where to write the markdown report inside the workspace. |
| `comment-on-pr` | no | `true` | Post the verdict as a PR comment when triggered by `pull_request`. |
| `fail-on` | no | `reject` | Exit-code policy: `reject` (fail only on REJECT), `fix-or-reject` (fail on FIX and REJECT), `never` (always succeed). |
| `dry-run` | no | `false` | Skip LLM calls; use deterministic mock plan. |
| `log-level` | no | `info` | Pino log level on the action's log stream. |

## Outputs

| Name | Type | Description |
|---|---|---|
| `verdict` | string | One of `PASS`, `FIX`, `REJECT`. |
| `score` | string (int as string) | Composite score `0`–`100`. |
| `report-path` | string | Path to the generated report (relative to workspace). |
| `report-url` | string | URL to the uploaded artefact (if `--upload-artefact: true`). |
| `regressions-count` | string (int as string) | Number of regressions detected. |
| `mission-id` | string | UUID of the supervision mission. |

Consumers read outputs with `steps.<id>.outputs.<name>` in subsequent steps.

## Side effects on the consumer repository

1. **Report artefact** — the action uploads `report-path` as a workflow artefact named `ai-empire-report-<mission-id>` (unless `upload-artefact: false`).
2. **PR comment** — when triggered on a `pull_request` event and `comment-on-pr` is `true`, the action posts a comment authored by `github-actions[bot]` containing the verdict summary, regressions table, and a collapsible details section. Multiple invocations on the same PR edit the same comment (idempotent via a marker `<!-- ai-empire:<mission-id> -->`).
3. **Check status** — implicit via the action's exit code. Use `fail-on: reject` for soft-blocking, `fail-on: fix-or-reject` for hard-blocking.

## What the action does NOT do

- It never writes to the consumer's target branch.
- It never opens, closes, or merges pull requests.
- It never modifies repository settings, branch protection rules, or secrets.
- It never reads workflow secrets other than `openai-key`.
- It never makes network calls outside `api.openai.com`, the GitHub API (via `gh`), and the consumer's git remote.

## Failure modes

| Situation | Action behaviour | Exit code |
|---|---|---|
| Missing `openai-key` secret | Fails fast with a clear error in the log. | non-zero |
| Target branch doesn't exist | Fails with error `E_BRANCH_NOT_FOUND`. | non-zero |
| OpenAI rate limit | Retries with exponential backoff (3 attempts), then fails with `E_LLM_UNREACHABLE`. | non-zero |
| Supervisor crashes mid-run | Uploads partial logs as the artefact; report is empty. | non-zero |
| Workflow runner runs out of disk | Fails with `E_DISK_FULL`. | non-zero |

## Permissions required

The minimum permissions block for a consumer workflow:

```yaml
permissions:
  contents: read           # for actions/checkout
  pull-requests: write     # only if comment-on-pr is true (default)
```

If `comment-on-pr: false`, only `contents: read` is required.

## Versioning

| Tag | What it points to |
|---|---|
| `@v1` | Floating; latest `v1.x.y` release of AI-EMPIRE. Recommended for most users. |
| `@v1.0.0` | Pinned to a specific release. Recommended for reproducibility. |
| `@main` | Tip of `main`. Not recommended; can break consumers without warning. |

Breaking changes to inputs, outputs, or behaviour described in this document only land in a new major tag.

## Performance expectations

| Repository size | Cold-runner wall-clock (target) |
|---|---|
| < 5k LOC | < 3 min |
| 5k – 50k LOC | < 6 min |
| > 50k LOC | < 12 min |

These are wall-clock targets including `actions/checkout`, sandbox clone, `npm install`, build, lint, test, supervisor scoring, and report upload. LLM latency dominates for small repos; `npm install` dominates for large ones.

## Out of scope for v1.0.0

- Self-hosted runner support (works in theory; not tested or documented).
- Caching the supervisor's own dependencies between runs (relies on the runner-level `actions/setup-node` cache).
- Polyglot project support (Python, Go, Rust). v1.0.0 assumes a Node-with-`package.json` target.
- Branching off the supervisor's report into an automatic fix PR. Charles asked to keep the action read-only-on-consumer for v1.0.0.

These will be tracked as future spec-kit features once v1.0.0 is shipped.
