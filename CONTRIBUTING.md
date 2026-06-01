# Contributing to AI-EMPIRE

Thanks for considering a contribution. AI-EMPIRE is an open-source orchestration framework, and we welcome bug reports, fixes, new integration adapters, docs improvements, and ideas.
Before opening a large PR, please open an issue first so we can align on direction.

## Spec-driven workflow

AI-EMPIRE follows a spec-driven development flow inspired by Spec-Kit. The pipeline is:

**constitution → spec → plan → tasks → implement**

1. **Constitution** — the project's non-negotiable principles live in [`.specify/memory/constitution.md`](.specify/memory/constitution.md). Every spec, plan, and PR must be consistent with it.
2. **Spec** — the feature specification (the "what" and "why", no implementation detail). See [`specs/001-public-release-v1/spec.md`](specs/001-public-release-v1/spec.md).
3. **Plan** — the technical plan (the "how", stack choices, architecture). See [`specs/001-public-release-v1/plan.md`](specs/001-public-release-v1/plan.md).
4. **Tasks** — the ordered, dependency-aware task list derived from the plan. See [`specs/001-public-release-v1/tasks.md`](specs/001-public-release-v1/tasks.md).
5. **Implement** — execute tasks one at a time, in order, with tests.

For non-trivial features, create a new feature folder under `specs/` and follow the same five-step flow. Skipping straight to code without a spec is discouraged.

## Dev setup

```bash
git clone https://github.com/W33Dplz/AI-Empire.git
cd AI-Empire
npm install
npm test
npm run demo
```

`npm run demo` runs the end-to-end demo flow and is the fastest way to confirm your local install works.

## Running tests locally

```bash
npm test                # full test suite, one shot
npm run test:watch      # watch mode, re-runs on file change
npm run test:coverage   # full suite with coverage report
```

Tests live next to the code they cover. New code should ship with tests in the same PR.

## Writing a new integration adapter

Integration adapters are how AI-EMPIRE talks to external systems (CI, ticketing, chat, etc.). The full guide is in [`docs/adapters.md`](docs/adapters.md).

In short, an adapter is an object exposing:

- `name` — unique string identifier
- `resolveTarget(input)` — resolves the adapter's target from user input
- `postRun(result)` — hook invoked after a run completes

Once implemented, register the adapter through the standard registration entry point documented in `docs/adapters.md`. Add tests covering `resolveTarget` and `postRun` behavior.

## Code style

The project uses **ESLint + Prettier**. Before opening a PR:

```bash
npm run lint     # check for lint errors
npm run format   # auto-format with Prettier
```

CI will reject PRs that fail lint.

## Commit messages

We follow **[Conventional Commits](https://www.conventionalcommits.org/)**. Use one of:

- `feat:` — new user-facing feature
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — tooling, deps, repo maintenance
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests

Example: `feat(adapters): add Slack notification adapter`

## Pull request checklist

Before requesting review, confirm:

- [ ] Tests added/updated (failing first, then passing)
- [ ] `npm run lint` clean
- [ ] `npm test` green
- [ ] `CHANGELOG.md` updated under `## [Unreleased]`
- [ ] Docs touched if user-facing surface changed

## Reporting issues

- **Bugs and feature requests** — open an issue on GitHub with a clear repro and the version of AI-EMPIRE you're running.
- **Security vulnerabilities** — do **not** open a public issue. Follow the disclosure process in [`SECURITY.md`](SECURITY.md).
