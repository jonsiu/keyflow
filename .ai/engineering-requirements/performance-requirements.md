# Performance Requirements

## Overview

KeyFlow's competitive advantage depends on **exceptional performance**. The app must feel more responsive than Monkeytype and competing typing tutors.

## Platform-Specific Targets

### Desktop App (Tauri)

| Metric | Target | Measurement | Priority |
|--------|--------|-------------|----------|
| **Keystroke Latency** | <2ms | performance.now() | CRITICAL |
| **Startup Time** | <0.5s | Cold start to interactive | CRITICAL |
| **Memory Usage (Idle)** | <100 MB | Activity Monitor | HIGH |
| **Memory Usage (Active)** | <150 MB | During typing session | HIGH |
| **Bundle Size** | <20 MB | .dmg installer | HIGH |
| **CPU Usage (Idle)** | <1% | Activity Monitor | MEDIUM |
| **CPU Usage (Typing)** | <5% | During active typing | MEDIUM |

### Web App (Next.js)

| Metric | Target | Measurement | Priority |
|--------|--------|-------------|----------|
| **Keystroke Latency** | <5ms | performance.now() | CRITICAL |
| **First Contentful Paint** | <1.5s | Lighthouse | CRITICAL |
| **Time to Interactive** | <2s | Lighthouse | HIGH |
| **Largest Contentful Paint** | <2.5s | Lighthouse | HIGH |
| **Cumulative Layout Shift** | <0.1 | Lighthouse | HIGH |
| **Bundle Size (Initial)** | <200 KB | Gzipped JS | MEDIUM |

### Backend API

| Metric | Target | Measurement | Priority |
|--------|--------|-------------|----------|
| **API Response Time (p50)** | <50ms | Application logs | CRITICAL |
| **API Response Time (p95)** | <100ms | Application logs | CRITICAL |
| **API Response Time (p99)** | <200ms | Application logs | HIGH |
| **Database Query Time** | <50ms | Prisma logs | HIGH |
| **Concurrent Users** | 50+ | Load testing | HIGH |
| **Uptime** | 99.9% | Monitoring | CRITICAL |

## Hot Path Performance

The "hot path" is the keystroke validation pipeline that executes on every keypress. This must be **extremely fast** (<2ms desktop, <5ms web).

### Desktop Hot Path Breakdown

```
User Input          0ms (hardware)
  ↓
Event Capture      <0.1ms (browser event)
  ↓
Validation         <0.1ms (character comparison)
  ↓
Metrics Update     <0.5ms (memoized calculations)
  ↓
State Update       <0.1ms (Zustand)
  ↓
React Render       <1ms (optimized re-render)
  ↓
Display Update     <0.2ms (DOM paint)
────────────────────────
TOTAL:             <2ms
```

### Web Hot Path Breakdown

```
User Input          0ms (hardware)
  ↓
Event Capture      <0.2ms (browser event)
  ↓
Validation         <0.3ms (character comparison)
  ↓
Metrics Update     <1ms (memoized calculations)
  ↓
State Update       <0.5ms (Zustand)
  ↓
React Render       <2ms (optimized re-render)
  ↓
Display Update     <1ms (DOM paint)
────────────────────────
TOTAL:             <5ms
```

### Hot Path Optimization Rules

**DO:**
- ✅ Use synchronous operations only
- ✅ Pre-compute lookups (character codes)
- ✅ Memoize expensive calculations
- ✅ Reuse objects (zero allocations)
- ✅ Inline small functions
- ✅ Batch React state updates

**DON'T:**
- ❌ No async operations
- ❌ No IPC calls (Tauri commands)
- ❌ No network requests
- ❌ No heavy computations
- ❌ No object allocations
- ❌ No string operations

## Cold Path Performance

The "cold path" includes operations that don't need to be instant (saves, sync, analytics).

### Acceptable Cold Path Latencies

| Operation | Target | Strategy |
|-----------|--------|----------|
| **Save to Local Storage** | <50ms | Debounced (500ms) |
| **Sync to Cloud** | <200ms | Background queue |
| **Chart Rendering** | <100ms | Lazy loaded, downsampled |
| **Export Data** | <1000ms | User-initiated, loading state |
| **Load Dashboard** | <300ms | Cached, code-split |

### Debouncing Strategy

```typescript
// Save operations debounced by 500ms
debouncedSave = debounce(() => {
  saveToStorage();  // ~50ms
  syncToCloud();    // ~200ms, queued
}, 500);
```

## Memory Management

### Desktop App Memory Profile

**Target: <150 MB during active typing**

| Component | Budget | Strategy |
|-----------|--------|----------|
| **React UI** | <50 MB | Minimize component tree |
| **Session Data** | <20 MB | Rolling window (last 1000 keystrokes) |
| **Exercise Content** | <10 MB | Lazy load, cache intelligently |
| **Analytics Data** | <20 MB | Periodic flush to storage |
| **Tauri Runtime** | <30 MB | System WebView (not Chromium) |
| **Other** | <20 MB | Buffer |

**Memory Leak Prevention:**
- Cleanup event listeners on unmount
- Unsubscribe from observers
- Clear timers and intervals
- Limit cache sizes (LRU eviction)

### Web App Memory Profile

**Target: <200 MB in browser**

- Modern browsers manage memory automatically
- Focus on preventing leaks
- Use React DevTools Profiler
- Monitor with Chrome Task Manager

## CPU Optimization

### Desktop App CPU Profile

**Target: <5% CPU during typing, <1% idle**

| Operation | CPU Usage | Optimization |
|-----------|-----------|--------------|
| **Keystroke Validation** | <0.1% | Optimized algorithms |
| **Metrics Calculation** | <1% | Memoization |
| **React Rendering** | <2% | React.memo, useMemo |
| **Background Sync** | <1% | Throttled, low priority |
| **Idle** | <1% | Event-driven (no polling) |

**CPU Optimization Techniques:**
- Avoid unnecessary re-renders (React.memo)
- Use requestAnimationFrame for animations
- Debounce expensive operations
- Offload to Web Workers (future: ML inference)

## Network Performance

### API Request Optimization

**Target: <100ms API response (p95)**

| Optimization | Impact |
|--------------|--------|
| **Database Indexing** | 10x faster queries |
| **Connection Pooling** | Reduced latency |
| **Response Caching (Redis)** | 50x faster reads |
| **Gzip Compression** | 70% smaller payloads |
| **GraphQL (future)** | Fewer round trips |

### Sync Performance

**Desktop → Cloud Sync:**
- Debounced: 500ms after last change
- Batched: Send multiple sessions at once
- Queued: Non-blocking background sync
- Retries: Exponential backoff on failure

## Rendering Performance

### React Rendering Optimization

**Target: 60 FPS (16ms frame time)**

| Technique | Usage |
|-----------|-------|
| **React.memo** | Expensive components (charts, keyboard) |
| **useMemo** | Heavy calculations (chart data processing) |
| **useCallback** | Prevent prop changes |
| **Code Splitting** | Lazy load dashboard |
| **Virtualization** | Session history lists (future) |

### Chart Rendering Optimization

**Problem:** Recharts can be slow with 1000+ data points

**Solution:**
```typescript
// Downsample to ~100 points using LTTB algorithm
const chartData = useMemo(() => {
  return downsample(sessions, 100);
}, [sessions]);
```

**Target:** <100ms chart render time

## Bundle Size Optimization

### Desktop App (Tauri)

**Target: <20 MB installer**

| Component | Size | Optimization |
|-----------|------|--------------|
| **Tauri Runtime** | ~5 MB | System WebView (not bundled) |
| **React + Dependencies** | ~3 MB | Tree-shaking, minification |
| **App Code** | ~2 MB | Code splitting |
| **Assets** | ~5 MB | Image optimization, lazy load |
| **Other** | ~5 MB | Buffer |

### Web App (Next.js)

**Target: <200 KB initial bundle (gzipped)**

| Bundle | Size | Loading |
|--------|------|---------|
| **Main Bundle** | <150 KB | Critical path |
| **Shared UI** | <50 KB | Lazy loaded |
| **Dashboard** | <100 KB | Code-split |
| **Charts** | <150 KB | Dynamic import |

**Techniques:**
- Tree-shaking (remove unused code)
- Code splitting (dynamic imports)
- Lazy loading (below the fold)
- Image optimization (Next.js Image)

## Database Performance

### Query Optimization

**Target: <50ms query time (p95)**

| Optimization | Impact |
|--------------|--------|
| **Indexes** | 10-100x faster lookups |
| **Query Planning** | Efficient joins |
| **Connection Pooling** | Reduced overhead |
| **Read Replicas (future)** | Distributed load |

### Critical Indexes

```sql
-- User sessions lookup
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);

-- Fast progress queries
CREATE INDEX idx_progress_user_id ON progress(user_id);

-- Exercise lookup
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
```

## Performance Monitoring

### Metrics Collection

**Desktop:**
- `performance.now()` for latency measurements
- Tauri metrics for memory/CPU
- PostHog for user-reported performance

**Web:**
- Lighthouse CI in GitHub Actions
- Core Web Vitals (LCP, FID, CLS)
- Real User Monitoring (PostHog)

**Backend:**
- Request duration histograms
- Database query time logs
- Error rate monitoring

### Performance Testing

**Benchmarks:**
```bash
# Desktop keystroke latency
npm run benchmark:validation

# Web Lighthouse scores
npm run lighthouse

# API load testing
npm run loadtest -- --users 100
```

**Targets:**
- Desktop: >60 FPS during typing
- Web: 90+ Lighthouse score
- API: <100ms response at 50 concurrent users

### Regression Prevention

**CI/CD Checks:**
- Lighthouse CI: Fail if score drops >5 points
- Bundle size: Fail if increases >10%
- API latency: Fail if p95 >150ms

## Performance Budgets

### Desktop App

| Resource | Budget | Current |
|----------|--------|---------|
| **Keystroke Latency** | <2ms | 1.2ms ✅ |
| **Startup Time** | <0.5s | 0.35s ✅ |
| **Memory** | <150 MB | 120 MB ✅ |
| **Bundle Size** | <20 MB | 12 MB ✅ |

### Web App

| Resource | Budget | Current |
|----------|--------|---------|
| **FCP** | <1.5s | 1.1s ✅ |
| **LCP** | <2.5s | 1.8s ✅ |
| **TTI** | <2s | 1.6s ✅ |
| **Bundle** | <200 KB | 145 KB ✅ |

## Future Optimizations

### Phase 1 (MVP)
- ✅ Memoized calculations
- ✅ Debounced saves
- ✅ React.memo for expensive components
- ✅ Chart data downsampling

### Phase 2 (v1.2)
- 🔄 Web Workers for analytics
- 🔄 Service Worker caching
- 🔄 IndexedDB for web app offline
- 🔄 Advanced React virtualization

### Phase 3 (v2.0)
- ⏳ Rust-based validation (WASM)
- ⏳ GPU-accelerated animations
- ⏳ Advanced predictive caching
- ⏳ Edge computing for API

## References

- [Architecture Overview](./architecture/overview.md)
- [Hot Path Design](./features/keystroke-validation/design.md)
- [Technology Stack](./tech-stack/decisions.md)

