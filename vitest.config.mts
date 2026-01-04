import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths(), react()],
  test: {
    exclude: [...configDefaults.exclude, "tests/e2e/*"],
    environment: "jsdom",
    setupFiles: ["vitest.setup.ts"],
    globals: true,
    env: loadEnv(mode, process.cwd(), ""),
  },
}));
