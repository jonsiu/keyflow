# Virtual Keyboard - Interface Specifications

## Core Types

### KeyboardKey

**Purpose:** Represents a single key on the virtual keyboard.

```typescript
interface KeyboardKey {
  // Identification
  id: string;                    // Unique key identifier (e.g., "key_a", "key_shift_left")
  value: string;                 // Display value (e.g., "A", "1", "!")
  keyCode: string;               // KeyboardEvent.code (e.g., "KeyA", "Digit1")

  // Position
  position: {
    row: number;                 // Row index (0-5: number row to space row)
    column: number;              // Column index within row
  };

  // Finger assignment
  finger: FingerAssignment;
  hand: 'left' | 'right';

  // Styling
  width: KeyWidth;               // Key width in units (1 = standard, 1.5 = Tab, 2 = Shift)
  height: number;                // Key height in units (usually 1)

  // Alternative characters (Shift state)
  shiftValue?: string;           // Value when Shift is pressed (e.g., "!" for "1")
  altValue?: string;             // Value when Alt is pressed (for international layouts)

  // Metadata
  isModifier: boolean;           // Is this a modifier key (Shift, Ctrl, Alt)?
  isSpecial: boolean;            // Is this a special key (Space, Enter, Backspace)?
}

type FingerAssignment =
  | 'left_pinky'
  | 'left_ring'
  | 'left_middle'
  | 'left_index'
  | 'right_index'
  | 'right_middle'
  | 'right_ring'
  | 'right_pinky'
  | 'thumbs';

type KeyWidth = 1 | 1.25 | 1.5 | 1.75 | 2 | 2.25 | 2.75 | 6.25; // Standard key width units
```

### KeyboardLayout

**Purpose:** Defines the complete keyboard layout.

```typescript
interface KeyboardLayout {
  // Identification
  id: string;                    // Layout identifier (e.g., "qwerty", "dvorak")
  name: string;                  // Display name (e.g., "QWERTY", "Dvorak")

  // Layout data
  rows: KeyboardRow[];           // Keyboard rows (top to bottom)

  // Metadata
  language: string;              // Language code (e.g., "en-US", "fr-FR")
  standard: string;              // Layout standard (e.g., "ANSI", "ISO")

  // Finger guidance
  fingerAssignments: Map<string, FingerAssignment>;
  homeRowKeys: string[];         // Keys in home row (ASDF JKL; for QWERTY)
}

interface KeyboardRow {
  keys: KeyboardKey[];           // Keys in this row
  offsetLeft?: number;           // Left offset for staggered rows (in key units)
}
```

### KeyState

**Purpose:** Represents the current visual state of a key.

```typescript
interface KeyState {
  // Visual state
  isTarget: boolean;             // Should this key be highlighted as target?
  isPressed: boolean;            // Is this key currently pressed?
  isFeedback: boolean;           // Is feedback animation active?
  feedbackType?: FeedbackType;   // Type of feedback to show

  // Modifiers
  isShiftRequired: boolean;      // Should Shift be highlighted too?
  isAltRequired: boolean;        // Should Alt be highlighted too?

  // Animation state
  animationState?: AnimationState;
}

type FeedbackType =
  | 'correct'                    // Green flash (correct keystroke)
  | 'incorrect'                  // Red flash (wrong keystroke)
  | 'neutral';                   // Gray flash (non-validated keystroke)

type AnimationState =
  | 'idle'                       // No animation
  | 'highlighting'               // Highlight animation in progress
  | 'pressing'                   // Press animation in progress
  | 'feedback';                  // Feedback animation in progress
```

### VirtualKeyboardProps

**Purpose:** Props for the main VirtualKeyboard component.

```typescript
interface VirtualKeyboardProps {
  // Display control
  visible?: boolean;             // Is keyboard visible? (default: true)
  onToggleVisibility?: () => void; // Callback when visibility toggled

  // Current state
  targetKey?: string;            // Key that should be highlighted (keyCode)
  pressedKey?: string;           // Key currently pressed (keyCode)

  // Feedback
  lastKeystrokeResult?: KeystrokeFeedback;

  // Configuration
  showFingerGuidance?: boolean;  // Show finger color-coding? (default: true)
  showHandOverlay?: boolean;     // Show hand visualization? (default: false)
  layout?: KeyboardLayoutType;   // Which layout to use (default: "qwerty")
  theme?: KeyboardTheme;         // Visual theme (default: "dark")

  // Event handlers
  onKeyClick?: (key: KeyboardKey) => void; // Called when key is clicked (touch/mouse)

  // Accessibility
  ariaLabel?: string;            // ARIA label for screen readers
  ariaLive?: 'polite' | 'assertive'; // Live region updates
}

interface KeystrokeFeedback {
  key: string;                   // Which key was pressed
  correct: boolean;              // Was it correct?
  timestamp: number;             // When it happened (performance.now())
  duration?: number;             // How long to show feedback (ms, default: 200)
}

type KeyboardLayoutType = 'qwerty' | 'dvorak' | 'colemak' | 'custom';

type KeyboardTheme = 'dark' | 'light' | 'high-contrast';
```

## Component Interfaces

### KeyComponent

**Purpose:** Individual key component (memoized for performance).

```typescript
interface KeyComponentProps {
  // Key data
  keyData: KeyboardKey;

  // Visual state
  state: KeyState;

  // Styling
  fingerGuidanceColor?: string;  // Color for finger guidance
  theme: KeyboardTheme;

  // Event handlers
  onClick?: (key: KeyboardKey) => void;

  // Accessibility
  ariaLabel?: string;
}

// Memoization comparator
const KeyComponent = React.memo(
  KeyComponentImpl,
  (prev, next) => {
    return (
      prev.keyData.id === next.keyData.id &&
      prev.state.isTarget === next.state.isTarget &&
      prev.state.isPressed === next.state.isPressed &&
      prev.state.isFeedback === next.state.isFeedback &&
      prev.theme === next.theme
    );
  }
);
```

### KeyRowComponent

**Purpose:** Container for a row of keys.

```typescript
interface KeyRowComponentProps {
  // Row data
  row: KeyboardRow;
  rowIndex: number;

  // Key states
  keyStates: Map<string, KeyState>;

  // Configuration
  showFingerGuidance: boolean;
  theme: KeyboardTheme;

  // Event handlers
  onKeyClick?: (key: KeyboardKey) => void;
}
```

### HandOverlayComponent

**Purpose:** Optional hand visualization (v1.1+ feature).

```typescript
interface HandOverlayComponentProps {
  // Display control
  visible: boolean;

  // Current state
  targetKey?: string;            // Which key to point at
  hand: 'left' | 'right' | 'both';

  // Animation
  animationDuration?: number;    // Duration of pointing animation (ms)

  // Styling
  opacity?: number;              // Hand transparency (0-1)
  theme: KeyboardTheme;
}

interface HandPosition {
  left: {
    x: number;                   // X position relative to keyboard
    y: number;                   // Y position relative to keyboard
    rotation: number;            // Hand rotation (degrees)
    highlightedFinger?: FingerAssignment;
  };
  right: {
    x: number;
    y: number;
    rotation: number;
    highlightedFinger?: FingerAssignment;
  };
}
```

## Utility Interfaces

### KeyboardLayoutData

**Purpose:** Data structure for keyboard layout definitions.

```typescript
interface KeyboardLayoutData {
  // QWERTY layout
  qwerty: KeyboardLayout;

  // Future layouts (v2.0)
  dvorak?: KeyboardLayout;
  colemak?: KeyboardLayout;

  // Custom layouts
  custom?: Map<string, KeyboardLayout>;
}

// Layout data factory
interface LayoutFactory {
  /**
   * Create a keyboard layout from configuration.
   */
  createLayout(config: LayoutConfig): KeyboardLayout;

  /**
   * Get finger assignment for a key.
   */
  getFingerAssignment(key: string, layout: KeyboardLayoutType): FingerAssignment;

  /**
   * Get all keys assigned to a finger.
   */
  getKeysForFinger(finger: FingerAssignment, layout: KeyboardLayoutType): KeyboardKey[];
}

interface LayoutConfig {
  type: KeyboardLayoutType;
  standard: 'ANSI' | 'ISO';      // Physical layout standard
  language: string;              // Language code
  customMappings?: Map<string, string>;
}
```

### FingerGuidanceConfig

**Purpose:** Configuration for finger guidance colors and settings.

```typescript
interface FingerGuidanceConfig {
  // Color scheme
  colors: {
    left_pinky: string;          // e.g., "#e1bee7" (light purple)
    left_ring: string;           // e.g., "#bbdefb" (light blue)
    left_middle: string;         // e.g., "#c8e6c9" (light green)
    left_index: string;          // e.g., "#fff9c4" (light yellow)
    right_index: string;         // e.g., "#ffccbc" (light orange)
    right_middle: string;        // e.g., "#ffcdd2" (light red)
    right_ring: string;          // e.g., "#f8bbd0" (light pink)
    right_pinky: string;         // e.g., "#f5f5f5" (light gray)
    thumbs: string;              // e.g., "#ffe0b2" (light beige)
  };

  // Visual settings
  intensity: number;             // Color intensity (0-1, default: 0.3)
  showOnTarget: boolean;         // Emphasize target key finger color?
  showOnHomeRow: boolean;        // Always show home row colors?

  // Accessibility
  highContrast: boolean;         // Use high-contrast colors?
  colorBlindMode?: ColorBlindMode;
}

type ColorBlindMode =
  | 'none'
  | 'protanopia'                 // Red-green (common)
  | 'deuteranopia'               // Red-green (common)
  | 'tritanopia';                // Blue-yellow (rare)
```

### KeyboardAnimationConfig

**Purpose:** Configuration for keyboard animations.

```typescript
interface KeyboardAnimationConfig {
  // Transitions (Framer Motion)
  showHide: {
    duration: number;            // Show/hide animation duration (ms)
    ease: string;                // Easing function (e.g., "easeInOut")
  };

  // Key press feedback
  press: {
    duration: number;            // Press animation duration (ms)
    scale: number;               // Scale factor when pressed (e.g., 0.95)
  };

  // Highlight animation
  highlight: {
    duration: number;            // Highlight transition duration (ms)
    pulseInterval?: number;      // Optional pulsing effect (ms)
  };

  // Feedback flash
  feedback: {
    duration: number;            // Feedback flash duration (ms)
    correct: {
      color: string;             // Correct keystroke color (e.g., "#4caf50")
      intensity: number;         // Flash intensity (0-1)
    };
    incorrect: {
      color: string;             // Incorrect keystroke color (e.g., "#f44336")
      intensity: number;
    };
  };
}
```

## Hook Interfaces

### useKeyHighlight

**Purpose:** Hook for managing key highlighting logic.

```typescript
interface UseKeyHighlightHook {
  (props: {
    targetKey?: string;          // Current target key
    shiftRequired?: boolean;     // Is Shift key required?
    layout: KeyboardLayoutType;
  }): UseKeyHighlightResult;
}

interface UseKeyHighlightResult {
  // Highlighted keys
  highlightedKeys: Set<string>;  // Set of key IDs to highlight

  // Modifier state
  modifiersRequired: {
    shift: boolean;
    alt: boolean;
    ctrl: boolean;
  };

  // Update function
  updateTarget: (newTarget?: string, modifiers?: ModifierState) => void;
}

interface ModifierState {
  shift?: boolean;
  alt?: boolean;
  ctrl?: boolean;
}
```

### useKeyPress

**Purpose:** Hook for managing key press feedback.

```typescript
interface UseKeyPressHook {
  (props: {
    feedbackDuration?: number;   // How long to show feedback (ms)
    animationConfig?: KeyboardAnimationConfig;
  }): UseKeyPressResult;
}

interface UseKeyPressResult {
  // Current key states
  keyStates: Map<string, KeyState>;

  // Actions
  handleKeyPress: (key: string, correct: boolean) => void;
  handleKeyRelease: (key: string) => void;
  clearFeedback: (key: string) => void;

  // Utility
  isKeyPressed: (key: string) => boolean;
  getKeyState: (key: string) => KeyState;
}
```

### useKeyboardLayout

**Purpose:** Hook for managing keyboard layout data.

```typescript
interface UseKeyboardLayoutHook {
  (layoutType: KeyboardLayoutType): UseKeyboardLayoutResult;
}

interface UseKeyboardLayoutResult {
  // Layout data
  layout: KeyboardLayout;

  // Queries
  getKey: (keyCode: string) => KeyboardKey | undefined;
  getKeysForFinger: (finger: FingerAssignment) => KeyboardKey[];
  getHomeRowKeys: () => KeyboardKey[];

  // Utilities
  getFingerAssignment: (keyCode: string) => FingerAssignment;
  getFingerColor: (finger: FingerAssignment) => string;
}
```

### useKeyboardVisibility

**Purpose:** Hook for managing keyboard visibility state.

```typescript
interface UseKeyboardVisibilityHook {
  (initialVisible?: boolean): UseKeyboardVisibilityResult;
}

interface UseKeyboardVisibilityResult {
  // State
  visible: boolean;

  // Actions
  show: () => void;
  hide: () => void;
  toggle: () => void;

  // Persistence
  persistPreference: (visible: boolean) => void;
  loadPreference: () => boolean;
}
```

## Responsive Design Interfaces

### KeyboardDimensions

**Purpose:** Responsive keyboard sizing.

```typescript
interface KeyboardDimensions {
  // Container dimensions
  containerWidth: number;        // Keyboard container width (px)
  containerHeight: number;       // Keyboard container height (px)

  // Key dimensions
  keyWidth: number;              // Base key width (px)
  keyHeight: number;             // Base key height (px)
  keyGap: number;                // Gap between keys (px)

  // Scaling
  scale: number;                 // Overall scale factor (0-1)

  // Breakpoints
  breakpoint: BreakpointType;
}

type BreakpointType = 'mobile' | 'tablet' | 'desktop' | 'large';

// Responsive dimensions calculator
interface ResponsiveDimensionsCalculator {
  /**
   * Calculate keyboard dimensions for given viewport.
   */
  calculateDimensions(viewportWidth: number, viewportHeight: number): KeyboardDimensions;

  /**
   * Get breakpoint for given viewport width.
   */
  getBreakpoint(viewportWidth: number): BreakpointType;

  /**
   * Check if dimensions should update.
   */
  shouldUpdate(oldDims: KeyboardDimensions, newDims: KeyboardDimensions): boolean;
}
```

## Performance Interfaces

### KeyboardPerformanceMetrics

**Purpose:** Track keyboard component performance.

```typescript
interface KeyboardPerformanceMetrics {
  // Render performance
  initialRenderTime: number;     // First render duration (ms)
  avgRerenderTime: number;       // Average re-render duration (ms)

  // Update latency
  highlightUpdateLatency: number; // Time to update highlight (ms)
  pressUpdateLatency: number;    // Time to show press feedback (ms)

  // Animation performance
  avgFrameRate: number;          // Average FPS during animations
  droppedFrames: number;         // Number of dropped frames

  // Memory
  keyComponentCount: number;     // Number of rendered key components
  memoizedComponents: number;    // Number of memoized (not re-rendered) keys
}

interface PerformanceMonitor {
  /**
   * Start monitoring keyboard performance.
   */
  startMonitoring(): void;

  /**
   * Get current performance metrics.
   */
  getMetrics(): KeyboardPerformanceMetrics;

  /**
   * Stop monitoring and cleanup.
   */
  stopMonitoring(): void;
}
```

## Testing Interfaces

### MockKeyboard

**Purpose:** Mock virtual keyboard for testing.

```typescript
interface MockKeyboard {
  /**
   * Simulate target key change.
   */
  setTargetKey(keyCode: string): void;

  /**
   * Simulate key press.
   */
  pressKey(keyCode: string, correct: boolean): void;

  /**
   * Simulate key release.
   */
  releaseKey(keyCode: string): void;

  /**
   * Get current state of all keys.
   */
  getKeyStates(): Map<string, KeyState>;

  /**
   * Verify highlight is shown.
   */
  isHighlighted(keyCode: string): boolean;

  /**
   * Verify feedback is displayed.
   */
  hasFeedback(keyCode: string, type: FeedbackType): boolean;
}
```

## Constants

### Standard Keyboard Layouts

```typescript
// Standard QWERTY layout (US ANSI)
const QWERTY_LAYOUT: KeyboardLayout = {
  id: 'qwerty',
  name: 'QWERTY',
  rows: [
    // Number row
    { keys: [/* ` 1 2 3 4 5 6 7 8 9 0 - = */] },
    // Top row
    { keys: [/* Tab Q W E R T Y U I O P [ ] \ */] },
    // Home row
    { keys: [/* Caps A S D F G H J K L ; ' Enter */] },
    // Bottom row
    { keys: [/* Shift Z X C V B N M , . / Shift */] },
    // Space row
    { keys: [/* Ctrl Alt Cmd Space Cmd Alt Ctrl */] }
  ],
  language: 'en-US',
  standard: 'ANSI',
  fingerAssignments: new Map([
    // Left pinky
    ['KeyQ', 'left_pinky'], ['KeyA', 'left_pinky'], ['KeyZ', 'left_pinky'],
    // Left ring
    ['KeyW', 'left_ring'], ['KeyS', 'left_ring'], ['KeyX', 'left_ring'],
    // ... (full mapping)
  ]),
  homeRowKeys: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon']
};
```

## References

- [Requirements](./requirements.md)
- [Design Document](./design.md)
- [Visual Mockups](./visuals/)
- [Architectural Patterns](../../architecture/design-patterns.md)