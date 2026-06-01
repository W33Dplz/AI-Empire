import pino from "pino";

export function createLogger(opts = {}) {
  const level = opts.level || "info";
  const name = opts.name || "ai-empire";
  const format = opts.format || "json";
  const base = { name, level, base: undefined };
  if (format === "pretty") {
    try {
      const stream = pino.transport({ target: "pino-pretty", options: { destination: 2, colorize: true } });
      return pino(base, stream);
    } catch {
      return pino(base, process.stderr);
    }
  }
  return pino(base, process.stderr);
}

let _default = null;
export function getLogger(opts) {
  if (!_default) _default = createLogger(opts);
  return _default;
}
