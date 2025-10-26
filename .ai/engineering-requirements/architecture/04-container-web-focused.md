# Level 2: Web App Focused Container Diagram

## Overview

This diagram zooms into the web app architecture, showing how it leverages Next.js 15 and React 19 while maintaining 90% code reuse with the desktop app through shared packages.

**Audience:** Web developers, frontend engineers

**Purpose:** Understand web app architecture, cloud-first patterns, and differences from desktop app.

## Diagram

```plantuml
@startuml KeyFlow Web Focused Containers
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

title Container Diagram for KeyFlow - Web App (Cloud-First Architecture)

Person(user, "User", "Types in browser")

System_Boundary(web_boundary, "Web App (Next.js 15)") {
    Container(nextjs_app, "Next.js App Router", "React 19 + Next.js 15", "Server-side rendering, routing, API routes. App Router for modern React patterns.")
    
    Container(react_pages, "React Pages", "React 19 Components", "Client-side pages: Home, Lesson, Practice, Drill, Challenge, Dashboard. Imports shared-ui components.")
    
    Container(shared_components, "Shared UI", "React 18 Components", "Imported from shared-ui package: TypingInterface, VirtualKeyboard, MetricsDisplay, ProgressChart. 90% reused from desktop.")
    
    Container(zustand_stores, "Zustand Stores", "Zustand State Management", "Same stores as desktop (100% reuse): useTypingStore, useProgressStore, useSettingsStore.")
    
    Container(shared_logic, "Business Logic", "TypeScript (shared-core)", "Same logic as desktop (100% reuse): InputValidator, MetricsCalculator, WeakSpotDetector, SessionManager.")
    
    Container(rest_adapters, "REST Adapters", "TypeScript API Client", "Platform-specific adapters: RESTStorageAdapter, APIClient. Implements StorageAdapter interface.")
    
    ContainerDb(browser_storage, "Browser Storage", "LocalStorage", "Optional temporary cache for metrics during session. Cleared on session end.")
}

System_Boundary(backend_boundary, "Backend (Cloud Required)") {
    Container(rest_api, "REST API", "Node.js + Express/Hono", "All operations require backend. Authentication, data persistence, sync.")
    
    ContainerDb(postgres, "PostgreSQL", "Cloud Database", "Primary data store. User accounts, sessions, progress, analytics.")
    
    ContainerDb(s3_storage, "Object Storage", "S3/R2", "Exercise content, exports, static assets.")
}

System_Ext(auth_provider, "Auth Provider", "Clerk/Supabase")
System_Ext(vercel, "Vercel CDN", "Deployment platform")

Rel(user, nextjs_app, "Uses", "Browser (HTTPS)")

' Hot path (< 5ms, no API calls)
Rel(nextjs_app, react_pages, "Renders", "SSR/Client")
Rel(react_pages, shared_components, "Imports", "ES modules")
Rel(shared_components, shared_logic, "Validates keystroke", "Function call (<0.1ms)")
Rel(react_pages, zustand_stores, "Updates state", "setState (<1ms)")

' Cold path (API calls)
Rel(zustand_stores, rest_adapters, "Saves session", "Debounced (500ms)")
Rel(rest_adapters, rest_api, "POST /api/sessions", "HTTPS/REST")
Rel(rest_api, postgres, "Saves", "SQL")
Rel(rest_api, s3_storage, "Stores files", "S3/R2 API")

' Authentication
Rel(nextjs_app, auth_provider, "Authenticates", "OAuth/HTTPS")
Rel(rest_api, auth_provider, "Verifies tokens", "JWT")

' Deployment
Rel(vercel, nextjs_app, "Hosts", "Edge network")

' Optional caching
Rel(shared_components, browser_storage, "Caches metrics", "Temporary")

note right of shared_components
  **HOT PATH (<5ms):**
  1. User keystroke
  2. Validate (pure function)
  3. Calculate WPM (memoized)
  4. Update UI (React)
  
  Same as desktop!
  90% code reuse
end note

note right of rest_adapters
  **COLD PATH (debounced):**
  1. Session complete
  2. Debounce 500ms
  3. POST to REST API
  4. Save to PostgreSQL
  
  Cloud required
  No offline mode
end note

SHOW_LEGEND()

@enduml
```

## Web Architecture Principles

### 1. Cloud-First Design

**Core Principle:** All data operations require backend API.

```
Priority 1: REST API (cloud, required)
Priority 2: PostgreSQL (immediate persistence)
Priority 3: Browser cache (temporary only)
```

**Constraints:**
- Requires internet connection
- No offline mode
- Higher latency than desktop (network round-trips)

**Benefits:**
- No local storage management
- Automatic cross-device sync
- Easier to implement (no sync conflicts)
- No data loss (cloud backup)

### 2. Maximum Code Reuse (90%)

**Pattern:** Import shared packages for UI and business logic.

```
packages/shared-ui/
  ├── TypingInterface      → Used by web (same as desktop)
  ├── VirtualKeyboard      → Used by web (same as desktop)
  ├── MetricsDisplay       → Used by web (same as desktop)
  └── ProgressChart        → Used by web (same as desktop)

packages/shared-core/
  ├── InputValidator       → Used by web (same as desktop)
  ├── MetricsCalculator    → Used by web (same as desktop)
  ├── WeakSpotDetector     → Used by web (same as desktop)
  └── SessionManager       → Used by web (same as desktop)
```

**Only 10% is platform-specific:**
- Storage adapter (REST vs Tauri)
- Deployment configuration
- Platform-specific optimizations

### 3. React 19 with React 18 Shared Components

**Strategy:** Web uses React 19, but shared components use React 18 APIs only.

```typescript
// ❌ NOT in shared components (React 19 only)
- Server Components
- Server Actions
- use() hook
- React.cache()

// ✅ OK in shared components (React 18 compatible)
- Client Components
- useState, useEffect, etc.
- Custom hooks
- React.memo, useMemo, useCallback
```

**Rationale:** Desktop uses React 18 (stable with Vite), so shared components must be compatible.

## Detailed Component Responsibilities

### Next.js App Router

**Technology:** Next.js 15 + React 19 + App Router

**Responsibilities:**
- Server-side rendering (SSR)
- Routing (`app/` directory structure)
- API routes (for server-side logic)
- Metadata management (SEO)
- Image optimization

**Performance Characteristics:**
- First Contentful Paint (FCP): <1.5s
- Time to Interactive (TTI): <3s
- Largest Contentful Paint (LCP): <2.5s

**App Router Structure:**
```
app/
  ├── page.tsx                 # Home page
  ├── layout.tsx               # Root layout
  ├── lesson/
  │   └── page.tsx             # Lesson mode
  ├── practice/
  │   └── page.tsx             # Practice mode
  ├── drill/
  │   └── page.tsx             # Drill mode
  ├── challenge/
  │   └── page.tsx             # Challenge mode
  ├── dashboard/
  │   └── page.tsx             # Progress dashboard
  └── api/
      └── auth/[...nextauth]/  # Auth routes (if using NextAuth)
```

### React Pages Layer

**Technology:** React 19 client components

**Responsibilities:**
- Page-level components
- Route-specific logic
- Import and compose shared components
- Handle authentication state
- Manage page-level state

**Code Example:**
```typescript
'use client';  // Client component for interactivity

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

### Shared UI Components

**Technology:** React 18 client components (imported from `@keyflow/shared-ui`)

**Responsibilities:**
- TypingInterface (main typing UI)
- VirtualKeyboard (finger guidance)
- MetricsDisplay (WPM, accuracy)
- ProgressChart (Recharts charts)
- VirtualKeyboard (keyboard visualization)

**Key Point:** Identical to desktop app (90% reuse).

### Zustand Stores

**Technology:** Zustand state management

**Responsibilities:**
- Application state (sessions, progress, settings)
- Same stores as desktop (100% reuse)
- Middleware: persistence (to REST API), logging

**Difference from Desktop:**
- Persistence middleware calls REST API (not Tauri)
- No offline queue (cloud-required)
- LocalStorage only for temporary cache

### Business Logic (Shared Core)

**Technology:** Pure TypeScript (from `@keyflow/shared-core`)

**Responsibilities:**
- Input validation
- Metrics calculation
- Weak spot detection
- Exercise generation

**Key Point:** 100% identical to desktop app.

### REST Adapters

**Technology:** TypeScript API client (Fetch/Axios)

**Responsibilities:**
- Implement `StorageAdapter` interface
- Make REST API calls
- Handle authentication (JWT tokens)
- Error handling (network errors, timeouts)

**Code Example:**
```typescript
class RESTStorageAdapter implements StorageAdapter {
  async save(key: string, data: any) {
    const response = await fetch('/api/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ key, data })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save data');
    }
  }
  
  async load(key: string) {
    const response = await fetch(`/api/storage/${key}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load data');
    }
    
    return response.json();
  }
}
```

### Browser Storage (Optional)

**Technology:** LocalStorage API

**Responsibilities:**
- Temporary metrics cache during active session
- User preferences (theme, settings)
- JWT token storage (if not using httpOnly cookies)

**Limitations:**
- 5-10 MB storage limit
- Synchronous API (blocks main thread)
- Not reliable (can be cleared by user/browser)

**Usage:**
```typescript
// ✅ OK: Temporary cache during session
localStorage.setItem('current_session_metrics', JSON.stringify(metrics));

// ❌ NOT OK: Long-term data storage
// Use REST API instead
```

## Performance Characteristics

### Keystroke Latency (Hot Path)

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Keystroke validation | <0.5ms | Same as desktop |
| WPM calculation | <0.5ms | Same as desktop |
| React setState | <1ms | Same as desktop |
| Browser rendering | <3ms | Browser overhead |
| **Total hot path** | **<5ms** | **Slightly slower than desktop** |

**Note:** 3-5ms slower than desktop due to browser overhead, but still excellent for typing app.

### API Operations (Cold Path)

| Operation | Target | Actual |
|-----------|--------|--------|
| POST session to API | <100ms | p95 latency |
| GET session history | <200ms | p95 latency |
| GET progress stats | <150ms | p95 latency |
| Authentication | <500ms | OAuth flow |

### Page Load Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | <1.5s | Chrome DevTools |
| Largest Contentful Paint (LCP) | <2.5s | Web Vitals |
| Time to Interactive (TTI) | <3s | Lighthouse |
| Cumulative Layout Shift (CLS) | <0.1 | Web Vitals |

## Data Flow: Complete Typing Session

### 1. Page Load
```
User navigates to /practice
  ↓
Next.js SSR renders page shell
  ↓
Client hydrates React components
  ↓
Fetch session data from REST API
  ↓
Render TypingInterface
```

### 2. Session Start
```
User clicks "Start Practice"
  ↓
React creates TypingSession instance (shared-core)
  ↓
Zustand stores session state
  ↓
Render typing interface
```

### 3. Typing (Hot Path, <5ms per keystroke)
```
User presses key
  ↓
React onKeyPress handler
  ↓
InputValidator.validate(key) [<0.1ms, same as desktop]
  ↓
MetricsCalculator.calculateWPM() [<0.1ms, same as desktop]
  ↓
Zustand setState() [<1ms, same as desktop]
  ↓
React re-render [<1ms, optimized]
  ↓
Browser painting [<3ms, browser overhead]
```

**NO API calls, NO localStorage writes**

### 4. Session End (Cold Path, API required)
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
RESTStorageAdapter.save()
  ↓
POST to /api/sessions [HTTPS, ~50ms]
  ↓
API saves to PostgreSQL [~10ms]
  ↓
Return success response
  ↓
Update UI (session saved)
```

### 5. Dashboard View
```
User navigates to /dashboard
  ↓
Next.js SSR renders loading state
  ↓
Client fetches data
  ↓
GET /api/sessions (last 30) [~100ms]
  ↓
GET /api/progress/stats [~50ms]
  ↓
Render charts (Recharts, downsampled)
```

## API Endpoints Used

### Authentication
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/me             # Current user
```

### Sessions
```
POST /api/sessions            # Save typing session
GET  /api/sessions/:id        # Get specific session
GET  /api/sessions            # List sessions (paginated)
DELETE /api/sessions/:id      # Delete session
```

### Progress
```
GET  /api/progress/stats      # Aggregate stats
GET  /api/progress/chart      # Chart data (downsampled)
GET  /api/progress/weak-keys  # Weak key analysis
```

### Exercises
```
GET  /api/exercises           # List exercises
GET  /api/exercises/:id       # Get specific exercise
```

### Export
```
GET  /api/export/csv          # Download sessions as CSV
GET  /api/export/json         # Download sessions as JSON
```

## Deployment Architecture

### Vercel Deployment

**Configuration:**
```json
// vercel.json
{
  "buildCommand": "turbo build --filter=web",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "regions": ["sfo1", "iad1"],  // US West + East
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.keyflow.app",
    "NEXT_PUBLIC_AUTH_PROVIDER": "clerk"
  }
}
```

**Features:**
- Edge network (global CDN)
- Automatic SSL certificates
- Preview deployments (per PR)
- Environment variables management
- Serverless functions (API routes)

### Performance Optimizations

#### 1. Code Splitting
```typescript
// Lazy load heavy components
const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false  // Client-only
});
```

#### 2. Image Optimization
```typescript
import Image from 'next/image';

<Image 
  src="/keyboard.png"
  width={800}
  height={400}
  alt="Virtual keyboard"
  priority={false}  // Lazy load
/>
```

#### 3. Font Optimization
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // FOUT strategy
});
```

#### 4. API Route Optimization
```typescript
// app/api/sessions/route.ts
export const runtime = 'edge';  // Edge runtime (faster)
export const dynamic = 'force-dynamic';  // No caching

export async function GET(request: Request) {
  // Handle request
}
```

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+ (desktop + mobile)
- ✅ Firefox 88+ (desktop + mobile)
- ✅ Safari 14+ (desktop + mobile)
- ✅ Edge 90+

### Required APIs
- ✅ ES2020+ features
- ✅ Fetch API
- ✅ LocalStorage
- ✅ Web Crypto API (for authentication)
- ✅ performance.now() (for latency measurement)

### Polyfills
```typescript
// Not required for supported browsers
// ES2020+ features natively supported
```

## Security Considerations

### Authentication
- JWT tokens in httpOnly cookies (CSRF protection)
- OAuth flow via Clerk/Supabase
- Token refresh on expiration

### API Security
- CORS configuration (restrict origins)
- Rate limiting (per user/IP)
- Input validation (prevent injection)
- HTTPS only (no HTTP)

### Data Privacy
- No sensitive data in localStorage
- Encrypted transmission (TLS)
- GDPR compliant (user data export/delete)

## Related Diagrams

- **Previous**: [Full System Container](./02-container-full-system.md)
- **Alternative**: [Desktop Container](./03-container-desktop-focused.md)
- **Related**: [Sync Architecture](./05-container-sync-architecture.md)
- **Components**: [Shared Core Components](./06-component-shared-core.md)

## References

- [C4 Model: Container Diagram](https://c4model.com/diagrams/container)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React 19 Documentation](https://react.dev/)
- [Vercel Deployment](https://vercel.com/docs)

