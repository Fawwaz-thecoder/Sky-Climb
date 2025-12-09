
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, Coin, GameState, Character } from '../types';
import { GRAVITY, JUMP_FORCE, MOVE_SPEED, FRICTION, LEVEL_CONFIG } from '../constants';
import { Play, Pause, RefreshCw, ShoppingCart, Info, Lock, ChevronLeft, ChevronRight, Trophy, ChevronsUp } from 'lucide-react';

interface GameEngineProps {
  character: Character;
  isNight: boolean;
  onCoinUpdate: (coins: number) => void;
  totalCoins: number;
}

const LEVEL_HEIGHT = 3000; // Height in pixels to advance a level

const GameEngine: React.FC<GameEngineProps> = ({ character, isNight, onCoinUpdate, totalCoins }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [highScore, setHighScore] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    coins: 0,
    level: 1,
    maxHeight: 0,
    timeElapsed: 0,
  });

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('skyClimbHighScore');
    if (saved) {
        setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Update High Score on Game Over
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > highScore) {
      posthog.capture('new_highscore', { property: gameState.score })
        setHighScore(gameState.score);
        localStorage.setItem('skyClimbHighScore', gameState.score.toString());
    }
  }, [gameState.isGameOver, gameState.score, highScore]);

  // Mutable game state for performance (avoiding React render loop for physics)
  const physicsState = useRef({
    x: 200,
    y: 100,
    vx: 0,
    vy: 0,
    platforms: [] as Platform[],
    coins: [] as Coin[],
    cameraY: 0,
    lastPlatformY: 0,
    keys: { left: false, right: false },
  });

  // Generate initial platform
  const resetGame = useCallback(() => {
    posthog.capture('new_game', { property: 'value' })
    physicsState.current = {
      x: 200,
      y: 600, // Start lower
      vx: 0,
      vy: 0,
      platforms: [
        { id: 0, x: 0, y: 780, width: 400, height: 20, type: 'normal' }, // Ground
        { id: 1, x: 150, y: 680, width: 100, height: 20, type: 'normal' }, // Step 1
        { id: 2, x: 50, y: 600, width: 100, height: 20, type: 'normal' }, // Step 2 (Closer: 80px gap)
        { id: 3, x: 250, y: 520, width: 100, height: 20, type: 'normal' }, // Step 3 (80px gap)
      ],
      coins: [],
      cameraY: 0,
      lastPlatformY: 520,
      keys: { left: false, right: false },
    };
    setGameState({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      score: 0,
      coins: 0,
      level: 1,
      maxHeight: 0,
      timeElapsed: 0,
    });
    setShowLevelUp(false);
  }, []);

  // Level Generation Logic - Continuous
  const generatePlatforms = useCallback(() => {
    const generateUntilY = physicsState.current.cameraY - 1000; // Generate well ahead

    let y = physicsState.current.lastPlatformY;
    
    while (y > generateUntilY) {
      // Calculate level based on altitude (y decreases as we go up)
      // Assuming start is around y=600.
      const height = Math.abs(y - 600); 
      const targetLevel = Math.max(1, Math.min(10, Math.floor(height / LEVEL_HEIGHT) + 1));
      
      const config = LEVEL_CONFIG[targetLevel as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[10];

      y -= config.platformGap;
      const width = config.width + Math.random() * 20;
      const x = Math.random() * (400 - width);
      let type: Platform['type'] = 'normal';

      if (Math.random() < config.movingChance) type = 'moving';
      else if (Math.random() < config.vanishChance) type = 'vanishing';
      
      physicsState.current.platforms.push({
        id: Math.random(),
        x,
        y,
        width,
        height: 15,
        type,
        speed: type === 'moving' ? (Math.random() > 0.5 ? 2 : -2) : 0,
        visible: true,
      });

      // Chance to spawn coin
      if (Math.random() < 0.3) {
        physicsState.current.coins.push({
          id: Math.random(),
          x: x + width / 2 - 10,
          y: y - 30,
          collected: false,
        });
      }
    }
    physicsState.current.lastPlatformY = y;
  }, []);

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const deltaTime = (time - lastTime) / 16.67; // Normalize to ~60fps
      lastTime = time;

      const state = physicsState.current;

      // Input
      if (state.keys.left) state.vx -= 1 * deltaTime;
      if (state.keys.right) state.vx += 1 * deltaTime;

      // Friction & Limits
      state.vx *= FRICTION;
      if (Math.abs(state.vx) < 0.1) state.vx = 0;
      
      // Gravity
      state.vy += GRAVITY * deltaTime;

      // Movement
      state.x += state.vx * deltaTime;
      state.y += state.vy * deltaTime;

      // Screen Wrapping
      if (state.x < -20) state.x = 400;
      if (state.x > 400) state.x = -20;

      // Platforms Logic & Collision
      let onGround = false;
      if (state.vy > 0) { // Only check collision when falling
        for (let p of state.platforms) {
          if (!p.visible && p.type === 'vanishing') continue;
          
          if (
            state.x + 20 > p.x &&
            state.x < p.x + p.width &&
            state.y + 30 >= p.y && // +30 is player height approx
            state.y + 30 <= p.y + 20 // tolerance
          ) {
            state.y = p.y - 30;
            state.vy = JUMP_FORCE; // Auto jump
            onGround = true;

            if (p.type === 'vanishing') {
              p.visible = false;
            }
          }
        }
      }

      // Moving platforms update
      state.platforms.forEach(p => {
        if (p.type === 'moving') {
          p.x += (p.speed || 0) * deltaTime;
          if (p.x <= 0 || p.x + p.width >= 400) {
            p.speed = -(p.speed || 0);
          }
        }
      });

      // Coins Collision
      state.coins.forEach(c => {
        if (!c.collected && 
            state.x < c.x + 20 && 
            state.x + 20 > c.x && 
            state.y < c.y + 20 && 
            state.y + 30 > c.y) {
          c.collected = true;
          onCoinUpdate(1);
        }
      });

      // Camera Follow
      const targetCameraY = state.y - 500;
      if (targetCameraY < state.cameraY) {
        state.cameraY = targetCameraY; // Only go up
      }

      // Cleanup - Only remove platforms that are well below the camera
      // Platforms above the camera (negative Y relative to camera) must be kept!
      state.platforms = state.platforms.filter(p => p.y < state.cameraY + 1000);
      state.coins = state.coins.filter(c => c.y < state.cameraY + 1000);

      // Level Progression
      const height = Math.abs(Math.floor(state.cameraY));
      const currentLevel = Math.min(10, Math.floor(height / LEVEL_HEIGHT) + 1);
      
      // Fall Check (Game Over)
      if (state.y > state.cameraY + 759) {
        setGameState(prev => ({ ...prev, isGameOver: true, isPlaying: false }));
      } else {
        // Sync vital UI state occasionally or use refs to update UI directly for performance
        setGameState(prev => {
            if (prev.level !== currentLevel) {
                setShowLevelUp(true);
                setTimeout(() => setShowLevelUp(false), 2500);
                return {
                    ...prev,
                    maxHeight: height,
                    level: currentLevel,
                    score: height,
                };
            }
            if (Math.floor(height / 100) > Math.floor(prev.maxHeight / 100)) {
                return {
                    ...prev,
                    maxHeight: height,
                    score: height,
                }
            }
            return prev;
        });
      }

      // Generate new terrain
      generatePlatforms();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') physicsState.current.keys.left = true;
      if (e.key === 'ArrowRight') physicsState.current.keys.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') physicsState.current.keys.left = false;
      if (e.key === 'ArrowRight') physicsState.current.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, onCoinUpdate, generatePlatforms]);

  const playerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderLoop = () => {
      if (physicsState.current && playerRef.current && worldRef.current) {
        const { x, y, cameraY } = physicsState.current;
        playerRef.current.style.transform = `translate(${x}px, ${y}px)`;
        // Move the world up to simulate camera
        worldRef.current.style.transform = `translateY(${-cameraY}px)`;
      }
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
  }, []);

  // Calculate progress to next level
  const nextLevelHeight = gameState.level * LEVEL_HEIGHT;
  const progressToNext = Math.min(100, (gameState.maxHeight % LEVEL_HEIGHT) / LEVEL_HEIGHT * 100);

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent touch-none select-none">
      {/* Game World */}
      <div ref={worldRef} className="absolute top-0 left-0 w-full will-change-transform">
        {physicsState.current.platforms.map(p => (
           (p.visible !== false) && <div
            key={p.id}
            className={`absolute rounded-sm ${
              p.type === 'moving' ? 'bg-blue-400' :
              p.type === 'vanishing' ? 'bg-red-400 opacity-80' :
              isNight ? 'bg-neon-green shadow-[0_0_10px_#0aff00]' : 'bg-slate-700'
            }`}
            style={{
              left: p.x,
              top: p.y,
              width: p.width,
              height: p.height,
              transition: p.type === 'moving' ? 'none' : 'opacity 0.2s'
            }}
          />
        ))}
        {physicsState.current.coins.map(c => (
          !c.collected && <div
            key={c.id}
            className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-pulse-fast shadow-lg border border-yellow-200"
            style={{ left: c.x, top: c.y }}
          />
        ))}
        
        {/* Player */}
        <div
          ref={playerRef}
          className={`absolute w-[20px] h-[30px] z-20 transition-colors duration-300
            ${character.shape === 'circle' ? 'rounded-full' : 
              character.shape === 'pyramid' ? 'clip-path-polygon' : 'rounded-sm'}
            ${character.color}
            ${isNight ? 'shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'shadow-md'}
          `}
        >
          {character.shape === 'car' && (
             <div className="absolute -bottom-1 -left-1 w-[28px] h-[10px] bg-black rounded-sm" />
          )}
          {character.shape === 'pyramid' && (
             <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[30px] border-l-transparent border-r-transparent border-b-yellow-400" />
          )}
        </div>
      </div>

      {/* Level Up Notification */}
      {showLevelUp && (
        <div className="absolute top-1/3 inset-x-0 flex flex-col items-center justify-center pointer-events-none z-50 animate-bounce">
            <h1 className="text-4xl font-pixel text-yellow-400 stroke-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                LEVEL {gameState.level}
            </h1>
            <p className="text-white font-bold text-lg bg-black/50 px-4 py-1 rounded-full mt-2 backdrop-blur-sm">
                Next Challenge Started!
            </p>
        </div>
      )}

      {/* Touch Controls Overlay for Mobile */}
      <div className="absolute inset-0 flex z-40 touch-none pointer-events-none">
         {/* Left Control Zone */}
        <div 
          className="w-1/2 h-full relative group transition-colors flex items-end justify-start p-6 pointer-events-auto"
          onTouchStart={(e) => { e.preventDefault(); physicsState.current.keys.left = true; }}
          onTouchEnd={(e) => { e.preventDefault(); physicsState.current.keys.left = false; }}
          onMouseDown={() => physicsState.current.keys.left = true}
          onMouseUp={() => physicsState.current.keys.left = false}
          onMouseLeave={() => physicsState.current.keys.left = false}
        >
           <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30 opacity-60 group-active:opacity-100 group-active:scale-95 transition-all mb-4 shadow-lg">
                <ChevronLeft size={40} className="text-white drop-shadow-md" />
            </div>
        </div>
        
         {/* Right Control Zone */}
        <div 
          className="w-1/2 h-full relative group transition-colors flex items-end justify-end p-6 pointer-events-auto"
          onTouchStart={(e) => { e.preventDefault(); physicsState.current.keys.right = true; }}
          onTouchEnd={(e) => { e.preventDefault(); physicsState.current.keys.right = false; }}
          onMouseDown={() => physicsState.current.keys.right = true}
          onMouseUp={() => physicsState.current.keys.right = false}
          onMouseLeave={() => physicsState.current.keys.right = false}
        >
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30 opacity-60 group-active:opacity-100 group-active:scale-95 transition-all mb-4 shadow-lg">
                <ChevronRight size={40} className="text-white drop-shadow-md" />
            </div>
        </div>
      </div>

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-30">
        <div>
          <h2 className={`font-pixel text-xl ${isNight ? 'text-neon-pink' : 'text-slate-800'}`}>
            Level {gameState.level}
          </h2>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold opacity-80 text-slate-500">
                Height: {Math.floor(gameState.maxHeight)}m
            </p>
            {gameState.level < 10 && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <ChevronsUp size={10} />
                    <span>Next Level: {nextLevelHeight - Math.floor(gameState.maxHeight)}m</span>
                </div>
            )}
          </div>
          {highScore > 0 && (
             <div className="flex items-center gap-1 mt-1 text-xs font-bold text-yellow-500">
                <Trophy size={12} />
                <span>Best: {highScore}m</span>
             </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
            <span className="font-mono font-bold text-white">{totalCoins + gameState.coins}</span>
          </div>
        </div>
      </div>

      {/* Start Screen */}
      {!gameState.isPlaying && !gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40 backdrop-blur-sm pointer-events-auto">
          <button 
            onClick={resetGame}
            className="group relative px-8 py-4 bg-white text-black font-pixel text-xl hover:scale-110 transition-transform duration-200"
          >
            START CLIMB
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-neon-blue -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 z-50 backdrop-blur-md p-8 text-center pointer-events-auto">
          <h2 className="text-4xl font-pixel mb-4 text-white">FALLEN</h2>
          <p className="text-xl mb-2">You reached {Math.floor(gameState.maxHeight)}m (Level {gameState.level})</p>
          {gameState.maxHeight >= highScore && gameState.maxHeight > 0 && (
              <p className="text-yellow-300 font-bold mb-6 animate-pulse">New High Score!</p>
          )}
          {gameState.maxHeight < highScore && (
              <p className="text-slate-300 text-sm mb-8">Best: {highScore}m</p>
          )}
          <div className="flex gap-4">
             <button 
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-white text-red-900 font-bold hover:bg-gray-200 rounded-full"
            >
              <RefreshCw size={20} /> Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
