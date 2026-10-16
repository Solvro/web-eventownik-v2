# Backend v3 migration

The frontend targets `backend-eventownik-v3`. Local development uses
`NEXT_PUBLIC_EVENTOWNIK_API=http://localhost:3334/api/v3`. Keep `SESSION_SECRET`
stable across frontend instances. Absolute photo URLs are used directly;
`NEXT_PUBLIC_PHOTO_URL` provides the base for relative paths.

## Native contracts

`src/lib/api.ts` contains configuration, photo URLs and the pagination type.
`apiFetch` and response normalization have been removed. `getBackend<T>` makes
one request and returns the v3 JSON unchanged. Pages consume native types from
`src/types/v3.ts`; private participant rows use `src/types/participant.ts`.
`src/lib/api-v3.ts` builds write payloads from local editor state.

| Area           | Current behavior                                                                                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication | Native access token and refresh cookie; same-request session refresh; logout revokes the refresh token. Auth forms follow v3, with CAPTCHA on public participant submissions.                                                                                                   |
| Events         | Pages read `organizerName`, `participantsLimit`, `isVerified` and `registerFormUuid`. Metadata uses JSON and photos use multipart uploads.                                                                                                                                      |
| Lists          | Event, admin, form and email pages use explicit `page`/`take` and native `meta`. The homepage loads further pages on demand. Participant search, filters and sorting run on the server before pagination.                                                                       |
| Reference data | Form choices, attribute configuration, organizer lists and sitemap generation explicitly request complete collections where necessary. List pages do not automatically load every page or hydrate each row with detail requests.                                                |
| Attributes     | Native `config`, `textArea`, `multiSelect`, options, block participant fields and selection limits. Editor drafts retain unknown configuration plus sensitivity metadata.                                                                                                       |
| Forms          | Native UUIDs, `formDefinitions`, per-definition required/order settings and event registration-form reference. Form list summaries and detail responses remain distinct.                                                                                                        |
| Public forms   | Native definitions and participant JSON values are bound to controls locally. Number zero, checkbox false, arrays, file timestamps and existing full-block selections are preserved. Submission is JSON with `h-captcha-response`; files upload separately as tokens.           |
| Participants   | UUID identity; native attribute UUID/value/timestamps. Editable rows are local UI state. Page size, global search, column filters and sorting use backend queries. Unsaved edits require cancel/discard before changing the table view. Selection resets when the view changes. |
| Import/export  | CSV creates individual participants and reports skipped rows; bulk unregister batches at most 500. Export requests backend XLSX.                                                                                                                                                |
| Blocks         | Native occupancy counts include unlimited blocks. Public and private occupant lists load paginated data when opened. Public rows expose only configured participant fields. Private rows require `MANAGE_PARTICIPANT`.                                                          |
| Emails         | Native `id`, uppercase trigger, `triggerConfig`, JSON editor schema and numeric counts. History uses native page metadata, server search/status filters and stable sorting. Attribute-change trigger writes preserve typed expected values, including zero/false/arrays.        |
| Co-organizers  | Native permission string enums. Local selectors write those enums; owner details remain visible.                                                                                                                                                                                |
| Admin          | Native event pagination and `isVerified` updates.                                                                                                                                                                                                                               |
| Password reset | `/auth/forgot-password` and `/auth/reset-password`; reset accepts `token` and `password`. `/password-reset` redirects to the frontend reset page.                                                                                                                               |

## Backend extensions

The paired backend changes provide:

- Stable UUID tie breakers for event, attribute, form and email lists.
- Participant server search, column filters and native attribute sorting, with
  count and rows using the same filters. Search includes numeric, boolean and
  array values. SQL values are parameterized and sort fields are validated.
- Paginated email delivery history with server search, status filters and sorting.
- Paginated public/private block occupants and correct unlimited-block counts.
- Form-scoped public participant prefilling via `formUuid`. A form must belong
  to the requested event; returned attributes must belong to its definitions.
  This includes fields hidden from the participant table. The default public
  participant read retains its `showInList` restriction.

No database schema migration, database reset or reseed was performed. Existing
backend seed edits were preserved.

## Local demo data

`antekczaplicki@gmail.com` is active and has the `superadmin` role. Three owned,
public, verified demo events remain: Hackathon Wrocław, Warsztaty React and
Spotkanie organizatorów. Each has three fake participants with `.invalid`
addresses. Existing event/form data was preserved. Temporary QA events were
removed; the local database contains seven events after cleanup.

## Verification

See [BROWSER_QA.md](./BROWSER_QA.md) for observed browser cases and release gates.
Latest native-contract checks:

- Frontend unit/component tests: **60 passed, 7 skipped**.
- Frontend and backend TypeScript checks: passed.
- Backend affected service/controller tests: **170 passed in 13 suites**.
- Isolated production build with Webpack: passed; the running demo's `.next`
  directory was preserved.
- Focused frontend/backend ESLint: passed. Full frontend lint reports **22
  existing errors** in unchanged shared UI, message-tag imports and editor types.
- Full frontend formatting check and `git diff --check`: passed.
- API probes verified native search/filter/sort, prefill privacy scope and saved
  trigger configuration. Browser checks verified persisted participant values.

Successful real CAPTCHA submission, actual email delivery, credential changes,
all organizer permission combinations, irreversible UI deletion and additional
browser engines remain release gates. Existing v2 slug-based personalized links
also require a data migration or redirect strategy. No deployment or production
migration is included.
