# Keystroke Validation - Requirements

## Overview

The keystroke validation system is the **most critical component** of KeyFlow, responsible for real-time input validation with <2ms latency. This is the "hot path" that executes on every keystroke during typing sessions.

## Source Requirements

These requirements are derived from:
- `.ai/Typing Tutor Typesy killer.md` - User Input Tracking & Validation (lines 17-22)
- `.ai/ENGINEERING_REQUIREMENTS.md` - Sections 1.2, 1.3

## Functional Requirements

### FR-1: Real-time Input Comparison
**Priority: CRITICAL**

The system shall compare typed input against expected text character-by-character in real-time.

**Acceptance Criteria:**
- [ ] Each keystroke is validated against the expected character at current position
- [ ] Validation occurs synchronously (no async delays)
- [ ] Character comparison is case-sensitive
- [ ] Special characters (punctuation, symbols) are validated accurately
- [ ] Unicode characters are handled correctly

### FR-2: Character-by-Character Validation
**Priority: CRITICAL**

The system shall only advance the cursor position when the correct character is typed.

**Acceptance Criteria:**
- [ ] Cursor advances to next position only on correct input
- [ ] Cursor position remains unchanged on incorrect input
- [ ] Visual feedback indicates current expected character
- [ ] User cannot "skip ahead" by typing future characters
- [ ] Position tracking is maintained accurately throughout session

### FR-3: Error Handling - No Forward Progress
**Priority: CRITICAL**

The system shall prevent forward progress when an incorrect character is typed.

**Acceptance Criteria:**
- [ ] Incorrect keystroke is rejected (not added to user input)
- [ ] Visual error indication is shown immediately
- [ ] Audio error feedback is provided (if enabled)
- [ ] Error is logged for analytics
- [ ] User must type correct character to proceed

### FR-4: Wrong Key Tracking & Analysis
**Priority: HIGH**

The system shall log and analyze all incorrect keystrokes for weakness identification.

**Acceptance Criteria:**
- [ ] Every wrong keystroke is recorded with metadata:
  - Expected character
  - Actual character typed
  - Position in text
  - Timestamp (millisecond precision)
  - Attempt number (how many times user tried this character)
- [ ] Error patterns are identified (e.g., user consistently types 't' instead of 'y')
- [ ] Weak keys are ranked by error frequency
- [ ] Common mistakes are aggregated (e.g., adjacent keys)
- [ ] Data is available for drill mode targeting

### FR-5: Backspace Support
**Priority: HIGH**

The system shall allow users to backspace to correct mistakes (configurable).

**Acceptance Criteria:**
- [ ] Backspace moves cursor to previous position
- [ ] Previous character is marked as "to be re-typed"
- [ ] Backspace is disabled at position 0
- [ ] Error count is not affected by backspace (original error still logged)
- [ ] Multiple backspaces allowed (up to start of text)

### FR-6: Keystroke Dynamics Collection
**Priority: MEDIUM**

The system shall collect detailed keystroke timing data for AI/ML features.

**Acceptance Criteria:**
- [ ] Timestamp captured using `performance.now()` (millisecond precision)
- [ ] Dwell time measured (key down → key up)
- [ ] Inter-key interval measured (previous keystroke → current keystroke)
- [ ] Flight time measured (previous key up → current key down)
- [ ] All timing data stored locally (privacy-first)
- [ ] Data collection is opt-in for cloud sync

## Non-Functional Requirements

### NFR-1: Performance - Latency
**Priority: CRITICAL**

**Desktop (Tauri):**
- Keystroke validation: <0.1ms
- Total keystroke processing: <2ms
- UI update: <1ms
- **Total latency: <2ms**

**Web (Next.js):**
- Keystroke validation: <0.3ms
- Total keystroke processing: <5ms
- UI update: <2ms
- **Total latency: <5ms**

**Measurement:** Using `performance.now()` benchmarks

### NFR-2: Accuracy
**Priority: CRITICAL**

- Character validation: 100% accurate (no false positives/negatives)
- WPM calculation: 99.9%+ accurate (5 characters = 1 word)
- Timestamp precision: ±1ms accuracy

### NFR-3: Reliability
**Priority: CRITICAL**

- Zero crashes during 1-hour typing session
- No memory leaks during extended sessions
- Handles rapid typing (200+ WPM, 16+ keystrokes/second)
- Gracefully handles keyboard repeat events

### NFR-4: Testability
**Priority: HIGH**

- All validation logic is pure functions (no side effects)
- Mock keyboards for automated testing
- Reproducible keystroke sequences
- Benchmark suite for performance validation

### NFR-5: Maintainability
**Priority: HIGH**

- Clear separation of concerns (validation vs UI vs analytics)
- Well-documented interfaces
- Extensive unit test coverage (>90%)
- Performance regression tests

## Use Cases

### UC-1: Correct Keystroke
**Actor:** User typing correctly  
**Flow:**
1. User presses correct key
2. System validates keystroke (correct)
3. System advances cursor position
4. System updates metrics (WPM, accuracy)
5. System provides positive visual feedback
6. System continues to next character

### UC-2: Incorrect Keystroke
**Actor:** User makes a typo  
**Flow:**
1. User presses wrong key
2. System validates keystroke (incorrect)
3. System logs error with metadata
4. System provides error feedback (visual + audio)
5. System keeps cursor at same position
6. System waits for correct key

### UC-3: Backspace Recovery
**Actor:** User corrects a mistake  
**Flow:**
1. User presses Backspace
2. System checks if backspace is allowed (position > 0)
3. System moves cursor back one position
4. System marks previous character for re-typing
5. System clears visual error state
6. System waits for correct key

### UC-4: Rapid Typing (High WPM)
**Actor:** Speed typist (150+ WPM)  
**Flow:**
1. User types very rapidly (16+ keys/second)
2. System validates each keystroke independently
3. System maintains accurate timing for each keystroke
4. System updates UI smoothly without lag
5. System handles keyboard repeat events correctly
6. System maintains <2ms latency throughout

## Edge Cases

### EC-1: Simultaneous Key Presses
- **Scenario:** User accidentally presses two keys simultaneously
- **Handling:** Process keys in order received, validate independently

### EC-2: Keyboard Repeat
- **Scenario:** User holds key down, triggering OS key repeat
- **Handling:** Ignore repeat events after first correct keystroke

### EC-3: Very Long Text
- **Scenario:** Exercise with 1000+ characters
- **Handling:** Efficient data structures, no performance degradation

### EC-4: Special Characters
- **Scenario:** Text contains Unicode, emojis, etc.
- **Handling:** Accurate string comparison using Unicode code points

### EC-5: Offline Operation
- **Scenario:** Desktop app with no network connection
- **Handling:** All validation works 100% offline

## Success Metrics

- **Latency:** <2ms desktop, <5ms web (p99)
- **Accuracy:** 100% validation accuracy
- **Error Rate:** <0.1% crashes or validation errors
- **User Satisfaction:** "Feels as responsive as Monkeytype" (user research)

## Dependencies

- `shared-core/typing/InputValidator.ts` - Core validation logic
- `shared-core/typing/KeystrokeTracker.ts` - Wrong key tracking
- `shared-core/analytics/MetricsCalculator.ts` - WPM/accuracy calculation
- `shared-ui/components/TypingInterface.tsx` - UI integration

## References

- [Design Document](./design.md)
- [Interface Specifications](./interfaces.md)
- [Sequence Diagrams](./diagrams/)
- Parent: [ENGINEERING_REQUIREMENTS.md](../../../.ai/ENGINEERING_REQUIREMENTS.md)

