# Level 3: Backend API Components Diagram

## Overview

This diagram shows the REST API internal structure, following clean architecture principles with clear layer separation (Routes → Services → Repositories → Database).

**Audience:** Backend developers

**Purpose:** Understand backend architecture, API endpoints, and data access patterns.

## Diagram

```plantuml
@startuml KeyFlow Backend API Components
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

title Component Diagram for KeyFlow - Backend API (Node.js + Express/Hono)

Container_Boundary(api_boundary, "REST API Backend") {
    Component(auth_routes, "AuthRoutes", "Express Router", "POST /api/auth/login, /register, /logout. Authentication endpoints.")
    
    Component(session_routes, "SessionRoutes", "Express Router", "POST /api/sessions, GET /api/sessions/:id. Session CRUD.")
    
    Component(progress_routes, "ProgressRoutes", "Express Router", "GET /api/progress/stats, /chart. Progress endpoints.")
    
    Component(sync_routes, "SyncRoutes", "Express Router", "POST /api/sync/sessions, GET /api/sync/changes. Sync endpoints.")
    
    Component(exercise_routes, "ExerciseRoutes", "Express Router", "GET /api/exercises, /api/exercises/:id. Exercise library.")
}

Container_Boundary(services, "Service Layer") {
    Component(auth_service, "AuthService", "TypeScript Class", "Authentication logic. JWT tokens, Clerk/Supabase integration.")
    
    Component(session_service, "SessionService", "TypeScript Class", "Session business logic. Validation, aggregation.")
    
    Component(progress_service, "ProgressService", "TypeScript Class", "Progress calculations. WPM trends, weak keys.")
    
    Component(sync_service, "SyncService", "TypeScript Class", "Sync logic. Conflict detection, merge strategies.")
    
    Component(exercise_service, "ExerciseService", "TypeScript Class", "Exercise management. Content filtering.")
}

Container_Boundary(repositories, "Repository Layer (Prisma ORM)") {
    Component(user_repo, "UserRepository", "Prisma Client", "User CRUD. findById, create, update.")
    
    Component(session_repo, "SessionRepository", "Prisma Client", "Session CRUD. Batch operations, pagination.")
    
    Component(progress_repo, "ProgressRepository", "Prisma Client", "Progress queries. Aggregations, statistics.")
}

Container_Boundary(middleware, "Middleware") {
    Component(auth_middleware, "AuthMiddleware", "Express Middleware", "JWT validation. Clerk/Supabase token verify.")
    
    Component(error_middleware, "ErrorMiddleware", "Express Middleware", "Error handling. Structured error responses.")
    
    Component(rate_limit, "RateLimitMiddleware", "Express Middleware", "Rate limiting. 100 req/min per user.")
    
    Component(logging, "LoggingMiddleware", "Express Middleware", "Request/response logging. Structured logs.")
}

ContainerDb_Ext(postgres, "PostgreSQL", "Cloud Database", "Supabase or Neon")
ContainerDb_Ext(s3_storage, "S3/R2 Storage", "Object Storage", "Exercise content, exports")
System_Ext(auth_provider, "Auth Provider", "Clerk or Supabase Auth")

' Routes to Services
Rel(auth_routes, auth_service, "calls", "Business logic")
Rel(session_routes, session_service, "calls", "Business logic")
Rel(progress_routes, progress_service, "calls", "Business logic")
Rel(sync_routes, sync_service, "calls", "Business logic")

' Services to Repositories
Rel(auth_service, user_repo, "calls", "Data access")
Rel(session_service, session_repo, "calls", "Data access")
Rel(progress_service, progress_repo, "calls", "Data access")
Rel(sync_service, session_repo, "calls", "Data access")

' Repositories to Database
Rel(user_repo, postgres, "SQL queries", "Prisma ORM")
Rel(session_repo, postgres, "SQL queries", "Prisma ORM")
Rel(progress_repo, postgres, "SQL queries", "Prisma ORM")

' Middleware
Rel(auth_routes, auth_middleware, "protected by", "JWT validation")
Rel(session_routes, auth_middleware, "protected by", "JWT validation")
Rel(session_routes, rate_limit, "protected by", "Rate limiting")

' External
Rel(auth_service, auth_provider, "OAuth/JWT", "Clerk/Supabase API")
Rel(exercise_service, s3_storage, "GET objects", "S3/R2 API")

SHOW_LEGEND()

@enduml
```

## Layered Architecture

### Layer 1: Routes (API Endpoints)

**Purpose:** HTTP request handling, input validation, response formatting.

```typescript
// src/routes/sessionRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { sessionService } from '../services/sessionService';

const router = Router();

// Create session
router.post('/api/sessions', authMiddleware, async (req, res, next) => {
  try {
    const session = await sessionService.createSession(req.user.id, req.body);
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

// Get session
router.get('/api/sessions/:id', authMiddleware, async (req, res, next) => {
  try {
    const session = await sessionService.getSession(req.params.id, req.user.id);
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

// List sessions (paginated)
router.get('/api/sessions', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const sessions = await sessionService.listSessions(req.user.id, { page, limit });
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Layer 2: Services (Business Logic)

**Purpose:** Business rules, validation, orchestration.

```typescript
// src/services/sessionService.ts
import { sessionRepository } from '../repositories/sessionRepository';
import { progressService } from './progressService';
import { NotFoundError, ValidationError } from '../errors';

class SessionService {
  /**
   * Create a new typing session
   */
  async createSession(userId: string, data: CreateSessionData): Promise<Session> {
    // Validate input
    this.validateSessionData(data);
    
    // Check for duplicate (idempotency)
    const existing = await sessionRepository.findById(data.id);
    if (existing) {
      return existing;  // Already exists, return it
    }
    
    // Create session
    const session = await sessionRepository.create({
      ...data,
      userId,
      createdAt: new Date(),
      lastModified: new Date()
    });
    
    // Update progress stats (async, non-blocking)
    progressService.updateStats(userId, session).catch(console.error);
    
    return session;
  }
  
  /**
   * Get session by ID
   */
  async getSession(sessionId: string, userId: string): Promise<Session> {
    const session = await sessionRepository.findById(sessionId);
    
    if (!session) {
      throw new NotFoundError('Session not found');
    }
    
    // Verify ownership
    if (session.userId !== userId) {
      throw new NotFoundError('Session not found');  // Don't leak existence
    }
    
    return session;
  }
  
  /**
   * List sessions for user (paginated)
   */
  async listSessions(
    userId: string, 
    options: { page: number; limit: number }
  ): Promise<{ sessions: Session[]; total: number }> {
    const sessions = await sessionRepository.findByUserId(userId, {
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await sessionRepository.countByUserId(userId);
    
    return { sessions, total };
  }
  
  /**
   * Validate session data
   */
  private validateSessionData(data: CreateSessionData): void {
    if (!data.text || data.text.length === 0) {
      throw new ValidationError('Session text is required');
    }
    
    if (data.wpm < 0 || data.wpm > 300) {
      throw new ValidationError('Invalid WPM value');
    }
    
    if (data.accuracy < 0 || data.accuracy > 100) {
      throw new ValidationError('Invalid accuracy value');
    }
  }
}

export const sessionService = new SessionService();
```

### Layer 3: Repositories (Data Access)

**Purpose:** Database queries, ORM abstraction.

```typescript
// src/repositories/sessionRepository.ts
import { prisma } from '../lib/prisma';
import type { Session, Prisma } from '@prisma/client';

class SessionRepository {
  /**
   * Create session
   */
  async create(data: Prisma.SessionCreateInput): Promise<Session> {
    return prisma.session.create({ data });
  }
  
  /**
   * Find by ID
   */
  async findById(id: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { id }
    });
  }
  
  /**
   * Find by user ID (paginated)
   */
  async findByUserId(
    userId: string,
    options: { skip: number; take: number; orderBy?: any }
  ): Promise<Session[]> {
    return prisma.session.findMany({
      where: { userId },
      ...options
    });
  }
  
  /**
   * Count by user ID
   */
  async countByUserId(userId: string): Promise<number> {
    return prisma.session.count({
      where: { userId }
    });
  }
  
  /**
   * Batch upsert (for sync)
   */
  async batchUpsert(sessions: Prisma.SessionCreateInput[]): Promise<void> {
    await prisma.$transaction(
      sessions.map(session =>
        prisma.session.upsert({
          where: { id: session.id },
          update: session,
          create: session
        })
      )
    );
  }
  
  /**
   * Delete session
   */
  async delete(id: string): Promise<void> {
    await prisma.session.delete({
      where: { id }
    });
  }
}

export const sessionRepository = new SessionRepository();
```

### Layer 4: Middleware

**Purpose:** Cross-cutting concerns (auth, logging, rate limiting, errors).

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { UnauthorizedError } from '../errors';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }
    
    // Verify token with Clerk
    const session = await clerkClient.sessions.verifySession(token);
    
    if (!session) {
      throw new UnauthorizedError('Invalid token');
    }
    
    // Attach user to request
    req.user = {
      id: session.userId,
      email: session.user.emailAddresses[0].emailAddress
    };
    
    next();
  } catch (error) {
    next(error);
  }
}

// src/middleware/errorHandler.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('API Error:', error);
  
  // Handle known errors
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message
    });
  }
  
  if (error instanceof UnauthorizedError) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
  
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      error: 'Not Found',
      message: error.message
    });
  }
  
  // Unknown error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : error.message
  });
}

// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 requests per minute
  message: 'Too many requests, please try again later'
});
```

## API Endpoints

### Authentication

```typescript
POST   /api/auth/login       # User login (Clerk/Supabase OAuth)
POST   /api/auth/register    # User registration
POST   /api/auth/logout      # User logout
GET    /api/auth/me          # Current user
```

### Sessions

```typescript
POST   /api/sessions         # Create session
GET    /api/sessions/:id     # Get session
GET    /api/sessions         # List sessions (paginated)
DELETE /api/sessions/:id     # Delete session
```

### Progress

```typescript
GET    /api/progress/stats           # Aggregate stats
GET    /api/progress/chart           # Chart data (WPM over time)
GET    /api/progress/weak-keys       # Weak key analysis
GET    /api/progress/export/csv      # Export to CSV
GET    /api/progress/export/json     # Export to JSON
```

### Sync

```typescript
POST   /api/sync/sessions            # Batch sync sessions
GET    /api/sync/changes?since=...   # Pull changes since timestamp
POST   /api/sync/resolve             # Resolve conflicts
```

### Exercises

```typescript
GET    /api/exercises                # List exercises
GET    /api/exercises/:id            # Get exercise
GET    /api/exercises/random         # Random exercise
```

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  sessions  Session[]
  progress  Progress?
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  
  text         String
  wpm          Float
  accuracy     Float
  errorCount   Int
  duration     Int      // seconds
  mode         String   // lesson, practice, drill, challenge
  
  keystrokeData Json?   // Keystroke timing data
  
  createdAt    DateTime @default(now())
  lastModified DateTime @updatedAt
  
  @@index([userId, createdAt])
}

model Progress {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  averageWPM      Float
  bestWPM         Float
  averageAccuracy Float
  totalSessions   Int
  totalPracticeTime Int    // seconds
  
  weakKeys        Json     // Array of WeakKeyAnalysis
  
  updatedAt       DateTime @updatedAt
}
```

## Performance Optimizations

### 1. Database Indexing

```prisma
@@index([userId, createdAt])  // Fast session queries
@@index([userId, lastModified])  // Fast sync queries
```

### 2. Connection Pooling

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query'] : []
});

// Connection pool settings (in DATABASE_URL)
// ?connection_limit=10&pool_timeout=20
```

### 3. Caching (Redis)

```typescript
// src/lib/cache.ts
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

// Cache expensive queries
export async function getCachedStats(userId: string): Promise<ProgressStats | null> {
  const cached = await redis.get(`stats:${userId}`);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedStats(userId: string, stats: ProgressStats): Promise<void> {
  await redis.setex(`stats:${userId}`, 300, JSON.stringify(stats));  // 5 min TTL
}
```

### 4. Pagination

```typescript
// Cursor-based pagination (better for large datasets)
async function listSessionsCursor(userId: string, cursor?: string, limit: number = 30) {
  return prisma.session.findMany({
    where: { userId },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' }
  });
}
```

## Deployment

### Railway Configuration

```toml
# railway.toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"

[[services]]
name = "api"
source = "."
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
CLERK_API_KEY="sk_..."
JWT_SECRET="..."
S3_BUCKET="keyflow-exercises"
S3_REGION="us-east-1"
NODE_ENV="production"
PORT=3000
```

## Related Diagrams

- **Container**: [Full System Container](./02-container-full-system.md)
- **Container**: [Sync Architecture](./05-container-sync-architecture.md)
- **Components**: [Sync Engine](./10-component-sync-engine.md)

## References

- [C4 Model: Component Diagram](https://c4model.com/diagrams/component)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

