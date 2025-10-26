# Level 2: Full System Container Diagram

## Overview

This diagram shows all containers (applications and data stores) in the KeyFlow system and how they interact. It provides the master view of the complete architecture, showing technology choices and communication patterns.

**Audience:** Technical team (architects, developers, DevOps)

**Purpose:** Understand the complete system architecture and how all pieces fit together.

## Diagram

```plantuml
@startuml KeyFlow Full System Containers
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

title Container Diagram for KeyFlow - Full System

Person(user, "User", "Speed seeker practicing typing")

System_Boundary(keyflow_boundary, "KeyFlow System") {
    Container(desktop_app, "Desktop App", "Tauri 2.0 + React 18 + Vite", "Native typing interface with <2ms latency. Works 100% offline with optional cloud sync.")
    Container(web_app, "Web App", "Next.js 15 + React 19", "Browser-based typing interface. Requires internet, cloud-only storage.")
    
    Container(shared_packages, "Shared Packages", "TypeScript + React 18", "Monorepo packages: shared-ui (components), shared-core (business logic), shared-types (TypeScript definitions). 90% code reuse between desktop and web.")
    
    Container(backend_api, "REST API Backend", "Node.js + Express/Hono", "Cloud sync, authentication, data aggregation. Handles all web app operations and optional desktop sync.")
    
    ContainerDb(postgres, "PostgreSQL Database", "PostgreSQL", "User data, typing sessions, progress, analytics. Cloud storage for web app and desktop sync.")
    
    ContainerDb(s3_storage, "Object Storage", "AWS S3 or Cloudflare R2", "Exercise content library, user data exports, static assets.")
    
    ContainerDb(tauri_store, "Tauri Local Store", "File System (JSON)", "Desktop offline storage. Primary data store for desktop app. 100% functional offline.")
}

System_Ext(auth_provider, "Auth Provider", "Clerk or Supabase Auth")
System_Ext(analytics, "Analytics", "PostHog or Umami")
System_Ext(payment, "Payment", "Stripe")

Rel(user, desktop_app, "Uses", "Native app")
Rel(user, web_app, "Uses", "Browser")

Rel(desktop_app, shared_packages, "Imports", "TypeScript imports")
Rel(web_app, shared_packages, "Imports", "TypeScript imports")

Rel(desktop_app, tauri_store, "Reads/Writes", "IPC (coarse-grained, debounced)")
Rel(desktop_app, backend_api, "Syncs data (optional)", "HTTPS/REST API")
Rel(web_app, backend_api, "All operations (required)", "HTTPS/REST API")

Rel(backend_api, postgres, "Reads/Writes", "SQL queries")
Rel(backend_api, s3_storage, "Reads/Writes", "S3/R2 API")
Rel(backend_api, auth_provider, "Authenticates", "OAuth/HTTPS")
Rel(backend_api, analytics, "Sends metrics", "HTTPS")
Rel(backend_api, payment, "Process payments", "Stripe API")

SHOW_LEGEND()

@enduml
```

## Key Containers

### Application Containers

| Container | Technology | Responsibility | Performance | Storage |
|-----------|-----------|----------------|-------------|---------|
| **Desktop App** | Tauri 2.0 + React 18 + Vite | Native typing interface, local-first architecture | <2ms keystroke latency, <0.5s startup | Tauri Store (local) |
| **Web App** | Next.js 15 + React 19 | Browser-based typing interface, cloud-required | <5ms keystroke latency, <1.5s FCP | PostgreSQL (cloud) |
| **Shared Packages** | TypeScript + React 18 | Business logic, UI components, type definitions | N/A (imported) | N/A |
| **REST API Backend** | Node.js + Express/Hono | Authentication, data sync, API endpoints | <100ms p95 response | PostgreSQL + S3 |

### Data Store Containers

| Container | Technology | Purpose | Access Pattern | Availability |
|-----------|-----------|---------|----------------|--------------|
| **PostgreSQL** | PostgreSQL (Supabase/Neon) | User accounts, sessions, progress, analytics | SQL queries via Prisma ORM | Cloud only |
| **S3/R2 Storage** | AWS S3 or Cloudflare R2 | Exercise content, exports, static files | REST API (S3/R2) | Cloud only |
| **Tauri Store** | File system (JSON) | Desktop local storage, offline functionality | File I/O via Tauri commands | Desktop only |

## Critical Architecture Patterns

### 1. Monorepo with Shared Packages (90% Code Reuse)

**Pattern:** Desktop and web apps import from shared packages to maximize code reuse.

```
packages/
  shared-ui/        → Used by desktop & web (UI components)
  shared-core/      → Used by desktop & web (business logic)
  shared-types/     → Used by everything (TypeScript types)

apps/
  desktop/          → Imports shared packages
  web/              → Imports shared packages (same code!)
```

**Benefits:**
- 90% of code written once, used twice
- Bug fixes propagate to both platforms
- Consistent business logic and UX
- Faster development

### 2. Local-First Architecture (Desktop)

**Pattern:** Desktop app stores data locally first, syncs to cloud optionally.

```
User Action → Desktop App → Tauri Store (immediate, offline)
                          → Sync Queue (background, when online)
                          → REST API (eventually)
```

**Benefits:**
- 100% offline functional
- Fast operations (no network latency)
- Data ownership (local storage)
- Resilient to network issues

### 3. Cloud-First Architecture (Web)

**Pattern:** Web app requires cloud backend for all operations.

```
User Action → Web App → REST API (required)
                      → PostgreSQL (immediate)
```

**Constraints:**
- Requires internet connection
- Higher latency than desktop
- No offline mode

### 4. Adapter Pattern for Storage

**Pattern:** Platform-specific storage adapters implement common interface.

```typescript
interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
}

// Desktop uses Tauri adapter
TauriStorageAdapter → Tauri Store (local)

// Web uses REST adapter  
RESTStorageAdapter → REST API → PostgreSQL
```

**Benefits:**
- Shared business logic doesn't know about platform
- Easy to test with mock adapters
- Platform-specific optimizations possible

## Data Flow Examples

### Desktop Typing Session (Offline)

```
1. User types keystroke
   ↓
2. React validates (shared-core, <0.1ms)
   ↓
3. Calculate WPM/accuracy (shared-core, <0.1ms)
   ↓
4. Update UI (React setState, <1ms)
   ↓
5. [Background] Save to Tauri Store (debounced, 500ms)
   ↓
6. [Background] Queue for sync (when online)
```

**Total latency: <2ms (hot path, no IPC)**

### Web Typing Session

```
1. User types keystroke
   ↓
2. React validates (shared-core, <0.1ms)
   ↓
3. Calculate WPM/accuracy (shared-core, <0.1ms)
   ↓
4. Update UI (React setState, <1ms)
   ↓
5. [Background] POST to REST API (debounced, 500ms)
   ↓
6. API saves to PostgreSQL
```

**Total latency: <5ms (hot path, browser-based)**

### Desktop Sync to Cloud

```
1. User completes session
   ↓
2. Save to Tauri Store (immediate)
   ↓
3. Add to sync queue
   ↓
4. [Background] POST to REST API
   ↓
5. API merges with cloud data (conflict resolution)
   ↓
6. Save to PostgreSQL
```

**Sync happens in background, doesn't block user**

## Technology Choices Rationale

### Desktop: Tauri 2.0 vs Electron

| Metric | Tauri | Electron | Winner |
|--------|-------|----------|--------|
| Bundle Size | 12 MB | 180 MB | ⭐ Tauri (12-30x smaller) |
| Startup Time | 0.3s | 1.5s | ⭐ Tauri (4-10x faster) |
| Keystroke Latency | 2ms | 8ms | ⭐ Tauri (4x lower) |
| Memory Usage | 60 MB | 350 MB | ⭐ Tauri (6-10x less) |
| Learning Curve | Rust + React | JavaScript only | Electron |

**Decision:** Tauri for superior performance metrics critical for typing app.

### Web: Next.js 15 vs Create React App

| Feature | Next.js | CRA | Winner |
|---------|---------|-----|--------|
| Performance | Excellent (App Router) | Good | ⭐ Next.js |
| SEO | Built-in | Manual | ⭐ Next.js |
| Deployment | Vercel (optimized) | Manual | ⭐ Next.js |
| React Version | React 19 | React 18 | ⭐ Next.js |

**Decision:** Next.js for modern React, better performance, and easier deployment.

### Backend: Express vs Hono

| Feature | Express | Hono | Decision |
|---------|---------|------|----------|
| Performance | Good | Excellent | Evaluate in testing |
| Ecosystem | Mature | Growing | TBD |
| TypeScript | Good | Native | TBD |

**Decision:** Evaluate both, likely Hono for performance.

## Deployment Architecture

### Desktop App
- **Platform:** macOS (MVP), Windows/Linux (v1.1+)
- **Distribution:** .dmg installer, auto-updates (Tauri updater)
- **Code Signing:** Apple Developer account required

### Web App
- **Platform:** Vercel (production + preview)
- **CDN:** Vercel Edge Network
- **Environment:** Node.js runtime

### Backend API
- **Platform:** Railway, Render, or Fly.io
- **Database:** Supabase (PostgreSQL) or Neon
- **Storage:** Cloudflare R2 (cheaper than S3)
- **Monitoring:** Error tracking (Sentry), logs (native)

## Scaling Considerations

### MVP (0-1,000 users)
- Single backend instance
- Database: Basic tier (Supabase)
- Storage: R2 (pay-as-you-go)
- Cost: ~$50/month

### Growth (1,000-10,000 users)
- Horizontal scaling: Multiple backend instances
- Database: Production tier with replicas
- CDN: Cloudflare for static assets
- Cost: ~$200/month

### Scale (10,000+ users)
- Auto-scaling backend (Kubernetes or serverless)
- Database: Connection pooling, read replicas
- Caching: Redis for hot data
- Cost: ~$1,000+/month

## Security Boundaries

### Authentication
- Handled by Clerk or Supabase Auth (proven solutions)
- No custom auth implementation
- JWT tokens for API access

### Data Encryption
- At rest: PostgreSQL encryption (Supabase default)
- In transit: HTTPS/TLS only
- Local storage: File system permissions (Tauri)

### API Security
- Rate limiting (prevent abuse)
- Input validation (prevent injection)
- CORS (restrict origins)
- API keys (for mobile apps later)

## Related Diagrams

- **Previous**: [System Context](./01-system-context.md)
- **Deep Dive**: [Desktop Container](./03-container-desktop-focused.md)
- **Deep Dive**: [Web Container](./04-container-web-focused.md)
- **Deep Dive**: [Sync Architecture](./05-container-sync-architecture.md)
- **Components**: [Shared Core Components](./06-component-shared-core.md)

## References

- [C4 Model: Container Diagram](https://c4model.com/diagrams/container)
- [KeyFlow Engineering Requirements](../ENGINEERING_REQUIREMENTS.md)
- [Tauri Documentation](https://tauri.app/)
- [Next.js Documentation](https://nextjs.org/)

