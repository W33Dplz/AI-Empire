# AI-EMPIRE

> Supervise AI-generated code before it lands on your protected branch.

🚧 **v0.2.0-mvp — public preview.** Local CLI works. GitHub Action arriving in v0.3.0.

![CI](https://github.com/W33Dplz/AI-Empire/actions/workflows/ci.yml/badge.svg)
![npm](https://img.shields.io/npm/v/ai-empire.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

---

## What it is

AI-EMPIRE is a CLI that supervises code-generation output (Lovable, Cursor, Copilot, any LLM agent) **before merge**. It runs your repo's build, lint, and tests in an isolated sandbox, classifies the commit's intent, detects scope drift, and emits a pass/fail verdict with reasons — so reviewers stop rubber-stamping diffs they didn't read.

---

## 30-second demo

```bash
npx ai-empire supervise --repo ./my-app --branch dev --dry-run
```

Sample output (abbreviated):

```
[intake]   ./my-app @ dev — 7 files changed
[intent]   feat: add Stripe checkout (confidence 0.91)
[tests]    npm run build  PASS (12.3s)
           npm run lint   PASS
           npm test       PASS (24/24)
[scope]    drift score 0.08 — within declared intent
[verdict]  APPROVE — safe to merge
```

---

## 5-minute quickstart

1. **Install**
   ```bash
   npm i -g ai-empire
   # or one-shot:
   npx ai-empire --help
   ```

2. **Set your key** (skip if running `--dry-run`)
   ```bash
   export OPENAI_API_KEY=sk-...
   ```

3. **Run on your repo**
   ```bash
   ai-empire supervise --repo . --branch feature/checkout
   ```

4. **Read the report** — JSON written to `.ai-empire/report.json`, human summary printed to stdout.

---

## CLI reference

| Command | Description | Example |
|---|---|---|
| `supervise` | Run the full pipeline on a repo + branch | `ai-empire supervise --repo . --branch dev` |
| `doctor` | Check environment (Node version, git, API key, sandbox dir) | `ai-empire doctor` |
| `version` | Print CLI version and build info | `ai-empire version` |

Full flag reference: [`docs/cli.md`](docs/cli.md) (generated from [`specs/001-public-release-v1/contracts/cli.md`](specs/001-public-release-v1/contracts/cli.md)).

---

## GitHub Action

v0.3.0 ships a composite action — see [`docs/github-action.md`](docs/github-action.md) (work in progress).

---

## Architecture in 30 seconds

```
intake → diff → intent → tests → decision → verdict
```

- **intake** — clone target repo into isolated sandbox
- **diff** — extract changed files vs base branch
- **intent** — classify what the commit claims to do (LLM-assisted)
- **tests** — run `build` / `lint` / `test` in sandbox
- **decision** — compare claimed intent vs actual impact, score scope drift
- **verdict** — APPROVE / REJECT / REVIEW with structured reasons

Deep dive: [`docs/architecture.md`](docs/architecture.md).

---

## FAQ

**Does it modify my code?**
No. AI-EMPIRE clones your repo into a sandbox directory and operates there. Your working tree is untouched.

**Which LLMs does it support?**
OpenAI (`gpt-4o-mini` by default) in v1. Anthropic and local-model adapters are on the v0.4.0 roadmap.

**How much does a run cost?**
~$0.05 per run with `gpt-4o-mini` on a typical 10-file diff. Use `--dry-run` for $0.

**Does it work on Windows?**
Yes. Tested in CI matrix (Ubuntu, macOS, Windows).

**Can I write a custom adapter for my LLM or CI?**
Yes — see [`docs/adapters.md`](docs/adapters.md).

---

## Contributing

PRs welcome. Start with [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## License

MIT — see [`LICENSE`](LICENSE).
