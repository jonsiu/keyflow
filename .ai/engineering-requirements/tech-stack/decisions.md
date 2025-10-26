# Technology Stack - Decisions & Rationale

## Overview

This document explains the technology choices for KeyFlow and the rationale behind each decision.

## Frontend Stack

### Desktop App: Tauri 2.0 + React 18

**Decision:** Use Tauri 2.0 with React 18 for the desktop application.

**Rationale:**

| Criterion | Tauri | Electron | Winner |
|-----------|-------|----------|--------|
| **Bundle Size** | ~12 MB | ~180 MB | ✅ Tauri (15x smaller) |
| **Startup Time** | ~0.3s | ~1.5s | ✅ Tauri (5x faster) |
| **Keystroke Latency** | ~2ms | ~8ms | ✅ Tauri (4x faster) |
| **Memory Usage** | ~60 MB | ~350 MB | ✅ Tauri (6x less) |
| **Security** | Rust sandboxing | Node.js | ✅ Tauri (more secure) |
| **Maturity** | v2.0 (2024) | Proven | ⚠️ Electron |

**Why Tauri Wins:**
- **Performance is critical** for a typing tutor (<2ms latency requirement)
- **Native feel** using system WebView
- **Smaller downloads** (important for first impressions)
- **Better security** (Rust backend, limited IPC)
- **Growing ecosystem** (2.0 release is stable)

**Trade-offs:**
- Less mature than Electron (but 2.0 is production-ready)
- Smaller community (but growing rapidly)
- Some platform-specific quirks (but well-documented)

**React Version:** React 18 (not 19)
- Stable, proven APIs
- Compatible with shared components
- Vite for fast dev experience

### Web App: Next.js 15 + React 19

**Decision:** Use Next.js 15 with React 19 for the web application.

**Rationale:**

**Why Next.js:**
- **Best-in-class performance** (Server-Side Rendering, Edge caching)
- **Vercel deployment** (zero-config, instant deploys)
- **Excellent DX** (Fast Refresh, TypeScript support)
- **Built-in optimizations** (Image, Font, Bundle optimization)
- **SEO-friendly** (SSR for marketing pages)

**Why React 19:**
- **Latest optimizations** for Next.js 15
- **Improved performance** (React Compiler, better hydration)
- **Server Components** (for marketing pages, not shared components)

**Trade-offs:**
- React 19 is newer (but Next.js 15 is built for it)
- Shared components must use React 18 APIs only

### UI Library: Tailwind CSS + Framer Motion

**Decision:** Tailwind CSS for styling, Framer Motion for animations.

**Rationale:**

**Tailwind CSS:**
- ✅ Utility-first (rapid development)
- ✅ Shared config between desktop and web
- ✅ Minimal bundle size (tree-shaking)
- ✅ Dark mode support (built-in)
- ✅ Responsive design (mobile-first)

**Framer Motion:**
- ✅ Smooth animations (60 FPS)
- ✅ Declarative API (easy to use)
- ✅ Performance optimized (GPU-accelerated)
- ⚠️ Use sparingly (NOT for per-keystroke animations)

**Alternatives Considered:**
- ❌ CSS Modules: Too verbose, harder to share
- ❌ Styled Components: Runtime overhead, larger bundles
- ❌ Vanilla CSS: Hard to maintain at scale

### Charting: Recharts

**Decision:** Use Recharts for progress visualizations.

**Rationale:**
- ✅ React-friendly (declarative API)
- ✅ Customizable (easy to style)
- ✅ Responsive (works on all screen sizes)
- ⚠️ Requires optimization (downsample data to 100 points)

**Alternatives Considered:**
- ❌ D3.js: Too low-level, steeper learning curve
- ❌ Chart.js: Not React-native, harder to customize
- ❌ Victory: Larger bundle size

## Backend Stack

### Runtime: Node.js 20+ (or Bun)

**Decision:** Node.js 20+ for MVP, consider Bun for future.

**Rationale:**

**Node.js:**
- ✅ Mature ecosystem (millions of packages)
- ✅ Same language as frontend (TypeScript)
- ✅ Excellent TypeScript support
- ✅ Fast enough for MVP (<100ms API responses)

**Bun (Future):**
- 🔄 3x faster than Node.js
- 🔄 Built-in TypeScript support
- 🔄 Drop-in replacement (easy migration)
- ⚠️ Still maturing (1.0 released 2023)

**Decision:** Start with Node.js, migrate to Bun when stable.

### Framework: Express.js or Hono

**Decision:** Express.js for MVP, consider Hono for performance.

**Rationale:**

| Feature | Express | Hono | Winner |
|---------|---------|------|--------|
| **Maturity** | 13+ years | 2+ years | Express |
| **Performance** | Good | Excellent (5x faster) | Hono |
| **Ecosystem** | Huge | Growing | Express |
| **Bundle Size** | Moderate | Tiny | Hono |
| **Learning Curve** | Easy | Easy | Tie |

**Decision:** 
- MVP: Express.js (proven, safe choice)
- v1.2: Consider Hono if performance becomes bottleneck

### Database: PostgreSQL + Redis

**Decision:** PostgreSQL for primary database, Redis for caching.

**Rationale:**

**PostgreSQL:**
- ✅ JSONB support (flexible schema for keystroke data)
- ✅ Time-series data (progress tracking over time)
- ✅ Full-text search (exercise content search)
- ✅ ACID compliance (data integrity)
- ✅ Excellent managed options (Supabase, Neon)

**Alternatives Considered:**
- ❌ MongoDB: Less structured, harder to query relationships
- ❌ MySQL: No JSONB, less modern features
- ❌ SQLite: Not suitable for concurrent web users

**Redis:**
- ✅ Fast caching (50x faster reads)
- ✅ Session storage
- ✅ Leaderboards (future feature)
- ✅ Managed options (Upstash)

### ORM: Prisma

**Decision:** Use Prisma for database access.

**Rationale:**
- ✅ Type-safe (auto-generated TypeScript types)
- ✅ Great DX (schema-first, migrations)
- ✅ Excellent performance (optimized queries)
- ✅ Works with PostgreSQL perfectly

**Alternatives Considered:**
- ❌ TypeORM: Less active development
- ❌ Sequelize: Not type-safe enough
- ❌ Raw SQL: Too low-level, error-prone

### Authentication: Clerk or Supabase Auth

**Decision:** Use Clerk for MVP, Supabase Auth as alternative.

**Rationale:**

**Clerk:**
- ✅ Best-in-class UX (beautiful UI components)
- ✅ Easy integration (React hooks, Next.js middleware)
- ✅ Feature-rich (MFA, social logins, organizations)
- ✅ Excellent documentation
- ⚠️ Paid service (but free tier generous)

**Supabase Auth:**
- ✅ Open source
- ✅ Integrated with Supabase database
- ✅ Cheaper (included in database plan)
- ⚠️ Less polished UI components

**Decision:** Clerk for better UX, Supabase Auth as fallback.

## Monorepo & Build Tools

### Monorepo: Turborepo

**Decision:** Use Turborepo for monorepo orchestration.

**Rationale:**

| Feature | Turborepo | Nx | Winner |
|---------|-----------|----|----|
| **Speed** | Excellent | Excellent | Tie |
| **Caching** | Built-in | Built-in | Tie |
| **Complexity** | Simple | Complex | Turborepo |
| **Learning Curve** | Easy | Steep | Turborepo |
| **Vercel Integration** | Native | Good | Turborepo |

**Why Turborepo:**
- Simpler configuration
- Created by Vercel (excellent Next.js integration)
- Fast incremental builds
- Remote caching (Vercel)

### Package Manager: PNPM

**Decision:** Use PNPM for package management.

**Rationale:**
- ✅ Faster than npm/yarn (symlinked node_modules)
- ✅ Disk space efficient (single store)
- ✅ Strict dependency management (no phantom dependencies)
- ✅ Monorepo-friendly (workspaces)

**Alternatives Considered:**
- ❌ npm: Slower, less efficient
- ❌ Yarn: Good, but PNPM is faster

### Desktop Build: Vite

**Decision:** Use Vite for desktop app bundling.

**Rationale:**
- ✅ Lightning-fast HMR (<50ms updates)
- ✅ Optimized production builds
- ✅ Native TypeScript support
- ✅ Tauri integration (official template)

**Alternatives Considered:**
- ❌ Webpack: Slower dev experience
- ❌ Rollup: Good, but Vite is easier

## State Management

### Zustand

**Decision:** Use Zustand for client-side state management.

**Rationale:**

| Feature | Zustand | Redux | Recoil | Winner |
|---------|---------|-------|--------|--------|
| **Bundle Size** | 1 KB | 12 KB | 79 KB | Zustand |
| **Boilerplate** | Minimal | Heavy | Moderate | Zustand |
| **Performance** | Excellent | Good | Excellent | Tie |
| **DevTools** | Yes | Yes | Yes | Tie |
| **Learning Curve** | Easy | Steep | Moderate | Zustand |

**Why Zustand:**
- Minimal API (less code to write)
- Excellent performance (fine-grained subscriptions)
- Middleware support (persistence, sync)
- Works identically in desktop and web

**Middleware Used:**
- Persistence: Debounced saves to storage
- Sync: Background cloud sync
- Logger: Development debugging

## Testing

### Unit Tests: Vitest

**Decision:** Use Vitest for unit and integration tests.

**Rationale:**
- ✅ Vite-native (instant startup)
- ✅ Jest-compatible API (easy migration)
- ✅ Fast execution (parallel, cached)
- ✅ TypeScript support (built-in)

### E2E Tests: Playwright

**Decision:** Use Playwright for end-to-end tests.

**Rationale:**
- ✅ Cross-browser (Chromium, Firefox, WebKit)
- ✅ Desktop app testing (via Tauri)
- ✅ Reliable (auto-waiting, stable selectors)
- ✅ Great debugging (trace viewer)

**Alternatives Considered:**
- ❌ Cypress: Doesn't support desktop apps well
- ❌ Selenium: Outdated, harder to use

## Deployment & Infrastructure

### Web Hosting: Vercel

**Decision:** Deploy web app to Vercel.

**Rationale:**
- ✅ Zero-config deployment (push to deploy)
- ✅ Edge network (global CDN)
- ✅ Preview deploys (for PRs)
- ✅ Next.js optimizations (native support)
- ✅ Generous free tier

### Backend Hosting: Railway or Render

**Decision:** Railway for MVP, Render as alternative.

**Rationale:**

**Railway:**
- ✅ Excellent DX (simple deploys)
- ✅ PostgreSQL included
- ✅ Redis included
- ✅ Fair pricing
- ⚠️ Newer platform

**Render:**
- ✅ More mature
- ✅ Generous free tier
- ✅ PostgreSQL + Redis included
- ⚠️ Slightly slower deploys

**Decision:** Railway for better DX, Render as backup.

### Database Hosting: Supabase or Neon

**Decision:** Supabase for MVP, Neon as alternative.

**Rationale:**

**Supabase:**
- ✅ Full backend platform (database + auth + storage)
- ✅ Generous free tier
- ✅ Excellent documentation
- ✅ Real-time subscriptions (future feature)

**Neon:**
- ✅ Serverless PostgreSQL (auto-scaling)
- ✅ Branching (git-like database branches)
- ✅ Great performance
- ⚠️ Auth not included

**Decision:** Supabase for all-in-one, Neon if only database needed.

## Monitoring & Analytics

### Error Tracking: Sentry

**Decision:** Use Sentry for error tracking.

**Rationale:**
- ✅ Excellent error reporting (stack traces, user context)
- ✅ Performance monitoring (transaction tracing)
- ✅ Cross-platform (desktop, web, backend)
- ✅ Generous free tier

### Analytics: PostHog

**Decision:** Use PostHog for product analytics.

**Rationale:**
- ✅ Privacy-first (self-hostable)
- ✅ Feature flags (A/B testing)
- ✅ Session recordings
- ✅ Product analytics (funnels, retention)
- ✅ Generous free tier

**Alternatives Considered:**
- ❌ Google Analytics: Privacy concerns, less features
- ❌ Mixpanel: Expensive, overkill for MVP

## CI/CD

### GitHub Actions

**Decision:** Use GitHub Actions for CI/CD.

**Rationale:**
- ✅ Native GitHub integration
- ✅ Free for open source / generous for private
- ✅ Flexible workflows
- ✅ Large ecosystem (actions marketplace)

**Workflows:**
1. **Test** (on every push)
2. **Lint** (on every push)
3. **Build Desktop** (on tag)
4. **Deploy Web** (on push to main)
5. **Deploy Backend** (on push to main)

## Future Technology Considerations

### Phase 2 (v1.2)
- 🔄 **TensorFlow.js**: Client-side ML for adaptive learning
- 🔄 **WebAssembly**: Rust validation logic (even faster)
- 🔄 **Service Workers**: Offline support for web app
- 🔄 **IndexedDB**: Local storage for web app

### Phase 3 (v2.0)
- ⏳ **WebRTC**: Real-time multiplayer typing races
- ⏳ **WebGPU**: GPU-accelerated visualizations
- ⏳ **Tauri Plugins**: Native integrations (webcam for posture)
- ⏳ **Edge Functions**: Compute closer to users

## Decision Matrix Summary

| Category | Choice | Rationale |
|----------|--------|-----------|
| **Desktop Framework** | Tauri 2.0 | 15x smaller, 4x faster than Electron |
| **Desktop Frontend** | React 18 + Vite | Stable, fast, shared with web |
| **Web Framework** | Next.js 15 + React 19 | Best performance, Vercel deployment |
| **Styling** | Tailwind CSS | Rapid development, shared config |
| **State** | Zustand | Minimal, fast, works everywhere |
| **Backend** | Node.js + Express | Mature, TypeScript, easy to deploy |
| **Database** | PostgreSQL | JSONB, time-series, ACID |
| **ORM** | Prisma | Type-safe, great DX |
| **Auth** | Clerk | Best UX, easy integration |
| **Monorepo** | Turborepo | Simple, fast, Vercel-native |
| **Package Manager** | PNPM | Fast, efficient, strict |
| **Testing** | Vitest + Playwright | Fast, reliable, cross-platform |
| **Deployment** | Vercel + Railway | Easy, fast, generous free tiers |

## References

- [Architecture Overview](../architecture/overview.md)
- [Performance Requirements](../performance-requirements.md)
- [Monorepo Structure](./monorepo.md)

