# Progress Dashboard - UI Requirements for Design Tools

## Overview

This document provides detailed UI requirements for generating wireframes and high-fidelity designs using tools like UX Pilot or Visily. The Progress Dashboard is a data-driven interface that displays comprehensive typing performance insights.

## Page Structure

### Main Dashboard Layout

**Desktop (1024px+):**
- Header with 3 metric cards in a row
- Two-column layout below header
- Left column: WPM Trend Chart (larger)
- Right column: Accuracy Chart (smaller)
- Two-column layout below charts
- Left column: Session History Table
- Right column: Weak Key Heatmap
- Bottom row: Practice Frequency and Mode Distribution charts

**Tablet (768px-1023px):**
- Header with 3 metric cards in a row
- Full-width WPM Trend Chart
- Full-width Accuracy Chart
- Full-width Session History Table
- Full-width Weak Key Heatmap


## Component Specifications

### 1. Metrics Overview Cards

**Visual Elements:**
- Card-based layout with subtle shadows
- Large, prominent numbers for key metrics
- Color-coded based on performance level
- Trend indicators (up/down arrows with percentages)
- Hover effects with subtle elevation

**Content:**
- Total Sessions: Large number (e.g., "127")
- Best WPM: Large number (e.g., "89")
- Practice Time: Formatted duration (e.g., "12h 34m")

**Interactions:**
- Click to view detailed breakdown
- Hover for additional context
- Keyboard navigation support

### 2. WPM Trend Chart

**Visual Elements:**
- Line chart showing WPM over time
- X-axis: Date range (last 30 days default)
- Y-axis: WPM values (0-100+ range)
- Smooth line with data points
- Grid lines for readability
- Interactive tooltips on hover

**Data Points:**
- Daily average WPM
- Trend line showing improvement
- Highlighted best performance
- Color coding for different time periods

**Interactions:**
- Hover for detailed data point info
- Click to zoom into time period
- Drag to pan across timeline
- Legend for different data series

### 3. Accuracy Chart

**Visual Elements:**
- Bar chart or line chart for accuracy
- X-axis: Date range
- Y-axis: Accuracy percentage (0-100%)
- Color coding: Green (90%+), Yellow (80-89%), Red (<80%)
- Average accuracy line overlay

**Data Points:**
- Daily accuracy percentages
- Trend line showing consistency
- Target accuracy line (95%)
- Performance zones (excellent, good, needs improvement)

### 4. Session History Table

**Visual Elements:**
- Clean table with alternating row colors
- Sortable column headers
- Hover effects on rows
- Action buttons for each row
- Responsive design (stacks on mobile)

**Columns:**
- Date (MM/DD format)
- Mode (Practice, Lesson, Drill, Challenge)
- WPM (with color coding)
- Accuracy (with color coding)
- Duration (MM:SS format)
- Actions (View Details, Retry)

**Interactions:**
- Click column headers to sort
- Hover rows for highlight
- Click actions for detailed view
- Pagination for large datasets

### 5. Weak Key Heatmap

**Visual Elements:**
- QWERTY keyboard layout
- Color-coded keys based on performance
- Hover tooltips with detailed stats
- Selected key highlighting
- Finger guidance overlay

**Color Coding:**
- Green: Excellent performance (90%+ accuracy)
- Light Green: Good performance (80-89% accuracy)
- Yellow: Average performance (70-79% accuracy)
- Red: Poor performance (<70% accuracy)
- Gray: Insufficient data

**Interactions:**
- Click key to start targeted practice
- Hover for performance details
- Keyboard navigation support
- Touch-friendly on mobile

### 6. Practice Frequency Chart

**Visual Elements:**
- Bar chart showing daily practice
- X-axis: Days of the week
- Y-axis: Practice time or session count
- Color gradient for intensity
- Current week highlighted

**Data Points:**
- Daily practice time
- Session count per day
- Streak indicators
- Goal progress bars

### 7. Mode Distribution Chart

**Visual Elements:**
- Pie chart or donut chart
- Color-coded segments
- Percentage labels
- Legend with mode names
- Interactive segments

**Data Points:**
- Practice mode percentage
- Lesson mode percentage
- Drill mode percentage
- Challenge mode percentage

## Design System Requirements

### Color Palette
- Primary: Blue (#0ea5e9)
- Success: Green (#22c55e)
- Warning: Orange (#f59e0b)
- Error: Red (#ef4444)
- Neutral: Gray scale (#f9fafb to #111827)

### Typography
- Font: Inter, system fonts
- Headings: 24px, 20px, 18px
- Body: 16px, 14px
- Small: 12px

### Spacing
- Card padding: 24px
- Section margins: 24px
- Grid gaps: 24px
- Component gaps: 16px

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
- Optimized chart sizes
- Sidebar navigation

### Desktop Optimizations
- Multi-column layouts
- Hover interactions
- Keyboard shortcuts
- Right-click context menus

## Data Visualization Guidelines

### Charts
- Clear axes labels
- Consistent color coding
- Interactive tooltips
- Responsive scaling
- Print-friendly versions

### Tables
- Sortable columns
- Filterable data
- Pagination controls
- Export functionality
- Search capabilities

### Metrics
- Large, readable numbers
- Trend indicators
- Contextual information
- Comparison data
- Goal progress

## Animation and Transitions

### Micro-interactions
- Smooth hover effects
- Loading animations
- Data update transitions
- Chart drawing animations
- Achievement celebrations

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

Create a professional typing progress dashboard with metrics cards (sessions, WPM, practice time), WPM trend line chart, accuracy bar chart, session history table with sortable columns, QWERTY keyboard heatmap with color-coded performance, practice frequency calendar, and mode distribution pie chart. Use blue/green/orange/red color scheme, Inter font, card-based layout with subtle shadows. Responsive design for desktop/tablet.
