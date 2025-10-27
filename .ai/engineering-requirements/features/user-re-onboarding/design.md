# User Re-Onboarding - Software Architecture Design

## System Architecture Philosophy

The User Re-Onboarding feature creates a welcoming, context-aware experience for returning desktop app users. It balances the need to re-engage users with respect for their time and previous progress, while providing clear insights into their current skill level and recommended next steps. All data is retrieved from local storage, with optional cloud sync for Pro subscribers.

### Architectural Principles

1. **Desktop-First**: Optimized for desktop app launch experience
2. **Local Data-Driven**: All analysis based on locally stored data
3. **Context-Aware**: Every element acknowledges the user's gap and previous progress
4. **Respectful**: Honor the user's time and previous achievements
5. **Pro Feature Integration**: Seamless integration with cloud sync and advanced analytics

## Component Architecture

### Re-Onboarding Flow Architecture

```typescript
// Re-onboarding flow state management
interface ReOnboardingFlow {
  // Flow states
  states: {
    welcome: WelcomeState;
    gapAnalysis: GapAnalysisState;
    progressComparison: ProgressComparisonState;
    recommendations: RecommendationsState;
    actionSelection: ActionSelectionState;
  };
  
  // State transitions
  transitions: {
    from: ReOnboardingState;
    to: ReOnboardingState;
    condition: TransitionCondition;
    action: TransitionAction;
  }[];
  
  // Flow configuration
  config: {
    allowSkip: boolean;
    allowBacktrack: boolean;
    personalization: boolean;
    timeout: number;
  };
}
```

### Data Processing Architecture

```typescript
// Re-onboarding data processing
interface ReOnboardingDataProcessor {
  // Gap analysis
  gapAnalysis: {
    calculateGap: (lastActivity: Date, currentDate: Date) => GapData;
    assessImpact: (gap: GapData, userHistory: UserHistory) => ImpactLevel;
    predictRetention: (gap: GapData, userProfile: UserProfile) => number;
  };
  
  // Progress comparison
  progressComparison: {
    compareBaseline: (current: Metrics, baseline: Metrics) => ComparisonData;
    compareLast: (current: Metrics, last: Metrics) => ComparisonData;
    compareBest: (current: Metrics, best: Metrics) => ComparisonData;
  };
  
  // Recommendation engine
  recommendations: {
    generateActions: (gap: GapData, comparison: ComparisonData) => Action[];
    prioritizeActions: (actions: Action[], userProfile: UserProfile) => Action[];
    personalizeContent: (actions: Action[], userHistory: UserHistory) => Action[];
  };
}
```

### Component Architecture

```typescript
// Re-onboarding component interfaces
interface ReOnboardingComponent {
  // Base component props
  props: {
    id: string;
    type: ReOnboardingType;
    config: ComponentConfig;
    data: ReOnboardingData;
    onComplete: (result: ReOnboardingResult) => void;
    onError: (error: ReOnboardingError) => void;
  };
  
  // Component state
  state: {
    isActive: boolean;
    isVisible: boolean;
    hasData: boolean;
    errors: ReOnboardingError[];
  };
  
  // Component lifecycle
  lifecycle: {
    onMount: () => void;
    onUnmount: () => void;
    onShow: () => void;
    onHide: () => void;
    onComplete: () => void;
  };
}
```

## Layout Structure

### Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────────────────────────┐
│ Welcome Back Header                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Welcome back, John!                                        │ │
│ │ It's been 2 weeks since your last session                  │ │
│ │ Let's see how you're doing and get you back on track      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ ┌─────────────────────┐ │
│ │ Gap Analysis                        │ │ Quick Stats         │ │
│ │ ┌─────────────────────────────────┐ │ │ ┌─────────────────┐ │ │
│ │ │ Last Activity: 2 weeks ago     │ │ │ │ Last WPM: 65    │ │ │
│ │ │ Gap Length: 14 days            │ │ │ │ Last Accuracy:  │ │ │
│ │ │ Skill Retention: 85%           │ │ │ │ 94%             │ │ │
│ │ │ Impact Level: Low              │ │ │ │ Last Session:   │ │ │
│ │ └─────────────────────────────────┘ │ │ │ 2 weeks ago     │ │ │
│ └─────────────────────────────────────┘ │ └─────────────────┘ │ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Progress Comparison                                         │ │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │ │
│ │ │ vs. Baseline    │ │ vs. Last        │ │ vs. Best        │ │ │
│ │ │ +12 WPM         │ │ -3 WPM          │ │ -8 WPM          │ │ │
│ │ │ +2% Accuracy    │ │ +1% Accuracy    │ │ -1% Accuracy    │ │ │
│ │ │ Improving       │ │ Stable          │ │ Declining       │ │ │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Recommended Actions                                        │ │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │ │
│ │ │ Quick Check     │ │ Practice        │ │ Set Goals       │ │ │
│ │ │ 2 min           │ │ 10 min          │ │ 5 min           │ │ │
│ │ │                 │ │                 │ │                 │ │ │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px-1023px)

```
┌─────────────────────────────────────────────────────────────┐
│ Welcome Back Header                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Welcome back, John!                                    │ │
│ │ It's been 2 weeks since your last session              │ │
│ │ Let's see how you're doing and get you back on track  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Gap Analysis & Quick Stats                             │ │
│ │ ┌─────────────────┐ ┌─────────────────┐                │ │
│ │ │ Last Activity:  │ │ Last WPM: 65    │                │ │
│ │ │ 2 weeks ago     │ │ Last Accuracy:  │                │ │
│ │ │ Gap Length: 14  │ │ 94%             │                │ │
│ │ │ days            │ │ Last Session:   │                │ │
│ │ │ Skill Retention:│ │ 2 weeks ago     │                │ │
│ │ │ 85%             │ │                 │                │ │
│ │ └─────────────────┘ └─────────────────┘                │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Progress Comparison                                     │ │
│ │ ┌─────────────────┐ ┌─────────────────┐                │ │
│ │ │ vs. Baseline    │ │ vs. Last        │                │ │
│ │ │ +12 WPM         │ │ -3 WPM          │                │ │
│ │ │ +2% Accuracy    │ │ +1% Accuracy    │                │ │
│ │ │ Improving       │ │ Stable          │                │ │
│ │ └─────────────────┘ └─────────────────┘                │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Recommended Actions                                    │ │
│ │ ┌─────────────────┐ ┌─────────────────┐                │ │
│ │ │ Quick Check     │ │ Practice        │                │ │
│ │ │ 2 min           │ │ 10 min          │                │ │
│ │ │                 │ │                 │                │ │
│ │ └─────────────────┘ └─────────────────┘                │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

```
┌─────────────────────────────────────┐
│ Welcome Back Header                 │
│ ┌─────────────────────────────────┐ │
│ │ Welcome back, John!             │ │
│ │ It's been 2 weeks since your    │ │
│ │ last session                    │ │
│ │ Let's see how you're doing and  │ │
│ │ get you back on track           │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Gap Analysis                    │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Last Activity: 2 weeks ago  │ │ │
│ │ │ Gap Length: 14 days         │ │ │
│ │ │ Skill Retention: 85%        │ │ │
│ │ │ Impact Level: Low           │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Quick Stats                     │ │
│ │ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ Last WPM:   │ │ Last Acc:   │ │ │
│ │ │ 65          │ │ 94%         │ │ │
│ │ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Progress Comparison             │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ vs. Baseline: +12 WPM       │ │ │
│ │ │ vs. Last: -3 WPM            │ │ │
│ │ │ vs. Best: -8 WPM            │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Recommended Actions            │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Quick Check (2 min)         │ │ │
│ │ │ Practice (10 min)           │ │ │
│ │ │ Set Goals (5 min)           │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Component Design Specifications

### 1. Welcome Back Header

**Design:**
- Warm, welcoming message with user's name
- Clear indication of gap length and context
- Motivational messaging to encourage re-engagement
- Visual indicators of gap severity

**Specifications:**
```css
.welcome-header {
  background: linear-gradient(135deg, var(--reonboarding-primary) 0%, var(--primary-600) 100%);
  color: white;
  padding: var(--welcome-padding);
  border-radius: 12px;
  margin: var(--welcome-margin) 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.welcome-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.1;
}

.welcome-title {
  font-size: var(--welcome-title-size);
  font-weight: var(--welcome-title-weight);
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.welcome-subtitle {
  font-size: var(--welcome-subtitle-size);
  font-weight: var(--welcome-subtitle-weight);
  opacity: 0.9;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.welcome-message {
  font-size: var(--text-base);
  opacity: 0.8;
  line-height: var(--leading-relaxed);
  position: relative;
  z-index: 1;
}

.gap-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 1rem;
  position: relative;
  z-index: 1;
}

.gap-indicator.short {
  background: rgba(34, 197, 94, 0.2);
}

.gap-indicator.medium {
  background: rgba(245, 158, 11, 0.2);
}

.gap-indicator.long {
  background: rgba(239, 68, 68, 0.2);
}

.gap-indicator.extended {
  background: rgba(220, 38, 38, 0.2);
}
```

### 2. Gap Analysis Component

**Design:**
- Clear visualization of gap information
- Color-coded gap severity indicators
- Skill retention estimation
- Impact level assessment

**Specifications:**
```css
.gap-analysis {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--gap-padding);
  margin: var(--gap-margin) 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.gap-analysis-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-gap);
}

.gap-analysis-title {
  font-size: var(--comparison-title-size);
  font-weight: var(--comparison-title-weight);
  color: var(--gray-900);
}

.gap-severity {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gap-severity.low {
  background: var(--gap-short);
  color: white;
}

.gap-severity.medium {
  background: var(--gap-medium);
  color: white;
}

.gap-severity.high {
  background: var(--gap-long);
  color: white;
}

.gap-severity.critical {
  background: var(--gap-extended);
  color: white;
}

.gap-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--gap-gap);
}

.gap-metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.gap-metric-label {
  font-size: var(--gap-label-size);
  font-weight: var(--gap-label-weight);
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gap-metric-value {
  font-size: var(--gap-value-size);
  font-weight: var(--gap-value-weight);
  color: var(--gray-900);
}

.gap-metric-description {
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin-top: 0.25rem;
}

.skill-retention-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.skill-retention-fill {
  height: 100%;
  background: var(--gap-short);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.skill-retention-fill.medium {
  background: var(--gap-medium);
}

.skill-retention-fill.high {
  background: var(--gap-long);
}

.skill-retention-fill.critical {
  background: var(--gap-extended);
}
```

### 3. Progress Comparison Component

**Design:**
- Clear comparison between different milestones
- Visual indicators of performance changes
- Color-coded trend indicators
- Contextual explanations

**Specifications:**
```css
.progress-comparison {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--gap-padding);
  margin: var(--gap-margin) 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.comparison-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-gap);
}

.comparison-title {
  font-size: var(--comparison-title-size);
  font-weight: var(--comparison-title-weight);
  color: var(--gray-900);
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--gap-gap);
}

.comparison-card {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: var(--milestone-padding);
  text-align: center;
  transition: all 0.2s ease;
}

.comparison-card:hover {
  border-color: var(--reonboarding-primary);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
}

.comparison-card-title {
  font-size: var(--milestone-title-size);
  font-weight: var(--milestone-title-weight);
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.comparison-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comparison-metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.comparison-metric-label {
  font-size: var(--text-sm);
  color: var(--gray-600);
  text-align: left;
}

.comparison-metric-value {
  font-size: var(--comparison-value-size);
  font-weight: var(--comparison-value-weight);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.comparison-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.comparison-trend.improving {
  background: var(--progress-improved);
  color: white;
}

.comparison-trend.maintained {
  background: var(--progress-maintained);
  color: white;
}

.comparison-trend.declining {
  background: var(--progress-declined);
  color: white;
}

.comparison-trend.unknown {
  background: var(--progress-unknown);
  color: white;
}

.trend-icon {
  font-size: 0.75rem;
}

.trend-icon.up::before {
  content: '↗';
}

.trend-icon.down::before {
  content: '↘';
}

.trend-icon.stable::before {
  content: '→';
}

.trend-icon.unknown::before {
  content: '?';
}
```

### 4. Milestone Timeline Component

**Design:**
- Visual timeline of user milestones
- Color-coded milestone types
- Interactive milestone details
- Progress trajectory visualization

**Specifications:**
```css
.milestone-timeline {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--gap-padding);
  margin: var(--gap-margin) 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-gap);
}

.timeline-title {
  font-size: var(--comparison-title-size);
  font-weight: var(--comparison-title-weight);
  color: var(--gray-900);
}

.timeline-container {
  position: relative;
  padding-left: 2rem;
}

.timeline-line {
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--gray-200);
}

.timeline-milestone {
  position: relative;
  margin-bottom: var(--milestone-margin);
  padding-left: 2rem;
}

.timeline-milestone::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px var(--gray-300);
}

.timeline-milestone.initial::before {
  background: var(--milestone-initial);
  box-shadow: 0 0 0 2px var(--milestone-initial);
}

.timeline-milestone.reassessment::before {
  background: var(--milestone-reassessment);
  box-shadow: 0 0 0 2px var(--milestone-reassessment);
}

.timeline-milestone.checkpoint::before {
  background: var(--milestone-checkpoint);
  box-shadow: 0 0 0 2px var(--milestone-checkpoint);
}

.timeline-milestone.achievement::before {
  background: var(--milestone-achievement);
  box-shadow: 0 0 0 2px var(--milestone-achievement);
}

.milestone-card {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: var(--milestone-padding);
  transition: all 0.2s ease;
}

.milestone-card:hover {
  border-color: var(--reonboarding-primary);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
}

.milestone-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.milestone-title {
  font-size: var(--milestone-title-size);
  font-weight: var(--milestone-title-weight);
  color: var(--gray-900);
}

.milestone-date {
  font-size: var(--milestone-date-size);
  font-weight: var(--milestone-date-weight);
  color: var(--gray-500);
}

.milestone-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.milestone-metric {
  text-align: center;
}

.milestone-metric-label {
  font-size: var(--text-xs);
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.milestone-metric-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-top: 0.25rem;
}
```

### 5. Recommended Actions Component

**Design:**
- Clear, actionable recommendations
- Time estimates for each action
- Priority-based ordering
- Visual appeal and motivation

**Specifications:**
```css
.recommended-actions {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--gap-padding);
  margin: var(--gap-margin) 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.actions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-gap);
}

.actions-title {
  font-size: var(--comparison-title-size);
  font-weight: var(--comparison-title-weight);
  color: var(--gray-900);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--gap-gap);
}

.action-card {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: var(--milestone-padding);
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-card:hover {
  border-color: var(--reonboarding-primary);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
  transform: translateY(-2px);
}

.action-card.primary {
  background: var(--reonboarding-primary);
  color: white;
  border-color: var(--reonboarding-primary);
}

.action-card.primary:hover {
  background: var(--primary-600);
  border-color: var(--primary-600);
}

.action-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-200);
  border-radius: 50%;
  font-size: 24px;
  color: var(--gray-600);
}

.action-card.primary .action-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.action-title {
  font-size: var(--milestone-title-size);
  font-weight: var(--milestone-title-weight);
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.action-card.primary .action-title {
  color: white;
}

.action-description {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: 1rem;
  line-height: var(--leading-relaxed);
}

.action-card.primary .action-description {
  color: rgba(255, 255, 255, 0.8);
}

.action-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.action-card.primary .action-meta {
  color: rgba(255, 255, 255, 0.7);
}

.action-duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-priority {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background: var(--gray-200);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-priority.high {
  background: var(--reonboarding-concern);
  color: white;
}

.action-priority.medium {
  background: var(--reonboarding-caution);
  color: white;
}

.action-priority.low {
  background: var(--gray-300);
  color: var(--gray-700);
}

.action-card.primary .action-priority {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}
```

## Responsive Design Patterns

### Breakpoint System

```css
/* Mobile First Approach */
/* Base styles for mobile (< 768px) */

/* Tablet */
@media (min-width: 768px) {
  .welcome-header {
    text-align: left;
  }
  
  .gap-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .comparison-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .gap-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .comparison-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .timeline-container {
    padding-left: 3rem;
  }
  
  .timeline-line {
    left: 1.5rem;
  }
  
  .timeline-milestone {
    padding-left: 3rem;
  }
  
  .timeline-milestone::before {
    left: -2rem;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .reonboarding-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .gap-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .comparison-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Mobile Optimizations

```css
/* Mobile-specific styles */
@media (max-width: 767px) {
  .welcome-header {
    padding: 2rem 1rem;
    text-align: center;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .gap-metrics {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .comparison-grid {
    grid-template-columns: 1fr;
  }
  
  .comparison-card {
    padding: 1rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    padding: 1.5rem;
  }
  
  .timeline-container {
    padding-left: 1.5rem;
  }
  
  .timeline-line {
    left: 0.75rem;
  }
  
  .timeline-milestone {
    padding-left: 1.5rem;
  }
  
  .timeline-milestone::before {
    left: -0.75rem;
  }
  
  .milestone-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Animation and Interaction Design

### Micro-interactions

```css
/* Smooth transitions */
.reonboarding-component {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Welcome header animation */
.welcome-header {
  animation: welcomeSlideIn 0.6s ease-out;
}

@keyframes welcomeSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Gap analysis reveal */
.gap-analysis {
  animation: fadeInUp 0.5s ease-out 0.2s both;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Progress comparison stagger */
.comparison-card {
  animation: fadeInUp 0.5s ease-out both;
}

.comparison-card:nth-child(1) { animation-delay: 0.1s; }
.comparison-card:nth-child(2) { animation-delay: 0.2s; }
.comparison-card:nth-child(3) { animation-delay: 0.3s; }
.comparison-card:nth-child(4) { animation-delay: 0.4s; }

/* Action card hover */
.action-card {
  transition: all 0.2s ease;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Milestone timeline animation */
.timeline-milestone {
  animation: timelineSlideIn 0.5s ease-out both;
}

.timeline-milestone:nth-child(1) { animation-delay: 0.1s; }
.timeline-milestone:nth-child(2) { animation-delay: 0.2s; }
.timeline-milestone:nth-child(3) { animation-delay: 0.3s; }
.timeline-milestone:nth-child(4) { animation-delay: 0.4s; }

@keyframes timelineSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Skill retention bar animation */
.skill-retention-fill {
  animation: fillBar 1s ease-out 0.5s both;
}

@keyframes fillBar {
  0% {
    width: 0%;
  }
  100% {
    width: var(--retention-width);
  }
}

/* Trend indicator animation */
.comparison-trend {
  animation: trendPulse 0.3s ease-out;
}

@keyframes trendPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
```

### Performance Considerations

```css
/* GPU acceleration for smooth animations */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
  
  .welcome-header {
    animation: none;
  }
  
  .gap-analysis {
    animation: none;
  }
  
  .comparison-card {
    animation: none;
  }
  
  .timeline-milestone {
    animation: none;
  }
  
  .skill-retention-fill {
    animation: none;
  }
  
  .comparison-trend {
    animation: none;
  }
}

/* Optimize for 60fps */
.smooth-animation {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

## Accessibility Design

### Color Contrast

- All text meets WCAG AA standards (4.5:1 contrast ratio)
- Interactive elements have 3:1 contrast ratio
- Color is not the only way to convey information
- Gap severity is indicated by both color and text labels

### Focus Management

```css
/* Clear focus indicators */
.focusable:focus {
  outline: 2px solid var(--reonboarding-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip links for keyboard navigation */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--reonboarding-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### Screen Reader Support

```html
<!-- Semantic HTML structure -->
<main role="main" aria-label="Welcome Back">
  <section aria-labelledby="welcome-header">
    <h1 id="welcome-header">Welcome Back</h1>
    <!-- Welcome header content -->
  </section>
  
  <section aria-labelledby="gap-analysis">
    <h2 id="gap-analysis">Gap Analysis</h2>
    <!-- Gap analysis content -->
  </section>
  
  <section aria-labelledby="progress-comparison">
    <h2 id="progress-comparison">Progress Comparison</h2>
    <!-- Progress comparison content -->
  </section>
  
  <section aria-labelledby="recommended-actions">
    <h2 id="recommended-actions">Recommended Actions</h2>
    <!-- Recommended actions content -->
  </section>
</main>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- Real-time updates -->
</div>

<!-- Status updates -->
<div aria-live="assertive" aria-atomic="true" class="sr-only">
  <!-- Critical status updates -->
</div>
```

This comprehensive design specification ensures the User Re-Onboarding feature provides a welcoming, context-aware experience that respects returning users' time while effectively re-engaging them with their typing practice journey.
