---
applyTo: "**"
---

# Eventownik Frontend - Copilot Instructions

## Project Context

This is the **Eventownik** frontend repository - an event management platform for Wrocław University of Science and Technology. Built with Next.js 16 (App Router) and React 19.

For full documentation, see [AGENTS.md](../AGENTS.md).

## Technology Stack

- **Framework:** Next.js 16 with App Router, React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State:** Jotai (client), React Query (server)
- **Forms:** React Hook Form + Zod validation
- **UI:** Radix UI primitives, shadcn/ui
- **i18n:** next-intl
- **Testing:** Vitest (unit) + Playwright (E2E)

## Coding Standards

### TypeScript

- **NEVER use `any` type** - use proper types or `unknown`
- Define shared types in `src/types/`
- Follow `@solvro/config` ESLint rules

### Naming Conventions

- Use PascalCase for component names, interfaces, and type aliases
- Use camelCase for variables, functions, and methods
- Use ALL_CAPS for constants

### Forms

- Use React Hook Form with `zodResolver` for validation
- Define Zod schemas alongside form components
- Use shadcn/ui `Form` components for styling
- Use `useFormContext` for shared form field components

```typescript
// Define schema with form component
export const EventFormSchema = z.object({
  name: z.string().nonempty("Name is required"),
});

export function EventForm() {
  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
  });
}
```

### Accessibility (Required)

- Buttons: Always have visible text or `aria-label` for icon-only buttons
- Inputs: Always have associated `<label>` or `aria-label`
- File inputs: Use `aria-label` since label text may change
- Error messages: Use `role="alert"` with `aria-label`
- Dynamic content: Use `aria-label` with indices for repeated elements

```typescript
// Icon button
<button aria-label={`Remove item ${index}`}>
  <TrashIcon />
</button>

// Hidden file input
<Input
  type="file"
  className="hidden"
  aria-label="Choose event photo"
/>
```

## Testing Guidelines

### Unit Tests (Vitest)

- Tests co-located in `tests/` subdirectories
- Use semantic queries: `getByRole`, `getByLabelText`, `getByText`
- **NEVER use `getByTestId`** - prefer semantic queries
- Mock external dependencies using MSW (`tests/msw/`)
- Use `@faker-js/faker` for test data

```typescript
// ✅ Good - semantic query
screen.getByRole("button", { name: "Submit" });

// ❌ Bad - avoid testids
screen.getByTestId("submit-button");
```

### E2E Tests (Playwright)

- Located in `tests/e2e/`
- **NEVER use `locator()` directly** - use semantic selectors:
  - `page.getByLabel()`
  - `page.getByText()`
  - `page.getByRole()`

```typescript
// ✅ Good
await page.getByRole("button", { name: "Submit" }).click();

// ❌ Bad
await page.locator('[data-testid="submit"]').click();
```

## Essential Commands

```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # Production build
npm run test          # Vitest unit tests
npm run e2e           # Playwright E2E tests
npm run lint          # ESLint
npm run typecheck     # TypeScript check
npm run format        # Prettier format
```

Always run `lint`, `typecheck`, and `format:check` before committing.

## Git Conventions

- Branch format: `<type>[scope]/<description>`
- PR titles follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation
  - `refactor:` code restructure
  - `test:` add tests
  - `chore:` maintenance
