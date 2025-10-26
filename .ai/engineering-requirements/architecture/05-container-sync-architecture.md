# Level 2: Local-First Sync Architecture Container Diagram

## Overview

This diagram details the synchronization mechanism between desktop's local storage and cloud storage, showing how KeyFlow handles offline operations, conflict resolution, and eventual consistency.

**Audience:** Backend developers, desktop developers, architects

**Purpose:** Understand local-first sync patterns, conflict resolution, and data consistency strategies.

## Diagram

```plantuml
@startuml KeyFlow Sync Architecture
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

title Container Diagram for KeyFlow - Local-First Sync Architecture

Person(user, "Desktop User", "Works offline, syncs when online")

System_Boundary(desktop_boundary, "Desktop App") {
    Container(typing_interface, "Typing Interface", "React Component", "User completes typing sessions")
    
    Container(session_manager, "Session Manager", "TypeScript (shared-core)", "Manages typing session lifecycle")
    
    ContainerDb(local_store, "Tauri Store", "JSON Files", "Primary data source. Sessions stored immediately. 100% offline functional.")
    
    Container(sync_engine, "Sync Engine", "TypeScript (shared-core)", "Coordinates sync operations, handles conflicts, manages queue")
    
    Container(sync_queue, "Sync Queue", "TypeScript", "Persistent queue of pending sync operations. Survives app restarts.")
    
    Container(conflict_resolver, "Conflict Resolver", "TypeScript", "Timestamp-based merge strategy. Last-write-wins with user override option.")
    
    Container(network_monitor, "Network Monitor", "TypeScript", "Detects online/offline status. Triggers sync when back online.")
}

System_Boundary(backend_boundary, "Backend (Cloud)") {
    Container(sync_api, "Sync API", "REST Endpoints", "/api/sync/sessions, /api/sync/progress. Handles batch operations and conflict detection.")
    
    Container(conflict_detector, "Conflict Detector", "Node.js Service", "Compares timestamps, detects conflicts, returns merge suggestions")
    
    ContainerDb(postgres, "PostgreSQL", "Cloud Database", "Master data store. Contains all user data from all devices.")
    
    Container(sync_log, "Sync Log", "Audit Trail", "Tracks all sync operations for debugging and recovery")
}

' Session complete flow
Rel(user, typing_interface, "Completes session", "Keystroke")
Rel(typing_interface, session_manager, "End session", "Function call")
Rel(session_manager, local_store, "Save immediately", "File I/O (~10ms)")
Rel(session_manager, sync_queue, "Queue for sync", "Add to queue")

' Sync process when online
Rel(network_monitor, sync_engine, "Triggers", "Network online event")
Rel(sync_engine, sync_queue, "Dequeues", "Get pending operations")
Rel(sync_engine, local_store, "Reads", "Get local data")
Rel(sync_engine, sync_api, "POST /api/sync/sessions", "HTTPS (batch)")

' Conflict detection
Rel(sync_api, conflict_detector, "Check conflicts", "Compare timestamps")
Rel(conflict_detector, postgres, "Query", "Get remote data")
Rel(conflict_detector, sync_api, "Return conflicts", "Conflict list")

' Conflict resolution
Rel(sync_api, conflict_resolver, "Resolve", "Merge strategy")
Rel(conflict_resolver, postgres, "Save merged", "SQL INSERT/UPDATE")
Rel(conflict_resolver, sync_log, "Log operation", "Audit trail")

' Sync result back to desktop
Rel(sync_api, sync_engine, "Return result", "Success/conflicts")
Rel(sync_engine, local_store, "Update cache", "Merge remote changes")
Rel(sync_engine, sync_queue, "Remove synced", "Dequeue")

note right of sync_engine
  **Sync States:**
  1. Offline: Queue operations
  2. Online: Process queue
  3. Conflict: Resolve + merge
  4. Success: Update cache
  
  Idempotent operations
  Retry on failure
end note

note right of conflict_resolver
  **Merge Strategy:**
  1. Compare timestamps
  2. Last-write-wins (default)
  3. User override (manual)
  4. Field-level merge (advanced)
  
  No data loss
end note

SHOW_LEGEND()

@enduml
```

## Sync Architecture Principles

### 1. Local-First Philosophy

**Core Principle:** Local data is the source of truth, cloud is a backup.

```
Desktop Truth:  Local Store (immediate)
Cloud Truth:    PostgreSQL (eventual)
Sync Direction: Bidirectional (push + pull)
Conflict Rule:  Timestamp-based, last-write-wins
```

**Benefits:**
- Works 100% offline
- Fast operations (no network latency)
- User owns their data
- Resilient to network failures
- Natural backup (cloud copy)

### 2. Eventual Consistency

**Pattern:** Accept that data will be inconsistent temporarily, but will converge eventually.

```
Time 0: User types offline → Saved locally
Time 1: Still offline → Data diverges from cloud
Time 2: Back online → Sync triggered
Time 3: Conflicts detected → Resolved
Time 4: Data consistent → Local ≈ Cloud
```

**Trade-offs:**
- ✅ Offline functionality
- ✅ Fast local operations
- ❌ Temporary inconsistency
- ❌ Conflict resolution complexity

### 3. Idempotent Sync Operations

**Pattern:** Sync operations can be retried safely without side effects.

```typescript
// Each session has unique ID
interface Session {
  id: string;           // UUID, generated on desktop
  userId: string;
  timestamp: number;    // performance.now()
  lastModified: number; // For conflict detection
  data: SessionData;
}

// POST with ID is idempotent
POST /api/sync/sessions
Body: { id: "uuid-123", ... }

// Server checks if ID exists
if (existingSession) {
  // Update if newer
  if (incomingTimestamp > existingTimestamp) {
    updateSession(id, data);
  }
} else {
  // Create new
  createSession(data);
}
```

**Benefits:**
- Safe to retry failed syncs
- No duplicate data
- Network failures handled gracefully

## Sync Engine Components

### Session Manager

**Responsibilities:**
- Manage session lifecycle (start, pause, resume, end)
- Save sessions to local store immediately
- Trigger sync queue addition
- Handle session metadata

**Code Example:**
```typescript
class SessionManager {
  async endSession(session: TypingSession): Promise<void> {
    // 1. Calculate final metrics
    const finalMetrics = this.calculator.calculateFinal(session);
    
    // 2. Save locally (immediate, offline-safe)
    await this.localStore.save(`session:${session.id}`, {
      ...session.serialize(),
      metrics: finalMetrics,
      lastModified: Date.now()
    });
    
    // 3. Queue for sync (non-blocking)
    this.syncQueue.enqueue({
      type: 'sync_session',
      id: session.id,
      data: session.serialize(),
      timestamp: Date.now()
    });
  }
}
```

### Sync Engine

**Responsibilities:**
- Coordinate sync operations
- Process sync queue when online
- Handle batch operations (multiple sessions at once)
- Manage retry logic on failures
- Update local cache with remote changes

**State Machine:**
```
┌─────────┐
│  Idle   │ ◄──────────────────┐
└────┬────┘                    │
     │ Network online          │
     ▼                         │
┌─────────┐                    │
│ Syncing │                    │
└────┬────┘                    │
     │                         │
     ├──► Success ─────────────┘
     │
     ├──► Conflict ──► Resolve ──┘
     │
     └──► Failure ──► Retry ──► [Exponential backoff]
```

**Code Example:**
```typescript
class SyncEngine {
  private isOnline = false;
  private isSyncing = false;
  
  async processQueue(): Promise<void> {
    if (!this.isOnline || this.isSyncing) return;
    
    this.isSyncing = true;
    
    try {
      // Get pending operations (batch)
      const operations = await this.syncQueue.dequeue(10);  // Max 10 at once
      
      if (operations.length === 0) {
        this.isSyncing = false;
        return;
      }
      
      // Batch sync
      const result = await this.syncAPI.batchSync({
        sessions: operations.map(op => op.data),
        timestamp: Date.now()
      });
      
      // Handle conflicts
      if (result.conflicts.length > 0) {
        await this.resolveConflicts(result.conflicts);
      }
      
      // Update local cache
      await this.updateLocalCache(result.merged);
      
      // Remove synced operations from queue
      await this.syncQueue.removeCompleted(operations.map(op => op.id));
      
    } catch (error) {
      // Retry with exponential backoff
      await this.scheduleRetry(error);
    } finally {
      this.isSyncing = false;
    }
  }
}
```

### Sync Queue

**Responsibilities:**
- Store pending sync operations persistently
- Survive app restarts (persist to Tauri Store)
- FIFO processing
- Track operation status (pending, in_progress, failed)
- Implement retry logic

**Data Structure:**
```typescript
interface SyncOperation {
  id: string;                    // UUID
  type: 'sync_session' | 'sync_progress' | 'sync_settings';
  data: any;                     // Session data, progress data, etc.
  timestamp: number;             // When queued
  attempts: number;              // Retry count
  status: 'pending' | 'in_progress' | 'failed' | 'completed';
  error?: string;                // Last error message
}

interface SyncQueue {
  operations: SyncOperation[];
  
  enqueue(operation: SyncOperation): void;
  dequeue(limit: number): Promise<SyncOperation[]>;
  removeCompleted(ids: string[]): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
  retryFailed(): Promise<void>;
}
```

**Persistence:**
```json
// ~/.../Tauri Store/sync-queue.json
{
  "operations": [
    {
      "id": "uuid-1",
      "type": "sync_session",
      "data": { "sessionId": "...", ... },
      "timestamp": 1704067200000,
      "attempts": 0,
      "status": "pending"
    },
    {
      "id": "uuid-2",
      "type": "sync_progress",
      "data": { "stats": { ... } },
      "timestamp": 1704067300000,
      "attempts": 2,
      "status": "failed",
      "error": "Network timeout"
    }
  ]
}
```

### Conflict Resolver

**Responsibilities:**
- Detect conflicts (local vs remote timestamps)
- Implement merge strategies
- Provide user override options
- Ensure no data loss

**Conflict Detection:**
```typescript
interface Conflict {
  sessionId: string;
  local: Session;           // Local version
  remote: Session;          // Remote version
  conflictFields: string[]; // Which fields differ
}

class ConflictDetector {
  detectConflicts(local: Session, remote: Session): Conflict | null {
    // Same session ID, different data
    if (local.id !== remote.id) return null;
    
    // Compare timestamps
    const localModified = local.lastModified;
    const remoteModified = remote.lastModified;
    
    if (localModified === remoteModified) {
      // No conflict, data is identical
      return null;
    }
    
    // Conflict exists
    const conflictFields = this.findDifferentFields(local, remote);
    
    return {
      sessionId: local.id,
      local,
      remote,
      conflictFields
    };
  }
}
```

**Merge Strategies:**

#### 1. Last-Write-Wins (Default)
```typescript
function mergeLastWriteWins(conflict: Conflict): Session {
  if (conflict.local.lastModified > conflict.remote.lastModified) {
    return conflict.local;  // Local is newer
  } else {
    return conflict.remote; // Remote is newer
  }
}
```

#### 2. Field-Level Merge (Advanced)
```typescript
function mergeFieldLevel(conflict: Conflict): Session {
  const merged = { ...conflict.local };
  
  // For each conflicting field, take newest
  conflict.conflictFields.forEach(field => {
    if (conflict.remote[`${field}Modified`] > conflict.local[`${field}Modified`]) {
      merged[field] = conflict.remote[field];
    }
  });
  
  return merged;
}
```

#### 3. User Override (Manual)
```typescript
async function mergeUserOverride(conflict: Conflict): Promise<Session> {
  // Show UI dialog
  const choice = await showConflictDialog({
    local: conflict.local,
    remote: conflict.remote,
    fields: conflict.conflictFields
  });
  
  if (choice === 'local') return conflict.local;
  if (choice === 'remote') return conflict.remote;
  if (choice === 'merge') return mergeFieldLevel(conflict);
}
```

### Network Monitor

**Responsibilities:**
- Detect online/offline status
- Trigger sync when back online
- Debounce sync triggers (avoid spam)
- Handle network flakiness

**Code Example:**
```typescript
class NetworkMonitor {
  private isOnline = navigator.onLine;
  private listeners = new Set<() => void>();
  
  constructor() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  private handleOnline(): void {
    this.isOnline = true;
    
    // Debounce: Wait 2s to ensure stable connection
    setTimeout(() => {
      if (this.isOnline) {
        this.notifyListeners();
      }
    }, 2000);
  }
  
  private handleOffline(): void {
    this.isOnline = false;
  }
  
  onOnline(callback: () => void): void {
    this.listeners.add(callback);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }
}

// Usage
const networkMonitor = new NetworkMonitor();
networkMonitor.onOnline(() => {
  syncEngine.processQueue();  // Trigger sync
});
```

## Sync API Endpoints

### Batch Sync Endpoint

**POST /api/sync/sessions**

Request:
```json
{
  "sessions": [
    {
      "id": "uuid-1",
      "userId": "user-123",
      "text": "The quick brown fox...",
      "wpm": 85,
      "accuracy": 96.5,
      "timestamp": 1704067200000,
      "lastModified": 1704067250000
    },
    {
      "id": "uuid-2",
      ...
    }
  ],
  "clientTimestamp": 1704067300000
}
```

Response (Success):
```json
{
  "synced": ["uuid-1", "uuid-2"],
  "conflicts": [],
  "merged": {
    "uuid-1": { /* merged data */ },
    "uuid-2": { /* merged data */ }
  },
  "serverTimestamp": 1704067400000
}
```

Response (Conflicts):
```json
{
  "synced": ["uuid-1"],
  "conflicts": [
    {
      "sessionId": "uuid-2",
      "local": { /* local data */ },
      "remote": { /* remote data */ },
      "conflictFields": ["wpm", "lastModified"]
    }
  ],
  "merged": {
    "uuid-1": { /* merged data */ },
    "uuid-2": { /* resolved data (last-write-wins) */ }
  },
  "serverTimestamp": 1704067400000
}
```

### Pull Changes Endpoint

**GET /api/sync/changes?since={timestamp}**

Request:
```
GET /api/sync/changes?since=1704067200000
```

Response:
```json
{
  "sessions": [
    {
      "id": "uuid-3",
      "userId": "user-123",
      "lastModified": 1704067300000,
      "data": { /* session data */ }
    }
  ],
  "progress": {
    "averageWPM": 87,
    "totalSessions": 150,
    "lastModified": 1704067350000
  },
  "serverTimestamp": 1704067400000
}
```

## Sync Scenarios

### Scenario 1: Normal Sync (No Conflicts)

```
Desktop (Offline):
  Session 1 completed → Save locally (timestamp: 1000)
  Session 2 completed → Save locally (timestamp: 2000)
  
Back Online:
  POST /api/sync/sessions [Session 1, Session 2]
  
Server:
  Check timestamps → No conflicts
  Save to PostgreSQL
  Return success
  
Desktop:
  Update local cache
  Remove from sync queue
  
✅ Success: Data synced, no conflicts
```

### Scenario 2: Conflict (Same Session Modified on Two Devices)

```
Device A (Offline):
  Session X modified → timestamp: 1000
  
Device B (Offline):
  Session X modified → timestamp: 2000
  
Device A comes online:
  POST /api/sync/sessions [Session X (timestamp: 1000)]
  Server saves Session X
  
Device B comes online:
  POST /api/sync/sessions [Session X (timestamp: 2000)]
  
Server:
  Detect conflict (two versions of Session X)
  Compare timestamps: 2000 > 1000
  Apply last-write-wins: Device B wins
  Return resolved data
  
Device B:
  Accept resolved data
  Update local cache
  
Device A (next sync):
  GET /api/sync/changes?since=...
  Receive updated Session X (timestamp: 2000)
  Merge into local cache
  
✅ Resolved: Device B's version wins (newer)
```

### Scenario 3: Network Failure During Sync

```
Desktop:
  Session 1 completed
  Queue for sync
  
Network online:
  POST /api/sync/sessions [Session 1]
  
Network fails mid-request:
  Request timeout
  
Sync Engine:
  Mark operation as failed
  Increment retry count
  Schedule retry with exponential backoff:
    Attempt 1: Wait 2s
    Attempt 2: Wait 4s
    Attempt 3: Wait 8s
    Attempt 4: Wait 16s
    Max: Wait 60s
  
Network back online:
  Retry sync
  Success
  
✅ Recovered: Automatic retry succeeded
```

## Data Consistency Guarantees

### What We Guarantee
- ✅ No data loss (local copy always preserved)
- ✅ Eventual consistency (data converges)
- ✅ Idempotent operations (safe to retry)
- ✅ Conflict detection (never silent overwrite)
- ✅ Audit trail (sync log tracks all operations)

### What We Don't Guarantee
- ❌ Real-time sync (eventual, not immediate)
- ❌ Strong consistency (temporary divergence OK)
- ❌ Perfect merge (conflicts may require user input)

## Performance Considerations

### Sync Frequency
- **Immediate:** Save locally (no network)
- **Debounced:** Queue for sync (500ms debounce)
- **Batched:** Sync multiple operations at once (max 10)
- **Throttled:** Max 1 sync per 5 seconds (avoid spam)

### Bandwidth Optimization
- Batch operations (reduce HTTP overhead)
- Compress large payloads (gzip)
- Delta sync (only changed fields, future)
- Pagination (don't sync all history at once)

### Storage Optimization
- Keep last 100 sessions in local cache
- Older sessions archived to cloud only
- Sync queue max 1,000 operations
- Failed operations expire after 30 days

## Related Diagrams

- **Previous**: [Desktop Container](./03-container-desktop-focused.md)
- **Previous**: [Web Container](./04-container-web-focused.md)
- **Components**: [Sync Engine Components](./10-component-sync-engine.md)
- **Components**: [Backend API Components](./11-component-backend-api.md)

## References

- [C4 Model: Container Diagram](https://c4model.com/diagrams/container)
- [Local-First Software](https://www.inkandswitch.com/local-first/)
- [CRDTs for Conflict Resolution](https://crdt.tech/)
- [Event Sourcing Patterns](https://martinfowler.com/eaaDev/EventSourcing.html)

