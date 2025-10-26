# Level 3: Sync Engine Components Diagram

## Overview

This diagram zooms into the sync engine components, detailing how KeyFlow implements local-first architecture with eventual consistency, conflict resolution, and offline queue management.

**Audience:** Backend developers, desktop developers, architects

**Purpose:** Understand sync mechanism internals, conflict resolution strategies, and queue management.

## Diagram

```plantuml
@startuml KeyFlow Sync Engine Components
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

title Component Diagram for KeyFlow - Sync Engine (Local-First)

Container_Boundary(sync_engine_boundary, "Sync Engine (packages/shared-core/sync)") {
    Component(sync_coordinator, "SyncCoordinator", "TypeScript Class", "Main orchestrator. Manages sync operations, retry logic, queue processing.")
    
    Component(offline_queue, "OfflineQueue", "TypeScript Class", "Persistent queue. Stores operations when offline. FIFO processing.")
    
    Component(conflict_resolver, "ConflictResolver", "TypeScript Class", "Resolves conflicts. Strategies: last-write-wins, field-level merge, user override.")
    
    Component(conflict_detector, "ConflictDetector", "TypeScript Class", "Detects conflicts by comparing timestamps. Returns conflict details.")
    
    Component(cache_manager, "CacheManager", "TypeScript Class", "Local cache. Stores merged data. Invalidation on sync.")
    
    Component(network_monitor, "NetworkMonitor", "TypeScript Class", "Detects online/offline. Triggers sync when back online.")
    
    Component(retry_scheduler, "RetryScheduler", "TypeScript Class", "Exponential backoff. Max 5 retries. 2s, 4s, 8s, 16s, 32s.")
}

Container_Ext(tauri_store, "Tauri Store", "Local Storage", "Desktop only")
Container_Ext(rest_api, "REST API", "Backend", "Cloud sync endpoint")
Container_Ext(session_manager, "SessionManager", "shared-core", "Calls sync after session end")

' Sync flow
Rel(session_manager, sync_coordinator, "queueSync()", "After session end")
Rel(sync_coordinator, offline_queue, "enqueue()", "Add operation")
Rel(network_monitor, sync_coordinator, "trigger", "When online")
Rel(sync_coordinator, offline_queue, "dequeue()", "Get pending")

' Sync to cloud
Rel(sync_coordinator, rest_api, "POST /api/sync/sessions", "Batch sync")
Rel(rest_api, sync_coordinator, "return conflicts", "If any")

' Conflict handling
Rel(sync_coordinator, conflict_detector, "detect()", "Compare timestamps")
Rel(conflict_detector, sync_coordinator, "return conflicts", "List")
Rel(sync_coordinator, conflict_resolver, "resolve()", "Merge data")
Rel(conflict_resolver, sync_coordinator, "return merged", "Resolved")

' Cache update
Rel(sync_coordinator, cache_manager, "update()", "Merged data")
Rel(cache_manager, tauri_store, "save()", "Persist cache")

' Retry logic
Rel(sync_coordinator, retry_scheduler, "schedule()", "On failure")
Rel(retry_scheduler, sync_coordinator, "retry()", "After backoff")

note right of sync_coordinator
  **State Machine:**
  1. Idle
  2. Syncing (processing queue)
  3. Conflict (resolving)
  4. Retry (exponential backoff)
  5. Success (done)
  
  Idempotent operations
end note

note right of conflict_resolver
  **Merge Strategies:**
  1. Last-Write-Wins (default)
     - Compare timestamps
     - Newer wins
  
  2. Field-Level Merge
     - Merge individual fields
     - Per-field timestamps
  
  3. User Override
     - Show dialog
     - User chooses
end note

SHOW_LEGEND()

@enduml
```

## Core Components Implementation

### SyncCoordinator

**Purpose:** Main orchestrator for sync operations.

```typescript
class SyncCoordinator {
  private isSyncing = false;
  private retryCount = 0;
  
  constructor(
    private queue: OfflineQueue,
    private resolver: ConflictResolver,
    private detector: ConflictDetector,
    private cache: CacheManager,
    private api: SyncAPI,
    private retryScheduler: RetryScheduler
  ) {}
  
  /**
   * Queue an operation for sync
   */
  async queueSync(operation: SyncOperation): Promise<void> {
    await this.queue.enqueue(operation);
    
    // Trigger sync if online
    if (this.isOnline()) {
      await this.processQueue();
    }
  }
  
  /**
   * Process sync queue (batch operations)
   */
  async processQueue(): Promise<void> {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    
    try {
      // Dequeue batch (max 10 operations)
      const operations = await this.queue.dequeue(10);
      
      if (operations.length === 0) {
        this.isSyncing = false;
        return;
      }
      
      // Batch sync to API
      const result = await this.api.batchSync({
        operations: operations.map(op => op.data),
        timestamp: Date.now()
      });
      
      // Handle conflicts
      if (result.conflicts.length > 0) {
        await this.handleConflicts(result.conflicts);
      }
      
      // Update cache with merged data
      await this.cache.updateBatch(result.merged);
      
      // Remove completed from queue
      await this.queue.removeCompleted(operations.map(op => op.id));
      
      // Reset retry count
      this.retryCount = 0;
      
    } catch (error) {
      // Schedule retry with exponential backoff
      await this.retryScheduler.schedule(
        () => this.processQueue(),
        this.retryCount++
      );
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Handle conflicts (detect + resolve)
   */
  private async handleConflicts(conflicts: Conflict[]): Promise<void> {
    const resolved = await Promise.all(
      conflicts.map(conflict => {
        // Detect conflict severity
        const severity = this.detector.analyzeSeverity(conflict);
        
        if (severity === 'minor') {
          // Auto-resolve with last-write-wins
          return this.resolver.lastWriteWins(conflict);
        } else {
          // User override required
          return this.resolver.userOverride(conflict);
        }
      })
    );
    
    // Save resolved data
    await this.cache.updateBatch(resolved);
  }
}
```

### OfflineQueue

**Purpose:** Persistent queue for offline operations.

```typescript
interface SyncOperation {
  id: string;
  type: 'sync_session' | 'sync_progress' | 'sync_settings';
  data: any;
  timestamp: number;
  attempts: number;
  status: 'pending' | 'in_progress' | 'failed' | 'completed';
  error?: string;
}

class OfflineQueue {
  private operations: SyncOperation[] = [];
  
  constructor(private storage: StorageAdapter) {
    this.loadFromStorage();
  }
  
  /**
   * Enqueue operation
   */
  async enqueue(operation: Omit<SyncOperation, 'id' | 'attempts' | 'status'>): Promise<void> {
    const op: SyncOperation = {
      ...operation,
      id: generateId(),
      attempts: 0,
      status: 'pending'
    };
    
    this.operations.push(op);
    await this.persist();
  }
  
  /**
   * Dequeue batch (FIFO)
   */
  async dequeue(limit: number): Promise<SyncOperation[]> {
    const pending = this.operations
      .filter(op => op.status === 'pending')
      .slice(0, limit);
    
    // Mark as in_progress
    pending.forEach(op => op.status = 'in_progress');
    await this.persist();
    
    return pending;
  }
  
  /**
   * Remove completed operations
   */
  async removeCompleted(ids: string[]): Promise<void> {
    this.operations = this.operations.filter(op => !ids.includes(op.id));
    await this.persist();
  }
  
  /**
   * Mark operation as failed
   */
  async markFailed(id: string, error: string): Promise<void> {
    const op = this.operations.find(o => o.id === id);
    if (op) {
      op.status = 'failed';
      op.error = error;
      op.attempts++;
      await this.persist();
    }
  }
  
  /**
   * Persist queue to storage
   */
  private async persist(): Promise<void> {
    await this.storage.save('sync-queue', {
      operations: this.operations,
      lastUpdated: Date.now()
    });
  }
  
  /**
   * Load queue from storage
   */
  private async loadFromStorage(): Promise<void> {
    const data = await this.storage.load('sync-queue');
    if (data) {
      this.operations = data.operations;
    }
  }
  
  /**
   * Get queue stats
   */
  getStats(): { pending: number; failed: number; total: number } {
    return {
      pending: this.operations.filter(op => op.status === 'pending').length,
      failed: this.operations.filter(op => op.status === 'failed').length,
      total: this.operations.length
    };
  }
}
```

### ConflictResolver

**Purpose:** Resolve conflicts using various strategies.

```typescript
interface Conflict {
  id: string;
  local: any;
  remote: any;
  conflictFields: string[];
  localTimestamp: number;
  remoteTimestamp: number;
}

class ConflictResolver {
  /**
   * Last-Write-Wins strategy (default)
   */
  lastWriteWins(conflict: Conflict): any {
    if (conflict.localTimestamp > conflict.remoteTimestamp) {
      return conflict.local;
    } else {
      return conflict.remote;
    }
  }
  
  /**
   * Field-Level Merge strategy
   */
  fieldLevelMerge(conflict: Conflict): any {
    const merged = { ...conflict.local };
    
    conflict.conflictFields.forEach(field => {
      const localFieldTimestamp = conflict.local[`${field}Modified`];
      const remoteFieldTimestamp = conflict.remote[`${field}Modified`];
      
      if (remoteFieldTimestamp > localFieldTimestamp) {
        merged[field] = conflict.remote[field];
        merged[`${field}Modified`] = remoteFieldTimestamp;
      }
    });
    
    return merged;
  }
  
  /**
   * User Override strategy (manual resolution)
   */
  async userOverride(conflict: Conflict): Promise<any> {
    // Show UI dialog (implementation depends on platform)
    const choice = await this.showConflictDialog(conflict);
    
    switch (choice.action) {
      case 'keep_local':
        return conflict.local;
      case 'keep_remote':
        return conflict.remote;
      case 'merge':
        return this.fieldLevelMerge(conflict);
      default:
        return this.lastWriteWins(conflict);
    }
  }
  
  /**
   * Show conflict resolution dialog (desktop/web)
   */
  private async showConflictDialog(conflict: Conflict): Promise<{
    action: 'keep_local' | 'keep_remote' | 'merge';
  }> {
    // Platform-specific implementation
    // Desktop: Native dialog
    // Web: Modal component
    return { action: 'keep_local' };
  }
}
```

### ConflictDetector

**Purpose:** Detect conflicts by comparing timestamps.

```typescript
class ConflictDetector {
  /**
   * Detect conflicts between local and remote data
   */
  detect(local: any, remote: any): Conflict | null {
    if (local.id !== remote.id) return null;
    
    // Same timestamps = no conflict
    if (local.lastModified === remote.lastModified) {
      return null;
    }
    
    // Find conflicting fields
    const conflictFields = this.findConflictingFields(local, remote);
    
    if (conflictFields.length === 0) {
      return null;
    }
    
    return {
      id: local.id,
      local,
      remote,
      conflictFields,
      localTimestamp: local.lastModified,
      remoteTimestamp: remote.lastModified
    };
  }
  
  /**
   * Find fields that differ
   */
  private findConflictingFields(local: any, remote: any): string[] {
    const fields: string[] = [];
    
    Object.keys(local).forEach(key => {
      if (key === 'id' || key === 'lastModified') return;
      
      if (JSON.stringify(local[key]) !== JSON.stringify(remote[key])) {
        fields.push(key);
      }
    });
    
    return fields;
  }
  
  /**
   * Analyze conflict severity
   */
  analyzeSeverity(conflict: Conflict): 'minor' | 'major' {
    // Minor: Only metadata fields (not user data)
    const minorFields = ['viewCount', 'lastViewed', 'isFavorite'];
    const isMinor = conflict.conflictFields.every(f => minorFields.includes(f));
    
    return isMinor ? 'minor' : 'major';
  }
}
```

### RetryScheduler

**Purpose:** Exponential backoff for failed sync operations.

```typescript
class RetryScheduler {
  private maxRetries = 5;
  private baseDelay = 2000;  // 2 seconds
  
  /**
   * Schedule retry with exponential backoff
   * Delays: 2s, 4s, 8s, 16s, 32s
   */
  async schedule(operation: () => Promise<void>, attemptNumber: number): Promise<void> {
    if (attemptNumber >= this.maxRetries) {
      console.error('Max retries reached, giving up');
      return;
    }
    
    const delay = this.baseDelay * Math.pow(2, attemptNumber);
    
    console.log(`Scheduling retry #${attemptNumber + 1} in ${delay}ms`);
    
    await this.sleep(delay);
    
    try {
      await operation();
    } catch (error) {
      // Will be handled by SyncCoordinator
      throw error;
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### NetworkMonitor

**Purpose:** Detect online/offline status and trigger sync.

```typescript
class NetworkMonitor {
  private isOnline = navigator.onLine;
  private listeners = new Set<() => void>();
  
  constructor() {
    // Browser events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnline = true;
    
    // Debounce to ensure stable connection
    setTimeout(() => {
      if (this.isOnline) {
        this.notifyListeners();
      }
    }, 2000);
  }
  
  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    console.log('Network offline detected');
  }
  
  /**
   * Subscribe to online events
   */
  onOnline(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  /**
   * Check if online
   */
  checkOnline(): boolean {
    return this.isOnline;
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    console.log('Network online, triggering sync');
    this.listeners.forEach(callback => callback());
  }
}
```

## Sync Flow Examples

### Normal Sync (No Conflicts)

```
1. User completes session
   ↓
2. SessionManager.endSession()
   ↓
3. SyncCoordinator.queueSync(session)
   ↓
4. OfflineQueue.enqueue(session)
   ↓
5. [Network online] NetworkMonitor triggers sync
   ↓
6. SyncCoordinator.processQueue()
   ↓
7. OfflineQueue.dequeue(10) → [session]
   ↓
8. POST /api/sync/sessions → Backend
   ↓
9. Backend saves to PostgreSQL
   ↓
10. Return { synced: [sessionId], conflicts: [] }
    ↓
11. CacheManager.update(merged data)
    ↓
12. OfflineQueue.removeCompleted([sessionId])
    ↓
✅ Success
```

### Sync with Conflict

```
1-7. Same as normal sync...
   ↓
8. POST /api/sync/sessions → Backend
   ↓
9. Backend detects conflict (session modified on another device)
   ↓
10. Return { synced: [], conflicts: [conflict] }
    ↓
11. ConflictDetector.detect(local, remote)
    ↓
12. ConflictResolver.lastWriteWins(conflict)
    ↓
13. POST /api/sync/resolve → Backend (resolved data)
    ↓
14. Backend saves resolved
    ↓
15. CacheManager.update(resolved)
    ↓
16. OfflineQueue.removeCompleted([sessionId])
    ↓
✅ Resolved
```

### Retry on Network Failure

```
1-7. Same as normal sync...
   ↓
8. POST /api/sync/sessions → Network timeout
   ↓
9. SyncCoordinator catches error
   ↓
10. RetryScheduler.schedule(retry, attemptNumber=0)
    ↓
11. Wait 2s (exponential backoff)
    ↓
12. Retry → Network timeout again
    ↓
13. RetryScheduler.schedule(retry, attemptNumber=1)
    ↓
14. Wait 4s
    ↓
15. Retry → Success!
    ↓
✅ Recovered
```

## Related Diagrams

- **Container**: [Sync Architecture Container](./05-container-sync-architecture.md)
- **Container**: [Desktop Focused](./03-container-desktop-focused.md)
- **Components**: [Shared Core](./06-component-shared-core.md)

## References

- [C4 Model: Component Diagram](https://c4model.com/diagrams/component)
- [Local-First Software](https://www.inkandswitch.com/local-first/)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [Conflict-Free Replicated Data Types (CRDTs)](https://crdt.tech/)

