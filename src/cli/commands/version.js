import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function version() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pkgPath = path.resolve(__dirname, '../../../package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  process.stdout.write(`ai-empire@${pkg.version} (node ${process.version})\n`);
  return 0;
}
