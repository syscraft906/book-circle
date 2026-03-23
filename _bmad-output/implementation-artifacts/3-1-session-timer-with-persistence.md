# Story 3.1: Session Timer with Persistence

Status: ready-for-dev

<!-- Note: Story updated 2026-03-01 - Changed from manual timer to preset countdown overlay design per sprint change proposal -->

## Story

As a **user**,
I want **a timer that tracks my reading session with preset time commitments**,
So that **I can set intentional reading goals and log how long I read**.

## Acceptance Criteria

1. **Given** I am on the home page **When** I view the page **Then** I see a "Log Reading" button prominently displayed

2. **Given** I tap "Log Reading" **When** the time selection popup appears **Then** I see preset time options: 15 min, 30 min, 45 min **And** the options are in 15-minute increments **And** I can select one option

3. **Given** I select a time preset (e.g., 30 minutes) **When** I tap "Start Logging" **Then** a full-screen countdown overlay appears **And** the countdown shows remaining time (MM:SS format) **And** the timer state is persisted to IndexedDB via Zustand **And** the book ID and preset duration are stored with the timer **And** the overlay blocks other app interactions (focus mode)

4. **Given** the countdown timer is running **When** I navigate away or close the app **Then** the timer state is preserved in IndexedDB **And** when I return, the countdown resumes from where it was **And** remaining time is calculated correctly from start timestamp and preset duration

5. **Given** the countdown reaches 0:00 **When** the timer completes **Then** the session is automatically saved (see Story 3.2) **And** I see a success message **And** the overlay dismisses **And** the timer state is cleared

6. **Given** the countdown is running **When** I want to stop early **Then** I see a dismiss/exit button on the overlay (e.g., "X" or "Stop Early") **And** tapping it shows a confirmation popup (see Story 3.2 for early save flow)

7. **Given** I have an active timer for Book A **When** I try to start a new timer for Book B **Then** I see a prompt: "You have an active session for [Book A]. End it first?" **And** I can end the current session or cancel

## Tasks / Subtasks

- [x] **Task 1: Update `useTimerStore` for countdown timer** (AC: #3, #4, #5)
  - [x] Update `src/stores/useTimerStore.ts`
  - [x] Add new state: `presetDuration` (number in seconds | null), `mode` ('countdown' | 'manual')
  - [x] Update `start()` to accept `presetMinutes` parameter and store both `startTime` and `presetDuration`
  - [x] Add new computed: `getRemainingSeconds()` (calculates: presetDuration - elapsed)
  - [x] Keep existing `getElapsedSeconds()` for compatibility
  - [x] Update persistence to include `presetDuration` and `mode`
  - [x] Update co-located test file `src/stores/useTimerStore.test.ts`

- [ ] **Task 2: Create preset time selection popup component** (AC: #2)
  - [ ] Create `src/components/features/sessions/TimePresetDialog.tsx` as `'use client'` component
  - [ ] Use shadcn `Dialog` component for the popup
  - [ ] Display three preset buttons: "15 min", "30 min", "45 min"
  - [ ] Each button calls `onSelectPreset(minutes)` callback
  - [ ] Include "Cancel" option to dismiss dialog
  - [ ] Styling: warm amber for selected/hover states, 44px touch targets
  - [ ] Create co-located test file `TimePresetDialog.test.tsx`

- [ ] **Task 3: Create full-screen countdown overlay component** (AC: #3, #4, #6)
  - [ ] Create `src/components/features/sessions/CountdownOverlay.tsx` as `'use client'` component
  - [ ] Full-screen modal with dark semi-opaque background (rgba(0,0,0,0.85))
  - [ ] Display large countdown timer in MM:SS format (48-72px font size)
  - [ ] Show current book title/cover for context
  - [ ] Include "Stop Early" button (top-right or bottom-center)
  - [ ] Block app interactions while active (modal behavior)
  - [ ] Use Framer Motion for overlay enter/exit animations (respect `prefers-reduced-motion`)
  - [ ] Accessibility: `aria-live="polite"` for minute updates, `role="dialog"`, focus trap
  - [ ] Create co-located test file `CountdownOverlay.test.tsx`

- [ ] **Task 4: Create "Log Reading" button on home page** (AC: #1, #2)
  - [ ] Update `src/app/(main)/home/page.tsx`
  - [ ] Add prominent "Log Reading" button (primary style, warm amber)
  - [ ] Clicking opens `TimePresetDialog`
  - [ ] After preset selection, opens `CountdownOverlay` with selected duration
  - [ ] Check for active session conflict before starting (AC #7)
  - [ ] Use existing `AlertDialog` pattern for conflict prompt

- [ ] **Task 5: Implement countdown completion auto-save** (AC: #5)
  - [ ] In `CountdownOverlay`, monitor when `getRemainingSeconds()` reaches 0
  - [ ] Show success message when timer completes
  - [ ] Call Story 3.2's save session action (will be created in Story 3.2)
  - [ ] Dismiss overlay and clear timer state
  - [ ] For now, use placeholder/mock for save action until Story 3.2 is complete

- [ ] **Task 6: Implement early-stop confirmation** (AC: #6)
  - [ ] Create "Stop Early" confirmation dialog component
  - [ ] Show message: "Time not finished yet. Save session anyway?"
  - [ ] Display elapsed time vs preset time (e.g., "12 minutes of 30 minutes")
  - [ ] Three options: "Save Session" (primary), "Keep Reading" (secondary), "Discard" (tertiary)
  - [ ] "Keep Reading" closes dialog and returns to countdown
  - [ ] "Save Session" and "Discard" handled by Story 3.2
  - [ ] Create co-located test file for confirmation dialog

- [ ] **Task 7: Remove old SessionTimer from BookDetailActions** (cleanup)
  - [ ] Update `src/components/features/books/BookDetailActions.tsx`
  - [ ] Remove the old SessionTimer integration (no longer on book detail page)
  - [ ] Restore or keep disabled "Log Session" placeholder button if needed
  - [ ] Update related tests

- [ ] **Task 8: Write integration tests** (AC: all)
  - [ ] Test: "Log Reading" button appears on home page
  - [ ] Test: Clicking "Log Reading" opens time preset dialog
  - [ ] Test: Selecting a preset (e.g., 30 min) opens countdown overlay
  - [ ] Test: Countdown displays remaining time in MM:SS format
  - [ ] Test: Countdown decrements every second
  - [ ] Test: "Stop Early" button shows confirmation dialog
  - [ ] Test: Confirmation dialog has three options
  - [ ] Test: "Keep Reading" closes dialog and resumes countdown
  - [ ] Test: Timer state persists across navigation
  - [ ] Test: Timer state persists across browser close/reopen
  - [ ] Test: Starting new timer while one is active shows conflict dialog
  - [ ] Test: Auto-save triggers when countdown reaches 0:00

## Dev Notes

### Architecture Compliance - CRITICAL

**Zustand Store Pattern (MUST follow exactly):**

The architecture document specifies exactly 4 Zustand stores with precise naming:

| Store | Responsibility | Persistence |
|-------|----------------|-------------|
| `useTimerStore` | Active session timer only | IndexedDB |
| `usePresenceStore` | Reading room presence only | Memory (volatile) |
| `useOfflineStore` | Sync queue only | IndexedDB |
| `useUserStore` | User preferences only | IndexedDB |

This story creates `useTimerStore` — the FIRST Zustand store in the project. All future stores MUST follow this pattern.

**Store State/Action Naming Convention:**
```typescript
interface TimerStore {
  // State (nouns)
  isRunning: boolean;
  startTime: number | null;
  currentBookId: string | null;
  currentBookTitle: string | null;
  _hasHydrated: boolean;

  // Actions (verbs)
  start: (bookId: string, bookTitle: string) => void;
  stop: () => void;
  reset: () => void;

  // Computed (get/is prefix)
  getElapsedSeconds: () => number;
  isActive: () => boolean;
}
```

**Timer Persistence Strategy (from Architecture):**
- IndexedDB via `idb-keyval` + Zustand persist
- Timer survives page navigation
- Syncs with server on session end (Story 3.2)
- Conflict resolution: server wins for completed sessions

**Import Alias Enforcement:**
```typescript
// ALWAYS use @/* for cross-boundary imports
import { useTimerStore } from '@/stores/useTimerStore';
import { idbStorage } from '@/lib/idb-storage';
import { SessionTimer } from '@/components/features/sessions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

// Relative imports OK within same feature folder
import { ActiveSessionIndicator } from './ActiveSessionIndicator';
```

**Server Action Pattern (for reference - saving session is Story 3.2):**
```typescript
// This story does NOT create server actions for saving sessions.
// Story 3.2 (Save Reading Session) will create:
//   src/actions/sessions/createSession.ts
//   src/actions/sessions/endSession.ts
// This story focuses purely on the client-side timer with persistence.
```

### Zustand 5 + idb-keyval Implementation Pattern - CRITICAL

**idb-storage adapter (create first):**
```typescript
// src/lib/idb-storage.ts
import { get, set, del } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof indexedDB === 'undefined') return null;
    return (await get(name)) ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof indexedDB === 'undefined') return;
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof indexedDB === 'undefined') return;
    await del(name);
  },
};
```

**useTimerStore pattern:**
```typescript
// src/stores/useTimerStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/idb-storage';

interface TimerState {
  // Persisted state
  startTime: number | null;       // Unix timestamp when timer started
  currentBookId: string | null;
  currentBookTitle: string | null;

  // Runtime-only state (NOT persisted)
  isRunning: boolean;
  _hasHydrated: boolean;

  // Actions
  start: (bookId: string, bookTitle: string) => void;
  stop: () => void;
  reset: () => void;

  // Computed
  getElapsedSeconds: () => number;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      startTime: null,
      currentBookId: null,
      currentBookTitle: null,
      isRunning: false,
      _hasHydrated: false,

      start: (bookId, bookTitle) => set({
        isRunning: true,
        startTime: Date.now(),
        currentBookId: bookId,
        currentBookTitle: bookTitle,
      }),

      stop: () => set({
        isRunning: false,
        // Keep startTime for potential save in Story 3.2
      }),

      reset: () => set({
        isRunning: false,
        startTime: null,
        currentBookId: null,
        currentBookTitle: null,
      }),

      getElapsedSeconds: () => {
        const { startTime } = get();
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
      },
    }),
    {
      name: 'timer-store',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        startTime: state.startTime,
        currentBookId: state.currentBookId,
        currentBookTitle: state.currentBookTitle,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Resume timer if startTime exists (browser was closed mid-session)
            if (state.startTime) {
              useTimerStore.setState({ isRunning: true });
            }
          }
          useTimerStore.setState({ _hasHydrated: true });
        };
      },
    }
  )
);
```

### Zustand 5 Gotchas - MUST READ

| Gotcha | Impact | Mitigation |
|--------|--------|------------|
| **Selector referential stability** | Selectors returning new arrays/objects cause infinite re-renders | Select single primitives, or use `useShallow` from `zustand/shallow` |
| **Async IndexedDB hydration** | Store starts with defaults, then updates async | Show skeleton until `_hasHydrated` is true |
| **SSR hydration mismatch** | Server renders defaults, client has persisted data | Always render skeleton/loading until hydrated — never render persisted data during SSR |
| **React 19 Strict Mode** | `useEffect` runs twice in dev | Always return cleanup function from `useEffect` (clear intervals) |
| **`createJSONStorage` handles serialization** | Do NOT JSON.parse/stringify in the `StateStorage` adapter | Just pass raw values through idb-keyval |
| **Initial state not auto-persisted** | In Zustand 5, initial state is NOT written to storage on creation (changed from v4) | This is expected behavior — data persists on first state change |

**Selector patterns:**
```typescript
// GOOD - select single primitives
const isRunning = useTimerStore((s) => s.isRunning);
const startTime = useTimerStore((s) => s.startTime);

// GOOD - use useShallow for multiple values
import { useShallow } from 'zustand/shallow';
const { isRunning, currentBookId } = useTimerStore(
  useShallow((s) => ({ isRunning: s.isRunning, currentBookId: s.currentBookId }))
);

// BAD - creates new array each render, infinite loop in Zustand 5
const [isRunning, bookId] = useTimerStore((s) => [s.isRunning, s.currentBookId]);
```

### Existing Components to Reuse - DO NOT RECREATE

| Component | Location | Usage in This Story |
|-----------|----------|-------------------|
| `Button` | `src/components/ui/button.tsx` | Start/Stop Reading buttons |
| `AlertDialog` | `src/components/ui/alert-dialog.tsx` | Timer conflict prompt (AC #5) |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Hydration loading state |
| `AppShell` | `src/components/layout/AppShell.tsx` | Integration point for ActiveSessionIndicator |
| `BookDetailActions` | `src/components/features/books/BookDetailActions.tsx` | Integration point for SessionTimer (replace disabled Log Session button) |
| `BookDetail` | `src/components/features/books/BookDetail.tsx` | Parent component providing bookId, bookTitle, bookStatus |
| `getMotionProps` | `src/lib/motion.ts` | Reduced-motion-safe animation props |
| `cn` | `src/lib/utils.ts` | Tailwind class merging utility |

### BookDetailActions Integration Point - CRITICAL

The file `src/components/features/books/BookDetailActions.tsx` (lines ~233-249) has **disabled placeholder buttons** for "Log Session" and "Update Progress":

```typescript
// CURRENT STATE (disabled placeholders):
<Button variant="outline" size="sm" disabled data-testid="log-session-button">
  <Clock className="mr-2 h-4 w-4" />
  Log Session
</Button>
<Button variant="outline" size="sm" disabled data-testid="update-progress-button">
  <BookOpen className="mr-2 h-4 w-4" />
  Update Progress
</Button>
```

**Replace the "Log Session" button with `<SessionTimer>` component.** Keep the "Update Progress" button disabled (future story).

The `SessionTimer` component receives `bookId`, `bookTitle`, and `bookStatus` as props. It should ONLY render the Start/Stop Reading UI when `bookStatus === 'CURRENTLY_READING'`. For other statuses, render nothing (or the original disabled button).

### Timer Display Format

```typescript
function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
```

### ActiveSessionIndicator Placement

In `AppShell.tsx`, add the `ActiveSessionIndicator` component. It should be:
- Positioned as a subtle banner/bar between the page header area and main content
- Visible on ALL pages when a timer is running
- Compact: shows book title (truncated) + running time + tap to navigate
- Uses warm amber accent color to match design system
- Disappears when no timer is active (renders null)
- Links to `/book/[currentBookId]` when tapped

### Data Shapes

**Timer Store State (client-side only — no database model in this story):**
```typescript
interface TimerState {
  startTime: number | null;       // Unix timestamp (ms)
  currentBookId: string | null;   // Book.id or ISBN
  currentBookTitle: string | null; // For display in indicator
  isRunning: boolean;             // Runtime-only
  _hasHydrated: boolean;          // Runtime-only
}
```

**Note:** This story does NOT create a `ReadingSession` database model. That is Story 3.2 (Save Reading Session). This story is purely client-side timer with IndexedDB persistence.

### UX Compliance - CRITICAL

**From UX Design Specification:**

**SessionTimer Component States:**

| State | Appearance | Trigger |
|-------|------------|---------|
| Ready | "Start Reading" button | Not yet started |
| Active | Running timer, "Stop" button | Session in progress |
| Complete | Success checkmark, time logged | Session ended (Story 3.2) |
| Goal Met | Celebration indicator | Daily goal achieved (Story 3.4) |

**For this story, implement only "Ready" and "Active" states.** Complete and Goal Met come in later stories.

**Behavior Requirements:**
- Works in background (browser backgrounded)
- Persists across page navigation
- Auto-saves progress every state change (Zustand persist handles this)

**Design System:**
- Primary button (warm amber) for "Start Reading"
- Destructive/secondary button for "Stop Reading"
- Timer display: monospace font, large readable numbers
- Amber accent for active session indicator
- Gentle pulse animation on active indicator (respect `prefers-reduced-motion`)

**Accessibility:**
- `aria-live="polite"` for timer updates (announce every minute, not every second)
- `aria-label="Start reading session"` / `"Stop reading session, elapsed time: X minutes Y seconds"`
- Clear button labels for screen readers
- 44px minimum touch targets

**Empty Room Principle:** Never show empty. If no timer is active, the Start Reading button is the call to action.

### Previous Story Intelligence - CRITICAL

**From Story 2.6 (Library View & Organization):**
- 479 tests total across the project — maintain this baseline, add tests for all new components
- `useReducer` pattern used in LibraryView to satisfy `react-hooks/set-state-in-effect` lint rule
- Pre-existing lint error in `BookDetailActions.tsx` (`set-state-in-effect`) — do NOT try to fix this, it's a known issue
- Pre-existing typecheck error in `ProfileView.test.tsx` — do NOT try to fix this either
- AlertDialog pattern already established (from Story 2.5 remove book with undo)
- Soft-delete pattern: ALL book queries filter `deletedAt: null`

**From Stories 2.3-2.5:**
- `BookDetail.tsx` manages state: `isInLibrary`, `currentStatus`, `progress`
- `BookDetailActions` receives these as props and renders action buttons
- Optimistic UI pattern established for status changes
- `BookReadersCount` component shows social proof
- Book identifier for URLs: `book.isbn13 || book.isbn10 || book.id`

### Git Intelligence Summary

**Recent commits:**
```
8624f38 feat: Implement library view with tabbed organization and code review fixes (Story 2.6)
42ad437 feat: Implement remove book from library with undo and code review fixes (Story 2.5)
fb3d48c feat: Implement update reading status and code review fixes (Stories 2.3, 2.4)
```

**Patterns established:**
- Commit prefix: `feat:` for new features
- Story reference in commit message
- Co-located test files with `.test.tsx` / `.test.ts` extension
- Server actions follow `ActionResult<T>` pattern consistently
- All book queries filter `deletedAt: null`
- Code review fixes applied in same commit as implementation

### Testing Strategy

**Unit Tests (Vitest + React Testing Library):**

`src/lib/idb-storage.test.ts`:
- getItem returns null for non-existent key
- setItem and getItem round-trip works
- removeItem deletes the value
- SSR safety: returns null when indexedDB undefined

`src/stores/useTimerStore.test.ts`:
- Initial state has null startTime and isRunning false
- `start()` sets isRunning, startTime, bookId, bookTitle
- `stop()` sets isRunning false, keeps startTime
- `reset()` clears all state
- `getElapsedSeconds()` calculates from startTime correctly
- Store state changes trigger subscribers
- Rehydration with existing startTime sets isRunning to true

`src/components/features/sessions/SessionTimer.test.tsx`:
- Renders "Start Reading" for CURRENTLY_READING books
- Does not render for WANT_TO_READ or FINISHED books
- Clicking Start sets timer running and shows elapsed time
- Clicking Stop stops the timer
- Shows conflict dialog when another book's timer is active
- Conflict dialog "End Session" resets old timer and starts new one
- Conflict dialog "Cancel" keeps current timer
- Shows skeleton during hydration

`src/components/features/sessions/ActiveSessionIndicator.test.tsx`:
- Renders nothing when no timer active
- Shows book title and elapsed time when timer active
- Links to the active book's detail page
- Shows skeleton during hydration

**Mock patterns (follow existing):**
```typescript
// Mock the Zustand store
vi.mock('@/stores/useTimerStore', () => ({
  useTimerStore: vi.fn(),
}));

// For IndexedDB in tests, use fake-indexeddb:
// Already in architecture spec as mock strategy
```

**Zustand Store Testing Pattern (from Architecture):**
```typescript
beforeEach(() => {
  // Reset store state before each test
  useTimerStore.setState({
    isRunning: false,
    startTime: null,
    currentBookId: null,
    currentBookTitle: null,
    _hasHydrated: true, // Assume hydrated in tests
  });
});
```

### File Structure Requirements

```
src/
├── lib/
│   ├── idb-storage.ts              # NEW - IndexedDB storage adapter for Zustand
│   └── idb-storage.test.ts         # NEW - Tests for storage adapter
├── stores/
│   ├── useTimerStore.ts            # NEW - Reading timer Zustand store
│   ├── useTimerStore.test.ts       # NEW - Store tests
│   └── index.ts                    # UPDATE - Export useTimerStore
├── hooks/
│   ├── useTimerInterval.ts         # NEW - Timer interval management hook
│   └── index.ts                    # UPDATE - Export useTimerInterval
├── components/
│   ├── features/
│   │   ├── sessions/               # NEW DIRECTORY
│   │   │   ├── SessionTimer.tsx    # NEW - Main timer component
│   │   │   ├── SessionTimer.test.tsx # NEW - Tests
│   │   │   ├── ActiveSessionIndicator.tsx # NEW - Global indicator
│   │   │   ├── ActiveSessionIndicator.test.tsx # NEW - Tests
│   │   │   ├── types.ts           # NEW - Session types
│   │   │   └── index.ts           # NEW - Barrel exports
│   │   └── books/
│   │       └── BookDetailActions.tsx # UPDATE - Replace disabled Log Session button
│   └── layout/
│       └── AppShell.tsx            # UPDATE - Add ActiveSessionIndicator
└── app/
    └── (main)/
        └── book/[id]/
            └── page.tsx            # MAY UPDATE if BookDetail needs new props
```

### Project Structure Notes

- New `src/components/features/sessions/` directory follows architecture's domain component organization
- `idb-storage.ts` in `src/lib/` is a shared utility (architecture specifies `lib/idb-storage.ts`)
- Store in `src/stores/` with `use{Domain}Store` naming convention
- All new files use `@/` import alias for cross-boundary imports
- Tests co-located with source files
- Feature `index.ts` re-exports maintained
- Component file structure order: imports, types, component function, helpers

### Dependencies

**Already installed (no new packages needed):**
- `zustand` `^5.0.11` - State management
- `idb-keyval` `^6.2.2` - IndexedDB wrapper
- `framer-motion` `^12.31.0` - Animations
- `lucide-react` `^0.563.0` - Icons (Clock, Timer, BookOpen, Play, Square)
- shadcn/ui: Button, AlertDialog, Skeleton
- `@hookform/resolvers` + `zod` - Validation (if needed)

**No new packages to install.** All required dependencies are already in `package.json`.

### References

- [Source: architecture.md#Frontend Architecture] - Zustand store boundaries, timer persistence strategy, IndexedDB via idb-keyval
- [Source: architecture.md#Implementation Patterns] - Store naming (`use{Domain}Store`), Zustand store pattern with state/actions/computed
- [Source: architecture.md#Zustand Store Testing Pattern] - Reset state in beforeEach
- [Source: architecture.md#Structure Patterns] - Component organization, sessions feature folder, test co-location
- [Source: architecture.md#Format Patterns] - ActionResult<T>, date handling, loading state pattern
- [Source: ux-design-specification.md#SessionTimer Component] - States: Ready, Active, Complete, Goal Met
- [Source: ux-design-specification.md#Microinteraction Patterns] - Timer display behavior
- [Source: ux-design-specification.md#Accessibility] - aria-live, touch targets, reduced motion
- [Source: ux-design-specification.md#Design System Foundation] - Tailwind + shadcn + Framer Motion
- [Source: epic-3#Story 3.1] - Acceptance criteria, Zustand + IndexedDB persist requirement
- [Source: prd.md#FR13] - Users can log a reading session with duration
- [Source: prd.md#FR16] - System tracks reading sessions for streak calculation
- [Source: 2-6-library-view-organization.md] - 479 test baseline, BookDetailActions placeholder buttons, pre-existing lint issues
- [Source: Zustand v5 docs] - persist middleware, createJSONStorage, partialize, onRehydrateStorage, selector stability
- [Source: idb-keyval docs] - StateStorage adapter pattern with SSR guards

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed idb-storage test mock pattern: switched from inline vi.mock factory to auto-mock + mockImplementation in beforeEach (hoisting issue)
- Fixed jsdom missing indexedDB: added `globalThis.indexedDB = {} as IDBFactory` in test beforeEach
- Fixed TypeScript errors in idb-storage.test.ts: `IDBValidKey` parameter types instead of `string`
- Fixed useTimerInterval lint error: refactored from useState to useReducer to satisfy react-hooks/set-state-in-effect rule
- Removed unused `within` import from SessionTimer.test.tsx

### Completion Notes List

- All 5 Acceptance Criteria satisfied
- 524 total tests (45 new) across 50 test files — zero failures
- Pre-existing lint error in BookDetailActions.tsx (set-state-in-effect) left untouched per story instructions
- Pre-existing typecheck error in ProfileView.test.tsx left untouched per story instructions
- Timer display does not use Framer Motion for number transitions (kept simple CSS monospace display per practical implementation — animation adds complexity without significant UX benefit for rapidly changing numbers)
- SessionTimer renders nothing (not a disabled button) for non-CURRENTLY_READING statuses — cleaner than showing a disabled placeholder

### Code Review Fixes Applied

- **[H1]** Added missing `isActive()` computed method to `useTimerStore` per architecture spec (+ 2 tests)
- **[H2]** Extracted duplicated `formatTime` utility to shared `types.ts`, removed copies from SessionTimer and ActiveSessionIndicator
- **[M1]** ActiveSessionIndicator now renders `null` pre-hydration instead of a skeleton flash on every page load
- **[M2]** Added gentle pulse animation dot to ActiveSessionIndicator with `motion-reduce:animate-none`
- **[M3]** Fixed `aria-live` accessibility: moved from rapidly-updating timer display to a separate sr-only region that announces on minute boundaries only
- **[M4]** Changed BookDetailActions condition from `displayStatus &&` to `displayStatus === 'CURRENTLY_READING' &&` to avoid mounting SessionTimer (and its 1s interval) for non-reading statuses

### File List

**New files:**
- `src/lib/idb-storage.ts` — IndexedDB storage adapter for Zustand persist
- `src/lib/idb-storage.test.ts` — 6 tests
- `src/stores/useTimerStore.ts` — Zustand timer store with IndexedDB persistence
- `src/stores/useTimerStore.test.ts` — 10 tests
- `src/hooks/useTimerInterval.ts` — Timer interval hook (1s tick)
- `src/components/features/sessions/types.ts` — SessionTimerProps interface + shared formatTime utility
- `src/components/features/sessions/SessionTimer.tsx` — Main timer component
- `src/components/features/sessions/SessionTimer.test.tsx` — 10 tests
- `src/components/features/sessions/ActiveSessionIndicator.tsx` — Global active session banner
- `src/components/features/sessions/ActiveSessionIndicator.test.tsx` — 6 tests
- `src/components/features/sessions/integration.test.tsx` — 13 integration tests
- `src/components/features/sessions/index.ts` — Barrel exports

**Modified files:**
- `src/stores/index.ts` — Added useTimerStore export
- `src/hooks/index.ts` — Added useTimerInterval export
- `src/components/features/books/BookDetailActions.tsx` — Replaced disabled "Log Session" button with SessionTimer
- `src/components/features/books/BookDetailActions.test.tsx` — Updated tests for SessionTimer integration
- `src/components/layout/AppShell.tsx` — Added ActiveSessionIndicator
