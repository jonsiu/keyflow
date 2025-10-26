# KeyFlow Engineering Requirements

## Overview

This directory contains detailed engineering requirements, architecture documentation, and technical specifications for the KeyFlow typing tutor application.

## Directory Structure

```
engineering-requirements/
├── README.md (this file)
├── architecture/           # High-level architecture and design patterns
├── features/              # Feature-specific requirements and designs
├── tech-stack/            # Technology stack decisions and justifications
├── deployment/            # Deployment and infrastructure specifications
└── performance-requirements.md
```

## Key Documents

### Architecture
- [Architecture Overview](./architecture/overview.md) - High-level system architecture
- [Layered Architecture](./architecture/layered-architecture.md) - Separation of concerns and layers
- [Design Patterns](./architecture/design-patterns.md) - Core patterns used throughout the application

### Features
- [Keystroke Validation](./features/keystroke-validation/) - Real-time input validation and tracking
- [Practice Modes](./features/practice-modes/) - Four core practice modes
- [Metrics Tracking](./features/metrics-tracking/) - WPM, accuracy, and analytics
- [Progress Dashboard](./features/progress-dashboard/) - User progress visualization
- [Virtual Keyboard](./features/virtual-keyboard/) - On-screen keyboard with highlighting

### Technical Specifications
- [Technology Stack](./tech-stack/decisions.md) - Tech stack choices and rationale
- [Monorepo Structure](./tech-stack/monorepo.md) - Monorepo organization and shared packages
- [Performance Requirements](./performance-requirements.md) - Performance targets and benchmarks

## Quick Links

- **Main Requirements Document**: See parent [.ai/ENGINEERING_REQUIREMENTS.md](../.ai/ENGINEERING_REQUIREMENTS.md) for consolidated overview
- **Project Vision**: [.ai/DESIGN_PLAN.md](../.ai/DESIGN_PLAN.md)
- **Roadmap**: [.ai/PROJECT_ROADMAP.md](../.ai/PROJECT_ROADMAP.md)

## Diagrams

All diagrams are created using PlantUML (`.puml` files). To render them:

```bash
# Install PlantUML
brew install plantuml

# Render a diagram
plantuml architecture/diagrams/high-level-architecture.puml

# Render all diagrams
find . -name "*.puml" -exec plantuml {} \;
```

Or use online tools:
- [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
- VS Code extension: `jebbs.plantuml`

## Navigation

Start with [Architecture Overview](./architecture/overview.md) for a high-level understanding, then dive into specific features as needed.

