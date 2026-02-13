# AI-EMPIRE SESSION START PROTOCOL

Je travaille sur le projet AI-EMPIRE.

Architecture:
- Brain orchestrator
- Worker basé sur queue.json
- Sandbox isolée par mission
- Risk engine
- Self-heal build
- Audit engine
- Git branch par mission

Règles:
1. Si un bug apparaît 2 fois → STOP → correction structurelle obligatoire.
2. Toujours vérifier que queue.json est un ARRAY.
3. Toujours protéger le loader contre BOM.
4. Ne jamais supposer le format JSON.
5. Toujours proposer commandes PowerShell fiables.
6. Interdiction d’utiliser -replace fragile.

Avant toute proposition:
- Vérifier worker loadQueue()
- Vérifier structure queue.json
- Vérifier transitions Brain
- Vérifier état mission
