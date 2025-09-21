# AI Development Guide for Typing Tutor

## Step-by-Step Implementation Instructions

This guide provides detailed instructions for AI agents to implement the typing tutor application. Each section includes specific code examples, file structures, and implementation details.

---

## Project Setup & Initialization

### 1. Project Structure

```
typesy-killer/
├── desktop/                 # Electron + React desktop app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── store/          # State management
│   │   └── main/           # Electron main process
│   ├── public/             # Static assets
│   └── package.json
├── web-dashboard/           # React web dashboard (progress tracking)
│   ├── src/
│   │   ├── components/      # Dashboard components
│   │   ├── pages/          # Dashboard pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── package.json
├── shared/                  # Shared types and utilities
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utility functions
└── docs/                   # Documentation
```

### 2. Initialize Desktop App (Electron + React + TypeScript)

```bash
# Create Electron app with React and TypeScript
npx create-electron-app desktop --template=typescript
cd desktop

# Install additional dependencies
npm install @types/node
npm install tailwindcss @tailwindcss/forms
npm install @radix-ui/react-slot @radix-ui/react-dialog
npm install framer-motion
npm install recharts
npm install zustand
npm install react-hotkeys-hook
npm install lucide-react
npm install electron-builder

# Install development dependencies
npm install -D @types/react @types/react-dom
npm install -D eslint @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
npm install -D electron-builder
```

### 3. Initialize Web Dashboard (React + TypeScript)

```bash
# Create React web dashboard
npx create-react-app web-dashboard --template typescript
cd web-dashboard

# Install additional dependencies
npm install @types/node
npm install tailwindcss @tailwindcss/forms
npm install @radix-ui/react-slot @radix-ui/react-dialog
npm install framer-motion
npm install recharts
npm install zustand
npm install lucide-react

# Install development dependencies
npm install -D @types/react @types/react-dom
npm install -D eslint @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
```

### 4. Initialize Backend (Node.js + Express)

```bash
# Create backend directory
mkdir backend && cd backend
npm init -y

# Install dependencies
npm install express cors helmet morgan
npm install @types/express @types/cors @types/morgan
npm install typescript ts-node nodemon
npm install pg @types/pg redis @types/redis
npm install jsonwebtoken @types/jsonwebtoken
npm install bcryptjs @types/bcryptjs
npm install socket.io @types/socket.io

# Install development dependencies
npm install -D @types/node
npm install -D eslint @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
```

---

## Phase 1: Core Foundation Implementation

### 1.1 Basic Typing Interface Component

**File: `desktop/src/components/TypingInterface.tsx`**

```typescript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTypingSession } from '../hooks/useTypingSession';
import { TypingDisplay } from './TypingDisplay';
import { MetricsDisplay } from './MetricsDisplay';
import { ExerciseSelector } from './ExerciseSelector';

interface TypingInterfaceProps {
  exercise: Exercise;
  onSessionComplete: (session: TypingSession) => void;
}

export const TypingInterface: React.FC<TypingInterfaceProps> = ({
  exercise,
  onSessionComplete
}) => {
  const [isActive, setIsActive] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [errors, setErrors] = useState<TypingError[]>([]);

  const {
    wpm,
    accuracy,
    sessionTime,
    startSession,
    endSession,
    recordKeystroke
  } = useTypingSession();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;

    const key = event.key;
    const expectedChar = exercise.text[currentPosition];
    const timestamp = Date.now();

    const keystroke: KeystrokeEvent = {
      key,
      timestamp,
      expected: expectedChar,
      correct: key === expectedChar,
      timing: timestamp - (lastKeystrokeTime.current || timestamp)
    };

    recordKeystroke(keystroke);

    if (key === expectedChar) {
      setUserInput(prev => prev + key);
      setCurrentPosition(prev => prev + 1);

      if (currentPosition + 1 >= exercise.text.length) {
        endSession();
        onSessionComplete({
          id: generateId(),
          exerciseId: exercise.id,
          wpm,
          accuracy,
          sessionTime,
          errors,
          completedAt: new Date()
        });
      }
    } else {
      setErrors(prev => [...prev, {
        position: currentPosition,
        expected: expectedChar,
        actual: key,
        timestamp: new Date()
      }]);
    }
  }, [isActive, currentPosition, exercise, recordKeystroke, wpm, accuracy, sessionTime, errors]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startTyping = () => {
    setIsActive(true);
    startSession();
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ExerciseSelector onExerciseSelect={setExercise} />

      <div className="mb-6">
        <MetricsDisplay
          wpm={wpm}
          accuracy={accuracy}
          sessionTime={sessionTime}
          errorCount={errors.length}
        />
      </div>

      <div className="mb-6">
        <TypingDisplay
          text={exercise.text}
          userInput={userInput}
          currentPosition={currentPosition}
          errors={errors}
        />
      </div>

      <div className="text-center">
        {!isActive ? (
          <button
            onClick={startTyping}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Typing
          </button>
        ) : (
          <p className="text-gray-600">Type the text above...</p>
        )}
      </div>
    </div>
  );
};
```

### 1.2 Typing Display Component

**File: `desktop/src/components/TypingDisplay.tsx`**

```typescript
import React from 'react';

interface TypingDisplayProps {
  text: string;
  userInput: string;
  currentPosition: number;
  errors: TypingError[];
}

export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  text,
  userInput,
  currentPosition,
  errors
}) => {
  const renderCharacter = (char: string, index: number) => {
    let className = 'text-lg font-mono p-1 rounded';

    if (index < userInput.length) {
      // Already typed
      const isError = errors.some(error => error.position === index);
      className += isError
        ? ' bg-red-200 text-red-800'
        : ' bg-green-200 text-green-800';
    } else if (index === currentPosition) {
      // Current position
      className += ' bg-blue-200 text-blue-800 border-2 border-blue-400';
    } else {
      // Not yet typed
      className += ' text-gray-600';
    }

    return (
      <span key={index} className={className}>
        {char}
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <div className="leading-relaxed">
        {text.split('').map((char, index) => renderCharacter(char, index))}
      </div>
    </div>
  );
};
```

### 1.3 Metrics Display Component

**File: `desktop/src/components/MetricsDisplay.tsx`**

```typescript
import React from 'react';

interface MetricsDisplayProps {
  wpm: number;
  accuracy: number;
  sessionTime: number;
  errorCount: number;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  wpm,
  accuracy,
  sessionTime,
  errorCount
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">{Math.round(wpm)}</div>
        <div className="text-sm text-blue-800">WPM</div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600">{Math.round(accuracy)}%</div>
        <div className="text-sm text-green-800">Accuracy</div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-purple-600">{formatTime(sessionTime)}</div>
        <div className="text-sm text-purple-800">Time</div>
      </div>

      <div className="bg-red-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-red-600">{errorCount}</div>
        <div className="text-sm text-red-800">Errors</div>
      </div>
    </div>
  );
};
```

### 1.4 Typing Session Hook

**File: `desktop/src/hooks/useTypingSession.ts`**

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';

interface KeystrokeEvent {
  key: string;
  timestamp: number;
  expected: string;
  correct: boolean;
  timing: number;
}

interface TypingSession {
  keystrokes: KeystrokeEvent[];
  startTime: number | null;
  endTime: number | null;
}

export const useTypingSession = () => {
  const [session, setSession] = useState<TypingSession>({
    keystrokes: [],
    startTime: null,
    endTime: null,
  });

  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = useCallback(() => {
    setSession({
      keystrokes: [],
      startTime: Date.now(),
      endTime: null,
    });
    setWpm(0);
    setAccuracy(0);
    setSessionTime(0);

    // Start timer
    intervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  }, []);

  const endSession = useCallback(() => {
    setSession(prev => ({
      ...prev,
      endTime: Date.now(),
    }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const recordKeystroke = useCallback((keystroke: KeystrokeEvent) => {
    setSession(prev => ({
      ...prev,
      keystrokes: [...prev.keystrokes, keystroke],
    }));
  }, []);

  // Calculate metrics
  useEffect(() => {
    if (session.keystrokes.length === 0) return;

    const correctKeystrokes = session.keystrokes.filter(k => k.correct).length;
    const totalKeystrokes = session.keystrokes.length;

    // Calculate accuracy
    const newAccuracy =
      totalKeystrokes > 0 ? (correctKeystrokes / totalKeystrokes) * 100 : 0;
    setAccuracy(newAccuracy);

    // Calculate WPM (5 characters = 1 word)
    if (session.startTime && sessionTime > 0) {
      const wordsTyped = correctKeystrokes / 5;
      const minutes = sessionTime / 60;
      const newWpm = minutes > 0 ? wordsTyped / minutes : 0;
      setWpm(newWpm);
    }
  }, [session.keystrokes, session.startTime, sessionTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    wpm,
    accuracy,
    sessionTime,
    startSession,
    endSession,
    recordKeystroke,
    session,
  };
};
```

### 1.5 Type Definitions

**File: `shared/types/index.ts`**

```typescript
export interface Exercise {
  id: string;
  title: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusKeys: string[];
  category: 'common_words' | 'sentences' | 'paragraphs';
  estimatedTime: number; // seconds
}

export interface TypingSession {
  id: string;
  exerciseId: string;
  wpm: number;
  accuracy: number;
  sessionTime: number;
  errors: TypingError[];
  completedAt: Date;
}

export interface TypingError {
  position: number;
  expected: string;
  actual: string;
  timestamp: Date;
}

export interface KeystrokeEvent {
  key: string;
  timestamp: number;
  expected: string;
  correct: boolean;
  timing: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  preferences: UserPreferences;
}

export interface UserPreferences {
  audioEnabled: boolean;
  keyboardVisible: boolean;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
}
```

---

## Phase 2: Backend Implementation

### 2.1 Express Server Setup

**File: `backend/src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { exerciseRoutes } from './routes/exercises';
import { sessionRoutes } from './routes/sessions';
import { userRoutes } from './routes/users';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/exercises', exerciseRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

// Socket.io for real-time features
io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('join-competition', competitionId => {
    socket.join(competitionId);
  });

  socket.on('typing-progress', data => {
    socket.to(data.competitionId).emit('competitor-progress', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
```

### 2.2 Exercise Routes

**File: `backend/src/routes/exercises.ts`**

```typescript
import { Router } from 'express';
import { ExerciseService } from '../services/ExerciseService';

const router = Router();
const exerciseService = new ExerciseService();

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await exerciseService.getAllExercises();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Get exercise by ID
router.get('/:id', async (req, res) => {
  try {
    const exercise = await exerciseService.getExerciseById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// Get exercises by difficulty
router.get('/difficulty/:level', async (req, res) => {
  try {
    const exercises = await exerciseService.getExercisesByDifficulty(
      req.params.level
    );
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Create new exercise (admin only)
router.post('/', async (req, res) => {
  try {
    const exercise = await exerciseService.createExercise(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

export { router as exerciseRoutes };
```

### 2.3 Exercise Service

**File: `backend/src/services/ExerciseService.ts`**

```typescript
import { Exercise } from '../../shared/types';
import { DatabaseService } from './DatabaseService';

export class ExerciseService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  async getAllExercises(): Promise<Exercise[]> {
    const query = 'SELECT * FROM exercises ORDER BY difficulty, title';
    const result = await this.db.query(query);
    return result.rows;
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    const query = 'SELECT * FROM exercises WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async getExercisesByDifficulty(difficulty: string): Promise<Exercise[]> {
    const query =
      'SELECT * FROM exercises WHERE difficulty = $1 ORDER BY title';
    const result = await this.db.query(query, [difficulty]);
    return result.rows;
  }

  async createExercise(exerciseData: Omit<Exercise, 'id'>): Promise<Exercise> {
    const query = `
      INSERT INTO exercises (title, text, difficulty, focus_keys, category, estimated_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      exerciseData.title,
      exerciseData.text,
      exerciseData.difficulty,
      JSON.stringify(exerciseData.focusKeys),
      exerciseData.category,
      exerciseData.estimatedTime,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getRandomExercise(difficulty?: string): Promise<Exercise> {
    let query = 'SELECT * FROM exercises';
    let params: string[] = [];

    if (difficulty) {
      query += ' WHERE difficulty = $1';
      params.push(difficulty);
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    const result = await this.db.query(query, params);
    return result.rows[0];
  }
}
```

### 2.4 Database Service

**File: `backend/src/services/DatabaseService.ts`**

```typescript
import { Pool } from 'pg';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    });
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  async close() {
    await this.pool.end();
  }
}
```

---

## Phase 3: Database Schema

### 3.1 PostgreSQL Schema

**File: `backend/database/schema.sql`**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  focus_keys JSONB DEFAULT '[]',
  category VARCHAR(50) NOT NULL,
  estimated_time INTEGER DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Typing sessions table
CREATE TABLE typing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  wpm DECIMAL(5,2) NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  session_time INTEGER NOT NULL,
  errors JSONB DEFAULT '[]',
  keystrokes JSONB DEFAULT '[]',
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  average_wpm DECIMAL(5,2) DEFAULT 0,
  best_wpm DECIMAL(5,2) DEFAULT 0,
  average_accuracy DECIMAL(5,2) DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0,
  weak_keys JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitions table
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  exercise_id UUID REFERENCES exercises(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  max_participants INTEGER DEFAULT 100,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competition participants
CREATE TABLE competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  final_wpm DECIMAL(5,2),
  final_accuracy DECIMAL(5,2),
  rank INTEGER,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(competition_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_typing_sessions_user_id ON typing_sessions(user_id);
CREATE INDEX idx_typing_sessions_exercise_id ON typing_sessions(exercise_id);
CREATE INDEX idx_typing_sessions_completed_at ON typing_sessions(completed_at);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
```

---

## Phase 4: Advanced Features Implementation

### 4.1 Virtual Keyboard Component

**File: `desktop/src/components/VirtualKeyboard.tsx`**

```typescript
import React from 'react';

interface VirtualKeyboardProps {
  targetKey?: string;
  pressedKey?: string;
  showHandGuidance?: boolean;
  visible?: boolean;
}

const KEYBOARD_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

const FINGER_MAPPING: Record<string, string> = {
  'q': 'left_pinky', 'a': 'left_pinky', 'z': 'left_pinky',
  'w': 'left_ring', 's': 'left_ring', 'x': 'left_ring',
  'e': 'left_middle', 'd': 'left_middle', 'c': 'left_middle',
  'r': 'left_index', 'f': 'left_index', 'v': 'left_index',
  't': 'left_index', 'g': 'left_index', 'b': 'left_index',
  'y': 'right_index', 'h': 'right_index', 'n': 'right_index',
  'u': 'right_index', 'j': 'right_index', 'm': 'right_index',
  'i': 'right_middle', 'k': 'right_middle',
  'o': 'right_ring', 'l': 'right_ring',
  'p': 'right_pinky'
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetKey,
  pressedKey,
  showHandGuidance = false,
  visible = true
}) => {
  if (!visible) return null;

  const getKeyClassName = (key: string) => {
    let className = 'key px-3 py-2 m-1 rounded border-2 transition-all duration-150';

    if (pressedKey === key) {
      className += ' bg-blue-500 text-white border-blue-600';
    } else if (targetKey === key) {
      className += ' bg-yellow-200 border-yellow-400';
    } else {
      className += ' bg-gray-100 border-gray-300';
    }

    if (showHandGuidance) {
      const finger = FINGER_MAPPING[key];
      if (finger?.includes('left')) {
        className += ' border-l-4 border-l-blue-500';
      } else if (finger?.includes('right')) {
        className += ' border-r-4 border-r-green-500';
      }
    }

    return className;
  };

  return (
    <div className="virtual-keyboard bg-white p-4 rounded-lg shadow-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Virtual Keyboard</h3>
        {showHandGuidance && (
          <div className="flex justify-center space-x-4 mt-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm">Left Hand</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm">Right Hand</span>
            </div>
          </div>
        )}
      </div>

      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-1">
          {row.map((key) => (
            <div
              key={key}
              className={getKeyClassName(key)}
            >
              {key.toUpperCase()}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

### 4.2 Audio System

**File: `desktop/src/services/AudioService.ts`**

```typescript
class AudioService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  private createTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ) {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      this.volume,
      this.audioContext.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playCorrectSound() {
    this.createTone(800, 0.1, 'sine');
  }

  playErrorSound() {
    this.createTone(200, 0.2, 'sawtooth');
  }

  playCompletionSound() {
    // Play a pleasant chord
    this.createTone(523, 0.3, 'sine'); // C5
    setTimeout(() => this.createTone(659, 0.3, 'sine'), 100); // E5
    setTimeout(() => this.createTone(784, 0.3, 'sine'), 200); // G5
  }

  setVolume(level: number) {
    this.volume = Math.max(0, Math.min(1, level));
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const audioService = new AudioService();
```

---

## Phase 5: Testing Implementation

### 5.1 Component Tests

**File: `desktop/src/components/__tests__/TypingDisplay.test.tsx`**

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TypingDisplay } from '../TypingDisplay';

describe('TypingDisplay', () => {
  const mockProps = {
    text: 'hello world',
    userInput: 'hello',
    currentPosition: 5,
    errors: []
  };

  it('renders the text correctly', () => {
    render(<TypingDisplay {...mockProps} />);
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('highlights completed characters', () => {
    render(<TypingDisplay {...mockProps} />);
    const completedChars = screen.getAllByText(/[helo]/);
    expect(completedChars[0]).toHaveClass('bg-green-200');
  });

  it('highlights current position', () => {
    render(<TypingDisplay {...mockProps} />);
    const currentChar = screen.getByText(' ');
    expect(currentChar).toHaveClass('bg-blue-200');
  });

  it('shows errors in red', () => {
    const propsWithError = {
      ...mockProps,
      userInput: 'helxo',
      currentPosition: 5,
      errors: [{ position: 3, expected: 'l', actual: 'x', timestamp: new Date() }]
    };

    render(<TypingDisplay {...propsWithError} />);
    const errorChar = screen.getByText('x');
    expect(errorChar).toHaveClass('bg-red-200');
  });
});
```

### 5.2 Hook Tests

**File: `desktop/src/hooks/__tests__/useTypingSession.test.ts`**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTypingSession } from '../useTypingSession';

describe('useTypingSession', () => {
  it('initializes with zero values', () => {
    const { result } = renderHook(() => useTypingSession());

    expect(result.current.wpm).toBe(0);
    expect(result.current.accuracy).toBe(0);
    expect(result.current.sessionTime).toBe(0);
  });

  it('calculates WPM correctly', () => {
    const { result } = renderHook(() => useTypingSession());

    act(() => {
      result.current.startSession();
    });

    // Simulate typing 60 characters in 60 seconds (12 WPM)
    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.recordKeystroke({
          key: 'a',
          timestamp: Date.now() + i * 1000,
          expected: 'a',
          correct: true,
          timing: 1000,
        });
      }
    });

    expect(result.current.wpm).toBeCloseTo(12, 1);
  });

  it('calculates accuracy correctly', () => {
    const { result } = renderHook(() => useTypingSession());

    act(() => {
      result.current.startSession();
    });

    // Record 8 correct and 2 incorrect keystrokes
    act(() => {
      for (let i = 0; i < 8; i++) {
        result.current.recordKeystroke({
          key: 'a',
          timestamp: Date.now(),
          expected: 'a',
          correct: true,
          timing: 100,
        });
      }

      for (let i = 0; i < 2; i++) {
        result.current.recordKeystroke({
          key: 'b',
          timestamp: Date.now(),
          expected: 'a',
          correct: false,
          timing: 100,
        });
      }
    });

    expect(result.current.accuracy).toBe(80);
  });
});
```

---

## Phase 6: Deployment Configuration

### 6.1 Web Dashboard Deployment (Vercel)

**File: `web-dashboard/vercel.json`**

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api_url"
  }
}
```

### 6.2 Backend Deployment (Railway)

**File: `backend/railway.json`**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 6.3 Desktop App Distribution

**File: `desktop/package.json` (Electron Builder Configuration)**

```json
{
  "name": "typesy-killer",
  "version": "1.0.0",
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc && electron-builder",
    "dist": "electron-builder --publish=never",
    "dist:win": "electron-builder --win",
    "dist:mac": "electron-builder --mac",
    "dist:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.typesykiller.app",
    "productName": "Typesy Killer",
    "directories": {
      "output": "dist-electron"
    },
    "files": ["dist/**/*", "node_modules/**/*"],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    }
  }
}
```

---

## Implementation Checklist

### Phase 1: Core Foundation ✅

- [ ] Set up Electron + React desktop app structure
- [ ] Create desktop typing interface with native feel
- [ ] Implement input validation with offline storage
- [ ] Add metrics display optimized for desktop
- [ ] Create typing session hook with local persistence
- [ ] Set up offline exercise library

### Phase 2: Enhanced Features

- [ ] Add desktop virtual keyboard with hand guidance
- [ ] Implement native audio feedback system
- [ ] Create local progress tracking with sync capability
- [ ] Add user authentication and cloud sync
- [ ] Set up backend database and API

### Phase 3: Advanced Features

- [ ] Implement AI adaptive learning engine
- [ ] Add web dashboard for progress analytics
- [ ] Create competition mode with real-time features
- [ ] Implement advanced keyboard layouts (Dvorak, Colemak)
- [ ] Add professional typist features

### Phase 4: Polish & Launch

- [ ] Add comprehensive testing for desktop app
- [ ] Optimize performance for native feel
- [ ] Implement error handling and offline capabilities
- [ ] Add accessibility features
- [ ] Prepare desktop app distribution (Windows, Mac, Linux)

This guide provides a complete roadmap for implementing your typing tutor application. Each section includes specific code examples and implementation details that AI agents can follow to build the application systematically.
