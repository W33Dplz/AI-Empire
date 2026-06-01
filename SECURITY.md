# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2   | :x:                |

## Reporting a vulnerability

Email **charles.debellefroid@gmail.com** with the subject line:

```
AI-EMPIRE SECURITY: <short description>
```

You can expect an initial response within **72 hours**.

**Do NOT open public GitHub issues for vulnerabilities.** Public disclosure
before a fix is shipped puts users at risk.

## Known risk model

AI-EMPIRE is explicit about the threat surface it manages:

- **LLM-generated plans execute JavaScript inside a sandboxed clone**, never
  directly on the target repository. The target is treated as input data.
- **`PATCH_FILE` steps are validated by RiskGate** before being applied:
  path-escape detection, oversize rejection, single-patch enforcement, and
  prompt/injection-pattern scanning.
- **`npm test` runs inside the sandbox** with a default **60-second timeout**
  to prevent runaway processes or resource exhaustion.

## Out of scope

The following are intentionally **not** covered by this security policy:

- **npm dependency confusion** — we publish a single package; consumers are
  expected to pin versions and verify their own supply chain.
- **Target repository contents** — repositories passed in as work targets are
  treated as data, not as trusted code. Their behavior is not our threat model.
- **LLM provider security** — OpenAI is a trust dependency in v1. Compromise
  or misbehavior of the upstream provider is out of scope.

## Hall of fame

_No reports yet._
