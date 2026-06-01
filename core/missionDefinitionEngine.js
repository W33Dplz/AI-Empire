import crypto from "crypto"

class MissionDefinitionEngine {

  static generateMission(projectId, rawVision) {

    const interpretedGoal = this.interpretGoal(rawVision)
    const moduleType = this.detectModuleType(rawVision)
    const generatedPrompt = this.generateLovablePrompt(rawVision)

    const scope = this.generateScope(rawVision)

    const riskScore = this.computeInitialRisk(moduleType)
    const riskCategory = this.mapRiskCategory(riskScore)

    return {
      meta: {
        missionId: crypto.randomUUID(),
        projectId,
        createdAt: new Date().toISOString(),
        version: "1.0"
      },

      businessLayer: {
        rawVision,
        interpretedGoal,
        moduleType,
        strategicIntent: "Contract-driven controlled integration"
      },

      lovableLayer: {
        generatedPrompt,
        phase: "MVP",
        constraintsInjected: [
          "no-existing-break",
          "no-destructive-migration"
        ]
      },

      scopeLayer: scope,

      invariantLayer: {
        noExistingBehaviorChange: true,
        noDestructiveOperations: true,
        respectPhaseScope: true
      },

      riskLayer: {
        initialRiskScore: riskScore,
        riskCategory
      },

      impactPolicy: {
        autoCorrectLow: true,
        autoCorrectMedium: true,
        autoCorrectHighIfSafe: true,
        blockCritical: true
      }
    }
  }

  static interpretGoal(raw) {
    return raw.substring(0, 200)
  }

  static detectModuleType(raw) {
    const lower = raw.toLowerCase()

    if (lower.includes("architecture")) return "architecture"
    if (lower.includes("module")) return "module"
    return "feature"
  }

  static generateLovablePrompt(raw) {
    return `
🔒 CONTEXTE GLOBAL

Tu implémentes une nouvelle fonctionnalité sans casser ni modifier
aucun comportement existant.

🎯 OBJECTIF
${raw}

⚠ CONTRAINTES ABSOLUES
- Aucun impact existant
- Aucune migration destructive
- Respect strict du scope
`
  }

  static generateScope(raw) {
    const allowedCreates = []
    const forbiddenAreas = []

    const lower = raw.toLowerCase()

    if (lower.includes("nouvelle entité")) {
      allowedCreates.push("entity")
    }

    if (lower.includes("sans toucher")) {
      forbiddenAreas.push("existing-modification")
    }

    return {
      allowedCreates,
      conditionalModifications: [],
      forbiddenAreas
    }
  }

  static computeInitialRisk(moduleType) {
    if (moduleType === "architecture") return 80
    if (moduleType === "module") return 60
    return 30
  }

  static mapRiskCategory(score) {
    if (score >= 80) return "CRITICAL"
    if (score >= 60) return "HIGH"
    if (score >= 40) return "MEDIUM"
    return "LOW"
  }
}

export default MissionDefinitionEngine
