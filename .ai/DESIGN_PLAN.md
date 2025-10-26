# KeyFlow - Professional Design Plan

## Mission-Aligned Design Philosophy

> **Goal:** Create a professional, minimal, fast typing tutor that consolidates TypingClub, Monkeytype, Keybr, and TypeRacer into one native application.

**Target Market:** Speed seekers (18-35 years old, professionals, 40-150+ WPM goal)

**Design Inspiration:** Monkeytype's minimal, distraction-free aesthetic + professional UI patterns

**Key Principles:**
1. **Minimal During Typing** - Hide everything except text and essential metrics
2. **Native Performance** - <2ms keystroke latency (feels instant)
3. **Professional Aesthetic** - Dark mode default, high contrast, zero clutter
4. **90% Code Reuse** - Shared components across desktop and web
5. **Four Distinct Modes** - Each mode has purpose-built UI patterns

---

## 0. Monorepo Architecture & Component Reuse Strategy

### Design Decision: Shared Component Packages

KeyFlow uses a monorepo architecture to achieve 90% code reuse between desktop (Tauri) and web (Next.js) platforms.

**Implementation:**

```
keyflow-monorepo/
├── packages/
│   ├── shared-ui/          # React components (90% of UI)
│   │   ├── TypingInterface.tsx
│   │   ├── VirtualKeyboard.tsx
│   │   ├── MetricsDisplay.tsx
│   │   ├── ProgressChart.tsx
│   │   └── index.ts
│   ├── shared-core/        # Business logic (100% shared)
│   │   ├── typing/
│   │   │   ├── SessionManager.ts
│   │   │   ├── InputValidator.ts
│   │   │   ├── MetricsCalculator.ts
│   │   │   └── KeystrokeTracker.ts
│   │   ├── exercises/
│   │   │   ├── ExerciseFactoryRegistry.ts
│   │   │   ├── LessonFactory.ts
│   │   │   ├── PracticeFactory.ts
│   │   │   ├── DrillFactory.ts
│   │   │   └── ChallengeFactory.ts
│   │   └── index.ts
│   └── shared-types/       # TypeScript definitions
│       └── index.ts
├── apps/
│   ├── desktop/            # Tauri app (local-first)
│   │   ├── src/
│   │   │   ├── adapters/   # TauriStorageAdapter (10% platform code)
│   │   │   ├── pages/      # Import shared-ui components
│   │   │   └── App.tsx
│   │   └── src-tauri/      # Rust backend (minimal)
│   └── web/                # Next.js app (cloud-based)
│       ├── app/
│       │   ├── page.tsx    # Import shared-ui components
│       │   └── layout.tsx
│       └── adapters/       # RESTStorageAdapter (10% platform code)
└── backend/                # REST API (serves both platforms)
```

**Rationale:**
- Single source of truth for business logic and UI components
- Changes to typing engine benefit both platforms instantly
- Consistent UX across desktop and web
- Reduced maintenance burden

**Technical Approach:**
- **Monorepo Tool:** Turborepo or Nx for build orchestration
- **TypeScript Paths:** `@keyflow/shared-ui`, `@keyflow/shared-core`, `@keyflow/shared-types`
- **Platform Adapters:** Implement `StorageAdapter` interface
  - Desktop: `TauriStorageAdapter` (local file system)
  - Web: `RESTStorageAdapter` (REST API calls)
- **React Versions:**
  - Shared packages: React 18 (stable APIs only)
  - Desktop: React 18
  - Web: React 19 (Next.js 15)

### Shared vs Platform-Specific Design

**Shared Components (90%):**
- `TypingInterface` - Core typing UI, character-by-character validation
- `VirtualKeyboard` - Optional keyboard visualization
- `MetricsDisplay` - Real-time WPM/accuracy display
- `ProgressChart` - Charts and statistics visualization
- All business logic (SessionManager, InputValidator, etc.)

**Platform-Specific Components (10%):**

**Desktop (Tauri):**
- Native window controls and menus
- Local file system operations
- Offline-first UI indicators
- Export features (CSV/JSON)

**Web (Next.js):**
- Browser navigation and authentication
- Cloud sync status indicators
- Server-side rendering for SEO
- Progressive web app features

---

## 1. Core Typing Interface Design

### Design Decision: Monkeytype-Inspired Minimal UI

**Implementation:**
- Full-screen typing area during active typing
- Hide all UI except:
  - Text to type (large, readable)
  - Current character indicator
  - Essential metrics (WPM/accuracy, can be hidden)
- Character-by-character color feedback:
  - **Correct:** Fade to dim color (already typed)
  - **Current:** Bright highlight (next character)
  - **Incorrect:** Red highlight with error indicator
  - **Upcoming:** Standard text color

**Rationale:**
- Matches "gold standard" Monkeytype aesthetic
- Zero distractions = better focus = faster improvement
- Professional look appeals to speed seekers (18-35 demographic)

**Technical Approach:**
- Shared `TypingInterface` component in `packages/shared-ui`
- Real-time validation via `InputValidator` (pure function, <0.1ms)
- Metrics calculation via `MetricsCalculator` (memoized, 95% cache hit rate)
- Observer pattern for UI updates (decoupled from typing logic)
- <2ms total hot path latency (user keystroke → screen update)

### Character Display System

**Implementation Details:**

```typescript
// Simplified example
interface CharacterState {
  char: string;
  status: 'pending' | 'current' | 'correct' | 'incorrect';
  position: number;
}

// Visual representation:
// [dim gray: already typed] [bright highlight: current] [normal: upcoming]
//     "hello worl"              "d"                          " test"
```

**Styling:**
- **Monospace font:** `'SF Mono', 'Monaco', 'Cascadia Code', monospace` (desktop-native feel)
- **Font size:** 24px-32px (configurable in settings)
- **Line height:** 1.5 for readability
- **Character spacing:** Standard monospace spacing
- **Smooth transitions:** 100ms fade for color changes (no jarring updates)

**Color Feedback (Dark Mode Default):**
- **Correct (typed):** `#4b5563` (dim gray - de-emphasized)
- **Current character:** `#3b82f6` (bright blue highlight)
- **Incorrect:** `#ef4444` (red with subtle shake animation)
- **Upcoming:** `#e5e7eb` (light gray)

**Performance Requirements:**
- <2ms latency from keystroke to visual update
- Pure function validation (no async operations)
- Memoized metrics calculation (avoid re-computation)
- Hardware-accelerated CSS animations only

---

## 2. Virtual Keyboard Design (Optional)

### Design Decision: Professional, Minimal Keyboard Visualization

**Implementation:**
- **Optional:** Can be toggled on/off (hidden by default in Practice/Challenge modes)
- **When Shown:** Clean, professional keyboard layout (not decorative)
- **Visibility by Mode:**
  - Lesson Mode: Visible by default (teaching mode)
  - Practice Mode: Hidden by default (distraction-free)
  - Drill Mode: Visible (shows target keys)
  - Challenge Mode: Hidden (focus on speed)

**Rationale:**
- Beginners need visual guidance for finger positioning
- Advanced users prefer minimal UI (no keyboard)
- Professional design (not cartoon/juvenile like TypingClub)

**Technical Approach:**
- Shared `VirtualKeyboard` component in `packages/shared-ui`
- SVG-based for crisp rendering at any scale
- CSS animations for key press feedback (hardware-accelerated)
- Responsive layout (adjusts to window size)

### Keyboard Visual Design

**Keyboard Layout:**
- Standard QWERTY layout (QWERTY-only for MVP)
- Clean, flat design (no 3D effects)
- Minimal borders and shadows
- Professional color palette

**Key Highlighting:**
- **Home row keys:** Subtle border or background tint (always visible)
- **Current target key:** Bright highlight (matches text current character)
- **Recently pressed:** Brief flash animation (150ms)
- **Weak keys (Drill Mode):** Orange/amber tint

**Finger Positioning Indicators:**
- **NOT Cartoon Hands:** Use subtle visual indicators instead
- **Approach:** Color-coded key groups:
  - Left pinky: Pink tint
  - Left ring: Purple tint
  - Left middle: Blue tint
  - Left index: Green tint
  - Right index: Green tint
  - Right middle: Blue tint
  - Right ring: Purple tint
  - Right pinky: Pink tint
  - Thumbs: Gray tint (spacebar)
- **Subtle:** Light tints, not overwhelming colors
- **Can be toggled:** "Show finger colors" option in settings

**Key Size and Spacing:**
- Proportional to actual keyboard (not decorative)
- Spacebar visually emphasized (most common key)
- Clear separation between rows

---

## 3. Metrics Display Design

### Design Decision: Minimal, Real-Time Metrics

**Implementation:**
- **During Typing:** Minimal metrics at top or hidden completely
- **Options (User Setting):**
  - **Hidden:** No metrics during typing (reveal at end)
  - **Minimal:** WPM and accuracy only, small text
  - **Standard:** WPM, accuracy, time remaining, errors
- **After Completion:** Full results screen with detailed stats

**Rationale:**
- Monkeytype users love minimal UI (can focus on text)
- Real-time feedback helps learning
- User choice (some want metrics, others don't)

**Technical Approach:**
- Shared `MetricsDisplay` component
- Memoized calculations (don't recalculate every keystroke)
- Smooth number transitions (count-up animation for final results)
- Responsive positioning (top-right corner or centered above text)

### Real-Time Metrics Display

**During Typing (Minimal Mode):**
```
┌─────────────────────────────┐
│  WPM: 78  Accuracy: 96%     │  ← Small, top corner
│                             │
│  [typing text here]         │  ← Main focus
│                             │
└─────────────────────────────┘
```

**Post-Session Results Screen:**
```
┌──────────────────────────────────┐
│         Session Complete         │
│                                  │
│            WPM: 78               │  ← Large, prominent
│        Accuracy: 96.3%           │
│          Errors: 12              │
│      Time Elapsed: 1:23          │
│                                  │
│   [Retry] [Next Exercise] [Dashboard]
└──────────────────────────────────┘
```

**Metrics Definitions:**
- **WPM Formula:** `(correct_characters / 5) / minutes`
  - Industry standard: 5 characters = 1 word
  - Only correct characters count
  - Real-time calculation (updates every keystroke)
- **Accuracy:** `(correct_keystrokes / total_keystrokes) * 100`
- **Error Count:** Total incorrect keystrokes (including corrections)

**Visual Design:**
- **Numbers:** Large, bold font (easily readable at a glance)
- **Labels:** Small, dim text (de-emphasized)
- **Color Coding:**
  - WPM: Green if improving, white if stable
  - Accuracy: Green if >95%, yellow if 90-95%, red if <90%
- **No Elaborate Gauges:** Simple numbers (no circular speedometers or complex visualizations during typing)

---

## 4. Four Practice Modes Design

KeyFlow consolidates four typing websites into one app. Each mode has distinct UI patterns optimized for its purpose.

### Mode 1: Lesson Mode (TypingClub-style, Professional)

**Purpose:** Structured learning from beginner to advanced

**UI Design:**
- **Top Section:** 
  - Lesson title: "Lesson 5: Home Row Mastery"
  - Progress indicator: "Lesson 5 of 50"
  - Instructions: Clear, concise text (not verbose)
- **Middle Section:**
  - Typing interface (shared component)
  - Virtual keyboard visible by default
  - Target keys highlighted
- **Bottom Section:**
  - Real-time metrics (WPM, accuracy)
  - "Next Lesson" button appears on completion

**Key Differentiator:** Professional design (NOT juvenile like TypingClub)
- No cartoon characters or gamification
- Clean, modern UI
- Appeals to adults and professionals
- Structured progression with clear goals

**Example Lesson Progression:**
1. Home row (ASDF JKL;)
2. Top row extension (QWER UIOP)
3. Bottom row extension (ZXCV M,./
4. Numbers and symbols
5. Common word patterns (th, ing, tion, etc.)

**Technical Approach:**
- Shared `TypingInterface` component
- `LessonFactory` generates exercises (from `shared-core`)
- Lesson content stored locally (desktop) or fetched from API (web)
- Progress saved after each lesson

---

### Mode 2: Practice Mode (Monkeytype-style)

**Purpose:** Customizable timed tests for speed improvement

**UI Design:**
- **Pre-Session Setup:**
  - Duration selector: 15s, 30s, 60s, 120s, 300s
  - Content type: Words (common 1000), Quotes, Code (Python/JS/TS)
  - Difficulty: Easy, Medium, Hard
- **During Typing:**
  - **Full-screen text area** (max focus)
  - Virtual keyboard HIDDEN by default
  - Minimal metrics (optional: hide completely until end)
  - Timer countdown (can be hidden)
- **Post-Session:**
  - Large WPM display
  - Accuracy and error breakdown
  - Graph: WPM over time during session
  - "Retry" and "New Test" buttons

**Key Differentiator:** Matches Monkeytype's "gold standard" UX
- Zero visual clutter during typing
- Dark mode default
- Smooth, fast, responsive
- Customizable to user preference

**Content Types:**
```typescript
// Example content configurations
const contentTypes = {
  words_common_1000: {
    label: "Common Words",
    source: "Top 1000 English words",
    difficulty: "Easy"
  },
  quotes: {
    label: "Quotes",
    source: "Books, movies, famous quotes",
    difficulty: "Medium"
  },
  code_python: {
    label: "Python Code",
    source: "Python snippets from popular libraries",
    difficulty: "Hard"
  }
};
```

**Technical Approach:**
- Shared `TypingInterface` component (same as Lesson Mode)
- `PracticeFactory` generates timed tests
- Content fetched from `WordDatabase` or API
- Session results stored locally/cloud

---

### Mode 3: Drill Mode (Keybr-style, Real Words)

**Purpose:** Target weak keys with focused practice

**UI Design:**
- **Top Section:**
  - Weak key indicator: "Focusing on: J K L"
  - Explanation: "These keys have the most errors"
  - Progress: "Drill 3 of 10"
- **Middle Section:**
  - Typing interface with REAL words (not gibberish)
  - Virtual keyboard visible (weak keys highlighted in orange/amber)
  - Text uses natural sentences containing target keys
- **Bottom Section:**
  - Metrics focused on target keys:
    - "J key: 89% accuracy (improving)"
    - "K key: 76% accuracy (needs practice)"

**Key Differentiator:** REAL words, not nonsense
- Keybr uses "jjj kkk jjj" (artificial)
- KeyFlow uses "just like joke" (natural English)
- More engaging, better transfer to real typing

**Example Drill Generation:**
```typescript
// Target keys: j, k, l
// Keybr approach (artificial):
"jjj kkk lll jkl jkl jkl"

// KeyFlow approach (real words):
"just like you look at the joke, you can make luck with skill"
// ↑ Contains many j, k, l characters in natural context
```

**Weak Key Detection Algorithm:**
- Analyze last 10 sessions
- Find keys with:
  - Highest error rate (>15%)
  - Slowest typing speed (>150ms per keystroke)
  - Least improvement over time
- Generate drills targeting top 3 weak keys

**Technical Approach:**
- Shared `TypingInterface` component
- `DrillFactory` generates exercises (uses `WeakSpotDetector` + `WordDatabase`)
- `SentenceGenerator` creates natural text with target keys
- Adaptive difficulty (if user improves, increase speed/complexity)

---

### Mode 4: Challenge Mode (TypeRacer-style, Personal)

**Purpose:** Daily typing challenges with personal leaderboard

**UI Design:**
- **Challenge Selection:**
  - "Daily Challenge" (changes every day)
  - "Weekly Challenge" (longer text)
  - "Random Challenge" (any difficulty)
- **During Typing:**
  - Countdown timer: "Time remaining: 1:23"
  - Challenge text (natural sentences, quotes, or passages)
  - Virtual keyboard hidden (focus on speed)
  - Real-time WPM display
- **Post-Challenge:**
  - **Your Time:** "1:45" (large display)
  - **Personal Best:** "1:52 (improved by 7s!)"
  - **Ranking:** "Your top 5 times" (compete with yourself)
  - **Share:** Option to share result (future feature)

**Key Differentiator:** Personal competition (not multiplayer in MVP)
- TypeRacer is multiplayer (requires servers, complexity)
- KeyFlow MVP: Compete with your own times
- v1.2: Add global leaderboards and multiplayer races

**Challenge Types:**
- **Daily:** Short paragraph (30-60 seconds)
- **Weekly:** Longer passage (2-3 minutes)
- **Speed:** Very short text (15 seconds, max speed)
- **Accuracy:** Normal text, must maintain >98% accuracy

**Technical Approach:**
- Shared `TypingInterface` component
- `ChallengeFactory` generates daily challenges
- Challenge content rotates (deterministic, same for all users on same day)
- Personal best times stored locally/cloud
- Leaderboard (v1.2) requires backend API

---

## 5. Progress Dashboard Design

### Design Decision: Comprehensive Analytics with Charts

**Purpose:** Track improvement over time, identify weak spots

**UI Design:**

**Top Section - Summary Stats:**
```
┌────────────────────────────────────────────┐
│  Average WPM: 78      Best WPM: 92         │
│  Avg Accuracy: 95.3%  Total Time: 12h 34m  │
│  Sessions: 127        Current Streak: 5d   │
└────────────────────────────────────────────┘
```

**Middle Section - Charts:**
- **WPM Over Time:** Line chart (last 30 days)
  - X-axis: Date
  - Y-axis: WPM
  - Trend line showing improvement
- **Accuracy Trends:** Line chart
- **Practice Time by Mode:** Bar chart (Lesson vs Practice vs Drill vs Challenge)

**Bottom Section - Weak Spots:**
- **Weak Key Heatmap:** Visual keyboard with color-coded keys
  - Green: >95% accuracy
  - Yellow: 90-95% accuracy
  - Orange: 85-90% accuracy
  - Red: <85% accuracy (needs practice)
- **Recommendations:** "Practice J, K, L keys in Drill Mode"

**Technical Approach:**
- Shared `ProgressChart` component (Recharts library)
- Data from `ProgressTracker` (in `shared-core`)
- Charts lazy-loaded (not needed during typing)
- Downsampling for large datasets (>1000 sessions)
- Export feature: CSV/JSON download (desktop), API export (web)

**Performance Optimization:**
- Charts rendered on separate screen (not during typing)
- Data aggregation on backend/local storage (not computed in real-time)
- Virtualized lists for session history (if >100 sessions)

---

## 6. Professional Color Scheme & Themes

### Design Decision: Dark Mode Default with Theme Options

**Primary Theme: Dark Mode (Default)**

**Rationale:**
- Target market: Speed seekers, professionals (18-35)
- Long typing sessions (reduced eye strain)
- Matches Monkeytype aesthetic (gold standard)
- High contrast improves speed and accuracy

**Color Palette (Dark Mode):**

```css
/* Background and surfaces */
--bg-primary: #1a1a1a;      /* Main background */
--bg-secondary: #2d2d2d;    /* Cards, panels */
--bg-tertiary: #3a3a3a;     /* Hover states */

/* Text */
--text-primary: #ffffff;     /* Primary text (high contrast) */
--text-secondary: #a0a0a0;   /* Secondary text */
--text-dim: #4b5563;         /* Already typed characters */

/* Typing feedback */
--correct: #10b981;          /* Green - correct keystroke */
--incorrect: #ef4444;        /* Red - error */
--current: #3b82f6;          /* Blue - current character */
--pending: #e5e7eb;          /* Light gray - upcoming */

/* Accents */
--accent-primary: #3b82f6;   /* Blue - buttons, links */
--accent-success: #10b981;   /* Green - success states */
--accent-warning: #f59e0b;   /* Amber - warnings */
--accent-error: #ef4444;     /* Red - errors */

/* Charts and visualizations */
--chart-primary: #3b82f6;    /* Blue */
--chart-secondary: #8b5cf6;  /* Purple */
--chart-tertiary: #10b981;   /* Green */
```

**Alternative Themes:**

**Light Mode:**
- Background: `#ffffff`
- Text: `#1a1a1a`
- Same accent colors (adjusted for light background)
- Higher contrast ratios (WCAG AAA compliance)

**Pastel Mode (Optional):**
- Background: Soft pastel grey `#f8f9fa`
- Text: Dark charcoal `#2d3748`
- Accents:
  - Correct: Pastel green `#68d391`
  - Incorrect: Pastel red `#fc8181`
  - Current: Pastel blue `#63b3ed`
- For users who prefer calming aesthetic
- Not default (doesn't match target market preference)

**High Contrast Mode (Accessibility):**
- Maximum contrast ratios (WCAG AAA)
- Black and white primarily
- Bold borders and outlines
- No subtle grays (clear distinction)

**Technical Approach:**
- CSS custom properties for theme switching
- Theme preference stored:
  - Desktop: Tauri Store (local persistence)
  - Web: User account settings (API)
- Smooth theme transitions (Framer Motion, 200ms)
- System theme detection: Default to OS preference on first launch

---

## 7. Typography System

### Design Decision: Monospace for Typing, Sans-Serif for UI

**Typing Text Font (Monospace):**

```css
font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
```

**Rationale:**
- Monospace: Every character same width (easier to track position)
- Cursor placement more predictable
- Feels like a code editor (appeals to developers in target market)
- Native font stacks (fast loading, OS-appropriate)

**UI Text Font (Sans-Serif):**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

**Rationale:**
- System fonts: Native feel, instant loading
- Clean, modern appearance
- High readability for instructions and UI elements

**Typography Scale:**

```css
/* Typing text */
--text-typing-xl: 32px;      /* Large mode */
--text-typing-lg: 28px;      /* Default */
--text-typing-md: 24px;      /* Compact mode */
--text-typing-sm: 20px;      /* Small screens */

/* UI text */
--text-5xl: 48px;            /* Page headings */
--text-4xl: 36px;            /* Section headings */
--text-3xl: 28px;            /* Large metrics (WPM display) */
--text-2xl: 24px;            /* Card headings */
--text-xl: 20px;             /* Large body text */
--text-lg: 18px;             /* Body text */
--text-base: 16px;           /* Default body text */
--text-sm: 14px;             /* Small text, labels */
--text-xs: 12px;             /* Very small text, captions */

/* Line heights */
--leading-tight: 1.2;        /* Headings */
--leading-normal: 1.5;       /* Body text, typing text */
--leading-relaxed: 1.75;     /* Large paragraphs */

/* Font weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Technical Approach:**
- Font display: `swap` (prevent invisible text during loading)
- No custom font downloads (use system fonts only for MVP)
- Responsive typography: Scale down on smaller screens
- User preference: Font size adjustment in settings (±4px)

---

## 8. Animation & Interaction Design

### Design Decision: Smooth Transitions, Minimal During Typing

**Animation Philosophy:**
- **During Typing:** Minimal animations (don't distract from hot path)
- **Page Transitions:** Smooth, polished (Framer Motion)
- **Feedback:** Immediate visual response (<2ms for keystrokes)

**Hot Path Animations (Typing):**

```css
/* Character color transitions */
.character {
  transition: color 100ms ease-out;
}

/* Error shake (very subtle) */
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.character--incorrect {
  animation: error-shake 200ms ease-out;
}

/* Key press feedback (virtual keyboard) */
.key--pressed {
  transform: scale(0.95);
  transition: transform 100ms ease-out;
}
```

**Page Transitions (Cold Path):**

```typescript
// Framer Motion example
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  <DashboardPage />
</motion.div>
```

**Interaction Feedback:**

**Keystroke Feedback:**
- Visual: Instant color change (<2ms)
- Audio (Optional): Subtle click sound (can be disabled)
- Haptic (Future): Vibration on mobile (not MVP)

**Button Feedback:**
- Hover: Background color change (150ms transition)
- Click: Scale down slightly (100ms)
- Active: Accent color border

**Success Celebrations:**
- Session complete: Confetti animation (brief, dismissible)
- Personal best: Green glow effect
- Achievement unlocked: Slide-in notification

**Performance Requirements:**
- All animations: 60fps (hardware-accelerated)
- Keystroke response: <2ms (no animation delays hot path)
- Page transitions: <300ms (perceived as instant)
- No jank: Monitor FPS, optimize if drops below 60fps

**Technical Approach:**
- Framer Motion for complex animations (page transitions)
- CSS transitions for simple animations (color changes)
- Hardware acceleration: `transform` and `opacity` only (GPU-accelerated)
- Reduce motion support: Respect `prefers-reduced-motion` (accessibility)

---

## 9. Hot Path Performance Architecture

### Design Decision: <2ms Keystroke Latency

**Performance Target:** Desktop: <2ms, Web: <5ms (from keystroke to screen update)

**Rationale:**
- Monkeytype (web): ~8ms latency
- Native desktop apps: 1-2ms latency
- KeyFlow goal: Match native apps, beat web competitors

**Hot Path vs Cold Path:**

**Hot Path (Critical - <2ms):**
- Keystroke validation (`InputValidator.validate()`)
- Metrics calculation (`MetricsCalculator.calculateWPM()`)
- UI update (React setState, render)

**Cold Path (Non-Critical - No Latency Constraint):**
- Session persistence (debounced, background)
- Sync operations (queued, non-blocking)
- Analytics calculation (after session ends)
- Chart rendering (separate screen)

### Hot Path Architecture

**Component Latency Breakdown:**

| Operation | Target | Strategy |
|-----------|--------|----------|
| Input validation | <0.1ms | Pure function, no side effects |
| WPM calculation | <0.1ms | Memoization, 95% cache hit rate |
| Accuracy calculation | <0.1ms | Memoization, 98% cache hit rate |
| Keystroke recording | <0.1ms | Append to array (non-blocking) |
| Observer notification | <0.5ms | Set iteration (fast) |
| React setState | <1ms | Zustand (minimal re-renders) |
| Browser rendering | <1ms | Hardware-accelerated CSS |
| **TOTAL** | **<2ms** | End-to-end latency |

**Pure Function Design (InputValidator):**

```typescript
// ✅ GOOD: Pure function, <0.1ms
class InputValidator {
  validateKeystroke(event: KeystrokeEvent): ValidationResult {
    const { key, expected, position, timestamp } = event;
    
    // Simple character comparison (fastest possible)
    const correct = key === expected;
    
    return {
      correct,
      expected,
      actual: key,
      position,
      timestamp
    };
  }
}

// ❌ BAD: Async operation, adds latency
class InputValidator {
  async validateKeystroke(event: KeystrokeEvent): Promise<ValidationResult> {
    await this.logToDatabase(event);  // DON'T DO THIS ON HOT PATH!
    return { correct: event.key === event.expected };
  }
}
```

**Memoization Strategy (MetricsCalculator):**

```typescript
class MetricsCalculator {
  private wpmCache = new Map<string, number>();
  private maxCacheSize = 100;  // LRU eviction
  
  calculateWPM(keystrokes: Keystroke[]): number {
    // Generate cache key (length + timestamp)
    const cacheKey = `${keystrokes.length}:${keystrokes[keystrokes.length - 1]?.timestamp || 0}`;
    
    // Check cache first (fast path, ~0.01ms)
    if (this.wpmCache.has(cacheKey)) {
      return this.wpmCache.get(cacheKey)!;
    }
    
    // Cache miss: compute (slow path, ~0.3ms)
    const correctChars = keystrokes.filter(k => k.correct).length;
    const timeMinutes = (
      keystrokes[keystrokes.length - 1].timestamp - keystrokes[0].timestamp
    ) / 60000;
    
    const wpm = (correctChars / 5) / timeMinutes;
    
    // Store in cache
    this.wpmCache.set(cacheKey, wpm);
    
    // Evict oldest if cache too large
    if (this.wpmCache.size > this.maxCacheSize) {
      const firstKey = this.wpmCache.keys().next().value;
      this.wpmCache.delete(firstKey);
    }
    
    return wpm;
  }
}
```

**Observer Pattern (Event Decoupling):**

```typescript
// TypingSession notifies observers (UI components)
class TypingSession {
  private observers = new Set<TypingEventHandler>();
  
  subscribe(handler: TypingEventHandler): () => void {
    this.observers.add(handler);
    return () => this.observers.delete(handler);  // Cleanup function
  }
  
  private notify(event: TypingEvent): void {
    // Fast iteration with Set
    this.observers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        // Don't let observer errors break hot path
        console.error('Observer error:', error);
      }
    });
  }
  
  processKeystroke(key: string): void {
    const timestamp = performance.now();
    
    // 1. Validate (pure function, <0.1ms)
    const validation = this.validator.validate(key, this.getExpectedChar());
    
    // 2. Calculate metrics (memoized, <0.1ms)
    const metrics = this.calculator.calculate(this);
    
    // 3. Notify observers (fast, <0.5ms)
    this.notify({
      validation,
      metrics,
      timestamp
    });
  }
}

// React component subscribes
useEffect(() => {
  const unsubscribe = session.subscribe((event) => {
    setMetrics(event.metrics);  // Trigger re-render
  });
  
  return unsubscribe;  // Cleanup on unmount
}, [session]);
```

**Hot Path Rules (Enforced in Code Review):**

```typescript
// ✅ ALLOWED on hot path:
// - Pure functions (deterministic, no side effects)
// - Synchronous operations only
// - In-memory operations (no I/O)
// - Memoization/caching
// - Observer pattern (decoupling)

// ❌ FORBIDDEN on hot path:
// - Async/await operations
// - IPC calls (Tauri commands)
// - Network requests (API calls)
// - File system operations
// - Database queries
// - Heavy computation (>1ms)
// - React Context updates (use Zustand instead)
```

**Performance Monitoring:**

```typescript
// Measure hot path latency in development
if (process.env.NODE_ENV === 'development') {
  const start = performance.now();
  session.processKeystroke(key);
  const end = performance.now();
  
  if (end - start > 2) {
    console.warn(`Hot path exceeded 2ms: ${end - start}ms`);
  }
}

// Production monitoring (sampling, non-blocking)
// Send to analytics service every 100th keystroke
```

---

## 10. Platform-Specific Design Patterns

While 90% of the UI is shared, each platform has unique design considerations.

### Desktop (Tauri) Design Patterns

**Native Window Controls:**
- macOS: Traffic lights (close, minimize, maximize) in top-left
- Windows: Window controls in top-right
- Linux: Varies by DE (GNOME, KDE, etc.)
- Custom title bar (optional): Match app theme

**Offline-First UI Indicators:**
- "All data stored locally" message in settings
- "Sync pending" indicator when offline (if sync enabled)
- No "loading" states for local operations (instant)

**Local Storage Assurance:**
- Settings page: "Your data is stored locally on this computer"
- Export features: CSV/JSON download (user owns their data)
- Import features: Restore from backup

**System Integration:**
- Native notifications (session complete, personal best)
- System tray icon (optional): Quick access to start practice
- Keyboard shortcuts: Global hotkeys (Cmd/Ctrl+Shift+K to open)

**Performance Indicators:**
- Settings page: "Keystroke latency: 1.8ms" (show performance achievement)
- About page: "Native desktop app powered by Tauri"

**Native Menus (Desktop):**
```
File
  └─ Export Data (CSV)
  └─ Export Data (JSON)
  └─ Import Data
  └─ Settings
  └─ Quit

Edit
  └─ Copy Results
  └─ Preferences

View
  └─ Toggle Fullscreen
  └─ Toggle Virtual Keyboard
  └─ Zoom In
  └─ Zoom Out
  └─ Reset Zoom

Window
  └─ Minimize
  └─ Zoom

Help
  └─ Documentation
  └─ Keyboard Shortcuts
  └─ Report Issue
  └─ About KeyFlow
```

---

### Web (Next.js) Design Patterns

**Browser Navigation:**
- Standard web header with logo and navigation links
- Breadcrumbs for deep pages (Dashboard > History > Session Details)
- Back button functionality (browser history)

**Authentication UI:**
- Login/Signup flows (Clerk or Supabase Auth UI)
- "Sign in to sync progress" prompts
- Account settings page (email, password, profile)

**Cloud Status Indicators:**
- "Synced" checkmark icon (when data saved to cloud)
- Loading states for API calls (skeleton screens)
- Error states: "Failed to save. Retrying..."

**Responsive Design:**
- Desktop: Full layout with sidebar
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation (even if not optimized for typing)
- Touch-friendly buttons (larger hit areas)

**Progressive Loading:**
- Skeleton screens for charts (while data loads)
- Lazy-loaded components (charts, heavy UI)
- Image optimization (Next.js Image component)
- Code splitting (reduce initial bundle size)

**Offline Detection:**
- Banner: "No internet connection. Some features unavailable."
- Disable cloud-dependent features (sync, leaderboards)
- Show cached data if available

**SEO Optimization (Marketing Pages):**
- Server-side rendering for landing page
- Meta tags for social sharing
- Structured data (JSON-LD)
- Sitemap generation

**Web-Specific Navigation:**
```
┌──────────────────────────────────┐
│ [Logo] KeyFlow                   │
│                                  │
│  Home  Practice  Dashboard  Settings  [Login]
└──────────────────────────────────┘
```

---

### Shared Design Language (Both Platforms)

**Identical Across Desktop and Web:**
- Typing interface components (same React components)
- Color schemes and themes (same CSS variables)
- Typography hierarchy (same fonts and sizes)
- Animation timing and easing (same Framer Motion configs)
- Error states and feedback (same validation logic)
- Accessibility patterns (same ARIA labels)

**User Expectation:**
- "Typing experience feels identical on desktop and web"
- "Only difference: Desktop is faster and works offline"
- "Web is accessible from anywhere, desktop is for serious practice"

---

## 11. Accessibility Design

### Design Decision: WCAG 2.1 AA Compliance (Minimum)

**Color Contrast:**
- Text on background: Minimum 4.5:1 (AA standard)
- Large text (>18pt): Minimum 3:1
- High contrast mode: 7:1 (AAA standard)

**Keyboard Navigation:**
- All interactive elements: Tab order
- Skip links: "Skip to main content"
- Focus indicators: Visible outline (not removed with CSS)
- Keyboard shortcuts: Documented and customizable

**Screen Reader Support:**
- Semantic HTML: `<main>`, `<nav>`, `<article>`, `<section>`
- ARIA labels: Descriptive labels for all interactive elements
- ARIA live regions: Announce WPM changes (optional, can be verbose)
- Alt text: All images and icons

**Focus Management:**
- Modal dialogs: Trap focus, return focus on close
- Page transitions: Move focus to main content
- Error messages: Announce to screen readers

**Reduced Motion:**
- Respect `prefers-reduced-motion` media query
- Disable animations if user prefers
- Keep essential feedback (color changes)

**Font Size:**
- User-adjustable font size (settings)
- Respects browser zoom (web)
- Respects system font size settings (desktop)

**Audio Feedback:**
- Optional (can be disabled)
- Visual alternatives (color changes)
- No essential information via audio only

---

## 12. Responsive Design Strategy

### Desktop (Primary Target)

**Optimized Screen Sizes:**
- **Large Desktop:** 1920x1080+ (full layout, sidebar always visible)
- **Desktop:** 1280x800 (standard layout)
- **Small Desktop:** 1024x768 (compact layout, reduced spacing)

**Window Sizing:**
- Minimum width: 800px
- Minimum height: 600px
- Resizable window (user can adjust)
- Fullscreen mode available

**Layout Strategy:**
```
┌─────────────────────────────────────┐
│ [Header: Logo, Navigation]          │
├──────┬──────────────────────────────┤
│ Side │  Main Content Area           │
│ bar  │                              │
│      │  [Typing Interface]          │
│      │                              │
│      │                              │
├──────┴──────────────────────────────┤
│ [Footer: Metrics, Progress]         │
└─────────────────────────────────────┘
```

---

### Web (Secondary Target)

**Optimized Screen Sizes:**
- **Desktop:** 1280x800+ (same as desktop app)
- **Tablet:** 768-1024px (collapsible sidebar)
- **Mobile:** 320-767px (bottom navigation, simplified layout)

**Responsive Breakpoints:**
```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

**Mobile Considerations (Not Optimized for MVP):**
- Typing on mobile: Difficult (on-screen keyboard)
- Focus: Desktop/laptop typing (where serious practice happens)
- Mobile: Dashboard viewing, progress tracking only
- Future: Mobile apps (v2.0) with optimized touch typing

---

## 13. Settings & Customization

### Design Decision: User Preferences Stored Locally/Cloud

**Settings Categories:**

**Appearance:**
- Theme: Dark, Light, Pastel, High Contrast
- Font size: 20px, 24px, 28px, 32px (typing text)
- Virtual keyboard: Show/Hide by default
- Color blind mode: Adjust colors for accessibility

**Typing:**
- Difficulty: Beginner, Intermediate, Advanced, Expert
- Content language: English (QWERTY only for MVP)
- Accuracy threshold: 90%, 95%, 98% (to proceed to next lesson)
- Auto-advance: Automatically start next lesson/test

**Audio:**
- Sound effects: On/Off
- Typing sounds: Mechanical keyboard clicks (optional)
- Volume: 0-100%
- Success sounds: Celebration on completion

**Performance:**
- Show metrics during typing: Hidden, Minimal, Standard, Full
- Show WPM graph: Real-time, End of session only
- Keystroke latency display: Show in settings (for power users)

**Sync (Desktop Only):**
- Cloud sync: Enabled/Disabled
- Sync frequency: After every session, Daily, Manual
- Account: Link/unlink cloud account

**Privacy:**
- Analytics: Enabled/Disabled (anonymized usage stats)
- Error reporting: Enabled/Disabled (crash reports)

**Settings UI Design:**
- Left sidebar: Categories
- Right panel: Settings for selected category
- Changes saved immediately (no "Save" button)
- Visual preview for themes (click to apply)

---

## 14. Design System Components

### Component Library (Shared UI)

**Core Components:**

```typescript
// Button
<Button variant="primary" size="lg" onClick={handleClick}>
  Start Practice
</Button>

// Card
<Card>
  <CardHeader>Lesson 5: Home Row</CardHeader>
  <CardContent>Practice ASDF JKL; keys</CardContent>
</Card>

// Modal
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>Session Complete</ModalHeader>
  <ModalBody>Your WPM: 78</ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Close</Button>
  </ModalFooter>
</Modal>

// Input
<Input 
  type="text" 
  placeholder="Search exercises..." 
  value={search}
  onChange={setSearch}
/>

// Select
<Select value={duration} onChange={setDuration}>
  <option value="30">30 seconds</option>
  <option value="60">60 seconds</option>
  <option value="120">2 minutes</option>
</Select>
```

**Design Tokens:**

```typescript
// Spacing scale (8px base unit)
const spacing = {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
};

// Border radius
const radius = {
  sm: '0.25rem',  // 4px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  full: '9999px', // Pill shape
};

// Shadows
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};
```

**Component States:**

```css
/* Hover */
.button:hover {
  background-color: var(--bg-tertiary);
  transform: translateY(-1px);
}

/* Active */
.button:active {
  transform: translateY(0);
}

/* Focus */
.button:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Disabled */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 15. Error States & Feedback

### Design Decision: Clear, Actionable Error Messages

**Error Types:**

**Validation Errors:**
- "Minimum accuracy not met. Try again to proceed."
- Clear indicator of what went wrong
- Actionable suggestion

**Network Errors (Web):**
- "Failed to save progress. Retrying in 5 seconds..."
- Auto-retry with countdown
- Option to retry manually

**Sync Errors (Desktop):**
- "Sync failed. Your data is safe locally."
- Reassure user data is not lost
- "Retry Sync" button

**Session Errors:**
- "Session interrupted. Would you like to resume?"
- Option to resume or start new

**Error UI Patterns:**

```typescript
// Toast notification (non-blocking)
<Toast type="error" duration={5000}>
  Failed to load exercise. Please try again.
</Toast>

// Inline error (form validation)
<Input 
  error="Username must be at least 3 characters"
  value={username}
/>

// Error boundary (component crash)
<ErrorBoundary fallback={<ErrorFallback />}>
  <TypingInterface />
</ErrorBoundary>
```

---

## Implementation Priorities

### Phase 1: MVP (Week 1-8)

**Must Have:**
1. ✅ Shared typing interface component (<2ms latency)
2. ✅ Four practice mode layouts (Lesson, Practice, Drill, Challenge)
3. ✅ Dark mode theme (default)
4. ✅ Progress dashboard (basic charts)
5. ✅ Desktop app with Tauri adapters
6. ✅ Web app with REST adapters
7. ✅ Settings page (theme, preferences)

**Good to Have:**
- Light mode theme
- Virtual keyboard (can be added in Week 5-6)
- Export features

**Skip for Now:**
- Pastel theme (v1.1)
- High contrast theme (v1.1)
- Audio feedback (v1.1)

---

### Phase 2: Polish (Week 9-12)

**Focus:**
- Animation polish (Framer Motion)
- Accessibility improvements
- Performance optimization
- Bug fixes from MVP feedback

---

## Success Metrics (Design)

**User Feedback Goals:**
- "Feels as fast as Monkeytype" ✅
- "Looks professional, not like a kid's app" ✅
- "I can finally use one app instead of four" ✅
- "Dark mode is perfect for long sessions" ✅
- "The UI gets out of my way when I'm typing" ✅

**Technical Goals:**
- Keystroke latency: <2ms (desktop), <5ms (web) ✅
- Lighthouse score: >90 (web) ✅
- Bundle size: <500KB (initial load, web) ✅
- Installer size: <20MB (desktop) ✅

**Accessibility Goals:**
- WCAG 2.1 AA compliance ✅
- Keyboard navigation: 100% coverage ✅
- Screen reader: Full support ✅

---

## Conclusion

This design plan provides a comprehensive roadmap for implementing KeyFlow's professional, minimal, fast typing tutor interface. Key principles:

1. **90% Code Reuse** - Monorepo with shared components
2. **Professional UI** - Monkeytype-inspired, not cartoonish
3. **Dark Mode Default** - Appeals to target market (speed seekers, 18-35)
4. **<2ms Latency** - Hot path optimization with pure functions and memoization
5. **Four Practice Modes** - Purpose-built UI for each mode
6. **Multi-Platform** - Desktop (Tauri) and Web (Next.js) from day 1

**Next Steps:**
1. Set up monorepo structure (Turborepo/Nx)
2. Create shared component packages
3. Implement core typing interface (<2ms hot path)
4. Build platform adapters (Tauri, REST)
5. Design four practice mode screens
6. Polish and test across platforms

This plan ensures KeyFlow delivers on its mission: **A professional typing tutor that consolidates four websites into one fast, beautiful, native application.**
