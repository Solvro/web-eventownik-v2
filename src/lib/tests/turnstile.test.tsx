import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Turnstile } from "@/components/turnstile";

function callbacks() {
  return {
    onLoad: vi.fn(),
    onVerify: vi.fn(),
    onExpire: vi.fn(),
    onError: vi.fn(),
    onOpen: vi.fn(),
    onClose: vi.fn(),
  };
}

afterEach(() => {
  cleanup();
  delete window.turnstile;
  vi.restoreAllMocks();
});

describe("Turnstile widget", () => {
  it("reports a synchronous render failure instead of crashing the form", () => {
    vi.spyOn(console, "error").mockImplementation(() => null);
    window.turnstile = {
      render: vi.fn(() => {
        throw new Error("Invalid sitekey");
      }),
      execute: vi.fn(),
      reset: vi.fn(),
      remove: vi.fn(),
    };
    const props = callbacks();

    expect(() =>
      render(<Turnstile sitekey="1x00000000000000000000AA" {...props} />),
    ).not.toThrow();
    expect(props.onError).toHaveBeenCalledWith("render-failed");
    expect(props.onLoad).not.toHaveBeenCalled();
  });

  it("renders in execute-on-demand mode and reports readiness", () => {
    const renderWidget = vi.fn(() => "widget-1");
    window.turnstile = {
      render: renderWidget,
      execute: vi.fn(),
      reset: vi.fn(),
      remove: vi.fn(),
    };
    const props = callbacks();

    render(<Turnstile sitekey="1x00000000000000000000AA" {...props} />);

    expect(renderWidget).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        sitekey: "1x00000000000000000000AA",
        execution: "execute",
        appearance: "interaction-only",
      }),
    );
    expect(props.onLoad).toHaveBeenCalled();
    expect(props.onError).not.toHaveBeenCalled();
  });
});
