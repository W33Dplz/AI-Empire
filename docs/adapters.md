# Integration adapters

## What an adapter is

An adapter is a plug-in that tells AI-EMPIRE how to resolve a target: where the repo lives on disk, which branch the AI agent works on, which branch is the baseline for diffs, and what to do with the verdict once supervision completes (post a comment, label a PR, ping a webhook, etc.). Adapters let AI-EMPIRE supervise different vendors and conventions (Lovable, Bolt, generic git, internal tooling) without hardcoding any of them into the core engine.

## Adapter interface

The exact shape (from `specs/.../data-model.md`):

```js
export const adapter = {
  name: "my-adapter",
  async resolveTarget(opts) { return { repoPath, targetBranch, baselineBranch }; },
  async postRun(mission) { /* optional — post comment, mark PR, etc. */ },
};
```

- `name` — unique identifier used by the `--adapter <name>` flag.
- `resolveTarget(opts)` — receives raw CLI options (`repo`, `branch`, `baseline`, plus any adapter-specific keys) and returns the resolved triple AI-EMPIRE actually uses. May clone, fetch, or inspect the repo.
- `postRun(mission)` — optional. Called once after the verdict is written. Receives the full mission object (verdict, diff stats, transcript path). Use it to publish results.

## Built-in adapters

| Name      | When to use                                                                 | Resolution behavior                                                                                  |
|-----------|------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `default` | Any git repo where the user passes `--repo` and `--branch` explicitly.       | Returns the inputs as-is; baseline defaults to `main` unless `--baseline` is provided.               |
| `lovable` | Repos following the Lovable convention (AI agent commits to `lovable-dev`). | Forces `targetBranch = lovable-dev` and `baselineBranch = main` unless explicitly overridden.        |

## Writing your own

Step-by-step:

1. Create `src/integrations/<name>/adapter.js`.
2. Implement the interface above (`name`, `resolveTarget`, optionally `postRun`).
3. Register it in `src/integrations/registry.js` (TODO post-v1 — for now, fork the repo or open a PR).
4. Add a short doc/example under `docs/adapters/<name>.md` so other operators can discover it.
5. Test it end-to-end:
   ```bash
   ai-empire supervise --repo <path-or-url> --branch <branch> --adapter <name>
   ```

## Example — manifest-driven adapter

A 20-line adapter that reads a `.ai-empire.json` manifest at the root of the target repo to override defaults:

```js
import fs from "node:fs/promises";
import path from "node:path";

export const adapter = {
  name: "manifest",
  async resolveTarget(opts) {
    const repoPath = opts.repo;
    const manifestPath = path.join(repoPath, ".ai-empire.json");
    let manifest = {};
    try { manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")); } catch {}
    return {
      repoPath,
      targetBranch: manifest.targetBranch || opts.branch || "main",
      baselineBranch: manifest.baselineBranch || opts.baseline || "main",
    };
  },
  async postRun(mission) {
    const out = path.join(mission.repoPath, ".ai-empire.last-verdict.json");
    await fs.writeFile(out, JSON.stringify(mission.verdict, null, 2));
  },
};
```

## When to write an adapter vs a flag

- **Adapter** — when the resolution or post-run behavior is unique to a vendor / convention (Lovable's `lovable-dev` branch, posting a comment on a Linear ticket, reading a vendor-specific manifest).
- **Flag** — when the difference is just configuration of the default flow (changing the baseline branch, toggling a check, picking a model). Add a CLI flag to `default`, don't fork a new adapter.

Rule of thumb: if two adapters would share 90% of their code, you want a flag, not an adapter.
