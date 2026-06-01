/**
 * Intent classifier for AI-EMPIRE supervisor.
 *
 * Classifies a change set (added/modified/deleted files + commit messages)
 * into one of: feature, refactor, chore, breaking, unknown.
 *
 * Heuristics are applied in order; the first match wins.
 */

const DOC_CONFIG_BASENAME_RE = /^(README|CHANGELOG|LICENSE|.+\.md|.+\.json|\.[a-z]+)$/i;
const SRC_FILE_RE = /^src\/.+\.(js|mjs|ts)$/;

function basename(path) {
  const idx = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return idx === -1 ? path : path.slice(idx + 1);
}

function isDocOrConfig(path) {
  if (!path) return false;
  if (path.startsWith("docs/")) return true;
  if (path.startsWith(".github/")) return true;
  const base = basename(path);
  if (/^\.[a-z]+rc$/.test(base)) return true;
  return DOC_CONFIG_BASENAME_RE.test(base);
}

export function classifyIntent({ files, commitMessages } = {}) {
  const added = (files && files.added) || [];
  const modified = (files && files.modified) || [];
  const deleted = (files && files.deleted) || [];
  const messages = Array.isArray(commitMessages) ? commitMessages : [];

  const total = added.length + modified.length + deleted.length;
  const msg = messages.join(" \n ").toLowerCase();

  // 1. No changes
  if (total === 0) {
    return {
      intent: "unknown",
      confidence: "LOW",
      reasons: ["no file changes detected"],
    };
  }

  // 2. Breaking
  const hasBreakingMsg =
    msg.includes("breaking change") || msg.includes("breaking:");
  const deletedSourceFile = deleted.find((f) => SRC_FILE_RE.test(f));
  if (hasBreakingMsg || deletedSourceFile) {
    const reasons = [];
    if (hasBreakingMsg) {
      reasons.push("commit message signals breaking change");
    }
    if (deletedSourceFile) {
      reasons.push(`deleted source file: ${deletedSourceFile}`);
    }
    return { intent: "breaking", confidence: "HIGH", reasons };
  }

  // 3. Chore (docs/config)
  const allFiles = [...added, ...modified, ...deleted];
  if (allFiles.length > 0 && allFiles.every(isDocOrConfig)) {
    return {
      intent: "chore",
      confidence: "HIGH",
      reasons: ["all changed files are docs or config"],
    };
  }

  // 4. Feature
  const addedSrc = added.find((f) => f.startsWith("src/"));
  const hasFeatMsg = msg.includes("feat:") || msg.includes("feature:");
  if (addedSrc || hasFeatMsg) {
    const reasons = [];
    if (addedSrc) reasons.push(`added source file: ${addedSrc}`);
    if (hasFeatMsg) reasons.push("commit message signals feature");
    return { intent: "feature", confidence: "HIGH", reasons };
  }

  // 5. Refactor (modifications-only inside src/)
  if (
    added.length === 0 &&
    deleted.length === 0 &&
    modified.length > 0 &&
    modified.every((f) => f.startsWith("src/"))
  ) {
    return {
      intent: "refactor",
      confidence: "HIGH",
      reasons: ["only src/ files modified, no additions or deletions"],
    };
  }

  // 6. Refactor (message)
  if (msg.includes("refactor")) {
    return {
      intent: "refactor",
      confidence: "MEDIUM",
      reasons: ["commit message mentions refactor"],
    };
  }

  // 7. Chore (message)
  if (msg.includes("chore")) {
    return {
      intent: "chore",
      confidence: "MEDIUM",
      reasons: ["commit message mentions chore"],
    };
  }

  // 8. Fallback
  return {
    intent: "unknown",
    confidence: "LOW",
    reasons: ["no heuristic matched"],
  };
}

export default classifyIntent;
