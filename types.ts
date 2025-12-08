export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'moving' | 'vanishing' | 'bouncy' | 'finish';
  speed?: number; // for moving platforms
  direction?: number; // 1 or -1
  visible?: boolean;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  coins: number;
  level: number;
  maxHeight: number;
  timeElapsed: number;
}

export interface Character {
  id: string;
  name: string;
  price: number;
  color: string;
  shape: 'square' | 'circle' | 'car' | 'pyramid';
  unlocked: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}