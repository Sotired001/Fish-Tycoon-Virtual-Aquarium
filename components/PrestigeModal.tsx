import React from 'react';
import { useGameStore } from '../services/store';

interface PrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrestigeModal: React.FC<PrestigeModalProps> = ({ isOpen, onClose }) => {
  const { stats, prestige, gems, prestigeReset } = useGameStore();

  if (!isOpen) return null;

  // Calculate Potential Prestige
  // Formula: 1 point for every 10,000 lifetime coins earned this run?
  // Or just log scale: Math.floor(Math.pow(stats.totalCoinsEarned / 10000, 0.5))
  // Let's make it: Base + (TotalCoins / 5000) ^ 0.8
  // Current simplistic logic in store was: Math.floor(stats.totalCoinsEarned / 10000)
  
  // Proposed New Logic:
  // Prestige Currency (Pearls) = Math.floor(Math.sqrt(stats.totalCoinsEarned / 100))
  // Prestige Level = current + 1 (Classic +1 system or currency based?)
  // Let's stick to "Level Up" system for now to match store, but visualize it better.
  
  // Bonus Gems logic from store: Math.floor(stats.totalCoinsEarned / 10000)
  const potentialGems = Math.floor(stats.totalCoinsEarned / 10000);
  
  // Next multiplier
  const currentMult = (1 + (prestige * 0.1)).toFixed(1);
  const nextMult = (1 + ((prestige + 1) * 0.1)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300 pointer-events-auto">
      <div className="bg-gradient-to-b from-slate-900 to-purple-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col overflow-hidden pointer-events-auto">
        
        {/* Header */}
        <div className="p-8 text-center border-b border-purple-500/20 bg-black/20">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            ASCENSION
          </h2>
          <p className="text-purple-200/60 text-sm uppercase tracking-widest">Reset Reality • Gain Power</p>
        </div>

        <div className="p-8 flex flex-col gap-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
              <p className="text-slate-400 text-xs uppercase mb-1">Current Multiplier</p>
              <p className="text-2xl font-bold text-white">x{currentMult}</p>
            </div>
            <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-500/50 text-center">
              <p className="text-purple-300 text-xs uppercase mb-1">Next Multiplier</p>
              <p className="text-2xl font-bold text-purple-100">x{nextMult} <span className="text-sm text-green-400">(+10%)</span></p>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-black/40 rounded-xl p-6 border border-white/5">
            <h3 className="text-center text-white font-bold mb-4">Rewards for Resetting</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-4xl mb-2">💎</div>
                <div className="text-2xl font-bold text-cyan-400">+{potentialGems}</div>
                <div className="text-xs text-slate-400">Gems</div>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-4">
              Based on total earnings: ${stats.totalCoinsEarned.toLocaleString()}
            </p>
          </div>

          {/* Warning */}
          <div className="text-center text-sm text-red-400/80 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            ⚠️ Warning: This will reset your money, fish, and tank upgrades. <br/>
            You keep your Gems, Achievements, and Skills.
          </div>

          {/* Actions */}
          <div className="flex gap-4">
             <button 
               onClick={onClose}
               className="flex-1 py-4 rounded-xl font-bold text-slate-300 hover:bg-white/10 transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={() => { prestigeReset(); onClose(); }}
               disabled={potentialGems <= 0}
               className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105
                 ${potentialGems > 0 
                   ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/30' 
                   : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                 }`}
             >
               ASCEND
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrestigeModal;