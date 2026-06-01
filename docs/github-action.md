# AI-EMPIRE GitHub Action

Run AI-EMPIRE supervision automatically on every push or pull request. The action checks out your repo, runs `ai-empire supervise`, uploads the report as an artifact, and posts a verdict comment on the PR.

## 3-step install

**Step 1 — Copy the workflow file**

Copy [`examples/lovable-demo/.github/workflows/ai-empire.yml`](../examples/lovable-demo/.github/workflows/ai-empire.yml) into your own repository at the same path: `.github/workflows/ai-empire.yml`.

**Step 2 — Add your OpenAI key as a repo secret**

Go to **Settings → Secrets and variables → Actions → New repository secret**:
- Name: `OPENAI_API_KEY`
- Value: your OpenAI API key (starts with `sk-...`)

**Step 3 — Push to the watched branch**

Push a commit to `lovable-dev` (or whichever branch is configured in the workflow `on:` trigger). The action runs, uploads `ai-empire-report.md` as an artifact, and — if the run is tied to a pull request — posts a verdict comment.

## Inputs

| Input          | Description                                              | Default                  |
|----------------|----------------------------------------------------------|--------------------------|
| `repo`         | Repository slug to supervise (`owner/name`)              | `${{ github.repository }}` |
| `branch`       | Branch to supervise                                      | `${{ github.ref_name }}` |
| `openai-key`   | OpenAI API key (pass via `secrets.OPENAI_API_KEY`)       | *(required)*             |
| `report-path`  | Path where the markdown report is written                | `ai-empire-report.md`    |
| `dry-run`      | If `true`, runs supervision without posting comments     | `false`                  |

## Outputs

| Output                  | Description                                        |
|-------------------------|----------------------------------------------------|
| `verdict`               | One of `PASS`, `FIX`, or `REJECT`                  |
| `report-artifact-path`  | Path to the uploaded report artifact               |

Downstream steps can read the verdict via `${{ steps.<id>.outputs.verdict }}` to gate deploys, tags, or follow-up jobs.

## Required permissions

The workflow needs the following permissions block:

```yaml
permissions:
  pull-requests: write   # to post the verdict comment
  contents: read         # to checkout the repo
```

Without `pull-requests: write`, the action runs but cannot post the verdict comment on PRs.

## Troubleshooting

- **`Action fails with E_NO_OPENAI_KEY`** → The `OPENAI_API_KEY` secret is missing or not exposed to the workflow. Re-check **Settings → Secrets and variables → Actions** and confirm the secret name matches the workflow reference.
- **`Action says E_BRANCH_NOT_FOUND`** → The checkout step is missing `fetch-depth: 0`. AI-EMPIRE needs the full git history to diff against the base branch. Add `with: { fetch-depth: 0 }` to your `actions/checkout` step.
- **No comment posted on the PR** → The workflow is missing `permissions: pull-requests: write`. Add the permissions block shown above.
- **Action runs but the verdict looks wrong** → Reproduce locally with the same flags:
  ```bash
  ai-empire supervise --repo <owner/name> --branch <branch> --report ai-empire-report.md
  ```
  Compare the local report to the artifact uploaded by the action. Any divergence is a bug — open an issue.

## Acceptance scenarios

From the v1.0.0 spec:

- **Push to `lovable-dev`** → an `AI-EMPIRE / supervise` check appears on the associated PR within **5 minutes** → a verdict comment (`PASS` / `FIX` / `REJECT`) is posted with a link to the full report artifact.
