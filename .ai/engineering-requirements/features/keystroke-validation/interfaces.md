# Keystroke Validation - Interface Specifications

## Core Types

### ValidationResult

**Purpose:** Represents the outcome of a keystroke validation.

```typescript
interface ValidationResult {
  // Core validation
  isValid: boolean;
  expectedChar: string;
  actualChar: string;
  position: number;
  timestamp: number;  // performance.now() in milliseconds
  
  // Action to take
  action: ValidationAction;
  
  // Metadata for analytics
  metadata: {
    dwellTime?: number;        // Key down → key up duration (ms)
    interKeyInterval?: number; // Previous keystroke → current (ms)
    flightTime?: number;       // Previous key up → current key down (ms)
  };
}

type ValidationAction = 
  | 'ADVANCE'    // Move to next character
  | 'STAY'       // Remain at current position (wrong key)
  | 'BACKSPACE'  // Move to previous character
  | 'COMPLETE';  // Session finished
```

### TypingContext

**Purpose:** Contains all state needed for validation.

```typescript
interface TypingContext {
  // Text being typed
  expectedText: string;
  currentPosition: number;
  
  // User input tracking
  userInput: string;           // What user has typed so far
  
  // Timing
  startTime: number;           // Session start (performance.now())
  lastKeystrokeTime: number;   // Previous keystroke timestamp
  
  // History
  keystrokes: KeystrokeEvent[];
  errors: TypingError[];
  
  // Configuration
  allowBackspace: boolean;
  validationStrategy: ValidationStrategy;
}
```

### KeystrokeEvent

**Purpose:** Detailed record of a single keystroke.

```typescript
interface KeystrokeEvent {
  // Input
  key: string;              // Character typed
  keyCode: number;          // Keyboard key code
  timestamp: number;        // performance.now()
  
  // Expected vs actual
  expected: string;         // Character that should be typed
  correct: boolean;         // Match result
  
  // Position
  position: number;         // Character position in text
  
  // Timing analytics
  dwellTime: number;        // How long key was held
  interKeyInterval: number; // Time since last keystroke
  flightTime: number;       // Time from previous key up to current key down
}
```

### TypingError

**Purpose:** Record of an incorrect keystroke for analysis.

```typescript
interface TypingError {
  // What happened
  position: number;
  expectedChar: string;
  actualChar: string;
  timestamp: number;
  
  // Context
  attemptNumber: number;    // How many times user tried this position
  isRecoverable: boolean;   // Can be corrected with backspace
  
  // Pattern analysis
  errorType: ErrorType;
  adjacentKey: boolean;     // Was it an adjacent key on keyboard?
  sameFingerKey: boolean;   // Same finger, different key?
}

type ErrorType =
  | 'WRONG_KEY'          // Typed different character
  | 'PREMATURE'          // Tried to type ahead
  | 'REPEAT'             // Keyboard repeat event
  | 'ADJACENT_KEY'       // Hit key next to correct one
  | 'SAME_FINGER';       // Same finger, different key
```

## Core Interfaces

### InputValidator

**Purpose:** Core validation logic (hot path, <0.1ms execution).

```typescript
interface InputValidator {
  /**
   * Validate a single keystroke against expected input.
   * PERFORMANCE CRITICAL: Must execute in <0.1ms
   * 
   * @param key - Character typed by user
   * @param context - Current typing state
   * @returns Validation result with action to take
   */
  validateKeystroke(key: string, context: TypingContext): ValidationResult;
  
  /**
   * Check if backspace is allowed at current position.
   * 
   * @param context - Current typing state
   * @returns true if backspace allowed, false otherwise
   */
  allowBackspace(context: TypingContext): boolean;
  
  /**
   * Determine if session is complete.
   * 
   * @param context - Current typing state
   * @returns true if all text typed correctly
   */
  isSessionComplete(context: TypingContext): boolean;
  
  /**
   * Get the current expected character.
   * 
   * @param context - Current typing state
   * @returns Character user should type next
   */
  getExpectedChar(context: TypingContext): string;
}
```

### ValidationStrategy

**Purpose:** Pluggable validation strategies for different modes.

```typescript
interface ValidationStrategy {
  /**
   * Strategy name (e.g., "strict", "lenient", "none")
   */
  readonly name: string;
  
  /**
   * Validate keystroke according to this strategy's rules.
   * 
   * @param input - Character typed by user
   * @param expected - Character that should be typed
   * @param position - Current position in text
   * @returns Validation result
   */
  validate(
    input: string,
    expected: string,
    position: number
  ): Pick<ValidationResult, 'isValid' | 'action'>;
  
  /**
   * Determine if backspace is allowed under this strategy.
   * 
   * @param position - Current position in text
   * @returns true if backspace allowed
   */
  allowsBackspace(position: number): boolean;
  
  /**
   * Get completion criteria for this strategy.
   * 
   * @returns Criteria that defines session completion
   */
  getCompletionCriteria(): CompletionCriteria;
}

interface CompletionCriteria {
  requirePerfectAccuracy: boolean;  // Must have 100% accuracy
  minAccuracy?: number;             // Minimum accuracy percentage
  allowSkips?: boolean;             // Can skip difficult characters
}
```

### WrongKeyTracker

**Purpose:** Track and analyze typing errors.

```typescript
interface WrongKeyTracker {
  /**
   * Record an incorrect keystroke.
   * 
   * @param error - Error details
   */
  recordError(error: TypingError): void;
  
  /**
   * Get error frequency for a specific key.
   * 
   * @param key - Character to check
   * @returns Error rate (0.0 to 1.0)
   */
  getErrorFrequency(key: string): number;
  
  /**
   * Get most problematic keys for this user.
   * 
   * @param limit - Maximum number of keys to return
   * @returns Array of keys sorted by error frequency
   */
  getMostProblematicKeys(limit: number): string[];
  
  /**
   * Identify common error patterns (adjacent keys, same finger, etc.)
   * 
   * @returns Analysis of error patterns
   */
  identifyWeakPatterns(): KeyCombination[];
  
  /**
   * Get statistics for a specific key.
   * 
   * @param key - Character to analyze
   * @returns Detailed error statistics
   */
  getKeyErrorStats(key: string): KeyErrorStats;
  
  /**
   * Reset error tracking (new session or user).
   */
  reset(): void;
}

interface KeyErrorStats {
  key: string;
  errorCount: number;
  totalAttempts: number;
  errorRate: number;                    // errorCount / totalAttempts
  commonMistakes: Map<string, number>;  // What user types instead
  avgRecoveryTime: number;              // Time to correct error (ms)
  improvementTrend: number;             // -1 to 1 (getting worse/better)
}

interface KeyCombination {
  pattern: string;         // e.g., "th", "qu", "ing"
  errorRate: number;       // 0.0 to 1.0
  frequency: number;       // How often this pattern appears
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

### KeystrokeTracker

**Purpose:** Record detailed keystroke timing data.

```typescript
interface KeystrokeTracker {
  /**
   * Record a keystroke event with timing data.
   * 
   * @param event - Keystroke event details
   */
  record(event: KeystrokeEvent): void;
  
  /**
   * Get all keystrokes for current session.
   * 
   * @returns Array of keystroke events
   */
  getKeystrokes(): ReadonlyArray<KeystrokeEvent>;
  
  /**
   * Get keystroke timing statistics.
   * 
   * @returns Timing analysis
   */
  getTimingStats(): TimingStats;
  
  /**
   * Identify rhythm patterns in typing.
   * 
   * @returns Rhythm analysis (for biometric fingerprinting)
   */
  analyzeRhythm(): RhythmPattern;
  
  /**
   * Detect fatigue based on timing variance.
   * 
   * @returns Fatigue score (0.0 = fresh, 1.0 = exhausted)
   */
  detectFatigue(): number;
}

interface TimingStats {
  avgDwellTime: number;           // Average key hold duration
  avgInterKeyInterval: number;    // Average time between keystrokes
  avgFlightTime: number;          // Average time between key up/down
  
  variance: {
    dwellTime: number;
    interKeyInterval: number;
  };
  
  fastestKeystroke: number;       // Shortest interval
  slowestKeystroke: number;       // Longest interval
}

interface RhythmPattern {
  consistency: number;            // 0.0 to 1.0 (low to high)
  preferredTempo: number;         // Keystrokes per second
  burstPatterns: BurstPattern[];  // Fast bursts followed by pauses
  fingerPreferences: Map<string, number>; // Which keys are faster
}

interface BurstPattern {
  startPosition: number;
  endPosition: number;
  keystrokesPerSecond: number;
  triggeredBy: string;            // What caused burst (e.g., common word)
}
```

### TypingSession

**Purpose:** Orchestrates the entire typing session.

```typescript
interface TypingSession {
  // Identification
  readonly id: string;
  readonly exerciseId: string;
  readonly userId: string;
  
  // State
  readonly context: TypingContext;
  readonly state: SessionState;
  
  // Actions
  /**
   * Process a keystroke input.
   * PERFORMANCE CRITICAL: Must execute in <2ms total
   * 
   * @param key - Character typed by user
   * @returns Event describing what happened
   */
  processKeystroke(key: string): TypingEvent;
  
  /**
   * Start the typing session.
   */
  start(): void;
  
  /**
   * Pause the session (stop timer).
   */
  pause(): void;
  
  /**
   * Resume paused session.
   */
  resume(): void;
  
  /**
   * Complete the session and finalize metrics.
   * 
   * @returns Final session results
   */
  complete(): SessionResult;
  
  // Observability
  /**
   * Subscribe to session events.
   * 
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  subscribe(handler: TypingEventHandler): () => void;
  
  // Queries
  /**
   * Get current metrics (WPM, accuracy, etc.)
   */
  getMetrics(): Metrics;
  
  /**
   * Get current progress (0.0 to 1.0)
   */
  getProgress(): number;
}

type SessionState =
  | 'NOT_STARTED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ABANDONED';

interface TypingEvent {
  type: TypingEventType;
  validation: ValidationResult;
  metrics: Metrics;
  timestamp: number;
}

type TypingEventType =
  | 'SESSION_START'
  | 'KEYSTROKE'
  | 'ERROR'
  | 'BACKSPACE'
  | 'SESSION_PAUSE'
  | 'SESSION_RESUME'
  | 'SESSION_COMPLETE';

type TypingEventHandler = (event: TypingEvent) => void;

interface SessionResult {
  // Session info
  sessionId: string;
  duration: number;           // Milliseconds
  completedAt: Date;
  
  // Final metrics
  wpm: number;
  accuracy: number;
  errorCount: number;
  
  // Detailed analysis
  keystrokes: KeystrokeEvent[];
  errors: TypingError[];
  weakKeys: string[];
  
  // Improvement
  improvementFromPrevious?: {
    wpmDelta: number;
    accuracyDelta: number;
  };
}
```

### Metrics

**Purpose:** Real-time typing metrics.

```typescript
interface Metrics {
  // Speed
  wpm: number;              // Words per minute (5 chars = 1 word)
  rawWPM: number;           // WPM including errors
  netWPM: number;           // WPM minus errors
  
  // Accuracy
  accuracy: number;         // Percentage (0-100)
  errorRate: number;        // Errors per 100 keystrokes
  
  // Progress
  charactersTyped: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalCharacters: number;
  
  // Time
  elapsedTime: number;      // Milliseconds
  timeRemaining?: number;   // Milliseconds (timed exercises)
  
  // Consistency
  consistency: number;      // WPM variance (0-100, higher = more consistent)
}
```

## Concrete Strategy Implementations

### StrictValidationStrategy

**Use Case:** Lesson mode - enforce perfect accuracy.

**Behavior:**
- No forward progress on error
- Backspace allowed
- 100% accuracy required for completion
- Focus on learning correct technique

### LenientValidationStrategy

**Use Case:** Practice mode - focus on speed.

**Behavior:**
- Allow forward progress on error (with penalty)
- Backspace optional
- No accuracy requirement
- Errors tracked but not blocking

### NoValidationStrategy

**Use Case:** Warm-up exercises - free typing.

**Behavior:**
- No validation at all
- Just measure speed
- No error tracking
- Used for baseline assessment

## Performance Contracts

All hot-path methods must meet these performance targets:

| Method | Max Execution Time | Notes |
|--------|-------------------|-------|
| `InputValidator.validateKeystroke()` | <0.1ms | Synchronous, no allocations |
| `TypingSession.processKeystroke()` | <2ms | Includes validation + UI update |
| `WrongKeyTracker.recordError()` | <0.5ms | Batched writes, non-blocking |
| `KeystrokeTracker.record()` | <0.3ms | Append-only, efficient |
| `MetricsCalculator.calculate()` | <0.5ms | Memoized, cached results |

## Testing Interfaces

### MockKeyboard

**Purpose:** Simulate keyboard input for testing.

```typescript
interface MockKeyboard {
  /**
   * Simulate typing a string.
   */
  type(text: string, options?: TypingOptions): void;
  
  /**
   * Simulate a single keystroke.
   */
  press(key: string, timing?: KeyTiming): void;
  
  /**
   * Simulate backspace.
   */
  backspace(count?: number): void;
  
  /**
   * Get recorded events.
   */
  getEvents(): KeystrokeEvent[];
}

interface TypingOptions {
  wpm?: number;              // Simulated typing speed
  errorRate?: number;        // Percentage of errors (0-100)
  dwellTimeVariance?: number; // Variance in key hold time
}

interface KeyTiming {
  dwellTime: number;
  interKeyInterval: number;
}
```

## References

- [Requirements](./requirements.md)
- [Design Document](./design.md)
- [UML Diagrams](./diagrams/)
- [Architectural Patterns](../../architecture/design-patterns.md)

