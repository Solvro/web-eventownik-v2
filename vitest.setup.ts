import { loadEnvConfig } from "@next/env";
import "@testing-library/jest-dom";
import ResizeObserver from "resize-observer-polyfill";
import { vi } from "vitest";

// Load envs from .env.test
loadEnvConfig(process.cwd());

vi.mock("server-only", () => {
  return {};
});

globalThis.ResizeObserver = ResizeObserver;
