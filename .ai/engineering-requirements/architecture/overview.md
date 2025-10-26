# Architecture Overview

## Introduction

KeyFlow follows a **monorepo architecture** with clear separation of concerns across multiple layers. The architecture is designed to maximize code reuse (90%+ between desktop and web), ensure sub-2ms keystroke latency, and maintain a clean, testable codebase.

## Core Architectural Principles

### 1. Local-First Architecture
- **Desktop app**: 100% offline functional, optional cloud sync
- **Web app**: Cloud-required, REST API dependent
- **Data sync**: Conflict resolution via timestamped updates

### 2. Code Reuse Strategy
- **90%+ shared code** between desktop and web platforms
- **Shared packages**: `shared-ui`, `shared-core`, `shared-types`
- **Platform-specific adapters**: Tauri vs REST API

### 3. Performance-First Design
- **Hot path optimization**: <2ms keystroke validation (desktop)
- **Cold path debouncing**: 500ms for saves/sync
- **Zero allocations** in performance-critical code
- **Memoization** for expensive calculations

### 4. Clean Architecture
- **Dependency Inversion**: Business logic depends on abstractions, not implementations
- **Layer Independence**: Inner layers know nothing about outer layers
- **Clear Boundaries**: Well-defined interfaces between components

## System Architecture

### High-Level View

See: [High-Level Architecture Diagram](./diagrams/high-level-architecture.puml)

```
┌─────────────────────────────────────────────────────┐
│                  Client Layer                       │
│  ┌──────────────┐         ┌──────────────┐        │
│  │ Desktop App  │         │   Web App    │        │
│  │   (Tauri)    │         │  (Next.js)   │        │
│  └──────────────┘         └──────────────┘        │
└─────────────────┬───────────────┬─────────────────┘
                  │               │
                  ▼               ▼
┌─────────────────────────────────────────────────────┐
│              Shared Packages (90% reuse)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │shared-ui │  │shared-core│ │shared-   │         │
│  │(React)   │  │(Business) │ │types     │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           Backend Services (Optional)               │
│  ┌──────────────┐  ┌────────────┐                  │
│  │  REST API    │  │ PostgreSQL │                  │
│  │  (Express)   │  │  + Redis   │                  │
│  └──────────────┘  └────────────┘                  │
└─────────────────────────────────────────────────────┘
```

## Layered Architecture

See: [Layered Architecture Diagram](./diagrams/layered-architecture.puml)

### Layer 1: Presentation (UI)
**Location:** `packages/shared-ui`, `apps/*/pages`

**Responsibilities:**
- React components
- User interaction handling
- Visual feedback
- Component-local state

**Rules:**
- No business logic
- No direct data access
- Uses Facade pattern for simplicity

### Layer 2: State Management
**Location:** `apps/*/stores`

**Responsibilities:**
- Application state (Zustand)
- State mutations
- Cross-cutting concerns (middleware)

**Rules:**
- Uses business logic layer
- No UI concerns
- Debounced persistence

### Layer 3: Business Logic
**Location:** `packages/shared-core`

**Responsibilities:**
- Typing validation
- Metrics calculation
- Practice mode logic
- Error analysis

**Rules:**
- **Platform-agnostic** (pure TypeScript)
- **No React dependencies**
- **No storage dependencies**
- 100% unit testable

### Layer 4: Data Access
**Location:** `apps/*/adapters`

**Responsibilities:**
- Storage abstraction
- API communication
- Repository pattern
- Sync coordination

**Rules:**
- Implements interfaces from `shared-types`
- Platform-specific implementations
- Handles sync conflicts

### Layer 5: Infrastructure
**Location:** `apps/*/src-tauri`, `backend/`

**Responsibilities:**
- OS/platform integration
- Database operations
- Network communication
- System APIs

**Rules:**
- Platform-specific
- No business logic
- Performance optimized

## Component Structure

See: [Component Diagram](./diagrams/component-diagram.puml)

### Monorepo Organization

```
keyflow-monorepo/
├── packages/
│   ├── shared-ui/          # React components (React 18 APIs)
│   ├── shared-core/        # Business logic (pure TypeScript)
│   └── shared-types/       # Type definitions
├── apps/
│   ├── desktop/            # Tauri app (macOS → Windows → Linux)
│   └── web/                # Next.js app (browser)
└── backend/                # REST API (Node.js + PostgreSQL)
```

### Package Dependencies

```
shared-ui ──→ shared-core ──→ shared-types
    │              │              │
    ▼              ▼              ▼
desktop app    web app       backend API
```

**Dependency Rules:**
- `shared-types`: No dependencies (pure types)
- `shared-core`: Depends only on `shared-types`
- `shared-ui`: Depends on `shared-core` and `shared-types`
- Apps: Depend on all shared packages

## Deployment Architecture

See: [Deployment Diagram](./diagrams/deployment-diagram.puml)

### Desktop App
- **Platform**: Tauri 2.0 (macOS first, Windows/Linux later)
- **Distribution**: GitHub Releases, direct download
- **Updates**: Tauri auto-updater
- **Storage**: Tauri Store (local SQLite)
- **Bundle Size**: ~12 MB

### Web App
- **Platform**: Next.js 15 + React 19
- **Hosting**: Vercel (CDN + Edge)
- **Storage**: REST API (cloud-required)
- **Performance**: <1.5s First Contentful Paint

### Backend API
- **Platform**: Node.js + Express/Hono
- **Hosting**: Railway or Render
- **Database**: PostgreSQL (Supabase/Neon)
- **Cache**: Redis (Upstash)
- **Performance**: <100ms response (p95)

## Design Patterns

See: [Design Patterns](./design-patterns.md)

Key patterns used throughout the application:

1. **Layered Architecture** - Separation of concerns
2. **Dependency Inversion** - Platform abstraction
3. **Facade Pattern** - Simplified API for UI
4. **Strategy Pattern** - Pluggable validation modes
5. **Observer Pattern** - Real-time updates
6. **Repository Pattern** - Data persistence
7. **Command Pattern** - Coarse-grained IPC
8. **Factory Pattern** - Exercise generation

## Performance Architecture

### Hot Path (<2ms)
**Path:** User Input → UI → Validation → Metrics → UI Update

**Optimization:**
- No async operations
- No IPC calls
- Zero allocations
- Pre-computed lookups
- Memoized calculations

**Breakdown:**
```
Keystroke validation:    <0.1ms
Metrics calculation:     <0.5ms
State update:            <0.1ms
UI render:               <1ms
─────────────────────────────
Total:                   <2ms
```

### Cold Path (Debounced)
**Path:** State Change → Storage → Sync → Cloud

**Optimization:**
- Debounced saves (500ms)
- Batched operations
- Background sync queue
- Non-blocking I/O

**Operations:**
- Save to local storage: ~10ms
- Sync to cloud: ~100ms
- Analytics: ~50ms

## Data Flow

### Desktop App (Local-First)
```
User Input
    ↓
Validation (shared-core)
    ↓
State Update (Zustand)
    ↓
UI Update (shared-ui)
    ↓ (debounced, 500ms)
Tauri Store (local)
    ↓ (background, queued)
REST API (optional)
```

### Web App (Cloud-Required)
```
User Input
    ↓
Validation (shared-core)
    ↓
State Update (Zustand)
    ↓
UI Update (shared-ui)
    ↓ (debounced, 500ms)
REST API (required)
    ↓
PostgreSQL
```

## Technology Stack Summary

| Layer | Desktop | Web | Shared |
|-------|---------|-----|--------|
| **Frontend** | Tauri 2.0 + React 18 | Next.js 15 + React 19 | React components |
| **State** | Zustand | Zustand | Zustand stores |
| **Storage** | Tauri Store | REST API | Repository pattern |
| **Styling** | Tailwind CSS | Tailwind CSS | Shared config |
| **Build** | Vite | Next.js | Turborepo |

## Key Architectural Decisions

### Why Tauri over Electron?
- **12-30x smaller bundle** (12 MB vs 180 MB)
- **4x faster startup** (0.3s vs 1.5s)
- **4x lower latency** (2ms vs 8ms)
- **6x less memory** (60 MB vs 350 MB)
- Uses system WebView (no Chromium)

### Why Monorepo?
- **90%+ code reuse** between desktop and web
- **Single source of truth** for business logic
- **Shared type safety** across all platforms
- **Synchronized releases**

### Why React 18 for Shared UI?
- **Compatibility**: Works with both React 18 (desktop) and React 19 (web)
- **Stability**: Proven, stable APIs
- **No server components**: Client-side only (works in Tauri)
- **Performance**: Optimized for fast updates

## Security Architecture

### Desktop App
- **Tauri IPC**: Limited command permissions
- **Local storage**: Encrypted at rest (OS level)
- **No eval**: CSP prevents code injection
- **Code signing**: Apple Developer certificate

### Web App
- **HTTPS only**: All traffic encrypted
- **Authentication**: JWT tokens (Clerk/Supabase)
- **CORS**: Restricted API access
- **CSP headers**: Prevent XSS attacks

### Backend API
- **Authentication**: JWT validation on all routes
- **Authorization**: Role-based access control
- **Rate limiting**: Prevent abuse
- **Input validation**: Sanitize all inputs

## Scalability Architecture

### Current Scale (MVP)
- **Users**: 5,000+
- **Concurrent**: 50+ users
- **Response time**: <100ms (p95)
- **Uptime**: 99.9%

### Future Scale (Year 1)
- **Users**: 50,000+
- **Concurrent**: 500+ users
- **Database**: Read replicas
- **Cache**: Multi-region Redis
- **CDN**: Global edge network

## References

- [Design Patterns](./design-patterns.md)
- [Layered Architecture](./layered-architecture.md)
- [Performance Requirements](../performance-requirements.md)
- [Technology Stack](../tech-stack/decisions.md)

