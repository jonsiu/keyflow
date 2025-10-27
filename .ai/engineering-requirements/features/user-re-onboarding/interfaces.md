# User Re-Onboarding - TypeScript Interfaces

## Core Re-Onboarding Interfaces

### Gap Analysis Interfaces

```typescript
// Main gap analysis result
interface GapAnalysis {
  id: string;
  userId: string;
  gapStartDate: Date;
  gapEndDate: Date;
  gapLengthDays: number;
  gapType: 'short' | 'medium' | 'long' | 'extended';
  
  // Last activity information
  lastActivity: LastActivity;
  
  // Previous milestone reference
  previousMilestone: UserMilestone;
  
  // Skill retention estimation
  skillRetentionEstimate: number; // 0-1
  
  // Recommended action
  recommendedAction: 'reminder' | 'skill_check' | 're_assessment' | 'full_reonboarding';
  
  // Context information
  context: GapContext;
  
  // Analysis metadata
  analyzedAt: Date;
  confidence: number; // 0-1, confidence in analysis
}

// Last activity details
interface LastActivity {
  date: Date;
  type: 'practice' | 'assessment' | 'dashboard' | 'settings' | 'export';
  duration: number; // minutes
  performance?: AssessmentData;
  platform: 'desktop' | 'web';
  sessionId: string;
}

// Gap context information
interface GapContext {
  platform?: 'desktop' | 'web';
  reason?: 'voluntary_break' | 'platform_switch' | 'life_event' | 'technical_issue' | 'unknown';
  seasonal?: boolean;
  lifeEvent?: boolean;
  technicalIssue?: boolean;
  userReported?: boolean;
  notes?: string;
}

// Gap classification result
interface GapClassification {
  gapType: 'short' | 'medium' | 'long' | 'extended';
  severity: 'low' | 'medium' | 'high' | 'critical';
  skillImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
  recommendedIntervention: InterventionType;
  urgency: 'low' | 'medium' | 'high';
  estimatedRecoveryTime: number; // days
}

// Intervention types
type InterventionType = 
  | 'gentle_reminder' 
  | 'skill_check' 
  | 're_assessment' 
  | 'full_reonboarding' 
  | 'custom_plan';
```

### Milestone Management Interfaces

```typescript
// User milestone data
interface UserMilestone {
  id: string;
  userId: string;
  milestoneType: 'initial' | 're_assessment' | 'checkpoint' | 'achievement' | 'manual';
  achievedAt: Date;
  gapDays?: number; // Days since previous milestone
  
  // Assessment data
  assessmentData: AssessmentData;
  
  // Milestone context
  context: MilestoneContext;
  
  // Status
  isActiveBaseline: boolean;
  isVerified: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

// Milestone context
interface MilestoneContext {
  gapReason?: 'voluntary_break' | 'platform_switch' | 'life_event' | 'unknown';
  previousMilestoneId?: string;
  skillRetention: number; // 0-1, how much skill was retained
  improvementAreas: string[];
  maintainedStrengths: string[];
  newChallenges: string[];
  platform: 'desktop' | 'web';
  assessmentType: 'initial' | 'quick_check' | 'comprehensive' | 'full_reonboarding';
}

// Assessment data (shared with onboarding)
interface AssessmentData {
  wpm: number;
  accuracy: number;
  errorRate: number;
  consistency: number;
  fingerPerformance: Record<FingerType, number>;
  weakKeys: string[];
  strongKeys: string[];
  overallScore: number; // 0-100
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
}

// Milestone comparison result
interface MilestoneComparison {
  milestone1: UserMilestone;
  milestone2: UserMilestone;
  timeGap: number; // days between milestones
  
  // Performance changes
  performanceChanges: PerformanceChanges;
  
  // Skill analysis
  skillAnalysis: SkillAnalysis;
  
  // Gap impact
  gapImpact: GapImpact;
  
  // Recommendations
  recommendations: MilestoneRecommendation[];
}

// Performance changes between milestones
interface PerformanceChanges {
  wpm: {
    absolute: number; // WPM difference
    relative: number; // percentage change
    trend: 'improving' | 'declining' | 'stable';
    significance: 'low' | 'medium' | 'high';
  };
  accuracy: {
    absolute: number; // accuracy difference
    relative: number; // percentage change
    trend: 'improving' | 'declining' | 'stable';
    significance: 'low' | 'medium' | 'high';
  };
  overall: {
    score: number; // overall change score
    trend: 'improving' | 'declining' | 'stable';
    significance: 'low' | 'medium' | 'high';
  };
}

// Skill analysis between milestones
interface SkillAnalysis {
  maintainedStrengths: string[];
  lostSkills: string[];
  newWeaknesses: string[];
  improvementAreas: string[];
  skillRetention: number; // 0-1
  skillRecovery: number; // 0-1, how much skill was recovered
  newSkills: string[];
  degradedSkills: string[];
}

// Gap impact analysis
interface GapImpact {
  skillRetention: number; // 0-1
  recoveryNeeded: boolean;
  estimatedRecoveryTime: number; // days
  riskLevel: 'low' | 'medium' | 'high';
  criticalAreas: string[];
  maintainedAreas: string[];
  impactFactors: ImpactFactor[];
}

// Impact factor
interface ImpactFactor {
  factor: string; // e.g., 'gap_length', 'previous_skill_level', 'practice_frequency'
  impact: number; // 0-1, how much this factor impacted performance
  description: string;
  recommendation?: string;
}

// Milestone recommendation
interface MilestoneRecommendation {
  type: 'practice' | 'goal' | 'focus' | 'schedule' | 'assessment';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  expectedOutcome: string;
  timeframe: string;
  targetMilestone?: string;
}
```

### Re-Assessment Interfaces

```typescript
// Re-assessment result
interface ReAssessmentResult {
  id: string;
  userId: string;
  assessmentType: 'quick_check' | 'comprehensive' | 'full_reonboarding';
  completedAt: Date;
  
  // Gap analysis reference
  gapAnalysis: GapAnalysis;
  
  // Performance comparison
  comparison: ReAssessmentComparison;
  
  // Current performance data
  currentPerformance: AssessmentData;
  
  // Recommendations
  recommendations: ReAssessmentRecommendation;
  
  // New milestone
  newMilestone: UserMilestone;
  
  // Metadata
  duration: number; // seconds
  quality: number; // 0-1
  confidence: number; // 0-1
}

// Re-assessment comparison
interface ReAssessmentComparison {
  vsPreviousMilestone: MilestoneComparison;
  vsOriginalBaseline: MilestoneComparison;
  skillRetention: number; // 0-1
  performanceChange: PerformanceChange;
  trendAnalysis: TrendAnalysis;
}

// Performance change summary
interface PerformanceChange {
  wpm: number; // change in WPM
  accuracy: number; // change in accuracy
  overall: number; // overall change score
  significance: 'low' | 'medium' | 'high';
  direction: 'improvement' | 'decline' | 'stable';
}

// Trend analysis
interface TrendAnalysis {
  shortTerm: 'improving' | 'declining' | 'stable';
  longTerm: 'improving' | 'declining' | 'stable';
  consistency: number; // 0-1
  volatility: number; // 0-1, how much performance varies
  predictability: number; // 0-1, how predictable the performance is
}

// Re-assessment recommendations
interface ReAssessmentRecommendation {
  practiceFocus: string[];
  goalAdjustments: GoalAdjustment[];
  skillRecovery: SkillRecoveryPlan;
  reEngagement: ReEngagementPlan;
  nextSteps: NextStep[];
}

// Goal adjustment
interface GoalAdjustment {
  goalId: string;
  type: 'modify' | 'pause' | 'accelerate' | 'replace';
  currentTarget: number;
  newTarget: number;
  reason: string;
  timeframe: string;
  expectedOutcome: string;
}

// Skill recovery plan
interface SkillRecoveryPlan {
  focusAreas: string[];
  practiceIntensity: 'light' | 'moderate' | 'intensive';
  estimatedRecoveryTime: number; // days
  milestones: RecoveryMilestone[];
  exercises: RecoveryExercise[];
  schedule: PracticeSchedule;
}

// Recovery milestone
interface RecoveryMilestone {
  id: string;
  description: string;
  targetDate: Date;
  metrics: Record<string, number>;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

// Recovery exercise
interface RecoveryExercise {
  id: string;
  name: string;
  type: 'practice' | 'drill' | 'lesson' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // minutes
  frequency: 'daily' | 'weekly' | 'as_needed';
  description: string;
  expectedOutcome: string;
}

// Practice schedule
interface PracticeSchedule {
  frequency: 'daily' | 'every_other_day' | 'weekly' | 'custom';
  duration: number; // minutes per session
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
  daysOfWeek: number[]; // 0-6, Sunday = 0
  reminders: boolean;
  adaptive: boolean; // Adjust based on performance
}

// Re-engagement plan
interface ReEngagementPlan {
  strategy: 'gradual' | 'intensive' | 'focused' | 'exploratory';
  duration: number; // days
  phases: EngagementPhase[];
  goals: EngagementGoal[];
  incentives: EngagementIncentive[];
}

// Engagement phase
interface EngagementPhase {
  id: string;
  name: string;
  duration: number; // days
  focus: string;
  activities: string[];
  successCriteria: string[];
  nextPhase?: string;
}

// Engagement goal
interface EngagementGoal {
  id: string;
  description: string;
  target: number;
  timeframe: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

// Engagement incentive
interface EngagementIncentive {
  type: 'achievement' | 'progress' | 'social' | 'gamification';
  description: string;
  trigger: string;
  reward: string;
  active: boolean;
}

// Next step
interface NextStep {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  timeframe: string;
  action: string;
  expectedOutcome: string;
  dependencies: string[];
}
```

### Re-Engagement Interfaces

```typescript
// Welcome back message
interface WelcomeBackMessage {
  id: string;
  userId: string;
  gapAnalysis: GapAnalysis;
  messageType: 'gentle' | 'encouraging' | 'motivational' | 'urgent';
  
  // Message content
  title: string;
  content: string;
  highlights: MessageHighlight[];
  
  // Call to action
  callToAction: CallToAction;
  
  // Personalization
  personalization: MessagePersonalization;
  
  // Metadata
  generatedAt: Date;
  expiresAt: Date;
  priority: 'low' | 'medium' | 'high';
}

// Message highlight
interface MessageHighlight {
  type: 'achievement' | 'progress' | 'milestone' | 'strength' | 'improvement';
  title: string;
  description: string;
  value?: number;
  trend?: 'improving' | 'declining' | 'stable';
  icon?: string;
}

// Call to action
interface CallToAction {
  type: 'assessment' | 'practice' | 'dashboard' | 'goals' | 'custom';
  text: string;
  action: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
}

// Message personalization
interface MessagePersonalization {
  userName: string;
  gapLength: string; // e.g., "2 weeks"
  lastAchievement: string;
  currentLevel: string;
  improvementAreas: string[];
  strengths: string[];
  tone: 'professional' | 'friendly' | 'motivational' | 'casual';
}

// Re-engagement plan
interface ReEngagementPlan {
  id: string;
  userId: string;
  gapAnalysis: GapAnalysis;
  strategy: 'gradual' | 'intensive' | 'focused' | 'exploratory';
  
  // Plan phases
  phases: ReEngagementPhase[];
  
  // Success metrics
  successMetrics: SuccessMetric[];
  
  // Timeline
  startDate: Date;
  endDate: Date;
  estimatedDuration: number; // days
  
  // Status
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  currentPhase: string;
  progress: number; // 0-1
}

// Re-engagement phase
interface ReEngagementPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  focus: string;
  
  // Activities
  activities: ReEngagementActivity[];
  
  // Success criteria
  successCriteria: SuccessCriterion[];
  
  // Transitions
  nextPhase?: string;
  conditions: PhaseTransition[];
}

// Re-engagement activity
interface ReEngagementActivity {
  id: string;
  name: string;
  type: 'assessment' | 'practice' | 'lesson' | 'challenge' | 'social';
  description: string;
  duration: number; // minutes
  frequency: 'once' | 'daily' | 'weekly' | 'as_needed';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedOutcome: string;
  prerequisites: string[];
}

// Success criterion
interface SuccessCriterion {
  metric: string;
  target: number;
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  timeframe: string;
  weight: number; // 0-1, importance of this criterion
}

// Phase transition
interface PhaseTransition {
  condition: string;
  nextPhase: string;
  probability: number; // 0-1, likelihood of this transition
}

// Success metric
interface SuccessMetric {
  name: string;
  description: string;
  type: 'engagement' | 'performance' | 'retention' | 'satisfaction';
  target: number;
  current: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
}
```

### Historical Data Interfaces

```typescript
// Historical data manager
interface HistoricalDataManager {
  getMilestoneHistory(userId: string): Promise<UserMilestone[]>;
  getGapHistory(userId: string): Promise<GapAnalysis[]>;
  getProgressTrends(userId: string): Promise<ProgressTrendAnalysis>;
  getSkillEvolution(userId: string): Promise<SkillEvolutionAnalysis>;
  getEngagementPatterns(userId: string): Promise<EngagementPatternAnalysis>;
}

// Progress trend analysis
interface ProgressTrendAnalysis {
  userId: string;
  analysisPeriod: {
    start: Date;
    end: Date;
  };
  
  // Overall trends
  overallTrend: 'improving' | 'declining' | 'stable' | 'volatile';
  improvementRate: number; // WPM per month
  consistencyScore: number; // 0-1
  
  // Performance trends
  wpmTrend: TrendData;
  accuracyTrend: TrendData;
  consistencyTrend: TrendData;
  
  // Gap analysis
  gapImpact: GapImpactAnalysis;
  recoveryPatterns: RecoveryPattern[];
  
  // Predictions
  predictions: PerformancePrediction[];
  
  // Recommendations
  recommendations: TrendRecommendation[];
}

// Trend data
interface TrendData {
  direction: 'up' | 'down' | 'stable';
  slope: number; // Rate of change
  volatility: number; // 0-1, how much it varies
  confidence: number; // 0-1, confidence in trend
  dataPoints: TrendDataPoint[];
}

// Trend data point
interface TrendDataPoint {
  date: Date;
  value: number;
  context?: string;
  milestoneId?: string;
}

// Gap impact analysis
interface GapImpactAnalysis {
  averageGapLength: number; // days
  skillRetentionByGapLength: Record<string, number>; // gap length -> retention
  recoveryTimeByGapLength: Record<string, number>; // gap length -> recovery days
  criticalGapLength: number; // days beyond which recovery is difficult
  riskFactors: RiskFactor[];
}

// Recovery pattern
interface RecoveryPattern {
  gapLength: number; // days
  recoveryTime: number; // days
  recoveryRate: number; // 0-1, how quickly skills are recovered
  factors: RecoveryFactor[];
  successRate: number; // 0-1, how often this pattern succeeds
}

// Recovery factor
interface RecoveryFactor {
  factor: string;
  impact: number; // 0-1, how much this factor affects recovery
  description: string;
  recommendation?: string;
}

// Risk factor
interface RiskFactor {
  factor: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
  probability: number; // 0-1, likelihood of this risk
}

// Performance prediction
interface PerformancePrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: number; // days
  confidence: number; // 0-1
  factors: PredictionFactor[];
}

// Prediction factor
interface PredictionFactor {
  factor: string;
  impact: number; // 0-1, how much this factor affects prediction
  description: string;
  trend: 'positive' | 'negative' | 'neutral';
}

// Trend recommendation
interface TrendRecommendation {
  type: 'practice' | 'assessment' | 'goal' | 'schedule' | 'focus';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  expectedOutcome: string;
  timeframe: string;
  confidence: number; // 0-1
}

// Skill evolution analysis
interface SkillEvolutionAnalysis {
  userId: string;
  analysisPeriod: {
    start: Date;
    end: Date;
  };
  
  // Skill development
  skillDevelopment: SkillDevelopment[];
  overallImprovement: number; // 0-1
  improvementAreas: string[];
  maintainedStrengths: string[];
  
  // Learning patterns
  learningPatterns: LearningPattern[];
  practiceEffectiveness: PracticeEffectiveness[];
  
  // Recommendations
  recommendations: SkillEvolutionRecommendation[];
}

// Skill development
interface SkillDevelopment {
  skill: string;
  startLevel: number; // 0-1
  endLevel: number; // 0-1
  improvement: number; // 0-1
  trend: 'improving' | 'declining' | 'stable';
  milestones: SkillMilestone[];
}

// Skill milestone
interface SkillMilestone {
  date: Date;
  level: number; // 0-1
  description: string;
  achievement: string;
}

// Learning pattern
interface LearningPattern {
  pattern: string;
  frequency: number; // 0-1, how often this pattern occurs
  effectiveness: number; // 0-1, how effective this pattern is
  description: string;
  recommendation?: string;
}

// Practice effectiveness
interface PracticeEffectiveness {
  practiceType: string;
  effectiveness: number; // 0-1
  frequency: number; // 0-1
  improvement: number; // 0-1
  recommendation: string;
}

// Skill evolution recommendation
interface SkillEvolutionRecommendation {
  type: 'focus' | 'practice' | 'assessment' | 'goal';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  expectedOutcome: string;
  timeframe: string;
  confidence: number; // 0-1
}

// Engagement pattern analysis
interface EngagementPatternAnalysis {
  userId: string;
  analysisPeriod: {
    start: Date;
    end: Date;
  };
  
  // Engagement patterns
  engagementPatterns: EngagementPattern[];
  sessionPatterns: SessionPattern[];
  gapPatterns: GapPattern[];
  
  // Predictions
  engagementPredictions: EngagementPrediction[];
  
  // Recommendations
  recommendations: EngagementRecommendation[];
}

// Engagement pattern
interface EngagementPattern {
  pattern: string;
  frequency: number; // 0-1
  duration: number; // average duration in minutes
  effectiveness: number; // 0-1
  description: string;
  recommendation?: string;
}

// Session pattern
interface SessionPattern {
  dayOfWeek: number; // 0-6, Sunday = 0
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  duration: number; // average duration in minutes
  frequency: number; // sessions per week
  effectiveness: number; // 0-1
}

// Gap pattern
interface GapPattern {
  gapLength: number; // days
  frequency: number; // 0-1, how often this gap length occurs
  impact: number; // 0-1, how much this gap impacts performance
  recoveryTime: number; // average recovery time in days
  riskLevel: 'low' | 'medium' | 'high';
}

// Engagement prediction
interface EngagementPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: number; // days
  confidence: number; // 0-1
  factors: EngagementFactor[];
}

// Engagement factor
interface EngagementFactor {
  factor: string;
  impact: number; // 0-1
  description: string;
  trend: 'positive' | 'negative' | 'neutral';
}

// Engagement recommendation
interface EngagementRecommendation {
  type: 'schedule' | 'reminder' | 'incentive' | 'social' | 'gamification';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  expectedOutcome: string;
  timeframe: string;
  confidence: number; // 0-1
}
```

### Engine Interfaces

```typescript
// Gap detection engine
interface GapDetectionEngine {
  detectGap(userId: string): Promise<GapAnalysis>;
  classifyGap(gapAnalysis: GapAnalysis): Promise<GapClassification>;
  shouldTriggerReAssessment(userId: string, gapAnalysis: GapAnalysis): Promise<ReAssessmentTrigger>;
  analyzeGapImpact(userId: string, gapAnalysis: GapAnalysis): Promise<GapImpactAnalysis>;
}

// Re-assessment engine
interface ReAssessmentEngine {
  createReAssessment(userId: string, gapType: GapType, previousMilestone: UserMilestone): Promise<ReAssessmentSession>;
  processReAssessment(sessionId: string, assessmentData: AssessmentData): Promise<ReAssessmentResult>;
  createNewMilestone(userId: string, assessmentResult: ReAssessmentResult): Promise<UserMilestone>;
  compareMilestones(milestone1: UserMilestone, milestone2: UserMilestone): Promise<MilestoneComparison>;
}

// Re-engagement engine
interface ReEngagementEngine {
  generateWelcomeBackMessage(userId: string, gapAnalysis: GapAnalysis, milestoneHistory: UserMilestone[]): Promise<WelcomeBackMessage>;
  createReEngagementPlan(userId: string, currentPerformance: AssessmentData, previousPerformance: AssessmentData): Promise<ReEngagementPlan>;
  generateMotivationContent(userId: string, milestoneHistory: UserMilestone[]): Promise<MotivationContent>;
  updateEngagementPlan(planId: string, progress: number): Promise<ReEngagementPlan>;
}

// Historical data manager
interface HistoricalDataManager {
  getMilestoneHistory(userId: string): Promise<UserMilestone[]>;
  analyzeProgressTrends(milestones: UserMilestone[]): Promise<ProgressTrendAnalysis>;
  compareMilestones(milestone1: UserMilestone, milestone2: UserMilestone): Promise<MilestoneComparison>;
  getSkillEvolution(userId: string): Promise<SkillEvolutionAnalysis>;
  getEngagementPatterns(userId: string): Promise<EngagementPatternAnalysis>;
}

// Re-assessment trigger
interface ReAssessmentTrigger {
  shouldTrigger: boolean;
  triggerType: 'automatic' | 'user_requested' | 'performance_based' | 'pattern_based';
  urgency: 'low' | 'medium' | 'high';
  recommendedAction: InterventionType;
  estimatedDuration: number; // minutes
  reasoning: string;
  conditions: TriggerCondition[];
}

// Trigger condition
interface TriggerCondition {
  condition: string;
  met: boolean;
  weight: number; // 0-1, importance of this condition
  description: string;
}

// Re-assessment session
interface ReAssessmentSession {
  id: string;
  userId: string;
  gapAnalysis: GapAnalysis;
  assessmentType: 'quick_check' | 'comprehensive' | 'full_reonboarding';
  startedAt: Date;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  configuration: ReAssessmentConfiguration;
  results?: ReAssessmentResult;
}

// Re-assessment configuration
interface ReAssessmentConfiguration {
  version: string;
  assessmentType: 'quick_check' | 'comprehensive' | 'full_reonboarding';
  duration: number; // minutes
  components: AssessmentComponent[];
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  adaptive: boolean;
  validation: ReAssessmentValidation;
}

// Re-assessment validation
interface ReAssessmentValidation {
  minDuration: number; // minutes
  maxDuration: number; // minutes
  minAccuracy: number; // 0-1
  maxErrors: number;
  qualityThreshold: number; // 0-1
}

// Motivation content
interface MotivationContent {
  id: string;
  userId: string;
  contentType: 'achievement' | 'progress' | 'encouragement' | 'challenge' | 'social';
  title: string;
  content: string;
  highlights: MessageHighlight[];
  callToAction?: CallToAction;
  personalization: MessagePersonalization;
  generatedAt: Date;
  expiresAt: Date;
}
```

This comprehensive interface definition provides the TypeScript foundation for implementing the user re-onboarding system with full type safety, clear data structures, and robust functionality for managing returning users and their progress across usage gaps.
