# Level 3: Desktop React Components Diagram

## Overview

This diagram shows the React component hierarchy and state management for the desktop app, demonstrating how platform-specific adapters enable local-first architecture while reusing 90% of code.

**Audience:** Desktop developers, React developers

**Purpose:** Understand desktop-specific React architecture and Tauri integration.

## Diagram

```plantuml
@startuml KeyFlow Desktop React Components
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

title Component Diagram for KeyFlow - Desktop App React Components

Container_Boundary(react_app, "React App (Vite + React 18)") {
    Component(app_router, "AppRouter", "React Component", "Main routing component. Routes: /, /lesson, /practice, /drill, /challenge, /dashboard, /settings")
    
    Component(home_page, "HomePage", "React Component", "Landing page. Mode selection, quick stats, continue session.")
    
    Component(lesson_page, "LessonPage", "React Component", "Lesson mode UI. Structured progression, finger guidance.")
    
    Component(practice_page, "PracticePage", "React Component", "Practice mode UI. Customizable tests, timed sessions.")
    
    Component(drill_page, "DrillPage", "React Component", "Drill mode UI. Weak key targeting, real words.")
    
    Component(challenge_page, "ChallengePage", "React Component", "Challenge mode UI. Daily challenges, leaderboard.")
    
    Component(dashboard_page, "DashboardPage", "React Component", "Progress dashboard. Charts, stats, weak keys.")
    
    Component(settings_page, "SettingsPage", "React Component", "Settings UI. Preferences, themes, account.")
}

Container_Boundary(shared_ui, "Shared UI (from packages/shared-ui)") {
    Component(typing_interface, "TypingInterface", "React Component", "Core typing UI. Real-time validation, metrics display.")
    
    Component(virtual_keyboard, "VirtualKeyboard", "React Component", "Visual keyboard. Finger guidance, key highlighting.")
    
    Component(metrics_display, "MetricsDisplay", "React Component", "WPM, accuracy, errors. Real-time updates.")
    
    Component(progress_chart, "ProgressChart", "React Component", "Recharts charts. WPM over time, downsampled.")
}

Container_Boundary(state_mgmt, "State Management (Zustand)") {
    Component(typing_store, "useTypingStore", "Zustand Store", "Session state, metrics, current exercise.")
    
    Component(progress_store, "useProgressStore", "Zustand Store", "Session history, stats, weak keys.")
    
    Component(settings_store, "useSettingsStore", "Zustand Store", "User preferences, theme, audio settings.")
    
    Component(sync_store, "useSyncStore", "Zustand Store", "Sync queue, online status, conflicts.")
}

Container_Boundary(adapters, "Platform Adapters (Tauri)") {
    Component(tauri_storage, "TauriStorageAdapter", "TypeScript Class", "Implements StorageAdapter. Calls Tauri commands via IPC.")
    
    Component(tauri_fs, "TauriFileSystemAdapter", "TypeScript Class", "File operations. Export CSV/JSON, file picker.")
    
    Component(tauri_window, "TauriWindowAdapter", "TypeScript Class", "Window management. Resize, minimize, fullscreen.")
}

Container_Boundary(rust_backend, "Rust Backend (Tauri)") {
    Component(storage_cmd, "save_data / load_data", "Tauri Command", "File system operations. Read/write JSON.")
    
    Component(fs_cmd, "export_file / select_file", "Tauri Command", "File picker, export operations.")
    
    Component(window_cmd, "window_management", "Tauri Command", "Window APIs. Native OS integration.")
}

ContainerDb_Ext(tauri_store_fs, "Tauri Store", "File System", "Local JSON files")

' Page routing
Rel(app_router, home_page, "Routes to", "/")
Rel(app_router, lesson_page, "Routes to", "/lesson")
Rel(app_router, practice_page, "Routes to", "/practice")
Rel(app_router, dashboard_page, "Routes to", "/dashboard")

' Shared UI usage (90% reuse)
Rel(lesson_page, typing_interface, "Renders", "Import")
Rel(practice_page, typing_interface, "Renders", "Import")
Rel(lesson_page, virtual_keyboard, "Renders", "Import")
Rel(dashboard_page, progress_chart, "Renders", "Import")

' State management
Rel(typing_interface, typing_store, "Uses", "Zustand hook")
Rel(dashboard_page, progress_store, "Uses", "Zustand hook")
Rel(settings_page, settings_store, "Uses", "Zustand hook")

' Adapters
Rel(typing_store, tauri_storage, "save() / load()", "Debounced")
Rel(settings_page, tauri_fs, "exportData()", "User action")
Rel(settings_page, tauri_window, "toggleFullscreen()", "User action")

' IPC to Rust
Rel(tauri_storage, storage_cmd, "invoke('save_data')", "IPC")
Rel(tauri_fs, fs_cmd, "invoke('export_file')", "IPC")
Rel(tauri_window, window_cmd, "invoke('resize_window')", "IPC")

' Rust to file system
Rel(storage_cmd, tauri_store_fs, "fs::write()", "File I/O")

SHOW_LEGEND()

@enduml
```

## Key Architecture Patterns

### 1. Page-Based Routing

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lesson" element={<LessonPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/drill" element={<DrillPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. Shared UI Component Usage (90% Reuse)

```typescript
// src/pages/PracticePage.tsx
import { TypingInterface, MetricsDisplay } from '@keyflow/shared-ui';
import { useTypingStore } from '@/stores/typingStore';

export function PracticePage() {
  const { session, startSession, processKeystroke } = useTypingStore();
  
  return (
    <div className="practice-page">
      <TypingInterface 
        session={session}
        onKeystroke={processKeystroke}
      />
      <MetricsDisplay metrics={session?.metrics} />
    </div>
  );
}
```

### 3. Zustand Store with Tauri Adapter

```typescript
// src/stores/typingStore.ts
import { create } from 'zustand';
import { TauriStorageAdapter } from '@/adapters/TauriStorageAdapter';

const storage = new TauriStorageAdapter();

export const useTypingStore = create<TypingState>((set, get) => ({
  session: null,
  metrics: null,
  
  startSession: async (exercise) => {
    const session = new TypingSession(exercise);
    set({ session });
  },
  
  processKeystroke: (key) => {
    const session = get().session;
    const event = session.processKeystroke(key);
    set({ metrics: event.metrics });
  },
  
  endSession: async () => {
    const session = get().session;
    const result = session.end();
    
    // Save to Tauri Store (debounced)
    await storage.save(`session:${session.id}`, result);
    
    set({ session: null });
  }
}));
```

### 4. Platform Adapter Implementation

```typescript
// src/adapters/TauriStorageAdapter.ts
import { invoke } from '@tauri-apps/api/tauri';
import type { StorageAdapter } from '@keyflow/shared-types';

export class TauriStorageAdapter implements StorageAdapter {
  async save(key: string, data: any): Promise<void> {
    await invoke('save_data', { key, data });
  }
  
  async load(key: string): Promise<any> {
    return invoke('load_data', { key });
  }
  
  async delete(key: string): Promise<void> {
    await invoke('delete_data', { key });
  }
  
  async clear(): Promise<void> {
    await invoke('clear_all_data');
  }
}
```

## Component Responsibilities

### Pages (Presentation Layer)

| Page | Responsibility | Shared Components Used |
|------|---------------|------------------------|
| HomePage | Mode selection, quick stats | MetricsDisplay |
| LessonPage | Structured lessons, finger guidance | TypingInterface, VirtualKeyboard |
| PracticePage | Timed tests, customizable | TypingInterface, MetricsDisplay |
| DrillPage | Weak key targeting | TypingInterface, VirtualKeyboard |
| ChallengePage | Daily challenges | TypingInterface |
| DashboardPage | Progress charts, analytics | ProgressChart, StatisticsDisplay |
| SettingsPage | User preferences | SettingsForm |

### Zustand Stores (State Management)

```typescript
// useTypingStore
interface TypingState {
  session: TypingSession | null;
  metrics: Metrics | null;
  exercise: Exercise | null;
  
  startSession: (exercise: Exercise) => void;
  processKeystroke: (key: string) => void;
  endSession: () => Promise<void>;
}

// useProgressStore
interface ProgressState {
  sessions: TypingSession[];
  stats: ProgressStats;
  weakKeys: WeakKeyAnalysis[];
  
  loadSessions: () => Promise<void>;
  getStats: () => ProgressStats;
}

// useSettingsStore
interface SettingsState {
  theme: 'light' | 'dark';
  audioEnabled: boolean;
  keyboardVisible: boolean;
  
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

// useSyncStore
interface SyncState {
  isOnline: boolean;
  syncQueue: SyncOperation[];
  lastSync: Date | null;
  
  sync: () => Promise<void>;
  checkOnline: () => boolean;
}
```

### Platform Adapters

```typescript
// TauriStorageAdapter
class TauriStorageAdapter implements StorageAdapter {
  // File system storage via Tauri commands
}

// TauriFileSystemAdapter
class TauriFileSystemAdapter {
  async exportCSV(data: any[]): Promise<void>;
  async exportJSON(data: any): Promise<void>;
  async selectFile(): Promise<string>;
}

// TauriWindowAdapter
class TauriWindowAdapter {
  async minimize(): Promise<void>;
  async toggleFullscreen(): Promise<void>;
  async setSize(width: number, height: number): Promise<void>;
}
```

## Data Flow Example: Complete Session

```
1. User clicks "Start Practice"
   ↓
2. PracticePage calls useTypingStore.startSession()
   ↓
3. Store creates TypingSession (shared-core)
   ↓
4. TypingInterface renders with session
   ↓
5. User types → TypingInterface.onKeyPress
   ↓
6. Store.processKeystroke() [HOT PATH, <2ms]
   ↓
7. React re-renders with new metrics
   ↓
8. User finishes → Store.endSession()
   ↓
9. TauriStorageAdapter.save() [COLD PATH, debounced]
   ↓
10. invoke('save_data') → Rust command
    ↓
11. Rust writes to file system
    ↓
12. SyncStore queues sync operation
```

## Related Diagrams

- **Container**: [Desktop Focused Container](./03-container-desktop-focused.md)
- **Alternative**: [Web Next.js Components](./09-component-web-nextjs.md)
- **Shared**: [Shared Core Components](./06-component-shared-core.md)

## References

- [C4 Model: Component Diagram](https://c4model.com/diagrams/component)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tauri Commands](https://tauri.app/v1/guides/features/command)

