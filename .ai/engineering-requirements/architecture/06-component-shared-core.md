# Level 3: Shared Core Components Diagram

## Overview

This diagram zooms into the `packages/shared-core` package to show the internal component structure. This is the heart of KeyFlow's business logic that achieves 90% code reuse between desktop and web.

**Audience:** All developers (critical for understanding core architecture)

**Purpose:** Understand business logic organization, component responsibilities, and data flow through the typing engine.

## Diagram

```plantuml
@startuml KeyFlow Shared Core Components
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

title Component Diagram for KeyFlow - Shared Core Package (Business Logic)

Container_Boundary(shared_core, "packages/shared-core") {
    Component(input_validator, "InputValidator", "TypeScript Class", "Validates keystrokes character-by-character. Pure function, <0.1ms latency.")
    
    Component(metrics_calculator, "MetricsCalculator", "TypeScript Class", "Calculates WPM, accuracy, errors. Memoized for performance.")
    
    Component(keystroke_tracker, "KeystrokeTracker", "TypeScript Class", "Records keystroke timing data (dwell time, inter-key intervals). For ML features.")
    
    Component(session_manager, "SessionManager", "TypeScript Class", "Manages session lifecycle: start, pause, resume, end. Coordinates all components.")
    
    Component(weak_spot_detector, "WeakSpotDetector", "TypeScript Class", "Analyzes keystroke data to find weak keys. Statistical analysis.")
    
    Component(progress_tracker, "ProgressTracker", "TypeScript Class", "Tracks WPM trends, accuracy over time, total practice time.")
    
    Component(drill_generator, "DrillGenerator", "TypeScript Class", "Generates drill exercises with REAL words (not 'jjj kkk'). Uses WordDatabase.")
    
    Component(exercise_factory_registry, "ExerciseFactoryRegistry", "TypeScript Class", "Factory pattern: Creates exercises for each mode (Lesson, Practice, Drill, Challenge).")
    
    Component(lesson_factory, "LessonFactory", "TypeScript Class", "Creates structured lessons (home row → full keyboard). Adaptive difficulty.")
    
    Component(practice_factory, "PracticeFactory", "TypeScript Class", "Creates timed tests (30s, 60s, 120s). Customizable content types.")
    
    Component(drill_factory, "DrillFactory", "TypeScript Class", "Creates targeted drills for weak keys. Uses real words from WordDatabase.")
    
    Component(challenge_factory, "ChallengeFactory", "TypeScript Class", "Creates daily challenges. Natural sentences, progressive difficulty.")
    
    Component(sync_coordinator, "SyncCoordinator", "TypeScript Class", "Coordinates sync operations. Manages queue, handles retries.")
    
    Component(conflict_resolver, "ConflictResolver", "TypeScript Class", "Resolves sync conflicts. Timestamp-based merge, last-write-wins.")
    
    Component(offline_queue, "OfflineQueue", "TypeScript Class", "Queues operations when offline. Persistent, survives restarts.")
    
    Component(word_database, "WordDatabase", "TypeScript Class", "Database of common English words. Used for drill generation and content filtering.")
    
    Component(sentence_generator, "SentenceGenerator", "TypeScript Class", "Generates natural sentences from word lists. NOT random gibberish.")
}

Container_Ext(storage_adapter, "StorageAdapter", "Interface", "Platform-specific storage (Tauri or REST)")
Container_Ext(typing_interface, "TypingInterface", "React Component", "UI component from shared-ui")

' Hot path: Keystroke flow
Rel(typing_interface, session_manager, "processKeystroke()", "Function call")
Rel(session_manager, input_validator, "validate()", "<0.1ms")
Rel(session_manager, keystroke_tracker, "record()", "Non-blocking")
Rel(session_manager, metrics_calculator, "calculate()", "<0.1ms")

' Session lifecycle
Rel(typing_interface, session_manager, "startSession() / endSession()", "Function call")
Rel(session_manager, storage_adapter, "save() / load()", "Async")

' Analytics
Rel(session_manager, progress_tracker, "trackSession()", "After session end")
Rel(progress_tracker, weak_spot_detector, "analyzeWeakKeys()", "Batch analysis")

' Exercise generation
Rel(typing_interface, exercise_factory_registry, "create()", "Get exercise")
Rel(exercise_factory_registry, lesson_factory, "createLesson()", "Delegation")
Rel(exercise_factory_registry, practice_factory, "createPractice()", "Delegation")
Rel(exercise_factory_registry, drill_factory, "createDrill()", "Delegation")
Rel(exercise_factory_registry, challenge_factory, "createChallenge()", "Delegation")

' Drill generation (weak keys)
Rel(drill_factory, weak_spot_detector, "getWeakKeys()", "Query")
Rel(drill_factory, word_database, "findWordsContaining()", "Query")
Rel(drill_factory, sentence_generator, "generate()", "Natural text")

' Sync operations
Rel(session_manager, sync_coordinator, "queueSync()", "Background")
Rel(sync_coordinator, offline_queue, "enqueue()", "Add to queue")
Rel(sync_coordinator, storage_adapter, "syncToCloud()", "When online")
Rel(sync_coordinator, conflict_resolver, "resolve()", "Handle conflicts")

note right of input_validator
  **Hot Path Component**
  - Pure function
  - No side effects
  - Memoization
  - <0.1ms latency
end note

note right of sync_coordinator
  **Cold Path Component**
  - Background operations
  - Network calls allowed
  - Retry logic
  - Non-blocking
end note

SHOW_LEGEND()

@enduml
```

## Component Organization

### Package Structure

```
packages/shared-core/
├── src/
│   ├── typing/                  # Hot path components
│   │   ├── InputValidator.ts
│   │   ├── MetricsCalculator.ts
│   │   ├── KeystrokeTracker.ts
│   │   ├── SessionManager.ts
│   │   └── index.ts
│   ├── analytics/               # Analytics components
│   │   ├── WeakSpotDetector.ts
│   │   ├── ProgressTracker.ts
│   │   ├── StatisticsCalculator.ts
│   │   └── index.ts
│   ├── exercises/               # Exercise generation
│   │   ├── ExerciseFactoryRegistry.ts
│   │   ├── LessonFactory.ts
│   │   ├── PracticeFactory.ts
│   │   ├── DrillFactory.ts
│   │   ├── ChallengeFactory.ts
│   │   ├── WordDatabase.ts
│   │   ├── SentenceGenerator.ts
│   │   └── index.ts
│   ├── sync/                    # Sync components
│   │   ├── SyncCoordinator.ts
│   │   ├── ConflictResolver.ts
│   │   ├── OfflineQueue.ts
│   │   ├── CacheManager.ts
│   │   └── index.ts
│   ├── modes/                   # Practice mode strategies
│   │   ├── PracticeMode.ts (interface)
│   │   ├── LessonMode.ts
│   │   ├── PracticeMode.ts
│   │   ├── DrillMode.ts
│   │   ├── ChallengeMode.ts
│   │   └── index.ts
│   └── index.ts                 # Public API exports
├── package.json
└── tsconfig.json
```

## Critical Component Details

### Typing Engine Components (Hot Path)

#### InputValidator

**Purpose:** Validate keystrokes in real-time with <0.1ms latency.

**Interface:**
```typescript
interface ValidationResult {
  correct: boolean;
  expected: string;
  actual: string;
  position: number;
  timestamp: number;
}

class InputValidator {
  validateKeystroke(event: KeystrokeEvent): ValidationResult;
  checkCharacter(actual: string, expected: string): boolean;
  sanitizeInput(input: string): string;
}
```

**Key Characteristics:**
- Pure function (no side effects)
- Synchronous only
- Memoization for repeated checks
- <0.1ms execution time

**Implementation:**
```typescript
class InputValidator {
  validateKeystroke(event: KeystrokeEvent): ValidationResult {
    const { key, expected, position, timestamp } = event;
    
    // Simple character comparison (fast!)
    const correct = key === expected;
    
    return {
      correct,
      expected,
      actual: key,
      position,
      timestamp
    };
  }
}
```

#### MetricsCalculator

**Purpose:** Calculate WPM, accuracy, errors in real-time with <0.1ms latency.

**Interface:**
```typescript
interface Metrics {
  wpm: number;
  accuracy: number;
  errorCount: number;
  correctChars: number;
  totalChars: number;
}

class MetricsCalculator {
  calculateWPM(keystrokes: KeystrokeEvent[]): number;
  calculateAccuracy(keystrokes: KeystrokeEvent[]): number;
  calculateMetrics(session: TypingSession): Metrics;
}
```

**Key Characteristics:**
- Memoized calculations (cache results)
- Industry-standard WPM formula (5 characters = 1 word)
- Incremental updates (don't recalculate from scratch)

**Implementation:**
```typescript
class MetricsCalculator {
  private wpmCache = new Map<string, number>();
  
  calculateWPM(keystrokes: KeystrokeEvent[]): number {
    if (keystrokes.length === 0) return 0;
    
    // Cache key: length + last timestamp
    const cacheKey = `${keystrokes.length}:${keystrokes[keystrokes.length - 1].timestamp}`;
    
    if (this.wpmCache.has(cacheKey)) {
      return this.wpmCache.get(cacheKey)!;
    }
    
    const correctChars = keystrokes.filter(k => k.correct).length;
    const timeMinutes = (
      keystrokes[keystrokes.length - 1].timestamp - keystrokes[0].timestamp
    ) / 60000;
    
    const wpm = (correctChars / 5) / timeMinutes;  // 5 chars = 1 word
    
    this.wpmCache.set(cacheKey, wpm);
    return wpm;
  }
}
```

#### KeystrokeTracker

**Purpose:** Record keystroke timing data for analytics and ML features.

**Interface:**
```typescript
interface TypingDataPoint {
  keystroke: string;
  timestamp: number;
  dwellTime: number;          // How long key held
  interKeyInterval: number;   // Time since last keystroke
  correct: boolean;
  position: number;
}

class KeystrokeTracker {
  record(event: KeystrokeEvent): void;
  analyze(session: TypingSession): TypingAnalysis;
  getDynamicsData(): TypingDataPoint[];
}
```

**Key Characteristics:**
- Non-blocking (append to array)
- Privacy-first (stored locally)
- Opt-in for cloud sync

#### SessionManager

**Purpose:** Orchestrate all typing components and manage session lifecycle.

**Interface:**
```typescript
class SessionManager {
  startSession(exercise: Exercise): TypingSession;
  processKeystroke(session: TypingSession, key: string): TypingEvent;
  pauseSession(session: TypingSession): void;
  resumeSession(session: TypingSession): void;
  endSession(session: TypingSession): SessionResult;
}
```

**Key Characteristics:**
- Facade pattern (simplifies complex subsystem)
- Coordinates validator, calculator, tracker
- Manages session state transitions

**Implementation:**
```typescript
class SessionManager {
  constructor(
    private validator: InputValidator,
    private calculator: MetricsCalculator,
    private tracker: KeystrokeTracker,
    private storage: StorageAdapter
  ) {}
  
  processKeystroke(session: TypingSession, key: string): TypingEvent {
    const timestamp = performance.now();
    
    // 1. Validate (hot path, <0.1ms)
    const validation = this.validator.validateKeystroke({
      key,
      timestamp,
      expected: session.getExpectedChar(),
      position: session.currentPosition
    });
    
    // 2. Track (non-blocking)
    this.tracker.record({
      key,
      timestamp,
      correct: validation.correct,
      dwellTime: this.calculateDwellTime(timestamp),
      interKeyInterval: timestamp - session.lastKeystrokeTime
    });
    
    // 3. Calculate metrics (hot path, <0.1ms)
    const metrics = this.calculator.calculateMetrics(session);
    
    // 4. Update session
    session.lastKeystrokeTime = timestamp;
    if (validation.correct) {
      session.currentPosition++;
    }
    
    return {
      validation,
      metrics,
      timestamp
    };
  }
}
```

### Analytics Components (Cold Path)

#### WeakSpotDetector

**Purpose:** Analyze keystroke data to identify weak keys.

**Interface:**
```typescript
interface WeakKeyAnalysis {
  key: string;
  errorRate: number;          // 0-100%
  avgSpeed: number;           // ms per keystroke
  improvementTrend: number;   // -100 to +100
  practiceRecommendation: string;
}

class WeakSpotDetector {
  analyzeKeystrokeData(sessions: TypingSession[]): WeakKeyAnalysis[];
  findWeakestKeys(limit: number): string[];
  trackImprovement(key: string, sessions: TypingSession[]): number;
}
```

**Algorithm:**
```typescript
class WeakSpotDetector {
  analyzeKeystrokeData(sessions: TypingSession[]): WeakKeyAnalysis[] {
    const keyStats = new Map<string, { errors: number; total: number; times: number[] }>();
    
    // Aggregate data across sessions
    sessions.forEach(session => {
      session.keystrokes.forEach(keystroke => {
        const key = keystroke.key;
        const stats = keyStats.get(key) || { errors: 0, total: 0, times: [] };
        
        stats.total++;
        if (!keystroke.correct) stats.errors++;
        stats.times.push(keystroke.interKeyInterval);
        
        keyStats.set(key, stats);
      });
    });
    
    // Calculate analysis
    const analysis: WeakKeyAnalysis[] = [];
    keyStats.forEach((stats, key) => {
      const errorRate = (stats.errors / stats.total) * 100;
      const avgSpeed = stats.times.reduce((a, b) => a + b, 0) / stats.times.length;
      
      analysis.push({
        key,
        errorRate,
        avgSpeed,
        improvementTrend: this.calculateTrend(key, sessions),
        practiceRecommendation: this.generateRecommendation(errorRate, avgSpeed)
      });
    });
    
    // Sort by error rate (highest first)
    return analysis.sort((a, b) => b.errorRate - a.errorRate);
  }
}
```

#### ProgressTracker

**Purpose:** Track user progress over time (WPM trends, accuracy, total practice time).

**Interface:**
```typescript
interface ProgressStats {
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  totalPracticeTime: number;  // seconds
  totalSessions: number;
  improvementRate: number;     // WPM increase per week
}

class ProgressTracker {
  trackSession(session: TypingSession): void;
  getStats(): ProgressStats;
  getChartData(days: number): ChartDataPoint[];
  getImprovementRate(): number;
}
```

### Exercise Generation Components

#### ExerciseFactoryRegistry

**Purpose:** Factory pattern to create exercises for each practice mode.

**Interface:**
```typescript
interface ExerciseFactory {
  create(config: ExerciseConfig): Exercise;
}

class ExerciseFactoryRegistry {
  private factories = new Map<string, ExerciseFactory>();
  
  register(type: string, factory: ExerciseFactory): void;
  create(type: string, config: ExerciseConfig): Exercise;
  getAvailableTypes(): string[];
}
```

**Usage:**
```typescript
const registry = new ExerciseFactoryRegistry();
registry.register('lesson', new LessonFactory());
registry.register('practice', new PracticeFactory());
registry.register('drill', new DrillFactory());
registry.register('challenge', new ChallengeFactory());

// Create exercise
const exercise = registry.create('drill', {
  userId: 'user-123',
  weakKeys: ['j', 'k', 'l'],
  difficulty: 'intermediate'
});
```

#### DrillFactory

**Purpose:** Generate targeted drills for weak keys using REAL words.

**Key Innovation:** Unlike Keybr (which generates gibberish like "jjj kkk jjj"), KeyFlow uses real English words.

**Implementation:**
```typescript
class DrillFactory implements ExerciseFactory {
  constructor(
    private wordDatabase: WordDatabase,
    private sentenceGenerator: SentenceGenerator,
    private weakSpotDetector: WeakSpotDetector
  ) {}
  
  create(config: ExerciseConfig): Exercise {
    // 1. Get weak keys
    const weakKeys = config.weakKeys || 
      this.weakSpotDetector.findWeakestKeys(3);
    
    // 2. Find REAL words containing weak keys
    const targetWords = this.wordDatabase.findWordsContaining(weakKeys);
    // Result: ["just", "joke", "jack", "like", "look", "luck", ...]
    
    // 3. Generate natural sentences
    const text = this.sentenceGenerator.generate(targetWords);
    // Result: "Just like you look at the jack, you can make your own luck with a good joke."
    
    return new Drill({
      id: generateId(),
      text,
      targetKeys: weakKeys,
      difficulty: config.difficulty,
      estimatedTime: this.calculateTime(text)
    });
  }
}
```

#### WordDatabase

**Purpose:** Database of common English words for drill generation.

**Data:**
```typescript
class WordDatabase {
  private words = {
    common1000: [...],  // Most common 1,000 words
    common5000: [...],  // Extended to 5,000
    byKey: {
      'j': ['just', 'joke', 'jack', 'jump', ...],
      'k': ['keep', 'kind', 'know', 'like', ...],
      // ...
    }
  };
  
  findWordsContaining(keys: string[]): string[] {
    const words = new Set<string>();
    keys.forEach(key => {
      this.byKey[key]?.forEach(word => words.add(word));
    });
    return Array.from(words);
  }
}
```

#### SentenceGenerator

**Purpose:** Generate natural sentences from word lists.

**Algorithm:**
```typescript
class SentenceGenerator {
  generate(words: string[]): string {
    // Simple markov chain or template-based generation
    const sentences: string[] = [];
    
    // Use sentence templates
    const templates = [
      (w1, w2, w3) => `${w1} ${w2} ${w3}.`,
      (w1, w2) => `The ${w1} is ${w2}.`,
      // ...more templates
    ];
    
    // Generate 3-5 sentences
    for (let i = 0; i < 5; i++) {
      const template = this.randomChoice(templates);
      const sentenceWords = this.randomSample(words, template.length);
      sentences.push(template(...sentenceWords));
    }
    
    return sentences.join(' ');
  }
}
```

### Sync Components (Cold Path)

#### SyncCoordinator

**Purpose:** Coordinate sync operations, manage queue, handle retries.

**Interface:**
```typescript
class SyncCoordinator {
  sync(): Promise<SyncResult>;
  queue(operation: SyncOperation): void;
  retry(operation: SyncOperation): Promise<void>;
  processQueue(): Promise<void>;
}
```

See [Sync Engine Components](./10-component-sync-engine.md) for details.

#### ConflictResolver

**Purpose:** Resolve conflicts between local and remote data.

**Interface:**
```typescript
class ConflictResolver {
  merge(local: Data, remote: Data): Data;
  resolve(conflict: Conflict): Resolution;
  lastWriteWins(local: Data, remote: Data): Data;
}
```

See [Sync Engine Components](./10-component-sync-engine.md) for details.

## Component Dependencies

### Dependency Graph
```
SessionManager (orchestrator)
  ├──> InputValidator (hot path)
  ├──> MetricsCalculator (hot path)
  ├──> KeystrokeTracker (data collection)
  └──> StorageAdapter (persistence)

ProgressTracker
  └──> WeakSpotDetector (analytics)

DrillFactory
  ├──> WeakSpotDetector (get weak keys)
  ├──> WordDatabase (find words)
  └──> SentenceGenerator (natural text)

SyncCoordinator
  ├──> OfflineQueue (queue management)
  ├──> ConflictResolver (conflict handling)
  └──> StorageAdapter (cloud sync)
```

### Dependency Rules
1. **Hot path components**: No dependencies on storage or network
2. **Pure functions**: InputValidator, MetricsCalculator
3. **Dependency injection**: All dependencies passed via constructor
4. **Interface-based**: Depend on abstractions (StorageAdapter), not concrete implementations

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// InputValidator tests
describe('InputValidator', () => {
  it('validates correct keystroke', () => {
    const validator = new InputValidator();
    const result = validator.validateKeystroke({
      key: 'a',
      expected: 'a',
      position: 0,
      timestamp: performance.now()
    });
    expect(result.correct).toBe(true);
  });
});

// MetricsCalculator tests
describe('MetricsCalculator', () => {
  it('calculates WPM correctly', () => {
    const calculator = new MetricsCalculator();
    const keystrokes = [
      { key: 'a', timestamp: 0, correct: true },
      { key: 'b', timestamp: 100, correct: true },
      // ... 60 characters in 60 seconds
    ];
    const wpm = calculator.calculateWPM(keystrokes);
    expect(wpm).toBe(12);  // 60 chars / 5 = 12 words
  });
});
```

### Integration Tests
```typescript
describe('SessionManager', () => {
  it('completes full typing session', () => {
    const storage = new MockStorageAdapter();
    const sessionManager = new SessionManager(
      new InputValidator(),
      new MetricsCalculator(),
      new KeystrokeTracker(),
      storage
    );
    
    const session = sessionManager.startSession(exercise);
    
    // Simulate typing
    'hello world'.split('').forEach(char => {
      sessionManager.processKeystroke(session, char);
    });
    
    const result = sessionManager.endSession(session);
    
    expect(result.metrics.wpm).toBeGreaterThan(0);
    expect(storage.saveWasCalled).toBe(true);
  });
});
```

## Performance Benchmarks

| Component | Operation | Target Latency | Measured |
|-----------|-----------|----------------|----------|
| InputValidator | validateKeystroke() | <0.1ms | 0.05ms |
| MetricsCalculator | calculateWPM() | <0.1ms | 0.08ms (memoized) |
| KeystrokeTracker | record() | <0.1ms | 0.02ms (append) |
| SessionManager | processKeystroke() | <2ms | 1.5ms |
| WeakSpotDetector | analyze() | <100ms | 50ms |
| DrillFactory | create() | <50ms | 30ms |

## Related Diagrams

- **Container**: [Full System Container](./02-container-full-system.md)
- **Detail**: [Typing Engine Components](./07-component-typing-engine.md)
- **Detail**: [Sync Engine Components](./10-component-sync-engine.md)

## References

- [C4 Model: Component Diagram](https://c4model.com/diagrams/component)
- [Factory Pattern](https://refactoring.guru/design-patterns/factory-method)
- [Facade Pattern](https://refactoring.guru/design-patterns/facade)
- [Strategy Pattern](https://refactoring.guru/design-patterns/strategy)

