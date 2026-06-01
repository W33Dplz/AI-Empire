# lovable-demo

Reference target repository for AI-EMPIRE screencasts and demos.

This minimal Node app exists so the AI-EMPIRE pipeline has a real, runnable
target to operate on during recorded walkthroughs:

- `index.js` exposes a tiny `handler(req)` function (no framework dep).
- `test.js` uses the built-in `node:test` runner to verify behavior.
- `npm test` is the canonical green-bar command shown on screen.
- `.github/workflows/ai-empire.yml` wires the repo into the AI-EMPIRE CI.

Do not use this as a production template — it is intentionally bare.
