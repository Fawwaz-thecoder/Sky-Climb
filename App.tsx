
import React, { useState, useEffect } from 'react';
import GameEngine from './components/GameEngine';
import Shop from './components/Shop';
import ImprovementModal from './components/ImprovementModal';
import DonateModal from './components/DonateModal';
import { INITIAL_CHARACTERS } from './constants';
import { Character } from './types';
import { Moon, Sun, ShoppingCart, Info, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [isNight, setIsNight] = useState(false);
  const [coins, setCoins] = useState(0);
  const [characters, setCharacters] = useState<Character[]>([...INITIAL_CHARACTERS]);
  const [selectedCharId, setSelectedCharId] = useState('cube');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  // Toggle Day/Night based on real time or user choice. Default to user choice toggle.
  // We can add a simple cycle effect later, but a toggle is better for UX in a web app.

  const handleBuy = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (char && coins >= char.price) {
      setCoins(prev => prev - char.price);
      setCharacters(prev => prev.map(c => c.id === id ? { ...c, unlocked: true } : c));
      setSelectedCharId(id);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedCharId(id);
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000 
      ${isNight ? 'bg-slate-900' : 'bg-sky-200'}`}>
      
      {/* Background Elements */}
      <div className={`absolute top-10 right-10 w-24 h-24 rounded-full blur-xl transition-all duration-1000 
        ${isNight ? 'bg-slate-100 opacity-20' : 'bg-yellow-400 opacity-80'}`} />
      
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 
        ${isNight ? 'opacity-40' : 'opacity-0'}`} 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* Main Game Container */}
      <div className="relative w-full max-w-[400px] h-full shadow-2xl overflow-hidden border-x-4 border-slate-800/20 bg-opacity-10 backdrop-blur-sm">
        <GameEngine 
          character={characters.find(c => c.id === selectedCharId)!} 
          isNight={isNight}
          totalCoins={coins}
          onCoinUpdate={(amount) => setCoins(prev => prev + amount)}
        />
        
        {/* Global UI Controls - Moved down to prevent overlap with coins */}
        <div className="absolute top-20 right-4 z-40 flex flex-col gap-2">
            <button 
                onClick={() => setIsNight(!isNight)}
                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
            >
                {isNight ? <Moon size={20} /> : <Sun size={20} className="text-yellow-300" />}
            </button>
            <button 
                onClick={() => setIsShopOpen(true)}
                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
            >
                <ShoppingCart size={20} />
            </button>
            <button 
                onClick={() => setIsInfoOpen(true)}
                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
            >
                <Info size={20} />
            </button>
             <button 
                onClick={() => setIsDonateOpen(true)}
                className="p-2 bg-pink-500/80 hover:bg-pink-600 text-white rounded-full backdrop-blur-md transition-colors shadow-lg animate-pulse"
                title="Donate"
            >
                <Heart size={20} fill="currentColor" />
            </button>
        </div>
      </div>

      <Shop 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)}
        coins={coins}
        characters={characters}
        onBuy={handleBuy}
        onSelect={handleSelect}
        selectedId={selectedCharId}
      />

      <ImprovementModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
    </div>
  );
};

export default App;
