# TEST REPORT: Classroom Simulator Discovery Phase

**Generated:** 2026-01-01
**Phase:** Discovery & Testing ONLY
**Status:** No fixes applied - observation only

---

## Executive Summary

The Classroom Simulator is a feature-rich turn-based teacher simulation game with 15 AI students, social media dynamics, event systems, and lesson planning. While the core gameplay loop is functional with 203/234 tests passing, **critical infrastructure issues** threaten stability and development velocity.

**Primary Concerns:**
1. **Memory exhaustion** during both test runs and production builds prevents CI/CD and deployment
2. **Immutability violations** in the game reducer create risks for React re-rendering and state corruption
3. **Balance issues** in teacher energy and student progression can soft-lock gameplay after the first week
4. **Accessibility gaps** in focus management and screen reader support violate WCAG guidelines

The codebase is well-structured with good test coverage intent, but environmental constraints and architectural patterns need attention before the next feature sprint.

---

## Bug Count Summary

| Category | Critical | Major | Minor | Total |
|----------|----------|-------|-------|-------|
| Technical/Stability | 4 | 5 | 3 | 12 |
| Gameplay/Simulation | 2 | 6 | 4 | 12 |
| UI/UX | 2 | 8 | 10 | 20 |
| **TOTAL** | **8** | **19** | **17** | **44** |

---

## Technical/Stability Issues

### CRITICAL

#### [Technical/Stability] – CRITICAL – Test Suite Memory Exhaustion

**Description:** Test suite crashes with JavaScript heap out of memory after 8/9 test files pass. Memory reaches ~4GB before failure.

**Steps to Reproduce:**
1. Run `npm run test:run`
2. Watch 203 tests pass across 8 files
3. Process crashes during 9th file with OOM error

**Expected Behavior:** All 234 tests should complete without memory issues.

**Actual Behavior:** Fatal error: "Reached heap limit Allocation failed - JavaScript heap out of memory"

**Impact:** CI/CD pipelines blocked; cannot verify code quality automatically.

**Notes:** Stack trace shows crash during Date object construction in V8. Memory leak suspected in test fixtures.

---

#### [Technical/Stability] – CRITICAL – Production Build Memory Exhaustion

**Description:** `npm run build` fails during static page generation with identical OOM error.

**Steps to Reproduce:**
1. Run `npm run build`
2. TypeScript compilation succeeds
3. Static page generation crashes at ~3.8GB memory

**Expected Behavior:** Build completes successfully.

**Actual Behavior:** Build worker exits with SIGABRT after heap exhaustion.

**Impact:** Cannot deploy to production; blocked releases.

**Notes:** Occurs in "Generating static pages using 7 workers" phase with Next.js 16.1.1 Turbopack.

---

#### [Technical/Stability] – CRITICAL – Direct State Mutation in PROCESS_SOCIAL Action

**Description:** Student objects are mutated directly within reducer map callback. `friendIds` and `rivalIds` are assigned to original reference objects.

**Location:** `src/lib/game/reducer.ts`, lines 535-536

**Expected Behavior:** Each student should be a completely new immutable object.

**Actual Behavior:** Properties assigned directly to original object reference before spread operator reconstructs state.

**Impact:** React may fail to detect state changes; components won't re-render correctly when relationships change.

**Notes:** Immutability partially broken by mutable assignment within reducer function.

---

#### [Technical/Stability] – CRITICAL – Missing Return Path in Event Effect Loop

**Description:** Event effect application has branching logic without default case for unknown effect targets.

**Location:** `src/lib/game/reducer.ts`, lines 393-425

**Expected Behavior:** All effect types handled explicitly with fallback or error case.

**Actual Behavior:** Unknown effect targets silently ignored; loop continues without logging.

**Impact:** Malformed event data causes silent failures; expected consequences don't apply.

**Notes:** Defensive programming missing; reducer should validate input or log unexpected cases.

---

### MAJOR

#### [Technical/Stability] – MAJOR – Reducer Test File Not Executing

**Description:** `src/lib/game/reducer.test.ts` (414 lines) exists but never runs in test suite.

**Steps to Reproduce:**
1. Check git status shows `M src/lib/game/reducer.test.ts`
2. Run `npm run test:run`
3. Only 8 test files execute, not 9

**Expected Behavior:** All 9 test files should execute.

**Actual Behavior:** Core game state reducer tests skipped silently.

**Impact:** Critical game flow logic (ADVANCE_DAY, SELECT_LESSON, etc.) untested.

**Notes:** Likely skipped due to memory pressure causing Vitest to drop tests.

---

#### [Technical/Stability] – MAJOR – Division by Zero Risk in Engagement Calculation

**Description:** Potential NaN if all students absent during lesson pivot calculation.

**Location:** `src/lib/game/reducer.ts`, lines 686-688

**Expected Behavior:** Handle case where all students absent.

**Actual Behavior:** Division by zero produces NaN, propagating to state.

**Impact:** NaN corrupts lesson status calculations; UI displays NaN values.

**Notes:** Array filtered twice unnecessarily; single variable would make check obvious.

---

#### [Technical/Stability] – MAJOR – Unsafe Type Coercion in Event Effects

**Description:** Event effects use `as keyof typeof` assertions without validating attribute key exists.

**Location:** `src/lib/game/reducer.ts`, lines 395, 404, 415

**Expected Behavior:** Runtime validation before property access.

**Actual Behavior:** Invalid keys silently fail; typos in event definitions don't apply effects.

**Impact:** Debugging difficult; no error or warning for failed effect application.

**Notes:** Reducer vulnerable to data corruption from malformed events.

---

#### [Technical/Stability] – MAJOR – useAutoSave Dependency Causes Constant Timer Reset

**Description:** `performSave` callback recreated on every state change due to entire state tree in dependency array.

**Location:** `src/hooks/useAutoSave.ts`, line 68

**Expected Behavior:** Granular dependencies; timer only restarts when interval changes.

**Actual Behavior:** Timer cleared and recreated on every state change.

**Impact:** Save timer timing unpredictable; GC pressure from constant allocation.

**Notes:** "Dancing dependency" anti-pattern defeats memoization.

---

#### [Technical/Stability] – MAJOR – Partial Backward Compatibility Mutations in LOAD_GAME

**Description:** LOAD_GAME mutates the payload object directly instead of creating new state.

**Location:** `src/lib/game/reducer.ts`, lines 133-157

**Expected Behavior:** Return completely reconstructed state object.

**Actual Behavior:** Missing fields patched by mutating input parameter.

**Impact:** Second load of same save has different behavior; violates reducer input immutability.

**Notes:** Time-bomb for save compatibility evolution.

---

### MINOR

#### [Technical/Stability] – MINOR – Silent Default Case in Reducer Switch

**Description:** Unknown action types return state unchanged without notification.

**Location:** `src/lib/game/reducer.ts`, lines 1202-1204

**Impact:** Silent failures for invalid actions make debugging difficult.

---

#### [Technical/Stability] – MINOR – Multiple Filter Operations on Same Data

**Description:** Same array filtered multiple times in succession.

**Location:** `src/lib/game/reducer.ts`, lines 687-688

**Impact:** O(n) with worse constant factor; code clarity issue.

---

#### [Technical/Stability] – MINOR – No Error Boundary for Reducer Exceptions

**Description:** Main reducer dispatch path has no error handling or recovery.

**Location:** `src/lib/game/context.tsx`

**Impact:** Runtime errors crash component tree with no recovery mechanism.

---

## Gameplay/Simulation Issues

### CRITICAL

#### [Gameplay/Simulation] – CRITICAL – Teacher Energy Spiral Creates Unplayable State

**Description:** Teacher energy recovery (25/day) insufficient for daily costs (potentially 100+). Energy spirals to near-zero by day 3-4.

**Steps to Reproduce:**
1. Play normally for 3-4 days
2. Select lessons (10-20 energy), methods (8 energy), interactions (5 each)
3. Observe energy stabilizes at very low levels

**Expected Behavior:** Recovery should allow baseline instructional effectiveness.

**Actual Behavior:** Teaching becomes unplayable energy management exercise.

**Impact:** Core gameplay breaks after first few days.

**Notes:** Energy costs fixed but recovery fixed; no scaling or diminishing returns.

---

#### [Gameplay/Simulation] – CRITICAL – Attendance Creates Permanent Underperformers

**Description:** 95% attendance means students can miss 8+ days by week 4 with no catch-up mechanism.

**Steps to Reproduce:**
1. Track student absent for 3+ consecutive days
2. No homework opportunity, no instruction received
3. Academic level unchanged or degraded with no recovery path

**Expected Behavior:** Long-term absences should trigger intervention mechanics.

**Actual Behavior:** System continues blindly; no makeup work or support system.

**Impact:** Creates semi-permanent underperformer segments with no gameplay path to recovery.

---

### MAJOR

#### [Gameplay/Simulation] – MAJOR – Rushing Creates Irreversible Academic Damage

**Description:** APPLY_RUSHING can drop 5-15 students' academic levels by 25-50 points simultaneously with no recovery mechanism.

**Location:** `src/lib/game/reducer.ts`, line 951

**Expected Behavior:** Balanced tradeoff with recovery opportunities.

**Actual Behavior:** Rushing permanently damages academics; player can soft-lock by over-using time pivots.

**Impact:** Strategic choice creates irreversible damage.

---

#### [Gameplay/Simulation] – MAJOR – Social Energy Drain Has No Gameplay Effect

**Description:** Shy students can drain to 0 socialEnergy but stat produces no observable consequence.

**Steps to Reproduce:**
1. Generate shy student with multiple friends
2. Let them participate in social activities
3. Watch socialEnergy drop to 0
4. Student plays normally despite being "exhausted"

**Expected Behavior:** Zero energy should trigger behavioral changes.

**Actual Behavior:** Stat tracked but never consumed; half-implemented system.

**Impact:** Wasted complexity; stat has no mechanical impact.

---

#### [Gameplay/Simulation] – MAJOR – Friendship Threshold Dead Zones

**Description:** Friendship strength 20-40 range creates students who are "close but not friends" - positive relationship but not in friendIds.

**Steps to Reproduce:**
1. Generate compatible students with strength ~30
2. They're never added to friendIds despite positive relationship
3. Events filtering by friendIds never trigger

**Expected Behavior:** Contiguous threshold ranges with no dead zones.

**Actual Behavior:** 20-point dead zone per side where relationships don't classify.

**Impact:** Some friendships never formally activate.

---

#### [Gameplay/Simulation] – MAJOR – Homework Quality Randomness Swamps Skill

**Description:** ±10 randomness often larger than academicLevel modifiers.

**Location:** `src/lib/students/behavior.ts`, lines 264-274

**Expected Behavior:** Academic level should be primary driver.

**Actual Behavior:** Low and high students can have similar quality due to random variance.

**Impact:** Academic differentiation unclear; undermines progression feedback.

---

#### [Gameplay/Simulation] – MAJOR – Overtime Penalty Field Never Applied

**Description:** OvertimeOption has `nextBlockPenalty` field but it's never read or applied.

**Steps to Reproduce:**
1. Run lesson to 100% time with 40% progress
2. Select overtime option
3. Check if next block duration reduced: it isn't

**Expected Behavior:** Overtime should reduce next block time.

**Actual Behavior:** Overtime becomes free action with only cosmetic penalty.

**Impact:** No real strategic tension for time management.

---

#### [Gameplay/Simulation] – MAJOR – Mood Trigger Asymmetry for Analytical Students

**Description:** "Surprise" trigger makes curious students always happy, analytical always unhappy regardless of event type.

**Location:** `src/lib/students/behavior.ts`, lines 667-676

**Expected Behavior:** Event type should determine valence, not just personality.

**Actual Behavior:** Personality alone determines surprise response.

**Impact:** Reduces realism; deterministic for one trigger type.

---

### MINOR

#### [Gameplay/Simulation] – MINOR – Magic Numbers Without Documentation

**Description:** Multiple hardcoded values lack rationale (energy +5, recovery 25, drain asymmetry).

**Impact:** Tuning impossible without deep code reading.

---

#### [Gameplay/Simulation] – MINOR – Confiscate Phone Has No Resolution Path

**Description:** Once confiscated, student upset for 2+ days with no intervention action.

**Impact:** Punishment has no end state; lingering negativity.

---

#### [Gameplay/Simulation] – MINOR – Homework Ceiling at 0.98 Undocumented

**Description:** Excellent students hit hard completion ceiling without explanation.

**Impact:** No way to create late-game scenarios where top students struggle.

---

#### [Gameplay/Simulation] – MINOR – Post Template Memory Pressure

**Description:** 19KB template file loaded repeatedly across parallel test workers.

**Impact:** May contribute to memory pressure during testing.

---

## UI/UX Issues

### CRITICAL

#### [UI/UX] – CRITICAL – Missing Focus Trap in Modals

**Description:** Dialog/Sheet modals don't trap focus; Tab key escapes to background elements.

**Steps to Reproduce:**
1. Open any modal
2. Press Tab repeatedly
3. Focus escapes to hidden background

**Expected Behavior:** Focus trapped within modal; wraps to first element.

**Actual Behavior:** Focus escapes and activates background elements.

**Impact:** WCAG 2.1 Level AA violation (2.1.2 No Keyboard Trap).

---

#### [UI/UX] – CRITICAL – No Disabled State Explanation for Event Choices

**Description:** Event "Confirm Choice" button disabled without explaining why.

**Steps to Reproduce:**
1. Trigger event
2. Button appears faded but no guidance text

**Expected Behavior:** Text should explain "Select a choice above to continue".

**Actual Behavior:** Disabled state with no additional guidance.

**Impact:** User friction; players don't understand blocking condition.

---

### MAJOR

#### [UI/UX] – MAJOR – Missing Loading State for Post Generation

**Description:** "Generate Posts" button has no loading feedback during processing.

**Impact:** Users may click multiple times thinking nothing happened.

---

#### [UI/UX] – MAJOR – Empty State Renders for EventNotification

**Description:** Component renders even when no events exist.

**Impact:** DOM bloat; potential keyboard navigation issues.

---

#### [UI/UX] – MAJOR – Fixed Heights Break Mobile Layout

**Description:** SocialFeed and PhoneScreen have fixed pixel heights that don't adapt.

**Impact:** Poor mobile UX; feeds become unusable on small screens.

---

#### [UI/UX] – MAJOR – No Loading State for Save/Load Operations

**Description:** Save/Load modal shows no loading indicator during operations.

**Impact:** User uncertainty; may think game froze.

---

#### [UI/UX] – MAJOR – Cursor Feedback Delayed on Student Cards

**Description:** Cards have onClick but cursor doesn't immediately change to pointer.

**Impact:** Reduced discoverability of interactive elements.

---

#### [UI/UX] – MAJOR – Disabled Cards Show Hover Effects

**Description:** Disabled lesson/method cards still show hover styling.

**Impact:** False affordance; appears clickable when not.

---

#### [UI/UX] – MAJOR – No Feedback for Student Interactions

**Description:** Praise/help/redirect actions have no toast or confirmation.

**Impact:** Players don't know if interactions had intended effects.

---

#### [UI/UX] – MAJOR – PhoneScreen Modal Lacks Escape Key Handler

**Description:** Escape key doesn't close phone modal.

**Impact:** Keyboard users have degraded experience.

---

### MINOR

#### [UI/UX] – MINOR – Missing Accessibility Labels on Buttons

**Description:** Like/Reply/Share buttons use emoji-only labels without aria-label.

**Impact:** Screen readers announce "button heart" with no context.

---

#### [UI/UX] – MINOR – Day Transition Modal Lacks Close Button

**Description:** No X button or explanation of dismissal options.

**Impact:** Users uncertain how to exit modal.

---

#### [UI/UX] – MINOR – Typing Indicator Always Visible

**Description:** "Someone is typing..." animates continuously even when no typing.

**Impact:** Visual distraction; unclear semantics.

---

#### [UI/UX] – MINOR – Missing Phase Label Text

**Description:** Only visual badge shows phase; no text like "Current Phase: Teaching".

**Impact:** UX friction; unclear state for new players.

---

#### [UI/UX] – MINOR – Teacher Energy Bar No Animation

**Description:** Energy value updates instantly without smooth transition.

**Impact:** Minor polish; feels less responsive.

---

#### [UI/UX] – MINOR – Trending Topics Not Clickable

**Description:** Topics look like badges but don't respond to clicks.

**Impact:** Unclear if elements are interactive.

---

#### [UI/UX] – MINOR – Unread Badge Appears Abruptly

**Description:** Red badge pops in without fade/scale animation.

**Impact:** Minor polish; less satisfying feedback.

---

#### [UI/UX] – MINOR – Student Modal No Scroll Indicator

**Description:** Long profiles scrollable but no visual cue.

**Impact:** Users may miss content below fold.

---

#### [UI/UX] – MINOR – Inconsistent Confirmation Card Styling

**Description:** Lesson/method/homework selectors use different styling patterns.

**Impact:** Feels like different design system.

---

#### [UI/UX] – MINOR – Import Textarea Focus State Subtle

**Description:** Save modal textarea focus ring may be missing or subtle.

**Impact:** Keyboard users can't clearly see focus.

---

---

## High-Risk Patterns Observed

### 1. **Memory Management Crisis**
Both test suite and production build fail due to heap exhaustion at ~4GB. This blocks CI/CD, deployment, and developer velocity. Root cause appears to be memory leaks in test fixtures or page generation, possibly related to Date object construction.

### 2. **Immutability Violations in Reducer**
Multiple locations mutate state objects directly before immutable reconstruction. This creates subtle bugs where React fails to detect changes, components don't re-render, and state can become inconsistent during multi-step operations.

### 3. **Silent Failure Patterns**
Invalid event effects, unknown action types, and malformed data are silently ignored without logging or error handling. This makes debugging extremely difficult when expected game behavior doesn't occur.

### 4. **Runaway Game Systems**
Teacher energy and student progression have no self-correcting mechanisms. Values spiral to extremes (near-zero energy, permanently struggling students) with no recovery paths, making the game unplayable after the first week.

### 5. **Accessibility Debt**
Focus management, screen reader support, and keyboard navigation have systematic gaps. Multiple WCAG 2.1 Level AA violations exist across modals, interactive elements, and form controls.

---

## Statement of Completion

**This report documents findings from observation only.**

- No bugs were fixed
- No code was refactored
- No balance changes were applied
- No features were added

All 44 issues are documented for the Fix Sprint phase.

---

*Report compiled by Discovery Swarm - Queen Coordinator*
