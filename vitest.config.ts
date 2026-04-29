import { defineConfig } from "vitest/config";
import path from "path";

// Windows-specific: happy-dom init transient race ("Cannot read properties
// of undefined (reading 'config')") on first run. Forks pool + serial file
// execution gives a fresh process per file deterministically. The "test"
// script retries once via "|| vitest run" to absorb the rare flake that
// survives. (Vitest 4 moved poolOptions → top-level fields.)
export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: false,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
    pool: "forks",
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
