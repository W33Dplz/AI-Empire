# AI-EMPIRE

Orchestrateur multi-agents pour superviser, auditer et certifier le code généré automatiquement (typiquement par [Lovable](https://lovable.dev)) avant merge sur une branche protégée.

> **Statut : prototype expérimental (V4.2 baseline).** Le cœur V3 (worker + agents + sandbox) tourne. La couche V4 « Supervisor » est à l'état de squelette : architecture posée, modules de scoring/décision partiellement implémentés. Pas de tests automatisés à ce jour. Pas adapté à un usage production.

---

## Concept

```
Lovable (UI-builder)
       │
       ▼  push
   lovable-dev ───────────┐
                          │
                          ▼
                     AI-EMPIRE
                          │
                          ├─ audit structurel & diff
                          ├─ exécution npm build / lint / test
                          ├─ fix automatique si possible
                          ├─ détection de régression & scope drift
                          └─ certification
                          │
                          ▼  merge manuel
                        main (protégée)
```

Le principe : `main` est sacrée, `lovable-dev` est volatile. AI-EMPIRE est le filtre qualité entre les deux.

---

## Stack

- **Runtime** : Node.js ESM (`"type": "module"`)
- **Dépendances** : `openai` (SDK v4), `simple-git`, `dotenv`
- **OS supporté** : Windows uniquement (chemins `C:/AI-EMPIRE-MISSIONS/` hardcodés)
- **Persistance** : `queue.json` (jobs), `memory/` (plans + missions), `sandbox/` (clones isolés)

---

## Structure

```
AI-Empire/
├── worker.js                  # entrypoint — poll queue.json toutes les 2s
├── queue.json                 # file d'attente des missions
├── core/                      # logger, riskEngine, sandboxManager, missionDefinition
├── agents/                    # devAgent, gitAgent, testAgent, auditAgent
├── legacy_v3/orchestrator/    # Brain V3 (toujours utilisé par worker.js)
├── v4-supervisor/             # V4 Supervisor — squelette
│   ├── intent/                # IntentClassifier, CommitIntentExtractor
│   ├── decision/              # DecisionEngine, ScopeDriftDetector
│   ├── scoring/               # ArchitecturalScoreEngine, FeatureClaimRegistry
│   ├── regression/            # RegressionGuard V2
│   ├── baseline/              # BaselineEngine (aggravation detection)
│   └── trace/                 # FeatureTraceEngine, ImpactGraph
├── manifest/                  # AI-EMPIRE-MANIFEST.md, V4-ROADMAP.md
├── registry/                  # feature registry (Code Connect-like)
├── memory/                    # missions et plans sérialisés
├── sandbox/                   # cibles d'isolation pour les missions
└── tests/v4/                  # vide (pas de tests automatisés)
```

---

## Installation

```bash
git clone https://github.com/W33Dplz/AI-Empire.git
cd AI-Empire
npm install
cp .env.example .env   # créer .env.example d'abord — voir Sécurité
```

`.env` attendu :

```env
OPENAI_API_KEY=sk-...
```

Créer le dossier des missions :

```bash
mkdir C:/AI-EMPIRE-MISSIONS
```

---

## Utilisation

### Lancer le worker

```bash
node worker.js
```

Le worker poll `queue.json` toutes les 2 secondes et traite les jobs `PENDING`.

### Format d'un job

```json
{
  "status": "PENDING",
  "plan": {
    "steps": [
      {
        "type": "PATCH_FILE",
        "target": "config/app.js",
        "content": "console.log('hello');"
      }
    ]
  }
}
```

`status` évolue : `PENDING` → `RUNNING` → `DONE` ou `FAILED`.

### Flow interne d'une mission

1. **DevAgent** applique les `PATCH_FILE` dans un sandbox isolé (`sandbox/mission-{id}/`)
2. **GitAgent** crée une branche `mission-{id}` et commit
3. **TestAgent** exécute `npm run build`, `npm run lint`, `npm run typecheck` du sandbox (timeout court)
4. **AuditAgent** valide que le diff reste dans le scope autorisé (pas de modif hors targets)
5. **RiskGate** scanne le contenu pour détecter patterns suspects
6. Si tout passe → mission `READY_FOR_DECISION` → approbation auto si `approveMission`

---

## V4 Supervisor — état réel

| Module | Implémenté | Note |
|---|---|---|
| IntentClassifier | ✅ | Classification déterministe du type de changement |
| CommitIntentExtractor | ✅ | Parse l'intention à partir du commit message |
| ScopeDriftDetector | ✅ | Compare intent vs impact architectural |
| BaselineEngine | ✅ | Comparaison scores + détection d'aggravation |
| RegressionGuard V2 | ✅ | Analyse propagation déterministe multi-axes |
| ArchitecturalScoreEngine | ✅ | Scoring registry-aware |
| FeatureClaimRegistry | ✅ | Intégré dans Supervisor + DecisionEngine |
| DecisionEngine | ✅ | Orchestration pure, score-driven |
| FeatureTraceEngine | ⚠️ Partial | V1 implémenté, non testé en intégration |
| ImpactGraph V2 | ⚠️ Partial | Scope + propagation scoring posé |
| IntakeEngine | ❌ | Stub |
| Tests V4 | ❌ | Dossier vide |
| Doc utilisateur V4 | ❌ | Manifeste stratégique uniquement |

---

## Sécurité — points d'attention

> ⚠️ **Lis cette section avant de cloner ou rendre le repo public.**

1. **Ne commit jamais `.env`.** Le `.gitignore` actuel ne le couvre pas. Ajouter :
   ```
   .env
   .env.local
   node_modules/
   logs/
   memory/*.json
   sandbox/
   ```
2. **Si une clé API a déjà été committée**, la révoquer immédiatement (OpenAI dashboard) AVANT de nettoyer l'historique avec `git filter-repo` ou BFG.
3. **`worker.js` exécute du code arbitraire** issu de `queue.json` via `npm run` dans un sandbox fs-isolé. L'isolation protège l'hôte du write fs, mais **n'isole pas l'exécution du code Node** lui-même. Ne jamais lancer le worker avec une queue non auditée.
4. **`RiskGate` est superficiel** : détecte des patterns texte ("ignore previous instructions", "eval"), pas les vrais vecteurs (script `npm run` malveillant, dépendances exotiques dans le sandbox).
5. Chemins hardcodés Windows (`C:/AI-EMPIRE-MISSIONS/`) — révèlent l'OS de dev et empêchent toute portabilité Linux/macOS.

---

## Roadmap

Voir `manifest/V4-ROADMAP.md`.

Priorités identifiées :
- [ ] Compléter `IntakeEngine` (entrée d'un repo cible)
- [ ] Tests d'intégration V4 (dossier `tests/v4/`)
- [ ] README d'usage côté utilisateur Lovable
- [ ] Portabilité Linux/macOS (chemins via `path.join`, env var pour `MISSIONS_ROOT`)
- [ ] `.env.example` au lieu d'un `.env` tracké
- [ ] Tests unitaires sur `riskGate`, `auditAgent`, `sandboxManager`
- [ ] Documenter le contrat d'un `plan` (schema JSON)

---

## Licence

À définir par l'auteur.

---

## Auteur

Repo privé, créé 2026-03-03. Commits sous identité technique `Empire AI <empire@local.dev>`.
