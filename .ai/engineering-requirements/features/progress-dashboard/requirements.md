# Progress Dashboard - Feature Requirements

## Overview

The Progress Dashboard is a shared React component that provides comprehensive analytics and progress tracking for KeyFlow users. It consolidates typing performance data across all practice modes and presents it in an intuitive, visually appealing interface.

## Strategic Context

**User Research Validation:**
- "Users want to see their improvement over time" (final-analysis.md)
- "Progress tracking motivates continued practice" (user research findings)
- "Visual representation of weak spots helps targeted improvement" (Keybr analysis)

**Business Value:**
- Increases user engagement and retention
- Provides data-driven insights for improvement
- Differentiates from basic typing sites
- Enables data export for power users

## Core Requirements

### 1. Shared Component Architecture

**Priority: CRITICAL**

**Location:** `packages/shared-ui/components/Dashboard`

**Requirements:**
- Shared React component used by both desktop (Tauri) and web (Next.js)
- Identical appearance and functionality across platforms
- 90%+ code reuse between desktop and web
- TypeScript interfaces in `packages/shared-types`

**Technical Specifications:**
```typescript
// packages/shared-types
interface ProgressStats {
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  totalPracticeTime: number;    // seconds
  totalSessions: number;
  weakKeys: WeakKeyAnalysis[];
  improvementRate: number;      // WPM increase per week
}

interface SessionHistory {
  sessions: TypingSession[];
  chartData: ChartDataPoint[];  // Downsampled for Recharts
  filters: {
    dateRange: [Date, Date];
    mode: 'all' | 'lesson' | 'practice' | 'drill' | 'challenge';
  };
}

interface ChartDataPoint {
  wpm: number;
  accuracy: number;
  date: Date;
  mode: 'lesson' | 'practice' | 'drill' | 'challenge';
  sessionId: string;
}
```

### 2. Performance Metrics Display

**Priority: CRITICAL**

**Requirements:**
- Real-time WPM over time chart (Recharts with downsampling)
- Accuracy trends visualization
- Session count and total practice time
- Best performance highlights
- Improvement rate calculation

**Technical Specifications:**
```typescript
interface MetricsDisplay {
  // Primary metrics
  currentWPM: number;
  bestWPM: number;
  averageWPM: number;
  currentAccuracy: number;
  bestAccuracy: number;
  averageAccuracy: number;
  
  // Time metrics
  totalPracticeTime: number;    // in seconds
  totalSessions: number;
  averageSessionLength: number; // in minutes
  longestStreak: number;        // consecutive days
  
  // Improvement metrics
  improvementRate: number;      // WPM increase per week
  lastWeekImprovement: number;  // WPM change from last week
  consistencyScore: number;     // 0-100, based on variance
}
```

**Performance Requirements:**
- Charts render smoothly (<16ms frame time)
- Data downsampling to max 100 points for Recharts
- Use `React.memo` for expensive components
- Lazy load on web with `dynamic(import())`

### 3. Session History Management

**Priority: HIGH**

**Requirements:**
- Last 30 sessions displayed in table format
- Sortable by date, WPM, accuracy, mode
- Filter by practice mode (lesson, practice, drill, challenge)
- Date range filtering (last week, month, 3 months, all time)
- Session details on click/expand

**Technical Specifications:**
```typescript
interface SessionHistoryTable {
  sessions: TypingSession[];
  sortBy: 'date' | 'wpm' | 'accuracy' | 'mode';
  sortOrder: 'asc' | 'desc';
  filters: {
    dateRange: [Date, Date];
    mode: 'all' | 'lesson' | 'practice' | 'drill' | 'challenge';
    minWPM?: number;
    minAccuracy?: number;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
}

interface SessionDetails {
  id: string;
  mode: 'lesson' | 'practice' | 'drill' | 'challenge';
  startTime: Date;
  endTime: Date;
  duration: number;           // seconds
  wpm: number;
  accuracy: number;
  errors: number;
  charactersTyped: number;
  correctChars: number;
  incorrectChars: number;
  exercise: {
    title: string;
    text: string;
    difficulty: string;
  };
  keystrokeData: KeystrokeEvent[];  // Optional, for detailed analysis
}
```

### 4. Weak Key Analysis & Heatmap

**Priority: HIGH**

**Requirements:**
- Visual heatmap of keyboard showing weak keys
- Color-coded by error rate and speed
- Click to drill specific weak keys
- Improvement tracking over time
- Finger-specific analysis

**Technical Specifications:**
```typescript
interface WeakKeyAnalysis {
  key: string;
  errorRate: number;          // 0-1, percentage of errors
  avgSpeed: number;           // ms per keystroke
  improvementTrend: number;   // -1 to 1, improvement over time
  practiceRecommendation: string;
  finger: 'left_pinky' | 'left_ring' | 'left_middle' | 'left_index' | 
          'right_index' | 'right_middle' | 'right_ring' | 'right_pinky' | 
          'thumbs';
  color: string;              // Heatmap color based on performance
}

interface KeyboardHeatmap {
  keys: WeakKeyAnalysis[];
  overallScore: number;       // 0-100, overall typing proficiency
  weakestFinger: string;      // Finger with most errors
  improvementAreas: string[]; // Top 3 keys to practice
}
```

### 5. Progress Visualization Charts

**Priority: HIGH**

**Requirements:**
- WPM trend line chart (last 30 days)
- Accuracy trend line chart
- Practice frequency bar chart
- Mode distribution pie chart
- Weak key improvement over time

**Technical Specifications:**
```typescript
interface ChartConfig {
  wpmTrend: {
    data: ChartDataPoint[];
    xAxis: 'date';
    yAxis: 'wpm';
    color: string;
    showTrendLine: boolean;
  };
  accuracyTrend: {
    data: ChartDataPoint[];
    xAxis: 'date';
    yAxis: 'accuracy';
    color: string;
    targetLine: number;       // 95% accuracy target
  };
  practiceFrequency: {
    data: { date: string; sessions: number }[];
    type: 'bar';
    period: 'daily' | 'weekly';
  };
  modeDistribution: {
    data: { mode: string; count: number; percentage: number }[];
    type: 'pie';
  };
}
```

### 6. Data Export Functionality

**Priority: MEDIUM**

**Requirements:**
- Export session data to CSV
- Export progress charts as images (PNG/SVG)
- Export full data as JSON
- Export weak key analysis report
- Scheduled exports (future feature)

**Technical Specifications:**
```typescript
interface ExportOptions {
  format: 'csv' | 'json' | 'png' | 'svg';
  dateRange: [Date, Date];
  includeKeystrokeData: boolean;
  includeCharts: boolean;
  includeWeakKeyAnalysis: boolean;
}

interface ExportResult {
  data: Blob;
  filename: string;
  size: number;
  downloadUrl: string;
}
```

### 7. Achievement System

**Priority: MEDIUM**

**Requirements:**
- Milestone achievements (first 50 WPM, 100 WPM, etc.)
- Consistency achievements (7-day streak, 30-day streak)
- Mode-specific achievements (complete all lessons, etc.)
- Progress badges and visual rewards
- Achievement history and statistics

**Technical Specifications:**
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'consistency' | 'exploration';
  unlockedAt?: Date;
  progress: number;           // 0-100, completion percentage
  criteria: AchievementCriteria;
}

interface AchievementCriteria {
  type: 'wpm' | 'accuracy' | 'sessions' | 'streak' | 'mode_completion';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  mode?: 'lesson' | 'practice' | 'drill' | 'challenge';
}
```

## Technical Implementation

### 1. Component Structure

```
packages/shared-ui/components/Dashboard/
├── Dashboard.tsx                 # Main dashboard component
├── components/
│   ├── MetricsOverview.tsx      # Key metrics display
│   ├── WPMChart.tsx            # WPM trend chart
│   ├── AccuracyChart.tsx       # Accuracy trend chart
│   ├── SessionHistory.tsx      # Session history table
│   ├── WeakKeyHeatmap.tsx      # Keyboard heatmap
│   ├── PracticeFrequency.tsx   # Practice frequency chart
│   ├── ModeDistribution.tsx    # Mode usage pie chart
│   ├── Achievements.tsx        # Achievement display
│   └── ExportControls.tsx      # Data export controls
├── hooks/
│   ├── useProgressData.ts      # Data fetching and processing
│   ├── useChartData.ts         # Chart data preparation
│   └── useWeakKeyAnalysis.ts   # Weak key analysis logic
├── utils/
│   ├── chartDataProcessor.ts   # Data downsampling and processing
│   ├── weakKeyDetector.ts     # Weak key identification
│   └── exportUtils.ts          # Data export utilities
└── types/
    └── dashboard.ts            # Dashboard-specific types
```

### 2. Data Flow Architecture

```typescript
// Data flow: Backend → Store → Dashboard → Charts
interface DashboardDataFlow {
  // 1. Data fetching
  sessions: TypingSession[];           // From backend/local storage
  userProgress: UserProgress;          // Aggregated progress data
  
  // 2. Data processing
  chartData: ChartDataPoint[];         // Downsampled for performance
  weakKeyAnalysis: WeakKeyAnalysis[];  // Processed keystroke data
  achievements: Achievement[];         // Calculated achievements
  
  // 3. State management
  filters: DashboardFilters;           // User-selected filters
  viewMode: 'overview' | 'detailed';   // Dashboard view mode
  selectedTimeRange: TimeRange;        // Selected time period
}
```

### 3. Performance Optimizations

**Chart Performance:**
- Downsample data to max 100 points using LTTB algorithm
- Use `React.memo` for chart components
- Lazy load charts on web with `dynamic(import())`
- Virtual scrolling for session history table

**Data Processing:**
- Memoize expensive calculations with `useMemo`
- Debounce filter changes (300ms)
- Cache processed data in Zustand store
- Background processing for heavy computations

**Memory Management:**
- Limit session history to last 100 sessions in memory
- Paginate large datasets
- Clean up chart data on component unmount
- Use WeakMap for temporary calculations

### 4. Responsive Design

**Breakpoints:**
- Mobile: <768px (simplified view, stacked charts)
- Tablet: 768px-1024px (2-column layout)
- Desktop: >1024px (full dashboard with all charts)

**Mobile Optimizations:**
- Swipeable chart tabs
- Collapsible sections
- Touch-friendly controls
- Simplified metrics display

## Integration Points

### 1. Shared Core Integration

**Data Sources:**
- `packages/shared-core/analytics/ProgressTracker.ts`
- `packages/shared-core/analytics/WeakSpotDetector.ts`
- `packages/shared-core/typing/TypingSession.ts`

**Business Logic:**
- WPM calculation (5 characters = 1 word)
- Accuracy calculation (correct/total characters)
- Weak key identification (statistical analysis)
- Achievement criteria evaluation

### 2. Platform-Specific Adaptations

**Desktop (Tauri):**
- Local data storage via Tauri Store
- File system access for exports
- Native file dialogs for export
- Offline functionality

**Web (Next.js):**
- REST API data fetching
- Cloud storage for exports
- Browser download for exports
- Online-only functionality

### 3. State Management

**Zustand Store Structure:**
```typescript
interface DashboardStore {
  // Data
  sessions: TypingSession[];
  progressStats: ProgressStats;
  weakKeyAnalysis: WeakKeyAnalysis[];
  achievements: Achievement[];
  
  // UI State
  filters: DashboardFilters;
  selectedTimeRange: TimeRange;
  viewMode: 'overview' | 'detailed';
  isLoading: boolean;
  
  // Actions
  setFilters: (filters: DashboardFilters) => void;
  setTimeRange: (range: TimeRange) => void;
  setViewMode: (mode: 'overview' | 'detailed') => void;
  refreshData: () => Promise<void>;
  exportData: (options: ExportOptions) => Promise<ExportResult>;
}
```

## Acceptance Criteria

### Phase 1: Core Dashboard (Week 5)

**Must Have:**
- [ ] Dashboard component renders in both desktop and web
- [ ] WPM trend chart displays last 30 days
- [ ] Session history table shows last 30 sessions
- [ ] Basic metrics display (WPM, accuracy, practice time)
- [ ] Data loads from backend/local storage
- [ ] Responsive design works on mobile/tablet/desktop

### Phase 2: Advanced Analytics (Week 6)

**Must Have:**
- [ ] Weak key heatmap with color coding
- [ ] Accuracy trend chart with target line
- [ ] Practice frequency visualization
- [ ] Mode distribution pie chart
- [ ] Filter by date range and practice mode
- [ ] Sort session history by different criteria

### Phase 3: Export & Achievements (Week 7)

**Must Have:**
- [ ] Export session data to CSV
- [ ] Export charts as images (PNG/SVG)
- [ ] Basic achievement system (speed milestones)
- [ ] Achievement progress tracking
- [ ] Export functionality works on both platforms

### Performance Requirements

**Desktop:**
- [ ] Dashboard loads in <500ms
- [ ] Charts render smoothly (<16ms frame time)
- [ ] Data processing completes in <200ms
- [ ] Export operations complete in <2s

**Web:**
- [ ] First Contentful Paint <1.5s
- [ ] Charts load progressively
- [ ] API calls complete in <100ms
- [ ] Export downloads start in <1s

## Future Enhancements (Post-MVP)

### v1.2 Features
- Advanced filtering options (keyboard layout, difficulty)
- Custom date range selection
- Chart customization (colors, themes)
- Data comparison tools (before/after analysis)

### v1.3 Features
- AI-powered insights and recommendations
- Goal setting and tracking
- Social features (share progress, compare with friends)
- Advanced export formats (PDF reports)

### v1.4 Features
- Real-time collaboration (teacher/student dashboards)
- Custom dashboard widgets
- Data visualization themes
- Advanced analytics (regression analysis, predictions)

## Dependencies

### External Libraries
- **Recharts**: Chart rendering and visualization
- **Framer Motion**: Smooth animations and transitions
- **Date-fns**: Date manipulation and formatting
- **Lodash**: Data processing utilities

### Internal Dependencies
- `@keyflow/shared-types`: Type definitions
- `@keyflow/shared-core`: Business logic and data processing
- `@keyflow/shared-ui`: Base UI components

### Platform Dependencies
- **Desktop**: Tauri Store for local data persistence
- **Web**: REST API for cloud data synchronization
- **Backend**: PostgreSQL for data storage and retrieval

## Success Metrics

### User Engagement
- Dashboard viewed by 80%+ of active users
- Average session time on dashboard: 2+ minutes
- Export functionality used by 20%+ of users
- Achievement system increases practice frequency by 15%

### Performance
- Dashboard load time <500ms (desktop), <1.5s (web)
- Chart rendering <16ms frame time
- Data processing <200ms for 1000+ sessions
- Zero crashes during normal usage

### Data Quality
- WPM calculations match reference platforms (Monkeytype)
- Weak key detection accuracy >90%
- Achievement criteria evaluation 100% accurate
- Export data integrity verified

This comprehensive progress dashboard will provide users with the insights they need to improve their typing skills while maintaining the high performance standards required for KeyFlow's success.
