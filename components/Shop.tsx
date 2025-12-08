import React from 'react';
import { Character } from '../types';
import { X, Lock, Check } from 'lucide-react';

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  coins: number;
  onBuy: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string;
}

const Shop: React.FC<ShopProps> = ({ isOpen, onClose, characters, coins, onBuy, onSelect, selectedId }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-800 w-full max-w-lg rounded-2xl border border-slate-600 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-neon-pink">SKIN SHOP</span>
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-black/50 px-3 py-1 rounded-full border border-yellow-500/30">
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <span className="text-yellow-400 font-mono">{coins}</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-2 gap-4">
          {characters.map(char => (
            <div 
              key={char.id}
              onClick={() => {
                if (char.unlocked) onSelect(char.id);
                else if (coins >= char.price) onBuy(char.id);
              }}
              className={`relative group p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3
                ${char.id === selectedId 
                  ? 'border-neon-green bg-neon-green/10' 
                  : char.unlocked 
                    ? 'border-slate-600 hover:border-slate-400 bg-slate-700' 
                    : 'border-slate-700 bg-slate-800 opacity-70'}
              `}
            >
              {/* Character Preview */}
              <div className={`w-12 h-12 ${char.color} shadow-lg
                ${char.shape === 'circle' ? 'rounded-full' : 
                  char.shape === 'pyramid' ? 'clip-path-polygon' : 'rounded-sm'}
              `}>
                {char.shape === 'pyramid' && (
                     <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[30px] border-l-transparent border-r-transparent border-b-yellow-400 mx-auto" />
                )}
              </div>

              <div className="text-center">
                <div className="font-bold text-sm">{char.name}</div>
                {!char.unlocked && (
                  <div className="text-xs text-yellow-400 font-mono mt-1">{char.price} Coins</div>
                )}
              </div>

              {/* Status Icons */}
              <div className="absolute top-2 right-2">
                {char.id === selectedId && <Check size={16} className="text-neon-green" />}
                {!char.unlocked && <Lock size={16} className="text-slate-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;