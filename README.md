# Typesy Killer

A cross-platform desktop typing tutor designed to improve typing speed from 40-60 WPM to 120+ WPM using professional techniques.

## Features

- **Real-time Typing Interface**: Clean, distraction-free typing practice
- **Live Statistics**: WPM, accuracy, errors, and time tracking
- **Visual Feedback**: Character-by-character highlighting for correct/incorrect keystrokes
- **Cross-Platform**: Native desktop apps for Mac, Windows, and Linux
- **Offline Capable**: Works without internet connection
- **Professional Techniques**: Based on methods used by world-class typists

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Desktop**: Electron
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Audio**: Howler.js (coming in Phase 2)
- **Data**: Convex (coming in Phase 2)
- **Auth**: Clerk (coming in Phase 2)

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd typesy-killer
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

4. For Electron development:

```bash
npm run electron-dev
```

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js app for production
- `npm run start` - Start production Next.js server
- `npm run lint` - Run ESLint
- `npm run electron` - Run Electron app (requires built app)
- `npm run electron-dev` - Run Electron with development server
- `npm run build-electron` - Build and package Electron app

## Building for Production

### Web Version

```bash
npm run build
npm run start
```

### Desktop Apps

#### All Platforms

```bash
npm run build-electron
```

#### Platform-Specific

```bash
# macOS
npm run build-electron -- --mac

# Windows
npm run build-electron -- --win

# Linux
npm run build-electron -- --linux
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   └── TypingInterface.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

## Development Roadmap

### Phase 1: Core Typing Interface ✅

- [x] Basic typing interface with real-time feedback
- [x] WPM and accuracy calculation
- [x] Timer functionality
- [x] Visual character highlighting
- [x] Cross-platform Electron setup

### Phase 2: Practice Exercises (Next)

- [ ] Curated exercise library
- [ ] Progressive difficulty
- [ ] Weak spot identification
- [ ] Session history and progress tracking

### Phase 3: Advanced Features

- [ ] Virtual keyboard with finger guidance
- [ ] Audio feedback
- [ ] Detailed analytics
- [ ] Custom exercise creation

### Phase 4: Polish & Optimization

- [ ] Performance optimization
- [ ] Keyboard shortcuts
- [ ] Settings and customization
- [ ] Data export/import

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
