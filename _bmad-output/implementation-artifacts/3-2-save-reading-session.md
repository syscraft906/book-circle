# Story 3.2: Save Reading Session

Status: ready-for-dev

<!-- Note: Story updated 2026-03-01 - Changed to support countdown timer auto-save and early-stop confirmation per sprint change proposal -->

## Story

As a **user**,
I want **to save my reading session when the countdown completes or when I stop early**,
so that **it counts toward my streak and I can track my reading progress**.

## Acceptance Criteria

1. **Auto-Save on Countdown Completion:** Given the countdown timer completes (reaches 0:00), When the session auto-saves, Then a ReadingSession record is created with: userId, bookId, duration, startedAt, endedAt, And the book's progress is optionally updated (prompt: "Update progress?"), And my daily reading total is recalculated, And I see a success toast: "Session logged: [X] minutes", And the timer state is cleared, And the overlay dismisses.

2. **Early Stop Confirmation Display:** Given I tap "Stop Early" on the countdown overlay, When the confirmation popup appears, Then I see the message: "Time not finished yet. Save session anyway?", And I see the elapsed time so far (e.g., "12 minutes of 30 minutes"), And I see a "Save Session" button (primary), And I see a "Keep Reading" button (secondary), And I see a "Discard" option (tertiary/link).

3. **Save Early Session:** Given I tap "Save Session" on the early stop confirmation, When the session is saved, Then a ReadingSession record is created with actual elapsed time (not preset time), And the book's progress is optionally updated (prompt: "Update progress?"), And my daily reading total is recalculated, And I see a success toast: "Session saved: [X] minutes", And the timer state is cleared, And the overlay and popup dismiss.

4. **Keep Reading:** Given I tap "Keep Reading" on the early stop confirmation, When the popup closes, Then the countdown overlay remains active, And the timer continues from where it was, And I can continue reading.

5. **Discard Session:** Given I tap "Discard" on the early stop confirmation, When I confirm discard, Then the session is not saved, And the timer state is cleared, And the overlay and popup dismiss, And I return to the home page.

6. **Offline Save:** Given I save a session while offline, When the session is saved locally, Then it is queued in useOfflineStore, And I see a toast: "Session saved offline. Will sync when connected.", And the session syncs automatically when back online.

7. **Minimum Duration:** Given I stop early after less than 1 minute, When I try to save, Then I see a message: "Sessions under 1 minute aren't saved. Keep reading!", And the session is discarded, And the overlay dismisses.

## Tasks / Subtasks

- [ ] **Task 1: Implement auto-save on countdown completion** (AC: #1)
  - [ ] In `CountdownOverlay` (Story 3.1), detect when countdown reaches 0:00
  - [ ] Call `saveReadingSession` action with full preset duration
  - [ ] Show success toast: "Session logged: [X] minutes"
  - [ ] Dismiss overlay and reset timer state
  - [ ] Handle offline scenario (queue to useOfflineStore)
  - [ ] Handle errors gracefully with error toast

- [ ] **Task 2: Create early-stop confirmation dialog** (AC: #2, #3, #4, #5)
  - [ ] Create `src/components/features/sessions/EarlyStopConfirmation.tsx` as client component
  - [ ] Use shadcn `AlertDialog` for the confirmation popup
  - [ ] Display message: "Time not finished yet. Save session anyway?"
  - [ ] Show elapsed vs preset time: "[X] minutes of [Y] minutes"
  - [ ] Three buttons: "Save Session" (primary), "Keep Reading" (secondary), "Discard" (link)
  - [ ] "Save Session": calls saveReadingSession with actual elapsed time, closes dialog and overlay
  - [ ] "Keep Reading": closes dialog only, returns to countdown overlay
  - [ ] "Discard": closes dialog and overlay, resets timer state
  - [ ] Handle < 60s edge case: show error message instead of save option
  - [ ] Create co-located test file `EarlyStopConfirmation.test.tsx`

- [ ] **Task 3: Integrate early-stop confirmation into CountdownOverlay** (AC: #2, #6)
  - [ ] In `CountdownOverlay`, add "Stop Early" button (from Story 3.1)
  - [ ] On "Stop Early" click, show `EarlyStopConfirmation` dialog
  - [ ] Pass elapsed time, preset time, bookId, bookTitle to dialog
  - [ ] Handle dialog callbacks (save/keep reading/discard)
  - [ ] Update tests to cover early-stop flow

- [ ] **Task 4: Update saveReadingSession action for countdown timer** (AC: #1, #3, #7)
  - [ ] Review existing `src/actions/sessions/saveReadingSession.ts`
  - [ ] Ensure it handles both full preset duration and early-stop partial duration
  - [ ] Maintain validation: duration >= 60 seconds
  - [ ] Return appropriate error for < 60s sessions
  - [ ] Update tests to cover countdown completion and early-stop scenarios

- [ ] **Task 5: Implement "Update progress?" prompt** (AC: #1, #3)
  - [ ] After successful session save, show optional dialog: "Update progress?"
  - [ ] Allow user to update book reading progress (percentage or pages)
  - [ ] This may integrate with future story for progress tracking
  - [ ] For now, show the prompt but make it dismissible/optional

- [ ] **Task 6: Update useOfflineStore integration** (AC: #6)
  - [ ] Ensure offline detection works in both auto-save and early-stop scenarios
  - [ ] Queue sessions to useOfflineStore when offline
  - [ ] Show toast: "Session saved offline. Will sync when connected."
  - [ ] Test offline sync when connection restored

- [ ] **Task 7: Write integration tests** (All AC)
  - [ ] Test: Countdown reaches 0:00 triggers auto-save
  - [ ] Test: Auto-save creates ReadingSession with full preset duration
  - [ ] Test: Auto-save shows success toast and dismisses overlay
  - [ ] Test: "Stop Early" button shows confirmation dialog
  - [ ] Test: Confirmation dialog displays elapsed vs preset time
  - [ ] Test: "Save Session" on dialog saves with actual elapsed time
  - [ ] Test: "Keep Reading" closes dialog and resumes countdown
  - [ ] Test: "Discard" closes dialog and overlay without saving
  - [ ] Test: < 60s early stop shows error message
  - [ ] Test: Offline save queues to useOfflineStore
  - [ ] Test: Online event triggers sync of queued sessions

## Dev Notes

### Architecture Patterns & Constraints

- **Server Action pattern:** All server actions return `ActionResult<T>` discriminated union. Validate with Zod first, authenticate via `auth.api.getSession({ headers: await headers() })`, then perform DB operation. See `src/actions/books/updateReadingStatus.ts` for reference.
- **Prisma model conventions:** PascalCase model names, `@@map("snake_case")` for table names, `@map("snake_case")` for column names. Add indexes on foreign keys. Use `@default(cuid())` for IDs.
- **Zustand store conventions:** Architecture enforces exactly 4 bounded stores: `useTimerStore`, `usePresenceStore`, `useOfflineStore`, `useUserStore`. Store naming: `use{Domain}Store`. States are nouns, actions are verbs, computed use get/is prefix.
- **Import convention:** ALWAYS use `@/` alias for cross-boundary imports. Never relative.
- **Toast notifications:** Use `import { toast } from 'sonner'` - `toast.success()`, `toast.error()`, `toast.loading()`.
- **Component file limit:** ~200 lines per file. Extract utilities.
- **Test co-location:** Place test files next to source: `SessionSummary.test.tsx` alongside `SessionSummary.tsx`.

### Source Tree Components to Touch

**New files:**
- `prisma/schema.prisma` (modify - add ReadingSession model)
- `src/actions/sessions/saveReadingSession.ts` (new)
- `src/actions/sessions/types.ts` (new - or reuse books/types.ts ActionResult)
- `src/actions/sessions/index.ts` (new barrel)
- `src/components/features/sessions/SessionSummary.tsx` (new)
- `src/components/features/sessions/SessionSummary.test.tsx` (new)
- `src/stores/useOfflineStore.ts` (new)
- `src/stores/useOfflineStore.test.ts` (new)
- `src/hooks/useOfflineSync.ts` (new)

**Modified files:**
- `src/components/features/sessions/SessionTimer.tsx` (integrate SessionSummary on stop)
- `src/components/features/sessions/SessionTimer.test.tsx` (update for new flow)
- `src/components/features/sessions/index.ts` (add SessionSummary export)
- `src/stores/index.ts` (add useOfflineStore export)
- `src/types/database.ts` (add ReadingSession type export)
- `src/hooks/index.ts` (add useOfflineSync export if barrel exists)

### Critical Implementation Details

- **Timer store `stop()` currently only sets `isRunning: false`** - it does NOT reset state. This is correct for Story 3.2 because we need `startTime`, `currentBookId`, `currentBookTitle` to persist after stop so SessionSummary can read them. Only call `reset()` after save/discard.
- **Duration calculation:** `endedAt - startedAt` in seconds. The timer store stores `startTime` as `Date.now()` (Unix ms). Convert: `startedAt = new Date(startTime).toISOString()`, `endedAt = new Date().toISOString()`, `duration = Math.floor((endedAt_ms - startTime) / 1000)`.
- **Book ID mapping:** BookDetailActions passes `book.isbn13 || book.isbn10 || book.id` as bookId to SessionTimer. The ReadingSession.bookId should reference the Book table's `id` field (cuid). You may need to resolve ISBN → Book.id in the server action, or pass Book.id directly.
- **Minimum 60 seconds:** Enforce both client-side (SessionSummary shows message) and server-side (Zod validation `z.number().min(60)`).
- **No date-fns in dependencies yet.** For date formatting, use native `Intl.DateTimeFormat` or `Date.toLocaleDateString()`. Do NOT add date-fns unless absolutely necessary.
- **Offline store:** This is one of the 4 architecturally-approved Zustand stores. Use same IndexedDB persistence pattern as useTimerStore.

### Testing Standards

- **Framework:** Vitest + React Testing Library
- **Mock patterns:** Mock `@/lib/auth` and `@/lib/prisma` in server action tests. Mock server actions in component tests. Mock `useTimerStore` via Zustand's `setState` in component tests.
- **Assertions:** Test user-visible behavior (text, toasts, state changes), not implementation details.
- **Accessibility:** Verify aria attributes, touch targets >= 44px, screen reader text.

### Previous Story 3.1 Learnings

- Zustand hydration is async (IndexedDB). Use `_hasHydrated` flag and show skeleton while loading.
- `partialize` in persist config to only persist needed fields. Do NOT persist runtime flags.
- `onRehydrateStorage` callback to restore runtime state from persisted values.
- AlertDialog from shadcn/ui works well for confirmation flows (used for timer conflict).
- Co-locate `formatTime` utility in feature's `types.ts`, not in a global utils file.
- Tests mock `idb-keyval` to prevent actual IndexedDB access: `vi.mock('idb-keyval')`.
- ActiveSessionIndicator renders `null` before hydration (not skeleton) to avoid flash.

### Git Intelligence

Recent commits show consistent patterns:
- Commit message format: `feat: Implement [feature] with code review fixes (Story X.Y)`
- Each story commits all new files + modified files together
- Tests are always included in same commit as implementation
- No separate branches per story (direct to main)

### Project Structure Notes

- Alignment: Server actions organized by domain (`src/actions/sessions/` for session actions, parallel to `src/actions/books/`)
- Feature components in `src/components/features/sessions/` (already exists from Story 3.1)
- Stores in `src/stores/` with barrel export from `index.ts`
- The `ActionResult` type in `src/actions/books/types.ts` should be reused (import from there) or moved to a shared location like `src/types/action.ts` if creating a new action domain

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-3-reading-sessions-habit-tracking.md#Story 3.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions - Frontend State Management]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR13-FR16]
- [Source: _bmad-output/implementation-artifacts/3-1-session-timer-with-persistence.md#Dev Notes]
- [Source: prisma/schema.prisma#UserBook model]
- [Source: src/stores/useTimerStore.ts#stop action]
- [Source: src/actions/books/updateReadingStatus.ts#ActionResult pattern]
- [Source: src/components/features/sessions/SessionTimer.tsx#stop flow]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed Zod v4 API: `error.errors` → `error.issues` for ZodError handling
- Added `@/actions/sessions` mock to SessionTimer.test.tsx, integration.test.tsx, BookDetailActions.test.tsx, AppShell.test.tsx to prevent DATABASE_URL errors from transitive imports
- Added `@/hooks/useOfflineSync` mock to AppShell.test.tsx
- `npx prisma db push` skipped (no local database) - run manually when DB is available

### Completion Notes List

- ReadingSession Prisma model created with all required fields, relations, and indexes
- saveReadingSession server action follows established ActionResult pattern, reuses ActionResult type from books/types.ts (no separate types.ts needed)
- SessionSummary component handles all 3 flows: save (online), save (offline), discard with confirmation
- SessionTimer.tsx modified to show SessionSummary after stop instead of immediately resetting - captures duration and startTime at stop time
- useOfflineStore created as one of the 4 architecturally-approved Zustand stores with IndexedDB persistence
- useOfflineSync hook mounted in AppShell for app-wide offline sync on reconnection
- All 550 tests pass (0 regressions), including 26 new tests across 3 new test files
- Pre-existing lint warnings remain (not introduced by this story)
- Pre-existing type error in ProfileView.test.tsx remains (not introduced by this story)

### File List

**New files:**
- prisma/schema.prisma (modified - added ReadingSession model + User/Book relations)
- src/actions/sessions/saveReadingSession.ts
- src/actions/sessions/saveReadingSession.test.ts
- src/actions/sessions/index.ts
- src/components/features/sessions/SessionSummary.tsx
- src/components/features/sessions/SessionSummary.test.tsx
- src/stores/useOfflineStore.ts
- src/stores/useOfflineStore.test.ts
- src/hooks/useOfflineSync.ts

**Modified files:**
- prisma/schema.prisma (added ReadingSession model, relations on User and Book)
- src/types/database.ts (added ReadingSession export)
- src/components/features/sessions/SessionTimer.tsx (integrated SessionSummary on stop)
- src/components/features/sessions/SessionTimer.test.tsx (added sessions/sonner mocks)
- src/components/features/sessions/integration.test.tsx (added sessions/sonner mocks)
- src/components/features/sessions/index.ts (added SessionSummary export)
- src/stores/index.ts (added useOfflineStore export)
- src/hooks/index.ts (added useOfflineSync export)
- src/components/layout/AppShell.tsx (added useOfflineSync hook call)
- src/components/layout/AppShell.test.tsx (added useOfflineSync and sessions mocks)
- src/components/features/books/BookDetailActions.test.tsx (added sessions mock)
