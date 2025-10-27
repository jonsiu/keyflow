# Progress Dashboard - Interface Definitions

## Core Type Definitions

### Progress Statistics

```typescript
// packages/shared-types/dashboard.ts

/**
 * Main progress statistics interface
 * Aggregated data from all typing sessions
 */
interface ProgressStats {
  // Speed metrics
  currentWPM: number;           // Most recent session WPM
  bestWPM: number;             // Highest WPM achieved
  averageWPM: number;          // Average WPM across all sessions
  wpmTrend: number;            // WPM change over last 7 days
  
  // Accuracy metrics
  currentAccuracy: number;     // Most recent session accuracy
  bestAccuracy: number;        // Highest accuracy achieved
  averageAccuracy: number;     // Average accuracy across all sessions
  accuracyTrend: number;       // Accuracy change over last 7 days
  
  // Time metrics
  totalPracticeTime: number;   // Total practice time in seconds
  totalSessions: number;       // Total number of sessions
  averageSessionLength: number; // Average session length in minutes
  longestStreak: number;       // Longest consecutive practice streak (days)
  currentStreak: number;       // Current consecutive practice streak (days)
  
  // Improvement metrics
  improvementRate: number;     // WPM increase per week
  lastWeekImprovement: number; // WPM change from last week
  consistencyScore: number;    // 0-100, based on WPM variance
  lastPracticeDate: Date;      // Date of last practice session
  
  // Mode-specific metrics
  modeStats: {
    lesson: ModeStats;
    practice: ModeStats;
    drill: ModeStats;
    challenge: ModeStats;
  };
}

interface ModeStats {
  sessions: number;
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  totalTime: number;
  lastSession?: Date;
}

/**
 * Chart data point for visualization
 * Optimized for Recharts performance
 */
interface ChartDataPoint {
  date: Date;
  wpm: number;
  accuracy: number;
  mode: 'lesson' | 'practice' | 'drill' | 'challenge';
  sessionId: string;
  duration: number;            // Session duration in seconds
  errors: number;              // Number of errors in session
  charactersTyped: number;     // Total characters typed
}

/**
 * Session history for table display
 * Includes detailed session information
 */
interface SessionHistoryItem {
  id: string;
  mode: 'lesson' | 'practice' | 'drill' | 'challenge';
  startTime: Date;
  endTime: Date;
  duration: number;            // in seconds
  wpm: number;
  accuracy: number;
  errors: number;
  charactersTyped: number;
  correctChars: number;
  incorrectChars: number;
  exercise: {
    title: string;
    text: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    focusKeys?: string[];      // For lesson/drill modes
  };
  keystrokeData?: KeystrokeEvent[]; // Optional detailed data
}

/**
 * Weak key analysis for heatmap visualization
 * Identifies problem keys and improvement areas
 */
interface WeakKeyAnalysis {
  key: string;                 // The problematic key
  errorRate: number;           // 0-1, percentage of errors
  avgSpeed: number;            // Average time per keystroke in ms
  improvementTrend: number;    // -1 to 1, improvement over time
  practiceRecommendation: string; // Human-readable recommendation
  finger: FingerType;          // Which finger should press this key
  color: string;               // Heatmap color based on performance
  sessionsAnalyzed: number;    // Number of sessions used for analysis
  lastAnalyzed: Date;          // When this analysis was last updated
}

type FingerType = 
  | 'left_pinky' 
  | 'left_ring' 
  | 'left_middle' 
  | 'left_index' 
  | 'right_index' 
  | 'right_middle' 
  | 'right_ring' 
  | 'right_pinky' 
  | 'thumbs';

/**
 * Keyboard heatmap visualization data
 * Aggregated weak key analysis for entire keyboard
 */
interface KeyboardHeatmap {
  keys: WeakKeyAnalysis[];
  overallScore: number;        // 0-100, overall typing proficiency
  weakestFinger: FingerType;   // Finger with most errors
  improvementAreas: string[];  // Top 3 keys to practice
  lastUpdated: Date;           // When heatmap was last calculated
  totalSessionsAnalyzed: number; // Sessions used for analysis
}

/**
 * Achievement system interfaces
 * Gamification and motivation features
 */
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;                // Icon identifier or URL
  category: AchievementCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;           // When achievement was unlocked
  progress: number;            // 0-100, completion percentage
  criteria: AchievementCriteria;
  points: number;              // Points awarded for unlocking
}

type AchievementCategory = 
  | 'speed' 
  | 'accuracy' 
  | 'consistency' 
  | 'exploration' 
  | 'dedication' 
  | 'improvement';

interface AchievementCriteria {
  type: AchievementType;
  target: number;              // Target value to achieve
  timeframe?: TimeFrame;       // Time period for achievement
  mode?: PracticeMode;         // Specific mode requirement
  consecutive?: boolean;       // Must be consecutive (for streaks)
}

type AchievementType = 
  | 'wpm' 
  | 'accuracy' 
  | 'sessions' 
  | 'streak' 
  | 'mode_completion' 
  | 'time_practiced' 
  | 'errors_avoided';

type TimeFrame = 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'all_time';

type PracticeMode = 
  | 'lesson' 
  | 'practice' 
  | 'drill' 
  | 'challenge';

/**
 * Dashboard filtering and view options
 * User preferences for data display
 */
interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  mode: 'all' | PracticeMode;
  minWPM?: number;
  minAccuracy?: number;
  maxErrors?: number;
  exerciseDifficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface DashboardViewOptions {
  viewMode: 'overview' | 'detailed';
  chartType: 'line' | 'bar' | 'area';
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  showTrendLines: boolean;
  showTargetLines: boolean;
  chartAnimation: boolean;
}

/**
 * Data export interfaces
 * Various export formats and options
 */
interface ExportOptions {
  format: ExportFormat;
  dateRange: [Date, Date];
  includeKeystrokeData: boolean;
  includeCharts: boolean;
  includeWeakKeyAnalysis: boolean;
  includeAchievements: boolean;
  chartFormat: 'png' | 'svg' | 'pdf';
  dataFormat: 'csv' | 'json' | 'xlsx';
}

type ExportFormat = 'csv' | 'json' | 'xlsx' | 'png' | 'svg' | 'pdf';

interface ExportResult {
  data: Blob;
  filename: string;
  size: number;
  downloadUrl: string;
  expiresAt: Date;             // For temporary download URLs
}

/**
 * Chart configuration interfaces
 * Recharts-specific configuration
 */
interface ChartConfig {
  wpmTrend: {
    data: ChartDataPoint[];
    xAxis: 'date';
    yAxis: 'wpm';
    color: string;
    showTrendLine: boolean;
    showTargetLine: boolean;
    targetValue?: number;
  };
  accuracyTrend: {
    data: ChartDataPoint[];
    xAxis: 'date';
    yAxis: 'accuracy';
    color: string;
    targetLine: number;        // 95% accuracy target
    showTrendLine: boolean;
  };
  practiceFrequency: {
    data: { date: string; sessions: number }[];
    type: 'bar' | 'line';
    period: 'daily' | 'weekly' | 'monthly';
    color: string;
  };
  modeDistribution: {
    data: { mode: string; count: number; percentage: number }[];
    type: 'pie' | 'doughnut';
    colors: string[];
  };
  weakKeyImprovement: {
    data: { key: string; improvement: number; sessions: number }[];
    type: 'bar' | 'scatter';
    color: string;
  };
}

/**
 * Dashboard state management
 * Zustand store interface
 */
interface DashboardStore {
  // Data state
  sessions: SessionHistoryItem[];
  progressStats: ProgressStats;
  weakKeyAnalysis: WeakKeyAnalysis[];
  keyboardHeatmap: KeyboardHeatmap;
  achievements: Achievement[];
  chartData: ChartDataPoint[];
  
  // UI state
  filters: DashboardFilters;
  viewOptions: DashboardViewOptions;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
  
  // Pagination
  sessionHistoryPagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
  
  // Actions
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setViewOptions: (options: Partial<DashboardViewOptions>) => void;
  setTimeRange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
  setMode: (mode: 'all' | PracticeMode) => void;
  refreshData: () => Promise<void>;
  loadMoreSessions: () => Promise<void>;
  exportData: (options: ExportOptions) => Promise<ExportResult>;
  clearError: () => void;
}

/**
 * Component prop interfaces
 * React component prop definitions
 */
interface DashboardProps {
  userId: string;
  initialData?: Partial<DashboardStore>;
  onSessionClick?: (session: SessionHistoryItem) => void;
  onWeakKeyClick?: (key: string) => void;
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

interface MetricsOverviewProps {
  stats: ProgressStats;
  isLoading: boolean;
  className?: string;
}

interface WPMChartProps {
  data: ChartDataPoint[];
  config: ChartConfig['wpmTrend'];
  isLoading: boolean;
  onDataPointClick?: (point: ChartDataPoint) => void;
  className?: string;
}

interface AccuracyChartProps {
  data: ChartDataPoint[];
  config: ChartConfig['accuracyTrend'];
  isLoading: boolean;
  onDataPointClick?: (point: ChartDataPoint) => void;
  className?: string;
}

interface SessionHistoryProps {
  sessions: SessionHistoryItem[];
  pagination: DashboardStore['sessionHistoryPagination'];
  filters: DashboardFilters;
  isLoading: boolean;
  onSessionClick?: (session: SessionHistoryItem) => void;
  onLoadMore: () => void;
  className?: string;
}

interface WeakKeyHeatmapProps {
  heatmap: KeyboardHeatmap;
  onKeyClick?: (key: string) => void;
  showFingerGuidance: boolean;
  className?: string;
}

interface PracticeFrequencyProps {
  data: { date: string; sessions: number }[];
  config: ChartConfig['practiceFrequency'];
  isLoading: boolean;
  className?: string;
}

interface ModeDistributionProps {
  data: { mode: string; count: number; percentage: number }[];
  config: ChartConfig['modeDistribution'];
  onModeClick?: (mode: string) => void;
  className?: string;
}

interface AchievementsProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

interface ExportControlsProps {
  onExport: (options: ExportOptions) => Promise<ExportResult>;
  isLoading: boolean;
  className?: string;
}

/**
 * Hook interfaces
 * Custom React hooks for dashboard functionality
 */
interface UseProgressDataReturn {
  data: {
    sessions: SessionHistoryItem[];
    progressStats: ProgressStats;
    weakKeyAnalysis: WeakKeyAnalysis[];
    achievements: Achievement[];
  };
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseChartDataReturn {
  chartData: ChartDataPoint[];
  processedData: {
    wpmTrend: ChartDataPoint[];
    accuracyTrend: ChartDataPoint[];
    practiceFrequency: { date: string; sessions: number }[];
    modeDistribution: { mode: string; count: number; percentage: number }[];
  };
  isLoading: boolean;
  error: string | null;
}

interface UseWeakKeyAnalysisReturn {
  analysis: WeakKeyAnalysis[];
  heatmap: KeyboardHeatmap;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Utility function interfaces
 * Helper functions for data processing
 */
interface ChartDataProcessor {
  downsample: (data: ChartDataPoint[], maxPoints: number) => ChartDataPoint[];
  filterByDateRange: (data: ChartDataPoint[], range: [Date, Date]) => ChartDataPoint[];
  filterByMode: (data: ChartDataPoint[], mode: 'all' | PracticeMode) => ChartDataPoint[];
  calculateTrend: (data: ChartDataPoint[], metric: 'wpm' | 'accuracy') => number;
  groupByPeriod: (data: ChartDataPoint[], period: 'daily' | 'weekly' | 'monthly') => { date: string; sessions: number }[];
}

interface WeakKeyDetector {
  analyzeSessions: (sessions: SessionHistoryItem[]) => WeakKeyAnalysis[];
  calculateImprovementTrend: (key: string, sessions: SessionHistoryItem[]) => number;
  generateRecommendations: (analysis: WeakKeyAnalysis[]) => string[];
  updateHeatmap: (analysis: WeakKeyAnalysis[]) => KeyboardHeatmap;
}

interface ExportUtils {
  exportToCSV: (sessions: SessionHistoryItem[], options: ExportOptions) => Blob;
  exportToJSON: (data: any, options: ExportOptions) => Blob;
  exportToXLSX: (sessions: SessionHistoryItem[], options: ExportOptions) => Blob;
  exportChartAsImage: (chartRef: React.RefObject<any>, format: 'png' | 'svg') => Blob;
  generateFilename: (format: ExportFormat, dateRange: [Date, Date]) => string;
}

/**
 * API interfaces
 * Backend communication interfaces
 */
interface DashboardAPI {
  getSessions: (userId: string, filters: DashboardFilters) => Promise<SessionHistoryItem[]>;
  getProgressStats: (userId: string, dateRange: [Date, Date]) => Promise<ProgressStats>;
  getWeakKeyAnalysis: (userId: string, dateRange: [Date, Date]) => Promise<WeakKeyAnalysis[]>;
  getAchievements: (userId: string) => Promise<Achievement[]>;
  exportData: (userId: string, options: ExportOptions) => Promise<ExportResult>;
}

interface DashboardResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: Date;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Error handling interfaces
 * Error types and handling
 */
interface DashboardError {
  type: 'network' | 'validation' | 'processing' | 'export' | 'unknown';
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: DashboardError | null;
  errorInfo: any;
}

/**
 * Performance monitoring interfaces
 * Metrics and monitoring
 */
interface DashboardPerformanceMetrics {
  loadTime: number;            // Time to load dashboard
  chartRenderTime: number;     // Time to render all charts
  dataProcessingTime: number;  // Time to process data
  exportTime: number;          // Time to export data
  memoryUsage: number;         // Memory usage in MB
  frameRate: number;           // Average frame rate
}

interface PerformanceMonitor {
  startTiming: (label: string) => void;
  endTiming: (label: string) => number;
  measureMemory: () => number;
  measureFrameRate: () => number;
  getMetrics: () => DashboardPerformanceMetrics;
}
```

## Usage Examples

### Basic Dashboard Usage

```typescript
// Main dashboard component
const Dashboard: React.FC<DashboardProps> = ({ userId, onSessionClick }) => {
  const { data, isLoading, error, refresh } = useProgressData(userId);
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={refresh} />;
  
  return (
    <div className="dashboard">
      <MetricsOverview stats={data.progressStats} />
      <WPMChart 
        data={data.chartData} 
        onDataPointClick={onSessionClick}
      />
      <SessionHistory 
        sessions={data.sessions}
        onSessionClick={onSessionClick}
      />
      <WeakKeyHeatmap heatmap={data.weakKeyAnalysis} />
    </div>
  );
};
```

### Data Export Usage

```typescript
// Export functionality
const handleExport = async (format: ExportFormat) => {
  const options: ExportOptions = {
    format,
    dateRange: [startDate, endDate],
    includeCharts: true,
    includeWeakKeyAnalysis: true,
    chartFormat: 'png',
    dataFormat: 'csv'
  };
  
  const result = await exportData(options);
  downloadFile(result.data, result.filename);
};
```

### Weak Key Analysis Usage

```typescript
// Weak key detection and analysis
const { analysis, heatmap, refresh } = useWeakKeyAnalysis(userId);

const handleKeyClick = (key: string) => {
  // Navigate to drill mode for specific key
  navigate(`/drill?focus=${key}`);
};
```

This comprehensive interface definition provides all the TypeScript types needed for the progress dashboard feature, ensuring type safety and clear contracts between components.
