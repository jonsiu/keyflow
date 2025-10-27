# User Onboarding - UI Requirements for Design Tools

## Overview

This document provides detailed UI requirements for generating wireframes and high-fidelity designs using tools like UX Pilot or Visily. The User Onboarding feature creates a welcoming, professional first experience that establishes accurate baseline data for new users.

## Page Structure

### Main Assessment Layout

**Desktop (1024px+):**
- Header with progress bar, current step, and time display
- Large text display area in center
- Real-time metrics display below text
- Control buttons at bottom

**Tablet (768px-1023px):**
- Header with progress bar, current step, and time display
- Full-width text display area
- Real-time metrics in 2x2 grid
- Control buttons at bottom


## Component Specifications

### 1. Assessment Header

**Visual Elements:**
- Progress bar showing completion percentage
- Current assessment step name
- Time remaining or elapsed
- Clean, minimal design with subtle shadows

**Content:**
- Progress: "80% Complete" with animated progress bar
- Current Step: "Speed Test" or "Accuracy Test"
- Time: "02:30 / 05:00" format

**Interactions:**
- Progress bar animates as user progresses
- Time updates in real-time
- Hover effects on interactive elements

### 2. Text Display Area

**Visual Elements:**
- Large, readable text area with clear typography
- Visual indication of current position
- Error highlighting with correction suggestions
- Smooth cursor movement and positioning

**Text States:**
- Correct: Black text on white background
- Error: Red text with red underline
- Current: Blue text with blue underline and pulsing animation
- Pending: Gray text

**Interactions:**
- Real-time character highlighting
- Smooth cursor animation
- Error shake animation
- Click to focus

### 3. Real-time Metrics Display

**Visual Elements:**
- Card-based layout for key metrics
- Real-time updates with smooth animations
- Color-coded performance indicators
- Clear, readable numbers

**Metrics:**
- WPM: Large number with trend indicator
- Accuracy: Percentage with color coding
- Errors: Count with trend indicator
- Time: Elapsed time in MM:SS format

**Interactions:**
- Hover for additional context
- Smooth value transitions
- Color changes based on performance

### 4. Assessment Controls

**Visual Elements:**
- Clear, accessible control buttons
- Consistent styling with KeyFlow's design system
- Appropriate button states and feedback
- Mobile-friendly touch targets

**Buttons:**
- Pause: Toggle between pause/resume
- Skip: Skip current assessment step
- Help: Show help information

**Interactions:**
- Hover effects with elevation
- Active states with press feedback
- Disabled states when not applicable
- Keyboard navigation support

### 5. Results Display

**Visual Elements:**
- Comprehensive results presentation
- Clear performance breakdown
- Motivational messaging
- Clear next steps

**Content:**
- Performance metrics in card layout
- Insights and recommendations
- Comparison with baseline
- Next steps and goals

**Interactions:**
- Animated result reveal
- Click to view detailed breakdown
- Smooth transitions between sections

## Design System Requirements

### Color Palette
- Primary: Blue (#0ea5e9)
- Success: Green (#22c55e)
- Warning: Orange (#f59e0b)
- Error: Red (#ef4444)
- Info: Blue (#3b82f6)
- Neutral: Gray scale (#f9fafb to #111827)

### Typography
- Font: Inter, system fonts
- Text Display: 20px, regular weight
- Headings: 24px, 18px, 16px
- Body: 16px, 14px
- Small: 12px

### Spacing
- Assessment padding: 32px
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
- Optimized text display
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
- Text typing animations
- Result reveal animations
- Progress bar animations

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

Create a typing assessment interface with header (progress bar, current step, timer), large text display area with character highlighting (correct/error/current/pending states), real-time metrics cards (WPM, accuracy, errors, time), control buttons (pause, skip, help), and results display with performance breakdown. Use blue/green/orange/red colors, Inter font, clean minimal design. Responsive for desktop/tablet.
