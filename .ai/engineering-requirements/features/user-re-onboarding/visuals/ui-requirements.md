# User Re-Onboarding - UI Requirements for Design Tools

## Overview

This document provides detailed UI requirements for generating wireframes and high-fidelity designs using tools like UX Pilot or Visily. The User Re-Onboarding feature creates a welcoming, context-aware experience for returning users that balances re-engagement with respect for their time and previous progress.

## Page Structure

### Main Re-Onboarding Layout

**Desktop (1024px+):**
- Welcome header with personalized message
- Two-column layout below header
- Left column: Gap Analysis
- Right column: Quick Stats
- Full-width Progress Comparison section
- Full-width Recommended Actions section

**Tablet (768px-1023px):**
- Welcome header with personalized message
- Gap Analysis & Quick Stats in single column
- Full-width Progress Comparison
- Full-width Recommended Actions


## Component Specifications

### 1. Welcome Header

**Visual Elements:**
- Warm, welcoming message with user's name
- Clear indication of gap length and context
- Motivational messaging to encourage re-engagement
- Visual indicators of gap severity

**Content:**
- Title: "Welcome back, [Name]!"
- Subtitle: "It's been [X] weeks since your last session"
- Message: "Let's see how you're doing and get you back on track"
- Gap indicator with color coding

**Interactions:**
- Animated entrance
- Hover effects on interactive elements
- Click to view detailed gap analysis

### 2. Gap Analysis

**Visual Elements:**
- Clear visualization of gap information
- Color-coded gap severity indicators
- Skill retention estimation
- Impact level assessment

**Content:**
- Last Activity: Date and time
- Gap Length: Duration with color coding
- Skill Retention: Percentage with progress bar
- Impact Level: Low/Medium/High/Critical

**Interactions:**
- Hover for detailed information
- Click to view historical data
- Animated progress bars

### 3. Quick Stats

**Visual Elements:**
- Card-based layout for key metrics
- Real-time data display
- Color-coded performance indicators
- Clear, readable numbers

**Content:**
- Last WPM: Large number with trend
- Last Accuracy: Percentage with color coding
- Last Session: Date and duration
- Practice Streak: Count with status

**Interactions:**
- Hover for additional context
- Click to view detailed breakdown
- Smooth value transitions

### 4. Progress Comparison

**Visual Elements:**
- Clear comparison between different milestones
- Visual indicators of performance changes
- Color-coded trend indicators
- Contextual explanations

**Comparisons:**
- vs. Baseline: Initial assessment comparison
- vs. Last: Previous session comparison
- vs. Best: Personal best comparison
- Trend indicators: Improving/Stable/Declining

**Interactions:**
- Hover for detailed metrics
- Click to view historical charts
- Animated trend indicators

### 5. Recommended Actions

**Visual Elements:**
- Clear, actionable recommendations
- Time estimates for each action
- Priority-based ordering
- Visual appeal and motivation

**Actions:**
- Quick Check: 2-minute assessment
- Practice: 10-minute practice session
- Set Goals: 5-minute goal setting
- Review Progress: Detailed progress review

**Interactions:**
- Click to start action
- Hover for additional details
- Priority-based visual hierarchy

## Design System Requirements

### Color Palette
- Primary: Blue (#0ea5e9)
- Welcome: Green (#22c55e)
- Caution: Orange (#f59e0b)
- Concern: Red (#ef4444)
- Info: Blue (#3b82f6)
- Neutral: Gray scale (#f9fafb to #111827)

### Typography
- Font: Inter, system fonts
- Welcome Title: 32px, bold weight
- Welcome Subtitle: 20px, medium weight
- Headings: 24px, 18px, 16px
- Body: 16px, 14px
- Small: 12px

### Spacing
- Welcome padding: 48px
- Section margins: 32px
- Component margins: 24px
- Internal spacing: 16px
- Component gaps: 12px

### Interactive States
- Hover: Subtle elevation, color change
- Focus: Blue outline, keyboard navigation
- Active: Pressed state, color feedback
- Loading: Skeleton screens, spinners
- Error: Red borders, error messages

## Accessibility Requirements

### Visual
- High contrast ratios (4.5:1 minimum)
- Color not the only indicator
- Clear focus indicators
- Scalable text and elements

### Interaction
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels and descriptions
- Skip links for navigation

### Content
- Semantic HTML structure
- Alt text for images
- Live regions for updates
- Clear error messages

## Responsive Behavior

### Tablet Optimizations
- Two-column layouts
- Touch-friendly interactions
- Optimized content display
- Sidebar navigation

### Desktop Optimizations
- Multi-column layouts
- Hover interactions
- Keyboard shortcuts
- Right-click context menus

## Animation and Transitions

### Micro-interactions
- Smooth hover effects
- Loading animations
- Progress bar animations
- Result reveal animations
- Action completion animations

### Performance
- 60fps animations
- GPU acceleration
- Reduced motion support
- Optimized transitions
- Lazy loading effects

## Content Requirements

### Headers and Labels
- Clear, descriptive titles
- Consistent terminology
- Action-oriented language
- Progress indicators
- Status messages

### Data Formatting
- Consistent number formatting
- Time duration formatting
- Percentage displays
- Date formatting
- Currency (if applicable)

### Error States
- Clear error messages
- Recovery actions
- Fallback content
- Loading states
- Empty states

This document provides comprehensive UI requirements for generating accurate wireframes and high-fidelity designs that align with KeyFlow's professional, data-driven aesthetic while ensuring excellent user experience across all devices.

## Design Tool Prompt

Create a welcome back interface with personalized header ("Welcome back, John! It's been 2 weeks..."), gap analysis cards (last activity, gap length, skill retention, impact level), quick stats (last WPM, accuracy, session date), progress comparison (vs baseline/last/best with trend indicators), and recommended actions (quick check, practice, set goals). Use blue/green/orange/red colors, Inter font, card-based layout. Responsive for desktop/tablet.
