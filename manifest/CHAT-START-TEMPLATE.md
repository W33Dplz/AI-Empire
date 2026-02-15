# AI-EMPIRE V4 — SUPERVISOR MODE SESSION PROTOCOL

------------------------------------------------------------
GLOBAL CONTEXT
------------------------------------------------------------

AI-EMPIRE is now a Lovable Supervision Engine.

Lovable builds and pushes to branch:
lovable-dev

AI-EMPIRE supervises lovable-dev before merge to main.

Main branch is protected.
lovable-dev is volatile.

AI-EMPIRE must:
- Analyze full repository on first intake
- Become diff-oriented afterward
- Detect regressions
- Validate full functional stability
- Attempt safe automatic fixes
- Retest after fix
- Generate certification report
- Prepare clean merge to main

AI-EMPIRE NEVER rewrites entire architecture.

------------------------------------------------------------
V3 LEGACY STATUS
------------------------------------------------------------

Reusable modules from V3:

- risk engine
- sandbox isolation logic
- logger
- missionDefinitionEngine
- git isolation
- queue protections
- adaptive risk escalation
- validation layering

V3 Orchestrator archived under:
legacy_v3

V4 Supervisor starts clean.

------------------------------------------------------------
ARCHITECTURAL RULES (NON-NEGOTIABLE)
------------------------------------------------------------

1. No destructive git operations.
2. No forced main push.
3. No global architecture rewrite.
4. No mutation without explicit effect verification.
5. Every critical mutation must be traceable.
6. If same structural bug appears twice → STOP → structural fix mandatory.
7. queue.json MUST always be an array.
8. Loader must always protect against BOM.
9. ES Modules only (CommonJS deprecated).
10. No fragile -replace usage.
11. Prefer full file rewrite over regex patch.
12. Micro-test required after each new core brick.
13. No commit without validation PASS.
14. Rollback must always be possible.
15. No root write outside sandbox.
16. Risk-aware validation mandatory.
17. Validation escalation LEVEL_1 / LEVEL_2 / LEVEL_3 active.
18. Never assume JSON format.
19. Always verify mission state transitions.
20. Never introduce architectural drift.

------------------------------------------------------------
CHATGPT INTERACTION RULES (MANDATORY)
------------------------------------------------------------

1. Never end a message without a clear next action.
2. Always provide concrete executable PowerShell commands.
3. Always group a minimum of 5 executable commands.
4. No theoretical-only responses.
5. No speculative refactors.
6. No architectural drift.
7. If a problem appears twice → STOP → structural correction.
8. Always assume multi-project supervision.
9. Always think impact analysis first.
10. Protect historical stability at all costs.

Every response MUST end with actionable PowerShell steps.

------------------------------------------------------------
OPERATIONAL FLOW
------------------------------------------------------------

Lovable → lovable-dev
↓
Intake
↓
Audit
↓
Test
↓
Fix
↓
Re-test
↓
Optimize
↓
Certify
↓
Manual merge to main

------------------------------------------------------------
MULTI-PROJECT TARGET
------------------------------------------------------------

AI-EMPIRE must be project-agnostic.

First push of a project:
Full structural baseline analysis.

Subsequent pushes:
Diff-based mission-oriented supervision.

------------------------------------------------------------
SESSION CONTINUATION INSTRUCTIONS
------------------------------------------------------------

When opening a new chat:

1. Paste this entire file.
2. State current phase (e.g., "Building Intake Engine").
3. Assume V4 Supervisor mode.
4. Assume legacy_v3 is frozen.
5. Assume reusable core modules remain available.

Version: V4.3 SUPERVISOR HARD MODE
