import React from 'react';
import { useGameStore } from '../services/store';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { stats, money, gems, prestige, fish, decorations, upgrades, skills } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-blue-500/30 flex flex-col overflow-hidden pointer-events-auto max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900/50 to-slate-900 border-b border-blue-500/20 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              <span>📊</span> Game Statistics
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Your Progress At A Glance</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Economic Stats */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h3 className="text-blue-300 font-bold text-lg mb-3">Economy</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              <p>Current Money:</p><p className="font-mono text-right text-amber-400">${money.toLocaleString()}</p>
              <p>Total Coins Earned:</p><p className="font-mono text-right text-amber-400">${stats.totalCoinsEarned.toLocaleString()}</p>
              <p>Gems:</p><p className="font-mono text-right text-cyan-400">💎 {gems}</p>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h3 className="text-blue-300 font-bold text-lg mb-3">Activity</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              <p>Fish Fed Count:</p><p className="font-mono text-right">{stats.fishFedCount.toLocaleString()}</p>
              <p>Total Clicks:</p><p className="font-mono text-right">{stats.clicks.toLocaleString()}</p>
              <p>Fish in Tank:</p><p className="font-mono text-right">{fish.length}</p>
              <p>Decorations Placed:</p><p className="font-mono text-right">{decorations.length}</p>
            </div>
          </div>

          {/* Progression Stats */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h3 className="text-blue-300 font-bold text-lg mb-3">Progression</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              <p>Prestige Level:</p><p className="font-mono text-right text-fuchsia-400">{prestige}</p>
              <p>Upgrades Unlocked:</p><p className="font-mono text-right">{Object.keys(upgrades).filter(key => upgrades[key] > 0).length}</p>
              <p>Skills Acquired:</p><p className="font-mono text-right">{Object.keys(skills).filter(key => skills[key] > 0).length}</p>
            </div>
          </div>

        </div>
        
        <div className="p-4 bg-slate-950 text-center text-xs text-slate-500">
          Tracking your tycoon journey since {new Date(useGameStore.getState().startTime).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;