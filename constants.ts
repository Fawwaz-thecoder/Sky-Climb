

export const GRAVITY = 0.5;
export const JUMP_FORCE = -12;
export const MOVE_SPEED = 5;
export const FRICTION = 0.8;
export const SCREEN_WIDTH = 400; // Virtual width for calculation
export const SCREEN_HEIGHT = 800; // Virtual height

// Level configs - Increasing difficulty
// Level 2 now has higher moving chance to make the transition obvious
export const LEVEL_CONFIG = {
  1: { platformGap: 60, movingChance: 0, vanishChance: 0, width: 120 },
  2: { platformGap: 70, movingChance: 0.2, vanishChance: 0, width: 110 },
  3: { platformGap: 80, movingChance: 0.25, vanishChance: 0.05, width: 100 },
  4: { platformGap: 90, movingChance: 0.3, vanishChance: 0.05, width: 95 },
  5: { platformGap: 100, movingChance: 0.35, vanishChance: 0.1, width: 90 },
  6: { platformGap: 110, movingChance: 0.4, vanishChance: 0.1, width: 85 },
  7: { platformGap: 115, movingChance: 0.45, vanishChance: 0.15, width: 80 },
  8: { platformGap: 120, movingChance: 0.5, vanishChance: 0.2, width: 75 },
  9: { platformGap: 125, movingChance: 0.55, vanishChance: 0.25, width: 70 },
  10: { platformGap: 135, movingChance: 0.6, vanishChance: 0.3, width: 60 },
};

export const INITIAL_CHARACTERS = [
  { id: 'cube', name: 'Basic Block', price: 0, color: 'bg-blue-500', shape: 'square', unlocked: true },
  { id: 'sphere', name: 'Moon Orb', price: 50, color: 'bg-purple-500', shape: 'circle', unlocked: false },
  { id: 'rally', name: 'Rally Car', price: 150, color: 'bg-red-500', shape: 'car', unlocked: false },
  { id: 'prism', name: 'Golden Prism', price: 500, color: 'bg-yellow-400', shape: 'pyramid', unlocked: false },
] as const;