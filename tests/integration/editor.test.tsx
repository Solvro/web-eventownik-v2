import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WysiwygEditor } from "@/components/editor";

describe("Demo test suite", () => {
  it("should render a component", () => {
    render(<WysiwygEditor onChange={vi.fn()} content="" />);
    expect(screen.getByRole("paragraph")).toBeInTheDocument();
  });
});
