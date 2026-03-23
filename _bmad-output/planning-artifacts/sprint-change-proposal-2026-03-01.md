# Sprint Change Proposal

**Project:** flappy-bird-1
**Date:** 2026-03-01
**Author:** vitr
**Change Scope:** Minor (Direct Implementation)

---

## Section 1: Issue Summary

### Problem Statement

The current session logging design uses a manual start/stop timer where users track reading time passively. The desired experience is a preset countdown timer with an immersive full-screen overlay that:

1. Prompts users to commit to a reading duration (15/30/45 min increments)
2. Provides a focused, distraction-free countdown experience
3. Auto-saves sessions when complete or confirms early exits

### Discovery Context

- **When identified:** During sprint planning review
- **Triggered by:** User preference for more intentional, commitment-based reading sessions
- **Category:** New requirement emerged - UX enhancement

### Evidence

- Current design (Story 3.1): Simple start/stop button with manual timer control
- Desired flow: Preset selection → countdown overlay → auto-save or early exit with confirmation
- Design inspiration: Duolingo-style commitment patterns for habit formation
- Alignment: Better matches "ethical gamification" principles from UX Design Specification

---

## Section 2: Impact Analysis

### Epic Impact

**Epic 3: Reading Sessions & Habit Tracking**

- ✅ Epic structure remains intact
- ⚠️ Stories 3.1 and 3.2 require acceptance criteria modifications
- ✅ Stories 3.3-3.8 (session history, streaks) unaffected

**Other Epics:**
- ✅ No impact on Epic 1 (Foundation), Epic 2 (Book Library), Epic 4 (Social), Epic 5 (Reading Rooms), Epic 6 (Admin)

### Story Impact

| Story | Impact | Changes Needed |
|-------|--------|----------------|
| **Story 3.1: Session Timer** | Major | New acceptance criteria for preset selection + countdown overlay |
| **Story 3.2: Save Reading Session** | Major | New acceptance criteria for early-stop confirmation flow |
| Story 3.3: Session History | None | Works with either timer approach |
| Story 3.4: Daily Reading Goal | None | Independent of timer UX |
| Story 3.5-3.8: Streaks | None | Session data structure unchanged |

### Artifact Conflicts

#### Product Requirements Document (PRD)
- **Conflicts:** None
- **Updates needed:** None
- **Rationale:** FR13-FR16 are goal-agnostic about HOW sessions are logged

#### Architecture Document
- **Conflicts:** None
- **Updates needed:** None (implementation detail only)
- **Rationale:** IndexedDB persistence, Zustand useTimerStore, and timer persistence patterns all remain valid

#### UX Design Specification
- **Conflicts:** Minor - SessionTimer component definition assumes manual timer
- **Updates needed:** SessionTimer component section (lines 1023-1051)
- **Rationale:** Need to document preset selection popup, countdown overlay, and confirmation flows

#### Technical Specifications
- **Conflicts:** None
- **Updates needed:** None
- **Rationale:** Component implementation details, not architectural change

### Technical Impact

- **Code components:** SessionTimer component redesign, new modal components
- **Infrastructure:** No changes - IndexedDB, Zustand, Pusher all unchanged
- **Data models:** No database schema changes - ReadingSession table remains the same
- **API contracts:** No API changes

---

## Section 3: Recommended Approach

### Selected Path: Direct Adjustment

**Rationale:**

| Factor | Assessment |
|--------|------------|
| **Implementation effort** | Low-Medium - similar complexity to original design, just different user flow |
| **Technical risk** | Low - no new architectural components, countdown timers are well-understood patterns |
| **Team morale impact** | Positive - this is a UX enhancement that makes the feature more intentional |
| **Long-term sustainability** | Good - preset timers align better with habit formation goals |
| **Stakeholder expectations** | Enhanced - more engaging UX than simple start/stop button |
| **Business value** | Increased - preset commitments likely improve session completion rates |

**Why Not Alternative Approaches:**

- ❌ **Rollback:** Nothing implemented yet, no work to roll back
- ❌ **MVP Review/Scope Reduction:** This change enhances MVP, doesn't reduce it
- ❌ **Keep original design:** Preset timers create better commitment and align with Duolingo-style habit formation
- ❌ **Add both manual AND preset modes:** Too complex for MVP; can be post-MVP enhancement

### Effort Estimate

- **Story updates:** 2-4 hours (rewrite acceptance criteria for stories 3.1 and 3.2)
- **UX spec update:** 1-2 hours (update SessionTimer component section)
- **Implementation:** Similar to original estimate (no scope increase)
- **Testing:** No additional test scenarios beyond original plan

### Risk Assessment

**Low Risk:**
- Well-defined change with clear requirements
- No architectural impacts or database changes
- Countdown timers are standard UI pattern with established libraries
- All persistence logic remains the same

**Mitigation:**
- Use proven countdown timer libraries (React hooks or Framer Motion)
- Follow existing modal/overlay patterns from UX Design System (shadcn/ui)
- Maintain IndexedDB persistence architecture as designed

### Timeline Impact

**No delay to project timeline:**
- Implementation complexity similar to original design
- No new dependencies or architectural decisions needed
- Change improves user experience without adding scope

---

## Section 4: Detailed Change Proposals

### Change #1: Story 3.1 - Session Timer with Preset Selection

**File:** `_bmad-output/planning-artifacts/epics/epic-3-reading-sessions-habit-tracking.md`
**Lines:** 9-38
**Section:** Story 3.1 Acceptance Criteria

**OLD:**
```markdown
**Acceptance Criteria:**

**Given** I am on a book detail page for a book I'm "Currently Reading"
**When** I view the page
**Then** I see a "Start Reading" button prominently displayed

**Given** I tap "Start Reading"
**When** the timer starts
**Then** I see a running timer display (MM:SS, or HH:MM:SS after 1 hour)
**And** the button changes to "Stop Reading"
**And** the timer state is persisted to IndexedDB via Zustand
**And** the book ID is stored with the timer

**Given** I have an active timer
**When** I navigate to another page in the app
**Then** the timer continues running in the background
**And** I see a persistent indicator showing active session (e.g., in header)

**Given** I have an active timer
**When** I close the browser or app
**Then** the timer state is preserved in IndexedDB
**And** when I return, the timer resumes from where it was
**And** elapsed time is calculated correctly from start timestamp

**Given** I have an active timer for Book A
**When** I try to start a timer for Book B
**Then** I see a prompt: "You have an active session for [Book A]. End it first?"
**And** I can end the current session or cancel
```

**NEW:**
```markdown
**Acceptance Criteria:**

**Given** I am on the home page
**When** I view the page
**Then** I see a "Log Reading" button prominently displayed

**Given** I tap "Log Reading"
**When** the time selection popup appears
**Then** I see preset time options: 15 min, 30 min, 45 min
**And** the options are in 15-minute increments
**And** I can select one option

**Given** I select a time preset (e.g., 30 minutes)
**When** I tap "Start Logging"
**Then** a full-screen countdown overlay appears
**And** the countdown shows remaining time (MM:SS format)
**And** the timer state is persisted to IndexedDB via Zustand
**And** the book ID and preset duration are stored with the timer
**And** the overlay blocks other app interactions (focus mode)

**Given** the countdown timer is running
**When** I navigate away or close the app
**Then** the timer state is preserved in IndexedDB
**And** when I return, the countdown resumes from where it was
**And** remaining time is calculated correctly from start timestamp and preset duration

**Given** the countdown reaches 0:00
**When** the timer completes
**Then** the session is automatically saved (see Story 3.2)
**And** I see a success message
**And** the overlay dismisses
**And** the timer state is cleared

**Given** the countdown is running
**When** I want to stop early
**Then** I see a dismiss/exit button on the overlay (e.g., "X" or "Stop Early")
**And** tapping it shows a confirmation popup (see Story 3.2 for early save flow)

**Given** I have an active timer for Book A
**When** I try to start a new timer for Book B
**Then** I see a prompt: "You have an active session for [Book A]. End it first?"
**And** I can end the current session or cancel
```

**Justification:**
- Moves entry point to home page for better accessibility
- Adds preset selection flow with 15/30/45 min options
- Specifies full-screen countdown overlay for focus mode
- Includes auto-save on completion and early-stop confirmation
- Maintains persistence requirements (IndexedDB via Zustand)

---

### Change #2: Story 3.2 - Save Reading Session with Early Stop Confirmation

**File:** `_bmad-output/planning-artifacts/epics/epic-3-reading-sessions-habit-tracking.md`
**Lines:** 48-81
**Section:** Story 3.2 Acceptance Criteria

**OLD:**
```markdown
**Acceptance Criteria:**

**Given** I have stopped the timer
**When** the session summary appears
**Then** I see: book title, session duration, current date
**And** I see a "Save Session" button
**And** I see a "Discard" option (secondary)

**Given** I tap "Save Session"
**When** the session is saved
**Then** a ReadingSession record is created with: userId, bookId, duration, startedAt, endedAt
**And** the book's progress is optionally updated (prompt: "Update progress?")
**And** my daily reading total is recalculated
**And** I see a success toast
**And** the timer state is cleared

**Given** I tap "Discard"
**When** I confirm the discard
**Then** the session is not saved
**And** the timer state is cleared
**And** I return to the book detail page

**Given** I save a session while offline
**When** the session is saved locally
**Then** it is queued in useOfflineStore
**And** I see a toast: "Session saved offline. Will sync when connected."
**And** the session syncs automatically when back online

**Given** I log a session of less than 1 minute
**When** I try to save
**Then** I see a message: "Sessions under 1 minute aren't saved. Keep reading!"
**And** the session is discarded
```

**NEW:**
```markdown
**Acceptance Criteria:**

**Given** the countdown timer completes (reaches 0:00)
**When** the session auto-saves
**Then** a ReadingSession record is created with: userId, bookId, duration, startedAt, endedAt
**And** the book's progress is optionally updated (prompt: "Update progress?")
**And** my daily reading total is recalculated
**And** I see a success toast: "Session logged: [X] minutes"
**And** the timer state is cleared
**And** the overlay dismisses

**Given** I tap "Stop Early" on the countdown overlay
**When** the confirmation popup appears
**Then** I see the message: "Time not finished yet. Save session anyway?"
**And** I see the elapsed time so far (e.g., "12 minutes of 30 minutes")
**And** I see a "Save Session" button (primary)
**And** I see a "Keep Reading" button (secondary)
**And** I see a "Discard" option (tertiary/link)

**Given** I tap "Save Session" on the early stop confirmation
**When** the session is saved
**Then** a ReadingSession record is created with actual elapsed time (not preset time)
**And** the book's progress is optionally updated (prompt: "Update progress?")
**And** my daily reading total is recalculated
**And** I see a success toast: "Session saved: [X] minutes"
**And** the timer state is cleared
**And** the overlay and popup dismiss

**Given** I tap "Keep Reading" on the early stop confirmation
**When** the popup closes
**Then** the countdown overlay remains active
**And** the timer continues from where it was
**And** I can continue reading

**Given** I tap "Discard" on the early stop confirmation
**When** I confirm discard
**Then** the session is not saved
**And** the timer state is cleared
**And** the overlay and popup dismiss
**And** I return to the home page

**Given** I save a session while offline
**When** the session is saved locally
**Then** it is queued in useOfflineStore
**And** I see a toast: "Session saved offline. Will sync when connected."
**And** the session syncs automatically when back online

**Given** I stop early after less than 1 minute
**When** I try to save
**Then** I see a message: "Sessions under 1 minute aren't saved. Keep reading!"
**And** the session is discarded
**And** the overlay dismisses
```

**Justification:**
- Adds auto-save flow when countdown completes naturally
- Specifies early-stop confirmation with three clear options
- Shows elapsed vs. preset time for informed decision-making
- Allows user to continue reading if they change their mind
- Saves actual elapsed time (not preset) when stopping early
- Maintains offline support and minimum session duration rules

---

### Change #3: UX Design Spec - SessionTimer Component

**File:** `_bmad-output/planning-artifacts/ux-design-specification.md`
**Lines:** 1023-1051
**Section:** Custom Components → SessionTimer

**OLD:**
```markdown
#### 5. SessionTimer

**Purpose:** Track and display active reading session with start/stop controls.

**Anatomy:**
- Large time display (MM:SS or HH:MM:SS)
- Start/Stop button
- Goal progress indicator
- Pause/resume (optional)

**States:**

| State | Appearance | Trigger |
|-------|------------|---------|
| Ready | "Start Reading" button | Not yet started |
| Active | Running timer, "Stop" button | Session in progress |
| Paused | Paused indicator, "Resume" | User paused (future) |
| Complete | Success checkmark, time logged | Session ended |
| Goal Met | Celebration indicator | Daily goal achieved |

**Behavior:**
- Works in background (browser backgrounded)
- Persists across page navigation
- Auto-saves progress every 30 seconds

**Accessibility:**
- `aria-live="polite"` for timer updates
- Clear button labels for screen readers
```

**NEW:**
```markdown
#### 5. SessionTimer (Preset Countdown with Overlay)

**Purpose:** Provide an intentional, commitment-based reading session with preset time selection and immersive countdown experience.

**Anatomy:**
- **Trigger Button:** "Log Reading" button on home page
- **Preset Selection Popup:** Modal with time preset options (15/30/45 min)
- **Countdown Overlay:** Full-screen overlay with large countdown display
- **Early Stop Confirmation:** Modal for stopping before timer completes

**Components:**

**5a. Log Reading Button**
- Placement: Home page, prominently displayed
- Appearance: Primary button style (warm amber)
- Label: "Log Reading"

**5b. Time Preset Selection Popup**
- Trigger: Tap "Log Reading" button
- Options: 15 min, 30 min, 45 min (15-minute increments)
- Layout: Vertical list or grid of preset buttons
- Primary action: "Start Logging" button
- Secondary action: "Cancel" or dismiss

**5c. Full-Screen Countdown Overlay**
- Display: Large countdown timer (MM:SS format)
- Position: Center of screen, full-screen modal
- Visual style: Clean, minimal, focus-mode aesthetic
- Background: Semi-opaque dark overlay (blocks app interaction)
- Timer display: Large, readable font (warm color palette)
- Controls: Small "Stop Early" button (top-right or bottom-center)
- Book reference: Book title/cover shown (optional, for context)

**5d. Early Stop Confirmation Popup**
- Trigger: User taps "Stop Early" on countdown overlay
- Message: "Time not finished yet. Save session anyway?"
- Elapsed time display: "[X] minutes of [Y] minutes"
- Options:
  - "Save Session" (primary button)
  - "Keep Reading" (secondary button)
  - "Discard" (tertiary/link)

**States:**

| State | Appearance | Trigger |
|-------|------------|---------|
| Ready | "Log Reading" button visible | No active session |
| Preset Selection | Popup with time options | User tapped "Log Reading" |
| Active Countdown | Full-screen overlay, timer counting down | User selected preset and started |
| Early Stop Prompt | Confirmation popup over overlay | User tapped "Stop Early" |
| Auto-Complete | Success animation, session saved | Countdown reached 0:00 |
| Complete | Overlay dismissed, success toast | Session saved (auto or manual) |

**Behavior:**
- Works in background (browser/app backgrounded, timer continues)
- Persists across page navigation (overlay persists or minimizes to indicator)
- Timer state saved to IndexedDB every 10 seconds
- Auto-saves when countdown completes (0:00)
- Blocks app interaction while overlay is active (focus mode)

**Visual Design:**
- Countdown display: 48-72px font size, warm amber or white
- Overlay background: rgba(0, 0, 0, 0.85) or warm dark tone
- Timer animation: Smooth second-by-second countdown
- Completion animation: Brief success checkmark or confetti (respects reduced motion)

**Accessibility:**
- `aria-live="polite"` for countdown updates (announce every minute, not every second)
- `role="dialog"` for overlay and popups
- Focus trap in overlay (prevent background interaction)
- "Stop Early" button clearly labeled for screen readers
- Escape key closes confirmation popup (returns to countdown)
- Screen reader announces: "Reading session: [X] minutes remaining"

**Motion:**
- Respects `prefers-reduced-motion`
- Overlay enter: Fade in (200ms) or instant if reduced motion
- Timer tick: No animation if reduced motion
- Completion: Static success state if reduced motion
```

**Justification:**
- Provides complete component breakdown (button, popup, overlay, confirmation)
- Specifies focus mode approach with full-screen overlay
- Enhanced accessibility with smart timer announcements
- Visual design guidance for implementation team
- Maintains reduced motion support for accessibility

---

## Section 5: Implementation Handoff

### Change Scope Classification

**Minor Change** - Direct implementation by development team

**Rationale:**
- Stories are already in planning phase, not yet implemented
- Changes are UX refinements, not scope additions
- No backlog reorganization needed
- No architectural decisions required

### Handoff Recipients

**Primary:** Development team (dev agent or quick-dev workflow)

**Responsibilities:**
1. Update Epic 3 story files with new acceptance criteria
2. Update UX Design Specification SessionTimer section
3. Implement updated stories as planned in Epic 3 implementation schedule

### Implementation Tasks

| Task | Description | Priority |
|------|-------------|----------|
| **Update Story 3.1** | Replace acceptance criteria with preset selection + countdown overlay flow | P0 |
| **Update Story 3.2** | Replace acceptance criteria with auto-save + early-stop confirmation flow | P0 |
| **Update UX Spec** | Replace SessionTimer component section (lines 1023-1051) with new design | P0 |
| **Implement Preset Popup** | Build time selection modal (15/30/45 min) | P1 |
| **Implement Countdown Overlay** | Build full-screen countdown component | P1 |
| **Implement Early Stop Confirmation** | Build confirmation modal with 3 options | P1 |
| **Update useTimerStore** | Add preset duration tracking to Zustand store | P1 |
| **Test Persistence** | Verify IndexedDB persistence across navigation/close | P2 |

### Success Criteria

**Story updates complete when:**
- ✅ Story 3.1 acceptance criteria match Change Proposal #1
- ✅ Story 3.2 acceptance criteria match Change Proposal #2
- ✅ UX spec SessionTimer section matches Change Proposal #3

**Implementation complete when:**
- ✅ User can select preset time (15/30/45 min) from home page
- ✅ Full-screen countdown overlay displays and counts down correctly
- ✅ Auto-save triggers when countdown reaches 0:00
- ✅ Early stop shows confirmation with 3 options (Save/Keep Reading/Discard)
- ✅ Timer state persists in IndexedDB across navigation and app close
- ✅ All acceptance criteria from updated stories pass

### Dependencies

**None** - This change is isolated to session logging flow

### Timeline

**No impact to project timeline**
- Story updates: Immediate (part of ongoing planning)
- Implementation: Proceeds as scheduled in Epic 3

---

## Approval

**Prepared by:** vitr
**Date:** 2026-03-01
**Status:** ✅ APPROVED

---

**User Approval:**

[X] Approved - Proceed with implementation
[ ] Revise - Changes needed (specify below)
[ ] Reject - Do not implement

**Approved by:** vitr
**Approval date:** 2026-03-01

**Notes:** Approved for immediate implementation. Change scope: Minor (direct implementation by dev team).

---
