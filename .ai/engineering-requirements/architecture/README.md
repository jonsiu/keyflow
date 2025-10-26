# KeyFlow Architecture Documentation

This directory contains comprehensive C4 model architecture diagrams for KeyFlow, the native typing tutor application.

## About C4 Model

The C4 model is a lean graphical notation technique for modeling software architecture. It consists of a hierarchical set of diagrams:
- **Level 1: System Context** - Shows the big picture
- **Level 2: Container** - Shows high-level technology choices
- **Level 3: Component** - Shows components within containers
- **Level 4: Code** - Shows implementation details (optional)

Reference: [C4 Model Official Documentation](https://c4model.com/)

## Diagram Index

### Level 1: System Context (1 diagram)

| Diagram | File | Purpose | Audience |
|---------|------|---------|----------|
| **System Context** | [01-system-context.md](./01-system-context.md) | KeyFlow's place in the broader ecosystem | Everyone (technical & non-technical) |

### Level 2: Container Diagrams (4 diagrams)

| Diagram | File | Purpose | Audience |
|---------|------|---------|----------|
| **Full System** | [02-container-full-system.md](./02-container-full-system.md) | Complete architecture overview | Technical team, architects |
| **Desktop Focused** | [03-container-desktop-focused.md](./03-container-desktop-focused.md) | Desktop app local-first architecture | Desktop developers |
| **Web Focused** | [04-container-web-focused.md](./04-container-web-focused.md) | Web app cloud-first architecture | Web developers |
| **Sync Architecture** | [05-container-sync-architecture.md](./05-container-sync-architecture.md) | Local-first sync mechanism | Backend + desktop developers |

### Level 3: Component Diagrams (6 diagrams)

| Diagram | File | Purpose | Audience |
|---------|------|---------|----------|
| **Shared Core** | [06-component-shared-core.md](./06-component-shared-core.md) | Business logic (90% code reuse) | All developers |
| **Typing Engine** | [07-component-typing-engine.md](./07-component-typing-engine.md) | Hot path (<2ms latency) | Performance engineers |
| **Desktop React** | [08-component-desktop-react.md](./08-component-desktop-react.md) | Desktop implementation | Desktop developers |
| **Web Next.js** | [09-component-web-nextjs.md](./09-component-web-nextjs.md) | Web implementation | Web developers |
| **Sync Engine** | [10-component-sync-engine.md](./10-component-sync-engine.md) | Conflict resolution | Backend developers |
| **Backend API** | [11-component-backend-api.md](./11-component-backend-api.md) | REST API structure | Backend developers |

## How to Use These Diagrams

1. **Start with System Context** - Understand the big picture
2. **Review Full System Container** - See how all pieces fit together
3. **Dive into specific containers** - Based on your development focus
4. **Explore components** - When you need implementation details

## Rendering PlantUML Diagrams

### VS Code
Install the [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) and press `Alt+D` to preview.

### Online
Copy the PlantUML code and paste it into [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/).

### Command Line
```bash
# Install PlantUML
brew install plantuml

# Render a diagram
plantuml .ai/architecture/01-system-context.md
```

## Architecture Principles

KeyFlow's architecture is built on these core principles:

1. **Layered Architecture** - Clear separation of concerns
2. **Dependency Inversion** - Platform-agnostic business logic
3. **Local-First** - Desktop works 100% offline
4. **Performance** - <2ms keystroke latency on desktop
5. **Code Reuse** - 90% shared code between desktop and web
6. **Maintainability** - Clear patterns and boundaries

For detailed architectural patterns, see [ENGINEERING_REQUIREMENTS.md](../ENGINEERING_REQUIREMENTS.md#architectural-patterns--best-practices).

## Diagram Update Process

When updating architecture:
1. Update the relevant diagram(s)
2. Update the description in the markdown file
3. Verify PlantUML renders correctly
4. Update this README if adding/removing diagrams
5. Update ENGINEERING_REQUIREMENTS.md if patterns change

## Questions?

For architecture questions or diagram clarifications, refer to:
- [ENGINEERING_REQUIREMENTS.md](../ENGINEERING_REQUIREMENTS.md)
- [PROJECT_ROADMAP.md](../PROJECT_ROADMAP.md)
- [AI_DEVELOPMENT_GUIDE.md](../AI_DEVELOPMENT_GUIDE.md)

