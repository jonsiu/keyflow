'use client';

import { motion } from 'framer-motion';

interface VirtualKeyboardProps {
  currentKey?: string;
  pressedKeys?: Set<string>;
  focusKeys?: string[];
}

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const HAND_POSITIONS = {
  left: ['A', 'S', 'D', 'F'],
  right: ['J', 'K', 'L', ';'],
};

export default function VirtualKeyboard({
  currentKey,
  pressedKeys = new Set(),
  focusKeys = [],
}: VirtualKeyboardProps) {
  const getKeyColor = (key: string) => {
    if (pressedKeys.has(key)) return 'bg-primary text-primary-foreground';
    if (currentKey === key) return 'bg-accent text-accent-foreground';
    if (focusKeys.includes(key))
      return 'bg-primary/20 text-primary border-2 border-primary/30';
    if (HAND_POSITIONS.left.includes(key))
      return 'bg-secondary text-secondary-foreground border border-border';
    if (HAND_POSITIONS.right.includes(key))
      return 'bg-muted text-muted-foreground border border-border';
    return 'bg-muted text-muted-foreground border border-border';
  };

  const getKeySize = (key: string) => {
    if (key === ' ') return 'w-32'; // Spacebar
    return 'w-12 h-12';
  };

  return (
    <div className="relative">
      {/* Keyboard */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        {/* Top row */}
        <div className="flex justify-center gap-1 mb-2">
          {KEYBOARD_LAYOUT[0].map(key => (
            <motion.div
              key={key}
              className={`${getKeySize(key)} h-12 flex items-center justify-center rounded-lg font-medium text-sm transition-all duration-150 ${getKeyColor(key)}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {key}
            </motion.div>
          ))}
        </div>

        {/* Middle row */}
        <div className="flex justify-center gap-1 mb-2">
          {KEYBOARD_LAYOUT[1].map(key => (
            <motion.div
              key={key}
              className={`${getKeySize(key)} h-12 flex items-center justify-center rounded-lg font-medium text-sm transition-all duration-150 ${getKeyColor(key)}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {key}
            </motion.div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex justify-center gap-1 mb-4">
          {KEYBOARD_LAYOUT[2].map(key => (
            <motion.div
              key={key}
              className={`${getKeySize(key)} h-12 flex items-center justify-center rounded-lg font-medium text-sm transition-all duration-150 ${getKeyColor(key)}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {key}
            </motion.div>
          ))}
        </div>

        {/* Spacebar */}
        <div className="flex justify-center">
          <motion.div
            className={`w-32 h-12 flex items-center justify-center rounded-lg font-medium text-sm transition-all duration-150 ${getKeyColor(' ')}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Space
          </motion.div>
        </div>
      </div>
    </div>
  );
}
