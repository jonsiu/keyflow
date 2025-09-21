'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import VirtualKeyboard from './VirtualKeyboard';

interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
}

interface TypingState {
  currentText: string;
  userInput: string;
  isTyping: boolean;
  isComplete: boolean;
  startTime: number | null;
  stats: TypingStats;
}

const SAMPLE_TEXT =
  'The quick brown fox jumps over the lazy dog. This is a sample text for typing practice. Focus on accuracy first, then speed will follow naturally.';

// Focus letters for current exercise
const FOCUS_LETTERS = 'ASDF';

export default function TypingInterface() {
  const [state, setState] = useState<TypingState>({
    currentText: SAMPLE_TEXT,
    userInput: '',
    isTyping: false,
    isComplete: false,
    startTime: null,
    stats: {
      wpm: 0,
      accuracy: 100,
      errors: 0,
      timeElapsed: 0,
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate WPM and accuracy
  const calculateStats = useCallback(
    (input: string, text: string, timeElapsed: number) => {
      const wordsTyped = input.trim().split(/\s+/).length;
      const wpm =
        timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;

      let errors = 0;
      for (let i = 0; i < Math.min(input.length, text.length); i++) {
        if (input[i] !== text[i]) {
          errors++;
        }
      }

      const accuracy =
        input.length > 0
          ? Math.max(
              0,
              Math.round(((input.length - errors) / input.length) * 100)
            )
          : 100;

      return { wpm, accuracy, errors, timeElapsed };
    },
    []
  );

  // Handle typing input
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const now = Date.now();

      setState(prev => {
        const isFirstKeystroke = !prev.isTyping && value.length === 1;
        const startTime = isFirstKeystroke ? now : prev.startTime;
        const timeElapsed = startTime ? (now - startTime) / 1000 : 0;

        const stats = calculateStats(value, prev.currentText, timeElapsed);
        const isComplete = value === prev.currentText;

        return {
          ...prev,
          userInput: value,
          isTyping: value.length > 0,
          isComplete,
          startTime,
          stats,
        };
      });
    },
    [calculateStats]
  );

  // Reset function
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      userInput: '',
      isTyping: false,
      isComplete: false,
      startTime: null,
      stats: {
        wpm: 0,
        accuracy: 100,
        errors: 0,
        timeElapsed: 0,
      },
    }));
    inputRef.current?.focus();
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Render character with highlighting
  const renderCharacter = (char: string, index: number) => {
    const isTyped = index < state.userInput.length;
    const isCorrect = isTyped && state.userInput[index] === char;
    const isCurrent = index === state.userInput.length;
    const isError = isTyped && !isCorrect;

    let className = 'transition-all duration-200 ease-in-out relative ';

    if (isCurrent) {
      className +=
        'bg-accent text-accent-foreground rounded-md px-1 py-0.5 shadow-md border-2 border-accent/50 font-semibold';
    } else if (isError) {
      className +=
        'text-destructive bg-destructive/20 rounded-md px-1 py-0.5 border border-destructive/30 font-semibold';
    } else if (isCorrect) {
      className +=
        'text-primary bg-primary/15 rounded-md px-1 py-0.5 font-semibold';
    } else {
      className += 'text-foreground/70';
    }

    return (
      <span key={index} className={className}>
        {char}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Focus Letters Display */}
      <div className="text-center">
        <div className="text-6xl font-bold text-primary mb-2 tracking-widest drop-shadow-sm">
          {FOCUS_LETTERS}
        </div>
        <p className="text-foreground/80 text-lg font-medium">
          Focus on these keys
        </p>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-4 gap-6 p-6 bg-card rounded-xl border border-border shadow-sm">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {state.stats.wpm}
          </div>
          <div className="text-sm text-foreground/80 font-medium">WPM</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {state.stats.accuracy}%
          </div>
          <div className="text-sm text-foreground/80 font-medium">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-destructive mb-1">
            {state.stats.errors}
          </div>
          <div className="text-sm text-foreground/80 font-medium">Errors</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-accent mb-1">
            {Math.round(state.stats.timeElapsed)}s
          </div>
          <div className="text-sm text-foreground/80 font-medium">Time</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-foreground/80">
          <span>Progress</span>
          <span>
            {Math.round(
              (state.userInput.length / state.currentText.length) * 100
            )}
            %
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(state.userInput.length / state.currentText.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Text Display */}
      <div className="p-8 bg-card rounded-xl border border-border shadow-sm min-h-[300px]">
        <div className="text-xl leading-loose font-mono tracking-wide text-foreground">
          {state.currentText
            .split('')
            .map((char, index) => renderCharacter(char, index))}
        </div>
      </div>

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        currentKey={state.currentText[state.userInput.length]}
        focusKeys={FOCUS_LETTERS.split('')}
      />

      {/* Input Field */}
      <div className="space-y-6">
        <input
          ref={inputRef}
          type="text"
          value={state.userInput}
          onChange={handleInput}
          placeholder="Start typing here..."
          className="w-full p-4 text-lg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 bg-background transition-all duration-200"
          disabled={state.isComplete}
        />

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm"
          >
            {state.isComplete ? 'Try Again' : 'Reset'}
          </motion.button>
        </div>
      </div>

      {/* Completion Message */}
      {state.isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm"
        >
          <h3 className="text-2xl font-semibold text-primary mb-3">
            Great job! 🎉
          </h3>
          <p className="text-foreground/80 text-lg">
            You completed the text with{' '}
            <span className="font-semibold text-primary">
              {state.stats.wpm} WPM
            </span>{' '}
            and{' '}
            <span className="font-semibold text-primary">
              {state.stats.accuracy}% accuracy
            </span>
            !
          </p>
        </motion.div>
      )}
    </div>
  );
}
