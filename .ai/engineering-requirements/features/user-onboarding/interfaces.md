# User Onboarding - TypeScript Interfaces

## Core Assessment Interfaces

### Assessment Data Structures

```typescript
// Main assessment result interface
interface InitialAssessment {
  id: string;
  userId: string;
  completedAt: Date;
  assessmentVersion: string;
  
  // Speed Assessment Results
  speedAssessment: SpeedAssessmentResult;
  
  // Accuracy Assessment Results
  accuracyAssessment: AccuracyAssessmentResult;
  
  // Finger Dexterity Results
  fingerDexterity: FingerDexterityResult;
  
  // Endurance Assessment Results
  enduranceAssessment: EnduranceAssessmentResult;
  
  // Overall Assessment
  overallScore: OverallAssessmentScore;
  
  // Metadata
  testDuration: number; // seconds
  totalKeystrokes: number;
  totalErrors: number;
  assessmentQuality: number; // 0-1, based on completion and consistency
}

// Speed assessment specific results
interface SpeedAssessmentResult {
  wpm: number;
  cpm: number; // Characters per minute
  kpm: number; // Keystrokes per minute
  sustainedWpm: number;
  burstWpm: number;
  speedConsistency: number; // 0-1, higher is more consistent
  speedTrend: 'increasing' | 'decreasing' | 'stable';
  peakPerformance: {
    wpm: number;
    duration: number; // seconds
    timestamp: number; // seconds from start
  };
}

// Accuracy assessment specific results
interface AccuracyAssessmentResult {
  overallAccuracy: number; // 0-1
  errorRate: number; // 0-1
  backspaceRate: number; // backspaces per character
  errorPatterns: ErrorPattern[];
  commonMistakes: CommonMistake[];
  accuracyConsistency: number; // 0-1
  accuracyTrend: 'improving' | 'declining' | 'stable';
  errorDistribution: {
    byFinger: Record<string, number>;
    byKey: Record<string, number>;
    byPosition: Record<string, number>;
  };
}

// Finger dexterity assessment results
interface FingerDexterityResult {
  leftHand: FingerPerformance;
  rightHand: FingerPerformance;
  individualFingers: IndividualFingerPerformance[];
  coordinationScore: number; // 0-1
  weakFingers: string[]; // Array of finger identifiers
  fingerBalance: number; // 0-1, how balanced left vs right hand performance
  dominantHand: 'left' | 'right' | 'balanced';
}

// Endurance assessment results
interface EnduranceAssessmentResult {
  sustainedAccuracy: number; // 0-1
  performanceDegradation: number; // 0-1, lower is better
  consistencyScore: number; // 0-1
  fatigueIndicators: FatigueIndicator[];
  enduranceLevel: 'low' | 'medium' | 'high' | 'excellent';
  staminaTrend: 'improving' | 'declining' | 'stable';
}

// Overall assessment score and classification
interface OverallAssessmentScore {
  compositeScore: number; // 0-100
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  strengths: string[];
  improvementAreas: string[];
  recommendedFocus: string[];
  confidenceLevel: number; // 0-1, how confident we are in the assessment
  nextSteps: string[];
}

// Individual finger performance data
interface FingerPerformance {
  accuracy: number; // 0-1
  speed: number; // WPM for this finger group
  errorRate: number; // 0-1
  coordination: number; // 0-1, how well it works with other fingers
  keyCoverage: string[]; // Keys this finger group is responsible for
  performanceRank: number; // 1-9, where 1 is best
}

// Individual finger performance (more granular)
interface IndividualFingerPerformance {
  finger: FingerType;
  accuracy: number;
  speed: number;
  errorRate: number;
  keyCoverage: string[];
  performanceRank: number;
  strength: 'weak' | 'average' | 'strong';
  coordination: number; // 0-1
  flexibility: number; // 0-1, how well it adapts to different keys
}

// Finger type enumeration
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

// Error pattern analysis
interface ErrorPattern {
  pattern: string; // e.g., "th" -> "ht"
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  context: string; // When this error typically occurs
  correctionRate: number; // 0-1, how often it gets corrected
  impact: number; // 0-1, how much it affects overall performance
}

// Common mistake analysis
interface CommonMistake {
  correctKey: string;
  mistakenKey: string;
  frequency: number;
  finger: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  context: string; // When this mistake typically occurs
  correctionTime: number; // Average time to correct (ms)
}

// Fatigue indicator analysis
interface FatigueIndicator {
  metric: string; // e.g., "accuracy", "speed", "error_rate"
  startValue: number;
  endValue: number;
  degradation: number; // 0-1, how much performance dropped
  severity: 'low' | 'medium' | 'high';
  onsetTime: number; // When fatigue started (seconds from start)
  recoveryTime?: number; // How long to recover (seconds)
}
```

### Assessment Session Interfaces

```typescript
// Assessment session management
interface AssessmentSession {
  id: string;
  userId: string;
  startedAt: Date;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  currentComponent: AssessmentComponent;
  completedComponents: AssessmentComponent[];
  sessionData: SessionData;
  configuration: AssessmentConfiguration;
}

// Assessment component types
type AssessmentComponent = 
  | 'speed' 
  | 'accuracy' 
  | 'finger_dexterity' 
  | 'endurance' 
  | 'complete';

// Session data collection
interface SessionData {
  keystrokes: KeystrokeEvent[];
  performanceMetrics: PerformanceMetrics;
  componentResults: Map<AssessmentComponent, ComponentResult>;
  userInteractions: UserInteraction[];
  systemEvents: SystemEvent[];
}

// Keystroke event data
interface KeystrokeEvent {
  timestamp: number; // milliseconds since session start
  key: string;
  isCorrect: boolean;
  isBackspace: boolean;
  finger: FingerType;
  keyPosition: KeyPosition;
  pressure?: number; // If pressure-sensitive keyboard
  duration?: number; // Key press duration (ms)
}

// Key position data
interface KeyPosition {
  row: number; // 0-based row number
  column: number; // 0-based column number
  hand: 'left' | 'right';
  finger: FingerType;
}

// Performance metrics (real-time)
interface PerformanceMetrics {
  currentWpm: number;
  currentAccuracy: number;
  currentErrorRate: number;
  keystrokesPerMinute: number;
  charactersPerMinute: number;
  backspaceRate: number;
  consistency: number; // 0-1
  trend: 'improving' | 'declining' | 'stable';
}

// Component result data
interface ComponentResult {
  component: AssessmentComponent;
  startedAt: Date;
  completedAt: Date;
  duration: number; // seconds
  data: ComponentData;
  quality: number; // 0-1, assessment quality
  validity: boolean; // Whether result is valid
}

// Component-specific data
interface ComponentData {
  keystrokes: KeystrokeEvent[];
  metrics: PerformanceMetrics;
  errors: ErrorEvent[];
  corrections: CorrectionEvent[];
  pauses: PauseEvent[];
}

// Error event data
interface ErrorEvent {
  timestamp: number;
  expectedKey: string;
  actualKey: string;
  finger: FingerType;
  context: string; // Surrounding text
  corrected: boolean;
  correctionTime?: number; // Time to correct (ms)
}

// Correction event data
interface CorrectionEvent {
  timestamp: number;
  originalKey: string;
  correctedKey: string;
  method: 'backspace' | 'delete' | 'overwrite';
  duration: number; // Time to correct (ms)
}

// Pause event data
interface PauseEvent {
  startTime: number;
  endTime: number;
  duration: number; // seconds
  reason: 'thinking' | 'fatigue' | 'distraction' | 'unknown';
  context: string; // What was being typed
}

// User interaction data
interface UserInteraction {
  timestamp: number;
  type: 'pause' | 'resume' | 'skip' | 'retry' | 'help';
  component: AssessmentComponent;
  data?: any; // Additional interaction data
}

// System event data
interface SystemEvent {
  timestamp: number;
  type: 'component_start' | 'component_end' | 'validation' | 'error';
  component: AssessmentComponent;
  message: string;
  data?: any; // Additional event data
}
```

### Assessment Configuration Interfaces

```typescript
// Assessment configuration
interface AssessmentConfiguration {
  version: string;
  components: AssessmentComponentConfig[];
  duration: {
    total: number; // Maximum total duration (seconds)
    perComponent: Record<AssessmentComponent, number>;
  };
  difficulty: {
    initial: 'easy' | 'medium' | 'hard';
    adaptive: boolean;
    adjustmentRules: DifficultyAdjustmentRule[];
  };
  validation: {
    minDuration: Record<AssessmentComponent, number>;
    maxErrors: Record<AssessmentComponent, number>;
    qualityThreshold: number; // 0-1
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    contrast: 'normal' | 'high';
    keyboardNavigation: boolean;
    screenReader: boolean;
  };
}

// Component-specific configuration
interface AssessmentComponentConfig {
  component: AssessmentComponent;
  enabled: boolean;
  duration: number; // seconds
  textSource: TextSource;
  validation: ComponentValidation;
  adaptive: boolean;
}

// Text source configuration
interface TextSource {
  type: 'standard' | 'adaptive' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  language: string;
  content: string[]; // Text passages
  selection: 'random' | 'sequential' | 'adaptive';
}

// Component validation rules
interface ComponentValidation {
  minDuration: number; // seconds
  maxDuration: number; // seconds
  minKeystrokes: number;
  maxErrors: number;
  minAccuracy: number; // 0-1
  qualityThreshold: number; // 0-1
}

// Difficulty adjustment rules
interface DifficultyAdjustmentRule {
  condition: DifficultyCondition;
  action: DifficultyAction;
  priority: number; // Higher number = higher priority
}

// Difficulty condition
interface DifficultyCondition {
  metric: 'accuracy' | 'speed' | 'error_rate' | 'consistency';
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  value: number | [number, number];
  duration: number; // How long condition must be true (seconds)
}

// Difficulty action
interface DifficultyAction {
  type: 'increase' | 'decrease' | 'maintain';
  component: AssessmentComponent;
  adjustment: number; // Percentage change
  maxAdjustment: number; // Maximum adjustment allowed
}
```

### Assessment Engine Interfaces

```typescript
// Main assessment engine interface
interface AssessmentEngine {
  startAssessment(userId: string, config: AssessmentConfiguration): Promise<AssessmentSession>;
  processKeystroke(sessionId: string, keystroke: KeystrokeEvent): Promise<void>;
  completeComponent(sessionId: string, component: AssessmentComponent): Promise<ComponentResult>;
  pauseAssessment(sessionId: string): Promise<void>;
  resumeAssessment(sessionId: string): Promise<void>;
  abandonAssessment(sessionId: string): Promise<void>;
  completeAssessment(sessionId: string): Promise<InitialAssessment>;
}

// Data collector interface
interface AssessmentDataCollector {
  recordKeystroke(sessionId: string, keystroke: KeystrokeEvent): void;
  calculateMetrics(sessionId: string): PerformanceMetrics;
  getComponentData(sessionId: string, component: AssessmentComponent): ComponentData;
  validateData(sessionId: string, component: AssessmentComponent): ValidationResult;
}

// Assessment validator interface
interface AssessmentValidator {
  validateSession(sessionId: string): Promise<ValidationResult>;
  validateComponent(component: AssessmentComponent, data: ComponentData): ValidationResult;
  validateAssessment(assessment: InitialAssessment): ValidationResult;
  suggestImprovements(assessment: InitialAssessment): ImprovementSuggestion[];
}

// Validation result
interface ValidationResult {
  isValid: boolean;
  quality: number; // 0-1
  issues: ValidationIssue[];
  recommendations: string[];
  retryRecommended: boolean;
}

// Validation issue
interface ValidationIssue {
  type: 'duration' | 'accuracy' | 'consistency' | 'completeness';
  severity: 'low' | 'medium' | 'high';
  message: string;
  component?: AssessmentComponent;
  suggestion?: string;
}

// Improvement suggestion
interface ImprovementSuggestion {
  type: 'retry' | 'adjust' | 'continue';
  component: AssessmentComponent;
  reason: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}
```

### Baseline Management Interfaces

```typescript
// Baseline manager interface
interface BaselineManager {
  createBaseline(assessment: InitialAssessment): Promise<UserBaseline>;
  updateBaseline(userId: string, newAssessment: InitialAssessment): Promise<UserBaseline>;
  getBaseline(userId: string): Promise<UserBaseline | null>;
  compareWithBaseline(userId: string, currentPerformance: PerformanceData): Promise<BaselineComparison>;
}

// User baseline data
interface UserBaseline {
  id: string;
  userId: string;
  assessmentId: string;
  createdAt: Date;
  isActive: boolean;
  
  // Baseline metrics
  metrics: BaselineMetrics;
  
  // Skill profile
  skillProfile: SkillProfile;
  
  // Goals
  goals: UserGoal[];
  
  // Recommendations
  recommendations: BaselineRecommendation[];
}

// Baseline metrics
interface BaselineMetrics {
  wpm: number;
  accuracy: number;
  errorRate: number;
  consistency: number;
  fingerPerformance: Record<FingerType, number>;
  weakKeys: string[];
  strongKeys: string[];
  overallScore: number; // 0-100
}

// Skill profile
interface SkillProfile {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  learningStyle: 'visual' | 'kinesthetic' | 'auditory' | 'mixed';
  practicePreferences: PracticePreference[];
}

// User goal
interface UserGoal {
  id: string;
  type: 'wpm' | 'accuracy' | 'consistency' | 'weak_key' | 'endurance';
  target: number;
  current: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  progress: number; // 0-1
}

// Practice preference
interface PracticePreference {
  type: 'duration' | 'difficulty' | 'mode' | 'schedule';
  value: any;
  weight: number; // 0-1, how important this preference is
}

// Baseline recommendation
interface BaselineRecommendation {
  type: 'practice' | 'goal' | 'focus' | 'schedule';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  expectedOutcome: string;
  timeframe: string;
}

// Baseline comparison
interface BaselineComparison {
  baseline: UserBaseline;
  current: PerformanceData;
  improvement: {
    wpm: number;
    accuracy: number;
    overall: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}
```

### UI Component Interfaces

```typescript
// Assessment UI component props
interface AssessmentUIProps {
  session: AssessmentSession;
  onKeystroke: (keystroke: KeystrokeEvent) => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onAbandon: () => void;
}

// Text display component props
interface TextDisplayProps {
  text: string;
  currentPosition: number;
  errors: ErrorEvent[];
  isActive: boolean;
  onPositionChange: (position: number) => void;
}

// Progress indicator props
interface ProgressIndicatorProps {
  currentComponent: AssessmentComponent;
  completedComponents: AssessmentComponent[];
  totalComponents: number;
  progress: number; // 0-1
}

// Results display props
interface ResultsDisplayProps {
  assessment: InitialAssessment;
  onRetry: () => void;
  onContinue: () => void;
  onExport: () => void;
}

// Metrics display props
interface MetricsDisplayProps {
  metrics: PerformanceMetrics;
  isRealTime: boolean;
  showTrend: boolean;
}
```

This comprehensive interface definition provides the TypeScript foundation for implementing the user onboarding assessment system with full type safety and clear data structures.
