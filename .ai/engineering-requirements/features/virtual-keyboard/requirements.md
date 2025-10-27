# Virtual Keyboard - Requirements

## Overview

The Virtual Keyboard is a **shared React component** that provides real-time visual feedback and finger guidance for typing practice. It's a critical educational component for Lesson Mode and Drill Mode, helping users learn proper hand positioning and touch-typing technique.

## Source Requirements

These requirements are derived from:
- `.ai/PROJECT_ROADMAP.md` - Virtual Keyboard Component (lines 2012-2055)
- `.ai/ENGINEERING_REQUIREMENTS.md` - Section 2.5 (lines 2012-2055)

## Strategic Context

**User Research Validation:**
- "TypingClub's visual guidance helps beginners" (final-analysis.md)
- "Professional UI, not cartoonish" (user feedback)
- "Visual keyboard useful for learning, but distracting for speed typing" (power user feedback)

**Business Value:**
- Differentiates from pure speed-focused tools (Monkeytype)
- Enables effective teaching mode (TypingClub-style)
- Reduces learning curve for touch-typing beginners
- Provides visual feedback without juvenile aesthetics

## Functional Requirements

### FR-1: Shared Component Architecture
**Priority: CRITICAL**

The Virtual Keyboard shall be a shared React component used by both desktop (Tauri) and web (Next.js).

**Acceptance Criteria:**
- [ ] Component located in `packages/shared-ui/components/VirtualKeyboard`
- [ ] Identical appearance and functionality across desktop and web
- [ ] 90%+ code reuse between platforms
- [ ] TypeScript interfaces in `packages/shared-types`
- [ ] Zero platform-specific code in component itself
- [ ] Works with React 18 APIs only (no React 19-specific features)

### FR-2: QWERTY Layout (MVP)
**Priority: CRITICAL**

The system shall display an accurate QWERTY keyboard layout for MVP.

**Acceptance Criteria:**
- [ ] Standard US QWERTY layout with all keys
- [ ] Accurate key positioning matching physical keyboards
- [ ] Keys include:
  - Letters (A-Z)
  - Numbers (0-9)
  - Common symbols (!, @, #, $, %, etc.)
  - Special keys (Space, Shift, Enter, Backspace, Tab)
- [ ] Shift state changes displayed symbols
- [ ] Caps Lock state indicated visually
- [ ] Layout matches common mechanical keyboards

**Future Enhancements (v2.0):**
- Dvorak layout support
- Colemak layout support
- Custom layout configuration

### FR-3: Real-time Key Highlighting
**Priority: CRITICAL**

The system shall highlight the target key that the user should type next.

**Acceptance Criteria:**
- [ ] Target key highlighted with distinct visual indicator
- [ ] Highlight updates immediately when expected character changes
- [ ] Highlight removed when key is correctly typed
- [ ] Highlight latency <5ms (imperceptible to user)
- [ ] Works for all character types (letters, numbers, symbols)
- [ ] Shift key highlighted when uppercase character expected
- [ ] Special characters show correct modifier keys (Shift + key)

### FR-4: Visual Feedback for Key Presses
**Priority: HIGH**

The system shall provide immediate visual feedback when a key is pressed.

**Acceptance Criteria:**
- [ ] Pressed key displays "pressed" visual state
- [ ] Correct keystrokes show positive feedback (e.g., green flash)
- [ ] Incorrect keystrokes show error feedback (e.g., red flash)
- [ ] Visual state returns to normal after brief delay (~200ms)
- [ ] Multiple simultaneous key presses handled correctly
- [ ] Feedback works for both correct and incorrect keys
- [ ] Animations are smooth (no jank)

### FR-5: Hand Position Guidance (Finger Color-Coding)
**Priority: HIGH**

The system shall color-code keys by the finger that should press them.

**Acceptance Criteria:**
- [ ] Keys color-coded by finger assignment:
  - Left pinky (e.g., light purple)
  - Left ring (e.g., light blue)
  - Left middle (e.g., light green)
  - Left index (e.g., light yellow)
  - Right index (e.g., light orange)
  - Right middle (e.g., light red)
  - Right ring (e.g., light pink)
  - Right pinky (e.g., light gray)
  - Thumbs/Space (e.g., light beige)
- [ ] Color scheme is accessible (color-blind friendly)
- [ ] Colors are professional, not cartoonish
- [ ] Color intensity is subtle (not overwhelming)
- [ ] Toggle option to disable finger guidance colors
- [ ] Home row keys visually distinct (F and J nubs)

**Finger Assignment Standards:**
Following standard touch-typing conventions:
- **Left Pinky**: Q, A, Z, 1, `, Tab, Shift, Caps Lock
- **Left Ring**: W, S, X, 2
- **Left Middle**: E, D, C, 3
- **Left Index**: R, T, F, G, V, B, 4, 5
- **Right Index**: Y, U, H, J, N, M, 6, 7
- **Right Middle**: I, K, <, 8
- **Right Ring**: O, L, >, 9
- **Right Pinky**: P, ;, /, 0, -, =, [, ], \, ', Enter, Backspace
- **Thumbs**: Space

### FR-6: Toggle Visibility
**Priority: HIGH**

The system shall allow users to show/hide the virtual keyboard.

**Acceptance Criteria:**
- [ ] Toggle button/keyboard shortcut to show/hide
- [ ] User preference persisted (local storage)
- [ ] Smooth animation when showing/hiding (Framer Motion)
- [ ] Layout adjusts when keyboard is hidden (more space for text)
- [ ] Default state configurable per practice mode:
  - Lesson Mode: Visible by default
  - Practice Mode: Hidden by default
  - Drill Mode: Visible by default
  - Challenge Mode: Hidden by default

### FR-7: Hand Visualization (Optional)
**Priority: MEDIUM**

The system may display virtual hands overlaid on the keyboard.

**Acceptance Criteria:**
- [ ] Translucent hand silhouettes positioned on home row
- [ ] Hands animate to show which finger should press target key
- [ ] Animation is smooth and educational (not distracting)
- [ ] Toggle option to disable hand visualization
- [ ] Works for both left and right hands
- [ ] Professional aesthetics (not cartoonish)

**Note:** This is a v1.1+ feature. MVP focuses on key highlighting and color-coding.

### FR-8: Accessibility
**Priority: HIGH**

The virtual keyboard shall be accessible to all users.

**Acceptance Criteria:**
- [ ] Color-blind friendly color schemes
- [ ] High contrast mode support
- [ ] ARIA labels for screen readers
- [ ] Keyboard navigation support
- [ ] Focus indicators for accessibility
- [ ] Works with browser zoom (125%, 150%)
- [ ] Touch-friendly on tablets (larger keys)

## Non-Functional Requirements

### NFR-1: Performance
**Priority: CRITICAL**

**Rendering Performance:**
- Initial render: <50ms
- Key highlight update: <5ms
- Key press animation: 60fps (no frame drops)
- Re-render on keystroke: <10ms
- Works smoothly during rapid typing (150+ WPM, 16+ keystrokes/second)

**Optimization Techniques:**
- Use `React.memo` for individual key components
- Virtualize keyboard if performance issues arise
- Avoid re-rendering entire keyboard on each keystroke
- Only update affected keys (target key + pressed key)

### NFR-2: Visual Design
**Priority: HIGH**

**Aesthetic Requirements:**
- **Professional Design**: Clean, modern, not juvenile
- **Monkeytype-inspired**: Minimal, distraction-free
- **Dark Mode Default**: Matches app theme
- **Subtle Colors**: Finger guidance colors are muted
- **Smooth Animations**: Framer Motion transitions only (no jank)

**Color Palette:**
- Background: Dark gray (#2c2c2c) or light gray (#f5f5f5)
- Key default: Slightly lighter/darker than background
- Key pressed: Subtle highlight
- Key correct: Green flash (#4caf50)
- Key error: Red flash (#f44336)
- Finger guidance: Pastel colors (see FR-5)

### NFR-3: Responsiveness
**Priority: HIGH**

**Breakpoints:**
- Desktop: Full keyboard (100% scale)
- Tablet: Scaled keyboard (80% scale)
- Mobile: Compact keyboard or hidden by default

**Touch Support:**
- Keys are touch-friendly on tablets (min 44x44px)
- No hover states on touch devices
- Swipe to dismiss keyboard on mobile

### NFR-4: Maintainability
**Priority: HIGH**

- Well-documented component props
- Clear separation: layout data vs rendering logic
- Easy to add new keyboard layouts (Dvorak, Colemak)
- Configurable color schemes
- Unit tests for key positioning and highlighting logic

### NFR-5: Cross-Platform Consistency
**Priority: CRITICAL**

- Identical appearance on desktop (Tauri) and web (Next.js)
- No platform-specific quirks
- Shared styling (Tailwind CSS)
- Shared animation configs (Framer Motion)

## Use Cases

### UC-1: Beginner Learning Touch-Typing (Lesson Mode)
**Actor:** New user learning finger placement
**Flow:**
1. User starts Lesson Mode (focus on home row)
2. Virtual keyboard displays with finger guidance colors
3. Target key (e.g., 'F') is highlighted
4. User sees visual cue: left index finger should press 'F'
5. User presses 'F'
6. Key flashes green (correct)
7. Cursor advances, next key highlighted

**Outcome:** User learns correct finger positioning through visual feedback.

### UC-2: Speed Typist Practicing (Practice Mode)
**Actor:** Experienced typist (80+ WPM)
**Flow:**
1. User starts Practice Mode (30s test)
2. Virtual keyboard is hidden by default (user preference)
3. User types at high speed without distractions
4. (Keyboard remains hidden throughout session)

**Outcome:** No visual clutter for experienced users.

### UC-3: Targeting Weak Keys (Drill Mode)
**Actor:** User with weak pinky fingers
**Flow:**
1. User starts Drill Mode targeting 'P' and 'Q' keys
2. Virtual keyboard displays with finger guidance
3. Keys 'P' and 'Q' are highlighted with extra emphasis
4. User focuses on pinky finger exercises
5. Keyboard provides real-time feedback on accuracy

**Outcome:** Visual focus on specific problem keys.

### UC-4: Toggling Keyboard During Session
**Actor:** User preferring minimal UI
**Flow:**
1. User starts Lesson Mode (keyboard visible)
2. User feels comfortable with finger positioning
3. User presses keyboard shortcut (Cmd+K)
4. Keyboard smoothly animates out (Framer Motion)
5. More space for typing text
6. User presses Cmd+K again to toggle back

**Outcome:** Flexible UI customization.

### UC-5: Dark Mode vs Light Mode
**Actor:** User with light mode preference
**Flow:**
1. User switches app to light mode
2. Virtual keyboard updates color scheme automatically
3. Keys change to light gray background
4. Finger guidance colors remain readable
5. Highlight and feedback colors adapt to light theme

**Outcome:** Consistent visual design across themes.

## Edge Cases

### EC-1: Special Characters (Shift + Key)
- **Scenario:** User needs to type '!' (Shift + 1)
- **Handling:** Both Shift and '1' keys are highlighted

### EC-2: Rapid Typing (High WPM)
- **Scenario:** User types at 150+ WPM (16+ keystrokes/second)
- **Handling:** Highlight updates smoothly without lag or jitter

### EC-3: Unicode Characters
- **Scenario:** Exercise contains emoji or non-ASCII characters
- **Handling:** Keyboard indicates "no physical key" state (e.g., grayed out)

### EC-4: Long Sessions (Memory Management)
- **Scenario:** User types for 1+ hour continuously
- **Handling:** No memory leaks, animations remain smooth

### EC-5: Browser Zoom
- **Scenario:** User zooms browser to 150%
- **Handling:** Keyboard scales correctly, no layout breaks

### EC-6: Mobile/Touch Devices
- **Scenario:** User on iPad (tablet)
- **Handling:** Keyboard scales to fit, keys are touch-friendly

## Success Metrics

### Educational Effectiveness
- Beginners learn touch-typing 20% faster with virtual keyboard enabled
- Error rate decreases by 15% when finger guidance is visible
- Users progress through Lesson Mode 10% faster with visual feedback

### User Satisfaction
- 80%+ of beginners find virtual keyboard helpful (user survey)
- 90%+ of speed typists prefer keyboard hidden (user preference data)
- "Professional design" mentioned in 50%+ positive reviews

### Performance
- Key highlight latency <5ms (p99)
- Animation frame rate 60fps (no drops)
- Zero performance degradation during rapid typing

### Engagement
- Virtual keyboard toggled 30%+ of sessions (indicates active use)
- Lesson Mode completion rate 15% higher with keyboard enabled
- Drill Mode effectiveness 20% higher with visual guidance

## Dependencies

### Internal Dependencies
- `packages/shared-types` - Keyboard layout interfaces
- `packages/shared-ui/components` - Base UI components
- `packages/shared-core/typing` - Keystroke event data

### External Dependencies
- **Framer Motion**: Smooth animations (show/hide, key press feedback)
- **Tailwind CSS**: Styling and responsive design
- **React 18**: Component framework (memo, effects)

### Platform Dependencies
- **Desktop**: Works with Tauri window resizing
- **Web**: Responsive across browsers (Chrome, Safari, Firefox)

## Implementation Notes

### Component Structure
```
packages/shared-ui/components/VirtualKeyboard/
├── VirtualKeyboard.tsx       # Main component
├── components/
│   ├── Key.tsx              # Individual key component (memoized)
│   ├── KeyRow.tsx           # Keyboard row container
│   └── HandOverlay.tsx      # Optional hand visualization (v1.1)
├── hooks/
│   ├── useKeyHighlight.ts   # Highlighting logic
│   └── useKeyPress.ts       # Press feedback logic
├── utils/
│   ├── keyboardLayouts.ts   # QWERTY, Dvorak, Colemak data
│   └── fingerAssignment.ts  # Finger-to-key mapping
└── types/
    └── keyboard.ts          # Keyboard-specific types
```

### Performance Optimization
- Memoize individual `Key` components (React.memo)
- Only re-render keys that change (target key, pressed key)
- Use CSS transforms for animations (GPU-accelerated)
- Avoid re-rendering entire keyboard on each keystroke
- Debounce color scheme changes (theme switching)

### Extensibility
- Easy to add new keyboard layouts (data-driven)
- Color schemes configurable via theme system
- Finger assignment customizable (alternative techniques)
- Hand overlay pluggable (enable/disable)

## References

- [Design Document](./design.md)
- [Interface Specifications](./interfaces.md)
- [Visual Mockups](./visuals/)
- [Diagrams](./diagrams/)
- Parent: [ENGINEERING_REQUIREMENTS.md](../../ENGINEERING_REQUIREMENTS.md)
- Roadmap: [PROJECT_ROADMAP.md](../../../PROJECT_ROADMAP.md)
