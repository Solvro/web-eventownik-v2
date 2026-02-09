# AGENTS.md

This file provides guidance on how to work with the `web-eventownik-v2` repository.

## Project Overview

Eventownik is an event management platform designed to support event organization, primarily for Wrocław University of Science and Technology activities. This repository contains the Next.js frontend application that interfaces with the backend API.

### Key Features

- Event creation and configuration
- Participant management with custom attributes
- Form builder
- Email campaigns (personalized and trigger-based)
- Multi-organizer support

## General Guidelines

- Always use npm for package management
- We use GitHub Issues for issue tracking
- When starting a new feature, create a branch from `main` with the format `<type>[scope]/<description>`
- PR titles should follow [Conventional Commits](https://www.conventionalcommits.org/) format
- Reference the related GitHub issue in your PR description

## Essential Commands

### Development

```bash
npm run dev       # Start development server with Turbopack
npm run build     # Build for production
npm run start     # Start production server
```

### Testing

```bash
npm run test      # Run Vitest unit tests
npm run test:ui   # Run Vitest with UI
npm run e2e       # Run Playwright E2E tests
npm run e2e:ui    # Run Playwright with UI
```

### Code Quality

```bash
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript type checking
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

Always run `lint`, `typecheck`, and `format:check` before committing.

## Architecture Overview

```
src/
├── app/                 # App Router pages and layouts
│   ├── (homepage)/      # Homepage with it's sections
│   ├── [eventSlug]/     # Public event page
│   ├── auth/            # Authentication pages
│   └── dashboard/       # Protected dashboard pages
├── atoms/               # Jotai state atoms
├── components/          # Reusable components
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization setup
├── lib/                 # Utility functions and API helpers
└── types/               # TypeScript type definitions
tests/
├── e2e/                 # Playwright E2E tests
└── msw/                 # Mock Service Worker handlers
```

**Note**: Unit tests are co-located with components in `tests/` subdirectories (e.g., `components/forms/event/tests/`).

## Technology Stack

- **Framework:** Next.js 16 with App Router and React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State Management:** Jotai for client-side state
- **Forms:** React Hook Form with Zod validation
- **UI Components:** Radix UI primitives, shadcn/ui
- **Internationalization:** next-intl
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Code Quality:** ESLint (@solvro/config) + Prettier + Husky

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NEXT_PUBLIC_EVENTOWNIK_API=<backend API URL>
SESSION_SECRET=<session encryption secret>
NEXT_PUBLIC_PHOTO_URL=<backend photo URL>
NEXT_PUBLIC_HCAPTCHA_SITEKEY=<hCaptcha site key>
NEXT_PUBLIC_OTEL_METRICS_ENDPOINT=<SigNoz OTLP endpoint>
NEXT_PUBLIC_OTEL_FRONTEND_SERVICE_NAME=<service name for SigNoz>
```

## Key Development Patterns

### TypeScript Best Practices

- **NEVER use `any` type** - use proper types or `unknown`
- Follow the ESLint rules defined in `@solvro/config`
- Define shared types in `src/types/`

### State Management

- Use **Jotai** atoms for client-side state (see `src/atoms/`)
- Use React Query (`@tanstack/react-query`) for server state

### API Communication

- API URL is configured via `NEXT_PUBLIC_EVENTOWNIK_API`
- Use the patterns in `src/lib/api.ts` for API requests

### Component Patterns

#### Form Components

- Use `React Hook Form` with `zodResolver` for form validation
- Define Zod schemas alongside form components
- Export the schema for use in tests and other components
- Use shadcn/ui `Form` components for consistent styling

```typescript
// Define schema in the same file as form component
export const EventFormSchema = z.object({
  name: z.string().nonempty("Name is required"),
  // ...
});

// Export component and schema together
export function EventForm() {
  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
  });
  // ...
}
```

#### Shared Form Field Components

Use `useFormContext` to create reusable form field components that work inside a parent `<Form>` wrapper. Place shared form components in `src/components/forms/`.

```typescript
// src/components/forms/event-form/general-info-form.tsx
export const GeneralInfoSchema = z.object({ name: z.string() });

export function GeneralInfoForm() {
  const { control, formState } = useFormContext<z.infer<typeof GeneralInfoSchema>>();

  return (
    <FormField name="name" control={control} render={({ field }) => (
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl><Input {...field} /></FormControl>
      </FormItem>
    )} />
  );
}

// Usage in parent component - wrap with <Form> provider
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <GeneralInfoForm />
  </form>
</Form>
```

#### Multi-step Form Pattern

For multi-step dialog forms, use a `steps` array configuration with content and submit handlers per step.

```typescript
const steps: { content: React.ReactNode; onSubmit: SubmitHandler<FormSchema> }[] = [
  {
    content: <StepOneFields />,
    onSubmit: () => {
      setCurrentStep(1);
    },
  },
  {
    content: <StepTwoFields />,
    onSubmit: async (values) => { /* final submit */ },
  },
];

// Use current step's content and handler
<form onSubmit={form.handleSubmit(steps[currentStep].onSubmit)}>
  {steps[currentStep].content}
</form>
```

#### Dynamic Field Arrays

- Use `useFieldArray` from React Hook Form for dynamic fields
- Provide `aria-label` attributes with index for accessibility and testing

```typescript
const { fields, append, remove } = useFieldArray({
  name: "socialMediaLinks",
  control,
});

{fields.map((field, index) => (
  <Input
    aria-label={`Social media link ${index}`}
    {...register(`socialMediaLinks.${index}.link`)}
  />
))}
```

### Accessibility Guidelines

Accessibility is essential for both users and testing. Follow these patterns:

#### Interactive Elements

- **Buttons**: Always have visible text or `aria-label` for icon-only buttons
- **Inputs**: Always have associated `<label>` elements or `aria-label`
- **File inputs**: Hidden file inputs must have `aria-label` since their label text may change

```typescript
// Hidden file input with consistent aria-label
<Input
  type="file"
  className="hidden"
  aria-label="Choose event photo"
  onChange={handleFileChange}
/>
```

#### Error Messages

Form Errors

- Use the FormMessage component for displaying errors in React Hook Form based forms

```typescript
<FormMessage>{formState.errors.fieldName?.message}</FormMessage>
```

Other errors

- Use `role="alert"` for validation error messages
- Add `aria-label` to distinguish between multiple errors

```typescript
{error === null ? null : (
  <p
    role="alert"
    aria-label={`${fieldName} error`}
    className="text-red-500"
  >
    {error.message}
  </p>
)}
```

#### Dynamic Content

- Use `aria-label` with indices for repeated/dynamic elements
- This enables semantic testing without `data-testid`

```typescript
<button
  aria-label={`Remove item ${index}`}
  onClick={() => {
    remove(index);
  }}
>
  <TrashIcon />
</button>
```

## Testing Guidelines

### Unit Tests (Vitest)

- Tests are co-located with components in `tests/` subdirectories
- Follow [React Testing Library best practices](https://testing-library.com/docs/guiding-principles)
- Use semantic queries: `getByRole`, `getByLabelText`, `getByText`, `getByAltText`
- **NEVER use `getByTestId`** - prefer semantic queries; use `role="alert"` with `aria-label` for error messages
- Mock external dependencies using MSW (see `tests/msw/`)
- Use `@faker-js/faker` for generating test data

#### Component Modification Policy

- **Do NOT modify components just to make them testable** - components should be accessible by design
- **Exception**: Adding `aria-label` attributes is acceptable when elements lack accessible names (e.g., hidden file inputs, icon-only buttons)
- If a component cannot be tested with semantic queries, it may indicate an accessibility issue that should be fixed

#### Form Testing Best Practices

- **Test all form fields** including file inputs, color pickers, and dynamic fields
- Create a reusable `renderComponent()` helper that returns commonly used elements
- **Reuse the returned elements** from your render helper instead of re-querying with `screen`
- Test initial/default values for all fields, including images
- Test validation errors using semantic queries (e.g., `getByRole("alert")`)

```typescript
// ✅ Good - reuse render helper return values
const { colorInput, slugInput, submitButton } = renderComponent(defaultValues);
expect(colorInput).toHaveValue(defaultValues.primaryColor);

// ❌ Bad - re-querying elements already available from render helper
renderComponent(defaultValues);
expect(screen.getByLabelText("Color")).toHaveValue(...);
```

#### File Upload Testing

- Mock `URL.createObjectURL` and `URL.revokeObjectURL` in `beforeAll`
- Use `userEvent.upload()` with the file input element directly
- Verify image preview appears with correct `src` attribute

```typescript
beforeAll(() => {
  globalThis.URL.createObjectURL = vi.fn(
    (file) => `blob:http://localhost:3000/${(file as File).name}`,
  );
  globalThis.URL.revokeObjectURL = vi.fn();
});

it("should show image preview after file selection", async () => {
  const { user, photoInput } = renderComponent();
  const file = new File(["content"], "photo.png", { type: "image/png" });

  await user.upload(photoInput, file);

  const image = await screen.findByAltText("Image preview");
  expect(image).toHaveAttribute("src", "blob:http://localhost:3000/photo.png");
});
```

#### Factory Helpers for Complex Data

For forms with complex data structures, create factory helper functions to generate test data:

```typescript
function createTestAttribute(
  overrides: Partial<NewEventAttribute> = {},
): NewEventAttribute {
  return {
    name: faker.commerce.productName(),
    type: "text",
    slug: faker.lorem.slug(),
    options: [],
    showInList: true,
    order: 0,
    ...overrides,
  };
}

// Usage
const initialAttributes = [createTestAttribute({ name: "Custom Name" })];
```

#### Mocking Complex Child Components

When testing parent components with complex children, mock the child to simplify tests:

```typescript
vi.mock("../path/to/complex-child", () => ({
  ComplexChild: ({ item, onRemove }: Props) => (
    <div>
      <span>{item.name}</span>
      <button onClick={onRemove}>Remove</button>
    </div>
  ),
}));
```

### E2E Tests (Playwright)

- Tests are located in `tests/e2e/`
- **NEVER use `locator()` directly** - always use semantic selectors:
  - `page.getByLabel()`
  - `page.getByText()`
  - `page.getByPlaceholder()`
  - `page.getByRole()`
- Tests use custom fixtures defined in `tests/e2e/fixtures.ts`
- Authentication state is shared via `test-results/.auth/user.json`

```typescript
// ❌ Bad - avoid locators
await page.locator('[data-testid="submit"]').click();

// ✅ Good - use semantic selectors
await page.getByRole("button", { name: "Submit" }).click();
```

### Running E2E Tests

E2E tests require the backend to be running. The test suite:

1. Runs `global.setup.ts` to create a test user
2. Executes tests across Chromium and Firefox
3. Runs `global.teardown.ts` to clean up test data

## GitHub Guidelines

- PR titles must follow Conventional Commits:
  - `feat: add new feature`
  - `fix: resolve bug`
  - `docs: update documentation`
  - `refactor: restructure code`
  - `test: add tests`
  - `chore: maintenance tasks`
- Reference the GitHub issue in the PR description
- Request review from team members before merging
- Never push directly to `main`
