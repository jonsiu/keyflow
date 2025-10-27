# User Re-Onboarding - Feature Requirements

## Overview

The User Re-Onboarding feature manages returning users who have experienced gaps in their KeyFlow usage. It detects usage patterns, triggers appropriate re-assessment workflows, and establishes new performance baselines while maintaining historical progress context.

## Strategic Context

**User Research Validation:**
- "Returning users need context about where they left off" (user retention research)
- "Skill retention varies significantly after usage gaps" (learning psychology research)
- "Multiple assessment points provide richer progress insights" (assessment methodology research)

**Business Value:**
- Prevents user churn through intelligent re-engagement
- Maintains accurate progress tracking across usage gaps
- Provides multiple milestone data for better analytics
- Creates personalized welcome-back experiences

## Core Requirements

### 1. Usage Gap Detection System

**Priority: CRITICAL**

**Location:** `packages/shared-core/reonboarding/GapDetectionEngine.ts`

**Gap Detection Logic:**

#### 1.1 Activity Monitoring
- **Last Activity Tracking**: Monitor user's last interaction with the app
- **Session Pattern Analysis**: Identify normal vs. abnormal usage patterns
- **Engagement Metrics**: Track depth of engagement in recent sessions
- **Platform Activity**: Monitor activity across desktop and web platforms

#### 1.2 Gap Classification
- **Short Gap (1-7 days)**: Minimal intervention, gentle reminder
- **Medium Gap (1-4 weeks)**: Moderate intervention, skill check suggested
- **Long Gap (1-3 months)**: Significant intervention, re-assessment recommended
- **Extended Gap (3+ months)**: Full re-onboarding, comprehensive re-assessment

#### 1.3 Contextual Analysis
- **Previous Performance**: Consider user's last known skill level
- **Historical Patterns**: Analyze past usage and improvement trends
- **Seasonal Factors**: Account for expected usage patterns (holidays, etc.)
- **Platform Migration**: Detect if user switched between desktop/web

### 2. Intelligent Re-Assessment Engine

**Priority: CRITICAL**

**Location:** `packages/shared-core/reonboarding/ReAssessmentEngine.ts`

**Re-Assessment Types:**

#### 2.1 Quick Skill Check (1-2 minutes)
- **Purpose**: Rapid assessment for short gaps
- **Components**:
  - 1-minute speed test
  - Basic accuracy check
  - Key performance indicators
- **Trigger**: Medium gaps (1-4 weeks)
- **Data Collected**:
  - Current WPM vs. last known WPM
  - Accuracy comparison
  - Performance trend analysis

#### 2.2 Comprehensive Re-Assessment (5-8 minutes)
- **Purpose**: Full re-evaluation for longer gaps
- **Components**:
  - Speed assessment (2 minutes)
  - Accuracy assessment (1 minute)
  - Finger dexterity check (2 minutes)
  - Endurance test (2-3 minutes)
- **Trigger**: Long gaps (1-3 months)
- **Data Collected**: Complete performance profile

#### 2.3 Full Re-Onboarding (10-15 minutes)
- **Purpose**: Complete re-evaluation for extended gaps
- **Components**:
  - Full initial assessment suite
  - Historical comparison analysis
  - Goal re-evaluation
  - Feature re-introduction
- **Trigger**: Extended gaps (3+ months)
- **Data Collected**: Complete baseline re-establishment

### 3. Multi-Milestone Progress Tracking

**Priority: CRITICAL**

**Location:** `packages/shared-types/milestones.ts`

**Milestone Management:**

#### 3.1 Milestone Types
```typescript
interface UserMilestone {
  id: string;
  userId: string;
  milestoneType: 'initial' | 're-assessment' | 'checkpoint' | 'achievement';
  achievedAt: Date;
  gapDays?: number; // Days since previous milestone
  assessmentData: AssessmentData;
  context: MilestoneContext;
  isActiveBaseline: boolean;
}

interface MilestoneContext {
  gapReason?: 'voluntary_break' | 'platform_switch' | 'life_event' | 'unknown';
  previousMilestoneId?: string;
  skillRetention: number; // 0-1, how much skill was retained
  improvementAreas: string[];
  maintainedStrengths: string[];
  newChallenges: string[];
}
```

#### 3.2 Progress Comparison Engine
- **Baseline Comparison**: Compare against original baseline
- **Previous Milestone Comparison**: Compare against last assessment
- **Trend Analysis**: Analyze progress trajectory across all milestones
- **Gap Impact Analysis**: Measure how usage gaps affected performance

### 4. Contextual Welcome-Back Experience

**Priority: HIGH**

**Location:** `packages/shared-ui/components/ReOnboarding`

**Welcome-Back Components:**

#### 4.1 Progress Summary Dashboard
- **Where You Left Off**: Visual summary of last known performance
- **Gap Impact Analysis**: How the break affected your skills
- **Achievement Highlights**: Key accomplishments before the gap
- **Current Status**: Quick overview of current performance level

#### 4.2 Personalized Re-Engagement
- **Skill Retention Report**: What you've maintained vs. what needs work
- **Recommended Actions**: Specific steps to get back on track
- **Goal Adjustment**: Update goals based on current performance
- **Practice Plan**: Customized plan to regain lost ground

#### 4.3 Feature Re-Introduction
- **New Features**: Highlight features added during the gap
- **Updated Interface**: Show any UI/UX changes
- **Best Practices**: Remind users of effective practice techniques
- **Community Updates**: Share community achievements and news

### 5. Adaptive Re-Assessment Triggers

**Priority: HIGH**

**Location:** `packages/shared-core/reonboarding/TriggerEngine.ts`

**Trigger Conditions:**

#### 5.1 Automatic Triggers
- **Time-Based**: Automatic trigger after X days of inactivity
- **Performance-Based**: Trigger if recent performance drops significantly
- **Pattern-Based**: Trigger if usage pattern changes dramatically
- **Platform-Based**: Trigger when switching between desktop/web

#### 5.2 User-Initiated Triggers
- **Manual Request**: User can request re-assessment anytime
- **Goal Achievement**: Trigger when major goals are achieved
- **Struggle Detection**: Trigger when user seems to be struggling
- **Feature Usage**: Trigger when using advanced features for first time

#### 5.3 Smart Timing
- **Optimal Timing**: Suggest re-assessment at optimal times
- **Avoid Interruption**: Don't interrupt active practice sessions
- **Respect User Preferences**: Honor user's notification preferences
- **Context Awareness**: Consider user's current activity and goals

### 6. Historical Data Integration

**Priority: CRITICAL**

**Location:** `packages/shared-core/reonboarding/HistoricalDataManager.ts`

**Data Integration Features:**

#### 6.1 Milestone History
- **Complete Timeline**: Full history of all assessments and milestones
- **Performance Trends**: Long-term performance trajectory analysis
- **Gap Analysis**: Impact of different gap lengths on performance
- **Recovery Patterns**: How quickly users regain lost skills

#### 6.2 Comparative Analytics
- **Baseline Evolution**: How baseline performance has changed over time
- **Improvement Rate**: Rate of improvement across different periods
- **Consistency Analysis**: Performance consistency across milestones
- **Goal Achievement**: Success rate for different types of goals

#### 6.3 Predictive Insights
- **Skill Retention Prediction**: Predict skill retention based on gap length
- **Recovery Time Estimation**: Estimate time needed to regain lost skills
- **Optimal Practice Recommendations**: Suggest practice intensity based on gap
- **Risk Assessment**: Identify users at risk of permanent skill loss

### 7. Re-Engagement Strategies

**Priority: HIGH**

**Location:** `packages/shared-core/reonboarding/ReEngagementEngine.ts`

**Engagement Strategies:**

#### 7.1 Personalized Messaging
- **Gap-Aware Messaging**: Messages that acknowledge the specific gap length
- **Progress-Aware Messaging**: Messages that reference previous achievements
- **Goal-Aware Messaging**: Messages that connect to user's goals
- **Context-Aware Messaging**: Messages that consider user's situation

#### 7.2 Motivation Techniques
- **Achievement Reminders**: Highlight past accomplishments
- **Progress Visualization**: Show improvement trajectory
- **Goal Reinforcement**: Remind users of their goals and why they matter
- **Community Connection**: Connect users with community achievements

#### 7.3 Gradual Re-Introduction
- **Ease Back In**: Start with easier exercises to rebuild confidence
- **Skill Refresh**: Focus on maintaining current level before pushing higher
- **Goal Adjustment**: Modify goals to be more achievable post-gap
- **Feature Graduation**: Gradually reintroduce advanced features

## Technical Implementation

### 1. Gap Detection Architecture

```typescript
class GapDetectionEngine {
  private activityTracker: ActivityTracker;
  private patternAnalyzer: PatternAnalyzer;
  private contextAnalyzer: ContextAnalyzer;
  
  async detectGap(userId: string): Promise<GapAnalysis> {
    // Analyze user activity patterns
    // Determine gap type and severity
    // Calculate gap impact on skills
    // Return gap analysis
  }
  
  async classifyGap(gapAnalysis: GapAnalysis): Promise<GapClassification> {
    // Classify gap severity
    // Determine appropriate intervention
    // Calculate skill retention estimate
    // Return classification
  }
  
  async shouldTriggerReAssessment(
    userId: string, 
    gapAnalysis: GapAnalysis
  ): Promise<ReAssessmentTrigger> {
    // Determine if re-assessment is needed
    // Calculate optimal timing
    // Consider user preferences
    // Return trigger decision
  }
}
```

### 2. Re-Assessment Engine

```typescript
class ReAssessmentEngine {
  private assessmentFactory: AssessmentFactory;
  private comparisonEngine: ComparisonEngine;
  private milestoneManager: MilestoneManager;
  
  async createReAssessment(
    userId: string, 
    gapType: GapType, 
    previousMilestone: UserMilestone
  ): Promise<ReAssessmentSession> {
    // Create appropriate assessment type
    // Configure for user's skill level
    // Set up comparison context
    // Return assessment session
  }
  
  async processReAssessment(
    sessionId: string, 
    assessmentData: AssessmentData
  ): Promise<ReAssessmentResult> {
    // Process assessment results
    // Compare with previous milestones
    // Calculate skill retention
    // Generate recommendations
  }
  
  async createNewMilestone(
    userId: string, 
    assessmentResult: ReAssessmentResult
  ): Promise<UserMilestone> {
    // Create new milestone
    // Update milestone history
    // Adjust baseline if needed
    // Return new milestone
  }
}
```

### 3. Historical Data Manager

```typescript
class HistoricalDataManager {
  private milestoneRepository: MilestoneRepository;
  private comparisonEngine: ComparisonEngine;
  private trendAnalyzer: TrendAnalyzer;
  
  async getMilestoneHistory(userId: string): Promise<UserMilestone[]> {
    // Retrieve complete milestone history
    // Sort by date
    // Include context and metadata
    // Return milestone array
  }
  
  async analyzeProgressTrends(
    milestones: UserMilestone[]
  ): Promise<ProgressTrendAnalysis> {
    // Analyze long-term trends
    // Identify patterns and cycles
    // Calculate improvement rates
    // Return trend analysis
  }
  
  async compareMilestones(
    milestone1: UserMilestone, 
    milestone2: UserMilestone
  ): Promise<MilestoneComparison> {
    // Compare two specific milestones
    // Calculate performance differences
    // Identify improvement areas
    // Return comparison result
  }
}
```

### 4. Re-Engagement Engine

```typescript
class ReEngagementEngine {
  private messageGenerator: MessageGenerator;
  private motivationEngine: MotivationEngine;
  private practicePlanner: PracticePlanner;
  
  async generateWelcomeBackMessage(
    userId: string, 
    gapAnalysis: GapAnalysis, 
    milestoneHistory: UserMilestone[]
  ): Promise<WelcomeBackMessage> {
    // Generate personalized welcome message
    // Include progress summary
    // Highlight achievements
    // Suggest next steps
  }
  
  async createReEngagementPlan(
    userId: string, 
    currentPerformance: AssessmentData, 
    previousPerformance: AssessmentData
  ): Promise<ReEngagementPlan> {
    // Create personalized re-engagement plan
    // Focus on skill recovery
    // Set appropriate goals
    // Suggest practice schedule
  }
  
  async generateMotivationContent(
    userId: string, 
    milestoneHistory: UserMilestone[]
  ): Promise<MotivationContent> {
    // Generate motivational content
    // Highlight achievements
    // Show progress trajectory
    // Encourage continued practice
  }
}
```

## Data Models

### 1. Gap Analysis

```typescript
interface GapAnalysis {
  userId: string;
  gapStartDate: Date;
  gapEndDate: Date;
  gapLengthDays: number;
  gapType: 'short' | 'medium' | 'long' | 'extended';
  lastActivity: {
    date: Date;
    type: 'practice' | 'assessment' | 'dashboard' | 'settings';
    duration: number; // minutes
    performance?: AssessmentData;
  };
  previousMilestone: UserMilestone;
  skillRetentionEstimate: number; // 0-1
  recommendedAction: 'reminder' | 'skill_check' | 're_assessment' | 'full_reonboarding';
  context: {
    platform?: 'desktop' | 'web';
    reason?: string;
    seasonal?: boolean;
    lifeEvent?: boolean;
  };
}
```

### 2. Re-Assessment Result

```typescript
interface ReAssessmentResult {
  id: string;
  userId: string;
  assessmentType: 'quick_check' | 'comprehensive' | 'full_reonboarding';
  completedAt: Date;
  gapAnalysis: GapAnalysis;
  
  // Performance Comparison
  comparison: {
    vsPreviousMilestone: MilestoneComparison;
    vsOriginalBaseline: MilestoneComparison;
    skillRetention: number; // 0-1
    performanceChange: {
      wpm: number; // change in WPM
      accuracy: number; // change in accuracy
      overall: number; // overall change score
    };
  };
  
  // New Performance Data
  currentPerformance: AssessmentData;
  
  // Recommendations
  recommendations: {
    practiceFocus: string[];
    goalAdjustments: GoalAdjustment[];
    skillRecovery: SkillRecoveryPlan;
    reEngagement: ReEngagementPlan;
  };
  
  // New Milestone
  newMilestone: UserMilestone;
}
```

### 3. Milestone Comparison

```typescript
interface MilestoneComparison {
  milestone1: UserMilestone;
  milestone2: UserMilestone;
  timeGap: number; // days between milestones
  
  // Performance Changes
  performanceChanges: {
    wpm: {
      absolute: number; // WPM difference
      relative: number; // percentage change
      trend: 'improving' | 'declining' | 'stable';
    };
    accuracy: {
      absolute: number; // accuracy difference
      relative: number; // percentage change
      trend: 'improving' | 'declining' | 'stable';
    };
    overall: {
      score: number; // overall change score
      trend: 'improving' | 'declining' | 'stable';
    };
  };
  
  // Skill Analysis
  skillAnalysis: {
    maintainedStrengths: string[];
    lostSkills: string[];
    newWeaknesses: string[];
    improvementAreas: string[];
  };
  
  // Gap Impact
  gapImpact: {
    skillRetention: number; // 0-1
    recoveryNeeded: boolean;
    estimatedRecoveryTime: number; // days
    riskLevel: 'low' | 'medium' | 'high';
  };
}
```

## Integration Points

### 1. Progress Dashboard Integration
- **Multi-Milestone View**: Show progress across all milestones
- **Gap Visualization**: Visual representation of usage gaps and their impact
- **Trend Analysis**: Long-term trend visualization across milestones
- **Recovery Tracking**: Track skill recovery after gaps

### 2. Assessment System Integration
- **Shared Assessment Engine**: Reuse assessment components from onboarding
- **Adaptive Difficulty**: Adjust difficulty based on historical performance
- **Context-Aware Assessment**: Include gap context in assessment results
- **Milestone Integration**: Feed results into milestone tracking system

### 3. User Profile Integration
- **Milestone History**: Maintain complete milestone history in user profile
- **Gap Tracking**: Track usage patterns and gaps in user profile
- **Preference Management**: Store re-engagement preferences
- **Goal Evolution**: Track how goals change over time

## Performance Requirements

### Gap Detection Performance
- **Detection Speed**: Gap detection completes in <1 second
- **Analysis Accuracy**: Gap classification accuracy >95%
- **Real-time Updates**: Activity tracking updates within 100ms
- **Pattern Recognition**: Pattern analysis completes in <500ms

### Re-Assessment Performance
- **Assessment Creation**: Re-assessment setup in <2 seconds
- **Data Processing**: Assessment results processed in <1 second
- **Comparison Analysis**: Milestone comparison in <500ms
- **Recommendation Generation**: Recommendations generated in <2 seconds

### Data Management
- **Historical Queries**: Milestone history retrieval in <200ms
- **Trend Analysis**: Progress trend analysis in <1 second
- **Data Consistency**: 100% data consistency across operations
- **Storage Efficiency**: Optimized storage for long-term milestone data

## Acceptance Criteria

### Phase 1: Gap Detection (Week 1)
- [ ] Activity monitoring system implemented
- [ ] Gap classification logic working
- [ ] Automatic trigger system functional
- [ ] Basic gap analysis complete

### Phase 2: Re-Assessment Engine (Week 2)
- [ ] Re-assessment types implemented
- [ ] Milestone comparison system working
- [ ] Historical data integration complete
- [ ] Assessment result processing functional

### Phase 3: Re-Engagement System (Week 3)
- [ ] Welcome-back experience implemented
- [ ] Personalized messaging system working
- [ ] Re-engagement planning functional
- [ ] Progress dashboard integration complete

## Success Metrics

### User Retention
- [ ] 80%+ of returning users complete re-assessment
- [ ] 70%+ of users re-engage after gap
- [ ] 60%+ of users maintain or improve performance post-gap
- [ ] 50%+ reduction in permanent user churn

### Data Quality
- [ ] Gap detection accuracy >95%
- [ ] Milestone comparison accuracy >99%
- [ ] Skill retention prediction accuracy >85%
- [ ] Historical data integrity >99%

### User Experience
- [ ] Re-assessment completion time <10 minutes
- [ ] Welcome-back experience satisfaction >90%
- [ ] Personalized recommendations relevance >85%
- [ ] User engagement increase >25% post-re-onboarding

This comprehensive re-onboarding system ensures that returning users receive appropriate attention and support while maintaining accurate progress tracking across usage gaps, ultimately improving user retention and engagement.
