# Keystroke Validation - Design Document

## Architecture Overview

The keystroke validation system uses a combination of design patterns to achieve **<2ms latency** while maintaining code quality and extensibility.

## Design Patterns Applied

### 1. State Machine Pattern
**Purpose:** Manage validation states and prevent invalid transitions.

The validation system operates in distinct states:
- `WAITING_FOR_INPUT` - Ready to receive next keystroke
- `VALIDATING` - Processing current keystroke
- `CORRECT_INPUT` - Keystroke matched expected character
- `INCORRECT_INPUT` - Keystroke did not match
- `BACKSPACE_ALLOWED` - User can backspace to correct
- `SESSION_COMPLETE` - All text typed correctly

**Benefits:**
- Clear state transitions
- Prevents invalid actions (e.g., advance on wrong key)
- Easy to test and reason about
- Self-documenting behavior

**Diagram:** See [diagrams/state-machine.puml](./diagrams/state-machine.puml)

### 2. Command Pattern
**Purpose:** Encapsulate keystroke processing as executable commands.

Each keystroke is processed as a command object that can be executed, and potentially undone (for backspace).

**Benefits:**
- Testable in isolation
- Supports undo/redo (backspace functionality)
- Encapsulates business logic
- Separates input handling from validation

**Diagram:** See [diagrams/class-diagram.puml](./diagrams/class-diagram.puml)

### 3. Strategy Pattern
**Purpose:** Support different validation modes with interchangeable strategies.

Different practice modes may require different validation rules:
- `StrictValidationStrategy` - No forward progress on error (Lesson mode)
- `LenientValidationStrategy` - Allow forward progress with penalty (Practice mode)
- `NoValidationStrategy` - Free typing (for warm-up exercises)

**Benefits:**
- Easy to add new validation modes
- Runtime swapping of strategies
- Each mode encapsulated independently
- Clear interface contracts

### 4. Observer Pattern
**Purpose:** Decouple validation logic from UI updates and analytics.

Components subscribe to keystroke events without tight coupling:
- UI components update display
- Metrics calculator updates WPM/accuracy
- Error tracker logs mistakes
- Audio system plays feedback sounds

**Benefits:**
- Loose coupling
- Easy to add new observers
- Prevents memory leaks (proper cleanup)
- Real-time updates

**Diagram:** See [diagrams/sequence-correct-keystroke.puml](./diagrams/sequence-correct-keystroke.puml)

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (packages/shared-ui)                        │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │         TypingInterface.tsx                   │      │
│  │  - Captures keyboard events                   │      │
│  │  - Displays current text and cursor           │      │
│  │  - Provides visual/audio feedback             │      │
│  └─────────────────┬────────────────────────────┘      │
└────────────────────┼───────────────────────────────────┘
                     │
                     ▼ uses
┌─────────────────────────────────────────────────────────┐
│                  Business Logic Layer                    │
│              (packages/shared-core)                      │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │         TypingSessionFacade                   │      │
│  │  - Simplified API for UI                      │      │
│  │  - Coordinates subsystems                     │      │
│  └───────┬──────────────┬──────────────┬────────┘      │
│          │              │              │                │
│          ▼              ▼              ▼                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Input    │  │ Keystroke    │  │ Metrics      │    │
│  │Validator │  │ Tracker      │  │ Calculator   │    │
│  └──────────┘  └──────────────┘  └──────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Hot Path Optimization

The validation logic is performance-critical and must execute in <0.1ms.

### Optimization Techniques

#### 1. Pre-computed Lookup Tables
```typescript
// NO: String operations in hot path (slow)
if (key === expectedText.charAt(position)) { }

// YES: Pre-computed character codes (fast)
if (keyCode === charCodes[position]) { }
```

#### 2. Inline Functions
```typescript
// Avoid function call overhead in hot path
// Small validation logic is inlined
```

#### 3. Zero Allocations
```typescript
// NO: Creates new objects on every keystroke
const result = { isValid: true, position: pos };

// YES: Reuse result objects, update properties
this.result.isValid = true;
this.result.position = pos;
```

#### 4. Synchronous Execution
```typescript
// NO async operations in validation
// All operations are synchronous and fast
```

#### 5. Memoization
```typescript
// Cache expensive calculations
// WPM/accuracy only recalculated when needed
```

## Data Flow

### Correct Keystroke Flow
```
User Input → Input Validator → Metrics Calculator → UI Update
   (0ms)         (<0.1ms)           (<0.5ms)        (<1ms)
                                                  
Total: <2ms
```

### Incorrect Keystroke Flow
```
User Input → Input Validator → Error Tracker → Feedback System → UI Update
   (0ms)         (<0.1ms)        (<0.5ms)        (<0.5ms)       (<1ms)
                                                  
Total: <2ms
```

**Key Principle:** No IPC calls, no async operations, no network requests in hot path.

## State Management

### State Transitions

```
WAITING_FOR_INPUT
    │
    ├─[keyPress(correct)]──→ CORRECT_INPUT ──→ WAITING_FOR_INPUT (advance position)
    │
    ├─[keyPress(wrong)]────→ INCORRECT_INPUT ──→ WAITING_FOR_INPUT (stay at position)
    │
    ├─[keyPress(backspace)]→ BACKSPACE_ALLOWED ──→ WAITING_FOR_INPUT (move back)
    │
    └─[isComplete()]───────→ SESSION_COMPLETE
```

### State Persistence

- **In-memory state:** Current position, temporary metrics (fast, no I/O)
- **Periodic saves:** Debounced saves to storage (every 500ms, cold path)
- **Session end:** Full save with analytics

## Error Handling

### Validation Errors
- **Invalid key input:** Ignored, no state change
- **Unexpected state:** Log error, attempt recovery
- **Performance degradation:** Log warning, continue operation

### Recovery Mechanisms
- **State corruption:** Reset to last known good state
- **Memory pressure:** Clear non-essential caches
- **UI desync:** Force re-render with current state

## Extensibility Points

### 1. Validation Strategies
New validation modes can be added by implementing `ValidationStrategy` interface:
```typescript
class CustomValidationStrategy implements ValidationStrategy {
  validate(input: string, expected: string, position: number): ValidationResult {
    // Custom logic
  }
}
```

### 2. Event Observers
New observers can subscribe to keystroke events:
```typescript
session.subscribe((event) => {
  // Custom handling (logging, analytics, etc.)
});
```

### 3. Error Tracking
Error tracker can be extended with custom analysis:
```typescript
class EnhancedWrongKeyTracker extends WrongKeyTracker {
  identifyAdvancedPatterns() {
    // AI/ML-based pattern detection
  }
}
```

## Testing Strategy

### Unit Tests
- Pure function validation logic
- State machine transitions
- Edge cases (Unicode, special chars)
- Performance benchmarks

### Integration Tests
- Full keystroke flow (UI → validation → feedback)
- Multi-character sequences
- Error recovery scenarios

### Performance Tests
- Latency benchmarks (<2ms requirement)
- Memory leak detection
- Stress testing (rapid typing, long sessions)

## Security Considerations

### Input Sanitization
- Validate keystroke is actual keyboard input (not injected)
- Prevent XSS through text content
- Sanitize all text before display

### Privacy
- Keystroke dynamics data stored locally
- Opt-in for cloud sync
- Anonymize before upload

### Data Integrity
- Validate all metrics calculations
- Prevent tampering with session data
- Cryptographic signing for competitive modes (future)

## Diagrams

1. [State Machine Diagram](./diagrams/state-machine.puml) - Validation states and transitions
2. [Class Diagram](./diagrams/class-diagram.puml) - Core classes and relationships
3. [Sequence Diagram: Correct Keystroke](./diagrams/sequence-correct-keystroke.puml) - Happy path flow
4. [Sequence Diagram: Wrong Keystroke](./diagrams/sequence-wrong-keystroke.puml) - Error path flow
5. [Sequence Diagram: Backspace](./diagrams/sequence-backspace.puml) - Backspace recovery flow
6. [Sequence Diagram: Session Complete](./diagrams/sequence-session-complete.puml) - Completion flow

## References

- [Requirements](./requirements.md)
- [Interface Specifications](./interfaces.md)
- [Architectural Patterns](../../architecture/design-patterns.md)

