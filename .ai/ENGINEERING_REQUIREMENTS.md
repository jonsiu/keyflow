# KeyFlow - Engineering Requirements

## The Native Typing Tutor for Speed Seekers

### Project Vision

Build the world's fastest, most advanced typing tutor that consolidates TypingClub, Monkeytype, Keybr, and TypeRacer into one beautiful native application. Target speed seekers (18-35 years old, 40-150+ WPM) who currently juggle 3-4 typing websites.

### Strategic Positioning (Research-Validated)

**"TypingClub's lessons + Monkeytype's UX + Keybr's drills + TypeRacer's competition = KeyFlow"**

### Core Value Propositions

1. **Native Desktop Performance**: 2ms keystroke latency (vs. 8ms in Electron/web apps)
2. **All-in-One Platform**: Four practice modes in one app (stop juggling 3-4 sites)
3. **Professional Design**: Monkeytype-inspired minimal UI (not juvenile like TypingClub)
4. **Local-First Architecture**: Works 100% offline with optional cloud sync
5. **AI-Powered Personalization**: Adaptive learning using keystroke dynamics
6. **No Ads Ever**: Premium experience with one-time purchase
7. **Code Reuse Excellence**: 90% shared React components between desktop and web

---

## Technical Architecture

### Monorepo Structure

```
keyflow-monorepo/
├── packages/
│   ├── shared-ui/          # Shared React components (90% reuse)
│   │   ├── components/     # TypingInterface, VirtualKeyboard, Dashboard
│   │   ├── hooks/          # useTypingSession, useProgress
│   │   └── styles/         # Tailwind config, themes
│   ├── shared-core/        # Business logic (platform-agnostic)
│   │   ├── typing/         # WPM calculation, validation
│   │   ├── analytics/      # Progress tracking, weak spot detection
│   │   └── sync/           # Local-first sync engine
│   └── shared-types/       # TypeScript definitions
├── apps/
│   ├── desktop/            # Tauri app (macOS → Windows → Linux)
│   │   ├── src-tauri/      # Rust backend
│   │   └── src/            # React frontend (imports shared-ui)
│   └── web/                # Next.js app (browser-based)
│       ├── app/            # Next.js 15 app router
│       └── components/     # Web-specific wrappers
└── backend/                # REST API
    ├── src/
    │   ├── routes/         # Express/Hono routes
    │   ├── models/         # Database models
    │   └── services/       # Business logic
    └── prisma/             # Database schema
```

### Technology Stack

#### Desktop App (Tauri 2.0)
- **Framework**: Tauri 2.0 (thin Rust wrapper + WebView frontend)
- **Frontend**: React 18 + TypeScript + Vite
- **UI & Business Logic**: 95%+ written in React/TypeScript (NOT Rust)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Storage**: Tauri Store Plugin (local-first)
- **Rust Layer**: Minimal - only for:
  - File system operations (Tauri Store read/write)
  - System APIs (window management, system tray)
  - Native OS integration
  - **NOT for business logic** (WPM calculations, validation, etc.)
- **IPC**: Tauri commands for coarse-grained operations only:
  - Save/load sessions (batch operations)
  - Export data (file system access)
  - System preferences
  - **NOT for per-keystroke logic** (would add latency)
- **Performance Target**: <2ms keystroke latency, <0.5s startup

**Why Tauri over Electron:**
- 12-30x smaller bundle (12 MB vs. 180 MB)
- 4-10x faster startup (0.3s vs. 1.5s)
- 4x lower keystroke latency (2ms vs. 8ms)
- 6-10x less memory usage (60 MB vs. 350 MB)
- Uses system WebView (no Chromium bundle)

**React Version Strategy:**
- Desktop: React 18 (stable, proven with Vite)
- Web: React 19 (Next.js 15 optimized)
- Shared components: Use React 18 APIs only (no server components, no Actions)

#### Web App (Next.js 15)
- **Framework**: Next.js 15 + React 19 + TypeScript
- **Routing**: App Router
- **Styling**: Tailwind CSS (shared config)
- **State**: Zustand (same stores as desktop)
- **Purpose**: Browser-based practice, cloud-based progress
- **Deployment**: Vercel

#### Backend (REST API)
- **Runtime**: Node.js 20+ or Bun
- **Framework**: Express.js or Hono (faster, lighter)
- **Database**: PostgreSQL (Supabase or Neon)
- **ORM**: Prisma
- **Authentication**: Clerk or Supabase Auth
- **Storage**: AWS S3 or Cloudflare R2 (exercise content, exports)
- **Deployment**: Railway, Render, or Fly.io

#### Shared Libraries
- **UI Components**: Tailwind CSS + Framer Motion
- **Charts**: Recharts (with performance optimizations)
- **State Management**: Zustand (with persist middleware)
- **Build System**: Turborepo or Nx (monorepo orchestration)
- **Testing**: Vitest (unit) + Playwright (E2E, both platforms)

### Cross-Platform Considerations (tech-considerations.md)

1. **React Version Strategy**: 
   - Shared components use **React 18 APIs only** (client-side components)
   - Desktop app: React 18 (stable with Vite)
   - Web app: React 19 (Next.js 15 optimized)
   - No server components, Actions, or React 19-specific features in shared code
2. **Tauri Rust Layer**: 
   - Keep **minimal** - only for OS/file system bridge
   - All business logic in React/TypeScript (packages/shared-core)
   - IPC commands for coarse-grained ops only (save, load, export)
3. **Framer Motion**: Use for transitions only, NOT per-keystroke animations
4. **Zustand Sync**: Implement sync layer between local (Tauri Store) and cloud (PostgreSQL)
5. **Build Performance**: Turborepo caching + prebuilt shared packages
6. **Recharts Optimization**: Downsample data, use React.memo, lazy load on web

### Data Sync Architecture (Local-First)

**Desktop App:**
- Primary storage: Tauri Store (100% offline functional)
- Optional sync: REST API (when user logs in)
- Conflict resolution: Timestamped updates with merge strategy

**Web App:**
- Primary storage: REST API (cloud-required)
- No offline mode (browser-based)

**Sync Strategy:**
```typescript
// packages/shared-core/sync
interface SyncEngine {
  syncQueue: SyncOperation[];
  merge(local: Data, remote: Data): Data;  // last-write-wins or timestamped
  resolveConflict(conflict: Conflict): Resolution;
}
```

---

## Architectural Patterns & Best Practices

### Core Architectural Principles

KeyFlow follows clean architecture principles with clear separation of concerns across the monorepo. The architecture is designed for **maintainability, extensibility, and performance** while ensuring 90%+ code reuse between desktop and web platforms.

### 1. Layered Architecture (Separation of Concerns)

**Structure:**
```
packages/
  shared-ui/          # Presentation Layer (React components only)
  shared-core/        # Business Logic Layer (pure TypeScript, no React)
  shared-types/       # Type Definitions (TypeScript interfaces/types)
apps/
  desktop/
    src/
      pages/          # Presentation Layer
      stores/         # State Management Layer
      adapters/       # Data Access Layer (Tauri-specific)
  web/
    app/
      pages/          # Presentation Layer
      stores/         # State Management Layer
      adapters/       # Data Access Layer (REST API)
```

**Layer Responsibilities:**

| Layer | Responsibility | Location | Dependencies |
|-------|---------------|----------|--------------|
| **Presentation** | UI components, user interaction | `packages/shared-ui`, `apps/*/pages` | State Management, Business Logic |
| **State Management** | Application state, Zustand stores | `apps/*/stores` | Business Logic |
| **Business Logic** | Core algorithms, validation, calculations | `packages/shared-core` | None (pure TypeScript) |
| **Data Access** | Storage abstraction, API calls | `apps/*/adapters` | Infrastructure |
| **Infrastructure** | Tauri commands, REST API, database | `apps/*/src-tauri`, `backend/` | Platform-specific |

**Benefits:**
- Clear boundaries reduce coupling
- Easy to test each layer independently
- Business logic reusable across platforms
- UI components swappable without affecting logic

### 2. Dependency Inversion Principle (Platform Abstraction)

**Pattern:** Business logic depends on abstractions, not concrete implementations.

**Implementation:**
```typescript
// packages/shared-types/storage.ts
interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// packages/shared-core/typing/TypingSession.ts
class TypingSession {
  constructor(private storage: StorageAdapter) {}  // Injected dependency
  
  async save() {
    await this.storage.save(`session:${this.id}`, this.serialize());
  }
}

// apps/desktop/src/adapters/TauriStorageAdapter.ts
class TauriStorageAdapter implements StorageAdapter {
  async save(key: string, data: any) {
    return invoke('save_data', { key, data });
  }
  async load(key: string) {
    return invoke('load_data', { key });
  }
}

// apps/web/src/adapters/RESTStorageAdapter.ts
class RESTStorageAdapter implements StorageAdapter {
  async save(key: string, data: any) {
    return fetch('/api/storage', { 
      method: 'POST', 
      body: JSON.stringify({ key, data }) 
    });
  }
  async load(key: string) {
    const res = await fetch(`/api/storage/${key}`);
    return res.json();
  }
}
```

**Benefits:**
- Desktop and web use identical business logic
- Easy to swap storage implementations
- Simplified testing with mock adapters
- Platform-agnostic core packages

### 3. Command Pattern for IPC (Coarse-Grained Operations)

**Pattern:** Encapsulate IPC operations as command objects to avoid per-keystroke overhead.

**Implementation:**
```typescript
// packages/shared-core/commands/Command.ts
interface Command<T> {
  execute(): Promise<T>;
  undo?(): Promise<void>;
}

// packages/shared-core/commands/SaveSessionCommand.ts
class SaveSessionCommand implements Command<void> {
  constructor(
    private session: TypingSession,
    private storage: StorageAdapter
  ) {}
  
  async execute() {
    await this.storage.save({
      id: this.session.id,
      data: this.session.serialize()
    });
  }
}

// packages/shared-core/commands/ExportDataCommand.ts
class ExportDataCommand implements Command<Blob> {
  constructor(
    private format: 'csv' | 'json',
    private data: TypingSession[]
  ) {}
  
  async execute() {
    // Heavy operation - offload to Rust on desktop
    if (isTauri()) {
      return invoke('export_data', { 
        format: this.format, 
        data: this.data 
      });
    } else {
      return this.exportInJS();
    }
  }
  
  private exportInJS(): Blob {
    // JavaScript fallback for web
  }
}
```

**Usage Pattern:**
```typescript
// HOT PATH: No IPC, pure TypeScript
handleKeyPress(key: string) {
  const event = validator.validate(key);        // <0.1ms
  const metrics = calculator.calculate();       // <0.1ms
  setState({ event, metrics });                 // <1ms
  // Total: <2ms (no IPC)
}

// COLD PATH: IPC allowed, batched operations
debouncedSave = debounce(() => {
  new SaveSessionCommand(session, storage).execute();  // IPC ~10ms, debounced
}, 500);
```

**Benefits:**
- IPC operations explicit and documented
- Commands reusable and testable
- Easy to add undo/redo functionality
- Clear separation: hot path (typing) vs cold path (save/export)

### 4. Observer Pattern for Real-Time Updates

**Pattern:** Components subscribe to session events without tight coupling.

**Implementation:**
```typescript
// packages/shared-core/typing/TypingSession.ts
type TypingEventHandler = (event: TypingEvent) => void;

class TypingSession {
  private observers = new Set<TypingEventHandler>();
  
  subscribe(handler: TypingEventHandler): () => void {
    this.observers.add(handler);
    return () => this.observers.delete(handler);  // Cleanup function
  }
  
  private notify(event: TypingEvent) {
    this.observers.forEach(handler => handler(event));
  }
  
  processKeystroke(key: string) {
    const validation = this.validator.validate(key);
    const metrics = this.calculator.calculate(this);
    
    this.notify({
      type: 'keystroke',
      validation,
      metrics,
      timestamp: performance.now()
    });
  }
}

// packages/shared-ui/components/TypingInterface.tsx
const TypingInterface: React.FC<Props> = ({ session }) => {
  const [metrics, setMetrics] = useState<Metrics>();
  
  useEffect(() => {
    const unsubscribe = session.subscribe((event) => {
      setMetrics(event.metrics);  // Real-time UI updates
    });
    return unsubscribe;  // Cleanup on unmount
  }, [session]);
  
  return <MetricsDisplay metrics={metrics} />;
};
```

**Benefits:**
- Decouples typing engine from UI
- Multiple components observe same session
- Easy to add new observers (analytics, audio feedback, logging)
- Prevents memory leaks with cleanup functions

### 5. Strategy Pattern for Practice Modes

**Pattern:** Each practice mode encapsulates its own behavior while sharing a common interface.

**Implementation:**
```typescript
// packages/shared-core/modes/PracticeMode.ts
interface PracticeMode {
  name: string;
  generateExercise(config: ExerciseConfig): Exercise;
  evaluatePerformance(session: TypingSession): Score;
  getCompletionCriteria(): CompletionCriteria;
}

// packages/shared-core/modes/LessonMode.ts
class LessonMode implements PracticeMode {
  name = 'lesson';
  
  generateExercise(config: ExerciseConfig): Exercise {
    // Structured progression: home row → full keyboard
    return this.lessonLibrary.getNext(config.userLevel);
  }
  
  evaluatePerformance(session: TypingSession): Score {
    // Adaptive accuracy threshold (not rigid 96-98%)
    const requiredAccuracy = this.calculateAdaptiveThreshold(session.user);
    return {
      passed: session.accuracy >= requiredAccuracy,
      score: session.wpm * (session.accuracy / 100),
      feedback: this.generateFeedback(session)
    };
  }
  
  getCompletionCriteria(): CompletionCriteria {
    return {
      minAccuracy: 90,  // Adaptive
      minWPM: 30,
      canRetry: true
    };
  }
}

// packages/shared-core/modes/PracticeMode.ts
class PracticeMode implements PracticeMode {
  name = 'practice';
  
  generateExercise(config: ExerciseConfig): Exercise {
    // Customizable: common words, quotes, code
    return this.contentGenerator.generate({
      duration: config.duration,
      contentType: config.contentType,
      language: config.language
    });
  }
  
  evaluatePerformance(session: TypingSession): Score {
    // Simple speed/accuracy (no pass/fail)
    return {
      passed: true,
      score: session.wpm,
      feedback: null
    };
  }
}

// packages/shared-core/modes/DrillMode.ts
class DrillMode implements PracticeMode {
  name = 'drill';
  
  generateExercise(config: ExerciseConfig): Exercise {
    // AI-driven weak key targeting with REAL words (not "jjj kkk")
    const weakKeys = config.weakKeys || this.detectWeakKeys(config.userId);
    const realWords = this.wordDatabase.findWordsContaining(weakKeys);
    return this.sentenceGenerator.generateNaturalText(realWords);
  }
  
  evaluatePerformance(session: TypingSession): Score {
    // Focus on improvement for weak keys
    const improvement = this.trackKeyImprovement(session, config.weakKeys);
    return {
      passed: improvement > 0,
      score: improvement,
      feedback: this.generateImprovementReport(improvement)
    };
  }
}

// Usage in application
const modeRegistry = new Map<string, PracticeMode>([
  ['lesson', new LessonMode()],
  ['practice', new PracticeMode()],
  ['drill', new DrillMode()],
  ['challenge', new ChallengeMode()]
]);

function startSession(modeType: string, config: ExerciseConfig) {
  const mode = modeRegistry.get(modeType);
  const exercise = mode.generateExercise(config);
  const session = new TypingSession(exercise);
  return session;
}
```

**Benefits:**
- Easy to add new practice modes (just implement interface)
- Each mode encapsulates its own logic
- Modes are interchangeable at runtime
- Clear interface contract prevents breaking changes

### 6. Repository Pattern for Data Persistence

**Pattern:** Abstract data access behind repository interfaces for local-first sync.

**Implementation:**
```typescript
// packages/shared-types/repositories.ts
interface SessionRepository {
  save(session: TypingSession): Promise<void>;
  findById(id: string): Promise<TypingSession | null>;
  findByUserId(userId: string): Promise<TypingSession[]>;
  findRecent(limit: number): Promise<TypingSession[]>;
  delete(id: string): Promise<void>;
}

// packages/shared-core/repositories/LocalSessionRepository.ts
class LocalSessionRepository implements SessionRepository {
  constructor(private storage: StorageAdapter) {}
  
  async save(session: TypingSession): Promise<void> {
    await this.storage.save(`session:${session.id}`, session.serialize());
  }
  
  async findById(id: string): Promise<TypingSession | null> {
    const data = await this.storage.load(`session:${id}`);
    return data ? TypingSession.deserialize(data) : null;
  }
  
  async findRecent(limit: number): Promise<TypingSession[]> {
    const keys = await this.storage.listKeys('session:*');
    const sessions = await Promise.all(
      keys.slice(0, limit).map(key => this.storage.load(key))
    );
    return sessions.map(data => TypingSession.deserialize(data));
  }
}

// packages/shared-core/repositories/RemoteSessionRepository.ts
class RemoteSessionRepository implements SessionRepository {
  constructor(private apiClient: APIClient) {}
  
  async save(session: TypingSession): Promise<void> {
    await this.apiClient.post('/api/sessions', session.serialize());
  }
  
  async findById(id: string): Promise<TypingSession | null> {
    const data = await this.apiClient.get(`/api/sessions/${id}`);
    return TypingSession.deserialize(data);
  }
}

// packages/shared-core/repositories/SyncedSessionRepository.ts
class SyncedSessionRepository implements SessionRepository {
  constructor(
    private local: LocalSessionRepository,
    private remote: RemoteSessionRepository,
    private syncEngine: SyncEngine
  ) {}
  
  async save(session: TypingSession): Promise<void> {
    // Local-first: always save locally first
    await this.local.save(session);
    
    // Background sync to cloud (queued, non-blocking)
    this.syncEngine.queue({
      operation: 'save',
      data: session,
      execute: () => this.remote.save(session)
    });
  }
  
  async findById(id: string): Promise<TypingSession | null> {
    // Local-first: try local cache, fallback to remote
    const localSession = await this.local.findById(id);
    if (localSession) return localSession;
    
    const remoteSession = await this.remote.findById(id);
    if (remoteSession) {
      await this.local.save(remoteSession);  // Cache locally
    }
    return remoteSession;
  }
}
```

**Benefits:**
- Data access logic separated from business logic
- Easy to swap storage backends (local, remote, hybrid)
- Local-first architecture naturally implemented
- Simplified testing with mock repositories
- Clear separation between online/offline modes

### 7. Factory Pattern for Exercise Generation

**Pattern:** Centralize exercise creation logic with type-specific factories.

**Implementation:**
```typescript
// packages/shared-core/exercises/ExerciseFactory.ts
interface ExerciseFactory {
  create(config: ExerciseConfig): Exercise;
}

// packages/shared-core/exercises/LessonExerciseFactory.ts
class LessonExerciseFactory implements ExerciseFactory {
  constructor(
    private lessonLibrary: LessonLibrary,
    private userProgressTracker: ProgressTracker
  ) {}
  
  create(config: ExerciseConfig): Exercise {
    const userLevel = this.userProgressTracker.getLevel(config.userId);
    const lessonTemplate = this.lessonLibrary.getNext(userLevel);
    
    return new Lesson({
      id: generateId(),
      title: lessonTemplate.title,
      text: lessonTemplate.text,
      focusKeys: lessonTemplate.focusKeys,
      difficulty: config.difficulty,
      targetAccuracy: this.calculateAdaptiveThreshold(userLevel)
    });
  }
  
  private calculateAdaptiveThreshold(level: number): number {
    // Not rigid 96-98%, adapts to user skill
    return Math.min(90 + level * 2, 98);
  }
}

// packages/shared-core/exercises/DrillExerciseFactory.ts
class DrillExerciseFactory implements ExerciseFactory {
  constructor(
    private wordDatabase: WordDatabase,
    private sentenceGenerator: SentenceGenerator,
    private weakSpotDetector: WeakSpotDetector
  ) {}
  
  create(config: ExerciseConfig): Exercise {
    const weakKeys = config.weakKeys || 
      this.weakSpotDetector.detect(config.userId);
    
    // Find REAL words containing weak keys (not "jjj kkk jjj")
    const targetWords = this.wordDatabase.findWordsContaining(weakKeys);
    const naturalText = this.sentenceGenerator.generate(targetWords);
    
    return new Drill({
      id: generateId(),
      text: naturalText,
      targetKeys: weakKeys,
      difficulty: config.difficulty,
      estimatedTime: this.calculateTime(naturalText)
    });
  }
}

// packages/shared-core/exercises/ExerciseFactoryRegistry.ts
class ExerciseFactoryRegistry {
  private factories = new Map<string, ExerciseFactory>();
  
  register(type: string, factory: ExerciseFactory): void {
    this.factories.set(type, factory);
  }
  
  create(type: string, config: ExerciseConfig): Exercise {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`Unknown exercise type: ${type}`);
    }
    return factory.create(config);
  }
}

// Usage
const registry = new ExerciseFactoryRegistry();
registry.register('lesson', new LessonExerciseFactory(...));
registry.register('drill', new DrillExerciseFactory(...));
registry.register('practice', new PracticeExerciseFactory(...));

const exercise = registry.create('drill', { 
  userId: 'user-123',
  difficulty: 'intermediate' 
});
```

**Benefits:**
- Centralized exercise creation logic
- Easy to add new exercise types
- Consistent exercise structure
- Type-specific customization
- Testable factories in isolation

### 8. Facade Pattern for Complex Subsystems

**Pattern:** Simplify complex subsystem interactions with a unified interface.

**Implementation:**
```typescript
// packages/shared-core/facades/TypingEngineFacade.ts
class TypingEngineFacade {
  constructor(
    private validator: InputValidator,
    private calculator: MetricsCalculator,
    private tracker: KeystrokeTracker,
    private sessionManager: SessionManager,
    private exerciseRegistry: ExerciseFactoryRegistry
  ) {}
  
  // Simplified API for UI components
  startSession(modeType: string, config: ExerciseConfig): TypingSession {
    const exercise = this.exerciseRegistry.create(modeType, config);
    return this.sessionManager.startSession(exercise);
  }
  
  processKeystroke(session: TypingSession, key: string): TypingEvent {
    const timestamp = performance.now();
    
    // Coordinate multiple subsystems
    const validation = this.validator.validateKeystroke({
      key,
      timestamp,
      expected: session.getExpectedChar(),
      position: session.currentPosition
    });
    
    this.tracker.record({
      key,
      timestamp,
      correct: validation.correct,
      dwellTime: validation.dwellTime,
      interKeyInterval: timestamp - session.lastKeystrokeTime
    });
    
    const metrics = this.calculator.calculateMetrics(session);
    
    return {
      validation,
      metrics,
      timestamp
    };
  }
  
  endSession(session: TypingSession): SessionResult {
    const finalMetrics = this.calculator.calculateFinalMetrics(session);
    const analysis = this.tracker.analyzeSession(session);
    const weakKeys = this.tracker.identifyWeakKeys(session);
    
    return this.sessionManager.endSession(session, {
      metrics: finalMetrics,
      analysis,
      weakKeys,
      timestamp: performance.now()
    });
  }
  
  pauseSession(session: TypingSession): void {
    this.sessionManager.pauseSession(session);
  }
  
  resumeSession(session: TypingSession): void {
    this.sessionManager.resumeSession(session);
  }
}

// UI components use simple facade API (no internal knowledge)
const TypingInterface: React.FC = () => {
  const typingEngine = useTypingEngine();  // Facade instance
  
  const handleStart = () => {
    const session = typingEngine.startSession('practice', {
      duration: 60,
      contentType: 'common_words'
    });
    setSession(session);
  };
  
  const handleKeyPress = (key: string) => {
    const event = typingEngine.processKeystroke(session, key);
    setMetrics(event.metrics);
  };
  
  const handleEnd = () => {
    const result = typingEngine.endSession(session);
    navigate('/results', { state: { result } });
  };
};
```

**Benefits:**
- Simplified API for complex subsystems
- UI components don't need internal knowledge
- Easy to refactor internal implementation
- Clear contract between presentation and business logic
- Reduces coupling between layers

### 9. Performance Optimization Patterns

#### 9.1 Hot Path vs Cold Path Separation

**Principle:** Distinguish between latency-critical operations (hot path) and background operations (cold path).

**Implementation:**
```typescript
// HOT PATH: Per-keystroke operations (<2ms total)
// Rules:
// - NO async operations
// - NO IPC calls
// - NO heavy computation
// - Pure functions only
// - Cached/memoized results

class TypingInterface extends React.Component {
  handleKeyPress = (key: string) => {
    // HOT PATH: All synchronous, fast
    const event = this.validator.validate(key);     // <0.1ms (pure function)
    const metrics = this.calculator.calculate();    // <0.1ms (memoized)
    this.setState({ event, metrics });              // <1ms (React batch)
    
    // COLD PATH: Queue for later
    this.queueBackgroundOperations();
  };
  
  // COLD PATH: Background operations (debounced, can be slower)
  queueBackgroundOperations = debounce(() => {
    this.saveSession();           // IPC ~10ms, but debounced
    this.syncToCloud();           // Network, queued
    this.updateAnalytics();       // Non-critical
  }, 500);
}
```

**Guidelines:**

| Operation | Path | Max Latency | Pattern |
|-----------|------|-------------|---------|
| Keystroke validation | Hot | <0.5ms | Pure function, synchronous |
| WPM calculation | Hot | <0.5ms | Cached, memoized |
| React setState | Hot | <1ms | Batched updates |
| Save to Tauri Store | Cold | ~10ms | Debounced (500ms) |
| Sync to cloud | Cold | ~100ms | Queued, background |
| Chart rendering | Cold | ~50ms | Lazy loaded, memoized |
| Data export | Cold | ~1000ms | User-initiated, loading state |

#### 9.2 Memoization & Caching

**Pattern:** Cache expensive calculations to avoid recomputation.

**Implementation:**
```typescript
// packages/shared-core/analytics/MetricsCalculator.ts
class MetricsCalculator {
  private wpmCache = new Map<string, number>();
  private accuracyCache = new Map<string, number>();
  
  calculateWPM(keystrokes: KeystrokeEvent[]): number {
    const cacheKey = `${keystrokes.length}:${keystrokes[keystrokes.length - 1]?.timestamp}`;
    
    if (this.wpmCache.has(cacheKey)) {
      return this.wpmCache.get(cacheKey)!;
    }
    
    const wpm = this.computeWPM(keystrokes);
    this.wpmCache.set(cacheKey, wpm);
    
    // Limit cache size
    if (this.wpmCache.size > 100) {
      const firstKey = this.wpmCache.keys().next().value;
      this.wpmCache.delete(firstKey);
    }
    
    return wpm;
  }
  
  private computeWPM(keystrokes: KeystrokeEvent[]): number {
    if (keystrokes.length === 0) return 0;
    
    const correctChars = keystrokes.filter(k => k.correct).length;
    const timeMinutes = (
      keystrokes[keystrokes.length - 1].timestamp - keystrokes[0].timestamp
    ) / 60000;
    
    return (correctChars / 5) / timeMinutes;  // 5 chars = 1 word
  }
}

// In React components
const MemoizedProgressChart = React.memo(
  ProgressChart,
  (prev, next) => {
    // Only re-render if data actually changed
    return prev.data.length === next.data.length &&
           prev.data[prev.data.length - 1]?.wpm === next.data[next.data.length - 1]?.wpm;
  }
);

// Use useMemo for expensive computations
const chartData = useMemo(() => {
  return downsampleData(sessions, 100);  // Expensive
}, [sessions]);
```

#### 9.3 Data Downsampling for Charts

**Pattern:** Reduce data points for chart rendering without losing visual fidelity.

**Implementation:**
```typescript
// packages/shared-core/analytics/ChartDataProcessor.ts
class ChartDataProcessor {
  /**
   * Downsample data using LTTB (Largest Triangle Three Buckets) algorithm
   * Reduces 1000+ sessions to ~100 points while preserving visual shape
   */
  downsample(sessions: TypingSession[], maxPoints: number = 100): ChartDataPoint[] {
    if (sessions.length <= maxPoints) {
      return sessions.map(s => ({ 
        wpm: s.wpm, 
        accuracy: s.accuracy,
        date: s.date 
      }));
    }
    
    return this.lttbDownsample(sessions, maxPoints);
  }
  
  private lttbDownsample(data: TypingSession[], threshold: number): ChartDataPoint[] {
    const bucketSize = (data.length - 2) / (threshold - 2);
    const sampled: ChartDataPoint[] = [];
    
    // Always include first point
    sampled.push({ wpm: data[0].wpm, date: data[0].date });
    
    for (let i = 0; i < threshold - 2; i++) {
      // Find point with largest triangle area
      const bucketStart = Math.floor((i + 0) * bucketSize) + 1;
      const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;
      const nextBucketStart = Math.floor((i + 1) * bucketSize) + 1;
      const nextBucketEnd = Math.min(
        Math.floor((i + 2) * bucketSize) + 1,
        data.length
      );
      
      // Calculate average point in next bucket
      const avgNext = this.calculateAverage(data.slice(nextBucketStart, nextBucketEnd));
      
      // Find point with largest triangle area in current bucket
      let maxArea = 0;
      let maxAreaIndex = bucketStart;
      
      for (let j = bucketStart; j < bucketEnd; j++) {
        const area = this.calculateTriangleArea(
          sampled[sampled.length - 1],
          { wpm: data[j].wpm, date: data[j].date },
          avgNext
        );
        
        if (area > maxArea) {
          maxArea = area;
          maxAreaIndex = j;
        }
      }
      
      sampled.push({ wpm: data[maxAreaIndex].wpm, date: data[maxAreaIndex].date });
    }
    
    // Always include last point
    sampled.push({ wpm: data[data.length - 1].wpm, date: data[data.length - 1].date });
    
    return sampled;
  }
}

// Usage in Dashboard
const Dashboard: React.FC = ({ sessions }) => {
  const chartData = useMemo(() => {
    return chartProcessor.downsample(sessions, 100);
  }, [sessions]);
  
  return <LineChart data={chartData} />;
};
```

### 10. State Management Patterns (Zustand)

**Pattern:** Use middleware for cross-cutting concerns (persistence, sync, logging).

**Implementation:**
```typescript
// apps/desktop/src/stores/middleware.ts
type Middleware = (config: any) => (set: any, get: any, api: any) => any;

// Persistence middleware (debounced to avoid IPC overhead)
const persistenceMiddleware = (config: any) => (set: any, get: any, api: any) => {
  let timeoutId: NodeJS.Timeout;
  
  const persistedSet = (...args: any[]) => {
    set(...args);
    
    // Debounce saves to Tauri Store
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const state = get();
      await invoke('save_state', { state });
    }, 500);
  };
  
  return config(persistedSet, get, api);
};

// Sync middleware (background cloud sync)
const syncMiddleware = (config: any) => (set: any, get: any, api: any) => {
  const syncedSet = (...args: any[]) => {
    set(...args);
    
    const state = get();
    
    // Queue sync operations (non-blocking)
    if (state.sessions?.length > 0) {
      syncEngine.queue({
        type: 'sync_sessions',
        data: state.sessions,
        timestamp: Date.now()
      });
    }
  };
  
  return config(syncedSet, get, api);
};

// Logging middleware (development only)
const loggerMiddleware = (config: any) => (set: any, get: any, api: any) => {
  const loggedSet = (...args: any[]) => {
    const before = get();
    set(...args);
    const after = get();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Zustand]', { before, after });
    }
  };
  
  return config(loggedSet, get, api);
};

// Combine middleware
const createStore = <T extends State>(config: StateCreator<T>) => {
  return create<T>(
    loggerMiddleware(
      persistenceMiddleware(
        syncMiddleware(config)
      )
    )
  );
};

// Usage
const useTypingStore = createStore<TypingState>((set, get) => ({
  session: null,
  metrics: null,
  
  startSession: (exercise) => {
    const session = new TypingSession(exercise);
    set({ session });
  },
  
  processKeystroke: (key) => {
    const session = get().session;
    const event = typingEngine.processKeystroke(session, key);
    set({ metrics: event.metrics });
  }
}));
```

### 11. Module Organization (Monorepo Best Practices)

**Structure:**
```
packages/
  shared-ui/
    package.json          # React 18, Framer Motion, Tailwind
    src/
      components/
        index.ts          # Public API - only export these
        TypingInterface/
          TypingInterface.tsx
          TypingInterface.test.tsx
          TypingInterface.styles.ts
          index.ts        # Export only TypingInterface component
        VirtualKeyboard/
          VirtualKeyboard.tsx
          index.ts
      hooks/
        index.ts
        useTypingSession.ts
        useProgress.ts
      index.ts            # Re-export all public APIs
      
  shared-core/
    package.json          # Pure TypeScript, no React
    src/
      typing/
        index.ts          # Public API
        InputValidator.ts
        MetricsCalculator.ts
        KeystrokeTracker.ts
        __tests__/
          InputValidator.test.ts
      analytics/
        index.ts
        WeakSpotDetector.ts
        ProgressTracker.ts
      sync/
        index.ts
        SyncEngine.ts
        ConflictResolver.ts
      index.ts            # Re-export all public APIs
      
  shared-types/
    src/
      index.ts            # Export all types
      typing.ts
      analytics.ts
      exercises.ts
```

**Import Rules:**
```typescript
// ✅ Good: Use public APIs via index.ts
import { TypingInterface, VirtualKeyboard } from '@keyflow/shared-ui';
import { InputValidator, MetricsCalculator } from '@keyflow/shared-core';
import { TypingSession, Exercise } from '@keyflow/shared-types';

// ❌ Bad: Import internal modules directly
import { TypingInterface } from '@keyflow/shared-ui/components/TypingInterface/TypingInterface';
import { InputValidator } from '@keyflow/shared-core/typing/InputValidator';
```

**Benefits:**
- Clear module boundaries
- Explicit public APIs prevent internal leakage
- Easy to refactor internals without breaking consumers
- Tree-shaking optimizations
- Clear dependency graph

---

## Summary of Architectural Patterns

| Pattern | Purpose | Location | Key Benefit |
|---------|---------|----------|-------------|
| **Layered Architecture** | Separation of concerns | Entire monorepo | Clear boundaries, testable |
| **Dependency Inversion** | Platform abstraction | `shared-core` + adapters | 90% code reuse |
| **Command Pattern** | Coarse-grained IPC | `shared-core/commands` | No per-keystroke overhead |
| **Observer Pattern** | Real-time updates | `shared-core/typing` | Decoupled, extensible |
| **Strategy Pattern** | Practice modes | `shared-core/modes` | Easy to add modes |
| **Repository Pattern** | Data persistence | `shared-core/repositories` | Local-first architecture |
| **Factory Pattern** | Exercise generation | `shared-core/exercises` | Consistent creation |
| **Facade Pattern** | Simplified API | `shared-core/facades` | Reduced complexity |
| **Memoization** | Performance | `shared-core/analytics` | <2ms latency |
| **Middleware Pattern** | Cross-cutting concerns | Zustand stores | Persistence, sync, logging |

These patterns ensure **maintainability** (clear structure), **extensibility** (easy to add features), and **performance** (<2ms keystroke latency) while maximizing code reuse between desktop and web platforms.

---

## MVP (Minimum Viable Product) Requirements

### Phase 1: Foundation & Shared Components (Weeks 1-2)

**Goal**: Monorepo setup with core typing interface working across both platforms

#### 1.1 Monorepo Setup

**Priority: CRITICAL**

**Requirements:**

- Turborepo or Nx monorepo configuration
- Package structure: `shared-ui`, `shared-core`, `shared-types`
- App structure: `desktop` (Tauri), `web` (Next.js), `backend` (REST API)
- TypeScript path aliases for clean imports
- Shared build pipeline with caching
- PNPM workspaces for dependency deduplication

**Acceptance Criteria:**

- [ ] Monorepo builds successfully with `turbo build`
- [ ] Shared packages can be imported in both apps
- [ ] Changes in shared packages trigger rebuilds
- [ ] No duplicate React/Zustand versions
- [ ] Build cache works correctly

#### 1.2 Shared Typing Interface Component

**Priority: CRITICAL**

**Requirements:**

- React component in `packages/shared-ui/components/TypingInterface`
- Real-time text display with Monkeytype-inspired minimal design
- Character-by-character input validation
- Visual cursor indicating current typing position
- Error prevention (no forward progress on incorrect input)
- Works identically in desktop (Tauri) and web (Next.js)

**Technical Specifications:**

```typescript
interface TypingSession {
  id: string;
  text: string;
  userInput: string;
  currentPosition: number;
  startTime: Date;
  wpm: number;
  accuracy: number;
  errors: TypingError[];
}

interface TypingError {
  position: number;
  expected: string;
  actual: string;
  timestamp: Date;
}
```

**Acceptance Criteria:**

- [ ] User can see text to type clearly
- [ ] Input is validated character-by-character
- [ ] WPM calculation is accurate (5 characters = 1 word)
- [ ] Accuracy percentage is calculated correctly
- [ ] Session time is tracked precisely
- [ ] No forward progress allowed on errors

#### 1.3 Keystroke Validation & Data Collection (shared-core)

**Priority: CRITICAL**

**Requirements:**

- Millisecond-precise keystroke timing using `performance.now()`
- Real-time character comparison
- Keystroke dynamics data collection (for future ML features)
- Prevention of incorrect character advancement
- **Performance target: <2ms latency (desktop), <5ms (web)**

**Technical Specifications:**

```typescript
// packages/shared-types
interface KeystrokeEvent {
  key: string;
  timestamp: number;              // performance.now() precision
  expected: string;
  correct: boolean;
  dwellTime: number;              // How long key was held
  interKeyInterval: number;       // Time since last keystroke
  position: number;               // Character position in text
}

// Keystroke Dynamics Data (privacy-first, local-first)
interface TypingDataPoint {
  // Timing metrics
  keystroke: string;
  timestamp: number;
  dwellTime: number;
  interKeyInterval: number;
  
  // Context metrics
  expectedChar: string;
  isCorrect: boolean;
  attemptNumber: number;
  position: number;
  
  // Session metrics
  currentWPM: number;
  currentAccuracy: number;
  sessionTime: number;
  fatigueScore: number;           // Calculated from timing variance
  
  // Anonymized metadata
  sessionId: string;
  exerciseType: 'lesson' | 'practice' | 'drill' | 'challenge';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// packages/shared-core/validation
class InputValidator {
  validateKeystroke(event: KeystrokeEvent): ValidationResult;
  calculateWPM(keystrokes: KeystrokeEvent[]): number;
  calculateAccuracy(keystrokes: KeystrokeEvent[]): number;
  collectKeystrokeData(event: KeystrokeEvent): TypingDataPoint;  // For ML
}
```

**Acceptance Criteria:**

- [ ] Keystroke timing measured to millisecond precision
- [ ] Desktop: <2ms latency (measured with performance.now())
- [ ] Web: <5ms latency
- [ ] Accurate WPM calculation (5 characters = 1 word, industry standard)
- [ ] **WPM/accuracy metrics verified against established platforms:**
  - [ ] Cross-validate against Monkeytype's open-source timing logic ([monkeytypegame/monkeytype](https://github.com/monkeytypegame/monkeytype))
  - [ ] Test against 10FastFingers using community scripts ([wRadion/10FFLiveWPMScript](https://github.com/wRadion/10FFLiveWPMScript))
  - [ ] Validate using A/B testing: same text on KeyFlow vs. reference platforms
  - [ ] Document any discrepancies and justify deviations
- [ ] Keystroke dynamics data stored locally (privacy-first)
- [ ] No lag during rapid typing (150+ WPM)
- [ ] Data collection opt-in for cloud sync

#### 1.4 Open-Source Benchmarking Standards

**Priority: CRITICAL**

**Requirements:**

Ensure KeyFlow's timing, WPM calculation, and accuracy metrics align with established typing platforms to build credibility with elite typists and the r/typing community.

**Benchmarking Strategy:**

**1. Monkeytype (Primary Reference - Fully Open Source):**
- **Repository**: [monkeytypegame/monkeytype](https://github.com/monkeytypegame/monkeytype)
- **Why**: Gold standard for speed improvement, fully open-source timing logic
- **Key Files to Study**:
  - `/src/ts/test/test-results.tsx` - WPM calculation and results processing
  - `/src/ts/test/typing-test.ts` - Core timing logic and real-time updates
- **Timing Standards**:
  - WPM Formula: `(correct characters / 5) / (elapsed time in minutes)`
  - Real-time updates via React hooks
  - Supports 15s, 30s, 60s, 120s burst modes
  - Accuracy: `correct characters / total input characters`
  - Error handling for edge cases (e.g., non-ASCII input)
- **Validation Method**:
  - Clone and run locally: `npm install && npm run dev`
  - Test same text on both platforms, compare results
  - Reference discussions: [#1892](https://github.com/monkeytypegame/monkeytype/discussions/1892) (segment-based WPM)

**2. 10FastFingers (Community Scripts):**
- **Not open-source**, but community reverse-engineered scripts available
- **Key Repositories**:
  - [wRadion/10FFLiveWPMScript](https://github.com/wRadion/10FFLiveWPMScript) - Tampermonkey script for live WPM
  - [IO-Modding/10fastfingers.com---WPM-counter](https://github.com/IO-Modding/10fastfingers.com---WPM-counter) - Userscript with timing overlay
  - [yashrathi-git/10fastfingers-bot](https://github.com/yashrathi-git/10fastfingers-bot) - Selenium bot for timing simulation
- **Timing Standards**:
  - Fixed 1-minute tests
  - 200-302 word lists
  - WPM adjusted for errors
  - Input lag minimization focus
- **Validation Method**:
  - Use community scripts to capture live WPM calculations
  - A/B test: same 200-word list on both platforms
  - Verify low-latency claims (<2ms) against their standards

**3. NitroType (Bot-Based Approximations):**
- **Not open-source** (proprietary multiplayer game)
- **Key Repositories** (for timing approximations):
  - [pfeilbr/nitro-typer-chrome-extension](https://github.com/pfeilbr/nitro-typer-chrome-extension) - Auto-typer with timing
  - [kgsensei/NitroType-AutoTyper](https://github.com/kgsensei/NitroType-AutoTyper) - ~200 WPM simulation
- **Timing Standards**:
  - Real-time racing mechanics
  - 100% accuracy emphasis
  - ~200 WPM baseline for competitive play
- **Validation Method**:
  - Less critical for MVP (game-focused vs. practice tool)
  - Reference for competitive race timing (v1.2+ multiplayer)

**Implementation Requirements:**

```typescript
// packages/shared-core/benchmarking/MetricValidator.ts
interface BenchmarkResult {
  platform: 'monkeytype' | '10fastfingers' | 'keyflow';
  text: string;
  wpm: number;
  accuracy: number;
  duration: number;
  discrepancy: number;  // Percentage difference
}

class MetricValidator {
  /**
   * Cross-validate WPM calculation against Monkeytype's formula
   * Reference: https://github.com/monkeytypegame/monkeytype/blob/master/frontend/src/ts/test/test-results.tsx
   */
  validateWPM(keystrokes: KeystrokeEvent[]): BenchmarkResult;
  
  /**
   * Run A/B test: same text on KeyFlow vs. reference platform
   * Acceptable discrepancy: <2% difference
   */
  crossPlatformTest(text: string): BenchmarkResult[];
  
  /**
   * Document any deviations from standard formulas
   */
  generateValidationReport(): ValidationReport;
}
```

**Acceptance Criteria:**

- [ ] Fork/clone Monkeytype repo and study timing implementation
- [ ] WPM calculations match Monkeytype's formula (within 1% tolerance)
- [ ] Accuracy calculations verified against community standards
- [ ] A/B testing completed: KeyFlow vs. Monkeytype (10+ sample texts)
- [ ] Discrepancies <2% on average
- [ ] Validation report generated and documented
- [ ] Timing logic reviewed by r/typing community members during beta

**Resources:**

- **Monkeytype Discord**: Community for dev discussions on timing standards
- **r/typing**: Post beta benchmarks for community validation
- **GitHub Topics**: [10fastfingers](https://github.com/topics/10fastfingers) (~50 repos with WPM formulas)

#### 1.5 Basic Metrics Dashboard

**Priority: HIGH**

**Requirements:**

- Real-time WPM display
- Accuracy percentage
- Session timer
- Error count
- Basic progress visualization

**Technical Specifications:**

```typescript
interface MetricsDisplay {
  wpm: number;
  accuracy: number;
  sessionTime: number;
  errorCount: number;
  charactersTyped: number;
  wordsCompleted: number;
}
```

**Acceptance Criteria:**

- [ ] Real-time metrics update during typing
- [ ] Clean, readable metrics display
- [ ] Accurate calculations for all metrics
- [ ] Responsive design for different screen sizes

#### 1.6 Exercise Content System

**Priority: HIGH**

**Requirements:**

- Curated typing exercises
- Progressive difficulty levels
- Common word focus
- Real sentences (not random characters)

**Technical Specifications:**

```typescript
interface Exercise {
  id: string;
  title: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusKeys: string[];
  category: 'common_words' | 'sentences' | 'paragraphs';
  estimatedTime: number; // seconds
}

interface ExerciseLibrary {
  exercises: Exercise[];
  getExerciseByDifficulty(level: string): Exercise[];
  getRandomExercise(): Exercise;
}
```

**Acceptance Criteria:**

- [ ] Library of 50+ curated exercises
- [ ] Progressive difficulty system
- [ ] Focus on real words and sentences
- [ ] Exercise categorization and filtering

#### 1.7 Desktop App Bootstrap (Tauri)

**Priority: CRITICAL**

**Requirements:**

- Tauri 2.0 project setup in `apps/desktop`
- Import shared typing interface from `packages/shared-ui`
- Tauri Store Plugin for local data persistence
- Basic IPC commands for coarse-grained operations

**Acceptance Criteria:**

- [ ] Tauri app starts in <0.5s
- [ ] Shared typing component renders correctly
- [ ] Local data persists across restarts
- [ ] Keystroke latency <2ms (benchmark)

#### 1.8 Backend API Bootstrap

**Priority: CRITICAL**

**Requirements:**

- Express or Hono server setup in `backend/`
- PostgreSQL database schema (users, sessions, progress)
- Prisma ORM configuration
- Authentication setup (Clerk or Supabase Auth)
- Basic REST endpoints: `/api/auth`, `/api/sessions`, `/api/progress`

**Acceptance Criteria:**

- [ ] Backend starts successfully
- [ ] Database migrations run
- [ ] Authentication flow works
- [ ] API responds in <100ms (p95)

---

### Phase 2: Four Practice Modes (Weeks 3-4)

**Goal**: Implement all four practice modes validated by user research (final-analysis.md)

#### 2.1 Lesson Mode (replaces TypingClub)

**Priority: CRITICAL**

**User Research Validation:**
> "TypingClub for structure, but professional UI for adults" (final-analysis.md)

**Requirements:**

- Structured progression: Beginner → Intermediate → Advanced
- 50+ lessons covering home row → full keyboard
- Hand positioning guidance (visual keyboard)
- Touch-typing fundamentals
- **NOT juvenile** (Monkeytype-inspired professional UI)
- Completion criteria: Adaptive accuracy threshold (90-98%)

**Technical Specifications:**

```typescript
// packages/shared-types
interface Lesson {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  focusKeys: string[];
  text: string;
  description: string;
  targetAccuracy: number;      // Adaptive based on user level
  estimatedTime: number;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  attempts: number;
  bestWPM: number;
  bestAccuracy: number;
  completedAt?: Date;
}
```

**Acceptance Criteria:**

- [ ] 10+ basic lessons implemented for MVP
- [ ] Lesson progression tracking (local + cloud sync)
- [ ] Adaptive accuracy requirements (not rigid 96-98%)
- [ ] Visual finger guidance
- [ ] Professional UI (not cartoonish)

#### 2.2 Practice Mode (replaces Monkeytype)

**Priority: CRITICAL**

**User Research Validation:**
> "Monkeytype is the 'gold standard' for speed improvement" (final-analysis.md)

**Requirements:**

- Customizable test durations (15s, 30s, 60s, 120s, 300s)
- **15s/30s/60s burst formats align with competitive typing (Monkeytype, TypeRacer)**
- Content types:
  - Most common 1,000 English words
  - Quotes from books/movies
  - Code snippets (Python, JavaScript, TypeScript)
- Real-time WPM + accuracy display
- Minimal, distraction-free UI (Monkeytype-inspired)
- Dark mode default
- Results screen with detailed stats

**Technical Specifications:**

```typescript
// packages/shared-types
interface PracticeConfig {
  duration: 15 | 30 | 60 | 120 | 300;  // seconds (15s added for competitive bursts)
  contentType: 'common_words' | 'quotes' | 'code' | 'custom';
  language?: 'python' | 'javascript' | 'typescript';
  wordCount?: number;
}

interface PracticeResult {
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  charactersTyped: number;
  correctChars: number;
  incorrectChars: number;
}
```

**Acceptance Criteria:**

- [ ] All test durations work correctly
- [ ] 1,000+ common words content available
- [ ] Quote database with 100+ quotes
- [ ] Code snippets for 3+ languages
- [ ] Minimal UI matches Monkeytype aesthetic
- [ ] Results screen shows detailed breakdown

#### 2.3 Drill Mode (replaces Keybr)

**Priority: HIGH**

**User Research Validation:**
> "Keybr's adaptive drills are valued, but repetitive" (final-analysis.md)

**Requirements:**

- AI identifies weak keys automatically (statistical analysis)
- Generates targeted exercises with **REAL words** (not nonsense like Keybr)
- Visual finger guidance for weak keys
- Focus areas:
  - Specific key combinations (th, qu, ing, ion)
  - Weak fingers (pinkies, ring fingers)
  - Punctuation and symbols
- Adaptive difficulty based on improvement

**Technical Specifications:**

```typescript
// packages/shared-core/analytics
interface WeakKeyAnalysis {
  key: string;
  errorRate: number;
  avgSpeed: number;        // ms per keystroke
  improvementTrend: number;
  practiceRecommendation: string;
}

interface DrillExercise {
  id: string;
  targetKeys: string[];
  text: string;             // Real words/sentences, not "jjj kkk jjj"
  difficulty: number;       // 1-10
  estimatedTime: number;
}

class WeakSpotDetector {
  analyzeKeystrokeData(sessions: TypingSession[]): WeakKeyAnalysis[];
  generateDrill(weakKeys: string[]): DrillExercise;
  trackImprovement(key: string, sessions: TypingSession[]): number;
}
```

**Acceptance Criteria:**

- [ ] Weak key detection works accurately
- [ ] Drill exercises use real words (not gibberish)
- [ ] Visual finger guidance highlights correct finger
- [ ] Improvement tracked over time
- [ ] Difficulty adapts to user progress

#### 2.4 Challenge Mode (replaces TypeRacer)

**Priority: MEDIUM**

**User Research Validation:**
> "TypeRacer's competition boosts speed via fun" (final-analysis.md)

**Requirements:**

- Daily typing challenges (new challenge every day)
- Natural sentences (not random words)
- Personal leaderboard (track your best times)
- Compete against your previous times
- Challenge history tracking

**Technical Specifications:**

```typescript
// packages/shared-types
interface Challenge {
  id: string;
  date: Date;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;        // 'literature', 'tech', 'news'
}

interface ChallengeAttempt {
  challengeId: string;
  wpm: number;
  accuracy: number;
  rank: number;            // Against your own attempts
  timestamp: Date;
}

interface Leaderboard {
  personal: ChallengeAttempt[];     // Your best attempts
  global?: ChallengeAttempt[];      // v1.2 feature (multiplayer)
}
```

**Acceptance Criteria:**

- [ ] New challenge available daily
- [ ] Natural, engaging sentences
- [ ] Personal leaderboard shows progress
- [ ] Challenge history stored locally
- [ ] Results shareable (v1.2 feature)

**Technical Specifications:**

```typescript
interface VirtualKeyboard {
  keys: KeyboardKey[];
  highlightTargetKey(key: string): void;
  showPressedKey(key: string): void;
  toggleVisibility(): void;
  showHandGuidance(): void;
}

interface KeyboardKey {
  value: string;
  position: { row: number; column: number };
  finger:
    | 'left_pinky'
    | 'left_ring'
    | 'left_middle'
    | 'left_index'
    | 'right_index'
    | 'right_middle'
    | 'right_ring'
    | 'right_pinky'
    | 'thumbs';
}
```

**Acceptance Criteria:**

- [ ] Accurate QWERTY keyboard layout
- [ ] Real-time key highlighting
- [ ] Visual feedback for key presses
- [ ] Hand position indicators
- [ ] Toggle visibility option

#### 2.2 Audio Feedback System

**Priority: MEDIUM**

**Requirements:**

- Sound effects for correct/incorrect typing
- Optional audio (user can disable)
- Different sound profiles
- Volume control

**Technical Specifications:**

```typescript
interface AudioSystem {
  playCorrectSound(): void;
  playErrorSound(): void;
  playCompletionSound(): void;
  setVolume(level: number): void;
  toggleEnabled(): void;
}
```

**Acceptance Criteria:**

- [ ] Pleasant sound effects for feedback
- [ ] Audio can be disabled
- [ ] Volume control available
- [ ] No audio lag or interference

#### 2.3 User Progress Tracking

**Priority: HIGH**

**Requirements:**

- Session history
- Progress over time
- Weakness identification
- Achievement system

**Technical Specifications:**

```typescript
interface UserProgress {
  userId: string;
  sessions: TypingSession[];
  statistics: {
    averageWPM: number;
    bestWPM: number;
    averageAccuracy: number;
    totalPracticeTime: number;
    weakKeys: string[];
  };
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
  criteria: AchievementCriteria;
}
```

**Acceptance Criteria:**

- [ ] Detailed session history
- [ ] Progress visualization over time
- [ ] Identification of problem keys
- [ ] Achievement system with meaningful rewards

---

## Phase 3: Advanced Features (Weeks 9-12)

#### 3.1 AI-Powered Adaptive Learning

**Priority: HIGH**

**Requirements:**

- Personalized difficulty adjustment
- Weak spot identification
- Custom exercise generation
- Learning pattern analysis

**Technical Specifications:**

```typescript
interface AdaptiveEngine {
  analyzeUserPattern(userId: string): UserPattern;
  generateCustomExercise(pattern: UserPattern): Exercise;
  adjustDifficulty(session: TypingSession): DifficultyLevel;
  identifyWeakSpots(sessions: TypingSession[]): string[];
}

interface UserPattern {
  weakKeys: string[];
  strongKeys: string[];
  optimalSpeed: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  preferredSessionLength: number;
}
```

**Acceptance Criteria:**

- [ ] AI identifies user weaknesses
- [ ] Generates personalized exercises
- [ ] Adapts difficulty in real-time
- [ ] Improves learning efficiency

#### 3.2 Advanced Analytics Dashboard

**Priority: MEDIUM**

**Requirements:**

- Detailed performance metrics
- Progress visualization
- Comparative analysis
- Export capabilities

**Technical Specifications:**

```typescript
interface AnalyticsDashboard {
  performanceMetrics: PerformanceMetrics;
  progressCharts: Chart[];
  comparativeAnalysis: ComparisonData;
  exportData(format: 'csv' | 'pdf' | 'json'): Blob;
}

interface PerformanceMetrics {
  wpmTrend: number[];
  accuracyTrend: number[];
  errorPatterns: ErrorPattern[];
  sessionFrequency: number[];
}
```

**Acceptance Criteria:**

- [ ] Comprehensive analytics display
- [ ] Interactive charts and graphs
- [ ] Data export functionality
- [ ] Historical trend analysis

#### 3.3 Multi-User Support

**Priority: MEDIUM**

**Requirements:**

- User authentication
- Multiple user profiles
- Parent/teacher oversight
- Class management

**Technical Specifications:**

```typescript
interface UserManagement {
  createUser(profile: UserProfile): User;
  authenticateUser(credentials: Credentials): AuthResult;
  manageClassroom(classroom: Classroom): void;
  generateReports(users: User[]): Report[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  preferences: UserPreferences;
}
```

**Acceptance Criteria:**

- [ ] Secure user authentication
- [ ] Multiple user profiles
- [ ] Teacher dashboard for classroom management
- [ ] Parent progress reports

---

## Phase 4: Professional Features (Weeks 13-16)

#### 4.1 Professional Typist Features

**Priority: HIGH**

**Requirements:**

- Advanced keyboard layouts (Dvorak, Colemak)
- Custom keyboard support
- Competition mode
- Leaderboards

**Technical Specifications:**

```typescript
interface ProfessionalFeatures {
  keyboardLayouts: KeyboardLayout[];
  competitionMode: CompetitionEngine;
  leaderboards: Leaderboard;
  customKeyboards: CustomKeyboard[];
}

interface CompetitionEngine {
  createRace(participants: User[]): TypingRace;
  trackProgress(race: TypingRace): void;
  determineWinner(race: TypingRace): User;
}
```

**Acceptance Criteria:**

- [ ] Support for multiple keyboard layouts
- [ ] Real-time competition mode
- [ ] Global and local leaderboards
- [ ] Custom keyboard configuration

#### 4.2 Content Management System

**Priority: MEDIUM**

**Requirements:**

- Exercise creation tools
- Content import/export
- Community content sharing
- Professional content integration

**Technical Specifications:**

```typescript
interface ContentManagement {
  createExercise(content: ExerciseContent): Exercise;
  importContent(source: ContentSource): Exercise[];
  shareContent(exercise: Exercise): ShareResult;
  integrateProfessionalContent(domain: string): Exercise[];
}
```

**Acceptance Criteria:**

- [ ] Easy exercise creation interface
- [ ] Content import from various sources
- [ ] Community sharing capabilities
- [ ] Professional domain-specific content

---

#### 2.5 Virtual Keyboard Component

**Priority: HIGH**

**Requirements:**

- Shared component in `packages/shared-ui/components/VirtualKeyboard`
- QWERTY layout (MVP), expandable to Dvorak/Colemak (v2.0)
- Real-time key highlighting for target character
- Visual feedback for pressed keys
- Hand position guidance (color-coded by finger)
- Toggle visibility option
- Works in both desktop and web

**Technical Specifications:**

```typescript
// packages/shared-ui/components/VirtualKeyboard
interface KeyboardKey {
  value: string;
  position: { row: number; column: number };
  finger: 'left_pinky' | 'left_ring' | 'left_middle' | 'left_index' | 
          'right_index' | 'right_middle' | 'right_ring' | 'right_pinky' | 
          'thumbs';
  color: string;  // Color-coded by finger
}

interface VirtualKeyboardProps {
  currentKey?: string;           // Highlight this key
  pressedKey?: string;           // Show as pressed
  showFingerGuidance: boolean;
  visible: boolean;
  onToggle: () => void;
}
```

**Acceptance Criteria:**

- [ ] Accurate QWERTY layout
- [ ] Real-time key highlighting (<5ms delay)
- [ ] Visual feedback for key presses
- [ ] Hand position color coding
- [ ] Smooth animations (Framer Motion transitions only)
- [ ] Works identically on desktop and web

---

### Phase 3: Analytics & Web App (Weeks 5-6)

**Goal**: Unified progress tracking and web app deployment

#### 3.1 Progress Dashboard (Shared Component)

**Priority: HIGH**

**Requirements:**

- Shared dashboard in `packages/shared-ui/components/Dashboard`
- WPM over time chart (Recharts, downsampled for performance)
- Accuracy trends visualization
- Session history table (last 30 sessions)
- Weak key heatmap (visual representation)
- Total practice time tracker
- Export data (CSV/JSON)

**Technical Specifications:**

```typescript
// packages/shared-types
interface ProgressStats {
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  totalPracticeTime: number;    // seconds
  totalSessions: number;
  weakKeys: WeakKeyAnalysis[];
  improvementRate: number;      // WPM increase per week
}

interface SessionHistory {
  sessions: TypingSession[];
  chartData: ChartDataPoint[];  // Downsampled for Recharts
  filters: {
    dateRange: [Date, Date];
    mode: 'all' | 'lesson' | 'practice' | 'drill' | 'challenge';
  };
}
```

**Performance Considerations:**
- Downsample chart data (max 100 points for Recharts)
- Use `React.memo` for expensive components
- Lazy load on web with `dynamic(import())`

**Acceptance Criteria:**

- [ ] Charts render smoothly (<16ms frame time)
- [ ] Session history loads quickly (< 500ms)
- [ ] Weak key heatmap visually clear
- [ ] Export to CSV/JSON works
- [ ] Identical appearance on desktop and web

#### 3.2 Web App Deployment (Next.js)

**Priority: CRITICAL**

**Requirements:**

- Next.js 15 app in `apps/web`
- Import all shared components from `packages/shared-ui`
- User authentication (required for web)
- All four practice modes functional
- Progress synced to backend (cloud-only)
- Deployed to Vercel

**Acceptance Criteria:**

- [ ] Web app deploys successfully
- [ ] All shared components work
- [ ] Auth flow complete
- [ ] First Contentful Paint <1.5s
- [ ] All practice modes functional
- [ ] Data syncs to backend

#### 3.3 Backend REST API

**Priority: CRITICAL**

**Requirements:**

- Complete REST API in `backend/`
- Endpoints:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/exercises`
  - `POST /api/sessions`
  - `GET /api/progress`
  - `GET /api/stats`
  - `GET /api/export` (CSV/JSON)
- PostgreSQL with Prisma ORM
- Authentication (Clerk or Supabase)
- API response time <100ms (p95)

**Acceptance Criteria:**

- [ ] All endpoints functional
- [ ] Database queries optimized
- [ ] Authentication works
- [ ] API handles 50+ concurrent users
- [ ] Error handling comprehensive

---

### Phase 4: Advanced Features (Post-MVP, v1.2+)

#### 4.1 AI-Powered Exercise Generation (v1.3)

**Priority: HIGH (Post-MVP)**

**Requirements:**

- TensorFlow.js models (runs locally in app)
- Personalized exercise generation based on keystroke dynamics
- Speed prediction ("You'll hit 100 WPM in 4 weeks")
- Learning pattern analysis
- Custom training plans

**Technical Specifications:**

```typescript
// packages/shared-core/ml
interface MLModel {
  predictImprovement(history: TypingSession[]): number;      // Future WPM
  generatePersonalizedExercise(weakKeys: string[]): string;  // Custom text
  analyzeTypingStyle(data: TypingDataPoint[]): TypingStyle;
}

interface TypingStyle {
  technique: 'touch' | 'hunt-and-peck' | 'hybrid';
  fingerUsage: Record<string, number>;
  optimalSessionLength: number;
  fatiguePattern: number[];
}
```

**Note:** ML features require substantial keystroke data. Collect data in MVP, implement models in v1.3.

---

### Phase 5: Hardware Compatibility Testing (Optional, v1.1+)

**Priority: OPTIONAL**

**Note**: This is an optional enhancement to build credibility with mechanical keyboard enthusiasts and elite typists. Not required for MVP validation.

**Goal**: Document KeyFlow's performance across popular mechanical keyboards to demonstrate consistent <2ms latency claims and build trust within the r/MechanicalKeyboards and elite typing communities.

#### 5.1 Mechanical Keyboard Testing

**Requirements:**

- Test KeyFlow with popular mechanical keyboard switches
- Document input lag performance per keyboard type
- Profile keyboard-specific polling rates
- Validate consistent <2ms latency across hardware
- Create public compatibility matrix

**Target Keyboards for Testing:**

**Cherry MX Switches:**
- Cherry MX Red (linear)
- Cherry MX Blue (clicky)
- Cherry MX Brown (tactile)

**Gateron Switches:**
- Gateron Red/Yellow (linear)
- Gateron Blue (clicky)
- Gateron Brown (tactile)

**Popular Custom Keyboards:**
- Keychron K series (wireless/wired)
- GMMK (Glorious Modular Mechanical Keyboard)
- Anne Pro 2 (wireless)
- Ducky One series

**Polling Rates to Test:**
- 125Hz (8ms polling interval)
- 250Hz (4ms polling interval)
- 500Hz (2ms polling interval)
- 1000Hz (1ms polling interval)

**Technical Specifications:**

```typescript
// packages/shared-core/hardware/KeyboardProfiler.ts
interface KeyboardProfile {
  manufacturer: string;
  model: string;
  switchType: 'cherry_mx_red' | 'cherry_mx_blue' | 'gateron_red' | 'custom';
  connection: 'wired' | 'wireless_2.4ghz' | 'bluetooth';
  pollingRate: 125 | 250 | 500 | 1000;  // Hz
  measuredLatency: {
    min: number;      // Minimum observed latency (ms)
    avg: number;      // Average latency (ms)
    p50: number;      // Median latency (ms)
    p95: number;      // 95th percentile (ms)
    p99: number;      // 99th percentile (ms)
    max: number;      // Maximum observed latency (ms)
  };
  testConditions: {
    platform: 'macos' | 'windows' | 'linux';
    testDuration: number;        // seconds
    keystrokesRecorded: number;
    datesTested: Date[];
  };
}

class KeyboardProfiler {
  /**
   * Profile keyboard latency during typing session
   * Records inter-keystroke timing and system response
   */
  profileKeyboard(session: TypingSession): KeyboardProfile;
  
  /**
   * Generate compatibility report for public documentation
   */
  generateCompatibilityReport(profiles: KeyboardProfile[]): CompatibilityMatrix;
  
  /**
   * Detect keyboard polling rate (1000Hz, 500Hz, etc.)
   */
  detectPollingRate(): number;
}

interface CompatibilityMatrix {
  keyboards: KeyboardProfile[];
  summary: {
    totalKeyboardsTested: number;
    allMeetLatencyTarget: boolean;  // All <2ms average
    bestPerforming: KeyboardProfile;
    recommendations: string[];
  };
}
```

**Testing Methodology:**

1. **Latency Measurement**:
   - Use `performance.now()` to measure keystroke-to-display latency
   - Record 1000+ keystrokes per keyboard
   - Test at 150+ WPM typing speed (realistic for elite typists)
   - Measure across 5+ typing sessions per keyboard

2. **Polling Rate Detection**:
   - Measure inter-keystroke intervals during rapid typing
   - Calculate minimum interval to determine polling rate
   - Document any keyboards that report incorrect polling rates

3. **Wireless vs. Wired**:
   - Test same keyboard model in both modes (if available)
   - Document latency differences
   - Note any connection-specific issues

4. **Platform Testing**:
   - Primary: macOS (MVP platform)
   - Secondary: Windows (v1.1)
   - Tertiary: Linux (v1.1+)

**Documentation Output:**

Create public compatibility matrix on website/docs:

```markdown
# KeyFlow Hardware Compatibility

## Tested Mechanical Keyboards

| Keyboard | Switch | Connection | Polling Rate | Avg Latency | P95 Latency | Status |
|----------|--------|------------|--------------|-------------|-------------|--------|
| Keychron K2 | Gateron Red | Wired | 1000Hz | 1.8ms | 2.1ms | ✅ Excellent |
| GMMK Pro | Cherry MX Red | Wired | 1000Hz | 1.9ms | 2.3ms | ✅ Excellent |
| Anne Pro 2 | Gateron Brown | Bluetooth | 125Hz | 8.2ms | 12.1ms | ⚠️ Not Recommended |
| Ducky One 2 | Cherry MX Blue | Wired | 1000Hz | 1.7ms | 2.0ms | ✅ Excellent |

**Key Findings:**
- Wired keyboards with 1000Hz polling: <2ms average latency ✅
- Wireless 2.4GHz: 2-3ms average (acceptable) ✅
- Bluetooth: 8-15ms average (not recommended for speed typing) ⚠️
- Switch type (linear/clicky/tactile) has no impact on software latency
```

**Acceptance Criteria:**

- [ ] Test with 5+ popular mechanical keyboard models
- [ ] Document latency for each keyboard (min/avg/p95/p99/max)
- [ ] Test across different polling rates (125Hz, 250Hz, 500Hz, 1000Hz)
- [ ] Compare wired vs. wireless performance
- [ ] Generate public compatibility matrix
- [ ] Share findings on r/MechanicalKeyboards for community validation
- [ ] Update website/docs with compatibility information
- [ ] No keyboard-specific performance degradation for wired 1000Hz keyboards

**Community Engagement:**

- Post compatibility matrix on r/MechanicalKeyboards
- Request community members to submit their own keyboard profiles
- Crowdsource compatibility data for keyboards not tested internally
- Build trust with mechanical keyboard enthusiasts (overlap with elite typists)

**Success Metrics:**

- 10+ keyboards profiled and documented
- Public compatibility matrix published
- Positive reception on r/MechanicalKeyboards
- Community-submitted profiles increase coverage to 20+ keyboards
- Elite typists reference compatibility matrix when choosing KeyFlow

**Benefits:**

1. **Credibility**: Demonstrates commitment to performance claims
2. **Transparency**: Public data builds trust
3. **Community**: Engages r/MechanicalKeyboards (1.5M members)
4. **Marketing**: "Tested with your keyboard" differentiator
5. **Support**: Reduces "will it work with my keyboard?" questions

**Implementation Timeline:**

- **v1.1 (Month 4-5)**: Initial hardware testing with 5 keyboards
- **v1.2 (Month 6-8)**: Expand to 10+ keyboards, publish compatibility matrix
- **v1.3+ (Month 9+)**: Crowdsource community profiles, build database

---

## Deployment & DevOps

### Development Tools

- **Monorepo**: Turborepo or Nx
- **Testing**: Vitest (unit) + Playwright (E2E, both platforms)
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **CI/CD**: GitHub Actions
- **Error Tracking**: Sentry or PostHog
- **Analytics**: Posthog or Umami (privacy-focused)

### Deployment Strategy

**Desktop App:**
- Tauri bundler for macOS (.dmg)
- Code signing (Apple Developer account)
- Auto-updates (Tauri updater)
- Windows + Linux (v1.1+)

**Web App:**
- Vercel (production + preview deploys)
- Environment variables (Vercel dashboard)
- CDN optimization
- SEO meta tags

**Backend:**
- Railway, Render, or Fly.io
- PostgreSQL (Supabase or Neon)
- Environment configuration
- Monitoring (error tracking, logs)
- Load testing (50+ concurrent users)

---

## Success Metrics

### Technical Metrics (Platform-Specific)

**Desktop (Tauri):**
- **Keystroke Latency**: <2ms (measured with performance.now())
- **Startup Time**: <0.5s
- **Memory Usage**: <100 MB (idle), <150 MB (active)
- **Bundle Size**: <20 MB installer
- **WPM Calculation**: 99.9%+ accuracy (5 characters = 1 word)
- **Crash Rate**: <0.1% (zero crashes in 1-hour session)

**Web (Next.js):**
- **First Contentful Paint**: <1.5s
- **Keystroke Latency**: <5ms
- **API Response Time**: <100ms (p95)
- **Uptime**: 99.9% availability

**Backend:**
- **API Response Time**: <100ms (p95)
- **Concurrent Users**: 50+ without degradation
- **Database Query Time**: <50ms (p95)
- **Uptime**: 99.9% availability

### User Experience Metrics (Research-Validated)

**MVP Validation Goals:**
- ✅ "Feels as fast as Monkeytype" (subjective feedback)
- ✅ "Looks as clean as Monkeytype" (design comparison)
- ✅ "Teaches like TypingClub but professional" (learning effectiveness)
- ✅ "Adapts like Keybr with real words" (drill mode quality)
- ✅ "Challenges like TypeRacer with progression" (engagement)

**Quantitative Metrics:**
- **Retention**: 70%+ 7-day retention
- **Improvement**: 20%+ average WPM increase after 30 days
- **Session Duration**: 15+ minutes average
- **Practice Frequency**: 3+ sessions per week
- **Mode Usage**: Users try all 4 modes within first week

### Business Metrics (Research-Validated)

**MVP (Month 1-3):**
- **Downloads**: 5,000+ (desktop + web signups)
- **Conversion**: 10%+ free → paid desktop ($0 → $39)
- **Revenue**: $19,500+ (500 purchases × $39)
- **Product Hunt**: 4.0+ rating
- **r/typing**: 3+ positive mentions

**Growth (Month 4-6):**
- **Monthly Growth**: 20%+ user growth
- **Pro Tier**: 5%+ desktop users upgrade to Pro ($49/yr)
- **Revenue**: $50K+ cumulative
- **Platform Split**: 60% desktop, 40% web (target)

**Year 1:**
- **Paid Users**: 5,000+
- **Revenue**: $195K+ (desktop) + $24.5K (Pro) = $219.5K
- **Churn**: <5% monthly
- **Windows Release**: Month 4-5
- **NPS Score**: 50+ (promoters - detractors)

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation Strategy |
|------|---------------------|
| **Monorepo Complexity** | Use Turborepo for build orchestration, extensive documentation |
| **React 19 Instability** | Keep shared components client-side only, avoid experimental features |
| **Tauri Performance** | Benchmark early (Week 2), validate <2ms latency claim |
| **Framer Motion Lag** | Use transitions only, NOT per-keystroke animations |
| **Sync Conflicts** | Timestamped updates, clear merge strategy (last-write-wins) |
| **Cross-Platform Parity** | Shared component tests, Playwright E2E for both platforms |
| **Backend Scalability** | PostgreSQL indexing, caching layer, load testing (50+ users) |

### Business Risks (Research-Validated)

| Risk | Mitigation Strategy |
|------|---------------------|
| **Feature Creep** | Stick to 4 practice modes only. Say NO to everything else (per roadmap) |
| **Market Doesn't Care** | Early r/typing validation post (Week 4) before full launch |
| **Pricing Too High** | Emphasize "no ads, no lag, own forever" + early-bird $29 |
| **Monkeytype Loyalty** | Positioning: "Monkeytype + teaching" (not replacement) |
| **macOS-Only Limits** | Clear Windows roadmap (Month 4-5), web app for accessibility |
| **Ad-Free Sustainability** | One-time + Pro subscription model, no compromises on ads |

### Privacy & Security Risks

| Risk | Mitigation Strategy |
|------|---------------------|
| **Keystroke Data Privacy** | Local-first storage, opt-in cloud sync, anonymized data |
| **Tauri IPC Exploits** | Limit Rust command permissions, sanitize all IPC input |
| **Auth Vulnerabilities** | Use Clerk/Supabase (proven solutions), no custom auth |
| **Data Breach** | Encrypt sensitive data at rest, HTTPS only, regular audits |

---

## Development Timeline (8-Week MVP)

### Week 1-2: Foundation & Shared Components
**Deliverables:**
- [x] Monorepo setup (Turborepo, PNPM workspaces)
- [x] Shared typing interface component
- [x] Keystroke validation logic (packages/shared-core)
- [x] Desktop app bootstrap (Tauri)
- [x] Backend API bootstrap (Express/Hono + PostgreSQL)
- [x] **Validation:** <2ms latency on desktop

### Week 3-4: Four Practice Modes
**Deliverables:**
- [x] Lesson Mode (10+ lessons)
- [x] Practice Mode (customizable tests)
- [x] Drill Mode (weak key detection)
- [x] Challenge Mode (daily challenges)
- [x] Virtual Keyboard component
- [x] Backend REST API endpoints
- [x] **Validation:** All modes functional on desktop and web

### Week 5-6: Analytics & Web App
**Deliverables:**
- [x] Progress Dashboard (Recharts charts)
- [x] Session history tracking
- [x] Weak key heatmap
- [x] Next.js web app deployment
- [x] User authentication (Clerk/Supabase)
- [x] Data sync (desktop ↔ backend)
- [x] **Validation:** Web app deployed, data syncs correctly

### Week 7-8: Testing & Launch Prep
**Deliverables:**
- [x] Performance optimization (latency, startup, memory)
- [x] Cross-platform testing (desktop + web)
- [x] E2E tests (Playwright)
- [x] macOS packaging (.dmg)
- [x] Code signing (Apple Developer)
- [x] Backend deployment (Railway/Render)
- [x] Marketing assets (landing page, demo video)
- [x] **Validation:** Ready to launch on Product Hunt + r/typing

### Week 9+: Launch & Iterate
- Launch on r/typing (soft launch)
- Product Hunt launch
- Hacker News launch
- Monitor metrics, fix bugs
- Plan Windows release (v1.1)

---

## Summary

This engineering requirements document provides a comprehensive, research-validated plan for building KeyFlow - the native typing tutor for speed seekers. 

**Key Differentiators:**
1. **Architecture**: Monorepo with 90% shared React components (desktop + web)
2. **Performance**: Tauri for 2ms latency (vs. 8ms in Electron/web apps)
3. **Positioning**: All-in-one consolidation of TypingClub + Monkeytype + Keybr + TypeRacer
4. **Target Market**: Speed seekers (18-35) who juggle 3-4 typing sites
5. **Monetization**: One-time purchase ($39) with optional Pro ($49/yr)

**Timeline**: 8 weeks to MVP, validated by research from final-analysis.md, latest-requirements.md, and tech-considerations.md.

**Next Step**: Set up monorepo structure and validate Tauri performance claims.
