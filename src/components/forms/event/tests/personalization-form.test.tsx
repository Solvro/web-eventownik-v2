import { faker } from "@faker-js/faker";
import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";

import {
  EventPersonalizationFormSchema,
  PersonalizationForm,
} from "../personalization-form";

function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<z.infer<typeof EventPersonalizationFormSchema>>;
}) {
  const form = useForm<z.infer<typeof EventPersonalizationFormSchema>>({
    resolver: zodResolver(EventPersonalizationFormSchema),
    defaultValues: {
      photoUrl: null,
      primaryColor: "#3672fd",
      participantsNumber: 100,
      termsLink: "",
      socialMediaLinks: [],
      slug: "",
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(() => {
          /* empty */
        })}
      >
        {children}
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

function renderComponent(
  defaultValues?: Partial<z.infer<typeof EventPersonalizationFormSchema>>,
) {
  const user = userEvent.setup();

  render(
    <TestWrapper defaultValues={defaultValues}>
      <PersonalizationForm />
    </TestWrapper>,
  );

  const photoInput = screen.getByLabelText(/wybierz zdjęcie wydarzenia/i);
  const colorInput = screen.getByLabelText("Kolor wydarzenia");
  const participantsNumberInput = screen.getByRole("spinbutton", {
    name: "Liczba uczestników",
  });
  const termsLinkInput = screen.getByRole("textbox", {
    name: "Link do regulaminu",
  });
  const addSocialMediaLinkButton = screen.getByRole("button", {
    name: /dodaj link/i,
  });
  const slugInput = screen.getByRole("textbox", { name: /slug/i });
  const submitButton = screen.getByRole("button", { name: "Submit" });

  return {
    user,
    photoInput,
    colorInput,
    participantsNumberInput,
    termsLinkInput,
    addSocialMediaLinkButton,
    slugInput,
    submitButton,
  };
}

describe("PersonalizationForm", () => {
  // Mock URL.createObjectURL and URL.revokeObjectURL for image preview
  beforeAll(() => {
    globalThis.URL.createObjectURL = vi.fn(
      (file) => `blob:http://localhost:3000/${(file as File).name}`,
    );
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render all form fields correctly", () => {
      const {
        photoInput,
        colorInput,
        participantsNumberInput,
        termsLinkInput,
        addSocialMediaLinkButton,
        slugInput,
      } = renderComponent();

      expect(photoInput).toBeInTheDocument();
      expect(colorInput).toBeInTheDocument();
      expect(participantsNumberInput).toBeInTheDocument();
      expect(termsLinkInput).toBeInTheDocument();
      expect(addSocialMediaLinkButton).toBeInTheDocument();
      expect(slugInput).toBeInTheDocument();
    });

    it("should display placeholders for input fields", () => {
      renderComponent();
      expect(
        screen.getByPlaceholderText(
          "Wklej publiczny link do regulaminu (np. na Google Drive)",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("twoje-wydarzenie"),
      ).toBeInTheDocument();
    });

    it("should not show social media link inputs initially", () => {
      renderComponent();
      expect(screen.queryByPlaceholderText("Facebook")).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("https://fb.me/knsolvro"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should allow entering participants number", async () => {
      const { user, participantsNumberInput } = renderComponent();
      await user.clear(participantsNumberInput);
      await user.type(participantsNumberInput, "250");
      expect(participantsNumberInput).toHaveValue(250);
    });

    it("should allow entering a terms link", async () => {
      const { user, termsLinkInput } = renderComponent();
      const url = faker.internet.url();
      await user.type(termsLinkInput, url);
      expect(termsLinkInput).toHaveValue(url);
    });

    it("should allow entering a slug", async () => {
      const { user, slugInput } = renderComponent();
      const slug = faker.lorem.slug();
      await user.type(slugInput, slug);
      expect(slugInput).toHaveValue(slug);
    });

    it("should add a new social media link block when add link button is clicked", async () => {
      const { user, addSocialMediaLinkButton } = renderComponent();
      await user.click(addSocialMediaLinkButton);

      expect(screen.getByPlaceholderText("Facebook")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("https://fb.me/knsolvro"),
      ).toBeInTheDocument();
    });

    it("should allow removing a social media link", async () => {
      const { user, addSocialMediaLinkButton } = renderComponent();
      await user.click(addSocialMediaLinkButton);

      const labelInput = screen.getByLabelText("Social media label 0");
      const linkInput = screen.getByLabelText("Social media link 0");
      const removeButton = screen.getByLabelText("Remove social media link 0");

      await user.click(removeButton);

      expect(labelInput).not.toBeInTheDocument();
      expect(linkInput).not.toBeInTheDocument();
    });

    it("should show image preview after file selection", async () => {
      const { user, photoInput } = renderComponent();
      const file = new File(["hello"], "hello.png", { type: "image/png" });

      await user.upload(photoInput, file);

      const image = await screen.findByAltText("Podgląd zdjęcia wydarzenia");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "blob:http://localhost:3000/hello.png",
      );
    });
  });

  describe("Form Initial Values", () => {
    it("should render with provided default values", () => {
      const defaultValues = {
        photoUrl: "blob:http://localhost:3000/hello.png",
        primaryColor: faker.color.rgb(),
        participantsNumber: faker.number.int(),
        termsLink: faker.internet.url(),
        slug: faker.lorem.slug(),
        socialMediaLinks: Array.from({ length: 4 }).map(() => {
          return { label: faker.company.name(), link: faker.internet.url() };
        }),
      };

      const { colorInput, participantsNumberInput, termsLinkInput, slugInput } =
        renderComponent(defaultValues);

      // Verify photo preview is displayed
      const photoPreview = screen.getByAltText("Podgląd zdjęcia wydarzenia");
      expect(photoPreview).toBeInTheDocument();
      expect(photoPreview).toHaveAttribute("src", defaultValues.photoUrl);

      expect(colorInput).toHaveValue(defaultValues.primaryColor);
      expect(participantsNumberInput).toHaveValue(
        defaultValues.participantsNumber,
      );
      expect(termsLinkInput).toHaveValue(defaultValues.termsLink);
      expect(slugInput).toHaveValue(defaultValues.slug);
      for (const socialMediaLink of defaultValues.socialMediaLinks) {
        expect(
          screen.getByDisplayValue(socialMediaLink.label),
        ).toBeInTheDocument();
        expect(
          screen.getByDisplayValue(socialMediaLink.link),
        ).toBeInTheDocument();
      }
    });
  });

  describe("Validation Errors", () => {
    it("should show error for invalid slug", async () => {
      const { user, slugInput, submitButton } = renderComponent();
      await user.type(slugInput, faker.lorem.words(3));
      await user.click(submitButton);

      expect(
        await screen.findByText("Tylko małe litery, cyfry i myślniki"),
      ).toBeInTheDocument();
    });

    it("should show error for slug less than 3 characters", async () => {
      const { user, slugInput, submitButton } = renderComponent();
      await user.type(slugInput, "ab");
      await user.click(submitButton);

      expect(
        await screen.findByText(/co najmniej 3 znaki/i),
      ).toBeInTheDocument();
    });

    it("should show error for invalid termsLink URL", async () => {
      const { user, termsLinkInput, submitButton } = renderComponent();
      await user.type(termsLinkInput, faker.lorem.slug());
      await user.click(submitButton);

      expect(
        await screen.findByText(
          "Wprowadź prawidłowy link do regulaminu, w tym fragment z 'https://'",
        ),
      ).toBeInTheDocument();
    });

    it("should show error for invalid social media URL", async () => {
      const { user, addSocialMediaLinkButton, submitButton } = renderComponent({
        slug: faker.lorem.slug(),
      });
      await user.click(addSocialMediaLinkButton);
      const labelInput = screen.getByLabelText("Social media label 0");
      const linkInput = screen.getByLabelText("Social media link 0");
      await user.type(labelInput, "My Facebook");
      await user.type(linkInput, faker.lorem.slug());
      await user.click(submitButton);

      expect(await screen.findByText(/nieprawidłowy URL/i)).toBeInTheDocument();
    });

    it("should handle multiple social media links independently", async () => {
      const { user, addSocialMediaLinkButton, submitButton, slugInput } =
        renderComponent();
      await user.type(slugInput, "valid-slug");

      // Add two links
      await user.click(addSocialMediaLinkButton);
      await user.click(addSocialMediaLinkButton);

      const label0 = screen.getByLabelText("Social media label 0");
      const link0 = screen.getByLabelText("Social media link 0");
      const label1 = screen.getByLabelText("Social media label 1");
      const link1 = screen.getByLabelText("Social media link 1");

      // Fill first valid
      await user.type(label0, faker.company.name());
      await user.type(link0, faker.internet.url());

      // Fill second invalid
      await user.type(label1, faker.company.name());
      await user.type(link1, faker.lorem.slug());

      await user.click(submitButton);

      // Check error only on second - first link has no error
      expect(
        screen.queryByRole("alert", { name: "Social media link 0 error" }),
      ).not.toBeInTheDocument();
      // Second link has validation error
      expect(
        await screen.findByRole("alert", { name: "Social media link 1 error" }),
      ).toHaveTextContent("Nieprawidłowy URL");
    });
  });
});
