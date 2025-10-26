# Level 3: Web Next.js Components Diagram

## Overview

This diagram shows the Next.js 15 app architecture, demonstrating how the web app reuses 90% of code through shared packages while implementing cloud-first patterns.

**Audience:** Web developers, Next.js developers

**Purpose:** Understand web-specific architecture and differences from desktop.

## Diagram

```plantuml
@startuml KeyFlow Web Next.js Components
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

title Component Diagram for KeyFlow - Web App (Next.js 15)

Container_Boundary(nextjs_app, "Next.js App (React 19)") {
    Component(root_layout, "RootLayout", "Server Component", "Root layout with metadata, fonts, providers.")
    
    Component(home_page_server, "app/page.tsx", "Server Component", "Home page (SSR). Mode cards, quick stats.")
    
    Component(lesson_page_client, "app/lesson/page.tsx", "Client Component", "Lesson mode. Imports TypingInterface.")
    
    Component(practice_page_client, "app/practice/page.tsx", "Client Component", "Practice mode. Imports TypingInterface.")
    
    Component(dashboard_page_client, "app/dashboard/page.tsx", "Client Component", "Dashboard. Fetches data from API.")
    
    Component(settings_page_client, "app/settings/page.tsx", "Client Component", "Settings UI.")
}

Container_Boundary(shared_ui_web, "Shared UI (90% reuse)") {
    Component(typing_interface_shared, "TypingInterface", "React Component", "Same as desktop. React 18 client component.")
    
    Component(virtual_keyboard_shared, "VirtualKeyboard", "React Component", "Same as desktop.")
    
    Component(progress_chart_shared, "ProgressChart", "React Component", "Same as desktop. Lazy loaded on web.")
}

Container_Boundary(state_web, "State Management") {
    Component(typing_store_web, "useTypingStore", "Zustand Store", "Same stores as desktop (100% reuse).")
    
    Component(progress_store_web, "useProgressStore", "Zustand Store", "Same as desktop.")
    
    Component(auth_store, "useAuthStore", "Zustand Store", "Auth state, JWT tokens.")
}

Container_Boundary(adapters_web, "Platform Adapters (REST)") {
    Component(rest_storage, "RESTStorageAdapter", "TypeScript Class", "Implements StorageAdapter. Calls REST API.")
    
    Component(api_client, "APIClient", "TypeScript Class", "Axios/Fetch wrapper. Auth, error handling.")
}

Container_Ext(rest_api, "REST API", "Backend", "Node.js + Express/Hono")
ContainerDb_Ext(postgres, "PostgreSQL", "Cloud Database")

' Page routing
Rel(root_layout, home_page_server, "Renders", "App Router")
Rel(root_layout, lesson_page_client, "Renders", "/lesson")
Rel(root_layout, practice_page_client, "Renders", "/practice")
Rel(root_layout, dashboard_page_client, "Renders", "/dashboard")

' Shared UI usage (90% reuse)
Rel(lesson_page_client, typing_interface_shared, "Imports", "Same as desktop!")
Rel(practice_page_client, typing_interface_shared, "Imports", "Same as desktop!")
Rel(dashboard_page_client, progress_chart_shared, "Imports", "Lazy loaded")

' State management
Rel(typing_interface_shared, typing_store_web, "Uses", "Zustand hook")
Rel(dashboard_page_client, progress_store_web, "Uses", "Zustand hook")
Rel(settings_page_client, auth_store, "Uses", "Auth state")

' Adapters
Rel(typing_store_web, rest_storage, "save() / load()", "Debounced")
Rel(rest_storage, api_client, "request()", "HTTPS")
Rel(api_client, rest_api, "POST /api/sessions", "REST API")
Rel(rest_api, postgres, "INSERT", "SQL")

SHOW_LEGEND()

@enduml
```

## Key Differences from Desktop

### 1. Server Components vs Client Components

```typescript
// app/page.tsx (Server Component)
export default async function HomePage() {
  // Can fetch data directly (no API call from client)
  const stats = await getQuickStats();
  
  return (
    <div>
      <h1>KeyFlow</h1>
      <QuickStats data={stats} />
      <ModeSelector />
    </div>
  );
}

// app/practice/page.tsx (Client Component)
'use client';  // Required for interactivity

import { TypingInterface } from '@keyflow/shared-ui';
import { useTypingStore } from '@/stores/typingStore';

export default function PracticePage() {
  const { session, startSession } = useTypingStore();
  
  return (
    <TypingInterface 
      session={session}
      onStart={startSession}
    />
  );
}
```

### 2. RESTStorageAdapter vs TauriStorageAdapter

```typescript
// apps/web/src/adapters/RESTStorageAdapter.ts
import type { StorageAdapter } from '@keyflow/shared-types';
import { apiClient } from './apiClient';

export class RESTStorageAdapter implements StorageAdapter {
  async save(key: string, data: any): Promise<void> {
    await apiClient.post('/api/storage', {
      key,
      data,
      timestamp: Date.now()
    });
  }
  
  async load(key: string): Promise<any> {
    const response = await apiClient.get(`/api/storage/${key}`);
    return response.data;
  }
  
  async delete(key: string): Promise<void> {
    await apiClient.delete(`/api/storage/${key}`);
  }
  
  async clear(): Promise<void> {
    await apiClient.delete('/api/storage/clear');
  }
}

// Compare to Desktop (TauriStorageAdapter)
export class TauriStorageAdapter implements StorageAdapter {
  async save(key: string, data: any): Promise<void> {
    await invoke('save_data', { key, data });  // IPC, not HTTP
  }
  // ...
}
```

**Same interface, different implementation = 90% code reuse!**

### 3. Cloud-Required vs Offline-Optional

```typescript
// Desktop: Offline-first
const store = create<TypingState>((set) => ({
  async endSession() {
    // 1. Save locally (immediate, offline-safe)
    await localStorage.save(session);
    
    // 2. Queue for sync (background, when online)
    syncQueue.enqueue(session);
  }
}));

// Web: Cloud-required
const store = create<TypingState>((set) => ({
  async endSession() {
    // Must POST to API (requires internet)
    await restStorage.save(session);
    
    // No offline mode
  }
}));
```

## App Router Structure

```
apps/web/
└── app/
    ├── layout.tsx              # Root layout (Server Component)
    ├── page.tsx                # Home page (Server Component)
    ├── providers.tsx           # Client providers (Zustand, Auth)
    ├── lesson/
    │   └── page.tsx            # Lesson mode (Client Component)
    ├── practice/
    │   └── page.tsx            # Practice mode (Client Component)
    ├── drill/
    │   └── page.tsx            # Drill mode (Client Component)
    ├── challenge/
    │   └── page.tsx            # Challenge mode (Client Component)
    ├── dashboard/
    │   ├── page.tsx            # Dashboard (Client Component)
    │   └── loading.tsx         # Loading state
    ├── settings/
    │   └── page.tsx            # Settings (Client Component)
    └── api/                    # API routes (optional, for BFF pattern)
        └── auth/
            └── [...nextauth]/
                └── route.ts
```

## Component Implementation Examples

### Root Layout (Server Component)

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'KeyFlow - Native Typing Tutor',
  description: 'The fastest typing tutor for speed seekers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Client Providers

```typescript
// app/providers.tsx
'use client';

import { ClerkProvider } from '@clerk/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
```

### Practice Page (Client Component)

```typescript
// app/practice/page.tsx
'use client';

import { TypingInterface, MetricsDisplay } from '@keyflow/shared-ui';
import { useTypingStore } from '@/stores/typingStore';
import { useEffect } from 'react';

export default function PracticePage() {
  const { 
    session, 
    exercise,
    startSession, 
    processKeystroke,
    loadExercise
  } = useTypingStore();
  
  useEffect(() => {
    // Load exercise from API
    loadExercise('common_words_60s');
  }, []);
  
  if (!exercise) {
    return <div>Loading exercise...</div>;
  }
  
  return (
    <div className="practice-page">
      <TypingInterface 
        session={session}
        exercise={exercise}
        onKeystroke={processKeystroke}
      />
      <MetricsDisplay metrics={session?.metrics} />
    </div>
  );
}
```

### Dashboard Page (Client Component with Data Fetching)

```typescript
// app/dashboard/page.tsx
'use client';

import { ProgressChart, StatisticsDisplay } from '@keyflow/shared-ui';
import { useProgressStore } from '@/stores/progressStore';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy load chart (large bundle)
const ProgressChartLazy = dynamic(
  () => import('@keyflow/shared-ui').then(mod => mod.ProgressChart),
  { ssr: false, loading: () => <div>Loading chart...</div> }
);

export default function DashboardPage() {
  const { sessions, stats, loadSessions, getStats } = useProgressStore();
  
  useEffect(() => {
    // Fetch from API
    loadSessions();
  }, []);
  
  if (!sessions) {
    return <div>Loading dashboard...</div>;
  }
  
  return (
    <div className="dashboard-page">
      <StatisticsDisplay stats={stats} />
      <ProgressChartLazy data={sessions} />
    </div>
  );
}
```

## Zustand Store with REST Adapter

```typescript
// src/stores/typingStore.ts
import { create } from 'zustand';
import { RESTStorageAdapter } from '@/adapters/RESTStorageAdapter';
import { TypingSession, Exercise } from '@keyflow/shared-core';

const storage = new RESTStorageAdapter();

interface TypingState {
  session: TypingSession | null;
  exercise: Exercise | null;
  metrics: Metrics | null;
  
  loadExercise: (type: string) => Promise<void>;
  startSession: () => void;
  processKeystroke: (key: string) => void;
  endSession: () => Promise<void>;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  session: null,
  exercise: null,
  metrics: null,
  
  async loadExercise(type) {
    // Fetch from REST API
    const exercise = await storage.load(`exercise:${type}`);
    set({ exercise });
  },
  
  startSession() {
    const { exercise } = get();
    if (!exercise) return;
    
    const session = new TypingSession(exercise);
    set({ session });
  },
  
  processKeystroke(key) {
    const { session } = get();
    if (!session) return;
    
    // HOT PATH: Same as desktop (<5ms)
    const event = session.processKeystroke(key);
    set({ metrics: event.metrics });
  },
  
  async endSession() {
    const { session } = get();
    if (!session) return;
    
    const result = session.end();
    
    // COLD PATH: POST to API (cloud-required)
    await storage.save(`session:${session.id}`, result);
    
    set({ session: null });
  }
}));
```

## API Client Wrapper

```typescript
// src/adapters/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

## Performance Optimizations

### 1. Lazy Loading

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const ProgressChart = dynamic(
  () => import('@keyflow/shared-ui').then(m => m.ProgressChart),
  { ssr: false }  // Client-only
);
```

### 2. Image Optimization

```typescript
import Image from 'next/image';

<Image 
  src="/keyboard.png"
  width={800}
  height={400}
  alt="Keyboard"
  priority={false}  // Lazy load
/>
```

### 3. Font Optimization

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // FOUT strategy
  variable: '--font-inter'
});
```

## Deployment Configuration

### vercel.json

```json
{
  "buildCommand": "turbo build --filter=web",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "regions": ["sfo1", "iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.keyflow.app",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "pk_..."
  }
}
```

## Code Reuse Summary

### Shared (90%)
- ✅ All UI components (`@keyflow/shared-ui`)
- ✅ All business logic (`@keyflow/shared-core`)
- ✅ All TypeScript types (`@keyflow/shared-types`)
- ✅ Zustand store logic (100% reused)

### Platform-Specific (10%)
- ❌ Storage adapter (REST vs Tauri)
- ❌ App Router structure (Next.js specific)
- ❌ Server Components (Next.js feature)
- ❌ Deployment configuration

## Related Diagrams

- **Container**: [Web Focused Container](./04-container-web-focused.md)
- **Alternative**: [Desktop React Components](./08-component-desktop-react.md)
- **Shared**: [Shared Core Components](./06-component-shared-core.md)

## References

- [C4 Model: Component Diagram](https://c4model.com/diagrams/component)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

