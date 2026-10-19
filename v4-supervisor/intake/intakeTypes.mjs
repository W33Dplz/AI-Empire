export const RISK_LEVELS = ['LEVEL_1','LEVEL_2','LEVEL_3'];

export function validateIntakeReport(report) {

    if (!report || typeof report !== 'object') {
        throw new Error('Invalid report object');
    }

    const requiredRootFields = [
        'projectName',
        'baselineMode',
        'branches',
        'diffSummary',
        'impactSummary',
        'riskLevel',
        'requiresFullAudit',
        'timestamp'
    ];

    for (const field of requiredRootFields) {
        if (!(field in report)) {
            throw new Error('Missing field: ' + field);
        }
    }

    if (typeof report.projectName !== 'string') {
        throw new Error('projectName must be string');
    }

    if (typeof report.baselineMode !== 'boolean') {
        throw new Error('baselineMode must be boolean');
    }

    if (typeof report.requiresFullAudit !== 'boolean') {
        throw new Error('requiresFullAudit must be boolean');
    }

    if (!RISK_LEVELS.includes(report.riskLevel)) {
        throw new Error('Invalid riskLevel');
    }

    if (typeof report.timestamp !== 'string' || isNaN(Date.parse(report.timestamp))) {
        throw new Error('Invalid timestamp format');
    }

    validateBranches(report.branches);
    validateDiffSummary(report.diffSummary);
    validateImpactSummary(report.impactSummary);

    return true;
}

function validateBranches(branches) {
    if (!branches || typeof branches !== 'object') {
        throw new Error('Invalid branches object');
    }

    if (typeof branches.main !== 'string') {
        throw new Error('branches.main must be string');
    }

    if (typeof branches.lovableDev !== 'string') {
        throw new Error('branches.lovableDev must be string');
    }
}

function validateDiffSummary(diff) {
    if (!diff || typeof diff !== 'object') {
        throw new Error('Invalid diffSummary');
    }

    const fields = ['added','modified','deleted'];

    for (const f of fields) {
        if (!Array.isArray(diff[f])) {
            throw new Error('diffSummary.' + f + ' must be array');
        }
    }
}

function validateImpactSummary(impact) {
    if (!impact || typeof impact !== 'object') {
        throw new Error('Invalid impactSummary');
    }

    const fields = ['affectedModules','affectedRoutes','affectedServices'];

    for (const f of fields) {
        if (!Array.isArray(impact[f])) {
            throw new Error('impactSummary.' + f + ' must be array');
        }
    }
}
