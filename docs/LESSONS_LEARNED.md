# Leçons apprises — AI-EMPIRE

Append-only. Une entrée = un pattern d'erreur ou un piège rencontré → règle préventive concrète.

---

## 2026-06-01 — Content filter Anthropic bloque la régénération de policies standardisées (CoC, licences)

**Contexte** : workflow Phase 5 (OSS docs) — l'agent T047 devait générer `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1). Le fichier n'est jamais arrivé sur disque, sans erreur explicite dans le log workflow. Diagnostic post-mortem : le content filter de sortie d'Anthropic bloque silencieusement la génération du texte du Covenant — le vocabulaire qu'il définit (comportements interdits : harassment, sexual attention, doxxing, etc.) déclenche un faux positif standard.

**Symptôme** : agent retourne "DONE" mais le `Write` du fichier n'a jamais été effectué. Aucun message d'erreur visible.

**Cause racine** : faux positif du safety filter sur des artefacts canoniques externes (CoC, licences, RFC) qui sont publics, standardisés et légitimes mais dont le vocabulaire trigger le filtre.

**Règle préventive** : pour les artefacts canoniques externes (Contributor Covenant, MIT/Apache/GPL LICENSE, RFC, NIST templates, etc.), **ne jamais demander à un sous-agent de les régénérer**. À la place :
- `curl` direct vers la source officielle (`https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md`, `https://opensource.org/licenses/MIT`, etc.)
- ou bundle une copie dans `FORMATION/SKILL/_shared/templates/` une fois pour toutes
- placeholders (email contact, copyright holder) substitués via `sed` après le téléchargement

**Comment l'appliquer** : skill `creation-projet` doit inclure un step "fetch templates canoniques via curl" plutôt que "agent génère CoC + LICENSE". Idem pour toute future skill OSS-ready.

**Lien** : voir [memory globale `oss_check_before_build`](C:/Users/charl/.claude/projects/...) pour le pattern adjacent (audit OSS avant build >100 lignes).

---
