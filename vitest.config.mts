import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["vitest.setup.ts"],
    globals: true,
    env: loadEnv(mode, process.cwd(), ""),
  },
}));
