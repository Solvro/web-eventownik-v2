# V3 migration browser QA

## Architecture audit — 18 October 2026 (latest)

This supersedes the earlier participant-query and Turnstile implementation notes.

- Removed the frontend workaround that downloaded every participant to search,
  sort and filter. Unsupported controls are disabled; server order is preserved.
  Native pages still load on scroll, without pagination controls. Selection
  applies to loaded rows and does not trigger a full download.
- Created [backend #156](https://github.com/Solvro/backend-eventownik-v3/issues/156).
  Current develop only implements exact attribute filters and ignores `sort`.
  A local unpublished implementation exists; no matching published PR or issue
  was found. Backend source was left unchanged.
- Removed silent truncation of hidden-column requests. The backend validates its
  own `bonusAttributes` limit; the frontend no longer drops requested columns.
- Replaced the custom Turnstile renderer and legacy environment alias with
  `@marsidev/react-turnstile`, as used in frontend PR #425. Backend PR #150 is
  already merged. The canonical public variable is `NEXT_PUBLIC_TURNSTILE_SITEKEY`.
- Added the exact PR preview hostname to the existing Cloudflare widget. Retained
  production and localhost hostnames, Managed mode and disabled pre-clearance.
  Saved the public key under its canonical name in both Coolify build scopes.
  No backend secret was inspected or changed.
- Browser: verified 100/105 initially loaded, disabled unsupported query controls,
  then a real scroll fetched the remaining page through participant 105. No page
  controls appeared. Standard Turnstile script and response field mounted on the
  local public form. CAPTCHA execution/submission remains unverified.
- Shortened the nine review replies and linked the missing query operations to
  the backend issue. The email-grid screenshot below records the verified Chrome layout.

![Email templates](docs/qa/pr431/email-tiles.jpg)

Validation: 97 tests in 16 files passed; TypeScript and formatting passed. Fresh
full lint reports 22 existing errors and 10 warnings, with no errors in the changed
source.
Current command logs use `/tmp/eventownik-audit-*.log`. Earlier test counts below
refer to the removed implementation and its tests.

## PR #431 review follow-up — 18 October 2026

This section supersedes older runtime and validation claims below. Claude wrote
the frontend patches; Codex reviewed them and performed Chrome QA. After Claude
reached its account limit, the user authorized Codex to finish lint cleanup.
Backend source changes present before this run were preserved: its tracked diff
SHA-256 stayed `7c7b740825a19c48fc672e4ca79cedafaae710cdc72a7f65baf55ef713eaaa12`.
No backend fixes, commits, pushes, deployments or email sends were made.

### Observed browser results

QA used the existing synthetic local event with 105 participants, 23 forms and
23 email templates. Preview failures were reproduced against the deployed PR.
Production was not changed. The local frontend ran with `TZ=UTC`; Chrome used
Warsaw time. Existing local backend extensions are not deployed, so successful
local ordering does not establish preview compatibility.

| Case                        | Result                                                                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form date/time drift        | Opening 19 October at 12:00 and closing 28 October at 12:00 survived repeated saves and reloads, crossing the DST boundary. The QA form was restored to manual opening/closing.                   |
| Block drop animation        | Actual pointer drag settled with two aligned cards, no displaced ghost, opacity 1 and no residual transform. Order survived reload locally; the original order was restored.                      |
| Event visibility            | Settings saved private, stayed private after reload, and the public event returned 404. Public visibility was restored.                                                                           |
| Continuous participants     | Scrolled through row 105 with no pagination navigation or page-size selector.                                                                                                                     |
| Global search and sorting   | Search found participant 104 beyond the first API page. Descending name sorting put participant 104 first.                                                                                        |
| Filters                     | Checkbox filter returned the expected empty result; reset restored all 105 participants.                                                                                                          |
| Hidden columns              | Hidden QA notes appeared in Columns and showed their fetched values when enabled.                                                                                                                 |
| Selection                   | Header checkbox selected 105 of 105. Email dialog showed 105 recipients and was cancelled without sending. The final checkbox label describes all loaded rows correctly.                          |
| Draft protection            | Changing the view prompted before discarding an edited participant. Cancel preserved the draft; the draft was then discarded without saving.                                                      |
| Email/form tile sizes       | Both measured 285 by 256 pixels at the same desktop viewport.                                                                                                                                     |
| Turnstile initialization    | Public site key found in the local environment. Official Cloudflare script and `cf-turnstile-response` input mounted; no hCaptcha script/input remained. No challenge or submission was executed. |
| Preview form/email ordering | Both saves failed. Current remote backend controllers have no reorder endpoints.                                                                                                                  |
| Preview block occupancy     | Reproduced NaN total, zero counts and occupants fetch error. Current remote backend omits occupancy counts and the expected occupants endpoint.                                                   |

Retry after attribute-loading failure, failed later-page recovery, deferred
select-all, mixed page totals and overlapping pages are covered by component
tests. Those failure states were not injected into the real browser. Default
oldest-first sorting is tested with 150 registrations whose dates differ from
email page order; the local browser fixture has identical registration times.

### Backend-related findings left untouched

- Form/email ordering needs persisted reorder endpoints. Frontend queuing and
  rollback are repaired, but preview order cannot persist without those routes.
- Block counts and occupants need the corresponding API data/routes. Missing
  totals now display a dash instead of NaN; this does not supply actual counts.
- XLSX datetime formatting and block-name lookup happen in the backend export.
- Deployed participants listing cannot sort/search/filter. The frontend loads
  native API pages and applies these operations over the complete collection.
  This requires loading all participants for a correct global view.
- `bonusAttributes` has a backend limit of 1000 characters. The current request
  helper caps the list at that limit, so more than approximately 27 simultaneously
  revealed hidden non-block attributes remain a known limitation.

### Verification limits and evidence

Successful real CAPTCHA-backed registration remains unverified. The unchanged
local backend still expects its older CAPTCHA contract, while remote develop
uses Turnstile. Real email delivery, extra browser engines and broad permission
coverage were not retested. Optional 320-pixel QA could not finish because the
browser DOM/viewport controls timed out; native Chrome controls remained usable.

Screenshots are stored in
`/Users/antoniczaplicki/.codex/visualizations/2026/09/30/01a0f3f0-61b1-7f42-b7b9-7c8eab01f933/eventownik-review-2026-10-18/`:

- `participants-last-row-no-pagination.jpg`
- `blocks-after-drag.jpg`
- `form-time-utc-dst.jpg`
- `event-visibility-private.jpg`
- `matching-email-tile-size.jpg`
- `public-form-turnstile.jpg`

Checks and final lint results are recorded in the follow-up validation entry
at the end of this document.

Run: 30 September–1 October 2026, local Next.js frontend on port 3000 and v3 backend on port 3334. Browser: Codex in-app Chromium browser. Branch: `refactor/backend-v3-migration` (from `develop`).

## Result

The workflows below were exercised in the browser. The initial run used the transitional API adapter; the native-contract follow-up records checks after its removal. Reproduced frontend defects were fixed and retested. This is **not complete release sign-off**: successful public submission, delivery of real emails, credential completion, permission changes, destructive UI actions, and additional browser engines remain unverified.

A dedicated event contained all 15 supported attribute types, an occupied block, limited/unlimited blocks, registration and follow-up forms, simple/structured email templates, and 55 participants spanning multiple API pages. CSV import added two participants. All addresses used `.invalid`. Only this QA event was changed. Initial cleanup removed it and confirmed the other four local events remained present. The later demo setup and native follow-up are documented below. The backend was restarted after the outage test; no database reset or reseed was performed.

**Pass** means the stated behavior was observed. **Fixed → pass** means the original failure was reproduced, code changed, and the stated behavior retested. The rows group related inputs; they do not claim every combination of values was tested.

## Initial browser case matrix

| Area                      | Cases exercised                                                                     | Result                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Login                     | Empty fields; malformed email; short password; incorrect credentials                | Pass: validation and failure feedback                                                           |
| Login/session             | Seed login; logout; protected dashboard redirects; external redirect target         | Pass: authenticated navigation and redirect stays within app                                    |
| Account registration      | Empty form and required-field errors                                                | Pass; successful registration not completed                                                     |
| Password recovery         | Empty/invalid email; unknown email; missing/invalid reset link                      | Pass: validation, generic request response, invalid-link view                                   |
| Event wizard              | Empty name; malformed contact email; uppercase/spaced slug; participant limit zero  | Pass: invalid values blocked                                                                    |
| Event wizard              | Minimal valid event, equal start/end times, completion through all steps            | Pass: event created                                                                             |
| Settings/general          | Location edit; clearing contact email; reload after save                            | Pass: persisted values                                                                          |
| Settings/personalization  | Photo upload; adding, saving, removing links                                        | Pass: photo and links persisted                                                                 |
| Settings/empty links      | Save and switch settings tabs with no links                                         | Fixed → pass: empty link collection remains valid                                               |
| Settings/attributes       | Rename attribute; preserve block public participant fields                          | Fixed → pass: UUID references retained                                                          |
| Settings/organizers       | Existing organizer permission menu and checked/disabled owner permissions           | Pass: display only; new access not granted                                                      |
| Event deletion            | Open destructive confirmation and cancel                                            | Pass: warning shown and event preserved                                                         |
| Forms                     | Empty name/description errors; create follow-up form; required-field toggle         | Pass                                                                                            |
| Forms                     | Edit existing defaults; manual opening; automatic opening/closing on distinct dates | Pass: dates and settings persisted                                                              |
| Registration availability | Close manual registration; visit public page; reopen                                | Pass: closed view and restored form                                                             |
| Personalized form         | Load by form and participant UUID; prefill saved text and false checkbox            | Pass                                                                                            |
| Public required fields    | Email, text, number, select, required checkbox                                      | Pass: errors and entered values retained                                                        |
| Public scalar fields      | Text, textarea, number zero, email, telephone, color                                | Pass: input behavior; persistence through public submission blocked                             |
| Public date fields        | Date, time, datetime                                                                | Pass: entered values retained                                                                   |
| Public multiselect        | Select two options at maximum; attempt third; deselect one                          | Fixed → pass: limit enforced, deselection enables another choice                                |
| Public block choices      | Full capacity disabled; available/unlimited selectable; maximum displayed           | Pass                                                                                            |
| Public block privacy      | Occupant popover shows configured text field instead of exposing email              | Pass                                                                                            |
| Public files              | Invalid text file; oversized 11 MB file; valid PNG replacement                      | Fixed → pass: errors visible, replacement recovers                                              |
| Public files/submit       | Optional invalid file followed by submit                                            | Fixed → pass: invalid file cannot disappear from validation                                     |
| Public drawing            | Draw stroke; undo; clear                                                            | Pass: visual result checked                                                                     |
| CAPTCHA failure           | Submit valid required fields with missing local site key; retry                     | Fixed → pass: failure state is recoverable; values retained; no submission                      |
| Participants/pagination   | 55 records, then 57 after import; records beyond first API page                     | Pass                                                                                            |
| Participants/types        | Zero, false, date/time, multiselect and block values                                | Fixed → pass: block formatting no longer crashes table                                          |
| Participants/edit         | Change text and negative number; save and reload                                    | Fixed → pass: only changed values sent, immutable metadata preserved                            |
| Participants/cancel       | Change value; cancel; discard confirmation                                          | Pass: prior value restored                                                                      |
| Participants/bulk edit    | Set selected checkbox values to false; reload                                       | Fixed → pass: explicit false persists                                                           |
| Participants/selection    | Select row, filter it out, inspect count/actions                                    | Fixed → pass: actions operate on visible filtered selection                                     |
| Participants/search       | Matching search; no results; reset all filters                                      | Fixed → pass: reset also clears global search                                                   |
| Participants/filtering    | Checkbox true filter excludes false rows                                            | Pass                                                                                            |
| Participants/sorting      | Sort and reset sorting                                                              | Pass                                                                                            |
| Participants/columns      | Hide a column                                                                       | Pass                                                                                            |
| Participants/import       | CSV auto mapping; two new rows; duplicate input and already registered address      | Pass: total increased by two, duplicates skipped; full duplicate-warning detail not captured    |
| Participants/email dialog | No-template validation; available template choices; cancel                          | Pass: no actual send performed                                                                  |
| Participants/export       | Click browser export                                                                | Incomplete: no UI error, but browser download event timed out; API XLSX smoke passed separately |
| Blocks                    | Private occupancy; participant display                                              | Pass                                                                                            |
| Blocks/create             | Empty name; negative capacity; unlimited capacity                                   | Pass: invalid values blocked, unlimited block created                                           |
| Blocks/edit               | Rename and set capacity three; reload                                               | Pass                                                                                            |
| Simple email              | Empty list; empty title/body errors; form trigger missing target                    | Pass                                                                                            |
| Simple email              | Create, edit, save, reopen; UUID form target; change trigger to manual              | Pass                                                                                            |
| Simple email/markers      | Event-name marker returned as canonical empty span; reopen and resave               | Fixed → pass: marker stays editable and preserved                                               |
| Email history             | Empty history and zero count                                                        | Pass                                                                                            |
| Structured email          | Create/edit routes; event context; content/schema save and reopen                   | Fixed → pass: UUID route parameters and backlinks work                                          |
| Structured email/mobile   | Phone preview and settings panel; panel toggle; horizontal overflow                 | Fixed → pass: stacked panels and named toolbar controls                                         |
| Administration            | Event list; deactivate/reactivate QA event                                          | Pass: reversible QA event only                                                                  |
| Verification semantics    | Direct public URL of unverified event                                               | Observed accessible: backend verification controls public listing, not direct access            |
| Privacy page              | List collected registration fields from public form details                         | Fixed → pass: all 15 registration attributes displayed                                          |
| Missing resources         | Missing event, form UUID, participant UUID                                          | Pass: localized failure views                                                                   |
| Backend outage/settings   | Stop backend; save edited location; restore backend; retry save                     | Fixed → pass: visible error, save reenabled, value retained and later persisted                 |
| Backend outage/public     | Load public event and registration with backend stopped                             | Fixed → pass: temporary-unavailability message replaces false “not found”                       |
| Responsive registration   | 320, 390, 768, 1440 px                                                              | Pass: no document horizontal overflow                                                           |
| Responsive participants   | 320, 390, 768 px                                                                    | Fixed → pass: all toolbar actions fit at 320 px                                                 |

## Initial regression coverage and checks

- `npm run test -- --run`: **55 passed, 7 skipped**. New coverage includes API network failure, block public-field references, missing-service display, empty links, canonical mentions, multiselect limits, CAPTCHA retry/watchdog behavior, file MIME preservation, and invalid optional-file submission.
- CAPTCHA timeout and open-challenge behavior were tested with an SDK mock. These are unit results, not completed real CAPTCHA challenges.
- Production build: passed after the QA fixes.
- Focused ESLint on changed TypeScript files: passed.
- Full repository typecheck still reports **16 existing test-fixture errors**. These were reproduced on the original `develop` baseline before the migration.
- Full repository lint still reports **27 existing errors** outside the changes; baseline failures are documented in `V3_MIGRATION.md`.
- `npm run format:check`: passed for the full repository.
- `git diff --check`: passed.
- Earlier v3 API smoke covered auth refresh/logout, event/attribute/form/participant/block/email operations, organizer permission responses, XLSX export and cleanup. The earlier expired-session smoke verified same-request server refresh. These complement the browser run; they are not browser evidence.

## Native-contract follow-up

Completed in the same checkout after removing `apiFetch`, response normalization,
legacy public pivot fields and automatic list hydration. A disposable unverified
public event contained 13 participants, six form fields, two occupied blocks,
23 email templates and 13 synthetic delivery history entries. No messages were
sent. Its hidden textarea and an unrelated private field tested prefill scope.

| Area                   | Case                                                                                                     | Result                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Events/admin           | Page size two; next page; native counts                                                                  | Pass                                                                                 |
| Forms                  | Native summaries, detail definitions and registration marker                                             | Pass                                                                                 |
| Participants           | 13 rows; zero/false/arrays; page sizes 10/20; second-page row numbers                                    | Pass                                                                                 |
| Participants           | Server search for one address; full-block filter; descending name sort across pages                      | Pass                                                                                 |
| Participants           | Change a draft then change page size; cancel; discard the row edit                                       | Pass: cancellation retained the draft; discard restored server data                  |
| Participants           | Save name, number seven and checkbox true; reload                                                        | Pass: saved values persisted; unchanged multiselect and block arrays remained intact |
| Public follow-up       | Saved participant values, selected full block, maximum two selections                                    | Pass                                                                                 |
| Public follow-up       | Existing textarea hidden from participant list                                                           | Fixed → pass: form-scoped native read prefills the answer                            |
| Prefill privacy        | Default read hides private fields; scoped read excludes field outside form; cross-event form returns 404 | Pass via API probes; hidden field visible in browser form                            |
| Public blocks          | Unlimited count 13; full capacity one; occupant pages 10+3                                               | Pass: configured names only                                                          |
| Private blocks         | Native occupancy and paginated occupants 10+3                                                            | Pass                                                                                 |
| Email list             | 23 native summaries; second page three; disabled next control                                            | Pass                                                                                 |
| Email history          | 13 synthetic entries; pages 10+3; address search count one                                               | Pass                                                                                 |
| Simple editor          | Native content; leave unchanged                                                                          | Fixed → pass: no false unsaved-change prompt                                         |
| Structured editor      | Native JSON schema, title, preview and controls                                                          | Pass                                                                                 |
| Attribute-change email | Missing target validation; choose checkbox; save expected false; reopen                                  | Pass: translated validation, saved configuration; DB confirmed boolean false         |
| Demo regression        | Demo details/settings/public registration and catalog after cleanup                                      | Pass                                                                                 |

The preserved Hackathon demo's 68 forms were also paged through all four pages.
The final page showed eight rows and disabled Next. Fixed-width cards originally
overlapped their grid columns; form and email cards now fill their columns.
Browser measurements showed no document overflow at 320, 768 and 1280 px
for forms, and at 320 and 768 px for the populated email list.

Current checks supersede initial check counts above:

- Frontend: **60 tests passed, 7 skipped**; typecheck passed.
- Backend: **170 tests passed in 13 affected suites**; typecheck passed.
- Focused lint passed for changed frontend/backend TypeScript files.
- Full frontend lint retains **22 errors in unchanged files**. Test fixture type
  errors from the initial run have been fixed for the native contract.
- Isolated Webpack production build passed without replacing the live `.next`.
- Full frontend format check and both repositories' `git diff --check` passed.

Cleanup deleted only the disposable native QA event and its dependent data,
using an identity/owner guard against the local test database. Seven events
remain, including Antek's three demo events. Antek remains an active superadmin.
The Hackathon demo had 68 forms at cleanup; all were preserved. No reset or reseed
was performed.

Native evidence in the existing screenshot directory:

- `native-participant-pagination.jpg`: native pagination, three rows on page two.
- `native-participant-save.jpg`: persisted name, number and checkbox values.
- `native-public-prefill.jpg`: typed values and hidden textarea prefilled.
- `native-email-trigger.jpg`: attribute-change trigger editor.
- `native-demo-form-pagination.jpg`: final page of the preserved demo form list.

Command evidence: `/tmp/eventownik-native-full-tests.log`,
`/tmp/eventownik-native-final-typecheck.log`,
`/tmp/eventownik-native-backend-final-tests.log`,
`/tmp/eventownik-native-backend-final-typecheck.log`,
`/tmp/eventownik-native-isolated-build.log`,
`/tmp/eventownik-native-focused-lint.log`,
`/tmp/eventownik-native-backend-final-lint.log`,
`/tmp/eventownik-native-full-lint.log`,
`/tmp/eventownik-native-cleanup.log`.

## Remaining release gates

1. Configure the local Turnstile site key and matching backend verification configuration, then complete successful registration and personalized update, duplicate registration, full-event limits, file-token persistence, retry after API validation, and concurrent last-place allocation. No CAPTCHA guard was bypassed.
2. Configure a local mail sink or working SMTP, then verify reset/registration emails, actual campaign sends, automatic triggers, worker retries, delivery history and personalization output. Placeholder SMTP prevents useful delivery evidence.
3. Complete account registration and password reset/change with user-entered credentials. Browser automation requires user handoff for new credentials; these final flows were not performed.
4. Use additional organizer accounts to verify every permission boundary, access revocation, invitation/grant, and unauthorized direct routes. Only owner/admin display was tested; granting new access requires confirmation under browser automation policy.
5. Exercise irreversible delete/unregister paths in an explicitly approved disposable workflow. Event deletion confirmation/cancel was tested; final UI deletion was not executed. QA fixture cleanup used the local API.
6. Verify exported browser download contents. This browser session did not provide a completed download artifact, despite successful API XLSX coverage.
7. Run Chromium, Firefox and WebKit E2E, real touch-device and keyboard/screen-reader testing, language/theme switching, and a migrated legacy database. This run used one browser engine, Polish and the existing dark theme.
8. Review privacy disclosure against follow-up-only fields and sensitivity metadata. The public v3 API supplies registration-form fields but no public list of every follow-up form; no legal-content review was performed.

## Evidence

Saved screenshots are outside the source tree:

`/Users/antoniczaplicki/.codex/visualizations/2026/09/30/01a0f3f0-61b1-7f42-b7b9-7c8eab01f933/eventownik-qa/`

- `mobile-participants-320.jpg`: corrected participant toolbar at 320 px.
- `mobile-register-320.jpg`: public registration at 320 px.
- `mobile-email-editor-390.jpg`: structured email preview with stacked fields panel.
- `block-email-editor.jpg`: saved structured email editor.
- `settings-recovery.jpg`: settings value saved after outage recovery.

Local command logs are in `/tmp/eventownik-qa-*-final.log`; focused lint is `/tmp/eventownik-qa-focused-lint.log`. No tokens or browser session data are included in the report or screenshots.

## Follow-up validation — 18 October 2026

- `npm run test -- --run`: **106 tests passed in 18 files**.
- After the final selection callback cleanup, the five participant-loader tests
  passed again.
- `npm run typecheck`, `npm run format:check` and `git diff --check`: passed.
- Fresh full lint (`npm run lint -- --no-cache`): **22 errors and 12 warnings**.
  Every error is in unchanged shared UI, message-tag or editor-type files.
  The changed participant loader has two effect-related warnings; one warning
  is additional to the previous repository baseline. Changed source/tests have
  no lint errors.
- Backend tracked diff hash remained identical to the start of the review.
- No production build or multi-browser E2E run was performed for this follow-up.

Command evidence: `/tmp/eventownik-pr431-final-tests.log`,
`/tmp/eventownik-pr431-final-typecheck.log`,
`/tmp/eventownik-pr431-final-format.log`,
`/tmp/eventownik-pr431-final-lint.log`,
`/tmp/eventownik-pr431-selection-lint.log` and
`/tmp/eventownik-pr431-selection-tests.log`.
