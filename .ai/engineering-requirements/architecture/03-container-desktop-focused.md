# Level 2: Desktop App Focused Container Diagram

## Overview

This diagram zooms into the desktop app architecture, showing how it achieves <2ms keystroke latency and 100% offline functionality through local-first design patterns.

**Audience:** Desktop developers, performance engineers

**Purpose:** Understand desktop app architecture, IPC patterns, and performance optimizations.

## Diagram

```plantuml
@startuml KeyFlow Desktop Focused Containers
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

title Container Diagram for KeyFlow - Desktop App (Local-First Architecture)

Person(user, "User", "Types at 40-150+ WPM")

System_Boundary(desktop_boundary, "Desktop App (Tauri 2.0)") {
    Container(react_frontend, "React Frontend", "React 18 + Vite + TypeScript", "Presentation layer. Imports shared-ui components and shared-core logic. <2ms keystroke latency (no IPC on hot path).")
    
    Container(zustand_stores, "Zustand Stores", "Zustand + Middleware", "State management with persistence, sync, and logging middleware. Manages typing sessions, progress, settings.")
    
    Container(shared_core, "Business Logic", "TypeScript (shared-core)", "Pure TypeScript logic: InputValidator, MetricsCalculator, WeakSpotDetector, SyncEngine. 90% shared with web app.")
    
    Container(tauri_adapters, "Tauri Adapters", "TypeScript Wrappers", "Platform-specific adapters: TauriStorageAdapter, TauriFileSystemAdapter. Implements StorageAdapter interface.")
    
    Container(rust_backend, "Rust Backend", "Tauri Commands (Minimal)", "Coarse-grained IPC commands only: save_data, load_data, export_file, window_management. NOT for per-keystroke logic.")
    
    ContainerDb(tauri_store, "Tauri Store", "File System (JSON)", "Local-first storage. Primary data source. 100% offline functional. Background sync to cloud.")
}

System_Boundary(sync_boundary, "Optional Cloud Sync") {
    Container(sync_queue, "Sync Queue", "TypeScript (shared-core)", "Queues operations for background sync. Handles network failures, retries, conflict resolution.")
    
    System_Ext(rest_api, "REST API", "Node.js backend")
    SystemDb_Ext(postgres, "PostgreSQL", "Cloud storage")
}

Rel(user, react_frontend, "Types keystroke", "Native window")

' Hot path (< 2ms, no IPC)
Rel(react_frontend, shared_core, "Validates keystroke", "Function call (<0.1ms)")
Rel(react_frontend, zustand_stores, "Updates state", "setState (<1ms)")

' Cold path (debounced, IPC allowed)
Rel(zustand_stores, tauri_adapters, "Saves session", "Debounced (500ms)")
Rel(tauri_adapters, rust_backend, "IPC command", "save_data (~10ms)")
Rel(rust_backend, tauri_store, "Writes file", "File I/O")

' Background sync
Rel(zustand_stores, sync_queue, "Queues sync", "Background")
Rel(sync_queue, rest_api, "POST session", "HTTPS (when online)")
Rel(rest_api, postgres, "Saves", "SQL")

' Load on startup
Rel(react_frontend, tauri_adapters, "Load data", "On startup")
Rel(tauri_adapters, rust_backend, "IPC command", "load_data")
Rel(rust_backend, tauri_store, "Reads file", "File I/O")

note right of react_frontend
  **HOT PATH (<2ms):**
  1. User keystroke
  2. Validate (pure function)
  3. Calculate WPM (memoized)
  4. Update UI (React)
  
  NO IPC, NO async
end note

note right of zustand_stores
  **COLD PATH (debounced):**
  1. Session complete
  2. Debounce 500ms
  3. Save to Tauri Store
  4. Queue for cloud sync
  
  Non-blocking background
end note

SHOW_LEGEND()

@enduml
```

## Desktop Architecture Principles

### 1. Local-First Design

**Core Principle:** Data lives locally first, cloud is optional.

```
Priority 1: Tauri Store (local, immediate)
Priority 2: Sync Queue (background)
Priority 3: Cloud (eventual consistency)
```

**Benefits:**
- 100% offline functional
- Fast operations (no network latency)
- User owns their data
- Resilient to network failures

### 2. Hot Path vs Cold Path Separation

**Critical Pattern:** Distinguish latency-critical operations from background operations.

#### Hot Path (<2ms total)
- **What:** Per-keystroke validation, WPM calculation, UI updates
- **Rules:**
  - ❌ NO async operations
  - ❌ NO IPC calls
  - ❌ NO heavy computation
  - ✅ Pure functions only
  - ✅ Memoized/cached results
  - ✅ In-process operations only

#### Cold Path (>10ms allowed)
- **What:** Saving sessions, exporting data, syncing to cloud
- **Rules:**
  - ✅ IPC allowed (coarse-grained)
  - ✅ Async operations allowed
  - ✅ Debounced (500ms)
  - ✅ Background operations
  - ✅ Network requests

### 3. Minimal Rust, Maximum TypeScript

**Philosophy:** 95%+ logic in TypeScript/React, Rust only for OS bridge.

#### TypeScript/React (95%)
- All UI components (shared-ui)
- All business logic (shared-core)
- State management (Zustand)
- Validation, calculations, analytics
- Sync engine, conflict resolution

#### Rust (5%)
- File system operations (Tauri Store read/write)
- Window management (resize, minimize, fullscreen)
- System tray integration
- OS notifications
- System preferences

**Rationale:**
- TypeScript is more productive (faster development)
- React enables 90% code reuse with web
- Rust only where necessary (OS/file system bridge)
- Team can focus on TypeScript expertise

## Detailed Component Responsibilities

### React Frontend Layer

**Technology:** React 18 + Vite + TypeScript

**Responsibilities:**
- Render UI (TypingInterface, VirtualKeyboard, Dashboard)
- Handle user input (keyboard events)
- Display real-time metrics (WPM, accuracy)
- Route between pages (Lesson, Practice, Drill, Challenge)

**Performance Characteristics:**
- Keystroke handling: <2ms
- UI updates: 60 FPS (16ms frame time)
- Startup time: <0.5s

**Code Example:**
```typescript
// Hot path: Pure React, no IPC
const handleKeyPress = (key: string) => {
  const event = validator.validate(key);      // <0.1ms
  const metrics = calculator.calculate();     // <0.1ms
  setMetrics(metrics);                        // <1ms
  // Total: <2ms ✓
};
```

### Zustand Stores Layer

**Technology:** Zustand + custom middleware

**Responsibilities:**
- Application state (sessions, progress, settings)
- Middleware: persistence, sync, logging
- State persistence to Tauri Store (debounced)
- Sync queue management

**Middleware Stack:**
```typescript
createStore(
  loggerMiddleware(         // Development only
    persistenceMiddleware(  // Debounced saves
      syncMiddleware(       // Background cloud sync
        storeConfig
      )
    )
  )
);
```

### Business Logic Layer (Shared Core)

**Technology:** Pure TypeScript (no React, no platform dependencies)

**Responsibilities:**
- Input validation (keystroke checking)
- Metrics calculation (WPM, accuracy, errors)
- Weak spot detection (AI analytics)
- Sync engine (conflict resolution)
- Exercise generation

**Key Principle:** 100% platform-agnostic, testable without UI.

### Tauri Adapters Layer

**Technology:** TypeScript wrappers around Tauri commands

**Responsibilities:**
- Implement `StorageAdapter` interface
- Translate business logic calls to IPC commands
- Handle Tauri command errors
- Provide platform-specific optimizations

**Code Example:**
```typescript
class TauriStorageAdapter implements StorageAdapter {
  async save(key: string, data: any) {
    return invoke('save_data', { key, data });
  }
  
  async load(key: string) {
    return invoke('load_data', { key });
  }
}
```

### Rust Backend Layer

**Technology:** Tauri 2.0 commands (minimal)

**Responsibilities:**
- File system operations (read/write JSON)
- Window management (Tauri window APIs)
- System tray (native OS integration)
- Export operations (save CSV/JSON to disk)

**Key Principle:** Coarse-grained operations only, NOT per-keystroke.

**Code Example:**
```rust
#[tauri::command]
async fn save_data(key: String, data: serde_json::Value) -> Result<(), String> {
    // Write to file system
    let path = get_store_path(&key);
    fs::write(path, data.to_string())
        .map_err(|e| e.to_string())
}
```

### Tauri Store

**Technology:** File system (JSON files)

**Responsibilities:**
- Store typing sessions
- Store user progress
- Store settings/preferences
- Store sync queue

**File Structure:**
```
~/Library/Application Support/com.keyflow.app/
  ├── sessions/
  │   ├── session-uuid-1.json
  │   └── session-uuid-2.json
  ├── progress.json
  ├── settings.json
  └── sync-queue.json
```

## Performance Benchmarks

### Keystroke Latency (Critical)

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Keystroke validation | <0.5ms | performance.now() |
| WPM calculation | <0.5ms | performance.now() |
| React setState | <1ms | React DevTools Profiler |
| **Total hot path** | **<2ms** | **End-to-end** |

### Background Operations (Non-Critical)

| Operation | Target | Actual |
|-----------|--------|--------|
| Save to Tauri Store (IPC) | <10ms | ~8ms |
| Load sessions on startup | <100ms | ~50ms |
| Export data to CSV | <500ms | ~300ms |
| Sync to cloud (network) | <2s | Varies |

### Startup Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| App launch | <0.5s | Time to interactive |
| First paint | <0.2s | Chrome DevTools |
| Load sessions | <100ms | performance.now() |

## Offline Capabilities

### Fully Functional Offline
- ✅ All 4 practice modes (Lesson, Practice, Drill, Challenge)
- ✅ Real-time metrics (WPM, accuracy)
- ✅ Progress tracking
- ✅ Weak spot detection
- ✅ Session history
- ✅ Settings management

### Requires Online
- ❌ Cloud sync (queued for when online)
- ❌ Exercise content updates (cached locally)
- ❌ Account management

### Sync Strategy When Back Online
```
1. Check network status
2. Process sync queue (FIFO)
3. POST sessions to REST API
4. Merge conflicts (timestamp-based)
5. Update local cache
6. Notify user (optional)
```

## Data Flow: Complete Typing Session

### 1. Session Start
```
User clicks "Start Practice"
  ↓
React creates TypingSession instance (shared-core)
  ↓
Zustand stores session state
  ↓
Render TypingInterface
```

### 2. Typing (Hot Path, <2ms per keystroke)
```
User presses key
  ↓
React onKeyPress handler
  ↓
InputValidator.validate(key) [<0.1ms, pure function]
  ↓
MetricsCalculator.calculateWPM() [<0.1ms, memoized]
  ↓
Zustand setState() [<1ms, batched]
  ↓
React re-render [<1ms, optimized]
```

**NO IPC, NO async, NO network**

### 3. Session End (Cold Path, debounced)
```
User finishes text
  ↓
SessionManager.endSession()
  ↓
Calculate final metrics
  ↓
Zustand stores final session
  ↓
[Debounce 500ms]
  ↓
TauriStorageAdapter.save()
  ↓
invoke('save_data') [IPC, ~10ms]
  ↓
Rust writes to file system
  ↓
SyncEngine.queue() [background]
```

### 4. Background Sync (Eventually)
```
SyncQueue processes items
  ↓
POST to REST API [HTTPS]
  ↓
API merges with cloud data
  ↓
Save to PostgreSQL
  ↓
Update local cache
```

## IPC Command Reference

### Storage Commands
```typescript
// Save data to Tauri Store
invoke('save_data', { key: string, data: any })

// Load data from Tauri Store
invoke('load_data', { key: string }): Promise<any>

// Delete data from Tauri Store
invoke('delete_data', { key: string })

// Clear all data (reset app)
invoke('clear_all_data')
```

### File System Commands
```typescript
// Export sessions to CSV
invoke('export_csv', { sessions: Session[], path: string })

// Export sessions to JSON
invoke('export_json', { sessions: Session[], path: string })

// Open file picker
invoke('select_file', { filters: string[] }): Promise<string>
```

### Window Commands
```typescript
// Minimize window
invoke('minimize_window')

// Toggle fullscreen
invoke('toggle_fullscreen')

// Set window size
invoke('set_window_size', { width: number, height: number })
```

## Memory Management

### Memory Footprint Targets
- **Idle:** <100 MB
- **Active (typing):** <150 MB
- **With large session history:** <200 MB

### Optimization Strategies
- Cache only last 100 sessions in memory
- Lazy load session history
- Downsample chart data (max 100 points)
- Memoize expensive calculations
- Use React.memo for expensive components

## Related Diagrams

- **Previous**: [Full System Container](./02-container-full-system.md)
- **Alternative**: [Web Container](./04-container-web-focused.md)
- **Related**: [Sync Architecture](./05-container-sync-architecture.md)
- **Components**: [Typing Engine Components](./07-component-typing-engine.md)

## References

- [C4 Model: Container Diagram](https://c4model.com/diagrams/container)
- [Tauri Commands](https://tauri.app/v1/guides/features/command)
- [Local-First Software](https://www.inkandswitch.com/local-first/)
- [KeyFlow Performance Requirements](../ENGINEERING_REQUIREMENTS.md#performance-optimization-patterns)

