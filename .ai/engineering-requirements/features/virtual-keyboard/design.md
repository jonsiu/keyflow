# Virtual Keyboard - Design Document

## Architecture Overview

The Virtual Keyboard is a **shared React component** that provides real-time visual feedback through a combination of design patterns optimized for performance and maintainability. The architecture ensures <5ms highlight updates while maintaining smooth 60fps animations.

## Design Principles

### 1. Component Composition
Break down the keyboard into small, memoized components to minimize re-renders.

### 2. Performance-First
Every design decision considers the performance impact of rapid keystroke updates (150+ WPM, 16+ keystrokes/second).

### 3. Platform Agnostic
No platform-specific code. Works identically on desktop (Tauri) and web (Next.js).

### 4. Accessible by Default
ARIA labels, keyboard navigation, and color-blind friendly design from the start.

### 5. Progressive Enhancement
Core functionality works first, visual enhancements (animations, colors) layer on top.

## Design Patterns Applied

### 1. Composite Pattern
**Purpose:** Treat individual keys and key groups uniformly.

**Structure:**
```
VirtualKeyboard (composite)
  └── KeyRow (composite)
      └── Key (leaf)
```

**Benefits:**
- Keyboard is composed of rows, rows contain keys
- Easy to manipulate groups (e.g., highlight entire row)
- Consistent interface for all components
- Natural hierarchy matches physical keyboard

**Diagram:** See [diagrams/composite-structure.puml](./diagrams/)

### 2. Strategy Pattern
**Purpose:** Support different keyboard layouts with interchangeable strategies.

**Strategies:**
- `QWERTYLayoutStrategy` - Standard QWERTY layout (MVP)
- `DvorakLayoutStrategy` - Dvorak layout (v2.0)
- `ColemakLayoutStrategy` - Colemak layout (v2.0)
- `CustomLayoutStrategy` - User-defined layouts (v2.0+)

**Benefits:**
- Easy to add new layouts
- Runtime layout switching
- Each layout encapsulated independently
- Clear separation of layout data vs rendering logic

**Implementation:**
```typescript
interface KeyboardLayoutStrategy {
  getLayout(): KeyboardLayout;
  getFingerAssignment(key: string): FingerAssignment;
  getKeyPosition(key: string): { row: number; column: number };
}

class QWERTYLayoutStrategy implements KeyboardLayoutStrategy {
  getLayout(): KeyboardLayout {
    return QWERTY_LAYOUT_DATA;
  }
}
```

### 3. Observer Pattern
**Purpose:** Decouple keyboard state from UI updates.

**Observers:**
- Key components observe target key changes
- Animation system observes feedback events
- Performance monitor observes render cycles

**Benefits:**
- Loose coupling between state and UI
- Easy to add new observers (e.g., audio feedback)
- Prevents cascading re-renders
- Clean event-driven architecture

**Diagram:** See [diagrams/observer-pattern.puml](./diagrams/)

### 4. Flyweight Pattern
**Purpose:** Share key styling and layout data to reduce memory footprint.

**Shared State (Intrinsic):**
- Keyboard layout data (rows, columns, finger assignments)
- Color schemes and themes
- Base styling (dimensions, fonts)

**Unique State (Extrinsic):**
- Per-key state (isTarget, isPressed, isFeedback)
- Animation states

**Benefits:**
- Minimal memory usage (100+ key components)
- Shared data cached efficiently
- Fast component instantiation
- Reduced bundle size

**Implementation:**
```typescript
// Shared (Flyweight)
const SHARED_KEY_STYLE = {
  borderRadius: 4,
  fontSize: 14,
  fontFamily: 'monospace'
};

// Unique per key
interface KeyState {
  isTarget: boolean;
  isPressed: boolean;
  feedbackType?: FeedbackType;
}
```

### 5. Facade Pattern
**Purpose:** Simplify complex keyboard interactions with a clean API.

**Facade Interface:**
```typescript
interface VirtualKeyboardFacade {
  // Simple API for UI components
  highlightKey(keyCode: string): void;
  pressKey(keyCode: string, correct: boolean): void;
  releaseKey(keyCode: string): void;
  show(): void;
  hide(): void;
}
```

**Hidden Complexity:**
- Layout management
- State tracking
- Animation coordination
- Performance optimization

**Benefits:**
- Simple API for consuming components
- Encapsulates complex state management
- Easy to refactor internals
- Clear contract for external use

## Component Architecture

### Component Hierarchy

```
VirtualKeyboard (container)
  ├── KeyboardContainer (layout wrapper)
  │   ├── KeyRow (row 1: number row)
  │   │   ├── Key (`)
  │   │   ├── Key (1)
  │   │   └── ... (13 keys)
  │   ├── KeyRow (row 2: top row)
  │   │   ├── Key (Tab)
  │   │   ├── Key (Q)
  │   │   └── ... (13 keys)
  │   ├── KeyRow (row 3: home row)
  │   │   ├── Key (Caps)
  │   │   ├── Key (A)
  │   │   └── ... (12 keys)
  │   ├── KeyRow (row 4: bottom row)
  │   │   ├── Key (Shift)
  │   │   ├── Key (Z)
  │   │   └── ... (11 keys)
  │   └── KeyRow (row 5: space row)
  │       ├── Key (Ctrl)
  │       ├── Key (Space)
  │       └── ... (5 keys)
  └── HandOverlay (optional, v1.1+)
      ├── HandLeft
      └── HandRight
```

### Component Responsibilities

#### VirtualKeyboard (Main Component)
**Responsibilities:**
- Manage overall keyboard state
- Handle visibility toggling
- Coordinate child components
- Expose public API

**State Management:**
- Current layout type
- Visibility state
- Target key
- Pressed keys
- Theme

**Performance Considerations:**
- Memoize child components
- Only pass changed props to children
- Debounce theme changes

#### KeyRow (Row Container)
**Responsibilities:**
- Render a row of keys
- Handle row-level styling (offsets, alignment)
- Pass state to child keys

**Performance Considerations:**
- Memoize row if no keys in row changed
- Use React.memo with custom comparator

#### Key (Individual Key)
**Responsibilities:**
- Render single key with current state
- Handle click/touch events
- Show visual feedback (highlight, press, feedback)
- Apply finger guidance colors

**Performance Considerations:**
- **CRITICAL:** Memoize aggressively
- Only re-render if own state changed
- Use CSS transforms for animations (GPU-accelerated)
- Avoid inline styles (use CSS classes)

**Memoization Strategy:**
```typescript
const Key = React.memo(
  KeyImpl,
  (prev, next) => {
    // Only re-render if these specific props changed
    return (
      prev.keyData.id === next.keyData.id &&
      prev.state.isTarget === next.state.isTarget &&
      prev.state.isPressed === next.state.isPressed &&
      prev.state.isFeedback === next.state.isFeedback &&
      prev.state.feedbackType === next.state.feedbackType &&
      prev.showFingerGuidance === next.showFingerGuidance &&
      prev.theme === next.theme
    );
  }
);
```

## State Management

### State Organization

```typescript
interface VirtualKeyboardState {
  // Layout
  layout: KeyboardLayout;
  layoutType: KeyboardLayoutType;

  // Visibility
  visible: boolean;

  // Key states (per-key state tracked separately)
  keyStates: Map<string, KeyState>;

  // Current targets
  targetKey?: string;
  modifiersRequired: {
    shift: boolean;
    alt: boolean;
    ctrl: boolean;
  };

  // Configuration
  showFingerGuidance: boolean;
  showHandOverlay: boolean;
  theme: KeyboardTheme;

  // Animation state
  animationConfig: KeyboardAnimationConfig;
}
```

### State Updates (Performance Critical)

**Hot Path (per-keystroke updates):**
```typescript
// Fast: Only update affected key states
const updateKeyHighlight = (newTarget: string) => {
  setKeyStates((prev) => {
    const next = new Map(prev);

    // Clear old target
    if (currentTarget) {
      const oldState = next.get(currentTarget);
      next.set(currentTarget, { ...oldState, isTarget: false });
    }

    // Set new target
    const newState = next.get(newTarget);
    next.set(newTarget, { ...newState, isTarget: true });

    return next; // Only 2 keys re-render
  });
};
```

**Cold Path (theme changes):**
```typescript
// Slow: Debounced, all keys may re-render
const debouncedThemeChange = debounce((newTheme: KeyboardTheme) => {
  setTheme(newTheme);
  // Theme change is infrequent, full re-render acceptable
}, 100);
```

### State Persistence

**User Preferences (persisted):**
- Keyboard visibility (default shown/hidden)
- Finger guidance enabled/disabled
- Hand overlay enabled/disabled
- Theme preference

**Session State (transient):**
- Current key states
- Animation states
- Performance metrics

**Storage Strategy:**
```typescript
// Desktop: Tauri Store
await invoke('save_keyboard_prefs', {
  visible: state.visible,
  showFingerGuidance: state.showFingerGuidance,
  theme: state.theme
});

// Web: localStorage
localStorage.setItem('keyflow_keyboard_prefs', JSON.stringify(prefs));
```

## Visual Design

### Color System

#### Dark Theme (Default)
```css
:root[data-theme="dark"] {
  --keyboard-bg: #2c2c2c;
  --key-bg: #3c3c3c;
  --key-text: #e0e0e0;
  --key-border: #4a4a4a;
  --key-pressed: #4c4c4c;
  --key-target: #5a5a5a;
  --key-correct: #4caf50;
  --key-incorrect: #f44336;

  /* Finger guidance colors (pastel, muted) */
  --finger-left-pinky: #e1bee7;    /* Light purple */
  --finger-left-ring: #bbdefb;     /* Light blue */
  --finger-left-middle: #c8e6c9;   /* Light green */
  --finger-left-index: #fff9c4;    /* Light yellow */
  --finger-right-index: #ffccbc;   /* Light orange */
  --finger-right-middle: #ffcdd2;  /* Light red */
  --finger-right-ring: #f8bbd0;    /* Light pink */
  --finger-right-pinky: #f5f5f5;   /* Light gray */
  --finger-thumbs: #ffe0b2;        /* Light beige */
}
```

#### Light Theme
```css
:root[data-theme="light"] {
  --keyboard-bg: #f5f5f5;
  --key-bg: #ffffff;
  --key-text: #333333;
  --key-border: #e0e0e0;
  --key-pressed: #f0f0f0;
  --key-target: #e8e8e8;
  --key-correct: #4caf50;
  --key-incorrect: #f44336;

  /* Same finger colors, work on light background */
}
```

#### High Contrast Theme
```css
:root[data-theme="high-contrast"] {
  --keyboard-bg: #000000;
  --key-bg: #1a1a1a;
  --key-text: #ffffff;
  --key-border: #ffffff;
  --key-pressed: #333333;
  --key-target: #ffff00;          /* Bright yellow target */
  --key-correct: #00ff00;         /* Bright green */
  --key-incorrect: #ff0000;       /* Bright red */

  /* Higher contrast finger colors */
}
```

### Typography

```css
.keyboard-key {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.keyboard-key--modifier {
  font-size: 11px;  /* Smaller for Shift, Ctrl, etc. */
  font-weight: 600;
  text-transform: uppercase;
}

.keyboard-key--special {
  font-size: 12px;  /* Space, Enter, Backspace */
}
```

### Spacing & Sizing

```css
.keyboard-container {
  --key-base-width: 48px;     /* Base key width */
  --key-base-height: 48px;    /* Base key height */
  --key-gap: 4px;             /* Gap between keys */
  --row-offset: 8px;          /* Row stagger offset */
}

/* Responsive scaling */
@media (max-width: 1024px) {
  .keyboard-container {
    --key-base-width: 40px;
    --key-base-height: 40px;
  }
}

@media (max-width: 768px) {
  .keyboard-container {
    --key-base-width: 32px;
    --key-base-height: 32px;
    --key-gap: 2px;
  }
}
```

### Key Sizing

```css
.key--width-1 { width: calc(var(--key-base-width) * 1); }      /* Standard */
.key--width-1-25 { width: calc(var(--key-base-width) * 1.25); } /* Caps */
.key--width-1-5 { width: calc(var(--key-base-width) * 1.5); }  /* Tab */
.key--width-1-75 { width: calc(var(--key-base-width) * 1.75); } /* Caps Lock */
.key--width-2 { width: calc(var(--key-base-width) * 2); }      /* Shift */
.key--width-2-25 { width: calc(var(--key-base-width) * 2.25); } /* Enter */
.key--width-2-75 { width: calc(var(--key-base-width) * 2.75); } /* Right Shift */
.key--width-6-25 { width: calc(var(--key-base-width) * 6.25); } /* Spacebar */
```

## Animation System

### Framer Motion Configuration

```typescript
const KEYBOARD_ANIMATIONS = {
  // Show/hide keyboard
  showHide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.2, ease: 'easeInOut' }
  },

  // Key highlight
  highlight: {
    initial: { scale: 1 },
    animate: { scale: 1.05 },
    transition: { duration: 0.1, ease: 'easeOut' }
  },

  // Key press
  press: {
    initial: { scale: 1 },
    animate: { scale: 0.95 },
    transition: { duration: 0.05, ease: 'easeInOut' }
  },

  // Correct feedback
  correctFeedback: {
    initial: { backgroundColor: 'var(--key-bg)' },
    animate: {
      backgroundColor: ['var(--key-bg)', 'var(--key-correct)', 'var(--key-bg)']
    },
    transition: { duration: 0.2, times: [0, 0.5, 1] }
  },

  // Incorrect feedback
  incorrectFeedback: {
    initial: { backgroundColor: 'var(--key-bg)' },
    animate: {
      backgroundColor: ['var(--key-bg)', 'var(--key-incorrect)', 'var(--key-bg)']
    },
    transition: { duration: 0.2, times: [0, 0.5, 1] }
  }
};
```

### Animation Performance

**GPU Acceleration:**
```css
.keyboard-key {
  /* Force GPU layer */
  transform: translateZ(0);
  will-change: transform, opacity;

  /* Smooth animations */
  transition:
    transform 0.1s ease-out,
    background-color 0.1s ease-out,
    box-shadow 0.1s ease-out;
}
```

**Avoid Layout Thrashing:**
```typescript
// ❌ BAD: Causes layout recalculation
key.style.width = '50px';
key.style.backgroundColor = 'red';

// ✅ GOOD: Use CSS classes
key.classList.add('key--highlighted');
```

**Debounce Expensive Operations:**
```typescript
// Debounce theme changes (rare operation)
const debouncedThemeChange = useDebouncedCallback(
  (theme: KeyboardTheme) => setTheme(theme),
  100
);
```

## Performance Optimization

### Rendering Optimization

#### 1. Aggressive Memoization
```typescript
// Memoize individual keys (99% of keys won't re-render on each keystroke)
const Key = React.memo(KeyImpl, customComparator);

// Memoize rows if no keys changed
const KeyRow = React.memo(KeyRowImpl, (prev, next) => {
  return prev.rowIndex === next.rowIndex &&
         deepEqual(prev.keyStates, next.keyStates);
});
```

#### 2. Targeted State Updates
```typescript
// Only update affected keys, not entire keyboard
const updateTarget = (newTarget: string) => {
  setKeyStates(prev => {
    const next = new Map(prev);
    // Only modify 2 keys: old target + new target
    // Result: Only 2 Key components re-render
    return next;
  });
};
```

#### 3. CSS-Based Styling
```typescript
// ❌ BAD: Inline styles force re-calculation
<div style={{ background: isTarget ? 'blue' : 'gray' }} />

// ✅ GOOD: CSS classes leverage browser optimization
<div className={cn('key', isTarget && 'key--target')} />
```

#### 4. Virtual Scrolling (if needed)
If keyboard becomes too complex (100+ keys), consider virtualization:
```typescript
import { Virtualizer } from '@tanstack/react-virtual';

// Only render visible key rows
const visibleRows = virtualizer.getVirtualItems();
```

### Memory Optimization

#### 1. Flyweight Pattern for Shared Data
```typescript
// Share immutable layout data across all instances
const LAYOUT_DATA = Object.freeze({
  qwerty: { /* layout data */ }
});

// Each Key component references shared data, not copies
```

#### 2. Cleanup on Unmount
```typescript
useEffect(() => {
  // Setup animations, event listeners, etc.

  return () => {
    // Cleanup: cancel animations, remove listeners
    animationFrameId && cancelAnimationFrame(animationFrameId);
    listeners.forEach(cleanup => cleanup());
  };
}, []);
```

#### 3. Lazy Loading (Web Only)
```typescript
// Web: Lazy load keyboard component
const VirtualKeyboard = dynamic(() => import('./VirtualKeyboard'), {
  ssr: false,
  loading: () => <KeyboardSkeleton />
});
```

### Animation Performance

#### 1. GPU-Accelerated Transforms
```css
.key {
  /* Use transform instead of top/left */
  transform: translate3d(0, 0, 0) scale(1);

  /* Hint to browser for optimization */
  will-change: transform;
}
```

#### 2. RequestAnimationFrame for Smooth Updates
```typescript
const updateKeyState = (key: string, state: KeyState) => {
  requestAnimationFrame(() => {
    setKeyStates(prev => {
      const next = new Map(prev);
      next.set(key, state);
      return next;
    });
  });
};
```

#### 3. Throttle Rapid Updates
```typescript
// Throttle feedback animations (prevent animation queue buildup)
const throttledFeedback = throttle((key: string, type: FeedbackType) => {
  showFeedback(key, type);
}, 50); // Max 20 fps for feedback
```

## Accessibility

### ARIA Implementation

```tsx
<div
  role="application"
  aria-label="Virtual keyboard for typing guidance"
  aria-live="polite"
  aria-atomic="false"
>
  <div role="group" aria-label="Number row">
    <button
      role="button"
      aria-label="Key A, left pinky finger"
      aria-pressed={isPressed}
      aria-current={isTarget}
      tabIndex={isTarget ? 0 : -1}
    >
      A
    </button>
  </div>
</div>
```

### Keyboard Navigation

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Tab':
      // Navigate between keys
      focusNextKey();
      break;
    case 'Escape':
      // Hide keyboard
      hide();
      break;
    case 'h':
      if (e.metaKey || e.ctrlKey) {
        // Toggle hand overlay
        toggleHandOverlay();
      }
      break;
  }
};
```

### Color-Blind Friendly Design

```typescript
// Color-blind safe palette (pass WCAG AAA)
const COLOR_BLIND_PALETTE = {
  protanopia: {
    // Red-green: Use blue-yellow contrasts
    correct: '#2196f3',     // Blue
    incorrect: '#ff9800',   // Orange
  },
  deuteranopia: {
    // Red-green: Similar to protanopia
    correct: '#2196f3',
    incorrect: '#ff9800',
  },
  tritanopia: {
    // Blue-yellow: Use red-green contrasts
    correct: '#4caf50',     // Green
    incorrect: '#f44336',   // Red
  }
};
```

## Testing Strategy

### Unit Tests
- Key component renders correctly
- State updates only affect target keys
- Animations trigger appropriately
- Memoization prevents unnecessary re-renders

### Integration Tests
- Full keyboard renders with all keys
- Highlight updates on target change
- Press feedback displays correctly
- Theme changes apply to all keys

### Performance Tests
- Render time <50ms (initial)
- Highlight update <5ms
- Animation frame rate 60fps
- Memory usage <10MB

### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation works
- Color contrast meets WCAG AAA
- Focus indicators visible

## Diagrams

1. [Component Structure](./diagrams/component-structure.puml) - Component hierarchy and relationships
2. [State Flow](./diagrams/state-flow.puml) - State management and updates
3. [Render Optimization](./diagrams/render-optimization.puml) - Memoization strategy
4. [Animation Timeline](./diagrams/animation-timeline.puml) - Animation sequence
5. [Responsive Layout](./diagrams/responsive-layout.puml) - Breakpoint behavior

## References

- [Requirements](./requirements.md)
- [Interface Specifications](./interfaces.md)
- [Visual Mockups](./visuals/)
- [Architectural Patterns](../../architecture/design-patterns.md)
