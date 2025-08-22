import "@testing-library/jest-dom";
import ResizeObserver from "resize-observer-polyfill";
import { vi } from "vitest";

import { server } from "@/app/dashboard/events/[id]/participants/table/tests/mocks/node";

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});

vi.mock("server-only", () => {
  return {};
});

globalThis.ResizeObserver = ResizeObserver;

globalThis.HTMLElement.prototype.scrollIntoView = vi.fn();
globalThis.HTMLElement.prototype.hasPointerCapture = vi.fn();
globalThis.HTMLElement.prototype.releasePointerCapture = vi.fn();
