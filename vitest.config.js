import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js", "tests/**/*.test.mjs"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.js"],
      exclude: [
        "src/**/test*.js",
        "src/**/testDev.js",
        "src/**/testGit.js",
        "src/**/test*.mjs",
        "src/supervisor/supervisor.mjs",
        "src/brain/missionState.js",
      ],
      thresholds: {
        lines: 35,
        functions: 50,
        statements: 35,
        branches: 60,
      },
    },
  },
});
