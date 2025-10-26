# Level 1: System Context Diagram

## Overview

This diagram shows KeyFlow's place in the broader ecosystem from a user's perspective. It's a zoomed-out view showing the big picture of the system landscape, focusing on people (users) and external systems rather than technical details.

**Audience:** Everyone (technical and non-technical stakeholders)

**Purpose:** Understand what KeyFlow does, who uses it, and what external systems it depends on.

## Diagram

```plantuml
@startuml KeyFlow System Context
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

LAYOUT_WITH_LEGEND()

title System Context Diagram for KeyFlow

Person(speed_seeker, "Speed Seeker", "Primary user (18-35 years old, 40-150+ WPM) who wants to improve typing speed through structured practice")
Person(casual_learner, "Casual Learner", "Secondary user learning to type or maintain skills")
Person(teacher, "Teacher/Parent", "Oversees student progress and assigns lessons")

System(keyflow, "KeyFlow", "Native typing tutor that consolidates TypingClub, Monkeytype, Keybr, and TypeRacer into one application. Provides 4 practice modes: Lessons, Practice, Drills, and Challenges.")

System_Ext(auth_provider, "Authentication Provider", "Clerk or Supabase Auth - Manages user identity and authentication")
System_Ext(cloud_storage, "Cloud Storage", "PostgreSQL + S3/R2 - Stores user data, sessions, progress, and exercise content")
System_Ext(analytics, "Analytics Service", "PostHog or Umami - Tracks usage metrics and product analytics")
System_Ext(payment, "Payment Provider", "Stripe - Handles one-time purchases and Pro subscriptions")

Rel(speed_seeker, keyflow, "Practices typing with 4 modes\nTracks progress over time\nWorks offline (desktop)", "Desktop/Web")
Rel(casual_learner, keyflow, "Learns typing basics\nCompletes lessons", "Desktop/Web")
Rel(teacher, keyflow, "Monitors student progress\nAssigns exercises", "Web")

Rel(keyflow, auth_provider, "Authenticates users\nManages sessions", "HTTPS/OAuth")
Rel(keyflow, cloud_storage, "Syncs typing sessions\nStores progress data\nFetches exercises", "HTTPS/REST API")
Rel(keyflow, analytics, "Sends usage metrics\n(privacy-focused, anonymized)", "HTTPS")
Rel(keyflow, payment, "Processes purchases\nManages subscriptions", "HTTPS/Stripe API")

SHOW_LEGEND()

@enduml
```

## Key Elements

### Primary System
- **KeyFlow** - The native typing tutor application (desktop + web)

### Users (Personas)

| User Type | Description | Primary Goals | Platform |
|-----------|-------------|---------------|----------|
| **Speed Seeker** | 18-35 years old, 40-150+ WPM, wants to improve typing speed | Practice with all 4 modes, track progress, compete with self | Desktop (primary), Web |
| **Casual Learner** | Beginner or intermediate typist | Learn proper technique, complete structured lessons | Desktop or Web |
| **Teacher/Parent** | Educator or parent overseeing students | Monitor progress, assign lessons, generate reports | Web (classroom management) |

### External Systems

| System | Technology | Purpose | Interaction |
|--------|-----------|---------|-------------|
| **Authentication Provider** | Clerk or Supabase Auth | User identity, login/logout, session management | HTTPS/OAuth |
| **Cloud Storage** | PostgreSQL + S3/R2 | User data, typing sessions, progress tracking, exercise content | HTTPS/REST API |
| **Analytics Service** | PostHog or Umami | Usage metrics, product analytics (privacy-focused) | HTTPS (anonymized) |
| **Payment Provider** | Stripe | One-time purchases ($39), Pro subscriptions ($49/yr) | HTTPS/Stripe API |

## Key User Interactions

### Speed Seeker User Journey
1. **Launch KeyFlow** (desktop preferred for performance)
2. **Select Practice Mode**:
   - Lesson Mode → Structured learning (TypingClub-style)
   - Practice Mode → Speed tests (Monkeytype-style)
   - Drill Mode → Weak key targeting (Keybr-style, but real words)
   - Challenge Mode → Daily challenges (TypeRacer-style)
3. **Type with <2ms latency** (desktop) or <5ms (web)
4. **View real-time metrics** (WPM, accuracy, errors)
5. **Review progress dashboard** (charts, weak keys, improvement)
6. **Sync across devices** (optional cloud sync for desktop)

### Desktop vs Web Usage
- **Desktop**: 100% offline functional, <2ms latency, local-first storage
- **Web**: Requires internet, cloud-only storage, browser-based

## System Boundaries

### What KeyFlow IS
- ✅ Native typing tutor (desktop + web)
- ✅ All-in-one practice platform (4 modes)
- ✅ Progress tracking and analytics
- ✅ AI-powered weak spot detection
- ✅ Local-first (desktop) with optional cloud sync

### What KeyFlow IS NOT
- ❌ Social network (no multiplayer in MVP)
- ❌ Content management system (curated exercises only)
- ❌ Gamification platform (no badges/points in MVP)
- ❌ Real-time multiplayer (v1.2+ feature)

## Value Propositions

1. **All-in-One**: Consolidates 4 typing websites into one app
2. **Native Performance**: <2ms latency on desktop (vs 8ms web apps)
3. **Offline-First**: Desktop works 100% offline
4. **Professional UX**: Monkeytype-inspired minimal design
5. **AI-Powered**: Adaptive drills based on weak keys
6. **No Ads Ever**: One-time purchase, no subscriptions required (Pro optional)

## Technical Highlights (Non-Technical Audience)

- **Fast**: Feels as responsive as native apps (not slow like websites)
- **Offline**: Desktop works without internet (syncs when online)
- **Cross-Device**: Use desktop or web, data syncs automatically
- **Privacy-First**: Data stored locally, cloud sync optional
- **Modern**: Built with latest technology for best performance

## Related Diagrams

- **Next Step**: [Full System Container Diagram](./02-container-full-system.md) - Shows how KeyFlow is built internally
- **Deep Dive**: [Desktop Container Diagram](./03-container-desktop-focused.md) - Desktop architecture details
- **Deep Dive**: [Web Container Diagram](./04-container-web-focused.md) - Web architecture details

## References

- [C4 Model: System Context](https://c4model.com/diagrams/system-context)
- [KeyFlow Engineering Requirements](../ENGINEERING_REQUIREMENTS.md)
- [KeyFlow Project Roadmap](../PROJECT_ROADMAP.md)

