import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EventNotFound } from "@/app/[eventSlug]/event-not-found";
import { WysiwygEditor } from "@/components/editor";
import { ParticipantForm } from "@/components/participant-form";
import { parseLinks } from "@/lib/links";
import { setupSuggestions } from "@/lib/message-tags/tag-suggestions";
import type { FormAttribute } from "@/types/attributes";
import type { V3Block } from "@/types/v3";

import messages from "../../../messages/pl.json";

/** Cloudflare's documented always-passing Turnstile test site key. */
const TEST_SITEKEY = "1x00000000000000000000AA";

const captcha = vi.hoisted(() => ({
  verify: undefined as ((token: string) => void) | undefined,
  open: undefined as (() => void) | undefined,
  execute: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@marsidev/react-turnstile", () => {
  const CaptchaMock = forwardRef(
    (
      props: {
        onWidgetLoad: () => void;
        onSuccess: (token: string) => void;
        onBeforeInteractive: () => void;
      },
      ref,
    ) => {
      const { onWidgetLoad } = props;
      useImperativeHandle(ref, () => ({
        execute: captcha.execute,
        reset: vi.fn(),
      }));
      // Simulate the external CAPTCHA SDK finishing its initial load.
      // eslint-disable-next-line react-you-might-not-need-an-effect/no-manage-parent
      useEffect(() => {
        onWidgetLoad();
      }, [onWidgetLoad]);
      captcha.verify = props.onSuccess;
      captcha.open = props.onBeforeInteractive;
      return null;
    },
  );
  CaptchaMock.displayName = "CaptchaMock";
  return { Turnstile: CaptchaMock };
});

function field(overrides: Partial<FormAttribute> = {}): FormAttribute {
  return {
    uuid: "550e8400-e29b-41d4-a716-446655440001",
    name: "Attachment",
    slug: null,
    eventUuid: "event",
    type: "file",
    options: null,
    order: 0,
    showInList: true,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    isRequired: false,
    isEditable: true,
    isMultiple: false,
    maxSelections: null,
    ...overrides,
  };
}
function renderForm(attributes: FormAttribute[] = []) {
  const onSubmit = vi
    .fn<
      (
        values: Record<string, unknown>,
        files: File[],
      ) => Promise<{ success: boolean }>
    >()
    .mockResolvedValue({ success: true });
  render(
    <NextIntlClientProvider locale="pl" messages={messages}>
      <ParticipantForm attributes={attributes} onSubmit={onSubmit} />
    </NextIntlClientProvider>,
  );
  return {
    onSubmit,
    user: userEvent.setup(),
    submit: screen.getByRole("button", { name: "Zapisz się" }),
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("browser QA regressions", () => {
  it("blocks new selections in full multi-selection blocks while allowing existing participants to leave", () => {
    const child: V3Block = {
      uuid: "full",
      name: "Full workshop",
      description: null,
      capacity: 1,
      parentUuid: "root",
      attributeUuid: "block-attribute",
      order: 0,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      isRootBlock: false,
      children: [],
      blockParticipantCount: 1,
    };
    const root: V3Block = {
      ...child,
      uuid: "root",
      name: "Root",
      capacity: null,
      parentUuid: null,
      isRootBlock: true,
      children: [child],
      blockParticipantCount: 0,
    };
    const attributes = [
      field({
        uuid: "block-attribute",
        name: "Workshops",
        type: "block",
        isMultiple: true,
        maxSelections: 2,
      }),
    ];
    const view = (selectedBlockUuids: string[]) => (
      <NextIntlClientProvider locale="pl" messages={messages}>
        <ParticipantForm
          attributes={attributes}
          eventBlocks={[root]}
          initialValues={{ "block-attribute": selectedBlockUuids }}
          selectedBlockUuids={selectedBlockUuids}
          onSubmit={vi.fn().mockResolvedValue({ success: true })}
        />
      </NextIntlClientProvider>
    );
    const { rerender } = render(view([]));
    expect(
      screen.getByRole("checkbox", { name: "Full workshop" }),
    ).toBeDisabled();
    rerender(view(["full"]));
    expect(
      screen.getByRole("checkbox", { name: "Full workshop" }),
    ).toBeEnabled();
  });

  it("distinguishes unavailable service from a missing event", () => {
    const { rerender } = render(
      <NextIntlClientProvider locale="pl" messages={messages}>
        <EventNotFound whatNotFound="event" status={503} />
      </NextIntlClientProvider>,
    );
    expect(
      screen.getByRole("heading", {
        name: "Wydarzenie jest chwilowo niedostępne",
      }),
    ).toBeInTheDocument();
    rerender(
      <NextIntlClientProvider locale="pl" messages={messages}>
        <EventNotFound whatNotFound="event" status={404} />
      </NextIntlClientProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "Nie znaleziono wydarzenia" }),
    ).toBeInTheDocument();
  });
  it("keeps an empty link collection valid for the settings form", () => {
    expect(parseLinks([])).toEqual({ generalLinks: [], policyLink: undefined });
  });
  it("reopens canonical backend markers as editable mentions", async () => {
    function MarkerEditor() {
      const t = useTranslations("MessageTags");
      return (
        <WysiwygEditor
          placeholder="Message"
          content='<p><span data-id="/event_name"></span></p>'
          onChange={vi.fn()}
          extensions={setupSuggestions([], t)}
        />
      );
    }
    render(
      <NextIntlClientProvider locale="pl" messages={messages}>
        <MarkerEditor />
      </NextIntlClientProvider>,
    );
    expect(await screen.findByText("Nazwa wydarzenia")).toHaveAttribute(
      "data-id",
      "/event_name",
    );
  });
  it("limits multiselect choices while allowing deselection", async () => {
    const { user } = renderForm([
      field({
        name: "Choices",
        type: "multiselect",
        options: ["Alpha", "Beta", "Gamma"],
        maxSelections: 2,
      }),
    ]);
    const alpha = screen.getByRole("checkbox", { name: "Alpha" });
    const beta = screen.getByRole("checkbox", { name: "Beta" });
    const gamma = screen.getByRole("checkbox", { name: "Gamma" });
    await user.click(alpha);
    await user.click(beta);
    expect(gamma).toBeDisabled();
    await user.click(alpha);
    expect(gamma).toBeEnabled();
  });
  it("recovers from missing CAPTCHA configuration without submitting", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITEKEY", "");
    vi.stubEnv("NEXT_PUBLIC_HCAPTCHA_SITEKEY", "");
    const { user, submit, onSubmit } = renderForm();
    expect(
      screen.getByRole("alert", { name: /CAPTCHA nie jest poprawnie/ }),
    ).toBeInTheDocument();
    await user.click(submit);
    const retry = screen.getByRole("button", {
      name: "Błąd CAPTCHA. Spróbuj ponownie",
    });
    expect(retry).toBeEnabled();
    await user.click(retry);
    expect(screen.getByRole("button", { name: "Zapisz się" })).toBeEnabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("never hands a legacy hCaptcha key to Turnstile and keeps the answers", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITEKEY", "");
    vi.stubEnv(
      "NEXT_PUBLIC_HCAPTCHA_SITEKEY",
      "10000000-ffff-ffff-ffff-000000000001",
    );
    captcha.execute.mockClear();
    const { user, submit, onSubmit } = renderForm([
      field({ name: "Imię", type: "text" }),
    ]);
    const name = screen.getByLabelText("Imię");
    await user.type(name, "Ala");
    expect(
      screen.getByRole("alert", { name: /CAPTCHA nie jest poprawnie/ }),
    ).toBeInTheDocument();
    await user.click(submit);
    expect(captcha.execute).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(name).toHaveValue("Ala");
  });
  it("requires the proper Turnstile environment variable", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITEKEY", "");
    vi.stubEnv("NEXT_PUBLIC_HCAPTCHA_SITEKEY", TEST_SITEKEY);
    captcha.execute.mockClear();
    const { user, submit } = renderForm();
    expect(
      screen.getByRole("alert", { name: /CAPTCHA nie jest poprawnie/ }),
    ).toBeInTheDocument();
    await user.click(submit);
    expect(captcha.execute).not.toHaveBeenCalled();
  });
  it("recovers if CAPTCHA execution never opens or verifies", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITEKEY", TEST_SITEKEY);
    vi.useFakeTimers();
    const { submit, onSubmit } = renderForm();
    await act(async () => {
      submit.click();
      await Promise.resolve();
    });
    expect(captcha.execute).toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(15_001);
    });
    expect(
      screen.getByRole("button", { name: "Błąd CAPTCHA. Spróbuj ponownie" }),
    ).toBeEnabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("does not time out an open CAPTCHA challenge", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITEKEY", TEST_SITEKEY);
    vi.useFakeTimers();
    const { submit, onSubmit } = renderForm();
    await act(async () => {
      submit.click();
      await Promise.resolve();
    });
    act(() => {
      captcha.open?.();
    });
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(
      screen.queryByRole("button", { name: "Błąd CAPTCHA. Spróbuj ponownie" }),
    ).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("preserves the MIME type when renaming a file to its attribute UUID", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITEKEY", TEST_SITEKEY);
    const attribute = field();
    const { user, submit, onSubmit } = renderForm([attribute]);
    await user.upload(
      screen.getByLabelText("Attachment"),
      new File(["png"], "photo.png", { type: "image/png" }),
    );
    await user.click(submit);
    await act(async () => {
      captcha.verify?.("test-token");
      await Promise.resolve();
    });
    const uploaded = onSubmit.mock.calls[0][1][0];
    expect(uploaded.type).toBe("image/png");
    expect(uploaded.name).toBe(attribute.uuid);
  });
  it("never reuses a single-use Turnstile token for a second submission", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITEKEY", TEST_SITEKEY);
    captcha.execute.mockClear();
    const { user, submit, onSubmit } = renderForm();
    onSubmit.mockResolvedValueOnce({ success: false });
    await user.click(submit);
    await act(async () => {
      captcha.verify?.("first-token");
      await Promise.resolve();
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ token: "first-token" }),
      [],
    );
    await user.click(screen.getByRole("button", { name: "Zapisz się" }));
    expect(captcha.execute).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
  it("blocks an invalid optional file when submitting and recovers after replacement", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITEKEY", TEST_SITEKEY);
    const { user, submit, onSubmit } = renderForm([field()]);
    const input = screen.getByLabelText("Attachment");
    await user.upload(
      input,
      new File(["invalid"], "bad.txt", { type: "text/plain" }),
    );
    await user.click(submit);
    expect(screen.getByText(/Dozwolone typy plików/)).toBeInTheDocument();
    expect(captcha.execute).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    await user.upload(
      input,
      new File(["png"], "good.png", { type: "image/png" }),
    );
    await user.click(submit);
    expect(captcha.execute).toHaveBeenCalled();
  });
});
