import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { API_URL } from "@/lib/api";
import * as utils from "@/lib/utils";
import { server } from "@/tests/msw/node";
import type { Attribute } from "@/types/attributes";
import type { Participant } from "@/types/participant";

import { mockVerifySession } from "./mocks/mocks";
import { renderTable } from "./utils";

vi.mock("@/lib/session", () => mockVerifySession());

const fileAttribute: Attribute = {
  id: 20,
  name: "CV",
  slug: "cv",
  eventId: 100,
  showInList: true,
  order: 0,
  options: null,
  type: "file",
  createdAt: "2026-08-11T10:00:00Z",
  updatedAt: "2026-08-11T10:00:00Z",
  isRequired: false,
  isEditable: false,
  isMultiple: false,
  maxSelections: null,
};

function createParticipant(value: string): Participant {
  return {
    id: 1,
    email: "participant@example.com",
    slug: "participant",
    createdAt: "2026-08-11T10:00:00Z",
    updatedAt: "2026-08-11T10:00:00Z",
    attributes: [
      {
        id: fileAttribute.id,
        name: fileAttribute.name,
        slug: fileAttribute.slug,
        value,
      },
    ],
  };
}

describe("participant file attributes", () => {
  it("downloads the file instead of rendering its stored name", async () => {
    server.use(
      http.get(
        `${API_URL}/events/:eventId/participants/:participantId/attributes/:attributeId`,
        () =>
          new HttpResponse("file contents", {
            headers: { "Content-Type": "application/pdf" },
          }),
      ),
    );
    const downloadFileSpy = vi
      .spyOn(utils, "downloadFile")
      .mockImplementation(vi.fn());
    const { user } = renderTable(
      [createParticipant("2c819c72-a316-4714-b719.pdf")],
      [fileAttribute],
    );

    const downloadButton = screen.getByRole("button", {
      name: "Pobierz",
      description: "Pobierz CV dla participant@example.com",
    });
    expect(downloadButton).toBeInTheDocument();
    expect(
      screen.queryByText("2c819c72-a316-4714-b719.pdf"),
    ).not.toBeInTheDocument();

    await user.click(downloadButton);

    expect(downloadFileSpy).toHaveBeenCalledWith(
      expect.any(Blob),
      "participant@example.com-cv.pdf",
    );
  });

  it("does not render a download button when no file was uploaded", () => {
    renderTable([createParticipant("")], [fileAttribute]);

    expect(
      screen.queryByRole("button", { name: "Pobierz" }),
    ).not.toBeInTheDocument();
  });
});
