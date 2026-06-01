# CLI Contract — `ai-empire`

This is the public contract of the `ai-empire` CLI binary. Breaking changes to anything documented here require a MAJOR version bump.

## Invocation

```bash
ai-empire <command> [options]
npx ai-empire <command> [options]
```

The binary is published on npm as `ai-empire` and exposes the entry `bin/ai-empire`.

## Commands

### `supervise` — primary command (MVP)

Run a complete supervision pass on a target repository.

```bash
ai-empire supervise --repo <path> --branch <name> [options]
```

#### Required flags

| Flag | Type | Description |
|---|---|---|
| `--repo <path>` | absolute or relative path | Path to the target git repository. Must exist and be a valid git repo. |
| `--branch <name>` | string | The volatile branch to supervise (e.g. `lovable-dev`, `dev`, `feature-x`). |

#### Optional flags

| Flag | Type | Default | Description |
|---|---|---|---|
| `--baseline <name>` | string | `main` | Branch to diff against. |
| `--report-path <path>` | path | `./ai-empire-report.md` | Where to write the markdown report. |
| `--missions-root <path>` | path | `~/.ai-empire/missions` (or `%USERPROFILE%\.ai-empire\missions` on Windows) | Root for sandbox storage. |
| `--adapter <name>` | string | `default` | Integration adapter. Built-in: `default`, `lovable`. |
| `--model <id>` | string | `gpt-4o-mini` | OpenAI model for plan generation. |
| `--max-fix-attempts <n>` | integer | `1` | Maximum auto-fix iterations. `0` disables auto-fix entirely. |
| `--keep-sandbox` | boolean | `false` | Don't delete the sandbox after a successful run. Useful for debugging. |
| `--dry-run` | boolean | `false` | Skip LLM calls; use mocked plan. Used in tests and CI smoke runs. |
| `--log-level <level>` | enum: `trace` / `debug` / `info` / `warn` / `error` | `info` | Pino log level on stderr. |
| `--log-format <fmt>` | enum: `pretty` / `json` | `pretty` | Stderr log format. |
| `--no-color` | boolean | (auto-detected) | Disable ANSI colors. |
| `--help` | boolean | | Show command help. |

#### Stdout vs stderr

- **stdout** — the rendered markdown report (also written to `--report-path`). Suitable for `| less`, redirection to a file, or capturing in CI.
- **stderr** — structured logs (Pino). Never used for the report itself.

#### Exit codes

| Code | Meaning |
|---|---|
| `0` | Verdict is `PASS`. Target is safe to merge. |
| `1` | Verdict is `FIX` — fixes were attempted; report describes outcome. Human review recommended. |
| `2` | Verdict is `REJECT`. Target is not safe to merge. |
| `10` | `E_NO_GIT` — `--repo` is not a git repository. |
| `11` | `E_BRANCH_NOT_FOUND` — `--branch` does not exist in the target. |
| `12` | `E_BASELINE_NOT_FOUND` — `--baseline` does not exist. |
| `20` | `E_NO_OPENAI_KEY` — env `OPENAI_API_KEY` missing and no `.env` provides one. |
| `21` | `E_LLM_UNREACHABLE` — OpenAI API unreachable after retries. |
| `22` | `E_LLM_INVALID_PLAN` — LLM returned an unparseable plan after retries. |
| `30` | `E_SANDBOX_BUSY` — another mission is using the target. |
| `31` | `E_DISK_FULL` — sandbox creation failed. |
| `40` | `E_INVALID_CONFIG` — config (flags / env / .env) failed Zod validation. |
| `99` | `E_INTERNAL` — uncaught error. |

#### Acceptance scenarios (from `spec.md`)

1. Clean repo, all tests pass:
   ```bash
   ai-empire supervise --repo ./demo --branch dev
   # → stdout: markdown report, verdict: PASS
   # → exit code 0
   ```
2. Broken `package.json`:
   ```bash
   ai-empire supervise --repo ./broken --branch dev
   # → stdout: report names broken file
   # → exit code 2
   ```
3. Missing OPENAI key:
   ```bash
   unset OPENAI_API_KEY
   ai-empire supervise --repo ./demo --branch dev
   # → stderr: clear error pointing to .env.example
   # → exit code 20
   ```

### `doctor` — environment diagnostics

```bash
ai-empire doctor
```

Checks: Node version ≥ 20, `OPENAI_API_KEY` set, `MISSIONS_ROOT` writable, OpenAI API reachable, `git` on PATH. Prints a human-readable checklist and exits `0` if all green, `1` otherwise.

### `version` — print version

```bash
ai-empire --version
ai-empire version
```

Prints `ai-empire@X.Y.Z` and the Node version.

## Configuration precedence

For any setting, the resolved value is the first present in this order:

1. CLI flag (`--foo bar`)
2. Environment variable (`AI_EMPIRE_FOO=bar`)
3. `.env` file in the current working directory
4. Compiled-in default

Environment variable names mirror the long flag name, kebab → screaming-snake with the `AI_EMPIRE_` prefix. Examples:

| Flag | Env var |
|---|---|
| `--repo` | `AI_EMPIRE_REPO` |
| `--branch` | `AI_EMPIRE_BRANCH` |
| `--missions-root` | `AI_EMPIRE_MISSIONS_ROOT` |
| `--model` | `AI_EMPIRE_MODEL` |
| `--log-level` | `AI_EMPIRE_LOG_LEVEL` |

`OPENAI_API_KEY` is the conventional name (not prefixed) for compatibility with the broader OpenAI ecosystem.

## Stability guarantees

- Exit codes listed above are stable across MINOR / PATCH versions.
- Long flag names are stable across MINOR / PATCH versions.
- Short flag names (single-letter aliases) are stable across PATCH versions only.
- The markdown report's *headings and section order* are stable; the prose under them is not.
- Pino JSON log event names are stable across MINOR / PATCH versions.

## Out of scope for v1.0.0

- Watch mode (`--watch`).
- Streaming the report to stdout as it generates.
- Custom output formats (HTML, JUnit XML).
- Interactive remediation (`--fix-interactive`).
- Anthropic / local LLM providers (`--provider`).
- Polyglot package managers (yarn / pnpm / bun). v1.0.0 assumes `npm`.

These are tracked in `specs/` future features.
