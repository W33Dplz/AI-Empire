import { validateIntakeReport } from '../../v4-supervisor/intake/intakeTypes.mjs';

const mockValidReport = {
  projectName: "test-project",
  baselineMode: true,
  branches: {
    main: "main",
    lovableDev: "lovable-dev"
  },
  diffSummary: {
    added: [],
    modified: [],
    deleted: []
  },
  impactSummary: {
    affectedModules: [],
    affectedRoutes: [],
    affectedServices: []
  },
  riskLevel: "LEVEL_1",
  requiresFullAudit: true,
  timestamp: new Date().toISOString()
};

try {
  validateIntakeReport(mockValidReport);
  console.log("VALIDATION_PASS");
} catch (e) {
  console.error("VALIDATION_FAIL", e.message);
  process.exit(1);
}
