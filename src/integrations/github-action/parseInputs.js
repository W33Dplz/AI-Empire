export function parseActionInputs(env = process.env) {
  const repo = env.INPUT_REPO;
  const branch = env.INPUT_BRANCH;
  const openaiKey = env.INPUT_OPENAI_KEY;
  const reportPath = env.INPUT_REPORT_PATH || "./ai-empire-report.md";
  if (!repo) throw new Error("INPUT_REPO is required");
  if (!branch) throw new Error("INPUT_BRANCH is required");
  return { repo, branch, openaiKey, reportPath };
}
