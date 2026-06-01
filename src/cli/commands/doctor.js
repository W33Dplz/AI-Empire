import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getMissionsRoot } from '../../lib/paths.js';

export async function doctor() {
  let ok = true;
  process.stderr.write('ai-empire doctor\n');

  // node >= 20
  const nodeMajor = parseInt(process.versions.node, 10);
  if (nodeMajor >= 20) {
    process.stderr.write(`[OK] node >= 20 (found ${process.versions.node})\n`);
  } else {
    process.stderr.write(`[FAIL] node >= 20 required (found ${process.versions.node})\n`);
    ok = false;
  }

  // OPENAI_API_KEY presence
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0) {
    process.stderr.write('[OK] OPENAI_API_KEY is set\n');
  } else {
    process.stderr.write('[FAIL] OPENAI_API_KEY is not set\n');
    ok = false;
  }

  // missions root writable
  try {
    const root = getMissionsRoot();
    mkdirSync(root, { recursive: true });
    const probe = path.join(root, `.doctor-probe-${process.pid}-${Date.now()}`);
    writeFileSync(probe, 'probe');
    unlinkSync(probe);
    process.stderr.write(`[OK] missions root writable (${root})\n`);
  } catch (err) {
    process.stderr.write(`[FAIL] missions root not writable: ${err.message}\n`);
    ok = false;
  }

  // git on PATH
  try {
    execSync('git --version', { stdio: 'pipe' });
    process.stderr.write('[OK] git on PATH\n');
  } catch (err) {
    process.stderr.write(`[FAIL] git not found on PATH: ${err.message}\n`);
    ok = false;
  }

  return ok ? 0 : 1;
}
